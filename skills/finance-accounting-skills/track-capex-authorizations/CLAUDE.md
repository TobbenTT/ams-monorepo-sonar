---
name: track-capex-authorizations
description: Track AFE approvals, CAPEX authorization workflows, investment justification compliance, and spend-vs-authorization variance for OR project capital expenditures
version: 1.0.0
category: C - Tracking
priority: Medium
agent: finance-accounting
tags: [CAPEX, AFE, authorization, investment-justification, capital-expenditure, spend-tracking, approval-workflow, governance]
triggers:
  - track capex authorizations
  - rastrear autorizaciones capex
  - seguimiento de AFE
  - capital expenditure tracking
inputs:
  - afe-register
  - capex-budget-baseline
  - actual-capex-spend
  - approval-workflow-records
outputs:
  - capex-authorization-tracker
  - spend-vs-authorization-report
  - afe-status-dashboard
  - authorization-compliance-report
---

# Skill: track-capex-authorizations

## Purpose

This skill provides end-to-end tracking and governance of Capital Expenditure (CAPEX) authorizations on Operational Readiness (OR) projects. In large industrial capital projects, CAPEX is governed through a formal Authorization for Expenditure (AFE) process that requires investment justification, multi-level approval, and ongoing spend monitoring against approved limits.

OR projects present unique CAPEX tracking challenges because they span the transition from project execution (primarily CAPEX) to steady-state operations (primarily OPEX). During this transition, expenditure classification decisions are frequent and consequential -- an incorrect CAPEX/OPEX classification can materially impact financial statements, tax positions, and project economics. This skill maintains a single source of truth for all CAPEX authorizations and their spend status.

The Finance Agent (AG-010) uses this skill to:
- Maintain the AFE register with current approval status and remaining authorization
- Monitor actual spend against authorized amounts, flagging overruns before they breach limits
- Track authorization workflow compliance (proper approvals per Delegation of Authority)
- Ensure investment justification documentation is complete and current
- Support CAPEX/OPEX boundary classification decisions with audit trail
- Provide CAPEX status data to the Execution Agent for project controls reporting

This skill is critical for financial governance, audit readiness, and corporate compliance. Unauthorized expenditure or exceeded authorizations represent serious governance failures that can result in project shutdowns, audit qualifications, or regulatory sanctions.

## Intent & Specification

### Intent Level: L2 (Full specification with references)

This skill executes on an ongoing basis throughout the project lifecycle, providing continuous tracking of CAPEX authorizations. It is invoked whenever new AFEs are created, approvals are processed, spend is incurred against authorizations, or status reporting is required.

### Specification Parameters

| Parameter | Description | Required | Default |
|-----------|-------------|----------|---------|
| `project_id` | Unique project identifier | Yes | -- |
| `action` | Action to perform (update_register, check_spend, status_report, classify_expenditure) | Yes | status_report |
| `afe_id` | Specific AFE identifier (for single-AFE actions) | Conditional | -- |
| `reporting_period` | Period for status reporting | No | Current month |
| `overrun_threshold_pct` | Percentage of authorization at which to trigger warning | No | 80% |
| `include_forecast` | Include forecasted spend against remaining authorization | No | true |
| `classification_item` | Expenditure item for CAPEX/OPEX classification assessment | Conditional | -- |
| `currency` | Reporting currency (ISO 4217) | No | USD |

### Preconditions
- AFE register exists (even if initially empty at project start)
- Delegation of Authority (DoA) matrix is defined for CAPEX approvals
- CAPEX budget baseline is approved
- Access to expenditure data from financial systems

## Trigger / Invocation

### English Triggers
- "Track CAPEX authorizations for project {project_id}"
- "What is the current AFE status?"
- "How much spend remains against AFE {afe_id}?"
- "Generate CAPEX authorization status report"
- "Is this expenditure CAPEX or OPEX?"
- "We need a new AFE for {description}"
- "Has AFE {afe_id} been approved?"
- "Which AFEs are approaching their authorized limit?"

