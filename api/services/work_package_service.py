"""Work package service — grouping, CRUD, approval."""

from sqlalchemy.orm import Session

from api.database.models import WorkPackageModel
from api.services.audit_service import log_action
from tools.engines.backlog_grouper import BacklogGrouper, BacklogEntry
from tools.engines.work_instruction_generator import WorkInstructionGenerator


def create_work_package(db: Session, data: dict) -> WorkPackageModel:
    obj = WorkPackageModel(**data)
    db.add(obj)
    log_action(db, "work_package", obj.work_package_id, "CREATE")
    db.commit()
    db.refresh(obj)
    return obj


def get_work_package(db: Session, wp_id: str) -> WorkPackageModel | None:
    return db.query(WorkPackageModel).filter(WorkPackageModel.work_package_id == wp_id).first()


def list_work_packages(db: Session, node_id: str | None = None, status: str | None = None) -> list[WorkPackageModel]:
    q = db.query(WorkPackageModel)
    if node_id:
        q = q.filter(WorkPackageModel.node_id == node_id)
    if status:
        q = q.filter(WorkPackageModel.status == status)
    return q.all()


def approve_work_package(db: Session, wp_id: str) -> WorkPackageModel | None:
    obj = get_work_package(db, wp_id)
    if not obj:
        return None
    if obj.status not in ("DRAFT", "REVIEWED"):
        return None
    obj.status = "APPROVED"
    log_action(db, "work_package", wp_id, "APPROVE")
    db.commit()
    db.refresh(obj)
    return obj


def group_tasks(items: list[dict]) -> list[dict]:
    entries = [BacklogEntry(**item) for item in items]
    groups = BacklogGrouper.find_all_groups(entries)
    return [
        {
            "group_id": g.group_id,
            "name": g.name,
            "reason": g.reason,
            "items": g.items,
            "total_hours": g.total_hours,
            "specialties": g.specialties,
            "requires_shutdown": g.requires_shutdown,
        }
        for g in groups
    ]


def generate_work_instruction(wp_name: str, wp_code: str, equipment_name: str, equipment_tag: str, frequency: str, constraint: str, tasks: list[dict]) -> dict:
    wi = WorkInstructionGenerator.generate(
        wp_name=wp_name,
        wp_code=wp_code,
        equipment_name=equipment_name,
        equipment_tag=equipment_tag,
        frequency=frequency,
        constraint=constraint,
        tasks=tasks,
    )
    return {
        "wp_name": wi.wp_name,
        "wp_code": wi.wp_code,
        "revision": wi.revision,
        "operations": [{"operation_number": op.operation_number, "trade": op.trade, "description": op.description, "duration_hours": op.duration_hours} for op in wi.operations],
        "resources": {"total_duration_hours": wi.resources.total_duration_hours, "trades_required": wi.resources.trades_required},
    }
