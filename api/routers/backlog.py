"""Backlog router — backlog management and optimisation."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.schemas import BacklogOptimizeRequest
from api.services import backlog_service

router = APIRouter(prefix="/backlog", tags=["backlog"])


@router.get("/")
def list_backlog(
    status: str | None = None,
    priority: str | None = None,
    equipment_tag: str | None = None,
    limit: int = 200,
    offset: int = 0,
    db: Session = Depends(get_db),
):
    return backlog_service.list_backlog(db, status, priority, equipment_tag, limit=limit, offset=offset)


@router.post("/add/{work_request_id}")
def add_to_backlog(work_request_id: str, db: Session = Depends(get_db)):
    result = backlog_service.add_to_backlog(db, work_request_id)
    if not result:
        raise HTTPException(status_code=404, detail="Work request not found")
    return result


@router.post("/optimize")
def optimize_backlog(data: BacklogOptimizeRequest, db: Session = Depends(get_db)):
    return backlog_service.optimize_backlog(db, data.plant_id, data.period_days)


@router.get("/optimizations/{optimization_id}")
def get_optimization(optimization_id: str, db: Session = Depends(get_db)):
    opt = backlog_service.get_optimization(db, optimization_id)
    if not opt:
        raise HTTPException(status_code=404, detail="Optimization not found")
    return {
        "optimization_id": opt.optimization_id,
        "plant_id": opt.plant_id,
        "status": opt.status,
        "total_items": opt.total_items,
        "stratification": opt.stratification,
        "work_packages": opt.work_packages,
        "schedule": opt.schedule,
        "alerts": opt.alerts,
        "generated_at": opt.generated_at.isoformat() if opt.generated_at else None,
    }


@router.put("/optimizations/{optimization_id}/approve")
def approve_schedule(optimization_id: str, db: Session = Depends(get_db)):
    result = backlog_service.approve_schedule(db, optimization_id)
    if not result:
        raise HTTPException(status_code=404, detail="Optimization not found")
    return result


@router.get("/schedule")
def get_schedule(db: Session = Depends(get_db)):
    result = backlog_service.get_schedule(db)
    if not result:
        return {"message": "No optimizations found"}
    return result
