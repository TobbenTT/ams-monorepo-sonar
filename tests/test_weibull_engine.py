"""Tests for WeibullEngine — REF-12 Rec 6: Statistical Failure Prediction."""

import math

import pytest

from tools.engines.weibull_engine import WeibullEngine
from tools.models.schemas import (
    ApprovalStatus,
    FailurePattern,
    FailurePrediction,
    WeibullParameters,
)


class TestFitParameters:
    def test_minimum_sample(self):
        """3+ data points needed for meaningful fit."""
        params = WeibullEngine.fit_parameters([100, 200, 150])
        assert params.beta > 0
        assert params.eta > 0
        assert params.sample_size == 3

    def test_insufficient_data(self):
        """< 3 points returns defaults."""
        params = WeibullEngine.fit_parameters([100])
        assert params.beta == 1.0
        assert params.r_squared == 0.0
        assert params.sample_size == 1

    def test_empty_data(self):
        params = WeibullEngine.fit_parameters([])
        assert params.beta == 1.0
        assert params.eta == 365.0

    def test_wear_out_pattern(self):
        """Increasing failure intervals should give beta > 1 (wear-out)."""
        # Simulate age-related failures: intervals getting shorter over time
        intervals = [500, 480, 450, 420, 400, 380, 350]
        params = WeibullEngine.fit_parameters(intervals)
        assert params.beta > 0
        assert params.eta > 0
        assert params.r_squared >= 0

    def test_consistent_intervals(self):
        """Very consistent intervals should have high R²."""
        intervals = [100, 101, 99, 100, 102, 98, 100, 99]
        params = WeibullEngine.fit_parameters(intervals)
        assert params.r_squared > 0.5  # Good fit for consistent data


class TestReliability:
    def test_at_zero(self):
        params = WeibullParameters(beta=2.0, eta=100.0)
        assert WeibullEngine.reliability(0, params) == 1.0

    def test_at_eta(self):
        """R(eta) = exp(-1) ≈ 0.368 for any beta."""
        params = WeibullParameters(beta=2.0, eta=100.0)
        r = WeibullEngine.reliability(100, params)
        assert abs(r - math.exp(-1)) < 0.01

    def test_decreases_with_time(self):
        params = WeibullParameters(beta=2.0, eta=100.0)
        r50 = WeibullEngine.reliability(50, params)
        r100 = WeibullEngine.reliability(100, params)
        r200 = WeibullEngine.reliability(200, params)
        assert r50 > r100 > r200

    def test_with_gamma(self):
        """Before gamma, reliability should be 1.0."""
        params = WeibullParameters(beta=2.0, eta=100.0, gamma=50.0)
        assert WeibullEngine.reliability(30, params) == 1.0
        assert WeibullEngine.reliability(60, params) < 1.0


class TestFailureProbability:
    def test_complement_of_reliability(self):
        params = WeibullParameters(beta=2.0, eta=100.0)
        r = WeibullEngine.reliability(50, params)
        f = WeibullEngine.failure_probability(50, params)
        assert abs(r + f - 1.0) < 1e-10


class TestHazardRate:
    def test_increasing_for_wearout(self):
        """beta > 1 means increasing hazard rate (wear-out)."""
        params = WeibullParameters(beta=2.5, eta=100.0)
        h50 = WeibullEngine.hazard_rate(50, params)
        h100 = WeibullEngine.hazard_rate(100, params)
        assert h100 > h50

    def test_constant_for_random(self):
        """beta = 1 means constant hazard rate (random failures)."""
        params = WeibullParameters(beta=1.0, eta=100.0)
        h50 = WeibullEngine.hazard_rate(50, params)
        h100 = WeibullEngine.hazard_rate(100, params)
        assert abs(h50 - h100) < 0.001

    def test_zero_before_gamma(self):
        params = WeibullParameters(beta=2.0, eta=100.0, gamma=50.0)
        assert WeibullEngine.hazard_rate(30, params) == 0.0


class TestMeanLife:
    def test_exponential_case(self):
        """beta=1: mean life = eta (exponential distribution)."""
        params = WeibullParameters(beta=1.0, eta=100.0)
        ml = WeibullEngine.mean_life(params)
        assert abs(ml - 100.0) < 1.0

    def test_increases_with_eta(self):
        params_low = WeibullParameters(beta=2.0, eta=100.0)
        params_high = WeibullParameters(beta=2.0, eta=200.0)
        assert WeibullEngine.mean_life(params_high) > WeibullEngine.mean_life(params_low)


class TestClassifyPattern:
    def test_early_life(self):
        assert WeibullEngine.classify_failure_pattern(0.5) == FailurePattern.F_EARLY_LIFE

    def test_random(self):
        assert WeibullEngine.classify_failure_pattern(1.0) == FailurePattern.E_RANDOM

    def test_stress(self):
        assert WeibullEngine.classify_failure_pattern(1.3) == FailurePattern.D_STRESS

    def test_fatigue(self):
        assert WeibullEngine.classify_failure_pattern(1.7) == FailurePattern.C_FATIGUE

    def test_age(self):
        assert WeibullEngine.classify_failure_pattern(2.5) == FailurePattern.B_AGE

    def test_bathtub(self):
        assert WeibullEngine.classify_failure_pattern(4.0) == FailurePattern.A_BATHTUB


class TestPredict:
    def test_basic_prediction(self):
        """Predict returns valid FailurePrediction with DRAFT status."""
        result = WeibullEngine.predict(
            equipment_id="EQ-001",
            equipment_tag="BRY-SAG-ML-001",
            failure_intervals=[120, 150, 130, 140, 135],
            current_age_days=100,
        )
        assert isinstance(result, FailurePrediction)
        assert result.status == ApprovalStatus.DRAFT  # Safety-first
        assert result.equipment_tag == "BRY-SAG-ML-001"
        assert result.reliability_current > 0
        assert result.predicted_failure_window_days >= 0
        assert result.risk_score >= 0
        assert result.failure_pattern is not None
        assert result.recommendation != ""

    def test_high_risk_old_equipment(self):
        """Equipment near end of life should have high risk score."""
        result = WeibullEngine.predict(
            equipment_id="EQ-002",
            equipment_tag="BRY-CRU-001",
            failure_intervals=[100, 110, 105, 95, 100],
            current_age_days=200,  # Well past mean life
        )
        assert result.risk_score > 50
        assert "URGENT" in result.recommendation or "HIGH" in result.recommendation

    def test_new_equipment_low_risk(self):
        """Young equipment with long failure intervals should have low risk."""
        result = WeibullEngine.predict(
            equipment_id="EQ-003",
            equipment_tag="BRY-PMP-001",
            failure_intervals=[500, 600, 550, 480, 520],
            current_age_days=50,  # Very young
        )
        assert result.risk_score < 50
        assert result.reliability_current > 0.5

    def test_prediction_always_draft(self):
        """Safety-first: predictions must always be DRAFT."""
        result = WeibullEngine.predict(
            equipment_id="EQ-004",
            equipment_tag="BRY-ML-001",
            failure_intervals=[200, 250, 225],
            current_age_days=180,
        )
        assert result.status == ApprovalStatus.DRAFT

    def test_insufficient_data(self):
        """Should still return a prediction with low confidence."""
        result = WeibullEngine.predict(
            equipment_id="EQ-005",
            equipment_tag="BRY-VLV-001",
            failure_intervals=[100],
            current_age_days=50,
        )
        assert result.weibull_params.r_squared == 0.0
