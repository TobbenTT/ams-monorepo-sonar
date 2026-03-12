---
name: model-staffing-requirements
description: "Model staffing requirements based on operational needs, shift patterns, and competency requirements. Triggers: 'staffing model', 'headcount model', 'modelo de dotacion'."
---

# Model Staffing Requirements

## Skill ID: M-01
## Version: 1.0.0
## Category: M. Workforce Readiness (Agent 5)
## Priority: P1 - Critical

---

## Purpose

Model the Full-Time Equivalent (FTE) staffing requirements for industrial operations based on operational parameters, workload analysis, shift pattern modeling, and labor regulatory constraints. This skill translates the outputs of maintenance strategy, operating model design, and support function planning into a quantified, justified, and timeline-sequenced staffing plan that answers the fundamental question: "How many people, with what skills, do we need, and when?"

Staffing modeling is the critical bridge between operational planning and workforce execution. Getting it wrong has severe consequences in both directions:

- **Understaffing** leads to excessive overtime, fatigue-related safety incidents, low PM compliance, production losses, and accelerated employee turnover. In mining, understaffing maintenance by 15-20% typically results in a 30-40% increase in reactive work (Pain Point D-05, Deloitte Project OR Study 2022), creating a vicious cycle of declining reliability and increasing workload.
- **Overstaffing** wastes $80,000-$150,000+ per excess FTE annually (fully loaded cost in Chilean mining), reduces productivity metrics, creates organizational complexity, and makes future cost reduction painful.
- **Late staffing** is the most common failure mode: 70% of operational readiness programs identify staffing and recruitment as a top-5 risk, and 40% report that staffing delays directly impacted commissioning timelines (Pain Point PE-01, IPA Benchmarking Database). In remote mining locations (Atacama, Antofagasta), recruitment lead times for specialized roles can exceed 12-18 months.

The modeling challenge is multi-dimensional. Staffing requirements depend on:
- **Operating model decisions**: Continuous 24/7 vs. 5x2 operations, owner-operate vs. contractor model, centralized vs. distributed maintenance
- **Maintenance strategy outputs**: Total annual maintenance labor hours by craft, CBM program resource requirements, shutdown/turnaround manning
- **Regulatory constraints**: Chilean labor law shift limitations (Codigo del Trabajo Articles 22-40), fatigue management regulations (DS 594), mandatory rest periods
- **Geographic factors**: Remote site logistics (fly-in/fly-out vs. residential), altitude considerations, commute times
- **Productivity assumptions**: Wrench time (direct productive time as % of shift), absenteeism rates, leave provisions, training time allocation

This skill integrates all these factors into a defensible staffing model that serves as the basis for recruitment planning, training program design, budget allocation, and organizational design.

---

## Intent & Specification

The AI agent MUST understand and execute the following:

1. **Bottom-Up Workload Derivation**: Staffing requirements must be calculated from documented workload, not industry ratios alone. The agent must derive FTE requirements from: maintenance labor hours (from RCM/FMECA), operating activity requirements (shift rounds, process monitoring, quality control), support function workload (planning, supervision, administration), and shutdown/turnaround peak manning needs.

2. **Shift Pattern Modeling**: The agent must model multiple shift pattern scenarios (e.g., 4x3, 7x7, 5x2, 4x4, 2x1) and evaluate each against: regulatory compliance (Chilean labor law), fatigue risk, operational coverage requirements, total FTE impact, and cost. The recommended pattern must be justified quantitatively.

3. **Chilean Labor Law Compliance**: All staffing models MUST comply with Chilean Codigo del Trabajo, specifically:
   - Maximum 45 ordinary hours per week (Art. 22)
   - Exceptional shift systems approved by Direccion del Trabajo (Art. 38)
   - Mandatory rest period requirements (at least 1 day per 7 worked, or equivalent under exceptional regime)
   - Overtime limitations (maximum 2 hours per day, Art. 30-32)
   - Night work provisions and restrictions
   - Annual leave entitlements (15 working days minimum, Art. 67)
   - Fatigue management requirements for mining operations (DS 132, Chapter 6)

