---
name: manage-fixed-assets
description: "Track fixed asset register including acquisitions, depreciation, valuations, transfers, and disposals. Triggers: 'fixed assets', 'asset register', 'depreciation', 'asset disposal', 'capitalization'."
version: 1.0.0
category: D - Monitoring
priority: High
agent: finance-accounting
tags: [fixed-assets, depreciation, capitalization, asset-register, IAS-16, IFRS, NBV, asset-disposal, componentization, CAPEX-to-OPEX]
triggers:
  - manage fixed assets
  - fixed asset register
  - depreciation schedule
  - asset capitalization
  - gestionar activos fijos
  - registro de activos fijos
  - depreciacion de activos
  - capitalizacion de activos
  - baja de activos
inputs:
  - capital-project-handover-documentation
  - asset-capitalization-policy
  - physical-asset-register
  - depreciation-method-schedule
  - asset-movement-requests
outputs:
  - fixed-asset-register-report
  - depreciation-schedule
  - asset-movement-log
  - net-book-value-reconciliation
  - asset-disposal-documentation
---

# Skill: manage-fixed-assets

## Purpose

This skill maintains the fixed asset register and manages the complete financial lifecycle of capital assets -- from initial acquisition and capitalization through periodic depreciation, revaluation, inter-entity transfers, and ultimate disposal or retirement. In Operational Readiness (OR) projects, fixed asset management is the critical bridge between capital project execution (CAPEX) and ongoing operational expenditure (OPEX), ensuring that every asset constructed or procured during the project phase is correctly recognized, measured, and tracked in the financial books of record.

Fixed asset management is particularly significant during the OR phase because this is when large volumes of assets transition from "under construction" (AUC) status to operational fixed assets. A mining concentrator plant, a gas processing facility, or a chemical production line may involve thousands of individual asset records that must be capitalized, componentized per IAS 16.43-47, assigned useful lives, and placed into service within a compressed timeframe. Errors during this transition -- incorrect capitalization, wrong useful life estimates, missing componentization -- cascade into years of incorrect depreciation and distorted financial reporting.

The Finance Agent (AG-010) uses this skill to ensure that asset values in the general ledger reconcile to the physical asset register maintained by the Asset Management Agent (AG-003), that depreciation is calculated in accordance with the applicable accounting standards (IFRS/NIIF Chile or local GAAP), and that asset movements (transfers between cost centers, projects, or legal entities) are properly documented with supporting evidence. The skill also manages the intersection with Chilean tax requirements administered by the Servicio de Impuestos Internos (SII), including tax depreciation schedules that may differ from financial depreciation.

The fundamental challenge addressed by this skill is the reconciliation of three parallel registers: the physical asset register (maintained by engineering and operations teams), the financial asset register (maintained by finance in the ERP), and the tax asset register (maintained for SII compliance). Discrepancies between these registers are common in large OR projects and, if unresolved, lead to audit findings, tax penalties, and impaired decision-making on asset lifecycle investments.

## Intent & Specification

### Intent Level: L2 (Full specification with references)

This skill executes when the project requires creation, update, or reconciliation of the fixed asset register, processing of asset capitalizations from completed construction work, calculation and posting of periodic depreciation, management of asset transfers or disposals, or preparation of net book value reconciliation reports. It operates continuously throughout the OR project lifecycle and becomes most active during asset handover from construction to operations.

### Specification Parameters

| Parameter | Description | Required | Default |
|-----------|-------------|----------|---------|
| `project_id` | Unique project identifier | Yes | -- |
| `asset_class` | Asset classification (buildings, plant-equipment, vehicles, IT-systems, land, AUC) | Yes | -- |
| `reporting_period` | Financial period for depreciation and reporting (YYYY-MM) | Yes | -- |
| `depreciation_method` | Method to apply (straight-line, declining-balance, units-of-production) | No | Per asset class policy |
| `capitalization_threshold` | Minimum value for capitalization (USD or CLP) | No | Per corporate policy |
| `accounting_standard` | Applicable standard (IFRS, NIIF-Chile, US-GAAP, local-GAAP) | No | NIIF Chile |
| `componentization_level` | Depth of component breakdown per IAS 16.43-47 | No | Per asset class policy |
| `tax_jurisdiction` | Tax authority for tax depreciation (SII-Chile, SAT-Mexico, SUNAT-Peru) | No | SII-Chile |

