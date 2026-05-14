---
name: track-engineering-manhours
description: "Track engineering manhour expenditure and productivity by discipline, deliverable type, and project phase. Compare actual vs budgeted manhours to forecast engineering completion. Triggers: 'engineering manhours', 'engineering productivity', 'horas hombre ingenieria', 'productividad de ingenieria', 'control de horas de diseno'."
---

# Track Engineering Manhours

## Skill ID: ENGD-14

## Version: 1.0.0

## Category: D - Monitoring

## Priority: P2 - High

---

## Purpose

Tracks engineering manhour expenditure and productivity across all disciplines, deliverable types, and project phases, comparing actual consumption against budgeted manhours to forecast engineering completion dates, identify resource constraints, and support proactive resource re-allocation decisions. This skill is the primary engineering project controls instrument, providing the data foundation for engineering cost management, schedule forecasting, and resource planning.

Engineering manhours represent 8-15% of total installed cost on capital projects in mining, oil & gas, chemicals, and energy sectors. On a $500M project, engineering can consume $40-75M in labor cost alone. Despite this, engineering manhour tracking is frequently the weakest link in project controls -- often limited to aggregate timesheet collection without the granularity needed to identify productivity problems by discipline, flag deliverable-level overruns before they become critical, or forecast completion with reasonable accuracy.

The consequences of poor engineering manhour tracking cascade through the entire project. Undetected engineering overruns consume contingency early, leaving no buffer for construction-phase surprises. Unbalanced discipline loading creates bottlenecks on the critical path (e.g., process engineering 90% complete but instrument engineering only 40% because IFC process outputs were late). Without earned value analysis at the discipline-deliverable level, engineering managers rely on subjective progress assessments that consistently overstate completion -- a phenomenon known as the "90% complete for 90% of the schedule" problem.

This skill automates the complete engineering manhour lifecycle: timesheet data ingestion from project systems, earned value calculation per discipline and deliverable type, productivity benchmarking (hours per deliverable vs. norms), progress-expenditure S-curve generation, resource forecasting based on remaining scope, and exception alerting when earned value metrics indicate schedule or cost problems. The result is a single, current, trustworthy view of engineering performance that enables data-driven resource decisions.

---

## Intent & Specification

The AI agent MUST understand that:

1. **Earned Value is the Foundation**: Simple actual-vs-budget comparison is insufficient. The skill must calculate Budgeted Cost of Work Performed (BCWP), Budgeted Cost of Work Scheduled (BCWS), and Actual Cost of Work Performed (ACWP) to derive Schedule Performance Index (SPI) and Cost Performance Index (CPI) at the discipline level. These indices are the only reliable predictors of engineering completion.
2. **Granularity Matters**: Aggregate project-level manhour tracking hides discipline-level problems. Tracking must be at minimum at the discipline-deliverable type level (e.g., Process-PFDs, Process-P&IDs, Mechanical-Equipment Specifications, Electrical-Single Line Diagrams) to enable meaningful productivity analysis and targeted corrective action.
3. **Productivity Norms Enable Benchmarking**: Every discipline has expected manhour norms per deliverable type (e.g., hours per P&ID sheet, hours per equipment specification, hours per instrument data sheet). Comparing actual productivity against these norms identifies disciplines or teams operating below expected efficiency.
4. **Forecasting Must Be Quantitative**: Estimate at Completion (EAC) must be calculated using CPI-based formulas, not subjective engineering manager estimates. The formula EAC = BAC / CPI provides a statistically grounded forecast that has been proven more accurate than human estimates on 80%+ of projects.
5. **Resource Forecasting Drives Staffing Decisions**: Remaining manhours by discipline, combined with schedule requirements, drive the forward-looking resource histogram that determines whether additional staff are needed, whether resources can be released, or whether overtime is required to recover schedule.

---

## Trigger / Invocation

```
/track-engineering-manhours
```

### Natural Language Triggers
- "Show me engineering manhour status by discipline"
- "What is the engineering earned value this month?"
- "Forecast engineering completion based on current burn rate"
- "Mostrar estado de horas hombre de ingenieria por disciplina"
- "Cual es el avance ganado de ingenieria este mes?"
- "Pronosticar finalizacion de ingenieria segun tasa actual de consumo"

---

## Input Requirements

### Required Inputs

| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `timesheet_data` | Weekly manhour actuals by person, discipline, project phase, and charge code | .xlsx / API | Project time tracking system / ERP |
| `engineering_budget` | Budgeted manhours by discipline, deliverable type, and project phase | .xlsx | Project Controls / Execution Agent |
| `deliverable_register` | Engineering Deliverable Document Register (EDDR) with planned/actual issue dates and progress % | .xlsx | Engineering Management / Doc Control |
| `project_schedule` | Engineering schedule with discipline milestones and IFC dates | .mpp / .xlsx | Project Controls / Execution Agent |
| `resource_plan` | Planned staffing levels by discipline and month | .xlsx | Engineering Management |

### Optional Inputs

| Input | Description | Default |
|-------|-------------|---------|
| `productivity_norms` | Industry or company standard manhours per deliverable type by discipline | Use VSC standard norms database |
| `change_order_register` | Approved scope changes with associated manhour adjustments | Assume original budget unless provided |
| `previous_period_ev_data` | Prior period earned value data for trend continuity | Calculate from available history |

### Context Enrichment

The agent should automatically:
- Map timesheet charge codes to the discipline-deliverable type matrix for proper allocation of manhours to work categories
- Cross-reference deliverable progress percentages against the EDDR to calculate earned hours (BCWP = Budget x % Complete)
- Retrieve the latest project schedule milestones from Execution agent to identify schedule-driven urgency by discipline
- Calculate cumulative S-curve data points from period-level earned value for trend visualization
- Identify resource conflicts where the same personnel are charging to multiple projects or multiple disciplines within the same period

---

## Output Specification

### Document: Engineering Manhour Report (.xlsx)

**Filename**: `VSC_EngMH_{ProjectCode}_{Period}_{Rev}_{Date}.xlsx`

### Structure

#### Section 1: Executive Summary Dashboard
- Total project engineering manhours: Budget, Actual, Earned, Forecast at Completion
- Overall SPI and CPI with trend arrows (improving/declining)
- S-curve chart: BCWS, BCWP, ACWP cumulative over time
- Top 3 discipline concerns requiring management attention

#### Section 2: Discipline-Level Earned Value Analysis
- Per-discipline breakdown: Budget, Actual to Date, Earned to Date, Remaining, EAC
- SPI and CPI per discipline with RAG status indicators
- Discipline ranking by CPI (worst performers highlighted)
- Variance analysis narrative for each discipline with CPI < 0.90 or SPI < 0.90

#### Section 3: Productivity Analysis by Deliverable Type
- Actual hours per deliverable vs. norm for each discipline-deliverable combination
- Productivity Index (norm hours / actual hours) per category
- Bar chart comparing actual vs. norm productivity across disciplines
- Identification of deliverable types driving productivity shortfalls

#### Section 4: Resource Forecast
- Forward-looking resource histogram by discipline (remaining manhours spread over remaining schedule)
- Current staffing vs. required staffing comparison by discipline
- Over/under-staffing alerts with recommended actions
- Overtime requirement forecast if current staffing maintained

#### Section 5: Period Detail (Weekly/Monthly)
- Period manhour actuals by discipline and charge code
- Period earned value by discipline
- Period progress vs. expenditure comparison
- New scope changes and their manhour impact

#### Section 6: Engineering Change Impact Register
- All approved changes with original budget, change budget, and cumulative impact
- Trend of scope growth as percentage of original budget
- Unfunded scope at risk (pending changes not yet approved)

### Key Metrics

| Metric | Description | Target | Measurement |
|--------|-------------|--------|-------------|
| Cost Performance Index (CPI) | BCWP / ACWP -- efficiency of manhour usage | >0.95 | Earned value calculation |
| Schedule Performance Index (SPI) | BCWP / BCWS -- on-schedule delivery of engineering output | >0.95 | Earned value calculation |
| Estimate at Completion (EAC) | BAC / CPI -- projected total manhours at completion | Within 5% of BAC | CPI-based forecast |
| Productivity Index | Norm hours per deliverable / Actual hours per deliverable | >0.90 | Deliverable-level tracking |
| Forecast Accuracy | Variance between EAC forecast and final actual | <10% variance | Post-completion comparison |

---

## Procedure

### Step 1: Ingest and Validate Timesheet Data

- Retrieve weekly timesheet data from the project time tracking system, extracting person name, discipline, charge code, project phase, and hours per day
- Validate that all hours are charged to valid project charge codes; flag any hours charged to non-project codes or suspended charge codes for correction
- Cross-reference personnel against the project resource plan to verify discipline assignment accuracy; flag personnel charging to disciplines they are not assigned to
- Reconcile total hours per person against expected working hours (standard week +/- approved overtime); flag anomalies such as >60 hours/week without overtime approval or <30 hours/week without approved absence
- Aggregate validated hours by discipline, deliverable type, and project phase for the reporting period
- Calculate cumulative actual hours to date by discipline and overall
- Generate a data quality report showing timesheet completeness percentage, error rate, and corrections applied

