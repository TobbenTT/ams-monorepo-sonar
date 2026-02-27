"""
Validation script for export-data skill.
Verifies ExportResult structure and completeness.
"""
import json
import sys


def validate_export_result(result: dict) -> dict:
    """Validate an export result for structural correctness.

    Args:
        result: dict with keys: format, sheets (list), sections (list), metadata (dict)

    Returns:
        dict with 'valid' (bool), 'errors' (list), 'warnings' (list), 'info' (list)
    """
    errors = []
    warnings = []
    info = []

    # Format validation
    fmt = result.get("format", "")
    if fmt not in ("EXCEL", "CSV", "PDF"):
        errors.append(f"Invalid format: '{fmt}'. Expected EXCEL, CSV, or PDF.")

    # Sheets validation
    sheets = result.get("sheets", [])
    if len(sheets) == 0:
        errors.append("No sheets in export result. At least one sheet is required.")

    for i, sheet in enumerate(sheets):
        name = sheet.get("name", "")
        if not name:
            errors.append(f"Sheet {i+1}: missing name")

        headers = sheet.get("headers", [])
        if not headers:
            warnings.append(f"Sheet '{name}': no headers defined")

        rows = sheet.get("rows", [])
        for j, row in enumerate(rows):
            if len(row) != len(headers):
                warnings.append(
                    f"Sheet '{name}', row {j+1}: column count ({len(row)}) "
                    f"!= header count ({len(headers)})"
                )

    # CSV format check
    if fmt == "CSV" and len(sheets) > 1:
        warnings.append(
            f"CSV format with {len(sheets)} sheets. "
            "CSV only supports a single sheet."
        )

    # Metadata validation
    metadata = result.get("metadata", {})
    if not metadata.get("export_type"):
        warnings.append("Missing export_type in metadata")

    # Verify all metadata values are strings
    for key, value in metadata.items():
        if not isinstance(value, str):
            warnings.append(
                f"Metadata '{key}' is {type(value).__name__}, expected str"
            )

    # Sections validation (for reports)
    sections = result.get("sections", [])
    for i, section in enumerate(sections):
        if not section.get("title"):
            warnings.append(f"Section {i+1}: missing title")

    total_rows = sum(len(s.get("rows", [])) for s in sheets)
    info.append(
        f"Export: {fmt}, {len(sheets)} sheet(s), "
        f"{total_rows} total data rows, {len(sections)} section(s)"
    )

    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings,
        "info": info,
        "total_sheets": len(sheets),
        "total_rows": total_rows,
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python validate.py <export_result_json>")
        print("  export_result_json: JSON object of ExportResult")
        sys.exit(1)

    result = json.loads(sys.argv[1])
    output = validate_export_result(result)
    print(json.dumps(output, indent=2))
