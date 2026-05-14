---
name: create-org-design
description: "Design organizational structures including org charts, RACI matrices, and role definitions. Triggers: 'org design', 'organization chart', 'RACI', 'diseno organizacional', 'organigrama'."
---

# Create Organizational Design
## Skill ID: create-org-design
## Version: 1.0.0
## Category: A - Document Generation
## Priority: High

## Purpose
Generates comprehensive organizational designs for industrial operations and maintenance organizations, including organizational charts, RACI matrices, role definitions, and reporting structures. The organizational design defines HOW the workforce is structured, how decisions are made, how work flows between functional areas, and how accountability is distributed.

Organizational design is foundational to Operational Readiness because it precedes and informs staffing plans, training plans, and the overall operating model. A poorly designed organization creates confusion about roles and responsibilities, duplicated effort, communication breakdowns, slow decision-making, and accountability gaps that ultimately compromise safety and operational performance.

## Intent & Specification
The AI agent MUST understand that:

1. **Organization Follows Strategy**: The organizational structure must be designed to execute the operations and maintenance strategy, not the other way around. If the strategy emphasizes reliability-centered maintenance, the organization must have reliability engineering capability.
2. **Spans of Control Matter**: Management layers and spans of control must be appropriate for the industry and operating environment. Mining operations typically use wider spans than petrochemical plants due to different complexity levels.
3. **RACI is Essential**: A RACI matrix (Responsible, Accountable, Consulted, Informed) for all key processes and decisions eliminates ambiguity about who does what. This is one of the most critical outputs.
4. **Multiple Views Required**: The organization must be presented as:
   - Hierarchical org chart (reporting lines)
   - Functional matrix (cross-functional relationships)
   - RACI matrix (process-based accountability)
   - Shift organization (who is on site at any given time)
5. **Context-Dependent Design**: Organization design varies significantly by industry, company culture, size, operating model (owner-operator vs. contractor-operated), and regulatory environment.
6. **Interface Management**: The design must clearly define interfaces between Operations, Maintenance, HSE, Engineering, Supply Chain, and support functions.
7. **Language**: Spanish (Latin American).

## Trigger / Invocation
```
/create-org-design
```

### Natural Language Triggers
- "Design the organizational structure for [facility/plant]"
- "Create org charts for [operations/maintenance]"
- "Build RACI matrix for [organization/processes]"
- "Define roles and reporting for [plant/project]"
- "Disenar organizacion para [planta/instalacion]"
- "Crear organigramas para [operaciones/mantenimiento]"
- "Desarrollar matriz RACI"

## Guided Mode

This skill supports guided mode. When triggered, execute the Guided Mode Protocol
(defined in the agent CLAUDE.md) BEFORE proceeding to Step-by-Step Execution.

**GM-1 Summary:** 4 required + 6 optional questions covering project type (greenfield/brownfield),
operations model, maintenance model, contractor strategy, org culture, and existing structures.
See `references/guided-mode-questions.md` for the complete question sequence.

**Dependency checks:** Best results when create-or-strategy has been completed first.

## Input Requirements

### Required Inputs
| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `operations_model` | How the facility will operate (24/7, shifts, philosophy) | .docx / Text | Client / Operations Strategy |
| `maintenance_model` | Maintenance delivery model (in-house, outsourced, hybrid) | .docx / Text | Maintenance Strategy |
| `facility_description` | Plant scope, areas, complexity, geographic spread | .docx / .pdf | Engineering |
| `industry_sector` | Mining, Energy, Oil & Gas, Water, etc. | Text | User |

### Optional Inputs (Highly Recommended)
| Input | Description | Default |
|-------|-------------|---------|
| `corporate_policies` | Client's corporate organizational guidelines | Industry best practice |
| `corporate_org_chart` | Parent company organizational structure | Standalone facility assumed |
| `maintenance_strategy` | RCM results indicating maintenance organization needs | Derive from scope |
| `regulatory_requirements` | Organizational positions required by regulation | Chilean regulations |
| `benchmarking_data` | Comparable facility organization charts | VSC database |
| `union_agreements` | Labor agreements affecting structure | None |
| `technology_systems` | DCS, CMMS, ERP systems affecting workflow | Standard systems assumed |
| `contractor_strategy` | Which functions are outsourced | Derive from operations model |
| `management_philosophy` | Client's management style (flat, hierarchical, empowered) | Balanced modern approach |
| `existing_organization` | Current org chart (brownfield/expansion) | Greenfield (new design) |

