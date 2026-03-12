---
name: track-field-change-notices
description: "Manage Field Change Notices documenting changes to approved design discovered or required during construction. Triggers: 'field change notice', 'FCN tracking', 'cambios de campo', 'notas de cambio en campo', 'modificaciones de construccion'."
---

# Track Field Change Notices

## Skill ID: CONST-14

## Version: 1.0.0

## Category: D-Monitoring (Construction Management)

## Priority: P1 - High

---

## Purpose

Manage Field Change Notices (FCNs) that document changes to the approved design discovered or required during construction. This skill tracks each FCN from identification through cost and schedule impact assessment, engineering review, approval, and implementation, ensuring all field changes are formally documented, properly assessed, and systematically incorporated into project records and as-built documentation.

Field changes are inevitable in construction -- no design is perfect, site conditions differ from assumptions, constructability issues emerge, and operations requirements evolve. The issue is not that field changes occur, but how they are managed. Uncontrolled field changes are the primary driver of cost overruns in construction projects, with IPA data showing that projects with poor change control experience 20-40% cost growth versus 5-10% for projects with disciplined FCN processes. Equally damaging, undocumented field changes create discrepancies between as-designed and as-built conditions that compromise safety analyses, maintenance planning, and future modifications for the life of the facility.

Key value drivers:
- **Cost control**: Every field change has a cost and schedule impact that must be assessed before approval -- preventing unauthorized changes that accumulate into significant overruns
- **Design integrity**: Engineering review of field changes ensures that local changes do not compromise system-level design integrity, safety requirements, or regulatory compliance
- **As-built accuracy**: Formal FCN documentation ensures every change is captured for as-built drawing updates, preventing the erosion of documentation accuracy
- **Accountability**: FCN tracking establishes clear accountability for change origination, assessment, approval, and implementation -- preventing finger-pointing when cumulative change impacts emerge
- **Trend analysis**: Tracking FCNs by classification (design error, constructability, scope change, unforeseen condition) enables root cause analysis and continuous improvement of the design and construction process

The FCN process must balance rigor with speed -- construction cannot stop while a change is processed. This skill provides the framework for rapid assessment and approval of field changes while maintaining the documentation discipline needed for cost control and as-built accuracy.

---

## Intent & Specification

The AI agent MUST understand that:

1. **FCN Lifecycle Management**: Every FCN must follow a defined lifecycle: Identify (field crew raises the change) -> Document (FCN form completed with description, justification, and sketches) -> Assess (cost and schedule impact estimated) -> Review (engineering reviews for technical adequacy and design integrity) -> Approve (authorized person approves based on classification and value) -> Implement (change executed per approved method) -> Close (as-built documentation updated, actual cost recorded). No step may be skipped, even for seemingly minor changes
2. **Change Classification**: FCNs must be classified by root cause: (a) Design Error -- original design was incorrect or incomplete, (b) Constructability -- design is correct but cannot be built as designed due to physical constraints, (c) Scope Change -- owner requests a change to the approved scope, (d) Unforeseen Condition -- site conditions differ from design assumptions (e.g., unexpected rock, contaminated soil, existing infrastructure). Classification determines cost accountability (contractor vs. owner) and drives root cause analysis for process improvement
3. **Cost and Schedule Impact Assessment**: Every FCN must have a quantified cost impact (material, labor, equipment, engineering) and schedule impact (days of delay on the affected activity and on the critical path). Cumulative change impact must be tracked at the project level to identify when aggregate changes are consuming contingency at an unsustainable rate
4. **FCN vs. MOC Relationship**: Field Change Notices must be evaluated for Management of Change (MOC) applicability. Any FCN that modifies a safety-critical system, changes operating parameters, or alters a system classified as safety instrumented (SIS/SIF) must trigger the MOC process (managed by HSE agent) before implementation. The FCN process does not replace MOC -- it feeds into it
5. **Cumulative Change Impact Tracking**: Individual FCNs may each appear minor, but their cumulative impact on cost, schedule, and design intent can be substantial. The agent must track cumulative change impact by area, system, discipline, and classification to provide early warning when aggregate changes are approaching threshold levels that require management intervention

---

## Trigger / Invocation

```
/track-field-change-notices
```

### Natural Language Triggers

- "Log a new field change notice for the project"
- "Track the status of open field change notices"
- "Analyze the cumulative impact of field changes"
- "Registrar una nueva nota de cambio de campo"
- "Hacer seguimiento del estado de los cambios de campo"
- "Analizar el impacto acumulado de los cambios de campo"

---

## Input Requirements

### Required Inputs

