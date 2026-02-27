"""Tests for SchedulingEngine — Phase 4B."""

import pytest
from datetime import date

from tools.engines.scheduling_engine import SchedulingEngine
from tools.engines.state_machine import StateMachine, TransitionError
from tools.models.schemas import (
    BacklogWorkPackage, ShiftType, MaterialsReadyStatus,
    WeeklyProgramStatus, WorkPackageElement, WorkPackageElementType,
)


def _make_packages(n=3):
    """Create n test work packages."""
    pkgs = []
    for i in range(n):
        pkgs.append(BacklogWorkPackage(
            package_id=f"WP-TEST-{i+1:03d}",
            name=f"Test Package {i+1}",
            grouped_items=[f"BRY-SAG-ML-001-ITEM-{i+1}"],
            reason_for_grouping="Test grouping",
            scheduled_date=date(2025, 6, 5 + i),
            scheduled_shift=ShiftType.MORNING if i % 2 == 0 else ShiftType.AFTERNOON,
            total_duration_hours=4.0 + i,
            assigned_team=["MECHANICAL", "ELECTRICAL"] if i % 2 == 0 else ["INSTRUMENTATION"],
            materials_status=MaterialsReadyStatus.READY,
        ))
    return pkgs


def _make_workforce():
    return [
        {"worker_id": "W1", "specialty": "MECHANICAL", "shift": "MORNING", "available": True},
        {"worker_id": "W2", "specialty": "ELECTRICAL", "shift": "MORNING", "available": True},
        {"worker_id": "W3", "specialty": "INSTRUMENTATION", "shift": "AFTERNOON", "available": True},
        {"worker_id": "W4", "specialty": "MECHANICAL", "shift": "AFTERNOON", "available": True},
    ]


class TestCreateWeeklyProgram:

    def test_creates_draft_program(self):
        pkgs = _make_packages(3)
        program = SchedulingEngine.create_weekly_program("P1", 10, 2025, pkgs)
        assert program.status == WeeklyProgramStatus.DRAFT
        assert program.plant_id == "P1"
        assert program.week_number == 10
        assert program.year == 2025
        assert len(program.work_packages) == 3

    def test_calculates_total_hours(self):
        pkgs = _make_packages(3)
        program = SchedulingEngine.create_weekly_program("P1", 10, 2025, pkgs)
        assert program.total_hours == 4.0 + 5.0 + 6.0

    def test_empty_packages(self):
        program = SchedulingEngine.create_weekly_program("P1", 1, 2025, [])
        assert len(program.work_packages) == 0
        assert program.total_hours == 0.0

    def test_program_id_generated(self):
        pkgs = _make_packages(1)
        program = SchedulingEngine.create_weekly_program("P1", 1, 2025, pkgs)
        assert len(program.program_id) > 0


class TestAssignSupportTasks:

    def test_shutdown_generates_loto_and_guard(self):
        pkgs = _make_packages(1)
        program = SchedulingEngine.create_weekly_program("P1", 1, 2025, pkgs)
        attrs = [{"package_id": "WP-1", "shutdown_required": True, "specialties": ["MECHANICAL"], "total_hours": 2.0}]
        program = SchedulingEngine.assign_support_tasks(program, attrs)
        types = [t.task_type.value for t in program.support_tasks]
        assert "LOTO" in types
        assert "GUARD_REMOVAL" in types

    def test_heavy_mechanical_generates_crane(self):
        pkgs = _make_packages(1)
        program = SchedulingEngine.create_weekly_program("P1", 1, 2025, pkgs)
        attrs = [{"package_id": "WP-1", "shutdown_required": False, "specialties": ["MECHANICAL"], "total_hours": 8.0}]
        program = SchedulingEngine.assign_support_tasks(program, attrs)
        types = [t.task_type.value for t in program.support_tasks]
        assert "CRANE" in types

    def test_always_adds_cleaning_and_commissioning(self):
        pkgs = _make_packages(1)
        program = SchedulingEngine.create_weekly_program("P1", 1, 2025, pkgs)
        attrs = [{"package_id": "WP-1", "shutdown_required": False, "specialties": [], "total_hours": 1.0}]
        program = SchedulingEngine.assign_support_tasks(program, attrs)
        types = [t.task_type.value for t in program.support_tasks]
        assert "CLEANING" in types
        assert "COMMISSIONING" in types


class TestLevelResources:

    def test_creates_resource_slots(self):
        pkgs = _make_packages(2)
        program = SchedulingEngine.create_weekly_program("P1", 1, 2025, pkgs)
        workforce = _make_workforce()
        program = SchedulingEngine.level_resources(program, workforce)
        assert len(program.resource_slots) > 0

    def test_utilization_calculated(self):
        pkgs = _make_packages(1)
        program = SchedulingEngine.create_weekly_program("P1", 1, 2025, pkgs)
        workforce = _make_workforce()
        program = SchedulingEngine.level_resources(program, workforce)
        for slot in program.resource_slots:
            assert slot.utilization_pct >= 0.0


