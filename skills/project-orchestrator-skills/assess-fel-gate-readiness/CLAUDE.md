---
name: assess-fel-gate-readiness
description: "Assess FEL gate readiness against IPA benchmarking criteria with deliverable completeness scoring and gate advancement recommendations. Triggers: 'FEL gate readiness', 'gate review', 'evaluacion de compuertas FEL'."
category: "Project Governance — FEL Stage-Gate"
priority: P1 - Critical
version: 1.0.0
agent: project-orchestrator (AG-007)
---

# Assess FEL Gate Readiness

## Skill ID: PO-001
## Version: 1.0.0
## Category: Project Governance — FEL Stage-Gate
## Priority: P1 - Critical

---

## Purpose

Assess Front-End Loading (FEL) gate readiness against IPA (Independent Project Analysis) benchmarking criteria to determine whether a capital project has satisfied all prerequisites for gate advancement. This skill evaluates the completeness of gate deliverables, calculates the FEL Index, scores each discipline's contribution, and produces a formal recommendation (Go / No-Go / Conditional Go) with specific action items for gap closure.

The FEL process is the single most predictive factor for capital project success. IPA benchmarking data across 20,000+ projects demonstrates that projects with Best Practical FEL Index scores at the FEL3 gate achieve cost growth of less than 5% on average, while projects with Poor FEL scores experience cost growth exceeding 30% (IPA "Understanding the FEL Index," 2021). The Construction Industry Institute corroborates this finding: CII Research Report 113-11 shows that projects in the top quartile of front-end planning performance deliver schedule outcomes 20% better than bottom-quartile projects. AACE International's Recommended Practice 18R-97 further establishes that the quality of project definition at each gate directly determines the accuracy class of cost and schedule estimates — poor FEL quality forces the use of Class 5 estimates (accuracy range of -50% to +100%) even when Class 3 estimates (accuracy range of -20% to +30%) are expected.

This skill directly addresses **Pain Point CP-01** (Capital Project Predictability): 65% of megaprojects exceed their approved cost by more than 25%, and 73% exceed their approved schedule by more than 25% (IPA 2022 Industry Benchmarking Report). The root cause in the majority of cases is premature gate advancement — projects that proceed to the next phase before the current phase deliverables are complete, validated, and aligned across disciplines. The consequences compound: incomplete FEL2 work creates design basis gaps that propagate into FEL3, which generates construction documents with unresolved technical issues that manifest as field rework during execution. Each dollar not spent during FEL costs $10-$100 to correct during execution (CII "Value of Front-End Planning," 2012).

This skill eliminates subjective gate assessments by providing a structured, quantified evaluation framework that measures deliverable completeness, quality, and inter-discipline alignment against industry-validated benchmarks. The output is an auditable gate review package suitable for steering committee presentation, Final Investment Decision (FID) support, or project audit defense.

---

## Intent & Specification

| Attribute              | Value                                                                 |
|------------------------|-----------------------------------------------------------------------|
| **Skill ID**           | PO-001                                                                |
| **Agent**              | Project Orchestrator (AG-007)                                         |
| **Domain**             | Capital Project FEL Governance                                        |
| **Version**            | 1.0.0                                                                 |
| **Complexity**         | High                                                                  |
| **Estimated Duration** | 2-5 days per gate assessment (depends on project scale and phase)     |
| **Maturity**           | Production                                                            |
| **Pain Point Addressed** | CP-01: 65% of megaprojects exceed approved cost by >25% (IPA 2022)|
| **Secondary Pain**     | CP-02: Premature gate advancement causes 40% of execution rework      |
| **Value Created**      | Prevent premature gate advancement; improve project predictability by 20-30% |

### Functional Intent

This skill SHALL:

1. **Evaluate Gate-Specific Deliverable Completeness**: For each FEL phase (FEL1, FEL2, FEL3, Execution, Commissioning, Handover), assess the completeness of every required deliverable against the gate criteria matrix. Deliverables are scored as Complete, Substantially Complete (>80%), Partially Complete (50-80%), or Incomplete (<50%).

2. **Calculate the FEL Index**: Compute the composite FEL Index score using the IPA methodology — a weighted aggregation of site factors definition, engineering definition, and execution planning definition. Benchmark the calculated index against IPA quartile boundaries (Best Practical, Good, Fair, Poor, Screening).

