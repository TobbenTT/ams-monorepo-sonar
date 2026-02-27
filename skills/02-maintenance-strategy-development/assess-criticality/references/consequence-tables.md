# Assess Criticality - Reference Tables

## R8 Mode: 11 Consequence Categories (Full Scoring Scale)

| # | Category | 1 (Negligible) | 2 (Minor) | 3 (Moderate) | 4 (Major) | 5 (Catastrophic) |
|---|----------|-----------------|-----------|---------------|-----------|-------------------|
| 1 | SAFETY | First aid | Medical treatment | Lost time injury | Permanent disability | Fatality |
| 2 | HEALTH | No impact | Minor exposure | Reversible health effect | Chronic condition | Life-threatening |
| 3 | ENVIRONMENT | No release | Minor contained | Moderate on-site | Major off-site | Catastrophic |
| 4 | PRODUCTION | < 1 hour | 1-8 hours | 8-24 hours | 1-7 days | > 7 days |
| 5 | OPERATING_COST | < $1K | $1K-$10K | $10K-$100K | $100K-$1M | > $1M |
| 6 | CAPITAL_COST | < $10K | $10K-$50K | $50K-$250K | $250K-$1M | > $1M |
| 7 | SCHEDULE | No impact | Minor delay | Moderate delay | Major delay | Project failure |
| 8 | REVENUE | No impact | Minor | Moderate | Significant | Critical |
| 9 | COMMUNICATIONS | None | Minor complaint | Media attention | Regulatory inquiry | Public crisis |
| 10 | COMPLIANCE | No impact | Minor non-conformance | Moderate violation | Major violation | License revocation |
| 11 | REPUTATION | No impact | Local impact | Regional impact | National impact | International impact |

## GFSN Mode: 6 Consequence Factors

| # | Category | Type | Description |
|---|----------|------|-------------|
| 1 | BUSINESS_IMPACT | Economic | Revenue and production impact |
| 2 | OPERATIONAL_COST | Economic | Direct maintenance and repair costs |
| 3 | INTERRUPTION | Economic | Duration and frequency of service interruption |
| 4 | SAFETY | Non-economic | Risk to personnel safety |
| 5 | ENVIRONMENT | Non-economic | Environmental impact and regulatory risk |
| 6 | RSC | Non-economic | Regulatory, Social, and Community impact |

### GFSN Assumptions (REF-16 section 7.3)
- Assume **no controls** are in place (worst-case unmitigated scenario)
- Assume **no contingency** plans are active
- Assume **normal operations** (not startup/shutdown)

## Probability Scale

| Level | Description | Frequency Guideline |
|-------|-------------|---------------------|
| 1 | Rare | Less than once in 10 years |
| 2 | Unlikely | Once in 5-10 years |
| 3 | Possible | Once in 1-5 years |
| 4 | Likely | Once per year |
| 5 | Almost certain | Multiple times per year |

## Worked Example: R8 Mode

**Scenario:** SAG Mill BRY-SAG-ML-001

**Consequence scores:**

| Category | Level |
|----------|-------|
| SAFETY | 4 |
| HEALTH | 2 |
| ENVIRONMENT | 3 |
| PRODUCTION | 5 |
| OPERATING_COST | 4 |
| CAPITAL_COST | 3 |
| SCHEDULE | 4 |
| REVENUE | 5 |
| COMMUNICATIONS | 2 |
| COMPLIANCE | 3 |
| REPUTATION | 2 |

**Probability:** 3 (possible, once in 1-5 years)

**Calculation:**
- max_consequence = MAX(4,2,3,5,4,3,4,5,2,3,2) = **5** (from PRODUCTION and REVENUE)
- overall_score = 5 x 3 = **15.0**
- 15.0 is in range 10-16 => **III_HIGH**

**Result:** Risk Class III (High). This SAG mill is a high-risk asset requiring proactive maintenance strategies.

## Worked Example: GFSN Mode

**Scenario:** Crusher JFC1-CRU-001

**Factor scores:**

| Factor | Level |
|--------|-------|
| BUSINESS_IMPACT | 4 |
| OPERATIONAL_COST | 3 |
| INTERRUPTION | 4 |
| SAFETY | 3 |
| ENVIRONMENT | 2 |
| RSC | 2 |

**Probability:** 4

**Calculation:**
- max_consequence = MAX(4,3,4,3,2,2) = **4**
- overall_score = 4 x 4 = **16.0**
- 16.0 is in range 8-18 => **MODERADO**

**Result:** Band = MODERADO. Moderate criticality under GFSN methodology.

## R8 Risk Classification Boundaries

| Overall Score Range | Risk Class | Label |
|---------------------|------------|-------|
| 1 - 4 | I_LOW | Low Risk |
| 5 - 9 | II_MEDIUM | Medium Risk |
| 10 - 16 | III_HIGH | High Risk |
| 17 - 25 | IV_CRITICAL | Critical Risk |

Boundary rules:
- Score <= 4 yields I_LOW
- Score <= 9 yields II_MEDIUM
- Score <= 16 yields III_HIGH
- Score > 16 yields IV_CRITICAL

## GFSN Band Classification Boundaries

| Overall Score Range | Band | Label |
|---------------------|------|-------|
| 1 - 7 | BAJO | Low |
| 8 - 18 | MODERADO | Moderate |
| 19 - 25 | ALTO | High |

Boundary rules:
- Score >= 19 yields ALTO
- Score >= 8 yields MODERADO
- Score < 8 yields BAJO
