"""Security tests — state machine integrity and tampering resistance.

Tests that milestone state transitions cannot be bypassed, session IDs
follow expected formats, concurrent workflows are isolated, and data
integrity is maintained across the workflow lifecycle.
"""

import json
import re
import uuid
from datetime import datetime
from unittest.mock import MagicMock, patch

import pytest

from agents.definitions.base import AgentConfig
from agents.orchestration.milestones import (
    MilestoneGate,
    MilestoneStatus,
    ValidationSummary,
    create_milestone_gates,
)
from agents.orchestration.session_state import SessionState
from agents.orchestration.workflow import StrategyWorkflow

pytestmark = pytest.mark.security


class TestMilestoneStateTransitionGuards:
    """State machine cannot be bypassed via illegal transitions."""

    def test_skip_pending_to_approved(self):
        """Cannot jump from PENDING directly to APPROVED."""
        g = MilestoneGate(
            number=1, name="Test", description="Test",
            required_agents=["reliability"], required_entities=["hierarchy_nodes"],
        )
        assert g.status == MilestoneStatus.PENDING
        with pytest.raises(ValueError, match="Cannot approve"):
            g.approve("Skipping")

    def test_skip_pending_to_presented(self):
        """Cannot jump from PENDING to PRESENTED."""
        g = MilestoneGate(
            number=1, name="Test", description="Test",
            required_agents=["reliability"], required_entities=["hierarchy_nodes"],
        )
        with pytest.raises(ValueError, match="Cannot present"):
            g.present(ValidationSummary())

    def test_double_approve(self):
        """Cannot approve an already approved milestone."""
        g = MilestoneGate(
            number=1, name="Test", description="Test",
            required_agents=["reliability"], required_entities=["hierarchy_nodes"],
        )
        g.start()
        g.present(ValidationSummary())
        g.approve("First")
        with pytest.raises(ValueError, match="Cannot approve"):
            g.approve("Second")

    def test_approve_after_reject(self):
        """Cannot approve a rejected milestone."""
        g = MilestoneGate(
            number=1, name="Test", description="Test",
            required_agents=["reliability"], required_entities=["hierarchy_nodes"],
        )
        g.start()
        g.present(ValidationSummary())
        g.reject("Bad")
        with pytest.raises(ValueError, match="Cannot approve"):
            g.approve("Override")


class TestSessionIDFormat:
    """Session IDs should be valid UUIDs."""

    def test_session_id_uuid_format(self):
        """Workflow-generated session ID should be valid UUID4."""
        with patch.object(AgentConfig, "load_system_prompt", return_value="Test"):
            with patch.object(AgentConfig, "get_tools_schema", return_value=[]):
                workflow = StrategyWorkflow(
                    human_approval_fn=lambda n, s: ("approve", "ok"),
                    client=MagicMock(),
                )
        # Should be a valid UUID
        parsed = uuid.UUID(workflow.session.session_id)
        assert parsed.version == 4

    def test_session_started_at_iso_format(self):
        """started_at should be valid ISO 8601 datetime."""
        s = SessionState(session_id="s1")
        # Should not raise
        dt = datetime.fromisoformat(s.started_at)
        assert isinstance(dt, datetime)


class TestWorkflowIsolation:
    """Multiple workflows should not share state."""

    def test_two_workflows_isolated(self):
        """Two StrategyWorkflow instances should have independent state."""
        with patch.object(AgentConfig, "load_system_prompt", return_value="Test"):
            with patch.object(AgentConfig, "get_tools_schema", return_value=[]):
                w1 = StrategyWorkflow(
                    human_approval_fn=lambda n, s: ("approve", "ok"),
                    client=MagicMock(),
                )
                w2 = StrategyWorkflow(
                    human_approval_fn=lambda n, s: ("approve", "ok"),
                    client=MagicMock(),
                )

        # Different session IDs
        assert w1.session.session_id != w2.session.session_id

        # Modifying one doesn't affect the other
        w1.session.hierarchy_nodes.append({"id": "n1"})
        assert len(w2.session.hierarchy_nodes) == 0

        # Different milestone objects
        assert w1.milestones is not w2.milestones
        assert w1.milestones[0] is not w2.milestones[0]

    @patch("agents.orchestration.workflow._run_validation")
    def test_modify_loop_preserves_session_id(self, mock_validation):
        """Session ID should not change across modify iterations."""
        mock_validation.return_value = ValidationSummary()
        call_count = 0

        def modify_then_approve(milestone_num, summary):
            nonlocal call_count
            call_count += 1
            if call_count <= 2:
                return ("modify", "Fix it")
            return ("approve", "OK")

        with patch.object(AgentConfig, "load_system_prompt", return_value="Test"):
            with patch.object(AgentConfig, "get_tools_schema", return_value=[]):
                workflow = StrategyWorkflow(
                    human_approval_fn=modify_then_approve,
                    client=MagicMock(),
                )
                workflow.orchestrator.run = MagicMock(return_value="Done.")

        original_id = workflow.session.session_id
        workflow._execute_milestone(workflow.milestones[0])
        assert workflow.session.session_id == original_id


