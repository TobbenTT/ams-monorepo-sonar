---
name: manage-design-reviews
description: "Orchestrate formal design review process across all engineering disciplines at key project milestones (30%, 60%, 90%, IFC). Manages review packages, comment capture, severity classification, and sign-off tracking. Triggers: 'design review', 'IDR', 'review milestone', 'revisión de diseño', 'revisión interdisciplinaria', 'paquete de revisión'."
---

# Manage Design Reviews
## Skill ID: manage-design-reviews
## Version: 1.0.0
## Category: C - Planning
## Priority: Critical

## Purpose
Orchestrates the formal design review process across all engineering disciplines at key project milestones (30%, 60%, 90%) and for safety-critical reviews (HAZOP, SIL assessment, constructability). In capital projects for mining, oil & gas, chemicals, and energy sectors, design reviews are the primary quality gate mechanism ensuring that engineering deliverables meet project requirements before progression to the next design stage.

A poorly managed design review process leads to late-stage rework, construction delays, commissioning defects, and operational safety gaps. In Latin American mega-projects, where multiple EPC contractors and EPCM consultants often operate simultaneously, the formal Interdisciplinary Design Review (IDR) is the critical coordination mechanism that catches interface conflicts, specification errors, and constructability issues before they become field problems.

This skill produces structured review packages, facilitates comment capture using industry-standard severity classifications, tracks comment resolution through closure cycles, and generates the formal sign-off documentation required for stage-gate advancement. The output integrates directly with the project document control system and feeds the Execution agent's gate review process.

For projects subject to Chilean regulatory oversight (SERNAGEOMIN for mining, SEC for electrical, SISS for water), design reviews must explicitly verify compliance with local codes at each milestone, ensuring that international engineering standards are correctly adapted to the Chilean normative framework.

Industry benchmarks from CII (Construction Industry Institute) and IPA (Independent Project Analysis) demonstrate that projects with disciplined design review processes experience 30-40% fewer field rework events, 15-25% reduction in commissioning punch list items, and significantly fewer safety incidents attributable to design deficiencies. The cost of identifying and resolving a design error during the review phase is estimated at 1/10th the cost of correcting the same error during construction and 1/100th during operations.

## Intent & Specification
The AI agent MUST understand that:

1. **Stage-Gated Process is Non-Negotiable**: Design reviews occur at defined milestones (30%, 60%, 90%, IFC/AFC) with increasing rigor. The 30% review focuses on design basis and concept validation; the 60% review verifies detailed design development and interface resolution; the 90% review confirms construction-readiness and procurement alignment; the IFC review is the final hold point before issuing documents for construction.
2. **Severity Classification Drives Resolution Priority**: Every review comment must be classified using a standardized severity scale (Critical / Major / Minor / Observation). Critical and Major comments are mandatory-close before gate advancement; Minor comments may be tracked forward with documented justification; Observations are recorded for continuous improvement.
3. **Interdisciplinary Coordination is the Core Value**: The primary purpose of design reviews is to identify cross-discipline conflicts (e.g., piping routing vs. structural steel, instrument cable tray vs. HVAC ducts, process conditions vs. material selection). Single-discipline reviews catch internal errors; IDRs catch interface errors.
4. **Sign-Off is a Formal Engineering Act**: Design review sign-off by discipline leads constitutes professional endorsement that the design is fit for the stated purpose at the stated milestone. The agent must track individual sign-offs with timestamps and any conditional approvals.
5. **Comment Resolution Must Be Traceable**: Every comment must have a unique identifier, an originator, a response from the responsible discipline, and a verification of closure. The comment register is an auditable record that may be examined during commissioning investigations or regulatory audits.

## Trigger / Invocation
```
/manage-design-reviews
```

### Natural Language Triggers
- "Prepare design review package for 60% milestone"
- "Set up IDR for the process plant area"
- "Track design review comments and closure status"
- "Preparar paquete de revisión de diseño para hito del 60%"
- "Organizar revisión interdisciplinaria de ingeniería"
- "Dar seguimiento a comentarios de revisión de diseño"

## Input Requirements

### Required Inputs
| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `project_schedule` | Master project schedule with engineering milestones and review dates | .mpp / .xlsx / .pdf | Execution Agent |
| `document_register` | List of engineering deliverables with current revision status per discipline | .xlsx / .csv | Document Control |
| `review_milestone` | Target milestone for this review (30% / 60% / 90% / IFC) | Text | User / Execution Agent |
| `discipline_list` | Engineering disciplines in scope (Process, Mechanical, Piping, Electrical, I&C, Civil/Structural, HVAC) | Text / .xlsx | Project Manager |
| `design_basis_memorandum` | Project design basis document defining key criteria and standards | .pdf / .docx | Engineering Lead |

