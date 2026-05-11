"""Seed simulated criticality assessments for equipos sin evaluar.

0D4 (reunión VSC 2026-05-11): el dashboard /criticality muestra 498/500
equipos sin evaluar. Per transcript Jorge, mientras no tengamos la
planilla real del cliente con valores de criticidad, está bien usar
SIMULADOS — "no está arrojando nivel de riesgo. Excepto simulados. Y está
bien eso." Cuando llegue la planilla, este script puede correrse
re-leyendo de Excel.

Distribución simulada plausible para una planta minera:
- ~10% AA (alto riesgo)
- ~30% A+ (moderado-alto)
- ~40% A (moderado)
- ~20% B (bajo)

Determinístico (seed = node_id hash) — re-run no cambia los valores.

Uso:
  docker exec ocp-backend python scripts/seed_criticality_simulated.py [--apply]
"""
import sys
import hashlib
import sqlite3
from datetime import datetime
from pathlib import Path

DB_PATH = Path("/app/data/ocp_maintenance.db")

# Distribución target: pesos cumulativos
CLASSES = [
    (0.10, "AA",  20, 5, "Alto riesgo · paro de planta"),
    (0.40, "A+",  15, 4, "Moderado-alto · reduce capacidad"),
    (0.80, "A",   10, 3, "Moderado · afecta calidad"),
    (1.00, "B",    5, 2, "Bajo · sin impacto inmediato"),
]


def class_for_node(node_id: str):
    """Determinístico: hash del node_id → bucket de criticidad."""
    h = hashlib.md5(node_id.encode()).hexdigest()
    bucket = int(h[:8], 16) / 0xFFFFFFFF  # [0, 1)
    for thr, klass, score, prob, desc in CLASSES:
        if bucket <= thr:
            return klass, score, prob, desc
    return CLASSES[-1][1:]


def main():
    apply = "--apply" in sys.argv
    if not DB_PATH.exists():
        print(f"DB not found: {DB_PATH}", file=sys.stderr)
        sys.exit(1)
    conn = sqlite3.connect(str(DB_PATH))
    cur = conn.cursor()

    # equipos sin assessment
    nodes_without_assessment = cur.execute("""
        SELECT n.node_id, n.tag, n.name
        FROM hierarchy_nodes n
        LEFT JOIN criticality_assessments a ON a.node_id = n.node_id
        WHERE n.node_type = 'EQUIPMENT' AND a.assessment_id IS NULL
    """).fetchall()

    print(f"Found {len(nodes_without_assessment)} EQUIPMENT nodes sin criticidad")
    if not nodes_without_assessment:
        print("Nothing to seed.")
        return

    if not apply:
        print("\n[DRY RUN — pass --apply to write]")
        sample = nodes_without_assessment[:5]
        for nid, tag, name in sample:
            klass, score, prob, desc = class_for_node(nid)
            print(f"  {tag or nid[:8]} ({(name or '')[:40]}): {klass} (score={score}, prob={prob}) — {desc}")
        if len(nodes_without_assessment) > 5:
            print(f"  ... and {len(nodes_without_assessment) - 5} more")
        # Show distribution
        from collections import Counter
        dist = Counter(class_for_node(n[0])[0] for n in nodes_without_assessment)
        print(f"\nDistribución target:")
        for k, c in sorted(dist.items()):
            pct = 100 * c / len(nodes_without_assessment)
            print(f"  {k}: {c} ({pct:.1f}%)")
        return

    import uuid
    inserted = 0
    for nid, tag, name in nodes_without_assessment:
        klass, score, prob, desc = class_for_node(nid)
        cur.execute("""
            INSERT INTO criticality_assessments
            (assessment_id, node_id, assessed_at, assessed_by, method, criteria_scores, probability, overall_score, risk_class, ai_justification, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            str(uuid.uuid4()),
            nid,
            datetime.now().isoformat(),
            "system_seed_0D4",
            "SIMPLIFIED",
            '[{"category":"safety","score":3},{"category":"production","score":3},{"category":"environment","score":2},{"category":"quality","score":3},{"category":"cost","score":3},{"category":"frequency","score":3}]',
            int(prob),
            float(score * prob),
            klass,
            f"SIMULATED — {desc}. Pendiente revisar con planilla real del cliente.",
            "DRAFT",
        ))
        inserted += 1
    conn.commit()
    conn.close()
    print(f"Inserted {inserted} criticality_assessments (status=DRAFT, assessed_by=system_seed_0D4)")


if __name__ == "__main__":
    main()
