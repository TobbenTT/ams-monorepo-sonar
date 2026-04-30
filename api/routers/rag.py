"""RAG router — Phase 2 capabilities backed by LanceDB + Claude.

Endpoints:
- POST /rag/ingest             ingest text into a table (manuals, ot_history, ...)
- GET  /rag/stats              show indexed tables/row counts
- POST /rag/search             raw vector search (debug / KB lookup)
- POST /rag/rcm-strategy       #33 RCM Strategy Advisor
- POST /rag/shift-handover     #34 Shift Handover summarizer
- POST /rag/post-maint-learn   #35 Post-Maintenance Lessons capture
- POST /rag/kb-curator         #40 Knowledge Base Curator
"""
from __future__ import annotations

import os
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from api.services import rag_service
from api.dependencies.auth import get_current_user
from fastapi import Depends

router = APIRouter(prefix="/rag", tags=["rag"])


# ─── Schemas ─────────────────────────────────────────────────────────────
class IngestItem(BaseModel):
    text: str
    source_id: str
    source_type: str = "manual"
    meta: dict[str, Any] = {}


class IngestRequest(BaseModel):
    table: str  # manuals | ot_history | shift_handovers | lessons_learned | kb
    items: list[IngestItem]


class SearchRequest(BaseModel):
    table: str
    query: str
    k: int = 5


class RCMStrategyRequest(BaseModel):
    equipment_tag: str
    failure_mode: str | None = None
    context: str | None = None  # extra notes from planner


class ShiftHandoverRequest(BaseModel):
    shift: str  # "day"|"night"
    open_wos: list[dict]  # WO summaries: id, status, equipment_tag, problem
    notes: str | None = None


class PostMaintLearnRequest(BaseModel):
    wo_id: str
    equipment_tag: str
    failure_mode: str | None = None
    actions_taken: str
    outcome: str  # "ok"|"recurrent"|"escalated"
    notes: str | None = None


class KBCuratorRequest(BaseModel):
    new_entry_text: str
    proposed_category: str | None = None


# ─── Claude helper ───────────────────────────────────────────────────────
def _claude(prompt: str, max_tokens: int = 1024) -> str:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        return ""
    try:
        import anthropic
        client = anthropic.Anthropic(api_key=api_key)
        msg = client.messages.create(
            model=os.getenv("CLAUDE_MODEL", "claude-sonnet-4-6"),
            max_tokens=max_tokens,
            messages=[{"role": "user", "content": prompt}],
        )
        return msg.content[0].text if msg.content else ""
    except Exception as e:
        return f"[claude_error: {e}]"


def _format_context(hits: list[dict]) -> str:
    if not hits:
        return "(sin contexto histórico relevante)"
    parts = []
    for i, h in enumerate(hits, 1):
        meta = h.get("meta") or {}
        meta_str = ", ".join(f"{k}={v}" for k, v in meta.items() if v) or "—"
        parts.append(f"[{i}] ({h.get('source_type')}/{h.get('source_id')}, {meta_str})\n{h.get('text','')}")
    return "\n\n".join(parts)


# ─── Endpoints ───────────────────────────────────────────────────────────
@router.post("/ingest")
def ingest(body: IngestRequest, _user=Depends(get_current_user)):
    payload = [it.model_dump() for it in body.items]
    n = rag_service.add_chunks(body.table, payload)
    return {"table": body.table, "chunks_added": n}


@router.get("/stats")
def stats(_user=Depends(get_current_user)):
    return rag_service.stats()


@router.post("/search")
def search(body: SearchRequest, _user=Depends(get_current_user)):
    return {"hits": rag_service.search(body.table, body.query, body.k)}


@router.post("/rcm-strategy")
def rcm_strategy(body: RCMStrategyRequest, _user=Depends(get_current_user)):
    """#33 RCM Strategy Advisor — combina manuales + histórico OT + Claude."""
    q = f"{body.equipment_tag} {body.failure_mode or ''} {body.context or ''}".strip()
    manuals = rag_service.search("manuals", q, k=4)
    history = rag_service.search("ot_history", q, k=4)
    lessons = rag_service.search("lessons_learned", q, k=3)
    prompt = f"""Eres un especialista en RCM (Reliability Centered Maintenance) en minería.
Equipo: {body.equipment_tag}
Modo de falla: {body.failure_mode or '(no especificado)'}
Contexto del planificador: {body.context or '(ninguno)'}

CONTEXTO MANUALES:
{_format_context(manuals)}

HISTORIAL OTs SIMILARES:
{_format_context(history)}

LECCIONES APRENDIDAS:
{_format_context(lessons)}

Propón una estrategia RCM en formato JSON válido con keys:
- recommended_strategy: "predictive"|"preventive"|"corrective"|"redesign"
- frequency: ej "monthly", "quarterly", "1000h", "on_failure"
- key_tasks: lista de 3-6 tareas concretas
- monitoring_indicators: 2-4 indicadores a vigilar
- justification: 2-3 frases que citen el contexto recuperado
- confidence: 0.0-1.0

Responde SOLO el JSON, sin texto adicional."""
    answer = _claude(prompt, max_tokens=900)
    return {
        "equipment_tag": body.equipment_tag,
        "failure_mode": body.failure_mode,
        "retrieved": {
            "manuals": len(manuals),
            "history": len(history),
            "lessons": len(lessons),
        },
        "claude_response": answer,
        "sources": (manuals + history + lessons)[:8],
    }


