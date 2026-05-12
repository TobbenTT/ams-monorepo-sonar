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
    from sqlalchemy.orm import defer
    q = db.query(WorkRequestModel).options(defer(WorkRequestModel.documents))
    q = q.filter((WorkRequestModel.deleted_at == None) | (WorkRequestModel.deleted_at.is_(None)))
    if status:
        q = q.filter(WorkRequestModel.status == status)
    if plant_id:
        q = q.filter(WorkRequestModel.ai_classification.like(f"%{plant_id}%"))
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
    # SF-681: si el planner ya bloqueó la prioridad manualmente, ignorar
    # priority_override (ej. el bump express P2 en PM03 al aprobar/convertir).
    locked = bool(isinstance(wr.validation, dict) and wr.validation.get("priority_locked"))
    priority = (wr.priority_code if locked else (priority_override or wr.priority_code)) or "P3"

    wr.status = "APROBADO"
    wr.approver_id = approver_id
    wr.approved_at = now
    wr.approval_comment = comment
    wr.priority_code = priority
    wr.work_class = derive_work_class(priority)
    wr.sla_deadline = compute_sla_deadline(priority, now)
    # SF-601 BUG-10 (2026-05-04) — mapping prioridad → clase notificación SAP.
    # Regla Jorge: P4 → M1. P1/P2/P3 mantienen el default (A1) salvo override
    # explícito previo.
    if priority == "P4" and (not wr.notification_type or wr.notification_type == "A1"):
        wr.notification_type = "M1"
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

    log_action(db, "work_request", request_id, "APPROVE", user=approver_id)
    db.commit()
    db.refresh(wr)

    # Auto-add to backlog
    from api.services import backlog_service
    backlog_service.add_to_backlog(db, request_id)

    # Email notification (async, non-blocking)
    try:
        from api.services.email_service import send_notification, is_configured
        if is_configured():
            eq = wr.equipment_tag or wr.equipment_name or ""
            send_notification(
                to=wr.reporter_email or "",
                title=f"WR {request_id} Approved",
                message=f"Work Request {request_id} for {eq} has been approved by {approver_id}.",
                link=f"/work-requests",
            )
    except Exception:
        pass

    return _to_dict(wr)


def reject_work_request(
    db: Session, request_id: str, approver_id: str, reason: str,
) -> dict | None:
    """Supervisor rejects a WR with mandatory reason."""
    wr = get_work_request(db, request_id)
    if not wr:
        return None

    wr.status = "RECHAZADO"
    wr.approver_id = approver_id
    wr.rejection_reason = reason

    validation = dict(wr.validation) if isinstance(wr.validation, dict) else {}
    validation["validated_by"] = approver_id
    validation["validated_at"] = datetime.now().isoformat()
    validation["rejection_reason"] = reason
    wr.validation = validation

    log_action(db, "work_request", request_id, "REJECT", user=approver_id)
    db.commit()
    db.refresh(wr)
    return _to_dict(wr)



def cancel_work_request(
    db: Session, request_id: str, reason: str = "", user_id: str = "system",
) -> dict | None:
    """Cancel a work request (any open status)."""
    wr = get_work_request(db, request_id)
    if not wr:
        return None
    if wr.status in ("CLOSED", "CANCELLED"):
        return None
    wr.status = "CANCELADO"
    if reason:
        wr.rejection_reason = reason
    validation = dict(wr.validation) if isinstance(wr.validation, dict) else {}
    validation["cancelled_at"] = datetime.now().isoformat()
    validation["cancel_reason"] = reason
    wr.validation = validation
    log_action(db, "work_request", request_id, "CANCEL", user=user_id)
    db.commit()
    db.refresh(wr)
    return _to_dict(wr)


def _record_ai_feedback(db, wr, modifications):
    """Auto-record feedback when planner corrects AI predictions."""
    try:
        from api.database.models import AIFeedbackModel
        import uuid

        ai = wr.ai_classification if isinstance(wr.ai_classification, dict) else {}
        pd = wr.problem_description if isinstance(wr.problem_description, dict) else {}
        if not ai:
            return

        tag = wr.equipment_tag or ""

        # Compare AI predictions with planner modifications
        field_map = {
            "priority_code": ("priority", ai.get("priority_suggested", "")),
            "estimated_duration": ("duration", str(ai.get("estimated_duration_hours", ""))),
            "failure_category": ("failure_category", pd.get("failure_mode_detected", "")),
        }

        for mod_key, (field_name, predicted) in field_map.items():
            if mod_key in modifications and predicted:
                actual = str(modifications[mod_key])
                is_same = actual.lower().strip() == str(predicted).lower().strip()
                fb = AIFeedbackModel(
                    feedback_id=str(uuid.uuid4()),
                    work_request_id=wr.request_id,
                    equipment_tag=tag,
                    field_name=field_name,
                    predicted_value=str(predicted),
                    actual_value=actual,
                    rating=1 if is_same else -1,
                    feedback_source="planner_correction",
                )
                db.add(fb)

        db.commit()
    except Exception as e:
        import logging
        logging.getLogger("ocp_maintenance").warning(f"Auto-feedback failed: {e}")


