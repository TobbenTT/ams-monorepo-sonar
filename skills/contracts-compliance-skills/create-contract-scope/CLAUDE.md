---
name: create-contract-scope
description: "Create technical scope of work for O&M service contracts including KPIs and evaluation criteria. Triggers: 'contract scope', 'SOW', 'bases tecnicas', 'scope of work'."
---

# Create Contract Scope
## Skill ID: create-contract-scope
## Version: 1.0.0
## Category: A - Document Generation
## Priority: High

## Purpose
Generates comprehensive technical specifications (bases tecnicas) for Operations & Maintenance (O&M) service contracts. These documents define the scope, performance requirements, service levels, and technical standards that third-party contractors must meet when providing services to the facility.

Service contracts are a fundamental component of the operations model for any industrial facility. Most operations outsource some portion of their maintenance, specialized services, or support functions. The quality of the technical specification directly determines the quality of service received, the cost-effectiveness of the contract, and the ability to manage contractor performance. Poorly written contract scopes lead to scope disputes, underperformance, cost overruns, and safety incidents.

## Intent & Specification
The AI agent MUST understand that:

1. **Technical Specifications Drive Contract Quality**: The bases tecnicas are the technical heart of the service contract. They define WHAT must be done, to WHAT STANDARD, with WHAT resources, and HOW performance is measured. Commercial terms (pricing, payment, legal) are handled separately by procurement/legal.
2. **Scope Must Be Unambiguous**: Every service, activity, and responsibility must be clearly assigned to either the client or the contractor. Ambiguity leads to scope gaps and disputes.
3. **Performance-Based Where Possible**: Modern service contracts should emphasize outcomes (availability, response time, quality) rather than prescribing inputs (number of people, specific methods). However, some services require prescriptive specifications.
4. **Safety Integration is Mandatory**: Contractor HSE requirements must be explicitly defined, including safety statistics requirements, training, PPE, and compliance with site safety management systems.
5. **KPIs and SLAs Drive Accountability**: Every contract must have measurable Key Performance Indicators (KPIs) and Service Level Agreements (SLAs) with consequences for non-compliance (penalties) and incentives for exceptional performance.
6. **Multiple Contract Types**: Different services require different contract structures: lump sum, unit rate, time & materials, cost-plus, performance-based, etc.
7. **Language**: Spanish (Latin American), with technical terms in standard English where industry convention requires.

## Trigger / Invocation
```
/create-contract-scope
```

### Natural Language Triggers
- "Create contract specifications for [service type]"
- "Generate technical bases for [service] contract"
- "Write scope of work for [contractor service]"
- "Develop service contract technical specs for [maintenance/cleaning/logistics]"
- "Crear bases tecnicas para contrato de [servicio]"
- "Generar especificaciones tecnicas para licitacion de [servicio]"
- "Escribir alcance de servicio para contrato de [mantenimiento/aseo/etc.]"

## Input Requirements

### Required Inputs
| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `service_description` | Description of the service to be contracted | Text / .docx | User / Staffing plan |
| `operational_requirements` | Facility operating mode, hours, criticality | .docx / Text | Operations Model |
| `hse_standards` | Client HSE requirements and standards | .docx / .pdf | HSE Agent / Client |
| `facility_description` | Plant/site description, areas, layout | .docx / .pdf | Engineering |

### Optional Inputs (Highly Recommended)
| Input | Description | Default |
|-------|-------------|---------|
| `maintenance_strategy` | RCM results for outsourced maintenance scope | Generate from equipment list |
| `staffing_plan` | Contractor headcount requirements | Derive from scope |
| `existing_contracts` | Current contract documents for reference | None |
| `industry_benchmarks` | Service level benchmarks for this type of service | VSC internal benchmarks |
| `equipment_list` | Equipment covered by the service contract | Extract from scope |
| `regulatory_requirements` | Applicable regulations for contractor management | Chilean labor/safety regulations |
| `budget_constraints` | Budget envelope for the service | None (market-based) |
| `contract_duration` | Expected contract term | 3 years (initial) |
| `penalty_philosophy` | Client approach to penalties and incentives | Balanced (penalties + incentives) |
| `kpi_targets` | Expected performance levels | Industry benchmarks |

### Context Enrichment
The agent should automatically:
- Retrieve applicable labor and contractor management regulations
- Pull industry KPI benchmarks for the service type
- Search knowledge base for similar contract specifications
- Identify HSE requirements from the hse-agent
- Cross-reference with maintenance strategy for outsourced scope

## Output Specification

