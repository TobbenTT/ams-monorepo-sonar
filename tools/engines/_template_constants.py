"""Shared constants for AMS Excel templates.

Single source of truth for enum lists, FM combos, strategy rules,
instructions field descriptions, and style constants used by both
``templates/generate_templates.py`` (blank templates) and
``tools/engines/template_population_engine.py`` (populated deliverables).
"""

from __future__ import annotations

# ── Enum Values ───────────────────────────────────────────────────
CRITICALITIES = ["AA", "A+", "A", "B", "C", "D"]
EQUIP_STATUSES = ["ACTIVE", "INACTIVE", "DECOMMISSIONED"]
NODE_TYPES = ["PLANT", "AREA", "SYSTEM", "EQUIPMENT", "SUB_ASSEMBLY", "MAINTAINABLE_ITEM"]
CRIT_CATEGORIES = [
    "SAFETY", "HEALTH", "ENVIRONMENT", "PRODUCTION", "OPERATING_COST",
    "CAPITAL_COST", "SCHEDULE", "REVENUE", "COMMUNICATIONS", "COMPLIANCE", "REPUTATION",
]
CRIT_METHODS = ["FULL_MATRIX", "SIMPLIFIED"]
MECHANISMS = [
    "ARCS", "BLOCKS", "BREAKS_FRACTURE_SEPARATES", "CORRODES", "CRACKS",
    "DEGRADES", "DISTORTS", "DRIFTS", "EXPIRES", "IMMOBILISED", "LOOSES_PRELOAD",
    "OPEN_CIRCUIT", "OVERHEATS_MELTS", "SEVERS", "SHORT_CIRCUITS",
    "THERMALLY_OVERLOADS", "WASHES_OFF", "WEARS",
]
CAUSES = [
    "ABRASION", "AGE", "BREAKDOWN_IN_INSULATION", "BREAKDOWN_OF_LUBRICATION",
    "BIO_ORGANISMS", "CHEMICAL_ATTACK", "CHEMICAL_REACTION", "CONTAMINATION",
    "CORROSIVE_ENVIRONMENT", "CREEP", "CREVICE", "CYCLIC_LOADING",
    "DISSIMILAR_METALS_CONTACT", "ELECTRICAL_ARCING", "ELECTRICAL_OVERLOAD",
    "ENTRAINED_AIR", "EXCESSIVE_FLUID_VELOCITY", "EXCESSIVE_PARTICLE_SIZE",
    "EXCESSIVE_TEMPERATURE", "EXPOSURE_TO_ATMOSPHERE", "EXPOSURE_TO_HIGH_TEMP_CORROSIVE",
    "EXPOSURE_TO_HIGH_TEMP", "EXPOSURE_TO_LIQUID_METAL", "HIGH_TEMP_CORROSIVE",
    "IMPACT_SHOCK_LOADING", "INSUFFICIENT_FLUID_VELOCITY", "LACK_OF_LUBRICATION",
    "LOW_PRESSURE", "LUBRICANT_CONTAMINATION", "MECHANICAL_OVERLOAD",
    "METAL_TO_METAL_CONTACT", "OFF_CENTER_LOADING", "OVERCURRENT",
    "POOR_ELECTRICAL_CONNECTIONS", "POOR_ELECTRICAL_INSULATION", "RADIATION",
    "RELATIVE_MOVEMENT", "RUBBING", "STRAY_CURRENT", "THERMAL_OVERLOAD",
    "THERMAL_STRESSES", "UNEVEN_LOADING", "USE", "VIBRATION",
]
FAILURE_PATTERNS = ["A_BATHTUB", "B_AGE", "C_FATIGUE", "D_STRESS", "E_RANDOM", "F_EARLY_LIFE"]
FAILURE_CONSEQUENCES = [
    "HIDDEN_SAFETY", "HIDDEN_NONSAFETY", "EVIDENT_SAFETY",
    "EVIDENT_ENVIRONMENTAL", "EVIDENT_OPERATIONAL", "EVIDENT_NONOPERATIONAL",
]
STRATEGY_TYPES = ["CONDITION_BASED", "FIXED_TIME", "RUN_TO_FAILURE", "FAULT_FINDING", "REDESIGN", "OEM"]
FAILURE_TYPES = ["TOTAL", "PARTIAL"]
FUNCTION_TYPES = ["PRIMARY", "SECONDARY", "PROTECTIVE"]
TASK_TYPES = ["INSPECT", "CHECK", "TEST", "LUBRICATE", "CLEAN", "REPLACE", "REPAIR", "CALIBRATE"]
TASK_CONSTRAINTS = ["ONLINE", "OFFLINE", "TEST_MODE"]
LABOUR_SPECIALTIES = ["FITTER", "ELECTRICIAN", "INSTRUMENTIST", "OPERATOR", "CONMON_SPECIALIST", "LUBRICATOR"]
UNITS_OF_MEASURE = ["EA", "L", "KG", "M"]
FREQUENCY_UNITS = ["HOURS", "DAYS", "WEEKS", "MONTHS", "YEARS", "HOURS_RUN", "OPERATING_HOURS", "TONNES", "CYCLES"]
BUDGET_TYPES = ["REPAIR", "REPLACE"]
WP_TYPES = ["STANDALONE", "SUPPRESSIVE", "SEQUENTIAL"]
WP_CONSTRAINTS = ["ONLINE", "OFFLINE"]
ORDER_TYPES = ["PM01", "PM02", "PM03"]
PRIORITIES = ["1_EMERGENCY", "2_URGENT", "3_NORMAL", "4_PLANNED"]
WO_STATUSES = ["CREATED", "RELEASED", "IN_PROGRESS", "COMPLETED", "CLOSED", "CANCELLED"]
VED_CLASSES = ["VITAL", "ESSENTIAL", "DESIRABLE"]
FSN_CLASSES = ["FAST_MOVING", "SLOW_MOVING", "NON_MOVING"]
ABC_CLASSES = ["A_HIGH", "B_MEDIUM", "C_LOW"]
SHUTDOWN_TYPES = ["MINOR_8H", "MAJOR_20H_PLUS"]
SHIFT_TYPES = ["MORNING", "AFTERNOON", "NIGHT"]
CAPTURE_TYPES = ["VOICE", "TEXT", "IMAGE", "VOICE+IMAGE"]
LANGUAGES = ["fr", "en", "ar"]
RCA_LEVELS = ["1", "2", "3"]
STRATEGY_STATUSES = ["RECOMMENDED", "REDUNDANT"]
BUDGETED_AS_VALUES = ["NOT_BUDGETED", "REPAIR", "REPLACE"]
BUDGETED_LIFE_UNITS = ["YEARS", "MONTHS", "WEEKS"]
JUSTIFICATION_CATEGORIES = [
    "MODIFIED", "ELIMINATED", "FREQUENCY_CHANGE",
    "TACTIC_CHANGE", "MAINTAINED", "NEW_TASK",
]

