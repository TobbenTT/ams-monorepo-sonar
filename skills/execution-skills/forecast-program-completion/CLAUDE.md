---
name: forecast-program-completion
description: "Forecast OR program completion dates using earned value and trend analysis. Triggers: 'program forecast', 'completion forecast', 'pronostico de avance'."
---

# Forecast Program Completion
## Skill ID: PC-03
## Version: 1.0.0
## Category: Project Controls (Agent 6 - Execution)
## Priority: P1 - Critical

---

## Purpose

Generate reliable project completion forecasts using Earned Value Analysis (EVM) methods, Monte Carlo simulation, and S-curve projection, enabling proactive decision-making on schedule recovery and cost management. Accurate forecasting is the foundation of project controls -- without it, cost overruns and schedule delays are discovered too late for effective intervention.

Research from IPA (Independent Project Analysis) and the Construction Industry Institute (CII) demonstrates that projects with robust forecasting systems complete within 10% of their approved budget 85% of the time, compared to only 45% for projects with weak forecasting. The U.S. Government Accountability Office (GAO) and Department of Energy (DOE) have identified earned value management as the single most effective early warning system for cost and schedule problems in capital projects.

The challenge is that most project teams rely on a single forecasting method (typically bottom-up estimate-to-complete), which introduces systematic bias. Project managers tend to be optimistic about remaining work, especially in the early phases when problems are not yet visible. EVM-based methods provide an objective, data-driven complement by projecting future performance based on actual past performance. Monte Carlo simulation adds probabilistic rigor by modeling the range of possible outcomes rather than a single point estimate.

This skill implements a multi-method forecasting approach that combines: (1) Deterministic EVM forecasting using four standard methods (CPI-based, SPI-based, composite CPI x SPI, and independent bottom-up), presenting a range rather than a single number; (2) Probabilistic schedule analysis using Monte Carlo simulation to generate confidence-weighted completion dates (P50, P80, P90); (3) S-curve analysis to visualize planned vs. actual vs. forecast trajectories and identify trend inflections; and (4) Variance decomposition to attribute cost and schedule variances to root causes, enabling targeted corrective action.

A properly implemented forecasting system typically achieves: EAC forecasts within +/-10% of final actual cost from Month 12 onward, completion date forecasts within +/-30 days from 60% progress onward, early identification of cost/schedule problems 3-6 months before they become critical, and objective basis for recovery planning and contingency management.

---

## Intent & Specification

The AI agent MUST understand and execute the following:

1. **EAC Forecasting**: Calculate Estimate at Completion using multiple EVM methods and present range analysis. The agent must:
   - Calculate EAC using four standard methods:
     - EAC1 = BAC / CPI (assumes cost performance continues at current rate)
     - EAC2 = AC + (BAC - EV) / (CPI x SPI) (composite: both cost and schedule performance continue)
     - EAC3 = AC + independent bottom-up ETC (fresh estimate of remaining work)
     - EAC4 = AC + (BAC - EV) (remaining work at original estimate -- optimistic baseline)
   - Present the range: [min(EAC1-4), max(EAC1-4)] with most-likely recommendation
   - Calculate To-Complete Performance Index (TCPI) showing required future CPI to achieve budget
   - Track EAC trend over time (monthly EAC values) to identify trajectory
   - Distinguish between time-dependent costs (affected by schedule) and time-independent costs

2. **Monte Carlo Simulation**: Run probabilistic schedule analysis using Monte Carlo methods to generate P50, P80, P90 completion date distributions. The agent must:
   - Define three-point estimates (optimistic, most likely, pessimistic) for remaining activities
   - Incorporate risk events as probabilistic branches (probability x impact)
   - Run minimum 1,000 iterations for statistical validity (target 5,000-10,000)
   - Generate probability distribution of completion dates
   - Extract key percentiles: P50 (50% confidence), P80 (80% confidence), P90 (90% confidence)
   - Identify critical path sensitivity (which activities appear on critical path most frequently)
   - Model correlation between related activities (not all activities are independent)

