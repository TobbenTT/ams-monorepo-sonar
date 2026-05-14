---
name: create-staffing-plan
description: "Create staffing plans with roles, competencies, shift patterns, and recruitment timelines. Triggers: 'staffing plan', 'workforce plan', 'plan de dotacion', 'plan de personal'."
---

# Create Staffing Plan
## Skill ID: create-staffing-plan
## Version: 1.0.0
## Category: A - Document Generation
## Priority: High

## Purpose
Generates comprehensive staffing plans for industrial operations and maintenance organizations, defining the number of personnel, roles, competency profiles, shift patterns, and progressive buildup schedules required to safely and efficiently operate and maintain a facility from commissioning through steady-state operations.

The staffing plan is a critical Operational Readiness deliverable because it drives recruitment timelines, training program design, labor budgets, and organizational structure. An under-staffed facility compromises safety and production; an over-staffed facility wastes resources. The plan must balance operational coverage requirements with economic efficiency, regulatory compliance, and workforce availability constraints.

## Intent & Specification
The AI agent MUST understand that:

1. **Staffing is Derived, Not Assumed**: Staffing numbers must be calculated from workload analysis, not assumed from benchmarks alone. Workload drivers include: operating rounds, control room manning, maintenance labor hours, administrative tasks, and statutory requirements.
2. **Shift Pattern Design is Critical**: The shift roster must provide 24/7/365 coverage (or the required operating pattern) while complying with labor regulations (maximum hours, rest periods, overtime limits) and accounting for leave, training, and absenteeism.
3. **Buildup Schedule Required**: For greenfield projects, staffing does not start at full strength. A phased buildup aligned with the project construction and commissioning schedule is essential.
4. **Competency-Based**: Each role must have defined competency requirements (technical, behavioral, certifications) that link to the training plan.
5. **Total Workforce Includes All Categories**: Own staff, contractors, outsourced services, and shared services must all be accounted for.
6. **Regulatory Compliance**: Chilean labor law (Codigo del Trabajo), mining safety regulations (DS 132), and other applicable regulations constrain shift patterns, working hours, and qualification requirements.
7. **Language**: Spanish (Latin American).

## Trigger / Invocation
```
/create-staffing-plan
```

### Natural Language Triggers
- "Create staffing plan for [facility/plant]"
- "Calculate manning requirements for [operation]"
- "Design shift patterns for [plant]"
- "Determine workforce requirements for [project]"
- "Crear plan de dotacion para [planta/instalacion]"
- "Calcular dotacion de personal para operaciones y mantenimiento"
- "Disenar turnos de trabajo"

## Guided Mode

This skill supports guided mode. When triggered, execute the Guided Mode Protocol
(defined in the agent CLAUDE.md) BEFORE proceeding to Step-by-Step Execution.

**GM-1 Summary:** 5 required + 7 optional questions covering org design, maintenance hours,
shift patterns, labor regulations, competency requirements, and budget constraints.
See `references/guided-mode-questions.md` for the complete question sequence.

**Dependency checks:** Requires create-org-design output. Strongly benefits from
maintenance strategy (RCM hours) and operations manual (operating procedures).

## Input Requirements

### Required Inputs
| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `organizational_structure` | Defined org model (from create-org-design or client) | .pptx / .xlsx / .docx | Org Design |
| `operational_requirements` | Operating mode, hours, throughput targets | .docx / Text | Client / Operations Model |
| `maintenance_requirements` | Maintenance labor hours from RCM strategy | .xlsx | create-maintenance-strategy |
| `facility_description` | Plant layout, areas, geographic spread | .pdf / .docx | Engineering |
| `operating_pattern` | 24/7, 5x2, seasonal, campaign | Text | Client |

