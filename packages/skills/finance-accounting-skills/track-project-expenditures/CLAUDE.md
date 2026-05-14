---
name: track-project-expenditures
description: "Track project-level expenditures including committed, actual, and forecast costs with close-out accounting for capital and OR projects. Triggers: 'project expenditure tracking', 'cost tracking', 'seguimiento de gastos del proyecto'."
---

# Track Project Expenditures

## Skill ID: track-project-expenditures

## Version: 1.0.0

## Category: C - Tracking

## Priority: Medium

---

## Purpose

Monitor and reconcile all project-level expenditures across the full lifecycle of capital projects and Operational Readiness programs, providing real-time visibility into committed costs, actual spend, earned value, forecast at completion, and close-out accounting. This skill produces a comprehensive expenditure tracker that distinguishes between CAPEX and OPEX, reconciles purchase commitments against budget, identifies cost overrun risks early, and prepares the financial data required for project close-out and asset capitalization.

Project expenditure tracking is the financial backbone of any capital project transitioning to operations. During the OR phase, costs are particularly complex because they span the CAPEX/OPEX boundary -- some commissioning costs are capitalizable while others are operational expenses, and the determination must be made consistently according to IFRS/IAS 16 or local GAAP. Industry benchmarks from IPA show that 15-20% of capital projects experience accounting reclassification issues at close-out, leading to audit findings, tax implications, and distorted asset valuations. Proper expenditure tracking during the OR phase prevents these downstream problems.

This skill integrates tightly with model-opex-budget for the operational cost baseline, track-cost-centers for departmental cost allocation, generate-management-accounts for internal reporting, and reconcile-financial-records for period-end financial integrity. It also provides critical data to the Execution agent for earned value analysis and the Orchestrator for gate review financial readiness assessments.

---

## Intent & Specification

The AI agent MUST understand that:

1. **Three-dimensional cost tracking** is mandatory -- every expenditure must be tracked in three dimensions simultaneously: (a) committed/actual/forecast, (b) CAPEX vs. OPEX classification, and (c) project WBS element vs. cost center attribution, to provide a complete financial picture from any reporting angle.
2. **Commitment accounting** requires that purchase orders, contracts, and approved change orders are recorded as commitments at the time of approval, not at the time of invoice receipt, to provide forward-looking cost exposure visibility and avoid budget surprises.
3. **Earned value integration** means that physical progress (% complete) must be linked to cost data to calculate Cost Performance Index (CPI), Schedule Performance Index (SPI), and Estimate at Completion (EAC), enabling predictive cost management rather than reactive reporting.
4. **CAPEX/OPEX boundary management** requires clear classification rules aligned with IAS 16 / IFRS and local tax regulations (Chilean SII for tax depreciation), with a documented decision framework for borderline items (e.g., commissioning labor, first fills, training during commissioning).
5. **Change order tracking** must capture all scope changes with their cost impact, approval status, and funding source, maintaining a complete audit trail from change request through approval to cost realization.
6. **Forecast discipline** demands that the Estimate at Completion (EAC) is updated monthly using a combination of earned value metrics and bottom-up re-estimation for remaining work, with variance explanations for any change from the previous forecast.
7. **Close-out readiness** requires that the expenditure tracker can produce a complete financial close-out package at any time, including final cost report, commitment liquidation status, accrual reconciliation, and asset capitalization schedule.

---

## Trigger / Invocation

### Natural Language Triggers

**English:**
- "Track project expenditures against the approved budget"
- "What is the current forecast at completion for this project?"
- "Reconcile committed costs against actual invoices received"
- "Prepare the project financial close-out package"

**Spanish:**
- "Hacer seguimiento de los gastos del proyecto contra el presupuesto"
- "Cual es el costo estimado al cierre del proyecto?"
- "Preparar el cierre contable del proyecto"

**Command:** `/track-project-expenditures`

**Aliases:**
- `/project-cost-tracker`
- `/expenditure-tracking`
- `/seguimiento-gastos-proyecto`

---

## Input Requirements

### Required Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `approved_budget` | `.xlsx` | Approved project budget by WBS element, cost type (CAPEX/OPEX), and period |
| `purchase_orders` | `.xlsx` or ERP extract | All POs issued against the project: PO number, vendor, value, WBS, delivery status |
| `actual_costs` | `.xlsx` or ERP extract | Posted actual costs by WBS, cost element, and period (from SAP PS/CO or equivalent) |
| `project_schedule` | `.xlsx` or `.mpp` | Project schedule with physical progress (% complete) per WBS element |

