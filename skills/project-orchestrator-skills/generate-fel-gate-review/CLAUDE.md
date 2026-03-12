---
name: generate-fel-gate-review
description: "Assemble comprehensive FEL gate review packages for steering committee presentation consolidating inputs from all disciplines into structured gate review documents with Go/No-Go recommendations. Triggers: 'FEL gate review', 'gate review package', 'stage gate', 'FID review', 'gate readiness'."
category: Project Orchestration (Agent 7 - Project Orchestrator)
priority: P1 - Critical
version: 1.0.0
agent: project-orchestrator (AG-007)
---

# Generate FEL Gate Review

## Skill ID: PO-003
## Version: 1.0.0
## Category: Project Orchestration (Agent 7 - Project Orchestrator)
## Priority: P1 - Critical

---

## Purpose

Assemble comprehensive FEL (Front-End Loading) gate review packages for steering committee presentation by consolidating inputs from all project disciplines into a structured gate review document. The package must present a clear, evidence-based recommendation for the gate decision: Go, No-Go, or Conditional approval with defined remediation actions and re-review timeline.

The FEL gate system is the most critical governance mechanism in capital project delivery. IPA (Independent Project Analysis) research spanning over 20,000 projects demonstrates that the quality of front-end definition -- as measured by the FEL Index -- is the single strongest predictor of project cost and schedule outcomes. Projects that pass through rigorous gate reviews with well-defined deliverables achieve cost predictability within 10% of the approved estimate, while those that shortcut or skip gates experience average cost growth of 25-40%.

The challenge in assembling gate review packages is that gate readiness is a multi-dimensional assessment requiring synthesis across engineering maturity, cost estimate quality, schedule confidence, risk profile, organizational readiness, and commercial alignment. No single agent or discipline can assess gate readiness in isolation. The Project Orchestrator must collect, validate, and synthesize inputs from all specialist agents into a coherent narrative that enables the steering committee to make an informed decision.

This skill implements gate review packages aligned with the following FEL phase gates:

- **FEL1 Gate (Concept Selection / Select Phase)**: Evaluate alternative concepts and recommend the preferred option for further development. Key decision: Which concept to take into FEED? Key deliverables: Business case, conceptual engineering, order-of-magnitude cost estimate (Class 5, AACE), preliminary schedule, fatal flaw analysis.

- **FEL2 Gate (FEED Completion / FID - Final Investment Decision)**: Evaluate the maturity of front-end engineering design and recommend whether to authorize full project execution funding. Key decision: Authorize execution expenditure? Key deliverables: FEED package, Class 3 cost estimate, definitive schedule, execution plan, risk register, organizational readiness assessment, commercial terms.

- **FEL3 Gate (Detailed Design / Execution Readiness)**: Evaluate readiness to begin construction and confirm that all execution prerequisites are in place. Key decision: Authorize construction commencement? Key deliverables: Detailed design package (>80% IFC), Class 2 cost estimate, construction schedule, procurement status, construction readiness, PSSR prerequisites.

Each gate review package includes an IPA FEL Index score calculation that quantifies the completeness and quality of front-end deliverables on a scale from 1 (Best) to 5 (Screening), enabling objective comparison against industry benchmarks.

---

## Intent & Specification

The AI agent MUST understand and execute the following:

1. **Gate Review Package Structure**: Every gate package must contain:
   - **Executive Summary**: 2-page maximum summary of project status, key achievements since last gate, critical issues, and gate recommendation
   - **Deliverable Status Matrix**: Complete list of gate-required deliverables with status (Complete, In Progress, Not Started), quality score, and owner
   - **Cost Estimate Quality Assessment**: Estimate class per AACE RP 18R-97, basis of estimate summary, benchmark comparison, contingency adequacy
   - **Schedule Status**: Summary schedule, critical path status, key milestones, schedule risk analysis results
   - **Risk Profile**: Top 10 risks with mitigation status, residual risk exposure, risk trend since last gate
   - **Key Decisions Required**: Decisions that the steering committee must make at this gate
   - **Recommendations**: Go / No-Go / Conditional with evidence-based rationale
   - **Action Items**: For conditional approval, specific actions with owners, deadlines, and re-review criteria

