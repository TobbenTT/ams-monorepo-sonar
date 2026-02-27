"""Capture router — field capture submission and retrieval."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.schemas import CaptureCreate
from api.services import capture_service

router = APIRouter(prefix="/capture", tags=["capture"])


@router.post("/")
def submit_capture(data: CaptureCreate, db: Session = Depends(get_db)):
    result = capture_service.process_capture(db, data.model_dump())
    return result


@router.get("/")
def list_captures(db: Session = Depends(get_db)):
    from api.database.models import WorkRequestModel

    captures = capture_service.list_captures(db)
    result = []
    for c in captures:
        wr = db.query(WorkRequestModel).filter(
            WorkRequestModel.source_capture_id == c.capture_id
        ).first()
        result.append({
            "capture_id": c.capture_id,
            "technician_id": c.technician_id,
            "capture_type": c.capture_type,
            "language": c.language,
            "equipment_tag_manual": c.equipment_tag_manual,
            "raw_text_preview": (c.raw_text or "")[:100],
            "location_hint": c.location_hint,
            "work_request_id": wr.request_id if wr else None,
            "work_request_status": wr.status if wr else None,
            "equipment_tag_resolved": wr.equipment_tag if wr else None,
            "priority": (wr.ai_classification or {}).get("priority_suggested") if wr else None,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        })
    return result


@router.get("/{capture_id}")
def get_capture(capture_id: str, db: Session = Depends(get_db)):
    c = capture_service.get_capture(db, capture_id)
    if not c:
        raise HTTPException(status_code=404, detail="Capture not found")
    return {
        "capture_id": c.capture_id,
        "technician_id": c.technician_id,
        "capture_type": c.capture_type,
        "language": c.language,
        "raw_text": c.raw_text,
        "raw_voice_text": c.raw_voice_text,
        "equipment_tag_manual": c.equipment_tag_manual,
        "location_hint": c.location_hint,
        "created_at": c.created_at.isoformat() if c.created_at else None,
    }
