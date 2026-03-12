---
name: plan-it-ot-convergence
description: "Design IT/OT convergence architecture including ERP-CMMS-SCADA integration, data flow mapping, DMZ design, API specification, and middleware selection for industrial OR projects. Triggers: 'IT/OT convergence', 'integration architecture', 'convergencia IT/OT'."
---

# Plan IT/OT Convergence
## Skill ID: plan-it-ot-convergence
## Version: 1.0.0
## Category: D - Planning
## Priority: High

## Purpose

Designs the IT/OT convergence architecture for industrial Operational Readiness projects, encompassing ERP-CMMS-SCADA-MES integration patterns, data flow mapping between enterprise and control system layers, DMZ (Demilitarized Zone) design, API specifications, middleware selection and configuration, historian integration, and migration planning. This skill produces the integration blueprint that connects the business world (SAP, Oracle, work management) with the physical world (DCS, SCADA, PLCs, sensors) in a secure, reliable, and performant manner.

IT/OT convergence is the technical backbone of modern industrial operations. Without proper integration, operators cannot see real-time process data in their dashboards, maintenance teams cannot receive condition-based alerts from equipment sensors, production planners cannot reconcile actual throughput against targets, and management cannot make data-driven decisions. However, convergence done poorly introduces cybersecurity vulnerabilities, creates single points of failure, and generates data quality nightmares. This skill ensures convergence is designed correctly from the start, before systems are commissioned and data begins flowing.

The convergence plan produced by this skill directly consumes data governance rules from manage-data-governance, security requirements from audit-cybersecurity-posture, and SAP PM/MM configuration needs from the Asset Management agent, making it the central integration deliverable for the IT/OT & Communications agent.

## Intent & Specification

The AI agent MUST understand the following core goals:

1. **ISA-95 (IEC 62264) is the Integration Reference Model**: The convergence architecture must align with the ISA-95 standard for enterprise-control system integration. Level 4 (Business Planning & Logistics -- ERP), Level 3 (Manufacturing Operations Management -- MES/MOM), Level 2 (Monitoring & Supervisory -- SCADA/HMI), Level 1 (Sensing & Manipulation -- PLC/RTU), and Level 0 (Physical Process) must be clearly delineated with defined interfaces.

2. **Security-by-Design, Not Bolted On**: The DMZ between IT and OT networks must be designed as part of the convergence architecture, not as an afterthought. Data must flow through defined conduits (firewalls, data diodes, application proxies) with no direct connectivity between enterprise and control system networks. IEC 62443 zone/conduit model compliance is mandatory.

3. **Data Flow Mapping is Comprehensive**: Every data flow between systems must be documented: source system, destination system, data entities, direction, frequency, protocol, volume, latency requirements, and transformation rules. This includes real-time process data (OPC UA/DA), batch historian data, alarm and event data, work order data, material movement data, and quality data.

4. **Middleware Selection is Justified**: The choice of integration middleware (PI System, Aveva/Wonderware, Ignition, custom ETL, SAP PO/CPI, MuleSoft, Azure IoT Hub, AWS IoT Greengrass) must be justified based on technical requirements, existing technology stack, scalability needs, vendor support, total cost of ownership, and cybersecurity posture.

5. **API Design Follows Standards**: All APIs between systems must follow RESTful or OPC UA standards with defined schemas, authentication mechanisms, rate limits, error handling, and versioning. No point-to-point integrations without formal interface specifications.

6. **Migration Planning is Phased**: For brownfield projects, the migration from legacy integration patterns to the target architecture must be phased with rollback plans, parallel running periods, and data validation checkpoints at each stage.

7. **Language**: Spanish (Latin American) by default. Technical integration terminology (OPC UA, REST API, DMZ, ETL, MQTT, historian, middleware) is retained in English per industry convention.

## Trigger / Invocation

```
/plan-it-ot-convergence
```

### Natural Language Triggers
- "Design the IT/OT integration architecture for the plant"
- "Plan how ERP, CMMS, and SCADA will communicate"
- "Create an IT/OT convergence strategy with DMZ design"
- "Map data flows between SAP, PI Historian, and the DCS"
- "Disenar la arquitectura de convergencia IT/OT"
- "Planificar la integracion entre ERP, CMMS y SCADA"
- "Crear estrategia de convergencia IT/OT con diseno de DMZ"

## Input Requirements

### Required Inputs
| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `system_landscape` | Complete inventory of IT and OT systems with versions and roles | .xlsx / .docx | Client IT/OT |
| `process_architecture` | High-level process flow diagrams and control philosophy | .pdf / .docx | Engineering |
| `data_requirements` | Business data requirements by user group (operations, maintenance, management) | .xlsx / .docx | Operations / Management |
| `network_architecture` | Current or planned network topology (generic -- no IPs per security policy) | .docx / .pdf | Client IT/OT |
| `industry_sector` | Mining, Oil & Gas, Chemicals, Power, Water | Text | User |

