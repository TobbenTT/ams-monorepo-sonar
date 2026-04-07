"""Agentic Contractor Performance + Multi-Site Benchmarking service.

Item 12.5 — combines contractor KPI analysis with cross-plant benchmarking.

Contractor Performance:
  1. Query WOs with external_cost > 0 for the lookback period
  2. Group by contractor (derived from assigned_workers JSON)
  3. Compute cost variance, on-time %, rework, quality score per contractor
  4. Rank and generate improvement recommendations

Multi-Site Benchmarking:
  1. Query all distinct plants from managed_work_orders
  2. Compute last-30-day KPIs per plant (reactive ratio, completion rate, etc.)
  3. Rank by composite score and flag statistical outliers (>2 sigma)
"""

import logging
import statistics
from collections import defaultdict
from datetime import datetime, timedelta

from sqlalchemy import func
from sqlalchemy.orm import Session

from api.database.models import ManagedWorkOrderModel

log = logging.getLogger(__name__)

MWO = ManagedWorkOrderModel


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _extract_contractor(assigned_workers: list | None) -> str:
    """Derive contractor identifier from assigned_workers JSON.

    assigned_workers is a list of dicts like [{worker_id, name, specialty}].
    Use the first entry's name. Fall back to EXTERNO_NO_IDENTIFICADO.
    """
    if not assigned_workers:
        return "EXTERNO_NO_IDENTIFICADO"
    if isinstance(assigned_workers, list) and len(assigned_workers) > 0:
        first = assigned_workers[0]
        if isinstance(first, dict):
            name = first.get("name") or first.get("worker_id")
            if name:
                return str(name)
        if isinstance(first, str) and first.strip():
            return first.strip()
    return "EXTERNO_NO_IDENTIFICADO"


def _safe_div(numerator: float, denominator: float, default: float = 0.0) -> float:
    """Division with zero-denominator guard."""
    if denominator == 0:
        return default
    return numerator / denominator


# ---------------------------------------------------------------------------
# Contractor Performance
# ---------------------------------------------------------------------------

