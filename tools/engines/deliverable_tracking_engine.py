"""Deliverable Tracking Engine — GAP-W10.

Stateless engine for deliverable lifecycle management, time variance
calculation, and execution plan synchronization.
"""

from __future__ import annotations

from tools.models.schemas import (
    DeliverableCategory,
    DeliverableStatus,
    DeliverableTrackingSummary,
)

# ---------------------------------------------------------------------------
# State machine
# ---------------------------------------------------------------------------

VALID_TRANSITIONS: dict[DeliverableStatus, list[DeliverableStatus]] = {
    DeliverableStatus.DRAFT: [DeliverableStatus.IN_PROGRESS],
    DeliverableStatus.IN_PROGRESS: [DeliverableStatus.SUBMITTED],
    DeliverableStatus.SUBMITTED: [DeliverableStatus.UNDER_REVIEW],
    DeliverableStatus.UNDER_REVIEW: [
        DeliverableStatus.APPROVED,
        DeliverableStatus.REJECTED,
    ],
    DeliverableStatus.REJECTED: [DeliverableStatus.IN_PROGRESS],
    DeliverableStatus.APPROVED: [],  # terminal
}

# ---------------------------------------------------------------------------
# Execution-plan stage → deliverable category mapping
# ---------------------------------------------------------------------------

STAGE_TO_CATEGORY: dict[str, DeliverableCategory] = {
    "hierarchy": DeliverableCategory.HIERARCHY,
    "criticality": DeliverableCategory.CRITICALITY,
    "fmeca": DeliverableCategory.FMECA,
    "rcm": DeliverableCategory.RCM_DECISIONS,
    "tasks": DeliverableCategory.TASKS,
    "work-packages": DeliverableCategory.WORK_PACKAGES,
    "work-instructions": DeliverableCategory.WORK_INSTRUCTIONS,
    "materials": DeliverableCategory.MATERIALS,
    "sap": DeliverableCategory.SAP_UPLOAD,
    "quality": DeliverableCategory.QUALITY_REPORT,
    "validation": DeliverableCategory.VALIDATION_REPORT,
}

# ---------------------------------------------------------------------------
# Default estimated hours per category (consulting benchmarks)
# ---------------------------------------------------------------------------

DEFAULT_HOURS: dict[DeliverableCategory, float] = {
    DeliverableCategory.HIERARCHY: 2.0,
    DeliverableCategory.CRITICALITY: 3.0,
    DeliverableCategory.FMECA: 8.0,
    DeliverableCategory.RCM_DECISIONS: 4.0,
    DeliverableCategory.TASKS: 6.0,
    DeliverableCategory.WORK_PACKAGES: 4.0,
    DeliverableCategory.WORK_INSTRUCTIONS: 3.0,
    DeliverableCategory.MATERIALS: 2.0,
    DeliverableCategory.SAP_UPLOAD: 2.0,
    DeliverableCategory.QUALITY_REPORT: 1.0,
    DeliverableCategory.VALIDATION_REPORT: 1.0,
    DeliverableCategory.CUSTOM: 4.0,
}


class DeliverableTrackingEngine:
    """Stateless engine for deliverable lifecycle operations."""

    # -- Status transitions -------------------------------------------------

    @staticmethod
    def validate_transition(
        current: DeliverableStatus, target: DeliverableStatus
    ) -> bool:
        """Check whether *current → target* is a valid status transition."""
        return target in VALID_TRANSITIONS.get(current, [])

    @staticmethod
    def transition(
        current: DeliverableStatus, target: DeliverableStatus
    ) -> DeliverableStatus:
        """Perform a status transition, raising on invalid moves."""
        if not DeliverableTrackingEngine.validate_transition(current, target):
            valid = [s.value for s in VALID_TRANSITIONS.get(current, [])]
            raise ValueError(
                f"Invalid transition: {current.value} -> {target.value}. "
                f"Valid targets: {valid}"
            )
        return target

    # -- Variance calculation -----------------------------------------------

    @staticmethod
    def calculate_variance(
        estimated_hours: float, actual_hours: float
    ) -> dict:
        """Return effort variance analysis."""
        variance = actual_hours - estimated_hours
        variance_pct = (
            round(variance / estimated_hours * 100, 1)
            if estimated_hours > 0
            else 0.0
        )
        return {
            "estimated_hours": estimated_hours,
            "actual_hours": actual_hours,
            "variance_hours": round(variance, 2),
            "variance_pct": variance_pct,
            "on_track": variance_pct <= 10.0,
        }

    # -- Summary aggregation ------------------------------------------------

    @staticmethod
    def build_summary(deliverables: list[dict]) -> DeliverableTrackingSummary:
        """Build aggregate tracking summary from deliverable dicts."""
        by_status: dict[str, int] = {}
        by_milestone: dict[int, int] = {}
        total_est = 0.0
        total_act = 0.0
        completed = 0

        for d in deliverables:
            status = d.get("status", "DRAFT")
            milestone = d.get("milestone", 0)
            by_status[status] = by_status.get(status, 0) + 1
            by_milestone[milestone] = by_milestone.get(milestone, 0) + 1
            total_est += d.get("estimated_hours", 0)
            total_act += d.get("actual_hours", 0)
            if status == DeliverableStatus.APPROVED.value:
                completed += 1

        total = len(deliverables)
        variance = total_act - total_est
        variance_pct = (
            round(variance / total_est * 100, 1) if total_est > 0 else 0.0
        )
        completion_pct = round(completed / total * 100, 1) if total else 0.0

        return DeliverableTrackingSummary(
            total_deliverables=total,
            by_status=by_status,
            by_milestone=by_milestone,
            total_estimated_hours=round(total_est, 2),
            total_actual_hours=round(total_act, 2),
            variance_hours=round(variance, 2),
            variance_pct=variance_pct,
            overall_completion_pct=completion_pct,
        )

    # -- Seed from execution plan -------------------------------------------

    @staticmethod
    def seed_from_execution_plan(
        plan_dict: dict,
        client_slug: str = "",
        project_slug: str = "",
    ) -> list[dict]:
        """Generate deliverable dicts from an ExecutionPlan's stages."""
        deliverables: list[dict] = []
        for stage in plan_dict.get("stages", []):
            stage_name = stage.get("name", "").lower().replace(" ", "-")
            # Try exact match first, then prefix match
            category = STAGE_TO_CATEGORY.get(stage_name)
            if category is None:
                for key, cat in STAGE_TO_CATEGORY.items():
                    if key in stage_name:
                        category = cat
                        break
            if category is None:
                category = DeliverableCategory.CUSTOM

            milestone = stage.get("milestone", 1)

            deliverables.append(
                {
                    "name": stage.get("name", f"Stage {stage.get('id', '?')}"),
                    "name_fr": "",
                    "category": category.value,
                    "milestone": milestone,
                    "status": DeliverableStatus.DRAFT.value,
                    "execution_plan_stage_id": stage.get("id", ""),
                    "estimated_hours": DEFAULT_HOURS.get(category, 4.0),
                    "actual_hours": 0.0,
                    "artifact_paths": [],
                    "client_slug": client_slug,
                    "project_slug": project_slug,
                    "assigned_agent": "",
                }
            )
        return deliverables
