"""Tests for MCP tool wrappers — verifies tools load, serialize, and execute correctly.

All tests are offline (no API key needed). They call tools directly via the registry.
"""

import json
import pytest

from agents.tool_wrappers.server import get_all_tools, get_tool_count, get_tools_for_agent, AGENT_TOOL_MAP
from agents.tool_wrappers.registry import call_tool, TOOL_REGISTRY


# ── Registry Tests ──────────────────────────────────────────────────────

class TestToolRegistry:

    def test_all_tools_loaded(self):
        """All 126 tools should be registered (62 original + 13 Phase 4A + 6 Phase 4B + 16 Phase 5 + 16 Phase 6 + 10 Phase 7 + 3 Phase 9B)."""
        assert get_tool_count() == 126

    def test_all_tools_have_metadata(self):
        tools = get_all_tools()
        for t in tools:
            assert "name" in t, f"Tool missing 'name'"
            assert "description" in t, f"Tool {t.get('name')} missing 'description'"
            assert "input_schema" in t, f"Tool {t.get('name')} missing 'input_schema'"
            assert len(t["description"]) > 10, f"Tool {t['name']} description too short"

    def test_no_duplicate_names(self):
        tools = get_all_tools()
        names = [t["name"] for t in tools]
        assert len(names) == len(set(names)), f"Duplicate tool names: {[n for n in names if names.count(n) > 1]}"

    def test_unknown_tool_returns_error(self):
        result = call_tool("nonexistent_tool", {})
        parsed = json.loads(result)
        assert "error" in parsed
        assert "Unknown tool" in parsed["error"]


# ── Agent Tool Map Tests ────────────────────────────────────────────────

class TestAgentToolMap:

    def test_four_agents_defined(self):
        assert set(AGENT_TOOL_MAP.keys()) == {"orchestrator", "reliability", "planning", "spare_parts"}

    def test_all_mapped_tools_exist(self):
        for agent, tool_names in AGENT_TOOL_MAP.items():
            for tool_name in tool_names:
                assert tool_name in TOOL_REGISTRY, f"Agent '{agent}' maps to unknown tool '{tool_name}'"

    def test_get_tools_for_agent(self):
        for agent_type in AGENT_TOOL_MAP:
            tools = get_tools_for_agent(agent_type)
            assert len(tools) == len(AGENT_TOOL_MAP[agent_type])
            for t in tools:
                assert "name" in t
                assert "description" in t
                assert "input_schema" in t

    def test_reliability_has_core_tools(self):
        tools = get_tools_for_agent("reliability")
        names = {t["name"] for t in tools}
        assert "assess_criticality" in names
        assert "rcm_decide" in names
        assert "validate_fm_combination" in names
        assert "fit_weibull" in names

    def test_planning_has_core_tools(self):
        tools = get_tools_for_agent("planning")
        names = {t["name"] for t in tools}
        assert "generate_sap_upload" in names
        assert "find_all_groups" in names
        assert "generate_work_instruction" in names
        assert "create_capa" in names

    def test_spare_parts_has_3_tools(self):
        tools = get_tools_for_agent("spare_parts")
        names = {t["name"] for t in tools}
        assert names == {"suggest_materials", "validate_task_materials", "resolve_equipment"}

    def test_orchestrator_has_validation_tools(self):
        tools = get_tools_for_agent("orchestrator")
        names = {t["name"] for t in tools}
        assert "run_full_validation" in names
        assert "evaluate_confidence" in names
        assert "validate_state_transition" in names


# ── FM Lookup Tool Tests ────────────────────────────────────────────────

class TestFMLookupTools:

    def test_list_all_mechanisms(self):
        result = json.loads(call_tool("list_all_mechanisms", {}))
        assert "mechanisms" in result
        assert len(result["mechanisms"]) == 18
        assert "WEARS" in result["mechanisms"]
        assert "CORRODES" in result["mechanisms"]

    def test_list_all_causes(self):
        result = json.loads(call_tool("list_all_causes", {}))
        assert "causes" in result
        assert len(result["causes"]) > 30

    def test_valid_fm_combination(self):
        result = json.loads(call_tool("validate_fm_combination", {
            "mechanism": "WEARS",
            "cause": "MECHANICAL_OVERLOAD",
        }))
        assert result["valid"] is True

    def test_invalid_fm_combination(self):
        result = json.loads(call_tool("validate_fm_combination", {
            "mechanism": "WEARS",
            "cause": "LIGHTNING",
        }))
        assert result["valid"] is False

    def test_get_valid_causes_for_mechanism(self):
        result = json.loads(call_tool("get_valid_fm_combinations", {
            "mechanism": "CORRODES",
        }))
        assert "causes" in result
        assert len(result["causes"]) > 0


# ── Criticality Tool Tests ──────────────────────────────────────────────

class TestCriticalityTools:

    def test_determine_risk_class(self):
        result = json.loads(call_tool("determine_risk_class", {"overall_score": 85}))
        assert "risk_class" in result

    def test_validate_criticality_matrix(self):
        scores = json.dumps([
            {"category": "SAFETY", "consequence_level": 4},
            {"category": "HEALTH", "consequence_level": 3},
            {"category": "ENVIRONMENT", "consequence_level": 2},
            {"category": "PRODUCTION", "consequence_level": 3},
            {"category": "OPERATING_COST", "consequence_level": 2},
            {"category": "CAPITAL_COST", "consequence_level": 1},
            {"category": "SCHEDULE", "consequence_level": 2},
            {"category": "REVENUE", "consequence_level": 3},
            {"category": "COMMUNICATIONS", "consequence_level": 2},
            {"category": "COMPLIANCE", "consequence_level": 3},
            {"category": "REPUTATION", "consequence_level": 2},
        ])
        result = json.loads(call_tool("validate_criticality_matrix", {"criteria_scores": scores}))
        assert "valid" in result


