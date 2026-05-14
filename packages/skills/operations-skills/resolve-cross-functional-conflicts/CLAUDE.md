---
name: resolve-cross-functional-conflicts
description: "Resolve cross-functional conflicts between workstreams in OR programs. Triggers: 'conflict resolution', 'cross-functional', 'conflictos interfuncionales'."
---

# Resolve Cross-Functional Conflicts

## Skill ID: N-02
## Version: 1.0.0
## Category: N. Integration & Decision
## Priority: P2 - Medium

---

## Purpose

Resolve cross-functional conflicts that arise between departments, agents, and workstreams during Operational Readiness (OR) program execution. This skill provides a structured, data-driven methodology for identifying conflicting requirements, analyzing multi-dimensional impacts, generating decision briefs, and facilitating stakeholder alignment -- transforming organizational silos into coordinated decision-making.

Cross-functional conflicts are among the most destructive and pervasive problems in capital project execution and operational readiness programs. Boston Consulting Group research shows that organizational silos cause 30-40% of project value destruction in large capital programs (Pain Point B-03). These conflicts manifest as competing priorities between departments (Operations wants maximum redundancy; Finance wants minimum CAPEX), contradictory specifications (Engineering specifies one vendor; Procurement has a corporate framework agreement with another), resource contention (Maintenance and Operations both need the same SMEs during commissioning), and timeline incompatibilities (HR cannot recruit until Operations defines the operating model, but Operations cannot define the model until Engineering completes the design).

In traditional project execution, these conflicts fester unresolved for weeks or months, with each department optimizing for its own objectives at the expense of the whole. McKinsey's research on organizational health finds that companies with strong cross-functional collaboration deliver 2.4x better total returns to shareholders. Conversely, Deloitte reports that 67% of cross-functional projects fail to achieve their objectives, with inter-departmental conflict cited as the primary root cause in 45% of cases.

The OR System's multi-agent architecture creates unique opportunities for conflict detection and resolution. Because every agent's work products, dependencies, and constraints are digitally tracked, conflicts can be detected automatically at the point of origin -- before they escalate into entrenched positions. This skill transforms conflict resolution from a political exercise into an analytical process, providing decision-makers with objective impact analyses and evidence-based recommendations.

---

## Intent & Specification

**Problem:** Organizational silos and cross-functional conflicts systematically degrade the quality and timeliness of Operational Readiness programs. Specific manifestations include:

- **Competing resource demands** (Pain Point B-03): During commissioning peak, Operations, Maintenance, HSE, and Engineering all require access to the same limited pool of field-experienced engineers. Without structured arbitration, the loudest voice or highest-ranking sponsor wins, not the activity with the greatest impact on project success.
- **Contradictory requirements**: Maintenance strategy calls for standardized equipment to simplify spare parts; Engineering has already specified best-of-breed from multiple vendors. HSE requires additional safety interlocks; Operations argues they will increase spurious trips and reduce availability. These contradictions, if unresolved, create rework loops that consume 10-15% of engineering effort (CII research).
- **Timeline dependencies with circular logic**: HR needs the operating model to develop the staffing plan; Operations needs staffing constraints to finalize the operating model; Finance needs both to build the OPEX budget. These dependency loops create 2-4 week decision latency cycles (Pain Point B-04).
- **Information asymmetry**: Each department has visibility into its own data but lacks context from adjacent domains. Maintenance knows the equipment failure history; Finance knows the budget constraints; Operations knows the production targets. Without integration, each department makes locally optimal but globally suboptimal decisions.
- **Escalation failure**: Conflicts that should be resolved at the working level are escalated to executives who lack domain expertise, or worse, are not escalated at all and resurface during commissioning as critical deficiencies.

**Success Criteria:**
- Cross-functional conflicts detected within 24 hours of manifestation (vs. industry average of 2-4 weeks)
- 80% of conflicts resolved at working level without executive escalation (vs. industry average of 40%)
- Decision brief generation time reduced from 2-3 weeks to 2-4 hours
- Conflict resolution cycle time reduced from 2-4 weeks to 3-5 business days
- Zero unresolved cross-functional conflicts at gate reviews
- Stakeholder satisfaction with conflict resolution process >4.0/5.0
- Reduction in rework attributable to unresolved conflicts by >60%
- Complete audit trail of all conflict analyses, decisions, and rationale

**Constraints:**
- Must not override established governance and decision authority frameworks
- Must present balanced analyses that represent all stakeholder perspectives fairly
- Must escalate safety-related conflicts immediately regardless of normal process
- Must operate in bilingual mode (English/Spanish) for Latin American projects
- Must integrate with project-specific RACI matrices and decision authority levels
- Must produce outputs compatible with existing project reporting frameworks
- Must maintain confidentiality of commercially sensitive information during analysis
- Must respect cultural contexts and organizational hierarchies in stakeholder engagement

