"""
Test Suite: RCM Decision Tree Engine
Validates all paths through the Reliability-Centered Maintenance decision tree.
Based on REF-01 §3.4.
"""

import pytest

from tools.engines.rcm_decision_engine import (
    AGE_RELATED_PATTERNS,
    CALENDAR_CAUSES,
    OPERATIONAL_CAUSES,
    RCMDecisionEngine,
    RCMDecisionInput,
    RCMPath,
)
from tools.models.schemas import (
    Cause,
    FailureConsequence,
    FailurePattern,
    FrequencyUnit,
    StrategyType,
)


class TestHiddenFailures:
    """Hidden failures: protective devices, safety systems."""

    def test_hidden_cbm_feasible(self):
        """Hidden + CBM feasible → Condition-Based Monitoring."""
        result = RCMDecisionEngine.decide(RCMDecisionInput(
            is_hidden=True,
            failure_consequence=FailureConsequence.HIDDEN_SAFETY,
            cbm_technically_feasible=True,
            cbm_economically_viable=True,
            ft_feasible=False,
        ))
        assert result.strategy_type == StrategyType.CONDITION_BASED
        assert result.path == RCMPath.HIDDEN_CBM
        assert result.requires_secondary_task is True

    def test_hidden_ft_feasible_age_related(self):
        """Hidden + CBM not feasible + FT feasible + age pattern → Fixed-Time."""
        result = RCMDecisionEngine.decide(RCMDecisionInput(
            is_hidden=True,
            failure_consequence=FailureConsequence.HIDDEN_SAFETY,
            cbm_technically_feasible=False,
            cbm_economically_viable=False,
            ft_feasible=True,
            failure_pattern=FailurePattern.B_AGE,
        ))
        assert result.strategy_type == StrategyType.FIXED_TIME
        assert result.path == RCMPath.HIDDEN_FT

    def test_hidden_ft_not_feasible_random_pattern(self):
        """Hidden + FT feasible but random pattern → NOT Fixed-Time (no age relation)."""
        result = RCMDecisionEngine.decide(RCMDecisionInput(
            is_hidden=True,
            failure_consequence=FailureConsequence.HIDDEN_NONSAFETY,
            cbm_technically_feasible=False,
            cbm_economically_viable=False,
            ft_feasible=True,
            failure_pattern=FailurePattern.E_RANDOM,  # Not age-related!
        ))
        # Random pattern should NOT get FT, should get FFI
        assert result.strategy_type == StrategyType.FAULT_FINDING
        assert result.path == RCMPath.HIDDEN_FFI

    def test_hidden_nonsafety_no_proactive_ffi(self):
        """Hidden non-safety + no proactive task → Fault-Finding Inspection."""
        result = RCMDecisionEngine.decide(RCMDecisionInput(
            is_hidden=True,
            failure_consequence=FailureConsequence.HIDDEN_NONSAFETY,
            cbm_technically_feasible=False,
            cbm_economically_viable=False,
            ft_feasible=False,
        ))
        assert result.strategy_type == StrategyType.FAULT_FINDING
        assert result.path == RCMPath.HIDDEN_FFI
        assert result.requires_secondary_task is True

    def test_hidden_safety_no_proactive_redesign(self):
        """Hidden safety + no proactive task → Redesign mandatory."""
        result = RCMDecisionEngine.decide(RCMDecisionInput(
            is_hidden=True,
            failure_consequence=FailureConsequence.HIDDEN_SAFETY,
            cbm_technically_feasible=False,
            cbm_economically_viable=False,
            ft_feasible=False,
        ))
        assert result.strategy_type == StrategyType.REDESIGN
        assert result.path == RCMPath.HIDDEN_REDESIGN


