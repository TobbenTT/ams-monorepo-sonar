"""Dashboard router — executive dashboard data aggregation."""

import logging
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

from api.database.connection import get_db
from api.dependencies.auth import get_current_user
from api.services import reporting_service
from api.database.models import (
    KPIMetricsModel, BacklogItemModel, WorkRequestModel,
    HierarchyNodeModel, WeeklyProgramModel,
    ManagedWorkOrderModel, WorkforceModel, WorkAssignmentModel,
)

router = APIRouter(prefix="/dashboard", tags=["dashboard"], dependencies=[Depends(get_current_user)])


def _compute_kpis(db: Session, plant_id: str, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> dict:
    """Compute KPI values from available DB data, optionally filtered by date range."""
    q = db.query(KPIMetricsModel).filter(KPIMetricsModel.plant_id == plant_id)
    if start_date:
        q = q.filter(KPIMetricsModel.calculated_at >= start_date)
    if end_date:
        q = q.filter(KPIMetricsModel.calculated_at <= end_date)
    kpi = q.order_by(KPIMetricsModel.calculated_at.desc()).first()

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
    return {
        "schedule_adherence": "—",
        "oee": "—",
        "equipment_health": "—",
        "mtbf": "—",
        "mttr": "—",
        "backlog_age": "—",
        "iso_compliance": "—",
    }


def _compute_completions(db: Session, plant_id: str) -> dict:
    """Compute module completion percentages from actual data."""
    from api.database.models import FunctionModel, CriticalityAssessmentModel
    try:
        nodes = db.query(HierarchyNodeModel).count()
        crits = db.query(CriticalityAssessmentModel).count()
        funcs = db.query(FunctionModel).count()
        wrs = db.query(WorkRequestModel).count()
        programs = db.query(WeeklyProgramModel).count()

        strategy = min(100, (crits * 5) + (funcs * 3)) if (crits > 0 or funcs > 0) else 0
        planning = min(100, (programs * 10)) if programs > 0 else 0
        field = min(100, (wrs * 2)) if wrs > 0 else 0
        analytics = min(100, (crits * 5)) if crits > 0 else 0
    except Exception as e:
        logger.warning("Error computing module completions for %s: %s", plant_id, e)
        strategy, planning, field, analytics = 0, 0, 0, 0

    return {
        "strategy_completion": strategy,
        "planning_completion": planning,
        "field_completion": field,
        "analytics_completion": analytics,
    }


@router.get("/executive/{plant_id}")
def get_executive_dashboard(
    plant_id: str,
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Get consolidated executive dashboard data for a plant."""
    sd = datetime.fromisoformat(start_date) if start_date else None
    ed = datetime.fromisoformat(end_date) if end_date else None
    reports = reporting_service.list_reports(db, plant_id)
    notifications = reporting_service.list_notifications(db, plant_id)
    critical_alerts = [n for n in notifications if n.get("level") == "CRITICAL"]
    kpis = _compute_kpis(db, plant_id, sd, ed)
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


# ── Jorge Phase 6 — Work Management KPIs ─────────────────────────────

@router.get("/work-management-kpis/{plant_id}")
def get_work_management_kpis(
    plant_id: str,
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Compute KPIs from managed_work_orders + workforce for Phase 6."""
    now = datetime.now()
    period_start = datetime.fromisoformat(start_date) if start_date else now - timedelta(days=30)
    period_end = datetime.fromisoformat(end_date) if end_date else now

    # All MWOs for this plant
    all_wos = db.query(ManagedWorkOrderModel).filter(
        ManagedWorkOrderModel.plant_id == plant_id,
    ).all()

    # Normalize dates to naive for comparison (some records may be tz-aware)
    def to_naive(dt):
        if dt is None:
            return None
        return dt.replace(tzinfo=None) if dt.tzinfo else dt
    ps = to_naive(period_start)
    pe = to_naive(period_end)
    recent = [w for w in all_wos if w.created_at and to_naive(w.created_at) >= ps and to_naive(w.created_at) <= pe]

    total = len(recent)
    completed = [w for w in recent if w.status in ("COMPLETED", "CLOSED")]
    in_progress = [w for w in recent if w.status == "IN_PROGRESS"]
    programmed = [w for w in recent if w.work_class == "PROGRAMADO"]
    unplanned = [w for w in recent if w.work_class == "NO_PROGRAMADO"]

    # Schedule compliance: completed on time / total programmed
    on_time = sum(
        1 for w in programmed
        if w.status in ("COMPLETED", "CLOSED")
        and (not w.planned_end or not w.actual_end or w.actual_end <= w.planned_end)
    )
    schedule_compliance = round(on_time / len(programmed) * 100, 1) if programmed else 0

    # Schedule adherence: executed per program / total executed
    sched_executed = sum(1 for w in completed if w.work_class == "PROGRAMADO")
    schedule_adherence = round(sched_executed / len(completed) * 100, 1) if completed else 0

    # Backlog: pending hours
    pending = [w for w in all_wos if w.status not in ("COMPLETED", "CLOSED")]
    backlog_hours = round(sum(w.estimated_hours or 0 for w in pending), 1)
    backlog_count = len(pending)

    # Late WRs (past SLA) — WR has no plant_id column, query all open WRs
    late_wrs = db.query(WorkRequestModel).filter(
        WorkRequestModel.status.notin_(["CLOSED", "COMPLETED", "REJECTED"]),
    ).all()
    sla_overdue = sum(
        1 for wr in late_wrs
        if getattr(wr, "sla_deadline", None) and wr.sla_deadline < now
    )

    # Cost by type (from budget_amount where available)
    cost_correctivo = sum(w.budget_amount or 0 for w in recent if w.wo_type == "CORRECTIVO")
    cost_preventivo = sum(w.budget_amount or 0 for w in recent if w.wo_type == "PREVENTIVO")
    cost_predictivo = sum(w.budget_amount or 0 for w in recent if w.wo_type == "PREDICTIVO")
    cost_mejora = sum(w.budget_amount or 0 for w in recent if w.wo_type == "MEJORA")
    cost_incidente = sum(w.budget_amount or 0 for w in recent if w.wo_type == "INCIDENTE_OPERACIONAL")
    cost_monitoreo = sum(w.budget_amount or 0 for w in recent if w.wo_type == "MONITOREO_CONDICION")

    # Hours by type
    hours_correctivo = round(sum((w.actual_hours or 0) for w in recent if w.wo_type == "CORRECTIVO"), 1)
    hours_preventivo = round(sum((w.actual_hours or 0) for w in recent if w.wo_type == "PREVENTIVO"), 1)
    hours_predictivo = round(sum((w.actual_hours or 0) for w in recent if w.wo_type == "PREDICTIVO"), 1)
    hours_incidente = round(sum((w.actual_hours or 0) for w in recent if w.wo_type == "INCIDENTE_OPERACIONAL"), 1)
    hours_monitoreo = round(sum((w.actual_hours or 0) for w in recent if w.wo_type == "MONITOREO_CONDICION"), 1)

    # MTBM — Mean Time Between Maintenance (days)
    # All completed WOs ordered by actual_end
    completed_with_dates = sorted(
        [w for w in all_wos if w.status in ("COMPLETED", "CLOSED") and w.actual_end],
        key=lambda w: w.actual_end,
    )
    if len(completed_with_dates) >= 2:
        first = completed_with_dates[0].actual_end
        last = completed_with_dates[-1].actual_end
        span_days = (last - first).total_seconds() / 86400
        mtbm_days = round(span_days / (len(completed_with_dates) - 1), 1)
    else:
        mtbm_days = 0

    # Gasto (budget) vs Costo (actual) comparison
    gasto_total = round(sum(w.budget_amount or 0 for w in recent), 2)
    costo_labor = round(sum(w.labor_cost or 0 for w in recent), 2)
    costo_material = round(sum(w.material_cost or 0 for w in recent), 2)
    costo_external = round(sum(w.external_cost or 0 for w in recent), 2)
    costo_total = round(sum(w.actual_total_cost or 0 for w in recent), 2)
    # If no actual costs tracked yet, estimate from hours × rate
    if costo_total == 0 and gasto_total > 0:
        costo_total = round(sum((w.actual_hours or 0) * 50 for w in recent), 2)  # $50/h estimate

    # Workforce
    workers = db.query(WorkforceModel).filter(
        WorkforceModel.plant_id == plant_id,
    ).all()
    total_workers = len(workers)
    available_workers = sum(1 for w in workers if w.available)

    # Tasks summary
    tasks = db.query(WorkAssignmentModel).filter(
        WorkAssignmentModel.plant_id == plant_id,
    ).all()
    tasks_completed = sum(1 for t in tasks if t.status == "COMPLETED")
    tasks_in_progress = sum(1 for t in tasks if t.status in ("ASSIGNED", "IN_PROGRESS"))

    return {
        "plant_id": plant_id,
        "period": f"{period_start.strftime('%Y-%m-%d')}_{period_end.strftime('%Y-%m-%d')}",
        # Core KPIs
        "schedule_compliance": schedule_compliance,
        "schedule_adherence": schedule_adherence,
        "backlog_hours": backlog_hours,
        "backlog_count": backlog_count,
        "sla_overdue_count": sla_overdue,
        # WO counts
        "total_wos": total,
        "completed_wos": len(completed),
        "in_progress_wos": len(in_progress),
        "programmed_wos": len(programmed),
        "unplanned_wos": len(unplanned),
        "unplanned_pct": round(len(unplanned) / total * 100, 1) if total else 0,
        # Hours by type
        "hours_correctivo": hours_correctivo,
        "hours_preventivo": hours_preventivo,
        "hours_predictivo": hours_predictivo,
        "hours_incidente": hours_incidente,
        "hours_monitoreo": hours_monitoreo,
        # Cost by type
        "cost_correctivo": round(cost_correctivo, 2),
        "cost_preventivo": round(cost_preventivo, 2),
        "cost_predictivo": round(cost_predictivo, 2),
        "cost_mejora": round(cost_mejora, 2),
        "cost_incidente": round(cost_incidente, 2),
        "cost_monitoreo": round(cost_monitoreo, 2),
        "total_cost": round(cost_correctivo + cost_preventivo + cost_predictivo + cost_mejora + cost_incidente + cost_monitoreo, 2),
        # MTBM
        "mtbm_days": mtbm_days,
        # Gasto vs Costo
        "gasto_total": gasto_total,
        "costo_total": costo_total,
        "costo_labor": costo_labor,
        "costo_material": costo_material,
        "costo_external": costo_external,
        "costo_variance": round(gasto_total - costo_total, 2) if gasto_total else 0,
        "costo_variance_pct": round((gasto_total - costo_total) / gasto_total * 100, 1) if gasto_total else 0,
        # Workforce
        "total_workers": total_workers,
        "available_workers": available_workers,
        "workforce_utilization": round(available_workers / total_workers * 100, 1) if total_workers else 0,
        # Tasks
        "tasks_completed": tasks_completed,
        "tasks_in_progress": tasks_in_progress,
    }
