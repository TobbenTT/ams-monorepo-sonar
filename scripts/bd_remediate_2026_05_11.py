"""
Remediación BD — corregir los issues encontrados por bd_audit_2026_05_11.py.

Acciones:
1. Renumerar avisos duplicados (AV-00101 ×40, AV-00102 ×12) usando nuevos
   números secuenciales después del max actual.
2. Llenar TAG vacío de los 12 EQUIPMENT usando su `code`.
3. Reportar (no auto-fix) las 15 OTs sin work_request_id para revisión manual.

Modo:
    docker exec ocp-backend python /tmp/remediate.py            # dry-run
    docker exec ocp-backend python /tmp/remediate.py --apply    # ejecuta cambios

SIEMPRE hace backup del DB antes de --apply.
"""
from __future__ import annotations

import sys
import shutil
from datetime import datetime
from pathlib import Path
from collections import defaultdict

from api.database.connection import SessionLocal, engine
from sqlalchemy import text

APPLY = "--apply" in sys.argv


def log(msg, kind="info"):
    prefix = {"info": "ℹ", "warn": "⚠", "ok": "✓", "act": "→"}.get(kind, " ")
    print(f"{prefix} {msg}")


def backup_db():
    if not APPLY:
        log("[dry-run] no backup necesario", "info")
        return None
    db_path = Path("/app/data/ocp.db")
    if not db_path.exists():
        log(f"DB no encontrada en {db_path}", "warn")
        return None
    backup_path = db_path.with_suffix(f".{datetime.now().strftime('%Y%m%d_%H%M%S')}.bak")
    shutil.copy2(db_path, backup_path)
    log(f"Backup creado: {backup_path}", "ok")
    return backup_path


def main():
    mode = "APPLY" if APPLY else "DRY-RUN"
    log(f"=== Remediación BD ({mode}) ===\n")

    backup_db()
    s = SessionLocal()

    # ──────────────────────────────────────────────────────────
    # 1. Renumerar avisos duplicados
    # ──────────────────────────────────────────────────────────
    log("1. Avisos con aviso_number duplicado", "info")

    max_aviso = s.execute(text("SELECT MAX(aviso_number) FROM work_requests")).scalar() or 0
    log(f"   max actual: AV-{max_aviso:05d}")

    # Encontrar duplicados
    dupes = s.execute(text(
        "SELECT aviso_number, COUNT(*) c "
        "FROM work_requests WHERE aviso_number IS NOT NULL "
        "GROUP BY aviso_number HAVING c > 1 ORDER BY aviso_number"
    )).all()

    total_renumbered = 0
    next_num = max_aviso + 1

    for dup in dupes:
        rows = s.execute(text(
            "SELECT request_id, created_at FROM work_requests "
            "WHERE aviso_number = :n ORDER BY created_at ASC"
        ), {"n": dup.aviso_number}).all()
        # Dejar el más antiguo con el número original; renumerar el resto
        keep = rows[0]
        rename = rows[1:]
        log(f"   AV-{dup.aviso_number:05d}: {len(rows)} duplicados — mantengo {keep.request_id[:8]}, renombro {len(rename)}", "act")
        for r in rename:
            new_num = next_num
            next_num += 1
            if APPLY:
                s.execute(text(
                    "UPDATE work_requests SET aviso_number = :new "
                    "WHERE request_id = :rid"
                ), {"new": new_num, "rid": r.request_id})
            total_renumbered += 1
        log(f"      → renumerados a AV-{next_num - len(rename):05d}..AV-{next_num - 1:05d}")

    log(f"   Total a renumerar: {total_renumbered}", "ok")

    # ──────────────────────────────────────────────────────────
    # 2. Llenar TAG vacío en EQUIPMENT usando code
    # ──────────────────────────────────────────────────────────
    log("\n2. EQUIPMENT sin TAG (llenar con code)", "info")
    no_tag = s.execute(text(
        "SELECT node_id, name, code FROM hierarchy_nodes "
        "WHERE node_type='EQUIPMENT' AND (tag IS NULL OR TRIM(tag) = '')"
    )).all()

    fixed = 0
    for n in no_tag:
        if not n.code:
            log(f"   ⚠ {n.name} sin code tampoco — saltado", "warn")
            continue
        log(f"   {n.name[:40]:<40} TAG = '{n.code}'", "act")
        if APPLY:
            s.execute(text(
                "UPDATE hierarchy_nodes SET tag = :tag WHERE node_id = :nid"
            ), {"tag": n.code, "nid": n.node_id})
        fixed += 1
    log(f"   Total TAGs llenados: {fixed}/{len(no_tag)}", "ok")

    # ──────────────────────────────────────────────────────────
    # 3. OTs sin work_request_id (reportar, NO auto-fix)
    # ──────────────────────────────────────────────────────────
    log("\n3. OTs huérfanas (sin work_request_id) — reporte para revisión manual", "info")
    orphans = s.execute(text(
        "SELECT wo_id, wo_number, status, wo_type, equipment_tag, created_at "
        "FROM managed_work_orders WHERE work_request_id IS NULL ORDER BY created_at"
    )).all()
    log(f"   Total: {len(orphans)}")
    by_type = defaultdict(int)
    for o in orphans:
        by_type[o.wo_type or 'SIN_TIPO'] += 1
    for t, c in by_type.items():
        log(f"      {t}: {c}")
    if orphans[:5]:
        log("   Muestra:")
        for o in orphans[:5]:
            log(f"      {o.wo_number or '-':<18} {o.wo_type or '-':<6} {o.status:<10} {o.equipment_tag or '-'}")

    # ──────────────────────────────────────────────────────────
    # Commit
    # ──────────────────────────────────────────────────────────
    if APPLY:
        s.commit()
        log("\n✓ COMMIT aplicado", "ok")
    else:
        s.rollback()
        log("\nDry-run completado. Para aplicar, usar --apply", "info")


if __name__ == "__main__":
    main()
