"""Tests for Data Export Engine — Phase 6."""

from tools.engines.data_export_engine import DataExportEngine
from tools.models.schemas import ExportFormat


class TestPrepareEquipmentExport:

    def test_basic_export(self):
        data = [
            {"equipment_id": "EQ-1", "description": "Pump", "equipment_type": "ROTATING", "parent_id": "SYS-1"},
        ]
        result = DataExportEngine.prepare_equipment_export(data)
        assert result.format == ExportFormat.EXCEL
        assert len(result.sheets) == 1
        assert result.sheets[0].name == "Equipment"
        assert len(result.sheets[0].rows) == 1

    def test_headers_with_criticality_and_health(self):
        result = DataExportEngine.prepare_equipment_export([{"equipment_id": "EQ-1"}])
        headers = result.sheets[0].headers
        assert "Criticality Class" in headers
        assert "Health Score" in headers

    def test_headers_without_criticality(self):
        result = DataExportEngine.prepare_equipment_export(
            [{"equipment_id": "EQ-1"}], include_criticality=False,
        )
        headers = result.sheets[0].headers
        assert "Criticality Class" not in headers

    def test_headers_without_health(self):
        result = DataExportEngine.prepare_equipment_export(
            [{"equipment_id": "EQ-1"}], include_health=False,
        )
        headers = result.sheets[0].headers
        assert "Health Score" not in headers

    def test_empty_data(self):
        result = DataExportEngine.prepare_equipment_export([])
        assert len(result.sheets[0].rows) == 0


class TestPrepareKPIExport:

    def test_planning_kpis(self):
        kpis = {"kpis": [{"name": "wo_completion", "value": 90, "target": 85, "status": "ON_TARGET"}]}
        result = DataExportEngine.prepare_kpi_export(planning_kpis=kpis)
        assert any(s.name == "Planning KPIs" for s in result.sheets)

    def test_de_kpis(self):
        kpis = {"kpis": [{"name": "event_reporting", "value": 95, "target": 90}]}
        result = DataExportEngine.prepare_kpi_export(de_kpis=kpis)
        assert any(s.name == "DE KPIs" for s in result.sheets)

    def test_reliability_kpis(self):
        kpis = {"mtbf_days": 120, "availability_pct": 95.0}
        result = DataExportEngine.prepare_kpi_export(reliability_kpis=kpis)
        assert any(s.name == "Reliability KPIs" for s in result.sheets)

    def test_no_kpis(self):
        result = DataExportEngine.prepare_kpi_export()
        assert len(result.sheets) == 1
        assert result.sheets[0].name == "KPIs"

    def test_all_kpi_types(self):
        result = DataExportEngine.prepare_kpi_export(
            planning_kpis={"kpis": [{"name": "k1", "value": 1}]},
            de_kpis={"kpis": [{"name": "k2", "value": 2}]},
            reliability_kpis={"mtbf_days": 100},
        )
        assert len(result.sheets) == 3


class TestPrepareReportExport:

    def test_basic_report(self):
        report = {
            "metadata": {"report_type": "WEEKLY_MAINTENANCE", "plant_id": "P1", "generated_at": "2025-01-01"},
            "sections": [{"title": "Summary", "content": "Test", "metrics": {"wo": 10}}],
            "wo_completed_count": 10,
            "backlog_hours": 50,
        }
        result = DataExportEngine.prepare_report_export(report)
        assert len(result.sections) == 2
        assert len(result.sheets) == 1
        assert result.sheets[0].name == "Summary"

    def test_empty_report(self):
        result = DataExportEngine.prepare_report_export({})
        assert result.format == ExportFormat.EXCEL


class TestPrepareScheduleExport:

    def test_with_gantt_rows(self):
        program = {"program_id": "PROG-1", "week_number": 10, "year": 2025}
        gantt = [
            {"work_order_id": "WO-1", "description": "Fix pump", "planned_start": "2025-03-03",
             "planned_end": "2025-03-04", "duration_hours": 8, "resource_group": "MECH", "status": "PLANNED"},
        ]
        result = DataExportEngine.prepare_schedule_export(program, gantt_rows=gantt)
        assert len(result.sheets) == 2
        assert result.sheets[1].name == "Schedule"
        assert len(result.sheets[1].rows) == 1

    def test_without_gantt(self):
        result = DataExportEngine.prepare_schedule_export({"program_id": "PROG-1"})
        assert len(result.sheets) == 1
        assert result.sheets[0].name == "Program Overview"

    def test_metadata(self):
        result = DataExportEngine.prepare_schedule_export({"program_id": "PROG-1"})
        assert result.metadata["program_id"] == "PROG-1"
