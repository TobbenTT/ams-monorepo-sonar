"""Competency-Based Work Assignment Engine (GAP-W09).

Matches technicians to maintenance tasks based on a 5-dimension scoring
algorithm. Supports initial optimization and re-optimization when workers
are absent (the "15 planned, 12 showed up" scenario).

Algorithm: Greedy assignment — highest-priority tasks first, best-match
technician. Adequate for crew sizes of 12-20 per shift.
"""

from __future__ import annotations

from datetime import date
from typing import Optional

from tools.models.schemas import (
    AssignmentStatus,
    AssignmentSummary,
    CompetencyLevel,
    LabourSpecialty,
    TaskCompetencyRequirement,
    TechnicianProfile,
    WorkAssignment,
)

# ── Scoring weights (total = 100) ────────────────────────────────────

WEIGHT_SPECIALTY = 30
WEIGHT_COMPETENCY = 25
WEIGHT_EQUIPMENT = 20
WEIGHT_CERTIFICATION = 15
WEIGHT_AVAILABILITY = 10

# Competency-level score lookup: (min_level, actual_level) → points
_COMPETENCY_SCORES: dict[tuple[CompetencyLevel, CompetencyLevel], int] = {
    # min_level A
    (CompetencyLevel.A, CompetencyLevel.A): WEIGHT_COMPETENCY,
    (CompetencyLevel.A, CompetencyLevel.B): 0,
    (CompetencyLevel.A, CompetencyLevel.C): 0,
    # min_level B
    (CompetencyLevel.B, CompetencyLevel.A): WEIGHT_COMPETENCY,
    (CompetencyLevel.B, CompetencyLevel.B): int(WEIGHT_COMPETENCY * 0.6),
    (CompetencyLevel.B, CompetencyLevel.C): 0,
    # min_level C
    (CompetencyLevel.C, CompetencyLevel.A): WEIGHT_COMPETENCY,
    (CompetencyLevel.C, CompetencyLevel.B): int(WEIGHT_COMPETENCY * 0.8),
    (CompetencyLevel.C, CompetencyLevel.C): int(WEIGHT_COMPETENCY * 0.4),
}

# Priority order for CompetencyLevel (A > B > C)
_LEVEL_RANK: dict[CompetencyLevel, int] = {
    CompetencyLevel.A: 3,
    CompetencyLevel.B: 2,
    CompetencyLevel.C: 1,
}


