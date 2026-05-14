---
name: generate-tax-compliance-reports
description: "Produce tax compliance documentation and reporting packages including VAT, withholding tax, and statutory filings. Triggers: 'tax compliance', 'tax report', 'VAT filing', 'withholding tax', 'statutory tax'."
version: 1.0.0
category: A - Document Generation
priority: High
agent: finance-accounting
tags: [tax-compliance, VAT, IVA, withholding-tax, statutory-filings, SII, customs-duties, transfer-pricing, tax-calendar]
triggers:
  - generate tax compliance report
  - tax compliance package
  - VAT filing report
  - withholding tax report
  - generar reporte de cumplimiento tributario
  - declaracion de IVA
  - reporte de retencion de impuestos
  - informe tributario del proyecto
inputs:
  - project-financial-records
  - vendor-payment-register
  - contract-register
  - import-customs-records
  - tax-calendar-jurisdictional
outputs:
  - tax-compliance-report-package
  - vat-return-workpapers
  - withholding-tax-certificates
  - customs-duty-reconciliation
  - tax-filing-calendar
---

# Skill: generate-tax-compliance-reports

## Purpose

This skill produces comprehensive tax compliance documentation and reporting packages for Operational Readiness (OR) projects. In large industrial capital projects -- particularly in mining, oil & gas, chemicals, and energy -- tax obligations span multiple types (VAT/IVA, withholding tax, corporate income tax provisions, customs duties on imported equipment) and frequently cross jurisdictional boundaries. Failure to comply with tax filing deadlines and reporting requirements results in penalties, interest charges, and reputational risk that are rarely budgeted and can jeopardize project economics.

The skill addresses the specific tax compliance challenges encountered in Latin American OR projects, with particular attention to Chilean tax law administered by the Servicio de Impuestos Internos (SII), including IVA (Impuesto al Valor Agregado) calculations, withholding tax on payments to foreign vendors, and customs duties on imported capital equipment. It also handles multi-jurisdictional scenarios where projects involve parent companies, subsidiaries, and subcontractors across different tax regimes, requiring transfer pricing documentation and treaty benefit claims.

The Finance Agent (AG-010) uses this skill to systematically calculate tax obligations, prepare filing workpapers, generate withholding tax certificates, reconcile input tax credits, and produce a comprehensive tax compliance package that serves both as filing support and as audit evidence. The skill enforces proactive tax calendar management, ensuring that filing deadlines are identified, tracked, and met without exception.

By automating the collection, classification, and calculation of tax-relevant transactions, this skill reduces the effort required for monthly, quarterly, and annual tax compliance from days of manual work to hours of review and validation, while significantly decreasing the risk of errors, omissions, and late filings.

## Intent & Specification

### Intent Level: L2 (Full specification with references)

This skill executes when the project requires preparation of tax compliance reports for statutory filing, management reporting, or audit purposes. It systematically collects financial transaction data, classifies transactions by tax treatment, calculates tax obligations, prepares filing workpapers, and generates a compliance package that documents the project's tax position across all applicable tax types and jurisdictions.

### Specification Parameters

| Parameter | Description | Required | Default |
|-----------|-------------|----------|---------|
| `project_id` | Unique project identifier | Yes | -- |
| `tax_type` | Tax type(s) to report (IVA, withholding, income, customs, all) | Yes | -- |
| `reporting_period` | Fiscal period for the report (month, quarter, year with start/end dates) | Yes | -- |
| `jurisdiction` | Tax jurisdiction code (CL for Chile, PE for Peru, CO for Colombia, etc.) | Yes | -- |
| `legal_entity` | Legal entity filing the return (RUT or tax ID) | Yes | -- |
| `filing_purpose` | Purpose of the report (statutory-filing, management-review, audit-support) | No | statutory-filing |
| `include_transfer_pricing` | Whether to include transfer pricing analysis for intercompany transactions | No | false |
| `currency` | Reporting currency (CLP, USD, EUR) | No | Local currency per jurisdiction |
| `materiality_threshold` | Minimum transaction value for detailed reporting | No | 0 (all transactions) |

