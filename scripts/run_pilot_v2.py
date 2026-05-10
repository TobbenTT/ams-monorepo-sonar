"""
run_pilot_v2.py — Generate strategy pilot using v2 failure modes (RCM functional analysis).
"""
import pandas as pd
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from rcm_rules import (
    classify_subsystem, detect_cbm_technique, assign_tactics_type,
    build_cb_task_name, build_ft_task_name, build_ffi_task_name,
    build_secondary_task_name, deduplicate_tasks, format_mi, truncate_task_name,
    get_visual_limits, get_visual_comments, get_ffi_limits, get_criticality_key,
    apply_altitude_factor,
    DETECTION_MAP, MECHANISM_TO_SECONDARY, FT_INTERVALS, FT_VERB,
    FT_TASK_TYPE, BUDGETED_LIFE, SECONDARY_ACCESS_TIME, FFI_COMMENT,
)
from rcm_validate import StrategyValidator

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SEED = os.path.join(BASE, "seed_data")

print("=" * 60)
print("STRATEGY PILOT v2 (RCM Functional Analysis FMs)")
print("=" * 60)

t0 = time.time()
df03 = pd.read_excel(os.path.join(SEED, "03_failure_modes_v2.xlsx"))
df01 = pd.read_excel(os.path.join(SEED, "01_equipment_hierarchy.xlsx"))
print(f"FMs v2: {len(df03)} rows, Hierarchy: {len(df01)} rows ({time.time()-t0:.1f}s)")

equip = df01[df01["equnr"].notna()].copy()
abckz_map = dict(zip(equip["sap_func_loc_short"].astype(str), equip["abckz"].fillna(3)))
equip_name_map = dict(zip(equip["sap_func_loc_short"].astype(str), equip["eqktx"].fillna("")))

# Assign tactics
df03["_crit"] = df03["equipment_tag"].map(lambda t: get_criticality_key(abckz_map.get(str(t), 3)))
df03["equipment_name"] = df03["equipment_tag"].map(lambda t: equip_name_map.get(str(t), ""))

tactics_list = [assign_tactics_type(row, abckz_map) for _, row in df03.iterrows()]
df03["_tactics"] = tactics_list

df03["_technique"] = df03.apply(
    lambda row: detect_cbm_technique(
        row.get("detection_method", ""),
        str(row.get("maintainable_item", "")),
        classify_subsystem(str(row.get("maintainable_item", ""))),
        str(row.get("equipment_name", "")),
        str(row.get("fm_what", ""))
    ), axis=1
)

# Build strategy
results = []
primary_task_library = {}
secondary_task_library = {}
task_counter = 0

