"""Tests for AGENT_TOOL_MAP access control — security boundaries between agents.

Extends the existing test_agent_tools.py::TestAgentToolMap with boundary
and security-focused tests to verify strict scope separation.
All tests are offline (no API key needed).
"""

import pytest

from agents.tool_wrappers.server import get_tools_for_agent, AGENT_TOOL_MAP
from agents.tool_wrappers.registry import TOOL_REGISTRY


def _get_tool_names(agent_type: str) -> set[str]:
    """Helper to get tool names for an agent as a set."""
    return {t["name"] for t in get_tools_for_agent(agent_type)}


class TestAgentToolBoundaries:
    """Verify that agents cannot access tools outside their scope."""

    def test_spare_parts_no_rcm_access(self):
        """Spare Parts agent should NOT have access to RCM decision tools."""
        names = _get_tool_names("spare_parts")
        assert "rcm_decide" not in names

    def test_spare_parts_no_criticality_access(self):
        """Spare Parts agent should NOT have access to criticality tools."""
        names = _get_tool_names("spare_parts")
        assert "assess_criticality" not in names

    def test_orchestrator_no_sap_upload_access(self):
        """Orchestrator should NOT have access to SAP upload generation."""
        names = _get_tool_names("orchestrator")
        assert "generate_sap_upload" not in names

    def test_reliability_no_sap_access(self):
        """Reliability agent should NOT have SAP export tools."""
        names = _get_tool_names("reliability")
        assert "generate_sap_upload" not in names

    def test_unknown_agent_returns_empty(self):
        """An unknown agent type should get an empty tool list."""
        tools = get_tools_for_agent("unknown_agent_xyz")
        assert tools == []


class TestAgentToolCompleteness:
    """Verify tool mapping completeness and counts."""

    def test_every_tool_assigned_to_at_least_one_agent(self):
        """Every registered tool should appear in at least one agent's tool map.

        Known orphans (documented): get_all_entity_states, validate_hierarchy,
        validate_functions, validate_criticality_data — utility tools used
        by the system but not assigned to any specific agent.
        """
        KNOWN_ORPHANS = {
            "get_all_entity_states",
            "validate_hierarchy",
            "validate_functions",
            "validate_criticality_data",
        }
        all_mapped_tools = set()
        for tool_names in AGENT_TOOL_MAP.values():
            all_mapped_tools.update(tool_names)

        orphans = []
        for tool_name in TOOL_REGISTRY:
            if tool_name not in all_mapped_tools and tool_name not in KNOWN_ORPHANS:
                orphans.append(tool_name)

        assert orphans == [], f"Unexpected orphan tools not assigned to any agent: {orphans}"

    def test_silently_skips_missing_tools(self):
        """get_tools_for_agent should silently skip tool names not in TOOL_REGISTRY."""
        # Temporarily add a fake tool name
        original = AGENT_TOOL_MAP["spare_parts"].copy()
        AGENT_TOOL_MAP["spare_parts"].append("_fake_nonexistent_tool_xyz_")
        try:
            tools = get_tools_for_agent("spare_parts")
            names = {t["name"] for t in tools}
            assert "_fake_nonexistent_tool_xyz_" not in names
            # Real tools still present
            assert "suggest_materials" in names
        finally:
            AGENT_TOOL_MAP["spare_parts"] = original

    def test_tool_count_per_agent(self):
        """Verify expected tool counts per agent type."""
        assert len(AGENT_TOOL_MAP["orchestrator"]) == 13
        assert len(AGENT_TOOL_MAP["reliability"]) == 48
        assert len(AGENT_TOOL_MAP["planning"]) == 58
        assert len(AGENT_TOOL_MAP["spare_parts"]) == 3
