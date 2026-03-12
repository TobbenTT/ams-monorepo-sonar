---
name: manage-as-built-documentation
description: "Track and compile as-built documentation including red-line drawings, vendor final documentation, test certificates, and quality records. Triggers: 'as-built documentation', 'red-line drawings', 'documentacion as-built', 'planos como construido', 'documentacion final de obra'."
---

# Manage As-Built Documentation

## Skill ID: CONST-13

## Version: 1.0.0

## Category: D-Monitoring (Construction Management)

## Priority: P1 - High

---

## Purpose

Track and compile as-built documentation including red-line drawings, vendor final documentation, test certificates, and quality records to ensure the final installed facility documentation accurately reflects what was actually built, not just what was designed. As-built documentation is the permanent record of the constructed facility and forms the foundation for all future operations, maintenance, modifications, and regulatory compliance throughout the facility's 20-40 year operating life.

The cost of poor as-built documentation is not felt during construction -- it is felt for decades afterward. When operations and maintenance personnel cannot trust that drawings reflect the actual installation, every maintenance intervention requires field verification, every modification requires re-surveying, and every safety analysis carries uncertainty. Industry data shows that 30-40% of maintenance engineering time in the first five years of operation is consumed by as-built documentation deficiencies, and the cost of recreating accurate as-built documentation post-handover is 5-10x the cost of capturing it correctly during construction.

Key value drivers:
- **Operational reliability**: Accurate as-built documentation enables correct maintenance procedures and spare parts identification from day one
- **Safety assurance**: Safety-critical systems (fire protection, emergency shutdown, pressure relief) must have accurate as-built documentation for safety case validity
- **Regulatory compliance**: Environmental permits, operating licenses, and insurance policies reference as-built conditions -- discrepancies create compliance gaps
- **Modification efficiency**: Future facility modifications depend on accurate baseline documentation; errors compound across every subsequent modification
- **Knowledge preservation**: As-built documentation captures construction decisions and field changes that would otherwise be lost when construction personnel demobilize

This skill manages the complete as-built documentation lifecycle from initial red-line markup collection during construction through verification, consolidation, and final handover to the operations and asset management teams.

---

## Intent & Specification

The AI agent MUST understand that:

1. **Red-Line vs. As-Built Distinction**: Red-line drawings are the construction markup on issued-for-construction (IFC) drawings showing what was actually installed. As-built drawings are the final engineered drawings incorporating all red-line markups, field change notices, and design revisions into a clean, final record. Red-lines are the input; as-builts are the output. Both must be tracked but they are different stages of the same process
2. **Completeness Tracking by System**: As-built documentation must be tracked at the system level (not just by drawing number) because system handover for commissioning requires a complete documentation package per system. The tracking must cover: as-built drawings (P&IDs, layouts, isometrics, electrical schematics, instrument loop diagrams), vendor final documentation (O&M manuals, datasheets, spare parts lists, test certificates), construction quality records (weld maps, NDE reports, pressure test certificates, alignment records, torque records)
3. **Vendor Final Documentation**: Vendor documentation must be verified for completeness and quality -- not just received and filed. Common deficiencies include: missing native language translations, outdated spare parts lists referencing discontinued parts, generic O&M manuals not specific to the supplied model/configuration, missing performance curves, and incomplete as-tested datasheets
4. **Handover Documentation Checklist**: The as-built documentation package for each system must satisfy a predefined handover checklist (Turnover Package) that specifies every document required before the system can be accepted by the operations team. No system handover is complete until 100% of required documentation is received, reviewed, and accepted
5. **O&M Manual Assembly**: The operations and maintenance manuals must be assembled from as-built documentation, vendor manuals, and operating procedures into a coherent, usable reference set -- organized by system, not by document type or vendor, so that an operator or technician can find everything about a system in one place

---

## Trigger / Invocation

```
/manage-as-built-documentation
```

### Natural Language Triggers

- "Track as-built documentation progress for the project"
- "Compile the turnover documentation package for a system"
- "Check vendor documentation completeness status"
- "Gestionar la documentacion as-built del proyecto"
- "Compilar el paquete de documentacion de entrega del sistema"
- "Verificar el estado de la documentacion de proveedores"

---

## Input Requirements

### Required Inputs

