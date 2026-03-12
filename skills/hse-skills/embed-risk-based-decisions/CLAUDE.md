---
name: embed-risk-based-decisions
description: "Embed risk-based decision-making processes into operations and maintenance. Triggers: 'risk-based decisions', 'risk framework', 'decisiones basadas en riesgo'."
---

# Embed Risk-Based Decisions

## Skill ID: O-03
## Version: 1.0.0
## Category: O. Asset Management Intelligence
## Priority: P2 - Medium

---

## Purpose

Embed risk-based decision-making into every layer of asset management, from strategic investment prioritization to daily maintenance scheduling, by establishing risk frameworks, decision trees, consequence models, and risk appetite definitions that enable consistent, transparent, and defensible asset management decisions. This skill transforms organizations from intuition-based to evidence-based decision-making by providing the tools, processes, and governance required to systematically account for risk in all asset-related decisions.

Risk-based decision-making is the cornerstone of ISO 55001 and the fundamental differentiator between mature and immature asset management organizations. Yet Pain Point ISO-04 documents that only 25-30% of organizations consistently use risk-informed approaches for asset management decisions. The remaining 70-75% make asset decisions based on a combination of worst-condition urgency, regulatory mandates, budget availability, personal experience, and organizational politics. The consequences are predictable: over-investment in low-risk assets, under-investment in high-risk assets, inconsistent risk treatment across the organization, and an inability to demonstrate due diligence when failures occur.

ISO 55001 Clause 6.1 requires organizations to "determine the risks and opportunities that need to be addressed" and to "plan actions to address these risks and opportunities." ISO 55001 Clause 8.1 requires "criteria for evaluating and controlling risk" as part of operational planning. These are not aspirational statements -- they are mandatory requirements that organizations must demonstrate to achieve certification and, more importantly, to manage their assets effectively.

The economic case for risk-based decision-making is compelling. Research by EPRI (Electric Power Research Institute) demonstrates that risk-based maintenance optimization typically reduces total maintenance costs by 15-25% while simultaneously improving safety and reliability. The UK Health and Safety Executive's ALARP (As Low As Reasonably Practicable) framework, when properly implemented, has been shown to reduce major accident hazard frequency by 40-60%. In asset management, risk-based capital investment prioritization typically improves the value delivered per dollar invested by 20-35% compared to condition-only or age-only approaches.

---

## Intent & Specification

**Problem:** Organizations struggle to embed risk-based thinking into asset management for several interconnected reasons:

- **No defined risk appetite** (Pain Point ISO-04): Only 25-30% of organizations have a documented risk appetite statement for asset management. Without it, every decision-maker applies their own implicit risk tolerance, creating inconsistent outcomes.
- **Risk assessment paralysis**: Organizations either skip risk assessment entirely (too complicated) or over-engineer it (full bow-tie analysis for every decision), neither approach is sustainable.
- **Disconnection between risk and investment**: Risk registers exist but are not systematically connected to capital and maintenance planning. High-risk items may not receive funding while low-risk items consume budget.
- **Inconsistent risk language**: Different departments use different risk scales, consequence categories, and probability definitions, making cross-functional risk comparison impossible.
- **No decision tree framework**: When maintenance planners, operations managers, and capital planners face decisions, they lack structured decision trees that guide them to appropriate risk-informed choices.
- **Consequence modeling gaps**: Organizations cannot quantify the consequences of asset failures in financial terms, making it impossible to justify risk mitigation investments using business cases.
- **Regulatory compliance risk**: In jurisdictions that require demonstration of risk-based decision-making (e.g., UK HSE ALARP, Chilean SERNAGEOMIN), inability to demonstrate systematic risk management exposes the organization to regulatory enforcement.

**Success Criteria:**
- Documented, leadership-approved risk appetite statement for asset management
- Standardized risk assessment framework deployed across all asset management functions
- Risk-based decision trees for the top 5 asset management decision types
- Consequence models quantifying failure impacts in safety, environmental, financial, and operational terms
- Risk Register connected to investment planning (capital and maintenance budgets)
- 80% of capital investment decisions demonstrably risk-informed (with audit trail)
- 80% of maintenance strategy decisions traced to failure risk analysis
- Risk assessment training completed by all asset management decision-makers
- ISO 55001 Clauses 6.1 and 8.1 fully satisfied

