---
name: forecast-cashflow
description: "Forecast project cash flow including inflow/outflow projections, working capital requirements, payment scheduling, and foreign exchange exposure analysis for OR projects. Triggers: 'forecast cash flow', 'cash flow projection', 'proyeccion de flujo de caja'."
---

# Forecast Cash Flow
## Skill ID: forecast-cashflow
## Version: 1.0.0
## Category: B - Analysis
## Priority: High

## Purpose
Cash flow forecasting is one of the most critical financial management disciplines in Operational Readiness projects, directly determining the project's ability to meet its financial obligations on time, maintain contractor and vendor confidence, and avoid the operational disruptions that inevitably follow funding shortfalls. Unlike static budget reporting that shows cumulative cost positions, cash flow forecasting is fundamentally a timing exercise — it answers the question of when money will actually flow in and out of the project accounts, not just how much will be spent in total. In the OR phase, this timing dimension is particularly challenging because the project experiences simultaneous cash demands from multiple sources: final construction payments, commissioning contractor mobilization, operational staff payroll ramp-up, spare parts and consumable purchases, insurance and regulatory fees, and initial operational costs — all while the revenue or funding inflow may be subject to milestone-based release conditions, client approval processes, or drawdown limitations.

Effective cash flow forecasting in the OR context must integrate information from multiple workstreams: the PO commitment pipeline (when will committed spend become payable), the invoice processing workflow (what is currently approved and awaiting payment), the contract payment schedules (what milestone payments are upcoming), the staffing ramp-up plan (when will payroll costs step up), and the project funding structure (when will funding tranches be released). For multi-currency projects, the forecast must also account for foreign exchange exposure, hedging positions, and the impact of currency movements on the project's cash position in reporting currency terms. This skill enables the Execution agent to produce rolling cash flow forecasts that give the project finance team and leadership the forward visibility needed to manage liquidity proactively, negotiate funding drawdown timing, optimize payment scheduling, and avoid the reputational and contractual damage that results from late payments.

## Intent & Specification
The AI agent MUST understand that:
1. Cash flow forecasts must be produced on a rolling basis with weekly granularity for the next 13 weeks (90 days) and monthly granularity for months 4-12, updated at minimum weekly with the latest transactional data.
2. The forecast must distinguish between cash outflows by category (contractor payments, material purchases, payroll, overheads, taxes, insurance, contingency) and cash inflows by source (client funding, milestone releases, retention releases, other income).
3. Payment timing must be modeled based on actual contractual payment terms, invoice processing cycle times, and bank payment run schedules — not simply assumed as a lag from cost recognition.
4. Foreign exchange exposure must be quantified for all non-reporting-currency cash flows, with sensitivity analysis showing the impact of defined FX rate movements on the net cash position.
5. The forecast must include a liquidity adequacy assessment — comparing the projected cash balance against a defined minimum balance threshold at each period, with early warning flags when the balance is projected to fall below the threshold.

## Trigger / Invocation
```
/forecast-cashflow
```
### Natural Language Triggers
- "Forecast cash flow for the project"
- "What is our 90-day cash position outlook"
- "Project the working capital requirements"
- "Proyeccion de flujo de caja del proyecto"
- "Cual es nuestra posicion de liquidez a 90 dias"
- "Proyectar los requerimientos de capital de trabajo"

## Input Requirements
### Required Inputs
| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| PO Commitment Pipeline | Active POs with expected delivery dates and payment terms | XLSX | manage-purchase-orders skill output |
| Invoice Payment Queue | Approved invoices awaiting payment with due dates and amounts | XLSX | manage-invoice-workflow skill output |
| Staffing Plan with Costs | Planned headcount ramp-up with monthly payroll projections | XLSX | Operations Agent — Staffing Plan |
| Project Funding Structure | Funding sources, drawdown conditions, milestone triggers, and limits | XLSX/PDF | Contracts & Compliance Agent or Client |

### Optional Inputs (Highly Recommended)
| Input | Description | Default |
|-------|-------------|---------|
| FX Rate Forecasts | Forward exchange rate projections for non-base currencies | Spot rates at forecast date used throughout |
| Bank Payment Calendar | Payment run dates and processing cut-offs | Weekly payment run on Fridays assumed |
| Contract Milestone Schedule | Upcoming contract milestones triggering payments or receipts | Extracted from PO and contract data |
| Historical Cash Flow Actuals | Previous 6+ months of actual cash flows for trend validation | No historical comparison performed |