4. **Productivity-Adjusted Calculations**: Raw workload hours must be converted to FTE requirements using realistic productivity factors:
   - Wrench time (direct productive time): 25-35% for average, 45-55% for world-class
   - Availability factor: Accounts for leave, training, sickness, and administrative time
   - Supervision ratio: Number of workers per supervisor (typically 8-12:1 for maintenance, 6-10:1 for operations in mining)
   - Contractor ratio: Percentage of work performed by contract vs. permanent staff

5. **Recruitment Timeline Integration**: The staffing model must include a time-phased recruitment plan that accounts for:
   - Lead times by role type: 3-6 months for operators, 6-12 months for technicians, 9-18 months for specialists, 12-24 months for senior management
   - Training lead times: Time from hire to operational competency
   - Regulatory certification lead times: Time to obtain required licenses and certifications
   - Mobilization logistics: FIFO cycle setup, accommodation, transportation

6. **Scenario Modeling**: The agent must produce at minimum three staffing scenarios: conservative (maximum efficiency), base case (realistic assumptions), and contingency (additional buffers for risk). Each scenario must be fully costed.

7. **Language**: Spanish (Latin American) for all deliverables, with English technical terms preserved.

---

## Trigger / Invocation

```
/model-staffing-requirements
```

### Natural Language Triggers
- "Model the staffing requirements for [facility/operation]"
- "How many FTEs do we need for operations and maintenance?"
- "Build a staffing plan based on the maintenance strategy workload"
- "Calculate headcount requirements for the new operation"
- "Modelar requerimientos de dotacion para [planta/operacion]"
- "Calcular FTEs necesarios para operacion y mantenimiento"
- "Cuanta gente necesitamos y cuando la necesitamos?"

### Aliases
- `/staffing-model`
- `/fte-requirements`
- `/workforce-model`

---

## Input Requirements

### Required Inputs

| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `operating_model` | Operating model description: continuous/batch, shift structure, owner-operate vs. contractor, centralized vs. distributed functions | .docx / text | Agent-operations / User |
| `maintenance_workload` | Annual maintenance labor hours by craft (mechanical, electrical, instrumentation, predictive, lubrication), derived from maintenance strategy or PM program | .xlsx | `develop-maintenance-strategy` / `optimize-pm-program` / mcp-cmms |
| `facility_profile` | Facility description: type, capacity, number of process areas, equipment count, geographic location, altitude, remoteness | .docx / text | User / mcp-sharepoint |
| `industry_sector` | Primary industry (Mining, Oil & Gas, Power, Chemical, Water) for benchmark selection | Text | User |

### Optional Inputs (Strongly Recommended)

| Input | Description | Default if Absent |
|-------|-------------|-------------------|
| `equipment_register` | Equipment list with types and counts for workload validation | Workload derived from maintenance strategy only |
| `operating_procedures_count` | Number and complexity of SOPs to staff for | Industry-typical ratio: 1 operator per 20-30 equipment items |
| `shutdown_plan` | Planned shutdown scope and frequency for peak manning calculation | Annual shutdown assumed; 2x normal maintenance manning |
| `labor_market_assessment` | Local labor availability, salary benchmarking, recruitment challenges | Chilean mining/industrial market averages applied |
| `existing_organization` | Current staffing (for brownfield) with performance data | Greenfield (clean-sheet design) assumed |
| `contractor_strategy` | Planned contractor scope and ratios | 30% contract labor for maintenance, 10% for operations |
| `budget_constraints` | Target cost-per-tonne or maintenance cost as % of RAV | Unconstrained; model reports total cost |
| `fatigue_risk_assessment` | Fatigue risk management plan requirements | DS 132 minimum requirements applied |
| `accommodation_capacity` | Available camp/accommodation beds (for remote sites) | No accommodation constraint assumed |
| `shift_preferences` | Preferred shift patterns or constraints (union agreements, client mandates) | All Chilean-legal patterns evaluated |
| `support_function_scope` | Scope of on-site support functions (planning, warehouse, admin, HSE, training) | Standard support function ratios applied |

### Context Enrichment (Automatic)

