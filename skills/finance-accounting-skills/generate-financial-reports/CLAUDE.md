---
name: generate-financial-reports
description: "Generate comprehensive financial reports including monthly close packages, quarterly reviews, project P&L statements, and executive dashboards for OR projects. Triggers: 'generate financial reports', 'monthly financial close', 'generar reportes financieros'."
---

# Generate Financial Reports
## Skill ID: generate-financial-reports
## Version: 1.0.0
## Category: A - Document Generation
## Priority: High

## Purpose
Financial reporting in Operational Readiness projects serves as the primary communication mechanism between the project team and stakeholders regarding the financial health, performance, and trajectory of the project. In the context of large industrial capital projects transitioning to operations, the financial reporting requirements span multiple audiences — from site-level work package managers who need granular cost data to executive leadership and client representatives who require strategic-level summaries with clear narratives on cost performance, risk exposure, and forecast confidence. This skill enables the systematic generation of professional-grade financial reports that transform raw financial data into actionable intelligence, supporting informed decision-making at every level of the project governance hierarchy.

The challenge of OR financial reporting lies in the convergence of capital expenditure wind-down and operational expenditure ramp-up. During the OR phase, the project simultaneously manages residual CAPEX commitments from construction and commissioning while ramping up OPEX for staffing, maintenance contracts, consumables, and operational services. Standard project financial reports often fail to capture this dual dynamic, leading to confused stakeholders and poor decision-making. This skill addresses this complexity by producing reports that clearly delineate CAPEX and OPEX streams, track the transition from project funding to operational budget, and provide visibility into the key financial metrics that matter most during the OR phase: cost-at-completion confidence, operational budget adequacy, and working capital requirements. Each report is designed to be self-contained, professionally formatted to VSC standards, and traceable to source data.

## Intent & Specification
The AI agent MUST understand that:
1. Financial reports must be produced on a defined cadence — monthly close packages within 5 business days of period end, quarterly reviews within 10 business days, and ad-hoc reports within 2 business days of request.
2. Every financial figure in a report must be traceable to a source document or system extract — no estimated or approximate figures without explicit qualification and confidence indicators.
3. Reports must clearly separate CAPEX and OPEX streams, showing the transition profile from capital project spending to ongoing operational costs during the OR phase.
4. Variance narratives must go beyond stating the variance amount — they must explain root causes, assess impact on the Estimate at Completion, and recommend specific corrective actions.
5. All reports must include forward-looking elements: updated forecasts, risk-adjusted scenarios, and key assumptions that underpin the projected financial outcome.

## Trigger / Invocation
```
/generate-financial-reports
```
### Natural Language Triggers
- "Generate the monthly financial report"
- "Prepare quarterly financial review package"
- "Create the project P&L statement"
- "Generar reportes financieros mensuales"
- "Preparar revision financiera trimestral"
- "Crear estado de resultados del proyecto"

## Input Requirements
### Required Inputs
| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| Budget Execution Data | Current period committed, actual, forecast by WBS | XLSX | track-budget-execution skill output |
| PO and Invoice Registers | Active POs and processed invoices for the period | XLSX | manage-purchase-orders and manage-invoice-workflow outputs |
| Project Schedule Status | Current schedule performance and milestone status | XLSX/MPP | Execution Agent — Project Controls |
| Previous Period Report | Prior reporting period financial report for trend comparison | XLSX/PDF | Document repository |

### Optional Inputs (Highly Recommended)
| Input | Description | Default |
|-------|-------------|---------|
| Risk Register with Quantified Exposure | Financial risk quantification for risk-adjusted reporting | Contingency balance reported without risk overlay |
| Earned Value Metrics | CPI, SPI, TCPI for earned value reporting | Cost-only metrics used |
| Client Reporting Template | Client-specific format requirements | VSC standard template applied |
| FX Rate Table | Current and forecast exchange rates for multi-currency reporting | Single currency assumed |