3. **S-Curve Analysis**: Generate and compare planned vs. actual vs. forecast S-curves for cost and physical progress, identifying crossover points and trend inflections. The agent must:
   - Plot cumulative Planned Value (BCWS) over project duration
   - Plot cumulative Earned Value (BCWP) -- actual progress in cost terms
   - Plot cumulative Actual Cost (ACWP) -- actual expenditure
   - Project forecast curves based on EAC scenarios
   - Identify crossover points (where actual diverges from plan)
   - Detect trend changes (improvement or deterioration in performance)
   - Generate both cost S-curves and physical progress S-curves

4. **Variance Analysis**: Decompose cost and schedule variances into root causes (scope changes, productivity, escalation, rework, weather, etc.). The agent must:
   - Calculate Cost Variance (CV = EV - AC) and Cost Performance Index (CPI = EV / AC)
   - Calculate Schedule Variance (SV = EV - PV) and Schedule Performance Index (SPI = EV / PV)
   - Decompose CV into root causes: scope changes, productivity variance, material cost escalation, rework costs, change order impacts, other
   - Decompose SV into root causes: scope changes, weather/force majeure, resource constraints, rework, design delays, other
   - Quantify each root cause as % of total variance
   - Track root cause trends over time (are the same issues recurring?)
   - Identify actionable recommendations for each significant root cause

Constraints:
- Must use actual project EVM data (BCWS, BCWP, ACWP) -- never fabricate data
- Must present multiple EAC scenarios (optimistic, most likely, pessimistic)
- Must distinguish between time-dependent and time-independent costs
- Monte Carlo requires minimum 1,000 iterations for statistical validity
- All forecasts must include stated assumptions and confidence levels
- Must integrate with change control (manage-change-control.md) for baseline updates
- Must produce outputs in Spanish (Latin American) with English technical terms preserved (EVM, CPI, SPI, EAC, BAC, etc.)
- When EVM data is unavailable, must clearly state limitations and provide alternative analysis

---

## Trigger / Invocation

```
/forecast-program-completion
```

### Command Triggers
- `forecast-program-completion eac --method [cpi|spi|composite|bottomup|all]`
- `forecast-program-completion montecarlo --iterations [N] --confidence [P50|P80|P90]`
- `forecast-program-completion scurve --period [monthly|weekly]`
- `forecast-program-completion variance --type [cost|schedule|both]`
- `forecast-program-completion report --period [month] --year [year]`
- `forecast-program-completion recovery --target [date|cost] --constraint [budget|schedule|both]`

### Natural Language Triggers
- "What is the forecast completion date and cost?"
- "Run an EVM analysis for the project"
- "Generate the monthly EVM report"
- "Run Monte Carlo on the schedule"
- "Why are we over budget?"
- "What is driving the schedule delay?"
- "Show me the project S-curve"
- "What CPI do we need to finish on budget?"
- "Generar pronostico de finalizacion del proyecto"
- "Analisis de valor ganado mensual"
- "Ejecutar Monte Carlo en el cronograma"
- "Por que estamos sobre presupuesto?"

### Aliases
- `/evm-forecast`
- `/project-forecast`
- `/eac-analysis`
- `/monte-carlo`
- `/scurve`

### Automatic Triggers
- Monthly EVM data update received (standard monthly reporting cycle)
- CPI or SPI drops below 0.90 (early warning trigger)
- CPI or SPI drops below 0.80 (critical warning trigger)
- Change order approved that affects baseline (reforecast trigger)
- TCPI exceeds 1.20 (budget recovery unlikely -- management alert)
- 25%, 50%, 75% physical progress milestones (trend validation points)

---

## Input Requirements

### Required Inputs

| Input | Source | Required | Format | Description |
|-------|--------|----------|--------|-------------|
| EVM Data | Project Controls | Yes | .xlsx / .csv | BCWS, BCWP, ACWP, BAC per WBS element for current and all prior periods |
| Schedule Data | Project Controls | Yes | .xml / .xer / .mpp | Activity-level schedule with logic, original and remaining durations, actual progress, constraints |
| Risk Register | Project Management | Yes | .xlsx | Quantified risks with probability, cost impact range, schedule impact range for Monte Carlo input |
| Change Log | Change Control | Yes | .xlsx | Approved changes affecting baseline with cost and schedule impacts |
| Budget Breakdown | Project Controls | Yes | .xlsx | BAC by WBS element with time-phased budget (monthly/quarterly) |

