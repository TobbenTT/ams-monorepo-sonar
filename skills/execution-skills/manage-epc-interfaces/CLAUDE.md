---
name: manage-epc-interfaces
description: "Manage interfaces between EPC contractor and operations team. Triggers: 'EPC interfaces', 'contractor interfaces', 'interfaces EPC'."
---

# Manage EPC Interfaces
## Skill ID: PROJ-01
## Version: 1.0.0
## Category: Project Management (Agent 6 - Execution)
## Priority: P1 - Critical

---

## Purpose

Manage and track EPC contractor interfaces throughout project execution, ensuring seamless coordination between Engineering, Procurement, and Construction phases. This skill prevents the #1 cause of project delays: interface gaps between EPC contractors and owner's team during the transition from construction to operations.

Industry data from IPA (Independent Project Analysis) consistently shows that poor interface management accounts for 30-40% of cost overruns in megaprojects. The root cause is not technical complexity but rather organizational fragmentation: different contractors, different management systems, different cultures, and misaligned incentives. When an EPC contractor's scope ends at Mechanical Completion but the owner's operations team is not ready to receive the asset, a "no man's land" emerges where accountability is unclear, documentation gaps proliferate, and punch list items cascade.

This skill addresses these challenges by establishing a structured interface management framework that tracks every touchpoint between EPC contractor scope and owner's team responsibilities. It covers three critical workflows: (1) Interface Register management for systematic identification and tracking of all interface points, (2) RFI (Request for Information) lifecycle management to prevent information bottlenecks, and (3) TOP (Transfer of Plant) processing to ensure complete and orderly handover of assets with full documentation.

A properly managed EPC interface process typically achieves: 40-60% reduction in interface-related delays, 50% reduction in unresolved RFIs at handover milestones, 90%+ documentation completeness at Transfer of Plant, and measurable improvement in first-year operational reliability due to better as-built documentation and knowledge transfer.

---

## Intent & Specification

The AI agent MUST understand and execute the following:

1. **EPC Interface Register**: Create and maintain a comprehensive register of all interfaces between EPC contractor scope and owner's team responsibilities, including TOP (Transfer of Plant) documentation requirements. The register must capture:
   - Interface identification: unique ID, description, type (Document, Physical, Schedule, Commercial)
   - Scope split definition: what is in EPC scope vs. owner scope for each interface
   - Responsible parties: EPC interface coordinator + Owner interface coordinator
   - Status tracking: Open, In Progress, Resolved, Verified, Closed
   - Linked milestones: which project milestones are affected by each interface
   - Risk rating: consequence of interface failure (High/Medium/Low)

2. **RFI Management**: Track Request for Information (RFI) lifecycle from submission through resolution, ensuring no RFIs remain unresolved beyond contractual response times. The agent must:
   - Maintain a complete RFI register with unique numbering (RFI-YYYY-NNN)
   - Track submission date, required response date, actual response date, and aging
   - Classify RFIs by category (Technical, Commercial, Schedule, HSE, Regulatory)
   - Escalate overdue RFIs through defined escalation chain
   - Analyze RFI trends to identify systemic information gaps
   - Link RFIs to affected interface items and milestones

3. **TOP Processing**: Monitor Transfer of Plant milestones including document handover, spare parts transfer, warranty activation, and as-built documentation completeness. The agent must:
   - Track TOP documentation completeness per system/subsystem
   - Verify document quality (not just receipt -- content adequacy)
   - Monitor physical asset transfer (spare parts, special tools, test equipment)
   - Track warranty activation dates and coverage per system
   - Verify training delivery as part of TOP requirements
   - Generate TOP readiness certificates when criteria are met

4. **Interface Risk Tracking**: Identify and escalate interface risks before they become blockers, particularly at handover milestones (MC, RFSU, PC). The agent must:
   - Maintain interface risk register integrated with project risk register
   - Perform weekly interface risk assessment
   - Identify early warning indicators of interface breakdown
   - Propose mitigation actions with cost-benefit analysis
   - Track mitigation implementation and effectiveness

