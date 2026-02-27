"""
Test Suite: State Machine — Workflow Enforcement (GAP-4)
Validates all state transitions for all entity types.
"""

import pytest

from tools.engines.state_machine import (
    StateMachine,
    TransitionError,
    TRANSITION_REGISTRY,
)


class TestApprovalWorkflow:
    """DRAFT → REVIEWED → APPROVED (Functions, Tasks, FMs, CritAssessment)."""

    def test_draft_to_reviewed(self):
        assert StateMachine.validate_transition("approval", "DRAFT", "REVIEWED")

    def test_reviewed_to_approved(self):
        assert StateMachine.validate_transition("approval", "REVIEWED", "APPROVED")

    def test_draft_to_approved_blocked(self):
        """Cannot skip REVIEWED step."""
        with pytest.raises(TransitionError, match="Invalid transition"):
            StateMachine.validate_transition("approval", "DRAFT", "APPROVED")

    def test_approved_cannot_go_back(self):
        with pytest.raises(TransitionError):
            StateMachine.validate_transition("approval", "APPROVED", "DRAFT")

    def test_reviewed_can_reject_to_draft(self):
        assert StateMachine.validate_transition("approval", "REVIEWED", "DRAFT")


class TestWorkRequestWorkflow:
    """DRAFT → PENDING_VALIDATION → VALIDATED → SUBMITTED_TO_SAP."""

    def test_happy_path(self):
        StateMachine.validate_transition("work_request", "DRAFT", "PENDING_VALIDATION")
        StateMachine.validate_transition("work_request", "PENDING_VALIDATION", "VALIDATED")
        StateMachine.validate_transition("work_request", "VALIDATED", "SUBMITTED_TO_SAP")

    def test_rejection_path(self):
        StateMachine.validate_transition("work_request", "PENDING_VALIDATION", "REJECTED")
        StateMachine.validate_transition("work_request", "REJECTED", "DRAFT")

    def test_skip_validation_blocked(self):
        with pytest.raises(TransitionError):
            StateMachine.validate_transition("work_request", "DRAFT", "VALIDATED")

    def test_skip_to_sap_blocked(self):
        with pytest.raises(TransitionError):
            StateMachine.validate_transition("work_request", "DRAFT", "SUBMITTED_TO_SAP")


class TestWorkOrderWorkflow:
    """CREATED → RELEASED → IN_PROGRESS → COMPLETED → CLOSED."""

    def test_happy_path(self):
        for current, target in [
            ("CREATED", "RELEASED"),
            ("RELEASED", "IN_PROGRESS"),
            ("IN_PROGRESS", "COMPLETED"),
            ("COMPLETED", "CLOSED"),
        ]:
            StateMachine.validate_transition("work_order", current, target)

    def test_cancellation_from_any_active(self):
        for state in ["CREATED", "RELEASED", "IN_PROGRESS"]:
            StateMachine.validate_transition("work_order", state, "CANCELLED")

    def test_cannot_cancel_closed(self):
        with pytest.raises(TransitionError):
            StateMachine.validate_transition("work_order", "CLOSED", "CANCELLED")

    def test_cannot_reopen_completed(self):
        with pytest.raises(TransitionError):
            StateMachine.validate_transition("work_order", "COMPLETED", "IN_PROGRESS")


class TestWorkPackageWorkflow:
    """DRAFT → REVIEWED → APPROVED → UPLOADED_TO_SAP."""

    def test_happy_path(self):
        StateMachine.validate_transition("work_package", "DRAFT", "REVIEWED")
        StateMachine.validate_transition("work_package", "REVIEWED", "APPROVED")
        StateMachine.validate_transition("work_package", "APPROVED", "UPLOADED_TO_SAP")

    def test_skip_to_upload_blocked(self):
        with pytest.raises(TransitionError):
            StateMachine.validate_transition("work_package", "DRAFT", "UPLOADED_TO_SAP")


class TestSAPUploadWorkflow:
    """GENERATED → REVIEWED → APPROVED → UPLOADED."""

    def test_happy_path(self):
        StateMachine.validate_transition("sap_upload", "GENERATED", "REVIEWED")
        StateMachine.validate_transition("sap_upload", "REVIEWED", "APPROVED")
        StateMachine.validate_transition("sap_upload", "APPROVED", "UPLOADED")

    def test_regenerate(self):
        """Can go back to GENERATED from REVIEWED for corrections."""
        StateMachine.validate_transition("sap_upload", "REVIEWED", "GENERATED")


class TestStateMachineUtilities:
    def test_unknown_entity_type(self):
        with pytest.raises(ValueError, match="Unknown entity type"):
            StateMachine.validate_transition("nonexistent", "A", "B")

    def test_unknown_state(self):
        with pytest.raises(ValueError, match="Unknown state"):
            StateMachine.validate_transition("approval", "NONEXISTENT", "DRAFT")

    def test_get_valid_transitions(self):
        valid = StateMachine.get_valid_transitions("approval", "DRAFT")
        assert "REVIEWED" in valid
        assert "APPROVED" not in valid

    def test_get_all_states(self):
        states = StateMachine.get_all_states("work_request")
        assert "DRAFT" in states
        assert "VALIDATED" in states
        assert "SUBMITTED_TO_SAP" in states

    def test_all_entity_types_registered(self):
        expected = {"approval", "work_request", "work_order", "backlog", "work_package", "sap_upload", "sap_work_order", "sap_notification", "weekly_program", "shutdown", "moc", "fmeca_worksheet"}
        assert set(TRANSITION_REGISTRY.keys()) == expected
