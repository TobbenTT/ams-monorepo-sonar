"""SF-746 + SF-747 — Plan 12 Semanas / Budget Anual.

Vista trimestral de largo plazo para el **planificador** (no programador).
Combina:
- Mes 1 (current): detalle día×día con OTs programadas + disponibilidad real
- Meses 2-3: valor mensual proyectado del Budget Anual (cargado en sept del
  año anterior). Permite anclar planning de producción.

Entregable mensual del planner (día 15-18 de cada mes):
exportar plan + carta gantt + disponibilidad para los meses por venir.
"""
from __future__ import annotations

from datetime import date, datetime, timedelta
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import func

from api.database.connection import get_db
from api.database.models import (
    MonthlyBudgetModel,
    ManagedWorkOrderModel,
    HierarchyNodeModel,
)
from api.dependencies.auth import get_current_user, require_role


router = APIRouter(prefix="/planning", tags=["plan-12-weeks"])


# ── Budget Anual CRUD (SF-747) ───────────────────────────────────────

class BudgetEntry(BaseModel):
    plant_id: str
    year: int = Field(ge=2020, le=2050)
    month: int = Field(ge=1, le=12)
    equipment_id: str | None = None
    equipment_tag: str | None = None
    target_availability_pct: float = Field(ge=0, le=100)
    planned_downtime_h: float = Field(ge=0)
    notes: str | None = None


@router.get("/budget")
def list_budget(
    plant_id: str,
    year: int | None = None,
    db: Session = Depends(get_db),
):
    """SF-747 — Listar budget anual. Si no se pasa year → año actual."""
    if year is None:
        year = datetime.now().year
    q = db.query(MonthlyBudgetModel).filter(
        MonthlyBudgetModel.plant_id == plant_id,
        MonthlyBudgetModel.year == year,
    )
    rows = q.order_by(MonthlyBudgetModel.month, MonthlyBudgetModel.equipment_tag).all()
    return {
        "plant_id": plant_id,
        "year": year,
        "entries": [
            {
                "budget_id": r.budget_id,
                "month": r.month,
                "equipment_id": r.equipment_id,
                "equipment_tag": r.equipment_tag,
                "target_availability_pct": r.target_availability_pct,
                "planned_downtime_h": r.planned_downtime_h,
                "notes": r.notes,
            }
            for r in rows
        ],
    }


@router.post("/budget", status_code=201)
def create_or_update_budget(
    data: BudgetEntry,
    user=Depends(require_role("admin", "manager", "planner")),
    db: Session = Depends(get_db),
):
    """Crear o upsert de un budget entry (plant + year + month + equipment)."""
    q = db.query(MonthlyBudgetModel).filter(
        MonthlyBudgetModel.plant_id == data.plant_id,
        MonthlyBudgetModel.year == data.year,
        MonthlyBudgetModel.month == data.month,
        MonthlyBudgetModel.equipment_tag == data.equipment_tag,
    )
    existing = q.first()
    if existing:
        existing.target_availability_pct = data.target_availability_pct
        existing.planned_downtime_h = data.planned_downtime_h
        existing.notes = data.notes
        existing.updated_by = getattr(user, "user_id", "")
        db.commit()
        return {"budget_id": existing.budget_id, "action": "updated"}
    b = MonthlyBudgetModel(
        plant_id=data.plant_id,
        year=data.year,
        month=data.month,
        equipment_id=data.equipment_id,
        equipment_tag=data.equipment_tag,
        target_availability_pct=data.target_availability_pct,
        planned_downtime_h=data.planned_downtime_h,
        notes=data.notes,
        updated_by=getattr(user, "user_id", ""),
    )
    db.add(b)
    db.commit()
    db.refresh(b)
    return {"budget_id": b.budget_id, "action": "created"}


# ── Plan 12 Semanas (SF-746) ─────────────────────────────────────────

