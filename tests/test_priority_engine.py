"""
Test Suite: Priority Engine (GAP-5, M1/M2)
Validates priority calculation and override validation.
"""

import pytest

from tools.engines.priority_engine import PriorityEngine, PriorityInput


class TestPriorityCalculation:
    def test_emergency_aa_safety_stopped(self):
        """AA criticality + safety + stopped → EMERGENCY."""
        result = PriorityEngine.calculate_priority(PriorityInput(
            equipment_criticality="AA",
            has_safety_flags=True,
            failure_mode_detected="Vibration",
            production_impact_estimated=True,
            is_recurring=False,
            equipment_running=False,
        ))
        assert result.priority == "1_EMERGENCY"
        assert result.escalation_needed is True

    def test_urgent_a_plus_production(self):
        """A+ criticality + production impact → URGENT."""
        result = PriorityEngine.calculate_priority(PriorityInput(
            equipment_criticality="A+",
            has_safety_flags=False,
            failure_mode_detected="Leakage",
            production_impact_estimated=True,
            is_recurring=False,
            equipment_running=True,
        ))
        assert result.priority == "2_URGENT"

    def test_normal_b_criticality(self):
        """B criticality, no flags → NORMAL."""
        result = PriorityEngine.calculate_priority(PriorityInput(
            equipment_criticality="B",
            has_safety_flags=False,
            failure_mode_detected=None,
            production_impact_estimated=False,
            is_recurring=True,
            equipment_running=True,
        ))
        assert result.priority == "3_NORMAL"

    def test_planned_d_criticality(self):
        """D criticality, no impact → PLANNED."""
        result = PriorityEngine.calculate_priority(PriorityInput(
            equipment_criticality="D",
            has_safety_flags=False,
            failure_mode_detected=None,
            production_impact_estimated=False,
            is_recurring=False,
            equipment_running=True,
        ))
        assert result.priority == "4_PLANNED"

    def test_escalation_aa_safety(self):
        """AA + safety = always escalate."""
        result = PriorityEngine.calculate_priority(PriorityInput(
            equipment_criticality="AA",
            has_safety_flags=True,
            failure_mode_detected=None,
            production_impact_estimated=False,
            is_recurring=False,
            equipment_running=True,
        ))
        assert result.escalation_needed is True

    def test_justification_includes_factors(self):
        result = PriorityEngine.calculate_priority(PriorityInput(
            equipment_criticality="A",
            has_safety_flags=True,
            failure_mode_detected="Overheating",
            production_impact_estimated=True,
            is_recurring=True,
            equipment_running=False,
        ))
        assert "Safety flags" in result.justification
        assert "Production impact" in result.justification
        assert "Recurring" in result.justification
        assert "stopped" in result.justification


class TestPriorityOverride:
    def test_downgrade_warning(self):
        result = PriorityEngine.validate_priority_override("1_EMERGENCY", "3_NORMAL")
        assert result["downgraded"] is True
        assert result["warning"] is not None

    def test_upgrade_no_warning(self):
        result = PriorityEngine.validate_priority_override("3_NORMAL", "1_EMERGENCY")
        assert result["upgraded"] is True
        assert result["warning"] is None

    def test_same_priority_no_change(self):
        result = PriorityEngine.validate_priority_override("2_URGENT", "2_URGENT")
        assert result["downgraded"] is False
        assert result["upgraded"] is False
