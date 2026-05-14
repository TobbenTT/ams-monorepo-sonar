---
name: coordinate-project-delegation
description: "Manage cross-discipline task delegation to specialist agents with structured work packages including context, scope, quality criteria, constraints, and deadlines. Track delegation status and resolution. Triggers: 'delegate task', 'assign work package', 'delegation status', 'workload balance'."
category: Project Orchestration (Agent 7 - Project Orchestrator)
priority: P1 - Critical
version: 1.0.0
agent: project-orchestrator (AG-007)
---

# Coordinate Project Delegation

## Skill ID: PO-001
## Version: 1.0.0
## Category: Project Orchestration (Agent 7 - Project Orchestrator)
## Priority: P1 - Critical

---

## Purpose

Manage the structured delegation of project work packages from the Project Orchestrator (AG-007) to specialist agents across the multi-agent system, ensuring that every delegation contains sufficient context, scope definition, quality criteria, constraints, and deadlines for autonomous execution. Track delegation lifecycle from assignment through completion, manage workload balancing across agents, and escalate when delegations are blocked or at risk.

Effective delegation is the cornerstone of multi-agent project execution. Research from PMI's Pulse of the Profession consistently identifies poor task definition and unclear accountability as leading contributors to project failure. In the context of capital project FEL (Front-End Loading) governance, where dozens of parallel workstreams must converge at stage gates, the quality of delegation directly determines gate readiness.

The challenge in FEL-governed capital projects is threefold. First, specialist agents operate in different domains (engineering, procurement, construction, HSE, finance) with distinct vocabularies, standards, and deliverable formats -- delegations must bridge these domains with precise specifications. Second, interdependencies between delegations create cascading risks when one delegation is delayed or produces substandard output. Third, workload imbalances across agents lead to bottlenecks that compromise the integrated project schedule.

This skill implements a formal work package delegation protocol aligned with PMI PMBOK Work Package decomposition principles and IPA FEL best practices. Each delegation is structured as a self-contained work package with seven mandatory elements: Context (why this work matters), Scope (what must be delivered), Format (how the output must be structured), Quality Criteria (what "good" looks like), Constraints (boundaries and limitations), Deadline (when delivery is required), and Priority (relative importance versus other active delegations).

A properly functioning delegation system typically achieves: 95%+ of delegations accepted without clarification requests, 90%+ on-time completion, zero delegation conflicts (two agents assigned the same scope), and balanced workload distribution within 15% variance across agents.

---

## Intent & Specification

The AI agent MUST understand and execute the following:

1. **Work Package Structure**: Every delegation must contain seven mandatory elements:
   - **Context**: Background information explaining why the work is needed, which project phase it supports, and how the output will be used. Must reference the governing Intent Specification and relevant gate requirements.
   - **Scope**: Precise definition of what must be delivered, including inclusions and exclusions. Must reference WBS element(s) and deliverable ID(s).
   - **Format**: Output format specification (document type, template reference, naming convention, language requirements).
   - **Quality Criteria**: Measurable acceptance criteria aligned with the VSC Quality Assurance Framework (Technical Accuracy, Completeness, Consistency, Format, Actionability, Traceability).
   - **Constraints**: Boundaries including budget limits, methodology restrictions, regulatory requirements, and interface obligations.
   - **Deadline**: Required delivery date with intermediate checkpoints for complex delegations.
   - **Priority**: Ranking (P1-Critical, P2-High, P3-Medium, P4-Low) with justification relative to gate timeline.

2. **Delegation Lifecycle Management**: Track each delegation through a 5-stage lifecycle:
   - **Assigned**: Work package created and transmitted to receiving agent.
   - **Acknowledged**: Receiving agent confirms receipt, reviews scope, and either accepts or requests clarification.
   - **In-Progress**: Agent is actively executing the work package.
   - **Review**: Output submitted for quality review by the Project Orchestrator.
   - **Complete**: Output accepted and integrated into project deliverables.

