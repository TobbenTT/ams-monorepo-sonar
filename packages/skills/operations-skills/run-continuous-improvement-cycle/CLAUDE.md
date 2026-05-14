---
name: run-continuous-improvement-cycle
description: "Execute Plan-Do-Check-Act (PDCA) cycles for operational improvement initiatives. Triggers: 'continuous improvement', 'PDCA', 'improvement cycle', 'Deming cycle', 'CI initiative', 'mejora continua', 'ciclo PDCA', 'iniciativa de mejora'."
---

# Run Continuous Improvement Cycle

## Skill ID: run-continuous-improvement-cycle
## Version: 1.0.0
## Category: C - Planning
## Priority: High

## Purpose

Structure and execute Plan-Do-Check-Act (PDCA) improvement cycles from problem identification through root cause analysis, solution implementation, results verification, and standardization. This skill provides the systematic engine that transforms identified performance gaps into sustained operational improvements, ensuring that every improvement initiative follows a disciplined, data-driven methodology rather than ad-hoc troubleshooting.

In asset-intensive industries -- mining, oil and gas, chemicals, energy -- the difference between top-quartile and bottom-quartile performers is not the absence of problems but the absence of a systematic approach to solving them. Organizations that lack structured PDCA discipline experience chronic recurring failures, improvement fatigue, and a culture where problems are "fixed" repeatedly without ever being truly resolved. Industry data shows that 60-70% of improvement initiatives fail to sustain results beyond 6 months when they lack a rigorous Check-Act follow-through cycle (McKinsey Operations Practice, 2023).

This skill addresses that gap by providing a complete PDCA cycle package: from problem statement formulation with baseline metrics, through structured root cause analysis, implementation planning, statistical before-and-after validation, and formal standardization of successful countermeasures. Each cycle produces a documented A3 report that captures the problem-solving logic, creating an organizational learning asset that compounds over time.

The skill integrates with the broader VSC OR continuous improvement portfolio, feeding into Kaizen events (facilitate-lean-kaizen-event), KPI dashboards (calculate-operational-kpis), and the orchestrator's improvement tracking system, ensuring that individual PDCA cycles are part of a coherent improvement strategy, not isolated efforts.

## Intent & Specification

The AI agent MUST understand that:

1. **PDCA is Iterative by Design**: Each cycle builds on the previous one. If the Check phase reveals insufficient improvement, the Act phase initiates a new Plan phase with updated understanding -- not a declaration of failure. Multiple cycles on the same problem are expected and normal for complex issues.
2. **Plan Phase Requires Rigor**: A clear problem statement must include baseline metrics (quantified current state), a measurable improvement target (SMART format), defined scope boundaries, and a root cause analysis that goes beyond symptoms to identify true systemic causes. Without a rigorous Plan, the remaining phases are wasted effort.
3. **Check Phase Demands Statistical Rigor**: Before-and-after comparisons must use appropriate statistical methods -- control charts, hypothesis testing, trend analysis -- to distinguish genuine improvement from normal process variation. A single data point improvement is not validation; sustained improvement over a meaningful period (minimum 4-6 weeks) is required.
4. **Every Cycle Needs Governance Structure**: Each PDCA cycle must have a defined scope, problem owner, cross-functional team, timeline with milestones, success criteria, and escalation path. Improvement without accountability is wishful thinking.
5. **A3 Thinking is the Documentation Standard**: All PDCA cycles are documented using the A3 problem-solving format (Toyota methodology), which forces concise, logical, visual communication of the problem-solving journey on a single page (or structured equivalent). The A3 is both a thinking tool and a communication tool.
6. **Escalation Criteria Must Be Predefined**: When countermeasures do not achieve the target after a defined number of cycles or time period, the problem must escalate -- either to a full Kaizen event (facilitate-lean-kaizen-event), a capital project, or management intervention. PDCA is not infinite; boundaries must be set.
7. **Integration with Ideas Pipeline**: PDCA cycles can originate from multiple sources: operator suggestions, KPI alerts (calculate-operational-kpis), audit findings, incident investigations, or management directives. The skill must connect to the organization's idea funnel and prioritization system to ensure the right problems are being worked.
8. **Language**: All deliverables in Spanish (Latin American). Technical terms, KPI names, and industry-standard acronyms (PDCA, RCA, SMART, OEE) retained in their original form. Methodology references maintained in English where they are universally known.

