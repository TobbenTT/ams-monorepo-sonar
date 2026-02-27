# REF-15: Defect Elimination Procedure — GFSN01-DD-EM-0000-PT-00005

## Source: Procedimiento Eliminación de Eventos no deseados (39 pages, Rev.C, Jun 2021)

---

## 1. Objective & Scope

The Defect Elimination (DE) process is a fundamental tool to increase reliability, profitability, and asset management effectiveness. Its purpose is to reduce recurrence of undesired events and/or mitigate their consequences on physical assets and process deviations to tolerable levels for MGFSN.

**Standards Referenced:** UNE-EN 62740:2015, IEC 62740:2015 (RCA), ISO 31000:2018, IEC 31010:2019, ISO Guide 73:2009.

---

## 2. Process Flow (5 Stages)

```
1. IDENTIFY → KPIs, statistics, deviation analysis
   ↓
2. PRIORITIZE → Cost-Benefit × Implementation Difficulty matrix
   ↓
3. ANALYZE → 5W+2H (simple) or RCA Cause-Effect (complex)
   ↓
4. IMPLEMENT → Prioritized solutions with cost-benefit evaluation
   ↓
5. CONTROL → KPI monitoring, recurrence measurement, savings tracking
```

---

## 3. Stage 1: Identify

### 3.1 Identification Sources
- **Availability:** Planned + unplanned downtime summation
- **HSE Statistics:** Health, Safety & Environment indicators for maintenance activities
- **Maintenance Costs:** SAP cost history segregated by labor, materials, equipment, tools — excess cost indicates deficient/ineffective maintenance plans
- **Work Order Feedback:** WO history for MTTR and MTBF analysis to identify highest-impact equipment/components

### 3.2 Deviation Evaluation
Each identified deviation must be:
- Described clearly
- Quantified in terms of impact (to prove resolution will deliver significant savings or improve HSE indices)
- Documented using the "EvaluacionDesviaciones" worksheet in the "Matriz Jerarquización Eventos" model

---

## 4. Stage 2: Prioritize

### 4.1 Two-Variable Prioritization Matrix

**Variable 1 — Relevance in Maintenance Management (Cost-Benefit):**
| Level | Description |
|-------|-------------|
| **High (H)** | High cost reduction opportunity or significant HSE risk mitigation |
| **Medium (M)** | Moderate cost/HSE benefit |
| **Low (L)** | Low cost/HSE impact |

**Variable 2 — Implementation Difficulty:**
| Level | Description |
|-------|-------------|
| **LL** | Very low time, cost, and effort |
| **LH** | Low difficulty |
| **M** | Medium difficulty |
| **HL** | High difficulty |
| **HH** | Very high time, cost, and effort |

### 4.2 Prioritization Matrix Result
- **Quadrant 1** (High benefit, Low difficulty): Immediate action — highest priority
- **Quadrant 2** (High benefit, High difficulty): Plan and resource carefully
- **Quadrant 3** (Low benefit, Low difficulty): Quick wins when capacity allows
- **Quadrant 4** (Low benefit, High difficulty): Lowest priority — defer or reject

---

## 5. Stage 3: Analyze

### 5.1 Methodology Selection by Complexity

| Complexity | Method | When to Use |
|-----------|--------|-------------|
| **Low** | 5W+2H | Simple, single-cause events with clear resolution path |
| **Medium/High** | RCA Cause-Effect (Ishikawa) | Multi-causal events classified as Level 2 or 3 in risk matrix |

### 5.2 The 5W+2H Method (7 Questions)
1. **What?** — What is happening? What must be done? Impact level?
2. **When?** — When does the problem occur? When will action be taken?
3. **Where?** — Where is the problem seen? Where will the solution be implemented?
4. **Who?** — Is the problem related to human skills/training? Who is responsible?
5. **Why?** — Why does the problem occur? Why must the proposed action be taken?
6. **How?** — How does the problem manifest? Is the pattern random or systematic?
7. **How much?** — Quantify events, magnitude of deviation, and cost of solution

### 5.3 RCA Input Sources
- High-severity incidents affecting safety, environment, or operational continuity
- Indicator trends showing undesired behavior of control variables
- Cumulative failure incident analysis (Pareto) affecting operations or generating high costs
- Recommendations from stakeholder groups for asset performance improvement

