"""Deliverables router — tracking, time logging, status transitions.

GAP-W10: Consultant Workflow / Deliverable Tracking.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.services import deliverable_service

router = APIRouter(prefix="/deliverables", tags=["deliverables"])


# ---------------------------------------------------------------------------
# CRUD
# ---------------------------------------------------------------------------

@router.post("/")
def create_deliverable(data: dict, db: Session = Depends(get_db)):
    obj = deliverable_service.create_deliverable(db, data)
    return {
        "deliverable_id": obj.deliverable_id,
        "name": obj.name,
        "category": obj.category,
        "status": obj.status,
    }


@router.get("/")
def list_deliverables(
    client_slug: str | None = Query(None),
    project_slug: str | None = Query(None),
    milestone: int | None = Query(None),
    status: str | None = Query(None),
    db: Session = Depends(get_db),
):
    items = deliverable_service.list_deliverables(
        db,
        client_slug=client_slug,
        project_slug=project_slug,
        milestone=milestone,
        status=status,
    )
    return [
        {
            "deliverable_id": d.deliverable_id,
            "name": d.name,
            "category": d.category,
            "milestone": d.milestone,
            "status": d.status,
            "estimated_hours": d.estimated_hours,
            "actual_hours": d.actual_hours,
            "submitted_at": d.submitted_at.isoformat() if d.submitted_at else None,
            "completed_at": d.completed_at.isoformat() if d.completed_at else None,
        }
        for d in items
    ]


@router.get("/summary/{client_slug}/{project_slug}")
def project_summary(
    client_slug: str,
    project_slug: str,
    db: Session = Depends(get_db),
):
    return deliverable_service.get_project_summary(db, client_slug, project_slug)


@router.get("/{deliverable_id}")
def get_deliverable(deliverable_id: str, db: Session = Depends(get_db)):
    obj = deliverable_service.get_deliverable(db, deliverable_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Deliverable not found")
    return {
        "deliverable_id": obj.deliverable_id,
        "name": obj.name,
        "name_fr": obj.name_fr,
        "category": obj.category,
        "milestone": obj.milestone,
        "status": obj.status,
        "execution_plan_stage_id": obj.execution_plan_stage_id,
        "quality_score_id": obj.quality_score_id,
        "estimated_hours": obj.estimated_hours,
        "actual_hours": obj.actual_hours,
        "artifact_paths": obj.artifact_paths,
        "client_slug": obj.client_slug,
        "project_slug": obj.project_slug,
        "assigned_agent": obj.assigned_agent,
        "created_at": obj.created_at.isoformat() if obj.created_at else None,
        "submitted_at": obj.submitted_at.isoformat() if obj.submitted_at else None,
        "reviewed_at": obj.reviewed_at.isoformat() if obj.reviewed_at else None,
        "completed_at": obj.completed_at.isoformat() if obj.completed_at else None,
        "client_feedback": obj.client_feedback,
        "consultant_notes": obj.consultant_notes,
    }


@router.put("/{deliverable_id}")
def update_deliverable(
    deliverable_id: str, data: dict, db: Session = Depends(get_db)
):
    obj = deliverable_service.update_deliverable(db, deliverable_id, data)
    if not obj:
        raise HTTPException(status_code=404, detail="Deliverable not found")
    return {"deliverable_id": obj.deliverable_id, "status": obj.status}


# ---------------------------------------------------------------------------
# Status transition
# ---------------------------------------------------------------------------

@router.put("/{deliverable_id}/transition")
def transition_deliverable(
    deliverable_id: str, data: dict, db: Session = Depends(get_db)
):
    target_status = data.get("status")
    feedback = data.get("feedback", "")
    if not target_status:
        raise HTTPException(status_code=400, detail="Missing 'status' field")
    try:
        obj = deliverable_service.transition_status(
            db, deliverable_id, target_status, feedback
        )
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc))
    if not obj:
        raise HTTPException(status_code=404, detail="Deliverable not found")
    return {"deliverable_id": obj.deliverable_id, "status": obj.status}


# ---------------------------------------------------------------------------
# Time logging
# ---------------------------------------------------------------------------

@router.post("/{deliverable_id}/time-log")
def log_time(deliverable_id: str, data: dict, db: Session = Depends(get_db)):
    obj = deliverable_service.get_deliverable(db, deliverable_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Deliverable not found")
    data["deliverable_id"] = deliverable_id
    tl = deliverable_service.log_time(db, data)
    return {
        "log_id": tl.log_id,
        "deliverable_id": tl.deliverable_id,
        "hours": tl.hours,
        "activity_type": tl.activity_type,
    }


@router.get("/{deliverable_id}/time-logs")
def list_time_logs(deliverable_id: str, db: Session = Depends(get_db)):
    logs = deliverable_service.list_time_logs(db, deliverable_id)
    return [
        {
            "log_id": tl.log_id,
            "hours": tl.hours,
            "description": tl.description,
            "logged_by": tl.logged_by,
            "logged_at": tl.logged_at.isoformat() if tl.logged_at else None,
            "activity_type": tl.activity_type,
        }
        for tl in logs
    ]


# ---------------------------------------------------------------------------
# Seed from execution plan
# ---------------------------------------------------------------------------

@router.post("/seed-from-plan")
def seed_from_plan(data: dict, db: Session = Depends(get_db)):
    plan_dict = data.get("plan", {})
    client_slug = data.get("client_slug", "")
    project_slug = data.get("project_slug", "")
    if not plan_dict:
        raise HTTPException(status_code=400, detail="Missing 'plan' field")
    created = deliverable_service.seed_deliverables_from_plan(
        db, plan_dict, client_slug, project_slug
    )
    return {
        "created": len(created),
        "deliverable_ids": [d.deliverable_id for d in created],
    }