### Preconditions
- Financial records for the reporting period are closed or in soft-close status
- Vendor master data includes tax residency and tax identification numbers
- Contract register is current with correct tax treatment classifications
- Import/customs documentation is available for duty calculations
- Applicable tax rates, treaty rates, and exemption certificates are on file
- Tax calendar for the jurisdiction has been configured with current deadlines

## Trigger / Invocation

### English Triggers
- "Generate tax compliance report for project {project_id}"
- "Prepare the VAT filing workpapers for this month"
- "Calculate withholding tax obligations on vendor payments"
- "Create the customs duty reconciliation for imported equipment"
- "Produce the statutory tax filing package for {reporting_period}"
- "Review our tax compliance status across all tax types"

### Spanish Triggers (Latin American)
- "Generar el reporte de cumplimiento tributario del proyecto {project_id}"
- "Preparar los papeles de trabajo para la declaracion de IVA de este mes"
- "Calcular las retenciones de impuestos sobre pagos a proveedores"
- "Crear la conciliacion de derechos aduaneros para equipos importados"
- "Producir el paquete de declaracion tributaria para {reporting_period}"
- "Revisar el estado de cumplimiento tributario en todos los impuestos"
- "Necesito el informe de IVA credito fiscal para el SII"
- "Armar la carpeta tributaria del proyecto para este trimestre"

### Programmatic Invocation
```python
result = agent.execute_skill(
    skill="generate-tax-compliance-reports",
    project_id="PRJ-001",
    tax_type="all",
    reporting_period={"start": "2026-01-01", "end": "2026-01-31"},
    jurisdiction="CL",
    legal_entity="76.XXX.XXX-K",
    filing_purpose="statutory-filing",
    include_transfer_pricing=True,
    currency="CLP"
)
```

## Input Requirements

### Required Inputs

| Input | Format | Source | Description |
|-------|--------|--------|-------------|
| Project Financial Records | ERP extract / XLSX | Finance systems (SAP, Oracle) | GL transactions, AP sub-ledger, payment register for the reporting period |
| Vendor Master Data | XLSX/CSV | Contracts & Compliance Agent (AG-005) | Vendor tax IDs (RUT), tax residency, withholding categories, treaty status |
| Contract Register | XLSX/CSV | Contracts & Compliance Agent (AG-005) | Contract values, tax treatment, payment terms, applicable withholding rates |
| Import/Customs Records | PDF/XLSX | Execution Agent (AG-006) | Import declarations, customs valuations, duty payment receipts, DIN numbers |
| Tax Calendar | XLSX/MD | Finance Agent (AG-010) internal | Filing deadlines by tax type and jurisdiction, penalty rates for late filing |
| Tax Rate Tables | XLSX/MD | Finance Agent (AG-010) internal | Current statutory rates, treaty rates, exemption categories by jurisdiction |

### Optional Inputs

| Input | Format | Source | Description |
|-------|--------|--------|-------------|
| Transfer Pricing Documentation | PDF/XLSX | Corporate Tax / External Advisor | Intercompany pricing policies, benchmarking studies, master file |
| Prior Period Tax Returns | PDF | Finance Agent (AG-010) archives | Previous filings for consistency checks and credit carryforward tracking |
| Tax Exemption Certificates | PDF | Vendors / Customs Authority | Exemption certificates, free trade zone documentation, ZOFRI certificates |
| Payroll Tax Data | ERP extract | Operations Agent (AG-002) / HR | Employment tax withholdings, social security contributions, expatriate tax data |
| Double Tax Treaty Register | XLSX/MD | Corporate Tax | Applicable treaties, reduced rates, certificate of residence requirements |
| SII Rulings or Interpretations | PDF | Legal / Tax Advisor | Specific rulings applicable to project tax treatment |
| Foreign Exchange Records | XLSX | Treasury / Finance | Exchange rates used for conversions, FX gains/losses with tax implications |

