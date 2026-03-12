---
name: track-construction-progress
description: "Measure and report physical construction progress using weighted earned-value methods across disciplines, areas, and turnover systems. Triggers: 'construction progress', 'earned value', 'avance de construccion', 'curva S', 'progreso fisico', 'field progress tracking'."
---

# Track Construction Progress

## Skill ID: CM-001

## Version: 1.0.0

## Category: D-Monitoring (Construction Management)

## Priority: P1 - Critical

---

## Purpose

Measure and report physical construction progress using weighted earned-value methods across disciplines (civil, structural, mechanical, piping, electrical, instrumentation), geographical areas, and turnover systems. This skill produces the single source of truth for construction advancement that feeds project controls, management reporting, and schedule recovery planning.

Accurate construction progress measurement is the foundation of effective project management during the execution phase. Without a robust, auditable progress measurement system, project teams rely on subjective estimates that routinely overstate completion by 10-20% -- a phenomenon known as the "90% syndrome" where projects appear nearly complete for months. This optimism bias masks schedule slippage until recovery becomes impossible, leading to cost overruns, missed milestones, and stakeholder credibility damage.

The quantity-based earned value method eliminates subjectivity by linking progress to verifiable physical quantities: metres of pipe installed, cubic metres of concrete poured, tonnes of steel erected, cables pulled, instruments calibrated. Combined with weighted rule-of-credit systems that assign fractional completion to intermediate steps, this approach provides a defensible, auditable progress measurement that withstands contractor claim disputes and management scrutiny.

Key value drivers:
- **Early warning**: Variance detection at >5% triggers narrative analysis before small deviations become major delays
- **Claim verification**: Quantity-based progress provides objective cross-check against contractor payment claims
- **Schedule recovery**: Three progress views (discipline/area/system) enable targeted resource reallocation
- **Management confidence**: S-curve reporting (planned/actual/forecast) provides visual schedule health at a glance
- **Turnover integration**: System-level progress tracking directly feeds MC readiness assessments

---

## Intent & Specification

The AI agent MUST understand that:

1. **Quantity-Based Earned Value**: All progress measurement must be anchored in verifiable physical quantities (metres, tonnes, cubic metres, units), not subjective percentage estimates. Each discipline has its own quantity units and measurement conventions that must be respected and consistently applied across all contractors.
2. **Three Progress Views**: The system must simultaneously maintain three orthogonal views of the same underlying progress data -- by discipline (civil, structural, mechanical, piping, electrical, instrumentation), by geographical area (plant areas, buildings, zones), and by turnover system (commissioning systems aligned with progressive handover). These three views must always reconcile to the same total project progress.
3. **Rule of Credit**: Each construction activity is broken into weighted milestones (e.g., pipe spool: fabrication 30%, fit-up 20%, welding 30%, NDE 10%, hydro-test 10%) that define when partial credit is earned. The rule of credit must be agreed with contractors before work begins and consistently applied.
4. **Variance Analysis with Narrative**: Any variance exceeding 5% between planned and actual progress at discipline, area, or system level must trigger a narrative explanation identifying root cause, impact assessment, and recovery actions. Variance without explanation is noise; variance with analysis is intelligence.
5. **Daily Field Verification**: Progress data must be collected daily from field supervisors and cross-verified against contractor reports. Discrepancies between owner and contractor progress measurement exceeding 3% at discipline level must be reconciled within 48 hours.

### Constraints

- Progress measurement methodology must be agreed with all contractors before construction start
- Rule of credit weightings must be documented and immutable during the reporting period (changes require formal change control)
- S-curves must show three lines: planned (baseline), actual, and forecast (projection based on current productivity)
- All progress data must be traceable to daily field reports (no unsubstantiated numbers)
- System-level progress must align with turnover boundaries defined by the commissioning team
- Contractor claims for payment must be cross-verified against independently measured progress before approval
- Progress reports must distinguish between installed quantities and tested/accepted quantities
- Weekly cut-off for progress measurement must be consistent (typically Thursday 17:00 site time)

---

## Trigger / Invocation

