---
name: create-engineering-dossier
description: "Compile the final engineering handover dossier containing all engineering documentation required by the operations team for facility management, including as-built drawings, calculations, specifications, vendor documentation, and engineering change history. Triggers: 'engineering dossier', 'engineering handover package', 'as-built documentation', 'dossier de ingenieria', 'paquete de entrega de ingenieria', 'documentacion as-built'."
---

# Create Engineering Dossier

## Skill ID: ENGD-18

## Version: 1.0.0

## Category: A - Document Generation

## Priority: P1 - Critical

---

## Purpose

Compiles the definitive engineering handover dossier containing all engineering documentation required by the operations and maintenance teams for long-term facility management. This dossier is the permanent engineering record of the as-built facility -- the single, comprehensive collection of as-built drawings, validated calculations, approved specifications, vendor documentation, material certificates, engineering change history, and design intent records that will serve as the reference basis for every future modification, maintenance decision, and regulatory compliance demonstration throughout the facility's operational life (typically 20-40 years).

The engineering dossier is arguably the most important deliverable of the entire engineering phase, yet it is consistently the most neglected. Industry studies show that 30-50% of capital projects fail to deliver a complete engineering dossier at handover, and the consequences are severe and long-lasting. Without a complete dossier, the operations team lacks the documentation needed to maintain equipment correctly (leading to accelerated degradation and premature failures), respond to operational problems (leading to extended downtime), perform future modifications safely (leading to design errors in brownfield work), and demonstrate regulatory compliance (leading to enforcement actions).

The cost of a missing or incomplete dossier accumulates year after year. Every time a maintenance engineer needs to look up a design parameter, verify a material of construction, check a calculation basis, or understand a design change, they must either find the information in the dossier or spend hours (sometimes days) reconstructing it from scattered sources. On a large facility, this information retrieval problem accounts for 20-30% of engineering manhours spent on operational support. A complete, well-organized dossier dramatically reduces this overhead and improves the speed and quality of every subsequent engineering decision.

This skill manages the systematic compilation of the engineering dossier from project engineering completion through handover: defining the dossier structure per discipline, tracking document completeness against the master document register, managing the as-built verification process, compiling vendor documentation packages, organizing the calculation archive, and producing the final dossier with completeness certification for formal handover acceptance.

---

## Intent & Specification

The AI agent MUST understand that:

1. **The Dossier is a Permanent Record**: Unlike project-phase documents that have limited useful life, the engineering dossier serves the facility for its entire operational life. Every document must be in its final, approved, as-built revision. Draft documents, superseded revisions, and preliminary data have no place in the dossier.
2. **As-Built Verification is Mandatory**: "As-built" means the documentation reflects the facility as actually constructed, not as originally designed. Every drawing, specification, and data sheet must be verified against the constructed facility and updated where field changes occurred. Issuing the original design documents without as-built verification is the most common and most harmful dossier deficiency.
3. **Vendor Documentation Completeness is Critical**: Vendor documentation (O&M manuals, certified drawings, test certificates, material certificates, spare parts lists, performance data) typically accounts for 40-60% of the dossier volume and is the most difficult component to collect completely. Incomplete vendor documentation is the number one complaint from operations teams at handover.
4. **Design Intent Must Be Preserved**: The dossier must include not just what was designed, but why. Design basis documents, calculation reports with design margin justifications, engineering change records with rationale, and design review close-out records preserve the design intent that future engineers need to understand before modifying the facility.
5. **Dossier Acceptance is a Handover Prerequisite**: The operations team must formally review and accept the dossier as part of the system handover process. Acceptance criteria should be defined at project start, tracked throughout engineering, and verified at handover. An incomplete dossier should block or condition the handover.

---

## Trigger / Invocation

```
/create-engineering-dossier
```

### Natural Language Triggers
- "Compile engineering dossier for [system/plant]"
- "Prepare engineering handover documentation package"
- "Check engineering dossier completeness for handover"
- "Compilar dossier de ingenieria para [sistema/planta]"
- "Preparar paquete de documentacion de ingenieria para entrega"
- "Verificar completitud del dossier de ingenieria para traspaso"

---

## Input Requirements

