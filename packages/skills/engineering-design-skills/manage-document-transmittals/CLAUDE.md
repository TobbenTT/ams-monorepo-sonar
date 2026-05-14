---
name: manage-document-transmittals
description: "Manage the formal transmittal process for engineering documents between project stakeholders. Track document distribution, receipt acknowledgment, revision supersedure, and IFC issue control. Triggers: 'document transmittal', 'transmittal register', 'document distribution', 'transmision de documentos', 'registro de transmittals', 'distribucion de documentos'."
---

# Manage Document Transmittals
## Skill ID: manage-document-transmittals
## Version: 1.0.0
## Category: D - Monitoring
## Priority: High

## Purpose
Manages the formal transmittal process for engineering documents between all project stakeholders -- owner, EPCM consultant, EPC contractors, sub-contractors, vendors, and regulatory authorities. In capital projects for mining, oil & gas, chemicals, and energy sectors, a document transmittal is the legally recognized mechanism for formally issuing engineering documents from one party to another. The transmittal establishes the chain of custody, confirms receipt, and creates the auditable record that a specific document at a specific revision was delivered to the intended recipient on a specific date.

Poor transmittal management is a pervasive problem on large LATAM projects where multiple engineering offices (often in different countries and time zones) produce documents simultaneously. Common failures include: construction crews working from superseded drawings, procurement packages missing critical specification updates, vendors not receiving approved-for-fabrication documents in time to meet delivery schedules, and commissioning teams lacking the IFC (Issued for Construction) documentation package. Each of these failures translates directly into rework, delays, and cost overruns.

This skill produces and maintains the master transmittal register, manages the document distribution matrix (which documents go to which parties), tracks receipt acknowledgment, enforces revision supersedure discipline (ensuring outdated revisions are formally withdrawn), and controls the IFC/AFC (Approved for Construction) issue process. The output integrates with the Execution agent's construction work package system, the Contracts agent's vendor document management, and the Orchestrator's project reporting.

For Chilean projects, the skill manages transmittals to regulatory authorities (SERNAGEOMIN, SEC, SISS, SMA) as distinct transmittal streams with specific compliance tracking requirements, ensuring that regulatory submissions maintain proper version control and acknowledgment trails.

On projects with 5,000+ engineering documents, transmittal volumes can reach 50-100 per week during peak detailed design. Without systematic management, the probability of a construction-impacting document distribution error approaches certainty. Industry data from CII indicates that 30% of construction rework on large projects is attributable to using incorrect or outdated documents, with transmittal failures being the primary root cause.

### Purpose Code Definitions
| Code | Name | Recipient Obligation |
|------|------|---------------------|
| IFR | Issued for Review | Review and return comments within contractual timeline |
| IFA | Issued for Approval | Formally approve or reject within contractual timeline |
| IFC | Issued for Construction | Authorized for use in field construction activities |
| AFC | Approved for Construction | Client-approved version authorized for construction |
| IFI | Issued for Information | Receive and file; no formal action required |
| IFQ | Issued for Quotation | Use as basis for vendor/contractor quotation |

## Intent & Specification
The AI agent MUST understand that:

1. **A Transmittal is a Legal Record**: In the EPC/EPCM contracting model, the transmittal document (not just the attachment) is the legal proof of document delivery. The transmittal letter specifies the purpose code (e.g., "Issued for Review," "Issued for Approval," "Issued for Construction," "Issued for Information"), which determines the recipient's obligation to act. The agent must treat transmittals as formal correspondence, not informal file sharing.
2. **The Distribution Matrix Defines Who Gets What**: The project document distribution matrix specifies which parties receive which document types at which purpose codes. The agent must enforce this matrix to prevent both omissions (critical stakeholder not receiving a document) and information overload (parties receiving documents irrelevant to their scope).
3. **Revision Supersedure is Safety-Critical**: When a new revision of a document is transmitted, all previous revisions must be formally superseded. The agent must track supersedure and flag any instances where a recipient may be working from an outdated revision, particularly for construction IFC documents.
4. **Acknowledgment Tracking is Mandatory**: Every transmittal requires a receipt acknowledgment from the recipient. Outstanding acknowledgments must be tracked and escalated because unacknowledged transmittals create legal ambiguity about whether a party was formally informed of a document change.
5. **IFC/AFC Issue is the Final Gate**: The "Issued for Construction" transmittal is the formal authorization for construction to use a document in the field. IFC documents must pass through all required approval cycles (design review, client approval, regulatory approval where applicable) before IFC transmittal. The agent must enforce this gate.

