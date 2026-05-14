"""
enrich_seed_data.py — Parte A
Agrega columna `equipment_name` a todos los archivos seed_data que tienen sap_func_loc_short.
Usa 01_equipment_hierarchy.xlsx como fuente de lookup.
"""
import pandas as pd
import os
import sys

BASE = os.path.dirname(os.path.abspath(__file__))

# ─── Paso 1: Construir lookup ───────────────────────────────────────────────
print("=" * 70)
print("PARTE A: Agregar equipment_name a archivos existentes")
print("=" * 70)

hier = pd.read_excel(os.path.join(BASE, "01_equipment_hierarchy.xlsx"))
# Construir lookup: sap_func_loc_short -> eqktx
# También sap_func_loc -> eqktx para archivos que solo tienen sap_func_loc
lookup_short = hier.dropna(subset=["sap_func_loc_short"]).drop_duplicates(subset="sap_func_loc_short")
lookup_short = dict(zip(lookup_short["sap_func_loc_short"].astype(str), lookup_short["eqktx"]))

lookup_full = hier.dropna(subset=["sap_func_loc"]).drop_duplicates(subset="sap_func_loc")
lookup_full = dict(zip(lookup_full["sap_func_loc"].astype(str), lookup_full["eqktx"]))

print(f"  Lookup construido: {len(lookup_short)} entries (short), {len(lookup_full)} entries (full)")

# ─── Paso 2: Archivos estándar (tienen sap_func_loc_short) ──────────────────
STANDARD_FILES = [
    "02_criticality_assessment.xlsx",
    "04_measurement_points.xlsx",
    "05_work_packages.xlsx",
    "06_work_order_history.xlsx",
    "07_spare_parts_inventory.xlsx",
    "10_field_capture.xlsx",
    "16_route_sheets.xlsx",
    "17_maintenance_plans.xlsx",
    "18_dms_maf_documents.xlsx",
    "19_classification.xlsx",
    "20_financial_assignments.xlsx",
    "23_active_backlog.xlsx",
    "24_notifications.xlsx",
    "25_measurement_documents.xlsx",
    "26_time_confirmations.xlsx",
    "27_material_movements.xlsx",
    "29_cost_history.xlsx",
    "30_reliability_data.xlsx",
]

for fname in STANDARD_FILES:
    fpath = os.path.join(BASE, fname)
    print(f"\n  Procesando {fname}...", end=" ")
    df = pd.read_excel(fpath)

    # Si ya tiene equipment_name, saltar
    if "equipment_name" in df.columns:
        print("YA TIENE equipment_name, saltando.")
        continue

    # Encontrar posición de sap_func_loc_short
    if "sap_func_loc_short" not in df.columns:
        print("NO tiene sap_func_loc_short, saltando.")
        continue

    pos = df.columns.get_loc("sap_func_loc_short") + 1
    equipment_names = df["sap_func_loc_short"].astype(str).map(lookup_short).fillna("")
    df.insert(pos, "equipment_name", equipment_names)

    matched = (equipment_names != "").sum()
    total = len(df)
    print(f"OK — {matched}/{total} matched ({matched/total*100:.1f}%)")

    df.to_excel(fpath, index=False, engine="openpyxl")

# ─── Paso 3: Caso especial — 03_failure_modes.xlsx ──────────────────────────
print(f"\n  Procesando 03_failure_modes.xlsx (caso especial)...", end=" ")
fpath03 = os.path.join(BASE, "03_failure_modes.xlsx")
df03 = pd.read_excel(fpath03)

if "equipment_name" not in df03.columns:
    # equipment_tag equivale a sap_func_loc_short
    sap_fl_pos = df03.columns.get_loc("sap_func_loc") + 1

    # Insertar sap_func_loc_short (= equipment_tag)
    if "sap_func_loc_short" not in df03.columns:
        df03.insert(sap_fl_pos, "sap_func_loc_short", df03["equipment_tag"].astype(str))
        sap_fl_pos += 1  # ahora equipment_name va después

    # Insertar equipment_name
    equipment_names = df03["equipment_tag"].astype(str).map(lookup_short).fillna("")
    df03.insert(sap_fl_pos, "equipment_name", equipment_names)

    matched = (equipment_names != "").sum()
    total = len(df03)
    print(f"OK — {matched}/{total} matched ({matched/total*100:.1f}%)")

    df03.to_excel(fpath03, index=False, engine="openpyxl")
else:
    print("YA TIENE equipment_name, saltando.")

# ─── Paso 4: Caso especial — 28_equipment_bom.xlsx ──────────────────────────
print(f"\n  Procesando 28_equipment_bom.xlsx (caso especial)...", end=" ")
fpath28 = os.path.join(BASE, "28_equipment_bom.xlsx")
df28 = pd.read_excel(fpath28)

if "parent_equipment_name" not in df28.columns:
    # parent_equipment_name después de parent_func_loc_short
    parent_pos = df28.columns.get_loc("parent_func_loc_short") + 1
    parent_names = df28["parent_func_loc_short"].astype(str).map(lookup_short).fillna("")
    df28.insert(parent_pos, "parent_equipment_name", parent_names)

    # component_equipment_name después de component_func_loc_short (posición cambió +1)
    comp_pos = df28.columns.get_loc("component_func_loc_short") + 1
    comp_names = df28["component_func_loc_short"].astype(str).map(lookup_short).fillna("")
    df28.insert(comp_pos, "component_equipment_name", comp_names)

    matched_p = (parent_names != "").sum()
    matched_c = (comp_names != "").sum()
    total = len(df28)
    print(f"OK — parent: {matched_p}/{total}, component: {matched_c}/{total}")

    df28.to_excel(fpath28, index=False, engine="openpyxl")
else:
    print("YA TIENE parent_equipment_name, saltando.")

print("\n" + "=" * 70)
print("PARTE A COMPLETADA")
print("=" * 70)