### Optional Inputs (Strongly Recommended)

| Input | Source | Required | Format | Default if Absent |
|-------|--------|----------|--------|-------------------|
| Historical Benchmarks | Methodology/KBase | No | .xlsx | Industry benchmark CPI/SPI ranges applied (IPA/CII data) |
| Bottom-up ETC | Project Controls | No | .xlsx | ETC calculated from EVM methods only (no independent estimate) |
| Productivity Data | Construction | No | .xlsx | Productivity variance not decomposed in variance analysis |
| Weather Data | Site | No | .xlsx | Weather impact not isolated in variance analysis |
| Escalation Indices | Finance | No | .xlsx | Escalation impact not isolated in cost variance |
| Previous Forecast Reports | Project Controls | No | .docx | Forecast trend not available for comparison |
| Contingency Register | Project Controls | No | .xlsx | Contingency sufficiency not analyzed |

### Context Enrichment (Automatic)

The agent will automatically:
- Retrieve industry benchmark CPI/SPI data from IPA and CII research databases
- Access AACE recommended practices for EVM and forecasting
- Pull Monte Carlo methodology from AACE RP 40R-08
- Retrieve forensic schedule analysis methodology from AACE RP 29R-03
- Access PMI Practice Standard for Earned Value Management
- Query VSC knowledge base for similar project forecasting accuracy data
- Retrieve historical project performance data for calibration of Monte Carlo distributions
- Access ISO 21508 requirements for EVM reporting

---

## Output Specification

### Document 1: Completion Forecast Report (.docx)

**Filename**: `{ProjectCode}_Completion_Forecast_Report_{Month}_{YYYYMMDD}.docx`

**Target Length**: 15-30 pages depending on project size and complexity

**Structure:**

1. **Cover Page** -- VSC branding, project identification, reporting period, data cutoff date, revision status
2. **Document Control** -- Revision history, review and approval matrix, distribution list
3. **Table of Contents** -- Auto-generated, 3 levels
4. **Executive Summary** (2-3 pages)
   - Key metrics at a glance: CPI, SPI, EAC range, forecast completion date range
   - Traffic light status: Budget (G/A/R), Schedule (G/A/R), Risk (G/A/R)
   - Top 3 findings and recommended actions
   - Comparison with previous month forecast (trend direction)
   - Management decision required (if any)
5. **EVM Performance Indices** (2-3 pages)
   - 5.1 Current period performance: CPI, SPI, CV, SV (absolute and %)
   - 5.2 Cumulative performance: CPI, SPI, CV, SV from project start
   - 5.3 Performance trend charts (monthly CPI and SPI over project life)
   - 5.4 To-Complete Performance Index (TCPI): required future CPI to achieve BAC
   - 5.5 Performance interpretation and commentary
   - 5.6 WBS-level performance table (CPI/SPI for each major work package)
6. **EAC Analysis** (3-4 pages)
   - 6.1 Four EAC methods calculated with assumptions stated:
     - EAC1 (CPI-based): best for projects where past cost performance is predictive
     - EAC2 (CPI x SPI composite): best for projects behind schedule with time-dependent costs
     - EAC3 (bottom-up independent): best for projects with significant scope changes
     - EAC4 (original estimate for remaining): only valid if past performance anomalies are corrected
   - 6.2 EAC range: [minimum, maximum] with recommended most-likely value
   - 6.3 EAC trend chart (monthly EAC values over project life)
   - 6.4 EAC sensitivity analysis: what CPI improvement is needed for each EAC scenario?
   - 6.5 Time-dependent vs. time-independent cost breakdown
   - 6.6 Contingency sufficiency analysis (remaining contingency vs. forecast overrun)
7. **Monte Carlo Results** (3-4 pages)
   - 7.1 Methodology description (distribution types, iterations, correlation assumptions)
   - 7.2 Probability distribution of completion dates (histogram)
   - 7.3 Key percentiles: P10, P50, P80, P90, P95
   - 7.4 Critical path sensitivity analysis (activities with highest criticality index)
   - 7.5 Probability of meeting current contractual completion date
   - 7.6 Cost-at-completion probability distribution (if cost Monte Carlo performed)
   - 7.7 Tornado diagram showing top 10 schedule risk drivers
   - 7.8 Comparison with previous month Monte Carlo results
