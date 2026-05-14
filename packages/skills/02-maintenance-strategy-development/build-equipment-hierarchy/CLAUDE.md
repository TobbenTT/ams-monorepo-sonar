---
name: build-equipment-hierarchy
description: >
  Use this skill when a user needs to construct a 6-level equipment hierarchy tree from vendor
  data and the equipment type library. Auto-generates tags (area-code-seq format), criticality
  assignments, sub-assemblies (level 5), maintainable items (level 6), failure modes, and task
  templates. Follows ISO 14224 taxonomy and SAP PM conventions.
  Triggers EN: equipment hierarchy, plant hierarchy, functional location, 6 levels, tag naming,
  hierarchy builder, register equipment, equipment structure, SAP hierarchy.
  Triggers ES: jerarquia de equipos, ubicacion funcional, 6 niveles, nomenclatura de tag,
  construir jerarquia, registrar equipo, estructura de equipo.
---

# Build Equipment Hierarchy

**Agente destinatario:** Reliability Engineer
**Version:** 0.1

## 1. Rol y Persona

You are a Reliability Engineer and SAP PM specialist. Your task is to build a complete 6-level equipment hierarchy from vendor data, automatically generating tags, criticality assignments, sub-assemblies, maintainable items, failure modes, and task templates using the equipment type library. You follow ISO 14224 taxonomy and SAP PM conventions for tag naming.

## 2. Intake - Informacion Requerida

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `plant_id` | string | Yes | SAP Plant code (e.g., "OCP-JFC1") |
| `area_code` | string | Yes | Area code within plant (e.g., "BRY") |
| `equipment_type` | string | Yes | Equipment type name or alias |
| `model` | string | No | Manufacturer model number |
| `manufacturer` | string | No | Equipment manufacturer |
| `power_kw` | float | No | Power rating in kilowatts |
| `weight_kg` | float | No | Weight in kilograms |
| `serial_number` | string | No | Manufacturer serial number |
| `installation_date` | string | No | ISO format date |
| `sequence` | integer | No | Sequence number (default: 1) |
| `components` | list | No | Additional component names |
| `specifications` | dict | No | Additional technical specs |

## 3. Flujo de Ejecucion

### Step 1: Identify Equipment Type in Library
- Convert input to uppercase with underscores.
- Search by: direct match on equipment_type_id, name match, alias match.
- If NOT found, create minimal node + warning.

### Step 2: Generate Equipment Tag
**Convention:** `{area_code}-{equipment_code}-{sequence:03d}`
- Extract equipment code from library tag_convention if available.
- Otherwise use first 3 uppercase chars of equipment type.
- Examples: SAG Mill area BRY seq 1 -> `BRY-SAG-ML-001`

### Step 3: Auto-Assign Criticality
1. If library has `criticality_class`, use it.
2. Otherwise, use power-based table:

| Power (kW) | Class |
|------------|-------|
| >= 5000 | AA |
| >= 2000 | A+ |
| >= 500 | A |
| >= 100 | B |
| < 100 | C |

### Step 4: Build the 6-Level Hierarchy

| Level | Type | Description |
|-------|------|-------------|
| 1 | PLANT | Physical plant/site |
| 2 | AREA | Functional area |
| 3 | SYSTEM | Process system |
| 4 | EQUIPMENT | Major equipment item |
| 5 | SUB_ASSEMBLY | Component group |
| 6 | MAINTAINABLE_ITEM | Lowest replaceable item |

Engine builds levels 4-6. Levels 1-3 assumed to exist.

### Step 5: Attach Failure Modes
For each MI with library-defined failure modes, create records with mechanism, cause, weibull_beta, weibull_eta.

### Step 6: Generate Task Templates
For each failure mode with typical_task, create templates with task_type, description, frequency, constraint.

### Step 7: Compile Results
Count nodes, list hierarchy, failure modes, task templates, warnings.

## 4. Logica de Decision

### Equipment Type Alias Table

| User Input | Library Key |
|------------|------------|
| SAG_MILL | SAG |
| BALL_MILL | BALL |
| ROD_MILL | ROD |
| SLURRY_PUMP | SLURRY |
| FLOTATION_CELL | FLOTATION |
| BELT_CONVEYOR | CONVEYOR |
| THICKENER | THICKENER |
| BELT_FILTER | FILTER |
| ROTARY_DRYER | DRYER |
| CRUSHER | CRUSHER |
| VIBRATING_SCREEN | SCREEN |
| HYDROCYCLONE | CYCLONE |
| AGITATOR | AGITATOR |
| COMPRESSOR | COMPRESSOR |
| HEAT_EXCHANGER | HEAT |

### Matching Algorithm
1. Uppercase, replace spaces with underscores.
2. Check if input contained in any library equipment_type_id.
3. Check if input equals library name (uppercased).
4. Check alias table, then check alias against library IDs.

### Criticality Assignment Decision
```
IF type found in library: RETURN library.criticality_class
ELSE: use power-based table (top-down, first match)
```

### Node Tag Generation
- Equipment: `{area}-{equip_code}-{seq:03d}`
- Sub-Assembly: `{equip_tag}-{first_3_chars_SA_name}`
- Maintainable Item: `{sa_tag}-{first_3_chars_MI_name}{order:02d}`

## 5. Validacion

1. Unknown equipment type produces warning, not error -- minimal node created.
2. Tag format: `{area_code}-{equipment_code}-{sequence:03d}`.
3. Sequence zero-padded to 3 digits.
4. Library criticality takes precedence over power-based.
5. Sub-assemblies/MIs only generated when type found in library.
6. All UUIDs freshly generated per build.
7. Failure modes only attached to MIs with library definitions.

## 6. Recursos Vinculados

| Resource | Path | When to Read |
|----------|------|-------------|
| Data Models | `../../knowledge-base/data-models/ref-02` | For hierarchy node schema and tag conventions |
| GFSN Equipment Library | `../../knowledge-base/gfsn/ref-13` | For equipment type definitions and failure mode libraries |
| Hierarchy Examples | `references/hierarchy-examples.md` | For worked example with SAG Mill hierarchy structure |

## Common Pitfalls

1. **Type not found = no sub-assemblies.** Only bare equipment node created. Check warnings.
2. **Confusing level numbers.** Equipment=4, Sub-Assembly=5, MI=6. Levels 1-3 not created by engine.
3. **Power-based criticality when library has value.** Library always takes precedence.
4. **Duplicate tags.** Increment sequence number for additional units in same area.
5. **Missing French names.** Falls back to English name if library lacks name_fr.
6. **Alias not recognized.** Alias table is fixed. Try direct match first, then suggest closest alias.

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2025-01-01 | VSC Skills Migration | Initial restructure from flat skill file |
