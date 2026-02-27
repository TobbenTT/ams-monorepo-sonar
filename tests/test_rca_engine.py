"""Tests for RCA Engine — Phase 4A."""

import pytest
from datetime import date

from tools.engines.rca_engine import RCAEngine
from tools.models.schemas import (
    Evidence5PCategory,
    EvidenceType,
    RCALevel,
    RCAStatus,
    RootCauseLevel,
    Solution,
    SolutionQuadrant,
)


class TestClassifyEvent:

    def test_level_3_high_severity(self):
        level, req = RCAEngine.classify_event(5, 5)
        assert level == RCALevel.LEVEL_3
        assert req["min_members"] == 5

    def test_level_2_medium_severity(self):
        level, req = RCAEngine.classify_event(3, 3)
        assert level == RCALevel.LEVEL_2
        assert req["min_members"] == 3

    def test_level_1_low_severity(self):
        level, req = RCAEngine.classify_event(2, 2)
        assert level == RCALevel.LEVEL_1
        assert req["min_members"] == 1

    def test_boundary_7_to_8(self):
        level_7, _ = RCAEngine.classify_event(7, 1)
        level_8, _ = RCAEngine.classify_event(4, 2)
        assert level_7 == RCALevel.LEVEL_1
        assert level_8 == RCALevel.LEVEL_2


class TestCreateAnalysis:

    def test_basic_creation(self):
        analysis = RCAEngine.create_analysis("Bearing failure on SAG Mill")
        assert analysis.status == RCAStatus.OPEN
        assert analysis.event_description == "Bearing failure on SAG Mill"
        assert analysis.level == RCALevel.LEVEL_1

    def test_creation_with_team(self):
        analysis = RCAEngine.create_analysis(
            "Motor overheating", plant_id="P1", level=RCALevel.LEVEL_3,
            team_members=["Engineer1", "Operator1"],
        )
        assert analysis.level == RCALevel.LEVEL_3
        assert len(analysis.team_members) == 2


class TestRun5W2H:

    def test_creates_report(self):
        result = RCAEngine.run_5w2h(
            what="Bearing seized",
            when="2025-01-15 08:00",
            where="SAG Mill drive end",
            who="Shift A operator",
            why="Lubrication failure",
            how="Gradual temperature increase",
            how_much="$50,000 repair + 8h downtime",
        )
        assert "Bearing seized" in result.report
        assert "Lubrication failure" in result.report
        assert result.what == "Bearing seized"


class TestCauseEffect:

    def test_add_cause(self):
        analysis = RCAEngine.create_analysis("Test event")
        analysis = RCAEngine.add_cause(analysis, "Bearing wear", EvidenceType.SENSORY)
        assert len(analysis.cause_effect.causes) == 1
        assert analysis.cause_effect.causes[0].text == "Bearing wear"

    def test_parent_child_linking(self):
        analysis = RCAEngine.create_analysis("Test event")
        analysis = RCAEngine.add_cause(analysis, "Root cause", EvidenceType.INFERRED)
        parent_id = analysis.cause_effect.causes[0].cause_id
        analysis = RCAEngine.add_cause(analysis, "Child cause", EvidenceType.SENSORY, parent_id)
        parent = analysis.cause_effect.causes[0]
        child = analysis.cause_effect.causes[1]
        assert child.parent_cause_id == parent_id
        assert child.cause_id in parent.children


class TestRootCauseClassification:

    def test_classify_physical(self):
        analysis = RCAEngine.create_analysis("Test event")
        analysis = RCAEngine.add_cause(analysis, "Material fatigue", EvidenceType.SENSORY)
        cause_id = analysis.cause_effect.causes[0].cause_id
        analysis = RCAEngine.classify_root_cause_level(analysis, cause_id, RootCauseLevel.PHYSICAL)
        assert analysis.cause_effect.causes[0].root_cause_level == RootCauseLevel.PHYSICAL