**Constraints:**
- Must integrate with the organization's existing corporate risk management framework (ERM)
- Must be scalable from simple qualitative assessments to full quantitative analysis
- Must be practical for daily use by front-line decision-makers (not just risk specialists)
- Must comply with ISO 31000:2018 risk management principles
- Must support industry-specific regulatory requirements (SERNAGEOMIN, OSHA PSM, UK HSE, etc.)
- Must accommodate different risk analysis methods (qualitative, semi-quantitative, quantitative)
- Must produce outputs in Spanish and English
- Must be implementable within existing organizational maturity constraints

---

## Trigger / Invocation

**Primary Triggers:**
- `embed-risk-based-decisions setup --organization [name] --scope [full|maintenance|capital|operations]`
- `embed-risk-based-decisions risk-appetite --organization [name]`
- `embed-risk-based-decisions framework --organization [name] --method [qualitative|semi-quant|quantitative]`
- `embed-risk-based-decisions decision-tree --decision-type [capital|maintenance|operations|renewal|decommission]`
- `embed-risk-based-decisions consequence-model --asset-class [class] --failure-mode [mode]`
- `embed-risk-based-decisions assess --asset [id] --decision [description]`
- `embed-risk-based-decisions prioritize --portfolio [register] --budget [amount]`
- `embed-risk-based-decisions report --organization [name] --period [monthly|quarterly|annual]`

**Aliases:** `/risk-based`, `/risk-framework`, `/embed-risk`, `/decisiones-basadas-riesgo`

**Automatic Triggers:**
- SAMP development (O-02) requires risk strategy implementation
- Maturity assessment (O-01) identifies risk management as a critical gap
- New OR program requires risk-based investment prioritization
- Capital budget cycle requires risk-ranked project portfolio
- Maintenance strategy development requires risk-based task selection
- Regulatory audit approaching with risk management requirements

---

## Input Requirements

### Required Inputs

| Input | Source | Format | Description |
|-------|--------|--------|-------------|
| Organizational Risk Framework | mcp-sharepoint / user | .docx | Corporate risk management policy, ERM framework, existing risk matrix (if any) |
| Asset Portfolio Data | mcp-cmms | .xlsx | Asset register with criticality, condition, replacement value, failure history |
| Consequence Data | Operations / Finance / HSE | .xlsx / interviews | Financial impact of failures, safety consequences, environmental consequences, operational impact |
| Decision Context | User | Text / .docx | What decisions need to be risk-informed (capital, maintenance, operations, all) |
| Regulatory Requirements | mcp-sharepoint | .docx | Risk management requirements from applicable regulations |
| Stakeholder Risk Tolerance | Interviews / surveys | .docx | Implicit and explicit stakeholder attitudes toward different risk types |

### Optional Inputs

| Input | Source | Format | Description |
|-------|--------|--------|-------------|
| Failure History | mcp-cmms | .xlsx | Historical failure data (dates, modes, consequences, costs, downtime) |
| Incident Database | mcp-sharepoint | .xlsx | Safety and environmental incident records |
| Insurance Data | Risk/Finance | .xlsx | Insurance premiums, claims history, deductibles, coverage gaps |
| Industry Risk Data | Knowledge base | .xlsx | OREDA, IEEE 493, industry incident databases |
| Existing Risk Registers | mcp-sharepoint | .xlsx | Current risk registers for update and integration |
| HAZOP/PHA Results | mcp-sharepoint | .xlsx | Process hazard analysis results with risk rankings |
| Financial Statements | mcp-erp | .xlsx | Revenue, profit, and balance sheet data for consequence scaling |

---

## Output Specification

### Primary Output 1: Risk-Based Decision Framework Document (.docx)

**Filename:** `{OrgCode}_Risk_Based_Decision_Framework_v{version}_{date}.docx`

**Structure (40-60 pages):**

1. **Executive Summary** (2-3 pages)
   - Purpose and scope of the framework
   - Risk appetite summary
   - Key framework components
   - Implementation roadmap overview