8. **S-Curve Analysis** (2-3 pages)
   - 8.1 Cost S-Curve: BCWS, BCWP, ACWP cumulative with forecast extension
   - 8.2 Physical progress S-Curve: planned vs. actual % complete
   - 8.3 S-Curve interpretation: crossover points, divergence trends, inflection points
   - 8.4 Forecast to completion S-Curve overlay (multiple scenarios)
   - 8.5 Earned schedule analysis (time-based schedule performance)
9. **Variance Root Cause Analysis** (3-4 pages)
   - 9.1 Cost variance decomposition:
     - Scope changes (approved change orders)
     - Productivity variance (actual vs. planned productivity)
     - Material cost escalation (price increases beyond estimate)
     - Rework costs (correction of defects)
     - Other (weather, access, site conditions)
   - 9.2 Schedule variance decomposition:
     - Scope changes (additional work)
     - Weather/force majeure (uncontrollable events)
     - Resource constraints (labor availability, equipment availability)
     - Rework (rework cycles delaying progress)
     - Design delays (late design deliverables)
     - Other (permits, access, third-party dependencies)
   - 9.3 Root cause Pareto analysis (80/20 rule -- which causes drive most variance?)
   - 9.4 Trend analysis of root causes over time (recurring vs. one-time issues)
   - 9.5 Comparison with industry benchmarks (is variance within expected range?)
10. **Recovery Recommendations** (2-3 pages)
    - 10.1 Recovery scenarios (if CPI or SPI < 1.0):
      - Scenario A: Add resources (cost to accelerate, days recovered, probability of success)
      - Scenario B: Re-sequence work (cost, schedule impact, risk)
      - Scenario C: Reduce scope (what can be deferred, cost savings, schedule recovery)
      - Scenario D: Accept delay/overrun (do nothing, manage consequences)
    - 10.2 Cost-benefit analysis of recovery options
    - 10.3 Recommended recovery strategy with implementation plan
    - 10.4 Required decisions and approval timeline
11. **Appendices**
    - A: Detailed WBS-level EVM data tables
    - B: Monte Carlo input assumptions and distributions
    - C: S-Curve raw data
    - D: Variance decomposition detail
    - E: Historical performance data

### Document 2: EVM Dashboard (.xlsx)

**Filename**: `{ProjectCode}_EVM_Dashboard_{Month}_{YYYYMMDD}.xlsx`

**Sheets:**

1. **Summary Dashboard** -- Key metrics, traffic lights, trends
   - Current period: CPI, SPI, CV, SV, EAC, TCPI
   - Cumulative: CPI, SPI, CV, SV
   - Traffic light indicators: Green (CPI/SPI > 0.95), Amber (0.85-0.95), Red (<0.85)
   - Monthly trend sparklines
   - EAC range bar chart
   - Key commentary

2. **WBS-Level EVM** -- Detailed metrics per work package
   - Columns: WBS Code, WBS Description, BAC, PV (BCWS), EV (BCWP), AC (ACWP), SV, CV, SPI, CPI, EAC, ETC, VAC, TCPI, % Complete (Planned), % Complete (Actual), Status
   - Conditional formatting by performance thresholds
   - Sortable and filterable
   - Subtotals by WBS level 1 and level 2

3. **S-Curve Data** -- Monthly cumulative values for charting
   - Columns: Period (month), Cumulative PV, Cumulative EV, Cumulative AC, Period PV, Period EV, Period AC, Cumulative % Complete (Planned), Cumulative % Complete (Actual)
   - Pre-formatted charts: Cost S-Curve, Progress S-Curve, Period Performance Bar Chart
   - Forecast extension columns for each EAC scenario

