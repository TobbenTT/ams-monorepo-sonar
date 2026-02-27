"""Tests for DE (Defect Elimination) KPIs — Phase 4A."""

from datetime import date

from tools.engines.rca_engine import RCAEngine
from tools.models.schemas import KPIStatus


class TestDEKPIs:

    def test_all_5_kpis_returned(self):
        result = RCAEngine.compute_de_kpis(
            plant_id="P1",
            period_start=date(2025, 1, 1),
            period_end=date(2025, 3, 31),
            events_reported=48, events_required=50,
            meetings_held=12, meetings_required=12,
            actions_implemented=40, actions_planned=50,
            savings_achieved=80000, savings_target=100000,
            failures_current=8, failures_previous=10,
        )
        assert len(result.kpis) == 5

    def test_all_on_target(self):
        result = RCAEngine.compute_de_kpis(
            plant_id="P1",
            period_start=date(2025, 1, 1),
            period_end=date(2025, 3, 31),
            events_reported=50, events_required=50,
            meetings_held=12, meetings_required=12,
            actions_implemented=45, actions_planned=50,
            savings_achieved=80000, savings_target=100000,
            failures_current=8, failures_previous=10,
        )
        on_target = [k for k in result.kpis if k.status == KPIStatus.ON_TARGET]
        assert len(on_target) == 5

    def test_zero_division_safety(self):
        result = RCAEngine.compute_de_kpis(
            plant_id="P1",
            period_start=date(2025, 1, 1),
            period_end=date(2025, 3, 31),
            events_reported=0, events_required=0,
            meetings_held=0, meetings_required=0,
            actions_implemented=0, actions_planned=0,
            savings_achieved=0, savings_target=0,
            failures_current=0, failures_previous=0,
        )
        assert len(result.kpis) == 5
        for kpi in result.kpis:
            assert kpi.value is None

    def test_frequency_reduction(self):
        result = RCAEngine.compute_de_kpis(
            plant_id="P1",
            period_start=date(2025, 1, 1),
            period_end=date(2025, 3, 31),
            events_reported=10, events_required=10,
            meetings_held=5, meetings_required=5,
            actions_implemented=5, actions_planned=5,
            savings_achieved=100, savings_target=100,
            failures_current=7, failures_previous=10,
        )
        freq_red = next(k for k in result.kpis if k.name == "frequency_reduction")
        assert freq_red.value == 30.0
        assert freq_red.status == KPIStatus.ON_TARGET

    def test_below_target(self):
        result = RCAEngine.compute_de_kpis(
            plant_id="P1",
            period_start=date(2025, 1, 1),
            period_end=date(2025, 3, 31),
            events_reported=30, events_required=50,
            meetings_held=5, meetings_required=12,
            actions_implemented=20, actions_planned=50,
            savings_achieved=30000, savings_target=100000,
            failures_current=9, failures_previous=10,
        )
        below = [k for k in result.kpis if k.status == KPIStatus.BELOW_TARGET]
        assert len(below) >= 3