| Input | Source | Format | Description |
|-------|--------|--------|-------------|
| Approved Design Documents | Engineering Design | .dwg / .pdf | Current IFC drawings and specifications against which changes are measured |
| FCN Submission Form | Construction Teams | .docx / digital form | Completed FCN form with change description, justification, sketches, and photos |
| Project Cost Baseline | Execution (Project Controls) | .xlsx | Approved budget for cost impact assessment and contingency tracking |
| Approval Authority Matrix | Project Management | .xlsx | Who can approve FCNs by value threshold and change classification |
| MOC Trigger Criteria | HSE | .docx | Criteria defining when a field change requires Management of Change review |

### Optional Inputs

| Input | Source | Format | Default if Absent |
|-------|--------|--------|-------------------|
| Historical FCN Data | VSC Knowledge Base | .xlsx | No historical benchmark; trends established from current project data |
| Contract Change Order Provisions | Contracts & Compliance | .docx | Generic change order process applied |
| Engineering Review Capacity | Engineering Design | .xlsx | Standard 5-day engineering review turnaround assumed |

### Context Enrichment

- Retrieve current as-built documentation status from manage-as-built-documentation for FCN-to-as-built tracking
- Access MOC workflow status from manage-moc-workflow (HSE) for FCNs requiring MOC review
- Pull project cost and schedule status from Execution (project controls) for cumulative impact context
- Query engineering change log from track-engineering-changes for FCNs originating from design revisions
- Access contractor change order register from Contracts & Compliance for commercial processing of cost-impacting FCNs

---

## Output Specification

### Document 1: FCN Register (.xlsx)

**Filename**: `{ProjectCode}_FCN_Register_v{Version}_{YYYYMMDD}.xlsx`

**Structure:**

1. **Active FCNs**
   - All open FCNs with columns: FCN Number, Date Raised, Area, System, Discipline, Description, Classification (Design Error / Constructability / Scope Change / Unforeseen Condition), Cost Impact ($), Schedule Impact (days), Critical Path Impact (Y/N), Engineering Review Status, MOC Required (Y/N), MOC Reference, Approval Status, Responsible Party, Target Implementation Date, Actual Implementation Date
   - Conditional formatting: Red for overdue, Amber for pending > 10 days, Blue for MOC-flagged

2. **Closed FCNs**
   - Completed FCNs with all fields plus: Actual Cost, Actual Schedule Impact, As-Built Drawing Updated (Y/N), As-Built Reference, Lessons Learned

3. **Cumulative Impact Dashboard**
   - Running total of FCN cost impact by classification, area, discipline, and contractor
   - Cumulative cost vs. project contingency (burn-down chart)
   - Cumulative schedule impact on critical path
   - FCN rate trend (new FCNs per week) with moving average

4. **Classification Analysis**
   - FCN count and cost by classification category
   - Root cause analysis summary for top categories
   - Contractor accountability matrix (who caused, who pays)

5. **Engineering Review Tracker**
   - FCNs pending engineering review with aging
   - Engineering review turnaround time statistics
   - Review backlog and capacity analysis

6. **MOC Cross-Reference**
   - FCNs that triggered MOC process with MOC status and reference numbers
   - FCNs evaluated for MOC and determined not applicable (with justification)

### Key Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| FCN Processing Time | Average days from identification to approval | < 10 business days |
| Engineering Review Turnaround | Average days for engineering review completion | < 5 business days |
| Cost Impact Accuracy | Variance between estimated and actual FCN cost | < +/- 20% |
| As-Built Update Rate | % of closed FCNs with confirmed as-built drawing update | 100% |
| Cumulative Cost Impact | Total FCN cost as % of construction budget | < 5% (alert at 3%) |

---

## Procedure

### Step 1: Receive and Log Field Change Notices

1. Receive FCN submission from construction team (field superintendent, contractor, inspector, or commissioning engineer) via standard FCN form or digital submission
2. Validate FCN form completeness: description must clearly state what changed and why, sketches or photos must show current condition vs. approved design, location must be specified by area/system/equipment tag, and originator must be identified
3. Assign unique FCN number following project numbering convention: FCN-{Area}-{Discipline}-{Sequential Number} (e.g., FCN-310-P-0045 for piping change in Area 310)
4. Classify the FCN by root cause: Design Error (engineering made an error), Constructability (design cannot be built as drawn), Scope Change (owner requests a change), Unforeseen Condition (actual site conditions differ from assumed)
5. Assess whether the FCN potentially triggers MOC requirements by checking against HSE MOC trigger criteria (safety-critical system affected, operating parameters changed, SIS/SIF modification, pressure boundary change, structural load change)
6. Log the FCN in the FCN Register with all initial data and set status to "Submitted"
7. Notify the relevant engineering discipline lead and project controls of the new FCN within 24 hours