2. **Gate-Specific Criteria**:

   **FEL1 (Concept Selection)**:
   - Alternatives evaluated (minimum 3 viable concepts)
   - Preferred concept identified with selection rationale
   - Business case supports investment thesis (NPV, IRR, payback)
   - Fatal flaw screening completed (no show-stoppers identified)
   - Cost estimate Class 5 (-30% to +50% accuracy per AACE RP 18R-97)
   - Preliminary schedule with major milestones
   - Key risks identified with initial mitigation strategies
   - Stakeholder alignment on concept direction

   **FEL2 (FEED / FID)**:
   - FEED package complete and technically reviewed
   - Process design frozen (P&IDs approved for design)
   - Equipment list finalized with critical specifications
   - Cost estimate Class 3 (-10% to +15% accuracy per AACE RP 18R-97)
   - Definitive project schedule with resource loading
   - Execution strategy defined (EPC, EPCM, self-perform, hybrid)
   - Organizational readiness assessed (OR plan, staffing, training)
   - Commercial terms substantially agreed
   - Environmental permits on track
   - IPA FEL Index score calculated (target: 2.5 or better for Go recommendation)

   **FEL3 (Execution Readiness)**:
   - Detailed design >80% IFC (Issued for Construction)
   - Long-lead equipment ordered, delivery confirmed
   - Cost estimate Class 2 (-5% to +10% accuracy per AACE RP 18R-97)
   - Construction schedule Level 4 with resource loading
   - Construction contracts awarded or imminent
   - PSSR prerequisites identified and on track
   - Commissioning plan approved
   - Operations readiness confirmed (staffing, training, procedures)

3. **Voting Recommendation Framework**:
   - **Go**: All mandatory gate criteria met, FEL Index score at target, no Critical risks without mitigation, cost and schedule within tolerance
   - **No-Go**: Fundamental issues that cannot be resolved within the current phase, requiring return to prior phase or project cancellation
   - **Conditional**: Most criteria met, but 1-3 specific deficiencies require resolution within a defined timeframe (typically 30-90 days) before proceeding

4. **IPA FEL Index Scoring**: Calculate a composite score across the standard IPA assessment dimensions:
   - Site definition and characterization
   - Process definition and design basis
   - Engineering deliverables completeness
   - Cost estimate basis and quality
   - Schedule basis and quality
   - Execution planning maturity
   - Project control systems readiness
   - Organizational definition and readiness
   - Scoring: 1.0 (Best/Fully Defined) to 5.0 (Screening/Minimal Definition)

**Constraints:**
- Must consolidate inputs from all specialist agents -- no single-source gate packages
- Must present objective, evidence-based assessments (no subjective "we feel ready" narratives)
- Must quantify all claims (cost accuracy class, schedule confidence level, risk exposure in dollars)
- Must clearly distinguish between mandatory gate criteria (must-pass) and recommended criteria (should-pass)
- Must present the recommendation with supporting evidence, not just a conclusion
- Must include dissenting views from any agent that disagrees with the recommendation
- Must produce outputs in Spanish (Latin American) with English technical terms preserved
- Gate package must be distributed to steering committee at least 5 business days before the gate meeting

---

## Trigger / Invocation

```
/generate-fel-gate-review
```

### Command Triggers
- `generate-fel-gate-review assemble --gate [FEL1|FEL2|FEL3] --project [name]`
- `generate-fel-gate-review readiness --gate [FEL1|FEL2|FEL3]` (pre-assessment before formal package)
- `generate-fel-gate-review score --gate [FEL1|FEL2|FEL3]` (calculate FEL Index score)
- `generate-fel-gate-review update --gate [FEL1|FEL2|FEL3] --section [section-name]`
- `generate-fel-gate-review action-tracker --gate [FEL1|FEL2|FEL3]` (track conditional approval actions)

