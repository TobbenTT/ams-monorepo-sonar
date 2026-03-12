---
name: track-engineering-changes
description: "Manage the formal Management of Change (MOC) process for all design modifications after design freeze. Track change requests through multi-discipline impact assessment, approval, and implementation across affected documents. Triggers: 'engineering change', 'MOC', 'design change', 'cambio de ingenieria', 'control de cambios', 'modificacion de diseno'."
---

# Track Engineering Changes
## Skill ID: track-engineering-changes
## Version: 1.0.0
## Category: D - Monitoring
## Priority: Critical

## Purpose
Manages the formal Management of Change (MOC) process for all engineering design modifications that occur after design freeze milestones on capital projects. In mining, oil & gas, chemicals, and energy projects, uncontrolled engineering changes are among the top three causes of cost overruns and schedule delays. Every design change after the 60% milestone triggers a cascade of impacts across multiple disciplines, procurement packages, construction work packages, and commissioning sequences that must be systematically assessed and managed.

This skill tracks change requests from initiation through multi-discipline impact assessment, classification, approval, implementation, and verification of closure across all affected documents. It enforces a stage-appropriate change control rigor: changes before design freeze follow a streamlined process; changes after design freeze require formal impact assessment across schedule, cost, safety, and operability dimensions; changes after IFC (Issued for Construction) require emergency change authorization with field implementation verification.

In Latin American projects, particularly Chilean mining and energy projects subject to SERNAGEOMIN or SEC oversight, design changes to safety-critical systems may trigger regulatory re-approval requirements. The skill identifies changes that cross regulatory thresholds and routes them through the appropriate compliance pathway, preventing construction hold-ups due to undocumented regulatory-impact changes.

The change register produced by this skill feeds directly into the Execution agent's cost and schedule impact analysis, the Orchestrator's project performance reporting, and the Asset Management agent's as-built documentation requirements.

### Change Classification Matrix
| Class | Impact Level | Cost Threshold | Schedule Impact | Approval Authority | Typical Processing Time |
|-------|-------------|---------------|-----------------|-------------------|------------------------|
| Class 1 | Critical | >5% of project budget or >USD 500K | Critical path impact | Project Director + Client | 7-10 working days |
| Class 2 | Major | 2-5% of budget or USD 100-500K | Near-critical path impact | Engineering Manager + PM | 5-7 working days |
| Class 3 | Moderate | <2% of budget or <USD 100K | No schedule impact | Discipline Lead + EM | 3-5 working days |
| Class 4 | Minor | Negligible cost | None | Discipline Lead only | 1-2 working days |

## Intent & Specification
The AI agent MUST understand that:

1. **Design Freeze is a Contractual Milestone**: After design freeze (typically at 60% engineering completion for detailed design, or 30% for FEED), any change to the design basis, equipment specifications, layout, or control philosophy must go through the formal MOC process. The agent must know the project's design freeze date and enforce change control discipline accordingly.
2. **Change Classification Determines Process Rigor**: Changes are classified by impact magnitude -- Class 1 (Critical: safety, regulatory, or >5% cost impact), Class 2 (Major: cross-discipline, schedule, or >2% cost impact), Class 3 (Moderate: single-discipline, no schedule impact), Class 4 (Minor: editorial, drafting corrections). Higher classes require more approvals and longer assessment cycles.
3. **Multi-Discipline Impact Assessment is Mandatory**: Every change request must be assessed for impact across all potentially affected disciplines. A piping routing change may affect structural steel, electrical cable trays, instrument tubing, civil foundations, and HVAC ducting. The agent must enforce multi-discipline impact review, not just single-discipline acknowledgment.
4. **Document Cascade Tracking Prevents As-Built Gaps**: A single engineering change can affect dozens of documents across multiple disciplines. The agent must identify and track every affected document, ensuring all are revised to reflect the change before the change is marked as implemented. Incomplete document cascades are the primary cause of as-built discrepancies.
5. **Cost and Schedule Impact Must Be Quantified**: Every Class 1 and Class 2 change must include a quantified estimate of cost impact (engineering hours, material cost, construction impact) and schedule impact (critical path analysis) before approval. The agent must ensure these estimates are provided and documented.

## Trigger / Invocation
```
/track-engineering-changes
```

