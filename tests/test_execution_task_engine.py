"""Tests for Execution Task Engine — Phase 7 (G6)."""

from tools.engines.execution_task_engine import (
    ExecutionTaskEngine,
    LOTO_APPLICATION_CHECKLIST,
    LOTO_REMOVAL_CHECKLIST,
    SCAFFOLDING_CHECKLIST,
    SCAFFOLDING_HOURS_BY_HEIGHT,
)
from tools.models.schemas import (
    SupportTaskType,
    SupportTaskStatus,
    ExecutionSequence,
)


def _basic_tasks():
    return [
        {"task_id": "T-1", "task_type": "LOTO", "description": "LOTO application", "estimated_hours": 0.5},
        {"task_id": "T-2", "task_type": "GUARD_REMOVAL", "description": "Guard removal", "estimated_hours": 0.5},
        {"task_id": "T-3", "task_type": "CLEANING", "description": "Post-cleaning", "estimated_hours": 0.5},
        {"task_id": "T-4", "task_type": "COMMISSIONING", "description": "Commissioning", "estimated_hours": 0.5},
    ]


class TestBuildExecutionSequence:

    def test_basic_sequence(self):
        result = ExecutionTaskEngine.build_execution_sequence("PKG-1", _basic_tasks())
        assert isinstance(result, ExecutionSequence)
        assert result.package_id == "PKG-1"
        assert len(result.tasks) == 4

    def test_tasks_ordered(self):
        result = ExecutionTaskEngine.build_execution_sequence("PKG-1", _basic_tasks())
        orders = [t.sequence_order for t in result.tasks]
        assert orders == sorted(orders)

    def test_loto_before_guard_removal(self):
        result = ExecutionTaskEngine.build_execution_sequence("PKG-1", _basic_tasks())
        loto = next(t for t in result.tasks if t.task_type == SupportTaskType.LOTO)
        guard = next(t for t in result.tasks if t.task_type == SupportTaskType.GUARD_REMOVAL)
        assert loto.sequence_order < guard.sequence_order

    def test_cleaning_before_commissioning(self):
        tasks = [
            {"task_id": "T-1", "task_type": "CLEANING", "estimated_hours": 0.5},
            {"task_id": "T-2", "task_type": "COMMISSIONING", "estimated_hours": 0.5},
        ]
        result = ExecutionTaskEngine.build_execution_sequence("PKG-2", tasks)
        cleaning = next(t for t in result.tasks if t.task_type == SupportTaskType.CLEANING)
        comm = next(t for t in result.tasks if t.task_type == SupportTaskType.COMMISSIONING)
        assert cleaning.sequence_order < comm.sequence_order

    def test_dependencies_created(self):
        result = ExecutionTaskEngine.build_execution_sequence("PKG-1", _basic_tasks())
        assert len(result.dependencies) > 0
        loto_dep = next(
            (d for d in result.dependencies if d.from_task_id == "T-1" and d.to_task_id == "T-2"),
            None,
        )
        assert loto_dep is not None

    def test_safety_checklists_assigned(self):
        result = ExecutionTaskEngine.build_execution_sequence("PKG-1", _basic_tasks())
        loto = next(t for t in result.tasks if t.task_type == SupportTaskType.LOTO)
        assert len(loto.safety_checklist) == len(LOTO_APPLICATION_CHECKLIST)

    def test_pre_post_hours(self):
        result = ExecutionTaskEngine.build_execution_sequence("PKG-1", _basic_tasks())
        assert result.total_pre_hours > 0
        assert result.total_post_hours > 0

    def test_critical_path(self):
        result = ExecutionTaskEngine.build_execution_sequence("PKG-1", _basic_tasks())
        assert result.critical_path_hours > 0

    def test_shutdown_warning_without_loto(self):
        tasks = [{"task_id": "T-1", "task_type": "CRANE", "estimated_hours": 1.0}]
        result = ExecutionTaskEngine.build_execution_sequence(
            "PKG-3", tasks, package_attributes={"shutdown_required": True},
        )
        assert len(result.warnings) > 0
        assert "LOTO" in result.warnings[0]

    def test_no_warning_with_loto(self):
        tasks = [
            {"task_id": "T-1", "task_type": "LOTO", "estimated_hours": 0.5},
            {"task_id": "T-2", "task_type": "CRANE", "estimated_hours": 1.0},
        ]
        result = ExecutionTaskEngine.build_execution_sequence(
            "PKG-4", tasks, package_attributes={"shutdown_required": True},
        )
        assert len(result.warnings) == 0

    def test_empty_tasks(self):
        result = ExecutionTaskEngine.build_execution_sequence("PKG-5", [])
        assert len(result.tasks) == 0
        assert result.critical_path_hours == 0.0

    def test_auto_task_id(self):
        tasks = [{"task_type": "LOTO", "estimated_hours": 0.5}]
        result = ExecutionTaskEngine.build_execution_sequence("PKG-6", tasks)
        assert result.tasks[0].task_id.startswith("T-")

    def test_task_status_pending(self):
        result = ExecutionTaskEngine.build_execution_sequence("PKG-1", _basic_tasks())
        for t in result.tasks:
            assert t.status == SupportTaskStatus.PENDING


