# Worked Example: SAG Mill Pinion Gear Failure Analysis

## Inputs
- `equipment_id`: `"10045678"`
- `equipment_tag`: `"BRY-SAG-ML-001"`
- `failure_intervals`: `[450, 520, 380, 490, 410]` (days)
- `current_age_days`: `350`
- `confidence_level`: `0.9`

## Step 2: Fit Parameters

Sorted: [380, 410, 450, 490, 520]

### Median Ranks (Bernard's Approximation)

| i | t | F(i) = (i-0.3)/(5+0.4) | x = ln(t) | y = ln(ln(1/(1-F))) |
|---|---|-------------------------|-----------|---------------------|
| 1 | 380 | 0.1296 | 5.9402 | -1.9756 |
| 2 | 410 | 0.3148 | 6.0162 | -0.9530 |
| 3 | 450 | 0.5000 | 6.1092 | -0.3665 |
| 4 | 490 | 0.6852 | 6.1944 | 0.1454 |
| 5 | 520 | 0.8704 | 6.2538 | 0.7138 |

### Computed Parameters
- **beta = 5.200**
- **eta = 468.3 days**
- **r_squared = 0.9700**

## Step 3: Pattern Classification
- beta = 5.2 >= 3.5 => **A_BATHTUB** (age-related wear-out)

## Step 4: Predictions

### Reliability at Current Age (350 days)
```
R(350) = exp(-(350/468.3)^5.2) = 0.8058
```

### Mean Life
```
Gamma(1 + 1/5.2) = 0.926
mean_life = 468.3 x 0.926 = 433.6 days
```

### Predicted Failure Window (90% confidence)
```
t_pred = 468.3 x (-ln(0.1))^(1/5.2) = 547.1
predicted_days = 547.1 - 350 = 197.1 days
```

### Risk Score
```
risk_score = MIN(100, (350/433.6) x 100) = 80.7
```

## Final Output

| Parameter | Value |
|-----------|-------|
| Beta | 5.200 |
| Eta | 468.3 days |
| R-squared | 0.9700 |
| Sample Size | 5 |
| Current Reliability | 0.8058 |
| Failure Pattern | A_BATHTUB |
| Predicted Window | 197.1 days |
| Risk Score | 80.7 |
| Urgency | URGENT |
| Status | DRAFT |

## Gamma Function Reference Table

| Beta | 1/beta | 1 + 1/beta | Gamma Value | Mean Life Factor |
|------|--------|------------|-------------|-----------------|
| 0.5 | 2.0 | 3.0 | 2.0 | 2.0 x eta |
| 1.0 | 1.0 | 2.0 | 1.0 | 1.0 x eta |
| 1.5 | 0.667 | 1.667 | 0.903 | 0.903 x eta |
| 2.0 | 0.5 | 1.5 | 0.886 | 0.886 x eta |
| 3.0 | 0.333 | 1.333 | 0.893 | 0.893 x eta |
| 3.5 | 0.286 | 1.286 | 0.900 | 0.900 x eta |
