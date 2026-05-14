"""
build_maintenance_strategy_construction.py
==========================================
Orquestador del harness de estrategia de mantenimiento.
Importa reglas de rcm_rules.py y valida con rcm_validate.py.

Fases:
  0. Auto-generar FMs faltantes
  1-2. Construir tabla de estrategia (assign tactics, build tasks)
  3. Deduplicar tasks
  4. Validar (gate: si hay errores, no genera output)
  5. Escribir Excel

Uso:
  python build_maintenance_strategy_construction.py          # Full (172K filas)
  python build_maintenance_strategy_construction.py --pilot  # Solo bomba + correa
"""
import pandas as pd
import numpy as np
import os
import sys
import time

from rcm_rules import (
    # Constants
    DETECTION_MAP, MECHANISM_TO_SECONDARY, FT_INTERVALS, FT_VERB,
    FT_TASK_TYPE, BUDGETED_LIFE, SECONDARY_ACCESS_TIME,
    FFI_COMMENT, NEW_FM_TEMPLATES,
    # Functions
    classify_subsystem, detect_cbm_technique, assign_tactics_type,
    build_cb_task_name, build_ft_task_name, build_ffi_task_name,
    build_secondary_task_name, deduplicate_tasks,
    get_criticality_key, get_ffi_limits, format_mi, truncate_task_name,
    get_visual_limits, get_visual_comments,
)
from rcm_validate import StrategyValidator

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SEED = os.path.join(BASE, "data", "seeds")
np.random.seed(42)


# ═══════════════════════════════════════════════════════════════════════════
# PHASE 0: AUTO-GENERATE MISSING FMs
# ═══════════════════════════════════════════════════════════════════════════

def phase0_generate_missing_fms(df03, df01):
    """Identify and generate missing failure modes for equipment in 03."""
    print("\n" + "=" * 70)
    print("FASE 0: Auto-generacion de modos de falla faltantes")
    print("=" * 70)

    existing_mechanisms = set(df03["fm_mechanism"].dropna().unique())
    print(f"Mecanismos existentes en 03: {len(existing_mechanisms)}")
    for m in sorted(existing_mechanisms):
        print(f"  - {m}")

    new_rows = []
    fm_counter = 200000

    for tmpl in NEW_FM_TEMPLATES:
        mechanism = tmpl["mechanism"]
        cause = tmpl["cause"]

        tags_with_mechanism = set(
            df03[df03["fm_mechanism"] == mechanism]["equipment_tag"].unique()
        )

        mi_pattern = "|".join(tmpl["mi_keywords"])
        candidates = df03[
            df03["maintainable_item"].str.lower().str.contains(mi_pattern, na=False)
            & ~df03["equipment_tag"].isin(tags_with_mechanism)
        ]

        candidate_combos = candidates.drop_duplicates(
            subset=["equipment_tag", "subunit", "maintainable_item"]
        )[["equipment_tag", "subunit", "maintainable_item",
           "sap_func_loc", "sap_func_loc_short", "equipment_name", "equnr",
           "area", "equipment_function_description", "equipment_functional_failure",
           "function_type", "failure_type",
           "maintainable_item_function_description", "maintainable_item_functional_failure"]]

        added = 0
        for _, cand in candidate_combos.iterrows():
            fm_counter += 1
            new_rows.append({
                "equipment_tag": cand["equipment_tag"],
                "equnr": cand["equnr"],
                "sap_func_loc": cand["sap_func_loc"],
                "sap_func_loc_short": cand["sap_func_loc_short"],
                "equipment_name": cand["equipment_name"],
                "area": cand.get("area", ""),
                "equipment_function_description": cand["equipment_function_description"],
                "equipment_functional_failure": cand["equipment_functional_failure"],
                "function_type": cand.get("function_type", "PRIMARY"),
                "failure_type": cand.get("failure_type", "PARTIAL"),
                "subunit": cand["subunit"],
                "maintainable_item": cand["maintainable_item"],
                "maintainable_item_function_description": cand["maintainable_item_function_description"],
                "maintainable_item_functional_failure": cand["maintainable_item_functional_failure"],
                "partes_falla": tmpl["partes_falla"],
                "sintomas_falla": tmpl["sintomas_falla"],
                "causas_falla": tmpl["causas_falla"],
                "fm_what": cand["maintainable_item"],
                "fm_mechanism": mechanism,
                "fm_cause": cause,
                "fm_number": f"FM-{fm_counter}",
                "failure_pattern": tmpl["failure_pattern"],
                "failure_consequence": tmpl["failure_consequence"],
                "evidence": tmpl["evidence"],
                "downtime_hours": np.random.choice([0.5, 1, 2, 4, 8]),
                "detection_method": tmpl["detection_method"],
                "rpn_severity": np.random.randint(3, 8),
                "rpn_occurrence": np.random.randint(3, 7),
                "rpn_detection": np.random.randint(3, 7),
                "rpn_total": 0,
            })
            added += 1

        if added > 0:
            print(f"  {mechanism} / {cause}: {added} nuevos FMs generados")

    if not new_rows:
        print("  No se generaron FMs nuevos.")
        return df03

    df_new = pd.DataFrame(new_rows)
    df_new["rpn_total"] = df_new["rpn_severity"] * df_new["rpn_occurrence"] * df_new["rpn_detection"]

    print(f"\nTotal nuevos FMs: {len(df_new)}")
    print(f"Distribucion por mecanismo:")
    print(df_new["fm_mechanism"].value_counts().to_string())

    df03_extended = pd.concat([df03, df_new], ignore_index=True)
    print(f"\n03 original: {len(df03)} rows -> extendido: {len(df03_extended)} rows")

    return df03_extended


