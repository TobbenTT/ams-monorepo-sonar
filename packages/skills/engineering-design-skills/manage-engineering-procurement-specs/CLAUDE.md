---
name: manage-engineering-procurement-specs
description: "Manage preparation and assembly of engineering procurement packages combining technical specifications, data sheets, vendor document requirements, and applicable codes into coherent bid packages. Triggers: 'procurement specs', 'bid package', 'technical procurement', 'especificaciones de adquisiciones', 'paquete de licitacion', 'requisicion tecnica'."
---

# Manage Engineering Procurement Specs

## Skill ID: ENGD-13

## Version: 1.0.0

## Category: C - Planning

## Priority: P1 - Critical

---

## Purpose

Manages the preparation, assembly, and quality assurance of complete engineering procurement packages that combine technical specifications, data sheets, vendor document requirements (VDRL), and applicable codes and standards into coherent bid packages suitable for competitive vendor bidding. This skill ensures that every procurement package leaving engineering is technically complete, internally consistent, and provides vendors with an unambiguous basis for quotation.

In capital projects for mining, oil & gas, chemicals, and energy sectors, procurement packages typically represent 40-60% of total project cost. The quality of these packages directly determines the quality of vendor bids received, the accuracy of cost estimates, the number of post-award technical clarifications required, and ultimately whether the procured equipment meets the operational and safety requirements of the facility. A poorly assembled procurement package leads to incomplete bids, extended clarification cycles, scope gaps discovered during fabrication, and equipment that fails to integrate properly with the overall plant design.

The procurement package assembly process sits at the critical intersection of engineering output and commercial procurement. Engineering disciplines produce specifications and data sheets; contracts produce commercial terms; asset management contributes standardization requirements and approved vendor lists. This skill orchestrates the assembly of all these components into a unified package, validates internal consistency, ensures completeness against the project procurement checklist, and tracks the package through the bid evaluation cycle.

Key value drivers include: reducing bid clarification cycles by 30-50% through complete and consistent packages, preventing scope gaps that result in costly change orders during fabrication, enabling fair and comparable vendor bids through standardized technical evaluation criteria, maintaining full traceability from design intent through procurement to delivered equipment, and protecting schedule by ensuring procurement packages are issued on time to support the project procurement plan.

---

## Intent & Specification

The AI agent MUST understand that:

1. **Package Completeness is Non-Negotiable**: An incomplete procurement package results in incomplete bids, extended clarification cycles, and ultimately scope gaps that surface as costly change orders during fabrication or construction. Every package must be verified complete against the project procurement checklist before issue.
2. **Internal Consistency Across Documents**: A procurement package typically contains 10-30 individual documents from multiple engineering disciplines. Specifications, data sheets, P&IDs, and vendor document requirements must all reference consistent design conditions, materials of construction, and applicable codes. A single inconsistency (e.g., different design pressures in the process data sheet vs. the mechanical specification) undermines the entire bid basis.
3. **Vendor Document Requirements Drive Handover Quality**: The Vendor Document Requirements List (VDRL) defines what documentation the vendor must provide and when. A weak VDRL results in inadequate vendor documentation that cripples commissioning, operations, and maintenance. The VDRL must be comprehensive, specific about document types and formats, and aligned with project document numbering and transmittal requirements.
4. **Technical Bid Evaluation Must Be Objective and Traceable**: Technical bid evaluation criteria must be defined before bids are received, weighted appropriately, and applied consistently across all bidders. The criteria must distinguish between mandatory (pass/fail) requirements and scored (weighted) requirements.
5. **Approved Vendor List Alignment**: All procurement packages must reference the project Approved Vendor List (AVL). Packages for equipment not on the AVL must include a vendor qualification process. Sole-source justifications require documented technical rationale.

---

## Trigger / Invocation

```
/manage-engineering-procurement-specs
```

### Natural Language Triggers
- "Assemble procurement package for [equipment/system]"
- "Prepare bid package for [tag/service]"
- "Create technical requisition for [equipment type]"
- "Preparar paquete de adquisicion para [equipo/sistema]"
- "Armar especificaciones de compra para [equipo]"
- "Crear requisicion tecnica para [tipo de equipo]"

---

## Input Requirements

### Required Inputs

| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `technical_specifications` | Discipline-specific technical specifications for the equipment or service | .docx / .pdf | Engineering disciplines (process, mechanical, electrical, instrument, civil) |
| `data_sheets` | Process data sheets, mechanical data sheets, instrument data sheets | .xlsx / .pdf | Engineering disciplines |
| `applicable_drawings` | P&IDs, arrangement drawings, interface drawings, single-line diagrams | .pdf / .dwg | Engineering disciplines |
| `project_procurement_checklist` | Standard checklist defining required contents per package type | .xlsx | Engineering Management / Doc Control |
| `approved_vendor_list` | Project AVL with qualified vendors per equipment category | .xlsx | Contracts / Asset Management |

### Optional Inputs

| Input | Description | Default |
|-------|-------------|---------|
| `material_take_off` | Bulk material quantities for piping, electrical, instrumentation | Derive from specifications and drawings |
| `previous_bid_packages` | Similar packages from previous projects for reference | Use standard templates |
| `vendor_qualification_records` | Pre-qualification data for vendors not on AVL | Initiate qualification process |
| `project_design_basis` | Overall design basis document with site conditions, codes | Extract from individual specifications |

### Context Enrichment

The agent should automatically:
- Cross-reference design conditions (temperature, pressure, flow, composition) across all documents in the package for consistency
- Verify that material specifications referenced in data sheets match the materials of construction specified in the technical specification
- Check that applicable codes and standards referenced across documents are consistent and current editions
- Retrieve the latest project Approved Vendor List from Contracts agent and verify vendor eligibility
- Extract vendor document submission requirements from the project document management plan for VDRL preparation

---

## Output Specification

### Document: Engineering Procurement Package (.docx bundle)

**Filename**: `VSC_ProcPkg_{ProjectCode}_{EquipTag}_{EquipDescription}_{Rev}_{Date}.docx`

### Structure

#### Section 1: Procurement Package Cover Sheet and Index
- Package number, equipment tag(s), service description
- Complete index of all enclosed documents with revision status
- Issue purpose (IFQ - Issued for Quotation, IFP - Issued for Purchase)
- Bid submission requirements (deadline, format, number of copies)

#### Section 2: Technical Specification Compilation
- All applicable technical specifications organized by discipline
- Process specification, mechanical specification, electrical specification, instrument specification
- Cross-reference matrix showing specification applicability per equipment item

#### Section 3: Data Sheets and Process Requirements
- Process data sheets with all operating cases (normal, maximum, minimum, upset)
- Mechanical data sheets pre-filled with engineering requirements
- Instrument data sheets where applicable
- Utility requirements summary

#### Section 4: Applicable Drawings
- P&IDs (relevant sheets with equipment highlighted)
- General arrangement / layout drawings showing space constraints
- Interface drawings (nozzle orientations, connection points)
- Single-line diagrams (electrical equipment)

#### Section 5: Vendor Document Requirements List (VDRL)
- Complete list of documents vendor must submit
- Submission schedule (with order, during fabrication, before shipment, with delivery)
- Document format requirements and naming conventions
- Review cycle requirements and approval hold points

#### Section 6: Technical Bid Evaluation Criteria
- Mandatory (pass/fail) requirements checklist
- Weighted scoring criteria with point allocation
- Evaluation methodology and scoring guidelines
- Clarification process description

### Key Metrics

| Metric | Description | Target | Measurement |
|--------|-------------|--------|-------------|
| Package Completeness Score | Documents present vs. required per checklist | 100% | Checklist audit |
| Internal Consistency Score | Cross-document consistency checks passed | >98% | Automated cross-reference check |
| VDRL Coverage | Required vendor documents specified vs. standard list | >95% | VDRL audit |
| Issue Timeliness | Package issued vs. procurement schedule date | On or before due date | Schedule comparison |
| Clarification Rate | Vendor clarifications per package post-issue | <5 per package | Clarification log |

---

## Procedure

### Step 1: Collect and Inventory All Package Components

