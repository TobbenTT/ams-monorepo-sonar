# Calculate Operational KPIs

## Skill ID: S-01
## Version: 1.0.0
## Category: S. Performance Analytics
## Priority: P1 - Critical

---

## Purpose

Calculate, monitor, and trend operational Key Performance Indicators (KPIs) across production, maintenance, reliability, and asset utilization domains, producing real-time and historical dashboards that transform raw operational data into actionable performance intelligence. This skill serves as the quantitative backbone of the OR System's performance monitoring capability, providing the numbers that drive every operational decision from shift handover to board-level strategic review.

The need for rigorous, automated KPI calculation is driven by a fundamental problem in asset-intensive industries: a 3-5x variance in performance between top-quartile and bottom-quartile facilities within the same sector, largely because bottom-quartile organizations lack the measurement systems to identify, quantify, and track their performance gaps (Pain Point SM-01, SMRP Best Practice Data). A copper concentrator in the top quartile achieves 92% mechanical availability and OEE of 85%, while a bottom-quartile peer operates at 78% availability and 55% OEE -- a gap worth tens of millions of dollars annually. Without systematic KPI calculation and benchmarking, organizations operate in a measurement vacuum where opinions replace data, gut feelings replace analysis, and improvement efforts are misdirected.

The problem is compounded by data fragmentation. Operational data resides in multiple disconnected systems: DCS/SCADA (production data), CMMS/EAM (maintenance data), ERP (cost and inventory data), quality management systems, and manual logs. Each system has its own data model, update frequency, and access method. Producing a single coherent KPI dashboard requires integrating data from 3-7 source systems, applying consistent calculation methodologies, handling data quality issues, and presenting results in formats appropriate for different stakeholder levels. This integration rarely happens manually with sufficient rigor or frequency.

This skill automates the entire KPI lifecycle: data acquisition from source systems via MCP integrations, calculation using industry-standard formulas (SMRP, ISO 22400, OEE Foundation), quality validation, trending, benchmarking against targets, exception detection, and multi-level dashboard generation. The result is a single source of truth for operational performance that is always current, always consistent, and always available.

---

## Intent & Specification

| Attribute              | Value                                                                                       |
|------------------------|--------------------------------------------------------------------------------------------|
| **Skill ID**           | S-01                                                                                        |
| **Agent**              | Agent 10 -- Performance Analytics                                                            |
| **Domain**             | Performance Analytics                                                                        |
| **Version**            | 1.0.0                                                                                        |
| **Complexity**         | High                                                                                         |
| **Estimated Duration** | Initial setup: 5-15 days; Ongoing: continuous (automated refresh cycles)                     |
| **Maturity**           | Production                                                                                   |
| **Pain Point Addressed** | SM-01: 3-5x variance in benchmarking metrics between top and bottom quartile (SMRP)       |
| **Secondary Pain**     | B-04: 2-4 week decision latency due to unavailable or stale performance data               |
| **Value Created**      | Real-time performance visibility, 50% reduction in reporting effort, data-driven decisions  |

### Functional Intent

This skill SHALL:

1. **Acquire operational data** from CMMS (mcp-cmms), ERP (mcp-erp), and other source systems on scheduled and on-demand cycles.
2. **Calculate 50+ operational KPIs** across five domains: Production Performance, Maintenance Effectiveness, Equipment Reliability, Asset Utilization, and Cost Efficiency -- using industry-standard formulas.
3. **Validate data quality** before calculation, flagging anomalies, missing data, and inconsistencies.
4. **Store historical KPI values** for trend analysis over periods from daily to multi-year.
5. **Compare KPIs against targets** (budget, benchmark, previous period) and generate exception alerts when thresholds are breached.
6. **Produce multi-level dashboards** via mcp-powerbi: executive summary, management detail, operational shift-level.
7. **Support ad-hoc queries** for specific KPIs, time periods, equipment, or organizational units.
8. **Feed downstream analytics** including identify-improvement-opportunities (S-02), generate-performance-report (S-03), and benchmark-maintenance-kpis (MAINT-04).

