"""
Ola 1 — Cleanup datos producción (idempotente, transaccional).

Fixes:
  1. Remap 4 equipment_tags huerfanos con confianza >=90% (15 OTs)
  2. Set completion_pct=100 en 3 OTs CERRADAS con pct<100
  3. Patch OTs PROGRAMADO/EN_EJECUCION sin assigned_workers (7 OTs) -- solo log
  4. Purgar notifications >30d (12 rows)

Uso (VPS):
  docker cp scripts/ola1_cleanup.py ocp-backend:/tmp/ola1.py
  docker exec ocp-backend python /tmp/ola1.py /app/data/ocp_maintenance.db --apply

Sin --apply hace dry-run.
"""
import sqlite3
import sys
from datetime import datetime

MAPPINGS = [
    ("BRY-SAG-ML-002", "BRY-SAG-ML-001"),
    ("BRY-BAL-ML-001", "BRY-BAL-ML-002"),
    ("CVY-CV-001",     "CVY-CVR-001"),
    ("PMP-SL-HP-001",  "PMP-SLP-001"),
]


def main():
    db_path = sys.argv[1]
    apply = "--apply" in sys.argv
    mode = "APPLY" if apply else "DRY-RUN"
    print(f"=== Ola 1 cleanup [{mode}] === {datetime.utcnow().isoformat()}")

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("BEGIN")
    try:
        # 1. Remap orphan tags
        print("\n--- Fix 1: remap equipment_tags huerfanos (>=90% confianza) ---")
        total_remapped = 0
        for old, new in MAPPINGS:
            row = c.execute(
                "SELECT COUNT(*) FROM managed_work_orders WHERE equipment_tag=?", (old,)
            ).fetchone()
            count = row[0]
            if count == 0:
                print(f"  {old} -> {new}: 0 OTs (ya migrado o no existe)")
                continue
            valid = c.execute(
                "SELECT 1 FROM hierarchy_nodes WHERE tag=? LIMIT 1", (new,)
            ).fetchone()
            if not valid:
                print(f"  {old} -> {new}: SKIP (target {new} NO existe en hierarchy)")
                continue
            c.execute(
                "UPDATE managed_work_orders SET equipment_tag=? WHERE equipment_tag=?",
                (new, old),
            )
            print(f"  {old} -> {new}: {count} OTs remapeadas")
            total_remapped += count
        print(f"  Total: {total_remapped} OTs")

        # 2. Set completion_pct=100 en CERRADAS con pct<100
        print("\n--- Fix 2: completion_pct=100 en OTs CERRADAS ---")
        rows = c.execute(
            "SELECT wo_number, completion_pct FROM managed_work_orders "
            "WHERE status='CERRADO' AND (completion_pct IS NULL OR completion_pct < 100)"
        ).fetchall()
        for r in rows:
            print(f"  {r[0]}: {r[1]} -> 100")
        c.execute(
            "UPDATE managed_work_orders SET completion_pct=100 "
            "WHERE status='CERRADO' AND (completion_pct IS NULL OR completion_pct < 100)"
        )
        print(f"  Total: {len(rows)} OTs")

        # 3. Solo log: PROGRAMADO/EN_EJECUCION sin assigned_workers
        print("\n--- Fix 3 (LOG ONLY): OTs PROG/EN_EJEC sin assigned_workers ---")
        rows = c.execute(
            "SELECT wo_number, status, assigned_workers FROM managed_work_orders "
            "WHERE status IN ('PROGRAMADO','EN_EJECUCION') "
            "AND (assigned_workers IS NULL OR assigned_workers='' OR assigned_workers='[]')"
        ).fetchall()
        for r in rows:
            print(f"  {r[0]} [{r[1]}] sin assigned_workers")
        print(f"  Total: {len(rows)} OTs (requiere asignación manual, NO se modifica)")

        # 4. Purge notifications > 30d
        print("\n--- Fix 4: purge notifications >30 días ---")
        old = c.execute(
            "SELECT COUNT(*) FROM notifications WHERE created_at < datetime('now','-30 days')"
        ).fetchone()[0]
        print(f"  Notifications >30d: {old}")
        c.execute("DELETE FROM notifications WHERE created_at < datetime('now','-30 days')")

        if apply:
            conn.commit()
            print("\n✅ COMMIT aplicado")
        else:
            conn.rollback()
            print("\n⚠️  ROLLBACK (dry-run, no se aplica)")
    except Exception as e:
        conn.rollback()
        print(f"\n❌ ERROR — rollback: {e}")
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    main()
