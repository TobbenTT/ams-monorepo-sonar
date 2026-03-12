---
name: analyze-workforce-metrics
description: >
  Workforce analytics and KPI tracking for industrial Operational Readiness
  projects. Computes, trends, and benchmarks key HR metrics including headcount
  tracking, voluntary and involuntary turnover, time-to-fill, cost-per-hire,
  diversity indicators, absenteeism rates, and overtime utilization. Produces
  executive dashboards and data-driven recommendations for workforce optimization
  during mobilization, commissioning, and ramp-up phases.
category: B - Analysis
priority: High
version: 1.0.0
agent: hr-talent
---

# Analyze Workforce Metrics

## Purpose

This skill provides the HR & Talent agent with analytical capabilities to measure,
monitor, and optimize workforce performance throughout the OR project lifecycle.
Industrial projects involve workforce dynamics that differ significantly from
steady-state operations: rapid headcount ramps, high proportions of short-tenure
employees, remote/FIFO arrangements that amplify turnover risk, and compressed
timelines where every unfilled position directly impacts commissioning milestones.

Data-driven workforce management is essential for OR success. Without systematic
metrics tracking, project leadership operates blind to emerging risks: rising
turnover that threatens institutional knowledge, overtime trends that signal
understaffing or burnout, or diversity gaps that may violate regulatory
requirements or social license commitments.

This skill transforms raw HR data into actionable intelligence, providing the
Orchestrator and project leadership with the visibility needed to make timely
interventions and maintain workforce readiness aligned with OR milestones.

## Intent & Specification

The skill SHALL:

1. **Track headcount metrics** including actual vs. planned staffing by department,
   role type, OR phase, and jurisdiction. Calculate fill rates, vacancy rates,
   and staffing trajectory against the master staffing plan to identify deviations
   before they impact critical path activities.
2. **Analyze turnover patterns** distinguishing voluntary from involuntary
   separations, calculating annualized turnover rates by department and role type,
   identifying root causes through exit interview data analysis, and benchmarking
   against industry standards for mining, oil & gas, and chemicals sectors.
3. **Compute recruitment efficiency metrics** including time-to-fill by role
   category, cost-per-hire by sourcing channel, offer acceptance rates, new hire
   quality scores (90-day retention, competency assessment pass rates), and
   sourcing channel effectiveness.
4. **Monitor diversity and inclusion indicators** including gender representation
   by level, local vs. expatriate ratios, community hiring percentages against
   commitments, age distribution, and disability inclusion where reported.
5. **Track absenteeism and attendance patterns** including unplanned absence rates,
   sick leave utilization, FMLA/parental leave, and pattern analysis to identify
   emerging issues (specific shifts, departments, or periods with elevated absence).
6. **Analyze overtime utilization** tracking actual overtime hours against budgeted
   allowances, identifying departments or roles with chronic overtime (potential
   understaffing or inefficiency indicators), and calculating overtime cost impact.
7. **Produce executive dashboards and trend reports** with visualizable data
   suitable for inclusion in gate review packages, client presentations, and
   Orchestrator progress reports.

## Trigger / Invocation

### English Triggers
- "Analyze workforce metrics for this project"
- "What is our current headcount vs. plan?"
- "Generate a turnover analysis report"
- "What is the average time-to-fill for technical roles?"
- "Show me the overtime trend for the last 4 weeks"
- "Produce a diversity dashboard"
- "What is our absenteeism rate by department?"
- "Compare our metrics to industry benchmarks"

### Spanish Triggers (Latin American)
- "Analizar metricas de fuerza laboral para este proyecto"
- "Cual es nuestra dotacion actual vs. plan?"
- "Generar un informe de analisis de rotacion"
- "Cual es el tiempo promedio de cobertura para roles tecnicos?"
- "Mostrar la tendencia de horas extra de las ultimas 4 semanas"
- "Producir un dashboard de diversidad"
- "Cual es nuestra tasa de ausentismo por departamento?"
- "Comparar nuestras metricas con benchmarks de la industria"

