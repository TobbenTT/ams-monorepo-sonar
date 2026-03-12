---
name: track-budget-execution
description: "Track budget execution against approved baselines including committed, actual, and forecast costs with WBS alignment and variance analysis for OR projects. Triggers: 'track budget execution', 'budget vs actual', 'seguimiento de ejecucion presupuestaria'."
---

# Track Budget Execution
## Skill ID: track-budget-execution
## Version: 1.0.0
## Category: C - Tracking
## Priority: High

## Purpose
Budget execution tracking is the financial backbone of any Operational Readiness project, providing the project leadership team with continuous visibility into how project funds are being consumed relative to the approved baseline. In large capital projects transitioning to operations, the OR phase often represents a period of rapidly escalating operational expenditure as staffing ramps up, contracts are mobilized, materials are procured, and commissioning activities consume resources at an accelerating pace. Without rigorous budget execution tracking that captures committed, actual, and forecast costs at the WBS element level, project managers lose the ability to identify cost overruns early enough to take corrective action, and senior leadership cannot make informed decisions about resource allocation, scope adjustments, or contingency deployment.

The complexity of OR budget tracking stems from the need to integrate multiple data streams — purchase order commitments, goods receipts, invoice postings, accruals, payroll costs, and contingency drawdowns — into a single coherent view that aligns with the project Work Breakdown Structure. This skill ensures that the Execution agent maintains a real-time cost position that distinguishes between committed costs (POs issued but not yet invoiced), actual costs (invoices posted and paid), and forecast costs (estimated remaining spend to complete each work package). Variance analysis at each level of the WBS hierarchy enables the identification of problem areas before they become critical, while trend analysis provides early warning of systemic issues such as scope creep, productivity shortfalls, or vendor pricing escalation. The output of this skill feeds directly into project governance forums, gate reviews, and client reporting.

## Intent & Specification
The AI agent MUST understand that:
1. Budget execution must be tracked at the lowest WBS element level with roll-up capability to summary levels, cost categories, and the total project level.
2. Three cost dimensions must be maintained simultaneously: committed (POs and contracts in place), actual (invoiced and posted costs), and forecast-to-complete (estimated remaining spend), with the Estimate at Completion (EAC) being the sum of actuals plus forecast-to-complete.
3. Variance analysis must be performed against both the original approved budget (Budget at Completion, BAC) and the current approved budget (including approved changes), with variances expressed in absolute value and percentage terms.
4. All budget data must be traceable to source transactions — every cost entry must link to a PO, invoice, journal entry, or other verifiable source document.
5. Variance thresholds must be defined and enforced, with automatic flagging of WBS elements that exceed tolerance bands (typically +/-5% for individual line items and +/-3% at summary levels).

## Trigger / Invocation
```
/track-budget-execution
```
### Natural Language Triggers
- "Track budget execution for the project"
- "Show me budget vs actual analysis"
- "What is our cost position by WBS"
- "Seguimiento de ejecucion presupuestaria"
- "Analisis de presupuesto vs real por WBS"
- "Cual es nuestra posicion de costos del proyecto"

## Input Requirements
### Required Inputs
| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| Approved Budget Baseline | Original approved budget with full WBS breakdown and cost elements | XLSX/SAP extract | Execution Agent — Project Controls |
| Approved Change Register | All approved budget changes with justification and revised allocations | XLSX | Execution Agent — Change Control |
| PO Commitment Register | All active purchase orders with committed values by WBS element | XLSX | manage-purchase-orders skill output |
| Actual Cost Ledger | Posted costs from invoices, payroll, journal entries by WBS element | XLSX/SAP extract | Finance system or ERP |

### Optional Inputs (Highly Recommended)
| Input | Description | Default |
|-------|-------------|---------|
| Forecast-to-Complete Estimates | Work package manager estimates of remaining spend | EAC = Actuals + Remaining Commitments |
| Earned Value Data | BCWP, BCWS, ACWP for earned value analysis | Not calculated; cost-only tracking |
| Contingency Register | Contingency allocations and drawdown history | Contingency shown as single line item |
| Currency Exchange Rates | FX rates for multi-currency projects | Single reporting currency assumed |

### Context Enrichment
The agent should automatically:
- Pull the latest PO commitment data from the manage-purchase-orders skill to ensure commitment figures are current
- Cross-reference actual costs against the invoice workflow to identify any unposted accruals that should be included in the cost position
- Check for approved budget changes that have not yet been reflected in the current budget baseline
- Identify WBS elements with zero actuals but significant commitments approaching delivery dates, indicating potential near-term cost recognition
- Compare current period spend rates against historical trends to validate forecast-to-complete estimates

## Output Specification
### Document: Budget Execution Report
**Filename**: `VSC_BudgetExecution_{ProjectCode}_{Version}_{Date}.xlsx`

