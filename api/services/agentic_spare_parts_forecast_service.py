"""Agentic Spare Parts Forecast service — Item 12.3.

Projects spare parts consumption at 3/6/12 month horizons using historical
consumption data from work orders and coefficient-of-variation analysis.

Pipeline:
  1. Gather material consumption history from work orders (last 12 months)
  2. Load latest spare part analysis for the plant
  3. Compute per-material forecasts with safety-factor adjustments
  4. Identify critical shortage risks (high variability + critical equipment)
  5. Build actionable recommendations in Spanish

Deterministic — no Claude calls.
"""

import logging
import statistics
from collections import defaultdict
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from api.database.models import (
    HierarchyNodeModel,
    ManagedWorkOrderModel,
    SparePartAnalysisModel,
)

log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

_DEFAULT_HORIZONS = [3, 6, 12]
_SAFETY_FACTORS = {"LOW": 1.1, "MEDIUM": 1.3, "HIGH": 1.5}
_COV_THRESHOLDS = {"LOW": 0.3, "HIGH": 0.7}  # CoV < 0.3 = LOW, > 0.7 = HIGH
_HIGH_CRITICALITY_CLASSES = {"AA", "A"}


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _classify_variability(monthly_counts: list[float]) -> str:
    """Classify consumption variability based on coefficient of variation.

    Parameters
    ----------
    monthly_counts : list[float]
        Per-month consumption quantities (12 entries, one per month).

    Returns
    -------
    str
        ``"LOW"``, ``"MEDIUM"``, or ``"HIGH"``.
    """
    non_zero = [v for v in monthly_counts if v > 0]
    if len(non_zero) < 2:
        return "HIGH"  # not enough data → conservative
    mean = statistics.mean(non_zero)
    if mean == 0:
        return "HIGH"
    stdev = statistics.stdev(non_zero)
    cov = stdev / mean
    if cov < _COV_THRESHOLDS["LOW"]:
        return "LOW"
    if cov > _COV_THRESHOLDS["HIGH"]:
        return "HIGH"
    return "MEDIUM"


def _detect_trend(monthly_counts: list[float]) -> str:
    """Detect simple linear trend: INCREASING, DECREASING, or STABLE.

    Uses the sign of the slope from a simple least-squares fit.
    """
    non_zero_indices = [(i, v) for i, v in enumerate(monthly_counts) if v > 0]
    if len(non_zero_indices) < 3:
        return "STABLE"
    n = len(non_zero_indices)
    x_vals = [i for i, _ in non_zero_indices]
    y_vals = [v for _, v in non_zero_indices]
    x_mean = sum(x_vals) / n
    y_mean = sum(y_vals) / n
    numerator = sum((x - x_mean) * (y - y_mean) for x, y in zip(x_vals, y_vals))
    denominator = sum((x - x_mean) ** 2 for x in x_vals)
    if denominator == 0:
        return "STABLE"
    slope = numerator / denominator
    # Normalize slope relative to mean consumption
    if y_mean == 0:
        return "STABLE"
    relative_slope = slope / y_mean
    if relative_slope > 0.05:
        return "INCREASING"
    if relative_slope < -0.05:
        return "DECREASING"
    return "STABLE"


def _confidence_label(months_with_consumption: int) -> str:
    """Map months-with-consumption count to confidence label."""
    if months_with_consumption >= 6:
        return "HIGH"
    if months_with_consumption >= 3:
        return "MEDIUM"
    return "LOW"


# ---------------------------------------------------------------------------
# Step 1 — Gather consumption history
# ---------------------------------------------------------------------------

