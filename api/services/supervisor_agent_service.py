"""Supervisor Agent — Jorge bullets r64 #1 + #2.

#1: HH real al inicio de jornada (ausentismo) → analizar si programa diario
    se puede ejecutar + sugerir acciones (reprogramar/adelantar/priorizar).
#2: Cumplimiento metas producción (ton, m perforados) + disponibilidad equipos
    → impacto de cumplir programa vs metas producción + sugerencias.
"""
from __future__ import annotations

import os
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from api.database.models import ManagedWorkOrderModel as MWO

SHIFT_HOURS = 12.0


def _claude_suggest(prompt: str, max_tokens: int = 700) -> str:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        return ""
    try:
        import anthropic
        c = anthropic.Anthropic(api_key=api_key)
        m = c.messages.create(
            model=os.getenv("CLAUDE_MODEL", "claude-sonnet-4-6"),
            max_tokens=max_tokens,
            messages=[{"role": "user", "content": prompt}],
        )
        return m.content[0].text if m.content else ""
    except Exception as e:
        return f"[claude_error: {e}]"


def shift_start_readiness(
    db: Session,
    plant_id: str,
    shift_date: datetime,
    shift: str,                            # "day" | "night"
    absent_worker_ids: list[str],
    equipment_unavailable: list[str],
    use_claude: bool = True,
) -> dict:
    """Bullet r64 #1 — análisis HH real al inicio de jornada + sugerencias."""
    if shift == "day":
        s = shift_date.replace(hour=6, minute=0, second=0, microsecond=0)
        e = shift_date.replace(hour=18, minute=0, second=0, microsecond=0)
    else:
        s = shift_date.replace(hour=18, minute=0, second=0, microsecond=0)
        e = s + timedelta(hours=12)

    rows = (
        db.query(MWO)
        .filter(MWO.plant_id == plant_id)
        .filter(MWO.planned_start.isnot(None), MWO.planned_end.isnot(None))
        .filter(MWO.planned_end > s, MWO.planned_start < e)
        .filter(MWO.status.in_(["PROGRAMADO", "PLANIFICADO", "EN_EJECUCION"]))
        .all()
    )

    absent_set = set(absent_worker_ids or [])
    eq_unavail = set(equipment_unavailable or [])

    planned_hh = 0.0
    at_risk = []
    ok = []
    blocked_equipment = []
    workers_assigned: dict[str, dict] = {}

    for wo in rows:
        hours = wo.estimated_hours or 0.0
        planned_hh += hours
        wo_workers = wo.assigned_workers or []
        absent_in_wo = [w for w in wo_workers if w.get("worker_id") in absent_set]
        eq_blocked = wo.equipment_tag in eq_unavail
        info = {
            "wo_number": wo.wo_number,
            "equipment_tag": wo.equipment_tag,
            "priority": wo.priority_code,
            "planned_start": wo.planned_start.isoformat(),
            "estimated_hours": hours,
            "assigned_workers": wo_workers,
            "absent_workers_in_wo": absent_in_wo,
            "equipment_blocked": eq_blocked,
        }
        if eq_blocked:
            blocked_equipment.append(info)
        elif absent_in_wo:
            at_risk.append(info)
        else:
            ok.append(info)
        for w in wo_workers:
            wid = w.get("worker_id", "")
            if wid:
                workers_assigned.setdefault(wid, {"name": w.get("name", wid), "ots": []})
                workers_assigned[wid]["ots"].append(wo.wo_number)

    # available HH = total assigned - absent (assume each worker contributes SHIFT_HOURS)
    total_workers = len(workers_assigned)
    absent_count = sum(1 for wid in workers_assigned if wid in absent_set)
    available_workers = total_workers - absent_count
    available_hh = available_workers * SHIFT_HOURS

    gap_hh = max(0.0, planned_hh - available_hh)
    coverage_pct = round((available_hh / planned_hh * 100) if planned_hh else 100.0, 1)

    rec = ""
    if use_claude and (gap_hh > 0 or at_risk or blocked_equipment):
        crit_p1p2 = [w for w in (at_risk + ok) if w["priority"] in ("P1", "P2")]
        prompt = f"""Eres supervisor de mantenimiento al inicio de turno {shift} {shift_date.date()}.

CAPACIDAD:
- HH planificadas: {planned_hh:.1f}
- HH disponibles tras ausentismo: {available_hh:.1f}
- GAP: {gap_hh:.1f} HH (cobertura {coverage_pct}%)
- Trabajadores: {total_workers} asignados, {absent_count} ausentes

OTs PROGRAMADAS HOY: {len(rows)} (críticas P1/P2: {len(crit_p1p2)})

OTs EN RIESGO (por ausentismo): {[w["wo_number"] for w in at_risk]}
EQUIPOS NO DISPONIBLES: {list(eq_unavail)}
OTs BLOQUEADAS POR EQUIPO: {[w["wo_number"] for w in blocked_equipment]}

Genera respuesta en JSON con:
- can_execute_full_program: bool
- summary: 1-2 frases del estado
- actions: lista 3-5 acciones priorizadas (reprogramar/adelantar/retrasar/priorizar) con OT específica
- risk_level: "low"|"medium"|"high"|"critical"

Solo JSON, sin texto extra."""
        rec = _claude_suggest(prompt, max_tokens=600)

    return {
        "plant_id": plant_id,
        "shift_date": shift_date.date().isoformat(),
        "shift": shift,
        "capacity": {
            "planned_hh": round(planned_hh, 1),
            "available_hh": round(available_hh, 1),
            "gap_hh": round(gap_hh, 1),
            "coverage_pct": coverage_pct,
            "total_workers": total_workers,
            "absent_count": absent_count,
        },
        "ots_total": len(rows),
        "ots_ok": ok,
        "ots_at_risk": at_risk,
        "ots_equipment_blocked": blocked_equipment,
        "ai_recommendation": rec,
    }