2. **Risk Appetite Statement** (5-8 pages)
   - 2.1 Definition of risk appetite for asset management
   - 2.2 Risk appetite by consequence category:
     - Safety: "We do not accept any risk of fatality or life-altering injury from asset failures that is within our control to prevent or mitigate"
     - Environmental: "We target zero regulatory non-compliance; we accept minor, contained environmental incidents if mitigation cost exceeds $X per incident"
     - Financial: "We accept maintenance cost variability of +/-15% but not single-event losses exceeding $XM without pre-approved contingency"
     - Operational: "We target >90% availability; we accept short-duration outages (<24h) but not extended outages (>72h) for critical systems"
     - Reputation/Regulatory: "We target full compliance with all applicable regulations; zero enforcement actions"
   - 2.3 Risk tolerance thresholds (quantified boundaries)
   - 2.4 Risk appetite governance (who defines, reviews, and updates)

3. **Risk Assessment Framework** (10-15 pages)
   - 3.1 Risk assessment philosophy and principles (ISO 31000 alignment)
   - 3.2 Consequence categories and scales:
     - Safety consequence scale (1-5 with definitions and examples)
     - Environmental consequence scale (1-5 with definitions)
     - Financial consequence scale (1-5 with dollar thresholds)
     - Operational consequence scale (1-5 with duration/impact definitions)
     - Reputation/Regulatory consequence scale (1-5 with definitions)
   - 3.3 Probability/Likelihood scale (1-5 with definitions and frequency ranges)
   - 3.4 Risk matrix (5x5) with color-coded risk levels
   - 3.5 Risk level definitions and required responses:
     - Extreme (20-25): Immediate action required; senior management notification
     - High (15-19): Action required within 30 days; management approval for acceptance
     - Medium (8-14): Action required within 90 days; standard approval process
     - Low (1-7): Monitor; accept with documentation
   - 3.6 Assessment methods by asset criticality:
     - Critical assets: Full quantitative risk assessment (bow-tie, Monte Carlo)
     - High-importance assets: Semi-quantitative assessment (detailed risk matrix)
     - General assets: Qualitative screening (rapid risk rating)
   - 3.7 Risk aggregation approach (how individual asset risks combine to portfolio risk)

4. **Decision Trees** (8-12 pages)
   - 4.1 Capital Investment Decision Tree
   - 4.2 Maintenance Strategy Decision Tree
   - 4.3 Asset Renewal/Replacement Decision Tree
   - 4.4 Operations Risk Decision Tree
   - 4.5 Emergency Response Decision Tree
   Each decision tree provides a structured flow from decision trigger through risk assessment to decision outcome, with clear escalation criteria and documentation requirements.

5. **Consequence Modeling** (5-8 pages)
   - 5.1 Financial consequence models by asset class:
     - Direct repair cost models
     - Production loss models ($/hour of downtime by system)
     - Secondary damage models (cascade failure consequences)
     - Environmental remediation cost models
     - Regulatory penalty models
   - 5.2 Safety consequence models:
     - Exposure analysis (who is at risk and how often)
     - Consequence severity models (energy release, toxic exposure, etc.)
     - Barrier analysis (what prevents escalation)
   - 5.3 Combined consequence scoring methodology

6. **Integration with Asset Management Processes** (5-8 pages)
   - 6.1 Risk in capital investment planning (project prioritization matrix)
   - 6.2 Risk in maintenance strategy (RCM decision logic risk component)
   - 6.3 Risk in operational decisions (start/stop criteria, load management)
   - 6.4 Risk in inspection planning (risk-based inspection intervals)
   - 6.5 Risk in spare parts strategy (criticality-driven stocking policy)
   - 6.6 Risk register management (living risk register process)

7. **Governance and Review** (3-5 pages)
   - 7.1 Roles and responsibilities for risk management
   - 7.2 Risk review cadence (daily, weekly, monthly, quarterly, annual)
   - 7.3 Risk reporting framework
   - 7.4 Risk escalation protocol
   - 7.5 Framework review and update triggers

