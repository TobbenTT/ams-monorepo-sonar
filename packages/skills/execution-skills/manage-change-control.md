# Manage Change Control
## Skill ID: PC-02
## Version: 1.0.0
## Category: Project Controls (Agent 6 - Execution)
## Priority: P1 - Critical

---

## Purpose

Implement and manage a structured change control process for project scope, schedule, and cost changes, ensuring that all changes are properly evaluated, approved, and tracked through a 6-step workflow. This prevents uncontrolled scope creep which is the leading cause of cost overruns in megaprojects.

Research from IPA (Independent Project Analysis) and the Construction Industry Institute (CII) consistently demonstrates that uncontrolled changes are the single largest driver of cost overruns and schedule delays in capital projects. IPA data shows that projects with poor change management experience 15-25% cost growth, while those with structured change control limit growth to 3-8%. Furthermore, AACE International's Total Cost Management framework identifies change management as a "must-have" competency for any project controls function.

The challenge is not eliminating changes -- changes are inevitable in complex projects due to evolving design information, site conditions, regulatory requirements, and stakeholder needs. The challenge is managing changes in a controlled manner so that: (1) every change is evaluated before implementation, (2) impacts are quantified and understood by decision-makers, (3) baselines are updated to reflect approved changes, and (4) trends are monitored to identify systemic issues.

This skill implements a rigorous 6-step change control process: (1) Initiate, (2) Assess Impact, (3) Review & Classify, (4) Approve/Reject/Defer, (5) Implement, (6) Close-out. It also provides trend analysis capabilities to identify root causes of changes and enable proactive management. The process distinguishes between three types of changes that are often confused: scope changes (new work not in the original scope), design development (refinement of existing scope to meet the same functional requirement), and rework (correcting errors in already-completed work).

A properly managed change control process typically achieves: 100% of changes documented before implementation, average 5-day turnaround for impact assessment, zero unauthorized baseline changes, and 80%+ accurate impact estimates (compared to final actuals).

---

## Intent & Specification

The AI agent MUST understand and execute the following:

1. **6-Step Change Control Process**: Implement a complete change lifecycle:
   - **Step 1 - Initiate**: Capture change request with description, justification, urgency, and requestor information. Assign unique identifier.
   - **Step 2 - Assess Impact**: Quantify impact on project cost (EAC), schedule (completion date), scope baseline, and risk profile. This is the most critical step -- no change should be approved without understanding its full impact.
   - **Step 3 - Review & Classify**: Review panel evaluates the assessment and classifies the change by magnitude: Minor (<$50K, <5 days), Major (<$500K, <30 days), Critical (>$500K or >30 days). Route to appropriate approval authority.
   - **Step 4 - Approve/Reject/Defer**: Decision maker reviews and decides. Approved changes update baselines. Rejected changes are documented with rationale. Deferred changes are tracked for re-evaluation.
   - **Step 5 - Implement**: Track implementation of approved changes including baseline updates, implementation instructions, and completion verification.
   - **Step 6 - Close-out**: Verify change fully implemented, compare actual vs. estimated impact, capture lessons learned.

2. **Impact Assessment**: Quantify impact on project cost (EAC), schedule (completion date), scope baseline, and risk profile before any change is approved. The assessment must:
   - Calculate direct cost impact (materials, labor, equipment, subcontracts)
   - Calculate indirect cost impact (extended preliminaries, management overhead, financing costs)
   - Analyze schedule impact using critical path methodology
   - Map scope changes to WBS elements (which work packages are affected)
   - Assess risk implications (new risks introduced, existing risks changed)
   - Identify cumulative impact (this change combined with all prior approved changes)
   - Present recommendation (approve/reject/defer) with rationale

3. **Change Register**: Maintain comprehensive change register with full audit trail, classification (Minor/Major/Critical), and cumulative impact tracking. The register must:
   - Track every change request from initiation to close-out
   - Maintain full audit trail of all decisions and approvals
   - Calculate cumulative impact of approved changes on baseline
   - Support filtering by status, type, classification, discipline, contractor
   - Generate aging reports for open change requests

4. **Trend Monitoring**: Track change trends (frequency, source, type) to identify systemic issues driving changes. The agent must:
   - Analyze change submission rates over time (increasing or decreasing?)
   - Identify top sources of changes (which disciplines, contractors, or project phases generate the most changes?)
   - Categorize changes by root cause (design error, scope gap, site condition, regulatory, client-directed)
   - Calculate cost and schedule trend of cumulative approved changes
   - Provide early warning when change patterns suggest systemic problems

