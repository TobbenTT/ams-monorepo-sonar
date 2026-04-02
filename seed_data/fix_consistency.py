"""
fix_consistency.py — Cross-table consistency fix for showcase seed_data

Fixes:
1. Redefine OT statuses in 06 to full lifecycle
2. Complete notifications for corrective OTs + add NOTI-only records
3. Generate missing time confirmations for closed OTs
4. Enrich backlog with waiting_reason, materials_status, etc.
5. Fix orphan records in 27 and 29
6. Fix broken order references in 31, 34, 40
"""
import pandas as pd
import numpy as np
import os
from datetime import datetime, timedelta

BASE = os.path.dirname(os.path.abspath(__file__))
np.random.seed(42)

print("=" * 70)
print("FIXING CROSS-TABLE CONSISTENCY")
print("=" * 70)

# ─── Load all tables ─────────────────────────────────────────────────────
print("\nPaso 0: Cargando tablas...")
df06 = pd.read_excel(os.path.join(BASE, "06_work_order_history.xlsx"))
df23 = pd.read_excel(os.path.join(BASE, "23_active_backlog.xlsx"))
df24 = pd.read_excel(os.path.join(BASE, "24_notifications.xlsx"))
df26 = pd.read_excel(os.path.join(BASE, "26_time_confirmations.xlsx"))
df27 = pd.read_excel(os.path.join(BASE, "27_material_movements.xlsx"))
df29 = pd.read_excel(os.path.join(BASE, "29_cost_history.xlsx"))
df31 = pd.read_excel(os.path.join(BASE, "31_maintenance_schedule_3w.xlsx"))
df34 = pd.read_excel(os.path.join(BASE, "34_permits_to_work.xlsx"))
df40 = pd.read_excel(os.path.join(BASE, "40_daily_log.xlsx"))
hier = pd.read_excel(os.path.join(BASE, "01_equipment_hierarchy.xlsx"))
workforce = pd.read_excel(os.path.join(BASE, "09_workforce.xlsx"))

equip = hier[hier["equnr"].notna()].copy()
equip["sap_func_loc_short"] = equip["sap_func_loc_short"].astype(str)
lookup_name = dict(zip(equip["sap_func_loc_short"], equip["eqktx"]))
lookup_fl = dict(zip(equip["sap_func_loc_short"], equip["sap_func_loc"]))
workers = list(workforce["name"]) if "name" in workforce.columns else [f"Trabajador {i}" for i in range(1, 31)]
employee_ids = list(workforce["employee_id"]) if "employee_id" in workforce.columns else [f"EMP-{i:03d}" for i in range(1, 31)]
work_centers = ["PASMEC01", "PASELE01", "PASINS01", "PHUMEC01", "PHUELE01", "MPCMEC01"]

print(f"  06: {len(df06)} rows, 24: {len(df24)} rows, 26: {len(df26)} rows")
print(f"  23: {len(df23)} rows, 27: {len(df27)} rows, 29: {len(df29)} rows")

# ═══════════════════════════════════════════════════════════════════════════
# PASO 1: Redefinir status en 06_work_order_history
# ═══════════════════════════════════════════════════════════════════════════
print("\nPaso 1: Redefiniendo status en 06_work_order_history...")

# Current: CRTD(2851), REL(2750), TECO(2814), CLSD(2793) = 11208
# Target: CREADA(300), LIBERADA(600), PLANIFICADA(416), EN_PROGRAMACION(100),
#         PROGRAMADA(192), INICIADA(150), CERRADA(9450)

# Convert date columns to datetime
for col in ["plan_start", "plan_end", "actual_start", "actual_end"]:
    if col in df06.columns:
        df06[col] = pd.to_datetime(df06[col], errors="coerce")

# Sort by order_number to make assignment deterministic
df06 = df06.sort_values("order_number").reset_index(drop=True)

# Assign new statuses
n = len(df06)
new_status = []
# First ~9450 get CERRADA (the bulk — historical completed work)
# Then distribute the rest across active statuses
n_cerrada = n - 300 - 600 - 416 - 100 - 192 - 150  # = 9450
n_iniciada_closed_pending = 30  # OTs con actual_end pero supervisor no cerró

