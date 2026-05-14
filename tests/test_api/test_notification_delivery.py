"""Tests del email gateway / notification delivery (SF-683).

Estrategia: como SMTP_HOST no está seteado en tests, send_email() devuelve
False sin fallar; el service registra el delivery con status=RETRY o FAILED
y nunca bloquea la operación.
"""

import pytest

from api.database.models import NotificationDeliveryModel
from api.services import notification_delivery_service as svc


# ── Tabla creada por test_db fixture ───────────────────────────────
def _mk_wr(db_session, request_id="WR-TEST-001"):
    """Mock minimal WR — solo necesitamos los campos que usa el service."""
    class _WR:
        pass
    wr = _WR()
    wr.request_id = request_id
    wr.description = "Test description"
    wr.priority_code = "P3"
    wr.status = "DRAFT"
    wr.created_by = "user-test"
    return wr


class TestNotificationModel:
    def test_table_created(self, db_session):
        """La tabla notification_deliveries existe tras create_all."""
        # No raise = OK
        rows = db_session.query(NotificationDeliveryModel).all()
        assert rows == []


class TestEnqueueNotification:
    def test_enqueue_creates_row(self, db_session):
        """enqueue_notification persiste el registro con retries=1 (intentó enviar)."""
        rec = svc.enqueue_notification(
            db_session,
            event_type="WORK_REQUEST_CREATED",
            entity_type="work_request",
            entity_id="WR-1",
            recipient="alice@example.com",
            template="WORK_REQUEST_CREATED_REQUESTER",
            context={"request_id": "WR-1", "description": "X", "status": "DRAFT"},
        )
        assert rec.id is not None
        assert rec.recipient == "alice@example.com"
        assert rec.retries >= 1  # _send_one corre, incrementa retries
        # Sin SMTP configurado, queda RETRY o FAILED
        assert rec.status in ("RETRY", "FAILED")
        assert rec.error_message  # describe el motivo

    def test_unknown_template_marks_failed(self, db_session):
        rec = svc.enqueue_notification(
            db_session,
            event_type="OTHER",
            entity_type="work_request",
            entity_id="WR-2",
            recipient="bob@example.com",
            template="TEMPLATE_INEXISTENTE",
            context={},
        )
        assert rec.status == "FAILED"
        assert "render" in (rec.error_message or "").lower() or "template" in (rec.error_message or "").lower()


class TestDomainHelpers:
    def test_notify_wr_created_with_both_emails(self, db_session):
        wr = _mk_wr(db_session)
        svc.notify_wr_created(
            db_session, wr,
            requester_email="alice@example.com",
            approver_email="boss@example.com",
        )
        rows = db_session.query(NotificationDeliveryModel).all()
        assert len(rows) == 2
        recipients = {r.recipient for r in rows}
        assert recipients == {"alice@example.com", "boss@example.com"}

    def test_notify_wr_created_skips_when_no_email(self, db_session):
        wr = _mk_wr(db_session)
        svc.notify_wr_created(db_session, wr, requester_email=None, approver_email=None)
        assert db_session.query(NotificationDeliveryModel).count() == 0

    def test_notify_wr_approved(self, db_session):
        wr = _mk_wr(db_session)
        svc.notify_wr_approved(db_session, wr, requester_email="alice@example.com", approver_username="bob", comment="OK")
        rows = db_session.query(NotificationDeliveryModel).all()
        assert len(rows) == 1
        assert rows[0].event_type == "WORK_REQUEST_APPROVED"
        assert rows[0].template == "WORK_REQUEST_APPROVED"

    def test_notify_wr_rejected(self, db_session):
        wr = _mk_wr(db_session)
        svc.notify_wr_rejected(db_session, wr, requester_email="alice@example.com", reason="no presupuesto")
        rows = db_session.query(NotificationDeliveryModel).all()
        assert len(rows) == 1
        assert rows[0].event_type == "WORK_REQUEST_REJECTED"


class TestRouterEndpoints:
    def test_list_deliveries_empty(self, client):
        r = client.get("/api/v1/notification-deliveries/")
        assert r.status_code == 200
        assert r.json() == []

    def test_list_filters_by_entity(self, client, db_session):
        svc.notify_wr_approved(db_session, _mk_wr(db_session, "WR-A"), requester_email="a@x.com", approver_username="u")
        svc.notify_wr_approved(db_session, _mk_wr(db_session, "WR-B"), requester_email="b@x.com", approver_username="u")
        r = client.get("/api/v1/notification-deliveries/?entity_id=WR-A")
        assert r.status_code == 200
        body = r.json()
        assert len(body) == 1
        assert body[0]["entity_id"] == "WR-A"

    def test_retry_endpoint_returns_stats(self, client):
        r = client.post("/api/v1/notification-deliveries/retry")
        assert r.status_code == 200
        body = r.json()
        assert "processed" in body
        assert "sent" in body
        assert "failed" in body
