---
name: manage-project-decision-log
description: "Record and track all key project decisions with traceability to gate outcomes, decision rationale, alternatives considered, and impact assessment for capital project governance. Triggers: 'decision log', 'project decisions', 'registro de decisiones'."
category: "Project Governance — Decision Management"
priority: P1 - High
version: 1.0.0
agent: project-orchestrator (AG-007)
---

# Manage Project Decision Log

## Skill ID: PO-005
## Version: 1.0.0
## Category: Project Governance — Decision Management
## Priority: P1 - High

---

## Purpose

Record, track, and manage all key project decisions throughout the capital project lifecycle with full traceability to FEL gate outcomes, documented decision rationale, alternatives considered and rejected, impact assessment across cost-schedule-quality-safety dimensions, and clear assignment of decision authority and accountability. This skill maintains the project decision log as a living governance instrument that ensures every significant choice is captured, justified, and traceable — from concept selection through handover.

Decision traceability is a foundational requirement of capital project governance. The PMI Practice Standard for Project Configuration Management identifies the decision log as one of the five essential project records, alongside the change log, issue register, risk register, and lessons learned register. In practice, however, decision management is the most frequently neglected of these five disciplines. A survey by the Construction Industry Institute (CII Research Summary 325-1, 2019) found that only 28% of capital projects maintain a formal decision log, and of those, fewer than half record the alternatives considered or the rationale for the selected option. The consequence is severe: when decisions are challenged during execution or post-project review, the project team cannot explain why a particular path was chosen, leading to costly re-evaluation, scope disputes, and legal exposure.

The value of rigorous decision documentation is most apparent during three critical moments in the project lifecycle. First, during **gate reviews**: steering committees and investment review boards need evidence that key decisions made during the current phase were based on sound analysis and aligned with project objectives. Second, during **change management**: when a proposed change requires assessment, the decision log reveals the original decisions that would be affected and their rationale, enabling informed impact analysis. Third, during **dispute resolution and audit**: when contract claims arise or regulatory authorities question project choices, the decision log provides the documented chain of reasoning that demonstrates due diligence and professional judgment.

This skill directly addresses **Pain Point CP-09** (Decision Traceability Gap): In 83% of capital project disputes and claims that proceed to arbitration, the inability to produce documented decision rationale is cited as a contributing factor to adverse outcomes (FIDIC Dispute Resolution Board Foundation, 2020). The root cause is that decisions are made in meetings, communicated verbally, and implemented without formal recording of the alternatives considered, the criteria applied, the parties consulted, or the expected outcomes. When the decision later proves suboptimal — as inevitably happens in complex projects — there is no record to demonstrate that the decision was reasonable given the information available at the time.

This skill eliminates the decision traceability gap by enforcing a structured decision record format that captures the complete decision context (phase, category, urgency, stakeholders), the decision itself (description, selected option), the analytical basis (alternatives considered, evaluation criteria, scoring), the governance chain (decision maker, authority basis, consulted parties), and the expected impact (cost, schedule, quality, safety, scope).

---

## Intent & Specification

| Attribute              | Value                                                                 |
|------------------------|-----------------------------------------------------------------------|
| **Skill ID**           | PO-005                                                                |
| **Agent**              | Project Orchestrator (AG-007)                                         |
| **Domain**             | Capital Project Decision Governance                                   |
| **Version**            | 1.0.0                                                                 |
| **Complexity**         | Medium-High                                                           |
| **Estimated Duration** | Per decision record: 30-60 minutes; Monthly log review: 2-4 hours     |
| **Maturity**           | Production                                                            |
| **Pain Point Addressed** | CP-09: 83% of disputes cite inability to produce decision rationale (FIDIC 2020)|
| **Secondary Pain**     | CP-10: Gate reviews lack evidence of decision quality and alignment    |
| **Value Created**      | Audit-defensible decision trail; 50% reduction in decision re-evaluation during execution |

### Functional Intent

This skill SHALL:

1. **Record Structured Decision Records**: Capture every key project decision using a standardized record structure that includes: decision ID, date, FEL gate phase, decision category (Scope, Schedule, Cost, Technical, Commercial, Safety, Regulatory, Organizational), description, urgency level, and business context that necessitated the decision.