The agent will automatically:
- Retrieve Chilean labor law requirements (Codigo del Trabajo) for shift pattern compliance
- Access SERNAGEOMIN DS 132 fatigue management requirements for mining
- Pull industry staffing benchmarks from SMRP, IPA, and VSC internal database
- Retrieve current Chilean salary benchmarks by role and region (Antofagasta, Atacama, etc.)
- Access recruitment lead time data from VSC project history
- Retrieve wrench time and availability factor benchmarks by industry
- Pull shift pattern templates pre-validated for Chilean labor law compliance

---

## Output Specification

### Deliverable 1: Staffing Requirements Report (.docx)

**Filename**: `{ProjectCode}_Staffing_Model_v{Version}_{YYYYMMDD}.docx`

**Target Length**: 35-60 pages

**Structure**:

1. **Cover Page** -- VSC branding, project identification, model version
2. **Document Control** -- Revision history, review and approval
3. **Executive Summary** (3-4 pages)
   - Total FTE requirement (base case) with breakdown by function
   - Shift pattern recommendation with rationale
   - Annual fully-loaded labor cost estimate
   - Key staffing risks and mitigation strategies
   - Recruitment timeline critical path
   - Comparison with industry benchmarks
4. **Scope & Methodology** (3-4 pages)
   - Facilities and operations in scope
   - Workload derivation methodology (bottom-up from maintenance strategy + operations model)
   - Productivity assumptions and justifications
   - Shift pattern modeling approach
   - Labor law compliance framework
5. **Operating Model Summary** (3-5 pages)
   - Operating philosophy and mode (24/7 continuous, 5x2, campaign)
   - Organizational structure (centralized, area-based, hybrid)
   - Owner-operate vs. contractor scope split
   - Key operating parameters affecting staffing
6. **Workload Analysis** (5-8 pages)
   - 6.1 Maintenance workload by craft
     - Mechanical: annual hours, major task categories, peak loading
     - Electrical: annual hours, major task categories
     - Instrumentation/Control: annual hours, calibration and CBM activities
     - Predictive maintenance: annual hours by technology
     - Lubrication: annual hours, route-based workload
   - 6.2 Operations workload
     - Shift operations: control room, field rounds, process monitoring, quality control
     - Non-shift operations: day-shift support, technical support, optimization
   - 6.3 Support function workload
     - Maintenance planning and scheduling
     - Warehouse and materials management
     - HSE coordination
     - Training and competency management
     - Administration and clerical
   - 6.4 Supervision and management workload
7. **Shift Pattern Analysis** (5-8 pages)
   - 7.1 Shift patterns evaluated (minimum 3 patterns)
   - 7.2 Pattern-by-pattern analysis:
     - Schedule visualization (calendar view)
     - Hours worked per cycle
     - Chilean labor law compliance verification
     - Fatigue risk assessment (hours, night shifts, recovery time)
     - FTE impact (crews required, total headcount)
     - Cost impact (base salary, overtime, shift premiums)
   - 7.3 Recommended pattern with justification
   - 7.4 Sensitivity analysis: FTE impact of pattern change
8. **FTE Model Results** (8-12 pages)
   - 8.1 Base case staffing model (detailed FTE breakdown)
   - 8.2 Conservative scenario (efficiency-optimized)
   - 8.3 Contingency scenario (risk-buffered)
   - 8.4 Staffing by function and level:
     - Operations: Shift supervisors, control room operators, field operators, process technicians
     - Maintenance: Superintendent, supervisors, planners, schedulers, mechanical fitters, electricians, instrument technicians, predictive technicians, lubrication technicians
     - HSE: Manager, coordinators, specialists, paramedics
     - Support: Warehouse, admin, training, IT
     - Management: Plant manager, area managers, reliability engineers
   - 8.5 Permanent vs. contractor FTE split
   - 8.6 Shutdown/turnaround additional manning requirements
   - 8.7 FTE reconciliation with workload (hours available vs. hours required)
9. **Recruitment Plan** (3-5 pages)
   - 9.1 Time-phased recruitment timeline (month-by-month)
   - 9.2 Critical path roles (longest lead time, hardest to fill)
   - 9.3 Recruitment source strategy (local, national, international)
   - 9.4 Training pipeline requirements (time from hire to competency)
   - 9.5 Mobilization plan for FIFO workers