### Data Quality Requirements
- All vendor tax identification numbers (RUT/tax ID) must be validated against the tax authority registry
- Transaction amounts must reconcile to the general ledger trial balance for the period
- Import declarations must include customs valuation, tariff classification (HS code), and duty payment confirmation
- Payment dates must be accurate to determine the correct withholding period and filing deadline
- Currency conversion rates must match official rates published by the Central Bank or tax authority

## Output Specification

### Primary Output: Tax Compliance Report Package

The package is organized as follows:

```markdown
# Tax Compliance Report Package
## Project: {project_name} | Period: {reporting_period} | Jurisdiction: {jurisdiction}

### 1. Executive Summary and Tax Position Overview
- Summary of tax obligations by type for the reporting period
- Total tax liabilities, credits, and net position
- Filing status dashboard (filed / pending / overdue)
- Key risks and items requiring management attention

### 2. Tax Calendar and Filing Status
- 2.1 Filing Deadline Schedule (next 90 days)
- 2.2 Completed Filings Log with confirmation numbers
- 2.3 Upcoming Deadlines with responsible party assignments
- 2.4 Penalty Exposure Summary for any late or pending filings

### 3. IVA / VAT Compliance Report
- 3.1 Output IVA (Debito Fiscal): Sales and taxable supplies
- 3.2 Input IVA (Credito Fiscal): Purchases and input tax credits
- 3.3 IVA Recovery Analysis (recoverable vs non-recoverable)
- 3.4 Exempt and Zero-Rated Transaction Schedule
- 3.5 IVA Reconciliation (book IVA vs return IVA)
- 3.6 Supporting Libro de Compras / Libro de Ventas summaries
- 3.7 Net IVA Payable / (Refundable) calculation

### 4. Withholding Tax Report
- 4.1 Domestic Vendor Withholdings (Honorarios, Servicios)
- 4.2 Foreign Vendor Withholdings (Article 59, Article 60 LIR)
- 4.3 Treaty Rate Application and Certificate of Residence Log
- 4.4 Withholding Tax Certificate Register (Certificados de Retencion)
- 4.5 Monthly Declaration Summary (Formulario 50 workpapers)
- 4.6 Annual Sworn Declaration Preparation (DJ 1850, 1854, etc.)

### 5. Customs Duties and Import Tax Report
- 5.1 Import Transaction Register (DIN summary)
- 5.2 Tariff Classification and Duty Rates Applied
- 5.3 Duty Payments vs Accruals Reconciliation
- 5.4 Temporary Import Regime Tracking (if applicable)
- 5.5 Free Trade Agreement Benefits Applied
- 5.6 Equipment Re-export Obligations and Timeline

### 6. Corporate Income Tax Provisions
- 6.1 Taxable Income Estimation for the Period
- 6.2 Permanent and Temporary Differences Schedule
- 6.3 Deferred Tax Asset/Liability Movement
- 6.4 Monthly Provisional Payment (PPM) Calculation
- 6.5 Tax Loss Carryforward Status

### 7. Transfer Pricing Documentation (if applicable)
- 7.1 Related-Party Transaction Summary and Transfer Pricing Method Applied
- 7.2 Arm's Length Range Analysis and Documentation Compliance Status (DJ 1907)

### 8. Risk Register and Compliance Issues
- 8.1 Identified Tax Risks with Impact Assessment and Uncertain Tax Positions
- 8.2 Remediation Actions, Responsible Parties, and Statute of Limitations Tracking

### 9. Appendices and Supporting Workpapers
- Detailed transaction listings by tax type and calculation workpapers
- Copies of filed returns, confirmation receipts, and correspondence with tax authorities
```

### Output Format Requirements
- Master report as structured Markdown in `output/finance/tax-compliance/`
- Workpapers organized in subfolders by tax type (IVA, withholding, customs, income)
- All documents named following convention: `{project_id}-TAX-{tax_type}-{period}-{seq}-{description}`
- Filing-ready forms exported in format required by tax authority (XML for SII electronic filing); summary dashboard in both Markdown and XLSX
- Confidentiality classification: Restricted (tax information is sensitive by default)

