"""OR Projects router — Operational Readiness project management.

Manages OR projects that coordinate the 13 CORTEX agents to generate
consulting-grade deliverables.
"""

from __future__ import annotations

import logging
import os
import pathlib
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.database.models import ORProjectModel, ORDeliverableModel
from api.dependencies.auth import get_current_user

log = logging.getLogger(__name__)

router = APIRouter(
    prefix="/or",
    tags=["or-projects"],
    dependencies=[Depends(get_current_user)],
)

DELIVERABLES_DIR = pathlib.Path(os.getenv("OR_DELIVERABLES_DIR", "/app/or_deliverables"))


class ORProjectCreate(BaseModel):
    client_name: str
    plant_code: str | None = None
    project_type: str = "greenfield"
    notes: str | None = None


class ORProjectUpdate(BaseModel):
    current_gate: str | None = None
    status: str | None = None
    gate_status: dict | None = None
    notes: str | None = None


def _project_to_dict(p: ORProjectModel) -> dict:
    return {
        "project_id": p.project_id,
        "user_id": p.user_id,
        "client_name": p.client_name,
        "plant_code": p.plant_code,
        "project_type": p.project_type,
        "status": p.status,
        "current_gate": p.current_gate,
        "gate_status": p.gate_status or {"G0": "PENDING", "G1": "PENDING", "G2": "PENDING", "G3": "PENDING", "G4": "PENDING"},
        "active_agents": p.active_agents,
        "notes": p.notes,
        "created_at": p.created_at.isoformat() if p.created_at else None,
        "updated_at": p.updated_at.isoformat() if p.updated_at else None,
    }


def _deliverable_to_dict(d: ORDeliverableModel) -> dict:
    return {
        "deliverable_id": d.deliverable_id,
        "project_id": d.project_id,
        "agent_type": d.agent_type,
        "name": d.name,
        "file_path": d.file_path,
        "file_type": d.file_type,
        "status": d.status,
        "quality_score": d.quality_score,
        "gate": d.gate,
        "created_at": d.created_at.isoformat() if d.created_at else None,
    }


@router.post("/projects")
def create_project(
    data: ORProjectCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Create a new OR project."""
    project = ORProjectModel(
        user_id=user.user_id,
        client_name=data.client_name,
        plant_code=data.plant_code,
        project_type=data.project_type,
        notes=data.notes,
        gate_status={"G0": "IN_PROGRESS", "G1": "PENDING", "G2": "PENDING", "G3": "PENDING", "G4": "PENDING"},
        active_agents=[
            "orchestrator", "project_orchestrator",
            "reliability", "planning", "operations",
            "hse", "execution", "contracts",
            "finance", "engineering",
        ],
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return _project_to_dict(project)


@router.get("/projects")
def list_projects(
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """List OR projects for the current user."""
    projects = (
        db.query(ORProjectModel)
        .filter(ORProjectModel.user_id == user.user_id)
        .order_by(ORProjectModel.created_at.desc())
        .all()
    )
    return [_project_to_dict(p) for p in projects]


@router.get("/projects/{project_id}")
def get_project(project_id: str, db: Session = Depends(get_db)):
    """Get details of a specific OR project."""
    project = db.query(ORProjectModel).filter(ORProjectModel.project_id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return _project_to_dict(project)


@router.put("/projects/{project_id}")
def update_project(project_id: str, data: ORProjectUpdate, db: Session = Depends(get_db)):
    """Update gate status or project state."""
    project = db.query(ORProjectModel).filter(ORProjectModel.project_id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if data.current_gate:
        project.current_gate = data.current_gate
    if data.status:
        project.status = data.status
    if data.gate_status:
        project.gate_status = {**(project.gate_status or {}), **data.gate_status}
    if data.notes is not None:
        project.notes = data.notes
    project.updated_at = datetime.now()
    db.commit()
    db.refresh(project)
    return _project_to_dict(project)


@router.post("/projects/{project_id}/advance-gate")
def advance_gate(project_id: str, db: Session = Depends(get_db)):
    """Advance the project to the next gate."""
    project = db.query(ORProjectModel).filter(ORProjectModel.project_id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    gates = ["G0", "G1", "G2", "G3", "G4"]
    current_idx = gates.index(project.current_gate) if project.current_gate in gates else 0
    if current_idx >= len(gates) - 1:
        raise HTTPException(status_code=400, detail="Project is at final gate G4")

    next_gate = gates[current_idx + 1]
    gate_status = project.gate_status or {}
    gate_status[project.current_gate] = "COMPLETED"
    gate_status[next_gate] = "IN_PROGRESS"

    project.current_gate = next_gate
    project.gate_status = gate_status
    project.updated_at = datetime.now()
    db.commit()
    db.refresh(project)
    return _project_to_dict(project)


@router.get("/projects/{project_id}/deliverables")
def list_project_deliverables(project_id: str, db: Session = Depends(get_db)):
    """List deliverables for an OR project."""
    deliverables = (
        db.query(ORDeliverableModel)
        .filter(ORDeliverableModel.project_id == project_id)
        .order_by(ORDeliverableModel.created_at.desc())
        .all()
    )
    return [_deliverable_to_dict(d) for d in deliverables]


@router.get("/deliverables")
def list_all_deliverables(db: Session = Depends(get_db), user=Depends(get_current_user)):
    """List all OR deliverables accessible to the current user."""
    # Join with projects to filter by user
    deliverables = (
        db.query(ORDeliverableModel)
        .join(ORProjectModel, ORDeliverableModel.project_id == ORProjectModel.project_id, isouter=True)
        .filter(
            (ORProjectModel.user_id == user.user_id) | (ORDeliverableModel.project_id == None)
        )
        .order_by(ORDeliverableModel.created_at.desc())
        .limit(50)
        .all()
    )
    return [_deliverable_to_dict(d) for d in deliverables]


@router.get("/deliverables/{deliverable_id}/download")
def download_deliverable(deliverable_id: str, db: Session = Depends(get_db)):
    """Download a generated OR deliverable file."""
    deliverable = db.query(ORDeliverableModel).filter(ORDeliverableModel.deliverable_id == deliverable_id).first()
    if not deliverable:
        raise HTTPException(status_code=404, detail="Deliverable not found")
    if not deliverable.file_path:
        raise HTTPException(status_code=404, detail="File path not set for this deliverable")

    file_path = pathlib.Path(deliverable.file_path)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on disk")

    media_types = {"docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                   "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                   "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation"}
    media_type = media_types.get(deliverable.file_type, "application/octet-stream")

    return FileResponse(str(file_path), media_type=media_type, filename=file_path.name)
