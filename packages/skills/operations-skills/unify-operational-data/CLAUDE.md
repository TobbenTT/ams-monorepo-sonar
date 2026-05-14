---
name: unify-operational-data
description: "Unify operational data from multiple sources into a coherent data model. Triggers: 'data unification', 'operational data', 'unificar datos operacionales'."
---

# Unify Operational Data

## Skill ID: N-01

## Version: 1.0.0

## Category: N. Integration & Decision

## Priority: P1 - High (foundational for data-driven decision-making and operational intelligence)

---

## Purpose

Unify operational data from siloed enterprise systems into a single source of truth that enables consistent, reliable, and timely decision-making across all operational functions. This skill transforms the fragmented data landscape of industrial facilities -- where critical information is trapped in 8-15 disconnected systems -- into an integrated data architecture with defined master data, quality rules, and unified dashboards that empower operators, engineers, and managers to make data-driven decisions with confidence.

The data fragmentation problem in industrial operations is pervasive and severely underestimated. A typical mining, oil and gas, or chemical processing facility operates with a constellation of disconnected information systems: ERP (SAP, Oracle) for financial and procurement data, CMMS (SAP PM, Maximo, Infor EAM) for maintenance management, SCADA/DCS (Honeywell, ABB, Yokogawa) for real-time process data, LIMS (Laboratory Information Management System) for quality data, document management systems for procedures and drawings, HR systems for workforce data, safety databases for incident and risk data, and specialized systems for environmental monitoring, energy management, and production planning. Each system was implemented independently, often by different vendors, at different times, with different data models, naming conventions, and update frequencies. The result is a fragmented data landscape where the same physical asset may be identified differently in each system, KPIs calculated from different sources produce conflicting numbers, and no single view of operational performance exists.

The business impact of data silos is substantial and well-documented. McKinsey research indicates that only 20-30% of data collected in industrial operations is actually used for decision-making; the remainder is trapped in silos, degraded in quality, or inaccessible to the people who need it. Gartner estimates that poor data quality costs organizations an average of $12.9 million per year. In industrial operations specifically, data silos contribute to delayed maintenance decisions (increasing unplanned downtime by 15-25%), inconsistent reporting to management and regulators (creating compliance risk), duplicated data entry (wasting 10-15% of administrative time), inability to perform cross-functional analytics (predictive maintenance, integrated planning), and conflicting performance reports that erode trust in data and drive decision-making back to intuition. The total productivity loss attributable to data fragmentation is estimated at 10-15% of revenue for industrial operations.

This skill addresses Pain Point M-04 (Data Utilization Gap) in the OR System framework. It establishes a systematic approach to data integration that begins with understanding the current data landscape, defines a target integration architecture, establishes master data governance, implements data quality rules, designs integration interfaces (ETL/API), and specifies unified dashboards that bring together process, maintenance, safety, quality, and financial data into a coherent operational picture. The skill integrates with MCP servers for direct connection to enterprise systems, process historians, and analytical tools.

---

## Intent & Specification

### Problem Statement

Industrial facilities invest millions in operational technology (OT) and information technology (IT) systems, yet the data produced by these systems remains fragmented across organizational and technological boundaries. Maintenance teams cannot easily access process data to correlate equipment condition with operating parameters. Operations cannot view maintenance backlogs alongside production plans. Safety teams cannot integrate incident data with process deviations and training records. Management receives conflicting KPI reports from different systems. This fragmentation prevents the organization from leveraging its data assets for predictive analytics, integrated planning, and real-time operational intelligence.

### What the Agent MUST Do

The AI agent MUST understand and execute the following core requirements:

1. **Current State Data Landscape Mapping**: Inventory all existing data systems in the facility, documenting their purpose, data content, data model, update frequency, data owners, user base, interfaces (existing or planned), and data quality characteristics. Create a comprehensive map of the current data architecture including data flows between systems.

