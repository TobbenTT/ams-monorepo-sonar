---
name: analyze-cost-variance
description: Perform EAC/ETC calculation, CPI/SPI analysis, variance decomposition by price/volume/schedule, and root cause identification for OR project cost deviations
version: 1.0.0
category: B - Analysis
priority: High
agent: finance-accounting
tags: [cost-variance, EAC, ETC, CPI, SPI, earned-value, root-cause, budget-analysis]
triggers:
  - analyze cost variance
  - analizar variacion de costos
  - descomposicion de varianza
  - earned value analysis
inputs:
  - approved-budget-baseline
  - actual-cost-data
  - earned-value-metrics
  - schedule-performance-data
outputs:
  - cost-variance-analysis-report
  - variance-decomposition-breakdown
  - root-cause-findings
  - corrective-action-recommendations
---

# Skill: analyze-cost-variance

## Purpose

This skill provides a rigorous, structured methodology for analyzing cost variances on Operational Readiness (OR) projects. It decomposes total cost variance into its constituent drivers -- price variance, volume/quantity variance, and schedule-induced variance -- enabling project leadership to understand not just *how much* the project deviates from budget, but *why* it deviates.

The analysis integrates Earned Value Management (EVM) metrics including Cost Performance Index (CPI), Schedule Performance Index (SPI), Estimate at Completion (EAC), and Estimate to Complete (ETC) to provide forward-looking cost projections. Root cause analysis ties each significant variance to actionable drivers, enabling the Finance agent (AG-010) to recommend targeted corrective actions.

In an OR context, cost variances often originate from upstream decisions in Operations (staffing ramp-up), Asset Management (spare parts procurement), or Execution (construction schedule shifts). This skill is designed to trace variances back to their functional origin, supporting the Orchestrator's cross-functional governance role.

## Intent & Specification

### Intent Level: L2 (Full specification with references)

This skill executes when a consultant or agent needs to understand cost performance deviations on an OR project. It requires structured budget and actual cost data, and produces a multi-layered variance analysis that satisfies both internal management reporting and external audit requirements.

### Specification Parameters

| Parameter | Description | Required | Default |
|-----------|-------------|----------|---------|
| `project_id` | Unique project identifier | Yes | -- |
| `reporting_period` | Period for analysis (YYYY-MM or YYYY-QN) | Yes | -- |
| `budget_baseline_version` | Approved baseline version to compare against | Yes | Latest approved |
| `variance_threshold_pct` | Minimum variance % to flag for root cause analysis | No | 5% |
| `include_forecast` | Whether to include EAC/ETC projections | No | true |
| `decomposition_depth` | Levels of decomposition (WBS level) | No | 3 |
| `currency` | Reporting currency (ISO 4217) | No | USD |
| `cost_categories` | Filter to specific cost categories | No | All |

### Preconditions
- Approved cost baseline exists in project documentation
- Actual cost data is available for the reporting period
- Work Breakdown Structure (WBS) is defined to at least Level 3
- Earned Value metrics are calculable (BCWS, BCWP, ACWP available)

## Trigger / Invocation

### English Triggers
- "Analyze cost variance for project {project_id}"
- "Why is the project over/under budget?"
- "Perform earned value analysis for period {period}"
- "Decompose the cost variance into price, volume, and schedule components"
- "What is the current EAC and CPI?"

### Spanish Triggers (Latin American)
- "Analizar la variacion de costos del proyecto {project_id}"
- "Por que el proyecto esta por encima/debajo del presupuesto?"
- "Realizar analisis de valor ganado para el periodo {periodo}"
- "Descomponer la varianza de costos en componentes de precio, volumen y cronograma"
- "Cual es el EAC y CPI actual?"
- "Dame el analisis de desviaciones del presupuesto"
- "Necesito entender las causas de la sobrejecucion de costos"

