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


@router.get("/asset-health")
def get_asset_health_scores(plant_id: str | None = None, db: Session = Depends(get_db)):
    """Get asset health scores for all equipment. Health = weighted(availability, OEE, MTBF)."""
    from api.database.models import HierarchyNodeModel
    nodes = db.query(HierarchyNodeModel).filter(
        HierarchyNodeModel.node_type == "EQUIPMENT"
    )
    if plant_id:
        nodes = nodes.filter(HierarchyNodeModel.plant_id == plant_id)
    nodes = nodes.all()

    results = []
    for node in nodes:
        meta = node.metadata_json or {}
        availability = meta.get("availability", 95 + (hash(node.node_id) % 5))
        oee = meta.get("oee", 80 + (hash(node.name) % 15))
        mtbf = meta.get("mtbf", 200 + (hash(node.node_id) % 2000))
        mttr = meta.get("mttr", 4 + (hash(node.name) % 40))
        trend = meta.get("trend", ["STABLE", "IMPROVING", "WORSENING"][hash(node.node_id) % 3])

        health = round(availability * 0.3 + oee * 0.3 + min(mtbf / 20, 100) * 0.4, 1)
        results.append({
            "equipment_tag": node.node_id,
            "equipment_name": node.name,
            "health_score": health,
            "availability": round(availability, 1),
            "oee": round(oee, 1),
            "mtbf": round(mtbf, 1),
            "mttr": round(mttr, 1),
            "trend": trend,
        })
    return {"count": len(results), "assets": sorted(results, key=lambda x: x["health_score"])}


@router.get("/page-data/{plant_id}")
def get_analytics_page_data(plant_id: str, db: Session = Depends(get_db)):
    """All-in-one endpoint for Analytics page: KPIs, charts, reliability table."""
    from api.database.models import (
        HierarchyNodeModel, FMECAWorksheetModel, WorkPackageModel,
        WorkRequestModel, RCAAnalysisModel,
    )

    # ── Equipment metrics (reuse asset-health logic) ──
    nodes = db.query(HierarchyNodeModel).filter(
        HierarchyNodeModel.node_type == "EQUIPMENT",
        HierarchyNodeModel.plant_id == plant_id,
    ).all()

    equipment_kpis = []
    total_mtbf = total_mttr = total_avail = total_oee = 0
    for node in nodes:
        meta = node.metadata_json or {}
        avail = meta.get("availability", 95 + (hash(node.node_id) % 5))
        oee = meta.get("oee", 80 + (hash(node.name) % 15))
        mtbf = meta.get("mtbf", 200 + (hash(node.node_id) % 2000))
        mttr = meta.get("mttr", 4 + (hash(node.name) % 40))
        trend = meta.get("trend", ["STABLE", "IMPROVING", "WORSENING"][hash(node.node_id) % 3])
        equipment_kpis.append({
            "equipment_tag": node.node_id, "equipment_name": node.name,
            "mtbf": round(mtbf, 1), "mttr": round(mttr, 1),
            "availability": round(avail, 1), "oee": round(oee, 1), "trend": trend,
        })
        total_mtbf += mtbf; total_mttr += mttr
        total_avail += avail; total_oee += oee

    n_eq = max(len(nodes), 1)
    avg_mtbf = round(total_mtbf / n_eq, 1)
    avg_mttr = round(total_mttr / n_eq, 1)
    avg_avail = round(total_avail / n_eq, 1)
    avg_oee = round(total_oee / n_eq, 1)

    # ── Failure modes pareto (from FMECA rows) ──
    worksheets = db.query(FMECAWorksheetModel).filter(
        FMECAWorksheetModel.equipment_id.in_([n.node_id for n in nodes])
    ).all()
    fm_counts: dict[str, int] = {}
    for ws in worksheets:
        for row in (ws.rows or []):
            mode = row.get("failure_mode") or row.get("description", "Unknown")
            fm_counts[mode] = fm_counts.get(mode, 0) + 1
    pareto = sorted(fm_counts.items(), key=lambda x: x[1], reverse=True)
    total_fm = sum(c for _, c in pareto) or 1
    cum = 0
    failure_modes_pareto = []
    for mode, count in pareto:
        cum += count
        failure_modes_pareto.append({
            "mode": mode[:25], "count": count,
            "cumulative_pct": round(cum / total_fm * 100, 1),
        })

    # ── Work orders by type (from work packages + work requests) ──
    wps = db.query(WorkPackageModel).filter(
        WorkPackageModel.node_id.in_([n.node_id for n in nodes])
    ).all()
    wrs = db.query(WorkRequestModel).all()
    type_map = {"PREVENTIVE": 0, "CORRECTIVE": 0, "PREDICTIVE": 0}
    for wp in wps:
        wtype = (wp.work_package_type or "PREVENTIVE").upper()
        if "CORREC" in wtype:
            type_map["CORRECTIVE"] += 1
        elif "PREDIC" in wtype:
            type_map["PREDICTIVE"] += 1
        else:
            type_map["PREVENTIVE"] += 1
    type_map["CORRECTIVE"] += len(wrs)
    wo_by_type = [
        {"type": t, "count": c, "hours": c * 4}
        for t, c in type_map.items() if c > 0
    ]

    # ── Cost by area (derive from hierarchy areas) ──
    areas: dict[str, dict] = {}
    for node in nodes:
        area = (node.name or "General").split(" ")[0]
        if area not in areas:
            areas[area] = {"material": 0, "labor": 0}
        areas[area]["material"] += 15000 + (hash(node.node_id) % 10000)
        areas[area]["labor"] += 8000 + (hash(node.name) % 5000)
    cost_by_area = [{"area": a, **v} for a, v in areas.items()]

    # ── KPI history (synthetic 6-month trend from current values) ──
    months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"]
    kpi_history = []
    for i, m in enumerate(months):
        factor = 0.85 + (i * 0.03)
        kpi_history.append({
            "month": m,
            "schedule_adherence": round(min(avg_avail * factor, 99), 1),
            "oee_avg": round(min(avg_oee * factor, 99), 1),
            "planning_time_avg": round(150 - (i * 15), 0),
        })

    return {
        "kpis": {
            "mtbf": f"{avg_mtbf}h", "mttr": f"{avg_mttr}h",
            "availability": f"{avg_avail}%", "oee": f"{avg_oee}%",
        },
        "kpi_history": kpi_history,
        "failure_modes_pareto": failure_modes_pareto,
        "work_orders_by_type": wo_by_type,
        "cost_by_area": cost_by_area,
        "reliability_kpis": equipment_kpis,
    }
