# Detailed Step-by-Step Execution - calculate-operational-kpis

*Full detailed execution steps extracted from SKILL.md.*
*Read this file when executing the skill for complete step-by-step instructions.*

---

## Step-by-Step Execution

### Phase 1: Data Acquisition and Validation (Steps 1-4)

**Step 1: Connect to Data Sources**
- Establish connections to CMMS via mcp-cmms:
  - Work order data (corrective, preventive, predictive, emergency)
  - Equipment register and hierarchy
  - Failure event records
  - PM schedule and compliance data
  - Backlog data
- Establish connections to ERP via mcp-erp:
  - Cost data (maintenance labor, materials, contractors, overhead)
  - Production output data
  - Inventory data (MRO stock levels, usage, stockouts)
  - Budget data (targets by cost center and period)
- Establish connections to production systems:
  - Operating hours and downtime from DCS/SCADA
  - Throughput data by shift and daily
  - Quality parameters
  - Energy consumption
- Validate all connections return data; document any unavailable sources

**Step 2: Extract Raw Data for Calculation Period**
- For each calculation cycle (shift, daily, weekly, monthly):
  - Extract production data: output volumes, operating hours, downtime events with causes
  - Extract maintenance data: work orders completed, hours expended, costs, PM tasks due vs. completed
  - Extract reliability data: failure events, repair times, equipment status
  - Extract cost data: actual expenditures by category for the period
- Apply date/time filters appropriate to calculation period
- Store extracted data in staging area with extraction timestamp

**Step 3: Validate Data Quality**
- Run completeness checks:
  - All expected time periods have data (no gaps in daily production records)
  - All cost categories have values for the period (no missing labor or material data)
  - Work order counts reconcile (open + completed + cancelled = total for period)
- Run accuracy checks:
  - Operating hours + downtime hours = calendar hours (tolerance 2%)
  - Maintenance cost from CMMS vs. ERP general ledger (tolerance 3%)
  - Production output consistent with equipment capacity (flag impossibly high values)
- Run consistency checks:
  - Downtime cause codes are in approved list (no "Other" > 10% of total)
  - Work order types are consistently coded (no PM work orders coded as CM)
  - Equipment tags in work orders match equipment register
- Generate data quality score per source and per KPI domain
- Flag any KPIs that will be calculated with degraded data quality

**Step 4: Handle Data Quality Issues**
- For missing data:
  - If <5% missing: interpolate from adjacent periods with "estimated" flag
  - If 5-15% missing: calculate with partial data, display with "low confidence" warning
  - If >15% missing: do not calculate; report "insufficient data" with data collection action
- For conflicting data:
  - Use source hierarchy: production system > CMMS > ERP > manual
  - Log conflict and resolution for audit trail
  - Alert data steward to investigate root cause
- For anomalous data:
  - Statistical outlier detection (>3 standard deviations from rolling mean)
  - Flag for manual review; do not auto-correct
  - Include/exclude per reviewer decision (documented)

### Phase 2: KPI Calculation Engine (Steps 5-8)

**Step 5: Calculate Production KPIs**
- Calculate OEE components:
  - Availability = (Scheduled Time - Unplanned Downtime) / Scheduled Time
  - Performance = (Actual Output x Ideal Cycle Time) / Operating Time
  - Quality = Good Product / Total Product
  - OEE = Availability x Performance x Quality
- Calculate TEEP:
  - Loading = Scheduled Time / Calendar Time
  - TEEP = OEE x Loading
- Calculate production metrics:
  - Throughput (daily, weekly, monthly, YTD)
  - Production Plan Attainment
  - Capacity Utilization
  - Recovery Rate (process-specific)
  - Energy Intensity (kWh/ton or equivalent)
  - Water Intensity (m3/ton)
- Apply unit-of-measure conversions as needed (metric/imperial, local currency/USD)

**Step 6: Calculate Maintenance KPIs**
- Calculate SMRP metrics:
  - Maintenance Cost as % RAV
  - Maintenance Cost per Unit of Output
  - PM Compliance (scheduled vs. completed on time)
  - Planned Work % (planned WOs / total WOs)
  - Reactive Maintenance % (emergency WOs / total WOs)
  - Schedule Compliance (completed on schedule / total scheduled)
  - Ready Backlog in weeks (backlog hours / weekly available craft hours)
  - Work Order Accuracy (actual within +/-10% of estimated)
  - Contractor Cost as % of Total Maintenance
  - Material Cost as % of Total Maintenance
- Calculate work management metrics:
  - Average WO age (open to completion)
  - WO aging distribution (0-7 days, 7-30, 30-90, >90)
  - PM to CM ratio
  - Emergency work as % of total
  - Rework rate (repeat WOs on same equipment within 30 days)

**Step 7: Calculate Reliability KPIs**
- Calculate equipment reliability metrics:
  - MTBF (Mean Time Between Failures) by system and overall
  - MTTR (Mean Time To Repair) by system and overall
  - Failure Rate (failures per operating hour)
  - Mechanical Availability by system
  - Repeat Failure % (same tag, same failure mode within 90 days)
  - Defect Elimination Rate (chronic failures eliminated / total chronic failures per year)
