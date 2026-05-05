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


# ─── SF-608 Asignación automática de recursos ────────────────────────────────
@router.get("/auto-assign-resources")
def auto_assign_resources(
    technical_location: str | None = None,
    equipment_tag: str | None = None,
    plant_id: str | None = None,
    db: Session = Depends(get_db),
):
    """SF-608 NF-3 — Sugiere planning_group + responsable según (UbicTec, Tag).

    Heurística: busca OTs cerradas previas con la misma combinación y devuelve
    el planning_group + responsable más frecuente. Si no hay histórico, intenta
    fallback por TL/tag por separado.
    """
    if not equipment_tag and not technical_location:
        return {"planning_group": None, "responsible": None, "confidence": 0.0, "source": "none"}

    q = _base_wo(db, plant_id)
    if equipment_tag:
        q = q.filter(ManagedWorkOrderModel.equipment_tag == equipment_tag)
    if technical_location:
        q = q.filter(ManagedWorkOrderModel.technical_location == technical_location)
    rows = q.order_by(ManagedWorkOrderModel.created_at.desc()).limit(50).all()

    pg_counts = defaultdict(int)
    resp_counts = defaultdict(int)
    for wo in rows:
        if getattr(wo, "planning_group", None):
            pg_counts[wo.planning_group] += 1
        if getattr(wo, "work_center", None):
            resp_counts[wo.work_center] += 1

    if not pg_counts and not resp_counts:
        # Fallback: solo tag (sin TL)
        if equipment_tag:
            q2 = _base_wo(db, plant_id).filter(
                ManagedWorkOrderModel.equipment_tag == equipment_tag
            ).order_by(ManagedWorkOrderModel.created_at.desc()).limit(20).all()
            for wo in q2:
                if getattr(wo, "planning_group", None):
                    pg_counts[wo.planning_group] += 1
                if getattr(wo, "work_center", None):
                    resp_counts[wo.work_center] += 1

    pg_top = max(pg_counts.items(), key=lambda x: x[1]) if pg_counts else (None, 0)
    resp_top = max(resp_counts.items(), key=lambda x: x[1]) if resp_counts else (None, 0)
    total = max(1, sum(pg_counts.values()))
    return {
        "planning_group": pg_top[0],
        "responsible": resp_top[0],
        "confidence": round(pg_top[1] / total, 2) if pg_top[0] else 0.0,
        "source": "history" if rows else "fallback",
        "history_size": len(rows),
        "todo": "Cuando exista tabla mapping_resource oficial, reemplazar heurística histórica por lookup directo",
    }


# ─── SF-610 Documentos asociados al trabajo ──────────────────────────────────
@router.get("/work-documents/{wo_id}")
def work_documents(wo_id: str, db: Session = Depends(get_db)):
    """SF-610 NF-6 — Lista consolidada de documentos asociados a una OT.

    Combina:
    - Sugeridos por IA (DMS por technical_location)
    - Manuales (wo.documents)
    - Fotos (wo.documents type=photo)
    """
    wo = db.query(ManagedWorkOrderModel).filter(ManagedWorkOrderModel.wo_id == wo_id).first()
    if not wo:
        return {"error": "WO not found"}
    documents = []
    for d in (wo.documents or []):
        if isinstance(d, dict):
            documents.append({
                "name": d.get("name", ""),
                "url": d.get("url", ""),
                "type": d.get("type", "doc"),
                "source": d.get("source", "manual"),
                "data": d.get("data", "") if d.get("type") == "photo" else None,
            })
    # IA sugiere por DMS si hay technical_location
    suggested = []
    if wo.technical_location:
        try:
            from api.database.models import DMSDocumentModel
            dms = db.query(DMSDocumentModel).filter(
                DMSDocumentModel.func_loc == wo.technical_location
            ).limit(20).all()
            for d in dms:
                suggested.append({
                    "name": d.title or d.filename,
                    "url": f"/dms/{d.filename}" if d.filename else None,
                    "type": "doc",
                    "source": "ai_suggested_dms",
                    "func_loc": d.func_loc,
                })
        except Exception:
            pass
    return {
        "wo_id": wo_id,
        "wo_number": wo.wo_number,
        "manual_documents": documents,
        "ai_suggested": suggested,
        "total": len(documents) + len(suggested),
    }


