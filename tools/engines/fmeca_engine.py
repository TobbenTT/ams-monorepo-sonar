"""FMECA Engine — G18 Gap Closure (Phase 7).

4-stage FMECA workflow:
  Stage 1: Define functions
  Stage 2: Identify failures and failure modes
  Stage 3: Assess effects (severity, occurrence, detection → RPN)
  Stage 4: Decision logic (calls RCMDecisionEngine)

Deterministic — no LLM required.
"""

from datetime import datetime
from uuid import uuid4

from tools.engines.rcm_decision_engine import RCMDecisionEngine, RCMDecisionInput
from tools.engines.state_machine import StateMachine
from tools.models.schemas import (
    FailureConsequence,
    FailurePattern,
    FMECAStage,
    FMECAWorksheetStatus,
    RPNCategory,
    RPNScore,
    FMECARow,
    FMECAWorksheet,
    FMECASummary,
)


RPN_THRESHOLDS = {
    RPNCategory.LOW: (1, 49),
    RPNCategory.MEDIUM: (50, 99),
    RPNCategory.HIGH: (100, 199),
    RPNCategory.CRITICAL: (200, 1000),
}

_STAGE_ORDER = [
    FMECAStage.STAGE_1_FUNCTIONS,
    FMECAStage.STAGE_2_FAILURES,
    FMECAStage.STAGE_3_EFFECTS,
    FMECAStage.STAGE_4_DECISIONS,
]

_CONSEQUENCE_MAP = {
    "HIDDEN_SAFETY": FailureConsequence.HIDDEN_SAFETY,
    "HIDDEN_NONSAFETY": FailureConsequence.HIDDEN_NONSAFETY,
    "EVIDENT_SAFETY": FailureConsequence.EVIDENT_SAFETY,
    "EVIDENT_ENVIRONMENTAL": FailureConsequence.EVIDENT_ENVIRONMENTAL,
    "EVIDENT_OPERATIONAL": FailureConsequence.EVIDENT_OPERATIONAL,
    "EVIDENT_NONOPERATIONAL": FailureConsequence.EVIDENT_NONOPERATIONAL,
}


