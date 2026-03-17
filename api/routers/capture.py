"""Capture router — field capture submission and retrieval."""

from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.dependencies.auth import get_current_user
from api.schemas import CaptureCreate
from api.services import capture_service
from api.services.capture_service import PHOTO_DIR

router = APIRouter(prefix="/capture", tags=["capture"], dependencies=[Depends(get_current_user)])

# Public router for serving photos (no auth — used by <img> tags)
photos_router = APIRouter(prefix="/capture", tags=["capture"])


@photos_router.get("/photos/{filename}")
def get_capture_photo(filename: str):
    """Serve a saved capture photo (public — no auth required)."""
    safe_name = Path(filename).name
    filepath = PHOTO_DIR / safe_name
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="Photo not found")
    media_type = "image/jpeg"
    if safe_name.endswith(".png"):
        media_type = "image/png"
    elif safe_name.endswith(".webp"):
        media_type = "image/webp"
    return FileResponse(filepath, media_type=media_type)


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


@router.delete("/{capture_id}")
def delete_capture(capture_id: str, db: Session = Depends(get_db)):
    from api.database.models import FieldCaptureModel, WorkRequestModel
    c = db.query(FieldCaptureModel).filter(FieldCaptureModel.capture_id == capture_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Capture not found")
    # Also delete linked work request if exists
    db.query(WorkRequestModel).filter(WorkRequestModel.source_capture_id == capture_id).delete()
    db.delete(c)
    db.commit()
    return {"deleted": capture_id}


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
        "photos": c.images or [],
        "created_at": c.created_at.isoformat() if c.created_at else None,
    }