# ─── SF-613 Búsqueda equipos apoyo desde catálogo ────────────────────────────
@router.get("/support-equipment-catalog")
def support_equipment_catalog(plant_id: str | None = None, search: str | None = None, db: Session = Depends(get_db)):
    """SF-613 NF-5 — Catálogo de equipos de apoyo para selector (no texto libre)."""
    from api.database.models import SupportEquipmentModel
    q = db.query(SupportEquipmentModel)
    if plant_id:
        q = q.filter(SupportEquipmentModel.plant_id == plant_id)
    if search:
        term = f"%{search.lower()}%"
        q = q.filter(
            SupportEquipmentModel.name.ilike(term) |
            SupportEquipmentModel.tag.ilike(term) |
            SupportEquipmentModel.equipment_type.ilike(term)
        )
    rows = q.filter(SupportEquipmentModel.status != "FUERA_SERVICIO").limit(100).all()
    return {
        "items": [{
            "id": r.equipment_id,
            "tag": r.tag,
            "name": r.name,
            "type": r.equipment_type,
            "capacity_tons": r.capacity_tons,
            "ownership": r.ownership,
            "status": r.status,
        } for r in rows],
        "count": len(rows),
    }


# ─── SF-621 Eliminación / limpieza recursos obsoletos ────────────────────────
@router.get("/inactive-resources")
def inactive_resources(plant_id: str | None = None, days_threshold: int = 180, db: Session = Depends(get_db)):
    """SF-621 NF-16 — Identifica recursos sin uso reciente (candidatos a soft-delete)."""
    from api.database.models import WorkforceModel, SupportEquipmentModel
    cutoff = datetime.now() - timedelta(days=days_threshold)

    # WO histórico para saber quién/qué se usó
    recent_wos = _base_wo(db, plant_id).filter(
        ManagedWorkOrderModel.created_at >= cutoff
    ).all()
    used_workers = set()
    used_equipment = set()
    for wo in recent_wos:
        for w in (wo.assigned_workers or []):
            wid = w.get("worker_id") if isinstance(w, dict) else w
            if wid:
                used_workers.add(wid)
        for s in (wo.support_equipment or []):
            tag = s.get("tag") if isinstance(s, dict) else None
            if tag:
                used_equipment.add(tag)

    # Workforce inactivos
    wf_q = db.query(WorkforceModel)
    if plant_id:
        wf_q = wf_q.filter(WorkforceModel.plant_id == plant_id)
    inactive_workers = []
    for w in wf_q.all():
        if w.worker_id not in used_workers:
            inactive_workers.append({
                "worker_id": w.worker_id,
                "name": getattr(w, "name", w.worker_id),
                "specialty": getattr(w, "specialty", None),
                "active": getattr(w, "active", None),
            })

    # Support equipment inactivos
    se_q = db.query(SupportEquipmentModel)
    if plant_id:
        se_q = se_q.filter(SupportEquipmentModel.plant_id == plant_id)
    inactive_equipment = []
    for e in se_q.all():
        if e.tag not in used_equipment:
            inactive_equipment.append({
                "id": e.equipment_id,
                "tag": e.tag,
                "name": e.name,
                "type": e.equipment_type,
                "status": e.status,
            })

    return {
        "threshold_days": days_threshold,
        "inactive_workers": inactive_workers,
        "inactive_equipment": inactive_equipment,
        "summary": {
            "total_inactive_workers": len(inactive_workers),
            "total_inactive_equipment": len(inactive_equipment),
            "wos_analyzed": len(recent_wos),
        },
        "todo": "Acción soft-delete requiere endpoint POST con confirmación + audit log",
    }


# ─── SF-624 Buscador equipos auto-completado ─────────────────────────────────
@router.get("/equipment-autocomplete")
def equipment_autocomplete(query: str, plant_id: str | None = None, limit: int = 20, db: Session = Depends(get_db)):
    """SF-624 NF-19 — Buscador con auto-complete que devuelve nombre + tag + UbicTec.

    Cuando el usuario tipea, este endpoint devuelve un set listo para llenar
    los 3 campos relacionados (nombre, tag, technical_location).
    """
    from api.database.models import HierarchyNodeModel
    if not query or len(query.strip()) < 2:
        return {"items": [], "count": 0}
    term = f"%{query.strip().lower()}%"
    q = db.query(HierarchyNodeModel).filter(
        HierarchyNodeModel.node_type == "EQUIPMENT",
        HierarchyNodeModel.name.ilike(term) |
        HierarchyNodeModel.tag.ilike(term) |
        HierarchyNodeModel.code.ilike(term) |
        HierarchyNodeModel.sap_func_loc.ilike(term)
    )
    if plant_id:
        q = q.filter(HierarchyNodeModel.plant_id == plant_id)
    rows = q.limit(limit).all()
    return {
        "query": query,
        "count": len(rows),
        "items": [{
            "node_id": n.node_id,
            "name": n.name,
            "tag": n.tag,
            "technical_location": n.sap_func_loc or n.code,
            "code": n.code,
            "plant_id": n.plant_id,
        } for n in rows],
    }


