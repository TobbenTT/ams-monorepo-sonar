# tools/engines/spec_engine.py
"""Spec engine for AMS deliverables.

Generates _spec.yaml companion files that define the recipe for each
deliverable: inputs, tools, skills, parameters, quality criteria.

Usage:
    from tools.engines.spec_engine import generate_spec, validate_spec

    yaml_str = generate_spec("AMS-001")
    Path("hierarchy-tree_spec.yaml").write_text(yaml_str, encoding="utf-8")
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from pathlib import Path

import yaml

logger = logging.getLogger(__name__)

SPEC_SECTIONS = (
    "deliverable_id",
    "name",
    "milestone",
    "agent",
    "inputs",
    "tools",
    "skills",
    "parameters",
    "output",
    "quality",
    "acceptance",
)

QUALITY_DIMENSIONS = (
    "Technical Accuracy",
    "Completeness",
    "Consistency",
    "Format",
    "Actionability",
    "Traceability",
    "Intent Alignment",
)

QUALITY_WEIGHTS = {
    "Technical Accuracy": 0.25,
    "Completeness": 0.25,
    "Consistency": 0.15,
    "Format": 0.10,
    "Actionability": 0.10,
    "Traceability": 0.10,
    "Intent Alignment": 0.05,
}

AMS_QUALITY_THRESHOLD = 85.0


def generate_spec(
    deliverable_id: str,
    *,
    inputs: list[dict] | None = None,
    tools: list[str] | None = None,
    parameters: dict | None = None,
    acceptance_criteria: list[str] | None = None,
) -> str:
    """Generate a _spec.yaml string from the deliverable registry.

    Args:
        deliverable_id: The AMS-NNN deliverable ID.
        inputs: Optional override for input documents.
        tools: Optional override for tools used.
        parameters: Optional override for execution parameters.
        acceptance_criteria: Optional override for acceptance criteria.

    Returns:
        YAML string with the full spec structure.

    Raises:
        ValueError: If deliverable_id is not found in the registry.
    """
    from tools.engines.ams_deliverable_registry import get_registry

    registry = get_registry()
    entry = registry.get_deliverable(deliverable_id)
    if entry is None:
        raise ValueError(f"Deliverable '{deliverable_id}' not found in registry")

    agent_meta = registry.agents.get(entry.agent, {})

    spec = {
        "deliverable_id": entry.id,
        "name": entry.name,
        "milestone": entry.milestone,
        "agent": {
            "id": entry.agent,
            "name": agent_meta.get("name", entry.agent),
        },
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "version": "1.0",
        "inputs": inputs or _default_inputs(entry),
        "tools": tools or _default_tools(entry),
        "skills": [entry.skill] if entry.skill else [],
        "parameters": parameters or _default_parameters(entry),
        "output": {
            "format": entry.format,
            "path": entry.relative_output_path(),
            "description": entry.description,
        },
        "quality": {
            "threshold": AMS_QUALITY_THRESHOLD,
            "dimensions": [
                {"name": dim, "weight": QUALITY_WEIGHTS[dim]}
                for dim in QUALITY_DIMENSIONS
            ],
        },
        "acceptance": acceptance_criteria or _default_acceptance(entry),
    }

    return yaml.dump(spec, default_flow_style=False, allow_unicode=True, sort_keys=False)


def validate_spec(spec_path: str | Path) -> dict:
    """Validate a spec file against the canonical structure.

    Returns:
        {
            "valid": bool,
            "missing_fields": list[str],
            "warnings": list[str],
        }
    """
    path = Path(spec_path)
    if not path.is_file():
        return {"valid": False, "missing_fields": [], "warnings": [f"File not found: {path}"]}

    try:
        with open(path, "r", encoding="utf-8") as f:
            spec = yaml.safe_load(f)
    except Exception as exc:
        return {"valid": False, "missing_fields": [], "warnings": [f"Invalid YAML: {exc}"]}

    if not isinstance(spec, dict):
        return {"valid": False, "missing_fields": [], "warnings": ["Spec must be a YAML dict"]}

    missing = [s for s in SPEC_SECTIONS if s not in spec]
    warnings: list[str] = []

    # Check quality section
    quality = spec.get("quality", {})
    if isinstance(quality, dict):
        threshold = quality.get("threshold")
        if threshold is not None and threshold < AMS_QUALITY_THRESHOLD:
            warnings.append(f"Quality threshold {threshold} below AMS minimum {AMS_QUALITY_THRESHOLD}")

    return {
        "valid": len(missing) == 0,
        "missing_fields": missing,
        "warnings": warnings,
    }


# ---------------------------------------------------------------------------
# Default generators (produce reasonable defaults from registry metadata)
# ---------------------------------------------------------------------------


def _default_inputs(entry) -> list[dict]:
    """Generate default input list based on deliverable type."""
    _milestone_inputs = {
        "M1": [
            {"id": "equipment-list", "source": "0-input/01-equipment-list/", "mandatory": True},
            {"id": "scope", "source": "0-input/00-scope/", "mandatory": True},
            {"id": "standards", "source": "0-input/07-standards/", "mandatory": False},
        ],
        "M2": [
            {"id": "hierarchy-tree", "source": "1-output/M1/hierarchy-tree.xlsx", "mandatory": True},
            {"id": "criticality-matrix", "source": "1-output/M1/criticality-matrix.xlsx", "mandatory": True},
            {"id": "failure-history", "source": "0-input/02-failure-history/", "mandatory": False},
            {"id": "vendor-docs", "source": "0-input/09-vendor-docs/", "mandatory": False},
        ],
        "M3": [
            {"id": "fmeca-table", "source": "1-output/M2/fmeca-table.xlsx", "mandatory": True},
            {"id": "rcm-decision-sheets", "source": "1-output/M2/rcm-decision-sheets.xlsx", "mandatory": True},
            {"id": "spare-parts", "source": "0-input/04-spare-parts/", "mandatory": False},
            {"id": "workforce", "source": "0-input/06-workforce/", "mandatory": False},
        ],
        "M4": [
            {"id": "maintenance-task-list", "source": "1-output/M3/maintenance-task-list.xlsx", "mandatory": True},
            {"id": "work-packages", "source": "1-output/M3/work-packages.xlsx", "mandatory": True},
            {"id": "material-assignments", "source": "1-output/M3/material-assignments.xlsx", "mandatory": True},
        ],
    }
    return _milestone_inputs.get(entry.milestone, [])


def _default_tools(entry) -> list[str]:
    """Generate default tool list based on deliverable type."""
    _slug_tools = {
        "hierarchy-tree": ["hierarchy_builder_engine"],
        "criticality-matrix": ["criticality_engine"],
        "fmeca-table": ["fmeca_engine"],
        "rcm-decision-sheets": ["rcm_decision_engine"],
        "maintenance-task-list": ["work_package_assembly_engine"],
        "work-packages": ["work_package_assembly_engine"],
        "work-instructions": ["work_instruction_generator"],
        "material-assignments": ["material_mapper", "spare_parts_engine"],
        "sap-upload-package": ["sap_export_engine"],
        "validation-report": ["quality_score_engine"],
        "quality-report": ["quality_score_engine"],
        "strategy-summary": ["reporting_engine"],
    }
    return _slug_tools.get(entry.slug, [])


def _default_parameters(entry) -> dict:
    """Generate default parameters based on deliverable type."""
    return {
        "quality_threshold": AMS_QUALITY_THRESHOLD,
        "format": entry.format,
        "language": "es",
    }


def _default_acceptance(entry) -> list[str]:
    """Generate default acceptance criteria."""
    base = [
        f"Quality score >= {AMS_QUALITY_THRESHOLD}",
        "All mandatory inputs consumed",
        "3 companion files present (spec, trace, feedback)",
    ]
    _extra = {
        "hierarchy-tree": ["6 hierarchy levels present", "No orphan nodes"],
        "criticality-matrix": ["All equipment scored", "No missing dimensions"],
        "fmeca-table": ["All critical components covered", "RPN calculated"],
        "rcm-decision-sheets": ["All failure modes have decisions", "No invalid paths"],
        "sap-upload-package": ["All SAP fields validated", "Status = DRAFT"],
    }
    return base + _extra.get(entry.slug, [])