def analyze_contractor_performance(
    db: Session,
    plant_id: str = "OCP-JFC1",
    months_lookback: int = 6,
) -> dict:
    """Analyse contractor KPIs from work orders with external cost.

    Returns ranked contractor list with quality scores and recommendations.
    """
    cutoff = datetime.now() - timedelta(days=months_lookback * 30)

    # Step 1 — fetch WOs with external cost in the period
    wos = (
        db.query(MWO)
        .filter(
            MWO.plant_id == plant_id,
            MWO.external_cost > 0,
            MWO.created_at >= cutoff,
        )
        .all()
    )

    if not wos:
        log.info("No contractor WOs found for plant %s in last %d months", plant_id, months_lookback)
        return {
            "plant_id": plant_id,
            "period_months": months_lookback,
            "analyzed_at": datetime.now().isoformat(),
            "contractors": [],
            "total_external_cost": 0.0,
            "total_external_wos": 0,
            "top_performer": None,
            "lowest_performer": None,
            "recommendations": [],
            "summary": "Sin ordenes de trabajo con costo externo en el periodo analizado.",
        }

    # Step 2 — group by contractor
    contractor_wos: dict[str, list] = defaultdict(list)
    for wo in wos:
        cid = _extract_contractor(wo.assigned_workers)
        contractor_wos[cid].append(wo)

    # Pre-index all WOs by equipment+date for rework detection
    equip_timeline: dict[str, list[datetime]] = defaultdict(list)
    for wo in wos:
        if wo.actual_end:
            equip_timeline[wo.equipment_tag].append(wo.actual_end)
        elif wo.created_at:
            equip_timeline[wo.equipment_tag].append(wo.created_at)

    # Step 3 — compute metrics per contractor
    contractors: list[dict] = []
    total_external_cost = 0.0

    for cid, c_wos in contractor_wos.items():
        wo_count = len(c_wos)
        total_cost = sum((wo.external_cost or 0.0) for wo in c_wos)
        total_external_cost += total_cost
        avg_cost = _safe_div(total_cost, wo_count)

        # Cost variance
        planned_total = sum((wo.planned_external_cost or 0.0) for wo in c_wos)
        cost_variance_pct = _safe_div((total_cost - planned_total), planned_total) * 100 if planned_total else 0.0

        # Completion hours
        hours_list = [wo.actual_hours for wo in c_wos if wo.actual_hours and wo.actual_hours > 0]
        avg_hours = _safe_div(sum(hours_list), len(hours_list)) if hours_list else 0.0

        # On-time: completed within estimated_hours
        on_time_count = sum(
            1 for wo in c_wos
            if wo.actual_hours is not None
            and wo.estimated_hours is not None
            and wo.estimated_hours > 0
            and wo.actual_hours <= wo.estimated_hours
        )
        on_time_pct = _safe_div(on_time_count, wo_count) * 100

        # Rework: same equipment within 30 days
        rework_count = 0
        for wo in c_wos:
            ref_date = wo.actual_end or wo.created_at
            if not ref_date:
                continue
            dates_on_equip = equip_timeline.get(wo.equipment_tag, [])
            for d in dates_on_equip:
                if d == ref_date:
                    continue
                delta = abs((d - ref_date).total_seconds())
                if 0 < delta <= 30 * 86400:
                    rework_count += 1
                    break  # count once per WO

        rework_pct = _safe_div(rework_count, wo_count) * 100
        cost_overrun_pct = max(cost_variance_pct, 0.0)
        delay_pct = (1 - _safe_div(on_time_count, wo_count)) * 100 if wo_count else 0.0

        quality_score = max(
            0.0,
            100.0 - (rework_pct * 0.50) - (cost_overrun_pct * 0.30) - (delay_pct * 0.20),
        )
        quality_score = round(min(quality_score, 100.0), 1)

        # WO types breakdown
        wo_types: dict[str, int] = defaultdict(int)
        for wo in c_wos:
            wo_types[wo.wo_type] += 1

        equipment_served = sorted({wo.equipment_tag for wo in c_wos})

        contractors.append({
            "contractor_id": cid,
            "wo_count": wo_count,
            "total_cost": round(total_cost, 2),
            "avg_cost_per_wo": round(avg_cost, 2),
            "cost_variance_pct": round(cost_variance_pct, 1),
            "avg_completion_hours": round(avg_hours, 1),
            "on_time_pct": round(on_time_pct, 1),
            "rework_count": rework_count,
            "quality_score": quality_score,
            "wo_types": dict(wo_types),
            "equipment_served": equipment_served,
        })

    # Step 4 — rank by quality_score descending
    contractors.sort(key=lambda c: c["quality_score"], reverse=True)

    top_performer = contractors[0]["contractor_id"] if contractors else None
    lowest_performer = contractors[-1]["contractor_id"] if contractors else None

    # Step 5 — recommendations
    recommendations: list[str] = []
    for c in contractors:
        cid = c["contractor_id"]
        if c["quality_score"] < 60:
            recommendations.append(f"{cid}: Revisar contrato — bajo desempeno (score {c['quality_score']})")
        if c["wo_count"] > 0 and _safe_div(c["rework_count"], c["wo_count"]) * 100 > 10:
            recommendations.append(f"{cid}: Requerido plan de mejora de calidad (retrabajo {c['rework_count']}/{c['wo_count']})")
        if c["cost_variance_pct"] > 20:
            recommendations.append(f"{cid}: Desviacion de costos significativa ({c['cost_variance_pct']:+.1f}%)")

    total_wos = len(wos)

    summary_parts = [
        f"{len(contractors)} contratistas analizados",
        f"{total_wos} OTs con costo externo",
        f"USD {total_external_cost:,.0f} total",
    ]
    if top_performer:
        top_score = contractors[0]["quality_score"]
        summary_parts.append(f"mejor: {top_performer} ({top_score})")
    if lowest_performer and lowest_performer != top_performer:
        low_score = contractors[-1]["quality_score"]
        summary_parts.append(f"menor: {lowest_performer} ({low_score})")

    log.info(
        "Contractor analysis complete: plant=%s, contractors=%d, wos=%d",
        plant_id, len(contractors), total_wos,
    )

    return {
        "plant_id": plant_id,
        "period_months": months_lookback,
        "analyzed_at": datetime.now().isoformat(),
        "contractors": contractors,
        "total_external_cost": round(total_external_cost, 2),
        "total_external_wos": total_wos,
        "top_performer": top_performer,
        "lowest_performer": lowest_performer,
        "recommendations": recommendations,
        "summary": " | ".join(summary_parts),
    }


# ---------------------------------------------------------------------------
# Multi-Site Benchmarking
# ---------------------------------------------------------------------------