### Context Enrichment
The agent should automatically:
- Search knowledge base for comparable facility organizational structures
- Retrieve regulatory requirements for mandatory positions (e.g., Experto en Prevencion de Riesgos per DS 40)
- Pull industry benchmarks for spans of control and organizational ratios
- Identify common organizational patterns for the industry sector

## Output Specification

### Document 1: Organizational Charts (.pptx)
**Filename**: `VSC_OrgDesign_{ProjectCode}_{Version}_{Date}.pptx`

**Slides**:
1. **Title Slide** - Project, date, version
2. **Design Philosophy** - Key principles guiding the organizational design
3. **Overall Organization Chart** - Facility-level structure (Plant Manager down to department level)
4. **Operations Department** - Detailed operations org chart
5. **Operations Shift Organization** - Who is on site during each shift
6. **Maintenance Department** - Detailed maintenance org chart
7. **Maintenance Shift Organization** - Shift maintenance structure
8. **HSE Department** - HSE organization structure
9. **Support Functions** - Administration, warehouse, laboratory, IT
10. **Contractor Organization** - How contractors fit into the structure
11. **Interface Diagram** - How departments interact
12. **Key Organizational Metrics** - Spans of control, ratios, headcount summary

### Organizational Chart Standards
- **Format**: Hierarchical boxes with:
  - Position title (bold)
  - Name (or "TBD" for unfilled)
  - Headcount if team (e.g., "x4" for 4 people in role)
- **Color Coding**:
  - Management: Dark blue
  - Operations: Green
  - Maintenance: Orange
  - HSE: Red
  - Support: Gray
  - Contractors: Outlined (no fill)
- **Lines**: Solid = direct report, Dashed = functional/matrix report
- **Each slide** shows maximum 3 levels of hierarchy for readability

### Document 2: RACI Matrix (.xlsx)
**Filename**: `VSC_RACI_{ProjectCode}_{Version}_{Date}.xlsx`

**Sheets**:

#### Sheet 1: Operations RACI
| Column | Description |
|--------|-------------|
| Process/Activity | Specific operational process or activity |
| Category | Category of activity (Routine Operations, Startups, Shutdowns, Emergency, etc.) |
| Plant Manager | R/A/C/I assignment |
| Operations Manager | R/A/C/I assignment |
| Operations Superintendent | R/A/C/I assignment |
| Shift Supervisor | R/A/C/I assignment |
| Control Room Operator | R/A/C/I assignment |
| Field Operator | R/A/C/I assignment |
| [Other operations roles] | R/A/C/I assignment |

#### Sheet 2: Maintenance RACI
| Column | Description |
|--------|-------------|
| Process/Activity | Maintenance process or activity |
| Category | Planning, Scheduling, Execution, Reliability, etc. |
| Maintenance Manager | R/A/C/I assignment |
| Maintenance Superintendent | R/A/C/I assignment |
| Maintenance Planner | R/A/C/I assignment |
| Maintenance Supervisor | R/A/C/I assignment |
| Maintenance Technician | R/A/C/I assignment |
| Reliability Engineer | R/A/C/I assignment |
| [Other maintenance roles] | R/A/C/I assignment |

#### Sheet 3: Cross-Functional RACI
| Column | Description |
|--------|-------------|
| Process/Activity | Cross-functional processes |
| Category | Turnarounds, Projects, Procurement, HSE, Budgeting, etc. |
| [All key roles across departments] | R/A/C/I assignment |

#### Sheet 4: HSE RACI
| Column | Description |
|--------|-------------|
| Process/Activity | HSE processes |
| Category | Risk Management, Incident Management, Compliance, Emergency, etc. |
| [All roles with HSE responsibilities] | R/A/C/I assignment |