```
/track-construction-progress
```

### Natural Language Triggers
- "What is the current construction progress?"
- "Generate the weekly progress report for construction"
- "Show me the S-curve for piping discipline"
- "Cual es el avance de construccion actual?"
- "Generar informe semanal de progreso de obra"
- "Mostrar curva S por disciplina y area"

### Command Triggers
- `track-construction-progress report --period [weekly|monthly] --view [discipline|area|system]`
- `track-construction-progress scurve --scope [project|discipline|area|system] --id [identifier]`
- `track-construction-progress variance --threshold [%] --groupby [discipline|area|contractor]`
- `track-construction-progress daily --date [YYYY-MM-DD] --area [area-id]`
- `track-construction-progress reconcile --contractor [name] --discipline [disc-code]`

### Automatic Triggers

| Trigger Condition | Action | Priority |
|-------------------|--------|----------|
| Weekly cut-off date reached (Thursday 17:00) | Generate weekly progress report | High |
| Discipline variance exceeds 5% | Generate variance narrative request | Critical |
| Contractor claim submitted | Cross-verify progress against owner measurement | High |
| System approaches 85% completion | Alert MC readiness team | High |
| Monthly reporting cycle | Generate monthly S-curve update and executive summary | High |
| Daily field reports submitted | Aggregate and validate progress data | Medium |

---

## Input Requirements

### Required Inputs

| Input | Source | Format | Description |
|-------|--------|--------|-------------|
| WBS and Schedule Baseline | Execution (Project Controls) | .xer / .xml / .xlsx | Approved baseline schedule with activity-level planned quantities and durations |
| Quantity Take-offs | Engineering | .xlsx | Total installed quantities per discipline per area per system |
| Rule of Credit Tables | Project Controls | .xlsx | Weighted milestone definitions per activity type per discipline |
| Daily Field Reports | Field Supervisors | .xlsx / forms | Daily installed quantities by discipline, area, crew, and activity |
| Contractor Progress Reports | Contractors | .xlsx / .pdf | Contractor-submitted progress data (weekly) |

### Optional Inputs

| Input | Source | Format | Default if Absent |
|-------|--------|--------|-------------------|
| System Boundary Definitions | Operations / Commissioning | .xlsx | System view deferred until boundaries defined |
| Weather/Downtime Log | Site Management | .xlsx | Variance analysis limited to quantity data only |
| Resource Histograms | Contractors / Project Controls | .xlsx | Productivity analysis based on progress only |
| Previous Period Reports | Document Control | .docx / .xlsx | No trend baseline; report starts fresh |

### Context Enrichment

The agent will automatically:
- Map discipline codes to standard construction taxonomy (CSI/UniFormat or project-specific WBS)
- Generate area-to-system cross-reference matrix from engineering documentation
- Retrieve planned S-curve data from baseline schedule
- Calculate earned value using agreed rule-of-credit weightings
- Compare contractor-reported vs. owner-measured progress for reconciliation
- Pull productivity benchmarks from VSC knowledge base for the specific industry sector
- Cross-reference system progress with MC readiness checklists

---

## Output Specification

### Filename Format
`{ProjectCode}_Construction_Progress_{Period}_{YYYYMMDD}.xlsx`

### Structure

1. **Executive Dashboard** -- Single-page summary with overall project progress, discipline breakdown, S-curve thumbnail, and top 5 variance items requiring management attention.

2. **Discipline Progress** -- Detailed progress by discipline (civil, structural, mechanical, piping, electrical, instrumentation) showing planned vs. actual quantities, percentage complete, earned value, variance, and productivity metrics (units installed per man-hour).

3. **Area Progress** -- Geographical view showing progress by plant area with heat-map visualization, area-level S-curves, and identification of areas lagging or leading plan.

4. **System Progress** -- Turnover system view showing MC-oriented progress per system, ranked by commissioning priority, with system readiness percentage and projected completion date.

5. **Variance Analysis** -- All variances exceeding 5% with root cause narrative, schedule impact assessment, recovery actions, and responsible party. Includes trend analysis showing whether variances are improving or worsening.

