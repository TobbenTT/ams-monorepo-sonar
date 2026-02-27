"""Scheduling service — manages weekly programs and Gantt exports."""

import os
import tempfile
from datetime import datetime

from sqlalchemy.orm import Session

from api.database.models import (
    BacklogItemModel, WeeklyProgramModel,
    WorkforceModel, ShutdownCalendarModel,
)
from api.services.audit_service import log_action
from tools.engines.scheduling_engine import SchedulingEngine
from tools.processors.gantt_generator import GanttGenerator
from tools.processors.backlog_optimizer import BacklogOptimizer, _to_backlog_entries
from tools.engines.backlog_grouper import BacklogGrouper
from tools.models.schemas import (
    BacklogItem, Priority, BacklogWOType, BacklogStatus,
    BacklogWorkPackage, ShiftType, MaterialsReadyStatus,
    WeeklyProgram, WeeklyProgramStatus,
)


def create_program(
    db: Session,
    plant_id: str,
    week_number: int,
    year: int,
) -> dict:
    """Create a DRAFT weekly program from current backlog."""
    db_items = db.query(BacklogItemModel).all()
    items = [_to_schema_item(i) for i in db_items]

    schedulable = [i for i in items if i.materials_ready and not i.shutdown_required]

    entries = _to_backlog_entries(schedulable)
    groups = BacklogGrouper.find_all_groups(entries)

    from datetime import date, timedelta
    period_start = date.today()
    work_packages = []
    for i, group in enumerate(groups):
        pkg_date = period_start + timedelta(days=1 + i)
        work_packages.append(BacklogWorkPackage(
            package_id=group.group_id,
            name=group.name,
            grouped_items=[e.backlog_id for e in group.items],
            reason_for_grouping=group.reason,
            scheduled_date=pkg_date,
            scheduled_shift=ShiftType.MORNING if i % 2 == 0 else ShiftType.AFTERNOON,
            total_duration_hours=group.total_hours,
            assigned_team=list(group.specialties),
            materials_status=MaterialsReadyStatus.READY,
        ))

    # Add ungrouped items
    grouped_ids = {e.backlog_id for g in groups for e in g.items}
    ungrouped = [i for i in schedulable if i.backlog_id not in grouped_ids]
    for i, item in enumerate(ungrouped):
        work_packages.append(BacklogWorkPackage(
            package_id=f"WP-IND-{item.backlog_id[:8]}",
            name=f"Individual: {item.equipment_tag}",
            grouped_items=[item.backlog_id],
            reason_for_grouping="Individual item",
            scheduled_date=period_start + timedelta(days=1 + len(groups) + i // 2),
            scheduled_shift=ShiftType.MORNING,
            total_duration_hours=item.estimated_duration_hours,
            assigned_team=item.required_specialties,
            materials_status=MaterialsReadyStatus.READY,
        ))

    program = SchedulingEngine.create_weekly_program(plant_id, week_number, year, work_packages)

    # Load workforce and level resources
    workforce = [
        {"worker_id": w.worker_id, "specialty": w.specialty, "shift": w.shift, "available": w.available}
        for w in db.query(WorkforceModel).filter(WorkforceModel.plant_id == plant_id).all()
    ]
    program = SchedulingEngine.level_resources(program, workforce)

    # Assign support tasks
    pkg_attrs = [
        {
            "package_id": p.get("package_id", ""),
            "shutdown_required": False,
            "specialties": p.get("assigned_team", []),
            "total_hours": p.get("total_duration_hours", 0.0),
        }
        for p in program.work_packages
    ]
    program = SchedulingEngine.assign_support_tasks(program, pkg_attrs)

    # Detect conflicts
    SchedulingEngine.detect_conflicts(program)

    # Persist
    model = WeeklyProgramModel(
        program_id=program.program_id,
        plant_id=plant_id,
        week_number=week_number,
        year=year,
        status=program.status.value,
        work_packages=[p for p in program.work_packages],
        total_hours=program.total_hours,
        resource_slots=[s.model_dump(mode="json") for s in program.resource_slots],
        conflicts=[c.model_dump(mode="json") for c in program.conflicts],
        support_tasks=[t.model_dump(mode="json") for t in program.support_tasks],
        created_at=datetime.now(),
    )
    db.add(model)
    log_action(db, "weekly_program", model.program_id, "CREATE")
    db.commit()
    db.refresh(model)

    return _program_to_dict(model)


def get_program(db: Session, program_id: str) -> WeeklyProgramModel | None:
    return db.query(WeeklyProgramModel).filter(
        WeeklyProgramModel.program_id == program_id
    ).first()


def list_programs(
    db: Session,
    plant_id: str | None = None,
    status: str | None = None,
) -> list[dict]:
    q = db.query(WeeklyProgramModel)
    if plant_id:
        q = q.filter(WeeklyProgramModel.plant_id == plant_id)
    if status:
        q = q.filter(WeeklyProgramModel.status == status)
    return [_program_to_dict(p) for p in q.order_by(WeeklyProgramModel.created_at.desc()).all()]


def finalize_program(db: Session, program_id: str) -> dict | None:
    model = get_program(db, program_id)
    if not model:
        return None

    program = _model_to_schema(model)
    program, msg = SchedulingEngine.finalize_program(program)

    if program.status == WeeklyProgramStatus.FINAL:
        model.status = program.status.value
        model.finalized_at = program.finalized_at
        log_action(db, "weekly_program", program_id, "FINALIZE")
        db.commit()
        db.refresh(model)

    return {"program_id": program_id, "status": model.status, "message": msg}


def activate_program(db: Session, program_id: str) -> dict | None:
    model = get_program(db, program_id)
    if not model:
        return None

    program = _model_to_schema(model)
    program, msg = SchedulingEngine.activate_program(program)

    if program.status == WeeklyProgramStatus.ACTIVE:
        model.status = program.status.value
        log_action(db, "weekly_program", program_id, "ACTIVATE")
        db.commit()
        db.refresh(model)

    return {"program_id": program_id, "status": model.status, "message": msg}


def complete_program(db: Session, program_id: str) -> dict | None:
    model = get_program(db, program_id)
    if not model:
        return None

    program = _model_to_schema(model)
    program, msg = SchedulingEngine.complete_program(program)

    if program.status == WeeklyProgramStatus.COMPLETED:
        model.status = program.status.value
        log_action(db, "weekly_program", program_id, "COMPLETE")
        db.commit()
        db.refresh(model)

    return {"program_id": program_id, "status": model.status, "message": msg}


def get_gantt(db: Session, program_id: str) -> list[dict] | None:
    model = get_program(db, program_id)
    if not model:
        return None

    program = _model_to_schema(model)
    rows = GanttGenerator.generate_gantt_data(program)
    return [r.model_dump(mode="json") for r in rows]


def export_gantt_excel(db: Session, program_id: str) -> str | None:
    model = get_program(db, program_id)
    if not model:
        return None

    program = _model_to_schema(model)
    rows = GanttGenerator.generate_gantt_data(program)

    tmp = tempfile.NamedTemporaryFile(suffix=".xlsx", prefix="gantt_", delete=False)
    tmp.close()
    GanttGenerator.export_gantt_excel(rows, tmp.name)
    return tmp.name


def _model_to_schema(model: WeeklyProgramModel) -> WeeklyProgram:
    return WeeklyProgram(
        program_id=model.program_id,
        plant_id=model.plant_id,
        week_number=model.week_number,
        year=model.year,
        status=WeeklyProgramStatus(model.status),
        work_packages=model.work_packages or [],
        total_hours=model.total_hours,
        resource_slots=[],
        conflicts=[],
        support_tasks=[],
        created_at=model.created_at,
        finalized_at=model.finalized_at,
    )


def _to_schema_item(item: BacklogItemModel) -> BacklogItem:
    from datetime import date
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


def _program_to_dict(model: WeeklyProgramModel) -> dict:
    return {
        "program_id": model.program_id,
        "plant_id": model.plant_id,
        "week_number": model.week_number,
        "year": model.year,
        "status": model.status,
        "total_hours": model.total_hours,
        "work_packages_count": len(model.work_packages) if model.work_packages else 0,
        "conflicts_count": len(model.conflicts) if model.conflicts else 0,
        "support_tasks_count": len(model.support_tasks) if model.support_tasks else 0,
        "created_at": model.created_at.isoformat() if model.created_at else None,
        "finalized_at": model.finalized_at.isoformat() if model.finalized_at else None,
    }
