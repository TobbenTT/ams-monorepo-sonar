"""Tests for Enhanced Resource Leveling — Phase 7 (G15)."""

from datetime import date

from tools.engines.scheduling_engine import SchedulingEngine
from tools.models.schemas import (
    WeeklyProgram, WeeklyProgramStatus,
    TradeCapacity,
    ConflictResolutionType,
    ResourceConflict,
    EnhancedLevelingResult,
    MultiDayPackage,
)


def _make_program(packages=None):
    return WeeklyProgram(
        plant_id="PLANT-1",
        week_number=10,
        year=2025,
        status=WeeklyProgramStatus.DRAFT,
        work_packages=packages or [],
        total_hours=sum(p.get("total_duration_hours", 0) for p in (packages or [])),
    )


def _make_capacities():
    return [
        TradeCapacity(specialty="MECHANICAL", shift="MORNING", headcount=3, hours_per_person=8.0, total_hours=24.0),
        TradeCapacity(specialty="ELECTRICAL", shift="MORNING", headcount=2, hours_per_person=8.0, total_hours=16.0),
    ]


class TestLevelResourcesEnhanced:

    def test_basic_leveling(self):
        pkgs = [
            {"package_id": "WP-1", "scheduled_date": "2025-03-06", "scheduled_shift": "MORNING",
             "assigned_team": ["MECHANICAL"], "total_duration_hours": 8.0},
        ]
        result = SchedulingEngine.level_resources_enhanced(_make_program(pkgs), _make_capacities())
        assert isinstance(result, EnhancedLevelingResult)
        assert len(result.resource_slots) > 0

    def test_utilization_under_capacity(self):
        pkgs = [
            {"package_id": "WP-1", "scheduled_date": "2025-03-06", "scheduled_shift": "MORNING",
             "assigned_team": ["MECHANICAL"], "total_duration_hours": 8.0},
        ]
        result = SchedulingEngine.level_resources_enhanced(_make_program(pkgs), _make_capacities())
        mech_slot = next(s for s in result.resource_slots if s.specialty == "MECHANICAL")
        assert mech_slot.utilization_pct < 100.0

    def test_overallocation_detected(self):
        pkgs = [
            {"package_id": "WP-1", "scheduled_date": "2025-03-06", "scheduled_shift": "MORNING",
             "assigned_team": ["ELECTRICAL"], "total_duration_hours": 20.0},
        ]
        result = SchedulingEngine.level_resources_enhanced(_make_program(pkgs), _make_capacities())
        assert len(result.conflicts) > 0
        assert result.max_utilization_pct > 100.0

    def test_bottleneck_identified(self):
        pkgs = [
            {"package_id": "WP-1", "scheduled_date": "2025-03-06", "scheduled_shift": "MORNING",
             "assigned_team": ["ELECTRICAL"], "total_duration_hours": 20.0},
            {"package_id": "WP-2", "scheduled_date": "2025-03-06", "scheduled_shift": "MORNING",
             "assigned_team": ["MECHANICAL"], "total_duration_hours": 8.0},
        ]
        result = SchedulingEngine.level_resources_enhanced(_make_program(pkgs), _make_capacities())
        assert result.bottleneck_specialty == "ELECTRICAL"

    def test_empty_program(self):
        result = SchedulingEngine.level_resources_enhanced(_make_program(), _make_capacities())
        assert len(result.resource_slots) == 0
        assert result.max_utilization_pct == 0.0

    def test_multi_day_split_needed(self):
        pkgs = [
            {"package_id": "WP-BIG", "scheduled_date": "2025-03-06", "scheduled_shift": "MORNING",
             "assigned_team": ["MECHANICAL"], "total_duration_hours": 30.0},
        ]
        result = SchedulingEngine.level_resources_enhanced(_make_program(pkgs), _make_capacities())
        assert len(result.multi_day_packages) > 0

    def test_no_multi_day_within_capacity(self):
        pkgs = [
            {"package_id": "WP-1", "scheduled_date": "2025-03-06", "scheduled_shift": "MORNING",
             "assigned_team": ["MECHANICAL"], "total_duration_hours": 8.0},
        ]
        result = SchedulingEngine.level_resources_enhanced(_make_program(pkgs), _make_capacities())
        assert len(result.multi_day_packages) == 0

    def test_multiple_specialties(self):
        pkgs = [
            {"package_id": "WP-1", "scheduled_date": "2025-03-06", "scheduled_shift": "MORNING",
             "assigned_team": ["MECHANICAL", "ELECTRICAL"], "total_duration_hours": 16.0},
        ]
        result = SchedulingEngine.level_resources_enhanced(_make_program(pkgs), _make_capacities())
        specialties = {s.specialty for s in result.resource_slots}
        assert "MECHANICAL" in specialties
        assert "ELECTRICAL" in specialties


