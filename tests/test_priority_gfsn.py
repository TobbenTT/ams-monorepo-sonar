"""Tests for GFSN Priority Mode — Phase 4A."""

from tools.engines.priority_engine import PriorityEngine, PriorityInput
from tools.models.schemas import GFSNCriticalityBand, GFSNPriority


class TestGFSNPriorityMatrix:

    def test_alto_band_high_consequence(self):
        result = PriorityEngine.calculate_gfsn_priority(GFSNCriticalityBand.ALTO, 5)
        assert result.priority == GFSNPriority.ALTO
        assert result.response_time == "Immediate"

    def test_alto_band_low_consequence(self):
        result = PriorityEngine.calculate_gfsn_priority(GFSNCriticalityBand.ALTO, 2)
        assert result.priority == GFSNPriority.MODERADO

    def test_moderado_band_med_consequence(self):
        result = PriorityEngine.calculate_gfsn_priority(GFSNCriticalityBand.MODERADO, 3)
        assert result.priority == GFSNPriority.MODERADO
        assert result.response_time == "<14 days"

    def test_bajo_band_low_consequence(self):
        result = PriorityEngine.calculate_gfsn_priority(GFSNCriticalityBand.BAJO, 1)
        assert result.priority == GFSNPriority.BAJO
        assert result.response_time == ">14 days"

    def test_bajo_band_high_consequence(self):
        result = PriorityEngine.calculate_gfsn_priority(GFSNCriticalityBand.BAJO, 4)
        assert result.priority == GFSNPriority.MODERADO

    def test_justification_includes_matrix_info(self):
        result = PriorityEngine.calculate_gfsn_priority(GFSNCriticalityBand.ALTO, 5)
        assert "GFSN Matrix" in result.justification
        assert "ALTO" in result.justification

    def test_additive_mode_unaffected(self):
        inp = PriorityInput(
            equipment_criticality="AA",
            has_safety_flags=True,
            failure_mode_detected="bearing_wear",
            production_impact_estimated=True,
            is_recurring=True,
            equipment_running=False,
        )
        result = PriorityEngine.calculate_priority(inp)
        assert result.priority == "1_EMERGENCY"
        assert result.escalation_needed is True
