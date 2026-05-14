---
name: track-project-evm
description: "Track Earned Value Management metrics for capital projects including SPI, CPI, EAC, ETC, TCPI, VAC with variance analysis and trend forecasting. Triggers: 'earned value', 'EVM tracking', 'seguimiento valor ganado'."
category: "Project Controls — Earned Value Management"
priority: P1 - Critical
version: 1.0.0
agent: project-orchestrator (AG-007)
---

# Track Project EVM

## Skill ID: PO-002
## Version: 1.0.0
## Category: Project Controls — Earned Value Management
## Priority: P1 - Critical

---

## Purpose

Track Earned Value Management (EVM) metrics for capital projects, calculating key performance indices (SPI, CPI, EAC, ETC, TCPI, VAC), performing variance analysis against established thresholds, generating S-curve visualizations, and producing trend-based forecasts with corrective action recommendations. This skill provides the Project Orchestrator with the quantitative foundation for project performance monitoring and proactive decision-making.

Earned Value Management is the industry-standard methodology for integrating scope, schedule, and cost performance into a single analytical framework. PMI PMBOK 7th Edition identifies EVM as the primary tool for project performance measurement, and AACE International Recommended Practice 86R-14 (Earned Value Management") establishes the calculation standards and reporting protocols adopted worldwide. The U.S. Government Accountability Office (GAO) Cost Estimating and Assessment Guide mandates EVM for all federal capital projects exceeding $50 million, recognizing that "earned value is the best objective measure of progress available" (GAO-20-195G, 2020).

The value of rigorous EVM tracking is empirically demonstrated. A study published in the International Journal of Project Management (Lipke, Zwikael, Henderson & Anbari, 2009) found that CPI measured at the 20% completion point predicted final cost within 10% accuracy in 76% of projects studied. The Defense Acquisition University reports that SPI and CPI trends at the 15-20% completion point are statistically reliable predictors of final project outcomes (Fleming & Koppelman, "Earned Value Project Management," 4th Edition). The implication is clear: early detection of schedule and cost variances through EVM allows corrective action when recovery is still feasible — waiting for traditional accounting-based reporting delays detection until corrective options are limited or exhausted.

This skill directly addresses **Pain Point CP-03** (Capital Project Cost and Schedule Control): 58% of capital projects exceed their budget at completion, and the average cost overrun across all capital sectors is 28% (IPA, 2022). Rigorous EVM tracking reduces the probability of cost overrun by enabling early variance detection (>5% threshold triggers investigation), trend analysis (deteriorating CPI trajectory triggers escalation), and forecasting (EAC calculations provide early warning of budget insufficiency). Without systematic EVM, project managers rely on subjective progress reporting and accounting-based cost tracking that lags actual performance by 4-8 weeks — by which time variance recovery options are significantly constrained.

---

## Intent & Specification

| Attribute              | Value                                                                 |
|------------------------|-----------------------------------------------------------------------|
| **Skill ID**           | PO-002                                                                |
| **Agent**              | Project Orchestrator (AG-007)                                         |
| **Domain**             | Capital Project Controls — EVM                                        |
| **Version**            | 1.0.0                                                                 |
| **Complexity**         | High                                                                  |
| **Estimated Duration** | Initial baseline setup: 3-5 days; Monthly reporting: 1-2 days         |
| **Maturity**           | Production                                                            |
| **Pain Point Addressed** | CP-03: 58% of capital projects exceed budget (IPA 2022)            |
| **Secondary Pain**     | CP-04: Schedule variances detected too late for effective recovery     |
| **Value Created**      | Early variance detection; 10-15% improvement in forecast accuracy     |

### Functional Intent

This skill SHALL:

1. **Establish Performance Measurement Baseline (PMB)**: Create the time-phased budget baseline (Planned Value curve) from the approved cost estimate and integrated project schedule. The PMB represents the approved scope of work distributed over time and serves as the reference for all earned value calculations.

2. **Calculate Core EVM Metrics**: Compute the following metrics at each reporting period:
   - **PV (Planned Value)**: Budgeted cost of work scheduled
   - **EV (Earned Value)**: Budgeted cost of work performed
   - **AC (Actual Cost)**: Actual cost of work performed
   - **SV (Schedule Variance)**: EV - PV (positive = ahead of schedule)
   - **CV (Cost Variance)**: EV - AC (positive = under budget)
   - **SPI (Schedule Performance Index)**: EV / PV (>1.0 = ahead of schedule)
   - **CPI (Cost Performance Index)**: EV / AC (>1.0 = under budget)
   - **EAC (Estimate at Completion)**: BAC / CPI (or more sophisticated methods)
   - **ETC (Estimate to Complete)**: EAC - AC
   - **TCPI (To-Complete Performance Index)**: (BAC - EV) / (BAC - AC) or (BAC - EV) / (EAC - AC)
   - **VAC (Variance at Completion)**: BAC - EAC
   - **SV% (Schedule Variance %)**: SV / PV * 100
   - **CV% (Cost Variance %)**: CV / EV * 100

3. **Perform Variance Analysis**: Apply configurable thresholds (default: 5% for investigation, 10% for escalation) to SPI and CPI. For every variance exceeding thresholds, document root cause analysis, impact assessment, and corrective action recommendations.

4. **Generate S-Curve Data**: Produce time-series data for PV, EV, and AC curves (S-curves) with forecast projections to project completion. Include both optimistic (CPI-based), pessimistic (SPI*CPI-based), and management-adjusted forecast curves.

5. **Perform Trend Analysis**: Track SPI and CPI over time to identify deteriorating or improving performance trends. Apply statistical analysis (3-period moving average, linear regression) to project future performance trajectory.

6. **Forecast Project Completion**: Calculate EAC using multiple methods — CPI-based, SPI*CPI composite, management estimate, and regression-based — and present a range of completion forecasts with confidence intervals.

7. **Produce EVM Reports**: Generate structured reports at three levels — project team (detailed), steering committee (summary with variance explanations), and executive board (high-level traffic lights with key metrics only).

### Success Criteria

- EVM calculations are mathematically correct and auditable per AACE 86R-14
- PMB is traceable to the approved cost estimate and schedule
- Variance analysis provided for every metric exceeding the 5% threshold
- Trend analysis covers minimum 3 reporting periods for statistical validity
- EAC forecasts presented using at least two independent calculation methods
- Reports generated within 24 hours of data availability at each reporting period

### Constraints

- Must follow AACE 86R-14 and PMI PMBOK EVM calculation standards
- Must not alter the Performance Measurement Baseline without formal change control
- Must clearly distinguish between EVM-derived forecasts and management estimates
- Actual cost data must come from auditable financial sources (AG-010), not from estimates
- Physical progress measurement methodology must be defined and consistent per WBS element
- Must support both currency types common in Latin American capital projects (USD and local currency)

---

## Trigger / Invocation

### Direct Invocation

```
/track-project-evm --project [name] --action [baseline|update|analyze|report|forecast]
```

### Command Variants

- `/track-project-evm baseline --project [name]` — Establish Performance Measurement Baseline
- `/track-project-evm update --project [name] --period [YYYY-MM]` — Update metrics for reporting period
- `/track-project-evm analyze --project [name]` — Run variance and trend analysis
- `/track-project-evm report --project [name] --level [team|steering|executive]` — Generate EVM report
- `/track-project-evm forecast --project [name]` — Generate completion forecasts

### Aliases

- `/evm-tracking`, `/earned-value`, `/valor-ganado`, `/seguimiento-evm`

### Natural Language Triggers (EN)

- "What are the current SPI and CPI for the project?"
- "Track earned value for this reporting period"
- "Generate an EVM report for the steering committee"
- "What is the Estimate at Completion?"
- "Why is the CPI below 1.0?"
- "Show me the S-curve for Project X"

### Natural Language Triggers (ES)

- "Cuales son los SPI y CPI actuales del proyecto?"
- "Hacer seguimiento de valor ganado para este periodo"
- "Generar informe EVM para el comite directivo"
- "Cual es la Estimacion a la Terminacion?"
- "Mostrar la curva S del Proyecto X"

### Contextual Triggers

- Monthly reporting cycle date reached (automatic EVM update and reporting)
- Actual cost data updated by AG-010 Finance (triggers EVM recalculation)
- Physical progress update received from AG-009 Construction (triggers EV recalculation)
- Schedule update received from AG-006 Execution (triggers PV recalculation)
- CPI or SPI drops below 0.95 (triggers automatic variance analysis)
- Gate review approaching (triggers comprehensive EVM summary for gate package)

---

## Input Requirements

### Required Inputs

| Input | Type | Source | Description |
|-------|------|--------|-------------|
| `project_code` | text | User / Session State | Project identifier |
| `approved_budget` | .xlsx | AG-010 (Finance) / mcp-sharepoint | Approved project budget (BAC) with WBS breakdown |
| `integrated_schedule` | .xlsx / .mpp | AG-006 (Execution) | Resource-loaded integrated project schedule with time-phased budget distribution |
| `actual_costs` | .xlsx | AG-010 (Finance) / mcp-sharepoint | Actual cost of work performed by WBS element and reporting period |
| `physical_progress` | .xlsx | AG-009 (Construction) / AG-006 (Execution) | Physical completion percentages by WBS element based on defined measurement methodology |

### Optional Inputs

| Input | Type | Source | Description |
|-------|------|--------|-------------|
| `prior_evm_data` | .xlsx | AG-007 / mcp-sharepoint | Historical EVM data for trend analysis and S-curve plotting |
| `change_log` | .xlsx | AG-007 / mcp-sharepoint | Approved scope changes affecting the PMB |
| `risk_contingency` | .xlsx | AG-007 / mcp-sharepoint | Management reserve and contingency allocation and draw-down status |
| `procurement_commitments` | .xlsx | AG-005 (Contracts) | Committed costs and committed value for procurement EV tracking |
| `milestone_weights` | .xlsx | AG-007 / Methodology | Milestone weighting factors for earned value calculation by WBS element |

### Input Validation Rules

```yaml
validation:
  approved_budget:
    required_fields: ["wbs_code", "description", "budget_amount", "currency"]
    budget_total_must_match: "BAC within 1% tolerance"
  integrated_schedule:
    required_fields: ["activity_id", "wbs_code", "planned_start", "planned_finish", "budget_hours_or_cost"]
    no_activities_without_budget: true
  actual_costs:
    required_fields: ["wbs_code", "period", "actual_cost", "currency"]
    no_future_actuals: "actual_cost periods must not exceed current date"
  physical_progress:
    required_fields: ["wbs_code", "period", "pct_complete"]
    range_check: "0 <= pct_complete <= 100"
    no_regression: "pct_complete must not decrease without documented justification"
```

---

## Output Specification

### Deliverable 1: EVM Performance Report (.xlsx)

**Filename**: `{ProjectCode}_EVM_Report_{Period}_v{Version}_{YYYYMMDD}.xlsx`

**Workbook Structure**:

#### Sheet 1: "EVM Summary Dashboard"

| Metric | Value | Threshold | Status | Trend |
|--------|-------|-----------|--------|-------|
| BAC (Budget at Completion) | {value} | — | — | — |
| PV (Planned Value) | {value} | — | — | — |
| EV (Earned Value) | {value} | — | — | — |
| AC (Actual Cost) | {value} | — | — | — |
| SV (Schedule Variance) | {value} | +/-5% | {G/A/R} | {arrow} |
| CV (Cost Variance) | {value} | +/-5% | {G/A/R} | {arrow} |
| SPI | {value} | 0.95-1.05 | {G/A/R} | {arrow} |
| CPI | {value} | 0.95-1.05 | {G/A/R} | {arrow} |
| EAC (CPI-based) | {value} | BAC +/-10% | {G/A/R} | {arrow} |
| EAC (SPI*CPI-based) | {value} | BAC +/-10% | {G/A/R} | {arrow} |
| ETC | {value} | — | — | — |
| TCPI (BAC) | {value} | <1.10 | {G/A/R} | — |
| TCPI (EAC) | {value} | <1.10 | {G/A/R} | — |
| VAC | {value} | +/-5% of BAC | {G/A/R} | — |

#### Sheet 2: "S-Curve Data"

Time-series data with columns: Period, PV_Cumulative, EV_Cumulative, AC_Cumulative, EAC_Forecast_CPI, EAC_Forecast_Composite, EAC_Forecast_Management

#### Sheet 3: "Variance Analysis"

| WBS | Description | SPI | CPI | SV | CV | Root Cause | Impact | Corrective Action | Owner | Due Date |
|-----|-------------|-----|-----|----|----|-----------|--------|-------------------|-------|----------|
| {wbs} | {desc} | {spi} | {cpi} | {sv} | {cv} | {cause} | {impact} | {action} | {agent} | {date} |

*Only WBS elements with variances exceeding the 5% threshold are listed.*

#### Sheet 4: "Trend Analysis"

SPI and CPI time series per reporting period with 3-period moving average, linear regression trendline, and forecast projection.

#### Sheet 5: "WBS Detail"

Complete WBS-level breakdown with PV, EV, AC, SPI, CPI, SV, CV for every WBS element.

#### Sheet 6: "Forecasting Comparison"

| Method | EAC | ETC | VAC | Basis | Confidence |
|--------|-----|-----|-----|-------|------------|
| CPI-based | {eac} | {etc} | {vac} | BAC / CPI | Statistical (if CPI stable) |
| SPI*CPI composite | {eac} | {etc} | {vac} | BAC / (SPI * CPI) | Conservative |
| Management estimate | {eac} | {etc} | {vac} | Bottom-up re-estimate | Judgmental |
| Regression | {eac} | {etc} | {vac} | Statistical regression on EV/AC trend | Statistical |

### Formatting Standards

- SPI/CPI colors: Green (>= 0.95), Amber (0.90 - 0.94), Red (< 0.90)
- Variance colors: Green (within +/-5%), Amber (5-10%), Red (>10%)
- S-curve: PV = Blue (#0066CC), EV = Green (#008000), AC = Red (#CC0000), Forecast = Dashed Gray (#808080)
- Currency: Display with thousands separator and 2 decimal places; currency symbol in header
- Percentages: Display with 1 decimal place

---

## Quality Criteria

| Criterion | Metric | Weight | Target | Minimum Acceptable |
|-----------|--------|--------|--------|-------------------|
| Calculation accuracy | All EVM formulas correct per AACE 86R-14 | 25% | 100% | 100% |
| Data integrity | EV + remaining = BAC at every WBS level | 15% | 100% | 100% |
| Variance coverage | Every variance >5% has root cause analysis | 15% | 100% | >95% |
| Trend validity | Minimum 3 periods for trend analysis | 10% | 6+ periods | 3 periods |
| Forecast range | Multiple EAC methods presented | 10% | 4 methods | 2 methods |
| Timeliness | Report delivered within 24 hours of data availability | 10% | < 24 hours | < 48 hours |
| Traceability | All data points traceable to source documents | 10% | 100% | >95% |
| Reporting quality | Report suitable for audience level (team/steering/executive) | 5% | Audience-appropriate | Minor adjustments only |

### Automated Quality Checks

1. **Budget reconciliation**: Sum of PV across all WBS = BAC at project level
2. **EV non-regression**: EV cumulative must not decrease period-over-period without documented justification
3. **AC source validation**: Actual costs reconcile with AG-010 Finance reports within 1% tolerance
4. **SPI/CPI bounds**: SPI and CPI values are within plausible range (0.50 - 2.00); values outside range flagged for investigation
5. **EAC consistency**: EAC >= AC (cannot complete for less than already spent)
6. **TCPI feasibility**: TCPI > 1.30 triggers "recovery unlikely" warning per PMI guidance
7. **Baseline integrity**: PMB changes only via formal change control entries in change log

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents)

| Agent | Input Provided | Criticality | Description |
|-------|---------------|-------------|-------------|
| AG-006 (Execution) | Integrated project schedule, time-phased budget, schedule updates | Critical | Provides the schedule basis for PV calculation and schedule progress for SPI |
| AG-010 (Finance & Accounting) | Actual cost data, budget allocations, committed costs | Critical | Provides auditable actual costs (AC) and budget (BAC) for all EVM calculations |
| AG-009 (Construction Management) | Physical progress measurement, construction completion percentages | Critical | Provides physical progress data for Earned Value (EV) calculation during execution phase |
| AG-008 (Engineering Design) | Engineering deliverable progress, design completion percentages | High | Provides progress measurement for engineering WBS elements during FEL phases |
| AG-005 (Contracts & Compliance) | Procurement committed value, vendor invoice status | High | Provides procurement EV (committed and delivered value) and actual cost data for procurement WBS elements |

### Downstream Dependencies (Outputs TO other agents)

| Agent | Output Provided | Criticality | Description |
|-------|----------------|-------------|-------------|
| AG-007 — assess-fel-gate-readiness (PO-001) | EVM metrics as input to execution planning assessment | High | SPI and CPI are inputs to the FEL Index execution planning component |
| AG-007 — generate-project-dashboard (PO-003) | EVM summary metrics and S-curve data | High | Dashboard displays SPI, CPI, EAC, and S-curve as core project health indicators |
| AG-007 — manage-project-risk-register (PO-004) | EVM-identified risks (cost overrun, schedule delay) | Medium | Variances exceeding thresholds generate risk entries in the project risk register |
| AG-001 (OR Orchestrator) | Project cost and schedule performance summary | High | OR Orchestrator aggregates EVM data across portfolio for enterprise reporting |
| AG-010 (Finance & Accounting) | EAC and ETC forecasts for financial planning | High | Finance uses EAC/ETC for cash flow forecasting and funding adequacy assessment |

---

## Methodology & Standards

### Primary Standards

| Standard | Description | Application |
|----------|-------------|-------------|
| AACE 86R-14 | Earned Value Management — As Applied in Engineering, Procurement, and Construction | EVM calculation standards, reporting protocols, variance thresholds |
| PMI PMBOK 7th Edition | Project Management Body of Knowledge — Section 4.5 (Measurement) | EVM methodology framework, performance reporting standards |
| AACE 10S-90 | Cost Engineering Terminology | Standard definitions for all EVM terms and metrics |
| GAO-20-195G | GAO Cost Estimating and Assessment Guide | EVM implementation requirements and best practices for capital projects |
| ANSI/EIA-748 | Earned Value Management Systems | EVM system requirements and compliance criteria |

### EVM Calculation Reference

```
Core Metrics:
  SV  = EV - PV              (Schedule Variance)
  CV  = EV - AC              (Cost Variance)
  SPI = EV / PV              (Schedule Performance Index)
  CPI = EV / AC              (Cost Performance Index)

Forecasting:
  EAC_cpi      = BAC / CPI                    (CPI-based forecast)
  EAC_composite = BAC / (SPI * CPI)           (Composite forecast — conservative)
  EAC_etc      = AC + (BAC - EV)              (Original estimate for remaining work)
  EAC_mgmt     = AC + ETC_management          (Management bottom-up re-estimate)
  ETC          = EAC - AC                      (Estimate to Complete)
  TCPI_bac     = (BAC - EV) / (BAC - AC)      (Performance needed to meet BAC)
  TCPI_eac     = (BAC - EV) / (EAC - AC)      (Performance needed to meet EAC)
  VAC          = BAC - EAC                     (Variance at Completion)

Variance Thresholds (Default):
  Investigation threshold: SPI or CPI outside 0.95 - 1.05 range (>5% variance)
  Escalation threshold:   SPI or CPI outside 0.90 - 1.10 range (>10% variance)
  Recovery warning:       TCPI > 1.10 (difficult recovery)
  Recovery unlikely:      TCPI > 1.30 (recovery statistically improbable)
```

### Progress Measurement Methods

| Method | Application | WBS Types |
|--------|-------------|-----------|
| Weighted milestones | Discrete deliverables with defined completion points | Engineering, procurement |
| Percent complete (physical) | Measurable physical progress | Construction, fabrication |
| Units completed | Repetitive work packages | Concrete pours, pipe spools, cable pulls |
| Level of effort (LOE) | Support activities without discrete outputs | Project management, QA/QC |
| Apportioned effort | Work proportional to another WBS element | Inspection proportional to construction |
