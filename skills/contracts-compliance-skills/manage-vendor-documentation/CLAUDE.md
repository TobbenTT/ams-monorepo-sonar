---
name: manage-vendor-documentation
description: "Manage vendor documentation packages including manuals, datasheets, and certificates. Triggers: 'vendor documentation', 'vendor manuals', 'documentacion de proveedores'."
---

# Manage Vendor Documentation
## Skill ID: DOC-01
## Version: 1.0.0
## Category: B. Document Management
## Priority: P1 - Critical
## Agent: Agent 2 - Documentation & Knowledge Management

## Purpose

Manage the complete vendor document lifecycle for megaprojects handling 500,000 to 2,000,000+ documents across all engineering, procurement, construction, and commissioning phases. This skill provides end-to-end governance of vendor documentation from initial submittal requirements through final handover to operations, ensuring every document is received, reviewed, approved, registered, and stored in the correct revision with full traceability.

Vendor documentation is the single largest volume of deliverables in capital projects, yet industry data consistently shows that 20-40% of required vendor documents are incomplete or missing at mechanical completion and handover (CII Research Report 2019, Independent Project Analysis benchmarks). This gap creates cascading failures: maintenance cannot develop procedures without vendor manuals, commissioning teams lack test certificates, and operations staff cannot be trained on equipment they have no documentation for. The average cost of poor vendor documentation is estimated at 2-5% of total installed cost (TIC) in rework, delays, and operational inefficiency during the first 2 years of operation.

This skill directly addresses Pain Point OG-03 (Operational Gap - Documentation Completeness) by establishing automated tracking, intelligent follow-up workflows, and predictive analytics to identify documentation gaps before they become critical path items.

## Intent & Specification

The AI agent MUST understand and execute the following core objectives:

1. **Vendor Document Requirement Register (VDRR) Management**: Maintain a comprehensive register of all required vendor documents mapped to purchase orders, equipment tags, and project milestones. The VDRR is the master index -- every document that will be received, reviewed, and handed over must be tracked here. Typical megaproject VDRRs contain 15,000-50,000 line items across 200-500 purchase orders.

2. **Submittal Tracking & Follow-Up Automation**: Track document submittals against contractual deadlines, automatically generate follow-up notifications at 7-day, 14-day, and 30-day overdue thresholds, and escalate to procurement managers when vendors fail to submit. Industry data shows that 35-50% of vendor documents require at least one follow-up before initial submission.

3. **Review Cycle Management**: Manage the technical review cycle including distribution to reviewers, tracking review status, consolidating comments, and returning documents to vendors with review codes (A1-Approved, B2-Approved with Comments, C3-Revise and Resubmit, D4-Rejected). Average review cycle time should be <14 calendar days; this skill tracks and reports on review cycle time compliance.

4. **Revision Control & Supersession**: Maintain strict revision control ensuring that only the latest approved revision is accessible as the "current" version while all previous revisions are archived with full audit trail. The agent must prevent common errors such as distributing superseded revisions or losing track of which revision was approved.

5. **Handover Package Assembly**: Assemble final documentation handover packages (often called "data books" or "vendor data packages") organized by system, equipment, or discipline. Each package must include all required documents at the correct approved revision. Handover readiness is measured as a percentage of required documents received, reviewed, and approved at the correct revision.

6. **Quality & Completeness Analytics**: Provide real-time dashboards and periodic reports on documentation completeness, vendor performance (on-time submission rates), review cycle efficiency, and handover readiness. Flag risks early -- if a vendor's document submission rate is declining, the agent must alert before it becomes critical.

7. **Multi-Format Ingestion**: Handle documents in all common industrial formats including PDF, DWG, DXF, STEP, IGES, native CAD formats, Excel, Word, and specialized formats such as instrument data sheets, P&IDs, and 3D model files. The agent must validate file integrity and format compliance upon receipt.

## Trigger / Invocation

```
/manage-vendor-documentation
```

**Aliases**: `/vendor-docs`, `/vdrr`, `/vendor-data`, `/documentacion-vendedor`

**Trigger Conditions**:
- A new purchase order is issued and vendor document requirements need to be established
- Vendor submits documentation for registration and review
- A document review cycle needs to be initiated or tracked
- Periodic vendor documentation status reporting is required
- Handover package assembly is initiated for a system or area
- User requests vendor documentation completeness analysis
- Overdue document thresholds are exceeded triggering automated follow-up