# ─── SF-606 Memoria persistente de IA + feedback usuario ─────────────────────
@router.get("/ai-feedback/stats")
def ai_feedback_stats(plant_id: str | None = None, db: Session = Depends(get_db)):
    """SF-606 NF-1 — Tasa de aceptación de sugerencias IA + memoria persistente.

    Devuelve métricas sobre las decisiones humanas vs sugerencias IA:
    - cuántas se aceptaron / rechazaron / quedaron pendientes
    - distribución por tipo de sugerencia (priority, equipment, etc.)
    """
    from api.database.models import WorkRequestModel
    q = db.query(WorkRequestModel)
    if plant_id:
        from sqlalchemy import or_, func
        q = q.filter(or_(
            WorkRequestModel.ai_classification.contains({"plant_id": plant_id}),
        ))
    total = q.count()
    accepted = 0
    rejected = 0
    pending = 0
    for wr in q.limit(2000).all():
        ai = wr.ai_classification if isinstance(wr.ai_classification, dict) else {}
        decision = ai.get("ai_priority_decision")
        if decision == "accepted":
            accepted += 1
        elif decision == "rejected":
            rejected += 1
        elif ai.get("ai_priority_pending"):
            pending += 1
    decided = accepted + rejected
    accept_rate = round(accepted / decided * 100, 1) if decided else 0
    return {
        "total_wrs": total,
        "ai_decisions": {"accepted": accepted, "rejected": rejected, "pending": pending},
        "accept_rate_pct": accept_rate,
        "todo": "Persistir feedback con razón en tabla ai_feedback (vector store opcional). UI 👍/👎 + razón pendiente.",
    }


# ─── SF-615 Planificación por operación ──────────────────────────────────────
@router.get("/ops-schedule/{wo_id}")
def ops_schedule(wo_id: str, db: Session = Depends(get_db)):
    """SF-615 NF-10 — Devuelve plan por operación dentro de la OT.

    Cada op puede tener planned_start/planned_end + assigned_worker propios.
    Hoy las ops viven en wo.operations[]; agregamos campos por op si existen.
    """
    wo = db.query(ManagedWorkOrderModel).filter(ManagedWorkOrderModel.wo_id == wo_id).first()
    if not wo:
        return {"error": "WO not found"}
    ops = wo.operations or []
    rollup_starts = []
    rollup_ends = []
    out_ops = []
    for op in ops:
        op_start = op.get("planned_start") or wo.planned_start.isoformat() if wo.planned_start else None
        op_end = op.get("planned_end")
        out_ops.append({
            "op_number": op.get("op_number"),
            "description": op.get("description"),
            "specialty": op.get("specialty"),
            "planned_start": op_start,
            "planned_end": op_end,
            "assigned_worker": op.get("assigned_worker"),
            "duration_h": op.get("hours") or op.get("duration"),
        })
        if op_start: rollup_starts.append(op_start)
        if op_end: rollup_ends.append(op_end)
    return {
        "wo_id": wo_id,
        "wo_number": wo.wo_number,
        "rollup": {"start": min(rollup_starts) if rollup_starts else None, "end": max(rollup_ends) if rollup_ends else None},
        "ops": out_ops,
        "todo": "PUT /ops/{op_seq}/schedule para asignar plan por op individual + UI de calendario por op",
    }


# ─── SF-617 IA skills/capacidades ────────────────────────────────────────────
@router.get("/skills-inference/{wo_id}")
def skills_inference(wo_id: str, db: Session = Depends(get_db)):
    """SF-617 NF-12 — Skills inferidos por op + match con técnicos disponibles."""
    from api.database.models import WorkforceModel
    wo = db.query(ManagedWorkOrderModel).filter(ManagedWorkOrderModel.wo_id == wo_id).first()
    if not wo:
        return {"error": "WO not found"}
    SKILL_MAP = {
        "MECA": ["mecanica", "torque", "alineacion", "rodamientos"],
        "ELEC": ["electrica", "tablero", "motores", "controles"],
        "INST": ["instrumentacion", "calibracion", "transmisores"],
        "LUBR": ["lubricacion", "aceite", "grasa"],
        "PRED": ["vibracion", "termografia", "ultrasonido"],
    }
    out = []
    workforce = db.query(WorkforceModel).filter(
        WorkforceModel.plant_id == wo.plant_id, WorkforceModel.active == True  # noqa: E712
    ).all() if wo.plant_id else []
    for op in (wo.operations or []):
        sp = (op.get("specialty") or "").upper()
        required = SKILL_MAP.get(sp, [])
        matches = []
        for w in workforce:
            skills_str = (getattr(w, "skills", None) or "").lower()
            score = sum(1 for k in required if k in skills_str)
            if score > 0:
                matches.append({"worker_id": w.worker_id, "name": getattr(w, "name", w.worker_id), "score": score})
        matches.sort(key=lambda m: -m["score"])
        out.append({
            "op_number": op.get("op_number"),
            "specialty": sp,
            "required_skills": required,
            "candidates": matches[:5],
            "best_match": matches[0] if matches else None,
        })
    return {
        "wo_id": wo_id,
        "ops_inference": out,
        "todo": "Reemplazar SKILL_MAP estático por catálogo + Claude inference contextual sobre histórico",
    }