### Optional Inputs (Highly Recommended)
| Input | Description | Default |
|-------|-------------|---------|
| `operations_manual` | SOPs defining operator tasks and rounds | Estimate from equipment count |
| `maintenance_manual` | PM/CM procedures with crew requirements | Estimate from RCM hours |
| `labor_regulations` | Applicable labor code and restrictions | Chilean Codigo del Trabajo |
| `mining_safety_regs` | DS 132 or equivalent mining safety regulations | DS 132 for Chilean mining |
| `collective_agreements` | Union agreements affecting work patterns | None (use statutory minimums) |
| `benchmarking_data` | Industry staffing benchmarks (Solomon, CRU, etc.) | VSC internal benchmarks |
| `commissioning_schedule` | Project schedule for buildup timing | Assume 18 months pre-operation |
| `contractor_strategy` | Which functions to outsource | Recommend based on best practice |
| `wage_scales` | Salary ranges by position and location | Chilean market data |
| `attrition_rate` | Expected turnover rate | 8-12% for mining, 5-8% for energy |
| `local_workforce_availability` | Regional labor market data | Search knowledge base |

### Context Enrichment
The agent should automatically:
- Calculate operating task workload from operations manuals (field rounds, sampling, log entries)
- Extract maintenance labor hours by craft from RCM/FMECA results
- Retrieve applicable labor regulations for the jurisdiction
- Pull industry staffing benchmarks for the sector and plant size
- Estimate absenteeism, leave, and training allowances using regional data

## Output Specification

### Document 1: Staffing Matrix (.xlsx)
**Filename**: `VSC_PlanDotacion_{ProjectCode}_{Version}_{Date}.xlsx`

**Sheets**:

#### Sheet 1: Staffing Summary
| Column | Description |
|--------|-------------|
| Department | Operations, Maintenance, HSE, Admin, Lab, etc. |
| Section | Sub-department (e.g., Plant Operations, Mobile Maintenance) |
| Role/Position | Job title |
| Category | Staff / Supervision / Management |
| Shift Type | Day shift / Rotating shift / On-call |
| Headcount per Shift | People per crew |
| Number of Crews | Total crews in rotation |
| Relief Factor | Factor for leave/training/absenteeism |
| Total Headcount | Calculated total = per shift x crews x relief |
| Competency Level | Junior / Competent / Senior / Expert |
| Estimated Start Date | When this role needs to be filled |

#### Sheet 2: Shift Pattern Design
| Column | Description |
|--------|-------------|
| Shift Pattern Name | e.g., "4x4 Continental", "7x7", "5x2" |
| Cycle Length (days) | Total rotation cycle |
| Crews Required | Number of crews |
| Daily Coverage (hours) | Hours per day covered |
| Average Weekly Hours | Hours worked per week per person |
| Annual Hours Worked | Total hours worked per year per person |
| Overtime Percentage | Expected overtime |
| Regulatory Compliance | Y/N with comments |
| Fatigue Risk Assessment | Low/Medium/High |

#### Sheet 3: Workload Analysis - Operations
| Column | Description |
|--------|-------------|
| Area/System | Plant area or system |
| Task Type | Control room / Field rounds / Sampling / Admin |
| Task Description | What the operator does |
| Frequency | How often (per shift, daily, weekly) |
| Duration (min) | Time per occurrence |
| Annual Hours | Total annual hours for this task |
| Role Required | Which operator role performs this |
| Minimum Crew | Minimum people needed simultaneously |

#### Sheet 4: Workload Analysis - Maintenance
| Column | Description |
|--------|-------------|
| Craft/Trade | Mechanical, Electrical, Instrumentation, etc. |
| Task Type | PM / PdM / CM (estimated) / Projects |
| Annual Hours (from RCM) | Maintenance hours from strategy |
| Availability Factor | Wrench time / productive time ratio |
| Adjusted Annual Hours | Gross hours including non-productive time |
| Hours per Person per Year | Available hours per technician |
| Calculated Headcount | Adjusted hours / hours per person |
| Recommended Headcount | Rounded with flexibility margin |

