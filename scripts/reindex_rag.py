"""Reindex RAG: backup + wipe + re-ingest from current BD.

0F (reunión VSC 2026-05-11): RAG llevaba 12 días desactualizado (1-2 rows
por tabla). Tras BUG-04 fix (descripciones de OT limpias sin "Circunstancias
del aviso"), el reindex es necesario para que los agentes de Troubleshooting
/ Post-Maint Learning / KB Curator devuelvan resultados consistentes con
los datos actuales.

Tablas reindexadas:
- ot_history       — managed_work_orders status CERRADO + post-closure review
- lessons_learned  — post_closure_review.lessons_learned + root_cause_confirmed
- manuals          — dms_documents (PDFs/procedimientos asociados a equipos)

Uso:
  docker exec ocp-backend python scripts/reindex_rag.py [--apply]
"""
import sys
import shutil
import sqlite3
import json
from datetime import datetime
from pathlib import Path

DB_PATH = Path("/app/data/ocp_maintenance.db")
LANCE_DIR = Path("/app/data/lancedb")
BACKUP_DIR = Path("/app/data/lancedb_backup")


def backup():
    if BACKUP_DIR.exists():
        shutil.rmtree(BACKUP_DIR)
    if LANCE_DIR.exists():
        shutil.copytree(LANCE_DIR, BACKUP_DIR)
        print(f"  ✓ backup → {BACKUP_DIR}")
    else:
        print(f"  (no lancedb to backup)")


def wipe():
    if LANCE_DIR.exists():
        shutil.rmtree(LANCE_DIR)
    LANCE_DIR.mkdir(parents=True, exist_ok=True)
    print(f"  ✓ wiped {LANCE_DIR}")


def collect_ot_history(conn):
    """Items para tabla ot_history."""
    rows = conn.execute("""
        SELECT wo_id, wo_number, equipment_tag, equipment_id, description,
               wo_type, priority_code, actual_hours, closed_at, post_closure_review,
               execution_notes
        FROM managed_work_orders
        WHERE status IN ('CERRADO', 'CLOSED')
    """).fetchall()
    items = []
    for r in rows:
        wo_id, num, tag, eq_id, desc, typ, prio, hrs, closed, pcr, notes = r
        pcr_parsed = json.loads(pcr) if pcr else {}
        notes_parsed = json.loads(notes) if notes else []
        notes_text = "\n".join(
            n.get("note", "") if isinstance(n, dict) else str(n)
            for n in (notes_parsed if isinstance(notes_parsed, list) else [])
        )
        text = (
            f"OT {num} · {typ or '?'} · {prio or '?'} · {tag or '?'}\n"
            f"Descripción: {(desc or '').strip()[:1000]}\n"
            f"Horas reales: {hrs or 0}\n"
            f"Comentarios:\n{notes_text[:800]}\n"
        )
        if pcr_parsed.get("root_cause_confirmed"):
            text += f"\nCausa raíz confirmada: {pcr_parsed['root_cause_confirmed'][:500]}"
        if pcr_parsed.get("lessons_learned"):
            text += f"\nLecciones: {pcr_parsed['lessons_learned'][:500]}"
        items.append({
            "text": text,
            "source_id": str(wo_id),
            "source_type": "ot_history",
            "meta": {
                "wo_number": num or "",
                "equipment_tag": tag or "",
                "wo_type": typ or "",
                "priority": prio or "",
                "closed_at": closed or "",
            },
        })
    return items


def collect_lessons_learned(conn):
    """Items para tabla lessons_learned (subset de OTs con post_closure_review)."""
    rows = conn.execute("""
        SELECT wo_id, wo_number, equipment_tag, post_closure_review
        FROM managed_work_orders
        WHERE post_closure_review IS NOT NULL AND post_closure_review != ''
    """).fetchall()
    items = []
    for r in rows:
        wo_id, num, tag, pcr = r
        try:
            pcr_d = json.loads(pcr) if pcr else {}
        except Exception:
            pcr_d = {}
        lessons = pcr_d.get("lessons_learned", "").strip()
        if not lessons:
            continue
        text = (
            f"Lección aprendida — OT {num} · {tag}\n"
            f"{lessons}\n"
        )
        if pcr_d.get("root_cause_confirmed"):
            text += f"\nCausa raíz: {pcr_d['root_cause_confirmed']}"
        if pcr_d.get("pm_frequency_suggestion"):
            text += f"\nSugerencia frecuencia PM: {pcr_d['pm_frequency_suggestion']}"
        items.append({
            "text": text,
            "source_id": str(wo_id),
            "source_type": "lesson",
            "meta": {
                "wo_number": num or "",
                "equipment_tag": tag or "",
            },
        })
    return items


def collect_manuals(conn):
    """Items para tabla manuals (DMS documents)."""
    try:
        rows = conn.execute("""
            SELECT document_id, document_number, document_desc, document_type,
                   sap_func_loc, content_preview
            FROM dms_documents
            WHERE content_preview IS NOT NULL AND length(content_preview) > 50
        """).fetchall()
    except sqlite3.OperationalError:
        # tabla may not exist
        return []
    items = []
    for r in rows:
        did, num, desc, typ, floc, preview = r
        items.append({
            "text": f"Documento {num} · {desc}\nTipo: {typ}\nUbicación funcional: {floc}\n\n{(preview or '')[:1500]}",
            "source_id": str(did),
            "source_type": "manual",
            "meta": {
                "document_number": num or "",
                "document_type": typ or "",
                "sap_func_loc": floc or "",
            },
        })
    return items


def ingest_to_rag(items_by_table):
    from api.services import rag_service
    for table, items in items_by_table.items():
        if not items:
            print(f"  - {table}: no items, skip")
            continue
        n = rag_service.add_chunks(table, items)
        print(f"  + {table}: ingested {n} chunks from {len(items)} items")


def main():
    apply = "--apply" in sys.argv
    if not DB_PATH.exists():
        print(f"DB not found: {DB_PATH}", file=sys.stderr)
        sys.exit(1)
    conn = sqlite3.connect(str(DB_PATH))
    print("Collecting items from BD...")
    ot_hist = collect_ot_history(conn)
    lessons = collect_lessons_learned(conn)
    manuals = collect_manuals(conn)
    print(f"  ot_history: {len(ot_hist)} OTs cerradas")
    print(f"  lessons_learned: {len(lessons)} reviews con lecciones")
    print(f"  manuals: {len(manuals)} documents")
    if not apply:
        print("\n[DRY RUN — pass --apply to backup + wipe + reindex]")
        return
    print("\nBackup lancedb actual...")
    backup()
    print("Wipe lancedb...")
    wipe()
    print("Ingest...")
    ingest_to_rag({
        "ot_history": ot_hist,
        "lessons_learned": lessons,
        "manuals": manuals,
    })
    print("\nDone. Backup en", BACKUP_DIR)


if __name__ == "__main__":
    main()
