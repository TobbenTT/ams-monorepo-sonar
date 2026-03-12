---
name: manage-project-change-control
description: "Manage scope changes through formal change control process with impact assessment across cost, schedule, quality, and safety dimensions. Track change requests from initiation to closure. Triggers: 'project change control', 'scope change', 'change request', 'CCB', 'change control board'."
category: Project Orchestration (Agent 7 - Project Orchestrator)
priority: P1 - Critical
version: 1.0.0
agent: project-orchestrator (AG-007)
---

# Manage Project Change Control

## Skill ID: PO-002
## Version: 1.0.0
## Category: Project Orchestration (Agent 7 - Project Orchestrator)
## Priority: P1 - Critical

---

## Purpose

Manage project scope changes through a formal, auditable change control process that ensures every proposed change is evaluated across cost, schedule, quality, and safety dimensions before implementation. This skill governs the complete change request lifecycle -- from initiation through impact assessment, Change Control Board (CCB) review, approval or rejection, implementation tracking, and formal closure with lessons learned capture.

Uncontrolled scope changes are the primary driver of cost and schedule overruns in capital projects. IPA (Independent Project Analysis) data demonstrates that projects in the top quartile of change management performance achieve cost growth of less than 5%, while those in the bottom quartile experience 20-40% cost growth. AACE International's Total Cost Management Framework identifies change management as a core competency for project controls, and PMI's PMBOK 7th Edition positions Integrated Change Control as one of the most critical project management processes.

In the FEL (Front-End Loading) governance context, change control is especially critical because changes during early project phases (FEL1-FEL3) have exponentially lower cost impact than changes during execution. The "1-10-100 rule" (a change costing $1 in FEL1 costs $10 in FEL3 and $100 during construction) underscores the importance of rigorous change evaluation during front-end phases. This skill implements change control across all FEL phases with phase-appropriate rigor:

- **FEL1 (Concept Selection)**: Changes to project basis, capacity, technology selection. Higher tolerance for scope evolution, but changes must still be documented and their impact on the business case assessed.
- **FEL2 (FEED / FID)**: Changes to process design, equipment specifications, layout. Moderate tolerance with formal CCB review for any change exceeding cost or schedule thresholds.
- **FEL3 (Detailed Design / Execution)**: Changes to detailed design, procurement specifications, construction methods. Low tolerance with mandatory CCB approval for all changes.

The process distinguishes between four change categories that are often conflated: scope changes (new work not in the original approved scope), design development (refinement of existing scope to meet the same functional requirement), rework (correction of errors in completed work), and regulatory-driven changes (mandated by external authorities). Each category has different baseline implications and approval protocols.

---

## Intent & Specification

The AI agent MUST understand and execute the following:

1. **Change Request Record Structure**: Every change request must capture:
   - **CR Identifier**: Unique ID following convention CR-{ProjectCode}-{YYYY}-{NNN}
   - **Originator**: Person or agent initiating the change, with department/discipline
   - **Category**: Scope Change / Design Development / Rework / Regulatory / Client-Directed / Force Majeure
   - **Description**: Clear, unambiguous description of what is proposed to change
   - **Justification**: Business case for why the change is necessary
   - **Impact Assessment**: Quantified analysis across all dimensions
   - **Urgency**: Routine (standard timeline), Urgent (expedited), Emergency (implement immediately, document retroactively)

2. **Impact Assessment Across Six Dimensions**: Every change must be assessed on:
   - **Cost Impact**: Direct costs (materials, labor, equipment), indirect costs (extended preliminaries, management overhead, financing), contingency drawdown, cumulative impact on EAC (Estimate at Completion)
   - **Schedule Impact**: Critical path analysis, float consumption, milestone impacts, completion date effect. Per AACE RP 29R-03 forensic schedule analysis methodology
   - **Scope Impact**: WBS elements affected, deliverable additions/modifications/deletions, interface impacts on other disciplines or contractors
   - **Quality Impact**: Effect on design integrity, specification compliance, performance requirements, reliability targets
   - **Safety Impact**: New hazards introduced, changes to risk profile, HAZOP or safety review implications, permit modifications required
   - **Environmental Impact**: Environmental compliance implications, permit modifications, emissions or waste profile changes

3. **Approval Workflow (6-Step Process)**:
   - **Step 1 - Initiate**: Capture change request, assign unique ID, classify category and urgency, assign assessor, set assessment deadline
   - **Step 2 - Assess**: Conduct multi-dimensional impact assessment, prepare recommendation
   - **Step 3 - Review**: Review panel validates assessment quality, confirms classification, routes to appropriate approval authority
   - **Step 4 - Approve/Reject/Defer**: CCB or designated authority makes decision with documented rationale
   - **Step 5 - Implement**: Track implementation of approved changes, update baselines, issue instructions to affected agents
   - **Step 6 - Close**: Verify implementation, compare actual vs. estimated impact, capture lessons learned

