# tests/test_deliverable_pipeline.py
"""End-to-end tests for the AMS deliverable pipeline.

Tests the full flow: scaffold → write deliverable → validate → advance milestone.
Uses a temporary client folder to avoid polluting real data.
"""

from __future__ import annotations

import json
import os
import tempfile
from pathlib import Path

import pytest

# Override the client root to a temp directory for test isolation
_TEMP_DIR = tempfile.mkdtemp(prefix="ams_test_client_")
os.environ["AMS_CLIENT_ROOT"] = _TEMP_DIR

# Must import AFTER setting env var
from agents._shared.paths import (
    get_client_root,
    get_gates_file,
    get_milestone_output_dir,
    get_output_dir,
    get_session_file,
    scaffold_project,
    validate_client_root_exists,
    validate_project_structure,
)
from tools.engines.ams_deliverable_registry import reload_registry
from tools.engines.ams_output_validator import validate_deliverable
from tools.engines.deliverable_writer import write_deliverable
from tools.engines.milestone_state_engine import (
    advance_milestone,
    get_current_milestone,
    init_milestone_state,
    load_gates,
    load_session_state,
    set_milestone_in_progress,
)
from tools.engines.spec_engine import generate_spec, validate_spec
from tools.engines.trace_engine import (
    BatchGenerationError,
    finalize_trace,
    record_decision,
    record_input,
    record_step,
    start_trace,
    validate_trace_is_genuine,
)
from tools.engines.feedback_engine import (
    add_to_backlog,
    get_improvement_backlog,
    init_feedback,
    record_feedback,
)

CLIENT = "test-client"
PROJECT = "test-project"


@pytest.fixture(autouse=True)
def _fresh_registry():
    """Reload registry for each test to avoid singleton stale state."""
    reload_registry()


@pytest.fixture
def scaffolded():
    """Scaffold a test project and return its root path."""
    root = scaffold_project(CLIENT, PROJECT)
    return root


# =========================================================================
# Phase 1: Scaffolding
# =========================================================================


class TestScaffolding:
    def test_scaffold_creates_6_folders(self, scaffolded):
        missing = validate_project_structure(CLIENT, PROJECT)
        assert missing == [], f"Missing directories: {missing}"

    def test_client_root_exists(self, scaffolded):
        assert validate_client_root_exists()

    def test_input_subdirectories(self, scaffolded):
        input_dir = scaffolded / "0-input"
        expected = [
            "00-scope", "01-equipment-list", "02-failure-history",
            "03-existing-maintenance", "04-spare-parts", "05-shutdown-calendar",
            "06-workforce", "07-standards", "08-interviews", "09-vendor-docs",
            "10-proposal",
        ]
        for sub in expected:
            assert (input_dir / sub).is_dir(), f"Missing input subdir: {sub}"

    def test_milestone_output_dir(self, scaffolded):
        d = get_milestone_output_dir(CLIENT, PROJECT, "M1")
        assert str(d).endswith("1-output/M1") or str(d).endswith("1-output\\M1")

    def test_invalid_milestone_raises(self, scaffolded):
        with pytest.raises(ValueError, match="milestone must be one of"):
            get_milestone_output_dir(CLIENT, PROJECT, "M5")


# =========================================================================
# Phase 2: Deliverable Registry
# =========================================================================


class TestRegistry:
    def test_registry_loads(self):
        from tools.engines.ams_deliverable_registry import get_registry
        reg = get_registry()
        assert len(reg) == 12

    def test_lookup_by_id(self):
        from tools.engines.ams_deliverable_registry import get_registry
        entry = get_registry().get_deliverable("AMS-001")
        assert entry is not None
        assert entry.slug == "hierarchy-tree"
        assert entry.milestone == "M1"
        assert entry.agent == "AG-002"

    def test_lookup_by_slug(self):
        from tools.engines.ams_deliverable_registry import get_registry
        entry = get_registry().find_by_slug("fmeca-table")
        assert entry is not None
        assert entry.id == "AMS-003"

    def test_get_by_milestone(self):
        from tools.engines.ams_deliverable_registry import get_registry
        m1 = get_registry().get_by_milestone("M1")
        assert len(m1) == 2
        slugs = {d.slug for d in m1}
        assert slugs == {"hierarchy-tree", "criticality-matrix"}

    def test_output_path(self):
        from tools.engines.ams_deliverable_registry import get_registry
        path = get_registry().get_output_path("AMS-001")
        assert path == "M1/hierarchy-tree.xlsx"


# =========================================================================
# Phase 3: Spec Engine
# =========================================================================


