# Detailed Step-by-Step Execution - unify-operational-data

*Full detailed execution steps extracted from SKILL.md.*
*Read this file when executing the skill for complete step-by-step instructions.*

---

## Step-by-Step Execution

### Phase 1: Discovery and Assessment (Steps 1-4)

**Step 1: Map the Current Data Landscape**
- Inventory all IT and OT systems in the facility:
  - System name, vendor, version, deployment date
  - Primary purpose and functional area served
  - Key data entities and approximate record counts
  - Data model type (relational, time-series, document, hybrid)
  - User base: who accesses data, how many users, frequency
  - System owner and technical support contact
- Create the system landscape diagram showing:
  - All systems and their relationships
  - Existing interfaces and data flows
  - Manual data transfers (spreadsheets, email, paper)
  - Data islands (systems with no interfaces)
- Classify systems by ISA-95 level

**Step 2: Inventory Data Sources and Elements**
- For each system, catalog the key data entities and attributes:
  - Entity name (e.g., Equipment, Work Order, Process Measurement)
  - Key attributes with data types and formats
  - Business definitions for each attribute
  - Data volumes and growth rates
  - Update frequency (real-time, daily, weekly, event-driven)
  - Data retention policies
- Identify data that exists in multiple systems (redundancy map)
- Map cross-system identifiers (how is the same asset identified in each system?)
- Document data access methods (API, database query, file export, web service)

**Step 3: Assess Data Quality**
- For each key data entity in each system, evaluate the six quality dimensions:
  - **Completeness**: Query for null/blank values in mandatory fields
  - **Accuracy**: Sample verification of data against source records or field audit
  - **Consistency**: Cross-system comparison of shared data elements (same equipment, same tag, same material)
  - **Timeliness**: Check data freshness (last update timestamp vs. expected update frequency)
  - **Uniqueness**: Run duplicate detection on key identifiers
  - **Validity**: Check data against defined business rules (valid value ranges, format standards)
- Quantify quality scores per entity, per system, per dimension
- Identify the root causes of quality issues:
  - Data entry errors (lack of validation, poor UI design)
  - Integration failures (interfaces not running, mapping errors)
  - Process gaps (no defined process for data creation/update)
  - Naming convention inconsistencies (different conventions in different systems)
  - Stale data (records not updated after changes)
- Estimate the business impact of identified quality issues

**Step 4: Analyze Business Requirements for Integrated Data**
- Interview key stakeholders (or analyze provided requirements) to identify:
  - What decisions require data from multiple systems?
  - What reports currently require manual data compilation?
  - What KPIs have known discrepancies between systems?
  - What analytics or insights are desired but cannot be produced?
  - What regulatory reports require data from multiple sources?
- Prioritize use cases by business value and feasibility:
  - **Quick wins**: High value, low complexity (e.g., aligning equipment tags)
  - **Strategic**: High value, high complexity (e.g., predictive maintenance data platform)
  - **Tactical**: Medium value, low complexity (e.g., automated report generation)
  - **Future state**: Medium value, high complexity (e.g., digital twin)
- Define specific KPIs and their data source mapping
- Document latency requirements (how quickly must data be available?)

### Phase 2: Architecture Design (Steps 5-8)

**Step 5: Define Master Data Model**
- For each master data entity (equipment, material, organizational, personnel, vendor):
  - Define the authoritative source (system of record)
  - Define the canonical data model (standard attributes, naming conventions, valid values)
  - Define matching rules for cross-system record linking
  - Define data governance: who creates, who updates, who approves changes
  - Define the synchronization strategy to secondary systems
- Build the cross-reference mapping:
  - Equipment: CMMS tag <> SCADA tag <> ERP asset number <> DMS document reference
  - Material: CMMS material number <> ERP material number <> vendor part number
  - Location: CMMS functional location <> ERP cost center <> SCADA area/unit