3. **Dependency Mapping**: Identify and track dependencies between delegations:
   - **Finish-to-Start (FS)**: Delegation B cannot start until Delegation A is complete.
   - **Start-to-Start (SS)**: Delegation B can start when Delegation A starts.
   - **Finish-to-Finish (FF)**: Delegation B cannot finish until Delegation A finishes.
   - **Start-to-Finish (SF)**: Delegation B cannot finish until Delegation A starts.

4. **Workload Balancing**: Monitor agent workload and redistribute when imbalances exceed thresholds:
   - Track active delegation count, estimated effort hours, and deadline density per agent.
   - Flag agents with utilization >85% or <40% for rebalancing consideration.
   - Propose redistribution when imbalance exceeds 25% variance from mean.

5. **Escalation Protocol**: Escalate delegations that are blocked, overdue, or at risk:
   - **Warning**: Delegation at 80% of timeline with <60% progress.
   - **Alert**: Delegation overdue by 1-3 business days.
   - **Escalation**: Delegation overdue by >3 business days or blocked by external dependency.
   - **Critical**: Delegation on gate critical path and at risk of gate delay.

**Constraints:**
- Must maintain Single Writer Multiple Readers (SWMR) compliance -- only one agent owns each entity type.
- Must integrate with the project gate system (G0-G4).
- Must respect agent capability boundaries (do not delegate engineering work to finance agent).
- Must produce delegation records auditable for gate reviews.
- Must handle parallel delegations to multiple agents for integrated deliverables.
- Must support delegation revision when scope or requirements change.

---

## Trigger / Invocation

```
/coordinate-project-delegation
```

### Command Triggers
- `coordinate-project-delegation create --agent [AG-XXX] --wbs [element] --deliverable [name]`
- `coordinate-project-delegation status --delegation-id [DEL-XXX]`
- `coordinate-project-delegation status --agent [AG-XXX]`
- `coordinate-project-delegation balance --check`
- `coordinate-project-delegation balance --rebalance`
- `coordinate-project-delegation escalate --delegation-id [DEL-XXX] --reason [description]`
- `coordinate-project-delegation report --type [status|workload|dependency|overdue]`
- `coordinate-project-delegation revise --delegation-id [DEL-XXX] --field [scope|deadline|priority]`

### Natural Language Triggers
- "Delegate the HAZOP review to the HSE agent"
- "Assign the cost estimate work package to finance"
- "What is the status of all active delegations?"
- "Which agents are overloaded?"
- "Show me the dependency map for FEL2 gate deliverables"
- "Escalate the engineering design delegation -- it is blocking procurement"
- "Rebalance workload across agents for the next sprint"

### Aliases
- `/delegate-task`
- `/assign-work-package`
- `/delegation-tracker`

### Automatic Triggers
- New gate phase initiated (generate delegation plan for all gate deliverables)
- Agent reports blocker on active delegation
- Delegation deadline within 48 hours with incomplete status
- Monthly workload rebalancing cycle
- New deliverable added to project scope requiring delegation

---

## Input Requirements

### Required Inputs

| Input | Source | Required | Format | Description |
|-------|--------|----------|--------|-------------|
| Intent Specification | Project Consultant | Yes | .md | Governing IS defining project scope, objectives, and constraints |
| WBS Dictionary | Project Controls | Yes | .xlsx | Work Breakdown Structure with work package definitions |
| Agent Capability Matrix | System Configuration | Yes | .json / .md | Mapping of agent IDs to domain capabilities and entity ownership |
| Project Schedule | Project Controls | Yes | .xlsx / .mpp | Integrated schedule with milestones and gate dates |
| Gate Deliverable Register | Orchestrator (AG-001) | Yes | .xlsx | List of required deliverables per gate with owners |

### Optional Inputs (Strongly Recommended)

| Input | Source | Required | Format | Default if Absent |
|-------|--------|----------|--------|-------------------|
| Active Delegation Register | Project Orchestrator | No | .xlsx | New register created |
| Agent State Files | Agent System | No | .md | Assume all agents available at baseline capacity |
| Resource Calendar | HR / Project Controls | No | .xlsx | Standard 5-day work week, no holidays |
| Historical Delegation Performance | VSC Knowledge Base | No | .xlsx | Industry benchmark completion rates applied |
| Risk Register | Project Management | No | .xlsx | No risk-adjusted prioritization |

