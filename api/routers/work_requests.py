"""Work requests router — list, get, validate, classify."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.schemas import WRValidateRequest
from api.services import work_request_service

router = APIRouter(prefix="/work-requests", tags=["work-requests"])


@router.get("/")
def list_work_requests(status: str | None = None, limit: int = 200, offset: int = 0, db: Session = Depends(get_db)):
    items = work_request_service.list_work_requests(db, status, limit=limit, offset=offset)
    return [
        {
            "request_id": wr.request_id,
            "status": wr.status,
            "equipment_tag": wr.equipment_tag,
            "equipment_confidence": wr.equipment_confidence,
            "ai_classification": wr.ai_classification,
            "created_at": wr.created_at.isoformat() if wr.created_at else None,
        }
        for wr in items
    ]


@router.get("/{request_id}")
def get_work_request(request_id: str, db: Session = Depends(get_db)):
    wr = work_request_service.get_work_request(db, request_id)
    if not wr:
        raise HTTPException(status_code=404, detail="Work request not found")
    return {
        "request_id": wr.request_id,
        "source_capture_id": wr.source_capture_id,
        "status": wr.status,
        "equipment_id": wr.equipment_id,
        "equipment_tag": wr.equipment_tag,
        "equipment_confidence": wr.equipment_confidence,
        "problem_description": wr.problem_description,
        "ai_classification": wr.ai_classification,
        "spare_parts": wr.spare_parts,
        "image_analysis": wr.image_analysis,
        "validation": wr.validation,
        "created_at": wr.created_at.isoformat() if wr.created_at else None,
    }


@router.put("/{request_id}/validate")
def validate_work_request(request_id: str, data: WRValidateRequest, db: Session = Depends(get_db)):
    if data.action not in ("APPROVE", "REJECT", "MODIFY"):
        raise HTTPException(status_code=400, detail="action must be APPROVE, REJECT, or MODIFY")
    result = work_request_service.validate_work_request(db, request_id, data.action, data.modifications)
    if not result:
        raise HTTPException(status_code=404, detail="Work request not found")
    return result


@router.post("/{request_id}/classify")
def classify_work_request(request_id: str, db: Session = Depends(get_db)):
    result = work_request_service.classify_work_request(db, request_id)
    if not result:
        raise HTTPException(status_code=404, detail="Work request not found")
    return result