- Define naming convention standards for all new data creation
- Design the master data lifecycle: create, validate, approve, distribute, update, retire

**Step 6: Design Integration Architecture**
- Select the integration architecture pattern:
  - **Point-to-point**: Simple but does not scale (acceptable for <5 systems)
  - **Enterprise Service Bus (ESB)**: Middleware-mediated integration (suitable for transactional data)
  - **Data Lake/Warehouse**: Centralized data store (suitable for analytics and reporting)
  - **Hybrid**: Combination of real-time integration and data lake (recommended for most industrial facilities)
- For each required data flow, define:
  - Source system and target system
  - Data elements to be exchanged
  - Transformation rules (format conversion, unit conversion, code mapping)
  - Integration pattern: real-time API, near-real-time streaming, batch ETL
  - Frequency and acceptable latency
  - Error handling: what happens if the integration fails?
  - Monitoring: how will integration health be tracked?
- Design the technology stack:
  - OPC-UA gateway for SCADA/DCS integration
  - API layer (REST/SOAP) for enterprise system integration
  - ETL tools for batch data movement
  - Data platform for central storage and analytics
  - Metadata catalog for data discovery

**Step 7: Establish Data Quality Rules and Governance**
- Define automated data quality rules:
  - **At creation**: Mandatory field checks, format validation, duplicate detection, reference data validation
  - **At integration**: Cross-system consistency checks, transformation validation, completeness verification
  - **At consumption**: Freshness checks, anomaly detection, threshold alerting
- Design the data quality monitoring dashboard:
  - Quality scores by system, entity, and dimension
  - Quality trend analysis
  - Data quality issue log with remediation tracking
- Define the data governance organizational structure:
  - **Data Governance Council**: Senior leaders who set data policy and resolve disputes
  - **Data Owners**: Business managers accountable for data quality in their domain
  - **Data Stewards**: Practitioners responsible for day-to-day data management
  - **Data Engineers**: Technical staff who build and maintain integrations
  - **Data Consumers**: All users who access data, with responsibility to report issues
- Develop data governance policies:
  - Data creation and change management policy
  - Data quality standards and acceptable thresholds
  - Data access and security policy
  - Data retention and archival policy
  - Data issue resolution process

**Step 8: Specify Unified Dashboards**
- For each identified dashboard audience:
  - Define the dashboard purpose and key questions it answers
  - List all KPIs with precise definitions:
    - KPI name and business definition
    - Calculation formula
    - Data sources (system, entity, attribute)
    - Refresh rate requirement
    - Target values and alert thresholds
    - Drill-down capability (from summary to detail)
  - Design the layout wireframe:
    - Information hierarchy (most important KPIs prominent)
    - Visualization types (gauges, trend charts, tables, heat maps)
    - Filter and navigation controls
    - Mobile and desktop layouts
  - Define alert and notification rules:
    - Threshold-based alerts (KPI exceeds limit)
    - Trend-based alerts (KPI degrading over time)
    - Missing data alerts (expected data not received)
    - Notification channels: in-dashboard, email, Teams, SMS

### Phase 3: Implementation Planning (Steps 9-12)

**Step 9: Design ETL/API Specifications**
- For each integration point defined in Step 6, develop detailed specifications:
  - **Source extraction**: SQL queries, API calls, OPC subscriptions, or file exports
  - **Transformation logic**: Field mapping, data type conversion, unit conversion, code translation, calculated fields, aggregation rules
  - **Target loading**: Insert/update logic, conflict resolution, error records handling
  - **Scheduling**: Execution frequency, time windows, dependencies on other jobs
  - **Monitoring**: Success/failure alerting, row count validation, quality checks post-load
- For real-time integrations:
  - API endpoint definitions (URL, method, authentication, request/response format)
  - Event subscription configuration (OPC-UA, MQTT, webhook)
  - Latency and throughput requirements
  - Failover and retry policies
