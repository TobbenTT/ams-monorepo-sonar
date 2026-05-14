---
name: manage-project-risk-register
description: "Maintain quantified project risk register with probability-impact scoring, risk response strategies, Monte Carlo simulation inputs, and risk trend monitoring for capital projects. Triggers: 'risk register', 'project risks', 'registro de riesgos'."
category: "Project Governance — Risk Management"
priority: P1 - Critical
version: 1.0.0
agent: project-orchestrator (AG-007)
---

# Manage Project Risk Register

## Skill ID: PO-004
## Version: 1.0.0
## Category: Project Governance — Risk Management
## Priority: P1 - Critical

---

## Purpose

Maintain a comprehensive, quantified project risk register for capital projects that captures all identified risks with probability-impact (P x I) scoring, assigns risk response strategies, tracks risk ownership and mitigation actions, monitors risk trends over time, and provides structured inputs for Monte Carlo cost and schedule risk analysis. This skill serves as the central risk management function for the Project Orchestrator, consolidating risk inputs from all specialist agents into a unified, auditable risk register that supports informed decision-making at every project phase.

Effective risk management is the most impactful governance practice in capital project delivery. IPA benchmarking data across 20,000+ projects demonstrates that projects with formal, quantified risk management processes deliver cost outcomes 20-30% better than projects with informal or no risk management (IPA, "The Impact of Risk Management on Project Outcomes," 2021). The AACE International Total Cost Management Framework identifies risk management as the discipline that "bridges the gap between deterministic estimates and probabilistic outcomes" — without rigorous risk quantification, cost estimates and schedules are single-point predictions that inevitably prove optimistic.

The challenge in megaproject risk management is not risk identification — most project teams can list dozens of risks — but risk quantification, response tracking, and trend monitoring. A study by the University of Leeds (Laryea & Hughes, 2011) found that 82% of capital project risk registers contain qualitative descriptions without adequate quantification, rendering them unsuitable for probabilistic analysis. Furthermore, 67% of risk registers are created at project inception and never systematically updated, becoming "historical artifacts rather than living management tools" (PMI Risk Management Practice Standard, 2019).

This skill directly addresses **Pain Point CP-07** (Capital Project Risk Blindness): 71% of projects that experienced cost overruns greater than 20% had risk registers that failed to capture the realized risks or underestimated their probability and impact (IPA 2022). The root causes are systemic: risks are qualitatively described rather than quantified, risk response strategies are generic rather than specific, risk ownership is ambiguous, and risk trends are not monitored. This skill eliminates these failure modes by enforcing structured risk identification with standardized categories, mandatory P x I scoring using a calibrated 5x5 matrix, specific and assignable response strategies, defined risk ownership, and period-over-period trend tracking that reveals whether the project risk profile is improving or deteriorating.

---

## Intent & Specification

| Attribute              | Value                                                                 |
|------------------------|-----------------------------------------------------------------------|
| **Skill ID**           | PO-004                                                                |
| **Agent**              | Project Orchestrator (AG-007)                                         |
| **Domain**             | Capital Project Risk Management                                       |
| **Version**            | 1.0.0                                                                 |
| **Complexity**         | High                                                                  |
| **Estimated Duration** | Initial register: 3-5 days; Monthly update: 1-2 days                  |
| **Maturity**           | Production                                                            |
| **Pain Point Addressed** | CP-07: 71% of overrun projects had inadequate risk registers (IPA 2022)|
| **Secondary Pain**     | CP-08: Risk quantification insufficient for probabilistic analysis    |
| **Value Created**      | 20-30% improvement in cost predictability through quantified risk management |

### Functional Intent

This skill SHALL:

1. **Identify and Categorize Risks**: Capture risks across six standardized categories — Technical (design, technology, geological), Commercial (procurement, contracts, market), Schedule (sequencing, resource availability, permitting timeline), Safety (process safety, occupational health, construction hazards), Environmental (emissions, effluents, land disturbance, water management), and Regulatory (permits, compliance, legislative changes). Each risk must have a unique identifier, clear description, root cause, and affected project element.

2. **Score Probability and Impact**: Apply a calibrated 5x5 probability-impact matrix to every risk. Probability is scored on a 5-point scale (Rare, Unlikely, Possible, Likely, Almost Certain) with defined probability ranges (e.g., Rare = <5%, Almost Certain = >80%). Impact is scored across five dimensions (cost, schedule, safety, environment, reputation) on a 5-point scale (Negligible, Minor, Moderate, Major, Catastrophic) with defined quantitative thresholds calibrated to project scale.

