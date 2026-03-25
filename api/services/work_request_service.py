"""Work request service — CRUD + validation + classification."""

from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from api.database.models import WorkRequestModel
from api.services.audit_service import log_action


# SLA deadlines by priority (Jorge's Excel)
SLA_HOURS = {"P1": 24, "P2": 168, "P3": 720, "P4": 2160}  # 1d, 7d, 30d, 90d (parada)


def compute_sla_deadline(priority: str, from_dt: datetime | None = None) -> datetime:
    """Calculate SLA deadline from priority code."""
    base = from_dt or datetime.now()
    hours = SLA_HOURS.get(priority, 720)
    return base + timedelta(hours=hours)


def derive_work_class(priority: str) -> str:
    """P1/P2 → NO_PROGRAMADO, P3/P4 → PROGRAMADO."""
    return "NO_PROGRAMADO" if priority in ("P1", "P2") else "PROGRAMADO"


def get_work_request(db: Session, request_id: str) -> WorkRequestModel | None:
    return db.query(WorkRequestModel).filter(
        WorkRequestModel.request_id == request_id
    ).first()


def list_work_requests(
    db: Session, status: str | None = None, plant_id: str | None = None,
    limit: int = 200, offset: int = 0,
) -> list[WorkRequestModel]:
    q = db.query(WorkRequestModel)
    if status:
        q = q.filter(WorkRequestModel.status == status)
    if plant_id:
        # plant_id lives inside ai_classification JSON — use JSON extraction
        from sqlalchemy import cast, String, text
        q = q.filter(
            cast(WorkRequestModel.ai_classification["plant_id"], String).in_([
                f'"{plant_id}"', plant_id,  # handles both quoted and unquoted JSON values
            ])
        )
    return q.order_by(WorkRequestModel.created_at.desc()).offset(offset).limit(limit).all()


def get_equipment_history(db: Session, equipment_tag: str, exclude_id: str | None = None, limit: int = 10) -> list[dict]:
    """Get previous WRs for the same equipment (for supervisor review)."""
    q = db.query(WorkRequestModel).filter(WorkRequestModel.equipment_tag == equipment_tag)
    if exclude_id:
        q = q.filter(WorkRequestModel.request_id != exclude_id)
    wrs = q.order_by(WorkRequestModel.created_at.desc()).limit(limit).all()
    return [_to_dict(wr) for wr in wrs]


def approve_work_request(
    db: Session, request_id: str, approver_id: str, comment: str = "",
    priority_override: str | None = None,
) -> dict | None:
    """Supervisor approves a WR with mandatory comment."""
    wr = get_work_request(db, request_id)
    if not wr:
        return None

    now = datetime.now()
    priority = priority_override or wr.priority_code or "P3"

    wr.status = "VALIDATED"
    wr.approver_id = approver_id
    wr.approved_at = now
    wr.approval_comment = comment
    wr.priority_code = priority
    wr.work_class = derive_work_class(priority)
    wr.sla_deadline = compute_sla_deadline(priority, now)
    wr.rejection_reason = None

    # Also sync into ai_classification for backward compat
    ai = dict(wr.ai_classification) if isinstance(wr.ai_classification, dict) else {}
    ai["priority_suggested"] = priority
    wr.ai_classification = ai

    validation = dict(wr.validation) if isinstance(wr.validation, dict) else {}
    validation["validated_by"] = approver_id
    validation["validated_at"] = now.isoformat()
    validation["approval_comment"] = comment
    wr.validation = validation

    log_action(db, "work_request", request_id, "APPROVE")
    db.commit()
    db.refresh(wr)

    # Auto-add to backlog
    from api.services import backlog_service
    backlog_service.add_to_backlog(db, request_id)

    return _to_dict(wr)


def reject_work_request(
    db: Session, request_id: str, approver_id: str, reason: str,
) -> dict | None:
    """Supervisor rejects a WR with mandatory reason."""
    wr = get_work_request(db, request_id)
    if not wr:
        return None

    wr.status = "REJECTED"
    wr.approver_id = approver_id
    wr.rejection_reason = reason

    validation = dict(wr.validation) if isinstance(wr.validation, dict) else {}
    validation["validated_by"] = approver_id
    validation["validated_at"] = datetime.now().isoformat()
    validation["rejection_reason"] = reason
    wr.validation = validation

    log_action(db, "work_request", request_id, "REJECT")
    db.commit()
    db.refresh(wr)
    return _to_dict(wr)