2. **Data Source Inventory and Classification**: For each identified data source, catalog the specific data elements available, their definitions, formats, quality, and business criticality. Classify data into categories: master data (relatively static reference data), transactional data (event-driven records), time-series data (process measurements), and unstructured data (documents, images, comments).

3. **Data Quality Assessment**: Evaluate the quality of data in each source system across six dimensions defined by ISO 8000 and DAMA-DMBOK: completeness (are all required fields populated?), accuracy (does data reflect reality?), consistency (same data in different systems match?), timeliness (is data current?), uniqueness (no unwanted duplicates?), and validity (data conforms to defined rules?). Quantify data quality issues and estimate the business impact of poor quality.

4. **Master Data Definition**: Define the master data entities that must be consistent across all systems: equipment/asset master (physical hierarchy, attributes, classifications), material master (spare parts, consumables, chemicals), organizational structure (cost centers, work centers, functional locations), personnel master (employees, roles, competencies), and vendor/customer master. For each master entity, define the authoritative source system (system of record) and the data governance rules.

5. **Integration Architecture Design**: Design the target integration architecture following ISA-95 (enterprise-control integration) standards, defining: which systems need to exchange data, what data elements flow between systems, the integration pattern (real-time API, batch ETL, event-driven, data lake), the integration technology platform, and the data transformation and mapping rules.

6. **Data Quality Rules and Governance**: Establish automated data quality rules that will be applied at data creation, integration, and consumption points. Define data governance roles: data owners (accountable for data quality), data stewards (responsible for day-to-day data management), and data consumers (who use the data and report quality issues).

7. **Unified Dashboard Specification**: Design the specifications for unified operational dashboards that bring together data from multiple systems to provide cross-functional visibility. Define dashboard audiences, KPIs, data sources, refresh rates, drill-down capabilities, and alert thresholds.

8. **Validation and Rollout Planning**: Define the validation approach to verify that integrated data is accurate and complete. Plan the phased rollout of data integration, starting with the highest-value use cases and building incrementally.

---

## Trigger / Invocation

```
/unify-operational-data
```

**Aliases**: `/data-integration`, `/data-unification`, `/unificar-datos`, `/integracion-datos`

**Natural Language Triggers (EN)**:
- "Unify operational data across our systems"
- "Create a data integration architecture"
- "Map our data sources and define a single source of truth"
- "Design a master data management strategy"
- "Assess data quality across our operational systems"
- "Specify a unified operational dashboard"
- "Break down data silos between maintenance and operations"

**Natural Language Triggers (ES)**:
- "Unificar los datos operacionales entre nuestros sistemas"
- "Crear una arquitectura de integracion de datos"
- "Mapear nuestras fuentes de datos y definir una unica fuente de verdad"
- "Disenar una estrategia de gestion de datos maestros"
- "Evaluar la calidad de datos en nuestros sistemas operacionales"
- "Especificar un dashboard operacional unificado"
- "Romper los silos de datos entre mantenimiento y operaciones"

**Trigger Conditions**:
- New facility startup requires integration of newly implemented systems
- Management identifies conflicting KPIs from different data sources
- Digital transformation initiative requires data foundation
- Predictive maintenance or advanced analytics project requires integrated data
- Regulatory reporting reveals data inconsistencies across systems
- Organizational efficiency study identifies data entry duplication
- OR framework assessment identifies data integration as a readiness gap

---

## Input Requirements

### Required Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `system_inventory` | .xlsx, text | List of all IT/OT systems in the facility: system name, vendor, version, purpose, primary users, data content summary |
| `facility_description` | .docx, text | Description of the facility including process type, organizational structure, operational functions, and key business processes |
| `business_requirements` | .docx, text | Key business questions and decisions that require integrated data. What do managers, engineers, and operators need to know that they currently cannot easily access? |
| `organizational_structure` | .xlsx | Organizational chart with roles, departments, and reporting lines for data governance assignment |