class FMECAEngine:
    """FMECA workflow with 4-stage orchestration and RPN calculation."""

    @staticmethod
    def create_worksheet(
        equipment_id: str,
        equipment_tag: str = "",
        equipment_name: str = "",
        analyst: str = "",
    ) -> FMECAWorksheet:
        """Create a new DRAFT worksheet at Stage 1."""
        return FMECAWorksheet(
            worksheet_id=f"FMECA-{uuid4().hex[:8].upper()}",
            equipment_id=equipment_id,
            equipment_tag=equipment_tag,
            equipment_name=equipment_name,
            status=FMECAWorksheetStatus.DRAFT,
            current_stage=FMECAStage.STAGE_1_FUNCTIONS,
            stage_completion={s.value: False for s in FMECAStage},
            analyst=analyst,
            created_at=datetime.now(),
        )

    @staticmethod
    def add_row(worksheet: FMECAWorksheet, row_data: dict) -> FMECAWorksheet:
        """Add a row to the worksheet.

        Args:
            worksheet: The FMECA worksheet.
            row_data: Dict with FMECA row fields (function_description,
                functional_failure, failure_mode, failure_effect,
                severity, occurrence, detection, failure_consequence, etc.)

        Returns:
            Updated worksheet with new row appended.
        """
        row_id = row_data.get("row_id", f"R-{len(worksheet.rows)+1}")
        severity = min(max(int(row_data.get("severity", 1)), 1), 10)
        occurrence = min(max(int(row_data.get("occurrence", 1)), 1), 10)
        detection = min(max(int(row_data.get("detection", 1)), 1), 10)
        rpn = severity * occurrence * detection
        category = FMECAEngine._categorize_rpn(rpn)

        row = FMECARow(
            row_id=row_id,
            function_description=row_data.get("function_description", ""),
            functional_failure=row_data.get("functional_failure", ""),
            failure_mode=row_data.get("failure_mode", ""),
            failure_effect=row_data.get("failure_effect", ""),
            failure_consequence=row_data.get("failure_consequence"),
            severity=severity,
            occurrence=occurrence,
            detection=detection,
            rpn=rpn,
            rpn_category=category,
            recommended_action=row_data.get("recommended_action", ""),
        )
        worksheet.rows.append(row)

        # Transition to IN_PROGRESS if still DRAFT
        if worksheet.status == FMECAWorksheetStatus.DRAFT:
            worksheet.status = FMECAWorksheetStatus.IN_PROGRESS

        return worksheet

    @staticmethod
    def calculate_rpn(severity: int, occurrence: int, detection: int) -> RPNScore:
        """Calculate RPN from S x O x D.

        Args:
            severity: 1-10
            occurrence: 1-10
            detection: 1-10

        Returns:
            RPNScore with value and category.
        """
        severity = min(max(severity, 1), 10)
        occurrence = min(max(occurrence, 1), 10)
        detection = min(max(detection, 1), 10)
        rpn = severity * occurrence * detection
        category = FMECAEngine._categorize_rpn(rpn)
        return RPNScore(
            severity=severity,
            occurrence=occurrence,
            detection=detection,
            rpn=rpn,
            category=category,
        )

    @staticmethod
    def run_stage_4_decisions(worksheet: FMECAWorksheet) -> FMECAWorksheet:
        """Run RCM decision logic on rows with failure_consequence but no strategy.

        Calls RCMDecisionEngine.decide() for each eligible row and populates
        strategy_type and rcm_path.
        """
        for row in worksheet.rows:
            if row.failure_consequence and not row.strategy_type:
                consequence = _CONSEQUENCE_MAP.get(row.failure_consequence)
                if consequence is None:
                    continue

                is_hidden = row.failure_consequence.startswith("HIDDEN")
                cbm_feasible = row.severity >= 4
                cbm_viable = row.occurrence >= 3
                ft_feasible = row.severity >= 6

                decision_input = RCMDecisionInput(
                    is_hidden=is_hidden,
                    failure_consequence=consequence,
                    cbm_technically_feasible=cbm_feasible,
                    cbm_economically_viable=cbm_viable,
                    ft_feasible=ft_feasible,
                    failure_pattern=FailurePattern.E_RANDOM if not ft_feasible else FailurePattern.B_AGE,
                )
                output = RCMDecisionEngine.decide(decision_input)
                row.strategy_type = output.strategy_type.value
                row.rcm_path = output.path.value

        worksheet.stage_completion[FMECAStage.STAGE_4_DECISIONS.value] = True
        return worksheet

    @staticmethod
    def advance_stage(
        worksheet: FMECAWorksheet,
        target_stage: FMECAStage,
    ) -> tuple[FMECAWorksheet, str]:
        """Advance to the next stage with validation.

        Stages must progress sequentially: 1→2→3→4.
        """
        current_idx = _STAGE_ORDER.index(worksheet.current_stage)
        target_idx = _STAGE_ORDER.index(target_stage)

        if target_idx != current_idx + 1:
            return worksheet, (
                f"Cannot skip stages: current={worksheet.current_stage.value}, "
                f"target={target_stage.value}. Must progress sequentially."
            )

        # Prerequisites
        if target_stage == FMECAStage.STAGE_2_FAILURES:
            has_functions = any(r.function_description for r in worksheet.rows)
            if not has_functions:
                return worksheet, "Stage 2 requires at least one function defined (Stage 1)"

        if target_stage == FMECAStage.STAGE_3_EFFECTS:
            has_failures = any(r.failure_mode for r in worksheet.rows)
            if not has_failures:
                return worksheet, "Stage 3 requires at least one failure mode defined (Stage 2)"

        if target_stage == FMECAStage.STAGE_4_DECISIONS:
            has_effects = any(r.failure_effect for r in worksheet.rows)
            if not has_effects:
                return worksheet, "Stage 4 requires at least one failure effect defined (Stage 3)"

        # Mark current stage as complete
        worksheet.stage_completion[worksheet.current_stage.value] = True
        worksheet.current_stage = target_stage
        return worksheet, f"Advanced to {target_stage.value}"

    @staticmethod
    def generate_summary(worksheet: FMECAWorksheet) -> FMECASummary:
        """Generate summary statistics for a worksheet."""
        rows = worksheet.rows
        total = len(rows)

        rpn_dist: dict[str, int] = {c.value: 0 for c in RPNCategory}
        strategy_dist: dict[str, int] = {}
        rpn_values: list[int] = []

        for r in rows:
            rpn_dist[r.rpn_category.value] = rpn_dist.get(r.rpn_category.value, 0) + 1
            rpn_values.append(r.rpn)
            if r.strategy_type:
                strategy_dist[r.strategy_type] = strategy_dist.get(r.strategy_type, 0) + 1

        avg_rpn = round(sum(rpn_values) / len(rpn_values), 1) if rpn_values else 0.0
        high_critical = rpn_dist.get(RPNCategory.HIGH.value, 0) + rpn_dist.get(RPNCategory.CRITICAL.value, 0)

        # Top risks: rows sorted by RPN descending
        sorted_rows = sorted(rows, key=lambda r: r.rpn, reverse=True)
        top_risks = [
            {
                "row_id": r.row_id,
                "failure_mode": r.failure_mode,
                "rpn": r.rpn,
                "category": r.rpn_category.value,
                "strategy": r.strategy_type or "PENDING",
            }
            for r in sorted_rows[:5]
        ]

        recommendations: list[str] = []
        if high_critical > 0:
            recommendations.append(
                f"{high_critical} failure modes have HIGH/CRITICAL RPN — prioritize mitigation"
            )
        critical = rpn_dist.get(RPNCategory.CRITICAL.value, 0)
        if critical > 0:
            recommendations.append(
                f"{critical} CRITICAL RPN items require immediate action"
            )
        if not strategy_dist and total > 0:
            recommendations.append("No strategies assigned yet — run Stage 4 decisions")
        if total == 0:
            recommendations.append("No rows in worksheet — add functions and failure modes")

        return FMECASummary(
            worksheet_id=worksheet.worksheet_id,
            equipment_id=worksheet.equipment_id,
            total_rows=total,
            rpn_distribution=rpn_dist,
            strategy_distribution=strategy_dist,
            top_risks=top_risks,
            avg_rpn=avg_rpn,
            high_critical_count=high_critical,
            recommendations=recommendations,
        )

    @staticmethod
    def complete_worksheet(worksheet: FMECAWorksheet) -> tuple[FMECAWorksheet, str]:
        """Mark worksheet as COMPLETED after validating Stage 4 is done."""
        stage_4_done = worksheet.stage_completion.get(FMECAStage.STAGE_4_DECISIONS.value, False)
        if not stage_4_done:
            return worksheet, "Cannot complete: Stage 4 decisions not yet run"

        has_strategies = any(r.strategy_type for r in worksheet.rows)
        if not has_strategies and worksheet.rows:
            return worksheet, "Cannot complete: no strategies assigned to rows"

        try:
            StateMachine.validate_transition("fmeca_worksheet", worksheet.status.value, "COMPLETED")
        except Exception as e:
            return worksheet, f"Cannot complete: {e}"

        worksheet.status = FMECAWorksheetStatus.COMPLETED
        worksheet.completed_at = datetime.now()

        high_critical = sum(
            1 for r in worksheet.rows
            if r.rpn_category in (RPNCategory.HIGH, RPNCategory.CRITICAL)
        )
        msg = f"Worksheet completed with {len(worksheet.rows)} rows"
        if high_critical > 0:
            msg += f" ({high_critical} HIGH/CRITICAL RPN items)"
        return worksheet, msg

    @staticmethod
    def _categorize_rpn(rpn: int) -> RPNCategory:
        """Categorize RPN value."""
        for cat, (low, high) in RPN_THRESHOLDS.items():
            if low <= rpn <= high:
                return cat
        return RPNCategory.CRITICAL
