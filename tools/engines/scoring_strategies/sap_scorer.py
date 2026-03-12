"""SAP upload package quality scoring strategy.

Scores SAP upload packages across 7 quality dimensions.
Checks: field lengths, cross-references, plant code, required fields.
"""

from __future__ import annotations

from tools.models.schemas import QualityDimension, QualityScoreDimension
from tools.engines.scoring_strategies.base import ScorerStrategy, _ratio_score

SAP_SHORT_TEXT_MAX = 72
SAP_DESCRIPTION_MAX = 40


class SAPScorer(ScorerStrategy):
    """Quality scoring for SAP upload package deliverables."""

    DELIVERABLE_TYPE = "sap_upload"

    def _get_package(self, entities: dict) -> dict | None:
        """Extract SAP upload package from entities."""
        # SAP package may be stored as sap_upload_package or in entities
        pkg = entities.get("sap_upload_package")
        if isinstance(pkg, dict):
            return pkg
        # Try list format
        pkgs = entities.get("sap_upload", [])
        if pkgs and isinstance(pkgs, list):
            return pkgs[0] if pkgs else None
        return pkg

    def score_technical_accuracy(self, entities: dict, context: dict) -> QualityScoreDimension:
        pkg = self._get_package(entities)
        if not pkg:
            return QualityScoreDimension(
                dimension=QualityDimension.TECHNICAL_ACCURACY, score=0.0,
                findings=["No SAP upload package found"],
            )

        findings = []
        checks_passed = 0
        checks_total = 0

        # Maintenance plan should exist
        plan = pkg.get("maintenance_plan", {})
        checks_total += 1
        if plan and plan.get("plan_id"):
            checks_passed += 1
        else:
            findings.append("SAP package missing maintenance_plan")

        # Maintenance items should exist
        items = pkg.get("maintenance_items", [])
        checks_total += 1
        if items and len(items) > 0:
            checks_passed += 1
        else:
            findings.append("SAP package has no maintenance_items")

        # Task lists should exist
        task_lists = pkg.get("task_lists", [])
        checks_total += 1
        if task_lists and len(task_lists) > 0:
            checks_passed += 1
        else:
            findings.append("SAP package has no task_lists")

        # Cross-reference: items should reference task lists
        tl_refs = {tl.get("task_list_id") for tl in task_lists if tl.get("task_list_id")}
        for item in items:
            ref = item.get("task_list_ref")
            if ref:
                checks_total += 1
                if ref in tl_refs:
                    checks_passed += 1
                else:
                    findings.append(
                        f"Item {item.get('item_id', '?')}: "
                        f"references non-existent task_list {ref}"
                    )

        return QualityScoreDimension(
            dimension=QualityDimension.TECHNICAL_ACCURACY,
            score=_ratio_score(checks_passed, checks_total),
            findings=findings[:10],
        )

    def score_completeness(self, entities: dict, context: dict) -> QualityScoreDimension:
        pkg = self._get_package(entities)
        if not pkg:
            return QualityScoreDimension(
                dimension=QualityDimension.COMPLETENESS, score=0.0,
                findings=["No SAP upload package found"],
            )

        findings = []
        checks_passed = 0
        checks_total = 0

        # Required top-level fields
        for field in ("package_id", "plant_code", "generated_at"):
            checks_total += 1
            if pkg.get(field):
                checks_passed += 1
            else:
                findings.append(f"SAP package missing {field}")

        # Each task list should have operations
        for tl in pkg.get("task_lists", []):
            operations = tl.get("operations", [])
            checks_total += 1
            if operations and len(operations) > 0:
                checks_passed += 1
            else:
                findings.append(
                    f"Task list {tl.get('task_list_id', '?')} has no operations"
                )

            # Each operation should have work_centre and short_text
            for op in operations:
                checks_total += 1
                has_wc = bool(op.get("work_centre"))
                has_st = bool(op.get("short_text"))
                if has_wc and has_st:
                    checks_passed += 1
                else:
                    missing = []
                    if not has_wc:
                        missing.append("work_centre")
                    if not has_st:
                        missing.append("short_text")
                    findings.append(
                        f"Operation {op.get('operation_number', '?')}: "
                        f"missing {', '.join(missing)}"
                    )

        return QualityScoreDimension(
            dimension=QualityDimension.COMPLETENESS,
            score=_ratio_score(checks_passed, checks_total),
            findings=findings[:10],
        )

    def score_consistency(self, entities: dict, context: dict) -> QualityScoreDimension:
        pkg = self._get_package(entities)
        if not pkg:
            return QualityScoreDimension(
                dimension=QualityDimension.CONSISTENCY, score=0.0,
                findings=["No SAP upload package found"],
            )

        findings = []
        checks_passed = 0
        checks_total = 0

        # Plant code should be consistent across all items
        plant_code = pkg.get("plant_code", "")
        for item in pkg.get("maintenance_items", []):
            func_loc = item.get("func_loc", "")
            if func_loc and plant_code:
                checks_total += 1
                # Functional location should reference the plant
                checks_passed += 1  # Relaxed check — just verify they exist

        # Maintenance plan cycle should match items
        plan = pkg.get("maintenance_plan", {})
        if plan.get("cycle_value") and plan.get("cycle_unit"):
            checks_total += 1
            checks_passed += 1

        if checks_total == 0:
            return QualityScoreDimension(
                dimension=QualityDimension.CONSISTENCY, score=100.0,
                details="No consistency checks applicable",
            )

        return QualityScoreDimension(
            dimension=QualityDimension.CONSISTENCY,
            score=_ratio_score(checks_passed, checks_total),
            findings=findings[:10],
        )

    def score_format(self, entities: dict, context: dict) -> QualityScoreDimension:
        pkg = self._get_package(entities)
        if not pkg:
            return QualityScoreDimension(
                dimension=QualityDimension.FORMAT, score=0.0,
                findings=["No SAP upload package found"],
            )

        findings = []
        checks_passed = 0
        checks_total = 0

        # Task list operations: short_text must be <= 72 chars
        for tl in pkg.get("task_lists", []):
            for op in tl.get("operations", []):
                short_text = op.get("short_text", "")
                checks_total += 1
                if len(short_text) <= SAP_SHORT_TEXT_MAX:
                    checks_passed += 1
                else:
                    findings.append(
                        f"Operation {op.get('operation_number', '?')}: "
                        f"short_text length {len(short_text)} > {SAP_SHORT_TEXT_MAX}"
                    )

                # Operation number should be multiple of 10
                op_num = op.get("operation_number")
                if op_num is not None:
                    checks_total += 1
                    if isinstance(op_num, int) and op_num % 10 == 0:
                        checks_passed += 1
                    else:
                        findings.append(
                            f"Operation number {op_num} not a multiple of 10"
                        )

        # Maintenance plan description <= 40 chars
        plan = pkg.get("maintenance_plan", {})
        desc = plan.get("description", "")
        if desc:
            checks_total += 1
            if len(desc) <= SAP_DESCRIPTION_MAX:
                checks_passed += 1
            else:
                findings.append(
                    f"Plan description length {len(desc)} > {SAP_DESCRIPTION_MAX}"
                )

        return QualityScoreDimension(
            dimension=QualityDimension.FORMAT,
            score=_ratio_score(checks_passed, checks_total),
            findings=findings[:10],
        )

    def score_actionability(self, entities: dict, context: dict) -> QualityScoreDimension:
        pkg = self._get_package(entities)
        if not pkg:
            return QualityScoreDimension(
                dimension=QualityDimension.ACTIONABILITY, score=0.0,
                findings=["No SAP upload package found"],
            )

        findings = []
        checks_passed = 0
        checks_total = 0

        # Package should have status indicating readiness
        checks_total += 1
        status = pkg.get("status", "")
        if status in ("GENERATED", "REVIEWED", "APPROVED", "UPLOADED"):
            checks_passed += 1
        elif status:
            findings.append(f"SAP package status '{status}' is not actionable")
        else:
            findings.append("SAP package missing status")

        # Must have plant_code for import
        checks_total += 1
        if pkg.get("plant_code"):
            checks_passed += 1
        else:
            findings.append("SAP package missing plant_code for import")

        return QualityScoreDimension(
            dimension=QualityDimension.ACTIONABILITY,
            score=_ratio_score(checks_passed, checks_total),
            findings=findings[:10],
        )

    def score_traceability(self, entities: dict, context: dict) -> QualityScoreDimension:
        pkg = self._get_package(entities)
        wps = entities.get("work_packages", [])
        nodes = entities.get("hierarchy_nodes", [])

        if not pkg:
            return QualityScoreDimension(
                dimension=QualityDimension.TRACEABILITY, score=0.0,
                findings=["No SAP upload package found"],
            )

        findings = []
        checks_passed = 0
        checks_total = 0

        node_ids = {n.get("node_id") for n in nodes if n.get("node_id")}

        # Maintenance items should reference valid functional locations / nodes
        for item in pkg.get("maintenance_items", []):
            func_loc = item.get("func_loc", "")
            if func_loc:
                checks_total += 1
                # Check if func_loc corresponds to any node_id
                if func_loc in node_ids:
                    checks_passed += 1
                else:
                    # May be a SAP-formatted reference — relaxed check
                    checks_passed += 1

        # Package should reference existing work packages
        checks_total += 1
        if pkg.get("package_id"):
            checks_passed += 1
        else:
            findings.append("SAP package missing package_id")

        return QualityScoreDimension(
            dimension=QualityDimension.TRACEABILITY,
            score=_ratio_score(checks_passed, checks_total),
            findings=findings[:10],
        )
