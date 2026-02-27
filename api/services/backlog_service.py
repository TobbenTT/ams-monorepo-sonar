"""Backlog service — manages backlog items and optimisation."""

from datetime import datetime, date
from sqlalchemy.orm import Session

from api.database.models import (
    BacklogItemModel, WorkRequestModel, OptimizedBacklogModel,
    WorkforceModel, ShutdownCalendarModel,
)
from api.services.audit_service import log_action
from tools.processors.backlog_optimizer import BacklogOptimizer
from tools.models.schemas import BacklogItem, Priority, BacklogWOType, BacklogStatus


def add_to_backlog(db: Session, work_request_id: str) -> dict | None:
    """Create a backlog item from a validated work request."""
    wr = db.query(WorkRequestModel).filter(
        WorkRequestModel.request_id == work_request_id
    ).first()
    if not wr:
        return None

    ai = wr.ai_classification or {}
    priority = ai.get("priority_suggested", "3_NORMAL")
    wo_type = _map_wo_type(ai.get("work_order_type", "PM01_INSPECTION"))

    item = BacklogItemModel(
        work_request_id=work_request_id,
        equipment_id=wr.equipment_id,
        equipment_tag=wr.equipment_tag,
        priority=priority,
        wo_type=wo_type,
        status="AWAITING_APPROVAL",
        estimated_hours=ai.get("estimated_duration_hours", 4.0),
        specialties=ai.get("required_specialties", ["MECHANICAL"]),
        materials_ready=True,
        shutdown_required=False,
        age_days=0,
        created_at=datetime.now(),
    )
    db.add(item)
    log_action(db, "backlog_item", item.backlog_id, "CREATE")
    db.commit()
    db.refresh(item)

    return _item_to_dict(item)


def list_backlog(
    db: Session,
    status: str | None = None,
    priority: str | None = None,
    equipment_tag: str | None = None,
    limit: int = 200,
    offset: int = 0,
) -> list[dict]:
    q = db.query(BacklogItemModel)
    if status:
        q = q.filter(BacklogItemModel.status == status)
    if priority:
        q = q.filter(BacklogItemModel.priority == priority)
    if equipment_tag:
        q = q.filter(BacklogItemModel.equipment_tag == equipment_tag)
    items = q.order_by(BacklogItemModel.created_at.desc()).offset(offset).limit(limit).all()
    return [_item_to_dict(i) for i in items]


def optimize_backlog(db: Session, plant_id: str, period_days: int = 30) -> dict:
    """Run backlog optimisation for a plant."""
    # Load all backlog items
    db_items = db.query(BacklogItemModel).all()

    # Convert to schema objects
    items = [_to_schema_item(i) for i in db_items]

    # Load workforce and shutdowns
    workforce = [
        {"worker_id": w.worker_id, "specialty": w.specialty, "shift": w.shift, "available": w.available}
        for w in db.query(WorkforceModel).filter(WorkforceModel.plant_id == plant_id).all()
    ]
    shutdowns = [
        {
            "shutdown_id": s.shutdown_id, "start_date": s.start_date.isoformat(),
            "end_date": s.end_date.isoformat(), "type": s.shutdown_type,
            "areas": s.areas or [], "description": s.description,
        }
        for s in db.query(ShutdownCalendarModel).filter(ShutdownCalendarModel.plant_id == plant_id).all()
    ]

    # Optimise
    result = BacklogOptimizer.optimize(items, workforce, shutdowns, period_days)

    # Persist
    opt_model = OptimizedBacklogModel(
        optimization_id=result.optimization_id,
        plant_id=plant_id,
        period_start=result.period_start,
        period_end=result.period_end,
        total_items=result.total_backlog_items,
        stratification=result.stratification.model_dump(mode="json"),
        work_packages=[wp.model_dump(mode="json") for wp in result.work_packages],
        schedule=[se.model_dump(mode="json") for se in result.schedule_proposal],
        alerts=[a.model_dump(mode="json") for a in result.alerts],
        status="DRAFT",
        generated_at=datetime.now(),
    )
    db.add(opt_model)
    log_action(db, "optimized_backlog", opt_model.optimization_id, "CREATE")
    db.commit()

    return {
        "optimization_id": result.optimization_id,
        "total_items": result.total_backlog_items,
        "schedulable_now": result.items_schedulable_now,
        "blocked": result.items_blocked,
        "work_packages": len(result.work_packages),
        "schedule_entries": len(result.schedule_proposal),
        "alerts": len(result.alerts),
        "stratification": result.stratification.model_dump(mode="json"),
    }