2. **Document Alternatives Considered**: For every decision, record all alternatives that were evaluated, including the status quo option. For each alternative, capture the description, advantages, disadvantages, and evaluation score against defined criteria. Document why alternatives were rejected with specific rationale.

3. **Capture Decision Rationale**: Record the reasoning process that led to the selected option, including the evaluation criteria used, weightings applied, data sources consulted, expert opinions obtained, and any assumptions or constraints that influenced the decision. This rationale must be sufficient for an independent reviewer to understand the decision logic.

4. **Assign Decision Authority**: Record the decision maker (individual or body), their authority basis (delegation of authority matrix reference, gate governance protocol, or project charter clause), and all parties consulted or informed. Distinguish between decisions made within delegated authority and those requiring escalation to steering committee or executive board.

5. **Assess Decision Impact**: Document the expected impact of the decision across five dimensions — cost (budget impact), schedule (timeline impact), quality (specification or performance impact), safety (risk profile change), and scope (scope boundary change). Include both positive impacts (benefits of the decision) and negative impacts (trade-offs accepted).

6. **Maintain Gate Traceability**: Link every decision to the FEL gate phase in which it was made. During gate reviews, produce a filtered view of all decisions made during the current phase, enabling the gate review panel to assess whether decisions made in the phase are consistent with phase objectives and have been properly governed.

7. **Track Pending Decisions**: Maintain a separate view of decisions that are required but not yet made, including the decision deadline, impact of delay, responsible party, and escalation path. Surface pending decisions in the project dashboard and gate review packages.

8. **Manage Decision Escalation**: Track decisions that exceed the project manager's delegated authority and require escalation to steering committee or executive board. Maintain the escalation trail including date escalated, decision body, meeting reference, and resolution.

9. **Support Decision Review and Audit**: Provide search, filter, and reporting capabilities across the decision log — by phase, category, decision maker, date range, and impact dimension. Generate audit-ready decision reports for external review, dispute resolution, or regulatory inquiry.

### Success Criteria

- 100% of key decisions captured within 48 hours of being made
- Every decision record includes alternatives considered and rationale documented
- Gate traceability maintained — every decision linked to its FEL phase
- Pending decisions tracked with deadlines and escalation paths defined
- Decision log passes external audit review for completeness and traceability
- Monthly decision log review conducted with no stale or incomplete records

### Constraints

- Must not create excessive administrative overhead — decision recording process must take <60 minutes per decision
- Must distinguish between key decisions (requiring formal recording) and routine decisions (not requiring formal recording) using defined decision significance criteria
- Must maintain confidentiality markings where decisions involve commercially sensitive information
- Must support bilingual records (English/Spanish) for Latin American project contexts
- Must be compatible with the project change control process — decisions that constitute scope changes must reference the corresponding change request
- Must preserve the integrity of historical records — past decisions cannot be modified, only annotated with supplementary information

---

## Trigger / Invocation

### Direct Invocation

```
/manage-project-decision-log --project [name] --action [record|update|query|report|pending]
```

### Command Variants

- `/manage-project-decision-log record --project [name]` — Record a new decision
- `/manage-project-decision-log update --project [name] --decision [DEC-XXX]` — Update decision status or add follow-up information
- `/manage-project-decision-log query --project [name] --filter [phase|category|date|maker]` — Search and filter decisions
- `/manage-project-decision-log report --project [name] --gate [FEL2]` — Generate gate-phase decision report
- `/manage-project-decision-log pending --project [name]` — List all pending decisions with deadlines
- `/manage-project-decision-log escalation --project [name]` — Track escalated decisions requiring higher authority

### Aliases

- `/decision-log`, `/project-decisions`, `/registro-decisiones`, `/log-decisiones`

### Natural Language Triggers (EN)

- "Record the decision to proceed with Option B for the conveyor routing"
- "What decisions were made during FEL2?"
- "List all pending decisions with their deadlines"
- "Who approved the change to the tailings dam design?"
- "Generate the decision log report for the gate review"
- "What alternatives were considered for the power supply configuration?"

### Natural Language Triggers (ES)

