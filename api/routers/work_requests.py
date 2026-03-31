"""Work requests router — list, get, validate, classify, duplicates, OCR closure."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from typing import Optional

from api.database.connection import get_db
from api.dependencies.auth import get_current_user, require_role
from api.schemas import WRValidateRequest
from api.services import work_request_service
from api.services import vision_service
from api.services import context_builder_service as ctx_builder


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


class ImageAssistRequest(BaseModel):
    image: str = ""  # single base64 image (legacy)
    images: list = []  # multiple base64 images
    equipment_tag: str = ""
    additional_context: str = ""

class AIFeedbackCreate(BaseModel):
    field_name: str = ""
    predicted_value: str = ""
    actual_value: str = ""
    rating: int = 0  # -1 bad, 0 neutral, 1 good

class AIAssistRequest(BaseModel):
    """Request AI assistance to fill aviso fields based on description."""
    description: str = ""
    equipment_tag: str = ""
    plant_condition: str = ""
    # Fields already filled by user (AI should NOT overwrite these)
    existing_priority: str = ""
    existing_category: str = ""
    existing_action: str = ""


class WRManualCreateRequest(BaseModel):
    """Create a WR directly without AI processing — for manual form entry."""
    equipment_tag: str = ""
    equipment_name: str = ""
    plant_id: str = ""
    problem_description: str = ""
    priority: str = "P3"
    activity_class: str = ""
    failure_category: str = ""
    failure_symptom: str = ""
    failure_object_part: str = ""
    failure_cause: str = ""
    plant_condition: str = ""
    suggested_action: str = ""
    estimated_duration: float = 4
    materials: list = []  # list of str or dict
    resources: list = []  # list of str or dict
    created_by: str = ""
    notification_type: str = "A1"
    reported_by: str = ""
    circumstances: str = ""
    support_equipment: list = []
    documents: list = []
    technical_location: str = ""
    aviso_coding: str = ""
    planning_group: str = ""
    area_empresa: str = ""
    work_center: str = ""
    work_conditions: str = ""


class WRFromHierarchyRequest(BaseModel):
    equipment_tag: str
    equipment_name: str = ""
    plant_id: str = ""
    problem_description: str = ""
    priority: str = "P3"


router = APIRouter(prefix="/work-requests", tags=["work-requests"], dependencies=[Depends(get_current_user)])


@router.get("/search-materials")
def search_materials(q: str = "", category: str = "", limit: int = 20, db: Session = Depends(get_db)):
    """Search SAP materials catalog by description or SAP ID."""
    from sqlalchemy import text
    query = "SELECT sap_id, description, category, unit FROM sap_materials WHERE 1=1"
    params = {}
    if q:
        query += " AND (sap_id LIKE :q OR LOWER(description) LIKE :q)"
        params["q"] = f"%{q.lower()}%"
    if category:
        query += " AND category = :cat"
        params["cat"] = category.upper()
    query += " ORDER BY description LIMIT :lim"
    params["lim"] = limit
    rows = db.execute(text(query), params).fetchall()
    return [{"sapId": r[0], "description": r[1], "category": r[2], "unit": r[3]} for r in rows]


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

    # Build user lookup for resolving created_by UUIDs to names
    from api.database.models import UserModel
    all_users = {u.user_id: u.full_name or u.username for u in db.query(UserModel.user_id, UserModel.full_name, UserModel.username).all()}

    results = []
    for wr in items:
        ai = wr.ai_classification if isinstance(wr.ai_classification, dict) else {}
        photos = captures_map.get(wr.source_capture_id, [])
        # Fallback: extract photos from documents if no capture photos
        if not photos and wr.documents:
            docs = wr.documents if isinstance(wr.documents, list) else []
            photos = [d.get("data", "") for d in docs if isinstance(d, dict) and d.get("type") == "photo" and d.get("data")]
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
            "failure_description": (wr.problem_description or {}).get("original_text", "")[:200] if isinstance(wr.problem_description, dict) else "",
            "production_impact": ai.get("production_impact", ""),
            "estimated_duration": ai.get("estimated_duration_hours", 0),
            "problem_description": wr.problem_description,
            "ai_classification": wr.ai_classification,
            "spare_parts": wr.spare_parts,
            "photos": photos,
            "technician_name": ai.get("technician_name", ""),
            "created_by": all_users.get(wr.created_by, wr.created_by) if wr.created_by else "",
            "assigned_to": (wr.validation or {}).get("assigned_to", ""),
            "assigned_to_name": (wr.validation or {}).get("assigned_to_name", ""),
            "approval_comment": wr.approval_comment,
            "rejection_reason": wr.rejection_reason,
            "approver_id": wr.approver_id,
            "approved_at": wr.approved_at.isoformat() if wr.approved_at else None,
            "created_at": wr.created_at.isoformat() if wr.created_at else None,
            # SAP Aviso fields
            "notification_type": getattr(wr, "notification_type", "A1") or "A1",
            "reported_by": getattr(wr, "reported_by", None),
            "circumstances": getattr(wr, "circumstances", None),
            "support_equipment": getattr(wr, "support_equipment", None),
            "technical_location": ai.get("technical_location", ""),
        })
    return results


@router.get("/{request_id}")
def get_work_request(request_id: str, db: Session = Depends(get_db)):
    from api.database.models import FieldCaptureModel
    wr = work_request_service.get_work_request(db, request_id)
    if not wr:
        raise HTTPException(status_code=404, detail="Work request not found")
    # Resolve created_by UUID to name
    from api.database.models import UserModel
    _created_name = wr.created_by or ""
    if _created_name and len(_created_name) > 30:  # looks like UUID
        _user = db.query(UserModel).filter(UserModel.user_id == _created_name).first()
        if _user:
            _created_name = _user.full_name or _user.username

    photos = []
    if wr.source_capture_id:
        cap = db.query(FieldCaptureModel).filter(FieldCaptureModel.capture_id == wr.source_capture_id).first()
        if cap and cap.images:
            photos = cap.images
    # Fallback: photos from documents
    if not photos and wr.documents:
        docs = wr.documents if isinstance(wr.documents, list) else []
        photos = [d.get("data", "") for d in docs if isinstance(d, dict) and d.get("type") == "photo" and d.get("data")]
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
        "created_by": _created_name,
        "created_at": wr.created_at.isoformat() if wr.created_at else None,
        # SAP Aviso fields
        "notification_type": getattr(wr, "notification_type", "A1") or "A1",
        "reported_by": getattr(wr, "reported_by", None),
        "reported_at": getattr(wr, "reported_at", None),
        "circumstances": getattr(wr, "circumstances", None),
        "support_equipment": getattr(wr, "support_equipment", None),
        "documents": getattr(wr, "documents", None),
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



@router.put("/{request_id}/cancel")
def cancel_work_request(request_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    """Cancel a work request."""
    from api.database.models import WorkRequestModel
    from datetime import datetime
    wr_model = db.query(WorkRequestModel).filter(WorkRequestModel.request_id == request_id).first()
    if not wr_model:
        raise HTTPException(status_code=404, detail="Work request not found")
    wr_model.status = "CANCELADO"
    wr_model.updated_at = datetime.now()
    db.commit()
    return {"status": "CANCELADO", "request_id": request_id}

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


class WRUpdateRequest(BaseModel):
    """Generic update for WR fields (supervisor)."""
    priority: str | None = None
    description: str | None = None
    suggested_action: str | None = None
    failure_category: str | None = None
    failure_symptom: str | None = None
    failure_cause: str | None = None
    estimated_duration: float | None = None
    production_impact: str | None = None


@router.put("/{request_id}")
def update_work_request(request_id: str, data: WRUpdateRequest, db: Session = Depends(get_db)):
    """Generic update endpoint for WR fields."""
    from datetime import datetime
    from sqlalchemy.orm.attributes import flag_modified
    from api.services.audit_service import log_action

    wr = work_request_service.get_work_request(db, request_id)
    if not wr:
        raise HTTPException(status_code=404, detail="Work request not found")

    if data.priority:
        wr.priority_code = data.priority
    if data.description is not None:
        pd = dict(wr.problem_description) if isinstance(wr.problem_description, dict) else {}
        pd["original_text"] = data.description
        wr.problem_description = pd
        flag_modified(wr, "problem_description")
    if data.suggested_action is not None:
        pd = dict(wr.problem_description) if isinstance(wr.problem_description, dict) else {}
        pd["suggested_action"] = data.suggested_action
        wr.problem_description = pd
        flag_modified(wr, "problem_description")
    if data.failure_category is not None:
        ai = dict(wr.ai_classification) if isinstance(wr.ai_classification, dict) else {}
        ai["failure_category"] = data.failure_category
        wr.ai_classification = ai
        flag_modified(wr, "ai_classification")
    if data.failure_symptom is not None:
        pd = dict(wr.problem_description) if isinstance(wr.problem_description, dict) else {}
        pd["failure_symptom"] = data.failure_symptom
        wr.problem_description = pd
        flag_modified(wr, "problem_description")
    if data.failure_cause is not None:
        pd = dict(wr.problem_description) if isinstance(wr.problem_description, dict) else {}
        pd["failure_cause"] = data.failure_cause
        wr.problem_description = pd
        flag_modified(wr, "problem_description")
    if data.estimated_duration is not None:
        ai = dict(wr.ai_classification) if isinstance(wr.ai_classification, dict) else {}
        ai["estimated_duration_hours"] = data.estimated_duration
        wr.ai_classification = ai
        flag_modified(wr, "ai_classification")
    if data.production_impact is not None:
        ai = dict(wr.ai_classification) if isinstance(wr.ai_classification, dict) else {}
        ai["production_impact"] = data.production_impact
        wr.ai_classification = ai
        flag_modified(wr, "ai_classification")

    wr.updated_at = datetime.now()
    log_action(db, "work_request", request_id, "UPDATE")
    db.commit()
    db.refresh(wr)
    return work_request_service._to_dict(wr)


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
    """Find potential duplicate work requests for the same equipment with open status (last 30 days)."""
    from datetime import datetime, timedelta
    open_statuses = ["DRAFT", "PENDING_VALIDATION", "VALIDATED", "IN_PROGRESS", "PENDIENTE", "APROBADO"]
    cutoff = datetime.now() - timedelta(days=30)
    all_wrs = work_request_service.list_work_requests(db, status=None, limit=500, offset=0)
    duplicates = []
    desc_lower = (data.problem_description or "").lower()
    # Extract potential equipment tags from description text
    desc_words = set(desc_lower.replace(",", " ").replace(".", " ").split())
    for wr in all_wrs:
        # Match by equipment_tag if provided, OR by tag mentioned in description
        tag_match = False
        if data.equipment_tag and wr.equipment_tag == data.equipment_tag:
            tag_match = True
        elif not data.equipment_tag and wr.equipment_tag:
            # Check if any WR's equipment_tag appears in the description text
            if wr.equipment_tag.lower() in desc_lower:
                tag_match = True
            # Also check individual words match the tag
            for w in desc_words:
                if len(w) > 3 and w in wr.equipment_tag.lower():
                    tag_match = True
                    break
        if not tag_match:
            continue
        if wr.status not in open_statuses:
            continue
        if wr.created_at and wr.created_at < cutoff:
            continue
        # Basic text similarity check
        wr_desc = ""
        pd = getattr(wr, "problem_description", None)
        if isinstance(pd, dict):
            wr_desc = (pd.get("original_text", "") or "").lower()
        elif isinstance(pd, str):
            wr_desc = pd.lower()
        # Count shared words (basic similarity)
        if desc_lower and wr_desc:
            words_a = set(desc_lower.split())
            words_b = set(wr_desc.split())
            overlap = len(words_a & words_b)
            similarity = overlap / max(len(words_a | words_b), 1)
        else:
            similarity = 0.5  # same equipment = potential duplicate even without text
        ai = wr.ai_classification if isinstance(wr.ai_classification, dict) else {}
        pd_dict = pd if isinstance(pd, dict) else {}
        duplicates.append({
            "request_id": wr.request_id,
            "status": wr.status,
            "equipment_tag": wr.equipment_tag,
            "equipment_name": ai.get("equipment_name", wr.equipment_tag),
            "priority": wr.priority_code or ai.get("priority_suggested", ""),
            "priority_code": wr.priority_code or "",
            "description": wr_desc[:300] if wr_desc else "",
            "failure_description": wr_desc[:300] if wr_desc else "",
            "problem_description": pd if isinstance(pd, dict) else {"original_text": wr_desc},
            "suggested_action": pd_dict.get("suggested_action", "") if isinstance(pd_dict, dict) else "",
            "created_at": wr.created_at.isoformat() if wr.created_at else None,
            "similarity": round(similarity, 2),
        })
    duplicates.sort(key=lambda d: d["similarity"], reverse=True)
    return {"equipment_tag": data.equipment_tag, "duplicate_count": len(duplicates), "duplicates": duplicates}


@router.post("/ai-assist-image")
def ai_assist_image(data: ImageAssistRequest, user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Analyze equipment photo with Claude Vision to auto-fill aviso form."""
    imgs = data.images if data.images else ([data.image] if data.image else [])
    if not imgs:
        raise HTTPException(status_code=400, detail="No image provided")
    result = vision_service.analyze_images(
        images_base64=imgs,
        equipment_tag=data.equipment_tag,
        additional_context=data.additional_context,
        db=db,
    )
    if "error" in result and not result.get("suggestions"):
        raise HTTPException(status_code=500, detail=result["error"])
    return result