class TestDataIntegrityAcrossMilestones:
    """Rejecting a milestone should not corrupt prior approved data."""

    @patch("agents.orchestration.workflow._run_validation")
    def test_reject_m3_no_effect_on_m1_m2(self, mock_validation):
        """Rejecting M3 should not modify M1/M2 entities."""
        mock_validation.return_value = ValidationSummary()

        def approve_until_m3(milestone_num, summary):
            if milestone_num < 3:
                return ("approve", "Good")
            return ("reject", "Rework needed")

        with patch.object(AgentConfig, "load_system_prompt", return_value="Test"):
            with patch.object(AgentConfig, "get_tools_schema", return_value=[]):
                workflow = StrategyWorkflow(
                    human_approval_fn=approve_until_m3,
                    client=MagicMock(),
                )
                workflow.orchestrator.run = MagicMock(return_value="Done.")

        # Pre-populate M1/M2 data
        workflow.session.hierarchy_nodes.append({"node_id": "n1"})
        workflow.session.failure_modes.append({"mode_id": "fm1"})

        workflow.run("SAG Mill 001", "OCP")

        # M1/M2 data should be untouched
        assert len(workflow.session.hierarchy_nodes) == 1
        assert workflow.session.hierarchy_nodes[0]["node_id"] == "n1"
        assert len(workflow.session.failure_modes) == 1

        # M3 rejected, M4 pending
        assert workflow.milestones[2].status == MilestoneStatus.REJECTED
        assert workflow.milestones[3].status == MilestoneStatus.PENDING


class TestTimestampIntegrity:
    """Gate timestamps should be logically consistent."""

    def test_gate_timestamp_ordering(self):
        """started_at should be <= completed_at."""
        g = MilestoneGate(
            number=1, name="Test", description="Test",
            required_agents=["reliability"], required_entities=["hierarchy_nodes"],
        )
        g.start()
        g.present(ValidationSummary())
        g.approve("OK")

        started = datetime.fromisoformat(g.started_at)
        completed = datetime.fromisoformat(g.completed_at)
        assert started <= completed


class TestInteractionTruncation:
    """Record interaction should truncate oversized inputs."""

    def test_instruction_truncated_to_200(self):
        """Instructions longer than 200 chars should be truncated."""
        s = SessionState(session_id="s1")
        s.record_interaction("reliability", 1, "X" * 500, "response")
        assert len(s.agent_interactions[0]["instruction"]) == 200

    def test_response_truncated_to_500(self):
        """Responses longer than 500 chars should be truncated."""
        s = SessionState(session_id="s1")
        s.record_interaction("reliability", 1, "instruction", "Y" * 1000)
        assert len(s.agent_interactions[0]["response_summary"]) == 500


class TestEntityCountsIntegrity:
    """Entity counts should always be non-negative."""

    def test_entity_counts_nonnegative(self):
        """All entity counts should be >= 0."""
        s = SessionState(session_id="s1")
        counts = s.get_entity_counts()
        for key, value in counts.items():
            if isinstance(value, bool):
                continue  # sap_upload_generated is bool
            assert value >= 0, f"{key} has negative count: {value}"

    def test_from_json_preserves_all_fields(self):
        """JSON roundtrip should preserve all entity lists."""
        s = SessionState(session_id="s1")
        s.hierarchy_nodes.append({"id": "1"})
        s.criticality_assessments.append({"id": "2"})
        s.functions.append({"id": "3"})
        s.functional_failures.append({"id": "4"})
        s.failure_modes.append({"id": "5"})
        s.maintenance_tasks.append({"id": "6"})
        s.work_packages.append({"id": "7"})
        s.work_instructions.append({"id": "8"})
        s.material_assignments.append({"id": "9"})
        s.sap_upload_package = {"status": "GENERATED"}
        s.record_interaction("reliability", 1, "inst", "resp")

        j = s.to_json()
        s2 = SessionState.from_json(j)

        assert len(s2.hierarchy_nodes) == 1
        assert len(s2.criticality_assessments) == 1
        assert len(s2.functions) == 1
        assert len(s2.functional_failures) == 1
        assert len(s2.failure_modes) == 1
        assert len(s2.maintenance_tasks) == 1
        assert len(s2.work_packages) == 1
        assert len(s2.work_instructions) == 1
        assert len(s2.material_assignments) == 1
        assert s2.sap_upload_package is not None
        assert len(s2.agent_interactions) == 1
