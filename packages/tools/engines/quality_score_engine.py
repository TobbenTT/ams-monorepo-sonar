"""Quality Score Engine — Phase 9.

Delegates scoring to per-deliverable ScorerStrategy implementations.
Loads dimension weights from quality_score_config.yaml.
Deterministic — no LLM required.
"""

from __future__ import annotations

from pathlib import Path

import yaml

from tools.models.schemas import (
    DeliverableQualityScore,
    QualityGrade,
    SessionQualityReport,
)
from tools.engines.scoring_strategies import (
    HierarchyScorer,
    CriticalityScorer,
    FMECAScorer,
    TaskScorer,
    WorkPackageScorer,
    SAPScorer,
    ScorerStrategy,
)

_CONFIG_PATH = Path(__file__).parent / "quality_score_config.yaml"

# Deliverable types scored at each milestone
MILESTONE_DELIVERABLES: dict[int, list[str]] = {
    1: ["hierarchy", "criticality"],
    2: ["fmeca"],
    3: ["tasks", "work_packages"],
    4: ["sap_upload"],
}

# Strategy registry: deliverable_type -> ScorerStrategy instance
STRATEGY_REGISTRY: dict[str, ScorerStrategy] = {
    "hierarchy": HierarchyScorer(),
    "criticality": CriticalityScorer(),
    "fmeca": FMECAScorer(),
    "tasks": TaskScorer(),
    "work_packages": WorkPackageScorer(),
    "sap_upload": SAPScorer(),
}


def _grade_from_score(score: float) -> QualityGrade:
    """Derive letter grade from numeric score."""
    if score >= 91:
        return QualityGrade.A
    elif score >= 80:
        return QualityGrade.B
    elif score >= 70:
        return QualityGrade.C
    elif score >= 50:
        return QualityGrade.D
    return QualityGrade.F


class QualityScoreEngine:
    """Calculates deliverable quality scores using composition of strategies."""

    @classmethod
    def load_config(cls, config_path: Path | None = None) -> dict:
        """Load quality score configuration from YAML."""
        path = config_path or _CONFIG_PATH
        if path.exists():
            with open(path, "r", encoding="utf-8") as f:
                return yaml.safe_load(f) or {}
        return {}

    @classmethod
    def get_weights(
        cls,
        deliverable_type: str,
        has_intent: bool = False,
        config: dict | None = None,
    ) -> dict[str, float]:
        """Resolve dimension weights for a deliverable type."""
        cfg = config or cls.load_config()
        base_key = "weights_with_intent" if has_intent else "default_weights"
        base = dict(cfg.get(base_key, {}))
        overrides = cfg.get("deliverable_overrides", {}).get(deliverable_type, {})
        base.update(overrides)
        return base

    @classmethod
    def score_deliverable(
        cls,
        deliverable_type: str,
        entities: dict,
        milestone: int,
        context: dict | None = None,
        config: dict | None = None,
    ) -> DeliverableQualityScore:
        """Score a single deliverable type."""
        context = context or {}
        strategy = STRATEGY_REGISTRY.get(deliverable_type)
        if not strategy:
            raise ValueError(
                f"No scoring strategy for: {deliverable_type}. "
                f"Available: {sorted(STRATEGY_REGISTRY.keys())}"
            )

        has_intent = bool(context.get("intent_profile"))
        weights = cls.get_weights(deliverable_type, has_intent, config)
        dimensions = strategy.score_all(entities, context, weights)
        recommendations = cls._generate_recommendations(dimensions)

        return DeliverableQualityScore(
            deliverable_type=deliverable_type,
            milestone=milestone,
            dimensions=dimensions,
            recommendations=recommendations,
        )

    @classmethod
    def score_session(
        cls,
        session_entities: dict,
        milestone: int,
        session_id: str = "",
        context: dict | None = None,
        config: dict | None = None,
        pass_threshold: float = 91.0,
    ) -> SessionQualityReport:
        """Score all available deliverables in a session up to a given milestone."""
        context = context or {}
        cfg = config or cls.load_config()

        # Collect deliverable types for all milestones up to current
        deliverable_types: list[str] = []
        for m in range(1, milestone + 1):
            deliverable_types.extend(MILESTONE_DELIVERABLES.get(m, []))

        scores: list[DeliverableQualityScore] = []
        for dt in deliverable_types:
            if dt in STRATEGY_REGISTRY:
                score = cls.score_deliverable(dt, session_entities, milestone, context, cfg)
                scores.append(score)

        # Overall = average of deliverable composites
        overall = 0.0
        if scores:
            overall = round(
                sum(s.composite_score for s in scores) / len(scores), 1
            )

        return SessionQualityReport(
            session_id=session_id,
            deliverable_scores=scores,
            overall_score=overall,
            overall_grade=_grade_from_score(overall),
            pass_threshold=pass_threshold,
            passes_gate=overall >= pass_threshold,
        )

    @staticmethod
    def _generate_recommendations(dimensions: list) -> list[str]:
        """Generate recommendations for weak dimensions."""
        recs: list[str] = []
        for dim in dimensions:
            if dim.score < 70:
                recs.extend(dim.findings[:2])
        return recs