---

## Trigger / Invocation

**Primary Triggers:**
- `resolve-cross-functional-conflicts detect --project [name]`
- `resolve-cross-functional-conflicts analyze --conflict [id] --departments [list]`
- `resolve-cross-functional-conflicts brief --conflict [id] --audience [executive|management|working]`
- `resolve-cross-functional-conflicts resolve --conflict [id] --recommendation [option]`
- `resolve-cross-functional-conflicts status --project [name]`
- `resolve-cross-functional-conflicts escalate --conflict [id] --level [L1|L2|L3|L4]`
- `resolve-cross-functional-conflicts report --project [name] --period [weekly|monthly|gate]`

**Aliases:** `/resolve-conflicts`, `/cross-functional`, `/conflict-resolution`, `/resolver-conflictos`

**Automatic Triggers:**
- Agent detects contradictory requirements between two or more domain deliverables
- Resource contention identified where two agents request the same resource for overlapping periods
- Dependency deadlock detected (circular dependency chain with no resolution path)
- Deliverable review identifies conflicting assumptions between domains
- Gate review preparation reveals unresolved inter-domain issues
- Schedule deviation >10% attributed to cross-functional coordination failure
- Stakeholder raises formal objection to another domain's deliverable or recommendation

**Event-Driven Triggers:**
- Weekly cross-functional alignment scan (automated)
- Agent-to-agent escalation request via Inbox
- OR Orchestrator identifies blocked dependency chain
- Client requests conflict resolution support
- Management of Change (MOC) creates cross-functional impacts

---

## Input Requirements

| Input | Source | Required | Description |
|-------|--------|----------|-------------|
| Conflict Description | Agent detection / User report | Yes | Clear statement of the conflict: who, what, why, and impact |
| Affected Domains | Agent metadata | Yes | List of OR domains/agents involved in the conflict |
| Domain Positions | Agent deliverables / stakeholder input | Yes | Each domain's stated requirement, rationale, and constraints |
| Project Context | mcp-sharepoint | Yes | Project scope, timeline, budget, and strategic priorities |
| RACI Matrix | mcp-sharepoint | Yes | Decision authority framework showing who Decides for each domain |
| Deliverable Dependencies | mcp-cmms / mcp-erp / Airtable | Yes | Dependency register showing how the conflicting items connect |
| Risk Register | mcp-sharepoint / Airtable | No | Existing risk entries related to the conflict domains |
| Budget Data | mcp-erp | No | Financial implications of each position (cost, NPV impact) |
| Schedule Data | mcp-project-online | No | Timeline implications of each position (delay, critical path impact) |
| Historical Precedents | Knowledge base | No | Similar conflicts from past projects and their resolutions |
| Stakeholder Preferences | mcp-teams / meeting records | No | Informal positions, concerns, and negotiation boundaries |
| Corporate Standards | mcp-sharepoint | No | Company policies, standards, or directives that constrain options |

**Conflict Registration Schema:**
```yaml
conflict:
  id: "CF-{ProjectCode}-{Year}-{Sequence}"
  title: "Descriptive conflict title"
  project: "Project Name"
  detected_date: "2026-02-17"
  detected_by: "agent-maintenance / user / automated-scan"
  detection_method: "dependency_analysis | deliverable_review | resource_contention | stakeholder_report"

  parties:
    - domain: "Maintenance"
      agent: "agent-maintenance"
      position: "Require standardized Metso crushers across all circuits"
      rationale: "Reduce spare parts inventory by 40%, simplify training, single CMMS config"
      constraints: "CMMS configuration deadline in 3 months"
      sponsor: "Maintenance Manager"
    - domain: "Engineering"
      agent: "agent-project"
      position: "Best-of-breed: Metso primary, FLSmidth secondary, Sandvik tertiary"
      rationale: "Each circuit has different duty; best-of-breed optimizes performance by 8-12%"
      constraints: "Equipment specifications already issued for bid"
      sponsor: "Engineering Manager"
    - domain: "Procurement"
      agent: "agent-procurement"
      position: "Corporate framework agreement with FLSmidth for all crushing"
      rationale: "15% volume discount; established supply chain; proven commercial terms"
      constraints: "Framework agreement expires in 6 months; renewal contingent on volume"
      sponsor: "Procurement Director"

  classification:
    type: "technical | commercial | resource | timeline | regulatory | strategic"
    severity: "critical | high | medium | low"
    urgency: "immediate | this_week | this_month | next_gate"
    domains_affected: 3
    deliverables_blocked: 12
    schedule_impact_days: 15
    cost_impact_estimate: "$2.5M"

  status: "detected | under_analysis | brief_generated | in_resolution | resolved | escalated"
  target_resolution_date: "2026-03-03"
  actual_resolution_date: null
  resolution_method: null
  decision_authority: "Project Director"
```

