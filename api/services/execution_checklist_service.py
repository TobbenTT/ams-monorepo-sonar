"""Execution checklist service — CRUD + engine delegation (GAP-W06)."""

from sqlalchemy.orm import Session

from api.database.models import ExecutionChecklistModel
from api.services.audit_service import log_action
from tools.engines.execution_checklist_engine import ExecutionChecklistEngine
from tools.models.schemas import ExecutionChecklist


def _checklist_to_dict(obj: ExecutionChecklistModel) -> dict:
    """Convert ORM model to API response dict."""
    return {
        "checklist_id": obj.checklist_id,
        "work_package_id": obj.work_package_id,
        "work_package_name": obj.work_package_name,
        "work_package_code": obj.work_package_code,
        "equipment_tag": obj.equipment_tag,
        "equipment_name": obj.equipment_name,
        "steps": obj.steps or [],
        "safety_section": obj.safety_section or [],
        "pre_task_notes": obj.pre_task_notes,
        "post_task_notes": obj.post_task_notes,
        "status": obj.status,
        "assigned_to": obj.assigned_to,
        "supervisor": obj.supervisor,
        "supervisor_signature": obj.supervisor_signature,
        "closure_summary": obj.closure_summary,
        "created_at": str(obj.created_at) if obj.created_at else None,
        "started_at": str(obj.started_at) if obj.started_at else None,
        "completed_at": str(obj.completed_at) if obj.completed_at else None,
        "closed_at": str(obj.closed_at) if obj.closed_at else None,
    }


def _pydantic_to_orm_fields(checklist: ExecutionChecklist) -> dict:
    """Extract ORM-compatible fields from Pydantic model."""
    dumped = checklist.model_dump()
    return {
        "checklist_id": dumped["checklist_id"],
        "work_package_id": dumped["work_package_id"],
        "work_package_name": dumped["work_package_name"],
        "work_package_code": dumped["work_package_code"],
        "equipment_tag": dumped["equipment_tag"],
        "equipment_name": dumped["equipment_name"],
        "steps": [
            {k: (str(v) if hasattr(v, "isoformat") else v) for k, v in s.items()}
            for s in dumped["steps"]
        ],
        "safety_section": dumped["safety_section"],
        "pre_task_notes": dumped["pre_task_notes"],
        "post_task_notes": dumped["post_task_notes"],
        "status": dumped["status"],
        "assigned_to": dumped["assigned_to"],
        "supervisor": dumped["supervisor"],
        "supervisor_signature": dumped["supervisor_signature"],
        "closure_summary": dumped.get("closure_summary"),
        "created_at": checklist.created_at,
        "started_at": checklist.started_at,
        "completed_at": checklist.completed_at,
        "closed_at": checklist.closed_at,
    }


def generate_checklist(
    db: Session,
    work_package: dict,
    tasks: list[dict],
    equipment_name: str = "",
    equipment_tag: str = "",
) -> dict:
    """Generate a checklist from a work package and persist it."""
    checklist = ExecutionChecklistEngine.generate_checklist(
        work_package=work_package,
        tasks=tasks,
        equipment_name=equipment_name,
        equipment_tag=equipment_tag,
    )
    fields = _pydantic_to_orm_fields(checklist)
    obj = ExecutionChecklistModel(**fields)
    db.add(obj)
    log_action(db, "execution_checklist", obj.checklist_id, "CREATE")
    db.commit()
    db.refresh(obj)
    return _checklist_to_dict(obj)


def get_checklist(db: Session, checklist_id: str) -> dict | None:
    obj = db.query(ExecutionChecklistModel).filter(
        ExecutionChecklistModel.checklist_id == checklist_id
    ).first()
    if not obj:
        return None
    return _checklist_to_dict(obj)


def list_checklists(
    db: Session,
    work_package_id: str | None = None,
    status: str | None = None,
    assigned_to: str | None = None,
) -> list[dict]:
    q = db.query(ExecutionChecklistModel)
    if work_package_id:
        q = q.filter(ExecutionChecklistModel.work_package_id == work_package_id)
    if status:
        q = q.filter(ExecutionChecklistModel.status == status)
    if assigned_to:
        q = q.filter(ExecutionChecklistModel.assigned_to == assigned_to)
    return [_checklist_to_dict(obj) for obj in q.all()]


def _reload_checklist(db: Session, checklist_id: str) -> tuple[ExecutionChecklistModel, ExecutionChecklist]:
    """Load ORM model and reconstruct Pydantic model."""
    obj = db.query(ExecutionChecklistModel).filter(
        ExecutionChecklistModel.checklist_id == checklist_id
    ).first()
    if not obj:
        raise ValueError(f"Checklist {checklist_id} not found")
    pydantic_cl = ExecutionChecklist(**_checklist_to_dict(obj))
    return obj, pydantic_cl


def _save_pydantic_to_orm(db: Session, obj: ExecutionChecklistModel, checklist: ExecutionChecklist) -> dict:
    """Persist Pydantic model changes back to ORM."""
    fields = _pydantic_to_orm_fields(checklist)
    for key, value in fields.items():
        if key != "checklist_id":
            setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return _checklist_to_dict(obj)


def complete_step(
    db: Session,
    checklist_id: str,
    step_id: str,
    observation: dict | None = None,
    completed_by: str = "",
) -> dict:
    """Complete a step with gate validation."""
    obj, checklist = _reload_checklist(db, checklist_id)
    updated = ExecutionChecklistEngine.complete_step(
        checklist=checklist,
        step_id=step_id,
        observation=observation,
        completed_by=completed_by,
    )
    log_action(db, "execution_checklist", checklist_id, "UPDATE")
    return _save_pydantic_to_orm(db, obj, updated)


def skip_step(
    db: Session,
    checklist_id: str,
    step_id: str,
    reason: str = "",
    authorized_by: str = "",
) -> dict:
    """Skip a non-gate step."""
    obj, checklist = _reload_checklist(db, checklist_id)
    updated = ExecutionChecklistEngine.skip_step(
        checklist=checklist,
        step_id=step_id,
        reason=reason,
        authorized_by=authorized_by,
    )
    log_action(db, "execution_checklist", checklist_id, "UPDATE")
    return _save_pydantic_to_orm(db, obj, updated)


def get_next_steps(db: Session, checklist_id: str) -> list[dict]:
    """Get next actionable steps."""
    _, checklist = _reload_checklist(db, checklist_id)
    steps = ExecutionChecklistEngine.get_next_actionable_steps(checklist)
    return [
        {"step_id": s.step_id, "step_number": s.step_number, "description": s.description}
        for s in steps
    ]


def close_checklist(
    db: Session,
    checklist_id: str,
    supervisor: str,
    supervisor_notes: str = "",
) -> dict:
    """Supervisor closes a completed checklist."""
    obj, checklist = _reload_checklist(db, checklist_id)
    updated = ExecutionChecklistEngine.close_checklist(
        checklist=checklist,
        supervisor=supervisor,
        supervisor_notes=supervisor_notes,
    )
    log_action(db, "execution_checklist", checklist_id, "APPROVE")
    return _save_pydantic_to_orm(db, obj, updated)