def production_vs_program(
    db: Session,
    plant_id: str,
    shift_date: datetime,
    production_goal: float,            # e.g. 12000 ton/day
    production_actual: float,
    production_unit: str,              # "ton" | "m"
    equipment_availability_goal: float,  # %
    equipment_availability_actual: float,
    use_claude: bool = True,
) -> dict:
    """Bullet r64 #2 — cumplimiento metas producción/disponibilidad → impacto programa."""
    s = shift_date.replace(hour=0, minute=0, second=0, microsecond=0)
    e = s + timedelta(days=1)
    rows = (
        db.query(MWO)
        .filter(MWO.plant_id == plant_id)
        .filter(MWO.planned_start.isnot(None))
        .filter(MWO.planned_start >= s, MWO.planned_start < e)
        .filter(MWO.status.in_(["PROGRAMADO", "PLANIFICADO", "EN_EJECUCION"]))
        .all()
    )

    prod_pct = round((production_actual / production_goal * 100) if production_goal else 0.0, 1)
    prod_gap = production_actual - production_goal
    avail_gap = equipment_availability_actual - equipment_availability_goal

    program_critical_count = sum(1 for r in rows if r.priority_code in ("P1", "P2"))
    program_total_hh = sum((r.estimated_hours or 0) for r in rows)

    rec = ""
    if use_claude:
        prompt = f"""Eres supervisor de mantenimiento. Analiza el impacto del programa diario sobre las metas de producción.

PRODUCCIÓN ({production_unit}):
- Meta: {production_goal}
- Real: {production_actual} ({prod_pct}% cumplimiento)
- GAP: {prod_gap:+.0f} {production_unit}

DISPONIBILIDAD DE EQUIPOS:
- Meta: {equipment_availability_goal}%
- Real: {equipment_availability_actual}%
- GAP: {avail_gap:+.1f} pp

PROGRAMA DE MANTENIMIENTO HOY:
- {len(rows)} OTs programadas ({program_critical_count} críticas P1/P2)
- {program_total_hh:.0f} HH totales

Genera JSON con:
- impact_assessment: 1-2 frases sobre si el programa de mtto ayuda o perjudica las metas
- alignment: "aligned"|"misaligned"|"trade_off"
- actions: lista 3-5 acciones (reprogramar OTs no críticas, priorizar las que liberan equipos productivos, adelantar PMs si hay holgura)
- decision_required: bool

Solo JSON."""
        rec = _claude_suggest(prompt, max_tokens=600)

    return {
        "plant_id": plant_id,
        "shift_date": shift_date.date().isoformat(),
        "production": {
            "goal": production_goal,
            "actual": production_actual,
            "unit": production_unit,
            "pct": prod_pct,
            "gap": round(prod_gap, 1),
        },
        "availability": {
            "goal_pct": equipment_availability_goal,
            "actual_pct": equipment_availability_actual,
            "gap_pp": round(avail_gap, 1),
        },
        "program_today": {
            "ots_total": len(rows),
            "ots_critical": program_critical_count,
            "total_hh": round(program_total_hh, 1),
        },
        "ai_recommendation": rec,
    }
