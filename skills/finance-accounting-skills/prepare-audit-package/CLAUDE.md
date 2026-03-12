---
name: prepare-audit-package
description: Generate audit-ready documentation packages including financial controls assessment, compliance checklists, and supporting evidence for OR project audits
version: 1.0.0
category: A - Document Generation
priority: Medium
agent: finance-accounting
tags: [audit, compliance, financial-controls, documentation, internal-audit, external-audit, SOX, governance]
triggers:
  - prepare audit package
  - preparar paquete de auditoria
  - documentacion para auditoria
  - compliance package
inputs:
  - project-financial-records
  - internal-controls-framework
  - compliance-requirements
  - prior-audit-findings
outputs:
  - audit-documentation-package
  - controls-assessment-report
  - compliance-checklist
  - evidence-index
---

# Skill: prepare-audit-package

## Purpose

This skill produces comprehensive, audit-ready documentation packages for Operational Readiness (OR) projects. In large industrial capital projects, financial audits -- both internal and external -- require structured evidence that project expenditures are authorized, properly recorded, compliant with contractual terms, and aligned with corporate governance policies.

The skill assembles financial records, control assessments, compliance checklists, and supporting evidence into a coherent package that auditors can review efficiently. It addresses the unique challenges of OR projects, where expenditure spans multiple functional domains (operations staffing, maintenance setup, procurement, HSE compliance) and often crosses the boundary between CAPEX and OPEX.

The Finance Agent (AG-010) uses this skill to proactively prepare for scheduled audits, respond to ad-hoc audit requests, and maintain continuous audit-readiness throughout the project lifecycle. The package covers financial controls effectiveness, segregation of duties, authorization limits compliance, and regulatory adherence.

This skill reduces the burden of audit preparation from weeks to days by systematically gathering, organizing, and cross-referencing all required documentation against a configurable compliance framework.

## Intent & Specification

### Intent Level: L2 (Full specification with references)

This skill executes when the project requires preparation for an internal audit, external audit, regulatory review, or gate review with financial governance requirements. It systematically collects and organizes all financial documentation needed to demonstrate compliance and control effectiveness.

### Specification Parameters

| Parameter | Description | Required | Default |
|-----------|-------------|----------|---------|
| `project_id` | Unique project identifier | Yes | -- |
| `audit_type` | Type of audit (internal, external, regulatory, gate-review) | Yes | -- |
| `audit_scope` | Specific areas to be covered | No | Full project |
| `reporting_period` | Period under audit (start and end dates) | Yes | -- |
| `compliance_framework` | Applicable standards (SOX, IFRS, local GAAP, corporate policy) | No | Corporate policy |
| `prior_findings_ref` | Reference to previous audit findings for follow-up | No | None |
| `auditor_requirements` | Specific auditor requests or PBC (Prepared By Client) list | No | Standard package |
| `confidentiality_level` | Classification of the package (internal, confidential, restricted) | No | Confidential |

### Preconditions
- Financial records for the audit period are closed or in soft-close status
- Access to project financial systems (ERP, document management)
- Internal controls framework is documented for the project
- Prior audit findings (if any) are available for follow-up status

## Trigger / Invocation

### English Triggers
- "Prepare audit package for project {project_id}"
- "We have an audit coming up, assemble the financial documentation"
- "Generate compliance checklist for the external audit"
- "Create PBC list and gather supporting evidence"
- "Assess financial controls effectiveness for audit"

### Spanish Triggers (Latin American)
- "Preparar el paquete de auditoria para el proyecto {project_id}"
- "Tenemos una auditoria proxima, armar la documentacion financiera"
- "Generar la lista de verificacion de cumplimiento para la auditoria externa"
- "Crear la lista PBC y reunir la evidencia de respaldo"
- "Evaluar la efectividad de los controles financieros para la auditoria"
- "Necesito armar el paquete documental para los auditores"
- "Revisar el estado de cumplimiento de hallazgos previos de auditoria"
- "Preparar la documentacion de control interno del proyecto"

### Programmatic Invocation
```python
result = agent.execute_skill(
    skill="prepare-audit-package",
    project_id="PRJ-001",
    audit_type="external",
    reporting_period={"start": "2025-07-01", "end": "2025-12-31"},
    compliance_framework=["IFRS", "corporate-policy-v3"],
    prior_findings_ref="AUDIT-2025-Q2-FINDINGS",
    auditor_requirements="PBC-LIST-EXT-2026.xlsx"
)
```