### Optional Inputs (Enhance Quality)

| Input | Format | Description |
|-------|--------|-------------|
| `system_documentation` | .pdf, .docx | Technical documentation for each system: data models, data dictionaries, interface specifications |
| `existing_interfaces` | .xlsx | Current system integrations: source, target, data elements, frequency, technology |
| `data_samples` | .xlsx, .csv | Sample data extracts from key systems for quality assessment |
| `kpi_definitions` | .xlsx | Current KPI definitions including data sources, calculation formulas, and known discrepancies |
| `it_architecture` | .pdf, .docx | Current IT infrastructure documentation: servers, networks, databases, middleware |
| `compliance_requirements` | .xlsx | Data-related compliance requirements (regulatory reporting, audit trails, data retention) |
| `digital_strategy` | .docx | Organization's digital transformation strategy and roadmap |
| `budget_constraints` | .xlsx | Available budget for data integration technology and implementation |
| `asset_register` | .xlsx | Equipment/asset register for master data cross-referencing |
| `maintenance_data` | .xlsx | Maintenance work orders and history for data quality assessment |
| `process_data_historian` | Historian export | Sample process data for time-series integration assessment |

### Context Enrichment

The agent will automatically enrich the data integration plan by:
- Querying connected systems (via MCP servers) for data schema and sample data
- Cross-referencing asset identifiers across systems to detect inconsistencies
- Analyzing data update patterns to determine optimal integration frequencies
- Benchmarking the facility's data maturity against industry frameworks (DAMA-DMBOK)
- Identifying industry-standard integration patterns for the specific system combination
- Reviewing ISA-95 models for the facility's industry sector

### Input Validation Rules

- System inventory must include at minimum: system name, vendor, primary function, and key data entities
- Business requirements must specify at least 5 cross-functional questions that require integrated data
- Organizational structure must identify potential data owners for key functional areas
- If existing interfaces exist, they must be documented to avoid duplication or conflict
- Data samples (if provided) must include column headers and data type descriptions

---

## Output Specification

### Deliverable 1: Data Integration Architecture (.docx)

**Filename**: `{ProjectCode}_Data_Integration_Architecture_v{version}_{date}.docx`

**Document Structure (30-45 pages)**:

1. **Executive Summary** (2-3 pages)
   - Current state data landscape overview
   - Key data challenges and business impact
   - Target state integration architecture summary
   - Implementation roadmap and investment overview
   - Expected benefits and ROI estimate

2. **Current State Assessment** (5-8 pages)
   - System inventory with data landscape diagram
   - Data flow map (current integrations and manual transfers)
   - Data quality assessment summary
   - Pain point analysis by functional area:
     - Operations: process data accessibility, production reporting
     - Maintenance: work order to process correlation, spare parts visibility
     - HSE: incident data to process/training correlation
     - Finance: cost allocation accuracy, budget vs. actual
     - Management: KPI consistency, reporting timeliness
   - Data maturity assessment using DAMA-DMBOK maturity model

3. **Business Requirements Analysis** (3-4 pages)
   - Cross-functional decision requirements mapped to data needs
   - Use case prioritization matrix (business value vs. implementation complexity)
   - Critical data pathways: which data flows are most important for operations?
   - Future-state analytics requirements (predictive maintenance, digital twin, AI/ML)

4. **Target State Architecture** (5-8 pages)
   - ISA-95 integration model applied to the facility:
     - Level 0-2: Physical process and control (SCADA/DCS)
     - Level 3: Manufacturing operations management (MES/MOM)
     - Level 4: Business planning and logistics (ERP)
   - Integration architecture diagram showing:
     - All systems and their data flows
     - Integration layer (middleware, API gateway, data platform)
     - Master data management hub
     - Data warehouse / data lake
     - Analytics and reporting layer
   - Integration patterns by data type:
     - Real-time process data: OPC-UA to historian to dashboard
     - Transactional data: API/ETL between CMMS/ERP/HR
     - Master data: Hub-and-spoke synchronization
     - Document data: Enterprise content management
   - Technology platform recommendations