### Optional Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `change_orders` | `.xlsx` | Approved and pending change orders with cost impact and funding source |
| `contracts_register` | `.xlsx` | Active contracts with committed values, invoiced amounts, and retention balances |
| `accrual_estimates` | `.xlsx` | Month-end accrual estimates for goods received / services performed but not yet invoiced |
| `capitalization_rules` | Text or `.pdf` | Corporate CAPEX/OPEX classification policy and asset capitalization thresholds |
| `previous_forecast` | `.xlsx` | Previous month's EAC for variance comparison and trend analysis |
| `tax_depreciation_schedule` | `.xlsx` | Chilean SII depreciation rates for capitalized assets |
| `currency_rates` | `.xlsx` | Exchange rates for multi-currency project expenditures |

### Context Enrichment

The agent should automatically retrieve:
- OPEX budget baseline from `model-opex-budget` for OPEX classification validation
- Cost center structure from `track-cost-centers` for cost center attribution
- Long-lead procurement status from `track-long-lead-procurement` for commitment forecasting
- OR milestone schedule from the Orchestrator for earned value calculations

---

## Output Specification

### Primary Output: Project Expenditure Tracker (`.xlsx`)

**File naming:** `{project_code}_expenditure_tracker_{YYYYMMDD}.xlsx`

**Workbook structure:**

| Sheet | Content |
|-------|---------|
| `Executive Dashboard` | Total budget, committed, actual, forecast; CPI/SPI indicators; top risks; traffic light status |
| `Budget vs Actual` | Line-by-line comparison: WBS, budget, commitments, actuals, forecast, variance (by period and cumulative) |
| `Commitment Register` | All open commitments: PO/contract, vendor, original value, invoiced to date, remaining commitment, expected liquidation date |
| `Earned Value Analysis` | BCWS (PV), BCWP (EV), ACWP (AC), CPI, SPI, EAC, ETC, VAC by WBS element and total |
| `CAPEX/OPEX Split` | Classification of every cost line as CAPEX or OPEX with justification reference |
| `Change Order Log` | Change orders: number, description, cost impact, approval status, funding source, cumulative impact on budget |
| `Forecast History` | Monthly EAC trend (rolling 12 months) with variance explanations for each change |
| `Accruals & Provisions` | Period-end accruals: description, amount, reversal date, supporting documentation |
| `Close-Out Checklist` | Financial close-out readiness: open commitments, pending invoices, retention releases, final cost reconciliation |
| `Cash Flow Forecast` | Monthly cash flow projection based on commitment liquidation schedule and payment terms |

### Secondary Output: Monthly Expenditure Report (`.docx`)

**File naming:** `{project_code}_expenditure_report_{period}_{YYYYMMDD}.docx`

Report sections:
1. Financial summary: budget, committed, actual, forecast, variance
2. Earned value analysis with CPI/SPI commentary
3. Top 5 cost risks and mitigation actions
4. Change order status and cumulative budget impact
5. Cash flow forecast for next 3 months
6. Close-out readiness assessment (percentage of commitments liquidated)

---

## Methodology & Standards

### CAPEX vs. OPEX Classification Decision Tree

```
Is the expenditure for acquiring or constructing a new asset?
  YES -> CAPEX (IAS 16)
  NO  -> Does it extend the useful life beyond original estimate?
           YES -> CAPEX (subsequent expenditure per IAS 16.12)
           NO  -> Does it increase the production capacity?
                    YES -> CAPEX (enhancement per IAS 16.10)
                    NO  -> OPEX (recognize in P&L)

Borderline Items -- Common OR Phase Decisions:
  - Commissioning labor: CAPEX if required to bring asset to working condition
  - First fills (chemicals, lubricants): CAPEX if necessary for initial startup
  - Training during commissioning: OPEX (per IAS 38 -- staff training not capitalizable)
  - Spare parts for commissioning: OPEX if consumed; CAPEX if strategic spares > threshold
  - Pre-production testing: CAPEX if testing is part of commissioning to demonstrate capability
```

### Earned Value Performance Thresholds

| Indicator | Green | Yellow | Red |
|-----------|-------|--------|-----|
| CPI (Cost Performance Index) | >= 0.95 | 0.85 - 0.94 | < 0.85 |
| SPI (Schedule Performance Index) | >= 0.95 | 0.85 - 0.94 | < 0.85 |
| TCPI (To-Complete Performance Index) | <= 1.05 | 1.06 - 1.15 | > 1.15 |
| VAC (Variance at Completion) | >= -2% of BAC | -2% to -5% of BAC | < -5% of BAC |

### Close-Out Financial Checklist Milestones

