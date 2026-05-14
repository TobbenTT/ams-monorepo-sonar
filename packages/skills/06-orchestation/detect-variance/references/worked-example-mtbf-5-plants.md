# Worked Example: MTBF Analysis Across 5 Plants

## Input Snapshots

| Plant ID | Plant Name | Metric | Value |
|----------|------------|--------|-------|
| P-01 | Jorf Lasfar | MTBF | 120.0 |
| P-02 | Safi | MTBF | 130.0 |
| P-03 | Khouribga | MTBF | 125.0 |
| P-04 | Benguerir | MTBF | 128.0 |
| P-05 | Youssoufia | MTBF | 45.0 |

## Statistics
- n = 5
- mean = 109.6
- variance = 1055.44
- std = 32.4876

## Z-Scores

| Plant | Value | Z-Score | abs(Z) |
|-------|-------|---------|--------|
| P-01 | 120.0 | +0.32 | 0.32 |
| P-02 | 130.0 | +0.63 | 0.63 |
| P-03 | 125.0 | +0.47 | 0.47 |
| P-04 | 128.0 | +0.57 | 0.57 |
| P-05 | 45.0 | -1.99 | 1.99 |

## Classification
- P-01 through P-04: abs_z < 2.0 --> No alert
- P-05: abs_z = 1.99 < 2.0 --> No alert (barely below threshold)

## Result
No alerts generated.

## Sensitivity: If Youssoufia MTBF Drops to 40.0
- New mean = 108.6, new std = 33.71
- P-05 z = (40-108.6)/33.71 = -2.03 --> **WARNING**
- Message: "Youssoufia: MTBF is 2.0 sigma below portfolio mean (40.0 vs 108.6)"

## Plant Ranking

| Rank | Plant | MTBF |
|------|-------|------|
| 1 | Safi | 130.0 |
| 2 | Benguerir | 128.0 |
| 3 | Khouribga | 125.0 |
| 4 | Jorf Lasfar | 120.0 |
| 5 | Youssoufia | 45.0 |
