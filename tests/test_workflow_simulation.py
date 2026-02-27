"""System tests for the 4-milestone StrategyWorkflow with mocked agents.

Tests the complete workflow coordination in agents/orchestration/workflow.py,
verifying milestone progression, gate summaries, and validation integration.
All tests are offline (no API key needed).
"""

from unittest.mock import MagicMock, patch

import pytest

from agents.definitions.base import AgentConfig
from agents.orchestration.workflow import (
    StrategyWorkflow,
    _format_gate_summary,
    _run_validation,
)
from agents.orchestration.milestones import (
    MilestoneGate,
    MilestoneStatus,
    ValidationSummary,
)
from agents.orchestration.session_state import SessionState


@pytest.fixture
def auto_approve_workflow():
    """StrategyWorkflow with mocked orchestrator and auto-approve."""
    with patch.object(AgentConfig, "load_system_prompt", return_value="Test prompt"):
        with patch.object(AgentConfig, "get_tools_schema", return_value=[]):
            mock_client = MagicMock()

            def auto_approve(milestone_num, summary):
                return ("approve", "Auto-approved")

            workflow = StrategyWorkflow(
                human_approval_fn=auto_approve,
                client=mock_client,
            )
            # Mock orchestrator.run() to return synthetic text
            workflow.orchestrator.run = MagicMock(
                return_value="Milestone completed successfully."
            )
            yield workflow


class TestWorkflowHappyPath:
    """Tests for the complete 4-milestone auto-approve workflow."""

    @patch("agents.orchestration.workflow._run_validation")
    def test_full_4_milestone_auto_approve(self, mock_validation, auto_approve_workflow):
        """All 4 milestones should end with APPROVED status."""
        mock_validation.return_value = ValidationSummary(errors=0, warnings=0, info=3)

        session = auto_approve_workflow.run("SAG Mill 001", plant_code="OCP-JFC")

        # All 4 gates should be approved
        for gate in auto_approve_workflow.milestones:
            assert gate.status == MilestoneStatus.APPROVED, (
                f"Milestone {gate.number} ({gate.name}) should be APPROVED, got {gate.status}"
            )

        assert isinstance(session, SessionState)

    @patch("agents.orchestration.workflow._run_validation")
    def test_session_metadata_set(self, mock_validation, auto_approve_workflow):
        """Session should have equipment_tag and plant_code set correctly."""
        mock_validation.return_value = ValidationSummary()

        session = auto_approve_workflow.run("Ball Mill BM-201", plant_code="OCP-BEN")

        assert session.equipment_tag == "Ball Mill BM-201"
        assert session.plant_code == "OCP-BEN"

    @patch("agents.orchestration.workflow._run_validation")
    def test_agent_interactions_recorded(self, mock_validation, auto_approve_workflow):
        """Each milestone should record an interaction in the audit trail."""
        mock_validation.return_value = ValidationSummary()

        session = auto_approve_workflow.run("SAG Mill 001", plant_code="OCP")

        assert len(session.agent_interactions) == 4
        for i, interaction in enumerate(session.agent_interactions, 1):
            assert interaction["agent_type"] == "orchestrator"
            assert interaction["milestone"] == i

    def test_milestone_instructions_contain_context(self, auto_approve_workflow):
        """Milestone instructions should reference the correct context."""
        workflow = auto_approve_workflow

        # Build instructions for each milestone
        for gate in workflow.milestones:
            instruction = workflow._build_milestone_instruction(gate)
            assert workflow.session.equipment_tag in instruction or "Equipment" in instruction


class TestGateSummary:
    """Tests for the _format_gate_summary() function."""

    def test_gate_summary_with_errors(self):
        """ValidationSummary with errors should produce 'ERRORS' section."""
        gate = MilestoneGate(
            number=1, name="Test", description="Test",
            required_agents=["reliability"], required_entities=["hierarchy_nodes"],
        )
        session = SessionState(session_id="s1")
        validation = ValidationSummary(
            errors=2, warnings=1, info=0,
            details=[
                {"severity": "ERROR", "rule_id": "H-01", "message": "Missing parent"},
                {"severity": "ERROR", "rule_id": "H-02", "message": "Invalid level"},
                {"severity": "WARNING", "rule_id": "H-03", "message": "Naming issue"},
            ],
        )

        summary = _format_gate_summary(gate, session, validation)
        assert "ERRORS (must fix" in summary
        assert "H-01" in summary
        assert "Missing parent" in summary

    def test_gate_summary_with_warnings(self):
        """ValidationSummary with only warnings should produce 'WARNINGS' section."""
        gate = MilestoneGate(
            number=2, name="FMEA", description="Test",
            required_agents=["reliability"], required_entities=["failure_modes"],
        )
        session = SessionState(session_id="s1")
        validation = ValidationSummary(
            errors=0, warnings=2, info=0,
            details=[
                {"severity": "WARNING", "rule_id": "FM-05", "message": "Review naming"},
                {"severity": "WARNING", "rule_id": "FM-06", "message": "Low confidence"},
            ],
        )

        summary = _format_gate_summary(gate, session, validation)
        assert "WARNINGS (review recommended)" in summary
        assert "ERRORS" not in summary or "0 errors" in summary

    def test_gate_summary_entity_counts(self):
        """Gate summary should display entity counts from session state."""
        gate = MilestoneGate(
            number=1, name="Hierarchy", description="Test",
            required_agents=["reliability"], required_entities=["hierarchy_nodes"],
        )
        session = SessionState(session_id="s1")
        session.hierarchy_nodes = [{"id": f"n{i}"} for i in range(15)]
        session.criticality_assessments = [{"id": f"ca{i}"} for i in range(8)]
        validation = ValidationSummary()

        summary = _format_gate_summary(gate, session, validation)
        assert "hierarchy_nodes: 15" in summary
        assert "criticality_assessments: 8" in summary

    def test_gate_summary_boolean_entity(self):
        """sap_upload_generated boolean should display as Yes/No."""
        gate = MilestoneGate(
            number=4, name="SAP", description="Test",
            required_agents=["planning"], required_entities=["sap_upload_package"],
        )
        session = SessionState(session_id="s1")
        session.sap_upload_package = {"status": "GENERATED"}
        validation = ValidationSummary()

        summary = _format_gate_summary(gate, session, validation)
        assert "Yes" in summary  # sap_upload_generated: Yes


class TestRunValidation:
    """Tests for the _run_validation() helper."""

    def test_run_validation_empty_session(self):
        """Empty session should return a zero-count ValidationSummary."""
        session = SessionState(session_id="s1")
        # Empty session → get_validation_input() returns {} → short-circuit
        result = _run_validation(session)
        assert result.errors == 0
        assert result.warnings == 0
        assert result.info == 0
