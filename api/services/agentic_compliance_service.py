"""Agentic Compliance Watchdog service — monitors regulatory compliance,
RBI inspection schedules, and KPI threshold breaches.

Designed for Goldfields Salares Norte (Chile), regulated by SERNAGEOMIN.
Key compliance areas: equipment inspections, safety certifications,
environmental monitoring, pressure vessel inspections.

Pipeline (deterministic, no Claude API):
  1. Check RBI overdue inspections from latest assessment
  2. Check KPI compliance thresholds (reactive ratio, PM/schedule compliance)
  3. Build SERNAGEOMIN regulatory calendar and identify gaps
  4. Generate unified compliance report with severity-sorted alerts
"""

import json
import logging
from datetime import date, datetime, timedelta

from sqlalchemy import desc
from sqlalchemy.orm import Session

from api.database.models import (
    HierarchyNodeModel,
    ManagedWorkOrderModel,
    NotificationModel,
    RBIAssessmentModel,
)

log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# KPI compliance thresholds
# ---------------------------------------------------------------------------

COMPLIANCE_THRESHOLDS = {
    "reactive_ratio_pct": {"target": 30.0, "direction": "below", "severity": "WARNING"},
    "pm_compliance_pct": {"target": 90.0, "direction": "above", "severity": "WARNING"},
    "schedule_compliance_pct": {"target": 85.0, "direction": "above", "severity": "INFO"},
    "backlog_p1_count": {"target": 0, "direction": "equal", "severity": "CRITICAL"},
}

# ---------------------------------------------------------------------------
# SERNAGEOMIN regulatory calendar (Chilean mining)
# ---------------------------------------------------------------------------

SERNAGEOMIN_CALENDAR = [
    {
        "requirement": "Inspeccion de equipos de levante (gruas, puente grua)",
        "regulation": "DS 132 Art. 369",
        "frequency": "Anual",
        "frequency_days": 365,
        "equipment_types": ["GRUA", "PUENTE_GRUA", "TECLE"],
        "severity": "CRITICAL",
    },
    {
        "requirement": "Inspeccion de recipientes a presion",
        "regulation": "DS 48 / NCh 3390",
        "frequency": "Anual",
        "frequency_days": 365,
        "equipment_types": ["COMPRESOR", "CALDERO", "RECIPIENTE_PRESION"],
        "severity": "CRITICAL",
    },
    {
        "requirement": "Certificacion de equipos electricos en areas clasificadas",
        "regulation": "DS 132 Art. 215",
        "frequency": "Bianual",
        "frequency_days": 730,
        "equipment_types": ["MOTOR", "TABLERO", "TRANSFORMADOR"],
        "severity": "WARNING",
    },
    {
        "requirement": "Inspeccion de sistemas contra incendio",
        "regulation": "DS 594 / NFPA",
        "frequency": "Semestral",
        "frequency_days": 180,
        "equipment_types": ["EXTINTOR", "BOMBA_INCENDIO", "RED_INCENDIO"],
        "severity": "CRITICAL",
    },
    {
        "requirement": "Revision de sistemas de ventilacion en espacios confinados",
        "regulation": "DS 132 Art. 120",
        "frequency": "Trimestral",
        "frequency_days": 90,
        "equipment_types": ["VENTILADOR", "EXTRACTOR"],
        "severity": "WARNING",
    },
    {
        "requirement": "Mantenimiento preventivo de vehiculos y equipos moviles",
        "regulation": "DS 132 Art. 363",
        "frequency": "Segun programa",
        "frequency_days": 90,
        "equipment_types": ["CAMION", "CARGADOR", "VEHICULO"],
        "severity": "INFO",
    },
    {
        "requirement": "Monitoreo ambiental — polvo, ruido, vibraciones",
        "regulation": "DS 594 Art. 70-80",
        "frequency": "Semestral",
        "frequency_days": 180,
        "equipment_types": [],
        "severity": "WARNING",
    },
    {
        "requirement": "Certificacion de elementos de proteccion personal",
        "regulation": "DS 594 / NCh",
        "frequency": "Anual",
        "frequency_days": 365,
        "equipment_types": [],
        "severity": "INFO",
    },
]

# Severity ranking for sorting alerts
_SEVERITY_RANK = {"CRITICAL": 0, "WARNING": 1, "INFO": 2}