Constraints:
- Must follow client approval authority matrix (who can approve what value)
- Must integrate with EVM baseline management (forecast-program-completion.md)
- Must distinguish between scope changes, design development, and rework
- All cost/schedule impacts must be quantified before approval
- Must maintain audit trail for all decisions
- Must track contingency drawdown from approved changes
- Must produce outputs in Spanish (Latin American) with English technical terms preserved

---

## Trigger / Invocation

```
/manage-change-control
```

### Command Triggers
- `manage-change-control initiate --title [description] --type [scope|schedule|cost|design]`
- `manage-change-control assess --change-id [CR-XXX]`
- `manage-change-control approve --change-id [CR-XXX] --authority [name]`
- `manage-change-control reject --change-id [CR-XXX] --rationale [reason]`
- `manage-change-control defer --change-id [CR-XXX] --review-date [date]`
- `manage-change-control report --type [status|trend|impact|aging]`
- `manage-change-control trend --period [monthly|quarterly|cumulative]`

### Natural Language Triggers
- "Submit a change request for [description]"
- "Assess the impact of change [CR number]"
- "What is the cumulative impact of all approved changes?"
- "Show me the change trend analysis"
- "Which changes are overdue for assessment?"
- "Generate the monthly change control report"
- "Someter solicitud de cambio para [descripcion]"
- "Evaluar impacto del cambio [numero]"
- "Generar informe de control de cambios"

### Aliases
- `/change-control`
- `/change-request`
- `/scope-change`
- `/moc-project` (Management of Change - Project)

### Automatic Triggers
- Budget variance exceeds threshold (>5% on any WBS element)
- Schedule variance exceeds threshold (>10 days on critical path)
- New scope item identified during design review or construction
- EPC contractor submits variation claim
- Regulatory requirement changes
- Monthly reporting cycle (trend analysis)

---

## Input Requirements

### Required Inputs

| Input | Source | Required | Format | Description |
|-------|--------|----------|--------|-------------|
| Change Request Form | Requestor | Yes | .docx / form | Description, justification, urgency, type, requestor, affected systems |
| Current Baseline | Project Controls | Yes | .xlsx / .mpp | Cost baseline (BAC by WBS), schedule baseline (critical path), scope baseline (WBS dictionary) |
| Approval Authority Matrix | Project Management | Yes | .xlsx | Who approves at what threshold -- typically tiered by change value |
| Risk Register | Project Management | Yes | .xlsx | Current risk profile for impact assessment |
| Contract Provisions | Contracts Agent | Yes | .pdf / .docx | Contractual change order mechanisms, variation procedures, dispute resolution |

### Optional Inputs (Strongly Recommended)

| Input | Source | Required | Format | Default if Absent |
|-------|--------|----------|--------|-------------------|
| EVM Data | Project Controls | No | .xlsx | Impact assessment uses baseline only (no performance adjustment) |
| Change Log (existing) | Project Team | No | .xlsx | New register created from scratch |
| Contingency Register | Project Controls | No | .xlsx | Contingency drawdown not tracked |
| Estimating Norms | Project Controls | No | .xlsx | Industry standard estimating rates applied |
| Historical Change Data | VSC Knowledge Base | No | .xlsx | Industry benchmark data applied |
| Lessons Learned | VSC Knowledge Base | No | .docx | Generic best practices applied |

### Context Enrichment (Automatic)

The agent will automatically:
- Retrieve project cost baseline from project controls data
- Access schedule logic and critical path from project schedule
- Pull current EVM performance indices (CPI, SPI) for impact adjustment
- Retrieve approval authority matrix from project management plan
- Access contract change order provisions from contracts agent
- Query VSC knowledge base for change management benchmarks by project type and industry
- Retrieve AACE recommended practices for change management and forensic schedule analysis

---

## Output Specification

### Document 1: Change Impact Assessment (.docx)

**Filename**: `{ProjectCode}_Change_Impact_Assessment_{CR-Number}_v{Version}_{YYYYMMDD}.docx`

**Target Length**: 5-15 pages depending on change complexity

**Structure:**

1. **Cover Page** -- VSC branding, project identification, CR number, revision status
2. **Document Control** -- Revision history, review and approval matrix
3. **Change Description and Justification** (1-2 pages)
   - Clear description of the proposed change
   - Justification and business case
   - Classification: Scope Change / Design Development / Rework / Force Majeure / Client-Directed / Regulatory
   - Urgency: Routine / Urgent / Emergency
