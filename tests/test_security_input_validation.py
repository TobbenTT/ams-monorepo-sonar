"""Security tests — input validation and sanitization.

Tests that malicious/malformed inputs to tool wrappers, session state,
and API endpoints are handled safely without crashes or code execution.
"""

import json

import pytest

from agents.tool_wrappers.registry import call_tool
from agents.orchestration.session_state import SessionState
from agents.orchestration.milestones import (
    MilestoneGate,
    MilestoneStatus,
    ValidationSummary,
)

pytestmark = pytest.mark.security


class TestToolCallInputSanitization:
    """Tool call boundary: malicious inputs via call_tool()."""

    def test_sql_injection_in_tool_name(self):
        """SQL injection in tool name should return clean error, not crash."""
        result = call_tool("'; DROP TABLE tools; --", {})
        parsed = json.loads(result)
        assert "error" in parsed
        assert "Unknown tool" in parsed["error"]

    def test_script_injection_in_args(self):
        """XSS payload in arguments should not cause code execution."""
        result = call_tool("rcm_decide", {
            "input_json": '<script>alert("xss")</script>',
        })
        # Should get a JSON error (parse failure or engine error), not code exec
        parsed = json.loads(result)
        assert isinstance(parsed, dict)

    def test_oversized_input_handled(self):
        """Very large input should be handled without OOM crash."""
        large_input = "A" * (1024 * 1024)  # 1MB
        result = call_tool("run_full_validation", {"input_json": large_input})
        # Should return an error (invalid JSON), not crash
        parsed = json.loads(result)
        assert isinstance(parsed, (dict, list))

    def test_null_bytes_in_input(self):
        """Null bytes in arguments should not crash."""
        result = call_tool("run_full_validation", {"input_json": "{\x00}"})
        parsed = json.loads(result)
        assert isinstance(parsed, (dict, list))

    def test_unicode_control_chars(self):
        """Unicode control characters in input handled gracefully."""
        malicious = '{"name": "test\u0000\u001f\u007f"}'
        result = call_tool("run_full_validation", {"input_json": malicious})
        parsed = json.loads(result)
        assert isinstance(parsed, (dict, list))


class TestSessionStateSanitization:
    """Session state: XSS and injection via entity fields."""

    def test_xss_in_equipment_tag(self):
        """Script tags in equipment_tag should serialize as plain text."""
        s = SessionState(session_id="s1")
        s.equipment_tag = '<script>alert("xss")</script>'
        j = s.to_json()
        # JSON serializes it as a string, no HTML interpretation
        assert "<script>" in j
        s2 = SessionState.from_json(j)
        assert s2.equipment_tag == '<script>alert("xss")</script>'

    def test_json_injection_in_hierarchy_node(self):
        """Malformed JSON fragments in entity fields should not corrupt state."""
        s = SessionState(session_id="s1")
        s.hierarchy_nodes.append({"name": '"}],"__hack__":true'})
        j = s.to_json()
        s2 = SessionState.from_json(j)
        assert s2.hierarchy_nodes[0]["name"] == '"}],"__hack__":true'


class TestValidationSummarySanitization:
    """ValidationSummary with edge-case values."""

    def test_negative_error_counts(self):
        """Negative error counts should not crash has_errors or is_clean."""
        v = ValidationSummary(errors=-1, warnings=-2, info=-3)
        # has_errors checks errors > 0, so negative is False
        assert v.has_errors is False
        # is_clean checks errors == 0 and warnings == 0 — negative fails this
        # The key point is it doesn't crash
        _ = v.is_clean

    def test_very_large_counts(self):
        """Very large counts should be handled."""
        v = ValidationSummary(errors=999999, warnings=999999, info=999999)
        assert v.has_errors is True


class TestMilestoneFeedbackOverflow:
    """Milestone gate with extreme feedback values."""

    def test_large_feedback_stored(self):
        """100KB feedback string should be stored without crash."""
        g = MilestoneGate(
            number=1, name="Test", description="Test",
            required_agents=["reliability"], required_entities=["hierarchy_nodes"],
        )
        g.start()
        g.present(ValidationSummary())
        large_feedback = "X" * 100_000
        g.modify(large_feedback)
        assert len(g.human_feedback) == 100_000

    def test_deep_nesting_in_hierarchy_node(self):
        """Deeply nested dict in hierarchy node should not cause stack overflow."""
        s = SessionState(session_id="s1")
        nested = {"level": 0}
        current = nested
        for i in range(500):  # 500 levels deep
            current["child"] = {"level": i + 1}
            current = current["child"]
        s.hierarchy_nodes.append(nested)
        # Should serialize without RecursionError
        j = s.to_json()
        assert len(j) > 0


class TestSAPMockPathTraversal:
    """SAP mock data service: path traversal attempts."""

    def test_path_traversal_in_transaction(self):
        """Path traversal in transaction code should be rejected."""
        from api.services.sap_service import get_mock_data
        result = get_mock_data("../../etc/passwd")
        assert isinstance(result, dict)
        assert "error" in result
        assert "Unknown transaction" in result["error"]

    def test_null_transaction(self):
        """Empty transaction should be rejected."""
        from api.services.sap_service import get_mock_data
        result = get_mock_data("")
        assert isinstance(result, dict)
        assert "error" in result
