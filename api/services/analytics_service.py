"""Analytics service — KPIs, health scores, Weibull, variance detection."""

from datetime import date, datetime
from sqlalchemy.orm import Session

from api.database.models import HealthScoreModel, KPIMetricsModel, FailurePredictionModel, VarianceAlertModel
from api.services.audit_service import log_action
from tools.engines.health_score_engine import HealthScoreEngine
from tools.engines.kpi_engine import KPIEngine
from tools.engines.weibull_engine import WeibullEngine
from tools.engines.variance_detector import VarianceDetector
from tools.engines.management_review_engine import ManagementReviewEngine
from tools.models.schemas import RiskClass, PlantMetricSnapshot


def calculate_health_score(db: Session, node_id: str, plant_id: str, equipment_tag: str, risk_class: str, **kwargs) -> dict:
    rc = RiskClass(risk_class)
    result = HealthScoreEngine.calculate(
        node_id=node_id, plant_id=plant_id, equipment_tag=equipment_tag,
        risk_class=rc, **kwargs,
    )
    obj = HealthScoreModel(
        node_id=node_id, plant_id=plant_id, equipment_tag=equipment_tag,
        calculated_at=datetime.now(),
        dimensions=[d.model_dump() for d in result.dimensions],
        composite_score=result.composite_score,
        health_class=result.health_class,
        recommendations=result.recommendations,
    )
    db.add(obj)
    log_action(db, "health_score", obj.score_id, "CREATE")
    db.commit()
    return result.model_dump(mode="json")


def calculate_kpis(db: Session, plant_id: str, failure_dates: list[str] | None = None, total_period_hours: float | None = None, total_downtime_hours: float | None = None) -> dict:
    result = {}
    if failure_dates:
        dates = [date.fromisoformat(d) for d in failure_dates]
        result["mtbf_days"] = KPIEngine.calculate_mtbf(dates)
    if total_period_hours is not None and total_downtime_hours is not None:
        result["availability_pct"] = KPIEngine.calculate_availability(total_period_hours, total_downtime_hours)

    obj = KPIMetricsModel(
        plant_id=plant_id,
        period_start=date.today(),
        period_end=date.today(),
        calculated_at=datetime.now(),
        mtbf_days=result.get("mtbf_days"),
        availability_pct=result.get("availability_pct"),
    )
    db.add(obj)
    log_action(db, "kpi_metrics", obj.metrics_id, "CREATE")
    db.commit()
    return result


def fit_weibull(failure_intervals: list[float]) -> dict:
    params = WeibullEngine.fit_parameters(failure_intervals)
    return params.model_dump()


def predict_failure(db: Session, equipment_id: str, equipment_tag: str, failure_intervals: list[float], current_age_days: float, confidence_level: float = 0.9) -> dict:
    result = WeibullEngine.predict(
        equipment_id=equipment_id, equipment_tag=equipment_tag,
        failure_intervals=failure_intervals, current_age_days=current_age_days,
        confidence_level=confidence_level,
    )
    obj = FailurePredictionModel(
        equipment_id=equipment_id, equipment_tag=equipment_tag,
        predicted_at=datetime.now(),
        weibull_params=result.weibull_params.model_dump(),
        current_age_days=current_age_days,
        reliability_current=result.reliability_current,
        predicted_failure_window_days=result.predicted_failure_window_days,
        confidence_level=confidence_level,
        risk_score=result.risk_score,
        failure_pattern=result.failure_pattern.value if result.failure_pattern else None,
        recommendation=result.recommendation,
        status="DRAFT",
    )
    db.add(obj)
    log_action(db, "failure_prediction", obj.prediction_id, "CREATE")
    db.commit()
    return result.model_dump(mode="json")


def detect_variance(snapshots: list[dict]) -> list[dict]:
    snap_objs = [PlantMetricSnapshot(**s) for s in snapshots]
    alerts = VarianceDetector.detect_variance(snap_objs)
    return [a.model_dump(mode="json") for a in alerts]


def get_variance_alerts(db: Session) -> list[VarianceAlertModel]:
    return db.query(VarianceAlertModel).order_by(VarianceAlertModel.detected_at.desc()).all()