#### Sheet 5: RACI Validation
| Column | Description |
|--------|-------------|
| Process/Activity | Activity reference |
| Has Accountable (A)? | Y/N - every activity MUST have exactly one A |
| Has Responsible (R)? | Y/N - every activity MUST have at least one R |
| Accountability Count | Number of A assignments (must be 1) |
| Responsibility Count | Number of R assignments |
| Validation Status | Pass / Fail |

### RACI Rules
- **R (Responsible)**: Does the work. Multiple R's allowed.
- **A (Accountable)**: Ultimately answerable. Exactly ONE per activity. The "buck stops here."
- **C (Consulted)**: Provides input before decision/action. Two-way communication.
- **I (Informed)**: Notified after decision/action. One-way communication.
- Every activity MUST have exactly ONE A
- Every activity MUST have at least ONE R
- A and R can be the same person
- Minimize C's and I's to avoid decision bottlenecks

## Methodology & Standards

### Primary Standards
| Standard | Application |
|----------|-------------|
| **ISO 55001** | Asset management - organizational requirements |
| **EN 15628** | Maintenance qualification of personnel - role definitions |
| **ISO 45001** | OHS management - safety role requirements |
| **DS 40 (Chile)** | Experto en Prevencion de Riesgos requirement |
| **DS 132 (Chile)** | Mining safety - organizational requirements |

### Organizational Design Principles
1. **Clear Line of Sight**: Every employee should understand how their role contributes to the facility's objectives
2. **Single Point of Accountability**: Every process, equipment, and decision has one clearly accountable person
3. **Appropriate Span of Control**:
   - Management: 5-8 direct reports
   - Supervision (operations): 6-10 operators per shift supervisor
   - Supervision (maintenance): 8-12 technicians per supervisor
4. **Minimum Layers**: Fewer management layers = faster decision-making
5. **Separation of Concerns**: Operations (run the plant), Maintenance (maintain the assets), HSE (govern safety), Planning (optimize resources)
6. **Matrix where Needed**: Reliability engineering, planning, and HSE may have matrix (dotted-line) relationships
7. **Scalability**: Design should accommodate growth without major restructuring

### Common Organizational Models

#### Model 1: Traditional Functional
```
Plant Manager
├── Operations Manager
│   ├── Shift Supervisors (x4 crews)
│   └── Day Operations Support
├── Maintenance Manager
│   ├── Mechanical Superintendent
│   ├── Electrical/Instrument Superintendent
│   ├── Planning Superintendent
│   └── Reliability Engineer
├── HSE Manager
└── Administration Manager
```
Best for: Single-process plants, clear functional delineation

#### Model 2: Area-Based
```
Plant Manager
├── Area 1 Manager (Operations + Maintenance)
│   ├── Operations Supervisor
│   └── Maintenance Supervisor
├── Area 2 Manager (Operations + Maintenance)
│   ├── Operations Supervisor
│   └── Maintenance Supervisor
├── Central Maintenance Services
├── HSE Manager
└── Administration Manager
```
Best for: Large, geographically spread facilities; multiple process areas

#### Model 3: Integrated Operations
```
Plant Manager
├── Production Manager
│   ├── Shift Supervisors (Ops + Maint)
│   └── Day Production Support
├── Asset Performance Manager
│   ├── Reliability Engineering
│   ├── Maintenance Planning
│   └── Condition Monitoring
├── HSE Manager
└── Support Services Manager
```
Best for: Modern, reliability-focused organizations; highly automated plants

## Step-by-Step Execution

### Phase 1: Analysis & Design Principles (Steps 1-3)
1. **Analyze Operating Model**: Understand:
   - Operating philosophy (owner-operated, contractor-operated, hybrid)
   - Operating pattern (24/7, shift work, day shift only)
   - Level of automation (highly automated = fewer operators)
   - Geographic layout (compact vs. spread)
   - Complexity (single vs. multiple process areas)
   - Corporate structure and reporting upward
2. **Define Design Principles**: Establish:
   - Span of control targets
   - Management layers target
   - In-house vs. outsourced functions
   - Matrix vs. hierarchical for specific functions
   - Decision-making authority framework
   - Key interfaces and their management
