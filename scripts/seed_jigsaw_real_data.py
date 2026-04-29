"""Carga la data real de los Excels Jigsaw (mantenimiento minero) como
ManagedWorkOrders cerradas en la BD. Permite que Performance Analysis (Pareto +
Jack-Knife) compute sobre datos reales históricos en lugar de sintéticos.

Uso:
    docker cp scripts/seed_jigsaw_real_data.py ocp-backend:/app/seed_jigsaw.py
    docker exec ocp-backend python3 /app/seed_jigsaw.py

Lee:
- Ayudas/Análisis Jack Knife/Ejemplos Jack Knife/Jack Knife Abril 2010.xls
  (hojas: CAM797A, CAM797B, PALAS, DMM3, PV351 — eventos detallados con
   tiempo inicio/fin, equipo, descripción)
- Ayudas/Análisis Pareto/Ejemplos Pareto/pareto tiempos indisponibilidad del
  01 al 30 de Septiembre 2010 modif..xls (Sheet1: 309 eventos detallados)

Crea OTs CERRADO con wo_type derivado del estado:
  Mantencion No Planificada → PM03 (correctivo de falla)
  Mantencion Preventiva → PM02
  Mant. Planificada → PM01

Equipment_tag: usa los códigos C01-C16 (camiones), PA01-PA03 (palas), DMM03,
PV351, etc — replicando el formato Jorge.
"""
from __future__ import annotations
import os
import sys
import xlrd
from datetime import datetime, timedelta
from pathlib import Path

# Path para scripts en docker container
sys.path.insert(0, '/app')
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text
from api.database.connection import SessionLocal
from api.database.models import ManagedWorkOrderModel, WorkRequestModel

PLANT = "GOLDFIELDS-SN"
JIGSAW_TAG_PREFIX = "JS"  # marca para distinguirlas del seed sintético


def excel_serial_to_date(serial):
    """Convierte número serial Excel (días desde 1900-01-01) a datetime."""
    if not isinstance(serial, (int, float)) or serial <= 0:
        return None
    base = datetime(1899, 12, 30)
    return base + timedelta(days=float(serial))


def map_state_to_wo_type(state: str) -> str:
    s = (state or "").lower()
    if "no planif" in s:
        return "PM03"
    if "preventiva" in s:
        return "PM02"
    if "planif" in s:
        return "PM01"
    return "PM01"


def map_state_to_priority(state: str) -> str:
    s = (state or "").lower()
    if "no planif" in s:
        return "P2"  # falla → P2 medio
    return "P3"  # programados → P3


def load_pareto_excel(db, xls_path):
    """Carga eventos del Excel Pareto Sept 2010 (Sheet1)."""
    if not os.path.exists(xls_path):
        print(f"  ! No existe: {xls_path}")
        return 0
    print(f"[jigsaw] Leyendo {xls_path}...")
    wb = xlrd.open_workbook(xls_path)
    s = wb.sheet_by_name("Sheet1")
    created = 0
    for r in range(15, s.nrows):
        row = [s.cell_value(r, c) for c in range(s.ncols)]
        if not row[0] or not row[1]:
            continue
        flota, equipo = row[0], row[1]
        # row[2]: Tiempo inicio (serial Excel)
        # row[3]: Tiempo fin
        # row[4]: Duración HH:MM:SS
        # row[6]: Estado (Mantencion No Planificada / Preventiva / etc)
        # row[7]: Sistema afectado
        # row[8]: Comentario
        # row[13]: Duración en horas (decimal)
        start = excel_serial_to_date(row[2])
        end = excel_serial_to_date(row[3])
        state = str(row[6] or "")
        sistema = str(row[7] or "")
        comentario = str(row[8] or "")[:300]
        try:
            hours = float(row[13]) if row[13] else 0
        except (ValueError, TypeError):
            hours = 0
        if not start or not end or hours <= 0 or not sistema:
            continue
        wo_type = map_state_to_wo_type(state)
        priority = map_state_to_priority(state)
        # equipment_tag: prefijo "JS-FLOTA-EQUIPO" para no chocar con seed
        eq_tag = f"{JIGSAW_TAG_PREFIX}-{flota}-{equipo}"
        wo = ManagedWorkOrderModel(
            wo_number=f"OT-JS-{r:05d}-S",
            plant_id=PLANT,
            equipment_id=eq_tag,
            equipment_tag=eq_tag,
            wo_type=wo_type,
            priority_code=priority,
            work_class="NO_PROGRAMADO" if priority in ("P1", "P2") else "PROGRAMADO",
            description=f"{sistema} — {comentario[:100]}",
            estimated_hours=hours,
            actual_hours=hours,
            status="CERRADO",
            planned_start=start,
            planned_end=end,
            actual_start=start,
            actual_end=end,
            completion_pct=100.0,
            closed_by="jigsaw_import",
            closed_at=end,
            closed_by_signature="Jorge Alquinta (histórico)",
            closure_notes=f"Importado de Excel Sept 2010. Flota {flota}, Equipo {equipo}.",
            operations=[{
                "op_number": 1,
                "description": sistema,
                "specialty": sistema,  # esto ES el sistema (Jorge usa specialty == sistema)
                "op_type": "INT",
                "quantity": 1,
                "duration": hours,
                "estimated_hours": hours,
                "planned_hours": hours,
                "actual_hours": hours,
                "completion_pct": 100.0,
                "status": "COMPLETED",
                "notifications": [],
            }],
            materials=[],
            created_at=start,
            updated_at=end,
        )
        db.add(wo)
        created += 1
        if created % 50 == 0:
            db.commit()
            print(f"  · {created} eventos cargados...")
    db.commit()
    print(f"  ✓ {created} eventos Pareto Sept 2010 cargados")
    return created


