"""Execution Checklist Engine — GAP-W06 Closure.

Generates interactive execution checklists from work packages,
enforces "can't proceed until confirmed" gate logic, and tracks
step-by-step completion with condition codes and observations.

Deterministic — no LLM required.
"""

from __future__ import annotations

from datetime import datetime

from tools.models.schemas import (
    ChecklistClosureSummary,
    ChecklistStatus,
    ConditionCode,
    ExecutionChecklist,
    ExecutionStep,
    StepObservation,
    StepStatus,
    StepType,
    TaskConstraint,
    TaskType,
)
from tools.engines.execution_task_engine import (
    LOTO_APPLICATION_CHECKLIST,
    LOTO_REMOVAL_CHECKLIST,
    COMMISSIONING_CHECKLIST,
)


# Gate questions inserted at quality checkpoints
_GATE_QUESTIONS = {
    "safety": "All safety checks confirmed. Proceed to maintenance?",
    "replace": "Component replacement verified and installed correctly?",
    "commissioning": "All maintenance tasks completed. Ready for commissioning?",
    "handover": "Equipment ready for return to operations?",
}


class ExecutionChecklistEngine:
    """Generates and manages execution checklists from work packages."""

    # ------------------------------------------------------------------
    # Generation
    # ------------------------------------------------------------------

    @staticmethod
    def generate_checklist(
        work_package: dict,
        tasks: list[dict],
        equipment_name: str = "",
        equipment_tag: str = "",
        include_safety_gates: bool = True,
        include_commissioning_gate: bool = True,
    ) -> ExecutionChecklist:
        """Convert a WorkPackage + its tasks into an ExecutionChecklist.

        Args:
            work_package: WorkPackage.model_dump() dict.
            tasks: list[MaintenanceTask.model_dump()] — tasks referenced
                   by the work package's allocated_tasks.
            equipment_name: Display name for the equipment.
            equipment_tag: TAG identifier.
            include_safety_gates: Insert safety gate after safety steps.
            include_commissioning_gate: Insert commissioning gate at end.

        Returns:
            ExecutionChecklist ready for field execution.
        """
        constraint = work_package.get("constraint", "ONLINE")
        is_offline = constraint == TaskConstraint.OFFLINE or constraint == "OFFLINE"
        allocated = sorted(
            work_package.get("allocated_tasks", []),
            key=lambda a: a.get("operation_number", 0),
        )

        # Build task lookup
        task_map: dict[str, dict] = {t["task_id"]: t for t in tasks if "task_id" in t}

        steps: list[ExecutionStep] = []
        safety_section: list[str] = []
        group_counter = 0
        last_safety_step_ids: list[str] = []

        # ----- Phase 1: Safety steps (if OFFLINE) -----
        if is_offline:
            group_counter += 1
            safety_section = list(LOTO_APPLICATION_CHECKLIST)
            for i, item in enumerate(LOTO_APPLICATION_CHECKLIST, 1):
                step = ExecutionStep(
                    step_number=f"{group_counter}.{i}",
                    step_type=StepType.SAFETY_CHECK,
                    description=item,
                    is_gate=False,
                )
                steps.append(step)
                last_safety_step_ids.append(step.step_id)

            # Safety quality gate
            if include_safety_gates and steps:
                group_counter += 1
                gate = ExecutionStep(
                    step_number=f"{group_counter}.1",
                    step_type=StepType.QUALITY_GATE,
                    description=_GATE_QUESTIONS["safety"],
                    is_gate=True,
                    gate_question=_GATE_QUESTIONS["safety"],
                    predecessor_step_ids=list(last_safety_step_ids),
                )
                steps.append(gate)
                # All subsequent operation steps depend on this gate
                last_safety_step_ids = [gate.step_id]

        # ----- Phase 2: Task operation steps -----
        for alloc in allocated:
            task_id = alloc.get("task_id", "")
            task_data = task_map.get(task_id, {})
            if not task_data:
                continue

            group_counter += 1
            sub_step = 0
            task_type = task_data.get("task_type", "INSPECT")
            task_name = task_data.get("name", "")
            task_name_fr = task_data.get("name_fr", "")
            acceptable_limits = task_data.get("acceptable_limits", None)
            op_number = alloc.get("operation_number")
            materials = []
            for mr in task_data.get("material_resources", []):
                mat_name = mr.get("material_name", mr.get("name", ""))
                if mat_name:
                    materials.append(mat_name)

            trade = ""
            for lr in task_data.get("labour_resources", []):
                trade = lr.get("specialty", lr.get("trade", ""))
                break

            duration = int(
                task_data.get("frequency_value", 0)
                or task_data.get("access_time_hours", 0)
                or 0
            ) * 60 or 30  # Default 30 min

            # Main operation step
            sub_step += 1
            op_step = ExecutionStep(
                step_number=f"{group_counter}.{sub_step}",
                step_type=StepType.TASK_OPERATION,
                description=task_name,
                description_fr=task_name_fr,
                acceptable_limits=acceptable_limits,
                trade=trade,
                duration_minutes=duration,
                materials=materials,
                source_task_id=task_id,
                source_operation_number=op_number,
                predecessor_step_ids=list(last_safety_step_ids) if last_safety_step_ids else [],
            )
            steps.append(op_step)
            prev_step_id = op_step.step_id

            # Inspection step if acceptable limits
            if acceptable_limits:
                sub_step += 1
                insp_step = ExecutionStep(
                    step_number=f"{group_counter}.{sub_step}",
                    step_type=StepType.INSPECTION,
                    description=f"Verify: {acceptable_limits}",
                    description_fr=f"Vérifier: {acceptable_limits}",
                    acceptable_limits=acceptable_limits,
                    corrective_action=task_data.get("conditional_comments", None),
                    source_task_id=task_id,
                    predecessor_step_ids=[prev_step_id],
                )
                steps.append(insp_step)
                prev_step_id = insp_step.step_id

            # Quality gate after REPLACE tasks
            if task_type in (TaskType.REPLACE, "REPLACE"):
                sub_step += 1
                gate = ExecutionStep(
                    step_number=f"{group_counter}.{sub_step}",
                    step_type=StepType.QUALITY_GATE,
                    description=_GATE_QUESTIONS["replace"],
                    is_gate=True,
                    gate_question=_GATE_QUESTIONS["replace"],
                    source_task_id=task_id,
                    predecessor_step_ids=[prev_step_id],
                )
                steps.append(gate)

        # ----- Phase 3: Commissioning -----
        if include_commissioning_gate and steps:
            # Collect all non-gate terminal step IDs
            terminal_ids = _get_terminal_step_ids(steps)

            group_counter += 1

            # Commissioning gate
            comm_gate = ExecutionStep(
                step_number=f"{group_counter}.1",
                step_type=StepType.QUALITY_GATE,
                description=_GATE_QUESTIONS["commissioning"],
                is_gate=True,
                gate_question=_GATE_QUESTIONS["commissioning"],
                predecessor_step_ids=terminal_ids,
            )
            steps.append(comm_gate)

            # Commissioning steps
            if is_offline:
                for i, item in enumerate(COMMISSIONING_CHECKLIST, 2):
                    comm_step = ExecutionStep(
                        step_number=f"{group_counter}.{i}",
                        step_type=StepType.COMMISSIONING,
                        description=item,
                        predecessor_step_ids=[comm_gate.step_id],
                    )
                    steps.append(comm_step)

            # ----- Phase 4: Handover gate -----
            group_counter += 1
            last_ids = _get_terminal_step_ids(steps)
            handover = ExecutionStep(
                step_number=f"{group_counter}.1",
                step_type=StepType.HANDOVER,
                description=_GATE_QUESTIONS["handover"],
                is_gate=True,
                gate_question=_GATE_QUESTIONS["handover"],
                predecessor_step_ids=last_ids,
            )
            steps.append(handover)

        # Build checklist
        pre_notes = work_package.get("job_preparation", "") or ""
        post_notes = work_package.get("post_shutdown", "") or ""

        return ExecutionChecklist(
            work_package_id=work_package.get("work_package_id", ""),
            work_package_name=work_package.get("name", ""),
            work_package_code=work_package.get("code", ""),
            equipment_tag=equipment_tag,
            equipment_name=equipment_name,
            steps=steps,
            safety_section=safety_section,
            pre_task_notes=pre_notes,
            post_task_notes=post_notes,
        )

    # ------------------------------------------------------------------
    # Gate validation
    # ------------------------------------------------------------------

    @staticmethod
    def validate_step_completion(
        checklist: ExecutionChecklist,
        step_id: str,
    ) -> tuple[bool, str]:
        """Check if a step CAN be completed (gate logic).

        Returns:
            (can_proceed, reason) — True if all predecessors are
            COMPLETED or SKIPPED.
        """
        step_map = {s.step_id: s for s in checklist.steps}
        step = step_map.get(step_id)
        if not step:
            return False, f"Step {step_id} not found"

        if step.status == StepStatus.COMPLETED:
            return False, "Step already completed"

        if step.status == StepStatus.SKIPPED:
            return False, "Step was skipped"

        for pred_id in step.predecessor_step_ids:
            pred = step_map.get(pred_id)
            if not pred:
                continue
            if pred.status not in (StepStatus.COMPLETED, StepStatus.SKIPPED):
                return False, f"Predecessor step '{pred.description}' not yet completed"

        return True, "OK"

    # ------------------------------------------------------------------
    # Step completion
    # ------------------------------------------------------------------

    @staticmethod
    def complete_step(
        checklist: ExecutionChecklist,
        step_id: str,
        observation: dict | None = None,
        completed_by: str = "",
    ) -> ExecutionChecklist:
        """Mark a step as completed with observation data.

        Raises:
            ValueError: If step cannot be completed (gate blocked).
        """
        can_proceed, reason = ExecutionChecklistEngine.validate_step_completion(
            checklist, step_id
        )
        if not can_proceed:
            raise ValueError(reason)

        now = datetime.now()
        for step in checklist.steps:
            if step.step_id == step_id:
                step.status = StepStatus.COMPLETED
                step.completed_at = now
                step.completed_by = completed_by
                if not step.started_at:
                    step.started_at = now
                if observation:
                    step.observation = StepObservation(**observation)
                break

        # Update checklist lifecycle
        if checklist.status == ChecklistStatus.DRAFT:
            checklist.status = ChecklistStatus.IN_PROGRESS
            checklist.started_at = now

        # Check if all steps are done
        all_done = all(
            s.status in (StepStatus.COMPLETED, StepStatus.SKIPPED)
            for s in checklist.steps
        )
        if all_done:
            checklist.status = ChecklistStatus.COMPLETED
            checklist.completed_at = now
            checklist.closure_summary = (
                ExecutionChecklistEngine.generate_closure_summary(checklist)
            )

        return checklist

    # ------------------------------------------------------------------
    # Skip step (supervisor override)
    # ------------------------------------------------------------------

    @staticmethod
    def skip_step(
        checklist: ExecutionChecklist,
        step_id: str,
        reason: str = "",
        authorized_by: str = "",
    ) -> ExecutionChecklist:
        """Skip a non-gate step (supervisor override only).

        Gate steps (is_gate=True) CANNOT be skipped.

        Raises:
            ValueError: If step is a gate or cannot be skipped.
        """
        step_map = {s.step_id: s for s in checklist.steps}
        step = step_map.get(step_id)
        if not step:
            raise ValueError(f"Step {step_id} not found")

        if step.is_gate:
            raise ValueError("Gate steps cannot be skipped")

        if step.status in (StepStatus.COMPLETED, StepStatus.SKIPPED):
            raise ValueError(f"Step already {step.status.value}")

        now = datetime.now()
        step.status = StepStatus.SKIPPED
        step.completed_at = now
        step.completed_by = authorized_by
        step.observation = StepObservation(
            observed_at=now,
            observed_by=authorized_by,
            notes=f"SKIPPED: {reason}",
        )

        # Update checklist lifecycle
        if checklist.status == ChecklistStatus.DRAFT:
            checklist.status = ChecklistStatus.IN_PROGRESS
            checklist.started_at = now

        # Check if all steps are done
        all_done = all(
            s.status in (StepStatus.COMPLETED, StepStatus.SKIPPED)
            for s in checklist.steps
        )
        if all_done:
            checklist.status = ChecklistStatus.COMPLETED
            checklist.completed_at = now
            checklist.closure_summary = (
                ExecutionChecklistEngine.generate_closure_summary(checklist)
            )

        return checklist

    # ------------------------------------------------------------------
    # Next actionable steps
    # ------------------------------------------------------------------

    @staticmethod
    def get_next_actionable_steps(
        checklist: ExecutionChecklist,
    ) -> list[ExecutionStep]:
        """Return all steps that can currently be started."""
        step_map = {s.step_id: s for s in checklist.steps}
        actionable = []

        for step in checklist.steps:
            if step.status != StepStatus.PENDING:
                continue
            # Check all predecessors done
            preds_done = all(
                step_map.get(pid, ExecutionStep()).status
                in (StepStatus.COMPLETED, StepStatus.SKIPPED)
                for pid in step.predecessor_step_ids
            )
            if preds_done:
                actionable.append(step)

        return actionable

    # ------------------------------------------------------------------
    # Closure summary
    # ------------------------------------------------------------------

    @staticmethod
    def generate_closure_summary(
        checklist: ExecutionChecklist,
    ) -> ChecklistClosureSummary:
        """Compute closure summary from all step observations."""
        total = len(checklist.steps)
        completed = sum(
            1 for s in checklist.steps if s.status == StepStatus.COMPLETED
        )
        skipped = sum(
            1 for s in checklist.steps if s.status == StepStatus.SKIPPED
        )
        failed = sum(
            1 for s in checklist.steps if s.status == StepStatus.FAILED
        )

        # Condition code distribution
        cond_dist: dict[str, int] = {}
        defects: list[str] = []
        actual_minutes = 0

        for step in checklist.steps:
            if step.observation:
                code_name = step.observation.condition_code.name
                cond_dist[code_name] = cond_dist.get(code_name, 0) + 1
                if step.observation.defect_created and step.observation.defect_ref:
                    defects.append(step.observation.defect_ref)
            if step.status == StepStatus.COMPLETED:
                actual_minutes += step.duration_minutes

        total_planned = sum(s.duration_minutes for s in checklist.steps)
        pct = round((completed + skipped) / total * 100, 1) if total else 0.0

        return ChecklistClosureSummary(
            total_steps=total,
            completed_steps=completed,
            skipped_steps=skipped,
            failed_steps=failed,
            condition_distribution=cond_dist,
            defects_raised=len(defects),
            defect_refs=defects,
            total_duration_minutes=total_planned,
            actual_duration_minutes=actual_minutes,
            completion_pct=pct,
        )

    # ------------------------------------------------------------------
    # Close checklist (supervisor sign-off)
    # ------------------------------------------------------------------

    @staticmethod
    def close_checklist(
        checklist: ExecutionChecklist,
        supervisor: str,
        supervisor_notes: str = "",
    ) -> ExecutionChecklist:
        """Supervisor closes a completed checklist.

        Raises:
            ValueError: If checklist is not in COMPLETED status.
        """
        if checklist.status != ChecklistStatus.COMPLETED:
            raise ValueError(
                f"Cannot close checklist in {checklist.status.value} status. "
                "All steps must be completed first."
            )

        now = datetime.now()
        checklist.status = ChecklistStatus.CLOSED
        checklist.closed_at = now
        checklist.supervisor = supervisor
        checklist.supervisor_signature = supervisor_notes or f"Closed by {supervisor}"

        # Regenerate closure summary with final data
        checklist.closure_summary = (
            ExecutionChecklistEngine.generate_closure_summary(checklist)
        )

        return checklist


# ------------------------------------------------------------------
# Helper
# ------------------------------------------------------------------


def _get_terminal_step_ids(steps: list[ExecutionStep]) -> list[str]:
    """Return IDs of steps that are not predecessors of any other step."""
    all_ids = {s.step_id for s in steps}
    referenced = set()
    for s in steps:
        for pid in s.predecessor_step_ids:
            referenced.add(pid)
    terminal = all_ids - referenced
    # If none found (circular?), use last step
    if not terminal and steps:
        terminal = {steps[-1].step_id}
    return list(terminal)
