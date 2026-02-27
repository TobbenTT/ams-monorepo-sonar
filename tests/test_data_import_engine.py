"""Tests for Data Import Engine — Phase 6."""

from tools.engines.data_import_engine import DataImportEngine
from tools.models.schemas import ImportSource


class TestValidateHierarchyData:

    def test_valid_rows(self):
        rows = [
            {"equipment_id": "EQ-1", "description": "Pump A", "equipment_type": "ROTATING"},
            {"equipment_id": "EQ-2", "description": "Motor B", "equipment_type": "ELECTRICAL"},
        ]
        result = DataImportEngine.validate_hierarchy_data(rows)
        assert result.total_rows == 2
        assert result.valid_rows == 2
        assert result.error_rows == 0

    def test_missing_required_column(self):
        rows = [{"equipment_id": "EQ-1", "description": "Pump A"}]  # missing equipment_type
        result = DataImportEngine.validate_hierarchy_data(rows)
        assert result.error_rows == 1
        assert len(result.errors) == 1
        assert result.errors[0].column == "equipment_type"

    def test_empty_value(self):
        rows = [{"equipment_id": "", "description": "Pump A", "equipment_type": "ROTATING"}]
        result = DataImportEngine.validate_hierarchy_data(rows)
        assert result.error_rows == 1

    def test_empty_rows(self):
        result = DataImportEngine.validate_hierarchy_data([])
        assert result.total_rows == 0
        assert result.valid_rows == 0

    def test_with_column_mapping(self):
        rows = [{"asset_id": "EQ-1", "desc": "Pump A", "type": "ROTATING"}]
        mapping = {"asset_id": "equipment_id", "desc": "description", "type": "equipment_type"}
        result = DataImportEngine.validate_hierarchy_data(rows, column_mapping=mapping)
        assert result.valid_rows == 1


class TestValidateFailureHistory:

    def test_valid_rows(self):
        rows = [
            {"equipment_id": "EQ-1", "failure_date": "2025-01-15", "failure_mode": "BEARING_FAILURE"},
        ]
        result = DataImportEngine.validate_failure_history(rows)
        assert result.valid_rows == 1

    def test_invalid_date(self):
        rows = [
            {"equipment_id": "EQ-1", "failure_date": "not-a-date", "failure_mode": "BEARING_FAILURE"},
        ]
        result = DataImportEngine.validate_failure_history(rows)
        assert result.error_rows == 1
        assert any("date format" in e.message.lower() for e in result.errors)

    def test_missing_equipment_id(self):
        rows = [{"failure_date": "2025-01-15", "failure_mode": "BEARING_FAILURE"}]
        result = DataImportEngine.validate_failure_history(rows)
        assert result.error_rows == 1


class TestValidateMaintenancePlan:

    def test_valid_rows(self):
        rows = [
            {"equipment_id": "EQ-1", "task_description": "Oil change", "frequency": "MONTHLY"},
        ]
        result = DataImportEngine.validate_maintenance_plan(rows)
        assert result.valid_rows == 1

    def test_missing_frequency(self):
        rows = [{"equipment_id": "EQ-1", "task_description": "Oil change"}]
        result = DataImportEngine.validate_maintenance_plan(rows)
        assert result.error_rows == 1


class TestDetectColumnMapping:

    def test_exact_match(self):
        headers = ["equipment_id", "description", "equipment_type"]
        mapping = DataImportEngine.detect_column_mapping(headers, ImportSource.EQUIPMENT_HIERARCHY)
        assert mapping.confidence == 1.0
        assert len(mapping.mapping) == 3

    def test_alias_match(self):
        headers = ["asset_id", "name", "category"]
        mapping = DataImportEngine.detect_column_mapping(headers, ImportSource.EQUIPMENT_HIERARCHY)
        assert mapping.confidence == 1.0
        assert mapping.mapping["asset_id"] == "equipment_id"

    def test_partial_match(self):
        headers = ["equipment_id", "random_col"]
        mapping = DataImportEngine.detect_column_mapping(headers, ImportSource.EQUIPMENT_HIERARCHY)
        assert mapping.confidence < 1.0

    def test_no_match(self):
        headers = ["foo", "bar", "baz"]
        mapping = DataImportEngine.detect_column_mapping(headers, ImportSource.EQUIPMENT_HIERARCHY)
        assert mapping.confidence == 0.0


class TestSummarizeImport:

    def test_summary_all_valid(self):
        rows = [
            {"equipment_id": "EQ-1", "description": "Pump", "equipment_type": "ROTATING"},
            {"equipment_id": "EQ-2", "description": "Motor", "equipment_type": "ELECTRICAL"},
        ]
        result = DataImportEngine.validate_hierarchy_data(rows)
        summary = DataImportEngine.summarize_import(result)
        assert summary.total_rows == 2
        assert summary.valid_pct == 100.0

    def test_summary_with_errors(self):
        rows = [
            {"equipment_id": "EQ-1", "description": "Pump", "equipment_type": "ROTATING"},
            {"equipment_id": "", "description": "Bad", "equipment_type": ""},
        ]
        result = DataImportEngine.validate_hierarchy_data(rows)
        summary = DataImportEngine.summarize_import(result)
        assert summary.valid_pct == 50.0
        assert len(summary.error_summary) > 0
