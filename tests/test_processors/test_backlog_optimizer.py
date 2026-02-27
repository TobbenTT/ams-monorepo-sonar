"""Tests for backlog optimizer."""

import pytest
from datetime import date
from tools.processors.backlog_optimizer import BacklogOptimizer
from tools.models.schemas import (
    BacklogItem, Priority, BacklogWOType, BacklogStatus,
)


def _make_item(
    backlog_id: str = "BL-001",
    equipment_tag: str = "BRY-SAG-ML-001",
    priority: Priority = Priority.NORMAL,
    materials_ready: bool = True,
    shutdown_required: bool = False,
    age_days: int = 10,
    hours: float = 4.0,
) -> BacklogItem:
    return BacklogItem(
        backlog_id=backlog_id,
        work_request_id="WR-001",
        equipment_id="EQ-001",
        equipment_tag=equipment_tag,
        priority=priority,
        work_order_type=BacklogWOType.PM02,
        created_date=date.today(),
        age_days=age_days,
        status=BacklogStatus.AWAITING_APPROVAL,
        estimated_duration_hours=hours,
        required_specialties=["MECHANICAL"],
        materials_ready=materials_ready,
        shutdown_required=shutdown_required,
    )


WORKFORCE = [
    {"worker_id": "W1", "specialty": "MECHANICAL", "shift": "MORNING", "available": True},
    {"worker_id": "W2", "specialty": "ELECTRICAL", "shift": "MORNING", "available": True},
]

SHUTDOWNS = [
    {"shutdown_id": "SD-1", "start_date": (date.today().isoformat()), "end_date": (date.today().isoformat()), "type": "MINOR_8H", "areas": ["BRY-SAG"]},
]


class TestBacklogOptimizer:

    def test_empty_backlog(self):
        result = BacklogOptimizer.optimize([], WORKFORCE, SHUTDOWNS, 30)
        assert result.total_backlog_items == 0
        assert result.items_schedulable_now == 0

    def test_single_item(self):
        items = [_make_item()]
        result = BacklogOptimizer.optimize(items, WORKFORCE, SHUTDOWNS, 30)
        assert result.total_backlog_items == 1
        assert result.items_schedulable_now == 1
        assert len(result.work_packages) >= 1

    def test_stratification(self):
        items = [
            _make_item("BL-1", priority=Priority.URGENT),
            _make_item("BL-2", priority=Priority.NORMAL, materials_ready=False),
            _make_item("BL-3", priority=Priority.PLANNED, shutdown_required=True),
        ]
        result = BacklogOptimizer.optimize(items, WORKFORCE, SHUTDOWNS, 30)
        strat = result.stratification
        assert strat.by_priority["2_URGENT"] == 1
        assert strat.by_priority["3_NORMAL"] == 1
        assert strat.by_reason["AWAITING_MATERIALS"] == 1

    def test_schedule_generation(self):
        items = [
            _make_item("BL-1", "BRY-SAG-ML-001"),
            _make_item("BL-2", "BRY-SAG-ML-002"),
            _make_item("BL-3", "BRY-CYC-PP-001"),
        ]
        result = BacklogOptimizer.optimize(items, WORKFORCE, SHUTDOWNS, 30)
        assert len(result.schedule_proposal) >= 1

    def test_overdue_alert(self):
        items = [_make_item("BL-1", age_days=45)]
        result = BacklogOptimizer.optimize(items, WORKFORCE, SHUTDOWNS, 30)
        overdue_alerts = [a for a in result.alerts if a.type.value == "OVERDUE"]
        assert len(overdue_alerts) == 1

    def test_material_delay_alert(self):
        items = [_make_item("BL-1", materials_ready=False)]
        result = BacklogOptimizer.optimize(items, WORKFORCE, SHUTDOWNS, 30)
        material_alerts = [a for a in result.alerts if a.type.value == "MATERIAL_DELAY"]
        assert len(material_alerts) == 1

    def test_grouping_same_area(self):
        items = [
            _make_item("BL-1", "BRY-SAG-ML-001", hours=4.0),
            _make_item("BL-2", "BRY-SAG-PP-001", hours=3.0),
        ]
        result = BacklogOptimizer.optimize(items, WORKFORCE, SHUTDOWNS, 30)
        # Should find groupable items in same area (BRY-SAG)
        assert result.total_backlog_items == 2
