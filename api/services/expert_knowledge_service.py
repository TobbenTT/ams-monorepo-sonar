"""GAP-W13: Expert Knowledge Service.

Bridges API router to ExpertKnowledgeEngine + DB persistence.
"""

from __future__ import annotations

import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional

from sqlalchemy.orm import Session

from api.database.models import (
    ExpertCardModel,
    ExpertConsultationModel,
    ExpertContributionModel,
    NotificationModel,
)
from tools.engines.expert_knowledge_engine import ExpertKnowledgeEngine

logger = logging.getLogger(__name__)

# ── Paths for knowledge promotion targets ────────────────────────────
_KB_BASE = Path(__file__).resolve().parent.parent.parent
_SYMPTOM_CATALOG = _KB_BASE / "skills" / "00-knowledge-base" / "data-models" / "troubleshooting" / "symptom-catalog.json"
_TREES_DIR = _KB_BASE / "skills" / "00-knowledge-base" / "data-models" / "troubleshooting" / "trees"
_MANUALS_DIR = _KB_BASE / "data" / "manuals"
_MEMORY_DIR = _KB_BASE / "templates" / "client-project" / "3-memory"


def _json_loads(text: Optional[str]) -> list | dict:
    if not text:
        return []
    try:
        return json.loads(text)
    except (json.JSONDecodeError, TypeError):
        return []


def _json_dumps(obj) -> str:
    return json.dumps(obj, ensure_ascii=False) if obj else "[]"


def _consultation_to_dict(m: ExpertConsultationModel) -> dict:
    return {
        "consultation_id": m.consultation_id,
        "session_id": m.session_id,
        "expert_id": m.expert_id,
        "technician_id": m.technician_id,
        "equipment_type_id": m.equipment_type_id,
        "equipment_tag": m.equipment_tag,
        "plant_id": m.plant_id,
        "symptoms_snapshot": _json_loads(m.symptoms_snapshot),
        "candidates_snapshot": _json_loads(m.candidates_snapshot),
        "ai_suggestion": m.ai_suggestion,
        "expert_guidance": m.expert_guidance,
        "expert_fm_codes": _json_loads(m.expert_fm_codes),
        "expert_confidence": m.expert_confidence,
        "status": m.status,
        "token": m.token,
        "token_expires_at": m.token_expires_at.isoformat() if m.token_expires_at else None,
        "requested_at": m.requested_at.isoformat() if m.requested_at else None,
        "viewed_at": m.viewed_at.isoformat() if m.viewed_at else None,
        "responded_at": m.responded_at.isoformat() if m.responded_at else None,
        "closed_at": m.closed_at.isoformat() if m.closed_at else None,
        "response_time_minutes": m.response_time_minutes,
        "compensation_status": m.compensation_status,
        "language": m.language,
        "notes": m.notes,
    }


def _contribution_to_dict(m: ExpertContributionModel) -> dict:
    return {
        "contribution_id": m.contribution_id,
        "consultation_id": m.consultation_id,
        "expert_id": m.expert_id,
        "equipment_type_id": m.equipment_type_id,
        "fm_codes": _json_loads(m.fm_codes),
        "symptom_descriptions": _json_loads(m.symptom_descriptions),
        "diagnostic_steps": _json_loads(m.diagnostic_steps),
        "corrective_actions": _json_loads(m.corrective_actions),
        "tips": m.tips,
        "status": m.status,
        "validated_by": m.validated_by,
        "validated_at": m.validated_at.isoformat() if m.validated_at else None,
        "promoted_at": m.promoted_at.isoformat() if m.promoted_at else None,
        "promoted_targets": _json_loads(m.promoted_targets),
        "created_at": m.created_at.isoformat() if m.created_at else None,
    }


def _expert_to_dict(m: ExpertCardModel) -> dict:
    return {
        "expert_id": m.expert_id,
        "user_id": m.user_id,
        "name": m.name,
        "role": m.role,
        "plant_id": m.plant_id,
        "domains": m.domains or [],
        "equipment_expertise": m.equipment_expertise or [],
        "certifications": m.certifications or [],
        "years_experience": m.years_experience,
        "resolution_count": m.resolution_count,
        "last_active": m.last_active.isoformat() if m.last_active else None,
        "contact_method": m.contact_method,
        "languages": m.languages or [],
        "is_retired": m.is_retired,
        "retired_at": m.retired_at.isoformat() if m.retired_at else None,
        "hourly_rate_usd": m.hourly_rate_usd,
        "availability_hours": m.availability_hours,
        "preferred_contact": m.preferred_contact,
    }