## Input Requirements

### Required Inputs

| Input | Source | Format | Description |
|-------|--------|--------|-------------|
| Staffing Plan | Operations agent | MD/XLSX | Approved headcount targets by role, department, phase |
| Workforce Register | manage-recruitment-pipeline | MD/XLSX | All active personnel with hire dates, roles, departments |
| Recruitment Pipeline Data | manage-recruitment-pipeline | MD/XLSX | Requisition dates, fill dates, sourcing channels, costs |
| Attendance Records | Client HRIS / Operations | CSV/XLSX | Daily attendance, leave, and overtime data per employee |

### Optional Inputs

| Input | Source | Format | Description |
|-------|--------|--------|-------------|
| Exit Interview Data | HR & Talent | MD/XLSX | Separation reasons, exit interview themes |
| Industry Benchmark Data | External / VSC knowledge base | XLSX | Sector-specific turnover, absence, and recruitment benchmarks |
| Compensation Data | Client HR | XLSX | Salary bands for cost-per-hire and compensation analysis |
| Demographic Data | Client HR | XLSX | Gender, age, nationality, community affiliation for diversity metrics |
| Overtime Budget | Execution agent | XLSX | Planned overtime allowances by department and period |

### Context Enrichment
- The skill reads `methodology/or-concepts/` for OR phase definitions and typical workforce patterns
- Industry benchmarks are loaded from VSC knowledge base where available
- Previous project metrics from VSC archives serve as internal benchmarks
- Commissioning milestone dates from Execution agent inform headcount readiness targets

## Output Specification

The skill produces the following deliverables:

1. **Workforce Metrics Dashboard** (`output/hr/workforce-metrics-dashboard.md`)
   - Executive summary with headline KPIs and traffic-light status
   - Headcount actual vs. plan (table and trend)
   - Turnover rate (monthly and rolling 12-month annualized)
   - Time-to-fill and cost-per-hire summaries
   - Absenteeism rate
   - Overtime utilization percentage

2. **Headcount Analysis Report** (`output/hr/headcount-analysis.md`)
   - Detailed staffing trajectory by department and role type
   - Fill rate progression over time
   - Vacancy analysis with impact assessment on OR milestones
   - Forecast: projected headcount at key milestone dates

3. **Turnover Analysis Report** (`output/hr/turnover-analysis.md`)
   - Voluntary vs. involuntary breakdown
   - Turnover by department, role type, tenure band, and jurisdiction
   - Exit interview theme analysis
   - Root cause categorization (compensation, work conditions, career, personal)
   - Benchmark comparison with industry data
   - Retention risk assessment for critical roles
   - Recommended retention interventions

4. **Recruitment Efficiency Report** (`output/hr/recruitment-efficiency.md`)
   - Time-to-fill distribution by role category
   - Cost-per-hire by sourcing channel
   - Offer acceptance rate trends
   - New hire quality metrics (90-day retention, competency pass rates)
   - Sourcing channel ROI analysis
   - Recommendations for sourcing strategy optimization

5. **Overtime and Absenteeism Report** (`output/hr/overtime-absenteeism.md`)
   - Overtime hours actual vs. budgeted by department
   - Overtime cost impact analysis
   - Chronic overtime identification (roles/departments exceeding thresholds)
   - Absenteeism rate by department, shift pattern, and day of week
   - Pattern analysis and emerging trend identification
   - Recommendations for workload rebalancing or additional hiring

6. **Diversity and Inclusion Report** (`output/hr/diversity-report.md`)
   - Gender representation by organizational level
   - Local community hiring percentage vs. commitments
   - Expatriate/national ratio by role type
   - Disability inclusion metrics (where data available)
   - Regulatory compliance status for diversity-related obligations

## Procedure

