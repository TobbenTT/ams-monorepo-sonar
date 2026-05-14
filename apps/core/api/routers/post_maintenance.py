"""Post-Maintenance router — Jorge Phase 5: reviews, analysis, improvement actions."""

import logging
from datetime import datetime, date, timedelta

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.database.models import (
    PostMaintenanceReviewModel, ManagedWorkOrderModel,
)
from api.routers.auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/post-maintenance", tags=["post-maintenance"])


# ── Schemas ──────────────────────────────────────────────────────────

class ReviewCreate(BaseModel):
    plant_id: str = "OCP-JFC1"
    period_start: str  # ISO date
    period_end: str

class ReviewUpdate(BaseModel):
    meeting_date: str | None = None
    attendees: list | None = None
    meeting_notes: str | None = None
    improvement_actions: list | None = None
    lessons_learned: str | None = None
    status: str | None = None


# ── Create review ───────────────────────────────────────────────────

@router.post("/reviews")
def create_review(
    body: ReviewCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Create a post-maintenance review for a period, auto-analyzing WOs."""
    start = date.fromisoformat(body.period_start)
    end = date.fromisoformat(body.period_end)

    # Auto-analyze work orders in the period
    analysis = _analyze_period(db, body.plant_id, start, end)

    review = PostMaintenanceReviewModel(
        plant_id=body.plant_id,
        period_start=start,
        period_end=end,
        wo_summary=analysis["wo_summary"],
        performance_kpis=analysis["performance_kpis"],
        delays=analysis["delays"],
        unplanned_work=analysis["unplanned_work"],
        rework_items=analysis["rework_items"],
        created_by=getattr(user, "username", ""),
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return _review_to_dict(review)


# ── List reviews ────────────────────────────────────────────────────

@router.get("/reviews")
def list_reviews(
    plant_id: str | None = None,
    status: str | None = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    q = db.query(PostMaintenanceReviewModel).order_by(PostMaintenanceReviewModel.created_at.desc())
    if plant_id:
        q = q.filter(PostMaintenanceReviewModel.plant_id == plant_id)
    if status:
        q = q.filter(PostMaintenanceReviewModel.status == status)
    return [_review_to_dict(r) for r in q.limit(limit).all()]


# ── Get single review ──────────────────────────────────────────────

@router.get("/reviews/{review_id}")
def get_review(
    review_id: str,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    r = db.get(PostMaintenanceReviewModel, review_id)
    if not r:
        raise HTTPException(status_code=404, detail="Review not found")
    return _review_to_dict(r)


# ── Update review ──────────────────────────────────────────────────

@router.put("/reviews/{review_id}")
def update_review(
    review_id: str,
    body: ReviewUpdate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    r = db.get(PostMaintenanceReviewModel, review_id)
    if not r:
        raise HTTPException(status_code=404, detail="Review not found")

    if body.meeting_date is not None:
        r.meeting_date = date.fromisoformat(body.meeting_date) if body.meeting_date else None
    if body.attendees is not None:
        r.attendees = body.attendees
    if body.meeting_notes is not None:
        r.meeting_notes = body.meeting_notes
    if body.improvement_actions is not None:
        r.improvement_actions = body.improvement_actions
    if body.lessons_learned is not None:
        r.lessons_learned = body.lessons_learned
    if body.status is not None:
        r.status = body.status

    r.updated_at = datetime.now()
    db.commit()
    return _review_to_dict(r)


# ── Complete review ────────────────────────────────────────────────

@router.put("/reviews/{review_id}/complete")
def complete_review(
    review_id: str,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    r = db.get(PostMaintenanceReviewModel, review_id)
    if not r:
        raise HTTPException(status_code=404, detail="Review not found")
    r.status = "COMPLETED"
    r.updated_at = datetime.now()
    db.commit()
    return _review_to_dict(r)


# ── Auto-analysis endpoint ─────────────────────────────────────────

@router.get("/analysis")
def get_analysis(
    plant_id: str = "OCP-JFC1",
    period_start: str | None = None,
    period_end: str | None = None,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Auto-analyze WOs for a period without creating a review."""
    end = date.fromisoformat(period_end) if period_end else date.today()
    start = date.fromisoformat(period_start) if period_start else end - timedelta(days=7)
    return _analyze_period(db, plant_id, start, end)


# ── Helpers ──────────────────────────────────────────────────────────

def _analyze_period(db: Session, plant_id: str, start: date, end: date) -> dict:
    """Analyze all managed WOs in a date range."""
    from datetime import datetime as dt
    start_dt = dt.combine(start, dt.min.time())
    end_dt = dt.combine(end, dt.max.time())

    wos = db.query(ManagedWorkOrderModel).filter(
        ManagedWorkOrderModel.plant_id == plant_id,
        ManagedWorkOrderModel.created_at >= start_dt,
        ManagedWorkOrderModel.created_at <= end_dt,
    ).all()

    total = len(wos)
    completed = sum(1 for w in wos if w.status in ("COMPLETED", "CLOSED"))
    in_progress = sum(1 for w in wos if w.status == "IN_PROGRESS")

    # Delayed = completed but actual_end > planned_end
    delays = []
    for w in wos:
        if w.actual_end and w.planned_end and w.actual_end > w.planned_end:
            delta = (w.actual_end - w.planned_end).total_seconds() / 3600
            delays.append({
                "wo_id": w.wo_id,
                "wo_number": w.wo_number,
                "description": (w.description or "")[:80],
                "hours_delayed": round(delta, 1),
            })

    # Unplanned work = work_class == NO_PROGRAMADO
    unplanned = [
        {
            "wo_id": w.wo_id,
            "wo_number": w.wo_number,
            "description": (w.description or "")[:80],
            "hours": w.actual_hours,
        }
        for w in wos if w.work_class == "NO_PROGRAMADO"
    ]

    # Schedule compliance
    programmed = [w for w in wos if w.work_class == "PROGRAMADO"]
    completed_on_time = sum(
        1 for w in programmed
        if w.status in ("COMPLETED", "CLOSED")
        and (not w.planned_end or not w.actual_end or w.actual_end <= w.planned_end)
    )
    compliance = round(completed_on_time / len(programmed) * 100, 1) if programmed else 0

    # Backlog
    pending_hours = sum(w.estimated_hours for w in wos if w.status not in ("COMPLETED", "CLOSED"))

    return {
        "wo_summary": {
            "total": total,
            "completed": completed,
            "in_progress": in_progress,
            "delayed": len(delays),
            "rework_count": 0,
        },
        "performance_kpis": {
            "schedule_compliance": compliance,
            "backlog_hours": round(pending_hours, 1),
            "avg_completion_hours": round(
                sum(w.actual_hours for w in wos if w.status in ("COMPLETED", "CLOSED")) / completed, 1
            ) if completed else 0,
            "unplanned_pct": round(len(unplanned) / total * 100, 1) if total else 0,
        },
        "delays": delays,
        "unplanned_work": unplanned,
        "rework_items": [],
    }


def _review_to_dict(r: PostMaintenanceReviewModel) -> dict:
    return {
        "review_id": r.review_id,
        "plant_id": r.plant_id,
        "period_start": r.period_start.isoformat() if r.period_start else None,
        "period_end": r.period_end.isoformat() if r.period_end else None,
        "wo_summary": r.wo_summary,
        "performance_kpis": r.performance_kpis,
        "delays": r.delays or [],
        "unplanned_work": r.unplanned_work or [],
        "rework_items": r.rework_items or [],
        "meeting_date": r.meeting_date.isoformat() if r.meeting_date else None,
        "attendees": r.attendees or [],
        "meeting_notes": r.meeting_notes,
        "improvement_actions": r.improvement_actions or [],
        "lessons_learned": r.lessons_learned,
        "status": r.status,
        "created_by": r.created_by,
        "created_at": r.created_at.isoformat() if r.created_at else None,
        "updated_at": r.updated_at.isoformat() if r.updated_at else None,
    }
