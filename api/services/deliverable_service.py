"""Deliverable tracking service — CRUD, status transitions, time logging.

GAP-W10: Consultant Workflow / Deliverable Tracking.
"""

from __future__ import annotations

from datetime import datetime

from sqlalchemy.orm import Session

from api.database.models import DeliverableModel, TimeLogModel
from api.services.audit_service import log_action
from tools.engines.deliverable_tracking_engine import DeliverableTrackingEngine
from tools.models.schemas import DeliverableStatus


# ---------------------------------------------------------------------------
# CRUD — Deliverables
# ---------------------------------------------------------------------------

def create_deliverable(db: Session, data: dict) -> DeliverableModel:
    obj = DeliverableModel(**data)
    db.add(obj)
    log_action(db, "deliverable", obj.deliverable_id, "CREATE")
    db.commit()
    db.refresh(obj)
    return obj


def get_deliverable(db: Session, deliverable_id: str) -> DeliverableModel | None:
    return (
        db.query(DeliverableModel)
        .filter(DeliverableModel.deliverable_id == deliverable_id)
        .first()
    )


def list_deliverables(
    db: Session,
    client_slug: str | None = None,
    project_slug: str | None = None,
    milestone: int | None = None,
    status: str | None = None,
) -> list[DeliverableModel]:
    q = db.query(DeliverableModel)
    if client_slug:
        q = q.filter(DeliverableModel.client_slug == client_slug)
    if project_slug:
        q = q.filter(DeliverableModel.project_slug == project_slug)
    if milestone is not None:
        q = q.filter(DeliverableModel.milestone == milestone)
    if status:
        q = q.filter(DeliverableModel.status == status)
    return q.order_by(DeliverableModel.milestone, DeliverableModel.created_at).all()


def update_deliverable(
    db: Session, deliverable_id: str, data: dict
) -> DeliverableModel | None:
    obj = get_deliverable(db, deliverable_id)
    if not obj:
        return None

    # Only allow updating safe fields
    allowed = {
        "name", "name_fr", "estimated_hours", "consultant_notes",
        "artifact_paths", "assigned_agent",
    }
    for key, value in data.items():
        if key in allowed:
            setattr(obj, key, value)

    log_action(db, "deliverable", deliverable_id, "UPDATE")
    db.commit()
    db.refresh(obj)
    return obj


# ---------------------------------------------------------------------------
# Status transitions
# ---------------------------------------------------------------------------

def transition_status(
    db: Session,
    deliverable_id: str,
    target_status: str,
    feedback: str = "",
) -> DeliverableModel | None:
    obj = get_deliverable(db, deliverable_id)
    if not obj:
        return None

    current = DeliverableStatus(obj.status)
    target = DeliverableStatus(target_status)

    # Validate via engine (raises ValueError if invalid)
    DeliverableTrackingEngine.transition(current, target)

    obj.status = target.value
    now = datetime.now()

    if target == DeliverableStatus.SUBMITTED:
        obj.submitted_at = now
    elif target == DeliverableStatus.UNDER_REVIEW:
        obj.reviewed_at = now
    elif target == DeliverableStatus.APPROVED:
        obj.completed_at = now

    if feedback:
        obj.client_feedback = feedback

    log_action(db, "deliverable", deliverable_id, f"TRANSITION_{target.value}")
    db.commit()
    db.refresh(obj)
    return obj


# ---------------------------------------------------------------------------
# Time logging
# ---------------------------------------------------------------------------

def log_time(db: Session, data: dict) -> TimeLogModel:
    tl = TimeLogModel(**data)
    db.add(tl)

    # Update actual_hours on the parent deliverable
    deliverable = get_deliverable(db, tl.deliverable_id)
    if deliverable:
        deliverable.actual_hours = (deliverable.actual_hours or 0) + tl.hours

    log_action(db, "time_log", tl.log_id, "CREATE")
    db.commit()
    db.refresh(tl)
    return tl


def list_time_logs(db: Session, deliverable_id: str) -> list[TimeLogModel]:
    return (
        db.query(TimeLogModel)
        .filter(TimeLogModel.deliverable_id == deliverable_id)
        .order_by(TimeLogModel.logged_at.desc())
        .all()
    )


# ---------------------------------------------------------------------------
# Summaries
# ---------------------------------------------------------------------------

def get_project_summary(
    db: Session, client_slug: str, project_slug: str
) -> dict:
    deliverables = list_deliverables(
        db, client_slug=client_slug, project_slug=project_slug
    )
    d_dicts = [
        {
            "status": d.status,
            "milestone": d.milestone,
            "estimated_hours": d.estimated_hours,
            "actual_hours": d.actual_hours,
        }
        for d in deliverables
    ]
    summary = DeliverableTrackingEngine.build_summary(d_dicts)
    return summary.model_dump()


# ---------------------------------------------------------------------------
# Seed from execution plan
# ---------------------------------------------------------------------------

def seed_deliverables_from_plan(
    db: Session,
    plan_dict: dict,
    client_slug: str,
    project_slug: str,
) -> list[DeliverableModel]:
    """Create deliverable records from an execution plan."""
    seed_data = DeliverableTrackingEngine.seed_from_execution_plan(
        plan_dict, client_slug, project_slug
    )
    created: list[DeliverableModel] = []
    for data in seed_data:
        obj = create_deliverable(db, data)
        created.append(obj)
    return created