### Document: Technical Specification (.docx) - One per Service Contract
**Filename**: `VSC_BasesTecnicas_{ProjectCode}_{ServiceType}_{Version}_{Date}.docx`

**Structure**:

1. **Cover Page** - Project, service, revision control
2. **Document Control** - Revision history, distribution list
3. **Table of Contents**
4. **Definitions and Abbreviations**
5. **Introduction**
   - 5.1 Purpose of this document
   - 5.2 Context (project/facility overview)
   - 5.3 How to use this document in the bid process
   - 5.4 Contract structure overview
6. **Scope of Services**
   - 6.1 General description of services
   - 6.2 Detailed scope per service area
   - 6.3 Service boundaries and interfaces
   - 6.4 Included services (explicit list)
   - 6.5 Excluded services (explicit list)
   - 6.6 Client-provided resources and facilities
   - 6.7 Contractor-provided resources and facilities
7. **Service Standards and Requirements**
   - 7.1 Applicable standards (ISO, API, ASME, etc.)
   - 7.2 Quality requirements
   - 7.3 Industry codes of practice
   - 7.4 Client-specific standards and procedures
   - 7.5 Regulatory compliance requirements
8. **HSE Requirements**
   - 8.1 Safety management system compliance
   - 8.2 HSE policies and procedures
   - 8.3 Safety statistics requirements (LTIFR, TRIFR targets)
   - 8.4 Safety training and certification requirements
   - 8.5 PPE requirements
   - 8.6 Incident reporting and investigation
   - 8.7 Environmental compliance requirements
   - 8.8 Emergency response obligations
   - 8.9 Drug and alcohol policy compliance
   - 8.10 Behavioral safety program participation
9. **Personnel Requirements**
   - 9.1 Key personnel positions (must be named in bid)
   - 9.2 Minimum qualification and experience requirements by role
   - 9.3 Certification requirements
   - 9.4 Language requirements
   - 9.5 Client approval of personnel
   - 9.6 Personnel replacement procedures
   - 9.7 Working hours and shift patterns
   - 9.8 Subcontracting restrictions
10. **Equipment and Tools**
    - 10.1 Tools provided by contractor
    - 10.2 Equipment provided by contractor
    - 10.3 Vehicles provided by contractor
    - 10.4 Tools/equipment provided by client
    - 10.5 Calibration and maintenance of tools
    - 10.6 IT systems and software requirements
11. **Materials and Spare Parts**
    - 11.1 Materials procurement responsibility
    - 11.2 Spare parts management
    - 11.3 Consumables supply
    - 11.4 Client warehouse access
    - 11.5 Material quality requirements
12. **Performance Management**
    - 12.1 Key Performance Indicators (KPIs)
    - 12.2 Service Level Agreements (SLAs)
    - 12.3 KPI measurement methodology
    - 12.4 Reporting requirements and frequency
    - 12.5 Performance review meetings
    - 12.6 Penalty regime for underperformance
    - 12.7 Incentive regime for exceptional performance
    - 12.8 Continuous improvement requirements
13. **Reporting and Documentation**
    - 13.1 Daily reports
    - 13.2 Weekly reports
    - 13.3 Monthly management reports
    - 13.4 Annual performance review report
    - 13.5 CMMS usage and work order management
    - 13.6 Documentation standards
    - 13.7 Knowledge transfer requirements
14. **Transition and Mobilization**
    - 14.1 Mobilization plan requirements
    - 14.2 Transition from current service provider
    - 14.3 Knowledge transfer during transition
    - 14.4 Startup period and performance ramp-up
    - 14.5 Demobilization requirements at contract end
15. **Facilities and Accommodations**
    - 15.1 Office space provided
    - 15.2 Workshop space provided
    - 15.3 Storage areas
    - 15.4 Welfare facilities
    - 15.5 Accommodation (if remote site)
    - 15.6 Transportation
16. **Bid Requirements**
    - 16.1 Technical proposal requirements
    - 16.2 Pricing format requirements
    - 16.3 Evaluation criteria and weightings
    - 16.4 Clarification process
    - 16.5 Site visit arrangements
17. **Appendices**
    - A: Equipment list covered by service
    - B: Site layout and area definitions
    - C: KPI calculation formulas and examples
    - D: Report templates
    - E: HSE statistics requirements
    - F: Key personnel qualification matrix
    - G: Pricing schedule template
    - H: RACI matrix (Client vs. Contractor responsibilities)

### Common Contract Types and Their Structures