---

## Trigger / Invocation

### Direct Invocation

```
/calculate-operational-kpis --project [name] --scope [full|production|maintenance|reliability|cost] --period [daily|weekly|monthly|ytd|custom]
```

### Command Variants
- `/calculate-operational-kpis dashboard --project [name]` -- Refresh all dashboards
- `/calculate-operational-kpis trend --kpi [kpi_id] --period [months]` -- Trend analysis for specific KPI
- `/calculate-operational-kpis compare --project [name] --period1 [range] --period2 [range]` -- Period comparison
- `/calculate-operational-kpis alert --project [name]` -- Show current KPI alerts and exceptions
- `/calculate-operational-kpis export --project [name] --format [xlsx|csv|json]` -- Export KPI data
- `/calculate-operational-kpis benchmark --project [name] --against [smrp|budget|previous_year]` -- Benchmark comparison

### Aliases
- `/kpi-dashboard`, `/operational-kpis`, `/performance-kpis`, `/kpi-calc`

### Automatic Triggers
- **Shift change**: Calculate shift-level production KPIs (every 8 or 12 hours)
- **Daily 06:00**: Calculate daily KPIs across all domains
- **Weekly Monday 07:00**: Calculate weekly roll-ups and week-over-week trends
- **Monthly 1st business day**: Calculate monthly KPIs, YTD cumulative, and monthly report data
- **Data refresh**: Source system data updated (triggers incremental recalculation)
- **Alert condition**: KPI breaches threshold (triggers immediate notification)

### Event-Driven Triggers
- Management requests performance summary for specific period
- Gate review approaching (calculate KPIs for gate readiness package)
- Budget cycle begins (calculate actuals vs. budget for planning input)
- Improvement initiative starts/completes (establish baseline or measure impact)

---

## Input Requirements

### Required Inputs

| Input | Type | Source | Description |
|-------|------|--------|-------------|
| `production_data` | .xlsx / API | DCS/SCADA / mcp-erp | Production output (tons, barrels, MWh), operating hours, downtime hours by cause, quality parameters |
| `maintenance_data` | .xlsx / API | CMMS (mcp-cmms) | Work order counts by type (PM/CM/PdM/Emergency), labor hours, material costs, backlog hours, PM compliance |
| `equipment_data` | .xlsx / API | CMMS (mcp-cmms) | Equipment register with criticality, failure events, repair times, operating hours |
| `cost_data` | .xlsx / API | ERP (mcp-erp) | Maintenance cost breakdown (labor, materials, contractors, overhead), production cost, energy cost |
| `asset_valuation` | .xlsx | Finance | Replacement Asset Value (RAV) for maintenance cost ratio calculation |
| `kpi_targets` | .xlsx | Management / Budget | Target values for each KPI by period (monthly, annual) |

### Optional Inputs

| Input | Type | Source | Description |
|-------|------|--------|-------------|
| `energy_data` | .xlsx / API | Energy management system | Energy consumption by area/equipment for energy intensity KPIs |
| `safety_data` | .xlsx | HSE system | Safety incidents, near-misses, TRIR, LTIR for safety KPIs |
| `quality_data` | .xlsx / API | QMS | Product quality parameters, off-spec production, rework |
| `inventory_data` | .xlsx / API | ERP (mcp-erp) | MRO inventory value, stockout events, turns |
| `environmental_data` | .xlsx | Environmental system | Emissions, water usage, waste generation for ESG KPIs |
| `benchmark_data` | .xlsx | SMRP / Industry | External benchmark quartile data for comparison |
| `previous_kpi_data` | database | mcp-powerbi / internal | Historical KPI values for trend continuity |

### Input Validation Rules