### Preconditions
- Asset capitalization policy is approved and available for the project
- Capital project cost records and handover documentation are accessible
- Physical asset register from Asset Management Agent is current
- ERP fixed asset module (SAP FI-AA or equivalent) is configured with asset classes and depreciation areas
- Useful life table by asset class is approved by corporate finance
- Prior period fixed asset register is available for opening balance reconciliation

## Trigger / Invocation

### English Triggers
- "Capitalize the completed assets from project {project_id}"
- "Run the depreciation schedule for period {reporting_period}"
- "Reconcile the fixed asset register with the physical asset count"
- "Process the asset disposal for equipment {asset_tag}"
- "Transfer assets from construction cost center to operations"
- "Prepare the net book value report for the asset class {asset_class}"

### Spanish Triggers (Latin American)
- "Capitalizar los activos terminados del proyecto {project_id}"
- "Ejecutar el calculo de depreciacion para el periodo {reporting_period}"
- "Conciliar el registro de activos fijos con el inventario fisico"
- "Procesar la baja del equipo {asset_tag}"
- "Transferir activos del centro de costo de construccion a operaciones"
- "Preparar el informe de valor neto en libros por clase de activo"
- "Revisar la componentizacion de los activos de planta"
- "Generar el cuadro de depreciacion tributaria para el SII"

### Programmatic Invocation
```python
result = agent.execute_skill(
    skill="manage-fixed-assets",
    project_id="PRJ-001",
    asset_class="plant-equipment",
    reporting_period="2026-02",
    depreciation_method="straight-line",
    capitalization_threshold=500000,
    accounting_standard="NIIF-Chile",
    componentization_level="major-components",
    tax_jurisdiction="SII-Chile"
)
```

## Input Requirements

### Required Inputs

| Input | Format | Source | Description |
|-------|--------|--------|-------------|
| Capital Project Handover Package | Document bundle (MD/PDF/XLSX) | Execution Agent (AG-006) | Asset completion certificates, cost allocation reports, commissioning records |
| Asset Capitalization Policy | Document (MD/PDF) | Corporate Finance / Project Controls | Capitalization thresholds, componentization rules, useful life tables by asset class |
| Physical Asset Register | XLSX/CSV | Asset Management Agent (AG-003) | Asset tags, locations, technical specifications, condition data, hierarchy |
| General Ledger AUC Balances | ERP extract / XLSX | Finance systems (SAP FI-AA) | Assets-under-construction account balances pending capitalization |
| Depreciation Parameter Table | XLSX/CSV | Corporate Finance | Useful life ranges, residual value percentages, depreciation methods by asset class |
| Asset Movement Requests | Form/Workflow output | Operations / Project Management | Transfer requests, disposal approvals, write-off authorizations |

### Optional Inputs

| Input | Format | Source | Description |
|-------|--------|--------|-------------|
| Independent Valuation Reports | PDF | External valuers | Fair value assessments for revaluation model assets |
| Insurance Valuation Schedule | XLSX/PDF | Risk Management | Replacement cost valuations for insurance coverage |
| Tax Depreciation Rates | Regulatory table / PDF | SII / Tax department | Statutory useful lives and accelerated depreciation allowances per Chilean tax law |
| Impairment Indicator Reports | MD/PDF | Asset Management Agent (AG-003) | Condition deterioration, technology obsolescence, market value declines |
| Lease Classification Assessment | MD/XLSX | Contracts & Compliance Agent (AG-005) | IFRS 16 right-of-use asset determinations |
| Prior Period Fixed Asset Register | XLSX/CSV | Finance systems | Opening balances, brought-forward depreciation, prior period adjustments |
| Intercompany Transfer Agreements | PDF | Legal / Contracts | Transfer pricing documentation for cross-entity asset movements |