| Service Type | Typical Contract Model | Key Specifications |
|-------------|----------------------|-------------------|
| Plant Maintenance | Performance-based (availability KPIs) | Craft headcount, response times, PM compliance |
| Industrial Cleaning | Unit rate (per area/event) | Frequency, quality standards, coverage areas |
| Warehouse & Logistics | Lump sum + unit rates | Inventory accuracy, fill rates, cycle counts |
| Mobile Equipment Maintenance | Availability-based | Fleet availability %, response time, MTTR |
| Electrical/Instrumentation | Lump sum + T&M for projects | PM compliance, calibration accuracy, response |
| Catering & Camp | Per-person-per-day rate | Menu standards, HSE compliance, satisfaction KPI |
| Security | Lump sum | Coverage hours, incident response time |
| Environmental Services | Lump sum + unit rates | Compliance rate, monitoring accuracy |
| Specialized Services (NDT, RBI) | Unit rate per inspection | Qualification (ASNT/PCN), report quality, turnaround |

## Methodology & Standards

### Primary Standards
| Standard | Application |
|----------|-------------|
| **ISO 55000** | Asset management - contractor alignment with asset management objectives |
| **ISO 41001** | Facility management - service delivery standards |
| **ISO 45001** | Occupational health and safety - contractor HSE management |
| **EN 13269** | Maintenance - guideline on preparation of maintenance contracts |
| **Chilean Labor Code** | Contractor labor compliance (Art. 183-A to 183-E: subcontracting) |

### KPI Framework for Service Contracts
| KPI Category | Example KPIs | Target Range |
|-------------|-------------|-------------|
| Safety | LTIFR, TRIFR, Near-miss reporting rate | Zero harm; TRIFR < 5.0 |
| Availability | Equipment/system availability % | > 92-97% depending on criticality |
| Response | Emergency response time | < 30 min (critical), < 2 hrs (urgent) |
| PM Compliance | PM work orders completed on schedule | > 95% |
| Quality | Rework rate, first-time-fix rate | Rework < 3%, FTF > 85% |
| Cost | Maintenance cost per unit of production | Within budget +/- 5% |
| Environmental | Environmental compliance rate | 100% (zero non-compliance) |
| Reporting | Report submission on time | 100% |

## Step-by-Step Execution

### Phase 1: Scope Definition (Steps 1-4)
1. **Define Service Boundaries**: Clearly delineate:
   - What is included in the contractor's scope
   - What remains with the client
   - What is shared (RACI matrix)
   - Physical boundaries (which areas/equipment)
   - Temporal boundaries (working hours, coverage)
2. **Detail Service Requirements**: For each service area:
   - Describe specific activities and deliverables
   - Define frequency and scheduling requirements
   - Specify quality standards and acceptance criteria
   - Identify materials and resources required
   - Note any seasonal or campaign variations
3. **Define HSE Requirements**: Specify:
   - Safety management system requirements
   - Safety training and certification requirements
   - Safety performance targets (LTIFR, TRIFR)
   - Environmental compliance requirements
   - Drug and alcohol policy
   - Incident management requirements
4. **Define Personnel Requirements**:
   - Key personnel positions with qualifications
   - General workforce qualification requirements
   - Shift patterns and coverage requirements
   - Subcontracting restrictions
   - Client approval rights

### Phase 2: Performance Framework (Steps 5-7)
5. **Design KPI Framework**: For each KPI:
   - Define the KPI clearly (what is measured)
   - Specify calculation methodology (formula)
   - Set target, minimum acceptable, and stretch levels
   - Define measurement frequency
   - Specify data source and reporting responsibility
6. **Design SLA Framework**: For response-based services:
   - Define priority levels (critical, urgent, routine, planned)
   - Set response time and resolution time for each priority
   - Define escalation procedures
   - Set SLA compliance targets
7. **Design Penalty/Incentive Regime**:
   - Define penalty triggers (KPI below minimum)
   - Calculate penalty amounts (typically % of monthly invoice)
   - Define incentive triggers (KPI above stretch)
   - Calculate incentive amounts (shared savings, bonus)
   - Set overall penalty cap (typically 10-15% of monthly fee)
   - Set incentive cap

### Phase 3: Document Generation (Steps 8-10)
8. **Generate Contract Specification (.docx)**: Write the complete document following the structure defined above.
9. **Generate Appendices**: Create all supporting appendices:
   - Equipment lists, site layouts, KPI formulas
   - Report templates, pricing schedules
   - RACI matrix
10. **Quality Review**: Verify completeness, clarity, and internal consistency.

## Quality Criteria

