---
name: manage-invoice-workflow
description: "Manage the end-to-end invoice processing workflow including three-way matching, approval routing, payment tracking, and aging analysis for OR projects. Triggers: 'manage invoices', 'invoice three-way match', 'gestionar flujo de facturas'."
---

# Manage Invoice Workflow
## Skill ID: manage-invoice-workflow
## Version: 1.0.0
## Category: C - Tracking
## Priority: High

## Purpose
Invoice management in Operational Readiness projects demands a level of rigor and speed that far exceeds routine accounts payable processing. During the OR phase, the project simultaneously processes invoices from dozens of contractors, hundreds of material suppliers, and multiple service providers, all operating under different contractual terms, payment schedules, and compliance requirements. A single delayed or incorrectly processed invoice can trigger contractor payment disputes, supply chain disruptions, and erosion of the trust relationships that are critical to maintaining momentum during the high-pressure transition from construction to operations. This skill provides a comprehensive framework for managing the complete invoice lifecycle — from receipt and validation through three-way matching, approval routing, payment execution, and aging analysis — ensuring that every invoice is processed accurately, on time, and in compliance with contractual and regulatory requirements.

The three-way match process (purchase order, goods receipt, invoice) is the fundamental control mechanism that ensures the project only pays for goods and services that were properly ordered, actually received, and correctly priced. In the OR context, three-way matching is complicated by the prevalence of service-based invoices where "receipt" is measured by progress milestones rather than physical goods delivery, multi-currency transactions requiring FX rate application, retention and milestone-based payment structures, and the need to apply liquidated damages or back-charges where contractor performance falls short. This skill equips the Execution agent to handle all of these complexities while maintaining a clear, auditable trail of every invoice from receipt to payment. The aging analysis component provides early warning of payment bottlenecks, enabling proactive management of cash outflows and vendor relationships.

## Intent & Specification
The AI agent MUST understand that:
1. Every invoice must pass a three-way match (PO, goods receipt/service confirmation, invoice) before it can be approved for payment — no exceptions without documented and authorized override.
2. Invoice approval routing must follow the Delegation of Authority matrix, with the invoice value, cost category, and budget impact determining the required approval chain.
3. Payment terms must be tracked at the individual invoice level, with payment due dates calculated from the contractually defined trigger event (invoice receipt date, goods receipt date, or milestone acceptance date as applicable).
4. Invoice discrepancies (price variances, quantity differences, unauthorized charges) must be systematically captured, investigated, and resolved through a defined dispute resolution process with the vendor.
5. Aging analysis must be performed weekly, with overdue invoices escalated to the appropriate responsible party and included in the project's accounts payable risk reporting.

## Trigger / Invocation
```
/manage-invoice-workflow
```
### Natural Language Triggers
- "Manage invoice processing workflow"
- "Perform three-way match on pending invoices"
- "Show invoice aging analysis"
- "Gestionar flujo de trabajo de facturas"
- "Realizar conciliacion triple de facturas pendientes"
- "Mostrar analisis de antiguedad de facturas"

## Input Requirements
### Required Inputs
| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| PO Register | Active purchase orders with line item details, values, and delivery status | XLSX | manage-purchase-orders skill output |
| Goods Receipt Log | Confirmed goods receipts and service acceptances with dates and quantities | XLSX | Warehouse/Site teams or ERP system |
| Invoice Register | Received invoices with vendor, PO reference, amounts, tax, and payment terms | XLSX | Accounts Payable or finance system |
| Contract Payment Terms | Contractual payment conditions by vendor including retention, milestones, and penalties | XLSX/PDF | Contracts & Compliance Agent |

### Optional Inputs (Highly Recommended)
| Input | Description | Default |
|-------|-------------|---------|
| Delegation of Authority Matrix | Approval thresholds for invoice authorization | Single-level approval by project manager assumed |
| FX Rate Table | Exchange rates for multi-currency invoice processing | Spot rate at invoice date applied |
| Tax Compliance Rules | Local tax requirements (VAT, withholding, etc.) | Standard local tax rate applied without exemptions |
| Bank Payment Calendar | Payment run schedule and bank processing cut-off dates | Weekly payment run assumed |

### Context Enrichment
The agent should automatically:
- Match each received invoice against the PO register to identify the corresponding purchase order and validate pricing, quantities, and scope alignment
- Cross-reference goods receipt records to confirm that the invoiced goods or services have been received and accepted before approving for payment
- Calculate the payment due date based on the contractual payment terms and the applicable trigger event date
- Flag invoices approaching or exceeding their payment due date for prioritized processing and escalation
- Check for duplicate invoices by comparing vendor, invoice number, date, and amount against previously processed invoices

