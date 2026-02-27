"""Criticality assessment service — wraps CriticalityEngine."""

from datetime import datetime
from sqlalchemy.orm import Session

from api.database.models import CriticalityAssessmentModel
from api.services.audit_service import log_action
from tools.engines.criticality_engine import CriticalityEngine
from tools.models.schemas import CriteriaScore, CriticalityAssessment, CriticalityMethod, RiskClass


def assess(db: Session, node_id: str, criteria_scores: list[dict], probability: int, method: str = "FULL_MATRIX", assessed_by: str = "system") -> dict:
    scores = [CriteriaScore(**s) for s in criteria_scores]
    overall = CriticalityEngine.calculate_overall_score(scores, probability)
    risk_class = CriticalityEngine.determine_risk_class(overall)
    warnings = CriticalityEngine.validate_full_matrix(scores) if method == "FULL_MATRIX" else []

    assessment = CriticalityAssessmentModel(
        node_id=node_id,
        assessed_at=datetime.now(),
        assessed_by=assessed_by,
        method=method,
        criteria_scores=[s.model_dump() for s in scores],
        probability=probability,
        overall_score=overall,
        risk_class=risk_class.value,
        status="DRAFT",
    )
    db.add(assessment)
    log_action(db, "criticality_assessment", assessment.assessment_id, "CREATE")
    db.commit()
    db.refresh(assessment)

    return {
        "assessment_id": assessment.assessment_id,
        "overall_score": overall,
        "risk_class": risk_class.value,
        "status": "DRAFT",
        "warnings": warnings,
    }


def get_assessment(db: Session, node_id: str) -> CriticalityAssessmentModel | None:
    return db.query(CriticalityAssessmentModel).filter(
        CriticalityAssessmentModel.node_id == node_id
    ).order_by(CriticalityAssessmentModel.assessed_at.desc()).first()


def approve_assessment(db: Session, assessment_id: str) -> CriticalityAssessmentModel | None:
    obj = db.query(CriticalityAssessmentModel).filter(
        CriticalityAssessmentModel.assessment_id == assessment_id
    ).first()
    if not obj:
        return None
    obj.status = "APPROVED"
    log_action(db, "criticality_assessment", assessment_id, "APPROVE")
    db.commit()
    db.refresh(obj)
    return obj


def determine_risk_class(overall_score: float) -> dict:
    risk_class = CriticalityEngine.determine_risk_class(overall_score)
    return {"overall_score": overall_score, "risk_class": risk_class.value}
