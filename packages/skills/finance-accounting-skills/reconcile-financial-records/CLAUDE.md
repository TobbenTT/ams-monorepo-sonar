---
name: reconcile-financial-records
description: "Perform period-end financial reconciliation including bank reconciliation, intercompany balances, accrual adjustments, and financial close procedures for industrial operations. Triggers: 'financial reconciliation', 'month-end close', 'reconciliacion financiera', 'cierre contable'."
---

# Reconcile Financial Records

## Skill ID: reconcile-financial-records

## Version: 1.0.0

## Category: B - Analysis

## Priority: Medium

---

## Purpose

Execute structured period-end financial reconciliation procedures for industrial operations, encompassing bank account reconciliation, intercompany balance confirmation, accounts receivable and payable aging analysis, accrual adjustments, provision reviews, fixed asset reconciliation, and financial close checklist management. This skill ensures that the general ledger accurately reflects the economic reality of the operation at each period-end, enabling reliable management accounts, statutory reporting, and audit-ready financial records.

Financial reconciliation is the quality assurance process for accounting data. Without rigorous, systematic reconciliation, errors accumulate over time -- mispostings go undetected, bank balances drift from book balances, intercompany accounts develop unexplained differences, and accrual estimates diverge from reality. In newly commissioned industrial operations, reconciliation challenges are amplified: new ERP systems contain configuration errors, staff are unfamiliar with posting procedures, supplier invoicing patterns are not yet established, and the volume of transactions during commissioning and ramp-up creates a high-error-rate environment. Industry benchmarks indicate that first-year operations experience 3-5x the reconciliation adjustment volume of mature operations, making disciplined reconciliation procedures essential from Day 1.

This skill provides the financial integrity foundation upon which all other Finance & Accounting skills depend. The track-cost-centers skill relies on reconciled cost postings; track-project-expenditures requires reconciled commitment and actual balances; and generate-management-accounts needs verified GL balances to produce credible internal reports. The skill also supports the Contracts & Compliance agent by maintaining audit-ready records and the Orchestrator by providing financial close status for gate review packages.

---

## Intent & Specification

The AI agent MUST understand that:

1. **Systematic reconciliation** requires that every balance sheet account is reconciled on a defined frequency (monthly for material accounts, quarterly for low-risk accounts), with documented reconciliation workpapers that explain every reconciling item and its expected clearance date.
2. **Bank reconciliation** must match every transaction in the bank statement to a corresponding entry in the general ledger, identify outstanding items (checks not yet cleared, deposits in transit, bank charges not yet posted), and explain any reconciling differences with specific resolution actions.
3. **Intercompany reconciliation** must confirm that reciprocal balances between related entities agree within a defined tolerance (typically zero for same-currency entities), with all differences investigated, documented, and resolved before consolidation.
4. **Accrual management** requires a disciplined process: review all prior-period accruals for reversal or adjustment, estimate new period-end accruals based on goods received not invoiced (GRNI), services performed not billed, and other timing differences, with each accrual supported by a documented calculation basis.
5. **Accounts receivable management** must include aging analysis, provision for doubtful debts assessment (applying IFRS 9 expected credit loss model), and active follow-up on overdue balances, recognizing that in project-based businesses, milestone billing disputes can create significant AR aging.
6. **Fixed asset reconciliation** must verify that the asset register matches the general ledger, depreciation calculations are correct, asset additions from the capital project are properly capitalized (coordinating with track-project-expenditures for the CAPEX/OPEX boundary), and disposals are correctly accounted for.
7. **Close checklist discipline** means that every period-end follows a standardized checklist with defined tasks, owners, deadlines, and sign-offs, enabling the Finance Manager to certify that all reconciliation procedures have been completed and the books are ready for reporting.

---

## Trigger / Invocation

### Natural Language Triggers

**English:**
- "Perform the month-end financial reconciliation"
- "Reconcile the bank accounts for February"
- "Run the period-end close checklist and identify outstanding items"
- "Prepare reconciliation workpapers for the external audit"

**Spanish:**
- "Realizar la reconciliacion financiera de cierre de mes"
- "Conciliar las cuentas bancarias del periodo"
- "Ejecutar el checklist de cierre contable mensual"

**Command:** `/reconcile-financial-records`

**Aliases:**
- `/financial-reconciliation`
- `/month-end-close`
- `/reconciliacion-financiera`

---

## Input Requirements

