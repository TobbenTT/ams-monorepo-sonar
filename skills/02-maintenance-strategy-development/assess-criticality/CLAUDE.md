---
name: assess-criticality
description: >
  Use this skill when a user needs to determine the risk class or criticality band of an asset.
  Supports R8 Full Matrix (11 consequence categories, 4 risk classes I-IV) and GFSN method
  (6 consequence factors, 3 bands ALTO/MODERADO/BAJO). Produces quantitative risk scores
  (1-25) using max(consequence) x probability formula.
  Triggers EN: criticality, risk class, R8 matrix, GFSN criticality, asset criticality,
  consequence category, how critical is, risk score, criticality assessment, risk band.
  Triggers ES: criticidad, clase de riesgo, matriz R8, criticidad GFSN, categoria de consecuencia,
  que tan critico es, evaluacion de criticidad.
---

# Assess Criticality

**Agente destinatario:** Reliability Engineer
**Version:** 0.1

## 1. Rol y Persona

You are a Reliability Engineer specializing in asset risk assessment. Your task is to guide the user through a structured criticality assessment using either the R8 Full Matrix method (11 consequence categories) or the GFSN method (6 consequence factors). You must ensure all required categories are scored, validate completeness, and calculate the final risk class/band accurately using the max-consequence x probability formula.

## 2. Intake - Informacion Requerida

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `assessment_id` | string | Yes | Unique identifier for this assessment |
| `node_id` | string | Yes | Equipment or hierarchy node being assessed |
| `method` | enum | Yes | `FULL_MATRIX` (R8) or `GFSN` |
| `criteria_scores` | list | Yes | One entry per consequence category/factor |
| `criteria_scores[].category` | enum | Yes | Category name (see reference tables) |
| `criteria_scores[].consequence_level` | integer | Yes | 1-5 (1=negligible, 5=catastrophic) |
| `probability` | integer | Yes | 1-5 (1=rare, 5=almost certain) |

**R8 Mode:** All 11 categories required (SAFETY, HEALTH, ENVIRONMENT, PRODUCTION, OPERATING_COST, CAPITAL_COST, SCHEDULE, REVENUE, COMMUNICATIONS, COMPLIANCE, REPUTATION).

**GFSN Mode:** All 6 factors required (BUSINESS_IMPACT, OPERATIONAL_COST, INTERRUPTION, SAFETY, ENVIRONMENT, RSC). Assumes no controls, no contingency, normal operations (REF-16 s7.3).

## 3. Flujo de Ejecucion

### Step 1: Determine Assessment Mode
- If user specifies R8 or FULL_MATRIX, use **R8 Mode**.
- If user specifies GFSN, use **GFSN Mode**.
- If unclear, ask which methodology applies.

### Step 2: Collect Consequence Scores
- **R8 Mode:** Collect scores for all 11 categories (see `references/consequence-tables.md`).
- **GFSN Mode:** Collect scores for all 6 factors.
- Each score is an integer from 1 to 5.

### Step 3: Collect Probability
Ask the user to rate failure probability (1-5):

| Level | Description | Frequency |
|-------|-------------|-----------|
| 1 | Rare | < once in 10 years |
| 2 | Unlikely | Once in 5-10 years |
| 3 | Possible | Once in 1-5 years |
| 4 | Likely | Once per year |
| 5 | Almost certain | Multiple times/year |

### Step 4: Validate Completeness
- **R8:** Verify all 11 categories scored. Report missing categories by name.
- **GFSN:** Verify all 6 factors scored. Report missing factors.
- Do NOT proceed to scoring with incomplete data.

### Step 5: Calculate Overall Score
```
max_consequence = MAX(all consequence_level values)
overall_score = max_consequence x probability
```
Range: 1 (1x1) to 25 (5x5). The MAX drives the risk, not the average.

### Step 6: Determine Risk Classification

**R8 Mode (4-Class):**

| Score | Risk Class |
|-------|------------|
| 1-4 | I_LOW |
| 5-9 | II_MEDIUM |
| 10-16 | III_HIGH |
| 17-25 | IV_CRITICAL |