def cancel_work_request(
    db: Session, request_id: str, reason: str = "",
) -> dict | None:
    """Cancel a work request (any open status)."""
    wr = get_work_request(db, request_id)
    if not wr:
        return None
    if wr.status in ("CLOSED", "CANCELLED"):
        return None
    wr.status = "CANCELLED"
    if reason:
        wr.rejection_reason = reason
    validation = dict(wr.validation) if isinstance(wr.validation, dict) else {}
    validation["cancelled_at"] = datetime.now().isoformat()
    validation["cancel_reason"] = reason
    wr.validation = validation
    log_action(db, "work_request", request_id, "CANCEL")
    db.commit()
    db.refresh(wr)
    return _to_dict(wr)


def validate_work_request(
    db: Session, request_id: str, action: str, modifications: dict | None = None
) -> dict | None:
    """Validate (approve/reject/modify) a work request — legacy endpoint."""
    wr = get_work_request(db, request_id)
    if not wr:
        return None

    if action == "APPROVE":
        wr.status = "VALIDATED"
        if modifications:
            _apply_modifications(wr, modifications)
        # Compute SLA on approval
        priority = wr.priority_code or "P3"
        wr.sla_deadline = compute_sla_deadline(priority)
        wr.work_class = derive_work_class(priority)
    elif action == "REJECT":
        wr.status = "REJECTED"
        if modifications and modifications.get("rejection_reason"):
            wr.rejection_reason = modifications["rejection_reason"]
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


def start_work_request(db: Session, request_id: str, user_id: str = "") -> dict | None:
    """Transition WR to IN_PROGRESS — work begins."""
    wr = get_work_request(db, request_id)
    if not wr:
        return None
    if wr.status not in ("VALIDATED", "APPROVED", "ASSIGNED", "SCHEDULED"):
        return None
    wr.status = "IN_PROGRESS"
    validation = dict(wr.validation) if isinstance(wr.validation, dict) else {}
    validation["started_by"] = user_id
    validation["started_at"] = datetime.now().isoformat()
    wr.validation = validation
    log_action(db, "work_request", request_id, "START")
    db.commit()
    db.refresh(wr)
    return _to_dict(wr)


def complete_work_request(
    db: Session, request_id: str, user_id: str = "",
    completion_notes: str = "", actual_hours: float = 0,
) -> dict | None:
    """Transition WR to COMPLETED — work finished, pending closure."""
    wr = get_work_request(db, request_id)
    if not wr:
        return None
    if wr.status != "IN_PROGRESS":
        return None
    wr.status = "COMPLETED"
    validation = dict(wr.validation) if isinstance(wr.validation, dict) else {}
    validation["completed_by"] = user_id
    validation["completed_at"] = datetime.now().isoformat()
    validation["completion_notes"] = completion_notes
    validation["actual_hours"] = actual_hours
    wr.validation = validation
    log_action(db, "work_request", request_id, "COMPLETE")
    db.commit()
    db.refresh(wr)
    return _to_dict(wr)


def close_work_request(
    db: Session, request_id: str, user_id: str = "", closure_notes: str = "",
) -> dict | None:
    """Transition WR to CLOSED — technical closure."""
    wr = get_work_request(db, request_id)
    if not wr:
        return None
    if wr.status not in ("COMPLETED", "IN_PROGRESS"):
        return None
    wr.status = "CLOSED"
    validation = dict(wr.validation) if isinstance(wr.validation, dict) else {}
    validation["closed_by"] = user_id
    validation["closed_at"] = datetime.now().isoformat()
    validation["closure_notes"] = closure_notes
    wr.validation = validation
    log_action(db, "work_request", request_id, "CLOSE")
    db.commit()
    db.refresh(wr)
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
        "priority_code": wr.priority_code,
        "work_class": wr.work_class,
        "sla_deadline": wr.sla_deadline.isoformat() if wr.sla_deadline else None,
        "created_by": wr.created_by,
        "approver_id": wr.approver_id,
        "approved_at": wr.approved_at.isoformat() if wr.approved_at else None,
        "approval_comment": wr.approval_comment,
        "rejection_reason": wr.rejection_reason,
        "created_at": wr.created_at.isoformat() if wr.created_at else None,
        # SAP Aviso fields
        "notification_type": getattr(wr, "notification_type", None),
        "reported_by": getattr(wr, "reported_by", None),
        "circumstances": getattr(wr, "circumstances", None),
        "support_equipment": getattr(wr, "support_equipment", None),
        "documents": getattr(wr, "documents", None),
    }
