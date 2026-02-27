"""Main workflow engine for the 4-milestone strategy development process.

Coordinates the OrchestratorAgent through 4 milestones with human
approval gates between each. This is the top-level entry point
for running a complete strategy development session.
"""

from __future__ import annotations

import json
import uuid
from typing import Callable

from anthropic import Anthropic

from agents.definitions.orchestrator import create_orchestrator, OrchestratorAgent
from agents.orchestration.session_state import SessionState
from agents.orchestration.milestones import (
    MilestoneGate,
    MilestoneStatus,
    ValidationSummary,
    create_milestone_gates,
)
from agents.tool_wrappers.registry import call_tool


# Type alias for human approval callback
# Receives: milestone number, gate summary text
# Returns: ("approve", feedback) | ("modify", feedback) | ("reject", feedback)
HumanApprovalFn = Callable[[int, str], tuple[str, str]]


def _run_validation(session: SessionState) -> ValidationSummary:
    """Run full validation on accumulated session entities."""
    validation_input = session.get_validation_input()
    if not validation_input:
        return ValidationSummary()

    result_json = call_tool("run_full_validation", {"input_json": json.dumps(validation_input)})
    results = json.loads(result_json)

    errors = sum(1 for r in results if r.get("severity") == "ERROR")
    warnings = sum(1 for r in results if r.get("severity") == "WARNING")
    info = sum(1 for r in results if r.get("severity") == "INFO")

    return ValidationSummary(
        errors=errors,
        warnings=warnings,
        info=info,
        details=results,
    )


def _format_gate_summary(milestone: MilestoneGate, session: SessionState, validation: ValidationSummary) -> str:
    """Format the summary text presented to the human at a gate."""
    counts = session.get_entity_counts()
    lines = [
        f"=== Milestone {milestone.number}: {milestone.name} ===",
        f"Description: {milestone.description}",
        "",
        "Entity counts:",
    ]
    for entity, count in counts.items():
        if isinstance(count, bool):
            lines.append(f"  {entity}: {'Yes' if count else 'No'}")
        elif count > 0:
            lines.append(f"  {entity}: {count}")

    lines.append("")
    lines.append(f"Validation: {validation.errors} errors, {validation.warnings} warnings, {validation.info} info")

    if validation.has_errors:
        lines.append("")
        lines.append("ERRORS (must fix before approval):")
        for detail in validation.details:
            if detail.get("severity") == "ERROR":
                lines.append(f"  - [{detail.get('rule_id', '?')}] {detail.get('message', '?')}")

    if validation.warnings > 0:
        lines.append("")
        lines.append("WARNINGS (review recommended):")
        for detail in validation.details:
            if detail.get("severity") == "WARNING":
                lines.append(f"  - [{detail.get('rule_id', '?')}] {detail.get('message', '?')}")

    lines.append("")
    lines.append("Action: APPROVE / MODIFY / REJECT")
    return "\n".join(lines)


class MaxRetriesExceeded(Exception):
    """Raised when a milestone exceeds max modify retries."""