## Trigger / Invocation
```
/manage-document-transmittals
```

### Natural Language Triggers
- "Create a transmittal for the 60% piping deliverables"
- "Track outstanding transmittal acknowledgments"
- "Issue documents for construction to the contractor"
- "Crear un transmittal para los entregables de piping al 60%"
- "Dar seguimiento a acuses de recibo de transmittals pendientes"
- "Emitir documentos para construccion al contratista"

## Input Requirements

### Required Inputs
| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `document_register` | Master document register with all engineering deliverables, revisions, and approval status | .xlsx / .csv | Document Control |
| `distribution_matrix` | Document distribution matrix defining recipients per document type and purpose code | .xlsx | Document Control / Project Manager |
| `transmittal_purpose` | Purpose code for this transmittal (IFR, IFA, IFC, IFI, IFQ, AFC) | Text | User / Engineering Lead |
| `recipient_list` | Target recipients for this transmittal batch with contact details | Text / .xlsx | Distribution Matrix / User |
| `document_list` | Specific documents and revisions to include in this transmittal | .xlsx / text | Engineering Lead / User |

### Optional Inputs
| Input | Description | Default |
|-------|-------------|---------|
| `previous_transmittal_register` | Existing transmittal register for continuation | Create new register |
| `cover_letter_template` | Project-specific transmittal cover letter template | VSC standard transmittal format |
| `regulatory_submission_requirements` | Requirements for regulatory authority transmittals (format, copies, language) | Chilean regulatory standard format |

### Context Enrichment
The agent should automatically:
- Cross-reference the document list against the document register to verify that each document is at the correct revision and approval status for the intended purpose code
- Check that documents marked for IFC transmittal have completed all required approval cycles (design review sign-off, client approval where required)
- Verify the distribution matrix to ensure all required recipients for the given document types are included in the transmittal
- Retrieve any outstanding acknowledgments from previous transmittals to the same recipients for follow-up
- Identify any documents in the transmittal batch that supersede previously transmitted revisions, triggering formal supersedure notices

## Output Specification

### Document: Transmittal Package & Register
**Filename**: `VSC_Transmittal_{ProjectCode}_{TransmittalNo}_{Date}.docx` (cover letter)
**Filename**: `VSC_TransmittalRegister_{ProjectCode}_{Version}_{Date}.xlsx` (master register)

**Sheets**:

#### Sheet 1: Master Transmittal Register
| Column | Description |
|--------|-------------|
| Transmittal Number | Unique sequential identifier (e.g., VSC-PRJ01-TRN-0145) |
| Date Issued | Date the transmittal was dispatched |
| Sender Organization | Originating organization (e.g., VSC, EPC Contractor, Vendor) |
| Sender Name | Name of person issuing the transmittal |
| Recipient Organization | Receiving organization |
| Recipient Name | Name of addressee |
| Purpose Code | IFR (Review) / IFA (Approval) / IFC (Construction) / IFI (Information) / IFQ (Quotation) / AFC (Approved for Construction) |
| Action Required | Review & Comment / Approve / Use for Construction / Information Only / Quote |
| Document Count | Number of documents in this transmittal |
| Response Due Date | Date by which acknowledgment or action is required |
| Acknowledgment Status | Acknowledged / Overdue / Pending |
| Acknowledgment Date | Date receipt was acknowledged |
| Comments Received | Yes / No -- whether comments were returned with acknowledgment |

#### Sheet 2: Document-Level Tracking
| Column | Description |
|--------|-------------|
| Transmittal Number | Reference to the transmittal |
| Document Number | Engineering document number |
| Document Title | Document title |
| Discipline | Owning discipline |
| Revision | Revision transmitted |
| Pages/Sheets | Number of pages or drawing sheets |
| Format | PDF / DWG / DGN / Native / Hard Copy |
| Purpose Code | Purpose code for this specific document (may differ from transmittal default) |
| Supersedes Revision | Previous revision that this document supersedes (if applicable) |
| Previous Transmittal | Transmittal number of the superseded revision |