status_assignments = (
    ["CERRADA"] * n_cerrada +
    ["INICIADA"] * 150 +
    ["PROGRAMADA"] * 192 +
    ["EN_PROGRAMACION"] * 100 +
    ["PLANIFICADA"] * 416 +
    ["LIBERADA"] * 600 +
    ["CREADA"] * 300
)

# Shuffle within groups to make it look natural (but keep CERRADA as the oldest orders)
df06["new_status"] = status_assignments[:n]

# Now adjust data fields based on status
for idx, row in df06.iterrows():
    st = row["new_status"]

    if st == "CREADA":
        # Only basic info, no resources, no dates
        df06.at[idx, "plan_start"] = pd.NaT
        df06.at[idx, "plan_end"] = pd.NaT
        df06.at[idx, "actual_start"] = pd.NaT
        df06.at[idx, "actual_end"] = pd.NaT
        df06.at[idx, "total_hours"] = np.nan
        df06.at[idx, "total_cost_usd"] = np.nan
        df06.at[idx, "completed_by"] = ""

    elif st == "LIBERADA":
        # Resources identified but not confirmed, no execution dates
        df06.at[idx, "actual_start"] = pd.NaT
        df06.at[idx, "actual_end"] = pd.NaT
        df06.at[idx, "completed_by"] = ""
        # Keep plan_start/end as rough estimates, keep total_hours as estimate

    elif st == "PLANIFICADA":
        # Resources confirmed, no execution dates
        df06.at[idx, "actual_start"] = pd.NaT
        df06.at[idx, "actual_end"] = pd.NaT
        df06.at[idx, "completed_by"] = ""

    elif st == "EN_PROGRAMACION":
        # Tentative scheduled date, no actual dates yet
        df06.at[idx, "actual_start"] = pd.NaT
        df06.at[idx, "actual_end"] = pd.NaT
        df06.at[idx, "completed_by"] = ""
        # plan_start/end become tentative schedule dates
        base_date = datetime(2026, 4, 6) + timedelta(days=np.random.randint(0, 21))
        df06.at[idx, "plan_start"] = base_date
        df06.at[idx, "plan_end"] = base_date + timedelta(hours=np.random.randint(4, 16))

    elif st == "PROGRAMADA":
        # Firm dates, no actual dates yet
        df06.at[idx, "actual_start"] = pd.NaT
        df06.at[idx, "actual_end"] = pd.NaT
        df06.at[idx, "completed_by"] = ""
        base_date = datetime(2026, 4, 6) + timedelta(days=np.random.randint(0, 21))
        df06.at[idx, "plan_start"] = base_date.replace(hour=7)
        df06.at[idx, "plan_end"] = base_date.replace(hour=7) + timedelta(hours=np.random.randint(4, 12))

    elif st == "INICIADA":
        # actual_start populated, actual_end empty (still in field)
        if pd.notna(row.get("actual_start")):
            pass  # keep existing actual_start
        else:
            df06.at[idx, "actual_start"] = datetime(2026, 4, 1) + timedelta(days=np.random.randint(0, 5))
        df06.at[idx, "actual_end"] = pd.NaT
        df06.at[idx, "completed_by"] = ""
        df06.at[idx, "total_cost_usd"] = np.nan  # not finalized

    elif st == "CERRADA":
        # Everything complete — keep existing data, ensure it's populated
        if pd.isna(row.get("actual_start")) or row.get("actual_start") == "":
            df06.at[idx, "actual_start"] = row.get("plan_start", datetime(2025, 6, 1))
        if pd.isna(row.get("actual_end")) or row.get("actual_end") == "":
            start = df06.at[idx, "actual_start"]
            if pd.notna(start):
                df06.at[idx, "actual_end"] = start + timedelta(hours=np.random.randint(2, 24))
        if pd.isna(row.get("completed_by")) or row.get("completed_by") == "":
            df06.at[idx, "completed_by"] = np.random.choice(workers)
        if pd.isna(row.get("total_hours")) or row.get("total_hours") == 0:
            df06.at[idx, "total_hours"] = round(np.random.uniform(2, 40), 1)
        if pd.isna(row.get("total_cost_usd")) or row.get("total_cost_usd") == 0:
            df06.at[idx, "total_cost_usd"] = round(np.random.uniform(500, 25000), 2)