def get_optimization(db: Session, optimization_id: str) -> OptimizedBacklogModel | None:
    return db.query(OptimizedBacklogModel).filter(
        OptimizedBacklogModel.optimization_id == optimization_id
    ).first()


def approve_schedule(db: Session, optimization_id: str) -> dict | None:
    opt = get_optimization(db, optimization_id)
    if not opt:
        return None

    opt.status = "APPROVED"
    log_action(db, "optimized_backlog", optimization_id, "APPROVE")
    db.commit()
    db.refresh(opt)

    return {
        "optimization_id": opt.optimization_id,
        "status": opt.status,
        "total_items": opt.total_items,
    }


def get_schedule(db: Session) -> dict | None:
    """Get the latest approved or draft optimisation."""
    opt = db.query(OptimizedBacklogModel).order_by(
        OptimizedBacklogModel.generated_at.desc()
    ).first()
    if not opt:
        return None
    return {
        "optimization_id": opt.optimization_id,
        "status": opt.status,
        "period_start": opt.period_start.isoformat() if opt.period_start else None,
        "period_end": opt.period_end.isoformat() if opt.period_end else None,
        "total_items": opt.total_items,
        "work_packages": opt.work_packages,
        "schedule": opt.schedule,
        "alerts": opt.alerts,
    }


def _map_wo_type(wo_type: str) -> str:
    mapping = {"PM01_INSPECTION": "PM01", "PM02_PREVENTIVE": "PM02", "PM03_CORRECTIVE": "PM03"}
    return mapping.get(wo_type, "PM01")


def _to_schema_item(item: BacklogItemModel) -> BacklogItem:
    return BacklogItem(
        backlog_id=item.backlog_id,
        work_request_id=item.work_request_id or "",
        equipment_id=item.equipment_id,
        equipment_tag=item.equipment_tag,
        priority=Priority(item.priority) if item.priority in [e.value for e in Priority] else Priority.NORMAL,
        work_order_type=BacklogWOType(item.wo_type) if item.wo_type in [e.value for e in BacklogWOType] else BacklogWOType.PM01,
        created_date=item.created_at.date() if item.created_at else date.today(),
        age_days=item.age_days,
        status=BacklogStatus(item.status) if item.status in [e.value for e in BacklogStatus] else BacklogStatus.AWAITING_APPROVAL,
        blocking_reason=item.blocking_reason,
        estimated_duration_hours=item.estimated_hours,
        required_specialties=item.specialties or ["MECHANICAL"],
        materials_ready=item.materials_ready,
        shutdown_required=item.shutdown_required,
    )


def _item_to_dict(item: BacklogItemModel) -> dict:
    return {
        "backlog_id": item.backlog_id,
        "work_request_id": item.work_request_id,
        "equipment_id": item.equipment_id,
        "equipment_tag": item.equipment_tag,
        "priority": item.priority,
        "wo_type": item.wo_type,
        "status": item.status,
        "blocking_reason": item.blocking_reason,
        "estimated_hours": item.estimated_hours,
        "specialties": item.specialties,
        "materials_ready": item.materials_ready,
        "shutdown_required": item.shutdown_required,
        "age_days": item.age_days,
    }