### Required Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `general_ledger_trial_balance` | `.xlsx` or ERP extract | Complete trial balance with opening balance, period movements, and closing balance by GL account |
| `bank_statements` | `.pdf`, `.csv`, or `.xlsx` | Bank statements for all operating accounts covering the reconciliation period |
| `accounts_receivable_detail` | `.xlsx` or ERP extract | AR sub-ledger detail: invoice number, customer, amount, due date, aging bucket |
| `accounts_payable_detail` | `.xlsx` or ERP extract | AP sub-ledger detail: invoice number, vendor, amount, due date, payment status |

### Optional Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `prior_period_reconciliations` | `.xlsx` | Previous period reconciliation workpapers for carryforward items |
| `intercompany_confirmations` | `.xlsx` or email | Balance confirmations from related entities |
| `fixed_asset_register` | `.xlsx` or ERP extract | Asset register with additions, disposals, depreciation, and NBV |
| `accrual_schedule` | `.xlsx` | Prior period accruals with reversal status and new accrual estimates |
| `payroll_summary` | `.xlsx` | Payroll cost summary by department for payroll reconciliation |
| `tax_calculations` | `.xlsx` | VAT, withholding tax, and income tax provision calculations |
| `audit_findings` | `.xlsx` or `.pdf` | Previous audit findings requiring remediation tracking |
| `close_checklist_template` | `.xlsx` | Standard period-end close checklist with tasks and deadlines |

### Context Enrichment

The agent should automatically retrieve:
- Cost center balances from `track-cost-centers` for cost reconciliation
- Project expenditure data from `track-project-expenditures` for project cost reconciliation
- Commitment register from `track-project-expenditures` for GRNI accrual estimation
- Corporate accounting policies from the Contracts & Compliance agent

---

## Output Specification

### Primary Output: Reconciliation Package (`.xlsx`)

**File naming:** `{project_code}_reconciliation_package_{period}_{YYYYMMDD}.xlsx`

**Workbook structure:**

| Sheet | Content |
|-------|---------|
| `Close Checklist` | Period-end close tasks: task ID, description, owner, deadline, status (Open/In Progress/Complete), sign-off |
| `Bank Reconciliation` | Per bank account: book balance, bank balance, outstanding deposits, outstanding checks, other reconciling items, adjusted balance |
| `AR Reconciliation` | AR aging summary (current, 30, 60, 90, 120+), provision for doubtful debts calculation, top 10 overdue balances with collection status |
| `AP Reconciliation` | AP aging summary, GRNI accrual detail, duplicate payment check results, early payment discount analysis |
| `Intercompany` | Intercompany balance confirmations, differences identified, resolution status, elimination entries for consolidation |
| `Fixed Assets` | Asset register vs. GL reconciliation, period additions (from CAPEX), disposals, depreciation reconciliation |
| `Accruals & Provisions` | Current period accruals (new + carryforward), provision movements, release/utilization detail |
| `Payroll Reconciliation` | Payroll cost per department: payroll system vs. GL, social charges reconciliation, provision for vacation/severance |
| `Tax Reconciliation` | VAT input/output reconciliation, withholding tax compliance, income tax provision calculation |
| `Journal Entry Summary` | All adjusting journal entries for the period with description, amount, and approval reference |
| `Open Items` | Unresolved reconciling items carried forward to next period with expected resolution date |

### Secondary Output: Reconciliation Status Report (`.docx`)

**File naming:** `{project_code}_reconciliation_status_{period}_{YYYYMMDD}.docx`

Report sections:
1. Close completion status: tasks completed vs. total, overdue items
2. Key reconciliation findings: material discrepancies identified and resolved
3. Unresolved items: description, amount, expected resolution, risk assessment
4. Adjusting journal entries: summary of period-end adjustments with net impact
5. Audit readiness assessment: areas of concern for external auditors
6. Process improvement recommendations based on reconciliation findings

---

## Procedure

### Step 1: Initialize Period-End Close Process

1. Activate the period-end close checklist with all tasks, owners, and deadlines.
2. Confirm the accounting period cut-off date and time.
3. Verify that all sub-ledger postings are complete:
   - All supplier invoices received to date are posted
   - All customer invoices for the period are issued
   - All payroll transactions are posted
   - All bank transactions to cut-off date are recorded
   - All inventory movements are processed
4. Run preliminary trial balance and compare totals against prior period for reasonableness.
5. Identify any unusual or large transactions that require investigation.
6. Communicate close timeline to all departments: deadline for expense submissions, travel claims, and purchase requisitions.
7. Block posting to the prior period (period lock in ERP) once all transactions are confirmed.

### Step 2: Execute Account Reconciliations