3. **Calculate Risk Score and Rating**: Compute the Risk Score as Probability x maximum Impact across dimensions. Classify each risk as Low (1-4), Medium (5-9), High (10-16), Critical (17-20), or Extreme (25). Apply the heat map color coding for visual risk distribution analysis.

4. **Define Risk Response Strategies**: For each risk rated Medium or above, define a specific response strategy — Avoid (eliminate the root cause), Mitigate (reduce probability or impact), Transfer (insurance, contractual allocation), or Accept (document rationale, set contingency). Each response must include specific actions, responsible owner, timeline, and expected residual risk after response implementation.

5. **Track Risk Ownership and Actions**: Assign every risk to a specific agent (risk owner) responsible for monitoring and response implementation. Track all risk response actions with status (Open, In Progress, Completed, Overdue), ensuring accountability and follow-through.

6. **Monitor Risk Trends**: Track period-over-period changes in risk scores, new risks identified, risks closed, and overall risk exposure (sum of risk scores). Identify deteriorating trends requiring escalation and improving trends confirming mitigation effectiveness.

7. **Provide Monte Carlo Inputs**: Structure quantified risk data (probability distributions, cost impact ranges, schedule impact ranges) in a format suitable for Monte Carlo simulation tools. Support triangular, PERT, and custom probability distributions for each risk's cost and schedule impact.

8. **Monitor Contingency Draw-Down**: Track the relationship between management reserve/contingency utilization and risk retirement. Alert when contingency consumption outpaces risk retirement, indicating potential contingency insufficiency.

### Success Criteria

- 100% of identified risks have P x I scores with documented rationale
- Every risk rated Medium or above has a defined response strategy with assigned owner
- Risk register updated at minimum monthly frequency
- Trend analysis provided for every update cycle (minimum 3 periods for trend validity)
- Monte Carlo input data provided for all quantified risks in standard format
- Contingency draw-down tracked against risk retirement rate

### Constraints

- Must use the standardized 5x5 P x I matrix with calibrated thresholds
- Must not allow qualitative-only risk descriptions — every risk must have quantified P x I
- Must support both cost and schedule impact quantification for each risk
- Must maintain full audit trail of all risk register changes (who changed what, when)
- Must comply with ISO 31000:2018 risk management principles
- Must support bilingual risk descriptions (English/Spanish)

---

## Trigger / Invocation

### Direct Invocation

```
/manage-project-risk-register --project [name] --action [identify|update|analyze|report|monte-carlo]
```

### Command Variants

- `/manage-project-risk-register identify --project [name] --source [workshop|review|agent]` — Add new risks
- `/manage-project-risk-register update --project [name] --period [YYYY-MM]` — Monthly risk register update
- `/manage-project-risk-register analyze --project [name]` — Risk trend analysis and heat map generation
- `/manage-project-risk-register report --project [name] --level [team|steering|executive]` — Generate risk report
- `/manage-project-risk-register monte-carlo --project [name]` — Generate Monte Carlo simulation inputs
- `/manage-project-risk-register contingency --project [name]` — Contingency draw-down analysis

### Aliases

- `/risk-register`, `/project-risks`, `/registro-riesgos`, `/gestion-riesgos`

### Natural Language Triggers (EN)

- "Update the project risk register"
- "Add a new risk to the register"
- "What are the top 10 project risks?"
- "Generate the risk heat map"
- "How is the contingency tracking against risk retirement?"
- "Prepare Monte Carlo inputs for the schedule risk analysis"

### Natural Language Triggers (ES)

- "Actualizar el registro de riesgos del proyecto"
- "Agregar un nuevo riesgo al registro"
- "Cuales son los 10 riesgos principales del proyecto?"
- "Generar el mapa de calor de riesgos"
- "Como va el seguimiento de contingencia contra la mitigacion de riesgos?"

### Contextual Triggers

- Monthly reporting cycle (automatic risk register update and trend analysis)
- New risk identified by any agent (automatic addition to register)
- Gate review approaching (comprehensive risk assessment for gate package)
- Cost or schedule variance exceeds 10% (triggers risk review for root cause risks)
- HAZOP or safety review completed by AG-004 (triggers safety risk register update)
- Contract award or procurement milestone (triggers commercial risk review)

---

## Input Requirements

### Required Inputs

| Input | Type | Source | Description |
|-------|------|--------|-------------|
| `project_code` | text | User / Session State | Project identifier |
| `risk_data` | .xlsx / structured | User / Agents | New or updated risk information including description, category, probability, impact |
| `pi_matrix_config` | .yaml | Methodology | Calibrated P x I matrix with thresholds appropriate to project scale |
| `contingency_allocation` | .xlsx | AG-010 (Finance) | Approved contingency and management reserve amounts |