| Milestone | Criterion | Target |
|-----------|-----------|--------|
| Commitment Liquidation | % of PO value fully invoiced and paid | > 98% |
| Retention Release | All retentions released or accrued | 100% |
| Accrual Clearance | All project accruals reversed or converted to actuals | 100% |
| Change Order Closure | All change orders financially settled | 100% |
| Asset Capitalization | All CAPEX items transferred to fixed asset register | 100% |
| Final Cost Report | Final cost report issued and approved | Issued |

---

## Procedure

### Step 1: Establish Budget Baseline and Cost Structure

1. Load the approved project budget by WBS element, cost type, and period into the tracker.
2. Map each WBS element to its CAPEX/OPEX classification using the corporate capitalization policy.
3. Define the cost element structure: labor, materials, equipment, subcontracts, indirect costs, contingency.
4. Establish the commitment recording threshold (e.g., all POs > USD 1,000 are tracked individually).
5. Set up the earned value measurement methodology:
   - Discrete milestones (0/100 or 0/50/100) for well-defined deliverables
   - Percentage complete for long-duration activities
   - Level of effort for support functions
6. Baseline the budget with management approval date and version number.
7. Configure variance materiality thresholds (absolute and percentage).

### Step 2: Record Commitments and Track Purchase Orders

1. Extract all purchase orders and contracts issued against the project from the ERP.
2. Record each commitment with: PO/contract number, vendor, WBS element, cost element, original value, currency, payment terms, expected delivery/completion dates.
3. For each commitment, track the invoicing lifecycle:
   - Commitment created (PO issued)
   - Goods received / services performed (GR/SR posted)
   - Invoice received and matched (IR posted)
   - Payment processed
4. Calculate open commitment balance = committed value minus invoiced value.
5. Track change orders to commitments (PO amendments, contract variations) with full audit trail.
6. Forecast commitment liquidation dates based on delivery schedules and contract milestones.
7. Flag stale commitments (no activity > 90 days) for review and potential cancellation.

### Step 3: Process Actuals and Calculate Earned Value

1. Extract actual cost postings from the ERP for the reporting period.
2. Validate actuals against commitments (flag postings without corresponding commitments).
3. Verify CAPEX/OPEX classification of each actual posting.
4. Calculate earned value metrics for each WBS element:
   - Planned Value (PV / BCWS) = budgeted cost of work scheduled to date
   - Earned Value (EV / BCWP) = budgeted cost of work performed to date
   - Actual Cost (AC / ACWP) = actual cost incurred to date
5. Derive performance indices:
   - CPI = EV / AC (cost efficiency; < 1.0 = over budget)
   - SPI = EV / PV (schedule efficiency; < 1.0 = behind schedule)
   - TCPI = (BAC - EV) / (EAC - AC) (to-complete performance index)
6. Calculate forecasts:
   - EAC = BAC / CPI (performance-based estimate at completion)
   - ETC = EAC - AC (estimate to complete)
   - VAC = BAC - EAC (variance at completion)
7. Compare EAC against previous month and explain any changes.

### Step 4: Manage Period-End Processes

1. Estimate accruals for goods received / services performed but not yet invoiced.
2. For each accrual, document: description, amount, basis of estimate, expected invoice date.
3. Reconcile prior period accruals: reverse and re-estimate or confirm invoice receipt.
4. Process any reclassifications between CAPEX and OPEX (with documented justification).
5. Record any provisions for claims, disputes, or contingent liabilities.
6. Reconcile total project expenditures (actuals + accruals) against the general ledger.
7. Prepare the period-end journal entry summary for Finance Manager review.
8. Update the cash flow forecast based on current commitment liquidation schedule.

### Step 5: Report, Forecast, and Prepare for Close-Out

1. Generate the monthly Expenditure Report (`.docx`) with financial summary, earned value commentary, and risk assessment.
2. Update the Executive Dashboard with current period data and traffic light indicators.
3. Identify the top 5 cost risks:
   - Uncommitted budget with limited time remaining
   - Contracts approaching their ceiling value
   - Change orders pending approval that affect the forecast
   - Currency exposure on international commitments
   - Claims or disputes with potential financial impact
4. Assess close-out readiness:
   - Percentage of commitments fully liquidated (target: >95% at close-out)
   - Open retentions and their release schedule
   - Pending final invoices and their expected receipt dates
   - Asset capitalization entries prepared
5. Feed financial data to generate-management-accounts for P&L reporting.
6. Provide expenditure status to the Orchestrator for gate review packages.
7. At project close-out: produce the final cost report, close all WBS elements, and transfer capitalized assets to the asset register.

---

## Quality Criteria