## Input Requirements

### Required Inputs

| Input | Format | Source | Description |
|-------|--------|--------|-------------|
| Project Financial Records | ERP extract / XLSX | Finance systems (SAP, Oracle) | GL transactions, journal entries, accruals for audit period |
| Internal Controls Framework | Document (MD/PDF) | Corporate governance / PMO | Defined controls, authorization matrix, segregation of duties |
| Compliance Requirements | Checklist / regulatory reference | Legal / Contracts & Compliance Agent | Applicable regulations, standards, and corporate policies |
| Authorization Records | Approval logs / workflow exports | ERP / approval system | Evidence of proper authorization for expenditures |
| Contract and PO Register | XLSX/CSV | Contracts & Compliance Agent | All contracts, purchase orders, change orders with values |

### Optional Inputs

| Input | Format | Source | Description |
|-------|--------|--------|-------------|
| Prior Audit Findings | PDF/MD | Internal Audit / External Auditor | Previous findings requiring follow-up or closure evidence |
| PBC List (Prepared By Client) | XLSX | External Auditor | Specific documents requested by auditors |
| Bank Reconciliations | PDF/XLSX | Treasury | Bank statement reconciliations for the period |
| Payroll Records | ERP extract | HR / Finance | Staff cost records for verification |
| Tax Compliance Records | PDF/XLSX | Tax department | Withholding tax, VAT/GST records, transfer pricing documentation |
| Insurance Certificates | PDF | Risk Management | Project insurance coverage evidence |
| Asset Register | XLSX/CSV | Asset Management Agent | Capital asset records, depreciation schedules |

### Data Quality Requirements
- All financial records must be from the official books of record (not working files)
- Authorization evidence must show date, approver identity, and approval status
- Documents must be in final/approved status (no drafts unless explicitly noted)
- Records must cover the complete audit period without gaps

## Output Specification

### Primary Output: Audit Documentation Package

The package is organized as follows:

```markdown
# Audit Documentation Package
## Project: {project_name} | Period: {audit_period} | Type: {audit_type}

### 1. Package Index and Navigation Guide
- Master document index with cross-references
- Reading guide for auditors
- Key contacts and responsible parties

### 2. Executive Summary
- Project overview and financial summary
- Key financial metrics for the period
- Summary of control environment
- Status of prior audit findings

### 3. Financial Controls Assessment
- 3.1 Control Environment Overview
- 3.2 Authorization Matrix and Compliance Evidence
- 3.3 Segregation of Duties Assessment
- 3.4 Delegation of Authority Compliance
- 3.5 Journal Entry Controls
- 3.6 Period-End Close Procedures
- 3.7 System Access Controls

### 4. Compliance Checklist
- 4.1 Regulatory Compliance (country-specific)
- 4.2 Corporate Policy Compliance
- 4.3 Contractual Compliance
- 4.4 Tax Compliance
- 4.5 Insurance and Bonding Compliance
- Status: Compliant / Non-Compliant / Partial / N/A for each item

### 5. Financial Statements and Schedules
- 5.1 Project Cost Report (Budget vs Actual)
- 5.2 Commitment Register
- 5.3 Accruals and Provisions Schedule
- 5.4 CAPEX vs OPEX Classification Evidence
- 5.5 Intercompany Transaction Schedule
- 5.6 Foreign Currency Transaction Summary

### 6. Transaction Testing Support
- 6.1 Sample Selection Methodology
- 6.2 High-Value Transaction List (above materiality threshold)
- 6.3 Supporting Documentation for Sampled Transactions
- 6.4 Reconciliation Schedules

### 7. Prior Findings Follow-Up
- Finding ID, Original Finding, Management Response
- Current Status, Evidence of Remediation
- Remaining Open Items and Revised Target Dates

### 8. Evidence Index
- Document ID, Description, Location, Classification
- Cross-reference to checklist items and control objectives
- Completeness status (provided / pending / N/A)

### 9. Representations and Certifications
- Management representation letter template
- Project Director financial certification
- Completeness declaration
```