### Optional Inputs

| Input | Type | Source | Description |
|-------|------|--------|-------------|
| `prior_risk_register` | .xlsx | AG-007 / mcp-sharepoint | Previous risk register for trend analysis and delta identification |
| `safety_risks` | .xlsx | AG-004 (HSE) | Safety and environmental risks from HAZOP, HAZID, environmental impact assessment |
| `technical_risks` | .xlsx | AG-008 (Engineering Design) | Technical and design risks from design reviews, technology assessment |
| `commercial_risks` | .xlsx | AG-005 (Contracts & Compliance) | Procurement, contractual, and regulatory risks |
| `execution_risks` | .xlsx | AG-009 (Construction Management) | Construction execution risks, logistics, labor, weather |
| `schedule_risks` | .xlsx | AG-006 (Execution) | Schedule-specific risks from critical path analysis |
| `risk_workshop_notes` | .docx | User / Consultant | Notes from facilitated risk workshops |
| `lessons_learned` | .docx | Methodology | Lessons learned from comparable projects identifying common risks |

### Input Validation Rules

```yaml
validation:
  risk_data:
    required_fields: ["risk_description", "category", "probability_score", "impact_cost", "impact_schedule"]
    category_values: ["Technical", "Commercial", "Schedule", "Safety", "Environmental", "Regulatory"]
    probability_range: [1, 5]
    impact_range: [1, 5]
  contingency_allocation:
    required_fields: ["total_contingency", "management_reserve", "currency"]
    positive_values: true
```

---

## Output Specification

### Deliverable 1: Project Risk Register (.xlsx)

**Filename**: `{ProjectCode}_Risk_Register_v{Version}_{YYYYMMDD}.xlsx`

**Workbook Structure**:

#### Sheet 1: "Risk Register"

| Column | Field | Description |
|--------|-------|-------------|
| A | Risk_ID | Unique identifier (RSK-{Category Abbrev}-{NNN}) |
| B | Date_Identified | Date risk was first identified |
| C | Category | Technical / Commercial / Schedule / Safety / Environmental / Regulatory |
| D | Risk_Description | Clear description of the risk event |
| E | Root_Cause | Underlying cause or source of the risk |
| F | Affected_Element | WBS element, system, contract, or area affected |
| G | Probability | Score (1-5) with calibrated label |
| H | Impact_Cost | Cost impact score (1-5) with quantified range |
| I | Impact_Schedule | Schedule impact score (1-5) with quantified range |
| J | Impact_Safety | Safety impact score (1-5) |
| K | Impact_Environment | Environmental impact score (1-5) |
| L | Impact_Reputation | Reputational impact score (1-5) |
| M | Max_Impact | Maximum across all impact dimensions |
| N | Risk_Score | Probability x Max_Impact |
| O | Risk_Rating | Low / Medium / High / Critical / Extreme |
| P | Response_Strategy | Avoid / Mitigate / Transfer / Accept |
| Q | Response_Description | Specific response actions |
| R | Risk_Owner | Responsible agent (AG-XXX) and named individual |
| S | Response_Status | Planned / In Progress / Completed / Overdue |
| T | Response_Deadline | Target date for response implementation |
| U | Residual_Probability | Probability after response implementation |
| V | Residual_Impact | Impact after response implementation |
| W | Residual_Risk_Score | Residual P x I score |
| X | Cost_Impact_Low | Minimum cost impact (USD) for Monte Carlo |
| Y | Cost_Impact_Most_Likely | Most likely cost impact (USD) for Monte Carlo |
| Z | Cost_Impact_High | Maximum cost impact (USD) for Monte Carlo |
| AA | Schedule_Impact_Low | Minimum schedule impact (days) for Monte Carlo |
| AB | Schedule_Impact_Most_Likely | Most likely schedule impact (days) for Monte Carlo |
| AC | Schedule_Impact_High | Maximum schedule impact (days) for Monte Carlo |
| AD | Distribution_Type | Triangular / PERT / Uniform |
| AE | Last_Review_Date | Date of most recent review |
| AF | Status | Active / Mitigated / Closed / Realized |
| AG | Notes | Additional comments, cross-references |

#### Sheet 2: "Heat Map Data"

5x5 matrix with risk counts per cell, color-coded from Green (Low) through Yellow (Medium), Orange (High), Red (Critical), to Dark Red (Extreme).

#### Sheet 3: "Risk Trend"