## Procedure

### Step 1: Tax Calendar and Jurisdiction Setup

1.1. Identify the project's tax jurisdiction(s) based on the legal entity's registration and operating locations. For Chilean entities, confirm the RUT, SII regional office, and applicable tax regimes.

1.2. Load the tax calendar for the jurisdiction, including all statutory filing deadlines for the reporting period. For Chile, key deadlines include: IVA monthly (Form 29, due 12th of following month), withholding tax declarations (Form 50), annual income tax (Form 22, April), and sworn declarations (various, March).

1.3. Determine which tax types are applicable to the project based on its activities: IVA on purchases and sales, withholding tax on vendor payments (domestic and foreign), customs duties on equipment imports, PPM (Pagos Provisionales Mensuales), and transfer pricing obligations for intercompany transactions.

1.4. Verify that all prerequisite data sources are available and that financial records for the period are closed. If records are in soft-close, document pending adjustments that may affect tax calculations.

1.5. Retrieve prior period tax returns and compliance reports to ensure continuity, verify credit carryforwards, and identify any open items requiring follow-up.

1.6. Confirm current tax rates, treaty rates, and any special exemptions applicable to the project (e.g., mining royalty regime, free trade zone benefits, DL 600 foreign investment regime).

### Step 2: Transaction Data Collection and Classification

2.1. Extract all financial transactions for the reporting period from the project ERP system. Organize by transaction type: purchases, sales, payments to vendors, import transactions, intercompany charges, and payroll-related items.

2.2. Classify each transaction by its tax treatment:
- IVA: Taxable (19% standard rate in Chile), exempt, zero-rated, or non-recoverable
- Withholding: Subject to domestic withholding (boletas de honorarios, servicios), foreign withholding (Article 59/60 LIR), or exempt
- Customs: Dutiable imports with tariff classification, duty-free under FTA, or temporary import regime

2.3. Validate vendor tax data for all transactions subject to withholding:
- Domestic vendors: Verify RUT, taxpayer category, and applicable withholding rate
- Foreign vendors: Verify tax residency, treaty eligibility, and certificate of residence status
- Flag any vendors with missing or expired tax documentation for immediate follow-up

2.4. For import transactions, compile the customs documentation:
- Match each import declaration (DIN) to the corresponding purchase order and receiving record
- Verify tariff classification (HS code) and duty rate applied
- Confirm duty payment against customs broker invoices

2.5. Identify intercompany transactions requiring transfer pricing analysis. Segregate management fees, technical service charges, equipment transfers, and interest on intercompany loans.

2.6. Reconcile total classified transactions to the general ledger trial balance. Any unclassified or misclassified transactions must be resolved before proceeding to calculation.

### Step 3: Tax Calculation and Verification

3.1. Calculate IVA (VAT) for the period:
- Compute Debito Fiscal (output IVA) on taxable supplies and services rendered
- Compute Credito Fiscal (input IVA) on taxable purchases and services received
- Determine non-recoverable IVA on exempt activities or non-deductible expenses
- Calculate net IVA payable or refundable, carrying forward any excess credits
- Prepare Libro de Compras and Libro de Ventas summaries aligned with SII electronic format

3.2. Calculate withholding tax obligations:
- Apply domestic withholding rates to honorarios (13% provisional 2026), services, and other applicable payments
- Apply foreign withholding rates per Ley de Impuesto a la Renta (standard 35% or reduced treaty rate)
- For treaty rate claims, verify that valid Certificates of Residence are on file and not expired
- Prepare Formulario 50 workpapers for monthly declaration

3.3. Calculate customs duty obligations:
- Reconcile duty accruals to actual payments per DIN documentation
- Verify correct application of ad valorem rates (6% general rate in Chile) and any applicable FTA preferential rates
- Track temporary import regimes and re-export obligation deadlines