### Programmatic Invocation
```python
result = agent.execute_skill(
    skill="analyze-cost-variance",
    project_id="PRJ-001",
    reporting_period="2026-01",
    budget_baseline_version="BL-v2.1",
    variance_threshold_pct=5,
    include_forecast=True,
    decomposition_depth=3
)
```

## Input Requirements

### Required Inputs

| Input | Format | Source | Description |
|-------|--------|--------|-------------|
| Approved Budget Baseline | XLSX/CSV or structured data | Project Controls / Execution Agent | Original approved budget by WBS element and cost category |
| Actual Cost Data | XLSX/CSV or ERP extract | Finance systems (SAP, Oracle) | Period and cumulative actual costs by WBS and cost category |
| Earned Value Metrics | Structured table | Project Controls | BCWS (PV), BCWP (EV), ACWP (AC) by WBS element |
| Schedule Performance Data | Schedule extract | Execution Agent | Planned vs actual milestone dates, % complete by activity |
| Work Breakdown Structure | Hierarchical list | Project definition | WBS dictionary with at least 3 levels of decomposition |

### Optional Inputs

| Input | Format | Source | Description |
|-------|--------|--------|-------------|
| Contract/PO Register | XLSX/CSV | Contracts & Compliance Agent | Committed costs, contract values, change orders |
| Risk Register (cost items) | Structured table | Execution Agent | Identified cost risks with probability and impact |
| Previous Variance Reports | PDF/MD | Finance Agent archive | Prior period analysis for trend identification |
| Exchange Rate Table | CSV | Treasury/Finance | FX rates if multi-currency project |
| Procurement Price Index | CSV | Market data | Commodity/material price indices for price variance context |

### Data Quality Requirements
- Actual costs must be reconciled to GL (no unposted accruals without notation)
- Budget baseline must be the formally approved version (not working estimates)
- EV data must use consistent % complete methodology (0/50/100, weighted milestones, or physical progress)
- All monetary values must be in the same currency or include conversion rates

## Output Specification

### Primary Output: Cost Variance Analysis Report

The report follows this structure:

```markdown
# Cost Variance Analysis Report
## Project: {project_name} | Period: {reporting_period}

### 1. Executive Summary
- Total Budget: $X | Actual to Date: $Y | Variance: $Z (n%)
- CPI: x.xx | SPI: x.xx | EAC: $W | VAC: $V

### 2. Earned Value Dashboard
- Table: PV, EV, AC, CV, SV, CPI, SPI by major WBS element
- S-curve chart data (planned vs earned vs actual)

### 3. Variance Decomposition
- 3.1 Price Variance: (Actual Price - Budget Price) x Actual Quantity
- 3.2 Volume/Quantity Variance: (Actual Qty - Budget Qty) x Budget Price
- 3.3 Schedule Variance Impact: Cost of acceleration/delay
- 3.4 Mix Variance: Impact of resource/material substitution
- 3.5 FX Variance: Currency impact (if applicable)

### 4. Root Cause Analysis
- For each variance > threshold:
  - Variance item and amount
  - Root cause category (Scope, Schedule, Price, Efficiency, External)
  - Originating agent/function
  - Supporting evidence
  - Recommended corrective action

### 5. Forecast (EAC/ETC)
- EAC calculated using multiple methods:
  - EAC = BAC / CPI (performance-based)
  - EAC = AC + (BAC - EV) / (CPI x SPI) (composite)
  - EAC = AC + Bottom-up ETC (management estimate)
- Recommended EAC with justification

### 6. Corrective Action Register
- Prioritized list of actions to address variances
- Responsible agent, target date, expected savings

### 7. Appendices
- Detailed WBS-level variance table
- Data sources and assumptions
```

### Output Format Requirements
- Report delivered as Markdown (.md) file in `output/finance/`
- Supporting data tables as CSV in `output/finance/data/`
- S-curve chart data formatted for visualization tools
- All monetary values rounded to thousands (K) or millions (M) as appropriate

## Procedure

### Step 1: Data Collection and Validation (Input Assembly)

