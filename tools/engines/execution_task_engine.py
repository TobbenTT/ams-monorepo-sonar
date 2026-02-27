"""Execution Task Engine — G6 Gap Closure (Phase 7).

Builds ordered execution sequences with dependency resolution,
smart duration estimation, and safety checklists for support tasks.

Uses Kahn's algorithm for topological sorting.

Deterministic — no LLM required.
"""

from collections import defaultdict, deque

from tools.models.schemas import (
    SupportTaskType,
    SupportTaskStatus,
    TaskDependency,
    ExecutionTask,
    ExecutionSequence,
)


# Safety checklists per task type
LOTO_APPLICATION_CHECKLIST = [
    "Notify all affected personnel",
    "Identify all energy sources",
    "Shut down equipment using normal procedure",
    "Isolate all energy sources",
    "Apply lockout/tagout devices",
    "Verify zero energy state",
    "Document LOTO application",
    "Get supervisor sign-off",
]

LOTO_REMOVAL_CHECKLIST = [
    "Verify all tools and materials removed",
    "Verify all personnel clear of equipment",
    "Remove lockout/tagout devices (only by original applicator)",
    "Restore energy sources in sequence",
    "Verify equipment operates correctly",
    "Notify all affected personnel of re-energization",
    "Document LOTO removal",
    "Get supervisor sign-off on restoration",
]

SCAFFOLDING_CHECKLIST = [
    "Verify ground conditions and base plates",
    "Inspect all scaffold components before assembly",
    "Install guard rails and toe boards",
    "Attach scaffold tag (GREEN = safe to use)",
    "Verify load capacity for planned work",
]

CRANE_CHECKLIST = [
    "Verify crane certification is current",
    "Check load chart for planned lift weight",
    "Inspect rigging and slings",
    "Establish exclusion zone",
    "Confirm signal person assigned",
]

GUARD_REMOVAL_CHECKLIST = [
    "Verify LOTO is in place before guard removal",
    "Tag removed guards with work order number",
    "Store guards safely in designated area",
    "Document guard condition during removal",
]

COMMISSIONING_CHECKLIST = [
    "Verify all guards reinstalled",
    "Confirm LOTO fully removed",
    "Check alignment and torque values",
    "Perform function test",
    "Document commissioning results",
]

_SAFETY_CHECKLISTS = {
    SupportTaskType.LOTO: LOTO_APPLICATION_CHECKLIST,
    SupportTaskType.SCAFFOLDING: SCAFFOLDING_CHECKLIST,
    SupportTaskType.CRANE: CRANE_CHECKLIST,
    SupportTaskType.GUARD_REMOVAL: GUARD_REMOVAL_CHECKLIST,
    SupportTaskType.COMMISSIONING: COMMISSIONING_CHECKLIST,
}

# Scaffolding hours by elevation
SCAFFOLDING_HOURS_BY_HEIGHT = {
    "LOW": 1.0,       # < 3m
    "MEDIUM": 2.0,    # 3-6m
    "HIGH": 4.0,      # 6-12m
    "VERY_HIGH": 6.0, # > 12m
}

# Dependency rules: task type → must come before these types
DEPENDENCY_RULES: dict[SupportTaskType, list[SupportTaskType]] = {
    SupportTaskType.LOTO: [
        SupportTaskType.GUARD_REMOVAL,
        SupportTaskType.SCAFFOLDING,
        SupportTaskType.CRANE,
        SupportTaskType.MANLIFT,
    ],
    SupportTaskType.CLEANING: [SupportTaskType.COMMISSIONING],
}

# Pre-execution task types
PRE_EXECUTION_TYPES = {
    SupportTaskType.LOTO,
    SupportTaskType.SCAFFOLDING,
    SupportTaskType.CRANE,
    SupportTaskType.MANLIFT,
    SupportTaskType.GUARD_REMOVAL,
}


