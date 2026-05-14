"""
Backlog Grouper Engine — M3 Backlog Optimization (GAP-5)
Groups backlog items into work packages based on equipment, area,
shutdown windows, and resource type.
"""

from collections import defaultdict
from dataclasses import dataclass, field


@dataclass
class BacklogEntry:
    """Simplified backlog item for grouping."""
    backlog_id: str
    equipment_id: str
    equipment_tag: str
    area_code: str  # First 2 segments of tag (e.g., "BRY-SAG")
    priority: str
    specialties_required: list[str]
    shutdown_required: bool
    materials_ready: bool
    estimated_hours: float


@dataclass
class WorkPackageGroup:
    """A proposed grouping of backlog items."""
    group_id: str
    name: str
    reason: str
    items: list[BacklogEntry]
    total_hours: float = 0.0
    specialties: set[str] = field(default_factory=set)
    requires_shutdown: bool = False


class BacklogGrouper:
    """Groups backlog items into executable work packages."""

    @staticmethod
    def group_by_equipment(items: list[BacklogEntry]) -> list[WorkPackageGroup]:
        """Group items by same equipment."""
        by_equipment: dict[str, list[BacklogEntry]] = defaultdict(list)
        for item in items:
            by_equipment[item.equipment_tag].append(item)

        groups = []
        for tag, entries in by_equipment.items():
            if len(entries) < 2:
                continue
            group = WorkPackageGroup(
                group_id=f"GRP-EQ-{tag}",
                name=f"Equipment group: {tag}",
                reason=f"Same equipment ({tag}): {len(entries)} tasks",
                items=entries,
                total_hours=sum(e.estimated_hours for e in entries),
                specialties={s for e in entries for s in e.specialties_required},
                requires_shutdown=any(e.shutdown_required for e in entries),
            )
            groups.append(group)
        return groups

    @staticmethod
    def group_by_area(items: list[BacklogEntry]) -> list[WorkPackageGroup]:
        """Group items by same area (first 2 TAG segments)."""
        by_area: dict[str, list[BacklogEntry]] = defaultdict(list)
        for item in items:
            by_area[item.area_code].append(item)

        groups = []
        for area, entries in by_area.items():
            if len(entries) < 2:
                continue
            group = WorkPackageGroup(
                group_id=f"GRP-AREA-{area}",
                name=f"Area group: {area}",
                reason=f"Same area ({area}): {len(entries)} tasks",
                items=entries,
                total_hours=sum(e.estimated_hours for e in entries),
                specialties={s for e in entries for s in e.specialties_required},
                requires_shutdown=any(e.shutdown_required for e in entries),
            )
            groups.append(group)
        return groups

    @staticmethod
    def group_by_shutdown(items: list[BacklogEntry]) -> list[WorkPackageGroup]:
        """Group items that all require shutdown together."""
        shutdown_items = [i for i in items if i.shutdown_required and i.materials_ready]
        if len(shutdown_items) < 2:
            return []

        by_area: dict[str, list[BacklogEntry]] = defaultdict(list)
        for item in shutdown_items:
            by_area[item.area_code].append(item)

        groups = []
        for area, entries in by_area.items():
            if len(entries) < 2:
                continue
            group = WorkPackageGroup(
                group_id=f"GRP-SD-{area}",
                name=f"Shutdown group: {area}",
                reason=f"Same shutdown window ({area}): {len(entries)} tasks, all materials ready",
                items=entries,
                total_hours=sum(e.estimated_hours for e in entries),
                specialties={s for e in entries for s in e.specialties_required},
                requires_shutdown=True,
            )
            groups.append(group)
        return groups

    @classmethod
    def find_all_groups(cls, items: list[BacklogEntry]) -> list[WorkPackageGroup]:
        """Run all grouping strategies and return combined results."""
        all_groups = []
        all_groups.extend(cls.group_by_equipment(items))
        all_groups.extend(cls.group_by_area(items))
        all_groups.extend(cls.group_by_shutdown(items))

        # Deduplicate: if same items appear in multiple groups, keep best
        seen_items: set[str] = set()
        unique_groups = []
        # Sort by total hours descending (bigger groups first)
        all_groups.sort(key=lambda g: g.total_hours, reverse=True)
        for group in all_groups:
            group_item_ids = {i.backlog_id for i in group.items}
            if not group_item_ids & seen_items:
                unique_groups.append(group)
                seen_items |= group_item_ids

        return unique_groups

    @staticmethod
    def stratify(items: list[BacklogEntry]) -> dict:
        """Stratify backlog by reason, priority, and readiness."""
        result = {
            "by_priority": defaultdict(int),
            "by_shutdown": {"requires_shutdown": 0, "online": 0},
            "by_materials": {"ready": 0, "not_ready": 0},
            "by_area": defaultdict(int),
            "total": len(items),
            "total_hours": sum(i.estimated_hours for i in items),
            "schedulable_now": 0,
        }

        for item in items:
            result["by_priority"][item.priority] += 1
            if item.shutdown_required:
                result["by_shutdown"]["requires_shutdown"] += 1
            else:
                result["by_shutdown"]["online"] += 1
            if item.materials_ready:
                result["by_materials"]["ready"] += 1
            else:
                result["by_materials"]["not_ready"] += 1
            result["by_area"][item.area_code] += 1
            if item.materials_ready and not item.shutdown_required:
                result["schedulable_now"] += 1

        return result