## Trigger / Invocation

```
/run-continuous-improvement-cycle
```

### Natural Language Triggers
- "Run a PDCA cycle on [problem/KPI]"
- "Start a continuous improvement initiative for [issue]"
- "Execute an improvement cycle for [area/process]"
- "Create a Deming cycle for [problem statement]"
- "Launch a CI initiative to address [gap]"
- "Estructura un ciclo PDCA para [problema]"
- "Iniciar una mejora continua sobre [tema]"
- "Ejecutar ciclo de mejora para [area/proceso]"
- "Crear iniciativa de mejora continua para [brecha de desempeno]"

## Input Requirements

### Required Inputs

| Input | Type | Source | Description |
|-------|------|--------|-------------|
| `problem_statement` | Text | User / KPI Alert | Clear description of the problem including what, where, when, and magnitude of impact |
| `baseline_metrics` | Numerical | calculate-operational-kpis / CMMS / ERP | Quantified current-state performance data (minimum 3 months of history for trending) |
| `improvement_target` | SMART format | User / Management | Specific, Measurable, Achievable, Relevant, Time-bound target for the improvement |

### Optional Inputs (Highly Recommended)

| Input | Type | Source | Default Behavior |
|-------|------|--------|------------------|
| `rca_results` | .docx / .xlsx | Previous analysis | Agent conducts RCA during Plan phase using 5-Why and Ishikawa |
| `resource_constraints` | Text | User / Project Manager | Assume standard operations team availability |
| `previous_improvement_attempts` | .docx / Text | Lessons learned database | Search knowledge base for prior cycles on same topic |
| `benchmark_data` | .xlsx / API | SMRP / Industry / Internal | Use available internal benchmarks from calculate-operational-kpis |
| `similar_improvements_other_sites` | .docx / .xlsx | Knowledge base / mcp-sharepoint | Search cross-project repository for analogous improvements |
| `available_improvement_tools` | Text | User | Apply standard Lean/Six Sigma toolset per problem type |
| `management_sponsor` | Name / Role | User | Assign to area manager by default; flag for escalation if unassigned |
| `cost_benefit_estimate` | .xlsx / Numerical | Finance / User | Estimate from baseline gap; flag if ROI data is unavailable |
| `linked_kpi_ids` | List | calculate-operational-kpis | Auto-detect from problem statement keywords |

### Context Enrichment

The agent should automatically:
- Pull current KPI values and trends from calculate-operational-kpis for the affected area/equipment
- Search the lessons-learned repository (mcp-sharepoint) for previous PDCA cycles on similar problems
- Retrieve relevant failure mode data from Asset Management agent if the problem involves equipment reliability
- Cross-reference HSE incident data if the problem has safety implications
- Check the CI portfolio tracker (project-database) for active or completed initiatives on overlapping scope

## Output Specification

### Document: PDCA Cycle Package (.docx)

**Filename**: `VSC_PDCA_{ProjectCode}_{CycleID}_{Version}_{Date}.docx`

**Structure**:

#### Section 1: A3 Problem-Solving Report (Single-Page Summary)
- 1.1 Title and cycle identification (CycleID, Owner, Team, Date)
- 1.2 Background / Context (why this problem matters now)
- 1.3 Current Condition (baseline data, trend charts, Pareto analysis)
- 1.4 Target Condition (SMART target with rationale)
- 1.5 Root Cause Analysis (Ishikawa diagram or 5-Why with evidence)
- 1.6 Countermeasures (what, who, when, expected impact)
- 1.7 Implementation Plan (Gantt or timeline)
- 1.8 Check Results (before/after data, control charts, statistical validation)
- 1.9 Act / Follow-Up (standardize, expand, or initiate next cycle)

