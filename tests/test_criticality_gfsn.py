"""Tests for GFSN Criticality Mode — Phase 4A."""

from datetime import datetime

from tools.engines.criticality_engine import CriticalityEngine
from tools.models.schemas import (
    CriticalityAssessment,
    CriteriaScore,
    CriticalityCategory,
    GFSNCriticalityAssessment,
    GFSNCriticalityBand,
    GFSNConsequenceCategory,
    GFSNCriteriaScore,
    RiskClass,
)


class TestGFSNBandDetermination:

    def test_alto_band_score_25(self):
        assert CriticalityEngine.determine_gfsn_band(25.0) == GFSNCriticalityBand.ALTO

    def test_alto_band_score_19(self):
        assert CriticalityEngine.determine_gfsn_band(19.0) == GFSNCriticalityBand.ALTO

    def test_moderado_band_score_18(self):
        assert CriticalityEngine.determine_gfsn_band(18.0) == GFSNCriticalityBand.MODERADO

    def test_moderado_band_score_8(self):
        assert CriticalityEngine.determine_gfsn_band(8.0) == GFSNCriticalityBand.MODERADO

    def test_bajo_band_score_7(self):
        assert CriticalityEngine.determine_gfsn_band(7.0) == GFSNCriticalityBand.BAJO

    def test_bajo_band_score_1(self):
        assert CriticalityEngine.determine_gfsn_band(1.0) == GFSNCriticalityBand.BAJO

    def test_boundary_7_to_8(self):
        assert CriticalityEngine.determine_gfsn_band(7.9) == GFSNCriticalityBand.BAJO
        assert CriticalityEngine.determine_gfsn_band(8.0) == GFSNCriticalityBand.MODERADO

    def test_boundary_18_to_19(self):
        assert CriticalityEngine.determine_gfsn_band(18.9) == GFSNCriticalityBand.MODERADO
        assert CriticalityEngine.determine_gfsn_band(19.0) == GFSNCriticalityBand.ALTO


class TestGFSNAssessment:

    def test_assess_gfsn_6_categories(self):
        assessment = GFSNCriticalityAssessment(
            node_id="MI-001",
            assessed_at=datetime.now(),
            assessed_by="test",
            criteria_scores=[
                GFSNCriteriaScore(category=GFSNConsequenceCategory.BUSINESS_IMPACT, consequence_level=4),
                GFSNCriteriaScore(category=GFSNConsequenceCategory.OPERATIONAL_COST, consequence_level=3),
                GFSNCriteriaScore(category=GFSNConsequenceCategory.INTERRUPTION, consequence_level=2),
                GFSNCriteriaScore(category=GFSNConsequenceCategory.SAFETY, consequence_level=5),
                GFSNCriteriaScore(category=GFSNConsequenceCategory.ENVIRONMENT, consequence_level=2),
                GFSNCriteriaScore(category=GFSNConsequenceCategory.RSC, consequence_level=1),
            ],
            probability=4,
        )
        result = CriticalityEngine.assess_gfsn(assessment)
        assert result.overall_score == 20.0  # max(5) * 4
        assert result.band == GFSNCriticalityBand.ALTO
        assert result.max_consequence == 5

    def test_assess_gfsn_bajo(self):
        assessment = GFSNCriticalityAssessment(
            node_id="MI-002",
            assessed_at=datetime.now(),
            assessed_by="test",
            criteria_scores=[
                GFSNCriteriaScore(category=GFSNConsequenceCategory.SAFETY, consequence_level=1),
            ],
            probability=2,
        )
        result = CriticalityEngine.assess_gfsn(assessment)
        assert result.overall_score == 2.0
        assert result.band == GFSNCriticalityBand.BAJO

    def test_assess_gfsn_empty_scores(self):
        assessment = GFSNCriticalityAssessment(
            node_id="MI-003",
            assessed_at=datetime.now(),
            assessed_by="test",
            criteria_scores=[
                GFSNCriteriaScore(category=GFSNConsequenceCategory.SAFETY, consequence_level=1),
            ],
            probability=1,
        )
        assessment.criteria_scores = []
        result = CriticalityEngine.assess_gfsn(assessment)
        assert result.overall_score == 0.0
        assert result.band == GFSNCriticalityBand.BAJO

    def test_gfsn_validate_missing_categories(self):
        scores = [
            GFSNCriteriaScore(category=GFSNConsequenceCategory.SAFETY, consequence_level=3),
            GFSNCriteriaScore(category=GFSNConsequenceCategory.ENVIRONMENT, consequence_level=2),
        ]
        missing = CriticalityEngine.validate_gfsn_categories(scores)
        assert len(missing) == 4
        assert "BUSINESS_IMPACT" in missing
        assert "RSC" in missing

    def test_gfsn_validate_all_present(self):
        scores = [
            GFSNCriteriaScore(category=cat, consequence_level=1)
            for cat in GFSNConsequenceCategory
        ]
        missing = CriticalityEngine.validate_gfsn_categories(scores)
        assert len(missing) == 0


class TestR8ModeIndependence:

    def test_r8_unaffected_by_gfsn(self):
        assessment = CriticalityAssessment(
            assessment_id="test-r8",
            node_id="MI-R8",
            assessed_at=datetime.now(),
            assessed_by="test",
            method="FULL_MATRIX",
            criteria_scores=[
                CriteriaScore(category=CriticalityCategory.SAFETY, consequence_level=4),
                CriteriaScore(category=CriticalityCategory.PRODUCTION, consequence_level=3),
            ],
            probability=5,
            risk_class=RiskClass.I_LOW,
        )
        result = CriticalityEngine.assess(assessment)
        assert result.overall_score == 20.0
        assert result.risk_class == RiskClass.IV_CRITICAL