4. **Monte Carlo Input** -- Risk-adjusted durations and costs
   - Columns: Activity ID, Activity Name, Original Duration, Remaining Duration, Optimistic Duration, Most Likely Duration, Pessimistic Duration, Distribution Type, Correlation Group
   - Risk events: Risk ID, Risk Description, Probability, Cost Impact (min/ML/max), Schedule Impact (min/ML/max)
   - Distribution parameters documented

5. **Monte Carlo Output** -- Simulation results, distribution data
   - Completion date distribution (histogram data)
   - Percentile table: P10, P20, P30, P40, P50, P60, P70, P80, P90, P95
   - Criticality index per activity (% of iterations on critical path)
   - Sensitivity analysis data
   - Tornado diagram data (top risk drivers)
   - Cost-at-completion distribution (if performed)

6. **Variance Decomposition** -- Root cause breakdown
   - Cost variance by root cause: Scope Changes, Productivity, Escalation, Rework, Other
   - Schedule variance by root cause: Scope Changes, Weather, Resources, Rework, Design, Other
   - Monthly decomposition for trend analysis
   - Pareto chart data
   - Cumulative variance trend chart data

7. **Performance Trend** -- Historical CPI/SPI data for trend analysis
   - Monthly CPI and SPI values from project start
   - 3-month rolling average CPI and SPI
   - Forecast CPI/SPI required to achieve BAC and contract completion
   - TCPI trend
   - Comparison with industry benchmarks

---

## Methodology & Standards

### Primary Standards (Mandatory Compliance)

| Standard | Application |
|----------|-------------|
| **PMI Practice Standard for EVM** | Earned Value Management methodology, calculations, and reporting |
| **ISO 21508:2018** | Earned Value Management in Project and Programme Management |
| **AACE RP 10S-90** | Cost Engineering Terminology -- standard definitions for all EVM terms |
| **AACE RP 29R-03** | Forensic Schedule Analysis -- methodology for schedule variance decomposition |
| **AACE RP 40R-08** | Contingency Estimating -- Monte Carlo methodology and best practices |

### Secondary Standards (Reference)

| Standard | Application |
|----------|-------------|
| **ANSI/EIA-748** | Earned Value Management Systems -- compliance criteria for EVM implementation |
| **AACE RP 48R-06** | Schedule Constructability -- schedule quality assessment |
| **AACE RP 57R-09** | Integrated Cost and Schedule Risk Analysis |
| **DOE Order 413.3B** | Program and Project Management for Capital Assets -- EVM requirements |
| **GAO-20-195G** | Cost Estimating and Assessment Guide -- best practices for cost forecasting |
| **IPA Research** | Megaproject performance benchmarks by industry and project type |
| **SMRP Best Practice Metrics** | Operational excellence benchmarks for context |

### EVM Calculation Definitions

| Term | Symbol | Formula | Description |
|------|--------|---------|-------------|
| Budget at Completion | BAC | Sum of all work package budgets | Total approved budget for the project |
| Planned Value | PV (BCWS) | Time-phased BAC to date | What we planned to accomplish by now |
| Earned Value | EV (BCWP) | % Complete x BAC per WBS | What we actually accomplished (in budget terms) |
| Actual Cost | AC (ACWP) | Actual expenditure to date | What we actually spent |
| Schedule Variance | SV | EV - PV | Positive = ahead, Negative = behind |
| Cost Variance | CV | EV - AC | Positive = under budget, Negative = over budget |
| Schedule Performance Index | SPI | EV / PV | >1.0 = ahead, <1.0 = behind |
| Cost Performance Index | CPI | EV / AC | >1.0 = under budget, <1.0 = over budget |
| Estimate at Completion | EAC | Multiple methods (see below) | Forecast total cost |
| Estimate to Complete | ETC | EAC - AC | Forecast remaining cost |
| Variance at Completion | VAC | BAC - EAC | Forecast budget variance |
| To-Complete Performance Index | TCPI | (BAC - EV) / (BAC - AC) | Required future CPI to achieve BAC |

### EAC Calculation Methods

