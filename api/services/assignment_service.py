"""Assignment service — bridges API router with AssignmentEngine (GAP-W09)."""

from __future__ import annotations

from datetime import date
from typing import Optional

from sqlalchemy.orm import Session

from api.database.models import WorkforceModel
from tools.engines.assignment_engine import AssignmentEngine
from tools.models.schemas import (
    AssignmentSummary,
    CompetencyLevel,
    LabourSpecialty,
    TechnicianCompetency,
    TechnicianProfile,
    WorkAssignment,
)

_engine = AssignmentEngine()


def _db_worker_to_profile(w: WorkforceModel) -> TechnicianProfile:
    """Convert a WorkforceModel row to a TechnicianProfile."""
    competencies = []
    if w.competencies:
        for c in w.competencies:
            competencies.append(TechnicianCompetency(**c))

    return TechnicianProfile(
        worker_id=w.worker_id,
        name=w.name,
        specialty=LabourSpecialty(w.specialty),
        shift=w.shift,
        plant_id=w.plant_id,
        available=w.available,
        competencies=competencies,
        years_experience=w.years_experience or 0,
        equipment_expertise=w.equipment_expertise or [],
        certifications=w.certifications or [],
        safety_training_current=w.safety_training_current,
    )


def get_technician_profiles(
    db: Session,
    plant_id: Optional[str] = None,
    shift: Optional[str] = None,
    specialty: Optional[str] = None,
) -> list[dict]:
    """List technician profiles with optional filters."""
    q = db.query(WorkforceModel)
    if plant_id:
        q = q.filter(WorkforceModel.plant_id == plant_id)
    if shift:
        q = q.filter(WorkforceModel.shift == shift)
    if specialty:
        q = q.filter(WorkforceModel.specialty == specialty)
    workers = q.all()
    return [_db_worker_to_profile(w).model_dump(mode="json") for w in workers]


def optimize_assignments(
    db: Session,
    tasks: list[dict],
    plant_id: str,
    target_date: date,
    target_shift: str,
    shift_hours: float = 8.0,
) -> dict:
    """Generate optimized assignments from DB workforce."""
    workers = db.query(WorkforceModel).filter(
        WorkforceModel.plant_id == plant_id,
    ).all()
    technicians = [_db_worker_to_profile(w) for w in workers]

    summary = _engine.optimize_assignments(
        tasks=tasks,
        technicians=technicians,
        target_date=target_date,
        target_shift=target_shift,
        plant_id=plant_id,
        shift_hours=shift_hours,
    )
    return summary.model_dump(mode="json")


def reoptimize_assignments(
    db: Session,
    existing_assignments: list[dict],
    absent_worker_ids: list[str],
    tasks: list[dict],
    plant_id: str,
    target_date: date,
    target_shift: str,
    shift_hours: float = 8.0,
) -> dict:
    """Re-optimize when workers are absent."""
    workers = db.query(WorkforceModel).filter(
        WorkforceModel.plant_id == plant_id,
    ).all()
    technicians = [_db_worker_to_profile(w) for w in workers]
    existing = [WorkAssignment(**a) for a in existing_assignments]

    summary = _engine.reoptimize_with_absences(
        existing_assignments=existing,
        absent_worker_ids=absent_worker_ids,
        all_technicians=technicians,
        tasks=tasks,
        target_date=target_date,
        target_shift=target_shift,
        plant_id=plant_id,
        shift_hours=shift_hours,
    )
    return summary.model_dump(mode="json")


def get_assignment_summary(
    db: Session,
    summary_data: dict,
) -> dict:
    """Generate a supervisor-friendly summary."""
    summary = AssignmentSummary(**summary_data)
    return _engine.generate_assignment_summary(summary)
