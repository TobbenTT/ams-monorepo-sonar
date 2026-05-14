# Calculate Priority - Worked Examples

## R8 Mode Example 1: Critical Pump with Safety Concern

**Input:**
- equipment_criticality: "AA"
- has_safety_flags: True
- failure_mode_detected: "Seal leak detected"
- production_impact_estimated: True
- is_recurring: True
- equipment_running: False

**Calculation:**
1. Criticality AA -> weight = 10, score = 10
2. Safety flags present -> score = 10 + 5 = 15
3. Production impact -> score = 15 + 3 = 18
4. Recurring failure -> score = 18 + 2 = 20
5. Equipment stopped -> score = 20 + 3 = 23

**Priority:** 23 >= 15 -> 1_EMERGENCY

**Escalation:** score >= 15 = YES; also (safety AND AA) = YES -> True

**Justification:** "Equipment criticality: AA (weight 10); Safety flags present (+5); Production impact estimated (+3); Recurring failure pattern (+2); Equipment currently stopped (+3)"

## R8 Mode Example 2: Low-Criticality Routine Issue

**Input:**
- equipment_criticality: "C"
- has_safety_flags: False
- failure_mode_detected: None
- production_impact_estimated: False
- is_recurring: False
- equipment_running: True

**Calculation:**
1. Criticality C -> weight = 2, score = 2
No additional factors apply.

**Priority:** 2 < 5 -> 4_PLANNED
**Escalation:** (2 < 15) AND (no safety on C) -> False
**Justification:** "Equipment criticality: C (weight 2)"

## GFSN Mode Example

**Input:**
- criticality_band: MODERADO
- max_consequence: 4

**Calculation:**
1. Consequence 4 >= 4 -> category = HIGH
2. Matrix lookup: (MODERADO, HIGH) -> ALTO
3. Response time: ALTO -> "Immediate"

**Output:**
- priority: ALTO
- response_time: "Immediate"
- justification: "GFSN Matrix: MODERADO band x consequence 4 (HIGH) = ALTO. Response: Immediate"

## Override Validation Example

**Input:**
- ai_priority: "1_EMERGENCY"
- human_priority: "3_NORMAL"

**Calculation:**
- AI rank: 1, Human rank: 3
- human_rank (3) > ai_rank (1) -> downgraded = True
- Warning: "Priority downgraded from 1_EMERGENCY to 3_NORMAL. Ensure safety considerations have been reviewed."

**Output:**
```json
{
  "valid": true,
  "warning": "Priority downgraded from 1_EMERGENCY to 3_NORMAL. Ensure safety considerations have been reviewed.",
  "downgraded": true,
  "upgraded": false
}
```

## Criticality Weight Table

| Equipment Criticality | Weight |
|----------------------|--------|
| AA | 10 |
| A+ | 8 |
| A | 6 |
| B | 4 |
| C | 2 |
| D | 1 |

Default weight if criticality not found: 1

## Response Time Table

| Priority | Response Time | Meaning |
|----------|--------------|---------|
| ALTO | Immediate | Drop everything, respond now |
| MODERADO | <14 days | Schedule within two weeks |
| BAJO | >14 days | Plan for next available window |

## Key Threshold Summary

- R8: Score >= 15 = EMERGENCY, >= 10 = URGENT, >= 5 = NORMAL, < 5 = PLANNED
- Maximum possible R8 score: 23 (AA + all flags)
- Minimum possible R8 score: 1 (D, no flags)
- Escalation: score >= 15 OR (safety AND criticality in {AA, A+})
