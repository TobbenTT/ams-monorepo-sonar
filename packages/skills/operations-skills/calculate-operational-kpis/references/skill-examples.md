# Examples - calculate-operational-kpis

*Extracted from SKILL.md to comply with the 500-line limit.*
*Read this file when you need detailed examples for this skill.*

---

## Examples

### Example 1: Monthly KPI Calculation Cycle

```
Trigger: Monthly cycle (February 1, 2026 - January data)

Process:
  1. Data Acquisition:
     - CMMS (mcp-cmms): 2,450 work orders, 18,500 labor hours, equipment data
     - ERP (mcp-erp): $4.2M maintenance cost, 1.38M tons production, $685M RAV
     - Production system: 744 calendar hours, 688 operating hours, 56 downtime hours

  2. Data Quality:
     - Completeness: 98.5% (3 days production data required interpolation)
     - Accuracy: CMMS-ERP cost variance 1.8% (within tolerance)
     - Quality Score: 96/100

  3. KPI Calculation Results (January 2026):
     Production:
       OEE: 78.5% (target 82.0%) -> AMBER, improving trend
       Throughput: 45,200 tpd (target 48,000) -> 94.2% plan attainment
       Availability: 91.2% (target 93.0%)
       Recovery: 88.5% (target 90.0%)

     Maintenance:
       Maint Cost % RAV: 4.2% annualized (target 3.5%) -> RED
       PM Compliance: 88.5% (target 95.0%) -> AMBER
       Reactive %: 28% (target 15%) -> RED
       Schedule Compliance: 78% (target 90%) -> AMBER

     Reliability:
       MTBF: 420 hours (target 600) -> AMBER
       MTTR: 5.2 hours (target 4.0) -> AMBER
       Repeat Failures: 35% (target 15%) -> RED

  4. Alerts Generated:
     - RED: Reactive maintenance at 28% (3 consecutive months > 25%)
     - RED: Repeat failure rate at 35% (worsening trend)
     - RED: Maintenance cost trajectory exceeding budget by 18%

  5. Dashboard Updated:
     - Power BI refreshed with January data
     - Executive, management, and operational views updated
     - 3 RED alert cards added to executive summary

Output:
  "January 2026 KPIs calculated and published.
   OEE: 78.5% (vs. 82.0% target, improving trend).
   3 RED alerts generated: reactive maintenance, repeat failures, cost overrun.
   Dashboard: https://app.powerbi.com/sv-kpi-dashboard
   Full report distributed to stakeholders."
```

### Example 2: OEE Waterfall Analysis

```
OEE WATERFALL - January 2026 - Sierra Verde Concentrator
================================================================

Calendar Time:           744.0 hours (31 days x 24 hours)
                         |----- LOADING LOSSES: 24.0 hours ------|
Scheduled Time:          720.0 hours (Loading: 96.8%)
                         |----- AVAILABILITY LOSSES: 63.4 hours --|
Operating Time:          656.6 hours (Availability: 91.2%)
                         |----- PERFORMANCE LOSSES: 32.0 hours ---|
Net Operating Time:      624.6 hours (Performance: 95.1%)
                         |----- QUALITY LOSSES: 59.3 hours -------|
Value-Added Time:        565.3 hours (Quality: 90.5%)

OEE = 91.2% x 95.1% x 90.5% = 78.5%
TEEP = 78.5% x 96.8% = 76.0%

AVAILABILITY LOSS BREAKDOWN (63.4 hours):
  Mechanical failure:     28.5 hours (44.9%)  -> Top: SAG mill main bearing (12h)
  Process upset:          15.2 hours (24.0%)  -> Top: Flotation pH control (8h)
  Electrical failure:      8.8 hours (13.9%)  -> Top: MCC bus trip (5h)
  Instrumentation:         6.2 hours (9.8%)   -> Top: Analyzer malfunction (4h)
  External (ore supply):   4.7 hours (7.4%)   -> Mine crusher downtime

PERFORMANCE LOSS BREAKDOWN (32.0 hours equivalent):
  Reduced throughput:     22.0 hours (68.8%)  -> Hard ore blend impact
  Minor stops (<10min):    6.5 hours (20.3%)  -> Conveyor trips
  Startup/shutdown:        3.5 hours (10.9%)  -> Post-maintenance restarts

IMPROVEMENT OPPORTUNITY:
  Close availability gap to 93%: +13.0 hours -> +18,500 tons/month -> $925K/month
  Close performance gap to 96%: +6.5 hours -> +9,250 tons/month -> $462K/month
  TOTAL: $1.39M/month potential improvement
```