3. **Assess Inter-Discipline Alignment**: Evaluate whether deliverables from different disciplines are consistent and aligned. Check for scope gaps at discipline interfaces (e.g., engineering design basis vs. cost estimate assumptions, safety study conclusions vs. operating procedures, procurement strategy vs. schedule critical path).

4. **Score Quality of Key Deliverables**: Beyond presence/absence checking, evaluate the quality of critical deliverables against industry standards. A cost estimate that exists but uses Class 5 methodology when Class 3 is required at FEL3 receives a low quality score despite being "complete."

5. **Generate Gate Recommendation**: Produce a formal recommendation — Go (proceed to next phase), No-Go (remain in current phase with remediation plan), or Conditional Go (proceed with specified conditions and action items that must be completed within a defined timeframe).

6. **Produce Action Items for Gap Closure**: For every deliverable that is not fully complete or fails quality assessment, generate a specific, assignable action item with owner, deadline, and acceptance criteria.

7. **Create Gate Review Package**: Assemble a structured gate review document suitable for steering committee presentation, including executive summary, detailed assessment, FEL Index benchmarking, recommendations, and action item register.

### Success Criteria

- Gate assessment covers 100% of required deliverables for the target phase
- FEL Index calculation follows IPA methodology with documented scoring rationale
- Inter-discipline alignment checked at all critical interfaces
- Recommendation is defensible and traceable to assessment data
- Action items are specific, assignable, and time-bound (SMART criteria)
- Gate review package is presentation-ready for steering committee within 24 hours of assessment completion

### Constraints

- Must use the IPA FEL Index methodology as the primary benchmarking framework
- Must not recommend "Go" if any safety-critical deliverable is incomplete
- Must not recommend "Go" if the cost estimate class does not meet the minimum requirement for the gate
- Must support both English and Spanish deliverable assessments
- Must produce machine-readable output (structured YAML/JSON) alongside human-readable reports
- Must be auditable — every score must trace to a specific deliverable and assessment rationale

---

## Trigger / Invocation

### Direct Invocation

```
/assess-fel-gate-readiness --project [name] --gate [FEL1|FEL2|FEL3|Execution|Commissioning|Handover]
```

### Command Variants

- `/assess-fel-gate-readiness evaluate --project [name] --gate [FEL2]` — Full gate assessment
- `/assess-fel-gate-readiness quick-check --project [name] --gate [FEL3]` — Rapid completeness check (no quality scoring)
- `/assess-fel-gate-readiness compare --project [name] --gate [FEL2] --baseline [previous_assessment]` — Compare against prior assessment
- `/assess-fel-gate-readiness report --project [name] --gate [FEL3] --format [pdf|xlsx|dashboard]` — Generate report only (using cached assessment)

### Aliases

- `/fel-gate-review`, `/gate-readiness`, `/evaluacion-compuertas`, `/revision-compuerta-fel`

### Natural Language Triggers (EN)

- "Assess FEL2 gate readiness for Project X"
- "Are we ready for the FEL3 gate review?"
- "Calculate the FEL Index for this project"
- "What deliverables are missing for gate advancement?"
- "Run the gate readiness checklist"

### Natural Language Triggers (ES)

- "Evaluar la preparacion de la compuerta FEL2 para el Proyecto X"
- "Estamos listos para la revision de compuerta FEL3?"
- "Calcular el indice FEL de este proyecto"
- "Que entregables faltan para avanzar de compuerta?"

### Contextual Triggers

- Project schedule indicates gate review date within 30 days (automatic pre-assessment recommended)
- Engineering deliverable completion exceeds 80% for the current phase (readiness check)
- Steering committee meeting scheduled (gate review package generation)
- Cost estimate update completed (triggers FEL Index recalculation)
- AG-008 (Engineering Design) reports design freeze milestone reached

---

## Guided Mode

This skill supports guided mode. When triggered, execute the Guided Mode Protocol
(defined in the agent CLAUDE.md) BEFORE proceeding to Step-by-Step Execution.

**GM-1 Summary:** 5 required + 6 optional questions covering target gate (FEL1/2/3),
project scope, workstream status, deliverable inventory, stakeholder readiness,
and previous gate assessment results.
See `references/guided-mode-questions.md` for the complete question sequence.

**Dependency checks:** Depends on which FEL gate — FEL2/3 require prior gate to be passed.

---

## Input Requirements

### Required Inputs