# ---------------------------------------------------------------------------
# Step 1 — RBI overdue inspections
# ---------------------------------------------------------------------------

def _check_rbi_inspections(
    db: Session,
    plant_id: str,
    today: date,
) -> dict:
    """Parse latest RBI assessment and flag overdue / due-soon items."""

    result = {
        "total_assessed": 0,
        "overdue": [],
        "due_soon": [],
        "high_risk_overdue": 0,
    }

    latest: RBIAssessmentModel | None = (
        db.query(RBIAssessmentModel)
        .filter(RBIAssessmentModel.plant_id == plant_id)
        .order_by(desc(RBIAssessmentModel.analyzed_at))
        .first()
    )
    if not latest:
        log.info("No RBI assessment found for plant %s", plant_id)
        return result

    assessments_raw = latest.assessments or []
    if isinstance(assessments_raw, str):
        try:
            assessments_raw = json.loads(assessments_raw)
        except (json.JSONDecodeError, TypeError):
            log.warning("Could not parse RBI assessments JSON for %s", plant_id)
            return result

    result["total_assessed"] = len(assessments_raw)

    for item in assessments_raw:
        next_insp_str = item.get("next_inspection_date")
        if not next_insp_str:
            continue

        # Parse date — accept ISO format (YYYY-MM-DD) or datetime string
        try:
            if isinstance(next_insp_str, str):
                next_insp = date.fromisoformat(next_insp_str[:10])
            elif isinstance(next_insp_str, (date, datetime)):
                next_insp = next_insp_str if isinstance(next_insp_str, date) else next_insp_str.date()
            else:
                continue
        except (ValueError, TypeError):
            continue

        equipment_tag = item.get("equipment_tag", "UNKNOWN")
        risk_level = (item.get("risk_level") or "MEDIUM").upper()
        delta_days = (next_insp - today).days

        if delta_days < 0:
            # Overdue
            entry = {
                "equipment_tag": equipment_tag,
                "risk_level": risk_level,
                "next_inspection_date": next_insp.isoformat(),
                "days_overdue": abs(delta_days),
            }
            result["overdue"].append(entry)
            if risk_level == "HIGH":
                result["high_risk_overdue"] += 1
        elif delta_days <= 30:
            # Due soon
            entry = {
                "equipment_tag": equipment_tag,
                "risk_level": risk_level,
                "next_inspection_date": next_insp.isoformat(),
                "days_remaining": delta_days,
            }
            result["due_soon"].append(entry)

    # Sort overdue by days_overdue descending (most overdue first)
    result["overdue"].sort(key=lambda x: x["days_overdue"], reverse=True)
    result["due_soon"].sort(key=lambda x: x["days_remaining"])

    return result


# ---------------------------------------------------------------------------
# Step 2 — KPI compliance thresholds
# ---------------------------------------------------------------------------

def _check_kpi_thresholds(
    db: Session,
    plant_id: str,
    today: date,
) -> list[dict]:
    """Compute basic KPIs from recent WOs and check against thresholds."""

    breaches: list[dict] = []
    cutoff = datetime.combine(today - timedelta(days=30), datetime.min.time())

    # Fetch WOs from last 30 days
    recent_wos = (
        db.query(ManagedWorkOrderModel)
        .filter(
            ManagedWorkOrderModel.plant_id == plant_id,
            ManagedWorkOrderModel.planned_start >= cutoff,
        )
        .all()
    )

    if not recent_wos:
        log.info("No recent WOs found for plant %s (last 30 days)", plant_id)
        return breaches

    total_wos = len(recent_wos)

    # --- Reactive ratio ---
    reactive_types = {"CORRECTIVO"}
    reactive_count = sum(
        1 for wo in recent_wos if (wo.wo_type or "").upper() in reactive_types
    )
    reactive_ratio = (reactive_count / total_wos * 100) if total_wos > 0 else 0.0

    # --- PM compliance ---
    preventive_types = {"PREVENTIVO", "PREDICTIVO", "MONITOREO_CONDICION"}
    pm_wos = [wo for wo in recent_wos if (wo.wo_type or "").upper() in preventive_types]
    pm_completed = sum(1 for wo in pm_wos if (wo.status or "").upper() == "CERRADO")
    pm_compliance = (pm_completed / len(pm_wos) * 100) if pm_wos else 100.0

    # --- Schedule compliance ---
    scheduled_wos = [wo for wo in recent_wos if wo.planned_end is not None]
    on_time = sum(
        1 for wo in scheduled_wos
        if wo.actual_end is not None and wo.actual_end <= wo.planned_end
    )
    schedule_compliance = (on_time / len(scheduled_wos) * 100) if scheduled_wos else 100.0

    # --- Backlog P1 count ---
    backlog_p1 = sum(
        1 for wo in recent_wos
        if (wo.priority_code or "").upper() == "P1"
        and (wo.status or "").upper() not in {"CERRADO", "CANCELADO"}
    )

    # Check each KPI against thresholds
    kpi_values = {
        "reactive_ratio_pct": reactive_ratio,
        "pm_compliance_pct": pm_compliance,
        "schedule_compliance_pct": schedule_compliance,
        "backlog_p1_count": float(backlog_p1),
    }

    for kpi_name, current_value in kpi_values.items():
        threshold = COMPLIANCE_THRESHOLDS.get(kpi_name)
        if not threshold:
            continue

        target = threshold["target"]
        direction = threshold["direction"]
        severity = threshold["severity"]

        breached = False
        if direction == "below" and current_value > target:
            breached = True
        elif direction == "above" and current_value < target:
            breached = True
        elif direction == "equal" and current_value != target:
            breached = True

        if breached:
            breaches.append({
                "kpi_name": kpi_name,
                "current_value": round(current_value, 1),
                "target": target,
                "direction": direction,
                "severity": severity,
            })

    return breaches


