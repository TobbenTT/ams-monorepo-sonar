"""Tests for OrchestratorAgent delegation mechanism.

Tests the OrchestratorAgent.delegate() method and sub-agent coordination
in agents/definitions/orchestrator.py.
All tests are offline (no API key needed).
"""

from unittest.mock import MagicMock, patch, call

import pytest

from agents.definitions.base import AgentConfig
from agents.definitions.orchestrator import OrchestratorAgent, create_orchestrator


@pytest.fixture
def mock_orchestrator():
    """Create an OrchestratorAgent with mocked prompts and sub-agents."""
    with patch.object(AgentConfig, "load_system_prompt", return_value="Test prompt"):
        with patch.object(AgentConfig, "get_tools_schema", return_value=[]):
            mock_client = MagicMock()
            orch = OrchestratorAgent(client=mock_client)
            # Replace sub-agents with mocks for delegation testing
            orch.reliability = MagicMock()
            orch.planning = MagicMock()
            orch.spare_parts = MagicMock()
            yield orch


class TestOrchestratorDelegation:
    """Tests for the delegate() method."""

    def test_delegate_to_reliability(self, mock_orchestrator):
        """Delegating to reliability should call reliability.run() and return result."""
        mock_orchestrator.reliability.run.return_value = "Hierarchy built: 15 nodes"
        result = mock_orchestrator.delegate("reliability", "Build equipment hierarchy")
        assert result == "Hierarchy built: 15 nodes"
        mock_orchestrator.reliability.run.assert_called_once_with(
            "Build equipment hierarchy", context=None
        )

    def test_delegate_to_planning(self, mock_orchestrator):
        """Delegating to planning should call planning.run() and return result."""
        mock_orchestrator.planning.run.return_value = "Work packages created"
        result = mock_orchestrator.delegate("planning", "Create work packages")
        assert result == "Work packages created"

    def test_delegate_to_spare_parts(self, mock_orchestrator):
        """Delegating to spare_parts should call spare_parts.run() and return result."""
        mock_orchestrator.spare_parts.run.return_value = "Materials assigned"
        result = mock_orchestrator.delegate("spare_parts", "Assign materials")
        assert result == "Materials assigned"

    def test_delegate_unknown_agent_returns_error(self, mock_orchestrator):
        """Delegating to an unknown agent type should return an error string."""
        result = mock_orchestrator.delegate("unknown_agent", "Do something")
        assert "Error" in result or "error" in result.lower()
        assert "unknown_agent" in result

    def test_delegate_passes_context(self, mock_orchestrator):
        """Context kwarg should be forwarded to the sub-agent's run()."""
        mock_orchestrator.reliability.run.return_value = "Done with context"
        ctx = [{"role": "user", "content": "Prior context"}]
        mock_orchestrator.delegate("reliability", "Do work", context=ctx)

        mock_orchestrator.reliability.run.assert_called_once_with(
            "Do work", context=ctx
        )

    def test_reset_all_clears_all_agents(self, mock_orchestrator):
        """reset_all() should call reset() on all 4 agents."""
        mock_orchestrator.reset_all()

        mock_orchestrator.reliability.reset.assert_called_once()
        mock_orchestrator.planning.reset.assert_called_once()
        mock_orchestrator.spare_parts.reset.assert_called_once()


class TestOrchestratorCreation:
    """Tests for the create_orchestrator() factory."""

    def test_create_orchestrator_returns_correct_type(self):
        """create_orchestrator() should return an OrchestratorAgent instance."""
        with patch.object(AgentConfig, "load_system_prompt", return_value="Test"):
            with patch.object(AgentConfig, "get_tools_schema", return_value=[]):
                orch = create_orchestrator(client=MagicMock())
        assert isinstance(orch, OrchestratorAgent)

    def test_shared_client_across_agents(self):
        """All sub-agents should share the same Anthropic client instance."""
        with patch.object(AgentConfig, "load_system_prompt", return_value="Test"):
            with patch.object(AgentConfig, "get_tools_schema", return_value=[]):
                mock_client = MagicMock()
                orch = OrchestratorAgent(client=mock_client)

        assert orch.client is mock_client
        assert orch.reliability.client is mock_client
        assert orch.planning.client is mock_client
        assert orch.spare_parts.client is mock_client
