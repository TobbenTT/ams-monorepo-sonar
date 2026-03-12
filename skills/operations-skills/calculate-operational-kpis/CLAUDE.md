---
name: calculate-operational-kpis
description: "Calculate and define operational KPIs for plant performance monitoring. Triggers: 'operational KPIs', 'performance indicators', 'KPIs operacionales'."
---

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
### Phase 2: KPI Calculation Engine (Steps 5-8)
**Step 5: Calculate Production KPIs**
### Phase 3: Analysis and Trending (Steps 9-12)
**Step 9: Perform Trend Analysis**
### Phase 4: Dashboard Generation and Distribution (Steps 13-16)
**Step 13: Update Power BI Dashboards via mcp-powerbi**

See [`references/skill-detailed-steps.md`](references/skill-detailed-steps.md) for complete detailed execution steps.

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

See [`references/skill-examples.md`](references/skill-examples.md) for detailed examples.

## MCP Integrations

See [`references/skill-mcp-integrations.md`](references/skill-mcp-integrations.md) for detailed mcp integrations.
