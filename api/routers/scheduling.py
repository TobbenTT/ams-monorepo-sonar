"""Scheduling router — weekly program management and Gantt export."""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.schemas import ProgramCreate
from api.services import scheduling_service

router = APIRouter(prefix="/scheduling", tags=["scheduling"])


@router.post("/programs")
def create_program(data: ProgramCreate, db: Session = Depends(get_db)):
    return scheduling_service.create_program(db, data.plant_id, data.week_number, data.year)


@router.get("/programs")
def list_programs(
    plant_id: str | None = None,
    status: str | None = None,
    db: Session = Depends(get_db),
):
    return scheduling_service.list_programs(db, plant_id, status)


@router.get("/programs/{program_id}")
def get_program(program_id: str, db: Session = Depends(get_db)):
    model = scheduling_service.get_program(db, program_id)
    if not model:
        raise HTTPException(status_code=404, detail="Program not found")
    return {
        "program_id": model.program_id,
        "plant_id": model.plant_id,
        "week_number": model.week_number,
        "year": model.year,
        "status": model.status,
        "total_hours": model.total_hours,
        "work_packages": model.work_packages,
        "resource_slots": model.resource_slots,
        "conflicts": model.conflicts,
        "support_tasks": model.support_tasks,
        "created_at": model.created_at.isoformat() if model.created_at else None,
        "finalized_at": model.finalized_at.isoformat() if model.finalized_at else None,
    }


@router.put("/programs/{program_id}/finalize")
def finalize_program(program_id: str, db: Session = Depends(get_db)):
    result = scheduling_service.finalize_program(db, program_id)
    if not result:
        raise HTTPException(status_code=404, detail="Program not found")
    return result


@router.put("/programs/{program_id}/activate")
def activate_program(program_id: str, db: Session = Depends(get_db)):
    result = scheduling_service.activate_program(db, program_id)
    if not result:
        raise HTTPException(status_code=404, detail="Program not found")
    return result


@router.put("/programs/{program_id}/complete")
def complete_program(program_id: str, db: Session = Depends(get_db)):
    result = scheduling_service.complete_program(db, program_id)
    if not result:
        raise HTTPException(status_code=404, detail="Program not found")
    return result


@router.get("/programs/{program_id}/gantt")
def get_gantt(program_id: str, db: Session = Depends(get_db)):
    result = scheduling_service.get_gantt(db, program_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Program not found")
    return result


@router.get("/programs/{program_id}/gantt/export")
def export_gantt_excel(program_id: str, db: Session = Depends(get_db)):
    filepath = scheduling_service.export_gantt_excel(db, program_id)
    if not filepath:
        raise HTTPException(status_code=404, detail="Program not found")
    return FileResponse(
        filepath,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename=f"gantt_{program_id}.xlsx",
    )
