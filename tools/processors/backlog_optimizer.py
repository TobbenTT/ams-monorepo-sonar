"""Backlog Optimizer — generates optimized schedules from backlog items.

Uses BacklogGrouper for work packages, distributes across shifts,
and generates alerts for overdue items, material delays, resource conflicts.

Deterministic — no LLM required.
"""

from datetime import date, datetime, timedelta
from collections import defaultdict

from tools.engines.backlog_grouper import BacklogGrouper, BacklogEntry, WorkPackageGroup
from tools.models.schemas import (
    BacklogItem, OptimizedBacklog, BacklogStratification,
    BacklogWorkPackage, ScheduleEntry, BacklogAlert,
    ShiftType, MaterialsReadyStatus, AlertType,
)


# Hours per shift for utilisation calculation
SHIFT_HOURS = 8.0
SHIFTS_PER_DAY = [ShiftType.MORNING, ShiftType.AFTERNOON]


class BacklogOptimizer:
    """Optimises backlog items into scheduled work packages."""

    @staticmethod
    def optimize(
        items: list[BacklogItem],
        workforce: list[dict],
        shutdowns: list[dict],
        period_days: int = 30,
    ) -> OptimizedBacklog:
        """
        Optimise a backlog into a schedule.

        Args:
            items: Backlog items to schedule.
            workforce: [{worker_id, specialty, shift, available}]
            shutdowns: [{shutdown_id, start_date, end_date, type, areas}]
            period_days: Scheduling horizon in days.
        """
        if not items:
            return _empty_backlog(period_days)

        period_start = date.today()
        period_end = period_start + timedelta(days=period_days)

        # Convert to BacklogEntry for grouper
        entries = _to_backlog_entries(items)

        # Stratify
        stratification = _stratify(items)

        # Separate schedulable vs blocked
        schedulable = [i for i in items if i.materials_ready and not i.shutdown_required]
        blocked = [i for i in items if not i.materials_ready or i.shutdown_required]
        shutdown_items = [i for i in items if i.shutdown_required and i.materials_ready]

        # Group using BacklogGrouper
        groups = BacklogGrouper.find_all_groups(entries)

        # Build work packages from groups
        work_packages = _build_work_packages(groups, period_start)

        # Add individual items not in any group
        grouped_ids = set()
        for g in groups:
            for entry in g.items:
                grouped_ids.add(entry.backlog_id)

        ungrouped_schedulable = [i for i in schedulable if i.backlog_id not in grouped_ids]
        for i, item in enumerate(ungrouped_schedulable):
            pkg_date = period_start + timedelta(days=1 + i // 2)
            if pkg_date > period_end:
                pkg_date = period_end
            work_packages.append(BacklogWorkPackage(
                package_id=f"WP-IND-{item.backlog_id[:8]}",
                name=f"Individual: {item.equipment_tag}",
                grouped_items=[item.backlog_id],
                reason_for_grouping="Individual item — no grouping opportunity",
                scheduled_date=pkg_date,
                scheduled_shift=ShiftType.MORNING,
                total_duration_hours=item.estimated_duration_hours,
                assigned_team=item.required_specialties,
                materials_status=MaterialsReadyStatus.READY if item.materials_ready else MaterialsReadyStatus.NOT_READY,
            ))

        # Schedule shutdown items in shutdown windows
        shutdown_packages = _schedule_shutdown_items(shutdown_items, shutdowns, period_start, period_end)
        work_packages.extend(shutdown_packages)

        # Generate schedule entries
        schedule = _generate_schedule(work_packages, period_start, period_end, workforce)

        # Generate alerts
        alerts = _generate_alerts(items, work_packages)

        return OptimizedBacklog(
            generated_at=datetime.now(),
            period_start=period_start,
            period_end=period_end,
            total_backlog_items=len(items),
            items_schedulable_now=len(schedulable),
            items_blocked=len(blocked),
            estimated_total_hours=sum(i.estimated_duration_hours for i in items),
            stratification=stratification,
            work_packages=work_packages,
            schedule_proposal=schedule,
            alerts=alerts,
        )


def _empty_backlog(period_days: int) -> OptimizedBacklog:
    return OptimizedBacklog(
        generated_at=datetime.now(),
        period_start=date.today(),
        period_end=date.today() + timedelta(days=period_days),
        total_backlog_items=0,
        items_schedulable_now=0,
        items_blocked=0,
        estimated_total_hours=0.0,
        stratification=BacklogStratification(
            by_reason={}, by_priority={}, by_equipment_criticality={},
        ),
        work_packages=[],
        schedule_proposal=[],
        alerts=[],
    )


def _to_backlog_entries(items: list[BacklogItem]) -> list[BacklogEntry]:
    entries = []
    for item in items:
        tag = item.equipment_tag
        area = "-".join(tag.split("-")[:2]) if "-" in tag else tag
        entries.append(BacklogEntry(
            backlog_id=item.backlog_id,
            equipment_id=item.equipment_id,
            equipment_tag=tag,
            area_code=area,
            priority=item.priority.value if hasattr(item.priority, "value") else str(item.priority),
            specialties_required=item.required_specialties,
            shutdown_required=item.shutdown_required,
            materials_ready=item.materials_ready,
            estimated_hours=item.estimated_duration_hours,
        ))
    return entries


def _stratify(items: list[BacklogItem]) -> BacklogStratification:
    by_priority: dict[str, int] = defaultdict(int)
    by_reason: dict[str, int] = defaultdict(int)
    by_crit: dict[str, int] = defaultdict(int)

    for item in items:
        priority_val = item.priority.value if hasattr(item.priority, "value") else str(item.priority)
        by_priority[priority_val] += 1

        if not item.materials_ready:
            by_reason["AWAITING_MATERIALS"] += 1
        elif item.shutdown_required:
            by_reason["AWAITING_SHUTDOWN"] += 1
        else:
            by_reason["READY"] += 1

        wo_type = item.work_order_type.value if hasattr(item.work_order_type, "value") else str(item.work_order_type)
        by_crit[wo_type] += 1

    return BacklogStratification(
        by_reason=dict(by_reason),
        by_priority=dict(by_priority),
        by_equipment_criticality=dict(by_crit),
    )


def _build_work_packages(
    groups: list[WorkPackageGroup], period_start: date
) -> list[BacklogWorkPackage]:
    packages = []
    for i, group in enumerate(groups):
        pkg_date = period_start + timedelta(days=1 + i)
        packages.append(BacklogWorkPackage(
            package_id=group.group_id,
            name=group.name,
            grouped_items=[entry.backlog_id for entry in group.items],
            reason_for_grouping=group.reason,
            scheduled_date=pkg_date,
            scheduled_shift=ShiftType.MORNING if i % 2 == 0 else ShiftType.AFTERNOON,
            total_duration_hours=group.total_hours,
            assigned_team=list(group.specialties),
            materials_status=(
                MaterialsReadyStatus.READY
                if all(e.materials_ready for e in group.items)
                else MaterialsReadyStatus.PARTIAL
            ),
        ))
    return packages


def _schedule_shutdown_items(
    items: list[BacklogItem],
    shutdowns: list[dict],
    period_start: date,
    period_end: date,
) -> list[BacklogWorkPackage]:
    if not items or not shutdowns:
        return []

    # Find shutdown windows in period
    windows = []
    for sd in shutdowns:
        start = sd.get("start_date")
        if isinstance(start, str):
            start = date.fromisoformat(start)
        if start and period_start <= start <= period_end:
            windows.append(sd)

    if not windows:
        return []

    # Assign shutdown items to first available window
    sd = windows[0]
    start = sd.get("start_date")
    if isinstance(start, str):
        start = date.fromisoformat(start)

    return [BacklogWorkPackage(
        package_id=f"WP-SD-{sd.get('shutdown_id', 'DEFAULT')[:8]}",
        name=f"Shutdown package: {sd.get('description', 'Planned shutdown')}",
        grouped_items=[i.backlog_id for i in items],
        reason_for_grouping=f"Grouped for shutdown window starting {start}",
        scheduled_date=start,
        scheduled_shift=ShiftType.MORNING,
        total_duration_hours=sum(i.estimated_duration_hours for i in items),
        assigned_team=list({s for i in items for s in i.required_specialties}),
        materials_status=(
            MaterialsReadyStatus.READY
            if all(i.materials_ready for i in items)
            else MaterialsReadyStatus.PARTIAL
        ),
    )]


def _generate_schedule(
    packages: list[BacklogWorkPackage],
    period_start: date,
    period_end: date,
    workforce: list[dict],
) -> list[ScheduleEntry]:
    # Group packages by date + shift
    by_day_shift: dict[tuple[date, ShiftType], list[str]] = defaultdict(list)
    hours_by_day_shift: dict[tuple[date, ShiftType], float] = defaultdict(float)

    for pkg in packages:
        key = (pkg.scheduled_date, pkg.scheduled_shift)
        by_day_shift[key].append(pkg.package_id)
        hours_by_day_shift[key] += pkg.total_duration_hours

    # Calculate workforce capacity per shift
    available_count = sum(1 for w in workforce if w.get("available", False))
    capacity_per_shift = max(available_count * SHIFT_HOURS, SHIFT_HOURS)

    schedule = []
    for (day, shift), pkg_ids in sorted(by_day_shift.items()):
        total_hours = hours_by_day_shift[(day, shift)]
        utilisation = min((total_hours / capacity_per_shift) * 100, 100.0)
        schedule.append(ScheduleEntry(
            date=day,
            shift=shift,
            work_packages=pkg_ids,
            total_hours=total_hours,
            utilization_percent=round(utilisation, 1),
        ))

    return schedule


def _generate_alerts(
    items: list[BacklogItem], packages: list[BacklogWorkPackage]
) -> list[BacklogAlert]:
    alerts = []

    # Check for overdue items (age > 30 days)
    overdue = [i for i in items if i.age_days > 30]
    if overdue:
        alerts.append(BacklogAlert(
            type=AlertType.OVERDUE,
            message=f"{len(overdue)} item(s) have been in backlog for more than 30 days",
            affected_items=[i.backlog_id for i in overdue],
        ))

    # Check for material delays
    material_blocked = [i for i in items if not i.materials_ready]
    if material_blocked:
        alerts.append(BacklogAlert(
            type=AlertType.MATERIAL_DELAY,
            message=f"{len(material_blocked)} item(s) awaiting materials",
            affected_items=[i.backlog_id for i in material_blocked],
        ))

    # Check for priority escalations (emergency items not yet scheduled)
    emergency = [
        i for i in items
        if (i.priority.value if hasattr(i.priority, "value") else str(i.priority)) == "1_EMERGENCY"
    ]
    if emergency:
        alerts.append(BacklogAlert(
            type=AlertType.PRIORITY_ESCALATION,
            message=f"{len(emergency)} EMERGENCY item(s) require immediate attention",
            affected_items=[i.backlog_id for i in emergency],
        ))

    return alerts
