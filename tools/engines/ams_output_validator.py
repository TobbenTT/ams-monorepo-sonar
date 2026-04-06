# tools/engines/ams_output_validator.py
"""Output validator for AMS deliverables.

Validates that deliverables follow the required structure:
- Main file exists
- 3 companion files exist (_spec.yaml, _trace.md, _feedback.md)
- Excel files are valid (openpyxl can open them, have data rows)
- Quality score meets threshold (>= 85)
- Trace file has all 10 mandatory sections

Usage:
    from tools.engines.ams_output_validator import validate_deliverable

    result = validate_deliverable(
        deliverable_path="/path/to/1-output/M1/hierarchy-tree.xlsx",
        quality_scores={"technical_accuracy": 90, ...},
    )
"""

from __future__ import annotations

import logging
from pathlib import Path

logger = logging.getLogger(__name__)

QUALITY_THRESHOLD = 85.0

TRACE_MANDATORY_SECTIONS = (
    "Identity",
    "Inputs Consumed",
    "Processing Pipeline",
    "Decisions Made",
    "Quality Assessment",
    "Assumptions",
    "RFIs Generated",
    "Downstream Dependencies",
    "Human Checkpoints",
    "Audit Trail",
)


def validate_deliverable(
    deliverable_path: str | Path,
    quality_scores: dict | None = None,
    quality_threshold: float = QUALITY_THRESHOLD,
) -> dict:
    """Validate a deliverable and its companion files.

    Args:
        deliverable_path: Absolute path to the main deliverable file.
        quality_scores: Dict of dimension -> score (0-100).
        quality_threshold: Minimum acceptable weighted quality score.

    Returns:
        {
            "valid": bool,
            "errors": list[str],    # blocking issues
            "warnings": list[str],  # non-blocking issues
            "checks": {
                "file_exists": bool,
                "spec_exists": bool,
                "trace_exists": bool,
                "feedback_exists": bool,
                "excel_valid": bool | None,  # None if not xlsx
                "quality_pass": bool | None, # None if no scores provided
                "trace_complete": bool | None,
            }
        }
    """
    path = Path(deliverable_path)
    errors: list[str] = []
    warnings: list[str] = []
    checks: dict = {}

    # --- File existence ---
    checks["file_exists"] = path.is_file()
    if not checks["file_exists"]:
        errors.append(f"Deliverable file not found: {path}")

    # --- Companion files ---
    stem = path.stem
    parent = path.parent

    spec_path = parent / f"{stem}_spec.yaml"
    trace_path = parent / f"{stem}_trace.md"
    feedback_path = parent / f"{stem}_feedback.md"

    checks["spec_exists"] = spec_path.is_file()
    checks["trace_exists"] = trace_path.is_file()
    checks["feedback_exists"] = feedback_path.is_file()

    if not checks["spec_exists"]:
        errors.append(f"Spec file missing: {spec_path.name}")
    if not checks["trace_exists"]:
        errors.append(f"Trace file missing: {trace_path.name}")
    if not checks["feedback_exists"]:
        warnings.append(f"Feedback file missing: {feedback_path.name}")

    # --- Excel validation ---
    checks["excel_valid"] = None
    if path.suffix == ".xlsx" and checks["file_exists"]:
        checks["excel_valid"] = _validate_excel(path, errors, warnings)

    # --- Quality score validation ---
    checks["quality_pass"] = None
    if quality_scores:
        weighted = _compute_weighted_score(quality_scores)
        checks["quality_pass"] = weighted >= quality_threshold
        if not checks["quality_pass"]:
            errors.append(
                f"Quality score {weighted:.1f} below threshold {quality_threshold}"
            )

    # --- Trace completeness ---
    checks["trace_complete"] = None
    if checks.get("trace_exists") and trace_path.is_file():
        checks["trace_complete"] = _validate_trace_sections(trace_path, warnings)

    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings,
        "checks": checks,
    }


def _validate_excel(
    path: Path, errors: list[str], warnings: list[str]
) -> bool:
    """Check that an xlsx file can be opened and has data rows."""
    try:
        import openpyxl

        wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
        has_data = False
        for ws in wb.worksheets:
            row_count = 0
            for _ in ws.iter_rows(min_row=2, max_row=2):
                row_count += 1
            if row_count > 0:
                has_data = True
                break
        wb.close()

        if not has_data:
            warnings.append("Excel file has no data rows (only headers or empty)")
        return True
    except ImportError:
        warnings.append("openpyxl not installed, skipping Excel validation")
        return True
    except Exception as exc:
        errors.append(f"Excel file corrupt or unreadable: {exc}")
        return False


def _compute_weighted_score(scores: dict) -> float:
    """Compute a weighted quality score from dimension scores.

    Default weights match quality_score_config.yaml.
    """
    default_weights = {
        "technical_accuracy": 0.25,
        "completeness": 0.25,
        "consistency": 0.15,
        "format": 0.10,
        "actionability": 0.10,
        "traceability": 0.10,
        "intent_alignment": 0.05,
    }
    total_weight = 0.0
    weighted_sum = 0.0
    for dim, weight in default_weights.items():
        if dim in scores:
            weighted_sum += scores[dim] * weight
            total_weight += weight

    if total_weight == 0:
        return 0.0
    return weighted_sum / total_weight


def _validate_trace_sections(
    trace_path: Path, warnings: list[str]
) -> bool:
    """Check that a trace file contains all 10 mandatory sections."""
    try:
        content = trace_path.read_text(encoding="utf-8").lower()
        missing = []
        for section in TRACE_MANDATORY_SECTIONS:
            # Check for markdown header with section name
            if section.lower() not in content:
                missing.append(section)
        if missing:
            warnings.append(f"Trace missing sections: {', '.join(missing)}")
            return False
        return True
    except Exception as exc:
        warnings.append(f"Could not read trace file: {exc}")
        return False
