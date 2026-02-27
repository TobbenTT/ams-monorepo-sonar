"""Tests for PII redactor."""

import pytest
from tools.processors.pii_redactor import redact


class TestPIIRedactor:

    def test_redact_email(self):
        text = "Contact john.doe@example.com for details"
        cleaned, items = redact(text)
        assert "[REDACTED_EMAIL]" in cleaned
        assert "john.doe@example.com" in items

    def test_redact_phone(self):
        text = "Call +33 612 345 678 for support"
        cleaned, items = redact(text)
        assert "[REDACTED_PHONE]" in cleaned

    def test_redact_employee_id(self):
        text = "Assigned to EMP-12345 for review"
        cleaned, items = redact(text)
        assert "[REDACTED_ID]" in cleaned
        assert "EMP-12345" in items

    def test_redact_french_name(self):
        text = "Rapport de M. Dupont sur la pompe"
        cleaned, items = redact(text)
        assert "[REDACTED_NAME]" in cleaned

    def test_redact_reported_by(self):
        text = "Reported by Ahmed Benali during inspection"
        cleaned, items = redact(text)
        assert "[REDACTED_NAME]" in cleaned

    def test_no_pii(self):
        text = "Pump bearing worn, needs replacement"
        cleaned, items = redact(text)
        assert cleaned == text
        assert items == []

    def test_empty_text(self):
        cleaned, items = redact("")
        assert cleaned == ""
        assert items == []

    def test_mixed_pii(self):
        text = "M. Dupont (john@example.com, EMP-999) reported the issue"
        cleaned, items = redact(text)
        assert "[REDACTED_EMAIL]" in cleaned
        assert "[REDACTED_ID]" in cleaned
        assert "john@example.com" not in cleaned
