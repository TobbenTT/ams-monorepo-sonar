"""Risk-Based Inspection (RBI) Engine — Phase 5 (REF-13 §7.4.3).

For static equipment (vessels, piping, tanks, heat exchangers).
Evaluates damage mechanisms and consequence of loss of containment.
Output: inspection plan with technique, frequency, and coverage based on risk.

Deterministic — no LLM required.
"""

from datetime import date, datetime
from dateutil.relativedelta import relativedelta

from tools.models.schemas import (
    RBIAssessment, RBIResult, RiskLevel,
    DamageMechanism, InspectionTechnique,
)


TECHNIQUE_MAP: dict[DamageMechanism, InspectionTechnique] = {
    DamageMechanism.CORROSION: InspectionTechnique.ULTRASONIC_THICKNESS,
    DamageMechanism.FATIGUE: InspectionTechnique.MAGNETIC_PARTICLE,
    DamageMechanism.CREEP: InspectionTechnique.ULTRASONIC_THICKNESS,
    DamageMechanism.EROSION: InspectionTechnique.ULTRASONIC_THICKNESS,
    DamageMechanism.STRESS_CORROSION: InspectionTechnique.DYE_PENETRANT,
    DamageMechanism.HYDROGEN_DAMAGE: InspectionTechnique.ULTRASONIC_THICKNESS,
    DamageMechanism.OTHER: InspectionTechnique.VISUAL,
}

EQUIPMENT_CONSEQUENCE: dict[str, int] = {
    "PRESSURE_VESSEL": 5,
    "HEAT_EXCHANGER": 4,
    "PIPING": 3,
    "TANK": 3,
    "STRUCTURE": 2,
    "VALVE": 2,
}


class RBIEngine:
    """Risk-Based Inspection prioritization for static equipment."""

    @staticmethod
    def assess(
        equipment_id: str,
        equipment_type: str,
        damage_mechanisms: list[DamageMechanism],
        age_years: float,
        last_inspection_date: date | None = None,
        design_life_years: float = 25.0,
        operating_conditions: str = "NORMAL",
    ) -> RBIAssessment:
        """Assess RBI risk for a single equipment item.

        probability_score (1-5): based on age/design_life ratio + damage mechanisms
        consequence_score (1-5): based on equipment type
        risk = probability × consequence
        """
        age_ratio = age_years / design_life_years if design_life_years > 0 else 1.0
        if age_ratio >= 0.9:
            prob_base = 5
        elif age_ratio >= 0.7:
            prob_base = 4
        elif age_ratio >= 0.5:
            prob_base = 3
        elif age_ratio >= 0.3:
            prob_base = 2
        else:
            prob_base = 1

        dm_factor = min(2, len(damage_mechanisms))
        if operating_conditions.upper() in ("SEVERE", "HARSH", "AGGRESSIVE"):
            dm_factor += 1

        probability_score = min(5, max(1, prob_base + dm_factor - 1))

        eq_upper = equipment_type.upper()
        consequence_score = EQUIPMENT_CONSEQUENCE.get(eq_upper, 2)

        risk_score = probability_score * consequence_score

        if risk_score <= 6:
            risk_level = RiskLevel.LOW
        elif risk_score <= 12:
            risk_level = RiskLevel.MEDIUM
        elif risk_score <= 20:
            risk_level = RiskLevel.HIGH
        else:
            risk_level = RiskLevel.CRITICAL

        primary_dm = damage_mechanisms[0] if damage_mechanisms else DamageMechanism.OTHER
        technique = TECHNIQUE_MAP.get(primary_dm, InspectionTechnique.VISUAL)

        interval_map = {
            RiskLevel.LOW: 60,
            RiskLevel.MEDIUM: 36,
            RiskLevel.HIGH: 12,
            RiskLevel.CRITICAL: 6,
        }
        recommended_interval = interval_map[risk_level]

        if last_inspection_date:
            next_date = last_inspection_date + relativedelta(months=recommended_interval)
        else:
            next_date = date.today()

        return RBIAssessment(
            equipment_id=equipment_id,
            equipment_type=equipment_type,
            damage_mechanisms=damage_mechanisms,
            probability_score=probability_score,
            consequence_score=consequence_score,
            risk_score=float(risk_score),
            risk_level=risk_level,
            recommended_technique=technique,
            recommended_interval_months=recommended_interval,
            next_inspection_date=next_date,
        )

    @staticmethod
    def batch_assess(
        plant_id: str,
        equipment_list: list[dict],
    ) -> RBIResult:
        """Assess multiple equipment items.

        Each dict: {equipment_id, equipment_type, damage_mechanisms (list[str]),
                     age_years, last_inspection_date (optional), design_life_years (optional)}
        """
        assessments: list[RBIAssessment] = []
        high_risk = 0
        overdue = 0

        for eq in equipment_list:
            dms = [DamageMechanism(dm) for dm in eq.get("damage_mechanisms", ["OTHER"])]
            last_insp = None
            if eq.get("last_inspection_date"):
                if isinstance(eq["last_inspection_date"], str):
                    last_insp = date.fromisoformat(eq["last_inspection_date"])
                else:
                    last_insp = eq["last_inspection_date"]

            assessment = RBIEngine.assess(
                equipment_id=eq.get("equipment_id", ""),
                equipment_type=eq.get("equipment_type", "STRUCTURE"),
                damage_mechanisms=dms,
                age_years=eq.get("age_years", 0),
                last_inspection_date=last_insp,
                design_life_years=eq.get("design_life_years", 25.0),
                operating_conditions=eq.get("operating_conditions", "NORMAL"),
            )
            assessments.append(assessment)

            if assessment.risk_level in (RiskLevel.HIGH, RiskLevel.CRITICAL):
                high_risk += 1
            if assessment.next_inspection_date and assessment.next_inspection_date < date.today():
                overdue += 1

        return RBIResult(
            plant_id=plant_id,
            total_equipment=len(assessments),
            assessments=assessments,
            high_risk_count=high_risk,
            overdue_count=overdue,
        )

    @staticmethod
    def prioritize_inspections(result: RBIResult) -> list[RBIAssessment]:
        """Sort assessments by risk_score descending, flag overdue first."""
        return sorted(
            result.assessments,
            key=lambda a: (
                -(1 if a.next_inspection_date and a.next_inspection_date < date.today() else 0),
                -a.risk_score,
            ),
        )
