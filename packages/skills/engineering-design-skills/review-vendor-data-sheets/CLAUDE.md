---
name: review-vendor-data-sheets
description: "Review vendor technical submissions against project specifications and the Vendor Document Requirements List (VDRL). Apply standardized A/B/C/D review codes and track resubmission cycles to ensure vendor documentation meets project standards. Triggers: 'vendor data review', 'VDRL', 'vendor document review', 'revision de datos de proveedor', 'revision de documentos de vendor', 'VDRL cumplimiento'."
---

# Review Vendor Data Sheets
## Skill ID: review-vendor-data-sheets
## Version: 1.0.0
## Category: B - Analysis
## Priority: Critical

## Purpose
Reviews vendor technical submissions (data sheets, GA drawings, performance curves, O&M manuals, test certificates, and quality documentation) against project specifications and the Vendor Document Requirements List (VDRL). Applies standardized review disposition codes (A: Approved / B: Approved with Comments / C: Revise and Resubmit / D: Rejected) and tracks resubmission cycles until all vendor documents achieve acceptable status.

In capital projects for mining, oil & gas, chemicals, and energy sectors, vendor documentation is the bridge between engineering design intent and manufactured/delivered equipment. Incomplete or non-compliant vendor documentation results in equipment that does not meet process requirements, instruments that cannot be calibrated to specification, spare parts that cannot be identified for initial stocking, and maintenance procedures that are unavailable at commissioning. On large LATAM projects, vendor document review is frequently the bottleneck in the procurement-to-construction pipeline because of the sheer volume of submissions (thousands of documents across dozens of vendors), the technical depth required for meaningful review, and the multi-cycle resubmission process.

This skill systematizes the vendor document review process by verifying each submission against the project specification requirements, the VDRL deliverable list, and applicable industry codes/standards. It generates structured review comment sheets with actionable feedback, tracks review cycle status for every vendor document, and produces vendor documentation compliance dashboards that feed into procurement progress reporting.

For Chilean projects, the skill verifies that vendor documentation includes certifications required by local regulatory authorities (SEC for electrical equipment, SERNAGEOMIN for mining-specific equipment, and NCh/INN standards compliance where applicable), preventing importation and installation delays caused by missing certifications discovered at customs or during commissioning.

## Intent & Specification
The AI agent MUST understand that:

1. **The VDRL Defines the Contractual Obligation**: The Vendor Document Requirements List (VDRL) is a contractual document that specifies every document the vendor must submit, the submission milestone, the number of copies, the format, and the review cycle requirements. A vendor has not fulfilled their documentation obligation until every VDRL line item is at Code A or B status. The agent must track compliance against the complete VDRL, not just documents received.
2. **Review Codes Have Specific Meanings**: Code A (No Exceptions Taken) means the document is approved without comment; Code B (Approved -- Noted Exceptions) means approved but vendor must incorporate minor comments in final revision; Code C (Revise and Resubmit) means the document has significant deficiencies requiring resubmission and re-review; Code D (Rejected -- Not Approved) means fundamental non-compliance requiring complete rework. The agent must apply codes consistently based on the severity of identified deficiencies.
3. **Technical Review Must Be Substantive**: Vendor document review is not an administrative check. Each data sheet must be technically verified against the project specification: process conditions match, material selections are correct for the service, dimensional data is compatible with the plant layout, and performance guarantees meet the design requirements. The agent must verify technical content, not just document completeness.
4. **Resubmission Cycles Must Be Managed**: Vendor documents typically go through 2-4 review cycles before achieving Code A/B status. Each cycle introduces schedule risk. The agent must track cycle count per document, identify vendors with excessive resubmission rates, and flag documents approaching the procurement-critical date without achieving acceptable status.
5. **As-Built Vendor Data is an OR Deliverable**: The final as-built vendor documentation package (certified data sheets, final GA drawings, test certificates, O&M manuals, spare parts lists) is a critical input for the Operations and Asset Management agents. The agent must track the as-built documentation completeness as a distinct milestone separate from engineering review completion.

