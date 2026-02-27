"""Tests for FMECA Engine — Phase 7 (G18)."""

from tools.engines.fmeca_engine import FMECAEngine
from tools.models.schemas import (
    FMECAStage,
    FMECAWorksheetStatus,
    RPNCategory,
    RPNScore,
    FMECAWorksheet,
    FMECASummary,
)


def _make_worksheet():
    return FMECAEngine.create_worksheet(
        equipment_id="EQ-001",
        equipment_tag="PUMP-A",
        equipment_name="Centrifugal Pump A",
        analyst="Test Analyst",
    )


def _make_populated_worksheet():
    ws = _make_worksheet()
    ws = FMECAEngine.add_row(ws, {
        "function_description": "Pump fluid from A to B",
        "functional_failure": "Unable to pump",
        "failure_mode": "Bearing seizure",
        "failure_effect": "Complete loss of pumping",
        "failure_consequence": "EVIDENT_OPERATIONAL",
        "severity": 7,
        "occurrence": 4,
        "detection": 5,
    })
    ws = FMECAEngine.add_row(ws, {
        "function_description": "Pump fluid from A to B",
        "functional_failure": "Reduced flow",
        "failure_mode": "Impeller wear",
        "failure_effect": "Reduced throughput",
        "failure_consequence": "EVIDENT_OPERATIONAL",
        "severity": 4,
        "occurrence": 6,
        "detection": 3,
    })
    return ws


class TestCreateWorksheet:

    def test_creates_worksheet(self):
        ws = _make_worksheet()
        assert isinstance(ws, FMECAWorksheet)
        assert ws.equipment_id == "EQ-001"
        assert ws.status == FMECAWorksheetStatus.DRAFT
        assert ws.current_stage == FMECAStage.STAGE_1_FUNCTIONS

    def test_worksheet_id_generated(self):
        ws = _make_worksheet()
        assert ws.worksheet_id.startswith("FMECA-")

    def test_stage_completion_initialized(self):
        ws = _make_worksheet()
        assert len(ws.stage_completion) == 4
        assert all(v is False for v in ws.stage_completion.values())

    def test_analyst_set(self):
        ws = _make_worksheet()
        assert ws.analyst == "Test Analyst"


class TestAddRow:

    def test_add_row(self):
        ws = _make_worksheet()
        ws = FMECAEngine.add_row(ws, {
            "function_description": "Test function",
            "failure_mode": "Test mode",
            "severity": 5, "occurrence": 3, "detection": 4,
        })
        assert len(ws.rows) == 1
        assert ws.rows[0].rpn == 60

    def test_status_transitions_to_in_progress(self):
        ws = _make_worksheet()
        assert ws.status == FMECAWorksheetStatus.DRAFT
        ws = FMECAEngine.add_row(ws, {"severity": 1, "occurrence": 1, "detection": 1})
        assert ws.status == FMECAWorksheetStatus.IN_PROGRESS

    def test_rpn_category_assigned(self):
        ws = _make_worksheet()
        ws = FMECAEngine.add_row(ws, {"severity": 10, "occurrence": 10, "detection": 10})
        assert ws.rows[0].rpn == 1000
        assert ws.rows[0].rpn_category == RPNCategory.CRITICAL

    def test_clamps_values(self):
        ws = _make_worksheet()
        ws = FMECAEngine.add_row(ws, {"severity": 15, "occurrence": -5, "detection": 0})
        assert ws.rows[0].severity == 10
        assert ws.rows[0].occurrence == 1
        assert ws.rows[0].detection == 1

    def test_auto_row_id(self):
        ws = _make_worksheet()
        ws = FMECAEngine.add_row(ws, {"severity": 5, "occurrence": 5, "detection": 5})
        assert ws.rows[0].row_id == "R-1"


class TestCalculateRPN:

    def test_low_rpn(self):
        result = FMECAEngine.calculate_rpn(2, 2, 2)
        assert isinstance(result, RPNScore)
        assert result.rpn == 8
        assert result.category == RPNCategory.LOW

    def test_medium_rpn(self):
        result = FMECAEngine.calculate_rpn(5, 5, 2)
        assert result.rpn == 50
        assert result.category == RPNCategory.MEDIUM

    def test_high_rpn(self):
        result = FMECAEngine.calculate_rpn(5, 5, 5)
        assert result.rpn == 125
        assert result.category == RPNCategory.HIGH

    def test_critical_rpn(self):
        result = FMECAEngine.calculate_rpn(8, 8, 5)
        assert result.rpn == 320
        assert result.category == RPNCategory.CRITICAL

    def test_boundary_low(self):
        result = FMECAEngine.calculate_rpn(7, 7, 1)
        assert result.rpn == 49
        assert result.category == RPNCategory.LOW

    def test_boundary_medium(self):
        result = FMECAEngine.calculate_rpn(10, 10, 1)
        assert result.rpn == 100
        assert result.category == RPNCategory.HIGH

    def test_clamps_input(self):
        result = FMECAEngine.calculate_rpn(0, 11, 5)
        assert result.severity == 1
        assert result.occurrence == 10

    def test_max_rpn(self):
        result = FMECAEngine.calculate_rpn(10, 10, 10)
        assert result.rpn == 1000
        assert result.category == RPNCategory.CRITICAL


