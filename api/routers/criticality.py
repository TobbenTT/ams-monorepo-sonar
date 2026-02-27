"""Criticality router — assessment endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.schemas import CriticalityAssessRequest, RiskClassRequest
from api.services import criticality_service

router = APIRouter(prefix="/criticality", tags=["criticality"])


@router.post("/assess")
def assess_criticality(data: CriticalityAssessRequest, db: Session = Depends(get_db)):
    return criticality_service.assess(
        db,
        node_id=data.node_id,
        criteria_scores=data.criteria_scores,
        probability=data.probability,
        method=data.method,
        assessed_by=data.assessed_by,
    )


@router.get("/{node_id}")
def get_assessment(node_id: str, db: Session = Depends(get_db)):
    obj = criticality_service.get_assessment(db, node_id)
    if not obj:
        raise HTTPException(status_code=404, detail="No assessment found for this node")
    return {
        "assessment_id": obj.assessment_id,
        "node_id": obj.node_id,
        "overall_score": obj.overall_score,
        "risk_class": obj.risk_class,
        "criteria_scores": obj.criteria_scores,
        "probability": obj.probability,
        "status": obj.status,
    }


@router.put("/{assessment_id}/approve")
def approve_assessment(assessment_id: str, db: Session = Depends(get_db)):
    obj = criticality_service.approve_assessment(db, assessment_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return {"assessment_id": obj.assessment_id, "status": obj.status}


@router.post("/risk-class")
def determine_risk_class(data: RiskClassRequest):
    return criticality_service.determine_risk_class(data.overall_score)
