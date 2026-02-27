"""Tests for CAPAEngine — REF-12 Rec 8: ISO 55002 §10.2 CAPA Tracking."""

import pytest
from datetime import date, datetime

from tools.engines.capa_engine import CAPAEngine
from tools.models.schemas import (
    CAPAItem,
    CAPAStatus,
    CAPAType,
    PDCAPhase,
)


class TestCreateCAPA:
    def test_basic_creation(self):
        capa = CAPAEngine.create_capa(
            capa_type=CAPAType.CORRECTIVE,
            title="Belt conveyor misalignment",
            description="Recurring misalignment on BRY-BC-001",
            plant_id="OCP-JFC1",
            source="variance_alert",
            assigned_to="eng-001",
        )
        assert capa.status == CAPAStatus.OPEN
        assert capa.current_phase == PDCAPhase.PLAN
        assert capa.capa_type == CAPAType.CORRECTIVE
        assert capa.title == "Belt conveyor misalignment"

    def test_preventive_with_target_date(self):
        capa = CAPAEngine.create_capa(
            capa_type=CAPAType.PREVENTIVE,
            title="Implement vibration monitoring",
            description="Add CBM sensors to critical pumps",
            plant_id="OCP-JFC1",
            source="management_review",
            target_date=date(2025, 6, 30),
        )
        assert capa.capa_type == CAPAType.PREVENTIVE
        assert capa.target_date == date(2025, 6, 30)


class TestAdvancePhase:
    @pytest.fixture
    def new_capa(self):
        return CAPAEngine.create_capa(
            capa_type=CAPAType.CORRECTIVE,
            title="Test CAPA",
            description="Test",
            plant_id="P1",
            source="test",
        )

    def test_plan_to_do(self, new_capa):
        capa, msg = CAPAEngine.advance_phase(new_capa, PDCAPhase.DO)
        assert capa.current_phase == PDCAPhase.DO
        assert "DO" in msg

    def test_do_to_check(self, new_capa):
        new_capa.current_phase = PDCAPhase.DO
        capa, msg = CAPAEngine.advance_phase(new_capa, PDCAPhase.CHECK)
        assert capa.current_phase == PDCAPhase.CHECK

    def test_check_to_act(self, new_capa):
        new_capa.current_phase = PDCAPhase.CHECK
        capa, msg = CAPAEngine.advance_phase(new_capa, PDCAPhase.ACT)
        assert capa.current_phase == PDCAPhase.ACT

    def test_check_to_do_rework(self, new_capa):
        """CHECK→DO is valid (rework cycle)."""
        new_capa.current_phase = PDCAPhase.CHECK
        capa, msg = CAPAEngine.advance_phase(new_capa, PDCAPhase.DO)
        assert capa.current_phase == PDCAPhase.DO

    def test_act_to_plan_new_cycle(self, new_capa):
        """ACT→PLAN starts a new PDCA cycle."""
        new_capa.current_phase = PDCAPhase.ACT
        capa, msg = CAPAEngine.advance_phase(new_capa, PDCAPhase.PLAN)
        assert capa.current_phase == PDCAPhase.PLAN

    def test_invalid_transition(self, new_capa):
        """PLAN→CHECK is not allowed (must go through DO)."""
        capa, msg = CAPAEngine.advance_phase(new_capa, PDCAPhase.CHECK)
        assert capa.current_phase == PDCAPhase.PLAN  # Unchanged
        assert "Cannot transition" in msg


