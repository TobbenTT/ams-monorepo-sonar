"""
audit_consistency.py — Auditoria rigurosa cross-table
Verifica que TODAS las tablas son consistentes entre si.
"""
import pandas as pd
import numpy as np
import os

BASE = os.path.dirname(os.path.abspath(__file__))

print("=" * 70)
print("AUDITORIA CROSS-TABLE COMPLETA")
print("=" * 70)

# Load all relevant tables
df06 = pd.read_excel(os.path.join(BASE, "06_work_order_history.xlsx"))
df23 = pd.read_excel(os.path.join(BASE, "23_active_backlog.xlsx"))
df24 = pd.read_excel(os.path.join(BASE, "24_notifications.xlsx"))
df26 = pd.read_excel(os.path.join(BASE, "26_time_confirmations.xlsx"))
df27 = pd.read_excel(os.path.join(BASE, "27_material_movements.xlsx"))
df29 = pd.read_excel(os.path.join(BASE, "29_cost_history.xlsx"))
df31 = pd.read_excel(os.path.join(BASE, "31_maintenance_schedule_3w.xlsx"))
df34 = pd.read_excel(os.path.join(BASE, "34_permits_to_work.xlsx"))
df35 = pd.read_excel(os.path.join(BASE, "35_weekly_program.xlsx"))
df37 = pd.read_excel(os.path.join(BASE, "37_material_reservations.xlsx"))
df40 = pd.read_excel(os.path.join(BASE, "40_daily_log.xlsx"))

errors = []
warnings = []

# ─── 1. Column names in 06 ──────────────────────────────────────────────
print("\n--- 06_work_order_history.xlsx ---")
print(f"  Columnas: {list(df06.columns)}")
print(f"  Status unicos: {sorted(df06['status'].unique())}")
print(f"  Rows: {len(df06)}")

expected_statuses = {"CREADA", "LIBERADA", "PLANIFICADA", "EN_PROGRAMACION", "PROGRAMADA", "INICIADA", "CERRADA"}
actual_statuses = set(df06["status"].unique())
bad_statuses = actual_statuses - expected_statuses
if bad_statuses:
    errors.append(f"06: Status inesperados: {bad_statuses}")
    print(f"  ERROR: Status inesperados: {bad_statuses}")
else:
    print(f"  OK: Todos los status son validos")

# ─── 2. CERRADA must have actual_start, actual_end, completed_by ────────
cerrada = df06[df06["status"] == "CERRADA"]
cerrada_no_start = cerrada[cerrada["actual_start"].isna()]
cerrada_no_end = cerrada[cerrada["actual_end"].isna()]
cerrada_no_completed = cerrada[(cerrada["completed_by"].isna()) | (cerrada["completed_by"] == "")]
print(f"\n  CERRADA ({len(cerrada)}):")
print(f"    Sin actual_start: {len(cerrada_no_start)}")
print(f"    Sin actual_end: {len(cerrada_no_end)}")
print(f"    Sin completed_by: {len(cerrada_no_completed)}")
if len(cerrada_no_start) > 0:
    errors.append(f"06: {len(cerrada_no_start)} CERRADA sin actual_start")
if len(cerrada_no_end) > 0:
    errors.append(f"06: {len(cerrada_no_end)} CERRADA sin actual_end")
if len(cerrada_no_completed) > 0:
    errors.append(f"06: {len(cerrada_no_completed)} CERRADA sin completed_by")

# ─── 3. CREADA/LIBERADA/PLANIFICADA must NOT have actual_start/end ──────
for st in ["CREADA", "LIBERADA", "PLANIFICADA"]:
    subset = df06[df06["status"] == st]
    has_actual_start = subset[subset["actual_start"].notna()]
    has_actual_end = subset[subset["actual_end"].notna()]
    if len(has_actual_start) > 0:
        errors.append(f"06: {len(has_actual_start)} {st} tienen actual_start (no deberian)")
        print(f"  ERROR: {len(has_actual_start)} {st} tienen actual_start")
    if len(has_actual_end) > 0:
        errors.append(f"06: {len(has_actual_end)} {st} tienen actual_end (no deberian)")
        print(f"  ERROR: {len(has_actual_end)} {st} tienen actual_end")

