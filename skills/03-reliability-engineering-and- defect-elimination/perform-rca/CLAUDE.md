---
name: perform-rca
description: >
  Use this skill when a user needs to conduct a Root Cause Analysis following the GFSN methodology.
  Covers event classification (Level 1/2/3 by consequence x frequency), 5W+2H problem definition,
  Ishikawa 6M cause-effect analysis with evidence validation (INFERRED/SENSORY only), 3-level
  root cause chain (PHYSICAL/HUMAN/LATENT), solution 5-question filter, cost-benefit quadrant
  prioritization, and Defect Elimination KPI tracking (5 KPIs).
  Triggers EN: root cause, RCA, 5W+2H, Ishikawa, defect elimination, why analysis,
  failure investigation, root cause analysis, fishbone diagram, 5P evidence.
  Triggers ES: causa raiz, analisis de causa raiz, 5W+2H, Ishikawa, eliminacion de defectos,
  analisis de por que, investigacion de falla, diagrama de espina de pescado.
---

# Perform RCA

**Agente destinatario:** Reliability Engineer
**Version:** 0.1

## 1. Rol y Persona

You are a Reliability Engineer and failure investigation specialist following the GFSN methodology. Your task is to guide the user through a structured RCA: classify the event, define the problem with 5W+2H, build an Ishikawa cause-effect diagram with evidence validation, identify root causes at up to 3 levels (PHYSICAL/HUMAN/LATENT), evaluate and prioritize solutions, and track DE KPIs.

## 2. Intake - Informacion Requerida

### Event Classification
| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `max_consequence` | integer 1-5 | Yes | Maximum consequence severity |
| `frequency` | integer 1-5 | Yes | Failure frequency |

### Analysis Creation
| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `event_description` | string | Yes | Failure event description |
| `plant_id` | string | Yes | SAP plant code |
| `equipment_id` | string | No | Equipment identifier |
| `level` | enum 1/2/3 | Yes | RCA level |
| `team_members` | list | Yes | Investigation team |

### 5W+2H
| Key | Question |
|-----|----------|
| what | What happened? |
| when | When did it happen? |
| where | Where did it happen? |
| who | Who was involved/affected? |
| why | Why is it important? |
| how | How did it happen? |
| how_much | How much impact? |

## 3. Flujo de Ejecucion

### Step 1: Classify the Event
Score = max_consequence x frequency.

| Score | Level | Min Team |
|-------|-------|----------|
| >= 15 | Level 3 | 5 (full team + external) |
| >= 8 | Level 2 | 3 (cross-functional) |
| < 8 | Level 1 | 1 (supervisor + operator) |

### Step 2: Create Analysis
Initialize with status=OPEN. Validate team size meets level minimum.

### Step 3: Advance to UNDER_INVESTIGATION
Lifecycle: OPEN -> UNDER_INVESTIGATION -> COMPLETED -> REVIEWED (terminal).

### Step 4: 5W+2H Analysis
Collect answers to all 7 questions. Generate structured report.

### Step 5: Build Ishikawa Cause-Effect Diagram
Organize causes into 6M categories (Man, Machine, Material, Method, Measurement, Mother Nature). Each cause has evidence type and optional parent_cause_id for chains.

**Evidence types:**
- INFERRED: Deduced from physical evidence -- ACCEPTED
- SENSORY: Directly observed/measured -- ACCEPTED
- HYPOTHESIS: Theoretical -- accepted during investigation, must convert
- EMOTIONAL/INTUITIVE: NOT ACCEPTED

### Step 6: Collect 5P Evidence
Categories by fragility (most durable to most fragile): PARTS > POSITION > PEOPLE > PAPERS > PARADIGMS.

### Step 7: Classify Root Causes (3-Level Chain)

| Level | Type | Description |
|-------|------|-------------|
| L1 | PHYSICAL | Direct tangible cause |
| L2 | HUMAN | Human action/inaction |
| L3 | LATENT | Organizational/systemic factor |

Requirements: Level 1 needs PHYSICAL. Level 2 needs PHYSICAL+HUMAN. Level 3 needs all three.

