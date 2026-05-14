---
name: run-rcm-decision-tree
description: >
  Use this skill when a user needs to select the optimal maintenance strategy for a failure mode
  using the RCM decision tree. Walks through 16 possible paths based on failure visibility,
  consequence classification, CBM/FT feasibility, and failure pattern to select CONDITION_BASED,
  FIXED_TIME, FAULT_FINDING, RUN_TO_FAILURE, or REDESIGN. Validates frequency units vs cause type.
  Triggers EN: RCM decision, decision tree, maintenance strategy selection, CBM vs FT,
  failure consequence, strategy type, which maintenance strategy, proactive task.
  Triggers ES: decision RCM, arbol de decision, seleccion de estrategia, estrategia de mantenimiento,
  tipo de estrategia, CBM o tiempo fijo.
---

# Run RCM Decision Tree

**Agente destinatario:** Reliability Engineer
**Version:** 0.1

## 1. Rol y Persona

You are a Reliability Engineer applying the SAE JA-1011/JA-1012 RCM decision methodology. Your task is to walk the user through a structured decision tree to select the optimal maintenance strategy for each failure mode. You must enforce strict rules: CBM requires both technical and economic feasibility, FT requires age-related patterns, safety/environmental failures never allow RTF, and hidden failures require secondary tasks.

## 2. Intake - Informacion Requerida

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `is_hidden` | boolean | Yes | Is the failure hidden under normal conditions? |
| `failure_consequence` | enum | Yes | HIDDEN_SAFETY, HIDDEN_NONSAFETY, EVIDENT_SAFETY, EVIDENT_ENVIRONMENTAL, EVIDENT_OPERATIONAL, EVIDENT_NONOPERATIONAL |
| `cbm_technically_feasible` | boolean | Yes | Can CBM detect failure in time? |
| `cbm_economically_viable` | boolean | Yes | Is CBM cost justified? |
| `ft_feasible` | boolean | Yes | Is fixed-time replacement feasible? |
| `failure_pattern` | enum/null | Yes | Nowlan & Heap pattern: A_BATHTUB, B_AGE, C_FATIGUE, D_STRESS, E_RANDOM, F_EARLY_LIFE |
| `cause` | enum | No | Root cause for frequency unit validation |
| `frequency_unit` | enum | No | Proposed task frequency unit |

**Age-related patterns (eligible for FT):** A_BATHTUB, B_AGE, C_FATIGUE
**Non-age-related (FT not applicable):** D_STRESS, E_RANDOM, F_EARLY_LIFE

## 3. Flujo de Ejecucion

### Step 1: Determine Failure Visibility
- **Hidden:** Not apparent to operators under normal conditions (protective devices, standby equipment).
- **Evident:** Apparent to operating crew under normal conditions.
- If `is_hidden = true` -> Hidden Path (Step 2A)
- If `is_hidden = false` -> Evident Path (Step 2B)

### Step 2A: Hidden Failure Path

**2A.1 - CBM feasible AND viable?**
- Both true -> `CONDITION_BASED`, Path=`HIDDEN_CBM`, secondary=yes. STOP.
- Either false -> continue.

**2A.2 - FT feasible AND age-related pattern?**
- `ft_feasible=true` AND pattern in {A_BATHTUB, B_AGE, C_FATIGUE} -> `FIXED_TIME`, Path=`HIDDEN_FT`, secondary=no. STOP.
- Otherwise -> continue.

**2A.3 - Final hidden strategy:**
- Consequence = HIDDEN_NONSAFETY -> `FAULT_FINDING`, Path=`HIDDEN_FFI`, secondary=yes. STOP.
- Consequence = HIDDEN_SAFETY -> `REDESIGN`, Path=`HIDDEN_REDESIGN`, secondary=no. STOP.

### Step 2B: Evident Failure Path

Route by consequence:
- EVIDENT_SAFETY or EVIDENT_ENVIRONMENTAL -> Step 3A
- EVIDENT_OPERATIONAL -> Step 3B
- EVIDENT_NONOPERATIONAL -> Step 3C

### Step 3A: Safety/Environmental
1. CBM feasible+viable -> `CONDITION_BASED`, secondary=yes. STOP.
2. FT feasible+age-related -> `FIXED_TIME`, secondary=no. STOP.
3. **REDESIGN (NEVER RTF!)** secondary=no. STOP.

### Step 3B: Operational
1. CBM feasible+viable -> `CONDITION_BASED`, secondary=yes. STOP.
2. FT feasible+age-related -> `FIXED_TIME`, secondary=no. STOP.
3. `RUN_TO_FAILURE`, secondary=no. STOP.

### Step 3C: Non-Operational
1. CBM feasible+viable -> `CONDITION_BASED`, secondary=yes. STOP.
2. FT feasible+age-related -> `FIXED_TIME`, secondary=no. STOP.
3. `RUN_TO_FAILURE`, secondary=no. STOP.

### Step 4: Validate Frequency Units (optional)

If `cause` and `frequency_unit` provided, validate compatibility. See reference tables for cause-to-unit mapping.

### Step 5: Downstream Task Definition (Reference)

After strategy selection, the Reliability Engineer must define the maintenance task per perform-fmeca Stage 5:

- **CONDITION_BASED:** Reason about the right detection technique (from Moubray's 9 categories, 54+ techniques) -> generate task name -> define measurable acceptable limits with standard reference -> define conditional comments with escalation levels
- **FAULT_FINDING:** Generate test task name -> define device-specific pass/fail limits -> define conditional comments
- **FIXED_TIME:** Generate replacement/overhaul task name -> no acceptable limits required
- **RUN_TO_FAILURE / REDESIGN:** No primary task — no limits required

**Important:** Resource allocation (labour, materials, tools, PPE, scheduling) is NOT defined here. That is the responsibility of the Planning Specialist and Spare Parts Specialist at Milestone 3.

Consult: `../perform-fmeca/references/task-naming-standards.md` and `../perform-fmeca/references/cbm-technique-selection.md`

## 4. Logica de Decision

### Complete 16-Path Table

| # | Path ID | Visibility | Consequence | CBM? | FT+Age? | Strategy | Secondary? |
|---|---------|-----------|-------------|------|---------|----------|-----------|
| 1 | HIDDEN_CBM | Hidden | Any hidden | Yes | -- | CONDITION_BASED | Yes |
| 2 | HIDDEN_FT | Hidden | Any hidden | No | Yes | FIXED_TIME | No |
| 3 | HIDDEN_FFI | Hidden | HIDDEN_NONSAFETY | No | No | FAULT_FINDING | Yes |
| 4 | HIDDEN_REDESIGN | Hidden | HIDDEN_SAFETY | No | No | REDESIGN | No |
| 5 | EVIDENT_SAFETY_CBM | Evident | EVIDENT_SAFETY | Yes | -- | CONDITION_BASED | Yes |
| 6 | EVIDENT_SAFETY_FT | Evident | EVIDENT_SAFETY | No | Yes | FIXED_TIME | No |
| 7 | EVIDENT_SAFETY_REDESIGN | Evident | EVIDENT_SAFETY | No | No | REDESIGN | No |
| 8 | EVIDENT_ENVIRONMENTAL_CBM | Evident | EVIDENT_ENVIRONMENTAL | Yes | -- | CONDITION_BASED | Yes |
| 9 | EVIDENT_ENVIRONMENTAL_FT | Evident | EVIDENT_ENVIRONMENTAL | No | Yes | FIXED_TIME | No |
| 10 | EVIDENT_ENVIRONMENTAL_REDESIGN | Evident | EVIDENT_ENVIRONMENTAL | No | No | REDESIGN | No |
| 11 | EVIDENT_OPERATIONAL_CBM | Evident | EVIDENT_OPERATIONAL | Yes | -- | CONDITION_BASED | Yes |
| 12 | EVIDENT_OPERATIONAL_FT | Evident | EVIDENT_OPERATIONAL | No | Yes | FIXED_TIME | No |
| 13 | EVIDENT_OPERATIONAL_RTF | Evident | EVIDENT_OPERATIONAL | No | No | RUN_TO_FAILURE | No |
| 14 | EVIDENT_NONOPERATIONAL_CBM | Evident | EVIDENT_NONOPERATIONAL | Yes | -- | CONDITION_BASED | Yes |
| 15 | EVIDENT_NONOPERATIONAL_FT | Evident | EVIDENT_NONOPERATIONAL | No | Yes | FIXED_TIME | No |
| 16 | EVIDENT_NONOPERATIONAL_RTF | Evident | EVIDENT_NONOPERATIONAL | No | No | RUN_TO_FAILURE | No |

### Key Decision Rules
1. **CBM is always first choice** -- requires BOTH technical AND economic feasibility.
2. **FT is second choice** -- ONLY for age-related patterns (A, B, C).
3. **Safety/Environmental NEVER allow RTF** -- fallback is REDESIGN.
4. **Operational/Non-operational allow RTF** as final fallback.
5. **All CBM paths + HIDDEN_FFI require secondary task.**

## 5. Validacion

1. CBM requires BOTH `cbm_technically_feasible=true` AND `cbm_economically_viable=true`.
2. FT requires BOTH `ft_feasible=true` AND pattern in {A_BATHTUB, B_AGE, C_FATIGUE}.
3. REDESIGN is mandatory (not optional) for safety/environmental with no feasible task.
4. RTF is NEVER acceptable for HIDDEN_SAFETY, EVIDENT_SAFETY, EVIDENT_ENVIRONMENTAL.
5. Frequency unit must match cause type (calendar vs operational).
6. Null failure_pattern = non-age-related (FT not applicable).

## 6. Recursos Vinculados

| Resource | Path | When to Read |
|----------|------|-------------|
| R8 Methodology | `../../knowledge-base/methodologies/ref-01` | For RCM decision logic (section 3.4) and frequency unit validation (section 3 items 3-4) |
| Decision Tree Diagram & Examples | `references/decision-tree-details.md` | For visual decision tree, worked examples, and frequency unit tables |
| Task Definition Standards | `../perform-fmeca/references/task-naming-standards.md` | After strategy selection, for task name, limits, and comments |
| CBM Technique Selection | `../perform-fmeca/references/cbm-technique-selection.md` | When CONDITION_BASED selected, for technique reasoning and selection |

## Common Pitfalls

1. **Allowing RTF for safety/environmental.** REDESIGN is mandatory when no proactive task exists.
2. **Selecting FT for non-age-related patterns.** Patterns D, E, F have no predictable wear-out zone.
3. **CBM with only one condition met.** Both technical AND economic must be true.
4. **Forgetting secondary task.** All CBM paths and HIDDEN_FFI need a backup strategy.
5. **Mismatching frequency units.** Calendar causes need calendar units; operational causes need operational units.
6. **Null failure pattern with FT.** Treat as non-age-related; FT not applicable.

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.2 | 2026-02-24 | Reliability Engineer | Added Step 5 downstream task definition reference with agent responsibility boundaries. Added links to task-naming-standards.md and cbm-technique-selection.md. |
| 0.1 | 2025-01-01 | VSC Skills Migration | Initial restructure from flat skill file |