### Optional Inputs
| Input | Description | Default |
|-------|-------------|---------|
| `previous_review_comments` | Comment register from prior milestone review | None (first review assumed) |
| `hazop_report` | HAZOP study report if safety review is in scope | Generate RFI to HSE agent |
| `client_review_requirements` | Client-specific review procedures or checklists | VSC standard IDR procedure |
| `regulatory_checklist` | Chilean/local regulatory compliance verification items | VSC LATAM regulatory checklist |

### Context Enrichment
The agent should automatically:
- Retrieve the project's engineering deliverable list and current completion percentages from the document register
- Cross-reference scheduled review dates against actual document readiness to flag packages that are not yet review-ready
- Pull any outstanding comments from previous milestone reviews that remain open
- Identify safety-critical systems requiring enhanced review depth (HAZOP follow-up, SIL verification, ATEX/hazardous area classification)
- Check for applicable Chilean regulatory hold points (e.g., SERNAGEOMIN design approval milestones for mining projects)

## Output Specification

### Document 1: Design Review Report (.docx)
**Filename**: `VSC_DesignReview_{ProjectCode}_{Milestone}_{Area}_{Version}_{Date}.docx`

**Structure**:
1. **Cover Page** -- VSC branding, project identification, milestone designation, review date
2. **Review Scope & Objectives** -- Systems/areas under review, disciplines participating, specific review objectives for this milestone, reference to design basis memorandum and applicable standards
3. **Document Readiness Matrix** -- Table showing each deliverable, its target revision, actual revision, and readiness status (Ready / Partial / Not Ready)
4. **Review Agenda & Schedule** -- Day-by-day review schedule with discipline slots, presenters, and reviewers assigned
5. **Review Findings Summary** -- Executive summary of key findings by discipline, critical interface issues identified, and comparison with previous milestone review metrics
6. **Regulatory Compliance Verification** -- Checklist of Chilean/LATAM regulatory requirements verified during review (SERNAGEOMIN, SEC, SISS, SMA as applicable)
7. **Sign-Off Sheet** -- Formal sign-off by each discipline lead with date, conditional remarks, and approval status (Approved / Approved with Comments / Not Approved)
8. **Gate Recommendation** -- Overall recommendation (Proceed / Conditional Proceed / Hold) with justification and conditions for advancement

### Document 2: Comment Register Workbook (.xlsx)
**Filename**: `VSC_ReviewComments_{ProjectCode}_{Milestone}_{Area}_{Version}_{Date}.xlsx`

**Sheets**:

#### Sheet 1: Comment Register
| Column | Description |
|--------|-------------|
| Comment ID | Unique identifier (e.g., DR-60-2100-001) following project convention |
| Discipline (Originator) | Engineering discipline raising the comment |
| Originator Name | Name of the reviewer raising the comment |
| Document Number | Document being reviewed (drawing number, spec number) |
| Document Title | Title of the reviewed document |
| Sheet/Page/Clause | Specific location within the document |
| Severity | Critical / Major / Minor / Observation |
| Comment Description | Detailed description of the issue identified |
| Recommended Action | Suggested resolution or required change |
| Responsible Discipline | Discipline responsible for resolution |
| Response | Technical response from the responsible discipline |
| Response Date | Date the response was provided |
| Status | Open / Responded / Verified Closed / Carried Forward |
| Closure Evidence | Reference to revised document or calculation confirming resolution |
| Verification Date | Date the closure was verified by the originator |
| Carry-Forward Justification | For Minor/Observation items carried to next milestone, the documented rationale |

#### Sheet 2: Document Readiness Matrix
| Column | Description |
|--------|-------------|
| Document Number | Engineering document number |
| Document Title | Document title |
| Discipline | Owning discipline |
| Target Revision | Revision expected for this milestone |
| Actual Revision | Revision available at review date |
| Readiness Status | Ready / Partial / Not Ready |
| Gap Description | For Partial/Not Ready, what is missing or incomplete |
| Estimated Ready Date | When the document will reach target revision |

#### Sheet 3: Interface Issue Register
| Column | Description |
|--------|-------------|
| Interface ID | Unique identifier for the interface issue |
| Discipline A | First discipline involved in the interface |
| Discipline B | Second discipline involved in the interface |
| Interface Description | Description of the interface conflict or coordination need |
| Severity | Critical / Major / Minor |
| Resolution Owner | Discipline or person assigned to resolve |
| Resolution Description | How the interface was or will be resolved |
| Status | Open / In Progress / Resolved / Escalated |

