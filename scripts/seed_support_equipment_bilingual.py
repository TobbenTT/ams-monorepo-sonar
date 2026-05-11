"""Idempotent seeder for bilingual support_equipment entries.

0B10 v3 (reunión VSC 2026-05-11): asegura que el catálogo de equipos
de apoyo (support_equipment table) contenga las variantes ES/EN comunes
para que el matcher del frontend marque equipos heredados (Mobile crane,
Scaffolding, etc) como CATALOGADOS y no dispare el warning naranja.

Uso:
    docker exec ocp-backend python scripts/seed_support_equipment_bilingual.py

El script:
- Lee catálogo actual de support_equipment por plant
- Inserta sólo los items que faltan (por name + plant_id)
- No toca registros existentes
"""
import sys
import uuid
import sqlite3
from pathlib import Path

DB_PATH = Path("/app/data/ocp_maintenance.db")

# Entradas genéricas bilingües que deberían existir en TODA planta.
# El matcher del frontend (matchSupportEquip) ya tiene la tabla de alias
# EN↔ES, así que basta con que UNA variante esté en el catálogo.
BILINGUAL_SEED = [
    ("Grúa móvil",              "MOBILE_CRANE"),
    ("Puente grúa",             "BRIDGE_CRANE"),
    ("Mandil hidráulico",       "HYDRAULIC_TRUCK"),
    ("Camión hidráulico",       "HYDRAULIC_TRUCK"),
    ("Andamio",                 "SCAFFOLDING"),
    ("Andamios",                "SCAFFOLDING"),
    ("Montacargas",             "FORKLIFT"),
    ("Analizador de vibración", "OTHER"),
    ("Analizador de vibraciones","OTHER"),
    ("Soldadora",               "OTHER"),
    ("Máquina de soldar",       "OTHER"),
    ("Tecle eléctrico",         "BRIDGE_CRANE"),
    ("Carro de servicio",       "OTHER"),
    ("Plataforma elevadora",    "OTHER"),
    ("Tirfor",                  "OTHER"),
    ("Pluma",                   "MOBILE_CRANE"),
]


def seed_for_plant(conn: sqlite3.Connection, plant_id: str) -> int:
    """Insert missing items for plant. Returns count inserted."""
    cur = conn.cursor()
    existing = {row[0].strip().lower() for row in cur.execute(
        "SELECT name FROM support_equipment WHERE plant_id = ?", (plant_id,)
    ).fetchall()}
    added = 0
    for name, typ in BILINGUAL_SEED:
        if name.strip().lower() in existing:
            continue
        eid = str(uuid.uuid4())
        cur.execute(
            "INSERT INTO support_equipment "
            "(equipment_id, plant_id, name, equipment_type, available, is_rented) "
            "VALUES (?, ?, ?, ?, 1, 0)",
            (eid, plant_id, name, typ),
        )
        added += 1
        print(f"  + {plant_id}: {name} ({typ})")
    return added


def main():
    if not DB_PATH.exists():
        print(f"DB not found: {DB_PATH}", file=sys.stderr)
        sys.exit(1)
    conn = sqlite3.connect(str(DB_PATH))
    try:
        plants = [r[0] for r in conn.execute("SELECT plant_id FROM plants").fetchall()]
        if not plants:
            print("No plants found, skipping.")
            return
        total = 0
        for plant_id in plants:
            print(f"Plant {plant_id}:")
            total += seed_for_plant(conn, plant_id)
        conn.commit()
        print(f"\nDone. Inserted {total} entries across {len(plants)} plants.")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
