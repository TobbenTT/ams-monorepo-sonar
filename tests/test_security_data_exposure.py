"""Security tests — data exposure and information leakage.

Tests that API keys, filesystem paths, database URLs, and system prompts
are not leaked through endpoints, tool errors, or session state.
"""

import json
import os
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from api.main import app
from agents.orchestration.session_state import SessionState

pytestmark = pytest.mark.security

client = TestClient(app)


class TestAPIKeyNotExposed:
    """Verify ANTHROPIC_API_KEY is never exposed."""

    def test_api_key_not_in_health_endpoint(self):
        """Health endpoint should not contain API key."""
        resp = client.get("/health")
        assert "ANTHROPIC" not in resp.text
        # Also check the actual env var value if set
        key = os.getenv("ANTHROPIC_API_KEY", "")
        if key:
            assert key not in resp.text

    def test_api_key_not_in_root_endpoint(self):
        """Root endpoint should not contain API key."""
        resp = client.get("/")
        key = os.getenv("ANTHROPIC_API_KEY", "")
        if key:
            assert key not in resp.text

    def test_session_state_to_json_no_api_key(self):
        """SessionState serialization should not contain API key."""
        s = SessionState(session_id="s1", equipment_tag="Test")
        j = s.to_json()
        assert "ANTHROPIC_API_KEY" not in j
        key = os.getenv("ANTHROPIC_API_KEY", "")
        if key:
            assert key not in j

    def test_database_url_not_in_any_endpoint(self):
        """No endpoint should return DATABASE_URL value."""
        db_url = os.getenv("DATABASE_URL", "sqlite:///./ocp_maintenance.db")
        for path in ["/", "/health"]:
            resp = client.get(path)
            assert db_url not in resp.text


class TestFilePathExposure:
    """Verify filesystem paths are not leaked in error responses."""

    def test_tool_error_no_absolute_file_paths(self):
        """Tool errors should not expose absolute filesystem paths."""
        from agents.tool_wrappers.registry import call_tool
        result = call_tool("nonexistent_tool_xyz", {})
        assert "C:\\" not in result
        assert "/home/" not in result
        assert "/Users/" not in result

    def test_sap_mock_error_message(self):
        """SAP mock error for unknown transaction should not show full filepath."""
        from api.services.sap_service import get_mock_data
        result = get_mock_data("INVALID_TX")
        assert "error" in result
        # The error should mention the transaction, but not expose the full path
        error_msg = result["error"]
        assert "Unknown transaction" in error_msg
        # Should NOT contain the full filepath
        assert "C:\\" not in error_msg or "sessions" not in error_msg


class TestValidationDataExposure:
    """Validation results should not leak server internals."""

    def test_validation_details_no_server_paths(self):
        """Validation results should not contain server-side file paths."""
        import uuid
        from agents.orchestration.workflow import _run_validation
        s = SessionState(session_id="s1")
        plant_id = str(uuid.uuid4())
        area_id = str(uuid.uuid4())
        system_id = str(uuid.uuid4())
        equip_id = str(uuid.uuid4())
        s.hierarchy_nodes.extend([
            {"node_id": plant_id, "node_type": "PLANT", "name": "JFC Plant", "name_fr": "Usine JFC", "level": 1, "code": "OCP-JFC"},
            {"node_id": area_id, "node_type": "AREA", "name": "Grinding", "name_fr": "Broyage", "level": 2, "code": "OCP-JFC-BRY", "parent_node_id": plant_id},
            {"node_id": system_id, "node_type": "SYSTEM", "name": "SAG", "name_fr": "SAG", "level": 3, "code": "OCP-JFC-BRY-SAG", "parent_node_id": area_id},
            {"node_id": equip_id, "node_type": "EQUIPMENT", "name": "Mill", "name_fr": "Broyeur", "level": 4, "code": "BRY-SAG-001", "parent_node_id": system_id},
        ])
        validation = _run_validation(s)
        if validation.details:
            for detail in validation.details:
                detail_str = json.dumps(detail)
                assert "C:\\" not in detail_str
                assert "/home/" not in detail_str


class TestSystemPromptNotLeaked:
    """System prompt content should not appear in session output."""

    def test_system_prompt_not_in_session_json(self):
        """Session state JSON should not contain system prompt text."""
        s = SessionState(session_id="s1")
        s.record_interaction("orchestrator", 1, "Decompose equipment", "12 nodes created")
        j = s.to_json()
        # System prompts contain specific markers like these
        assert "You are the Orchestrator" not in j
        assert "MUST follow" not in j
        assert "system_prompt" not in j


class TestAuditLogSafety:
    """Audit trail should not contain sensitive data."""

    def test_interaction_no_password_field(self):
        """Recorded interactions should not have password-like fields."""
        s = SessionState(session_id="s1")
        s.record_interaction("reliability", 1, "instruction", "response")
        for interaction in s.agent_interactions:
            keys = set(interaction.keys())
            assert "password" not in keys
            assert "api_key" not in keys
            assert "secret" not in keys
