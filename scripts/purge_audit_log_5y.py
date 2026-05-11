#!/usr/bin/env python3
"""Purga audit_log >5 años — script autorizado por docs/AUDIT_LOG_POLICY.md §4 + §6.

Política:
  - 2 años activos en BD principal
  - 5 años en archivo (export semanal a S3/blob storage)
  - >5 años: elimina con notificación previa al stakeholder

Default: --dry-run (NO borra, solo reporta qué borraría).
Para borrar de verdad pasar --confirm.

Uso:
  python scripts/purge_audit_log_5y.py                  # dry-run (default)
  python scripts/purge_audit_log_5y.py --confirm        # borra
  python scripts/purge_audit_log_5y.py --years 7        # umbral custom
  python scripts/purge_audit_log_5y.py --export-csv X.csv  # export antes de borrar
"""
from __future__ import annotations

import argparse
import csv
import json
import sys
from datetime import datetime, timedelta
from pathlib import Path

# Permitir ejecutar desde cualquier cwd
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--confirm", action="store_true",
                        help="Ejecuta el DELETE de verdad. Sin esto, solo dry-run.")
    parser.add_argument("--years", type=float, default=5.0,
                        help="Umbral en años (default 5).")
    parser.add_argument("--export-csv", type=str, default=None,
                        help="Path donde exportar las filas que se van a borrar (CSV).")
    parser.add_argument("--batch-size", type=int, default=5000,
                        help="Tamaño de batch para el DELETE (default 5000).")
    args = parser.parse_args(argv)

    from api.database.connection import SessionLocal
    from api.database.models import AuditLogModel

    cutoff = datetime.now() - timedelta(days=args.years * 365.25)

    with SessionLocal() as db:
        q = db.query(AuditLogModel).filter(AuditLogModel.timestamp < cutoff)
        total = q.count()
        if total == 0:
            print(f"[OK] Sin filas con timestamp < {cutoff.isoformat()} — nada que purgar.")
            return 0

        oldest = q.order_by(AuditLogModel.timestamp.asc()).first()
        newest_to_delete = q.order_by(AuditLogModel.timestamp.desc()).first()
        print(f"[INFO] Umbral: {args.years} años (cutoff: {cutoff.isoformat()})")
        print(f"[INFO] Filas a purgar: {total}")
        print(f"[INFO] Rango: {oldest.timestamp.isoformat()} → {newest_to_delete.timestamp.isoformat()}")

        # Breakdown por entity_type
        breakdown: dict[str, int] = {}
        for row in q.with_entities(AuditLogModel.entity_type).all():
            et = row[0] or "(null)"
            breakdown[et] = breakdown.get(et, 0) + 1
        print("[INFO] Por entity_type:")
        for et, n in sorted(breakdown.items(), key=lambda x: -x[1]):
            print(f"         {et:40s} {n}")

        if args.export_csv:
            out_path = Path(args.export_csv)
            out_path.parent.mkdir(parents=True, exist_ok=True)
            print(f"[INFO] Exportando {total} filas a {out_path}...")
            with open(out_path, "w", newline="", encoding="utf-8") as f:
                w = csv.writer(f)
                w.writerow(["id", "timestamp", "entity_type", "entity_id", "action", "user", "payload", "ip_address"])
                for row in q.yield_per(args.batch_size):
                    w.writerow([
                        row.id,
                        row.timestamp.isoformat() if row.timestamp else "",
                        row.entity_type or "",
                        row.entity_id or "",
                        row.action or "",
                        row.user or "",
                        json.dumps(row.payload, default=str) if row.payload else "",
                        row.ip_address or "",
                    ])
            print(f"[OK]   Export completo: {out_path}")

        if not args.confirm:
            print("\n[DRY-RUN] No se borró nada. Re-correr con --confirm para ejecutar.")
            return 0

        # Real delete
        print(f"\n[DELETE] Borrando {total} filas en batches de {args.batch_size}...")
        deleted = 0
        while True:
            ids = [r.id for r in q.limit(args.batch_size).all()]
            if not ids:
                break
            db.query(AuditLogModel).filter(AuditLogModel.id.in_(ids)).delete(synchronize_session=False)
            db.commit()
            deleted += len(ids)
            print(f"[DELETE] {deleted}/{total}...", end="\r")
        print(f"\n[OK] Borradas {deleted} filas.")
        return 0


if __name__ == "__main__":
    sys.exit(main())