#### Sheet 4: Sign-Off Tracker
| Column | Description |
|--------|-------------|
| Discipline | Engineering discipline |
| Lead Name | Discipline lead responsible for sign-off |
| Sign-Off Status | Approved / Approved with Comments / Not Approved / Pending |
| Date Signed | Date of sign-off |
| Conditions | Any conditions attached to the approval |
| Outstanding Items | Specific items carried forward under this discipline's responsibility |

#### Sheet 5: Review Metrics Dashboard
| Column | Description |
|--------|-------------|
| Metric | KPI name |
| This Review Value | Current milestone review metric value |
| Previous Review Value | Prior milestone review metric value for trend comparison |
| Target | Target value per project standard |
| Status | On Target / Below Target / At Risk |
| Trend | Improving / Stable / Deteriorating |

### Key Metrics
| Metric | Description | Target |
|--------|-------------|--------|
| Comment Closure Rate | % of Critical+Major comments closed before gate | >= 100% Critical, >= 95% Major |
| Document Readiness Index | % of deliverables at target revision for review | >= 90% at milestone |
| Review Cycle Time | Days from review start to all-discipline sign-off | <= 10 working days |
| IDR Coverage | % of interface points formally reviewed | 100% for Critical interfaces |
| Carryover Comment Ratio | % of comments carried forward from prior milestone | <= 5% Critical, <= 15% Major |

## Procedure

### Step 1: Review Package Preparation (Pre-Review)
- Retrieve the engineering deliverable list for the target milestone from the document register and filter by area/system scope
- For each deliverable, verify the current revision against the target revision for this milestone using the document readiness matrix
- Flag documents that have not reached the target revision as "Conditional Review" (within one revision of target) or "Not Ready" (more than one revision behind)
- Calculate the Document Readiness Index: % of deliverables at or above target revision; if below 90%, escalate to Engineering Manager for go/no-go decision on the review
- Compile the review package binder/folder containing: all documents at current revision, the design basis memorandum, any HAZOP/SIL study reports, and previous milestone review comments that remain open
- Assemble the review agenda based on discipline sequence (typically: Process first, then Mechanical/Piping, Electrical/I&C, Civil/Structural, HSE/Environmental), allocating time proportional to document volume and complexity per discipline
- Generate the blank comment register workbook pre-populated with document numbers, disciplines, severity classification dropdowns, and status tracking columns
- Prepare the regulatory compliance verification checklist specific to this milestone and project jurisdiction (Chilean regulatory hold points, SERNAGEOMIN approval gates, SEC electrical design verification)
- Distribute the complete review package to all participants with minimum 5 working days lead time for pre-review preparation

### Step 2: Interdisciplinary Review Facilitation
- Conduct a severity classification calibration session at the start of the review: present the severity definitions with project-specific examples to ensure all reviewers apply the same criteria
- Structure the review sessions by system/area rather than by discipline to maximize cross-discipline interaction; ensure minimum 3 disciplines represented in each session
- For each deliverable under review, verify alignment with the design basis memorandum, the applicable process description, and any HAZOP/SIL recommendations
- Capture each comment in real-time using the comment register workbook with: unique comment ID (auto-generated), originator name and discipline, document reference, drawing/page/clause number, severity classification, description of the issue, and recommended action
- Apply severity classification consistently: Critical = safety or regulatory non-compliance or fundamental design error requiring immediate resolution; Major = functional deficiency requiring redesign or specification change; Minor = detail error correctable without design change or scope impact; Observation = improvement suggestion for consideration
- Specifically check for common interdisciplinary interface issues: piping routing vs. structural steel clashes, instrument cable tray vs. HVAC duct conflicts, process conditions vs. material of construction alignment, equipment nozzle orientations vs. piping isometric compatibility, electrical load list vs. MCC/switchgear sizing, and control narrative alignment with P&ID control loops
- Flag all interface conflicts in the dedicated Interface Issue Register (Sheet 3 of the workbook) and assign a lead resolver discipline with a resolution deadline
- Record any design decisions made during the review session with: decision description, rationale, attendee concurrence (names), and any dissenting views
- Track action items separately from comments where immediate follow-up is needed outside the normal comment response cycle

