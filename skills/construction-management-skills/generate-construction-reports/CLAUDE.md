---
name: generate-construction-reports
description: "Produce structured daily, weekly, and monthly construction progress reports consolidating all construction data into actionable stakeholder communications. Triggers: 'construction report', 'daily report', 'weekly progress report', 'monthly construction report', 'reporte de construccion', 'informe de avance'."
---

# Generate Construction Reports

## Skill ID: CM-10

## Version: 1.0.0

## Category: A-Document Generation (Construction Management)

## Priority: P1 - Critical

---

## Purpose

Produce structured construction progress reports at daily, weekly, and monthly frequencies by aggregating data from all construction management skills into consolidated, actionable documents for project leadership and stakeholders. Reports follow a strict hierarchy: daily reports capture field-level facts, weekly reports add management analysis and corrective actions, and monthly reports provide executive-level KPI trending and strategic recommendations.

Construction reporting is the nervous system of project execution. Without timely, accurate, and structured reporting, project leadership operates blind -- unable to detect emerging problems, allocate resources effectively, or make informed decisions about schedule recovery and cost management. Industry benchmarks from IPA and CII show that projects with disciplined weekly reporting achieve 15-20% better schedule performance than those with ad-hoc reporting, primarily because structured reports force systematic data collection and early problem identification.

In the Operational Readiness context, construction reports serve a dual purpose: they manage the construction execution phase AND they provide leading indicators for commissioning and operations readiness. A monthly construction report that shows declining quality metrics, increasing RFI volumes, or slipping MC milestones is an early warning system for OR program risks. The Orchestrator Agent consumes construction report data to update the consolidated OR program dashboard and inform gate review decisions.

Key value drivers:
- **Decision support**: Timely, structured data enables proactive rather than reactive management
- **Accountability**: Published metrics create transparency and accountability for all parties (owner, contractors, subcontractors)
- **Early warning**: Trend analysis in weekly and monthly reports identifies problems 4-8 weeks before they become critical
- **Stakeholder communication**: Consistent report format builds stakeholder confidence and reduces ad-hoc information requests
- **OR integration**: Construction metrics flow into the OR program dashboard, linking construction execution to operational readiness

---

## Intent & Specification

The AI agent MUST understand that:

1. **Reports follow a strict hierarchy with increasing analytical depth** -- daily reports are factual field summaries (what happened today), weekly reports add management analysis (what does it mean, what are we doing about it), and monthly reports add executive-level trending and strategic recommendations (where are we heading, what decisions are needed). Each level builds on the data from the level below but adds unique analytical value, not just aggregation.

2. **Every data point must be traceable to a source skill or register** -- no construction report may contain metrics, counts, or percentages that cannot be traced to a specific source: progress data from track-construction-progress, safety data from monitor-construction-safety, quality data from manage-field-quality, permit data from manage-construction-permits, RFI data from manage-construction-rfi, welding data from track-welding-nde-records, etc. The data cut-off date and data vintage must be stated in every report header.

3. **The weekly report is the primary construction management tool** -- it must include at minimum: overall physical progress (planned vs. actual), safety performance (manhours, incidents, observations), quality status (NCRs, ITP compliance, weld repair rate), schedule adherence (milestones achieved vs. planned), subcontractor performance summary, key issues and risks with mitigations, and a 2-week look-ahead of critical activities. The weekly report drives the weekly construction management meeting agenda.

4. **Monthly reports must include earned value analysis and trend projections** -- in addition to all weekly report elements, the monthly report adds: CPI and SPI calculations, S-curve analysis (planned vs. actual vs. forecast), milestone achievement tracking, risk register updates, and management-level narrative with specific recommendations requiring decisions.

5. **Standardized KPIs are mandatory across all report frequencies** -- progress metrics (physical % complete vs. plan), quality metrics (NCR rate, ITP compliance, weld repair rate), safety metrics (TRIR, LTIR, near-miss frequency rate), schedule metrics (milestones on time %), and subcontractor metrics (performance ratings per contractor). KPI definitions and calculation methods must be consistent across all report frequencies.

