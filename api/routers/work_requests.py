"""Work requests router — list, get, validate, classify, duplicates, OCR closure."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from typing import Optional

from api.database.connection import get_db
from api.schemas import WRValidateRequest
from api.services import work_request_service


class DuplicateCheckRequest(BaseModel):
    equipment_tag: str
    problem_description: str = ""


class OCRClosureRequest(BaseModel):
    work_order_id: str
    actual_hours: float = Field(ge=0)
    completion_date: str = ""
    findings: str = ""
    spare_parts_used: str = ""
    condition_after: str = "Good"
    technician_notes: str = ""
    ocr_confidence: float = Field(default=0, ge=0, le=100)


class WRFromHierarchyRequest(BaseModel):
    equipment_tag: str
    equipment_name: str = ""
    plant_id: str = ""
    problem_description: str = ""
    priority: str = "P3"


router = APIRouter(prefix="/work-requests", tags=["work-requests"])


@router.get("/")
def list_work_requests(status: str | None = None, limit: int = 200, offset: int = 0, db: Session = Depends(get_db)):
    items = work_request_service.list_work_requests(db, status, limit=limit, offset=offset)
    results = []
    for wr in items:
        ai = wr.ai_classification if isinstance(wr.ai_classification, dict) else {}
        results.append({
            "request_id": wr.request_id,
            "status": wr.status,
            "equipment_tag": wr.equipment_tag,
            "equipment_name": ai.get("equipment_name") or wr.equipment_tag,
            "equipment_confidence": wr.equipment_confidence,
            "plant_id": ai.get("plant_id", ""),
            "priority": ai.get("priority_suggested") or ai.get("priority", "P3"),
            "failure_description": ai.get("failure_description", ""),
            "production_impact": ai.get("production_impact", ""),
            "estimated_duration": ai.get("estimated_duration_hours", 0),
            "problem_description": wr.problem_description,
            "ai_classification": wr.ai_classification,
            "spare_parts": wr.spare_parts,
            "created_by": ai.get("technician_id") or ai.get("source", ""),
            "created_at": wr.created_at.isoformat() if wr.created_at else None,
        })
    return results


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


@router.delete("/{request_id}")
def delete_work_request(request_id: str, db: Session = Depends(get_db)):
    deleted = work_request_service.delete_work_request(db, request_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Work request not found")
    return {"ok": True, "request_id": request_id}


@router.post("/{request_id}/classify")
def classify_work_request(request_id: str, db: Session = Depends(get_db)):
    result = work_request_service.classify_work_request(db, request_id)
    if not result:
        raise HTTPException(status_code=404, detail="Work request not found")
    return result


@router.post("/check-duplicates")
def check_duplicates(data: DuplicateCheckRequest, db: Session = Depends(get_db)):
    """Find potential duplicate work requests for the same equipment with open status."""
    open_statuses = ["DRAFT", "PENDING_VALIDATION", "VALIDATED", "IN_PROGRESS"]
    all_wrs = work_request_service.list_work_requests(db, status=None, limit=500, offset=0)
    duplicates = []
    for wr in all_wrs:
        if wr.equipment_tag == data.equipment_tag and wr.status in open_statuses:
            duplicates.append({
                "request_id": wr.request_id,
                "status": wr.status,
                "equipment_tag": wr.equipment_tag,
                "problem_description": getattr(wr, "problem_description", ""),
                "created_at": wr.created_at.isoformat() if wr.created_at else None,
            })
    return {"equipment_tag": data.equipment_tag, "duplicate_count": len(duplicates), "duplicates": duplicates}


@router.post("/from-hierarchy")
def create_wr_from_hierarchy(data: WRFromHierarchyRequest, db: Session = Depends(get_db)):
    """Create a work request directly from the hierarchy view for a specific equipment."""
    import uuid
    from datetime import datetime, timezone
    from api.database.models import WorkRequestModel

    wr = WorkRequestModel(
        request_id=str(uuid.uuid4()),
        status="DRAFT",
        equipment_id=data.equipment_tag,
        equipment_tag=data.equipment_tag,
        problem_description=data.problem_description or f"Work request for {data.equipment_name or data.equipment_tag}",
        ai_classification={"priority": data.priority, "source": "hierarchy", "plant_id": data.plant_id},
        created_at=datetime.now(timezone.utc),
    )
    db.add(wr)
    db.commit()
    db.refresh(wr)
    return {
        "request_id": wr.request_id,
        "status": wr.status,
        "equipment_tag": wr.equipment_tag,
        "created_at": wr.created_at.isoformat() if wr.created_at else None,
    }


@router.post("/ocr-closure")
def ocr_work_order_closure(data: OCRClosureRequest, db: Session = Depends(get_db)):
    """Process OCR-based work order closure.
    Accepts data extracted from a photo of a paper work order.
    Returns closure confirmation for SAP integration."""
    return {
        "work_order_id": data.work_order_id,
        "status": "CLOSURE_SUBMITTED",
        "actual_hours": data.actual_hours,
        "completion_date": data.completion_date,
        "findings": data.findings,
        "spare_parts_used": data.spare_parts_used,
        "condition_after": data.condition_after,
        "technician_notes": data.technician_notes,
        "ocr_confidence": data.ocr_confidence,
        "sap_transaction": "IW32",
        "message": "Closure request submitted. SAP transaction IW32 will be triggered on integration.",
    }