| Input | Type | Source | Description |
|-------|------|--------|-------------|
| `project_code` | text | User / Session State | Project identifier |
| `target_gate` | enum | User | Gate being assessed: FEL1, FEL2, FEL3, Execution, Commissioning, Handover |
| `deliverable_register` | .xlsx | AG-007 / mcp-sharepoint | Register of all project deliverables with current status per discipline |
| `gate_criteria_matrix` | .xlsx | Methodology / mcp-sharepoint | Gate-specific criteria listing required deliverables, quality standards, and minimum completeness thresholds |
| `cost_estimate` | .xlsx | AG-010 (Finance) / mcp-sharepoint | Current cost estimate with basis of estimate and estimate class |

### Optional Inputs

| Input | Type | Source | Description |
|-------|------|--------|-------------|
| `previous_assessment` | .xlsx | AG-007 / mcp-sharepoint | Prior gate assessment for delta analysis |
| `engineering_status` | .xlsx | AG-008 (Engineering Design) | Engineering deliverable completion status and design maturity |
| `schedule_status` | .xlsx / .mpp | AG-006 (Execution) | Current integrated project schedule with milestone status |
| `risk_register` | .xlsx | AG-007 (this agent) | Current quantified risk register for risk maturity assessment |
| `safety_reviews` | .xlsx | AG-004 (HSE) | HAZOP, SIL, environmental assessment completion status |
| `procurement_status` | .xlsx | AG-005 (Contracts) | Long-lead procurement and contracting strategy status |
| `ipa_benchmarks` | .xlsx | Methodology | IPA quartile boundaries and benchmarking data for the project type |

### Input Validation Rules

```yaml
validation:
  deliverable_register:
    required_columns: ["deliverable_id", "discipline", "title", "status", "completion_pct", "quality_score"]
    min_records: 20
  gate_criteria_matrix:
    required_columns: ["criterion_id", "deliverable_type", "required_for_gate", "minimum_completeness", "quality_standard"]
    must_contain_gate: "${target_gate}"
  cost_estimate:
    required_fields: ["total_estimate", "estimate_class", "basis_of_estimate", "contingency_pct"]
    estimate_class_must_match_gate:
      FEL1: ["Class 5", "Class 4"]
      FEL2: ["Class 4", "Class 3"]
      FEL3: ["Class 3", "Class 2"]
      Execution: ["Class 2", "Class 1"]
```

---

## Output Specification

### Deliverable 1: FEL Gate Assessment Report (.xlsx)

**Filename**: `{ProjectCode}_FEL_Gate_Assessment_{GatePhase}_v{Version}_{YYYYMMDD}.xlsx`

**Workbook Structure**:

#### Sheet 1: "Executive Summary"

| Section | Content |
|---------|---------|
| Project | Project name, code, phase, assessment date |
| Gate | Target gate, assessor, methodology version |
| FEL Index | Composite score, quartile placement, trend vs. prior assessment |
| Recommendation | Go / No-Go / Conditional Go with summary rationale |
| Key Findings | Top 5 strengths and top 5 gaps |
| Action Items | Count of action items by priority (Critical / High / Medium / Low) |

#### Sheet 2: "Deliverable Completeness Matrix"

| Column | Field | Description |
|--------|-------|-------------|
| A | Criterion_ID | Gate criterion identifier |
| B | Discipline | Engineering / Construction / HSE / Operations / Finance / Procurement |
| C | Deliverable_Type | Type of deliverable required |
| D | Deliverable_ID | Specific deliverable reference |
| E | Required_Completeness | Minimum completeness required at this gate |
| F | Actual_Completeness | Current completion percentage |
| G | Quality_Score | Quality assessment (1-5 scale, 5 = excellent) |
| H | Status | Complete / Substantially Complete / Partially Complete / Incomplete / Not Started |
| I | Gap_Description | Description of gap (if any) |
| J | Action_Item_Ref | Reference to action item for gap closure |
| K | Risk_If_Not_Closed | Risk of proceeding without closing this gap |

#### Sheet 3: "FEL Index Calculation"

| Component | Weight | Score | Benchmark Quartile | Notes |
|-----------|--------|-------|---------------------|-------|
| Site Factors Definition | 20% | {score} | {quartile} | {notes} |
| Process Definition | 15% | {score} | {quartile} | {notes} |
| Engineering Definition | 30% | {score} | {quartile} | {notes} |
| Execution Planning | 20% | {score} | {quartile} | {notes} |
| Cost & Schedule Basis | 15% | {score} | {quartile} | {notes} |
| **Composite FEL Index** | 100% | {score} | {quartile} | {recommendation} |

