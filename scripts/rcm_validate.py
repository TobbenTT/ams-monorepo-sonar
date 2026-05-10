"""
rcm_validate.py
===============
Deterministic validation module for the maintenance strategy table
(14_maintenance_strategy_construction.xlsx).

Each check is named V<N> and classified as ERROR (blocking) or WARNING (informational).
Run with:
    validator = StrategyValidator(df_strat)
    errors, warnings = validator.run_all()
"""
import pandas as pd
import re

from rcm_rules import (
    VIBRATION_EXCLUDED_MI_KEYWORDS,
    VIBRATION_EQUIP_KEYWORDS,
    HIDDEN_KEYWORDS,
    TECHNIQUE_APPLICABILITY,
    detect_cbm_technique,
    classify_subsystem,
)

# ─── Validation-specific constants ────────────────────────────────────────────

# V2: Vibration must target equipment-level components, NOT sub-components
VIBRATION_SUBCOMPONENT_KEYWORDS = [
    "rodamientos", "eje", "impulsor", "poleas", "descansos",
    "acoplamiento", "tambor",
]

# V3: MPI only on structural / shaft components
MPI_VALID_MI_KEYWORDS = [
    "eje", "estructura", "viga", "columna", "bastidor",
    "chasis", "soldadura", "tambor",
]

# V4: Torque only on bolted joints
TORQUE_VALID_MI_KEYWORDS = [
    "perno", "brida", "acoplamiento", "union", "unión", "conexion",
    "conexión", "tuerca", "tornillo", "espárrago", "esparrago",
    "sujetador", "fijacion", "fijación",
]

# V5: UT thickness only on pressure-containing / wear components
ESPESOR_VALID_MI_KEYWORDS = [
    "tuberia", "tubería", "cañeria", "cañería",
    "carcaza", "carcasa", "cuerpo", "camisa", "tambor",
    "vasija", "tanque", "deposito", "depósito",
    "chute", "tolva", "impulsor", "impeller", "voluta",
]