#### Sheet 3: Acknowledgment Tracker
| Column | Description |
|--------|-------------|
| Transmittal Number | Transmittal reference |
| Recipient Organization | Receiving organization |
| Recipient Name | Individual addressee |
| Expected Acknowledgment Date | Contractual response deadline |
| Actual Acknowledgment Date | Date acknowledgment received |
| Acknowledged By | Name and title of person acknowledging |
| Comments/Queries | Any comments or queries submitted with acknowledgment |
| Follow-Up Status | On Time / Reminder Sent / Escalated / Overdue |
| Reminder Count | Number of reminders issued |

#### Sheet 4: Supersedure Register
| Column | Description |
|--------|-------------|
| Document Number | Engineering document number |
| Superseded Revision | Previous revision being withdrawn |
| Superseded Transmittal | Transmittal reference for the previous revision |
| Superseding Revision | New revision replacing the previous |
| Superseding Transmittal | Transmittal reference for the new revision |
| Supersedure Date | Date the supersedure was formally processed |
| Recipients Notified | List of recipients notified of supersedure |
| Field Withdrawal Confirmed | Yes / No -- for IFC documents, confirmation that superseded revision removed from field |

#### Sheet 5: IFC Issue Control Log
| Column | Description |
|--------|-------------|
| Document Number | IFC document number |
| Document Title | Document title |
| Discipline | Engineering discipline |
| IFC Revision | Revision issued for construction |
| IFC Date | Date of IFC transmittal |
| Transmittal Number | IFC transmittal reference |
| Construction Contractor | Contractor receiving the IFC document |
| Field Distribution Confirmed | Yes / No -- site document control confirmation |
| Field Copy Locations | Distribution points (construction trailer, control room, workshop) |
| IFC Hold | Yes / No -- any hold or condition on use |
| Hold Description | Description of hold condition if applicable |
| Construction Need Date | Date by which construction requires this document |
| Lead/Lag (Days) | Days between IFC issue and construction need date (negative = late) |

#### Sheet 6: Regulatory Transmittal Log
| Column | Description |
|--------|-------------|
| Transmittal Number | Transmittal reference for regulatory submission |
| Regulatory Authority | SERNAGEOMIN / SEC / SISS / SMA / Municipalidad / Other |
| Submission Type | Initial Submission / Revision / Response to Comments / Final Approval Package |
| Document List | Documents included in the regulatory submission |
| Submission Date | Date submitted to the authority |
| Authority Reference Number | Reference number assigned by the authority |
| Authority Acknowledgment | Date authority acknowledged receipt |
| Authority Response | Approved / Comments Received / Rejected / Pending |
| Response Due Date | Expected response date per regulatory timeline |
| Compliance Status | Submitted / Under Review / Approved / Action Required |

### Key Metrics
| Metric | Description | Target |
|--------|-------------|--------|
| Transmittal Cycle Time | Days from document ready-to-issue to transmittal dispatch | <= 2 working days |
| Acknowledgment Response Rate | % of transmittals acknowledged within 5 working days | >= 95% |
| Supersedure Compliance | % of superseded revisions formally withdrawn upon new revision issue | 100% |
| IFC Completeness | % of construction-required documents transmitted as IFC before field need date | >= 98% |
| Distribution Matrix Compliance | % of transmittals matching the required distribution matrix | 100% |

## Procedure

### Step 1: Transmittal Preparation and Validation
- Receive the request to transmit a set of documents, identifying the purpose code, recipient(s), and document list
- Validate each document against the document register: verify the document number exists, the revision cited is the current revision, and the approval status is compatible with the purpose code (e.g., a document cannot be issued IFC if it has not been approved)
- For IFC transmittals, perform the IFC readiness check: design review complete (all Critical/Major comments closed), client approval obtained (if required), and regulatory approval obtained (if applicable)
- Cross-reference the recipient list against the distribution matrix to verify completeness; flag any required recipients missing from the transmittal or any recipients included who should not receive this document type
- Identify any documents in the batch that supersede previously transmitted revisions; prepare supersedure notices for inclusion
- Assign the next sequential transmittal number following the project convention (e.g., VSC-{ProjectCode}-TRN-{Sequential})
- Assemble the transmittal cover letter using the project template with all required metadata

