"""Analytics router — KPIs, health scores, Weibull, variance."""

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.dependencies.auth import get_current_user
from api.schemas import (
    HealthScoreRequest, KPIRequest, WeibullFitRequest,
    WeibullPredictRequest, VarianceDetectRequest,
)
from api.services import analytics_service

router = APIRouter(prefix="/analytics", tags=["analytics"], dependencies=[Depends(get_current_user)])


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
    """Get asset health scores for all equipment from real DB data."""
    from api.database.models import HierarchyNodeModel, HealthScoreModel, KPIMetricsModel

    nodes = db.query(HierarchyNodeModel).filter(
        HierarchyNodeModel.node_type == "EQUIPMENT"
    )
    if plant_id:
        nodes = nodes.filter(HierarchyNodeModel.plant_id == plant_id)
    nodes = nodes.all()

    # Index latest health scores and KPI metrics by node_id
    health_map: dict[str, HealthScoreModel] = {}
    kpi_map: dict[str, KPIMetricsModel] = {}
    for node in nodes:
        hs = db.query(HealthScoreModel).filter(
            HealthScoreModel.node_id == node.node_id
        ).order_by(HealthScoreModel.calculated_at.desc()).first()
        if hs:
            health_map[node.node_id] = hs
        km = db.query(KPIMetricsModel).filter(
            KPIMetricsModel.equipment_id == node.node_id
        ).order_by(KPIMetricsModel.calculated_at.desc()).first()
        if km:
            kpi_map[node.node_id] = km

    results = []
    for node in nodes:
        hs = health_map.get(node.node_id)
        km = kpi_map.get(node.node_id)
        meta = node.metadata_json or {}

        availability = (km.availability_pct if km and km.availability_pct is not None
                        else meta.get("availability"))
        oee = (km.oee_pct if km and km.oee_pct is not None
               else meta.get("oee"))
        mtbf = (km.mtbf_days if km and km.mtbf_days is not None
                else meta.get("mtbf"))
        mttr = (km.mttr_hours if km and km.mttr_hours is not None
                else meta.get("mttr"))
        trend = (hs.trend if hs and hs.trend else meta.get("trend"))
        health = (hs.composite_score if hs and hs.composite_score
                  else None)

        # Only include equipment with at least some real data
        if availability is None and oee is None and mtbf is None and health is None:
            continue

        if health is None and availability is not None:
            health = round(
                (availability or 0) * 0.3 + (oee or 0) * 0.3
                + min((mtbf or 0) / 20, 100) * 0.4, 1)

        results.append({
            "equipment_tag": node.node_id,
            "equipment_name": node.name,
            "health_score": health,
            "availability": round(availability, 1) if availability is not None else None,
            "oee": round(oee, 1) if oee is not None else None,
            "mtbf": round(mtbf, 1) if mtbf is not None else None,
            "mttr": round(mttr, 1) if mttr is not None else None,
            "trend": trend or "STABLE",
        })
    return {"count": len(results), "assets": sorted(results, key=lambda x: x["health_score"] or 0)}


