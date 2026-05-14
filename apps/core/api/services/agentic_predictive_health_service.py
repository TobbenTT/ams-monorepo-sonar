"""Predictive Health Prophet service.

Predicts equipment failure windows using Weibull analysis and health scores
for critical equipment (risk_class III_HIGH and IV_CRITICAL).
"""

import logging
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from api.database.models import (
    CriticalityAssessmentModel,
    FailurePredictionModel,
    HealthScoreModel,
    HierarchyNodeModel,
    ManagedWorkOrderModel,
)
from tools.engines.weibull_engine import WeibullEngine
from tools.models.schemas import RiskClass

log = logging.getLogger(__name__)


def run_predictive_health(db: Session, plant_id: str) -> dict:
    """Analyse critical equipment and predict failure windows.

    Steps:
        1. Load critical equipment (III_HIGH / IV_CRITICAL).
        2. Gather corrective/failure work-order history per equipment.
        3. Fit Weibull distribution on failure intervals.
        4. Retrieve latest health score.
        5. Build per-equipment prediction result.
        6. Rank by risk and produce a proactive intervention plan.

    Returns a dict with predictions list, counts, and intervention plan.
    """

    # ------------------------------------------------------------------
    # Step 1 — Load critical equipment
    # ------------------------------------------------------------------
    assessments = (
        db.query(CriticalityAssessmentModel)
        .filter(
            CriticalityAssessmentModel.risk_class.in_(["III_HIGH", "IV_CRITICAL"]),
        )
        .all()
    )

    critical_tags: list[dict] = []
    for a in assessments:
        node = (
            db.query(HierarchyNodeModel)
            .filter(HierarchyNodeModel.node_id == a.node_id)
            .first()
        )
        if node and node.tag:
            critical_tags.append(
                {
                    "node_id": a.node_id,
                    "equipment_tag": node.tag,
                    "risk_class": a.risk_class,
                    "plant_id": node.plant_id or plant_id,
                }
            )

    if not critical_tags:
        log.info("No critical equipment found for plant %s", plant_id)
        return {
            "predictions": [],
            "total_critical_equipment": 0,
            "analyzed": 0,
            "insufficient_data": 0,
            "high_risk_count": 0,
            "intervention_plan": [],
            "summary": "No critical equipment found.",
        }

    # ------------------------------------------------------------------
    # Step 2–5 — Iterate over critical equipment
    # ------------------------------------------------------------------
    cutoff = datetime.now() - timedelta(days=730)  # 2 years
    predictions: list[dict] = []

    for equip in critical_tags:
        tag = equip["equipment_tag"]

        # Step 2 — Gather failure history
        failure_wos = (
            db.query(ManagedWorkOrderModel)
            .filter(
                ManagedWorkOrderModel.equipment_tag == tag,
                ManagedWorkOrderModel.wo_type.in_(["CORRECTIVO", "PM01"]),
                ManagedWorkOrderModel.status.in_(["CERRADO", "COMPLETED", "CLOSED"]),
                ManagedWorkOrderModel.created_at >= cutoff,
            )
            .order_by(ManagedWorkOrderModel.created_at.asc())
            .all()
        )

        # Step 3 — Calculate failure intervals and fit Weibull
        prediction = None
        dates: list[datetime] = []
        current_age: int | None = None

        if len(failure_wos) >= 3:
            dates = [wo.created_at for wo in failure_wos]
            intervals = [(dates[i + 1] - dates[i]).days for i in range(len(dates) - 1)]
            intervals = [max(i, 0.5) for i in intervals]  # min 0.5 day

            current_age = (datetime.now() - dates[-1]).days

            try:
                WeibullEngine.fit_parameters(intervals)
                prediction = WeibullEngine.predict(
                    equipment_id=equip["node_id"],
                    equipment_tag=tag,
                    failure_intervals=intervals,
                    current_age_days=float(current_age),
                    confidence_level=0.9,
                )
            except Exception:
                log.warning(
                    "Weibull analysis failed for %s — skipping prediction", tag
                )
                prediction = None

        # Step 4 — Get or calculate health score
        health = (
            db.query(HealthScoreModel)
            .filter(HealthScoreModel.equipment_tag == tag)
            .order_by(HealthScoreModel.calculated_at.desc())
            .first()
        )

        health_score = health.composite_score if health else None
        health_class = health.health_class if health else "UNKNOWN"

        # Step 5 — Build prediction result
        result_item: dict = {
            "equipment_tag": tag,
            "risk_class": equip["risk_class"],
            "health_score": health_score,
            "health_class": health_class,
            "failure_count": len(failure_wos),
            "last_failure_date": dates[-1].isoformat() if failure_wos else None,
            "current_age_days": current_age if failure_wos else None,
        }

        if prediction:
            result_item.update(
                {
                    "weibull_beta": prediction.weibull_params.beta,
                    "weibull_eta": prediction.weibull_params.eta,
                    "r_squared": prediction.weibull_params.r_squared,
                    "reliability_current": prediction.reliability_current,
                    "predicted_failure_window_days": prediction.predicted_failure_window_days,
                    "risk_score": prediction.risk_score,
                    "failure_pattern": (
                        prediction.failure_pattern.value
                        if prediction.failure_pattern
                        else None
                    ),
                    "recommendation": prediction.recommendation,
                }
            )

            # Persist prediction as DRAFT
            pred_model = FailurePredictionModel(
                prediction_id=prediction.prediction_id,
                equipment_id=equip["node_id"],
                equipment_tag=tag,
                predicted_at=datetime.now(),
                weibull_params=prediction.weibull_params.model_dump(),
                current_age_days=prediction.current_age_days,
                reliability_current=prediction.reliability_current,
                predicted_failure_window_days=prediction.predicted_failure_window_days,
                confidence_level=prediction.confidence_level,
                risk_score=prediction.risk_score,
                failure_pattern=(
                    prediction.failure_pattern.value
                    if prediction.failure_pattern
                    else None
                ),
                recommendation=prediction.recommendation,
                status="DRAFT",
            )
            db.add(pred_model)
        else:
            result_item.update(
                {
                    "weibull_beta": None,
                    "predicted_failure_window_days": None,
                    "risk_score": None,
                    "failure_pattern": None,
                    "recommendation": (
                        "Insufficient failure data for Weibull analysis"
                        " \u2014 monitor manually"
                    ),
                }
            )

        predictions.append(result_item)

    # ------------------------------------------------------------------
    # Step 6 — Rank by risk and generate proactive plan
    # ------------------------------------------------------------------
    predictions.sort(key=lambda x: x.get("risk_score") or 0, reverse=True)

    intervention_plan: list[dict] = []
    for item in predictions[:10]:
        window = item.get("predicted_failure_window_days")
        if window is not None and window <= 90:
            if window <= 30:
                urgency = "URGENTE"
            elif window <= 60:
                urgency = "PRONTO"
            else:
                urgency = "PROGRAMAR"

            intervention_plan.append(
                {
                    "equipment_tag": item["equipment_tag"],
                    "urgency": urgency,
                    "window_days": round(window, 1),
                    "risk_score": round(item.get("risk_score", 0), 1),
                    "action": item.get("recommendation", "Inspeccionar"),
                }
            )

    db.commit()

    analyzed = len([p for p in predictions if p.get("weibull_beta")])
    insufficient = len([p for p in predictions if not p.get("weibull_beta")])
    high_risk = len([p for p in predictions if (p.get("risk_score") or 0) > 70])

    return {
        "predictions": predictions,
        "total_critical_equipment": len(critical_tags),
        "analyzed": analyzed,
        "insufficient_data": insufficient,
        "high_risk_count": high_risk,
        "intervention_plan": intervention_plan,
        "summary": (
            f"Analyzed {len(critical_tags)} critical equipment. "
            f"{len(intervention_plan)} require proactive intervention within 90 days."
        ),
    }