---

## Output Specification

### Primary Output 1: Conflict Analysis Report (.docx)

**Filename:** `{ProjectCode}_Conflict_Analysis_{ConflictID}_v{version}_{date}.docx`

**Structure (10-25 pages):**

1. **Executive Summary** (1 page)
   - Conflict statement in one paragraph
   - Domains involved and their positions
   - Quantified impact (cost, schedule, risk)
   - Recommended resolution with rationale
   - Decision required and deadline

2. **Conflict Context** (2-3 pages)
   - Project background relevant to the conflict
   - Timeline of how the conflict emerged
   - Stakeholder map specific to this conflict
   - Related decisions and precedents

3. **Position Analysis** (3-5 pages, one section per party)
   - Each domain's position stated objectively
   - Supporting evidence and rationale
   - Constraints and non-negotiable requirements
   - Risks if this position is adopted
   - Risks if this position is rejected

4. **Multi-Dimensional Impact Analysis** (3-5 pages)
   - Cost impact matrix (CAPEX, OPEX, lifecycle cost, NPV)
   - Schedule impact analysis (critical path, float consumption, milestone risk)
   - Safety and environmental impact assessment
   - Operational performance impact (availability, throughput, quality)
   - Risk profile comparison (risk register integration)
   - Stakeholder impact assessment

5. **Options Analysis** (3-5 pages)
   - Option A through N (all viable alternatives)
   - For each option: description, cost, schedule, risk, pros, cons
   - Decision matrix with weighted criteria
   - Sensitivity analysis on key assumptions

6. **Recommendation** (1-2 pages)
   - Recommended option with clear rationale
   - Implementation requirements
   - Residual risks and mitigation
   - Stakeholder communication plan
   - Follow-up actions and timeline

7. **Appendices**
   - Detailed cost models
   - Schedule impact simulations
   - Risk assessment worksheets
   - Stakeholder consultation records

### Primary Output 2: Decision Brief (.pptx)

**Filename:** `{ProjectCode}_Decision_Brief_{ConflictID}_v{version}_{date}.pptx`

**Structure (5-8 slides):**
- Slide 1: Conflict summary (what, who, why it matters)
- Slide 2: Each party's position (side-by-side comparison)
- Slide 3: Impact analysis (cost, schedule, risk dashboard)
- Slide 4: Options comparison matrix
- Slide 5: Recommended resolution with evidence
- Slide 6: Implementation roadmap
- Slide 7: Decision request and timeline
- Slide 8: Appendix -- key assumptions and data sources

### Secondary Outputs:

**Conflict Register Update** (project-database / SharePoint List):
| Field | Type | Description |
|-------|------|-------------|
| Conflict ID | Auto-number | Unique identifier (CF-PRJ-YYYY-NNN) |
| Title | Text | Descriptive title |
| Domains Involved | Multi-select | All affected domains |
| Classification | Selection | Technical / Commercial / Resource / Timeline / Regulatory / Strategic |
| Severity | Selection | Critical / High / Medium / Low |
| Status | Selection | Detected / Under Analysis / Brief Generated / In Resolution / Resolved / Escalated |
| Cost Impact | Currency | Estimated financial impact |
| Schedule Impact | Number | Days of potential delay |
| Deliverables Blocked | Number | Count of blocked deliverables |
| Resolution Method | Selection | Consensus / Compromise / Arbitration / Executive Decision / Escalation |
| Decision Authority | Person | Who made the final decision |
| Resolution Summary | Text | What was decided and why |
| Lessons Learned | Text | What to do differently next time |
| Date Detected | Date | When conflict was first identified |
| Date Resolved | Date | When final decision was made |

**Stakeholder Alignment Communication** (via mcp-teams / mcp-outlook):
- Decision notification to all affected parties
- Implementation action items assigned
- Updated deliverable timelines communicated
- Risk register updated with resolution outcomes

---

## Methodology & Standards

### Conflict Resolution Framework

The skill applies a structured five-phase conflict resolution framework adapted from Harvard Negotiation Project principles, PMI conflict management best practices, and industrial project arbitration methodologies:

```
Phase 1: DETECT       Phase 2: ANALYZE        Phase 3: OPTIONS       Phase 4: DECIDE       Phase 5: IMPLEMENT
-----------------     -------------------     ------------------     -----------------     -------------------
Identify conflict     Understand positions    Generate alternatives   Select resolution     Execute decision
Classify severity     Map impacts             Evaluate trade-offs     Obtain authority       Communicate broadly
Register formally     Identify root cause     Score options           Document rationale    Update deliverables
Notify stakeholders   Quantify consequences   Test feasibility        Assign actions        Monitor compliance
Set resolution SLA    Detect hidden issues    Rank by criteria        Close conflict        Capture lessons
```

### Conflict Classification Taxonomy

| Type | Description | Typical Resolution | Example |
|------|-------------|-------------------|---------|
| **Technical** | Conflicting technical specifications or design choices | Expert review + decision matrix | Equipment standardization vs. best-of-breed |
| **Commercial** | Competing commercial interests or budget allocation | Cost-benefit analysis + NPV modeling | Contract strategy disagreement |
| **Resource** | Multiple demands on same limited resource | Priority-based allocation + sequencing | SME availability during commissioning |
| **Timeline** | Incompatible schedules or dependency deadlocks | Critical path analysis + fast-tracking | Circular dependency between OR domains |
| **Regulatory** | Compliance requirements conflicting with project constraints | Regulatory liaison + risk-based approach | Environmental permit vs. construction schedule |
| **Strategic** | Different interpretations of project objectives or priorities | Executive alignment + strategy clarification | Risk appetite disagreement between owner and operator |

### Severity Assessment Matrix

| Severity | Deliverables Blocked | Schedule Impact | Cost Impact | Safety Relevance | Resolution SLA |
|----------|---------------------|-----------------|-------------|-----------------|----------------|
| **Critical** | >10 deliverables | >30 days delay | >$5M | Direct safety impact | 48 hours to decision brief |
| **High** | 5-10 deliverables | 15-30 days delay | $1-5M | Indirect safety impact | 5 business days |
| **Medium** | 2-5 deliverables | 5-15 days delay | $100K-$1M | No safety impact | 10 business days |
| **Low** | 1 deliverable | <5 days delay | <$100K | No safety impact | Next regular review |

### Industry Standards and References

- **PMI PMBOK 7th Edition** - Conflict management as a project leadership competency; stakeholder engagement strategies
- **Harvard Negotiation Project** - "Getting to Yes" principled negotiation framework; focus on interests not positions
- **ISO 31000:2018** - Risk management framework applied to decision-making under uncertainty
- **CII RT-316** - Alignment During Pre-Project Planning; impact of misalignment on project outcomes
- **IPA Research** - Impact of organizational silos on capital project performance; alignment metrics
- **BCG Studies** - Organizational silos cause 30-40% of project value destruction in large capital programs
- **McKinsey Organizational Health Index** - Cross-functional collaboration as top driver of organizational health
- **Deloitte Cross-Functional Project Research** - 67% failure rate; inter-departmental conflict as primary cause

### Pain Points Addressed with Quantified Impact

| Pain Point | Industry Statistic | VSC Target | Improvement |
|-----------|-------------------|------------|-------------|
| B-03: Organizational Silos | 30-40% project value destruction from silos | <10% value loss from coordination failures | 66-75% improvement |
| B-04: Decision Latency | 2-4 weeks per decision cycle | 3-5 business days | 60-80% faster |
| M-07: Knowledge Transfer Failure | Engineering decisions lost in transition | Full decision audit trail maintained | Systematic prevention |
| D-01: OR Deficiencies at Handover | 60%+ gaps driven by unresolved conflicts | <10% conflict-related gaps | 83% improvement |
| CII Rework Data | 10-15% of engineering effort is rework from contradictions | <3% rework from resolved conflicts | 70-80% reduction |

---

## Step-by-Step Execution

### Phase 1: Conflict Detection & Registration (Steps 1-3)
**Step 1: Detect and Capture the Conflict**
### Phase 2: Multi-Perspective Analysis (Steps 4-7)
**Step 4: Gather Each Party's Full Position**
### Phase 3: Option Generation & Evaluation (Steps 8-10)
**Step 8: Generate Resolution Options**
### Phase 4: Decision & Resolution (Steps 11-13)
**Step 11: Generate Decision Brief**
### Phase 5: Implementation Monitoring & Learning (Steps 14-16)
**Step 14: Monitor Decision Implementation**

See [`references/skill-detailed-steps.md`](references/skill-detailed-steps.md) for complete detailed execution steps.

## Quality Criteria

