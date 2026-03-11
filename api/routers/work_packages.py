"""Work packages router — grouping, CRUD, approval, work instructions."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.dependencies.auth import get_current_user
from api.schemas import WPCreate, WPGroupRequest, WorkInstructionRequest
from api.services import work_package_service

router = APIRouter(prefix="/work-packages", tags=["work-packages"], dependencies=[Depends(get_current_user)])


@router.post("/")
def create_work_package(data: WPCreate, db: Session = Depends(get_db)):
    obj = work_package_service.create_work_package(db, data.model_dump())
    labour = obj.labour_summary or {}
    return {
        "work_package_id": obj.work_package_id, "name": obj.name, "code": obj.code,
        "status": obj.status, "constraint": obj.constraint,
        "tasks": len(obj.allocated_tasks or []),
        "total_hours": labour.get("total_hours", 0),
    }


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
def list_work_packages(node_id: str | None = None, status: str | None = None, plant_id: str | None = None, db: Session = Depends(get_db)):
    wps = work_package_service.list_work_packages(db, node_id=node_id, status=status)
    results = []
    for wp in wps:
        tasks_raw = wp.allocated_tasks if isinstance(wp.allocated_tasks, list) else []
        labour = wp.labour_summary if isinstance(wp.labour_summary, dict) else {}
        total_hours = labour.get("total_duration_hours", sum(t.get("duration_hours", 0) for t in tasks_raw if isinstance(t, dict)))
        tasks = [
            {
                "task_id": t.get("task_id", f"TASK-{i}"),
                "description": t.get("description", ""),
                "task_type": t.get("task_type") or t.get("wo_type", ""),
                "duration_hours": t.get("duration_hours", 0),
            }
            for i, t in enumerate(tasks_raw) if isinstance(t, dict)
        ]
        results.append({
            "work_package_id": wp.work_package_id,
            "name": wp.name,
            "code": wp.code,
            "status": wp.status,
            "plant_id": wp.node_id or "",
            "task_count": len(tasks),
            "total_duration_hours": total_hours,
            "tasks": tasks,
        })
    return results


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
