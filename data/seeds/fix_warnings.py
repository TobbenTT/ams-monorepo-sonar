"""
fix_warnings.py — Fix 3 warnings from audit
1. INICIADA orders with final_confirmation -> remove final flag
2. Pre-execution orders with confirmations -> remove those confirmations
3. notification_numbers in 06 that don't exist in 24 -> create them in 24
"""
import pandas as pd
import numpy as np
import os
from datetime import datetime, timedelta

BASE = os.path.dirname(os.path.abspath(__file__))
np.random.seed(42)

df06 = pd.read_excel(os.path.join(BASE, "06_work_order_history.xlsx"))
df24 = pd.read_excel(os.path.join(BASE, "24_notifications.xlsx"))
df26 = pd.read_excel(os.path.join(BASE, "26_time_confirmations.xlsx"))

hier = pd.read_excel(os.path.join(BASE, "01_equipment_hierarchy.xlsx"))
equip = hier[hier["equnr"].notna()].copy()
equip["sap_func_loc_short"] = equip["sap_func_loc_short"].astype(str)
lookup_name = dict(zip(equip["sap_func_loc_short"], equip["eqktx"]))
lookup_fl = dict(zip(equip["sap_func_loc_short"], equip["sap_func_loc"]))
workforce = pd.read_excel(os.path.join(BASE, "09_workforce.xlsx"))
workers = list(workforce["name"]) if "name" in workforce.columns else [f"Worker {i}" for i in range(1, 31)]

# ─── Fix 1: INICIADA with final_confirmation ────────────────────────────
print("Fix 1: INICIADA con confirmacion final...")
iniciada_orders = set(df06[df06["status"] == "INICIADA"]["order_number"])
mask_ini_final = (df26["order_number"].isin(iniciada_orders)) & (df26["final_confirmation"] == "X")
n_fixed_1 = mask_ini_final.sum()
df26.loc[mask_ini_final, "final_confirmation"] = ""
print(f"  {n_fixed_1} confirmaciones cambiadas a parcial")

# ─── Fix 2: Pre-execution orders with confirmations ─────────────────────
print("Fix 2: OTs pre-ejecucion con confirmaciones...")
pre_exec_statuses = {"CREADA", "LIBERADA", "PLANIFICADA", "EN_PROGRAMACION", "PROGRAMADA"}
pre_exec_orders = set(df06[df06["status"].isin(pre_exec_statuses)]["order_number"])
mask_pre_exec = df26["order_number"].isin(pre_exec_orders)
n_removed = mask_pre_exec.sum()
df26 = df26[~mask_pre_exec].reset_index(drop=True)
print(f"  {n_removed} confirmaciones eliminadas de OTs pre-ejecucion")

# ─── Fix 3: notification_numbers in 06 not in 24 ────────────────────────
print("Fix 3: Creando notificaciones faltantes en 24...")
notif_nums_in_06 = set()
for v in df06["notification_number"].dropna():
    try:
        notif_nums_in_06.add(int(float(v)))
    except (ValueError, TypeError):
        pass

notif_nums_in_24 = set()
for v in df24["notification_number"].dropna():
    try:
        notif_nums_in_24.add(int(float(v)))
    except (ValueError, TypeError):
        pass

missing_notifs = notif_nums_in_06 - notif_nums_in_24

new_notifs = []
for notif_num in missing_notifs:
    # Find the order that references this notification
    order_rows = df06[df06["notification_number"] == notif_num]
    if len(order_rows) == 0:
        # Try float match
        order_rows = df06[df06["notification_number"].apply(
            lambda x: int(float(x)) == notif_num if pd.notna(x) else False)]
    if len(order_rows) == 0:
        continue

    order_row = order_rows.iloc[0]
    tag = str(order_row.get("sap_func_loc_short", ""))
    status_ot = order_row["status"]

    if status_ot == "CERRADA":
        notif_status = "CERRADO"
    elif status_ot in ["INICIADA", "PROGRAMADA", "EN_PROGRAMACION"]:
        notif_status = "CONVERTIDO_A_OT"
    else:
        notif_status = "CONVERTIDO_A_OT"

    new_notifs.append({
        "notification_number": notif_num,
        "notif_type": np.random.choice(["M1", "M2"]),
        "description": order_row.get("description", f"Aviso para {lookup_name.get(tag, tag)}"),
        "sap_func_loc": order_row.get("sap_func_loc", lookup_fl.get(tag, "")),
        "sap_func_loc_short": tag,
        "equipment_name": order_row.get("equipment_name", lookup_name.get(tag, "")),
        "equnr": order_row.get("equnr", ""),
        "priority": order_row.get("priority", "3-Media"),
        "status": notif_status,
        "creation_date": order_row.get("plan_start", datetime(2025, 1, 1)),
        "malfunction_start": order_row.get("actual_start", pd.NaT),
        "malfunction_end": order_row.get("actual_end", pd.NaT),
        "reported_by": np.random.choice(workers),
        "catalog_profile": np.random.choice(["CP-MECH", "CP-ELEC", "CP-INST", "CP-GEN"]),
        "damage_code": np.random.choice(["FRAC", "VIBR", "FUGA", "CORR", "DESG", "SOBR", "CONT"]),
        "cause_code": np.random.choice(["Desgaste", "Corrosion", "Sobrecarga", "Fatiga", ""]),
        "order_number": order_row["order_number"],
    })

df24 = pd.concat([df24, pd.DataFrame(new_notifs)], ignore_index=True)
print(f"  {len(new_notifs)} notificaciones creadas en 24")

# Save
df24.to_excel(os.path.join(BASE, "24_notifications.xlsx"), index=False, engine="openpyxl")
df26.to_excel(os.path.join(BASE, "26_time_confirmations.xlsx"), index=False, engine="openpyxl")
print(f"\n24: {len(df24)} rows guardadas")
print(f"26: {len(df26)} rows guardadas")
print("\nDone!")
