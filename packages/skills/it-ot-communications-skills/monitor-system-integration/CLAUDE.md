---
name: monitor-system-integration
description: "Track and validate system integration across ERP, CMMS, SCADA, DCS, MES, and other enterprise/industrial platforms during OR projects. Monitors integration test execution, data flow validation, API health, error rates, and interface compliance. Triggers: 'system integration', 'integration testing', 'integracion de sistemas', 'monitoreo de interfaces'."
---

# Monitor System Integration
## Skill ID: monitor-system-integration
## Version: 1.0.0
## Category: C - Tracking
## Priority: High

## Purpose

Monitors, tracks, and validates the integration of enterprise and industrial systems during Operational Readiness projects in mining, oil & gas, chemicals, and energy sectors. System integration is one of the highest-risk activities in OR programs because modern industrial facilities rely on a complex ecosystem of interconnected platforms -- ERP (SAP, Oracle), CMMS (SAP PM, Maximo, Infor EAM), SCADA/DCS (ABB, Honeywell, Siemens, Yokogawa, Emerson), MES (Manufacturing Execution Systems), PI Historian, laboratory information management systems (LIMS), environmental monitoring systems, and dozens of specialized applications.

Failed or incomplete system integration is a leading cause of delayed first production, operational inefficiency during ramp-up, and safety incidents when operators lack real-time data visibility. This skill provides a structured framework for tracking integration test plans, monitoring data flow between systems, validating API health and performance, measuring error rates, and ensuring that all system interfaces are functioning correctly before the facility transitions from construction to operations.

The integration monitoring framework covers IT systems (corporate network, ERP, business applications), OT systems (process control, SCADA, DCS, safety instrumented systems), and the critical IT/OT convergence layer where these domains intersect.

**CRITICAL SECURITY CONSTRAINT:** This skill NEVER exposes OT network configurations, IP addresses, firewall rules, or credentials in any output document. All OT-specific technical details are referenced by system identifier only, with actual configuration details maintained in the client's secure configuration management database (CMDB).

## Intent & Specification

The AI agent MUST understand the following core goals:

1. **Integration Test Tracking Is Systematic**: Every system interface must have a defined integration test plan with test cases, expected results, pass/fail criteria, and responsible parties. The agent tracks test execution status across all interfaces.

2. **Data Flow Validation Is Continuous**: Data flowing between systems must be validated for accuracy, completeness, timeliness, and format compliance. The agent monitors data flow health indicators and flags anomalies.

3. **API Health Monitoring Covers All Endpoints**: For systems connected via APIs (REST, SOAP, OPC-UA, OPC-DA), the agent tracks endpoint availability, response times, error rates, authentication status, and throughput.

4. **Error Rate Thresholds Trigger Escalation**: Each interface has defined error rate thresholds. When error rates exceed thresholds, the agent generates alerts with diagnostic information and escalation recommendations.

5. **ERP/CMMS/SCADA Integration Is Priority**: The triad of ERP (financial/procurement), CMMS (maintenance management), and SCADA/DCS (process control) represents the most critical integration layer. These interfaces receive heightened monitoring.

6. **OT Security Is Non-Negotiable**: No monitoring output may contain OT network topology, IP addresses, communication protocols details, firewall configurations, or credentials. All references use abstract system identifiers.

7. **Language**: Spanish (Latin American) by default for reports. Technical interface specifications may use English where industry convention dictates.

## Trigger / Invocation

```
/monitor-system-integration
```

### Natural Language Triggers
- "Check the status of system integration testing"
- "Generate the integration test tracking report"
- "What is the API health status for ERP-CMMS interfaces?"
- "Report on data flow errors between SCADA and historian"
- "Revisa el estado de las pruebas de integracion de sistemas"
- "Genera el reporte de seguimiento de integracion"
- "Cual es el estado de salud de las interfaces ERP-CMMS?"
- "Reporta los errores de flujo de datos entre SCADA e historiador"
- "Monitorea la integracion de los sistemas del proyecto"

## Input Requirements

