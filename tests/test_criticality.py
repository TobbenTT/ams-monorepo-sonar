"""
Test Suite: Criticality Assessment Engine
Validates risk class calculation from criteria scores × probability.
Based on REF-01 §2.
"""

import pytest

from tools.engines.criticality_engine import ALL_CATEGORIES, CriticalityEngine
from tools.models.schemas import (
    CriticalityAssessment,
    CriticalityCategory,
    CriticalityMethod,
    CriteriaScore,
    RiskClass,
)
from datetime import datetime


class TestOverallScoreCalculation:
    """Score = max(consequence levels) × probability."""

    def test_simple_calculation(self):
        scores = [
            CriteriaScore(category=CriticalityCategory.SAFETY, consequence_level=3),
            CriteriaScore(category=CriticalityCategory.PRODUCTION, consequence_level=5),
        ]
        result = CriticalityEngine.calculate_overall_score(scores, probability=4)
        assert result == 20.0  # max(3,5) × 4 = 20

    def test_minimum_score(self):
        scores = [
            CriteriaScore(category=CriticalityCategory.SAFETY, consequence_level=1),
        ]
        result = CriticalityEngine.calculate_overall_score(scores, probability=1)
        assert result == 1.0

    def test_maximum_score(self):
        scores = [
            CriteriaScore(category=CriticalityCategory.SAFETY, consequence_level=5),
        ]
        result = CriticalityEngine.calculate_overall_score(scores, probability=5)
        assert result == 25.0

    def test_empty_scores(self):
        result = CriticalityEngine.calculate_overall_score([], probability=3)
        assert result == 0.0


class TestRiskClassDetermination:
    """Risk matrix: 4 classes based on score ranges."""

    def test_class_i_low(self):
        """Score 1-4 → Class I (Low)."""
        for score in [1.0, 2.0, 3.0, 4.0]:
            assert CriticalityEngine.determine_risk_class(score) == RiskClass.I_LOW

    def test_class_ii_medium(self):
        """Score 5-9 → Class II (Medium)."""
        for score in [5.0, 6.0, 7.0, 8.0, 9.0]:
            assert CriticalityEngine.determine_risk_class(score) == RiskClass.II_MEDIUM

    def test_class_iii_high(self):
        """Score 10-16 → Class III (High)."""
        for score in [10.0, 12.0, 15.0, 16.0]:
            assert CriticalityEngine.determine_risk_class(score) == RiskClass.III_HIGH

    def test_class_iv_critical(self):
        """Score 17-25 → Class IV (Critical)."""
        for score in [17.0, 20.0, 25.0]:
            assert CriticalityEngine.determine_risk_class(score) == RiskClass.IV_CRITICAL

    def test_boundary_4_to_5(self):
        """Boundary between Class I and II."""
        assert CriticalityEngine.determine_risk_class(4.0) == RiskClass.I_LOW
        assert CriticalityEngine.determine_risk_class(5.0) == RiskClass.II_MEDIUM

    def test_boundary_9_to_10(self):
        """Boundary between Class II and III."""
        assert CriticalityEngine.determine_risk_class(9.0) == RiskClass.II_MEDIUM
        assert CriticalityEngine.determine_risk_class(10.0) == RiskClass.III_HIGH

    def test_boundary_16_to_17(self):
        """Boundary between Class III and IV."""
        assert CriticalityEngine.determine_risk_class(16.0) == RiskClass.III_HIGH
        assert CriticalityEngine.determine_risk_class(17.0) == RiskClass.IV_CRITICAL