#### Sheet 4: "Inter-Discipline Alignment"

Cross-check matrix showing alignment status between discipline pairs with specific misalignment descriptions where gaps exist.

#### Sheet 5: "Action Items Register"

| Column | Field | Description |
|--------|-------|-------------|
| A | Action_ID | Unique action item identifier |
| B | Priority | Critical / High / Medium / Low |
| C | Discipline | Responsible discipline |
| D | Owner_Agent | Responsible agent (AG-XXX) |
| E | Description | Specific action required |
| F | Acceptance_Criteria | How completion will be verified |
| G | Deadline | Target completion date |
| H | Status | Open / In Progress / Closed |
| I | Gate_Impact | Impact on gate recommendation if not completed |

### Deliverable 2: Gate Review Presentation (.md)

**Filename**: `{ProjectCode}_Gate_Review_{GatePhase}_v{Version}_{YYYYMMDD}.md`

Structured presentation document (15-25 pages equivalent) containing:

1. **Executive Summary** (1 page) — Recommendation, FEL Index, key findings
2. **Project Context** (1-2 pages) — Project overview, phase objectives, assessment scope
3. **Deliverable Completeness Assessment** (4-6 pages) — Discipline-by-discipline analysis with traffic-light status
4. **FEL Index Analysis** (2-3 pages) — Component scores, benchmarking, trend analysis
5. **Inter-Discipline Alignment** (2-3 pages) — Interface analysis, gap identification
6. **Risk Assessment** (2-3 pages) — Key risks to gate advancement, residual risks if proceeding
7. **Recommendation and Conditions** (1-2 pages) — Formal recommendation with conditions (if Conditional Go)
8. **Action Item Summary** (1-2 pages) — Prioritized action items with owners and deadlines

### Formatting Standards

- Gate status colors: Go = Green (#008000), Conditional = Amber (#FF8C00), No-Go = Red (#CC0000)
- FEL Index quartile colors: Best Practical = Green, Good = Light Green, Fair = Amber, Poor = Red, Screening = Dark Red
- Completeness scoring: Complete (>95%) = Green, Substantially (80-95%) = Light Green, Partially (50-80%) = Amber, Incomplete (<50%) = Red

---

## Quality Criteria

| Criterion | Metric | Weight | Target | Minimum Acceptable |
|-----------|--------|--------|--------|-------------------|
| Deliverable coverage | All gate criteria assessed | 20% | 100% | 100% |
| FEL Index accuracy | Calculation follows IPA methodology | 15% | Full compliance | Full compliance |
| Scoring objectivity | Every score has documented rationale | 15% | 100% | >95% |
| Action item quality | Action items are SMART (Specific, Measurable, Assignable, Realistic, Time-bound) | 15% | 100% | >90% |
| Inter-discipline check | All critical interfaces assessed | 10% | 100% | >90% |
| Benchmarking validity | FEL Index benchmarked against appropriate project type | 10% | Correct project type | Correct project type |
| Report completeness | All report sections populated | 10% | 100% | 100% |
| Stakeholder readiness | Report suitable for steering committee presentation | 5% | Presentation-ready | Requires minor edits only |

### Automated Quality Checks

1. **Coverage check**: Every criterion in the gate criteria matrix has an assessment entry
2. **Score consistency**: No deliverable scored "Complete" with quality score below 3/5
3. **Action item completeness**: Every gap has a corresponding action item with owner and deadline
4. **FEL Index bounds**: Composite score falls within valid range (0-10 per IPA methodology)
5. **Recommendation consistency**: "Go" recommendation not issued if any Critical action items are open
6. **Safety gate check**: No "Go" recommendation if any safety-critical deliverable is scored Incomplete
7. **Cost estimate class check**: Cost estimate class matches gate requirements
8. **Cross-reference integrity**: All deliverable IDs referenced in action items exist in the deliverable register

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents)

