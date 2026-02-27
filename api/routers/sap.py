"""SAP router — upload generation, approval, mock data access."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.schemas import SAPUploadRequest, SAPTransitionRequest
from api.services import sap_service

router = APIRouter(prefix="/sap", tags=["sap"])


@router.post("/generate-upload")
def generate_upload(data: SAPUploadRequest, db: Session = Depends(get_db)):
    obj = sap_service.generate_upload(
        db,
        plant_code=data.plant_code,
        maintenance_plan=data.maintenance_plan,
        maintenance_items=data.maintenance_items,
        task_lists=data.task_lists,
    )
    return {"package_id": obj.package_id, "status": obj.status}


@router.get("/uploads/{package_id}")
def get_upload(package_id: str, db: Session = Depends(get_db)):
    obj = sap_service.get_upload(db, package_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Upload package not found")
    return {
        "package_id": obj.package_id, "plant_code": obj.plant_code,
        "status": obj.status, "generated_at": obj.generated_at.isoformat() if obj.generated_at else None,
        "maintenance_plan": obj.maintenance_plan,
        "maintenance_items": obj.maintenance_items,
        "task_lists": obj.task_lists,
    }


@router.get("/uploads")
def list_uploads(plant_code: str | None = None, db: Session = Depends(get_db)):
    uploads = sap_service.list_uploads(db, plant_code=plant_code)
    return [{"package_id": u.package_id, "plant_code": u.plant_code, "status": u.status} for u in uploads]


@router.put("/uploads/{package_id}/approve")
def approve_upload(package_id: str, db: Session = Depends(get_db)):
    result = sap_service.approve_upload(db, package_id)
    if "error" in result:
        raise HTTPException(status_code=409, detail=result["error"])
    return result


@router.post("/validate-transition")
def validate_transition(data: SAPTransitionRequest):
    return sap_service.validate_state_transition(
        entity_type=data.entity_type,
        current_state=data.current_state,
        target_state=data.target_state,
    )


@router.get("/mock/{transaction}")
def get_mock_data(transaction: str):
    result = sap_service.get_mock_data(transaction)
    if isinstance(result, dict) and "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result