## Input Requirements

### Mandatory Inputs

| Input | Format | Description |
|-------|--------|-------------|
| Purchase Order Register | .xlsx, .csv | List of all purchase orders with PO numbers, vendor names, equipment scope, contractual document due dates, and document requirement codes |
| Vendor Document Requirement Register (VDRR) | .xlsx | Master register with document codes, titles, required review codes, equipment tag mapping, and milestone due dates. If not provided, agent will generate from PO data |
| Project Document Numbering Procedure | .docx, .pdf | Project-specific document numbering convention and classification system |
| Project Master Document List (MDL) | .xlsx | Overall project document register for cross-referencing and avoiding duplicates |

### Optional Inputs (Enhance Quality)

| Input | Format | Description |
|-------|--------|-------------|
| Vendor Document Submittal Schedule | .xlsx | Vendor-committed document submission schedule per PO |
| Equipment Tag Register | .xlsx | Complete equipment list for tag-to-document mapping validation |
| Project Document Review Matrix | .xlsx | Defines which disciplines review which document types |
| Previous Project VDRR (Lessons Learned) | .xlsx | Historical VDRR from similar project for benchmarking expected document volumes |
| Contractual Data Sheet Requirements | .pdf | Specific data sheet format and content requirements per equipment type |
| Document Handover Specification | .docx | Client/owner specification for final documentation handover format and structure |
| SharePoint/EDMS Configuration | .json | Connection settings for the project document management system |

### Input Validation Rules

- Purchase orders without document requirement codes trigger a warning; agent will apply standard requirements based on equipment type
- Documents received without a valid PO reference are quarantined for manual assignment
- Files exceeding 100MB are flagged for compression or splitting
- Document numbers not matching the project numbering convention are flagged for correction
- Duplicate document numbers across different vendors are blocked and escalated
- Non-searchable PDFs (scanned images without OCR) are flagged for vendor resubmission

## Output Specification

### Primary Output: Vendor Document Status Report (.xlsx)

**Filename**: `{ProjectCode}_VDRR_Status_Report_v{version}_{date}.xlsx`

**Workbook Structure**:

#### Sheet 1: "VDRR Master"

| Column | Field Name | Description | Example |
|--------|-----------|-------------|---------|
| A | VDRR_Line_ID | Unique line item identifier | VDRR-00001 |
| B | PO_Number | Purchase order number | PO-4500-0123 |
| C | Vendor_Name | Vendor/supplier name | Flowserve Corporation |
| D | Equipment_Tag | Associated equipment tag | 100-PP-001A/B |
| E | Document_Number | Project document number | PRJ-FLW-100-PP-001-VD-001 |
| F | Document_Title | Document title | O&M Manual - Centrifugal Pump |
| G | Document_Type_Code | Document type classification | VD-MAN (Vendor Manual) |
| H | Document_Category | IFC/MR/As-Built/Final | Final |
| I | Required_Review_Code | Required review outcome | B2 - Approved with Comments |
| J | Contractual_Due_Date | Contractual submission date | 2026-03-15 |
| K | Vendor_Planned_Date | Vendor committed date | 2026-03-10 |
| L | Actual_Receipt_Date | Actual date received | 2026-03-08 |
| M | Current_Revision | Current revision number | Rev 2 |
| N | Review_Status | Current review status | Under Review |
| O | Review_Code_Issued | Review code issued to vendor | C3 - Revise & Resubmit |
| P | Reviewer_Assigned | Lead reviewer discipline | Mechanical Engineering |
| Q | Review_Due_Date | Review completion deadline | 2026-03-22 |
| R | Review_Cycle_Days | Days in current review cycle | 8 |
| S | Days_Overdue | Days past contractual due | 0 |
| T | Follow_Up_Count | Number of follow-ups sent | 2 |
| U | Handover_Ready | Ready for handover (Y/N) | N |
| V | Comments | Latest status comments | Rev 2 submitted addressing C3 comments |
| W | Risk_Flag | Risk classification | GREEN |

#### Sheet 2: "Dashboard Summary"
Pivot summary showing:
- Overall completeness: Documents received vs. required (count and %)
- Approved at correct revision vs. total required
- Overdue documents by vendor, by age bracket (7/14/30/60/90+ days)
- Review cycle time distribution
- Vendor performance ranking (on-time submission rate)
- Handover readiness by system/area