### Report Hierarchy Definition

| Report Type | Frequency | Audience | Content Depth | Page Target | Delivery Deadline |
|------------|-----------|----------|---------------|-------------|-------------------|
| **Daily Field Report** | Every working day | Construction management, site supervisors | Factual field summary: what happened today | 2-4 pages | End of shift or 07:00 next business day |
| **Weekly Report** | Every week (Mon-Fri/Sat) | Construction management, project management, client | Management analysis: what it means, what we do about it | 8-15 pages | Tuesday COB following the reporting week |
| **Monthly Report** | Every calendar month | Executive management, steering committee, client leadership | Executive trending: where are we heading, what decisions are needed | 20-35 pages | 10th business day of following month |

### Standardized KPI Definitions

| KPI | Formula | Unit | Source Skill | Benchmark |
|-----|---------|------|-------------|-----------|
| Physical Progress Variance | (Actual % - Planned %) | Percentage points | track-construction-progress | Within +/-3% |
| TRIR | (Recordable incidents x 200,000) / total manhours | Rate per 200K hrs | monitor-construction-safety | <1.0 |
| NCR Rate | (New NCRs x 10,000) / total manhours | Rate per 10K hrs | manage-field-quality | <2.0 |
| ITP Compliance Rate | (H points on time / H points due) x 100 | Percentage | track-inspection-test-plans | 100% |
| Weld Repair Rate | (Rejected welds / welds examined) x 100 | Percentage | track-welding-nde-records | <5% |
| RFI Response Rate | (RFIs responded on time / total RFIs due) x 100 | Percentage | manage-construction-rfi | >90% |
| Permit Compliance Rate | (Activities with valid permit / total activities) x 100 | Percentage | manage-construction-permits | 100% |
| Milestone On-Time Rate | (Milestones achieved on/before plan / total milestones due) x 100 | Percentage | Execution Agent | >85% |

---

## Trigger / Invocation

```
/generate-construction-reports
```

### Natural Language Triggers (EN)
- "Generate the weekly construction progress report for the period ending Friday"
- "Produce the monthly construction report for January 2026 with earned value analysis"
- "Create today's daily construction field report"

### Natural Language Triggers (ES)
- "Generar el reporte semanal de avance de construccion para el periodo terminado el viernes"
- "Producir el informe mensual de construccion de enero 2026 con analisis de valor ganado"
- "Crear el reporte diario de campo de construccion de hoy"

---

## Input Requirements

### Required Inputs

| Input | Source | Format | Description |
|-------|--------|--------|-------------|
| Physical Progress Data | track-construction-progress | .xlsx/.csv | Progress by discipline, area, and system -- planned vs. actual percentages |
| Safety Performance Data | monitor-construction-safety | .xlsx/.csv | Manhours worked, incidents, near-misses, safety observations, TRIR/LTIR |
| Quality Data | manage-field-quality | .xlsx/.csv | NCR counts, ITP compliance rate, punchlist status, weld repair rates |
| Schedule Data | Execution Agent (Project Controls) | .xer/.csv | Planned vs. actual milestones, critical path activities, float analysis |
| Permit Data | manage-construction-permits | .xlsx/.csv | Active permits, SIMOPS conflicts, permit compliance rate |

### Optional Inputs

| Input | Source | Default if Absent |
|-------|--------|-------------------|
| Manpower Data | Contractors / HSE (from manhour reports) | Derive from safety manhour tracking |
| Weather Log | Site Meteorological Station / Field | Note in daily report narrative only |
| Photo Log | Site Photography / Field Supervisors | Include photo references with captions |
| Cost / Earned Value Data | Execution Agent (Finance/Controls) | Monthly report only; omit if unavailable |

### Context Enrichment (Automatic)

- Aggregate data from all construction management skills (progress, safety, quality, permits, RFIs, welding, ITP, MCC)
- Retrieve construction schedule baseline and current forecast from Project Controls
- Pull the project risk register for active risks requiring construction report commentary
- Access previous report for period-over-period comparison and trend continuity
- Query earned value data (BCWS, BCWP, ACWP) from Project Controls for monthly report CPI/SPI calculation