### Optional Inputs (Highly Recommended)
| Input | Description | Default |
|-------|-------------|---------|
| `sap_configuration_spec` | SAP module configuration (PM, MM, PP, QM) and custom objects | Generic SAP S/4HANA |
| `scada_tag_database` | SCADA/DCS tag list with signal types and frequencies | Derive from P&IDs |
| `historian_requirements` | Data storage requirements (retention, resolution, compression) | 1-year full resolution, 10-year compressed |
| `existing_integrations` | Current system integration inventory (brownfield) | None (greenfield assumed) |
| `cybersecurity_requirements` | Output from audit-cybersecurity-posture skill | IEC 62443 best practice defaults |
| `data_governance_framework` | Output from manage-data-governance skill | Build minimum framework |
| `performance_requirements` | Latency, throughput, availability SLAs for integrations | Industry standard defaults |
| `cloud_strategy` | Client cloud adoption posture (on-premise, hybrid, cloud-first) | Hybrid (on-prem OT, cloud IT analytics) |

### Context Enrichment
The agent should automatically:
- Retrieve ISA-95 / IEC 62264 integration model hierarchy and activity models
- Reference OPC Foundation standards (OPC UA, OPC DA) for real-time data exchange
- Pull common industrial protocol standards (MQTT, AMQP, Modbus TCP, EtherNet/IP)
- Identify SAP integration patterns for industrial environments (SAP PO, SAP CPI, RFC, IDoc, BAPI)
- Reference IEC 62443 zone and conduit modeling requirements for secure architecture design

## Output Specification

### Document 1: IT/OT Convergence Plan (.docx)
**Filename**: `VSC_ITOT_Convergence_{ProjectCode}_{Version}_{Date}.docx`

**Structure**:
1. **Cover Page** - VSC branding, project identification
2. **Document Control** - Revision history, approval matrix
3. **Table of Contents**
4. **Executive Summary** (2-3 pages)
   - Convergence vision and objectives
   - Architecture overview (conceptual diagram)
   - Technology stack summary
   - Implementation roadmap highlights
5. **Introduction & Scope** (2 pages)
   - Systems in scope by ISA-95 level
   - Integration objectives and business drivers
   - Applicable standards and constraints
6. **Current State Assessment** (3-4 pages)
   - 6.1 Existing system landscape inventory
   - 6.2 Current integration patterns (if brownfield)
   - 6.3 Gap analysis against target capabilities
   - 6.4 Technical debt and legacy constraints
7. **Target Architecture** (6-8 pages)
   - 7.1 ISA-95 reference architecture mapping
   - 7.2 Enterprise layer (Level 4) -- ERP, BI, cloud analytics
   - 7.3 Operations management layer (Level 3) -- MES, MOM, historian
   - 7.4 Supervisory layer (Level 2) -- SCADA, HMI, DCS
   - 7.5 Control layer (Level 1) -- PLC, RTU, SIS
   - 7.6 DMZ design (Level 3.5) -- firewalls, data diodes, proxies
   - 7.7 Edge and cloud integration patterns
   - 7.8 Conceptual architecture diagram
8. **Data Flow Specifications** (5-6 pages)
   - 8.1 Real-time process data flows (OPC UA/MQTT)
   - 8.2 Historical data flows (historian to analytics)
   - 8.3 Work management data flows (ERP-CMMS)
   - 8.4 Material and inventory data flows
   - 8.5 Alarm and event data flows
   - 8.6 Quality and laboratory data flows
   - 8.7 Data flow matrix summary
9. **Middleware and Integration Technology** (4-5 pages)
   - 9.1 Middleware selection criteria and evaluation
   - 9.2 Selected middleware architecture
   - 9.3 Protocol and connectivity standards
   - 9.4 API design principles and standards
   - 9.5 Data transformation and mapping rules
10. **Security Architecture** (3-4 pages)
    - 10.1 IEC 62443 zone and conduit model
    - 10.2 Network segmentation design
    - 10.3 Authentication and authorization patterns
    - 10.4 Data encryption in transit and at rest
    - 10.5 Monitoring and anomaly detection
11. **Performance and Reliability** (2-3 pages)
    - 11.1 Latency requirements and SLAs by data flow
    - 11.2 High availability and redundancy design
    - 11.3 Failover and degraded mode operation
    - 11.4 Capacity planning and scalability
12. **Implementation Roadmap** (3-4 pages)
    - 12.1 Phased implementation plan
    - 12.2 Migration strategy (brownfield)
    - 12.3 Testing and validation approach
    - 12.4 Commissioning integration checkpoints
    - 12.5 Resource requirements and timeline
