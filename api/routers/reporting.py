"""Reporting router — reports, DE KPIs, notifications, import/export, cross-module analytics."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.schemas import (
    WeeklyReportRequest, MonthlyReportRequest, QuarterlyReportRequest,
    ReportingDEKPIRequest, NotificationRequest, ImportValidateRequest,
    ExportRequest, CrossModuleRequest,
)
from api.services import reporting_service

router = APIRouter(prefix="/reporting", tags=["reporting"])


# ── Reports ─────────────────────────────────────────────────────────

@router.post("/reports/weekly")
def generate_weekly_report(data: WeeklyReportRequest, db: Session = Depends(get_db)):
    plant_id = data.plant_id
    week = data.week if data.week is not None else data.week_number
    year = data.year
    return reporting_service.generate_weekly_report(db, plant_id, week, year, data.model_dump())


@router.post("/reports/monthly")
def generate_monthly_report(data: MonthlyReportRequest, db: Session = Depends(get_db)):
    return reporting_service.generate_monthly_report(db, data.plant_id, data.month, data.year, data.model_dump())


@router.post("/reports/quarterly")
def generate_quarterly_report(data: QuarterlyReportRequest, db: Session = Depends(get_db)):
    return reporting_service.generate_quarterly_report(db, data.plant_id, data.quarter, data.year, data.model_dump())


@router.get("/reports")
def list_reports(
    plant_id: str | None = None,
    report_type: str | None = None,
    db: Session = Depends(get_db),
):
    return reporting_service.list_reports(db, plant_id, report_type)


@router.get("/reports/{report_id}")
def get_report(report_id: str, db: Session = Depends(get_db)):
    result = reporting_service.get_report(db, report_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Report not found")
    return result


# ── DE KPIs ─────────────────────────────────────────────────────────

@router.post("/de-kpis/calculate")
def calculate_de_kpis(data: ReportingDEKPIRequest, db: Session = Depends(get_db)):
    return reporting_service.calculate_de_kpis(db, data.model_dump())


@router.post("/de-kpis/program-health")
def assess_de_program_health(data: ReportingDEKPIRequest, db: Session = Depends(get_db)):
    return reporting_service.assess_de_program_health(db, data.model_dump())


# ── Notifications ───────────────────────────────────────────────────

@router.post("/notifications/generate")
def generate_notifications(data: NotificationRequest, db: Session = Depends(get_db)):
    d = data.model_dump()
    plant_id = d.pop("plant_id", "BRY")
    return reporting_service.generate_notifications(db, plant_id, d)


@router.get("/notifications")
def list_notifications(
    plant_id: str | None = None,
    level: str | None = None,
    db: Session = Depends(get_db),
):
    return reporting_service.list_notifications(db, plant_id, level)


@router.put("/notifications/{notification_id}/ack")
def acknowledge_notification(notification_id: str, db: Session = Depends(get_db)):
    result = reporting_service.acknowledge_notification(db, notification_id)
    if not result:
        raise HTTPException(status_code=404, detail="Notification not found")
    return result


# ── Import ──────────────────────────────────────────────────────────

@router.post("/import/validate")
def validate_import(data: ImportValidateRequest, db: Session = Depends(get_db)):
    return reporting_service.validate_import(db, data.source, data.rows)


# ── Export ──────────────────────────────────────────────────────────

@router.post("/export")
def export_data(data: ExportRequest, db: Session = Depends(get_db)):
    d = data.model_dump()
    export_type = d.pop("export_type", "report")
    return reporting_service.export_data(db, export_type, d)


# ── Cross-Module ────────────────────────────────────────────────────

@router.post("/cross-module/analyze")
def run_cross_module_analysis(data: CrossModuleRequest, db: Session = Depends(get_db)):
    d = data.model_dump()
    plant_id = d.pop("plant_id", "BRY")
    return reporting_service.run_cross_module_analysis(db, plant_id, d)
