"""Tests for DE KPI Engine — Phase 6."""

from tools.engines.de_kpi_engine import DEKPIEngine
from tools.models.schemas import DEKPIInput, DEKPIs


def _make_input(**overrides) -> DEKPIInput:
    defaults = dict(
        plant_id="PLANT-1",
        period_start="2025-01-01",
        period_end="2025-03-31",
        events_reported=18,
        events_required=20,
        meetings_held=10,
        meetings_required=12,
        actions_implemented=15,
        actions_planned=20,
        savings_achieved=50000,
        savings_target=80000,
        failures_current=8,
        failures_previous=12,
    )
    defaults.update(overrides)
    return DEKPIInput(**defaults)


class TestCalculate:

    def test_returns_de_kpis(self):
        result = DEKPIEngine.calculate(_make_input())
        assert isinstance(result, DEKPIs)
        assert result.plant_id == "PLANT-1"
        assert len(result.kpis) == 5

    def test_event_reporting_compliance(self):
        result = DEKPIEngine.calculate(_make_input(events_reported=20, events_required=20))
        erc = next(k for k in result.kpis if k.name == "event_reporting_compliance")
        assert erc.value == 100.0

    def test_zero_required_events(self):
        result = DEKPIEngine.calculate(_make_input(events_reported=0, events_required=0))
        assert isinstance(result, DEKPIs)

    def test_frequency_reduction(self):
        result = DEKPIEngine.calculate(_make_input(failures_current=6, failures_previous=10))
        freq = next(k for k in result.kpis if k.name == "frequency_reduction")
        assert freq.value is not None
        assert freq.value > 0


class TestCalculateTrends:

    def test_no_previous_periods(self):
        current = DEKPIEngine.calculate(_make_input())
        trend = DEKPIEngine.calculate_trends("PLANT-1", current, [])
        assert trend.overall_trend == "STABLE"
        assert trend.period_count == 1

    def test_improving_trend(self):
        prev = DEKPIEngine.calculate(_make_input(
            events_reported=10, meetings_held=5, actions_implemented=8,
            savings_achieved=20000, failures_current=12,
        ))
        current = DEKPIEngine.calculate(_make_input(
            events_reported=20, meetings_held=12, actions_implemented=18,
            savings_achieved=70000, failures_current=4,
        ))
        trend = DEKPIEngine.calculate_trends("PLANT-1", current, [prev])
        assert trend.period_count == 2
        improving_count = sum(1 for v in trend.kpi_trends.values() if v == "IMPROVING")
        assert improving_count > 0

    def test_degrading_trend(self):
        prev = DEKPIEngine.calculate(_make_input(
            events_reported=20, meetings_held=12, actions_implemented=20,
            savings_achieved=80000, failures_current=4,
        ))
        current = DEKPIEngine.calculate(_make_input(
            events_reported=8, meetings_held=4, actions_implemented=5,
            savings_achieved=10000, failures_current=15,
        ))
        trend = DEKPIEngine.calculate_trends("PLANT-1", current, [prev])
        degrading_count = sum(1 for v in trend.kpi_trends.values() if v == "DEGRADING")
        assert degrading_count > 0


class TestAssessProgramHealth:

    def test_optimizing(self):
        kpis = DEKPIEngine.calculate(_make_input(
            events_reported=20, events_required=20,
            meetings_held=12, meetings_required=12,
            actions_implemented=20, actions_planned=20,
            savings_achieved=80000, savings_target=80000,
            failures_current=5, failures_previous=10,
        ))
        health = DEKPIEngine.assess_program_health("PLANT-1", kpis)
        assert health.maturity_level in ("OPTIMIZING", "ESTABLISHED")
        assert health.program_score >= 60

    def test_initial_level(self):
        kpis = DEKPIEngine.calculate(_make_input(
            events_reported=2, events_required=20,
            meetings_held=1, meetings_required=12,
            actions_implemented=2, actions_planned=20,
            savings_achieved=5000, savings_target=80000,
            failures_current=10, failures_previous=10,
        ))
        health = DEKPIEngine.assess_program_health("PLANT-1", kpis)
        assert health.maturity_level in ("INITIAL", "DEVELOPING")
        assert health.program_score < 60


class TestComparePlants:

    def test_ranking_order(self):
        kpis_a = DEKPIEngine.calculate(_make_input(plant_id="PLANT-A",
            events_reported=20, events_required=20,
            meetings_held=12, meetings_required=12,
        ))
        kpis_b = DEKPIEngine.calculate(_make_input(plant_id="PLANT-B",
            events_reported=5, events_required=20,
            meetings_held=3, meetings_required=12,
        ))
        ranked = DEKPIEngine.compare_plants([kpis_b, kpis_a])
        assert ranked[0]["plant_id"] == "PLANT-A"
        assert ranked[0]["rank"] == 1