#### Section 2: Plan Phase Detail
- 2.1 Problem statement (structured: What / Where / When / Magnitude)
- 2.2 Scope definition and boundaries (in-scope, out-of-scope)
- 2.3 Team composition and roles (RACI matrix)
- 2.4 Baseline data analysis (minimum 3 months, with control chart)
- 2.5 Root Cause Analysis documentation
  - Ishikawa (fishbone) diagram by category (Man, Machine, Method, Material, Measurement, Environment)
  - 5-Why analysis for each significant cause
  - Evidence supporting each root cause (data, observations, expert input)
- 2.6 Countermeasure selection matrix (cause, countermeasure, responsible, priority, feasibility, expected impact)
- 2.7 Implementation plan with milestones and resource requirements
- 2.8 Risk assessment of countermeasures (what could go wrong, mitigation)

#### Section 3: Do Phase Detail
- 3.1 Implementation log (date, action, responsible, status, observations)
- 3.2 Deviations from plan and rationale
- 3.3 Quick wins achieved during implementation
- 3.4 Issues encountered and resolutions
- 3.5 Resource utilization vs. plan

#### Section 4: Check Phase Detail
- 4.1 Before-and-after comparison (same metrics, same measurement method)
- 4.2 Statistical validation (control charts showing pre/post performance)
- 4.3 Sustainability assessment (minimum 4-6 weeks of post-implementation data)
- 4.4 Side effects analysis (positive and negative impacts on other KPIs)
- 4.5 Target achievement assessment (% of target achieved)
- 4.6 Lessons learned from this cycle

#### Section 5: Act Phase Detail
- 5.1 Decision: Standardize / Iterate / Escalate
- 5.2 If Standardize: updated procedures, training requirements, control plan
- 5.3 If Iterate: updated problem statement, refined root causes, next cycle plan
- 5.4 If Escalate: recommendation for Kaizen event, capital investment, or management action
- 5.5 Knowledge capture for organizational learning
- 5.6 Recognition of team contributions

#### Appendices
- A: Raw data tables (baseline and post-implementation)
- B: Photographs / visual evidence (before and after)
- C: Meeting minutes from cycle reviews
- D: Updated standard operating procedures (if applicable)
- E: Control plan for sustaining improvement

## Methodology & Standards

### Primary Standards

| Standard | Application |
|----------|-------------|
| **Deming PDCA Cycle** | Core methodology: Plan-Do-Check-Act iterative improvement framework |
| **Toyota A3 Problem Solving** | Documentation and thinking framework for structured problem resolution |
| **ISO 9001:2015 (Clause 10)** | Improvement requirements: nonconformity, corrective action, continual improvement |
| **Six Sigma DMAIC** | Statistical tools for the Check phase: control charts, hypothesis testing, capability analysis |
| **Toyota Kata** | Improvement and coaching patterns: iterative cycles toward target conditions |
| **ISO 55001:2014 (Clause 10.1)** | Continual improvement requirements for asset management systems |
| **Lean A3 Thinking (Shook, 2008)** | Reference methodology for A3 report structure and PDCA logic flow |

### PDCA-DMAIC Alignment Framework

| PDCA Phase | DMAIC Equivalent | Key Tools |
|------------|-----------------|-----------|
| **Plan** | Define + Measure + Analyze | Problem statement, SIPOC, data collection plan, Pareto, Ishikawa, 5-Why, hypothesis testing |
| **Do** | Improve | Pilot implementation, change management, quick wins, training |
| **Check** | Control (verification) | Control charts (X-bar R, I-MR, p-chart), before-after comparison, t-test, capability index |
| **Act** | Control (sustain) | Control plan, SOP updates, visual management, audit schedule, handover |

## Step-by-Step Execution

### Phase 1: Plan -- Problem Definition and Analysis (Steps 1-6)