Constraints:
- Must align with EPC contract scope split definitions
- Must track TOP documentation completeness per system/subsystem
- Must integrate with commissioning sequence (certify-system-readiness.md)
- Must reference VSC Failure Modes Table when documenting equipment-related interface issues
- Must support multiple EPC contractors on the same project
- Must maintain audit trail of all interface decisions and resolutions
- Must produce outputs in Spanish (Latin American) with English technical terms preserved

---

## VSC Failure Modes Table Reference

When documenting equipment interface issues or defects found during TOP processing, reference the official VSC Failure Modes Table (`methodology/standards/VSC_Failure_Modes_Table.xlsx`). Equipment deficiency descriptions MUST use the standard three-part structure: **[WHAT fails] -> [Mechanism] due to [Cause]** (18 mechanisms, 46 causes, 72 combinations).

### Application in EPC Interface Context

| Situation | VSC FM Table Application |
|-----------|------------------------|
| Equipment defect found during TOP inspection | Classify defect using What + Mechanism + Cause structure |
| Punch list item describing equipment malfunction | Use FM Table terminology for consistent defect description |
| Interface issue related to equipment specification mismatch | Reference FM Table mechanisms to describe potential failure modes introduced by the mismatch |
| Warranty claim documentation | Use FM Table coding for failure mode classification in warranty claims |

### Example Applications
- **TOP Defect:** "Pump PP-2201 seal -- Leaks due to Incorrect installation" (What: Mechanical seal, Mechanism: Leaks [mapped to Severs], Cause: Incorrect installation)
- **Punch List Item:** "Conveyor CV-3301 idler bearing -- Overheats/Melts due to Misalignment" (What: Bearing, Mechanism: Overheats/Melts, Cause: Misalignment)
- **Interface Issue:** "Instrument transmitter TT-4401 -- Drifts due to Incorrect calibration" (What: Temperature transmitter, Mechanism: Drifts, Cause: Incorrect calibration)

---

## Trigger / Invocation

```
/manage-epc-interfaces
```

### Command Triggers
- `manage-epc-interfaces register --project [name] --epc-contractor [name]`
- `manage-epc-interfaces rfi --action [create|track|escalate]`
- `manage-epc-interfaces top --system [system-id] --milestone [MC|RFSU|PC]`
- `manage-epc-interfaces risk --action [assess|escalate|report]`
- `manage-epc-interfaces report --type [weekly|monthly|milestone]`

### Natural Language Triggers
- "Set up EPC interface management for [project name]"
- "Create an interface register for [contractor name]"
- "Track RFIs for the EPC contract"
- "Check TOP readiness for [system]"
- "Escalate overdue RFIs"
- "Generate weekly interface status report"
- "Gestionar interfaces EPC para [proyecto]"
- "Crear registro de interfaces para [contratista]"
- "Verificar estado de transferencia para [sistema]"

### Aliases
- `/epc-interfaces`
- `/interface-register`
- `/rfi-tracker`
- `/top-tracker`

### Automatic Triggers
- New EPC contract awarded or scope change approved
- RFI aging beyond response deadline (7, 14, 21, 30 days)
- TOP milestone approaching (T-30, T-15, T-7 days)
- Interface risk rating changes to High
- Monthly reporting cycle

---

## Input Requirements

### Required Inputs

| Input | Source | Required | Format | Description |
|-------|--------|----------|--------|-------------|
| EPC Contract | Client/Project Files | Yes | .pdf / .docx | Contract scope split, deliverables list, milestones, penalty clauses, change order mechanisms |
| System Breakdown | Engineering | Yes | .xlsx / .csv | System/subsystem hierarchy for interface mapping (functional location structure) |
| TOP Checklist | Contract/Standards | Yes | .xlsx / .docx | Transfer of Plant documentation requirements per system type |
| Commissioning Sequence | certify-system-readiness.md | Yes | .xlsx / .docx | Handover milestones per system with planned dates |
| Approval Authority Matrix | Project Management | Yes | .xlsx | Who approves what level of interface resolution |

### Optional Inputs (Strongly Recommended)

