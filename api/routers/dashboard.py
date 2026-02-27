"""Dashboard router — executive dashboard data aggregation."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.services import reporting_service

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/executive/{plant_id}")
def get_executive_dashboard(plant_id: str, db: Session = Depends(get_db)):
    """Get consolidated executive dashboard data for a plant."""
    reports = reporting_service.list_reports(db, plant_id)
    notifications = reporting_service.list_notifications(db, plant_id)
    critical_alerts = [n for n in notifications if n.get("level") == "CRITICAL"]
    return {
        "plant_id": plant_id,
        "total_reports": len(reports),
        "recent_reports": reports[:5],
        "total_notifications": len(notifications),
        "critical_alerts": len(critical_alerts),
        "recent_notifications": notifications[:10],
    }


@router.get("/kpi-summary/{plant_id}")
def get_kpi_summary(plant_id: str, db: Session = Depends(get_db)):
    """Get KPI summary with traffic lights for a plant."""
    reports = reporting_service.list_reports(db, plant_id, "MONTHLY_KPI")
    if reports:
        latest = reporting_service.get_report(db, reports[0]["report_id"])
        return {"plant_id": plant_id, "has_data": True, "report": latest}
    return {"plant_id": plant_id, "has_data": False, "report": None}


@router.get("/alerts/{plant_id}")
def get_dashboard_alerts(plant_id: str, db: Session = Depends(get_db)):
    """Get active (unacknowledged) alerts for dashboard display."""
    notifications = reporting_service.list_notifications(db, plant_id, acknowledged=False)
    return {
        "plant_id": plant_id,
        "total_active": len(notifications),
        "alerts": notifications,
    }