3.4. Calculate corporate income tax provisions:
- Estimate taxable income for the period, adjusting for permanent and temporary differences
- Calculate PPM (Pagos Provisionales Mensuales) obligation
- Update deferred tax asset/liability schedule
- Review tax loss carryforward utilization

3.5. Cross-verify all calculations against prior period filings and year-to-date cumulative totals. Investigate any significant variances (>10%) from prior periods or budget assumptions.

3.6. Document all assumptions, elections, and judgment calls in the calculation workpapers. Flag uncertain tax positions for management review and potential disclosure.

### Step 4: Report Generation and Filing Preparation

4.1. Generate the Tax Compliance Report Package following the output specification structure. Populate each section with calculated figures, supporting schedules, and cross-references to source transactions.

4.2. Prepare filing-ready forms for submission to the tax authority:
- For Chilean SII electronic filing: generate XML files conforming to SII schema for Formulario 29 (IVA), Formulario 50 (withholdings), and applicable sworn declarations
- For customs: reconcile with customs broker for any pending duty adjustments

4.3. Generate withholding tax certificates (Certificados de Retencion) for all vendors subject to withholding during the period. Ensure certificates include all legally required information (vendor RUT, amount, tax withheld, certificate number).

4.4. Produce the tax risk register documenting any uncertain positions, potential exposures, and remediation plans. Assign risk ratings (High/Medium/Low) based on probability and financial impact.

4.5. Create the executive summary consolidating the tax position across all tax types. Include a filing status dashboard showing completed, pending, and upcoming deadlines.

4.6. Generate management reports in both Markdown and XLSX format for distribution to project leadership and corporate tax function.

### Step 5: Review, Filing, and Archival

5.1. Perform internal quality review of the complete tax compliance package:
- Verify mathematical accuracy of all calculations (cross-foot and tick-mark all schedules)
- Confirm reconciliation of tax figures to general ledger and sub-ledger totals
- Validate that all filing forms are complete and conform to authority requirements
- Check that all vendor certificates contain required legal elements

5.2. Submit the package to the designated tax reviewer (project controller, corporate tax manager, or external tax advisor) for approval before filing.

5.3. Upon approval, coordinate the filing of returns through the applicable channels:
- SII electronic portal for Chilean tax returns
- Customs authority portal for duty-related declarations
- Manual filings where electronic submission is not available

5.4. Record filing confirmation details: confirmation number, filing date and time, amounts declared, and payment reference numbers. Update the tax calendar to reflect completed filings.

5.5. Archive the complete tax compliance package in `output/finance/tax-compliance/{period}/` with all supporting workpapers, filed returns, and confirmation receipts.

5.6. Report tax compliance status to the Orchestrator Agent (AG-001) for inclusion in project governance reporting and to the Contracts & Compliance Agent (AG-005) for the regulatory compliance dashboard.

5.7. Update Finance Agent (AG-010) state with: completed filings, outstanding items, credit carryforwards, upcoming deadlines, and any identified risks requiring follow-up in the next period.

5.8. If any filing deadline was missed or is at risk, immediately escalate to the Orchestrator Agent (AG-001) with a penalty exposure estimate and proposed remediation plan.

## Quality Criteria

| Criterion | Weight | Target | Measurement Method |
|-----------|--------|--------|-------------------|
| Technical Accuracy | 30% | All tax calculations reconcile to source data; correct rates applied per jurisdiction; filing forms mathematically accurate | Reconciliation to GL; rate verification against statutory tables; cross-footing of all schedules |
| Completeness | 25% | All applicable tax types covered; all transactions classified; all filing forms prepared; no missing vendor certificates | Transaction coverage audit; checklist of required filings vs completed; certificate register completeness |
| Consistency | 15% | Figures consistent across report sections; tax treatment consistent with prior periods; terminology per local tax law | Cross-reference check between sections; prior period comparison; legal terminology review |
| Format | 10% | Professional structure; SII-compliant electronic formats; VSC branding; proper confidentiality markings | Template compliance; SII schema validation; formatting review |
| Actionability | 10% | Filing-ready without rework; clear deadline tracking; risk items have assigned owners and remediation plans | Filing acceptance by tax authority; deadline adherence rate; risk register completeness |
| Traceability | 10% | Every tax figure traceable to GL transaction; every rate traceable to statutory source; every certificate linked to payment | Source reference verification; audit trail completeness; certificate-to-payment matching |
| **Total** | **100%** | **Composite score >= 91%** | **Weighted average of all criteria** |

