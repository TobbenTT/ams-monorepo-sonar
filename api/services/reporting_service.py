"""Reporting service — reports, DE KPIs, notifications, import/export, cross-module analytics."""

from datetime import datetime

from sqlalchemy.orm import Session

from api.database.models import ReportModel, NotificationModel
from api.services.audit_service import log_action
from tools.engines.reporting_engine import ReportingEngine
from tools.engines.de_kpi_engine import DEKPIEngine
from tools.engines.notification_engine import NotificationEngine
from tools.engines.data_import_engine import DataImportEngine
from tools.engines.data_export_engine import DataExportEngine
from tools.engines.cross_module_engine import CrossModuleEngine
from tools.models.schemas import DEKPIInput, ImportSource, ExportFormat


# ── Reports ─────────────────────────────────────────────────────────

def generate_weekly_report(db: Session, plant_id: str, week: int, year: int, data: dict) -> dict:
    result = ReportingEngine.generate_weekly_report(
        plant_id, week, year,
        work_orders_completed=data.get("work_orders_completed"),
        work_orders_open=data.get("work_orders_open"),
        safety_incidents=data.get("safety_incidents", 0),
        schedule_compliance_pct=data.get("schedule_compliance_pct"),
        backlog_hours=data.get("backlog_hours", 0.0),
        key_events=data.get("key_events"),
    )
    report_dict = result.model_dump(mode="json")
    obj = ReportModel(
        report_id=result.metadata.report_id,
        report_type="WEEKLY_MAINTENANCE",
        plant_id=plant_id,
        period_start=result.metadata.period_start,
        period_end=result.metadata.period_end,
        content=report_dict,
    )
    db.add(obj)
    log_action(db, "report", obj.report_id, "GENERATE_WEEKLY")
    db.commit()
    return report_dict


def generate_monthly_report(db: Session, plant_id: str, month: int, year: int, data: dict) -> dict:
    result = ReportingEngine.generate_monthly_kpi_report(
        plant_id, month, year,
        planning_kpis=data.get("planning_kpis"),
        de_kpis=data.get("de_kpis"),
        reliability_kpis=data.get("reliability_kpis"),
        health_summary=data.get("health_summary"),
        previous_month_kpis=data.get("previous_month_kpis"),
    )
    report_dict = result.model_dump(mode="json")
    obj = ReportModel(
        report_id=result.metadata.report_id,
        report_type="MONTHLY_KPI",
        plant_id=plant_id,
        period_start=result.metadata.period_start,
        period_end=result.metadata.period_end,
        content=report_dict,
    )
    db.add(obj)
    log_action(db, "report", obj.report_id, "GENERATE_MONTHLY")
    db.commit()
    return report_dict


def generate_quarterly_report(db: Session, plant_id: str, quarter: int, year: int, data: dict) -> dict:
    result = ReportingEngine.generate_quarterly_review(
        plant_id, quarter, year,
        monthly_reports=data.get("monthly_reports"),
        management_review=data.get("management_review"),
        rbi_summary=data.get("rbi_summary"),
        bad_actors=data.get("bad_actors"),
        capas_summary=data.get("capas_summary"),
    )
    report_dict = result.model_dump(mode="json")
    obj = ReportModel(
        report_id=result.metadata.report_id,
        report_type="QUARTERLY_REVIEW",
        plant_id=plant_id,
        period_start=result.metadata.period_start,
        period_end=result.metadata.period_end,
        content=report_dict,
    )
    db.add(obj)
    log_action(db, "report", obj.report_id, "GENERATE_QUARTERLY")
    db.commit()
    return report_dict


def list_reports(db: Session, plant_id: str | None = None, report_type: str | None = None) -> list[dict]:
    q = db.query(ReportModel)
    if plant_id:
        q = q.filter_by(plant_id=plant_id)
    if report_type:
        q = q.filter_by(report_type=report_type)
    return [
        {
            "report_id": r.report_id, "report_type": r.report_type,
            "plant_id": r.plant_id,
            "period_start": r.period_start.isoformat() if r.period_start else None,
            "period_end": r.period_end.isoformat() if r.period_end else None,
            "generated_at": r.generated_at.isoformat() if r.generated_at else None,
        }
        for r in q.order_by(ReportModel.generated_at.desc()).all()
    ]


def get_report(db: Session, report_id: str) -> dict | None:
    obj = db.query(ReportModel).filter_by(report_id=report_id).first()
    if not obj:
        return None
    return obj.content or {}


# ── DE KPIs ─────────────────────────────────────────────────────────

def calculate_de_kpis(db: Session, data: dict) -> dict:
    inp = DEKPIInput(**data)
    result = DEKPIEngine.calculate(inp)
    return result.model_dump(mode="json")


def assess_de_program_health(db: Session, data: dict) -> dict:
    inp = DEKPIInput(**data)
    de_kpis = DEKPIEngine.calculate(inp)
    health = DEKPIEngine.assess_program_health(inp.plant_id, de_kpis)
    return health.model_dump(mode="json")