---

## Output Specification

### Filename Formats
- Daily: `{ProjectCode}_Daily_Construction_Report_{YYYYMMDD}.md`
- Weekly: `{ProjectCode}_Weekly_Construction_Report_WK{NN}_{YYYYMMDD}.md`
- Monthly: `{ProjectCode}_Monthly_Construction_Report_{MonthYear}_{YYYYMMDD}.md`

### Report Structure

1. **Header Block** -- Project name, report type (daily/weekly/monthly), reporting period, data cut-off date, report number, distribution list
2. **Executive Summary** -- (Weekly and Monthly only) Key metrics at a glance with traffic lights, top 3 achievements, top 3 issues requiring attention, management decisions required
3. **Physical Progress** -- Overall progress (planned vs. actual %), progress by discipline/area, S-curve chart data, look-ahead activities
4. **Safety Performance** -- Manhours worked, incident summary, near-misses, safety observations, TRIR/LTIR calculation, permit compliance
5. **Quality Status** -- NCR open/closed/total, ITP compliance rate, weld repair rate, punchlist counts by category, inspection status
6. **Schedule Performance** -- Milestones achieved vs. planned, critical path status, schedule risk items, float consumption analysis (monthly)

### Key Metrics Table

| Metric | Description | Target | Report Frequency |
|--------|-------------|--------|-----------------|
| Overall Physical Progress | Actual % complete vs. planned % complete | Within 3% of plan | Daily/Weekly/Monthly |
| TRIR (Total Recordable Incident Rate) | Recordable incidents per 200,000 manhours worked | <1.0 (industry dependent) | Weekly/Monthly |
| NCR Rate | New NCRs per 10,000 manhours worked | <2.0 | Weekly/Monthly |
| Milestone On-Time Rate | % of milestones achieved on or before planned date | >85% | Weekly/Monthly |
| CPI / SPI | Cost and Schedule Performance Indices (Earned Value) | >0.95 | Monthly |

---

## Procedure

### Step 1: Collect and Validate Input Data

- Retrieve the latest data from each source skill: track-construction-progress (physical progress), monitor-construction-safety (safety metrics), manage-field-quality (quality data), manage-construction-permits (permit status), manage-construction-rfi (RFI metrics), track-welding-nde-records (welding data), track-inspection-test-plans (ITP compliance)
- Validate data freshness: ensure all data is current to the reporting period cut-off date; flag any data sources not updated within the last reporting cycle
- Cross-validate data consistency: progress percentages should be consistent across sources (e.g., piping progress in track-construction-progress should align with weld completion in track-welding-nde-records)
- For monthly reports, retrieve earned value data (BCWS, BCWP, ACWP) from Project Controls and validate against financial records
- Collect narrative inputs: key issues, weather events, access restrictions, management decisions, and site photographs from field supervisors
- Log all data sources and cut-off dates in the report header for traceability
- Identify any data gaps and note them explicitly in the report (do not estimate or interpolate missing data)

### Step 2: Generate Daily Field Report

- Compile the factual field summary: weather conditions, work crews deployed (headcount by contractor), areas of active work, equipment on site
- Record key activities completed today: concrete pours, steel erection, pipe installation, cable pulling, equipment setting, etc. with quantities
- Note safety events: any incidents, near-misses, safety observations, toolbox talk topics, safety stand-downs
- List quality events: inspections performed, NCRs raised, hold points executed, test results
- Document access restrictions, equipment breakdowns, material shortages, or other impediments
- Capture field photographs with location references and brief captions
- Distribute the daily report by end of shift to the construction management team

### Step 3: Compile Weekly Management Report