def _gather_consumption_history(
    db: Session,
    plant_id: str,
) -> dict[str, dict]:
    """Query last 12 months of work orders and aggregate material consumption.

    Returns a dict keyed by material code::

        {
            "MAT-001": {
                "description": str,
                "monthly_counts": [float] * 12,   # index 0 = oldest month
                "total_consumed": float,
                "months_with_consumption": int,
                "unit_cost": float | None,
            },
            ...
        }
    """
    cutoff = datetime.now() - timedelta(days=365)
    now = datetime.now()

    work_orders = (
        db.query(ManagedWorkOrderModel)
        .filter(
            ManagedWorkOrderModel.plant_id == plant_id,
            ManagedWorkOrderModel.created_at >= cutoff,
        )
        .all()
    )

    log.info(
        "Spare parts forecast: found %d work orders in last 12 months for plant %s",
        len(work_orders),
        plant_id,
    )

    # Aggregate: material_code -> {description, monthly_counts[12], total, ...}
    materials: dict[str, dict] = {}

    for wo in work_orders:
        if not wo.materials:
            continue
        mat_list = wo.materials if isinstance(wo.materials, list) else []
        # Determine which month bucket (0 = oldest, 11 = current)
        wo_date = wo.created_at or now
        months_ago = (now.year - wo_date.year) * 12 + (now.month - wo_date.month)
        bucket = max(0, min(11, 11 - months_ago))

        for mat in mat_list:
            if not isinstance(mat, dict):
                continue
            code = mat.get("code", "").strip()
            if not code:
                continue
            qty = float(mat.get("qty_required", 0) or 0)
            if qty <= 0:
                continue

            if code not in materials:
                materials[code] = {
                    "description": mat.get("description", code),
                    "monthly_counts": [0.0] * 12,
                    "total_consumed": 0.0,
                    "months_with_consumption": 0,
                    "unit_cost": None,
                }

            materials[code]["monthly_counts"][bucket] += qty
            materials[code]["total_consumed"] += qty

    # Compute months_with_consumption
    for info in materials.values():
        info["months_with_consumption"] = sum(
            1 for v in info["monthly_counts"] if v > 0
        )

    return materials


# ---------------------------------------------------------------------------
# Step 2 — Load latest spare part analysis
# ---------------------------------------------------------------------------

def _load_spare_part_analysis(
    db: Session,
    plant_id: str,
) -> dict | None:
    """Return the latest SparePartAnalysisModel results for the plant, or None."""
    analysis = (
        db.query(SparePartAnalysisModel)
        .filter(SparePartAnalysisModel.plant_id == plant_id)
        .order_by(SparePartAnalysisModel.analyzed_at.desc())
        .first()
    )
    if not analysis:
        log.info("No spare part analysis found for plant %s", plant_id)
        return None

    log.info(
        "Loaded spare part analysis %s (%s)",
        analysis.analysis_id,
        analysis.analyzed_at.isoformat() if analysis.analyzed_at else "N/A",
    )
    return {
        "analysis_id": analysis.analysis_id,
        "analyzed_at": (
            analysis.analyzed_at.isoformat() if analysis.analyzed_at else None
        ),
        "total_parts": analysis.total_parts,
        "results": analysis.results if isinstance(analysis.results, list) else [],
        "total_inventory_value": analysis.total_inventory_value,
    }


# ---------------------------------------------------------------------------
# Step 3 — Build equipment criticality lookup
# ---------------------------------------------------------------------------

def _build_criticality_map(db: Session, plant_id: str) -> dict[str, str]:
    """Return a mapping of equipment_tag -> criticality class (e.g. 'AA', 'A').

    Only includes equipment-level nodes that have a criticality value.
    """
    nodes = (
        db.query(HierarchyNodeModel.tag, HierarchyNodeModel.criticality)
        .filter(
            HierarchyNodeModel.plant_id == plant_id,
            HierarchyNodeModel.criticality.isnot(None),
            HierarchyNodeModel.tag.isnot(None),
        )
        .all()
    )
    crit_map = {row.tag: row.criticality for row in nodes if row.tag}
    log.info("Criticality map: %d equipment tags for plant %s", len(crit_map), plant_id)
    return crit_map


# ---------------------------------------------------------------------------
# Step 4 — Build equipment-to-material mapping from WOs
# ---------------------------------------------------------------------------