### Step 2: Transmittal Issue and Distribution
- Generate the transmittal cover letter with: project name and number, transmittal number, date of issue, originator (with signature block), recipient (with distribution list), purpose code and action required, document listing with revision and page count, and any special instructions or notes
- Attach all documents in the specified format (PDF for review/information, native format for IFC where contractually required)
- For physical transmittals (still required for some regulatory submissions and certain LATAM clients), prepare hard copy packages with correct number of copies per the distribution matrix
- Issue the transmittal through the project document management system (EDMS) with electronic tracking and notification
- Record the transmittal in the master transmittal register with: transmittal number, date issued, sender, recipient, purpose code, document count, and expected acknowledgment date
- For multi-recipient transmittals, track each recipient separately to ensure individual acknowledgment
- For IFC transmittals to construction, coordinate with the site document control office to confirm field distribution

### Step 3: Acknowledgment Tracking and Follow-Up
- Monitor acknowledgment receipts against the expected response timeline (standard: 5 working days for review/information, 10 working days for approval, 2 working days for IFC)
- Record each acknowledgment in the tracker with: date received, acknowledging party name and title, and any comments or questions received with the acknowledgment
- For overdue acknowledgments, initiate the follow-up sequence: Day 5 -- first reminder to recipient; Day 8 -- second reminder with copy to recipient's project manager; Day 10 -- escalation per protocol
- For IFC transmittals where construction activity depends on the document, flag overdue acknowledgments as construction critical and escalate immediately
- Track any comments or queries received with acknowledgments; route technical queries to the originating discipline for response
- Maintain the acknowledgment dashboard showing: % acknowledged on time, % overdue by recipient, and aging analysis of outstanding acknowledgments
- Generate the weekly outstanding acknowledgment report for distribution to project management

### Step 4: Revision Supersedure Management
- When a new revision of a document is transmitted, automatically identify all previous transmittals that included earlier revisions of that document
- Generate formal supersedure notices to all recipients of the previous revision, informing them that the revision they hold is superseded and should be replaced with the new revision
- Update the supersedure register with: document number, superseded revision (and its transmittal reference), superseding revision (and its transmittal reference), date of supersedure, and recipient confirmation
- For IFC documents, coordinate with site document control to ensure physical withdrawal of superseded revisions from field document holders (construction trailers, control rooms, workshops)
- Flag any instances where a superseded revision has been acknowledged but the new revision has not yet been acknowledged by the same recipient -- this indicates a potential gap where the recipient may still be using the old revision
- For construction-critical documents, verify that the field copy register has been updated to reflect the current revision at all distribution points
- Track cumulative supersedure history per document to support as-built documentation compilation

### Step 5: Reporting, Metrics, and Archival
- Generate the periodic transmittal status report (weekly) including: transmittals issued this period, cumulative transmittals, acknowledgment status summary, overdue acknowledgments, IFC status, and supersedure activity
- Calculate and publish transmittal KPIs: average transmittal cycle time (request to dispatch), acknowledgment response rate by recipient, supersedure compliance rate, and IFC completeness against construction need dates
- Identify recipients with consistently poor acknowledgment performance for project management attention
- Maintain the archive of all transmittal cover letters, acknowledgments, and supersedure notices as part of the project permanent record
- For regulatory transmittals, maintain a separate compliance log showing: submission date, authority acknowledgment, any authority comments, and response status
- Feed transmittal metrics into the Orchestrator agent for project reporting and the Execution agent for construction readiness assessment
- At project completion, generate the final transmittal register as part of the project closeout documentation package

## Failure Modes & Common Pitfalls

| Failure Mode | Root Cause | Prevention Strategy |
|-------------|------------|---------------------|
| Construction using superseded drawings | Supersedure process not executed or field copy register not updated | Automated supersedure notice generation; mandatory field copy register verification for IFC documents |
| Critical recipient missing from transmittal | Distribution matrix incomplete or not followed for ad-hoc transmittals | System-enforced distribution matrix check before transmittal issue; no override without engineering manager approval |
| IFC documents issued without approval | Schedule pressure bypassing approval workflow | Hard block in system: IFC purpose code requires approved status in document register; no exceptions |
| Unacknowledged transmittals creating legal ambiguity | Recipients not responding to acknowledgment requests | Automated reminder escalation sequence; weekly management reporting of outstanding acknowledgments |
| Wrong revision transmitted | Manual selection of documents includes incorrect revision | System auto-populates current revision from document register; manual override requires justification |
| Transmittal numbering duplicated or out of sequence | Multiple document controllers issuing transmittals simultaneously without coordination | Centralized transmittal numbering system with automatic sequential assignment; no manual number creation |
| Regulatory submission without proper tracking | Regulatory transmittal mixed with standard project transmittals | Separate transmittal stream for regulatory submissions with dedicated tracking and compliance log |