10. **Cost Model** (3-5 pages)
    - 10.1 Fully-loaded cost per FTE by role category
    - 10.2 Total annual labor cost by function
    - 10.3 Cost comparison across scenarios
    - 10.4 Sensitivity analysis: cost impact of key assumption changes
    - 10.5 Benchmark comparison: cost per tonne, maintenance cost % RAV
11. **Risks & Assumptions** (2-3 pages)
    - Key assumptions register with sensitivity impact
    - Staffing risks (labor market, retention, training timeline)
    - Mitigation strategies for top risks
12. **Appendices**
    - A: Detailed workload calculations by craft
    - B: Shift pattern compliance certificates (labor law)
    - C: Salary benchmark data sources
    - D: Recruitment lead time assumptions by role

### Deliverable 2: FTE Model Workbook (.xlsx)

**Filename**: `{ProjectCode}_FTE_Model_v{Version}_{YYYYMMDD}.xlsx`

**Sheets**: Workload Summary, Operations FTE, Maintenance FTE, Support Functions FTE, Shift Pattern Analysis, Productivity Assumptions, Cost Model, Recruitment Timeline, Scenario Comparison, Sensitivity Analysis, Benchmark Comparison

### Deliverable 3: Recruitment Timeline (.xlsx / Gantt)

**Filename**: `{ProjectCode}_Recruitment_Timeline_v{Version}_{YYYYMMDD}.xlsx`

Role-by-role recruitment Gantt chart showing: position opening date, recruitment period, offer/acceptance, training period, operational readiness date, aligned with project commissioning timeline.

---

## Methodology & Standards

### Primary Standards and References

| Standard / Reference | Application |
|---------------------|-------------|
| **Codigo del Trabajo (Chile)** | Labor law compliance for shift patterns, working hours, rest periods, overtime, annual leave |
| **DS 132 (SERNAGEOMIN)** | Mining-specific safety requirements including fatigue management, shift limitations |
| **DS 594 (MINSAL)** | Workplace environmental conditions, exposure limits affecting staffing (heat, altitude, noise) |
| **SMRP Best Practice 5.2** | Maintenance workforce planning metrics and benchmarks |
| **IPA Benchmarking** | Capital project staffing benchmarks for operational readiness |
| **ISO 55001** | Asset management requirements for workforce competency |

### Workload-to-FTE Conversion Methodology

```
For each craft/function:

1. Determine Annual Workload (hours):
   Annual_Workload = Sum of all task hours (from maintenance strategy, operating model,
                     or activity analysis)

2. Calculate Available Hours per FTE per Year:
   Gross_Hours = Weeks_per_year x Hours_per_week (per shift pattern)

   Deductions:
   - Annual Leave: 15 working days (Chilean minimum) + seniority bonus
   - Public Holidays: 16 days (Chilean calendar)
   - Sick Leave: 3-5% of gross hours (industry average)
   - Training Time: 40-80 hours per year (regulatory + development)
   - Administrative Time: 5-10% of gross hours
   - Union/Committee Time: 1-2% (where applicable)

   Net_Available_Hours = Gross_Hours - Total_Deductions
   Typical range: 1,700-1,900 hours per year per FTE

3. Apply Productivity Factor (Wrench Time):
   Productive_Hours = Net_Available_Hours x Wrench_Time_Factor

   Wrench Time Benchmarks:
   - World-class: 50-55%
   - Top quartile: 40-50%
   - Average: 25-35%
   - Below average: <25%

   Typical effective productive hours: 500-1,000 per FTE per year

4. Calculate Base FTE Requirement:
   Base_FTE = Annual_Workload / Productive_Hours_per_FTE

5. Apply Crew Factor (for shift operations):
   Shift_FTE = Positions_per_shift x Crew_Factor

   Crew Factor = Depends on shift pattern:
   - 4-crew pattern (continuous): 4.0-4.5 (includes relief)
   - 5-crew pattern (continental): 5.0-5.2
   - Day shift only (5x2): 1.0 (plus leave cover at ~1.1-1.15)

6. Add Supervision Layer:
   Supervisor_FTE = Worker_FTE / Supervision_Ratio

   Supervision Ratios:
   - Maintenance workers: 8-12 workers per supervisor
   - Operations shift: 6-10 operators per shift supervisor
   - Support staff: 10-15 per supervisor/manager

7. Add Planning and Support:
   Planner_FTE = Maintenance_FTE / 20-30 (1 planner per 20-30 maintainers)
   Scheduler_FTE = Maintenance_FTE / 50-75
   Warehouse_FTE = Based on parts volume and system complexity
   HSE_FTE = Total_site_FTE / 50-100

8. Total Site FTE:
   Total = Operations_FTE + Maintenance_FTE + Support_FTE + Management_FTE
```