**Step 1: Formulate Problem Statement**
- Structure the problem using the format: "The [metric] in [area/process] is currently at [baseline value], which is [gap] below the target of [target value], resulting in [business impact in USD or operational terms]."
- Validate that the problem is specific (not vague), measurable (has a KPI), and bounded (clear scope).
- Document the problem owner, team members, and management sponsor.

**Step 2: Establish Baseline with Data**
- Collect minimum 3 months of historical data for the primary metric.
- Create a control chart (I-MR or X-bar R as appropriate) to understand process behavior.
- Determine if the process is in statistical control (only common-cause variation) or out of control (special causes present).
- Document data sources, measurement methods, and any data quality concerns.

**Step 3: Set SMART Improvement Target**
- Define the target using SMART criteria: Specific metric, Measurable value, Achievable (based on benchmark or theoretical limit), Relevant (aligned with business objectives), Time-bound (completion date).
- Validate target against benchmarks (internal best, industry quartile, theoretical).
- Obtain management sponsor approval of the target.

**Step 4: Conduct Root Cause Analysis**
- Build Ishikawa (fishbone) diagram with the team, categorizing potential causes under 6M (Man, Machine, Method, Material, Measurement, Mother Nature/Environment).
- For each significant potential cause, conduct 5-Why analysis to reach the root cause.
- Validate root causes with data (Pareto analysis, correlation analysis, designed experiments if needed).
- Prioritize root causes by impact and evidence strength.

**Step 5: Select Countermeasures**
- For each validated root cause, brainstorm countermeasures with the team.
- Evaluate countermeasures using a selection matrix: effectiveness (1-5), feasibility (1-5), cost (1-5), speed of implementation (1-5).
- Select the countermeasures with the highest composite score.
- Assess risks of each countermeasure (what could go wrong, how to mitigate).

**Step 6: Build Implementation Plan**
- Create a detailed implementation plan with tasks, owners, due dates, and milestones.
- Identify resource requirements (people, materials, budget, equipment downtime).
- Define the measurement plan for the Check phase (what to measure, how often, who, method).
- Schedule review checkpoints (weekly team review, bi-weekly sponsor review).

### Phase 2: Do -- Implementation (Steps 7-9)

**Step 7: Execute Countermeasures**
- Implement countermeasures according to the plan, starting with quick wins where possible.
- Maintain a daily implementation log documenting: actions taken, deviations from plan, issues encountered, and interim results observed.
- Communicate progress to stakeholders per the communication plan.

**Step 8: Manage Deviations and Issues**
- When deviations from plan occur, document the rationale and adjust the plan.
- Escalate blockers to the problem owner or sponsor within 48 hours.
- Capture unexpected findings or side effects for analysis in the Check phase.

**Step 9: Document Quick Wins and Interim Results**
- Record any immediate improvements observed during implementation.
- Take before-and-after photographs or screenshots where applicable.
- Update the team on interim results to maintain momentum and engagement.

### Phase 3: Check -- Verification and Validation (Steps 10-12)

**Step 10: Collect Post-Implementation Data**
- Continue data collection using the same measurement method and frequency as the baseline.
- Collect minimum 4-6 weeks of post-implementation data for sustainability assessment.
- Ensure no other significant changes occurred during the monitoring period that could confound results.

**Step 11: Perform Statistical Validation**
- Create a before-and-after control chart showing the process shift.
- Conduct a hypothesis test (t-test for means, F-test for variance) to confirm statistical significance of the improvement.
- Calculate the improvement percentage: ((Post - Pre) / Pre) x 100.
- Assess process capability if applicable (Cp, Cpk improvement).
- Document whether the improvement target was fully met, partially met, or not met.

**Step 12: Assess Sustainability and Side Effects**
- Review the trend of post-implementation data: is the improvement holding or decaying?
- Check for negative side effects on other KPIs (e.g., improving speed at the cost of quality).
- Interview operators and technicians: are the new methods practical and sustainable?
- Document all lessons learned during the cycle.

### Phase 4: Act -- Standardize or Iterate (Steps 13-16)

