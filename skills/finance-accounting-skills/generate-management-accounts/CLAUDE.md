---
name: generate-management-accounts
description: "Generate management accounting reports including P&L by project and department, contribution margin analysis, and internal financial reporting for industrial operations. Triggers: 'management accounts', 'internal P&L', 'cuentas de gestion', 'informe financiero interno'."
---

# Generate Management Accounts

## Skill ID: generate-management-accounts

## Version: 1.0.0

## Category: A - Document Generation

## Priority: Medium

---

## Purpose

Produce comprehensive management accounting reports for industrial operations, including profit and loss statements segmented by project, department, and service line, contribution margin analysis, operating cost breakdowns, and rolling financial forecasts. This skill transforms raw financial data from cost centers, project expenditures, and revenue streams into decision-ready internal reports that enable plant managers, project directors, and executive leadership to understand financial performance, identify improvement opportunities, and make informed resource allocation decisions.

Management accounts differ fundamentally from statutory financial statements. While statutory reports serve external compliance requirements (IFRS, tax authorities, regulators), management accounts serve internal decision-making with greater granularity, faster turnaround, and forward-looking projections. In the context of Operational Readiness, management accounts become critical during the transition from capital project to operations: they provide the first view of actual operating costs versus the budget model, reveal whether the staffing plan delivers expected productivity, track whether maintenance strategies achieve target reliability at forecast cost, and ultimately measure whether the asset generates the return on investment projected in the feasibility study.

This skill consolidates data from track-cost-centers (departmental costs), track-project-expenditures (project-level costs and revenues), and reconcile-financial-records (verified balances) to produce a unified management reporting package. It feeds the Orchestrator with financial KPIs for gate reviews and executive briefings, and provides the Execution agent with cost performance data for earned value analysis and budget revision cycles.

---

## Intent & Specification

The AI agent MUST understand that:

1. **Segment reporting** is the core value proposition -- management accounts must present financial performance segmented by the dimensions that matter to decision-makers: by project/contract, by department/function, by product/service line, and by time period (monthly, quarterly, YTD, rolling 12-month).
2. **Contribution margin analysis** must clearly separate variable costs from fixed costs at each segment level, enabling managers to understand the true incremental profitability of each project, product, or service and make rational pricing and resource allocation decisions.
3. **Accrual-basis reporting** is mandatory -- management accounts must reflect economic reality (when costs are incurred and revenues are earned), not cash-basis timing, requiring proper accrual estimates and revenue recognition aligned with IFRS 15.
4. **Variance analysis** must go beyond simple budget-vs-actual comparisons to decompose variances into price, volume, mix, and efficiency components, enabling root cause identification rather than surface-level observation.
5. **Rolling forecasts** must replace static annual budgets as the primary forward-looking tool, updating the remaining months of the fiscal year based on actual trends, known changes, and management decisions, providing a realistic projection rather than an outdated budget.
6. **KPI integration** means that financial metrics must be linked to operational KPIs (production volume, equipment availability, headcount, safety incidents) to provide context for financial results and enable correlation analysis.
7. **Timeliness over precision** is a fundamental management accounting principle -- reports should be available within 5-7 working days of period close with 95% accuracy, rather than waiting 30+ days for 100% accuracy, because the decision-making value of financial information decays rapidly with time.

---

## Trigger / Invocation

### Natural Language Triggers

**English:**
- "Generate the monthly management accounts for the operation"
- "Produce a P&L by project showing contribution margins"
- "Create the internal financial report for Q3"
- "Build a rolling forecast based on current actuals"

**Spanish:**
- "Generar las cuentas de gestion mensuales de la operacion"
- "Producir un estado de resultados por proyecto con margen de contribucion"
- "Crear el informe financiero interno del tercer trimestre"

**Command:** `/generate-management-accounts`

**Aliases:**
- `/management-accounts`
- `/internal-pnl`
- `/cuentas-de-gestion`

---

## Input Requirements

### Required Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `cost_center_actuals` | `.xlsx` or ERP extract | Actual costs by cost center, cost element, and period from track-cost-centers |
| `revenue_data` | `.xlsx` or ERP extract | Revenue by project/contract, including invoiced, accrued, and deferred revenue |
| `budget_data` | `.xlsx` | Approved budget by segment (project, department, cost element) with monthly phasing |
| `organizational_structure` | `.xlsx` or text | Current org structure for department-level reporting segmentation |