@router.post("/ai-assist")
def ai_assist(data: AIAssistRequest, db: Session = Depends(get_db)):
    """AI assistance to fill aviso fields — uses Claude with historical context."""
    import os
    desc = (data.description or "").strip()
    if not desc:
        return {"suggestions": {}, "confidence": 0}

    # Try Claude-powered assist first
    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if api_key:
        try:
            return _claude_ai_assist(data, db, api_key)
        except Exception as e:
            import logging
            logging.getLogger("ocp_maintenance").warning(f"Claude AI assist failed, using fallback: {e}")

    # Fallback: rule-based
    return _rule_based_assist(data, db)


def _claude_ai_assist(data, db, api_key):
    """Claude-powered AI assist with historical context."""
    import anthropic

    desc = data.description or ""
    equipment_tag = data.equipment_tag or ""

    # Build context
    context_str = ""
    examples_str = ""
    if equipment_tag:
        ctx = ctx_builder.build_equipment_context(db, equipment_tag)
        context_str = ctx_builder.format_context_for_prompt(ctx)
        examples_str = ctx_builder.get_validated_examples(db, equipment_tag, limit=5)

    system_prompt = """Eres un experto en mantenimiento industrial de plantas OCP (fosfatos, Marruecos).
Analiza la descripcion y devuelve JSON completo para aviso SAP PM.
IMPORTANTE: Responde SOLO con JSON valido, sin markdown.

{
  "enhanced_description": "Descripcion tecnica mejorada y estructurada del problema (SAP PM style, 2-3 oraciones, incluir equipo/TAG, ubicacion, sintoma, impacto)",
  "enhanced_description": "Descripcion tecnica mejorada y estructurada del problema (SAP PM style, 2-3 oraciones, incluir equipo/TAG, ubicacion, sintoma, impacto)",
  "enhanced_description": "Descripcion tecnica mejorada y estructurada del problema (SAP PM style, 2-3 oraciones, incluir equipo/TAG, ubicacion, sintoma, impacto)",
  "enhanced_description": "Descripcion tecnica mejorada y estructurada del problema (SAP PM style, 2-3 oraciones, incluir equipo/TAG, ubicacion, sintoma, impacto)",
  "failureCategory": "MECANICO | ELECTRICO | INSTRUMENTACION",
  "priority": "P1 | P2 | P3 | P4",
  "activityClass": "M001 | M002 | M003",
  "suggestedAction": "Accion correctiva detallada paso a paso",
  "failureSymptom": "Sintoma del CATALOGO (valor EXACTO)",
  "failureCause": "Causa del CATALOGO (valor EXACTO)",
  "failureObjectPart": "Parte objeto del CATALOGO (valor EXACTO)",
  "estimatedDuration": "horas (string numerico)",
  "plantCondition": "running | stopped | reduced",
  "productionImpact": "CRITICAL | HIGH | MEDIUM | LOW",
  "resources": [{"type": "Mecanico|Electrico|Instrumentacion|Supervisor", "quantity": N, "hours": N}],
  "materials": [{"sapId": "8 digitos", "description": "material", "quantity": N, "unit": "PZ|KG|LT|UD"}],
  "supportEquipment": ["equipo apoyo"],
  "workConditions": "condiciones de trabajo"
}

CODIGOS SAP: 10001XXX=Rodamientos, 10002XXX=Sellos, 10003XXX=Filtros, 10004XXX=Lubricantes,
10005XXX=Tornilleria, 10006XXX=Transmision, 10007XXX=Electrico, 10008XXX=Instrumentacion,
10009XXX=Pintura, 10010XXX=Estructural
EQUIPOS APOYO: Grua movil, Tecle, Montacargas, Andamio, Compresor, Soldadora, Hidrolavadora
CONDICIONES: LOTO, area despejada, permisos, EPP


CATALOGO DE FALLA (OBLIGATORIO - usa EXACTAMENTE estos valores, NO texto libre):

MECANICO:
  parts: RODAMIENTOS, SELLOS MECANICOS, ACOPLES, EJES, ENGRANAJES, CORREAS, BOMBAS, VALVULAS, FILTROS
  symptoms: ALTA VIBRACION, ALTA TEMPERATURA, RUIDO ANORMAL, TRABADO, SIN FLUJO, FILTRACION, DESGASTE VISIBLE, FUGA ACEITE, ATASCAMIENTO
  causes: DESGASTE, FALTA LUBRICACION, CORROSION, DESALINEADO, OBSTRUIDO, SOBRECARGA, FATIGA, MONTAJE INCORRECTO

ELECTRICO:
  parts: MOTOR ELECTRICO, CABLES / CONDUCTORES, PROTECCIONES, TABLERO ELECTRICO, VARIADOR FRECUENCIA, CONTACTOR
  symptoms: NO ARRANCA, SOBRECALENTAMIENTO, CORTOCIRCUITO, DISPARO PROTECCION, BAJA AISLACION, OPERACION INTERMITENTE, CONSUMO EXCESIVO
  causes: PERDIDA AISLACION, DESGASTE, SUELTO, SOBRECARGA ELECTRICA, HUMEDAD, CALENTAMIENTO EXCESIVO

INSTRUMENTACION:
  parts: SENSOR / TRANSDUCTOR, TRANSMISOR, VALVULA DE CONTROL, PLC / DCS, ACTUADOR, POSICIONADOR
  symptoms: LECTURA ERRONEA, SIN SENAL, SENAL INESTABLE, NO RESPONDE, ALARMA FALSA, COMUNICACION PERDIDA
  causes: DESCALIBRADO, CONTAMINADO, PERDIDA PARAMETROS, PERDIDA COMUNICACION, OBSTRUCCION

REGLA: failureSymptom, failureCause y failureObjectPart DEBEN ser copias EXACTAS de los valores de arriba.
NO inventes texto libre para estos campos. Elige el valor mas cercano del catalogo.

P1/P2->M002, P3/P4->M001. SIEMPRE incluir materials con sapId, supportEquipment y workConditions.

REGLA enhanced_description: Reescribe la descripcion del usuario en formato tecnico SAP PM.
- Incluir: TAG del equipo, ubicacion funcional si se conoce, sintoma principal, medicion si hay, impacto operacional
- Formato: oraciones cortas y directas, terminologia tecnica de mantenimiento
- Ejemplo entrada: "la bomba vibra mucho y esta caliente"
- Ejemplo salida: "Bomba centrifuga P-1201A presenta vibracion excesiva en rodamiento lado acople. Temperatura de carcasa elevada. Requiere intervencion correctiva para evitar falla catastrofica."
- Si el usuario ya escribio bien, solo mejorar redaccion sin cambiar significado.

REGLA enhanced_description: Reescribe la descripcion del usuario en formato tecnico SAP PM.
- Incluir: TAG del equipo, ubicacion funcional si se conoce, sintoma principal, medicion si hay, impacto operacional
- Formato: oraciones cortas y directas, terminologia tecnica de mantenimiento
- Ejemplo entrada: "la bomba vibra mucho y esta caliente"
- Ejemplo salida: "Bomba centrifuga P-1201A presenta vibracion excesiva en rodamiento lado acople. Temperatura de carcasa elevada. Requiere intervencion correctiva para evitar falla catastrofica."
- Si el usuario ya escribio bien, solo mejorar redaccion sin cambiar significado.

REGLA enhanced_description: Reescribe la descripcion del usuario en formato tecnico SAP PM.
- Incluir: TAG del equipo, ubicacion funcional si se conoce, sintoma principal, medicion si hay, impacto operacional
- Formato: oraciones cortas y directas, terminologia tecnica de mantenimiento
- Ejemplo entrada: "la bomba vibra mucho y esta caliente"
- Ejemplo salida: "Bomba centrifuga P-1201A presenta vibracion excesiva en rodamiento lado acople. Temperatura de carcasa elevada. Requiere intervencion correctiva para evitar falla catastrofica."
- Si el usuario ya escribio bien, solo mejorar redaccion sin cambiar significado.

REGLA enhanced_description: Reescribe la descripcion del usuario en formato tecnico SAP PM.
- Incluir: TAG del equipo, ubicacion funcional si se conoce, sintoma principal, medicion si hay, impacto operacional
- Formato: oraciones cortas y directas, terminologia tecnica de mantenimiento
- Ejemplo entrada: "la bomba vibra mucho y esta caliente"
- Ejemplo salida: "Bomba centrifuga P-1201A presenta vibracion excesiva en rodamiento lado acople. Temperatura de carcasa elevada. Requiere intervencion correctiva para evitar falla catastrofica."
- Si el usuario ya escribio bien, solo mejorar redaccion sin cambiar significado."""

    if context_str:
        system_prompt += "\n\n" + context_str
    if examples_str:
        system_prompt += "\n\n" + examples_str

    user_msg = f"Descripcion del problema: \"{desc}\""
    if equipment_tag:
        user_msg += f"\nEquipo: {equipment_tag}"
    if data.plant_condition:
        user_msg += f"\nCondicion planta: {data.plant_condition}"

    client = anthropic.Anthropic(api_key=api_key)
    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1024,
        system=system_prompt,
        messages=[{"role": "user", "content": user_msg}],
    )
    raw = response.content[0].text.strip()

    # Parse JSON
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1].rsplit("```", 1)[0].strip()

    import json
    suggestions = json.loads(raw)

    # Ensure consistency
    prio = suggestions.get("priority", "P3")
    if prio in ("P1", "P2"):
        suggestions["activityClass"] = "M002"
    elif "activityClass" not in suggestions:
        suggestions["activityClass"] = "M001"

    return {"suggestions": suggestions, "confidence": 0.85, "source": "claude_ai"}