8. **Appendices**
   - A: Risk matrix with full consequence and probability definitions
   - B: Decision tree flowcharts (A3 printable)
   - C: Consequence model templates and calculation examples
   - D: Risk assessment worksheet templates
   - E: Risk register template
   - F: Training curriculum outline

### Primary Output 2: Risk Assessment Toolkit (.xlsx)

**Filename:** `{OrgCode}_Risk_Assessment_Toolkit_v{version}_{date}.xlsx`

**Sheets:**
- **Risk Matrix**: 5x5 risk matrix with color coding and response requirements
- **Consequence Scales**: All 5 consequence categories with detailed level definitions
- **Probability Scale**: Likelihood definitions with frequency ranges
- **Asset Risk Register**: Template for recording asset risks with all required fields
- **Decision Tree Logic**: Structured decision logic tables for each decision type
- **Consequence Calculator**: Input-driven consequence quantification models
- **Risk Ranking**: Portfolio-level risk ranking with investment priority scoring
- **Investment Prioritization**: Risk-weighted investment ranking model
- **Dashboard Data**: KPI data structure for risk management dashboards

### Primary Output 3: Risk-Based Decision Training Package (.pptx)

**Filename:** `{OrgCode}_Risk_Based_Decision_Training_v{version}_{date}.pptx`

**Structure (30-40 slides):**
- Why risk-based decisions matter (business case with industry examples)
- Risk appetite explained (what the organization has committed to)
- How to use the risk matrix (step-by-step with examples)
- Decision trees walkthrough (practical worked examples)
- Consequence modeling (how to quantify "what could go wrong")
- Common pitfalls (overconfidence, anchoring, availability bias)
- Practical exercises (3-4 case studies for workshop use)
- Quick reference card (laminated pocket guide content)

---

## Methodology & Standards

### Risk Management Framework (ISO 31000 Aligned)

```
Step 1: ESTABLISH CONTEXT
  - Define internal/external context for risk assessment
  - Define risk criteria (appetite, tolerance, scales)
  - Define scope and boundaries of assessment

Step 2: RISK IDENTIFICATION
  - What can happen? (failure modes, events, scenarios)
  - How can it happen? (causes, triggers, mechanisms)
  - What are the consequences? (safety, environmental, financial, operational)
  - What controls exist? (barriers, safeguards, detection systems)

Step 3: RISK ANALYSIS
  - Estimate consequence severity (using consequence models)
  - Estimate probability/likelihood (using failure data or expert judgment)
  - Determine risk level (consequence x probability)
  - Consider effectiveness of existing controls

Step 4: RISK EVALUATION
  - Compare risk level against risk appetite and tolerance thresholds
  - Determine if risk is acceptable, tolerable (ALARP), or intolerable
  - Prioritize risks requiring treatment

Step 5: RISK TREATMENT
  - Select treatment strategy: Avoid, Reduce, Transfer, Accept
  - Design treatment measures (engineering, procedural, administrative)
  - Assess residual risk after treatment
  - Evaluate cost-effectiveness of treatment (cost of treatment vs. risk reduction)

Step 6: MONITOR AND REVIEW
  - Monitor risk indicators and triggers
  - Review effectiveness of treatments
  - Update risk assessments when context changes
  - Report risk status to governance body
```

### ALARP Framework (As Low As Reasonably Practicable)

```
                    INTOLERABLE REGION
                    Risk cannot be justified except in
                    extraordinary circumstances.
                    MANDATORY risk reduction required.
    +-------------------------------------------------+
    |  Risk Level > Upper Tolerance Threshold          |
    |  Actions: MUST reduce risk regardless of cost    |
    +-------------------------------------------------+

                    ALARP REGION (Tolerability Zone)
                    Risk is tolerable only if further
                    reduction is impracticable or cost
                    is grossly disproportionate to benefit.
    +-------------------------------------------------+
    |  Upper Tolerance > Risk > Lower Tolerance        |
    |  Actions: Reduce risk UNLESS cost of reduction   |
    |  is grossly disproportionate to benefit gained   |
    |  Demonstrate: Active risk management in place    |
    +-------------------------------------------------+

                    BROADLY ACCEPTABLE REGION
                    Risk is negligible. No further
                    risk reduction required.
    +-------------------------------------------------+
    |  Risk Level < Lower Tolerance Threshold          |
    |  Actions: Maintain current controls; monitor     |
    +-------------------------------------------------+
```