## Trigger / Invocation
```
/review-vendor-data-sheets
```

### Natural Language Triggers
- "Review the vendor data sheet submission for pump package PK-2101"
- "Check VDRL compliance status for all mechanical vendors"
- "Track vendor document resubmission cycles and overdue items"
- "Revisar la entrega de datos tecnicos del proveedor del paquete de bombas PK-2101"
- "Verificar estado de cumplimiento VDRL para proveedores mecanicos"
- "Dar seguimiento a ciclos de re-envio de documentos de proveedores"

## Input Requirements

### Required Inputs
| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `vendor_submission` | Vendor document package submitted for review (data sheets, drawings, calculations, etc.) | .pdf / .xlsx / .dwg | Vendor via Contracts Agent |
| `project_specification` | Project technical specification against which the vendor document is reviewed | .pdf / .docx | Engineering Lead |
| `vdrl` | Vendor Document Requirements List defining all required vendor deliverables | .xlsx | Contracts Agent / Document Control |
| `purchase_order` | Purchase order with technical requirements and contractual delivery milestones | .pdf / .xlsx | Contracts Agent |

### Optional Inputs
| Input | Description | Default |
|-------|-------------|---------|
| `previous_review_comments` | Review comment sheet from prior submission cycle for tracking comment incorporation | First submission assumed |
| `equipment_datasheet` | Project equipment data sheet for cross-reference against vendor data | Extract requirements from project specification |
| `vendor_quality_plan` | Vendor's quality plan and inspection/test plan (ITP) | Request via Contracts agent if not provided |
| `regulatory_certification_list` | List of certifications required for Chilean import/installation (SEC, SERNAGEOMIN, NCh) | VSC LATAM certification checklist |

### Context Enrichment
The agent should automatically:
- Retrieve the full VDRL for the vendor/purchase order to determine which documents are outstanding and which are under review
- Cross-reference the submitted document list against the VDRL line items to identify missing submissions
- Pull the project specification requirements relevant to the equipment being reviewed (process conditions, material requirements, performance criteria)
- Check the procurement schedule to determine criticality of this review relative to fabrication/delivery milestones
- Verify whether the equipment requires specific Chilean regulatory certifications (electrical: SEC Type Certificate; mining: SERNAGEOMIN approval; structural: NCh seismic compliance)

## Output Specification

### Document: Vendor Document Review Package
**Filename**: `VSC_VendorReview_{ProjectCode}_{PONumber}_{DocNumber}_{Cycle}_{Date}.xlsx`

**Sheets**:

#### Sheet 1: Review Summary
| Column | Description |
|--------|-------------|
| Vendor Name | Equipment vendor/manufacturer name |
| PO Number | Purchase order reference |
| Equipment Tag(s) | Equipment tag number(s) covered by this document |
| Document Number | Vendor document number |
| Document Title | Document title |
| Document Type | Data Sheet / GA Drawing / Calculation / O&M Manual / Test Procedure / Spare Parts List / Certification |
| Submission Cycle | 1st / 2nd / 3rd / etc. |
| Date Received | Date vendor submission was received |
| Date Review Completed | Date review was completed and returned |
| Turnaround Days | Working days between receipt and return |
| Reviewer Name | Lead reviewer name |
| Reviewer Discipline | Engineering discipline of the reviewer |
| Overall Disposition | A (No Exceptions) / B (Approved - Noted Exceptions) / C (Revise and Resubmit) / D (Rejected) |
| Critical Comments | Count of Critical severity comments |
| Major Comments | Count of Major severity comments |
| Minor Comments | Count of Minor severity comments |
| Deviations Flagged | Number of specification deviations identified |
| Next Action | Vendor resubmits / Incorporate in final revision / Close / Escalate |