| Criterion | Metric | Target | Minimum Acceptable |
|-----------|--------|--------|-------------------|
| Detection Speed | Time from conflict manifestation to formal registration | <24 hours | <48 hours |
| Analysis Completeness | All parties' positions documented with evidence | 100% | 100% |
| Impact Quantification | Cost, schedule, and risk quantified for each option | All 3 dimensions | At least cost + schedule |
| Options Generated | Number of viable resolution options presented | >=5 options | >=3 options |
| Decision Brief Quality | Decision-maker rates brief as sufficient for decision | >4.5/5 | >4.0/5 |
| Resolution Cycle Time | Days from detection to formal decision | <5 business days | <10 business days |
| Working-Level Resolution | % resolved without executive escalation | >80% | >60% |
| SLA Compliance | % conflicts resolved within severity-based SLA | >90% | >80% |
| Stakeholder Satisfaction | Parties rate process as fair and transparent | >4.0/5 | >3.5/5 |
| Decision Implementation | % of decisions fully implemented on schedule | >95% | >90% |
| Audit Trail Completeness | Full documentation of analysis, decision, rationale | 100% | 100% |
| Rework Reduction | Rework attributable to unresolved conflicts | <3% of effort | <5% of effort |
| Conflict Recurrence | Same conflict re-emerging after resolution | <5% recurrence | <10% recurrence |
| Lessons Captured | Lessons learned documented for each resolved conflict | 100% | >90% |

### Automated Quality Checks

- [ ] Every conflict has a unique ID and is registered in the Conflict Register
- [ ] All affected domains/agents are identified and notified
- [ ] Each party's position is documented with supporting evidence
- [ ] Cost impact quantified with stated assumptions
- [ ] Schedule impact quantified with critical path reference
- [ ] Minimum 3 resolution options generated and evaluated
- [ ] Decision matrix uses weighted criteria with sensitivity analysis
- [ ] Recommendation clearly stated with rationale
- [ ] Decision authority identified from RACI matrix
- [ ] Decision documented with date, authority, rationale, and conditions
- [ ] All affected deliverables updated post-decision
- [ ] Conflict Register status updated to "Resolved"
- [ ] No "TBD" or placeholder entries in any deliverable
- [ ] Lessons learned captured and stored in knowledge base

---

## Inter-Agent Dependencies

| Agent/Skill | Dependency Type | Description |
|-------------|----------------|-------------|
| `orchestrate-or-program` (H-01) | Upstream / Trigger | Orchestrator detects blocked dependencies and triggers conflict resolution |
| `agent-operations` | Input Provider | Provides operations requirements, constraints, and impact assessments |
| `agent-maintenance` | Input Provider | Provides maintenance strategy requirements, standardization needs, and CMMS impacts |
| `agent-hse` | Input Provider | Provides safety and environmental requirements; escalation for safety-related conflicts |
| `agent-hr` | Input Provider | Provides workforce constraints, training impacts, and organizational requirements |
| `agent-finance` | Input Provider | Provides cost data, budget constraints, NPV analysis, and financial impact assessments |
| `agent-legal` | Input Provider | Provides regulatory constraints, contractual obligations, and compliance requirements |
| `agent-procurement` | Input Provider | Provides commercial terms, supply chain constraints, and vendor relationship impacts |
| `agent-project` | Input Provider | Provides schedule data, engineering specifications, and interface requirements |
| `agent-communications` | Downstream | Receives conflict resolution outcomes for stakeholder communication |
| `agent-doc-control` | Service Agent | Stores conflict analysis reports, decision briefs, and audit trail documents |
| `accelerate-decision-cycle` (N-03) | Peer Skill | Provides decision acceleration support when conflict resolution requires rapid decision |
| `unify-operational-data` (N-01) | Upstream Skill | Provides unified data view that helps detect information-asymmetry conflicts |
| `track-or-deliverables` (H-02) | Data Source | Provides deliverable status data to identify blocked items and impacts |
| `generate-or-gate-review` (H-03) | Downstream Skill | Gate review packages include conflict resolution status and outstanding conflicts |
| `validate-output-quality` (F-05) | Quality Gate | Validates conflict analysis reports meet quality standards before distribution |
| `sync-airtable-jira` (D-01) | Integration | Syncs conflict register with Jira for human task tracking |

---

## Examples

See [`references/skill-examples.md`](references/skill-examples.md) for detailed examples.

## MCP Integrations

See [`references/skill-mcp-integrations.md`](references/skill-mcp-integrations.md) for detailed mcp integrations.

## Templates & References

See [`references/skill-templates-references.md`](references/skill-templates-references.md) for detailed templates & references.
