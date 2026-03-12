"""Execution checklists router — generate, step completion, gate enforcement, closure (GAP-W06)."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.services import execution_checklist_service

router = APIRouter(prefix="/execution-checklists", tags=["execution-checklists"])


@router.post("/")
def generate_checklist(data: dict, db: Session = Depends(get_db)):
    result = execution_checklist_service.generate_checklist(
        db,
        work_package=data.get("work_package", {}),
        tasks=data.get("tasks", []),
        equipment_name=data.get("equipment_name", ""),
        equipment_tag=data.get("equipment_tag", ""),
    )
    return result


@router.get("/")
def list_checklists(
    work_package_id: str | None = None,
    status: str | None = None,
    assigned_to: str | None = None,
    db: Session = Depends(get_db),
):
    return execution_checklist_service.list_checklists(
        db, work_package_id=work_package_id, status=status, assigned_to=assigned_to,
    )


@router.get("/{checklist_id}")
def get_checklist(checklist_id: str, db: Session = Depends(get_db)):
    result = execution_checklist_service.get_checklist(db, checklist_id)
    if not result:
        raise HTTPException(status_code=404, detail="Checklist not found")
    return result


@router.post("/{checklist_id}/steps/{step_id}/complete")
def complete_step(checklist_id: str, step_id: str, data: dict, db: Session = Depends(get_db)):
    try:
        return execution_checklist_service.complete_step(
            db,
            checklist_id=checklist_id,
            step_id=step_id,
            observation=data.get("observation"),
            completed_by=data.get("completed_by", ""),
        )
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))


@router.post("/{checklist_id}/steps/{step_id}/skip")
def skip_step(checklist_id: str, step_id: str, data: dict, db: Session = Depends(get_db)):
    try:
        return execution_checklist_service.skip_step(
            db,
            checklist_id=checklist_id,
            step_id=step_id,
            reason=data.get("reason", ""),
            authorized_by=data.get("authorized_by", ""),
        )
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))


@router.get("/{checklist_id}/next-steps")
def get_next_steps(checklist_id: str, db: Session = Depends(get_db)):
    try:
        return execution_checklist_service.get_next_steps(db, checklist_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/{checklist_id}/close")
def close_checklist(checklist_id: str, data: dict, db: Session = Depends(get_db)):
    try:
        return execution_checklist_service.close_checklist(
            db,
            checklist_id=checklist_id,
            supervisor=data.get("supervisor", ""),
            supervisor_notes=data.get("supervisor_notes", ""),
        )
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))
