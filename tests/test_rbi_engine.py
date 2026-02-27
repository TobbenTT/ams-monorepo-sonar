"""Tests for Risk-Based Inspection (RBI) Engine — Phase 5."""

from datetime import date

from tools.engines.rbi_engine import RBIEngine
from tools.models.schemas import (
    DamageMechanism, InspectionTechnique, RiskLevel,
)


class TestAssess:

    def test_new_equipment_low_risk(self):
        result = RBIEngine.assess(
            "EQ-1", "STRUCTURE", [DamageMechanism.CORROSION],
            age_years=2, design_life_years=25,
        )
        assert result.probability_score <= 2
        assert result.risk_level in (RiskLevel.LOW, RiskLevel.MEDIUM)

    def test_old_equipment_high_risk(self):
        result = RBIEngine.assess(
            "EQ-1", "PRESSURE_VESSEL", [DamageMechanism.CORROSION, DamageMechanism.FATIGUE],
            age_years=23, design_life_years=25,
        )
        assert result.probability_score >= 4
        assert result.risk_level in (RiskLevel.HIGH, RiskLevel.CRITICAL)

    def test_risk_score_product(self):
        result = RBIEngine.assess(
            "EQ-1", "PIPING", [DamageMechanism.EROSION],
            age_years=10, design_life_years=25,
        )
        assert result.risk_score == result.probability_score * result.consequence_score

    def test_corrosion_technique_ut(self):
        result = RBIEngine.assess(
            "EQ-1", "TANK", [DamageMechanism.CORROSION],
            age_years=10, design_life_years=25,
        )
        assert result.recommended_technique == InspectionTechnique.ULTRASONIC_THICKNESS

    def test_fatigue_technique_mpi(self):
        result = RBIEngine.assess(
            "EQ-1", "STRUCTURE", [DamageMechanism.FATIGUE],
            age_years=10, design_life_years=25,
        )
        assert result.recommended_technique == InspectionTechnique.MAGNETIC_PARTICLE

    def test_high_risk_short_interval(self):
        low = RBIEngine.assess(
            "EQ-1", "STRUCTURE", [DamageMechanism.OTHER],
            age_years=2, design_life_years=25,
        )
        high = RBIEngine.assess(
            "EQ-2", "PRESSURE_VESSEL", [DamageMechanism.CORROSION, DamageMechanism.FATIGUE],
            age_years=23, design_life_years=25,
        )
        assert high.recommended_interval_months < low.recommended_interval_months

    def test_next_inspection_date(self):
        result = RBIEngine.assess(
            "EQ-1", "TANK", [DamageMechanism.CORROSION],
            age_years=10, last_inspection_date=date(2024, 1, 15),
        )
        assert result.next_inspection_date is not None
        assert result.next_inspection_date > date(2024, 1, 15)


class TestBatchAssess:

    def test_multiple_equipment(self):
        equipment_list = [
            {"equipment_id": "EQ-1", "equipment_type": "PRESSURE_VESSEL",
             "damage_mechanisms": ["CORROSION"], "age_years": 5},
            {"equipment_id": "EQ-2", "equipment_type": "PIPING",
             "damage_mechanisms": ["EROSION", "FATIGUE"], "age_years": 15},
        ]
        result = RBIEngine.batch_assess("P1", equipment_list)
        assert result.total_equipment == 2
        assert len(result.assessments) == 2

    def test_high_risk_count(self):
        equipment_list = [
            {"equipment_id": "EQ-OLD", "equipment_type": "PRESSURE_VESSEL",
             "damage_mechanisms": ["CORROSION", "FATIGUE", "CREEP"],
             "age_years": 24, "design_life_years": 25},
        ]
        result = RBIEngine.batch_assess("P1", equipment_list)
        assert result.high_risk_count >= 1

    def test_overdue_detection(self):
        equipment_list = [
            {"equipment_id": "EQ-1", "equipment_type": "TANK",
             "damage_mechanisms": ["CORROSION"], "age_years": 20,
             "last_inspection_date": "2020-01-01", "design_life_years": 25},
        ]
        result = RBIEngine.batch_assess("P1", equipment_list)
        assert result.overdue_count >= 1


class TestPrioritize:

    def test_sorted_by_risk_descending(self):
        equipment_list = [
            {"equipment_id": "LOW", "equipment_type": "STRUCTURE",
             "damage_mechanisms": ["OTHER"], "age_years": 2},
            {"equipment_id": "HIGH", "equipment_type": "PRESSURE_VESSEL",
             "damage_mechanisms": ["CORROSION", "FATIGUE"], "age_years": 23},
        ]
        result = RBIEngine.batch_assess("P1", equipment_list)
        prioritized = RBIEngine.prioritize_inspections(result)
        assert prioritized[0].risk_score >= prioritized[-1].risk_score
