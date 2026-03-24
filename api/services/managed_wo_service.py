"""Managed Work Orders service — full OT lifecycle (Jorge Phase 2)."""

from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func

from api.database.models import ManagedWorkOrderModel, WorkRequestModel
from api.services.audit_service import log_action


# Valid status transitions
TRANSITIONS = {
    "DRAFT": ["PLANNED"],
    "PLANNED": ["RELEASED", "DRAFT"],
    "RELEASED": ["SCHEDULED", "PLANNED"],
    "SCHEDULED": ["IN_PROGRESS", "RELEASED"],
    "IN_PROGRESS": ["COMPLETED"],
    "COMPLETED": ["CLOSED", "IN_PROGRESS"],
}

WO_TYPES = ("CORRECTIVO", "PREVENTIVO", "PREDICTIVO", "MEJORA", "INCIDENTE_OPERACIONAL", "MONITOREO_CONDICION")


def _generate_wo_number(db: Session) -> str:
    """Auto-generate sequential WO number: OT-YYYY-NNNNN."""
    year = datetime.now().year
    prefix = f"OT-{year}-"
    last = (
        db.query(ManagedWorkOrderModel)
        .filter(ManagedWorkOrderModel.wo_number.like(f"{prefix}%"))
        .order_by(ManagedWorkOrderModel.wo_number.desc())
        .first()
    )
    if last:
        try:
            seq = int(last.wo_number.split("-")[-1]) + 1
        except (ValueError, IndexError):
            seq = 1
    else:
        seq = 1
    return f"{prefix}{seq:05d}"


def _to_dict(wo: ManagedWorkOrderModel) -> dict:
    return {
        "wo_id": wo.wo_id,
        "wo_number": wo.wo_number,
        "work_request_id": wo.work_request_id,
        "plant_id": wo.plant_id,
        "equipment_id": wo.equipment_id,
        "equipment_tag": wo.equipment_tag,
        "description": wo.description,
        "wo_type": wo.wo_type,
        "priority_code": wo.priority_code,
        "work_class": wo.work_class,
        "operations": wo.operations or [],
        "materials": wo.materials or [],
        "tools": wo.tools or [],
        "documents": wo.documents or [],
        "labour_summary": wo.labour_summary or {},
        "planned_start": wo.planned_start.isoformat() if wo.planned_start else None,
        "planned_end": wo.planned_end.isoformat() if wo.planned_end else None,
        "actual_start": wo.actual_start.isoformat() if wo.actual_start else None,
        "actual_end": wo.actual_end.isoformat() if wo.actual_end else None,
        "estimated_hours": wo.estimated_hours,
        "actual_hours": wo.actual_hours,
        "status": wo.status,
        "planned_by": wo.planned_by,
        "released_by": wo.released_by,
        "released_at": wo.released_at.isoformat() if wo.released_at else None,
        "closed_by": wo.closed_by,
        "closed_at": wo.closed_at.isoformat() if wo.closed_at else None,
        "assigned_workers": wo.assigned_workers or [],
        "completion_pct": wo.completion_pct,
        "execution_notes": wo.execution_notes or [],
        "risk_analysis": wo.risk_analysis,
        "budget_approved": wo.budget_approved,
        "budget_amount": wo.budget_amount,
        "labor_cost": wo.labor_cost,
        "material_cost": wo.material_cost,
        "external_cost": wo.external_cost,
        "actual_total_cost": wo.actual_total_cost,
        "is_fast_track": wo.is_fast_track,
        "created_at": wo.created_at.isoformat() if wo.created_at else None,
        "updated_at": wo.updated_at.isoformat() if wo.updated_at else None,
    }