- "Registrar la decision de proceder con la Opcion B para el ruteo del transportador"
- "Que decisiones se tomaron durante FEL2?"
- "Listar todas las decisiones pendientes con sus plazos"
- "Quien aprobo el cambio en el diseno de la presa de relaves?"
- "Generar el informe del registro de decisiones para la revision de compuerta"

### Contextual Triggers

- Gate review approaching (auto-generate decision summary for gate package)
- Change request approved (auto-create decision record linked to the change request)
- Steering committee meeting minutes received (extract and record decisions from minutes)
- Decision deadline approaching within 5 business days (trigger reminder to decision maker)
- Decision deadline exceeded (trigger escalation notification)
- New risk rated Critical or Extreme identified (may trigger decision on risk response)

---

## Input Requirements

### Required Inputs

| Input | Type | Source | Description |
|-------|------|--------|-------------|
| `project_code` | text | User / Session State | Project identifier |
| `decision_description` | text | User / Meeting Minutes | Description of the decision to be recorded |
| `decision_maker` | text | User | Individual or body who made or will make the decision |
| `gate_phase` | enum | Session State | Current FEL gate phase: FEL1, FEL2, FEL3, Execution, Commissioning, Handover |

### Optional Inputs

| Input | Type | Source | Description |
|-------|------|--------|-------------|
| `alternatives` | structured | User / Analysis | List of alternatives considered with evaluation criteria |
| `rationale` | text | User | Documented reasoning for the selected option |
| `impact_assessment` | structured | User / AG-006 / AG-010 | Cost, schedule, quality, safety, and scope impact of the decision |
| `authority_reference` | text | User | Reference to delegation of authority matrix or governance document |
| `meeting_reference` | text | User | Reference to the meeting where the decision was made |
| `related_decisions` | list | System | IDs of related or superseded decisions |
| `change_request_ref` | text | AG-007 | Reference to change request if the decision involves a scope change |
| `supporting_documents` | list | mcp-sharepoint | References to supporting analyses, studies, or reports |
| `confidentiality_level` | enum | User | Public / Internal / Confidential / Restricted |

### Input Validation Rules

```yaml
validation:
  decision_description:
    min_length: 50
    max_length: 2000
  decision_maker:
    not_empty: true
  gate_phase:
    valid_values: ["FEL1", "FEL2", "FEL3", "Execution", "Commissioning", "Handover"]
  alternatives:
    min_alternatives: 2  # At minimum: selected option + 1 alternative (or status quo)
    required_fields_per_alternative: ["description", "advantages", "disadvantages"]
  impact_assessment:
    dimensions: ["cost", "schedule", "quality", "safety", "scope"]
    scale: "qualitative (Low/Medium/High) or quantitative"
```

---

## Output Specification

### Deliverable 1: Project Decision Log (.xlsx)

**Filename**: `{ProjectCode}_Decision_Log_v{Version}_{YYYYMMDD}.xlsx`

**Workbook Structure**:

#### Sheet 1: "Decision Register"

| Column | Field | Description |
|--------|-------|-------------|
| A | Decision_ID | Unique identifier (DEC-{Phase Abbrev}-{NNN}) e.g., DEC-FEL2-015 |
| B | Date_Recorded | Date the decision was recorded |
| C | Date_Made | Date the decision was actually made |
| D | Gate_Phase | FEL1 / FEL2 / FEL3 / Execution / Commissioning / Handover |
| E | Category | Scope / Schedule / Cost / Technical / Commercial / Safety / Regulatory / Organizational |
| F | Urgency | Routine / Important / Urgent / Critical |
| G | Decision_Title | Short title (max 80 characters) |
| H | Decision_Description | Full description of the decision |
| I | Business_Context | Why was this decision necessary? What triggered it? |
| J | Alternatives_Count | Number of alternatives considered |
| K | Selected_Option | Brief description of the selected option |
| L | Rationale_Summary | Summary of why this option was selected |
| M | Decision_Maker | Individual or body that made the decision |
| N | Authority_Basis | Reference to delegation of authority or governance protocol |
| O | Consulted_Parties | Individuals or agents consulted before decision |
| P | Informed_Parties | Individuals or agents informed after decision |
| Q | Impact_Cost | Cost impact: quantified amount or qualitative (Low/Medium/High) |
| R | Impact_Schedule | Schedule impact: days/weeks or qualitative |
| S | Impact_Quality | Quality/performance impact description |
| T | Impact_Safety | Safety impact description |
| U | Impact_Scope | Scope change description (if applicable) |
| V | Change_Request_Ref | Related change request ID (if applicable) |
| W | Related_Decisions | IDs of related or superseded decisions |
| X | Supporting_Docs | References to supporting documents |
| Y | Status | Pending / Made / Implemented / Superseded / Revoked |
| Z | Implementation_Notes | Notes on decision implementation and outcomes |
| AA | Review_Date | Date of most recent review |
| AB | Confidentiality | Public / Internal / Confidential / Restricted |

