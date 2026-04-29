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
    priority: str | None = None,
    candidate_wr_id: str | None = None,
    lookback_days: int = 14,
    threshold: float = 0.55,
    limit: int = 5,
) -> dict:
    """Return likely-duplicate WRs for the given candidate description.

    Mejoras 2026-04-28:
    - Excluye estados terminales (CERRADO/CANCELADO/RECHAZADO/CLOSED) — un aviso
      ya resuelto no es duplicado de uno nuevo.
    - Filtra por severidad cercana: P1 no matchea P4 (max 2 niveles diferencia).
    - Time-decay exponencial: WRs recientes pesan más (decay 7d).
    - Devuelve aviso_number cuando está disponible (legible).
    """
    import math
    EXCLUDED_STATES = ("CERRADO", "CANCELADO", "RECHAZADO", "CLOSED", "CANCELLED", "REJECTED")
    cutoff = datetime.now() - timedelta(days=max(1, lookback_days))
    q = db.query(WorkRequestModel).filter(WorkRequestModel.created_at >= cutoff)
    q = q.filter(~WorkRequestModel.status.in_(EXCLUDED_STATES))
    if equipment_tag:
        q = q.filter(WorkRequestModel.equipment_tag == equipment_tag)
    candidates = q.order_by(WorkRequestModel.created_at.desc()).limit(200).all()

    # Negative-pair memory: filtrar pares dismisseados previamente
    excluded_pair_ids: set = set()
    if candidate_wr_id:
        try:
            from api.database.models import DedupNegativePairModel
            pairs = db.query(DedupNegativePairModel).filter(
                ((DedupNegativePairModel.wr_a_id == candidate_wr_id) |
                 (DedupNegativePairModel.wr_b_id == candidate_wr_id))
            ).all()
            for p in pairs:
                excluded_pair_ids.add(p.wr_a_id if p.wr_a_id != candidate_wr_id else p.wr_b_id)
        except Exception:
            pass

    # Severity filter: limit to ±2 priority levels (P1≈P3 OK, P1↔P4 no)
    PRI_NUM = {"P1": 1, "P2": 2, "P3": 3, "P4": 4}
    incoming_pri = PRI_NUM.get((priority or "").upper())

    now = datetime.now()
    scored = []
    for wr in candidates:
        if wr.request_id in excluded_pair_ids:
            continue  # negative-pair memory
        # Severity filter
        if incoming_pri is not None:
            wr_pri = PRI_NUM.get((wr.priority_code or "").upper())
            if wr_pri and abs(wr_pri - incoming_pri) > 2:
                continue
        text = _text_of(wr)
        base_score = _similarity(description, text)
        if base_score < threshold:
            continue
        # Time-decay: factor que multiplica el score (1.0 hoy → ~0.5 a 7d → ~0.25 a 14d)
        age_days = max(0, (now - wr.created_at).total_seconds() / 86400) if wr.created_at else 0
        decay = math.exp(-age_days / 7.0)
        final_score = base_score * (0.5 + 0.5 * decay)  # mezcla 50% pure + 50% time-weighted
        scored.append((final_score, wr, text, base_score, decay))
    scored.sort(key=lambda r: r[0], reverse=True)

    items = []
    for final_score, wr, text, base_score, decay in scored[:limit]:
        items.append({
            "request_id": wr.request_id,
            "aviso_number": getattr(wr, "aviso_number", None),
            "equipment_tag": wr.equipment_tag,
            "status": wr.status,
            "priority_code": wr.priority_code,
            "created_at": wr.created_at.isoformat() if wr.created_at else None,
            "description": text[:280],
            "similarity": round(base_score, 3),
            "score_weighted": round(final_score, 3),
            "recency_factor": round(decay, 2),
        })

    return {
        "candidate_description": description[:280],
        "equipment_tag": equipment_tag,
        "priority": priority,
        "lookback_days": lookback_days,
        "threshold": threshold,
        "excluded_states": list(EXCLUDED_STATES),
        "total_possible_duplicates": len(items),
        "suggestions": items,
    }