class TestSuggestConflictResolutions:

    def test_area_conflict_resolution(self):
        conflicts = [
            ResourceConflict(
                conflict_date=date(2025, 3, 6), shift="MORNING",
                area="AREA-1", conflicting_packages=["WP-1", "WP-2"],
                description="Multi-crew area conflict",
            ),
        ]
        program = _make_program()
        resolutions = SchedulingEngine.suggest_conflict_resolutions(conflicts, program, _make_capacities())
        assert len(resolutions) > 0
        assert resolutions[0].resolution_type == ConflictResolutionType.RESCHEDULE

    def test_specialist_overallocation_resolution(self):
        conflicts = [
            ResourceConflict(
                conflict_date=date(2025, 3, 6), shift="MORNING",
                equipment="MECHANICAL",
                conflicting_packages=["WP-1", "WP-2"],
                description="MECHANICAL overallocated",
            ),
        ]
        program = _make_program()
        resolutions = SchedulingEngine.suggest_conflict_resolutions(conflicts, program, _make_capacities())
        assert len(resolutions) >= 1
        types = {r.resolution_type for r in resolutions}
        assert ConflictResolutionType.ADD_SHIFT in types

    def test_empty_conflicts(self):
        resolutions = SchedulingEngine.suggest_conflict_resolutions([], _make_program(), _make_capacities())
        assert len(resolutions) == 0

    def test_resolution_has_suggestion(self):
        conflicts = [
            ResourceConflict(
                conflict_date=date(2025, 3, 6), shift="MORNING",
                area="AREA-1", conflicting_packages=["WP-1", "WP-2"],
                description="Multi-crew area conflict",
            ),
        ]
        resolutions = SchedulingEngine.suggest_conflict_resolutions(conflicts, _make_program(), _make_capacities())
        for r in resolutions:
            assert len(r.suggestion) > 0
            assert len(r.estimated_impact) > 0


class TestSplitMultiDayPackage:

    def test_basic_split(self):
        package = {
            "package_id": "WP-BIG", "total_duration_hours": 30.0,
            "assigned_team": ["MECHANICAL"], "scheduled_shift": "MORNING",
        }
        result = SchedulingEngine.split_multi_day_package(package, _make_capacities(), date(2025, 3, 6))
        assert isinstance(result, MultiDayPackage)
        assert result.total_hours == 30.0
        assert result.total_days > 1

    def test_daily_hours_within_capacity(self):
        package = {
            "package_id": "WP-BIG", "total_duration_hours": 48.0,
            "assigned_team": ["MECHANICAL"], "scheduled_shift": "MORNING",
        }
        result = SchedulingEngine.split_multi_day_package(package, _make_capacities(), date(2025, 3, 6))
        for alloc in result.day_allocations:
            assert alloc["hours"] <= 24.0

    def test_single_day_no_split_needed(self):
        package = {
            "package_id": "WP-SMALL", "total_duration_hours": 8.0,
            "assigned_team": ["MECHANICAL"], "scheduled_shift": "MORNING",
        }
        result = SchedulingEngine.split_multi_day_package(package, _make_capacities(), date(2025, 3, 6))
        assert result.total_days == 1

    def test_bottleneck_specialty_identified(self):
        package = {
            "package_id": "WP-1", "total_duration_hours": 30.0,
            "assigned_team": ["MECHANICAL", "ELECTRICAL"], "scheduled_shift": "MORNING",
        }
        result = SchedulingEngine.split_multi_day_package(package, _make_capacities(), date(2025, 3, 6))
        assert result.bottleneck_specialty in ("MECHANICAL", "ELECTRICAL")

    def test_total_hours_preserved(self):
        package = {
            "package_id": "WP-1", "total_duration_hours": 50.0,
            "assigned_team": ["ELECTRICAL"], "scheduled_shift": "MORNING",
        }
        result = SchedulingEngine.split_multi_day_package(package, _make_capacities(), date(2025, 3, 6))
        total_allocated = sum(a["hours"] for a in result.day_allocations)
        assert abs(total_allocated - 50.0) < 0.5