### Natural Language Triggers
- "Register a new engineering change request"
- "Assess the impact of a design modification"
- "Generate the engineering change status report"
- "Registrar una solicitud de cambio de ingenieria"
- "Evaluar el impacto de una modificacion de diseno"
- "Generar reporte de estado de cambios de ingenieria"

## Input Requirements

### Required Inputs
| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `change_request` | Description of the proposed change including originator, reason, affected system/area, and proposed solution | .docx / text / form | Any discipline / Construction / Operations / Client |
| `project_schedule` | Current project schedule with design freeze dates and milestone markers | .mpp / .xlsx | Execution Agent |
| `document_register` | Master document register showing all engineering deliverables and current revisions | .xlsx | Document Control |
| `design_basis_memorandum` | Current design basis document to verify whether the change deviates from approved basis | .pdf / .docx | Engineering Lead |
| `cost_baseline` | Approved project cost baseline for impact assessment | .xlsx | Execution Agent / Finance |

### Optional Inputs
| Input | Description | Default |
|-------|-------------|---------|
| `previous_change_register` | Existing change register if MOC process is already active | Create new register |
| `regulatory_thresholds` | Criteria defining when a change triggers regulatory re-approval | VSC LATAM regulatory threshold matrix |
| `contract_variation_thresholds` | Contractual limits for change orders without client approval | Project-specific; default to formal approval for all Class 1/2 |

### Context Enrichment
The agent should automatically:
- Determine the current project phase and applicable change control rigor level (pre-freeze streamlined vs. post-freeze formal vs. post-IFC emergency)
- Retrieve the affected system's engineering deliverable list to identify the full document cascade for impact assessment
- Cross-reference the proposed change against outstanding HAZOP actions, design review comments, and RFIs to determine if the change resolves an existing tracked item
- Check if the proposed change affects any safety-critical system (SIL-rated, pressure-rated, hazardous area classified) requiring enhanced assessment
- Identify whether the change crosses Chilean regulatory thresholds (SERNAGEOMIN mining safety, SEC electrical safety, SMA environmental) requiring regulatory notification

## Output Specification

### Document: Engineering Change Register & Reports
**Filename**: `VSC_ChangeRegister_{ProjectCode}_{Version}_{Date}.xlsx`

**Sheets**:

#### Sheet 1: Change Register (Master Log)
| Column | Description |
|--------|-------------|
| Change ID | Unique identifier (e.g., ECR-2100-015) |
| Title | Brief descriptive title of the change |
| Description | Detailed description of the proposed change |
| Originator | Name and discipline of the person requesting the change |
| Date Registered | Date the change request was formally registered |
| Reason Category | Safety Improvement / Operability / Constructability / Cost Optimization / Client Request / Regulatory / Design Error |
| Affected System(s) | System(s) or area(s) impacted by the change |
| Project Phase | Pre-Freeze / Post-Freeze / Post-IFC |
| Classification | Class 1 (Critical) / Class 2 (Major) / Class 3 (Moderate) / Class 4 (Minor) |
| Safety Impact | Yes / No / Under Assessment |
| Regulatory Impact | Yes / No / Under Assessment |
| Estimated Cost Impact | USD value of estimated cost impact (positive = increase) |
| Estimated Schedule Impact | Days of schedule impact on critical path |
| Status | Registered / Under Assessment / Pending Approval / Approved / Rejected / Implemented / Closed |
| Approval Date | Date of final approval or rejection |
| Implementation Target Date | Target date for completion of all document revisions |
| Actual Close Date | Date the change was verified closed |
| Change Owner | Discipline lead managing the change through the process |

#### Sheet 2: Impact Assessment
| Column | Description |
|--------|-------------|
| Change ID | Reference to master change register |
| Discipline | Engineering discipline providing the assessment |
| Scope Affected | Yes / No / Potentially |
| Affected Documents | List of document numbers requiring revision |
| Engineering Hours Impact | Estimated additional engineering hours |
| Material/Equipment Impact | Description of material or equipment changes and cost |
| Construction Impact | Description of impact on construction scope and schedule |
| Safety Assessment | Safety impact assessment narrative |
| Regulatory Assessment | Regulatory impact assessment (SERNAGEOMIN/SEC/SMA triggers) |
| Assessor Name | Name of person completing the assessment |
| Assessment Date | Date completed |