#### Sheet 5: Buildup Schedule
| Column | Description |
|--------|-------------|
| Role/Position | Job title |
| Total Headcount | Final steady-state number |
| Month -18 | Headcount at 18 months before operations |
| Month -15 | ... |
| Month -12 | ... |
| Month -9 | ... |
| Month -6 | ... |
| Month -3 | ... |
| Month 0 (Commissioning Start) | ... |
| Month +3 | ... |
| Month +6 | ... |
| Month +12 (Steady State) | Full headcount |

#### Sheet 6: Cost Estimation
| Column | Description |
|--------|-------------|
| Role/Position | Job title |
| Headcount | Number of people |
| Base Salary (monthly) | Monthly base pay |
| Benefits & Burden (%) | Social charges, benefits, insurance |
| Total Annual Cost per Person | Fully loaded cost |
| Total Annual Cost (all) | Cost x headcount |
| Buildup Year 1 Cost | Partial year cost |
| Steady State Annual Cost | Full year cost |

#### Sheet 7: Role Profiles Summary
| Column | Description |
|--------|-------------|
| Role/Position | Job title |
| Department | Department assignment |
| Reports To | Direct supervisor |
| Key Responsibilities (summary) | 3-5 bullet points |
| Education Minimum | Degree, diploma, certification |
| Experience Minimum | Years and type |
| Certifications Required | Mandatory certifications |
| Key Competencies | Technical and behavioral |
| Career Path | Next role in progression |

### Document 2: Staffing Plan Report (.docx)
**Filename**: `VSC_InformeDotacion_{ProjectCode}_{Version}_{Date}.docx`

**Structure**:
1. **Cover Page**
2. **Executive Summary** - Key numbers, total workforce, cost, critical findings
3. **Introduction & Methodology**
   - 3.1 Scope of the staffing plan
   - 3.2 Methodology (workload analysis, benchmarking, regulatory compliance)
   - 3.3 Standards and regulations applied
   - 3.4 Assumptions and constraints
4. **Organizational Overview**
   - 4.1 Organizational structure (reference to org design)
   - 4.2 Functional descriptions by department
   - 4.3 Management and supervision philosophy
5. **Shift Pattern Design**
   - 5.1 Operating pattern requirements
   - 5.2 Shift options evaluated
   - 5.3 Recommended shift pattern
   - 5.4 Regulatory compliance analysis
   - 5.5 Fatigue risk management
   - 5.6 Shift handover requirements
6. **Operations Staffing**
   - 6.1 Control room manning
   - 6.2 Field operations manning
   - 6.3 Laboratory staffing
   - 6.4 Operational support roles
   - 6.5 Workload analysis summary
7. **Maintenance Staffing**
   - 7.1 Craft breakdown (mechanical, electrical, instrumentation, etc.)
   - 7.2 Maintenance planning and scheduling
   - 7.3 Predictive maintenance specialists
   - 7.4 Maintenance supervision
   - 7.5 Workload-to-headcount calculation methodology
8. **HSE Staffing**
   - 8.1 Safety roles and responsibilities
   - 8.2 Environmental monitoring roles
   - 8.3 Occupational health roles
   - 8.4 Emergency response team
9. **Support Functions**
   - 9.1 Administrative support
   - 9.2 Warehouse and logistics
   - 9.3 IT and systems support
10. **Contractor and Outsourced Services**
    - 10.1 Recommended contractor scope
    - 10.2 Contractor management roles
    - 10.3 Estimated contractor headcount
11. **Workforce Buildup Plan**
    - 11.1 Recruitment timeline
    - 11.2 Phased buildup schedule
    - 11.3 Critical path roles (hire first)
    - 11.4 Commissioning support staffing
12. **Role Profiles** (detailed)
    - 12.1 Management roles
    - 12.2 Supervision roles
    - 12.3 Technical/operational roles
    - 12.4 Support roles
13. **Cost Summary**
    - 13.1 Total labor cost summary
    - 13.2 Cost by department
    - 13.3 Buildup period costs
    - 13.4 Steady-state annual costs
14. **Benchmarking Comparison**
    - 14.1 Comparison with industry benchmarks
    - 14.2 Productivity ratios
    - 14.3 Staffing efficiency analysis