#### Sheet 3: "Vendor Scorecard"
Per-vendor performance metrics:
- Total documents required vs. submitted vs. approved
- On-time submission rate
- Average review cycles per document (indicates quality of submissions)
- Overdue documents count and aging
- Trend analysis (improving/stable/declining)

#### Sheet 4: "Overdue & At-Risk"
Filtered list of all overdue and at-risk documents:
- Sorted by days overdue (descending)
- Escalation status
- Impact assessment (which downstream activities are affected)
- Recommended actions

#### Sheet 5: "Handover Status"
Per-system handover readiness:
- System/subsystem breakdown
- Required documents per system
- Received and approved count
- Gap list (missing documents)
- Handover readiness percentage
- Projected completion date based on current submission rate

#### Sheet 6: "Follow-Up Log"
Chronological log of all follow-up communications:
- Date, recipient, method (email/meeting), content summary
- Vendor response status
- Next action date

### Secondary Output: Automated Notifications

**Follow-Up Emails** (via mcp-outlook):
- 7-day overdue: Reminder to vendor document controller
- 14-day overdue: Escalation to vendor project manager + internal procurement
- 30-day overdue: Formal notice to vendor commercial manager + internal project manager
- 60-day overdue: Contractual notice with reference to liquidated damages clauses

**Weekly Status Report** (via mcp-sharepoint):
- Automated weekly vendor documentation status summary
- Distributed to project document control, procurement, and engineering leads

