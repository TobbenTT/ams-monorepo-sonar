# VED/FSN/ABC Scoring Tables

Reference tables for computing the weighted criticality score in Step 4.

## Score Lookup Tables

### VED Score

| VED Class | Score | Weight |
|-----------|-------|--------|
| VITAL | 100 | 0.50 |
| ESSENTIAL | 60 | 0.50 |
| DESIRABLE | 20 | 0.50 |

### FSN Score

| FSN Class | Score | Weight |
|-----------|-------|--------|
| FAST_MOVING | 100 | 0.25 |
| SLOW_MOVING | 50 | 0.25 |
| NON_MOVING | 10 | 0.25 |

### ABC Score

| ABC Class | Score | Weight |
|-----------|-------|--------|
| A_HIGH | 100 | 0.25 |
| B_MEDIUM | 60 | 0.25 |
| C_LOW | 20 | 0.25 |

## Composite Formula

```
Score = (VED_score * 0.50) + (FSN_score * 0.25) + (ABC_score * 0.25)
```

## Score Range Examples

| Combination | Calculation | Score |
|-------------|-------------|-------|
| VITAL + FAST + A_HIGH | 100*0.50 + 100*0.25 + 100*0.25 | **100.0** |
| DESIRABLE + NON + C_LOW | 20*0.50 + 10*0.25 + 20*0.25 | **17.5** |
| ESSENTIAL + SLOW + B_MEDIUM | 60*0.50 + 50*0.25 + 60*0.25 | **57.5** |
| VITAL + SLOW + B_MEDIUM | 100*0.50 + 50*0.25 + 60*0.25 | **77.5** |
| ESSENTIAL + FAST + A_HIGH | 60*0.50 + 100*0.25 + 100*0.25 | **80.0** |
| DESIRABLE + FAST + A_HIGH | 20*0.50 + 100*0.25 + 100*0.25 | **60.0** |

## Z-Score Table (for Safety Stock Calculation)

| Service Level | Z-Score |
|--------------|---------|
| 0.90 (90%) | 1.28 |
| 0.95 (95%) | 1.645 |
| 0.99 (99%) | 2.33 |

## Stock Level Formulas

```
If daily_consumption <= 0:
    All levels = 0

Otherwise:
    sigma = demand_std_dev OR (daily_consumption * 0.3)
    Safety Stock = max(1, round(Z * sigma * sqrt(lead_time_days)))
    Reorder Point = round(daily_consumption * lead_time_days + safety_stock)
    EOQ = max(1, round(sqrt(2 * daily_consumption * 365 * 10 / 1)))
    Max Stock = reorder_point + EOQ
    Min Stock = safety_stock
```