| Input | Source | Required | Format | Default if Absent |
|-------|--------|----------|--------|-------------------|
| RFI Log (existing) | Project Team | No | .xlsx | New register created from scratch |
| Previous Interface Registers | Client/VSC Library | No | .xlsx | Generic template applied |
| Contractor Organization Chart | EPC Contractor | No | .pdf / .docx | Interface owners identified during setup |
| Project Schedule (P6/MSP) | Project Controls | No | .xml / .xer | Milestones extracted from contract |
| Document Management Plan | Doc Control | No | .docx | VSC standard DMP applied |
| Lessons Learned (prior projects) | VSC Knowledge Base | No | .docx / .xlsx | Generic industry lessons applied |

### Context Enrichment (Automatic)

The agent will automatically:
- Extract interface points from EPC contract scope split documents
- Map interface types based on system breakdown structure
- Identify standard TOP requirements per equipment/system type from VSC templates
- Pull RFI response time SLAs from contract conditions
- Retrieve industry-standard interface management protocols (FIDIC, NEC, EPCM)
- Access VSC lessons learned database for common EPC interface pitfalls by industry sector
- Query the VSC Failure Modes Table for equipment defect classification during TOP processing

---

## Output Specification

### Document 1: EPC Interface Register (.xlsx)

**Filename**: `{ProjectCode}_EPC_Interface_Register_v{Version}_{YYYYMMDD}.xlsx`

**Sheets:**

1. **Interface Matrix** -- All EPC-to-Owner interfaces by system
   - Columns: Interface ID, System, Subsystem, Interface Description, Type (Document/Physical/Schedule/Commercial), EPC Scope, Owner Scope, EPC Contact, Owner Contact, Status, Risk Rating, Linked Milestone, Resolution Date, Notes
   - Conditional formatting: Red (overdue), Amber (at risk), Green (on track)

2. **RFI Tracker** -- Full RFI lifecycle with aging analysis
   - Columns: RFI Number, Date Submitted, Category, Subject, Submitted By, Assigned To, Required Response Date, Actual Response Date, Aging (days), Status (Open/In Review/Responded/Closed), Impact Assessment, Linked Interface ID
   - Auto-calculated aging with escalation thresholds highlighted

3. **TOP Status** -- Per-system TOP completeness dashboard
   - Columns: System ID, System Name, TOP Item Category, TOP Item Description, Required (Y/N), Received (Y/N), Quality Verified (Y/N), Completeness %, Target Date, Actual Date, Responsible Party
   - Summary row per system showing overall TOP completeness percentage

4. **Risk Log** -- Interface-related risks with mitigation status
   - Columns: Risk ID, Interface ID, Risk Description, Probability (1-5), Consequence (1-5), Risk Score, Mitigation Action, Mitigation Owner, Due Date, Status, Residual Risk
   - Heat map visualization by probability and consequence

5. **Action Items** -- Open items by responsible party and deadline
   - Columns: Action ID, Source (Interface/RFI/TOP/Risk), Description, Responsible Party, Due Date, Priority, Status, Completion Date, Verification
   - Filtered views by responsible party, priority, and status

6. **Dashboard** -- Summary statistics and KPIs
   - Total interfaces: Open/In Progress/Resolved/Closed
   - RFI aging distribution chart data
   - TOP completeness by system (bar chart data)
   - Risk distribution heat map data
   - Trend charts (weekly interface closure rate, RFI submission/resolution rate)

### Document 2: Interface Status Report (.docx)

**Filename**: `{ProjectCode}_Interface_Status_Report_v{Version}_{YYYYMMDD}.docx`

**Structure:**

1. **Cover Page** -- VSC branding, project identification, reporting period, revision status
2. **Document Control** -- Revision history, distribution list
3. **Executive Summary** (1 page)
   - Overall interface health (traffic light)
   - Key metrics: total interfaces, % resolved, overdue RFIs, TOP completeness
   - Top 3 critical issues requiring management attention
4. **Interface Health Dashboard** (1-2 pages)
   - Traffic light status by system (Green/Amber/Red)
   - Interface resolution trend (cumulative S-curve)
   - Heat map of interface concentration by area/system
5. **Critical RFIs** (1-2 pages)
   - All RFIs aging > 14 days with impact assessment
   - Escalation actions taken and recommended
   - RFI submission/resolution trend analysis