## Escalation Protocols

| Trigger | Timeline | Escalation Path |
|---------|----------|-----------------|
| IFC document not approved but construction needs it within 5 days | Immediately upon identification | Engineering Manager -> Project Manager -> Construction Manager (coordinate conditional release or schedule adjustment) |
| Acknowledgment overdue from external party (client, contractor, vendor) | 10 working days after transmittal | Project Manager -> counterpart Project Manager at receiving organization |
| Superseded IFC drawing still in use at construction site | Immediately upon discovery | Construction Manager -> Document Control Lead -> Engineering Manager |
| Distribution matrix violation (required recipient missed) | Within 1 day of discovery | Document Control Lead -> Engineering Manager |
| Regulatory transmittal acknowledgment overdue | 15 working days past submission | Compliance Lead -> Project Director -> Client Regulatory Affairs |
| Transmittal system outage preventing issue of critical documents | Immediately | IT/Systems Lead -> Project Manager (implement manual backup procedure) |
| Vendor not acknowledging approved-for-fabrication drawings | 5 working days past transmittal | Procurement Lead -> Vendor -> Contracts Manager |

## Quality Criteria

| Dimension | Weight | Target | Measurement |
|-----------|--------|--------|-------------|
| Technical Accuracy | 30% | 100% | Correct document numbers, revisions, purpose codes, and recipient assignments on every transmittal |
| Completeness | 25% | 100% | All required documents included; all required recipients covered; all supersedures processed |
| Consistency | 15% | >95% | Transmittal format, numbering, and purpose code usage uniform across all project transmittals |
| Format | 10% | 100% | Professional transmittal cover letter per VSC/project template; readable document listing |
| Actionability | 10% | >95% | Purpose code and action required clearly stated; recipient knows exactly what to do with the documents |
| Traceability | 10% | 100% | Every document delivery traceable to a specific transmittal number with date, sender, recipient, and acknowledgment |

## Inter-Agent Dependencies

### Inputs From
| Agent | Input Provided | Criticality |
|-------|---------------|-------------|
| All Engineering Disciplines | Completed documents ready for transmittal with approval status | Critical |
| Execution | Construction need dates for IFC documents, construction work package document requirements | Critical |
| Contracts & Compliance | Vendor document submission requirements, contractor document distribution obligations | High |
| Orchestrator | Project reporting requirements, stakeholder communication preferences | Medium |
| HSE | Regulatory submission requirements and compliance tracking criteria | High |

### Outputs Consumed By
| Agent | Output Provided | Trigger |
|-------|----------------|---------|
| Execution | IFC document transmittal status, construction document readiness reports | Automatic |
| Orchestrator | Transmittal metrics, document distribution KPIs, outstanding acknowledgment status | Automatic weekly |
| Contracts & Compliance | Vendor transmittal status, contractor document receipt confirmation | On request |
| Construction | IFC document package with confirmed field distribution | Automatic upon IFC transmittal |
| Asset Management | Document revision history and transmittal trail for as-built compilation | On request at project closeout |

## References

### Methodology References
- `methodology/or-playbook-and-procedures/` -- VSC OR Playbook for document control and transmittal procedures
- `methodology/capital-projects/` -- Capital project document management standards and EDMS requirements
- `methodology/templates/` -- Transmittal cover letter templates and distribution matrix templates
- `docs/architecture/_legacy/multi-agent-architecture.md` -- Multi-agent architecture for document flow coordination

### Industry Standards
- **ISO 19650-1/2** -- Organization and digitization of information about buildings and civil engineering works (document exchange standards)
- **ISO 16016** -- Technical product documentation - Protection notices for restricting the use of documents and products
- **AACE 25R-03** -- Estimating Lost Labor Productivity in Construction Claims (document-related delay quantification)
- **PIP PRDMC001** -- Document Numbering (Process Industry Practices standard for document identification)
- **DS 132 (SERNAGEOMIN)** -- Chilean mining safety regulation document submission and record-keeping requirements

## Changelog
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-25 | VSC Engineering | Initial creation -- Wave 3 |