### Spanish Triggers (Latin American)
- "Rastrear las autorizaciones CAPEX del proyecto {project_id}"
- "Cual es el estado actual de los AFE?"
- "Cuanto gasto queda disponible contra el AFE {afe_id}?"
- "Generar reporte de estado de autorizaciones CAPEX"
- "Este gasto es CAPEX u OPEX?"
- "Necesitamos un nuevo AFE para {descripcion}"
- "Se aprobo el AFE {afe_id}?"
- "Cuales AFE estan cerca de su limite autorizado?"
- "Dame el seguimiento de autorizaciones de capital del proyecto"
- "Revisar el cumplimiento de la matriz de aprobacion para gastos de capital"
- "Necesito el resumen de AFEs activos y su ejecucion"

### Programmatic Invocation
```python
# Status report
result = agent.execute_skill(
    skill="track-capex-authorizations",
    project_id="PRJ-001",
    action="status_report",
    reporting_period="2026-01",
    overrun_threshold_pct=80,
    include_forecast=True
)

# Classify expenditure
result = agent.execute_skill(
    skill="track-capex-authorizations",
    project_id="PRJ-001",
    action="classify_expenditure",
    classification_item={
        "description": "Control system software license",
        "amount": 250000,
        "useful_life_years": 5,
        "nature": "intangible_asset"
    }
)
```

## Input Requirements

### Required Inputs

| Input | Format | Source | Description |
|-------|--------|--------|-------------|
| AFE Register | XLSX/CSV/Database | Finance Agent / Project Controls | Master list of all AFEs with ID, description, authorized amount, approval status, dates |
| CAPEX Budget Baseline | XLSX/CSV | Execution Agent / Project Controls | Approved CAPEX budget by WBS element and category |
| Actual CAPEX Spend | ERP extract / XLSX | Finance systems (SAP, Oracle) | Actual expenditure posted against CAPEX codes/AFEs |
| Delegation of Authority Matrix | Document / Table | Corporate Governance | Approval limits by role, escalation requirements, signature requirements |
| Approval Workflow Records | ERP workflow / document log | Finance systems | Evidence of approval for each AFE and material expenditure |

### Optional Inputs

| Input | Format | Source | Description |
|-------|--------|--------|-------------|
| Investment Justification Documents | PDF/MD | Project team / Finance | Business cases, NPV/IRR calculations, payback analysis for each AFE |
| Commitment Register | XLSX/CSV | Contracts & Compliance Agent | Outstanding POs and contracts committed against AFEs |
| Change Order Log | XLSX/CSV | Execution Agent / Contracts | Approved changes impacting AFE scope or value |
| Capitalization Policy | Document | Corporate Finance / Accounting | Company policy for CAPEX/OPEX classification thresholds and criteria |
| Asset Register | XLSX/CSV | Asset Management Agent | Capitalized assets linked to AFEs |
| Tax Depreciation Schedules | XLSX | Tax department | Tax treatment of capital expenditures |
| Prior Period AFE Status Reports | PDF/MD | Finance Agent archive | Historical tracking for trend analysis |

### Data Quality Requirements
- AFE register must be current (updated within the last reporting period)
- Actual spend must reconcile to the General Ledger CAPEX accounts
- Approval records must include date, approver identity, and approval level
- Commitment data must include POs not yet invoiced (to show total exposure)

## Output Specification

### Primary Output: CAPEX Authorization Tracker and Status Report