# ---------------------------------------------------------------------------
# Step 3 — SERNAGEOMIN regulatory calendar gaps
# ---------------------------------------------------------------------------

def _check_regulatory_gaps(
    db: Session,
    plant_id: str,
    today: date,
) -> list[dict]:
    """Cross-reference regulatory calendar with hierarchy equipment and
    recent completed WOs to identify compliance gaps."""

    gaps: list[dict] = []

    for reg in SERNAGEOMIN_CALENDAR:
        equipment_types = reg["equipment_types"]

        # Requirements without equipment_types apply plant-wide
        if not equipment_types:
            # Check if there's any recent WO whose description references
            # keywords from the requirement
            cutoff = datetime.combine(
                today - timedelta(days=reg["frequency_days"]),
                datetime.min.time(),
            )
            matching_wos = (
                db.query(ManagedWorkOrderModel)
                .filter(
                    ManagedWorkOrderModel.plant_id == plant_id,
                    ManagedWorkOrderModel.status == "CERRADO",
                    ManagedWorkOrderModel.actual_end >= cutoff,
                )
                .all()
            )
            # Simple keyword match from requirement
            keywords = [
                w.lower() for w in reg["requirement"].split()
                if len(w) > 4
            ]
            has_match = any(
                any(kw in (wo.description or "").lower() for kw in keywords)
                for wo in matching_wos
            )

            if not has_match:
                gaps.append({
                    "requirement": reg["requirement"],
                    "regulation": reg["regulation"],
                    "frequency": reg["frequency"],
                    "severity": reg["severity"],
                    "equipment_count": 0,
                    "last_inspection": None,
                    "days_since": None,
                    "status": "NO_RECORD",
                })
            continue

        # Find equipment in hierarchy matching any of the types
        matching_nodes = (
            db.query(HierarchyNodeModel)
            .filter(
                HierarchyNodeModel.plant_id == plant_id,
                HierarchyNodeModel.status == "ACTIVE",
                HierarchyNodeModel.node_type.in_(["EQUIPMENT", "SUB_ASSEMBLY"]),
            )
            .all()
        )

        # Match by name/code containing the equipment type keyword
        matched_equipment = []
        for node in matching_nodes:
            node_name = (node.name or "").upper()
            node_code = (node.code or "").upper()
            node_tag = (node.tag or "").upper()
            for eq_type in equipment_types:
                if eq_type in node_name or eq_type in node_code or eq_type in node_tag:
                    matched_equipment.append(node)
                    break

        if not matched_equipment:
            # No matching equipment in plant — requirement not applicable
            continue

        # Check if there is a recent completed WO for any of this equipment
        equipment_tags = [n.tag for n in matched_equipment if n.tag]
        equipment_ids = [n.node_id for n in matched_equipment]

        cutoff = datetime.combine(
            today - timedelta(days=reg["frequency_days"]),
            datetime.min.time(),
        )

        recent_inspection_wos = []
        if equipment_tags:
            recent_inspection_wos = (
                db.query(ManagedWorkOrderModel)
                .filter(
                    ManagedWorkOrderModel.plant_id == plant_id,
                    ManagedWorkOrderModel.status == "CERRADO",
                    ManagedWorkOrderModel.equipment_tag.in_(equipment_tags),
                    ManagedWorkOrderModel.actual_end >= cutoff,
                )
                .all()
            )

        if not recent_inspection_wos:
            # Also try by equipment_id
            recent_inspection_wos = (
                db.query(ManagedWorkOrderModel)
                .filter(
                    ManagedWorkOrderModel.plant_id == plant_id,
                    ManagedWorkOrderModel.status == "CERRADO",
                    ManagedWorkOrderModel.equipment_id.in_(equipment_ids),
                    ManagedWorkOrderModel.actual_end >= cutoff,
                )
                .all()
            )

        # Find the most recent inspection date across all matching equipment
        last_inspection = None
        days_since = None
        if recent_inspection_wos:
            latest_wo = max(
                recent_inspection_wos,
                key=lambda wo: wo.actual_end or datetime.min,
            )
            if latest_wo.actual_end:
                last_inspection = latest_wo.actual_end.date().isoformat()
                days_since = (today - latest_wo.actual_end.date()).days

        if not recent_inspection_wos:
            status = "GAP"
        elif days_since and days_since > reg["frequency_days"]:
            status = "OVERDUE"
        else:
            status = "COMPLIANT"

        if status != "COMPLIANT":
            gaps.append({
                "requirement": reg["requirement"],
                "regulation": reg["regulation"],
                "frequency": reg["frequency"],
                "severity": reg["severity"],
                "equipment_count": len(matched_equipment),
                "last_inspection": last_inspection,
                "days_since": days_since,
                "status": status,
            })

    return gaps