| Method | Formula | Best Used When |
|--------|---------|---------------|
| **EAC1 (CPI-based)** | BAC / CPI | Past cost performance is representative of future performance; no significant scope changes expected |
| **EAC2 (Composite CPI x SPI)** | AC + (BAC - EV) / (CPI x SPI) | Project is behind schedule AND over budget; time-dependent costs are significant |
| **EAC3 (Bottom-up independent)** | AC + independent ETC | Significant scope changes have occurred; past performance is not representative; project team provides fresh estimates |
| **EAC4 (Original estimate)** | AC + (BAC - EV) | Past variances are anomalous and will not recur; project performance will return to plan. CAUTION: this is typically overly optimistic |

### Monte Carlo Methodology

1. **Distribution Selection**: Use triangular distribution for activities with limited data; beta-PERT for activities with experience data; uniform for activities with high uncertainty
2. **Correlation**: Model correlation between related activities (same contractor, same discipline, same resource pool) to avoid underestimating aggregate risk
3. **Risk Events**: Model discrete risk events as probabilistic branches (if risk occurs, add impact to duration/cost)
4. **Minimum Iterations**: 1,000 for preliminary analysis; 5,000-10,000 for final reporting (convergence test: results stable to +/-1%)
5. **Confidence Levels**:
   - P50: 50% probability of achieving or beating this date/cost (planning basis)
   - P80: 80% probability (management commitment basis)
   - P90: 90% probability (contingency basis / stretch target)
6. **Sensitivity Analysis**: Identify activities with highest criticality index (% of iterations on critical path) and highest correlation with total duration

### S-Curve Analysis Methodology

The S-curve is the single most informative visualization in project controls. Key interpretation points:

| Pattern | Interpretation | Action |
|---------|---------------|--------|
| EV tracks PV closely, AC tracks EV closely | On track, on budget | Continue monitoring |
| EV below PV, AC tracks EV | Behind schedule, on budget per unit | Schedule recovery needed |
| EV tracks PV, AC above EV | On schedule, over budget | Cost recovery needed |
| EV below PV, AC above EV | Behind schedule AND over budget | Both recovery needed (worst case) |
| EV above PV, AC below EV | Ahead of schedule AND under budget | Verify measurement accuracy |
| S-curve flattening | Progress slowing | Investigate cause (resource constraints, design delays, rework cycle) |
| AC/EV divergence increasing | Cost efficiency deteriorating | Investigate productivity issues |

### Variance Analysis Framework

#### Cost Variance Decomposition Categories

| Category | Description | Typical Sources |
|----------|-------------|-----------------|
| **Scope Changes** | Cost of approved change orders | Client-directed, regulatory, design development |
| **Productivity** | Labor productivity variance (actual vs. planned hours per unit) | Learning curve, skill level, congestion, rework cycle |
| **Material Escalation** | Material prices exceeding estimate | Market conditions, tariffs, supply chain disruptions |
| **Rework** | Cost of correcting defective work | Quality issues, design errors discovered late, coordination failures |
| **Equipment/Plant** | Equipment cost variance (hire, fuel, maintenance) | Utilization rates, idle time, repair costs |
| **Subcontractor** | Subcontractor cost variance | Claims, variations, productivity issues |
| **Overhead/Preliminaries** | Indirect cost variance | Duration extension, staff changes, site cost increases |
| **Other** | Residual variance not classified above | Weather, force majeure, access restrictions |

#### Schedule Variance Decomposition Categories

| Category | Description | Typical Sources |
|----------|-------------|-----------------|
| **Scope Changes** | Additional work extending duration | Approved change orders adding activities |
| **Weather/Force Majeure** | Delays from uncontrollable events | Excessive rain, extreme temperatures, natural disasters |
| **Resource Constraints** | Delays from insufficient resources | Labor shortages, equipment availability, subcontractor mobilization |
| **Rework** | Delays from correcting defective work | Failed inspections, NCRs, design errors |
| **Design Delays** | Delays from late or incomplete design | Drawing delays, design changes, specification uncertainty |
| **Permits/Approvals** | Delays from regulatory processes | Environmental permits, building permits, inspections |
| **Other** | Residual delay not classified above | Access restrictions, third-party interfaces, utility connections |

---

## Step-by-Step Execution