@router.post("/shift-handover")
def shift_handover(body: ShiftHandoverRequest, _user=Depends(get_current_user)):
    """#34 Shift Handover — resume turno saliente con contexto histórico."""
    open_wos_str = "\n".join(
        f"- {w.get('id')} ({w.get('status')}) {w.get('equipment_tag','')} : {w.get('problem','')}"
        for w in body.open_wos
    ) or "(ninguna OT abierta)"
    history_q = " ".join(w.get("problem", "") for w in body.open_wos[:5])
    history = rag_service.search("ot_history", history_q, k=5) if history_q.strip() else []
    prompt = f"""Eres supervisor de mantenimiento. Genera un handover de turno {body.shift}.

OTs ABIERTAS AHORA:
{open_wos_str}

NOTAS DEL TURNO:
{body.notes or '(ninguna)'}

CASOS HISTÓRICOS RELACIONADOS:
{_format_context(history)}

Genera handover conciso en formato:
1. RESUMEN (2 frases)
2. PRIORIDADES (top 3 OTs con razón)
3. RIESGOS (basados en historial)
4. ACCIONES INMEDIATAS turno entrante (lista 3-5)
5. PENDIENTES DE SEGUIMIENTO

Sé directo, sin relleno."""
    answer = _claude(prompt, max_tokens=800)
    return {"handover": answer, "history_refs": len(history), "sources": history}


@router.post("/post-maint-learn")
def post_maint_learn(body: PostMaintLearnRequest, _user=Depends(get_current_user)):
    """#35 Post-Maintenance Lessons — captura aprendizaje al cerrar OT."""
    text = (
        f"Equipo: {body.equipment_tag}\n"
        f"Modo de falla: {body.failure_mode or 'N/A'}\n"
        f"Acciones: {body.actions_taken}\n"
        f"Resultado: {body.outcome}\n"
        f"Notas: {body.notes or ''}"
    )
    n = rag_service.add_chunks(
        "lessons_learned",
        [{
            "text": text,
            "source_id": body.wo_id,
            "source_type": "lesson",
            "meta": {
                "equipment_tag": body.equipment_tag,
                "failure_mode": body.failure_mode,
                "outcome": body.outcome,
            },
        }],
    )
    summary = ""
    if body.outcome == "recurrent":
        prompt = f"""Falla RECURRENTE detectada al cerrar OT.
Equipo: {body.equipment_tag}, modo: {body.failure_mode}.
Acciones tomadas: {body.actions_taken}.
Notas: {body.notes or ''}.

En 3 bullets identifica: causa raíz probable, brecha de mantenimiento detectada, acción correctiva sugerida."""
        summary = _claude(prompt, max_tokens=400)
    return {"chunks_indexed": n, "lesson_id": body.wo_id, "ai_summary": summary}


@router.post("/kb-curator")
def kb_curator(body: KBCuratorRequest, _user=Depends(get_current_user)):
    """#40 KB Curator — auto-categoriza y detecta duplicados."""
    similar = rag_service.search("kb", body.new_entry_text[:500], k=5)
    duplicates = [s for s in similar if s.get("score", 1.0) < 0.25]
    prompt = f"""Eres curador de Knowledge Base. Una entrada nueva fue propuesta:

ENTRADA NUEVA:
{body.new_entry_text}

CATEGORÍA SUGERIDA: {body.proposed_category or '(ninguna — proponer)'}

ENTRADAS SIMILARES YA EXISTENTES:
{_format_context(similar)}

Decide en JSON:
- action: "add"|"merge"|"reject"
- merge_with: source_id si merge
- final_category: string
- tags: lista 3-5 tags
- summary: 1 frase resumiendo la entrada
- duplicates_detected: count

Solo JSON."""
    answer = _claude(prompt, max_tokens=500)
    return {
        "decision": answer,
        "duplicates_detected": len(duplicates),
        "similar_count": len(similar),
        "sources": similar,
    }
