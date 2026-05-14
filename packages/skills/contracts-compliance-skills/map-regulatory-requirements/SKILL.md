---
name: map-regulatory-requirements
description: "Map regulatory requirements by jurisdiction for operational permits and compliance. Triggers: 'regulatory mapping', 'permits', 'requisitos regulatorios', 'permisos'."
---

# Map Regulatory Requirements

## Skill ID: L-01

## Version: 1.0.0

## Category: L. Compliance Intelligence

## Priority: P1 - High (foundational input for permits, compliance programs, and operational authorization)

---

## Purpose

Map ALL applicable regulatory requirements for the operational jurisdiction of an industrial facility, producing a comprehensive regulatory register, compliance calendar, permit tracking system, and gap analysis report. This skill transforms the complex, multi-layered regulatory landscape into a structured, actionable compliance framework that ensures no requirement is overlooked before or during operations.

Industrial facilities operating in mining, oil and gas, chemical processing, and energy generation face an extraordinarily complex regulatory environment. A single mining operation in Chile may be subject to 200-500+ distinct regulatory requirements spanning federal mining regulations (SERNAGEOMIN), environmental enforcement (SMA - Superintendencia del Medio Ambiente), water rights (DGA - Direccion General de Aguas), occupational health (SEREMI de Salud), electrical safety (SEC - Superintendencia de Electricidad y Combustibles), labor standards (Direccion del Trabajo), and municipal ordinances. These requirements originate from overlapping jurisdictions -- federal, regional, and local -- each with different reporting cycles, renewal timelines, and enforcement mechanisms. The sheer volume and complexity of this regulatory web creates significant risk of non-compliance.

The consequences of regulatory gaps discovered post-startup are severe and well-documented. Organizations that fail to identify and comply with all applicable requirements face fines ranging from $1M to $50M+ depending on jurisdiction and severity. In Chile alone, the SMA has levied sanctions exceeding $20M USD for environmental non-compliance at mining operations. Beyond financial penalties, regulatory violations can result in operational shutdown orders, criminal liability for executives, revocation of operating permits, community opposition escalation, and irreparable reputational damage. The Dominga mining project in Chile, for example, faced years of delays and billions in lost value due to regulatory and permitting challenges.

This skill addresses Pain Point CE-03 (Regulatory Complexity) identified in the OR System framework. Industry benchmarks indicate that organizations with structured regulatory mapping processes achieve 95%+ first-time compliance rates, compared to 60-70% for organizations relying on ad hoc regulatory tracking. The proactive identification of all regulatory requirements during the Operational Readiness phase -- 12-24 months before startup -- enables timely permit acquisition, infrastructure modifications for compliance, training program alignment, and establishment of monitoring and reporting systems. This skill integrates with MCP servers for continuous regulatory monitoring, document storage, and compliance matrix management, ensuring the regulatory register remains a living document throughout the facility lifecycle.

---

## Intent & Specification

### Problem Statement

Industrial facilities operate under hundreds of overlapping regulatory requirements from multiple jurisdictions and regulatory bodies. Manual identification and tracking of these requirements is error-prone, time-consuming, and frequently incomplete. Organizations typically discover 15-25% of applicable requirements only after startup or during regulatory audits, resulting in costly remediation, fines, and operational disruptions.

### What the Agent MUST Do

The AI agent MUST understand and execute the following core requirements:

1. **Jurisdiction Mapping**: Identify ALL applicable jurisdictions for the facility location, including federal/national, state/regional, provincial, municipal, and special district (e.g., environmental protection zones, indigenous territories, water basin authorities) regulatory bodies. For Chilean operations, this includes but is not limited to: SERNAGEOMIN, SMA, DGA, SEREMI de Salud, SEC, Direccion del Trabajo, SAG, CONAF, CMN, and relevant municipal governments.

2. **Regulatory Inventory**: Build a complete inventory of all laws, decrees, regulations, technical standards, and guidelines applicable to the facility type, industry sector, materials handled, emissions profile, and workforce characteristics. Each regulation must be cataloged with its full citation, issuing authority, effective date, amendment history, and enforcement mechanism.