def _rule_based_assist(data, db):
    """Fallback rule-based AI assist (keyword matching)."""
    desc = (data.description or "").lower()
    suggestions = {}

    # 1. Detect failure category
    if not data.existing_category:
        cat_keywords = {
            "ELECTRICO": ["electr", "voltaje", "corriente", "cable", "variador", "transformador", "cortocircuito", "fusible"],
            "INSTRUMENTACION": ["instrument", "sensor", "valvula", "transmisor", "plc", "caudalimetro", "presostato", "termocupla", "calibr"],
            "MECANICO": ["mecanic", "bomba", "rodamiento", "vibracion", "fuga", "correa", "engranaje", "eje", "sello", "lubricacion", "aceite", "desgaste"],
        }
        detected = "MECANICO"
        max_hits = 0
        for cat, kws in cat_keywords.items():
            hits = sum(1 for kw in kws if kw in desc)
            if hits > max_hits:
                max_hits = hits
                detected = cat
        suggestions["failureCategory"] = detected

    # 2. Detect priority
    if not data.existing_priority:
        urgent_kws = ["urgente", "emergencia", "parada", "detenid", "paro", "inmediata", "crítico", "colapso"]
        high_kws = ["importante", "producción afectada", "riesgo", "seguridad"]
        if any(kw in desc for kw in urgent_kws) or data.plant_condition == "stopped":
            suggestions["priority"] = "P1"
        elif any(kw in desc for kw in high_kws):
            suggestions["priority"] = "P2"
        else:
            suggestions["priority"] = "P3"

    # 3. Auto activity class from priority
    prio = suggestions.get("priority", data.existing_priority or "P3")
    suggestions["activityClass"] = "M002" if prio in ("P1", "P2") else "M001"

    # 4. Suggest action
    if not data.existing_action:
        action_map = {
            "bomba": "Reemplazar bomba completa y verificar alineación",
            "rodamiento": "Reemplazar rodamientos y verificar holguras",
            "sello": "Reemplazar sellos mecánicos y verificar estanqueidad",
            "fuga": "Localizar y reparar fuga, reemplazar juntas/sellos",
            "vibración": "Diagnóstico vibracional, reemplazar componente dañado",
            "motor": "Inspección motor eléctrico, verificar aislamiento y conexiones",
            "correa": "Reemplazar correas y verificar tensión/alineación",
            "válvula": "Inspección y calibración de válvula",
            "sensor": "Calibrar/reemplazar sensor y verificar señal",
        }
        for kw, action in action_map.items():
            if kw in desc:
                suggestions["suggestedAction"] = action
                break
        if "suggestedAction" not in suggestions and desc:
            suggestions["suggestedAction"] = "Inspección y intervención correctiva según hallazgos"

    # 5. Suggest duration based on action type
    if prio in ("P1", "P2"):
        suggestions["estimatedDuration"] = "8"
    else:
        suggestions["estimatedDuration"] = "4"

    # 6. Suggest resources
    cat = suggestions.get("failureCategory", data.existing_category or "MECANICO")
    default_resources = {
        "MECANICO": [{"type": "Mecánico", "quantity": 2, "hours": 4}, {"type": "Supervisor", "quantity": 1, "hours": 1}],
        "ELECTRICO": [{"type": "Eléctrico", "quantity": 1, "hours": 4}, {"type": "Supervisor", "quantity": 1, "hours": 1}],
        "INSTRUMENTACION": [{"type": "Instrumentación", "quantity": 1, "hours": 3}, {"type": "Supervisor", "quantity": 1, "hours": 1}],
    }
    suggestions["resources"] = default_resources.get(cat, default_resources["MECANICO"])

    # 7. Suggest materials from similar closed WRs (historical lookup)
    suggestions["materials"] = []
    if data.equipment_tag:
        closed_wrs = work_request_service.list_work_requests(db, status=None, limit=200, offset=0)
        for wr in closed_wrs:
            if wr.equipment_tag != data.equipment_tag:
                continue
            if wr.status not in ("CLOSED", "COMPLETED", "TECH_CLOSE"):
                continue
            pd = wr.problem_description if isinstance(wr.problem_description, dict) else {}
            hist_mats = pd.get("materials", []) if isinstance(pd, dict) else []
            if hist_mats:
                suggestions["materials"] = hist_mats[:5]  # take up to 5
                suggestions["materials_source"] = "historical"
                break

    # 8. Production impact
    is_stopped = data.plant_condition == "stopped"
    if is_stopped and prio in ("P1", "P2"):
        suggestions["productionImpact"] = "CRITICAL"
    elif is_stopped:
        suggestions["productionImpact"] = "HIGH"
    elif prio in ("P1", "P2"):
        suggestions["productionImpact"] = "HIGH"
    elif prio == "P3":
        suggestions["productionImpact"] = "MEDIUM"
    else:
        suggestions["productionImpact"] = "LOW"

    # 9. Failure catalog suggestions
    symptom_map = {
        "fuga": "Fuga externa",
        "vibración": "Vibración anormal",
        "ruido": "Ruido anormal",
        "temperatura": "Sobrecalentamiento",
        "desgaste": "Desgaste prematuro",
        "corrosión": "Corrosión",
        "rotura": "Rotura/Fractura",
    }
    for kw, symptom in symptom_map.items():
        if kw in desc:
            suggestions["failureSymptom"] = symptom
            break

    cause_map = {
        "desgaste": "Desgaste por uso normal",
        "corrosión": "Corrosión química/ambiental",
        "fuga": "Falla de sello/junta",
        "vibración": "Desbalanceo/Desalineación",
        "sobrecarga": "Sobrecarga operativa",
        "fatiga": "Fatiga del material",
    }
    for kw, cause in cause_map.items():
        if kw in desc:
            suggestions["failureCause"] = cause
            break

    return {"suggestions": suggestions, "confidence": 0.75}