| Period | Active_Risks | New_Risks | Closed_Risks | Total_Risk_Exposure | Critical_Count | Extreme_Count | Trend |
|--------|-------------|-----------|-------------|--------------------|--------------|--------------| ------|

#### Sheet 4: "Top 10 Risks"

Top 10 risks by risk score with full detail and response status.

#### Sheet 5: "Contingency Tracking"

| Period | Total_Contingency | Contingency_Used | Contingency_Remaining | Risks_Retired_Value | Draw_Down_Rate | Retirement_Rate | Health_Status |
|--------|------------------|-----------------|----------------------|--------------------|--------------|-----------------|--------------|

#### Sheet 6: "Monte Carlo Inputs"

Structured risk quantification data formatted for import into Monte Carlo simulation tools (Crystal Ball, @Risk, Primavera Risk Analysis).

### Deliverable 2: Risk Summary Report (.md)

**Filename**: `{ProjectCode}_Risk_Summary_{Period}_v{Version}_{YYYYMMDD}.md`

Structured report (6-10 pages) containing:
1. Risk Profile Summary (1 page) — Total risks by category and rating, heat map visualization
2. Top Risks Analysis (2-3 pages) — Detailed analysis of top 10 risks with response status
3. Risk Trends (1-2 pages) — Period-over-period trend analysis with commentary
4. Contingency Health (1 page) — Contingency draw-down vs. risk retirement assessment
5. New Risks and Closed Risks (1 page) — Changes since last reporting period
6. Recommendations (1 page) — Risk management actions and escalation needs

### Formatting Standards

- Risk rating colors: Low = Green (#008000), Medium = Yellow (#FFD700), High = Orange (#FF8C00), Critical = Red (#CC0000), Extreme = Dark Red (#8B0000)
- Heat map: 5x5 grid with consistent color gradients from green (bottom-left) to red (top-right)
- Trend arrows: Improving (green down arrow), Stable (amber right arrow), Deteriorating (red up arrow)

---

## Quality Criteria

| Criterion | Metric | Weight | Target | Minimum Acceptable |
|-----------|--------|--------|--------|-------------------|
| Risk coverage | All project disciplines and categories represented | 15% | All 6 categories | All 6 categories |
| Scoring completeness | All risks have P x I scores with rationale | 20% | 100% | 100% |
| Response completeness | All Medium+ risks have response strategies with owners | 15% | 100% | >95% |
| Quantification depth | Risks with Monte Carlo input data (cost and schedule ranges) | 15% | >80% of High+ risks | >60% of High+ risks |
| Trend analysis | Minimum periods for valid trend analysis | 10% | 6+ periods | 3 periods |
| Contingency tracking | Contingency draw-down monitored against risk retirement | 10% | Monthly tracking | Quarterly tracking |
| Audit trail | All changes logged with date, author, and rationale | 10% | 100% | 100% |
| Timeliness | Register updated within defined reporting cadence | 5% | Monthly or better | Monthly |

### Automated Quality Checks

1. **Scoring validation**: All P x I scores within valid range (1-5)
2. **Rating consistency**: Risk rating matches P x I score per matrix definition
3. **Response gap check**: No risk rated High, Critical, or Extreme without a defined response strategy
4. **Ownership check**: Every risk has an assigned owner
5. **Overdue actions**: Flag response actions past their deadline as Overdue
6. **Contingency health**: Alert if contingency draw-down rate exceeds risk retirement rate by >20%
7. **Stale risks**: Flag risks not reviewed in >60 days
8. **Monte Carlo completeness**: All risks with cost or schedule impact >$100K or >30 days have Monte Carlo input data
9. **Category balance**: Alert if any risk category has zero entries (potential blind spot)

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents)

| Agent | Input Provided | Criticality | Description |
|-------|---------------|-------------|-------------|
| AG-004 (HSE) | Safety and environmental risks | Critical | HAZOP, HAZID, environmental assessment outputs identifying safety, process safety, and environmental risks |
| AG-008 (Engineering Design) | Technical and design risks | Critical | Technology risks, design complexity, vendor data risks, geotechnical uncertainties |
| AG-005 (Contracts & Compliance) | Commercial and regulatory risks | High | Procurement risks, contractual risks, regulatory permit timeline risks, market price risks |
| AG-009 (Construction Management) | Construction execution risks | High | Labor availability, logistics, weather, subcontractor performance, site access risks |
| AG-006 (Execution) | Schedule risks | High | Critical path risks, resource constraints, commissioning sequencing risks |
| AG-010 (Finance & Accounting) | Financial and funding risks | Medium | Funding availability, currency exchange, inflation, cash flow timing risks |
| AG-002 (Operations) | Operational readiness risks | Medium | Staffing, training, SOP readiness, organizational design risks |

