---
name: create-rampup-plan
description: "Create production ramp-up plans from first product to commercial operation. Triggers: 'ramp-up plan', 'ramp up', 'plan de escalamiento'."
---

# Create Ramp-Up Plan
## Skill ID: A-RAMPUP-001
## Version: 1.0.0
## Category: A. Document Generation
## Priority: P1 - Critical

## Purpose

Generate a comprehensive production ramp-up and stabilization plan that covers the transition from Start of Production (SOP) Day through to steady-state commercial operations. This skill produces a detailed plan with ramp-up curves, milestone definitions, resource requirements, and performance metrics that guide the organization through the most critical and high-risk period of a new operation's life -- the journey from first production to design capacity.

The ramp-up period is where Operational Readiness is truly tested. Every investment in training, procedures, maintenance systems, and organizational development is validated during ramp-up. A well-structured ramp-up plan sets realistic production targets, anticipates common challenges, provides clear escalation paths for underperformance, and ensures the organization has the support and resources to navigate through learning-curve losses, equipment teething issues, and process optimization challenges. Historically, the ramp-up period accounts for the largest variance in project returns -- projects that ramp up quickly achieve significantly higher NPV than those with extended ramp-up periods.

## Intent & Specification

The AI agent MUST understand the following core goals:

1. **Ramp-Up Curve Design**: The plan must define production ramp-up curves showing planned throughput progression from Day 1 to design capacity. Curves must be realistic, accounting for:
   - Equipment availability during early operation (typically lower than steady state)
   - Operator learning curve (competency builds over time)
   - Process stabilization requirements (recipe optimization, quality tuning)
   - Planned maintenance interventions during ramp-up
   - Seasonal/environmental factors
   - Supply chain maturation

2. **Milestone-Based Progression**: Ramp-up must be structured around clear milestones, not just time. Progression to the next ramp-up level should require demonstrating sustained performance at the current level. Typical milestones:
   - First Feed / First Product
   - 25% Design Capacity (sustained for X days)
   - 50% Design Capacity (sustained for X days)
   - 75% Design Capacity (sustained for X days)
   - 100% Design Capacity (sustained for X days)
   - Design Performance Guarantee (quality + quantity)
   - Steady State Declaration

3. **Stabilization Criteria**: Steady state is not just reaching 100% capacity once -- it is sustaining performance within defined parameters. The plan must define:
   - Throughput stability (e.g., >90% of design for 30 consecutive days)
   - Quality stability (product meets specifications consistently)
   - Equipment availability targets
   - Cost performance targets (operating cost per unit)
   - Safety performance targets

4. **Support Tapering**: During ramp-up, the operation typically has enhanced support (vendor specialists, project team members, additional contractor support). The plan must define when and how this support is tapered as the operation matures, with clear criteria for support reduction decisions.

5. **Troubleshooting & Contingency**: The plan must anticipate common ramp-up challenges and provide contingency strategies for:
   - Equipment failures and teething issues
   - Process bottlenecks
   - Quality issues
   - Staffing shortfalls
   - Supply chain disruptions

## Trigger / Invocation

```
/create-rampup-plan
```

**Aliases**: `/rampup-plan`, `/ramp-up`, `/plan-rampup`, `/plan-estabilizacion`

**Trigger Conditions**:
- Project approaches commissioning/startup phase
- User provides design capacity and startup parameters
- User requests production ramp-up curve development
- Post-TCCC planning is required
- Steady-state transition planning is needed

## Input Requirements

### Mandatory Inputs

| Input | Format | Description |
|-------|--------|-------------|
| Design Capacity Parameters | .xlsx, .docx, text | Design capacity (throughput, production rate), design product quality specifications, design operating parameters. Must include units and time basis (e.g., 120,000 tpd ore processing) |
| Staffing Plan | .xlsx, .docx | Operations staffing plan: positions, current fill rate, training status, shift roster. Must show when staff are available vs. when needed |
| Equipment Readiness Status | .xlsx | Equipment list with commissioning status, known deficiencies, and expected availability. Ideally from `create-commissioning-plan` or `create-asset-register` outputs |

### Optional Inputs (Enhance Quality)

