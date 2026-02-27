"""Security tests — agent-to-tool boundary enforcement and code safety.

Tests that agents cannot access unauthorized tools, tool source code
does not use dangerous patterns (eval, exec, os.system), and tool
names follow safe naming conventions.
"""

import json
import re
from pathlib import Path

import pytest

import agents.tool_wrappers.server  # noqa: F401 — triggers registration
from agents.tool_wrappers.registry import call_tool, TOOL_REGISTRY
from agents.tool_wrappers.server import get_tools_for_agent, AGENT_TOOL_MAP

pytestmark = pytest.mark.security

TOOL_WRAPPERS_DIR = Path(__file__).parent.parent / "agents" / "tool_wrappers"


class TestAgentBoundaryEnforcement:
    """Agents cannot access tools outside their assigned set."""

    def test_spare_parts_no_admin_tools(self):
        """spare_parts agent should not have admin or reset tools."""
        spare_tools = {t["name"] for t in get_tools_for_agent("spare_parts")}
        admin_tools = {"reset_database", "seed_database", "admin_reset"}
        assert spare_tools.isdisjoint(admin_tools), \
            f"spare_parts has admin tools: {spare_tools & admin_tools}"

    def test_orchestrator_no_direct_sap_write(self):
        """Orchestrator should not have direct SAP mutation tools."""
        orch_tools = {t["name"] for t in get_tools_for_agent("orchestrator")}
        assert "generate_sap_upload" not in orch_tools


class TestToolSourceCodeSafety:
    """Scan tool wrapper source for dangerous patterns."""

    def test_no_eval_exec_in_tool_wrappers(self):
        """No tool wrapper should use eval() or exec()."""
        dangerous_patterns = [r'\beval\s*\(', r'\bexec\s*\(']
        violations = []
        for py_file in TOOL_WRAPPERS_DIR.glob("*.py"):
            content = py_file.read_text(encoding="utf-8")
            for pattern in dangerous_patterns:
                matches = re.findall(pattern, content)
                if matches:
                    violations.append(f"{py_file.name}: {matches}")
        assert not violations, f"Dangerous patterns found: {violations}"

    def test_no_os_system_in_tool_wrappers(self):
        """No tool wrapper should use os.system() or subprocess."""
        dangerous_patterns = [r'os\.system\s*\(', r'subprocess\.\w+\s*\(']
        violations = []
        for py_file in TOOL_WRAPPERS_DIR.glob("*.py"):
            content = py_file.read_text(encoding="utf-8")
            for pattern in dangerous_patterns:
                matches = re.findall(pattern, content)
                if matches:
                    violations.append(f"{py_file.name}: {matches}")
        assert not violations, f"Dangerous patterns found: {violations}"


class TestToolRegistrySafety:
    """Registry-level safety checks."""

    def test_call_tool_rejects_dunder_methods(self):
        """Dunder method names should be treated as unknown tools."""
        result = call_tool("__import__", {})
        parsed = json.loads(result)
        assert "error" in parsed
        assert "Unknown tool" in parsed["error"]

    def test_call_tool_rejects_empty_name(self):
        """Empty tool name should return error."""
        result = call_tool("", {})
        parsed = json.loads(result)
        assert "error" in parsed

    def test_tool_names_valid_identifiers(self):
        """All registered tool names should match safe pattern."""
        pattern = re.compile(r'^[a-z][a-z0-9_]*$')
        invalid = [name for name in TOOL_REGISTRY if not pattern.match(name)]
        assert not invalid, f"Invalid tool names: {invalid}"

    def test_agent_tool_map_keys_match_known_agents(self):
        """AGENT_TOOL_MAP should only contain known agent types."""
        known_agents = {"orchestrator", "reliability", "planning", "spare_parts"}
        map_agents = set(AGENT_TOOL_MAP.keys())
        unknown = map_agents - known_agents
        assert not unknown, f"Unknown agents in AGENT_TOOL_MAP: {unknown}"

    def test_agent_tool_map_deep_copy_safety(self):
        """Modifying returned tools should not affect the registry."""
        tools_before = get_tools_for_agent("orchestrator")
        # Mutate the returned list
        tools_before.append({"name": "hacked_tool", "description": "bad"})
        # Get fresh copy
        tools_after = get_tools_for_agent("orchestrator")
        names = {t["name"] for t in tools_after}
        assert "hacked_tool" not in names
