"""Defect Elimination KPI Engine — Phase 6 (G12 gap closure).

Standalone engine for 5 DE KPIs with trend analysis and benchmarking.
Wraps RCAEngine.compute_de_kpis() and adds multi-period trending,
program health assessment, and plant comparison.

Deterministic — no LLM required.
"""

from __future__ import annotations

from tools.engines.rca_engine import RCAEngine
from tools.models.schemas import (
    DEKPIInput,
    DEKPIs,
    DEKPITrend,
    DEProgramHealth,
)


class DEKPIEngine:
    """Defect Elimination KPI analysis with trends and program health."""

    @staticmethod
    def calculate(input_data: DEKPIInput) -> DEKPIs:
        """Compute 5 DE KPIs by delegating to RCAEngine.compute_de_kpis."""
        return RCAEngine.compute_de_kpis(
            plant_id=input_data.plant_id,
            period_start=input_data.period_start,
            period_end=input_data.period_end,
            events_reported=input_data.events_reported,
            events_required=input_data.events_required,
            meetings_held=input_data.meetings_held,
            meetings_required=input_data.meetings_required,
            actions_implemented=input_data.actions_implemented,
            actions_planned=input_data.actions_planned,
            savings_achieved=input_data.savings_achieved,
            savings_target=input_data.savings_target,
            failures_current=input_data.failures_current,
            failures_previous=input_data.failures_previous,
        )

    @staticmethod
    def calculate_trends(
        plant_id: str,
        current: DEKPIs,
        previous_periods: list[DEKPIs],
    ) -> DEKPITrend:
        """Compare current KPI values against previous periods to determine trends."""
        if not previous_periods:
            return DEKPITrend(
                plant_id=plant_id,
                period_count=1,
                kpi_trends={k.name: "STABLE" for k in current.kpis},
                overall_trend="STABLE",
            )

        # Build map of previous period averages per KPI name
        prev_avgs: dict[str, float] = {}
        for kpi in current.kpis:
            values = []
            for period in previous_periods:
                for pk in period.kpis:
                    if pk.name == kpi.name and pk.value is not None:
                        values.append(pk.value)
            if values:
                prev_avgs[kpi.name] = sum(values) / len(values)

        # Determine per-KPI trend
        kpi_trends: dict[str, str] = {}
        improving_count = 0
        degrading_count = 0

        for kpi in current.kpis:
            if kpi.value is None or kpi.name not in prev_avgs:
                kpi_trends[kpi.name] = "NO_DATA"
                continue
            diff = kpi.value - prev_avgs[kpi.name]
            threshold = max(abs(prev_avgs[kpi.name]) * 0.05, 1.0)
            if diff > threshold:
                kpi_trends[kpi.name] = "IMPROVING"
                improving_count += 1
            elif diff < -threshold:
                kpi_trends[kpi.name] = "DEGRADING"
                degrading_count += 1
            else:
                kpi_trends[kpi.name] = "STABLE"

        if improving_count > degrading_count:
            overall = "IMPROVING"
        elif degrading_count > improving_count:
            overall = "DEGRADING"
        else:
            overall = "STABLE"

        return DEKPITrend(
            plant_id=plant_id,
            period_count=len(previous_periods) + 1,
            kpi_trends=kpi_trends,
            overall_trend=overall,
        )

    @staticmethod
    def assess_program_health(plant_id: str, de_kpis: DEKPIs) -> DEProgramHealth:
        """Assess overall DE program maturity based on KPI performance."""
        # Weighted scoring: each KPI contributes up to 20 points (5 KPIs × 20 = 100)
        score = 0.0
        strengths: list[str] = []
        improvements: list[str] = []

        targets = {
            "event_reporting_compliance": 95.0,
            "meeting_compliance": 90.0,
            "implementation_progress": 80.0,
            "savings_effectiveness": 70.0,
            "frequency_reduction": 10.0,
        }

        for kpi in de_kpis.kpis:
            target = targets.get(kpi.name, 80.0)
            if kpi.value is None:
                improvements.append(f"{kpi.name}: no data available")
                continue

            ratio = min(kpi.value / target, 1.5) if target > 0 else 0
            points = min(ratio * 20, 20)
            score += points

            if kpi.value >= target:
                strengths.append(f"{kpi.name}: {kpi.value:.1f}% (target {target:.0f}%)")
            else:
                improvements.append(f"{kpi.name}: {kpi.value:.1f}% (target {target:.0f}%)")

        score = round(min(score, 100.0), 1)

        if score >= 80:
            maturity = "OPTIMIZING"
        elif score >= 60:
            maturity = "ESTABLISHED"
        elif score >= 40:
            maturity = "DEVELOPING"
        else:
            maturity = "INITIAL"

        return DEProgramHealth(
            plant_id=plant_id,
            program_score=score,
            maturity_level=maturity,
            strengths=strengths,
            improvement_areas=improvements,
        )

    @staticmethod
    def compare_plants(plant_results: list[DEKPIs]) -> list[dict]:
        """Rank plants by overall DE KPI compliance (descending)."""
        ranked = sorted(plant_results, key=lambda r: r.overall_compliance, reverse=True)
        return [
            {
                "rank": i + 1,
                "plant_id": r.plant_id,
                "overall_compliance": r.overall_compliance,
                "kpi_count": len(r.kpis),
            }
            for i, r in enumerate(ranked)
        ]