| Criterion | Weight | Target | Description |
|-----------|--------|--------|-------------|
| Technical Accuracy | 30% | >98% | Commitment balances, earned value calculations, and EAC figures are arithmetically correct and reconcile to the ERP |
| Completeness | 25% | 100% | Every PO, contract, change order, and actual cost posting is captured; no expenditure outside the tracker |
| Consistency | 15% | 100% | CAPEX/OPEX classification is consistent across all WBS elements; EAC methodology is applied uniformly |
| Format | 10% | Professional | VSC branding, conditional formatting for variances, dashboard charts, print-ready for management review |
| Actionability | 10% | >90% | Cost risks have mitigation plans; variance explanations include root cause and corrective action |
| Traceability | 10% | 100% | Every commitment links to a PO/contract; every actual links to an invoice; every change order has approval documentation |

---

## Inter-Agent Dependencies

### Upstream Dependencies

| Agent/Skill | Data Received | Purpose |
|-------------|---------------|---------|
| Execution / `model-opex-budget` | OPEX budget baseline | OPEX classification benchmark and budget loading |
| Contracts & Compliance / `track-long-lead-procurement` | PO status and delivery forecasts | Commitment liquidation forecasting |
| Contracts & Compliance / `create-contract-scope` | Contract values and milestones | Contract commitment tracking |
| Execution / `manage-change-control` | Approved change orders | Budget amendment and forecast updates |
| Orchestrator / `create-or-plan` | Project schedule and milestones | Earned value planned value calculation |

### Downstream Consumers

| Agent/Skill | Data Provided | Purpose |
|-------------|---------------|---------|
| Finance & Accounting / `generate-management-accounts` | Actual costs by WBS and cost center | Management P&L and project profitability |
| Finance & Accounting / `reconcile-financial-records` | Accruals, commitments, and GL reconciliation | Period-end financial close |
| Finance & Accounting / `track-cost-centers` | Project cost allocation to cost centers | Departmental cost tracking |
| Orchestrator / `generate-or-gate-review` | Financial readiness data | Gate review financial dimension |
| Execution / `forecast-program-completion` | EAC and cost forecast | Program completion forecast |

---

## References

### Standards & Frameworks
- IAS 16 - Property, Plant and Equipment (capitalization criteria for project costs)
- IFRS 15 - Revenue from Contracts with Customers (for contract cost recognition)
- PMI PMBOK Guide, 7th Edition - Earned Value Management (EVM) methodology
- AACE International RP 10S-90 - Cost Engineering Terminology
- Chilean SII - Circular No. 132 on asset capitalization and tax depreciation schedules
- SAP S/4HANA Project System (PS) - Cost planning and budgeting configuration

### Templates
- `templates/project_expenditure_tracker.xlsx` - Standard expenditure tracking workbook
- `templates/earned_value_calculator.xlsx` - EVM calculation template
- `templates/capex_opex_decision_tree.pdf` - CAPEX/OPEX classification decision framework
- `templates/project_closeout_checklist.xlsx` - Financial close-out readiness checklist

### VSC Internal References
- VSC Knowledge Base: "Guia de Control de Costos de Proyectos v3.0"
- VSC Knowledge Base: "Metodologia de Valor Ganado para Proyectos OR"
- VSC OR Methodology: Level 5 (Commissioning & Handover) - Financial close-out requirements

---

## Examples

### Example 1: LNG Terminal OR Program -- Expenditure Tracking

**Input:**
- Project: LNG receiving terminal, total approved budget USD 850M (CAPEX USD 780M, OPEX pre-operations USD 70M).
- 2,400 purchase orders active, 85 contracts.
- Physical progress: 78% complete, 22 months into 30-month schedule.

**Expected Output:**
- Expenditure tracker shows: Committed USD 810M (95.3%), Actual USD 620M (72.9%), Forecast at Completion USD 872M.
- CPI = 0.94 (Yellow), SPI = 0.97 (Green).
- Top risk: 3 change orders (USD 22M combined) pending approval -- driving EAC above budget.
- Close-out readiness: 68% of commitments fully liquidated; 15 POs with stale balances flagged.

### Example 2: Mining Processing Plant -- Monthly Expenditure Report

**Input:**
- Project: Copper flotation plant expansion, budget USD 120M.
- Period: Month 14 of 24-month project. Actuals this month: USD 8.2M.
- 2 change orders approved this month: additional tailings pipe (USD 1.2M), design revision for thickener (USD 0.4M).

**Expected Output:**
- Monthly report highlights: CPI improved from 0.91 to 0.93 (trending toward recovery).
- Change order log updated: cumulative 12 change orders totaling USD 5.8M (4.8% of original budget).
- Cash flow forecast: USD 28M required over next 3 months (peak spend period).
- CAPEX/OPEX split verified: training costs of USD 180K correctly classified as OPEX.

---

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-02-25 | VSC Product Team | Initial skill definition for Finance & Accounting agent |
