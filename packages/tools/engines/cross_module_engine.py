"""Cross-Module Analytics Engine — Phase 6.

Correlates data across modules to provide integrated insights:
- Criticality vs failure frequency correlation
- Maintenance cost vs reliability metrics
- Health score vs backlog age correlation
- Bad actor overlap analysis (Jack-Knife + Pareto + RBI)

Deterministic — no LLM required.
"""

from __future__ import annotations

from datetime import datetime

from tools.models.schemas import (
    BadActorOverlap,
    CorrelationPoint,
    CorrelationResult,
    CorrelationType,
    CrossModuleSummary,
)

# Criticality rank map (higher = more critical)
_CRITICALITY_RANK: dict[str, int] = {
    "AA": 6, "A+": 5, "A": 4, "B": 3, "C": 2, "D": 1,
}


class CrossModuleEngine:
    """Cross-module correlation and analytics."""

    @staticmethod
    def correlate_criticality_failures(
        equipment_criticality: list[dict],
        failure_records: list[dict],
    ) -> CorrelationResult:
        """Correlate equipment criticality ranking with failure count."""
        # Count failures per equipment
        failure_counts: dict[str, int] = {}
        for rec in failure_records:
            eid = rec.get("equipment_id", "")
            failure_counts[eid] = failure_counts.get(eid, 0) + 1

        points: list[CorrelationPoint] = []
        for eq in equipment_criticality:
            eid = eq.get("equipment_id", "")
            crit = eq.get("criticality_class", eq.get("criticality", "D"))
            x = _CRITICALITY_RANK.get(str(crit), 1)
            y = failure_counts.get(eid, 0)
            points.append(CorrelationPoint(
                equipment_id=eid, x_value=float(x), y_value=float(y),
                label=f"{eid} ({crit})",
            ))

        coeff = _pearson(points)
        strength = _strength(coeff)
        insight = (
            "Higher criticality equipment tends to have more failures"
            if coeff > 0.3 else
            "No strong correlation between criticality and failure frequency"
        )

        return CorrelationResult(
            correlation_type=CorrelationType.CRITICALITY_FAILURES,
            coefficient=coeff,
            strength=strength,
            data_points=points,
            insight=insight,
        )

    @staticmethod
    def correlate_cost_reliability(
        cost_records: list[dict],
        reliability_kpis: list[dict],
    ) -> CorrelationResult:
        """Correlate maintenance cost with reliability metrics (MTBF)."""
        # Aggregate cost per equipment
        costs: dict[str, float] = {}
        for rec in cost_records:
            eid = rec.get("equipment_id", "")
            costs[eid] = costs.get(eid, 0) + float(rec.get("cost", 0))

        # Map MTBF per equipment
        mtbf_map: dict[str, float] = {}
        for kpi in reliability_kpis:
            eid = kpi.get("equipment_id", "")
            mtbf_map[eid] = float(kpi.get("mtbf_days", kpi.get("mtbf", 0)))

        points: list[CorrelationPoint] = []
        for eid in set(costs.keys()) & set(mtbf_map.keys()):
            points.append(CorrelationPoint(
                equipment_id=eid,
                x_value=costs[eid],
                y_value=mtbf_map[eid],
                label=eid,
            ))

        coeff = _pearson(points)
        strength = _strength(coeff)
        insight = (
            "Higher maintenance cost correlates with lower reliability"
            if coeff < -0.3 else
            "No strong inverse correlation between cost and reliability"
        )

        return CorrelationResult(
            correlation_type=CorrelationType.COST_RELIABILITY,
            coefficient=coeff,
            strength=strength,
            data_points=points,
            insight=insight,
        )

    @staticmethod
    def correlate_health_backlog(
        health_scores: list[dict],
        backlog_items: list[dict],
    ) -> CorrelationResult:
        """Correlate equipment health scores with open backlog count."""
        # Count backlog per equipment
        backlog_counts: dict[str, int] = {}
        for item in backlog_items:
            eid = item.get("equipment_id", "")
            if eid:
                backlog_counts[eid] = backlog_counts.get(eid, 0) + 1

        points: list[CorrelationPoint] = []
        for eq in health_scores:
            eid = eq.get("equipment_id", "")
            score = float(eq.get("composite_score", eq.get("health_score", 0)))
            backlog = float(backlog_counts.get(eid, 0))
            points.append(CorrelationPoint(
                equipment_id=eid,
                x_value=score,
                y_value=backlog,
                label=eid,
            ))

        coeff = _pearson(points)
        strength = _strength(coeff)
        insight = (
            "Lower health scores correlate with more open backlog items"
            if coeff < -0.3 else
            "No strong correlation between health score and backlog volume"
        )

        return CorrelationResult(
            correlation_type=CorrelationType.HEALTH_BACKLOG,
            coefficient=coeff,
            strength=strength,
            data_points=points,
            insight=insight,
        )

    @staticmethod
    def find_bad_actor_overlap(
        jackknife_result: dict | None = None,
        pareto_result: dict | None = None,
        rbi_result: dict | None = None,
    ) -> BadActorOverlap:
        """Find equipment that appears as bad actor in multiple analyses."""
        jk_acute: set[str] = set()
        pareto_bad: set[str] = set()
        rbi_high: set[str] = set()

        if jackknife_result:
            for pt in jackknife_result.get("points", []):
                if pt.get("zone") == "ACUTE":
                    jk_acute.add(pt.get("equipment_id", ""))

        if pareto_result:
            for item in pareto_result.get("items", []):
                if item.get("is_bad_actor"):
                    pareto_bad.add(item.get("equipment_id", ""))

        if rbi_result:
            for assessment in rbi_result.get("assessments", []):
                if assessment.get("risk_level") in ("HIGH", "CRITICAL"):
                    rbi_high.add(assessment.get("equipment_id", ""))

        all_sets = [jk_acute, pareto_bad, rbi_high]
        all_equipment = jk_acute | pareto_bad | rbi_high

        # Find overlap
        overlap_all = jk_acute & pareto_bad & rbi_high
        overlap_two: set[str] = set()
        for i in range(len(all_sets)):
            for j in range(i + 1, len(all_sets)):
                overlap_two |= (all_sets[i] & all_sets[j])
        overlap_two -= overlap_all

        # Priority: all three > two > one
        priority = sorted(overlap_all) + sorted(overlap_two) + sorted(
            all_equipment - overlap_all - overlap_two,
        )

        return BadActorOverlap(
            total_unique_bad_actors=len(all_equipment),
            jackknife_acute=sorted(jk_acute),
            pareto_bad_actors=sorted(pareto_bad),
            rbi_high_risk=sorted(rbi_high),
            overlap_all_three=sorted(overlap_all),
            overlap_any_two=sorted(overlap_two),
            priority_action_list=priority,
        )

    @staticmethod
    def generate_cross_module_summary(
        plant_id: str,
        correlations: list[CorrelationResult] | None = None,
        bad_actor_overlap: BadActorOverlap | None = None,
    ) -> CrossModuleSummary:
        """Generate a summary of cross-module analytics."""
        insights: list[str] = []
        actions: list[str] = []

        for corr in (correlations or []):
            if corr.insight:
                insights.append(corr.insight)
            if corr.strength in ("STRONG", "MODERATE"):
                actions.append(
                    f"Investigate {corr.correlation_type.value} correlation "
                    f"(r={corr.coefficient:.2f}, {corr.strength})"
                )

        if bad_actor_overlap:
            if bad_actor_overlap.overlap_all_three:
                ids = ", ".join(bad_actor_overlap.overlap_all_three[:5])
                insights.append(
                    f"{len(bad_actor_overlap.overlap_all_three)} equipment flagged across all three analyses: {ids}"
                )
                actions.append("Prioritize intervention for equipment flagged in all analyses")
            if bad_actor_overlap.total_unique_bad_actors > 0:
                insights.append(
                    f"{bad_actor_overlap.total_unique_bad_actors} unique bad actors identified across modules"
                )

        return CrossModuleSummary(
            plant_id=plant_id,
            correlations=correlations or [],
            bad_actor_overlap=bad_actor_overlap,
            key_insights=insights,
            recommended_actions=actions,
        )


# --- Helper functions ---

def _pearson(points: list[CorrelationPoint]) -> float:
    """Compute Pearson correlation coefficient."""
    n = len(points)
    if n < 2:
        return 0.0
    xs = [p.x_value for p in points]
    ys = [p.y_value for p in points]
    mean_x = sum(xs) / n
    mean_y = sum(ys) / n
    num = sum((x - mean_x) * (y - mean_y) for x, y in zip(xs, ys))
    den_x = sum((x - mean_x) ** 2 for x in xs) ** 0.5
    den_y = sum((y - mean_y) ** 2 for y in ys) ** 0.5
    if den_x == 0 or den_y == 0:
        return 0.0
    coeff = num / (den_x * den_y)
    return round(max(-1.0, min(1.0, coeff)), 4)


def _strength(coeff: float) -> str:
    """Classify correlation strength from coefficient."""
    abs_c = abs(coeff)
    if abs_c >= 0.7:
        return "STRONG"
    if abs_c >= 0.4:
        return "MODERATE"
    if abs_c >= 0.2:
        return "WEAK"
    return "NONE"