3. **Applicability Assessment**: Evaluate each identified regulation against the specific facility characteristics (process type, capacity, chemicals used, number of workers, location, environmental receptors) to determine whether it applies in full, in part, or is not applicable. Document the rationale for each applicability determination.

4. **Requirement Extraction**: For each applicable regulation, extract the specific operational requirements (what the facility must do or not do), reporting obligations (what must be reported, to whom, and when), permit requirements (what permits are needed, from whom, and their renewal cycles), and compliance evidence requirements (what records must be maintained).

5. **Gap Analysis**: Compare the extracted requirements against the facility's current compliance status (existing permits, procedures, monitoring systems, training programs) to identify gaps that must be closed before startup or within specified timelines.

6. **Compliance Calendar**: Generate a time-based calendar of all compliance obligations including permit renewals, reporting deadlines, inspection schedules, monitoring requirements, and training renewal dates, with automated alerting thresholds.

7. **Permit Tracking**: Create a structured permit tracking system that monitors the status of every required permit, license, and authorization from application through issuance, with renewal tracking and expiration alerting.

8. **Continuous Monitoring Integration**: Configure integration with regulatory monitoring tools (MCP web monitors) to track changes in applicable regulations, new regulations, and enforcement trends that may affect the facility's compliance obligations.

---

## Trigger / Invocation

```
/map-regulatory-requirements
```

**Aliases**: `/regulatory-mapping`, `/compliance-register`, `/mapeo-regulatorio`, `/registro-cumplimiento`

**Natural Language Triggers (EN)**:
- "Map all regulatory requirements for this facility"
- "Build a regulatory compliance register"
- "What permits do we need for this operation?"
- "Identify all applicable regulations for this mining project"
- "Create a compliance calendar for our operations"
- "Perform a regulatory gap analysis"

**Natural Language Triggers (ES)**:
- "Mapear todos los requisitos regulatorios para esta instalacion"
- "Construir un registro de cumplimiento regulatorio"
- "Que permisos necesitamos para esta operacion?"
- "Identificar todas las regulaciones aplicables al proyecto minero"
- "Crear un calendario de cumplimiento"
- "Realizar un analisis de brechas regulatorias"

**Trigger Conditions**:
- User provides facility location and industry sector for regulatory mapping
- A project workflow requires regulatory compliance assessment as input for OR planning
- An upstream agent (e.g., OR orchestrator) routes a regulatory mapping task
- Pre-startup safety review (PSSR) requires regulatory compliance verification
- Management of Change (MOC) requires regulatory impact assessment
- New jurisdiction or regulation identified requiring compliance assessment

---

## Input Requirements

### Required Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `facility_location` | Text, coordinates, or address | Precise location of the facility including country, state/region, municipality, and geographic coordinates. Required for jurisdiction identification |
| `industry_sector` | Text | Primary industry sector (e.g., copper mining, lithium processing, oil refinery, chemical plant, power generation). Determines the applicable regulatory framework |
| `facility_description` | .docx, text | Description of the facility including process type, capacity, materials handled, emission sources, water usage, workforce size, operating hours, and any hazardous substance storage |
| `operational_phase` | Text | Current or planned phase: design, construction, commissioning, operations, expansion, closure. Determines which phase-specific regulations apply |

### Optional Inputs (Enhance Quality)

