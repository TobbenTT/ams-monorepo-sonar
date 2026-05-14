"""
KPI Dashboard Engine — REF-12 Recommendation 8 (ISO 55002 §9.1)
Calculates maintenance KPIs from work order history data.

Metrics:
- MTBF: Mean Time Between Failures (days)
- MTTR: Mean Time To Repair (hours)
- Availability: uptime percentage
- OEE: Overall Equipment Effectiveness
- Schedule Compliance: planned vs executed
- PM Compliance: preventive maintenance adherence
- Reactive Ratio: corrective / total work orders
"""

from dataclasses import dataclass
from datetime import date

from tools.models.schemas import KPIMetrics


@dataclass
class WorkOrderRecord:
    """Simplified work order record for KPI calculation."""
    wo_id: str
    equipment_id: str
    order_type: str  # PM01, PM02, PM03
    created_date: date
    planned_start: date
    planned_end: date
    actual_start: date | None = None
    actual_end: date | None = None
    actual_duration_hours: float | None = None
    is_failure: bool = False  # True for breakdown/corrective events


class KPIEngine:
    """Calculates maintenance KPIs from work order history."""

    @staticmethod
    def calculate_mtbf(failure_dates: list[date]) -> float | None:
        """Mean Time Between Failures in days.
        Requires at least 2 failure events.
        """
        if len(failure_dates) < 2:
            return None
        sorted_dates = sorted(failure_dates)
        intervals = [
            (sorted_dates[i + 1] - sorted_dates[i]).days
            for i in range(len(sorted_dates) - 1)
        ]
        return round(sum(intervals) / len(intervals), 1) if intervals else None

    @staticmethod
    def calculate_mttr(repair_durations: list[float]) -> float | None:
        """Mean Time To Repair in hours."""
        valid = [d for d in repair_durations if d > 0]
        if not valid:
            return None
        return round(sum(valid) / len(valid), 1)

    @staticmethod
    def calculate_availability(
        total_period_hours: float,
        total_downtime_hours: float,
    ) -> float | None:
        """Availability = (Total Time - Downtime) / Total Time × 100."""
        if total_period_hours <= 0:
            return None
        avail = ((total_period_hours - total_downtime_hours) / total_period_hours) * 100
        return round(max(0.0, min(100.0, avail)), 1)

    @staticmethod
    def calculate_oee(
        availability_pct: float,
        performance_pct: float = 100.0,
        quality_pct: float = 100.0,
    ) -> float:
        """OEE = Availability × Performance × Quality (as percentages).
        For maintenance MVP, performance and quality default to 100%.
        """
        oee = (availability_pct / 100) * (performance_pct / 100) * (quality_pct / 100) * 100
        return round(max(0.0, min(100.0, oee)), 1)

    @staticmethod
    def calculate_schedule_compliance(
        planned_count: int,
        executed_on_time: int,
    ) -> float | None:
        """Schedule compliance = WOs completed on time / WOs planned."""
        if planned_count == 0:
            return None
        return round(100.0 * executed_on_time / planned_count, 1)

    @staticmethod
    def calculate_pm_compliance(
        pm_planned: int,
        pm_executed: int,
    ) -> float | None:
        """PM compliance = preventive WOs executed / preventive WOs planned."""
        if pm_planned == 0:
            return None
        return round(100.0 * pm_executed / pm_planned, 1)

    @staticmethod
    def calculate_reactive_ratio(
        corrective_count: int,
        total_count: int,
    ) -> float | None:
        """Reactive ratio = corrective WOs / total WOs."""
        if total_count == 0:
            return None
        return round(100.0 * corrective_count / total_count, 1)

    @classmethod
    def calculate_from_records(
        cls,
        records: list[WorkOrderRecord],
        plant_id: str,
        period_start: date,
        period_end: date,
        equipment_id: str | None = None,
        total_period_hours: float | None = None,
    ) -> KPIMetrics:
        """Calculate all KPIs from a list of work order records."""
        # Filter by equipment if specified
        filtered = records
        if equipment_id:
            filtered = [r for r in records if r.equipment_id == equipment_id]

        # Failure dates for MTBF
        failure_dates = [r.actual_start or r.created_date for r in filtered if r.is_failure]
        mtbf = cls.calculate_mtbf(failure_dates)

        # Repair durations for MTTR
        repair_durations = [
            r.actual_duration_hours
            for r in filtered
            if r.is_failure and r.actual_duration_hours is not None
        ]
        mttr = cls.calculate_mttr(repair_durations)

        # Availability
        if total_period_hours is None:
            total_period_hours = (period_end - period_start).days * 24.0
        total_downtime = sum(
            r.actual_duration_hours
            for r in filtered
            if r.is_failure and r.actual_duration_hours is not None
        )
        availability = cls.calculate_availability(total_period_hours, total_downtime)

        # OEE (simplified for maintenance MVP)
        oee = cls.calculate_oee(availability) if availability is not None else None

        # Count by type
        total = len(filtered)
        corrective = len([r for r in filtered if r.order_type == "PM03"])
        preventive = len([r for r in filtered if r.order_type == "PM02"])

        # Schedule compliance
        planned = [r for r in filtered if r.planned_start is not None]
        on_time = [
            r for r in planned
            if r.actual_start is not None and r.actual_start <= r.planned_end
        ]
        schedule_compliance = cls.calculate_schedule_compliance(len(planned), len(on_time))

        # PM compliance
        pm_planned = len([r for r in filtered if r.order_type == "PM02"])
        pm_executed = len([
            r for r in filtered
            if r.order_type == "PM02" and r.actual_end is not None
        ])
        pm_compliance = cls.calculate_pm_compliance(pm_planned, pm_executed)

        # Reactive ratio
        reactive_ratio = cls.calculate_reactive_ratio(corrective, total)

        return KPIMetrics(
            plant_id=plant_id,
            equipment_id=equipment_id,
            period_start=period_start,
            period_end=period_end,
            mtbf_days=mtbf,
            mttr_hours=mttr,
            availability_pct=availability,
            oee_pct=oee,
            schedule_compliance_pct=schedule_compliance,
            pm_compliance_pct=pm_compliance,
            total_work_orders=total,
            corrective_wo_count=corrective,
            preventive_wo_count=preventive,
            reactive_ratio_pct=reactive_ratio,
        )