# ═══════════════════════════════════════════════════════════════════════════
# PHASE 1-2: BUILD STRATEGY TABLE
# ═══════════════════════════════════════════════════════════════════════════

def build_strategy_table(df03, abckz_map, equip_name_map):
    """Build the 38-column strategy construction table.

    Uses task library for deduplication: identical tasks (same name, interval,
    units) share the same task_id even across different equipment.
    """
    print("\n" + "=" * 70)
    print("FASE 1-2: Construccion de tabla de estrategia")
    print("=" * 70)

    n = len(df03)
    print(f"Procesando {n} modos de falla...")

    df03["_crit"] = df03["equipment_tag"].map(
        lambda t: get_criticality_key(abckz_map.get(str(t), 3))
    )
    df03["equipment_name"] = df03["equipment_tag"].map(
        lambda t: equip_name_map.get(str(t), "")
    )

    print("  Asignando tactics_type...")
    t0 = time.time()
    tactics_list = []
    for _, row in df03.iterrows():
        tactics_list.append(assign_tactics_type(row, abckz_map))
    df03["_tactics"] = tactics_list
    print(f"    Completado en {time.time() - t0:.1f}s")

    df03["_technique"] = df03.apply(
        lambda row: detect_cbm_technique(
            row.get("detection_method", ""),
            str(row.get("maintainable_item", "")),
            classify_subsystem(str(row.get("maintainable_item", ""))),
            str(row.get("equipment_name", "")),
            str(row.get("fm_what", ""))
        ), axis=1
    )

    print("  Generando columnas de estrategia...")
    t0 = time.time()

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

        strategy_id = f"S-{idx + 1:06d}"

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
                p_task_interval = info["interval"].get(crit, info["interval"]["B"])
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
                p_task_interval = {"A": 2, "B": 4, "C": 8}.get(crit, 4)
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
            p_task_interval = ft_info.get(crit, ft_info["B"])
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
            p_task_interval = {"A": 4, "B": 6, "C": 13}.get(crit, 6)
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
            "strategy_id": strategy_id,
            "sap_func_loc_short": tag,
            "equipment_name": equip_name_map.get(tag, ""),
            "subunit": subsystem,
            "maintainable_item": mi,
            "partes_falla": row.get("partes_falla", ""),
            "sintomas_falla": row.get("sintomas_falla", ""),
            "causas_falla": row.get("causas_falla", ""),
            "function_and_failure": func_and_fail,
            "what": row.get("fm_what", ""),
            "mechanism": mechanism,
            "cause": row.get("fm_cause", ""),
            "status": "RECOMMENDED",
            "tactics_type": tactics,
            "primary_task_id": p_task_id,
            "primary_task_name": p_task_name,
            "primary_task_interval": p_task_interval,
            "operational_units": p_op_units,
            "time_units": p_time_units,
            "primary_task_acceptable_limits": p_limits,
            "primary_task_conditional_comments": p_comment,
            "primary_task_constraint": p_constraint,
            "primary_task_task_type": p_task_type,
            "primary_task_access_time": p_access_time,
            "secondary_task_id": s_task_id,
            "secondary_task_name": s_task_name,
            "secondary_task_constraint": s_constraint if s_task_name else None,
            "secondary_task_task_type": s_task_type,
            "secondary_task_access_time": s_access_time,
            "secondary_task_comments": s_comments,
            "budgeted_as": budgeted_as,
            "budgeted_life": budgeted_life,
            "budgeted_life_time_units": budgeted_life_tu,
            "budgeted_life_operational_units": budgeted_life_ou,
            "existing_task": None,
            "justification_category": None,
            "justification": None,
            "notes": None,
        })

        if (idx + 1) % 25000 == 0:
            print(f"    {idx + 1}/{n} filas procesadas...")

    print(f"    {n}/{n} filas procesadas en {time.time() - t0:.1f}s")
    print(f"    Task IDs unicos: {task_counter} (primary: {len(primary_task_library)}, secondary: {len(secondary_task_library)})")

    return pd.DataFrame(results)


