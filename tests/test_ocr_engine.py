"""Tests for Optimum Cost-Risk (OCR) Engine — Phase 5."""

from tools.engines.ocr_engine import OCREngine
from tools.models.schemas import OCRAnalysisInput


def _make_input(**kwargs):
    defaults = dict(
        equipment_id="EQ-001", failure_rate=2.0, mttr_hours=4.0,
        cost_per_failure=50000, cost_per_pm=5000, current_pm_interval_days=90,
    )
    defaults.update(kwargs)
    return OCRAnalysisInput(**defaults)


class TestCalculateOptimalInterval:

    def test_finds_optimal(self):
        inp = _make_input()
        result = OCREngine.calculate_optimal_interval(inp)
        assert 7 <= result.optimal_interval_days <= 730
        assert result.cost_at_optimal > 0

    def test_current_interval_in_result(self):
        inp = _make_input(current_pm_interval_days=180)
        result = OCREngine.calculate_optimal_interval(inp)
        assert result.current_interval_days == 180
        assert result.cost_at_current > 0

    def test_savings_non_negative(self):
        inp = _make_input()
        result = OCREngine.calculate_optimal_interval(inp)
        assert result.savings_pct >= 0

    def test_has_recommendation(self):
        inp = _make_input()
        result = OCREngine.calculate_optimal_interval(inp)
        assert len(result.recommendation) > 0

    def test_high_failure_rate_shorter_interval(self):
        inp_low = _make_input(failure_rate=0.5)
        inp_high = _make_input(failure_rate=5.0)
        r_low = OCREngine.calculate_optimal_interval(inp_low)
        r_high = OCREngine.calculate_optimal_interval(inp_high)
        assert r_high.optimal_interval_days <= r_low.optimal_interval_days

    def test_risk_values(self):
        inp = _make_input()
        result = OCREngine.calculate_optimal_interval(inp)
        assert 0 <= result.risk_at_optimal <= 1
        assert 0 <= result.risk_at_current <= 1


class TestSensitivityAnalysis:

    def test_returns_multiple_points(self):
        inp = _make_input()
        results = OCREngine.sensitivity_analysis(inp, "failure_rate", range_pct=50, steps=5)
        assert len(results) == 5


class TestBatchAnalyze:

    def test_batch_multiple_equipment(self):
        inputs = [_make_input(equipment_id=f"EQ-{i}") for i in range(3)]
        results = OCREngine.batch_analyze(inputs)
        assert len(results) == 3
        assert all(r.equipment_id.startswith("EQ-") for r in results)
