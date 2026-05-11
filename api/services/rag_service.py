"""RAG service — Phase 2 capabilities (#33 RCM, #34 Shift Handover, #35 Post-Maint, #40 KB).

Lazy load: model + LanceDB connection initialize only on first call,
so idle RAM stays at 0. After first query: ~1.5GB resident.
"""
from __future__ import annotations

import os
import threading
from pathlib import Path
from typing import Iterable

LANCE_DIR = Path(os.getenv("RAG_LANCE_DIR", "/app/data/lancedb"))
EMBED_MODEL = os.getenv("RAG_EMBED_MODEL", "paraphrase-multilingual-MiniLM-L12-v2")
CHUNK_TOKENS = 500
CHUNK_OVERLAP = 50

_lock = threading.Lock()
_state: dict = {"model": None, "db": None}


def _get_model():
    if _state["model"] is None:
        with _lock:
            if _state["model"] is None:
                from sentence_transformers import SentenceTransformer
                _state["model"] = SentenceTransformer(EMBED_MODEL)
    return _state["model"]


def _get_db():
    if _state["db"] is None:
        with _lock:
            if _state["db"] is None:
                import lancedb
                LANCE_DIR.mkdir(parents=True, exist_ok=True)
                _state["db"] = lancedb.connect(str(LANCE_DIR))
    return _state["db"]


def is_loaded() -> bool:
    return _state["model"] is not None


def chunk_text(text: str, max_tokens: int = CHUNK_TOKENS, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """Word-based chunking (proxy for tokens). Good enough for retrieval."""
    words = (text or "").split()
    if not words:
        return []
    out, i = [], 0
    while i < len(words):
        chunk = " ".join(words[i:i + max_tokens])
        if chunk.strip():
            out.append(chunk)
        i += max_tokens - overlap
    return out


def embed(texts: Iterable[str]) -> list[list[float]]:
    model = _get_model()
    vecs = model.encode(list(texts), normalize_embeddings=True, show_progress_bar=False)
    return [v.tolist() for v in vecs]


def add_chunks(table_name: str, items: list[dict]) -> int:
    """items: [{text, source_id, source_type, meta:{...}}]. Auto-chunks long text."""
    if not items:
        return 0
    rows = []
    for it in items:
        chunks = chunk_text(it.get("text", ""))
        if not chunks:
            continue
        vecs = embed(chunks)
        for idx, (chunk, vec) in enumerate(zip(chunks, vecs)):
            rows.append({
                "vector": vec,
                "text": chunk,
                "source_id": str(it.get("source_id", "")),
                "source_type": it.get("source_type", "unknown"),
                "chunk_idx": idx,
                "meta": it.get("meta", {}),
            })
    if not rows:
        return 0
    db = _get_db()
    if table_name in db.table_names():
        tbl = db.open_table(table_name)
        tbl.add(rows)
    else:
        db.create_table(table_name, data=rows)
    return len(rows)


def search(table_name: str, query: str, k: int = 5, filter_sql: str | None = None) -> list[dict]:
    db = _get_db()
    if table_name not in db.table_names():
        return []
    qvec = embed([query])[0]
    tbl = db.open_table(table_name)
    q = tbl.search(qvec).limit(k)
    if filter_sql:
        q = q.where(filter_sql)
    rs = q.to_list()
    out = []
    for r in rs:
        out.append({
            "text": r.get("text"),
            "source_id": r.get("source_id"),
            "source_type": r.get("source_type"),
            "chunk_idx": r.get("chunk_idx"),
            "meta": r.get("meta"),
            "score": float(r.get("_distance", 0.0)),
        })
    return out


def stats() -> dict:
    """Report tables and row counts. Cheap: connects lancedb without loading embed model."""
    try:
        db = _get_db()
    except Exception as e:
        return {"loaded": False, "tables": [], "error": str(e), "dir": str(LANCE_DIR)}
    tables = []
    for name in db.table_names():
        try:
            tbl = db.open_table(name)
            tables.append({"name": name, "rows": tbl.count_rows()})
        except Exception as e:
            tables.append({"name": name, "error": str(e)})
    return {
        "loaded": True,
        "model_loaded": _state["model"] is not None,
        "tables": tables,
        "model": EMBED_MODEL,
        "dir": str(LANCE_DIR),
    }