# ── State Machine Tool Tests ────────────────────────────────────────────

class TestStateMachineTools:

    def test_valid_transition(self):
        result = json.loads(call_tool("validate_state_transition", {
            "entity_type": "approval",
            "current_state": "DRAFT",
            "target_state": "REVIEWED",
        }))
        assert result["valid"] is True

    def test_invalid_transition(self):
        # StateMachine raises TransitionError for invalid transitions,
        # which the tool wrapper catches and returns as an error
        result = json.loads(call_tool("validate_state_transition", {
            "entity_type": "approval",
            "current_state": "DRAFT",
            "target_state": "APPROVED",
        }))
        assert "error" in result

    def test_get_valid_transitions(self):
        result = json.loads(call_tool("get_valid_transitions", {
            "entity_type": "work_package",
            "current_state": "REVIEWED",
        }))
        assert "valid_next_states" in result
        assert "APPROVED" in result["valid_next_states"]

    def test_get_all_entity_states(self):
        result = json.loads(call_tool("get_all_entity_states", {
            "entity_type": "sap_upload",
        }))
        assert "states" in result
        assert "GENERATED" in result["states"]


# ── Priority Tool Tests ─────────────────────────────────────────────────

class TestPriorityTools:

    def test_calculate_priority(self):
        input_data = json.dumps({
            "equipment_criticality": "AA",
            "has_safety_flags": True,
            "failure_mode_detected": "Bearing failure",
            "production_impact_estimated": True,
            "is_recurring": True,
            "equipment_running": False,
        })
        result = json.loads(call_tool("calculate_priority", {"input_json": input_data}))
        assert "priority" in result or "priority_level" in result or "score" in result

    def test_validate_priority_override(self):
        result = json.loads(call_tool("validate_priority_override", {
            "ai_priority": "P1",
            "human_priority": "P3",
        }))
        assert isinstance(result, dict)


# ── Naming Validation Tool Tests ────────────────────────────────────────

class TestNamingTools:

    def test_wp_name_returns_issues(self):
        result = json.loads(call_tool("validate_wp_name", {"name": "12W SAG MILL 001 OFF"}))
        assert "issues" in result

    def test_wp_name_too_long(self):
        long_name = "A" * 50
        result = json.loads(call_tool("validate_wp_name", {"name": long_name}))
        assert result["valid"] is False

    def test_task_name_returns_issues(self):
        result = json.loads(call_tool("validate_task_name", {
            "name": "Inspect bearing condition and vibration levels",
            "task_type": "INSPECT",
        }))
        assert "issues" in result

    def test_valid_fm_what(self):
        result = json.loads(call_tool("validate_fm_what", {"what": "Bearing"}))
        assert result["valid"] is True


# ── Health / KPI / Weibull Tool Tests ───────────────────────────────────

class TestAnalyticsTools:

    def test_calculate_mtbf(self):
        result = json.loads(call_tool("calculate_mtbf", {
            "failure_dates": json.dumps(["2024-01-15", "2024-06-20", "2024-11-10"]),
        }))
        assert "mtbf_days" in result

    def test_calculate_availability(self):
        result = json.loads(call_tool("calculate_availability", {
            "total_period_hours": 8760.0,
            "total_downtime_hours": 120.0,
        }))
        assert "availability_pct" in result

    def test_weibull_reliability(self):
        result = json.loads(call_tool("weibull_reliability", {
            "t": 1000.0,
            "beta": 2.5,
            "eta": 5000.0,
            "gamma": 0.0,
        }))
        assert "reliability" in result

    def test_determine_health_trend(self):
        result = json.loads(call_tool("determine_health_trend", {
            "current_score": 72.0,
            "previous_score": 80.0,
        }))
        assert "trend" in result


# ── Material Tool Tests ─────────────────────────────────────────────────

class TestMaterialTools:

    def test_suggest_materials(self):
        result = json.loads(call_tool("suggest_materials", {
            "component_type": "Bearing",
            "mechanism": "WORN",
        }))
        assert isinstance(result, list)
        assert len(result) > 0

    def test_validate_task_materials_replace_no_materials(self):
        result = json.loads(call_tool("validate_task_materials", {
            "task_type": "REPLACE",
            "materials": "[]",
        }))
        assert result["valid"] is False


# ── CAPA Tool Tests ─────────────────────────────────────────────────────

class TestCAPATools:

    def test_create_capa(self):
        result = json.loads(call_tool("create_capa", {
            "input_json": json.dumps({
                "title": "Bearing failure recurrence",
                "description": "SAG Mill 001 bearing fails every 6 months",
                "plant_id": "OCP-JFC",
                "source": "RCM Analysis",
                "capa_type": "CORRECTIVE",
            }),
        }))
        assert "capa" in result or "title" in result

    def test_get_capa_summary(self):
        result = json.loads(call_tool("get_capa_summary", {
            "capas_json": json.dumps([]),
        }))
        assert isinstance(result, dict)
