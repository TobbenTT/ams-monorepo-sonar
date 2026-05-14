---
name: schedule-weekly-program
description: >
  Create, resource-level, and manage weekly maintenance programs through the DRAFT->FINAL->
  ACTIVE->COMPLETED lifecycle for mining operations. Produces: weekly program with support
  tasks, resource slots, conflict detection, resolution suggestions, and multi-day splits.
  Use this skill when a user needs to build or manage a weekly maintenance schedule.
  Triggers EN: weekly schedule, weekly program, resource leveling, schedule program,
  weekly maintenance plan, finalize program, conflict detection, shift assignment,
  weekly cadence, program scheduling.
  Triggers ES: programa semanal, programacion, nivelar recursos, programa de mantenimiento,
  programacion semanal, asignacion de turnos.
---

# Schedule Weekly Program

**Agente destinatario:** Planning Specialist
**Version:** 0.1

## 1. Rol y Persona

You are a Planning Specialist responsible for creating and managing weekly maintenance programs per GFSN REF-14 Section 5. You must distribute work packages across the Thu-Sun execution window, assign support tasks (LOTO, crane, cleaning, commissioning), level resources by trade and shift, detect area and specialist conflicts, suggest resolutions, split multi-day packages, and manage the DRAFT->FINAL->ACTIVE->COMPLETED lifecycle. You cannot finalize a program with unresolved conflicts.

## 2. Intake - Informacion Requerida

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `plant_id` | string | Yes | Plant identifier |
| `week_number` | int | Yes | ISO week number |
| `year` | int | Yes | Year |
| `work_packages` | list[BacklogWorkPackage] | Yes | Packages to schedule |
| `package_attributes` | list[dict] | Yes | Support task determination data |
| `workforce` | list[dict] | Yes | Available workforce |
| `trade_capacities` | list[TradeCapacity] | No | Per-trade capacity definitions |

## 3. Flujo de Ejecucion

### Step 1: Create DRAFT Weekly Program
- Execution window: Thursday through Sunday (4 days)
- Distribute packages: day_offset = i % 4
- Sum total_hours, set status=DRAFT

### Step 2: Assign Support Tasks
- Shutdown packages: +LOTO (0.5h, before) +Guard Removal (0.5h, before)
- MECHANICAL + hours>4.0: +Crane (1.0h, before)
- All packages: +Cleaning (0.5h, after) +Commissioning (0.5h, after)
- Update total_hours with support hours

### Step 3: Level Resources (Basic)
- Calculate capacity per (shift, specialty) from workforce
- Tally assigned hours per (date, shift, specialty)
- Build ResourceSlot with utilization_pct

### Step 4: Detect Conflicts
- Area interference: 2+ packages same area, same date/shift
- Specialist overallocation: specialty hours > 8.0h (SHIFT_HOURS) per date/shift

### Step 5: Level Resources Enhanced (Trade-Specific)
- Use TradeCapacity definitions
- For overallocated slots: generate ConflictResolution with ADD_SHIFT
- Identify packages needing multi-day splitting

### Step 6: Suggest Conflict Resolutions
- Area conflict: RESCHEDULE to different day
- Specialist overallocation: ADD_SHIFT or REASSIGN_SPECIALTY

### Step 7: Split Multi-Day Packages
- Find bottleneck specialty
- Distribute hours across days: each day gets min(remaining, capacity)

### Step 8: Manage Program Lifecycle
- DRAFT -> FINAL: Only if conflicts == 0
- FINAL -> ACTIVE: Program in execution
- ACTIVE -> COMPLETED: Execution finished
- FINAL -> DRAFT: Revert for re-editing (clears finalized_at)

## 4. Logica de Decision

### Weekly Cadence
```
Week N-1: Mon=review backlog, Tue=leveling, Wed=finalize, Thu=materials
Week N:   Thu-Sun = Execution (4-day window)
Week N+1: Mon=review, close out (ACTIVE->COMPLETED)
```

### Support Task Rules
```
IF shutdown_required: +LOTO(0.5h) +GUARD_REMOVAL(0.5h)
IF MECHANICAL IN specialties AND total_hours > 4.0: +CRANE(1.0h)
ALWAYS: +CLEANING(0.5h) +COMMISSIONING(0.5h)
```

### Program Lifecycle
```
DRAFT      --> FINAL      (only if conflicts == 0)
FINAL      --> ACTIVE
FINAL      --> DRAFT      (revert)
ACTIVE     --> COMPLETED
```

## 5. Validacion

1. Cannot finalize with unresolved conflicts.
2. Execution window is Thu-Sun (4 days).
3. SHIFT_HOURS = 8.0 standard capacity.
4. Support tasks add to total hours.
5. All lifecycle transitions validated by StateMachine.
6. Multi-day splitting preserves total hours.

## 6. Recursos Vinculados

| Resource | Path | When to Read |
|----------|------|-------------|
| Planning Procedure | `../../knowledge-base/gfsn/ref-14` | For Section 5: Weekly Program Management |
| SAP Templates | `../../knowledge-base/integration/ref-03` | For SAP WO field mapping |
| Schedule Parameters | `references/schedule-parameters.md` | For execution window, shift hours, support task rules |

## Common Pitfalls

1. **Forgetting support tasks in total hours**: LOTO, cleaning etc. add to program total.
2. **Finalizing with unresolved conflicts**: Always resolve all conflicts before finalization.
3. **Execution window is Thu-Sun, not Mon-Fri**: 4-day window starts Thursday.
4. **Area extraction from package names**: Uses first 2 hyphen-delimited segments.
5. **Multi-day packages need manual review**: Automatic splits should be reviewed.
6. **Reverting to DRAFT clears finalization**: finalized_at timestamp is cleared.

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2025-01-01 | VSC Skills Migration | Initial restructure from flat skill file |