### Context Enrichment
The agent should automatically:
- Pull the latest budget execution data from the track-budget-execution skill to ensure all cost figures reflect the most current period close
- Cross-reference invoice aging data from the manage-invoice-workflow skill to report on payment performance and outstanding liabilities
- Retrieve cash flow projections from the forecast-cashflow skill for inclusion in the working capital and liquidity sections
- Compare current period metrics against the previous 3-6 periods to calculate meaningful trends and identify inflection points
- Check for any approved budget changes during the reporting period that affect variance calculations

## Output Specification
### Document: Financial Report Package
**Filename**: `VSC_FinancialReport_{ProjectCode}_{Version}_{Date}.xlsx`

**Structure**:
1. **Executive Financial Summary** — One-page dashboard with total project cost position (BAC, EAC, VAC), period spend, cumulative S-curve, top 3 cost risks, top 3 opportunities, and overall financial health traffic-light rating with brief narrative
2. **Project P&L Statement** — Profit and loss format showing revenue/funding, direct costs by category (labor, materials, services, equipment), indirect costs, overheads, contingency utilization, and net project margin with comparison to budget and prior period
3. **Cost Performance by WBS** — Detailed cost breakdown by WBS element showing budget, committed, actual, forecast, EAC, and variance with color-coded flags for elements exceeding tolerance thresholds
4. **CAPEX-OPEX Transition Profile** — Visual representation of the shift from capital to operational spending, showing monthly CAPEX and OPEX actuals and forecasts on a combined chart with the transition crossover point highlighted
5. **Variance Analysis Narratives** — Written explanations for all material variances (exceeding defined thresholds), including root cause, impact assessment, corrective action plan, and responsible owner
6. **Cash Position and Forecast** — Current cash position, accounts payable aging, accounts receivable status, and 90-day cash flow forecast with funding adequacy assessment
7. **Risk-Adjusted Financial Outlook** — Best case, most likely, and worst case financial scenarios with probability-weighted EAC and key assumptions underpinning each scenario

### Key Metrics
| Metric | Description | Target |
|--------|-------------|--------|
| Report Timeliness | Monthly report delivered within N business days of period end | <= 5 business days |
| Data Accuracy | Percentage of financial figures verified against source systems | 100% reconciled |
| Variance Coverage | Percentage of material variances with documented root cause analysis | 100% of variances > threshold |
| Forecast Stability | Month-on-month change in EAC | < 2% unless driven by approved scope change |
| Stakeholder Satisfaction | Report rated as useful and actionable by recipients | > 4.0 / 5.0 rating |

## Procedure

### Step 1: Gather and Validate Source Data
- Collect all period-end financial data from source systems: budget execution tracker, PO register, invoice register, payroll system, and general ledger
- Perform data validation checks: reconcile total actuals against the general ledger, verify commitment balances against the PO register, and confirm that all approved budget changes are reflected
- Validate the completeness of accruals: check that all goods received without invoices have corresponding accrual entries, and that prior period accruals have been properly reversed upon invoice posting
- Identify and resolve any data discrepancies before proceeding with report generation, documenting all adjustments made
- Confirm the reporting period cutoff date and ensure all transactions up to that date are included while transactions after the cutoff are excluded
- Prepare a data quality summary noting any known data gaps, pending reconciliations, or estimated figures that will be refined in subsequent periods

### Step 2: Calculate Performance Metrics
- Compute the current period cost position: total committed, total actual, total accruals, forecast-to-complete, and EAC for every WBS element and cost category
- Calculate variance metrics: Cost Variance (CV = Budget - EAC), Schedule Variance (if earned value data available), and trend indicators (improving/stable/deteriorating)
- Determine the CAPEX-OPEX split for the current period and cumulative to date, calculating the transition rate and projected crossover date
- Compute cash-related metrics: days payable outstanding, invoice processing cycle time, and cash burn rate for inclusion in the liquidity section
- Calculate period-over-period trends: compare the current period EAC against each of the previous 6 periods to identify the direction and magnitude of forecast movement
- Compute the To-Complete Performance Index (TCPI) to assess whether the remaining work can realistically be completed within the remaining budget
- Calculate the contingency burn rate and project the date at which contingency will be fully consumed if the current drawdown rate continues

