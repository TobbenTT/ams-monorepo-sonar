"""
Criticality Assessment Engine — Deterministic
Calculates risk class from criteria scores × probability.
Based on REF-01 §2: 11 consequence categories, 5 probability levels, 4 risk classes.
"""

from tools.models.schemas import (
    CriticalityAssessment,
    CriticalityCategory,
    CriteriaScore,
    GFSNCriticalityAssessment,
    GFSNCriticalityBand,
    GFSNConsequenceCategory,
    GFSNCriteriaScore,
    RiskClass,
)

# All 11 categories that should be assessed in FULL_MATRIX method
ALL_CATEGORIES = [
    CriticalityCategory.SAFETY,
    CriticalityCategory.HEALTH,
    CriticalityCategory.ENVIRONMENT,
    CriticalityCategory.PRODUCTION,
    CriticalityCategory.OPERATING_COST,
    CriticalityCategory.CAPITAL_COST,
    CriticalityCategory.SCHEDULE,
    CriticalityCategory.REVENUE,
    CriticalityCategory.COMMUNICATIONS,
    CriticalityCategory.COMPLIANCE,
    CriticalityCategory.REPUTATION,
]


class CriticalityEngine:
    """Calculates criticality risk class from assessment data."""

    @staticmethod
    def calculate_overall_score(criteria_scores: list[CriteriaScore], probability: int) -> float:
        """
        Overall score = max(consequence levels) × probability.
        This follows the risk matrix approach: Risk = Consequence × Likelihood.
        """
        if not criteria_scores:
            return 0.0
        max_consequence = max(s.consequence_level for s in criteria_scores)
        return float(max_consequence * probability)

    @staticmethod
    def determine_risk_class(overall_score: float) -> RiskClass:
        """
        Risk class based on overall score (max_consequence × probability).
        Matrix: max score = 5×5 = 25.

        Class I (Low):      1-4
        Class II (Medium):  5-9
        Class III (High):   10-16
        Class IV (Critical): 17-25
        """
        if overall_score <= 4:
            return RiskClass.I_LOW
        elif overall_score <= 9:
            return RiskClass.II_MEDIUM
        elif overall_score <= 16:
            return RiskClass.III_HIGH
        else:
            return RiskClass.IV_CRITICAL

    @staticmethod
    def validate_full_matrix(criteria_scores: list[CriteriaScore]) -> list[str]:
        """Check if all 11 categories are present for FULL_MATRIX method."""
        present = {s.category for s in criteria_scores}
        missing = [c.value for c in ALL_CATEGORIES if c not in present]
        return missing

    @classmethod
    def assess(cls, assessment: CriticalityAssessment) -> CriticalityAssessment:
        """Calculate and update the overall score and risk class."""
        score = cls.calculate_overall_score(assessment.criteria_scores, assessment.probability)
        risk_class = cls.determine_risk_class(score)
        assessment.overall_score = score
        assessment.risk_class = risk_class
        return assessment

    # --- GFSN Mode (Phase 4A) ---

    @staticmethod
    def determine_gfsn_band(overall_score: float) -> GFSNCriticalityBand:
        """GFSN 3-band classification: Alto 19-25, Moderado 8-18, Bajo 1-7."""
        if overall_score >= 19:
            return GFSNCriticalityBand.ALTO
        elif overall_score >= 8:
            return GFSNCriticalityBand.MODERADO
        else:
            return GFSNCriticalityBand.BAJO

    @staticmethod
    def validate_gfsn_categories(criteria_scores: list[GFSNCriteriaScore]) -> list[str]:
        """Check if all 6 GFSN categories are present."""
        gfsn_categories = [
            GFSNConsequenceCategory.BUSINESS_IMPACT,
            GFSNConsequenceCategory.OPERATIONAL_COST,
            GFSNConsequenceCategory.INTERRUPTION,
            GFSNConsequenceCategory.SAFETY,
            GFSNConsequenceCategory.ENVIRONMENT,
            GFSNConsequenceCategory.RSC,
        ]
        present = {s.category for s in criteria_scores}
        return [c.value for c in gfsn_categories if c not in present]

    @classmethod
    def assess_gfsn(cls, assessment: GFSNCriticalityAssessment) -> GFSNCriticalityAssessment:
        """GFSN assessment: same formula (max consequence x probability), 3-band output."""
        if not assessment.criteria_scores:
            assessment.overall_score = 0.0
            assessment.band = GFSNCriticalityBand.BAJO
            assessment.max_consequence = 1
            return assessment
        max_c = max(s.consequence_level for s in assessment.criteria_scores)
        score = float(max_c * assessment.probability)
        assessment.overall_score = score
        assessment.band = cls.determine_gfsn_band(score)
        assessment.max_consequence = max_c
        return assessment