| Agent | Input Provided | Criticality | Description |
|-------|---------------|-------------|-------------|
| AG-008 (Engineering Design) | Engineering deliverable status, design maturity assessment | Critical | Provides completion status for all engineering deliverables (P&IDs, PFDs, equipment datasheets, plot plans) required at each gate |
| AG-006 (Execution) | Schedule status, cost estimate, execution plan maturity | Critical | Provides integrated project schedule, cost estimate class and quality, and execution planning completeness |
| AG-004 (HSE) | Safety review completion status | High | Provides HAZOP, SIL assessment, environmental impact, and regulatory compliance status required at FEL2 and FEL3 gates |
| AG-005 (Contracts & Compliance) | Procurement and contracting strategy status | High | Provides long-lead procurement status, contracting strategy maturity, and regulatory permit status |
| AG-010 (Finance & Accounting) | Cost estimate and financial analysis | High | Provides cost estimate class validation, financial model completeness, and funding status |
| AG-009 (Construction Management) | Construction strategy and constructability review | Medium | Provides constructability review status and construction execution plan maturity (relevant at FEL3 and Execution gates) |
| AG-002 (Operations) | Operations readiness status | Medium | Provides operating model definition, staffing plan, and training plan completeness (relevant at FEL3 and later gates) |
| AG-003 (Asset Management) | Maintenance strategy status | Medium | Provides maintenance strategy, spare parts strategy, and asset register completeness (relevant at FEL3 and later gates) |

### Downstream Dependencies (Outputs TO other agents)

| Agent | Output Provided | Criticality | Description |
|-------|----------------|-------------|-------------|
| AG-001 (OR Orchestrator) | Gate assessment results, program status | High | OR Orchestrator consumes gate assessment results for enterprise-level portfolio reporting |
| AG-007 (this agent) — manage-project-decision-log | Gate recommendation as a formal decision record | High | Gate Go/No-Go/Conditional decisions are recorded in the decision log with full traceability |
| AG-007 (this agent) — generate-project-dashboard | Gate status and FEL Index for dashboard reporting | High | Dashboard displays current gate status, FEL Index trend, and action item counts |
| AG-007 (this agent) — manage-project-risk-register | Gate-related risks identified during assessment | Medium | Risks identified during the gate assessment are added to or updated in the risk register |
| All specialist agents | Action items assigned for gap closure | High | Agents receive specific action items from the gate assessment with deadlines and acceptance criteria |

### Cross-Skill Dependencies

| Skill | Relationship | Description |
|-------|-------------|-------------|
| `generate-project-dashboard` (PO-003) | Downstream | Dashboard consumes FEL Index score and gate status for consolidated project view |
| `track-project-evm` (PO-002) | Upstream | EVM metrics (SPI, CPI) are inputs to the execution planning component of the FEL Index |
| `manage-project-risk-register` (PO-004) | Bidirectional | Risk register maturity is an input to the assessment; new risks identified during assessment are added to the register |
| `manage-project-decision-log` (PO-005) | Downstream | Gate recommendation is recorded as a formal project decision |
| `design-quality-gate` (F-011) | Reference | Quality gate criteria definitions inform the gate criteria matrix used by this skill |

---

## Methodology & Standards

### Primary References

| Standard | Description | Application |
|----------|-------------|-------------|
| IPA FEL Index Methodology | Industry-standard FEL quality scoring across 20,000+ projects | FEL Index calculation, quartile benchmarking, project type calibration |
| PMI PMBOK 7th Edition | Project Management Body of Knowledge — stage-gate processes | Gate review governance, stakeholder engagement, decision frameworks |
| AACE 18R-97 | Cost Estimate Classification System | Cost estimate class requirements per gate (Class 5 at FEL1, Class 3 at FEL3) |
| CII RT-113 | Value of Front-End Planning | Empirical data on FEL quality vs. project outcomes |
| AACE 47R-11 | Cost Estimate Classification System — As Applied for the Mining and Mineral Processing Industries | Mining-specific estimate classification and gate requirements |

### IPA FEL Index Components

The FEL Index is a composite score (0-10 scale) measuring the quality of front-end loading across five components:

1. **Site Factors Definition (20%)**: Site characterization, geotechnical data, environmental baseline, infrastructure assessment, regulatory landscape, and community engagement
2. **Process Definition (15%)**: Process flow diagrams, heat and material balances, process design basis, technology selection and licensing, catalyst and chemical requirements
3. **Engineering Definition (30%)**: P&IDs, equipment specifications, plot plans, building designs, utility systems, electrical single-line diagrams, instrument index, civil/structural design basis
4. **Execution Planning (20%)**: Contracting strategy, construction execution plan, project schedule (Level 3+), resource plan, procurement plan, commissioning plan, safety management plan
5. **Cost and Schedule Basis (15%)**: Cost estimate class and accuracy, schedule basis and risk analysis, contingency methodology, funding approval status

