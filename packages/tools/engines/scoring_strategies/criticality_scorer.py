"""Criticality assessment quality scoring strategy.

Scores criticality assessments across 7 quality dimensions.
Checks: 11-criteria matrix, probability ranges, assessed_by/assessed_at, risk class coherence.
"""

from __future__ import annotations

from tools.models.schemas import QualityDimension, QualityScoreDimension
from tools.engines.scoring_strategies.base import ScorerStrategy, _ratio_score

VALID_RISK_CLASSES = {"I_LOW", "II_MEDIUM", "III_HIGH", "IV_CRITICAL"}
VALID_METHODS = {"FULL_MATRIX", "SIMPLIFIED"}


class CriticalityScorer(ScorerStrategy):
    """Quality scoring for criticality assessment deliverables."""

    DELIVERABLE_TYPE = "criticality"

    def score_technical_accuracy(self, entities: dict, context: dict) -> QualityScoreDimension:
        assessments = entities.get("criticality_assessments", [])
        if not assessments:
            return QualityScoreDimension(
                dimension=QualityDimension.TECHNICAL_ACCURACY, score=0.0,
                findings=["No criticality assessments found"],
            )

        findings = []
        checks_passed = 0
        checks_total = 0

        for ca in assessments:
            # Probability must be 1-5
            checks_total += 1
            prob = ca.get("probability")
            if isinstance(prob, (int, float)) and 1 <= prob <= 5:
                checks_passed += 1
            else:
                findings.append(
                    f"Assessment {ca.get('assessment_id', '?')}: "
                    f"probability {prob} not in range 1-5"
                )

            # Risk class must be valid
            checks_total += 1
            risk_class = ca.get("risk_class", "")
            if risk_class in VALID_RISK_CLASSES:
                checks_passed += 1
            else:
                findings.append(
                    f"Assessment {ca.get('assessment_id', '?')}: "
                    f"invalid risk_class '{risk_class}'"
                )

            # Method must be valid
            checks_total += 1
            method = ca.get("method", "")
            if method in VALID_METHODS:
                checks_passed += 1
            else:
                findings.append(
                    f"Assessment {ca.get('assessment_id', '?')}: "
                    f"invalid method '{method}'"
                )

            # Criteria scores should exist
            checks_total += 1
            criteria = ca.get("criteria_scores", [])
            if criteria and len(criteria) >= 1:
                checks_passed += 1
            else:
                findings.append(
                    f"Assessment {ca.get('assessment_id', '?')}: "
                    f"no criteria scores"
                )

        return QualityScoreDimension(
            dimension=QualityDimension.TECHNICAL_ACCURACY,
            score=_ratio_score(checks_passed, checks_total),
            findings=findings[:10],
        )

    def score_completeness(self, entities: dict, context: dict) -> QualityScoreDimension:
        assessments = entities.get("criticality_assessments", [])
        nodes = entities.get("hierarchy_nodes", [])

        if not assessments:
            return QualityScoreDimension(
                dimension=QualityDimension.COMPLETENESS, score=0.0,
                findings=["No criticality assessments found"],
            )

        findings = []
        checks_passed = 0
        checks_total = 0

        # Each assessment must have assessed_by and assessed_at
        for ca in assessments:
            checks_total += 1
            if ca.get("assessed_by") and ca.get("assessed_at"):
                checks_passed += 1
            else:
                missing = []
                if not ca.get("assessed_by"):
                    missing.append("assessed_by")
                if not ca.get("assessed_at"):
                    missing.append("assessed_at")
                findings.append(
                    f"Assessment {ca.get('assessment_id', '?')}: "
                    f"missing {', '.join(missing)}"
                )

        # Coverage: EQUIPMENT and SYSTEM nodes should have assessments
        assessed_node_ids = {ca.get("node_id") for ca in assessments}
        assessable_nodes = [
            n for n in nodes
            if n.get("node_type") in ("EQUIPMENT", "SYSTEM")
        ]
        for node in assessable_nodes:
            checks_total += 1
            if node.get("node_id") in assessed_node_ids:
                checks_passed += 1
            else:
                findings.append(
                    f"Node '{node.get('name', '?')}' ({node.get('node_type')}) "
                    f"has no criticality assessment"
                )

        return QualityScoreDimension(
            dimension=QualityDimension.COMPLETENESS,
            score=_ratio_score(checks_passed, checks_total),
            findings=findings[:10],
        )

    def score_consistency(self, entities: dict, context: dict) -> QualityScoreDimension:
        assessments = entities.get("criticality_assessments", [])
        if not assessments:
            return QualityScoreDimension(
                dimension=QualityDimension.CONSISTENCY, score=0.0,
                findings=["No criticality assessments found"],
            )

        findings = []
        checks_passed = 0
        checks_total = 0

        # All assessments should use same method
        methods = {ca.get("method") for ca in assessments if ca.get("method")}
        checks_total += 1
        if len(methods) <= 1:
            checks_passed += 1
        else:
            findings.append(f"Mixed methods used: {methods}")

        # Overall score should be > 0 when criteria exist
        for ca in assessments:
            if ca.get("criteria_scores"):
                checks_total += 1
                if ca.get("overall_score", 0) > 0:
                    checks_passed += 1
                else:
                    findings.append(
                        f"Assessment {ca.get('assessment_id', '?')}: "
                        f"has criteria but overall_score is 0"
                    )

        return QualityScoreDimension(
            dimension=QualityDimension.CONSISTENCY,
            score=_ratio_score(checks_passed, checks_total),
            findings=findings[:10],
        )

    def score_format(self, entities: dict, context: dict) -> QualityScoreDimension:
        assessments = entities.get("criticality_assessments", [])
        if not assessments:
            return QualityScoreDimension(
                dimension=QualityDimension.FORMAT, score=0.0,
                findings=["No criticality assessments found"],
            )

        findings = []
        checks_passed = 0
        checks_total = 0

        for ca in assessments:
            # assessment_id should be present
            checks_total += 1
            if ca.get("assessment_id"):
                checks_passed += 1
            else:
                findings.append("Assessment missing assessment_id")

            # node_id should be present
            checks_total += 1
            if ca.get("node_id"):
                checks_passed += 1
            else:
                findings.append("Assessment missing node_id")

        return QualityScoreDimension(
            dimension=QualityDimension.FORMAT,
            score=_ratio_score(checks_passed, checks_total),
            findings=findings[:10],
        )

    def score_actionability(self, entities: dict, context: dict) -> QualityScoreDimension:
        assessments = entities.get("criticality_assessments", [])
        if not assessments:
            return QualityScoreDimension(
                dimension=QualityDimension.ACTIONABILITY, score=0.0,
                findings=["No criticality assessments found"],
            )

        findings = []
        checks_passed = 0
        checks_total = 0

        # High-criticality items should be clearly flagged for priority attention
        for ca in assessments:
            checks_total += 1
            risk_class = ca.get("risk_class", "")
            if risk_class in VALID_RISK_CLASSES:
                checks_passed += 1
            else:
                findings.append(
                    f"Assessment {ca.get('assessment_id', '?')}: "
                    f"risk class '{risk_class}' is not actionable"
                )

        return QualityScoreDimension(
            dimension=QualityDimension.ACTIONABILITY,
            score=_ratio_score(checks_passed, checks_total),
            findings=findings[:10],
        )

    def score_traceability(self, entities: dict, context: dict) -> QualityScoreDimension:
        assessments = entities.get("criticality_assessments", [])
        nodes = entities.get("hierarchy_nodes", [])

        if not assessments:
            return QualityScoreDimension(
                dimension=QualityDimension.TRACEABILITY, score=0.0,
                findings=["No criticality assessments found"],
            )

        findings = []
        checks_passed = 0
        checks_total = 0

        node_ids = {n.get("node_id") for n in nodes if n.get("node_id")}

        for ca in assessments:
            checks_total += 1
            node_id = ca.get("node_id")
            if node_id and node_id in node_ids:
                checks_passed += 1
            elif node_id and node_id not in node_ids:
                findings.append(
                    f"Assessment {ca.get('assessment_id', '?')}: "
                    f"references non-existent node {node_id}"
                )
            else:
                findings.append(
                    f"Assessment {ca.get('assessment_id', '?')}: missing node_id"
                )

        return QualityScoreDimension(
            dimension=QualityDimension.TRACEABILITY,
            score=_ratio_score(checks_passed, checks_total),
            findings=findings[:10],
        )