15. **Recommendations**

## Methodology & Standards

### Primary Standards and Regulations
| Standard/Regulation | Application |
|--------------------|-------------|
| **Codigo del Trabajo (Chile)** | Maximum work hours, rest periods, overtime, night work |
| **DS 132** | Mining safety regulations - minimum staffing for safety |
| **DS 594** | Workplace health and environmental conditions |
| **ISO 55001** | Asset management - maintenance organization requirements |
| **EN 15628** | Maintenance qualification of maintenance personnel |

### Staffing Calculation Methodology

#### Operations Staffing Formula:
```
Operating Headcount = (Positions per Shift) x (Number of Crews) x (Relief Factor)

Where:
- Positions per Shift = derived from workload analysis (rounds, monitoring, response)
- Number of Crews = depends on shift pattern (typically 4 for 24/7 continental)
- Relief Factor = 1 / (Available shifts / Total shifts per year)
  Typically 1.15 - 1.25 accounting for:
  - Annual leave (15-20 days)
  - Training (10-15 days)
  - Sick leave (5-8 days)
  - Public holidays (varies by country)
```

#### Maintenance Staffing Formula:
```
Maintenance Headcount = (Annual Maintenance Hours) / (Available Hours per Technician x Wrench Time Factor)

Where:
- Annual Maintenance Hours = from RCM/FMECA strategy (PM + estimated CM)
- Available Hours per Technician = ~1,800 hrs/year (after leave, training, etc.)
- Wrench Time Factor = 0.35 - 0.55 (proportion of productive maintenance work)
  Non-wrench time includes: travel, permits, parts collection, breaks, admin
- Add: Planning/Scheduling = 1 planner per 15-20 technicians
- Add: Supervision = 1 supervisor per 8-12 technicians
```

#### Shift Patterns Commonly Used
| Pattern | Cycle | Crews | Avg Hours/Week | Common Application |
|---------|-------|-------|----------------|-------------------|
| 4x4 Continental | 16 days | 4 | 42 hrs | Mining, continuous process |
| 7x7 | 14 days | 2 | 42 hrs | Remote mining (FIFO) |
| 4x3 (12-hr shifts) | 7 days | 4 | 42 hrs | Process plants |
| 5x2 (day shift only) | 7 days | 1 | 45 hrs | Day-only maintenance |
| 8x6 | 14 days | 2 | 40 hrs | Mining (regulatory driven) |
| 10x10 | 20 days | 2 | 42 hrs | Remote operations |

### Benchmarking References
- Solomon Associates (refining, petrochemical)
- CRU Consulting (mining operations)
- IFPIMM (maintenance productivity benchmarking)
- VSC internal project database

## Step-by-Step Execution

### Phase 1: Data Gathering & Analysis (Steps 1-3)
1. **Compile Organizational Framework**: From org design inputs:
   - Identify all departments and functional areas
   - Map reporting lines and spans of control
   - Identify roles that are already defined vs. those to be created
   - Note any client-mandated staffing constraints
2. **Analyze Operating Workload**: From operations manuals and process requirements:
   - Inventory all operating tasks (control room, field, sampling, admin)
   - Estimate time per task and frequency
   - Calculate total operating hours by area and role
   - Identify minimum simultaneous manning requirements (e.g., always 2 operators in control room)
   - Account for geographic spread (travel time between areas)
3. **Analyze Maintenance Workload**: From RCM/maintenance strategy:
   - Sum annual PM hours by craft (mechanical, electrical, instrumentation, civil)
   - Estimate CM hours (typically 30-50% of total, depending on equipment age/condition)
   - Add project/modification work hours (typically 10-15% of total)
   - Add shutdown/turnaround maintenance requirements
   - Calculate net maintenance hours by craft category

### Phase 2: Shift Pattern & Manning Calculation (Steps 4-7)
4. **Design Shift Pattern**:
   - Determine operating pattern requirement (24/7, 5-day, seasonal)
   - Select candidate shift patterns based on regulations and best practices
   - Evaluate each option against: regulatory compliance, fatigue management, employee preference, cost
   - Recommend optimal shift pattern with rationale
   - Calculate number of crews required