# ─── 4. EN_PROGRAMACION/PROGRAMADA must have plan dates but NO actual ───
for st in ["EN_PROGRAMACION", "PROGRAMADA"]:
    subset = df06[df06["status"] == st]
    has_actual = subset[subset["actual_start"].notna()]
    no_plan = subset[subset["plan_start"].isna()]
    if len(has_actual) > 0:
        errors.append(f"06: {len(has_actual)} {st} tienen actual_start (no deberian)")
    if len(no_plan) > 0:
        warnings.append(f"06: {len(no_plan)} {st} sin plan_start")
    print(f"  {st} ({len(subset)}): con actual_start={len(has_actual)}, sin plan_start={len(no_plan)}")

# ─── 5. INICIADA must have actual_start, NO completed_by ────────────────
iniciada = df06[df06["status"] == "INICIADA"]
ini_no_start = iniciada[iniciada["actual_start"].isna()]
ini_with_completed = iniciada[(iniciada["completed_by"].notna()) & (iniciada["completed_by"] != "")]
print(f"\n  INICIADA ({len(iniciada)}):")
print(f"    Sin actual_start: {len(ini_no_start)}")
print(f"    Con completed_by (supervisor no cerro): {len(ini_with_completed)}")
if len(ini_no_start) > 0:
    errors.append(f"06: {len(ini_no_start)} INICIADA sin actual_start")

# ─── 6. Cross-check: 06 vs 26 (time confirmations) ─────────────────────
print("\n--- 06 vs 26_time_confirmations ---")
cerrada_orders = set(cerrada["order_number"])
orders_with_conf = set(df26["order_number"].unique())
cerrada_no_conf = cerrada_orders - orders_with_conf
print(f"  CERRADA sin confirmacion: {len(cerrada_no_conf)}")
if len(cerrada_no_conf) > 0:
    errors.append(f"26: {len(cerrada_no_conf)} CERRADA sin time confirmation")

# INICIADA should have partial confirmations
iniciada_orders = set(iniciada["order_number"])
iniciada_with_conf = iniciada_orders & orders_with_conf
iniciada_no_conf = iniciada_orders - orders_with_conf
print(f"  INICIADA con confirmacion parcial: {len(iniciada_with_conf)}/{len(iniciada_orders)}")
if len(iniciada_no_conf) > 0:
    errors.append(f"26: {len(iniciada_no_conf)} INICIADA sin time confirmation parcial")

# Verify INICIADA confirmations are NOT final
for order in iniciada_with_conf:
    confs = df26[df26["order_number"] == order]
    final_confs = confs[confs["final_confirmation"] == "X"]
    if len(final_confs) > 0:
        warnings.append(f"26: INICIADA order {order} tiene confirmacion final (deberia ser parcial)")

# Non-CERRADA/INICIADA should NOT have confirmations
other_statuses = {"CREADA", "LIBERADA", "PLANIFICADA", "EN_PROGRAMACION", "PROGRAMADA"}
other_orders = set(df06[df06["status"].isin(other_statuses)]["order_number"])
other_with_conf = other_orders & orders_with_conf
if len(other_with_conf) > 0:
    warnings.append(f"26: {len(other_with_conf)} OTs en status pre-ejecucion tienen confirmaciones")
    print(f"  WARNING: {len(other_with_conf)} OTs pre-ejecucion con confirmaciones")

# ─── 7. Cross-check: 06 vs 24 (notifications) ──────────────────────────
print("\n--- 06 vs 24_notifications ---")
pm01_orders = df06[df06["order_type"] == "PM01"]
pm01_no_notif = pm01_orders[pm01_orders["notification_number"].isna() | (pm01_orders["notification_number"] == "")]
print(f"  PM01 sin notification_number: {len(pm01_no_notif)}/{len(pm01_orders)}")
if len(pm01_no_notif) > 0:
    errors.append(f"24: {len(pm01_no_notif)} PM01 sin notification_number")