### Step 3: Develop Variance Narratives and Forecasts
- For each WBS element or cost category exceeding variance thresholds, prepare a structured narrative following the template:
  - **What**: Description of the variance (amount, percentage, favorable/unfavorable)
  - **Why**: Root cause analysis (scope change, pricing, quantity, productivity, timing, or forecast error)
  - **So What**: Impact on the total project EAC and the critical path
  - **Now What**: Recommended corrective action with responsible owner and target date
- Update the forecast-to-complete for each work package based on the latest information, adjusting for known scope changes, pricing adjustments, and productivity trends
- Develop the risk-adjusted financial outlook with three scenarios, documenting the key assumptions and probability assessments for each scenario:
  - **Optimistic**: All risks mitigated, opportunities realized, favorable market conditions
  - **Most Likely**: Current trends continue, known risks materialize at expected probability
  - **Pessimistic**: Key risks materialize, market conditions deteriorate, schedule delays impact costs
- Prepare the management summary highlighting the top issues, decisions required, and recommended actions for the project leadership team

### Step 4: Build Report Package
- Populate the VSC financial report template with all calculated data, metrics, charts, and narratives
- Generate visualizations: cumulative S-curve (budget vs actual vs forecast), monthly spend bar chart, CAPEX-OPEX transition chart, cost category waterfall, and variance heat map
- Create the P&L statement with proper accounting format: revenue/funding at the top, direct costs by category, gross margin, indirect costs, overheads, net margin, with comparison columns for budget, prior period, and variance
- Build the CAPEX-OPEX transition chart showing the monthly crossover pattern and the projected date when OPEX exceeds CAPEX (the "operational independence" milestone)
- Format all tables with consistent number formatting, traffic-light color coding, and clear column headers that match the defined terminology
- Add the executive summary page last, synthesizing the key messages from all sections into a concise, decision-oriented overview

### Step 5: Review, Approve, and Distribute
- Perform a quality review of the complete report package, checking for calculation errors, formatting inconsistencies, and narrative clarity
- Verify that all figures cross-reference correctly: the P&L totals match the WBS detail, the cash position ties to the invoice aging, and the EAC reconciles between the summary and detail sections
- Route the report through the defined approval workflow — typically financial controller review followed by project manager sign-off
- Prepare an executive briefing note (1-2 pages) summarizing the key messages for board or steering committee presentations
- Distribute the approved report to the defined stakeholder distribution list through established governance channels
- Archive the report in the project document management system with proper version control and period tagging for audit trail purposes

## Report Types and Cadence

| Report Type | Cadence | Audience | Key Content | Delivery |
|------------|---------|----------|-------------|----------|
| Monthly Close Package | Monthly (by WD+5) | Project team, client PM | Full cost position, WBS detail, variances, forecasts | Excel + PDF |
| Quarterly Financial Review | Quarterly (by WD+10) | Senior leadership, client executive | P&L, risk outlook, scenario analysis, strategic recommendations | Presentation + Excel |
| Weekly Flash Report | Weekly (Fridays) | Project manager, cost engineer | Key metrics movement, new commitments, payment status | One-page dashboard |
| Ad-Hoc Analysis | On request (by WD+2) | As requested | Specific topic deep-dive (e.g., contractor cost analysis, category spend review) | Excel or memo |
| Gate Review Finance Pack | Per gate schedule | Gate review panel | Cumulative cost performance, forecast confidence, go/no-go financial assessment | Presentation |

## Failure Modes & Common Pitfalls