4. **Cost Impact** (1-3 pages)
   - Direct cost estimate (materials, labor, equipment, subcontracts)
   - Indirect cost estimate (extended preliminaries, management, financing)
   - Contingency impact (drawdown or addition)
   - Cumulative cost impact (this change + all prior approved changes)
   - EAC adjustment (new EAC = current EAC + change impact)
   - Basis of estimate and assumptions
5. **Schedule Impact** (1-2 pages)
   - Critical path analysis (does this change affect the critical path?)
   - Duration impact on affected activities
   - Float consumption analysis
   - Completion date impact (days of delay or acceleration)
   - Milestone impacts (which milestones are affected?)
   - Logic changes required (new dependencies, removed constraints)
6. **Scope Impact** (1 page)
   - WBS elements affected (list all affected work packages)
   - Scope description changes required
   - Deliverable additions/modifications/deletions
   - Interface impacts (effects on other contractors or disciplines)
7. **Risk Impact** (1 page)
   - New risks introduced by the change
   - Existing risks affected (probability or consequence changes)
   - Net risk profile change (improved, unchanged, or degraded)
   - Additional risk mitigation required
8. **Recommendation** (1 page)
   - Recommendation: Approve / Reject / Defer
   - Rationale for recommendation
   - Conditions for approval (if conditional)
   - Implementation timeline if approved
   - Alternatives considered

### Document 2: Change Register (.xlsx)

**Filename**: `{ProjectCode}_Change_Register_v{Version}_{YYYYMMDD}.xlsx`

**Sheets:**

1. **Active Changes** -- All open change requests with status
   - Columns: CR Number, Date Initiated, Title, Description, Type (Scope/Design Development/Rework/Force Majeure/Client/Regulatory), Requestor, Classification (Minor/Major/Critical), Status (Initiated/Assessing/Reviewed/Pending Approval/Approved/Rejected/Deferred/Implementing/Closed), Assigned Assessor, Assessment Due Date, Cost Impact ($), Schedule Impact (days), Approval Authority, Decision Date, Decision, Implementation Status, Close-out Date
   - Conditional formatting by status and aging

2. **Completed Changes** -- Closed CRs with final impact
   - Same columns as Active Changes plus: Estimated Cost Impact, Actual Cost Impact, Variance, Estimated Schedule Impact, Actual Schedule Impact, Variance, Lessons Learned
   - Analysis of estimation accuracy (actual vs. estimated)

3. **Cumulative Impact** -- Running total of approved changes vs. baseline
   - Columns: Period (month), CRs Submitted, CRs Approved, CRs Rejected, CRs Deferred, Cumulative Approved Cost Impact ($), Cumulative Approved Schedule Impact (days), Original BAC, Current EAC (after changes), Contingency Balance, % Budget Growth
   - Chart data for cumulative impact trend line

4. **Trend Analysis** -- Change frequency, source, and type trends
   - Submission rate by month (chart data)
   - Distribution by type (Scope/Design/Rework/FM/Client/Regulatory)
   - Distribution by source (discipline, contractor, project phase)
   - Root cause analysis (design error, scope gap, site condition, etc.)
   - Average assessment duration trend
   - Approval rate trend

5. **Approval Log** -- Full audit trail of decisions
   - Columns: CR Number, Decision, Decision Date, Decision Maker, Authority Level, Conditions, Notes, Supporting Documents
   - Complete audit trail for compliance and dispute resolution

6. **Contingency Tracker** -- Contingency drawdown from approved changes
   - Columns: CR Number, Description, Contingency Category (scope, escalation, risk), Amount Drawn, Remaining Balance, % of Original Contingency
   - Contingency burn-rate chart data

### Document 3: Monthly Change Control Report (.docx)

**Filename**: `{ProjectCode}_Change_Control_Report_{Month}_{YYYYMMDD}.docx`

**Structure:**

1. **Executive Summary** -- Key metrics, trend highlights, management attention items
2. **Change Activity Summary** -- CRs submitted, assessed, approved, rejected, deferred during period
3. **Cumulative Impact** -- Total cost and schedule impact of all approved changes
4. **Trend Analysis** -- Submission rate, type distribution, source analysis, root causes
5. **Aging Report** -- CRs overdue for assessment or decision
6. **Contingency Status** -- Remaining contingency, drawdown rate, forecast sufficiency
7. **Key Changes** -- Detail on Major/Critical changes processed during period
8. **Recommendations** -- Actions to improve change management effectiveness