### Data Quality Requirements
- All asset cost data must be sourced from the official project cost report or ERP system, not from working estimates
- Physical asset tags must match between the engineering register and the financial register (validated through tag reconciliation)
- Useful life estimates must be within the ranges approved by corporate finance for each asset class
- Depreciation calculations must be reproducible from the stated parameters (method, useful life, residual value, in-service date)
- Asset movement documentation must include proper authorization evidence (approvals per Delegation of Authority)

## Output Specification

### Primary Output: Fixed Asset Register Report

The report is organized as follows:

```markdown
# Fixed Asset Register Report
## Project: {project_name} | Period: {reporting_period} | Standard: {accounting_standard}

### 1. Executive Summary
- Total asset base: gross value, accumulated depreciation, net book value
- Period movements summary: additions, disposals, transfers, revaluations
- Key ratios: average age, depreciation coverage, AUC aging
- Issues and action items requiring management attention

### 2. Asset Register Detail by Class
- 2.1 Land and Site Improvements
- 2.2 Buildings and Structures
- 2.3 Plant and Major Equipment
- 2.4 Mobile Equipment and Vehicles
- 2.5 IT Systems and Infrastructure
- 2.6 Assets Under Construction (AUC)
- For each class: asset tag, description, location, in-service date,
  gross value, accumulated depreciation, NBV, useful life remaining

### 3. Asset Movements Schedule
- 3.1 Additions (new capitalizations from AUC and direct acquisitions)
- 3.2 Disposals and Retirements (with gain/loss calculation)
- 3.3 Transfers (between cost centers, projects, legal entities)
- 3.4 Revaluations and Impairments
- 3.5 Movement Reconciliation (opening + movements = closing)

### 4. Depreciation Schedule
- 4.1 Depreciation by Asset Class (method, rate, period charge)
- 4.2 Depreciation by Cost Center / Operational Area
- 4.3 Componentized Depreciation Detail (IAS 16.43-47)
- 4.4 Tax Depreciation Reconciliation (financial vs. tax basis)
- 4.5 Deferred Tax Impact from Temporary Differences

### 5. Net Book Value Reconciliation
- 5.1 Opening NBV by asset class
- 5.2 Plus: Additions capitalized in period
- 5.3 Less: Depreciation charge for period
- 5.4 Less: Disposals (NBV at disposal date)
- 5.5 Plus/Less: Revaluations and impairments
- 5.6 Plus/Less: Foreign currency translation adjustments
- 5.7 Closing NBV by asset class
- 5.8 Reconciliation to General Ledger control accounts

### 6. AUC Aging and Capitalization Pipeline
- Assets under construction by project phase
- Expected capitalization dates and amounts
- AUC items exceeding policy aging thresholds (flagged)

### 7. Physical-to-Financial Reconciliation
- Results of physical verification vs. financial register
- Discrepancies identified with root cause analysis
- Remediation actions and responsible parties

### 8. Compliance and Regulatory Notes
- Chilean SII tax depreciation compliance status
- NIIF Chile / IFRS disclosure requirements addressed
- Componentization compliance per IAS 16.43-47
- Impairment review status per IAS 36
```

### Output Format Requirements
- Master report as structured Markdown in `output/finance/fixed-assets/`
- Detailed register as XLSX with filterable columns for auditor use
- Depreciation schedule as both Markdown summary and XLSX detail
- All documents named following convention: `{project_id}-FA-{seq}-{description}`
- Period-stamped to maintain historical register integrity

## Procedure

### Step 1: Asset Capitalization Policy and Register Setup

1.1. Retrieve and validate the project asset capitalization policy. Confirm minimum capitalization thresholds (e.g., USD 5,000 or CLP 4,000,000), componentization requirements per IAS 16.43-47, and the approved useful life table by asset class.

