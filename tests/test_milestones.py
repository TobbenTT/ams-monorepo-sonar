"""Tests for milestone gate logic and session state management.

All tests are offline (no API key needed). They test the orchestration
data structures and state transitions.
"""

import json
import pytest

from agents.orchestration.session_state import SessionState
from agents.orchestration.milestones import (
    MilestoneGate,
    MilestoneStatus,
    ValidationSummary,
    create_milestone_gates,
    MILESTONE_DEFINITIONS,
)


# ── SessionState Tests ──────────────────────────────────────────────────

class TestSessionState:

    def test_empty_session(self):
        s = SessionState(session_id="s1")
        counts = s.get_entity_counts()
        assert all(v == 0 or v is False for v in counts.values())

    def test_accumulate_entities(self):
        s = SessionState(session_id="s1")
        s.hierarchy_nodes.append({"id": "n1"})
        s.hierarchy_nodes.append({"id": "n2"})
        s.criticality_assessments.append({"id": "ca1"})
        counts = s.get_entity_counts()
        assert counts["hierarchy_nodes"] == 2
        assert counts["criticality_assessments"] == 1

    def test_record_interaction(self):
        s = SessionState(session_id="s1")
        s.record_interaction("reliability", 1, "Decompose equipment", "Done: 12 nodes")
        assert len(s.agent_interactions) == 1
        assert s.agent_interactions[0]["agent_type"] == "reliability"
        assert s.agent_interactions[0]["milestone"] == 1

    def test_json_roundtrip(self):
        s = SessionState(session_id="s1", equipment_tag="SAG Mill 001", plant_code="OCP")
        s.failure_modes.append({"id": "fm1", "what": "Bearing", "mechanism": "WEARS"})
        s.sap_upload_package = {"status": "GENERATED"}

        j = s.to_json()
        s2 = SessionState.from_json(j)
        assert s2.session_id == "s1"
        assert s2.equipment_tag == "SAG Mill 001"
        assert len(s2.failure_modes) == 1
        assert s2.sap_upload_package is not None

    def test_get_validation_input_empty(self):
        s = SessionState(session_id="s1")
        assert s.get_validation_input() == {}

    def test_get_validation_input_with_entities(self):
        s = SessionState(session_id="s1")
        s.hierarchy_nodes.append({"id": "n1"})
        s.failure_modes.append({"id": "fm1"})
        s.maintenance_tasks.append({"id": "t1"})
        vi = s.get_validation_input()
        assert "nodes" in vi
        assert "failure_modes" in vi
        assert "tasks" in vi
        assert "functions" not in vi  # empty → not included

    def test_interaction_truncation(self):
        s = SessionState(session_id="s1")
        long_instruction = "A" * 500
        long_response = "B" * 1000
        s.record_interaction("planning", 3, long_instruction, long_response)
        assert len(s.agent_interactions[0]["instruction"]) == 200
        assert len(s.agent_interactions[0]["response_summary"]) == 500


# ── ValidationSummary Tests ─────────────────────────────────────────────

class TestValidationSummary:

    def test_clean_validation(self):
        v = ValidationSummary(errors=0, warnings=0, info=3)
        assert v.is_clean is True
        assert v.has_errors is False

    def test_has_errors(self):
        v = ValidationSummary(errors=2, warnings=1, info=0)
        assert v.has_errors is True
        assert v.is_clean is False

    def test_warnings_only(self):
        v = ValidationSummary(errors=0, warnings=3, info=0)
        assert v.has_errors is False
        assert v.is_clean is False


# ── MilestoneGate Tests ─────────────────────────────────────────────────

