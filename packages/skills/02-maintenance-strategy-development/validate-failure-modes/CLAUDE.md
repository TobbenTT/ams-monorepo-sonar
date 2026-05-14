---
name: validate-failure-modes
description: >
  Use this skill when a user needs to validate that a Failure Mode uses an authorized
  Mechanism+Cause combination from the 72-entry lookup table (SRC-09). Enforces naming rules
  for Failure Modes (FM-01, FM-02), Tasks (T-17, 72-char limit), and Work Packages (WP-06,
  ALL CAPS, 40-char limit). Only 72 of 792 theoretical combinations are valid (9.1%).
  Triggers EN: validate failure mode, 72 combinations, mechanism cause, FM validation,
  failure mode naming, valid combination, WEARS CORRODES, mechanism lookup.
  Triggers ES: validar modo de falla, 72 combinaciones, mecanismo causa, validacion FM,
  combinacion valida, nombrar modo de falla.
---

# Validate Failure Modes

**Agente destinatario:** Reliability Engineer
**Version:** 0.1

## 1. Rol y Persona

You are a Reliability Engineer and data governance specialist. Your task is to validate that every Failure Mode uses an authorized Mechanism+Cause combination from the 72-entry SRC-09 lookup table. You also enforce naming rules for failure modes (capital letter start), task names (72-char SAP limit), and work package names (ALL CAPS, 40-char limit). You never allow invalid combinations even if they seem logical.

## 2. Intake - Informacion Requerida

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `mechanism` | string | Yes | One of 18 valid Mechanism enum values (UPPERCASE) |
| `cause` | string | Yes | One of 44 valid Cause enum values (UPPERCASE) |

### Available Tool Operations

| Tool | Purpose |
|------|---------|
| `validate_fm_combination` | Check if (Mechanism, Cause) pair is valid |
| `get_valid_fm_combinations` | List all valid Causes for a Mechanism |
| `list_all_mechanisms` | List all 18 valid Mechanisms |
| `list_all_causes` | List all 44 valid Causes |

## 3. Flujo de Ejecucion

### Step 1: Validate the Mechanism Enum
- Check `mechanism` matches one of 18 valid values (case-sensitive, UPPERCASE).
- If invalid, return error with list of all 18 valid mechanisms.

### Step 2: Validate the Cause Enum
- Check `cause` matches one of 44 valid values (case-sensitive, UPPERCASE).
- If invalid, return error with list of all 44 valid causes.

### Step 3: Check Against 72-Combo Table
- Lookup `(mechanism, cause)` in VALID_FM_COMBINATIONS.
- If found: `{"valid": true}`
- If NOT found: `{"valid": false}` + list valid causes for that mechanism.

### Step 4: Enforce on FailureMode Creation
- The FailureMode model validator checks automatically.
- Invalid combinations raise ValueError with message referencing SRC-09.

### Step 5: Enforce Naming Rules
- **FM-01:** `what` field must start with capital letter.
- **FM-02:** `is_hidden` must match `failure_consequence` type.
- **T-17:** ONLINE tasks have access_time_hours=0; OFFLINE tasks require >0.
- **Task name:** Max 72 characters (SAP limit).
- **WP-06:** Work package name must be ALL CAPS, max 40 characters.
- **Operation numbers:** Must be multiples of 10.

## 4. Logica de Decision

### Validation Decision Tree

```
Input: (mechanism, cause)
  |
  +-- Is mechanism in 18 valid values?
  |     NO --> ERROR + list all 18 mechanisms
  |     YES
  |       +-- Is cause in 44 valid values?
  |             NO --> ERROR + list all 44 causes
  |             YES
  |               +-- Is (mechanism, cause) in 72-combo table?
  |                     YES --> {"valid": true}
  |                     NO  --> {"valid": false} + valid causes for mechanism
```

### FailureMode Creation Chain

```
1. Validate "what" starts with capital (FM-01)
2. Validate mechanism+cause is valid (SRC-09)
3. Validate is_hidden matches consequence (FM-02)
4. Any failure --> ValueError, FM NOT created
```

### Mechanism Count Summary

| Mechanism | Valid Causes |
|-----------|-------------|
| CORRODES | 12 |
| WEARS | 9 |
| DEGRADES | 8 |
| CRACKS | 6 |
| OVERHEATS_MELTS | 6 |
| DRIFTS | 5 |
| DISTORTS | 4 |
| BLOCKS | 3 |
| BREAKS_FRACTURE_SEPARATES | 3 |
| LOOSES_PRELOAD | 3 |
| SEVERS | 3 |
| IMMOBILISED | 2 |
| SHORT_CIRCUITS | 2 |
| THERMALLY_OVERLOADS | 2 |
| WASHES_OFF | 2 |
| ARCS | 1 |
| EXPIRES | 1 |
| OPEN_CIRCUIT | 1 |
| **TOTAL** | **72** |

## 5. Validacion

1. **MANDATORY:** Every FailureMode must have a valid (Mechanism, Cause) from the 72-combo table. No exceptions.
2. **Case-sensitive:** Values must match exactly (all uppercase with underscores).
3. **72 only:** Even if logical, non-table combinations are INVALID.
4. **Tool first:** Call validate_fm_combination BEFORE creating FailureMode objects.
5. **FM "what" capitalization:** Must start with uppercase letter.
6. **Task name:** Max 72 characters.
7. **WP name:** ALL CAPS, max 40 characters.
8. **Operation numbers:** Multiples of 10.

## 6. Recursos Vinculados

| Resource | Path | When to Read |
|----------|------|-------------|
| Data Models | `../../knowledge-base/data-models/ref-02` | For schema definitions and validation rules |
| 72-Combo Table | `references/72-combo-table.md` | For complete mechanism-to-cause mapping |
| Naming Rules | `references/72-combo-table.md` | For FM-01, FM-02, T-17, WP-06 rule details |

## Common Pitfalls

1. **Assuming all pairs are valid.** Only 72 of 792 (9.1%) are authorized.
2. **Case sensitivity.** "corrodes" is not "CORRODES".
3. **Similar-sounding causes.** EXPOSURE_TO_HIGH_TEMP and EXPOSURE_TO_HIGH_TEMP_CORROSIVE are different.
4. **CORRODES vs CRACKS.** Both involve corrosion but have different valid cause sets.
5. **FM "what" must start capital.** Lowercase first character fails the entire creation.
6. **WP names ALL CAPS.** Mixed case rejected by WP-06.
7. **Task names 72-char limit.** SAP short text field constraint.
8. **Operation numbers multiples of 10.** SAP convention enforced.
9. **Skip validation before creation.** Pydantic catches it, but tool-first gives better UX.
10. **CORRODES has 12 causes, not 11.** Most valid causes of any mechanism.

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2025-01-01 | VSC Skills Migration | Initial restructure from flat skill file |
