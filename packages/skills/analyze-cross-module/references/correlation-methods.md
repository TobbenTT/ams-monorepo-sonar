# Correlation Methods Reference

Detailed formulas, mapping tables, and classification rules for cross-module correlation analysis.

## Pearson Correlation Coefficient Formula

```
Given n data points (x_i, y_i):

If n < 2: return 0.0

mean_x = sum(x) / n
mean_y = sum(y) / n

numerator   = SUM( (x_i - mean_x) * (y_i - mean_y) )
denominator = sqrt( SUM( (x_i - mean_x)^2 ) ) * sqrt( SUM( (y_i - mean_y)^2 ) )

If denominator_x == 0 or denominator_y == 0: return 0.0  (zero-variance case)

coefficient = numerator / denominator
coefficient = clamp(coefficient, -1.0, 1.0)
coefficient = round(coefficient, 4)
```

### Edge Cases

| Condition | Result | Reason |
|-----------|--------|--------|
| n < 2 | 0.0 | Insufficient data points |
| All x values identical | 0.0 | Zero variance in x |
| All y values identical | 0.0 | Zero variance in y |
| Floating-point overflow | Clamped to [-1.0, 1.0] | Numerical safety |

## Criticality Class to Numeric Rank Mapping

| Criticality Class | Numeric Rank | Description |
|-------------------|-------------|-------------|
| `AA` | 6 | Most critical |
| `A+` | 5 | Very high criticality |
| `A` | 4 | High criticality |
| `B` | 3 | Medium criticality |
| `C` | 2 | Low criticality |
| `D` | 1 | Minimal criticality |
| (unknown/other) | 1 | Default fallback |

## Correlation Strength Classification

| |coefficient| Range | Strength Label |
|----------------------|----------------|
| >= 0.7 | `STRONG` |
| >= 0.4 and < 0.7 | `MODERATE` |
| >= 0.2 and < 0.4 | `WEAK` |
| < 0.2 | `NONE` |

The absolute value of the coefficient is used for classification. A coefficient of -0.8 has strength STRONG.

## Insight Generation Rules

| Correlation Type | Condition | Insight Text |
|-----------------|-----------|--------------|
| CRITICALITY_FAILURES | r > 0.3 | "Higher criticality equipment tends to have more failures" |
| CRITICALITY_FAILURES | r <= 0.3 | "No strong correlation between criticality and failure frequency" |
| COST_RELIABILITY | r < -0.3 | "Higher maintenance cost correlates with lower reliability" |
| COST_RELIABILITY | r >= -0.3 | "No strong inverse correlation between cost and reliability" |
| HEALTH_BACKLOG | r < -0.3 | "Lower health scores correlate with more open backlog items" |
| HEALTH_BACKLOG | r >= -0.3 | "No strong correlation between health score and backlog volume" |

## Bad Actor Extraction Conditions

| Source Analysis | Field Path | Bad Actor Condition | Set Name |
|----------------|-----------|---------------------|----------|
| Jack-Knife | `jackknife_result.points[]` | `point.zone == "ACUTE"` | `jk_acute` |
| Pareto | `pareto_result.items[]` | `item.is_bad_actor == True` | `pareto_bad` |
| RBI | `rbi_result.assessments[]` | `assessment.risk_level in ("HIGH", "CRITICAL")` | `rbi_high` |

### Overlap Set Calculations

```
all_three  = jk_acute INTERSECT pareto_bad INTERSECT rbi_high
any_two    = union(jk_acute & pareto_bad, jk_acute & rbi_high, pareto_bad & rbi_high) - all_three
single_only = (jk_acute UNION pareto_bad UNION rbi_high) - all_three - any_two
```

### Priority Action List Construction

1. Equipment in `all_three` -- sorted alphabetically (highest priority)
2. Equipment in `any_two` -- sorted alphabetically
3. Equipment in `single_only` -- sorted alphabetically (lowest priority)

## Cross-Module Summary Generation

### Key Insights Collection

1. Add `insight` string from each CorrelationResult.
2. If `overlap_all_three` is non-empty: add `"{count} equipment flagged across all three analyses: {ids}"` (list first 5 IDs).
3. If `total_unique_bad_actors > 0`: add `"{count} unique bad actors identified across modules"`.

### Recommended Actions Collection

1. For each correlation with strength STRONG or MODERATE: add `"Investigate {correlation_type} correlation (r={coefficient}, {strength})"`.
2. If `overlap_all_three` is non-empty: add `"Prioritize intervention for equipment flagged in all analyses"`.

## Worked Example

### Input Data (4 equipment items, plant OCP-JFC)

**Equipment Criticality:**

| equipment_id | criticality_class | rank |
|-------------|-------------------|------|
| EQ-001 | A | 4 |
| EQ-002 | B | 3 |
| EQ-003 | C | 2 |
| EQ-004 | A+ | 5 |

**Failure Counts:** EQ-001=8, EQ-002=3, EQ-003=1, EQ-004=12

### Step-by-Step Pearson Calculation

Data points: (4,8), (3,3), (2,1), (5,12)

- mean_x = (4+3+2+5)/4 = 3.5
- mean_y = (8+3+1+12)/4 = 6.0
- numerator = (0.5)(2) + (-0.5)(-3) + (-1.5)(-5) + (1.5)(6) = 1 + 1.5 + 7.5 + 9 = 19
- den_x = sqrt(0.25 + 0.25 + 2.25 + 2.25) = sqrt(5) = 2.236
- den_y = sqrt(4 + 9 + 25 + 36) = sqrt(74) = 8.602
- coefficient = 19 / (2.236 * 8.602) = 19 / 19.23 = **0.9880**
- Strength: **STRONG** (>= 0.7)
- Insight: "Higher criticality equipment tends to have more failures"

### Bad Actor Overlap Example

| Analysis | Bad Actors |
|----------|-----------|
| Jack-Knife ACUTE | EQ-001, EQ-004 |
| Pareto Bad Actor | EQ-001, EQ-002, EQ-004 |
| RBI HIGH/CRITICAL | EQ-001, EQ-004 |

- `overlap_all_three` = {EQ-001, EQ-004}
- `overlap_any_two` = {} (all pairwise overlaps are already in all_three)
- `single_only` = {EQ-002}
- Priority action list: ["EQ-001", "EQ-004", "EQ-002"]
