# REF-02: R8 Data Model — Complete Entity Schema Reference

## Source: R8 Software Tactics Library Configuration Procedure (147 pages)

---

## 1. R8 Software Architecture Overview

### 1.1 Four Key Areas

| Area | Purpose | Usage |
|------|---------|-------|
| **Sandbox** | Ad-hoc analysis area for developing/testing strategies | Development only |
| **Component Library** | Reusable maintainable items with maintenance strategies | Cannot be used for org reporting |
| **Equipment Library** | Reusable physical assets composed of library components | Named: Make - Model - Context |
| **Plant Hierarchy** | Actual organizational structure representing real site assets | Used for all budgeting/forecasting |

### 1.2 Library Workflow

```
Develop tactics in SANDBOX
    ↓
Copy into COMPONENT LIBRARY (generic reusable components)
    ↓
Compose into EQUIPMENT LIBRARY (make/model specific)
    ↓
Insert as embedded reference into PLANT HIERARCHY (site-specific)
```

### 1.3 Library Scale

- 200+ types of fixed plant equipment, 3000+ components
- 50+ types of mine equipment, 1000+ components
- Library is generic — typically 60-70% aligned to any given site

---

## 2. Entity Schemas

### 2.1 Business Unit

| Field | Type | Mandatory | Description |
|-------|------|-----------|-------------|
| name | string | M | Business unit name |
| code | string | M | Unique identifier |
| business_inception_date | date | M | Start date |
| business_life_estimated | number | M | Estimated life in years |
| business_end_of_life_date | date | M | Calculated end date |
| reactive_allowance_pct | number (default 20%) | M | % budget for reactive work |
| cost_of_money_tied_up_pct | number | TBA | Capital cost factor |
| storage_and_maintenance_pct | number | TBA | Storage cost factor |
| capital_escalation | number | M | Annual escalation rate |
| non_capital_escalation | number | M | Annual escalation rate |
| taxation_rate | number | M | Tax rate % |
| discount_rate | number | M | Discount rate for NPV |
| labour_cost_escalation | number | M | Annual labour escalation |
| material_cost_escalation | number | M | Annual material escalation |

### 2.2 Equipment

| Field | Type | Mandatory | Description |
|-------|------|-----------|-------------|
| name | string | M | Format: "Make - Model - Operational Context" |
| code | string | M | CMMS identifier (EGI or SAP Assembly code) |
| cost_centre_code | string | M | From CMMS |
| equipment_category | enum | M | Dropdown list |
| equipment_make | enum | M | Manufacturer |
| equipment_model | enum | M | Model designation |
| use_base_labour | boolean | M | Use base labour rates? |
| use_equipment_level_production_forecast | boolean | M | Equipment-level forecasting? |
| in_service_date | date | M | Installation date |
| decommission_date | date | M | Planned decommission |
| meter_reading_date | date | M | Last reading date from CMMS |
| meter_reading | number | M | Last reading value from CMMS |
| meter_reading_value | enum | M | Units dropdown |
| operational_conversion | number | M | Conversion factor |
| comment | string | O | General notes |
| notes | string | O | Additional notes |
| images | file[] | O | Equipment photographs |

### 2.3 Maintainable Item (Component)

| Field | Type | Mandatory | Description |
|-------|------|-----------|-------------|
| name | string | M | e.g., "Pulley, Head End" |
| code | string | M | CMMS component code, e.g., "CLA7-HE" |
| cost_centre_code | string | O | Cost centre |
| maintenance_strategy_approach | enum (MSO/RCM/OEM) | M | Analysis approach used |
| meter_reading_units | enum | M | Units for operational tracking |
| meter_reading_conversion | number | M | Conversion factor |
| age_when_replaced | number | O | Typical replacement age |
| last_replaced_date | date | M | From CMMS |
| meter_reading_date | date | M | From CMMS |
| meter_reading | number | M | From CMMS |
| update_reason | string | O | Reason for last update |

### 2.4 Function

| Field | Type | Mandatory | Description |
|-------|------|-----------|-------------|
| function_type | enum (Primary/Secondary/Protective) | M | Type of function |
| description | string | M | Verb + Noun + Performance Standard |
| performance_standard | string | M | Measurable target |
| functional_failures | FunctionalFailure[] | M | List of ways function can fail |

### 2.5 Functional Failure

| Field | Type | Mandatory | Description |
|-------|------|-----------|-------------|
| type | enum (Total/Partial) | M | Complete or degraded loss |
| description | string | M | Description of failure state |
| parent_function_id | reference | M | Links to Function |

### 2.6 Failure Mode (Strategy)

