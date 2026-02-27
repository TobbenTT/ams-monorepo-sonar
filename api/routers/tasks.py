"""Tasks router — maintenance task CRUD and naming validation."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.schemas import TaskCreate, TaskNameValidate, WPNameValidate
from api.services import task_service

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post("/")
def create_task(data: TaskCreate, db: Session = Depends(get_db)):
    obj = task_service.create_task(db, data.model_dump())
    return {"task_id": obj.task_id, "name": obj.name, "task_type": obj.task_type, "status": obj.status}


@router.get("/{task_id}")
def get_task(task_id: str, db: Session = Depends(get_db)):
    obj = task_service.get_task(db, task_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Task not found")
    return {
        "task_id": obj.task_id, "name": obj.name, "task_type": obj.task_type,
        "constraint": obj.constraint, "frequency_value": obj.frequency_value,
        "frequency_unit": obj.frequency_unit, "status": obj.status,
        "labour_resources": obj.labour_resources, "material_resources": obj.material_resources,
    }


@router.get("/")
def list_tasks(failure_mode_id: str | None = None, status: str | None = None, db: Session = Depends(get_db)):
    tasks = task_service.list_tasks(db, failure_mode_id=failure_mode_id, status=status)
    return [{"task_id": t.task_id, "name": t.name, "task_type": t.task_type, "status": t.status} for t in tasks]


@router.post("/link-fm/{task_id}/{fm_id}")
def link_task_to_fm(task_id: str, fm_id: str, db: Session = Depends(get_db)):
    obj = task_service.link_task_to_fm(db, task_id, fm_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"task_id": obj.task_id, "failure_mode_id": obj.failure_mode_id}


@router.post("/validate-name")
def validate_task_name(data: TaskNameValidate):
    return task_service.validate_task_name(data.name, data.task_type)


@router.post("/validate-wp-name")
def validate_wp_name(data: WPNameValidate):
    return task_service.validate_wp_name(data.name)