```markdown
# CAPEX Authorization Status Report
## Project: {project_name} | Period: {reporting_period}

### 1. Executive Summary
- Total Authorized CAPEX: $X across N active AFEs
- Total Spent to Date: $Y (n% of authorized)
- Total Committed (POs outstanding): $Z
- Available Authorization: $W
- AFEs at warning threshold: N
- AFEs exceeded authorization: N
- Pending approval requests: N

### 2. AFE Register Summary

| AFE ID | Description | Authorized ($) | Spent ($) | Committed ($) | Available ($) | % Used | Status |
|--------|-------------|----------------|-----------|---------------|---------------|--------|--------|
| AFE-001 | Plant Equipment | 5,000K | 3,200K | 800K | 1,000K | 80% | WARNING |
| AFE-002 | Site Infrastructure | 2,500K | 1,100K | 400K | 1,000K | 60% | ACTIVE |
| ... | ... | ... | ... | ... | ... | ... | ... |

### 3. Spend vs Authorization Analysis
- 3.1 Overall CAPEX S-curve (authorized vs spent vs committed over time)
- 3.2 AFE-level spend profiles
- 3.3 Overrun risk assessment (AFEs trending toward overrun based on forecast)
- 3.4 Underutilized AFEs (significantly under-spent relative to schedule)

### 4. Authorization Compliance Assessment
- 4.1 Delegation of Authority Compliance
  - All approvals within delegated limits? (Y/N with exceptions)
  - Escalation requirements met? (Y/N with exceptions)
  - Split-order violations detected? (items split to avoid approval thresholds)
- 4.2 Investment Justification Completeness
  - All AFEs have approved business case? (Y/N with gaps)
  - Post-investment reviews completed where required? (Y/N)
- 4.3 Classification Compliance
  - CAPEX/OPEX classifications reviewed and consistent with policy?
  - Borderline items documented with rationale?

### 5. Warning and Exception Register

| AFE ID | Alert Type | Detail | Risk Level | Recommended Action |
|--------|-----------|--------|------------|-------------------|
| AFE-001 | Overrun Warning | 80% utilized, 6 months remaining | High | Request supplemental or re-scope |
| AFE-005 | Approval Gap | Missing VP approval for amount >$500K | Critical | Obtain retroactive approval immediately |
| ... | ... | ... | ... | ... |

### 6. Forecast and Projections
- Forecasted total CAPEX at completion (by AFE)
- Expected authorization shortfalls or surpluses
- Recommended actions (supplemental AFEs, re-allocations, scope adjustments)

### 7. CAPEX/OPEX Classification Log
- Items classified during the period
- Classification rationale and policy reference
- Auditor-ready documentation of borderline decisions

### 8. Appendices
- Detailed AFE transaction listing
- Approval evidence index
- Investment justification document register
```

### Output Format Requirements
- Status report as Markdown (.md) in `output/finance/capex/`
- AFE register data as CSV in `output/finance/capex/data/`
- Warning and exception register as standalone CSV for action tracking
- All monetary values in project currency with thousands separator

## Procedure

### Step 1: AFE Register Maintenance and Data Synchronization

1.1. Retrieve the current AFE register. If this is the first execution, initialize the register from project documentation (original AFE submissions, board approvals, project sanction documents).

1.2. Synchronize with source systems:
- Update authorized amounts to reflect any approved supplementals or re-allocations
- Add newly approved AFEs
- Close completed AFEs (all spend recorded, asset capitalized)
- Update approval status for pending AFEs

1.3. For each active AFE, record:
- AFE ID and description
- Original authorized amount
- Supplemental authorizations (if any)
- Total current authorized amount
- Approval date and approver(s)
- Associated WBS elements
- Expected completion date
- Asset category and useful life

1.4. Extract actual CAPEX spend from financial systems:
- Actual invoiced and paid amounts by AFE
- Accrued but not yet invoiced amounts
- Retentions held

1.5. Extract commitment data:
- Open purchase orders by AFE
- Contracts with remaining uncommitted value
- Change orders approved but not yet committed

1.6. Calculate for each AFE:
- Total exposure = Actual Spent + Committed + Accrued
- Available authorization = Authorized - Total Exposure
- Percentage utilized = Total Exposure / Authorized x 100

### Step 2: Spend vs Authorization Analysis and Forecasting

2.1. For each AFE, assess spend trajectory:
- Plot cumulative actual spend over time against authorization limit
- Calculate monthly burn rate (average of last 3 months)
- Forecast remaining spend based on:
  - Committed POs (known future spend)
  - Estimated remaining work (from Execution Agent schedule)
  - Historical burn rate extrapolation

2.2. Identify AFEs at risk of overrun:
- **Critical**: Current exposure > 95% of authorization
- **Warning**: Current exposure > overrun_threshold_pct (default 80%) of authorization
- **Watch**: Forecasted total exceeds authorization based on current trajectory
- **Underutilized**: Actual spend < 50% of pro-rata expected (potential re-allocation candidate)

2.3. For AFEs at risk of overrun, analyze the drivers:
- Scope changes not yet reflected in supplemental AFE
- Price escalation above budgeted rates
- Quantity overruns
- Schedule-driven cost increases
- Classification changes (items reclassified from OPEX to CAPEX)

2.4. Calculate overall CAPEX position:
- Total project CAPEX authorization vs total CAPEX budget baseline
- Aggregate forecast at completion vs total authorization
- Net surplus/deficit position