| Input | Format | Description |
|-------|--------|-------------|
| `environmental_impact_assessment` | .pdf, .docx | Approved EIA/DIA (Declaracion de Impacto Ambiental or Estudio de Impacto Ambiental) with conditions (RCA - Resolucion de Calificacion Ambiental) |
| `existing_permits` | .xlsx, .pdf | Inventory of currently held permits, licenses, and authorizations with status and expiration dates |
| `process_flow_diagrams` | .pdf | PFDs identifying material flows, emissions points, and waste streams for regulatory applicability |
| `chemical_inventory` | .xlsx | List of chemicals stored, used, and produced with quantities, classifications, and SDS references |
| `water_balance` | .xlsx, .pdf | Water intake, consumption, discharge, and recycling data for water rights and discharge permit requirements |
| `workforce_profile` | .xlsx | Workforce size, shift patterns, contractor ratio, hazardous work classifications |
| `previous_regulatory_audits` | .pdf, .docx | Previous audit findings, non-conformances, and corrective action status |
| `corporate_compliance_standards` | .docx | Parent company compliance policies, voluntary commitments (e.g., ICMM, Responsible Mining) |
| `community_agreements` | .pdf | Community engagement commitments, indigenous consultation records, social license agreements |

### Context Enrichment

The agent will automatically enrich the regulatory mapping by:
- Querying regulatory databases for the identified jurisdiction (via mcp-web-monitor)
- Cross-referencing facility characteristics against regulatory applicability thresholds
- Identifying upcoming regulatory changes in the pipeline (proposed regulations, consultation periods)
- Benchmarking against similar facilities in the same jurisdiction for completeness verification
- Incorporating voluntary standards and industry best practices (ICMM, IFC Performance Standards)

### Input Validation Rules

- Facility location must be specific enough to identify all applicable jurisdictions (at minimum: country and region/state)
- Industry sector must be identifiable to a standard classification (ISIC, CIIU, or equivalent)
- Facility description must include enough detail to assess applicability of sector-specific regulations
- If an EIA/RCA exists, it must be provided as it contains binding compliance conditions

---

## Output Specification

### Deliverable 1: Regulatory Register (.xlsx)

**Filename**: `{ProjectCode}_Regulatory_Register_v{version}_{date}.xlsx`

**Workbook Structure**:

#### Sheet 1: "Executive Summary"
- Total regulations identified, by jurisdiction level, by regulatory body
- Applicability distribution: Fully Applicable / Partially Applicable / Not Applicable / Under Review
- Key compliance risks (top 10 by severity)
- Permit status summary: Obtained / In Process / Not Applied / Not Required
- Compliance readiness score (% of requirements with evidence of compliance)

#### Sheet 2: "Regulatory Register"

| Column | Field Name | Description | Example |
|--------|-----------|-------------|---------|
| A | Reg_ID | Unique regulation identifier | REG-CL-MIN-001 |
| B | Jurisdiction_Level | Federal/Regional/Municipal/Special | Federal |
| C | Country | Country code | CL |
| D | Region_State | Region or state | Region de Antofagasta |
| E | Regulatory_Body | Issuing authority | SERNAGEOMIN |
| F | Regulation_Name | Full name of the regulation | DS 132 - Reglamento de Seguridad Minera |
| G | Regulation_Number | Official citation number | Decreto Supremo 132 |
| H | Effective_Date | Date regulation became effective | 2004-02-07 |
| I | Last_Amendment | Date of last amendment | 2023-06-15 |
| J | Category | Regulatory category | Mining Safety |
| K | Sub_Category | Specific sub-topic | Underground Ventilation |
| L | Applicability | Full / Partial / Not Applicable / Under Review | Full |
| M | Applicability_Rationale | Why this regulation applies or not | Open-pit mining operation with blasting activities |
| N | Specific_Requirements | Extracted operational requirements | Minimum ventilation rates per worker, gas monitoring frequency |
| O | Reporting_Obligations | What must be reported, to whom, frequency | Monthly safety statistics to SERNAGEOMIN via SIGMIN |
| P | Permit_Required | Yes/No and permit type | Yes - Operational Safety Authorization |
| Q | Compliance_Evidence | Required documentation/records | Ventilation studies, gas monitoring records, emergency plans |
| R | Penalty_for_Non_Compliance | Maximum penalty or consequence | Closure order, fines up to 10,000 UTM (~$8M USD) |
| S | Current_Status | Compliant / Gap / In Progress / Not Assessed | Gap |
| T | Gap_Description | Description of compliance gap if any | Ventilation study not updated for new extraction level |
| U | Priority | Critical / High / Medium / Low | High |
| V | Owner | Responsible role or department | HSE Manager |
| W | Due_Date | Target compliance date | 2025-03-01 |
| X | Notes | Additional context or cross-references | Linked to RCA Condition #14 |

