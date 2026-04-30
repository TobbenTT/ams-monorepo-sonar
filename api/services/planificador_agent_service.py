"""Planificador Agent — Excel Jorge r30, análisis pre-liberación de OT.

Combina varios bullets del Planificador en un solo análisis go/no-go:
- #2: ¿OT tiene presupuesto asignado?
- #6: ¿Materiales disponibles en bodega cubren la necesidad?
- #7: Nivel de riesgo de la OT
- #4: Grupo planificación + puesto trabajo + centro costo
"""
from __future__ import annotations

import os
from sqlalchemy.orm import Session

from api.database.models import ManagedWorkOrderModel as MWO


def _claude(prompt: str, max_tokens: int = 800) -> str:
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


def analyze_pre_release(db: Session, wo_id: str, use_claude: bool = True) -> dict:
    wo = db.query(MWO).filter(MWO.wo_id == wo_id).first()
    if not wo:
        wo = db.query(MWO).filter(MWO.wo_number == wo_id).first()
    if not wo:
        return {"error": f"OT {wo_id} no encontrada"}

    materials = wo.materials or []
    operations = wo.operations or []
    support = wo.support_equipment or []

    # Bullet #6 — material check
    materials_check = []
    materials_blocking = 0
    for m in materials:
        req = m.get("qty_required") or m.get("quantity") or 0
        avail = m.get("qty_available") or m.get("stock") or 0
        ok = avail >= req
        if not ok and req > 0:
            materials_blocking += 1
        materials_check.append({
            "code": m.get("code") or m.get("material_code") or "?",
            "description": m.get("description") or m.get("name") or "?",
            "required": req,
            "available": avail,
            "ok": ok,
        })

    # Bullet #2 — presupuesto (proxy: estimated cost vs flag)
    estimated_cost = (wo.estimated_hours or 0) * 35.0 * 1.3
    budget_flag = "needs_approval" if estimated_cost > 5000 else "within_budget"

    # Bullet #7 — risk level
    risk_map = {"P1": "critical", "P2": "high", "P3": "medium", "P4": "low"}
    risk = risk_map.get(wo.priority_code, "medium")

    # Bullet #4 — sap pm fields
    sap_pm = {
        "technical_location": wo.technical_location,
        "planning_group": wo.planning_group,
        "equipment_tag": wo.equipment_tag,
        "plant_id": wo.plant_id,
    }

    # Bullet #5 — clase de gasto (proxy)
    cost_classes = []
    if materials: cost_classes.append("materiales")
    if support:   cost_classes.append("herramientas/equipos")
    if operations: cost_classes.append("mano de obra")
    if wo.contractor_crew_id: cost_classes.append("servicios externos")

    # Operations skill check
    specialties = list({op.get("specialty") or op.get("trade") or "?" for op in operations})

    can_release = (
        materials_blocking == 0
        and len(operations) > 0
        and bool(sap_pm["equipment_tag"])
    )

    rec = ""
    if use_claude:
        prompt = f"""Eres planificador de mantenimiento. Analiza si esta OT está lista para liberación.

OT: {wo.wo_number} — {wo.wo_title or wo.description[:80]}
Equipo: {wo.equipment_tag} (TL: {wo.technical_location or 'N/A'})
Prioridad: {wo.priority_code} (riesgo {risk})
HH estimadas: {wo.estimated_hours} → costo proxy USD {estimated_cost:.0f} ({budget_flag})

Operaciones ({len(operations)}): {specialties}
Materiales ({len(materials)}): {materials_blocking} con stock insuficiente
Equipos apoyo: {len(support)}
Clases de gasto: {cost_classes}

Genera JSON con:
- can_release: bool
- blocking_issues: lista de issues que impiden liberar (vacía si can_release=true)
- warnings: lista de cosas a vigilar pero no bloqueantes
- recommended_actions: lista 3-5 acciones para que el planificador resuelva antes de liberar
- summary: 1 frase resumiendo

Solo JSON."""
        rec = _claude(prompt, max_tokens=600)

    return {
        "wo_number": wo.wo_number,
        "wo_id": wo.wo_id,
        "status": wo.status,
        "can_release": can_release,
        "checks": {
            "budget": {"estimated_cost_usd": round(estimated_cost, 0), "flag": budget_flag},
            "materials": {"total": len(materials), "blocking": materials_blocking, "details": materials_check[:10]},
            "operations": {"total": len(operations), "specialties": specialties},
            "support_equipment": len(support),
            "cost_classes": cost_classes,
            "sap_pm": sap_pm,
            "risk_level": risk,
        },
        "ai_recommendation": rec,
    }