| Input | Format | Description |
|-------|--------|-------------|
| Commissioning Plan / Status | .xlsx, .docx | From `create-commissioning-plan` -- completion status, TCCC criteria, outstanding punch-list items |
| Historical Ramp-Up Data | .xlsx | Ramp-up performance from similar projects (benchmarking data) |
| RAM Analysis Results | .xlsx | Reliability, Availability, Maintainability analysis results for expected equipment availability |
| Maintenance Strategy | .xlsx, .docx | From `create-maintenance-strategy` -- PM schedules that affect ramp-up availability |
| Spare Parts Inventory | .xlsx | From `create-spare-parts-strategy` -- spare parts availability status |
| Vendor Support Agreements | .docx, .xlsx | Vendor technical assistance agreements, warranty terms, performance guarantee conditions |
| Process Design Basis | .docx | Process design parameters, operating envelopes, material balance |
| Market/Offtake Requirements | .docx | Product specifications from offtake agreements, minimum production commitments |
| Budget & Financial Targets | .xlsx | Ramp-up period budget, revenue targets, break-even analysis |
| Environmental Constraints | .docx | Environmental limits that may constrain ramp-up (e.g., discharge limits, emission caps) |
| Seasonal/Climate Data | .xlsx | Weather patterns that affect operations (rain, temperature, wind) |
| Training Status | .xlsx | Current training completion status per role and competency |

### Input Validation Rules

- Design capacity must include clear units and time basis
- Staffing plan must show current vs. required headcount with timeline
- Equipment readiness without commissioning status defaults to "assumed complete"
- Ramp-up plans without historical benchmarks use industry-standard curves as reference
- Plans without RAM data use industry-standard availability assumptions (typically 80-85% for first year)

## Output Specification

### Primary Output 1: Ramp-Up Plan (.docx)

**Filename**: `{ProjectCode}_RampUp_Plan_v{version}_{date}.docx`

**Document Structure (25-40 pages)**:

**1. Executive Summary** (2-3 pages)
- Ramp-up philosophy and approach
- Key milestones and target dates
- Design capacity and steady-state targets
- Critical success factors
- Key risks and mitigations

**2. Introduction & Context** (2-3 pages)
- Purpose and scope of the ramp-up plan
- Relationship to commissioning plan and OR Playbook
- Ramp-up period definition (SOP Day to Steady State)
- Plan ownership and governance
- Plan update and review process

**3. Design Parameters & Targets** (3-4 pages)
- Design capacity definition (nameplate, sustained, maximum)
- Production targets by product type
- Quality specifications and compliance requirements
- Utility consumption targets
- Operating cost targets (per unit of production)
- Environmental compliance parameters
- Key design assumptions and constraints

See [`references/skill-output-details.md`](references/skill-output-details.md) for complete output field definitions and format details.

## Methodology & Standards

### Primary Frameworks
- **S-Curve Methodology**: Production ramp-up typically follows an S-curve (logistic growth curve) from initial production through rapid growth to plateau at design capacity. The plan uses parameterized S-curves for P10/P50/P90 scenarios.
- **Learning Curve Theory**: Wright's Law / experience curve for modeling operator and organizational learning during ramp-up. Typically 80-90% learning curve for mining/processing operations.

### Industry Standards
- **ISO 55001** - Asset management (lifecycle perspective on ramp-up as a critical asset lifecycle phase)
- **IPA (Independent Project Analysis)** - Benchmarking data for production ramp-up performance:
  - Mining: Typical 12-18 months to design capacity
  - Chemical processing: Typical 6-12 months
  - Power generation: Typical 3-6 months
- **CII (Construction Industry Institute)** - Research on startup and ramp-up best practices

### Reliability & Availability
- **RAM Analysis Standards** - Reliability, Availability, Maintainability modeling for availability projections
- **Weibull Analysis** - Early-life failure (infant mortality) modeling for new equipment
- **Bathtub Curve** - Understanding the high early-failure rate during ramp-up

### Performance Measurement
- **OEE (Overall Equipment Effectiveness)** - Standard manufacturing performance metric: Availability x Performance x Quality
- **EN 15341** - Maintenance performance indicators
- **SMRP Best Practices** - Maintenance and reliability KPIs

### Financial Analysis
- **Discounted Cash Flow (DCF)** - For quantifying the financial impact of ramp-up speed on project NPV
- **Production Cost Analysis** - Unit cost modeling during sub-capacity operation
- **Break-Even Analysis** - Determining when revenue covers operating costs during ramp-up

### Mining-Specific Standards (if applicable)
- **SME Mining Engineering Handbook** - Industry reference for mining operation ramp-up
- **AMEC/Wood Group** - Ramp-up benchmarking for mining projects
- **NI 43-101 / JORC** - Mineral resource/reserve standards (for production forecasting context)

### Chilean Standards
- **SERNAGEOMIN** - Chilean Mining Regulatory Authority requirements for production startup
- **DS 132** - Mining safety during startup operations
- **SMA** - Superintendencia del Medio Ambiente requirements for production compliance

## Step-by-Step Execution

### Phase 1: Baseline Definition (Steps 1-3)

**Step 1: Define Design Parameters**
- Confirm design capacity (nameplate, sustained maximum, normal operating rate)
- Document key process parameters at design conditions:
  - Feed rate, grade, particle size
  - Process recovery targets
  - Product quality specifications
  - Utility consumption rates
  - Waste/tailings generation rates
- Identify design constraints and operating envelopes
- Document environmental and regulatory limits on production

