"""
Asset Health Score Engine — REF-12 Recommendation 4
Combines 5 dimensions into a composite Asset Health Index.
Validated by SQM's Cristian Ramirez at GECAMIN MAPLA 2024 (S6).

Dimensions:
1. Criticality Score — from CriticalityEngine
2. Backlog Pressure — ratio of deferred work to capacity
3. Strategy Coverage — % of failure modes with approved strategies
4. Condition Status — latest condition monitoring indicators
5. Execution Compliance — are plans being executed on time?
"""

from datetime import datetime

from tools.models.schemas import (
    AssetHealthScore,
    HealthDimension,
    HealthScoreDimension,
    RiskClass,
)


class HealthScoreEngine:
    """Calculates composite Asset Health Index from multiple data sources."""

    # Default weights (sum = 1.0) — can be customized per plant
    DEFAULT_WEIGHTS = {
        HealthDimension.CRITICALITY: 0.25,
        HealthDimension.BACKLOG_PRESSURE: 0.20,
        HealthDimension.STRATEGY_COVERAGE: 0.25,
        HealthDimension.CONDITION_STATUS: 0.15,
        HealthDimension.EXECUTION_COMPLIANCE: 0.15,
    }

    @staticmethod
    def criticality_to_score(risk_class: RiskClass) -> float:
        """Convert risk class to 0-100 health score (inverse: higher criticality = lower health)."""
        mapping = {
            RiskClass.I_LOW: 90.0,
            RiskClass.II_MEDIUM: 70.0,
            RiskClass.III_HIGH: 40.0,
            RiskClass.IV_CRITICAL: 15.0,
        }
        return mapping.get(risk_class, 50.0)

    @staticmethod
    def backlog_pressure_score(
        pending_hours: float,
        capacity_hours_per_week: float,
        max_weeks_threshold: float = 8.0,
    ) -> float:
        """Calculate backlog pressure score (0-100, higher = healthier).
        0 pending hours = 100 (no pressure).
        >= max_weeks_threshold weeks of backlog = 0 (extreme pressure).
        """
        if capacity_hours_per_week <= 0:
            return 0.0
        weeks_of_backlog = pending_hours / capacity_hours_per_week
        score = max(0.0, 100.0 * (1.0 - weeks_of_backlog / max_weeks_threshold))
        return round(min(100.0, score), 1)

    @staticmethod
    def strategy_coverage_score(
        total_failure_modes: int,
        failure_modes_with_strategy: int,
    ) -> float:
        """Percentage of failure modes that have an approved maintenance strategy."""
        if total_failure_modes == 0:
            return 0.0
        return round(100.0 * failure_modes_with_strategy / total_failure_modes, 1)

    @staticmethod
    def condition_status_score(
        alerts_active: int,
        critical_alerts: int,
        max_alerts_threshold: int = 10,
    ) -> float:
        """Score based on active condition monitoring alerts.
        0 alerts = 100 (healthy). max_alerts = 0 (degraded).
        Critical alerts have 3x weight.
        """
        weighted_alerts = alerts_active + (critical_alerts * 2)
        score = max(0.0, 100.0 * (1.0 - weighted_alerts / max_alerts_threshold))
        return round(min(100.0, score), 1)

    @staticmethod
    def execution_compliance_score(
        planned_wo: int,
        executed_on_time: int,
    ) -> float:
        """Percentage of planned work orders executed on schedule."""
        if planned_wo == 0:
            return 100.0  # No plans = no non-compliance
        return round(100.0 * executed_on_time / planned_wo, 1)

    @classmethod
    def calculate(
        cls,
        node_id: str,
        plant_id: str,
        equipment_tag: str,
        risk_class: RiskClass,
        pending_backlog_hours: float = 0.0,
        capacity_hours_per_week: float = 40.0,
        total_failure_modes: int = 0,
        fm_with_strategy: int = 0,
        active_alerts: int = 0,
        critical_alerts: int = 0,
        planned_wo: int = 0,
        executed_on_time: int = 0,
        weights: dict[HealthDimension, float] | None = None,
    ) -> AssetHealthScore:
        """Calculate full Asset Health Score with all 5 dimensions."""
        w = weights or cls.DEFAULT_WEIGHTS

        dimensions = [
            HealthScoreDimension(
                dimension=HealthDimension.CRITICALITY,
                score=cls.criticality_to_score(risk_class),
                weight=w.get(HealthDimension.CRITICALITY, 0.25),
                raw_value=None,
                details=f"Risk class: {risk_class.value}",
            ),
            HealthScoreDimension(
                dimension=HealthDimension.BACKLOG_PRESSURE,
                score=cls.backlog_pressure_score(pending_backlog_hours, capacity_hours_per_week),
                weight=w.get(HealthDimension.BACKLOG_PRESSURE, 0.20),
                raw_value=pending_backlog_hours,
                details=f"{pending_backlog_hours:.0f}h pending / {capacity_hours_per_week:.0f}h/week capacity",
            ),
            HealthScoreDimension(
                dimension=HealthDimension.STRATEGY_COVERAGE,
                score=cls.strategy_coverage_score(total_failure_modes, fm_with_strategy),
                weight=w.get(HealthDimension.STRATEGY_COVERAGE, 0.25),
                raw_value=float(fm_with_strategy) if total_failure_modes else None,
                details=f"{fm_with_strategy}/{total_failure_modes} failure modes covered",
            ),
            HealthScoreDimension(
                dimension=HealthDimension.CONDITION_STATUS,
                score=cls.condition_status_score(active_alerts, critical_alerts),
                weight=w.get(HealthDimension.CONDITION_STATUS, 0.15),
                raw_value=float(active_alerts),
                details=f"{active_alerts} active alerts ({critical_alerts} critical)",
            ),
            HealthScoreDimension(
                dimension=HealthDimension.EXECUTION_COMPLIANCE,
                score=cls.execution_compliance_score(planned_wo, executed_on_time),
                weight=w.get(HealthDimension.EXECUTION_COMPLIANCE, 0.15),
                raw_value=float(executed_on_time) if planned_wo else None,
                details=f"{executed_on_time}/{planned_wo} WOs on time",
            ),
        ]

        # Composite is auto-calculated by model_validator
        health = AssetHealthScore(
            node_id=node_id,
            plant_id=plant_id,
            equipment_tag=equipment_tag,
            dimensions=dimensions,
        )

        # Generate recommendations based on weak dimensions
        health.recommendations = cls._generate_recommendations(dimensions)
        return health

    @staticmethod
    def _generate_recommendations(dimensions: list[HealthScoreDimension]) -> list[str]:
        """Generate actionable recommendations for dimensions scoring below threshold."""
        recs = []
        for dim in dimensions:
            if dim.score < 50:
                if dim.dimension == HealthDimension.CRITICALITY:
                    recs.append("High criticality asset — review risk mitigation strategies")
                elif dim.dimension == HealthDimension.BACKLOG_PRESSURE:
                    recs.append("Excessive backlog — prioritize scheduling or increase capacity")
                elif dim.dimension == HealthDimension.STRATEGY_COVERAGE:
                    recs.append("Low strategy coverage — complete FMEA and assign maintenance strategies")
                elif dim.dimension == HealthDimension.CONDITION_STATUS:
                    recs.append("Active condition alerts — investigate and resolve monitoring alarms")
                elif dim.dimension == HealthDimension.EXECUTION_COMPLIANCE:
                    recs.append("Low execution compliance — review scheduling and resource allocation")
        return recs

    @classmethod
    def determine_trend(
        cls,
        current_score: float,
        previous_score: float,
        threshold: float = 5.0,
    ) -> str:
        """Compare current vs previous composite score to determine trend."""
        delta = current_score - previous_score
        if delta > threshold:
            return "IMPROVING"
        elif delta < -threshold:
            return "DEGRADING"
        return "STABLE"
