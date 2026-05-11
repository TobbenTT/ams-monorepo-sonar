"""SF-653 — Add description_history JSON column to managed_work_orders.

Idempotente: si la columna ya existe, no hace nada.
"""
import sqlite3, sys
from pathlib import Path

DB = Path("/app/data/ocp.db") if Path("/app").exists() else Path("data/ocp.db")
if not DB.exists():
    print(f"ERROR: DB no encontrada en {DB}")
    sys.exit(1)

con = sqlite3.connect(DB)
cur = con.cursor()
cols = [r[1] for r in cur.execute("PRAGMA table_info(managed_work_orders)").fetchall()]
if "description_history" in cols:
    print("OK — columna description_history ya existe, sin cambios")
else:
    cur.execute("ALTER TABLE managed_work_orders ADD COLUMN description_history TEXT DEFAULT '[]'")
    con.commit()
    print("OK — columna description_history agregada (TEXT/JSON, default '[]')")
con.close()