- Retrieve from document control the current list of all documents produced by engineering for this equipment tag or service
- Verify that all required specifications have reached at minimum IFR (Issued for Review) status; flag any specifications still in preliminary or draft status
- Confirm that process data sheets reflect the latest heat and material balance revision; cross-reference process conditions against the most recent P&ID revision
- Check that mechanical data sheets are populated with all engineering-required fields (no blanks for vendor to interpret as "not applicable")
- Verify that all referenced drawings are at the correct revision and have been formally issued through document control
- Compile the project procurement checklist for this equipment type and mark each required document as present, missing, or not applicable with justification
- Generate a package readiness report showing completeness percentage and listing all missing items with responsible discipline and expected availability date

### Step 2: Validate Internal Consistency Across Documents

- Extract design conditions (design temperature, design pressure, corrosion allowance, design life) from the mechanical specification and verify they match the process data sheet
- Verify that materials of construction specified in the process data sheet match those in the mechanical specification and piping material class
- Confirm that instrument tags referenced in the control narrative or cause-and-effect matrix match the instrument data sheets included in the package
- Check that electrical load data in the electrical data sheet matches the motor data referenced in the mechanical specification
- Validate that applicable codes and standards listed across all documents are consistent (same edition year, no conflicting requirements)
- Flag any inconsistencies as a formal discrepancy requiring engineering resolution before package issue
- Document all consistency checks performed and their results in a package validation report

### Step 3: Prepare Vendor Document Requirements List (VDRL)

- Select the standard VDRL template for this equipment category (rotating, static, electrical, instrument, packaged unit)
- Customize document requirements based on equipment complexity and project-specific needs (e.g., seismic calculations for high-seismic zones, noise predictions for equipment near occupied areas)
- Define submission milestones: With Bid, With Order Confirmation, During Engineering, Before Fabrication, Before Shipment, With Delivery, After Installation
- Specify document format requirements: file types, naming convention per project document numbering, language requirements
- Define review and approval requirements: which documents require owner review, which require formal approval (hold point), which are for information only
- Include requirements for as-built documentation, operation and maintenance manuals, and spare parts recommendations
- Cross-reference VDRL against the project document management plan to ensure alignment with overall documentation strategy

### Step 4: Define Technical Bid Evaluation Criteria

- Establish mandatory (pass/fail) requirements that vendors must meet to be considered technically acceptable (e.g., code compliance, material compliance, capacity requirements, delivery schedule)
- Define weighted scoring criteria covering: technical compliance (30-40%), experience and references (15-20%), delivery schedule (15-20%), documentation quality (10-15%), standardization and maintainability (10-15%)
- Create a bid comparison spreadsheet template with columns for each vendor and rows for each evaluation criterion
- Define the clarification process: how vendor questions will be received, how clarifications will be distributed (to all bidders for fairness), and the deadline for technical queries
- Include asset management input on standardization preferences, spare parts commonality, and maintenance accessibility requirements
- Document the evaluation methodology so that scoring is repeatable, defensible, and transparent to project governance

### Step 5: Assemble, Review, and Issue the Final Package

- Compile all validated documents into the standard package structure (cover sheet, specifications, data sheets, drawings, VDRL, evaluation criteria)
- Generate the package index with document numbers, titles, and revision status for every included document
- Perform a final completeness check against the procurement checklist; confirm 100% before proceeding
- Route the package through the engineering review cycle: Lead Discipline Engineer review, Engineering Manager approval, and Procurement Coordinator acknowledgment
- Issue the package through the formal document transmittal system with tracked distribution to all invited vendors and internal stakeholders
- Record the issue date in the project procurement tracking system and set calendar reminders for bid receipt deadline, technical evaluation start, and clarification response deadlines
- Archive the issued package revision in the project document management system as the baseline for bid evaluation

---

## Failure Modes & Common Pitfalls

| Failure Mode | Root Cause | Prevention Strategy |
|-------------|-----------|-------------------|
| Incomplete package issued to vendors | Missing documents not detected before issue; no formal completeness check | Mandatory checklist verification with sign-off before issue; automated completeness scoring |
| Inconsistent design conditions across documents | Multiple disciplines updating documents independently without cross-checking | Automated cross-reference validation tool; single-source design basis register |
| Outdated specification revisions included | Document control lag; package assembled from local copies rather than controlled repository | Always pull documents from document control system at time of assembly; verify revision currency |
| VDRL too generic or too sparse | Copy-paste from previous project without customization; inexperienced engineer preparing VDRL | Equipment-type-specific VDRL templates; senior engineer review of VDRL content |
| Evaluation criteria defined after bids received | Procurement schedule pressure; criteria perceived as administrative burden | Evaluation criteria are a mandatory package component; cannot issue package without them |
| Approved Vendor List not checked | Assumption that all vendors on bid list are pre-qualified | Automated AVL cross-check at package assembly; flag non-AVL vendors for qualification |
| Material take-off incomplete or inaccurate | Bulk material quantities estimated rather than calculated from design | MTO derived from latest issued-for-design drawings; verified by discipline engineer |