6. **TOP Progress by System** (2-3 pages)
   - System-by-system TOP completeness with traffic light
   - Critical document gaps identified
   - Physical asset transfer status (spare parts, tools)
   - Training delivery status
7. **Risk Escalations** (1-2 pages)
   - High-rated interface risks with mitigation status
   - New risks identified during reporting period
   - Risks closed or downgraded
8. **Recommended Actions** (1 page)
   - Prioritized list of actions for management decision
   - Resource requirements for accelerated resolution
   - Proposed schedule for interface resolution workshops
9. **Appendices**
   - A: Complete RFI aging report
   - B: TOP completeness detail by system
   - C: Interface action item register

---

## Methodology & Standards

### Primary Standards (Mandatory Compliance)

| Standard | Application |
|----------|-------------|
| **AACE RP 10S-90** | Cost Engineering Terminology -- interface management definitions |
| **ISO 21500:2021** | Project Management -- stakeholder interface protocols and governance |
| **FIDIC Conditions of Contract** | Standard EPC interface clauses, variation procedures, and claim management |
| **ISO 19650** | Information management using BIM -- document handover protocols |
| **ISO 55001:2014** | Asset Management -- requirements for asset information handover |

### Secondary Standards (Reference)

| Standard | Application |
|----------|-------------|
| **NEC4 ECC** | Engineering and Construction Contract -- interface management clauses |
| **AACE RP 25R-03** | Estimating Lost Productivity in Construction Claims |
| **PMI PMBOK 7th Edition** | Stakeholder management and integration management |
| **CII (Construction Industry Institute)** | Interface management best practices for megaprojects |
| **COAA (Construction Owners Association of Alberta)** | Best practices for management of EPC interfaces |

### Owner's Project Requirements (OPR) Framework

The OPR framework defines the minimum information that must transfer from EPC contractor to owner at each milestone:

| Milestone | Document Requirements | Physical Requirements |
|-----------|----------------------|----------------------|
| **MC (Mechanical Completion)** | As-built drawings, equipment datasheets, vendor manuals, test certificates, material certificates | Installed equipment verified, punch list Category A = 0 |
| **RFSU (Ready for Start-Up)** | Operating procedures, maintenance procedures, calibration records, loop test records | Utilities connected, safety systems verified, operators trained |
| **PC (Practical Completion)** | Performance test reports, final as-built documentation, warranty certificates | Performance guarantees demonstrated, all Category B resolved |
| **Final Acceptance** | Complete document set per contract, lessons learned, final account | Defects liability period complete, retentions released |

### Interface Classification Taxonomy

| Type | Description | Examples |
|------|-------------|---------|
| **Document** | Information or document exchange between parties | Drawings, specifications, data sheets, procedures, certificates |
| **Physical** | Physical connection or interface between scopes | Pipe tie-ins, cable terminations, structural connections, utility connections |
| **Schedule** | Temporal dependency between activities | Area handover for follow-on work, commissioning sequence dependencies |
| **Commercial** | Financial or contractual interface | Change orders, back-charges, warranty boundaries, insurance coverage |

---

## Step-by-Step Execution

### Phase 1: Interface Identification & Setup (Steps 1-3)

**Step 1: Initialize Interface Register**
1. Parse EPC contract scope split document to identify all boundary points
2. Map all interface points between EPC scope and Owner scope using system breakdown structure
3. Classify interfaces by type: Document, Physical, Schedule, Commercial
4. Assign interface owners (EPC side + Owner side) for each interface point
5. Define interface risk rating based on consequence of failure (High/Medium/Low)
6. Link each interface to relevant project milestones (MC, RFSU, PC)
7. **Quality gate**: All contract-defined interfaces captured; no orphan scope items

**Step 2: Establish RFI Protocol**
1. Define RFI categories aligned with contract structure:
   - Technical: design clarifications, specification interpretations, technical deviations
   - Commercial: cost implications, variation proposals, back-charge disputes
   - Schedule: milestone adjustments, access requirements, resource availability
   - HSE: safety method statements, environmental approvals, permit requirements