1.2. Verify that the ERP fixed asset module is correctly configured with the required asset classes, depreciation areas (financial reporting, tax reporting, management reporting), and posting rules. Confirm chart of depreciation alignment with corporate policy.

1.3. Obtain the opening fixed asset register (prior period closing balances). Validate opening balances by reconciling to the prior period General Ledger fixed asset control accounts. Investigate and resolve any discrepancies before processing current period transactions.

1.4. Retrieve the current physical asset register from the Asset Management Agent (AG-003). Perform an initial tag-level reconciliation between physical and financial registers, flagging assets present in one register but not the other.

1.5. Establish the componentization framework for major asset classes. For complex assets (e.g., a concentrator mill, a boiler system, a process train), identify the significant components that require separate depreciation per IAS 16.43-47 based on differing useful lives.

1.6. Document any policy exceptions or project-specific accounting treatments approved by corporate finance (e.g., accelerated depreciation for assets in harsh environments, revaluation model elections).

### Step 2: Asset Acquisition Recording and Capitalization

2.1. Retrieve capital project handover documentation from the Execution Agent (AG-006). This includes asset completion certificates, final cost allocations, and commissioning acceptance records.

2.2. For each asset to be capitalized, determine the total cost of the asset per IAS 16.16-22, including: purchase price (net of trade discounts), directly attributable costs to bring the asset to working condition (installation, testing, professional fees), and initial estimate of dismantling/restoration costs (IAS 16.16(c)).

2.3. Apply componentization rules to major assets. Decompose each complex asset into its significant components, allocating total cost proportionally based on engineering estimates or supplier cost breakdowns. Each component receives its own useful life and depreciation schedule.

2.4. Validate that each capitalization meets the recognition criteria of IAS 16.7: (a) it is probable that future economic benefits will flow to the entity, and (b) the cost can be measured reliably. Items failing these criteria are expensed.

2.5. Determine the in-service date for each asset (the date the asset is available for use as intended by management per IAS 16.55). Depreciation commences from this date. For OR projects, this is typically the date of mechanical completion acceptance or commissioning sign-off.

2.6. Record the capitalization entries in the ERP: debit the appropriate fixed asset class account, credit the AUC account. Verify that the AUC balance reduces by the capitalized amount and that no orphan balances remain.

2.7. Assign each capitalized asset a unique financial asset number linked to the physical asset tag from the engineering register. Record the cross-reference in both registers.

### Step 3: Depreciation Calculation and Posting

3.1. For each asset in service, retrieve the depreciation parameters: method (straight-line, declining balance, or units-of-production), useful life, residual value, and in-service date. These parameters must align with the approved depreciation parameter table.

3.2. Calculate the period depreciation charge using the applicable method:
- **Straight-line**: (Cost - Residual Value) / Useful Life in periods
- **Declining balance**: NBV at period start x Depreciation rate
- **Units-of-production**: (Cost - Residual Value) x (Actual output / Total estimated output)

3.3. For componentized assets, calculate depreciation separately for each component. The sum of component depreciation equals the total asset depreciation. Verify that no component has a useful life exceeding the overall asset useful life.

3.4. Apply pro-rata rules for assets capitalized or disposed of mid-period. Follow corporate policy (typically depreciation begins in the month of in-service or the following month, and ceases in the month of disposal).

3.5. Calculate tax depreciation in parallel using SII-prescribed useful lives and methods. The standard Chilean normal depreciation follows straight-line based on SII Circular tables. Identify temporary differences between financial and tax depreciation for deferred tax calculation.

3.6. Post depreciation entries: debit depreciation expense (by cost center/operational area), credit accumulated depreciation. Verify postings reconcile to the depreciation schedule.

3.7. Review useful life estimates and residual values at each reporting date per IAS 16.51. If expectations differ from prior estimates, adjust prospectively and document the rationale for the change in estimate per IAS 8.

