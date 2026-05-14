"""
AI Confidence Threshold System (OPP-4)
Defines thresholds for AI-generated content and determines
required human review level based on confidence scores.
"""

from dataclasses import dataclass
from enum import Enum


class ReviewLevel(str, Enum):
    """Required review level based on AI confidence."""
    AUTO_REJECT = "AUTO_REJECT"       # < 0.3: reject AI output
    MANDATORY_REVIEW = "MANDATORY_REVIEW"  # 0.3-0.7: must be reviewed
    OPTIONAL_REVIEW = "OPTIONAL_REVIEW"    # 0.7-0.9: recommended review
    TRUSTED = "TRUSTED"               # >= 0.9: can proceed with minimal review


# Thresholds per entity type (some entities need higher confidence)
CONFIDENCE_THRESHOLDS = {
    "equipment_identification": {
        "auto_reject": 0.3,
        "mandatory_review": 0.7,
        "optional_review": 0.9,
    },
    "failure_mode": {
        "auto_reject": 0.2,
        "mandatory_review": 0.6,
        "optional_review": 0.85,
    },
    "priority_suggestion": {
        "auto_reject": 0.3,
        "mandatory_review": 0.7,
        "optional_review": 0.9,
    },
    "task_generation": {
        "auto_reject": 0.25,
        "mandatory_review": 0.65,
        "optional_review": 0.85,
    },
    "spare_parts_suggestion": {
        "auto_reject": 0.3,
        "mandatory_review": 0.7,
        "optional_review": 0.9,
    },
    "default": {
        "auto_reject": 0.3,
        "mandatory_review": 0.7,
        "optional_review": 0.9,
    },
}


@dataclass
class ConfidenceResult:
    """Result of confidence evaluation."""
    confidence: float
    review_level: ReviewLevel
    entity_type: str
    message: str
    should_flag: bool


class ConfidenceValidator:
    """Evaluates AI confidence and determines review requirements."""

    @staticmethod
    def evaluate(
        confidence: float,
        entity_type: str = "default",
    ) -> ConfidenceResult:
        """
        Evaluate AI confidence score and determine review level.

        Args:
            confidence: AI confidence score (0.0-1.0)
            entity_type: Type of entity being evaluated

        Returns:
            ConfidenceResult with review level and guidance
        """
        thresholds = CONFIDENCE_THRESHOLDS.get(
            entity_type,
            CONFIDENCE_THRESHOLDS["default"],
        )

        if confidence < thresholds["auto_reject"]:
            return ConfidenceResult(
                confidence=confidence,
                review_level=ReviewLevel.AUTO_REJECT,
                entity_type=entity_type,
                message=f"AI confidence too low ({confidence:.0%}). Output rejected — manual input required.",
                should_flag=True,
            )
        elif confidence < thresholds["mandatory_review"]:
            return ConfidenceResult(
                confidence=confidence,
                review_level=ReviewLevel.MANDATORY_REVIEW,
                entity_type=entity_type,
                message=f"AI confidence moderate ({confidence:.0%}). Mandatory human review required.",
                should_flag=True,
            )
        elif confidence < thresholds["optional_review"]:
            return ConfidenceResult(
                confidence=confidence,
                review_level=ReviewLevel.OPTIONAL_REVIEW,
                entity_type=entity_type,
                message=f"AI confidence good ({confidence:.0%}). Review recommended but not mandatory.",
                should_flag=False,
            )
        else:
            return ConfidenceResult(
                confidence=confidence,
                review_level=ReviewLevel.TRUSTED,
                entity_type=entity_type,
                message=f"AI confidence high ({confidence:.0%}). Minimal review needed.",
                should_flag=False,
            )

    @staticmethod
    def batch_evaluate(
        items: list[dict],
    ) -> dict:
        """
        Evaluate a batch of items and return summary statistics.

        Args:
            items: List of dicts with 'confidence' and 'entity_type' keys.

        Returns:
            Summary with counts per review level and flagged items.
        """
        summary = {
            "total": len(items),
            "by_level": {level.value: 0 for level in ReviewLevel},
            "flagged_count": 0,
            "average_confidence": 0.0,
            "min_confidence": 1.0,
            "flagged_items": [],
        }

        if not items:
            return summary

        total_conf = 0.0
        for item in items:
            result = ConfidenceValidator.evaluate(
                item["confidence"],
                item.get("entity_type", "default"),
            )
            summary["by_level"][result.review_level.value] += 1
            total_conf += result.confidence
            if result.confidence < summary["min_confidence"]:
                summary["min_confidence"] = result.confidence
            if result.should_flag:
                summary["flagged_count"] += 1
                summary["flagged_items"].append({
                    "confidence": result.confidence,
                    "entity_type": result.entity_type,
                    "review_level": result.review_level.value,
                })

        summary["average_confidence"] = total_conf / len(items)
        return summary