class TestMilestoneGate:

    def _make_gate(self) -> MilestoneGate:
        return MilestoneGate(
            number=1,
            name="Test Milestone",
            description="Test",
            required_agents=["reliability"],
            required_entities=["hierarchy_nodes"],
        )

    def test_initial_status(self):
        g = self._make_gate()
        assert g.status == MilestoneStatus.PENDING
        assert g.is_complete is False
        assert g.can_proceed is False

    def test_start(self):
        g = self._make_gate()
        g.start()
        assert g.status == MilestoneStatus.IN_PROGRESS
        assert g.started_at is not None

    def test_cannot_start_twice(self):
        g = self._make_gate()
        g.start()
        with pytest.raises(ValueError):
            g.start()

    def test_present(self):
        g = self._make_gate()
        g.start()
        v = ValidationSummary(errors=0, warnings=1)
        g.present(v)
        assert g.status == MilestoneStatus.PRESENTED
        assert g.validation is not None

    def test_cannot_present_without_start(self):
        g = self._make_gate()
        with pytest.raises(ValueError):
            g.present(ValidationSummary())

    def test_approve(self):
        g = self._make_gate()
        g.start()
        g.present(ValidationSummary())
        g.approve("Approved!")
        assert g.status == MilestoneStatus.APPROVED
        assert g.is_complete is True
        assert g.can_proceed is True
        assert g.completed_at is not None
        assert g.human_feedback == "Approved!"

    def test_modify_returns_to_in_progress(self):
        g = self._make_gate()
        g.start()
        g.present(ValidationSummary())
        g.modify("Fix the naming")
        assert g.status == MilestoneStatus.IN_PROGRESS
        assert g.human_feedback == "Fix the naming"

    def test_modify_clears_validation(self):
        """BUG-003 fix: modify() should clear stale validation."""
        g = self._make_gate()
        g.start()
        v = ValidationSummary(errors=3, warnings=1)
        g.present(v)
        assert g.validation is not None
        g.modify("Fix errors")
        assert g.validation is None

    def test_reject(self):
        g = self._make_gate()
        g.start()
        g.present(ValidationSummary())
        g.reject("Start over")
        assert g.status == MilestoneStatus.REJECTED
        assert g.validation is None

    def test_cannot_approve_without_present(self):
        g = self._make_gate()
        g.start()
        with pytest.raises(ValueError):
            g.approve()

    def test_full_approve_workflow(self):
        """Happy path: PENDING → IN_PROGRESS → PRESENTED → APPROVED."""
        g = self._make_gate()
        g.start()
        g.present(ValidationSummary(errors=0, warnings=0, info=5))
        g.approve("All good")
        assert g.is_complete
        assert g.validation.is_clean

    def test_modify_then_approve_workflow(self):
        """Modify path: PENDING → IN_PROGRESS → PRESENTED → IN_PROGRESS → PRESENTED → APPROVED."""
        g = self._make_gate()
        g.start()
        g.present(ValidationSummary(errors=1))
        g.modify("Fix errors")
        # Now back in IN_PROGRESS
        assert g.status == MilestoneStatus.IN_PROGRESS
        g.present(ValidationSummary(errors=0))
        g.approve("Fixed")
        assert g.is_complete


# ── Milestone Definitions Tests ─────────────────────────────────────────

class TestMilestoneDefinitions:

    def test_four_milestones_defined(self):
        assert len(MILESTONE_DEFINITIONS) == 4
        assert set(MILESTONE_DEFINITIONS.keys()) == {1, 2, 3, 4}

    def test_each_milestone_has_required_fields(self):
        for num, defn in MILESTONE_DEFINITIONS.items():
            assert "name" in defn, f"Milestone {num} missing 'name'"
            assert "description" in defn, f"Milestone {num} missing 'description'"
            assert "agents" in defn, f"Milestone {num} missing 'agents'"
            assert "required_entities" in defn, f"Milestone {num} missing 'required_entities'"

    def test_create_milestone_gates(self):
        gates = create_milestone_gates()
        assert len(gates) == 4
        for i, g in enumerate(gates):
            assert g.number == i + 1
            assert g.status == MilestoneStatus.PENDING

    def test_milestone_agent_assignments(self):
        assert "reliability" in MILESTONE_DEFINITIONS[1]["agents"]
        assert "reliability" in MILESTONE_DEFINITIONS[2]["agents"]
        assert "planning" in MILESTONE_DEFINITIONS[3]["agents"]
        assert "spare_parts" in MILESTONE_DEFINITIONS[3]["agents"]
        assert "planning" in MILESTONE_DEFINITIONS[4]["agents"]

    def test_milestone_4_sap_focus(self):
        m4 = MILESTONE_DEFINITIONS[4]
        assert "sap_upload_package" in m4["required_entities"]
