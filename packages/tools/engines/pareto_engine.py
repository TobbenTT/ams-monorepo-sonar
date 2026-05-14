"""Pareto Analysis Engine — Phase 5 (REF-13 §7.5.3).

Identifies "bad actors" — the 20% of equipment causing 80%
of failures, costs, or downtime.

Deterministic — no LLM required.
"""

from collections import defaultdict
from datetime import datetime

from tools.models.schemas import ParetoItem, ParetoResult


class ParetoEngine:
    """Pareto (80/20) analysis for bad actor identification."""

    @staticmethod
    def analyze(
        plant_id: str,
        data: list[dict],
        metric_field: str,
        metric_type: str = "failures",
        id_field: str = "equipment_id",
        tag_field: str = "equipment_tag",
    ) -> ParetoResult:
        """Generic Pareto analysis on any metric.

        Sort by metric descending, calculate cumulative %, mark bad actors (<=80%).
        """
        if not data:
            return ParetoResult(plant_id=plant_id, metric_type=metric_type)

        sorted_data = sorted(data, key=lambda d: d.get(metric_field, 0), reverse=True)
        total = sum(d.get(metric_field, 0) for d in sorted_data)
        if total <= 0:
            return ParetoResult(plant_id=plant_id, metric_type=metric_type)

        items: list[ParetoItem] = []
        cumulative = 0.0
        bad_actor_count = 0

        for rank, d in enumerate(sorted_data, 1):
            value = d.get(metric_field, 0)
            cumulative += value
            cum_pct = round((cumulative / total) * 100, 1)
            is_bad = cum_pct <= 80 or (rank == 1 and cum_pct > 80)

            if is_bad:
                bad_actor_count += 1

            items.append(ParetoItem(
                equipment_id=d.get(id_field, ""),
                equipment_tag=d.get(tag_field, ""),
                metric_value=round(value, 2),
                cumulative_pct=cum_pct,
                rank=rank,
                is_bad_actor=is_bad,
            ))

        bad_actor_pct = round((bad_actor_count / len(items)) * 100, 1) if items else 0

        return ParetoResult(
            plant_id=plant_id,
            metric_type=metric_type,
            items=items,
            bad_actor_count=bad_actor_count,
            bad_actor_pct_of_total=bad_actor_pct,
        )

    @staticmethod
    def analyze_failures(
        plant_id: str,
        failure_records: list[dict],
    ) -> ParetoResult:
        """Pareto by failure count per equipment.

        Each record: {equipment_id, equipment_tag, ...}
        Aggregates count by equipment_id.
        """
        counts: dict[str, dict] = {}
        for r in failure_records:
            eid = r.get("equipment_id", "")
            if eid not in counts:
                counts[eid] = {
                    "equipment_id": eid,
                    "equipment_tag": r.get("equipment_tag", ""),
                    "failure_count": 0,
                }
            counts[eid]["failure_count"] += 1

        return ParetoEngine.analyze(
            plant_id, list(counts.values()),
            metric_field="failure_count", metric_type="failures",
        )

    @staticmethod
    def analyze_costs(
        plant_id: str,
        cost_records: list[dict],
    ) -> ParetoResult:
        """Pareto by total cost per equipment.

        Each record: {equipment_id, equipment_tag, cost, ...}
        Aggregates cost by equipment_id.
        """
        totals: dict[str, dict] = {}
        for r in cost_records:
            eid = r.get("equipment_id", "")
            if eid not in totals:
                totals[eid] = {
                    "equipment_id": eid,
                    "equipment_tag": r.get("equipment_tag", ""),
                    "total_cost": 0.0,
                }
            totals[eid]["total_cost"] += r.get("cost", 0.0)

        return ParetoEngine.analyze(
            plant_id, list(totals.values()),
            metric_field="total_cost", metric_type="cost",
        )

    @staticmethod
    def analyze_downtime(
        plant_id: str,
        downtime_records: list[dict],
    ) -> ParetoResult:
        """Pareto by total downtime hours per equipment.

        Each record: {equipment_id, equipment_tag, downtime_hours, ...}
        Aggregates downtime by equipment_id.
        """
        totals: dict[str, dict] = {}
        for r in downtime_records:
            eid = r.get("equipment_id", "")
            if eid not in totals:
                totals[eid] = {
                    "equipment_id": eid,
                    "equipment_tag": r.get("equipment_tag", ""),
                    "total_downtime": 0.0,
                }
            totals[eid]["total_downtime"] += r.get("downtime_hours", 0.0)

        return ParetoEngine.analyze(
            plant_id, list(totals.values()),
            metric_field="total_downtime", metric_type="downtime",
        )