# ---------------------------------------------------------------------------
# Step 4 — Build unified alerts and compliance report
# ---------------------------------------------------------------------------

def _build_alerts(
    rbi_findings: dict,
    kpi_breaches: list[dict],
    regulatory_gaps: list[dict],
) -> list[dict]:
    """Compile all findings into a unified, severity-sorted alert list."""

    alerts: list[dict] = []

    # RBI overdue alerts
    for item in rbi_findings.get("overdue", []):
        severity = "CRITICAL" if item["risk_level"] == "HIGH" else "WARNING"
        alerts.append({
            "source": "RBI",
            "severity": severity,
            "title": f"Inspeccion RBI vencida — {item['equipment_tag']}",
            "detail": (
                f"Riesgo {item['risk_level']}, vencida hace "
                f"{item['days_overdue']} dias "
                f"(fecha: {item['next_inspection_date']})"
            ),
        })

    # RBI due-soon alerts (INFO level)
    for item in rbi_findings.get("due_soon", []):
        alerts.append({
            "source": "RBI",
            "severity": "INFO",
            "title": f"Inspeccion RBI proxima — {item['equipment_tag']}",
            "detail": (
                f"Riesgo {item['risk_level']}, vence en "
                f"{item['days_remaining']} dias "
                f"(fecha: {item['next_inspection_date']})"
            ),
        })

    # KPI breach alerts
    for breach in kpi_breaches:
        alerts.append({
            "source": "KPI",
            "severity": breach["severity"],
            "title": f"KPI fuera de rango — {breach['kpi_name']}",
            "detail": (
                f"Valor actual: {breach['current_value']}, "
                f"objetivo: {'<' if breach['direction'] == 'below' else '>'}"
                f" {breach['target']}"
            ),
        })

    # Regulatory gap alerts
    for gap in regulatory_gaps:
        alerts.append({
            "source": "SERNAGEOMIN",
            "severity": gap["severity"],
            "title": f"Brecha regulatoria — {gap['regulation']}",
            "detail": (
                f"{gap['requirement']} ({gap['frequency']}). "
                f"Estado: {gap['status']}. "
                f"Equipos afectados: {gap['equipment_count']}"
            ),
        })

    # Sort by severity (CRITICAL first, then WARNING, then INFO)
    alerts.sort(key=lambda a: _SEVERITY_RANK.get(a["severity"], 99))

    return alerts