### Optional Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `project_expenditures` | `.xlsx` | Project-level cost data from track-project-expenditures for project P&L |
| `previous_management_accounts` | `.xlsx` | Prior period management accounts for trend analysis and comparative reporting |
| `operational_kpis` | `.xlsx` | Production volumes, equipment availability, headcount, safety statistics for KPI linkage |
| `rolling_forecast_assumptions` | `.xlsx` or text | Updated assumptions for remaining periods (price changes, volume changes, new contracts) |
| `intercompany_transactions` | `.xlsx` | Intercompany charges and allocations for elimination in consolidated reporting |
| `fixed_variable_classification` | `.xlsx` | Cost element classification as fixed, variable, or semi-variable for contribution margin analysis |
| `contract_profitability_data` | `.xlsx` | Contract terms, pricing, and margin targets for contract-level P&L |

### Context Enrichment

The agent should automatically retrieve:
- Cost center balances and allocations from `track-cost-centers`
- Project expenditure data from `track-project-expenditures`
- Reconciled balances from `reconcile-financial-records`
- Operational KPIs from Operations agent (`calculate-operational-kpis`)
- OPEX budget baseline from Execution agent (`model-opex-budget`)

---

## Output Specification

### Primary Output: Management Accounts Package (`.xlsx`)

**File naming:** `{project_code}_management_accounts_{period}_{YYYYMMDD}.xlsx`

**Workbook structure:**

| Sheet | Content |
|-------|---------|
| `Executive Summary` | One-page financial overview: revenue, EBITDA, net margin, key variances, traffic light KPIs |
| `Consolidated P&L` | Full P&L statement: revenue, direct costs, gross margin, overhead, EBITDA, depreciation, EBIT |
| `P&L by Project` | Individual P&L for each active project/contract showing revenue, direct costs, and contribution margin |
| `P&L by Department` | Cost summary by department with budget comparison and variance analysis |
| `Contribution Margin` | Multi-step contribution margin: Revenue - Variable Costs = CM1; CM1 - Direct Fixed = CM2; CM2 - Allocated = CM3 |
| `Variance Analysis` | Detailed variance decomposition: price, volume, mix, efficiency, and FX components |
| `Rolling Forecast` | Updated full-year forecast: actuals for elapsed months + forecast for remaining months |
| `Cash Flow Summary` | Cash receipts, disbursements, and projected cash position for the next 3 months |
| `KPI Linkage` | Financial metrics alongside operational KPIs with correlation indicators |
| `Assumptions` | All assumptions underpinning forecasts, allocations, and accrual estimates |

### Secondary Output: Management Accounts Narrative (`.docx`)

**File naming:** `{project_code}_management_accounts_narrative_{period}_{YYYYMMDD}.docx`

Report sections:
1. Financial highlights and lowlights (2-3 key messages)
2. Revenue analysis: invoiced vs. target, pipeline, backlog
3. Cost analysis: major variances with root cause and corrective action
4. Project profitability review: contribution margin by project with trend
5. Rolling forecast changes: what changed and why
6. Cash position and working capital commentary
7. Recommendations for management action

---

## Procedure

### Step 1: Collect and Validate Financial Data

1. Extract actual cost data by cost center and cost element for the reporting period from track-cost-centers.
2. Extract revenue data by project/contract from the ERP or billing system.
3. Extract project expenditure data from track-project-expenditures for project-level P&L.
4. Verify that total costs reconcile to the general ledger (cross-reference with reconcile-financial-records).
5. Process intercompany eliminations if consolidated reporting is required.
6. Verify that all period-end accruals and provisions have been posted.
7. Confirm cut-off: all transactions for the period are captured; no next-period transactions are included.
8. Document any data quality issues or known gaps (create RFI if critical data is missing).

### Step 2: Build Consolidated and Segmented P&L Statements

1. Construct the consolidated P&L following the standard management reporting format:
   - Revenue (by type: contract revenue, variation orders, other income)
   - Direct costs (labor, materials, subcontractors, equipment, consumables)
   - Gross margin
   - Overhead costs (allocated per track-cost-centers allocation model)
   - EBITDA
   - Depreciation and amortization
   - EBIT
   - Finance costs (if applicable)
   - Net result
2. Segment the P&L by project/contract:
   - Allocate revenue to each project based on billing data
   - Allocate direct costs based on WBS/cost center postings
   - Allocate overhead using the approved allocation methodology
   - Calculate contribution margin at each level (CM1, CM2, CM3)