| Field | Type | Mandatory | Description |
|-------|------|-----------|-------------|
| status | enum (Recommended/Redundant) | M | Is this active? |
| what | string | M | Sub-component that fails (capital, singular, specific) |
| mechanism | enum (18 values) | M | How it fails — MUST be one of 18 mechanisms from SRC-09 (see §3.2) |
| cause | enum (44 values) | M | Why it fails — MUST be a valid cause for the selected mechanism per SRC-09 (see §3.1). Only 72 valid Mechanism+Cause combinations exist. |
| maintenance_strategy_type | enum (CB/FT/RTF/FFI/Redesign/OEM) | M | Selected strategy |
| primary_task | reference → Task | M | Preventive/predictive task |
| primary_task_frequency | number | M | Numeric frequency |
| frequency_units | enum (Time/Operational) | M | Time-based or usage-based |
| operational_time_units | enum | M | Specific unit (hours, days, weeks, months, tonnes, cycles) |
| secondary_task | reference → Task | M (for CB/FFI) | Corrective task when limit exceeded |
| existing_task | string | O | Source: "Anglo Tactics Library", "MSO", "WS [date]", "Libreria R8" |
| notes | string | O | Additional notes |
| failure_consequence | enum (Hidden-Safety/Hidden-NonSafety/Safety/Environmental/Operational/NonOperational) | M | Consequence classification |
| failure_pattern | enum (A/B/C/D/E/F) | O | Nowlan & Heap pattern |

### 2.7 Task (Primary or Secondary)

| Field | Type | Mandatory | Description |
|-------|------|-----------|-------------|
| name | string | M | Standardized: "Inspect [what] for [evidence]" |
| acceptable_limits | string | M (CB/FFI) | Threshold triggering secondary task |
| conditional_comments | string | O | Action if outside limits |
| consequences | string | M | What happens if not performed |
| justification | string | O | Why the task is performed |
| task_type | enum (Repair/Replace/Inspect/Check/Test/Lubricate/Clean/Calibrate) | M | Type of task |
| access_time | number (hours) | M | Downtime for offline tasks (0 for online) |
| constraint | enum (Online/Offline/TestMode) | M | Execution condition |
| origin | string | O | OEM manual, statutory, library, workshop |
| task_reference_number | string | M (secondary) | External CMMS reference |
| unscheduled_overhead | number | O | Reactive cost modifier |
| notes | string | O | Additional notes |
| task_colour | string | O | Visual coding for work packages |
| is_secondary | boolean | M | Primary (false) or Secondary (true) |
| budget_type | enum (Repair/Replace) | M (secondary) | Replace=entire MI, Repair=sub-component |
| budgeted_status | boolean | M (secondary) | Is this task budgeted? |
| budgeted_life | number | M (secondary) | Estimated component useful life |
| labour_resources | LabourResource[] | M | Required workforce |
| material_resources | MaterialResource[] | O | Required materials |
| tools | string[] | O | Special tools required |
| task_equipment | string[] | O | Special equipment (crane, scaffolding) |

### 2.8 Labour Resource

| Field | Type | Mandatory | Description |
|-------|------|-----------|-------------|
| description | enum | M | Fitter, Electrician, Instrumentist, Operator, ConMon Specialist, Lubricator |
| price_hourly | number | Auto | Hourly rate (from system) |
| allocated_quantity | number | M | Number of workers |
| allocated_hours | number | M | Hours per worker |

### 2.9 Material Resource

| Field | Type | Mandatory | Description |
|-------|------|-----------|-------------|
| description | string | M | Name of part/material |
| unit_price | number | Auto | Cost per unit (from system) |
| part_number | string | Auto | Manufacturer part number |
| stock_code | string | Auto | CMMS stock code |
| quantity | number | M | Units needed |

### 2.10 Work Package

| Field | Type | Mandatory | Description |
|-------|------|-----------|-------------|
| name | string (max 40 chars, CAPS) | M | [FREQ] [ASSET] [LABOUR] [SERV/INSP] [ON/OFF] |
| code | string | M | Unique identifier |
| frequency | number | M | Numeric value |
| frequency_units | enum | M | Time or operational |
| constraint | enum (Online/Offline) | M | Execution condition |
| access_time | number (hours) | M | Downtime |
| work_package_type | enum (Standalone/Suppressive/Sequential) | M | Package type |
| job_preparation | string | O | Pre-task instructions |
| post_shutdown | string | O | Post-task instructions |
| allocated_tasks | Task[] (ordered) | M | Tasks in execution order |
| labour_summary | LabourResource[] | Auto | Aggregated from tasks |
| material_summary | MaterialResource[] | Auto | Aggregated from tasks |
| tools_summary | string[] | Auto | Aggregated from tasks |

