---
name: manage-data-governance
description: "Establish and manage data governance frameworks including ownership assignment, classification, quality standards, and lifecycle management for industrial OR projects. Triggers: 'data governance', 'data classification', 'gobernanza de datos'."
---

# Manage Data Governance
## Skill ID: manage-data-governance
## Version: 1.0.0
## Category: D - Planning
## Priority: High

## Purpose

Establishes comprehensive data governance frameworks for industrial Operational Readiness projects, covering data ownership assignment, data classification (public, internal, confidential, restricted), data quality standards, lifecycle management policies, data dictionaries, and master data management. This skill ensures that every data entity produced or consumed across the OR multi-agent system has a defined owner, classification level, quality threshold, and retention policy.

In large capital projects (mining, oil & gas, chemicals, energy), data governance is the invisible backbone that determines whether systems integrate cleanly at commissioning. Without clear ownership of master data entities -- equipment tags, material masters, functional locations, cost centers, vendor records -- handover from EPC to operations becomes chaotic and error-prone. This skill prevents the "data swamp" problem where multiple sources of truth emerge, conflicts proliferate, and CMMS/ERP configurations fail at go-live.

The data governance framework produced by this skill feeds directly into IT/OT convergence planning, document management systems, and cybersecurity posture assessments, making it a foundational deliverable for the IT/OT & Communications agent (AG-012).

## Intent & Specification

The AI agent MUST understand the following core goals:

1. **Data Ownership is Non-Negotiable**: Every data entity type (equipment master, material master, functional location, cost center, work order, purchase order, process variable, safety interlock, document record) MUST have a single designated owner (SWMR principle -- Single Writer, Multiple Readers). The framework must map entity types to owning agents, departments, and named roles.

2. **Classification Drives Protection**: All data must be classified into four tiers (Public, Internal, Confidential, Restricted) following ISO 27001 Annex A and client-specific policies. Classification determines access control, encryption, backup, and retention requirements. OT process data, SCADA configurations, and safety system logic are typically Restricted.

3. **Data Quality Has Measurable Standards**: The framework must define data quality dimensions (accuracy, completeness, consistency, timeliness, uniqueness, validity) with measurable KPIs and acceptance thresholds for each data domain. Master data completeness targets should be >98% at G3 gate.

4. **Lifecycle Management is Explicit**: Every data type must have a defined lifecycle (creation, validation, approval, active use, archival, disposal) with triggers, responsible roles, and retention periods aligned to regulatory requirements (Chilean Ley 19.799, sector-specific regulations).

5. **Data Dictionary is the Single Source of Truth**: A comprehensive data dictionary must define every field, attribute, and entity across the OR system -- field name, data type, valid values, business rules, owning system, and cross-system mappings.

6. **Master Data Management (MDM) Prevents Chaos**: The framework must define MDM processes for critical entity types (equipment, materials, vendors, personnel, locations) including golden record creation, duplicate detection, merge rules, and cross-system synchronization protocols.

7. **Language**: Spanish (Latin American) by default for all governance documentation, with technical terms preserved in English where industry convention requires (e.g., CRUD, MDM, ETL, SWMR, API).

## Trigger / Invocation

```
/manage-data-governance
```

### Natural Language Triggers
- "Create a data governance framework for the project"
- "Define data ownership and classification for our systems"
- "Build a data dictionary for the OR project"
- "Establish master data management processes"
- "Crear marco de gobernanza de datos para el proyecto"
- "Definir clasificacion y propiedad de los datos"
- "Establecer estandares de calidad de datos maestros"

## Input Requirements

### Required Inputs
| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `system_landscape` | List of IT/OT systems in scope (ERP, CMMS, SCADA, DCS, PI, MES, DMS) | .xlsx / .docx | Client IT / Engineering |
| `organizational_structure` | Departments, roles, and reporting lines | .xlsx / .docx | Client HR / Operations |
| `data_entity_inventory` | List of key data entities and their current sources | .xlsx / text | Project Team |
| `industry_sector` | Mining, Oil & Gas, Chemicals, Power, etc. | Text | User |
| `regulatory_context` | Applicable data protection and retention regulations | .docx / .pdf | Legal / Compliance |

