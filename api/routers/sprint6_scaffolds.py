"""Sprint 6 VSC — endpoint scaffolds.

Cada endpoint expone un contrato funcional con el frontend y devuelve datos
reales mínimos derivados de SQL existente. Las features completas (UI dedicada,
modelos de IA, integraciones) se implementan iterativamente por ticket.

Tickets cubiertos:
  - SF-566 unscheduled-work        Módulo No Programado P1/P2
  - SF-567 supervisor-board        Tablero Supervisor (Programa Semanal + Diaria + OT)
  - SF-568 smart-assignment        Smart Assignment IA con skills
  - SF-581 critical-backlog        Auditoría avisos por criticidad
  - SF-582 chronic-failures        Detección fallas crónicas IA
  - SF-583 ot-discrepancies        Discrepancias OT plan vs real
  - SF-584 noncompliance-categorize  IA categoriza motivos de incumplimiento
  - SF-587 skills-gaps             Brechas skills + benchmarking
  - SF-589 stock-stockout-predict  Predicción quiebre de stock
  - SF-591 erp-sync                ERP/SAP bidireccional
  - SF-580 digital-checklists      Pautas y checklists digitales
"""

from datetime import datetime, timedelta
from collections import defaultdict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.database.models import ManagedWorkOrderModel, WorkRequestModel
from api.dependencies.auth import get_current_user

router = APIRouter(
    prefix="/sprint6",
    tags=["sprint6-scaffolds"],
    dependencies=[Depends(get_current_user)],
)


def _base_wo(db: Session, plant_id: str | None):
    q = db.query(ManagedWorkOrderModel)
    if plant_id:
        q = q.filter(ManagedWorkOrderModel.plant_id == plant_id)
    return q


# ─── SF-566 Módulo "No Programado" P1/P2 ─────────────────────────────────────
@router.get("/unscheduled-work")
def unscheduled_work(plant_id: str | None = None, db: Session = Depends(get_db)):
    """SF-566 — Avisos P1/P2 listos para conversión a OT PM03 (fast-track)."""
    wrs = db.query(WorkRequestModel).filter(
        WorkRequestModel.priority_code.in_(["P1", "P2"]),
        WorkRequestModel.status.in_(["DRAFT", "PENDING_VALIDATION", "VALIDATED", "APPROVED"]),
    ).all()
    return {
        "todo": "UI dedicada del supervisor + IA suggest activities/repuestos pendiente",
        "convert_endpoint": "/api/v1/work-requests/{id}/convert-to-pm03",
        "items": [{
            "request_id": wr.request_id,
            "equipment_tag": wr.equipment_tag,
            "priority": wr.priority_code,
            "status": wr.status,
            "created_at": wr.created_at.isoformat() if wr.created_at else None,
        } for wr in wrs],
    }


# ─── SF-567 Tablero Supervisor ────────────────────────────────────────────────
@router.get("/supervisor-board")
def supervisor_board(plant_id: str | None = None, ref_date: str | None = None, db: Session = Depends(get_db)):
    """SF-567 — Vistas del tablero del Supervisor: semanal + diaria + detalle.

    Devuelve OTs de la semana en curso agrupadas por día con assigned_workers.
    Las 3 vistas (semanal/diaria/detalle) consumen este endpoint con distinto agrupado.
    """
    today = datetime.now().date()
    if ref_date:
        try:
            today = datetime.fromisoformat(ref_date).date()
        except ValueError:
            pass
    week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)

    q = _base_wo(db, plant_id).filter(
        ManagedWorkOrderModel.planned_start.isnot(None),
        ManagedWorkOrderModel.planned_start >= datetime.combine(week_start, datetime.min.time()),
        ManagedWorkOrderModel.planned_start <= datetime.combine(week_end, datetime.max.time()),
    )

    by_day = defaultdict(list)
    for wo in q.all():
        d = wo.planned_start.date().isoformat()
        by_day[d].append({
            "wo_id": wo.wo_id,
            "wo_number": wo.wo_number,
            "equipment_tag": wo.equipment_tag,
            "wo_type": wo.wo_type,
            "priority": wo.priority_code,
            "status": wo.status,
            "estimated_hours": wo.estimated_hours,
            "actual_hours": wo.actual_hours,
            "shift": getattr(wo, "shift", None),
            "assigned_workers": wo.assigned_workers or [],
            "planned_start": wo.planned_start.isoformat() if wo.planned_start else None,
            "planned_end": wo.planned_end.isoformat() if wo.planned_end else None,
        })

    return {
        "todo": "UI dedicada (3 vistas) + filtros por turno/especialidad pendiente",
        "week_start": week_start.isoformat(),
        "week_end": week_end.isoformat(),
        "by_day": dict(by_day),
        "total_wo": sum(len(v) for v in by_day.values()),
    }


