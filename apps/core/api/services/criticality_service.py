"""Criticality assessment service — wraps CriticalityEngine."""

from datetime import datetime
from sqlalchemy.orm import Session

from api.database.models import CriticalityAssessmentModel, HierarchyNodeModel
from api.services.audit_service import log_action
from tools.engines.criticality_engine import CriticalityEngine
from tools.models.schemas import CriteriaScore, CriticalityAssessment, CriticalityMethod, RiskClass


# RiskClass (I/II/III/IV) → equipment criticality letter (B/A/A+/AA)
RISK_TO_LETTER = {
    "I_LOW":      "B",
    "II_MEDIUM":  "A",
    "III_HIGH":   "A+",
    "IV_CRITICAL": "AA",
}


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
    # Propagate to hierarchy_nodes.criticality (letter code AA/A+/A/B/C/D)
    letter = RISK_TO_LETTER.get(obj.risk_class)
    if letter:
        node = db.query(HierarchyNodeModel).filter(HierarchyNodeModel.node_id == obj.node_id).first()
        if node:
            node.criticality = letter
    log_action(db, "criticality_assessment", assessment_id, "APPROVE")
    db.commit()
    db.refresh(obj)
    return obj


def list_by_plant(db: Session, plant_id: str) -> list[dict]:
    """Return every EQUIPMENT node under a plant with its latest assessment (if any)."""
    nodes = db.query(HierarchyNodeModel).filter(
        HierarchyNodeModel.plant_id == plant_id,
        HierarchyNodeModel.node_type == "EQUIPMENT",
    ).all()
    if not nodes:
        return []
    node_ids = [n.node_id for n in nodes]
    assessments = db.query(CriticalityAssessmentModel).filter(
        CriticalityAssessmentModel.node_id.in_(node_ids),
    ).order_by(CriticalityAssessmentModel.assessed_at.desc()).all()
    latest_by_node = {}
    for a in assessments:
        if a.node_id not in latest_by_node:
            latest_by_node[a.node_id] = a
    result = []
    for n in nodes:
        a = latest_by_node.get(n.node_id)
        result.append({
            "node_id": n.node_id,
            "code": n.code,
            "name": n.name,
            "tag": n.tag,
            "node_criticality": n.criticality,
            "assessment_id": a.assessment_id if a else None,
            "overall_score": a.overall_score if a else None,
            "risk_class": a.risk_class if a else None,
            "letter": RISK_TO_LETTER.get(a.risk_class) if a else None,
            "status": a.status if a else None,
            "probability": a.probability if a else None,
            "criteria_scores": a.criteria_scores if a else None,
            "assessed_at": a.assessed_at.isoformat() if a and a.assessed_at else None,
            "assessed_by": a.assessed_by if a else None,
        })
    return result


def determine_risk_class(overall_score: float) -> dict:
    risk_class = CriticalityEngine.determine_risk_class(overall_score)
    return {"overall_score": overall_score, "risk_class": risk_class.value}