#### Sheet 2: Technical Review Comment Sheet
| Column | Description |
|--------|-------------|
| Comment Number | Unique sequential comment identifier |
| Document Page/Section | Specific location in the vendor document |
| Specification Clause | Corresponding project specification clause reference |
| Severity | Critical / Major / Minor |
| Comment Description | Detailed description of the deficiency or issue |
| Recommended Action | What the vendor must do to resolve the comment |
| Vendor Response | Vendor's response to the comment (filled in resubmission cycle) |
| Response Accepted | Yes / No / Partially |
| Verification Evidence | Reference to revised document showing comment incorporation |
| Status | Open / Responded / Verified Closed / Carried Forward |
| Cycle Originated | Submission cycle when this comment was first raised |

#### Sheet 3: Specification Compliance Matrix
| Column | Description |
|--------|-------------|
| Item Number | Sequential requirement number |
| Specification Section | Section of the project specification |
| Requirement Description | Specific requirement statement from the project specification |
| Specified Value | Required value per project specification (with units) |
| Vendor Offered Value | Value offered by vendor in their submission (with units) |
| Compliance Status | Compliant / Deviation / Non-Compliant / Not Addressed |
| Deviation Description | For deviations: description of how vendor offering differs |
| Deviation Acceptance | Accepted / Rejected / Under Review (for deviations only) |
| Comment Reference | Reference to comment sheet item if non-compliant |
| Verification Source | Page/section of vendor document where compliance is verified |

#### Sheet 4: VDRL Status Tracker
| Column | Description |
|--------|-------------|
| VDRL Line Item | Sequential VDRL item number |
| Document Type | Type of vendor document required |
| Description | Document description |
| Contractual Milestone | When the vendor must submit per PO (With Order / Before Fabrication / Before Shipment / With Shipment) |
| Copies Required | Number of copies (hard/soft) per contract |
| Format Required | PDF / Native / Hard Copy |
| First Submission Date | Date of initial vendor submission |
| Current Cycle | Current review cycle number |
| Current Disposition | A / B / C / D / Not Yet Submitted |
| Target Completion Date | Date by which Code A/B must be achieved |
| Days to Target | Working days remaining to target |
| Status | On Track / At Risk / Overdue / Complete |

#### Sheet 5: Resubmission Cycle History
| Column | Description |
|--------|-------------|
| Document Number | Vendor document number |
| Cycle Number | Submission cycle (1, 2, 3, etc.) |
| Submission Date | Date vendor submitted this cycle |
| Review Return Date | Date review comments were returned |
| Disposition Code | A / B / C / D for this cycle |
| Critical Comments | Count of critical comments this cycle |
| Major Comments | Count of major comments this cycle |
| Minor Comments | Count of minor comments this cycle |
| Prior Comments Resolved | Count of previous cycle comments resolved in this submission |
| Prior Comments Outstanding | Count of previous cycle comments NOT resolved |
| Cumulative Cycles | Running total of review cycles for this document |

#### Sheet 6: Certification Compliance Register
| Column | Description |
|--------|-------------|
| Equipment Tag | Equipment tag requiring certification |
| Certification Type | Type Certificate / Test Certificate / Material Certificate / Welding Certificate / Hazardous Area Certificate / Seismic Certificate |
| Issuing Authority | SEC / SERNAGEOMIN / IECEx / ATEX Notified Body / Material Lab / Welding Inspector |
| Regulation/Standard | Specific regulation or standard requiring this certification |
| Required For | Customs clearance / Installation permit / Commissioning / Regulatory compliance |
| Submission Status | Submitted / Not Yet Submitted / Not Applicable |
| Review Status | Acceptable / Not Acceptable / Under Review |
| Expiry Date | Certification expiry date (if applicable) |
| Comments | Any notes regarding certification adequacy or gaps |

