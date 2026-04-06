# tools/engines/ams_deliverable_registry.py
"""AMS Deliverable Registry — static lookup table for deliverable metadata.

This is a READ-ONLY registry that maps deliverable IDs (AMS-NNN) to their
milestone, agent, slug, format, and other metadata.  It does NOT handle
lifecycle transitions (that's deliverable_tracking_engine.py).

Usage:
    from tools.engines.ams_deliverable_registry import get_registry

    registry = get_registry()
    d = registry.get_deliverable("AMS-001")
    m1_deliverables = registry.get_by_milestone("M1")
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from pathlib import Path
from typing import ClassVar

import yaml

logger = logging.getLogger(__name__)

_CONFIG_FILE = Path(__file__).parent / "ams_deliverable_registry_config.yaml"

# Valid milestones and agents
VALID_MILESTONES = frozenset({"M1", "M2", "M3", "M4"})
VALID_AGENTS = frozenset({"AG-001", "AG-002", "AG-003", "AG-004"})


@dataclass(frozen=True)
class DeliverableEntry:
    """Single deliverable definition from the registry."""

    id: str
    name: str
    slug: str
    milestone: str
    agent: str
    format: str
    description: str = ""
    skill: str = ""
    mandatory: bool = True

    def relative_output_path(self) -> str:
        """Return the relative path within 1-output/.

        Example: 'M1/hierarchy-tree.xlsx'
        """
        return f"{self.milestone}/{self.slug}.{self.format}"


@dataclass
class AMSDeliverableRegistry:
    """In-memory registry of all AMS deliverables."""

    _entries: dict[str, DeliverableEntry] = field(default_factory=dict)
    _by_slug: dict[str, DeliverableEntry] = field(default_factory=dict)
    _by_milestone: dict[str, list[DeliverableEntry]] = field(default_factory=dict)
    _by_agent: dict[str, list[DeliverableEntry]] = field(default_factory=dict)

    # Agent and milestone metadata from config
    agents: dict[str, dict] = field(default_factory=dict)
    milestones: dict[str, dict] = field(default_factory=dict)

    _instance: ClassVar[AMSDeliverableRegistry | None] = None

    # ------------------------------------------------------------------
    # Lookup methods
    # ------------------------------------------------------------------

    def get_deliverable(self, deliverable_id: str) -> DeliverableEntry | None:
        """Look up a deliverable by its ID (e.g. 'AMS-001')."""
        return self._entries.get(deliverable_id)

    def find_by_slug(self, slug: str) -> DeliverableEntry | None:
        """Look up a deliverable by its file slug (e.g. 'hierarchy-tree')."""
        return self._by_slug.get(slug)

    def get_by_milestone(self, milestone: str) -> list[DeliverableEntry]:
        """Return all deliverables for a given milestone."""
        return list(self._by_milestone.get(milestone, []))

    def get_by_agent(self, agent_id: str) -> list[DeliverableEntry]:
        """Return all deliverables produced by a given agent."""
        return list(self._by_agent.get(agent_id, []))

    def get_mandatory(self) -> list[DeliverableEntry]:
        """Return all mandatory deliverables."""
        return [e for e in self._entries.values() if e.mandatory]

    def get_output_path(self, deliverable_id: str) -> str | None:
        """Return the relative output path for a deliverable.

        Example: 'M1/hierarchy-tree.xlsx'
        """
        entry = self._entries.get(deliverable_id)
        if entry is None:
            return None
        return entry.relative_output_path()

    def all_ids(self) -> list[str]:
        """Return all registered deliverable IDs, sorted."""
        return sorted(self._entries.keys())

    def __len__(self) -> int:
        return len(self._entries)

    # ------------------------------------------------------------------
    # Loading
    # ------------------------------------------------------------------

    @classmethod
    def from_yaml(cls, config_path: Path | str | None = None) -> AMSDeliverableRegistry:
        """Load the registry from the YAML config file."""
        path = Path(config_path) if config_path else _CONFIG_FILE
        if not path.is_file():
            raise FileNotFoundError(f"Registry config not found: {path}")

        with open(path, "r", encoding="utf-8") as f:
            raw = yaml.safe_load(f)

        if not isinstance(raw, dict):
            raise ValueError(f"Registry config must be a YAML dict: {path}")

        registry = cls()
        registry.agents = raw.get("agents", {})
        registry.milestones = raw.get("milestones", {})

        for did, dconf in raw.get("deliverables", {}).items():
            entry = DeliverableEntry(
                id=did,
                name=dconf["name"],
                slug=dconf["slug"],
                milestone=dconf["milestone"],
                agent=dconf["agent"],
                format=dconf["format"],
                description=dconf.get("description", ""),
                skill=dconf.get("skill", ""),
                mandatory=dconf.get("mandatory", True),
            )
            registry._entries[did] = entry
            registry._by_slug[entry.slug] = entry
            registry._by_milestone.setdefault(entry.milestone, []).append(entry)
            registry._by_agent.setdefault(entry.agent, []).append(entry)

        logger.info("AMS deliverable registry loaded: %d entries", len(registry))
        return registry


# ------------------------------------------------------------------
# Module-level singleton accessor
# ------------------------------------------------------------------

_registry: AMSDeliverableRegistry | None = None


def get_registry(config_path: Path | str | None = None) -> AMSDeliverableRegistry:
    """Return the singleton registry instance, loading from YAML on first call."""
    global _registry
    if _registry is None:
        _registry = AMSDeliverableRegistry.from_yaml(config_path)
    return _registry


def reload_registry(config_path: Path | str | None = None) -> AMSDeliverableRegistry:
    """Force-reload the registry from YAML. Useful for testing."""
    global _registry
    _registry = AMSDeliverableRegistry.from_yaml(config_path)
    return _registry