```yaml
validation:
  production_data:
    required_fields: ["date", "production_output", "operating_hours", "downtime_hours", "downtime_cause"]
    data_frequency: "daily or shift-level"
    min_history: "30 days for trending"
    checks:
      - "operating_hours + downtime_hours <= 24 per day"
      - "production_output >= 0"
      - "downtime_cause in approved_cause_code_list"
  maintenance_data:
    required_fields: ["work_order_id", "type", "equipment_tag", "start_date", "completion_date", "labor_hours", "material_cost"]
    wo_type_values: ["PM", "PdM", "CM", "Emergency", "Modification", "Capital"]
    checks:
      - "completion_date >= start_date"
      - "labor_hours > 0 for completed WOs"
  cost_data:
    required_fields: ["period", "labor_cost", "material_cost", "contractor_cost", "overhead"]
    currency: "USD or local currency with exchange rate"
    checks:
      - "total_cost = labor + material + contractor + overhead (within 1%)"
```

---

## Output Specification

### Deliverable 1: KPI Dashboard (Power BI via mcp-powerbi)

**Dashboard Structure:**

#### Executive Level (1 page)
- Overall OEE gauge with trend sparkline
- Production vs. Plan bar chart (monthly, YTD)
- Top 5 KPI exceptions (alerts requiring attention)
- Maintenance cost as % RAV gauge
- Availability gauge with 12-month trend
- Safety KPI summary (TRIR, days without incident)

#### Management Level (5 pages)
- **Production Performance**: OEE waterfall, throughput trend, quality rate, planned vs. actual
- **Maintenance Effectiveness**: PM compliance, planned work %, reactive %, cost breakdown
- **Equipment Reliability**: MTBF trend, MTTR trend, top 10 bad actors by downtime
- **Asset Utilization**: Availability by system, utilization rate, capacity factor
- **Cost Efficiency**: Cost per ton, maintenance cost trend, budget variance, contractor ratio

#### Operational Level (per area/system)
- Shift production summary with hourly rates
- Equipment status (running/stopped/maintenance)
- Alarm rate summary (from manage-loop-checking R-03)
- Current shift KPIs vs. targets
- Maintenance work in progress

### Deliverable 2: KPI Data Workbook (.xlsx)

**Filename**: `{ProjectCode}_KPI_Dashboard_v{Version}_{YYYYMMDD}.xlsx`

**Sheets**:

| Sheet | Content |
|-------|---------|
| `Summary Dashboard` | Visual summary with conditional formatting, trend arrows, and RAG indicators |
| `Production KPIs` | All production metrics with daily/weekly/monthly values and targets |
| `Maintenance KPIs` | All maintenance metrics per SMRP framework |
| `Reliability KPIs` | Equipment reliability metrics by system and overall |
| `Cost KPIs` | Cost efficiency metrics with budget comparison |
| `Trend Data` | Monthly KPI values for 24-month rolling trend |
| `Benchmark Comparison` | Current values vs. SMRP quartiles and internal targets |
| `Alert History` | Log of KPI threshold breaches with dates and resolution |
| `Data Quality` | Data completeness and quality assessment per source |
| `Definitions` | KPI formulas, data sources, and calculation methodology |

### Deliverable 3: KPI Alert Notifications (via mcp-outlook / mcp-powerbi)

```
Subject: [KPI ALERT] {Project} - {KPI Name} breached threshold
From: OR Performance Analytics <or-analytics@vsc.cl>
To: {Responsible Manager}
Cc: {Operations Manager}

KPI ALERT
==========================================================
KPI:           {KPI Name} ({KPI ID})
Current Value: {Value} {Unit}
Target:        {Target} {Unit}
Threshold:     {Threshold Type} (Red if {Condition})
Period:        {Period}
Trend:         {Improving/Stable/Declining} over {X} periods

CONTEXT:
- Previous period value: {Previous Value}
- Year-to-date average: {YTD Average}
- Best achieved (12 months): {Best Value}
- Industry benchmark (Q2): {Benchmark}

IMPACT:
{Estimated business impact of current performance gap}

RECOMMENDED ACTIONS:
1. {Specific action based on KPI type and deviation pattern}
2. {Reference to related analysis or improvement opportunity}
==========================================================
```

### KPI JSON Schema (for API consumers and mcp-powerbi)

