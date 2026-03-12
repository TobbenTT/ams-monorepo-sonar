---
name: manage-purchase-orders
description: "Manage the full purchase order lifecycle including creation, approval workflows, commitment tracking, and NO PO NO WORK enforcement for OR projects. Triggers: 'manage purchase orders', 'track PO status', 'gestionar ordenes de compra'."
---

# Manage Purchase Orders
## Skill ID: manage-purchase-orders
## Version: 1.0.0
## Category: C - Tracking
## Priority: High

## Purpose
Purchase order management is a cornerstone of financial discipline in large-scale Operational Readiness projects. In mining, oil & gas, and energy capital projects, the sheer volume of procurement activities during the transition from construction to operations creates significant risk of unauthorized spending, scope creep, and budget overruns. This skill provides a structured framework for managing the entire PO lifecycle — from requisition through receipt and close-out — ensuring that every commitment is properly authorized, tracked, and reconciled against the approved project budget. The NO PO NO WORK policy is the single most effective control mechanism to prevent unauthorized expenditure and must be rigorously enforced across all work packages, contractors, and operational areas.

Beyond basic transactional processing, effective PO management in an OR context requires integration with multiple workstreams including contracts administration, budget execution tracking, materials management, and commissioning scheduling. A purchase order is not merely a financial document; it represents a commitment that triggers downstream activities such as vendor mobilization, material delivery scheduling, warehouse receiving, and invoice processing. When PO management breaks down, the cascading effects include delayed commissioning milestones, contractor disputes, unreconciled commitments, and ultimately, an inability to accurately forecast project costs at completion. This skill ensures that the Execution agent maintains full visibility over all procurement commitments, enforces governance controls at every stage, and provides real-time reporting on PO status to support decision-making by the project leadership team.

## Intent & Specification
The AI agent MUST understand that:
1. Every purchase order must be linked to an approved budget line item and WBS element before it can be created — no orphan POs are permitted under any circumstances.
2. The NO PO NO WORK policy means that no contractor, vendor, or internal team may commence work or deliver goods without a fully approved, system-recorded purchase order in place.
3. PO approval workflows must follow the Delegation of Authority (DoA) matrix, with escalation thresholds clearly defined for different commitment values and categories.
4. Commitment tracking must capture three distinct states: committed (PO issued), goods received (GR posted), and invoiced (IR posted), with variance analysis at each transition.
5. PO change management (amendments, supplements, cancellations) must follow a formal change control process with documented justification and re-approval where the revised value crosses a DoA threshold.

## Trigger / Invocation
```
/manage-purchase-orders
```
### Natural Language Triggers
- "Manage purchase orders for the project"
- "Track PO status and commitments"
- "Enforce NO PO NO WORK policy"
- "Gestionar ordenes de compra del proyecto"
- "Seguimiento de compromisos de compra"
- "Aplicar politica sin OC no hay trabajo"

## Input Requirements
### Required Inputs
| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| Project Budget Breakdown | Approved budget with WBS structure and cost elements | XLSX/SAP extract | Execution Agent — Budget baseline |
| Delegation of Authority Matrix | Approval thresholds by role, value band, and category | PDF/XLSX | Contracts & Compliance Agent |
| Procurement Plan | Planned procurement activities with timelines and categories | XLSX | Execution Agent — Project Controls |
| Contract Register | Active contracts with scope, value, and terms | XLSX | Contracts & Compliance Agent |

### Optional Inputs (Highly Recommended)
| Input | Description | Default |
|-------|-------------|---------|
| SAP MM/PM Configuration | System configuration for PO processing rules | Manual workflow assumed |
| Vendor Master Data | Approved vendor list with payment terms and ratings | Extract from contract register |
| Historical PO Data | Previous project PO volumes and cycle times | Industry benchmarks applied |
| Material Master Data | Catalogue items with standard pricing | Free-text descriptions used |

### Context Enrichment
The agent should automatically:
- Cross-reference each PO request against the approved budget to verify available funds before processing
- Check the contract register to ensure the vendor/contractor has an active agreement covering the requested scope
- Validate that the requested approval routing matches the DoA matrix based on PO value and category
- Flag any POs that would cause a budget line item to exceed its approved allocation by more than 5%
- Identify duplicate or overlapping POs for the same scope of work or materials

## Output Specification
### Document: PO Management Dashboard & Register
**Filename**: `VSC_PO_Register_{ProjectCode}_{Version}_{Date}.xlsx`