### Optional Inputs (Highly Recommended)
| Input | Description | Default |
|-------|-------------|---------|
| `existing_data_policies` | Client's current data governance policies if brownfield | None (greenfield assumed) |
| `erp_configuration_spec` | SAP/Oracle module configuration and custom fields | Generic SAP S/4HANA structure |
| `cmms_data_model` | CMMS entity-relationship diagram and field definitions | SAP PM standard data model |
| `scada_tag_list` | SCADA/DCS tag database export | Derive from P&IDs |
| `integration_architecture` | Current or planned system integration topology | Build from system landscape |
| `data_quality_baseline` | Current data quality assessment results | Assume no baseline exists |
| `retention_schedule` | Corporate records retention schedule | Chilean regulatory minimums |

### Context Enrichment
The agent should automatically:
- Map the SWMR entity ownership model from the VSC multi-agent architecture to project-specific roles
- Retrieve applicable Chilean data protection regulations (Ley 19.628, Ley 21.096, Ley 19.799)
- Pull ISO 27001 Annex A controls relevant to data classification
- Identify industry-standard data models (ISO 14224 for equipment taxonomy, ISO 8000 for data quality)
- Reference ISO 55000 asset information management requirements

## Output Specification

### Document 1: Data Governance Framework (.docx)
**Filename**: `VSC_DataGovernance_{ProjectCode}_{Version}_{Date}.docx`

**Structure**:
1. **Cover Page** - VSC branding, project identification
2. **Document Control** - Revision history, approval matrix
3. **Table of Contents**
4. **Executive Summary** (2-3 pages)
   - Governance objectives and scope
   - Key principles and policies
   - Data classification summary
   - Implementation roadmap overview
5. **Introduction & Scope** (1-2 pages)
   - Systems in scope
   - Data domains covered
   - Applicable standards and regulations
6. **Data Governance Organization** (3-4 pages)
   - 6.1 Data governance council charter
   - 6.2 Data steward roles and responsibilities
   - 6.3 Data ownership matrix (SWMR by entity type)
   - 6.4 Escalation and dispute resolution procedures
7. **Data Classification Framework** (3-4 pages)
   - 7.1 Classification tiers (Public / Internal / Confidential / Restricted)
   - 7.2 Classification criteria and decision tree
   - 7.3 Handling requirements per classification level
   - 7.4 Access control matrix by classification and role
   - 7.5 OT data special handling requirements
8. **Data Quality Standards** (3-4 pages)
   - 8.1 Quality dimensions and definitions
   - 8.2 KPIs by data domain (targets and thresholds)
   - 8.3 Data profiling and assessment procedures
   - 8.4 Data cleansing and remediation workflows
   - 8.5 Quality monitoring and reporting
9. **Data Lifecycle Management** (3-4 pages)
   - 9.1 Lifecycle stages by entity type
   - 9.2 Creation and validation procedures
   - 9.3 Change management for master data
   - 9.4 Archival and retention policies
   - 9.5 Data disposal procedures
10. **Master Data Management** (4-5 pages)
    - 10.1 MDM scope and entity types
    - 10.2 Golden record creation rules
    - 10.3 Duplicate detection and merge procedures
    - 10.4 Cross-system synchronization protocols
    - 10.5 MDM tooling and automation requirements
11. **Data Dictionary** (Reference -- see Document 2)
    - 11.1 Dictionary structure and conventions
    - 11.2 Maintenance and update procedures
12. **Implementation Roadmap** (2-3 pages)
    - 12.1 Phased rollout plan aligned with OR gates (G0-G4)
    - 12.2 Quick wins and priority actions
    - 12.3 Training and change management
    - 12.4 Success metrics and review cadence
13. **Appendices**
    - A: Complete data ownership matrix
    - B: Classification decision tree (visual)
    - C: Regulatory compliance mapping
    - D: Data quality KPI dashboard specification

