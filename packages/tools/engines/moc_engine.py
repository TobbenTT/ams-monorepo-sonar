"""Management of Change (MoC) Engine — Phase 5 (REF-13 §7.5.8).

Formal process for any modification to assets or processes.
Lifecycle: DRAFT→SUBMITTED→REVIEWING→APPROVED→IMPLEMENTING→CLOSED.

Deterministic — no LLM required.
"""

from datetime import datetime

from tools.engines.state_machine import StateMachine
from tools.models.schemas import (
    MoCRequest, MoCStatus, MoCCategory, RiskLevel,
    MoCReviewResult,
)


class MoCEngine:
    """Manages Management of Change workflow."""

    @staticmethod
    def create_moc(
        plant_id: str,
        title: str,
        description: str,
        category: MoCCategory,
        requester_id: str,
        affected_equipment: list[str] | None = None,
        affected_procedures: list[str] | None = None,
        risk_level: RiskLevel = RiskLevel.LOW,
    ) -> MoCRequest:
        """Create a DRAFT MoC request."""
        return MoCRequest(
            plant_id=plant_id,
            title=title,
            description=description,
            category=category,
            requester_id=requester_id,
            affected_equipment=affected_equipment or [],
            affected_procedures=affected_procedures or [],
            risk_level=risk_level,
        )

    @staticmethod
    def submit_moc(moc: MoCRequest) -> tuple[MoCRequest, str]:
        """DRAFT → SUBMITTED."""
        try:
            StateMachine.validate_transition("moc", moc.status.value, "SUBMITTED")
        except Exception as e:
            return moc, f"Cannot submit: {e}"

        moc.status = MoCStatus.SUBMITTED
        moc.submitted_at = datetime.now()
        return moc, "MoC submitted for review"

    @staticmethod
    def start_review(moc: MoCRequest, reviewer_id: str) -> tuple[MoCRequest, str]:
        """SUBMITTED → REVIEWING."""
        try:
            StateMachine.validate_transition("moc", moc.status.value, "REVIEWING")
        except Exception as e:
            return moc, f"Cannot start review: {e}"

        moc.status = MoCStatus.REVIEWING
        moc.reviewer_id = reviewer_id
        return moc, f"Review started by {reviewer_id}"

    @staticmethod
    def approve_moc(moc: MoCRequest, approver_id: str) -> tuple[MoCRequest, str]:
        """REVIEWING → APPROVED."""
        try:
            StateMachine.validate_transition("moc", moc.status.value, "APPROVED")
        except Exception as e:
            return moc, f"Cannot approve: {e}"

        moc.status = MoCStatus.APPROVED
        moc.approver_id = approver_id
        moc.approved_at = datetime.now()
        return moc, f"MoC approved by {approver_id}"

    @staticmethod
    def reject_moc(moc: MoCRequest, reason: str) -> tuple[MoCRequest, str]:
        """REVIEWING → REJECTED."""
        try:
            StateMachine.validate_transition("moc", moc.status.value, "REJECTED")
        except Exception as e:
            return moc, f"Cannot reject: {e}"

        moc.status = MoCStatus.REJECTED
        moc.risk_assessment = reason
        return moc, f"MoC rejected: {reason}"

    @staticmethod
    def resubmit_moc(moc: MoCRequest) -> tuple[MoCRequest, str]:
        """REJECTED → DRAFT (for rework)."""
        try:
            StateMachine.validate_transition("moc", moc.status.value, "DRAFT")
        except Exception as e:
            return moc, f"Cannot resubmit: {e}"

        moc.status = MoCStatus.DRAFT
        return moc, "MoC returned to draft for rework"

    @staticmethod
    def start_implementation(moc: MoCRequest) -> tuple[MoCRequest, str]:
        """APPROVED → IMPLEMENTING."""
        try:
            StateMachine.validate_transition("moc", moc.status.value, "IMPLEMENTING")
        except Exception as e:
            return moc, f"Cannot start implementation: {e}"

        moc.status = MoCStatus.IMPLEMENTING
        return moc, "MoC implementation started"

    @staticmethod
    def close_moc(moc: MoCRequest) -> tuple[MoCRequest, str]:
        """IMPLEMENTING → CLOSED."""
        try:
            StateMachine.validate_transition("moc", moc.status.value, "CLOSED")
        except Exception as e:
            return moc, f"Cannot close: {e}"

        moc.status = MoCStatus.CLOSED
        moc.closed_at = datetime.now()
        return moc, "MoC closed"

    @staticmethod
    def assess_risk(
        moc: MoCRequest,
        impact_analysis: str,
    ) -> MoCReviewResult:
        """Evaluate risk based on category, affected equipment, and impact."""
        risk_acceptable = True
        conditions: list[str] = []

        num_affected = len(moc.affected_equipment)
        if num_affected > 5:
            conditions.append(f"High impact: {num_affected} equipment affected")
        if moc.risk_level in (RiskLevel.HIGH, RiskLevel.CRITICAL):
            conditions.append(f"Risk level is {moc.risk_level.value}")
            risk_acceptable = moc.risk_level != RiskLevel.CRITICAL

        if moc.category == MoCCategory.EQUIPMENT_MODIFICATION:
            conditions.append("Requires engineering review before implementation")
        if moc.category == MoCCategory.PROCESS_CHANGE:
            conditions.append("Requires HSE review")

        recommendation = "Approve" if risk_acceptable else "Reject — risk too high"
        if conditions and risk_acceptable:
            recommendation = "Approve with conditions"

        moc.impact_analysis = impact_analysis

        return MoCReviewResult(
            moc_id=moc.moc_id,
            reviewer_id=moc.reviewer_id,
            recommendation=recommendation,
            risk_acceptable=risk_acceptable,
            conditions=conditions,
        )