1. **Bank Reconciliation** (for each bank account):
   - Extract book balance from GL (cash and bank accounts).
   - Import bank statement transactions.
   - Auto-match transactions by amount, date, and reference number.
   - Investigate unmatched items on both sides:
     - Book side: identify postings not yet reflected in bank (outstanding checks, electronic transfers in process)
     - Bank side: identify bank transactions not yet posted in books (bank charges, interest, direct deposits)
   - Post any missing entries (bank charges, interest income/expense, FX differences).
   - Prepare the reconciliation statement: book balance + bank-side adjustments = bank balance + book-side adjustments.
   - Investigate and document any remaining differences > materiality threshold.

2. **Accounts Receivable Reconciliation:**
   - Run AR aging report by customer and invoice.
   - Verify AR sub-ledger total agrees to GL control account.
   - Review overdue balances > 30 days: contact customers, document collection status.
   - Calculate provision for doubtful debts using the expected credit loss (ECL) model:
     - Current: 0.5% provision
     - 31-60 days: 2% provision
     - 61-90 days: 5% provision
     - 91-120 days: 15% provision
     - >120 days: 50% provision (case-by-case assessment for large balances)
   - Post provision adjustments to reflect updated ECL estimate.
   - Document any customer disputes affecting collectability.

3. **Accounts Payable Reconciliation:**
   - Run AP aging report by vendor and invoice.
   - Verify AP sub-ledger total agrees to GL control account.
   - Identify GRNI (goods received not invoiced) items:
     - GR posted but no corresponding invoice received
     - Estimate accrual based on PO value and GR quantity
   - Run duplicate payment detection: same vendor, same amount, same period.
   - Verify early payment discount capture rate.
   - Post GRNI accruals and any other AP adjustments.

4. **Intercompany Reconciliation:**
   - Send balance confirmation requests to all related entities.
   - Compare confirmed balances against book balances.
   - Investigate differences: timing (in-transit transactions), FX (different conversion rates), errors (mispostings).
   - Agree adjustments with counterparty and post corrections.
   - Prepare elimination entries for consolidated reporting.

5. **Fixed Asset Reconciliation:**
   - Verify asset register total (cost and accumulated depreciation) matches GL.
   - Review period additions: verify proper capitalization (amount, asset class, useful life).
   - Coordinate with track-project-expenditures for new CAPEX items transferring from project to asset register.
   - Verify depreciation calculations (straight-line, declining balance, or units of production as applicable).
   - Review disposals and retirements: verify gain/loss calculation and physical removal confirmation.

### Step 3: Process Accruals and Provisions

1. Review all prior-period accruals:
   - Reverse accruals where the actual invoice has been received and posted.
   - Adjust accruals where the actual amount differs materially from the estimate.
   - Carry forward accruals where the invoice is still pending (investigate if > 60 days old).
2. Estimate new period-end accruals:
   - Goods received not invoiced (from PO/GR matching report)
   - Services performed not billed (from contract milestone tracking)
   - Utility accruals (electricity, water, gas based on meter readings or estimates)
   - Professional services accruals (consulting, legal, audit fees)
3. Review provisions:
   - Employee benefits: vacation, severance, bonuses (per Chilean labor law)
   - Warranty provisions: based on historical claim rates
   - Environmental provisions: per regulatory requirements
   - Litigation provisions: based on legal counsel assessment
4. Post all accruals and provision movements with documented support.
5. Calculate the net adjustment impact on period P&L and balance sheet.

### Step 4: Finalize Adjusting Entries and Close

1. Compile all adjusting journal entries identified during reconciliation.
2. For each adjusting entry, document:
   - Journal entry number
   - Date and period
   - Debit and credit accounts with amounts
   - Description and business justification
   - Supporting documentation reference
   - Preparer and approver
3. Review all entries with the Finance Manager for approval.
4. Post approved adjusting entries.
5. Run the final trial balance after all adjustments.
6. Verify that the trial balance is in balance (total debits = total credits).
7. Verify sub-ledger to GL reconciliation for all control accounts.
8. Update the close checklist: mark all completed tasks, identify any overdue items.
9. Obtain Finance Manager sign-off on the reconciliation package.

### Step 5: Report and Archive

1. Generate the Reconciliation Status Report (`.docx`) summarizing:
   - Close completion rate (e.g., 48 of 50 tasks completed on time)
   - Total adjusting entries posted (count and net value)
   - Key findings: significant reconciling items discovered and resolved
   - Open items: unresolved items with risk assessment and resolution timeline
   - Audit readiness score: percentage of accounts fully reconciled with documentation