### Document 2: Data Dictionary Workbook (.xlsx)
**Filename**: `VSC_DataDictionary_{ProjectCode}_{Version}_{Date}.xlsx`

**Sheets**:

#### Sheet 1: Entity Catalog
| Column | Description |
|--------|-------------|
| Entity_ID | Unique entity identifier (e.g., ENT-001) |
| Entity_Name | Entity name (e.g., Equipment Master) |
| Domain | Data domain (Asset, Material, Finance, Process, Safety) |
| Owning_System | Primary system of record |
| Owning_Agent | VSC agent responsible (SWMR writer) |
| Owning_Role | Human role responsible |
| Classification | Public / Internal / Confidential / Restricted |
| Record_Count_Estimate | Expected volume |
| Lifecycle_Stage | Current lifecycle stage |

#### Sheet 2: Field Definitions
| Column | Description |
|--------|-------------|
| Entity_ID | Parent entity |
| Field_Name | Technical field name |
| Display_Name | User-facing label |
| Data_Type | String / Integer / Float / Date / Boolean / Enum |
| Max_Length | Maximum character length |
| Required | Mandatory (Y/N) |
| Valid_Values | Enumerated values or validation rule |
| Business_Rule | Data quality business rule |
| Source_System | System that creates/updates this field |
| Cross_System_Mapping | Equivalent fields in other systems |

#### Sheet 3: Data Quality KPIs
| Column | Description |
|--------|-------------|
| Domain | Data domain |
| KPI_Name | Quality metric name |
| Dimension | Accuracy / Completeness / Consistency / Timeliness / Uniqueness |
| Target | Target percentage or threshold |
| Measurement_Method | How the KPI is measured |
| Frequency | Measurement frequency |
| Owner | Responsible role |

#### Sheet 4: Classification Register
| Column | Description |
|--------|-------------|
| Data_Asset | Data asset or entity name |
| Classification | Public / Internal / Confidential / Restricted |
| Justification | Reason for classification level |
| Access_Groups | Authorized access groups |
| Encryption_Required | Y/N |
| Retention_Period | Retention duration |
| Disposal_Method | Disposal procedure |

#### Sheet 5: Master Data Ownership (SWMR)
| Column | Description |
|--------|-------------|
| Entity_Type | Master data entity type |
| Writer_Agent | VSC agent with write authority |
| Writer_Role | Human role with write authority |
| Reader_Agents | VSC agents with read access |
| Reader_Roles | Human roles with read access |
| Sync_Direction | Unidirectional / Bidirectional |
| Sync_Frequency | Real-time / Batch / On-demand |
| Conflict_Resolution | Rule for handling conflicting updates |

## Procedure

### Step 1: Discovery and Inventory
- Catalog all IT/OT systems in scope and their data entities
- Map current data flows between systems (who creates, who reads, who updates)
- Identify existing data governance practices and gap areas
- Document regulatory and compliance requirements for data handling
- Assess current data quality baseline (if data exists)

### Step 2: Framework Design
- Define data governance organizational structure (council, stewards, owners)
- Establish classification tiers with handling requirements per tier
- Define data quality dimensions, KPIs, and acceptance thresholds
- Design lifecycle management policies for each entity type
- Establish SWMR ownership matrix aligned with VSC agent architecture

### Step 3: Data Dictionary Construction
- Define every entity, field, data type, and business rule across all systems
- Map cross-system field equivalencies (e.g., SAP Equipment Number = SCADA Tag)
- Document valid value sets and enumeration lists
- Validate dictionary against actual system configurations
- Identify and resolve naming conflicts and redundancies

### Step 4: MDM Process Design
- Define golden record creation rules for each master data entity
- Design duplicate detection algorithms and merge procedures
- Specify cross-system synchronization protocols and conflict resolution
- Define data stewardship workflows for exception handling
- Design automated data quality monitoring dashboards

### Step 5: Documentation and Validation
- Generate the Data Governance Framework document (.docx)
- Generate the Data Dictionary Workbook (.xlsx)
- Cross-reference all entities, fields, and ownership assignments for completeness
- Validate classification decisions against regulatory requirements
- Review framework alignment with OR gate requirements (G0-G4)

