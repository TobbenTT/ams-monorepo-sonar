"""Agentic AutoScheduler service — one-click weekly program generation.

Orchestrates existing scheduling_service functions into a single agentic call:
  1. Create weekly program (backlog → group → level → conflicts)
  2. Check material availability
  3. Compute HH balance by specialty
  4. Generate Gantt data
  5. AI conflict resolution if any specialty > 120% utilization
"""

import json
import logging
import os
import re

from sqlalchemy.orm import Session

from api.services import scheduling_service

log = logging.getLogger(__name__)


def run_auto_schedule(
    db: Session,
    plant_id: str,
    week_number: int,
    year: int,
    include_preventive: bool = True,
    respect_shutdowns: bool = True,
) -> dict:
    """Generate a fully-resolved weekly program with one call.

    Returns dict with: program_id, program, gantt, conflicts, material_status,
    hh_balance, ai_recommendations.
    """

    # Step 1 — Create the weekly program
    program = scheduling_service.create_program(db, plant_id, week_number, year)
    program_id = program.get("program_id") if program else None

    if not program_id:
        return {
            "program_id": None,
            "program": program or {},
            "gantt": [],
            "conflicts": [],
            "conflicts_count": 0,
            "material_status": {},
            "hh_balance": {},
            "ai_recommendations": None,
            "summary": "No schedulable backlog items found for this period.",
        }

    # Step 2 — Check materials
    material_status = scheduling_service.check_materials(db, program_id) or {}

    # Step 3 — HH balance
    hh_balance = scheduling_service.hh_balance(db, program_id) or {}

    # Step 4 — Gantt
    gantt = scheduling_service.get_gantt(db, program_id) or []

    # Step 5 — Extract conflicts and run AI resolution if critical
    conflicts = program.get("conflicts", [])
    # Also try getting conflicts from the raw model (program dict may only have count)
    model = scheduling_service.get_program(db, program_id)
    if model and getattr(model, "conflicts", None):
        conflicts = model.conflicts

    ai_recommendations = None
    by_specialty = hh_balance.get("by_specialty", [])
    critical_overloads = [
        s for s in by_specialty
        if s.get("utilization_pct", 0) > 120
    ]

    if critical_overloads:
        ai_recommendations = _resolve_conflicts_with_ai(
            conflicts, critical_overloads, program, hh_balance,
        )

    return {
        "program_id": program_id,
        "program": program,
        "gantt": gantt,
        "conflicts": conflicts,
        "conflicts_count": len(conflicts) if isinstance(conflicts, list) else 0,
        "material_status": material_status,
        "hh_balance": hh_balance,
        "ai_recommendations": ai_recommendations,
    }


# ---------------------------------------------------------------------------
# AI conflict resolution
# ---------------------------------------------------------------------------

def _resolve_conflicts_with_ai(
    conflicts: list,
    critical_overloads: list[dict],
    program: dict,
    hh_balance: dict,
) -> list[dict]:
    """Call Claude to suggest redistribution when specialties are over-allocated."""
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        log.info("ANTHROPIC_API_KEY not set — using fallback recommendations")
        return _fallback_recommendations(critical_overloads)

    try:
        import anthropic

        client = anthropic.Anthropic(api_key=api_key)

        overload_summary = "\n".join(
            f"- {s['specialty']}: {s.get('utilization_pct', 0):.0f}% "
            f"({s.get('assigned', 0):.1f}h asignadas / {s.get('capacity', 0):.1f}h capacidad)"
            for s in critical_overloads
        )
        wp_count = program.get("work_packages_count", 0)
        total_hours = program.get("total_hours", 0)

        prompt = f"""Eres un programador experto de mantenimiento industrial (SAP PM).

El programa semanal generado tiene sobre-asignacion critica de recursos:

ESPECIALIDADES SOBRECARGADAS (>120% utilizacion):
{overload_summary}

RESUMEN DEL PROGRAMA:
- Paquetes de trabajo: {wp_count}
- Horas totales: {total_hours}
- Balance HH general: {hh_balance.get('utilization_pct', 0):.0f}% utilizacion

CONFLICTOS DETECTADOS:
{json.dumps(conflicts[:10], ensure_ascii=False, default=str) if conflicts else "Ninguno especifico"}

Sugiere redistribucion para resolver la sobre-asignacion. Responde SOLO con un JSON array:
[
  {{
    "type": "DEFER|REASSIGN|SPLIT_SHIFT|ADD_RESOURCE|REDUCE_SCOPE",
    "specialty": "especialidad afectada",
    "description": "accion concreta a tomar (max 120 chars)",
    "impact": "efecto esperado en la utilizacion (max 80 chars)"
  }}
]

Maximo 5 recomendaciones, priorizadas por impacto."""

        response = client.messages.create(
            model="claude-sonnet-4-6-20250514",
            max_tokens=1500,
            messages=[{"role": "user", "content": prompt}],
        )
        text = response.content[0].text.strip()

        # Parse JSON array from response
        start = text.find("[")
        end = text.rfind("]") + 1
        if start >= 0 and end > start:
            return json.loads(text[start:end])

        # Try finding a single object
        start = text.find("{")
        end = text.rfind("}") + 1
        if start >= 0 and end > start:
            obj = json.loads(text[start:end])
            return [obj]

        log.warning("Claude response did not contain parseable JSON — using fallback")
        return _fallback_recommendations(critical_overloads)

    except Exception as exc:
        log.warning("AI conflict resolution failed: %s — using fallback", exc)
        return _fallback_recommendations(critical_overloads)


def _fallback_recommendations(critical_overloads: list[dict]) -> list[dict]:
    """Simple rule-based recommendations when Claude is unavailable."""
    recs = []
    for spec in critical_overloads:
        specialty = spec.get("specialty", "UNKNOWN")
        util_pct = spec.get("utilization_pct", 0)
        assigned = spec.get("assigned", 0)
        capacity = spec.get("capacity", 0)
        recs.append({
            "type": "REDUCE_SCOPE",
            "specialty": specialty,
            "description": (
                f"Diferir paquetes de trabajo de menor prioridad para {specialty} "
                f"hasta reducir utilizacion por debajo de 100%."
            ),
            "impact": f"Reducir de {util_pct:.0f}% a <100% ({assigned:.1f}h → {capacity:.1f}h max)",
        })
    return recs