# ~30 INICIADA that have actual_end but supervisor didn't close
iniciada_mask = df06["new_status"] == "INICIADA"
iniciada_indices = df06[iniciada_mask].index.tolist()
pending_close = np.random.choice(iniciada_indices, size=min(30, len(iniciada_indices)), replace=False)
for idx in pending_close:
    start = df06.at[idx, "actual_start"]
    if pd.notna(start):
        df06.at[idx, "actual_end"] = start + timedelta(hours=np.random.randint(4, 16))
    # completed_by stays empty — supervisor hasn't closed it

# Replace status column
df06["status"] = df06["new_status"]
df06.drop(columns=["new_status"], inplace=True)

status_counts = df06["status"].value_counts()
print("  Distribución de status:")
for st in ["CREADA", "LIBERADA", "PLANIFICADA", "EN_PROGRAMACION", "PROGRAMADA", "INICIADA", "CERRADA"]:
    print(f"    {st}: {status_counts.get(st, 0)}")

# ═══════════════════════════════════════════════════════════════════════════
# PASO 2: Completar notifications (24)
# ═══════════════════════════════════════════════════════════════════════════
print("\nPaso 2: Completando notificaciones...")

# Find PM01 orders without notification
pm01_orders = df06[df06["order_type"] == "PM01"]
pm01_with_notif = pm01_orders[pm01_orders["notification_number"].notna() & (pm01_orders["notification_number"] != "")]
pm01_without_notif = pm01_orders[pm01_orders["notification_number"].isna() | (pm01_orders["notification_number"] == "")]

existing_notif_nums = set(df24["notification_number"].dropna().unique())
max_notif = max([int(n) for n in existing_notif_nums if str(n).isdigit()], default=1020211)

# Generate missing notifications for PM01 without one
new_notifs = []
notif_counter = max_notif + 1

for idx, row in pm01_without_notif.iterrows():
    notif_num = notif_counter
    notif_counter += 1

    # Link the notification back to the order
    df06.at[idx, "notification_number"] = notif_num

    tag = str(row.get("sap_func_loc_short", ""))
    status_ot = row["status"]

    # Notification status depends on OT status
    if status_ot == "CERRADA":
        notif_status = "CERRADO"
    elif status_ot in ["INICIADA", "PROGRAMADA", "EN_PROGRAMACION"]:
        notif_status = "CONVERTIDO_A_OT"
    else:
        notif_status = "CONVERTIDO_A_OT"

    new_notifs.append({
        "notification_number": notif_num,
        "notif_type": np.random.choice(["M1", "M2"]),
        "description": row.get("description", f"Falla reportada en {lookup_name.get(tag, tag)}"),
        "sap_func_loc": row.get("sap_func_loc", lookup_fl.get(tag, "")),
        "sap_func_loc_short": tag,
        "equipment_name": row.get("equipment_name", lookup_name.get(tag, "")),
        "equnr": row.get("equnr", ""),
        "priority": row.get("priority", "3-Media"),
        "status": notif_status,
        "creation_date": row.get("plan_start", datetime(2025, 6, 1)),
        "malfunction_start": row.get("actual_start", pd.NaT),
        "malfunction_end": row.get("actual_end", pd.NaT),
        "reported_by": np.random.choice(workers),
        "catalog_profile": np.random.choice(["CP-MECH", "CP-ELEC", "CP-INST", "CP-GEN"]),
        "damage_code": np.random.choice(["FRAC", "VIBR", "FUGA", "CORR", "DESG", "SOBR", "CONT"]),
        "cause_code": np.random.choice(["Desgaste", "Corrosión", "Sobrecarga", "Fatiga", "Contaminación", "Desalineación", ""]),
        "order_number": row["order_number"],
    })

