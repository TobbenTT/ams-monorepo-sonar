"""Planner router — AI recommendations for work requests."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.dependencies.auth import get_current_user
from api.schemas import RecommendationAction
from api.services import planner_service

router = APIRouter(prefix="/planner", tags=["planner"], dependencies=[Depends(get_current_user)])


@router.post("/recommend/{work_request_id}")
def generate_recommendation(work_request_id: str, db: Session = Depends(get_db)):
    result = planner_service.generate_recommendation(db, work_request_id)
    if not result:
        raise HTTPException(status_code=404, detail="Work request not found")
    return result


@router.get("/recommendations/{recommendation_id}")
def get_recommendation(recommendation_id: str, db: Session = Depends(get_db)):
    rec = planner_service.get_recommendation(db, recommendation_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    return {
        "recommendation_id": rec.recommendation_id,
        "work_request_id": rec.work_request_id,
        "planner_action": rec.planner_action,
        "ai_confidence": rec.ai_confidence,
        "resource_analysis": rec.resource_analysis,
        "scheduling_suggestion": rec.scheduling_suggestion,
        "risk_assessment": rec.risk_assessment,
        "generated_at": rec.generated_at.isoformat() if rec.generated_at else None,
    }


@router.put("/recommendations/{recommendation_id}/action")
def apply_action(recommendation_id: str, data: RecommendationAction, db: Session = Depends(get_db)):
    if data.action not in ("APPROVE", "MODIFY", "ESCALATE", "DEFER"):
        raise HTTPException(status_code=400, detail="action must be APPROVE, MODIFY, ESCALATE, or DEFER")
    result = planner_service.apply_action(db, recommendation_id, data.action, data.modifications)
    if not result:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    return result
