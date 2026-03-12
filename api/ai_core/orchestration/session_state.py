"""Session state for a strategy development session.

Accumulates entities across milestones so each milestone builds on the
previous one's approved output.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field, asdict
from datetime import datetime
from typing import Any


@dataclass
class SessionState:
    """Accumulator for all entities produced during a strategy session.

    Each milestone appends to these lists. The Orchestrator reads them
    to provide context to specialist agents and to run validation.
    """

    session_id: str = ""
    equipment_tag: str = ""
    plant_code: str = ""
    started_at: str = field(default_factory=lambda: datetime.now().isoformat())

    # Milestone 1 outputs
    hierarchy_nodes: list[dict] = field(default_factory=list)
    criticality_assessments: list[dict] = field(default_factory=list)

    # Milestone 2 outputs
    functions: list[dict] = field(default_factory=list)
    functional_failures: list[dict] = field(default_factory=list)
    failure_modes: list[dict] = field(default_factory=list)

    # Milestone 3 outputs
    maintenance_tasks: list[dict] = field(default_factory=list)
    work_packages: list[dict] = field(default_factory=list)
    work_instructions: list[dict] = field(default_factory=list)
    material_assignments: list[dict] = field(default_factory=list)

    # Milestone 4 outputs
    sap_upload_package: dict | None = None

    # Audit trail
    agent_interactions: list[dict] = field(default_factory=list)

    def record_interaction(self, agent_type: str, milestone: int, instruction: str, response_summary: str) -> None:
        """Record an agent interaction for audit trail."""
        self.agent_interactions.append({
            "timestamp": datetime.now().isoformat(),
            "agent_type": agent_type,
            "milestone": milestone,
            "instruction": instruction[:200],
            "response_summary": response_summary[:500],
        })

    def get_entity_counts(self) -> dict[str, int]:
        """Return counts of all accumulated entities."""
        return {
            "hierarchy_nodes": len(self.hierarchy_nodes),
            "criticality_assessments": len(self.criticality_assessments),
            "functions": len(self.functions),
            "functional_failures": len(self.functional_failures),
            "failure_modes": len(self.failure_modes),
            "maintenance_tasks": len(self.maintenance_tasks),
            "work_packages": len(self.work_packages),
            "work_instructions": len(self.work_instructions),
            "material_assignments": len(self.material_assignments),
            "sap_upload_generated": self.sap_upload_package is not None,
        }

    def to_json(self) -> str:
        """Serialize session state to JSON."""
        return json.dumps(asdict(self), indent=2, default=str)

    @classmethod
    def from_json(cls, json_str: str) -> SessionState:
        """Deserialize session state from JSON."""
        data = json.loads(json_str)
        return cls(**data)

    def get_validation_input(self) -> dict[str, Any]:
        """Build the input dict for run_full_validation."""
        result: dict[str, Any] = {}
        if self.hierarchy_nodes:
            result["nodes"] = self.hierarchy_nodes
        if self.functions:
            result["functions"] = self.functions
        if self.functional_failures:
            result["functional_failures"] = self.functional_failures
        if self.criticality_assessments:
            result["criticality_assessments"] = self.criticality_assessments
        if self.failure_modes:
            result["failure_modes"] = self.failure_modes
        if self.maintenance_tasks:
            result["tasks"] = self.maintenance_tasks
        if self.work_packages:
            result["work_packages"] = self.work_packages
        return result