# Add ~200 NOTI-only notifications (no OT yet)
equip_tags = list(equip["sap_func_loc_short"])
for i in range(200):
    notif_counter += 1
    tag = np.random.choice(equip_tags)
    creation = datetime(2026, 3, 15) + timedelta(days=np.random.randint(0, 18))

    new_notifs.append({
        "notification_number": notif_counter,
        "notif_type": np.random.choice(["M1", "M2"]),
        "description": np.random.choice([
            f"Fuga menor en sello mecánico de {lookup_name.get(tag, tag)}",
            f"Vibración elevada reportada en {lookup_name.get(tag, tag)}",
            f"Ruido anormal en rodamiento de {lookup_name.get(tag, tag)}",
            f"Corrosión visible en base de {lookup_name.get(tag, tag)}",
            f"Alarma de temperatura en {lookup_name.get(tag, tag)}",
            f"Desgaste visible en correa de {lookup_name.get(tag, tag)}",
            f"Goteo en línea de refrigeración de {lookup_name.get(tag, tag)}",
            f"Guarda de protección dañada en {lookup_name.get(tag, tag)}",
        ]),
        "sap_func_loc": lookup_fl.get(tag, ""),
        "sap_func_loc_short": tag,
        "equipment_name": lookup_name.get(tag, ""),
        "equnr": "",
        "priority": np.random.choice(["1-Inmediata", "2-Alta", "3-Media", "4-Baja"], p=[0.05, 0.20, 0.50, 0.25]),
        "status": np.random.choice(["ABIERTO", "EN_EVALUACION"], p=[0.6, 0.4]),
        "creation_date": creation,
        "malfunction_start": creation - timedelta(hours=np.random.randint(1, 48)),
        "malfunction_end": pd.NaT,
        "reported_by": np.random.choice(workers),
        "catalog_profile": np.random.choice(["CP-MECH", "CP-ELEC", "CP-INST", "CP-GEN"]),
        "damage_code": np.random.choice(["FRAC", "VIBR", "FUGA", "CORR", "DESG", "SOBR"]),
        "cause_code": "",
        "order_number": "",  # NO OT yet — this is the NOTI status
    })

# Update existing notification statuses
status_map_notif = {
    "NOPR": "ABIERTO",
    "OSNO": "CONVERTIDO_A_OT",
    "ORAS": "EN_EVALUACION",
    "NOCO": "CERRADO",
}
df24["status"] = df24["status"].map(lambda x: status_map_notif.get(x, x))

# Append new notifications
df24_new = pd.concat([df24, pd.DataFrame(new_notifs)], ignore_index=True)
print(f"  Notificaciones: {len(df24)} ->{len(df24_new)} (+{len(new_notifs)})")
print(f"    NOTI (sin OT): {len([n for n in new_notifs if n['order_number'] == ''])}")
print(f"    Faltantes PM01: {len([n for n in new_notifs if n['order_number'] != ''])}")
df24 = df24_new

# ═══════════════════════════════════════════════════════════════════════════
# PASO 3: Completar time confirmations (26)
# ═══════════════════════════════════════════════════════════════════════════
print("\nPaso 3: Completando time confirmations...")

# Find CERRADA orders without confirmations
cerrada_orders = set(df06[df06["status"] == "CERRADA"]["order_number"])
orders_with_conf = set(df26["order_number"].unique())
cerrada_without_conf = cerrada_orders - orders_with_conf

max_conf_num = len(df26)
new_confs = []

for order_num in cerrada_without_conf:
    order_row = df06[df06["order_number"] == order_num].iloc[0]
    max_conf_num += 1
    tag = str(order_row.get("sap_func_loc_short", ""))

    conf_date = order_row.get("actual_end", order_row.get("actual_start", datetime(2025, 6, 1)))
    if pd.isna(conf_date):
        conf_date = datetime(2025, 6, 1)

    actual_hours = order_row.get("total_hours", np.random.uniform(2, 20))
    if pd.isna(actual_hours):
        actual_hours = round(np.random.uniform(2, 20), 1)

    new_confs.append({
        "confirmation_number": f"TC-{max_conf_num:07d}",
        "order_number": order_num,
        "operation": np.random.choice([10, 20, 30, 40, 50]),
        "sap_func_loc": order_row.get("sap_func_loc", lookup_fl.get(tag, "")),
        "sap_func_loc_short": tag,
        "equipment_name": order_row.get("equipment_name", lookup_name.get(tag, "")),
        "work_center": order_row.get("work_center", np.random.choice(work_centers)),
        "employee_id": np.random.choice(employee_ids),
        "conf_date": conf_date,
        "actual_hours": round(float(actual_hours), 1),
        "activity_type": np.random.choice(["PMWO", "PMPM", "PMCM"]),
        "final_confirmation": "X",
    })