### Content Quality (Target: >91% SME Approval)
| Criterion | Weight | Description |
|-----------|--------|-------------|
| Scope Clarity | 25% | No ambiguity in what is included/excluded; RACI is complete |
| HSE Robustness | 20% | Safety requirements are comprehensive and enforceable |
| KPI/SLA Quality | 20% | KPIs are measurable, achievable, and aligned with business needs |
| Completeness | 15% | All sections of the specification are fully developed |
| Industry Alignment | 10% | Standards, benchmarks, and practices reflect industry norms |
| Biddability | 10% | A contractor can prepare a responsive bid from this specification |

### Automated Quality Checks
- [ ] All services listed as included have detailed descriptions
- [ ] Excluded services are explicitly stated
- [ ] RACI matrix covers all major activities
- [ ] Every KPI has a formula, target, and measurement method
- [ ] HSE requirements include all mandatory certifications
- [ ] Personnel requirements specify qualifications for all roles
- [ ] Penalty regime has cap and calculation method
- [ ] Bid evaluation criteria are stated with weightings
- [ ] Equipment list is complete (if equipment-based scope)
- [ ] Report templates are provided for all required reports
- [ ] No placeholder text remaining
- [ ] Contract duration and renewal terms are stated

## MCP Integrations

| MCP Server | Purpose |
|------------|---------|
| `mcp-sharepoint` | Store and retrieve contract templates, scope documents, and technical specifications |
| `mcp-outlook` | Send vendor communications, distribute RFP packages, and manage bid clarifications |

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs From)
| Agent/Skill | Input Provided | Criticality |
|-------------|---------------|-------------|
| `create-staffing-plan` | Contractor headcount and scope definition | Critical |
| `create-maintenance-strategy` | Outsourced maintenance scope and tasks | High |
| `hse-agent` | HSE requirements and standards | Critical |
| `create-kpi-dashboard` | KPI definitions and targets | High |
| `create-org-design` | Organizational model and contractor interfaces | Medium |

### Downstream Dependencies (Outputs To)
| Agent/Skill | Output Provided | Trigger |
|-------------|----------------|---------|
| `procurement-agent` | Technical specifications for bid process | On request |
| `create-kpi-dashboard` | Contract KPIs for monitoring dashboard | Automatic |
| `contractor-management-agent` | Performance monitoring framework | On contract award |

### Collaboration During Execution
| Agent/Skill | Collaboration Type | When |
|-------------|-------------------|------|
| `hse-agent` | HSE requirements validation | During HSE section development |
| `create-maintenance-strategy` | Scope alignment for maintenance contracts | During scope definition |
| `legal-agent` | Commercial terms alignment | After technical specification complete |
| `review-documents` | Document quality review | After assembly |

## Templates & References

### Document Templates
- `VSC_BasesTecnicas_Template_v2.0.docx` - Technical specification template
- `VSC_RACI_Template_v1.0.xlsx` - RACI matrix template
- `VSC_KPI_Framework_Template_v1.5.xlsx` - KPI definition template
- `VSC_BidEvaluation_Template_v1.0.xlsx` - Bid evaluation matrix

### Reference Documents
- EN 13269:2016 Maintenance Outsourcing Guide
- VSC Service Contract Best Practices Guide
- Industry KPI benchmark databases
- Chilean subcontracting regulations (Ley 20.123)

## Examples

### Example: Maintenance Contract KPI Table

| KPI | Definition | Target | Minimum | Stretch | Measurement | Penalty/Incentive |
|-----|-----------|--------|---------|---------|-------------|-------------------|
| Equipment Availability | Running hours / (Running + Downtime due to maintenance) x 100% | >= 94% | >= 92% | >= 96% | Monthly | -2% invoice per 1% below min; +1% bonus per 1% above stretch |
| PM Compliance | PM WOs completed on schedule / Total PM WOs planned x 100% | >= 95% | >= 90% | >= 98% | Monthly | -1% per 1% below min |
| Emergency Response Time | Time from notification to technician on-site (critical equipment) | < 30 min | < 60 min | < 15 min | Per event | -0.5% per event exceeding min |
| TRIFR | Total Recordable Injury Frequency Rate per million hours worked | < 3.0 | < 5.0 | 0 | Quarterly | -5% if exceeds min; +2% if zero injuries |
| Rework Rate | Repeat work orders within 30 days / Total CM WOs x 100% | < 3% | < 5% | < 1% | Monthly | -1% per 1% above min |
| Backlog Management | Ready-to-schedule backlog in weeks of capacity | 2-4 weeks | < 6 weeks | 2-3 weeks | Weekly | Flag for review if > 6 weeks |