### Required Inputs

| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `master_document_register` | Complete list of all engineering documents produced for the project with current revision status | .xlsx | Document Control |
| `as_built_drawings` | Drawings updated to reflect as-built conditions (red-line mark-ups verified and incorporated) | .pdf / .dwg | Engineering disciplines / Construction |
| `vendor_document_register` | Complete list of all vendor documents required and received, with review status | .xlsx | Document Control / Procurement |
| `calculation_register` | Register of all engineering calculations with check/approval status | .xlsx | Engineering Management |
| `engineering_change_register` | Complete history of all engineering changes with approval records and implementation status | .xlsx | Engineering Change Management |

### Optional Inputs

| Input | Description | Default |
|-------|-------------|---------|
| `dossier_acceptance_criteria` | Client or project-specific dossier completeness and quality requirements | Use VSC standard dossier requirements |
| `handover_schedule` | System-by-system handover schedule for prioritizing dossier compilation | Compile in system numbering sequence |
| `previous_project_dossier_template` | Similar project dossier structure for reference | Use VSC standard dossier structure |
| `regulatory_documentation_requirements` | Regulatory authority requirements for retained engineering documentation | Apply local regulatory standards |

### Context Enrichment

The agent should automatically:
- Cross-reference the master document register against the dossier contents checklist to identify missing documents by discipline and system
- Verify that all drawings are at as-built revision status (not earlier design revisions) by checking revision codes against the as-built verification register
- Check the vendor document register for outstanding vendor submissions and calculate the impact on dossier completeness
- Retrieve the engineering change register to compile the complete change history organized by system for inclusion in the dossier
- Identify any calculations still in preliminary or unchecked status that require validation before dossier inclusion

---

## Output Specification

### Document: Engineering Handover Dossier (multi-volume)

**Filename**: `VSC_EngDossier_{ProjectCode}_{SystemCode}_{Volume}_{Rev}_{Date}`

### Structure

#### Volume 1: Design Basis and Overall Documentation
- Project design basis document (final revision)
- Codes and standards register (as applied to the project)
- Engineering scope of work and responsibility matrix
- Overall plant layout and general arrangement drawings (as-built)
- System numbering and equipment tagging philosophy
- Material selection report and corrosion management philosophy
- Engineering change history summary (project-level)
- Design review close-out summary

#### Volume 2: Process Engineering Documentation
- Process flow diagrams (PFDs) -- as-built
- Piping and Instrumentation Diagrams (P&IDs) -- as-built (RED-STAMPED "AS-BUILT")
- Heat and material balance (final operating case)
- Process data sheets for all equipment
- Process specifications (line sizing, relief valve, control valve sizing)
- Process calculations archive (validated)
- Operating envelope documentation (design limits, operating ranges, constraints)

#### Volume 3: Mechanical Engineering Documentation
- Equipment specifications and data sheets (final, as-purchased)
- Mechanical calculation reports (pressure vessels, rotating equipment, heat exchangers)
- Piping specifications (line classes, material classes)
- Piping isometrics and plan drawings -- as-built
- Stress analysis reports for critical piping
- Equipment arrangement and foundation drawings -- as-built
- Painting and insulation specifications

#### Volume 4: Electrical Engineering Documentation
- Single-line diagrams -- as-built
- Electrical load list and load study
- Electrical area classification drawings
- Cable schedules and routing drawings -- as-built
- Motor data sheets and protection coordination study
- Earthing and lightning protection design
- Emergency and standby power system documentation

#### Volume 5: Instrument and Control Engineering Documentation
- Instrument index and data sheets
- Control system architecture drawings -- as-built
- Cause and effect diagrams
- Logic diagrams and sequence descriptions
- Alarm rationalization database
- Safety Instrumented System (SIS) documentation (SIL assessment, SRS, validation)
- DCS/PLC configuration documentation
- Instrument loop drawings -- as-built
- Cable and junction box schedules

#### Volume 6: Civil and Structural Engineering Documentation
- Geotechnical investigation report
- Foundation design calculations and drawings -- as-built
- Structural steel design calculations and drawings -- as-built
- Concrete design calculations and drawings -- as-built
- Building services documentation
- Drainage and earthworks as-built drawings

