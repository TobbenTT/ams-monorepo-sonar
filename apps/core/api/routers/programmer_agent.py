"""Programmer Agent endpoints — Jorge bullets r49 #8 + #11."""
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from api.dependencies.auth import get_current_user
from api.database.connection import get_db
from api.services import programmer_agent_service as svc

router = APIRouter(prefix="/programmer-agent", tags=["programmer-agent"])


def _parse_week_start(s: str | None) -> datetime:
    if not s:
        # default: monday of current week
        now = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        return now - timedelta(days=now.weekday())
    return datetime.fromisoformat(s)


@router.get("/equipment-availability")
def equipment_availability(
    plant_id: str = Query("OCP-JFC1"),
    week_start: str | None = Query(None, description="ISO date; defaults monday this week"),
    days: int = Query(7, ge=1, le=14),
    _user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Bullet #8 — Disponibilidad ofrecida por equipo, turno/día/semana."""
    return svc.compute_equipment_availability(db, plant_id, _parse_week_start(week_start), days)


@router.get("/weekly-report")
def weekly_report(
    plant_id: str = Query("OCP-JFC1"),
    week_start: str | None = Query(None),
    history_weeks: int = Query(3, ge=0, le=12),
    forecast_weeks: int = Query(4, ge=0, le=12),
    _user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Bullet #11 — Reporte semanal con críticas + costos + 3w hist + 4w forecast."""
    return svc.weekly_program_report(
        db, plant_id, _parse_week_start(week_start), history_weeks, forecast_weeks
    )