def validate_work_request(
    db: Session, request_id: str, action: str, modifications: dict | None = None, user_id: str = "system",
) -> dict | None:
    """Validate (approve/reject/modify) a work request — legacy endpoint."""
    wr = get_work_request(db, request_id)
    if not wr:
        return None

    if action == "APPROVE":
        wr.status = "APROBADO"
        if modifications:
            _apply_modifications(wr, modifications)
        # Compute SLA on approval
        priority = wr.priority_code or "P3"
        wr.sla_deadline = compute_sla_deadline(priority)
        wr.work_class = derive_work_class(priority)
    elif action == "REJECT":
        wr.status = "RECHAZADO"
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

    log_action(db, "work_request", request_id, f"VALIDATE_{action}", user=user_id)
    db.commit()
    db.refresh(wr)

    # Auto-capture AI feedback when planner modifies AI suggestions
    if action in ("APPROVE", "MODIFY") and modifications:
        _record_ai_feedback(db, wr, modifications)

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
    log_action(db, "work_request", request_id, "START", user=user_id)
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
    log_action(db, "work_request", request_id, "COMPLETE", user=user_id)
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
    log_action(db, "work_request", request_id, "CLOSE", user=user_id)
    db.commit()
    db.refresh(wr)
    return _to_dict(wr)


def delete_work_request(db: Session, request_id: str, user_id: str = "", reason: str = "") -> bool:
    """Soft-delete a work request (mark as deleted, don't remove from DB)."""
    wr = get_work_request(db, request_id)
    if not wr:
        return False
    from datetime import datetime
    wr.deleted_at = datetime.now()
    wr.deleted_by = user_id or "system"
    wr.status = "ELIMINADO"
    # Store reason in rejection_reason field
    wr.rejection_reason = reason or None
    log_action(db, "work_request", request_id, "SOFT_DELETE", user=user_id)
    db.commit()
    return True


def restore_work_request(db: Session, request_id: str) -> bool:
    """Restore a soft-deleted work request."""
    wr = db.query(WorkRequestModel).filter(WorkRequestModel.request_id == request_id).first()
    if not wr or not wr.deleted_at:
        return False
    wr.deleted_at = None
    wr.deleted_by = None
    wr.status = "PENDIENTE"
    log_action(db, "work_request", request_id, "RESTORE")
    db.commit()
    return True


def list_deleted_work_requests(db: Session, plant_id: str = None) -> list:
    """List all soft-deleted work requests."""
    q = db.query(WorkRequestModel).filter(WorkRequestModel.deleted_at != None)
    if plant_id:
        q = q.filter(WorkRequestModel.ai_classification.like(f"%{plant_id}%"))
    return q.order_by(WorkRequestModel.deleted_at.desc()).all()


def permanently_delete_work_request(db: Session, request_id: str) -> bool:
    """Permanently delete a soft-deleted work request."""
    from api.database.models import BacklogItemModel, PlannerRecommendationModel, FieldCaptureModel
    wr = db.query(WorkRequestModel).filter(WorkRequestModel.request_id == request_id).first()
    if not wr:
        return False
    db.query(BacklogItemModel).filter(BacklogItemModel.work_request_id == request_id).delete()
    db.query(PlannerRecommendationModel).filter(PlannerRecommendationModel.work_request_id == request_id).delete()
    capture_id = wr.source_capture_id
    if capture_id:
        wr.source_capture_id = None
        db.flush()
    db.delete(wr)
    if capture_id:
        db.query(FieldCaptureModel).filter(FieldCaptureModel.capture_id == capture_id).delete()
    log_action(db, "work_request", request_id, "PERMANENT_DELETE")
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
        # SF-681: la prioridad manual del planner DEBE persistir en la columna
        # DB. Antes solo se escribía en ai_classification.priority_suggested,
        # y el list endpoint principal (línea 239) lee wr.priority_code → el
        # cambio P1→P3 quedaba visualmente como P1. Ahora actualizamos AMBOS y
        # marcamos validation.priority_locked para que apply_priority_engine
        # y el bump P1/P2 PM03 respeten el override manual.
        new_prio = modifications["priority"]
        wr.priority_code = new_prio
        ai_class = dict(wr.ai_classification) if isinstance(wr.ai_classification, dict) else (wr.ai_classification or {})
        ai_class["priority_suggested"] = new_prio
        wr.ai_classification = ai_class
        v = dict(wr.validation) if isinstance(wr.validation, dict) else {}
        v["priority_locked"] = True
        wr.validation = v
    if "equipment_tag" in modifications:
        wr.equipment_tag = modifications["equipment_tag"]


def _to_dict(wr: WorkRequestModel, wo_number: str = None) -> dict:
    return {
        "request_id": wr.request_id,
        "wo_number": wo_number or "",
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
