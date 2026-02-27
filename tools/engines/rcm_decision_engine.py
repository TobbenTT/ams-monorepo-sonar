"""
RCM Decision Tree Engine — Deterministic
Implements the Reliability-Centered Maintenance decision logic.
Based on REF-01 §3.4: Hidden/Evident → CBM/FT/RTF/FFI/Redesign.
"""

from dataclasses import dataclass
from enum import Enum

from tools.models.schemas import (
    Cause,
    FailureConsequence,
    FailurePattern,
    FrequencyUnit,
    StrategyType,
)


class RCMPath(str, Enum):
    """The path taken through the RCM decision tree."""
    HIDDEN_CBM = "HIDDEN_CBM"
    HIDDEN_FT = "HIDDEN_FT"
    HIDDEN_FFI = "HIDDEN_FFI"
    HIDDEN_REDESIGN = "HIDDEN_REDESIGN"
    EVIDENT_SAFETY_CBM = "EVIDENT_SAFETY_CBM"
    EVIDENT_SAFETY_FT = "EVIDENT_SAFETY_FT"
    EVIDENT_SAFETY_REDESIGN = "EVIDENT_SAFETY_REDESIGN"
    EVIDENT_ENVIRONMENTAL_CBM = "EVIDENT_ENVIRONMENTAL_CBM"
    EVIDENT_ENVIRONMENTAL_FT = "EVIDENT_ENVIRONMENTAL_FT"
    EVIDENT_ENVIRONMENTAL_REDESIGN = "EVIDENT_ENVIRONMENTAL_REDESIGN"
    EVIDENT_OPERATIONAL_CBM = "EVIDENT_OPERATIONAL_CBM"
    EVIDENT_OPERATIONAL_FT = "EVIDENT_OPERATIONAL_FT"
    EVIDENT_OPERATIONAL_RTF = "EVIDENT_OPERATIONAL_RTF"
    EVIDENT_NONOPERATIONAL_CBM = "EVIDENT_NONOPERATIONAL_CBM"
    EVIDENT_NONOPERATIONAL_FT = "EVIDENT_NONOPERATIONAL_FT"
    EVIDENT_NONOPERATIONAL_RTF = "EVIDENT_NONOPERATIONAL_RTF"


@dataclass
class RCMDecisionInput:
    """Input to the RCM decision tree."""
    is_hidden: bool
    failure_consequence: FailureConsequence
    cbm_technically_feasible: bool
    cbm_economically_viable: bool
    ft_feasible: bool  # Only for age-related patterns (A, B, C)
    failure_pattern: FailurePattern | None = None


@dataclass
class RCMDecisionOutput:
    """Output from the RCM decision tree."""
    strategy_type: StrategyType
    path: RCMPath
    requires_secondary_task: bool
    reasoning: str


# Age-related failure patterns that allow Fixed-Time replacement
AGE_RELATED_PATTERNS = {FailurePattern.A_BATHTUB, FailurePattern.B_AGE, FailurePattern.C_FATIGUE}

# Causes that should use calendar-based frequency (time-dependent degradation)
CALENDAR_CAUSES = {
    Cause.AGE, Cause.CONTAMINATION, Cause.CORROSIVE_ENVIRONMENT,
    Cause.EXPOSURE_TO_ATMOSPHERE, Cause.BIO_ORGANISMS, Cause.CHEMICAL_ATTACK,
}

# Causes that should use operational-unit frequency (usage-dependent degradation)
OPERATIONAL_CAUSES = {
    Cause.USE, Cause.ABRASION, Cause.MECHANICAL_OVERLOAD, Cause.RUBBING,
    Cause.RELATIVE_MOVEMENT, Cause.EXCESSIVE_FLUID_VELOCITY, Cause.IMPACT_SHOCK_LOADING,
    Cause.CYCLIC_LOADING, Cause.METAL_TO_METAL_CONTACT,
}

# Calendar frequency units
CALENDAR_UNITS = {FrequencyUnit.DAYS, FrequencyUnit.WEEKS, FrequencyUnit.MONTHS, FrequencyUnit.YEARS}