### Context Enrichment
The agent should automatically:
- Pull the latest PO commitment data and delivery schedules from the manage-purchase-orders skill to project when committed spend will become payable
- Retrieve the current invoice payment queue from the manage-invoice-workflow skill to identify near-term payment obligations already in the pipeline
- Cross-reference the staffing ramp-up plan from the Operations agent to model the payroll cost step-ups at each headcount increase milestone
- Check the project funding structure for any upcoming milestone conditions that must be met to trigger funding releases, flagging risks to inflow timing
- Compare the projected cash position against the defined minimum balance threshold and the bank overdraft or credit facility limits

## Output Specification
### Document: Cash Flow Forecast Report
**Filename**: `VSC_CashFlowForecast_{ProjectCode}_{Version}_{Date}.xlsx`

**Structure**:
1. **Cash Flow Summary Dashboard** — Visual overview showing projected cash inflows, outflows, and net cash position over the 12-month forecast horizon, with a minimum balance threshold line, cumulative cash flow waterfall chart, and traffic-light liquidity status indicator
2. **Weekly Cash Flow Detail (Weeks 1-13)** — Week-by-week breakdown of projected cash inflows by source and outflows by category, with opening balance, net movement, and closing balance for each week
3. **Monthly Cash Flow Detail (Months 4-12)** — Monthly projections extending the forecast horizon beyond the 13-week detailed window, showing the same inflow/outflow categorization at monthly granularity
4. **Payment Schedule** — Detailed listing of all projected payment outflows with vendor, PO/invoice reference, amount, currency, payment due date, and projected payment date based on the payment run calendar
5. **FX Exposure Analysis** — Summary of cash flows by currency, net exposure position for each non-reporting currency, sensitivity analysis showing impact of +/-5% and +/-10% FX rate movements, and hedging recommendations where exposure exceeds defined thresholds
6. **Liquidity Risk Assessment** — Analysis of projected periods where the cash balance falls below the minimum threshold, quantification of the funding gap, and recommended actions (accelerate funding drawdown, defer non-critical payments, negotiate extended payment terms)
7. **Scenario Analysis** — Three cash flow scenarios (base case, optimistic, pessimistic) showing the range of possible outcomes based on key variable assumptions such as payment timing, FX rates, and funding release timing

### Key Metrics
| Metric | Description | Target |
|--------|-------------|--------|
| Forecast Accuracy | Variance between forecasted and actual weekly cash position | < 10% variance at 4-week horizon |
| Minimum Cash Balance | Lowest projected cash balance in the 13-week window | Above minimum threshold at all times |
| Days Cash on Hand | Projected cash balance divided by average daily outflow | > 30 days at all times |
| FX Exposure Ratio | Non-reporting-currency outflows as percentage of total outflows | Monitored; hedging recommended if > 20% |
| Payment Timeliness | Percentage of payments forecasted to be made within contractual terms | > 95% on-time payment forecast |

## Procedure

### Step 1: Establish Cash Flow Model Structure
- Define the cash flow model structure with the reporting currency, forecast horizon (13 weeks + 9 months), time granularity (weekly then monthly), and cash flow categories aligned with the project cost coding structure
- Map all cash inflow sources: client funding tranches with drawdown conditions and milestone triggers, retention releases with timing, interest income, and any other project revenue streams
- Map all cash outflow categories: contractor and vendor payments (from PO pipeline and invoice queue), payroll costs (from staffing plan), overhead costs (insurance, utilities, office), tax obligations, and contingency reserves
- Set the minimum cash balance threshold based on project policy (typically 2-4 weeks of average outflow) and confirm any credit facility or overdraft arrangements available as a liquidity backstop
- Establish the opening cash balance from the most recent bank reconciliation and verify it against the finance system cash account balance
- Define the FX rates to be used: spot rates for the base case, forward rates for the hedged portion (if applicable), and stress rates for the sensitivity analysis

