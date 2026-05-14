# Report Sections Reference

## Standard Sections by Report Type

### WEEKLY_MAINTENANCE
| # | Section | Content Template | Metrics |
|---|---------|-----------------|---------|
| 1 | Work Order Summary | "Completed: {N}, Open: {N}" | completed, open, schedule_compliance_pct |
| 2 | Safety | "Incidents reported: {N}" | safety_incidents |
| 3 | Backlog | "Total backlog: {N} hours" | backlog_hours |
| 4 | Key Events (conditional) | Bulleted list "- event1\n- event2" | None |

### MONTHLY_KPI
| # | Section | Content Template | Metrics |
|---|---------|-----------------|---------|
| 1 | Planning KPIs | "11 GFSN Planning KPIs" | KPI name-value pairs |
| 2 | Defect Elimination KPIs | "5 DE KPIs per GFSN REF-15" | DE KPI values |
| 3 | Reliability KPIs | "Core reliability metrics" | Raw reliability dict |

### QUARTERLY_REVIEW
| # | Section | Content Template | Metrics |
|---|---------|-----------------|---------|
| 1 | Executive Summary | "Q{N} {year} Management Review for {plant_id}" | None |
| 2 | Management Review (conditional) | Summary text | avg_health, open_capas |
| 3 | Strategic Recommendations | Bulleted list | None |

## Traffic Light Thresholds

| Color | Condition |
|-------|-----------|
| GREEN | status == "ON_TARGET" |
| AMBER | value >= target * 0.8 (but not ON_TARGET) |
| RED | value < target * 0.8 OR value/target is None |

## Trend Logic

| Condition | Trend |
|-----------|-------|
| current_compliance > previous_compliance | IMPROVING |
| current_compliance < previous_compliance | DEGRADING |
| current_compliance == previous_compliance | STABLE |
| No previous data | No trend generated |

## Quarterly Recommendation Rules

| Condition | Recommendation |
|-----------|---------------|
| rbi_summary.overdue_count > 0 | "Address {N} overdue RBI inspections" |
| bad_actors list not empty | "Focus on {N} identified bad actors for root cause analysis" |
| capas_summary.overdue_count > 0 | "Resolve {N} overdue CAPA actions" |
| None of above | "Continue current maintenance strategy -- on track" |
