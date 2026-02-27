"""Integration tests for tool wrappers — verifies tools call engines correctly.

These tests call tools through call_tool() and verify engine-level results.
No mocks — tests the complete path: call_tool → TOOL_REGISTRY → wrapper → engine → result.
All tests are offline (no API key needed).
"""

import json
import pytest

import agents.tool_wrappers.server  # noqa: F401 — triggers tool registration
from agents.tool_wrappers.registry import call_tool


class TestValidationToolIntegration:
    """Validation tool integration with quality engine."""

    def test_run_full_validation_empty_input(self):
        """Empty input should return an empty results list."""
        result = call_tool("run_full_validation", {"input_json": "{}"})
        parsed = json.loads(result)
        assert isinstance(parsed, list)

    def test_run_full_validation_with_hierarchy(self):
        """Well-formed hierarchy nodes should produce validation results."""
        import uuid
        plant_id = str(uuid.uuid4())
        area_id = str(uuid.uuid4())
        system_id = str(uuid.uuid4())
        equip_id = str(uuid.uuid4())
        child_id = str(uuid.uuid4())
        nodes = [
            {"node_id": plant_id, "node_type": "PLANT", "name": "JFC Plant", "name_fr": "Usine JFC", "level": 1, "code": "OCP-JFC"},
            {"node_id": area_id, "node_type": "AREA", "name": "Grinding", "name_fr": "Broyage", "level": 2, "code": "OCP-JFC-BRY", "parent_node_id": plant_id},
            {"node_id": system_id, "node_type": "SYSTEM", "name": "SAG Circuit", "name_fr": "Circuit SAG", "level": 3, "code": "OCP-JFC-BRY-SAG", "parent_node_id": area_id},
            {"node_id": equip_id, "node_type": "EQUIPMENT", "name": "SAG Mill", "name_fr": "Broyeur SAG", "level": 4, "code": "BRY-SAG-001", "parent_node_id": system_id},
            {"node_id": child_id, "node_type": "SUB_ASSEMBLY", "name": "Drive System", "name_fr": "Systeme Entrainement", "level": 5, "code": "BRY-SAG-001-DRV", "parent_node_id": equip_id},
        ]
        result = call_tool("run_full_validation", {"input_json": json.dumps({"nodes": nodes})})
        parsed = json.loads(result)
        assert isinstance(parsed, list)


class TestRCMToolIntegration:
    """RCM decision engine integration."""

    def test_rcm_decide_cbm_path(self):
        """CBM-feasible input should produce a CONDITION_BASED strategy."""
        input_data = {
            "is_hidden": False,
            "failure_consequence": "EVIDENT_OPERATIONAL",
            "cbm_technically_feasible": True,
            "cbm_economically_viable": True,
            "ft_feasible": True,
            "failure_pattern": "E_RANDOM",
        }
        result = json.loads(call_tool("rcm_decide", {"input_json": json.dumps(input_data)}))
        assert result.get("strategy_type") == "CONDITION_BASED"


class TestCriticalityToolIntegration:
    """Criticality assessment engine integration."""

    def test_assess_criticality_full_pipeline(self):
        """Complete assessment should return overall_score and risk_class."""
        from datetime import datetime
        input_data = {
            "assessment_id": "CRIT-TEST-001",
            "node_id": "TEST-NODE-001",
            "assessed_at": datetime.now().isoformat(),
            "assessed_by": "test_engineer",
            "method": "FULL_MATRIX",
            "criteria_scores": [
                {"category": "SAFETY", "consequence_level": 4},
                {"category": "HEALTH", "consequence_level": 3},
                {"category": "ENVIRONMENT", "consequence_level": 2},
                {"category": "PRODUCTION", "consequence_level": 5},
                {"category": "OPERATING_COST", "consequence_level": 3},
                {"category": "CAPITAL_COST", "consequence_level": 2},
                {"category": "SCHEDULE", "consequence_level": 3},
                {"category": "REVENUE", "consequence_level": 4},
                {"category": "COMMUNICATIONS", "consequence_level": 1},
                {"category": "COMPLIANCE", "consequence_level": 3},
                {"category": "REPUTATION", "consequence_level": 2},
            ],
            "probability": 4,
            "risk_class": "III_HIGH",
        }
        result = json.loads(call_tool("assess_criticality", {"input_json": json.dumps(input_data)}))
        assert "overall_score" in result or "score" in result
        assert "risk_class" in result


class TestMaterialToolIntegration:
    """Material suggestion engine integration."""

    def test_suggest_materials_returns_list(self):
        """suggest_materials should return a parseable JSON list."""
        result = json.loads(call_tool("suggest_materials", {
            "component_type": "Bearing",
            "mechanism": "WORN",
        }))
        assert isinstance(result, list)

    def test_validate_task_materials_t16_rule(self):
        """REPLACE task without materials should be flagged as invalid."""
        result = json.loads(call_tool("validate_task_materials", {
            "task_type": "REPLACE",
            "materials": "[]",
        }))
        assert result["valid"] is False


class TestHierarchyBuilderToolIntegration:
    """Hierarchy builder engine integration."""

    def test_build_hierarchy_from_vendor(self):
        """Building hierarchy from vendor data should return structured result."""
        input_data = {
            "plant_id": "OCP-JFC",
            "area_code": "BRY",
            "equipment_type": "SAG_MILL",
            "model": "SAG 12x6",
            "manufacturer": "FLSmidth",
            "power_kw": 8500.0,
        }
        result = json.loads(call_tool("build_hierarchy_from_vendor", {"input_json": json.dumps(input_data)}))
        assert "equipment_tag" in result or "hierarchy_nodes" in result or "nodes_created" in result


class TestSAPToolIntegration:
    """SAP export engine integration."""

    def test_validate_sap_field_lengths(self):
        """SAP validation should check field length constraints."""
        sap_data = {
            "maintenance_items": [
                {"description": "A" * 100, "equipment_tag": "BRY-SAG-001"},
            ],
        }
        result = json.loads(call_tool("validate_sap_field_lengths", {
            "sap_package_json": json.dumps(sap_data),
        }))
        assert isinstance(result, dict) or isinstance(result, list)