2.5. Generate S-curve data for authorized, spent, and committed amounts from project start to current period, with forecast to completion.

### Step 3: Authorization Compliance Verification

3.1. **Delegation of Authority (DoA) Compliance Check**:
- For each AFE approval, verify the approver had sufficient authority for the amount
- Check that multi-signature requirements were met (e.g., CFO + CEO for amounts > threshold)
- Identify any approvals that were processed outside the DoA framework
- Flag any retrospective approvals (spend incurred before formal approval)

3.2. **Split-Order Detection**:
- Analyze expenditure patterns to detect potential split-ordering (breaking a single purchase into multiple smaller purchases to stay below approval thresholds)
- Flag cases where multiple POs to the same vendor for similar items were issued within a short timeframe with individual values just below a threshold
- Document findings with supporting transaction data

3.3. **Investment Justification Review**:
- For each AFE above the company's business case threshold, verify that an investment justification document exists
- Check that the justification includes required elements (NPV, IRR, payback period, strategic alignment)
- Verify that post-investment review is scheduled for completed AFEs above the review threshold
- Flag any AFEs missing required justification documentation

3.4. **Expenditure Authorization Verification**:
- For material individual transactions (above sampling threshold), verify proper authorization exists
- Check that purchase requisition -> purchase order -> goods receipt -> invoice receipt workflow was followed
- Identify any emergency or retroactive authorizations and verify they have proper documentation

3.5. Document all compliance findings in the Warning and Exception Register with severity levels and recommended corrective actions.

### Step 4: CAPEX/OPEX Classification Management

4.1. Review all expenditure items flagged for CAPEX/OPEX classification during the period:
- Apply the corporate capitalization policy criteria:
  - Meets minimum capitalization threshold?
  - Creates or enhances a long-lived asset?
  - Has a useful life exceeding one reporting period?
  - Provides future economic benefits?

4.2. For borderline items, apply additional assessment criteria:
- **Component replacement**: Does the replacement extend life or enhance capacity (CAPEX) or merely restore function (OPEX)?
- **Software**: Is it a new system (CAPEX) or maintenance/subscription (OPEX)?
- **Consulting/studies**: Does it result in a tangible asset or decision (context-dependent)?
- **Training**: Is it initial training for new asset operation (potentially CAPEX) or ongoing skills maintenance (OPEX)?
- **Mobilization**: Is it for a new facility (CAPEX) or temporary project support (context-dependent)?

4.3. Document each classification decision with:
- Item description and amount
- Classification decision (CAPEX or OPEX)
- Policy reference supporting the decision
- Rationale for borderline items
- Impact on project financials (if reclassified from original assumption)
- Reviewer/approver of the classification

4.4. Maintain a running CAPEX/OPEX classification log as part of the audit trail. This log is a key input to the `prepare-audit-package` skill.

4.5. If a classification decision materially changes the CAPEX forecast, notify the Execution Agent for project controls update and the Orchestrator for governance awareness.

### Step 5: Reporting, Alerting, and State Update

5.1. Compile the CAPEX Authorization Status Report following the output specification structure.

5.2. Generate alerts for critical and warning items:
- **Critical alerts** (immediate action required):
  - AFE authorization exceeded
  - Expenditure without proper authorization
  - Missing mandatory approvals
- **Warning alerts** (action required within reporting period):
  - AFE approaching threshold
  - Compliance gaps identified
  - Classification disputes unresolved

5.3. Prepare recommended actions for each alert:
- Supplemental AFE request (with estimated amount and justification outline)
- Re-allocation between AFEs (identify surplus and deficit AFEs)
- Scope reduction or deferral options
- Retrospective authorization processing
- DoA training or process improvement

5.4. Distribute the status report:
- Orchestrator (AG-001): Executive summary and critical alerts for governance
- Execution Agent (AG-006): Detailed AFE status for project controls integration
- Contracts & Compliance (AG-005): Compliance findings for remediation
- Asset Management (AG-003): Capitalized asset register updates

5.5. Update the AFE register as the system of record for all CAPEX authorization data.

5.6. Update Finance Agent state with:
- Current AFE register snapshot
- Open alerts and their status
- CAPEX forecast at completion
- Compliance assessment summary
- Classification decisions made during the period