class TestUpdateStatus:
    @pytest.fixture
    def open_capa(self):
        return CAPAEngine.create_capa(
            capa_type=CAPAType.CORRECTIVE,
            title="Test",
            description="Test",
            plant_id="P1",
            source="test",
        )

    def test_open_to_in_progress(self, open_capa):
        capa, msg = CAPAEngine.update_status(open_capa, CAPAStatus.IN_PROGRESS)
        assert capa.status == CAPAStatus.IN_PROGRESS

    def test_in_progress_to_closed(self, open_capa):
        open_capa.status = CAPAStatus.IN_PROGRESS
        capa, msg = CAPAEngine.update_status(open_capa, CAPAStatus.CLOSED)
        assert capa.status == CAPAStatus.CLOSED
        assert capa.closed_at is not None

    def test_closed_to_verified(self, open_capa):
        open_capa.status = CAPAStatus.CLOSED
        open_capa.closed_at = datetime.now()
        capa, msg = CAPAEngine.update_status(open_capa, CAPAStatus.VERIFIED, effectiveness_verified=True)
        assert capa.status == CAPAStatus.VERIFIED
        assert capa.effectiveness_verified is True
        assert capa.verified_at is not None

    def test_verify_requires_effectiveness(self, open_capa):
        open_capa.status = CAPAStatus.CLOSED
        open_capa.closed_at = datetime.now()
        capa, msg = CAPAEngine.update_status(open_capa, CAPAStatus.VERIFIED, effectiveness_verified=False)
        assert capa.status == CAPAStatus.CLOSED  # Unchanged
        assert "effectiveness" in msg.lower()

    def test_cannot_skip_to_closed(self, open_capa):
        """OPEN→CLOSED not allowed (must go through IN_PROGRESS)."""
        capa, msg = CAPAEngine.update_status(open_capa, CAPAStatus.CLOSED)
        assert capa.status == CAPAStatus.OPEN
        assert "Cannot transition" in msg

    def test_reopen_from_closed(self, open_capa):
        open_capa.status = CAPAStatus.CLOSED
        open_capa.closed_at = datetime.now()
        capa, msg = CAPAEngine.update_status(open_capa, CAPAStatus.IN_PROGRESS)
        assert capa.status == CAPAStatus.IN_PROGRESS

    def test_verified_is_terminal(self, open_capa):
        open_capa.status = CAPAStatus.VERIFIED
        capa, msg = CAPAEngine.update_status(open_capa, CAPAStatus.IN_PROGRESS)
        assert capa.status == CAPAStatus.VERIFIED  # Cannot change


class TestActions:
    def test_add_planned_action(self):
        capa = CAPAEngine.create_capa(
            capa_type=CAPAType.CORRECTIVE, title="Test",
            description="Test", plant_id="P1", source="test",
        )
        capa = CAPAEngine.add_action(capa, "Investigate root cause")
        assert "Investigate root cause" in capa.actions_planned

    def test_add_completed_action(self):
        capa = CAPAEngine.create_capa(
            capa_type=CAPAType.CORRECTIVE, title="Test",
            description="Test", plant_id="P1", source="test",
        )
        capa = CAPAEngine.add_action(capa, "Root cause identified", completed=True)
        assert "Root cause identified" in capa.actions_completed


class TestOverdue:
    def test_overdue(self):
        capa = CAPAEngine.create_capa(
            capa_type=CAPAType.CORRECTIVE, title="Test",
            description="Test", plant_id="P1", source="test",
            target_date=date(2025, 1, 1),
        )
        assert CAPAEngine.is_overdue(capa, reference_date=date(2025, 2, 1))

    def test_not_overdue(self):
        capa = CAPAEngine.create_capa(
            capa_type=CAPAType.CORRECTIVE, title="Test",
            description="Test", plant_id="P1", source="test",
            target_date=date(2025, 12, 31),
        )
        assert not CAPAEngine.is_overdue(capa, reference_date=date(2025, 6, 1))

    def test_closed_not_overdue(self):
        capa = CAPAEngine.create_capa(
            capa_type=CAPAType.CORRECTIVE, title="Test",
            description="Test", plant_id="P1", source="test",
            target_date=date(2025, 1, 1),
        )
        capa.status = CAPAStatus.CLOSED
        capa.closed_at = datetime.now()
        assert not CAPAEngine.is_overdue(capa, reference_date=date(2025, 6, 1))


class TestSummary:
    def test_summary_counts(self):
        capas = [
            CAPAEngine.create_capa(CAPAType.CORRECTIVE, f"C{i}", "desc", "P1", "test")
            for i in range(5)
        ]
        capas[0].status = CAPAStatus.IN_PROGRESS
        capas[1].status = CAPAStatus.CLOSED
        capas[1].closed_at = datetime.now()
        capas[2].status = CAPAStatus.VERIFIED
        capas[2].effectiveness_verified = True
        capas[2].verified_at = datetime.now()

        summary = CAPAEngine.get_summary(capas)
        assert summary["total"] == 5
        assert summary["open"] == 2
        assert summary["in_progress"] == 1
        assert summary["closed"] == 1
        assert summary["verified"] == 1
        assert summary["corrective"] == 5
        assert summary["preventive"] == 0