def _determine_overall_status(alerts: list[dict]) -> str:
    """Derive overall compliance status from alert severities."""
    severities = {a["severity"] for a in alerts}
    if "CRITICAL" in severities:
        return "NON_COMPLIANT"
    if "WARNING" in severities:
        return "WARNING"
    return "COMPLIANT"


def _build_summary(
    overall_status: str,
    rbi_findings: dict,
    kpi_breaches: list[dict],
    regulatory_gaps: list[dict],
    alerts: list[dict],
) -> str:
    """Generate a brief text summary of the compliance check."""

    parts: list[str] = []

    overdue_count = len(rbi_findings.get("overdue", []))
    due_soon_count = len(rbi_findings.get("due_soon", []))
    high_risk = rbi_findings.get("high_risk_overdue", 0)

    if overdue_count:
        parts.append(
            f"{overdue_count} inspecciones RBI vencidas "
            f"({high_risk} de alto riesgo)"
        )
    if due_soon_count:
        parts.append(f"{due_soon_count} inspecciones RBI proximas a vencer")

    if kpi_breaches:
        kpi_names = ", ".join(b["kpi_name"] for b in kpi_breaches)
        parts.append(f"KPIs fuera de rango: {kpi_names}")

    if regulatory_gaps:
        parts.append(
            f"{len(regulatory_gaps)} brechas regulatorias SERNAGEOMIN detectadas"
        )

    if not parts:
        return f"Planta en cumplimiento. {rbi_findings['total_assessed']} equipos evaluados, sin alertas."

    critical_count = sum(1 for a in alerts if a["severity"] == "CRITICAL")
    warning_count = sum(1 for a in alerts if a["severity"] == "WARNING")

    header = f"Estado: {overall_status}. "
    header += f"{critical_count} alertas criticas, {warning_count} advertencias. "

    return header + "; ".join(parts) + "."


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def check_compliance(
    db: Session,
    plant_id: str = "OCP-JFC1",
) -> dict:
    """Run the full compliance watchdog pipeline for a plant.

    Returns a structured compliance report with RBI findings, KPI breaches,
    SERNAGEOMIN regulatory gaps, and unified severity-sorted alerts.
    """

    log.info("Running compliance check for plant %s", plant_id)
    today = date.today()

    # Step 1 — RBI overdue inspections
    rbi_findings = _check_rbi_inspections(db, plant_id, today)
    log.info(
        "RBI: %d assessed, %d overdue, %d due soon, %d high-risk overdue",
        rbi_findings["total_assessed"],
        len(rbi_findings["overdue"]),
        len(rbi_findings["due_soon"]),
        rbi_findings["high_risk_overdue"],
    )

    # Step 2 — KPI compliance thresholds
    kpi_breaches = _check_kpi_thresholds(db, plant_id, today)
    log.info("KPI: %d threshold breaches detected", len(kpi_breaches))

    # Step 3 — SERNAGEOMIN regulatory calendar
    regulatory_gaps = _check_regulatory_gaps(db, plant_id, today)
    log.info("Regulatory: %d SERNAGEOMIN gaps detected", len(regulatory_gaps))

    # Step 4 — Build unified report
    alerts = _build_alerts(rbi_findings, kpi_breaches, regulatory_gaps)
    overall_status = _determine_overall_status(alerts)
    summary = _build_summary(
        overall_status, rbi_findings, kpi_breaches, regulatory_gaps, alerts,
    )

    # Create in-app notifications for CRITICAL and WARNING alerts
    for alert in alerts:
        if alert["severity"] in {"CRITICAL", "WARNING"}:
            try:
                notification = NotificationModel(
                    notification_type="COMPLIANCE",
                    level=alert["severity"],
                    plant_id=plant_id,
                    title=alert["title"],
                    message=alert["detail"],
                )
                db.add(notification)
            except Exception:
                log.exception("Failed to create notification for alert: %s", alert["title"])

    try:
        db.commit()
    except Exception:
        log.exception("Failed to commit compliance notifications")
        db.rollback()

    report = {
        "plant_id": plant_id,
        "checked_at": datetime.now().isoformat(),
        "overall_status": overall_status,
        "rbi_findings": rbi_findings,
        "kpi_breaches": kpi_breaches,
        "regulatory_gaps": regulatory_gaps,
        "alerts": alerts,
        "summary": summary,
    }

    log.info(
        "Compliance check complete: %s — %d alerts (%s)",
        plant_id,
        len(alerts),
        overall_status,
    )

    return report