# Check that notification_numbers in 06 actually exist in 24
notif_nums_in_06 = set(df06["notification_number"].dropna().unique())
notif_nums_in_24 = set(df24["notification_number"].dropna().unique())
missing_in_24 = notif_nums_in_06 - notif_nums_in_24
if len(missing_in_24) > 0:
    print(f"  WARNING: {len(missing_in_24)} notification_numbers en 06 no existen en 24")
    warnings.append(f"24: {len(missing_in_24)} notif refs en 06 no existen en 24")

# NOTI notifications (no order)
noti_only = df24[(df24["order_number"].isna()) | (df24["order_number"] == "")]
print(f"  Notificaciones NOTI (sin OT): {len(noti_only)}")
noti_statuses = noti_only["status"].value_counts().to_dict() if len(noti_only) > 0 else {}
print(f"    Status: {noti_statuses}")

# ─── 8. Cross-check: 06 vs 27 (material movements) ─────────────────────
print("\n--- 06 vs 27_material_movements ---")
orders_27 = set(df27["order_number"].unique())
all_orders_06 = set(df06["order_number"].unique())
orphan_27 = orders_27 - all_orders_06
print(f"  Ordenes en 27 no en 06: {len(orphan_27)}")
if len(orphan_27) > 0:
    errors.append(f"27: {len(orphan_27)} ordenes huerfanas")

# Material movements should only be for CERRADA orders
orders_27_status = df06[df06["order_number"].isin(orders_27)]["status"].value_counts().to_dict()
print(f"  Status de ordenes en 27: {orders_27_status}")

# ─── 9. Cross-check: 06 vs 29 (cost history) ───────────────────────────
print("\n--- 06 vs 29_cost_history ---")
orders_29 = set(df29["order_number"].unique())
orphan_29 = orders_29 - all_orders_06
print(f"  Ordenes en 29 no en 06: {len(orphan_29)}")
if len(orphan_29) > 0:
    errors.append(f"29: {len(orphan_29)} ordenes huerfanas")

orders_29_status = df06[df06["order_number"].isin(orders_29)]["status"].value_counts().to_dict()
print(f"  Status de ordenes en 29: {orders_29_status}")

# ─── 10. Cross-check: 23 (backlog) ─────────────────────────────────────
print("\n--- 23_active_backlog ---")
print(f"  Status: {df23['status'].value_counts().to_dict()}")
print(f"  Columnas: {list(df23.columns)}")

# Backlog should have waiting_reason
if "waiting_reason" not in df23.columns:
    errors.append("23: Falta columna waiting_reason")
else:
    print(f"  Waiting reasons: {df23['waiting_reason'].value_counts().to_dict()}")

if "materials_status" not in df23.columns:
    errors.append("23: Falta columna materials_status")
else:
    print(f"  Materials status: {df23['materials_status'].value_counts().to_dict()}")

if "special_equipment_status" not in df23.columns:
    errors.append("23: Falta columna special_equipment_status")

# PLANIFICADA should have SIN_RESTRICCION and materials_status=CONFIRMADO
if "waiting_reason" in df23.columns:
    planif = df23[df23["status"] == "PLANIFICADA"]
    planif_bad_wr = planif[planif["waiting_reason"] != "SIN_RESTRICCION"]
    if len(planif_bad_wr) > 0:
        errors.append(f"23: {len(planif_bad_wr)} PLANIFICADA con waiting_reason != SIN_RESTRICCION")
        print(f"  ERROR: {len(planif_bad_wr)} PLANIFICADA con restriccion (deberian ser SIN_RESTRICCION)")

    planif_bad_mat = planif[planif["materials_status"] != "CONFIRMADO"] if "materials_status" in df23.columns else pd.DataFrame()
    if len(planif_bad_mat) > 0:
        errors.append(f"23: {len(planif_bad_mat)} PLANIFICADA con materials_status != CONFIRMADO")