### Output Format Requirements
- Master package as structured Markdown in `output/finance/audit/`
- Supporting documents organized in numbered subfolders
- Evidence index as both Markdown and CSV for auditor convenience
- All documents named following convention: `{project_id}-AUD-{seq}-{description}`
- Confidentiality markings on all documents per classification level

## Procedure

### Step 1: Scope Definition and Requirements Gathering

1.1. Confirm the audit type (internal, external, regulatory, gate-review) and determine the applicable compliance framework. Different audit types require different levels of documentation.

1.2. If a PBC (Prepared By Client) list has been provided by auditors, map each PBC item to available documentation sources. Identify gaps early.

1.3. Define the audit period boundaries. Confirm period-end accounting close status. If soft-close, document any known adjustments pending.

1.4. Retrieve prior audit findings and their management responses. Determine which findings are open and require evidence of remediation.

1.5. Establish materiality thresholds for the audit (typically provided by auditors for external audit, or defined by corporate policy for internal audit). This determines transaction sampling scope.

1.6. Create the master document checklist by combining PBC requirements, compliance framework requirements, and standard VSC audit package requirements.

### Step 2: Financial Records Collection and Organization

2.1. Extract financial records from the project ERP system for the audit period:
- General Ledger trial balance and transaction detail
- Accounts Payable sub-ledger (invoices, payments)
- Accounts Receivable sub-ledger (if applicable)
- Commitment register (POs, contracts, change orders)
- Journal entry register with supporting documentation

2.2. Obtain authorization evidence:
- Expenditure approval workflows with approver signatures/electronic approvals
- Delegation of Authority register showing approved limits
- Any override or exception approvals with justification

2.3. Collect period-end accounting records:
- Accrual calculations and supporting documentation
- Provision assessments and basis documents
- Reconciliation schedules (bank, intercompany, sub-ledger to GL)

2.4. Gather CAPEX/OPEX classification evidence:
- Capitalization policy and application to project costs
- Asset-under-construction register
- Evidence of capitalization decisions for borderline items

2.5. Organize all collected documents using the standardized naming convention and file them in the evidence repository.

### Step 3: Internal Controls Assessment

3.1. Document the control environment for the project:
- Organizational structure and reporting lines
- Tone at the top (project governance charter)
- Risk assessment process for financial reporting

3.2. Assess key financial controls for design and operating effectiveness:

| Control Area | Control Description | Design Assessment | Operating Evidence |
|-------------|--------------------|--------------------|-------------------|
| Authorization | All expenditures approved per DoA | Review DoA matrix | Sample approval evidence |
| Segregation | Requestor != Approver != Payer | Review role assignments | Test for violations |
| Recording | Transactions recorded in correct period | Review close procedures | Test cut-off |
| Reconciliation | Sub-ledgers reconciled to GL monthly | Review reconciliation procedures | Inspect reconciliations |
| Access | System access restricted by role | Review access matrix | Test user permissions |

3.3. For each control, determine: Effective / Effective with Exceptions / Ineffective. Document exceptions with compensating controls where applicable.

3.4. Identify any control gaps or weaknesses. For each, document the risk implication and recommended remediation.

### Step 4: Compliance Checklist Completion

4.1. Work through each compliance requirement systematically:

4.2. **Regulatory Compliance**: Verify adherence to local financial regulations (tax withholding, reporting requirements, foreign exchange controls, environmental levies). Coordinate with Contracts & Compliance Agent (AG-005) for regulatory mapping.

4.3. **Corporate Policy Compliance**: Verify adherence to corporate financial policies (travel, procurement thresholds, related-party transactions, gift and entertainment). Cross-reference transaction samples against policy limits.

4.4. **Contractual Compliance**: Verify that financial terms of key contracts are being met (payment terms, milestone billing, performance guarantees, insurance requirements). Coordinate with Contracts & Compliance Agent.

4.5. **Tax Compliance**: Verify withholding tax compliance, VAT/GST treatment, transfer pricing documentation (if intercompany transactions exist).

4.6. For each checklist item, record: Status (Compliant/Non-Compliant/Partial/N/A), Evidence Reference, Comments, and Responsible Party.

### Step 5: Package Assembly, Quality Review, and Delivery

5.1. Compile all components into the structured package following the output specification.

5.2. Create the master evidence index, cross-referencing each piece of evidence to:
- The compliance checklist item(s) it supports
- The control objective(s) it demonstrates
- The PBC item(s) it satisfies (if external audit)

