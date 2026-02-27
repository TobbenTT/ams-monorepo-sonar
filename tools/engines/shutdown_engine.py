"""Shutdown Execution Tracking Engine — Phase 5.

Tracks shutdown maintenance events, actual vs planned comparison,
delay tracking, and completion metrics.

Deterministic — no LLM required.
"""

from datetime import datetime

from tools.engines.state_machine import StateMachine
from tools.models.schemas import (
    ShutdownEvent, ShutdownStatus, ShutdownMetrics,
)


class ShutdownEngine:
    """Manages shutdown execution lifecycle and metrics."""

    @staticmethod
    def create_shutdown(
        plant_id: str,
        name: str,
        planned_start: datetime,
        planned_end: datetime,
        work_orders: list[str],
    ) -> ShutdownEvent:
        """Create a PLANNED shutdown event."""
        planned_hours = max(0.0, (planned_end - planned_start).total_seconds() / 3600)
        return ShutdownEvent(
            plant_id=plant_id,
            name=name,
            planned_start=planned_start,
            planned_end=planned_end,
            planned_hours=round(planned_hours, 1),
            work_orders=work_orders,
        )

    @staticmethod
    def start_shutdown(event: ShutdownEvent) -> tuple[ShutdownEvent, str]:
        """Transition PLANNED → IN_PROGRESS."""
        try:
            StateMachine.validate_transition("shutdown", event.status.value, "IN_PROGRESS")
        except Exception as e:
            return event, f"Cannot start: {e}"

        event.status = ShutdownStatus.IN_PROGRESS
        event.actual_start = datetime.now()
        return event, "Shutdown started"

    @staticmethod
    def update_progress(
        event: ShutdownEvent,
        completed_wos: list[str],
        delay_hours: float = 0.0,
        delay_reasons: list[str] | None = None,
    ) -> ShutdownEvent:
        """Update shutdown progress with completed work orders and delays."""
        event.completed_work_orders = completed_wos
        total_wos = len(event.work_orders)
        completed_count = len([wo for wo in completed_wos if wo in event.work_orders])
        event.completion_pct = round((completed_count / total_wos * 100) if total_wos > 0 else 0.0, 1)

        if delay_hours > 0:
            event.delay_hours += delay_hours
        if delay_reasons:
            event.delay_reasons.extend(delay_reasons)

        if event.actual_start:
            elapsed = (datetime.now() - event.actual_start).total_seconds() / 3600
            event.actual_hours = round(elapsed, 1)

        return event

    @staticmethod
    def complete_shutdown(event: ShutdownEvent) -> tuple[ShutdownEvent, str]:
        """Transition IN_PROGRESS → COMPLETED."""
        try:
            StateMachine.validate_transition("shutdown", event.status.value, "COMPLETED")
        except Exception as e:
            return event, f"Cannot complete: {e}"

        event.status = ShutdownStatus.COMPLETED
        event.actual_end = datetime.now()
        if event.actual_start:
            event.actual_hours = round(
                (event.actual_end - event.actual_start).total_seconds() / 3600, 1
            )

        total_wos = len(event.work_orders)
        completed_count = len([wo for wo in event.completed_work_orders if wo in event.work_orders])
        event.completion_pct = round((completed_count / total_wos * 100) if total_wos > 0 else 100.0, 1)

        return event, "Shutdown completed"

    @staticmethod
    def cancel_shutdown(event: ShutdownEvent) -> tuple[ShutdownEvent, str]:
        """Transition PLANNED → CANCELLED."""
        try:
            StateMachine.validate_transition("shutdown", event.status.value, "CANCELLED")
        except Exception as e:
            return event, f"Cannot cancel: {e}"

        event.status = ShutdownStatus.CANCELLED
        return event, "Shutdown cancelled"

    @staticmethod
    def calculate_metrics(event: ShutdownEvent) -> ShutdownMetrics:
        """Calculate shutdown performance metrics."""
        planned_hours = event.planned_hours if event.planned_hours > 0 else 1.0
        actual_hours = event.actual_hours if event.actual_hours > 0 else planned_hours

        schedule_compliance = min(100.0, round((planned_hours / actual_hours) * 100, 1))
        planned_vs_actual = round(planned_hours / actual_hours, 2) if actual_hours > 0 else 1.0

        total_wos = len(event.work_orders)
        completed_count = len([wo for wo in event.completed_work_orders if wo in event.work_orders])
        scope_completion = round((completed_count / total_wos * 100) if total_wos > 0 else 0.0, 1)

        return ShutdownMetrics(
            shutdown_id=event.shutdown_id,
            schedule_compliance_pct=schedule_compliance,
            scope_completion_pct=scope_completion,
            planned_vs_actual_ratio=planned_vs_actual,
            total_delays_hours=event.delay_hours,
        )