# ── Consultation CRUD ────────────────────────────────────────────────


def create_consultation(db: Session, data: dict) -> dict:
    """Create consultation from engine output and persist."""
    consultation_data = ExpertKnowledgeEngine.create_consultation(
        session=data.get("session", {}),
        expert_id=data.get("expert_id", ""),
        ai_suggestion=data.get("ai_suggestion", ""),
        language=data.get("language", "fr"),
    )

    model = ExpertConsultationModel(
        consultation_id=consultation_data["consultation_id"],
        session_id=consultation_data["session_id"],
        expert_id=consultation_data["expert_id"],
        technician_id=consultation_data["technician_id"],
        equipment_type_id=consultation_data["equipment_type_id"],
        equipment_tag=consultation_data["equipment_tag"],
        plant_id=consultation_data["plant_id"],
        symptoms_snapshot=_json_dumps(consultation_data["symptoms_snapshot"]),
        candidates_snapshot=_json_dumps(consultation_data["candidates_snapshot"]),
        ai_suggestion=consultation_data["ai_suggestion"],
        status="REQUESTED",
        token=consultation_data["token"],
        token_expires_at=datetime.fromisoformat(consultation_data["token_expires_at"]),
        requested_at=datetime.fromisoformat(consultation_data["requested_at"]),
        language=consultation_data["language"],
    )
    db.add(model)

    # Create notification (uses existing NotificationModel with GAP-W13 extended fields)
    notif = NotificationModel(
        notification_type="EXPERT_CONSULTATION",
        level="INFO",
        plant_id=consultation_data.get("plant_id", ""),
        title=f"New consultation request for {consultation_data['equipment_type_id']}",
        message=f"New consultation request for {consultation_data['equipment_type_id']}",
        recipient_id=consultation_data["expert_id"],
        consultation_id=consultation_data["consultation_id"],
        channel="IN_APP",
    )
    db.add(notif)
    _send_email_notification(consultation_data)

    db.commit()
    db.refresh(model)
    return _consultation_to_dict(model)


def get_consultation(db: Session, consultation_id: str) -> dict | None:
    model = db.query(ExpertConsultationModel).filter(
        ExpertConsultationModel.consultation_id == consultation_id
    ).first()
    return _consultation_to_dict(model) if model else None


def list_consultations(
    db: Session,
    expert_id: str | None = None,
    status: str | None = None,
    plant_id: str | None = None,
    limit: int = 50,
) -> list[dict]:
    q = db.query(ExpertConsultationModel)
    if expert_id:
        q = q.filter(ExpertConsultationModel.expert_id == expert_id)
    if status:
        q = q.filter(ExpertConsultationModel.status == status)
    if plant_id:
        q = q.filter(ExpertConsultationModel.plant_id == plant_id)
    q = q.order_by(ExpertConsultationModel.requested_at.desc()).limit(limit)
    return [_consultation_to_dict(m) for m in q.all()]


def get_portal_consultation(db: Session, token: str) -> dict | None:
    model = db.query(ExpertConsultationModel).filter(
        ExpertConsultationModel.token == token
    ).first()
    if not model:
        return None
    consultation = _consultation_to_dict(model)
    valid, error = ExpertKnowledgeEngine.validate_token(token, consultation)
    if not valid:
        return {"error": error, "valid": False}
    return {**consultation, "valid": True}


def mark_viewed(db: Session, consultation_id: str) -> dict | None:
    model = db.query(ExpertConsultationModel).filter(
        ExpertConsultationModel.consultation_id == consultation_id
    ).first()
    if not model:
        return None
    updated = ExpertKnowledgeEngine.mark_viewed(_consultation_to_dict(model))
    if updated.get("viewed_at"):
        model.viewed_at = datetime.fromisoformat(updated["viewed_at"]) if isinstance(updated["viewed_at"], str) else updated["viewed_at"]
    model.status = updated["status"]
    db.commit()
    db.refresh(model)
    return _consultation_to_dict(model)


def submit_response(db: Session, consultation_id: str, data: dict) -> dict | None:
    model = db.query(ExpertConsultationModel).filter(
        ExpertConsultationModel.consultation_id == consultation_id
    ).first()
    if not model:
        return None

    updated = ExpertKnowledgeEngine.record_expert_response(
        _consultation_to_dict(model),
        expert_guidance=data.get("expert_guidance", ""),
        fm_codes=data.get("fm_codes"),
        confidence=data.get("confidence", 0.0),
    )

    model.expert_guidance = updated["expert_guidance"]
    model.expert_fm_codes = _json_dumps(updated["expert_fm_codes"])
    model.expert_confidence = updated["expert_confidence"]
    model.status = updated["status"]
    model.responded_at = datetime.fromisoformat(updated["responded_at"]) if isinstance(updated.get("responded_at"), str) else updated.get("responded_at")
    model.response_time_minutes = updated.get("response_time_minutes", 0.0)

    # Update expert resolution count
    expert = db.query(ExpertCardModel).filter(
        ExpertCardModel.expert_id == model.expert_id
    ).first()
    if expert:
        expert.resolution_count = (expert.resolution_count or 0) + 1
        expert.last_active = datetime.now()

    db.commit()
    db.refresh(model)
    return _consultation_to_dict(model)