# Add partial confirmations for INICIADA orders
iniciada_orders = df06[df06["status"] == "INICIADA"]["order_number"]
for order_num in iniciada_orders:
    order_row = df06[df06["order_number"] == order_num].iloc[0]
    max_conf_num += 1
    tag = str(order_row.get("sap_func_loc_short", ""))

    conf_date = order_row.get("actual_start", datetime(2026, 4, 1))
    if pd.isna(conf_date):
        conf_date = datetime(2026, 4, 1)

    new_confs.append({
        "confirmation_number": f"TC-{max_conf_num:07d}",
        "order_number": order_num,
        "operation": 10,
        "sap_func_loc": order_row.get("sap_func_loc", lookup_fl.get(tag, "")),
        "sap_func_loc_short": tag,
        "equipment_name": order_row.get("equipment_name", lookup_name.get(tag, "")),
        "work_center": order_row.get("work_center", np.random.choice(work_centers)),
        "employee_id": np.random.choice(employee_ids),
        "conf_date": conf_date,
        "actual_hours": round(np.random.uniform(2, 8), 1),
        "activity_type": "PMWO",
        "final_confirmation": "",  # NOT final — still in progress
    })

df26_new = pd.concat([df26, pd.DataFrame(new_confs)], ignore_index=True)
print(f"  Confirmaciones: {len(df26)} ->{len(df26_new)} (+{len(new_confs)})")
print(f"    CERRADA completadas: {len(cerrada_without_conf)}")
print(f"    INICIADA parciales: {len(iniciada_orders)}")
df26 = df26_new

# ═══════════════════════════════════════════════════════════════════════════
# PASO 4: Enriquecer backlog (23)
# ═══════════════════════════════════════════════════════════════════════════
print("\nPaso 4: Enriqueciendo backlog...")

# Redefine status
status_map_backlog = {"CRTD": "LIBERADA", "PREL": "LIBERADA", "REL": "PLANIFICADA"}
df23["status"] = df23["status"].map(lambda x: status_map_backlog.get(x, x))

# Add waiting_reason based on status
WAITING_LIBERADA = [
    ("ESPERA_REPUESTOS", 0.35, [
        "Rodamiento principal en tránsito, ETA 2 semanas",
        "Sello mecánico agotado en bodega, en proceso de compra",
        "Filtros especiales no disponibles, pedido a proveedor",
        "Acoplamiento flexible en importación, ETA 3 semanas",
        "Kit de reparación pendiente de recepción",
        "Correa de transmisión descontinuada, buscando alternativa",
    ]),
    ("ESPERA_PARADA_MAYOR", 0.25, [
        "Requiere equipo detenido — programar en próxima parada mayor (Mayo 2026)",
        "Intervención requiere parada de línea completa",
        "Solo ejecutable durante shutdown planificado",
        "Requiere vaciado completo del sistema — solo en parada",
        "Necesita parada de 72h mínimo — esperar shutdown",
    ]),
    ("ESPERA_HERRAMIENTA_ESPECIAL", 0.15, [
        "Requiere grúa de 200t — coordinar con contratista",
        "Necesita andamio especial de acceso interior",
        "Requiere equipo de alineación láser (en uso en otra área)",
        "Necesita máquina de soldar orbital — en mantenimiento",
        "Requiere extractora hidráulica de rodamientos — reservada",
    ]),
    ("ESPERA_INGENIERIA", 0.10, [
        "Pendiente cálculo estructural para modificación de base",
        "Requiere diseño de soporte especial — en revisión",
        "Esperando aprobación de cambio de diseño (MOC)",
        "Requiere estudio de vibración antes de intervenir",
    ]),
    ("ESPERA_PRESUPUESTO", 0.10, [
        "Costo estimado supera USD 50,000 — requiere aprobación gerencia",
        "Pendiente aprobación de CAPEX para reemplazo de componente mayor",
        "Esperando reasignación presupuestaria del período",
    ]),
    ("ESPERA_PERMISO", 0.05, [
        "Requiere permiso ambiental para trabajo con sustancias peligrosas",
        "Pendiente autorización de SERNAGEOMIN para trabajo en zona regulada",
        "Requiere permiso especial de trabajo nocturno por restricción comunitaria",
    ]),
]

CONSTRAINT_PLANIFICADA = [
    "Lista para programar — todos los recursos confirmados",
    "Materiales en bodega, cuadrilla disponible — esperando turno",
    "Recursos OK — priorizar según backlog ranking",
    "Bodega confirmó repuestos, supervisor validó herramientas",
]

waiting_reasons = []
constraint_details = []
materials_statuses = []
special_equip_statuses = []