4. **Change Control Board (CCB) Management**:
   - Define CCB membership by project phase (standing members + ad-hoc technical reviewers)
   - Schedule regular CCB meetings (weekly during execution, bi-weekly during FEL phases)
   - Prepare CCB agenda packages with prioritized change requests and impact assessments
   - Record CCB decisions with voting record and rationale
   - Track CCB action items to closure
   - Maintain CCB effectiveness metrics (decision turnaround time, meeting duration, rework rate)

5. **Trend Analysis and Proactive Management**:
   - Monitor change submission rates by period, discipline, and contractor
   - Identify root causes driving recurring changes (design errors, scope gaps, late information)
   - Calculate cumulative cost and schedule impact trends
   - Forecast contingency consumption rate and sufficiency
   - Provide early warning when change patterns indicate systemic problems
   - Recommend process improvements based on trend data

**Constraints:**
- Must follow client-specific approval authority matrix (who can approve at what threshold)
- Must integrate with EVM baseline management for cost and schedule impact
- Must distinguish clearly between the four change categories
- All cost and schedule impacts must be quantified before CCB review
- Must maintain complete audit trail for all decisions (regulatory and contractual compliance)
- Must track contingency drawdown from approved changes
- Must produce outputs in Spanish (Latin American) with English technical terms preserved
- Emergency changes may be implemented before formal approval but must be documented within 5 business days

---

## Trigger / Invocation

```
/manage-project-change-control
```

### Command Triggers
- `manage-project-change-control initiate --title [description] --category [scope|design-dev|rework|regulatory|client|force-majeure]`
- `manage-project-change-control assess --cr-id [CR-XXX-YYYY-NNN]`
- `manage-project-change-control review --cr-id [CR-XXX-YYYY-NNN]`
- `manage-project-change-control approve --cr-id [CR-XXX-YYYY-NNN] --authority [name/role]`
- `manage-project-change-control reject --cr-id [CR-XXX-YYYY-NNN] --rationale [reason]`
- `manage-project-change-control defer --cr-id [CR-XXX-YYYY-NNN] --review-date [YYYY-MM-DD]`
- `manage-project-change-control ccb-agenda --date [YYYY-MM-DD]`
- `manage-project-change-control trend --period [monthly|quarterly|cumulative]`
- `manage-project-change-control report --type [status|trend|impact|aging|contingency]`

### Natural Language Triggers
- "Submit a change request for additional pump capacity"
- "Assess the impact of change CR-PRJ-2026-015"
- "Prepare the CCB agenda for next week"
- "What is the cumulative cost impact of all approved changes?"
- "Show me the change trend analysis for Q1"
- "Which changes are overdue for assessment?"
- "How much contingency remains after approved changes?"
- "Generate the monthly change control report"

### Aliases
- `/project-change-control`
- `/change-request`
- `/ccb-management`

### Automatic Triggers
- New scope item identified during design review or constructability assessment
- Budget variance exceeds threshold (>5% on any WBS element)
- Schedule variance exceeds threshold (>10 days on critical path activity)
- EPC contractor submits variation claim or compensation event
- Regulatory authority issues new or revised requirement
- FEL gate review identifies scope gap or deficiency
- Monthly reporting cycle triggers trend analysis generation

---

## Input Requirements

### Required Inputs

| Input | Source | Required | Format | Description |
|-------|--------|----------|--------|-------------|
| Change Request Form | Originator (any agent or stakeholder) | Yes | .md / .docx | Description, justification, urgency, category, affected systems |
| Project Cost Baseline | Finance (AG-010) / Execution (AG-006) | Yes | .xlsx | BAC by WBS element, current EAC, contingency allocation |
| Project Schedule Baseline | Execution (AG-006) | Yes | .xlsx / .mpp | Critical path, float analysis, milestone dates |
| Approval Authority Matrix | Project Management | Yes | .xlsx | Tiered approval authorities by change value and type |
| Risk Register | HSE (AG-004) / Project Management | Yes | .xlsx | Current risk profile for safety and risk impact assessment |
| Contract Provisions | Contracts (AG-005) | Yes | .pdf / .docx | Contractual change order mechanisms, variation procedures |

### Optional Inputs (Strongly Recommended)