# LIBERADA should NOT have SIN_RESTRICCION
if "waiting_reason" in df23.columns:
    liber = df23[df23["status"] == "LIBERADA"]
    liber_no_reason = liber[liber["waiting_reason"] == "SIN_RESTRICCION"]
    if len(liber_no_reason) > 0:
        errors.append(f"23: {len(liber_no_reason)} LIBERADA con SIN_RESTRICCION (deberian tener restriccion)")
        print(f"  ERROR: {len(liber_no_reason)} LIBERADA sin restriccion")

# Backlog should NOT have actual dates
backlog_statuses = {"LIBERADA", "PLANIFICADA"}
if "actual_start" in df23.columns:
    bl_with_actual = df23[(df23["status"].isin(backlog_statuses)) & (df23["actual_start"].notna())]
    if len(bl_with_actual) > 0:
        warnings.append(f"23: {len(bl_with_actual)} backlog items con actual_start")

# ─── 11. Cross-check: 31 (schedule) ────────────────────────────────────
print("\n--- 31_maintenance_schedule_3w ---")
print(f"  Status: {df31['status'].value_counts().to_dict()}")
schedule_orders = set(df31["order_number"].unique())
print(f"  Ordenes unicas: {len(schedule_orders)}")

# ─── 12. Cross-check: 34 (permits) vs 31 ───────────────────────────────
print("\n--- 34 vs 31 ---")
permit_orders = set(df34["order_number"].dropna().unique())
permit_not_in_31 = permit_orders - schedule_orders
if len(permit_not_in_31) > 0:
    print(f"  WARNING: {len(permit_not_in_31)} ordenes en permisos no en schedule")
    # Check if 500000 still exists
    if 500000 in permit_orders or "500000" in [str(x) for x in permit_orders]:
        errors.append("34: Order 500000 todavia presente")

# ─── 13. Cross-check: 37 (reservations) vs 31 ─────────────────────────
print("\n--- 37 vs 31 ---")
res_orders = set(df37["order_number"].dropna().unique())
res_not_in_31 = res_orders - schedule_orders
print(f"  Reservas con ordenes no en schedule: {len(res_not_in_31)}")

# ─── 14. Cross-check: 35 (weekly program) ──────────────────────────────
print("\n--- 35_weekly_program ---")
if "order_number" in df35.columns:
    wp_orders = set(df35["order_number"].dropna().unique())
    wp_not_in_31 = wp_orders - schedule_orders
    print(f"  Ordenes en weekly program no en schedule: {len(wp_not_in_31)}")
if "notification_number" in df35.columns:
    wp_notifs = set(df35["notification_number"].dropna().unique())
    wp_notifs_not_in_24 = wp_notifs - notif_nums_in_24
    print(f"  Notifications en weekly program no en 24: {len(wp_notifs_not_in_24)}")
    if len(wp_notifs_not_in_24) > 0:
        warnings.append(f"35: {len(wp_notifs_not_in_24)} notification refs no existen en 24")

# ─── 15. Cross-check: 40 (daily log) ───────────────────────────────────
print("\n--- 40_daily_log ---")
if "related_order" in df40.columns:
    log_orders = set(df40["related_order"].dropna().astype(str).unique()) - {"", "nan"}
    log_not_in_31 = log_orders - {str(x) for x in schedule_orders}
    print(f"  Ordenes en log no en schedule: {len(log_not_in_31)}")
    if "500000" in log_orders:
        errors.append("40: Order 500000 todavia presente")

# ═══════════════════════════════════════════════════════════════════════════
# RESUMEN FINAL
# ═══════════════════════════════════════════════════════════════════════════
print("\n" + "=" * 70)
print("RESUMEN FINAL")
print("=" * 70)

print(f"\nERRORES ({len(errors)}):")
for e in errors:
    print(f"  [ERROR] {e}")

print(f"\nWARNINGS ({len(warnings)}):")
for w in warnings:
    print(f"  [WARN] {w}")

if len(errors) == 0:
    print("\n*** TODAS LAS VALIDACIONES PASARON ***")
else:
    print(f"\n*** {len(errors)} ERRORES ENCONTRADOS - REQUIEREN CORRECCION ***")