#### Sheet 3: "Jurisdiction Map"
- Visual hierarchy of all applicable jurisdictions
- Regulatory body matrix: Authority, Mandate, Enforcement Power, Contact Information
- Jurisdictional overlap analysis (where multiple bodies regulate the same topic)
- Escalation hierarchy for regulatory disputes

#### Sheet 4: "Applicability Matrix"
- Cross-reference matrix: Facility characteristics vs. regulatory applicability thresholds
- Trigger analysis: what facility parameters (e.g., >50 workers, >10 tons hazardous chemicals) activate specific regulations
- Conditional applicability notes (regulations that apply only in certain operational phases or conditions)

#### Sheet 5: "Statistics & Dashboard Data"
- Regulation count by jurisdiction, category, applicability status
- Compliance readiness percentage by category
- Gap distribution by priority and category
- Timeline of upcoming compliance deadlines (next 24 months)

### Deliverable 2: Compliance Calendar (.xlsx)

**Filename**: `{ProjectCode}_Compliance_Calendar_v{version}_{date}.xlsx`

**Workbook Structure**:

#### Sheet 1: "Calendar Overview"
| Column | Field Name | Description |
|--------|-----------|-------------|
| A | Obligation_ID | Unique obligation identifier |
| B | Reg_ID | Link to Regulatory Register |
| C | Obligation_Type | Report / Renewal / Inspection / Monitoring / Training / Filing |
| D | Description | What must be done |
| E | Regulatory_Body | Receiving authority |
| F | Frequency | One-time / Monthly / Quarterly / Semi-annual / Annual / Biennial |
| G | Due_Date | Next due date |
| H | Alert_Date_90d | 90-day advance alert |
| I | Alert_Date_30d | 30-day advance alert |
| J | Alert_Date_7d | 7-day advance alert |
| K | Responsible | Assigned role/department |
| L | Evidence_Required | Documentation to submit or retain |
| M | Submission_Method | Online portal / Physical / Email / API |
| N | Status | Pending / In Progress / Submitted / Overdue / Completed |
| O | Completion_Date | Actual completion date |
| P | Notes | Special instructions or dependencies |

#### Sheet 2: "Monthly View"
- Gantt-style monthly view of all obligations for the next 24 months
- Color coding by obligation type and priority
- Resource loading by responsible department

#### Sheet 3: "Annual Recurring"
- All annually recurring obligations with historical compliance tracking
- Year-over-year comparison of compliance timeliness

### Deliverable 3: Permit Tracking (.xlsx)

**Filename**: `{ProjectCode}_Permit_Tracker_v{version}_{date}.xlsx`

**Workbook Structure**:

#### Sheet 1: "Permit Register"
| Column | Field Name | Description |
|--------|-----------|-------------|
| A | Permit_ID | Unique permit identifier |
| B | Permit_Type | Environmental / Mining / Water / Safety / Electrical / Construction / Other |
| C | Permit_Name | Full name of the permit or authorization |
| D | Issuing_Authority | Regulatory body that grants the permit |
| E | Reg_Reference | Linked regulation in the Regulatory Register |
| F | Application_Date | Date application was submitted |
| G | Expected_Processing_Time | Typical processing duration |
| H | Issue_Date | Date permit was granted |
| I | Expiration_Date | Permit expiration date |
| J | Renewal_Lead_Time | How far in advance to start renewal |
| K | Renewal_Alert_Date | Calculated date to begin renewal process |
| L | Conditions | Key conditions attached to the permit |
| M | Monitoring_Requirements | Ongoing monitoring required by permit conditions |
| N | Status | Not Applied / Application Prep / Submitted / Under Review / Approved / Rejected / Expired / Renewal |
| O | Critical_Path | Yes/No - Is this permit on the critical path to startup? |
| P | Dependencies | Other permits that must be obtained first |
| Q | Owner | Responsible person/role |
| R | Cost | Application and renewal fees |
| S | Notes | Special conditions, appeal status, etc. |

