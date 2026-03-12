"""Work package quality scoring strategy.

Scores work packages across 7 quality dimensions.
Checks: naming conventions, task allocation, constraint consistency, 7 mandatory elements.
"""

from __future__ import annotations

from tools.models.schemas import QualityDimension, QualityScoreDimension
from tools.engines.scoring_strategies.base import ScorerStrategy, _ratio_score

MAX_WP_NAME_LENGTH = 40


class WorkPackageScorer(ScorerStrategy):
    """Quality scoring for work package deliverables."""

    DELIVERABLE_TYPE = "work_packages"

    def score_technical_accuracy(self, entities: dict, context: dict) -> QualityScoreDimension:
        wps = entities.get("work_packages", [])
        if not wps:
            return QualityScoreDimension(
                dimension=QualityDimension.TECHNICAL_ACCURACY, score=0.0,
                findings=["No work packages found"],
            )

        findings = []
        checks_passed = 0
        checks_total = 0

        for wp in wps:
            # No ONLINE/OFFLINE mixing within a WP
            allocated = wp.get("allocated_tasks", [])
            tasks_data = entities.get("maintenance_tasks", [])
            task_by_id = {t.get("task_id"): t for t in tasks_data if t.get("task_id")}

            constraints_in_wp = set()
            for at in allocated:
                task = task_by_id.get(at.get("task_id"), {})
                c = task.get("constraint", "")
                if c:
                    constraints_in_wp.add(c)

            checks_total += 1
            if len(constraints_in_wp) <= 1:
                checks_passed += 1
            else:
                findings.append(
                    f"WP '{wp.get('name', '?')}': mixed constraints {constraints_in_wp}"
                )

            # Frequency must be positive
            checks_total += 1
            freq = wp.get("frequency_value")
            if isinstance(freq, (int, float)) and freq > 0:
                checks_passed += 1
            else:
                findings.append(
                    f"WP '{wp.get('name', '?')}': invalid frequency {freq}"
                )

        return QualityScoreDimension(
            dimension=QualityDimension.TECHNICAL_ACCURACY,
            score=_ratio_score(checks_passed, checks_total),
            findings=findings[:10],
        )

    def score_completeness(self, entities: dict, context: dict) -> QualityScoreDimension:
        wps = entities.get("work_packages", [])
        tasks = entities.get("maintenance_tasks", [])

        if not wps:
            return QualityScoreDimension(
                dimension=QualityDimension.COMPLETENESS, score=0.0,
                findings=["No work packages found"],
            )

        findings = []
        checks_passed = 0
        checks_total = 0

        # Every task should be allocated to at least one WP
        allocated_task_ids = set()
        for wp in wps:
            for at in wp.get("allocated_tasks", []):
                tid = at.get("task_id")
                if tid:
                    allocated_task_ids.add(tid)

        for task in tasks:
            tid = task.get("task_id")
            if tid:
                checks_total += 1
                if tid in allocated_task_ids:
                    checks_passed += 1
                else:
                    findings.append(
                        f"Task '{task.get('name', '?')}' not allocated to any WP"
                    )

        # Each WP should have allocated_tasks
        for wp in wps:
            checks_total += 1
            if wp.get("allocated_tasks"):
                checks_passed += 1
            else:
                findings.append(
                    f"WP '{wp.get('name', '?')}' has no allocated tasks"
                )

            # WP should have constraint, frequency_unit, node_id
            for field in ("constraint", "frequency_unit", "node_id"):
                checks_total += 1
                if wp.get(field):
                    checks_passed += 1
                else:
                    findings.append(f"WP '{wp.get('name', '?')}' missing {field}")

        return QualityScoreDimension(
            dimension=QualityDimension.COMPLETENESS,
            score=_ratio_score(checks_passed, checks_total),
            findings=findings[:10],
        )

    def score_consistency(self, entities: dict, context: dict) -> QualityScoreDimension:
        wps = entities.get("work_packages", [])
        if not wps:
            return QualityScoreDimension(
                dimension=QualityDimension.CONSISTENCY, score=0.0,
                findings=["No work packages found"],
            )

        findings = []
        checks_passed = 0
        checks_total = 0

        tasks_data = entities.get("maintenance_tasks", [])
        task_by_id = {t.get("task_id"): t for t in tasks_data if t.get("task_id")}

        for wp in wps:
            # WP constraint should match all contained task constraints
            wp_constraint = wp.get("constraint", "")
            allocated = wp.get("allocated_tasks", [])
            for at in allocated:
                task = task_by_id.get(at.get("task_id"), {})
                task_constraint = task.get("constraint", "")
                if task_constraint and wp_constraint:
                    checks_total += 1
                    if task_constraint == wp_constraint:
                        checks_passed += 1
                    else:
                        findings.append(
                            f"WP '{wp.get('name', '?')}' constraint={wp_constraint} "
                            f"but task '{task.get('name', '?')}' is {task_constraint}"
                        )

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
        wps = entities.get("work_packages", [])
        if not wps:
            return QualityScoreDimension(
                dimension=QualityDimension.FORMAT, score=0.0,
                findings=["No work packages found"],
            )

        findings = []
        checks_passed = 0
        checks_total = 0

        for wp in wps:
            name = wp.get("name", "")

            # Name must be <= 40 chars
            checks_total += 1
            if 1 <= len(name) <= MAX_WP_NAME_LENGTH:
                checks_passed += 1
            else:
                findings.append(
                    f"WP name '{name[:30]}...' length {len(name)} "
                    f"exceeds {MAX_WP_NAME_LENGTH} char limit"
                )

            # Name must be ALL CAPS
            checks_total += 1
            if name and name == name.upper():
                checks_passed += 1
            elif name:
                findings.append(f"WP name '{name}' not ALL CAPS")
            else:
                findings.append("WP has empty name")

            # work_package_id present
            checks_total += 1
            if wp.get("work_package_id"):
                checks_passed += 1
            else:
                findings.append(f"WP '{name}' missing work_package_id")

            # Operation numbers should be multiples of 10
            for at in wp.get("allocated_tasks", []):
                op_num = at.get("operation_number")
                if op_num is not None:
                    checks_total += 1
                    if isinstance(op_num, int) and op_num % 10 == 0:
                        checks_passed += 1
                    else:
                        findings.append(
                            f"WP '{name}': operation_number {op_num} "
                            f"not a multiple of 10"
                        )

        return QualityScoreDimension(
            dimension=QualityDimension.FORMAT,
            score=_ratio_score(checks_passed, checks_total),
            findings=findings[:10],
        )

    def score_actionability(self, entities: dict, context: dict) -> QualityScoreDimension:
        wps = entities.get("work_packages", [])
        if not wps:
            return QualityScoreDimension(
                dimension=QualityDimension.ACTIONABILITY, score=0.0,
                findings=["No work packages found"],
            )

        findings = []
        checks_passed = 0
        checks_total = 0

        for wp in wps:
            # Must have frequency, constraint, and node_id for execution
            checks_total += 1
            has_freq = bool(wp.get("frequency_value"))
            has_constraint = bool(wp.get("constraint"))
            has_node = bool(wp.get("node_id"))
            if has_freq and has_constraint and has_node:
                checks_passed += 1
            else:
                missing = []
                if not has_freq:
                    missing.append("frequency")
                if not has_constraint:
                    missing.append("constraint")
                if not has_node:
                    missing.append("node_id")
                findings.append(
                    f"WP '{wp.get('name', '?')}': missing {', '.join(missing)}"
                )

        return QualityScoreDimension(
            dimension=QualityDimension.ACTIONABILITY,
            score=_ratio_score(checks_passed, checks_total),
            findings=findings[:10],
        )

    def score_traceability(self, entities: dict, context: dict) -> QualityScoreDimension:
        wps = entities.get("work_packages", [])
        tasks = entities.get("maintenance_tasks", [])
        nodes = entities.get("hierarchy_nodes", [])

        if not wps:
            return QualityScoreDimension(
                dimension=QualityDimension.TRACEABILITY, score=0.0,
                findings=["No work packages found"],
            )

        findings = []
        checks_passed = 0
        checks_total = 0

        task_ids = {t.get("task_id") for t in tasks if t.get("task_id")}
        node_ids = {n.get("node_id") for n in nodes if n.get("node_id")}

        for wp in wps:
            # node_id should reference a valid hierarchy node
            checks_total += 1
            nid = wp.get("node_id")
            if nid and nid in node_ids:
                checks_passed += 1
            elif nid:
                findings.append(
                    f"WP '{wp.get('name', '?')}': references non-existent node {nid}"
                )
            else:
                findings.append(f"WP '{wp.get('name', '?')}': missing node_id")

            # All allocated_tasks should reference valid tasks
            for at in wp.get("allocated_tasks", []):
                checks_total += 1
                tid = at.get("task_id")
                if tid and tid in task_ids:
                    checks_passed += 1
                elif tid:
                    findings.append(
                        f"WP '{wp.get('name', '?')}': "
                        f"references non-existent task {tid}"
                    )

        return QualityScoreDimension(
            dimension=QualityDimension.TRACEABILITY,
            score=_ratio_score(checks_passed, checks_total),
            findings=findings[:10],
        )