**Step 2: Assess Readiness State**
- Review equipment commissioning status and punch-list items
- Assess staffing levels vs. requirements at each ramp-up phase
- Review training completion status and competency gaps
- Evaluate spare parts inventory and supply chain readiness
- Review operating procedure availability and approval status
- Assess CMMS and management system readiness
- Identify vendor support availability and agreements
- Summarize overall readiness state and key gaps

**Step 3: Establish Benchmarks**
- Research industry benchmarks for similar operations:
  - Typical time to design capacity (by industry, project type, scale)
  - Typical availability trajectory during ramp-up
  - Common bottlenecks and challenges
  - Best-in-class vs. average vs. worst-case performance
- Adjust benchmarks for project-specific factors:
  - Greenfield vs. brownfield
  - Experienced vs. new workforce
  - Complex vs. standard process
  - Remote vs. accessible location
  - High altitude, extreme climate factors

### Phase 2: Ramp-Up Curve Development (Steps 4-6)

**Step 4: Model Ramp-Up Scenarios**
Develop three scenarios using S-curve methodology:

**P10 (Optimistic - 10% probability of achieving or exceeding)**:
- Assumptions: Minimal equipment issues, experienced operators, favorable conditions
- Availability: 85% from Month 3
- Time to design: 6-8 months (typical fast ramp-up)

**P50 (Base Case - 50% probability)**:
- Assumptions: Normal teething issues, standard learning curve, planned maintenance
- Availability: 80% from Month 6
- Time to design: 10-14 months (expected)

**P90 (Conservative - 90% probability of achieving)**:
- Assumptions: Significant equipment issues, extended learning curve, supply chain delays
- Availability: 75% from Month 9
- Time to design: 16-20 months (pessimistic)

S-curve parameters:
```
Production(t) = Design_Capacity / (1 + e^(-k*(t - t_midpoint)))
Where:
  k = growth rate (steepness)
  t_midpoint = month at which 50% capacity is reached
  Adjust per P10/P50/P90 assumptions
```

**Step 5: Define Ramp-Up Milestones**
Establish milestone progression:

| Milestone | Criteria | Typical Timing (P50) |
|-----------|---------|---------------------|
| M0: First Feed | Material introduced to process | SOP Day |
| M1: First Product | Specification product produced | SOP +1-2 weeks |
| M2: 25% Design | >25% for 72 continuous hours | Month 2-3 |
| M3: 50% Design | >50% for 7 continuous days | Month 5-7 |
| M4: 75% Design | >75% for 14 continuous days | Month 8-11 |
| M5: 100% Design | >95% for 7 continuous days | Month 10-14 |
| M6: Performance Test | Per guarantee conditions | Month 12-16 |
| M7: Steady State | All criteria met for 30 days | Month 14-20 |

**Step 6: Model Equipment Availability**
By system/area, model expected availability through ramp-up:
- Apply bathtub curve for early-life failure expectations
- Factor in planned maintenance shutdowns
- Factor in design modifications and optimization shutdowns
- Account for spare parts availability impact on repair time
- Calculate overall plant availability trajectory month-by-month

### Phase 3: Support & Resource Planning (Steps 7-8)

**Step 7: Develop Staffing & Support Plan**
- Map staffing requirements per ramp-up phase:
  - Phase 0-1: Additional operators, supervisors, vendor reps, project team support
  - Phase 2-3: Standard staffing + vendor specialists for optimization
  - Phase 4-5: Standard staffing, reduced vendor support
- Define support tapering schedule with demobilization criteria
- Plan knowledge transfer activities and deadlines
- Define supplementary training during ramp-up (on-the-job, simulation, mentoring)
- Plan shift pattern transitions if applicable

**Step 8: Develop Contingency Plans**
For each major risk category, develop contingency:
- **Equipment failure**: Pre-positioned spare parts, vendor rapid response agreements, temporary equipment options
- **Process bottleneck**: De-bottlenecking strategy, temporary process modifications, engineering support
- **Quality issues**: Rework/recycle plans, specification relaxation protocols, laboratory surge capacity
- **Staffing shortage**: Cross-training capability, contractor supplementation, overtime authorization
- **Supply chain**: Buffer stocks, alternative suppliers, local fabrication options
- **Extended ramp-up**: Financial contingency, contractual implications (PPA, offtake, financing)

### Phase 4: Monitoring & Output (Steps 9-11)

**Step 9: Design Performance Monitoring System**
- Define daily, weekly, and monthly KPIs during ramp-up
- Design production dashboard with visual tracking vs. plan
- Define reporting cadence and escalation triggers:
  - Green: Within 5% of target -- continue as planned
  - Yellow: 5-15% below target -- investigate and report
  - Red: >15% below target -- escalate, develop recovery plan
- Define management review schedule and format