# ── 72 Valid FM Combinations ─────────────────────────────────────
FM_COMBOS: list[tuple[str, str]] = [
    ("ARCS", "BREAKDOWN_IN_INSULATION"),
    ("BLOCKS", "CONTAMINATION"), ("BLOCKS", "EXCESSIVE_PARTICLE_SIZE"),
    ("BLOCKS", "INSUFFICIENT_FLUID_VELOCITY"),
    ("BREAKS_FRACTURE_SEPARATES", "CYCLIC_LOADING"),
    ("BREAKS_FRACTURE_SEPARATES", "MECHANICAL_OVERLOAD"),
    ("BREAKS_FRACTURE_SEPARATES", "THERMAL_OVERLOAD"),
    ("CORRODES", "BIO_ORGANISMS"), ("CORRODES", "CHEMICAL_ATTACK"),
    ("CORRODES", "CORROSIVE_ENVIRONMENT"), ("CORRODES", "CREVICE"),
    ("CORRODES", "DISSIMILAR_METALS_CONTACT"), ("CORRODES", "EXPOSURE_TO_ATMOSPHERE"),
    ("CORRODES", "EXPOSURE_TO_HIGH_TEMP_CORROSIVE"), ("CORRODES", "EXPOSURE_TO_HIGH_TEMP"),
    ("CORRODES", "EXPOSURE_TO_LIQUID_METAL"), ("CORRODES", "POOR_ELECTRICAL_CONNECTIONS"),
    ("CORRODES", "POOR_ELECTRICAL_INSULATION"),
    ("CRACKS", "AGE"), ("CRACKS", "CYCLIC_LOADING"),
    ("CRACKS", "EXCESSIVE_TEMPERATURE"), ("CRACKS", "HIGH_TEMP_CORROSIVE"),
    ("CRACKS", "IMPACT_SHOCK_LOADING"), ("CRACKS", "THERMAL_STRESSES"),
    ("DEGRADES", "AGE"), ("DEGRADES", "CHEMICAL_ATTACK"),
    ("DEGRADES", "CHEMICAL_REACTION"), ("DEGRADES", "CONTAMINATION"),
    ("DEGRADES", "ELECTRICAL_ARCING"), ("DEGRADES", "ENTRAINED_AIR"),
    ("DEGRADES", "EXCESSIVE_TEMPERATURE"), ("DEGRADES", "RADIATION"),
    ("DISTORTS", "IMPACT_SHOCK_LOADING"), ("DISTORTS", "MECHANICAL_OVERLOAD"),
    ("DISTORTS", "OFF_CENTER_LOADING"), ("DISTORTS", "USE"),
    ("DRIFTS", "EXCESSIVE_TEMPERATURE"), ("DRIFTS", "IMPACT_SHOCK_LOADING"),
    ("DRIFTS", "STRAY_CURRENT"), ("DRIFTS", "UNEVEN_LOADING"), ("DRIFTS", "USE"),
    ("EXPIRES", "AGE"),
    ("IMMOBILISED", "CONTAMINATION"), ("IMMOBILISED", "LACK_OF_LUBRICATION"),
    ("LOOSES_PRELOAD", "CREEP"), ("LOOSES_PRELOAD", "EXCESSIVE_TEMPERATURE"),
    ("LOOSES_PRELOAD", "VIBRATION"),
    ("OPEN_CIRCUIT", "ELECTRICAL_OVERLOAD"),
    ("OVERHEATS_MELTS", "CONTAMINATION"), ("OVERHEATS_MELTS", "ELECTRICAL_OVERLOAD"),
    ("OVERHEATS_MELTS", "LACK_OF_LUBRICATION"), ("OVERHEATS_MELTS", "MECHANICAL_OVERLOAD"),
    ("OVERHEATS_MELTS", "RELATIVE_MOVEMENT"), ("OVERHEATS_MELTS", "RUBBING"),
    ("SEVERS", "ABRASION"), ("SEVERS", "IMPACT_SHOCK_LOADING"),
    ("SEVERS", "MECHANICAL_OVERLOAD"),
    ("SHORT_CIRCUITS", "BREAKDOWN_IN_INSULATION"), ("SHORT_CIRCUITS", "CONTAMINATION"),
    ("THERMALLY_OVERLOADS", "MECHANICAL_OVERLOAD"), ("THERMALLY_OVERLOADS", "OVERCURRENT"),
    ("WASHES_OFF", "EXCESSIVE_FLUID_VELOCITY"), ("WASHES_OFF", "USE"),
    ("WEARS", "BREAKDOWN_OF_LUBRICATION"), ("WEARS", "ENTRAINED_AIR"),
    ("WEARS", "EXCESSIVE_FLUID_VELOCITY"), ("WEARS", "IMPACT_SHOCK_LOADING"),
    ("WEARS", "LOW_PRESSURE"), ("WEARS", "LUBRICANT_CONTAMINATION"),
    ("WEARS", "MECHANICAL_OVERLOAD"), ("WEARS", "METAL_TO_METAL_CONTACT"),
    ("WEARS", "RELATIVE_MOVEMENT"),
]