for idx, row in df03.iterrows():
    tag = str(row["equipment_tag"])
    mi = str(row["maintainable_item"])
    mechanism = str(row["fm_mechanism"])
    tactics = row["_tactics"]
    technique = row["_technique"]
    crit = row["_crit"]

    strategy_id = f"S-{idx+1:06d}"
    mi_func = str(row.get("maintainable_item_function_description", ""))
    mi_fail = str(row.get("maintainable_item_functional_failure", ""))
    func_and_fail = f"{mi_func} | {mi_fail}" if mi_func and mi_func != "nan" else ""

    p_task_id = p_task_name = p_task_interval = None
    p_op_units = p_time_units = p_limits = p_comment = None
    p_constraint = p_task_type = p_access_time = None
    s_task_id = s_task_name = None
    s_constraint = "OFFLINE"
    s_task_type = s_access_time = s_comments = None
    budgeted_as = budgeted_life = budgeted_life_tu = budgeted_life_ou = None

    if tactics == "CONDITION_BASED":
        if technique and technique in DETECTION_MAP:
            info = DETECTION_MAP[technique]
            p_task_name = build_cb_task_name(technique, mi, tag, mechanism, equip_name_map.get(tag, ""))
            base_interval = info["interval"].get(crit, info["interval"]["B"])
            p_task_interval = apply_altitude_factor(base_interval)
            p_time_units = info["time_units"]
            if technique == "visual":
                p_limits = get_visual_limits(mechanism)
                p_comment = get_visual_comments(mechanism)
            else:
                p_limits = info["limits"]
                p_comment = info["comment"]
            p_constraint = info["constraint"]
            p_task_type = info["task_type"]
            p_access_time = info["access_time"]
        else:
            mech_lower = str(mechanism).lower()
            p_task_name = truncate_task_name(f"Inspeccionar {format_mi(mi)} por {mech_lower}")
            base_interval = {"A": 2, "B": 4, "C": 8}.get(crit, 4)
            p_task_interval = apply_altitude_factor(base_interval)
            p_time_units = "WEEKS"
            p_limits = get_visual_limits(mechanism)
            p_comment = get_visual_comments(mechanism)
            p_constraint = "ONLINE"
            p_task_type = "INSPECT"
            p_access_time = 0

        p_key = (p_task_name, p_task_interval, p_time_units or p_op_units)
        if p_key in primary_task_library:
            p_task_id = primary_task_library[p_key]
        else:
            task_counter += 1
            p_task_id = f"T-{task_counter:06d}"
            primary_task_library[p_key] = p_task_id

        s_task_name = build_secondary_task_name(mechanism, mi, tag)
        _, s_task_type = MECHANISM_TO_SECONDARY.get(mechanism, ("Reemplazar", "REPLACE"))
        s_access_time = SECONDARY_ACCESS_TIME.get(mechanism, 4)
        s_key = (s_task_name, s_task_type)
        if s_key in secondary_task_library:
            s_task_id = secondary_task_library[s_key]
        else:
            task_counter += 1
            s_task_id = f"T-{task_counter:06d}"
            secondary_task_library[s_key] = s_task_id
        budgeted_as = s_task_type
        budgeted_life = BUDGETED_LIFE.get(mechanism, 3)
        budgeted_life_tu = "YEARS"

    elif tactics == "FIXED_TIME":
        p_task_name = build_ft_task_name(mechanism, mi, tag)
        ft_info = FT_INTERVALS.get(mechanism, {"unit": "WEEKS", "A": 13, "B": 26, "C": 52})
        base_interval = ft_info.get(crit, ft_info["B"])
        p_task_interval = apply_altitude_factor(base_interval)
        if ft_info["unit"] == "OPERATING_HOURS":
            p_op_units = "OPERATING_HOURS"
        else:
            p_time_units = "WEEKS"
        p_constraint = "OFFLINE"
        verb = FT_VERB.get(mechanism, "Reemplazar")
        p_task_type = FT_TASK_TYPE.get(verb, "REPLACE")
        p_access_time = SECONDARY_ACCESS_TIME.get(mechanism, 4)
        p_key = (p_task_name, p_task_interval, p_time_units or p_op_units)
        if p_key in primary_task_library:
            p_task_id = primary_task_library[p_key]
        else:
            task_counter += 1
            p_task_id = f"T-{task_counter:06d}"
            primary_task_library[p_key] = p_task_id

    elif tactics == "FAULT_FINDING":
        p_task_name = build_ffi_task_name(mi, tag)
        base_interval = {"A": 4, "B": 6, "C": 13}.get(crit, 6)
        p_task_interval = apply_altitude_factor(base_interval)
        p_time_units = "WEEKS"
        p_limits = get_ffi_limits(mi)
        p_comment = FFI_COMMENT
        p_constraint = "TEST_MODE"
        p_task_type = "TEST"
        p_access_time = 0.5
        p_key = (p_task_name, p_task_interval, p_time_units)
        if p_key in primary_task_library:
            p_task_id = primary_task_library[p_key]
        else:
            task_counter += 1
            p_task_id = f"T-{task_counter:06d}"
            primary_task_library[p_key] = p_task_id

        s_task_name = build_secondary_task_name(mechanism, mi, tag)
        _, s_task_type = MECHANISM_TO_SECONDARY.get(mechanism, ("Reemplazar", "REPLACE"))
        s_access_time = SECONDARY_ACCESS_TIME.get(mechanism, 4)
        s_key = (s_task_name, s_task_type)
        if s_key in secondary_task_library:
            s_task_id = secondary_task_library[s_key]
        else:
            task_counter += 1
            s_task_id = f"T-{task_counter:06d}"
            secondary_task_library[s_key] = s_task_id
        budgeted_as = s_task_type
        budgeted_life = BUDGETED_LIFE.get(mechanism, 3)
        budgeted_life_tu = "YEARS"

    elif tactics == "RUN_TO_FAILURE":
        s_task_name = build_secondary_task_name(mechanism, mi, tag)
        _, s_task_type = MECHANISM_TO_SECONDARY.get(mechanism, ("Reemplazar", "REPLACE"))
        s_access_time = SECONDARY_ACCESS_TIME.get(mechanism, 4)
        s_key = (s_task_name, s_task_type)
        if s_key in secondary_task_library:
            s_task_id = secondary_task_library[s_key]
        else:
            task_counter += 1
            s_task_id = f"T-{task_counter:06d}"
            secondary_task_library[s_key] = s_task_id
        budgeted_as = s_task_type
        budgeted_life = BUDGETED_LIFE.get(mechanism, 3)
        budgeted_life_tu = "YEARS"

    subsystem = classify_subsystem(mi)
    results.append({
        "strategy_id": strategy_id, "sap_func_loc_short": tag,
        "equipment_name": equip_name_map.get(tag, ""), "subunit": subsystem,
        "maintainable_item": mi, "partes_falla": row.get("partes_falla", ""),
        "sintomas_falla": row.get("sintomas_falla", ""),
        "causas_falla": row.get("causas_falla", ""),
        "function_and_failure": func_and_fail,
        "what": row.get("fm_what", ""), "mechanism": mechanism,
        "cause": row.get("fm_cause", ""), "status": "RECOMMENDED",
        "tactics_type": tactics, "primary_task_id": p_task_id,
        "primary_task_name": p_task_name, "primary_task_interval": p_task_interval,
        "operational_units": p_op_units, "time_units": p_time_units,
        "primary_task_acceptable_limits": p_limits,
        "primary_task_conditional_comments": p_comment,
        "primary_task_constraint": p_constraint, "primary_task_task_type": p_task_type,
        "primary_task_access_time": p_access_time, "secondary_task_id": s_task_id,
        "secondary_task_name": s_task_name,
        "secondary_task_constraint": s_constraint if s_task_name else None,
        "secondary_task_task_type": s_task_type,
        "secondary_task_access_time": s_access_time,
        "secondary_task_comments": s_comments,
        "budgeted_as": budgeted_as, "budgeted_life": budgeted_life,
        "budgeted_life_time_units": budgeted_life_tu,
        "budgeted_life_operational_units": budgeted_life_ou,
        "existing_task": None, "justification_category": None,
        "justification": None, "notes": None,
    })

