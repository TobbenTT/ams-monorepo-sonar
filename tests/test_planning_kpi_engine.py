"""Tests for Planning KPI Engine — Phase 4A."""

from datetime import date

from tools.engines.planning_kpi_engine import PlanningKPIEngine
from tools.models.schemas import KPIStatus, PlanningKPIInput


def _make_input(**overrides) -> PlanningKPIInput:
    defaults = dict(
        plant_id="P1",
        period_start=date(2025, 1, 1),
        period_end=date(2025, 1, 31),
        wo_planned=100,
        wo_completed=95,
        manhours_planned=800.0,
        manhours_actual=820.0,
        backlog_hours=120.0,
        weekly_capacity_hours=40.0,
        release_horizon_days=5,
        pending_notices=5,
        total_notices=100,
        scheduled_capacity_hours=340.0,
        total_capacity_hours=400.0,
        proactive_wo=80,
        total_wo=100,
        planned_wo=90,
        schedule_compliance_executed=90,
        schedule_compliance_planned=100,
        pm_executed=48,
        pm_planned=50,
        corrective_count=15,
    )
    defaults.update(overrides)
    return PlanningKPIInput(**defaults)


class TestPlanningKPIs:

    def test_all_11_kpis_returned(self):
        result = PlanningKPIEngine.calculate(_make_input())
        assert len(result.kpis) == 11

    def test_all_on_target_healthy(self):
        result = PlanningKPIEngine.calculate(_make_input())
        assert result.overall_health == "HEALTHY"
        assert result.on_target_count >= 9

    def test_critical_when_few_on_target(self):
        result = PlanningKPIEngine.calculate(_make_input(
            wo_completed=50,
            manhours_actual=200.0,
            backlog_hours=400.0,
            release_horizon_days=30,
            pending_notices=50,
            scheduled_capacity_hours=100.0,
            proactive_wo=20,
            planned_wo=30,
            schedule_compliance_executed=40,
            pm_executed=20,
            corrective_count=60,
        ))
        assert result.overall_health == "CRITICAL"

    def test_zero_division_safety(self):
        result = PlanningKPIEngine.calculate(_make_input(
            wo_planned=0,
            manhours_planned=0.0,
            weekly_capacity_hours=0.0,
            total_notices=0,
            total_capacity_hours=0.0,
            total_wo=0,
            schedule_compliance_planned=0,
            pm_planned=0,
        ))
        assert len(result.kpis) == 11
        # KPIs with zero denominators should be None
        wo_comp = next(k for k in result.kpis if k.name == "wo_completion")
        assert wo_comp.value is None

    def test_backlog_weeks_lower_is_better(self):
        result = PlanningKPIEngine.calculate(_make_input(backlog_hours=80.0, weekly_capacity_hours=40.0))
        backlog = next(k for k in result.kpis if k.name == "backlog_weeks")
        assert backlog.value == 2.0
        assert backlog.status == KPIStatus.ON_TARGET

    def test_backlog_weeks_above_target(self):
        result = PlanningKPIEngine.calculate(_make_input(backlog_hours=240.0, weekly_capacity_hours=40.0))
        backlog = next(k for k in result.kpis if k.name == "backlog_weeks")
        assert backlog.value == 6.0
        assert backlog.status == KPIStatus.ABOVE_TARGET

    def test_reactive_ratio_lower_is_better(self):
        result = PlanningKPIEngine.calculate(_make_input(corrective_count=10, total_wo=100))
        reactive = next(k for k in result.kpis if k.name == "reactive_work")
        assert reactive.value == 10.0
        assert reactive.status == KPIStatus.ON_TARGET

    def test_manhour_compliance_range(self):
        # Within range (85-115%)
        result = PlanningKPIEngine.calculate(_make_input(manhours_actual=800.0, manhours_planned=800.0))
        mh = next(k for k in result.kpis if k.name == "manhour_compliance")
        assert mh.value == 100.0
        assert mh.status == KPIStatus.ON_TARGET

    def test_manhour_compliance_below_range(self):
        result = PlanningKPIEngine.calculate(_make_input(manhours_actual=600.0, manhours_planned=800.0))
        mh = next(k for k in result.kpis if k.name == "manhour_compliance")
        assert mh.value == 75.0
        assert mh.status == KPIStatus.BELOW_TARGET

    def test_kpi_names_are_unique(self):
        result = PlanningKPIEngine.calculate(_make_input())
        names = [k.name for k in result.kpis]
        assert len(names) == len(set(names))
