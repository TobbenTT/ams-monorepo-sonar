"""Agentic KPI Watchdog service — monitors KPI deviations and generates alerts.

Monitors plant KPIs over a 90-day rolling window and alerts when any KPI
deviates >2 sigma from its moving average.  Uses Claude for causal analysis
with a deterministic fallback when the API key is unavailable.

Pipeline:
  1. Load KPI snapshots (last 90 days), recalculate if empty
  2. Compute moving average and std deviation per KPI
  3. Detect deviations >2 sigma
  4. Correlate with recent work orders
  5. AI causal analysis (Claude) or deterministic fallback
  6. Create in-app notifications for each alert
"""

import json
import logging
import os
from datetime import date, datetime, timedelta

from sqlalchemy.orm import Session

from api.database.models import (
    KPIMetricsModel,
    ManagedWorkOrderModel,
    NotificationModel,
)
from tools.engines.variance_detector import VarianceDetector

log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# KPI configuration
# ---------------------------------------------------------------------------

KPI_FIELDS: list[str] = [
    "mtbf_days",
    "mttr_hours",
    "availability_pct",
    "oee_pct",
    "schedule_compliance_pct",
    "pm_compliance_pct",
    "reactive_ratio_pct",
]

HIGHER_IS_BETTER: set[str] = {
    "mtbf_days",
    "availability_pct",
    "oee_pct",
    "schedule_compliance_pct",
    "pm_compliance_pct",
}

LOWER_IS_BETTER: set[str] = {
    "mttr_hours",
    "reactive_ratio_pct",
}


# ---------------------------------------------------------------------------
# Main watchdog function
# ---------------------------------------------------------------------------