class TestAdvanceStage:

    def test_advance_stage_1_to_2(self):
        ws = _make_populated_worksheet()
        ws, msg = FMECAEngine.advance_stage(ws, FMECAStage.STAGE_2_FAILURES)
        assert ws.current_stage == FMECAStage.STAGE_2_FAILURES
        assert "Advanced" in msg

    def test_cannot_skip_stages(self):
        ws = _make_worksheet()
        ws, msg = FMECAEngine.advance_stage(ws, FMECAStage.STAGE_3_EFFECTS)
        assert ws.current_stage == FMECAStage.STAGE_1_FUNCTIONS
        assert "Cannot skip" in msg

    def test_stage_2_requires_functions(self):
        ws = _make_worksheet()
        ws, msg = FMECAEngine.advance_stage(ws, FMECAStage.STAGE_2_FAILURES)
        assert "function" in msg.lower()

    def test_sequential_advancement(self):
        ws = _make_populated_worksheet()
        ws, _ = FMECAEngine.advance_stage(ws, FMECAStage.STAGE_2_FAILURES)
        ws, _ = FMECAEngine.advance_stage(ws, FMECAStage.STAGE_3_EFFECTS)
        ws, _ = FMECAEngine.advance_stage(ws, FMECAStage.STAGE_4_DECISIONS)
        assert ws.current_stage == FMECAStage.STAGE_4_DECISIONS


class TestRunStage4Decisions:

    def test_assigns_strategies(self):
        ws = _make_populated_worksheet()
        ws = FMECAEngine.run_stage_4_decisions(ws)
        for row in ws.rows:
            assert row.strategy_type is not None
            assert row.rcm_path is not None

    def test_stage_4_marked_complete(self):
        ws = _make_populated_worksheet()
        ws = FMECAEngine.run_stage_4_decisions(ws)
        assert ws.stage_completion[FMECAStage.STAGE_4_DECISIONS.value] is True

    def test_skips_rows_without_consequence(self):
        ws = _make_worksheet()
        ws = FMECAEngine.add_row(ws, {"severity": 5, "occurrence": 5, "detection": 5})
        ws = FMECAEngine.run_stage_4_decisions(ws)
        assert ws.rows[0].strategy_type is None


class TestGenerateSummary:

    def test_summary_basic(self):
        ws = _make_populated_worksheet()
        summary = FMECAEngine.generate_summary(ws)
        assert isinstance(summary, FMECASummary)
        assert summary.total_rows == 2
        assert summary.avg_rpn > 0

    def test_rpn_distribution(self):
        ws = _make_populated_worksheet()
        summary = FMECAEngine.generate_summary(ws)
        total = sum(summary.rpn_distribution.values())
        assert total == 2

    def test_top_risks_sorted(self):
        ws = _make_populated_worksheet()
        summary = FMECAEngine.generate_summary(ws)
        assert len(summary.top_risks) == 2
        assert summary.top_risks[0]["rpn"] >= summary.top_risks[1]["rpn"]

    def test_empty_worksheet_summary(self):
        ws = _make_worksheet()
        summary = FMECAEngine.generate_summary(ws)
        assert summary.total_rows == 0
        assert summary.avg_rpn == 0.0

    def test_strategy_distribution_after_decisions(self):
        ws = _make_populated_worksheet()
        ws = FMECAEngine.run_stage_4_decisions(ws)
        summary = FMECAEngine.generate_summary(ws)
        assert len(summary.strategy_distribution) > 0

    def test_recommendations_for_high_rpn(self):
        ws = _make_worksheet()
        ws = FMECAEngine.add_row(ws, {
            "severity": 10, "occurrence": 10, "detection": 10,
            "failure_consequence": "EVIDENT_SAFETY",
        })
        summary = FMECAEngine.generate_summary(ws)
        assert summary.high_critical_count > 0
        assert any("CRITICAL" in r for r in summary.recommendations)


class TestCompleteWorksheet:

    def test_complete_after_decisions(self):
        ws = _make_populated_worksheet()
        ws = FMECAEngine.run_stage_4_decisions(ws)
        ws, msg = FMECAEngine.complete_worksheet(ws)
        assert ws.status == FMECAWorksheetStatus.COMPLETED
        assert ws.completed_at is not None
        assert "completed" in msg.lower()

    def test_cannot_complete_without_decisions(self):
        ws = _make_populated_worksheet()
        ws, msg = FMECAEngine.complete_worksheet(ws)
        assert ws.status != FMECAWorksheetStatus.COMPLETED
        assert "Stage 4" in msg

    def test_complete_reports_high_critical(self):
        ws = _make_worksheet()
        ws = FMECAEngine.add_row(ws, {
            "severity": 10, "occurrence": 10, "detection": 5,
            "failure_consequence": "EVIDENT_SAFETY",
        })
        ws = FMECAEngine.run_stage_4_decisions(ws)
        ws, msg = FMECAEngine.complete_worksheet(ws)
        assert "HIGH/CRITICAL" in msg