1.1. Retrieve the approved budget baseline from project documentation. Confirm the baseline version is the one formally approved at the last Gate review (G0-G4).

1.2. Extract actual cost data for the reporting period. Validate that actuals are reconciled to the General Ledger. Flag any unposted accruals or estimates separately.

1.3. Collect Earned Value metrics (BCWS, BCWP, ACWP) by WBS element. Verify that the % complete methodology is consistent across work packages.

1.4. Obtain schedule performance data including planned vs actual milestone dates.

1.5. Cross-validate data sets: ensure WBS codes match across budget, actuals, and EV data. Resolve any mapping discrepancies before proceeding.

1.6. Document all data sources, extraction dates, and any known data quality limitations in the report appendix.

### Step 2: Earned Value Calculation and KPI Derivation

2.1. Calculate core EVM metrics for each WBS element and in aggregate:
- Cost Variance (CV) = EV - AC
- Schedule Variance (SV) = EV - PV
- Cost Performance Index (CPI) = EV / AC
- Schedule Performance Index (SPI) = EV / PV

2.2. Calculate time-based schedule metrics:
- SV(t) = ES - AT (Earned Schedule method for more accurate schedule assessment)

2.3. Calculate To-Complete Performance Index (TCPI):
- TCPI = (BAC - EV) / (BAC - AC) [to finish on budget]
- TCPI = (BAC - EV) / (EAC - AC) [to finish on revised estimate]

2.4. Flag any WBS element where CPI < 0.90 or > 1.10 for detailed investigation.

2.5. Generate cumulative S-curve data points for PV, EV, and AC from project start to current period.

### Step 3: Variance Decomposition

3.1. For each WBS element with variance exceeding the threshold:

3.2. **Price Variance**: Compare unit rates (labor rates, material prices, equipment rates) between budget and actuals. Calculate: PV = (Actual Rate - Budget Rate) x Actual Quantity. Identify market-driven vs negotiation-driven price changes.

3.3. **Volume/Quantity Variance**: Compare planned quantities against actual quantities consumed. Calculate: QV = (Actual Qty - Budget Qty) x Budget Rate. Identify scope changes, rework, productivity differences.

3.4. **Schedule Variance Impact**: Quantify the cost impact of schedule acceleration or delay. Include overtime premiums, extended site overhead, idle resource costs, and acceleration costs.

3.5. **Mix Variance**: Identify cases where resource or material substitution occurred (e.g., senior engineer replacing junior, premium material replacing standard). Calculate cost impact of substitution.

3.6. **FX Variance** (if applicable): Calculate impact of exchange rate movements between budget rates and actual transaction rates.

3.7. Reconcile decomposed variances back to total variance. Any unallocated residual must be documented and investigated.

### Step 4: Root Cause Analysis and Attribution

4.1. For each significant variance (above threshold), perform root cause classification:
- **Scope**: Change orders, scope creep, unforeseen conditions
- **Schedule**: Delays causing cost escalation, acceleration costs
- **Price**: Market price changes, procurement inefficiency
- **Efficiency**: Productivity below plan, rework, learning curve
- **External**: Regulatory changes, weather, force majeure, FX

4.2. Attribute each variance to the originating agent/function:
- Operations Agent: Staffing variances, training cost variances
- Asset Management Agent: Spare parts, maintenance strategy costs
- HSE Agent: Safety compliance costs, environmental remediation
- Contracts & Compliance Agent: Contract price adjustments, claims
- Execution Agent: Construction productivity, commissioning costs
- Orchestrator: Overhead, management cost variances

4.3. Document supporting evidence for each root cause determination. Reference source documents, change orders, or meeting minutes.

4.4. Assess whether each variance is recoverable (can be offset in future periods) or permanent (will flow through to EAC).

### Step 5: Forecasting, Reporting, and Corrective Actions

5.1. Calculate EAC using three methods:
- **Performance-based**: EAC = BAC / CPI
- **Composite**: EAC = AC + (BAC - EV) / (CPI x SPI)
- **Management estimate**: EAC = AC + Bottom-up ETC from responsible agents