### Phase 1: Data Gathering & Validation (Steps 1-2)
**Step 1: Gather and Validate EVM Data**
### Phase 2: EAC Calculation (Steps 3-4)
**Step 3: Calculate EAC (Multiple Methods)**
### Phase 3: Monte Carlo Simulation (Steps 5-6)
**Step 5: Configure Monte Carlo Model**
### Phase 4: S-Curve Generation and Variance Analysis (Steps 7-8)
**Step 7: Generate S-Curves**
### Phase 5: Report Generation and Recovery Planning (Steps 9-10)
**Step 9: Prepare Forecast Report**

See [`references/skill-detailed-steps.md`](references/skill-detailed-steps.md) for complete detailed execution steps.

## Quality Criteria

### Content Quality (Target: >91% Compliance)

| Criterion | Weight | Metric | Target |
|-----------|--------|--------|--------|
| Data Integrity | 20% | EVM values validated and reconciled with financial/schedule data | 100% |
| Method Coverage | 15% | EAC calculated by all 4 methods with assumptions stated | 100% |
| Monte Carlo Validity | 15% | Minimum iterations run, convergence verified | >= 1,000 iterations |
| Variance Decomposition | 15% | % of total variance attributed to identified root causes | >90% |
| Forecast Accuracy | 15% | EAC within +/-10% of final actual (retroactive measure) | >80% |
| Report Timeliness | 10% | Monthly forecast delivered within 5 business days of data cutoff | 100% |
| Actionability | 10% | Recovery recommendations provided when CPI or SPI < 1.0 | 100% |

### Automated Quality Checks

- [ ] All WBS elements have non-zero BAC, PV, and EV values (or are not yet started)
- [ ] EV <= BAC for every WBS element (cannot earn more than budgeted)
- [ ] Cumulative AC matches financial records (verified cross-reference)
- [ ] CPI and SPI calculations are mathematically correct
- [ ] All four EAC methods calculated with clear assumptions stated
- [ ] EAC range presented (minimum to maximum across methods)
- [ ] Monte Carlo ran minimum 1,000 iterations with convergence verified
- [ ] P50, P80, P90 percentiles extracted and reported
- [ ] S-curve data matches EVM data (cumulative values reconcile)
- [ ] Variance decomposition sums to total variance (+/-5% tolerance for rounding)
- [ ] Recovery recommendations provided if CPI or SPI < 0.95
- [ ] No "TBD," "pending," or placeholder entries in the forecast report
- [ ] All charts and tables reference correct data and are properly labeled
- [ ] Previous month comparison included (trend analysis)
- [ ] TCPI calculated and interpreted

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs From)

| Agent | Dependency Type | Description | Criticality |
|-------|----------------|-------------|-------------|
| agent-execution (project_controls) | Self/Bilateral | EVM data (BCWS, BCWP, ACWP) produced by project controls function | Critical |
| agent-execution (project_management) | Upstream | Risk register, project status information | High |
| manage-change-control.md | Upstream | Approved changes affecting baseline, change log | Critical |
| agent-execution (construction) | Upstream | Physical progress data, productivity information | High |
| agent-execution (finance) | Upstream | Actual cost data, financial reconciliation | Critical |

### Downstream Dependencies (Outputs To)

| Agent | Dependency Type | Description | Trigger |
|-------|----------------|-------------|---------|
| agent-execution (project_management) | Downstream | Forecasts inform project management decisions and steering committee reports | Monthly |
| agent-execution (finance) | Bilateral | OPEX forecasts feed financial reporting and cash flow projections | Monthly |
| manage-change-control.md | Bilateral | EAC changes trigger change control review if significant | On forecast change |
| track-progressive-handover.md | Downstream | Completion date forecasts inform handover planning | Monthly |
| orchestrate-or-agents | Reporting | Forecast data feeds OR gate reviews and executive reporting | Monthly / at gates |
| agent-contracts-compliance | Downstream | Forecast data supports claims analysis and contract negotiations | On request |

---

## Examples

See [`references/skill-examples.md`](references/skill-examples.md) for detailed examples.

## MCP Integrations

See [`references/skill-mcp-integrations.md`](references/skill-mcp-integrations.md) for detailed mcp integrations.

## Templates & References

See [`references/skill-templates-references.md`](references/skill-templates-references.md) for detailed templates & references.