# ── Strategy Type Rules ──────────────────────────────────────────
STRATEGY_RULES: list[list[str]] = [
    ["CONDITION_BASED", "YES (inspection/monitoring)", "YES (corrective)",
     "YES", "YES", "Inspect at fixed interval; if limits exceeded → trigger secondary task"],
    ["FIXED_TIME", "YES (replacement/overhaul)", "NO",
     "NO", "YES", "Replace/overhaul at fixed interval regardless of condition"],
    ["RUN_TO_FAILURE", "NO", "YES (corrective)",
     "NO", "NO", "No proactive task; replace on failure (RTF only when cost of prevention > cost of failure)"],
    ["FAULT_FINDING", "YES (functional test)", "YES (corrective)",
     "YES", "YES", "Test hidden function at interval; if test fails → trigger secondary task"],
    ["REDESIGN", "N/A", "N/A",
     "N/A", "N/A", "Engineering change to eliminate failure mode (no tasks)"],
    ["OEM", "Varies", "Varies",
     "Varies", "YES", "OEM-prescribed maintenance plan"],
]

# ── Instructions field descriptions per template ─────────────────
INSTR_01_HIERARCHY: list[tuple[str, str, str, str, str]] = [
    ("plant_id", "Text", "Yes", "e.g. OCP-JFC1", "SAP Plant code identifier"),
    ("plant_name", "Text", "Yes", "Free text", "Full plant name"),
    ("area_code", "Text", "Yes", "3-4 chars, e.g. BRY, FLT", "Area abbreviation code"),
    ("area_name", "Text", "Yes", "Free text", "Full area name (FR/EN)"),
    ("system_code", "Text", "Yes", "3-4 chars, e.g. SAG, BML", "System abbreviation code"),
    ("system_name", "Text", "Yes", "Free text", "Full system name"),
    ("equipment_tag", "Text", "Yes", "Format: AREA-SYS-TYPE-NNN", "Unique equipment tag identifier"),
    ("equipment_description", "Text", "Yes", "Max 80 chars", "Equipment description"),
    ("equipment_type", "Text", "Yes", "e.g. SAG_MILL, SLURRY_PUMP", "Equipment type category"),
    ("manufacturer", "Text", "No", "Free text", "Equipment manufacturer/OEM"),
    ("model", "Text", "No", "Free text", "Equipment model designation"),
    ("serial_number", "Text", "No", "Free text", "Equipment serial number"),
    ("power_kw", "Number", "No", ">=0", "Installed power in kilowatts"),
    ("weight_kg", "Number", "No", ">=0", "Equipment weight in kilograms"),
    ("criticality", "Text", "Yes", ", ".join(CRITICALITIES), "Equipment criticality class"),
    ("status", "Text", "Yes", ", ".join(EQUIP_STATUSES), "Equipment operational status"),
    ("sap_func_loc", "Text", "No", "SAP TPLNR format", "SAP Functional Location code"),
    ("installation_date", "Date", "No", "YYYY-MM-DD", "Installation date"),
]