5. **Calculate Relief Factor**:
   - Start with annual calendar days (365)
   - Subtract: annual leave, public holidays, sick leave allowance, training days
   - Calculate available working days per person per year
   - Relief factor = Total shift positions needed / Available staffing
   - Typical range: 1.15 - 1.28
6. **Calculate Operations Headcount**:
   - For each operating area, determine positions per shift
   - Apply crew count from shift pattern
   - Apply relief factor
   - Add day-shift-only positions (supervision, planning, coordination)
   - Sum to total operations headcount
7. **Calculate Maintenance Headcount**:
   - For each craft, apply the maintenance staffing formula
   - Select appropriate wrench time factor (benchmark: 35% for reactive, 55% for mature organization)
   - Add planning/scheduling positions
   - Add supervision positions
   - Add specialist positions (reliability engineer, CBM technician)
   - Sum to total maintenance headcount

### Phase 3: Buildup & Cost (Steps 8-10)
8. **Design Workforce Buildup Schedule**:
   - Align with project commissioning schedule
   - Management and supervision: hire 18-24 months before operations
   - Senior operators/technicians: hire 12-15 months (to participate in construction/commissioning)
   - Operators/technicians: hire 6-12 months (for training program)
   - Support staff: hire 3-6 months before operations
   - Create month-by-month buildup curve
9. **Define Role Profiles**: For each unique role:
   - Job title and reporting relationship
   - Key responsibilities (5-8 bullet points)
   - Education requirements
   - Experience requirements
   - Certifications required
   - Technical competencies
   - Behavioral competencies
   - Career path and progression
10. **Estimate Costs**:
    - Apply salary ranges by position and location
    - Add benefits burden (social security, health insurance, bonuses, etc.)
    - Calculate fully loaded annual cost per position
    - Project total annual labor cost at steady state
    - Project buildup period costs (partial years)

### Phase 4: Document Generation & Quality (Steps 11-13)
11. **Generate Staffing Matrix (.xlsx)**: Compile all calculations into the workbook structure.
12. **Generate Staffing Plan Report (.docx)**: Write the narrative document with analysis, methodology, and recommendations.
13. **Quality Review**: Verify calculations, benchmark alignment, regulatory compliance.

## Quality Criteria

### Content Quality (Target: >91% SME Approval)
| Criterion | Weight | Description |
|-----------|--------|-------------|
| Workload Justification | 25% | Every position is justified by workload analysis, not assumption |
| Regulatory Compliance | 20% | Shift patterns and working hours comply with applicable regulations |
| Benchmark Alignment | 15% | Staffing levels are within reasonable range of industry benchmarks |
| Completeness | 15% | All functions covered (operations, maintenance, HSE, support) |
| Buildup Feasibility | 10% | Recruitment timeline is realistic given market conditions |
| Cost Accuracy | 10% | Labor costs reflect market rates for the region/industry |
| Profile Quality | 5% | Role profiles are specific enough for recruitment |

### Automated Quality Checks
- [ ] Total headcount reconciles across all worksheets
- [ ] Shift pattern complies with maximum weekly hours (Codigo del Trabajo: 45 hrs ordinary)
- [ ] Relief factor is within expected range (1.15 - 1.28 for 24/7 operations)
- [ ] Maintenance headcount aligns with RCM labor hour calculation
- [ ] Planner-to-technician ratio is within 1:15 to 1:20 range
- [ ] Supervisor-to-technician ratio is within 1:8 to 1:12 range
- [ ] Every role has education, experience, and competency requirements defined
- [ ] Buildup schedule starts early enough for critical roles
- [ ] Cost calculations use consistent base salary and burden rates
- [ ] Staffing ratios compared to at least one industry benchmark
- [ ] Contractor/outsourced roles clearly distinguished from own staff
- [ ] Emergency response team staffing meets regulatory requirements
- [ ] No placeholder text (TBD, XXX) remaining

