"""Dashboard router — executive dashboard data aggregation."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.services import reporting_service
from api.database.models import (
    KPIMetricsModel, BacklogItemModel, WorkRequestModel,
    HierarchyNodeModel, WeeklyProgramModel,
)

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


def _compute_kpis(db: Session, plant_id: str) -> dict:
    """Compute KPI values from available DB data."""
    kpi = db.query(KPIMetricsModel).filter(
        KPIMetricsModel.plant_id == plant_id
    ).order_by(KPIMetricsModel.calculated_at.desc()).first()

    if kpi:
        return {
            "schedule_adherence": f"{kpi.schedule_compliance_pct:.0f}%" if kpi.schedule_compliance_pct is not None else "—",
            "oee": f"{kpi.oee_pct:.0f}%" if kpi.oee_pct is not None else "—",
            "equipment_health": f"{kpi.availability_pct:.0f}%" if kpi.availability_pct is not None else "—",
            "mtbf": f"{kpi.mtbf_days:.1f}d" if kpi.mtbf_days is not None else "—",
            "mttr": f"{kpi.mttr_hours:.1f}h" if kpi.mttr_hours is not None else "—",
            "backlog_age": f"{kpi.backlog_hours:.0f}h" if kpi.backlog_hours else "—",
            "iso_compliance": f"{kpi.pm_compliance_pct:.0f}%" if kpi.pm_compliance_pct is not None else "—",
        }
    return {}


def _compute_completions(db: Session, plant_id: str) -> dict:
    """Compute module completion percentages from actual data."""
    from api.database.models import FunctionModel, CriticalityAssessmentModel
    try:
        nodes = db.query(HierarchyNodeModel).count()
        crits = db.query(CriticalityAssessmentModel).count()
        funcs = db.query(FunctionModel).count()
        wrs = db.query(WorkRequestModel).count()
        programs = db.query(WeeklyProgramModel).count()

        strategy = min(95, (crits * 5) + (funcs * 3)) if (crits > 0 or funcs > 0) else 0
        planning = min(95, (programs * 10)) if programs > 0 else 0
        field = min(95, (wrs * 2)) if wrs > 0 else 0
        analytics = min(95, (crits * 5)) if crits > 0 else 0
    except Exception:
        strategy, planning, field, analytics = 0, 0, 0, 0

    return {
        "strategy_completion": strategy,
        "planning_completion": planning,
        "field_completion": field,
        "analytics_completion": analytics,
    }


@router.get("/executive/{plant_id}")
def get_executive_dashboard(plant_id: str, db: Session = Depends(get_db)):
    """Get consolidated executive dashboard data for a plant."""
    reports = reporting_service.list_reports(db, plant_id)
    notifications = reporting_service.list_notifications(db, plant_id)
    critical_alerts = [n for n in notifications if n.get("level") == "CRITICAL"]
    kpis = _compute_kpis(db, plant_id)
    completions = _compute_completions(db, plant_id)
    return {
        "plant_id": plant_id,
        "total_reports": len(reports),
        "recent_reports": reports[:5],
        "total_notifications": len(notifications),
        "critical_alerts": len(critical_alerts),
        "recent_notifications": notifications[:10],
        **kpis,
        **completions,
    }


@router.get("/kpi-summary/{plant_id}")
def get_kpi_summary(plant_id: str, db: Session = Depends(get_db)):
    """Get KPI summary with traffic lights for a plant."""
    reports = reporting_service.list_reports(db, plant_id, "MONTHLY_KPI")
    kpis = _compute_kpis(db, plant_id)
    if reports:
        latest = reporting_service.get_report(db, reports[0]["report_id"])
        return {"plant_id": plant_id, "has_data": True, "report": latest, **kpis}
    return {"plant_id": plant_id, "has_data": False, "report": None, **kpis}


@router.get("/alerts/{plant_id}")
def get_dashboard_alerts(plant_id: str, db: Session = Depends(get_db)):
    """Get active (unacknowledged) alerts for dashboard display."""
    notifications = reporting_service.list_notifications(db, plant_id, acknowledged=False)
    return {
        "plant_id": plant_id,
        "total_active": len(notifications),
        "alerts": notifications,
    }