### Context Enrichment (Automatic)

The agent will automatically:
- Retrieve current agent state from `state/{agent}-state.md` files for workload assessment
- Access ENTITY_OWNERSHIP dictionary to validate delegation assignments against SWMR rules
- Pull gate timeline and deliverable requirements from project gate configuration
- Query delegation history for estimation of agent completion rates
- Access methodology references from `methodology/` for quality criteria standards

---

## Output Specification

### Document 1: Work Package Delegation (.md)

**Filename**: `{ProjectCode}_Delegation_{DEL-Number}_v{Version}_{YYYYMMDD}.md`

**Target Length**: 2-4 pages per delegation

**Structure:**

```markdown
# Work Package Delegation: {DEL-Number}

## 1. Delegation Metadata
- **Delegation ID**: DEL-{YYYY}-{NNN}
- **Date Issued**: {YYYY-MM-DD}
- **Issuing Agent**: Project Orchestrator (AG-007)
- **Receiving Agent**: {Agent Name} ({Agent ID})
- **WBS Element**: {WBS Code} - {WBS Description}
- **Gate Alignment**: {Gate ID} - {Gate Name}
- **Priority**: {P1|P2|P3|P4} - {Justification}
- **Status**: {Assigned|Acknowledged|In-Progress|Review|Complete}

## 2. Context
{Why this work is needed, project phase context, how the output
will be used, reference to Intent Specification}

## 3. Scope
### 3.1 Inclusions
{Precise list of what must be delivered}
### 3.2 Exclusions
{What is explicitly NOT in scope}
### 3.3 Deliverable(s)
{Deliverable ID, name, format, naming convention}

## 4. Format Requirements
{Template reference, document structure, naming convention,
language (Spanish LatAm with English technical terms preserved)}

## 5. Quality Criteria
| Criterion | Target | Measurement |
|-----------|--------|-------------|
| Technical Accuracy | >91% | Per VSC QA Framework |
| Completeness | 100% of spec sections | Checklist verification |
| Consistency | Zero conflicts with related deliverables | Cross-reference check |
| Format | VSC branding compliant | Template compliance |
| Actionability | Usable without rework | Stakeholder review |
| Traceability | All claims sourced | Source audit |

## 6. Constraints
{Budget limits, methodology restrictions, regulatory requirements,
interface obligations, technology constraints}

## 7. Deadline & Checkpoints
- **Checkpoint 1 (25%)**: {Date} - {Milestone description}
- **Checkpoint 2 (50%)**: {Date} - {Milestone description}
- **Checkpoint 3 (75%)**: {Date} - {Milestone description}
- **Final Delivery**: {Date}

## 8. Dependencies
### Inputs Required From Other Delegations
| Delegation ID | Agent | Description | Required By |
|---------------|-------|-------------|-------------|
### Outputs Provided To Other Delegations
| Delegation ID | Agent | Description | Provided By |
|---------------|-------|-------------|-------------|

## 9. Acceptance Protocol
{How the output will be reviewed, who reviews, turnaround time,
iteration process if quality criteria not met}
```

### Document 2: Delegation Register (.xlsx)

**Filename**: `{ProjectCode}_Delegation_Register_v{Version}_{YYYYMMDD}.xlsx`

**Sheets:**

1. **Active Delegations** -- All open delegations with current status
   - Columns: DEL ID, Date Issued, Receiving Agent, WBS Element, Deliverable, Priority, Status, Deadline, % Complete, Days Remaining, Risk Flag, Dependencies, Notes
   - Conditional formatting: Red (overdue), Amber (at risk), Green (on track)

2. **Completed Delegations** -- Closed delegations with performance data
   - Additional columns: Planned Duration, Actual Duration, Variance, Quality Score, Iterations Required, Lessons Learned

3. **Dependency Matrix** -- Cross-delegation dependency map
   - Matrix format: Delegation IDs on rows and columns, dependency type in cells (FS, SS, FF, SF)
   - Critical path delegation chain highlighted

