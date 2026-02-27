# Calculate Health Score - Worked Examples

## Worked Example: SAG Mill BRY-SAG-ML-001

### Inputs
- risk_class: III_HIGH
- pending_backlog_hours: 120
- capacity_hours_per_week: 40
- total_failure_modes: 24
- fm_with_strategy: 18
- active_alerts: 3
- critical_alerts: 1
- planned_wo: 20
- executed_on_time: 16
- previous_score: 55.0

### Step 1: Dimension Scores

| # | Dimension | Calculation | Score |
|---|-----------|-------------|-------|
| 1 | Criticality | III_HIGH -> 40 | 40.0 |
| 2 | Backlog Pressure | weeks=120/40=3.0; 100x(1-3/8)=62.5 | 62.5 |
| 3 | Strategy Coverage | 100x18/24=75.0 | 75.0 |
| 4 | Condition Status | weighted=3+(1x2)=5; 100x(1-5/10)=50.0 | 50.0 |
| 5 | Execution Compliance | 100x16/20=80.0 | 80.0 |

### Step 2: Composite Score

```
composite = (40.0 x 0.25) + (62.5 x 0.20) + (75.0 x 0.25) + (50.0 x 0.15) + (80.0 x 0.15)
          = 10.0 + 12.5 + 18.75 + 7.5 + 12.0
          = 60.75 / 1.0
          = 60.8 (rounded)
```

### Step 3: Health Class
60.8 >= 50 -> **AT_RISK**

### Step 4: Trend
delta = 60.8 - 55.0 = 5.8
5.8 > 5.0 -> **IMPROVING**

### Step 5: Recommendations
- Criticality score = 40.0 < 50 -> "High criticality asset -- review risk mitigation strategies"
- All other dimensions >= 50, no additional recommendations.

### Final Report

| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Criticality | 40.0 | 0.25 | 10.0 |
| Backlog Pressure | 62.5 | 0.20 | 12.5 |
| Strategy Coverage | 75.0 | 0.25 | 18.75 |
| Condition Status | 50.0 | 0.15 | 7.5 |
| Execution Compliance | 80.0 | 0.15 | 12.0 |
| **Composite** | **60.8** | | |

Health Class: **AT_RISK** | Trend: **IMPROVING**

Recommendations:
- High criticality asset -- review risk mitigation strategies

## Backlog Pressure Score Examples

| Pending Hours | Capacity/Week | Weeks | Score |
|---------------|---------------|-------|-------|
| 0 | 40 | 0.0 | 100.0 |
| 80 | 40 | 2.0 | 75.0 |
| 160 | 40 | 4.0 | 50.0 |
| 320 | 40 | 8.0 | 0.0 |
| 400 | 40 | 10.0 | 0.0 (clamped) |

## Condition Status Score Examples

| Active | Critical | Weighted | Score |
|--------|----------|----------|-------|
| 0 | 0 | 0 | 100.0 |
| 2 | 0 | 2 | 80.0 |
| 3 | 1 | 5 | 50.0 |
| 5 | 3 | 11 | 0.0 (clamped) |

## Strategy Coverage Score Examples

| FM with Strategy | Total FM | Score |
|-----------------|----------|-------|
| 24 | 24 | 100.0 |
| 18 | 24 | 75.0 |
| 6 | 24 | 25.0 |
| 0 | 24 | 0.0 |
| 0 | 0 | 0.0 |

## Execution Compliance Score Examples

| Planned WO | Executed On Time | Score |
|-----------|-----------------|-------|
| 20 | 20 | 100.0 |
| 20 | 16 | 80.0 |
| 20 | 10 | 50.0 |
| 0 | 0 | 100.0 |

## Criticality Score Mapping

| Risk Class | Health Score |
|------------|-------------|
| I_LOW | 90 |
| II_MEDIUM | 70 |
| III_HIGH | 40 |
| IV_CRITICAL | 15 |
| Unknown | 50 |

## Health Class Thresholds

| Composite Score | Health Class |
|----------------|-------------|
| >= 75 | HEALTHY |
| >= 50 | AT_RISK |
| > 0 | CRITICAL |
| 0 | UNKNOWN |

## Trend Thresholds

| Delta | Trend |
|-------|-------|
| > 5.0 | IMPROVING |
| < -5.0 | DEGRADING |
| -5.0 to 5.0 | STABLE |

Note: Exactly +5.0 = STABLE, +5.01 = IMPROVING, -5.0 = STABLE, -5.01 = DEGRADING.