---

## Methodology & Standards

### Primary Standards (Mandatory Compliance)

| Standard | Application |
|----------|-------------|
| **AACE RP 10S-90** | Cost Engineering Terminology -- standard definitions for change management terms |
| **PMI PMBOK 7th Edition** | Integrated Change Control -- process framework and best practices |
| **ISO 21500:2021** | Project Management -- change management governance and decision protocols |
| **AACE RP 29R-03** | Forensic Schedule Analysis -- methodology for schedule impact assessment |
| **AACE RP 25R-03** | Estimating Lost Productivity in Construction Claims -- for change impact quantification |

### Secondary Standards (Reference)

| Standard | Application |
|----------|-------------|
| **FIDIC Conditions of Contract** | Contractual variation and change order procedures |
| **NEC4 ECC** | Compensation event and early warning procedures |
| **AACE RP 44R-08** | Risk Analysis and Contingency Determination -- contingency management |
| **ISO 31000:2018** | Risk Management -- risk assessment within change control |
| **CII RT-CII-6-13** | Change Management Best Practices for Capital Projects |

### Change Classification Framework

#### Change Types

| Type | Definition | Examples | Baseline Impact |
|------|-----------|----------|-----------------|
| **Scope Change** | New work not included in original project scope | New building, additional equipment, expanded capacity | Baseline adjustment required |
| **Design Development** | Refinement of existing scope to meet same functional requirement | Larger pump (same function, updated conditions), different material grade | May or may not adjust baseline |
| **Rework** | Correction of already-completed work due to error or defect | Incorrect foundation elevation, failed weld, wrong material installed | No baseline change (cost of error) |
| **Force Majeure** | Changes driven by unforeseeable events beyond control | Pandemic, earthquake, war, unprecedented weather | Baseline adjustment per contract |
| **Client-Directed** | Changes requested by the project owner/client | Scope additions, accelerations, facility modifications | Baseline adjustment required |
| **Regulatory** | Changes required by regulatory authority | New environmental requirement, updated building code | Baseline adjustment required |

#### Change Classification by Magnitude

| Classification | Cost Threshold | Schedule Threshold | Approval Authority |
|---------------|---------------|-------------------|-------------------|
| **Minor** | <$50K | <5 calendar days | Project Manager |
| **Major** | $50K - $500K | 5-30 calendar days | Project Director |
| **Critical** | >$500K | >30 calendar days | Steering Committee / Owner |

Note: Classification thresholds are project-specific and should be calibrated to project size. The above are defaults for a USD 500M-1B project. For smaller projects, thresholds should be proportionally adjusted.

### Approval Authority Matrix (Default Template)

| Change Value | Project Manager | Project Director | Steering Committee | Owner Board |
|-------------|----------------|------------------|--------------------|-------------|
| <$50K | Approve | Inform | - | - |
| $50K-$250K | Recommend | Approve | Inform | - |
| $250K-$500K | Assess | Recommend | Approve | Inform |
| >$500K | Assess | Recommend | Recommend | Approve |
| Any safety impact | Escalate | Escalate | Approve | Inform |
| >5% total budget | Assess | Recommend | Recommend | Approve |

### Impact Assessment Methodology

#### Cost Impact Assessment
1. **Direct Costs**: Estimate labor, materials, equipment, subcontractor costs using project estimating norms
2. **Indirect Costs**: Calculate extended duration costs (site overhead, management, insurance, financing) if schedule is affected
3. **Contingency Adjustment**: Determine if change draws from existing contingency or requires additional funding
4. **Escalation**: Apply escalation indices if implementation extends beyond current period
5. **Performance Adjustment**: If CPI < 1.0, adjust estimated cost by 1/CPI factor (historical performance suggests costs will exceed estimate)

#### Schedule Impact Assessment
1. **Activity Identification**: Identify all schedule activities affected by the change
2. **Duration Analysis**: Estimate duration impact on each affected activity
3. **Logic Analysis**: Determine if new logic links are required
4. **Critical Path Assessment**: Run schedule analysis to determine if critical path is affected
5. **Float Analysis**: Calculate float consumption for near-critical activities
6. **Milestone Impact**: Identify which milestones are affected and by how much
7. **Concurrent Delay**: Assess whether delay is concurrent with existing delays (for claims analysis)

---

## Step-by-Step Execution