**Step 13: Make the Act Decision**
- If target fully met and sustained: proceed to Standardize (Step 14).
- If target partially met (>50% of gap closed): proceed to Iterate (Step 15) with refined plan.
- If target not met (<50% of gap closed) after 2 cycles: proceed to Escalate (Step 16).

**Step 14: Standardize Successful Improvements**
- Update relevant SOPs and work instructions to incorporate the new methods.
- Create a control plan defining: what to monitor, frequency, method, response if out-of-control.
- Train all affected personnel on the new standard methods.
- Implement visual management (dashboards, standard work displays) to sustain the improvement.
- Schedule a sustainability audit at 30, 60, and 90 days post-standardization.

**Step 15: Iterate with Next PDCA Cycle**
- Update the problem statement with new understanding from the completed cycle.
- Refine root causes based on Check phase findings.
- Design new or adjusted countermeasures targeting remaining gap.
- Launch the next cycle with updated baseline (post-improvement level).

**Step 16: Escalate When PDCA is Insufficient**
- Document the recommendation: Kaizen event (facilitate-lean-kaizen-event), capital project, or management intervention.
- Prepare the escalation brief: problem history, cycles completed, results achieved, remaining gap, recommended path.
- Submit to the CI portfolio manager and management sponsor for decision.

## Quality Criteria

### Content Quality (Target: >91% SME Approval)

| Criterion | Weight | Description |
|-----------|--------|-------------|
| Technical Accuracy | 25% | Baseline data correct, calculations verified, RCA supported by evidence |
| Completeness | 20% | All four PDCA phases documented with required detail per section structure |
| Statistical Rigor | 20% | Control charts correctly constructed, hypothesis tests appropriate, conclusions valid |
| Actionability | 15% | Countermeasures are specific, feasible, and assigned to named owners with dates |
| Traceability | 10% | Every conclusion linked to data; every countermeasure linked to a root cause |
| Format & Clarity | 10% | A3 summary is clear and visual; supporting detail is well-organized |

### Automated Quality Checks
- [ ] Problem statement follows the structured format (What / Where / When / Magnitude)
- [ ] Baseline metrics include minimum 3 months of data with source documented
- [ ] Improvement target is SMART format with all five elements explicit
- [ ] Root cause analysis includes both Ishikawa diagram and 5-Why for top causes
- [ ] Each root cause has supporting evidence (data, observation, or expert validation)
- [ ] Every countermeasure is linked to a specific root cause (traceability matrix)
- [ ] Implementation plan has tasks, owners, dates, and milestones defined
- [ ] Check phase includes control chart with pre and post data plotted
- [ ] Statistical test is appropriate for the data type (continuous vs. attribute)
- [ ] Post-implementation monitoring period is minimum 4 weeks
- [ ] Act decision is documented with clear rationale (standardize / iterate / escalate)
- [ ] A3 summary report is complete and fits the single-page logic flow

## MCP Integrations

| MCP Server | Usage in This Skill |
|------------|-------------------|
| **mcp-sharepoint** | Store PDCA packages in project CI folder; retrieve lessons learned from previous cycles; version control of A3 reports |
| **project-database** | Track CI portfolio: cycle ID, problem, owner, status, target, actual result, next action; generate CI dashboard |
| **mcp-cmms** | Pull equipment failure data and maintenance history for equipment-related improvement cycles |
| **mcp-powerbi** | Retrieve KPI data for baseline and Check phase; publish improvement trend dashboards |
| **mcp-outlook** | Send cycle status updates to sponsor and stakeholders; distribute completed A3 reports |

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs From)

| Agent / Skill | Input Provided | Criticality |
|---------------|---------------|-------------|
| `calculate-operational-kpis` (Operations) | KPI baseline data, trend data, gap identification, bad actor lists | Critical |
| `analyze-failure-patterns` (Asset Management) | Equipment failure patterns, MTBF/MTTR data, repeat failure identification | High |
| `track-incident-learnings` (HSE) | Safety incident root causes, near-miss trends requiring improvement | High |
| `benchmark-maintenance-kpis` (Asset Management) | Industry benchmark targets for setting improvement goals | Medium |
| `generate-performance-report` (Operations) | Performance gap summaries that trigger improvement cycles | Medium |
| `orchestrate-or-program` (Orchestrator) | Strategic improvement priorities and resource allocation | Medium |