# ─── SF-618 Stock vs necesidad de repuestos ──────────────────────────────────
@router.get("/stock-check/{wo_id}")
def stock_check(wo_id: str, db: Session = Depends(get_db)):
    """SF-618 NF-13 — Cruza materiales requeridos por la OT con stock disponible."""
    wo = db.query(ManagedWorkOrderModel).filter(ManagedWorkOrderModel.wo_id == wo_id).first()
    if not wo:
        return {"error": "WO not found"}
    items = []
    for m in (wo.materials or []):
        if not isinstance(m, dict):
            continue
        required = float(m.get("quantity") or m.get("qty_required") or 0)
        available = float(m.get("qty_available") or 0)
        status = "ok" if available >= required else ("partial" if available > 0 else "out_of_stock")
        items.append({
            "code": m.get("code") or m.get("material_code"),
            "description": m.get("description"),
            "required": required,
            "available": available,
            "shortfall": max(0, required - available),
            "status": status,
        })
    items.sort(key=lambda x: {"out_of_stock": 0, "partial": 1, "ok": 2}[x["status"]])
    return {
        "wo_id": wo_id,
        "wo_number": wo.wo_number,
        "items": items,
        "summary": {
            "total": len(items),
            "ok": sum(1 for i in items if i["status"] == "ok"),
            "partial": sum(1 for i in items if i["status"] == "partial"),
            "out_of_stock": sum(1 for i in items if i["status"] == "out_of_stock"),
        },
        "todo": "Reemplazar qty_available embebido por consulta real-time a tabla bodega + endpoint POST de pedido",
    }


# ─── SF-619 Estandarización datos técnicos ───────────────────────────────────
@router.get("/canonical-data-status")
def canonical_data_status(plant_id: str | None = None, db: Session = Depends(get_db)):
    """SF-619 NF-14 — Estado real de fragmentación de datos canónicos.

    Investigación 2026-05-05 sobre BD prod: identificadas 3 fuentes paralelas
    de materiales con IDs distintos (sap_code, material_code, sap_id) sin FKs.
    Otras dimensiones (equipos, workforce, planning) ya tienen fuente única.
    """
    from sqlalchemy import text, inspect
    from api.database.models import (
        HierarchyNodeModel, WorkforceModel, SupportEquipmentModel,
        WorkCenterModel,
    )

    # Counts por dimensión
    def count(model, plant_field="plant_id"):
        q = db.query(model)
        if plant_id and hasattr(model, plant_field):
            q = q.filter(getattr(model, plant_field) == plant_id)
        return q.count()

    inv = inspect(db.bind)
    has_table = lambda t: t in inv.get_table_names()

    materials_sources = {}
    for tbl in ("bom_items", "inventory_items", "sap_materials"):
        if has_table(tbl):
            materials_sources[tbl] = db.execute(text(f"SELECT COUNT(*) FROM {tbl}")).scalar() or 0

    cost_sources = {}
    for tbl in (
        "annual_budget_capex", "annual_budget_equipment", "annual_budget_executive",
        "annual_budget_kpi_targets", "annual_budget_maintenance", "annual_budget_opex",
        "annual_budget_production", "cost_centers",
    ):
        if has_table(tbl):
            cost_sources[tbl] = db.execute(text(f"SELECT COUNT(*) FROM {tbl}")).scalar() or 0

    # Fragmentación score: dimensiones con >1 fuente
    fragmented = []
    if len(materials_sources) > 1:
        fragmented.append({
            "dimension": "materiales",
            "sources": list(materials_sources.keys()),
            "ids_distintos": ["bom_items.sap_code", "inventory_items.material_code", "sap_materials.sap_id"],
            "severity": "ALTA — sin FKs entre tablas, probable solapamiento físico",
            "remediation": "Crear vista materiales_canonical(canonical_id, sources[]) + endpoint unificado /canonical/materials",
        })
    if len(cost_sources) > 4:
        fragmented.append({
            "dimension": "costos",
            "sources": list(cost_sources.keys()),
            "severity": "MEDIA — fragmentación por dimensión (CAPEX/OPEX/equipment), aceptable",
            "remediation": "Vista materializada budget_summary() agregando todas las dimensiones",
        })

    return {
        "fragmentation_score": len(fragmented),
        "fragmented_dimensions": fragmented,
        "single_source_dimensions": {
            "ubicaciones_tecnicas": {"table": "hierarchy_nodes", "rows": count(HierarchyNodeModel)},
            "workforce": {"table": "workforce", "rows": count(WorkforceModel)},
            "support_equipment": {"table": "support_equipment", "rows": count(SupportEquipmentModel)},
            "work_centers": {"table": "work_centers", "rows": count(WorkCenterModel) if WorkCenterModel else 0},
        },
        "materials_breakdown": materials_sources,
        "cost_breakdown": cost_sources,
        "canonical_endpoints": {
            "/sprint6/canonical/materials-search": "Búsqueda unificada en las 3 fuentes",
            "/sprint6/canonical-data-status": "este endpoint",
        },
    }


