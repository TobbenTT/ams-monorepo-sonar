"""
Audit OTs huerfanas — Inconsistencias Opción A.

Lista los equipment_tags referenciados en managed_work_orders que no existen
en hierarchy_nodes.tag, y exporta dos CSVs para que Jorge decida el mapeo:

  - orphan_tags.csv  : un row por tag huerfano (con conteo + breakdown por estado)
  - orphan_wos.csv   : un row por OT huerfana (detalle completo)

Uso:
  python scripts/audit_orphan_equipment.py [db_path] [output_dir]

Defaults:
  db_path    = ./ocp_maintenance.db
  output_dir = ./audit_output

VPS:
  docker exec ocp-backend python scripts/audit_orphan_equipment.py \\
    /app/data/ocp_maintenance.db /app/data/audit_output
"""
import csv
import sqlite3
import sys
from collections import defaultdict
from pathlib import Path


def main():
    db_path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("ocp_maintenance.db")
    out_dir = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("audit_output")
    out_dir.mkdir(parents=True, exist_ok=True)

    if not db_path.exists():
        print(f"ERROR: db no existe: {db_path}")
        sys.exit(1)

    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    valid_tags = {row[0] for row in cur.execute(
        "SELECT DISTINCT tag FROM hierarchy_nodes WHERE tag IS NOT NULL AND tag != ''"
    )}
    print(f"hierarchy_nodes.tag distintos: {len(valid_tags)}")

    rows = cur.execute("""
        SELECT wo_number, equipment_tag, equipment_id, status, plant_id,
               work_request_id, wo_title, created_at
        FROM managed_work_orders
        WHERE equipment_tag IS NOT NULL AND equipment_tag != ''
    """).fetchall()
    print(f"OTs totales con equipment_tag: {len(rows)}")

    orphan_wos = [r for r in rows if r["equipment_tag"] not in valid_tags]
    print(f"OTs huerfanas: {len(orphan_wos)}")

    by_tag = defaultdict(lambda: {"total": 0, "by_status": defaultdict(int), "samples": []})
    for r in orphan_wos:
        b = by_tag[r["equipment_tag"]]
        b["total"] += 1
        b["by_status"][r["status"] or ""] += 1
        if len(b["samples"]) < 3:
            b["samples"].append(r["wo_number"])

    print(f"Tags huerfanos distintos: {len(by_tag)}")

    tags_csv = out_dir / "orphan_tags.csv"
    with tags_csv.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["equipment_tag", "total_ots", "creado", "liberado",
                    "planificado", "en_programacion", "programado",
                    "en_ejecucion", "cerrado", "cancelado", "otros",
                    "sample_wo_numbers", "mapeo_propuesto", "accion"])
        canonical = ["CREADO", "LIBERADO", "PLANIFICADO", "EN_PROGRAMACION",
                     "PROGRAMADO", "EN_EJECUCION", "CERRADO", "CANCELADO"]
        for tag in sorted(by_tag, key=lambda t: -by_tag[t]["total"]):
            b = by_tag[tag]
            cells = [b["by_status"].get(s, 0) for s in canonical]
            otros = sum(v for k, v in b["by_status"].items() if k not in canonical)
            w.writerow([tag, b["total"], *cells, otros,
                        " | ".join(b["samples"]), "", ""])
    print(f"  -> {tags_csv}")

    wos_csv = out_dir / "orphan_wos.csv"
    with wos_csv.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["wo_number", "equipment_tag", "equipment_id", "status",
                    "plant_id", "work_request_id", "wo_title", "created_at"])
        for r in sorted(orphan_wos, key=lambda x: x["equipment_tag"] or ""):
            w.writerow([r["wo_number"], r["equipment_tag"], r["equipment_id"],
                        r["status"], r["plant_id"], r["work_request_id"],
                        r["wo_title"], r["created_at"]])
    print(f"  -> {wos_csv}")

    print("\nResumen para Jorge:")
    print(f"  {len(orphan_wos)} OTs apuntan a {len(by_tag)} equipment_tags inexistentes.")
    print(f"  Llenar columna 'mapeo_propuesto' en {tags_csv.name} con tag valido,")
    print(f"  o 'CANCELAR' si la OT debe darse de baja.")

    conn.close()


if __name__ == "__main__":
    main()
