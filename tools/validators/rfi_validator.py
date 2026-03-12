"""RFI Validator — validates RFI questionnaire submissions.

Follows the same pattern as QualityValidator: class with static methods
returning list[ValidationResult].

Rule ID scheme:
  RFI-001..008  Required field checks (one per sheet)
  RFI-010..019  Cross-field coherence checks
  RFI-020..029  Numeric range validation
  RFI-050       Completeness score (INFO)
  RFI-099       Below-threshold warning
"""

from __future__ import annotations

from tools.models.rfi_models import (
    AMS_TEMPLATES,
    DATA_QUALITY_MAX,
    DATA_QUALITY_MIN,
    REQUIRED_COMPLETENESS_THRESHOLD,
    REQUIRED_FIELDS,
    CMMSType,
    RFISubmission,
)
from tools.validators.quality_validator import ValidationResult


class RFIValidator:
    """Validates RFI submission data for completeness and coherence."""

    # -----------------------------------------------------------------
    # Required fields
    # -----------------------------------------------------------------

    @staticmethod
    def validate_required_fields(submission: RFISubmission) -> list[ValidationResult]:
        """RFI-001..RFI-008: Check required fields per sheet."""
        results: list[ValidationResult] = []

        sheet_map = {
            "company_site": ("RFI-001", submission.company_site),
            "equipment_hierarchy": ("RFI-002", submission.equipment_hierarchy),
            "maintenance_state": ("RFI-003", submission.maintenance_state),
            "organization": ("RFI-004", submission.organization),
            "standards": ("RFI-005", submission.standards),
            "kpi_baseline": ("RFI-006", submission.kpi_baseline),
            "scope_timeline": ("RFI-007", submission.scope_timeline),
            "data_availability": ("RFI-008", submission.data_availability),
        }

        for sheet_key, (rule_id, model) in sheet_map.items():
            required = REQUIRED_FIELDS.get(sheet_key, [])
            for field_name in required:
                value = getattr(model, field_name, None)
                if _is_empty(value):
                    results.append(ValidationResult(
                        rule_id,
                        "ERROR",
                        f"Required field '{field_name}' is empty in {sheet_key}",
                        f"{sheet_key}.{field_name}",
                    ))

        return results

    # -----------------------------------------------------------------
    # Coherence checks
    # -----------------------------------------------------------------

    @staticmethod
    def validate_coherence(submission: RFISubmission) -> list[ValidationResult]:
        """RFI-010..RFI-019: Cross-field coherence validation."""
        results: list[ValidationResult] = []
        ms = submission.maintenance_state
        eh = submission.equipment_hierarchy
        st = submission.scope_timeline

        # RFI-010: SAP_PM requires sap_version
        if ms.cmms_type == CMMSType.SAP_PM and ms.sap_version is None:
            results.append(ValidationResult(
                "RFI-010", "ERROR",
                "CMMS is SAP PM but SAP version is not specified",
                "maintenance_state.sap_version",
            ))

        # RFI-011: WO history available but no years specified
        if ms.wo_history_available is True and (
            ms.wo_history_years is None or ms.wo_history_years == 0
        ):
            results.append(ValidationResult(
                "RFI-011", "WARNING",
                "Work order history is available but years of history not specified",
                "maintenance_state.wo_history_years",
            ))

        # RFI-012: Prior criticality without method
        if ms.prior_criticality_assessment is True and ms.criticality_method is None:
            results.append(ValidationResult(
                "RFI-012", "WARNING",
                "Prior criticality assessment exists but method not specified",
                "maintenance_state.criticality_method",
            ))

        # RFI-013: Equipment list available but no format
        if eh.equipment_list_available is True and eh.equipment_list_format is None:
            results.append(ValidationResult(
                "RFI-013", "WARNING",
                "Equipment list is available but format not specified",
                "equipment_hierarchy.equipment_list_format",
            ))

        # RFI-014: target_completion before start_date
        if (
            st.start_date is not None
            and st.target_completion is not None
            and st.target_completion < st.start_date
        ):
            results.append(ValidationResult(
                "RFI-014", "ERROR",
                "Target completion date is before start date",
                "scope_timeline.target_completion",
            ))

        # RFI-015: BOM available but no format
        if eh.bom_available is True and eh.bom_format is None:
            results.append(ValidationResult(
                "RFI-015", "WARNING",
                "BOM is available but format not specified",
                "equipment_hierarchy.bom_format",
            ))

        # RFI-016: Failure data available but no format
        if ms.failure_data_available is True and ms.failure_data_format is None:
            results.append(ValidationResult(
                "RFI-016", "WARNING",
                "Failure data is available but format not specified",
                "maintenance_state.failure_data_format",
            ))

        # RFI-017: PM exists but no format
        if ms.planned_maintenance_exists is True and ms.pm_plan_format is None:
            results.append(ValidationResult(
                "RFI-017", "WARNING",
                "Planned maintenance exists but plan format not specified",
                "maintenance_state.pm_plan_format",
            ))

        return results

    # -----------------------------------------------------------------
    # Numeric range validation
    # -----------------------------------------------------------------

    @staticmethod
    def validate_numeric_ranges(submission: RFISubmission) -> list[ValidationResult]:
        """RFI-020..RFI-029: Validate numeric field ranges."""
        results: list[ValidationResult] = []

        # RFI-020: Data availability quality scores
        for item in submission.data_availability.items:
            if item.quality_score is not None and not (
                DATA_QUALITY_MIN <= item.quality_score <= DATA_QUALITY_MAX
            ):
                results.append(ValidationResult(
                    "RFI-020", "ERROR",
                    f"Quality score {item.quality_score} for {item.template_id} "
                    f"must be {DATA_QUALITY_MIN}-{DATA_QUALITY_MAX}",
                    f"data_availability.{item.template_id}",
                ))

        # RFI-021: Target availability should be >= current
        kpi = submission.kpi_baseline
        if (
            kpi.current_availability is not None
            and kpi.target_availability is not None
            and kpi.target_availability < kpi.current_availability
        ):
            results.append(ValidationResult(
                "RFI-021", "WARNING",
                f"Target availability ({kpi.target_availability}%) is below "
                f"current ({kpi.current_availability}%)",
                "kpi_baseline.target_availability",
            ))

        # RFI-022: Target PM compliance should be >= current
        if (
            kpi.current_pm_compliance is not None
            and kpi.target_pm_compliance is not None
            and kpi.target_pm_compliance < kpi.current_pm_compliance
        ):
            results.append(ValidationResult(
                "RFI-022", "WARNING",
                f"Target PM compliance ({kpi.target_pm_compliance}%) is below "
                f"current ({kpi.current_pm_compliance}%)",
                "kpi_baseline.target_pm_compliance",
            ))

        # RFI-023: Target planned/unplanned should be >= current
        if (
            kpi.current_planned_vs_unplanned is not None
            and kpi.target_planned_vs_unplanned is not None
            and kpi.target_planned_vs_unplanned < kpi.current_planned_vs_unplanned
        ):
            results.append(ValidationResult(
                "RFI-023", "WARNING",
                f"Target planned/unplanned ratio ({kpi.target_planned_vs_unplanned}%) "
                f"is below current ({kpi.current_planned_vs_unplanned}%)",
                "kpi_baseline.target_planned_vs_unplanned",
            ))

        return results

    # -----------------------------------------------------------------
    # Completeness score
    # -----------------------------------------------------------------

    @staticmethod
    def calculate_completeness(
        submission: RFISubmission,
    ) -> tuple[float, list[ValidationResult]]:
        """Calculate completeness score (0-100%) of required fields.

        Returns:
            (score, list of INFO-level results)
        """
        total_required = 0
        filled_required = 0

        sheet_map = {
            "company_site": submission.company_site,
            "equipment_hierarchy": submission.equipment_hierarchy,
            "maintenance_state": submission.maintenance_state,
            "organization": submission.organization,
            "standards": submission.standards,
            "kpi_baseline": submission.kpi_baseline,
            "scope_timeline": submission.scope_timeline,
            "data_availability": submission.data_availability,
        }

        for sheet_key, model in sheet_map.items():
            required = REQUIRED_FIELDS.get(sheet_key, [])
            for field_name in required:
                total_required += 1
                value = getattr(model, field_name, None)
                if not _is_empty(value):
                    filled_required += 1

        if total_required == 0:
            score = 100.0
        else:
            score = (filled_required / total_required) * 100.0

        results = [
            ValidationResult(
                "RFI-050", "INFO",
                f"RFI completeness: {score:.0f}% "
                f"({filled_required}/{total_required} required fields filled)",
                "rfi-submission",
            ),
        ]

        return score, results

    # -----------------------------------------------------------------
    # Full validation
    # -----------------------------------------------------------------

    @classmethod
    def run_full_validation(
        cls, submission: RFISubmission,
    ) -> list[ValidationResult]:
        """Run all validation rules and return combined results."""
        results: list[ValidationResult] = []

        results.extend(cls.validate_required_fields(submission))
        results.extend(cls.validate_coherence(submission))
        results.extend(cls.validate_numeric_ranges(submission))

        score, score_results = cls.calculate_completeness(submission)
        results.extend(score_results)

        if score < REQUIRED_COMPLETENESS_THRESHOLD * 100:
            results.append(ValidationResult(
                "RFI-099", "WARNING",
                f"RFI completeness {score:.0f}% is below required threshold "
                f"({REQUIRED_COMPLETENESS_THRESHOLD * 100:.0f}%)",
                "rfi-submission",
            ))

        return results


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _is_empty(value: object) -> bool:
    """Check if a field value is considered empty/unfilled."""
    if value is None:
        return True
    if isinstance(value, str) and value.strip() == "":
        return True
    if isinstance(value, list) and len(value) == 0:
        return True
    return False