```json
{
  "project": "Sierra Verde Copper Expansion",
  "calculation_date": "2026-02-15",
  "period": "January 2026",
  "kpi_data": {
    "production": {
      "OEE": {"value": 78.5, "unit": "%", "target": 82.0, "quartile": "Q2", "trend": "improving", "rag": "AMBER"},
      "throughput": {"value": 45200, "unit": "tpd", "target": 48000, "pct_plan": 94.2, "rag": "AMBER"},
      "availability": {"value": 91.2, "unit": "%", "target": 93.0, "quartile": "Q2", "trend": "stable", "rag": "AMBER"},
      "performance_rate": {"value": 95.1, "unit": "%", "target": 96.0, "trend": "improving", "rag": "GREEN"},
      "quality_rate": {"value": 90.5, "unit": "%", "target": 92.0, "trend": "stable", "rag": "AMBER"},
      "production_plan_attainment": {"value": 94.2, "unit": "%", "target": 100.0, "rag": "AMBER"}
    },
    "maintenance": {
      "pm_compliance": {"value": 88.5, "unit": "%", "target": 95.0, "quartile": "Q2", "trend": "improving", "rag": "AMBER"},
      "planned_work_pct": {"value": 72.0, "unit": "%", "target": 85.0, "quartile": "Q2", "trend": "improving", "rag": "AMBER"},
      "reactive_pct": {"value": 28.0, "unit": "%", "target": 15.0, "quartile": "Q3", "trend": "improving", "rag": "RED"},
      "schedule_compliance": {"value": 78.0, "unit": "%", "target": 90.0, "quartile": "Q2", "trend": "stable", "rag": "AMBER"},
      "wrench_time": {"value": 35.0, "unit": "%", "target": 50.0, "quartile": "Q3", "trend": "stable", "rag": "RED"},
      "maint_cost_pct_rav": {"value": 4.2, "unit": "%", "target": 3.5, "quartile": "Q3", "trend": "declining", "rag": "RED"},
      "backlog_weeks": {"value": 6.5, "unit": "weeks", "target": 3.0, "quartile": "Q3", "trend": "stable", "rag": "RED"}
    },
    "reliability": {
      "mtbf_overall": {"value": 420, "unit": "hours", "target": 600, "trend": "improving", "rag": "AMBER"},
      "mttr_overall": {"value": 5.2, "unit": "hours", "target": 4.0, "trend": "stable", "rag": "AMBER"},
      "repeat_failure_pct": {"value": 35.0, "unit": "%", "target": 15.0, "quartile": "Q3", "trend": "stable", "rag": "RED"},
      "defect_elimination_rate": {"value": 8.0, "unit": "%/year", "target": 15.0, "trend": "improving", "rag": "AMBER"}
    },
    "cost": {
      "cost_per_ton": {"value": 2.85, "unit": "USD/ton", "target": 2.40, "trend": "declining", "rag": "RED"},
      "maintenance_cost_per_ton": {"value": 0.95, "unit": "USD/ton", "target": 0.75, "trend": "declining", "rag": "RED"},
      "energy_cost_per_ton": {"value": 0.62, "unit": "USD/ton", "target": 0.55, "trend": "stable", "rag": "AMBER"},
      "contractor_ratio": {"value": 42.0, "unit": "%", "target": 30.0, "quartile": "Q3", "trend": "stable", "rag": "RED"}
    }
  }
}
```

---

## Methodology & Standards

### KPI Calculation Framework

#### Tier 1: Overall Equipment Effectiveness (OEE)

OEE is the primary top-level metric combining availability, performance, and quality:

```
OEE = Availability x Performance Rate x Quality Rate

Where:
  Availability = (Planned Production Time - Unplanned Downtime) / Planned Production Time
  Performance Rate = (Actual Output / Planned Production Time) / Ideal Rate
  Quality Rate = Good Output / Total Output

Extended: TEEP = OEE x Loading Factor
  Loading Factor = Planned Production Time / Calendar Time
  TEEP represents total asset utilization (24/7/365 basis)
```

**OEE Benchmarks by Industry:**

