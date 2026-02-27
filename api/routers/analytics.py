"""Analytics router — KPIs, health scores, Weibull, variance."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.schemas import (
    HealthScoreRequest, KPIRequest, WeibullFitRequest,
    WeibullPredictRequest, VarianceDetectRequest,
)
from api.services import analytics_service

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.post("/health-score")
def calculate_health_score(data: HealthScoreRequest, db: Session = Depends(get_db)):
    return analytics_service.calculate_health_score(
        db,
        node_id=data.node_id,
        plant_id=data.plant_id,
        equipment_tag=data.equipment_tag,
        risk_class=data.risk_class,
        pending_backlog_hours=data.pending_backlog_hours,
        capacity_hours_per_week=data.capacity_hours_per_week,
        total_failure_modes=data.total_failure_modes,
        fm_with_strategy=data.fm_with_strategy,
        active_alerts=data.active_alerts,
        critical_alerts=data.critical_alerts,
        planned_wo=data.planned_wo,
        executed_on_time=data.executed_on_time,
    )


@router.post("/kpis")
def calculate_kpis(data: KPIRequest, db: Session = Depends(get_db)):
    return analytics_service.calculate_kpis(
        db,
        plant_id=data.plant_id,
        failure_dates=data.failure_dates,
        total_period_hours=data.total_period_hours,
        total_downtime_hours=data.total_downtime_hours,
    )


@router.post("/weibull-fit")
def fit_weibull(data: WeibullFitRequest):
    return analytics_service.fit_weibull(data.failure_intervals)


@router.post("/weibull-predict")
def predict_failure(data: WeibullPredictRequest, db: Session = Depends(get_db)):
    return analytics_service.predict_failure(
        db,
        equipment_id=data.equipment_id,
        equipment_tag=data.equipment_tag,
        failure_intervals=data.failure_intervals,
        current_age_days=data.current_age_days,
        confidence_level=data.confidence_level,
    )


@router.post("/variance-detect")
def detect_variance(data: VarianceDetectRequest):
    return analytics_service.detect_variance(data.snapshots)


@router.get("/variance-alerts")
def get_variance_alerts(db: Session = Depends(get_db)):
    alerts = analytics_service.get_variance_alerts(db)
    return [
        {"alert_id": a.alert_id, "plant_id": a.plant_id, "metric_name": a.metric_name,
         "z_score": a.z_score, "variance_level": a.variance_level}
        for a in alerts
    ]