### Step 1: Collect and Validate Data
- Ingest staffing plan from Operations agent as the baseline for all comparisons
- Collect current workforce register from manage-recruitment-pipeline
- Obtain attendance records, overtime data, and leave records from client HRIS or
  Operations agent time tracking
- Collect separation data (dates, reasons, exit interview summaries)
- Validate data quality:
  - Check for missing records (employees in payroll but not in register)
  - Verify date consistency (hire dates, separation dates, attendance gaps)
  - Identify and flag data anomalies for resolution
  - Document data quality score and any limitations on analysis

### Step 2: Compute Core Metrics
- **Headcount Metrics:**
  - Actual headcount by department, role type, shift, jurisdiction
  - Planned headcount from staffing plan by same dimensions
  - Fill rate = actual / planned per category
  - Net change = hires - separations per period
  - Vacancy count and average vacancy duration
- **Turnover Metrics:**
  - Monthly separations by type (voluntary, involuntary, end-of-contract)
  - Monthly turnover rate = separations / avg headcount * 100
  - Annualized turnover = monthly rate * 12 (or rolling 12-month actual)
  - Turnover by tenure band (<3mo, 3-6mo, 6-12mo, >12mo)
  - Early turnover rate (separations within 90 days / hires) -- critical for OR
- **Recruitment Metrics:**
  - Time-to-fill = offer acceptance date - requisition open date (days)
  - Cost-per-hire = total recruitment costs / hires per period
  - Offer acceptance rate = accepted offers / total offers
  - Sourcing channel yield = hires per channel / applicants per channel
- **Attendance Metrics:**
  - Absenteeism rate = unplanned absence days / scheduled work days * 100
  - Lost-time rate by cause (sick, personal, unauthorized)
  - Pattern detection: day-of-week, pre/post-rest-day, department correlation
- **Overtime Metrics:**
  - Total overtime hours by department and period
  - Overtime percentage = overtime hours / total hours worked * 100
  - Overtime cost = overtime hours * overtime rate premium
  - Overtime budget utilization = actual / budgeted

### Step 3: Benchmark and Contextualize
- Compare metrics against available benchmarks:
  - **Mining industry** (ICMM data): typical turnover 8-15%, absenteeism 3-5%
  - **Oil & Gas** (IOGP data): typical turnover 5-12%, absenteeism 2-4%
  - **Chemicals** (ACC data): typical turnover 7-10%, absenteeism 3-4%
  - **VSC internal benchmarks**: previous OR project metrics where available
- Contextualize metrics within OR project phase:
  - Mobilization: high hiring volume, time-to-fill is critical metric
  - Commissioning: headcount stability, early turnover is critical
  - Ramp-up: overtime trends indicate staffing adequacy
  - Steady-state transition: all metrics should trend toward industry norms
- Identify statistically significant deviations from benchmarks or trends
- Assess impact of metric deviations on OR milestone delivery

### Step 4: Analyze Root Causes and Generate Insights
- For metrics deviating beyond threshold (>1 standard deviation from benchmark
  or showing adverse trend for 3+ consecutive periods):
  - Perform drill-down analysis by department, role, shift, tenure
  - Cross-reference with qualitative data (exit interviews, manager feedback)
  - Identify contributing factors:
    - **High turnover**: compensation gap, work conditions, limited career path,
      poor onboarding, manager effectiveness, commute/FIFO fatigue
    - **High absenteeism**: health issues, morale, shift pattern fatigue,
      seasonal patterns, management issues
    - **High overtime**: understaffing, scope growth, inefficiency, absenteeism
      backfill, training time displacement
    - **Low fill rates**: market scarcity, uncompetitive offers, slow process
  - Formulate data-driven recommendations with expected impact
  - Prioritize recommendations by cost-effectiveness and timeline to impact

### Step 5: Report, Visualize, and Distribute
- Produce workforce metrics dashboard with traffic-light indicators:
  - **Green**: metric within target range
  - **Amber**: metric approaching threshold (within 10% of trigger)
  - **Red**: metric exceeding threshold, action required