class TestScaffoldingDuration:

    def test_low_elevation(self):
        tasks = [{"task_id": "T-1", "task_type": "SCAFFOLDING", "estimated_hours": 0.5}]
        result = ExecutionTaskEngine.build_execution_sequence(
            "PKG-S1", tasks, package_attributes={"elevation_meters": 2},
        )
        assert result.tasks[0].estimated_hours == SCAFFOLDING_HOURS_BY_HEIGHT["LOW"]

    def test_medium_elevation(self):
        tasks = [{"task_id": "T-1", "task_type": "SCAFFOLDING", "estimated_hours": 0.5}]
        result = ExecutionTaskEngine.build_execution_sequence(
            "PKG-S2", tasks, package_attributes={"elevation_meters": 5},
        )
        assert result.tasks[0].estimated_hours == SCAFFOLDING_HOURS_BY_HEIGHT["MEDIUM"]

    def test_high_elevation(self):
        tasks = [{"task_id": "T-1", "task_type": "SCAFFOLDING", "estimated_hours": 0.5}]
        result = ExecutionTaskEngine.build_execution_sequence(
            "PKG-S3", tasks, package_attributes={"elevation_meters": 10},
        )
        assert result.tasks[0].estimated_hours == SCAFFOLDING_HOURS_BY_HEIGHT["HIGH"]

    def test_very_high_elevation(self):
        tasks = [{"task_id": "T-1", "task_type": "SCAFFOLDING", "estimated_hours": 0.5}]
        result = ExecutionTaskEngine.build_execution_sequence(
            "PKG-S4", tasks, package_attributes={"elevation_meters": 15},
        )
        assert result.tasks[0].estimated_hours == SCAFFOLDING_HOURS_BY_HEIGHT["VERY_HIGH"]

    def test_no_elevation_keeps_original(self):
        tasks = [{"task_id": "T-1", "task_type": "SCAFFOLDING", "estimated_hours": 1.5}]
        result = ExecutionTaskEngine.build_execution_sequence("PKG-S5", tasks)
        assert result.tasks[0].estimated_hours == 1.5

    def test_scaffolding_checklist(self):
        tasks = [{"task_id": "T-1", "task_type": "SCAFFOLDING", "estimated_hours": 1.0}]
        result = ExecutionTaskEngine.build_execution_sequence("PKG-S6", tasks)
        assert len(result.tasks[0].safety_checklist) == len(SCAFFOLDING_CHECKLIST)


class TestLOTORemovalChecklist:

    def test_loto_removal_checklist(self):
        checklist = ExecutionTaskEngine.get_loto_removal_checklist()
        assert len(checklist) == 8
        assert "Remove lockout/tagout devices" in checklist[2]

    def test_returns_copy(self):
        c1 = ExecutionTaskEngine.get_loto_removal_checklist()
        c2 = ExecutionTaskEngine.get_loto_removal_checklist()
        assert c1 is not c2