#### Sheet 2: "Permit Timeline"
- Critical path visualization for all permits required before startup
- Dependencies between permits (e.g., EIA approval required before water rights)
- Processing time buffers and risk flags for permits behind schedule

#### Sheet 3: "Permit Conditions Tracker"
- Detailed tracking of each condition attached to granted permits
- Compliance status per condition
- Evidence documentation references

### Deliverable 4: Gap Analysis Report (.docx)

**Filename**: `{ProjectCode}_Regulatory_Gap_Analysis_v{version}_{date}.docx`

**Document Structure (25-40 pages)**:

1. **Executive Summary** (2-3 pages)
   - Overall compliance readiness assessment
   - Critical gaps requiring immediate attention
   - Estimated remediation timeline and resource requirements
   - Risk exposure summary (financial, operational, reputational)

2. **Scope and Methodology** (2-3 pages)
   - Facilities and operations assessed
   - Regulatory sources consulted
   - Assessment methodology and rating criteria
   - Limitations and assumptions

3. **Regulatory Landscape Overview** (3-4 pages)
   - Jurisdiction map and regulatory body summary
   - Key regulatory frameworks applicable to the facility
   - Recent regulatory changes and trends
   - Upcoming regulatory changes in the pipeline

4. **Compliance Status Assessment** (5-8 pages)
   - Category-by-category compliance assessment
   - Compliance heat map by regulatory category and severity
   - Detailed gap descriptions with root cause analysis
   - Risk rating per gap (likelihood of detection x consequence of non-compliance)

5. **Gap Analysis Detail** (5-8 pages)
   - Gap inventory with full details per gap
   - Gap priority ranking methodology
   - Gap clustering by root cause (documentation, infrastructure, training, systems)
   - Cross-references to specific regulatory citations

6. **Remediation Plan** (3-5 pages)
   - Prioritized action items for gap closure
   - Resource requirements (people, budget, time)
   - Implementation timeline with milestones
   - Dependencies and critical path items

7. **Permit Strategy** (2-3 pages)
   - Permit acquisition strategy and timeline
   - Critical path permits and risk mitigation
   - Regulatory engagement strategy
   - Stakeholder communication plan

8. **Recommendations** (2-3 pages)
   - Compliance management system recommendations
   - Organizational structure for compliance
   - Technology and monitoring system requirements
   - Continuous improvement program

9. **Appendices**
   - Complete regulatory register extract
   - Gap detail sheets
   - Permit timeline Gantt chart
   - Reference document list

