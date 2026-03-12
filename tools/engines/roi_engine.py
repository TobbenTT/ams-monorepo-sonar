"""ROI / Financial Impact Calculator (GAP-W04).

Evaluates return on investment for maintenance improvement projects:
NPV, payback period, BCR, IRR, man-hours saved, per-equipment financial impact.

Deterministic — no LLM required.
"""

from __future__ import annotations

import uuid
from datetime import date, datetime

from tools.models.schemas import (
    CurrencyCode,
    FinancialImpact,
    ManHourSavingsReport,
    ROIInput,
    ROIResult,
    ROIStatus,
)


def _npv_annuity(annual_amount: float, rate: float, years: int) -> float:
    """Present value of an annuity (same formula as lcc_engine)."""
    if rate <= 0 or years <= 0:
        return annual_amount * years
    return annual_amount * (1 - (1 + rate) ** (-years)) / rate


def _calculate_irr(
    investment: float,
    annual_net_savings: float,
    horizon: int,
    max_iterations: int = 100,
    tolerance: float = 1e-6,
) -> float | None:
    """Internal Rate of Return via bisection method.

    Returns the rate where NPV = 0, or None if no convergence.
    """
    if annual_net_savings <= 0 or investment <= 0 or horizon <= 0:
        return None

    low, high = 0.0, 5.0  # 0% to 500%

    for _ in range(max_iterations):
        mid = (low + high) / 2
        npv = -investment + _npv_annuity(annual_net_savings, mid, horizon)

        if abs(npv) < tolerance:
            return round(mid * 100, 2)
        if npv > 0:
            low = mid
        else:
            high = mid

    return round(((low + high) / 2) * 100, 2)


class ROIEngine:
    """Return on Investment calculator for maintenance projects."""

    @staticmethod
    def calculate_roi(inp: ROIInput) -> ROIResult:
        """Calculate ROI with NPV, payback period, BCR, and IRR.

        Formulas:
            gross_savings = downtime_avoided + labor_saved + material_saved
            net_savings = gross_savings - operating_cost_increase
            npv = -investment + Σ(net_savings / (1+r)^t)
            payback = investment / net_savings
            bcr = (npv + investment) / investment
            roi = (npv / investment) × 100
        """
        gross = (
            inp.annual_avoided_downtime_hours * inp.hourly_production_value
            + inp.annual_labor_savings_hours * inp.labor_cost_per_hour
            + inp.annual_material_savings
        )
        net = gross - inp.annual_operating_cost_increase

        # NPV
        r = inp.discount_rate
        horizon = inp.analysis_horizon_years
        npv_savings = _npv_annuity(net, r, horizon) if net != 0 else 0.0
        npv = -inp.investment_cost + npv_savings

        # Payback period
        payback = None
        if net > 0 and inp.investment_cost > 0:
            payback = round(inp.investment_cost / net, 2)

        # Benefit-Cost Ratio
        bcr = 0.0
        if inp.investment_cost > 0:
            bcr = round((npv + inp.investment_cost) / inp.investment_cost, 2)

        # ROI %
        roi_pct = 0.0
        if inp.investment_cost > 0:
            roi_pct = round((npv / inp.investment_cost) * 100, 2)

        # IRR
        irr = _calculate_irr(inp.investment_cost, net, horizon)

        # Cumulative savings by year
        cumulative: list[float] = []
        total = -inp.investment_cost
        for year in range(1, horizon + 1):
            discounted = net / ((1 + r) ** year) if r > 0 else net
            total += discounted
            cumulative.append(round(total, 2))

        # Recommendation
        if bcr >= 2.0:
            recommendation = "Strong ROI: investment highly justified"
        elif bcr >= 1.0:
            recommendation = "Positive ROI: investment justified"
        elif bcr > 0:
            recommendation = "Marginal ROI: review scope for cost reduction"
        else:
            recommendation = "Negative ROI: investment not justified at current parameters"

        return ROIResult(
            project_id=inp.project_id,
            plant_id=inp.plant_id,
            investment_cost=inp.investment_cost,
            annual_gross_savings=round(gross, 2),
            annual_net_savings=round(net, 2),
            npv=round(npv, 2),
            payback_period_years=payback,
            bcr=bcr,
            irr_pct=irr,
            roi_pct=roi_pct,
            cumulative_savings_by_year=cumulative,
            status=ROIStatus.PROJECTED,
            recommendation=recommendation,
            currency=inp.currency,
        )

    @staticmethod
    def compare_scenarios(inputs: list[ROIInput]) -> list[ROIResult]:
        """Calculate ROI for each scenario, return sorted by NPV descending."""
        results = [ROIEngine.calculate_roi(inp) for inp in inputs]
        return sorted(results, key=lambda r: r.npv, reverse=True)

    @staticmethod
    def calculate_financial_impact(
        equipment_id: str,
        failure_rate: float,
        cost_per_failure: float,
        cost_per_pm: float,
        annual_pm_count: int,
        production_value_per_hour: float,
        avg_downtime_hours: float,
        failure_mode_id: str = "",
    ) -> FinancialImpact:
        """Calculate annualized financial impact for one equipment/failure mode."""
        annual_failure_cost = failure_rate * cost_per_failure
        annual_pm_cost = cost_per_pm * annual_pm_count
        annual_production_loss = failure_rate * avg_downtime_hours * production_value_per_hour
        total = annual_failure_cost + annual_pm_cost + annual_production_loss

        return FinancialImpact(
            impact_id=str(uuid.uuid4()),
            equipment_id=equipment_id,
            failure_mode_id=failure_mode_id,
            annual_failure_cost=round(annual_failure_cost, 2),
            annual_pm_cost=round(annual_pm_cost, 2),
            annual_downtime_hours=round(failure_rate * avg_downtime_hours, 2),
            production_loss_per_hour=production_value_per_hour,
            annual_production_loss=round(annual_production_loss, 2),
            total_annual_impact=round(total, 2),
        )

    @staticmethod
    def calculate_man_hours_saved(
        traditional_hours: dict[str, float],
        ai_hours: dict[str, float],
        labor_rate: float,
        plant_id: str = "",
        period_start: date | None = None,
        period_end: date | None = None,
    ) -> ManHourSavingsReport:
        """Calculate man-hours saved: traditional approach vs. AI-assisted.

        Args:
            traditional_hours: {"planning": 100, "diagnosis": 80, ...}
            ai_hours: {"planning": 50, "diagnosis": 30, ...}
            labor_rate: Cost per man-hour (USD).
        """
        total_traditional = sum(traditional_hours.values())
        total_ai = sum(ai_hours.values())
        saved = max(0.0, total_traditional - total_ai)
        pct = round((saved / total_traditional) * 100, 1) if total_traditional > 0 else 0.0

        by_activity: dict[str, float] = {}
        for activity in set(traditional_hours) | set(ai_hours):
            trad = traditional_hours.get(activity, 0.0)
            ai = ai_hours.get(activity, 0.0)
            by_activity[activity] = round(max(0.0, trad - ai), 2)

        return ManHourSavingsReport(
            plant_id=plant_id,
            period_start=period_start,
            period_end=period_end,
            traditional_man_hours=round(total_traditional, 2),
            ai_assisted_man_hours=round(total_ai, 2),
            hours_saved=round(saved, 2),
            savings_pct=pct,
            cost_equivalent=round(saved * labor_rate, 2),
            by_activity=by_activity,
        )