#### Volume 7: Vendor Documentation
- Compiled by equipment tag number
- Per equipment item: certified drawings, O&M manual, test certificates, material certificates, performance test data, spare parts recommendations, warranty information
- Vendor data book compilation cross-referenced to equipment register

#### Volume 8: Quality and Compliance Records
- Material test certificates (MTCs) for critical piping and equipment
- Welding procedure specifications and welder qualifications (for project-specific procedures)
- Non-destructive testing (NDT) reports
- Hydrostatic/pneumatic test records
- Factory acceptance test (FAT) reports
- Site acceptance test (SAT) reports
- Regulatory submission records and approvals

### Key Metrics

| Metric | Description | Target | Measurement |
|--------|-------------|--------|-------------|
| Document Completeness | Documents included vs. required per master register | >98% at handover | Dossier audit against master document register |
| As-Built Verification | Drawings verified as reflecting as-built conditions | 100% for P&IDs and critical drawings | As-built verification register sign-off |
| Vendor Documentation Completeness | Vendor documents received vs. required per VDRL | >95% at handover | Vendor document register status |
| Calculation Archive Completeness | Calculations included with checked/approved status | 100% of safety-critical; >95% overall | Calculation register status |
| Dossier Acceptance | Operations team formal acceptance of dossier quality | Accepted without critical reservations | Handover acceptance certificate |

---

## Procedure

### Step 1: Define Dossier Structure and Acceptance Criteria

- Establish the dossier structure (volumes, sections, contents) based on the project scope, discipline involvement, and regulatory requirements; use the VSC standard 8-volume structure as baseline and customize as needed
- Define dossier acceptance criteria in collaboration with the operations team: minimum document completeness percentage, mandatory documents that must be present without exception, acceptable format and organization requirements
- Create the dossier contents checklist (master list of every document that must be included) by cross-referencing the master document register, vendor document register, and calculation register against the dossier structure
- Assign dossier compilation responsibilities by discipline: each Lead Discipline Engineer is responsible for their discipline volume contents
- Establish the as-built verification process: who verifies, what constitutes acceptable verification evidence, and how verified status is recorded
- Set the dossier compilation schedule aligned with the system handover schedule: dossier for each system must be substantially complete before handover review
- Communicate acceptance criteria and schedule to all discipline leads, document control, and the operations team

### Step 2: Track Document Completeness and Drive Collection

- Generate the initial dossier completeness report: for each volume and section, list every required document, its current status (available / in progress / missing / not applicable), and the responsible party
- Calculate completeness percentage by volume, by discipline, and overall; present as a dashboard with RAG indicators (Green >95%, Amber 80-95%, Red <80%)
- Identify the critical missing documents: those on the critical path for handover, those required by regulation, and those specifically requested by the operations team
- For missing vendor documents, generate a vendor document chasing list organized by purchase order; coordinate with Contracts agent and procurement to pursue outstanding deliverables
- For missing engineering documents, coordinate with discipline leads to prioritize completion; escalate documents overdue against the engineering schedule
- For as-built drawings not yet verified, coordinate with construction to obtain field red-line mark-ups; schedule as-built verification walks for critical systems
- Track completeness weekly and report progress to Engineering Manager and Project Manager; escalate any system where completeness is below 85% with handover date within 60 days

### Step 3: Manage As-Built Verification Process

- For each system approaching handover, compile the list of drawings requiring as-built verification (all P&IDs, equipment arrangement drawings, piping plan and isometric drawings, electrical single-line diagrams, instrument loop drawings, cable routing drawings)
- Coordinate with construction to collect field red-line mark-ups for every drawing; verify that red-lines reflect all field changes including contractor-initiated changes, field-fit modifications, and punch list resolutions
- Route verified red-line mark-ups to the responsible discipline for incorporation into the electronic drawing file; set a target turnaround of 10 working days for as-built drawing production
- Review the updated as-built drawing against the red-line mark-up to confirm all changes have been correctly incorporated; the reviewer must not be the person who made the changes
- Stamp or watermark as-built drawings with "AS-BUILT" designation and the verification date; update the document register to reflect the as-built revision number
- For drawings where no field changes occurred, the as-built verification is a signed confirmation that the issued-for-construction drawing accurately represents the as-built condition
- Track as-built verification completion by system and discipline; report in the dossier completeness dashboard

