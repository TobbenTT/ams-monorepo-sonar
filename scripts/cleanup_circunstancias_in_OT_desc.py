"""Limpia el texto '— Circunstancias del aviso —\\n...' de la description de
managed_work_orders.

0B4 BUG-04 (reunión VSC 2026-05-11): el flujo viejo concatenaba el campo
WR.circumstances + working_conditions al description de la OT cuando se creaba
la OT desde un aviso. Esto se ve en listados/detalle/Scheduling/Execution.

Después del fix en managed_wo_service.py:653 (commit XYZ) las OTs nuevas ya
no tendrán esa contaminación. Este script limpia las OTs existentes:

  docker exec ocp-backend python scripts/cleanup_circunstancias_in_OT_desc.py [--apply]

Por default es dry-run. Pasar --apply para escribir.
"""
import sys
import sqlite3
from pathlib import Path

DB_PATH = Path("/app/data/ocp_maintenance.db")
MARKER = "— Circunstancias del aviso —"


def clean_description(desc: str) -> str:
    """Remove everything from MARKER onwards. Preserve original task description."""
    if not desc or MARKER not in desc:
        return desc
    idx = desc.find(MARKER)
    # also trim trailing newlines before the marker
    cleaned = desc[:idx].rstrip()
    return cleaned


def main():
    apply = "--apply" in sys.argv
    if not DB_PATH.exists():
        print(f"DB not found: {DB_PATH}", file=sys.stderr)
        sys.exit(1)
    conn = sqlite3.connect(str(DB_PATH))
    cur = conn.cursor()
    rows = cur.execute(
        "SELECT wo_id, wo_number, description FROM managed_work_orders WHERE description LIKE ?",
        (f"%{MARKER}%",),
    ).fetchall()
    print(f"Found {len(rows)} OTs with '{MARKER}' in description")
    if not rows:
        print("Nothing to clean.")
        return
    if not apply:
        print(f"\n[DRY RUN — pass --apply to write]\n")
        for wo_id, wo_num, desc in rows[:5]:
            cleaned = clean_description(desc)
            print(f"OT {wo_num}:")
            print(f"  BEFORE ({len(desc)} chars): {desc[:120]}...")
            print(f"  AFTER  ({len(cleaned)} chars): {cleaned[:120]}...")
            print()
        if len(rows) > 5:
            print(f"  ... and {len(rows) - 5} more")
        return
    # Apply
    updated = 0
    for wo_id, wo_num, desc in rows:
        cleaned = clean_description(desc)
        if cleaned != desc:
            cur.execute("UPDATE managed_work_orders SET description=? WHERE wo_id=?", (cleaned, wo_id))
            updated += 1
    conn.commit()
    conn.close()
    print(f"Updated {updated} OTs.")


if __name__ == "__main__":
    main()