| Industry | World Class | Top Quartile | Median | Bottom Quartile |
|----------|------------|-------------|--------|-----------------|
| Mining (concentrator) | >85% | 78-85% | 65-78% | <65% |
| Mining (HPGR/crushing) | >88% | 80-88% | 70-80% | <70% |
| Oil & Gas (refinery) | >90% | 85-90% | 75-85% | <75% |
| Power Generation | >92% | 88-92% | 80-88% | <80% |
| Chemical | >88% | 82-88% | 72-82% | <72% |
| Cement | >85% | 78-85% | 65-78% | <65% |

#### Tier 2: Production KPIs

| KPI | Formula | Unit | Frequency |
|-----|---------|------|-----------|
| Throughput | Total output / Operating time | tpd, bpd, MWh | Shift/Daily |
| Production Plan Attainment | Actual output / Planned output x 100 | % | Daily/Monthly |
| Capacity Utilization | Actual output / Nameplate capacity x 100 | % | Monthly |
| Recovery Rate | Product output / Feed input x 100 | % | Shift/Daily |
| Grade/Quality | Product quality parameter vs. specification | Various | Shift/Daily |
| Yield | Saleable product / Total production x 100 | % | Daily/Monthly |
| Energy Intensity | Energy consumed / Output | kWh/ton | Daily/Monthly |
| Water Intensity | Water consumed / Output | m3/ton | Daily/Monthly |
| Operating Hours | Calendar time - All downtime | hours | Daily/Monthly |
| Unplanned Downtime | Total unplanned stops x Duration | hours | Daily/Monthly |

#### Tier 3: Maintenance KPIs (per SMRP Best Practice 5th Edition)

| KPI | SMRP ID | Formula | Target |
|-----|---------|---------|--------|
| Maintenance Cost % RAV | 5.1.1 | Total Maint Cost / RAV x 100 | <3.0% (mining) |
| Maintenance Cost per Unit | 5.1.2 | Total Maint Cost / Production Output | Industry-specific |
| PM Compliance | 5.3.2 | PM Completed on Schedule / Scheduled PM x 100 | >95% |
| Planned Work % | 5.5.1 | Planned WOs / Total WOs x 100 | >85% |
| Reactive Maintenance % | 5.3.1 | Emergency WOs / Total WOs x 100 | <15% |
| Schedule Compliance | 5.5.2 | Completed on Schedule / Total Scheduled x 100 | >90% |
| Wrench Time | 5.5.3 | Direct Work Time / Available Time x 100 | >50% |
| Ready Backlog | 5.5.4 | Ready Backlog Hours / Weekly Craft Hours | 2-4 weeks |
| MTBF | 5.2.4 | Operating Time / Number of Failures | Increasing |
| MTTR | 5.2.5 | Total Repair Time / Number of Repairs | Decreasing |
| Contractor % | 5.1.5 | Contractor Cost / Total Maint Cost x 100 | <30% |
| Material % | 5.1.6 | Material Cost / Total Maint Cost x 100 | 40-50% |
| Work Order Accuracy | 5.5.5 | Actual within +/-10% of Plan / Total | >80% |
| MRO Inventory Turns | -- | Annual Usage / Average Inventory Value | >2.0 |
| Stockout Rate | -- | Stockout Events / Total Issues x 100 | <2% |

#### Tier 4: Asset Utilization KPIs (per ISO 22400)

| KPI | Formula | Unit |
|-----|---------|------|
| Mechanical Availability | (Scheduled - Mechanical DT) / Scheduled x 100 | % |
| Process Availability | (Scheduled - Process DT) / Scheduled x 100 | % |
| Total Availability | (Calendar - All DT) / Calendar x 100 | % |
| Utilization Rate | Operating Time / Available Time x 100 | % |
| Asset Turnover | Revenue / Total Asset Value | ratio |
| Capital Effectiveness | EBITDA / Capital Employed | % |

### Data Quality Management

