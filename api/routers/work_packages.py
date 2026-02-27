"""Work packages router — grouping, CRUD, approval, work instructions."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.schemas import WPCreate, WPGroupRequest, WorkInstructionRequest
from api.services import work_package_service

router = APIRouter(prefix="/work-packages", tags=["work-packages"])


@router.post("/")
def create_work_package(data: WPCreate, db: Session = Depends(get_db)):
    obj = work_package_service.create_work_package(db, data.model_dump())
    return {"work_package_id": obj.work_package_id, "name": obj.name, "code": obj.code, "status": obj.status}


@router.get("/{wp_id}")
def get_work_package(wp_id: str, db: Session = Depends(get_db)):
    obj = work_package_service.get_work_package(db, wp_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Work package not found")
    return {
        "work_package_id": obj.work_package_id, "name": obj.name, "code": obj.code,
        "node_id": obj.node_id, "frequency_value": obj.frequency_value,
        "frequency_unit": obj.frequency_unit, "constraint": obj.constraint,
        "work_package_type": obj.work_package_type, "status": obj.status,
        "allocated_tasks": obj.allocated_tasks, "labour_summary": obj.labour_summary,
    }


@router.get("/")
def list_work_packages(node_id: str | None = None, status: str | None = None, db: Session = Depends(get_db)):
    wps = work_package_service.list_work_packages(db, node_id=node_id, status=status)
    return [{"work_package_id": wp.work_package_id, "name": wp.name, "code": wp.code, "status": wp.status} for wp in wps]


@router.put("/{wp_id}/approve")
def approve_work_package(wp_id: str, db: Session = Depends(get_db)):
    obj = work_package_service.approve_work_package(db, wp_id)
    if not obj:
        raise HTTPException(status_code=409, detail="Cannot approve: work package not found or invalid state")
    return {"work_package_id": obj.work_package_id, "status": obj.status}


@router.post("/group")
def group_tasks(data: WPGroupRequest):
    return work_package_service.group_tasks(data.items)


@router.post("/{wp_id}/work-instruction")
def generate_work_instruction(wp_id: str, data: WorkInstructionRequest, db: Session = Depends(get_db)):
    wp = work_package_service.get_work_package(db, wp_id)
    if not wp:
        raise HTTPException(status_code=404, detail="Work package not found")
    return work_package_service.generate_work_instruction(
        wp_name=wp.name, wp_code=wp.code,
        equipment_name=data.equipment_name,
        equipment_tag=data.equipment_tag,
        frequency=f"{wp.frequency_value} {wp.frequency_unit}",
        constraint=wp.constraint,
        tasks=data.tasks,
    )
