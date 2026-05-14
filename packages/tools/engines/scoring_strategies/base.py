"""Abstract base class for per-deliverable quality scoring strategies.

Each subclass scores a single deliverable type across 7 quality dimensions.
Follows composition pattern to avoid a God Class in the engine.
"""

from __future__ import annotations

from abc import ABC, abstractmethod

from tools.models.schemas import QualityDimension, QualityScoreDimension


class ScorerStrategy(ABC):
    """Base class for per-deliverable quality scoring strategies."""

    DELIVERABLE_TYPE: str = ""

    @abstractmethod
    def score_technical_accuracy(self, entities: dict, context: dict) -> QualityScoreDimension:
        """Score technical correctness of the deliverable."""

    @abstractmethod
    def score_completeness(self, entities: dict, context: dict) -> QualityScoreDimension:
        """Score field/coverage completeness."""

    @abstractmethod
    def score_consistency(self, entities: dict, context: dict) -> QualityScoreDimension:
        """Score internal consistency and naming alignment."""

    @abstractmethod
    def score_format(self, entities: dict, context: dict) -> QualityScoreDimension:
        """Score format compliance (naming, field lengths, SAP constraints)."""

    @abstractmethod
    def score_actionability(self, entities: dict, context: dict) -> QualityScoreDimension:
        """Score whether outputs are executable/actionable."""

    @abstractmethod
    def score_traceability(self, entities: dict, context: dict) -> QualityScoreDimension:
        """Score cross-entity reference integrity."""

    def score_intent_alignment(self, entities: dict, context: dict) -> QualityScoreDimension:
        """Score alignment with client intent profile (optional).

        Default: returns 100 with weight 0 when no intent profile is available.
        Subclasses may override if they have intent-specific checks.
        """
        return QualityScoreDimension(
            dimension=QualityDimension.INTENT_ALIGNMENT,
            score=100.0,
            weight=0.0,
            findings=[],
            details="No intent profile available",
        )

    def score_all(
        self,
        entities: dict,
        context: dict,
        weights: dict[str, float],
    ) -> list[QualityScoreDimension]:
        """Score all dimensions and apply weights from config."""
        dims = [
            self.score_technical_accuracy(entities, context),
            self.score_completeness(entities, context),
            self.score_consistency(entities, context),
            self.score_format(entities, context),
            self.score_actionability(entities, context),
            self.score_traceability(entities, context),
        ]

        # Apply weights from config
        for dim in dims:
            key = dim.dimension.value.lower()
            if key in weights:
                dim.weight = weights[key]

        # Add intent alignment if intent profile is present
        if context.get("intent_profile"):
            intent_dim = self.score_intent_alignment(entities, context)
            intent_key = intent_dim.dimension.value.lower()
            if intent_key in weights:
                intent_dim.weight = weights[intent_key]
            dims.append(intent_dim)

        return dims


def _ratio_score(passed: int, total: int) -> float:
    """Convert a passed/total ratio to a 0-100 score."""
    if total <= 0:
        return 0.0
    return round((passed / total) * 100.0, 1)