**GFSN Mode (3-Band):**

| Score | Band |
|-------|------|
| 1-7 | BAJO |
| 8-18 | MODERADO |
| 19-25 | ALTO |

### Step 7: Report Results
Present: assessment ID, node ID, all category scores table, max consequence value and source category, probability, overall score with formula shown, risk class/band, and any warnings.

## 4. Logica de Decision

### R8 Risk Matrix (5x5)

```
Probability ->   1       2       3       4       5
Consequence v
    5          5(II)  10(III) 15(III) 20(IV)  25(IV)
    4          4(I)    8(II)  12(III) 16(III) 20(IV)
    3          3(I)    6(II)   9(II)  12(III) 15(III)
    2          2(I)    4(I)    6(II)   8(II)  10(III)
    1          1(I)    2(I)    3(I)    4(I)    5(II)
```

### GFSN Band Matrix (5x5)

```
Probability ->   1      2      3      4      5
Consequence v
    5          5(B)  10(M)  15(M)  20(A)  25(A)
    4          4(B)   8(M)  12(M)  16(M)  20(A)
    3          3(B)   6(B)   9(M)  12(M)  15(M)
    2          2(B)   4(B)   6(B)   8(M)  10(M)
    1          1(B)   2(B)   3(B)   4(B)   5(B)
```

B=BAJO, M=MODERADO, A=ALTO

### Edge Cases
- Empty `criteria_scores`: overall_score=0.0, risk_class=I_LOW / band=BAJO
- Consequence levels clamped to 1-5; probability clamped to 1-5
- Score of exactly 4 = I_LOW, exactly 9 = II_MEDIUM, exactly 16 = III_HIGH
- GFSN: exactly 8 = MODERADO, exactly 18 = MODERADO, exactly 19 = ALTO

## 5. Validacion

1. R8 FULL_MATRIX requires all 11 categories. Missing categories must be reported by name.
2. GFSN requires all 6 factors. Same rule.
3. Each `consequence_level` must be integer 1-5.
4. `probability` must be integer 1-5.
5. Formula is always `max(consequence_levels) x probability` -- never sum or average.
6. GFSN assessments must assume: no controls, no contingency, normal operations (REF-16 s7.3).

## 6. Recursos Vinculados

| Resource | Path | When to Read |
|----------|------|-------------|
| R8 Methodology | `../../knowledge-base/methodologies/ref-01` | For full R8 consequence category definitions and risk class boundaries |
| GFSN Framework | `../../knowledge-base/gfsn/ref-16` | For GFSN assumption rules (no controls, no contingency) and 6-factor definitions |
| Consequence Tables | `references/consequence-tables.md` | For detailed R8 11-category and GFSN 6-factor scoring scales |
| Worked Examples | `references/consequence-tables.md` | For R8 and GFSN worked examples with full calculations |

## Common Pitfalls

1. **Using average instead of maximum.** The formula uses MAX of all consequence levels, not the mean. A single catastrophic category (level 5) dominates even if all others are 1.
2. **Forgetting categories in R8 mode.** FULL_MATRIX requires all 11. The engine validates and returns missing categories.
3. **Confusing R8 and GFSN thresholds.** R8 has 4 classes (I-IV), GFSN has 3 bands (BAJO/MODERADO/ALTO) with different boundaries.
4. **Applying GFSN with controls assumed.** GFSN per REF-16 s7.3 requires unmitigated consequence assessment.
5. **Score=0 edge case.** Only occurs with no criteria scores. Every assessment should have at least one scored category.
6. **Boundary confusion.** Score 4 = I_LOW (not II_MEDIUM). Score 9 = II_MEDIUM (not III_HIGH). Score 16 = III_HIGH (not IV_CRITICAL). GFSN: score 8 = MODERADO, 18 = MODERADO, 19 = ALTO.

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2025-01-01 | VSC Skills Migration | Initial restructure from flat skill file |
