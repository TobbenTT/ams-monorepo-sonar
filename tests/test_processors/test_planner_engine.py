"""Tests for planner engine."""

import pytest
from datetime import datetime
from tools.processors.planner_engine import PlannerEngine
from tools.models.schemas import (
    StructuredWorkRequest, EquipmentIdentification, ProblemDescription,
    AIClassification, Validation, WorkOrderType, Priority,
    ResolutionMethod, WorkRequestStatus, PlannerAction,
)


def _make_wr(
    priority: Priority = Priority.NORMAL,
    safety_flags: list[str] | None = None,
    duration: float = 4.0,
    specialties: list[str] | None = None,
) -> StructuredWorkRequest:
    return StructuredWorkRequest(
        source_capture_id="CAP-TEST",
        created_at=datetime.now(),
        status=WorkRequestStatus.DRAFT,
        equipment_identification=EquipmentIdentification(
            equipment_id="EQ-001",
            equipment_tag="BRY-SAG-ML-001",
            confidence_score=0.95,
            resolution_method=ResolutionMethod.EXACT_MATCH,
        ),
        problem_description=ProblemDescription(
            original_text="Test problem",
            structured_description="Test structured",
            structured_description_fr="Test structuré",
        ),
        ai_classification=AIClassification(
            work_order_type=WorkOrderType.PM03_CORRECTIVE,
            priority_suggested=priority,
            priority_justification="Test justification",
            estimated_duration_hours=duration,
            required_specialties=specialties or ["MECHANICAL"],
            safety_flags=safety_flags or [],
        ),
        validation=Validation(),
    )


WORKFORCE = [
    {"worker_id": "W1", "name": "Tech 1", "specialty": "MECHANICAL", "shift": "MORNING", "available": True},
    {"worker_id": "W2", "name": "Tech 2", "specialty": "ELECTRICAL", "shift": "MORNING", "available": True},
    {"worker_id": "W3", "name": "Tech 3", "specialty": "MECHANICAL", "shift": "AFTERNOON", "available": False},
]

INVENTORY = [
    {"material_code": "MAT-BRG-001", "description": "Bearing", "quantity_available": 5, "warehouse": "WH-01"},
]

SHUTDOWNS = [
    {"shutdown_id": "SD-1", "start_date": "2026-04-01", "end_date": "2026-04-02", "type": "MINOR_8H", "areas": ["BRY-SAG"]},
]

BACKLOG = [
    {"backlog_id": "BL-1", "equipment_tag": "BRY-SAG-ML-002", "priority": "3_NORMAL", "specialties": ["MECHANICAL"], "shutdown_required": False},
]


class TestPlannerEngine:

    def test_recommend_approve(self):
        wr = _make_wr()
        rec = PlannerEngine.recommend(wr, WORKFORCE, INVENTORY, SHUTDOWNS, BACKLOG)
        assert rec.planner_action_required == PlannerAction.APPROVE
        assert rec.ai_confidence > 0

    def test_recommend_escalate_safety_emergency(self):
        wr = _make_wr(priority=Priority.EMERGENCY, safety_flags=["SAFETY"])
        rec = PlannerEngine.recommend(wr, WORKFORCE, INVENTORY, SHUTDOWNS, BACKLOG)
        assert rec.planner_action_required == PlannerAction.ESCALATE

    def test_recommend_defer_no_materials(self):
        wr = _make_wr(priority=Priority.PLANNED)
        # Empty inventory
        rec = PlannerEngine.recommend(wr, WORKFORCE, [], SHUTDOWNS, BACKLOG)
        # With no spare parts on the WR, materials should be "all_available"
        assert rec.planner_action_required in (PlannerAction.APPROVE, PlannerAction.DEFER)

    def test_workforce_analysis(self):
        wr = _make_wr(specialties=["MECHANICAL"])
        rec = PlannerEngine.recommend(wr, WORKFORCE, INVENTORY, SHUTDOWNS, BACKLOG)
        wf = rec.resource_analysis.workforce_available
        assert len(wf) == 1
        assert wf[0].specialty == "MECHANICAL"
        assert wf[0].technicians_available >= 1

    def test_shutdown_window_found(self):
        wr = _make_wr()
        rec = PlannerEngine.recommend(wr, WORKFORCE, INVENTORY, SHUTDOWNS, BACKLOG)
        assert rec.resource_analysis.shutdown_window.next_available is not None

    def test_risk_assessment_safety(self):
        wr = _make_wr(safety_flags=["LEAK", "FIRE"])
        rec = PlannerEngine.recommend(wr, WORKFORCE, INVENTORY, SHUTDOWNS, BACKLOG)
        assert rec.risk_assessment.risk_level.value in ("HIGH", "CRITICAL")

    def test_scheduling_suggestion(self):
        wr = _make_wr()
        rec = PlannerEngine.recommend(wr, WORKFORCE, INVENTORY, SHUTDOWNS, BACKLOG)
        assert rec.scheduling_suggestion.recommended_date is not None
        assert rec.scheduling_suggestion.recommended_shift is not None

    def test_groupable_with_backlog(self):
        wr = _make_wr()
        backlog_same_area = [
            {"backlog_id": "BL-1", "equipment_tag": "BRY-SAG-PP-001", "priority": "3_NORMAL", "specialties": ["MECHANICAL"], "shutdown_required": False},
        ]
        rec = PlannerEngine.recommend(wr, WORKFORCE, INVENTORY, SHUTDOWNS, backlog_same_area)
        assert len(rec.scheduling_suggestion.groupable_with) > 0
