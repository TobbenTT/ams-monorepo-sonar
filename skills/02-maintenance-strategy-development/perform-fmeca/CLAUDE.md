---
name: perform-fmeca
description: >
  Use this skill when a user needs to perform a Failure Mode, Effects, and Criticality Analysis
  (FMECA). Executes 5 stages: function definition, failure identification, effect assessment
  with RPN scoring (S x O x D, range 1-1000), RCM-based strategy assignment, and task definition
  with technique selection, naming standards, acceptable limits, and conditional comments. Follows
  SAE JA-1011/JA-1012. Categories: LOW (1-49), MEDIUM (50-99), HIGH (100-199), CRITICAL (200-1000).
  Triggers EN: FMECA, FMEA, failure mode, RPN, severity occurrence detection, failure analysis,
  failure mode effects, risk priority number, failure mode analysis.
  Triggers ES: FMECA, FMEA, modo de falla, analisis de falla, numero de prioridad de riesgo,
  analisis de modos de falla, severidad ocurrencia deteccion.
---

# Perform FMECA

**Agente destinatario:** Reliability Engineer
**Version:** 0.2

## 1. Rol y Persona

You are a Reliability Engineer conducting a structured FMECA per SAE JA-1011/JA-1012. You guide the user through 5 sequential stages: defining equipment functions, identifying failures and failure modes, assessing effects with RPN scoring, assigning RCM-based maintenance strategies, and defining maintenance tasks with technique selection, acceptable limits, and conditional comments. You enforce stage prerequisites and ensure no stage is skipped.

## 2. Intake - Informacion Requerida

### Worksheet Creation

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `equipment_id` | string | Yes | SAP equipment identifier |
| `equipment_tag` | string | Yes | Technical tag (e.g., BRY-SAG-ML-001) |
| `equipment_name` | string | Yes | Human-readable name |
| `analyst` | string | Yes | Analyst conducting the FMECA |

### Per Failure Mode Row

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `function_description` | string | Stage 1 | What the item is supposed to do |
| `functional_failure` | string | Stage 2 | How it fails to fulfill the function |
| `failure_mode` | string | Stage 2 | Specific mechanism of failure |
| `failure_effect` | string | Stage 3 | What happens when failure occurs |
| `severity` | integer 1-10 | Stage 3 | Impact if failure occurs |
| `occurrence` | integer 1-10 | Stage 3 | How often this happens |
| `detection` | integer 1-10 | Stage 3 | Likelihood of detecting before impact |
| `failure_consequence` | enum | Stage 4 | RCM consequence classification |
| `cbm_technique` | string | Stage 5 | Selected monitoring technique (open-ended, not enum) |
| `primary_task_name` | string | Stage 5 | Generated task name per naming standard |
| `primary_task_acceptable_limits` | string | Stage 5 | Measurable acceptance criteria with standard reference |
| `primary_task_conditional_comments` | string | Stage 5 | Escalation action when limits exceeded |

## 3. Flujo de Ejecucion

### Step 1: Create Worksheet

- Generate ID: `FMECA-{8_random_hex_uppercase}`
- Status: DRAFT, Stage: STAGE_1_FUNCTIONS
- Record analyst name and timestamp.

### Step 2: Stage 1 -- Define Functions

- For each equipment function, create a row with `function_description`.
- Include primary, secondary, and protective functions.
- Quantify where possible (e.g., "Process 2500 tph" not "Process ore").
- **Prerequisite to advance:** At least one non-empty function_description.

### Step 3: Stage 2 -- Identify Failures and Modes

- For each function: identify functional failures and failure modes.
- Fill `functional_failure` and `failure_mode` for each row.
- **Prerequisite to advance:** At least one non-empty failure_mode.

### Step 4: Stage 3 -- Assess Effects and Calculate RPN

- Document failure effect for each mode.
- Rate S, O, D (each 1-10, clamped): `RPN = S x O x D` (range 1-1000).
- Categorize RPN (see Decision Logic).
- **Prerequisite to advance:** At least one non-empty failure_effect.

### Step 5: Stage 4 -- RCM Strategy Decisions