### 5.4 The 5P's Evidence Collection Framework

| P | Category | Description | Fragility Scale |
|---|----------|-------------|----------------|
| **Parts** | Physical evidence | Fluids, metals, air/gas samples, asset parts | 2 |
| **Position** | Spatial & temporal | Physical position of failure + temporal position (photos, trends, timestamps) | 1 (most fragile) |
| **People** | Witnesses & experts | Direct witnesses → first observers → area supervisors → external experts | 1 (most fragile) |
| **Papers** | Documentation | Process statistics, inspection reports, control system data, NDT results, maintenance history, procedures, permits, specifications | 3 |
| **Paradigms** | Cultural biases | "We've always done it this way," resistance to change — managed by facilitator | 4 (least fragile) |

**Fragility Scale:** 1 = most perishable (collect immediately) → 4 = most persistent

### 5.5 RCA Cause-Effect Diagram Methodology

**Step 1:** For each Primary Effect, ask "Why?" — trace backwards through facts and causes
**Step 2:** Classify causes into Actions and Conditions — never discard ideas at this stage; each effect must have at least one action-cause and one condition-cause
**Step 3:** Connect all causes and effects with "Caused By" — ensures temporal/spatial alignment
**Step 4:** Support all causes with evidence — if evidence insufficient, mark as hypothesis (?) and create verification actions with responsible parties and target dates
**Step 5:** Verify root causes hierarchically through three levels:

### 5.6 Three Levels of Root Cause

| Level | Name | Description | Frequency as "sole cause" |
|-------|------|-------------|--------------------------|
| **Physical** | Causa Raíz Física | Failure mechanism attributable to machine components, materials, or tangible elements | Least common alone |
| **Human** | Causa Raíz Humana | Failure or early degradation due to inappropriate human intervention | More common than physical |
| **Latent** | Causa Raíz Latente | Deficiency in management systems (rules, procedures, policies) or cultural norms | Most common — triggers human/physical causes |

**Critical Rule:** The diagram must NOT stop until for each physical root cause, the human root cause AND the latent root cause have been identified.

### 5.7 Evidence Classification
- **Inferred evidence:** Derived from known, repeatable causal relationships ✓ Accepted
- **Sensory evidence:** Can be smelled, tasted, touched, seen, heard (photos, records, interviews) ✓ Accepted
- **Emotional evidence:** Feelings are never effective evidence, but may provide clues ✗ Not accepted
- **Intuitive evidence:** Combines reasoning with subconscious feelings ✗ Not reliable

---

## 6. Stage 4: Implement

### 6.1 Solution Effectiveness Filter (5 Questions)
For each proposed solution, the investigation team must verify:
1. Does eliminating this cause eliminate the primary effect?
2. Does the solution prevent recurrence?
3. Does the solution comply with company goals and objectives?
4. Is implementation under the company's control (or achievable)?
5. Does the solution NOT create additional problems?

### 6.2 Solution Resource Estimation
Each solution requires detailed approximation of:
- Redesign, services, personnel, materials, equipment, estimated time
- Implementation cost (using "costos recomendaciones" worksheet)
- Cost-benefit analysis (using "evaluación recomendaciones" worksheet)

### 6.3 Solution Prioritization Matrix

**Variable 1 — Cost-Benefit of Implementation:**
- Relates solution cost to the opportunity of eliminating event recurrence and current risk scenario

**Variable 2 — Implementation Difficulty:**
- Evaluated by: time required, degree of specialization, implementation cost

**Priority Quadrants:**
| Quadrant | Characteristic | Priority |
|----------|---------------|----------|
| Q1 | High effectiveness, Low difficulty | Highest — do first |
| Q2 | High effectiveness, High difficulty | Second — plan carefully |
| Q3 | Low effectiveness, Low difficulty | Third — quick wins |
| Q4 | Low effectiveness, High difficulty | Lowest — defer |

**Key Insight:** Causes found toward the RIGHT of the diagram → solutions are more economical and effective (may eliminate multiple chained causes). Causes toward the LEFT → more controllable but generally more costly.

---

## 7. Stage 5: Control