## Inter-Agent Dependencies

### Dependencies FROM other agents (inputs needed)

| Agent | Agent ID | Information Required | Timing |
|-------|----------|---------------------|--------|
| Contracts & Compliance | AG-005 | Vendor master data (RUT, tax residency, treaty status), contract register with tax treatment, regulatory compliance requirements | At period start and upon new vendor/contract onboarding |
| Execution | AG-006 | Import records, customs declarations (DIN), equipment valuations, duty payment receipts, project cost reports | Upon customs clearance events and at period end |
| Operations | AG-002 | Payroll data for employment tax withholdings, expatriate assignment details, training expenditure classifications | Monthly at payroll close |
| Orchestrator | AG-001 | Project governance calendar, gate review schedule, management reporting requirements | At project initiation and schedule updates |
| Asset Management | AG-003 | Capitalized asset register for depreciation tax treatment, spare parts import records | At period end for income tax provisions |

### Dependencies TO other agents (outputs provided)

| Agent | Agent ID | Information Provided | Purpose |
|-------|----------|---------------------|---------|
| Orchestrator | AG-001 | Tax compliance status, filing confirmation, risk exposure summary, penalty alerts | Governance reporting and escalation management |
| Contracts & Compliance | AG-005 | Tax compliance data per vendor, withholding certificate issuance status, regulatory filing status | Regulatory compliance dashboard and vendor management |
| Execution | AG-006 | Tax cost accruals (IVA non-recoverable, customs duties, income tax provisions) for project cost reporting | Accurate project cost and cash flow forecasting |
| Asset Management | AG-003 | Tax depreciation schedules, customs duty capitalization amounts | Asset valuation and lifecycle cost analysis |

### Finance Agent (AG-010) Internal Coordination
- This skill consumes payment data validated by `manage-invoice-workflow` and `manage-purchase-orders` for withholding tax calculations
- This skill feeds tax accruals into `forecast-cashflow` for accurate cash flow projections including tax payment timing
- This skill provides tax compliance evidence to `prepare-audit-package` as a standard component of the audit documentation
- Tax cost variances identified by this skill are reported through `analyze-cost-variance` when actuals deviate from budgeted tax provisions

## References

- **Codigo Tributario de Chile (DL 830)**: General tax procedures, filing obligations, penalties, and taxpayer rights
- **Ley de Impuesto al Valor Agregado (DL 825)**: IVA legislation governing taxable events, rates, credits, and exemptions
- **Ley de Impuesto a la Renta (DL 824)**: Income tax law including withholding on domestic and foreign payments (Articles 59, 60, 74)
- **SII Normative Resolutions**: Electronic filing requirements, Libro de Compras/Ventas format, sworn declaration specifications
- **Ordenanza de Aduanas (DFL 30)**: Customs legislation governing import duties, tariff classification, and temporary import regimes
- **OECD Transfer Pricing Guidelines (2022)**: Arm's length principle, documentation requirements, country-by-country reporting
- **IFRS / IAS 12**: Income Taxes -- accounting for current and deferred tax obligations
- **Double Tax Treaties (Chile network)**: Bilateral agreements for reduced withholding rates and treaty benefit procedures
- **VSC OR Knowledge Base v2.0**: Section on Financial Governance, Tax Compliance, and Regulatory Obligations
- **VSC Quality Assurance Framework**: Deliverable scoring methodology (6 dimensions, target >= 91%)
- **ISO 55010:2019**: Asset Management -- Guidance on alignment of financial and non-financial functions in asset management

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-25 | VSC OR System | Initial skill creation for Finance & Accounting agent domain |
