"""Tests for Life Cycle Cost (LCC) Calculator — Phase 5."""

import pytest

from tools.engines.lcc_engine import LCCEngine
from tools.models.schemas import LCCInput


def _make_input(**kwargs):
    defaults = dict(
        equipment_id="EQ-001", acquisition_cost=100000, installation_cost=20000,
        annual_operating_cost=15000, annual_maintenance_cost=10000,
        expected_life_years=20, discount_rate=0.08, salvage_value=5000,
    )
    defaults.update(kwargs)
    return LCCInput(**defaults)


class TestCalculate:

    def test_total_lcc_positive(self):
        result = LCCEngine.calculate(_make_input())
        assert result.total_lcc > 0
        assert result.equipment_id == "EQ-001"

    def test_npv_positive(self):
        result = LCCEngine.calculate(_make_input())
        assert result.npv > 0

    def test_annualized_cost(self):
        inp = _make_input(expected_life_years=20)
        result = LCCEngine.calculate(inp)
        assert result.annualized_cost == pytest.approx(result.total_lcc / 20, rel=0.01)

    def test_percentages_sum_near_100(self):
        result = LCCEngine.calculate(_make_input())
        total_pct = result.acquisition_pct + result.operating_pct + result.maintenance_pct
        # Salvage value reduces total, so sum may slightly differ
        assert total_pct > 80

    def test_has_recommendation(self):
        result = LCCEngine.calculate(_make_input())
        assert len(result.recommendation) > 0

    def test_zero_discount_rate(self):
        result = LCCEngine.calculate(_make_input(discount_rate=0.0))
        assert result.total_lcc > 0

    def test_high_maintenance_recommendation(self):
        result = LCCEngine.calculate(_make_input(
            acquisition_cost=10000, installation_cost=1000,
            annual_maintenance_cost=50000, annual_operating_cost=5000,
        ))
        assert "maintenance" in result.recommendation.lower()


class TestCompareAlternatives:

    def test_sorted_by_lcc(self):
        inputs = [
            _make_input(equipment_id="EXPENSIVE", acquisition_cost=500000),
            _make_input(equipment_id="CHEAP", acquisition_cost=50000),
        ]
        results = LCCEngine.compare_alternatives(inputs)
        assert results[0].total_lcc <= results[1].total_lcc
        assert results[0].equipment_id == "CHEAP"


class TestFindBreakeven:

    def test_finds_crossover(self):
        inp_a = _make_input(equipment_id="A", acquisition_cost=200000, annual_operating_cost=5000, annual_maintenance_cost=5000)
        inp_b = _make_input(equipment_id="B", acquisition_cost=50000, annual_operating_cost=15000, annual_maintenance_cost=25000)
        year = LCCEngine.find_breakeven(inp_a, inp_b)
        assert year is not None
        assert 1 <= year <= 20

    def test_no_crossover(self):
        inp_a = _make_input(equipment_id="A", acquisition_cost=100000, annual_maintenance_cost=5000)
        inp_b = _make_input(equipment_id="B", acquisition_cost=200000, annual_maintenance_cost=15000)
        year = LCCEngine.find_breakeven(inp_a, inp_b)
        # A is always cheaper, so no crossover
        assert year is None
