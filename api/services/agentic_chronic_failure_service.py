"""Chronic Failure Detector service — identifies recurring failure patterns.

Scans closed corrective work orders over a configurable lookback window,
groups them by equipment tag, and flags assets with >= 3 recurrences.
For each chronic item the service fits a Weibull model to inter-failure
intervals and produces a deterministic maintenance recommendation.

Pipeline:
  1. Query closed corrective WOs in the lookback window
  2. Group by equipment_tag, filter >= 3 occurrences
  3. Compute cost, hours, Weibull fit, trend
  4. Generate deterministic recommendations
  5. Return ranked chronic-failure summary
"""

import logging
from datetime import datetime, timedelta
from collections import defaultdict
from statistics import mean

from sqlalchemy.orm import Session
from sqlalchemy import func

from api.database.models import (
    ManagedWorkOrderModel,
    HierarchyNodeModel,
    CriticalityAssessmentModel,
    HealthScoreModel,
)
from tools.engines.weibull_engine import WeibullEngine

log = logging.getLogger(__name__)

# Minimum corrective WO count to qualify as chronic
_CHRONIC_THRESHOLD = 3

# Maximum chronic items to analyse in detail
_MAX_CHRONIC_ITEMS = 20

# Corrective WO type codes
_CORRECTIVE_TYPES = ("CORRECTIVO", "PM03")


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def detect_chronic_failures(
    db: Session,
    plant_id: str | None = None,
    lookback_months: int = 12,
) -> dict:
    """Detect equipment with chronic (recurring) corrective failures.

    Args:
        db: Active SQLAlchemy session.
        plant_id: Optional plant filter.  ``None`` analyses all plants.
        lookback_months: Rolling window in months (default 12).

    Returns:
        Summary dict with ``chronic_items`` list and aggregate stats.
    """
    lookback_days = lookback_months * 30
    cutoff = datetime.now() - timedelta(days=lookback_days)

    # ------------------------------------------------------------------
    # 1. Query closed corrective WOs
    # ------------------------------------------------------------------
    query = db.query(ManagedWorkOrderModel).filter(
        ManagedWorkOrderModel.status == "CERRADO",
        ManagedWorkOrderModel.wo_type.in_(_CORRECTIVE_TYPES),
        ManagedWorkOrderModel.created_at >= cutoff,
    )
    if plant_id:
        query = query.filter(ManagedWorkOrderModel.plant_id == plant_id)

    wos = query.all()

    if not wos:
        log.info("No closed corrective WOs found for the lookback window.")
        return _empty_summary(plant_id, lookback_months)

    # ------------------------------------------------------------------
    # 2. Group by equipment_tag
    # ------------------------------------------------------------------
    grouped: dict[str, list[dict]] = defaultdict(list)
    for wo in wos:
        grouped[wo.equipment_tag].append({
            "wo_id": wo.wo_id,
            "created_at": wo.created_at,
            "closed_at": wo.closed_at,
            "actual_total_cost": wo.actual_total_cost,
            "actual_hours": wo.actual_hours,
            "description": wo.description,
            "priority_code": wo.priority_code,
        })

    # ------------------------------------------------------------------
    # 3. Identify chronic equipment (>= threshold)
    # ------------------------------------------------------------------
    chronic_tags = {
        tag: wo_list
        for tag, wo_list in grouped.items()
        if len(wo_list) >= _CHRONIC_THRESHOLD
    }

    if not chronic_tags:
        log.info("No chronic equipment detected (threshold=%d).", _CHRONIC_THRESHOLD)
        return _empty_summary(plant_id, lookback_months)

    # Sort by failure count descending, take top N
    sorted_tags = sorted(chronic_tags.items(), key=lambda x: len(x[1]), reverse=True)
    top_tags = sorted_tags[:_MAX_CHRONIC_ITEMS]

    # ------------------------------------------------------------------
    # 4. Analyse each chronic equipment
    # ------------------------------------------------------------------
    chronic_items: list[dict] = []

    for tag, wo_list in top_tags:
        item = _analyse_equipment(db, tag, wo_list, lookback_days, lookback_months)
        chronic_items.append(item)

    # ------------------------------------------------------------------
    # 7. Sort: failure_count desc, then annual_cost_usd desc
    # ------------------------------------------------------------------
    chronic_items.sort(
        key=lambda x: (x["failure_count"], x["annual_cost_usd"]),
        reverse=True,
    )

    # ------------------------------------------------------------------
    # 8. Build summary
    # ------------------------------------------------------------------
    total_chronic_cost = sum(c["annual_cost_usd"] for c in chronic_items)
    top_5 = chronic_items[:5]
    top_5_tags = ", ".join(c["equipment_tag"] for c in top_5)
    top_5_cost = sum(c["annual_cost_usd"] for c in top_5)

    return {
        "chronic_items": chronic_items,
        "total_chronic_equipment": len(chronic_items),
        "total_chronic_cost_usd": round(total_chronic_cost, 2),
        "top_5_summary": (
            f"Los 5 equipos más críticos: {top_5_tags} "
            f"representan USD {top_5_cost:,.0f} anuales en fallas recurrentes"
        ),
        "plant_id": plant_id,
        "lookback_months": lookback_months,
        "analysis_date": datetime.now().isoformat(),
    }


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _analyse_equipment(
    db: Session,
    tag: str,
    wo_list: list[dict],
    lookback_days: int,
    lookback_months: int,
) -> dict:
    """Build the chronic-failure record for a single equipment tag."""

    failure_count = len(wo_list)

    # ---- costs & hours ----
    total_cost = sum((w["actual_total_cost"] or 0) for w in wo_list)
    total_hours = sum((w["actual_hours"] or 0) for w in wo_list)
    annual_cost = total_cost * (365 / lookback_days) if lookback_days else 0

    # ---- failure intervals ----
    sorted_wos = sorted(wo_list, key=lambda w: w["created_at"])
    intervals: list[float] = []
    for i in range(1, len(sorted_wos)):
        delta = (sorted_wos[i]["created_at"] - sorted_wos[i - 1]["created_at"]).days
        if delta > 0:
            intervals.append(float(delta))

    avg_interval = mean(intervals) if intervals else 0.0

    # ---- Weibull fit ----
    weibull_beta: float | None = None
    weibull_eta: float | None = None
    weibull_r2: float | None = None
    failure_pattern: str | None = None

    if len(intervals) >= 2:
        try:
            params = WeibullEngine.fit_parameters(intervals)
            weibull_beta = params.beta
            weibull_eta = params.eta
            weibull_r2 = params.r_squared
            pattern = WeibullEngine.classify_failure_pattern(params.beta)
            failure_pattern = pattern.value if hasattr(pattern, "value") else str(pattern)
        except Exception:
            log.warning("Weibull fit failed for %s — skipping.", tag, exc_info=True)

    # ---- trend ----
    trend = "STABLE"
    if len(intervals) >= 3:
        last_three = intervals[-3:]
        if last_three[0] > last_three[1] > last_three[2]:
            trend = "WORSENING"

    # ---- criticality lookup ----
    criticality_class: str | None = None
    try:
        node = db.query(HierarchyNodeModel).filter(
            HierarchyNodeModel.tag == tag,
        ).first()
        if node:
            crit = db.query(CriticalityAssessmentModel).filter(
                CriticalityAssessmentModel.node_id == node.node_id,
            ).first()
            if crit:
                criticality_class = crit.risk_class
    except Exception:
        log.debug("Criticality lookup failed for %s.", tag, exc_info=True)

    # ---- health score lookup ----
    health_score: float | None = None
    try:
        hs = (
            db.query(HealthScoreModel)
            .filter(HealthScoreModel.equipment_tag == tag)
            .order_by(HealthScoreModel.composite_score.desc())
            .first()
        )
        if hs:
            health_score = hs.composite_score
    except Exception:
        log.debug("Health-score lookup failed for %s.", tag, exc_info=True)

    # ---- last 3 descriptions (truncated) ----
    recent_descs = [
        (w["description"] or "")[:100]
        for w in sorted_wos[-3:]
    ]

    last_failure_date = sorted_wos[-1]["created_at"]

    # ---- recommendation ----
    recommendation = _generate_recommendation(
        failure_pattern=failure_pattern,
        avg_interval=avg_interval,
        trend=trend,
        failure_count=failure_count,
        lookback_months=lookback_months,
    )

    return {
        "equipment_tag": tag,
        "failure_count": failure_count,
        "avg_interval_days": round(avg_interval, 1),
        "total_cost_usd": round(total_cost, 2),
        "annual_cost_usd": round(annual_cost, 2),
        "total_hours": round(total_hours, 2),
        "weibull_beta": weibull_beta,
        "weibull_eta": weibull_eta,
        "weibull_r_squared": weibull_r2,
        "failure_pattern": failure_pattern,
        "criticality_class": criticality_class,
        "health_score": health_score,
        "trend": trend,
        "last_failure_date": (
            last_failure_date.isoformat() if last_failure_date else None
        ),
        "descriptions": recent_descs,
        "recommendation": recommendation,
    }