### Step 1: Initiate Change Request
1. Capture change request information:
   - Title and detailed description of the proposed change
   - Justification: why is this change necessary?
   - Requestor name, date, discipline/department
   - Urgency classification: Routine (standard process), Urgent (accelerated assessment), Emergency (implement immediately, document retroactively)
2. Assign unique CR number: CR-{YYYY}-{NNN} (sequential within calendar year)
3. Classify type: Scope Change / Design Development / Rework / Force Majeure / Client-Directed / Regulatory
4. Perform preliminary classification: Minor / Major / Critical (may be revised after assessment)
5. Assign impact assessor (typically discipline lead or project controls)
6. Set assessment due date based on urgency:
   - Routine: 10 business days
   - Urgent: 5 business days
   - Emergency: 24 hours (retroactive documentation within 5 days)
7. Log in Change Register with status "Initiated"
8. Notify assessment team

### Step 2: Assess Impact
1. **Cost Impact Assessment:**
   - Estimate direct costs (materials, labor, equipment, subcontracts) using project estimating norms
   - Estimate indirect costs if schedule is affected (extended preliminaries, management overhead)
   - Calculate contingency draw or addition required
   - Apply performance factor if CPI < 1.0
   - Present cost range: best case / most likely / worst case
2. **Schedule Impact Assessment:**
   - Identify affected schedule activities
   - Estimate duration changes
   - Run critical path analysis
   - Calculate completion date impact
   - Identify milestone impacts
3. **Scope Impact Assessment:**
   - Map change to WBS elements
   - Identify deliverable additions/modifications/deletions
   - Assess interface impacts (other contractors, disciplines)
4. **Risk Impact Assessment:**
   - Identify new risks introduced
   - Assess changes to existing risk levels
   - Calculate net risk profile change
5. **Cumulative Impact:**
   - Add this change to all prior approved changes
   - Present cumulative impact on original baseline
6. **Recommendation:**
   - Approve / Reject / Defer with clear rationale
   - Conditions for approval (if any)
   - Alternative solutions considered
7. Prepare Impact Assessment Document
8. Update Change Register status to "Assessed"

### Step 3: Review & Classify
1. Review panel evaluates impact assessment:
   - Technical review: is the assessment technically sound?
   - Cost review: are estimates reasonable and well-supported?
   - Schedule review: is the critical path analysis correct?
   - Risk review: are risk implications adequately addressed?
2. Validate or adjust classification:
   - Minor: <$50K AND <5 calendar days (Project Manager approval)
   - Major: $50K-$500K OR 5-30 calendar days (Project Director approval)
   - Critical: >$500K OR >30 calendar days (Steering Committee approval)
3. Route to appropriate approval authority per Approval Authority Matrix
4. Update Change Register status to "Pending Approval"
5. Notify approval authority with assessment package

### Step 4: Approve/Reject/Defer
1. Decision maker reviews impact assessment and recommendation
2. Decision options:
   - **Approve**:
     - Document approval with any conditions
     - Authorize baseline updates
     - Issue implementation instructions
     - Notify all affected parties
   - **Reject**:
     - Document rejection rationale
     - Notify requestor with explanation
     - Close CR in register
   - **Defer**:
     - Document deferral reason
     - Set re-evaluation date
     - Track in register as "Deferred"
     - Schedule re-evaluation trigger
3. Record decision in Approval Log with full audit trail
4. Update Change Register with decision and date
5. If approved: proceed to Step 5
6. If rejected: proceed to Step 6 (close-out)
7. If deferred: set calendar reminder for re-evaluation

### Step 5: Implement
1. **Update Cost Baseline:**
   - Adjust BAC for affected WBS elements
   - Recalculate EAC: EAC = Current AC + (Updated BAC - EV) / CPI
   - Update contingency register (drawdown or addition)
   - Notify finance of budget adjustment
2. **Update Schedule Baseline:**
   - Insert change activities into schedule
   - Adjust logic links and constraints
   - For Critical changes: formal re-baseline with full documentation
   - For Minor/Major: incorporate within current baseline (absorbed change)
   - Recalculate critical path and milestone dates
3. **Issue Implementation Instructions:**
   - Specific work scope for each affected party
   - Timeline for implementation
   - Quality requirements
   - Reporting requirements
4. **Track Implementation:**
   - Monitor progress of change implementation
   - Verify quality of implemented change
   - Track actual costs against estimated costs
   - Track actual schedule impact against estimated impact
5. Update Change Register status to "Implementing"

### Step 6: Close-out
1. **Verify Implementation:**
   - Confirm change fully implemented per approved scope
   - Verify quality requirements met
   - Obtain sign-off from requestor that change addresses the need