5. **Master Data Management** (3-5 pages)
   - Master data entity definitions
   - System of Record designation per entity
   - Data governance model: owners, stewards, consumers
   - Master data matching and deduplication rules
   - Master data lifecycle management

6. **Data Quality Framework** (3-4 pages)
   - Data quality dimensions and measurement methods
   - Quality rules by data entity and system
   - Quality monitoring and reporting approach
   - Data cleansing strategy for existing data
   - Ongoing data quality assurance processes

7. **Integration Design Specifications** (5-8 pages)
   - For each integration point:
     - Source and target systems
     - Data elements exchanged
     - Transformation and mapping rules
     - Integration pattern (real-time, batch, event-driven)
     - Frequency and latency requirements
     - Error handling and retry logic
     - Monitoring and alerting
   - API specifications (for real-time integrations)
   - ETL job specifications (for batch integrations)

8. **Implementation Roadmap** (3-4 pages)
   - Phased implementation plan:
     - Phase 1: Master data alignment and critical integrations
     - Phase 2: Operational dashboards and reporting
     - Phase 3: Advanced analytics and predictive capabilities
   - Timeline with milestones
   - Resource requirements per phase
   - Risk assessment and mitigation
   - Budget estimate per phase

9. **Governance and Operations** (2-3 pages)
   - Data governance organizational structure
   - Roles and responsibilities matrix (RACI)
   - Data governance policies and procedures
   - Change management for data structures
   - Training requirements for data stewards

10. **Appendices**
    - Detailed system inventory
    - Data dictionary (key entities and attributes)
    - Integration mapping tables
    - Technology evaluation matrix
    - Vendor comparison (if applicable)

### Deliverable 2: Master Data Model (.xlsx)

**Filename**: `{ProjectCode}_Master_Data_Model_v{version}_{date}.xlsx`

**Workbook Structure**:

#### Sheet 1: "Entity Overview"

| Column | Field Name | Description | Example |
|--------|-----------|-------------|---------|
| A | Entity_ID | Unique entity identifier | MDM-EQP-001 |
| B | Entity_Name | Master data entity name | Equipment Master |
| C | Entity_Description | Full description of the entity | Physical asset record containing all equipment attributes, hierarchy position, and technical data |
| D | System_of_Record | Authoritative source system | SAP PM (CMMS) |
| E | Secondary_Systems | Other systems containing this data | SCADA (tag mapping), DMS (drawings), Safety DB (risk data) |
| F | Record_Count | Approximate number of records | 3,500 |
| G | Data_Owner | Business owner responsible for data quality | Maintenance Manager |
| H | Data_Steward | Person responsible for day-to-day data management | Maintenance Planner Lead |
| I | Update_Frequency | How often data changes | Low (new equipment, modifications, decommissions) |
| J | Sync_Frequency | How often systems are synchronized | Real-time for critical attributes, daily batch for all |
| K | Quality_Score | Current data quality assessment (1-5) | 3.2 |
| L | Critical_Attributes | Most important attributes for this entity | Equipment_Tag, Description, Functional_Location, Criticality, Status |

#### Sheet 2: "Equipment Master"
- Complete attribute definition for the equipment master data entity
- Attribute name, description, data type, format, valid values, source system, mapping to other systems
- Business rules for equipment identification, naming conventions, and hierarchy

#### Sheet 3: "Material Master"
- Complete attribute definition for the material/spare parts master data entity
- Attributes: material number, description, classification, unit of measure, storage location, reorder point, lead time, vendor, cost
- Cross-reference: material-to-equipment (bill of materials)

#### Sheet 4: "Organizational Master"
- Cost centers, work centers, functional locations, planning groups
- Mapping between organizational entities across systems