@router.get("/canonical/materials-search")
def canonical_materials_search(
    query: str,
    limit: int = 30,
    db: Session = Depends(get_db),
):
    """SF-619 NF-14 — Búsqueda canónica unificada en las 3 fuentes de materiales.

    Devuelve resultados con `source` que indica de cuál tabla proviene
    (bom_items / inventory_items / sap_materials) y un `canonical_id`
    derivado para deduplicar visualmente.
    """
    from sqlalchemy import text
    if not query or len(query.strip()) < 2:
        return {"items": [], "count": 0, "sources_searched": 0}
    term = f"%{query.strip().lower()}%"
    results = []
    sources = 0

    # 1. sap_materials (catálogo global SAP)
    try:
        rows = db.execute(text("""
            SELECT sap_id, description, category, unit, unit_cost_usd, manufacturer, part_number, current_stock, min_stock
            FROM sap_materials
            WHERE LOWER(description) LIKE :t OR LOWER(part_number) LIKE :t OR LOWER(sap_id) LIKE :t
            LIMIT :lim
        """), {"t": term, "lim": limit}).fetchall()
        sources += 1
        for r in rows:
            results.append({
                "canonical_id": f"SAP:{r[0]}",
                "source": "sap_materials",
                "code": r[0],
                "description": r[1],
                "category": r[2],
                "unit": r[3],
                "unit_cost": r[4],
                "manufacturer": r[5],
                "part_number": r[6],
                "current_stock": r[7],
                "min_stock": r[8],
            })
    except Exception:
        pass

    # 2. inventory_items (stock por bodega)
    try:
        rows = db.execute(text("""
            SELECT material_code, description, warehouse_id, quantity_on_hand, quantity_available, min_stock
            FROM inventory_items
            WHERE LOWER(description) LIKE :t OR LOWER(material_code) LIKE :t
            LIMIT :lim
        """), {"t": term, "lim": limit}).fetchall()
        sources += 1
        for r in rows:
            results.append({
                "canonical_id": f"INV:{r[0]}",
                "source": "inventory_items",
                "code": r[0],
                "description": r[1],
                "warehouse_id": r[2],
                "quantity_on_hand": r[3],
                "quantity_available": r[4],
                "min_stock": r[5],
            })
    except Exception:
        pass

    # 3. bom_items (lista de materiales por equipo)
    try:
        rows = db.execute(text("""
            SELECT sap_code, component, description, equipment_tag, quantity, unit, critical
            FROM bom_items
            WHERE LOWER(description) LIKE :t OR LOWER(component) LIKE :t OR LOWER(sap_code) LIKE :t
            LIMIT :lim
        """), {"t": term, "lim": limit}).fetchall()
        sources += 1
        for r in rows:
            results.append({
                "canonical_id": f"BOM:{r[0]}",
                "source": "bom_items",
                "code": r[0],
                "component_label": r[1],
                "description": r[2],
                "equipment_tag": r[3],
                "quantity": r[4],
                "unit": r[5],
                "critical": bool(r[6]) if r[6] is not None else None,
            })
    except Exception:
        pass

    return {
        "query": query,
        "count": len(results),
        "sources_searched": sources,
        "items": results,
        "note": (
            "canonical_id usa prefijo SAP:/INV:/BOM: porque las 3 tablas no comparten FK. "
            "Próxima iteración: tabla materials_canonical con mapping (sap_id, material_code, sap_code) "
            "para deduplicar resultados que sean el mismo material físico en distintas fuentes."
        ),
    }


# ─── SF-620 Automatización generación OT ─────────────────────────────────────
@router.post("/auto-generate-wo/{request_id}")
def auto_generate_wo(request_id: str, db: Session = Depends(get_db)):
    """SF-620 NF-15 — Genera una OT completa desde un aviso usando heurística + IA.

    Flujo: WR aprobado → llama create_from_work_request (existente) que ya
    propaga ops/materials/risk/photos. Devuelve la OT generada para revisión.
    """
    from api.database.models import WorkRequestModel
    from api.services import managed_wo_service
    wr = db.query(WorkRequestModel).filter(WorkRequestModel.request_id == request_id).first()
    if not wr:
        return {"error": "WR not found"}
    if wr.status not in ("VALIDATED", "APPROVED", "ASSIGNED", "APROBADO"):
        return {"error": "WR must be approved first", "current_status": wr.status}
    result = managed_wo_service.create_from_work_request(db, request_id, planned_by="auto-generate")
    if not result:
        return {"error": "Failed to create OT"}
    return {
        "wo_id": result.get("wo_id"),
        "wo_number": result.get("wo_number"),
        "status": result.get("status"),
        "auto_generated_at": datetime.now().isoformat(),
        "edit_required": True,
        "todo": "Métrica % de OTs auto-generadas que requieren <X% edición humana (NF-15 acceptance criteria)",
    }