class TestFullMatrixValidation:
    """FULL_MATRIX method requires all 11 categories."""

    def test_all_11_categories(self):
        """All categories present → no missing."""
        scores = [CriteriaScore(category=c, consequence_level=3) for c in ALL_CATEGORIES]
        missing = CriticalityEngine.validate_full_matrix(scores)
        assert len(missing) == 0

    def test_missing_categories(self):
        """Subset of categories → reports missing."""
        scores = [
            CriteriaScore(category=CriticalityCategory.SAFETY, consequence_level=3),
            CriteriaScore(category=CriticalityCategory.PRODUCTION, consequence_level=5),
        ]
        missing = CriticalityEngine.validate_full_matrix(scores)
        assert len(missing) == 9  # 11 - 2 = 9

    def test_all_categories_defined(self):
        """Verify all 11 categories exist."""
        assert len(ALL_CATEGORIES) == 11
        expected = {
            "SAFETY", "HEALTH", "ENVIRONMENT", "PRODUCTION",
            "OPERATING_COST", "CAPITAL_COST", "SCHEDULE", "REVENUE",
            "COMMUNICATIONS", "COMPLIANCE", "REPUTATION",
        }
        actual = {c.value for c in ALL_CATEGORIES}
        assert actual == expected


class TestAssessMethod:
    """Integration test: CriticalityEngine.assess()."""

    def test_assess_updates_score_and_class(self, sample_criticality_assessment):
        """Assess should calculate score and risk class."""
        # The fixture has max consequence = 5 (PRODUCTION, REVENUE), probability = 4
        # Score should be 5 × 4 = 20 → Class IV
        result = CriticalityEngine.assess(sample_criticality_assessment)
        assert result.overall_score == 20.0
        assert result.risk_class == RiskClass.IV_CRITICAL

    def test_assess_low_criticality(self):
        """Low criticality equipment."""
        assessment = CriticalityAssessment(
            node_id="X",
            assessed_at=datetime.now(),
            assessed_by="ENG",
            method=CriticalityMethod.SIMPLIFIED,
            criteria_scores=[
                CriteriaScore(category=CriticalityCategory.SAFETY, consequence_level=1),
                CriteriaScore(category=CriticalityCategory.PRODUCTION, consequence_level=2),
            ],
            probability=1,
            risk_class=RiskClass.I_LOW,
        )
        result = CriticalityEngine.assess(assessment)
        assert result.overall_score == 2.0  # max(1,2) × 1 = 2
        assert result.risk_class == RiskClass.I_LOW


class TestPhosphateRealisticScenarios:
    """Real-world phosphate equipment criticality scenarios."""

    def test_sag_mill_critical(self):
        """SAG Mill should be Class III or IV in phosphate operations."""
        scores = [
            CriteriaScore(category=CriticalityCategory.SAFETY, consequence_level=4),
            CriteriaScore(category=CriticalityCategory.PRODUCTION, consequence_level=5),
            CriteriaScore(category=CriticalityCategory.CAPITAL_COST, consequence_level=5),
            CriteriaScore(category=CriticalityCategory.REVENUE, consequence_level=5),
        ]
        score = CriticalityEngine.calculate_overall_score(scores, probability=4)
        risk_class = CriticalityEngine.determine_risk_class(score)
        assert risk_class in (RiskClass.III_HIGH, RiskClass.IV_CRITICAL)

    def test_slurry_pump_high(self):
        """Phosphate slurry pump — typically high criticality due to abrasive service."""
        scores = [
            CriteriaScore(category=CriticalityCategory.PRODUCTION, consequence_level=4),
            CriteriaScore(category=CriticalityCategory.ENVIRONMENT, consequence_level=3),
            CriteriaScore(category=CriticalityCategory.OPERATING_COST, consequence_level=4),
        ]
        score = CriticalityEngine.calculate_overall_score(scores, probability=4)
        risk_class = CriticalityEngine.determine_risk_class(score)
        assert risk_class in (RiskClass.III_HIGH, RiskClass.IV_CRITICAL)

    def test_lighting_tower_low(self):
        """Non-critical support equipment should be Class I or II."""
        scores = [
            CriteriaScore(category=CriticalityCategory.SAFETY, consequence_level=2),
            CriteriaScore(category=CriticalityCategory.PRODUCTION, consequence_level=1),
        ]
        score = CriticalityEngine.calculate_overall_score(scores, probability=2)
        risk_class = CriticalityEngine.determine_risk_class(score)
        assert risk_class in (RiskClass.I_LOW, RiskClass.II_MEDIUM)