### Required Inputs
| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `project_context` | Project name, phase, systems in scope | Text / .docx | Orchestrator / User |
| `system_inventory` | List of systems requiring integration (ERP, CMMS, SCADA, DCS, MES, etc.) | .xlsx / Table | Client IT/OT team |
| `interface_register` | Register of all system interfaces with source/target, protocol, data elements | .xlsx | Client IT/OT / EPC |
| `integration_test_plan` | Test cases per interface with expected results and pass/fail criteria | .xlsx / .docx | Client IT/OT / System integrator |
| `test_execution_results` | Current test execution status (pass/fail/pending/blocked) | .xlsx / API | Test execution team |

### Optional Inputs (Highly Recommended)
| Input | Description | Default |
|-------|-------------|---------|
| `api_health_metrics` | Current API availability, response times, error rates | Collect from monitoring tools |
| `data_flow_logs` | Data transfer logs showing volumes, timestamps, error counts | Request from middleware team |
| `error_threshold_definitions` | Acceptable error rates per interface type | Industry defaults (99.5% availability, <0.1% error rate) |
| `network_architecture_ref` | Reference ID for network architecture (NOT the architecture itself) | Request as system identifier |
| `previous_monitoring_reports` | Historical integration monitoring data for trend analysis | None (baseline) |
| `opc_ua_server_status` | OPC-UA server connectivity and subscription status | Request from OT team |
| `cmdb_system_ids` | Configuration Management Database system identifiers | Client CMDB extract |

### Context Enrichment
The agent should automatically:
- Reference the IT/OT convergence plan from plan-it-ot-convergence skill
- Pull cybersecurity requirements from audit-cybersecurity-posture skill
- Retrieve data governance classification from manage-data-governance skill
- Check the project schedule for integration testing milestones from Execution agent
- Identify dependencies on commissioning sequence from Execution agent

## Output Specification

### Output 1: Integration Status Dashboard (.md)
**Filename**: `VSC_Integration_Dashboard_{ProjectCode}_{Date}.md`

**Structure**:
1. **Executive Summary** - Overall integration health (Green/Amber/Red), key metrics
2. **System Inventory Summary** - Table of all systems with integration status
3. **Integration Test Progress** - Test execution metrics (total, passed, failed, pending, blocked)
4. **Critical Path Interfaces** - Top 10 priority interfaces with detailed status
5. **Error Rate Summary** - Interfaces exceeding error thresholds
6. **Data Flow Health** - Data transfer volumes and error rates by interface
7. **API Health Summary** - Endpoint availability and response time metrics
8. **Blocked/Failed Tests** - Detailed list with root cause and remediation plan
9. **Risk Register** - Integration risks with probability, impact, and mitigation
10. **Upcoming Test Schedule** - Next 2-week integration test plan

### Output 2: Integration Test Tracking Report (.xlsx schema)
**Filename**: `VSC_Integration_Test_Tracker_{ProjectCode}_{Version}_{Date}.xlsx`

**Sheets**:

#### Sheet 1: Interface Register
| Column | Description |
|--------|-------------|
| Interface_ID | Unique interface identifier (e.g., IF-001) |
| Source_System | Source system name and ID |
| Target_System | Target system name and ID |
| Interface_Type | API / File Transfer / Database Link / OPC / Manual |
| Protocol | REST / SOAP / OPC-UA / OPC-DA / SFTP / JDBC / Other |
| Data_Elements | Key data elements transferred |
| Frequency | Real-time / Batch (hourly/daily) / On-demand |
| Priority | Critical / High / Medium / Low |
| Owner | Responsible team/person |
| Status | Not Started / In Progress / Testing / Validated / Failed |

#### Sheet 2: Test Execution Log
| Column | Description |
|--------|-------------|
| Test_ID | Unique test case identifier |
| Interface_ID | Related interface |
| Test_Description | What is being tested |
| Preconditions | Required setup before test |
| Test_Data | Test data used |
| Expected_Result | Expected outcome |
| Actual_Result | Observed outcome |
| Status | Pass / Fail / Blocked / Pending / Deferred |
| Tester | Person executing test |
| Test_Date | Date of execution |
| Defect_Ref | Defect ticket number (if failed) |
| Retest_Date | Planned retest date |
| Notes | Additional observations |