2. **Variance Analysis:**
   - Compare actual cost impact vs. estimated cost impact
   - Compare actual schedule impact vs. estimated schedule impact
   - Analyze variance causes (estimation error, scope creep within change, unforeseen conditions)
3. **Lessons Learned:**
   - What worked well in processing this change?
   - What could be improved?
   - Is there a systemic issue that caused this change?
   - Could this change have been avoided? How?
4. **Update Registers:**
   - Close CR in Change Register
   - Update Trend Analysis data
   - Update cumulative impact calculations
5. **Propose Improvements:**
   - If change reveals systemic issue, propose preventive action
   - If assessment accuracy was poor, propose estimation improvement
   - If processing time was excessive, propose workflow improvement

---

## Quality Criteria

### Content Quality (Target: >91% Compliance)

| Criterion | Weight | Metric | Target |
|-----------|--------|--------|--------|
| Assessment Completeness | 25% | All 4 impacts (cost, schedule, scope, risk) quantified | 100% |
| Processing Time | 20% | CR assessed within SLA (5/10 business days) | >90% |
| Approval Compliance | 20% | Changes approved per authority matrix | 100% |
| Baseline Integrity | 15% | No unauthorized baseline changes | 0 violations |
| Trend Visibility | 10% | Monthly trend report produced with root cause analysis | 100% |
| Estimation Accuracy | 10% | Actual impact within +/-20% of estimated impact | >80% |

### Automated Quality Checks

- [ ] Every change request has a unique CR number following naming convention
- [ ] Every CR has all mandatory fields populated (description, justification, type, requestor)
- [ ] Every assessed CR has cost, schedule, scope, and risk impacts documented
- [ ] No CR has status "Approved" without approval authority signature recorded
- [ ] No baseline change exists without a corresponding approved CR
- [ ] Cumulative impact calculations are mathematically correct
- [ ] Contingency drawdown reconciles between change register and contingency tracker
- [ ] Trend analysis data matches underlying change register data
- [ ] All CRs exceeding 30 days without decision are flagged for escalation
- [ ] Emergency changes have retroactive documentation within 5 business days
- [ ] No "TBD," "pending," or placeholder entries in approved impact assessments
- [ ] Approval authority is correct per classification (Minor/Major/Critical)
- [ ] Cost estimates include both direct and indirect costs
- [ ] Schedule impact includes critical path analysis results

---

## MCP Integrations

### mcp-sharepoint

| Operation | Purpose | Details |
|-----------|---------|---------|
| **Read** | Retrieve baseline documents | Cost baseline, schedule baseline, WBS dictionary, scope documents |
| **Read** | Access contract provisions | Change order mechanisms, variation clauses, approval authorities |
| **Read** | Retrieve approval authority matrix | Who approves what threshold -- project-specific document |
| **Write** | Store change impact assessments | Version-controlled assessment documents with full audit trail |
| **Write** | Store approval records | Decision documentation, approval signatures, conditions |
| **Write** | Store close-out reports | Final impact analysis, lessons learned, variance reports |
| **Write** | Store monthly change control reports | Trend analysis, cumulative impact, management reports |

### project-database

| Operation | Purpose | Details |
|-----------|---------|---------|
| **Read/Write** | Change Register database | Primary database for all CRs with full lifecycle tracking, status, impact values, approval chain |
| **Read/Write** | Contingency Tracker | Track contingency drawdown from approved changes |
| **Dashboard** | Change trend analysis | Submission rate, type distribution, source analysis visualizations |
| **Dashboard** | Cumulative impact tracking | Running total of approved changes vs. baseline with trend line |
| **Dashboard** | Aging report | CRs overdue for assessment or decision, with escalation status |
| **Workflow** | Assessment reminders | Automated alerts when assessment is approaching or past due date |
| **Workflow** | Approval routing | Route CRs to correct approval authority based on classification |

### mcp-outlook

| Operation | Purpose | Details |
|-----------|---------|---------|
| **Send** | Change request notifications | Notify assessors of new CRs requiring evaluation |
| **Send** | Impact assessment distribution | Send completed assessments to review panel and approval authority |
| **Send** | Approval request notifications | Formal request for decision from appropriate authority |
| **Send** | Implementation instructions | Distribute approved change implementation details to affected parties |
| **Send** | Monthly change control reports | Distribute to project management team and stakeholders |
| **Read** | Approval decisions | Receive email-based approval, rejection, or deferral decisions |
| **Read** | Review comments | Capture comments from review panel on impact assessments |