### Step 2: Model Cash Outflows
- For committed POs awaiting delivery, estimate the payment date by applying the contractual payment terms to the expected delivery date, adding the invoice processing cycle time (from historical data or estimate), and aligning to the next payment run date
- For invoices already in the approval pipeline, project the payment date based on current approval status, estimated remaining approval time, and the next available payment run date
- For payroll costs, model the step-up pattern based on the staffing plan timeline, accounting for payroll processing dates and any statutory payment obligations (social security, tax withholding)
- For recurring overhead costs (insurance, leases, utilities, office services), model based on contract terms and known payment dates, adjusting for any known changes in the forecast period
- Model tax payment obligations: corporate income tax installments, VAT/GST remittances, payroll tax obligations, and any customs/import duties on materials
- For contingency drawdown, include only committed or highly probable contingency items (>80% probability) in the base case; include all quantified contingency items in the pessimistic scenario
- Apply a timing buffer for each outflow category based on historical payment performance data:
  - **Contractor payments**: Average 3-5 days after approval (depending on payment run frequency)
  - **Material payments**: Average 2-3 days after approval
  - **Payroll**: Fixed dates per payroll calendar (no variability)
  - **Overheads**: Per contract payment dates (typically monthly)

### Step 3: Model Cash Inflows
- Map each funding source to its drawdown conditions: milestone-based releases require confirmation that the triggering milestone will be achieved on schedule; time-based drawdowns require confirmation of administrative compliance
- Assess the risk to each inflow timing: for milestone-based funding, cross-reference with the project schedule status to determine if milestones are on track; for client-approval-dependent releases, factor in historical approval cycle times
- Model retention releases based on contract terms, typically tied to practical completion, defects liability period expiry, or specific project milestones, adjusting timing for any known delays
- Include any other income sources such as insurance recoveries, asset disposal proceeds, or inter-company transfers with their expected timing
- For each inflow, assign a confidence level:
  - **High confidence (>90%)**: Contractually committed, conditions met, administrative process initiated
  - **Medium confidence (60-90%)**: Conditions expected to be met on schedule, no known blockers
  - **Low confidence (<60%)**: Conditions at risk, known delays, or approval uncertainty
- Use the confidence levels to differentiate inflow timing between the base case (high + medium) and optimistic case (all) scenarios

### Step 4: Analyze FX Exposure and Scenarios
- Identify all cash flows denominated in non-reporting currencies, quantifying the gross exposure by currency and time period
- Apply current spot rates to calculate the reporting-currency equivalent of all foreign currency cash flows as the base case
- Perform sensitivity analysis: recalculate the cash position under +/-5% and +/-10% FX rate movements for each exposed currency, showing the impact on the net cash position and any periods where the minimum balance threshold would be breached
- For exposures exceeding the defined threshold (typically 20% of total outflows in a single foreign currency), develop hedging recommendations specifying the instrument type (forward contract, option), tenor, and notional amount
- Build three scenarios:
  - **Base case**: Current spot rates, on-schedule payment timing, high and medium confidence inflows included
  - **Optimistic**: Favorable FX movement (+5%), accelerated inflows, deferred non-critical outflows, all confidence-level inflows included
  - **Pessimistic**: Adverse FX movement (-10%), delayed inflows (add 2-4 weeks), accelerated outflows (early payment demands, penalty payments), only high-confidence inflows included
- Calculate the probability-weighted cash position by applying scenario probabilities (e.g., 20% optimistic, 60% base, 20% pessimistic)

### Step 5: Assess Liquidity and Report
- Calculate the projected cash balance at each period end (weekly for weeks 1-13, monthly for months 4-12) under all three scenarios
- Identify any periods where the base case or pessimistic scenario projects a cash balance below the minimum threshold, quantifying the funding gap in absolute terms and duration
- For each identified funding gap, calculate the required additional funding or payment deferral needed to maintain the minimum balance
- Develop recommended actions for each identified liquidity risk:
  - **Accelerate funding drawdown**: Submit funding request N weeks before the projected shortfall (N = client approval cycle time + processing time)
  - **Negotiate extended payment terms**: Identify specific vendors where payment term extension would have the highest liquidity impact with the lowest relationship risk
  - **Defer non-critical procurement**: Flag POs that can be delayed without impacting commissioning milestones or safety-critical activities
  - **Arrange credit facility**: If structural funding gap exists, recommend short-term credit facility with sizing based on pessimistic scenario