### Key Metrics
| Metric | Description | Target |
|--------|-------------|--------|
| Review Turnaround Time | Days from vendor submission receipt to review comment return | <= 10 working days (contractual standard) |
| First-Pass Approval Rate | % of vendor documents achieving Code A or B on first submission | >= 60% (benchmark for competent vendors) |
| Average Resubmission Cycles | Mean number of review cycles per document to reach Code A/B | <= 2.5 cycles |
| VDRL Completion Rate | % of VDRL line items at Code A or B status | 100% before equipment shipment |
| Overdue Submission Rate | % of VDRL items not submitted by contractual milestone | <= 5% |

## Procedure

### Step 1: Submission Receipt and Cataloguing
- Receive the vendor document submission package from the Contracts agent or directly from the project EDMS
- Log the submission in the VDRL tracker: vendor name, PO number, equipment tag, document number, document title, revision, submission date, and submission cycle number
- Verify that the submission matches a VDRL line item; flag any unrequested documents (vendor submitting documents not on the VDRL) and any VDRL items still outstanding
- Check document format compliance: correct file format (PDF, native, as specified), legible quality, correct language (English with Spanish translation where contractually required), and correct document numbering per vendor document numbering convention
- Determine the review priority based on procurement schedule: equipment with imminent fabrication start dates are prioritized; long-lead items already in fabrication may require expedited review
- Assign the review to the appropriate discipline reviewer(s) based on document type: data sheets to process/mechanical engineering, GA drawings to piping/layout, electrical data to electrical engineering, I&C data sheets to instrument engineering
- Start the review turnaround time clock per contractual requirements (typically 10-15 working days from receipt)

### Step 2: Technical Specification Compliance Verification
- Construct the specification compliance matrix by extracting each verifiable requirement from the project specification and purchase order technical requirements
- For each specification requirement, identify the corresponding value or statement in the vendor document and record: specified requirement, vendor-offered value, and compliance status
- For process data sheets: verify design pressure, design temperature, operating pressure, operating temperature, flow rate, fluid composition, material of construction, and nozzle schedule against the project equipment data sheet
- For mechanical data sheets: verify design code compliance (ASME, API, EN, etc.), material certifications, welding procedures, NDE requirements, pressure test requirements, and dimensional data
- For GA (General Arrangement) drawings: verify overall dimensions against plot plan/layout, nozzle orientations, maintenance access clearances, lifting points, foundation bolt pattern, and interface connections
- For electrical equipment: verify voltage, frequency, power rating, enclosure rating (IP/NEMA), hazardous area certification (ATEX/IECEx), cable entry requirements, and control wiring diagrams
- For instrument data sheets: verify process connection, range, output signal, accuracy class, wetted material, and calibration requirements against the instrument specification

### Step 3: Comment Generation and Disposition Assignment
- For each non-compliance or deficiency identified, generate a review comment with: unique comment number, document page/section/clause reference, corresponding specification requirement, description of the issue, and severity classification
- Apply severity classification: Critical = equipment cannot perform its intended function or creates a safety hazard; Major = equipment will have reduced performance, reliability, or does not meet a code requirement; Minor = dimensional/format discrepancy that does not affect function or safety
- Determine the overall disposition code based on comment severity: Code D if any Critical comments exist that indicate fundamental non-compliance; Code C if Major comments require design changes from the vendor; Code B if only Minor comments that the vendor can incorporate in the final revision; Code A if no comments (rare on first submission)
- For Code C and D dispositions, clearly state what the vendor must do to resolve each comment, providing specific specification references and expected values
- For deviations that the project team may accept (vendor offering an alternative that meets the intent if not the exact specification), flag as "Deviation -- Requires Project Acceptance" and escalate to the engineering manager for disposition
- Verify that comments from previous review cycles (if resubmission) have been addressed by the vendor; mark each prior comment as "Incorporated," "Partially Addressed," or "Not Addressed"
- Compile the review comment sheet and specification compliance matrix into the review package

