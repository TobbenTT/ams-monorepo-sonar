---
name: track-material-receipts
description: "Track material receiving inspection, goods receipt processing, quality checks, warehouse booking, and PO matching for OR projects. Triggers: 'material receipt', 'goods receiving', 'recepcion de materiales'."
---

# Track Material Receipts

## Skill ID: track-material-receipts
## Version: 1.0.0
## Category: C - Tracking
## Priority: Medium

---

## Purpose

Track and manage the complete material receiving process from physical arrival at site through receiving inspection, quality verification, goods receipt posting, warehouse booking, and purchase order matching. This skill ensures that every item arriving at the project site is properly inspected, documented, accepted or rejected, and recorded in the enterprise system with full traceability from supplier shipment to warehouse stock availability.

Material receiving is the critical handoff between the procurement/logistics supply chain and the physical operations of the project. It is the point where paper commitments become physical reality -- where the organization verifies that what was ordered is what was delivered, in the correct quantity, in acceptable condition, and with all required documentation. Failures at this handoff point create cascading problems: uninspected equipment may have hidden defects that surface during commissioning, unrecorded receipts create phantom inventory and financial discrepancies, and improperly stored materials deteriorate before use.

Industry data from the Construction Industry Institute (CII) shows that materials management inefficiencies account for 12-18% of project cost overruns, with receiving and warehousing errors contributing significantly. The SMRP benchmarking database reports that organizations without structured receiving processes experience 5-15% higher inventory discrepancy rates, 3-5x higher damage claims (due to late damage detection), and 20-30% longer cycle times for material availability after delivery.

For Operational Readiness specifically, the receiving process is where several critical OR checks occur: Are commissioning spares complete? Are insurance spares present and in correct specification? Do materials match the engineering specifications for the installed equipment? Is documentation (material certificates, test reports, operating manuals) complete for handover? A robust receiving process catches problems while there is still time to obtain replacements; a weak one allows problems to surface during commissioning when the consequences are far more severe.

This skill integrates with manage-logistics-coordination for pre-arrival coordination, manage-customs-clearance for post-clearance cargo collection, track-warehouse-inventory for stock booking, track-long-lead-procurement for PO milestone closure, and the OR Orchestrator for materials readiness reporting.

---

## Intent & Specification

The AI agent MUST understand and execute the following core objectives:

1. **Receiving Schedule Management**: Maintain a forward-looking schedule of expected material deliveries based on logistics tracking data, customs clearance status, and supplier shipping notifications. Ensure receiving resources (personnel, equipment, laydown area) are planned for each delivery.

2. **Physical Receiving Inspection**: Guide the receiving inspection process for each delivery:
   - **Visual inspection**: Check for transport damage, proper packaging, correct labeling
   - **Quantity verification**: Count or weigh delivered items against packing list and PO quantities
   - **Specification check**: Verify material/equipment matches PO specification (model, size, rating, material grade)
   - **Documentation check**: Confirm all required documents are present (material certificates, test reports, manuals, data sheets)
   - **Condition assessment**: Evaluate preservation condition, check for corrosion, moisture damage, or mechanical damage

3. **Quality Hold & Inspection**: For items requiring quality inspection beyond visual receiving check:
   - Route to quality hold area pending QA/QC inspection
   - Coordinate with quality team for specialized testing (dimensional, NDT, material analysis, functional test)
   - Track inspection status and results
   - Release to warehouse only after quality acceptance

4. **Goods Receipt Posting**: Post goods receipt in the enterprise system (SAP MM MIGO transaction or equivalent) to:
   - Update stock levels and material availability
   - Trigger accounts payable matching (three-way match: PO, GR, invoice)
   - Record receipt date for vendor delivery performance tracking
   - Assign storage location and bin

5. **Non-Conformance Management**: When received materials do not conform to requirements:
   - **Short shipment**: Document shortage, notify procurement for follow-up with supplier
   - **Over shipment**: Document excess, quarantine pending decision (accept, return, or store separately)
   - **Damaged goods**: Document damage with photographs, quarantine, notify carrier and insurance
   - **Wrong item**: Quarantine, notify procurement, arrange return/replacement
   - **Documentation deficiency**: Accept under conditional receipt, request missing documents from supplier
   - **Quality rejection**: Quarantine, issue non-conformance report (NCR), notify procurement and supplier