| Input | Source | Format | Description |
|-------|--------|--------|-------------|
| Master Document Register | Engineering Design / Doc Control | .xlsx | Complete list of all project drawings and documents with revision status |
| Vendor Document Requirements List (VDRL) | Engineering Design | .xlsx | Required vendor documents per equipment item with submission schedule |
| System Breakdown Structure | Engineering Design | .xlsx | System/subsystem hierarchy for document-to-system mapping |
| Handover Documentation Checklist | Orchestrator / Operations | .xlsx | Required documents per system type for turnover acceptance |

### Optional Inputs

| Input | Source | Format | Default if Absent |
|-------|--------|--------|-------------------|
| Red-Line Markup Standards | Engineering Design | .docx | VSC standard red-line markup protocol applied |
| Previous Project Turnover Templates | VSC Knowledge Base | .xlsx | Generic industry turnover checklist by system type |
| Document Management System Access | Doc Control | URL / credentials | Manual tracking in Excel register |
| Quality Record Index | QA/QC | .xlsx | Quality records compiled from inspection records |

### Context Enrichment

- Retrieve system handover status from track-progressive-handover skill for MC/RFSU milestone alignment
- Access engineering document revision status from Doc Control for current revision tracking
- Pull vendor documentation status from manage-vendor-documentation skill for VDRL tracking
- Query field change notices from track-field-change-notices skill for changes requiring as-built updates
- Access punchlist status from verify-construction-quality for documentation-related punchlist items

---

## Output Specification

### Document 1: As-Built Documentation Status Report (.docx)

**Filename**: `{ProjectCode}_AsBuilt_Documentation_Status_v{Version}_{YYYYMMDD}.docx`

**Structure:**

1. **Executive Summary**
   - Overall as-built documentation completeness by category (drawings, vendor docs, quality records)
   - Systems approaching MC/RFSU with documentation status traffic lights
   - Critical documentation gaps requiring immediate action
   - Trend analysis of documentation receipt rate vs. plan

2. **Drawing As-Built Status**
   - Status by discipline: process (P&IDs, PFDs), mechanical (layouts, details), piping (isometrics, supports), electrical (schematics, cable schedules), instrumentation (loop diagrams, logic diagrams), civil/structural (foundations, steel details)
   - Red-line collection status: issued vs. collected vs. verified vs. incorporated into as-built
   - Outstanding red-line markups with responsible party and due date

3. **Vendor Documentation Status**
   - VDRL compliance by vendor and equipment type
   - Documentation quality review results (accepted, conditionally accepted, rejected)
   - Outstanding vendor documentation with impact assessment
   - Vendor documentation deficiency log

4. **Quality Records Compilation**
   - Weld maps and NDE reports by system
   - Pressure test certificates by system and test package
   - Electrical test records (megger, hi-pot, relay calibration)
   - Instrument calibration and loop test records
   - Alignment and vibration baseline records

5. **System Turnover Package Status**
   - Per-system checklist compliance (% complete)
   - Traffic light status: Green (>95% complete), Amber (80-95%), Red (<80%)
   - Gap analysis per system with catch-up plan

6. **Appendices**
   - Complete document tracking register extract
   - Red-line markup examples showing standard and non-compliant markups
   - Vendor documentation deficiency notices (copies)

### Key Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| Drawing As-Built Completion | % of IFC drawings with as-built revision issued | 100% at system RFSU |
| Red-Line Collection Rate | % of construction-complete areas with red-lines collected | > 95% within 2 weeks of MC |
| Vendor Doc Compliance | % of VDRL items received and accepted | > 90% at MC; 100% at RFSU |
| Quality Record Completeness | % of required quality records compiled per system | 100% at MC |
| Turnover Package Readiness | % of systems with complete turnover packages at MC | > 85% |

---

## Procedure

### Step 1: Establish Document Tracking Framework

1. Obtain the master document register from Doc Control and map every document to its parent system(s) using the system breakdown structure
2. Obtain the Vendor Document Requirements List (VDRL) and map every vendor document to its equipment tag and parent system
3. Define the handover documentation checklist per system type (rotating equipment system, static equipment system, electrical system, instrument system, piping system, civil/structural) specifying every document required for turnover
4. Create the as-built documentation tracking register with columns: Document ID, Title, Discipline, System, Revision, IFC Date, Red-Line Required (Y/N), Red-Line Collected (Y/N), As-Built Revision, Vendor Doc (Y/N), Vendor Submitted (Y/N), Quality Reviewed (Y/N), Accepted (Y/N), Status
5. Establish the red-line markup standard: who marks up (construction superintendent per discipline), what color ink (red for field changes, blue for information notes), what level of detail (sufficient for engineering to produce as-built revision without field visit), and markup collection protocol (submitted within 5 working days of system MC)
6. Configure reporting dashboards to show completeness by system, discipline, and milestone timeline
7. Brief all construction superintendents and contractors on red-line markup requirements and collection timeline

