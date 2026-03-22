"""Work requests router — list, get, validate, classify, duplicates, OCR closure."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from typing import Optional

from api.database.connection import get_db
from api.dependencies.auth import get_current_user, require_role
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


class WRApproveRequest(BaseModel):
    comment: str = Field(min_length=1, description="Mandatory approval comment")
    priority_override: str | None = None  # P1, P2, P3, P4


class WRRejectRequest(BaseModel):
    reason: str = Field(min_length=1, description="Mandatory rejection reason")


class WRAssignWorker(BaseModel):
    worker_id: str
    worker_name: str = ""


class WRAssignRequest(BaseModel):
    workers: list[WRAssignWorker]


class WRManualCreateRequest(BaseModel):
    """Create a WR directly without AI processing — for manual form entry."""
    equipment_tag: str
    equipment_name: str = ""
    plant_id: str = ""
    problem_description: str = ""
    priority: str = "P3"
    activity_class: str = ""
    failure_category: str = ""
    failure_symptom: str = ""
    failure_cause: str = ""
    plant_condition: str = ""
    suggested_action: str = ""
    estimated_duration: float = 4
    materials: list[str] = []
    resources: list[str] = []
    created_by: str = ""


class WRFromHierarchyRequest(BaseModel):
    equipment_tag: str
    equipment_name: str = ""
    plant_id: str = ""
    problem_description: str = ""
    priority: str = "P3"


router = APIRouter(prefix="/work-requests", tags=["work-requests"], dependencies=[Depends(get_current_user)])


@router.get("/equipment-history/{equipment_tag}")
def get_equipment_history(equipment_tag: str, exclude_id: str | None = None, limit: int = 10, db: Session = Depends(get_db)):
    """Get previous WRs for the same equipment — supervisor reviews history before approving."""
    history = work_request_service.get_equipment_history(db, equipment_tag, exclude_id, limit)
    return {"equipment_tag": equipment_tag, "count": len(history), "history": history}


@router.get("/")
def list_work_requests(status: str | None = None, plant_id: str | None = None, limit: int = 200, offset: int = 0, db: Session = Depends(get_db)):
    from api.database.models import FieldCaptureModel
    items = work_request_service.list_work_requests(db, status, plant_id=plant_id, limit=limit, offset=offset)
    # Batch-load photos from linked captures
    capture_ids = [wr.source_capture_id for wr in items if wr.source_capture_id]
    captures_map = {}
    if capture_ids:
        captures = db.query(FieldCaptureModel).filter(FieldCaptureModel.capture_id.in_(capture_ids)).all()
        captures_map = {c.capture_id: c.images or [] for c in captures}

    results = []
    for wr in items:
        ai = wr.ai_classification if isinstance(wr.ai_classification, dict) else {}
        photos = captures_map.get(wr.source_capture_id, [])
        results.append({
            "request_id": wr.request_id,
            "status": wr.status,
            "equipment_tag": wr.equipment_tag,
            "equipment_name": ai.get("equipment_name") or wr.equipment_tag,
            "equipment_confidence": wr.equipment_confidence,
            "plant_id": ai.get("plant_id", ""),
            "priority": wr.priority_code or ai.get("priority_suggested") or ai.get("priority", "P3"),
            "priority_code": wr.priority_code,
            "work_class": wr.work_class,
            "sla_deadline": wr.sla_deadline.isoformat() if wr.sla_deadline else None,
            "clase_ot": ai.get("clase_ot", ""),
            "activity_class": ai.get("activity_class", ""),
            "failure_description": ai.get("failure_description", ""),
            "production_impact": ai.get("production_impact", ""),
            "estimated_duration": ai.get("estimated_duration_hours", 0),
            "problem_description": wr.problem_description,
            "ai_classification": wr.ai_classification,
            "spare_parts": wr.spare_parts,
            "photos": photos,
            "technician_name": ai.get("technician_name", ""),
            "created_by": wr.created_by or ai.get("technician_id") or ai.get("source", ""),
            "assigned_to": (wr.validation or {}).get("assigned_to", ""),
            "assigned_to_name": (wr.validation or {}).get("assigned_to_name", ""),
            "approval_comment": wr.approval_comment,
            "rejection_reason": wr.rejection_reason,
            "approver_id": wr.approver_id,
            "approved_at": wr.approved_at.isoformat() if wr.approved_at else None,
            "created_at": wr.created_at.isoformat() if wr.created_at else None,
        })
    return results


@router.get("/{request_id}")
def get_work_request(request_id: str, db: Session = Depends(get_db)):
    from api.database.models import FieldCaptureModel
    wr = work_request_service.get_work_request(db, request_id)
    if not wr:
        raise HTTPException(status_code=404, detail="Work request not found")
    photos = []
    if wr.source_capture_id:
        cap = db.query(FieldCaptureModel).filter(FieldCaptureModel.capture_id == wr.source_capture_id).first()
        if cap and cap.images:
            photos = cap.images
    ai = wr.ai_classification if isinstance(wr.ai_classification, dict) else {}
    pd = wr.problem_description if isinstance(wr.problem_description, dict) else {}
    return {
        "request_id": wr.request_id,
        "source_capture_id": wr.source_capture_id,
        "status": wr.status,
        "equipment_id": wr.equipment_id,
        "equipment_tag": wr.equipment_tag,
        "equipment_confidence": wr.equipment_confidence,
        "plant_id": ai.get("plant_id", ""),
        "priority": ai.get("priority_suggested") or ai.get("priority", "P3"),
        "clase_ot": ai.get("clase_ot", ""),
        "activity_class": ai.get("activity_class", ""),
        "technician_name": ai.get("technician_name", ""),
        "technician_id": ai.get("technician_id", ""),
        "plant_condition": ai.get("plant_condition", ""),
        "technical_location": ai.get("technical_location", ""),
        "technical_location_code": ai.get("technical_location_code", ""),
        "estimated_duration": ai.get("estimated_duration_hours", 0),
        "description": pd.get("original_text", ""),
        "suggested_action": pd.get("suggested_action", ""),
        "resources": pd.get("resources", []),
        "materials": pd.get("materials", []),
        "special_equipment": pd.get("special_equipment", ""),
        "failure_catalog": pd.get("failure_catalog"),
        "problem_description": wr.problem_description,
        "ai_classification": wr.ai_classification,
        "spare_parts": wr.spare_parts,
        "image_analysis": wr.image_analysis,
        "validation": wr.validation,
        "assigned_to": (wr.validation or {}).get("assigned_to", ""),
        "assigned_to_name": (wr.validation or {}).get("assigned_to_name", ""),
        "assigned_to_specialty": (wr.validation or {}).get("assigned_to_specialty", ""),
        "assigned_workers": (wr.validation or {}).get("assigned_workers", []),
        "assigned_at": (wr.validation or {}).get("assigned_at", ""),
        "photos": photos,
        "priority_code": wr.priority_code,
        "work_class": wr.work_class,
        "sla_deadline": wr.sla_deadline.isoformat() if wr.sla_deadline else None,
        "approval_comment": wr.approval_comment,
        "rejection_reason": wr.rejection_reason,
        "approver_id": wr.approver_id,
        "approved_at": wr.approved_at.isoformat() if wr.approved_at else None,
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


@router.put("/{request_id}/approve")
def approve_work_request(request_id: str, data: WRApproveRequest, user=Depends(require_role("admin", "manager", "planner")), db: Session = Depends(get_db)):
    """Supervisor approves a WR with mandatory comment (Jorge Work Management)."""
    result = work_request_service.approve_work_request(
        db, request_id, approver_id=getattr(user, "user_id", ""), comment=data.comment,
        priority_override=data.priority_override,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Work request not found")
    return result


@router.put("/{request_id}/reject")
def reject_work_request(request_id: str, data: WRRejectRequest, user=Depends(require_role("admin", "manager", "planner")), db: Session = Depends(get_db)):
    """Supervisor rejects a WR with mandatory reason (Jorge Work Management)."""
    result = work_request_service.reject_work_request(
        db, request_id, approver_id=getattr(user, "user_id", ""), reason=data.reason,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Work request not found")
    return result


@router.put("/{request_id}/assign")
def assign_work_request(request_id: str, data: WRAssignRequest, user=Depends(require_role("admin", "manager", "planner")), db: Session = Depends(get_db)):
    """Assign a validated WR to one or more technicians."""
    from datetime import datetime
    from api.database.models import WorkforceModel
    from sqlalchemy.orm.attributes import flag_modified
    wr = work_request_service.get_work_request(db, request_id)
    if not wr:
        raise HTTPException(status_code=404, detail="Work request not found")
    if wr.status not in ("VALIDATED", "APPROVED", "ASSIGNED"):
        raise HTTPException(status_code=400, detail=f"Cannot assign WR in status {wr.status}")
    if not data.workers:
        raise HTTPException(status_code=400, detail="At least one worker is required")
    # Validate all workers exist and build the list
    assigned_workers = []
    for w in data.workers:
        worker = db.query(WorkforceModel).filter(WorkforceModel.worker_id == w.worker_id).first()
        if not worker:
            raise HTTPException(status_code=404, detail=f"Technician {w.worker_id} not found")
        assigned_workers.append({
            "worker_id": worker.worker_id,
            "name": worker.name,
            "specialty": worker.specialty or "",
        })
    # Store in validation JSON (copy dict so SQLAlchemy detects change)
    validation = dict(wr.validation) if isinstance(wr.validation, dict) else {}
    validation["assigned_workers"] = assigned_workers
    validation["assigned_at"] = datetime.now().isoformat()
    # Keep backward compat with single-assign fields (first worker)
    validation["assigned_to"] = assigned_workers[0]["worker_id"]
    validation["assigned_to_name"] = assigned_workers[0]["name"]
    validation["assigned_to_specialty"] = assigned_workers[0]["specialty"]
    wr.validation = validation
    wr.status = "ASSIGNED"
    flag_modified(wr, "validation")
    from api.services.audit_service import log_action
    log_action(db, "work_request", request_id, "ASSIGN")
    db.commit()
    db.refresh(wr)
    names = ", ".join(w["name"] for w in assigned_workers)
    return {"ok": True, "status": wr.status, "assigned_workers": assigned_workers, "assigned_to": names}


class WRCompleteRequest(BaseModel):
    completion_notes: str = ""
    actual_hours: float = 0


class WRCloseRequest(BaseModel):
    closure_notes: str = ""


@router.put("/{request_id}/start")
def start_work_request(request_id: str, user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Transition WR to IN_PROGRESS."""
    result = work_request_service.start_work_request(db, request_id, user_id=getattr(user, "user_id", ""))
    if not result:
        raise HTTPException(status_code=400, detail="Cannot start — WR not found or invalid status")
    return result


