# Intent & Specification Framework Reference
## VSC Operational Readiness - AI-Driven Specification Methodology

**Source Documents:**
- `docs/architecture/_legacy/knowledge-base.md` (Chapter 13)
- `agents/*/skills.yaml` (per-agent skill assignments) (Section 6)
- `docs/architecture/_legacy/multi-agent-architecture.md` (Section 12)

**Applicable Skills:**
- define-intent-specification
- validate-output-quality
- design-quality-gate
- create-agent-specification (now part of general/)
- audit-ai-workflow
- create-prompt-contract (now part of contracts-compliance-skills/)
- All skills (every skill should reference this for intake/specification standards)

---

## Table of Contents

| Section | Topic |
|---------|-------|
| 1 | Why Intent Matters More Than Prompts |
| 2 | The 4-Level Specification Model |
| 3 | The 7 Principles of Specification |
| 4 | Intent Templates by OR Deliverable Type |
| 5 | Common Specification Failures and Prevention |
| 6 | Intent Specification Template |
| 7 | Integration with Multi-Agent System |

---

## 1. Why Intent Matters More Than Prompts

The single biggest risk in AI-driven OR delivery is not the capability of the AI model, but the quality of the specification given to it.

### The Two-Class System of Knowledge Work
Work is stratifying into:
- **Class 1 (Intent Definers)**: Define WHAT to build and WHY — command premium compensation
- **Class 2 (Executors)**: Implement what is specified — increasingly automated

VSC must operate as Class 1 — every consultant must define intent before asking agents to execute.

### Common Failures Without Intent
- Outputs that do not match the intention of the user
- Ambiguity in requirements that the LLM interprets freely
- Lack of measurable quality criteria to validate against
- Loss of coherence between related deliverables
- Scope drift when the agent fills gaps with assumptions

---

## 2. The 4-Level Specification Model

Every OR deliverable MUST have a specification before any agent begins work.

### Level 1: Elevator Pitch (30 seconds)
A single sentence capturing the essence. Answers "What and Why?"

**Example:**
> "Define how to maintain 347 pieces of equipment at the AHF plant safely and cost-effectively using risk-based criticality analysis to prioritize RCM/FMECA depth."

### Level 2: Executive Overview (2 minutes)
Structured parameters expanding the pitch:

```
Objective: [What and why]
Scope: [What is included]
Out of Scope: [What is NOT included]
Available Inputs: [List of documents/data]
Expected Outputs: [Format and structure]
Success Criteria: [Measurable]
Constraints: [Known limitations]
```

### Level 3: Full Project Specification (15 minutes)
Detailed document including:
- Document structure (table of contents with descriptions)
- Content per section
- Format and style requirements
- References and standards
- Dependencies on other agents
- Quality gates per phase

### Level 4: Agent-Level Specification (30 minutes)
Complete CLAUDE.md / SKILL.md defining:
- Exact role and behavior rules
- Available tools and MCPs
- Output format specifications
- Error and ambiguity handling
- Inter-agent interaction patterns

---

## 3. The 7 Principles of Specification

1. **Intent Before Execution**: Never execute without defining intent at least to Level 2
2. **Contracts Not Conversations**: Prompts are contracts with fixed I/O, not creative conversations
3. **Measurable Quality**: Every output must have measurable quality criteria (target: >91% SME validation)
4. **Progressive Detailing**: Specification deepens with each project phase
5. **Cross-Reference Integrity**: Deliverables must be coherent with each other
6. **Safe Defaults**: When ambiguous, the agent must ask, not assume
7. **Audit Trail**: Every agent decision must be traceable to the specification

---

## 4. Intent Templates by OR Deliverable Type

| Deliverable Type | Level 1 Template | Key Level 3 Elements |
|-----------------|-----------------|---------------------|
| OR Strategy | "Define how OR will be managed for [project] to ensure safe startup by [date]" | Governance model, budget, milestones, risks, integration strategy |
| OR Plan 360 | "Detail all OR activities by management area for [project] with owners and dates" | Activities per area, dependencies, KPIs, resource needs |
| Maintenance Strategy | "Define maintenance approach for [N] equipment at [plant] by criticality" | RCM/FMECA depth by tier, PM frequencies, spare parts |
| SOPs | "Create operating procedures for [system] covering normal/startup/shutdown/emergency" | Step sequences, safety precautions, interlocks, response times |
| Staffing Plan | "Define workforce for [N] positions with competencies and recruitment timeline" | Role profiles, shift patterns, salary bands, recruitment sequence |
| Contract Scope | "Specify technical requirements for [service type] O&M contract" | SOW, KPIs, penalties, safety requirements, evaluation criteria |
| Risk Assessment | "Identify and evaluate operational risks for [system/area] using bow-tie methodology" | Threats, barriers, consequence categories, ALARP demonstration |
| OPEX Budget | "Develop bottom-up operating budget for [plant] first [N] years of operation" | Cost categories, headcount, maintenance, contracts, consumables |

---

## 5. Common Specification Failures and Prevention

| Failure | Symptom | Prevention |
|---------|---------|------------|
| Vague intent | Agent produces generic content | Always include project-specific data in Level 2 |
| Missing success criteria | No way to validate output | Define measurable criteria at Level 2 minimum |
| No out-of-scope definition | Agent scope creeps | Explicitly state what is NOT included |
| Assumed inputs | Agent hallucinates data | List ALL available inputs; mark missing data |
| No cross-references | Deliverables contradict | Define dependencies and review checkpoints |
| Format ambiguity | Wrong format or structure | Specify exact document structure at Level 3 |

---

## 6. Intent Specification Template

```markdown
# Intent Specification: [Deliverable Name]
## IS-[NNN] | Project: [Project Name] | Date: [YYYY-MM-DD]

## Level 1: Elevator Pitch
[One sentence]

## Level 2: Executive Overview
- **Objective**: [What and why]
- **Scope**: [What is included]
- **Out of Scope**: [What is NOT included]
- **Available Inputs**: [List of documents/data with formats]
- **Expected Outputs**: [Deliverable list with formats]
- **Success Criteria**: [Measurable - e.g., ">91% SME validation"]
- **Constraints**: [Known limitations]
- **Dependencies**: [Other deliverables or agents required]

## Level 3: Full Specification
### Document Structure
[Detailed table of contents with section descriptions]

### Format and Style
[Language, tone, branding, template reference]

### References and Standards
[Applicable ISO, industry standards, regulatory requirements]

### Quality Gates
[Validation checkpoints and criteria]

## Level 4: Agent-Level Specification
[Complete behavioral specification for the executing agent]
```

---

## 7. Integration with Multi-Agent System

### Specification Flow
1. Consultant creates Intent Spec (Level 2 minimum)
2. Orchestrator validates completeness
3. Orchestrator enriches to Level 4 if context available
4. Tasks assigned with spec ID reference
5. Agents execute according to spec
6. Quality Validator compares output vs. spec
7. Feedback loop if below threshold

### Storage
```
clients/{client}/projects/{project}/intent-specs/
    IS-001-or-strategy.md
    IS-002-maintenance-strategy.md
    IS-003-staffing-plan.md
```

---

## Changelog
### v1.0 (February 2026)
- Initial intent specification framework reference
- Compiled from Knowledge Base v2.0, Mapa Estrategico v2, Architecture v2