# ─── SF-568 Smart Assignment IA con skills ────────────────────────────────────
@router.get("/smart-assignment-suggest/{wo_id}")
def smart_assignment_suggest(wo_id: str, db: Session = Depends(get_db)):
    """SF-568 — Sugerencia IA de técnico óptimo según skills y carga.

    [SCAFFOLD] devuelve heurística simple por specialty match. La integración
    con Claude para razonamiento sobre skills + historial + carga del día va
    en una segunda iteración.
    """
    from api.database.models import WorkforceModel
    wo = db.query(ManagedWorkOrderModel).filter(ManagedWorkOrderModel.wo_id == wo_id).first()
    if not wo:
        return {"error": "WO not found"}
    needed_specialties = list({(o.get("specialty") or "MECA") for o in (wo.operations or [])})
    workforce = db.query(WorkforceModel).filter(
        WorkforceModel.plant_id == wo.plant_id, WorkforceModel.active == True  # noqa: E712
    ).all() if wo.plant_id else []
    suggestions = []
    for w in workforce:
        skills = (getattr(w, "skills", None) or "")
        match_score = sum(1 for s in needed_specialties if s and s.lower() in skills.lower())
        if match_score > 0:
            suggestions.append({
                "worker_id": w.worker_id,
                "name": getattr(w, "name", w.worker_id),
                "skills": skills,
                "match_score": match_score,
                "shift": getattr(w, "shift_pattern", None),
            })
    suggestions.sort(key=lambda s: -s["match_score"])
    return {
        "todo": "IA reasoning sobre historial de calidad + carga horaria + descansos pendiente",
        "wo_id": wo_id,
        "needed_specialties": needed_specialties,
        "suggestions": suggestions[:10],
    }


# ─── SF-581 Auditoría avisos por criticidad ───────────────────────────────────
@router.get("/critical-backlog-audit")
def critical_backlog_audit(plant_id: str | None = None, db: Session = Depends(get_db)):
    """SF-581 — Cruce avisos abiertos vs inventario crítico (carga por criticidad)."""
    wrs = db.query(WorkRequestModel).filter(
        WorkRequestModel.status.in_(["DRAFT", "PENDING_VALIDATION", "VALIDATED"]),
    ).all()
    by_priority = defaultdict(int)
    by_equipment = defaultdict(int)
    for wr in wrs:
        by_priority[wr.priority_code or "P3"] += 1
        by_equipment[wr.equipment_tag or "?"] += 1
    top_eq = sorted(by_equipment.items(), key=lambda x: -x[1])[:20]
    return {
        "todo": "Cruzar contra hierarchy_nodes con criticality_class para flag inventario crítico",
        "open_wrs": len(wrs),
        "by_priority": dict(by_priority),
        "top_equipment": [{"equipment_tag": k, "open_count": v} for k, v in top_eq],
    }


# ─── SF-582 Detección fallas crónicas ─────────────────────────────────────────
@router.get("/chronic-failures")
def chronic_failures(plant_id: str | None = None, days: int = 180, min_repeats: int = 3, db: Session = Depends(get_db)):
    """SF-582 — Equipos con fallas repetidas (PM03) en `days` con >= `min_repeats` ocurrencias."""
    since = datetime.now() - timedelta(days=days)
    q = _base_wo(db, plant_id).filter(
        ManagedWorkOrderModel.wo_type == "PM03",
        ManagedWorkOrderModel.created_at >= since,
        ManagedWorkOrderModel.equipment_tag.isnot(None),
    )
    counts = defaultdict(int)
    for wo in q.all():
        counts[wo.equipment_tag] += 1
    chronic = [
        {"equipment_tag": k, "failure_count": v, "ranking": "P1-P4"}
        for k, v in counts.items() if v >= min_repeats
    ]
    chronic.sort(key=lambda x: -x["failure_count"])
    return {
        "todo": "Pareto + IA explanation de causa raíz pendiente",
        "period_days": days,
        "min_repeats": min_repeats,
        "chronic_count": len(chronic),
        "items": chronic,
    }