def create_work_order(
    db: Session,
    equipment_tag: str,
    description: str,
    wo_type: str = "CORRECTIVO",
    priority_code: str = "P3",
    plant_id: str = "OCP-JFC1",
    work_request_id: str | None = None,
    planned_by: str | None = None,
    estimated_hours: float = 4.0,
    operations: list | None = None,
    materials: list | None = None,
    tools: list | None = None,
) -> dict:
    """Create a new managed work order (optionally from an approved WR).
    P1/P2 priorities trigger fast track: OT created directly in RELEASED status."""
    wo_number = _generate_wo_number(db)
    work_class = "NO_PROGRAMADO" if priority_code in ("P1", "P2") else "PROGRAMADO"
    is_fast_track = priority_code in ("P1", "P2")

    # Auto-estimate budget from hours (default labor rate $50/hr)
    LABOR_RATE = 50.0
    auto_budget = round(estimated_hours * LABOR_RATE, 2)

    wo = ManagedWorkOrderModel(
        wo_number=wo_number,
        work_request_id=work_request_id,
        plant_id=plant_id,
        equipment_id=equipment_tag,
        equipment_tag=equipment_tag,
        description=description,
        wo_type=wo_type,
        priority_code=priority_code,
        work_class=work_class,
        planned_by=planned_by,
        estimated_hours=estimated_hours,
        budget_amount=auto_budget,
        operations=operations or [],
        materials=materials or [],
        tools=tools or [],
        is_fast_track=is_fast_track,
    )

    # Fast track: P1/P2 skip planning → go directly to RELEASED
    if is_fast_track:
        wo.status = "RELEASED"
        wo.released_by = planned_by
        wo.released_at = datetime.now()
        wo.execution_notes = [{
            "timestamp": datetime.now().isoformat(),
            "user": planned_by or "system",
            "note": f"[FAST TRACK] OT creada directamente en RELEASED por prioridad {priority_code}",
        }]

    db.add(wo)
    log_action(db, "managed_work_order", wo.wo_id, "CREATE")
    if is_fast_track:
        log_action(db, "managed_work_order", wo.wo_id, "FAST_TRACK_RELEASED")
    db.commit()
    db.refresh(wo)
    return _to_dict(wo)


def create_from_work_request(db: Session, request_id: str, planned_by: str = "") -> dict | None:
    """Create a WO from an approved WR — copies equipment, priority, description."""
    wr = db.query(WorkRequestModel).filter(WorkRequestModel.request_id == request_id).first()
    if not wr:
        return None
    if wr.status not in ("VALIDATED", "APPROVED", "ASSIGNED"):
        return None

    ai = wr.ai_classification if isinstance(wr.ai_classification, dict) else {}
    pd = wr.problem_description if isinstance(wr.problem_description, dict) else {}
    desc_text = pd.get("original_text", "") if isinstance(pd, dict) else str(wr.problem_description or "")

    return create_work_order(
        db=db,
        equipment_tag=wr.equipment_tag,
        description=desc_text,
        wo_type="CORRECTIVO",
        priority_code=wr.priority_code or "P3",
        plant_id=ai.get("plant_id", "OCP-JFC1"),
        work_request_id=request_id,
        planned_by=planned_by,
        estimated_hours=ai.get("estimated_duration_hours", 4.0) or 4.0,
        materials=pd.get("materials", []) if isinstance(pd, dict) else [],
    )


def get_work_order(db: Session, wo_id: str) -> dict | None:
    wo = db.query(ManagedWorkOrderModel).filter(ManagedWorkOrderModel.wo_id == wo_id).first()
    return _to_dict(wo) if wo else None


def list_work_orders(
    db: Session,
    status: str | None = None,
    plant_id: str | None = None,
    wo_type: str | None = None,
    priority: str | None = None,
    limit: int = 200,
    offset: int = 0,
    fast_track: bool | None = None,
) -> list[dict]:
    q = db.query(ManagedWorkOrderModel)
    if status:
        q = q.filter(ManagedWorkOrderModel.status == status)
    if plant_id:
        q = q.filter(ManagedWorkOrderModel.plant_id == plant_id)
    if wo_type:
        q = q.filter(ManagedWorkOrderModel.wo_type == wo_type)
    if priority:
        q = q.filter(ManagedWorkOrderModel.priority_code == priority)
    if fast_track is not None:
        q = q.filter(ManagedWorkOrderModel.is_fast_track == fast_track)
    items = q.order_by(ManagedWorkOrderModel.created_at.desc()).offset(offset).limit(limit).all()
    return [_to_dict(wo) for wo in items]


def update_work_order(db: Session, wo_id: str, data: dict) -> dict | None:
    """Update planning fields on a WO (before execution starts)."""
    wo = db.query(ManagedWorkOrderModel).filter(ManagedWorkOrderModel.wo_id == wo_id).first()
    if not wo:
        return None
    if wo.status not in ("DRAFT", "PLANNED", "RELEASED", "SCHEDULED"):
        return None

    updatable = [
        "description", "wo_type", "priority_code", "estimated_hours",
        "operations", "materials", "tools", "documents", "labour_summary",
        "planned_start", "planned_end", "risk_analysis", "budget_amount", "budget_approved",
        "labor_cost", "material_cost", "external_cost", "actual_total_cost", "actual_hours",
    ]
    for key in updatable:
        if key in data:
            val = data[key]
            if key in ("planned_start", "planned_end") and isinstance(val, str):
                try:
                    val = datetime.fromisoformat(val)
                except ValueError:
                    continue
            setattr(wo, key, val)

    if "priority_code" in data:
        wo.work_class = "NO_PROGRAMADO" if data["priority_code"] in ("P1", "P2") else "PROGRAMADO"

    wo.updated_at = datetime.now()
    log_action(db, "managed_work_order", wo_id, "UPDATE")
    db.commit()
    db.refresh(wo)
    return _to_dict(wo)