for _, row in df23.iterrows():
    if row["status"] == "LIBERADA":
        # Pick a random waiting reason
        r = np.random.random()
        cumprob = 0
        chosen_reason = "ESPERA_REPUESTOS"
        chosen_detail = ""
        for reason, prob, details in WAITING_LIBERADA:
            cumprob += prob
            if r <= cumprob:
                chosen_reason = reason
                chosen_detail = np.random.choice(details)
                break

        waiting_reasons.append(chosen_reason)
        constraint_details.append(chosen_detail)

        if chosen_reason == "ESPERA_REPUESTOS":
            materials_statuses.append(np.random.choice(["PENDIENTE", "PARCIAL"]))
        else:
            materials_statuses.append("PENDIENTE" if np.random.random() < 0.3 else "CONFIRMADO")

        if chosen_reason == "ESPERA_HERRAMIENTA_ESPECIAL":
            special_equip_statuses.append("PENDIENTE")
        else:
            special_equip_statuses.append(np.random.choice(["CONFIRMADO", "NO_REQUIERE", "PENDIENTE"], p=[0.3, 0.5, 0.2]))

    else:  # PLANIFICADA
        waiting_reasons.append("SIN_RESTRICCION")
        constraint_details.append(np.random.choice(CONSTRAINT_PLANIFICADA))
        materials_statuses.append("CONFIRMADO")
        special_equip_statuses.append(np.random.choice(["CONFIRMADO", "NO_REQUIERE"], p=[0.4, 0.6]))

df23["waiting_reason"] = waiting_reasons
df23["constraint_detail"] = constraint_details
df23["materials_status"] = materials_statuses
df23["special_equipment_status"] = special_equip_statuses

# Add notification_number for corrective orders in backlog
notif_counter_bl = notif_counter
for idx, row in df23.iterrows():
    if row["order_type"] == "PM01":
        notif_counter_bl += 1
        df23.at[idx, "notification_number"] = notif_counter_bl
    else:
        df23.at[idx, "notification_number"] = ""

backlog_status = df23["status"].value_counts()
backlog_waiting = df23["waiting_reason"].value_counts()
print(f"  Backlog status: {dict(backlog_status)}")
print(f"  Waiting reasons: {dict(backlog_waiting)}")

# ═══════════════════════════════════════════════════════════════════════════
# PASO 5: Fix orphan material movements (27)
# ═══════════════════════════════════════════════════════════════════════════
print("\nPaso 5: Corrigiendo material movements huérfanos...")

valid_orders_06 = set(df06[df06["status"] == "CERRADA"]["order_number"])
valid_orders_list = list(valid_orders_06)

orphan_mask = ~df27["order_number"].isin(valid_orders_06)
n_orphans_27 = orphan_mask.sum()
df27.loc[orphan_mask, "order_number"] = np.random.choice(valid_orders_list, size=n_orphans_27)
print(f"  {n_orphans_27} material movements corregidos")

# ═══════════════════════════════════════════════════════════════════════════
# PASO 6: Fix orphan cost records (29)
# ═══════════════════════════════════════════════════════════════════════════
print("\nPaso 6: Corrigiendo cost history huérfanos...")

orphan_mask_29 = ~df29["order_number"].isin(valid_orders_06)
n_orphans_29 = orphan_mask_29.sum()
df29.loc[orphan_mask_29, "order_number"] = np.random.choice(valid_orders_list, size=n_orphans_29)
print(f"  {n_orphans_29} cost records corregidos")

# ═══════════════════════════════════════════════════════════════════════════
# PASO 7: Fix 31, 34, 40 (order 500000 + status)
# ═══════════════════════════════════════════════════════════════════════════
print("\nPaso 7: Corrigiendo referencias en 31, 34, 40...")

# Fix order 500000 ->500001
for df, name in [(df31, "31"), (df34, "34"), (df40, "40")]:
    col = "order_number" if "order_number" in df.columns else "related_order"
    mask = df[col].astype(str).str.strip() == "500000"
    n_fixed = mask.sum()
    if n_fixed > 0:
        df.loc[mask, col] = "500001"
        print(f"  {name}: {n_fixed} refs a 500000 corregidas ->500001")

# Add INICIADA status to week 1 orders in 31
week1_mask = df31["schedule_week"] == "Semana 1"
week1_orders = df31[week1_mask]["order_number"].unique()
# ~30% of week 1 orders already started
started_orders = np.random.choice(week1_orders, size=int(len(week1_orders) * 0.3), replace=False)
for order in started_orders:
    df31.loc[(df31["order_number"] == order), "status"] = "INICIADA"