@router.put("/{request_id}/complete")
def complete_work_request(request_id: str, data: WRCompleteRequest, user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Transition WR to COMPLETED."""
    result = work_request_service.complete_work_request(
        db, request_id, user_id=getattr(user, "user_id", ""),
        completion_notes=data.completion_notes, actual_hours=data.actual_hours,
    )
    if not result:
        raise HTTPException(status_code=400, detail="Cannot complete — WR not found or not IN_PROGRESS")
    return result


@router.put("/{request_id}/close")
def close_work_request(request_id: str, data: WRCloseRequest, user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Technical closure of WR."""
    result = work_request_service.close_work_request(
        db, request_id, user_id=getattr(user, "user_id", ""), closure_notes=data.closure_notes,
    )
    if not result:
        raise HTTPException(status_code=400, detail="Cannot close — WR not found or invalid status")
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


@router.post("/manual")
def create_wr_manual(data: WRManualCreateRequest, user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Create a WR directly from a manual form — NO AI pipeline, data preserved as-is."""
    import uuid
    from datetime import datetime, timezone
    from api.database.models import WorkRequestModel

    now = datetime.now(timezone.utc)
    wr = WorkRequestModel(
        request_id=str(uuid.uuid4()),
        status="DRAFT",
        equipment_id=data.equipment_tag,
        equipment_tag=data.equipment_tag,
        priority_code=data.priority,
        work_class=work_request_service.derive_work_class(data.priority),
        created_by=data.created_by or getattr(user, "user_id", ""),
        problem_description={
            "original_text": data.problem_description,
            "suggested_action": data.suggested_action,
            "failure_mode_detected": data.failure_category,
            "failure_symptom": data.failure_symptom,
            "failure_cause": data.failure_cause,
            "resources": data.resources,
            "materials": data.materials,
        },
        ai_classification={
            "priority_suggested": data.priority,
            "plant_id": data.plant_id,
            "equipment_name": data.equipment_name,
            "activity_class": data.activity_class,
            "plant_condition": data.plant_condition,
            "estimated_duration_hours": data.estimated_duration,
            "source": "manual_form",
        },
        created_at=now,
    )
    db.add(wr)
    from api.services.audit_service import log_action
    log_action(db, "work_request", wr.request_id, "CREATE_MANUAL")
    db.commit()
    db.refresh(wr)
    return {
        "request_id": wr.request_id,
        "status": wr.status,
        "equipment_tag": wr.equipment_tag,
        "priority_code": wr.priority_code,
        "created_at": wr.created_at.isoformat() if wr.created_at else None,
    }


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