**Structure**:
1. **Executive Summary Dashboard** — Total project budget position showing BAC, current approved budget, committed, actual, forecast-to-complete, EAC, and variance at completion (VAC), with traffic-light status indicators and trend charts
2. **WBS Cost Detail** — Full WBS breakdown showing for each element: original budget, approved changes, current budget, committed, actual, forecast-to-complete, EAC, and variance with percentage, color-coded by variance severity
3. **Cost Category Analysis** — Budget position by cost category (labor, materials, services, equipment, overheads, contingency) with monthly spend profiles and cumulative S-curves
4. **Variance Analysis Report** — Detailed analysis of all WBS elements exceeding variance thresholds, including root cause identification, corrective action plans, and responsible party assignments
5. **Monthly Cost Trend** — Month-by-month actual spend compared to planned spend profile, with cumulative tracking and forecast projection to completion
6. **Contingency Status** — Contingency balance, drawdown history, and adequacy assessment based on remaining risk exposure

### Key Metrics
| Metric | Description | Target |
|--------|-------------|--------|
| Cost Variance (CV) | Difference between current budget and EAC | Within +/- 3% of current approved budget |
| Budget Consumed | Actual costs as percentage of current approved budget | Aligned with physical progress (+/- 5%) |
| Commitment Coverage | Committed + Actual as percentage of EAC | > 80% by 75% project completion |
| Forecast Accuracy | Variance between previous period EAC and current period EAC | < 2% month-on-month change |
| Contingency Adequacy | Remaining contingency as percentage of remaining risk exposure | > 100% coverage of quantified risks |

## Procedure

### Step 1: Establish Budget Baseline and Structure
- Import the approved budget baseline with full WBS breakdown, validating that all cost elements are correctly coded and the total reconciles to the approved project value
- Verify the WBS structure covers all project scope areas: for OR projects this typically includes operations staffing, maintenance readiness, commissioning support, HSE compliance, training, spare parts, contracts administration, and project management
- Configure variance thresholds by WBS level: typically +/-5% for Level 4+ elements, +/-3% for Level 2-3 summaries, and +/-2% at the total project level
- Establish the planned spend profile (monthly phasing of the budget) based on the project schedule and resource loading
- Set up the change control register to track all approved budget modifications with an audit trail from the original baseline to the current approved budget
- Define the cost coding structure mapping: ensure each cost transaction can be classified by WBS element, cost category, cost type (CAPEX/OPEX), and responsible party

### Step 2: Capture Commitments and Actuals
- Import PO commitment data from the manage-purchase-orders skill, mapping each PO to the correct WBS element and cost category
- Validate that PO values reflect the current authorized amount (including any amendments) rather than the original PO value
- Import actual cost data from the finance system, reconciling posted invoices, payroll charges, journal entries, and any other cost transactions
- For payroll costs, ensure that labor hours are correctly allocated to WBS elements based on timesheets or allocation percentages
- Calculate accruals for goods/services received but not yet invoiced, using goods receipt data and contractor progress claims as the basis
- Reconcile the total of commitments plus actuals plus accruals against the finance system general ledger to ensure data integrity
- Document and investigate any reconciliation differences exceeding the defined materiality threshold (typically 0.5% of total budget)

### Step 3: Develop Forecast-to-Complete
- For each WBS element, calculate the forecast-to-complete as the estimated remaining cost to fully deliver the work package scope
- Apply the appropriate forecasting method based on the nature of the work package:
  - **Fixed-price contracts**: ETC = Contract value - Actuals (adjust for known variations)
  - **Reimbursable contracts**: ETC = Remaining scope quantity x Rate (validate rate against recent actuals)
  - **Labor costs**: ETC = Remaining headcount-months x Loaded cost rate (cross-reference with staffing plan)
  - **Material procurement**: ETC = Remaining PO commitments + Uncommitted requirements from procurement plan
- Where work package managers have provided bottom-up estimates, validate these against remaining PO commitments, contract values, and scheduled activities
- Where bottom-up estimates are not available, apply trending methods: ETC = (BAC - EV) / CPI for work in progress, or ETC = remaining commitment value for procurement-driven elements
- Consolidate individual WBS forecasts into the total Estimate at Completion (EAC = Actuals + Accruals + Forecast-to-Complete)
- Calculate the To-Complete Performance Index (TCPI = Remaining Work / Remaining Budget) as a cross-check on forecast reasonableness