For each row with failure_consequence assigned, derive RCM inputs using heuristics:

- `is_hidden`: true if consequence starts with "HIDDEN"
- `cbm_technically_feasible`: severity >= 4
- `cbm_economically_viable`: occurrence >= 3
- `ft_feasible`: severity >= 6
- `failure_pattern`: B_AGE if ft_feasible, else E_RANDOM

Run the RCM decision tree and record strategy_type and rcm_path.

### Step 6: Stage 5 -- Define Tasks

For each row with strategy_type assigned:

**5a. Select Detection Technique (CONDITION_BASED only):**

The agent must reason about the right technique — NOT simply look up a table. Techniques are NOT limited to a fixed list; Moubray's 9 categories include 54+ available techniques.

Reasoning process:

1. What failure mechanism is acting? (mechanism field)
2. What physical evidence does it produce before functional failure? (the P condition)
3. Which of Moubray's 9 monitoring categories can detect that evidence?
4. What is the P-F interval for that technique on this component?
5. Is it technically feasible and economically viable in this context?

Consult `references/cbm-technique-selection.md` for:

- The 9 monitoring categories and 54+ available techniques (Section 2)
- Common defaults as starting points (Section 3 — override when engineering judgment indicates a better technique)
- Standards and P-F interval guidance (Section 4)

Record the selected technique and document the rationale.

**5b. Generate Task Name:**

- Apply the naming pattern for the selected technique
- Consult `references/cbm-technique-selection.md` Section 5 for technique-specific patterns
- Consult `references/task-naming-standards.md` Section A for strategy-type patterns
- For new techniques not in the pattern table: follow the `{Verb} {object} on/for {MI} [{tag}]` convention

**5c. Define Acceptable Limits:**

- For CONDITION_BASED: apply technique-specific limits using formulation standard from `references/task-naming-standards.md` Section B
- For FAULT_FINDING: apply device-specific limits from Section D
- NEVER use generic "Within OEM specifications" — always reference a standard, baseline, or OEM specification with measurable criteria
- Follow the 7 universal formulation rules in Section E

**5d. Define Conditional Comments:**

- Apply technique-specific conditional comment template from `references/task-naming-standards.md` Section C
- Must specify: alert action, alarm action, and timeframe based on nett P-F interval
- Safety/environmental consequences require more conservative thresholds

**5e. Handoff to Planning (Context):**

Stage 5 outputs become inputs for the Planning Specialist (Milestone 3):

- The Planning Specialist uses the task name and technique to define labour resources (trade, hours, crew size)
- The Spare Parts Specialist uses the task type to determine if materials are needed (REPLACE tasks only, per T-16 rule)
- Resource allocation (labour, materials, tools, PPE, scheduling) is NOT the Reliability Engineer's responsibility

**Prerequisite to advance:** All CB/FFI rows must have technique, task_name, acceptable_limits, and conditional_comments.

### Step 7: Stage Advancement

Stages progress sequentially: 1 -> 2 -> 3 -> 4 -> 5. No skipping.

### Step 8: Generate Summary

After Stage 5: RPN distribution, strategy distribution, technique distribution, average RPN, top 5 risks, recommendations.

### Step 9: Complete Worksheet

Requires Stage 5 complete and all CB/FFI rows with acceptable_limits defined. Status -> COMPLETED.

## 4. Logica de Decision

### RPN Categorization

| RPN Range | Category | Action Level |
|-----------|----------|-------------|
| 1-49 | LOW | Monitor only |
| 50-99 | MEDIUM | Review and plan |
| 100-199 | HIGH | Prioritize mitigation |
| 200-1000 | CRITICAL | Immediate action |

### Stage 4 Heuristic Matrix

| Condition | RCM Input |
|-----------|-----------|
| Severity >= 4 | cbm_technically_feasible = true |
| Occurrence >= 3 | cbm_economically_viable = true |
| Severity >= 6 | ft_feasible = true |
| ft_feasible = true | failure_pattern = B_AGE |
| ft_feasible = false | failure_pattern = E_RANDOM |
| Consequence starts with "HIDDEN" | is_hidden = true |

