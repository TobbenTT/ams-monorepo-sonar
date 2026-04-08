"""Execution router — Jorge Phase 4: task tracking, handovers, progress."""

import logging
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.database.models import (
    WorkAssignmentModel, EquipmentHandoverModel, ManagedWorkOrderModel,
)
from api.dependencies.auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/execution", tags=["execution"])


# ── Schemas ──────────────────────────────────────────────────────────

class TaskAssignRequest(BaseModel):
    wo_id: str
    assigned_to: str
    task_description: str = ""
    estimated_hours: float = 4.0
    scheduled_date: str | None = None

class ProgressUpdate(BaseModel):
    progress_pct: float = Field(ge=0, le=100)
    note: str = ""

class PartialNotification(BaseModel):
    note: str
    shift_handover_notes: str = ""

class HandoverCreate(BaseModel):
    wo_id: str
    equipment_id: str = ""
    equipment_tag: str
    handover_type: str = Field(default="TO_OPERATIONS", pattern="^(TO_MAINTENANCE|TO_OPERATIONS)$")
    to_user: str
    condition_notes: str = ""
    tests_passed: bool = False
    test_notes: str = ""


# ── Auto-generate tasks from scheduled WOs ──────────────────────────

@router.post("/auto-generate-tasks")
def auto_generate_tasks(
    plant_id: str = "GOLDFIELDS-SN",
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Auto-create execution tasks for all PROGRAMADO WOs with assigned workers."""
    from api.database.models import _uuid
    from datetime import date as _date

    wos = db.query(ManagedWorkOrderModel).filter(
        ManagedWorkOrderModel.plant_id == plant_id,
        ManagedWorkOrderModel.status == "PROGRAMADO",
    ).all()

    # Get existing assignments to avoid duplicates
    existing_wo_ids = set(
        r[0] for r in db.query(WorkAssignmentModel.wo_id).filter(
            WorkAssignmentModel.wo_id != None,
            WorkAssignmentModel.status.in_(["ASSIGNED", "IN_PROGRESS", "PENDING"]),
        ).all()
    )

    created = 0
    for wo in wos:
        if wo.wo_id in existing_wo_ids:
            continue
        workers = wo.assigned_workers or []
        if not isinstance(workers, list) or not workers:
            continue

        for worker in workers:
            if not isinstance(worker, dict):
                continue
            worker_id = worker.get("worker_id") or worker.get("user_id") or ""
            worker_name = worker.get("name") or worker.get("full_name") or ""

            sched = None
            if wo.planned_start:
                sched = wo.planned_start.date() if hasattr(wo.planned_start, 'date') else wo.planned_start

            assignment = WorkAssignmentModel(
                assignment_id=_uuid(),
                work_package_id=wo.wo_id,
                plant_id=wo.plant_id,
                assigned_to=worker_id or worker_name,
                estimated_hours=wo.estimated_hours or 4,
                scheduled_date=sched,
                status="ASSIGNED",
                wo_id=wo.wo_id,
                task_description=f"{wo.wo_number} — {(wo.description or '')[:100]}",
            )
            db.add(assignment)
            created += 1

    db.commit()
    return {"created": created, "total_wos": len(wos), "skipped": len(existing_wo_ids)}


# ── Assign task to technician ────────────────────────────────────────

@router.post("/tasks")
def assign_task(
    body: TaskAssignRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Create a work assignment linked to a managed work order."""
    wo = db.get(ManagedWorkOrderModel, body.wo_id)
    if not wo:
        raise HTTPException(status_code=404, detail="Work order not found")

    from api.database.models import _uuid
    from datetime import date as _date

    sched = None
    if body.scheduled_date:
        try:
            sched = _date.fromisoformat(body.scheduled_date)
        except ValueError:
            sched = None

    assignment = WorkAssignmentModel(
        assignment_id=_uuid(),
        work_package_id=wo.wo_id,
        plant_id=wo.plant_id,
        assigned_to=body.assigned_to,
        estimated_hours=body.estimated_hours,
        scheduled_date=sched,
        status="ASSIGNED",
        wo_id=body.wo_id,
        task_description=body.task_description or wo.description[:200],
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return _task_to_dict(assignment)


# ── My tasks (for current technician) ───────────────────────────────

@router.get("/my-tasks")
def my_tasks(
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Get all tasks assigned to the current user."""
    uid = getattr(user, "user_id", "")
    username = getattr(user, "username", "")
    full_name = getattr(user, "full_name", "")
    search_vals = [v for v in [uid, username, full_name] if v]
    q = db.query(WorkAssignmentModel).filter(
        WorkAssignmentModel.assigned_to.in_(search_vals),
        WorkAssignmentModel.status.notin_(["COMPLETED", "CANCELLED"]),
    ).order_by(WorkAssignmentModel.scheduled_date.asc().nullslast())
    return [_task_to_dict(t) for t in q.all()]


# ── List all tasks (for supervisors) ────────────────────────────────

@router.get("/tasks")
def list_tasks(
    wo_id: str | None = None,
    status: str | None = None,
    assigned_to: str | None = None,
    plant_id: str | None = None,
    limit: int = 200,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """List execution tasks with optional filters."""
    q = db.query(WorkAssignmentModel).order_by(WorkAssignmentModel.created_at.desc())
    if plant_id:
        q = q.filter(WorkAssignmentModel.plant_id == plant_id)
    if wo_id:
        q = q.filter(WorkAssignmentModel.wo_id == wo_id)
    if status:
        q = q.filter(WorkAssignmentModel.status == status)
    if assigned_to:
        q = q.filter(WorkAssignmentModel.assigned_to == assigned_to)
    return [_task_to_dict(t) for t in q.limit(limit).all()]


# ── Get single task ─────────────────────────────────────────────────

@router.get("/tasks/{task_id}")
def get_task(
    task_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    task = db.get(WorkAssignmentModel, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return _task_to_dict(task)


# ── Update progress ─────────────────────────────────────────────────

@router.put("/tasks/{task_id}/progress")
def update_progress(
    task_id: str,
    body: ProgressUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Update task completion percentage and optionally add a note."""
    task = db.get(WorkAssignmentModel, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.progress_pct = body.progress_pct
    if task.status == "ASSIGNED" and body.progress_pct > 0:
        task.status = "IN_PROGRESS"

    if body.note:
        notes = task.partial_notes or []
        notes.append({
            "timestamp": datetime.now().isoformat(),
            "user": getattr(user, "username", ""),
            "note": body.note,
        })
        task.partial_notes = notes

    # Also update the parent WO completion
    _sync_wo_progress(db, task)
    db.commit()
    return _task_to_dict(task)


# ── Partial notification (shift change) ─────────────────────────────

@router.post("/tasks/{task_id}/partial")
def partial_notification(
    task_id: str,
    body: PartialNotification,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Record a partial notification (e.g. shift handover)."""
    task = db.get(WorkAssignmentModel, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    notes = task.partial_notes or []
    notes.append({
        "timestamp": datetime.now().isoformat(),
        "user": getattr(user, "username", ""),
        "note": body.note,
        "type": "shift_change",
    })
    task.partial_notes = notes
    if body.shift_handover_notes:
        task.shift_handover_notes = body.shift_handover_notes

    db.commit()
    return _task_to_dict(task)


# ── Complete task ───────────────────────────────────────────────────

@router.put("/tasks/{task_id}/complete")
def complete_task(
    task_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Mark a task as completed."""
    task = db.get(WorkAssignmentModel, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.status = "COMPLETED"
    task.progress_pct = 100.0
    task.completed_at = datetime.now()

    _sync_wo_progress(db, task)
    db.commit()
    return _task_to_dict(task)


# ── Confirm task understood ─────────────────────────────────────────

@router.put("/tasks/{task_id}/confirm-understood")
def confirm_understood(
    task_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Supervisor confirms the technician understands the task."""
    task = db.get(WorkAssignmentModel, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.task_understood = True
    db.commit()
    return _task_to_dict(task)


# ── Equipment Handovers ─────────────────────────────────────────────

@router.post("/handovers")
def create_handover(
    body: HandoverCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Create an equipment handover record."""
    handover = EquipmentHandoverModel(
        wo_id=body.wo_id,
        equipment_id=body.equipment_id,
        equipment_tag=body.equipment_tag,
        handover_type=body.handover_type,
        from_user=getattr(user, "username", ""),
        to_user=body.to_user,
        condition_notes=body.condition_notes,
        tests_passed=body.tests_passed,
        test_notes=body.test_notes,
    )
    db.add(handover)
    db.commit()
    db.refresh(handover)
    return _handover_to_dict(handover)


@router.get("/handovers")
def list_handovers(
    wo_id: str | None = None,
    equipment_tag: str | None = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """List equipment handovers."""
    q = db.query(EquipmentHandoverModel).order_by(EquipmentHandoverModel.handover_at.desc())
    if wo_id:
        q = q.filter(EquipmentHandoverModel.wo_id == wo_id)
    if equipment_tag:
        q = q.filter(EquipmentHandoverModel.equipment_tag == equipment_tag)
    return [_handover_to_dict(h) for h in q.limit(limit).all()]


# ── Helpers ──────────────────────────────────────────────────────────

def _sync_wo_progress(db: Session, task: WorkAssignmentModel):
    """Sync parent work order's completion_pct from all its tasks."""
    if not task.wo_id:
        return
    all_tasks = db.query(WorkAssignmentModel).filter(
        WorkAssignmentModel.wo_id == task.wo_id,
    ).all()
    if not all_tasks:
        return
    avg_pct = sum(t.progress_pct for t in all_tasks) / len(all_tasks)
    wo = db.get(ManagedWorkOrderModel, task.wo_id)
    if wo:
        wo.completion_pct = round(avg_pct, 1)
        # Auto-update WO status
        if avg_pct >= 100 and wo.status == "IN_PROGRESS":
            wo.status = "COMPLETED"
            wo.actual_end = datetime.now()


def _task_to_dict(t: WorkAssignmentModel) -> dict:
    return {
        "assignment_id": t.assignment_id,
        "work_package_id": t.work_package_id,
        "wo_id": getattr(t, "wo_id", None),
        "plant_id": t.plant_id,
        "assigned_to": t.assigned_to,
        "task_description": getattr(t, "task_description", ""),
        "required_competencies": t.required_competencies,
        "matched_competencies": t.matched_competencies,
        "competency_match_score": t.competency_match_score,
        "scheduled_date": t.scheduled_date.isoformat() if t.scheduled_date else None,
        "estimated_hours": t.estimated_hours,
        "status": t.status,
        "task_understood": getattr(t, "task_understood", False),
        "progress_pct": getattr(t, "progress_pct", 0),
        "partial_notes": getattr(t, "partial_notes", None) or [],
        "shift_handover_notes": getattr(t, "shift_handover_notes", None),
        "completed_at": getattr(t, "completed_at", None),
        "completed_at_str": t.completed_at.isoformat() if getattr(t, "completed_at", None) else None,
        "created_at": t.created_at.isoformat() if t.created_at else None,
    }


def _handover_to_dict(h: EquipmentHandoverModel) -> dict:
    return {
        "handover_id": h.handover_id,
        "wo_id": h.wo_id,
        "equipment_id": h.equipment_id,
        "equipment_tag": h.equipment_tag,
        "handover_type": h.handover_type,
        "from_user": h.from_user,
        "to_user": h.to_user,
        "condition_notes": h.condition_notes,
        "tests_passed": h.tests_passed,
        "test_notes": h.test_notes,
        "handover_at": h.handover_at.isoformat() if h.handover_at else None,
        "created_at": h.created_at.isoformat() if h.created_at else None,
    }
