"""Spare Parts Criticality Engine — Phase 5 (REF-13 §7.5).

VED/FSN/ABC analysis for spare parts classification,
criticality scoring, and inventory optimization.

Deterministic — no LLM required.
"""

import math
from datetime import datetime

from tools.models.schemas import (
    SparePartCriticality, ConsumptionClass, CostClass,
    SparePartAnalysis, SparePartOptimizationResult,
)


class SparePartsEngine:
    """Classifies and optimizes spare parts inventory."""

    @staticmethod
    def classify_ved(
        equipment_criticality: str,
        failure_impact: str,
    ) -> SparePartCriticality:
        """VED classification based on equipment criticality and failure impact.

        VITAL: critical equipment, failure stops production
        ESSENTIAL: important but workaround exists
        DESIRABLE: convenience, no production impact
        """
        crit_upper = equipment_criticality.upper()
        impact_upper = failure_impact.upper()

        if crit_upper in ("HIGH", "CRITICAL", "A", "I") or impact_upper in ("PRODUCTION_STOP", "SAFETY"):
            return SparePartCriticality.VITAL
        if crit_upper in ("MEDIUM", "MODERATE", "B", "II") or impact_upper in ("PRODUCTION_REDUCED", "ENVIRONMENTAL"):
            return SparePartCriticality.ESSENTIAL
        return SparePartCriticality.DESIRABLE

    @staticmethod
    def classify_fsn(movements_per_year: float) -> ConsumptionClass:
        """FSN classification by consumption frequency.

        FAST: >12 movements/year
        SLOW: 1-12 movements/year
        NON: 0 movements/year
        """
        if movements_per_year > 12:
            return ConsumptionClass.FAST_MOVING
        if movements_per_year >= 1:
            return ConsumptionClass.SLOW_MOVING
        return ConsumptionClass.NON_MOVING

    @staticmethod
    def classify_abc(parts: list[dict]) -> list[tuple[str, CostClass]]:
        """ABC classification by annual cost (Pareto-based).

        A: top items contributing to 80% of total cost
        B: next items contributing to next 15%
        C: remaining items contributing to last 5%
        """
        if not parts:
            return []

        sorted_parts = sorted(parts, key=lambda p: p.get("annual_cost", 0), reverse=True)
        total_cost = sum(p.get("annual_cost", 0) for p in sorted_parts)
        if total_cost <= 0:
            return [(p.get("part_id", ""), CostClass.C_LOW) for p in sorted_parts]

        results = []
        cumulative = 0.0
        for p in sorted_parts:
            cumulative += p.get("annual_cost", 0)
            pct = (cumulative / total_cost) * 100
            if pct <= 80:
                results.append((p.get("part_id", ""), CostClass.A_HIGH))
            elif pct <= 95:
                results.append((p.get("part_id", ""), CostClass.B_MEDIUM))
            else:
                results.append((p.get("part_id", ""), CostClass.C_LOW))
        return results

    @staticmethod
    def calculate_criticality_score(
        ved: SparePartCriticality,
        fsn: ConsumptionClass,
        abc: CostClass,
    ) -> float:
        """Weighted criticality score 0-100.

        VED weight=50, FSN weight=25, ABC weight=25.
        """
        ved_scores = {
            SparePartCriticality.VITAL: 100,
            SparePartCriticality.ESSENTIAL: 60,
            SparePartCriticality.DESIRABLE: 20,
        }
        fsn_scores = {
            ConsumptionClass.FAST_MOVING: 100,
            ConsumptionClass.SLOW_MOVING: 50,
            ConsumptionClass.NON_MOVING: 10,
        }
        abc_scores = {
            CostClass.A_HIGH: 100,
            CostClass.B_MEDIUM: 60,
            CostClass.C_LOW: 20,
        }

        score = (
            ved_scores[ved] * 0.50
            + fsn_scores[fsn] * 0.25
            + abc_scores[abc] * 0.25
        )
        return round(score, 1)

    @staticmethod
    def calculate_stock_levels(
        daily_consumption: float,
        lead_time_days: int,
        service_level: float = 0.95,
        demand_std_dev: float | None = None,
    ) -> dict:
        """Calculate min stock, reorder point, and max stock.

        Uses safety stock = Z × σ × √lead_time.
        EOQ approximation for max stock.
        """
        if daily_consumption <= 0:
            return {
                "safety_stock": 0,
                "reorder_point": 0,
                "min_stock": 0,
                "max_stock": 0,
            }

        z_scores = {0.90: 1.28, 0.95: 1.645, 0.99: 2.33}
        z = z_scores.get(service_level, 1.645)

        sigma = demand_std_dev if demand_std_dev is not None else daily_consumption * 0.3
        safety_stock = max(1, round(z * sigma * math.sqrt(lead_time_days)))
        reorder_point = round(daily_consumption * lead_time_days + safety_stock)

        eoq = max(1, round(math.sqrt(2 * daily_consumption * 365 * 10 / 1)))
        max_stock = reorder_point + eoq

        return {
            "safety_stock": safety_stock,
            "reorder_point": reorder_point,
            "min_stock": safety_stock,
            "max_stock": max_stock,
        }

    @staticmethod
    def optimize_inventory(
        plant_id: str,
        parts: list[dict],
    ) -> SparePartOptimizationResult:
        """Full VED+FSN+ABC analysis and stock optimization for all parts.

        Each part dict should have:
            part_id, equipment_id, description,
            equipment_criticality, failure_impact,
            movements_per_year, annual_cost, unit_cost,
            daily_consumption, lead_time_days
        """
        abc_results = SparePartsEngine.classify_abc(parts)
        abc_map = dict(abc_results)

        analyses = []
        total_value = 0.0
        overstock_value = 0.0

        for p in parts:
            part_id = p.get("part_id", "")
            ved = SparePartsEngine.classify_ved(
                p.get("equipment_criticality", "LOW"),
                p.get("failure_impact", "NONE"),
            )
            fsn = SparePartsEngine.classify_fsn(p.get("movements_per_year", 0))
            abc = abc_map.get(part_id, CostClass.C_LOW)
            score = SparePartsEngine.calculate_criticality_score(ved, fsn, abc)
            stock = SparePartsEngine.calculate_stock_levels(
                p.get("daily_consumption", 0),
                p.get("lead_time_days", 30),
            )
            unit_cost = p.get("unit_cost", 0)
            current_stock = p.get("current_stock", 0)
            total_value += current_stock * unit_cost
            if current_stock > stock["max_stock"]:
                overstock_value += (current_stock - stock["max_stock"]) * unit_cost

            analyses.append(SparePartAnalysis(
                part_id=part_id,
                equipment_id=p.get("equipment_id", ""),
                description=p.get("description", ""),
                ved_class=ved,
                fsn_class=fsn,
                abc_class=abc,
                criticality_score=score,
                lead_time_days=p.get("lead_time_days", 30),
                unit_cost=unit_cost,
                recommended_min_stock=stock["min_stock"],
                recommended_max_stock=stock["max_stock"],
                reorder_point=stock["reorder_point"],
            ))

        reduction_pct = (overstock_value / total_value * 100) if total_value > 0 else 0.0

        return SparePartOptimizationResult(
            plant_id=plant_id,
            total_parts=len(analyses),
            results=analyses,
            total_inventory_value=round(total_value, 2),
            recommended_reduction_pct=round(min(reduction_pct, 100.0), 1),
        )