| Input | Source | Required | Format | Default if Absent |
|-------|--------|----------|--------|-------------------|
| EVM Performance Data | Execution (AG-006) | No | .xlsx | Impact uses baseline only without performance adjustment |
| Existing Change Register | Project Orchestrator | No | .xlsx | New register created from scratch |
| Contingency Register | Finance (AG-010) | No | .xlsx | Contingency drawdown not tracked |
| Historical Change Data | VSC Knowledge Base | No | .xlsx | Industry benchmark data applied |
| CCB Charter | Project Management | No | .docx | Default CCB structure applied |

### Context Enrichment (Automatic)

The agent will automatically:
- Retrieve cost and schedule baselines from project controls data
- Access current EVM indices (CPI, SPI) for performance-adjusted impact estimates
- Pull approval authority matrix from project management plan
- Access contract variation provisions from Contracts agent (AG-005)
- Query VSC knowledge base for change management benchmarks by industry and project type
- Retrieve AACE recommended practices for impact assessment methodology

---

## Output Specification

### Document 1: Change Impact Assessment (.docx)

**Filename**: `{ProjectCode}_Change_Impact_Assessment_{CR-ID}_v{Version}_{YYYYMMDD}.docx`

**Target Length**: 6-18 pages depending on change complexity

**Structure:**

1. **Cover Page** -- VSC branding, project identification, CR number, revision status
2. **Document Control** -- Revision history, review and approval matrix
3. **Change Description and Justification** (1-2 pages)
   - Clear description of the proposed change with technical detail
   - Justification and business case
   - Category classification with rationale
   - Urgency classification with rationale
   - FEL phase context (implications of changing at this phase vs. deferring)
4. **Cost Impact Assessment** (2-4 pages)
   - Direct cost estimate (materials, labor, equipment, subcontracts)
   - Indirect cost estimate (extended preliminaries, management, financing, insurance)
   - Contingency impact (drawdown from existing contingency or additional funding required)
   - Cumulative cost impact (this change combined with all prior approved changes)
   - EAC adjustment (new EAC = current EAC + approved change impact)
   - Basis of estimate, assumptions, and estimating accuracy class per AACE RP 18R-97
5. **Schedule Impact Assessment** (1-3 pages)
   - Affected schedule activities identification
   - Critical path analysis (does this change affect the critical path?)
   - Float consumption analysis for near-critical paths
   - Completion date impact (days of delay or acceleration)
   - Milestone impact register (which milestones shift and by how much)
   - Logic changes required (new dependencies, removed constraints)
6. **Quality Impact Assessment** (1 page)
   - Effect on design basis, performance specifications, or reliability targets
   - Changes to quality inspection or testing requirements
   - Impact on design review or HAZOP action closure status
7. **Safety and Environmental Impact Assessment** (1-2 pages)
   - New hazards introduced by the change
   - Changes to existing risk levels (probability or consequence)
   - HAZOP or safety review requirements triggered
   - Environmental permit or compliance implications
   - Net safety profile change (improved, unchanged, or degraded)
8. **Scope Impact Assessment** (1 page)
   - WBS elements affected
   - Deliverable additions, modifications, or deletions
   - Interface impacts on other disciplines or contractors
9. **CCB Recommendation** (1 page)
   - Recommendation: Approve / Reject / Defer
   - Rationale for recommendation
   - Conditions for approval (if conditional)
   - Alternatives considered and why they were not recommended
   - Implementation timeline if approved

### Document 2: Change Register (.xlsx)

**Filename**: `{ProjectCode}_Change_Register_v{Version}_{YYYYMMDD}.xlsx`

**Sheets:**

1. **Active Changes** -- All open change requests with status tracking
2. **Completed Changes** -- Closed CRs with actual vs. estimated impact variance
3. **Cumulative Impact** -- Running total of approved changes vs. original baseline
4. **CCB Decision Log** -- Full audit trail of CCB decisions with voting records
5. **Trend Analysis** -- Change frequency, source, type, and root cause trends
6. **Contingency Tracker** -- Contingency drawdown from approved changes with burn rate

### Document 3: CCB Agenda Package (.docx)

**Filename**: `{ProjectCode}_CCB_Agenda_{MeetingDate}_{YYYYMMDD}.docx`

**Structure:**

1. **Meeting Information** -- Date, time, attendees, quorum confirmation
2. **Previous Meeting Action Items** -- Status of outstanding actions
3. **Changes for Decision** -- Prioritized list of CRs requiring CCB decision, each with executive summary and recommendation
4. **Changes for Information** -- Minor changes approved under delegated authority since last CCB
5. **Cumulative Impact Summary** -- Total approved change impact on cost and schedule baselines
6. **Contingency Status** -- Remaining contingency, drawdown rate, forecast sufficiency
7. **Trend Highlights** -- Notable patterns in change submissions requiring management attention

