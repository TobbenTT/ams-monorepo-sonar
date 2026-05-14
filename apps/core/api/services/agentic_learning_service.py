"""Agentic Learning service — post-maintenance analysis and continuous improvement.

Analyzes recently closed work orders to extract learning insights:
duration estimation accuracy, cost accuracy, per-equipment and per-type
patterns, and AI priority classification accuracy.  All analysis is
deterministic (no LLM calls).

Pipeline:
  1. Query closed WOs within the lookback window
  2. Duration accuracy analysis (actual vs estimated hours)
  3. Cost accuracy analysis (actual vs budgeted cost)
  4. Per-equipment aggregation and recalibration flags
  5. Per-WO-type aggregation
  6. Priority accuracy vs AI classification in linked WRs
  7. Generate deterministic insight strings
"""

import logging
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from api.database.models import ManagedWorkOrderModel, WorkRequestModel

log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Thresholds
# ---------------------------------------------------------------------------

UNDER_ESTIMATED_THRESHOLD = 1.3   # ratio > 1.3 → took longer than estimated
OVER_ESTIMATED_THRESHOLD = 0.7    # ratio < 0.7 → finished much faster
RECALIBRATION_THRESHOLD = 1.5     # avg ratio for flagging equipment
PRIORITY_MISMATCH_ALERT_PCT = 30  # alert when mismatch exceeds this %


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _categorize(ratio: float) -> str:
    """Categorize an actual/estimated ratio."""
    if ratio > UNDER_ESTIMATED_THRESHOLD:
        return "UNDER_ESTIMATED"
    if ratio < OVER_ESTIMATED_THRESHOLD:
        return "OVER_ESTIMATED"
    return "ACCURATE"


# ---------------------------------------------------------------------------
# Main analysis function
# ---------------------------------------------------------------------------

def analyze_post_maintenance(
    db: Session,
    plant_id: str,
    lookback_days: int = 90,
) -> dict:
    """Analyze closed WOs for learning insights.

    Parameters
    ----------
    db : Session
        SQLAlchemy database session.
    plant_id : str
        Plant identifier to filter work orders.
    lookback_days : int
        Number of days to look back from today (default 90).

    Returns
    -------
    dict
        Comprehensive analysis results with insights.
    """
    cutoff = datetime.now() - timedelta(days=lookback_days)

    # ------------------------------------------------------------------
    # 1. Query closed WOs
    # ------------------------------------------------------------------
    closed_wos = (
        db.query(ManagedWorkOrderModel)
        .filter(
            ManagedWorkOrderModel.status == "CERRADO",
            ManagedWorkOrderModel.plant_id == plant_id,
            ManagedWorkOrderModel.closed_at >= cutoff,
        )
        .all()
    )

    total_closed = len(closed_wos)

    # Edge case: nothing to analyze
    if total_closed == 0:
        return _empty_result(plant_id, lookback_days)

    # ------------------------------------------------------------------
    # 2. Duration accuracy analysis
    # ------------------------------------------------------------------
    duration_records: list[dict] = []
    for wo in closed_wos:
        if wo.estimated_hours and wo.estimated_hours > 0 and wo.actual_hours and wo.actual_hours > 0:
            ratio = wo.actual_hours / wo.estimated_hours
            duration_records.append({
                "wo_number": wo.wo_number,
                "equipment_tag": wo.equipment_tag,
                "estimated_hours": wo.estimated_hours,
                "actual_hours": wo.actual_hours,
                "ratio": round(ratio, 2),
                "category": _categorize(ratio),
            })

    duration_analysis = _build_duration_analysis(duration_records)

    # ------------------------------------------------------------------
    # 3. Cost accuracy analysis
    # ------------------------------------------------------------------
    cost_records: list[dict] = []
    for wo in closed_wos:
        budget = wo.budget_amount
        actual = wo.actual_total_cost
        if budget and budget > 0 and actual and actual > 0:
            ratio = actual / budget
            cost_records.append({
                "wo_number": wo.wo_number,
                "ratio": round(ratio, 2),
                "category": _categorize(ratio),
            })

    cost_analysis = _build_cost_analysis(cost_records)

    # ------------------------------------------------------------------
    # 4. By-equipment analysis
    # ------------------------------------------------------------------
    by_equipment = _build_by_equipment(duration_records)

    # ------------------------------------------------------------------
    # 5. By wo_type analysis
    # ------------------------------------------------------------------
    by_wo_type = _build_by_wo_type(closed_wos, duration_records)

    # ------------------------------------------------------------------
    # 6. Priority accuracy (WR-linked WOs)
    # ------------------------------------------------------------------
    priority_accuracy = _build_priority_accuracy(db, closed_wos)

    # ------------------------------------------------------------------
    # 7. Generate insights
    # ------------------------------------------------------------------
    insights = _generate_insights(
        duration_analysis, by_equipment, by_wo_type, priority_accuracy,
    )

    return {
        "plant_id": plant_id,
        "lookback_days": lookback_days,
        "total_closed_wos": total_closed,
        "duration_analysis": duration_analysis,
        "cost_analysis": cost_analysis,
        "by_equipment": by_equipment,
        "by_wo_type": by_wo_type,
        "priority_accuracy": priority_accuracy,
        "insights": insights,
        "analysis_date": datetime.now().isoformat(),
    }