def benchmark_plants(
    db: Session,
) -> dict:
    """Benchmark all plants using last-30-day work order metrics.

    Returns ranked plant list with composite scores and statistical outliers.
    """
    cutoff = datetime.now() - timedelta(days=30)

    # Step 1 — discover all plants
    plant_rows = db.query(MWO.plant_id).distinct().all()
    plant_ids = sorted([r[0] for r in plant_rows if r[0]])

    if not plant_ids:
        log.info("No plants found in managed_work_orders")
        return {
            "benchmarked_at": datetime.now().isoformat(),
            "plants_count": 0,
            "rankings": [],
            "variances": [],
            "best_practices": [],
            "summary": "Sin datos de plantas para benchmarking.",
        }

    # Step 2 — compute metrics per plant
    plant_metrics: list[dict] = []

    for pid in plant_ids:
        wos = (
            db.query(MWO)
            .filter(MWO.plant_id == pid, MWO.created_at >= cutoff)
            .all()
        )

        total_wos = len(wos)
        completed_wos = sum(1 for wo in wos if wo.status == "CERRADO")
        reactive_wos = sum(1 for wo in wos if wo.wo_type == "CORRECTIVO")
        p1_count = sum(1 for wo in wos if wo.priority_code == "P1")

        reactive_ratio = _safe_div(reactive_wos, total_wos) * 100 if total_wos else 0.0
        completion_rate = _safe_div(completed_wos, total_wos) * 100 if total_wos else 0.0

        hours_list = [wo.actual_hours for wo in wos if wo.actual_hours and wo.actual_hours > 0]
        avg_completion_hours = _safe_div(sum(hours_list), len(hours_list)) if hours_list else 0.0

        total_cost = sum((wo.actual_total_cost or 0.0) for wo in wos)

        metrics = {
            "total_wos": total_wos,
            "completed_wos": completed_wos,
            "reactive_ratio": round(reactive_ratio, 1),
            "completion_rate": round(completion_rate, 1),
            "avg_completion_hours": round(avg_completion_hours, 1),
            "total_cost": round(total_cost, 2),
            "p1_count": p1_count,
        }
        plant_metrics.append({"plant_id": pid, "metrics": metrics})

    # Step 3 — composite score (lower reactive + higher completion = better)
    for pm in plant_metrics:
        m = pm["metrics"]
        # Score: completion_rate (0-100) contributes positively, reactive_ratio negatively
        pm["composite_score"] = round(
            m["completion_rate"] * 0.5 + (100 - m["reactive_ratio"]) * 0.3 + max(0, 50 - m["p1_count"]) * 0.4,
            1,
        )

    plant_metrics.sort(key=lambda p: p["composite_score"], reverse=True)

    rankings = []
    for rank, pm in enumerate(plant_metrics, 1):
        rankings.append({
            "rank": rank,
            "plant_id": pm["plant_id"],
            "composite_score": pm["composite_score"],
            "metrics": pm["metrics"],
        })

    # Step 4 — detect variance (>2 sigma from mean)
    metric_keys = ["total_wos", "reactive_ratio", "completion_rate", "avg_completion_hours", "total_cost", "p1_count"]
    variances: list[dict] = []

    for key in metric_keys:
        values = [pm["metrics"][key] for pm in plant_metrics]
        if len(values) < 2:
            continue
        mean_val = statistics.mean(values)
        stdev_val = statistics.pstdev(values)
        if stdev_val == 0:
            continue
        for pm in plant_metrics:
            val = pm["metrics"][key]
            sigma = abs(val - mean_val) / stdev_val
            if sigma > 2.0:
                variances.append({
                    "plant_id": pm["plant_id"],
                    "metric": key,
                    "value": val,
                    "mean": round(mean_val, 2),
                    "deviation_sigma": round(sigma, 2),
                    "status": "ALERTA" if sigma > 3.0 else "ATENCION",
                })

    # Best practices derived from top-ranked plant
    best_practices: list[str] = []
    if rankings:
        top = rankings[0]
        tm = top["metrics"]
        best_practices.append(
            f"Planta lider: {top['plant_id']} — tasa reactiva {tm['reactive_ratio']}%, "
            f"cumplimiento {tm['completion_rate']}%"
        )
        if tm["reactive_ratio"] < 30:
            best_practices.append("Mantener ratio reactivo < 30% mediante programa preventivo robusto")
        if tm["completion_rate"] > 80:
            best_practices.append("Estandarizar proceso de planificacion de la planta lider")
        if len(rankings) > 1:
            bottom = rankings[-1]
            bm = bottom["metrics"]
            if bm["reactive_ratio"] > 50:
                best_practices.append(
                    f"Planta {bottom['plant_id']}: reducir ratio reactivo ({bm['reactive_ratio']}%) "
                    "con revision de estrategia de mantenimiento"
                )

    summary_parts = [
        f"{len(plant_ids)} plantas comparadas",
        f"periodo: ultimos 30 dias",
    ]
    if rankings:
        summary_parts.append(f"lider: {rankings[0]['plant_id']} (score {rankings[0]['composite_score']})")
    if variances:
        summary_parts.append(f"{len(variances)} alertas de desviacion")

    log.info("Benchmark complete: %d plants, %d variances", len(plant_ids), len(variances))

    return {
        "benchmarked_at": datetime.now().isoformat(),
        "plants_count": len(plant_ids),
        "rankings": rankings,
        "variances": variances,
        "best_practices": best_practices,
        "summary": " | ".join(summary_parts),
    }