# ─── SF-583 Discrepancias OT plan vs real ─────────────────────────────────────
@router.get("/ot-discrepancies")
def ot_discrepancies(plant_id: str | None = None, days: int = 60, threshold_pct: float = 25.0, db: Session = Depends(get_db)):
    """SF-583 — OTs cerradas con desviación >`threshold_pct`% en HH/duración/costo."""
    since = datetime.now() - timedelta(days=days)
    q = _base_wo(db, plant_id).filter(
        ManagedWorkOrderModel.status == "CERRADO",
        ManagedWorkOrderModel.closed_at >= since,
    )
    items = []
    for wo in q.all():
        plan_h = float(wo.estimated_hours or 0)
        real_h = float(wo.actual_hours or 0)
        plan_c = float(wo.budget_amount or 0)
        real_c = float(wo.actual_total_cost or (float(wo.labor_cost or 0) + float(wo.material_cost or 0) + float(wo.external_cost or 0)))
        var_h = abs(real_h - plan_h) / plan_h * 100 if plan_h > 0 else 0
        var_c = abs(real_c - plan_c) / plan_c * 100 if plan_c > 0 else 0
        if var_h >= threshold_pct or var_c >= threshold_pct:
            items.append({
                "wo_id": wo.wo_id,
                "wo_number": wo.wo_number,
                "equipment_tag": wo.equipment_tag,
                "hh_variance_pct": round(var_h, 1),
                "cost_variance_pct": round(var_c, 1),
                "plan_h": plan_h, "real_h": real_h,
                "plan_c": plan_c, "real_c": real_c,
            })
    items.sort(key=lambda x: -max(x["hh_variance_pct"], x["cost_variance_pct"]))
    return {
        "todo": "Linkear con SF-571 OPS_HH_NOTIFIED gate para marcar discrepancias por op",
        "period_days": days, "threshold_pct": threshold_pct,
        "discrepancy_count": len(items),
        "items": items[:100],
    }


# ─── SF-584 IA categoriza motivos de incumplimiento ───────────────────────────
@router.get("/noncompliance-categorize")
def noncompliance_categorize(plant_id: str | None = None, days: int = 60, db: Session = Depends(get_db)):
    """SF-584 — Categoriza motivos de no-cumplimiento de programa via heurística sobre execution_notes + reschedule_reason + cancellation_reason."""
    since = datetime.now() - timedelta(days=days)
    q = _base_wo(db, plant_id).filter(
        ManagedWorkOrderModel.created_at >= since,
        ManagedWorkOrderModel.status.in_(["REPROGRAMADO", "CANCELADO", "CERRADO"]),
    )
    categories = {
        "personal": ["personal", "ausencia", "tecnico", "dotacion"],
        "materiales": ["material", "repuesto", "stock", "bodega"],
        "equipo_apoyo": ["grua", "puente", "horquilla", "scaffolding", "apoyo"],
        "operacional": ["operacion", "produccion", "indisponibilidad"],
        "permisos": ["permiso", "loto", "lockout", "atc"],
        "clima": ["clima", "lluvia", "viento", "tormenta"],
    }
    counts = defaultdict(int)
    examples = defaultdict(list)
    for wo in q.all():
        text_blocks = [
            (wo.reschedule_reason or ""),
            (wo.cancellation_reason or ""),
            " ".join((n.get("note") or "") for n in (wo.execution_notes or []) if isinstance(n, dict)),
        ]
        text = " ".join(text_blocks).lower()
        if not text.strip():
            continue
        matched = False
        for cat, kws in categories.items():
            if any(k in text for k in kws):
                counts[cat] += 1
                if len(examples[cat]) < 3:
                    examples[cat].append({"wo_number": wo.wo_number, "snippet": text[:120]})
                matched = True
                break
        if not matched:
            counts["otro"] += 1
    return {
        "todo": "Reemplazar heurística por Claude classification + audit equipos apoyo",
        "period_days": days,
        "by_category": dict(counts),
        "examples": dict(examples),
    }