6. **S-Curve Package** -- Full S-curves (planned/actual/forecast) at project, discipline, area, and system levels. Forecast line based on current 4-week average productivity rate extrapolated to completion.

### Key Metrics Table

| Metric | Unit | Calculation | Target |
|--------|------|-------------|--------|
| Overall Physical Progress | % | Weighted sum of discipline progress | Per baseline |
| Schedule Performance Index (SPI) | Ratio | Earned Value / Planned Value | >= 0.95 |
| Progress Variance by Discipline | % | Actual - Planned per discipline | < 5% absolute |
| Contractor Measurement Delta | % | Owner progress - Contractor progress | < 3% absolute |
| Daily Reporting Compliance | % | Reports received / reports expected | >= 95% |

---

## Procedure

### Step 1: Establish Progress Measurement Baseline

1. Obtain approved baseline schedule with activity-level detail per discipline, area, and system
2. Extract total installed quantities per discipline from engineering quantity take-offs (BOQs, MTOs)
3. Agree rule-of-credit tables with each contractor specifying weighted milestones per activity type
4. Create the three mapping matrices: discipline-to-WBS, area-to-WBS, system-to-WBS
5. Generate planned S-curves at project, discipline, area, and system levels from baseline
6. Establish weekly reporting cut-off conventions and distribution schedule
7. Set up daily field report templates aligned with discipline quantity categories

### Step 2: Collect and Validate Daily Progress

1. Receive daily field reports from each discipline supervisor recording installed quantities and completed milestones
2. Cross-check reported quantities against visual field verification (spot audits on minimum 20% of reported activities)
3. Apply rule-of-credit weightings to convert completed milestones into earned progress percentages
4. Aggregate daily data into weekly period totals by discipline, area, and system
5. Compare owner-measured progress against contractor-reported progress at discipline level
6. Reconcile discrepancies exceeding 3% through joint measurement with contractor within 48 hours
7. Record weather days, force majeure events, and other non-productive time for variance explanation

### Step 3: Calculate Earned Value and Generate S-Curves

1. Calculate earned value per activity: physical quantity installed x rule-of-credit weight x activity budget weight
2. Aggregate earned value to discipline, area, and system levels using the mapping matrices
3. Calculate Schedule Performance Index (SPI = Earned Value / Planned Value) at each aggregation level
4. Plot actual progress against baseline planned curve to produce actual S-curve
5. Calculate forecast completion using rolling 4-week average productivity rate extrapolated to remaining scope
6. Identify crossover points where actual curve diverges from plan by more than 5%

### Step 4: Perform Variance Analysis

1. Identify all discipline/area/system combinations where variance exceeds 5% (positive or negative)
2. For each variance item, document root cause: resource constraints, weather, engineering delays, access conflicts, material shortages, rework
3. Assess schedule impact: calculate days of delay attributable to each variance item
4. Define recovery actions with responsible party, target date, and expected progress recovery
5. Track recovery action implementation from previous reporting periods (are actions producing results?)
6. Calculate trend: is variance improving, stable, or worsening over the last 4 reporting periods?

### Step 5: Produce Reports and Cross-Verify Claims

1. Generate the weekly Construction Progress Report with all six output sections populated
2. Produce discipline-specific S-curve charts with planned/actual/forecast lines
3. Cross-verify contractor payment claims against owner-measured progress; flag discrepancies exceeding 3%
4. Provide system-level progress to MC readiness team for systems approaching 85% completion
5. Distribute reports to construction management, project controls, and client per agreed distribution matrix
6. Archive all supporting data (daily field reports, quantity records, photographs) for audit traceability

---

## Failure Modes & Common Pitfalls