class TestSpecEngine:
    def test_generate_spec(self):
        yaml_str = generate_spec("AMS-001")
        assert "deliverable_id: AMS-001" in yaml_str
        assert "milestone: M1" in yaml_str
        assert "Reliability Engineer" in yaml_str

    def test_validate_spec_roundtrip(self, tmp_path):
        yaml_str = generate_spec("AMS-003")
        spec_file = tmp_path / "test_spec.yaml"
        spec_file.write_text(yaml_str, encoding="utf-8")
        result = validate_spec(spec_file)
        assert result["valid"], f"Validation failed: {result}"

    def test_unknown_deliverable_raises(self):
        with pytest.raises(ValueError, match="not found"):
            generate_spec("AMS-999")


# =========================================================================
# Phase 3: Trace Engine
# =========================================================================


class TestTraceEngine:
    def test_trace_lifecycle(self):
        ctx = start_trace("AMS-001", "AG-002", "M1")
        record_input(ctx, "eq-list", "0-input/01-equipment-list/", True, True)
        record_input(ctx, "scope", "0-input/00-scope/", True, True)
        record_step(ctx, "Build", "hierarchy_builder_engine", 5.0, "Done")
        record_decision(ctx, "D-001", ["A", "B"], "A", "Better fit")
        ctx.tokens_used = 100

        md = finalize_trace(ctx, quality_scores={"technical_accuracy": 90})
        assert "## 1. Identity" in md
        assert "## 2. Inputs Consumed" in md
        assert "## 10. Audit Trail" in md
        assert "AMS-001" in md

    def test_batch_guard_rejects_zero_tokens(self):
        ctx = start_trace("AMS-001", "AG-002", "M1")
        ctx.tokens_used = 0
        with pytest.raises(BatchGenerationError):
            validate_trace_is_genuine(ctx)

    def test_batch_guard_allows_scaffold(self):
        ctx = start_trace("AMS-001", "AG-002", "M1")
        ctx.tokens_used = 0
        violations = validate_trace_is_genuine(ctx, allow_scaffold=True)
        assert len(violations) > 0  # Has violations but no exception


# =========================================================================
# Phase 3: Feedback Engine
# =========================================================================


class TestFeedbackEngine:
    def test_init_and_record(self, tmp_path):
        dummy = tmp_path / "hierarchy-tree.xlsx"
        dummy.touch()
        fb_path = init_feedback(dummy)
        assert fb_path.is_file()
        assert "hierarchy-tree_feedback.md" == fb_path.name

        record_feedback(fb_path, "Tester", "Missing nodes", "Added 5 nodes", "+5 completeness")
        content = fb_path.read_text(encoding="utf-8")
        assert "Tester" in content
        assert "Missing nodes" in content

    def test_backlog(self, tmp_path):
        dummy = tmp_path / "test.xlsx"
        dummy.touch()
        fb_path = init_feedback(dummy)
        add_to_backlog(fb_path, "Add vibration analysis", "High", "J. Cortinat")
        items = get_improvement_backlog(fb_path)
        assert len(items) == 1
        assert items[0]["item"] == "Add vibration analysis"


# =========================================================================
# Phase 4A: Milestone State
# =========================================================================


class TestMilestoneState:
    def test_init_creates_files(self, scaffolded):
        gates = init_milestone_state(CLIENT, PROJECT)
        assert gates["milestones"]["M1"]["status"] == "pending"
        assert gates["milestones"]["M2"]["status"] == "locked"
        assert get_gates_file(CLIENT, PROJECT).is_file()
        assert get_session_file(CLIENT, PROJECT).is_file()

    def test_advance_milestone(self, scaffolded):
        init_milestone_state(CLIENT, PROJECT)
        assert get_current_milestone(CLIENT, PROJECT) == "M1"

        advance_milestone(CLIENT, PROJECT, "Tester")
        assert get_current_milestone(CLIENT, PROJECT) == "M2"

        gates = load_gates(CLIENT, PROJECT)
        assert gates["milestones"]["M1"]["status"] == "approved"
        assert gates["milestones"]["M2"]["status"] == "pending"

    def test_advance_all_milestones(self, scaffolded):
        init_milestone_state(CLIENT, PROJECT)
        for _ in range(4):
            advance_milestone(CLIENT, PROJECT, "Tester")
        assert get_current_milestone(CLIENT, PROJECT) is None

    def test_cannot_advance_past_end(self, scaffolded):
        init_milestone_state(CLIENT, PROJECT)
        for _ in range(4):
            advance_milestone(CLIENT, PROJECT, "Tester")
        with pytest.raises(ValueError, match="No milestone eligible"):
            advance_milestone(CLIENT, PROJECT, "Tester")


