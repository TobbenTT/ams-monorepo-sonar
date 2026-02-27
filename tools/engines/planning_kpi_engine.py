"""
Planning KPI Engine — Phase 4A: GFSN 11 Planning KPIs (REF-14 §8)
Extends existing KPIEngine with 8 additional planning-specific KPIs.
Reuses 3 existing KPIs (schedule_compliance, pm_compliance, reactive_ratio) from KPIEngine.
"""

from tools.engines.kpi_engine import KPIEngine
from tools.models.schemas import (
    KPIStatus,
    PlanningKPIInput,
    PlanningKPIs,
    PlanningKPIValue,
)


class PlanningKPIEngine:
    """Calculates 11 GFSN planning KPIs with targets."""

    TARGETS = {
        "wo_completion": 90.0,
        "manhour_compliance_low": 85.0,
        "manhour_compliance_high": 115.0,
        "pm_plan_compliance": 95.0,
        "backlog_weeks": 4.0,
        "reactive_work": 20.0,
        "schedule_adherence": 85.0,
        "release_horizon": 7.0,
        "pending_notices": 15.0,
        "scheduled_capacity_low": 80.0,
        "scheduled_capacity_high": 95.0,
        "proactive_work": 70.0,
        "planning_efficiency": 85.0,
    }

    @staticmethod
    def _status(value: float | None, target: float, lower_is_better: bool = False) -> KPIStatus:
        if value is None:
            return KPIStatus.BELOW_TARGET
        if lower_is_better:
            return KPIStatus.ON_TARGET if value <= target else KPIStatus.ABOVE_TARGET
        return KPIStatus.ON_TARGET if value >= target else KPIStatus.BELOW_TARGET

    @staticmethod
    def _range_status(value: float | None, low: float, high: float) -> KPIStatus:
        if value is None:
            return KPIStatus.BELOW_TARGET
        if low <= value <= high:
            return KPIStatus.ON_TARGET
        if value < low:
            return KPIStatus.BELOW_TARGET
        return KPIStatus.ABOVE_TARGET

    @classmethod
    def calculate(cls, input_data: PlanningKPIInput) -> PlanningKPIs:
        """Calculate all 11 planning KPIs from input data."""
        kpis: list[PlanningKPIValue] = []

        # 1. WO Completion Rate (target >= 90%)
        wo_comp = (input_data.wo_completed / input_data.wo_planned * 100) if input_data.wo_planned > 0 else None
        kpis.append(PlanningKPIValue(
            name="wo_completion",
            value=round(wo_comp, 1) if wo_comp is not None else None,
            target=cls.TARGETS["wo_completion"],
            status=cls._status(wo_comp, cls.TARGETS["wo_completion"]),
        ))

        # 2. Man-hour Compliance (target 85-115%)
        mh_comp = (input_data.manhours_actual / input_data.manhours_planned * 100) if input_data.manhours_planned > 0 else None
        kpis.append(PlanningKPIValue(
            name="manhour_compliance",
            value=round(mh_comp, 1) if mh_comp is not None else None,
            target=100.0,
            status=cls._range_status(mh_comp, cls.TARGETS["manhour_compliance_low"], cls.TARGETS["manhour_compliance_high"]),
        ))

        # 3. PM Plan Compliance (target >= 95%)
        pm_comp = KPIEngine.calculate_pm_compliance(input_data.pm_planned, input_data.pm_executed)
        kpis.append(PlanningKPIValue(
            name="pm_plan_compliance",
            value=pm_comp,
            target=cls.TARGETS["pm_plan_compliance"],
            status=cls._status(pm_comp, cls.TARGETS["pm_plan_compliance"]),
        ))

        # 4. Backlog Weeks (target <= 4 weeks, lower is better)
        backlog_w = (input_data.backlog_hours / input_data.weekly_capacity_hours) if input_data.weekly_capacity_hours > 0 else None
        kpis.append(PlanningKPIValue(
            name="backlog_weeks",
            value=round(backlog_w, 1) if backlog_w is not None else None,
            target=cls.TARGETS["backlog_weeks"],
            unit="weeks",
            status=cls._status(backlog_w, cls.TARGETS["backlog_weeks"], lower_is_better=True),
        ))

        # 5. Reactive Work % (target <= 20%, lower is better)
        reactive = KPIEngine.calculate_reactive_ratio(input_data.corrective_count, input_data.total_wo)
        kpis.append(PlanningKPIValue(
            name="reactive_work",
            value=reactive,
            target=cls.TARGETS["reactive_work"],
            status=cls._status(reactive, cls.TARGETS["reactive_work"], lower_is_better=True),
        ))

        # 6. Schedule Adherence (target >= 85%)
        sched_adh = KPIEngine.calculate_schedule_compliance(
            input_data.schedule_compliance_planned, input_data.schedule_compliance_executed,
        )
        kpis.append(PlanningKPIValue(
            name="schedule_adherence",
            value=sched_adh,
            target=cls.TARGETS["schedule_adherence"],
            status=cls._status(sched_adh, cls.TARGETS["schedule_adherence"]),
        ))

        # 7. Release Horizon (target <= 7 days, lower is better)
        kpis.append(PlanningKPIValue(
            name="release_horizon",
            value=float(input_data.release_horizon_days),
            target=cls.TARGETS["release_horizon"],
            unit="days",
            status=cls._status(float(input_data.release_horizon_days), cls.TARGETS["release_horizon"], lower_is_better=True),
        ))

        # 8. Pending Notices % (target <= 15%, lower is better)
        pending = (input_data.pending_notices / input_data.total_notices * 100) if input_data.total_notices > 0 else None
        kpis.append(PlanningKPIValue(
            name="pending_notices",
            value=round(pending, 1) if pending is not None else None,
            target=cls.TARGETS["pending_notices"],
            status=cls._status(pending, cls.TARGETS["pending_notices"], lower_is_better=True),
        ))

        # 9. Scheduled Capacity (target 80-95%)
        sched_cap = (input_data.scheduled_capacity_hours / input_data.total_capacity_hours * 100) if input_data.total_capacity_hours > 0 else None
        kpis.append(PlanningKPIValue(
            name="scheduled_capacity",
            value=round(sched_cap, 1) if sched_cap is not None else None,
            target=87.5,
            status=cls._range_status(sched_cap, cls.TARGETS["scheduled_capacity_low"], cls.TARGETS["scheduled_capacity_high"]),
        ))

        # 10. Proactive Work % (target >= 70%)
        proactive = (input_data.proactive_wo / input_data.total_wo * 100) if input_data.total_wo > 0 else None
        kpis.append(PlanningKPIValue(
            name="proactive_work",
            value=round(proactive, 1) if proactive is not None else None,
            target=cls.TARGETS["proactive_work"],
            status=cls._status(proactive, cls.TARGETS["proactive_work"]),
        ))

        # 11. Planning Efficiency (target >= 85%)
        plan_eff = (input_data.planned_wo / input_data.total_wo * 100) if input_data.total_wo > 0 else None
        kpis.append(PlanningKPIValue(
            name="planning_efficiency",
            value=round(plan_eff, 1) if plan_eff is not None else None,
            target=cls.TARGETS["planning_efficiency"],
            status=cls._status(plan_eff, cls.TARGETS["planning_efficiency"]),
        ))

        on_target = len([k for k in kpis if k.status == KPIStatus.ON_TARGET])
        below_target = len(kpis) - on_target

        if on_target >= 9:
            health = "HEALTHY"
        elif on_target >= 6:
            health = "AT_RISK"
        else:
            health = "CRITICAL"

        return PlanningKPIs(
            plant_id=input_data.plant_id,
            period_start=input_data.period_start,
            period_end=input_data.period_end,
            kpis=kpis,
            overall_health=health,
            on_target_count=on_target,
            below_target_count=below_target,
        )