def _generate_recommendation(
    *,
    failure_pattern: str | None,
    avg_interval: float,
    trend: str,
    failure_count: int,
    lookback_months: int,
) -> str:
    """Return a deterministic Spanish-language recommendation."""

    if trend == "WORSENING":
        return "URGENTE: Fallas acelerándose — iniciar RCA inmediatamente"

    if failure_pattern == "WEAROUT" and avg_interval < 90:
        replacement_days = avg_interval * 0.8
        return (
            f"Implementar reemplazo preventivo programado cada "
            f"{replacement_days:.0f} días"
        )

    if failure_pattern == "RANDOM":
        return (
            "Implementar monitoreo de condición (CBM) — "
            "falla aleatoria no responde a mantenimiento basado en tiempo"
        )

    if failure_pattern == "INFANT_MORTALITY":
        return (
            "Revisar procedimientos de instalación y calidad de repuestos — "
            "patrón de mortalidad infantil"
        )

    return (
        f"Iniciar análisis de causa raíz (RCA) — "
        f"{failure_count} fallas en {lookback_months} meses"
    )


def _empty_summary(plant_id: str | None, lookback_months: int) -> dict:
    """Return a well-formed but empty result dict."""
    return {
        "chronic_items": [],
        "total_chronic_equipment": 0,
        "total_chronic_cost_usd": 0.0,
        "top_5_summary": "No se detectaron equipos con fallas crónicas en el período analizado",
        "plant_id": plant_id,
        "lookback_months": lookback_months,
        "analysis_date": datetime.now().isoformat(),
    }