## Quality Criteria

| Criterion | Weight | Target | Measurement Method |
|-----------|--------|--------|-------------------|
| Technical Accuracy | 30% | AFE balances reconcile to source systems; calculations verified; classifications per policy | Reconciliation to ERP; formula audit; policy compliance check |
| Completeness | 25% | All active AFEs tracked; all compliance checks performed; all classifications documented | AFE count verification; compliance checklist coverage; classification log completeness |
| Consistency | 15% | Figures match between register, status report, and source systems; terminology aligned with corporate standards | Cross-reference audit; terminology review against corporate DoA and finance policies |
| Format | 10% | Professional report with clear status indicators; dashboard-ready summary; VSC branding | Template compliance; visual clarity assessment; color-coding consistency |
| Actionability | 10% | Every alert has recommended action; supplemental requests include justification outline; compliance gaps have remediation steps | Action register completeness; SMART criteria assessment for recommendations |
| Traceability | 10% | Every AFE linked to approval evidence; every classification linked to policy reference; every alert linked to source data | Evidence index audit; policy reference verification; source data linkage check |
| **Total** | **100%** | **Composite score >= 91%** | **Weighted average of all criteria** |

## Inter-Agent Dependencies

### Dependencies FROM other agents (inputs needed)

| Agent | Agent ID | Information Required | Timing |
|-------|----------|---------------------|--------|
| Execution | AG-006 | CAPEX budget baseline, WBS structure, schedule for spend forecasting, change order log | At initialization; ongoing as changes occur |
| Contracts & Compliance | AG-005 | Contract and PO register, commitment data, change orders, DoA compliance framework | Ongoing; period-end reconciliation |
| Asset Management | AG-003 | Asset register updates (capitalized items from AFEs), equipment procurement data | As assets are capitalized |
| Operations | AG-002 | Operating expenditure data (for CAPEX/OPEX boundary classification) | As classification questions arise |
| HSE | AG-004 | Safety-related capital expenditure (safety systems, environmental controls) | As AFEs are created for HSE items |
| Orchestrator | AG-001 | Corporate DoA matrix, governance requirements, gate review CAPEX requirements | At initialization; as governance updates occur |

### Dependencies TO other agents (outputs provided)

| Agent | Agent ID | Information Provided | Purpose |
|-------|----------|---------------------|---------|
| Orchestrator | AG-001 | CAPEX status summary, critical alerts, authorization compliance assessment | Executive governance, gate review input, board reporting |
| Execution | AG-006 | AFE status by WBS, spend forecast, authorization availability | Project controls, cost reporting, forecast updates |
| Contracts & Compliance | AG-005 | DoA compliance findings, unauthorized expenditure alerts | Compliance remediation, contract governance |
| Asset Management | AG-003 | Capitalization confirmations, asset cost data from closed AFEs | Asset register maintenance, depreciation scheduling |

### Finance Agent (AG-010) Internal Coordination
- This skill provides authorized budget data to `analyze-cost-variance` for variance analysis
- This skill provides authorization and classification documentation to `prepare-audit-package`
- This skill provides CAPEX baseline and authorization data to `model-financial-scenarios` for investment scenario modeling
- CAPEX forecast updates from this skill may trigger re-execution of `model-financial-scenarios` for revised projections

## References

- **IAS 16**: Property, Plant and Equipment (capitalization criteria)
- **IAS 38**: Intangible Assets (software and intangible capitalization)
- **IFRS 16**: Leases (lease vs buy classification)
- **AACE International Recommended Practice 10S-90**: Cost Engineering Terminology
- **AACE RP 18R-97**: Cost Estimate Classification System
- **PMI PMBOK Guide** (7th Edition): Project Cost Management
- **COSO Internal Control Framework** (2013): Authorization and approval controls
- **VSC OR Knowledge Base v2.0**: Section on CAPEX Management and Financial Governance
- **VSC Quality Assurance Framework**: Deliverable scoring methodology (6 dimensions)
- **ISO 55010:2019**: Asset Management - Guidance on alignment of financial and non-financial functions
- **Corporate Governance Codes**: Applicable codes for Delegation of Authority frameworks (King IV, ASX, NYSE listing rules as applicable)

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-25 | VSC OR System | Initial skill creation for Finance & Accounting agent domain |