### Step 4: Compile Vendor Documentation and Quality Records

- For each equipment item in the equipment register, check the vendor document register for all required vendor documents per the VDRL (Vendor Document Requirements List) issued with the purchase order
- Organize vendor documentation by equipment tag number: certified vendor drawings, operation and maintenance manual, test certificates, material certificates, performance test data, spare parts list with recommended quantities, warranty certificate
- Verify vendor document quality: O&M manuals must be specific to the supplied equipment (not generic catalog manuals), test certificates must reference the correct serial numbers, material certificates must match the specified materials of construction
- For vendor documents still outstanding, escalate to procurement with the purchase order reference and contractual document submission requirements; include overdue vendor documents in the weekly dossier status report
- Compile quality records by system: material test certificates, welding records, NDE reports, pressure test records, FAT/SAT reports; organize in the sequence required by the regulatory authority or project quality plan
- Cross-reference quality records against the construction inspection and test plan to verify all required records are present
- Prepare the vendor documentation completeness report per system for inclusion in the handover package

### Step 5: Assemble Final Dossier and Execute Handover

- Compile all documents into the defined volume structure: create volume cover pages, tables of contents, document indices, and cross-reference guides
- Perform a final completeness audit: every document on the dossier contents checklist is either present at the correct revision or has a documented justification for absence with a commitment date for delivery
- Prepare the dossier completeness certification: a formal document signed by the Engineering Manager certifying the completeness and accuracy of the dossier, listing any outstanding items with their expected resolution dates
- Generate the electronic dossier in the project document management system with full-text searchability, hyperlinked indices, and logical folder structure matching the volume organization
- If hard copies are required (regulatory or client requirement), produce printed and bound volumes with professional quality printing and clear labeling
- Present the dossier to the operations team for formal review; schedule a review period (typically 2-4 weeks) for the operations team to examine the contents and raise any queries or deficiency notices
- Resolve any deficiency notices from the operations team review; update the dossier with any corrected or additional documents; obtain formal acceptance signature on the dossier handover certificate

---

## Failure Modes & Common Pitfalls

| Failure Mode | Root Cause | Prevention Strategy |
|-------------|-----------|-------------------|
| Dossier compilation started too late | Treated as an end-of-project activity rather than a progressive collection throughout engineering | Begin dossier tracking at engineering start; monitor completeness monthly from 50% engineering progress |
| As-built drawings not verified against actual construction | Schedule pressure at handover; assumption that design drawings are accurate; construction red-lines not collected | As-built verification is a mandatory hold point before handover; dedicated as-built verification walks per system |
| Vendor documentation incomplete at handover | Vendor contractual obligations not enforced; final payment released before documentation delivered | Hold 5-10% retention until vendor documentation complete per VDRL; weekly vendor document chasing from 90% construction |
| Design changes not reflected in dossier | Engineering changes implemented but dossier documents not updated to reflect the change | Cross-reference change register against dossier documents; every approved change must trigger a dossier document update |
| Dossier organization makes information unfindable | Poor indexing; inconsistent filing; documents not cross-referenced to equipment or system | Standardized volume structure; equipment-indexed cross-reference; full-text search in electronic version; hyperlinked table of contents |
| Calculations included but not in final checked/approved status | Calculation register not reconciled with dossier contents; preliminary calculations included | All calculations must show "Checked and Approved" status in the register before dossier inclusion; automated register cross-check |
| Quality records missing for critical welds/tests | Construction quality records not systematically collected; records lost during construction phase | Quality records tracked from point of generation; weekly quality records reconciliation against ITP requirements |

---

## Escalation Protocols