### Formatting Standards
- Compliance status colors: Compliant=Green (#008000), Gap=Red (#FF0000), In Progress=Yellow (#FFD700), Not Assessed=Gray (#808080)
- Priority colors: Critical=Red, High=Orange, Medium=Yellow, Low=Green
- Report follows VSC document template with corporate branding
- All tables numbered and cross-referenced
- All regulatory citations in standard legal citation format

---

## Methodology & Standards

### Primary Standards

| Standard | Application |
|----------|-------------|
| ISO 14001:2015 | Environmental management systems -- Requirements for legal and other requirements register (Clause 6.1.3) |
| ISO 45001:2018 | Occupational health and safety management systems -- Legal and other requirements (Clause 6.1.3) |
| ISO 19600:2014 / ISO 37301:2021 | Compliance management systems -- Framework for regulatory identification and compliance obligations |
| ICMM 10 Principles | Mining industry voluntary framework including environmental and social governance requirements |
| IFC Performance Standards | International Finance Corporation standards for environmental and social sustainability |
| Equator Principles | Financial industry benchmark for environmental and social risk management |

### Secondary Standards

| Standard | Application |
|----------|-------------|
| ISO 14015:2022 | Environmental management -- Environmental assessment of sites and organizations (EASO) |
| ISO 31000:2018 | Risk management -- Applied to compliance risk assessment |
| IRMA Standard for Responsible Mining | Initiative for Responsible Mining Assurance certification requirements |
| TSM (Towards Sustainable Mining) | Mining Association of Canada sustainability framework |
| GRI Standards (2021) | Global Reporting Initiative -- Sustainability reporting regulatory requirements |
| SASB Standards | Sustainability Accounting Standards Board -- Industry-specific disclosure requirements |

### Chilean Regulatory Framework (Key Authorities)

| Regulatory Body | Abbreviation | Mandate | Key Regulations |
|-----------------|-------------|---------|-----------------|
| Servicio Nacional de Geologia y Mineria | SERNAGEOMIN | Mining safety and operations | DS 132, Codigo de Mineria, Ley 18.248 |
| Superintendencia del Medio Ambiente | SMA | Environmental enforcement | Ley 20.417, DS 40, RCA conditions |
| Direccion General de Aguas | DGA | Water rights and resources | Codigo de Aguas, DS 203 |
| SEREMI de Salud | SEREMI Salud | Occupational and public health | DS 594, Codigo Sanitario |
| Superintendencia de Electricidad y Combustibles | SEC | Electrical and fuel safety | NSEG, Ley 20.936 |
| Direccion del Trabajo | DT | Labor standards and worker rights | Codigo del Trabajo, Ley 16.744 |
| Servicio Agricola y Ganadero | SAG | Agricultural and environmental protection | Ley 18.755 |
| CONAF | CONAF | Forest and biodiversity protection | Ley 20.283 |
| Consejo de Monumentos Nacionales | CMN | Archaeological and heritage protection | Ley 17.288 |
| Municipalidades | Municipal | Land use and local permits | Municipal ordinances, patentes municipales |

### Key Regulatory Frameworks by Industry

**Mining (Chile)**:
- DS 132 - Reglamento de Seguridad Minera (Mining Safety Regulation)
- DS 594 - Condiciones sanitarias y ambientales basicas en los lugares de trabajo
- Ley 16.744 - Seguro social contra riesgos de accidentes del trabajo
- DS 40 - Reglamento del Sistema de Evaluacion de Impacto Ambiental (SEIA)
- Codigo de Aguas - Water rights and usage regulations
- NCh Elec. 4/2003 - Electrical installations code
- DS 248 - Reglamento para la aprobacion de proyectos de diseno, construccion, operacion y cierre de depositos de relaves

**Oil & Gas**:
- DS 160 - Reglamento de Seguridad para las Instalaciones y Operaciones de Produccion y Refinacion, Transporte y Almacenamiento de Hidrocarburos
- ENAP regulatory framework
- SEC fuel storage and handling regulations

**Chemical Processing**:
- DS 43 - Reglamento de Almacenamiento de Sustancias Peligrosas
- DS 78 - Reglamento de Almacenamiento de Sustancias Peligrosas (updated)
- GHS implementation requirements

---

## Step-by-Step Execution

### Phase 1: Jurisdiction Mapping & Scoping (Steps 1-3)
**Step 1: Identify All Applicable Jurisdictions**
### Phase 2: Regulatory Inventory & Analysis (Steps 4-7)
**Step 4: Build the Regulatory Inventory**
### Phase 3: Gap Analysis & Calendar (Steps 8-12)
**Step 8: Assess Current Compliance Status**
### Phase 4: Validation & Reporting (Steps 13-16)
**Step 13: Cross-Validate Completeness**

See [`references/skill-detailed-steps.md`](references/skill-detailed-steps.md) for complete detailed execution steps.

## Quality Criteria

### Scoring Table

| Criterion | Weight | Target | Minimum Acceptable | Measurement Method |
|-----------|--------|--------|--------------------|--------------------|
| Regulatory completeness (all applicable regulations identified) | 25% | 100% | >95% | Cross-validation against industry benchmarks and legal review |
| Applicability accuracy (correct determination for each regulation) | 20% | >98% | >95% | Legal counsel validation on sample of 20% of determinations |
| Requirement extraction depth (all obligations captured per regulation) | 15% | >95% | >90% | Sample audit of extracted requirements against source regulations |
| Gap analysis accuracy (correct compliance status assessment) | 15% | >95% | >90% | Verification against evidence documentation |
| Calendar completeness (all recurring obligations captured) | 10% | 100% | >98% | Cross-check against regulatory register obligations |
| Permit tracking completeness (all required permits identified) | 10% | 100% | >98% | Cross-validation against regulatory register and EIA conditions |
| SME/Legal approval rating | 5% | >95% | >90% | Review and sign-off by legal counsel and HSE leadership |

### Automated Quality Checks

- [ ] Every regulation in the register has a unique ID and full citation
- [ ] Every regulation has an applicability determination with documented rationale
- [ ] Every applicable regulation has at least one extracted requirement
- [ ] Every gap has a priority rating and assigned owner
- [ ] Every permit has a status and responsible party
- [ ] The compliance calendar covers at least 24 months forward
- [ ] Alert dates are calculated correctly (90/30/7 days before due dates)
- [ ] No duplicate regulations in the register
- [ ] All RCA conditions are captured if an EIA exists
- [ ] Cross-references between register, calendar, and permit tracker are consistent
- [ ] Penalty information is documented for all applicable regulations
- [ ] The jurisdiction map includes all levels of government
- [ ] Regulatory body contact information is current and complete
- [ ] Voluntary commitments (ICMM, IFC, etc.) are included if applicable

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents)

