"""
Management Review Engine — REF-12 Recommendation 8 (ISO 55002 §9.3)
Aggregates Asset Health, KPIs, Variance Alerts, and CAPAs into an
executive summary for management review.

Addresses ISO 55002:
- §9.3 Management Review
- §9.1 Monitoring, measurement, analysis and evaluation
- §10.4 Continual improvement

Neuro-Architecture Alignment:
- Anchoring Bias: Balanced start screen (not overly optimistic)
- Hidden Profile Bias: Per-plant breakdown beneath aggregates
- CLT: Maximum 5 top-level categories (chunking principle)
"""

from datetime import date, datetime

from tools.models.schemas import (
    AssetHealthScore,
    CAPAItem,
    CAPAStatus,
    KPIMetrics,
    ManagementReviewSummary,
    PlantVarianceAlert,
    VarianceLevel,
)


class ManagementReviewEngine:
    """Generates executive management review summaries."""

    @classmethod
    def generate_review(
        cls,
        plant_id: str,
        period_start: date,
        period_end: date,
        kpi_summary: KPIMetrics | None = None,
        health_scores: list[AssetHealthScore] | None = None,
        variance_alerts: list[PlantVarianceAlert] | None = None,
        capas: list[CAPAItem] | None = None,
        previous_avg_health: float | None = None,
        previous_kpis: KPIMetrics | None = None,
    ) -> ManagementReviewSummary:
        """Generate a comprehensive management review summary.

        Args:
            plant_id: Plant identifier
            period_start/end: Review period
            kpi_summary: KPI metrics for the period
            health_scores: Per-equipment health scores
            variance_alerts: Alerts from multi-plant analysis
            capas: CAPA items related to this plant
            previous_avg_health: Previous period average health (for trend)
            previous_kpis: Previous period KPIs (for trends)
        """
        scores = health_scores or []
        alerts = variance_alerts or []
        capa_list = capas or []

        # Average health score
        avg_health = 0.0
        if scores:
            avg_health = round(
                sum(s.composite_score for s in scores) / len(scores), 1
            )

        # Health trend
        health_trend = "STABLE"
        if previous_avg_health is not None:
            delta = avg_health - previous_avg_health
            if delta > 5.0:
                health_trend = "IMPROVING"
            elif delta < -5.0:
                health_trend = "DEGRADING"

        # CAPA counts
        open_capas = len([c for c in capa_list if c.status in (CAPAStatus.OPEN, CAPAStatus.IN_PROGRESS)])
        overdue_capas = len([
            c for c in capa_list
            if c.target_date and c.status in (CAPAStatus.OPEN, CAPAStatus.IN_PROGRESS)
            and period_end > c.target_date
        ])

        # KPI trends
        kpi_trends = cls._compute_kpi_trends(kpi_summary, previous_kpis)

        # Key findings
        key_findings = cls._generate_findings(
            avg_health, scores, alerts, open_capas, overdue_capas, kpi_summary,
        )

        # Recommended actions
        recommended_actions = cls._generate_actions(
            health_trend, scores, alerts, overdue_capas, kpi_summary,
        )

        return ManagementReviewSummary(
            plant_id=plant_id,
            period_start=period_start,
            period_end=period_end,
            kpi_summary=kpi_summary,
            health_scores=scores,
            avg_health_score=avg_health,
            variance_alerts=alerts,
            open_capas=open_capas,
            overdue_capas=overdue_capas,
            health_trend=health_trend,
            kpi_trends=kpi_trends,
            key_findings=key_findings,
            recommended_actions=recommended_actions,
        )

    @staticmethod
    def _compute_kpi_trends(
        current: KPIMetrics | None,
        previous: KPIMetrics | None,
    ) -> dict[str, str]:
        """Compare current vs previous KPIs to determine trends."""
        trends: dict[str, str] = {}
        if current is None or previous is None:
            return trends

        def trend(current_val: float | None, previous_val: float | None, higher_is_better: bool) -> str:
            if current_val is None or previous_val is None:
                return "NO_DATA"
            diff = current_val - previous_val
            threshold = abs(previous_val) * 0.05 if previous_val != 0 else 1.0
            if abs(diff) < threshold:
                return "STABLE"
            if higher_is_better:
                return "IMPROVING" if diff > 0 else "DEGRADING"
            else:
                return "IMPROVING" if diff < 0 else "DEGRADING"

        trends["mtbf"] = trend(current.mtbf_days, previous.mtbf_days, True)
        trends["mttr"] = trend(current.mttr_hours, previous.mttr_hours, False)
        trends["availability"] = trend(current.availability_pct, previous.availability_pct, True)
        trends["schedule_compliance"] = trend(
            current.schedule_compliance_pct, previous.schedule_compliance_pct, True
        )
        trends["reactive_ratio"] = trend(
            current.reactive_ratio_pct, previous.reactive_ratio_pct, False
        )

        return trends

    @staticmethod
    def _generate_findings(
        avg_health: float,
        scores: list[AssetHealthScore],
        alerts: list[PlantVarianceAlert],
        open_capas: int,
        overdue_capas: int,
        kpis: KPIMetrics | None,
    ) -> list[str]:
        """Generate key findings for executive summary."""
        findings = []

        # Health overview
        if scores:
            critical_count = len([s for s in scores if s.health_class == "CRITICAL"])
            at_risk_count = len([s for s in scores if s.health_class == "AT_RISK"])
            findings.append(
                f"Portfolio health: {avg_health:.0f}/100 — "
                f"{critical_count} critical, {at_risk_count} at-risk assets"
            )

        # Variance alerts
        critical_alerts = [a for a in alerts if a.variance_level == VarianceLevel.CRITICAL]
        if critical_alerts:
            findings.append(
                f"{len(critical_alerts)} critical variance alert(s) detected across plant portfolio"
            )

        # CAPAs
        if overdue_capas > 0:
            findings.append(f"{overdue_capas} overdue CAPA item(s) require immediate attention")
        elif open_capas > 0:
            findings.append(f"{open_capas} open CAPA item(s) in progress")

        # KPI highlights
        if kpis:
            if kpis.availability_pct is not None:
                findings.append(f"Equipment availability: {kpis.availability_pct:.1f}%")
            if kpis.reactive_ratio_pct is not None and kpis.reactive_ratio_pct > 30:
                findings.append(
                    f"Reactive ratio at {kpis.reactive_ratio_pct:.1f}% — "
                    "target is below 20%"
                )

        return findings

    @staticmethod
    def _generate_actions(
        health_trend: str,
        scores: list[AssetHealthScore],
        alerts: list[PlantVarianceAlert],
        overdue_capas: int,
        kpis: KPIMetrics | None,
    ) -> list[str]:
        """Generate recommended actions for management."""
        actions = []

        # Degrading health
        if health_trend == "DEGRADING":
            actions.append("Investigate root cause of declining asset health scores")

        # Critical assets
        critical_assets = [s for s in scores if s.health_class == "CRITICAL"]
        if critical_assets:
            tags = ", ".join(s.equipment_tag for s in critical_assets[:3])
            actions.append(f"Prioritize intervention for critical assets: {tags}")

        # Variance alerts
        critical_alerts = [a for a in alerts if a.variance_level == VarianceLevel.CRITICAL]
        if critical_alerts:
            plants = ", ".join(a.plant_name for a in critical_alerts[:3])
            actions.append(f"Investigate performance deviation at: {plants}")

        # Overdue CAPAs
        if overdue_capas > 0:
            actions.append(f"Resolve {overdue_capas} overdue CAPA item(s)")

        # High reactive ratio
        if kpis and kpis.reactive_ratio_pct and kpis.reactive_ratio_pct > 30:
            actions.append("Increase preventive maintenance coverage to reduce reactive ratio")

        # Low PM compliance
        if kpis and kpis.pm_compliance_pct is not None and kpis.pm_compliance_pct < 80:
            actions.append(
                f"PM compliance at {kpis.pm_compliance_pct:.1f}% — "
                "review scheduling and resource allocation"
            )

        return actions