# =========================================================================
# Phase 4B: Full Pipeline (write_deliverable)
# =========================================================================


class TestDeliverableWriter:
    def test_write_creates_4_files(self, scaffolded):
        init_milestone_state(CLIENT, PROJECT)

        ctx = start_trace("AMS-001", "AG-002", "M1")
        record_input(ctx, "eq-list", "0-input/01/", True, True)
        record_input(ctx, "scope", "0-input/00/", True, True)
        record_step(ctx, "Build", "engine", 5.0, "Done")
        ctx.tokens_used = 100

        content = [{"tag": "T-001", "desc": "Pump", "level": 4}]
        result = write_deliverable(
            client_slug=CLIENT,
            project_slug=PROJECT,
            deliverable_id="AMS-001",
            content=content,
            format="xlsx",
            agent_id="AG-002",
            milestone="M1",
            trace_ctx=ctx,
        )

        for key in ("path", "spec_path", "trace_path", "feedback_path"):
            assert Path(result[key]).is_file(), f"{key} not found"

    def test_session_state_updated(self, scaffolded):
        init_milestone_state(CLIENT, PROJECT)

        write_deliverable(
            client_slug=CLIENT,
            project_slug=PROJECT,
            deliverable_id="AMS-002",
            content=[{"equipment": "Pump", "score": 85}],
            format="xlsx",
            agent_id="AG-002",
            milestone="M1",
        )

        session = load_session_state(CLIENT, PROJECT)
        assert len(session["deliverables_produced"]) == 1
        assert session["deliverables_produced"][0]["deliverable_id"] == "AMS-002"

    def test_output_validator_passes(self, scaffolded):
        init_milestone_state(CLIENT, PROJECT)

        ctx = start_trace("AMS-001", "AG-002", "M1")
        record_input(ctx, "a", "x", True, True)
        record_input(ctx, "b", "y", True, True)
        record_step(ctx, "Build", "engine", 5.0, "Done")
        ctx.tokens_used = 100

        result = write_deliverable(
            client_slug=CLIENT,
            project_slug=PROJECT,
            deliverable_id="AMS-001",
            content=[{"tag": "X", "level": 1}],
            format="xlsx",
            agent_id="AG-002",
            milestone="M1",
            trace_ctx=ctx,
            quality_scores={
                "technical_accuracy": 90,
                "completeness": 88,
                "consistency": 86,
                "format": 90,
                "actionability": 85,
                "traceability": 87,
            },
        )

        validation = validate_deliverable(
            result["path"],
            quality_scores={
                "technical_accuracy": 90,
                "completeness": 88,
                "consistency": 86,
                "format": 90,
                "actionability": 85,
                "traceability": 87,
            },
        )
        assert validation["valid"], f"Validation errors: {validation['errors']}"
        assert validation["checks"]["file_exists"]
        assert validation["checks"]["spec_exists"]
        assert validation["checks"]["trace_exists"]
        assert validation["checks"]["feedback_exists"]


# =========================================================================
# Integration: Full flow
# =========================================================================


class TestFullFlow:
    def test_scaffold_write_advance(self, scaffolded):
        """Test the complete lifecycle: scaffold → init → write → advance."""
        # 1. Init state
        init_milestone_state(CLIENT, PROJECT)
        assert get_current_milestone(CLIENT, PROJECT) == "M1"

        # 2. Write M1 deliverables
        for did in ("AMS-001", "AMS-002"):
            write_deliverable(
                client_slug=CLIENT,
                project_slug=PROJECT,
                deliverable_id=did,
                content=[{"data": "test"}],
                format="xlsx",
                agent_id="AG-002",
                milestone="M1",
            )

        # 3. Verify files in M1 output
        m1_dir = get_milestone_output_dir(CLIENT, PROJECT, "M1")
        m1_dir.mkdir(parents=True, exist_ok=True)
        xlsx_files = list(m1_dir.glob("*.xlsx"))
        assert len(xlsx_files) == 2

        # 4. Advance to M2
        advance_milestone(CLIENT, PROJECT, "Test User")
        assert get_current_milestone(CLIENT, PROJECT) == "M2"

        # 5. Verify session shows 2 deliverables
        session = load_session_state(CLIENT, PROJECT)
        assert len(session["deliverables_produced"]) == 2

        # 6. Verify gates.json
        gates = load_gates(CLIENT, PROJECT)
        assert gates["milestones"]["M1"]["status"] == "approved"
        assert gates["milestones"]["M2"]["status"] == "pending"
