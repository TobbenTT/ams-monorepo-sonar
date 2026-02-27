"""
Weibull Analysis Engine — REF-12 Recommendation 6
Statistical failure prediction using Weibull distribution.
Validated by GECAMIN MAPLA 2024:
- Jean Campos (S7): 83% accuracy with SVM for 797F engines
- Adolfo Casilla (S12): NHPP models for repairable systems
- Viviana Meruane (S3): Academic framework for RUL prediction

Phase 1: Pure statistical methods (no ML dependency).
Uses standard 2-parameter Weibull: R(t) = exp(-(t/eta)^beta)

NOTE: All outputs enter as DRAFT — safety-first principle applies.
Human always validates prediction results.
"""

import math

from tools.models.schemas import (
    ApprovalStatus,
    FailurePattern,
    FailurePrediction,
    WeibullParameters,
)


class WeibullEngine:
    """Statistical failure prediction using Weibull distribution analysis."""

    @staticmethod
    def fit_parameters(failure_intervals: list[float]) -> WeibullParameters:
        """Estimate Weibull parameters from failure interval data using
        the method of median ranks + linear regression on Weibull paper.

        This is the rank-regression-on-Y (RRY) method, the standard
        approach for small-to-medium sample sizes in maintenance.

        Args:
            failure_intervals: List of time-to-failure values (days).
                Must have at least 3 data points.

        Returns:
            WeibullParameters with estimated beta, eta, and fit quality.
        """
        n = len(failure_intervals)
        if n < 3:
            return WeibullParameters(
                beta=1.0, eta=max(failure_intervals) if failure_intervals else 365.0,
                r_squared=0.0, sample_size=n,
            )

        # Sort failures
        sorted_failures = sorted(failure_intervals)

        # Median rank approximation: F(i) = (i - 0.3) / (n + 0.4) (Bernard's approx.)
        x = []  # ln(t)
        y = []  # ln(ln(1/(1-F)))
        for i, t in enumerate(sorted_failures, 1):
            if t <= 0:
                continue
            f = (i - 0.3) / (n + 0.4)
            if f <= 0 or f >= 1:
                continue
            x.append(math.log(t))
            y.append(math.log(math.log(1 / (1 - f))))

        if len(x) < 2:
            return WeibullParameters(
                beta=1.0, eta=sum(sorted_failures) / n if n > 0 else 365.0,
                r_squared=0.0, sample_size=n,
            )

        # Linear regression: y = beta * x - beta * ln(eta)
        n_pts = len(x)
        sum_x = sum(x)
        sum_y = sum(y)
        sum_xy = sum(xi * yi for xi, yi in zip(x, y))
        sum_x2 = sum(xi * xi for xi in x)

        denom = n_pts * sum_x2 - sum_x * sum_x
        if abs(denom) < 1e-10:
            return WeibullParameters(
                beta=1.0, eta=sum(sorted_failures) / n,
                r_squared=0.0, sample_size=n,
            )

        beta = (n_pts * sum_xy - sum_x * sum_y) / denom
        intercept = (sum_y - beta * sum_x) / n_pts
        eta = math.exp(-intercept / beta) if beta != 0 else sum(sorted_failures) / n

        # R-squared (coefficient of determination)
        mean_y = sum_y / n_pts
        ss_tot = sum((yi - mean_y) ** 2 for yi in y)
        ss_res = sum((yi - (beta * xi + intercept)) ** 2 for xi, yi in zip(x, y))
        r_squared = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0.0

        # Ensure valid parameters
        beta = max(0.1, beta)
        eta = max(1.0, eta)
        r_squared = max(0.0, min(1.0, r_squared))

        return WeibullParameters(
            beta=round(beta, 3),
            eta=round(eta, 1),
            r_squared=round(r_squared, 4),
            sample_size=n,
        )

    @staticmethod
    def reliability(t: float, params: WeibullParameters) -> float:
        """Calculate reliability R(t) = exp(-(t/eta)^beta).
        Probability of surviving to time t.
        """
        if t <= params.gamma:
            return 1.0
        adjusted_t = t - params.gamma
        return math.exp(-((adjusted_t / params.eta) ** params.beta))

    @staticmethod
    def failure_probability(t: float, params: WeibullParameters) -> float:
        """F(t) = 1 - R(t). Probability of failure by time t."""
        return 1.0 - WeibullEngine.reliability(t, params)

    @staticmethod
    def hazard_rate(t: float, params: WeibullParameters) -> float:
        """Instantaneous failure rate h(t) = (beta/eta) * (t/eta)^(beta-1)."""
        if t <= params.gamma:
            return 0.0
        adjusted_t = t - params.gamma
        return (params.beta / params.eta) * ((adjusted_t / params.eta) ** (params.beta - 1))

    @staticmethod
    def mean_life(params: WeibullParameters) -> float:
        """Mean life (MTTF) = eta * Gamma(1 + 1/beta).
        Uses Stirling's approximation for the Gamma function.
        """
        x = 1 + 1 / params.beta
        # Gamma function approximation (Lanczos)
        gamma_val = WeibullEngine._gamma_function(x)
        return params.eta * gamma_val + params.gamma

    @staticmethod
    def _gamma_function(x: float) -> float:
        """Lanczos approximation to the Gamma function."""
        if x < 0.5:
            return math.pi / (math.sin(math.pi * x) * WeibullEngine._gamma_function(1 - x))

        x -= 1
        g = 7
        coefficients = [
            0.99999999999980993, 676.5203681218851, -1259.1392167224028,
            771.32342877765313, -176.61502916214059, 12.507343278686905,
            -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
        ]
        t = x + g + 0.5
        s = coefficients[0]
        for i in range(1, len(coefficients)):
            s += coefficients[i] / (x + i)
        return math.sqrt(2 * math.pi) * (t ** (x + 0.5)) * math.exp(-t) * s

    @staticmethod
    def classify_failure_pattern(beta: float) -> FailurePattern:
        """Map Weibull beta to Nowlan & Heap failure pattern.
        beta < 1: Early life (Pattern F)
        beta ≈ 1: Random (Pattern E)
        1 < beta < 2: Fatigue/Stress (Pattern C/D)
        beta >= 2: Age-related (Pattern B)
        beta >= 3.5: Bathtub wear-out (Pattern A)
        """
        if beta < 0.8:
            return FailurePattern.F_EARLY_LIFE
        elif beta < 1.2:
            return FailurePattern.E_RANDOM
        elif beta < 1.5:
            return FailurePattern.D_STRESS
        elif beta < 2.0:
            return FailurePattern.C_FATIGUE
        elif beta < 3.5:
            return FailurePattern.B_AGE
        else:
            return FailurePattern.A_BATHTUB

    @classmethod
    def predict(
        cls,
        equipment_id: str,
        equipment_tag: str,
        failure_intervals: list[float],
        current_age_days: float,
        confidence_level: float = 0.9,
    ) -> FailurePrediction:
        """Generate failure prediction for an equipment item.

        Args:
            equipment_id: SAP EQUNR
            equipment_tag: Technical TAG
            failure_intervals: Historical time-to-failure data (days)
            current_age_days: Current age since last overhaul (days)
            confidence_level: Desired confidence level (0.5-0.99)

        Returns:
            FailurePrediction with DRAFT status (safety-first: human must validate).
        """
        params = cls.fit_parameters(failure_intervals)
        reliability_now = cls.reliability(current_age_days, params)
        failure_pattern = cls.classify_failure_pattern(params.beta)

        # Predicted failure window: time until R(t) drops to (1 - confidence_level)
        # Solve: R(t_pred) = 1 - confidence_level
        target_reliability = 1 - confidence_level
        if target_reliability <= 0 or target_reliability >= 1:
            predicted_days = params.eta  # Fallback to characteristic life
        else:
            # t = eta * (-ln(R))^(1/beta) + gamma
            predicted_t = params.eta * ((-math.log(target_reliability)) ** (1 / params.beta)) + params.gamma
            predicted_days = max(0, predicted_t - current_age_days)

        # Risk score: 0-100 based on proximity to predicted failure
        mean_life_val = cls.mean_life(params)
        if mean_life_val > 0:
            risk_score = min(100.0, (current_age_days / mean_life_val) * 100)
        else:
            risk_score = 50.0

        # Generate recommendation based on pattern and risk
        recommendation = cls._generate_recommendation(failure_pattern, risk_score, predicted_days)

        return FailurePrediction(
            equipment_id=equipment_id,
            equipment_tag=equipment_tag,
            weibull_params=params,
            current_age_days=current_age_days,
            reliability_current=round(reliability_now, 4),
            predicted_failure_window_days=round(predicted_days, 1),
            confidence_level=confidence_level,
            risk_score=round(risk_score, 1),
            failure_pattern=failure_pattern,
            recommendation=recommendation,
            status=ApprovalStatus.DRAFT,
        )

    @staticmethod
    def _generate_recommendation(
        pattern: FailurePattern,
        risk_score: float,
        predicted_days: float,
    ) -> str:
        """Generate human-readable recommendation based on prediction."""
        if risk_score >= 80:
            urgency = "URGENT"
        elif risk_score >= 60:
            urgency = "HIGH"
        elif risk_score >= 40:
            urgency = "MEDIUM"
        else:
            urgency = "LOW"

        pattern_advice = {
            FailurePattern.A_BATHTUB: "Age-related wear-out detected. Fixed-time replacement recommended.",
            FailurePattern.B_AGE: "Age-related degradation. Schedule replacement before predicted failure window.",
            FailurePattern.C_FATIGUE: "Fatigue-driven failure. Condition-based monitoring recommended.",
            FailurePattern.D_STRESS: "Stress-related failure. Review operating conditions and loading.",
            FailurePattern.E_RANDOM: "Random failure pattern. Condition-based monitoring is optimal strategy.",
            FailurePattern.F_EARLY_LIFE: "Early-life failures detected. Review installation and commissioning quality.",
        }

        advice = pattern_advice.get(pattern, "Review failure history for strategy selection.")
        return f"[{urgency}] Predicted failure window: {predicted_days:.0f} days. {advice}"