INSTR_02_CRITICALITY: list[tuple[str, str, str, str, str]] = [
    ("equipment_tag", "Text", "Yes", "Must exist in hierarchy", "Equipment tag from Template 01"),
    ("method", "Text", "Yes", ", ".join(CRIT_METHODS), "Assessment method"),
    *[(cat.lower(), "Integer", "Yes", "1-5", f"{cat} consequence level (1=lowest, 5=highest)") for cat in CRIT_CATEGORIES],
    ("probability", "Integer", "Yes", "1-5", "Failure probability (1=rare, 5=almost certain)"),
]

INSTR_03_FAILURE_MODES: list[tuple[str, str, str, str, str]] = [
    ("equipment_tag", "Text", "Yes", "Must exist in hierarchy", "Equipment tag from Template 01"),
    ("function_description", "Text", "Yes", "Max 200 chars", "Equipment function being analyzed"),
    ("function_type", "Text", "Yes", ", ".join(FUNCTION_TYPES), "Function classification"),
    ("failure_type", "Text", "Yes", ", ".join(FAILURE_TYPES), "Total or partial failure"),
    ("what_component", "Text", "Yes", "Free text", "Component that fails (the 'what')"),
    ("mechanism", "Text", "Yes", "18 valid values (see FM Combinations sheet)", "How it fails"),
    ("cause", "Text", "Yes", "44 valid values (see FM Combinations sheet)", "Root cause of mechanism"),
    ("failure_pattern", "Text", "Yes", ", ".join(FAILURE_PATTERNS), "Nowlan-Heap failure pattern (A-F)"),
    ("failure_consequence", "Text", "Yes", ", ".join(FAILURE_CONSEQUENCES), "RCM consequence classification"),
    ("evidence", "Text", "No", "Free text", "Observable evidence of failure progression"),
    ("downtime_hours", "Number", "No", ">=0", "Expected downtime if failure occurs (hours)"),
    ("detection_method", "Text", "No", "Free text", "How the failure mode is detected"),
    ("rpn_severity", "Integer", "No", "1-10", "FMECA: Severity rating (1=no effect, 10=catastrophic)"),
    ("rpn_occurrence", "Integer", "No", "1-10", "FMECA: Occurrence rating (1=rare, 10=almost certain)"),
    ("rpn_detection", "Integer", "No", "1-10", "FMECA: Detection rating (1=always detected, 10=undetectable)"),
]