2. Set response time SLAs per category:
   - Safety/HSE: 48 hours
   - Technical (critical path): 5 business days
   - Technical (non-critical): 10 business days
   - Commercial: 10 business days
   - Schedule: 5 business days
3. Create RFI numbering convention: RFI-{ContractorCode}-{YYYY}-{NNN}
4. Configure aging alerts at 7, 14, 21, and 30 days
5. Define escalation chain: Level 1 (Interface Coordinator), Level 2 (Project Manager), Level 3 (Project Director), Level 4 (Steering Committee)
6. **Quality gate**: RFI protocol approved by all parties

**Step 3: Configure TOP Tracking**
1. Map TOP requirements per system/subsystem based on contract deliverables list
2. Define document completeness criteria per TOP item:
   - Received: document submitted by EPC
   - Reviewed: document reviewed by Owner's team
   - Accepted: document meets quality requirements
   - Filed: document stored in document management system with correct metadata
3. Link TOP milestones to commissioning sequence (from certify-system-readiness.md)
4. Create TOP readiness dashboard with automatic completeness calculation
5. Define TOP certificate template and sign-off authority
6. **Quality gate**: TOP requirements agreed with EPC contractor

### Phase 2: Ongoing Management (Steps 4-6)

**Step 4: Monitor Interface Resolution**
1. Weekly review of all open interfaces against planned resolution dates
2. Update interface status based on evidence of resolution (not just verbal confirmation)
3. Identify interfaces at risk of missing milestone deadlines
4. Coordinate resolution workshops for complex multi-party interfaces
5. Track cumulative interface resolution rate against S-curve plan
6. Escalate interfaces that have been open > 30 days without progress

**Step 5: Manage RFI Lifecycle**
1. Log new RFIs with complete information (description, context, impact if not resolved)
2. Route RFIs to correct responder based on category and subject matter
3. Track response quality (not just timeliness -- is the response adequate?)
4. Manage RFI closure: verify response addresses the question, obtain originator acceptance
5. Analyze RFI trends weekly:
   - Submission rate trending up or down?
   - Which categories dominate?
   - Which responders are consistently late?
   - Are there repeat topics indicating systemic information gaps?
6. Generate RFI aging report with impact assessment for overdue items

**Step 6: Process TOP Milestones**
1. At T-30 days before TOP milestone: generate TOP readiness assessment
2. Identify documentation gaps and issue catch-up plan to EPC contractor
3. At T-15 days: conduct TOP readiness review meeting with EPC and Owner teams
4. At T-7 days: final TOP completeness check, escalate any remaining gaps
5. At TOP date: conduct formal TOP walkdown and documentation review
6. Issue TOP certificate (or rejection with specific deficiency list)
7. Track post-TOP residual items to closure

### Phase 3: Reporting & Continuous Improvement (Steps 7-8)

**Step 7: Generate Reports**
1. Weekly interface status update (automated from register data)
2. Bi-weekly RFI aging report with escalation recommendations
3. Monthly TOP progress report by system
4. Milestone-specific interface readiness reports (at MC-30, RFSU-30, PC-30)
5. Escalation of critical items to project manager with recommended actions

**Step 8: Capture Lessons Learned**
1. At each major milestone (MC, RFSU, PC), capture interface lessons learned
2. Identify interface management process improvements
3. Document common RFI topics for use in future project planning
4. Update VSC interface management templates based on project experience
5. Propose methodology updates for `methodology/lessons-learned/`

---

## Quality Criteria

### Content Quality (Target: >91% Compliance)

| Criterion | Weight | Metric | Target |
|-----------|--------|--------|--------|
| Interface Coverage | 25% | % of contract interfaces mapped in register | 100% |
| RFI Response Time | 20% | % of RFIs responded within SLA | >90% |
| TOP Completeness | 20% | % of required documents received per system at milestone | Track to 100% at MC |
| Risk Identification | 15% | Interface risks logged before impact occurs | >85% proactive |
| Report Timeliness | 10% | Weekly reports delivered on schedule | 100% |
| Data Accuracy | 10% | Interface register data matches actual status | >95% |

### Automated Quality Checks