---

## Escalation Protocols

| Trigger | Timeline | Escalation Path |
|---------|----------|----------------|
| Specification not available 10 days before package due date | Immediate | Lead Discipline Engineer --> Engineering Manager --> Project Manager |
| Design condition inconsistency identified between disciplines | 48 hours to resolve | Originating discipline leads --> Engineering Manager for arbitration |
| No qualified vendors on AVL for equipment category | Immediate | Contracts Agent --> Project Manager --> Client for vendor qualification approval |
| Package completeness <90% at 5 days before due date | 24 hours | Engineering Manager --> Project Manager with recovery plan |
| Vendor clarification reveals specification error | 24 hours | Lead Discipline Engineer issues addendum; all vendors notified simultaneously |
| Bid evaluation shows no technically compliant vendor | Immediate | Engineering Manager + Contracts Agent --> Project Manager for re-bid or spec relaxation decision |
| Package issue delayed beyond procurement schedule date | Immediate upon recognition | Engineering Manager --> Project Controls --> Project Manager with impact assessment |

---

## Quality Criteria

| Dimension | Weight | Target | Measurement |
|-----------|--------|--------|-------------|
| Technical Accuracy | 30% | All design conditions consistent across documents | Cross-reference validation report with zero discrepancies |
| Completeness | 25% | 100% of required documents per procurement checklist | Checklist audit score |
| Consistency | 15% | Codes, standards, materials, conditions aligned across all documents | Automated consistency check pass rate >98% |
| Format | 10% | Professional presentation; project document standards followed | Document control review sign-off |
| Actionability | 10% | Vendors can quote without additional information from engineering | Post-issue clarification count <5 per package |
| Traceability | 10% | Every requirement traceable to design basis or code requirement | Requirement traceability matrix populated |

---

## Inter-Agent Dependencies

### Inputs From

| Agent/Skill | Input Provided | Criticality |
|-------------|---------------|-------------|
| All Engineering Disciplines | Technical specifications, data sheets, drawings | Critical |
| `agent-contracts-compliance` | Commercial terms, approved vendor list, bid list | Critical |
| `agent-asset-management` | Standardization requirements, spare parts philosophy, maintenance accessibility criteria | High |
| `manage-engineering-deliverables` (ENGD skill) | Engineering Deliverable Document Register (EDDR) with specification status and revision currency | High |
| `create-technical-specifications` (ENGD skill) | Completed and approved technical specifications per discipline | Critical |

### Outputs Consumed By

| Agent/Skill | Output Consumed | Usage |
|-------------|----------------|-------|
| `agent-contracts-compliance` | Complete procurement package for commercial bid process | Bid package issue to vendors |
| `agent-execution` | Procurement schedule input; package issue dates for project controls | Schedule tracking and forecasting |
| Vendor organizations | Technical basis for quotation preparation | Bid preparation |
| `track-engineering-manhours` (ENGD-14) | Package preparation effort data | Engineering productivity metrics |
| `generate-engineering-status-report` (ENGD-15) | Package issue status and metrics | Engineering progress reporting |

---

## References

### Methodology References
- VSC OR Playbook -- Engineering Procurement Integration section
- VSC Engineering Management Procedures -- Procurement Package Preparation Guide
- VSC Quality Management System -- Technical Bid Evaluation Methodology
- Project Execution Plan -- Procurement Strategy and Schedule sections

### Industry Standards
- ISO 19901 (Petroleum and natural gas industries -- specific requirements for offshore structures)
- ASME, API, IEEE, IEC codes as applicable per equipment type
- NORSOK standards (where applicable for oil & gas projects)
- Project-specific codes and standards register

---

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-25 | VSC OR System | Initial creation -- Wave 3 |