### Step 2: Collect Red-Line Markups During Construction

1. Issue red-line markup kits to each construction discipline superintendent: clean copies of IFC drawings, red and blue pens, markup instruction sheet, return envelopes
2. Track red-line markup collection against construction progress: as each area/system reaches physical completion, trigger red-line collection request to the responsible superintendent
3. Review collected red-lines for completeness and legibility: every field change must be marked, markups must be clear enough for drafting without interpretation, referenced FCNs and site instructions must be attached
4. Return inadequate red-lines to the originator with specific deficiency description and deadline for re-submission
5. Log all collected red-lines in the tracking register with receipt date, quality assessment, and forwarding date to engineering for as-built revision
6. Forward accepted red-lines to engineering design team for incorporation into as-built drawings
7. Track engineering's as-built drawing production: target 15 working days from red-line receipt to as-built revision issue

### Step 3: Track and Verify Vendor Documentation

1. Monitor VDRL submission schedule: vendor documents should be submitted per contract milestones (typically at manufacturing completion, factory acceptance test, and final as-shipped)
2. Review vendor documentation for completeness against VDRL requirements: O&M manual covers the specific model supplied (not generic), spare parts list references current part numbers with lead times, performance curves match as-tested conditions, datasheets reflect final as-supplied parameters
3. Issue vendor documentation deficiency notices for incomplete or incorrect submissions with specific deficiency description and required correction deadline
4. Track vendor documentation resubmission and re-review cycle until documentation is accepted
5. Verify that vendor documentation reflects any field changes or modifications made during installation (e.g., motor replaced with different frame size, instrument re-ranged, seal material changed)
6. Compile accepted vendor documentation into equipment-specific documentation packages organized by system and equipment tag

### Step 4: Compile System Turnover Packages

1. For each system approaching MC milestone, generate the turnover package checklist showing all required documents and their current status
2. Identify documentation gaps: missing drawings, outstanding vendor documents, incomplete quality records, pending as-built revisions
3. Issue documentation catch-up plans to responsible parties (engineering for as-built drawings, vendors for final documentation, QA/QC for quality records) with deadlines aligned to MC date
4. Conduct turnover package review meetings at MC-30, MC-15, and MC-7 days to track gap closure progress
5. Assemble the physical or electronic turnover package in the defined structure: Section 1 (As-Built Drawings), Section 2 (Vendor Documentation), Section 3 (Quality Records), Section 4 (Test Certificates), Section 5 (Certificates of Compliance)
6. Conduct final turnover package review with the operations and asset management representatives to confirm acceptance
7. Issue the turnover package with a documentation transmittal and obtain acceptance signatures

### Step 5: Assemble Operations and Maintenance Manuals

1. Compile system-level O&M documentation from as-built drawings, vendor O&M manuals, operating procedures (from Operations agent), and maintenance procedures (from Asset Management agent)
2. Organize documentation by system (not by vendor or discipline) so that all information about a single system is accessible in one location
3. Create a master index linking each system to its complete documentation set with hyperlinks or cross-references
4. Verify that O&M manuals include: system description and design basis, P&ID (as-built), equipment datasheets (as-built), operating procedures, maintenance procedures, spare parts lists with ordering information, vendor contact information, warranty terms and expiry dates
5. Identify and fill gaps in O&M documentation: missing procedures, incomplete vendor manuals, outdated spare parts information
6. Deliver the complete O&M manual set to the operations team as part of the final handover package
7. Archive the complete as-built documentation set in the document management system with proper metadata, access controls, and retention classification

---

## Failure Modes & Common Pitfalls