### Downstream Dependencies (Outputs To)

| Agent / Skill | Output Provided | Trigger |
|---------------|----------------|---------|
| `orchestrate-or-program` (Orchestrator) | Completed A3 reports, CI portfolio status updates, escalation recommendations | Each cycle completion |
| `create-operations-manual` (Operations) | Updated SOPs and work instructions when improvements are standardized | Act-Standardize phase |
| `generate-operating-procedures` (Operations) | Revised procedures incorporating validated countermeasures | Act-Standardize phase |
| `facilitate-lean-kaizen-event` (Operations) | Escalation brief when PDCA cycles insufficient; pre-Kaizen baseline data | Escalation trigger |
| `calculate-operational-kpis` (Operations) | Updated targets and new KPIs from improvement standardization | Post-standardization |
| `plan-training-program` (Operations) | Training requirements for new standard methods | Act-Standardize phase |

### Collaboration During Execution

| Agent / Skill | Collaboration Type | When |
|---------------|-------------------|------|
| `asset-management` agent | Joint RCA for equipment-related problems; maintenance data analysis | Plan phase -- RCA |
| `hse` agent | Safety review of countermeasures; HSE impact assessment | Plan phase -- countermeasure selection |
| `contracts-compliance` agent | Procurement support for materials/services needed for countermeasures | Do phase -- implementation |
| `facilitate-lean-kaizen-event` (Operations) | Handoff when problem requires intensive team-based event | Act phase -- escalation |

## Templates & References

### Document Templates
- `VSC_A3_Report_Template_v1.0.docx` -- Standard A3 problem-solving report template
- `VSC_PDCA_Cycle_Package_Template_v1.0.docx` -- Full PDCA documentation package template
- `VSC_RCA_Ishikawa_Template_v1.0.xlsx` -- Fishbone diagram template with 6M categories
- `VSC_Countermeasure_Matrix_Template_v1.0.xlsx` -- Countermeasure evaluation and tracking matrix
- `VSC_Control_Plan_Template_v1.0.xlsx` -- Post-improvement control plan template

### Reference Documents
- Shook, J. "Managing to Learn: Using the A3 Management Process" (Lean Enterprise Institute, 2008)
- Rother, M. "Toyota Kata: Managing People for Improvement" (McGraw-Hill, 2009)
- ISO 9001:2015 Section 10 -- Improvement (Nonconformity, Corrective Action, Continual Improvement)
- Deming, W.E. "Out of the Crisis" (MIT Press, 1986) -- Original PDCA framework
- Wheeler, D.J. "Understanding Variation" (SPC Press, 2000) -- Control chart methodology
- SMRP Best Practice 5th Edition -- Maintenance improvement benchmarks
- VSC Knowledge Base: `methodology/or-concepts/continuous-improvement.md`

## Examples

### Example 1: PDCA Cycle -- Reducing Reactive Maintenance in Grinding Circuit

**Problem Statement:**
"El porcentaje de mantenimiento reactivo en el circuito de molienda (Planta Concentradora Sierra Verde) es actualmente 38%, lo cual es 23 puntos porcentuales sobre la meta de 15%. Esto resulta en un costo adicional estimado de USD 1.2M anuales en mano de obra de emergencia, repuestos express, y produccion perdida."

**A3 Summary Data:**

| Campo | Detalle |
|-------|---------|
| Ciclo ID | PDCA-SV-2026-007 |
| Propietario | Jefe de Mantenimiento Planta |
| Sponsor | Gerente de Operaciones |
| Equipo | 2 planificadores, 1 supervisor mecanico, 1 operador senior, 1 confiabilista |
| Fecha Inicio | 2026-01-15 |
| Fecha Objetivo | 2026-04-15 (3 meses) |