## MCP Integrations

- **mcp-sharepoint**: Store and retrieve staffing plan documents, role profiles, and shift pattern calculations
- **project-database**: Track position status, hiring progress, buildup schedule milestones, and workforce headcount by department
- **mcp-outlook**: Distribute recruitment communications, interview scheduling, and staffing plan review requests to stakeholders

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs From)
| Agent/Skill | Input Provided | Criticality |
|-------------|---------------|-------------|
| `create-org-design` | Organizational structure and reporting lines | Critical |
| `create-maintenance-strategy` | Maintenance labor hours by craft | Critical |
| `create-operations-manual` | Operating task workload data | High |
| `hse-agent` | HSE staffing regulatory requirements | High |
| `create-vsc-proposals` | Scope and team structure from approved proposal | Medium |

### Downstream Dependencies (Outputs To)
| Agent/Skill | Output Provided | Trigger |
|-------------|----------------|---------|
| `create-training-plan` | Roles, competency requirements, buildup schedule | Automatic |
| `create-contract-scope` | Contractor scope and headcount for outsourced services | Automatic |
| `create-kpi-dashboard` | Workforce KPIs (productivity, availability, overtime) | On request |
| `create-vsc-proposals` | Staffing numbers for proposal pricing | On request |

### Collaboration During Execution
| Agent/Skill | Collaboration Type | When |
|-------------|-------------------|------|
| `hse-agent` | Emergency response team sizing validation | During HSE staffing |
| `create-org-design` | Org chart alignment with headcount | During manning calculation |
| `labor-law-agent` | Regulatory compliance verification | During shift pattern design |
| `review-documents` | Document quality review | After assembly |

## Templates & References

### Document Templates
- `VSC_StaffingPlan_Template_v2.0.xlsx` - Staffing matrix workbook template
- `VSC_StaffingReport_Template_v1.5.docx` - Narrative report template
- `VSC_RoleProfile_Template_v1.0.docx` - Individual role profile template
- `VSC_ShiftPattern_Calculator_v2.0.xlsx` - Shift pattern design calculator

### Reference Data
- Chilean Codigo del Trabajo (labor regulations)
- DS 132 (Mining Safety Regulations)
- Solomon Associates staffing benchmarks (energy/refining)
- CRU cost model benchmarks (mining)
- VSC internal project staffing database
- Regional salary survey data (Chile, Peru, Colombia, etc.)

## Examples

### Example: Mining Concentrator Staffing Summary

**Facility**: 120,000 tpd copper concentrator, 24/7 operation, Region de Antofagasta

| Department | Category | Day Shift | Rotating Shift | Total Headcount |
|-----------|----------|-----------|---------------|-----------------|
| **Plant Management** | Management | 5 | 0 | 5 |
| **Operations** | Supervision | 4 | 12 | 16 |
| **Operations** | Operators | 8 | 52 | 60 |
| **Maintenance** | Supervision | 3 | 4 | 7 |
| **Maintenance** | Mechanical | 8 | 16 | 24 |
| **Maintenance** | Electrical | 4 | 8 | 12 |
| **Maintenance** | Instrumentation | 3 | 8 | 11 |
| **Maintenance** | Planning | 4 | 0 | 4 |
| **Maintenance** | Reliability | 2 | 0 | 2 |
| **HSE** | HSE Staff | 3 | 8 | 11 |
| **Laboratory** | Lab Tech | 2 | 8 | 10 |
| **Warehouse** | Warehouse | 3 | 4 | 7 |
| **Administration** | Admin | 6 | 0 | 6 |
| **TOTAL** | | **55** | **120** | **175** |

**Shift Pattern**: 4x4 Continental (4 days on, 4 days off, 12-hour shifts)
**Crews**: 4 crews (A, B, C, D)
**Relief Factor**: 1.22
**Estimated Annual Labor Cost**: USD 14.2M (fully loaded)
