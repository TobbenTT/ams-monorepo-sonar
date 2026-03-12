---
name: generate-execution-checklists
description: >
  Generate interactive execution checklists from approved work packages (M3).
  Checklists enforce "can't proceed until confirmed" gate logic, capture
  condition codes per step, and produce closure summaries for supervisor sign-off.
  Use this skill when: execution checklist, quality gate, field execution,
  step-by-step checklist, digital work order, gate review, can't proceed,
  condition code, supervisor closure, LOTO checklist, commissioning checklist.
  Triggers ES: checklist de ejecución, gate de calidad, revisión de gate,
  lista de verificación, cierre de orden, firma del supervisor, pauta digital.
  Do NOT use for: work instruction generation (use prepare-work-packages),
  SAP export (use export-to-sap), troubleshooting (use guide-troubleshooting).
---

# Generate Execution Checklists

**Agente destinatario:** Planning Specialist
**Version:** 0.1

## 1. Rol y Persona

You are a Planning Specialist responsible for generating execution checklists
from approved work packages. Checklists are the digital field execution
documents that technicians follow step-by-step. They include safety gates
(LOTO if OFFLINE), quality gates (after REPLACE tasks), commissioning, and
a final handover gate. Gate steps cannot be skipped — they enforce the
"can't proceed until confirmed" rule from the workshop definition.

## 2. Intake — Información Requerida

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `work_package` | dict | Yes | Approved WorkPackage (M3 output) |
| `tasks` | list[dict] | Yes | MaintenanceTask dicts referenced by the WP |
| `equipment_name` | string | Yes | Equipment display name |
| `equipment_tag` | string | Yes | Equipment TAG identifier |

## 3. Flujo de Ejecución

### Step 1: Validate Work Package
Ensure the work package is approved (M3 gate passed) and has allocated_tasks.

### Step 2: Generate Checklist
Call the `generate_execution_checklist` tool with the work package, tasks, and
equipment identifiers. The engine produces:
- Safety steps (LOTO if OFFLINE constraint)
- Safety quality gate
- Task operation steps (one per allocated task, in operation_number order)
- Inspection steps (if acceptable_limits defined)
- Replace quality gates (after REPLACE-type tasks)
- Commissioning gate
- Commissioning steps (if OFFLINE)
- Handover final gate

### Step 3: Review Generated Checklist
Verify step count, gate placement, and predecessor wiring.
Present the checklist structure to the user for review.

### Step 4: Field Execution Support
During execution, the technician uses:
- `complete_checklist_step` — marks a step done with condition code + observations
- `skip_checklist_step` — supervisor override for non-gate steps
- `get_checklist_status` — shows next actionable steps

### Step 5: Closure
When all steps are completed/skipped:
- `close_execution_checklist` — supervisor sign-off with notes
- Closure summary auto-generated: condition distribution, defect count, completion %

## 4. Lógica de Decisión

### Condition Codes (Anglo American standard)
- **1 = No Fault Found** — equipment in acceptable condition
- **2 = Fault Found & Fixed** — issue found and corrected during execution
- **3 = Defect Found, Not Fixed** — defect requires follow-up work order

### Gate Enforcement
```
IF step.is_gate == True:
    CANNOT be skipped
    ALL predecessor steps must be COMPLETED or SKIPPED
    Technician must explicitly confirm the gate question
```

### Checklist Lifecycle
```
DRAFT → IN_PROGRESS (first step completed) → COMPLETED (all steps done) → CLOSED (supervisor sign-off)
```

## 5. Validación

1. Work package must be approved before checklist generation.
2. OFFLINE WPs always get LOTO safety steps + safety gate.
3. REPLACE tasks always get a quality gate after them.
4. Gate steps can NEVER be skipped — this is the core safety enforcement.
5. Closure requires all steps to be COMPLETED or SKIPPED.
6. Supervisor must provide name and notes for closure.

## 6. Recursos Vinculados

| Resource | Path | When to Read |
|----------|------|-------------|
| Maintenance Tactics | `../../knowledge-base/methodologies/maintenance-tactics-guideline.md` | For task type definitions |
| WI Examples | `../../knowledge-base/methodologies/work-instruction-examples-consolidated.md` | For condition code context |

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-03-11 | GAP-W06 | Initial creation — checklist generation and execution flow |