6. **PO Matching & Closure**: Track receiving progress against purchase order quantities to enable:
   - Partial receipt processing (multiple deliveries against single PO)
   - Over/under delivery tolerance management
   - PO line closure when fully received
   - Final receipt confirmation for procurement milestone closure

7. **Documentation & Traceability**: Maintain complete receiving records linking each received item to:
   - Purchase order and line item
   - Supplier and manufacturing lot/batch
   - Material certificates and test reports
   - Inspection results and condition at receipt
   - Storage location and preservation status

---

## Trigger / Invocation

```
/track-material-receipts
```

**Aliases**: `/receiving-tracker`, `/goods-receipt`, `/material-receiving`, `/recepcion-materiales`

**Primary Trigger Commands:**
- `track-material-receipts status --project [name]`
- `track-material-receipts schedule --period [today|this-week|next-week]`
- `track-material-receipts receive --delivery [ID] --po [PO-number]`
- `track-material-receipts inspect --item [material-number] --delivery [ID]`
- `track-material-receipts ncr --delivery [ID] --type [damage|shortage|wrong-item|quality]`
- `track-material-receipts post-gr --delivery [ID]`
- `track-material-receipts po-status --po [PO-number]`
- `track-material-receipts dashboard --project [name]`
- `track-material-receipts report --project [name] --period [weekly|monthly]`

**Automatic Triggers:**
- When manage-logistics-coordination reports shipment arriving T-3 days: Generate receiving preparation notice
- When manage-customs-clearance reports cargo cleared: Generate receiving readiness alert
- When delivery arrives at site gate: Initiate receiving process
- When quality inspection completed: Process result and release or quarantine
- Daily: Update receiving schedule and outstanding NCRs
- Weekly: Generate receiving status report
- Monthly: Comprehensive receiving performance report

**Event-Driven Triggers:**
- Carrier delivers cargo to site receiving area
- Supplier sends advance shipping notification (ASN)
- Quality inspection result posted (accept/reject)
- Procurement requests receipt confirmation for PO closure
- Commissioning team requests material availability confirmation
- Warehouse reports storage capacity constraint
- Insurance claim filed for damaged goods

---

## Input Requirements

### Required Inputs

| Input | Source | Required | Description |
|-------|--------|----------|-------------|
| Purchase Order Details | mcp-erp (SAP MM) | Yes | PO number, line items, quantities, specifications, delivery terms |
| Shipping Documentation | Supplier / freight forwarder | Yes | Packing list, commercial invoice, bill of lading for each delivery |
| Delivery Schedule | manage-logistics-coordination | Yes | Expected delivery dates and transport details for resource planning |
| Material Specifications | Engineering / mcp-erp | Yes | Technical specifications for verification against delivered items |
| Warehouse Layout | track-warehouse-inventory | Yes | Available storage locations and bin assignments for received materials |

### Recommended Inputs

| Input | Source | Description |
|-------|--------|-------------|
| Material Certificates | Supplier | Mill test reports, material certificates, compliance declarations |
| Equipment Manuals & Data Sheets | Supplier | O&M manuals, data sheets, installation instructions for handover documentation |
| Quality Inspection Plan | QA/QC team | Inspection requirements for specific material categories |
| Preservation Specifications | Engineering / vendor | Storage and preservation requirements for received items |
| Customs Release Documentation | manage-customs-clearance | Customs release confirming legal import clearance |

### Optional Inputs

| Input | Source | Description | Default if Absent |
|-------|--------|-------------|-------------------|
| Advance Shipping Notification | Supplier / carrier | Electronic notification of shipment details before arrival | Manual notification used |
| Barcode/RFID Data | Supplier packaging | Machine-readable identification on packages | Manual identification |
| Historical Supplier Quality Data | mcp-erp | Past quality performance for risk-based inspection intensity | Standard inspection applied |
| Receiving Area Capacity | Site logistics | Current occupancy of laydown areas and warehouses | Assumed available |
| Crane/Equipment Availability | Site construction | Heavy lift equipment for unloading oversized cargo | Requested per delivery |

---

## Output Specification

### Primary Output: Material Receipts Tracker (.xlsx)

**Filename:** `{ProjectCode}_Material_Receipts_v{version}_{date}.xlsx`