3.8. Screen for impairment indicators per IAS 36. If indicators exist (significant decline in asset performance, market value decline, adverse regulatory changes, physical damage), flag the asset for impairment testing and coordinate with Asset Management Agent (AG-003) for value-in-use or fair-value-less-costs-of-disposal calculations.

### Step 4: Asset Movements, Transfers, and Disposals

4.1. Process asset transfers between cost centers, departments, or operational areas. Verify that transfer requests are properly authorized and that the receiving cost center accepts the asset. Update the register to reflect the new location, cost center, and responsible custodian.

4.2. Process intercompany or inter-entity asset transfers. These require transfer pricing documentation, tax clearance, and potentially customs documentation for cross-border transfers. Coordinate with Contracts & Compliance Agent (AG-005) for tax implications.

4.3. Process asset disposals (sales, scrapping, abandonment):
- Cease depreciation as of the disposal date
- Calculate gain or loss on disposal: Proceeds - NBV at disposal date
- Record the disposal entry: debit cash/receivable (if sold), debit accumulated depreciation, credit asset cost, and credit/debit gain/loss on disposal
- Obtain disposal authorization evidence per Delegation of Authority

4.4. Process asset write-downs and impairments:
- Record impairment loss per IAS 36 (debit impairment loss, credit accumulated impairment or directly reduce asset value)
- Verify impairment loss does not reduce carrying amount below recoverable amount
- Document the basis for recoverable amount (higher of fair value less costs of disposal, and value in use)

4.5. Maintain the asset movement log with full audit trail: date, movement type, authorization reference, financial impact, and updated register entries.

4.6. For assets under IFRS 16 lease arrangements, coordinate with Contracts & Compliance Agent (AG-005) to ensure right-of-use assets are correctly measured, depreciated over the lease term, and remeasured upon lease modifications.

### Step 5: Reconciliation, Reporting, and Period Close

5.1. Perform the net book value reconciliation: Opening NBV + Additions - Depreciation - Disposals +/- Revaluations +/- Impairments +/- FX adjustments = Closing NBV. This reconciliation must balance to within acceptable rounding tolerance.

5.2. Reconcile the fixed asset sub-ledger to the General Ledger control accounts. For each asset class, the sub-ledger gross value and accumulated depreciation must match the corresponding GL account balances. Investigate and resolve any discrepancies.

5.3. Reconcile the financial asset register to the physical asset register. For OR projects, coordinate the annual physical verification with Asset Management Agent (AG-003). Document all discrepancies with root cause analysis: missing assets, ghost assets (in books but not physically present), unrecorded assets.

5.4. Prepare the AUC aging analysis. Flag any AUC items exceeding the policy aging threshold (typically 12-18 months without capitalization or clear justification). AUC aging is a common audit focus area.

5.5. Generate the depreciation schedule for the period, including both financial and tax depreciation, and calculate temporary differences for deferred tax disclosure.

5.6. Compile the complete Fixed Asset Register Report per the output specification. Include all sections from the executive summary through compliance notes.

5.7. Submit the report to the Orchestrator Agent (AG-001) for inclusion in the project financial reporting package. Provide the asset register data to Asset Management Agent (AG-003) for lifecycle cost analysis and replacement planning.

5.8. Update Finance Agent (AG-010) state with: register closing balances, open reconciliation items, pending capitalizations, impairment flags, and any policy exception items requiring management decision.

## Quality Criteria

| Criterion | Weight | Target | Measurement Method |
|-----------|--------|--------|-------------------|
| Technical Accuracy | 30% | Depreciation calculations verifiable from stated parameters; NBV reconciliation balances to GL; componentization complies with IAS 16.43-47 | Recalculation of depreciation samples; GL reconciliation tie-out; componentization audit |
| Completeness | 25% | All asset classes covered; all movements recorded; AUC aging complete; physical reconciliation performed | Asset class coverage check; movement completeness vs. source documents |
| Consistency | 15% | Figures consistent between register detail, summary, and GL; depreciation methods consistent within asset classes | Cross-section reconciliation; method consistency verification |
| Format | 10% | Professional report structure; clear tables; VSC branding; proper period stamping | Template compliance review; readability assessment |
| Actionability | 10% | Discrepancies have root cause and remediation plan; impairment flags have clear next steps; AUC aging items have resolution timeline | Action item completeness; management decision readiness |
| Traceability | 10% | Every asset links to source document (handover certificate, PO, invoice); every movement links to authorization | Source reference audit; authorization evidence verification |
| **Total** | **100%** | **Composite score >= 91%** | **Weighted average of all criteria** |

