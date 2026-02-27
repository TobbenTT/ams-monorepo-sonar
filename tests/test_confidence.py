"""
Test Suite: AI Confidence Threshold System (OPP-4)
Validates confidence evaluation and review level determination.
"""

import pytest

from tools.validators.confidence_validator import (
    ConfidenceValidator,
    ReviewLevel,
    CONFIDENCE_THRESHOLDS,
)


class TestConfidenceEvaluation:
    def test_auto_reject_low_confidence(self):
        result = ConfidenceValidator.evaluate(0.1, "default")
        assert result.review_level == ReviewLevel.AUTO_REJECT
        assert result.should_flag is True

    def test_mandatory_review_moderate(self):
        result = ConfidenceValidator.evaluate(0.5, "default")
        assert result.review_level == ReviewLevel.MANDATORY_REVIEW
        assert result.should_flag is True

    def test_optional_review_good(self):
        result = ConfidenceValidator.evaluate(0.8, "default")
        assert result.review_level == ReviewLevel.OPTIONAL_REVIEW
        assert result.should_flag is False

    def test_trusted_high(self):
        result = ConfidenceValidator.evaluate(0.95, "default")
        assert result.review_level == ReviewLevel.TRUSTED
        assert result.should_flag is False

    def test_boundary_auto_reject(self):
        # Default auto_reject = 0.3
        result_below = ConfidenceValidator.evaluate(0.29, "default")
        result_at = ConfidenceValidator.evaluate(0.3, "default")
        assert result_below.review_level == ReviewLevel.AUTO_REJECT
        assert result_at.review_level == ReviewLevel.MANDATORY_REVIEW

    def test_boundary_mandatory(self):
        result_below = ConfidenceValidator.evaluate(0.69, "default")
        result_at = ConfidenceValidator.evaluate(0.7, "default")
        assert result_below.review_level == ReviewLevel.MANDATORY_REVIEW
        assert result_at.review_level == ReviewLevel.OPTIONAL_REVIEW


class TestEntitySpecificThresholds:
    def test_failure_mode_lower_threshold(self):
        """Failure modes have lower auto_reject (0.2 vs 0.3 default)."""
        result = ConfidenceValidator.evaluate(0.25, "failure_mode")
        assert result.review_level == ReviewLevel.MANDATORY_REVIEW  # Not rejected

        result_default = ConfidenceValidator.evaluate(0.25, "default")
        assert result_default.review_level == ReviewLevel.AUTO_REJECT  # Rejected

    def test_equipment_identification_default(self):
        result = ConfidenceValidator.evaluate(0.85, "equipment_identification")
        assert result.review_level == ReviewLevel.OPTIONAL_REVIEW

    def test_unknown_entity_uses_default(self):
        result = ConfidenceValidator.evaluate(0.5, "nonexistent_type")
        assert result.review_level == ReviewLevel.MANDATORY_REVIEW


class TestBatchEvaluation:
    def test_batch_summary(self):
        items = [
            {"confidence": 0.1, "entity_type": "default"},
            {"confidence": 0.5, "entity_type": "default"},
            {"confidence": 0.8, "entity_type": "default"},
            {"confidence": 0.95, "entity_type": "default"},
        ]
        summary = ConfidenceValidator.batch_evaluate(items)
        assert summary["total"] == 4
        assert summary["by_level"]["AUTO_REJECT"] == 1
        assert summary["by_level"]["MANDATORY_REVIEW"] == 1
        assert summary["by_level"]["OPTIONAL_REVIEW"] == 1
        assert summary["by_level"]["TRUSTED"] == 1
        assert summary["flagged_count"] == 2
        assert summary["min_confidence"] == 0.1
        assert abs(summary["average_confidence"] - 0.5875) < 0.001

    def test_empty_batch(self):
        summary = ConfidenceValidator.batch_evaluate([])
        assert summary["total"] == 0
        assert summary["flagged_count"] == 0

    def test_all_high_confidence(self):
        items = [{"confidence": 0.95, "entity_type": "default"} for _ in range(10)]
        summary = ConfidenceValidator.batch_evaluate(items)
        assert summary["flagged_count"] == 0
        assert summary["by_level"]["TRUSTED"] == 10


class TestConfidenceThresholdRegistry:
    def test_all_entity_types_have_thresholds(self):
        expected = {"equipment_identification", "failure_mode", "priority_suggestion",
                    "task_generation", "spare_parts_suggestion", "default"}
        assert set(CONFIDENCE_THRESHOLDS.keys()) == expected

    def test_thresholds_are_ordered(self):
        for entity, thresholds in CONFIDENCE_THRESHOLDS.items():
            assert thresholds["auto_reject"] < thresholds["mandatory_review"]
            assert thresholds["mandatory_review"] < thresholds["optional_review"]