### 7.1 Success Measurement Examples
- Corrective maintenance reduction → histogram of maintenance costs showing budget deviation decrease
- Plant availability increase → Pareto analysis showing reduction in undesired maintenance events
- HSE improvement → reduction in maintenance defects, downtime, LTIR, and TRIR
- Productivity increase → reduction in asset downtime or production yield increase
- Environmental incident reduction

### 7.2 KPI Framework (5 Indicators)

| # | Indicator | Formula | Frequency | Target | Owner |
|---|-----------|---------|-----------|--------|-------|
| 1 | **Event Reporting Compliance** | Reported events / Events that should have been reported × 100 | Weekly | 100% | Reliability Engineer |
| 2 | **RCA Meeting Compliance** | Meetings held / Meetings scheduled × 100 | Weekly | 100% | Reliability Engineer |
| 3 | **Solution Implementation Progress** | Actual progress − Expected progress | Monthly | ±5% | Reliability Engineer |
| 4 | **Savings from Solution Effectiveness** | Failure costs before RCA − Costs after prevention/mitigation | Quarterly | Per event | Reliability Engineer |
| 5 | **Event Frequency Reduction** | 1 − (Incidents after analysis / Incidents before analysis) × 100 | Quarterly | Per event | Reliability Engineer |

---

## 8. Roles & Responsibilities

### 8.1 Maintenance Superintendent
- Ensure human and financial resources for defect resolution
- Approve Level 2 RCA results; participate in Level 3 RCA
- Monitor DE process effectiveness within areas of responsibility
- Participate in monthly KPI evaluation meetings

### 8.2 RCA Process Leader — Reliability Professional (Confiabilidad)
- Functional administration of DE process and RCA methodology
- Evaluate DE effectiveness through monthly KPI reports
- Track solution implementation with facilitator and area responsible
- Develop and disseminate lessons learned from RCA
- Identify and prioritize chronic (recurring) events and bad actors
- Convene periodic review meetings; conduct methodology refresher training

### 8.3 Investigation Responsible (Area Leader)
- Approve preliminary event background report
- Approve investigation team members
- Participate in root cause determination meetings
- Approve technical and economic justification of solutions
- Monitor effectiveness of implemented solutions

### 8.4 Salares Norte Professional (Event Reporter)
- Ensure all undesired events are reported using preliminary event format
- Ensure equipment failures are reported in SAP PM module
- Facilitate improvement recommendation execution in their area
- Implement effective solutions on schedule

### 8.5 Investigation Team (Multidisciplinary)
- Investigate causes following RCA methodology and Cause-Effect diagram
- Collect evidence supporting actions and conditions
- Propose and evaluate effective solution alternatives
- Support implementation plan execution

### 8.6 RCA Facilitator
- Ensure functional compliance with RCA methodology
- Verify preliminary event report exists and share with team
- Track actions assigned to team members
- Accompany team through analysis completion and closure
- Document analysis evolution; establish meeting schedules
- Evaluate process effectiveness with DE process leader through KPI tracking

---

## 9. Annexes (Reference Models)

| Annex | Document | Content |
|-------|----------|---------|
| A | Modelo_RCA_MGFSN.xlsx | RCA model with: Preliminary event report, Cause-Effect diagram, Hypothesis verification, Failure report, Recommendations costing, Implementation prioritization |
| B | Matriz Jerarquización Eventos.xls | Event prioritization matrix with: Deviation evaluation worksheet, 5W+2H worksheet |
| C | Visio — Proceso Eliminación de Falla | Process flow diagram (Visio format) |
| D | Visio — Proceso RCA MGFSN.pdf | RCA methodology flow diagram (PDF) |

---

## 10. Key Differences from Current System Implementation

| Aspect | GFSN Procedure | Current System |
|--------|----------------|----------------|
| RCA depth | 3-level root cause (Physical → Human → Latent) mandatory | CAPA engine tracks corrective/preventive actions but doesn't enforce 3-level RCA |
| Evidence framework | 5P's with fragility scale | Not implemented |
| Prioritization | 2D matrix (Benefit × Difficulty) with 4 quadrants | Basic priority engine with additive scoring |
| Solution validation | 5-question effectiveness filter | Not implemented |
| KPI tracking | 5 DE-specific KPIs with weekly/monthly/quarterly frequency | General KPIs in kpi_engine.py, no DE-specific indicators |
| Event classification | Risk matrix determines RCA Level (1-3) | Not implemented — all events treated similarly |
