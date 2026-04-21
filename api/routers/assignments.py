"""Assignments router — competency-based work assignment API (GAP-W09)."""

from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.dependencies.auth import get_current_user
from api.services import assignment_service

router = APIRouter(prefix="/assignments", tags=["assignments"], dependencies=[Depends(get_current_user)])


@router.get("/technicians")
def list_technicians(
    plant_id: str | None = None,
    shift: str | None = None,
    specialty: str | None = None,
    db: Session = Depends(get_db),
):
    """List technician profiles with optional filters."""
    return assignment_service.get_technician_profiles(
        db, plant_id=plant_id, shift=shift, specialty=specialty,
    )


@router.post("/optimize")
def optimize_assignments(data: dict, db: Session = Depends(get_db)):
    """Generate optimized technician-to-task assignments.

    Body: { tasks, plant_id, date (ISO), shift, shift_hours? }
    """
    try:
        return assignment_service.optimize_assignments(
            db,
            tasks=data.get("tasks", []),
            plant_id=data["plant_id"],
            target_date=date.fromisoformat(data["date"]),
            target_shift=data["shift"],
            shift_hours=data.get("shift_hours", 8.0),
        )
    except KeyError as e:
        raise HTTPException(status_code=422, detail=f"Missing required field: {e}")


@router.post("/reoptimize")
def reoptimize_assignments(data: dict, db: Session = Depends(get_db)):
    """Re-optimize assignments when workers are absent.

    Body: { existing_assignments, absent_worker_ids, tasks, plant_id, date, shift }
    """
    try:
        return assignment_service.reoptimize_assignments(
            db,
            existing_assignments=data.get("existing_assignments", []),
            absent_worker_ids=data.get("absent_worker_ids", []),
            tasks=data.get("tasks", []),
            plant_id=data["plant_id"],
            target_date=date.fromisoformat(data["date"]),
            target_shift=data["shift"],
            shift_hours=data.get("shift_hours", 8.0),
        )
    except KeyError as e:
        raise HTTPException(status_code=422, detail=f"Missing required field: {e}")


@router.post("/summary")
def get_summary(data: dict, db: Session = Depends(get_db)):
    """Generate supervisor-friendly summary from AssignmentSummary data."""
    return assignment_service.get_assignment_summary(db, data)


# ── Fase 3 Jorge 2026-04-21 — edit técnico (especialidad, turno, pattern, skills)
@router.patch("/technicians/{worker_id}")
def update_technician(
    worker_id: str,
    data: dict,
    db: Session = Depends(get_db),
):
    """Update a technician's profile fields. Safe partial update — only
    fields present in the body are touched."""
    from api.database.models import WorkforceModel
    w = db.query(WorkforceModel).filter(WorkforceModel.worker_id == worker_id).first()
    if not w:
        raise HTTPException(status_code=404, detail="Technician not found")
    ALLOWED = {
        "name", "specialty", "shift", "shift_pattern", "shift_cycle_start",
        "skills", "certifications", "available", "absence_reason",
        "absence_until", "competency_level", "years_experience",
        "equipment_expertise", "safety_training_current", "competencies",
    }
    for k, v in data.items():
        if k in ALLOWED:
            setattr(w, k, v)
    db.commit()
    db.refresh(w)
    return {
        "worker_id": w.worker_id,
        "name": w.name,
        "specialty": w.specialty,
        "shift": w.shift,
        "shift_pattern": getattr(w, "shift_pattern", None),
        "shift_cycle_start": getattr(w, "shift_cycle_start", None),
        "skills": getattr(w, "skills", None) or [],
        "certifications": w.certifications or [],
        "available": w.available,
        "years_experience": w.years_experience,
    }