@router.get("/page-data/{plant_id}")
def get_analytics_page_data(
    plant_id: str,
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """All-in-one endpoint for Analytics page: KPIs, charts, reliability table."""
    from api.database.models import (
        HierarchyNodeModel, FMECAWorksheetModel, WorkPackageModel,
        WorkRequestModel, KPIMetricsModel, HealthScoreModel,
    )

    # ── Equipment metrics from real DB data ──
    nodes = db.query(HierarchyNodeModel).filter(
        HierarchyNodeModel.node_type == "EQUIPMENT",
        HierarchyNodeModel.plant_id == plant_id,
    ).all()

    sd = datetime.fromisoformat(start_date) if start_date else None
    ed = datetime.fromisoformat(end_date) if end_date else None

    equipment_kpis = []
    total_mtbf = total_mttr = total_avail = total_oee = 0.0
    counted = 0
    for node in nodes:
        meta = node.metadata_json or {}
        km_q = db.query(KPIMetricsModel).filter(KPIMetricsModel.equipment_id == node.node_id)
        if sd:
            km_q = km_q.filter(KPIMetricsModel.calculated_at >= sd)
        if ed:
            km_q = km_q.filter(KPIMetricsModel.calculated_at <= ed)
        km = km_q.order_by(KPIMetricsModel.calculated_at.desc()).first()
        hs = db.query(HealthScoreModel).filter(
            HealthScoreModel.node_id == node.node_id
        ).order_by(HealthScoreModel.calculated_at.desc()).first()

        avail = (km.availability_pct if km and km.availability_pct is not None
                 else meta.get("availability"))
        oee = (km.oee_pct if km and km.oee_pct is not None
               else meta.get("oee"))
        mtbf = (km.mtbf_days if km and km.mtbf_days is not None
                else meta.get("mtbf"))
        mttr = (km.mttr_hours if km and km.mttr_hours is not None
                else meta.get("mttr"))
        trend = (hs.trend if hs and hs.trend else meta.get("trend", "STABLE"))

        if avail is None and oee is None and mtbf is None:
            continue

        counted += 1
        total_avail += avail or 0; total_oee += oee or 0
        total_mtbf += mtbf or 0; total_mttr += mttr or 0
        equipment_kpis.append({
            "equipment_tag": node.node_id, "equipment_name": node.name,
            "mtbf": round(mtbf, 1) if mtbf is not None else None,
            "mttr": round(mttr, 1) if mttr is not None else None,
            "availability": round(avail, 1) if avail is not None else None,
            "oee": round(oee, 1) if oee is not None else None,
            "trend": trend,
        })

    n_eq = max(counted, 1)
    avg_mtbf = round(total_mtbf / n_eq, 1)
    avg_mttr = round(total_mttr / n_eq, 1)
    avg_avail = round(total_avail / n_eq, 1)
    avg_oee = round(total_oee / n_eq, 1)

    # ── Failure modes pareto (from FMECA rows) ──
    node_ids = [n.node_id for n in nodes]
    worksheets = db.query(FMECAWorksheetModel).filter(
        FMECAWorksheetModel.equipment_id.in_(node_ids)
    ).all() if node_ids else []
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
        WorkPackageModel.node_id.in_(node_ids)
    ).all() if node_ids else []
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

    # ── KPI history (from real KPI records, grouped by month) ──
    kpi_hist_q = db.query(KPIMetricsModel).filter(
        KPIMetricsModel.plant_id == plant_id,
        KPIMetricsModel.equipment_id.is_(None),
    )
    if sd:
        kpi_hist_q = kpi_hist_q.filter(KPIMetricsModel.period_end >= sd)
    if ed:
        kpi_hist_q = kpi_hist_q.filter(KPIMetricsModel.period_end <= ed)
    kpi_records = kpi_hist_q.order_by(KPIMetricsModel.period_end.desc()).limit(6).all()
    kpi_history = []
    if kpi_records:
        for rec in reversed(kpi_records):
            kpi_history.append({
                "month": rec.period_end.strftime("%b") if rec.period_end else "—",
                "schedule_adherence": round(rec.schedule_compliance_pct or 0, 1),
                "oee_avg": round(rec.oee_pct or 0, 1),
                "planning_time_avg": round(rec.backlog_hours or 0, 0),
            })

    # ── Cost by area (from work packages grouped by parent hierarchy node) ──
    LABOR_RATE = 250  # MAD per hour
    MATERIAL_FACTOR = 0.6  # material cost ≈ 60% of labor
    area_costs: dict[str, dict] = {}
    for wp in wps:
        # Determine area: use parent node or equipment tag prefix
        parent = db.query(HierarchyNodeModel).filter(
            HierarchyNodeModel.node_id == wp.node_id
        ).first()
        area_name = "General"
        if parent:
            # Try to get the parent (system/area) name
            parent_node = db.query(HierarchyNodeModel).filter(
                HierarchyNodeModel.node_id == parent.parent_node_id
            ).first() if parent.parent_node_id else None
            area_name = (parent_node.name if parent_node else parent.name) or "General"

        hours = 0.0
        ls = wp.labour_summary
        if isinstance(ls, dict):
            hours = sum(v for v in ls.values() if isinstance(v, (int, float)))
        elif isinstance(ls, (int, float)):
            hours = float(ls)
        if hours <= 0:
            hours = float(wp.estimated_hours or 4)

        if area_name not in area_costs:
            area_costs[area_name] = {"labor": 0.0, "material": 0.0}
        area_costs[area_name]["labor"] += hours * LABOR_RATE
        area_costs[area_name]["material"] += hours * LABOR_RATE * MATERIAL_FACTOR

    cost_by_area = [
        {"area": area[:20], "labor": round(v["labor"]), "material": round(v["material"])}
        for area, v in sorted(area_costs.items(), key=lambda x: x[1]["labor"], reverse=True)
    ]

    return {
        "kpis": {
            "mtbf": f"{avg_mtbf}h" if counted else "—",
            "mttr": f"{avg_mttr}h" if counted else "—",
            "availability": f"{avg_avail}%" if counted else "—",
            "oee": f"{avg_oee}%" if counted else "—",
        },
        "kpi_history": kpi_history,
        "failure_modes_pareto": failure_modes_pareto,
        "work_orders_by_type": wo_by_type,
        "cost_by_area": cost_by_area,
        "reliability_kpis": equipment_kpis,
    }


@router.post("/recalculate")
def recalculate_kpis(plant_id: str = "OCP-JFC1", days: int = 30,
                     user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Fuerza recalculo de KPIs desde historial real de OTs (admin/planner)."""
    from api.services.analytics_service import recalculate_kpis_from_history
    return recalculate_kpis_from_history(db, plant_id, days)
