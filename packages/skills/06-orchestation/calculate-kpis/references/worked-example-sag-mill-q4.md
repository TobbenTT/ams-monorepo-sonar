# Worked Example: Q4 2024 KPIs for SAG Mill

## Scenario

**Period:** 2024-10-01 to 2024-12-31 (92 days = 2208 hours)

## Work Order Records

| WO | Type | Created | Planned Start | Planned End | Actual Start | Actual End | Duration (h) | Failure? |
|----|------|---------|---------------|-------------|--------------|------------|-------------|----------|
| WO-001 | PM03 | 2024-10-05 | 2024-10-05 | 2024-10-06 | 2024-10-05 | 2024-10-06 | 18.0 | Yes |
| WO-002 | PM02 | 2024-10-10 | 2024-10-15 | 2024-10-15 | 2024-10-15 | 2024-10-15 | 4.0 | No |
| WO-003 | PM02 | 2024-10-20 | 2024-10-25 | 2024-10-25 | 2024-10-26 | 2024-10-26 | 3.5 | No |
| WO-004 | PM03 | 2024-11-12 | 2024-11-12 | 2024-11-13 | 2024-11-12 | 2024-11-13 | 24.0 | Yes |
| WO-005 | PM01 | 2024-11-20 | 2024-11-25 | 2024-11-25 | 2024-11-24 | 2024-11-24 | 2.0 | No |
| WO-006 | PM02 | 2024-12-01 | 2024-12-05 | 2024-12-05 | 2024-12-05 | 2024-12-05 | 3.0 | No |
| WO-007 | PM03 | 2024-12-20 | 2024-12-20 | 2024-12-21 | 2024-12-20 | 2024-12-21 | 12.0 | Yes |

## Step-by-Step Calculations

### MTBF
- Failure dates (actual_start): [2024-10-05, 2024-11-12, 2024-12-20]
- Intervals: [38 days, 38 days]
- **MTBF = 38.0 days**

### MTTR
- Failure durations: [18.0, 24.0, 12.0]
- **MTTR = 18.0 hours**

### Availability
- Total period: 2208 hours, Downtime: 54.0 hours
- **Availability = 97.6%**

### OEE (MVP)
- **OEE = 97.6%** (Performance=100%, Quality=100%)

### Schedule Compliance
- Planned: 7, On time: 6 (WO-003 late)
- **Schedule Compliance = 85.7%**

### PM Compliance
- PM02 planned: 3, PM02 executed: 3
- **PM Compliance = 100.0%**

### Reactive Ratio
- Corrective (PM03): 3, Total: 7
- **Reactive Ratio = 42.9%**

## Summary

| KPI | Value | Assessment |
|-----|-------|-----------|
| MTBF | 38.0 days | Low -- frequent failures |
| MTTR | 18.0 hours | High repair time |
| Availability | 97.6% | Good |
| OEE | 97.6% | Good (MVP) |
| Schedule Compliance | 85.7% | Below 90% target |
| PM Compliance | 100.0% | Excellent |
| Reactive Ratio | 42.9% | Poor -- too much reactive work |
