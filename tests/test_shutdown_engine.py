"""Tests for Shutdown Execution Tracking Engine — Phase 5."""

import pytest
from datetime import datetime, timedelta

from tools.engines.shutdown_engine import ShutdownEngine
from tools.models.schemas import ShutdownStatus


def _make_shutdown(hours=48):
    start = datetime(2025, 6, 1, 6, 0, 0)
    end = start + timedelta(hours=hours)
    return ShutdownEngine.create_shutdown(
        "P1", "Major Turnaround", start, end, ["WO-001", "WO-002", "WO-003"],
    )


class TestCreateShutdown:

    def test_creates_planned(self):
        event = _make_shutdown()
        assert event.status == ShutdownStatus.PLANNED
        assert event.planned_hours == 48.0
        assert len(event.work_orders) == 3

    def test_zero_duration(self):
        start = datetime(2025, 6, 1, 6, 0, 0)
        event = ShutdownEngine.create_shutdown("P1", "Quick", start, start, ["WO-001"])
        assert event.planned_hours == 0.0


class TestStartShutdown:

    def test_planned_to_in_progress(self):
        event = _make_shutdown()
        event, msg = ShutdownEngine.start_shutdown(event)
        assert event.status == ShutdownStatus.IN_PROGRESS
        assert event.actual_start is not None
        assert "started" in msg

    def test_cannot_start_completed(self):
        event = _make_shutdown()
        event, _ = ShutdownEngine.start_shutdown(event)
        event, _ = ShutdownEngine.complete_shutdown(event)
        event, msg = ShutdownEngine.start_shutdown(event)
        assert event.status == ShutdownStatus.COMPLETED
        assert "Cannot" in msg


class TestUpdateProgress:

    def test_partial_completion(self):
        event = _make_shutdown()
        event, _ = ShutdownEngine.start_shutdown(event)
        event = ShutdownEngine.update_progress(event, ["WO-001", "WO-002"])
        assert event.completion_pct == pytest.approx(66.7, abs=0.1)

    def test_delay_tracking(self):
        event = _make_shutdown()
        event, _ = ShutdownEngine.start_shutdown(event)
        event = ShutdownEngine.update_progress(event, [], delay_hours=4.0, delay_reasons=["Material delay"])
        assert event.delay_hours == 4.0
        assert "Material delay" in event.delay_reasons


class TestCompleteShutdown:

    def test_in_progress_to_completed(self):
        event = _make_shutdown()
        event, _ = ShutdownEngine.start_shutdown(event)
        event, msg = ShutdownEngine.complete_shutdown(event)
        assert event.status == ShutdownStatus.COMPLETED
        assert event.actual_end is not None
        assert "completed" in msg


class TestCancelShutdown:

    def test_planned_to_cancelled(self):
        event = _make_shutdown()
        event, msg = ShutdownEngine.cancel_shutdown(event)
        assert event.status == ShutdownStatus.CANCELLED
        assert "cancelled" in msg

    def test_cannot_cancel_in_progress(self):
        event = _make_shutdown()
        event, _ = ShutdownEngine.start_shutdown(event)
        event, msg = ShutdownEngine.cancel_shutdown(event)
        assert event.status == ShutdownStatus.IN_PROGRESS
        assert "Cannot" in msg


class TestMetrics:

    def test_schedule_compliance(self):
        event = _make_shutdown()
        event, _ = ShutdownEngine.start_shutdown(event)
        event = ShutdownEngine.update_progress(event, ["WO-001", "WO-002", "WO-003"])
        metrics = ShutdownEngine.calculate_metrics(event)
        assert metrics.scope_completion_pct == 100.0
        assert metrics.schedule_compliance_pct > 0

    def test_total_delays(self):
        event = _make_shutdown()
        event, _ = ShutdownEngine.start_shutdown(event)
        event = ShutdownEngine.update_progress(event, [], delay_hours=8.0)
        metrics = ShutdownEngine.calculate_metrics(event)
        assert metrics.total_delays_hours == 8.0