4. **Workload Dashboard** -- Agent utilization summary
   - Columns: Agent ID, Agent Name, Active Delegations, Total Estimated Hours, Utilization %, Deadline Density (delegations due within 2 weeks), Risk Score

5. **Escalation Log** -- Record of all escalations
   - Columns: Escalation ID, Date, Delegation ID, Agent, Reason, Severity (Warning/Alert/Escalation/Critical), Resolution, Resolution Date

### Document 3: Workload Balance Report (.docx)

**Filename**: `{ProjectCode}_Workload_Balance_Report_{Period}_{YYYYMMDD}.docx`

**Structure:**

1. **Executive Summary** -- Overall delegation health, agent utilization, key risks
2. **Agent Utilization Matrix** -- Each agent's current load, capacity, and delegation count
3. **Bottleneck Analysis** -- Agents with utilization >85%, root cause, proposed mitigation
4. **Underutilization Analysis** -- Agents with utilization <40%, opportunity for redistribution
5. **Dependency Critical Path** -- Delegation chains that determine gate readiness dates
6. **Rebalancing Recommendations** -- Specific delegation transfers proposed with rationale
7. **Forecast** -- Projected workload for next 4 weeks based on upcoming gate requirements

---

## Quality Criteria

### Content Quality (Target: >91% Compliance)

| Criterion | Weight | Metric | Target |
|-----------|--------|--------|--------|
| Work Package Completeness | 25% | All 7 mandatory elements present in every delegation | 100% |
| Delegation Clarity | 20% | Delegations accepted without clarification requests | >95% |
| On-Time Completion | 20% | Delegations completed by deadline | >90% |
| Workload Balance | 15% | Agent utilization variance from mean | <15% |
| Dependency Tracking | 10% | Dependencies identified and mapped before delegation | 100% |
| Escalation Timeliness | 10% | At-risk delegations escalated within SLA | >95% |

### Automated Quality Checks

- [ ] Every delegation has all 7 mandatory elements populated (Context, Scope, Format, Quality Criteria, Constraints, Deadline, Priority)
- [ ] Every delegation has a unique DEL-{YYYY}-{NNN} identifier
- [ ] Receiving agent is validated against ENTITY_OWNERSHIP for the delegated entity type
- [ ] No two active delegations assign the same scope to different agents
- [ ] Deadline is within the governing gate timeline
- [ ] Priority ranking is consistent with gate critical path
- [ ] Dependencies reference valid delegation IDs that exist in the register
- [ ] No circular dependencies in the dependency graph
- [ ] Agent utilization calculated correctly from active delegation estimates
- [ ] Escalation triggers are evaluated daily for all active delegations
- [ ] Completed delegations have quality score and performance metrics recorded
- [ ] Revised delegations maintain full revision history
- [ ] No "TBD," "pending," or placeholder entries in active delegation scope fields

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs From)

| Agent | Dependency Type | Description | Criticality |
|-------|----------------|-------------|-------------|
| Orchestrator (AG-001) | Strategic Direction | OR strategy, gate requirements, and deliverable register that define what must be delegated | Critical |
| Execution (AG-006) | Schedule Integration | Integrated project schedule providing deadlines and milestone dates for delegations | Critical |
| All Agents (AG-002 to AG-012) | Capability Declaration | Agent state files declaring current capacity, active work, and domain capabilities | High |

### Downstream Dependencies (Outputs To)