### mcp-jira

| Operation | Purpose | Details |
|-----------|---------|---------|
| **Read/Write** | Change implementation tasks | Create and track implementation tasks for approved changes |
| **Read/Write** | Assessment tasks | Assign and track impact assessment work items |
| **Link** | Affected work packages | Link CRs to affected project work packages and milestones |
| **Workflow** | CR lifecycle | Implement 6-step workflow as Jira workflow (Initiated -> Assessing -> Reviewed -> Pending Approval -> Implementing -> Closed) |
| **Dashboard** | Implementation progress | Track completion of change implementation tasks |

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs From)

| Agent | Dependency Type | Description | Criticality |
|-------|----------------|-------------|-------------|
| agent-execution (project_management) | Upstream | Change requests originate from project management; approval authority matrix | Critical |
| agent-execution (project_controls) | Bilateral | Cost and schedule baselines for impact assessment; EVM data for performance adjustment | Critical |
| agent-contracts-compliance | Upstream | Contract change order provisions, variation procedures; claims management | Critical |
| agent-execution (engineering) | Upstream | Design changes, design development classification, technical assessment | High |
| agent-execution (construction) | Upstream | Field-originated changes (site conditions, constructability issues, rework) | High |
| agent-hse | Upstream | Safety-related changes requiring HSE impact assessment | High |

### Downstream Dependencies (Outputs To)

| Agent | Dependency Type | Description | Trigger |
|-------|----------------|-------------|---------|
| agent-execution (project_controls) | Downstream | Approved changes update cost and schedule baselines | On approval |
| forecast-program-completion.md | Downstream | Approved changes trigger reforecast of EAC and completion date | On approval |
| agent-execution (finance) | Downstream | Budget adjustments from approved changes | On approval |
| agent-contracts-compliance | Bilateral | Contract change orders for EPC scope changes | On approval |
| agent-execution (construction) | Downstream | Construction scope change implementation instructions | On approval |
| track-progressive-handover.md | Downstream | Changes affecting handover milestones or system scope | On approval |
| manage-epc-interfaces.md | Bilateral | Interface scope changes routed through change control | On identification |
| orchestrate-or-agents | Reporting | Change control status in project reports and OR gate reviews | Monthly |

---

## Templates & References

### Document Templates
- `VSC_Change_Request_Form_Template_v2.0.docx` -- Standard CR form with all required fields
- `VSC_Impact_Assessment_Template_v2.0.docx` -- Impact assessment document with pre-formatted sections
- `VSC_Change_Register_Template_v2.0.xlsx` -- Change register workbook with all sheets and formulas
- `VSC_Approval_Authority_Matrix_Template_v1.0.xlsx` -- Configurable approval matrix template
- `VSC_Monthly_Change_Report_Template_v1.0.docx` -- Monthly report template with VSC branding
- `VSC_Contingency_Tracker_Template_v1.0.xlsx` -- Contingency drawdown tracking template

### Reference Data Sources
- AACE RP 10S-90: Cost Engineering Terminology
- AACE RP 29R-03: Forensic Schedule Analysis
- AACE RP 25R-03: Estimating Lost Productivity in Construction Claims
- AACE RP 44R-08: Risk Analysis and Contingency Determination
- PMI PMBOK 7th Edition: Integrated Change Control
- CII RT-CII-6-13: Change Management Best Practices
- FIDIC Conditions of Contract (Red Book, Silver Book): Change Order Procedures
- VSC Internal Lessons Learned Database: Change management experiences from prior projects

### Knowledge Base
- Past change management data by industry sector (mining, O&G, power, chemicals)
- Change frequency benchmarks by project phase (engineering, procurement, construction, commissioning)
- Common change root causes by industry type
- Estimation accuracy benchmarks (actual vs. estimated change impact)
- Contingency consumption profiles by project type and phase
- Change management workflow optimization case studies

---

## Examples

### Example 1: EPC Scope Change

**Input:** EPC contractor requests additional structural steel for seismic upgrade (CR-2025-047). The client's seismologist has updated the site-specific seismic study, requiring structural modifications to the crusher building steel frame. Estimated cost USD 1.2M, estimated schedule impact 15 calendar days.