- Compile the complete Cash Flow Forecast Report with all dashboards, detail tables, FX analysis, scenario charts, and liquidity risk assessment
- Distribute the report to the project finance team and project manager, with an executive summary escalated to the project director if any liquidity risks are identified

## Failure Modes & Common Pitfalls

| Failure Mode | Root Cause | Prevention Strategy |
|-------------|-----------|-------------------|
| Cash shortfall not predicted | Outflows modeled but inflow timing overestimated | Conservative inflow timing assumptions; confidence-level classification for all inflows |
| FX loss erodes cash position | Unhedged currency exposure with adverse rate movement | Weekly FX exposure reporting; automatic hedging recommendation when threshold exceeded |
| Payroll payment missed | Cash allocated to vendor payments before payroll | Payroll ring-fenced as priority outflow; separate payroll cash reserve if needed |
| Forecast inaccurate beyond 4 weeks | Static assumptions not updated with new information | Weekly forecast refresh; rolling horizon that extends with each update |
| Funding milestone delayed | Schedule slip not reflected in inflow forecast | Weekly cross-reference with project schedule status; early warning trigger at 2 weeks before milestone |
| Payment run missed due to approval delay | Invoices approved after payment run cutoff | Pre-payment-run dashboard showing invoices at risk; expedited approval for high-priority payments |

## Escalation Protocols

| Trigger | Timeline | Escalation Path |
|---------|----------|----------------|
| Projected cash balance < minimum threshold within 4 weeks | Immediate | Project Manager and Finance Controller; funding request initiated |
| Projected cash balance < minimum threshold within 8 weeks | Within 48 hours | Project Director notified; action plan developed |
| Projected cash balance negative under pessimistic scenario | Within 5 business days | Executive notification; credit facility assessment initiated |
| FX exposure > 20% of total outflows in single currency | At detection | Treasury team notified; hedging recommendation prepared |
| Inflow confidence downgraded from High to Medium/Low | At detection | Project Manager review; alternative funding or deferral plan |
| Forecast accuracy > 15% variance at 4-week horizon | Monthly review | Forecast methodology audit; data source quality investigation |

## Cash Flow Category Structure

### Outflow Categories

| Category | Sub-Categories | Typical Share | Timing Characteristics |
|----------|---------------|---------------|----------------------|
| Contractor Payments | Progress claims, milestone payments, retention releases | 30-40% | Lumpy; driven by contract schedules and progress certification cycle |
| Material Purchases | Spare parts, consumables, chemicals, tools | 15-25% | Variable; peaks during commissioning and initial operations |
| Payroll | Base salary, allowances, social security, tax withholding | 25-35% | Regular; step-function increases as staff ramp-up milestones hit |
| Overheads | Insurance, utilities, leases, office costs, IT services | 5-10% | Stable; mostly fixed monthly amounts with annual renewals |
| Tax Obligations | Corporate tax installments, VAT remittances, customs duties | 3-8% | Periodic; quarterly or monthly depending on jurisdiction |
| Contingency Drawdown | Risk materialization payments, scope growth coverage | 0-5% | Irregular; unpredictable timing but quantifiable through risk register |

### Inflow Categories

| Category | Sub-Categories | Typical Share | Timing Characteristics |
|----------|---------------|---------------|----------------------|
| Client Funding | Drawdown tranches, milestone releases, cost reimbursements | 85-95% | Dependent on milestone achievement and client approval cycle |
| Retention Releases | Held retention from sub-contractors returned upon completion | 3-8% | Tied to practical completion and defects liability period |
| Other Income | Insurance recoveries, asset disposals, interest income | 1-5% | Irregular; event-driven with variable processing times |

## Definitions & Glossary

| Term | Definition |
|------|-----------|
| Cash Flow | The movement of money into and out of the project accounts over a defined time period |
| Net Cash Position | Cash inflows minus cash outflows for a given period; positive indicates surplus, negative indicates deficit |
| Minimum Cash Balance | The defined threshold below which the project cash balance should not fall to maintain payment capacity |
| Days Cash on Hand | The projected cash balance divided by the average daily outflow; measures how long current cash would last |
| FX Exposure | The financial risk arising from cash flows denominated in currencies other than the project's reporting currency |
| Hedging | Financial instruments (forwards, options) used to reduce or eliminate foreign exchange risk on known future cash flows |
| Liquidity Risk | The risk that the project cannot meet its payment obligations when they fall due due to insufficient cash |
| Working Capital | Current assets minus current liabilities; the net short-term financial resources available to the project |
| Payment Run | Scheduled batch processing of approved invoices through the banking system, typically weekly or bi-weekly |
| Drawdown Conditions | Contractual prerequisites that must be satisfied before project funding can be drawn from the client or lender |

