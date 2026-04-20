"""Agentic Duplicate Check (SF-213) — prevents duplicate Work Requests.

Before a new WR is created, compare its description and equipment_tag against
the last 7-14 days of WRs to flag likely duplicates. Uses lightweight token
overlap + difflib ratio — no embedding dependency needed.
"""

from __future__ import annotations

import logging
from datetime import datetime, timedelta
from difflib import SequenceMatcher

from sqlalchemy.orm import Session

from api.database.models import WorkRequestModel

log = logging.getLogger(__name__)


_STOPWORDS = {
    "de", "la", "el", "en", "con", "por", "para", "un", "una", "los", "las",
    "se", "que", "del", "al", "y", "o", "es", "está", "tiene", "hay",
}


def _tokens(text: str) -> set[str]:
    """Lowercased alphanumeric tokens with basic stopword removal."""
    if not text:
        return set()
    words = [w.strip(".,;:()[]{}") for w in text.lower().split()]
    return {w for w in words if len(w) >= 3 and w not in _STOPWORDS}


def _similarity(a: str, b: str) -> float:
    """Combined jaccard + sequence ratio score in [0, 1]."""
    if not a or not b:
        return 0.0
    ta, tb = _tokens(a), _tokens(b)
    jaccard = len(ta & tb) / max(1, len(ta | tb))
    seq = SequenceMatcher(None, a.lower(), b.lower()).ratio()
    return 0.6 * jaccard + 0.4 * seq


def _text_of(wr: WorkRequestModel) -> str:
    """Extract a single description string from a WR in whatever shape it's in."""
    desc = wr.problem_description
    if isinstance(desc, dict):
        for key in ("original_text", "structured_description", "raw_text", "text"):
            val = desc.get(key)
            if val:
                return str(val)
        return " ".join(str(v) for v in desc.values() if isinstance(v, str))
    return str(desc or "")


def check_duplicates(
    db: Session,
    description: str,
    equipment_tag: str | None = None,
    plant_id: str | None = None,
    lookback_days: int = 14,
    threshold: float = 0.55,
    limit: int = 5,
) -> dict:
    """Return likely-duplicate WRs for the given candidate description.

    Parameters
    ----------
    description : str
        Proposed WR description (free text).
    equipment_tag : str, optional
        Tag/equipment identifier of the new WR. When provided, the candidate
        list is narrowed to the same equipment first.
    lookback_days : int
        Window to scan (default 14).
    threshold : float
        Minimum combined similarity to surface as a duplicate.
    limit : int
        Max suggestions returned (sorted by score desc).
    """
    cutoff = datetime.now() - timedelta(days=max(1, lookback_days))
    q = db.query(WorkRequestModel).filter(WorkRequestModel.created_at >= cutoff)
    if equipment_tag:
        q = q.filter(WorkRequestModel.equipment_tag == equipment_tag)
    candidates = q.order_by(WorkRequestModel.created_at.desc()).limit(200).all()

    scored = []
    for wr in candidates:
        text = _text_of(wr)
        score = _similarity(description, text)
        if score >= threshold:
            scored.append((score, wr, text))
    scored.sort(key=lambda r: r[0], reverse=True)

    items = []
    for score, wr, text in scored[:limit]:
        items.append({
            "request_id": wr.request_id,
            "equipment_tag": wr.equipment_tag,
            "status": wr.status,
            "priority_code": wr.priority_code,
            "created_at": wr.created_at.isoformat() if wr.created_at else None,
            "description": text[:280],
            "similarity": round(score, 3),
        })

    return {
        "candidate_description": description[:280],
        "equipment_tag": equipment_tag,
        "lookback_days": lookback_days,
        "threshold": threshold,
        "total_possible_duplicates": len(items),
        "suggestions": items,
    }
