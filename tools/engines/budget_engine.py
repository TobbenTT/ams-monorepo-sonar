"""Budget Tracking & Financial Summary Engine (GAP-W04).

Tracks maintenance budgets (planned vs. actual), detects variance alerts,
generates executive-level financial summaries, and forecasts near-term spend.

Deterministic — no LLM required.
"""

from __future__ import annotations

import uuid
from datetime import datetime

from tools.models.schemas import (
    BudgetItem,
    BudgetSummary,
    BudgetVarianceAlert,
    CurrencyCode,
    FinancialCategory,
    FinancialImpact,
    FinancialSummary,
    ManHourSavingsReport,
    ROIResult,
)


class BudgetEngine:
    """Maintenance budget tracking and financial aggregation."""

    @staticmethod
    def track_budget(plant_id: str, items: list[dict]) -> BudgetSummary:
        """Aggregate budget items into a summary with variance per category.

        Args:
            plant_id: Plant identifier.
            items: List of BudgetItem dicts.
        """
        budget_items = [BudgetItem(**item) if isinstance(item, dict) else item for item in items]

        total_planned = 0.0
        total_actual = 0.0
        by_category: dict[str, dict] = {}
        over_budget: list[str] = []

        for item in budget_items:
            total_planned += item.planned_amount
            total_actual += item.actual_amount

            cat = item.category.value if isinstance(item.category, FinancialCategory) else item.category
            if cat not in by_category:
                by_category[cat] = {"planned": 0.0, "actual": 0.0, "variance": 0.0, "variance_pct": 0.0}
            by_category[cat]["planned"] += item.planned_amount
            by_category[cat]["actual"] += item.actual_amount

        # Compute variance per category
        for cat, data in by_category.items():
            data["variance"] = round(data["actual"] - data["planned"], 2)
            data["variance_pct"] = (
                round((data["variance"] / data["planned"]) * 100, 1)
                if data["planned"] > 0
                else 0.0
            )
            if data["variance_pct"] > 10.0:
                over_budget.append(cat)

        total_variance = round(total_actual - total_planned, 2)
        variance_pct = round((total_variance / total_planned) * 100, 1) if total_planned > 0 else 0.0

        # Recommendations
        recommendations: list[str] = []
        if variance_pct > 15:
            recommendations.append(f"Total budget overrun {variance_pct:.1f}%: immediate review required")
        elif variance_pct > 5:
            recommendations.append(f"Budget trending over by {variance_pct:.1f}%: monitor closely")
        elif variance_pct < -10:
            recommendations.append(f"Significant underspend ({variance_pct:.1f}%): verify scope completion")

        for cat in over_budget:
            recommendations.append(f"{cat} is over budget by {by_category[cat]['variance_pct']:.1f}%")

        return BudgetSummary(
            plant_id=plant_id,
            total_planned=round(total_planned, 2),
            total_actual=round(total_actual, 2),
            total_variance=total_variance,
            variance_pct=variance_pct,
            by_category=by_category,
            items=budget_items,
            over_budget_categories=over_budget,
            recommendations=recommendations,
        )

    @staticmethod
    def detect_variance_alerts(
        summary: BudgetSummary,
        threshold_pct: float = 10.0,
    ) -> list[BudgetVarianceAlert]:
        """Generate alerts for categories exceeding variance threshold.

        WARNING if variance > threshold; CRITICAL if > 2× threshold.
        """
        alerts: list[BudgetVarianceAlert] = []

        for cat, data in summary.by_category.items():
            vpct = abs(data.get("variance_pct", 0.0))
            if vpct <= threshold_pct:
                continue

            severity = "CRITICAL" if vpct > threshold_pct * 2 else "WARNING"
            direction = "over" if data.get("variance", 0) > 0 else "under"
            message = f"{cat} is {vpct:.1f}% {direction} budget (planned: {data['planned']:,.0f}, actual: {data['actual']:,.0f})"

            try:
                cat_enum = FinancialCategory(cat)
            except ValueError:
                cat_enum = FinancialCategory.OVERHEAD

            alerts.append(BudgetVarianceAlert(
                alert_id=str(uuid.uuid4()),
                plant_id=summary.plant_id,
                category=cat_enum,
                planned=data["planned"],
                actual=data["actual"],
                variance_pct=data["variance_pct"],
                threshold_pct=threshold_pct,
                severity=severity,
                message=message,
            ))

        return sorted(alerts, key=lambda a: abs(a.variance_pct), reverse=True)

    @staticmethod
    def generate_financial_summary(
        plant_id: str,
        budget_summary: BudgetSummary | None = None,
        roi_result: ROIResult | None = None,
        financial_impacts: list[FinancialImpact] | None = None,
        man_hours_report: ManHourSavingsReport | None = None,
    ) -> FinancialSummary:
        """Consolidate all financial data into an executive-level summary."""
        impacts = financial_impacts or []

        # Top cost drivers sorted by total_annual_impact
        top_drivers = sorted(impacts, key=lambda x: x.total_annual_impact, reverse=True)[:5]

        total_budget = budget_summary.total_planned if budget_summary else 0.0
        total_spend = budget_summary.total_actual if budget_summary else 0.0
        budget_var = budget_summary.variance_pct if budget_summary else 0.0

        total_avoided = roi_result.annual_net_savings if roi_result else 0.0
        total_mh_saved = man_hours_report.hours_saved if man_hours_report else 0.0

        # Resource productivity multiplier
        prod_mult = 1.0
        if man_hours_report and man_hours_report.ai_assisted_man_hours > 0:
            prod_mult = round(
                man_hours_report.traditional_man_hours / man_hours_report.ai_assisted_man_hours, 2
            )

        recommendations: list[str] = []
        if roi_result:
            recommendations.append(roi_result.recommendation)
        if budget_summary:
            recommendations.extend(budget_summary.recommendations)
        if man_hours_report and man_hours_report.savings_pct > 0:
            recommendations.append(
                f"AI-assisted workflow saves {man_hours_report.savings_pct:.0f}% of man-hours"
            )

        return FinancialSummary(
            plant_id=plant_id,
            total_maintenance_budget=round(total_budget, 2),
            total_actual_spend=round(total_spend, 2),
            budget_variance_pct=budget_var,
            total_avoided_cost=round(total_avoided, 2),
            total_man_hours_saved=round(total_mh_saved, 2),
            resource_productivity_multiplier=prod_mult,
            roi_summary=roi_result,
            top_cost_drivers=top_drivers,
            budget_summary=budget_summary,
            recommendations=recommendations,
        )

    @staticmethod
    def forecast_budget(
        items: list[BudgetItem],
        months_ahead: int = 3,
    ) -> list[BudgetItem]:
        """Forecast near-term budget using linear extrapolation from actual spend.

        Creates one projected BudgetItem per category for the forecast period.
        """
        if not items or months_ahead <= 0:
            return []

        # Aggregate actual spend per category
        cat_totals: dict[str, float] = {}
        cat_planned: dict[str, float] = {}
        for item in items:
            cat = item.category.value if isinstance(item.category, FinancialCategory) else item.category
            cat_totals[cat] = cat_totals.get(cat, 0.0) + item.actual_amount
            cat_planned[cat] = cat_planned.get(cat, 0.0) + item.planned_amount

        # Determine how many months the actuals span (use items or default 12)
        actual_months = 12  # Default assumption: items represent 1 year

        forecasts: list[BudgetItem] = []
        for cat, actual in cat_totals.items():
            monthly_rate = actual / actual_months if actual_months > 0 else 0.0
            projected = round(monthly_rate * months_ahead, 2)
            planned = round((cat_planned.get(cat, 0.0) / 12) * months_ahead, 2)

            forecasts.append(BudgetItem(
                item_id=str(uuid.uuid4()),
                plant_id=items[0].plant_id if items else "",
                category=FinancialCategory(cat) if cat in FinancialCategory.__members__.values() else FinancialCategory.OVERHEAD,
                description=f"Forecast ({months_ahead}mo): {cat}",
                planned_amount=planned,
                actual_amount=projected,
                variance=round(projected - planned, 2),
                variance_pct=round(((projected - planned) / planned) * 100, 1) if planned > 0 else 0.0,
            ))

        return forecasts