3. **Select Organizational Model**: Based on analysis:
   - Evaluate candidate models (functional, area-based, integrated)
   - Consider client's management philosophy and culture
   - Benchmark against comparable facilities
   - Select optimal model with rationale

### Phase 2: Structure Development (Steps 4-7)
4. **Design Overall Structure**: Create the top-level organization:
   - Plant Manager and direct reports
   - Department structure
   - Reporting lines (solid and dotted)
   - Key positions and their placement
5. **Design Department Structures**: For each department:
   - Internal hierarchy and reporting
   - Roles and positions
   - Shift vs. day roles
   - Contractor positions and their interface
6. **Design Shift Organization**: For each shift:
   - Minimum shift crew composition
   - Authority and decision-making during shifts
   - On-call support arrangements
   - Emergency response organization overlay
   - Shift handover participants
7. **Define Interfaces**: Document how departments interact:
   - Operations-Maintenance interface (work request, execution, handback)
   - Operations-HSE interface (permit management, incident response)
   - Maintenance-Supply Chain interface (parts procurement, inventory)
   - All functions-Management interface (reporting, escalation)

### Phase 3: RACI Development (Steps 8-10)
8. **Identify Key Processes**: List all major processes requiring RACI definition:
   - Operational processes (startup, shutdown, normal ops, emergency)
   - Maintenance processes (planning, scheduling, execution, closeout)
   - HSE processes (risk assessment, incident management, compliance)
   - Cross-functional processes (turnarounds, projects, budgeting)
   - Administrative processes (recruitment, training, performance management)
9. **Assign RACI**: For each process:
   - Determine who is Accountable (exactly one)
   - Determine who is Responsible (at least one)
   - Determine who must be Consulted
   - Determine who must be Informed
   - Validate: no gaps, no excessive C/I assignments
10. **Validate RACI**: Run validation checks:
    - Every row has exactly one A
    - Every row has at least one R
    - No role is overloaded with A assignments (bottleneck risk)
    - No activity has more than 3 C assignments (decision delay risk)
    - Cross-check with org chart (RACI assignments match reporting lines)

### Phase 4: Document Generation & Quality (Steps 11-13)
11. **Generate Org Charts (.pptx)**: Create all organizational charts following the visual standards.
12. **Generate RACI Matrix (.xlsx)**: Compile all RACI sheets with validation.
13. **Quality Review**: Verify alignment between org charts and RACI, completeness, and benchmark comparison.

## Quality Criteria

### Content Quality (Target: >91% SME Approval)
| Criterion | Weight | Description |
|-----------|--------|-------------|
| Strategic Alignment | 20% | Organization supports the operations and maintenance strategy |
| RACI Completeness | 20% | All key processes have RACI assignments; no gaps |
| Span of Control | 15% | Ratios are within industry norms and manageable |
| Clarity | 15% | Org charts are clear, roles are unambiguous |
| Regulatory Compliance | 10% | Mandatory positions are included (Experto PdR, etc.) |
| Benchmark Alignment | 10% | Structure is comparable to similar facilities |
| Interface Definition | 10% | Department interfaces are clearly defined |

### Automated Quality Checks
- [ ] Every position on the org chart has a reporting line
- [ ] No position reports to more than 2 managers (solid + 1 dotted max)
- [ ] Span of control for each manager is within defined targets
- [ ] Every RACI row has exactly one A
- [ ] Every RACI row has at least one R
- [ ] No role has more than 20 A assignments (overload check)
- [ ] Regulatory-mandated positions are present (Experto PdR, Administrador de Contrato, etc.)
- [ ] Shift organization covers 24/7 requirements (if applicable)
- [ ] Contractor positions are clearly distinguished
- [ ] Emergency response organization is defined
- [ ] On-call arrangements are specified for off-shift
- [ ] Color coding is consistent across all org chart slides
- [ ] Total headcount on org charts matches staffing plan

## MCP Integrations