def run_watchdog(db: Session, plant_id: str) -> dict:
    """Analyze KPIs for a plant and generate deviation alerts.

    Parameters
    ----------
    db : Session
        SQLAlchemy database session.
    plant_id : str
        SAP plant code (e.g. ``OCP-JFC1``).

    Returns
    -------
    dict
        ``{alerts, summary, kpi_stats, recent_wos_count}``
    """
    log.info("KPI Watchdog: starting analysis for plant %s", plant_id)

    # ── Step 1: Load KPI snapshots (last 90 days) ───────────────────────
    cutoff = date.today() - timedelta(days=90)
    snapshots = (
        db.query(KPIMetricsModel)
        .filter(
            KPIMetricsModel.plant_id == plant_id,
            KPIMetricsModel.period_end >= cutoff,
        )
        .order_by(KPIMetricsModel.period_end.asc())
        .all()
    )

    if not snapshots:
        log.info("KPI Watchdog: no snapshots found — recalculating from WO history")
        try:
            from api.services.analytics_service import recalculate_kpis_from_history
            recalculate_kpis_from_history(db, plant_id, days=90)
            snapshots = (
                db.query(KPIMetricsModel)
                .filter(
                    KPIMetricsModel.plant_id == plant_id,
                    KPIMetricsModel.period_end >= cutoff,
                )
                .order_by(KPIMetricsModel.period_end.asc())
                .all()
            )
        except Exception as exc:
            log.warning("KPI Watchdog: recalculation failed: %s", exc)

    if not snapshots:
        log.info("KPI Watchdog: still no KPI data for plant %s", plant_id)
        return {"alerts": [], "summary": "No KPI data available for this plant."}

    # ── Step 2: Calculate moving average and std deviation per KPI ───────
    kpi_stats: dict[str, dict] = {}
    alerts: list[dict] = []

    for kpi in KPI_FIELDS:
        values = [
            getattr(snap, kpi)
            for snap in snapshots
            if getattr(snap, kpi) is not None
        ]

        if len(values) < 3:
            log.debug("KPI Watchdog: %s has only %d data points — skipping", kpi, len(values))
            continue

        mean, std_dev = VarianceDetector.compute_stats(values)
        latest = values[-1]

        kpi_stats[kpi] = {
            "mean": mean,
            "std": std_dev,
            "current": latest,
            "z_score": 0.0,
        }

        # ── Step 3: Detect deviations >2 sigma ─────────────────────────
        if std_dev == 0:
            continue

        z_score = round((latest - mean) / std_dev, 2)
        kpi_stats[kpi]["z_score"] = z_score
        abs_z = abs(z_score)

        if abs_z <= 2.0:
            continue

        # Determine if the deviation direction is bad
        is_bad = False
        if kpi in HIGHER_IS_BETTER and z_score < 0:
            is_bad = True
            direction = "below"
        elif kpi in LOWER_IS_BETTER and z_score > 0:
            is_bad = True
            direction = "above"
        elif kpi in HIGHER_IS_BETTER and z_score > 0:
            direction = "above"
        else:
            direction = "below"

        if not is_bad:
            continue

        severity = "CRITICAL" if abs_z > 3.0 else "WARNING"

        alerts.append({
            "kpi": kpi,
            "current_value": latest,
            "baseline": mean,
            "std_dev": std_dev,
            "z_score": z_score,
            "deviation_sigma": abs_z,
            "severity": severity,
            "direction": direction,
        })

    # ── Step 4: Correlate with recent work orders ───────────────────────
    recent_wos = (
        db.query(ManagedWorkOrderModel)
        .filter(
            ManagedWorkOrderModel.plant_id == plant_id,
            ManagedWorkOrderModel.created_at >= datetime.now() - timedelta(days=30),
        )
        .order_by(ManagedWorkOrderModel.created_at.desc())
        .limit(20)
        .all()
    )

    wo_summary = [
        {
            "wo_number": wo.wo_number,
            "equipment_tag": wo.equipment_tag,
            "wo_type": wo.wo_type,
            "status": wo.status if hasattr(wo, "status") else None,
            "priority_code": wo.priority_code,
        }
        for wo in recent_wos
    ]

    # ── Step 5: AI causal analysis ──────────────────────────────────────
    if alerts:
        ai_results = _analyze_with_ai(alerts, wo_summary)
    else:
        ai_results = []

    # Merge AI analysis into alerts
    ai_by_kpi = {r["kpi"]: r for r in ai_results}
    for alert in alerts:
        ai = ai_by_kpi.get(alert["kpi"], {})
        alert["probable_cause"] = ai.get("probable_cause", "")
        alert["recommended_action"] = ai.get("recommended_action", "")
        alert["affected_area"] = ai.get("affected_area", "")

    # ── Step 6: Create notifications ────────────────────────────────────
    for alert in alerts:
        ai_text = alert.get("probable_cause", "")
        if alert.get("recommended_action"):
            ai_text += f" Accion: {alert['recommended_action']}"

        notification = NotificationModel(
            notification_type="KPI_WATCHDOG",
            level="CRITICAL" if alert["severity"] == "CRITICAL" else "WARNING",
            plant_id=plant_id,
            equipment_id=None,
            title=(
                f"KPI Alert: {alert['kpi']} at {alert['current_value']:.1f} "
                f"(baseline {alert['baseline']:.1f})"
            ),
            message=(
                f"Deviation: {alert['deviation_sigma']:.1f}\u03c3. {ai_text}"
            ),
            acknowledged=False,
            created_at=datetime.now(),
            channel="IN_APP",
        )
        db.add(notification)

    if alerts:
        db.commit()
        log.info("KPI Watchdog: created %d notifications for plant %s", len(alerts), plant_id)

    return {
        "alerts": alerts,
        "summary": (
            f"Analyzed {len(KPI_FIELDS)} KPIs over {len(snapshots)} snapshots. "
            f"{len(alerts)} deviations detected."
        ),
        "kpi_stats": kpi_stats,
        "recent_wos_count": len(recent_wos),
    }


# ---------------------------------------------------------------------------
# AI causal analysis
# ---------------------------------------------------------------------------

