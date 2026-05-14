"""
Fix 35_weekly_program.xlsx — agregar order_number y notification_number
Fix 39_execution_checklists.xlsx — agregar sap_func_loc, sap_func_loc_short, equipment_name
"""
import pandas as pd
import numpy as np
import os

BASE = os.path.dirname(os.path.abspath(__file__))
np.random.seed(42)

# ─── Cargar datos fuente ─────────────────────────────────────────────────
hier = pd.read_excel(os.path.join(BASE, "01_equipment_hierarchy.xlsx"))
equip = hier[hier["equnr"].notna()].copy()
equip["sap_func_loc_short"] = equip["sap_func_loc_short"].astype(str)
lookup_name = dict(zip(equip["sap_func_loc_short"], equip["eqktx"]))
lookup_fl = dict(zip(equip["sap_func_loc_short"], equip["sap_func_loc"]))
lookup_eqart = dict(zip(equip["eqart"].dropna(), equip["eqart"].dropna()))

wo_hist = pd.read_excel(os.path.join(BASE, "06_work_order_history.xlsx"))
notifs = pd.read_excel(os.path.join(BASE, "24_notifications.xlsx"))

# ═══════════════════════════════════════════════════════════════════════════
# FIX 39: execution_checklists — agregar equipo
# ═══════════════════════════════════════════════════════════════════════════
print("Fixing 39_execution_checklists.xlsx...")

df39 = pd.read_excel(os.path.join(BASE, "39_execution_checklists.xlsx"))

# Cada checklist_id corresponde a un eqart + maintenance_type
# Asignar equipos reales a cada checklist basado en su eqart
eqart_to_equips = {}
for _, row in equip.iterrows():
    ea = row.get("eqart")
    if pd.notna(ea):
        eqart_to_equips.setdefault(str(ea), []).append({
            "sap_func_loc": str(row["sap_func_loc"]),
            "sap_func_loc_short": str(row["sap_func_loc_short"]),
            "equipment_name": str(row["eqktx"]) if pd.notna(row.get("eqktx")) else "",
            "equnr": str(row["equnr"]) if pd.notna(row.get("equnr")) else "",
        })

# Para cada checklist, asignar un equipo real que tenga ese eqart
# Un checklist aplica a TODOS los equipos de ese eqart, pero para hacer el dataset
# concreto, expandimos: cada checklist_id se duplica para múltiples equipos reales
all_equip_list = list(equip[["sap_func_loc", "sap_func_loc_short", "eqktx", "equnr", "eqart"]].itertuples(index=False))

rows_new = []
for cl_id in df39["checklist_id"].unique():
    cl_rows = df39[df39["checklist_id"] == cl_id]
    eqart_val = cl_rows.iloc[0]["eqart"]

    # Buscar equipos con ese eqart
    matching = eqart_to_equips.get(str(eqart_val), [])

    if not matching:
        # Si no hay match por eqart, asignar equipos aleatorios
        sample_equips = [all_equip_list[i] for i in np.random.choice(len(all_equip_list), size=min(3, len(all_equip_list)), replace=False)]
        matching = [{
            "sap_func_loc": str(e.sap_func_loc),
            "sap_func_loc_short": str(e.sap_func_loc_short),
            "equipment_name": str(e.eqktx) if pd.notna(e.eqktx) else "",
            "equnr": str(e.equnr) if pd.notna(e.equnr) else "",
        } for e in sample_equips]

    # Tomar hasta 3 equipos por checklist para no explotar el tamaño
    selected = [matching[i] for i in np.random.choice(len(matching), size=min(3, len(matching)), replace=False)]

    for eq in selected:
        for _, step_row in cl_rows.iterrows():
            row_dict = step_row.to_dict()
            row_dict["sap_func_loc"] = eq["sap_func_loc"]
            row_dict["sap_func_loc_short"] = eq["sap_func_loc_short"]
            row_dict["equipment_name"] = eq["equipment_name"]
            row_dict["equnr"] = eq["equnr"]
            rows_new.append(row_dict)

df39_new = pd.DataFrame(rows_new)

# Reordenar columnas: checklist_id, eqart, maintenance_type, sap_func_loc, sap_func_loc_short, equipment_name, equnr, luego el resto
cols_front = ["checklist_id", "eqart", "maintenance_type", "sap_func_loc", "sap_func_loc_short",
              "equipment_name", "equnr", "checklist_name"]
cols_rest = [c for c in df39_new.columns if c not in cols_front]
df39_new = df39_new[cols_front + cols_rest]

df39_new.to_excel(os.path.join(BASE, "39_execution_checklists.xlsx"), index=False, engine="openpyxl")
print(f"  OK — {len(df39_new)} rows ({df39_new['checklist_id'].nunique()} checklists x equipos)")

# ═══════════════════════════════════════════════════════════════════════════
# FIX 35: weekly_program — agregar order_number y notification_number
# ═══════════════════════════════════════════════════════════════════════════
print("\nFixing 35_weekly_program.xlsx...")

df35 = pd.read_excel(os.path.join(BASE, "35_weekly_program.xlsx"))

# Expandir: cada fila del programa semanal ahora tiene líneas de detalle con OTs
# Tomar OTs del historial y del schedule_3w
schedule = pd.read_excel(os.path.join(BASE, "31_maintenance_schedule_3w.xlsx"))
ot_list = list(schedule[["order_number", "order_type", "sap_func_loc_short", "equipment_name",
                          "order_description", "source"]].drop_duplicates(subset="order_number").itertuples(index=False))

# Tomar notification_numbers del archivo 24
notif_numbers = list(notifs["notification_number"].unique())

# Agregar columnas order_number, order_description, notification_number a cada fila
order_numbers = []
order_descriptions = []
notification_numbers = []
order_types = []

for _, row in df35.iterrows():
    # Asignar 1 OT relevante basada en work_center y specialty
    n_orders = int(row.get("num_orders_pm", 0)) + int(row.get("num_orders_cm", 0))
    if n_orders > 0:
        ot = ot_list[np.random.randint(0, len(ot_list))]
        order_numbers.append(ot.order_number)
        order_descriptions.append(ot.order_description)
        order_types.append(ot.order_type)
        # ~40% de OTs correctivas vienen de una notificación
        if ot.order_type == "PM01" and np.random.random() < 0.7:
            notification_numbers.append(np.random.choice(notif_numbers))
        elif ot.order_type != "PM01" and np.random.random() < 0.2:
            notification_numbers.append(np.random.choice(notif_numbers))
        else:
            notification_numbers.append("")
    else:
        order_numbers.append("")
        order_descriptions.append("")
        order_types.append("")
        notification_numbers.append("")

df35["order_number"] = order_numbers
df35["order_type"] = order_types
df35["order_description"] = order_descriptions
df35["notification_number"] = notification_numbers

# Reordenar: poner order_number, order_type, order_description, notification_number después de num_orders_cm
cols = list(df35.columns)
# Remover las nuevas columnas de su posición actual
for c in ["order_number", "order_type", "order_description", "notification_number"]:
    cols.remove(c)
# Insertar después de num_orders_cm
insert_pos = cols.index("num_orders_cm") + 1
for i, c in enumerate(["order_number", "order_type", "order_description", "notification_number"]):
    cols.insert(insert_pos + i, c)
df35 = df35[cols]

df35.to_excel(os.path.join(BASE, "35_weekly_program.xlsx"), index=False, engine="openpyxl")
print(f"  OK — {len(df35)} rows, order_number y notification_number agregados")

print("\nDone!")