**Workbook Structure:**

#### Sheet 1: "Dashboard Summary"
- Total deliveries this period: count, PO value
- Receiving status: Scheduled / In Inspection / Accepted / Quality Hold / NCR Raised / Rejected
- PO matching status: fully received, partially received, pending first delivery
- Non-conformances: open NCRs by type (damage, shortage, wrong item, quality)
- Goods receipt postings: count and value this period
- Receiving efficiency: average time from delivery to GR posting

#### Sheet 2: "Receiving Schedule"
| Delivery ID | PO # | Supplier | Description | Expected Arrival | Transport Mode | Carrier | Unloading Requirements | Receiving Personnel | Inspection Level | Status |
|------------|------|----------|-------------|-----------------|---------------|---------|----------------------|-------------------|-----------------|--------|

#### Sheet 3: "Receiving Inspection Log"
| Receipt # | Date | Delivery ID | PO # | Line | Material # | Description | PO Qty | Delivered Qty | Accepted Qty | Condition | Docs Complete | Inspector | Result | GR # | Storage Location |
|----------|------|------------|------|------|-----------|-------------|--------|--------------|-------------|----------|--------------|----------|--------|-----|-----------------|

#### Sheet 4: "Non-Conformance Register"
| NCR # | Date | Delivery ID | PO # | Material # | NCR Type | Description | Photographs | Supplier Notified | Carrier Notified | Insurance Claim | Corrective Action | Resolution Date | Resolution | Financial Impact |
|------|------|------------|------|-----------|---------|-------------|-------------|------------------|-----------------|----------------|------------------|----------------|-----------|----------------|

#### Sheet 5: "PO Receipt Status"
| PO # | Line | Material # | Description | PO Qty | Received to Date | Remaining | % Complete | Last Receipt Date | Expected Next Delivery | PO Status |
|------|------|-----------|-------------|--------|-----------------|-----------|-----------|------------------|----------------------|----------|

#### Sheet 6: "Quality Hold Register"
| Hold ID | Date | Material # | Description | Qty | Reason for Hold | Quality Test Required | Test Date | Test Result | Release Date | Released By | Disposition |
|--------|------|-----------|-------------|-----|----------------|---------------------|----------|------------|-------------|------------|-----------|

#### Sheet 7: "Documentation Register"
| Receipt # | PO # | Material # | Material Certificate | Test Report | O&M Manual | Data Sheet | Calibration Cert | Warranty Certificate | Certificate of Conformity | Missing Documents | Follow-up Status |
|----------|------|-----------|---------------------|------------|-----------|-----------|-----------------|---------------------|--------------------------|-----------------|----------------|

#### Sheet 8: "Receiving Performance Metrics"
| Period | Deliveries Received | On-Time Receipt % | First-Time Acceptance % | NCR Rate | Avg Receipt-to-GR Time (days) | Documentation Completeness % | Damage Rate | Shortage Rate |
|--------|-------------------|-----------------|-----------------------|---------|------------------------------|----------------------------|------------|-------------|

### Secondary Output: Weekly Receiving Report (.docx)
**Filename:** `{ProjectCode}_Receiving_Weekly_{week}_{date}.docx`

Narrative report (2-4 pages):
1. Executive summary: deliveries received, items accepted, items on hold
2. Outstanding NCRs requiring management attention
3. PO receipt completion status (items fully/partially received)
4. Quality hold items and inspection status
5. Missing documentation and follow-up actions
6. Look-ahead: expected deliveries in next 14 days
7. Receiving performance metrics vs. targets

