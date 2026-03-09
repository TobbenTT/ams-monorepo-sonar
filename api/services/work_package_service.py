"""Work package service — grouping, CRUD, approval."""

from uuid import uuid4

from sqlalchemy.orm import Session

from api.database.models import MaintenanceTaskModel, WorkPackageModel
from api.services.audit_service import log_action
from tools.engines.backlog_grouper import BacklogGrouper, BacklogEntry
from tools.engines.work_instruction_generator import WorkInstructionGenerator


def create_work_package(db: Session, data: dict) -> WorkPackageModel:
    task_ids = data.pop("task_ids", None)

    # If task_ids provided, build WP from tasks (frontend FMEA flow)
    if task_ids:
        tasks = db.query(MaintenanceTaskModel).filter(
            MaintenanceTaskModel.task_id.in_(task_ids),
        ).all()

        # Derive WP fields from aggregated tasks
        first = tasks[0] if tasks else None
        origin_parts = (first.origin or "").split("|") if first else []
        equip_tag = origin_parts[0] if len(origin_parts) >= 1 else ""
        node_id = origin_parts[1] if len(origin_parts) >= 2 else ""

        wp_name = data.get("name", f"WP-{uuid4().hex[:6].upper()}")
        wp_code = f"WP-{uuid4().hex[:8].upper()}"

        allocated = []
        total_hours = 0.0
        for tk in tasks:
            labour = tk.labour_resources or []
            hours = sum(r.get("hours", 0) for r in labour if isinstance(r, dict)) if labour else 1.0
            total_hours += hours
            allocated.append({
                "task_id": tk.task_id,
                "name": tk.name,
                "task_type": tk.task_type,
                "hours": hours,
            })

        constraint = first.constraint if first else "ONLINE"
        freq_val = first.frequency_value if first else 30
        freq_unit = first.frequency_unit if first else "DAYS"

        obj = WorkPackageModel(
            work_package_id=f"WPK-{uuid4().hex[:8].upper()}",
            name=wp_name[:40],
            code=wp_code,
            node_id=node_id or "UNKNOWN",
            frequency_value=freq_val,
            frequency_unit=freq_unit,
            constraint=constraint,
            work_package_type="STANDALONE" if len(tasks) == 1 else "SEQUENTIAL",
            allocated_tasks=allocated,
            labour_summary={"total_hours": total_hours, "task_count": len(tasks)},
            status="DRAFT",
        )
    else:
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