### Step 4: Perform Variance Analysis
- Calculate variance at completion (VAC = Current Approved Budget - EAC) for every WBS element, cost category, and the total project
- Flag all elements exceeding the defined variance thresholds, categorizing each as favorable or unfavorable
- For each flagged variance, document the root cause using the standard classification:
  - **Scope change**: Approved or pending scope modifications affecting the cost baseline
  - **Pricing variance**: Unit rates or contract prices different from budget assumptions
  - **Quantity variance**: More or fewer units required than originally estimated
  - **Timing difference**: Cost recognition shifted between periods without total cost impact
  - **Productivity issue**: Work progressing slower or faster than planned, affecting labor and equipment costs
  - **Forecast error**: Previous forecast was inaccurate; revised estimate based on better information
- Develop corrective action recommendations for all material unfavorable variances, including scope reduction options, commercial negotiations, or contingency deployment requests
- Assess the cumulative impact of individual variances on the total project EAC and the contingency adequacy

### Step 5: Report and Communicate
- Generate the Budget Execution Report with all dashboard visualizations, WBS detail tables, variance narratives, and trend charts
- Prepare a management summary highlighting the top 5 cost risks, top 5 favorable opportunities, and recommended actions for the project leadership team
- Update the contingency status based on risk register changes and any approved drawdowns during the reporting period
- Calculate the contingency adequacy ratio: Remaining Contingency / Remaining Quantified Risk Exposure, flagging if the ratio falls below 1.0
- Distribute the report through established governance channels and present key findings at the monthly project cost review meeting
- Feed the updated EAC and cost position data to the generate-financial-reports and forecast-cashflow skills for downstream reporting

## Failure Modes & Common Pitfalls

| Failure Mode | Root Cause | Prevention Strategy |
|-------------|-----------|-------------------|
| Costs posted to wrong WBS element | Incorrect coding on PO or invoice | Automated WBS validation rules; monthly coding audit |
| Commitments not updated for PO changes | Amendments not reflected in commitment register | Real-time synchronization with PO register; weekly reconciliation |
| Accruals understated | Goods received but GR not processed | Weekly GR compliance checks with receiving teams |
| Forecast-to-complete stale | Work package managers not updating estimates | Monthly forecast review meetings; mandatory sign-off |
| Budget changes not reflected | Approved changes not posted to baseline | Change control register linked to budget system; weekly update check |
| Double-counting of costs | Accrual not reversed when invoice posted | Automated accrual reversal on invoice posting; monthly clean-up |

## Escalation Protocols

| Trigger | Timeline | Escalation Path |
|---------|----------|----------------|
| WBS element variance exceeds +/-5% | At detection | Budget holder notification with corrective action request |
| Summary level variance exceeds +/-3% | At detection | Project Manager review; corrective action plan within 5 business days |
| Total project EAC exceeds approved budget | At detection | Project Director notification; emergency cost review within 48 hours |
| Contingency adequacy ratio < 1.0 | At detection | Project Manager and Risk Manager joint review; contingency replenishment request |
| EAC increases > 2% month-on-month without approved change | Monthly review | Project Controls investigation; forecast methodology audit |
| Unreconciled transactions > 0.5% of budget | Monthly close | Finance Controller investigation; data integrity remediation |

## Budget Structure & Cost Coding

### Standard WBS Hierarchy for OR Projects

The following WBS hierarchy is recommended for OR project budget tracking. Actual structure should be tailored to the specific project scope and organizational requirements.

| WBS Level | Example | Description |
|-----------|---------|-------------|
| Level 1 | 1.0 OR Project | Total project |
| Level 2 | 1.1 Operations Readiness | Major workstream |
| Level 3 | 1.1.1 Staffing & Recruitment | Sub-workstream |
| Level 4 | 1.1.1.1 Operations Managers | Work package |
| Level 5 | 1.1.1.1.01 Salary - Site Manager | Cost element |

### Standard Cost Categories

| Category Code | Category Name | Typical Budget Share | Description |
|--------------|---------------|---------------------|-------------|
| LAB | Direct Labor | 35-45% | Operational staff salaries, contractor labor, overtime |
| MAT | Materials & Consumables | 15-25% | Spare parts, consumables, chemicals, lubricants |
| SVC | Professional Services | 10-20% | Consulting, training, commissioning support |
| EQP | Equipment & Plant | 5-15% | Equipment hire, tools, vehicles, mobile plant |
| OVH | Overheads | 5-10% | Insurance, utilities, office costs, IT |
| CTG | Contingency | 5-10% | Risk provision for quantified and unquantified risks |

## Reporting Cadence

| Report | Frequency | Audience | Key Content |
|--------|-----------|----------|-------------|
| Cost Flash Report | Weekly (Friday) | Project Manager | Top-level EAC movement, new commitments, urgent variances |
| Budget Execution Report | Monthly (by WD+5) | Project team, Client PM | Full WBS detail, variance narratives, forecasts, S-curves |
| Contingency Status | Monthly (by WD+5) | Project Manager, Risk Manager | Drawdown history, adequacy ratio, risk-adjusted outlook |
| Cost Review Presentation | Monthly (by WD+7) | Steering Committee | Executive summary, top risks/opportunities, decisions required |
| Gate Review Finance Pack | Per gate schedule | Gate Review Panel | Cumulative cost performance, EAC confidence, contingency adequacy |

