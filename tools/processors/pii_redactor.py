"""PII Redactor — strips personal data from text before AI processing.

Regex-based, deterministic — no LLM required.
Handles French, English, Arabic name patterns, emails, phones, employee IDs.
"""

import re


# ── Patterns ──────────────────────────────────────────────────────────

_EMAIL_RE = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b")
_PHONE_RE = re.compile(r"(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}")
_EMPLOYEE_ID_RE = re.compile(r"\b(?:EMP|MAT|ID)[-#]?\d{3,8}\b", re.IGNORECASE)

# French-style "M./Mme/Dr + Capitalized Name" patterns
_FR_NAME_RE = re.compile(
    r"\b(?:M\.|Mme|Mlle|Dr|Ing|Sr|Mr|Mrs|Ms)\.?\s+[A-Z\u00C0-\u024F][a-z\u00C0-\u024F]+(?:\s+[A-Z\u00C0-\u024F][a-z\u00C0-\u024F]+)?"
)

# "reported by / signalé par / dit par" + Name
_REPORTED_BY_RE = re.compile(
    r"(?:reported by|signalé par|dit par|envoyé par|from|de la part de)\s+([A-Z\u00C0-\u024F][a-z\u00C0-\u024F]+(?:\s+[A-Z\u00C0-\u024F][a-z\u00C0-\u024F]+)?)",
    re.IGNORECASE,
)

_PATTERNS = [
    (_EMAIL_RE, "[REDACTED_EMAIL]"),
    (_PHONE_RE, "[REDACTED_PHONE]"),
    (_EMPLOYEE_ID_RE, "[REDACTED_ID]"),
    (_FR_NAME_RE, "[REDACTED_NAME]"),
    (_REPORTED_BY_RE, "[REDACTED_NAME]"),
]


def redact(text: str) -> tuple[str, list[str]]:
    """Remove PII from text.

    Returns:
        (cleaned_text, list_of_redacted_items)
    """
    if not text or not text.strip():
        return text, []

    redacted_items: list[str] = []
    cleaned = text

    for pattern, replacement in _PATTERNS:
        for match in pattern.finditer(cleaned):
            redacted_items.append(match.group())
        cleaned = pattern.sub(replacement, cleaned)

    # Deduplicate while preserving order
    seen: set[str] = set()
    unique_items: list[str] = []
    for item in redacted_items:
        if item not in seen:
            seen.add(item)
            unique_items.append(item)

    return cleaned, unique_items
