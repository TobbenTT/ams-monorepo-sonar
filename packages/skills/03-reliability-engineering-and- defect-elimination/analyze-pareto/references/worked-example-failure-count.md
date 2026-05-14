# Worked Example: Failure Count Pareto for Plant JFC-01

## Raw Failure Records (one per event)

| Equipment ID | Equipment Tag |
|-------------|---------------|
| EQ-001 | PUMP-101A |
| EQ-001 | PUMP-101A |
| EQ-001 | PUMP-101A |
| EQ-001 | PUMP-101A |
| EQ-001 | PUMP-101A |
| EQ-002 | CONV-201 |
| EQ-002 | CONV-201 |
| EQ-002 | CONV-201 |
| EQ-003 | COMP-301 |
| EQ-003 | COMP-301 |
| EQ-004 | VALVE-401 |
| EQ-005 | MOTOR-501 |

## Aggregated Data

| Equipment ID | Tag | Failure Count |
|-------------|-----|---------------|
| EQ-001 | PUMP-101A | 5 |
| EQ-002 | CONV-201 | 3 |
| EQ-003 | COMP-301 | 2 |
| EQ-004 | VALVE-401 | 1 |
| EQ-005 | MOTOR-501 | 1 |

**Total: 12 failures**

## Pareto Results

| Rank | Equipment | Failures | Cumulative | Cum % | Bad Actor? |
|------|-----------|----------|------------|-------|------------|
| 1 | PUMP-101A | 5 | 5 | 41.7% | YES (<=80%) |
| 2 | CONV-201 | 3 | 8 | 66.7% | YES (<=80%) |
| 3 | COMP-301 | 2 | 10 | 83.3% | NO (>80%) |
| 4 | VALVE-401 | 1 | 11 | 91.7% | NO |
| 5 | MOTOR-501 | 1 | 12 | 100.0% | NO |

## Result
- `bad_actor_count`: 2
- `bad_actor_pct_of_total`: 40.0% (2 out of 5 equipment items)
- Interpretation: 40% of equipment causes 66.7% of failures

## Special Case: Single Dominant Equipment

If PUMP-101A had 12 failures and CONV-201 had 1:
- Total = 13
- PUMP-101A: cum_pct = 92.3% --> bad actor (rank == 1 special rule)
- CONV-201: cum_pct = 100.0% --> NOT bad actor