**Process:**
1. **Initiate**: Log CR-2025-047, Type: Regulatory (seismic requirement), Urgency: Routine
2. **Assess Impact**:
   - Cost: Direct $1.2M (steel fabrication, erection, engineering redesign) + Indirect $180K (extended crane hire, supervision) = $1.38M total
   - Schedule: 15 calendar days on non-critical path activity (crusher building steel erection). Nearest critical path activity: crusher mechanical installation (20 days float). No impact on project completion date.
   - Scope: WBS 3.2.1 (Crusher Building Structure) affected, 45 tonnes additional steel
   - Risk: Structural adequacy risk mitigated by this change; new risk of fabrication quality for accelerated steel delivery
3. **Classify**: Major (>$50K, <$500K threshold exceeded at $1.38M -> re-classify as Critical)
4. **Approve**: Route to Steering Committee. Recommendation: Approve (safety-driven, seismic code compliance mandatory)
5. **Implement**: Update BAC +$1.38M, update schedule with 15-day activity, draw from contingency (Regulatory category)
6. **Close-out**: Compare actual vs. estimated after construction complete

**Output:**
- Impact Assessment Document (CR-2025-047): 8 pages with full cost/schedule/scope/risk analysis
- Change Register updated with CR-2025-047, status: "Pending Approval"
- Recommendation: Approve (safety-driven compliance requirement)
- If approved: Updated EAC (+$1.38M), contingency reduced by $1.38M, updated schedule with no completion date impact

### Example 2: Design Development vs. Scope Change

**Input:** Engineering identifies need for larger pump due to updated process conditions. Original design specified 200 HP centrifugal pump; updated process modeling shows 300 HP is required to meet throughput targets under revised slurry density conditions.

**Process:**
1. **Classify Type**: Design Development (not Scope Change) -- same function (pumping slurry to cyclones), same system, updated performance requirement based on refined process data. The scope was always to pump slurry at the required rate; the specification is being refined.
2. **Assess Impact**:
   - Cost: $45K differential (pump price delta $28K + motor upgrade $12K + foundation modification $5K). Within project contingency for design development.
   - Schedule: 0 days (pump is long-lead item already ordered at 200 HP -- but 300 HP has same delivery time from vendor, change order to manufacturer required within 5 days to avoid delay)
   - Scope: No WBS scope change; pump specification update within WBS 4.3.2
   - Risk: Performance risk reduced (correctly sized pump). New risk: vendor change order processing time.
3. **Classify**: Minor (<$50K, <5 days)
4. **Approve**: Route to Project Manager. Urgent: vendor change order deadline in 5 days.
5. **Implement**: Issue pump specification revision, process vendor change order, draw $45K from contingency (Design Development category)
6. **Close-out**: Verify pump received at correct specification

**Output:**
- Impact Assessment Document (CR-2025-052): 5 pages, classified as Design Development (not scope change)
- Recommendation: Approve urgently (5-day vendor deadline)
- Contingency draw: $45K from Design Development category
- No baseline change (design development absorbed within contingency)
- Updated change register and trend analysis

### Example 3: Monthly Change Trend Analysis

**Input:** Month 14 of 36-month project. Project Manager requests monthly change control report with trend analysis.

**Process:**
1. Compile change activity for Month 14:
   - 8 CRs submitted (vs. 5/month average)
   - 6 CRs assessed and decided (4 approved, 1 rejected, 1 deferred)
   - 3 CRs carried forward from prior months
2. Cumulative impact analysis:
   - 47 total CRs submitted to date
   - 31 approved, 9 rejected, 4 deferred, 3 in process
   - Cumulative approved cost impact: +$8.7M (3.5% of $250M BAC)
   - Cumulative schedule impact: +22 days (absorbed in float, no completion date change yet)
   - Contingency consumed: $6.2M of $25M (24.8%)
3. Trend analysis:
   - Submission rate increasing (8/month vs. 5/month average) -- entering construction phase
   - Top source: construction field changes (40%), followed by design development (25%), client-directed (20%)
   - Root causes: site conditions (35%), design detail refinement (30%), scope gaps (20%), regulatory (15%)
   - Assessment turnaround: average 7 days (within 10-day SLA)
4. Concerns identified:
   - Construction field changes accelerating -- may indicate design quality issues
   - Contingency burn rate (24.8% at Month 14 of 36) is ahead of plan (should be ~20%)

**Output:**
- Monthly Change Control Report (8 pages) with executive summary, trend charts, and recommendations
- Key recommendation: investigate root cause of increasing construction field changes (potential design quality issue)
- Contingency forecast: at current burn rate, contingency will be exhausted by Month 28 (8 months before completion)
- Recommended action: commission design quality audit, consider contingency replenishment request
