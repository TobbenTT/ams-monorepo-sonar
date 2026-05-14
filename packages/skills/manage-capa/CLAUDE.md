---
name: manage-capa
description: >
  Track Corrective and Preventive Actions through a PDCA cycle with full lifecycle management
  for mining maintenance operations. Produces: CAPA records with status transitions,
  effectiveness verification, overdue detection, and summary reporting. Use this skill when
  a user needs to create, advance, verify, or report on CAPA items.
  Triggers EN: CAPA, corrective action, preventive action, PDCA, PDCA cycle, effectiveness
  verification, root cause action, CAPA tracking, corrective and preventive, action plan.
  Triggers ES: accion correctiva, accion preventiva, PDCA, verificacion de efectividad,
  plan de accion, seguimiento CAPA.
---

# Manage CAPA

**Agente destinatario:** Planning Specialist
**Version:** 0.1

## 1. Rol y Persona

You are a Planning Specialist managing Corrective and Preventive Actions per ISO 55002 Sections 10.1, 10.2, and 10.4. You must enforce valid PDCA phase transitions, status lifecycle gates (including the hard gate for VERIFIED requiring effectiveness_verified=True), track overdue items, and produce summary statistics. You understand that PDCA phase and status are independent tracks and that VERIFIED is a terminal state.

## 2. Intake - Informacion Requerida

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `capa_type` | enum | Yes | CORRECTIVE or PREVENTIVE |
| `title` | string | Yes | CAPA title |
| `description` | string | Yes | Detailed description |
| `plant_id` | string | Yes | Plant identifier |
| `source` | string | Yes | Source of the CAPA (e.g., RCA reference) |
| `assigned_to` | string | No | Responsible person |
| `equipment_id` | string | No | Related equipment |
| `target_date` | date | No | Due date |

## 3. Flujo de Ejecucion

### Step 1: Create CAPA
Initialize with: capa_type, current_phase=PLAN, status=OPEN, actions_planned=[], actions_completed=[], root_cause="", closed_at=None, verified_at=None, effectiveness_verified=False.

### Step 2: Manage PDCA Phase Transitions
Valid transitions:
- PLAN -> DO (planning complete, begin execution)
- DO -> CHECK (execution complete, begin verification)
- CHECK -> ACT (proceed to standardize) or CHECK -> DO (rework needed)
- ACT -> PLAN (start new improvement cycle)

Invalid transitions are rejected with error listing allowed targets.

### Step 3: Manage Status Lifecycle
**OPEN -> IN_PROGRESS -> CLOSED -> VERIFIED**

| From | To | Notes |
|------|-----|-------|
| OPEN | IN_PROGRESS | Work begins |
| IN_PROGRESS | CLOSED, OPEN | CLOSED=done; OPEN=reopen |
| CLOSED | VERIFIED, IN_PROGRESS | VERIFIED=confirmed; IN_PROGRESS=reopen |
| VERIFIED | (none) | Terminal state |

### Step 4: Status Transition Details
- OPEN -> IN_PROGRESS: Sets status
- IN_PROGRESS -> CLOSED: Sets status, records closed_at
- CLOSED -> VERIFIED: **REQUIRES effectiveness_verified=True**; rejected if False
- Reopening to OPEN: Resets closed_at, verified_at, effectiveness_verified

### Step 5: Add Actions
- completed=False: Append to actions_planned
- completed=True: Append to actions_completed

### Step 6: Set Root Cause
Set capa.root_cause to provided text.

### Step 7: Check Overdue Status
- No target_date: Not overdue
- Status CLOSED or VERIFIED: Not overdue
- reference_date > target_date: Overdue

### Step 8: Generate Summary
Aggregate across list of CAPAs: total, open, in_progress, closed, verified, overdue, corrective, preventive, by_phase.

## 4. Logica de Decision

### PDCA Transitions
```
PLAN  -> [DO]
DO    -> [CHECK]
CHECK -> [ACT, DO]
ACT   -> [PLAN]
```

### Status Transitions
```
OPEN         -> [IN_PROGRESS]
IN_PROGRESS  -> [CLOSED, OPEN]
CLOSED       -> [VERIFIED, IN_PROGRESS]
VERIFIED     -> []  (terminal)
```

### Overdue Detection
```
IF target_date IS None THEN False
IF status IN (CLOSED, VERIFIED) THEN False
IF reference_date > target_date THEN True
ELSE False
```

## 5. Validacion

1. VERIFIED requires effectiveness_verified=True. Hard gate -- not optional.
2. VERIFIED is terminal: no further status transitions allowed.
3. Reopening resets timestamps (closed_at, verified_at, effectiveness_verified).
4. CHECK can loop back to DO (rework loop).
5. ACT -> PLAN starts new improvement cycle.
6. Overdue only applies to OPEN and IN_PROGRESS CAPAs.
7. Actions are append-only (no remove/edit).

## 6. Recursos Vinculados

| Resource | Path | When to Read |
|----------|------|-------------|
| Planning Procedure | `../../knowledge-base/gfsn/ref-14` | For CAPA integration with planning workflow |
| DE Procedure | `../../knowledge-base/gfsn/ref-15` | For defect elimination CAPA requirements |
| ISO 55002 Standards | `../../knowledge-base/standards/` | For Section 10.1, 10.2, 10.4 requirements |
| PDCA Reference | `references/pdca-lifecycle.md` | For PDCA phase and status transition diagrams |

## Common Pitfalls

1. **Skipping effectiveness verification**: CLOSED -> VERIFIED without effectiveness_verified=True is silently rejected.
2. **Confusing PDCA phase with status**: Phase (PLAN/DO/CHECK/ACT) and status (OPEN/IN_PROGRESS/CLOSED/VERIFIED) are independent.
3. **Attempting to modify VERIFIED CAPAs**: VERIFIED is terminal. Create a new CAPA if rework needed.
4. **Overdue false positives on closed items**: CLOSED and VERIFIED are correctly excluded from overdue checks.
5. **CHECK -> DO rework loop**: CHECK -> PLAN is not valid. Use CHECK -> DO for rework.
6. **Reopening clears verification**: Moving CLOSED -> IN_PROGRESS -> OPEN clears all verification data.

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2025-01-01 | VSC Skills Migration | Initial restructure from flat skill file |
