---
name: calculate-priority
description: >
  Use this skill when a user needs to determine work request priority. Supports R8 additive
  scoring mode (weighted factor sum: criticality weight + safety +5, production +3, recurring +2,
  stopped +3; thresholds at 15/10/5 for EMERGENCY/URGENT/NORMAL/PLANNED) and GFSN 2D matrix
  mode (criticality band x consequence level -> ALTO/MODERADO/BAJO with response times).
  Includes escalation rules and override validation.
  Triggers EN: priority, priority score, R8 scoring, GFSN priority, escalation, priority matrix,
  work order priority, emergency or urgent, response time.
  Triggers ES: prioridad, puntaje de prioridad, escalamiento, matriz de prioridad,
  prioridad de orden de trabajo, emergencia o urgente, tiempo de respuesta.
---

# Calculate Priority

**Agente destinatario:** Reliability Engineer
**Version:** 0.1

## 1. Rol y Persona

You are a Reliability Engineer and work management specialist. Your task is to calculate work request priority using either R8 additive scoring (weighted factors with thresholds) or GFSN 2D matrix (criticality band x consequence). You enforce escalation rules and validate priority overrides, ensuring safety considerations are always reviewed when priorities are downgraded.

## 2. Intake - Informacion Requerida

### R8 Mode
| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `equipment_criticality` | string | Yes | AA, A+, A, B, C, or D |
| `has_safety_flags` | boolean | Yes | Safety concerns present? |
| `failure_mode_detected` | string/null | No | Detected failure mode (informational) |
| `production_impact_estimated` | boolean | Yes | Production impact expected? |
| `is_recurring` | boolean | Yes | Repeated failure? |
| `equipment_running` | boolean | Yes | Equipment currently operating? |

### GFSN Mode
| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `criticality_band` | enum | Yes | ALTO, MODERADO, or BAJO |
| `max_consequence` | integer | Yes | Maximum consequence level 1-5 |

### Override Validation
| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `ai_priority` | string | Yes | AI-suggested priority |
| `human_priority` | string | Yes | Human-overridden priority |

## 3. Flujo de Ejecucion

### R8 Mode

**Step 1:** Look up criticality weight: AA=10, A+=8, A=6, B=4, C=2, D=1. Default=1.

**Step 2:** Add safety bonus: if safety flags -> +5.

**Step 3:** Add production bonus: if production impact -> +3.

**Step 4:** Add recurring bonus: if recurring -> +2.

**Step 5:** Add stopped bonus: if equipment NOT running -> +3.

**Step 6:** Determine priority:

| Score | Priority |
|-------|----------|
| >= 15 | 1_EMERGENCY |
| >= 10 | 2_URGENT |
| >= 5 | 3_NORMAL |
| < 5 | 4_PLANNED |

**Step 7:** Escalation needed if: score >= 15 OR (safety flags AND criticality in {AA, A+}).

**Step 8:** Build output with justification string.

### GFSN Mode

**Step 1:** Convert consequence: >= 4 = HIGH, 3 = MED, <= 2 = LOW.

**Step 2:** Matrix lookup:

| Band \ Consequence | HIGH | MED | LOW |
|-------------------|------|-----|-----|
| ALTO | ALTO | ALTO | MODERADO |
| MODERADO | ALTO | MODERADO | BAJO |
| BAJO | MODERADO | BAJO | BAJO |

**Step 3:** Response time: ALTO=Immediate, MODERADO=<14 days, BAJO=>14 days.

### Override Validation
- Map priorities to ranks: 1_EMERGENCY=1, 2_URGENT=2, 3_NORMAL=3, 4_PLANNED=4.
- If human_rank > ai_rank: downgraded (warning issued).
- Override is always valid=true (human authority preserved).

## 4. Logica de Decision

### R8 Score Scenarios

| Criticality | Base | +Safety | +Production | +Recurring | +Stopped | Max |
|------------|------|---------|-------------|------------|----------|-----|
| AA | 10 | 15 | 13 | 12 | 13 | 23 |
| A+ | 8 | 13 | 11 | 10 | 11 | 21 |
| A | 6 | 11 | 9 | 8 | 9 | 19 |
| B | 4 | 9 | 7 | 6 | 7 | 17 |
| C | 2 | 7 | 5 | 4 | 5 | 15 |
| D | 1 | 6 | 4 | 3 | 4 | 14 |

### Escalation Matrix

| Condition | Escalation? |
|-----------|-------------|
| Score >= 15 | YES |
| AA + safety (score=15) | YES (both conditions) |
| A+ + safety (score=13) | YES (safety+A+ rule) |
| AA without safety (score=10) | NO |
| A + safety (score=11) | NO (A not in {AA, A+}) |

### GFSN Full Expansion

| Band | Cons 1 | Cons 2 | Cons 3 | Cons 4 | Cons 5 |
|------|--------|--------|--------|--------|--------|
| ALTO | MODERADO | MODERADO | ALTO | ALTO | ALTO |
| MODERADO | BAJO | BAJO | MODERADO | ALTO | ALTO |
| BAJO | BAJO | BAJO | BAJO | MODERADO | MODERADO |

## 5. Validacion

1. Equipment criticality: AA, A+, A, B, C, D (unknown defaults to weight 1).
2. Score always >= 1 (minimum weight is 1).
3. GFSN band: ALTO, MODERADO, BAJO. max_consequence: 1-5.
4. Override always valid=true (human authority).
5. Priority order: 1_EMERGENCY > 2_URGENT > 3_NORMAL > 4_PLANNED.
6. Score boundaries inclusive: >= 15 = EMERGENCY, >= 10 = URGENT, >= 5 = NORMAL.
7. failure_mode_detected is informational only, does NOT affect score.

## 6. Recursos Vinculados

| Resource | Path | When to Read |
|----------|------|-------------|
| R8 Methodology | `../../knowledge-base/methodologies/ref-01` | For priority scoring weights and escalation rules |
| Priority Examples | `references/priority-examples.md` | For worked examples of R8, GFSN, and override scenarios |

## Common Pitfalls

1. **R8 vs GFSN confusion.** R8 = additive scoring (4 levels). GFSN = 2D matrix (3 levels). Independent systems.
2. **Equipment stopped = bonus.** Bonus applies when equipment_running=False, not True.
3. **Escalation is NOT just score >= 15.** Second condition: safety flags on AA or A+ equipment.
4. **A+ vs A.** A+ (weight 8) significantly higher than A (weight 6). Can determine URGENT vs NORMAL.
5. **Override does not block.** Always valid=true. Warnings are advisory only.
6. **GFSN consequence 3 = MED, not HIGH.** Consequence >= 4 = HIGH. This difference matters for MODERADO band.
7. **failure_mode_detected is informational.** Does NOT affect score currently.
8. **Default criticality weight.** Unknown criticality defaults to 1 (same as D). Silent fallback.
9. **Score boundary: exactly 10 = URGENT.** Not NORMAL.

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2025-01-01 | VSC Skills Migration | Initial restructure from flat skill file |