#### Sheet 5: "Personnel Master"
- Employee attributes relevant to operational systems
- Competency, certification, and authorization data
- System access and role assignments

#### Sheet 6: "Cross-Reference Matrix"
- Mapping table: how the same entity is identified in each system
- Equipment tag in CMMS vs. SCADA tag vs. ERP asset number vs. DMS document reference
- Matching rules and confidence levels

#### Sheet 7: "Data Governance Rules"
- For each master data entity and attribute:
  - Mandatory/optional classification
  - Valid value ranges or domain values
  - Format and naming convention rules
  - Change authorization requirements
  - Audit trail requirements

### Deliverable 3: Data Quality Report (.xlsx)

**Filename**: `{ProjectCode}_Data_Quality_Report_v{version}_{date}.xlsx`

**Workbook Structure**:

#### Sheet 1: "Quality Dashboard"
- Overall data quality score by system and by entity
- Quality dimension scores: completeness, accuracy, consistency, timeliness, uniqueness, validity
- Trend analysis (if historical data available)
- Top 10 data quality issues by business impact

#### Sheet 2: "Quality Assessment Detail"

| Column | Field Name | Description | Example |
|--------|-----------|-------------|---------|
| A | System | Source system assessed | SAP PM |
| B | Entity | Data entity | Equipment Master |
| C | Attribute | Specific attribute | Functional_Location |
| D | Records_Assessed | Number of records evaluated | 3,500 |
| E | Completeness_Score | % of records with this attribute populated | 87% |
| F | Accuracy_Score | % of records with correct values (verified against source) | 92% |
| G | Consistency_Score | % of records consistent across systems | 71% |
| H | Timeliness_Score | % of records updated within acceptable timeframe | 85% |
| I | Uniqueness_Score | % of records that are not unwanted duplicates | 94% |
| J | Validity_Score | % of records conforming to defined business rules | 88% |
| K | Overall_Quality_Score | Weighted average of all dimensions | 86% |
| L | Issue_Description | Description of quality issues found | 13% of equipment missing functional location assignment; 29% inconsistency between CMMS and SCADA tag naming |
| M | Business_Impact | Impact of the quality issue | Incorrect cost allocation for 13% of equipment; maintenance work orders not linked to correct process data |
| N | Remediation_Action | Recommended action to fix | Mass data update to assign functional locations; tag naming convention alignment project |
| O | Remediation_Effort | Estimated effort (hours/days) | 40 hours (data steward + system admin) |
| P | Priority | Critical / High / Medium / Low | High |

#### Sheet 3: "Consistency Analysis"
- Cross-system comparison for shared data elements
- Discrepancy counts and examples
- Root cause of inconsistencies (naming conventions, update timing, manual entry errors)

#### Sheet 4: "Quality Rules Catalog"
- All defined data quality rules
- Rule ID, description, data entity, attribute, validation logic
- Automated vs. manual check classification
- Check frequency

#### Sheet 5: "Remediation Plan"
- Prioritized data cleansing activities
- Timeline, resource requirements, and dependencies
- Expected quality improvement targets

### Deliverable 4: Unified Dashboard Specification (.docx)

**Filename**: `{ProjectCode}_Unified_Dashboard_Specification_v{version}_{date}.docx`

**Document Structure (20-30 pages)**:

1. **Dashboard Strategy** (2-3 pages)
   - Dashboard portfolio overview (which dashboards for which audiences)
   - Design principles (actionable, real-time where needed, drill-down capable)
   - Technology platform specification (Power BI, Tableau, OSIsoft PI Vision, custom)
   - Refresh rate and data latency requirements by dashboard

2. **Executive Operations Dashboard** (3-4 pages)
   - Audience: Plant Manager, Operations VP, Site Leadership
   - KPIs: Overall equipment effectiveness (OEE), production vs. plan, safety metrics (TRIR, SIFR), environmental compliance, maintenance backlog, workforce availability
   - Data sources: ERP (production/financial), CMMS (maintenance), SCADA (process), Safety DB (incidents), HR (attendance)
   - Layout specification with wireframe
   - Drill-down paths: summary > department > area > equipment

