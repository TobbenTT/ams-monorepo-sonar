# Worked Example: Pump Replacement Decision

## Alternative A -- Repair Existing Pump

| Parameter | Value |
|-----------|-------|
| acquisition_cost | $0 (already owned) |
| installation_cost | $5,000 (refurbishment) |
| annual_operating_cost | $15,000 |
| annual_maintenance_cost | $25,000 |
| expected_life_years | 10 |
| discount_rate | 0.08 |
| salvage_value | $0 |

### Calculations
- Annuity factor (8%, 10 years) = 6.7101
- NPV_operating = 15,000 x 6.7101 = $100,651.50
- NPV_maintenance = 25,000 x 6.7101 = $167,752.50
- NPV_salvage = $0
- **Total LCC = $273,404.00**
- Annualized = $27,340.40/yr
- acquisition_pct = 1.8%
- operating_pct = 36.8%
- maintenance_pct = 61.4%
- Recommendation: "Maintenance-dominant: consider reliability improvement or replacement"

## Alternative B -- New Premium Pump

| Parameter | Value |
|-----------|-------|
| acquisition_cost | $120,000 |
| installation_cost | $20,000 |
| annual_operating_cost | $8,000 |
| annual_maintenance_cost | $6,000 |
| expected_life_years | 20 |
| discount_rate | 0.08 |
| salvage_value | $15,000 |

### Calculations
- Annuity factor (8%, 20 years) = 9.8181
- NPV_operating = 8,000 x 9.8181 = $78,544.80
- NPV_maintenance = 6,000 x 9.8181 = $58,908.60
- NPV_salvage = 15,000 / 1.08^20 = $3,218.08
- **Total LCC = $274,235.32**
- Annualized = $13,711.77/yr
- acquisition_pct = 51.1%
- operating_pct = 28.6%
- maintenance_pct = 21.5%
- Recommendation: "Capital-dominant: evaluate lease/rental alternatives"

## Comparison

| Metric | Alt A (Repair) | Alt B (New Pump) |
|--------|---------------|-----------------|
| Total LCC | $273,404 | $274,235 |
| Life Span | 10 years | 20 years |
| Annual Cost | $27,340/yr | $13,712/yr |
| Dominant Cost | Maintenance (61.4%) | Capital (51.1%) |

**Conclusion:** Although total LCC is similar, Alt B provides HALF the annual cost over TWICE the life.

## Annuity Factor Reference

| Rate | 10 years | 15 years | 20 years | 25 years | 30 years |
|------|----------|----------|----------|----------|----------|
| 5% | 7.722 | 10.380 | 12.462 | 14.094 | 15.372 |
| 8% | 6.710 | 8.559 | 9.818 | 10.675 | 11.258 |
| 10% | 6.145 | 7.606 | 8.514 | 9.077 | 9.427 |
| 12% | 5.650 | 6.811 | 7.469 | 7.843 | 8.055 |