### Step 2: Calculate Earned Value Metrics

- Retrieve current progress percentages for all deliverables from the EDDR; validate that progress assessments have been updated within the current reporting period
- Calculate BCWP (Earned Hours) per deliverable: Budget Hours x Physical % Complete; aggregate to discipline level and project total
- Calculate BCWS (Planned Earned Hours) per deliverable: Budget Hours x Scheduled % Complete per the baseline schedule; aggregate to discipline level
- Calculate actual hours (ACWP) per discipline from validated timesheet data
- Derive CPI = BCWP / ACWP for each discipline and for project total; interpret: CPI < 1.0 means over-budget, CPI > 1.0 means under-budget
- Derive SPI = BCWP / BCWS for each discipline and for project total; interpret: SPI < 1.0 means behind schedule, SPI > 1.0 means ahead
- Calculate EAC = BAC / CPI for each discipline (assumes current efficiency will continue); calculate alternative EAC scenarios (optimistic, pessimistic, management estimate)

### Step 3: Analyze Productivity by Discipline and Deliverable Type

- For each discipline-deliverable type combination, calculate actual average hours per deliverable completed (total hours charged / number of deliverables completed)
- Compare actual hours per deliverable against the productivity norm from the norms database; calculate Productivity Index = Norm / Actual
- Identify deliverable types with Productivity Index < 0.80 (significantly below expected productivity) and investigate root causes
- Analyze productivity trends: is productivity improving as the team gains familiarity, or declining due to fatigue, scope creep, or quality issues
- Cross-reference low-productivity areas with the engineering change register to determine whether scope changes are driving higher-than-expected effort
- Generate a productivity heat map showing all discipline-deliverable combinations color-coded by productivity performance
- Document root cause findings and recommended corrective actions for disciplines with sustained CPI < 0.90

### Step 4: Generate Resource Forecast

- Calculate remaining manhours per discipline: Remaining = EAC - Actual to Date
- Distribute remaining manhours across the remaining schedule using the engineering schedule milestones as weighting factors (more hours near IFC deadlines)
- Calculate required staffing per discipline per month: Required FTE = Monthly Hours Required / Available Hours per FTE per Month
- Compare required staffing against current staffing levels and planned mobilization/demobilization
- Identify disciplines where required staffing exceeds available staffing (bottleneck risk) and calculate the schedule impact if staffing constraint is not resolved
- Identify disciplines where available staffing exceeds required staffing (potential for resource release or redeployment to bottleneck disciplines)
- Generate resource histogram charts showing planned vs. required vs. actual staffing by discipline over the remaining engineering schedule

### Step 5: Compile Report and Distribute

- Assemble all analyses into the standard engineering manhour report structure (executive summary, discipline EV, productivity, resource forecast, period detail, change impact)
- Generate S-curve charts with BCWS, BCWP, and ACWP plotted on the same time axis; annotate key events (scope changes, resource changes, milestone dates)
- Prepare variance narratives for every discipline with CPI or SPI outside the 0.90-1.10 acceptable range, including root cause and corrective action
- Calculate period-over-period trends for CPI and SPI to show whether disciplines are improving or deteriorating
- Route the report to Engineering Manager, Project Controls, and Project Manager with executive summary highlighting top 3 issues and recommended actions
- Update the project earned value database with current period data for historical trend continuity
- Set action item reminders for corrective actions identified in the variance analysis

---

## Failure Modes & Common Pitfalls

| Failure Mode | Root Cause | Prevention Strategy |
|-------------|-----------|-------------------|
| Progress over-reporting by disciplines | Subjective progress assessment without objective milestones | Implement milestone-based progress (0/25/50/75/100) tied to deliverable review status, not % estimated by engineer |
| Timesheet data incomplete or inaccurate | Personnel not submitting timesheets on time; incorrect charge codes | Weekly timesheet compliance monitoring; automated charge code validation; management escalation for non-compliance |
| Budget baseline not maintained | Approved scope changes not reflected in budget; baseline creep | Formal change control process; separate original budget and approved changes; freeze baseline after approval |
| CPI/SPI calculated at too aggregate a level | Project-level metrics hide discipline-level problems | Always calculate EV metrics at discipline level minimum; report both discipline-level and project-level |
| Norms database outdated or inapplicable | Norms from different project type, technology, or geography | Validate norms against current project characteristics; adjust for complexity factors; update norms from project actuals |
| Resource forecast ignores learning curve | Flat productivity assumption throughout project duration | Apply learning curve factors to productivity forecast; distinguish between early-phase lower productivity and mature-phase productivity |