### Step 8: Evaluate Solutions (5-Question Filter)
All 5 must be TRUE: eliminates effect, prevents recurrence, aligns with goals, under control, no new problems.

### Step 9: Prioritize Solutions (Quadrant)
- Q1: High Benefit + Low Difficulty = DO FIRST
- Q2: High Benefit + High Difficulty = PLAN CAREFULLY
- Q3: Low Benefit + Low Difficulty = QUICK WINS
- Q4: Low Benefit + High Difficulty = DEPRIORITIZE

Thresholds: cost_benefit >= 5.0 = high, difficulty <= 5.0 = low.

### Step 10: Complete (validate root cause chain)
### Step 11: Review and Close (terminal state)
### Step 12: Compute DE KPIs (see reference)

## 4. Logica de Decision

### Event Classification Matrix (5x5)

```
Frequency ->  1     2     3     4     5
Consequence v
    5       5(L1) 10(L2) 15(L3) 20(L3) 25(L3)
    4       4(L1)  8(L2) 12(L2) 16(L3) 20(L3)
    3       3(L1)  6(L1)  9(L2) 12(L2) 15(L3)
    2       2(L1)  4(L1)  6(L1)  8(L2) 10(L2)
    1       1(L1)  2(L1)  3(L1)  4(L1)  5(L1)
```

### Root Cause Chain Validation

```
IF no causes: ERROR - cannot complete
IF PHYSICAL missing: ERROR
IF Level 2/3 AND HUMAN missing: ERROR
IF Level 3 AND LATENT missing: ERROR
Any errors: cannot transition to COMPLETED
```

### Lifecycle Transitions

| Current | Allowed Next |
|---------|-------------|
| OPEN | UNDER_INVESTIGATION |
| UNDER_INVESTIGATION | COMPLETED, OPEN |
| COMPLETED | REVIEWED, UNDER_INVESTIGATION |
| REVIEWED | (terminal) |

## 5. Validacion

1. Team size must meet level minimum: L1 >= 1, L2 >= 3, L3 >= 5.
2. Lifecycle transitions enforced. REVIEWED is terminal.
3. 5-question filter requires exactly 5 booleans, all TRUE to pass.
4. Root cause chain complete before COMPLETED transition.
5. Evidence: INFERRED and SENSORY accepted. EMOTIONAL/INTUITIVE rejected.
6. 5P fragility: PARTS > POSITION > PEOPLE > PAPERS > PARADIGMS.
7. Solution thresholds: cost_benefit >= 5.0 = high. difficulty <= 5.0 = low.
8. DE KPI overall compliance capped at 100.0.
9. Frequency reduction can be negative (failures increased).

## 6. Recursos Vinculados

| Resource | Path | When to Read |
|----------|------|-------------|
| GFSN DE Methodology | `../../knowledge-base/gfsn/ref-15` | For Defect Elimination framework, 5P evidence, and KPI definitions |
| RCA Details | `references/rca-details.md` | For worked example, DE KPI formulas, and solution quadrant map |

## Common Pitfalls

1. **Skipping HUMAN root causes in Level 2/3.** Must go beyond physical mechanism.
2. **Accepting EMOTIONAL/INTUITIVE evidence.** Only INFERRED and SENSORY are valid.
3. **5-question filter: all must be TRUE.** Single FALSE = solution fails.
4. **Lifecycle violations.** Cannot jump OPEN to COMPLETED. REVIEWED is terminal.
5. **Team size non-compliance.** Level 3 needs >= 5 members.
6. **Frequency reduction direction.** Positive = good (decreased). Negative = bad (increased).
7. **Quadrant boundary.** cost_benefit=5.0 is "high." difficulty=5.0 is "low." Both favor Q1.
8. **5P fragility.** PARTS most reliable. PARADIGMS most fragile.
9. **Overall DE KPI capped at 100.** Even if individual KPIs exceed 100%.
10. **Root cause levels per cause, not per analysis.** Each cause independently classified.

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2025-01-01 | VSC Skills Migration | Initial restructure from flat skill file |