| Trigger | Timeline | Escalation Path |
|---------|----------|----------------|
| Overall dossier completeness <85% at 60 days before handover | Immediate | Engineering Manager --> Project Manager with recovery plan and resource request |
| As-built drawings not available for a system at 30 days before its handover date | 1 week | Lead Discipline Engineer --> Engineering Manager --> Construction Manager for red-line mark-up delivery |
| Vendor documentation completeness <90% for a system at handover | Immediate | Procurement --> Contracts Agent for vendor contractual enforcement; Engineering Manager for impact assessment |
| Critical calculation missing or in unchecked status at dossier compilation | 48 hours | Lead Discipline Engineer --> Engineering Manager; block dossier certification until calculation checked/approved |
| Operations team raises critical deficiency notice during dossier review | 5 working days | Engineering Manager assigns resolution; tracks to closure before re-presenting for acceptance |
| Regulatory-required documents missing from dossier | Immediate | Engineering Manager --> Project Manager --> Regulatory Affairs for compliance risk assessment |
| Handover acceptance rejected due to dossier quality | Immediate | Engineering Manager --> Project Manager; prepare remediation plan with specific completion dates per deficiency |

---

## Quality Criteria

| Dimension | Weight | Target | Measurement |
|-----------|--------|--------|-------------|
| Technical Accuracy | 30% | All documents at correct as-built revision; no superseded documents; all calculations checked/approved | Dossier audit: random sample of 20 documents verified against source registers |
| Completeness | 25% | >98% document completeness; 100% for safety-critical and regulatory-required documents | Completeness audit against dossier contents checklist |
| Consistency | 15% | Consistent organization across volumes; cross-references accurate; indices match contents | Cross-reference audit; index verification |
| Format | 10% | Professional presentation; searchable electronic format; proper labeling and binding (if printed) | Format review; user feedback from operations team |
| Actionability | 10% | Operations team can find and use any document within 5 minutes; no reconstruction of information needed | User testing during review period; operations team feedback |
| Traceability | 10% | Every document traceable to the master register; every as-built change traceable to the change register | Traceability audit on sample of as-built changes and engineering changes |

---

## Inter-Agent Dependencies

### Inputs From

| Agent/Skill | Input Provided | Criticality |
|-------------|---------------|-------------|
| All Engineering Disciplines | Final as-built documents: drawings, specifications, calculations, data sheets | Critical |
| `manage-document-transmittals` (ENGD skill) | Master document register with final revision status for all project documents | Critical |
| Vendor organizations | Final vendor documentation: O&M manuals, certified drawings, test certificates, material certificates | Critical |
| `manage-engineering-change-orders` (ENGD skill) | Complete engineering change history with implementation records | High |
| `validate-engineering-calculations` (ENGD-16) | Calculation register with checked/approved status for all calculations | High |

### Outputs Consumed By

| Agent/Skill | Output Consumed | Usage |
|-------------|----------------|-------|
| `agent-operations` | Complete facility engineering documentation for operations and maintenance reference | Daily operational reference; procedure development; troubleshooting |
| `agent-asset-management` | Equipment data sheets, vendor manuals, spare parts lists for maintenance planning | CMMS data population; maintenance strategy development; spare parts management |
| `agent-orchestrator` | Dossier completeness status for handover readiness reporting | Handover milestone tracking; project close-out metrics |
| `certify-system-readiness` (Execution skill) | Documentation completeness evidence for TCCC certificate prerequisites | System handover acceptance gate |
| Future brownfield engineering | Design basis, as-built records, and change history for future modifications | Modification engineering reference; design integrity management |

---

## References

### Methodology References
- VSC OR Playbook -- Engineering Handover and Documentation Management sections
- VSC Engineering Management Procedures -- Engineering Dossier Compilation Guide
- VSC Standard Engineering Dossier Structure Template v3.0
- VSC Document Management Plan Template -- Dossier requirements section

### Industry Standards
- ISO 55001:2014 -- Asset Management: Management Systems (information requirements for asset management)
- PAS 1192-2:2013 / ISO 19650 -- Information management for capital/delivery phase of construction projects
- CFIHOS (Capital Facilities Information Handover Specification) -- Standard for engineering handover data
- API RP 754 -- Process Safety Performance Indicators (documentation retention requirements)
- OSHA 29 CFR 1910.119 -- Process Safety Management (documentation requirements for process safety information)

---

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-25 | VSC OR System | Initial creation -- Wave 3 |
