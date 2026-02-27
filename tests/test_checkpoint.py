"""Tests for session checkpointing — save, load, and find checkpoints.

Tests REC-003: crash recovery via session state snapshots.
All tests are offline (no API key needed).
"""

import json
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from agents.orchestration.checkpoint import (
    save_checkpoint,
    load_checkpoint,
    find_latest_checkpoint,
)
from agents.orchestration.session_state import SessionState
from agents.definitions.base import AgentConfig
from agents.orchestration.workflow import StrategyWorkflow
from agents.orchestration.milestones import ValidationSummary


@pytest.fixture
def tmp_checkpoint_dir(tmp_path):
    """Provide a temporary directory for checkpoints."""
    return tmp_path / "checkpoints"


@pytest.fixture
def sample_session():
    """Create a session with some entities for testing."""
    session = SessionState(session_id="test-session-001")
    session.equipment_tag = "SAG Mill 001"
    session.plant_code = "OCP-JFC"
    session.hierarchy_nodes.append({"node_id": "n1", "name": "Plant"})
    session.hierarchy_nodes.append({"node_id": "n2", "name": "Area"})
    session.criticality_assessments.append({"assessment_id": "c1"})
    session.failure_modes.append({"mode_id": "fm1"})
    return session


class TestSaveCheckpoint:
    """Tests for save_checkpoint()."""

    def test_creates_file(self, tmp_checkpoint_dir, sample_session):
        """Checkpoint file should be created on disk."""
        path = save_checkpoint(sample_session, 1, tmp_checkpoint_dir)
        assert path.exists()
        assert path.name == "test-session-001_m1.json"

    def test_creates_directory_if_missing(self, tmp_path, sample_session):
        """Non-existent checkpoint directory should be auto-created."""
        deep_dir = tmp_path / "a" / "b" / "c"
        assert not deep_dir.exists()
        save_checkpoint(sample_session, 1, deep_dir)
        assert deep_dir.exists()

    def test_file_contains_valid_json(self, tmp_checkpoint_dir, sample_session):
        """Checkpoint file should contain valid JSON."""
        path = save_checkpoint(sample_session, 2, tmp_checkpoint_dir)
        data = json.loads(path.read_text(encoding="utf-8"))
        assert data["session_id"] == "test-session-001"
        assert data["equipment_tag"] == "SAG Mill 001"


class TestLoadCheckpoint:
    """Tests for load_checkpoint()."""

    def test_roundtrip(self, tmp_checkpoint_dir, sample_session):
        """Save then load should produce identical session data."""
        save_checkpoint(sample_session, 1, tmp_checkpoint_dir)
        loaded = load_checkpoint("test-session-001", 1, tmp_checkpoint_dir)

        assert loaded is not None
        assert loaded.session_id == "test-session-001"
        assert loaded.equipment_tag == "SAG Mill 001"
        assert loaded.plant_code == "OCP-JFC"
        assert len(loaded.hierarchy_nodes) == 2
        assert len(loaded.criticality_assessments) == 1
        assert len(loaded.failure_modes) == 1

    def test_missing_returns_none(self, tmp_checkpoint_dir):
        """Non-existent checkpoint should return None."""
        result = load_checkpoint("nonexistent-session", 1, tmp_checkpoint_dir)
        assert result is None


class TestFindLatestCheckpoint:
    """Tests for find_latest_checkpoint()."""

    def test_returns_highest_milestone(self, tmp_checkpoint_dir, sample_session):
        """When M1 and M2 are saved, should return M2."""
        save_checkpoint(sample_session, 1, tmp_checkpoint_dir)
        save_checkpoint(sample_session, 2, tmp_checkpoint_dir)

        result = find_latest_checkpoint("test-session-001", tmp_checkpoint_dir)
        assert result is not None
        milestone_num, session = result
        assert milestone_num == 2

    def test_returns_none_when_empty(self, tmp_checkpoint_dir):
        """No checkpoints → None."""
        result = find_latest_checkpoint("test-session-001", tmp_checkpoint_dir)
        assert result is None


class TestWorkflowCheckpointIntegration:
    """Integration test: workflow saves checkpoints on approve."""

    @patch("agents.orchestration.workflow._run_validation")
    def test_workflow_saves_checkpoint_on_approve(self, mock_validation, tmp_checkpoint_dir):
        """Auto-approve workflow should create checkpoint files."""
        mock_validation.return_value = ValidationSummary()

        def auto_approve(milestone_num, summary):
            return ("approve", "OK")

        with patch.object(AgentConfig, "load_system_prompt", return_value="Test"):
            with patch.object(AgentConfig, "get_tools_schema", return_value=[]):
                mock_client = MagicMock()
                workflow = StrategyWorkflow(
                    human_approval_fn=auto_approve,
                    client=mock_client,
                    checkpoint_dir=str(tmp_checkpoint_dir),
                )
                workflow.orchestrator.run = MagicMock(return_value="Done.")

        workflow.run("SAG Mill 001", "OCP")

        # All 4 milestones approved → 4 checkpoint files
        checkpoint_files = list(tmp_checkpoint_dir.glob("*.json"))
        assert len(checkpoint_files) == 4

    @patch("agents.orchestration.workflow._run_validation")
    def test_checkpoint_preserves_all_entities(self, mock_validation, tmp_checkpoint_dir):
        """Entities added to session should be preserved in checkpoint."""
        mock_validation.return_value = ValidationSummary()

        def auto_approve(milestone_num, summary):
            return ("approve", "OK")

        with patch.object(AgentConfig, "load_system_prompt", return_value="Test"):
            with patch.object(AgentConfig, "get_tools_schema", return_value=[]):
                mock_client = MagicMock()
                workflow = StrategyWorkflow(
                    human_approval_fn=auto_approve,
                    client=mock_client,
                    checkpoint_dir=str(tmp_checkpoint_dir),
                )
                workflow.orchestrator.run = MagicMock(return_value="Done.")

        # Add entities before running
        workflow.session.hierarchy_nodes.append({"node_id": "n1"})
        workflow.session.failure_modes.append({"mode_id": "fm1"})

        workflow.run("SAG Mill 001", "OCP")

        # Load the last checkpoint and verify entities
        session_id = workflow.session.session_id
        loaded = load_checkpoint(session_id, 4, tmp_checkpoint_dir)
        assert loaded is not None
        assert len(loaded.hierarchy_nodes) == 1
        assert len(loaded.failure_modes) == 1