class StrategyValidator:
    """Validate a maintenance strategy DataFrame against RCM rules.

    Parameters
    ----------
    df_strat : pd.DataFrame
        The strategy table (output of build_maintenance_strategy_construction).
    df01 : pd.DataFrame, optional
        Equipment hierarchy (01_equipment_hierarchy.xlsx).
    df03 : pd.DataFrame, optional
        Failure modes (03_failure_modes.xlsx).
    """

    def __init__(self, df_strat, df01=None, df03=None):
        self.df = df_strat.copy()
        self.df01 = df01
        self.df03 = df03
        self.errors: list[str] = []
        self.warnings: list[str] = []

    # ══════════════════════════════════════════════════════════════════════
    # TECHNIQUE CHECKS (ERROR)
    # ══════════════════════════════════════════════════════════════════════

    def check_vibration_only_rotatives(self):
        """V1 — No vibration task on an MI that is in VIBRATION_EXCLUDED_MI_KEYWORDS."""
        mask = self.df["primary_task_name"].fillna("").str.lower().str.contains("vibracion", na=False)
        for idx, row in self.df[mask].iterrows():
            mi = str(row.get("maintainable_item", "")).lower()
            for kw in VIBRATION_EXCLUDED_MI_KEYWORDS:
                if kw in mi:
                    self.errors.append(
                        f"V1 row {idx}: Vibration task on non-rotative MI "
                        f"'{row.get('maintainable_item')}' (matched '{kw}')"
                    )
                    break

    def check_vibration_at_mi_level(self):
        """V2 — Vibration task names must reference the specific MI measurement point.

        Vibration is measured AT the MI (rodamientos, poleas, descansos, motor, eje).
        NEVER at the parent equipment level ("en transportador", "en chancador").
        The MI name IS the measurement point.
        """
        parent_equip_keywords = [
            "transportador", "chancador", "molino", "harnero",
            "espesador", "filtro prensa", "secador",
        ]
        mask = self.df["primary_task_name"].fillna("").str.lower().str.contains("vibracion", na=False)
        for idx, row in self.df[mask].iterrows():
            name = str(row.get("primary_task_name", "")).lower()
            m = re.search(r"vibracion en\s+(.+)", name)
            if not m:
                continue
            target = m.group(1).strip()
            for kw in parent_equip_keywords:
                if target.startswith(kw):
                    self.errors.append(
                        f"V2 row {idx}: Vibration targets parent equipment "
                        f"'{target}' — must target specific MI (rodamientos, poleas, motor, etc.)"
                    )
                    break

    def check_mpi_only_structures(self):
        """V3 — MPI tasks only on structural / shaft components."""
        mask = self.df["primary_task_name"].fillna("").str.lower().str.contains("mpi", na=False)
        for idx, row in self.df[mask].iterrows():
            mi = str(row.get("maintainable_item", "")).lower()
            if not any(kw in mi for kw in MPI_VALID_MI_KEYWORDS):
                self.errors.append(
                    f"V3 row {idx}: MPI task on MI '{row.get('maintainable_item')}' "
                    f"— only valid on {MPI_VALID_MI_KEYWORDS}"
                )

    def check_torque_only_bolted(self):
        """V4 — Torque tasks only on bolted-joint components."""
        torque_excluded = ["soldad", "soldadura"]
        mask = self.df["primary_task_name"].fillna("").str.lower().str.contains("torque", na=False)
        for idx, row in self.df[mask].iterrows():
            mi = str(row.get("maintainable_item", "")).lower()
            if any(ex in mi for ex in torque_excluded):
                self.errors.append(
                    f"V4 row {idx}: Torque task on welded joint '{row.get('maintainable_item')}' "
                    f"— torque only applies to bolted connections"
                )
            elif not any(kw in mi for kw in TORQUE_VALID_MI_KEYWORDS):
                self.errors.append(
                    f"V4 row {idx}: Torque task on MI '{row.get('maintainable_item')}' "
                    f"— only valid on bolted connections"
                )

    def check_espesor_only_pressure(self):
        """V5 — UT thickness tasks only on pressure/wear components."""
        mask = self.df["primary_task_name"].fillna("").str.lower().str.contains(
            r"espesor|ultrasonido", na=False, regex=True
        )
        for idx, row in self.df[mask].iterrows():
            mi = str(row.get("maintainable_item", "")).lower()
            if not any(kw in mi for kw in ESPESOR_VALID_MI_KEYWORDS):
                self.errors.append(
                    f"V5 row {idx}: UT thickness task on MI '{row.get('maintainable_item')}' "
                    f"— only valid on {ESPESOR_VALID_MI_KEYWORDS}"
                )

    # ══════════════════════════════════════════════════════════════════════
    # NAMING CHECKS (ERROR)
    # ══════════════════════════════════════════════════════════════════════

    def check_names_complete(self):
        """V8 — No primary_task_name ends with '...' after 'por '."""
        mask = self.df["primary_task_name"].notna()
        for idx, row in self.df[mask].iterrows():
            name = str(row["primary_task_name"])
            if "por " in name and name.rstrip().endswith("..."):
                self.errors.append(
                    f"V8 row {idx}: Task name truncated (mechanism cut off): "
                    f"'{name}'"
                )

    def check_mi_lowercase(self):
        """V9 — After the verb, MI text must be lowercase (not start with uppercase).

        Only the first word of the task (the verb) is capitalized.
        Exception: SAP tags like [1210PU0001] and technique keywords.
        """
        skip_words = {
            "de", "en", "por", "del", "la", "el", "los", "las", "a",
            "analisis", "vibracion", "torque", "pernos",
            "funcionamiento", "inspeccion", "termografia",
            "espesor", "ultrasonido", "integridad",
            "resistencia", "aislamiento", "calibracion",
            "tiempo", "respuesta", "presion", "diferencial",
            "cable", "acero", "corriente", "dureza", "mpi",
        }
        mask = self.df["primary_task_name"].notna()
        for idx, row in self.df[mask].iterrows():
            name = str(row["primary_task_name"])
            words = name.split()
            if len(words) < 2:
                continue
            # Check words after the verb for uppercase MI names
            for w in words[1:]:
                if w.lower() in skip_words:
                    continue
                if w.startswith("["):
                    break  # SAP tag — stop checking
                if len(w) <= 2:
                    continue
                if w[0].isupper() and w.isalpha():
                    self.errors.append(
                        f"V9 row {idx}: MI word '{w}' starts with uppercase "
                        f"in '{name}' — must be all lowercase"
                    )
                break  # Only check the first MI word

    def check_name_length(self):
        """V10 — All task names <= 72 chars."""
        mask = self.df["primary_task_name"].notna()
        for idx, row in self.df[mask].iterrows():
            name = str(row["primary_task_name"])
            if len(name) > 72:
                self.errors.append(
                    f"V10 row {idx}: Task name too long ({len(name)} chars, max 72): "
                    f"'{name[:50]}...'"
                )

    def check_ffi_has_tag(self):
        """V12 — FFI rows must have '[' in primary_task_name (equipment tag)."""
        mask = (self.df["tactics_type"] == "FAULT_FINDING") & self.df["primary_task_name"].notna()
        for idx, row in self.df[mask].iterrows():
            name = str(row["primary_task_name"])
            if "[" not in name:
                self.errors.append(
                    f"V12 row {idx}: FFI task missing equipment tag []: '{name}'"
                )

    def check_others_no_tag(self):
        """V13 — Non-FFI rows must NOT have '[' in primary_task_name (except secondary)."""
        mask = (
            (self.df["tactics_type"] != "FAULT_FINDING")
            & self.df["primary_task_name"].notna()
        )
        for idx, row in self.df[mask].iterrows():
            name = str(row["primary_task_name"])
            if "[" in name:
                self.errors.append(
                    f"V13 row {idx}: Non-FFI task has equipment tag []: "
                    f"'{name}' (tactics={row['tactics_type']})"
                )

    # ══════════════════════════════════════════════════════════════════════
    # RCM CHECKS (ERROR)
    # ══════════════════════════════════════════════════════════════════════

    def check_hidden_are_ffi(self):
        """V14 — MIs containing a HIDDEN_KEYWORD must have tactics_type == FAULT_FINDING."""
        for idx, row in self.df.iterrows():
            mi = str(row.get("maintainable_item", "")).lower()
            tactics = str(row.get("tactics_type", ""))
            if tactics == "FAULT_FINDING":
                continue
            for kw in HIDDEN_KEYWORDS:
                if kw in mi:
                    self.errors.append(
                        f"V14 row {idx}: MI '{row.get('maintainable_item')}' "
                        f"contains hidden keyword '{kw}' but tactics={tactics} "
                        f"(should be FAULT_FINDING)"
                    )
                    break

    def check_pattern_ef_never_ft(self):
        """V15 — Failure patterns D, E, F must NOT have FIXED_TIME tactics."""
        if "failure_pattern" not in self.df.columns:
            return
        mask = (
            self.df["failure_pattern"].isin(["D", "E", "F"])
            & (self.df["tactics_type"] == "FIXED_TIME")
        )
        for idx, row in self.df[mask].iterrows():
            self.errors.append(
                f"V15 row {idx}: Pattern '{row['failure_pattern']}' with FIXED_TIME "
                f"— age-related renewal not valid for random failure patterns"
            )

    def check_ft_no_budgeted(self):
        """V16 — FIXED_TIME rows must have budgeted_as == None/NaN."""
        mask = self.df["tactics_type"] == "FIXED_TIME"
        for idx, row in self.df[mask].iterrows():
            if not pd.isna(row.get("budgeted_as")) and row.get("budgeted_as") is not None:
                self.errors.append(
                    f"V16 row {idx}: FIXED_TIME row has budgeted_as="
                    f"'{row.get('budgeted_as')}' (should be empty)"
                )

    def check_rtf_no_primary(self):
        """V17 — RUN_TO_FAILURE rows must have primary_task_name == None/NaN."""
        mask = self.df["tactics_type"] == "RUN_TO_FAILURE"
        for idx, row in self.df[mask].iterrows():
            if not pd.isna(row.get("primary_task_name")) and row.get("primary_task_name") is not None:
                self.errors.append(
                    f"V17 row {idx}: RTF row has primary_task_name="
                    f"'{row.get('primary_task_name')}' (should be empty)"
                )

    def check_cb_ffi_have_primary(self):
        """V18 — CONDITION_BASED and FAULT_FINDING rows must have primary_task_name."""
        mask = self.df["tactics_type"].isin(["CONDITION_BASED", "FAULT_FINDING"])
        for idx, row in self.df[mask].iterrows():
            if pd.isna(row.get("primary_task_name")) or row.get("primary_task_name") is None:
                self.errors.append(
                    f"V18 row {idx}: {row['tactics_type']} row missing primary_task_name"
                )

    def check_cb_ffi_have_limits(self):
        """V19 — CONDITION_BASED and FAULT_FINDING rows must have primary_task_acceptable_limits."""
        mask = self.df["tactics_type"].isin(["CONDITION_BASED", "FAULT_FINDING"])
        for idx, row in self.df[mask].iterrows():
            val = row.get("primary_task_acceptable_limits")
            if pd.isna(val) or val is None:
                self.errors.append(
                    f"V19 row {idx}: {row['tactics_type']} row missing "
                    f"primary_task_acceptable_limits"
                )

    def check_cb_ffi_have_comments(self):
        """V20 — CONDITION_BASED and FAULT_FINDING rows must have primary_task_conditional_comments."""
        mask = self.df["tactics_type"].isin(["CONDITION_BASED", "FAULT_FINDING"])
        for idx, row in self.df[mask].iterrows():
            val = row.get("primary_task_conditional_comments")
            if pd.isna(val) or val is None:
                self.errors.append(
                    f"V20 row {idx}: {row['tactics_type']} row missing "
                    f"primary_task_conditional_comments"
                )

    # ══════════════════════════════════════════════════════════════════════
    # DEDUP CHECKS (ERROR)
    # ══════════════════════════════════════════════════════════════════════

    def check_task_id_consistent(self):
        """V21 — Same (task_name, interval, time_units) must share one primary_task_id."""
        mask = self.df["primary_task_name"].notna()
        sub = self.df[mask][
            ["primary_task_name", "primary_task_interval", "time_units", "primary_task_id"]
        ].copy()
        # Use time_units if present, else operational_units
        if "operational_units" in self.df.columns:
            ou = self.df[mask]["operational_units"]
            sub["_units"] = sub["time_units"].fillna(ou)
        else:
            sub["_units"] = sub["time_units"]

        grouped = sub.groupby(["primary_task_name", "primary_task_interval", "_units"])
        for key, grp in grouped:
            ids = grp["primary_task_id"].dropna().unique()
            if len(ids) > 1:
                self.errors.append(
                    f"V21: Task '{key[0]}' interval={key[1]} units={key[2]} "
                    f"has {len(ids)} different task IDs: {list(ids[:5])}"
                )

    def check_freq_per_equipment(self):
        """V22 — Same (func_loc, task_name) must have one interval."""
        mask = self.df["primary_task_name"].notna()
        sub = self.df[mask][
            ["sap_func_loc_short", "primary_task_name", "primary_task_interval"]
        ].copy()
        grouped = sub.groupby(["sap_func_loc_short", "primary_task_name"])
        for key, grp in grouped:
            intervals = grp["primary_task_interval"].dropna().unique()
            if len(intervals) > 1:
                self.errors.append(
                    f"V22: Equipment '{key[0]}' task '{key[1]}' "
                    f"has {len(intervals)} intervals: {list(intervals)}"
                )

    # ══════════════════════════════════════════════════════════════════════
    # DISTRIBUTION CHECKS (WARNING)
    # ══════════════════════════════════════════════════════════════════════

    def check_cb_dominates(self):
        """V23 — CONDITION_BASED should be >= 70% of rows."""
        total = len(self.df)
        if total == 0:
            return
        cb_count = (self.df["tactics_type"] == "CONDITION_BASED").sum()
        pct = cb_count / total * 100
        if pct < 70:
            self.warnings.append(
                f"V23: CONDITION_BASED is {pct:.1f}% ({cb_count}/{total}) "
                f"— expected >= 70%"
            )

    def check_ft_low(self):
        """V24 — FIXED_TIME should be <= 15% of rows."""
        total = len(self.df)
        if total == 0:
            return
        ft_count = (self.df["tactics_type"] == "FIXED_TIME").sum()
        pct = ft_count / total * 100
        if pct > 15:
            self.warnings.append(
                f"V24: FIXED_TIME is {pct:.1f}% ({ft_count}/{total}) "
                f"— expected <= 15%"
            )

    def check_visual_covers_mechanisms(self):
        """V25 — Visual inspection tasks should cover >= 5 distinct mechanisms."""
        mask = self.df["primary_task_name"].fillna("").str.lower().str.contains(
            r"inspeccionar.*por", na=False, regex=True
        )
        if mask.sum() == 0:
            self.warnings.append("V25: No visual inspection tasks found")
            return
        mechanisms = set()
        for _, row in self.df[mask].iterrows():
            name = str(row["primary_task_name"]).lower()
            m = re.search(r"por\s+(.+)", name)
            if m:
                mechanisms.add(m.group(1).strip())
        if len(mechanisms) < 5:
            self.warnings.append(
                f"V25: Visual inspections cover only {len(mechanisms)} "
                f"mechanisms — expected >= 5. Found: {sorted(mechanisms)[:10]}"
            )

    def check_subsystem_diversity(self):
        """V27 — 'Sistema General' should be <= 60% of rows."""
        if "subunit" not in self.df.columns:
            return
        total = len(self.df)
        if total == 0:
            return
        gen_count = (self.df["subunit"] == "Sistema General").sum()
        pct = gen_count / total * 100
        if pct > 60:
            self.warnings.append(
                f"V27: 'Sistema General' is {pct:.1f}% ({gen_count}/{total}) "
                f"— expected <= 60%"
            )

    def check_visual_limits_aligned(self):
        """V28 — Visual inspection limits must be specific to the mechanism, not generic.

        The generic phrase 'sin evidencia visible de deterioro' should never appear
        for visual inspection tasks — each mechanism must have its own limits.
        """
        vis = self.df[self.df["primary_task_name"].fillna("").str.contains(
            r"[Ii]nspeccionar.*por", regex=True
        )]
        generic_phrases = [
            "sin evidencia visible de deterioro, corrosion, picaduras o perdida de material",
            "sin evidencia visible de deterioro o anomalia",
        ]
        for idx, row in vis.iterrows():
            limits = str(row.get("primary_task_acceptable_limits", "")).lower()
            if any(gp in limits for gp in generic_phrases):
                self.errors.append(
                    f"V28 row {idx}: Generic limits on visual task "
                    f"'{row['primary_task_name']}' — limits must be specific "
                    f"to the mechanism being inspected"
                )

    # ══════════════════════════════════════════════════════════════════════
    # RUNNER
    # ══════════════════════════════════════════════════════════════════════

    def run_all(self) -> tuple:
        """Execute all check_* methods and print a summary."""
        checks = [m for m in dir(self) if m.startswith("check_")]
        for check_name in sorted(checks):
            getattr(self, check_name)()

        # Print summary
        print(f"Validation: {len(self.errors)} errors, {len(self.warnings)} warnings")
        if self.errors:
            print("ERRORS (blocking):")
            for e in self.errors[:30]:
                print(f"  ERROR: {e}")
        if self.warnings:
            print("WARNINGS:")
            for w in self.warnings[:20]:
                print(f"  WARN: {w}")
        return self.errors, self.warnings