3. Segment the P&L by department:
   - Aggregate costs by department from cost center data
   - Compare against departmental budgets
   - Calculate departmental cost ratios (cost per FTE, cost per unit produced)
4. For each segment, calculate:
   - Budget variance (absolute and percentage)
   - Prior period comparison (month-over-month and year-over-year)
   - Margin percentages (gross margin %, EBITDA %, net margin %)

### Step 3: Perform Variance Analysis and Contribution Margin Decomposition

1. For each material variance (exceeding materiality threshold), decompose into components:
   - **Price variance:** (actual unit price - budgeted unit price) x actual quantity
   - **Volume variance:** (actual quantity - budgeted quantity) x budgeted unit price
   - **Mix variance:** impact of different product/project mix on overall margins
   - **Efficiency variance:** (actual hours - standard hours for actual output) x standard rate
   - **FX variance:** impact of exchange rate movements on costs and revenues
2. Classify each variance as controllable or uncontrollable.
3. For controllable variances, assign corrective action owner and deadline.
4. Build the multi-step contribution margin analysis:
   - CM1 = Revenue - Variable Costs (measures variable cost efficiency)
   - CM2 = CM1 - Direct Fixed Costs (measures project/segment profitability)
   - CM3 = CM2 - Allocated Overhead (measures net contribution after full cost allocation)
5. Identify projects/segments with CM1 < 0 (should be discontinued unless strategic) and CM2 < 0 (not covering direct fixed costs).

### Step 4: Update Rolling Forecast

1. Replace budget figures for elapsed months with actuals (locked, no longer forecast).
2. For remaining months, update the forecast based on:
   - Run-rate extrapolation of recent actuals (default methodology)
   - Known changes: new contracts, contract terminations, price changes, headcount changes
   - Seasonal adjustments: shutdown months, ramp-up periods, weather impacts
   - Management decisions: approved budget reallocations, contingency releases
3. Calculate the updated full-year forecast (actuals to date + remaining forecast).
4. Compare the new forecast against:
   - Original budget (annual variance)
   - Previous month's forecast (forecast change)
5. Document all forecast changes with rationale in the Assumptions sheet.
6. Calculate revised KPI forecasts: full-year EBITDA margin, cost per unit, revenue per FTE.

### Step 5: Compile Final Package and Distribute

1. Populate the Executive Summary sheet with key metrics and traffic light indicators:
   - Green: within 5% of budget
   - Yellow: 5-10% variance from budget
   - Red: >10% variance from budget
2. Link financial KPIs to operational KPIs in the KPI Linkage sheet:
   - Revenue per production unit vs. plant utilization
   - Maintenance cost per unit vs. equipment availability
   - Staffing cost per FTE vs. overtime hours
3. Prepare the cash flow summary based on:
   - Revenue invoicing and collection forecasts
   - Committed expenditure payment schedules
   - Working capital movements (receivables, payables, inventory)
4. Write the management accounts narrative (`.docx`) highlighting:
   - Top 3 financial achievements of the period
   - Top 3 financial concerns requiring management attention
   - Specific recommendations with quantified impact
5. Submit the package for Finance Manager review and approval.
6. Distribute approved management accounts to stakeholders via the Orchestrator.
7. Feed financial KPIs to the Orchestrator for the executive briefing and gate review.

---

## Quality Criteria

| Criterion | Weight | Target | Description |
|-----------|--------|--------|-------------|
| Technical Accuracy | 30% | >98% | All P&L figures reconcile to the GL; variance decompositions are arithmetically correct; margin calculations are verified |
| Completeness | 25% | 100% | All revenue streams and cost categories are captured; all active projects have a P&L; rolling forecast covers all remaining months |
| Consistency | 15% | 100% | Allocation methodology is applied uniformly; period-over-period comparisons use consistent bases; CAPEX/OPEX classification is consistent |
| Format | 10% | Professional | VSC branding, executive-ready charts, conditional formatting, consistent number formatting (thousands separator, decimal places) |
| Actionability | 10% | >90% | Variance commentary includes root cause and recommended action; forecast changes are explained; underperforming segments are flagged |
| Traceability | 10% | 100% | Every figure traces to source (GL account, cost center, WBS); allocation bases are documented; forecast assumptions are explicit |

---

## Inter-Agent Dependencies

### Upstream Dependencies