# ─── SF-622 Definición de perfiles de mantenedores ───────────────────────────
@router.get("/workforce-profiles")
def workforce_profiles(plant_id: str | None = None, db: Session = Depends(get_db)):
    """SF-622 NF-17 — Perfiles estándar agrupados por specialty + certificaciones."""
    from api.database.models import WorkforceModel
    q = db.query(WorkforceModel)
    if plant_id:
        q = q.filter(WorkforceModel.plant_id == plant_id)
    by_profile = defaultdict(list)
    for w in q.all():
        sp = (getattr(w, "specialty", None) or "OTRO").upper()
        by_profile[sp].append({
            "worker_id": w.worker_id,
            "name": getattr(w, "name", w.worker_id),
            "skills": getattr(w, "skills", None),
            "active": getattr(w, "active", None),
        })
    profiles = [
        {
            "profile": k,
            "count": len(v),
            "members": v[:50],
            "expected_certifications": _expected_certs(k),
        }
        for k, v in by_profile.items()
    ]
    profiles.sort(key=lambda p: -p["count"])
    return {
        "profiles": profiles,
        "total_workers": sum(p["count"] for p in profiles),
        "todo": "Tabla certifications con expiry + check vigencia + workflow renovación",
    }


def _expected_certs(profile: str) -> list[str]:
    base = ["LOTO", "Trabajo en altura"]
    extras = {
        "MECA": ["Soldadura básica", "Izaje"],
        "ELEC": ["NFPA 70E", "Tableros eléctricos", "Motores BT"],
        "INST": ["Calibración 4-20mA", "HART", "Lazos de control"],
        "LUBR": ["Manejo lubricantes ISO", "MSDS"],
        "PRED": ["Cat I Vibraciones", "Termografía Nivel I"],
    }
    return base + extras.get(profile, [])


# ─── SF-623 IA estándar job completo ─────────────────────────────────────────
@router.get("/ai-job-standard/{wo_id}")
def ai_job_standard(wo_id: str, db: Session = Depends(get_db)):
    """SF-623 NF-18 — Devuelve estándar job sugerido (ops + materials + docs) por IA."""
    wo = db.query(ManagedWorkOrderModel).filter(ManagedWorkOrderModel.wo_id == wo_id).first()
    if not wo:
        return {"error": "WO not found"}
    # Heurística: agregar templates por wo_type + reusar /work-documents
    docs_resp = work_documents(wo_id, db)
    coverage = {
        "operations": len(wo.operations or []),
        "materials": len(wo.materials or []),
        "support_equipment": len(wo.support_equipment or []),
        "ai_suggested_docs": len(docs_resp.get("ai_suggested", [])),
        "manual_docs": len(docs_resp.get("manual_documents", [])),
    }
    score = sum(1 for v in coverage.values() if v > 0) / len(coverage) * 100
    return {
        "wo_id": wo_id,
        "wo_number": wo.wo_number,
        "coverage": coverage,
        "completeness_pct": round(score, 1),
        "ai_suggested": {
            "documents": docs_resp.get("ai_suggested", []),
            "todo_ops": "Reemplazar pass-through por templates + Claude generation por wo_type",
            "todo_materials": "BOM histórico para equipos similares con mismo failure_mode",
        },
    }