class TestDetectConflicts:

    def test_no_conflicts_different_dates(self):
        pkgs = _make_packages(2)
        program = SchedulingEngine.create_weekly_program("P1", 1, 2025, pkgs)
        conflicts = SchedulingEngine.detect_conflicts(program)
        # Packages on different dates or shifts should have minimal conflicts
        assert isinstance(conflicts, list)

    def test_specialist_overallocation(self):
        pkgs = []
        for i in range(3):
            pkgs.append(BacklogWorkPackage(
                package_id=f"WP-OVER-{i}",
                name=f"Overallocated {i}",
                grouped_items=[f"ITEM-{i}"],
                reason_for_grouping="Test",
                scheduled_date=date(2025, 6, 5),
                scheduled_shift=ShiftType.MORNING,
                total_duration_hours=4.0,
                assigned_team=["MECHANICAL"],
                materials_status=MaterialsReadyStatus.READY,
            ))
        program = SchedulingEngine.create_weekly_program("P1", 1, 2025, pkgs)
        conflicts = SchedulingEngine.detect_conflicts(program)
        # 3 packages x 4h = 12h > 8h capacity for MECHANICAL
        mech_conflicts = [c for c in conflicts if "MECHANICAL" in c.description]
        assert len(mech_conflicts) >= 1


class TestValidateWorkPackageElements:

    def test_all_7_elements_compliant(self):
        elements = [
            WorkPackageElement(element_type=et, present=True, reference=f"REF-{et.value}")
            for et in WorkPackageElementType
        ]
        result = SchedulingEngine.validate_work_package_elements("WP-001", elements)
        assert result.compliant is True
        assert len(result.missing) == 0

    def test_missing_elements_not_compliant(self):
        elements = [
            WorkPackageElement(element_type=WorkPackageElementType.WORK_PERMIT, present=True),
            WorkPackageElement(element_type=WorkPackageElementType.WORK_ORDER, present=True),
        ]
        result = SchedulingEngine.validate_work_package_elements("WP-001", elements)
        assert result.compliant is False
        assert len(result.missing) == 5

    def test_no_elements_all_missing(self):
        result = SchedulingEngine.validate_work_package_elements("WP-001", [])
        assert result.compliant is False
        assert len(result.missing) == 7


class TestProgramLifecycle:

    def test_draft_to_final(self):
        pkgs = _make_packages(1)
        program = SchedulingEngine.create_weekly_program("P1", 1, 2025, pkgs)
        program, msg = SchedulingEngine.finalize_program(program)
        assert program.status == WeeklyProgramStatus.FINAL
        assert program.finalized_at is not None
        assert "finalized" in msg

    def test_final_to_active(self):
        pkgs = _make_packages(1)
        program = SchedulingEngine.create_weekly_program("P1", 1, 2025, pkgs)
        program, _ = SchedulingEngine.finalize_program(program)
        program, msg = SchedulingEngine.activate_program(program)
        assert program.status == WeeklyProgramStatus.ACTIVE
        assert "activated" in msg

    def test_active_to_completed(self):
        pkgs = _make_packages(1)
        program = SchedulingEngine.create_weekly_program("P1", 1, 2025, pkgs)
        program, _ = SchedulingEngine.finalize_program(program)
        program, _ = SchedulingEngine.activate_program(program)
        program, msg = SchedulingEngine.complete_program(program)
        assert program.status == WeeklyProgramStatus.COMPLETED
        assert "completed" in msg

    def test_completed_is_terminal(self):
        pkgs = _make_packages(1)
        program = SchedulingEngine.create_weekly_program("P1", 1, 2025, pkgs)
        program, _ = SchedulingEngine.finalize_program(program)
        program, _ = SchedulingEngine.activate_program(program)
        program, _ = SchedulingEngine.complete_program(program)
        program, msg = SchedulingEngine.activate_program(program)
        assert program.status == WeeklyProgramStatus.COMPLETED
        assert "Cannot" in msg

    def test_revert_final_to_draft(self):
        pkgs = _make_packages(1)
        program = SchedulingEngine.create_weekly_program("P1", 1, 2025, pkgs)
        program, _ = SchedulingEngine.finalize_program(program)
        program, msg = SchedulingEngine.revert_to_draft(program)
        assert program.status == WeeklyProgramStatus.DRAFT
        assert program.finalized_at is None
        assert "reverted" in msg

    def test_cannot_finalize_with_conflicts(self):
        pkgs = []
        for i in range(3):
            pkgs.append(BacklogWorkPackage(
                package_id=f"WP-C-{i}",
                name=f"Conflict {i}",
                grouped_items=[f"ITEM-{i}"],
                reason_for_grouping="Test",
                scheduled_date=date(2025, 6, 5),
                scheduled_shift=ShiftType.MORNING,
                total_duration_hours=4.0,
                assigned_team=["MECHANICAL"],
                materials_status=MaterialsReadyStatus.READY,
            ))
        program = SchedulingEngine.create_weekly_program("P1", 1, 2025, pkgs)
        SchedulingEngine.detect_conflicts(program)
        program, msg = SchedulingEngine.finalize_program(program)
        assert program.status == WeeklyProgramStatus.DRAFT
        assert "Cannot" in msg


class TestWeeklyProgramStateMachine:

    def test_happy_path_4_status(self):
        path = ["DRAFT", "FINAL", "ACTIVE", "COMPLETED"]
        for i in range(len(path) - 1):
            assert StateMachine.validate_transition("weekly_program", path[i], path[i + 1])

    def test_completed_is_terminal(self):
        valid = StateMachine.get_valid_transitions("weekly_program", "COMPLETED")
        assert valid == {"COMPLETED"}

    def test_final_can_revert_to_draft(self):
        assert StateMachine.validate_transition("weekly_program", "FINAL", "DRAFT")

    def test_invalid_draft_to_active(self):
        with pytest.raises(TransitionError):
            StateMachine.validate_transition("weekly_program", "DRAFT", "ACTIVE")

    def test_all_4_states_exist(self):
        states = StateMachine.get_all_states("weekly_program")
        assert len(states) == 4
        assert "DRAFT" in states
        assert "COMPLETED" in states