### Step 2: Assess Cost and Schedule Impact

1. Estimate the direct cost impact: additional materials (type, quantity, unit cost), additional labor (hours by trade, loaded rate), additional equipment (crane hours, welding hours, etc.), engineering hours for review and as-built update
2. Estimate the indirect cost impact: productivity loss during change implementation, rework of completed work, supervision and QA/QC hours, potential acceleration costs if change impacts critical path
3. Assess the schedule impact: days of delay on the directly affected activity, impact on successor activities, and whether the delay propagates to the critical path
4. Determine cost accountability: Design Error = EPC contractor or engineering firm cost (unless owner-specified), Constructability = typically contractor cost (unless design-driven), Scope Change = owner cost, Unforeseen Condition = depends on contract risk allocation
5. Validate cost and schedule estimates with the construction superintendent and project controls team
6. Record the cost and schedule impact in the FCN Register and update the cumulative impact tracking
7. Flag the FCN for expedited processing if it impacts the critical path or exceeds a cost threshold requiring senior approval

### Step 3: Conduct Engineering Review

1. Submit the FCN to the relevant engineering discipline lead with the complete FCN package: description, justification, sketches, photos, cost/schedule impact assessment, and MOC screening result
2. Engineering review must assess: (a) technical adequacy of the proposed change, (b) impact on design integrity (does the change compromise system performance, safety margins, or code compliance?), (c) impact on adjacent systems or disciplines, (d) constructability of the proposed solution, (e) regulatory implications
3. Engineering must provide a formal disposition: Approved (change is acceptable), Approved with Conditions (acceptable if specific conditions met), Rejected (change not acceptable, alternative provided), or Requires Further Study (additional analysis needed before disposition)
4. If the FCN triggers MOC, hold engineering approval pending MOC review and approval by HSE -- do not implement the change until both engineering and MOC approvals are obtained
5. Track engineering review turnaround against the 5-day target; escalate reviews that exceed 7 days to the Engineering Manager
6. Record the engineering disposition in the FCN Register with the reviewer's name, date, and any conditions
7. For rejected FCNs, work with the construction team and engineering to develop an acceptable alternative solution

### Step 4: Approve and Implement Changes

1. Route the FCN for approval based on the Approval Authority Matrix: typically Construction Manager for < $10K, Project Manager for $10K-$50K, Project Director for > $50K, and Steering Committee for > $250K or critical path impact > 5 days
2. Present the approval package: FCN description, engineering disposition, cost and schedule impact, MOC status (if applicable), recommended action, and funding source (contingency, change order, or contractor cost)
3. Obtain documented approval (signature or electronic approval) before authorizing implementation
4. Issue the approved FCN to the construction team with implementation instructions, including any conditions from engineering review
5. Monitor implementation to confirm the change is executed as approved (not modified further in the field)
6. Upon implementation completion, verify the change through physical inspection (for safety-critical or structural changes) or document review (for minor changes)
7. Record actual implementation date, actual cost, and any variances from the approved plan in the FCN Register

### Step 5: Close FCN and Update Records

1. Confirm that the field change has been physically implemented as approved
2. Verify that the red-line markup reflecting the FCN has been submitted to manage-as-built-documentation for as-built drawing update
3. Confirm that the engineering discipline lead has received notification to update the as-built drawing for the affected document(s)
4. If the FCN triggered a change order (cost to owner), confirm that the change order has been processed through Contracts & Compliance
5. Record lessons learned for the FCN: what caused the change, could it have been prevented, is the root cause systemic (affecting other areas/systems), and what process improvement is recommended
6. Update the cumulative impact tracking and flag if cumulative FCN cost or count has crossed a threshold requiring management attention
7. Close the FCN in the register only when all closure criteria are met: implementation verified, as-built update confirmed, cost recorded, change order processed (if applicable), and lessons learned documented

---

## Failure Modes & Common Pitfalls