# ── Notifications ───────────────────────────────────────────────────

def generate_notifications(db: Session, plant_id: str, data: dict) -> dict:
    result = NotificationEngine.generate_all_notifications(
        plant_id,
        rbi_assessments=data.get("rbi_assessments"),
        planning_kpis=data.get("planning_kpis"),
        de_kpis=data.get("de_kpis"),
        reliability_kpis=data.get("reliability_kpis"),
        health_scores=data.get("health_scores"),
        backlog_items=data.get("backlog_items"),
        capas=data.get("capas"),
        mocs=data.get("mocs"),
    )
    for alert in result.notifications:
        obj = NotificationModel(
            notification_id=alert.notification_id,
            notification_type=alert.notification_type.value,
            level=alert.level.value,
            plant_id=alert.plant_id or plant_id,
            equipment_id=alert.equipment_id,
            title=alert.title,
            message=alert.message,
        )
        db.add(obj)
    if result.notifications:
        db.commit()
    return result.model_dump(mode="json")


def list_notifications(
    db: Session, plant_id: str | None = None,
    level: str | None = None, acknowledged: bool | None = None,
) -> list[dict]:
    q = db.query(NotificationModel)
    if plant_id:
        q = q.filter_by(plant_id=plant_id)
    if level:
        q = q.filter_by(level=level)
    if acknowledged is not None:
        q = q.filter_by(acknowledged=acknowledged)
    return [
        {
            "notification_id": n.notification_id, "notification_type": n.notification_type,
            "level": n.level, "title": n.title, "message": n.message,
            "equipment_id": n.equipment_id, "plant_id": n.plant_id,
            "acknowledged": n.acknowledged,
            "created_at": n.created_at.isoformat() if n.created_at else None,
        }
        for n in q.order_by(NotificationModel.created_at.desc()).all()
    ]


def acknowledge_notification(db: Session, notification_id: str) -> dict | None:
    obj = db.query(NotificationModel).filter_by(notification_id=notification_id).first()
    if not obj:
        return None
    obj.acknowledged = True
    obj.acknowledged_at = datetime.now()
    db.commit()
    return {"notification_id": notification_id, "acknowledged": True}


# ── Import ──────────────────────────────────────────────────────────

def validate_import(db: Session, source: str, rows: list[dict]) -> dict:
    src = ImportSource(source)
    if src == ImportSource.EQUIPMENT_HIERARCHY:
        result = DataImportEngine.validate_hierarchy_data(rows)
    elif src == ImportSource.FAILURE_HISTORY:
        result = DataImportEngine.validate_failure_history(rows)
    else:
        result = DataImportEngine.validate_maintenance_plan(rows)
    return result.model_dump(mode="json")


# ── Export ──────────────────────────────────────────────────────────

def export_data(db: Session, export_type: str, data: dict) -> dict:
    if export_type == "equipment":
        result = DataExportEngine.prepare_equipment_export(
            data.get("hierarchy_data", []),
            include_criticality=data.get("include_criticality", True),
            include_health=data.get("include_health", True),
        )
    elif export_type == "kpis":
        result = DataExportEngine.prepare_kpi_export(
            planning_kpis=data.get("planning_kpis"),
            de_kpis=data.get("de_kpis"),
            reliability_kpis=data.get("reliability_kpis"),
        )
    elif export_type == "schedule":
        result = DataExportEngine.prepare_schedule_export(
            data.get("program", {}),
            gantt_rows=data.get("gantt_rows"),
        )
    else:
        result = DataExportEngine.prepare_report_export(
            data.get("report", {}),
            format=ExportFormat(data.get("format", "EXCEL")),
        )
    return result.model_dump(mode="json")


# ── Cross-Module ────────────────────────────────────────────────────

def run_cross_module_analysis(db: Session, plant_id: str, data: dict) -> dict:
    correlations = []

    if data.get("equipment_criticality") and data.get("failure_records"):
        correlations.append(CrossModuleEngine.correlate_criticality_failures(
            data["equipment_criticality"], data["failure_records"],
        ))
    if data.get("cost_records") and data.get("reliability_kpis"):
        correlations.append(CrossModuleEngine.correlate_cost_reliability(
            data["cost_records"], data["reliability_kpis"],
        ))
    if data.get("health_scores") and data.get("backlog_items"):
        correlations.append(CrossModuleEngine.correlate_health_backlog(
            data["health_scores"], data["backlog_items"],
        ))

    overlap = None
    if any(data.get(k) for k in ["jackknife_result", "pareto_result", "rbi_result"]):
        overlap = CrossModuleEngine.find_bad_actor_overlap(
            jackknife_result=data.get("jackknife_result"),
            pareto_result=data.get("pareto_result"),
            rbi_result=data.get("rbi_result"),
        )

    summary = CrossModuleEngine.generate_cross_module_summary(plant_id, correlations, overlap)
    return summary.model_dump(mode="json")