### Step 4: VDRL Status Update and Vendor Communication
- Update the VDRL tracker with the review results: current disposition code, comment count by severity, review completion date, and expected resubmission date (if Code C or D)
- Prepare the formal review comment return transmittal to the vendor through the Contracts agent, including: review cover letter with overall disposition, detailed comment sheet, and specification compliance matrix
- For Code C and D dispositions, clearly state the resubmission requirements and expected turnaround time per contractual terms
- For Code A and B dispositions, confirm the document is approved for the stated purpose and identify any Code B comments that must be incorporated in the as-built revision
- Update the vendor documentation dashboard with cumulative metrics: total documents submitted, total reviewed, disposition code distribution, average review turnaround time, and VDRL completion percentage
- For vendors with consistently poor submission quality (>40% Code C/D rate), generate a vendor performance alert for the Contracts agent to address through commercial channels
- Track the as-built documentation package status separately: final certified data sheets, as-built GA drawings, test certificates, O&M manuals, spare parts lists, and certification documents

### Step 5: Completion Verification and Handover
- Monitor VDRL completion progress against the equipment delivery schedule: all VDRL items must reach Code A/B before equipment ships (or before specific milestones per the VDRL, e.g., GA drawings approved before fabrication start)
- Generate the VDRL completion report per vendor/PO showing: total line items, items at A/B, items at C/D pending resubmission, items not yet submitted, and projected completion date
- For equipment approaching shipment with incomplete VDRL, escalate to the Contracts agent and project management with specific outstanding items and their criticality for construction/commissioning
- Upon VDRL completion (all items at Code A/B), generate the vendor documentation closeout certificate confirming all contractual documentation obligations have been met
- Compile the final vendor documentation package for handover to: Asset Management agent (equipment data sheets, spare parts lists, O&M manuals for maintenance planning), Operations agent (operating manuals, performance curves for operator training), and Execution agent (certified drawings, test certificates for construction and commissioning)
- Verify that all regulatory certifications are included in the final package: SEC Type Certificates for electrical equipment, pressure equipment certifications per NCh/EN/ASME, and any SERNAGEOMIN-specific certifications for mining equipment
- Archive the complete review history (all cycles, all comments, all correspondence) for project permanent record and warranty reference

## Failure Modes & Common Pitfalls

| Failure Mode | Root Cause | Prevention Strategy |
|-------------|------------|---------------------|
| Review returned without technical substance | Reviewer performing administrative check only, not verifying technical compliance | Mandatory specification compliance matrix completion for every review; spot-audit reviews for technical depth |
| Excessive resubmission cycles delaying procurement | Unclear review comments that vendor cannot action, or vendor not addressing comments | Require actionable comments with specific specification references and expected values; verify prior comment incorporation |
| VDRL items missing at equipment shipment | Incomplete VDRL tracking, vendor not submitting all required documents | Automated VDRL completion alerts at 60%, 80%, 90% of delivery date; gate-hold on shipping without VDRL sign-off |
| Specification deviations accepted without formal record | Verbal agreements between engineers and vendors not documented | All deviations require formal Deviation Request with engineering manager approval and traceability to project files |
| O&M manuals and spare parts lists received too late for OR | These documents deprioritized during engineering review focus on data sheets and drawings | Track O&M and spare parts documentation as distinct VDRL milestones with alerts tied to commissioning schedule |
| Regulatory certifications missing | Certification requirements not included in VDRL or not flagged during review | Include certification checklist in every vendor review; verify Chilean regulatory requirements at PO stage |
| Inconsistent review code application across disciplines | Different reviewers applying different severity thresholds | Calibration workshop at project start; review code application guide with examples; engineering manager oversight of C/D dispositions |

## Escalation Protocols