#### Sheet 3: API Health Metrics
| Column | Description |
|--------|-------------|
| Endpoint_ID | API endpoint identifier |
| System | Associated system |
| URL_Pattern | URL pattern (NO actual URLs with IPs) |
| Availability_Pct | Uptime percentage (target >99.5%) |
| Avg_Response_ms | Average response time in milliseconds |
| P95_Response_ms | 95th percentile response time |
| Error_Rate_Pct | Error rate percentage |
| Last_Check | Timestamp of last health check |
| Status | Healthy / Degraded / Down / Unknown |
| Threshold_Breach | Y/N - is any metric exceeding threshold? |

#### Sheet 4: Data Flow Validation
| Column | Description |
|--------|-------------|
| Flow_ID | Data flow identifier |
| Interface_ID | Related interface |
| Source_Record_Count | Records sent from source |
| Target_Record_Count | Records received at target |
| Discrepancy | Count mismatch (if any) |
| Data_Quality_Score | Percentage of records passing validation |
| Latency_Seconds | Time from source to target |
| Last_Transfer | Timestamp of last successful transfer |
| Error_Count | Number of errors in period |
| Error_Type | Categorized error types |

#### Sheet 5: Risk & Issues Log
| Column | Description |
|--------|-------------|
| Risk_ID | Unique risk/issue identifier |
| Type | Risk / Issue / Dependency |
| Interface_ID | Related interface(s) |
| Description | Risk/issue description |
| Probability | High / Medium / Low |
| Impact | Critical / High / Medium / Low |
| Mitigation | Planned mitigation action |
| Owner | Responsible person |
| Due_Date | Target resolution date |
| Status | Open / In Progress / Resolved / Closed |

### Output 3: Integration Alert Notification (.md)
**Filename**: `VSC_Integration_Alert_{ProjectCode}_{AlertID}_{Date}.md`

**Structure** (1 page, generated when thresholds exceeded):
1. **Alert Header** - Severity (Critical/Warning/Info), timestamp, interface ID
2. **Affected Systems** - Source and target systems (by identifier only)
3. **Issue Description** - What was detected
4. **Impact Assessment** - Operational impact if unresolved
5. **Recommended Actions** - Diagnostic steps and remediation suggestions
6. **Escalation Path** - Who to contact based on severity

## Procedure

### Step 1: System Inventory and Interface Mapping
- Compile complete inventory of all systems requiring integration
- Map all interfaces between systems (source, target, protocol, data elements, frequency)
- Classify interfaces by priority (Critical, High, Medium, Low) based on operational impact
- Assign system identifiers (NEVER use actual IP addresses or network details in outputs)
- Validate interface register against the IT/OT convergence plan
- Identify dependencies on construction completion and commissioning sequence

### Step 2: Integration Test Plan Validation and Tracking Setup
- Review integration test plans for completeness (test cases cover all data elements per interface)
- Verify pass/fail criteria are defined and measurable for each test case
- Establish test execution tracking structure (spreadsheet or tool-based)
- Define error rate thresholds per interface type (real-time vs. batch, critical vs. standard)
- Set up escalation rules for test failures (who to notify, response time SLAs)
- Confirm test data availability and test environment readiness

### Step 3: Data Flow and API Health Monitoring
- Track data flow volumes, timing, and error rates between integrated systems
- Monitor API endpoint availability, response times, and error rates
- Validate data quality at target systems (completeness, accuracy, format compliance)
- Compare source record counts to target record counts for each interface
- Flag latency exceeding defined thresholds for real-time interfaces
- Monitor OPC-UA/OPC-DA connection status for SCADA/DCS interfaces

### Step 4: Issue Resolution and Risk Management
- Analyze failed tests to identify root causes (configuration, data mapping, network, security)
- Track defect resolution progress and retest scheduling
- Maintain integration risk register with probability, impact, and mitigation plans
- Escalate blocked tests with dependency analysis and unblocking recommendations
- Generate integration alerts when error thresholds are exceeded
- Coordinate with cybersecurity team for security-related integration issues

### Step 5: Status Reporting and Trend Analysis
- Generate integration status dashboard with overall health metrics
- Produce detailed tracking reports for project governance reviews
- Analyze trends in test pass rates, error rates, and data flow health
- Forecast integration completion dates based on current execution velocity
- Identify systemic issues requiring architectural intervention
- Update the Orchestrator with integration readiness status for gate reviews

## Quality Criteria

