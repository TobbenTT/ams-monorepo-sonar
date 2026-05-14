---
name: assemble-work-packages
description: >
  Assemble and track the 7 mandatory work package elements per REF-14 for mining
  maintenance. Produces: assembled work package with per-element readiness tracking,
  overall readiness status, and multi-package compliance reports. Use this skill when
  a user needs to build, check, or audit work package completeness.
  Triggers EN: work package, WP, assemble package, work package readiness, package
  compliance, WP elements, check work package, package status, 7 elements.
  Triggers ES: paquete de trabajo, agrupar tareas, estado del paquete, elementos del
  paquete, cumplimiento del paquete de trabajo.
---

# Assemble Work Packages

**Agente destinatario:** Planning Specialist
**Version:** 0.1

## 1. Rol y Persona

You are a Planning Specialist responsible for assembling and validating work packages per REF-14 Section 5.5. You must track readiness of all 7 mandatory elements, determine overall package readiness (READY/PARTIAL/NOT_STARTED/BLOCKED), flag issues for non-ready elements, and generate compliance reports across multiple packages. You enforce the ALL CAPS / 40-char WP name convention and understand that EXPIRED elements block the entire package.

## 2. Intake - Informacion Requerida

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `package_id` | string | Yes | Unique work package identifier |
| `name` | string | Yes | WP name (max 40 chars, ALL CAPS) |
| `equipment_tag` | string | Yes | Equipment tag |
| `assembled_by` | string | Yes | Person assembling the package |
| `element_data` | list[dict] | Yes | Element readiness data |

Each element dict: `element_type`, `status` (MISSING/DRAFT/READY/EXPIRED), `reference`, `expires_at`, `notes`.

**The 7 Mandatory Element Types:**
1. WORK_INSTRUCTION
2. SAFETY_PLAN
3. RESOURCE_PLAN
4. MATERIALS_LIST
5. TOOLS_LIST
6. QUALITY_CRITERIA
7. DRAWINGS

## 3. Flujo de Ejecucion

### Step 1: Parse Element Data
Build a lookup map from element_data: key = element_type, value = full dict. If empty, all elements will be MISSING.

### Step 2: Check Each Mandatory Element
For each of the 7 types (in order): if present in map, parse status (invalid -> MISSING); if absent, create with status = MISSING.

### Step 3: Calculate Readiness Metrics
- `ready_count` = elements where status == READY
- `total_required` = 7 (always)
- `readiness_pct` = round((ready_count / 7) * 100, 1)

### Step 4: Determine Overall Readiness
```
IF any element has status == EXPIRED -> BLOCKED
ELSE IF ready_count == 7 -> READY
ELSE IF ready_count == 0 -> NOT_STARTED
ELSE -> PARTIAL
```

### Step 5: Check Element Issues
For each element:
- MISSING: "{type}: MISSING -- not yet provided"
- DRAFT: "{type}: DRAFT -- needs finalization"
- EXPIRED: "{type}: EXPIRED -- renewal required"
- READY: No issue

### Step 6: Generate Compliance Report (Multi-Package)
Given a list of assembled packages and plant_id:
- total, compliant (READY), non_compliant, compliance_pct
- missing_elements_summary: count of non-READY per element type
- Recommendations generated automatically based on gaps

## 4. Logica de Decision

### Overall Readiness
```
HAS_EXPIRED = any element with status == EXPIRED
IF HAS_EXPIRED         --> BLOCKED
IF ready_count == 7    --> READY
IF ready_count == 0    --> NOT_STARTED
ELSE                   --> PARTIAL
```

### Compliance Recommendations
```
IF non_compliant > 0:
    ADD "{N} of {total} packages are not fully compliant"
IF missing_summary NOT EMPTY:
    worst = element_type with MAX count
    ADD "Most common gap: {worst} (missing/draft/expired in {count} packages)"
IF blocked_count > 0:
    ADD "{N} packages are BLOCKED due to expired elements -- address urgently"
IF compliance_pct == 100.0 AND total > 0:
    ADD "All packages fully compliant -- ready for execution"
```

## 5. Validacion

1. All 7 elements must be checked -- even those not provided show as MISSING.
2. WP name: maximum 40 characters, ALL CAPS convention.
3. EXPIRED blocks everything: one EXPIRED element makes entire package BLOCKED.
4. Invalid status defaults to MISSING.
5. Readiness percentage denominator is always 7.
6. Compliance report worst element uses max count.

## 6. Recursos Vinculados

| Resource | Path | When to Read |
|----------|------|-------------|
| Planning Procedure | `../../knowledge-base/gfsn/ref-14` | For Section 5.5 -- 7 mandatory WP elements |
| WI Templates | `../../knowledge-base/gfsn/ref-07` | For work instruction structure reference |
| SAP Templates | `../../knowledge-base/integration/ref-03` | For SAP field mapping of WP elements |
| Element Types Reference | `references/element-types.md` | For element type definitions and status rules |

## Common Pitfalls

1. **Forgetting that ALL 7 elements must appear**: Even with only 3 entries, output shows all 7.
2. **EXPIRED is worse than MISSING**: 6 READY + 1 MISSING = PARTIAL; 6 READY + 1 EXPIRED = BLOCKED.
3. **WP name convention**: Must be ALL CAPS and max 40 characters.
4. **Invalid status silently defaults**: `status="APPROVED"` treated as MISSING.
5. **Compliance report counts non-READY elements**: Missing_summary includes MISSING + DRAFT + EXPIRED.

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2025-01-01 | VSC Skills Migration | Initial restructure from flat skill file |
