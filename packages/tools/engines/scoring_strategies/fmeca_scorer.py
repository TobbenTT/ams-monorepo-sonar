"""FMECA quality scoring strategy.

Scores failure mode/FMECA deliverables across 7 quality dimensions.
Checks: 72-combo validation, RCM path, strategy assignments, function coverage.
"""

from __future__ import annotations

from tools.models.schemas import (
    QualityDimension,
    QualityScoreDimension,
    VALID_FM_COMBINATIONS,
)
from tools.engines.scoring_strategies.base import ScorerStrategy, _ratio_score

VALID_STRATEGY_TYPES = {
    "CONDITION_BASED", "FIXED_TIME", "RUN_TO_FAILURE",
    "FAULT_FINDING", "REDESIGN", "OEM",
}
VALID_CONSEQUENCES = {
    "HIDDEN_SAFETY", "HIDDEN_NONSAFETY", "EVIDENT_SAFETY",
    "EVIDENT_ENVIRONMENTAL", "EVIDENT_OPERATIONAL", "EVIDENT_NONOPERATIONAL",
}


class FMECAScorer(ScorerStrategy):
    """Quality scoring for FMECA deliverables."""

    DELIVERABLE_TYPE = "fmeca"

    def score_technical_accuracy(self, entities: dict, context: dict) -> QualityScoreDimension:
        failure_modes = entities.get("failure_modes", [])
        if not failure_modes:
            return QualityScoreDimension(
                dimension=QualityDimension.TECHNICAL_ACCURACY, score=0.0,
                findings=["No failure modes found"],
            )

        findings = []
        checks_passed = 0
        checks_total = 0

        for fm in failure_modes:
            # 72-combo validation: mechanism + cause must be in VALID_FM_COMBINATIONS
            mechanism = fm.get("mechanism", "")
            cause = fm.get("cause", "")
            checks_total += 1
            combo = (mechanism, cause)
            if combo in VALID_FM_COMBINATIONS:
                checks_passed += 1
            else:
                findings.append(
                    f"FM {fm.get('failure_mode_id', '?')}: "
                    f"invalid combo ({mechanism}, {cause})"
                )

            # Strategy type must be valid
            checks_total += 1
            strategy = fm.get("strategy_type", "")
            if strategy in VALID_STRATEGY_TYPES:
                checks_passed += 1
            else:
                findings.append(
                    f"FM {fm.get('failure_mode_id', '?')}: "
                    f"invalid strategy_type '{strategy}'"
                )

            # Failure consequence must be valid
            checks_total += 1
            consequence = fm.get("failure_consequence", "")
            if consequence in VALID_CONSEQUENCES:
                checks_passed += 1
            else:
                findings.append(
                    f"FM {fm.get('failure_mode_id', '?')}: "
                    f"invalid failure_consequence '{consequence}'"
                )

        return QualityScoreDimension(
            dimension=QualityDimension.TECHNICAL_ACCURACY,
            score=_ratio_score(checks_passed, checks_total),
            findings=findings[:10],
        )

    def score_completeness(self, entities: dict, context: dict) -> QualityScoreDimension:
        failure_modes = entities.get("failure_modes", [])
        functions = entities.get("functions", [])
        functional_failures = entities.get("functional_failures", [])
        nodes = entities.get("hierarchy_nodes", [])

        findings = []
        checks_passed = 0
        checks_total = 0

        # MI nodes should have functions
        mi_nodes = [n for n in nodes if n.get("node_type") == "MAINTAINABLE_ITEM"]
        func_node_ids = {f.get("node_id") for f in functions}
        for mi in mi_nodes:
            checks_total += 1
            if mi.get("node_id") in func_node_ids:
                checks_passed += 1
            else:
                findings.append(f"MI '{mi.get('name', '?')}' has no functions defined")

        # Functions should have functional failures
        func_ids_with_ff = {ff.get("function_id") for ff in functional_failures}
        for func in functions:
            checks_total += 1
            if func.get("function_id") in func_ids_with_ff:
                checks_passed += 1
            else:
                findings.append(
                    f"Function {func.get('function_id', '?')} has no functional failures"
                )

        # Failure modes should have key fields populated
        for fm in failure_modes:
            checks_total += 1
            has_what = bool(fm.get("what"))
            has_mechanism = bool(fm.get("mechanism"))
            has_cause = bool(fm.get("cause"))
            if has_what and has_mechanism and has_cause:
                checks_passed += 1
            else:
                missing = []
                if not has_what:
                    missing.append("what")
                if not has_mechanism:
                    missing.append("mechanism")
                if not has_cause:
                    missing.append("cause")
                findings.append(
                    f"FM {fm.get('failure_mode_id', '?')}: missing {', '.join(missing)}"
                )

        if checks_total == 0:
            return QualityScoreDimension(
                dimension=QualityDimension.COMPLETENESS, score=0.0,
                findings=["No FMECA data found"],
            )

        return QualityScoreDimension(
            dimension=QualityDimension.COMPLETENESS,
            score=_ratio_score(checks_passed, checks_total),
            findings=findings[:10],
        )

    def score_consistency(self, entities: dict, context: dict) -> QualityScoreDimension:
        failure_modes = entities.get("failure_modes", [])
        if not failure_modes:
            return QualityScoreDimension(
                dimension=QualityDimension.CONSISTENCY, score=0.0,
                findings=["No failure modes found"],
            )

        findings = []
        checks_passed = 0
        checks_total = 0

        try:
            from tools.engines.rcm_decision_engine import (
                CALENDAR_CAUSES,
                OPERATIONAL_CAUSES,
                CALENDAR_UNITS,
                OPERATIONAL_UNITS,
            )
        except ImportError:
            # Graceful fallback if engine not available
            return QualityScoreDimension(
                dimension=QualityDimension.CONSISTENCY, score=80.0,
                details="RCM engine not available for frequency validation",
            )

        # Strategy type should align with failure pattern
        for fm in failure_modes:
            cause = fm.get("cause", "")
            # If we had maintenance tasks we could check frequency alignment
            # For now, check that is_hidden aligns with consequence
            checks_total += 1
            is_hidden = fm.get("is_hidden")
            consequence = fm.get("failure_consequence", "")
            if is_hidden is True and consequence.startswith("HIDDEN"):
                checks_passed += 1
            elif is_hidden is False and consequence.startswith("EVIDENT"):
                checks_passed += 1
            elif is_hidden is None:
                checks_passed += 1  # Not specified is acceptable
            else:
                findings.append(
                    f"FM {fm.get('failure_mode_id', '?')}: "
                    f"is_hidden={is_hidden} conflicts with consequence={consequence}"
                )

        return QualityScoreDimension(
            dimension=QualityDimension.CONSISTENCY,
            score=_ratio_score(checks_passed, checks_total),
            findings=findings[:10],
        )

    def score_format(self, entities: dict, context: dict) -> QualityScoreDimension:
        failure_modes = entities.get("failure_modes", [])
        if not failure_modes:
            return QualityScoreDimension(
                dimension=QualityDimension.FORMAT, score=0.0,
                findings=["No failure modes found"],
            )

        findings = []
        checks_passed = 0
        checks_total = 0

        for fm in failure_modes:
            # 'what' field should start with a capital letter
            what = fm.get("what", "")
            checks_total += 1
            if what and what[0].isupper():
                checks_passed += 1
            elif what:
                findings.append(
                    f"FM {fm.get('failure_mode_id', '?')}: "
                    f"'what' field should start with capital letter"
                )
            else:
                findings.append(
                    f"FM {fm.get('failure_mode_id', '?')}: 'what' field is empty"
                )

            # failure_mode_id should be present
            checks_total += 1
            if fm.get("failure_mode_id"):
                checks_passed += 1
            else:
                findings.append("Failure mode missing failure_mode_id")

        return QualityScoreDimension(
            dimension=QualityDimension.FORMAT,
            score=_ratio_score(checks_passed, checks_total),
            findings=findings[:10],
        )

    def score_actionability(self, entities: dict, context: dict) -> QualityScoreDimension:
        failure_modes = entities.get("failure_modes", [])
        if not failure_modes:
            return QualityScoreDimension(
                dimension=QualityDimension.ACTIONABILITY, score=0.0,
                findings=["No failure modes found"],
            )

        findings = []
        checks_passed = 0
        checks_total = 0

        # Each FM should have a strategy type assigned (actionable outcome)
        for fm in failure_modes:
            checks_total += 1
            if fm.get("strategy_type"):
                checks_passed += 1
            else:
                findings.append(
                    f"FM {fm.get('failure_mode_id', '?')}: no strategy assigned"
                )

        return QualityScoreDimension(
            dimension=QualityDimension.ACTIONABILITY,
            score=_ratio_score(checks_passed, checks_total),
            findings=findings[:10],
        )

    def score_traceability(self, entities: dict, context: dict) -> QualityScoreDimension:
        failure_modes = entities.get("failure_modes", [])
        functional_failures = entities.get("functional_failures", [])
        functions = entities.get("functions", [])

        if not failure_modes:
            return QualityScoreDimension(
                dimension=QualityDimension.TRACEABILITY, score=0.0,
                findings=["No failure modes found"],
            )

        findings = []
        checks_passed = 0
        checks_total = 0

        ff_ids = {ff.get("failure_id") for ff in functional_failures if ff.get("failure_id")}
        func_ids = {f.get("function_id") for f in functions if f.get("function_id")}

        # Each FM should reference a valid functional_failure_id
        for fm in failure_modes:
            checks_total += 1
            ff_id = fm.get("functional_failure_id")
            if ff_id and ff_id in ff_ids:
                checks_passed += 1
            elif ff_id and ff_id not in ff_ids:
                findings.append(
                    f"FM {fm.get('failure_mode_id', '?')}: "
                    f"references non-existent functional_failure {ff_id}"
                )
            else:
                findings.append(
                    f"FM {fm.get('failure_mode_id', '?')}: "
                    f"missing functional_failure_id"
                )

        # Each functional failure should reference a valid function
        for ff in functional_failures:
            checks_total += 1
            func_id = ff.get("function_id")
            if func_id and func_id in func_ids:
                checks_passed += 1
            elif func_id:
                findings.append(
                    f"FunctionalFailure {ff.get('failure_id', '?')}: "
                    f"references non-existent function {func_id}"
                )

        return QualityScoreDimension(
            dimension=QualityDimension.TRACEABILITY,
            score=_ratio_score(checks_passed, checks_total),
            findings=findings[:10],
        )