| Failure Mode | Root Cause | Prevention Strategy |
|-------------|------------|---------------------|
| Red-lines not collected before construction crews demobilize | Red-line collection not enforced as a contractual requirement; crews leave site | Make red-line submission a contractual requirement for final payment; collect progressively per area, not at end |
| As-built drawings do not reflect actual installation | Red-lines incomplete or illegible; engineering produces as-builts without field verification | Audit red-line quality at collection; require field verification of critical systems (safety, pressure boundary) |
| Vendor documentation is generic, not specific to supplied equipment | Vendor submits catalog-level documentation instead of equipment-specific manuals | Specify documentation requirements in purchase order; reject generic documentation at review |
| Quality records incomplete for welding and pressure testing | Records not compiled during construction; records lost or scattered across multiple systems | Assign QA/QC document controller to compile records progressively during construction, not at end |
| Turnover packages delayed, blocking commissioning start | Documentation treated as afterthought; no tracking until handover milestone approaches | Track documentation completeness continuously from construction start; weekly reporting to construction management |
| O&M manuals unusable by operations personnel | Organized by vendor or discipline instead of by system; technical language not accessible | Organize by system; include system descriptions in plain language; review with operations personnel before handover |
| Field change notices not reflected in as-built documentation | FCN process disconnected from as-built update process | Mandatory link between FCN closure and as-built drawing update; no FCN can close without confirmed as-built revision |

---

## Escalation Protocols

| Trigger | Timeline | Escalation Path |
|---------|----------|-----------------|
| Red-line markups not submitted within 10 days of area MC | Day 10 post-MC | Document Controller -> Construction Manager -> Contractor PM |
| Vendor documentation deficiency notice unresolved > 14 days | Day 14 of notice | Document Controller -> Procurement Manager -> Vendor Account Manager |
| System turnover package < 80% complete at MC-14 days | At MC-14 assessment | Document Controller -> Construction Manager -> Project Manager |
| Engineering as-built drawing production backlog > 20 drawings | Weekly backlog review | Document Controller -> Engineering Manager -> Project Manager |
| Quality records missing for safety-critical system | Upon discovery | QA/QC Manager -> Construction Manager -> Project Director |
| Contractor demobilizing without completing documentation requirements | At demobilization notice | Construction Manager -> Contracts Manager -> Project Director (withhold payment) |

---

## Quality Criteria

| Dimension | Weight | Target | Measurement |
|-----------|--------|--------|-------------|
| Technical Accuracy | 30% | As-built drawings verified against actual installation for critical systems | Field verification audit of 10% sample of as-built drawings |
| Completeness | 25% | All turnover package items received, reviewed, and accepted per system | Checklist compliance per system; no blank or TBD items |
| Consistency | 15% | Document revision status consistent across register, DMS, and physical packages | Cross-reference audit between tracking register and actual documents |
| Format | 10% | Professional formatting, consistent numbering, proper metadata in DMS | Template compliance and DMS metadata audit |
| Actionability | 10% | Operations and maintenance personnel can find and use documentation without assistance | User acceptance test with operations and maintenance representatives |
| Traceability | 10% | Every as-built change traceable to red-line, FCN, or vendor revision | Traceability audit linking as-built changes to source markups |

---

## Inter-Agent Dependencies

### Inputs From

| Agent / Skill | Data Required | Criticality |
|---------------|---------------|-------------|
| Engineering Design | IFC drawings (baseline for as-built), VDRL, system breakdown structure | Critical |
| Vendors (via Contracts & Compliance) | Vendor final documentation: O&M manuals, datasheets, spare parts lists, test certificates | Critical |
| All construction disciplines | Red-line markups of IFC drawings showing actual installed conditions | Critical |
| track-field-change-notices | FCN register showing all approved field changes requiring as-built updates | Critical |
| verify-construction-quality | Quality records: weld maps, NDE reports, pressure test certificates, alignment records | High |

### Outputs Consumed By

| Agent / Skill | Data Provided | Trigger |
|---------------|---------------|---------|
| Engineering Design | Red-line markups for as-built drawing production | Progressive during construction |
| Operations (create-operations-manual) | Complete O&M documentation packages by system | At system RFSU |
| Asset Management (create-asset-register) | Equipment as-built datasheets, vendor documentation, maintenance manuals | At system MC |
| Orchestrator (track-progressive-handover) | Turnover package completeness status per system | Weekly and at milestones |
| HSE | Safety-critical system documentation packages for safety case validation | At system RFSU |

---

## References

- **VSC OR Playbook** -- Documentation Management and Handover section (Level 5-6)
- **ISO 19650** -- Information Management using BIM: document handover and asset information requirements
- **ISO 55001:2014** -- Asset Management: requirements for asset information at handover
- **AACE RP 96R-18** -- Commissioning Readiness: turnover documentation requirements
- **API RP 75** -- Recommended Practice for Development of a Safety and Environmental Management Program: documentation requirements for operating facilities

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-25 | Initial creation -- Wave 3 |