### Downstream Dependencies (Outputs TO other agents)

| Agent | Output Provided | Criticality | Description |
|-------|----------------|-------------|-------------|
| AG-007 — assess-fel-gate-readiness (PO-001) | Risk maturity assessment for gate review | High | Risk register maturity is a component of the FEL Index assessment |
| AG-007 — generate-project-dashboard (PO-003) | Risk heat map and top risks for dashboard | High | Dashboard includes risk summary section sourced from this register |
| AG-007 — track-project-evm (PO-002) | Risk-adjusted EAC inputs | Medium | Monte Carlo simulation results from risk quantification inform EAC range |
| AG-010 (Finance & Accounting) | Contingency adequacy assessment | High | Finance uses risk quantification to validate contingency and management reserve levels |
| AG-001 (OR Orchestrator) | Portfolio-level risk aggregation | High | OR Orchestrator aggregates project-level risks into portfolio risk view |

---

## Methodology & Standards

### Primary Standards

| Standard | Description | Application |
|----------|-------------|-------------|
| ISO 31000:2018 | Risk Management — Guidelines | Overall risk management framework and principles |
| PMI Practice Standard for Risk Management | PMI risk management methodology for projects | Risk identification, assessment, response planning, monitoring |
| AACE 65R-11 | Integrated Cost and Schedule Risk Analysis | Monte Carlo simulation methodology and cost/schedule risk integration |
| IEC 31010:2019 | Risk Assessment Techniques | Catalogue of risk assessment techniques (P x I matrix, bow-tie, Monte Carlo) |
| PMBOK 7th Edition, Section 4.6 | Risk Domain | Risk management as a core project management performance domain |

### P x I Matrix Calibration (Industrial Capital Project — $100M-$1B Scale)

**Probability Scale:**

| Score | Label | Probability Range | Description |
|-------|-------|------------------|-------------|
| 1 | Rare | < 5% | Extremely unlikely; no precedent in comparable projects |
| 2 | Unlikely | 5% - 20% | Could occur but not expected; limited precedent |
| 3 | Possible | 20% - 50% | Reasonable likelihood; has occurred in comparable projects |
| 4 | Likely | 50% - 80% | More likely than not; common in similar project contexts |
| 5 | Almost Certain | > 80% | Expected to occur; strong precedent or early indicators present |

**Impact Scale (Cost):**

| Score | Label | Cost Impact Range | % of BAC |
|-------|-------|------------------|----------|
| 1 | Negligible | < $100K | < 0.1% |
| 2 | Minor | $100K - $1M | 0.1% - 1% |
| 3 | Moderate | $1M - $10M | 1% - 5% |
| 4 | Major | $10M - $50M | 5% - 15% |
| 5 | Catastrophic | > $50M | > 15% |

**Impact Scale (Schedule):**

| Score | Label | Schedule Impact Range |
|-------|-------|----------------------|
| 1 | Negligible | < 1 week |
| 2 | Minor | 1 - 4 weeks |
| 3 | Moderate | 1 - 3 months |
| 4 | Major | 3 - 6 months |
| 5 | Catastrophic | > 6 months |

**Risk Score Matrix:**

```
           Impact
          1    2    3    4    5
Prob 5 |  5 | 10 | 15 | 20 | 25 |  <- Almost Certain
     4 |  4 |  8 | 12 | 16 | 20 |  <- Likely
     3 |  3 |  6 |  9 | 12 | 15 |  <- Possible
     2 |  2 |  4 |  6 |  8 | 10 |  <- Unlikely
     1 |  1 |  2 |  3 |  4 |  5 |  <- Rare

Rating: Low (1-4), Medium (5-9), High (10-16), Critical (17-20), Extreme (25)
```

### Response Strategy Selection Guide

| Risk Rating | Required Response | Escalation Level |
|-------------|------------------|------------------|
| Extreme (25) | Avoid or Transfer — must eliminate or transfer risk | Executive board; project may not proceed |
| Critical (17-20) | Mitigate with multiple actions — reduce P and I; Transfer if mitigate insufficient | Steering committee; formal decision required |
| High (10-16) | Mitigate — specific actions to reduce probability or impact | Project manager; tracked in monthly reviews |
| Medium (5-9) | Mitigate or Accept with contingency allocation | Discipline lead; reviewed quarterly |
| Low (1-4) | Accept — monitor, no active response required | Risk owner; reviewed semi-annually |