```yaml
data_quality_framework:
  completeness:
    definition: "Percentage of expected data records received"
    target: ">98%"
    action_if_below: "Flag KPIs calculated with incomplete data; show confidence indicator"
  accuracy:
    definition: "Cross-validation of data between sources"
    checks:
      - "Production hours from DCS vs. CMMS downtime = calendar hours (tolerance 2%)"
      - "Maintenance cost from CMMS vs. ERP (tolerance 3%)"
      - "Work order counts reconcile between reporting periods"
    action_if_failed: "Investigate source; use higher-confidence source; flag in dashboard"
  timeliness:
    definition: "Data currency at calculation time"
    targets:
      shift_data: "< 2 hours"
      daily_data: "< 12 hours"
      monthly_data: "< 3 business days after month end"
    action_if_stale: "Display 'data as of [date]' warning; escalate to data owner"
  consistency:
    definition: "Same calculation methodology applied across periods and organizational units"
    controls:
      - "KPI formulas version-controlled in this skill definition"
      - "No manual overrides without documented rationale"
      - "Consistent treatment of planned vs. unplanned downtime across all units"
```

### Standards Applied
- **SMRP Best Practice (5th Edition)** -- Maintenance and reliability KPI definitions and benchmarks
- **ISO 22400** -- Key performance indicators for manufacturing operations management
- **OEE Foundation** -- Standard OEE calculation methodology
- **TEEP (Total Effective Equipment Performance)** -- Extended OEE including loading factor
- **EN 15341** -- Maintenance Key Performance Indicators
- **ISO 14224** -- Equipment reliability data collection standard
- **APQC Process Classification Framework** -- Process benchmarking standard

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

## Quality Criteria

| Criterion | Metric | Target | Minimum Acceptable |
|-----------|--------|--------|-------------------|
| Calculation Accuracy | KPI values match manual calculation audit | 100% | 100% (verified quarterly) |
| Formula Compliance | KPIs calculated per SMRP/ISO standard formulas | 100% | 100% |
| Data Freshness | Dashboard data age at any point | <24 hours (daily KPIs) | <48 hours |
| Data Quality Score | Average source data quality across all inputs | >95% | >85% |
| KPI Coverage | KPIs calculated vs. defined in framework | >90% | >80% |
| Alert Timeliness | Time from threshold breach to alert notification | <4 hours | <12 hours |
| Target Coverage | KPIs with defined targets | 100% | >90% |
| Trend Accuracy | Trend direction matches statistical analysis | 100% | >95% |
| Dashboard Availability | Power BI dashboard uptime | >99% | >95% |
| Stakeholder Satisfaction | Survey: "KPI dashboard meets my information needs" | >4.0/5.0 | >3.5/5.0 |
| Benchmark Currency | Benchmark data vintage | <2 years | <3 years |
| Historical Continuity | Months of unbroken KPI history maintained | >24 months | >12 months |

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents/skills)

| Agent/Skill | Input Provided | Criticality |
|-------------|---------------|-------------|
| CMMS data via mcp-cmms | Work orders, equipment data, failure events, PM compliance | Critical |
| ERP data via mcp-erp | Cost data, production data, inventory data, budget targets | Critical |
| `benchmark-maintenance-kpis` (MAINT-04) | Industry benchmark quartile data for comparison | High |
| `develop-maintenance-strategy` (MAINT-01) | Target maintenance mix (PM/PdM/CM ratios) as KPI targets | Medium |
| `orchestrate-or-program` (H-01) | Operational targets and KPI priorities for OR program | Medium |

### Downstream Dependencies (Outputs TO other agents/skills)

| Agent/Skill | Output Provided | Trigger |
|-------------|----------------|---------|
| `identify-improvement-opportunities` (S-02) | KPI gaps, trends, bad actors as improvement input | Each calculation cycle |
| `generate-performance-report` (S-03) | KPI data for multi-level report generation | On report trigger |
| `benchmark-maintenance-kpis` (MAINT-04) | Calculated maintenance KPIs for detailed benchmarking | Monthly |
| `analyze-failure-patterns` (MAINT-03) | Bad actor list from reliability KPIs | Monthly |
| `accelerate-decision-cycle` (INTG-03) | KPI alerts and exception data for decision support | On alert |
| `agent-or-pmo` | Operational performance data for OR governance | Weekly/Monthly |
| `model-rampup-trajectory` (H-04) | Production ramp-up KPI tracking data | During ramp-up |

