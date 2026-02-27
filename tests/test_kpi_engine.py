"""Tests for KPIEngine — REF-12 Rec 8: ISO 55002 §9.1 KPI Dashboard."""

import pytest
from datetime import date

from tools.engines.kpi_engine import KPIEngine, WorkOrderRecord
from tools.models.schemas import KPIMetrics


class TestMTBF:
    def test_regular_intervals(self):
        dates = [date(2025, 1, 1), date(2025, 4, 1), date(2025, 7, 1)]
        mtbf = KPIEngine.calculate_mtbf(dates)
        assert mtbf is not None
        assert mtbf == 90.5  # ~91 days average between failures

    def test_single_failure(self):
        assert KPIEngine.calculate_mtbf([date(2025, 1, 1)]) is None

    def test_no_failures(self):
        assert KPIEngine.calculate_mtbf([]) is None

    def test_two_failures(self):
        dates = [date(2025, 1, 1), date(2025, 3, 1)]
        mtbf = KPIEngine.calculate_mtbf(dates)
        assert mtbf == 59.0


class TestMTTR:
    def test_average_repair(self):
        durations = [2.0, 4.0, 6.0]
        mttr = KPIEngine.calculate_mttr(durations)
        assert mttr == 4.0

    def test_no_repairs(self):
        assert KPIEngine.calculate_mttr([]) is None

    def test_filters_zero(self):
        durations = [0.0, 3.0, 5.0]
        mttr = KPIEngine.calculate_mttr(durations)
        assert mttr == 4.0


class TestAvailability:
    def test_full_availability(self):
        avail = KPIEngine.calculate_availability(720, 0)
        assert avail == 100.0

    def test_some_downtime(self):
        avail = KPIEngine.calculate_availability(720, 72)
        assert avail == 90.0

    def test_zero_period(self):
        assert KPIEngine.calculate_availability(0, 0) is None

    def test_clamped_at_zero(self):
        avail = KPIEngine.calculate_availability(100, 200)
        assert avail == 0.0


class TestOEE:
    def test_simple_oee(self):
        oee = KPIEngine.calculate_oee(90.0)
        assert oee == 90.0

    def test_with_performance_quality(self):
        oee = KPIEngine.calculate_oee(90.0, 80.0, 95.0)
        assert oee == 68.4  # 0.9 * 0.8 * 0.95 * 100


class TestScheduleCompliance:
    def test_full_compliance(self):
        assert KPIEngine.calculate_schedule_compliance(10, 10) == 100.0

    def test_partial_compliance(self):
        assert KPIEngine.calculate_schedule_compliance(10, 7) == 70.0

    def test_no_planned(self):
        assert KPIEngine.calculate_schedule_compliance(0, 0) is None


class TestReactiveRatio:
    def test_all_corrective(self):
        assert KPIEngine.calculate_reactive_ratio(10, 10) == 100.0

    def test_no_corrective(self):
        assert KPIEngine.calculate_reactive_ratio(0, 10) == 0.0

    def test_mixed(self):
        assert KPIEngine.calculate_reactive_ratio(3, 10) == 30.0

    def test_empty(self):
        assert KPIEngine.calculate_reactive_ratio(0, 0) is None


class TestCalculateFromRecords:
    @pytest.fixture
    def sample_records(self):
        return [
            WorkOrderRecord(
                wo_id="WO-001", equipment_id="EQ-001", order_type="PM03",
                created_date=date(2025, 1, 15),
                planned_start=date(2025, 1, 20), planned_end=date(2025, 1, 22),
                actual_start=date(2025, 1, 21), actual_end=date(2025, 1, 22),
                actual_duration_hours=8.0, is_failure=True,
            ),
            WorkOrderRecord(
                wo_id="WO-002", equipment_id="EQ-001", order_type="PM02",
                created_date=date(2025, 3, 1),
                planned_start=date(2025, 3, 5), planned_end=date(2025, 3, 6),
                actual_start=date(2025, 3, 5), actual_end=date(2025, 3, 5),
                actual_duration_hours=4.0, is_failure=False,
            ),
            WorkOrderRecord(
                wo_id="WO-003", equipment_id="EQ-001", order_type="PM03",
                created_date=date(2025, 5, 10),
                planned_start=date(2025, 5, 12), planned_end=date(2025, 5, 14),
                actual_start=date(2025, 5, 12), actual_end=date(2025, 5, 13),
                actual_duration_hours=12.0, is_failure=True,
            ),
            WorkOrderRecord(
                wo_id="WO-004", equipment_id="EQ-001", order_type="PM02",
                created_date=date(2025, 6, 1),
                planned_start=date(2025, 6, 5), planned_end=date(2025, 6, 6),
                actual_start=date(2025, 6, 5), actual_end=date(2025, 6, 5),
                actual_duration_hours=3.0, is_failure=False,
            ),
            WorkOrderRecord(
                wo_id="WO-005", equipment_id="EQ-002", order_type="PM03",
                created_date=date(2025, 4, 1),
                planned_start=date(2025, 4, 3), planned_end=date(2025, 4, 4),
                actual_start=date(2025, 4, 10), actual_end=date(2025, 4, 11),
                actual_duration_hours=6.0, is_failure=True,
            ),
        ]

    def test_all_records(self, sample_records):
        result = KPIEngine.calculate_from_records(
            records=sample_records,
            plant_id="OCP-JFC1",
            period_start=date(2025, 1, 1),
            period_end=date(2025, 7, 1),
        )
        assert isinstance(result, KPIMetrics)
        assert result.total_work_orders == 5
        assert result.corrective_wo_count == 3
        assert result.preventive_wo_count == 2
        assert result.mtbf_days is not None
        assert result.mttr_hours is not None
        assert result.availability_pct is not None
        assert result.reactive_ratio_pct == 60.0

    def test_filtered_by_equipment(self, sample_records):
        result = KPIEngine.calculate_from_records(
            records=sample_records,
            plant_id="OCP-JFC1",
            period_start=date(2025, 1, 1),
            period_end=date(2025, 7, 1),
            equipment_id="EQ-001",
        )
        assert result.total_work_orders == 4
        assert result.equipment_id == "EQ-001"

    def test_pm_compliance(self, sample_records):
        result = KPIEngine.calculate_from_records(
            records=sample_records,
            plant_id="OCP-JFC1",
            period_start=date(2025, 1, 1),
            period_end=date(2025, 7, 1),
        )
        assert result.pm_compliance_pct == 100.0  # Both PM02s were executed

    def test_schedule_compliance_counts_late(self, sample_records):
        result = KPIEngine.calculate_from_records(
            records=sample_records,
            plant_id="OCP-JFC1",
            period_start=date(2025, 1, 1),
            period_end=date(2025, 7, 1),
        )
        # WO-005 was late (actual_start 4/10 > planned_end 4/4)
        assert result.schedule_compliance_pct is not None
        assert result.schedule_compliance_pct < 100.0