| Agent | Dependency Type | Description | Trigger |
|-------|----------------|-------------|---------|
| Operations (AG-002) | Work Assignment | Operations-domain work packages (SOPs, operating model, ramp-up plans) | On delegation creation |
| Asset Management (AG-003) | Work Assignment | Asset management work packages (RCM, FMECA, maintenance strategies, spare parts) | On delegation creation |
| HSE (AG-004) | Work Assignment | HSE work packages (HAZOP, risk assessments, PSSR, emergency response) | On delegation creation |
| Contracts & Compliance (AG-005) | Work Assignment | Procurement and contracts work packages (tender docs, contract reviews, compliance) | On delegation creation |
| Execution (AG-006) | Work Assignment | Project execution work packages (commissioning, handover, EVM) | On delegation creation |
| Engineering Design (AG-008) | Work Assignment | Engineering work packages (design reviews, EDDR, technical specifications) | On delegation creation |
| Construction Management (AG-009) | Work Assignment | Construction work packages (MC packages, quality plans, field supervision) | On delegation creation |
| Finance & Accounting (AG-010) | Work Assignment | Financial work packages (cost estimates, budget models, financial reports) | On delegation creation |
| HR & Talent (AG-011) | Work Assignment | HR work packages (staffing plans, recruitment, training programs) | On delegation creation |
| IT/OT & Communications (AG-012) | Work Assignment | IT/OT work packages (system integration, network design, communications plans) | On delegation creation |
| Orchestrator (AG-001) | Reporting | Delegation status, workload balance, and escalation reports for OR governance | Weekly / On escalation |

---

## Methodology & Standards

### Primary Standards (Mandatory Compliance)

| Standard | Application |
|----------|-------------|
| **PMI PMBOK 7th Edition** | Work Package decomposition, WBS principles, task assignment protocols |
| **IPA FEL Best Practices** | Gate deliverable requirements that drive delegation scope definition |
| **ISO 21500:2021** | Project governance and task management frameworks |
| **AACE RP 11R-88** | Required Skills and Knowledge of Cost Engineering -- delegation competency mapping |

### Secondary Standards (Reference)

| Standard | Application |
|----------|-------------|
| **CII RT-CII-252** | Work Packaging for Capital Projects -- work package structuring principles |
| **COBIT 2019** | Governance of delegated IT/OT work packages |
| **ISO 55001:2014** | Asset management delegation standards for AG-003 work packages |

---

## Templates & References

### Document Templates
- `VSC_Work_Package_Delegation_Template_v1.0.md` -- Standard delegation document
- `VSC_Delegation_Register_Template_v1.0.xlsx` -- Register workbook with all sheets and formulas
- `VSC_Workload_Balance_Report_Template_v1.0.docx` -- Monthly balance report with VSC branding

### Reference Data Sources
- VSC ENTITY_OWNERSHIP dictionary (agents/_shared/ configuration)
- Agent CLAUDE.md files defining domain capabilities
- Historical delegation performance data from prior VSC projects
- IPA FEL gate deliverable checklists by project type

---

## Examples

**Example 1: FEL2 Gate Delegation Plan**
```
Command: coordinate-project-delegation create --agent AG-003 --wbs 3.2.1 --deliverable "Equipment Criticality Analysis"

Delegation Created: DEL-2026-042
  Receiving Agent: Asset Management (AG-003)
  WBS Element: 3.2.1 - Equipment Criticality Assessment
  Gate: FEL2 - FEED / FID
  Priority: P1 - Critical (gate deliverable, on critical path)
  Deadline: 2026-04-15
  Dependencies:
    - Requires DEL-2026-038 (Equipment List from AG-008) by 2026-03-15
    - Feeds DEL-2026-045 (Maintenance Strategy from AG-003) starting 2026-04-01
  Quality Criteria: Criticality matrix for 100% of tagged equipment, ABC classification,
    methodology per ISO 14224 and VSC criticality framework
  Status: Assigned
```

**Example 2: Workload Rebalancing**
```
Command: coordinate-project-delegation balance --check

Workload Analysis (Period: 2026-03):
  AG-002 Operations:       12 active delegations, 85% utilization  [AT CAPACITY]
  AG-003 Asset Management:  8 active delegations, 72% utilization  [NORMAL]
  AG-004 HSE:               5 active delegations, 45% utilization  [UNDERUTILIZED]
  AG-005 Contracts:         6 active delegations, 55% utilization  [NORMAL]
  AG-006 Execution:        14 active delegations, 92% utilization  [OVERLOADED]
  AG-008 Engineering:      11 active delegations, 88% utilization  [AT CAPACITY]

  Recommendation: Transfer 2 non-critical delegations from AG-006 to AG-004
    (HSE-adjacent scope items that AG-004 can execute within capability).
    Defer 1 P3 delegation from AG-008 to next sprint to reduce peak load.
```