- **mcp-sharepoint**: Store and distribute organizational design documents, RACI matrices, and role description templates
- **project-database**: Track position inventory, headcount by department, and RACI validation status
- **mcp-outlook**: Distribute organizational design proposals to stakeholders for review and approval

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs From)
| Agent/Skill | Input Provided | Criticality |
|-------------|---------------|-------------|
| `create-vsc-proposals` | Approved scope and operating model | High |
| `create-maintenance-strategy` | Maintenance organization requirements | High |
| `hse-agent` | HSE organizational requirements | High |
| Client/User | Corporate organizational policies | Medium |

### Downstream Dependencies (Outputs To)
| Agent/Skill | Output Provided | Trigger |
|-------------|----------------|---------|
| `create-staffing-plan` | Organizational structure for headcount calculation | Automatic |
| `create-training-plan` | Role definitions for competency mapping | Automatic |
| `create-contract-scope` | Contractor interface definitions | On request |
| `create-kpi-dashboard` | Organizational KPIs (span, layers, ratios) | On request |
| `create-change-mgmt-plan` | Current vs. future organization for change impact | On request |

### Collaboration During Execution
| Agent/Skill | Collaboration Type | When |
|-------------|-------------------|------|
| `hse-agent` | HSE organization validation | During HSE structure design |
| `create-maintenance-strategy` | Maintenance org alignment with RCM philosophy | During maintenance structure design |
| `create-staffing-plan` | Headcount alignment with structure | During validation |
| `review-documents` | Document quality review | After assembly |

## Templates & References

### Document Templates
- `VSC_OrgDesign_Template_v2.0.pptx` - Organizational chart presentation template
- `VSC_RACI_Template_v2.0.xlsx` - RACI matrix workbook template
- `VSC_RoleDescription_Template_v1.0.docx` - Role/position description template
- `VSC_InterfaceMatrix_Template_v1.0.xlsx` - Department interface definition

### Reference Documents
- VSC Organizational Design Best Practices Guide
- Industry organizational benchmarks by sector
- Chilean regulatory requirements for workplace organization
- Galbraith Star Model for organizational design

## Examples

### Example: RACI Matrix Entry - Maintenance Work Management Process

| Process / Activity | Ops Shift Super | Maint Planner | Maint Super | Maint Tech | Reliability Eng | Maint Manager | Warehouse |
|-------------------|----------------|---------------|-------------|------------|-----------------|---------------|-----------|
| Identify maintenance need / work request | R | I | I | | C | | |
| Create work order in CMMS | | R | A | | | | |
| Prioritize work order | C | R | A | | C | | |
| Plan work order (scope, parts, tools, time) | C | R/A | | | C | | C |
| Procure materials/spare parts | | R | | | | A | R |
| Schedule work order | C | R/A | C | | | | I |
| Approve work schedule | A | R | C | | | I | |
| Issue permit to work | R/A | | C | | | | |
| Execute maintenance work | C | I | A | R | | | |
| Quality check / acceptance test | R | | A | R | C | | |
| Close work order in CMMS | | R | A | I | | | |
| Return unused materials | | | I | R | | | A |
| Analyze failure (if CM) | I | I | C | I | R/A | I | |
| Report maintenance KPIs | | R | C | | R | A | |

### Example: Operations Shift Organization (Mining Concentrator)

```
TURNO A (12 hrs - Dia/Noche)

Jefe de Turno (Shift Supervisor)
├── Operador Panel Senior (Control Room - DCS) [1]
├── Operador Panel (Control Room - DCS) [1]
├── Operadores de Campo:
│   ├── Chancado Primario [1]
│   ├── Acopio y Alimentacion [1]
│   ├── Molienda SAG y Bolas [2]
│   ├── Flotacion y Remolienda [2]
│   ├── Espesamiento y Filtrado [1]
│   ├── Reactivos y Servicios [1]
│   └── Relaves [1]
├── Muestreador / Lab Turno [1]
└── Operador Puente Grua [1]

Total por turno: 13 personas
Turnos: 4 (A, B, C, D)
Patron: 4x4 continental (12 hrs)

Mantenimiento de Turno:
├── Supervisor Mto Turno [1]
├── Mecanico [2]
├── Electricista [1]
└── Instrumentista [1]

Total Mto por turno: 5 personas
```