| Agent/Skill | Data Received | Purpose |
|-------------|---------------|---------|
| Finance & Accounting / `track-cost-centers` | Cost center actuals and allocations | Departmental cost data and overhead distribution |
| Finance & Accounting / `track-project-expenditures` | Project actuals and commitments | Project-level P&L construction |
| Finance & Accounting / `reconcile-financial-records` | Reconciled GL balances | Data integrity verification |
| Operations / `calculate-operational-kpis` | Production volumes, availability, headcount | KPI linkage and context for financial results |
| Execution / `model-opex-budget` | OPEX budget baseline | Budget comparison reference |

### Downstream Consumers

| Agent/Skill | Data Provided | Purpose |
|-------------|---------------|---------|
| Orchestrator / `create-executive-briefing` | Financial highlights and KPIs | Executive-level financial summary |
| Orchestrator / `generate-or-gate-review` | Financial readiness metrics | Gate review financial dimension |
| Orchestrator / `create-kpi-dashboard` | Financial KPIs | Integrated dashboard reporting |
| Execution / `model-opex-budget` | Actual vs. budget performance | Budget revision and next-year planning |
| Contracts & Compliance / `audit-compliance-readiness` | Management accounts for audit review | Internal audit and compliance verification |

---

## References

### Standards & Frameworks
- IMA (Institute of Management Accountants) - Statement on Management Accounting practices
- CIMA (Chartered Institute of Management Accountants) - Management Accounting Framework
- IFRS 8 - Operating Segments (segment reporting principles applicable to management reporting)
- IFRS 15 - Revenue from Contracts with Customers (revenue recognition for project-based businesses)
- IAS 1 - Presentation of Financial Statements (P&L structure and classification)
- Chilean SII - Monthly VAT and income tax reporting requirements

### Templates
- `templates/management_accounts_package.xlsx` - Standard management accounts workbook
- `templates/contribution_margin_template.xlsx` - Multi-step contribution margin analysis
- `templates/rolling_forecast_template.xlsx` - Rolling forecast workbook
- `templates/management_narrative_template.docx` - Monthly narrative report template

### VSC Internal References
- VSC Knowledge Base: "Modelo de Cuentas de Gestion para Operaciones Industriales v2.0"
- VSC Knowledge Base: "Guia de Analisis de Margen de Contribucion por Proyecto"
- VSC Knowledge Base: "Estandar de Reporte Financiero Interno - Formato y Contenido"
- VSC OR Methodology: Level 4 (Systems & Processes) - Financial reporting readiness

---

## Examples

### Example 1: O&M Contract Operation -- Monthly Management Accounts

**Input:**
- Operation: 100,000 m3/day desalination plant under O&M contract.
- Revenue: USD 1.35M monthly contract fee (fixed) + USD 0.12/m3 variable component.
- Cost center actuals: total USD 1.28M (staffing USD 420K, energy USD 510K, maintenance USD 180K, chemicals USD 95K, overhead USD 75K).
- Production: 2.8M m3 for the month (93.3% capacity utilization).

**Expected Output:**
- Consolidated P&L: Revenue USD 1.69M, Direct Costs USD 1.21M, Gross Margin USD 480K (28.4%).
- EBITDA: USD 320K (18.9%) vs. budget USD 350K (Yellow -- 8.6% unfavorable).
- Key variance: Energy cost +12% vs. budget driven by tariff increase (uncontrollable price variance).
- Rolling forecast updated: full-year EBITDA revised from USD 4.2M to USD 3.9M (-7.1%) due to energy cost impact.
- Recommendation: renegotiate contract energy pass-through clause at next review.

### Example 2: Mining Consulting Project -- Project Profitability

**Input:**
- 3 active consulting projects for different mining clients.
- Total monthly revenue: USD 280K. Total direct costs: USD 195K.
- Project A: Revenue USD 120K, Direct costs USD 72K (CM1 = 40%).
- Project B: Revenue USD 95K, Direct costs USD 85K (CM1 = 10.5%).
- Project C: Revenue USD 65K, Direct costs USD 38K (CM1 = 41.5%).

**Expected Output:**
- P&L by project showing Project B underperforming at CM1 = 10.5% (below 25% threshold).
- Contribution margin analysis: after allocated overhead (USD 45K), Project B is CM3-negative (-USD 2.5K).
- Variance analysis: Project B over-budget on senior consultant hours (+32 hours vs. plan).
- Recommendation: review Project B scope and staffing mix; consider renegotiating fee or reallocating senior staff.

---

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-02-25 | VSC Product Team | Initial skill definition for Finance & Accounting agent |