#### Sheet 3: Document Cascade Tracker
| Column | Description |
|--------|-------------|
| Change ID | Reference to master change register |
| Document Number | Affected document number |
| Document Title | Document title |
| Discipline | Owning discipline |
| Current Revision | Revision before the change |
| Target Revision | Revision that will incorporate the change |
| Revision Status | Not Started / In Progress / Issued / Transmitted |
| Target Date | Target date for revision completion |
| Actual Date | Actual date of revision completion |
| Transmittal Reference | Transmittal number for the revised document |

#### Sheet 4: Approval Workflow Log
| Column | Description |
|--------|-------------|
| Change ID | Reference to master change register |
| Approver Role | Role in approval chain (Discipline Lead, Engineering Manager, Project Manager, etc.) |
| Approver Name | Name of the approver |
| Decision | Approved / Rejected / Conditional Approval |
| Conditions | Any conditions attached to the approval |
| Decision Date | Date of the approval/rejection |
| Comments | Approver's comments or rationale |

#### Sheet 5: Change Metrics Dashboard
| Column | Description |
|--------|-------------|
| Period | Reporting period (week/month) |
| New Changes Registered | Count of new change requests in the period |
| Changes Approved | Count of changes approved in the period |
| Changes Rejected | Count of changes rejected in the period |
| Changes Closed | Count of changes fully implemented and closed |
| Cumulative Cost Impact (USD) | Running total of approved change cost impacts |
| Cumulative Cost Impact (% of Budget) | Cumulative cost as percentage of project approved budget |
| Cumulative Schedule Impact (Days) | Net schedule impact of all approved changes |
| Average Processing Time (Days) | Average days from registration to approval decision |
| Document Cascade Completion (%) | Percentage of affected documents revised across all open changes |

#### Sheet 6: Regulatory Impact Register
| Column | Description |
|--------|-------------|
| Change ID | Reference to master change register |
| Regulatory Authority | SERNAGEOMIN / SEC / SMA / SISS / Other |
| Regulation Reference | Specific regulation or permit condition affected |
| Impact Description | How the change affects the regulatory approval |
| Action Required | Notification / Amendment / Re-approval / No Action |
| Submission Date | Date regulatory submission made (if applicable) |
| Authority Response | Status of regulatory authority response |
| Compliance Status | Compliant / Pending / Non-Compliant |

### Key Metrics
| Metric | Description | Target |
|--------|-------------|--------|
| Change Processing Time | Average days from request to approval decision | Class 1: <= 10 days, Class 2: <= 7 days, Class 3: <= 3 days |
| Document Cascade Completion | % of affected documents revised after change approval | 100% within 15 working days of approval |
| Cost Impact Accuracy | Variance between estimated and actual cost impact | Within +/- 20% of estimate |
| Unauthorized Change Rate | Number of changes implemented without formal MOC approval | Zero tolerance |
| Cumulative Change Cost | Total cost of all approved changes as % of project baseline | <= 5% of approved budget (target) |

## Procedure

### Step 1: Change Request Registration and Classification
- Receive the change request and assign a unique change ID following project convention (e.g., ECR-{Area}-{Sequential}, such as ECR-2100-015)
- Capture the change metadata: originator, date, affected system/area, reason for change (categories: safety improvement, operability improvement, constructability improvement, cost optimization, client request, regulatory requirement, design error correction)
- Determine the project phase for this area to establish applicable change control rigor: Pre-Freeze (streamlined), Post-Freeze (formal), Post-IFC (emergency)
- Perform initial classification assessment: evaluate potential impact on safety, cost, schedule, and cross-discipline scope to assign Class 1/2/3/4
- Identify the change owner (discipline lead responsible for managing the change through the process) and assign review disciplines
- For Class 1 and Class 2 changes, notify the project engineering manager and Execution agent immediately upon registration
- Log the change in the master change register with status "Registered - Pending Impact Assessment"