## Implementation Considerations

### Cash Flow Model Design
- The model should be built in a layered structure: Layer 1 = known/committed cash flows (invoices approved, payroll scheduled), Layer 2 = highly probable cash flows (POs issued, milestones on track), Layer 3 = estimated cash flows (uncommitted budget, at-risk milestones)
- Each layer provides increasing uncertainty, and the total forecast should display the contribution from each layer to communicate confidence visually
- The model should support both "direct method" (individual transaction timing) for the 13-week window and "indirect method" (category-level phasing) for the monthly extension

### Multi-Currency Considerations
- Maintain separate cash flow projections for each currency before converting to reporting currency
- Record the FX rate used for each conversion to enable subsequent variance analysis (forecast rate vs actual rate)
- For projects with significant multi-currency exposure (>3 currencies), consider maintaining separate bank accounts by currency to reduce conversion costs and timing risk

### Working Capital Optimization
- Analyze the gap between average days payable (DPO) and any average days receivable (DSO, if applicable) to identify working capital efficiency opportunities
- Model the impact of early payment discounts offered by vendors against the cost of capital to determine if accelerated payment is financially beneficial
- Identify opportunities to align payment timing with funding inflow timing to minimize the cash balance trough

## Quality Criteria

| Dimension | Weight | Target | Measurement |
|-----------|--------|--------|-------------|
| Technical Accuracy | 30% | >95% accuracy | Cash flow calculations verified; FX conversions correct; payment term logic validated |
| Completeness | 25% | 100% coverage | All known cash inflows and outflows included; no material omissions; all currencies covered |
| Consistency | 15% | Zero conflicts | Outflow projections consistent with PO register, invoice queue, and staffing plan data |
| Format | 10% | Professional | VSC template with clear time-series charts, waterfall diagrams, and traffic-light indicators |
| Actionability | 10% | Immediately usable | Liquidity risks quantified with specific recommended actions and timing requirements |
| Traceability | 10% | Full audit trail | Every cash flow line traceable to source PO, invoice, contract, or staffing plan |

## Inter-Agent Dependencies

### Inputs From Other Agents
| Agent | Entity/Deliverable | Purpose |
|-------|-------------------|---------|
| Execution | PO commitment pipeline (via manage-purchase-orders) | Outflow projection from committed procurement |
| Execution | Invoice payment queue (via manage-invoice-workflow) | Near-term payment obligations already in pipeline |
| Operations | Staffing ramp-up plan with payroll projections | Labor cost outflow modeling |
| Contracts & Compliance | Contract payment terms and milestone schedules | Payment timing logic and inflow trigger conditions |
| Contracts & Compliance | Project funding structure and drawdown conditions | Cash inflow modeling and liquidity source identification |
| Orchestrator | Project milestone status and schedule forecast | Validation of milestone-based funding release timing |

### Outputs Consumed By
| Agent | Entity/Deliverable | Purpose |
|-------|-------------------|---------|
| Execution | Cash flow forecast for financial report (via generate-financial-reports) | Liquidity section of monthly and quarterly financial reports |
| Execution | Payment forecast for budget tracking (via track-budget-execution) | Cash-basis cost phasing for budget vs actual reporting |
| Contracts & Compliance | Funding drawdown schedule recommendations | Client communication and funding request timing |
| Orchestrator | Liquidity risk alerts | Executive escalation and governance forum reporting |
| Operations | Cash availability timeline for procurement decisions | Procurement timing decisions during operational ramp-up |

## References
- `methodology/or-playbook-and-procedures/` — OR procedures including financial planning and treasury management
- `methodology/capital-projects/` — Capital project cash management and funding frameworks
- `methodology/contract-tender-technical-specifications/` — Contract payment terms and funding structures
- IAS 7 — Statement of Cash Flows (reporting standards for cash flow presentation)
- AACE International Recommended Practice 48R-06 — Schedule and Cost Integration

## Changelog
| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-25 | Initial creation — Wave 2 |
