"""System tests for workflow edge cases, error paths, and bug verification.

Tests the iterative modify loop (BUG-001 fix), strict validation (BUG-002 fix),
and boundary conditions in agents/orchestration/workflow.py.
All tests are offline (no API key needed).
"""

import sys
from unittest.mock import MagicMock, patch

import pytest

from agents.definitions.base import AgentConfig
from agents.orchestration.workflow import (
    MaxRetriesExceeded,
    StrategyWorkflow,
    _format_gate_summary,
)
from agents.orchestration.milestones import (
    MilestoneStatus,
    ValidationSummary,
)
from agents.orchestration.session_state import SessionState


@pytest.fixture
def workflow_factory():
    """Factory to create StrategyWorkflow with configurable approval behavior."""
    def _create(approval_fn, strict_validation=False, max_modify_retries=5):
        with patch.object(AgentConfig, "load_system_prompt", return_value="Test"):
            with patch.object(AgentConfig, "get_tools_schema", return_value=[]):
                mock_client = MagicMock()
                workflow = StrategyWorkflow(
                    human_approval_fn=approval_fn,
                    client=mock_client,
                    strict_validation=strict_validation,
                    max_modify_retries=max_modify_retries,
                )
                workflow.orchestrator.run = MagicMock(
                    return_value="Milestone work done."
                )
                return workflow
    return _create


class TestWorkflowModifyLoop:
    """Tests for the iterative modify → re-execute flow (BUG-001 fix)."""

    @patch("agents.orchestration.workflow._run_validation")
    def test_modify_then_approve(self, mock_validation, workflow_factory):
        """Modify once, then approve → gate ends up APPROVED."""
        mock_validation.return_value = ValidationSummary()
        call_count = 0

        def modify_then_approve(milestone_num, summary):
            nonlocal call_count
            call_count += 1
            if call_count == 1:
                return ("modify", "Fix the naming conventions")
            return ("approve", "Looks good now")

        workflow = workflow_factory(modify_then_approve)
        gate = workflow.milestones[0]
        workflow._execute_milestone(gate)

        assert gate.status == MilestoneStatus.APPROVED
        assert call_count == 2

    @patch("agents.orchestration.workflow._run_validation")
    def test_modify_sets_feedback(self, mock_validation, workflow_factory):
        """After modify then approve, human_feedback reflects the approval."""
        mock_validation.return_value = ValidationSummary()
        call_count = 0

        def modify_then_approve(milestone_num, summary):
            nonlocal call_count
            call_count += 1
            if call_count == 1:
                return ("modify", "Fix equipment hierarchy naming")
            return ("approve", "All fixed")

        workflow = workflow_factory(modify_then_approve)
        gate = workflow.milestones[0]
        workflow._execute_milestone(gate)

        assert gate.human_feedback == "All fixed"

    @patch("agents.orchestration.workflow._run_validation")
    def test_modify_max_retries_exceeded(self, mock_validation, workflow_factory):
        """Always modify → raises MaxRetriesExceeded after max retries."""
        mock_validation.return_value = ValidationSummary()

        def always_modify(milestone_num, summary):
            return ("modify", "Needs rework")

        workflow = workflow_factory(always_modify, max_modify_retries=3)
        gate = workflow.milestones[0]

        with pytest.raises(MaxRetriesExceeded, match="exceeded 3 modify attempts"):
            workflow._execute_milestone(gate)

    @patch("agents.orchestration.workflow._run_validation")
    def test_modify_feedback_in_next_instruction(self, mock_validation, workflow_factory):
        """Human feedback from modify appears in the next instruction."""
        mock_validation.return_value = ValidationSummary()
        call_count = 0
        instructions_seen = []

        def modify_then_approve(milestone_num, summary):
            nonlocal call_count
            call_count += 1
            if call_count == 1:
                return ("modify", "Add French names to all nodes")
            return ("approve", "Good")

        workflow = workflow_factory(modify_then_approve)

        # Capture instructions passed to orchestrator.run
        original_run = workflow.orchestrator.run

        def capturing_run(instruction):
            instructions_seen.append(instruction)
            return "Done."

        workflow.orchestrator.run = MagicMock(side_effect=capturing_run)

        gate = workflow.milestones[0]
        workflow._execute_milestone(gate)

        # Second instruction should include the feedback
        assert len(instructions_seen) == 2
        assert "Add French names to all nodes" in instructions_seen[1]

    @patch("agents.orchestration.workflow._run_validation")
    def test_modify_clears_validation_on_gate(self, mock_validation, workflow_factory):
        """BUG-003 verification: modify() clears stale validation."""
        mock_validation.return_value = ValidationSummary(errors=3, warnings=1)
        call_count = 0

        def modify_then_approve(milestone_num, summary):
            nonlocal call_count
            call_count += 1
            if call_count == 1:
                return ("modify", "Fix errors")
            return ("approve", "OK")

        workflow = workflow_factory(modify_then_approve)
        gate = workflow.milestones[0]

        # After modify, before next present(), validation should be None
        original_modify = gate.modify

        def check_modify(feedback):
            original_modify(feedback)
            assert gate.validation is None, "modify() should clear validation"

        gate.modify = check_modify
        workflow._execute_milestone(gate)