### Risk-Based Decision Trees

**Capital Investment Decision Tree:**
```
Trigger: Capital investment request / renewal candidate / capacity need
|
+-- Is there a safety or environmental risk driver?
|   +-- YES: Quantify current risk level
|   |   +-- Risk INTOLERABLE? --> MANDATORY investment (escalate if unfunded)
|   |   +-- Risk in ALARP zone? --> Cost-benefit analysis (ALARP test)
|   |   |   +-- Cost of treatment < 10x annual risk reduction value? --> INVEST
|   |   |   +-- Cost > 10x? --> Document ALARP justification; accept with monitoring
|   |   +-- Risk ACCEPTABLE? --> No safety-driven investment needed
|   |
|   +-- NO: Evaluate business case
|       +-- Calculate NPV of investment over asset lifecycle
|       +-- Risk-adjust returns using Monte Carlo or scenario analysis
|       +-- Compare against investment threshold (NPV > 0 at required rate of return)
|       +-- Rank against competing investments by risk-adjusted NPV/$ invested
|       +-- INVEST if above threshold and ranked within budget envelope
|       +-- DEFER if below threshold; document and review annually
```

**Maintenance Strategy Decision Tree:**
```
Trigger: Failure mode identified in FMECA / RCM analysis
|
+-- What is the consequence category?
|   +-- SAFETY or ENVIRONMENTAL consequence
|   |   +-- Is there a proactive task that reduces risk to ALARP?
|   |   |   +-- YES: Implement task (CBM preferred, PM if CBM infeasible)
|   |   |   +-- NO: REDESIGN IS MANDATORY (failure mode must be eliminated)
|   |
|   +-- OPERATIONAL consequence (production/service impact)
|   |   +-- Quantify production loss from failure ($/event x events/year)
|   |   +-- Quantify cost of proactive task ($/year)
|   |   +-- Is proactive task cost-effective? (benefit > cost)
|   |   |   +-- YES: Implement task
|   |   |   +-- NO: Run-to-failure (accept the risk)
|   |
|   +-- NON-OPERATIONAL consequence (repair cost only)
|       +-- Is proactive task cost less than reactive repair cost?
|       |   +-- YES: Implement task
|       |   +-- NO: Run-to-failure
```

### Industry Standards and References

| Standard | Application |
|----------|-------------|
| **ISO 31000:2018** | Risk management principles, framework, and process |
| **ISO 55001:2014** | Clauses 6.1 (risks and opportunities) and 8.1 (operational planning -- risk criteria) |
| **IEC 31010:2019** | Risk assessment techniques catalog (FMECA, FTA, ETA, bow-tie, Monte Carlo, etc.) |
| **ISO 12100** | Safety of machinery -- risk assessment methodology |
| **NORSOK Z-008:2017** | Risk-based maintenance and consequence classification (oil & gas) |
| **API 580/581** | Risk-based inspection methodology for pressure equipment |
| **UK HSE R2P2** | Reducing Risks, Protecting People -- ALARP framework |
| **SAE JA1011/JA1012** | RCM risk-based task selection logic |
| **AS/NZS 4360** | Risk management standard (predecessor to ISO 31000) |
| **SERNAGEOMIN DS 132** | Chilean mining safety regulations -- risk management requirements |
| **OSHA PSM** | Process safety management -- risk assessment requirements |
| **EPRI** | Risk-informed maintenance optimization research |

### Pain Points Addressed with Quantified Impact

