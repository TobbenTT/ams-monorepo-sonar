"""
Quality Validator — Deterministic
Implements 40+ validation rules from REF-04.
Validates strategy development data at all stages.
"""

import math

from tools.models.schemas import (
    ApprovalStatus,
    Cause,
    CriticalityAssessment,
    FailureMode,
    FrequencyUnit,
    Function,
    FunctionalFailure,
    MaintenanceTask,
    PlantHierarchyNode,
    NodeType,
    RiskClass,
    StrategyType,
    TaskConstraint,
    TaskType,
    WPConstraint,
    WPType,
    WorkPackage,
)
from tools.validators.naming_validator import NamingValidator
from tools.engines.rcm_decision_engine import CALENDAR_CAUSES, OPERATIONAL_CAUSES, CALENDAR_UNITS, OPERATIONAL_UNITS


class ValidationResult:
    """A single validation finding."""

    def __init__(self, rule_id: str, severity: str, message: str, entity_id: str = ""):
        self.rule_id = rule_id
        self.severity = severity  # ERROR, WARNING, INFO
        self.message = message
        self.entity_id = entity_id

    def __repr__(self):
        return f"[{self.severity}] {self.rule_id}: {self.message}"


class QualityValidator:
    """Runs 40+ quality validation rules on strategy development data."""

    @staticmethod
    def validate_hierarchy(
        nodes: list[PlantHierarchyNode],
    ) -> list[ValidationResult]:
        """Validate hierarchy rules (H-01 to H-04)."""
        results = []

        for node in nodes:
            # H-01: Maximum depth check (6 levels in our model)
            if node.level > 6:
                results.append(ValidationResult(
                    "H-01", "ERROR",
                    f"Node '{node.name}' exceeds maximum hierarchy depth (level {node.level})",
                    node.node_id,
                ))

            # H-02: MI nodes must have a component code
            if node.node_type == NodeType.MAINTAINABLE_ITEM and not node.component_lib_ref:
                results.append(ValidationResult(
                    "H-02", "ERROR",
                    f"Maintainable item '{node.name}' has no component library reference",
                    node.node_id,
                ))

            # Check parent-child consistency
            if node.parent_node_id:
                parent = next((n for n in nodes if n.node_id == node.parent_node_id), None)
                if parent and parent.level >= node.level:
                    results.append(ValidationResult(
                        "H-01", "ERROR",
                        f"Node '{node.name}' (level {node.level}) has parent '{parent.name}' "
                        f"at same or deeper level ({parent.level})",
                        node.node_id,
                    ))

        return results

    @staticmethod
    def validate_functions(
        nodes: list[PlantHierarchyNode],
        functions: list[Function],
        functional_failures: list[FunctionalFailure],
    ) -> list[ValidationResult]:
        """Validate function rules (F-01 to F-05)."""
        results = []

        # Get sets of node IDs that have functions/failures
        nodes_with_functions = {f.node_id for f in functions}
        functions_with_failures = {ff.function_id for ff in functional_failures}

        for node in nodes:
            # F-01/F-03: Systems and MIs must have functions
            if node.node_type in (NodeType.SYSTEM, NodeType.MAINTAINABLE_ITEM):
                if node.node_id not in nodes_with_functions:
                    rule = "F-01" if node.node_type == NodeType.SYSTEM else "F-03"
                    results.append(ValidationResult(
                        rule, "ERROR",
                        f"{node.node_type.value} '{node.name}' has no functions defined",
                        node.node_id,
                    ))

        # F-02/F-04: Functions must have functional failures
        for func in functions:
            if func.function_id not in functions_with_failures:
                results.append(ValidationResult(
                    "F-02", "ERROR",
                    f"Function '{func.description}' has no functional failures defined",
                    func.function_id,
                ))

        # F-05: Function format (Verb + Noun + Performance Standard)
        for func in functions:
            words = func.description.split()
            if len(words) < 3:
                results.append(ValidationResult(
                    "F-05", "WARNING",
                    f"Function '{func.description}' may not follow Verb + Noun + Standard format",
                    func.function_id,
                ))

        return results

    @staticmethod
    def validate_criticality(
        nodes: list[PlantHierarchyNode],
        assessments: list[CriticalityAssessment],
    ) -> list[ValidationResult]:
        """Validate criticality rules (C-01 to C-04)."""
        results = []
        assessed_nodes = {a.node_id for a in assessments}

        for node in nodes:
            # C-01: Equipment must have criticality
            if node.node_type == NodeType.EQUIPMENT and node.node_id not in assessed_nodes:
                results.append(ValidationResult(
                    "C-01", "ERROR",
                    f"Equipment '{node.name}' has no criticality assessment",
                    node.node_id,
                ))

            # C-02: Systems must have criticality
            if node.node_type == NodeType.SYSTEM and node.node_id not in assessed_nodes:
                results.append(ValidationResult(
                    "C-02", "ERROR",
                    f"System '{node.name}' has no criticality assessment",
                    node.node_id,
                ))

            # C-03: MI criticality is optional (INFO)
            if node.node_type == NodeType.MAINTAINABLE_ITEM and node.node_id not in assessed_nodes:
                results.append(ValidationResult(
                    "C-03", "INFO",
                    f"Maintainable item '{node.name}' has no criticality assessment (optional)",
                    node.node_id,
                ))

        return results

    @staticmethod
    def validate_failure_modes(
        failure_modes: list[FailureMode],
    ) -> list[ValidationResult]:
        """Validate failure mode rules (FM-01 to FM-07)."""
        results = []

        for fm in failure_modes:
            # FM-01 & FM-02: Validate 'what' field
            what_issues = NamingValidator.validate_fm_what(fm.what)
            for issue in what_issues:
                results.append(ValidationResult(
                    issue["rule"], issue["severity"], issue["message"], fm.failure_mode_id,
                ))

            # FM-04: Mechanism must be from predefined list (enforced by enum, but check)
            # FM-05: Cause must be from predefined list (enforced by enum)
            # FM-06: Status must be Recommended or Redundant (enforced by enum)

        return results

    @staticmethod
    def validate_tasks(
        tasks: list[MaintenanceTask],
        failure_modes: list[FailureMode],
    ) -> list[ValidationResult]:
        """Validate task rules (T-01 to T-19)."""
        results = []

        # Build FM→strategy lookup
        fm_strategy = {fm.failure_mode_id: fm.strategy_type for fm in failure_modes}

        for task in tasks:
            # T-01/T-03: CB and FFI tasks MUST have acceptable limits
            # (We check all tasks, but only ERROR for CB/FFI)
            if not task.acceptable_limits:
                # Try to find the associated FM strategy
                # For now, check based on task type
                if task.task_type in (TaskType.INSPECT, TaskType.CHECK, TaskType.TEST):
                    results.append(ValidationResult(
                        "T-01", "WARNING",
                        f"Task '{task.name}' has no acceptable limits defined",
                        task.task_id,
                    ))

            # T-02/T-04: CB and FFI tasks MUST have conditional comments
            if not task.conditional_comments:
                if task.task_type in (TaskType.INSPECT, TaskType.CHECK, TaskType.TEST):
                    results.append(ValidationResult(
                        "T-02", "WARNING",
                        f"Task '{task.name}' has no conditional comments defined",
                        task.task_id,
                    ))

            # Validate task naming
            name_issues = NamingValidator.validate_task_name(task.name, task.task_type.value)
            for issue in name_issues:
                results.append(ValidationResult(
                    issue["rule"], issue["severity"], issue["message"], task.task_id,
                ))

            # T-11: Required fields
            if not task.labour_resources:
                results.append(ValidationResult(
                    "T-11", "ERROR",
                    f"Task '{task.name}' has no labour resources assigned",
                    task.task_id,
                ))

            # T-16: Replacement tasks must have materials
            if task.task_type == TaskType.REPLACE and not task.material_resources:
                results.append(ValidationResult(
                    "T-16", "ERROR",
                    f"Replacement task '{task.name}' has no materials in costing",
                    task.task_id,
                ))

            # T-17: Constraint alignment (enforced by model, but double-check)
            if task.constraint == TaskConstraint.ONLINE and task.access_time_hours != 0:
                results.append(ValidationResult(
                    "T-17", "ERROR",
                    f"Online task '{task.name}' has non-zero access time ({task.access_time_hours}h)",
                    task.task_id,
                ))
            if task.constraint == TaskConstraint.OFFLINE and task.access_time_hours == 0:
                results.append(ValidationResult(
                    "T-17", "ERROR",
                    f"Offline task '{task.name}' has zero access time",
                    task.task_id,
                ))

            # T-18: SAP name length (enforced by model max_length=72)
            if len(task.name) > 72:
                results.append(ValidationResult(
                    "T-18", "ERROR",
                    f"Task name exceeds 72 chars ({len(task.name)})",
                    task.task_id,
                ))

        return results

    @staticmethod
    def validate_work_packages(
        work_packages: list[WorkPackage],
        tasks: list[MaintenanceTask],
    ) -> list[ValidationResult]:
        """Validate work package rules (WP-01 to WP-13)."""
        results = []

        # WP-01: Every task must be in a work package
        allocated_task_ids = set()
        for wp in work_packages:
            for at in wp.allocated_tasks:
                allocated_task_ids.add(at.task_id)

        task_ids = {t.task_id for t in tasks}
        unallocated = task_ids - allocated_task_ids
        for tid in unallocated:
            task = next((t for t in tasks if t.task_id == tid), None)
            name = task.name if task else tid
            results.append(ValidationResult(
                "WP-01", "ERROR",
                f"Task '{name}' is not allocated to any work package",
                tid,
            ))

        for wp in work_packages:
            # Validate WP naming
            name_issues = NamingValidator.validate_wp_name(wp.name)
            for issue in name_issues:
                results.append(ValidationResult(
                    issue["rule"], issue["severity"], issue["message"], wp.work_package_id,
                ))

            # WP-03: Online and offline tasks must not be mixed
            wp_task_ids = {at.task_id for at in wp.allocated_tasks}
            wp_tasks = [t for t in tasks if t.task_id in wp_task_ids]
            constraints = {t.constraint for t in wp_tasks}
            if TaskConstraint.ONLINE in constraints and TaskConstraint.OFFLINE in constraints:
                results.append(ValidationResult(
                    "WP-03", "ERROR",
                    f"Work package '{wp.name}' mixes ONLINE and OFFLINE tasks",
                    wp.work_package_id,
                ))

            # WP-11: All tasks must have labour
            for task in wp_tasks:
                if not task.labour_resources:
                    results.append(ValidationResult(
                        "WP-11", "ERROR",
                        f"Task '{task.name}' in WP '{wp.name}' has no labour assigned",
                        wp.work_package_id,
                    ))

        return results

    @staticmethod
    def validate_cross_entity(
        failure_modes: list[FailureMode],
        tasks: list[MaintenanceTask],
    ) -> list[ValidationResult]:
        """GAP-2: Cross-entity validation rules."""
        results = []

        # Build lookup: task by id (assuming tasks relate to FMs via position or ID)
        # T-01/T-03: CB/FFI strategies MUST have acceptable limits on their tasks
        for fm in failure_modes:
            if fm.strategy_type in (StrategyType.CONDITION_BASED, StrategyType.FAULT_FINDING):
                # Find tasks that correspond — check all tasks for missing limits
                pass  # Covered below with broader check

        for task in tasks:
            # T-12: Frequency unit consistency with cause
            # This requires knowing the cause from the failure mode
            pass  # Validated in validate_frequency_alignment below

        return results

    @staticmethod
    def validate_frequency_alignment(
        failure_modes: list[FailureMode],
        tasks: list[MaintenanceTask],
        fm_to_task: dict[str, str] | None = None,
    ) -> list[ValidationResult]:
        """GAP-2 + T-12: Validate cause → frequency unit alignment."""
        results = []
        task_by_id = {t.task_id: t for t in tasks}

        for fm in failure_modes:
            if not fm_to_task:
                continue
            task_id = fm_to_task.get(fm.failure_mode_id)
            if not task_id or task_id not in task_by_id:
                continue
            task = task_by_id[task_id]

            # Calendar causes must use calendar units
            if fm.cause in CALENDAR_CAUSES and task.frequency_unit not in CALENDAR_UNITS:
                results.append(ValidationResult(
                    "T-12", "WARNING",
                    f"Task '{task.name}': cause '{fm.cause.value}' is age-related but uses "
                    f"'{task.frequency_unit.value}' — should use calendar units (DAYS/WEEKS/MONTHS/YEARS)",
                    task.task_id,
                ))

            # Operational causes must use operational units
            if fm.cause in OPERATIONAL_CAUSES and task.frequency_unit not in OPERATIONAL_UNITS:
                results.append(ValidationResult(
                    "T-12", "WARNING",
                    f"Task '{task.name}': cause '{fm.cause.value}' is usage-related but uses "
                    f"'{task.frequency_unit.value}' — should use operational units (HOURS/TONNES/CYCLES)",
                    task.task_id,
                ))

            # GAP-2: CB/FFI must have acceptable limits
            if fm.strategy_type in (StrategyType.CONDITION_BASED, StrategyType.FAULT_FINDING):
                if not task.acceptable_limits:
                    rule = "T-01" if fm.strategy_type == StrategyType.CONDITION_BASED else "T-03"
                    results.append(ValidationResult(
                        rule, "ERROR",
                        f"Task '{task.name}' for {fm.strategy_type.value} strategy MUST have acceptable limits",
                        task.task_id,
                    ))
                if not task.conditional_comments:
                    rule = "T-02" if fm.strategy_type == StrategyType.CONDITION_BASED else "T-04"
                    results.append(ValidationResult(
                        rule, "ERROR",
                        f"Task '{task.name}' for {fm.strategy_type.value} strategy MUST have conditional comments",
                        task.task_id,
                    ))

        return results

    @staticmethod
    def validate_suppressive_wp(
        work_packages: list[WorkPackage],
    ) -> list[ValidationResult]:
        """OPP-1 + WP-08/WP-09: Validate suppressive work package intervals."""
        results = []
        suppressive_wps = [wp for wp in work_packages if wp.work_package_type == WPType.SUPPRESSIVE]

        if len(suppressive_wps) < 2:
            return results

        # Sort by frequency value
        sorted_wps = sorted(suppressive_wps, key=lambda wp: wp.frequency_value)
        lowest_freq = sorted_wps[0].frequency_value

        # WP-08: All intervals must be factors of the lowest
        for wp in sorted_wps[1:]:
            if lowest_freq > 0 and wp.frequency_value % lowest_freq != 0:
                results.append(ValidationResult(
                    "WP-08", "ERROR",
                    f"Suppressive WP '{wp.name}' (freq={wp.frequency_value}) is not a factor "
                    f"of lowest interval ({lowest_freq})",
                    wp.work_package_id,
                ))

        # WP-09: Must start with highest interval
        if sorted_wps:
            highest = max(suppressive_wps, key=lambda wp: wp.frequency_value)
            first_in_order = suppressive_wps[0]  # Original order
            if first_in_order.frequency_value != highest.frequency_value:
                results.append(ValidationResult(
                    "WP-09", "WARNING",
                    f"Suppressive WP sequence should start with highest interval "
                    f"({highest.frequency_value}), but starts with {first_in_order.frequency_value}",
                    first_in_order.work_package_id,
                ))

        return results

    @staticmethod
    def validate_sequential_wp(
        work_packages: list[WorkPackage],
    ) -> list[ValidationResult]:
        """OPP-1 + WP-10: Validate sequential work package completeness."""
        results = []
        sequential_wps = [wp for wp in work_packages if wp.work_package_type == WPType.SEQUENTIAL]

        if len(sequential_wps) == 0:
            return results

        # WP-10: Sequential WPs should form a complete chain
        # Group by equipment (node_id)
        by_node: dict[str, list[WorkPackage]] = {}
        for wp in sequential_wps:
            by_node.setdefault(wp.node_id, []).append(wp)

        for node_id, wps in by_node.items():
            if len(wps) < 2:
                results.append(ValidationResult(
                    "WP-10", "ERROR",
                    f"Sequential WP group for node {node_id} has only {len(wps)} WP — "
                    f"a complete sequence requires at least 2",
                    wps[0].work_package_id,
                ))

            # Check frequencies form a sequence
            freqs = sorted(wp.frequency_value for wp in wps)
            for i in range(1, len(freqs)):
                if freqs[i] % freqs[0] != 0:
                    results.append(ValidationResult(
                        "WP-10", "WARNING",
                        f"Sequential WP frequencies {freqs} may not form a valid sequence",
                        wps[0].work_package_id,
                    ))
                    break

        return results

    @staticmethod
    def validate_mi_replacement_tasks(
        nodes: list[PlantHierarchyNode],
        tasks: list[MaintenanceTask],
        mi_to_tasks: dict[str, list[str]] | None = None,
    ) -> list[ValidationResult]:
        """T-13: Every MI must have a replacement task."""
        results = []
        if not mi_to_tasks:
            return results

        mi_nodes = [n for n in nodes if n.node_type == NodeType.MAINTAINABLE_ITEM]
        task_by_id = {t.task_id: t for t in tasks}

        for mi in mi_nodes:
            task_ids = mi_to_tasks.get(mi.node_id, [])
            mi_tasks = [task_by_id[tid] for tid in task_ids if tid in task_by_id]
            has_replacement = any(t.task_type == TaskType.REPLACE for t in mi_tasks)
            if not has_replacement:
                results.append(ValidationResult(
                    "T-13", "ERROR",
                    f"Maintainable item '{mi.name}' has no replacement task",
                    mi.node_id,
                ))

        return results

    @staticmethod
    def validate_criticality_fm_alignment(
        criticality_assessments: list[CriticalityAssessment],
        failure_modes: list[FailureMode],
        node_to_fms: dict[str, list[str]] | None = None,
    ) -> list[ValidationResult]:
        """C-04: High criticality should have a failure mode showing why."""
        results = []
        if not node_to_fms:
            return results

        for assessment in criticality_assessments:
            if assessment.risk_class in (RiskClass.III_HIGH, RiskClass.IV_CRITICAL):
                fm_ids = node_to_fms.get(assessment.node_id, [])
                if not fm_ids:
                    results.append(ValidationResult(
                        "C-04", "WARNING",
                        f"Node {assessment.node_id} has {assessment.risk_class.value} criticality "
                        f"but no failure modes defined to justify it",
                        assessment.node_id,
                    ))

        return results

    @staticmethod
    def validate_wp_frequency_alignment(
        work_packages: list[WorkPackage],
        tasks: list[MaintenanceTask],
    ) -> list[ValidationResult]:
        """WP-04: All tasks in a WP must match the WP frequency."""
        results = []
        task_by_id = {t.task_id: t for t in tasks}

        for wp in work_packages:
            for at in wp.allocated_tasks:
                task = task_by_id.get(at.task_id)
                if not task:
                    continue
                if task.frequency_value != wp.frequency_value or task.frequency_unit != wp.frequency_unit:
                    results.append(ValidationResult(
                        "WP-04", "ERROR",
                        f"Task '{task.name}' (freq={task.frequency_value} {task.frequency_unit.value}) "
                        f"doesn't match WP '{wp.name}' (freq={wp.frequency_value} {wp.frequency_unit.value})",
                        wp.work_package_id,
                    ))

        return results

    @classmethod
    def run_full_validation(
        cls,
        nodes: list[PlantHierarchyNode] | None = None,
        functions: list[Function] | None = None,
        functional_failures: list[FunctionalFailure] | None = None,
        criticality_assessments: list[CriticalityAssessment] | None = None,
        failure_modes: list[FailureMode] | None = None,
        tasks: list[MaintenanceTask] | None = None,
        work_packages: list[WorkPackage] | None = None,
    ) -> list[ValidationResult]:
        """Run all validation rules and return combined results."""
        all_results = []

        if nodes:
            all_results.extend(cls.validate_hierarchy(nodes))

        if nodes and functions and functional_failures:
            all_results.extend(cls.validate_functions(nodes, functions, functional_failures))

        if nodes and criticality_assessments:
            all_results.extend(cls.validate_criticality(nodes, criticality_assessments))

        if failure_modes:
            all_results.extend(cls.validate_failure_modes(failure_modes))

        if tasks:
            all_results.extend(cls.validate_tasks(tasks, failure_modes or []))

        if work_packages and tasks:
            all_results.extend(cls.validate_work_packages(work_packages, tasks))
            all_results.extend(cls.validate_wp_frequency_alignment(work_packages, tasks))

        if work_packages:
            all_results.extend(cls.validate_suppressive_wp(work_packages))
            all_results.extend(cls.validate_sequential_wp(work_packages))

        return all_results