class TestEvidentSafetyFailures:
    """Evident failures with safety consequence — RTF NOT acceptable."""

    def test_safety_cbm_feasible(self):
        result = RCMDecisionEngine.decide(RCMDecisionInput(
            is_hidden=False,
            failure_consequence=FailureConsequence.EVIDENT_SAFETY,
            cbm_technically_feasible=True,
            cbm_economically_viable=True,
            ft_feasible=False,
        ))
        assert result.strategy_type == StrategyType.CONDITION_BASED
        assert result.path == RCMPath.EVIDENT_SAFETY_CBM

    def test_safety_ft_feasible(self):
        result = RCMDecisionEngine.decide(RCMDecisionInput(
            is_hidden=False,
            failure_consequence=FailureConsequence.EVIDENT_SAFETY,
            cbm_technically_feasible=False,
            cbm_economically_viable=False,
            ft_feasible=True,
            failure_pattern=FailurePattern.A_BATHTUB,
        ))
        assert result.strategy_type == StrategyType.FIXED_TIME
        assert result.path == RCMPath.EVIDENT_SAFETY_FT

    def test_safety_no_proactive_must_redesign(self):
        """CRITICAL: Safety failure + no proactive task = REDESIGN, never RTF."""
        result = RCMDecisionEngine.decide(RCMDecisionInput(
            is_hidden=False,
            failure_consequence=FailureConsequence.EVIDENT_SAFETY,
            cbm_technically_feasible=False,
            cbm_economically_viable=False,
            ft_feasible=False,
        ))
        assert result.strategy_type == StrategyType.REDESIGN
        assert result.strategy_type != StrategyType.RUN_TO_FAILURE
        assert result.path == RCMPath.EVIDENT_SAFETY_REDESIGN


class TestEvidentEnvironmentalFailures:
    """Evident failures with environmental consequence — RTF NOT acceptable."""

    def test_environmental_cbm(self):
        result = RCMDecisionEngine.decide(RCMDecisionInput(
            is_hidden=False,
            failure_consequence=FailureConsequence.EVIDENT_ENVIRONMENTAL,
            cbm_technically_feasible=True,
            cbm_economically_viable=True,
            ft_feasible=False,
        ))
        assert result.strategy_type == StrategyType.CONDITION_BASED

    def test_environmental_no_proactive_must_redesign(self):
        """CRITICAL: Environmental + no proactive task = REDESIGN, never RTF."""
        result = RCMDecisionEngine.decide(RCMDecisionInput(
            is_hidden=False,
            failure_consequence=FailureConsequence.EVIDENT_ENVIRONMENTAL,
            cbm_technically_feasible=False,
            cbm_economically_viable=False,
            ft_feasible=False,
        ))
        assert result.strategy_type == StrategyType.REDESIGN
        assert result.strategy_type != StrategyType.RUN_TO_FAILURE


class TestEvidentOperationalFailures:
    """Evident operational — RTF acceptable if no cost-effective proactive task."""

    def test_operational_cbm(self):
        result = RCMDecisionEngine.decide(RCMDecisionInput(
            is_hidden=False,
            failure_consequence=FailureConsequence.EVIDENT_OPERATIONAL,
            cbm_technically_feasible=True,
            cbm_economically_viable=True,
            ft_feasible=False,
        ))
        assert result.strategy_type == StrategyType.CONDITION_BASED

    def test_operational_ft(self):
        result = RCMDecisionEngine.decide(RCMDecisionInput(
            is_hidden=False,
            failure_consequence=FailureConsequence.EVIDENT_OPERATIONAL,
            cbm_technically_feasible=False,
            cbm_economically_viable=False,
            ft_feasible=True,
            failure_pattern=FailurePattern.C_FATIGUE,
        ))
        assert result.strategy_type == StrategyType.FIXED_TIME

    def test_operational_no_proactive_rtf(self):
        """Operational: RTF is acceptable."""
        result = RCMDecisionEngine.decide(RCMDecisionInput(
            is_hidden=False,
            failure_consequence=FailureConsequence.EVIDENT_OPERATIONAL,
            cbm_technically_feasible=False,
            cbm_economically_viable=False,
            ft_feasible=False,
        ))
        assert result.strategy_type == StrategyType.RUN_TO_FAILURE


