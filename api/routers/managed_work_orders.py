"""Managed Work Orders router — full OT lifecycle (Jorge Phase 2)."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.dependencies.auth import get_current_user, require_role
from api.services import managed_wo_service


class WOCreateRequest(BaseModel):
    equipment_tag: str
    description: str = ""
    wo_type: str = "CORRECTIVO"
    priority_code: str = "P3"
    plant_id: str = "OCP-JFC1"
    work_request_id: str | None = None
    estimated_hours: float = 4.0
    operations: list | None = None
    materials: list | None = None
    tools: list | None = None


class WOFromWRRequest(BaseModel):
    work_request_id: str


class WOUpdateRequest(BaseModel):
    description: str | None = None
    wo_type: str | None = None
    priority_code: str | None = None
    estimated_hours: float | None = None
    operations: list | None = None
    materials: list | None = None
    tools: list | None = None
    documents: list | None = None
    labour_summary: dict | None = None
    planned_start: str | None = None
    planned_end: str | None = None
    risk_analysis: dict | None = None
    budget_amount: float | None = None
    budget_approved: bool | None = None


class WOScheduleRequest(BaseModel):
    assigned_workers: list | None = None


class WOCompleteRequest(BaseModel):
    actual_hours: float = 0


class WONoteRequest(BaseModel):
    note: str = Field(min_length=1)


class WOProgressRequest(BaseModel):
    completion_pct: float = Field(ge=0, le=100)


router = APIRouter(
    prefix="/managed-work-orders",
    tags=["managed-work-orders"],
    dependencies=[Depends(get_current_user)],
)


@router.post("/")
def create_work_order(
    data: WOCreateRequest,
    user=Depends(require_role("admin", "manager", "planner")),
    db: Session = Depends(get_db),
):
    result = managed_wo_service.create_work_order(
        db,
        equipment_tag=data.equipment_tag,
        description=data.description,
        wo_type=data.wo_type,
        priority_code=data.priority_code,
        plant_id=data.plant_id,
        work_request_id=data.work_request_id,
        planned_by=user.get("user_id", ""),
        estimated_hours=data.estimated_hours,
        operations=data.operations,
        materials=data.materials,
        tools=data.tools,
    )
    return result


@router.post("/from-wr")
def create_from_work_request(
    data: WOFromWRRequest,
    user=Depends(require_role("admin", "manager", "planner")),
    db: Session = Depends(get_db),
):
    """Create a WO from an approved Work Request."""
    result = managed_wo_service.create_from_work_request(
        db, data.work_request_id, planned_by=user.get("user_id", ""),
    )
    if not result:
        raise HTTPException(status_code=400, detail="WR not found or not in approvable status")
    return result


@router.get("/")
def list_work_orders(
    status: str | None = None,
    plant_id: str | None = None,
    wo_type: str | None = None,
    priority: str | None = None,
    fast_track: bool | None = None,
    limit: int = 200,
    offset: int = 0,
    db: Session = Depends(get_db),
):
    return managed_wo_service.list_work_orders(db, status, plant_id, wo_type, priority, limit, offset, fast_track=fast_track)


@router.get("/stats")
def get_stats(plant_id: str | None = None, db: Session = Depends(get_db)):
    return managed_wo_service.get_stats(db, plant_id)


@router.get("/{wo_id}")
def get_work_order(wo_id: str, db: Session = Depends(get_db)):
    result = managed_wo_service.get_work_order(db, wo_id)
    if not result:
        raise HTTPException(status_code=404, detail="Work order not found")
    return result


@router.put("/{wo_id}")
def update_work_order(
    wo_id: str,
    data: WOUpdateRequest,
    user=Depends(require_role("admin", "manager", "planner")),
    db: Session = Depends(get_db),
):
    update_data = data.model_dump(exclude_none=True)
    result = managed_wo_service.update_work_order(db, wo_id, update_data)
    if not result:
        raise HTTPException(status_code=400, detail="WO not found or not editable (must be DRAFT/PLANNED)")
    return result


@router.put("/{wo_id}/release")
def release_work_order(
    wo_id: str,
    user=Depends(require_role("admin", "manager", "planner")),
    db: Session = Depends(get_db),
):
    result = managed_wo_service.release_wo(db, wo_id, user.get("user_id", ""))
    if not result:
        raise HTTPException(status_code=400, detail="Cannot release — WO not found or invalid status")
    return result


@router.put("/{wo_id}/schedule")
def schedule_work_order(
    wo_id: str,
    data: WOScheduleRequest = None,
    user=Depends(require_role("admin", "manager", "planner")),
    db: Session = Depends(get_db),
):
    workers = data.assigned_workers if data else None
    result = managed_wo_service.schedule_wo(db, wo_id, user.get("user_id", ""), workers)
    if not result:
        raise HTTPException(status_code=400, detail="Cannot schedule — WO not found or invalid status")
    return result


@router.put("/{wo_id}/start")
def start_work_order(wo_id: str, user=Depends(get_current_user), db: Session = Depends(get_db)):
    result = managed_wo_service.start_wo(db, wo_id, user.get("user_id", ""))
    if not result:
        raise HTTPException(status_code=400, detail="Cannot start — WO not found or invalid status")
    return result


@router.put("/{wo_id}/complete")
def complete_work_order(
    wo_id: str, data: WOCompleteRequest,
    user=Depends(get_current_user), db: Session = Depends(get_db),
):
    result = managed_wo_service.complete_wo(db, wo_id, user.get("user_id", ""), data.actual_hours)
    if not result:
        raise HTTPException(status_code=400, detail="Cannot complete — WO not found or invalid status")
    return result


@router.put("/{wo_id}/close")
def close_work_order(
    wo_id: str,
    user=Depends(require_role("admin", "manager", "planner")),
    db: Session = Depends(get_db),
):
    result = managed_wo_service.close_wo(db, wo_id, user.get("user_id", ""))
    if not result:
        raise HTTPException(status_code=400, detail="Cannot close — WO not found or invalid status")
    return result


@router.post("/{wo_id}/notes")
def add_note(wo_id: str, data: WONoteRequest, user=Depends(get_current_user), db: Session = Depends(get_db)):
    result = managed_wo_service.add_note(db, wo_id, user.get("user_id", ""), data.note)
    if not result:
        raise HTTPException(status_code=404, detail="Work order not found")
    return result


@router.put("/{wo_id}/progress")
def update_progress(wo_id: str, data: WOProgressRequest, user=Depends(get_current_user), db: Session = Depends(get_db)):
    result = managed_wo_service.update_progress(db, wo_id, data.completion_pct)
    if not result:
        raise HTTPException(status_code=400, detail="WO not found or not IN_PROGRESS")
    return result