3. **Operations Dashboard** (3-4 pages)
   - Audience: Control Room Operators, Shift Supervisors, Process Engineers
   - KPIs: Real-time process performance, production rates, quality parameters, utility consumption, shift targets vs. actual
   - Data sources: SCADA/DCS (real-time), LIMS (quality), ERP (production plan)
   - Refresh rate: Real-time (5-15 second update)
   - Alert thresholds and escalation rules

4. **Maintenance Dashboard** (3-4 pages)
   - Audience: Maintenance Planner, Maintenance Manager, Reliability Engineers
   - KPIs: Backlog (hours and aging), PM compliance, MTBF/MTTR, equipment availability, work order completion rate, spare parts availability
   - Data sources: CMMS (work orders, PM schedule), SCADA (equipment runtime, alarms), ERP (spare parts inventory, costs)
   - Predictive indicators: equipment condition trends, alarm frequency patterns

5. **HSE Dashboard** (3-4 pages)
   - Audience: HSE Manager, Site Manager, Corporate HSE
   - KPIs: Incident rates (TRIR, LTIFR, SIFR), near-miss reporting rate, corrective action closure rate, training completion, environmental monitoring compliance, audit findings
   - Data sources: Safety DB (incidents, actions), Training/LMS (completion), Environmental monitoring, CMMS (safety work orders)

6. **Integrated Analysis Views** (3-4 pages)
   - Cross-functional analytics specifications:
     - Equipment health: combining process data, maintenance history, and inspection results
     - Cost attribution: linking maintenance costs to process area, equipment, and failure type
     - Workforce effectiveness: correlating training, experience, shift patterns with performance
     - Compliance status: combining regulatory requirements, monitoring data, and reporting status
   - Data lake / analytics platform requirements

7. **Technical Specifications** (3-4 pages)
   - Data source connections and authentication
   - Data transformation and calculation logic for each KPI
   - Caching strategy for performance optimization
   - Mobile responsiveness and offline capability requirements
   - Security and role-based access control
   - Backup and disaster recovery for dashboard platform

---

## Methodology & Standards

### Primary Standards

| Standard | Application |
|----------|-------------|
| ISA-95 (IEC 62264) | Enterprise-control system integration -- Defines the standard model for integrating enterprise (ERP/Level 4) and control (SCADA-DCS/Level 0-2) systems through the manufacturing operations management layer (Level 3). Provides the canonical reference architecture for industrial data integration |
| OPC-UA (IEC 62541) | Open Platform Communications Unified Architecture -- The standard for industrial interoperability enabling secure, reliable, and platform-independent data exchange between industrial automation systems and enterprise IT systems |
| ISO 8000 | Data quality -- International standard for defining and measuring data quality. Provides the framework for data quality assessment, improvement, and governance |
| DAMA-DMBOK (Data Management Body of Knowledge) | Comprehensive framework for data management practices including data governance, data architecture, data quality, master data management, and metadata management |

### Secondary Standards

| Standard | Application |
|----------|-------------|
| ISA-88 (IEC 61512) | Batch control standard -- Relevant for batch process data integration and recipe management |
| ISA-18.2 (IEC 62682) | Alarm management -- Standard for alarm data integration and analysis across SCADA/DCS systems |
| ISO 14224:2016 | Petroleum, petrochemical, and natural gas industries -- Collection and exchange of reliability and maintenance data. Provides the standard taxonomy for equipment classification and failure data |
| ISO 55000:2014 | Asset management -- Framework for data requirements supporting asset management decisions |
| MIMOSA (Machinery Information Management Open Systems Alliance) | Open standards for operations and maintenance data exchange in asset-intensive industries |
| B2MML (Business To Manufacturing Markup Language) | XML implementation of ISA-95 for system integration |

