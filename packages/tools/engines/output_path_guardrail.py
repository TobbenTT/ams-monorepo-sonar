# tools/engines/output_path_guardrail.py
"""Output path guardrail for AMS deliverables.

Ensures all deliverables are written to the correct path within the
client folder: 1-output/{Milestone}/{slug}.{ext}

Usage:
    from tools.engines.output_path_guardrail import (
        validate_output_path, suggest_path, ensure_output_dir
    )
"""

from __future__ import annotations

import logging
from pathlib import Path

from agents._shared.paths import get_milestone_output_dir, get_output_dir

logger = logging.getLogger(__name__)

VALID_MILESTONES = frozenset({"M1", "M2", "M3", "M4"})
VALID_FORMATS = frozenset({"xlsx", "docx", "md", "json", "yaml", "pdf", "csv"})


def validate_output_path(
    output_path: str | Path,
    milestone: str,
    deliverable_slug: str,
    ext: str = "xlsx",
) -> dict:
    """Validate that an output path follows the convention.

    Returns:
        {
            "valid": bool,
            "corrected_path": str | None,  # suggested correction if invalid
            "warnings": list[str],
        }
    """
    warnings: list[str] = []
    path = Path(output_path)
    parts = path.parts

    # Check milestone
    if milestone not in VALID_MILESTONES:
        warnings.append(f"Invalid milestone '{milestone}', expected one of {sorted(VALID_MILESTONES)}")

    # Check extension
    clean_ext = ext.lstrip(".")
    if clean_ext not in VALID_FORMATS:
        warnings.append(f"Unusual format '.{clean_ext}', expected one of {sorted(VALID_FORMATS)}")

    # Check that path contains the milestone folder
    expected_filename = f"{deliverable_slug}.{clean_ext}"
    expected_relative = f"{milestone}/{expected_filename}"

    # Verify path ends with the expected pattern
    if len(parts) >= 2:
        actual_milestone_folder = parts[-2]
        actual_filename = parts[-1]
        if actual_milestone_folder != milestone:
            warnings.append(
                f"Path milestone folder '{actual_milestone_folder}' != expected '{milestone}'"
            )
        if actual_filename != expected_filename:
            warnings.append(
                f"Filename '{actual_filename}' != expected '{expected_filename}'"
            )
    else:
        warnings.append(f"Path too short, expected at least milestone/filename: {path}")

    corrected = None
    if warnings:
        # Reconstruct the correct relative path
        corrected = expected_relative

    return {
        "valid": len(warnings) == 0,
        "corrected_path": corrected,
        "warnings": warnings,
    }


def suggest_path(
    milestone: str,
    deliverable_slug: str,
    ext: str = "xlsx",
) -> str:
    """Return the canonical relative path for a deliverable.

    Example: suggest_path("M1", "hierarchy-tree", "xlsx")
    -> "M1/hierarchy-tree.xlsx"
    """
    clean_ext = ext.lstrip(".")
    return f"{milestone}/{deliverable_slug}.{clean_ext}"


def ensure_output_dir(
    client_slug: str,
    project_slug: str,
    milestone: str,
) -> Path:
    """Create the 1-output/{milestone}/ directory if it doesn't exist.

    Returns the absolute Path to the milestone output directory.
    """
    dir_path = get_milestone_output_dir(client_slug, project_slug, milestone)
    dir_path.mkdir(parents=True, exist_ok=True)
    return dir_path


def resolve_absolute_path(
    client_slug: str,
    project_slug: str,
    milestone: str,
    deliverable_slug: str,
    ext: str = "xlsx",
) -> Path:
    """Return the absolute path where a deliverable should be written.

    Combines path resolution from paths.py with the naming convention.
    Does NOT create directories (use ensure_output_dir for that).
    """
    clean_ext = ext.lstrip(".")
    output_dir = get_milestone_output_dir(client_slug, project_slug, milestone)
    return output_dir / f"{deliverable_slug}.{clean_ext}"