### Step 3: Comment Response & Resolution Tracking
- Distribute the compiled comment register to responsible discipline leads within 2 working days of review completion
- Track responses from each discipline against the agreed response deadline (typically 5-10 working days depending on comment volume)
- Verify that each response addresses the technical substance of the comment, not merely acknowledges it
- For Critical and Major comments, require documented evidence of resolution (revised drawing markup, updated calculation, specification amendment)
- Escalate overdue responses through the project engineering manager, applying the escalation protocol table below
- Maintain a running comment status dashboard: Open, Responded, Verified Closed, Carried Forward (with justification)
- Generate weekly comment resolution progress reports for the project team

### Step 4: Sign-Off & Gate Recommendation
- Verify gate readiness criteria: 100% of Critical comments verified closed, >= 95% of Major comments verified closed, all carried-forward items have documented justification and mitigation plan
- Prepare the sign-off sheet pre-populated with: discipline name, discipline lead name, comment summary for their discipline (total/open/closed), and sign-off status field
- Each discipline lead reviews the final comment status for their discipline and signs off with one of three designations: Approved (no outstanding items), Approved with Comments (listing specific carried-forward items and their expected resolution date), or Not Approved (with mandatory written justification identifying the specific blocking issues)
- For "Not Approved" designations, immediately convene a resolution meeting between the refusing discipline, the affected discipline(s), and the Engineering Manager to resolve the blocking issue or formally document the impasse
- Compile the design review closeout report including: executive summary of findings, total comments by severity and discipline with Pareto analysis, closure statistics with trend comparison to previous milestone, outstanding items register with mitigation plans and owners, regulatory compliance verification results, and the overall gate recommendation
- Submit the gate recommendation to the Execution agent with one of three designations: Proceed (all criteria met), Conditional Proceed (proceed with documented conditions and monitoring plan), or Hold (cannot proceed until specified issues are resolved)
- Archive the complete review package (all documents reviewed at their review revision, comment register workbook, sign-off sheets, meeting minutes, attendance records, and gate recommendation) in the project document management system with controlled access

### Milestone-Specific Review Focus Areas
The review depth and focus varies by milestone. The agent must apply the correct emphasis:

| Milestone | Primary Focus | Key Deliverables Under Review | Gate Criteria |
|-----------|--------------|-------------------------------|---------------|
| 30% | Design basis validation, concept selection, major equipment sizing | PFDs, design basis memorandum, equipment list (preliminary), plot plan (preliminary) | Design basis confirmed; major equipment selected; layout concept approved |
| 60% | Detailed design development, interface resolution, procurement alignment | P&IDs (IFD), equipment data sheets, single line diagrams, instrument index, piping specs | All P&IDs issued; equipment specs ready for RFQ; interfaces defined |
| 90% | Construction readiness, IFC documentation, procurement completion | P&IDs (IFC), piping isometrics, structural steel details, cable schedules, instrument hook-ups | All IFC documents issued or scheduled; procurement 95%+ complete; construction can start |
| IFC/AFC | Final verification, as-built alignment, regulatory compliance | Final IFC drawings, approved vendor data, regulatory approvals | All documents at IFC revision; all vendor data at Code A/B; regulatory approvals received |

### Step 5: Lessons Learned & Metrics Update
- Analyze comment patterns across disciplines to identify systemic design quality issues (e.g., recurring piping/structural clashes, persistent instrument specification gaps, repeated material selection errors)
- Generate Pareto analysis of comments by: discipline, document type, severity, and root cause category (design error, interface conflict, specification ambiguity, code non-compliance, constructability issue)
- Calculate and publish review KPIs in the Review Metrics Dashboard (Sheet 5): comment density per document type, average closure cycle time by discipline, carryover ratio trends across milestones, first-time-right percentage
- Compare current milestone metrics against previous milestone and against project targets; highlight improving and deteriorating trends
- Identify disciplines or contractors generating disproportionate Critical/Major comments for targeted quality improvement actions
- For EPC/EPCM projects with multiple contractors, benchmark review metrics across contractors to identify best practices and performance gaps
- Feed lessons learned into the Orchestrator agent for project performance reporting and the Execution agent for gate review documentation
- Update the review procedure template and severity classification guide with any improvements identified during this review cycle
- For the final IFC review, compile the complete review history across all milestones as part of the project quality record

## Failure Modes & Common Pitfalls