### Natural Language Triggers
- "Assemble the FEL2 gate review package"
- "Are we ready for the FID gate review?"
- "Calculate the FEL Index score for our current status"
- "Prepare the steering committee presentation for the FEL3 gate"
- "What deliverables are still outstanding for the FEL2 gate?"
- "Update the gate review package with the latest cost estimate"
- "Track action items from the conditional FEL1 approval"

### Aliases
- `/gate-review`
- `/fel-gate`
- `/stage-gate-review`
- `/fid-review`

### Automatic Triggers
- Gate review date within 30 calendar days (initiate readiness assessment)
- Gate review date within 10 business days (assemble formal gate package)
- All mandatory gate deliverables reach "Complete" status (trigger final package assembly)
- Conditional approval action item deadline approaching (trigger progress update)
- Significant change approved that affects gate readiness (trigger reassessment)

---

## Input Requirements

### Required Inputs

| Input | Source | Required | Format | Description |
|-------|--------|----------|--------|-------------|
| Gate Criteria Checklist | Project Management / IPA | Yes | .xlsx | List of mandatory and recommended criteria for the specific gate |
| Deliverable Register | Orchestrator (AG-001) / Project Orchestrator | Yes | .xlsx | Complete list of gate deliverables with status and quality scores |
| Cost Estimate | Finance (AG-010) | Yes | .xlsx / .docx | Current cost estimate with basis of estimate and accuracy class |
| Project Schedule | Execution (AG-006) | Yes | .xlsx / .mpp | Current schedule with critical path, milestones, and resource loading |
| Risk Register | HSE (AG-004) / Project Management | Yes | .xlsx | Current risk register with risk exposure quantification |
| EDDR Status | Engineering Design (AG-008) | Yes | .xlsx | Engineering Design Deliverable Register showing completion status |
| EVM Report | Execution (AG-006) | Yes | .xlsx | Earned Value Management performance (CPI, SPI, EAC, ETC) |
| OR Readiness Assessment | Operations (AG-002) / Orchestrator (AG-001) | Yes | .docx | Operational readiness status across all management areas |

### Optional Inputs (Strongly Recommended)

| Input | Source | Required | Format | Default if Absent |
|-------|--------|----------|--------|-------------------|
| Previous Gate Package | Project Orchestrator | No | .docx | No comparative analysis with prior gate |
| Conditional Approval Actions | Project Orchestrator | No | .xlsx | No action item tracking from prior gate |
| Benchmark Data | IPA / VSC Knowledge Base | No | .xlsx | Generic industry benchmarks applied |
| Stakeholder Feedback | Project Management | No | .docx / email | No pre-gate stakeholder sentiment included |
| Lessons Learned | VSC Knowledge Base | No | .docx | Generic lessons applied |

### Context Enrichment (Automatic)

The agent will automatically:
- Retrieve deliverable status from all specialist agents via delegation register
- Access cost estimate quality assessment from Finance (AG-010)
- Pull schedule analysis (critical path, float, milestones) from Execution (AG-006)
- Retrieve risk register and top risks from HSE (AG-004)
- Access EDDR completion metrics from Engineering Design (AG-008)
- Pull EVM performance data from Execution (AG-006)
- Retrieve OR readiness assessment from Orchestrator (AG-001) and Operations (AG-002)
- Query VSC knowledge base for FEL Index scoring methodology and benchmarks
- Access IPA reference data for gate criteria by project type and industry

---

## Output Specification

### Document 1: FEL Gate Review Package (.docx)

**Filename**: `{ProjectCode}_FEL{N}_Gate_Review_Package_v{Version}_{YYYYMMDD}.docx`

**Target Length**: 30-60 pages (executive summary + detailed sections + appendices)

**Structure:**