- [ ] Every EPC contract interface point has a corresponding entry in the register
- [ ] Every interface has assigned owners (both EPC and Owner side)
- [ ] No RFIs with status "Open" and aging > 30 days without escalation record
- [ ] TOP completeness calculated correctly (verified against source documents)
- [ ] Risk ratings consistent with consequence and probability assessments
- [ ] All action items have assigned responsible parties and due dates
- [ ] Interface register updated within 48 hours of any status change
- [ ] Weekly reports contain data no older than 5 business days
- [ ] Equipment defects in TOP process use VSC FM Table classification
- [ ] No "TBD," "pending," or placeholder entries in any deliverable fields
- [ ] Interface IDs are unique and follow naming convention
- [ ] All closed interfaces have resolution evidence documented

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs From)

| Agent | Dependency Type | Description | Criticality |
|-------|----------------|-------------|-------------|
| agent-contracts-compliance | Upstream | EPC contract scope split definitions, contractual milestone criteria, change order mechanisms | Critical |
| agent-execution (engineering) | Upstream | System breakdown structure, equipment register, design documentation | Critical |
| orchestrate-or-agents (doc control) | Upstream | Document numbering conventions, filing structure, transmittal protocols | High |
| agent-hse | Upstream | Safety requirements for interface activities, permit requirements | High |

### Downstream Dependencies (Outputs To)

| Agent | Dependency Type | Description | Trigger |
|-------|----------------|-------------|---------|
| agent-execution (commissioning) | Downstream | Interface register feeds commissioning sequence and system readiness verification | Continuous |
| agent-execution (construction) | Bilateral | Construction quality verification tied to interface items; punchlist integration | Continuous |
| agent-operations | Downstream | TOP documentation completeness feeds operations readiness assessment | At RFSU milestone |
| agent-asset-management | Downstream | Equipment documentation from TOP feeds asset register and maintenance planning | At MC/RFSU milestone |
| agent-hse | Bilateral | Safety-related interface items escalated to HSE for review and approval | On identification |
| orchestrate-or-agents (doc control) | Downstream | Interface documents filed per project naming convention and document management plan | Continuous |
| track-progressive-handover.md | Downstream | Interface status feeds progressive handover tracking at each milestone | At milestones |
| manage-change-control.md | Bilateral | Interface scope changes routed through change control process | On change identification |

---

## Templates & References

### Document Templates
- `VSC_EPC_Interface_Register_Template_v2.0.xlsx` -- Standard interface register with all sheets pre-formatted
- `VSC_RFI_Form_Template_v1.5.docx` -- Standard RFI submission form with required fields
- `VSC_TOP_Checklist_Template_v2.0.xlsx` -- Transfer of Plant checklist by system type (rotating equipment, static equipment, electrical, instrumentation, civil)
- `VSC_Interface_Risk_Assessment_Template_v1.0.xlsx` -- Risk assessment template with 5x5 matrix
- `VSC_Interface_Status_Report_Template_v1.0.docx` -- Weekly/monthly report template with VSC branding
- `VSC_TOP_Certificate_Template_v1.0.docx` -- Transfer of Plant certificate for milestone sign-off

### Reference Data Sources
- FIDIC Red Book (2017) -- Conditions of Contract for Construction
- FIDIC Silver Book (2017) -- Conditions of Contract for EPC/Turnkey Projects
- CII Publication RT-302 -- Interface Management for Large Capital Projects
- COAA Best Practice Document -- Management of Interfaces in EPC Projects
- IPA (Independent Project Analysis) -- Megaproject Interface Management Research
- VSC Internal Lessons Learned Database -- EPC interface issues from prior projects

### Knowledge Base
- Past EPC interface management projects by industry sector (mining, O&G, power, chemicals)
- Common interface failure patterns by project type and contracting strategy
- RFI trend analysis templates and interpretation guides
- TOP documentation standards by equipment type
- Interface workshop facilitation guides
- Escalation protocol templates by organizational structure

---

## Examples

See [`references/skill-examples.md`](references/skill-examples.md) for detailed examples.

## MCP Integrations

See [`references/skill-mcp-integrations.md`](references/skill-mcp-integrations.md) for detailed mcp integrations.