# ═══════════════════════════════════════════════════════════════════════════
# PILOT MODE
# ═══════════════════════════════════════════════════════════════════════════

def run_pilot(df03, abckz_map, equip_name_map, df01):
    """Run pilot on 1 pump + 1 conveyor for user review before full execution."""
    print("\n" + "=" * 70)
    print("FASE PILOTO: Bomba + Correa Transportadora")
    print("=" * 70)

    pilot_tags = ["3110PU0061", "2110CV0001"]
    pilot_names = {
        "3110PU0061": "Bomba alimentacion hidrociclon (Crit B)",
        "2110CV0001": "Correa descarga Chancador (Crit A)",
    }

    df_pilot = df03[df03["equipment_tag"].isin(pilot_tags)].copy()
    print(f"\nEquipos piloto:")
    for tag in pilot_tags:
        sub = df_pilot[df_pilot["equipment_tag"] == tag]
        name = pilot_names.get(tag, "")
        print(f"  {tag} — {name}: {len(sub)} FMs")

    print(f"\nTotal FMs piloto: {len(df_pilot)}")

    df_strat = build_strategy_table(df_pilot, abckz_map, equip_name_map)
    df_strat = deduplicate_tasks(df_strat)

    # Validation gate
    print("\n" + "=" * 70)
    print("FASE 4: VALIDACION (GATE)")
    print("=" * 70)
    validator = StrategyValidator(df_strat, df01)
    errors, warnings = validator.run_all()

    if errors:
        print(f"\nBLOQUEADO: {len(errors)} errores. No se genera output.")
        sys.exit(1)

    # Per-equipment breakdown
    n = len(df_strat)
    for tag in pilot_tags:
        sub = df_strat[df_strat["sap_func_loc_short"] == tag]
        name = pilot_names.get(tag, "")
        print(f"\n{'=' * 50}")
        print(f"{tag} — {name}")
        print(f"{'=' * 50}")
        sub_dist = sub["tactics_type"].value_counts()
        for tt, count in sub_dist.items():
            print(f"  {tt}: {count} ({100.0 * count / len(sub):.1f}%)")
        sub_vib = sub[sub["primary_task_name"].str.contains("vibracion", case=False, na=False)]
        print(f"  Vibracion tasks: {len(sub_vib)}")
        if len(sub_vib) > 0:
            for mi in sorted(sub_vib["maintainable_item"].unique()):
                print(f"    - {mi}")
        p_unique = sub["primary_task_id"].dropna().nunique()
        print(f"  Primary task IDs unicos: {p_unique}")

    out_path = os.path.join(SEED, "14_pilot_bomba_correa.xlsx")
    print(f"\nGuardando piloto en {out_path}...")
    df_strat.to_excel(out_path, index=False, engine="openpyxl", sheet_name="Pilot")
    print(f"  Guardado: {len(df_strat)} filas")

    return df_strat