#### Sheet 2: "Alternatives Analysis"

| Column | Field | Description |
|--------|-------|-------------|
| A | Decision_ID | Reference to parent decision |
| B | Alternative_Number | Sequential number (1 = selected option) |
| C | Alternative_Description | Description of the alternative |
| D | Advantages | Key advantages of this alternative |
| E | Disadvantages | Key disadvantages of this alternative |
| F | Cost_Estimate | Estimated cost of this alternative |
| G | Schedule_Impact | Estimated schedule impact |
| H | Risk_Level | Risk level associated with this alternative |
| I | Evaluation_Score | Composite evaluation score (if multi-criteria analysis used) |
| J | Selected | Yes / No |
| K | Rejection_Rationale | Reason for rejection (if not selected) |

#### Sheet 3: "Pending Decisions"

| Column | Field | Description |
|--------|-------|-------------|
| A | Decision_ID | Identifier for the pending decision |
| B | Description | What needs to be decided |
| C | Category | Decision category |
| D | Urgency | Urgency level |
| E | Decision_Required_By | Deadline for the decision |
| F | Impact_of_Delay | What happens if the decision is not made by the deadline |
| G | Responsible_Party | Who should make this decision |
| H | Escalation_Level | Project Manager / Steering Committee / Executive Board |
| I | Recommended_Action | Recommended decision (if analysis is complete) |
| J | Supporting_Analysis | Reference to supporting analysis document |
| K | Status | Pending / Escalated / Overdue |
| L | Days_Until_Deadline | Calculated field: deadline minus today |

#### Sheet 4: "Decision Summary by Phase"

Pivot table showing decision counts by phase and category with impact summary.

#### Sheet 5: "Escalation Tracker"

| Column | Field | Description |
|--------|-------|-------------|
| A | Decision_ID | Reference to escalated decision |
| B | Date_Escalated | Date decision was escalated |
| C | Escalated_To | Steering committee / Executive board / Sponsor |
| D | Meeting_Reference | Meeting where escalation was presented |
| E | Resolution | Decision made by the escalated body |
| F | Resolution_Date | Date resolution was provided |
| G | Conditions | Any conditions attached to the resolution |

### Deliverable 2: Gate Decision Report (.md)

**Filename**: `{ProjectCode}_Decision_Report_{GatePhase}_v{Version}_{YYYYMMDD}.md`

Structured report (8-15 pages) for gate review package containing:
1. Decision Summary (1 page) — Total decisions by category, key decisions made during the phase
2. Significant Decisions Detail (4-6 pages) — Full record for decisions rated Important, Urgent, or Critical
3. Alternatives Analysis Highlights (2-3 pages) — For the most impactful decisions, summary of alternatives evaluated
4. Pending Decisions (1-2 pages) — Decisions required before next gate, with deadlines and impact of delay
5. Decision Quality Assessment (1 page) — Self-assessment of decision governance quality: were alternatives documented? Was rationale captured? Were appropriate parties consulted?
6. Recommendations (1 page) — Governance improvements and decisions requiring steering committee attention

### Formatting Standards

