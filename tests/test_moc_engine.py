"""Tests for Management of Change (MoC) Engine — Phase 5."""

import pytest

from tools.engines.moc_engine import MoCEngine
from tools.engines.state_machine import TransitionError
from tools.models.schemas import MoCStatus, MoCCategory, RiskLevel


def _make_moc(**kwargs):
    defaults = dict(
        plant_id="P1", title="Replace bearing type", description="Test MoC",
        category=MoCCategory.EQUIPMENT_MODIFICATION, requester_id="REQ-001",
        affected_equipment=["EQ-001", "EQ-002"], risk_level=RiskLevel.MEDIUM,
    )
    defaults.update(kwargs)
    return MoCEngine.create_moc(**defaults)


class TestCreateMoC:

    def test_creates_draft(self):
        moc = _make_moc()
        assert moc.status == MoCStatus.DRAFT
        assert moc.title == "Replace bearing type"
        assert len(moc.affected_equipment) == 2

    def test_default_risk_level(self):
        moc = MoCEngine.create_moc("P1", "Test", "Desc", MoCCategory.PROCESS_CHANGE, "REQ-001")
        assert moc.risk_level == RiskLevel.LOW


class TestFullLifecycle:

    def test_happy_path_6_transitions(self):
        moc = _make_moc()
        assert moc.status == MoCStatus.DRAFT

        moc, msg = MoCEngine.submit_moc(moc)
        assert moc.status == MoCStatus.SUBMITTED
        assert moc.submitted_at is not None

        moc, msg = MoCEngine.start_review(moc, "REV-001")
        assert moc.status == MoCStatus.REVIEWING
        assert moc.reviewer_id == "REV-001"

        moc, msg = MoCEngine.approve_moc(moc, "APR-001")
        assert moc.status == MoCStatus.APPROVED
        assert moc.approved_at is not None
        assert moc.approver_id == "APR-001"

        moc, msg = MoCEngine.start_implementation(moc)
        assert moc.status == MoCStatus.IMPLEMENTING

        moc, msg = MoCEngine.close_moc(moc)
        assert moc.status == MoCStatus.CLOSED
        assert moc.closed_at is not None

    def test_reject_and_resubmit(self):
        moc = _make_moc()
        moc, _ = MoCEngine.submit_moc(moc)
        moc, _ = MoCEngine.start_review(moc, "REV-001")
        moc, msg = MoCEngine.reject_moc(moc, "Too risky")
        assert moc.status == MoCStatus.REJECTED
        assert "rejected" in msg

        moc, _ = MoCEngine.resubmit_moc(moc)
        assert moc.status == MoCStatus.DRAFT


class TestInvalidTransitions:

    def test_cannot_approve_draft(self):
        moc = _make_moc()
        moc, msg = MoCEngine.approve_moc(moc, "APR-001")
        assert moc.status == MoCStatus.DRAFT
        assert "Cannot" in msg

    def test_cannot_close_draft(self):
        moc = _make_moc()
        moc, msg = MoCEngine.close_moc(moc)
        assert moc.status == MoCStatus.DRAFT
        assert "Cannot" in msg

    def test_closed_is_terminal(self):
        moc = _make_moc()
        moc, _ = MoCEngine.submit_moc(moc)
        moc, _ = MoCEngine.start_review(moc, "REV")
        moc, _ = MoCEngine.approve_moc(moc, "APR")
        moc, _ = MoCEngine.start_implementation(moc)
        moc, _ = MoCEngine.close_moc(moc)
        moc, msg = MoCEngine.submit_moc(moc)
        assert moc.status == MoCStatus.CLOSED
        assert "Cannot" in msg


class TestRiskAssessment:

    def test_low_risk_acceptable(self):
        moc = _make_moc(risk_level=RiskLevel.LOW, affected_equipment=["EQ-001"])
        result = MoCEngine.assess_risk(moc, "Minor change")
        assert result.risk_acceptable is True

    def test_critical_risk_not_acceptable(self):
        moc = _make_moc(risk_level=RiskLevel.CRITICAL)
        result = MoCEngine.assess_risk(moc, "Major overhaul")
        assert result.risk_acceptable is False

    def test_many_affected_equipment_adds_condition(self):
        moc = _make_moc(affected_equipment=[f"EQ-{i}" for i in range(10)])
        result = MoCEngine.assess_risk(moc, "Wide impact")
        assert len(result.conditions) > 0
        assert any("impact" in c.lower() for c in result.conditions)

    def test_equipment_modification_requires_engineering(self):
        moc = _make_moc(category=MoCCategory.EQUIPMENT_MODIFICATION)
        result = MoCEngine.assess_risk(moc, "New bearing type")
        assert any("engineering" in c.lower() for c in result.conditions)