def close_consultation_svc(db: Session, consultation_id: str, data: dict | None = None) -> dict | None:
    model = db.query(ExpertConsultationModel).filter(
        ExpertConsultationModel.consultation_id == consultation_id
    ).first()
    if not model:
        return None

    notes = data.get("notes", "") if data else ""
    updated = ExpertKnowledgeEngine.close_consultation(
        _consultation_to_dict(model), notes=notes,
    )
    model.status = updated["status"]
    model.closed_at = datetime.fromisoformat(updated["closed_at"]) if isinstance(updated.get("closed_at"), str) else updated.get("closed_at")
    model.notes = updated.get("notes", model.notes)
    db.commit()
    db.refresh(model)
    return _consultation_to_dict(model)


# ── Contribution CRUD ────────────────────────────────────────────────


def create_contribution(db: Session, consultation_id: str) -> dict | None:
    consultation = db.query(ExpertConsultationModel).filter(
        ExpertConsultationModel.consultation_id == consultation_id
    ).first()
    if not consultation or consultation.status not in ("RESPONDED", "CLOSED"):
        return None

    contribution_data = ExpertKnowledgeEngine.extract_contribution(
        _consultation_to_dict(consultation)
    )

    model = ExpertContributionModel(
        contribution_id=contribution_data["contribution_id"],
        consultation_id=consultation_id,
        expert_id=contribution_data["expert_id"],
        equipment_type_id=contribution_data["equipment_type_id"],
        fm_codes=_json_dumps(contribution_data["fm_codes"]),
        symptom_descriptions=_json_dumps(contribution_data["symptom_descriptions"]),
        diagnostic_steps=_json_dumps(contribution_data["diagnostic_steps"]),
        corrective_actions=_json_dumps(contribution_data["corrective_actions"]),
        tips=contribution_data["tips"],
        status="RAW",
    )
    db.add(model)
    db.commit()
    db.refresh(model)
    return _contribution_to_dict(model)


def list_contributions(
    db: Session,
    status: str | None = None,
    equipment_type_id: str | None = None,
    limit: int = 50,
) -> list[dict]:
    q = db.query(ExpertContributionModel)
    if status:
        q = q.filter(ExpertContributionModel.status == status)
    if equipment_type_id:
        q = q.filter(ExpertContributionModel.equipment_type_id == equipment_type_id)
    q = q.order_by(ExpertContributionModel.created_at.desc()).limit(limit)
    return [_contribution_to_dict(m) for m in q.all()]


def validate_contribution_svc(
    db: Session, contribution_id: str, data: dict,
) -> dict | None:
    model = db.query(ExpertContributionModel).filter(
        ExpertContributionModel.contribution_id == contribution_id
    ).first()
    if not model:
        return None

    updated = ExpertKnowledgeEngine.validate_contribution(
        _contribution_to_dict(model),
        fm_codes=data.get("fm_codes", []),
        validated_by=data.get("validated_by", ""),
    )

    model.fm_codes = _json_dumps(updated["fm_codes"])
    model.status = updated["status"]
    model.validated_by = updated.get("validated_by", "")
    model.validated_at = datetime.fromisoformat(updated["validated_at"]) if isinstance(updated.get("validated_at"), str) else updated.get("validated_at")
    db.commit()
    db.refresh(model)
    return _contribution_to_dict(model)