2. Feed reconciled balances to generate-management-accounts for internal reporting.
3. Feed reconciled project balances to track-project-expenditures for EAC validation.
4. Provide close completion status to the Orchestrator for gate review reporting.
5. Archive the reconciliation package in the project document management system.
6. For year-end close: prepare additional schedules for external audit:
   - Lead schedules for all material balance sheet accounts
   - Movement schedules for provisions, fixed assets, and equity
   - Related party transaction summary
   - Subsequent events assessment
7. Document process improvement recommendations:
   - Recurring reconciliation issues that indicate system configuration problems
   - Manual processes that should be automated
   - Training needs identified through common posting errors

---

## Quality Criteria

| Criterion | Weight | Target | Description |
|-----------|--------|--------|-------------|
| Technical Accuracy | 30% | 100% | All reconciliations balance correctly; adjusting entries are arithmetically correct; sub-ledgers agree to GL control accounts |
| Completeness | 25% | 100% | Every balance sheet account is reconciled; all reconciling items are identified and documented; close checklist is fully executed |
| Consistency | 15% | 100% | Reconciliation methodology is applied uniformly across periods; provision calculations use consistent assumptions; accrual bases are documented |
| Format | 10% | Professional | Clear workpaper format with headings, references, sign-offs; conditional formatting for unresolved items; print-ready for audit |
| Actionability | 10% | >95% | Every unresolved reconciling item has an owner, expected resolution date, and risk classification; process improvements are specific and implementable |
| Traceability | 10% | 100% | Every adjusting entry has supporting documentation; every reconciling item links to source transaction; every provision has calculation basis documented |

---

## Inter-Agent Dependencies

### Upstream Dependencies

| Agent/Skill | Data Received | Purpose |
|-------------|---------------|---------|
| Finance & Accounting / `track-cost-centers` | Cost center postings and allocations | Cost account reconciliation and overhead verification |
| Finance & Accounting / `track-project-expenditures` | Project commitments and actuals | GRNI accrual estimation and project cost reconciliation |
| Contracts & Compliance / `audit-compliance-readiness` | Corporate accounting policies and audit requirements | Reconciliation methodology compliance |
| Operations / `create-staffing-plan` | Headcount and payroll data | Payroll reconciliation cross-reference |
| Contracts & Compliance / `create-contract-scope` | Active contracts and milestone payments | AP accrual estimation for contract services |

### Downstream Consumers

| Agent/Skill | Data Provided | Purpose |
|-------------|---------------|---------|
| Finance & Accounting / `generate-management-accounts` | Reconciled GL balances | Verified data for management reporting |
| Finance & Accounting / `track-project-expenditures` | Reconciled project balances | EAC validation and close-out readiness |
| Finance & Accounting / `track-cost-centers` | Reconciled cost center totals | Cost center integrity verification |
| Contracts & Compliance / `audit-compliance-readiness` | Reconciliation workpapers and audit schedules | External audit preparation |
| Orchestrator / `generate-or-gate-review` | Financial close status and readiness | Gate review financial governance dimension |

---

## References

### Standards & Frameworks
- IAS 8 - Accounting Policies, Changes in Accounting Estimates and Errors (adjusting entries)
- IAS 10 - Events after the Reporting Period (subsequent events for year-end close)
- IAS 37 - Provisions, Contingent Liabilities and Contingent Assets (provision methodology)
- IFRS 9 - Financial Instruments (expected credit loss model for AR provisioning)
- ISA 505 - External Confirmations (intercompany and bank confirmation procedures)
- Chilean SII - Monthly closing requirements for VAT, PPM, and withholding tax declarations
- SAP S/4HANA Financial Closing Cockpit - Period-end close process automation

### Templates
- `templates/reconciliation_package_template.xlsx` - Standard reconciliation workbook
- `templates/bank_reconciliation_template.xlsx` - Bank reconciliation statement format
- `templates/close_checklist_template.xlsx` - Period-end close checklist with task tracking
- `templates/adjusting_journal_template.xlsx` - Standardized adjusting entry documentation

### VSC Internal References
- VSC Knowledge Base: "Procedimiento de Cierre Contable Mensual v2.0"
- VSC Knowledge Base: "Guia de Reconciliacion Bancaria y Cuentas por Cobrar/Pagar"
- VSC Knowledge Base: "Politica de Provisiones y Estimaciones Contables"
- VSC OR Methodology: Level 4 (Systems & Processes) - Financial systems readiness and close process design

---

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-02-25 | VSC Product Team | Initial skill definition for Finance & Accounting agent |