| Failure Mode | Root Cause | Prevention Strategy |
|-------------|-----------|---------------------|
| "90% syndrome" -- progress stalls near completion | Subjective estimation without quantity basis | Enforce quantity-based measurement with verifiable field data |
| Contractor overstates progress for payment | Misaligned incentives between progress and payment | Independent owner measurement with weekly reconciliation |
| Three views do not reconcile | Inconsistent mapping between discipline/area/system | Validate mapping matrices at project start; automated reconciliation checks |
| Forecast S-curve unrealistically optimistic | Productivity rate inflated by using peak-period data | Use rolling 4-week average (not peak) for forecast extrapolation |
| Variance reports lack actionable narrative | Analysts report numbers without root cause investigation | Mandate root cause + recovery action for every variance >5% |
| Daily field reports incomplete or late | Supervisors view reporting as administrative burden | Standardize simple mobile-friendly forms; enforce next-day submission |
| Rule of credit disputed mid-project | Agreement not documented at project start | Formal sign-off on rule-of-credit tables before first progress measurement |

---

## Escalation Protocols

| Trigger | Timeline | Escalation Path |
|---------|----------|-----------------|
| Discipline variance exceeds 5% for 2 consecutive weeks | Within 48 hours of second occurrence | Construction Manager -> Recovery plan required |
| Overall project SPI falls below 0.90 | Within 24 hours | Project Director + Client notification |
| Contractor measurement delta exceeds 5% unreconciled | Within 72 hours of discovery | Commercial Manager -> Joint survey required |
| Daily field reports missing for >2 consecutive days | Same day as third miss | Discipline Lead -> Site Manager escalation |
| System progress insufficient for MC target date | 30 days before MC target | Commissioning Lead + Construction Manager -> Resource reallocation |
| Forecast completion date exceeds contract milestone by >14 days | Within 24 hours of forecast update | Project Director -> Schedule recovery workshop |
| Progress data manipulation suspected | Immediately | Project Director + Compliance Officer |

---

## Quality Criteria

| Dimension | Weight | Target | Measurement |
|-----------|--------|--------|-------------|
| Technical Accuracy | 30% | All progress figures traceable to field data | Audit of 10% sample against field reports |
| Completeness | 25% | All six output sections populated; all three views reconciled | Automated completeness check |
| Consistency | 15% | Three progress views reconcile within 0.5% | Cross-view reconciliation formula |
| Format | 10% | VSC branding, professional charts, no formatting errors | Visual QA review |
| Actionability | 10% | Every variance >5% has root cause + recovery action | Variance narrative audit |
| Timeliness | 10% | Weekly report distributed within 24 hours of cut-off | Distribution timestamp |

---

## Inter-Agent Dependencies

### Inputs From

| Agent | Data Required | Frequency | Criticality |
|-------|-------------|-----------|-------------|
| Execution (Project Controls) | Baseline schedule, WBS, planned quantities | At baseline + each rebaseline | Critical |
| Operations | System/turnover boundaries for system-level view | At project start + changes | High |
| Contracts & Compliance | Contractor payment milestones for claim cross-verification | Per payment cycle | High |
| Engineering (via Doc Control) | Quantity take-offs, material take-offs | At IFC + revisions | Critical |

### Outputs Consumed By

| Consumer Agent | Data Provided | Frequency | Usage |
|----------------|-------------|-----------|-------|
| Orchestrator | Overall and system-level progress, variance summary | Weekly | Management reporting, OR gate reviews |
| Execution (Schedule) | Actual progress for schedule update, SPI, forecast dates | Weekly | Schedule recovery planning |
| manage-mechanical-completion | System-level progress percentages | Weekly | MC readiness assessment |
| coordinate-subcontractors | Contractor-level progress and productivity metrics | Weekly | Contractor performance scoring |
| Finance/Accounting | Earned value data for cost reporting | Monthly | Cost performance analysis |

---

## References

- **AACE RP 22R-01**: Earned Value Management — cost/schedule integration methodology
- **AACE RP 96R-18**: Commissioning and Startup — progress measurement for pre-operational phase
- **PMI Practice Standard for Earned Value Management** — EVM fundamentals and application
- **CII RT-012**: Pre-Project Planning — quantity-based progress measurement best practices
- **Chilean NCh 2861 / ISO 21500**: Project management standards applicable in Chile

---

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-25 | VSC OR Team | Initial creation -- Wave 3 |
