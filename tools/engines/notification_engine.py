"""Notification/Alert Engine — Phase 6.

Evaluates system state against thresholds and generates alerts for:
- Overdue RBI inspections
- KPI threshold breaches
- High-risk equipment (from health scores)
- Aging backlog items
- Overdue CAPA/MoC actions

Deterministic — no LLM required.
"""

from __future__ import annotations

from datetime import date, datetime

from tools.models.schemas import (
    AlertNotification,
    NotificationLevel,
    NotificationResult,
    NotificationType,
)


class NotificationEngine:
    """Evaluates thresholds and generates alerts."""

    @staticmethod
    def check_rbi_overdue(
        assessments: list[dict],
        as_of_date: date | None = None,
    ) -> list[AlertNotification]:
        """Check for overdue RBI inspections."""
        today = as_of_date or date.today()
        alerts: list[AlertNotification] = []
        for a in assessments:
            next_date = a.get("next_inspection_date")
            if next_date is None:
                continue
            if isinstance(next_date, str):
                next_date = date.fromisoformat(next_date)
            if next_date <= today:
                days_overdue = (today - next_date).days
                level = NotificationLevel.CRITICAL if days_overdue > 90 else NotificationLevel.WARNING
                alerts.append(AlertNotification(
                    notification_type=NotificationType.RBI_OVERDUE,
                    level=level,
                    title=f"RBI inspection overdue: {a.get('equipment_id', 'unknown')}",
                    message=f"Inspection overdue by {days_overdue} days. Risk level: {a.get('risk_level', 'UNKNOWN')}",
                    equipment_id=a.get("equipment_id"),
                    plant_id=a.get("plant_id", ""),
                ))
        return alerts

    @staticmethod
    def check_kpi_thresholds(
        planning_kpis: dict | None = None,
        de_kpis: dict | None = None,
        reliability_kpis: dict | None = None,
    ) -> list[AlertNotification]:
        """Check KPIs against targets and generate alerts for breaches."""
        alerts: list[AlertNotification] = []

        def _check_kpi_list(kpis: list[dict], source: str) -> None:
            for kpi in kpis:
                value = kpi.get("value")
                target = kpi.get("target")
                status = kpi.get("status", "")
                name = kpi.get("name", "unknown")
                if value is None or target is None:
                    continue
                if status == "BELOW_TARGET" or value < target * 0.9:
                    gap = round(target - value, 1)
                    level = NotificationLevel.CRITICAL if value < target * 0.7 else NotificationLevel.WARNING
                    alerts.append(AlertNotification(
                        notification_type=NotificationType.KPI_BREACH,
                        level=level,
                        title=f"KPI below target: {name} ({source})",
                        message=f"Current: {value:.1f}%, Target: {target:.1f}%, Gap: {gap:.1f}%",
                    ))

        if planning_kpis and "kpis" in planning_kpis:
            _check_kpi_list(planning_kpis["kpis"], "Planning")
        elif planning_kpis and isinstance(planning_kpis, list):
            _check_kpi_list(planning_kpis, "Planning")

        if de_kpis and "kpis" in de_kpis:
            _check_kpi_list(
                [{"name": k.get("name", k.get("kpi_name", "")),
                  "value": k.get("value"), "target": k.get("target"),
                  "status": k.get("status")}
                 for k in de_kpis["kpis"]],
                "DE",
            )

        if reliability_kpis:
            for field, target, higher_better in [
                ("availability_pct", 90.0, True),
                ("reactive_ratio_pct", 20.0, False),
            ]:
                val = reliability_kpis.get(field)
                if val is None:
                    continue
                if higher_better and val < target * 0.9:
                    alerts.append(AlertNotification(
                        notification_type=NotificationType.KPI_BREACH,
                        level=NotificationLevel.WARNING,
                        title=f"KPI below target: {field} (Reliability)",
                        message=f"Current: {val:.1f}%, Target: {target:.1f}%",
                    ))
                elif not higher_better and val > target * 1.1:
                    alerts.append(AlertNotification(
                        notification_type=NotificationType.KPI_BREACH,
                        level=NotificationLevel.WARNING,
                        title=f"KPI above threshold: {field} (Reliability)",
                        message=f"Current: {val:.1f}%, Threshold: {target:.1f}%",
                    ))

        return alerts

    @staticmethod
    def check_equipment_risk(
        health_scores: list[dict],
        threshold: str = "CRITICAL",
    ) -> list[AlertNotification]:
        """Check for high-risk equipment based on health scores."""
        alerts: list[AlertNotification] = []
        threshold_map = {"CRITICAL": 30, "AT_RISK": 50, "FAIR": 70}
        score_threshold = threshold_map.get(threshold, 30)

        for eq in health_scores:
            score = eq.get("composite_score", eq.get("health_score", 100))
            if score <= score_threshold:
                health_class = eq.get("health_class", "UNKNOWN")
                level = NotificationLevel.CRITICAL if score <= 30 else NotificationLevel.WARNING
                alerts.append(AlertNotification(
                    notification_type=NotificationType.EQUIPMENT_RISK,
                    level=level,
                    title=f"Equipment at risk: {eq.get('equipment_id', 'unknown')}",
                    message=f"Health score: {score:.0f}/100, Class: {health_class}",
                    equipment_id=eq.get("equipment_id"),
                    plant_id=eq.get("plant_id", ""),
                ))
        return alerts

    @staticmethod
    def check_backlog_aging(
        backlog_items: list[dict],
        aging_threshold_days: int = 30,
    ) -> list[AlertNotification]:
        """Check for aging backlog items."""
        alerts: list[AlertNotification] = []
        today = date.today()
        for item in backlog_items:
            created = item.get("created_at") or item.get("created_date")
            if created is None:
                continue
            if isinstance(created, str):
                created = date.fromisoformat(created[:10])
            elif isinstance(created, datetime):
                created = created.date()
            age_days = (today - created).days
            if age_days >= aging_threshold_days:
                level = NotificationLevel.CRITICAL if age_days >= aging_threshold_days * 3 else NotificationLevel.WARNING
                alerts.append(AlertNotification(
                    notification_type=NotificationType.BACKLOG_AGING,
                    level=level,
                    title=f"Aging backlog: {item.get('work_order_id', item.get('wo_id', 'unknown'))}",
                    message=f"Age: {age_days} days (threshold: {aging_threshold_days})",
                    equipment_id=item.get("equipment_id"),
                    plant_id=item.get("plant_id", ""),
                ))
        return alerts

    @staticmethod
    def check_overdue_actions(
        capas: list[dict] | None = None,
        mocs: list[dict] | None = None,
        as_of_date: date | None = None,
    ) -> list[AlertNotification]:
        """Check for overdue CAPA and MoC actions."""
        today = as_of_date or date.today()
        alerts: list[AlertNotification] = []

        for capa in (capas or []):
            target_date = capa.get("target_date")
            status = capa.get("status", "")
            if target_date and status in ("OPEN", "IN_PROGRESS"):
                if isinstance(target_date, str):
                    target_date = date.fromisoformat(target_date[:10])
                if target_date < today:
                    alerts.append(AlertNotification(
                        notification_type=NotificationType.CAPA_OVERDUE,
                        level=NotificationLevel.CRITICAL,
                        title=f"CAPA overdue: {capa.get('title', capa.get('capa_id', 'unknown'))}",
                        message=f"Due: {target_date}, Status: {status}",
                        plant_id=capa.get("plant_id", ""),
                    ))

        for moc in (mocs or []):
            status = moc.get("status", "")
            created = moc.get("created_at")
            if status in ("DRAFT", "SUBMITTED", "REVIEWING") and created:
                if isinstance(created, str):
                    created = date.fromisoformat(created[:10])
                elif isinstance(created, datetime):
                    created = created.date()
                age = (today - created).days
                if age > 30:
                    alerts.append(AlertNotification(
                        notification_type=NotificationType.MOC_OVERDUE,
                        level=NotificationLevel.WARNING,
                        title=f"MoC stalled: {moc.get('title', moc.get('moc_id', 'unknown'))}",
                        message=f"Status: {status}, Age: {age} days",
                        plant_id=moc.get("plant_id", ""),
                    ))

        return alerts

    @staticmethod
    def generate_all_notifications(
        plant_id: str,
        rbi_assessments: list[dict] | None = None,
        planning_kpis: dict | None = None,
        de_kpis: dict | None = None,
        reliability_kpis: dict | None = None,
        health_scores: list[dict] | None = None,
        backlog_items: list[dict] | None = None,
        capas: list[dict] | None = None,
        mocs: list[dict] | None = None,
    ) -> NotificationResult:
        """Run all checks and aggregate notifications."""
        all_alerts: list[AlertNotification] = []

        if rbi_assessments:
            all_alerts.extend(NotificationEngine.check_rbi_overdue(rbi_assessments))
        if planning_kpis or de_kpis or reliability_kpis:
            all_alerts.extend(NotificationEngine.check_kpi_thresholds(
                planning_kpis, de_kpis, reliability_kpis,
            ))
        if health_scores:
            all_alerts.extend(NotificationEngine.check_equipment_risk(health_scores))
        if backlog_items:
            all_alerts.extend(NotificationEngine.check_backlog_aging(backlog_items))
        if capas or mocs:
            all_alerts.extend(NotificationEngine.check_overdue_actions(capas, mocs))

        # Set plant_id on all alerts if not set
        for alert in all_alerts:
            if not alert.plant_id:
                alert.plant_id = plant_id

        critical = sum(1 for a in all_alerts if a.level == NotificationLevel.CRITICAL)
        warning = sum(1 for a in all_alerts if a.level == NotificationLevel.WARNING)
        info = sum(1 for a in all_alerts if a.level == NotificationLevel.INFO)

        return NotificationResult(
            plant_id=plant_id,
            total_notifications=len(all_alerts),
            critical_count=critical,
            warning_count=warning,
            info_count=info,
            notifications=all_alerts,
        )