- Calculate reliability trends:
  - 12-month rolling MTBF trend (improving, stable, declining)
  - 12-month rolling MTTR trend
  - Bad actor list refresh (top 20 equipment by downtime, cost, frequency)

**Step 8: Calculate Cost Efficiency KPIs**
- Calculate cost metrics:
  - Total Cost per Unit of Output ($/ton, $/barrel, $/MWh)
  - Maintenance Cost per Unit of Output
  - Energy Cost per Unit of Output
  - Labor Productivity (output per labor hour)
  - Budget Variance by category (actual vs. budget, $ and %)
  - MRO Inventory Turns (annual usage / average inventory)
  - Stockout Rate (stockout events / total issue events)
- Apply inflationary adjustments for multi-year comparison (constant-dollar basis)
- Calculate cost trend (12-month rolling) and forecast

### Phase 3: Analysis and Trending (Steps 9-12)

**Step 9: Perform Trend Analysis**
- For each KPI:
  - Plot time series (daily/weekly/monthly depending on KPI frequency)
  - Calculate linear regression trend line and slope
  - Determine trend direction: Improving, Stable, Declining (based on slope significance)
  - Calculate rate of improvement/decline (% change per period)
  - Identify inflection points (when trend changed direction)
  - Calculate forecast: projected value at 3, 6, and 12 months if trend continues
- Generate 12-month rolling average for smoothing seasonal effects
- Flag KPIs where trend contradicts target direction (declining when should improve)

**Step 10: Compare Against Targets and Benchmarks**
- For each KPI:
  - Compare against budget/plan target: calculate gap (absolute and %)
  - Compare against SMRP quartile benchmarks: determine current quartile
  - Compare against previous year same period: calculate year-over-year change
  - Compare against best-achieved value (historical best): calculate gap to personal best
- Generate gap prioritization:
  - Rank KPIs by gap severity (largest % deviation from target)
  - Weight by business impact (availability gap > wrench time gap)
  - Identify KPIs on positive trajectory (trending to close gap)
  - Identify KPIs on negative trajectory (gap widening -- urgent attention)

**Step 11: Generate Exception Alerts**
- Check each KPI against alert thresholds:
  - RED alert: KPI in bottom quartile or >20% worse than target
  - AMBER alert: KPI below target by 5-20% or declining trend
  - GREEN: KPI at or above target with stable/improving trend
- For RED alerts:
  - Generate immediate notification via mcp-outlook to responsible manager
  - Include context: trend, contributing factors (if identifiable from data), recommended actions
  - Log alert in alert history
- For AMBER alerts:
  - Include in weekly KPI summary report
  - Flag in dashboard for management attention
- Track alert resolution: was the issue addressed? did the KPI recover?

**Step 12: Store Historical Values**
- Write calculated KPI values to historical database:
  - Daily values for operational KPIs (production, availability)
  - Weekly values for management KPIs (PM compliance, planned work %)
  - Monthly values for all KPIs including cost metrics
  - Annual summaries for multi-year trending
- Maintain data lineage: record source data references, calculation timestamp, data quality score
- Maintain version control: if calculation methodology changes, preserve both old and new calculations for the transition period

### Phase 4: Dashboard Generation and Distribution (Steps 13-16)

**Step 13: Update Power BI Dashboards via mcp-powerbi**
- Push calculated KPI data to Power BI datasets:
  - Production KPI dataset (refreshed per shift or daily)
  - Maintenance KPI dataset (refreshed daily or weekly)
  - Cost KPI dataset (refreshed monthly)
  - Trend dataset (updated with each calculation cycle)
  - Alert dataset (updated immediately on alert generation)
- Verify dashboard refresh successful
- Validate visual display: spot-check key numbers on dashboard against calculation output

**Step 14: Generate KPI Workbook (.xlsx)**
- Create or update KPI data workbook via mcp-excel (within mcp-erp or standalone):
  - Summary dashboard with conditional formatting, sparklines, and trend arrows
  - Detailed KPI sheets by domain with full calculation detail
  - Trend data for chart generation
  - Benchmark comparison tables
  - Data quality assessment summary
- Distribute workbook to stakeholders who prefer offline access (via mcp-outlook or mcp-sharepoint)

**Step 15: Feed Downstream Analytics**
- Provide KPI data to consuming skills:
  - `identify-improvement-opportunities` (S-02): KPI gaps and trends as improvement input
  - `generate-performance-report` (S-03): KPI data for multi-level reporting
  - `benchmark-maintenance-kpis` (MAINT-04): Maintenance KPIs for detailed benchmarking
  - `accelerate-decision-cycle` (INTG-03): KPI alerts for decision support
  - `agent-or-pmo`: KPI data for OR program performance tracking
- Publish KPI data to shared data layer for ad-hoc consumer access

**Step 16: Conduct Periodic KPI Review and Calibration**
- Monthly: Review KPI target relevance (are targets still appropriate given operational changes?)
- Quarterly: Review KPI portfolio (are we measuring the right things? any gaps?)
- Annually: Full KPI framework review:
  - Update benchmark data to latest available
  - Recalibrate targets based on achieved performance
  - Add/remove KPIs based on strategic priorities
  - Review data quality improvements needed
- Document all changes to KPI definitions, formulas, or targets with effective dates

---
