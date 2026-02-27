"""Scheduling Engine — weekly program management per GFSN procedure (REF-14 §5).

Creates weekly programs, assigns support tasks, levels resources,
detects conflicts, validates work package elements, and manages
the DRAFT→FINAL→ACTIVE→COMPLETED lifecycle.

Deterministic — no LLM required.
"""

from datetime import date, datetime, timedelta
from collections import defaultdict

from tools.engines.state_machine import StateMachine
from tools.models.schemas import (
    WeeklyProgram, WeeklyProgramStatus,
    SupportTask, SupportTaskType,
    WorkPackageElement, WorkPackageElementType, WorkPackageComplianceResult,
    ResourceSlot, ResourceConflict,
    BacklogWorkPackage, ShiftType,
    TradeCapacity, ConflictResolution, ConflictResolutionType,
    MultiDayPackage, EnhancedLevelingResult,
)


SHIFT_HOURS = 8.0
EXECUTION_DAYS = 4  # Thursday through Sunday


class SchedulingEngine:
    """Manages weekly scheduling per GFSN REF-14 §5."""

    @staticmethod
    def create_weekly_program(
        plant_id: str,
        week_number: int,
        year: int,
        work_packages: list[BacklogWorkPackage],
    ) -> WeeklyProgram:
        """Create a DRAFT weekly program from backlog work packages.

        Distributes packages across the Thu-Sun execution window.
        """
        pkg_dicts = []
        total_hours = 0.0

        # Calculate the Thursday of the given ISO week
        jan4 = date(year, 1, 4)
        start_of_week1 = jan4 - timedelta(days=jan4.isoweekday() - 1)
        week_start = start_of_week1 + timedelta(weeks=week_number - 1)
        exec_start = week_start + timedelta(days=3)  # Thursday

        for i, pkg in enumerate(work_packages):
            day_offset = i % EXECUTION_DAYS
            pkg_date = exec_start + timedelta(days=day_offset)
            pkg_dict = pkg.model_dump(mode="json") if hasattr(pkg, "model_dump") else dict(
                package_id=pkg.package_id,
                name=pkg.name,
                grouped_items=pkg.grouped_items,
                scheduled_date=pkg_date.isoformat(),
                scheduled_shift=pkg.scheduled_shift.value if hasattr(pkg.scheduled_shift, "value") else str(pkg.scheduled_shift),
                total_duration_hours=pkg.total_duration_hours,
                assigned_team=pkg.assigned_team,
            )
            if "scheduled_date" not in pkg_dict or pkg_dict["scheduled_date"] is None:
                pkg_dict["scheduled_date"] = pkg_date.isoformat()
            pkg_dicts.append(pkg_dict)
            total_hours += pkg.total_duration_hours

        return WeeklyProgram(
            plant_id=plant_id,
            week_number=week_number,
            year=year,
            status=WeeklyProgramStatus.DRAFT,
            work_packages=pkg_dicts,
            total_hours=total_hours,
        )

    @staticmethod
    def assign_support_tasks(
        program: WeeklyProgram,
        package_attributes: list[dict],
    ) -> WeeklyProgram:
        """Auto-detect and assign support tasks based on package attributes.

        Args:
            program: The weekly program.
            package_attributes: List of dicts with keys:
                - package_id, shutdown_required, specialties, total_hours
        """
        support_tasks: list[SupportTask] = []
        support_hours = 0.0

        for attrs in package_attributes:
            shutdown = attrs.get("shutdown_required", False)
            specialties = attrs.get("specialties", [])
            hours = attrs.get("total_hours", 0.0)

            if shutdown:
                support_tasks.append(SupportTask(
                    task_type=SupportTaskType.LOTO,
                    description=f"LOTO for {attrs.get('package_id', '')}",
                    estimated_hours=0.5,
                    required_before=True,
                ))
                support_tasks.append(SupportTask(
                    task_type=SupportTaskType.GUARD_REMOVAL,
                    description=f"Guard removal for {attrs.get('package_id', '')}",
                    estimated_hours=0.5,
                    required_before=True,
                ))
                support_hours += 1.0

            if "MECHANICAL" in specialties and hours > 4.0:
                support_tasks.append(SupportTask(
                    task_type=SupportTaskType.CRANE,
                    description=f"Crane support for {attrs.get('package_id', '')}",
                    estimated_hours=1.0,
                    required_before=True,
                ))
                support_hours += 1.0

            # Post-execution tasks
            support_tasks.append(SupportTask(
                task_type=SupportTaskType.CLEANING,
                description=f"Post-execution cleaning for {attrs.get('package_id', '')}",
                estimated_hours=0.5,
                required_before=False,
            ))
            support_tasks.append(SupportTask(
                task_type=SupportTaskType.COMMISSIONING,
                description=f"Commissioning for {attrs.get('package_id', '')}",
                estimated_hours=0.5,
                required_before=False,
            ))
            support_hours += 1.0

        program.support_tasks = support_tasks
        program.total_hours += support_hours
        return program

    @staticmethod
    def level_resources(
        program: WeeklyProgram,
        workforce: list[dict],
    ) -> WeeklyProgram:
        """Distribute work across shifts to balance utilization.

        Args:
            workforce: List of dicts with keys: worker_id, specialty, shift, available
        """
        # Calculate capacity per day/shift/specialty
        capacity: dict[tuple[str, str], float] = defaultdict(float)
        for w in workforce:
            if w.get("available", False):
                shift = w.get("shift", "MORNING")
                specialty = w.get("specialty", "GENERAL")
                capacity[(shift, specialty)] += SHIFT_HOURS

        # Tally assigned hours per day/shift/specialty
        assigned: dict[tuple[str, str, str], float] = defaultdict(float)
        for pkg in program.work_packages:
            pkg_date = pkg.get("scheduled_date", "")
            shift = pkg.get("scheduled_shift", "MORNING")
            team = pkg.get("assigned_team", [])
            hours = pkg.get("total_duration_hours", 0.0)
            if not team:
                team = ["GENERAL"]
            hours_per_spec = hours / len(team) if team else hours
            for spec in team:
                assigned[(str(pkg_date), shift, spec)] += hours_per_spec

        # Build resource slots
        slots: list[ResourceSlot] = []
        for (date_str, shift, spec), hrs in sorted(assigned.items()):
            cap = capacity.get((shift, spec), SHIFT_HOURS)
            util = (hrs / cap * 100.0) if cap > 0 else 0.0
            try:
                slot_date = date.fromisoformat(date_str)
            except (ValueError, TypeError):
                slot_date = date.today()
            slots.append(ResourceSlot(
                slot_date=slot_date,
                shift=shift,
                specialty=spec,
                assigned_hours=round(hrs, 1),
                capacity_hours=cap,
                utilization_pct=round(util, 1),
            ))

        program.resource_slots = slots
        return program

    @staticmethod
    def detect_conflicts(program: WeeklyProgram) -> list[ResourceConflict]:
        """Check for multi-crew interference and specialist overallocation."""
        conflicts: list[ResourceConflict] = []

        # Group packages by date + shift
        by_date_shift: dict[tuple[str, str], list[dict]] = defaultdict(list)
        for pkg in program.work_packages:
            key = (str(pkg.get("scheduled_date", "")), pkg.get("scheduled_shift", "MORNING"))
            by_date_shift[key].append(pkg)

        for (date_str, shift), pkgs in by_date_shift.items():
            if len(pkgs) < 2:
                continue

            # Check area interference
            area_map: dict[str, list[str]] = defaultdict(list)
            for pkg in pkgs:
                name = pkg.get("name", "")
                # Extract area from package name or grouped items
                area = ""
                items = pkg.get("grouped_items", [])
                if items and isinstance(items[0], str) and "-" in items[0]:
                    area = "-".join(items[0].split("-")[:2])
                elif "-" in name:
                    area = "-".join(name.split("-")[:2])
                if area:
                    area_map[area].append(pkg.get("package_id", ""))

            for area, pkg_ids in area_map.items():
                if len(pkg_ids) > 1:
                    try:
                        conflict_date = date.fromisoformat(date_str)
                    except (ValueError, TypeError):
                        conflict_date = date.today()
                    conflicts.append(ResourceConflict(
                        conflict_date=conflict_date,
                        shift=shift,
                        area=area,
                        conflicting_packages=pkg_ids,
                        description=f"Multiple crews in area {area} on {date_str} {shift} shift",
                    ))

            # Check specialist overallocation
            spec_hours: dict[str, float] = defaultdict(float)
            spec_pkgs: dict[str, list[str]] = defaultdict(list)
            for pkg in pkgs:
                team = pkg.get("assigned_team", [])
                hours = pkg.get("total_duration_hours", 0.0)
                for spec in team:
                    spec_hours[spec] += hours
                    spec_pkgs[spec].append(pkg.get("package_id", ""))

            for spec, hrs in spec_hours.items():
                if hrs > SHIFT_HOURS:
                    try:
                        conflict_date = date.fromisoformat(date_str)
                    except (ValueError, TypeError):
                        conflict_date = date.today()
                    conflicts.append(ResourceConflict(
                        conflict_date=conflict_date,
                        shift=shift,
                        equipment=spec,
                        conflicting_packages=spec_pkgs[spec],
                        description=f"{spec} overallocated: {hrs:.1f}h assigned vs {SHIFT_HOURS}h capacity on {date_str} {shift}",
                    ))

        program.conflicts = conflicts
        return conflicts

    @staticmethod
    def validate_work_package_elements(
        package_id: str,
        elements: list[WorkPackageElement],
    ) -> WorkPackageComplianceResult:
        """Validate that a work package has all 7 mandatory elements (REF-14 §5.5)."""
        required = set(WorkPackageElementType)
        present_types = {e.element_type for e in elements if e.present}
        missing = sorted([et.value for et in required - present_types])
        compliant = len(missing) == 0

        return WorkPackageComplianceResult(
            package_id=package_id,
            elements=elements,
            compliant=compliant,
            missing=missing,
        )

    @classmethod
    def finalize_program(cls, program: WeeklyProgram) -> tuple[WeeklyProgram, str]:
        """Transition DRAFT→FINAL. Validates no conflicts remain."""
        if program.conflicts:
            return program, f"Cannot finalize: {len(program.conflicts)} unresolved conflict(s)"

        try:
            StateMachine.validate_transition("weekly_program", program.status.value, "FINAL")
        except Exception as e:
            return program, f"Cannot finalize: {e}"

        program.status = WeeklyProgramStatus.FINAL
        program.finalized_at = datetime.now()
        return program, "Program finalized successfully"

    @classmethod
    def activate_program(cls, program: WeeklyProgram) -> tuple[WeeklyProgram, str]:
        """Transition FINAL→ACTIVE."""
        try:
            StateMachine.validate_transition("weekly_program", program.status.value, "ACTIVE")
        except Exception as e:
            return program, f"Cannot activate: {e}"

        program.status = WeeklyProgramStatus.ACTIVE
        return program, "Program activated for execution"

    @classmethod
    def complete_program(cls, program: WeeklyProgram) -> tuple[WeeklyProgram, str]:
        """Transition ACTIVE→COMPLETED."""
        try:
            StateMachine.validate_transition("weekly_program", program.status.value, "COMPLETED")
        except Exception as e:
            return program, f"Cannot complete: {e}"

        program.status = WeeklyProgramStatus.COMPLETED
        return program, "Program completed"

    @classmethod
    def revert_to_draft(cls, program: WeeklyProgram) -> tuple[WeeklyProgram, str]:
        """Transition FINAL→DRAFT (for re-editing)."""
        try:
            StateMachine.validate_transition("weekly_program", program.status.value, "DRAFT")
        except Exception as e:
            return program, f"Cannot revert: {e}"

        program.status = WeeklyProgramStatus.DRAFT
        program.finalized_at = None
        return program, "Program reverted to draft"

    # ----------------------------------------------------------------
    # Phase 7 — Enhanced Resource Leveling (G15)
    # ----------------------------------------------------------------

    @staticmethod
    def level_resources_enhanced(
        program: WeeklyProgram,
        trade_capacities: list[TradeCapacity],
    ) -> EnhancedLevelingResult:
        """Trade-specific capacity leveling with multi-day splitting.

        Args:
            program: Weekly program with work packages.
            trade_capacities: Per-specialty/shift capacity definitions.

        Returns:
            EnhancedLevelingResult with slots, multi-day packages, conflicts.
        """
        # Build capacity map: (shift, specialty) → total_hours
        cap_map: dict[tuple[str, str], float] = defaultdict(float)
        for tc in trade_capacities:
            cap_map[(tc.shift, tc.specialty)] += tc.total_hours

        # Tally assigned hours per (date, shift, specialty)
        assigned: dict[tuple[str, str, str], float] = defaultdict(float)
        pkg_specialty_hours: dict[str, dict[str, float]] = {}

        for pkg in program.work_packages:
            pkg_id = pkg.get("package_id", "")
            pkg_date = str(pkg.get("scheduled_date", ""))
            shift = pkg.get("scheduled_shift", "MORNING")
            team = pkg.get("assigned_team", []) or ["GENERAL"]
            hours = pkg.get("total_duration_hours", 0.0)
            hours_per_spec = hours / len(team) if team else hours

            spec_map: dict[str, float] = {}
            for spec in team:
                assigned[(pkg_date, shift, spec)] += hours_per_spec
                spec_map[spec] = hours_per_spec
            pkg_specialty_hours[pkg_id] = spec_map

        # Build resource slots and detect overallocation
        slots: list[ResourceSlot] = []
        max_util = 0.0
        bottleneck = ""
        conflicts: list[ConflictResolution] = []
        multi_day: list[MultiDayPackage] = []

        for (date_str, shift, spec), hrs in sorted(assigned.items()):
            cap = cap_map.get((shift, spec), SHIFT_HOURS)
            util = (hrs / cap * 100.0) if cap > 0 else 0.0
            try:
                slot_date = date.fromisoformat(date_str)
            except (ValueError, TypeError):
                slot_date = date.today()

            slots.append(ResourceSlot(
                slot_date=slot_date,
                shift=shift,
                specialty=spec,
                assigned_hours=round(hrs, 1),
                capacity_hours=cap,
                utilization_pct=round(util, 1),
            ))

            if util > max_util:
                max_util = util
                bottleneck = spec

            if util > 100.0:
                excess = round(hrs - cap, 1)
                conflicts.append(ConflictResolution(
                    conflict_description=f"{spec} overallocated on {date_str} {shift}: {hrs:.1f}h vs {cap:.1f}h capacity",
                    resolution_type=ConflictResolutionType.ADD_SHIFT,
                    suggestion=f"Add {excess}h of {spec} capacity or split work across days",
                    estimated_impact=f"Reduces {spec} utilization from {util:.0f}% to ~100%",
                ))

        # Identify packages that need multi-day splitting
        for pkg in program.work_packages:
            pkg_id = pkg.get("package_id", "")
            hours = pkg.get("total_duration_hours", 0.0)
            team = pkg.get("assigned_team", []) or ["GENERAL"]
            shift = pkg.get("scheduled_shift", "MORNING")

            # Check if any specialty's portion exceeds daily capacity
            for spec in team:
                spec_hours = hours / len(team) if team else hours
                cap = cap_map.get((shift, spec), SHIFT_HOURS)
                if spec_hours > cap and cap > 0:
                    md = SchedulingEngine.split_multi_day_package(
                        pkg, trade_capacities, date.today(),
                    )
                    multi_day.append(md)
                    break

        return EnhancedLevelingResult(
            resource_slots=slots,
            multi_day_packages=multi_day,
            conflicts=conflicts,
            bottleneck_specialty=bottleneck,
            max_utilization_pct=round(max_util, 1),
        )

    @staticmethod
    def suggest_conflict_resolutions(
        conflicts: list[ResourceConflict],
        program: WeeklyProgram,
        trade_capacities: list[TradeCapacity],
    ) -> list[ConflictResolution]:
        """Generate actionable resolution suggestions for scheduling conflicts.

        Args:
            conflicts: Detected resource conflicts.
            program: The weekly program.
            trade_capacities: Available trade capacities.

        Returns:
            List of ConflictResolution suggestions.
        """
        cap_map: dict[tuple[str, str], float] = defaultdict(float)
        for tc in trade_capacities:
            cap_map[(tc.shift, tc.specialty)] += tc.total_hours

        resolutions: list[ConflictResolution] = []
        for conflict in conflicts:
            desc = conflict.description
            pkgs = conflict.conflicting_packages

            if conflict.area:
                resolutions.append(ConflictResolution(
                    conflict_description=desc,
                    resolution_type=ConflictResolutionType.RESCHEDULE,
                    suggestion=f"Reschedule one of {pkgs} to a different day to avoid area interference in {conflict.area}",
                    estimated_impact="Eliminates multi-crew area conflict",
                ))
            elif conflict.equipment:
                spec = conflict.equipment
                shift = conflict.shift
                current_cap = cap_map.get((shift, spec), SHIFT_HOURS)

                # Try adding a shift
                resolutions.append(ConflictResolution(
                    conflict_description=desc,
                    resolution_type=ConflictResolutionType.ADD_SHIFT,
                    suggestion=f"Add afternoon/night shift for {spec} (current capacity: {current_cap:.0f}h on {shift})",
                    estimated_impact=f"Doubles {spec} capacity for the day",
                ))

                # Try reassigning
                if len(pkgs) > 1:
                    resolutions.append(ConflictResolution(
                        conflict_description=desc,
                        resolution_type=ConflictResolutionType.REASSIGN_SPECIALTY,
                        suggestion=f"Move {pkgs[-1]} to a cross-trained team member",
                        estimated_impact=f"Reduces {spec} load by splitting across specialties",
                    ))

        return resolutions

    @staticmethod
    def split_multi_day_package(
        package: dict,
        trade_capacities: list[TradeCapacity],
        start_date: date,
    ) -> MultiDayPackage:
        """Split a package that exceeds daily capacity across multiple days.

        Args:
            package: Work package dict.
            trade_capacities: Available capacities.
            start_date: First available date.

        Returns:
            MultiDayPackage with day-by-day allocation.
        """
        pkg_id = package.get("package_id", "")
        total_hours = package.get("total_duration_hours", 0.0)
        team = package.get("assigned_team", []) or ["GENERAL"]
        shift = package.get("scheduled_shift", "MORNING")

        cap_map: dict[tuple[str, str], float] = defaultdict(float)
        for tc in trade_capacities:
            cap_map[(tc.shift, tc.specialty)] += tc.total_hours

        # Find bottleneck specialty capacity per day
        min_daily_cap = float("inf")
        bottleneck_spec = ""
        for spec in team:
            cap = cap_map.get((shift, spec), SHIFT_HOURS)
            if cap < min_daily_cap:
                min_daily_cap = cap
                bottleneck_spec = spec

        if min_daily_cap <= 0:
            min_daily_cap = SHIFT_HOURS

        # Distribute hours across days
        remaining = total_hours
        day_allocs: list[dict] = []
        day_offset = 0
        while remaining > 0.01:
            day_hours = min(remaining, min_daily_cap)
            alloc_date = start_date + timedelta(days=day_offset)
            day_allocs.append({
                "day": day_offset + 1,
                "date": alloc_date.isoformat(),
                "hours": round(day_hours, 1),
            })
            remaining -= day_hours
            day_offset += 1

        return MultiDayPackage(
            package_id=pkg_id,
            total_hours=total_hours,
            bottleneck_specialty=bottleneck_spec,
            day_allocations=day_allocs,
            total_days=len(day_allocs),
        )