# Operational frequency units
OPERATIONAL_UNITS = {FrequencyUnit.HOURS, FrequencyUnit.OPERATING_HOURS, FrequencyUnit.TONNES, FrequencyUnit.CYCLES}


class RCMDecisionEngine:
    """Implements the RCM decision tree for strategy selection."""

    @staticmethod
    def decide(input: RCMDecisionInput) -> RCMDecisionOutput:
        """Walk the RCM decision tree and return strategy recommendation."""

        if input.is_hidden:
            return RCMDecisionEngine._decide_hidden(input)
        else:
            return RCMDecisionEngine._decide_evident(input)

    @staticmethod
    def _decide_hidden(input: RCMDecisionInput) -> RCMDecisionOutput:
        """Decision path for hidden failures."""
        # Hidden failure → Can CBM reduce risk to acceptable level?
        if input.cbm_technically_feasible and input.cbm_economically_viable:
            return RCMDecisionOutput(
                strategy_type=StrategyType.CONDITION_BASED,
                path=RCMPath.HIDDEN_CBM,
                requires_secondary_task=True,
                reasoning="Hidden failure: CBM is technically feasible and economically viable",
            )

        # Hidden → CBM not feasible → Is FT replacement feasible?
        if input.ft_feasible and input.failure_pattern in AGE_RELATED_PATTERNS:
            return RCMDecisionOutput(
                strategy_type=StrategyType.FIXED_TIME,
                path=RCMPath.HIDDEN_FT,
                requires_secondary_task=False,
                reasoning="Hidden failure: Fixed-time replacement feasible for age-related pattern",
            )

        # Hidden → No proactive task → Fault Finding Inspection
        if input.failure_consequence == FailureConsequence.HIDDEN_NONSAFETY:
            return RCMDecisionOutput(
                strategy_type=StrategyType.FAULT_FINDING,
                path=RCMPath.HIDDEN_FFI,
                requires_secondary_task=True,
                reasoning="Hidden non-safety failure: Fault-finding inspection required",
            )

        # Hidden safety → No proactive task → Redesign mandatory
        return RCMDecisionOutput(
            strategy_type=StrategyType.REDESIGN,
            path=RCMPath.HIDDEN_REDESIGN,
            requires_secondary_task=False,
            reasoning="Hidden safety failure with no feasible proactive task: Redesign mandatory",
        )

    @staticmethod
    def _decide_evident(input: RCMDecisionInput) -> RCMDecisionOutput:
        """Decision path for evident failures."""
        consequence = input.failure_consequence

        # Determine consequence category
        if consequence in (FailureConsequence.EVIDENT_SAFETY, FailureConsequence.EVIDENT_ENVIRONMENTAL):
            return RCMDecisionEngine._decide_safety_environmental(input)
        elif consequence == FailureConsequence.EVIDENT_OPERATIONAL:
            return RCMDecisionEngine._decide_operational(input)
        else:  # EVIDENT_NONOPERATIONAL
            return RCMDecisionEngine._decide_nonoperational(input)

    @staticmethod
    def _decide_safety_environmental(input: RCMDecisionInput) -> RCMDecisionOutput:
        """Safety/Environmental consequence — Redesign if no proactive task."""
        prefix = "EVIDENT_SAFETY" if input.failure_consequence == FailureConsequence.EVIDENT_SAFETY else "EVIDENT_ENVIRONMENTAL"

        if input.cbm_technically_feasible and input.cbm_economically_viable:
            return RCMDecisionOutput(
                strategy_type=StrategyType.CONDITION_BASED,
                path=RCMPath[f"{prefix}_CBM"],
                requires_secondary_task=True,
                reasoning=f"{prefix}: CBM is technically feasible and economically viable",
            )

        if input.ft_feasible and input.failure_pattern in AGE_RELATED_PATTERNS:
            return RCMDecisionOutput(
                strategy_type=StrategyType.FIXED_TIME,
                path=RCMPath[f"{prefix}_FT"],
                requires_secondary_task=False,
                reasoning=f"{prefix}: Fixed-time replacement feasible",
            )

        # Safety/Environmental with no proactive task → REDESIGN (not RTF!)
        return RCMDecisionOutput(
            strategy_type=StrategyType.REDESIGN,
            path=RCMPath[f"{prefix}_REDESIGN"],
            requires_secondary_task=False,
            reasoning=f"{prefix}: No feasible proactive task — Redesign mandatory (RTF not acceptable for safety/environmental)",
        )

    @staticmethod
    def _decide_operational(input: RCMDecisionInput) -> RCMDecisionOutput:
        """Operational consequence — RTF acceptable if no proactive task is cost-effective."""
        if input.cbm_technically_feasible and input.cbm_economically_viable:
            return RCMDecisionOutput(
                strategy_type=StrategyType.CONDITION_BASED,
                path=RCMPath.EVIDENT_OPERATIONAL_CBM,
                requires_secondary_task=True,
                reasoning="Operational: CBM is technically feasible and economically viable",
            )

        if input.ft_feasible and input.failure_pattern in AGE_RELATED_PATTERNS:
            return RCMDecisionOutput(
                strategy_type=StrategyType.FIXED_TIME,
                path=RCMPath.EVIDENT_OPERATIONAL_FT,
                requires_secondary_task=False,
                reasoning="Operational: Fixed-time replacement feasible",
            )

        return RCMDecisionOutput(
            strategy_type=StrategyType.RUN_TO_FAILURE,
            path=RCMPath.EVIDENT_OPERATIONAL_RTF,
            requires_secondary_task=False,
            reasoning="Operational: No cost-effective proactive task — Run-to-failure acceptable",
        )

    @staticmethod
    def _decide_nonoperational(input: RCMDecisionInput) -> RCMDecisionOutput:
        """Non-operational consequence — RTF acceptable."""
        if input.cbm_technically_feasible and input.cbm_economically_viable:
            return RCMDecisionOutput(
                strategy_type=StrategyType.CONDITION_BASED,
                path=RCMPath.EVIDENT_NONOPERATIONAL_CBM,
                requires_secondary_task=True,
                reasoning="Non-operational: CBM is technically feasible and economically viable",
            )

        if input.ft_feasible and input.failure_pattern in AGE_RELATED_PATTERNS:
            return RCMDecisionOutput(
                strategy_type=StrategyType.FIXED_TIME,
                path=RCMPath.EVIDENT_NONOPERATIONAL_FT,
                requires_secondary_task=False,
                reasoning="Non-operational: Fixed-time replacement feasible",
            )

        return RCMDecisionOutput(
            strategy_type=StrategyType.RUN_TO_FAILURE,
            path=RCMPath.EVIDENT_NONOPERATIONAL_RTF,
            requires_secondary_task=False,
            reasoning="Non-operational: No cost-effective proactive task — Run-to-failure acceptable",
        )

    @staticmethod
    def validate_frequency_unit(cause: Cause, frequency_unit: FrequencyUnit) -> list[str]:
        """
        Validate that frequency unit matches cause type.
        Rules from REF-04 §3, items 3-4:
        - Calendar-based ONLY for age-related causes (Age, Contamination)
        - Operational units ONLY for usage-related causes (Use, Abrasion, Erosion)
        """
        warnings = []
        if cause in CALENDAR_CAUSES and frequency_unit not in CALENDAR_UNITS:
            warnings.append(
                f"Cause '{cause.value}' is age-related — should use calendar-based frequency "
                f"(DAYS/WEEKS/MONTHS/YEARS), got {frequency_unit.value}"
            )
        if cause in OPERATIONAL_CAUSES and frequency_unit not in OPERATIONAL_UNITS:
            warnings.append(
                f"Cause '{cause.value}' is usage-related — should use operational frequency "
                f"(HOURS/OPERATING_HOURS/TONNES/CYCLES), got {frequency_unit.value}"
            )
        return warnings