### Formatting Standards
- Status colors: Blue (#0070C0) Scheduled, Green (#00B050) Accepted, Yellow (#FFD700) Quality Hold, Orange (#FF8C00) NCR Pending, Red (#FF0000) Rejected, Grey (#808080) Returned
- NCR items: Bold red text
- Quality hold items: Yellow cell fill
- Overdue inspections: Red cell border
- All quantities in standard UoM per material master
- All dates in YYYY-MM-DD format

---

## Procedure

### Phase 1: Receiving Preparation (Steps 1-3)

**Step 1: Maintain Receiving Schedule**
1. Receive delivery notifications from manage-logistics-coordination and manage-customs-clearance
2. For each expected delivery, capture:
   - Expected arrival date and time window
   - Transport mode and carrier details
   - Cargo description, quantity, weight, dimensions
   - Unloading requirements (forklift, crane, flatbed, manual)
   - Special handling requirements (hazardous, fragile, temperature-sensitive)
3. Plan receiving resources:
   - Assign receiving inspector(s) based on delivery complexity
   - Reserve unloading equipment (crane, forklift, rigging)
   - Confirm laydown area or warehouse space availability
   - Alert quality team if specialized inspection required
4. Prepare receiving documentation:
   - Print or load PO details for quantity and specification verification
   - Prepare receiving inspection checklist
   - Set up NCR forms and camera for damage documentation

**Step 2: Pre-Arrival Documentation Review**
1. Obtain shipping documents from supplier or freight forwarder:
   - Packing list (detailed item-by-item listing)
   - Commercial invoice
   - Bill of lading / delivery note
   - Material certificates (mill test reports, certificates of conformity)
   - Test reports (factory acceptance test, pressure test, performance test)
   - Operating and maintenance manuals
2. Review documents against PO requirements:
   - Do items on packing list match PO line items and quantities?
   - Do material certificates confirm specified material grades?
   - Are test reports complete and showing conforming results?
   - Are manuals in the required language (Spanish and/or English)?
3. Identify missing documents and request from supplier before arrival
4. Flag any discrepancies for attention during physical inspection

**Step 3: Coordinate with Site Teams**
1. Notify warehouse team of expected delivery for storage preparation
2. Coordinate with construction team if delivery requires crane or special access
3. Confirm site access arrangements: gate pass, security clearance, delivery route
4. For oversized cargo: coordinate with site logistics for escort and routing
5. Notify commissioning team if delivery includes commissioning-critical items
6. Confirm inspection requirements with quality team

### Phase 2: Receiving Inspection (Steps 4-7)

**Step 4: Physical Receiving at Site**
1. When delivery arrives at site gate:
   - Verify driver/carrier identity and delivery documentation
   - Direct vehicle to designated unloading area
   - Record arrival time in receiving log
2. Unload cargo:
   - Use appropriate equipment (forklift, crane, manual handling)
   - Follow safe handling procedures (HSE requirements)
   - Exercise care to prevent handling damage
   - Stage items in receiving inspection area
3. Preliminary damage check:
   - Inspect packaging for visible damage (dents, tears, water marks, crushing)
   - If packaging damage evident: photograph before opening
   - Note packaging condition on delivery receipt before signing
   - If significant damage: sign delivery receipt as "received damaged -- subject to inspection"

**Step 5: Detailed Receiving Inspection**
1. Open packaging and inspect each item:
   - **Visual inspection**: Check for physical damage, corrosion, contamination, missing components
   - **Identification**: Verify item matches PO description (model, part number, serial number, material grade)
   - **Quantity check**: Count or weigh delivered items against packing list and PO
   - **Dimensional check** (where applicable): Verify critical dimensions against specification
   - **Preservation check**: Assess preservation condition (coating, desiccant, VCI wrapping, nitrogen purge)
2. Documentation verification:
   - Check material certificates match delivered items (heat numbers, lot numbers)
   - Verify test reports correspond to specific items (serial number traceability)
   - Confirm all required documents are present per PO requirements
3. Record inspection results:
   - Complete receiving inspection form for each PO line item
   - Photograph items showing condition, identification plates, serial numbers
   - Note any discrepancies, deficiencies, or concerns
4. Determine disposition for each item:
   - **Accept**: Item conforms to all requirements -- proceed to goods receipt posting
   - **Quality Hold**: Item requires further inspection by QA/QC -- route to quality hold area
   - **Conditional Accept**: Item acceptable but documentation incomplete -- accept with follow-up
   - **Reject**: Item does not conform -- raise NCR and quarantine

**Step 6: Process Non-Conformances**
1. For each non-conforming item, raise Non-Conformance Report (NCR):
   - NCR number (sequential)
   - Date, delivery ID, PO number, material details
   - Type: damage, shortage, over-delivery, wrong item, specification non-conformance, quality rejection, documentation deficiency
   - Detailed description with photographs
   - Impact assessment: does this affect commissioning, operations, or safety?
2. Notification actions:
   - **Damage**: Notify carrier (within 24 hours for insurance claim validity), notify supplier, notify insurance
   - **Shortage**: Notify supplier and procurement for expediting remainder
   - **Wrong item**: Notify supplier for replacement and return arrangement
   - **Quality rejection**: Notify supplier with detailed rejection reason and request corrective action
   - **Documentation deficiency**: Request missing documents with deadline
3. Quarantine non-conforming items:
   - Segregate physically from accepted stock (quarantine area)
   - Tag clearly as "NCR -- Do Not Use"
   - Record location in NCR register
4. Track NCR resolution:
   - Set resolution target date (damage: 30 days, shortage: per lead time, quality: 14 days)
   - Follow up on supplier corrective actions
   - When resolved: close NCR with final disposition (replaced, repaired, accepted, returned, scrapped)

**Step 7: Quality Hold Processing**
1. Route items to quality hold area with quality inspection request:
   - Specify what tests/inspections are required
   - Provide reference specifications and acceptance criteria
   - Set inspection due date
2. Quality team performs inspection:
   - Dimensional inspection (CMM, calipers, micrometers)
   - Non-destructive testing (ultrasonic, radiographic, magnetic particle, dye penetrant)
   - Material analysis (hardness, chemical composition, metallography)
   - Functional test (rotation, flow, pressure, electrical)
3. Process inspection results:
   - Accept: release from quality hold, proceed to goods receipt posting
   - Reject: raise NCR, quarantine, initiate supplier notification
   - Conditional accept: accept with deviation note and use-restrictions
4. Update quality hold register with results and disposition

### Phase 3: Goods Receipt & Booking (Steps 8-10)

**Step 8: Post Goods Receipt**
1. For accepted items, post goods receipt in mcp-erp (SAP MM):
   - Reference PO number and line item
   - Enter received quantity (may be partial receipt if multiple deliveries expected)
   - Assign storage location and bin as per warehouse assignment
   - Enter batch/lot number where applicable
   - Attach receiving inspection report reference
2. System processes:
   - Stock level updated (available for issue)
   - Accounts payable matching initiated (GR triggers three-way match)
   - Procurement milestone updated (delivery milestone completed)
   - Material availability status updated for commissioning planning
3. For items with shelf life: enter manufacturing date and expiry date
4. For serialized items: enter serial number for individual tracking
5. Print goods receipt document and attach to receiving file

**Step 9: Warehouse Booking**
1. Coordinate with warehouse team for physical placement:
   - Transport items from receiving area to assigned storage location
   - Verify correct bin location per material master
   - Apply preservation measures as required (indoor/outdoor, climate control, rust prevention)
   - For large equipment: coordinate heavy-lift to final storage position
2. Update bin location if actual differs from planned assignment
3. Apply identification labels: material number, description, PO reference, receipt date
4. For commissioning-reserved items: apply reservation tag and notify commissioning team
5. Confirm warehouse booking in system

**Step 10: PO Matching & Closure**
1. Update PO receipt status:
   - Calculate: PO quantity, received to date, remaining quantity
   - For partial receipt: PO remains open for balance
   - For complete receipt: mark PO line as fully received
2. Verify quantities within acceptable tolerance:
   - Under-delivery: within tolerance? (typically 5-10% for bulk materials)
   - Over-delivery: within tolerance? Accept, return, or negotiate with supplier
3. Trigger invoice verification process:
   - Three-way match: PO terms match GR quantity match invoice amount
   - Discrepancies: flag for procurement/finance resolution
4. Update track-long-lead-procurement with receipt milestone (M13: Received and Inspected)
5. Notify relevant teams of material availability:
   - Commissioning team: critical items now available
   - Maintenance: spare parts now in warehouse stock
   - Construction: installation materials received

### Phase 4: Reporting & Improvement (Steps 11-13)

**Step 11: Generate Receiving Reports**
1. Weekly receiving report:
   - Deliveries received, items accepted, NCRs raised
   - Outstanding quality holds and expected resolution
   - PO completion status
   - Missing documentation follow-up
2. Monthly receiving performance report:
   - Receiving KPIs: on-time receipt, first-time acceptance, NCR rate
   - Supplier performance: quality issues by supplier
   - Documentation completeness trends
   - Process improvement recommendations
3. Distribute reports to project stakeholders

**Step 12: Analyze Receiving Performance**
1. Calculate receiving metrics:
   - Average time from delivery to GR posting (target: <3 business days)
   - First-time acceptance rate (target: >90%)
   - NCR rate by type, by supplier, by material category
   - Documentation completeness rate at first delivery
   - Quality hold turnaround time
2. Identify recurring issues:
   - Suppliers with high NCR rates
   - Material categories with frequent quality problems
   - Documentation types most commonly missing
3. Report supplier quality issues to procurement for vendor management
4. Recommend process improvements based on data analysis

**Step 13: Lessons Learned & Continuous Improvement**
1. Document receiving process improvements and successful resolution approaches
2. Update receiving inspection checklists based on actual experience
3. Feed supplier quality data to procurement for vendor evaluation
4. Update quality inspection requirements based on actual defect patterns
5. Contribute to project lessons learned database
6. Refine receiving resource planning based on actual throughput data

---

## Quality Criteria

| Criterion | Metric | Target | Minimum Acceptable |
|-----------|--------|--------|-------------------|
| Inspection Coverage | All deliveries receive formal inspection | 100% | 100% |
| Receipt-to-GR Time | Average days from delivery to GR posting | <3 days | <5 days |
| First-Time Acceptance | Items accepted at first inspection | >90% | >85% |
| NCR Timeliness | NCR raised within 24 hours of discovery | 100% | >95% |
| NCR Resolution | NCRs resolved within target timeframe | >85% | >75% |
| Documentation Completeness | Required documents received with delivery | >90% | >80% |
| PO Accuracy | GR quantities match PO within tolerance | >98% | >95% |
| Quality Hold Turnaround | Items released from QC hold within 5 days | >85% | >75% |
| Traceability | Items traceable from receipt to storage location | 100% | 100% |
| Report Timeliness | Weekly reports distributed on schedule | 100% | >95% |
| Damage Detection | Transport damage identified at receipt (not later) | >95% | >90% |
| Data Accuracy | GR posting data matches physical receipt | >99% | >97% |

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents)

| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| `manage-logistics-coordination` | Delivery notifications | Advance notice of incoming shipments with details for receiving preparation |
| `manage-customs-clearance` | Clearance confirmation | Confirmation that imported materials are cleared for site delivery |
| `track-long-lead-procurement` | PO details | Purchase order specifications and expected delivery information |
| `agent-procurement` | Supplier contacts | Supplier contact details for non-conformance notifications |
| `manage-equipment-preservation` | Preservation specs | Storage and handling requirements for received equipment |

### Downstream Dependencies (Outputs TO other agents)

| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| `track-warehouse-inventory` | Stock updates | Goods receipt data updating warehouse stock levels |
| `track-long-lead-procurement` | Receipt milestone | PO delivery milestone completion for procurement tracking |
| `orchestrate-or-program` | Materials readiness | Receipt status data for OR program monitoring and gate reviews |
| `model-commissioning-sequence` | Material availability | Confirmation that commissioning materials are received and available |
| `agent-finance` | GR posting | Goods receipt for three-way match and accounts payable processing |

---

## References

### Standards & Best Practices
- **ISO 9001:2015** -- Quality Management Systems: receiving inspection requirements
- **ISO 55001:2014** -- Asset Management: incoming asset verification
- **SMRP Best Practice 5.0** -- Materials Management: receiving and warehousing
- **SAP MM Best Practices** -- Goods receipt processing (MIGO transaction)
- **ASME NQA-1** -- Quality assurance for nuclear-grade receiving (applicable principles for critical equipment)

### Industry Resources
- Construction Industry Institute (CII) -- Materials management best practices
- Society for Maintenance and Reliability Professionals (SMRP) -- Receiving benchmarks
- VSC Corporate Pain Points Research Report -- D-04, D-05

### Templates
- `templates/material_receipts_tracker.xlsx` -- Master receiving tracker workbook
- `templates/receiving_inspection_form.xlsx` -- Per-delivery inspection checklist
- `templates/non_conformance_report.docx` -- NCR form template
- `templates/quality_hold_request.docx` -- Quality inspection request form
- `templates/weekly_receiving_report.docx` -- Weekly status report template

---

## Changelog

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0.0 | 2025-02-25 | VSC AI Architect | Initial skill definition for Wave 1 deployment |