# ─── SF-616 Visualización expandible puestos de trabajo ──────────────────────
@router.get("/workstation-expandable/{wo_id}")
def workstation_expandable(wo_id: str, db: Session = Depends(get_db)):
    """SF-616 NF-11 — Vista expandible de puestos de trabajo requeridos vs asignados/disponibles."""
    from api.database.models import WorkforceModel
    wo = db.query(ManagedWorkOrderModel).filter(ManagedWorkOrderModel.wo_id == wo_id).first()
    if not wo:
        return {"error": "WO not found"}
    # Agregar por specialty
    by_spec = defaultdict(lambda: {"required_qty": 0, "required_hours": 0.0, "assigned": []})
    for op in (wo.operations or []):
        sp = (op.get("specialty") or "MECA").upper()
        by_spec[sp]["required_qty"] += int(op.get("quantity") or 1)
        by_spec[sp]["required_hours"] += float(op.get("hours") or op.get("duration") or 0) * int(op.get("quantity") or 1)
    for w in (wo.assigned_workers or []):
        sp = (w.get("specialty") if isinstance(w, dict) else "").upper() or "?"
        by_spec[sp]["assigned"].append(w.get("worker_id") if isinstance(w, dict) else str(w))
    # Disponibilidad por specialty en plant
    avail_q = db.query(WorkforceModel)
    if wo.plant_id:
        avail_q = avail_q.filter(WorkforceModel.plant_id == wo.plant_id)
    avail = defaultdict(int)
    for w in avail_q.all():
        sp = (getattr(w, "specialty", None) or "?").upper()
        avail[sp] += 1
    workstations = []
    for sp, d in by_spec.items():
        workstations.append({
            "specialty": sp,
            "required_qty": d["required_qty"],
            "required_hours": round(d["required_hours"], 2),
            "assigned_count": len(d["assigned"]),
            "assigned_ids": d["assigned"],
            "available_pool": avail.get(sp, 0),
            "gap": max(0, d["required_qty"] - len(d["assigned"])),
        })
    return {
        "wo_id": wo_id,
        "wo_number": wo.wo_number,
        "workstations": workstations,
        "summary": {
            "total_required_hh": round(sum(w["required_hours"] for w in workstations), 2),
            "total_assigned": sum(w["assigned_count"] for w in workstations),
            "total_gap": sum(w["gap"] for w in workstations),
        },
    }


# ─── SF-625 Recursos internos vs externos ────────────────────────────────────
@router.get("/resources-internal-external")
def resources_internal_external(plant_id: str | None = None, db: Session = Depends(get_db)):
    """SF-625 NF-20 — Distinción visual entre recursos internos vs externos.

    Heurística: support_equipment con ownership='ARRENDADO' = externo; resto interno.
    Workforce todos internos por ahora (no hay flag externo en modelo actual).
    """
    from api.database.models import WorkforceModel, SupportEquipmentModel
    se_q = db.query(SupportEquipmentModel)
    if plant_id:
        se_q = se_q.filter(SupportEquipmentModel.plant_id == plant_id)
    equipment = []
    for e in se_q.all():
        is_external = (getattr(e, "ownership", "") or "").upper() == "ARRENDADO"
        equipment.append({
            "id": e.equipment_id,
            "name": e.name,
            "type": e.equipment_type,
            "is_external": is_external,
            "trigger_quotation_flow": is_external,
        })
    wf_q = db.query(WorkforceModel)
    if plant_id:
        wf_q = wf_q.filter(WorkforceModel.plant_id == plant_id)
    return {
        "equipment": equipment,
        "workforce_count": wf_q.count(),
        "todo": "Agregar campo workforce.is_external + flujo quotation/OC para externos",
    }