class AssignmentEngine:
    """Optimizes technician-to-task assignments for a shift."""

    # ── Public API ────────────────────────────────────────────────────

    def score_match(
        self,
        technician: TechnicianProfile,
        requirement: TaskCompetencyRequirement,
        assigned_hours: float = 0.0,
        shift_hours: float = 8.0,
    ) -> tuple[float, list[str]]:
        """Score how well a technician matches a task requirement (0-100).

        Returns:
            (score, reasons) tuple.
        """
        score = 0.0
        reasons: list[str] = []

        # 1. Specialty match (30 pts)
        if technician.specialty == requirement.specialty:
            score += WEIGHT_SPECIALTY
            reasons.append(f"Specialty match: {requirement.specialty.value}")
        else:
            reasons.append(f"Specialty mismatch: has {technician.specialty.value}, needs {requirement.specialty.value}")

        # 2. Competency level (25 pts)
        best_level = self._best_competency_level(
            technician, requirement.specialty, requirement.equipment_type
        )
        comp_score = _COMPETENCY_SCORES.get(
            (requirement.min_level, best_level), 0
        )
        score += comp_score
        if comp_score > 0:
            reasons.append(f"Competency {best_level.value} meets min {requirement.min_level.value}")
        else:
            reasons.append(f"Under-qualified: {best_level.value} < min {requirement.min_level.value}")

        # 3. Equipment expertise (20 pts)
        if requirement.equipment_type:
            if requirement.equipment_type in technician.equipment_expertise:
                score += WEIGHT_EQUIPMENT
                reasons.append(f"Equipment expertise: {requirement.equipment_type}")
            else:
                # Partial credit if they have competency record for the equipment
                has_comp = any(
                    c.equipment_type == requirement.equipment_type
                    for c in technician.competencies
                )
                if has_comp:
                    score += WEIGHT_EQUIPMENT * 0.5
                    reasons.append(f"Has competency record for {requirement.equipment_type}")
                else:
                    reasons.append(f"No expertise on {requirement.equipment_type}")
        else:
            # No specific equipment required — full points
            score += WEIGHT_EQUIPMENT
            reasons.append("No specific equipment expertise required")

        # 4. Certification (15 pts)
        if requirement.requires_certification:
            if technician.certifications:
                score += WEIGHT_CERTIFICATION
                reasons.append("Has required certifications")
            else:
                reasons.append("Missing certifications")
        else:
            score += WEIGHT_CERTIFICATION
            reasons.append("No certification required")

        # 5. Availability (10 pts)
        remaining = shift_hours - assigned_hours
        if remaining >= shift_hours * 0.5:
            score += WEIGHT_AVAILABILITY
            reasons.append(f"Available: {remaining:.1f}h remaining")
        elif remaining > 0:
            score += WEIGHT_AVAILABILITY * 0.5
            reasons.append(f"Partially available: {remaining:.1f}h remaining")
        else:
            reasons.append("Fully booked this shift")

        return round(score, 1), reasons

    def optimize_assignments(
        self,
        tasks: list[dict],
        technicians: list[TechnicianProfile],
        target_date: date,
        target_shift: str,
        plant_id: str,
        shift_hours: float = 8.0,
    ) -> AssignmentSummary:
        """Generate optimized assignments for a set of tasks.

        Args:
            tasks: List of dicts with keys: task_id, work_package_id, name,
                   competency_requirements (list[TaskCompetencyRequirement]),
                   estimated_hours, priority (optional, higher = more urgent).
            technicians: Available technician profiles for the shift.
            target_date: Scheduled date.
            target_shift: Shift name (MORNING, AFTERNOON, NIGHT).
            plant_id: Plant identifier.
            shift_hours: Hours per shift (default 8).

        Returns:
            AssignmentSummary with assignments and diagnostics.
        """
        available = [t for t in technicians if t.available and t.shift == target_shift]
        absent_count = len(technicians) - len(available)

        # Track hours assigned to each technician
        hours_used: dict[str, float] = {t.worker_id: 0.0 for t in available}

        # Sort tasks by priority (higher first), then by competency requirement
        sorted_tasks = sorted(
            tasks,
            key=lambda t: (
                -t.get("priority", 3),
                -_LEVEL_RANK.get(
                    self._get_task_min_level(t), CompetencyLevel.B
                ),
            ),
        )

        assignments: list[WorkAssignment] = []
        unassigned: list[str] = []
        warnings: list[str] = []

        for task in sorted_tasks:
            task_id = task.get("task_id", "")
            wp_id = task.get("work_package_id", "")
            task_name = task.get("name", "Unknown")
            est_hours = task.get("estimated_hours", 2.0)
            requirements = self._parse_requirements(task)

            if not requirements:
                # No competency requirements — assign to anyone available
                requirements = [TaskCompetencyRequirement(
                    specialty=LabourSpecialty.FITTER,
                    min_level=CompetencyLevel.C,
                )]

            best_assignment: Optional[WorkAssignment] = None
            best_score = -1.0

            for req in requirements:
                for tech in available:
                    if hours_used.get(tech.worker_id, 0) + est_hours > shift_hours:
                        continue

                    score, reasons = self.score_match(
                        tech, req, hours_used.get(tech.worker_id, 0), shift_hours
                    )

                    if score > best_score:
                        best_score = score
                        is_underqualified = (
                            _LEVEL_RANK.get(
                                self._best_competency_level(tech, req.specialty, req.equipment_type),
                                0,
                            )
                            < _LEVEL_RANK.get(req.min_level, 0)
                        )
                        best_assignment = WorkAssignment(
                            work_package_id=wp_id,
                            task_id=task_id,
                            worker_id=tech.worker_id,
                            worker_name=tech.name,
                            specialty=tech.specialty,
                            competency_level=self._best_competency_level(
                                tech, req.specialty, req.equipment_type
                            ),
                            scheduled_date=target_date,
                            scheduled_shift=target_shift,
                            estimated_hours=est_hours,
                            match_score=score,
                            match_reasons=reasons,
                            status=AssignmentStatus.SUGGESTED,
                        )
                        if is_underqualified:
                            best_assignment.match_reasons.append(
                                "WARNING: Under-qualified — supervision required"
                            )

            if best_assignment and best_score > 0:
                hours_used[best_assignment.worker_id] = (
                    hours_used.get(best_assignment.worker_id, 0)
                    + est_hours
                )
                assignments.append(best_assignment)
                if best_score < 60:
                    warnings.append(
                        f"Low match ({best_score:.0f}%) for '{task_name}' → {best_assignment.worker_name}"
                    )
                if "Under-qualified" in str(best_assignment.match_reasons):
                    warnings.append(
                        f"Under-qualified assignment: '{task_name}' → {best_assignment.worker_name}"
                    )
            else:
                unassigned.append(task_id)
                reason = self._diagnose_unassigned(task, requirements, available, hours_used, shift_hours)
                warnings.append(f"Unassigned: '{task_name}' — {reason}")

        # Compute utilization
        total_assigned_hours = sum(a.estimated_hours for a in assignments)
        total_capacity = len(available) * shift_hours
        utilization = (total_assigned_hours / total_capacity * 100) if total_capacity > 0 else 0.0

        return AssignmentSummary(
            date=target_date,
            shift=target_shift,
            plant_id=plant_id,
            total_technicians=len(technicians),
            available_technicians=len(available),
            absent_technicians=absent_count,
            total_tasks=len(tasks),
            assigned_tasks=len(assignments),
            unassigned_tasks=len(unassigned),
            underqualified_assignments=sum(
                1 for a in assignments
                if any("Under-qualified" in r for r in a.match_reasons)
            ),
            crew_utilization_pct=round(utilization, 1),
            assignments=assignments,
            unassigned_task_ids=unassigned,
            warnings=warnings,
        )

    def reoptimize_with_absences(
        self,
        existing_assignments: list[WorkAssignment],
        absent_worker_ids: list[str],
        all_technicians: list[TechnicianProfile],
        tasks: list[dict],
        target_date: date,
        target_shift: str,
        plant_id: str,
        shift_hours: float = 8.0,
    ) -> AssignmentSummary:
        """Re-optimize when workers are absent.

        Keeps assignments for present workers, reassigns affected tasks.
        """
        # Separate kept vs affected assignments
        kept = [a for a in existing_assignments if a.worker_id not in absent_worker_ids]
        affected_task_ids = {
            a.task_id or a.work_package_id
            for a in existing_assignments
            if a.worker_id in absent_worker_ids
        }

        # Build available technician list (exclude absent)
        available_techs = [
            t for t in all_technicians
            if t.worker_id not in absent_worker_ids
        ]

        # Track hours already assigned to kept workers
        hours_used: dict[str, float] = {}
        for a in kept:
            hours_used[a.worker_id] = hours_used.get(a.worker_id, 0) + a.estimated_hours

        # Find tasks that need reassignment
        tasks_to_reassign = [
            t for t in tasks
            if t.get("task_id", t.get("work_package_id", "")) in affected_task_ids
        ]

        # Re-optimize only the affected tasks
        if tasks_to_reassign:
            partial = self.optimize_assignments(
                tasks_to_reassign, available_techs, target_date, target_shift,
                plant_id, shift_hours,
            )
            new_assignments = kept + partial.assignments
            unassigned = partial.unassigned_task_ids
            warnings = [f"Re-optimized: {len(absent_worker_ids)} absent worker(s)"]
            warnings.extend(partial.warnings)
        else:
            new_assignments = kept
            unassigned = []
            warnings = [f"Re-optimized: {len(absent_worker_ids)} absent worker(s), no tasks affected"]

        total_assigned_hours = sum(a.estimated_hours for a in new_assignments)
        total_capacity = len(available_techs) * shift_hours
        utilization = (total_assigned_hours / total_capacity * 100) if total_capacity > 0 else 0.0

        return AssignmentSummary(
            date=target_date,
            shift=target_shift,
            plant_id=plant_id,
            total_technicians=len(all_technicians),
            available_technicians=len(available_techs),
            absent_technicians=len(absent_worker_ids),
            total_tasks=len(tasks),
            assigned_tasks=len(new_assignments),
            unassigned_tasks=len(unassigned),
            underqualified_assignments=sum(
                1 for a in new_assignments
                if any("Under-qualified" in r for r in a.match_reasons)
            ),
            crew_utilization_pct=round(utilization, 1),
            assignments=new_assignments,
            unassigned_task_ids=unassigned,
            warnings=warnings,
        )

    def generate_assignment_summary(
        self,
        summary: AssignmentSummary,
    ) -> dict:
        """Generate a supervisor-friendly summary dict from an AssignmentSummary.

        Returns:
            Dict with per-technician breakdown, unassigned tasks, and warnings.
        """
        by_technician: dict[str, dict] = {}
        for a in summary.assignments:
            key = a.worker_id
            if key not in by_technician:
                by_technician[key] = {
                    "worker_id": a.worker_id,
                    "worker_name": a.worker_name,
                    "specialty": a.specialty.value,
                    "competency_level": a.competency_level.value,
                    "tasks": [],
                    "total_hours": 0.0,
                }
            by_technician[key]["tasks"].append({
                "task_id": a.task_id,
                "work_package_id": a.work_package_id,
                "match_score": a.match_score,
                "estimated_hours": a.estimated_hours,
                "status": a.status.value,
            })
            by_technician[key]["total_hours"] += a.estimated_hours

        return {
            "date": summary.date.isoformat(),
            "shift": summary.shift,
            "plant_id": summary.plant_id,
            "crew": {
                "total": summary.total_technicians,
                "available": summary.available_technicians,
                "absent": summary.absent_technicians,
            },
            "tasks": {
                "total": summary.total_tasks,
                "assigned": summary.assigned_tasks,
                "unassigned": summary.unassigned_tasks,
            },
            "crew_utilization_pct": summary.crew_utilization_pct,
            "technician_assignments": list(by_technician.values()),
            "unassigned_task_ids": summary.unassigned_task_ids,
            "underqualified_count": summary.underqualified_assignments,
            "warnings": summary.warnings,
        }

    # ── Internal helpers ──────────────────────────────────────────────

    def _best_competency_level(
        self,
        technician: TechnicianProfile,
        specialty: LabourSpecialty,
        equipment_type: Optional[str] = None,
    ) -> CompetencyLevel:
        """Find the best competency level a technician holds for a specialty+equipment."""
        best = CompetencyLevel.C  # Default if no matching competency found

        for comp in technician.competencies:
            if comp.specialty != specialty:
                continue
            if equipment_type and comp.equipment_type != equipment_type:
                continue
            if _LEVEL_RANK.get(comp.level, 0) > _LEVEL_RANK.get(best, 0):
                best = comp.level

        return best

    def _get_task_min_level(self, task: dict) -> CompetencyLevel:
        """Extract highest min_level from a task's competency requirements."""
        requirements = self._parse_requirements(task)
        if not requirements:
            return CompetencyLevel.B
        return max(requirements, key=lambda r: _LEVEL_RANK.get(r.min_level, 0)).min_level

    def _parse_requirements(self, task: dict) -> list[TaskCompetencyRequirement]:
        """Parse competency requirements from task dict."""
        raw = task.get("competency_requirements", [])
        result = []
        for item in raw:
            if isinstance(item, TaskCompetencyRequirement):
                result.append(item)
            elif isinstance(item, dict):
                result.append(TaskCompetencyRequirement(**item))
        return result

    def _diagnose_unassigned(
        self,
        task: dict,
        requirements: list[TaskCompetencyRequirement],
        available: list[TechnicianProfile],
        hours_used: dict[str, float],
        shift_hours: float,
    ) -> str:
        """Diagnose why a task couldn't be assigned."""
        if not available:
            return "No technicians available"

        specialties_needed = {r.specialty for r in requirements}
        specialties_available = {t.specialty for t in available}
        missing = specialties_needed - specialties_available
        if missing:
            return f"No {', '.join(s.value for s in missing)} specialist available"

        # Check if all matching technicians are fully booked
        est_hours = task.get("estimated_hours", 2.0)
        for req in requirements:
            for tech in available:
                if tech.specialty == req.specialty:
                    if hours_used.get(tech.worker_id, 0) + est_hours <= shift_hours:
                        return "All matching technicians scored 0 (competency/cert mismatch)"
        return "All matching technicians fully booked"
