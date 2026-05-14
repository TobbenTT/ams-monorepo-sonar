"""Task service — maintenance task CRUD and naming validation."""

from sqlalchemy.orm import Session

from api.database.models import MaintenanceTaskModel
from api.services.audit_service import log_action
from tools.validators.naming_validator import NamingValidator


def create_task(db: Session, data: dict) -> MaintenanceTaskModel:
    obj = MaintenanceTaskModel(**data)
    db.add(obj)
    log_action(db, "maintenance_task", obj.task_id, "CREATE")
    db.commit()
    db.refresh(obj)
    return obj


def get_task(db: Session, task_id: str) -> MaintenanceTaskModel | None:
    return db.query(MaintenanceTaskModel).filter(MaintenanceTaskModel.task_id == task_id).first()


def list_tasks(db: Session, failure_mode_id: str | None = None, status: str | None = None) -> list[MaintenanceTaskModel]:
    q = db.query(MaintenanceTaskModel)
    if failure_mode_id:
        q = q.filter(MaintenanceTaskModel.failure_mode_id == failure_mode_id)
    if status:
        q = q.filter(MaintenanceTaskModel.status == status)
    return q.all()


def link_task_to_fm(db: Session, task_id: str, failure_mode_id: str) -> MaintenanceTaskModel | None:
    obj = get_task(db, task_id)
    if not obj:
        return None
    obj.failure_mode_id = failure_mode_id
    log_action(db, "maintenance_task", task_id, "UPDATE", {"failure_mode_id": failure_mode_id})
    db.commit()
    db.refresh(obj)
    return obj


def validate_task_name(name: str, task_type: str = "") -> dict:
    issues = NamingValidator.validate_task_name(name, task_type)
    return {"name": name, "valid": len(issues) == 0, "issues": issues}


def validate_wp_name(name: str) -> dict:
    issues = NamingValidator.validate_wp_name(name)
    return {"name": name, "valid": len(issues) == 0, "issues": issues}