**Structure**:
1. **PO Summary Dashboard** — Total POs by status (draft, pending approval, approved, partially received, fully received, closed, cancelled), total committed value, and budget consumption percentage
2. **Active PO Register** — Complete listing of all open POs with PO number, vendor, description, WBS element, original value, current value, goods received value, invoiced value, and remaining commitment
3. **NO PO NO WORK Compliance Log** — Tracking of all work activities verified against PO coverage, exceptions identified, and corrective actions taken
4. **PO Aging Analysis** — POs by age band (0-30, 31-60, 61-90, 90+ days) with flags for overdue deliveries and stale commitments requiring review
5. **Change Order Register** — All PO amendments, supplements, and cancellations with justification, approval status, and value impact
6. **Approval Workflow Status** — POs currently in approval pipeline with routing status, pending approvers, and cycle time metrics

### Key Metrics
| Metric | Description | Target |
|--------|-------------|--------|
| PO Cycle Time | Average days from requisition to approved PO | < 5 business days |
| NO PO NO WORK Compliance | Percentage of work activities with valid PO coverage | 100% |
| PO-to-Budget Alignment | Percentage of POs correctly linked to WBS/budget line | 100% |
| Commitment Accuracy | Variance between PO value and actual invoiced amount | < 5% variance |
| Stale PO Ratio | Percentage of POs with no activity for 90+ days | < 3% of total POs |

## Procedure

### Step 1: Establish PO Governance Framework
- Review and validate the Delegation of Authority matrix, confirming approval thresholds are appropriate for the project scale and organizational structure
- Define PO categories aligned with the project WBS and cost coding structure (e.g., materials, services, equipment hire, subcontracts)
- Establish the NO PO NO WORK policy communication plan, including signage at site entry points, contractor induction modules, and email notifications
- Configure PO numbering conventions, status codes, and routing rules in the project management system or ERP
- Define tolerance bands for three-way matching (typically +/-1% on price, exact match on quantity for materials, milestone-based for services)
- Create the PO register template with all required data fields, validation rules, and conditional formatting for status tracking

### Step 2: Process PO Requisitions and Approvals
- Receive purchase requisitions from authorized requestors, validating completeness of scope description, delivery requirements, WBS assignment, and budget availability
- Verify that the requested goods or services fall within the scope of an existing contract; if not, flag for new contract negotiation or spot-buy authorization
- Route each requisition through the approval workflow based on the DoA matrix, tracking approval timestamps and escalating overdue approvals
- For requisitions exceeding a single approver's authority, ensure multi-level sequential approval with clear documentation of each approval decision
- Convert approved requisitions to purchase orders, issuing to the vendor with complete terms including delivery schedule, quality requirements, and invoicing instructions
- Record all new POs in the register with full traceability to the originating requisition, budget line, and contract (where applicable)
- Send PO confirmation to the requestor, budget holder, and receiving location to ensure all parties are aware of the expected delivery

### Step 3: Monitor PO Execution and Goods Receipt
- Track delivery performance against PO delivery schedules, flagging overdue items for follow-up with vendors and the procurement team
- Process goods receipt (GR) confirmations, matching received quantities and specifications against PO line items and documenting any discrepancies
- For partial deliveries, update the PO register with received values while maintaining the remaining commitment for undelivered items
- For service-based POs, process milestone completions or progress certifications as the equivalent of goods receipt, requiring sign-off from the responsible engineer or project manager
- Update the PO register with received values, calculating remaining commitments and adjusting forecasts accordingly
- Coordinate with the warehouse and commissioning teams to confirm that received materials meet quality standards and are properly stored or installed
- Flag any quality rejections or short deliveries for vendor follow-up, credit note processing, or replacement order initiation

### Step 4: Manage PO Changes and Exceptions
- Process PO amendment requests following the formal change control procedure, including scope change justification, revised pricing, and budget impact analysis
- Classify each amendment by type: price adjustment, quantity change, scope extension, delivery date change, or terms modification
- Re-route amended POs through the approval workflow if the revised value crosses a higher DoA threshold than the original approval
- Investigate and resolve NO PO NO WORK violations, documenting root causes and implementing corrective actions to prevent recurrence
- For each violation, conduct a root cause analysis: was it an emergency, a process failure, or a deliberate circumvention? Apply graduated consequences accordingly
- Review stale POs (no activity for 60+ days) with budget holders, recommending cancellation or re-activation as appropriate
- Process PO cancellations with documented justification, releasing the committed budget back to the available pool and notifying the vendor