**Baseline Data (Oct-Dic 2025):**

| Mes | Total OT | OT Reactivas | % Reactivo | Meta |
|-----|----------|-------------|-----------|------|
| Oct 2025 | 342 | 128 | 37.4% | 15% |
| Nov 2025 | 358 | 140 | 39.1% | 15% |
| Dic 2025 | 331 | 125 | 37.8% | 15% |
| **Promedio** | **344** | **131** | **38.1%** | **15%** |

**Root Cause Analysis (Top 3 by Pareto):**

| Causa Raiz | % Contribucion | Evidencia | Contramedida |
|------------|---------------|-----------|--------------|
| Falta de PM en correas transportadoras (sin plan preventivo para rodillos, polines, raspadores) | 35% | 47 OT emergencia en 3 meses por fallas en correas | Implementar plan PM semanal con ruta de inspeccion y reemplazo preventivo de componentes criticos |
| Bombas de pulpa sin monitoreo de condicion (operan a la falla) | 28% | 36 OT emergencia por fallas de bomba; MTBF = 45 dias | Instalar monitoreo vibracion en 6 bombas criticas; definir limites de alarma y accion |
| Repuestos criticos sin stock minimo definido | 18% | 22 OT con espera >48 hrs por repuesto; 8 paradas extendidas | Definir stock minimo para 15 items criticos; configurar punto de reorden en SAP MM |

**Check Phase Results (Post-Implementacion, Mar 2026):**

| Mes | Total OT | OT Reactivas | % Reactivo | Variacion vs. Baseline |
|-----|----------|-------------|-----------|----------------------|
| Feb 2026 | 355 | 92 | 25.9% | -12.2 pp |
| Mar 2026 | 348 | 78 | 22.4% | -15.7 pp |
| **Meta Ciclo 1** | | | **25%** | **(parcialmente logrado)** |

**Act Decision:** Iterar -- se logro reduccion de 38% a 24% (14 pp), meta parcial de 25% alcanzada. Iniciar Ciclo 2 enfocado en las causas restantes (procedimientos de operacion que generan desgaste prematuro, capacitacion de operadores en deteccion temprana).

### Example 2: Countermeasure Selection Matrix

| ID | Causa Raiz | Contramedida | Efectividad (1-5) | Factibilidad (1-5) | Costo (1-5) | Velocidad (1-5) | Score Total | Prioridad |
|----|------------|-------------|-------------------|-------------------|------------|----------------|------------|-----------|
| CM-01 | PM insuficiente en correas | Plan PM semanal con ruta de inspeccion | 5 | 4 | 5 | 4 | 18 | 1 |
| CM-02 | Sin monitoreo de condicion en bombas | Instalar vibracion en 6 bombas | 4 | 3 | 3 | 3 | 13 | 2 |
| CM-03 | Stock repuestos sin definir | Configurar min/max SAP MM | 4 | 4 | 4 | 3 | 15 | 2 |
| CM-04 | Operacion fuera de parametros | Capacitacion operadores | 3 | 4 | 5 | 3 | 15 | 3 |
| CM-05 | Sin analisis de falla sistematico | Implementar RCA para fallas >4 hrs | 4 | 3 | 5 | 2 | 14 | 3 |

### Example 3: Control Chart Decision Logic

```
Control Chart Assessment:
- Baseline (3 months): X-bar = 38.1%, UCL = 42.3%, LCL = 33.9%
- Process was IN CONTROL (only common-cause variation) during baseline
- Post-implementation (2 months): X-bar = 24.2%, UCL = 28.8%, LCL = 19.6%
- Shift detected: 8 consecutive points below baseline centerline (Rule 1 violation = signal)
- t-test: t = 4.87, p < 0.001 (statistically significant improvement confirmed)
- Conclusion: Genuine process shift, not random variation
- Sustainability: Trend is stable (no upward drift in post-implementation period)
```