def _analyze_with_ai(alerts: list[dict], wo_summary: list[dict]) -> list[dict]:
    """Call Claude for causal analysis of KPI deviations.

    Falls back to deterministic analysis when the API key is unavailable
    or the call fails.
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        log.info("ANTHROPIC_API_KEY not set — using fallback KPI analysis")
        return _fallback_analysis(alerts)

    try:
        import anthropic

        client = anthropic.Anthropic(api_key=api_key)

        alerts_json = json.dumps(alerts, default=str, ensure_ascii=False)
        wos_json = json.dumps(wo_summary, default=str, ensure_ascii=False)

        prompt = (
            "Eres un ingeniero de confiabilidad experto en mantenimiento industrial (SAP PM). "
            "Analiza las siguientes desviaciones de KPI y las ordenes de trabajo recientes "
            "para determinar la causa probable de cada desviacion.\n\n"
            f"Alertas de KPI:\n{alerts_json}\n\n"
            f"Ordenes de trabajo recientes (ultimos 30 dias):\n{wos_json}\n\n"
            "Para cada alerta, proporciona un analisis causal. "
            "Responde SOLO con un JSON array con esta estructura:\n"
            '[\n'
            '  {\n'
            '    "kpi": "nombre del KPI",\n'
            '    "probable_cause": "causa probable basada en datos",\n'
            '    "recommended_action": "accion recomendada especifica",\n'
            '    "affected_area": "area o sistema afectado"\n'
            '  }\n'
            ']\n'
        )

        response = client.messages.create(
            model="claude-sonnet-4-6-20250514",
            max_tokens=1500,
            messages=[{"role": "user", "content": prompt}],
        )
        text = response.content[0].text.strip()

        # Parse JSON array from response
        start = text.find("[")
        end = text.rfind("]") + 1
        if start >= 0 and end > start:
            parsed = json.loads(text[start:end])
            if isinstance(parsed, list):
                return parsed

        log.warning("Claude KPI analysis response did not contain JSON array — using fallback")
        return _fallback_analysis(alerts)
    except Exception as exc:
        log.warning("Claude KPI analysis failed: %s — using fallback", exc)
        return _fallback_analysis(alerts)


# ---------------------------------------------------------------------------
# Deterministic fallback
# ---------------------------------------------------------------------------

_FALLBACK_MAP: dict[str, dict[str, str]] = {
    "mtbf_days": {
        "probable_cause": "Incremento en frecuencia de fallas. Revisar estrategia de mantenimiento preventivo.",
        "recommended_action": "Analizar modos de falla recurrentes y ajustar plan preventivo.",
        "affected_area": "Confiabilidad de equipos",
    },
    "mttr_hours": {
        "probable_cause": "Tiempos de reparacion excesivos. Verificar disponibilidad de repuestos y capacitacion.",
        "recommended_action": "Revisar inventario de repuestos criticos y programas de capacitacion.",
        "affected_area": "Mantenibilidad",
    },
    "availability_pct": {
        "probable_cause": "Disponibilidad reducida. Analizar paradas no programadas recientes.",
        "recommended_action": "Identificar equipos con mayor tiempo fuera de servicio y priorizar intervenciones.",
        "affected_area": "Disponibilidad operacional",
    },
    "oee_pct": {
        "probable_cause": "Eficiencia global reducida. Revisar rendimiento y calidad operacional.",
        "recommended_action": "Descomponer OEE en disponibilidad, rendimiento y calidad para identificar factor dominante.",
        "affected_area": "Eficiencia de produccion",
    },
    "schedule_compliance_pct": {
        "probable_cause": "Incumplimiento de programa. Verificar backlog y recursos.",
        "recommended_action": "Revisar carga de trabajo vs capacidad disponible y priorizar OTs criticas.",
        "affected_area": "Planificacion y programacion",
    },
    "pm_compliance_pct": {
        "probable_cause": "Preventivos incumplidos. Riesgo de fallas no anticipadas.",
        "recommended_action": "Asegurar ejecucion de preventivos criticos y evaluar frecuencias de planes.",
        "affected_area": "Mantenimiento preventivo",
    },
    "reactive_ratio_pct": {
        "probable_cause": "Ratio reactivo elevado. Exceso de correctivos vs preventivos.",
        "recommended_action": "Fortalecer estrategia preventiva/predictiva para reducir correctivos.",
        "affected_area": "Estrategia de mantenimiento",
    },
}


def _fallback_analysis(alerts: list[dict]) -> list[dict]:
    """Return generic causal analysis for each alert based on KPI type."""
    results = []
    for alert in alerts:
        kpi = alert["kpi"]
        entry = _FALLBACK_MAP.get(kpi, {
            "probable_cause": "Desviacion significativa detectada. Requiere investigacion.",
            "recommended_action": "Realizar analisis de causa raiz.",
            "affected_area": "General",
        })
        results.append({
            "kpi": kpi,
            "probable_cause": entry["probable_cause"],
            "recommended_action": entry["recommended_action"],
            "affected_area": entry["affected_area"],
        })
    return results