- Decision status colors: Pending = Amber (#FF8C00), Made = Green (#008000), Implemented = Blue (#0066CC), Superseded = Gray (#808080), Revoked = Red (#CC0000)
- Urgency indicators: Routine = Green, Important = Blue, Urgent = Amber, Critical = Red
- Overdue decisions: Bold red text with exclamation marker
- Category icons: Consistent iconography per decision category for visual scanning

---

## Quality Criteria

| Criterion | Metric | Weight | Target | Minimum Acceptable |
|-----------|--------|--------|--------|-------------------|
| Decision capture rate | Key decisions recorded within 48 hours | 20% | 100% | >90% |
| Completeness | All required fields populated per decision record | 20% | 100% | >95% |
| Alternatives documented | Decisions with alternatives recorded | 15% | >90% of Important+ decisions | >75% |
| Rationale quality | Rationale sufficient for independent reviewer | 15% | 100% of Important+ decisions | >90% |
| Gate traceability | All decisions linked to correct gate phase | 10% | 100% | 100% |
| Pending tracking | Overdue pending decisions flagged and escalated | 10% | 100% | 100% |
| Audit readiness | Decision log passes external audit criteria | 5% | Audit-ready | Minor gaps only |
| Impact documentation | Decisions with impact assessment documented | 5% | >85% of Important+ decisions | >70% |

### Automated Quality Checks

1. **Timeliness check**: Flag decisions recorded more than 48 hours after date made
2. **Completeness check**: Flag decision records with empty required fields
3. **Alternatives check**: Flag Important/Urgent/Critical decisions without alternatives documented
4. **Rationale check**: Flag decisions with rationale field shorter than 100 characters (likely insufficient)
5. **Pending deadline check**: Alert for pending decisions within 5 business days of deadline
6. **Overdue check**: Highlight decisions past deadline without resolution
7. **Phase alignment check**: Verify decision gate_phase matches current project phase (or is from an earlier phase)
8. **Duplicate check**: Flag decisions with similar descriptions that may be duplicates
9. **Authority check**: Flag decisions where the decision maker's authority level is below the decision's escalation level requirement

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents)

| Agent | Input Provided | Criticality | Description |
|-------|---------------|-------------|-------------|
| AG-001 (OR Orchestrator) | OR program-level decisions affecting the project | High | Decisions made at the enterprise OR program level that flow down to project scope, priorities, or constraints |
| AG-006 (Execution) | Schedule and cost impact data for decision assessment | High | When decisions have schedule or cost implications, Execution provides quantified impact analysis |
| AG-008 (Engineering Design) | Technical alternatives analysis and recommendations | High | Engineering provides technical options analysis for technology selection, design alternatives, and vendor selection decisions |
| AG-004 (HSE) | Safety impact assessment for decisions with HSE implications | High | HSE provides safety and environmental impact assessment for decisions affecting process safety, hazard management, or environmental compliance |
| AG-005 (Contracts & Compliance) | Commercial and legal implications of decisions | Medium | Contracts provides commercial impact, contractual implications, and regulatory compliance assessment |
| AG-010 (Finance & Accounting) | Financial impact quantification | Medium | Finance provides cost quantification, budget impact, and funding implications |
| AG-009 (Construction Management) | Constructability input for design and execution decisions | Medium | Construction provides constructability assessment for technical decisions affecting field execution |

### Downstream Dependencies (Outputs TO other agents)

| Agent | Output Provided | Criticality | Description |
|-------|----------------|-------------|-------------|
| AG-007 — assess-fel-gate-readiness (PO-001) | Gate-phase decision summary for gate review package | Critical | Gate assessment includes a review of all decisions made during the current phase to evaluate decision quality and governance |
| AG-007 — generate-project-dashboard (PO-003) | Pending decisions for dashboard display | High | Dashboard surfaces pending decisions requiring steering committee action |
| AG-007 — manage-project-risk-register (PO-004) | Decisions that create or close risks | Medium | Some decisions introduce new risks or close existing risks — these are linked to the risk register |
| AG-001 (OR Orchestrator) | Escalated decisions requiring program-level resolution | High | Decisions exceeding project-level authority are escalated to the OR Orchestrator for program-level governance |
| All specialist agents | Decision outcomes affecting their scope | Medium | When a decision changes scope, schedule, budget, or technical requirements for a discipline, the affected agent is informed via the decision log |

### Cross-Skill Dependencies