print(f"  31: {len(started_orders)} OTs de Semana 1 marcadas como INICIADA")

# ═══════════════════════════════════════════════════════════════════════════
# PASO 8: Guardar todo
# ═══════════════════════════════════════════════════════════════════════════
print("\nPaso 8: Guardando archivos...")

saves = [
    (df06, "06_work_order_history.xlsx"),
    (df23, "23_active_backlog.xlsx"),
    (df24, "24_notifications.xlsx"),
    (df26, "26_time_confirmations.xlsx"),
    (df27, "27_material_movements.xlsx"),
    (df29, "29_cost_history.xlsx"),
    (df31, "31_maintenance_schedule_3w.xlsx"),
    (df34, "34_permits_to_work.xlsx"),
    (df40, "40_daily_log.xlsx"),
]

for df, fname in saves:
    fpath = os.path.join(BASE, fname)
    df.to_excel(fpath, index=False, engine="openpyxl")
    print(f"  OK {fname} ({len(df)} rows)")

# ═══════════════════════════════════════════════════════════════════════════
# PASO 9: Validación cross-table
# ═══════════════════════════════════════════════════════════════════════════
print("\n" + "=" * 70)
print("VALIDACIÓN CROSS-TABLE")
print("=" * 70)

# Reload for validation
cerrada = set(df06[df06["status"] == "CERRADA"]["order_number"])
iniciada = set(df06[df06["status"] == "INICIADA"]["order_number"])
pm01_all = df06[df06["order_type"] == "PM01"]

# Check 1: All CERRADA have time confirmations
orders_with_conf = set(df26["order_number"].unique())
cerrada_no_conf = cerrada - orders_with_conf
print(f"\n1. CERRADA sin time confirmation: {len(cerrada_no_conf)} (debe ser 0)")

# Check 2: All PM01 have notifications
pm01_no_notif = pm01_all[pm01_all["notification_number"].isna() | (pm01_all["notification_number"] == "")]
print(f"2. PM01 sin notification: {len(pm01_no_notif)} (debe ser 0)")

# Check 3: All orders in 27 exist in 06
orders_27 = set(df27["order_number"].unique())
orphan_27 = orders_27 - set(df06["order_number"])
print(f"3. Material movements huérfanos: {len(orphan_27)} (debe ser 0)")

# Check 4: All orders in 29 exist in 06
orders_29 = set(df29["order_number"].unique())
orphan_29 = orders_29 - set(df06["order_number"])
print(f"4. Cost records huérfanos: {len(orphan_29)} (debe ser 0)")

# Check 5: OTs in every status
print(f"\n5. Distribución de status en 06:")
for st in ["CREADA", "LIBERADA", "PLANIFICADA", "EN_PROGRAMACION", "PROGRAMADA", "INICIADA", "CERRADA"]:
    count = len(df06[df06["status"] == st])
    print(f"   {st}: {count}")

# Check 6: NOTI notifications (no order)
noti_notifs = df24[(df24["order_number"].isna()) | (df24["order_number"] == "")]
print(f"\n6. Notificaciones NOTI (sin OT): {len(noti_notifs)} (debe ser ~200)")

# Check 7: INICIADA with partial confirmations
iniciada_with_conf = iniciada & orders_with_conf
print(f"7. INICIADA con confirmación parcial: {len(iniciada_with_conf)} (debe ser ~150)")

# Check 8: Backlog distribution
print(f"\n8. Backlog (23) por status:")
for st in df23["status"].value_counts().items():
    print(f"   {st[0]}: {st[1]}")
print(f"   Waiting reasons:")
for wr in df23["waiting_reason"].value_counts().items():
    print(f"     {wr[0]}: {wr[1]}")

# Check 9: No order 500000
all_orders = set()
for df in [df31, df34]:
    if "order_number" in df.columns:
        all_orders.update(df["order_number"].dropna().astype(str).unique())
if "related_order" in df40.columns:
    all_orders.update(df40["related_order"].dropna().astype(str).unique())
has_500000 = "500000" in all_orders
print(f"\n9. Order 500000 presente: {has_500000} (debe ser False)")

print("\n" + "=" * 70)
print("CONSISTENCIA COMPLETADA")
print("=" * 70)