```markdown
# FEL{N} Gate Review Package
## {Project Name}
## Document Number: {ProjectCode}-PO-GRV-{NNN}
## Revision: {N}
## Date: {YYYY-MM-DD}
## Gate Meeting Date: {YYYY-MM-DD}
## Recommendation: {Go / No-Go / Conditional}

---

## SECTION 1: EXECUTIVE SUMMARY (2 pages maximum)

### 1.1 Gate Purpose and Context
{What decision is being requested at this gate}

### 1.2 Key Achievements Since Last Gate
{Major milestones completed, critical deliverables accepted}

### 1.3 Critical Issues
{Top 3-5 issues requiring steering committee awareness}

### 1.4 Gate Recommendation
{Go / No-Go / Conditional with one-paragraph rationale}

### 1.5 Summary Dashboard
| Dimension | Status | Score | Comment |
|-----------|--------|-------|---------|
| Engineering Maturity | {Green/Amber/Red} | {%} | {Brief note} |
| Cost Estimate Quality | {Green/Amber/Red} | {Class} | {Brief note} |
| Schedule Confidence | {Green/Amber/Red} | {P-value} | {Brief note} |
| Risk Profile | {Green/Amber/Red} | {$M exposure} | {Brief note} |
| OR Readiness | {Green/Amber/Red} | {%} | {Brief note} |
| Commercial Readiness | {Green/Amber/Red} | {Status} | {Brief note} |

---

## SECTION 2: DELIVERABLE STATUS (5-8 pages)

### 2.1 Deliverable Status Matrix
{Complete list of gate deliverables with status, quality score, owner}

### 2.2 Mandatory Criteria Compliance
{Pass/Fail assessment against each mandatory gate criterion}

### 2.3 Recommended Criteria Compliance
{Status of recommended (non-mandatory) gate criteria}

### 2.4 Outstanding Items
{List of incomplete deliverables with estimated completion dates and risk}

---

## SECTION 3: COST ESTIMATE QUALITY (4-6 pages)

### 3.1 Estimate Class and Accuracy
{AACE estimate class, accuracy range, basis of estimate summary}

### 3.2 Cost Breakdown
{Major cost categories with percentage of total}

### 3.3 Benchmark Comparison
{Comparison to IPA/industry benchmarks for similar projects}

### 3.4 Contingency Assessment
{Contingency amount, basis, Monte Carlo results if available}

### 3.5 Cost Risks and Opportunities
{Key cost risks and upside opportunities with quantification}

---

## SECTION 4: SCHEDULE STATUS (4-6 pages)

### 4.1 Summary Schedule
{Level 2 schedule showing major phases and milestones}

### 4.2 Critical Path Analysis
{Current critical path, near-critical paths, float analysis}

### 4.3 Schedule Risk Analysis
{P50/P80 completion dates from schedule risk analysis}

### 4.4 Key Milestones
{Milestone status: planned vs. current forecast vs. actual}

### 4.5 Schedule Risks
{Top schedule risks with mitigation plans}

---

## SECTION 5: RISK PROFILE (3-5 pages)

### 5.1 Risk Summary Dashboard
{Risk heat map, top 10 risks, trend since last gate}

### 5.2 Top Risks Detail
{For each top risk: description, likelihood, consequence, mitigation, owner, status}

### 5.3 Risk Trend
{How has the risk profile changed since last gate? Improving or deteriorating?}

### 5.4 Risk Exposure
{Total quantified risk exposure in $ and days, comparison to contingency}

---

## SECTION 6: ORGANIZATIONAL & OR READINESS (3-5 pages)

### 6.1 OR Readiness Score
{Overall readiness percentage across all management areas}

### 6.2 Management Area Status
{Summary per area: Operations, Maintenance, HSE, HR, Finance, Legal, Procurement}

### 6.3 Critical Path to Operational Readiness
{Key activities required before first production}

### 6.4 Staffing Status
{Recruitment progress, key positions filled vs. vacant}

---

## SECTION 7: FEL INDEX ASSESSMENT (2-3 pages)

### 7.1 FEL Index Score
{Composite score: 1.0 to 5.0}

### 7.2 Dimension Scores
| Dimension | Score | Industry Benchmark | Gap |
|-----------|-------|--------------------|-----|
| Site Definition | {x.x} | {x.x} | {+/-} |
| Process Definition | {x.x} | {x.x} | {+/-} |
| Engineering Completeness | {x.x} | {x.x} | {+/-} |
| Cost Estimate Quality | {x.x} | {x.x} | {+/-} |
| Schedule Quality | {x.x} | {x.x} | {+/-} |
| Execution Planning | {x.x} | {x.x} | {+/-} |
| Project Controls | {x.x} | {x.x} | {+/-} |
| Organizational Readiness | {x.x} | {x.x} | {+/-} |

### 7.3 Benchmark Comparison
{How does this project's FEL Index compare to industry best practice?}

---

## SECTION 8: KEY DECISIONS REQUIRED (1-2 pages)

### 8.1 Gate Decision
{Go / No-Go / Conditional -- what is the recommendation?}

### 8.2 Additional Decisions
{Other decisions the steering committee must make at this gate}

---

## SECTION 9: RECOMMENDATION AND ACTION ITEMS (2-3 pages)

### 9.1 Detailed Recommendation
{Evidence-based rationale for the recommendation}

### 9.2 Dissenting Views
{Any agent or discipline that disagrees with the recommendation, with their rationale}

### 9.3 Conditions for Approval (if Conditional)
{Specific conditions with owners, deadlines, and measurable completion criteria}

### 9.4 Action Items
| ID | Action | Owner | Deadline | Criterion for Completion |
|----|--------|-------|----------|--------------------------|

---

## APPENDICES
### A. Deliverable Register (detailed)
### B. Cost Estimate Summary
### C. Schedule (Level 2-3)
### D. Risk Register (full)
### E. OR Readiness Assessment (detailed)
### F. FEL Index Scoring Worksheets
### G. Agent Input Summaries
```