| Pain Point | Industry Statistic | VSC Target | Improvement |
|-----------|-------------------|------------|-------------|
| ISO-04: Non-risk-informed decisions | Only 25-30% use risk-informed decisions consistently | >80% of decisions risk-informed | 2.7-3.2x improvement |
| Over/Under-investment | 20-35% improvement possible with risk-based prioritization | 20% improvement in investment efficiency | Quantified savings |
| Maintenance cost | Risk-based optimization saves 15-25% (EPRI) | 15-20% maintenance cost reduction | $1-5M/year typical |
| Repeat failures | 40-60% repeat failures indicate failed learning loops | <20% repeat failure rate | 50-67% reduction |
| Regulatory exposure | Unable to demonstrate due diligence for risk decisions | Full audit trail for all risk decisions | Regulatory protection |
| Safety incidents | Incomplete risk assessment contributes to 30-40% of incidents | Zero incidents from unassessed risks | Systematic prevention |

---

## Step-by-Step Execution

### Phase 1: Foundation -- Risk Appetite & Framework Design (Steps 1-4)
**Step 1: Assess Current Risk Management Practices**
### Phase 2: Decision Tree Development (Steps 5-7)
**Step 5: Develop Capital Investment Decision Tree**
### Phase 3: Integration & Implementation (Steps 8-12)
**Step 8: Build the Risk Register**

See [`references/skill-detailed-steps.md`](references/skill-detailed-steps.md) for complete detailed execution steps.

## Quality Criteria

| Criterion | Metric | Target | Minimum Acceptable |
|-----------|--------|--------|-------------------|
| Risk Appetite Definition | Documented and leadership-approved | Yes, with CEO signature | Yes, with management sign-off |
| Consequence Scale Quality | Scales quantified with no ambiguity | All 5 categories fully quantified | Safety + Financial quantified |
| Framework Completeness | ISO 31000 process steps covered | 100% | >90% |
| Decision Trees | Number of decision types covered | >=5 types | >=3 types |
| Consequence Models | Asset classes with quantified models | All critical + high | All critical |
| Risk Register Population | Critical assets with completed risk assessment | 100% | >90% |
| Investment Integration | Capital decisions demonstrably risk-informed | >80% | >60% |
| Training Completion | Decision-makers trained on framework | >90% | >70% |
| ISO 55001 Compliance | Clauses 6.1 and 8.1 fully addressed | 100% | 100% |
| Stakeholder Endorsement | Key stakeholders endorse the framework | >80% | >60% |
| Decision Audit Trail | Risk decisions with documented rationale | 100% | >90% |
| Framework Review | Annual review completed on schedule | 100% | Yes |

---

## Inter-Agent Dependencies

| Agent/Skill | Dependency Type | Description |
|-------------|----------------|-------------|
| `assess-am-maturity` (O-01) | Upstream | Maturity assessment identifies risk management gaps that trigger this skill |
| `develop-samp` (O-02) | Upstream | SAMP risk strategy provides the strategic direction for this framework |
| `agent-maintenance` | Consumer | Maintenance uses risk framework for strategy development and PM optimization |
| `agent-operations` | Consumer | Operations uses risk framework for start/stop criteria and operational decisions |
| `agent-hse` | Consumer/Input | HSE provides safety risk data and uses framework for safety risk management |
| `agent-finance` | Consumer/Input | Finance uses risk framework for investment prioritization; provides financial data |
| `agent-procurement` | Consumer | Procurement uses risk framework for supplier risk and spare parts criticality |
| `create-risk-assessment` (A-13) | Downstream | Operational risk assessments use this framework as the methodology standard |
| `develop-maintenance-strategy` (J-01) | Downstream | Maintenance strategy uses risk framework for RCM task selection |
| `analyze-equipment-criticality` (B-01) | Downstream | Criticality analysis uses this framework's consequence and probability scales |
| `orchestrate-or-program` (H-01) | Integration | OR program uses risk framework for program risk management |
| `resolve-cross-functional-conflicts` (N-02) | Integration | Risk framework informs conflict resolution for risk-related disagreements |
| `validate-output-quality` (F-05) | Quality Gate | Framework deliverables validated before deployment |

---

## Examples

See [`references/skill-examples.md`](references/skill-examples.md) for detailed examples.

## MCP Integrations

See [`references/skill-mcp-integrations.md`](references/skill-mcp-integrations.md) for detailed mcp integrations.

## Templates & References

See [`references/skill-templates-references.md`](references/skill-templates-references.md) for detailed templates & references.