### Document 4: Monthly Change Control Report (.docx)

**Filename**: `{ProjectCode}_Change_Control_Report_{Month}_{YYYYMMDD}.docx`

**Structure:**

1. **Executive Summary** -- Key metrics, trend highlights, management attention items
2. **Change Activity Summary** -- CRs submitted, assessed, approved, rejected, deferred during period
3. **Cumulative Impact Dashboard** -- Visual summary of total cost and schedule impact
4. **Trend Analysis** -- Submission rate trends, type distribution, source analysis, root causes
5. **Aging Report** -- CRs overdue for assessment or decision with escalation actions
6. **Contingency Forecast** -- Remaining contingency, projected consumption, sufficiency assessment
7. **Key Changes Detail** -- Narrative on Major/Critical changes processed during period
8. **CCB Effectiveness Metrics** -- Decision turnaround time, meeting efficiency, rework rate
9. **Recommendations** -- Process improvement actions based on trend data

---

## Quality Criteria

### Content Quality (Target: >91% Compliance)

| Criterion | Weight | Metric | Target |
|-----------|--------|--------|--------|
| Assessment Completeness | 25% | All 6 impact dimensions assessed for every CR | 100% |
| Processing Timeliness | 20% | CRs assessed within SLA (5/10 business days by urgency) | >90% |
| Approval Compliance | 20% | All changes approved per authority matrix, no unauthorized baseline changes | 100% |
| Baseline Integrity | 15% | Every baseline change has a corresponding approved CR | 0 violations |
| Trend Visibility | 10% | Monthly trend report produced with root cause analysis and recommendations | 100% |
| Estimation Accuracy | 10% | Actual impact within +/-25% of estimated impact at close-out | >80% |

### Automated Quality Checks

- [ ] Every CR has a unique identifier following the CR-{ProjectCode}-{YYYY}-{NNN} convention
- [ ] Every CR has all mandatory fields populated (description, justification, category, originator, urgency)
- [ ] Every assessed CR has all 6 impact dimensions documented (cost, schedule, scope, quality, safety, environmental)
- [ ] No CR has status "Approved" without approval authority signature and date recorded
- [ ] No baseline change exists without a corresponding approved CR
- [ ] Cumulative impact calculations are mathematically correct and reconcile with the register
- [ ] Contingency drawdown reconciles between change register and contingency tracker
- [ ] Trend analysis data matches underlying change register data
- [ ] All CRs exceeding assessment SLA are flagged for escalation
- [ ] Emergency changes have retroactive documentation within 5 business days
- [ ] Approval authority is correct per classification thresholds and authority matrix
- [ ] CCB agenda packages are distributed at least 48 hours before scheduled meetings
- [ ] Cost estimates include both direct and indirect costs with basis of estimate documented

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs From)

| Agent | Dependency Type | Description | Criticality |
|-------|----------------|-------------|-------------|
| Engineering Design (AG-008) | Change Originator | Design change requests, design development classification, technical impact assessment for engineering scope | Critical |
| Construction Management (AG-009) | Change Originator | Field change requests (site conditions, constructability issues, rework identification), construction impact assessment | Critical |
| Execution (AG-006) | Baseline Provider | Cost and schedule baselines for impact assessment, EVM performance data for adjustment factors | Critical |
| Finance & Accounting (AG-010) | Budget Data | Budget allocation, contingency balance, funding approval for changes exceeding contingency | Critical |
| HSE (AG-004) | Safety Assessment | Safety and environmental impact assessment for changes affecting hazard profile or permits | High |
| Contracts & Compliance (AG-005) | Contract Data | Contractual change provisions, variation procedures, claims management interface | High |
| Operations (AG-002) | Operational Impact | Operational readiness impact for changes affecting operating model, procedures, or staffing | Medium |

### Downstream Dependencies (Outputs To)

| Agent | Dependency Type | Description | Trigger |
|-------|----------------|-------------|---------|
| Execution (AG-006) | Baseline Update | Approved changes trigger cost and schedule baseline updates | On CR approval |
| Finance & Accounting (AG-010) | Budget Adjustment | Budget modifications and contingency drawdown from approved changes | On CR approval |
| Engineering Design (AG-008) | Design Instruction | Design change implementation instructions for engineering scope changes | On CR approval |
| Construction Management (AG-009) | Field Instruction | Construction scope change implementation instructions | On CR approval |
| Contracts & Compliance (AG-005) | Contract Variation | Contract change orders for EPC scope changes, variation claims | On CR approval |
| Orchestrator (AG-001) | Governance Reporting | Change control status, cumulative impact, and trend analysis for OR governance reporting | Monthly / On escalation |
| All Agents | Impact Notification | Notification of approved changes affecting their domain scope or deliverables | On CR approval |