| Failure Mode | Root Cause | Prevention Strategy |
|-------------|------------|---------------------|
| Incomplete review package | Documents not reaching target revision before review date | Enforce document readiness gate 5 days before review; escalate non-compliant disciplines |
| Inconsistent severity classification | Different reviewers applying different severity criteria | Provide severity classification guide with examples at review kickoff; facilitate calibration session |
| Comment resolution stagnation | Responsible discipline not responding or providing inadequate responses | Automated overdue alerts at 3, 5, and 7 days; escalation to engineering manager at 10 days |
| Sign-off without resolution | Schedule pressure forcing premature gate closure | Hard block: no sign-off sheet issued until Critical comments at 100% closure; system-enforced |
| Missing interdisciplinary coverage | Review conducted discipline-by-discipline without cross-discipline interaction | Structure agenda by system/area, mandate minimum 3 disciplines present per session |
| Lost or duplicated comments | Manual comment tracking in spreadsheets without version control | Use single-source comment register with version control and audit trail; no parallel copies |
| Regulatory non-compliance missed | Local code requirements not included in review checklist | Include Chilean/LATAM regulatory compliance checklist as mandatory review agenda item per discipline |

## Escalation Protocols

| Trigger | Timeline | Escalation Path |
|---------|----------|-----------------|
| Document not ready for scheduled review | 5 days before review | Engineering Manager -> Project Manager |
| Critical comment response overdue | 5 working days after distribution | Discipline Lead -> Engineering Manager |
| Major comment response overdue | 10 working days after distribution | Discipline Lead -> Engineering Manager |
| Discipline lead refuses sign-off | Within 3 days of sign-off request | Engineering Manager -> Project Director |
| Recurring unresolved interface conflict | After 2 review cycles without resolution | Engineering Manager -> Project Director with formal interface resolution meeting |
| Review identifies fundamental design basis error | Immediately upon identification | Engineering Manager -> Project Director -> Client Representative |
| Gate recommendation is "Hold" | Within 1 day of closeout report | Project Director -> Steering Committee |

## Quality Criteria

| Dimension | Weight | Target | Measurement |
|-----------|--------|--------|-------------|
| Technical Accuracy | 30% | >95% | Review checklist items correctly assessed against design basis and codes |
| Completeness | 25% | 100% | All deliverables in scope reviewed; all disciplines represented; all comments captured |
| Consistency | 15% | >90% | Severity classifications align with project standard; comment format uniform |
| Format | 10% | 100% | VSC branding, professional layout, correct document numbering |
| Actionability | 10% | >95% | Comments are specific enough to enable direct engineering action without clarification |
| Traceability | 10% | 100% | Every comment linked to specific document/page/clause; every response linked to comment ID |

## Inter-Agent Dependencies

### Inputs From
| Agent | Input Provided | Criticality |
|-------|---------------|-------------|
| Execution | Project schedule with milestone dates, gate criteria | Critical |
| HSE | HAZOP/SIL study reports, safety review requirements | Critical |
| Operations | Operability review comments, O&M requirements for design | High |
| Contracts & Compliance | Vendor document submission status, contractor design obligations | Medium |
| Orchestrator | Project reporting requirements, stakeholder distribution list | Medium |

### Outputs Consumed By
| Agent | Output Provided | Trigger |
|-------|----------------|---------|
| Execution | Gate recommendation (Proceed/Conditional/Hold), comment closure metrics | Automatic at review closeout |
| Orchestrator | Review KPIs, comment statistics, milestone completion status | Automatic for weekly reporting |
| Asset Management | Design review findings relevant to maintainability, operability, reliability | On request or flagged during review |
| HSE | Safety-related comment register extract, HAZOP action closure verification | Automatic for safety-critical items |
| Operations | Operability comment responses and resolution evidence | On request |

## References

### Methodology References
- `methodology/or-playbook-and-procedures/` -- VSC OR Playbook procedures for design review governance
- `methodology/capital-projects/` -- Capital project stage-gate frameworks and engineering milestone definitions
- `methodology/templates/` -- Document templates for review packages and comment registers
- `docs/architecture/_legacy/multi-agent-architecture.md` -- Multi-agent architecture defining Engineering Design agent role

### Industry Standards
- **ISO 9001:2015** -- Quality management systems, clause 8.3 (Design and Development) for review requirements
- **ISO 19650** -- Organization and digitization of information about buildings and civil engineering works (BIM review standards)
- **FEED/Detailed Design Stage Gate Standards** (IPA, CII) -- Industry benchmarks for engineering milestone definitions
- **NCh-ISO 9001:2015** -- Chilean adoption of ISO 9001 for local regulatory compliance context
- **SERNAGEOMIN DS 132** -- Chilean mining safety regulations requiring design review documentation for mining projects

## Changelog
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-25 | VSC Engineering | Initial creation -- Wave 3 |