# ─── SF-612 Vista alternativa calendario (no basada en personas) ─────────────
@router.get("/calendar-by-hour")
def calendar_by_hour(
    plant_id: str | None = None,
    ref_date: str | None = None,
    db: Session = Depends(get_db),
):
    """SF-612 NF-8 / SF-614 NF-9 — Tablero gemelo (José): grilla por HORA del día.

    Devuelve la semana actual con eje Y = horarios 00-24h en bloques de 1h.
    Para cada slot devuelve las OTs activas y la HH consumida por especialidad.
    Es la base del segundo tablero "drag-drop por hora" donde el supervisor
    asigna OT a una hora específica y arriba se llena automático por specialty.
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

    # grid[day][hour] = {wos: [...], specialty_hh: {ELEC: 4, MECA: 8, ...}}
    grid = {}
    for d_offset in range(7):
        d = (week_start + timedelta(days=d_offset)).isoformat()
        grid[d] = {h: {"wos": [], "specialty_hh": {}} for h in range(24)}

    for wo in q.all():
        if not wo.planned_start:
            continue
        d_key = wo.planned_start.date().isoformat()
        if d_key not in grid:
            continue
        start_h = wo.planned_start.hour
        duration_h = max(1, int(float(wo.estimated_hours or 0)))
        # Distribuir HH por specialty desde operations
        spec_hh = defaultdict(float)
        for op in (wo.operations or []):
            sp = (op.get("specialty") or "MECA").upper()
            spec_hh[sp] += float(op.get("hours") or op.get("duration") or 0) * int(op.get("quantity") or 1)
        for offset in range(duration_h):
            slot = start_h + offset
            if slot >= 24:
                break
            grid[d_key][slot]["wos"].append({
                "wo_id": wo.wo_id,
                "wo_number": wo.wo_number,
                "equipment_tag": wo.equipment_tag,
                "priority": wo.priority_code,
                "status": wo.status,
            })
            for sp, hh in spec_hh.items():
                # Distribución uniforme por hora — heurística simple
                grid[d_key][slot]["specialty_hh"][sp] = grid[d_key][slot]["specialty_hh"].get(sp, 0) + hh / duration_h

    return {
        "week_start": week_start.isoformat(),
        "week_end": week_end.isoformat(),
        "grid": grid,
        "todo": (
            "UI dedicada con drag-drop entre tableros. Tablero superior se llena auto "
            "por specialty/HH; tablero inferior recibe drag de OT a slot horario."
        ),
    }


# ─── SF-628 Pruebas de estrés del sistema ────────────────────────────────────
@router.get("/stress-test/baseline")
def stress_test_baseline(plant_id: str | None = None, db: Session = Depends(get_db)):
    """SF-628 NF-23 — Baseline de carga actual del sistema para diseño de pruebas estrés.

    Devuelve métricas reales del backend para usar como punto de comparación al
    diseñar escenarios de carga (k6/Locust). NO ejecuta carga; solo informa.
    """
    from api.database.models import WorkRequestModel, ManagedWorkOrderModel as M

    wr_total = db.query(WorkRequestModel).count()
    wo_total = db.query(M).count()
    last_30 = datetime.now() - timedelta(days=30)
    wr_last30 = db.query(WorkRequestModel).filter(WorkRequestModel.created_at >= last_30).count()
    wo_last30 = db.query(M).filter(M.created_at >= last_30).count()

    return {
        "current_volume": {
            "work_requests_total": wr_total,
            "work_orders_total": wo_total,
            "wrs_last_30d": wr_last30,
            "wos_last_30d": wo_last30,
            "avg_wrs_per_day_30d": round(wr_last30 / 30.0, 1),
            "avg_wos_per_day_30d": round(wo_last30 / 30.0, 1),
        },
        "recommended_test_scenarios": [
            {"scenario": "burst_creation", "rps": 50, "duration_s": 60, "endpoint": "POST /work-requests/"},
            {"scenario": "concurrent_dashboard", "users": 100, "endpoint": "GET /analytics-dash/program-compliance"},
            {"scenario": "ws_burst", "connections": 200, "events_per_min": 1000},
            {"scenario": "bulk_status", "wo_ids_per_call": 50, "concurrent_calls": 10},
            {"scenario": "photo_upload", "images_size_kb": 5000, "concurrent": 20},
        ],
        "metrics_to_track": [
            "p50/p95/p99 latency por endpoint",
            "error rate por status code",
            "memory + CPU del container ocp-backend",
            "tamaño de SQLite + checkpoint frequency",
            "WS heartbeat success rate",
        ],
        "todo": (
            "Implementar suite k6/Locust separada en /tests/load/. Ejecutar contra "
            "ambiente staging (no prod) con BD volcada de prod anonimizada."
        ),
    }


# ─── SF-627 Tareas en paralelo (consolidación) ───────────────────────────────
@router.get("/parallel-duration/{wo_id}")
def parallel_duration(wo_id: str, db: Session = Depends(get_db)):
    """SF-627 NF-22 — Calcula duración total de una OT considerando paralelismo.

    Cada operación tiene `parallel: bool` (default False = secuencial). El total
    es la suma de las duraciones de las secuenciales más el MAX de las paralelas
    agrupadas. Devuelve también el camino crítico.
    """
    wo = db.query(ManagedWorkOrderModel).filter(ManagedWorkOrderModel.wo_id == wo_id).first()
    if not wo:
        return {"error": "WO not found"}
    ops = wo.operations or []
    if not ops:
        return {"wo_id": wo_id, "total_duration_h": 0, "critical_path": [], "ops_count": 0}

    sequential_total = 0.0
    parallel_max = 0.0
    parallel_ops = []
    sequential_ops = []
    for op in ops:
        h = float(op.get("hours") or op.get("duration") or 0)
        if op.get("parallel") is True:
            parallel_ops.append(op)
            parallel_max = max(parallel_max, h)
        else:
            sequential_ops.append(op)
            sequential_total += h

    total = sequential_total + parallel_max
    critical = []
    for op in sequential_ops:
        critical.append({"op": op.get("op_number"), "hours": op.get("hours"), "type": "sequential"})
    if parallel_ops:
        longest = max(parallel_ops, key=lambda o: float(o.get("hours") or 0))
        critical.append({
            "op": longest.get("op_number"),
            "hours": longest.get("hours"),
            "type": "parallel_longest",
            "parallel_with": [o.get("op_number") for o in parallel_ops if o is not longest],
        })

    return {
        "wo_id": wo_id,
        "wo_number": wo.wo_number,
        "ops_count": len(ops),
        "sequential_count": len(sequential_ops),
        "parallel_count": len(parallel_ops),
        "naive_sum_h": round(sequential_total + sum(float(o.get("hours") or 0) for o in parallel_ops), 2),
        "total_duration_h": round(total, 2),
        "critical_path": critical,
        "savings_h": round(sum(float(o.get("hours") or 0) for o in parallel_ops) - parallel_max, 2),
    }