# ═══════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════

def main(pilot_only=False):
    print("=" * 70)
    print("CONSTRUCCION DE ESTRATEGIA DE MANTENIMIENTO")
    print("Harness: rcm_rules.py + rcm_validate.py + test_rcm_rules.py")
    if pilot_only:
        print(">>> MODO PILOTO: Solo Bomba + Correa <<<")
    print("=" * 70)

    print("\nCargando datos...")
    t0 = time.time()
    df03 = pd.read_excel(os.path.join(SEED, "03_failure_modes.xlsx"))
    df01 = pd.read_excel(os.path.join(SEED, "01_equipment_hierarchy.xlsx"))
    print(f"  03_failure_modes: {len(df03)} rows")
    print(f"  01_equipment_hierarchy: {len(df01)} rows")
    print(f"  Carga en {time.time() - t0:.1f}s")

    equip = df01[df01["equnr"].notna()].copy()
    abckz_map = dict(zip(
        equip["sap_func_loc_short"].astype(str),
        equip["abckz"].fillna(3)
    ))
    equip_name_map = dict(zip(
        equip["sap_func_loc_short"].astype(str),
        equip["eqktx"].fillna("")
    ))

    if pilot_only:
        run_pilot(df03, abckz_map, equip_name_map, df01)
        return

    # Phase 0: Auto-generate missing FMs
    df03_ext = phase0_generate_missing_fms(df03, df01)

    if len(df03_ext) > len(df03):
        print(f"\nGuardando 03_failure_modes.xlsx actualizado ({len(df03_ext)} rows)...")
        df03_ext.to_excel(
            os.path.join(SEED, "03_failure_modes.xlsx"),
            index=False, engine="openpyxl"
        )
        print("  Guardado.")

    # Phase 1-2: Build strategy table
    df_strat = build_strategy_table(df03_ext, abckz_map, equip_name_map)

    # Phase 3: Deduplicate
    df_strat = deduplicate_tasks(df_strat)

    # Phase 4: Validation GATE
    print("\n" + "=" * 70)
    print("FASE 4: VALIDACION (GATE)")
    print("=" * 70)
    validator = StrategyValidator(df_strat, df01)
    errors, warnings = validator.run_all()

    if errors:
        print(f"\nBLOQUEADO: {len(errors)} errores de validacion.")
        print("NO se genera output. Corregir errores primero.")
        sys.exit(1)

    # Phase 5: Write output (only if validation passes)
    print("\n" + "=" * 70)
    print("FASE 5: Escritura del archivo")
    print("=" * 70)
    out_path = os.path.join(SEED, "14_maintenance_strategy_construction.xlsx")
    print(f"Guardando {len(df_strat)} rows en {out_path}...")
    t0 = time.time()
    df_strat.to_excel(out_path, index=False, engine="openpyxl", sheet_name="Strategies")
    print(f"  Guardado en {time.time() - t0:.1f}s")

    # Summary
    print("\n" + "=" * 70)
    print("RESUMEN FINAL")
    print("=" * 70)
    print(f"FMs originales en 03: {len(df03)}")
    print(f"FMs nuevos generados: {len(df03_ext) - len(df03)}")
    print(f"Total FMs procesados: {len(df03_ext)}")
    print(f"Estrategias generadas: {len(df_strat)}")
    print(f"Warnings: {len(warnings)}")
    print(f"\nArchivo: {out_path}")


if __name__ == "__main__":
    pilot = "--pilot" in sys.argv
    main(pilot_only=pilot)