### Key Frameworks

**ISA-95 Functional Hierarchy Applied to Data Integration**:

| Level | Name | Systems | Data Type | Integration Pattern |
|-------|------|---------|-----------|---------------------|
| Level 4 | Business Planning & Logistics | ERP, Finance, HR, Procurement | Transactional, master data | API/ETL, daily-weekly batch |
| Level 3 | Manufacturing Operations Management | CMMS, MES, LIMS, Quality, Scheduling | Transactional, workflow | API/ETL, near-real-time to hourly |
| Level 2 | Monitoring, Supervisory Control | SCADA, HMI, Historians | Time-series, alarm events | OPC-UA, real-time streaming |
| Level 1 | Sensing, Manipulation | PLC, DCS controllers | Real-time measurement | OPC-UA, sub-second |
| Level 0 | Physical Process | Sensors, actuators, instruments | Raw signals | Direct wiring, fieldbus |

**DAMA-DMBOK Data Management Areas**:
1. **Data Governance**: Policies, standards, roles, responsibilities
2. **Data Architecture**: Models, integration, data flow design
3. **Data Modeling and Design**: Conceptual, logical, physical data models
4. **Data Storage and Operations**: Database management, backup, performance
5. **Data Security**: Access control, encryption, privacy
6. **Data Integration and Interoperability**: ETL, API, data exchange
7. **Document and Content Management**: Unstructured data management
8. **Reference and Master Data**: Master data management, code lists
9. **Data Warehousing and Business Intelligence**: Analytics, reporting
10. **Metadata Management**: Data about data, catalogs, lineage
11. **Data Quality**: Assessment, improvement, monitoring

**Data Quality Dimensions (ISO 8000)**:

| Dimension | Definition | Measurement Method | Target |
|-----------|-----------|-------------------|--------|
| Completeness | All required data elements are present | % of mandatory fields populated | >98% |
| Accuracy | Data correctly represents the real-world entity | Verification against source/field audit | >95% |
| Consistency | Same data in different systems has same values | Cross-system comparison | >95% |
| Timeliness | Data is up-to-date and available when needed | Age of data vs. acceptable latency | >95% |
| Uniqueness | No unwanted duplicate records | Duplicate detection analysis | >99% |
| Validity | Data conforms to defined business rules and formats | Validation against rules catalog | >98% |

---

## Step-by-Step Execution

### Phase 1: Discovery and Assessment (Steps 1-4)
**Step 1: Map the Current Data Landscape**
### Phase 2: Architecture Design (Steps 5-8)
**Step 5: Define Master Data Model**
### Phase 3: Implementation Planning (Steps 9-12)
**Step 9: Design ETL/API Specifications**
### Phase 4: Validation and Delivery (Steps 13-16)
**Step 13: Validate Data Integration Outputs**

See [`references/skill-detailed-steps.md`](references/skill-detailed-steps.md) for complete detailed execution steps.

## Quality Criteria

### Scoring Table

| Criterion | Weight | Target | Minimum Acceptable | Measurement Method |
|-----------|--------|--------|--------------------|--------------------|
| System coverage (all operational systems mapped) | 20% | 100% | >95% | Audit of system inventory against IT/OT asset list |
| Master data entity completeness (all key entities defined) | 15% | 100% | >95% | Review of master data model against business requirements |
| Data quality assessment depth (all key entities assessed) | 15% | 100% of key entities across all systems | >90% | Coverage analysis of quality assessment report |
| Integration specification completeness (all required data flows defined) | 15% | 100% of prioritized use cases | >90% | Cross-check of integration specs against business requirements |
| Dashboard specification coverage (all audiences and KPIs defined) | 10% | All 4 audience dashboards specified | >3 dashboards | Review of dashboard specification document |
| Stakeholder validation (approval from data owners and IT) | 10% | >95% approval | >90% | Sign-off tracking from review process |
| Implementation feasibility (technically achievable with available technology) | 10% | 100% of Phase 1 verified | >90% | Technical feasibility review with IT team |
| Standards alignment (ISA-95, ISO 8000, DAMA-DMBOK) | 5% | Full alignment | Major elements aligned | Standards compliance review |