### Formatting Standards
- Header row: Bold, dark blue background (#003366), white font
- Risk flags: RED (>30 days overdue), AMBER (7-30 days overdue), GREEN (on track)
- Conditional formatting on Days_Overdue column
- Data validation dropdowns for Review_Status, Review_Code_Issued, Document_Category
- Freeze panes on header row and VDRR_Line_ID column
- Auto-filter enabled on all columns

## Methodology & Standards

### Primary Standards
- **ISO 19650 Series** - Organization and digitization of information about buildings and civil engineering works, including BIM. Applicable to document management workflows in capital projects.
- **ISO 15489-1:2016** - Information and documentation -- Records management. Core standard for document lifecycle management principles.
- **ISO 9001:2015 Section 7.5** - Documented Information. Requirements for creation, updating, and control of documented information.
- **NORSOK Z-001** - Documentation for Operation. Norwegian standard widely adopted in oil & gas for vendor documentation requirements.

### Industry Guidelines
- **CII (Construction Industry Institute) IR-165** - Document Management for Capital Projects. Establishes benchmarks for document volumes, review cycles, and handover completeness.
- **CFIHOS (Capital Facilities Information Handover Specification)** - Standardized data handover specification for owner/operators.
- **DEXPI (Data Exchange in the Process Industry)** - Standard for P&ID data exchange.
- **PIP (Process Industry Practices) PICS001** - Project Document Register standard.

### Review Code Standards (Typical)
| Code | Description | Action Required |
|------|-------------|-----------------|
| A1 | Approved for Design | No further submission required |
| A2 | Approved for Design - Final to Follow | Submit final version |
| B1 | Approved with Comments - No Resubmission | Incorporate comments, no resubmit needed |
| B2 | Approved with Comments - Resubmit | Incorporate comments and resubmit |
| C3 | Revise and Resubmit | Major revision required before approval |
| D4 | Rejected | Rejected - does not meet requirements |

### Document Type Classification
- VD-DWG: Vendor Drawings (GA, sectional, assembly, installation)
- VD-MAN: Vendor Manuals (O&M, installation, maintenance)
- VD-DTS: Vendor Data Sheets (equipment, instrument, valve)
- VD-CAL: Vendor Calculations (structural, thermal, hydraulic)
- VD-CER: Vendor Certificates (material, test, inspection, conformance)
- VD-TST: Vendor Test Reports (FAT, SAT, performance)
- VD-SPL: Vendor Spare Parts Lists
- VD-QAP: Vendor Quality Assurance Plans/Procedures

### Industry Statistics
- Average megaproject generates 500,000-2,000,000 documents across all disciplines
- Vendor documents typically represent 40-60% of total project documentation volume
- 35-50% of first-time vendor submittals receive C3 (Revise & Resubmit) or D4 (Rejected) review codes
- Average review cycle time industry benchmark: 10-14 calendar days
- 20-40% of vendor documents are incomplete at mechanical completion (CII benchmark)
- Documentation deficiencies account for 15-25% of commissioning delays
- Cost of retrieving a single misfiled document: $120 average; cost of recreating a lost document: $220 average (AIIM International)

## Step-by-Step Execution

### Phase 1: VDRR Setup & Configuration (Steps 1-3)

**Step 1: Initialize Vendor Document Requirement Register**
- Parse the Purchase Order Register to extract all POs with equipment scope
- For each PO, determine required document types based on equipment category:
  - Rotating equipment (pumps, compressors): GA drawings, sectional drawings, O&M manuals, performance curves, material certificates, test reports, spare parts lists, data sheets
  - Static equipment (vessels, heat exchangers): GA drawings, fabrication drawings, calculations, material certificates, NDE reports, PWHT records, data sheets, nameplate data
  - Electrical equipment: SLDs, wiring diagrams, O&M manuals, test reports, setting schedules
  - Instrumentation: Loop diagrams, data sheets, calibration certificates, configuration files
  - Piping/valves: Material certificates, test reports, valve data sheets
- Generate VDRR line items with unique IDs, contractual due dates derived from PO delivery dates minus lead time for review
- Validate document numbering against project convention
- Upload VDRR to SharePoint (via mcp-sharepoint) as controlled document

**Step 2: Configure Review Matrix**
- Map each document type to required reviewer disciplines
- Assign primary reviewer and secondary/parallel reviewers
- Set review deadline calculation rules (typically 10-14 calendar days from receipt)
- Configure escalation thresholds and notification recipients
- Establish review code authority levels (who can approve, reject, or issue codes)

**Step 3: Establish Vendor Portals & Submission Channels**
- Configure document submission channels per vendor (email, SharePoint upload, vendor portal)
- Set up automated ingestion rules:
  - Email attachments from registered vendor email addresses are auto-captured
  - SharePoint upload triggers workflow notification
  - File naming convention validation on upload
- Send vendor notification with submission instructions, document numbering requirements, and format specifications
- Register vendor document controller contact information for follow-up automation

### Phase 2: Ongoing Document Management (Steps 4-7)

**Step 4: Document Receipt & Registration**
- For each document received:
  - Validate file integrity (not corrupted, readable, correct format)
  - Validate document number against VDRR (must match an expected document)
  - Check revision: if revision already registered, flag as duplicate or supersession
  - Extract metadata: document title, revision, date, page count, file size
  - For PDFs: verify searchability (OCR check); flag non-searchable PDFs
  - Register in VDRR with receipt date, revision, file location
  - Store document in designated SharePoint library with correct metadata tags
  - Update VDRR status from "Outstanding" to "Received - Pending Review"
  - Notify assigned reviewers that document is ready for review

**Step 5: Review Cycle Management**
- Distribute document to reviewers per Review Matrix
- Set review deadline and send calendar reminder
- Track reviewer progress:
  - Monitor review completion status per reviewer
  - Send reminder at 50% of review period elapsed if no response
  - Send escalation at 80% of review period if not complete
- Consolidate review comments from all reviewers:
  - Merge comment sheets/markups into single consolidated response
  - Resolve conflicting comments between disciplines
  - Assign review code based on most restrictive reviewer recommendation
- Return reviewed document to vendor with consolidated comments and review code
- Update VDRR with review code, review completion date, and review cycle duration
- If C3/D4: track vendor resubmission and repeat review cycle

**Step 6: Overdue Document Follow-Up**
- Daily scan of VDRR for overdue documents (past contractual due date, not received)
- Generate follow-up communications per escalation ladder:
  - **7-day overdue**: Automated email to vendor document controller
    - Subject: "OVERDUE REMINDER: Document {DocNumber} - {DocTitle} - PO {PONumber}"
    - Content: Contractual due date, days overdue, request for submission date commitment
  - **14-day overdue**: Escalated email to vendor project manager + internal procurement lead
    - Include list of all overdue documents for this vendor
    - Request meeting to discuss documentation recovery plan
  - **30-day overdue**: Formal notice to vendor commercial manager
    - Reference contractual obligations and potential consequences
    - Copy internal project manager and contracts team
    - Request formal vendor recovery schedule
  - **60-day overdue**: Contractual notification
    - Formal letter referencing liquidated damages or withholding clauses
    - Copy legal/contracts team
- Log all follow-up communications in Follow-Up Log sheet
- Track vendor responses and committed resubmission dates

**Step 7: Revision Control & Supersession**
- When a new revision is received for an existing document:
  - Archive the previous revision (move to "Superseded" folder, mark as superseded)
  - Register new revision as current in VDRR
  - Update all cross-references and hyperlinks
  - Notify holders of previous revision that it has been superseded
  - If the document was already approved at previous revision, trigger re-review of new revision
- Maintain complete revision history:
  - All revisions retained in archive
  - Revision comparison log (what changed between revisions)
  - Full audit trail of who accessed/downloaded each revision

### Phase 3: Handover Preparation (Steps 8-10)

**Step 8: Handover Readiness Assessment**
- For each system/area approaching handover:
  - Query VDRR for all documents associated with equipment in that system
  - Calculate handover readiness percentage:
    - GREEN: >95% documents received and approved at correct revision
    - AMBER: 80-95% complete
    - RED: <80% complete
  - Identify gap list: all documents still outstanding, under review, or at wrong revision
  - Assess impact of gaps: which gaps are critical for operations/maintenance vs. nice-to-have
  - Generate gap closure plan with realistic dates based on vendor performance history

**Step 9: Data Book Assembly**
- Assemble final vendor data packages per system/equipment:
  - Organize documents per handover specification (typically by system, then equipment, then document type)
  - Verify all documents are at final approved revision
  - Generate table of contents and index
  - Create bookmarked PDF compilation where required
  - Include transmittal cover sheet with document listing and approval signatures
- Validate data book completeness:
  - Cross-check against VDRR: every "required" document must be present
  - Verify file readability and print quality
  - Confirm correct revision for each document
  - Flag any documents included with caveats (e.g., "Approved with Comments" but vendor did not resubmit)

**Step 10: Final Handover Execution**
- Generate handover transmittal for owner/operator acceptance
- Upload final data packages to owner's document management system
- Generate handover completion certificate listing:
  - Total documents handed over
  - Documents pending (with expected dates)
  - Known gaps with risk assessment
  - Outstanding vendor obligations
- Close out VDRR with final status for all line items
- Archive project documentation records per retention policy
- Generate lessons learned report:
  - Vendor performance summary
  - Document types most frequently delayed
  - Review cycle bottlenecks
  - Recommendations for future projects

## Quality Criteria

### Quantitative Thresholds

| Criterion | Target | Minimum Acceptable |
|-----------|--------|-------------------|
| VDRR line item coverage (all POs registered) | 100% | >98% |
| Document receipt tracking accuracy | 100% | >99% |
| Review cycle time (median) | <10 days | <14 days |
| Review cycle time compliance (% within deadline) | >90% | >80% |
| Follow-up automation coverage | 100% | >95% |
| Handover completeness at MC | >95% | >90% |
| Document metadata accuracy | >99% | >97% |
| Revision control accuracy (correct current rev) | 100% | >99.5% |
| Vendor scorecard update frequency | Weekly | Bi-weekly |
| Overdue document response rate (vendor responds within 7 days of follow-up) | >80% | >60% |

### Qualitative Standards

- **Traceability**: Every document must be traceable from PO requirement through receipt, review, approval, and handover. Complete audit trail must be available.
- **Single Source of Truth**: The VDRR is the authoritative register. No parallel tracking spreadsheets should exist. All stakeholders reference the same data.
- **Proactive Risk Management**: The system must predict documentation gaps before they impact downstream activities (commissioning, training, maintenance planning).
- **Vendor Accountability**: Vendor performance data must be objective, factual, and contractually defensible. Avoid subjective assessments.
- **Handover Quality**: Operations and maintenance teams must be able to find any vendor document within 3 minutes of searching the handover package.

### Validation Process
1. Monthly VDRR completeness audit: verify all POs are registered, all expected documents have line items
2. Weekly status report accuracy check: reconcile reported numbers with actual document counts
3. Quarterly vendor scorecard review with procurement team
4. Pre-handover gap analysis at system level (minimum 90 days before planned handover)
5. Post-handover validation: verify owner/operator can access and retrieve all handed-over documents

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents)

| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| Agent 4 - Procurement | Purchase Order data | Provides PO register, vendor contacts, contractual dates, and document requirement specifications |
| `create-asset-register` | Equipment tag register | Provides equipment list for mapping vendor documents to specific equipment tags |
| `create-commissioning-plan` | Commissioning document requirements | Identifies which vendor documents are critical path for commissioning activities |
| Agent 1 - Project Management | Project schedule milestones | Provides milestone dates for calculating document due dates and handover deadlines |

### Downstream Dependencies (Outputs TO other agents)

| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| `generate-operating-procedures` (DOC-02) | Vendor manuals | Provides approved vendor O&M manuals as source material for SOP generation |
| `prepare-pssr-package` (DOC-04) | Vendor certificates & test reports | Provides equipment certificates and test reports needed for PSSR packages |
| `create-maintenance-strategy` | Vendor maintenance recommendations | Provides vendor maintenance manuals and recommended maintenance schedules |
| `create-spare-parts-strategy` | Vendor spare parts lists | Provides approved VRSPLs for spare parts strategy development |
| `create-training-plan` | Vendor training documentation | Provides vendor O&M manuals and training materials for operator training programs |
| Agent 6 - Compliance | Vendor compliance certificates | Provides certificates of conformance, material certificates, and regulatory compliance documentation |

