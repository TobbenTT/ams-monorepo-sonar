"""Execution Plan model for tracking strategy development progress.

Provides a structured checklist of stages and items, with dependency
tracking, progress calculation, and YAML serialization to
``2-state/execution-plan.yaml``.

Design decisions:
- Status values are enums (PlanStatus) — no magic strings.
- ExecutionPlan lives in its own module (not in session_state.py).
- Circular dependencies are detected and rejected at build time.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------


class PlanStatus(str, Enum):
    """Status of an execution plan item or stage."""

    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    SKIPPED = "skipped"


class StrategyApproach(str, Enum):
    """High-level approach determined by the wizard."""

    FULL_RCM = "full-rcm"
    FMECA_SIMPLIFIED = "fmeca-simplified"
    PM_OPTIMIZATION = "pm-optimization"


# ---------------------------------------------------------------------------
# ExecutionPlanItem
# ---------------------------------------------------------------------------


@dataclass
class ExecutionPlanItem:
    """Single actionable item within a stage (a checkbox)."""

    id: str
    description: str
    status: PlanStatus = PlanStatus.PENDING
    depends_on: list[str] = field(default_factory=list)
    equipment_tag: str = ""
    criticality_class: str = ""
    started_at: str | None = None
    completed_at: str | None = None

    # -- helpers -----------------------------------------------------------

    def mark_in_progress(self) -> None:
        self.status = PlanStatus.IN_PROGRESS
        self.started_at = self.started_at or datetime.now().isoformat()

    def mark_completed(self) -> None:
        self.status = PlanStatus.COMPLETED
        self.completed_at = datetime.now().isoformat()

    def mark_skipped(self) -> None:
        self.status = PlanStatus.SKIPPED

    def to_dict(self) -> dict[str, Any]:
        d: dict[str, Any] = {
            "id": self.id,
            "description": self.description,
            "status": self.status.value,
        }
        if self.depends_on:
            d["depends_on"] = self.depends_on
        if self.equipment_tag:
            d["equipment_tag"] = self.equipment_tag
        if self.criticality_class:
            d["criticality_class"] = self.criticality_class
        if self.started_at:
            d["started_at"] = self.started_at
        if self.completed_at:
            d["completed_at"] = self.completed_at
        return d

    @classmethod
    def from_dict(cls, d: dict[str, Any]) -> ExecutionPlanItem:
        return cls(
            id=d["id"],
            description=d["description"],
            status=PlanStatus(d.get("status", "pending")),
            depends_on=d.get("depends_on", []),
            equipment_tag=d.get("equipment_tag", ""),
            criticality_class=d.get("criticality_class", ""),
            started_at=d.get("started_at"),
            completed_at=d.get("completed_at"),
        )


# ---------------------------------------------------------------------------
# ExecutionPlanStage
# ---------------------------------------------------------------------------


@dataclass
class ExecutionPlanStage:
    """A group of items that belong to a milestone or skill."""

    id: str
    name: str
    milestone: int
    skill: str = ""
    status: PlanStatus = PlanStatus.PENDING
    items: list[ExecutionPlanItem] = field(default_factory=list)

    # -- progress ----------------------------------------------------------

    @property
    def total_items(self) -> int:
        return len(self.items)

    @property
    def completed_items(self) -> int:
        return sum(
            1 for it in self.items
            if it.status in (PlanStatus.COMPLETED, PlanStatus.SKIPPED)
        )

    @property
    def progress(self) -> float:
        """Return progress as a percentage (0.0 – 100.0)."""
        if not self.items:
            return 100.0
        return round(self.completed_items / self.total_items * 100, 1)

    def recalculate_status(self) -> None:
        """Derive stage status from item statuses."""
        if not self.items:
            return
        if all(
            it.status in (PlanStatus.COMPLETED, PlanStatus.SKIPPED)
            for it in self.items
        ):
            self.status = PlanStatus.COMPLETED
        elif any(it.status == PlanStatus.IN_PROGRESS for it in self.items):
            self.status = PlanStatus.IN_PROGRESS
        elif all(it.status == PlanStatus.PENDING for it in self.items):
            self.status = PlanStatus.PENDING
        else:
            # Mix of pending + completed → in_progress
            self.status = PlanStatus.IN_PROGRESS

    # -- serialization -----------------------------------------------------

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "milestone": self.milestone,
            "skill": self.skill,
            "status": self.status.value,
            "progress": self.progress,
            "items": [it.to_dict() for it in self.items],
        }

    @classmethod
    def from_dict(cls, d: dict[str, Any]) -> ExecutionPlanStage:
        stage = cls(
            id=d["id"],
            name=d["name"],
            milestone=d["milestone"],
            skill=d.get("skill", ""),
            status=PlanStatus(d.get("status", "pending")),
        )
        stage.items = [ExecutionPlanItem.from_dict(it) for it in d.get("items", [])]
        return stage


# ---------------------------------------------------------------------------
# ExecutionPlan
# ---------------------------------------------------------------------------


@dataclass
class ExecutionPlan:
    """Top-level plan containing ordered stages."""

    stages: list[ExecutionPlanStage] = field(default_factory=list)
    starting_milestone: int = 1
    approach: StrategyApproach = StrategyApproach.FULL_RCM
    client_slug: str = ""
    project_slug: str = ""
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())

    # -- item index (lazy) -------------------------------------------------

    def _build_index(self) -> dict[str, ExecutionPlanItem]:
        idx: dict[str, ExecutionPlanItem] = {}
        for stage in self.stages:
            for item in stage.items:
                idx[item.id] = item
        return idx

    # -- progress ----------------------------------------------------------

    def calculate_progress(self) -> dict[str, Any]:
        """Return progress summary per stage and total."""
        stage_progress: list[dict[str, Any]] = []
        total_items = 0
        total_done = 0

        for stage in self.stages:
            stage.recalculate_status()
            stage_progress.append({
                "stage_id": stage.id,
                "name": stage.name,
                "progress": stage.progress,
                "status": stage.status.value,
                "completed": stage.completed_items,
                "total": stage.total_items,
            })
            total_items += stage.total_items
            total_done += stage.completed_items

        overall = round(total_done / total_items * 100, 1) if total_items else 100.0

        return {
            "overall_progress": overall,
            "total_items": total_items,
            "total_completed": total_done,
            "stages": stage_progress,
        }

    # -- item operations ---------------------------------------------------

    def update_item_status(self, item_id: str, status: PlanStatus) -> None:
        """Update the status of a specific item and recalculate its stage."""
        idx = self._build_index()
        if item_id not in idx:
            raise KeyError(f"Item '{item_id}' not found in execution plan")

        item = idx[item_id]
        if status == PlanStatus.IN_PROGRESS:
            item.mark_in_progress()
        elif status == PlanStatus.COMPLETED:
            item.mark_completed()
        elif status == PlanStatus.SKIPPED:
            item.mark_skipped()
        else:
            item.status = status

        # Recalculate parent stage
        for stage in self.stages:
            if any(it.id == item_id for it in stage.items):
                stage.recalculate_status()
                break

    def get_next_pending_items(self, limit: int = 10) -> list[ExecutionPlanItem]:
        """Return the next pending items respecting dependency order.

        An item is eligible only if all its ``depends_on`` items are
        completed or skipped.
        """
        idx = self._build_index()
        result: list[ExecutionPlanItem] = []

        for stage in self.stages:
            for item in stage.items:
                if item.status != PlanStatus.PENDING:
                    continue
                # Check all dependencies are done
                deps_met = all(
                    idx.get(dep_id, item).status
                    in (PlanStatus.COMPLETED, PlanStatus.SKIPPED)
                    for dep_id in item.depends_on
                )
                if deps_met:
                    result.append(item)
                    if len(result) >= limit:
                        return result

        return result

    # -- dependency validation ---------------------------------------------

    def validate_dependencies(self) -> list[str]:
        """Check for circular and broken dependencies.

        Returns a list of error messages (empty = valid).
        """
        idx = self._build_index()
        errors: list[str] = []

        for item_id, item in idx.items():
            for dep_id in item.depends_on:
                if dep_id not in idx:
                    errors.append(
                        f"Item '{item_id}' depends on unknown item '{dep_id}'"
                    )

        # Circular detection via topological DFS
        WHITE, GRAY, BLACK = 0, 1, 2
        color: dict[str, int] = {k: WHITE for k in idx}

        def dfs(node_id: str) -> bool:
            color[node_id] = GRAY
            for dep_id in idx[node_id].depends_on:
                if dep_id not in color:
                    continue
                if color[dep_id] == GRAY:
                    errors.append(
                        f"Circular dependency detected involving '{node_id}' and '{dep_id}'"
                    )
                    return True
                if color[dep_id] == WHITE:
                    if dfs(dep_id):
                        return True
            color[node_id] = BLACK
            return False

        for node_id in idx:
            if color[node_id] == WHITE:
                dfs(node_id)

        return errors

    # -- YAML serialization ------------------------------------------------

    def to_yaml(self) -> str:
        """Serialize to YAML string."""
        import yaml

        data = {
            "execution_plan": {
                "starting_milestone": self.starting_milestone,
                "approach": self.approach.value,
                "client_slug": self.client_slug,
                "project_slug": self.project_slug,
                "created_at": self.created_at,
                "progress": self.calculate_progress(),
                "stages": [s.to_dict() for s in self.stages],
            }
        }
        return yaml.dump(data, default_flow_style=False, allow_unicode=True, sort_keys=False)

    @classmethod
    def from_yaml(cls, yaml_str: str) -> ExecutionPlan:
        """Deserialize from YAML string."""
        import yaml

        data = yaml.safe_load(yaml_str)
        if not isinstance(data, dict) or "execution_plan" not in data:
            raise ValueError("Invalid execution plan YAML: missing 'execution_plan' key")

        ep = data["execution_plan"]
        # Coerce starting_milestone to int (defense against bad YAML)
        try:
            sm = int(ep.get("starting_milestone", 1))
        except (TypeError, ValueError):
            sm = 1
        plan = cls(
            starting_milestone=sm,
            approach=StrategyApproach(ep.get("approach", "full-rcm")),
            client_slug=ep.get("client_slug", ""),
            project_slug=ep.get("project_slug", ""),
            created_at=ep.get("created_at", ""),
        )
        plan.stages = [
            ExecutionPlanStage.from_dict(s) for s in ep.get("stages", [])
        ]
        return plan

    def to_file(self, path: str | Path | None = None) -> Path:
        """Save to ``2-state/execution-plan.yaml``.

        If *path* is None, resolves via paths.py using client/project slugs.
        """
        if path is None:
            from agents._shared.paths import get_state_dir

            path = (
                get_state_dir(self.client_slug, self.project_slug)
                / "execution-plan.yaml"
            )

        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(self.to_yaml(), encoding="utf-8")
        logger.info("Execution plan saved to %s", path)
        return path

    @classmethod
    def from_file(cls, path: str | Path) -> ExecutionPlan:
        """Load from a YAML file."""
        path = Path(path)
        return cls.from_yaml(path.read_text(encoding="utf-8"))