INSTR_04_TASKS: list[tuple[str, str, str, str, str]] = [
    ("== TASKS SHEET ==", "", "", "", "Task catalog — one row per maintenance task. Tasks do NOT have frequency (frequency belongs to the maintenance strategy in Template 14)."),
    ("task_id", "Text", "Yes", "Unique, e.g. T-001", "Unique task identifier. Reusable across multiple strategies."),
    ("task_name", "Text", "Yes", "Max 72 chars", "Task name (EN). Format: 'Inspect [MI] for [evidence]', 'Replace [MI]', etc."),
    ("task_name_fr", "Text", "Yes", "Max 72 chars", "Task name in French"),
    ("task_type", "Text", "Yes", ", ".join(TASK_TYPES), "Type of maintenance action"),
    ("constraint", "Text", "Yes", ", ".join(TASK_CONSTRAINTS), "Default execution constraint"),
    ("access_time_hours", "Number", "Yes", ">=0 (0 for ONLINE)", "Equipment access/preparation time in hours"),
    ("budgeted_as", "Text", "No", ", ".join(BUDGETED_AS_VALUES), "For corrective/replacement tasks: REPAIR (sub-component) or REPLACE (entire MI). NOT_BUDGETED for primary inspection tasks."),
    ("budgeted_life", "Number", "No", ">0", "Estimated useful life of the MI (for budgeted tasks)"),
    ("budgeted_life_time_units", "Text", "No", ", ".join(BUDGETED_LIFE_UNITS), "Time units for budgeted life"),
    ("budgeted_life_operational_units", "Text", "No", ", ".join(FREQUENCY_UNITS), "Operational units for budgeted life"),
    ("consequences", "Text", "Yes", "Free text", "What happens if the task is not performed"),
    ("justification", "Text", "No", "Free text", "RCM/engineering justification for the task"),
    ("origin", "Text", "No", "Free text", "Source: OEM, R8_LIBRARY, RCM_ANALYSIS, HISTORICAL_MTBF, WORKSHOP"),
    ("notes", "Text", "No", "Free text", "Additional notes"),
    ("", "", "", "", ""),
    ("== TASK_LABOUR SHEET ==", "", "", "", "One row per specialty per task (linked by task_id)"),
    ("labour_id", "Text", "Yes", "Unique, e.g. LR-001", "Unique labour resource line ID"),
    ("task_id", "Text", "Yes", "Must match Tasks sheet", "Foreign key to Tasks sheet"),
    ("worker_id", "Text", "No", "From Template 09", "Specific worker ID (optional, for named assignments)"),
    ("specialty", "Text", "Yes", ", ".join(LABOUR_SPECIALTIES), "Labour specialty"),
    ("quantity", "Integer", "Yes", ">=1", "Number of workers of this specialty"),
    ("hours_per_person", "Number", "Yes", ">0", "Hours per person for this task"),
    ("hourly_rate_usd", "Number", "No", ">=0", "Hourly labour rate (optional)"),
    ("company", "Text", "No", "Free text", "Company/contractor name (OCP or contractor)"),
    ("", "", "", "", ""),
    ("== TASK_MATERIALS SHEET ==", "", "", "", "One row per material per task (linked by task_id)"),
    ("material_line_id", "Text", "Yes", "Unique, e.g. MR-001", "Unique material resource line ID"),
    ("task_id", "Text", "Yes", "Must match Tasks sheet", "Foreign key to Tasks sheet"),
    ("material_code", "Text", "Yes", "SAP material code", "Links to Template 07 and SAP material master"),
    ("description", "Text", "Yes", "Free text", "Material description"),
    ("manufacturer", "Text", "No", "Free text", "Material manufacturer"),
    ("part_number", "Text", "No", "Manufacturer part #", "Manufacturer part number"),
    ("quantity", "Number", "Yes", ">0", "Quantity needed"),
    ("unit_of_measure", "Text", "Yes", ", ".join(UNITS_OF_MEASURE), "Unit of measure"),
    ("unit_price_usd", "Number", "No", ">=0", "Unit price in USD"),
    ("equipment_bom_ref", "Text", "No", "BOM reference", "SAP Equipment BOM reference"),
    ("", "", "", "", ""),
    ("== TASK_TOOLS SHEET ==", "", "", "", "One row per tool/equipment per task (linked by task_id)"),
    ("tool_line_id", "Text", "Yes", "Unique, e.g. TL-001", "Unique tool/equipment line ID"),
    ("task_id", "Text", "Yes", "Must match Tasks sheet", "Foreign key to Tasks sheet"),
    ("item_type", "Text", "Yes", "TOOL, SPECIAL_EQUIPMENT", "Tool or special equipment"),
    ("tool_code", "Text", "No", "Unique code", "Tool/equipment catalog code"),
    ("description", "Text", "Yes", "Free text", "Tool/equipment description"),
]