13. **Appendices**
    - A: Complete data flow matrix (reference to .xlsx)
    - B: API specification register
    - C: Middleware evaluation scorecard
    - D: Network zone and conduit diagram (generic)

### Document 2: Data Flow and Integration Workbook (.xlsx)
**Filename**: `VSC_ITOT_DataFlows_{ProjectCode}_{Version}_{Date}.xlsx`

**Sheets**:

#### Sheet 1: System Inventory
| Column | Description |
|--------|-------------|
| System_ID | Unique system identifier |
| System_Name | Name (e.g., SAP S/4HANA, PI System, DeltaV DCS) |
| ISA95_Level | 0 / 1 / 2 / 3 / 3.5 / 4 / 5 |
| System_Type | ERP / CMMS / MES / SCADA / DCS / Historian / PLC / SIS / BI |
| Vendor | Technology vendor |
| Network_Zone | IEC 62443 zone assignment |
| Protocols_Supported | OPC UA / REST / MQTT / Modbus / EtherNet/IP / RFC / IDoc |
| Data_Owner | Responsible entity per SWMR model |

#### Sheet 2: Data Flow Matrix
| Column | Description |
|--------|-------------|
| Flow_ID | Unique data flow identifier (DF-001) |
| Source_System | Originating system |
| Destination_System | Receiving system |
| Data_Entity | Data being exchanged (e.g., process variables, work orders) |
| Direction | Unidirectional / Bidirectional |
| Protocol | Integration protocol |
| Frequency | Real-time / Near real-time / Batch (hourly/daily) / On-demand |
| Volume | Estimated data volume per transfer |
| Latency_SLA | Maximum acceptable latency |
| Transformation | Data transformation rules required |
| Security_Classification | Per data governance framework |
| DMZ_Traversal | Yes / No -- does this flow cross the IT/OT DMZ |
| Status | Planned / In Development / Tested / Production |

#### Sheet 3: API Register
| Column | Description |
|--------|-------------|
| API_ID | Unique API identifier |
| API_Name | Descriptive name |
| Source_System | API provider |
| Consumer_System | API consumer |
| Protocol | REST / OPC UA / SOAP / GraphQL |
| Endpoint_Pattern | URL pattern (generic -- no actual URLs) |
| Authentication | Method (OAuth2, API Key, Certificate, Kerberos) |
| Rate_Limit | Requests per second/minute |
| Data_Format | JSON / XML / OPC UA binary |
| Version | API version |
| Status | Design / Development / Testing / Production |

#### Sheet 4: Middleware Evaluation
| Column | Description |
|--------|-------------|
| Criterion | Evaluation criterion |
| Weight | Criterion weight (%) |
| Candidate_1 | Score for first middleware option |
| Candidate_2 | Score for second middleware option |
| Candidate_3 | Score for third middleware option |
| Notes | Justification for scores |

#### Sheet 5: Integration Test Plan
| Column | Description |
|--------|-------------|
| Test_ID | Unique test identifier |
| Flow_ID | Linked data flow |
| Test_Description | What is being tested |
| Test_Type | Unit / Integration / End-to-End / Performance / Security |
| Preconditions | Test prerequisites |
| Expected_Result | Expected outcome |
| Pass_Criteria | Quantitative pass/fail criteria |
| Status | Not Started / In Progress / Passed / Failed |

## Procedure

### Step 1: System Landscape Discovery and Requirements
- Catalog all IT and OT systems by ISA-95 level with roles and capabilities
- Document business data requirements by user group (what data, from where, how fast)
- Identify current integration patterns and technical debt (brownfield)
- Collect performance requirements (latency, throughput, availability SLAs)
- Review cybersecurity requirements from audit-cybersecurity-posture output
- Review data governance framework from manage-data-governance output

### Step 2: Target Architecture Design
- Map the target integration architecture to the ISA-95 reference model
- Design the DMZ layer (Level 3.5) with security controls per IEC 62443
- Define integration patterns for each system pair (real-time, batch, event-driven)
- Select and specify integration protocols (OPC UA, MQTT, REST, SAP RFC/IDoc)
- Design high availability, redundancy, and failover mechanisms
- Create conceptual architecture diagrams (generic -- no specific IPs or credentials)

### Step 3: Data Flow Specification
- Map every data flow between systems: source, destination, entity, direction, frequency
- Define data transformation rules where source and destination schemas differ
- Specify latency and throughput SLAs for each data flow
- Identify DMZ traversal requirements and security controls per flow
- Cross-reference data flows with data governance classification and ownership