def _transition(db: Session, wo_id: str, target_status: str, user_id: str = "", **kwargs) -> dict | None:
    """Generic status transition with validation."""
    wo = db.query(ManagedWorkOrderModel).filter(ManagedWorkOrderModel.wo_id == wo_id).first()
    if not wo:
        return None
    allowed = TRANSITIONS.get(wo.status, [])
    if target_status not in allowed:
        return None

    wo.status = target_status
    wo.updated_at = datetime.now()

    if target_status == "RELEASED":
        wo.released_by = user_id
        wo.released_at = datetime.now()
    elif target_status == "IN_PROGRESS":
        wo.actual_start = wo.actual_start or datetime.now()
    elif target_status == "COMPLETED":
        wo.actual_end = datetime.now()
        wo.completion_pct = 100.0
        if "actual_hours" in kwargs:
            wo.actual_hours = kwargs["actual_hours"]
    elif target_status == "CLOSED":
        wo.closed_by = user_id
        wo.closed_at = datetime.now()

    # Extra kwargs
    if "assigned_workers" in kwargs:
        wo.assigned_workers = kwargs["assigned_workers"]

    log_action(db, "managed_work_order", wo_id, target_status)
    db.commit()
    db.refresh(wo)
    return _to_dict(wo)


def plan_wo(db: Session, wo_id: str, user_id: str = "") -> dict | None:
    return _transition(db, wo_id, "PLANNED", user_id)


def release_wo(db: Session, wo_id: str, user_id: str = "") -> dict | None:
    return _transition(db, wo_id, "RELEASED", user_id)


def schedule_wo(db: Session, wo_id: str, user_id: str = "", assigned_workers: list | None = None) -> dict | None:
    return _transition(db, wo_id, "SCHEDULED", user_id, assigned_workers=assigned_workers)


def start_wo(db: Session, wo_id: str, user_id: str = "") -> dict | None:
    return _transition(db, wo_id, "IN_PROGRESS", user_id)


def complete_wo(db: Session, wo_id: str, user_id: str = "", actual_hours: float = 0) -> dict | None:
    return _transition(db, wo_id, "COMPLETED", user_id, actual_hours=actual_hours)


def close_wo(db: Session, wo_id: str, user_id: str = "") -> dict | None:
    return _transition(db, wo_id, "CLOSED", user_id)


def add_note(db: Session, wo_id: str, user_id: str, note: str) -> dict | None:
    wo = db.query(ManagedWorkOrderModel).filter(ManagedWorkOrderModel.wo_id == wo_id).first()
    if not wo:
        return None
    notes = list(wo.execution_notes or [])
    notes.append({"timestamp": datetime.now().isoformat(), "user": user_id, "note": note})
    wo.execution_notes = notes
    wo.updated_at = datetime.now()
    db.commit()
    db.refresh(wo)
    return _to_dict(wo)


def update_progress(db: Session, wo_id: str, pct: float) -> dict | None:
    wo = db.query(ManagedWorkOrderModel).filter(ManagedWorkOrderModel.wo_id == wo_id).first()
    if not wo or wo.status != "IN_PROGRESS":
        return None
    wo.completion_pct = min(max(pct, 0), 100)
    wo.updated_at = datetime.now()
    db.commit()
    db.refresh(wo)
    return _to_dict(wo)


def get_stats(db: Session, plant_id: str | None = None) -> dict:
    """Summary stats for dashboard KPIs."""
    q = db.query(ManagedWorkOrderModel)
    if plant_id:
        q = q.filter(ManagedWorkOrderModel.plant_id == plant_id)
    all_wos = q.all()
    by_status = {}
    by_type = {}
    total_estimated = 0.0
    total_actual = 0.0
    for wo in all_wos:
        by_status[wo.status] = by_status.get(wo.status, 0) + 1
        by_type[wo.wo_type] = by_type.get(wo.wo_type, 0) + 1
        total_estimated += wo.estimated_hours or 0
        total_actual += wo.actual_hours or 0
    return {
        "total": len(all_wos),
        "by_status": by_status,
        "by_type": by_type,
        "total_estimated_hours": round(total_estimated, 1),
        "total_actual_hours": round(total_actual, 1),
    }