### Peer Dependencies (Collaborative)

| Agent/Skill | Interaction | Description |
|-------------|-------------|-------------|
| `track-document-currency` (DOC-03) | Currency monitoring | Monitors approved vendor documents for currency and flags when updates may be needed post-handover |
| `manage-moc-workflow` (DOC-05) | Change impact | When a MOC affects vendor equipment, triggers review of impacted vendor documentation |

## MCP Integrations

### mcp-sharepoint
- **Read**: Query document libraries for existing vendor documents, retrieve VDRR from project SharePoint site, access review comments stored in SharePoint lists
- **Write**: Upload received vendor documents to designated libraries with metadata, update VDRR status in SharePoint list, publish status reports and dashboards
- **Workflow**: Trigger SharePoint approval workflows for document review cycles, manage document lifecycle states (Draft/Under Review/Approved/Superseded)

### mcp-pdf
- **Read**: Extract metadata from vendor PDF documents (title, author, creation date, page count), perform OCR quality assessment, extract text content for classification
- **Process**: Merge multiple PDFs into data book compilations, add bookmarks and table of contents, validate PDF/A compliance for long-term archival, compress oversized files
- **Validate**: Check PDF searchability, verify page count matches expected, detect corrupted files

### mcp-outlook
- **Send**: Automated follow-up emails to vendors at escalation thresholds, review cycle notifications to internal reviewers, weekly status report distribution
- **Read**: Monitor incoming emails from vendor document controllers for document submissions, parse email attachments for auto-registration
- **Track**: Log all document-related correspondence in follow-up log, track email delivery and read receipts for contractual notifications

## Templates & References

### Templates
- `templates/vdrr_master_template.xlsx` - Blank VDRR with all columns, formatting, and data validation
- `templates/vendor_doc_submittal_instructions.docx` - Template for vendor submission instructions letter
- `templates/document_review_form.xlsx` - Standard document review comment sheet
- `templates/handover_transmittal_template.docx` - Data book handover transmittal cover sheet
- `templates/vendor_scorecard_template.xlsx` - Vendor documentation performance scorecard
- `templates/overdue_follow_up_email_templates.docx` - Email templates for 7/14/30/60-day follow-ups

### Reference Documents
- ISO 19650 Series - Information management using BIM
- ISO 15489-1:2016 - Records management
- NORSOK Z-001 - Documentation for Operation
- CII IR-165 - Document Management for Capital Projects
- CFIHOS Data Handover Specification
- Project-specific Document Management Plan
- Project-specific Document Numbering Procedure

### Reference Datasets
- Standard vendor document requirement matrices by equipment type
- Review code definitions and usage guidelines
- Document type classification taxonomy
- Vendor contact register template
- Industry benchmark data for vendor documentation volumes per equipment type

## Examples

See [`references/skill-examples.md`](references/skill-examples.md) for detailed examples.