## Quality Criteria

| Criterion | Weight | Description | Target |
|-----------|--------|-------------|--------|
| Technical Accuracy | 30% | Classification tiers, quality standards, and lifecycle policies align with ISO 27001, ISO 8000, ISO 55000 | >91% |
| Completeness | 25% | All data domains, entity types, and systems in scope are covered; no orphan entities | >95% |
| Consistency | 15% | Ownership assignments are consistent with SWMR model; no conflicting writers for same entity | 100% |
| Format | 10% | Professional VSC branding; proper document structure; all tables correctly formatted | >95% |
| Actionability | 10% | Framework can be implemented without additional interpretation; clear roles, procedures, KPIs | >90% |
| Traceability | 10% | Every classification, ownership, and quality target traceable to a standard, regulation, or business requirement | >90% |

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents)
| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| `orchestrator` | Project scope | Provides project boundaries, system landscape, and organizational context |
| `asset-management` | Equipment data model | Provides SAP PM/MM entity structures and equipment taxonomy |
| `operations` | Process data requirements | Defines operational data needs for SOPs, KPIs, and reporting |
| `hse` | Safety data classification | Identifies safety-critical data requiring Restricted classification |
| `contracts-compliance` | Regulatory requirements | Provides data retention and compliance obligations |
| `execution` | Project data flows | Defines construction and commissioning data handover requirements |

### Downstream Dependencies (Outputs TO other agents)
| Agent/Skill | Output Provided | Trigger |
|-------------|----------------|---------|
| `plan-it-ot-convergence` | Data ownership and classification model | Automatic -- required for integration design |
| `manage-document-systems` | Classification framework and retention policies | Automatic -- feeds DMS design |
| `audit-cybersecurity-posture` | Data classification register | Automatic -- drives access control audit |
| `asset-management` / `design-sap-pm-blueprint` | Master data governance rules for SAP configuration | On request |
| `orchestrator` / `create-kpi-dashboard` | Data quality KPIs for governance monitoring | Automatic |
| All agents | SWMR ownership matrix | Broadcast -- all agents reference for entity access |

### Collaboration During Execution
| Agent/Skill | Collaboration Type | When |
|-------------|-------------------|------|
| `asset-management` | Joint entity definition | During data dictionary construction for equipment/material masters |
| `operations` | Joint KPI definition | During quality standards definition for operational data |
| `hse` | Classification review | During classification of safety and environmental data |
| `orchestrator` | Governance alignment | During framework design to ensure alignment with project governance |

## References

### Primary Standards
| Standard | Application |
|----------|-------------|
| **ISO 27001:2022** | Information security management -- data classification controls (Annex A) |
| **ISO 8000** | Data quality -- master data standards and measurement |
| **ISO 55000/55001/55002** | Asset management -- asset information management requirements |
| **ISO 14224** | Equipment taxonomy and reliability data collection standard |
| **DAMA-DMBOK** | Data Management Body of Knowledge -- comprehensive data governance reference |

### Regulatory Framework
| Regulation | Application |
|------------|-------------|
| **Ley 19.628 (Chile)** | Proteccion de datos de caracter personal |
| **Ley 21.096 (Chile)** | Proteccion de datos personales (constitutional reform) |
| **Ley 19.799 (Chile)** | Documentos electronicos, firma electronica |
| **DS 83 (Chile)** | Norma tecnica para los organos de la administracion del estado sobre seguridad y confidencialidad |
| **GDPR** | Reference for multinational clients with European operations |

### Industry References
- DAMA International -- DAMA-DMBOK2 (Data Management Body of Knowledge)
- The Open Group -- TOGAF Data Architecture
- SAP Master Data Governance (MDG) best practices
- ISA-95 (IEC 62264) -- Enterprise-Control System Integration data models
- OPC UA -- Unified Architecture for OT data interoperability

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-02-25 | VSC IT/OT Agent | Initial version. Complete data governance framework with classification, quality, lifecycle, MDM, and data dictionary specifications. |