## Definitions & Glossary

| Term | Definition |
|------|-----------|
| BAC (Budget at Completion) | The original approved total budget for the project or work package |
| EAC (Estimate at Completion) | The current best estimate of the total cost to complete the project: Actuals + Forecast-to-Complete |
| ETC (Estimate to Complete) | The forecast remaining cost from the current date to project completion |
| VAC (Variance at Completion) | The difference between the approved budget and the EAC: VAC = BAC - EAC |
| TCPI (To-Complete Performance Index) | The cost performance required on remaining work to achieve the budget target |
| CPI (Cost Performance Index) | The ratio of earned value to actual cost, measuring cost efficiency: CPI = EV / AC |
| Accrual | An estimated cost for goods or services received but not yet invoiced, included in the cost position |
| Commitment | A financial obligation arising from an issued purchase order or contract, representing future cash outflow |

## Implementation Considerations

### SAP Integration
- Budget baseline loaded into SAP PS (Project System) with WBS elements, cost elements, and planned values (CJ20N)
- Commitments automatically captured from PO creation in SAP MM (ME21N) and linked to WBS via account assignment
- Actual costs posted through invoice verification (MIRO), payroll (PA), and journal entries (FB50)
- Budget availability control (AVC) configured to prevent PO creation exceeding budget allocation
- Standard cost reports available via CJI3 (individual WBS), S_ALR_87013543 (plan/actual comparison), and custom Fiori dashboards

### Non-SAP Environments
- Budget tracker maintained in the VSC Budget Execution Excel template with linked formulas for commitment and actual imports
- Manual data import process: PO register data pasted weekly, actual cost data pasted from finance system extracts monthly
- Reconciliation performed using pivot table comparison between the budget tracker and the finance system trial balance
- Variance analysis documented in a separate commentary sheet with structured templates for each flagged variance

### CAPEX-to-OPEX Transition
- During the OR phase, budget tracking must clearly delineate between capital expenditure (funded from the project budget) and operational expenditure (funded from the operations budget)
- The transition point for each cost element should be defined in the OR plan and reflected in the WBS structure
- Costs that shift from CAPEX to OPEX classification require re-coding with audit trail documentation
- The OPEX budget ramp-up profile should be tracked alongside the CAPEX wind-down to provide a complete financial picture

## Quality Criteria

| Dimension | Weight | Target | Measurement |
|-----------|--------|--------|-------------|
| Technical Accuracy | 30% | >95% accuracy | Cost figures reconcile with source systems; calculations verified independently |
| Completeness | 25% | 100% coverage | All WBS elements tracked; no missing cost categories or unreconciled transactions |
| Consistency | 15% | Zero conflicts | Budget figures consistent across PO register, invoice log, and financial reports |
| Format | 10% | Professional | VSC template with clear visualizations, traffic-light indicators, and S-curves |
| Actionability | 10% | Immediately usable | Variance narratives enable same-day corrective action decisions |
| Traceability | 10% | Full audit trail | Every cost figure traceable to source transaction or estimation methodology |

## Inter-Agent Dependencies

### Inputs From Other Agents
| Agent | Entity/Deliverable | Purpose |
|-------|-------------------|---------|
| Execution | Approved budget baseline and change register | Budget reference for variance calculation |
| Execution | PO commitment register (via manage-purchase-orders) | Commitment values by WBS element |
| Contracts & Compliance | Contract values and payment schedules | Commitment validation and forecast inputs |
| Operations | Staffing plan and labor cost projections | Labor cost forecasting for operational ramp-up |
| Asset Management | Maintenance budget requirements | OPEX budget inputs for post-commissioning phase |

### Outputs Consumed By
| Agent | Entity/Deliverable | Purpose |
|-------|-------------------|---------|
| Execution | Cost position and EAC | Project controls reporting and gate reviews |
| Orchestrator | Budget execution dashboard | Governance reporting and escalation triggers |
| Contracts & Compliance | Cost variance by contract | Vendor performance evaluation and commercial negotiations |
| Operations | Operational budget consumption | OPEX monitoring during ramp-up phase |

## References
- `methodology/or-playbook-and-procedures/` — OR procedures including cost management guidelines
- `methodology/capital-projects/` — Capital project cost control frameworks and earned value standards
- `methodology/templates/` — Financial reporting templates and dashboard formats
- AACE International Recommended Practice 10S-90 — Cost Engineering Terminology
- PMBOK 7th Edition — Cost Management knowledge area
- ISO 21500:2021 — Project management guidance (cost management processes)

## Changelog
| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-25 | Initial creation — Wave 2 |