## Output Specification
### Document: Invoice Management Dashboard & Register
**Filename**: `VSC_InvoiceRegister_{ProjectCode}_{Version}_{Date}.xlsx`

**Structure**:
1. **Invoice Processing Dashboard** — Summary of total invoices by status (received, in matching, matched, in approval, approved, paid, disputed, on hold), total value by status, average processing cycle time, and three-way match success rate
2. **Active Invoice Register** — Complete listing of all invoices in process with invoice number, vendor, PO reference, invoice date, received date, gross amount, tax, net amount, three-way match status, approval status, payment due date, and payment status
3. **Three-Way Match Report** — Detailed matching results for each invoice showing PO value vs invoice value, GR quantity vs invoice quantity, price variance, and match outcome (full match, partial match, no match, exception)
4. **Invoice Aging Analysis** — Invoices categorized by age band: current (within terms), 1-30 days overdue, 31-60 days overdue, 61-90 days overdue, and 90+ days overdue, with total values and responsible party identification
5. **Dispute and Exception Register** — All invoice discrepancies and disputes with description, root cause, resolution status, financial impact, and target resolution date
6. **Payment Forecast** — Projected payment outflows by week for the next 90 days based on approved and in-pipeline invoices, feeding into the cash flow forecast

### Key Metrics
| Metric | Description | Target |
|--------|-------------|--------|
| Invoice Processing Cycle Time | Average days from invoice receipt to payment approval | < 10 business days |
| Three-Way Match Rate | Percentage of invoices that pass automated three-way matching without exception | > 85% first-pass match |
| On-Time Payment Rate | Percentage of invoices paid within contractual payment terms | > 95% |
| Dispute Resolution Time | Average days to resolve invoice discrepancies | < 15 business days |
| Duplicate Invoice Prevention | Percentage of duplicate invoices caught before payment | 100% prevention rate |

## Procedure

### Step 1: Invoice Receipt and Registration
- Receive invoices through the defined channels (email, portal, physical mail) and register each invoice in the invoice register with a unique tracking number, received date, and key header data
- Capture all invoice header fields: vendor name and ID, invoice number, invoice date, PO reference number, currency, gross amount, tax amount, net amount, and payment terms
- Perform initial validation checks: verify the vendor is in the approved vendor register, confirm the invoice references a valid PO number, check that required tax documentation is included, and validate the mathematical accuracy of the invoice
- Verify tax compliance: confirm that VAT/GST registration numbers are valid, withholding tax rates are correctly applied, and any tax exemptions are supported by valid certificates
- Reject and return invoices that fail initial validation with a clear explanation of the deficiency and required corrective action
- Prioritize registered invoices based on payment due date, strategic vendor importance, and contractual penalty exposure
- Log the received date as the starting point for payment term calculation (where contract specifies "from date of receipt") and cycle time measurement

### Step 2: Three-Way Matching
- Execute the three-way match for each registered invoice: compare invoice line items against PO line items (price, quantity, description, unit of measure) and against goods receipt records (quantity received, acceptance date, quality status)
- Apply matching tolerances as defined in the governance framework:
  - **Price tolerance**: +/-1% for catalogue items; +/-2% for non-catalogue items; zero tolerance for fixed-price contracts
  - **Quantity tolerance**: Exact match for discrete items; +/-2% for bulk materials measured by weight or volume
  - **Description match**: Must reference the same PO line item; minor wording variations acceptable if scope intent is clearly the same
- For full matches (all three documents agree within defined tolerance), automatically advance the invoice to the approval stage
- For partial matches or exceptions, generate a match exception report detailing each discrepancy with the variance amount and suggested resolution (accept within tolerance, request credit note from vendor, or flag for dispute)
- For service invoices where goods receipt is replaced by milestone acceptance or progress certification, verify the invoice against the approved progress claim and the contract milestone schedule
- Document the matching outcome for each invoice line item in the three-way match report with a clear audit trail

### Step 3: Approval Routing and Authorization
- Route matched invoices through the approval workflow based on the Delegation of Authority matrix, considering invoice value, cost category, and budget impact
- Apply the correct approval routing based on value bands:
  - **< USD 10,000**: Single approval by cost center manager
  - **USD 10,000 - 50,000**: Cost center manager + Project Controls review
  - **USD 50,000 - 250,000**: Above + Project Manager approval
  - **> USD 250,000**: Above + Project Director approval
  - Note: Actual thresholds defined in the project-specific DoA matrix
- Track approval status in real-time, sending reminders to pending approvers at defined intervals (e.g., daily reminder after 3 business days, escalation after 5 business days)
- For invoices requiring multi-level approval, ensure sequential routing with clear visibility of who has approved and who is pending
- Process approved invoices for payment scheduling based on the contract payment terms and the project's payment run calendar
- Apply retention deductions where contractually required (typically 5-10% of invoice value held until defects liability period completion)