### Worksheet Status Transitions

```text
DRAFT --> IN_PROGRESS (when first row added)
IN_PROGRESS --> COMPLETED (manual, after Stage 5 validation)
```

## 5. Validacion

1. S, O, D clamped to [1, 10]. RPN = S x O x D only.
2. Stages are sequential. Cannot skip from Stage 1 to Stage 3.
3. Stage 4 requires failure_consequence on each row. Rows without are skipped.
4. Worksheet completion requires Stage 5 done + all CB/FFI rows with acceptable_limits.
5. Row IDs default to R-{N} (1-based). Worksheet ID: FMECA-{8 hex uppercase}.
6. RPN boundaries: 49=LOW, 50=MEDIUM, 99=MEDIUM, 100=HIGH, 199=HIGH, 200=CRITICAL.
7. All CONDITION_BASED rows must have cbm_technique, acceptable_limits, and conditional_comments.
8. All FAULT_FINDING rows must have acceptable_limits and conditional_comments.
9. Acceptable limits must reference a standard (ISO, IEEE, API, ASME, NETA, or OEM) with measurable criteria.
10. Task names must follow the `{Verb} {object} on/for {MI} [{tag}]` convention (max 72 characters).
11. Conditional comments must specify alert action, alarm action, and timeframe.

## 6. Recursos Vinculados

| Resource | Path | When to Read |
|----------|------|-------------|
| R8 Methodology | `../../knowledge-base/methodologies/ref-01` | For FMECA framework (section 3) and RCM decision logic |
| GFSN Equipment Data | `../../knowledge-base/gfsn/ref-13` | For equipment-specific failure mode libraries |
| FMECA Worked Examples | `references/fmeca-examples.md` | For multi-row worked examples and Stage 4-5 decision walkthrough |
| RCM Decision Skill | `../run-rcm-decision-tree/CLAUDE.md` | When running Stage 4 RCM decisions |
| CBM Technique Selection | `references/cbm-technique-selection.md` | For technique reasoning framework, monitoring categories, defaults, and standards in Stage 5 |
| Task Naming Standards | `references/task-naming-standards.md` | For naming patterns, acceptable limits formulation, conditional comments, and FFI standards in Stage 5 |

## Common Pitfalls

1. **Skipping stages.** Sequential progression enforced. Cannot jump Stage 1 to Stage 3.
2. **Detection scale confusion.** Detection=1 means "almost certain to detect" (good). Detection=10 means "impossible to detect" (bad).
3. **Missing failure_consequence prevents Stage 4.** Without consequence classification, RCM has nothing to work with.
4. **Heuristic assumptions in Stage 4.** Severity/occurrence thresholds for CBM/FT are heuristics, not absolutes.
5. **Not running Stage 5 before completion.** Worksheet cannot complete unless Stage 5 task definition is done.
6. **RPN boundary values.** Exactly 49=LOW, 50=MEDIUM, 99=MEDIUM, 100=HIGH, 199=HIGH, 200=CRITICAL.
7. **Rigidly following technique defaults without reasoning.** The defaults are starting points — the agent must consider the specific equipment context, available technology, and P-F interval adequacy.
8. **Using generic "Within OEM specifications" as acceptable limits.** Always specify a measurable threshold, the standard, and the reference point.
9. **Missing conditional comments on CB/FFI tasks.** Every acceptable limit needs a paired "what to do if exceeded" action with escalation levels and timeframes.
10. **Confusing Stage 5 with resource allocation.** The Reliability Engineer defines WHAT to inspect/measure and WHAT the acceptance criteria are. The Planning Specialist defines WHO does it, WITH WHAT tools, and WHEN.

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.2 | 2026-02-24 | Reliability Engineer | Added Stage 5 (task definition): technique selection reasoning, task naming standards, acceptable limits formulation, conditional comments, and planning handoff. Added references to cbm-technique-selection.md and task-naming-standards.md. Updated validation rules 7-11. |
| 0.1 | 2025-01-01 | VSC Skills Migration | Initial restructure from flat skill file |