**Step 10: Define Steady-State Criteria & Transition**
- Document specific, measurable steady-state criteria
- Define the steady-state assessment process
- Specify who declares steady state (typically Plant Manager with endorsement from OR Steering Committee)
- Define post-declaration monitoring period (typically 3-6 months)
- Document transition actions:
  - Close OR program governance (transition to operations governance)
  - Finalize lessons learned
  - Complete financial close-out of ramp-up phase
  - Transition remaining vendor support to standard service agreements

**Step 11: Generate Outputs**
- Create Ramp-Up Plan document with all sections
- Generate Ramp-Up Curves workbook:
  - S-curve data (P10/P50/P90)
  - Monthly/weekly targets
  - Equipment availability targets
  - Milestone tracker
  - Support tapering schedule
  - Production dashboard template
  - Financial tracking template
  - Risk register
- Create chart visualizations for ramp-up curves

## Quality Criteria

### Quantitative Thresholds

| Criterion | Target | Minimum Acceptable |
|-----------|--------|-------------------|
| Ramp-up curve coverage (months to steady state) | P10/P50/P90 all defined | At least P50 defined |
| Milestones with quantitative criteria | 100% | 100% |
| Monthly production targets defined | 100% of ramp-up months | 100% |
| Equipment availability targets per system | >90% of systems | >80% |
| Support tapering schedule coverage | 100% of support resources | >90% |
| Contingency plans for top risks | >80% of identified risks | >70% |
| Steady-state criteria completeness | All 7+ criteria defined | >5 criteria |
| SME approval rating | >95% | >91% |

### Qualitative Standards

- **Realism**: Ramp-up curves must be benchmarked against comparable operations. Curves that show reaching design capacity in less than 3 months for complex processing plants must be challenged with justification.
- **Milestone Rigor**: Every milestone must have quantitative, measurable criteria. "Approximately 50% capacity" is unacceptable; ">50% of design capacity (>60,000 tpd) sustained for >7 consecutive days with >75% product on-specification" is the standard.
- **Completeness**: The plan must address all dimensions: production, quality, equipment, people, systems, safety, environment, and finance. Missing dimensions create blind spots during execution.
- **Contingency Depth**: Contingency plans must go beyond identifying risks -- they must specify pre-planned response actions with triggers, responsibilities, and resource requirements.
- **Financial Integration**: Production forecasts must link to revenue projections and cost models. The financial impact of each scenario (P10/P50/P90) should be quantified.

### Validation Process
1. Ramp-up curve benchmark validation (compare against industry data)
2. Milestone criteria specificity and measurability check
3. Equipment availability trajectory realism check
4. Staffing plan vs. availability validation
5. Financial model consistency check
6. Contingency plan completeness check
7. Steady-state criteria completeness and measurability check
8. Final quality score calculation

## MCP Integrations

- **mcp-sharepoint**: Store and retrieve ramp-up plan documents, ramp-up curve workbooks, and milestone tracker files
- **project-database**: Track ramp-up milestones, phase progression status, and KPI actuals vs. targets
- **mcp-jira**: Manage ramp-up task assignments, track contingency action items, and monitor support tapering activities

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents)
| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| `create-commissioning-plan` | Commissioning status | TCCC completion status defines the starting point for ramp-up |
| `create-asset-register` | Equipment data | Equipment list and criticality for availability modeling |
| `create-maintenance-strategy` | PM schedules | Planned maintenance during ramp-up affects availability |
| `create-spare-parts-strategy` | Spare parts availability | Spare parts readiness affects repair times during ramp-up |
| `create-risk-assessment` | Operational risks | Risks informing ramp-up contingency planning |
| `create-or-framework` | KPI framework | Performance metrics from OR Framework feed ramp-up KPIs |
| `create-or-playbook` | Ramp-up philosophy | OR Playbook commissioning chapter provides ramp-up approach context |

### Downstream Dependencies (Outputs TO other agents)
| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| `create-kpi-dashboard` | Ramp-up KPIs | Ramp-up performance metrics for dashboard tracking |
| `create-shutdown-plan` | Ramp-up shutdowns | Mini-shutdowns during ramp-up need shutdown planning |
| Financial Agent | Production forecasts | Ramp-up curves feed financial projections |

### Peer Dependencies (Collaborative)
| Agent/Skill | Interaction | Description |
|-------------|-------------|-------------|
| `create-or-framework` | Gate alignment | Ramp-up milestones align with OR Framework Gate 5 (Ready for Operations) and Gate 6 (Steady State) |
| `create-commissioning-plan` | Handover | Ramp-up plan picks up where commissioning plan ends |

## Examples

See [`references/skill-examples.md`](references/skill-examples.md) for detailed examples.

## Templates & References

See [`references/skill-templates-references.md`](references/skill-templates-references.md) for detailed templates & references.
