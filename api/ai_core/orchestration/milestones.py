"""Milestone gate model for the 4-milestone strategy workflow.

Each milestone has a status that progresses:
    PENDING → IN_PROGRESS → PRESENTED → APPROVED / REJECTED / MODIFIED
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum


class MilestoneStatus(str, Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    PRESENTED = "PRESENTED"
    APPROVED = "APPROVED"
    MODIFIED = "MODIFIED"
    REJECTED = "REJECTED"


MILESTONE_DEFINITIONS = {
    1: {
        "name": "Hierarchy Decomposition",
        "description": "Equipment breakdown (6-level hierarchy) and criticality assessment",
        "agents": ["reliability"],
        "required_entities": ["hierarchy_nodes", "criticality_assessments"],
    },
    2: {
        "name": "FMEA Completion",
        "description": "Failure modes (72-combo validated), RCM decision paths",
        "agents": ["reliability"],
        "required_entities": ["functions", "functional_failures", "failure_modes"],
    },
    3: {
        "name": "Strategy + Tasks + Resources",
        "description": "Maintenance tasks, work packages, materials, work instructions",
        "agents": ["reliability", "planning", "spare_parts"],
        "required_entities": ["maintenance_tasks", "work_packages"],
    },
    4: {
        "name": "SAP Upload Package",
        "description": "SAP Maintenance Item + Task List + Work Plan (DRAFT)",
        "agents": ["planning"],
        "required_entities": ["sap_upload_package"],
    },
}


@dataclass
class ValidationSummary:
    """Summary of validation results at a gate."""

    errors: int = 0
    warnings: int = 0
    info: int = 0
    details: list[dict] = field(default_factory=list)

    @property
    def has_errors(self) -> bool:
        return self.errors > 0

    @property
    def is_clean(self) -> bool:
        return self.errors == 0 and self.warnings == 0


@dataclass
class MilestoneGate:
    """Tracks the status and validation of a single milestone."""

    number: int
    name: str
    description: str
    required_agents: list[str]
    required_entities: list[str]
    status: MilestoneStatus = MilestoneStatus.PENDING
    validation: ValidationSummary | None = None
    human_feedback: str = ""
    started_at: str | None = None
    completed_at: str | None = None

    def start(self) -> None:
        """Mark milestone as in progress."""
        if self.status != MilestoneStatus.PENDING:
            raise ValueError(f"Cannot start milestone {self.number}: status is {self.status}")
        self.status = MilestoneStatus.IN_PROGRESS
        self.started_at = datetime.now().isoformat()

    def present(self, validation: ValidationSummary) -> None:
        """Present results to human. Must be IN_PROGRESS."""
        if self.status != MilestoneStatus.IN_PROGRESS:
            raise ValueError(f"Cannot present milestone {self.number}: status is {self.status}")
        self.validation = validation
        self.status = MilestoneStatus.PRESENTED

    def approve(self, feedback: str = "") -> None:
        """Human approves the milestone."""
        if self.status != MilestoneStatus.PRESENTED:
            raise ValueError(f"Cannot approve milestone {self.number}: status is {self.status}")
        self.human_feedback = feedback
        self.status = MilestoneStatus.APPROVED
        self.completed_at = datetime.now().isoformat()

    def modify(self, feedback: str) -> None:
        """Human requests modifications. Returns to IN_PROGRESS."""
        if self.status != MilestoneStatus.PRESENTED:
            raise ValueError(f"Cannot modify milestone {self.number}: status is {self.status}")
        self.human_feedback = feedback
        self.validation = None
        self.status = MilestoneStatus.IN_PROGRESS

    def reject(self, feedback: str) -> None:
        """Human rejects the milestone. Returns to PENDING."""
        if self.status != MilestoneStatus.PRESENTED:
            raise ValueError(f"Cannot reject milestone {self.number}: status is {self.status}")
        self.human_feedback = feedback
        self.status = MilestoneStatus.REJECTED
        self.validation = None

    @property
    def is_complete(self) -> bool:
        return self.status == MilestoneStatus.APPROVED

    @property
    def can_proceed(self) -> bool:
        return self.status == MilestoneStatus.APPROVED


def create_milestone_gates() -> list[MilestoneGate]:
    """Create the 4 milestone gates from definitions."""
    return [
        MilestoneGate(
            number=num,
            name=defn["name"],
            description=defn["description"],
            required_agents=defn["agents"],
            required_entities=defn["required_entities"],
        )
        for num, defn in MILESTONE_DEFINITIONS.items()
    ]