---

## MCP Integrations

### mcp-cmms
```yaml
name: "mcp-cmms"
server: "@vsc/cmms-mcp"
purpose: "Primary source for maintenance work order data, equipment register, and failure events"
capabilities:
  - Extract work orders by type, date range, equipment, and status
  - Access equipment hierarchy and criticality ratings
  - Retrieve PM schedule and compliance data
  - Access failure event history with cause codes
  - Retrieve backlog data (open WOs with hours estimates)
  - Access labor time records per work order
authentication: API Key / Service Account
usage_in_skill:
  - Step 1: Establish connection and validate data availability
  - Step 2: Extract maintenance and reliability data for calculation period
  - Step 6: Calculate maintenance KPIs from work order data
  - Step 7: Calculate reliability KPIs from failure event data
```

### mcp-erp
```yaml
name: "mcp-erp"
server: "@vsc/erp-mcp"
purpose: "Source for cost data, production data, inventory data, and budget targets"
capabilities:
  - Extract maintenance cost breakdown by category and cost center
  - Access production output and operating hour records
  - Retrieve MRO inventory data (stock levels, usage, stockouts)
  - Access budget data for variance calculation
  - Retrieve asset valuation (RAV) data
  - Access energy and utility consumption data
authentication: Service Account / OAuth2
usage_in_skill:
  - Step 1: Establish connection for cost and production data
  - Step 2: Extract cost and production data for calculation period
  - Step 5: Calculate production KPIs from production data
  - Step 8: Calculate cost efficiency KPIs from financial data
```

### mcp-powerbi
```yaml
name: "mcp-powerbi"
server: "@vsc/powerbi-mcp"
purpose: "Dashboard visualization and automated refresh of KPI displays"
capabilities:
  - Create and update Power BI datasets with KPI values
  - Configure automated refresh schedules
  - Publish dashboards for stakeholder self-service access
  - Support drill-down from executive to operational detail
  - Generate alert notifications from dashboard data
authentication: Service Principal
usage_in_skill:
  - Step 13: Push KPI data to Power BI datasets
  - Step 13: Verify dashboard refresh
  - Step 11: Configure alert rules in Power BI for threshold monitoring
```

---

## Templates & References

### KPI Summary Template (Monthly)

```markdown
## Operational KPI Summary - {Month} {Year}
## {Project Name}

### Executive Highlights
| Metric | Actual | Target | Variance | Trend | RAG |
|--------|--------|--------|----------|-------|-----|
| OEE | {X}% | {Y}% | {Z}% | {Arrow} | {Color} |
| Throughput | {X} tpd | {Y} tpd | {Z}% | {Arrow} | {Color} |
| Maint Cost % RAV | {X}% | {Y}% | {Z}% | {Arrow} | {Color} |
| PM Compliance | {X}% | {Y}% | {Z}% | {Arrow} | {Color} |
| MTBF | {X} hrs | {Y} hrs | {Z}% | {Arrow} | {Color} |

### Top 5 Actions Required
1. {KPI}: {Gap description} -- {Recommended action}
2. ...
```

### Reference Documents
- SMRP Best Practice Metrics (5th Edition) -- KPI definitions and benchmarks
- ISO 22400-2:2014 -- Key performance indicators for manufacturing operations management
- OEE Foundation -- Standard OEE calculation methodology
- EN 15341:2007 -- Maintenance Key Performance Indicators
- ISO 14224 -- Equipment reliability and maintenance data
- Wireman, T. "Developing Performance Indicators for Managing Maintenance" (2nd Ed.)
- Idhammar, T. "Maintenance KPIs: Practical Guide to Measuring Maintenance Performance"
- SMRP Body of Knowledge -- KPI chapter with industry quartile data

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