### 2.11 Criticality Assessment

| Field | Type | Mandatory | Description |
|-------|------|-----------|-------------|
| equipment_id | reference | M | Equipment being assessed |
| criteria_scores | CriteriaScore[] | M | One per consequence category |
| probability | enum (1-5) | M | Likelihood level |
| overall_score | number | Auto | Calculated from matrix |
| weighted_score | number | Auto | With category weights |
| rating | enum (I/II/III/IV) | Auto | Risk class |
| comments | string | O | Assessment notes |

### 2.12 Criteria Score

| Field | Type | Mandatory | Description |
|-------|------|-----------|-------------|
| category | enum (Safety/Health/Environment/Production/etc.) | M | Consequence category |
| consequence_level | enum (1-5) | M | Impact severity |
| comments | string | O | Justification |
| weighting | number | Auto | System-calculated |

---

## 3. Administration Code Tables

### 3.1 Cause Codes (44 — SRC-09 Authoritative)

> **MANDATORY**: Valid Mechanism + Cause combinations are constrained to the 72 pairs defined in `Failure Modes (Mechanism + Cause).xlsx` (SRC-09). See gemini.md §4.4.

```
abrasion, age, bio_organisms, breakdown_in_insulation, chemical_attack,
contamination, corrosive_environment, creep, cyclic_loading,
electrical_overload, erosion, excessive_fluid_velocity,
excessive_particle_size, exposure_to_atmosphere, fatigue, flashover,
fouling, heat, high_resistance_connection, impact_shock_loading,
inadequate_lubrication, incorrect_material, internal_leakage,
mechanical_overload, metal_to_metal_contact, misalignment,
over_pressure, over_torque, overload, relative_movement, rubbing,
saturation, seal_failure, settlement, short_circuit,
temperature_fluctuation, tension, thermal_expansion, use,
valve_leak_past, vibration, voltage_surge, water_hammer,
wrong_chemical_concentration
```

### 3.2 Mechanism Codes (18 — SRC-09 Authoritative)

```
arcs, blocks, breaks_fracture_separates, corrodes, cracks, degrades,
distorts, drifts, expires, immobilised, looses_preload, open_circuit,
overheats_melts, severs, short_circuits, thermally_overloads,
washes_off, wears
```

### 3.3 Strategy Types

```
condition_based, fixed_time, run_to_failure, fault_finding_interval,
redesign, oem
```

### 3.4 Constraint Codes

```
online, offline, test_mode
```

### 3.5 Task Types

```
repair, replace, inspect, check, test, lubricate, clean, calibrate
```

### 3.6 Justification Categories (for MSO)

```
modified, eliminated, frequency_change, tactic_change, maintained, new_task
```

### 3.7 Elimination Justifications

```
duplicate_activity, failure_mode_already_covered, no_value_added,
not_applicable_by_design
```

### 3.8 Labour Types

```
fitter, electrician, instrumentist, operator, conmon_specialist, lubricator
```

### 3.9 Frequency Units — Time

```
hours, days, weeks, months, years
```

### 3.10 Frequency Units — Operational

```
operating_hours, tonnes, cycles, kilometres
```

---

## 4. Entity Relationships (ERD Summary)

```
BusinessUnit
  └── has many: Equipment (Plant Hierarchy)
        ├── has one: CriticalityAssessment
        ├── has many: MaintainableItem (Sub-assemblies/Components)
        │     ├── has many: Function
        │     │     └── has many: FunctionalFailure
        │     │           └── has many: FailureMode
        │     │                 ├── has one: PrimaryTask (→ Task)
        │     │                 └── has one: SecondaryTask (→ Task)
        │     └── has many: Task
        │           ├── has many: LabourResource
        │           └── has many: MaterialResource
        └── has many: WorkPackage
              └── has many: Task (ordered, allocated)

ComponentLibrary
  └── has many: generic MaintainableItem (reusable templates)

EquipmentLibrary
  └── has many: generic Equipment (composed of ComponentLibrary items)
```

---

## 5. R8 MSO Process (3 Database Versions)

| Version | Naming Convention | Purpose |
|---------|------------------|---------|
| 1 | "[Name] (Estrategia Original [Date])" | Frozen baseline — never modified |
| 2 | "[Name] (Estrategia con Redundantes)" | Working version with all analysis |
| 3 | "[Name] (Estrategia Final)" | Clean final version for implementation |

---

## 6. Change Management

- Strategies can be **locked** (read-only) and **unlocked** for editing
- Changes require documentation of reason and approval
- Version control through Business Unit copies
- Justification Category required for every change: Modified, Eliminated, Frequency Change, Tactic Change, Maintained, New Task