---

## Escalation Protocols

| Trigger | Timeline | Escalation Path |
|---------|----------|----------------|
| Discipline CPI < 0.85 for two consecutive reporting periods | 48 hours | Lead Discipline Engineer --> Engineering Manager with root cause analysis |
| Discipline SPI < 0.85 for two consecutive reporting periods | 48 hours | Lead Discipline Engineer --> Engineering Manager --> Project Controls for schedule impact assessment |
| Project EAC exceeds approved budget by >10% | Immediate | Engineering Manager --> Project Manager --> Steering Committee for budget remediation |
| Timesheet compliance below 90% for any discipline | Weekly | Discipline Lead --> Engineering Manager; repeat offenders to HR |
| Resource forecast shows >20% staffing shortfall in any discipline within 60 days | 1 week | Engineering Manager --> Project Manager for resource mobilization decision |
| Productivity Index < 0.70 for any deliverable type sustained over 4 weeks | 48 hours | Lead Discipline Engineer investigates; Engineering Manager reviews corrective action plan |
| Scope growth exceeds 15% of original manhour budget without formal change approval | Immediate | Engineering Manager --> Project Manager --> Change Control Board |

---

## Quality Criteria

| Dimension | Weight | Target | Measurement |
|-----------|--------|--------|-------------|
| Technical Accuracy | 30% | EV calculations mathematically correct; actuals reconcile to timesheet system | Independent calculation audit; system reconciliation |
| Completeness | 25% | All disciplines covered; all deliverable types tracked; no data gaps | Coverage audit: disciplines tracked / total disciplines = 100% |
| Consistency | 15% | Same methodology applied across all periods and disciplines; trend data continuous | Methodology review; period-over-period reconciliation |
| Format | 10% | Clear charts, professional presentation, executive summary actionable | Stakeholder feedback; format compliance check |
| Actionability | 10% | Report identifies specific problems and recommends specific corrective actions | Management review: actions taken based on report findings |
| Traceability | 10% | Every number traceable to source data (timesheets, EDDR, schedule) | Data lineage documentation; source reference in all calculations |

---

## Inter-Agent Dependencies

### Inputs From

| Agent/Skill | Input Provided | Criticality |
|-------------|---------------|-------------|
| `agent-execution` | Engineering budget, project schedule, cost baseline | Critical |
| All Engineering Disciplines | Timesheet data, deliverable progress assessments | Critical |
| `manage-engineering-deliverables` (ENGD skill) | EDDR with deliverable status, planned/actual dates, progress % | Critical |
| `agent-execution` (Project Controls) | Baseline schedule, approved scope changes, change order register | High |
| `manage-engineering-change-orders` (ENGD skill) | Engineering change notices with manhour impacts | High |

### Outputs Consumed By

| Agent/Skill | Output Consumed | Usage |
|-------------|----------------|-------|
| `agent-execution` | EAC forecast, resource requirements, schedule risk assessment | Project cost forecasting and resource planning |
| `agent-orchestrator` | Engineering performance summary for consolidated project reporting | Weekly/monthly project status reports |
| `generate-engineering-status-report` (ENGD-15) | All EV metrics, productivity data, resource forecasts | Consolidated engineering status report generation |
| `agent-execution` (Finance) | Engineering cost forecast and budget variance | Financial reporting and cash flow forecasting |
| `manage-engineering-procurement-specs` (ENGD-13) | Engineering effort remaining for procurement package preparation | Procurement schedule forecasting |

---

## References

### Methodology References
- VSC OR Playbook -- Engineering Management and Project Controls sections
- VSC Engineering Productivity Norms Database -- Standard hours per deliverable by discipline
- PMI Practice Standard for Earned Value Management (3rd Edition)
- AACE International Recommended Practice 29R-03 -- Forensic Schedule Analysis

### Industry Standards
- ANSI/EIA-748 -- Earned Value Management Systems (EVMS) standard
- ISO 21508:2018 -- Earned Value Management in Project and Programme Management
- AACE International -- Total Cost Management Framework
- IPA (Independent Project Analysis) -- Engineering Productivity Benchmarks for Industrial Projects

---

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-25 | VSC OR System | Initial creation -- Wave 3 |