### Document 2: Gate Readiness Assessment (.xlsx)

**Filename**: `{ProjectCode}_FEL{N}_Readiness_Assessment_v{Version}_{YYYYMMDD}.xlsx`

**Sheets:**

1. **Gate Criteria Checklist** -- Every mandatory and recommended criterion with Pass/Fail/Partial status
2. **Deliverable Status** -- Complete deliverable register with status, quality score, and owner
3. **FEL Index Scoring** -- Dimension-by-dimension scoring with evidence references
4. **Action Tracker** -- Conditional approval actions with status tracking
5. **Agent Inputs** -- Summary of inputs received from each specialist agent

### Document 3: Steering Committee Presentation (.pptx summary in .docx)

**Filename**: `{ProjectCode}_FEL{N}_SteerCo_Presentation_v{Version}_{YYYYMMDD}.docx`

**Structure (15-20 slides equivalent):**

1. Title slide with project name, gate, date, recommendation
2. Executive summary dashboard (1 slide)
3. Achievements since last gate (1 slide)
4. Deliverable status summary (1-2 slides)
5. Cost estimate quality (2 slides)
6. Schedule status (2 slides)
7. Risk profile (2 slides)
8. OR readiness (1-2 slides)
9. FEL Index score (1 slide)
10. Recommendation and action items (2 slides)
11. Decisions required (1 slide)

---

## Quality Criteria

### Content Quality (Target: >91% Compliance)

| Criterion | Weight | Metric | Target |
|-----------|--------|--------|--------|
| Criteria Coverage | 25% | All mandatory gate criteria assessed with Pass/Fail | 100% |
| Evidence Quality | 25% | Every claim supported by data, deliverable, or agent input | 100% |
| Synthesis Quality | 20% | Cross-discipline integration with no contradictions between sections | Zero contradictions |
| FEL Index Accuracy | 15% | FEL Index score consistent with detailed assessment | Within 0.3 of independent validation |
| Recommendation Clarity | 15% | Recommendation clearly stated with actionable conditions | Steering committee can decide without additional information |