### Step 4: Dispute Management and Resolution
- For all invoices with unresolved match exceptions or approval rejections, initiate the dispute resolution process with the vendor, documenting the discrepancy, supporting evidence, and requested resolution
- Classify each dispute by type for tracking and analysis:
  - **Price dispute**: Invoice price differs from PO/contract price
  - **Quantity dispute**: Invoiced quantity exceeds received quantity
  - **Scope dispute**: Invoiced items not covered by PO scope
  - **Quality dispute**: Goods/services received but rejected on quality grounds
  - **Administrative error**: Incorrect PO reference, wrong tax rate, calculation error
- Track dispute status with defined escalation timelines: initial vendor contact within 2 business days, follow-up within 5 business days, escalation to contracts team within 10 business days, and management escalation within 20 business days
- Maintain the dispute register with financial impact quantification, resolution options, and negotiation status for reporting to the project leadership team
- Upon dispute resolution, process the agreed adjustment (credit note, revised invoice, or accepted variance) and advance the invoice to the payment queue

### Step 5: Payment Tracking and Aging Analysis
- Monitor payment execution against approved invoices, confirming payment dates and amounts with the treasury or finance team
- Verify that payment amounts reflect any applicable deductions: retention, liquidated damages, back-charges, early payment discounts, or withholding tax
- Perform weekly aging analysis, categorizing all unpaid invoices by age band relative to their contractual payment due date
- Generate aging reports with escalation recommendations: invoices 30+ days overdue require project manager attention, 60+ days require commercial/legal review, 90+ days require executive escalation
- Calculate the weighted average days payable outstanding (DPO) and compare against the contractual payment terms to assess overall payment performance
- Update the payment forecast with actual payment data and revised projections for unpaid invoices, feeding the updated forecast to the forecast-cashflow skill
- Produce vendor-level payment performance reports for use in vendor relationship management and contract compliance reviews

## Failure Modes & Common Pitfalls

| Failure Mode | Root Cause | Prevention Strategy |
|-------------|-----------|-------------------|
| Invoice paid without valid goods receipt | GR not processed before invoice approval | System block: no approval routing without GR match; daily GR compliance check |
| Duplicate invoice paid | Same invoice submitted twice with slight variations | Automated duplicate detection: vendor + invoice number + amount + date; manual review of flagged items |
| Payment made after contract expiry | PO/contract end date not validated | Automated contract date validation at three-way match; expired contract alert |
| Retention not deducted | Manual retention calculation missed | Automated retention calculation based on contract terms coded in PO master data |
| Late payment penalties incurred | Invoice stuck in approval queue | Real-time aging dashboard; auto-escalation at 80% of payment term elapsed |
| Incorrect FX rate applied | Manual rate entry error | Automated FX rate feed from treasury system; rate variance check against daily published rates |
| Tax withholding error | Incorrect vendor tax classification | Vendor tax profile validation at invoice registration; tax authority rate cross-check |

## Escalation Protocols

| Trigger | Timeline | Escalation Path |
|---------|----------|----------------|
| Invoice pending match > 5 business days | Day 5 | AP team lead investigates blocking issue |
| Invoice pending approval > 3 business days | Day 3 | Reminder to approver; Day 5: escalation to manager |
| Invoice overdue for payment > 10 days | Day 10 | Finance Controller review; vendor notification |
| Invoice overdue for payment > 30 days | Day 30 | Project Manager involvement; commercial review |
| Invoice overdue for payment > 60 days | Day 60 | Legal review for contractual implications |
| Dispute unresolved > 20 business days | Day 20 | Management escalation; joint review with vendor |
| Total overdue value > 10% of monthly payables | Weekly review | Project Director briefing; liquidity risk assessment |

## Invoice Processing Metrics Dashboard

The following metrics should be tracked and displayed on the invoice processing dashboard, updated in real-time or at minimum daily.

### Volume Metrics

| Metric | Measurement | Display |
|--------|------------|---------|
| Invoices Received This Period | Count and total value | Numeric with period comparison |
| Invoices in Matching Queue | Count and total value by age | Bar chart by age band |
| Invoices Pending Approval | Count and value by approver | Table with approver name and days pending |
| Invoices Approved Awaiting Payment | Count and value by payment run date | Timeline showing next 4 payment runs |
| Invoices Paid This Period | Count and total value | Numeric with period comparison |
| Invoices in Dispute | Count, total value, and average age | Trend chart showing dispute resolution progress |

### Performance Metrics

