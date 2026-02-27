"""Extended tests for SessionState — serialization edge cases and mutation behavior.

Complements the 7 existing tests in test_milestones.py::TestSessionState.
All tests are offline (no API key needed).
"""

import json
import pytest

from agents.orchestration.session_state import SessionState


class TestSessionStateSerialization:
    """Edge cases for to_json()/from_json() round-trips."""

    def test_from_json_with_extra_fields_raises(self):
        """Unknown keys in JSON should raise TypeError from cls(**data)."""
        s = SessionState(session_id="s1")
        j = s.to_json()
        data = json.loads(j)
        data["unknown_field"] = "surprise"
        with pytest.raises(TypeError):
            SessionState.from_json(json.dumps(data))

    def test_roundtrip_sap_upload_dict(self):
        """sap_upload_package as a dict should survive JSON round-trip."""
        s = SessionState(session_id="s1")
        s.sap_upload_package = {
            "status": "GENERATED",
            "maintenance_items": [{"mi_id": "MI-001"}],
            "task_lists": [{"tl_id": "TL-001"}],
        }
        s2 = SessionState.from_json(s.to_json())
        assert s2.sap_upload_package is not None
        assert s2.sap_upload_package["status"] == "GENERATED"
        assert len(s2.sap_upload_package["maintenance_items"]) == 1

    def test_roundtrip_sap_upload_none(self):
        """sap_upload_package=None should round-trip as None."""
        s = SessionState(session_id="s1")
        assert s.sap_upload_package is None
        s2 = SessionState.from_json(s.to_json())
        assert s2.sap_upload_package is None

    def test_to_json_serializes_datetime(self):
        """started_at is a datetime-format string; to_json uses default=str."""
        s = SessionState(session_id="s1")
        j = s.to_json()
        data = json.loads(j)
        assert isinstance(data["started_at"], str)
        assert len(data["started_at"]) > 10  # ISO format


class TestSessionStateMutability:
    """Tests documenting the mutable public list behavior."""

    def test_direct_list_mutation_reflected(self):
        """Appending to a public list should be reflected in get_entity_counts."""
        s = SessionState(session_id="s1")
        s.hierarchy_nodes.append({"id": "n1"})
        s.hierarchy_nodes.append({"id": "n2"})
        assert s.get_entity_counts()["hierarchy_nodes"] == 2

    def test_shared_reference_mutation(self):
        """Mutating an appended dict changes the state (shallow copy risk)."""
        s = SessionState(session_id="s1")
        node = {"id": "original"}
        s.hierarchy_nodes.append(node)
        # Mutate the original dict
        node["id"] = "mutated"
        # The change is reflected in the session state
        assert s.hierarchy_nodes[0]["id"] == "mutated"


class TestSessionStateValidationInput:
    """Tests for get_validation_input() key mapping behavior."""

    def test_validation_input_key_mapping(self):
        """hierarchy_nodes maps to 'nodes', maintenance_tasks maps to 'tasks'."""
        s = SessionState(session_id="s1")
        s.hierarchy_nodes.append({"id": "n1"})
        s.maintenance_tasks.append({"id": "t1"})
        vi = s.get_validation_input()
        assert "nodes" in vi
        assert "tasks" in vi
        # The original field names are NOT used as keys
        assert "hierarchy_nodes" not in vi
        assert "maintenance_tasks" not in vi

    def test_validation_input_excludes_sap(self):
        """sap_upload_package is never included in validation input."""
        s = SessionState(session_id="s1")
        s.sap_upload_package = {"status": "GENERATED"}
        vi = s.get_validation_input()
        assert "sap_upload_package" not in vi

    def test_validation_input_excludes_work_instructions(self):
        """work_instructions are not mapped to validation_input."""
        s = SessionState(session_id="s1")
        s.work_instructions.append({"id": "wi1"})
        vi = s.get_validation_input()
        assert "work_instructions" not in vi

    def test_multiple_interactions_preserved(self):
        """Multiple record_interaction calls should all be preserved."""
        s = SessionState(session_id="s1")
        s.record_interaction("reliability", 1, "Build hierarchy", "Done")
        s.record_interaction("reliability", 2, "Run FMECA", "Complete")
        s.record_interaction("planning", 3, "Create tasks", "Finished")
        assert len(s.agent_interactions) == 3
        assert s.agent_interactions[0]["agent_type"] == "reliability"
        assert s.agent_interactions[1]["milestone"] == 2
        assert s.agent_interactions[2]["agent_type"] == "planning"