### IPA Quartile Boundaries (Typical for Industrial Projects)

| Quartile | FEL Index Range | Expected Cost Growth | Expected Schedule Slip |
|----------|----------------|---------------------|----------------------|
| Best Practical | 3.0 - 5.0 | < 5% | < 5% |
| Good | 5.1 - 7.0 | 5% - 15% | 5% - 10% |
| Fair | 7.1 - 9.0 | 15% - 30% | 10% - 25% |
| Poor | 9.1 - 11.0 | 30% - 50% | 25% - 50% |
| Screening | > 11.0 | > 50% | > 50% |

*Note: Lower FEL Index scores indicate better front-end definition quality.*

---

## Step-by-Step Execution

### Step 1: Initialize Assessment

1. Load the gate criteria matrix for the target gate phase
2. Load the current deliverable register from project state
3. Request status updates from contributing agents (AG-008, AG-006, AG-004, AG-005, AG-010)
4. Load prior assessment (if available) for trend analysis

### Step 2: Assess Deliverable Completeness

1. For each criterion in the gate criteria matrix, locate the corresponding deliverable(s) in the register
2. Score each deliverable on completeness (0-100%) and quality (1-5 scale)
3. Document scoring rationale for every assessment
4. Flag deliverables below minimum completeness threshold for the gate

### Step 3: Calculate FEL Index

1. Score each of the five FEL Index components using the IPA methodology
2. Apply component weights to calculate composite FEL Index
3. Benchmark composite score against IPA quartile boundaries for the project type
4. Compare against prior assessment to identify improvement or deterioration trends

### Step 4: Evaluate Inter-Discipline Alignment

1. Check design basis consistency across all disciplines
2. Verify cost estimate assumptions align with engineering and schedule basis
3. Confirm safety study conclusions are reflected in engineering design and operating procedures
4. Validate procurement strategy alignment with schedule critical path

### Step 5: Generate Recommendation

1. Apply recommendation logic: Go (all criteria met, FEL Index in Good or Best Practical quartile), No-Go (critical gaps exist, FEL Index in Poor or Screening quartile), Conditional Go (manageable gaps with defined closure plan, FEL Index in Fair quartile)
2. Document recommendation rationale with specific supporting evidence
3. For Conditional Go, define conditions with measurable acceptance criteria and deadlines

### Step 6: Create Action Items

1. For every gap identified, create a SMART action item
2. Assign owner (agent ID), deadline, and acceptance criteria
3. Classify priority: Critical (blocks gate), High (significant risk), Medium (quality improvement), Low (nice-to-have)

### Step 7: Assemble Gate Review Package

1. Compile executive summary with recommendation and key findings
2. Assemble detailed assessment with discipline-by-discipline analysis
3. Include FEL Index calculation with benchmarking visualization
4. Attach action item register with priority classification
5. Format for steering committee presentation

---

## Templates & References

### Gate Criteria Matrix Reference (FEL3 Example)

```
Category: Engineering Definition (30% of FEL Index)
Required Deliverables:
  - P&IDs: 100% issued for design (IFD) | Quality: Checked per PIP standards
  - Equipment datasheets: 100% complete for all tagged equipment
  - Plot plan: Approved, showing all equipment and buildings
  - Single-line diagrams: 100% complete for power distribution
  - Instrument index: 100% complete with I/O count confirmed
  - Civil/structural design: Foundation design complete for all equipment

Category: Execution Planning (20% of FEL Index)
Required Deliverables:
  - Contracting strategy: Approved by procurement and steering committee
  - Level 3 schedule: Resource-loaded, critical path identified
  - Construction execution plan: Approved, constructability review complete
  - Commissioning plan: Draft, system turnover list defined
  - Safety management plan: Approved, aligned with HAZOP actions
```

### Quick Assessment Checklist

```
FEL3 Gate — Quick Readiness Check:
[ ] Cost estimate is Class 3 or better
[ ] P&IDs are 100% IFD
[ ] HAZOP completed for all systems
[ ] Contracting strategy approved
[ ] Level 3 schedule is resource-loaded
[ ] All long-lead items on order or committed
[ ] Environmental permits submitted or approved
[ ] Constructability review completed
[ ] FEL Index calculated and in Good quartile or better
[ ] All Critical action items from prior gate assessment are closed
```
