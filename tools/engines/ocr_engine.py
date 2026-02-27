"""Optimum Cost-Risk (OCR) Engine — Phase 5 (REF-13 §7.5.1).

Optimizes maintenance frequency by balancing cost of prevention
vs risk of failure. Uses Weibull reliability for failure probability.

Deterministic — no LLM required.
"""

import math

from tools.models.schemas import OCRAnalysisInput, OCRAnalysisResult


class OCREngine:
    """Optimum Cost-Risk analysis for maintenance interval selection."""

    @staticmethod
    def calculate_optimal_interval(
        inp: OCRAnalysisInput,
        beta: float = 2.0,
        eta: float | None = None,
    ) -> OCRAnalysisResult:
        """Find the PM interval that minimizes total cost.

        Total cost = cost_of_PM(interval) + cost_of_failure(interval)
        cost_of_PM = cost_per_pm × (365 / interval)
        cost_of_failure = failure_rate × cost_per_failure × (1 - R(interval))
        R(t) = exp(-(t/eta)^beta)  — Weibull reliability

        Sweeps intervals from 7 to 730 days to find minimum.
        """
        if eta is None:
            eta = (365.0 / inp.failure_rate) if inp.failure_rate > 0 else 365.0

        best_interval = inp.current_pm_interval_days
        best_cost = float("inf")
        costs_by_interval: dict[int, float] = {}

        for interval in range(7, 731):
            pm_cost = inp.cost_per_pm * (365.0 / interval)
            reliability = math.exp(-((interval / eta) ** beta))
            failure_cost = inp.failure_rate * inp.cost_per_failure * (1 - reliability)
            total = pm_cost + failure_cost
            costs_by_interval[interval] = total
            if total < best_cost:
                best_cost = total
                best_interval = interval

        current_cost = costs_by_interval.get(
            inp.current_pm_interval_days,
            _total_cost(inp, inp.current_pm_interval_days, beta, eta),
        )

        savings_pct = ((current_cost - best_cost) / current_cost * 100) if current_cost > 0 else 0.0

        r_optimal = math.exp(-((best_interval / eta) ** beta))
        r_current = math.exp(-((inp.current_pm_interval_days / eta) ** beta))

        if best_interval < inp.current_pm_interval_days:
            recommendation = f"Reduce PM interval from {inp.current_pm_interval_days}d to {best_interval}d (saves {savings_pct:.1f}%)"
        elif best_interval > inp.current_pm_interval_days:
            recommendation = f"Extend PM interval from {inp.current_pm_interval_days}d to {best_interval}d (saves {savings_pct:.1f}%)"
        else:
            recommendation = f"Current interval of {inp.current_pm_interval_days}d is near optimal"

        return OCRAnalysisResult(
            equipment_id=inp.equipment_id,
            optimal_interval_days=best_interval,
            current_interval_days=inp.current_pm_interval_days,
            cost_at_optimal=round(best_cost, 2),
            cost_at_current=round(current_cost, 2),
            savings_pct=round(max(0.0, savings_pct), 1),
            risk_at_optimal=round(1 - r_optimal, 4),
            risk_at_current=round(1 - r_current, 4),
            recommendation=recommendation,
        )

    @staticmethod
    def sensitivity_analysis(
        inp: OCRAnalysisInput,
        parameter: str = "failure_rate",
        range_pct: float = 50.0,
        steps: int = 5,
        beta: float = 2.0,
    ) -> list[OCRAnalysisResult]:
        """Vary one parameter ±range_pct and return results at each point."""
        base_value = getattr(inp, parameter, None)
        if base_value is None or base_value <= 0:
            return [OCREngine.calculate_optimal_interval(inp, beta)]

        results = []
        for i in range(steps):
            factor = 1.0 - range_pct / 100 + (2 * range_pct / 100) * (i / max(1, steps - 1))
            modified = inp.model_copy()
            setattr(modified, parameter, base_value * factor)
            results.append(OCREngine.calculate_optimal_interval(modified, beta))
        return results

    @staticmethod
    def batch_analyze(
        inputs: list[OCRAnalysisInput],
        beta: float = 2.0,
    ) -> list[OCRAnalysisResult]:
        """Analyze multiple equipment items."""
        return [OCREngine.calculate_optimal_interval(inp, beta) for inp in inputs]


def _total_cost(inp: OCRAnalysisInput, interval: int, beta: float, eta: float) -> float:
    """Helper: calculate total cost at a given interval."""
    pm_cost = inp.cost_per_pm * (365.0 / interval)
    reliability = math.exp(-((interval / eta) ** beta))
    failure_cost = inp.failure_rate * inp.cost_per_failure * (1 - reliability)
    return pm_cost + failure_cost