- Aggregate daily data for the reporting week (typically Monday through Friday or Saturday)
- Calculate weekly KPIs: physical progress earned this week, cumulative progress, safety metrics (manhours, TRIR, LTIR), quality metrics (NCR count, ITP compliance, weld repair rate), schedule metrics (milestones achieved)
- Compare planned vs. actual progress for the week and cumulative, calculating the variance and explaining root causes for variances exceeding 2%
- Prepare the discipline-by-discipline progress summary with planned vs. actual percentages and variance explanations
- Compile the subcontractor performance summary: progress, safety, quality, and schedule performance per contractor with ranking
- Document key issues and risks with specific mitigation actions, responsible parties, and target dates
- Generate the 2-week look-ahead: critical activities planned for the next 14 days with resource requirements, material availability, and permit needs
- Include management commentary: analysis of trends, root causes of variances, and recommended corrective actions
- Compare this week's KPIs against the prior week to highlight improvement or deterioration trends

### Step 4: Produce Monthly Executive Report

- Aggregate weekly data for the reporting month, ensuring consistency with previously published weekly reports
- Calculate earned value metrics: CPI = EV/AC, SPI = EV/PV, EAC projection, VAC, TCPI -- present with trend over last 3-6 months
- Generate S-curve analysis: plot Planned Value, Earned Value, and Actual Cost curves; identify crossover points and divergence trends
- Produce milestone tracking: all project milestones with planned date, forecast date, actual date (if achieved), and variance in days
- Compile comprehensive safety analysis: monthly TRIR/LTIR trends, incident classification, safety program effectiveness assessment
- Generate quality trending: NCR rates, ITP compliance trends, weld repair rate trends, punchlist aging analysis -- all with 3-6 month trend context
- Analyze construction risk register: new risks, escalated risks, closed risks, residual risk profile
- Compile subcontractor performance scorecard: ranking all contractors by composite score across progress, safety, quality, and schedule dimensions
- Assess manpower loading: actual vs. planned headcount by discipline, productivity indices (units installed per manhour), and mobilization/demobilization forecast
- Prepare management narrative: executive summary of key findings, strategic issues, and specific recommendations requiring management decisions
- Include photo documentation section: 10-15 selected progress photographs showing key achievements and areas of concern
- Produce an MC milestone readiness assessment: for each system approaching MC in the next 60 days, summarize ITP completion, punchlist status, and outstanding prerequisites

### Step 5: Distribute and Archive

- Format each report according to the VSC report template with professional layout, headers, footers, and branding
- Validate all calculations, cross-references, and chart data before distribution
- Distribute daily reports by end of shift (or by 07:00 next business day)
- Distribute weekly reports by close of business Tuesday following the reporting week (allows Monday for data compilation)
- Distribute monthly reports by the 10th business day of the following month
- Archive all reports in the project document management system with proper revision control
- Feed report data to the Orchestrator Agent for OR program-level dashboard and gate review documentation
- Update the construction reporting register with report number, date, and distribution confirmation

---

## Failure Modes & Common Pitfalls

| Failure Mode | Root Cause | Prevention Strategy |
|-------------|-----------|---------------------|
| Report data is stale (not current to cut-off date) | Source skills not updated before report compilation | Establish data freeze deadlines: all source data updated by reporting period close +1 day |
| Metrics contradict between report sections | Data pulled from different sources at different times | Single data extraction event with timestamp; all metrics calculated from same dataset |
| Report is purely backward-looking with no forward-looking analysis | Reporter focuses on recording history rather than projecting trends | Template mandates look-ahead section and trend commentary in weekly and monthly reports |
| Subcontractor performance data omitted or whitewashed | Political pressure to avoid calling out underperforming contractors | KPIs calculated objectively from data; narrative presents facts without editorial judgment |
| Report distributed late, reducing value | Compilation process too manual, waiting for lagging inputs | Automated data aggregation from source skills; disciplined reporting calendar with accountability |
| Earned value metrics miscalculated | EVM methodology inconsistently applied or data entry errors | Automated EVM calculations with built-in validation checks; cross-reference with finance data |
| Report length excessive, key messages buried | Reporter includes too much detail without prioritized summary | Executive summary mandatory on first page; detailed data in appendices; 3-page maximum for executive summary |

---

## Escalation Protocols