| Criterion | Weight | Description | Target |
|-----------|--------|-------------|--------|
| Technical Accuracy | 30% | Interface status correctly reflects test results; API metrics match source data; error rates calculated correctly | >91% |
| Completeness | 25% | All interfaces tracked; all test cases monitored; all systems in inventory; no blind spots | >95% |
| Consistency | 15% | Status definitions consistent across all interfaces; priority classifications aligned with operational impact | >91% |
| Format | 10% | Dashboard is clear and actionable; tracking sheets follow standard schema; alerts are unambiguous | >91% |
| Actionability | 10% | Failed tests include root cause analysis; alerts include remediation steps; risks include mitigation plans | >91% |
| Traceability | 10% | Every status traces to test execution evidence; every alert traces to monitored metric; no unsubstantiated claims | >91% |

### Security-Specific Quality Checks
- [ ] NO OT network configurations, IP addresses, or credentials appear in any output
- [ ] All systems referenced by abstract identifiers only
- [ ] OPC-UA/OPC-DA connection details do not expose endpoint URLs
- [ ] Firewall rules and network topology are NEVER included
- [ ] Security-sensitive integration issues are flagged for confidential handling

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents)
| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| `execution` | Project schedule | Provides integration testing milestones and commissioning sequence |
| `execution` / `model-commissioning-sequence` | Commissioning dependencies | Identifies which integrations must be complete before commissioning steps |
| `plan-it-ot-convergence` | IT/OT architecture | Provides the reference architecture for integration monitoring |
| `audit-cybersecurity-posture` | Security requirements | Provides security constraints for integration testing and monitoring |
| `manage-data-governance` | Data classification | Identifies data sensitivity levels affecting integration monitoring scope |
| `asset-management` / `design-sap-pm-blueprint` | SAP PM/MM integration specs | Provides ERP-CMMS integration requirements and data mappings |
| `operations` | Operational system requirements | Identifies systems needed for operations readiness |

### Downstream Dependencies (Outputs TO other agents)
| Agent/Skill | Output Provided | Trigger |
|-------------|----------------|---------|
| `orchestrator` | Integration readiness status for gate reviews | On request / periodic |
| `execution` | Integration test completion status for commissioning go/no-go | On request |
| `hse` | Safety system integration validation status | On request |
| `operations` | Operational system readiness confirmation | On request |
| `manage-document-systems` | Integration documentation filed in DMS | Automatic |

### Collaboration During Execution
| Agent/Skill | Collaboration Type | When |
|-------------|-------------------|------|
| `execution` | Integration-commissioning dependency alignment | During test scheduling |
| `audit-cybersecurity-posture` | Security review of integration test results | When security-related tests fail |
| `plan-it-ot-convergence` | Architecture alignment verification | During initial interface mapping |
| `asset-management` | SAP PM/MM data validation | During ERP-CMMS integration testing |

## References

### Primary Standards
| Standard | Application |
|----------|-------------|
| **IEC 62443** | Industrial automation and control systems security -- integration security |
| **ISA-95 / IEC 62264** | Enterprise-control system integration -- interface standards |
| **OPC UA (IEC 62541)** | Unified architecture for industrial communication |
| **ISO 27001** | Information security management -- integration security controls |
| **ANSI/ISA-88** | Batch control -- system integration standards |

### Industry References
- NAMUR NE 148 -- Automation requirements for modular production (integration standards)
- ARC Advisory Group -- Enterprise/Plant Integration Framework
- Gartner IT/OT Convergence Reference Architecture
- MESA International -- MES/MOM integration standards (ISA-95 implementation)
- SAP Integration Suite documentation for S/4HANA and PM/MM modules
- IBM Maximo integration patterns for industrial environments

### Regulatory Context (Chile / Latin America)
| Regulation | Application |
|------------|-------------|
| **Ley 21.180** | Transformacion digital del Estado -- digital system integration requirements |
| **NCh-ISO 27001** | Chilean adoption of ISO 27001 -- security in system integration |
| **DS 132** | Mining safety -- safety system integration requirements |
| **SEC Standards** | Superintendencia de Electricidad y Combustibles -- SCADA/control system standards |

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-02-25 | VSC IT/OT Agent | Initial version. Complete system integration monitoring skill covering ERP/CMMS/SCADA interfaces, API health tracking, data flow validation, error rate monitoring, and integration test management with OT security constraints. |