| Metric | Calculation | Target | Display |
|--------|------------|--------|---------|
| Average Processing Time | Mean days from receipt to payment approval | < 10 days | Trend line (13-week rolling) |
| First-Pass Match Rate | Invoices matched without exception / Total invoices | > 85% | Gauge chart with threshold |
| On-Time Payment Rate | Invoices paid within terms / Total invoices paid | > 95% | Gauge chart with threshold |
| Dispute Rate | Invoices in dispute / Total invoices received | < 5% | Trend line (13-week rolling) |
| Overdue Value | Total value of invoices past payment due date | Minimize | Stacked bar by age band |

## Definitions & Glossary

| Term | Definition |
|------|-----------|
| Three-Way Match | Reconciliation of purchase order, goods receipt, and invoice to verify consistency before payment |
| Goods Receipt (GR) | Confirmation document recording that goods have been physically received or services accepted |
| Invoice Verification | The process of checking an invoice against the PO and GR to confirm accuracy before approval |
| Payment Terms | Contractual conditions defining when payment is due (e.g., Net 30, Net 60 from invoice date or GR date) |
| Retention | Percentage of invoice value withheld until defined conditions are met (e.g., defects liability period expiry) |
| Credit Note | Document issued by the vendor to reduce the amount owed, typically to correct an overcharge or billing error |
| Aging Analysis | Categorization of unpaid invoices by the number of days past their payment due date |
| DPO (Days Payable Outstanding) | Average number of days the project takes to pay its invoices, measuring payment performance |
| Match Exception | A discrepancy identified during three-way matching that prevents automatic approval |
| Payment Run | Scheduled batch processing of approved invoices for payment through the banking system |

## Implementation Considerations

### SAP Integration
- Invoice registration via MIRO (logistics invoice verification) with automatic three-way match against PO (ME21N) and GR (MIGO)
- SAP tolerance groups configured for price and quantity matching with automatic blocking for exceptions
- Workflow (WF) configured for approval routing based on value, cost center, and vendor category
- Payment processing through F110 (automatic payment program) with payment method and bank determination
- Aging analysis via FBL1N (vendor line items) with custom layouts for overdue tracking

### Non-SAP Environments
- Invoice register maintained in the VSC Invoice Management Excel template with built-in matching formulas
- Manual three-way match using VLOOKUP/INDEX-MATCH against PO register and GR log data
- Email-based approval workflow with tracking through register status columns
- Payment tracking via bank statement reconciliation against the approved invoice list

## Quality Criteria

| Dimension | Weight | Target | Measurement |
|-----------|--------|--------|-------------|
| Technical Accuracy | 30% | >95% accuracy | Three-way match results verified; payment amounts reconcile with approved invoices |
| Completeness | 25% | 100% coverage | All received invoices registered; no off-system payments; all disputes documented |
| Consistency | 15% | Zero conflicts | Invoice register reconciles with PO register, GR log, and general ledger |
| Format | 10% | Professional | VSC template with clear status tracking, aging buckets, and exception highlighting |
| Actionability | 10% | Immediately usable | Aging reports enable same-day follow-up on overdue items; disputes have clear next actions |
| Traceability | 10% | Full audit trail | Every invoice traceable from receipt through matching, approval, to payment confirmation |

## Inter-Agent Dependencies

### Inputs From Other Agents
| Agent | Entity/Deliverable | Purpose |
|-------|-------------------|---------|
| Execution | PO register (via manage-purchase-orders) | Three-way matching — PO reference data |
| Operations | Goods receipt and service acceptance confirmations | Three-way matching — delivery verification |
| Contracts & Compliance | Contract payment terms and conditions | Payment due date calculation and compliance verification |
| Contracts & Compliance | Delegation of Authority matrix | Invoice approval routing configuration |
| Asset Management | Equipment receipt and inspection records | Three-way matching for capital equipment invoices |

### Outputs Consumed By
| Agent | Entity/Deliverable | Purpose |
|-------|-------------------|---------|
| Execution | Actual cost postings from processed invoices | Budget execution tracking and cost reporting |
| Execution | Payment forecast from approved invoice pipeline | Cash flow forecasting and working capital management |
| Contracts & Compliance | Invoice dispute register | Vendor performance evaluation and contract compliance |
| Orchestrator | Invoice processing dashboard | Governance reporting on financial process performance |

## References
- `methodology/or-playbook-and-procedures/` — OR procedures including accounts payable and financial governance standards
- `methodology/capital-projects/` — Capital project financial control frameworks
- `methodology/contract-tender-technical-specifications/` — Contract payment terms and invoicing requirements
- IAS 37 — Provisions, Contingent Liabilities (relevant to disputed invoices and retention accounting)
- Local tax authority guidelines — VAT/GST, withholding tax, and electronic invoicing requirements by jurisdiction

## Changelog
| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-25 | Initial creation — Wave 2 |
