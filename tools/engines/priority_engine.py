"""
Priority Engine — M1/M2 AI Priority Suggestion (GAP-5)
Deterministic priority calculation based on equipment criticality,
failure mode, safety flags, and production impact.
"""

from dataclasses import dataclass

from tools.models.schemas import GFSNCriticalityBand, GFSNPriority, GFSNPriorityOutput


@dataclass
class PriorityInput:
    """Input for priority calculation."""
    equipment_criticality: str  # AA, A+, A, B, C, D
    has_safety_flags: bool
    failure_mode_detected: str | None
    production_impact_estimated: bool
    is_recurring: bool  # Same failure reported before
    equipment_running: bool  # Currently operating or stopped


@dataclass
class PriorityOutput:
    """Output from priority calculation."""
    priority: str  # 1_EMERGENCY, 2_URGENT, 3_NORMAL, 4_PLANNED
    justification: str
    escalation_needed: bool


# Criticality weight mapping
CRITICALITY_WEIGHT = {
    "AA": 10,
    "A+": 8,
    "A": 6,
    "B": 4,
    "C": 2,
    "D": 1,
}


class PriorityEngine:
    """Deterministic priority calculation engine."""

    @staticmethod
    def calculate_priority(input: PriorityInput) -> PriorityOutput:
        """
        Calculate work request priority based on multiple factors.

        Scoring:
        - Criticality weight: 1-10
        - Safety flag: +5
        - Production impact: +3
        - Recurring failure: +2
        - Equipment stopped: +3

        Thresholds:
        - >= 15: EMERGENCY (1)
        - >= 10: URGENT (2)
        - >= 5:  NORMAL (3)
        - < 5:   PLANNED (4)
        """
        score = CRITICALITY_WEIGHT.get(input.equipment_criticality, 1)
        reasons = [f"Equipment criticality: {input.equipment_criticality} (weight {score})"]

        if input.has_safety_flags:
            score += 5
            reasons.append("Safety flags present (+5)")

        if input.production_impact_estimated:
            score += 3
            reasons.append("Production impact estimated (+3)")

        if input.is_recurring:
            score += 2
            reasons.append("Recurring failure pattern (+2)")

        if not input.equipment_running:
            score += 3
            reasons.append("Equipment currently stopped (+3)")

        # Determine priority
        if score >= 15:
            priority = "1_EMERGENCY"
        elif score >= 10:
            priority = "2_URGENT"
        elif score >= 5:
            priority = "3_NORMAL"
        else:
            priority = "4_PLANNED"

        escalation = score >= 15 or (input.has_safety_flags and input.equipment_criticality in ("AA", "A+"))

        return PriorityOutput(
            priority=priority,
            justification="; ".join(reasons),
            escalation_needed=escalation,
        )

    @staticmethod
    def validate_priority_override(
        ai_priority: str,
        human_priority: str,
    ) -> dict:
        """
        Validate a human priority override against AI suggestion.
        Returns warning if human downgrades safety-related priority.
        """
        priority_order = {"1_EMERGENCY": 1, "2_URGENT": 2, "3_NORMAL": 3, "4_PLANNED": 4}
        ai_rank = priority_order.get(ai_priority, 4)
        human_rank = priority_order.get(human_priority, 4)

        result = {
            "valid": True,
            "warning": None,
            "downgraded": human_rank > ai_rank,
            "upgraded": human_rank < ai_rank,
        }

        if human_rank > ai_rank:
            result["warning"] = (
                f"Priority downgraded from {ai_priority} to {human_priority}. "
                f"Ensure safety considerations have been reviewed."
            )

        return result

    # --- GFSN Mode (Phase 4A) ---

    # GFSN 2D matrix: (CriticalityBand, ConsequenceLevel) -> Priority
    GFSN_PRIORITY_MATRIX: dict[tuple[str, str], str] = {
        ("ALTO", "HIGH"): "ALTO",
        ("ALTO", "MED"): "ALTO",
        ("ALTO", "LOW"): "MODERADO",
        ("MODERADO", "HIGH"): "ALTO",
        ("MODERADO", "MED"): "MODERADO",
        ("MODERADO", "LOW"): "BAJO",
        ("BAJO", "HIGH"): "MODERADO",
        ("BAJO", "MED"): "BAJO",
        ("BAJO", "LOW"): "BAJO",
    }

    GFSN_RESPONSE_TIMES = {
        "ALTO": "Immediate",
        "MODERADO": "<14 days",
        "BAJO": ">14 days",
    }

    @classmethod
    def calculate_gfsn_priority(
        cls,
        criticality_band: GFSNCriticalityBand,
        max_consequence: int,
    ) -> GFSNPriorityOutput:
        """GFSN 2D matrix: Equipment Criticality Band x Max Consequence -> Priority."""
        if max_consequence >= 4:
            consequence_level = "HIGH"
        elif max_consequence == 3:
            consequence_level = "MED"
        else:
            consequence_level = "LOW"

        key = (criticality_band.value, consequence_level)
        priority_value = cls.GFSN_PRIORITY_MATRIX[key]
        response = cls.GFSN_RESPONSE_TIMES[priority_value]

        return GFSNPriorityOutput(
            priority=GFSNPriority(priority_value),
            criticality_band=criticality_band,
            max_consequence=max_consequence,
            response_time=response,
            justification=(
                f"GFSN Matrix: {criticality_band.value} band x "
                f"consequence {max_consequence} ({consequence_level}) = {priority_value}. "
                f"Response: {response}"
            ),
        )