| Failure Mode | Root Cause | Prevention Strategy |
|-------------|-----------|-------------------|
| Report figures do not match source systems | Manual data entry errors or stale data extracts | Automated data feeds where possible; reconciliation checklist before report publication |
| Variance narratives are generic or unhelpful | Insufficient investigation or boilerplate language | Structured narrative template (What/Why/So What/Now What); reviewer training |
| Forecast is unrealistic (consistently optimistic) | Anchoring bias; reluctance to report bad news | Independent forecast validation; TCPI cross-check; trend-based challenge |
| Report arrives late, reducing decision value | Complex data gathering or approval bottlenecks | Staggered data cutoffs; parallel preparation workflow; pre-approved templates |
| Stakeholders do not read or act on reports | Report is too long, too detailed, or poorly structured | Executive summary on page 1; action items clearly highlighted; verbal briefing accompanies written report |
| CAPEX/OPEX split is incorrect | Ambiguous cost coding rules during transition | Clear CAPEX/OPEX classification guide issued to all cost originators; monthly audit |

## Escalation Protocols

| Trigger | Timeline | Escalation Path |
|---------|----------|----------------|
| Report delivery delayed beyond WD+5 | Day 6 | Project Manager notified; root cause documented |
| Total project EAC exceeds approved budget | At detection | Project Director briefing within 24 hours; corrective action plan within 5 business days |
| Contingency adequacy ratio < 0.8 | At detection | Risk Manager and Project Director joint review; contingency replenishment assessment |
| Forecast instability > 5% month-on-month | Monthly review | Project Controls audit of forecast methodology; work package manager interviews |
| Data reconciliation gap > 1% of total budget | At period close | Finance Controller investigation; hold report until reconciled |

## Visualization Standards

All financial reports must use consistent visualization formats to enable rapid interpretation and cross-period comparison.

### Chart Types and Usage

| Chart Type | Application | Key Requirements |
|-----------|-------------|-----------------|
| Cumulative S-Curve | Budget vs Actual vs Forecast over time | Three lines (budget, actual, forecast); shaded area for variance; monthly data points |
| Monthly Spend Bar Chart | Period-by-period actual spend vs planned | Stacked bars by cost category; budget overlay line; variance annotation |
| CAPEX-OPEX Transition Chart | Capital to operational spending crossover | Dual-area chart showing CAPEX declining and OPEX rising; crossover point marked |
| Cost Category Waterfall | Budget to EAC bridge analysis | Starting from BAC, showing additive/subtractive variances by category to reach EAC |
| Variance Heat Map | WBS-level variance severity | Color-coded matrix: green (<3%), amber (3-5%), red (>5%); organized by WBS hierarchy |
| Contingency Burn-Down | Contingency utilization over time | Starting balance, cumulative drawdowns, remaining balance, projected exhaustion date |

### Color Coding Standards

| Indicator | Color | Condition |
|-----------|-------|-----------|
| On Track | Green | Variance within tolerance; no action required |
| Watch | Amber | Variance approaching tolerance; monitoring required |
| Alert | Red | Variance exceeds tolerance; corrective action required |
| Favorable | Blue | Favorable variance (under budget); opportunity to reallocate |

## Definitions & Glossary

| Term | Definition |
|------|-----------|
| Period Close | The process of finalizing all financial transactions for a reporting period and generating the period-end cost position |
| Cutoff Date | The date that defines the boundary between reporting periods; transactions after this date are excluded from the current period |
| P&L (Profit and Loss) | Financial statement format showing revenue, costs, and net margin for the project |
| S-Curve | Cumulative cost or progress plotted over time, typically showing a characteristic S-shape as spending accelerates then decelerates |
| Traffic-Light Rating | Red/Amber/Green status indicator used to communicate financial health at a glance |
| Variance Narrative | Structured written explanation of the root cause, impact, and corrective action for a material cost variance |
| EAC Confidence | Qualitative assessment of the reliability of the Estimate at Completion, based on forecast methodology maturity and data quality |
| Working Capital | The difference between current assets (cash, receivables) and current liabilities (payables, accruals); a measure of short-term liquidity |

