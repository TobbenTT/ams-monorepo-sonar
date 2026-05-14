"""Data Import Engine — Phase 6.

Parses and validates pre-parsed row data (list[dict]) for:
- Equipment hierarchy (from SAP extract)
- Failure history records
- Maintenance plan imports

Validates data structure, maps columns, and returns validated results.
Deterministic — no LLM required.
"""

from __future__ import annotations

from tools.models.schemas import (
    ImportMapping,
    ImportResult,
    ImportSource,
    ImportSummary,
    ImportValidationError,
)

# Required columns per import source
_REQUIRED_COLUMNS: dict[ImportSource, list[str]] = {
    ImportSource.EQUIPMENT_HIERARCHY: [
        "equipment_id", "description", "equipment_type",
    ],
    ImportSource.FAILURE_HISTORY: [
        "equipment_id", "failure_date", "failure_mode",
    ],
    ImportSource.MAINTENANCE_PLAN: [
        "equipment_id", "task_description", "frequency",
    ],
}

# Known column aliases for auto-mapping
_COLUMN_ALIASES: dict[str, list[str]] = {
    "equipment_id": ["equipment_id", "equip_id", "eq_id", "asset_id", "tag", "functional_location"],
    "description": ["description", "desc", "name", "equipment_name", "asset_name"],
    "equipment_type": ["equipment_type", "type", "equip_type", "asset_type", "category"],
    "failure_date": ["failure_date", "date", "event_date", "occurrence_date"],
    "failure_mode": ["failure_mode", "mode", "fm", "failure_type"],
    "task_description": ["task_description", "task", "description", "activity"],
    "frequency": ["frequency", "interval", "cycle", "periodicity"],
    "parent_id": ["parent_id", "parent", "superior", "parent_equipment"],
    "criticality": ["criticality", "crit", "risk_class", "criticality_class"],
    "downtime_hours": ["downtime_hours", "downtime", "duration_hours", "repair_hours"],
    "cost": ["cost", "repair_cost", "total_cost", "amount"],
}


class DataImportEngine:
    """Parses and validates imported data files."""

    @staticmethod
    def validate_hierarchy_data(
        rows: list[dict],
        column_mapping: dict[str, str] | None = None,
    ) -> ImportResult:
        """Validate equipment hierarchy data."""
        return DataImportEngine._validate(
            rows, ImportSource.EQUIPMENT_HIERARCHY, column_mapping,
        )

    @staticmethod
    def validate_failure_history(
        rows: list[dict],
        column_mapping: dict[str, str] | None = None,
    ) -> ImportResult:
        """Validate failure history records."""
        return DataImportEngine._validate(
            rows, ImportSource.FAILURE_HISTORY, column_mapping,
        )

    @staticmethod
    def validate_maintenance_plan(
        rows: list[dict],
        column_mapping: dict[str, str] | None = None,
    ) -> ImportResult:
        """Validate maintenance plan data."""
        return DataImportEngine._validate(
            rows, ImportSource.MAINTENANCE_PLAN, column_mapping,
        )

    @staticmethod
    def detect_column_mapping(
        headers: list[str],
        target_type: ImportSource,
    ) -> ImportMapping:
        """Auto-detect column mapping from source headers to target schema."""
        required = _REQUIRED_COLUMNS.get(target_type, [])
        mapping: dict[str, str] = {}
        headers_lower = [h.lower().strip() for h in headers]

        for target_col in required:
            aliases = _COLUMN_ALIASES.get(target_col, [target_col])
            for alias in aliases:
                alias_lower = alias.lower()
                if alias_lower in headers_lower:
                    idx = headers_lower.index(alias_lower)
                    mapping[headers[idx]] = target_col
                    break

        mapped_targets = set(mapping.values())
        confidence = len(mapped_targets) / max(len(required), 1)

        return ImportMapping(
            source_columns=headers,
            target_columns=required,
            mapping=mapping,
            confidence=round(confidence, 2),
        )

    @staticmethod
    def summarize_import(result: ImportResult) -> ImportSummary:
        """Generate summary statistics from an import result."""
        error_summary: dict[str, int] = {}
        for err in result.errors:
            key = err.column if err.column else "general"
            error_summary[key] = error_summary.get(key, 0) + 1

        valid_pct = round(
            result.valid_rows / max(result.total_rows, 1) * 100, 1,
        )

        return ImportSummary(
            source=result.source,
            total_rows=result.total_rows,
            valid_pct=valid_pct,
            error_summary=error_summary,
        )

    @staticmethod
    def _validate(
        rows: list[dict],
        source: ImportSource,
        column_mapping: dict[str, str] | None,
    ) -> ImportResult:
        """Core validation logic for all import types."""
        if not rows:
            return ImportResult(source=source, total_rows=0, valid_rows=0, error_rows=0)

        required = _REQUIRED_COLUMNS.get(source, [])

        # Apply column mapping if provided
        mapped_rows: list[dict] = []
        if column_mapping:
            for row in rows:
                mapped = {}
                for src_col, tgt_col in column_mapping.items():
                    if src_col in row:
                        mapped[tgt_col] = row[src_col]
                # Keep unmapped columns
                for k, v in row.items():
                    if k not in column_mapping:
                        mapped[k] = v
                mapped_rows.append(mapped)
        else:
            mapped_rows = rows

        errors: list[ImportValidationError] = []
        valid_data: list[dict] = []
        error_row_indices: set[int] = set()

        for i, row in enumerate(mapped_rows):
            row_errors = False
            for col in required:
                val = row.get(col)
                if val is None or (isinstance(val, str) and not val.strip()):
                    errors.append(ImportValidationError(
                        row=i + 1,
                        column=col,
                        message=f"Required column '{col}' is missing or empty",
                    ))
                    row_errors = True

            # Type-specific validations
            if source == ImportSource.FAILURE_HISTORY and not row_errors:
                fd = row.get("failure_date", "")
                if isinstance(fd, str) and fd:
                    try:
                        from datetime import date as _date
                        _date.fromisoformat(fd[:10])
                    except (ValueError, TypeError):
                        errors.append(ImportValidationError(
                            row=i + 1,
                            column="failure_date",
                            message=f"Invalid date format: '{fd}'",
                        ))
                        row_errors = True

            if row_errors:
                error_row_indices.add(i)
            else:
                valid_data.append(row)

        return ImportResult(
            source=source,
            total_rows=len(rows),
            valid_rows=len(valid_data),
            error_rows=len(error_row_indices),
            errors=errors,
            validated_data=valid_data,
        )