### Shift Pattern Library (Chilean Legal)

| Pattern | Cycle | Hours/Cycle | Annual Hours | Crews | Legal Basis | Typical Use |
|---------|-------|-------------|-------------|-------|-------------|-------------|
| **4x3** | 4 days on / 3 days off | 48 hrs (4x12) | ~2,256 | 2 | Art. 22 exceptional | Mining, remote |
| **7x7** | 7 days on / 7 days off | 84 hrs (7x12) | ~2,184 | 2 | Art. 38 exceptional | Mining, remote |
| **14x14** | 14 on / 14 off | 168 hrs (14x12) | ~2,184 | 2 | Art. 38 exceptional | Remote mining |
| **10x10** | 10 on / 10 off | 120 hrs (10x12) | ~2,190 | 2 | Art. 38 exceptional | Remote operations |
| **5x2** | 5 days / 2 off | 45 hrs (5x9) | ~2,205 | 1 + relief | Art. 22 ordinary | Urban, office |
| **4x4 Continental** | 4D-4N-4off | 96 hrs per cycle | ~2,080 | 4 | Art. 38 exceptional | Continuous process |
| **4x2 / 4x2** | 4D-2off-4N-4off | Variable | ~1,976 | 4 | Art. 38 exceptional | Continuous process |

### Industry Staffing Benchmarks

| Metric | World-Class | Top Quartile | Median | Bottom Quartile |
|--------|------------|--------------|--------|-----------------|
| Maintenance FTE per $M RAV | 0.8-1.2 | 1.2-1.8 | 1.8-2.5 | >2.5 |
| Maintenance FTE per 100 equipment | 4-6 | 6-10 | 10-15 | >15 |
| Operations FTE per 10,000 tpd (mining) | 3-5 | 5-8 | 8-12 | >12 |
| Planner-to-craftsperson ratio | 1:20-25 | 1:25-30 | 1:30-40 | 1:>40 |
| Supervisor-to-worker ratio | 1:10-12 | 1:8-10 | 1:6-8 | 1:<6 |
| Contractor % of maintenance | 20-30% | 30-40% | 40-50% | >50% |
| Total site O&M FTE per $B CAPEX | 150-250 | 250-400 | 400-600 | >600 |

---

## Step-by-Step Execution

### Phase 1: Workload Derivation (Steps 1-4)
**Step 1: Collect and validate the maintenance workload.**
### Phase 2: Shift Pattern & FTE Modeling (Steps 5-8)
**Step 5: Model shift pattern scenarios.**
### Phase 3: Cost Modeling & Benchmarking (Steps 9-12)
**Step 9: Build the labor cost model.**
### Phase 4: Validation & Delivery (Steps 13-14)
**Step 13: Validate against comparable operations.**

See [`references/skill-detailed-steps.md`](references/skill-detailed-steps.md) for complete detailed execution steps.

## Quality Criteria

### Model Quality (Target: >85% Accuracy vs. Actual Staffing at Steady State)

| Criterion | Weight | Description | Verification Method |
|-----------|--------|-------------|---------------------|
| Workload Basis | 25% | FTE requirements derived from documented workload analysis, not arbitrary ratios | Audit trail from maintenance strategy/operating model to FTE calculation |
| Labor Law Compliance | 20% | All shift patterns and working arrangements comply with Chilean Codigo del Trabajo | Legal review; Direccion del Trabajo precedent check |
| Productivity Realism | 20% | Wrench time and availability assumptions are realistic for the site context, not aspirational | Comparison with similar sites in operation; industry benchmark validation |
| Benchmark Alignment | 15% | Staffing levels are within explainable range of industry benchmarks | Comparison with 3-5 comparable operations |
| Cost Accuracy | 10% | Labor cost model uses current market data and includes all cost components | Market survey validation; cost component completeness check |
| Timeline Feasibility | 10% | Recruitment timeline accounts for realistic lead times given labor market conditions | Recruitment specialist review; historical lead time data |

