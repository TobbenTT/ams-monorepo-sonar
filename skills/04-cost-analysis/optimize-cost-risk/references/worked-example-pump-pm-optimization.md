# Worked Example: Pump PUMP-101A PM Optimization

## Inputs

| Parameter | Value |
|-----------|-------|
| equipment_id | "PUMP-101A" |
| failure_rate | 3.0 failures/year |
| cost_per_failure | $45,000 |
| cost_per_pm | $1,500 |
| current_pm_interval_days | 90 |
| beta | 2.0 |
| eta | (auto) 365/3.0 = 121.67 days |

## Sweep Sample Points

| Interval | PM Cost | R(t) | Failure Prob | Failure Cost | Total |
|----------|---------|------|--------------|-------------|-------|
| 7 days | $78,214 | 0.9967 | 0.0033 | $446 | $78,660 |
| 30 days | $18,250 | 0.9410 | 0.0590 | $7,965 | $26,215 |
| 60 days | $9,125 | 0.7827 | 0.2173 | $29,336 | $38,461 |
| 90 days | $6,083 | 0.5698 | 0.4302 | $58,077 | $64,160 |
| 120 days | $4,563 | 0.3686 | 0.6314 | $85,239 | $89,802 |
| 180 days | $3,042 | 0.0857 | 0.9143 | $123,431 | $126,473 |

## Result

- **Optimal interval: 28 days**
- **Cost at optimal: $25,800**
- Cost at current (90d): $64,160
- **Savings: 59.8%**
- Risk at optimal: 0.0520 (5.2%)
- Risk at current: 0.4302 (43.0%)

## Recommendation
"Reduce PM interval from 90d to 28d (saves 59.8%)"

## Interpretation
The current 90-day interval is far too long -- failure probability is 43% between PMs.
Reducing to 28 days cuts failure probability to 5.2% and saves nearly 60% in annual costs.

## Total Cost Formula
```
Total Annual Cost(t) = C_pm * (365/t) + lambda * C_f * (1 - exp(-(t/eta)^beta))

Where:
  C_pm    = cost per PM = $1,500
  C_f     = cost per failure = $45,000
  lambda  = annual failure rate = 3.0
  t       = PM interval (days)
  beta    = 2.0
  eta     = 121.67 days
```

## Cost Curve Shape
- SHORT intervals: PM cost dominates (many PMs/year) --> HIGH total
- LONG intervals: Failure cost dominates (high failure probability) --> HIGH total
- OPTIMAL: Minimum of U-shaped curve