INSTR_05_WORK_PACKAGES: list[tuple[str, str, str, str, str]] = [
    ("wp_name", "Text", "Yes", "Max 40 chars, ALL CAPS", "Work package name (SAP format)"),
    ("wp_code", "Text", "Yes", "Unique code", "Work package identifier"),
    ("equipment_tag", "Text", "Yes", "Must exist in hierarchy", "Primary equipment tag"),
    ("frequency_value", "Number", "Yes", ">0", "Package execution frequency"),
    ("frequency_unit", "Text", "Yes", ", ".join(FREQUENCY_UNITS), "Frequency unit"),
    ("constraint", "Text", "Yes", ", ".join(WP_CONSTRAINTS), "Online or offline execution"),
    ("wp_type", "Text", "Yes", ", ".join(WP_TYPES), "Package type"),
    ("access_time_hours", "Number", "Yes", ">=0", "Equipment access time (0 for ONLINE)"),
    ("task_ids_csv", "Text", "Yes", "Comma-separated task IDs", "Task IDs from Template 04"),
    ("estimated_total_hours", "Number", "No", ">0", "Total estimated labour hours"),
    ("crew_size", "Integer", "No", ">=1", "Total crew size for the package"),
]

INSTR_07_SPARE_PARTS: list[tuple[str, str, str, str, str]] = [
    ("material_code", "Text", "Yes", "Unique code", "SAP material code"),
    ("description", "Text", "Yes", "Max 80 chars", "Material description"),
    ("manufacturer", "Text", "No", "Free text", "Part manufacturer"),
    ("part_number", "Text", "No", "Free text", "Manufacturer part number"),
    ("ved_class", "Text", "Yes", ", ".join(VED_CLASSES), "VED analysis: Vital/Essential/Desirable"),
    ("fsn_class", "Text", "Yes", ", ".join(FSN_CLASSES), "FSN analysis: Fast/Slow/Non-moving"),
    ("abc_class", "Text", "Yes", ", ".join(ABC_CLASSES), "ABC analysis: cost-based A/B/C"),
    ("quantity_on_hand", "Integer", "Yes", ">=0", "Current stock quantity"),
    ("min_stock", "Integer", "Yes", ">=0", "Minimum stock level"),
    ("max_stock", "Integer", "Yes", ">=min_stock", "Maximum stock level"),
    ("reorder_point", "Integer", "Yes", ">=min_stock", "Reorder trigger point"),
    ("lead_time_days", "Integer", "Yes", ">=0", "Procurement lead time in days"),
    ("unit_cost_usd", "Number", "Yes", ">=0", "Unit cost in USD"),
    ("unit_of_measure", "Text", "Yes", ", ".join(UNITS_OF_MEASURE), "Unit of measure"),
    ("applicable_equipment_csv", "Text", "No", "Comma-separated tags", "Equipment tags this part applies to"),
    ("warehouse_location", "Text", "No", "WH-xx-xx-xx format", "Warehouse bin location"),
]