| Skill | Relationship | Description |
|-------|-------------|-------------|
| `assess-fel-gate-readiness` (PO-001) | Downstream | Gate assessment reviews phase decisions for governance quality |
| `generate-project-dashboard` (PO-003) | Downstream | Dashboard displays pending decisions and decision statistics |
| `manage-project-risk-register` (PO-004) | Bidirectional | Decisions can create or close risks; risk escalation can trigger decisions |
| `track-project-evm` (PO-002) | Upstream | EVM variance analysis may trigger decisions on corrective actions |
| `manage-change-control` (shared) | Bidirectional | Scope-affecting decisions link to change requests; change approvals are decisions |
| `create-executive-briefing` (shared) | Downstream | Executive briefings reference key decisions and pending escalations |

---

## Methodology & Standards

### Primary References

| Standard | Description | Application |
|----------|-------------|-------------|
| PMI PMBOK 7th Edition | Project Management Body of Knowledge — Decision Management | Decision log structure, governance processes, stakeholder engagement |
| PMI Practice Standard for Configuration Management | Configuration management including decision recording | Decision traceability, baseline management, audit trail |
| FIDIC Conditions of Contract | International construction contract standard | Decision documentation requirements for contractual compliance |
| AACE 10S-90 | Total Cost Management Terminology | Standardized definitions for decision-related cost management terms |
| ISO 21500:2021 | Guidance on Project Management | Decision governance frameworks for project management |

### Decision Significance Criteria

Not every project decision requires formal recording. Use the following criteria to determine whether a decision warrants a formal decision log entry:

| Criterion | Threshold for Formal Recording |
|-----------|-------------------------------|
| Cost impact | > $100K or > 0.5% of BAC |
| Schedule impact | > 1 week on critical path or > 2 weeks on non-critical path |
| Safety impact | Any change to safety risk profile or HAZOP assumptions |
| Scope impact | Any change to project scope baseline |
| Regulatory impact | Any impact on permit conditions or regulatory compliance |
| Contractual impact | Any impact on contract terms, claims, or variations |
| Stakeholder impact | Any decision requiring steering committee or board awareness |
| Precedent value | Decision sets a precedent for future similar decisions |
| Reversibility | Irreversible decisions (e.g., foundation placement, technology lock-in) |

If a decision meets ANY of the above criteria, it should be formally recorded.

### Decision Categories Reference

| Category | Description | Typical Decision Maker | Examples |
|----------|-------------|----------------------|----------|
| Scope | Changes to project deliverables or boundaries | Steering committee (>5% BAC); PM (minor) | Add a second ball mill; defer tailings expansion to Phase 2 |
| Schedule | Changes to project timeline or milestones | PM (within float); Steering committee (milestone changes) | Accelerate structural steel; defer commissioning of non-critical systems |
| Cost | Budget allocation or contingency usage | PM (<$1M); Steering committee (>$1M) | Release contingency for ground conditions; reallocate budget between disciplines |
| Technical | Engineering or technology choices | Lead engineer (routine); PM (significant); SC (major) | Select gyratory vs. jaw crusher; change pipe material from CS to SS |
| Commercial | Procurement, contracts, vendor selection | Procurement manager (routine); PM (significant) | Award EPCM contract; accept vendor deviation |
| Safety | Changes affecting safety or environmental risk | HSE manager (routine); PM (significant); SC (major) | Accept residual risk from HAZOP; modify emergency response procedure |
| Regulatory | Decisions affecting permits or compliance | Legal/regulatory lead; PM; SC as required | Apply for permit amendment; accept regulator condition |
| Organizational | Staffing, organizational structure, roles | PM (project team); SC (organizational changes) | Add third shift; restructure commissioning team |

### Escalation Protocol

```
Decision Authority Hierarchy:
  Level 1: Discipline Lead — Routine technical decisions within discipline scope
  Level 2: Project Manager — Cross-discipline decisions within delegated authority
  Level 3: Steering Committee — Decisions exceeding PM authority or affecting project baseline
  Level 4: Executive Board — Decisions affecting investment thesis or corporate risk profile

Escalation Triggers:
  - Cost impact > PM delegation limit (typically $1-5M depending on project size)
  - Schedule impact > 4 weeks on critical path
  - Safety risk rating change from Medium to High or above
  - Scope change affecting project baseline
  - Stakeholder conflict requiring senior resolution
  - Regulatory non-compliance risk
```