| Agent/Skill | Input Received | Criticality | MCP Integration |
|-------------|---------------|-------------|-----------------|
| `create-or-framework` | Project scope, facility parameters, operational context | Critical | mcp-sharepoint |
| `create-risk-assessment` | Risk register identifying regulatory compliance risks | High | mcp-sharepoint |
| `extract-data-from-docs` | Extracted data from EIA, permits, and regulatory documents | High | mcp-sharepoint |
| `create-asset-register` | Equipment and materials inventory for regulatory applicability | Medium | mcp-sharepoint |
| `create-org-design` | Organizational structure for compliance role assignments | Medium | mcp-sharepoint |
| Document Ingestion Agent | Parsed regulatory documents, EIA conditions, permit documents | Critical | mcp-sharepoint |

### Downstream Dependencies (Outputs TO other agents)

| Agent/Skill | Output Provided | Criticality | MCP Integration |
|-------------|----------------|-------------|-----------------|
| `create-commissioning-plan` | Regulatory requirements for pre-startup compliance | Critical | mcp-sharepoint |
| `prepare-pssr-package` | Regulatory compliance checklist for PSSR verification | Critical | mcp-sharepoint |
| `create-training-plan` | Regulatory training requirements by role | High | mcp-sharepoint |
| `create-operations-manual` | Regulatory requirements to embed in operating procedures | High | mcp-sharepoint |
| `create-maintenance-manual` | Regulatory inspection and maintenance requirements | High | mcp-sharepoint |
| `generate-operating-procedures` | Regulatory constraints on operating procedures | Medium | mcp-sharepoint |
| `create-kpi-dashboard` | Compliance KPIs and monitoring metrics | Medium | mcp-sharepoint |
| `audit-compliance-readiness` | Regulatory register as baseline for compliance auditing | Critical | mcp-sharepoint |
| `track-incident-learnings` (L-02) | Regulatory reporting requirements for incidents | High | mcp-sharepoint |
| `plan-training-program` (M-04) | Regulatory training requirements for workforce readiness | High | mcp-sharepoint |
| `unify-operational-data` (N-01) | Regulatory reporting data requirements for integration | Medium | mcp-sharepoint |

---

## Examples

See [`references/skill-examples.md`](references/skill-examples.md) for detailed examples.

## MCP Integrations

See [`references/skill-mcp-integrations.md`](references/skill-mcp-integrations.md) for detailed mcp integrations.

## Templates & References

See [`references/skill-templates-references.md`](references/skill-templates-references.md) for detailed templates & references.