- Generate detailed analysis reports for each metric category
- Format data in tabular structures suitable for visualization tools
- Include trend lines showing metric progression over reporting periods
- Distribute reports:
  - Executive dashboard to Orchestrator for OR progress reporting
  - Detailed reports to HR & Talent lead and project leadership
  - Specific metric alerts to department managers for their areas
- Archive reports in `output/hr/metrics-archive/[period]/`
- Update workforce analytics baseline for next reporting period
- Feed recruitment efficiency insights back to manage-recruitment-pipeline
  for sourcing strategy optimization

## Quality Criteria

| Dimension | Weight | Target | Validation Method |
|-----------|--------|--------|-------------------|
| Technical Accuracy | 30% | All calculations mathematically correct; formulas documented; data validated | Independent recalculation of sample metrics |
| Completeness | 25% | All 6 metric categories covered; no departments or role types excluded from analysis | Coverage audit against workforce register |
| Consistency | 15% | Metric definitions stable period-to-period; same calculation methodology applied uniformly | Methodology documentation review |
| Format | 10% | Professional dashboard format; clear tables; VSC branding; export-ready for client presentations | Template compliance and visual review |
| Actionability | 10% | Each report includes specific, prioritized recommendations with expected impact | Recommendation quality review by HR lead |
| Traceability | 10% | Every metric traces to source data; calculation methodology transparent and auditable | Source data reference audit |

**Minimum passing score: 91%**

## Inter-Agent Dependencies

### Upstream (this skill receives from):
| Agent | Artifact | Dependency Type |
|-------|----------|-----------------|
| Operations | Staffing Plan (baseline headcount targets) | REQUIRED -- denominator for fill rate calculations |
| HR & Talent (self) | Workforce Register from manage-recruitment-pipeline | REQUIRED -- actual headcount and hire data |
| HR & Talent (self) | Recruitment Pipeline Data from manage-recruitment-pipeline | REQUIRED -- time-to-fill and cost data |
| Operations | Attendance and Overtime Records | REQUIRED -- absence and overtime raw data |
| HR & Talent (self) | Separation Data and Exit Interviews | REQUIRED -- turnover analysis inputs |
| Execution | Overtime Budget Allowances | RECOMMENDED -- for overtime budget variance analysis |
| Contracts & Compliance | Community Hiring Commitments | OPTIONAL -- for diversity metric targets |

### Downstream (this skill provides to):
| Agent | Artifact | Dependency Type |
|-------|----------|-----------------|
| Orchestrator | Workforce Metrics Dashboard | REQUIRED -- for OR progress reporting and gate reviews |
| Operations | Headcount Analysis and Overtime Trends | REQUIRED -- for workforce planning adjustments |
| HR & Talent (self) | Recruitment Efficiency Insights to manage-recruitment-pipeline | RECOMMENDED -- sourcing optimization |
| Execution | Workforce Cost Analysis | RECOMMENDED -- for OPEX variance reporting |
| Orchestrator | Workforce Risk Indicators | REQUIRED -- for risk register updates |

## References

- VSC OR Knowledge Base v2.0 (`docs/architecture/_legacy/knowledge-base.md`)
- VSC Multi-Agent Architecture v2 (`docs/architecture/_legacy/multi-agent-architecture.md`)
- VSC Skills Methodology v2 (`skills/VSC_Skills_Methodology_v2.md`)
- SHRM Human Capital Benchmarking Report (Society for Human Resource Management)
- ICMM -- Health and Safety Performance Indicators (International Council on Mining and Metals)
- IOGP Safety Performance Indicators Report (International Association of Oil & Gas Producers)
- ISO 30414:2018 -- Human Resource Management: Guidelines for Internal and External
  Human Capital Reporting
- Saratoga Institute / PwC HR Benchmarking Methodology
- CII RT-318 -- Craft Workforce Availability Metrics

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-25 | VSC OR System | Initial creation of analyze-workforce-metrics skill |
