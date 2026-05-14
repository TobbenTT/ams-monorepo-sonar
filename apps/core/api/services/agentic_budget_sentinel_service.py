"""Agentic Budget Sentinel service — monitors maintenance spending vs budget.

Tracks actual costs against a configurable monthly budget, projects month-end
spend based on run-rate, and generates alerts / recommendations when spending
deviates from acceptable thresholds.

Pipeline:
  1. Query WOs for the target month
  2. Aggregate costs by category, area, and WO type
  3. Compute historical average from prior 3 months
  4. Calculate daily run-rate and month-end projection
  5. Generate deterministic alerts and recommendations
"""

import calendar
import logging
import os
from collections import defaultdict
from datetime import date, datetime

from sqlalchemy import extract, func
from sqlalchemy.orm import Session

from api.database.models import ManagedWorkOrderModel

log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configurable monthly budget
# ---------------------------------------------------------------------------

MONTHLY_BUDGET_USD: float = float(
    os.environ.get("MAINTENANCE_MONTHLY_BUDGET", 500_000.0)
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _safe(value: float | None) -> float:
    """Return 0.0 when *value* is None."""
    return value if value is not None else 0.0


def _area_from_tag(equipment_tag: str) -> str:
    """Extract area code from the first segment of an equipment tag.

    E.g. ``"BPU-001-PMP-01"`` → ``"BPU"``.
    """
    if not equipment_tag:
        return "UNKNOWN"
    parts = equipment_tag.split("-")
    return parts[0] if parts else "UNKNOWN"


# ---------------------------------------------------------------------------
# Main service function
# ---------------------------------------------------------------------------

def monitor_budget(
    db: Session,
    plant_id: str,
    year: int | None = None,
    month: int | None = None,
) -> dict:
    """Analyse maintenance spending for *plant_id* in the given month/year.

    Parameters
    ----------
    db : Session
        Active SQLAlchemy session.
    plant_id : str
        Plant identifier (e.g. ``"OCP-JFC1"``).
    year, month : int, optional
        Target period.  Defaults to the current calendar month.

    Returns
    -------
    dict
        Spending summary with projections, alerts, and recommendations.
    """
    today = date.today()
    year = year or today.year
    month = month or today.month

    days_in_month = calendar.monthrange(year, month)[1]

    # Determine how many days have elapsed for projection purposes.
    if year == today.year and month == today.month:
        days_elapsed = today.day
    else:
        # Past (or future) month — treat as fully elapsed.
        days_elapsed = days_in_month

    # ------------------------------------------------------------------
    # 1. Query WOs for the target month
    # ------------------------------------------------------------------
    wos = (
        db.query(ManagedWorkOrderModel)
        .filter(
            ManagedWorkOrderModel.plant_id == plant_id,
            extract("year", ManagedWorkOrderModel.created_at) == year,
            extract("month", ManagedWorkOrderModel.created_at) == month,
        )
        .all()
    )

    wo_count = len(wos)

    # ------------------------------------------------------------------
    # 2. Aggregate costs by category
    # ------------------------------------------------------------------
    total_labor_cost = sum(_safe(wo.labor_cost) for wo in wos)
    total_material_cost = sum(_safe(wo.material_cost) for wo in wos)
    total_external_cost = sum(_safe(wo.external_cost) for wo in wos)
    total_actual_cost = sum(_safe(wo.actual_total_cost) for wo in wos)

    # ------------------------------------------------------------------
    # 3. Spending by area
    # ------------------------------------------------------------------
    by_area: dict[str, dict] = defaultdict(lambda: {"actual": 0.0, "wo_count": 0})
    for wo in wos:
        area = _area_from_tag(wo.equipment_tag)
        by_area[area]["actual"] += _safe(wo.actual_total_cost)
        by_area[area]["wo_count"] += 1
    by_area = dict(by_area)

    # ------------------------------------------------------------------
    # 4. Spending by WO type
    # ------------------------------------------------------------------
    by_wo_type: dict[str, dict] = defaultdict(lambda: {"actual": 0.0, "wo_count": 0})
    for wo in wos:
        wtype = wo.wo_type or "UNKNOWN"
        by_wo_type[wtype]["actual"] += _safe(wo.actual_total_cost)
        by_wo_type[wtype]["wo_count"] += 1
    by_wo_type = dict(by_wo_type)

    # ------------------------------------------------------------------
    # 5. Historical average (previous 3 months)
    # ------------------------------------------------------------------
    historical_avg_monthly = _compute_historical_avg(db, plant_id, year, month)

    # ------------------------------------------------------------------
    # 6. Projections
    # ------------------------------------------------------------------
    if days_elapsed > 0:
        run_rate_daily = total_actual_cost / days_elapsed
    else:
        run_rate_daily = 0.0

    projected_month_end = run_rate_daily * days_in_month

    budget_utilization_pct = (
        (total_actual_cost / MONTHLY_BUDGET_USD) * 100 if MONTHLY_BUDGET_USD else 0.0
    )
    projected_utilization_pct = (
        (projected_month_end / MONTHLY_BUDGET_USD) * 100 if MONTHLY_BUDGET_USD else 0.0
    )

    # ------------------------------------------------------------------
    # 7. Alerts
    # ------------------------------------------------------------------
    alerts = _generate_alerts(
        budget_utilization_pct,
        projected_utilization_pct,
        days_elapsed,
        by_area,
        historical_avg_monthly,
        plant_id,
        db,
        year,
        month,
    )

    # ------------------------------------------------------------------
    # 8. Recommendations
    # ------------------------------------------------------------------
    recommendations = _generate_recommendations(
        projected_utilization_pct,
        total_material_cost,
        total_actual_cost,
        by_wo_type,
        wo_count,
    )

    # ------------------------------------------------------------------
    # 9. Return payload
    # ------------------------------------------------------------------
    return {
        "plant_id": plant_id,
        "year": year,
        "month": month,
        "budget_monthly_usd": MONTHLY_BUDGET_USD,
        "actual_cost_usd": total_actual_cost,
        "projected_month_end_usd": round(projected_month_end, 2),
        "budget_utilization_pct": round(budget_utilization_pct, 1),
        "projected_utilization_pct": round(projected_utilization_pct, 1),
        "by_category": {
            "labor": total_labor_cost,
            "material": total_material_cost,
            "external": total_external_cost,
        },
        "by_area": by_area,
        "by_wo_type": by_wo_type,
        "historical_avg_monthly": round(historical_avg_monthly, 2),
        "days_elapsed": days_elapsed,
        "days_in_month": days_in_month,
        "wo_count": wo_count,
        "alerts": alerts,
        "recommendations": recommendations,
    }


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _compute_historical_avg(
    db: Session, plant_id: str, year: int, month: int
) -> float:
    """Return average monthly actual cost for the 3 months preceding *year/month*."""
    monthly_totals: list[float] = []
    for offset in range(1, 4):
        # Walk backwards month by month.
        m = month - offset
        y = year
        while m <= 0:
            m += 12
            y -= 1
        total = (
            db.query(func.coalesce(func.sum(ManagedWorkOrderModel.actual_total_cost), 0.0))
            .filter(
                ManagedWorkOrderModel.plant_id == plant_id,
                extract("year", ManagedWorkOrderModel.created_at) == y,
                extract("month", ManagedWorkOrderModel.created_at) == m,
            )
            .scalar()
        )
        monthly_totals.append(float(total))

    return sum(monthly_totals) / len(monthly_totals) if monthly_totals else 0.0


def _compute_area_historical_avg(
    db: Session, plant_id: str, year: int, month: int
) -> dict[str, float]:
    """Return average monthly cost per area for the preceding 3 months."""
    area_totals: dict[str, list[float]] = defaultdict(list)

    for offset in range(1, 4):
        m = month - offset
        y = year
        while m <= 0:
            m += 12
            y -= 1

        rows = (
            db.query(ManagedWorkOrderModel)
            .filter(
                ManagedWorkOrderModel.plant_id == plant_id,
                extract("year", ManagedWorkOrderModel.created_at) == y,
                extract("month", ManagedWorkOrderModel.created_at) == m,
            )
            .all()
        )

        month_area: dict[str, float] = defaultdict(float)
        for wo in rows:
            area = _area_from_tag(wo.equipment_tag)
            month_area[area] += _safe(wo.actual_total_cost)

        for area, total in month_area.items():
            area_totals[area].append(total)

    return {
        area: sum(vals) / len(vals) for area, vals in area_totals.items() if vals
    }


def _generate_alerts(
    budget_utilization_pct: float,
    projected_utilization_pct: float,
    days_elapsed: int,
    by_area: dict,
    historical_avg_monthly: float,
    plant_id: str,
    db: Session,
    year: int,
    month: int,
) -> list[dict]:
    """Generate deterministic budget alerts."""
    alerts: list[dict] = []

    # RED — projected overshoot
    if projected_utilization_pct > 110:
        alerts.append({
            "severity": "RED",
            "message": (
                f"Proyecci\u00f3n de cierre: {round(projected_utilization_pct, 1)}%"
                " \u2014 se requiere acci\u00f3n correctiva"
            ),
        })

    # ORANGE — approaching budget limit
    if budget_utilization_pct > 90:
        alerts.append({
            "severity": "ORANGE",
            "message": (
                f"Gasto al {round(budget_utilization_pct, 1)}% del presupuesto"
                " \u2014 riesgo de sobreejecutar"
            ),
        })

    # YELLOW — past day 20 and over 75 %
    if budget_utilization_pct > 75 and days_elapsed >= 20:
        alerts.append({
            "severity": "YELLOW",
            "message": (
                f"Gasto al {round(budget_utilization_pct, 1)}% del presupuesto"
                f" al d\u00eda {days_elapsed}"
            ),
        })

    # Per-area alerts (150 % of historical average)
    area_hist = _compute_area_historical_avg(db, plant_id, year, month)
    for area, data in by_area.items():
        hist = area_hist.get(area, 0.0)
        if hist > 0 and data["actual"] > hist * 1.5:
            pct = round((data["actual"] / hist) * 100, 1)
            alerts.append({
                "severity": "ORANGE",
                "message": (
                    f"\u00c1rea {area}: gasto al {pct}% del promedio hist\u00f3rico"
                    f" ({round(hist, 0)} USD/mes)"
                ),
            })

    return alerts


def _generate_recommendations(
    projected_utilization_pct: float,
    total_material_cost: float,
    total_actual_cost: float,
    by_wo_type: dict,
    wo_count: int,
) -> list[str]:
    """Generate deterministic spending recommendations."""
    recommendations: list[str] = []

    # Projected overshoot → defer low-priority WOs
    if projected_utilization_pct > 110:
        recommendations.append(
            "Diferir OTs de prioridad P3/P4 no cr\u00edticas hasta el pr\u00f3ximo mes"
        )

    # Material cost dominance
    if total_actual_cost > 0:
        mat_pct = round((total_material_cost / total_actual_cost) * 100, 1)
        if mat_pct > 60:
            recommendations.append(
                f"Costo de materiales elevado ({mat_pct}%)"
                " \u2014 revisar consumo de repuestos"
            )

    # Corrective ratio
    corrective_count = by_wo_type.get("CORRECTIVO", {}).get("wo_count", 0)
    if wo_count > 0:
        corr_pct = round((corrective_count / wo_count) * 100, 1)
        if corr_pct > 50:
            recommendations.append(
                f"Ratio correctivo elevado ({corr_pct}%)"
                " \u2014 revisar cumplimiento del plan preventivo"
            )

    return recommendations