@router.post("/{request_id}/feedback")
def submit_ai_feedback(request_id: str, data: AIFeedbackCreate, user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Submit feedback on AI prediction accuracy."""
    from api.database.models import AIFeedbackModel, WorkRequestModel
    import uuid
    wr = db.query(WorkRequestModel).filter(WorkRequestModel.request_id == request_id).first()
    equipment_tag = wr.equipment_tag if wr else ""
    fb = AIFeedbackModel(
        feedback_id=str(uuid.uuid4()),
        work_request_id=request_id,
        equipment_tag=equipment_tag,
        field_name=data.field_name,
        predicted_value=data.predicted_value,
        actual_value=data.actual_value,
        rating=data.rating,
        feedback_source="manual",
    )
    db.add(fb)
    db.commit()
    return {"status": "ok", "feedback_id": fb.feedback_id}


@router.get("/ai-feedback/stats")
def get_feedback_stats(equipment_tag: str = "", db: Session = Depends(get_db)):
    """Get aggregated accuracy stats for AI predictions."""
    from api.database.models import AIFeedbackModel
    query = db.query(AIFeedbackModel)
    if equipment_tag:
        query = query.filter(AIFeedbackModel.equipment_tag == equipment_tag.upper())
    feedbacks = query.all()
    if not feedbacks:
        return {"total": 0, "accuracy_pct": None, "by_field": {}}
    total = len(feedbacks)
    positive = sum(1 for f in feedbacks if f.rating > 0)
    by_field = {}
    for f in feedbacks:
        if f.field_name not in by_field:
            by_field[f.field_name] = {"total": 0, "positive": 0, "corrections": []}
        by_field[f.field_name]["total"] += 1
        if f.rating > 0:
            by_field[f.field_name]["positive"] += 1
        elif f.rating < 0:
            by_field[f.field_name]["corrections"].append({
                "predicted": f.predicted_value, "actual": f.actual_value,
            })
    return {"total": total, "accuracy_pct": round(positive / total * 100) if total else 0, "by_field": by_field}

def _generate_wr_id(db):
    """Generate sequential WR ID: WR-YYYY-NNNNN"""
    from datetime import datetime
    from api.database.models import WorkRequestModel
    year = datetime.now().year
    prefix = f"WR-{year}-"
    # Find max existing ID for this year
    last = db.query(WorkRequestModel.request_id).filter(
        WorkRequestModel.request_id.like(f"{prefix}%")
    ).order_by(WorkRequestModel.request_id.desc()).first()
    if last and last[0]:
        try:
            num = int(last[0].split("-")[-1]) + 1
        except (ValueError, IndexError):
            num = 1
    else:
        # Count all WRs as fallback
        total = db.query(WorkRequestModel).count()
        num = total + 1
    return f"{prefix}{num:05d}"


@router.get("/ai-summary")
def ai_weekly_summary(days: int = 7, db: Session = Depends(get_db), user=Depends(get_current_user)):
    """Generate AI-powered weekly summary of maintenance activity."""
    import os, json
    from datetime import datetime, timedelta

    cutoff = datetime.now() - timedelta(days=days)

    # Gather data
    all_wrs = work_request_service.list_work_requests(db, status=None, limit=500, offset=0)
    recent_wrs = [wr for wr in all_wrs if wr.created_at and wr.created_at >= cutoff]

    from api.database.models import ManagedWorkOrderModel
    all_wos = db.query(ManagedWorkOrderModel).filter(
        ManagedWorkOrderModel.created_at >= cutoff
    ).all()

    # Build stats
    wr_by_status = {}
    wr_by_priority = {}
    wr_by_equip = {}
    for wr in recent_wrs:
        wr_by_status[wr.status] = wr_by_status.get(wr.status, 0) + 1
        p = wr.priority_code or "?"
        wr_by_priority[p] = wr_by_priority.get(p, 0) + 1
        tag = wr.equipment_tag or "sin-equipo"
        wr_by_equip[tag] = wr_by_equip.get(tag, 0) + 1

    wo_by_status = {}
    total_hours = 0
    for wo in all_wos:
        wo_by_status[wo.status] = wo_by_status.get(wo.status, 0) + 1
        if wo.actual_hours:
            total_hours += wo.actual_hours

    top_equip = sorted(wr_by_equip.items(), key=lambda x: x[1], reverse=True)[:5]

    stats = {
        "period_days": days,
        "total_wrs": len(recent_wrs),
        "wr_by_status": wr_by_status,
        "wr_by_priority": wr_by_priority,
        "total_wos": len(all_wos),
        "wo_by_status": wo_by_status,
        "total_actual_hours": round(total_hours, 1),
        "top_equipment": [{"tag": t, "count": c} for t, c in top_equip],
    }

    # Generate AI summary with Claude
    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if not api_key:
        return {"stats": stats, "summary": "API key no configurada", "source": "stats_only"}

    try:
        import anthropic
        client = anthropic.Anthropic(api_key=api_key)
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=600,
            system="Eres un analista de mantenimiento de planta OCP. Genera un resumen ejecutivo en espanol de la actividad de mantenimiento. Se conciso, usa bullet points. Incluye: estado general, tendencias, equipos problematicos, y recomendaciones.",
            messages=[{"role": "user", "content": f"Datos de los ultimos {days} dias:\n{json.dumps(stats, ensure_ascii=False)}"}],
        )
        summary = response.content[0].text.strip()
        return {"stats": stats, "summary": summary, "source": "claude_ai"}
    except Exception as e:
        return {"stats": stats, "summary": f"Error al generar resumen: {str(e)}", "source": "error"}


@router.post("/ai-verify-close/{wo_id}")
def ai_verify_close(wo_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    """AI verification before closing a work order — checks completeness and flags issues."""
    import os, json
    from api.database.models import ManagedWorkOrderModel

    wo = db.query(ManagedWorkOrderModel).filter(ManagedWorkOrderModel.wo_id == wo_id).first()
    if not wo:
        raise HTTPException(status_code=404, detail="OT no encontrada")

    # Rule-based checks first
    issues = []
    warnings = []

    # Check operations have actual hours
    ops = wo.operations or []
    if isinstance(ops, list):
        for op in ops:
            if isinstance(op, dict):
                if not op.get("actual_hours") and op.get("planned_hours", 0) > 0:
                    issues.append(f"Operacion '{op.get('description', '?')[:40]}' sin HH reales registradas")

    # Check actual hours vs estimated
    if wo.actual_hours and wo.estimated_hours:
        ratio = wo.actual_hours / wo.estimated_hours
        if ratio > 2:
            warnings.append(f"Duracion real ({wo.actual_hours}h) es {ratio:.1f}x mayor que estimada ({wo.estimated_hours}h)")
        elif ratio < 0.3:
            warnings.append(f"Duracion real ({wo.actual_hours}h) parece muy baja vs estimada ({wo.estimated_hours}h)")
    elif not wo.actual_hours:
        issues.append("No se registraron horas reales totales")

    # Check materials consumed
    mats = wo.materials or []
    if not mats or (isinstance(mats, list) and len(mats) == 0):
        warnings.append("No se registraron materiales consumidos")

    # Check completion percentage
    if wo.completion_pct and wo.completion_pct < 100:
        issues.append(f"Porcentaje de avance es {wo.completion_pct}%, no 100%")

    # Check status chain
    if wo.status not in ("IN_PROGRESS", "COMPLETED"):
        warnings.append(f"Estado actual es '{wo.status}', se esperaba IN_PROGRESS o COMPLETED para cerrar")

    # AI analysis with Claude
    ai_summary = ""
    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if api_key and (issues or warnings):
        try:
            import anthropic
            wo_data = {
                "wo_id": wo.wo_id,
                "description": wo.description,
                "type": wo.wo_type,
                "priority": wo.priority_code,
                "estimated_hours": wo.estimated_hours,
                "actual_hours": wo.actual_hours,
                "operations_count": len(ops),
                "materials_count": len(mats),
                "issues": issues,
                "warnings": warnings,
            }
            client = anthropic.Anthropic(api_key=api_key)
            response = client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=300,
                system="Eres un supervisor de mantenimiento OCP. Revisa los datos de la OT y da una recomendacion corta en espanol sobre si se puede cerrar o que falta completar. Se directo.",
                messages=[{"role": "user", "content": json.dumps(wo_data, ensure_ascii=False)}],
            )
            ai_summary = response.content[0].text.strip()
        except:
            pass

    can_close = len(issues) == 0
    return {
        "wo_id": wo_id,
        "can_close": can_close,
        "issues": issues,
        "warnings": warnings,
        "ai_recommendation": ai_summary,
        "checks_passed": len(issues) == 0 and len(warnings) == 0,
    }


@router.get("/ai-predict-failures")
def ai_predict_failures(equipment_tag: str = "", db: Session = Depends(get_db), user=Depends(get_current_user)):
    """AI failure prediction based on equipment history — probability of failure in next 30/60/90 days."""
    import os, json
    from datetime import datetime, timedelta
    from api.database.models import ManagedWorkOrderModel, HierarchyNodeModel, FailureModeModel, FunctionModel, FunctionalFailureModel

    # Gather equipment data
    tag = (equipment_tag or "").upper().strip()
    if not tag:
        # Get all equipment with history and predict for each
        all_tags = [r[0] for r in db.query(ManagedWorkOrderModel.equipment_tag).distinct().all() if r[0]]
        if not all_tags:
            all_tags = [r[0] for r in db.query(HierarchyNodeModel.tag).filter(HierarchyNodeModel.node_type == "EQUIPMENT").limit(20).all() if r[0]]
        predictions = []
        for t in all_tags[:10]:
            pred = _predict_single(db, t)
            if pred:
                predictions.append(pred)
        predictions.sort(key=lambda p: p.get("risk_score", 0), reverse=True)
        return {"predictions": predictions, "total": len(predictions)}

    pred = _predict_single(db, tag)
    return {"predictions": [pred] if pred else [], "total": 1 if pred else 0}


def _predict_single(db, tag):
    """Predict failure for a single equipment tag."""
    from datetime import datetime, timedelta
    from api.database.models import ManagedWorkOrderModel, HierarchyNodeModel
    import os, json

    node = db.query(HierarchyNodeModel).filter(
        (HierarchyNodeModel.tag == tag) | (HierarchyNodeModel.code == tag)
    ).first()

    # Get WO history
    wos = db.query(ManagedWorkOrderModel).filter(
        ManagedWorkOrderModel.equipment_tag == tag
    ).order_by(ManagedWorkOrderModel.created_at.desc()).limit(20).all()

    # Get WR history
    from api.database.models import WorkRequestModel
    wrs = db.query(WorkRequestModel).filter(
        WorkRequestModel.equipment_tag == tag
    ).order_by(WorkRequestModel.created_at.desc()).limit(20).all()

    total_incidents = len(wos) + len(wrs)
    criticality = node.criticality if node else "C"

    # Simple prediction model based on frequency + criticality
    now = datetime.now()
    dates = []
    for wo in wos:
        if wo.created_at:
            dates.append(wo.created_at)
    for wr in wrs:
        if wr.created_at:
            dates.append(wr.created_at)

    if not dates:
        return {
            "equipment_tag": tag,
            "equipment_name": node.name if node else tag,
            "criticality": criticality,
            "total_incidents": 0,
            "risk_score": 10 if criticality in ("A", "A+") else 5,
            "risk_level": "LOW",
            "probability_30d": 5,
            "probability_60d": 10,
            "probability_90d": 15,
            "recommendation": "Sin historial de fallas. Mantener plan preventivo actual.",
            "last_incident": None,
        }

    dates.sort()
    # Calculate mean time between failures (MTBF)
    intervals = []
    for i in range(1, len(dates)):
        delta = (dates[i] - dates[i-1]).days
        if delta > 0:
            intervals.append(delta)

    mtbf = sum(intervals) / len(intervals) if intervals else 365
    days_since_last = (now - dates[-1]).days

    # Risk score (0-100)
    age_factor = min(days_since_last / max(mtbf, 1), 2.0)
    crit_multiplier = {"A+": 2.0, "A": 1.5, "B": 1.0, "C": 0.7}.get(criticality, 1.0)
    freq_factor = min(total_incidents / 5, 2.0)
    risk_score = min(int(age_factor * crit_multiplier * freq_factor * 25), 100)

    # Probabilities
    p30 = min(int(risk_score * 0.8), 95)
    p60 = min(int(risk_score * 1.2), 98)
    p90 = min(int(risk_score * 1.5), 99)

    risk_level = "CRITICAL" if risk_score >= 75 else "HIGH" if risk_score >= 50 else "MEDIUM" if risk_score >= 25 else "LOW"

    # AI recommendation
    ai_rec = ""
    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if api_key and risk_score > 20:
        try:
            import anthropic
            client = anthropic.Anthropic(api_key=api_key)
            response = client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=150,
                system="Eres experto en mantenimiento predictivo OCP. Da una recomendacion en 2-3 lineas en espanol.",
                messages=[{"role": "user", "content": json.dumps({
                    "equipo": tag, "nombre": node.name if node else tag,
                    "criticidad": criticality, "incidentes": total_incidents,
                    "mtbf_dias": round(mtbf), "dias_desde_ultimo": days_since_last,
                    "risk_score": risk_score
                }, ensure_ascii=False)}],
            )
            ai_rec = response.content[0].text.strip()
        except:
            pass

    if not ai_rec:
        if risk_score >= 75:
            ai_rec = f"URGENTE: {tag} tiene alto riesgo de falla. Programar inspeccion inmediata."
        elif risk_score >= 50:
            ai_rec = f"Programar mantenimiento preventivo para {tag} en los proximos 15 dias."
        else:
            ai_rec = f"Mantener monitoreo normal de {tag}."

    return {
        "equipment_tag": tag,
        "equipment_name": node.name if node else tag,
        "criticality": criticality,
        "total_incidents": total_incidents,
        "mtbf_days": round(mtbf),
        "days_since_last": days_since_last,
        "last_incident": dates[-1].isoformat() if dates else None,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "probability_30d": p30,
        "probability_60d": p60,
        "probability_90d": p90,
        "recommendation": ai_rec,
    }


@router.post("/ai-suggest-schedule")
def ai_suggest_schedule(wo_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    """AI suggests optimal dates for a work order based on priority, workload, and shutdown calendar."""
    import os, json
    from datetime import datetime, timedelta
    from api.database.models import ManagedWorkOrderModel

    wo = db.query(ManagedWorkOrderModel).filter(ManagedWorkOrderModel.wo_id == wo_id).first()
    if not wo:
        raise HTTPException(status_code=404, detail="OT no encontrada")

    now = datetime.now()
    priority = wo.priority_code or "P3"
    est_hours = wo.estimated_hours or 8

    # Priority-based windows
    windows = {"P1": 1, "P2": 7, "P3": 30, "P4": 90}
    max_days = windows.get(priority, 30)

    # Check existing workload
    active_wos = db.query(ManagedWorkOrderModel).filter(
        ManagedWorkOrderModel.status.in_(["PLANNED", "RELEASED", "SCHEDULED", "IN_PROGRESS"]),
        ManagedWorkOrderModel.planned_start != None,
    ).all()

    # Build daily load map (next 30 days)
    daily_load = {}
    for awo in active_wos:
        if awo.planned_start:
            day = awo.planned_start.strftime("%Y-%m-%d")
            daily_load[day] = daily_load.get(day, 0) + (awo.estimated_hours or 4)

    # Find best slots (days with least workload)
    suggestions = []
    for d in range(1, min(max_days + 1, 31)):
        date = now + timedelta(days=d)
        if date.weekday() >= 5:  # Skip weekends
            continue
        day_str = date.strftime("%Y-%m-%d")
        load = daily_load.get(day_str, 0)
        suggestions.append({
            "date": day_str,
            "day_name": ["Lun", "Mar", "Mie", "Jue", "Vie"][date.weekday()],
            "existing_load_hours": load,
            "available_hours": max(16 - load, 0),
            "fits": load + est_hours <= 16,
        })

    suggestions.sort(key=lambda s: s["existing_load_hours"])
    best = [s for s in suggestions if s["fits"]][:5]
    if not best:
        best = suggestions[:5]

    # AI recommendation
    ai_rec = ""
    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if api_key:
        try:
            import anthropic
            client = anthropic.Anthropic(api_key=api_key)
            response = client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=100,
                system="Eres planificador de mantenimiento OCP. Recomienda la mejor fecha en 1-2 lineas en espanol.",
                messages=[{"role": "user", "content": json.dumps({
                    "ot": wo.wo_id, "prioridad": priority, "horas_estimadas": est_hours,
                    "mejores_fechas": best[:3],
                }, ensure_ascii=False)}],
            )
            ai_rec = response.content[0].text.strip()
        except:
            pass

    return {
        "wo_id": wo_id,
        "priority": priority,
        "estimated_hours": est_hours,
        "max_days_window": max_days,
        "suggested_dates": best,
        "ai_recommendation": ai_rec or f"Mejor fecha: {best[0]['date']} ({best[0]['day_name']}) con {best[0]['available_hours']}h disponibles" if best else "Sin fechas disponibles",
    }


@router.get("/work-centers")
def list_work_centers(plant_type: str = "", specialty: str = "", db: Session = Depends(get_db)):
    """List work centers, optionally filtered by plant type or specialty."""
    from sqlalchemy import text
    query = "SELECT code, name, plant_type, area_code, area_name, specialty_code, specialty_name, is_external, headcount_day, headcount_night, effective_hours_per_person, shift_hours FROM work_centers WHERE 1=1"
    params = {}
    if plant_type:
        query += " AND plant_type = :pt"
        params["pt"] = plant_type.upper()
    if specialty:
        query += " AND specialty_code = :sp"
        params["sp"] = specialty.upper()
    query += " ORDER BY plant_type, area_code, specialty_code"
    rows = db.execute(text(query), params).fetchall()
    return [{"code": r[0], "name": r[1], "plant_type": r[2], "area_code": r[3], "area_name": r[4],
             "specialty_code": r[5], "specialty_name": r[6], "is_external": bool(r[7]),
             "headcount_day": r[8], "headcount_night": r[9],
             "effective_hours": r[10], "shift_hours": r[11],
             "daily_capacity_day": r[8] * r[10], "daily_capacity_night": r[9] * r[10],
             } for r in rows]


@router.get("/capacity-evaluation")
def capacity_evaluation(week_offset: int = 0, work_center: str = "", db: Session = Depends(get_db)):
    """Evaluate capacity: HH supply vs demand per work center for a given week."""
    from datetime import datetime, timedelta
    from sqlalchemy import text
    from api.database.models import ManagedWorkOrderModel

    now = datetime.now()
    # Calculate week start (Monday)
    week_start = now - timedelta(days=now.weekday()) + timedelta(weeks=week_offset)
    week_end = week_start + timedelta(days=6)

    # Get work centers
    wc_query = "SELECT code, name, specialty_name, headcount_day, headcount_night, effective_hours_per_person FROM work_centers WHERE is_external = 0"
    params = {}
    if work_center:
        wc_query += " AND code = :wc"
        params["wc"] = work_center
    wc_query += " ORDER BY code"
    centers = db.execute(text(wc_query), params).fetchall()

    # Get OTs scheduled in this week
    scheduled_wos = db.query(ManagedWorkOrderModel).filter(
        ManagedWorkOrderModel.status.in_(["PLANIFICADO", "PROGRAMADO", "EN_EJECUCION", "APROBADO", "PLANNED", "SCHEDULED", "IN_PROGRESS"]),
    ).all()

    # Calculate demand per work center
    demand_by_wc = {}
    for wo in scheduled_wos:
        ops = wo.operations or []
        for op in ops:
            if isinstance(op, dict):
                specialty = (op.get("specialty", "") or "").lower()
                hours = op.get("planned_hours", 0) or op.get("estimated_hours", 0) or 0
                # Map specialty to work center
                for center in centers:
                    if center[2].lower() in specialty or specialty in center[2].lower():
                        code = center[0]
                        demand_by_wc[code] = demand_by_wc.get(code, 0) + hours
                        break

    # Build response
    results = []
    for center in centers:
        code, name, specialty, hc_day, hc_night, eff_hours = center
        daily_supply = hc_day * eff_hours  # day shift supply
        weekly_supply = daily_supply * 5  # 5 working days (can be 6 or 7)
        weekly_demand = demand_by_wc.get(code, 0)
        load_pct = round((weekly_demand / weekly_supply * 100) if weekly_supply > 0 else 0, 1)
        free = round(weekly_supply - weekly_demand, 1)

        results.append({
            "work_center": code,
            "name": name,
            "specialty": specialty,
            "headcount_day": hc_day,
            "headcount_night": hc_night,
            "weekly_supply_hh": round(weekly_supply, 1),
            "weekly_demand_hh": round(weekly_demand, 1),
            "load_pct": load_pct,
            "free_hh": free,
            "overloaded": load_pct > 100,
            "status": "CRITICO" if load_pct > 100 else "ALTO" if load_pct > 80 else "NORMAL" if load_pct > 50 else "BAJO",
        })

    results.sort(key=lambda x: x["load_pct"], reverse=True)

    return {
        "week_start": week_start.strftime("%Y-%m-%d"),
        "week_end": week_end.strftime("%Y-%m-%d"),
        "work_centers": results,
        "total_supply": sum(r["weekly_supply_hh"] for r in results),
        "total_demand": sum(r["weekly_demand_hh"] for r in results),
        "overloaded_centers": [r["work_center"] for r in results if r["overloaded"]],
    }


@router.post("/manual")
def create_wr_manual(data: WRManualCreateRequest, user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Create a WR from manual form — calculates confidence from filled fields and goes to PENDING_VALIDATION."""
    import uuid
    from datetime import datetime
    from api.database.models import WorkRequestModel

    now = datetime.now()

    # Calculate AI confidence based on how many fields were filled
    filled_fields = 0
    total_scored = 7  # fields that contribute to confidence
    if data.problem_description.strip():
        filled_fields += 1
    if data.failure_category:
        filled_fields += 1
    if data.failure_symptom:
        filled_fields += 1
    if data.failure_cause:
        filled_fields += 1
    if data.plant_condition:
        filled_fields += 1
    if data.suggested_action.strip():
        filled_fields += 1
    if data.circumstances.strip():
        filled_fields += 1
    confidence = round(filled_fields / total_scored, 2)

    # Derive work order type from priority
    wo_type_map = {"P1": "PM01", "P2": "PM01", "P3": "PM02", "P4": "PM02"}
    wo_type = wo_type_map.get(data.priority, "PM01")

    wr = WorkRequestModel(
        request_id=_generate_wr_id(db),
        status="PENDIENTE",
        equipment_id=data.equipment_tag,
        equipment_tag=data.equipment_tag,
        equipment_confidence=0.9 if data.equipment_name and "(No catalogado)" not in data.equipment_name else 0.5,
        priority_code=data.priority,
        work_class=work_request_service.derive_work_class(data.priority),
        created_by=data.created_by or getattr(user, "full_name", None) or getattr(user, "username", ""),
        problem_description={
            "original_text": data.problem_description,
            "suggested_action": data.suggested_action,
            "failure_mode_detected": data.failure_category,
            "failure_symptom": data.failure_symptom,
            "failure_cause": data.failure_cause,
            "failure_object_part": data.failure_object_part,
            "resources": data.resources,
            "materials": data.materials,
        },
        ai_classification={
            "priority_suggested": data.priority,
            "confidence": confidence,
            "work_order_type": wo_type,
            "failure_type": data.failure_category,
            "failure_class": data.failure_symptom,
            "failure_category": data.failure_cause,
            "recommended_priority": data.priority,
            "plant_id": data.plant_id,
            "equipment_name": data.equipment_name,
            "activity_class": data.activity_class,
            "plant_condition": data.plant_condition,
            "estimated_duration_hours": data.estimated_duration,
            "safety_flags": ["BREAKDOWN"] if data.plant_condition == "stopped" else [],
            "source": "manual_form",
            "aviso_coding": data.aviso_coding,
            "technical_location": data.technical_location,
        },
        # SAP Aviso fields
        notification_type=data.notification_type or "A1",
        reported_by=data.reported_by or None,
        reported_at=now if data.reported_by else None,
        circumstances=data.circumstances or None,
        support_equipment=[{"tag": s} for s in data.support_equipment] if data.support_equipment else None,
        documents=data.documents if data.documents else None,
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