5.2. Select and justify the recommended EAC. Consider project phase, nature of remaining work, and whether current trends are expected to continue.

5.3. Calculate Variance at Completion (VAC) = BAC - EAC.

5.4. Develop prioritized corrective action register:
- Each action tied to a specific variance and root cause
- Assigned to responsible agent with target date
- Estimated cost recovery or savings
- Risk to implementation

5.5. Compile the full Cost Variance Analysis Report following the output specification structure.

5.6. Submit report to Orchestrator for distribution and to Execution Agent for integration into project controls reporting.

5.7. Update Finance Agent state with analysis results, EAC recommendation, and open corrective actions.

## Quality Criteria

| Criterion | Weight | Target | Measurement Method |
|-----------|--------|--------|-------------------|
| Technical Accuracy | 30% | All EVM calculations verified; variances reconcile to total | Cross-check formulas; reconciliation proof within 0.1% |
| Completeness | 25% | All WBS elements above threshold analyzed; all 5 variance types assessed | Checklist of required sections; no gaps in decomposition |
| Consistency | 15% | Figures match source data; terminology aligned with AACE/PMI standards | Compare to source extracts; glossary compliance check |
| Format | 10% | Professional report structure; clear tables and charts; VSC branding | Template compliance review; readability assessment |
| Actionability | 10% | Each root cause has a corrective action; actions are specific and assigned | Review corrective action register for SMART criteria |
| Traceability | 10% | Every figure traceable to source document; assumptions documented | Source reference audit; assumptions log completeness |
| **Total** | **100%** | **Composite score >= 91%** | **Weighted average of all criteria** |

## Inter-Agent Dependencies

### Dependencies FROM other agents (inputs needed)

| Agent | Agent ID | Information Required | Timing |
|-------|----------|---------------------|--------|
| Execution | AG-006 | Budget baseline, WBS, EV metrics, schedule data | Start of each reporting period |
| Contracts & Compliance | AG-005 | Contract values, change orders, committed costs | As changes occur; period-end summary |
| Operations | AG-002 | Staffing actuals vs plan, training expenditure | Monthly |
| Asset Management | AG-003 | Spare parts procurement costs, maintenance expenditure | Monthly |
| HSE | AG-004 | Safety and environmental compliance costs | Monthly |
| Orchestrator | AG-001 | Approved baseline version, reporting requirements, gate status | As needed |

### Dependencies TO other agents (outputs provided)

| Agent | Agent ID | Information Provided | Purpose |
|-------|----------|---------------------|---------|
| Orchestrator | AG-001 | Variance summary, EAC recommendation, corrective actions | Executive reporting, gate review input |
| Execution | AG-006 | Detailed variance analysis, forecast data | Project controls integration |
| All Agents | -- | Agent-specific variance attribution | Awareness of cost impacts from their domain |

### Finance Agent (AG-010) Internal Coordination
- This skill feeds into `model-financial-scenarios` for what-if analysis on corrective actions
- This skill feeds into `prepare-audit-package` for variance documentation requirements
- This skill receives budget data validated by `track-capex-authorizations`

## References

- **AACE International Recommended Practice 10S-90**: Cost Engineering Terminology
- **AACE RP 29R-03**: Forensic Schedule Analysis
- **PMI Practice Standard for Earned Value Management** (3rd Edition)
- **ISO 21508:2018**: Earned Value Management in Project and Programme Management
- **VSC OR Knowledge Base v2.0**: Section on Financial Management and OPEX Modeling
- **VSC Quality Assurance Framework**: Deliverable scoring methodology (6 dimensions)
- **AACE RP 44R-08**: Risk Analysis and Contingency Determination
- **ISO 55010:2019**: Asset Management - Guidance on alignment of financial and non-financial functions

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-25 | VSC OR System | Initial skill creation for Finance & Accounting agent domain |