## Quality Criteria

| Dimension | Weight | Target | Measurement |
|-----------|--------|--------|-------------|
| Technical Accuracy | 30% | >95% accuracy | All financial figures reconciled against source systems; calculations independently verified |
| Completeness | 25% | 100% coverage | All required sections present; all material variances have narratives; all WBS elements reported |
| Consistency | 15% | Zero conflicts | Report figures consistent with PO register, invoice log, budget tracker, and cash flow forecast |
| Format | 10% | Professional | VSC branded template with clear charts, consistent formatting, and executive-ready presentation |
| Actionability | 10% | Immediately usable | Variance narratives include specific corrective actions; dashboards enable rapid status assessment |
| Traceability | 10% | Full audit trail | Every figure traceable to source transaction; assumptions documented for all forecasts |

## Inter-Agent Dependencies

### Inputs From Other Agents
| Agent | Entity/Deliverable | Purpose |
|-------|-------------------|---------|
| Execution | Budget execution data (via track-budget-execution) | Core financial data for all report sections |
| Execution | PO register (via manage-purchase-orders) | Commitment data and procurement performance metrics |
| Execution | Invoice register (via manage-invoice-workflow) | Actual cost data and payment performance metrics |
| Execution | Cash flow forecast (via forecast-cashflow) | Liquidity section and working capital reporting |
| Orchestrator | Project milestone status | Schedule context for financial performance interpretation |
| HSE | HSE expenditure breakdown | Safety investment tracking for compliance section |

### Outputs Consumed By
| Agent | Entity/Deliverable | Purpose |
|-------|-------------------|---------|
| Orchestrator | Executive financial summary | Governance forum presentations and client reporting |
| Execution | Period-end financial position | Project controls baseline for next period planning |
| Contracts & Compliance | Contract cost performance | Vendor performance reviews and commercial negotiations |
| HSE | HSE budget consumption report | Safety investment tracking and compliance reporting |

## Report Distribution and Governance

### Distribution Matrix

| Report | Primary Recipients | Secondary Recipients | Format | Classification |
|--------|-------------------|---------------------|--------|---------------|
| Monthly Close Package | Project Manager, Cost Engineer, Finance Controller | Client PM, Steering Committee | Excel + PDF | Confidential |
| Quarterly Financial Review | Project Director, Client Executive, Steering Committee | Finance Director, Regional Manager | Presentation + Excel | Restricted |
| Weekly Flash Report | Project Manager, Work Package Managers | Cost Engineers, Procurement Lead | One-page PDF | Internal |
| Ad-Hoc Analysis | Requesting stakeholder | Project Manager (copy) | Excel or Memo | As classified |
| Gate Review Finance Pack | Gate Review Panel, Project Sponsor | Project Controls, Finance | Presentation | Restricted |

### Governance Controls
- All financial reports must be reviewed by the Finance Controller or delegated cost engineer before distribution
- Reports containing forecast changes greater than 2% of total budget require Project Director sign-off before release
- Client-facing reports must be reviewed for consistency with contractual reporting obligations and any information sensitivity restrictions
- Archived reports must be stored with version control in the project document management system, tagged by reporting period and report type
- Any corrections to previously issued reports must be documented via a formal addendum with clear identification of the changed figures and explanation of the correction

## References
- `methodology/or-playbook-and-procedures/` — OR procedures including financial governance and reporting standards
- `methodology/capital-projects/` — Capital project financial reporting frameworks and templates
- `methodology/templates/` — Financial report templates and dashboard design standards
- `methodology/deliverable-examples/` — Example financial reports from previous OR projects
- IAS 11 / IFRS 15 — Revenue recognition and project accounting standards
- AACE International Recommended Practice 29R-03 — Forensic Schedule Analysis (cost/schedule integration)

## Changelog
| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-25 | Initial creation — Wave 2 |