class TestEvidentNonOperationalFailures:
    """Evident non-operational — RTF acceptable."""

    def test_nonoperational_cbm(self):
        result = RCMDecisionEngine.decide(RCMDecisionInput(
            is_hidden=False,
            failure_consequence=FailureConsequence.EVIDENT_NONOPERATIONAL,
            cbm_technically_feasible=True,
            cbm_economically_viable=True,
            ft_feasible=False,
        ))
        assert result.strategy_type == StrategyType.CONDITION_BASED

    def test_nonoperational_rtf(self):
        result = RCMDecisionEngine.decide(RCMDecisionInput(
            is_hidden=False,
            failure_consequence=FailureConsequence.EVIDENT_NONOPERATIONAL,
            cbm_technically_feasible=False,
            cbm_economically_viable=False,
            ft_feasible=False,
        ))
        assert result.strategy_type == StrategyType.RUN_TO_FAILURE


class TestFrequencyUnitValidation:
    """Validate cause → frequency unit alignment (REF-04 §3)."""

    def test_age_cause_requires_calendar(self):
        warnings = RCMDecisionEngine.validate_frequency_unit(
            Cause.AGE, FrequencyUnit.OPERATING_HOURS,
        )
        assert len(warnings) > 0
        assert "calendar" in warnings[0].lower()

    def test_age_cause_accepts_weeks(self):
        warnings = RCMDecisionEngine.validate_frequency_unit(
            Cause.AGE, FrequencyUnit.WEEKS,
        )
        assert len(warnings) == 0

    def test_contamination_requires_calendar(self):
        warnings = RCMDecisionEngine.validate_frequency_unit(
            Cause.CONTAMINATION, FrequencyUnit.TONNES,
        )
        assert len(warnings) > 0

    def test_abrasion_requires_operational(self):
        warnings = RCMDecisionEngine.validate_frequency_unit(
            Cause.ABRASION, FrequencyUnit.MONTHS,
        )
        assert len(warnings) > 0
        assert "operational" in warnings[0].lower()

    def test_abrasion_accepts_operating_hours(self):
        warnings = RCMDecisionEngine.validate_frequency_unit(
            Cause.ABRASION, FrequencyUnit.OPERATING_HOURS,
        )
        assert len(warnings) == 0

    def test_use_requires_operational(self):
        warnings = RCMDecisionEngine.validate_frequency_unit(
            Cause.USE, FrequencyUnit.WEEKS,
        )
        assert len(warnings) > 0

    def test_mechanical_overload_requires_operational(self):
        warnings = RCMDecisionEngine.validate_frequency_unit(
            Cause.MECHANICAL_OVERLOAD, FrequencyUnit.TONNES,
        )
        assert len(warnings) == 0

    def test_vibration_no_restrictions(self):
        """Vibration is neither calendar nor operational-restricted."""
        for unit in [FrequencyUnit.WEEKS, FrequencyUnit.OPERATING_HOURS]:
            warnings = RCMDecisionEngine.validate_frequency_unit(Cause.VIBRATION, unit)
            assert len(warnings) == 0


class TestAgeRelatedPatterns:
    """Fixed-time replacement only valid for age-related patterns."""

    def test_age_related_patterns(self):
        assert FailurePattern.A_BATHTUB in AGE_RELATED_PATTERNS
        assert FailurePattern.B_AGE in AGE_RELATED_PATTERNS
        assert FailurePattern.C_FATIGUE in AGE_RELATED_PATTERNS

    def test_random_patterns_not_age_related(self):
        assert FailurePattern.D_STRESS not in AGE_RELATED_PATTERNS
        assert FailurePattern.E_RANDOM not in AGE_RELATED_PATTERNS
        assert FailurePattern.F_EARLY_LIFE not in AGE_RELATED_PATTERNS

    def test_ft_rejected_for_random_pattern(self):
        """FT feasible but random pattern → should NOT select FT."""
        result = RCMDecisionEngine.decide(RCMDecisionInput(
            is_hidden=False,
            failure_consequence=FailureConsequence.EVIDENT_OPERATIONAL,
            cbm_technically_feasible=False,
            cbm_economically_viable=False,
            ft_feasible=True,
            failure_pattern=FailurePattern.D_STRESS,
        ))
        assert result.strategy_type != StrategyType.FIXED_TIME
        assert result.strategy_type == StrategyType.RUN_TO_FAILURE