### Step 2: Multi-Discipline Impact Assessment
- Distribute the change request to all potentially affected disciplines with a structured impact assessment form
- Each discipline must assess: whether their scope is affected (Yes/No/Potentially), specific documents affected, estimated engineering hours to implement, material or equipment changes required, and any secondary impacts triggered
- For the originating discipline, require a detailed technical justification including calculations or analysis supporting the proposed change
- Assess safety impact: does the change affect any SIL-rated function, pressure boundary, hazardous area classification, or HSE-critical system? If yes, escalate to HSE agent for formal safety assessment
- Assess regulatory impact: does the change affect any system or parameter that was part of a regulatory submission (RCA, DIA/EIA, electrical project approval)? If yes, flag for regulatory compliance review
- Compile the consolidated multi-discipline impact assessment showing all affected disciplines, cumulative engineering hours, material cost impact, and schedule impact on the critical path
- For Class 1/2 changes, require the Execution agent to provide a formal cost and schedule impact estimate before proceeding to approval

### Step 3: Approval Workflow Management
- Route the change through the approval workflow appropriate to its classification:
  - Class 4 (Minor): Discipline Lead approval only
  - Class 3 (Moderate): Discipline Lead + Engineering Manager approval
  - Class 2 (Major): Engineering Manager + Project Manager approval
  - Class 1 (Critical): Project Manager + Project Director + Client Representative approval
- Present the approval package including: change description, technical justification, multi-discipline impact assessment, cost/schedule impact, safety review results, and regulatory assessment
- Track approval status for each required approver with timestamps and any conditional approval requirements
- If any approver rejects the change, capture the rejection rationale and return to the originator for revision or withdrawal
- For conditional approvals, document the conditions and create follow-up actions to verify condition satisfaction
- Upon final approval, update the change register status to "Approved" and trigger the document cascade process
- For rejected changes, update status to "Rejected" and ensure no implementation activities have commenced

### Step 4: Implementation Tracking and Document Cascade Management
- Generate the document cascade list: identify every engineering document (drawings, specifications, calculations, data sheets, vendor documents) affected by the approved change
- Assign revision responsibility to each discipline for their affected documents, with target completion dates aligned to the project schedule
- Track document revision progress: each affected document must be revised to incorporate the change, issued through the transmittal process, and acknowledged by downstream stakeholders
- For changes affecting procurement (equipment or material modifications), coordinate with Contracts & Compliance agent to issue purchase order amendments or vendor change notices
- For changes affecting construction (field routing, foundation modifications, installation sequence changes), coordinate with Execution agent to update construction work packages and issue field change notices
- Monitor implementation progress against the target timeline; escalate documents that fall behind schedule
- Verify that all documents in the cascade have been revised, issued, and supersedure of previous revisions confirmed in the document control system

### Step 5: Closure, Metrics, and Reporting
- Verify closure criteria for each change: all documents revised, all procurement actions completed, all construction notifications issued, all regulatory submissions updated (if applicable)
- Obtain formal closure sign-off from the change owner confirming implementation is complete
- Update the change register with actual cost and schedule impact for variance analysis against the original estimate
- Generate the periodic change management report (weekly for active projects) including: new changes registered, changes approved, changes implemented, changes closed, cumulative cost/schedule impact, trend analysis
- Identify change patterns and root causes: are changes concentrated in specific disciplines, systems, or project phases? Feed pattern analysis to the Orchestrator for project health assessment
- For projects with high change rates (>3% cumulative cost impact), generate an alert to the Project Director with root cause analysis and recommended corrective actions
- Archive completed changes with full documentation trail for as-built reference and lessons learned

## Failure Modes & Common Pitfalls

| Failure Mode | Root Cause | Prevention Strategy |
|-------------|------------|---------------------|
| Unauthorized changes implemented without MOC | Field team or discipline making changes "informally" without registering | Mandatory MOC orientation for all project team members; audit field changes against change register weekly |
| Incomplete impact assessment | Affected disciplines not consulted or providing superficial assessment | Enforce mandatory response from all disciplines; reject assessments without specific document/scope impact details |
| Document cascade incomplete | Some affected documents not identified or not revised after approval | Automated document cascade generation from document register relationships; weekly cascade completion tracking |
| Cost/schedule underestimation | Impact estimates prepared without sufficient analysis | Require Execution agent formal estimate for Class 1/2; track estimate accuracy for continuous improvement |
| Regulatory impact missed | Change crosses regulatory threshold but not identified during assessment | Mandatory regulatory impact checklist for all Class 1/2 changes; automated threshold checking against regulatory submission scope |
| Change accumulation without trend analysis | Individual changes approved but cumulative impact not monitored | Weekly cumulative impact reporting; automatic alert at 3% and 5% budget impact thresholds |
| Approval bottleneck causing schedule delay | Approvers unavailable or slow to respond, holding up critical changes | Define maximum response times per classification; designate alternates for each approver role; escalation at 50% of allowed time |