class TestRootCauseChain:

    def _make_analysis_with_causes(self, level, root_levels):
        analysis = RCAEngine.create_analysis("Test", level=level)
        for i, rl in enumerate(root_levels):
            analysis = RCAEngine.add_cause(analysis, f"Cause {i}", EvidenceType.INFERRED)
            cause_id = analysis.cause_effect.causes[i].cause_id
            analysis = RCAEngine.classify_root_cause_level(analysis, cause_id, rl)
        return analysis

    def test_valid_level_1_physical_only(self):
        analysis = self._make_analysis_with_causes(RCALevel.LEVEL_1, [RootCauseLevel.PHYSICAL])
        errors = RCAEngine.validate_root_cause_chain(analysis)
        assert len(errors) == 0

    def test_invalid_level_2_missing_human(self):
        analysis = self._make_analysis_with_causes(RCALevel.LEVEL_2, [RootCauseLevel.PHYSICAL])
        errors = RCAEngine.validate_root_cause_chain(analysis)
        assert any("HUMAN" in e for e in errors)

    def test_valid_level_2_physical_and_human(self):
        analysis = self._make_analysis_with_causes(
            RCALevel.LEVEL_2, [RootCauseLevel.PHYSICAL, RootCauseLevel.HUMAN],
        )
        errors = RCAEngine.validate_root_cause_chain(analysis)
        assert len(errors) == 0

    def test_invalid_level_3_missing_latent(self):
        analysis = self._make_analysis_with_causes(
            RCALevel.LEVEL_3, [RootCauseLevel.PHYSICAL, RootCauseLevel.HUMAN],
        )
        errors = RCAEngine.validate_root_cause_chain(analysis)
        assert any("LATENT" in e for e in errors)

    def test_valid_level_3_all_three(self):
        analysis = self._make_analysis_with_causes(
            RCALevel.LEVEL_3,
            [RootCauseLevel.PHYSICAL, RootCauseLevel.HUMAN, RootCauseLevel.LATENT],
        )
        errors = RCAEngine.validate_root_cause_chain(analysis)
        assert len(errors) == 0

    def test_no_causes_error(self):
        analysis = RCAEngine.create_analysis("Test")
        errors = RCAEngine.validate_root_cause_chain(analysis)
        assert any("No causes" in e for e in errors)


class TestEvidence5P:

    def test_collect_evidence(self):
        analysis = RCAEngine.create_analysis("Test")
        analysis = RCAEngine.collect_evidence_5p(
            analysis, Evidence5PCategory.PARTS, "Worn bearing surface", "Lab analysis", 2.0,
        )
        assert len(analysis.evidence_5p) == 1
        assert analysis.evidence_5p[0].category == Evidence5PCategory.PARTS
        assert analysis.evidence_5p[0].fragility_score == 2.0


class TestSolutionEvaluation:

    def test_passes_all_five(self):
        solution = Solution(description="Replace bearing with upgraded model", cost_benefit=8.0, difficulty=3.0)
        result = RCAEngine.evaluate_solution(solution, [True, True, True, True, True])
        assert result is True
        assert solution.five_questions_pass is True

    def test_fails_one(self):
        solution = Solution(description="Temporary fix", cost_benefit=2.0, difficulty=1.0)
        result = RCAEngine.evaluate_solution(solution, [True, False, True, True, True])
        assert result is False

    def test_wrong_number_of_questions(self):
        solution = Solution(description="Test", cost_benefit=5.0, difficulty=5.0)
        result = RCAEngine.evaluate_solution(solution, [True, True, True])
        assert result is False


class TestSolutionPrioritization:

    def test_correct_ordering(self):
        solutions = [
            Solution(description="Low benefit high difficulty", cost_benefit=2.0, difficulty=8.0),
            Solution(description="High benefit low difficulty", cost_benefit=8.0, difficulty=3.0),
            Solution(description="High benefit high difficulty", cost_benefit=7.0, difficulty=7.0),
        ]
        result = RCAEngine.prioritize_solutions(solutions)
        assert result[0].rank == 1
        assert result[0].solution.quadrant == SolutionQuadrant.HIGH_BENEFIT_LOW_DIFFICULTY
        assert result[-1].solution.quadrant == SolutionQuadrant.LOW_BENEFIT_HIGH_DIFFICULTY


class TestStatusTransitions:

    def test_open_to_under_investigation(self):
        analysis = RCAEngine.create_analysis("Test")
        updated, msg = RCAEngine.advance_status(analysis, RCAStatus.UNDER_INVESTIGATION)
        assert updated.status == RCAStatus.UNDER_INVESTIGATION
        assert "advanced" in msg

    def test_reviewed_is_terminal(self):
        analysis = RCAEngine.create_analysis("Test")
        analysis.status = RCAStatus.REVIEWED
        updated, msg = RCAEngine.advance_status(analysis, RCAStatus.OPEN)
        assert updated.status == RCAStatus.REVIEWED
        assert "Cannot" in msg

    def test_invalid_transition(self):
        analysis = RCAEngine.create_analysis("Test")
        updated, msg = RCAEngine.advance_status(analysis, RCAStatus.COMPLETED)
        assert updated.status == RCAStatus.OPEN
        assert "Cannot" in msg


class TestGetSummary:

    def test_summary_counts(self):
        analyses = [
            RCAEngine.create_analysis("Event 1"),
            RCAEngine.create_analysis("Event 2", level=RCALevel.LEVEL_2),
            RCAEngine.create_analysis("Event 3", level=RCALevel.LEVEL_3),
        ]
        analyses[1].status = RCAStatus.UNDER_INVESTIGATION
        analyses[2].status = RCAStatus.COMPLETED
        summary = RCAEngine.get_summary(analyses)
        assert summary["total"] == 3
        assert summary["open"] == 1
        assert summary["under_investigation"] == 1
        assert summary["completed"] == 1
        assert summary["by_level"]["1"] == 1
        assert summary["by_level"]["3"] == 1