def promote_contribution_svc(
    db: Session, contribution_id: str, data: dict,
) -> dict | None:
    model = db.query(ExpertContributionModel).filter(
        ExpertContributionModel.contribution_id == contribution_id
    ).first()
    if not model or model.status != "VALIDATED":
        return None

    contribution = _contribution_to_dict(model)
    targets = data.get("targets", ["symptom-catalog", "manual", "memory"])
    promoted: list[str] = []

    if "symptom-catalog" in targets:
        ExpertKnowledgeEngine.promote_to_symptom_catalog(contribution, _SYMPTOM_CATALOG)
        promoted.append("symptom-catalog")

    if "decision-tree" in targets:
        if ExpertKnowledgeEngine.promote_to_decision_tree(contribution, _TREES_DIR):
            promoted.append("decision-tree")

    if "manual" in targets:
        ExpertKnowledgeEngine.promote_to_manual(contribution, _MANUALS_DIR)
        promoted.append("manual")

    if "memory" in targets:
        ExpertKnowledgeEngine.promote_to_memory(contribution, _MEMORY_DIR)
        promoted.append("memory")

    model.status = "PROMOTED"
    model.promoted_at = datetime.now()
    model.promoted_targets = _json_dumps(promoted)
    db.commit()
    db.refresh(model)
    return _contribution_to_dict(model)


# ── Expert CRUD ──────────────────────────────────────────────────────


def list_experts(db: Session, retired_only: bool = False, limit: int = 50) -> list[dict]:
    q = db.query(ExpertCardModel)
    if retired_only:
        q = q.filter(ExpertCardModel.is_retired.is_(True))
    return [_expert_to_dict(m) for m in q.limit(limit).all()]


def register_expert(db: Session, data: dict) -> dict:
    model = ExpertCardModel(
        user_id=data.get("user_id", ""),
        name=data.get("name", ""),
        role=data.get("role", "RETIRED_EXPERT"),
        plant_id=data.get("plant_id", ""),
        domains=data.get("domains"),
        equipment_expertise=data.get("equipment_expertise"),
        certifications=data.get("certifications"),
        years_experience=data.get("years_experience", 0),
        resolution_count=data.get("resolution_count", 0),
        contact_method=data.get("contact_method", ""),
        languages=data.get("languages"),
        is_retired=data.get("is_retired", True),
        retired_at=data.get("retired_at"),
        hourly_rate_usd=data.get("hourly_rate_usd", 50.0),
        availability_hours=data.get("availability_hours", ""),
        preferred_contact=data.get("preferred_contact", "IN_APP"),
    )
    db.add(model)
    db.commit()
    db.refresh(model)
    return _expert_to_dict(model)


def get_expert_compensation(
    db: Session, expert_id: str, period: str | None = None,
) -> dict:
    expert = db.query(ExpertCardModel).filter(
        ExpertCardModel.expert_id == expert_id
    ).first()
    if not expert:
        return {"error": "Expert not found"}

    q = db.query(ExpertConsultationModel).filter(
        ExpertConsultationModel.expert_id == expert_id,
        ExpertConsultationModel.status.in_(["RESPONDED", "CLOSED"]),
    )
    consultations = [_consultation_to_dict(m) for m in q.all()]

    summary = ExpertKnowledgeEngine.calculate_compensation(
        consultations, hourly_rate_usd=expert.hourly_rate_usd or 50.0,
    )
    summary["expert_id"] = expert_id
    summary["expert_name"] = expert.name
    summary["period"] = period or datetime.now().strftime("%Y-%m")
    return summary


# ── Notifications ────────────────────────────────────────────────────


def get_notifications(db: Session, recipient_id: str) -> list[dict]:
    models = db.query(NotificationModel).filter(
        NotificationModel.recipient_id == recipient_id,
        NotificationModel.acknowledged.is_(False),
    ).order_by(NotificationModel.created_at.desc()).all()
    return [
        {
            "notification_id": m.notification_id,
            "recipient_id": m.recipient_id,
            "consultation_id": m.consultation_id,
            "channel": m.channel or "IN_APP",
            "acknowledged": m.acknowledged,
            "message": m.message,
            "title": m.title,
            "created_at": m.created_at.isoformat() if m.created_at else None,
        }
        for m in models
    ]


def mark_notification_read(db: Session, notification_id: str) -> dict | None:
    model = db.query(NotificationModel).filter(
        NotificationModel.notification_id == notification_id
    ).first()
    if not model:
        return None
    model.acknowledged = True
    model.acknowledged_at = datetime.now()
    model.read_at = datetime.now()
    db.commit()
    db.refresh(model)
    return {
        "notification_id": model.notification_id,
        "acknowledged": model.acknowledged,
        "read_at": model.read_at.isoformat() if model.read_at else None,
    }


# ── Email Stub ───────────────────────────────────────────────────────


def _send_email_notification(consultation_data: dict) -> None:
    """Email notification stub. Production: wire to SendGrid/SES."""
    logger.info(
        "EMAIL_STUB: Would send consultation notification to expert %s "
        "for consultation %s (equipment: %s)",
        consultation_data.get("expert_id"),
        consultation_data.get("consultation_id"),
        consultation_data.get("equipment_type_id"),
    )