### Automated Quality Checks

- [ ] Total maintenance hours available (FTEs x productive hours) >= Total maintenance workload
- [ ] Total operations positions cover all required process areas 24/7 (if continuous)
- [ ] Shift pattern hours per week comply with Chilean labor law maximums
- [ ] Rest periods between shifts comply with minimum requirements
- [ ] Supervision ratios are within 1:6 to 1:15 range (flag outliers)
- [ ] Planner-to-craftsperson ratio is within 1:15 to 1:35 range
- [ ] Fully-loaded cost per FTE is within market range for the region
- [ ] Total FTEs fall within +/- 20% of industry benchmark for facility type and size
- [ ] Recruitment start dates precede operational requirement dates by sufficient lead time
- [ ] No role has zero FTEs if the function is in scope
- [ ] Contractor + permanent FTEs = Total FTEs (no gaps)
- [ ] Scenario range (conservative to contingency) spans at least 20% of base case
- [ ] All three scenarios are fully costed (no partial models)
- [ ] Sensitivity analysis covers at least 5 key variables

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs From)

| Agent/Skill | Input Provided | Criticality | MCP Channel |
|-------------|---------------|-------------|-------------|
| Agent 2 (Operations Intelligence) / `agent-operations` | Operating model, shift structure, process area definitions, control room requirements | Critical | mcp-sharepoint |
| Agent 3 (Maintenance Intelligence) / `agent-maintenance` | Annual maintenance labor hours by craft from RCM/FMECA | Critical | mcp-sharepoint |
| `develop-maintenance-strategy` (MAINT-01) | Maintenance workload model, CBM resource requirements, skill requirements | Critical | Internal |
| `optimize-pm-program` (MAINT-02) | Revised maintenance workload after PM optimization | High | Internal |
| `plan-turnaround` (MAINT-05) | Shutdown peak manning requirements | High | Internal |
| Agent 4 (HSE Intelligence) / `agent-hse` | HSE staffing requirements, regulatory HSE role mandates | High | mcp-sharepoint |
| `create-org-design` | Organizational structure framework | Medium | Internal |
| Agent 6 (Finance Intelligence) / `agent-finance` | Budget constraints, labor cost targets | Medium | mcp-sharepoint |

### Downstream Dependencies (Outputs To)

| Agent/Skill | Output Provided | Trigger |
|-------------|----------------|---------|
| `track-competency-matrix` (M-02) | FTE roles and required competencies for competency matrix | Automatic |
| `plan-training-program` (M-04) | Training population and competency requirements | Automatic |
| `capture-expert-knowledge` (M-03) | Critical roles requiring knowledge capture | On request |
| `create-staffing-plan` | Detailed staffing plan document from FTE model | Sequential |
| `model-opex-budget` | Labor cost inputs for O&M budget model | Automatic |
| `create-org-design` | FTE data for organizational chart and RACI | Automatic |
| `orchestrate-or-program` (H-01) | Staffing readiness status for OR gate reviews | Automatic |
| Agent 7 (Procurement Intelligence) / `agent-procurement` | Contractor FTE requirements for procurement | On request |

### MCP Integrations

| MCP Server | Purpose | Operations |
|------------|---------|------------|
| **mcp-sharepoint** | Retrieve operating model documents, organizational baselines, labor market assessments; store staffing deliverables | `GET /documents/{library}`, `POST /documents/{library}`, `GET /lists/{list}` |
| **mcp-excel** | Generate FTE model workbook with formulas, scenario comparisons, sensitivity analysis, and recruitment timeline | `POST /workbooks`, `PUT /sheets/{sheet}`, `GET /workbooks/{id}` |

---

## Examples

See [`references/skill-examples.md`](references/skill-examples.md) for detailed examples.

## Templates & References

See [`references/skill-templates-references.md`](references/skill-templates-references.md) for detailed templates & references.