# ---------------------------------------------------------------------------
# Internal builders
# ---------------------------------------------------------------------------

def _empty_result(plant_id: str, lookback_days: int) -> dict:
    """Return a valid but empty analysis result."""
    return {
        "plant_id": plant_id,
        "lookback_days": lookback_days,
        "total_closed_wos": 0,
        "duration_analysis": {
            "total_analyzed": 0,
            "avg_accuracy_ratio": 0.0,
            "categories": {"UNDER_ESTIMATED": 0, "OVER_ESTIMATED": 0, "ACCURATE": 0},
            "worst_offenders": [],
        },
        "cost_analysis": {
            "total_analyzed": 0,
            "avg_cost_ratio": 0.0,
            "categories": {"UNDER_ESTIMATED": 0, "OVER_ESTIMATED": 0, "ACCURATE": 0},
        },
        "by_equipment": [],
        "by_wo_type": [],
        "priority_accuracy": {"total_checked": 0, "matches": 0, "accuracy_pct": 0.0},
        "insights": [],
        "analysis_date": datetime.now().isoformat(),
    }


def _build_duration_analysis(records: list[dict]) -> dict:
    """Build the duration accuracy section from individual WO records."""
    if not records:
        return {
            "total_analyzed": 0,
            "avg_accuracy_ratio": 0.0,
            "categories": {"UNDER_ESTIMATED": 0, "OVER_ESTIMATED": 0, "ACCURATE": 0},
            "worst_offenders": [],
        }

    categories = {"UNDER_ESTIMATED": 0, "OVER_ESTIMATED": 0, "ACCURATE": 0}
    for r in records:
        categories[r["category"]] += 1

    avg_ratio = round(sum(r["ratio"] for r in records) / len(records), 2)

    # Worst offenders: top 5 by absolute deviation from 1.0
    sorted_by_dev = sorted(records, key=lambda r: abs(r["ratio"] - 1.0), reverse=True)
    worst = [
        {
            "wo_number": r["wo_number"],
            "equipment_tag": r["equipment_tag"],
            "estimated_hours": r["estimated_hours"],
            "actual_hours": r["actual_hours"],
            "ratio": r["ratio"],
        }
        for r in sorted_by_dev[:5]
    ]

    return {
        "total_analyzed": len(records),
        "avg_accuracy_ratio": avg_ratio,
        "categories": categories,
        "worst_offenders": worst,
    }


def _build_cost_analysis(records: list[dict]) -> dict:
    """Build the cost accuracy section."""
    if not records:
        return {
            "total_analyzed": 0,
            "avg_cost_ratio": 0.0,
            "categories": {"UNDER_ESTIMATED": 0, "OVER_ESTIMATED": 0, "ACCURATE": 0},
        }

    categories = {"UNDER_ESTIMATED": 0, "OVER_ESTIMATED": 0, "ACCURATE": 0}
    for r in records:
        categories[r["category"]] += 1

    avg_ratio = round(sum(r["ratio"] for r in records) / len(records), 2)

    return {
        "total_analyzed": len(records),
        "avg_cost_ratio": avg_ratio,
        "categories": categories,
    }


def _build_by_equipment(duration_records: list[dict]) -> list[dict]:
    """Group duration accuracy by equipment_tag."""
    if not duration_records:
        return []

    from collections import defaultdict
    groups: dict[str, list[float]] = defaultdict(list)
    for r in duration_records:
        groups[r["equipment_tag"]].append(r["ratio"])

    result = []
    for tag, ratios in sorted(groups.items()):
        avg = round(sum(ratios) / len(ratios), 2)
        result.append({
            "equipment_tag": tag,
            "wo_count": len(ratios),
            "avg_duration_ratio": avg,
            "needs_recalibration": avg > RECALIBRATION_THRESHOLD,
        })

    return result


