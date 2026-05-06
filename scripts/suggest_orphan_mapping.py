"""
Sugerir mapeo para equipment_tags huerfanos por similitud fuzzy.

Lee orphan_tags.csv generado por audit_orphan_equipment.py, busca los top 3
candidatos mas parecidos en hierarchy_nodes.tag/code/name, y rellena la
columna 'mapeo_propuesto' con sugerencia + score.

Uso (en VPS dentro del container):
  docker cp scripts/suggest_orphan_mapping.py ocp-backend:/tmp/sugg.py
  docker exec ocp-backend python /tmp/sugg.py \\
    /app/data/audit_output/orphan_tags.csv \\
    /app/data/ocp_maintenance.db \\
    /app/data/audit_output/orphan_tags_suggested.csv
"""
import csv
import sqlite3
import sys
from difflib import SequenceMatcher
from pathlib import Path


def score(a: str, b: str) -> float:
    return SequenceMatcher(None, a.upper(), b.upper()).ratio()


def main():
    in_csv = Path(sys.argv[1])
    db = Path(sys.argv[2])
    out_csv = Path(sys.argv[3])

    conn = sqlite3.connect(str(db))
    rows = conn.execute("""
        SELECT tag, code, name FROM hierarchy_nodes
        WHERE tag IS NOT NULL AND tag != ''
    """).fetchall()
    conn.close()
    valid = [(t, c or "", n or "") for t, c, n in rows]
    print(f"hierarchy_nodes con tag: {len(valid)}")

    with in_csv.open(encoding="utf-8") as f:
        reader = csv.DictReader(f)
        records = list(reader)

    for rec in records:
        orphan = rec["equipment_tag"]
        scored = []
        for tag, code, name in valid:
            s_tag = score(orphan, tag)
            s_code = score(orphan, code) if code else 0
            s = max(s_tag, s_code)
            if s >= 0.55:
                scored.append((s, tag, name))
        scored.sort(reverse=True)
        top = scored[:3]
        rec["mapeo_propuesto"] = " | ".join(f"{t} ({s:.0%})" for s, t, _n in top) if top else "SIN MATCH"
        rec["accion"] = ""

    fieldnames = list(records[0].keys())
    with out_csv.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        w.writerows(records)
    print(f"  -> {out_csv}")
    print(f"  Tags procesados: {len(records)}")
    print(f"  Sin match: {sum(1 for r in records if r['mapeo_propuesto'] == 'SIN MATCH')}")


if __name__ == "__main__":
    main()
