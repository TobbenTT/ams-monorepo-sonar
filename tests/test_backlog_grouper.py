"""
Test Suite: Backlog Grouper Engine (GAP-5, M3)
Validates grouping strategies and stratification.
"""

import pytest

from tools.engines.backlog_grouper import BacklogEntry, BacklogGrouper


@pytest.fixture
def sample_backlog_items():
    return [
        BacklogEntry("BL-1", "EQ-SAG-001", "BRY-SAG-ML-001", "BRY-SAG", "2_URGENT", ["MECHANICAL"], True, True, 8.0),
        BacklogEntry("BL-2", "EQ-SAG-001", "BRY-SAG-ML-001", "BRY-SAG", "3_NORMAL", ["MECHANICAL"], True, True, 4.0),
        BacklogEntry("BL-3", "EQ-PMP-001", "PMP-SLP-001", "PMP-SLP", "3_NORMAL", ["MECHANICAL"], False, True, 2.0),
        BacklogEntry("BL-4", "EQ-PMP-002", "PMP-SLP-002", "PMP-SLP", "3_NORMAL", ["MECHANICAL"], False, True, 2.0),
        BacklogEntry("BL-5", "EQ-CVR-001", "CVY-CVR-001", "CVY-CVR", "4_PLANNED", ["ELECTRICAL"], False, True, 1.0),
        BacklogEntry("BL-6", "EQ-SAG-002", "BRY-SAG-ML-002", "BRY-SAG", "2_URGENT", ["MECHANICAL"], True, False, 6.0),
    ]


class TestGroupByEquipment:
    def test_groups_same_equipment(self, sample_backlog_items):
        groups = BacklogGrouper.group_by_equipment(sample_backlog_items)
        sag_group = [g for g in groups if "BRY-SAG-ML-001" in g.name]
        assert len(sag_group) == 1
        assert len(sag_group[0].items) == 2

    def test_no_single_item_groups(self, sample_backlog_items):
        groups = BacklogGrouper.group_by_equipment(sample_backlog_items)
        for g in groups:
            assert len(g.items) >= 2


class TestGroupByArea:
    def test_groups_same_area(self, sample_backlog_items):
        groups = BacklogGrouper.group_by_area(sample_backlog_items)
        sag_area = [g for g in groups if "BRY-SAG" in g.name]
        assert len(sag_area) == 1
        assert len(sag_area[0].items) >= 2

    def test_pump_area_grouped(self, sample_backlog_items):
        groups = BacklogGrouper.group_by_area(sample_backlog_items)
        pump_area = [g for g in groups if "PMP-SLP" in g.name]
        assert len(pump_area) == 1
        assert len(pump_area[0].items) == 2


class TestGroupByShutdown:
    def test_shutdown_items_grouped(self, sample_backlog_items):
        groups = BacklogGrouper.group_by_shutdown(sample_backlog_items)
        # BL-1 and BL-2 both need shutdown and have materials ready, same area
        if groups:
            for g in groups:
                assert g.requires_shutdown is True
                for item in g.items:
                    assert item.materials_ready is True

    def test_unready_materials_excluded(self, sample_backlog_items):
        groups = BacklogGrouper.group_by_shutdown(sample_backlog_items)
        # BL-6 needs shutdown but materials NOT ready — should be excluded
        for g in groups:
            for item in g.items:
                assert item.backlog_id != "BL-6"


class TestFindAllGroups:
    def test_deduplication(self, sample_backlog_items):
        groups = BacklogGrouper.find_all_groups(sample_backlog_items)
        all_item_ids = []
        for g in groups:
            for item in g.items:
                all_item_ids.append(item.backlog_id)
        # No item should appear in multiple groups
        assert len(all_item_ids) == len(set(all_item_ids))


class TestStratification:
    def test_stratify_totals(self, sample_backlog_items):
        result = BacklogGrouper.stratify(sample_backlog_items)
        assert result["total"] == 6
        assert result["total_hours"] == 23.0

    def test_stratify_by_priority(self, sample_backlog_items):
        result = BacklogGrouper.stratify(sample_backlog_items)
        assert result["by_priority"]["2_URGENT"] == 2
        assert result["by_priority"]["3_NORMAL"] == 3
        assert result["by_priority"]["4_PLANNED"] == 1

    def test_stratify_schedulable(self, sample_backlog_items):
        result = BacklogGrouper.stratify(sample_backlog_items)
        # Schedulable = materials_ready AND NOT shutdown_required
        assert result["schedulable_now"] == 3  # BL-3, BL-4, BL-5

    def test_stratify_by_area(self, sample_backlog_items):
        result = BacklogGrouper.stratify(sample_backlog_items)
        assert result["by_area"]["BRY-SAG"] == 3
        assert result["by_area"]["PMP-SLP"] == 2