### Automated Quality Checks

- [ ] Executive summary is 2 pages maximum
- [ ] All mandatory gate criteria have Pass/Fail assessment with evidence
- [ ] Cost estimate class is stated per AACE RP 18R-97 classification
- [ ] Schedule includes critical path identification and P50/P80 dates
- [ ] Risk register includes top 10 risks with quantified exposure
- [ ] FEL Index score is calculated with dimension-level detail
- [ ] Recommendation is explicitly stated as Go, No-Go, or Conditional
- [ ] Conditional recommendations include specific actions with owners and deadlines
- [ ] Dissenting views are documented (or explicitly stated as "none")
- [ ] All agent inputs are received and integrated (no gaps from any specialist agent)
- [ ] Package distributed at least 5 business days before gate meeting date
- [ ] No "TBD" entries in mandatory gate criteria assessments

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs From)

| Agent | Dependency Type | Description | Criticality |
|-------|----------------|-------------|-------------|
| All Specialist Agents (AG-002 to AG-012) | Deliverable Contributors | Each agent provides status and quality assessment of their gate deliverables | Critical |
| Engineering Design (AG-008) | EDDR Status | Engineering Design Deliverable Register showing design completion metrics | Critical |
| Execution (AG-006) | EVM & Schedule | Earned value performance data and schedule analysis for project status | Critical |
| Finance & Accounting (AG-010) | Cost Estimate | Cost estimate with basis of estimate, accuracy class, and benchmark data | Critical |
| HSE (AG-004) | Risk Assessment | Risk register, HAZOP status, safety review completion, permit status | Critical |
| Operations (AG-002) | OR Readiness | Operational readiness assessment across all management areas | High |
| Contracts & Compliance (AG-005) | Commercial Status | Contract status, procurement progress, regulatory compliance | High |
| Orchestrator (AG-001) | Governance | Gate criteria, deliverable register, prior gate decisions and actions | High |

### Downstream Dependencies (Outputs To)

| Agent | Dependency Type | Description | Trigger |
|-------|----------------|-------------|---------|
| Orchestrator (AG-001) | Gate Decision | Gate review package and steering committee decision for project governance | On gate review completion |
| All Specialist Agents | Action Items | Conditional approval actions assigned to specific agents for resolution | On conditional approval |
| Execution (AG-006) | Phase Transition | Go decision triggers transition to next project phase with updated baselines | On Go decision |
| Finance & Accounting (AG-010) | Funding Authorization | Go decision triggers release of next-phase funding per approved estimate | On Go decision |

---

## Methodology & Standards

### Primary Standards (Mandatory Compliance)

| Standard | Application |
|----------|-------------|
| **IPA FEL Index** | FEL scoring methodology, gate criteria by phase, industry benchmarks |
| **AACE RP 18R-97** | Cost Estimate Classification System -- estimate accuracy class determination |
| **PMI PMBOK 7th Edition** | Stage-gate governance, stakeholder management, decision-making frameworks |
| **AACE RP 44R-08** | Risk Analysis and Contingency Determination -- risk quantification for gate review |
| **ISO 21500:2021** | Project governance -- gate review authority, decision protocols |

### Secondary Standards (Reference)

| Standard | Application |
|----------|-------------|
| **CII RT-CII-113** | Front End Planning Research -- FEL best practices and success factors |
| **AACE RP 42R-08** | Risk Analysis and Contingency Determination -- probabilistic cost and schedule analysis |
| **IPA Project Evaluation System** | Project benchmarking methodology and performance prediction |

---

## Examples

See [`references/skill-examples.md`](references/skill-examples.md) for detailed examples.

## Templates & References

See [`references/skill-templates-references.md`](references/skill-templates-references.md) for detailed templates & references.