---

## Methodology & Standards

### Primary Standards (Mandatory Compliance)

| Standard | Application |
|----------|-------------|
| **PMI PMBOK 7th Edition** | Integrated Change Control process framework, stakeholder engagement in change decisions |
| **AACE RP 10S-90** | Cost Engineering Terminology -- standard definitions for all change management terms |
| **AACE RP 29R-03** | Forensic Schedule Analysis -- methodology for schedule impact assessment of changes |
| **AACE RP 18R-97** | Cost Estimate Classification System -- estimate accuracy classes for change cost estimates |
| **ISO 21500:2021** | Project Management governance -- change management decision protocols and authority structures |
| **IPA FEL Best Practices** | Phase-appropriate change tolerance and the 1-10-100 cost impact rule |

### Secondary Standards (Reference)

| Standard | Application |
|----------|-------------|
| **FIDIC Conditions of Contract** | Contractual variation and change order procedures (Red Book, Silver Book) |
| **NEC4 ECC** | Compensation event and early warning procedures for contract-based changes |
| **AACE RP 44R-08** | Risk Analysis and Contingency Determination -- contingency management through change control |
| **ISO 31000:2018** | Risk Management principles applied to change risk assessment |
| **CII RT-CII-6-13** | Change Management Best Practices for Capital Projects |

---

## Templates & References

### Document Templates
- `VSC_Project_Change_Request_Form_Template_v1.0.docx` -- Standard CR form for project-level changes
- `VSC_Project_Change_Impact_Assessment_Template_v1.0.docx` -- Multi-dimensional impact assessment
- `VSC_Project_Change_Register_Template_v1.0.xlsx` -- Register workbook with all sheets and formulas
- `VSC_CCB_Agenda_Template_v1.0.docx` -- CCB meeting agenda package template
- `VSC_Monthly_Change_Report_Template_v1.0.docx` -- Monthly report template with VSC branding

### Reference Data Sources
- AACE Recommended Practices library (10S-90, 18R-97, 25R-03, 29R-03, 44R-08)
- PMI PMBOK 7th Edition: Integrated Change Control
- IPA FEL Index benchmarking data for change management performance
- VSC Internal Lessons Learned Database: Change management experiences from prior capital projects
- Industry change frequency benchmarks by project phase (FEL1, FEL2, FEL3, Execution)

---

## Examples

**Example 1: FEL2 Design Change**
```
Command: manage-project-change-control initiate --title "Increase SAG mill capacity from 36ft to 40ft"
  --category scope

Change Request Created: CR-LIT-2026-008
  Category: Scope Change
  Originator: Engineering Design (AG-008)
  FEL Phase: FEL2 (FEED)
  Urgency: Routine (10 business day assessment)

Impact Assessment (completed Day 7):
  Cost: +$12.4M direct (mill, foundation, motor, gearbox) + $1.8M indirect (extended engineering)
  Schedule: +35 calendar days on critical path (foundation redesign + procurement lead time)
  Quality: Higher throughput capacity (+15%), improved circuit resilience
  Safety: Larger rotating equipment -- updated HAZOP required for mill area
  Environmental: No change to environmental permits
  Scope: WBS 3.1.4 (Grinding Circuit) expanded, interfaces to WBS 3.1.5 (Flotation) affected

Classification: Critical (>$500K and >30 days)
Routing: Steering Committee approval required
CCB Recommendation: Approve -- NPV analysis shows +$45M net benefit over mine life
```

**Example 2: Monthly Trend Analysis**
```
Command: manage-project-change-control trend --period monthly

Trend Report: March 2026
  CRs Submitted: 14 (vs. 9 in February, +56%)
  CRs by Category: Scope 4, Design Development 6, Rework 3, Regulatory 1
  CRs by Source: Engineering 8, Construction 4, Client 2
  Top Root Cause: Incomplete geotechnical data (4 CRs, 29%)

  Cumulative Approved Impact:
    Cost: +$28.7M (5.7% of original BAC of $500M)
    Schedule: +18 calendar days on critical path
    Contingency Remaining: $21.3M of $50M original (42.6%)

  Alert: Rework CRs trending upward (1, 2, 3 over last 3 months).
    Root cause: foundation design errors due to incomplete geotech data.
    Recommendation: Commission supplementary geotechnical investigation
    before proceeding with remaining foundation designs.
```