## Inter-Agent Dependencies

### Dependencies FROM other agents (inputs needed)

| Agent | Agent ID | Information Required | Timing |
|-------|----------|---------------------|--------|
| Asset Management | AG-003 | Physical asset register, condition assessments, asset hierarchy, technical specifications | At capitalization, quarterly reconciliation, annual physical count |
| Execution | AG-006 | Capital project completion certificates, final cost allocations, commissioning records, AUC cost detail | At project milestone completion and asset handover |
| Contracts & Compliance | AG-005 | Lease vs. buy classifications (IFRS 16), intercompany transfer agreements, disposal regulatory requirements | At acquisition, transfer, and disposal events |
| Orchestrator | AG-001 | Project governance parameters, reporting calendar, Delegation of Authority matrix | At project setup and ongoing per reporting cycle |
| Operations | AG-002 | Operational area cost center structure, asset custodian assignments, production data (for units-of-production depreciation) | At capitalization and each depreciation period |

### Dependencies TO other agents (outputs provided)

| Agent | Agent ID | Information Provided | Purpose |
|-------|----------|---------------------|---------|
| Orchestrator | AG-001 | Fixed asset summary, NBV reconciliation, depreciation charge by period | Financial reporting package, management dashboard |
| Asset Management | AG-003 | Financial asset values, NBV by asset, remaining useful life, impairment status | Lifecycle cost analysis, replacement planning, insurance valuations |
| Contracts & Compliance | AG-005 | Asset disposal documentation, gain/loss calculations, tax depreciation data | Regulatory compliance, tax filings, disposal authorization records |
| Execution | AG-006 | AUC aging report, capitalization status of project assets | Project close-out, capital budget reconciliation |

### Finance Agent (AG-010) Internal Coordination
- This skill feeds depreciation expense data into `model-opex-budget` for operational cost forecasting
- This skill consumes capital expenditure authorization data from `track-capex-authorizations` to validate capitalization entries
- This skill provides asset register data to `prepare-audit-package` as key audit evidence
- Disposal gain/loss results flow into `analyze-cost-variance` for period performance analysis

## References

- **IAS 16**: Property, Plant and Equipment -- recognition, measurement, componentization (IAS 16.43-47), depreciation, derecognition
- **IAS 36**: Impairment of Assets -- indicators, recoverable amount, impairment loss recognition and reversal
- **IAS 8**: Accounting Policies, Changes in Estimates and Errors -- prospective treatment of useful life revisions
- **IFRS 16**: Leases -- right-of-use asset recognition, measurement, and depreciation
- **ISO 55000:2014**: Asset Management -- alignment of financial and physical asset management frameworks
- **ISO 55010:2019**: Asset Management -- Guidance on alignment of financial and non-financial functions
- **NIIF Chile (Chilean IFRS)**: Local adoption of IFRS standards as mandated by the Comision para el Mercado Financiero (CMF)
- **SII Circular on Fixed Asset Depreciation**: Servicio de Impuestos Internos -- statutory useful lives and accelerated depreciation provisions for Chilean tax purposes
- **VSC OR Knowledge Base v2.0**: Section on CAPEX-to-OPEX transition and financial handover during Operational Readiness
- **VSC Quality Assurance Framework**: Deliverable scoring methodology (6 dimensions, target >= 91%)
- **SAP FI-AA Configuration Guide**: Fixed asset module setup, depreciation areas, asset class configuration

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-25 | VSC OR System | Initial skill creation for Finance & Accounting agent domain |