### Automated Quality Checks

- [ ] Every system in the facility has been inventoried with required attributes
- [ ] Every system has been classified by ISA-95 level
- [ ] Every master data entity has a defined system of record
- [ ] Every master data entity has an assigned data owner and data steward
- [ ] Cross-reference mapping exists for equipment across all systems
- [ ] Data quality has been assessed across all six dimensions for key entities
- [ ] Every business requirement has been mapped to data sources and integration points
- [ ] Every KPI in the dashboard specification has a defined calculation formula and data sources
- [ ] Every integration point has a defined pattern (API/ETL/streaming), frequency, and error handling
- [ ] Data governance roles are assigned to named individuals
- [ ] Implementation roadmap has defined phases, timelines, and resource requirements
- [ ] Data quality remediation plan is prioritized and resourced
- [ ] Dashboard wireframes are defined for all specified audiences
- [ ] Technology platform recommendations are justified with evaluation criteria

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents)

| Agent/Skill | Input Received | Criticality | MCP Integration |
|-------------|---------------|-------------|-----------------|
| `create-asset-register` | Equipment master data and hierarchy for cross-system alignment | Critical | mcp-cmms |
| `create-kpi-dashboard` | KPI definitions and reporting requirements for dashboard specification | High | mcp-sharepoint |
| `map-regulatory-requirements` (L-01) | Regulatory reporting data requirements for compliance integration | High | mcp-sharepoint |
| `track-incident-learnings` (L-02) | Incident data structure and integration needs for safety dashboards | Medium | mcp-incident-db |
| `plan-training-program` (M-04) | Training data integration requirements for workforce dashboards | Medium | mcp-lms |
| `create-maintenance-strategy` | Maintenance data requirements for reliability analytics | High | mcp-cmms |
| `assess-digital-maturity` | Current digital maturity baseline and improvement targets | Medium | mcp-sharepoint |
| `create-or-framework` | OR data requirements and readiness metrics | High | mcp-sharepoint |

### Downstream Dependencies (Outputs TO other agents)

| Agent/Skill | Output Provided | Criticality | MCP Integration |
|-------------|----------------|-------------|-----------------|
| `create-kpi-dashboard` | Integrated data architecture enabling cross-functional KPI calculations | Critical | mcp-excel |
| `analyze-reliability` | Integrated process + maintenance data for reliability analysis | High | mcp-cmms, mcp-scada |
| `analyze-failure-patterns` | Correlated failure data across CMMS, SCADA, and quality systems | High | mcp-cmms |
| `benchmark-maintenance-kpis` | Consistent, quality-assured maintenance data for benchmarking | Medium | mcp-cmms |
| `model-opex-budget` | Integrated cost data for OPEX modeling | Medium | mcp-erp |
| `generate-performance-report` | Unified data feed for automated performance reporting | High | mcp-excel |
| `generate-esg-report` | Integrated environmental, safety, and social data for ESG reporting | Medium | mcp-sharepoint |
| `audit-compliance-readiness` | Data quality and governance evidence for compliance auditing | Medium | mcp-sharepoint |
| `map-regulatory-requirements` (L-01) | Integrated data enabling automated regulatory reporting | Medium | mcp-sharepoint |

---

## Examples

See [`references/skill-examples.md`](references/skill-examples.md) for detailed examples.

## MCP Integrations

See [`references/skill-mcp-integrations.md`](references/skill-mcp-integrations.md) for detailed mcp integrations.

## Templates & References

See [`references/skill-templates-references.md`](references/skill-templates-references.md) for detailed templates & references.
