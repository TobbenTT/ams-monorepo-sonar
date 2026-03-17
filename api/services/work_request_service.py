"""Work request service — CRUD + validation + classification."""

from datetime import datetime
from sqlalchemy.orm import Session

from api.database.models import WorkRequestModel
from api.services.audit_service import log_action


def get_work_request(db: Session, request_id: str) -> WorkRequestModel | None:
    return db.query(WorkRequestModel).filter(
        WorkRequestModel.request_id == request_id
    ).first()


def list_work_requests(db: Session, status: str | None = None, limit: int = 200, offset: int = 0) -> list[WorkRequestModel]:
    q = db.query(WorkRequestModel)
    if status:
        q = q.filter(WorkRequestModel.status == status)
    return q.order_by(WorkRequestModel.created_at.desc()).offset(offset).limit(limit).all()


def validate_work_request(
    db: Session, request_id: str, action: str, modifications: dict | None = None
) -> dict | None:
    """Validate (approve/reject/modify) a work request."""
    wr = get_work_request(db, request_id)
    if not wr:
        return None

    if action == "APPROVE":
        wr.status = "VALIDATED"
        if modifications:
            _apply_modifications(wr, modifications)
    elif action == "REJECT":
        wr.status = "REJECTED"
    elif action == "MODIFY":
        wr.status = "PENDING_VALIDATION"
        if modifications:
            _apply_modifications(wr, modifications)
    else:
        return None

    # Update validation metadata
    validation = wr.validation or {}
    validation["validated_by"] = modifications.get("validated_by", "planner") if modifications else "planner"
    validation["validated_at"] = datetime.now().isoformat()
    validation["modifications_made"] = list(modifications.keys()) if modifications else []
    wr.validation = validation

    log_action(db, "work_request", request_id, f"VALIDATE_{action}")
    db.commit()
    db.refresh(wr)

    # Auto-add to backlog after commit so there's no transaction conflict
    if action == "APPROVE":
        from api.services import backlog_service
        backlog_service.add_to_backlog(db, request_id)

    return _to_dict(wr)


def delete_work_request(db: Session, request_id: str) -> bool:
    """Delete a work request and all linked records permanently."""
    from api.database.models import (
        FieldCaptureModel, BacklogItemModel, PlannerRecommendationModel,
    )
    wr = get_work_request(db, request_id)
    if not wr:
        return False
    log_action(db, "work_request", request_id, "DELETE")
    # Delete child records that have FK to work_requests
    db.query(BacklogItemModel).filter(
        BacklogItemModel.work_request_id == request_id
    ).delete()
    db.query(PlannerRecommendationModel).filter(
        PlannerRecommendationModel.work_request_id == request_id
    ).delete()
    # Save capture id before clearing the FK (to avoid constraint conflict)
    capture_id = wr.source_capture_id
    if capture_id:
        wr.source_capture_id = None
        db.flush()
    db.delete(wr)
    # Now safe to delete the orphaned capture
    if capture_id:
        db.query(FieldCaptureModel).filter(
            FieldCaptureModel.capture_id == capture_id
        ).delete()
    db.commit()
    return True


def classify_work_request(db: Session, request_id: str) -> dict | None:
    """Re-run AI classification on a work request."""
    wr = get_work_request(db, request_id)
    if not wr:
        return None

    # For now, return existing classification
    # In production, this would re-run PriorityEngine with updated context
    log_action(db, "work_request", request_id, "CLASSIFY")
    db.commit()

    return _to_dict(wr)


def _apply_modifications(wr: WorkRequestModel, modifications: dict):
    """Apply planner modifications to a work request."""
    if "priority" in modifications:
        ai_class = wr.ai_classification or {}
        ai_class["priority_suggested"] = modifications["priority"]
        wr.ai_classification = ai_class
    if "equipment_tag" in modifications:
        wr.equipment_tag = modifications["equipment_tag"]


def _to_dict(wr: WorkRequestModel) -> dict:
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