def _build_by_wo_type(
    closed_wos: list,
    duration_records: list[dict],
) -> list[dict]:
    """Group duration accuracy by wo_type."""
    if not duration_records:
        return []

    from collections import defaultdict

    # Build a lookup: wo_number -> wo_type
    wo_type_map: dict[str, str] = {wo.wo_number: wo.wo_type for wo in closed_wos}

    groups: dict[str, list[dict]] = defaultdict(list)
    for r in duration_records:
        wt = wo_type_map.get(r["wo_number"], "DESCONOCIDO")
        groups[wt].append(r)

    result = []
    for wt, records in sorted(groups.items()):
        ratios = [r["ratio"] for r in records]
        avg = round(sum(ratios) / len(ratios), 2)
        under_count = sum(1 for r in records if r["category"] == "UNDER_ESTIMATED")
        pct_under = round(under_count / len(records) * 100, 1)
        result.append({
            "wo_type": wt,
            "wo_count": len(records),
            "avg_duration_ratio": avg,
            "pct_under_estimated": pct_under,
        })

    return result


def _build_priority_accuracy(db: Session, closed_wos: list) -> dict:
    """Compare WO priority_code against WR ai_classification.priority_suggested."""
    wos_with_wr = [wo for wo in closed_wos if wo.work_request_id]
    if not wos_with_wr:
        return {"total_checked": 0, "matches": 0, "accuracy_pct": 0.0}

    wr_ids = [wo.work_request_id for wo in wos_with_wr]
    wrs = (
        db.query(WorkRequestModel)
        .filter(WorkRequestModel.request_id.in_(wr_ids))
        .all()
    )
    wr_map: dict[str, WorkRequestModel] = {wr.request_id: wr for wr in wrs}

    total_checked = 0
    matches = 0
    for wo in wos_with_wr:
        wr = wr_map.get(wo.work_request_id)
        if not wr or not wr.ai_classification:
            continue
        suggested = wr.ai_classification.get("priority_suggested")
        if suggested is None:
            continue
        total_checked += 1
        if str(suggested) == str(wo.priority_code):
            matches += 1

    accuracy_pct = round(matches / total_checked * 100, 1) if total_checked > 0 else 0.0

    return {
        "total_checked": total_checked,
        "matches": matches,
        "accuracy_pct": accuracy_pct,
    }


def _generate_insights(
    duration_analysis: dict,
    by_equipment: list[dict],
    by_wo_type: list[dict],
    priority_accuracy: dict,
) -> list[str]:
    """Generate deterministic insight strings from analysis data."""
    insights: list[str] = []

    # Overall duration bias
    avg_ratio = duration_analysis.get("avg_accuracy_ratio", 0.0)
    if avg_ratio > UNDER_ESTIMATED_THRESHOLD:
        insights.append(
            f"Estimaciones de duracion sistematicamente bajas "
            f"-- aumentar factor de estimacion en {avg_ratio:.1f}x"
        )
    elif avg_ratio < OVER_ESTIMATED_THRESHOLD and duration_analysis["total_analyzed"] > 0:
        insights.append(
            f"Estimaciones de duracion sistematicamente altas "
            f"-- reducir factor de estimacion (ratio actual {avg_ratio:.1f}x)"
        )

    # Equipment needing recalibration
    for eq in by_equipment:
        if eq["needs_recalibration"]:
            insights.append(
                f"Equipo {eq['equipment_tag']}: promedio {eq['avg_duration_ratio']:.1f}x "
                f"vs estimado -- recalibrar estandares de tiempo"
            )

    # WO types systematically under-estimated
    for wt in by_wo_type:
        if wt["pct_under_estimated"] > 50.0:
            insights.append(
                f"OTs tipo {wt['wo_type']}: {wt['pct_under_estimated']:.0f}% "
                f"subestimadas -- revisar tiempos estandar"
            )

    # Priority accuracy
    if priority_accuracy["total_checked"] > 0:
        match_pct = priority_accuracy["accuracy_pct"]
        mismatch_pct = 100.0 - match_pct
        if mismatch_pct > PRIORITY_MISMATCH_ALERT_PCT:
            insights.append(
                f"Precision de prioridad IA: {match_pct:.0f}% "
                f"-- revisar criterios de clasificacion"
            )

    return insights
