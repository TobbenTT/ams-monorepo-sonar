# Worked Example: 3 Static Equipment Items at Plant JFC-01

## Equipment

| ID | Type | Damage Mechanisms | Age | Design Life | Last Inspection | Conditions |
|----|------|-------------------|-----|-------------|-----------------|------------|
| V-101 | PRESSURE_VESSEL | CORROSION, FATIGUE | 20 | 25 | 2023-06-15 | SEVERE |
| HX-201 | HEAT_EXCHANGER | CORROSION | 8 | 25 | 2024-03-01 | NORMAL |
| P-301 | PIPING | EROSION | 5 | 30 | None | NORMAL |

## Assessment V-101
- age_ratio = 20/25 = 0.80 --> prob_base = 4
- dm_factor = min(2, 2) = 2; SEVERE +1 --> 3
- probability_score = min(5, max(1, 4+3-1)) = **5**
- consequence_score (PRESSURE_VESSEL) = **5**
- risk_score = 5 x 5 = **25 (CRITICAL)**
- technique: CORROSION --> ULTRASONIC_THICKNESS
- interval: CRITICAL --> 6 months
- next_inspection = 2023-06-15 + 6 months = 2023-12-15 (**OVERDUE**)

## Assessment HX-201
- age_ratio = 8/25 = 0.32 --> prob_base = 2
- dm_factor = min(2, 1) = 1; NORMAL +0 --> 1
- probability_score = min(5, max(1, 2+1-1)) = **2**
- consequence_score (HEAT_EXCHANGER) = **4**
- risk_score = 2 x 4 = **8 (MEDIUM)**
- technique: CORROSION --> ULTRASONIC_THICKNESS
- interval: MEDIUM --> 36 months
- next_inspection = 2024-03-01 + 36 months = 2027-03-01

## Assessment P-301
- age_ratio = 5/30 = 0.167 --> prob_base = 1
- dm_factor = min(2, 1) = 1; NORMAL +0 --> 1
- probability_score = min(5, max(1, 1+1-1)) = **1**
- consequence_score (PIPING) = **3**
- risk_score = 1 x 3 = **3 (LOW)**
- technique: EROSION --> ULTRASONIC_THICKNESS
- interval: LOW --> 60 months
- next_inspection = today (no prior inspection)

## Batch Result
- total_equipment: 3
- high_risk_count: 1 (V-101 is CRITICAL)
- overdue_count: 1 (V-101 past due)

## Prioritized Inspection Order
1. V-101 (overdue + risk 25)
2. HX-201 (risk 8, not overdue)
3. P-301 (risk 3, not overdue)

## Risk Matrix Reference (5x5)

```
Consequence -->    1       2       3       4       5
Probability
    5           5(L)   10(M)   15(H)   20(H)   25(C)
    4           4(L)    8(M)   12(M)   16(H)   20(H)
    3           3(L)    6(L)    9(M)   12(M)   15(H)
    2           2(L)    4(L)    6(L)    8(M)   10(M)
    1           1(L)    2(L)    3(L)    4(L)    5(L)
```