- For batch integrations:
  - ETL job sequence and dependency chains
  - Data staging and validation steps
  - Incremental vs. full load strategies
  - Recovery and restart procedures

**Step 10: Define Data Validation Approach**
- Design the validation framework:
  - **Unit testing**: Each integration point validated individually (correct data mapping, no data loss)
  - **Integration testing**: End-to-end data flow from source to dashboard verified
  - **User acceptance testing**: Business users verify data accuracy and dashboard usability
  - **Reconciliation testing**: Source system counts and totals match integrated data
- Define test scenarios and expected results for each integration
- Plan data migration validation (for initial loading of historical data)
- Define the parallel run period (old and new reporting running simultaneously)

**Step 11: Plan Phased Implementation**
- Define implementation phases:
  - **Phase 1 (Foundation, Months 1-3)**: Master data alignment, equipment cross-referencing, CMMS-ERP integration for cost reporting
  - **Phase 2 (Operations, Months 3-6)**: SCADA-to-historian-to-dashboard integration, real-time operations dashboard, process-maintenance correlation
  - **Phase 3 (Analytics, Months 6-12)**: Data lake build-out, advanced analytics, predictive maintenance data pipeline, HSE integrated reporting
  - **Phase 4 (Optimization, Months 12-18)**: Machine learning models, digital twin data feeds, automated regulatory reporting
- For each phase:
  - Deliverables and acceptance criteria
  - Resource requirements (data engineers, system administrators, business analysts, vendor support)
  - Budget allocation
  - Risk assessment and mitigation
  - Dependencies on other OR activities

**Step 12: Develop Change Management and Training Plan**
- Identify stakeholders affected by data integration:
  - Who will use new dashboards and reports?
  - Who will change their data entry practices?
  - Who will take on data governance roles?
  - Who will lose existing (familiar) reports?
- Develop the change management approach:
  - Communication plan: why data integration matters, what will change, when
  - Training plan for data stewards, dashboard users, and governance council members
  - Champion network: identify early adopters to drive adoption
  - Feedback mechanism: how users report issues and suggest improvements
- Develop training materials:
  - Dashboard user guides
  - Data entry standards and best practices
  - Data governance procedures
  - Data quality issue reporting process

### Phase 4: Validation and Delivery (Steps 13-16)

**Step 13: Validate Data Integration Outputs**
- Cross-validate all deliverables:
  - Architecture document reviewed by IT, OT, and business stakeholders
  - Master data model reviewed by data owners for each entity
  - Data quality report reviewed by system administrators and data stewards
  - Dashboard specifications reviewed by intended audience
- Verify technical feasibility:
  - Confirm connectivity to all source systems is possible
  - Verify API availability and documentation for enterprise systems
  - Confirm OPC-UA or historian access for process data
  - Validate technology platform compatibility

**Step 14: Finalize Data Governance Framework**
- Confirm data governance roles and secure organizational commitment:
  - Data Governance Council members confirmed
  - Data Owner assignments confirmed per entity
  - Data Steward assignments confirmed per system
- Publish data governance policies and procedures
- Establish the governance cadence:
  - Monthly data quality review meetings
  - Quarterly governance council meetings
  - Annual data governance maturity assessment

**Step 15: Produce Implementation Package**
- Compile all deliverables into a complete implementation package:
  - Data Integration Architecture document
  - Master Data Model workbook
  - Data Quality Report and remediation plan
  - Unified Dashboard Specification
  - Detailed ETL/API specifications (technical appendix)
  - Implementation project plan with resource and budget requirements
  - Change management and training plan
- Present to project leadership for approval and funding

**Step 16: Store and Distribute Outputs**
- Store all deliverables in the project document management system (via mcp-sharepoint)
- Distribute architecture document to IT, OT, and business leadership
- Distribute data quality report to data owners and stewards
- Distribute dashboard specifications to operations, maintenance, HSE, and management
- Configure document version control for ongoing updates
- Schedule the first quarterly data governance review

---