5.3. Perform completeness check: verify every checklist item has either evidence or a documented explanation for its absence. Flag any gaps as pending items with expected resolution dates.

5.4. Perform quality review:
- Verify all documents are final versions (not drafts)
- Confirm confidentiality markings are applied
- Check document naming convention compliance
- Validate cross-references are accurate

5.5. Prepare the prior findings follow-up section:
- For each open finding, compile evidence of remediation actions taken
- Document current status: Closed / In Progress / Open
- For items still open, provide revised target dates and responsible parties

5.6. Generate the executive summary synthesizing the overall audit readiness status.

5.7. Deliver the package to the Orchestrator for distribution to auditors. Maintain a delivery log recording what was provided, to whom, and when.

5.8. Update Finance Agent state with audit package status, open items, and any identified control weaknesses requiring remediation.

## Quality Criteria

| Criterion | Weight | Target | Measurement Method |
|-----------|--------|--------|-------------------|
| Technical Accuracy | 30% | All financial figures reconcile to source systems; controls assessment factually correct | Reconciliation to GL; sample verification of control ratings |
| Completeness | 25% | All PBC items addressed; all compliance checklist items covered; no evidence gaps | PBC completion percentage; checklist coverage audit |
| Consistency | 15% | Figures consistent across all package sections; terminology matches audit standards | Cross-reference check between sections; terminology review |
| Format | 10% | Professional package structure; clear indexing; VSC branding; proper confidentiality markings | Template compliance; auditor usability assessment |
| Actionability | 10% | Auditors can navigate package without additional requests; gaps clearly identified with resolution plans | Auditor feedback; supplemental request count post-delivery |
| Traceability | 10% | Every checklist item linked to evidence; every figure linked to source | Evidence index completeness; source reference verification |
| **Total** | **100%** | **Composite score >= 91%** | **Weighted average of all criteria** |

## Inter-Agent Dependencies

### Dependencies FROM other agents (inputs needed)

| Agent | Agent ID | Information Required | Timing |
|-------|----------|---------------------|--------|
| Contracts & Compliance | AG-005 | Contract register, compliance requirements, regulatory mapping | At audit initiation |
| Execution | AG-006 | Project cost reports, WBS, capital expenditure records | At audit initiation |
| Operations | AG-002 | Staffing cost records, training expenditure documentation | At audit initiation |
| Asset Management | AG-003 | Asset register, spare parts procurement records, capitalization evidence | At audit initiation |
| HSE | AG-004 | HSE compliance expenditure, permit costs, environmental levy payments | At audit initiation |
| Orchestrator | AG-001 | Project governance documents, gate review records, authorization framework | At audit initiation |

### Dependencies TO other agents (outputs provided)

| Agent | Agent ID | Information Provided | Purpose |
|-------|----------|---------------------|---------|
| Orchestrator | AG-001 | Complete audit package, control assessment summary, open findings | Distribution to auditors; governance reporting |
| Contracts & Compliance | AG-005 | Contractual compliance findings, regulatory compliance status | Contract management and remediation |
| All Agents | -- | Agent-specific compliance findings | Awareness and remediation of findings in their domain |

### Finance Agent (AG-010) Internal Coordination
- This skill consumes variance analysis from `analyze-cost-variance` to document budget performance
- This skill consumes authorization data validated by `track-capex-authorizations`
- This skill feeds into `model-financial-scenarios` when audit findings require scenario assessment
- Prior period packages serve as templates and comparatives for current period preparation

## References

- **ISA 230**: Audit Documentation (International Standards on Auditing)
- **ISA 500**: Audit Evidence
- **ISA 315**: Identifying and Assessing Risks of Material Misstatement
- **COSO Internal Control - Integrated Framework** (2013)
- **SOX Section 404**: Management Assessment of Internal Controls (where applicable)
- **IIA Standards**: International Standards for the Professional Practice of Internal Auditing
- **VSC OR Knowledge Base v2.0**: Section on Financial Governance and Compliance
- **VSC Quality Assurance Framework**: Deliverable scoring methodology (6 dimensions)
- **ISO 55010:2019**: Asset Management - Guidance on alignment of financial and non-financial functions
- **IFRS / IAS Standards**: Applicable accounting standards for financial reporting

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-25 | VSC OR System | Initial skill creation for Finance & Accounting agent domain |