@router.get("/12-weeks")
def plan_12_weeks(
    plant_id: str,
    start_date: str | None = None,
    db: Session = Depends(get_db),
):
    """SF-746 — Plan trimestral del planificador.

    Devuelve:
    - `weeks[]` — 12 semanas con WxxYY label + start_date + end_date
    - `equipment[]` — por equipo: disponibilidad semanal (12 valores)
      * Si la semana está dentro del mes corriente → calculado de OTs reales
      * Si está en meses futuros → valor del budget mensual
    - `summary` — promedio planta + comparación vs target
    """
    if start_date:
        start = date.fromisoformat(start_date)
    else:
        # Default: lunes de la semana corriente
        today = date.today()
        start = today - timedelta(days=today.weekday())

    # 12 semanas
    weeks = []
    for i in range(12):
        ws = start + timedelta(days=i * 7)
        we = ws + timedelta(days=6)
        # ISO week
        iso = ws.isocalendar()
        weeks.append({
            "index": i,
            "label": f"W{iso.week:02d}/{iso.year % 100:02d}",
            "start_date": ws.isoformat(),
            "end_date": we.isoformat(),
            "month": ws.month,
            "year": ws.year,
            "is_current_month": (ws.month == date.today().month and ws.year == date.today().year),
        })

    # Equipos de la planta (limitar a 50 más críticos para no saturar UI)
    equipment_nodes = (
        db.query(HierarchyNodeModel)
        .filter(
            HierarchyNodeModel.plant_id == plant_id,
            HierarchyNodeModel.node_type == "EQUIPMENT",
            HierarchyNodeModel.status == "ACTIVE",
        )
        .order_by(HierarchyNodeModel.criticality.asc())  # AA, A, B, C
        .limit(50)
        .all()
    )

    # WOs programadas que afectan el horizonte
    horizon_end = start + timedelta(days=12 * 7)
    wos = (
        db.query(ManagedWorkOrderModel)
        .filter(
            ManagedWorkOrderModel.plant_id == plant_id,
            ManagedWorkOrderModel.planned_start >= datetime.combine(start, datetime.min.time()),
            ManagedWorkOrderModel.planned_start < datetime.combine(horizon_end, datetime.min.time()),
            ManagedWorkOrderModel.status.in_(["PROGRAMADO", "EN_EJECUCION", "PLANIFICADO", "EN_PROGRAMACION"]),
        )
        .all()
    )

    # Index downtime por tag/semana
    downtime_by_eq_week = {}  # (tag, week_idx) → hours
    for wo in wos:
        if not wo.planned_start or not wo.equipment_tag:
            continue
        wo_date = wo.planned_start.date() if hasattr(wo.planned_start, "date") else wo.planned_start
        week_idx = (wo_date - start).days // 7
        if 0 <= week_idx < 12:
            key = (wo.equipment_tag, week_idx)
            downtime_by_eq_week[key] = downtime_by_eq_week.get(key, 0) + (wo.estimated_hours or 0)

    # Budget anual del año en curso
    current_year = start.year
    budget_rows = (
        db.query(MonthlyBudgetModel)
        .filter(MonthlyBudgetModel.plant_id == plant_id, MonthlyBudgetModel.year == current_year)
        .all()
    )
    budget_by_eq_month = {}
    for b in budget_rows:
        key = (b.equipment_tag or "*", b.month)
        budget_by_eq_month[key] = b.target_availability_pct

    HOURS_PER_WEEK = 24 * 7  # 168

    equipment_results = []
    for node in equipment_nodes:
        weekly_avail = []
        for w in weeks:
            if w["is_current_month"]:
                # Mes corriente: calcular de OTs reales
                downtime = downtime_by_eq_week.get((node.tag, w["index"]), 0)
                avail = max(0, min(100, 100 * (1 - downtime / HOURS_PER_WEEK)))
                source = "real"
            else:
                # Meses futuros: usar budget si existe, sino baseline 95%
                budget_val = budget_by_eq_month.get((node.tag, w["month"]))
                if budget_val is None:
                    budget_val = budget_by_eq_month.get(("*", w["month"]), 95.0)
                avail = budget_val
                source = "budget"
            weekly_avail.append({
                "week": w["label"],
                "availability_pct": round(avail, 1),
                "source": source,
            })

        equipment_results.append({
            "tag": node.tag,
            "name": node.name,
            "criticality": node.criticality,
            "weekly": weekly_avail,
            "avg_pct": round(sum(x["availability_pct"] for x in weekly_avail) / 12, 1),
        })

    # Resumen planta
    summary_pcts = [eq["avg_pct"] for eq in equipment_results]
    summary = {
        "plant_avg_pct": round(sum(summary_pcts) / len(summary_pcts), 1) if summary_pcts else 0,
        "equipment_count": len(equipment_results),
        "weeks_in_current_month": sum(1 for w in weeks if w["is_current_month"]),
        "weeks_from_budget": sum(1 for w in weeks if not w["is_current_month"]),
    }

    return {
        "plant_id": plant_id,
        "start_date": start.isoformat(),
        "weeks": weeks,
        "equipment": equipment_results,
        "summary": summary,
    }
