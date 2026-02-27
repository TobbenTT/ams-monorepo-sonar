"""
RCA Engine — Phase 4A: GFSN Root Cause Analysis Methodology
Implements structured RCA with event classification, 5W+2H, Cause-Effect (Ishikawa),
5P evidence collection, 3-level root cause chain, and solution prioritization.

RCA lifecycle: OPEN -> UNDER_INVESTIGATION -> COMPLETED -> REVIEWED
"""

from datetime import date, datetime

from tools.models.schemas import (
    Analysis5W2H,
    CauseEffectDiagram,
    DEKPIs,
    DEKPIValue,
    Evidence5P,
    Evidence5PCategory,
    EvidenceType,
    KPIStatus,
    PrioritizedSolution,
    RCAAnalysis,
    RCACause,
    RCALevel,
    RCAStatus,
    RootCauseLevel,
    Solution,
    SolutionQuadrant,
)


class RCAEngine:
    """Manages RCA analysis lifecycle and GFSN methodology steps."""

    STATUS_TRANSITIONS: dict[RCAStatus, list[RCAStatus]] = {
        RCAStatus.OPEN: [RCAStatus.UNDER_INVESTIGATION],
        RCAStatus.UNDER_INVESTIGATION: [RCAStatus.COMPLETED, RCAStatus.OPEN],
        RCAStatus.COMPLETED: [RCAStatus.REVIEWED, RCAStatus.UNDER_INVESTIGATION],
        RCAStatus.REVIEWED: [],
    }

    LEVEL_TEAM_REQUIREMENTS: dict[RCALevel, dict] = {
        RCALevel.LEVEL_1: {"min_members": 1, "description": "Supervisor + operator"},
        RCALevel.LEVEL_2: {"min_members": 3, "description": "Cross-functional team"},
        RCALevel.LEVEL_3: {"min_members": 5, "description": "Full investigation team with external support"},
    }

    @staticmethod
    def classify_event(max_consequence: int, frequency: int) -> tuple[RCALevel, dict]:
        """Classify event into RCA Level 1/2/3 based on consequence x frequency."""
        score = max_consequence * frequency
        if score >= 15:
            level = RCALevel.LEVEL_3
        elif score >= 8:
            level = RCALevel.LEVEL_2
        else:
            level = RCALevel.LEVEL_1
        return level, RCAEngine.LEVEL_TEAM_REQUIREMENTS[level]

    @staticmethod
    def create_analysis(
        event_description: str,
        plant_id: str = "",
        equipment_id: str | None = None,
        level: RCALevel = RCALevel.LEVEL_1,
        team_members: list[str] | None = None,
    ) -> RCAAnalysis:
        """Create a new RCA analysis in OPEN status."""
        return RCAAnalysis(
            event_description=event_description,
            plant_id=plant_id,
            equipment_id=equipment_id,
            level=level,
            status=RCAStatus.OPEN,
            team_members=team_members or [],
        )

    @staticmethod
    def run_5w2h(
        what: str, when: str, where: str, who: str,
        why: str, how: str, how_much: str,
    ) -> Analysis5W2H:
        """Create structured 5W+2H analysis with generated report."""
        report = (
            f"WHAT: {what} | WHEN: {when} | WHERE: {where} | "
            f"WHO: {who} | WHY: {why} | HOW: {how} | HOW MUCH: {how_much}"
        )
        return Analysis5W2H(
            what=what, when=when, where=where, who=who,
            why=why, how=how, how_much=how_much, report=report,
        )

    @staticmethod
    def add_cause(
        analysis: RCAAnalysis,
        cause_text: str,
        evidence_type: EvidenceType,
        parent_cause_id: str | None = None,
    ) -> RCAAnalysis:
        """Add a cause to the cause-effect diagram."""
        new_cause = RCACause(
            text=cause_text,
            evidence_type=evidence_type,
            parent_cause_id=parent_cause_id,
        )
        analysis.cause_effect.causes.append(new_cause)
        if parent_cause_id:
            for c in analysis.cause_effect.causes:
                if c.cause_id == parent_cause_id:
                    c.children.append(new_cause.cause_id)
                    break
        return analysis

    @staticmethod
    def classify_root_cause_level(
        analysis: RCAAnalysis,
        cause_id: str,
        level: RootCauseLevel,
    ) -> RCAAnalysis:
        """Assign root cause level (PHYSICAL/HUMAN/LATENT) to a cause."""
        for cause in analysis.cause_effect.causes:
            if cause.cause_id == cause_id:
                cause.root_cause_level = level
                break
        return analysis

    @staticmethod
    def validate_root_cause_chain(analysis: RCAAnalysis) -> list[str]:
        """
        Validate the root cause chain is complete.
        - At least one cause must exist
        - PHYSICAL root cause always required
        - Level 2+: HUMAN root cause required
        - Level 3: LATENT root cause required
        """
        errors = []
        causes = analysis.cause_effect.causes
        if not causes:
            errors.append("No causes defined in cause-effect diagram")
            return errors

        levels_present = {c.root_cause_level for c in causes if c.root_cause_level is not None}

        if RootCauseLevel.PHYSICAL not in levels_present:
            errors.append("No PHYSICAL root cause identified")

        if analysis.level in (RCALevel.LEVEL_2, RCALevel.LEVEL_3):
            if RootCauseLevel.HUMAN not in levels_present:
                errors.append("Level 2/3 RCA requires at least one HUMAN root cause")

        if analysis.level == RCALevel.LEVEL_3:
            if RootCauseLevel.LATENT not in levels_present:
                errors.append("Level 3 RCA requires at least one LATENT root cause")

        return errors

    @staticmethod
    def collect_evidence_5p(
        analysis: RCAAnalysis,
        category: Evidence5PCategory,
        description: str,
        source: str = "",
        fragility_score: float = 0.0,
    ) -> RCAAnalysis:
        """Add 5P evidence to the analysis."""
        evidence = Evidence5P(
            category=category,
            description=description,
            source=source,
            fragility_score=fragility_score,
        )
        analysis.evidence_5p.append(evidence)
        return analysis

    @staticmethod
    def evaluate_solution(solution: Solution, five_questions: list[bool]) -> bool:
        """
        Evaluate solution against the 5-question filter.
        (1) Eliminates primary effect? (2) Prevents recurrence?
        (3) Aligns with company goals? (4) Under company control? (5) No new problems?
        All 5 must be True to pass.
        """
        if len(five_questions) != 5:
            return False
        passes = all(five_questions)
        solution.five_questions_pass = passes
        return passes

    @staticmethod
    def prioritize_solutions(solutions: list[Solution]) -> list[PrioritizedSolution]:
        """Prioritize solutions by Cost-Benefit x Difficulty quadrant."""
        for s in solutions:
            high_benefit = s.cost_benefit >= 5.0
            low_difficulty = s.difficulty <= 5.0
            if high_benefit and low_difficulty:
                s.quadrant = SolutionQuadrant.HIGH_BENEFIT_LOW_DIFFICULTY
            elif high_benefit and not low_difficulty:
                s.quadrant = SolutionQuadrant.HIGH_BENEFIT_HIGH_DIFFICULTY
            elif not high_benefit and low_difficulty:
                s.quadrant = SolutionQuadrant.LOW_BENEFIT_LOW_DIFFICULTY
            else:
                s.quadrant = SolutionQuadrant.LOW_BENEFIT_HIGH_DIFFICULTY

        quadrant_order = {
            SolutionQuadrant.HIGH_BENEFIT_LOW_DIFFICULTY: 0,
            SolutionQuadrant.HIGH_BENEFIT_HIGH_DIFFICULTY: 1,
            SolutionQuadrant.LOW_BENEFIT_LOW_DIFFICULTY: 2,
            SolutionQuadrant.LOW_BENEFIT_HIGH_DIFFICULTY: 3,
        }

        sorted_solutions = sorted(
            solutions,
            key=lambda s: (quadrant_order.get(s.quadrant, 99), -s.cost_benefit),
        )

        return [
            PrioritizedSolution(
                solution=s,
                rank=i + 1,
                recommendation=f"Priority {i + 1}: {s.quadrant.value if s.quadrant else 'UNCLASSIFIED'}",
            )
            for i, s in enumerate(sorted_solutions)
        ]

    @classmethod
    def advance_status(
        cls,
        analysis: RCAAnalysis,
        target: RCAStatus,
    ) -> tuple[RCAAnalysis, str]:
        """Advance RCA analysis status with lifecycle validation."""
        allowed = cls.STATUS_TRANSITIONS.get(analysis.status, [])
        if target not in allowed:
            return analysis, (
                f"Cannot transition from {analysis.status.value} to {target.value}. "
                f"Allowed: {[s.value for s in allowed]}"
            )
        analysis.status = target
        return analysis, f"Status advanced to {target.value}"

    @staticmethod
    def get_summary(analyses: list[RCAAnalysis]) -> dict:
        """Generate summary statistics for a list of RCA analyses."""
        return {
            "total": len(analyses),
            "open": len([a for a in analyses if a.status == RCAStatus.OPEN]),
            "under_investigation": len([a for a in analyses if a.status == RCAStatus.UNDER_INVESTIGATION]),
            "completed": len([a for a in analyses if a.status == RCAStatus.COMPLETED]),
            "reviewed": len([a for a in analyses if a.status == RCAStatus.REVIEWED]),
            "by_level": {
                level.value: len([a for a in analyses if a.level == level])
                for level in RCALevel
            },
        }

    # --- 4A.10: DE KPIs ---

    @staticmethod
    def compute_de_kpis(
        plant_id: str,
        period_start: date,
        period_end: date,
        events_reported: int,
        events_required: int,
        meetings_held: int,
        meetings_required: int,
        actions_implemented: int,
        actions_planned: int,
        savings_achieved: float,
        savings_target: float,
        failures_current: int,
        failures_previous: int,
    ) -> DEKPIs:
        """
        Compute 5 DE (Defect Elimination) KPIs per GFSN REF-15.
        1. Event reporting compliance (target: >= 95%)
        2. Meeting compliance (target: >= 90%)
        3. Implementation progress (target: >= 80%)
        4. Savings effectiveness (target: >= 70%)
        5. Frequency reduction (target: >= 10% reduction)
        """
        kpis: list[DEKPIValue] = []

        # 1. Event reporting compliance
        report_pct = (events_reported / events_required * 100) if events_required > 0 else None
        kpis.append(DEKPIValue(
            name="event_reporting_compliance",
            value=round(report_pct, 1) if report_pct is not None else None,
            target=95.0,
            status=KPIStatus.ON_TARGET if report_pct is not None and report_pct >= 95 else KPIStatus.BELOW_TARGET,
        ))

        # 2. Meeting compliance
        meeting_pct = (meetings_held / meetings_required * 100) if meetings_required > 0 else None
        kpis.append(DEKPIValue(
            name="meeting_compliance",
            value=round(meeting_pct, 1) if meeting_pct is not None else None,
            target=90.0,
            status=KPIStatus.ON_TARGET if meeting_pct is not None and meeting_pct >= 90 else KPIStatus.BELOW_TARGET,
        ))

        # 3. Implementation progress
        impl_pct = (actions_implemented / actions_planned * 100) if actions_planned > 0 else None
        kpis.append(DEKPIValue(
            name="implementation_progress",
            value=round(impl_pct, 1) if impl_pct is not None else None,
            target=80.0,
            status=KPIStatus.ON_TARGET if impl_pct is not None and impl_pct >= 80 else KPIStatus.BELOW_TARGET,
        ))

        # 4. Savings effectiveness
        savings_pct = (savings_achieved / savings_target * 100) if savings_target > 0 else None
        kpis.append(DEKPIValue(
            name="savings_effectiveness",
            value=round(savings_pct, 1) if savings_pct is not None else None,
            target=70.0,
            status=KPIStatus.ON_TARGET if savings_pct is not None and savings_pct >= 70 else KPIStatus.BELOW_TARGET,
        ))

        # 5. Frequency reduction
        if failures_previous > 0:
            reduction_pct = round((failures_previous - failures_current) / failures_previous * 100, 1)
        else:
            reduction_pct = None
        kpis.append(DEKPIValue(
            name="frequency_reduction",
            value=reduction_pct,
            target=10.0,
            status=KPIStatus.ON_TARGET if reduction_pct is not None and reduction_pct >= 10 else KPIStatus.BELOW_TARGET,
        ))

        values_present = [k.value for k in kpis if k.value is not None]
        overall = round(sum(values_present) / max(len(values_present), 1), 1) if values_present else 0.0

        return DEKPIs(
            plant_id=plant_id,
            period_start=period_start,
            period_end=period_end,
            kpis=kpis,
            overall_compliance=min(overall, 100.0),
        )