### Step 5: Report and Close-Out
- Generate weekly PO status reports for the project leadership team, highlighting new commitments, delivery performance, compliance issues, and budget consumption trends
- Produce monthly analytics including PO cycle time trends, approval bottleneck identification, vendor delivery performance rankings, and commitment forecasting accuracy
- Perform monthly reconciliation of PO commitments against budget forecasts, identifying variances and recommending corrective actions
- Execute PO close-out procedures for completed orders, ensuring all goods/services are received, invoices are processed, and remaining commitment values are released back to the budget
- For project close-out, conduct a comprehensive PO register review: close all completed POs, cancel any remaining open POs with documentation, and produce a final commitment reconciliation report
- Archive closed PO documentation with full audit trail for project close-out and compliance review

## Failure Modes & Common Pitfalls

| Failure Mode | Root Cause | Prevention Strategy |
|-------------|-----------|-------------------|
| Unauthorized work commences without PO | Contractor urgency overrides governance | Enforce site access controls tied to PO validation; zero-tolerance escalation |
| PO created after work is complete (retroactive PO) | Emergency works or process shortcuts | Implement emergency PO fast-track (same-day approval) for genuine emergencies; audit retroactive POs monthly |
| Budget overrun undetected | PO not linked to correct WBS element | Mandatory WBS validation at PO creation; automated budget availability check |
| Stale commitments inflate cost forecasts | POs not closed after completion | Monthly stale PO review with mandatory disposition decision |
| Approval bottlenecks delay procurement | DoA thresholds too low or approvers unresponsive | Review DoA thresholds quarterly; implement auto-escalation after 48 hours |
| Duplicate POs for same scope | Poor communication between requestors | Automated duplicate detection based on vendor + scope keywords + WBS |

## Escalation Protocols

| Trigger | Timeline | Escalation Path |
|---------|----------|----------------|
| PO approval pending > 3 business days | Day 3 | Reminder to approver |
| PO approval pending > 5 business days | Day 5 | Escalation to approver's manager |
| NO PO NO WORK violation detected | Immediate | Project Manager notification; formal incident report within 24 hours |
| PO value exceeds budget line by > 10% | At creation | Automatic hold; requires budget holder and project controls review |
| Vendor delivery overdue > 14 days | Day 14 | Procurement team intervention; contractual notice to vendor |
| Stale PO with no activity > 90 days | Day 90 | Budget holder review; mandatory close or justify continuation |

## PO Status Lifecycle

The following status transitions define the complete PO lifecycle. Each transition requires a triggering event and produces specific updates to the PO register and downstream systems.

| Status | Description | Trigger Event | Next Valid Statuses |
|--------|-------------|--------------|---------------------|
| DRAFT | PO created but not yet submitted for approval | Requisition conversion | PENDING_APPROVAL, CANCELLED |
| PENDING_APPROVAL | PO submitted and awaiting DoA approval | Submit for approval action | APPROVED, REJECTED, CANCELLED |
| REJECTED | PO rejected by an approver; requires revision | Approver rejection action | DRAFT (after revision), CANCELLED |
| APPROVED | PO fully approved and issued to vendor | Final approver sign-off | PARTIALLY_RECEIVED, FULLY_RECEIVED, AMENDMENT_PENDING, CANCELLED |
| AMENDMENT_PENDING | PO modification submitted for re-approval | Change request submitted | APPROVED (amended), CANCELLED |
| PARTIALLY_RECEIVED | Some goods/services received; remainder outstanding | Partial goods receipt posted | FULLY_RECEIVED, AMENDMENT_PENDING, CANCELLED |
| FULLY_RECEIVED | All goods/services received and confirmed | Final goods receipt posted | CLOSED |
| CLOSED | PO fully delivered, invoiced, and reconciled; no further activity | Close-out action after final invoice | Terminal state |
| CANCELLED | PO cancelled before full delivery; commitment released | Cancellation with justification | Terminal state |

## Reporting Cadence

| Report | Frequency | Audience | Content |
|--------|-----------|----------|---------|
| PO Status Flash Report | Weekly (Friday) | Project Manager, Procurement Lead | New POs created, POs approved, delivery status, NO PO NO WORK compliance |
| PO Commitment Reconciliation | Monthly (by WD+3) | Project Controls, Finance | Total commitments by WBS, variance to budget, stale PO review |
| Vendor Delivery Performance | Monthly (by WD+5) | Procurement, Contracts & Compliance | On-time delivery rate, quality metrics, penalty assessment |
| PO Governance Dashboard | Monthly (by WD+5) | Project Director, Steering Committee | Approval cycle times, compliance metrics, top risks |
| NO PO NO WORK Audit Report | Quarterly | Project Director, Client | Compliance rate, violations log, corrective actions, trend analysis |

## Definitions & Glossary