def _build_material_equipment_map(
    db: Session,
    plant_id: str,
) -> dict[str, set[str]]:
    """Return a mapping of material_code -> set of equipment_tags that consumed it."""
    cutoff = datetime.now() - timedelta(days=365)
    work_orders = (
        db.query(
            ManagedWorkOrderModel.equipment_tag,
            ManagedWorkOrderModel.materials,
        )
        .filter(
            ManagedWorkOrderModel.plant_id == plant_id,
            ManagedWorkOrderModel.created_at >= cutoff,
        )
        .all()
    )

    mat_equip: dict[str, set[str]] = defaultdict(set)
    for eq_tag, mat_list in work_orders:
        if not mat_list or not isinstance(mat_list, list):
            continue
        for mat in mat_list:
            if not isinstance(mat, dict):
                continue
            code = mat.get("code", "").strip()
            if code and eq_tag:
                mat_equip[code].add(eq_tag)
    return dict(mat_equip)


# ---------------------------------------------------------------------------
# Main function
# ---------------------------------------------------------------------------

def forecast_spare_parts(
    db: Session,
    plant_id: str = "OCP-JFC1",
    horizons_months: list[int] | None = None,
) -> dict:
    """Project spare parts consumption at multiple horizons.

    Parameters
    ----------
    db : Session
        SQLAlchemy database session.
    plant_id : str
        SAP plant identifier (default ``OCP-JFC1``).
    horizons_months : list[int] | None
        Forecast horizons in months (default ``[3, 6, 12]``).

    Returns
    -------
    dict
        Forecast result with per-material projections, shortage risks,
        obsolescence candidates, cost projections, and recommendations.
    """
    horizons = horizons_months or list(_DEFAULT_HORIZONS)
    forecast_date = datetime.now().isoformat()

    # ── Step 1: Gather consumption history ────────────────────────────────
    materials = _gather_consumption_history(db, plant_id)

    if not materials:
        log.info("No material consumption data found for plant %s", plant_id)
        return {
            "plant_id": plant_id,
            "forecast_date": forecast_date,
            "horizons": horizons,
            "materials_analyzed": 0,
            "forecasts": [],
            "critical_shortage_risks": [],
            "obsolescence_candidates": [],
            "total_projected_cost": {h: 0.0 for h in horizons},
            "recommendations": [
                "Sin datos de consumo de repuestos en los ultimos 12 meses."
            ],
            "summary": (
                "No se encontraron datos de consumo de materiales para la planta "
                f"{plant_id} en los ultimos 12 meses."
            ),
        }

    # ── Step 2: Load spare part analysis ──────────────────────────────────
    spa = _load_spare_part_analysis(db, plant_id)

    # Build a lookup from analysis results (material_code -> analysis info)
    analysis_lookup: dict[str, dict] = {}
    if spa and spa["results"]:
        for entry in spa["results"]:
            if isinstance(entry, dict) and entry.get("material_code"):
                analysis_lookup[entry["material_code"]] = entry

    # ── Step 3: Build criticality + equipment maps ────────────────────────
    crit_map = _build_criticality_map(db, plant_id)
    mat_equip_map = _build_material_equipment_map(db, plant_id)

    # ── Step 4: Compute per-material forecasts ────────────────────────────
    forecasts: list[dict] = []
    critical_shortage_risks: list[dict] = []
    obsolescence_candidates: list[dict] = []
    total_projected_cost: dict[int, float] = {h: 0.0 for h in horizons}
    recommendations: list[str] = []

    for code, info in materials.items():
        monthly_counts = info["monthly_counts"]
        total_consumed = info["total_consumed"]
        months_active = info["months_with_consumption"]
        description = info["description"]

        # Average monthly consumption (over months with actual consumption)
        avg_monthly = total_consumed / 12.0  # spread over full year

        # Variability & safety factor
        variability = _classify_variability(monthly_counts)
        safety_factor = _SAFETY_FACTORS[variability]

        # Confidence
        confidence = _confidence_label(months_active)

        # Trend
        trend = _detect_trend(monthly_counts)

        # Per-horizon forecasts
        horizon_forecasts: dict[int, dict] = {}
        for h in horizons:
            projected = round(avg_monthly * h * safety_factor, 2)
            horizon_forecasts[h] = {
                "projected_qty": projected,
                "confidence": confidence,
            }
            # Accumulate cost (use unit_cost from analysis if available)
            unit_cost = 0.0
            if code in analysis_lookup:
                unit_cost = float(analysis_lookup[code].get("unit_cost", 0) or 0)
            total_projected_cost[h] += round(projected * unit_cost, 2)

        # Build recommendation per material
        recommendation = ""
        if trend == "INCREASING":
            recommendation = "Considerar aumento de stock de seguridad"
        elif trend == "DECREASING":
            recommendation = "Tendencia decreciente — monitorear antes de reducir stock"
        elif months_active <= 2 and total_consumed > 0:
            recommendation = "Consumo esporadico — evaluar stock bajo demanda"

        mat_forecast = {
            "material_code": code,
            "description": description,
            "avg_monthly_consumption": round(avg_monthly, 4),
            "total_consumed_12m": total_consumed,
            "months_with_consumption": months_active,
            "forecasts": horizon_forecasts,
            "variability": variability,
            "trend": trend,
            "recommendation": recommendation,
        }
        forecasts.append(mat_forecast)

        # ── Step 4b: Critical shortage check ──────────────────────────────
        equipment_tags = mat_equip_map.get(code, set())
        is_on_critical = any(
            crit_map.get(tag, "") in _HIGH_CRITICALITY_CLASSES
            for tag in equipment_tags
        )
        if is_on_critical and variability == "HIGH":
            critical_shortage_risks.append({
                "material_code": code,
                "description": description,
                "variability": variability,
                "equipment_tags": sorted(equipment_tags),
                "reason": (
                    "Revisar estrategia de abastecimiento — "
                    "consumo irregular en equipo critico"
                ),
            })

        # ── Step 4c: Obsolescence candidates ──────────────────────────────
        # Materials not consumed in the last 6 months (buckets 6..11 are
        # the most recent half-year)
        recent_6m = monthly_counts[6:]
        if sum(recent_6m) == 0 and total_consumed > 0:
            obsolescence_candidates.append({
                "material_code": code,
                "description": description,
                "last_consumed_months_ago": next(
                    (11 - i for i in range(11, -1, -1) if monthly_counts[i] > 0),
                    12,
                ),
                "total_consumed_12m": total_consumed,
                "recommendation": "Evaluar obsolescencia o sobre-stock",
            })

    # ── Step 5: Build global recommendations ──────────────────────────────
    if critical_shortage_risks:
        recommendations.append(
            f"{len(critical_shortage_risks)} materiales con consumo irregular "
            "en equipos criticos (AA/A) — revisar estrategia de abastecimiento."
        )
    if obsolescence_candidates:
        recommendations.append(
            f"{len(obsolescence_candidates)} materiales sin consumo en 6+ meses "
            "— evaluar obsolescencia o sobre-stock."
        )

    increasing_count = sum(1 for f in forecasts if f.get("trend") == "INCREASING")
    if increasing_count:
        recommendations.append(
            f"{increasing_count} materiales con tendencia creciente "
            "— considerar aumento de stock de seguridad."
        )

    if not recommendations:
        recommendations.append(
            "Consumo de repuestos estable — sin alertas criticas."
        )

    # Round cost totals
    total_projected_cost = {h: round(v, 2) for h, v in total_projected_cost.items()}

    # Sort forecasts by total consumed descending
    forecasts.sort(key=lambda f: f["total_consumed_12m"], reverse=True)

    summary = (
        f"Analisis de {len(forecasts)} materiales para planta {plant_id}. "
        f"Horizontes: {', '.join(str(h) + 'M' for h in horizons)}. "
        f"Riesgos criticos: {len(critical_shortage_risks)}. "
        f"Candidatos obsolescencia: {len(obsolescence_candidates)}."
    )

    log.info("Spare parts forecast complete: %s", summary)

    return {
        "plant_id": plant_id,
        "forecast_date": forecast_date,
        "horizons": horizons,
        "materials_analyzed": len(forecasts),
        "forecasts": forecasts,
        "critical_shortage_risks": critical_shortage_risks,
        "obsolescence_candidates": obsolescence_candidates,
        "total_projected_cost": total_projected_cost,
        "recommendations": recommendations,
        "summary": summary,
    }
