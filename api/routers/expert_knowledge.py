"""GAP-W13: Expert Knowledge Capture API Router.

16 endpoints for expert matching, consultation lifecycle,
knowledge contribution pipeline, and compensation tracking.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.services import expert_knowledge_service as svc

router = APIRouter(prefix="/expert-knowledge", tags=["expert-knowledge"])


# ── Consultations ────────────────────────────────────────────────────


@router.post("/consultations")
def create_consultation(
    data: dict,
    db: Session = Depends(get_db),
):
    """Create a consultation request from a troubleshooting session.

    Body: {session: {...}, expert_id: str, ai_suggestion: str, language: str}
    """
    result = svc.create_consultation(db, data)
    return result


@router.get("/consultations/{consultation_id}")
def get_consultation(
    consultation_id: str,
    db: Session = Depends(get_db),
):
    result = svc.get_consultation(db, consultation_id)
    if not result:
        raise HTTPException(status_code=404, detail="Consultation not found")
    return result


@router.get("/consultations")
def list_consultations(
    expert_id: str | None = Query(None),
    status: str | None = Query(None),
    plant_id: str | None = Query(None),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    return svc.list_consultations(db, expert_id=expert_id, status=status, plant_id=plant_id, limit=limit)


@router.put("/consultations/{consultation_id}/view")
def mark_consultation_viewed(
    consultation_id: str,
    db: Session = Depends(get_db),
):
    result = svc.mark_viewed(db, consultation_id)
    if not result:
        raise HTTPException(status_code=404, detail="Consultation not found")
    return result


@router.put("/consultations/{consultation_id}/respond")
def submit_expert_response(
    consultation_id: str,
    data: dict,
    db: Session = Depends(get_db),
):
    """Submit expert guidance.

    Body: {expert_guidance: str, fm_codes: [str], confidence: float}
    """
    result = svc.submit_response(db, consultation_id, data)
    if not result:
        raise HTTPException(status_code=404, detail="Consultation not found")
    return result


@router.put("/consultations/{consultation_id}/close")
def close_consultation(
    consultation_id: str,
    data: dict | None = None,
    db: Session = Depends(get_db),
):
    result = svc.close_consultation_svc(db, consultation_id, data)
    if not result:
        raise HTTPException(status_code=404, detail="Consultation not found")
    return result


# ── Portal (Token-based access) ──────────────────────────────────────


@router.get("/portal/{token}")
def portal_access(
    token: str,
    db: Session = Depends(get_db),
):
    """Token-based portal access for retired experts."""
    result = svc.get_portal_consultation(db, token)
    if not result:
        raise HTTPException(status_code=404, detail="Invalid or expired link")
    if result.get("error"):
        raise HTTPException(status_code=403, detail=result["error"])
    return result


# ── Contributions ────────────────────────────────────────────────────


@router.post("/contributions")
def create_contribution(
    data: dict,
    db: Session = Depends(get_db),
):
    """Create contribution from a responded consultation.

    Body: {consultation_id: str}
    """
    result = svc.create_contribution(db, data.get("consultation_id", ""))
    if not result:
        raise HTTPException(status_code=400, detail="Consultation not found or not responded")
    return result


@router.get("/contributions")
def list_contributions(
    status: str | None = Query(None),
    equipment_type_id: str | None = Query(None),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    return svc.list_contributions(db, status=status, equipment_type_id=equipment_type_id, limit=limit)


@router.put("/contributions/{contribution_id}/validate")
def validate_contribution(
    contribution_id: str,
    data: dict,
    db: Session = Depends(get_db),
):
    """Validate contribution by reliability engineer.

    Body: {fm_codes: [str], validated_by: str}
    """
    result = svc.validate_contribution_svc(db, contribution_id, data)
    if not result:
        raise HTTPException(status_code=404, detail="Contribution not found")
    return result


@router.put("/contributions/{contribution_id}/promote")
def promote_contribution(
    contribution_id: str,
    data: dict,
    db: Session = Depends(get_db),
):
    """Promote validated contribution to knowledge base.

    Body: {targets: ["symptom-catalog", "decision-tree", "manual", "memory"]}
    """
    result = svc.promote_contribution_svc(db, contribution_id, data)
    if not result:
        raise HTTPException(status_code=400, detail="Contribution not found or not validated")
    return result


# ── Experts ──────────────────────────────────────────────────────────


@router.get("/experts")
def list_experts(
    retired_only: bool = Query(False),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    return svc.list_experts(db, retired_only=retired_only, limit=limit)


@router.post("/experts")
def register_expert(
    data: dict,
    db: Session = Depends(get_db),
):
    return svc.register_expert(db, data)


@router.get("/experts/{expert_id}/compensation")
def get_expert_compensation(
    expert_id: str,
    period: str | None = Query(None),
    db: Session = Depends(get_db),
):
    result = svc.get_expert_compensation(db, expert_id, period=period)
    if result.get("error"):
        raise HTTPException(status_code=404, detail=result["error"])
    return result


# ── Notifications ────────────────────────────────────────────────────


@router.get("/notifications/{recipient_id}")
def get_notifications(
    recipient_id: str,
    db: Session = Depends(get_db),
):
    return svc.get_notifications(db, recipient_id)


@router.put("/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: str,
    db: Session = Depends(get_db),
):
    result = svc.mark_notification_read(db, notification_id)
    if not result:
        raise HTTPException(status_code=404, detail="Notification not found")
    return result