| Term | Definition |
|------|-----------|
| Purchase Requisition (PR) | Internal request document initiating the procurement of goods or services, subject to approval before conversion to a PO |
| Purchase Order (PO) | Formal commitment document issued to a vendor authorizing the supply of goods or services under defined terms |
| Goods Receipt (GR) | Confirmation that goods or services have been physically received or accepted, enabling invoice processing |
| Three-Way Match | Reconciliation of PO, GR, and invoice to verify that what was ordered, received, and billed are consistent |
| NO PO NO WORK | Project policy requiring a valid, approved PO to be in place before any work commences or goods are delivered |
| Delegation of Authority (DoA) | Matrix defining the approval authority for financial commitments based on value thresholds and role hierarchy |
| Commitment | Financial obligation created when a PO is issued, representing budgeted funds allocated to a specific vendor and scope |
| Stale PO | A purchase order with no transactional activity (no GR, no invoice) for a defined period (typically 60-90 days) |
| Retroactive PO | A purchase order created after work has already commenced or goods have been delivered — a governance violation |
| WBS Element | Work Breakdown Structure element to which costs are assigned for budget tracking and reporting purposes |

## Implementation Considerations

### SAP Integration
- When SAP MM is available, PO creation should follow the ME21N transaction flow with automated budget availability check (FMBB)
- Goods receipts processed through MIGO with automatic commitment reduction and accrual posting
- Configure automatic three-way match tolerances in SAP to streamline invoice verification (MRBR)
- Leverage SAP workflow (WF) for approval routing with email notifications and mobile approval capability

### Non-SAP Environments
- Use the VSC PO Register Excel template with built-in validation rules and conditional formatting
- Implement email-based approval workflows with tracking through the register status fields
- Manual budget availability checks against the budget execution tracker before PO creation
- Weekly data synchronization between the PO register and the finance system general ledger

### OR Phase Considerations
- During commissioning ramp-up, PO volumes can increase 3-5x compared to construction phase — ensure approval resources are scaled accordingly
- Emergency procurement for commissioning-critical items requires a fast-track PO process (target: same-day approval) with retrospective documentation within 48 hours
- Transitioning from CAPEX to OPEX POs requires clear cost coding guidelines and training for requestors on the new WBS structure
- Final PO close-out should be coordinated with the project close-out timeline, with a defined cutoff date for new PO creation

## Quality Criteria

| Dimension | Weight | Target | Measurement |
|-----------|--------|--------|-------------|
| Technical Accuracy | 30% | >95% accuracy | PO values reconcile with budget and invoices; DoA thresholds correctly applied |
| Completeness | 25% | 100% coverage | All procurement activities captured; no off-system POs |
| Consistency | 15% | Zero conflicts | PO register aligns with contract register, budget tracker, and invoice log |
| Format | 10% | Professional | VSC template with standardized coding and clear status indicators |
| Actionability | 10% | Immediately usable | Reports enable same-day decision-making on procurement issues |
| Traceability | 10% | Full audit trail | Every PO traceable from requisition through receipt to payment |

## Inter-Agent Dependencies

### Inputs From Other Agents
| Agent | Entity/Deliverable | Purpose |
|-------|-------------------|---------|
| Execution | Approved budget baseline with WBS structure | Budget availability verification for PO creation |
| Contracts & Compliance | Delegation of Authority matrix | Approval routing and threshold validation |
| Contracts & Compliance | Contract register and vendor agreements | Vendor validation and contractual scope verification |
| Operations | Material requirements from maintenance strategies | Input to purchase requisitions for spares and consumables |
| Asset Management | Equipment and spare parts specifications | Technical specifications for material POs |

### Outputs Consumed By
| Agent | Entity/Deliverable | Purpose |
|-------|-------------------|---------|
| Execution | Commitment register and PO forecasts | Budget execution tracking and cost-at-completion forecasting |
| Contracts & Compliance | PO compliance reports | Contract performance monitoring and vendor evaluation |
| Operations | PO delivery tracking for critical materials | Commissioning and ramp-up scheduling dependencies |
| Orchestrator | PO summary dashboard | Project governance reporting and escalation management |

## References
- `methodology/or-playbook-and-procedures/` — OR procedures and governance frameworks
- `methodology/capital-projects/` — Capital project financial controls and procurement standards
- `methodology/contract-tender-technical-specifications/` — Contract and procurement specification templates
- `methodology/templates/` — Document templates for OR deliverables
- ISO 44001:2017 — Collaborative business relationship management (vendor relationships)
- PMBOK 7th Edition — Procurement Management knowledge area

## Changelog
| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-25 | Initial creation — Wave 2 |