class StrategyWorkflow:
    """Orchestrates a complete strategy development session.

    Usage:
        def human_gate(milestone_num, summary):
            print(summary)
            action = input("Action [approve/modify/reject]: ")
            feedback = input("Feedback: ")
            return (action, feedback)

        workflow = StrategyWorkflow(human_approval_fn=human_gate)
        result = workflow.run("SAG Mill 001", plant_code="OCP-JFC")
    """

    def __init__(
        self,
        human_approval_fn: HumanApprovalFn,
        client: Anthropic | None = None,
        strict_validation: bool = False,
        max_modify_retries: int = 5,
        checkpoint_dir: str | None = None,
    ):
        self.human_approval_fn = human_approval_fn
        self.orchestrator: OrchestratorAgent = create_orchestrator(client=client)
        self.session = SessionState(session_id=str(uuid.uuid4()))
        self.milestones = create_milestone_gates()
        self.strict_validation = strict_validation
        self.max_modify_retries = max_modify_retries
        self.checkpoint_dir = checkpoint_dir

    def run(self, equipment_description: str, plant_code: str = "OCP") -> SessionState:
        """Run the full 4-milestone workflow.

        Args:
            equipment_description: Equipment to develop strategy for.
            plant_code: SAP plant code.

        Returns:
            Final session state with all accumulated entities.
        """
        self.session.equipment_tag = equipment_description
        self.session.plant_code = plant_code

        for gate in self.milestones:
            self._execute_milestone(gate)

            if gate.status == MilestoneStatus.REJECTED:
                break

        return self.session

    def _execute_milestone(self, gate: MilestoneGate) -> None:
        """Execute a single milestone with agent delegation and human gate.

        Uses an iterative loop instead of recursion for the modify path.
        Raises MaxRetriesExceeded if the human requests too many modifications.
        """
        for _attempt in range(self.max_modify_retries + 1):
            # Only call start() when PENDING (first attempt).
            # After modify(), status is already IN_PROGRESS.
            if gate.status == MilestoneStatus.PENDING:
                gate.start()

            instruction = self._build_milestone_instruction(gate)
            response = self.orchestrator.run(instruction)

            self.session.record_interaction(
                agent_type="orchestrator",
                milestone=gate.number,
                instruction=instruction,
                response_summary=response[:500],
            )

            validation = _run_validation(self.session)
            gate.present(validation)

            summary = _format_gate_summary(gate, self.session, validation)
            action, feedback = self.human_approval_fn(gate.number, summary)

            if action == "approve":
                if self.strict_validation and validation.has_errors:
                    gate.modify("Cannot approve: validation has errors")
                    continue
                gate.approve(feedback)
                if self.checkpoint_dir:
                    from agents.orchestration.checkpoint import save_checkpoint
                    from pathlib import Path
                    save_checkpoint(self.session, gate.number, Path(self.checkpoint_dir))
                return
            elif action == "modify":
                gate.modify(feedback)
                continue
            elif action == "reject":
                gate.reject(feedback)
                return

        raise MaxRetriesExceeded(
            f"Milestone {gate.number} exceeded {self.max_modify_retries} modify attempts"
        )

    def _build_milestone_instruction(self, gate: MilestoneGate) -> str:
        """Build the task instruction for each milestone."""
        context = f"Equipment: {self.session.equipment_tag}\nPlant: {self.session.plant_code}\n"
        counts = self.session.get_entity_counts()

        if gate.human_feedback:
            context += f"\nHuman feedback from previous attempt: {gate.human_feedback}\n"

        instructions = {
            1: (
                f"{context}\n"
                "Milestone 1: Hierarchy Decomposition\n"
                "1. Decompose the equipment into a 6-level hierarchy "
                "(Plant → Area → System → Equipment → SubAssembly → Maintainable Item)\n"
                "2. Assess criticality for each maintainable item using the 11-criteria matrix\n"
                "3. Validate all hierarchy nodes and criticality assessments"
            ),
            2: (
                f"{context}\n"
                f"Existing hierarchy: {counts['hierarchy_nodes']} nodes, "
                f"{counts['criticality_assessments']} criticality assessments\n\n"
                "Milestone 2: FMEA Completion\n"
                "1. Define functions and functional failures for each maintainable item\n"
                "2. Identify failure modes — MUST validate every Mechanism+Cause against the 72-combo table\n"
                "3. Run the RCM decision tree for each failure mode\n"
                "4. Validate all failure modes"
            ),
            3: (
                f"{context}\n"
                f"Existing: {counts['failure_modes']} failure modes\n\n"
                "Milestone 3: Strategy + Tasks + Resources\n"
                "1. Define maintenance tasks with appropriate frequencies for each failure mode\n"
                "2. Group tasks into work packages (by equipment, area, or shutdown opportunity)\n"
                "3. Assign materials to REPLACE tasks (delegate to Spare Parts agent)\n"
                "4. Generate work instructions for each work package\n"
                "5. Validate all tasks, work packages, and work instructions"
            ),
            4: (
                f"{context}\n"
                f"Existing: {counts['work_packages']} work packages, "
                f"{counts['maintenance_tasks']} tasks\n\n"
                "Milestone 4: SAP Upload Package\n"
                "1. Generate the SAP upload package (Maintenance Item + Task List + Work Plan)\n"
                "2. Validate SAP cross-references and field lengths\n"
                "3. Present the DRAFT SAP package for human approval\n"
                "REMINDER: All outputs are DRAFT. NEVER auto-submit to SAP."
            ),
        }

        return instructions.get(gate.number, f"Execute milestone {gate.number}")