class ExecutionTaskEngine:
    """Builds execution sequences with dependencies and safety checklists."""

    @staticmethod
    def build_execution_sequence(
        package_id: str,
        support_tasks: list[dict],
        package_attributes: dict | None = None,
    ) -> ExecutionSequence:
        """Build an ordered execution sequence from support task data.

        Args:
            package_id: Work package identifier.
            support_tasks: List of dicts with keys:
                task_id, task_type (SupportTaskType value), description,
                estimated_hours, is_pre_execution (optional)
            package_attributes: Optional dict with keys:
                elevation_meters, shutdown_required

        Returns:
            ExecutionSequence with ordered tasks and dependencies.
        """
        package_attributes = package_attributes or {}
        tasks: list[ExecutionTask] = []
        task_type_map: dict[SupportTaskType, str] = {}

        for st in support_tasks:
            task_id = st.get("task_id", f"T-{len(tasks)+1}")
            try:
                task_type = SupportTaskType(st.get("task_type", "CLEANING"))
            except ValueError:
                task_type = SupportTaskType.CLEANING

            hours = st.get("estimated_hours", 0.5)
            if task_type == SupportTaskType.SCAFFOLDING:
                elevation = package_attributes.get("elevation_meters", 0)
                if elevation > 12:
                    hours = SCAFFOLDING_HOURS_BY_HEIGHT["VERY_HIGH"]
                elif elevation > 6:
                    hours = SCAFFOLDING_HOURS_BY_HEIGHT["HIGH"]
                elif elevation > 3:
                    hours = SCAFFOLDING_HOURS_BY_HEIGHT["MEDIUM"]
                elif elevation > 0:
                    hours = SCAFFOLDING_HOURS_BY_HEIGHT["LOW"]

            is_pre = st.get("is_pre_execution", task_type in PRE_EXECUTION_TYPES)
            checklist = ExecutionTaskEngine._get_safety_checklist(task_type)

            task = ExecutionTask(
                task_id=task_id,
                task_type=task_type,
                description=st.get("description", f"{task_type.value} task"),
                estimated_hours=hours,
                status=SupportTaskStatus.PENDING,
                is_pre_execution=is_pre,
                safety_checklist=checklist,
            )
            tasks.append(task)
            task_type_map[task_type] = task_id

        # Build dependencies from DEPENDENCY_RULES
        dependencies: list[TaskDependency] = []
        for predecessor_type, successor_types in DEPENDENCY_RULES.items():
            if predecessor_type not in task_type_map:
                continue
            pred_id = task_type_map[predecessor_type]
            for succ_type in successor_types:
                if succ_type in task_type_map:
                    dependencies.append(TaskDependency(
                        from_task_id=pred_id,
                        to_task_id=task_type_map[succ_type],
                    ))
                    # Add predecessor to task
                    for t in tasks:
                        if t.task_id == task_type_map[succ_type]:
                            if pred_id not in t.predecessors:
                                t.predecessors.append(pred_id)

        # Topological sort
        tasks = ExecutionTaskEngine._topological_sort(tasks, dependencies)

        # Calculate hours
        pre_hours = sum(t.estimated_hours for t in tasks if t.is_pre_execution)
        post_hours = sum(t.estimated_hours for t in tasks if not t.is_pre_execution)
        critical_path = ExecutionTaskEngine._calculate_critical_path(tasks, dependencies)

        # Warnings
        warnings: list[str] = []
        shutdown_required = package_attributes.get("shutdown_required", False)
        has_loto = SupportTaskType.LOTO in task_type_map
        if shutdown_required and not has_loto:
            warnings.append("Package requires shutdown but no LOTO task included")

        return ExecutionSequence(
            package_id=package_id,
            tasks=tasks,
            dependencies=dependencies,
            total_pre_hours=round(pre_hours, 2),
            total_post_hours=round(post_hours, 2),
            critical_path_hours=round(critical_path, 2),
            warnings=warnings,
        )

    @staticmethod
    def get_loto_removal_checklist() -> list[str]:
        """Return the LOTO removal safety checklist."""
        return list(LOTO_REMOVAL_CHECKLIST)

    @staticmethod
    def _get_safety_checklist(task_type: SupportTaskType, is_removal: bool = False) -> list[str]:
        """Get safety checklist for a task type."""
        if task_type == SupportTaskType.LOTO and is_removal:
            return list(LOTO_REMOVAL_CHECKLIST)
        return list(_SAFETY_CHECKLISTS.get(task_type, []))

    @staticmethod
    def _topological_sort(
        tasks: list[ExecutionTask],
        dependencies: list[TaskDependency],
    ) -> list[ExecutionTask]:
        """Kahn's algorithm for topological ordering."""
        if not tasks:
            return tasks

        task_map = {t.task_id: t for t in tasks}
        in_degree: dict[str, int] = defaultdict(int)
        adj: dict[str, list[str]] = defaultdict(list)

        for t in tasks:
            in_degree.setdefault(t.task_id, 0)

        for dep in dependencies:
            adj[dep.from_task_id].append(dep.to_task_id)
            in_degree[dep.to_task_id] += 1

        queue: deque[str] = deque()
        for tid in in_degree:
            if in_degree[tid] == 0 and tid in task_map:
                queue.append(tid)

        ordered: list[ExecutionTask] = []
        order_idx = 1
        while queue:
            tid = queue.popleft()
            if tid in task_map:
                task_map[tid].sequence_order = order_idx
                ordered.append(task_map[tid])
                order_idx += 1
            for neighbor in adj.get(tid, []):
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)

        # Add any remaining tasks not in the dependency graph
        ordered_ids = {t.task_id for t in ordered}
        for t in tasks:
            if t.task_id not in ordered_ids:
                t.sequence_order = order_idx
                ordered.append(t)
                order_idx += 1

        return ordered

    @staticmethod
    def _calculate_critical_path(
        tasks: list[ExecutionTask],
        dependencies: list[TaskDependency],
    ) -> float:
        """Forward pass: calculate longest path duration."""
        if not tasks:
            return 0.0

        task_map = {t.task_id: t for t in tasks}
        earliest_finish: dict[str, float] = {}

        adj: dict[str, list[str]] = defaultdict(list)
        for dep in dependencies:
            adj[dep.from_task_id].append(dep.to_task_id)

        # Process in sequence order
        sorted_tasks = sorted(tasks, key=lambda t: t.sequence_order)
        for t in sorted_tasks:
            pred_max = 0.0
            for pred_id in t.predecessors:
                if pred_id in earliest_finish:
                    pred_max = max(pred_max, earliest_finish[pred_id])
            earliest_finish[t.task_id] = pred_max + t.estimated_hours

        return max(earliest_finish.values()) if earliest_finish else 0.0