class TestWorkflowStrictValidation:
    """Tests for strict validation mode (BUG-002 fix)."""

    @patch("agents.orchestration.workflow._run_validation")
    def test_strict_validation_blocks_approval_with_errors(self, mock_validation, workflow_factory):
        """Strict mode: approval with errors is overridden to modify, eventually exceeds retries."""
        mock_validation.return_value = ValidationSummary(errors=5, warnings=2)

        def always_approve(milestone_num, summary):
            return ("approve", "Approving despite errors")

        workflow = workflow_factory(always_approve, strict_validation=True, max_modify_retries=2)
        gate = workflow.milestones[0]

        with pytest.raises(MaxRetriesExceeded):
            workflow._execute_milestone(gate)

        # Gate was never approved due to strict validation
        assert gate.status != MilestoneStatus.APPROVED

    @patch("agents.orchestration.workflow._run_validation")
    def test_strict_validation_allows_clean_approval(self, mock_validation, workflow_factory):
        """Strict mode: approval without errors succeeds normally."""
        mock_validation.return_value = ValidationSummary(errors=0, warnings=0)

        def approve(milestone_num, summary):
            return ("approve", "Clean approval")

        workflow = workflow_factory(approve, strict_validation=True)
        gate = workflow.milestones[0]
        workflow._execute_milestone(gate)

        assert gate.status == MilestoneStatus.APPROVED

    @patch("agents.orchestration.workflow._run_validation")
    def test_non_strict_allows_approval_with_errors(self, mock_validation, workflow_factory):
        """Non-strict mode (default): approval succeeds even with errors."""
        mock_validation.return_value = ValidationSummary(errors=5, warnings=2)

        def approve(milestone_num, summary):
            return ("approve", "Approving despite errors")

        workflow = workflow_factory(approve, strict_validation=False)
        gate = workflow.milestones[0]
        workflow._execute_milestone(gate)

        assert gate.status == MilestoneStatus.APPROVED


class TestWorkflowReject:
    """Tests for the reject flow at various milestones."""

    @patch("agents.orchestration.workflow._run_validation")
    def test_reject_at_milestone_1_stops_all(self, mock_validation, workflow_factory):
        """Rejecting at M1 should stop the workflow; M2-M4 remain PENDING."""
        mock_validation.return_value = ValidationSummary()

        def reject_at_m1(milestone_num, summary):
            return ("reject", "Start over completely")

        workflow = workflow_factory(reject_at_m1)
        session = workflow.run("SAG Mill 001", "OCP")

        assert workflow.milestones[0].status == MilestoneStatus.REJECTED
        assert workflow.milestones[1].status == MilestoneStatus.PENDING
        assert workflow.milestones[2].status == MilestoneStatus.PENDING
        assert workflow.milestones[3].status == MilestoneStatus.PENDING

    @patch("agents.orchestration.workflow._run_validation")
    def test_reject_at_milestone_3_preserves_prior(self, mock_validation, workflow_factory):
        """M1/M2 approved, M3 rejected: M4 should remain PENDING."""
        mock_validation.return_value = ValidationSummary()

        def approve_until_m3(milestone_num, summary):
            if milestone_num < 3:
                return ("approve", "Looks good")
            return ("reject", "Strategy needs rework")

        workflow = workflow_factory(approve_until_m3)
        session = workflow.run("SAG Mill 001", "OCP")

        assert workflow.milestones[0].status == MilestoneStatus.APPROVED
        assert workflow.milestones[1].status == MilestoneStatus.APPROVED
        assert workflow.milestones[2].status == MilestoneStatus.REJECTED
        assert workflow.milestones[3].status == MilestoneStatus.PENDING


class TestWorkflowValidationDisplay:
    """Tests for validation display and gate summary formatting."""

    @patch("agents.orchestration.workflow._run_validation")
    def test_approval_despite_validation_errors_non_strict(self, mock_validation, workflow_factory):
        """Non-strict mode allows approval even when validation has errors."""
        mock_validation.return_value = ValidationSummary(
            errors=5, warnings=2, info=0,
            details=[
                {"severity": "ERROR", "rule_id": "H-01", "message": "Missing parent"},
            ],
        )

        def approve_with_errors(milestone_num, summary):
            return ("approve", "Approving despite errors")

        workflow = workflow_factory(approve_with_errors, strict_validation=False)
        gate = workflow.milestones[0]
        workflow._execute_milestone(gate)

        # Non-strict: Gate is APPROVED despite 5 validation errors
        assert gate.status == MilestoneStatus.APPROVED

    def test_format_gate_summary_boolean_entity(self):
        """sap_upload_generated should display as 'Yes' when package exists."""
        from agents.orchestration.milestones import MilestoneGate

        gate = MilestoneGate(
            number=4, name="SAP Upload", description="Test",
            required_agents=["planning"], required_entities=["sap_upload_package"],
        )
        session = SessionState(session_id="s1")
        session.sap_upload_package = {"status": "DRAFT"}
        validation = ValidationSummary()

        summary = _format_gate_summary(gate, session, validation)
        assert "sap_upload_generated: Yes" in summary