| Trigger | Timeline | Escalation Path |
|---------|----------|-----------------|
| Vendor submission overdue by >15 working days beyond VDRL milestone | At 15-day overdue mark | Contracts Agent -> Vendor Project Manager -> Procurement Manager |
| Code D rejection on second or subsequent submission cycle | Immediately upon review completion | Engineering Manager -> Contracts Agent -> Vendor Quality Manager |
| Critical safety deficiency identified in vendor design | Immediately upon identification | Engineering Manager -> HSE Agent -> Project Director |
| Review turnaround exceeding contractual commitment (typically 10-15 days) | At 80% of contractual time | Discipline Lead -> Engineering Manager |
| VDRL completion below 80% at 90% of delivery date | Upon threshold crossing | Project Manager -> Vendor -> Contracts Manager (formal letter) |
| Regulatory certification not obtainable for specified equipment | Within 5 days of identification | Compliance Lead -> Engineering Manager -> Project Director -> Client |
| Vendor proposing specification deviation with cost/schedule impact | Within 2 days of deviation identification | Engineering Manager -> Project Manager -> Client (if contract variation required) |

## Quality Criteria

| Dimension | Weight | Target | Measurement |
|-----------|--------|--------|-------------|
| Technical Accuracy | 30% | >95% | Specification compliance matrix correctly identifies all non-compliances and deviations |
| Completeness | 25% | 100% | Every specification requirement verified; every VDRL item tracked; all certification requirements checked |
| Consistency | 15% | >90% | Review codes applied uniformly across disciplines and reviewers; comment severity calibrated |
| Format | 10% | 100% | Standard VSC review comment sheet format; professional presentation suitable for external vendor communication |
| Actionability | 10% | >95% | Every comment provides the vendor with clear, specific information on what must be corrected and to what standard |
| Traceability | 10% | 100% | Every comment linked to specification clause; every review cycle documented; VDRL status auditable |

## Inter-Agent Dependencies

### Inputs From
| Agent | Input Provided | Criticality |
|-------|---------------|-------------|
| Contracts & Compliance | Vendor submissions, purchase orders, VDRL, contractual review timelines | Critical |
| Execution | Procurement schedule, fabrication start dates, equipment delivery dates | Critical |
| Engineering Design | Project specifications, equipment data sheets, design basis | Critical |
| HSE | Hazardous area classification data, safety requirements for vendor equipment | High |
| Operations | Operability requirements, O&M manual content requirements | Medium |

### Outputs Consumed By
| Agent | Output Provided | Trigger |
|-------|----------------|---------|
| Asset Management | Approved vendor data sheets, spare parts lists, O&M manuals for maintenance strategy | Automatic at VDRL completion |
| Operations | Approved O&M manuals, performance curves for operator training and procedure development | Automatic at VDRL completion |
| Contracts & Compliance | Review dispositions for vendor performance tracking, VDRL compliance status | Automatic per review cycle |
| Execution | Certified vendor drawings for construction work packages, test certificates for commissioning | Automatic at Code A/B achievement |
| Construction | Approved GA drawings for installation, foundation bolt patterns, nozzle orientations | Automatic upon IFC status |

## References

### Methodology References
- `methodology/or-playbook-and-procedures/` -- VSC OR Playbook for vendor documentation management procedures
- `methodology/capital-projects/` -- Capital project procurement documentation standards and VDRL templates
- `methodology/contract-tender-technical-specifications/` -- Technical specification writing standards and vendor review procedures
- `docs/architecture/_legacy/multi-agent-architecture.md` -- Multi-agent architecture for vendor data flow between Engineering Design and other agents

### Industry Standards
- **API 617/610/618/560/661** -- Equipment-specific API standards defining vendor documentation requirements for rotating and static equipment
- **ASME BPVC** -- Boiler and Pressure Vessel Code requirements for vendor data and certification
- **IEC 61511 / IEC 61508** -- Functional safety standards defining SIS vendor documentation requirements
- **NORSOK I-005** -- System control diagram requirements for vendor instrumentation documentation
- **NCh 2369** -- Chilean seismic design standard for industrial structures (vendor structural documentation compliance)

## Changelog
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-25 | VSC Engineering | Initial creation -- Wave 3 |