### Step 4: Middleware Selection and API Design
- Define middleware evaluation criteria (protocol support, scalability, security, cost, vendor support)
- Evaluate candidate middleware platforms against criteria
- Design API specifications for custom integrations (RESTful patterns, OPC UA information models)
- Define authentication, rate limiting, error handling, and versioning standards
- Specify data format standards and schema management approach

### Step 5: Documentation and Validation
- Generate the IT/OT Convergence Plan (.docx)
- Generate the Data Flow and Integration Workbook (.xlsx)
- Cross-validate data flows against system capabilities and security constraints
- Verify architecture compliance with IEC 62443 and ISA-95
- Develop implementation roadmap with phased milestones and commissioning checkpoints

## Quality Criteria

| Criterion | Weight | Description | Target |
|-----------|--------|-------------|--------|
| Technical Accuracy | 30% | Architecture aligns with ISA-95; DMZ design meets IEC 62443; protocols are correctly specified | >91% |
| Completeness | 25% | All system pairs have defined integration patterns; all data flows are documented; no orphan interfaces | >95% |
| Consistency | 15% | Data flows are consistent with data governance ownership; security constraints match audit findings | 100% |
| Format | 10% | Professional VSC branding; architecture diagrams are clear; data flow matrix is complete | >95% |
| Actionability | 10% | Convergence plan can be implemented by integration team; APIs are specified enough to develop | >90% |
| Traceability | 10% | Every design decision traces to a requirement, standard, or business driver | >90% |

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents)
| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| `manage-data-governance` | Data ownership and classification | Provides SWMR model and data classification for security controls per flow |
| `audit-cybersecurity-posture` | Security requirements | Provides IEC 62443 zone model and security constraints for DMZ design |
| `asset-management` / `design-sap-pm-blueprint` | SAP PM/MM requirements | Provides ERP-side data requirements for work orders, equipment, materials |
| `operations` / `create-operations-manual` | Operational data needs | Defines real-time data requirements for operator dashboards and KPIs |
| `execution` / `create-commissioning-plan` | Commissioning sequence | Provides timeline for integration testing and go-live milestones |
| `hse` | Safety system interfaces | Defines SIS data requirements and isolation constraints |

### Downstream Dependencies (Outputs TO other agents)
| Agent/Skill | Output Provided | Trigger |
|-------------|----------------|---------|
| `audit-cybersecurity-posture` | Architecture for security review | Automatic -- provides architecture to be audited |
| `manage-document-systems` | DMS integration specifications | On request -- for document management system integration |
| `asset-management` / `load-sap-master-data` | Integration interfaces for SAP data loading | On request |
| `orchestrator` / `create-kpi-dashboard` | Data flow health KPIs | On request |
| `execution` / `create-commissioning-plan` | Integration commissioning checklist | Automatic |

### Collaboration During Execution
| Agent/Skill | Collaboration Type | When |
|-------------|-------------------|------|
| `asset-management` | Joint SAP interface design | During ERP integration specification |
| `audit-cybersecurity-posture` | Security architecture review | During DMZ and access control design |
| `manage-data-governance` | Data flow classification | During data flow mapping |
| `operations` | Operational dashboard requirements | During real-time data flow specification |

## References

### Primary Standards
| Standard | Application |
|----------|-------------|
| **ISA-95 / IEC 62264** | Enterprise-Control System Integration -- reference architecture and activity models |
| **IEC 62443** | Industrial cybersecurity -- zone and conduit model for secure convergence |
| **OPC UA (IEC 62541)** | Unified Architecture for industrial interoperability -- primary OT data exchange standard |
| **ISA-88 / IEC 61512** | Batch control -- batch process integration patterns |
| **MQTT v5.0** | Message Queuing Telemetry Transport -- lightweight IoT/edge messaging protocol |

### Integration Technology References
| Reference | Application |
|-----------|-------------|
| **SAP Integration Suite** | SAP PO, CPI, RFC, IDoc, BAPI integration patterns |
| **OSIsoft PI System** | Historian and data infrastructure reference architecture |
| **Aveva System Platform** | SCADA/MES integration patterns |
| **Azure IoT / AWS IoT** | Cloud-edge integration architectures |
| **Apache Kafka** | Event streaming for high-volume industrial data |

### Industry References
- NAMUR Open Architecture (NOA) -- OT integration reference for process industries
- Open Process Automation Standard (OPAS) -- The Open Group
- Digital Twin Consortium -- integration patterns for digital twin implementations
- ARC Advisory Group -- ISA-95 implementation best practices
- MESA International -- MES/MOM integration standards

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-02-25 | VSC IT/OT Agent | Initial version. Complete IT/OT convergence plan with ISA-95 architecture, data flow mapping, DMZ design, middleware selection, and API specifications. |