| Trigger | Timeline | Escalation Path |
|---------|----------|-----------------|
| Source data not available by data freeze deadline | Data freeze +4 hours | Report Compiler -> Source Skill Owner -> Construction Manager |
| Physical progress >5% behind plan (cumulative) | In weekly report | Construction Manager -> Project Manager (schedule recovery plan required) |
| TRIR exceeds 2.0 for any rolling 12-month period | In weekly report | HSE Manager -> Construction Manager -> Project Director (safety stand-down evaluation) |
| CPI or SPI drops below 0.90 | In monthly report | Project Controls -> Project Manager -> Project Director (recovery plan required) |
| Any fatality or serious injury | Immediate | Project Director -> Client Senior Management -> Regulatory Authority |
| NCR rate exceeds 3.0 per 10,000 manhours for any contractor | In weekly report | QC Manager -> Construction Manager -> Contractor Site Manager |
| Report not distributed by deadline | Deadline +4 hours | Construction Manager -> responsible party -> Project Manager |

---

## Quality Criteria

| Dimension | Weight | Target | Measurement |
|-----------|--------|--------|-------------|
| Technical Accuracy | 30% | All metrics mathematically correct; EVM calculations validated; progress data reconciled across sources | Cross-check calculations; audit data sources |
| Completeness | 25% | All mandatory report sections present; all KPIs calculated; no "TBD" or placeholder entries | Checklist of mandatory sections and metrics |
| Consistency | 15% | Metrics consistent between report sections and with previously published reports; KPI definitions unchanged | Comparison with prior report; consistency audit |
| Format | 10% | Professional layout per VSC template; charts properly labeled; consistent use of units and decimal places | Visual review against template |
| Actionability | 10% | Every issue has assigned owner and target date; recommendations are specific and achievable; management decisions clearly stated | Review of issues and recommendations sections |
| Traceability | 10% | Every metric cites source skill/register; data cut-off date stated; data vintage noted for any lagging inputs | Source citation audit |

---

## Inter-Agent Dependencies

### Inputs From

| Agent / Skill | What is Provided | Criticality |
|---------------|-----------------|-------------|
| track-construction-progress | Physical progress data by discipline, area, and system | Critical |
| monitor-construction-safety | Safety metrics: manhours, incidents, observations, TRIR, LTIR | Critical |
| manage-field-quality | Quality data: NCRs, punchlist, ITP compliance, weld repair rates | Critical |
| Execution Agent (Project Controls) | Schedule data, milestones, earned value (BCWS, BCWP, ACWP), risk register | Critical |
| All other construction management skills | Permit data, RFI metrics, welding progress, MCC status, subcontractor data | High |

### Outputs Consumed By

| Agent / Skill | What is Consumed | Trigger |
|---------------|-----------------|---------|
| Orchestrator Agent | Construction KPIs and progress data for OR program dashboard and gate reviews | Weekly/Monthly |
| Execution Agent (Project Controls) | Schedule variance analysis and milestone tracking for reforecasting | Weekly/Monthly |
| Execution Agent (Finance) | Cost and earned value data for financial reporting and cash flow updates | Monthly |
| All Stakeholders (Client, Contractors, Management) | Complete construction status for decision-making | Per report frequency |
| manage-epc-interfaces | Construction progress data supporting interface resolution tracking | Continuous |

---

## References

### Methodology References
- VSC OR Playbook -- Construction Reporting Framework (Level 4: Construction Execution)
- VSC Project Reporting Standards -- Report templates, KPI definitions, and distribution protocols
- VSC Earned Value Management Guidelines -- CPI/SPI calculation methodology and interpretation
- VSC Progressive Handover Protocol -- Reporting requirements at each handover milestone

### Industry Standards
- PMI Practice Standard for Earned Value Management -- EVM metrics and reporting
- AACE RP 10S-90 -- Cost Engineering Terminology (standardized KPI definitions)
- CII (Construction Industry Institute) -- Best Practices for Construction Progress Monitoring and Reporting
- ISO 21500:2021 -- Project Management (reporting and communication requirements)
- AACE RP 29R-03 -- Forensic Schedule Analysis (for variance root cause reporting)

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-25 | Initial creation -- Wave 3 |