| Failure Mode | Root Cause | Prevention Strategy |
|-------------|------------|---------------------|
| Changes implemented without FCN documentation | Field crews make changes and do not raise FCN; pressure to keep construction moving | Enforce zero-tolerance policy: any undocumented change discovered triggers NCR; include in contractor KPIs |
| Engineering review becomes a bottleneck | Too many FCNs for available engineering review capacity | Streamline review for minor changes (pre-approved solutions for common issues); add engineering resources if FCN rate exceeds capacity |
| Cost impact not assessed before approval | Urgency to implement change bypasses cost assessment step | No FCN implementation without cost estimate, even if preliminary; refine estimate after implementation |
| MOC-triggerable changes not identified | FCN reviewer does not check MOC trigger criteria; criteria unclear | Mandatory MOC screening checkbox on FCN form; training on MOC triggers for all FCN reviewers |
| Cumulative impact not tracked | FCNs managed individually without aggregation; no project-level view | Automated cumulative tracking in FCN Register; weekly cumulative impact report to Project Manager |
| As-built documentation not updated after FCN | FCN closed without confirming as-built update; process disconnect | FCN cannot be closed until as-built update confirmation received; link FCN register to as-built tracking |
| Root cause classification incorrect | Originator classifies to avoid cost accountability; no independent review | Independent classification review by project controls; classification audit for FCNs > $25K |

---

## Escalation Protocols

| Trigger | Timeline | Escalation Path |
|---------|----------|-----------------|
| FCN discovered implemented without documentation | Immediately upon discovery | Construction Manager -> Project Manager -> Contractor PM (NCR issued) |
| Engineering review exceeds 7 business days | Day 7 of review | Document Controller -> Engineering Manager -> Project Manager |
| Single FCN cost impact > $50K | Upon completion of cost assessment | Project Controls -> Project Manager -> Project Director |
| Cumulative FCN cost exceeds 3% of construction budget | Upon threshold breach | Project Controls -> Project Manager -> Project Director -> Steering Committee |
| FCN impacts critical path by > 3 days | Upon schedule impact confirmation | Construction Manager -> Project Controls -> Project Director |
| MOC-required FCN implemented before MOC approval | Immediately upon discovery | HSE Manager -> Project Director (stop work on affected system) |
| FCN rate > 10 per week for > 3 consecutive weeks | Weekly trend review | Construction Manager -> Engineering Manager -> Project Manager (systemic review required) |

---

## Quality Criteria

| Dimension | Weight | Target | Measurement |
|-----------|--------|--------|-------------|
| Technical Accuracy | 30% | Cost/schedule estimates within +/- 20% of actuals; engineering review technically sound | Variance analysis of estimate vs. actual for closed FCNs |
| Completeness | 25% | All FCNs documented; no undocumented field changes; all register fields populated | Field audit for undocumented changes; register completeness audit |
| Consistency | 15% | FCN classification consistent across similar changes; approval thresholds applied uniformly | Classification audit; approval compliance check |
| Format | 10% | FCN forms complete and legible; register properly formatted; reports professional | Template compliance and readability review |
| Actionability | 10% | FCN register enables management decision-making; cumulative reports drive intervention | Management feedback on report usefulness |
| Traceability | 10% | Every FCN traceable from submission through approval to as-built update | End-to-end traceability audit for sample of closed FCNs |

---

## Inter-Agent Dependencies

### Inputs From

| Agent / Skill | Data Required | Criticality |
|---------------|---------------|-------------|
| Construction teams | FCN submissions with descriptions, sketches, photos, and justification | Critical |
| Engineering Design | Technical review and disposition of proposed field changes | Critical |
| Execution (Project Controls) | Project cost baseline and schedule for impact assessment | Critical |
| HSE (manage-moc-workflow) | MOC trigger criteria and MOC review/approval for safety-relevant FCNs | High |
| Contracts & Compliance | Contract change order provisions for cost-impacting FCNs | High |

### Outputs Consumed By

| Agent / Skill | Data Provided | Trigger |
|---------------|---------------|---------|
| manage-as-built-documentation | FCN register with approved changes requiring as-built drawing updates | At FCN closure |
| Execution (project controls) | Cumulative cost and schedule impact for project forecasting | Weekly |
| Finance | Change order cost data for financial reporting and contingency tracking | At change order processing |
| Orchestrator (generate-or-report) | FCN metrics for project status reporting (count, cost, trend) | Weekly/Monthly |
| Engineering Design (track-engineering-changes) | FCN data for engineering change log integration | At engineering review completion |

---

## References

- **VSC OR Playbook** -- Construction Change Management section (Level 4-5)
- **AACE RP 10S-90** -- Cost Engineering Terminology: change order and field change definitions
- **CII RS-43** -- Project Change Management: best practices for field change control in construction
- **ISO 21500:2021** -- Project Management: change control processes and governance
- **OSHA Process Safety Management (29 CFR 1910.119)** -- Management of Change requirements for safety-critical modifications

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-25 | Initial creation -- Wave 3 |