INSTR_14_STRATEGY: list[tuple[str, str, str, str, str]] = [
    ("== IDENTITY ==", "", "", "", "Strategy identification fields"),
    ("strategy_id", "Text", "Yes", "Unique, e.g. S-001", "Unique strategy identifier"),
    ("equipment_tag", "Text", "Yes", "From Template 01", "Equipment tag"),
    ("maintainable_item", "Text", "Yes", "Free text", "Name of the maintainable item (MI)"),
    ("function_and_failure", "Text", "No", "{Category}-{Function}-{Failure}-{FunctionType}", "Structured function and failure description (optional)"),
    ("", "", "", "", ""),
    ("== FAILURE MODE ==", "", "", "", "What + Mechanism + Cause (must be valid 72-combo)"),
    ("what", "Text", "Yes", "Capital letter, singular", "Component sub-part that fails"),
    ("mechanism", "Text", "Yes", "18 valid values", "How it fails (see FM Combinations sheet)"),
    ("cause", "Text", "Yes", "44 valid values", "Why it fails (see FM Combinations sheet)"),
    ("", "", "", "", ""),
    ("== STRATEGY DECISION ==", "", "", "", "Maintenance strategy type selection"),
    ("status", "Text", "Yes", ", ".join(STRATEGY_STATUSES), "RECOMMENDED or REDUNDANT"),
    ("tactics_type", "Text", "Yes", ", ".join(STRATEGY_TYPES), "Strategy type (see Strategy Type Rules sheet)"),
    ("", "", "", "", ""),
    ("== PRIMARY TASK ==", "", "", "", "Proactive task with fixed interval. NULL for RTF."),
    ("primary_task_id", "Text", "Conditional", "FK to Template 04", "Primary task ID (NULL for RTF/REDESIGN)"),
    ("primary_task_interval", "Number", "Conditional", ">0", "Frequency value (NULL for RTF/REDESIGN)"),
    ("operational_units", "Text", "Conditional", ", ".join(FREQUENCY_UNITS), "Operational freq units (for operational causes)"),
    ("time_units", "Text", "Conditional", "DAYS,WEEKS,MONTHS,YEARS", "Calendar freq units (for calendar causes)"),
    ("primary_task_acceptable_limits", "Text", "Conditional", "Free text", "Acceptable condition thresholds (CB/FFI only)"),
    ("primary_task_conditional_comments", "Text", "No", "Free text", "Action when limits exceeded (CB/FFI only)"),
    ("primary_task_constraint", "Text", "Conditional", ", ".join(TASK_CONSTRAINTS), "Constraint override for this strategy"),
    ("primary_task_task_type", "Text", "Conditional", ", ".join(TASK_TYPES), "Task type (can override task default)"),
    ("primary_task_access_time", "Number", "No", ">=0", "Access time override (hours)"),
    ("", "", "", "", ""),
    ("== SECONDARY TASK ==", "", "", "", "Corrective task triggered by condition/failure. NULL for FT."),
    ("secondary_task_id", "Text", "Conditional", "FK to Template 04", "Secondary task ID (NULL for FT/REDESIGN)"),
    ("secondary_task_constraint", "Text", "Conditional", ", ".join(TASK_CONSTRAINTS), "Constraint for corrective task"),
    ("secondary_task_task_type", "Text", "Conditional", ", ".join(TASK_TYPES), "Task type for corrective task"),
    ("secondary_task_access_time", "Number", "No", ">=0", "Access time for corrective task (hours)"),
    ("secondary_task_comments", "Text", "No", "Free text", "Additional corrective action notes"),
    ("", "", "", "", ""),
    ("== BUDGET ==", "", "", "", "Budget classification for replacement/repair tasks"),
    ("budgeted_as", "Text", "No", ", ".join(BUDGETED_AS_VALUES), "NOT_BUDGETED, REPAIR, or REPLACE"),
    ("budgeted_life", "Number", "No", ">0", "Expected useful life of MI"),
    ("budgeted_life_time_units", "Text", "No", ", ".join(BUDGETED_LIFE_UNITS), "Time units for budgeted life"),
    ("budgeted_life_operational_units", "Text", "No", ", ".join(FREQUENCY_UNITS), "Operational units for budgeted life"),
    ("", "", "", "", ""),
    ("== METADATA ==", "", "", "", "Traceability and change management"),
    ("existing_task", "Text", "No", "Free text", "Source library/workshop: R8_LIBRARY, Anglo Tactics Library, WS [date]"),
    ("justification_category", "Text", "No", ", ".join(JUSTIFICATION_CATEGORIES), "MSO change category (for strategy optimization)"),
    ("justification", "Text", "No", "Free text", "Rationale for strategy selection or elimination"),
    ("notes", "Text", "No", "Free text", "Additional notes (prefix with ASSET: or STRATEGY: for context)"),
]