df_strat = pd.DataFrame(results)
df_strat = deduplicate_tasks(df_strat)

# Validate
print("\n" + "=" * 60)
print("VALIDATION GATE")
print("=" * 60)
validator = StrategyValidator(df_strat, df01)
errors, warnings = validator.run_all()

if errors:
    print(f"\nBLOQUEADO: {len(errors)} errores")
    sys.exit(1)

# Save
out = os.path.join(SEED, "14_pilot_v2_bomba_correa.xlsx")
df_strat.to_excel(out, index=False, engine="openpyxl", sheet_name="Pilot_v2")
print(f"\nGuardado: {out} ({len(df_strat)} filas)")

# Per-equipment summary
# Per-area summary
for area_prefix, area_name in [("2110", "Chancado Primario"), ("3110", "Molienda SAG")]:
    area_df = df_strat[df_strat["sap_func_loc_short"].str.startswith(area_prefix, na=False)]
    if len(area_df) == 0:
        continue
    tags_in_area = area_df["sap_func_loc_short"].nunique()
    print(f"\n{'='*60}")
    print(f"AREA {area_prefix} - {area_name} ({tags_in_area} equipos, {len(area_df)} filas)")
    print(f"{'='*60}")
    dist = area_df["tactics_type"].value_counts()
    for tt, cnt in dist.items():
        print(f"  {tt}: {cnt} ({100*cnt/len(area_df):.1f}%)")

    # Show key equipment
    for tag in ["2110CV0001", "3110PU0061"]:
        sub = area_df[area_df["sap_func_loc_short"] == tag]
        if len(sub) == 0:
            continue
        name = equip_name_map.get(tag, "")
        print(f"\n  {tag} - {name} ({len(sub)} filas)")
        vib = sub[sub["primary_task_name"].str.contains("vibracion", case=False, na=False)]
        if len(vib) > 0:
            print(f"    Vibracion: {', '.join(sorted(vib['maintainable_item'].unique()))}")

    # Show instrumentation count
    instr_keywords = ["switch", "transmisor", "sensor", "indicador", "pull cord",
                      "baliza", "sirena", "detector"]
    instr = area_df[area_df["equipment_name"].str.lower().str.contains(
        "|".join(instr_keywords), na=False)]
    instr_tags = instr["sap_func_loc_short"].nunique()
    print(f"\n  Instrumentacion: {instr_tags} equipos, {len(instr)} FMs")

# Mechanisms covered
print(f"\n{'='*50}")
print(f"MECANISMOS CUBIERTOS")
print(f"{'='*50}")
mech_dist = df_strat["mechanism"].value_counts()
for m, c in mech_dist.items():
    print(f"  {c:4d}  {m}")

print(f"\nTotal: {len(df_strat)} filas, {task_counter} task IDs unicos")
print(f"Altitude factor applied: 0.75x")