# ─── SF-587 Brechas skills + benchmarking ─────────────────────────────────────
@router.get("/skills-gaps")
def skills_gaps(plant_id: str | None = None, days: int = 90, db: Session = Depends(get_db)):
    """SF-587 — Specialties demandadas por OTs vs disponibles en workforce."""
    from api.database.models import WorkforceModel
    since = datetime.now() - timedelta(days=days)
    q = _base_wo(db, plant_id).filter(ManagedWorkOrderModel.created_at >= since)
    demand = defaultdict(int)
    for wo in q.all():
        for op in (wo.operations or []):
            sp = (op.get("specialty") or "").upper()
            if sp:
                demand[sp] += int(op.get("quantity") or 1)
    workforce = db.query(WorkforceModel).all()
    supply = defaultdict(int)
    for w in workforce:
        for sp in (getattr(w, "skills", "") or "").upper().split(","):
            sp = sp.strip()
            if sp:
                supply[sp] += 1
    gaps = []
    for sp, d in demand.items():
        s = supply.get(sp, 0)
        gaps.append({"specialty": sp, "demand_op_count": d, "supply_count": s, "gap": d - s})
    gaps.sort(key=lambda x: -x["gap"])
    return {
        "todo": "Benchmark de tiempos de ejecución por specialty + capacitación sugerida",
        "period_days": days,
        "gaps": gaps,
    }


# ─── SF-589 Predicción quiebre de stock ───────────────────────────────────────
@router.get("/stockout-predict")
def stockout_predict(plant_id: str | None = None, days_ahead: int = 14, db: Session = Depends(get_db)):
    """SF-589 — Materiales con consumo proyectado > stock disponible."""
    since = datetime.now() - timedelta(days=90)
    q = _base_wo(db, plant_id).filter(ManagedWorkOrderModel.created_at >= since)
    consumption = defaultdict(float)
    for wo in q.all():
        for m in (wo.materials or []):
            if isinstance(m, dict):
                code = m.get("code") or m.get("material_code") or ""
                qty = float(m.get("quantity") or m.get("qty_required") or 0)
                if code:
                    consumption[code] += qty
    daily = {k: v / 90.0 for k, v in consumption.items()}
    risk = []
    for code, daily_rate in daily.items():
        projected = daily_rate * days_ahead
        risk.append({
            "material_code": code,
            "daily_consumption": round(daily_rate, 2),
            "projected_need_d_ahead": round(projected, 2),
            "status": "monitor",  # placeholder; cruce con bodega real pendiente
        })
    risk.sort(key=lambda x: -x["projected_need_d_ahead"])
    return {
        "todo": "Cruzar con tabla bodega real + alertas configurables; integrar con ERP (SF-591)",
        "horizon_days": days_ahead,
        "predictions": risk[:50],
    }


# ─── SF-591 ERP/SAP bidireccional ─────────────────────────────────────────────
@router.get("/erp-sync/status")
def erp_sync_status(plant_id: str | None = None, db: Session = Depends(get_db)):
    """SF-591 — Estado de la integración SAP bidireccional."""
    return {
        "todo": (
            "Implementar conector SAP RFC/OData: leer costos+UT+estrategias desde SAP PM, "
            "push de hallazgos a estrategias y FMECA. Mock actual está en sap_mock/."
        ),
        "implemented": False,
        "directions": {
            "sap_to_ams": ["costs", "tech_locations", "strategies", "ut_hierarchy"],
            "ams_to_sap": ["finding_to_strategy", "finding_to_fmeca", "wo_close_with_costs"],
        },
        "mock_endpoints": ["/sap/equipment", "/sap/work-orders", "/sap/materials"],
    }


# ─── SF-580 Pautas y Checklists digitales ─────────────────────────────────────
@router.get("/digital-checklists/templates")
def digital_checklist_templates(plant_id: str | None = None, db: Session = Depends(get_db)):
    """SF-580 — Catálogo de pautas y checklists digitales con validación de rangos."""
    return {
        "todo": (
            "Tabla nueva `digital_checklist_template` + relación a operations. "
            "Persist hallazgos con foto en S3/local + validación de rangos por campo."
        ),
        "implemented": False,
        "templates": [],
    }
