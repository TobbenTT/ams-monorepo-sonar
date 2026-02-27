"""Tests for Reporting Engine — Phase 6."""

from datetime import date

from tools.engines.reporting_engine import ReportingEngine
from tools.models.schemas import ReportType, TrafficLight


class TestGenerateWeeklyReport:

    def test_basic_weekly_report(self):
        result = ReportingEngine.generate_weekly_report("PLANT-1", 10, 2025)
        assert result.week_number == 10
        assert result.year == 2025
        assert result.metadata.plant_id == "PLANT-1"
        assert result.metadata.report_type == ReportType.WEEKLY_MAINTENANCE

    def test_weekly_with_work_orders(self):
        result = ReportingEngine.generate_weekly_report(
            "PLANT-1", 5, 2025,
            work_orders_completed=[{"wo_id": "WO-1"}, {"wo_id": "WO-2"}],
            work_orders_open=[{"wo_id": "WO-3"}],
        )
        assert result.wo_completed_count == 2
        assert result.wo_open_count == 1

    def test_weekly_safety_incidents(self):
        result = ReportingEngine.generate_weekly_report(
            "PLANT-1", 1, 2025, safety_incidents=3,
        )
        assert result.safety_incidents == 3

    def test_weekly_backlog_hours(self):
        result = ReportingEngine.generate_weekly_report(
            "PLANT-1", 1, 2025, backlog_hours=150.5,
        )
        assert result.backlog_hours == 150.5

    def test_weekly_key_events(self):
        result = ReportingEngine.generate_weekly_report(
            "PLANT-1", 1, 2025, key_events=["Pump failure", "Valve replaced"],
        )
        assert len(result.key_events) == 2
        assert len(result.sections) == 4  # WO, Safety, Backlog, Key Events

    def test_weekly_sections_without_events(self):
        result = ReportingEngine.generate_weekly_report("PLANT-1", 1, 2025)
        assert len(result.sections) == 3  # No key events section

    def test_weekly_period_dates(self):
        result = ReportingEngine.generate_weekly_report("PLANT-1", 1, 2025)
        assert result.metadata.period_start.year == 2024 or result.metadata.period_start.year == 2025
        assert result.metadata.period_end > result.metadata.period_start


class TestGenerateMonthlyKPIReport:

    def test_basic_monthly_report(self):
        result = ReportingEngine.generate_monthly_kpi_report("PLANT-1", 6, 2025)
        assert result.month == 6
        assert result.year == 2025
        assert result.metadata.report_type == ReportType.MONTHLY_KPI

    def test_monthly_period_dates(self):
        result = ReportingEngine.generate_monthly_kpi_report("PLANT-1", 6, 2025)
        assert result.metadata.period_start == date(2025, 6, 1)
        assert result.metadata.period_end == date(2025, 6, 30)

    def test_monthly_december_period(self):
        result = ReportingEngine.generate_monthly_kpi_report("PLANT-1", 12, 2025)
        assert result.metadata.period_end == date(2025, 12, 31)

    def test_monthly_traffic_lights(self):
        planning_kpis = {
            "kpis": [
                {"name": "wo_completion", "value": 95.0, "target": 90.0, "status": "ON_TARGET"},
                {"name": "reactive_pct", "value": 30.0, "target": 20.0, "status": "BELOW_TARGET"},
            ],
            "overall_compliance": 80.0,
        }
        result = ReportingEngine.generate_monthly_kpi_report(
            "PLANT-1", 1, 2025, planning_kpis=planning_kpis,
        )
        assert "planning_wo_completion" in result.traffic_lights
        assert result.traffic_lights["planning_wo_completion"] == TrafficLight.GREEN.value

    def test_monthly_sections_count(self):
        result = ReportingEngine.generate_monthly_kpi_report("PLANT-1", 1, 2025)
        assert len(result.sections) == 3

    def test_monthly_trends_improving(self):
        planning = {"kpis": [], "overall_compliance": 85.0}
        prev = {"planning_kpi_summary": {"overall_compliance": 70.0}}
        result = ReportingEngine.generate_monthly_kpi_report(
            "PLANT-1", 2, 2025, planning_kpis=planning, previous_month_kpis=prev,
        )
        assert result.trends.get("planning") == "IMPROVING"


class TestGenerateQuarterlyReview:

    def test_basic_quarterly_report(self):
        result = ReportingEngine.generate_quarterly_review("PLANT-1", 1, 2025)
        assert result.quarter == 1
        assert result.year == 2025
        assert result.metadata.report_type == ReportType.QUARTERLY_REVIEW

    def test_quarterly_period_dates_q1(self):
        result = ReportingEngine.generate_quarterly_review("PLANT-1", 1, 2025)
        assert result.metadata.period_start == date(2025, 1, 1)
        assert result.metadata.period_end == date(2025, 3, 31)

    def test_quarterly_with_rbi_recommendation(self):
        result = ReportingEngine.generate_quarterly_review(
            "PLANT-1", 1, 2025, rbi_summary={"overdue_count": 5},
        )
        assert any("overdue RBI" in r for r in result.strategic_recommendations)

    def test_quarterly_with_bad_actors(self):
        result = ReportingEngine.generate_quarterly_review(
            "PLANT-1", 1, 2025,
            bad_actors=[{"equipment_id": "EQ-1"}, {"equipment_id": "EQ-2"}],
        )
        assert any("bad actors" in r for r in result.strategic_recommendations)

    def test_quarterly_default_recommendation(self):
        result = ReportingEngine.generate_quarterly_review("PLANT-1", 1, 2025)
        assert any("on track" in r for r in result.strategic_recommendations)


class TestGetReportSections:

    def test_weekly_sections(self):
        sections = ReportingEngine.get_report_sections(ReportType.WEEKLY_MAINTENANCE)
        assert len(sections) == 4
        titles = [s.title for s in sections]
        assert "Work Order Summary" in titles

    def test_monthly_sections(self):
        sections = ReportingEngine.get_report_sections(ReportType.MONTHLY_KPI)
        assert len(sections) == 4

    def test_quarterly_sections(self):
        sections = ReportingEngine.get_report_sections(ReportType.QUARTERLY_REVIEW)
        assert len(sections) == 5