def load_jackknife_excel(db, xls_path):
    """Carga eventos del Excel Jack-Knife Abril 2010 (hojas CAM*/PALAS/etc)."""
    if not os.path.exists(xls_path):
        print(f"  ! No existe: {xls_path}")
        return 0
    print(f"[jigsaw] Leyendo {xls_path}...")
    wb = xlrd.open_workbook(xls_path)
    created = 0
    for sn in wb.sheet_names():
        # Saltar hojas de pivot (Jack Knife <flota>) — solo cargar raw
        if sn.startswith("Jack Knife") or sn == "Flota Servicio" or sn == "L1350.":
            continue
        s = wb.sheet_by_name(sn)
        if s.nrows < 2:
            continue
        # headers: Tiempo, Tiempo Final, Grupo, Turno, Duracion, Duración Horas, Equipo, Estado, ...
        # En PALAS/etc puede haber variantes — adaptar
        for r in range(1, s.nrows):
            row = [s.cell_value(r, c) for c in range(s.ncols)]
            try:
                start_str = str(row[0])
                end_str = str(row[1])
                hours = float(row[5]) if row[5] else 0
                equipo = str(row[6] or "")
                estado = str(row[7] or "")
                sistema = str(row[9]) if len(row) > 9 else ""
                comentario = str(row[10]) if len(row) > 10 else ""
            except (ValueError, IndexError):
                continue
            if not equipo or hours <= 0:
                continue
            # Parse 'Mon Apr 26 04:59:00 2010' → datetime
            try:
                start = datetime.strptime(start_str, "%a %b %d %H:%M:%S %Y")
                end = datetime.strptime(end_str, "%a %b %d %H:%M:%S %Y")
            except (ValueError, TypeError):
                continue
            wo_type = "PM03" if "Mantencion" == estado else "PM01"
            priority = "P2"
            eq_tag = f"{JIGSAW_TAG_PREFIX}-{sn}-{equipo}"  # ej JS-CAM797A-C03
            wo = ManagedWorkOrderModel(
                wo_number=f"OT-JS-{sn[:6]}-{r:04d}",
                plant_id=PLANT,
                equipment_id=eq_tag,
                equipment_tag=eq_tag,
                wo_type=wo_type,
                priority_code=priority,
                work_class="NO_PROGRAMADO" if priority in ("P1", "P2") else "PROGRAMADO",
                description=f"{sistema or 'Mantención'} — {comentario[:100]}",
                estimated_hours=hours,
                actual_hours=hours,
                status="CERRADO",
                planned_start=start,
                planned_end=end,
                actual_start=start,
                actual_end=end,
                completion_pct=100.0,
                closed_by="jigsaw_import",
                closed_at=end,
                closed_by_signature="Jorge Alquinta (histórico)",
                closure_notes=f"Importado de Excel Abril 2010 · hoja {sn}",
                operations=[{
                    "op_number": 1,
                    "description": sistema or estado,
                    "specialty": sistema or estado,
                    "op_type": "INT",
                    "quantity": 1,
                    "duration": hours,
                    "estimated_hours": hours,
                    "planned_hours": hours,
                    "actual_hours": hours,
                    "completion_pct": 100.0,
                    "status": "COMPLETED",
                    "notifications": [],
                }],
                materials=[],
                created_at=start,
                updated_at=end,
            )
            db.add(wo)
            created += 1
        db.commit()
    print(f"  ✓ {created} eventos Jack-Knife Abril 2010 cargados")
    return created


def main():
    db = SessionLocal()
    try:
        # Limpiar imports previos para idempotencia
        before = db.execute(text(
            "SELECT COUNT(*) FROM managed_work_orders WHERE wo_number LIKE 'OT-JS-%'"
        )).scalar()
        if before > 0:
            print(f"[jigsaw] Limpiando {before} OTs Jigsaw previas...")
            db.execute(text("DELETE FROM managed_work_orders WHERE wo_number LIKE 'OT-JS-%'"))
            db.commit()
        # Cargar
        base = Path(__file__).parent.parent
        n1 = load_pareto_excel(db, str(base / "Ayudas/Análisis Pareto/Ejemplos Pareto/pareto tiempos indisponibilidad del 01 al 30 de Septiembre 2010 modif..xls"))
        n2 = load_jackknife_excel(db, str(base / "Ayudas/Análisis Jack Knife/Ejemplos Jack Knife/Jack Knife Abril 2010.xls"))
        print(f"\n✅ TOTAL: {n1 + n2} OTs Jigsaw cargadas (Pareto={n1}, JackKnife={n2})")
    finally:
        db.close()


if __name__ == "__main__":
    main()