## Escalation Protocols

| Trigger | Timeline | Escalation Path |
|---------|----------|-----------------|
| Class 1 change registered (safety/regulatory impact) | Immediately upon classification | Engineering Manager -> Project Director -> Client (within 24 hours) |
| Impact assessment response overdue from a discipline | 3 working days past deadline | Discipline Lead -> Engineering Manager |
| Approval decision overdue | 50% of allowed approval time elapsed | Engineering Manager -> next level approver |
| Unauthorized change discovered in field | Immediately upon discovery | Construction Manager -> Engineering Manager -> Project Director |
| Cumulative change cost exceeds 3% of budget | Upon threshold crossing | Project Manager -> Project Director -> Steering Committee |
| Regulatory re-approval triggered by change | Within 2 days of identification | Compliance Lead -> Project Director -> Client -> Regulatory Authority (SERNAGEOMIN/SEC/SMA) |
| Document cascade >30 days overdue after approval | At 30-day mark | Engineering Manager -> Project Manager |

## Quality Criteria

| Dimension | Weight | Target | Measurement |
|-----------|--------|--------|-------------|
| Technical Accuracy | 30% | >95% | Impact assessments correctly identify all affected disciplines and documents |
| Completeness | 25% | 100% | Every change registered, assessed, approved/rejected, and tracked to closure |
| Consistency | 15% | >95% | Classification criteria applied uniformly; approval workflows followed without shortcuts |
| Format | 10% | 100% | VSC standard change register format; professional impact assessment forms |
| Actionability | 10% | >90% | Impact assessments provide sufficient detail for approval decision without additional clarification |
| Traceability | 10% | 100% | Full audit trail from request to closure; every document revision linked to originating change |

## Inter-Agent Dependencies

### Inputs From
| Agent | Input Provided | Criticality |
|-------|---------------|-------------|
| Execution | Project schedule, cost baseline, critical path analysis for change impact | Critical |
| HSE | Safety assessment for changes affecting SIL/pressure/hazardous area systems | Critical |
| Operations | Operability impact assessment for changes affecting operating procedures or control logic | High |
| Contracts & Compliance | Contractual implications of changes, vendor change order management | High |
| All Engineering Disciplines | Multi-discipline impact assessment responses | Critical |

### Outputs Consumed By
| Agent | Output Provided | Trigger |
|-------|----------------|---------|
| Execution | Approved change cost/schedule impacts for project controls update | Automatic upon change approval |
| Orchestrator | Change metrics, trend analysis, cumulative impact for project reporting | Automatic weekly |
| Asset Management | Approved changes affecting equipment specifications for as-built documentation | Automatic upon document cascade completion |
| Contracts & Compliance | Change orders for vendor/contractor scope modifications | Automatic for procurement-affecting changes |
| Construction | Field change notices for approved changes affecting construction scope | Automatic for construction-affecting changes |

## References

### Methodology References
- `methodology/or-playbook-and-procedures/` -- VSC OR Playbook for change management governance framework
- `methodology/capital-projects/` -- Capital project change control procedures and classification standards
- `methodology/process-safety/` -- Process safety MOC requirements for safety-critical system changes
- `docs/architecture/_legacy/multi-agent-architecture.md` -- Multi-agent architecture for cross-agent change impact coordination

### Industry Standards
- **IEC 61511** -- Functional safety - Safety instrumented systems (MOC requirements for SIS modifications)
- **OSHA 1910.119 / PSM** -- Process Safety Management - Management of Change requirements (US reference, widely adopted in LATAM)
- **ISO 45001:2018** -- Occupational health and safety management systems - MOC provisions
- **DS 132 (SERNAGEOMIN)** -- Chilean mining safety regulations - design modification notification requirements
- **CII Best Practices** -- Construction Industry Institute guidelines for engineering change management on capital projects

## Changelog
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-25 | VSC Engineering | Initial creation -- Wave 3 |
