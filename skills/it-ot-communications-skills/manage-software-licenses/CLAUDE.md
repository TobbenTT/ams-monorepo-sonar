---
name: manage-software-licenses
description: "Track and manage software license inventory, compliance audits, renewal schedules, cost optimization, and vendor licensing models for enterprise and industrial applications (SAP, Maximo, SCADA, Office 365, engineering tools) in OR projects. Triggers: 'software licenses', 'license management', 'licencias de software', 'gestion de licencias'."
---

# Manage Software Licenses
## Skill ID: manage-software-licenses
## Version: 1.0.0
## Category: C - Tracking
## Priority: Medium

## Purpose

Manages the complete lifecycle of software licenses for Operational Readiness projects in mining, oil & gas, chemicals, and energy sectors, covering license inventory, compliance auditing, renewal tracking, cost optimization, vendor relationship management, and licensing model analysis. Industrial facilities typically operate dozens of enterprise and specialized software platforms -- ERP (SAP S/4HANA, Oracle), CMMS (SAP PM, IBM Maximo, Infor EAM), SCADA/HMI (Honeywell, ABB, Siemens, Wonderware), engineering tools (AutoCAD, AVEVA, SmartPlant), document management (SharePoint, Aconex), business intelligence (Power BI, Tableau), and productivity suites (Microsoft 365, Google Workspace) -- each with different licensing models, compliance requirements, and cost structures.

Software license management is a significant operational risk and cost driver for OR programs. Under-licensing creates legal and audit risk. Over-licensing wastes budget. License compliance failures during vendor audits result in penalties that can reach millions of dollars. Misunderstanding licensing models (named user vs. concurrent, on-premise vs. cloud, production vs. development) leads to either overspend or non-compliance. During the transition from construction to operations, license requirements change dramatically as EPC contractor licenses expire and operational licenses must be procured, configured, and deployed.

This skill ensures that every software platform required for operations has the correct license type and quantity, that renewals are tracked and negotiated proactively, that compliance is maintained through regular audits, and that licensing costs are optimized through model analysis and vendor negotiation preparation.

**CRITICAL SECURITY CONSTRAINT:** This skill NEVER exposes license keys, activation codes, server hostnames, or authentication credentials in any output document. All license references use vendor contract numbers and internal asset IDs only.

## Intent & Specification

The AI agent MUST understand the following core goals:

1. **Complete License Inventory Is Foundational**: Every software product in the operational technology stack must be inventoried with vendor, product, version, license type, quantity, expiration date, and cost. The inventory must cover IT applications, OT platforms, engineering tools, and productivity software.

2. **Licensing Models Must Be Understood**: Each vendor has different licensing models (perpetual vs. subscription, named user vs. concurrent, on-premise vs. cloud, per-device vs. per-server). The agent must document the licensing model for each product and validate that the current license type matches the operational usage pattern.

3. **Compliance Is Non-Negotiable**: License compliance must be maintained at all times. The agent tracks installed licenses vs. entitled licenses and flags any non-compliance. SAP licensing is particularly complex and high-risk, requiring careful tracking of named users, engine users, functional area access, and indirect/digital access.

4. **Renewal Management Is Proactive**: License renewals must be tracked with sufficient lead time (minimum 90 days for standard software, 180 days for enterprise platforms like SAP). The agent generates renewal alerts, prepares negotiation briefings, and tracks renewal status.

5. **Cost Optimization Is Continuous**: The agent analyzes license utilization, identifies unused or underutilized licenses, recommends license type changes (e.g., named to concurrent where usage is intermittent), and prepares cost optimization recommendations for vendor negotiations.

6. **EPC-to-Operations Transition Is Critical**: During OR projects, software licenses transition from EPC contractor responsibility to client operations. The agent tracks which licenses are EPC-provided (and will expire), which are client-owned, and which need to be procured for operations.

7. **Language**: Spanish (Latin American) by default. Vendor contracts and license agreements are typically in English and referenced as-is.

## Trigger / Invocation

```
/manage-software-licenses
```

### Natural Language Triggers
- "Generate the software license inventory for the project"
- "Which licenses are expiring in the next 90 days?"
- "Audit SAP license compliance for the operations team"
- "Optimize software licensing costs for the facility"
- "Track the EPC-to-operations license transition"
- "Genera el inventario de licencias de software del proyecto"
- "Cuales licencias vencen en los proximos 90 dias?"
- "Audita el cumplimiento de licencias SAP para el equipo de operaciones"
- "Optimiza los costos de licenciamiento de software de la planta"
- "Monitorea la transicion de licencias de EPC a operaciones"

## Input Requirements

### Required Inputs
| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `project_context` | Project name, phase, facility type, operational scope | Text / .docx | Orchestrator |
| `software_inventory` | List of all software in use or planned (product, vendor, version) | .xlsx / Table | Client IT / OT team |
| `license_agreements` | Current license agreement summaries (type, quantity, term, cost) | .xlsx / PDF | Client Procurement / IT |
| `user_count_by_role` | Number of users by role/department for license sizing | .xlsx / Table | Client HR / IT |
| `operational_requirements` | Software required for operations (systems list from commissioning) | .xlsx / Table | Execution / Operations agent |

### Optional Inputs (Highly Recommended)
| Input | Description | Default |
|-------|-------------|---------|
| `epc_license_register` | Licenses currently provided by EPC contractor | Request from EPC IT |
| `sap_user_matrix` | SAP user roles, authorization objects, and access types | Request from SAP team |
| `usage_analytics` | Actual software usage data (logins, sessions, feature usage) | Request from IT monitoring |
| `vendor_price_lists` | Current vendor pricing for license renewals or new procurement | Request from procurement |
| `budget_constraints` | IT/OT software budget for operations | Request from finance |
| `cloud_subscription_details` | Cloud service subscriptions (Azure, AWS, SaaS) | Request from IT |
| `historical_audit_results` | Previous vendor audit results and findings | Request from IT compliance |
| `maintenance_agreement_details` | Software maintenance/support agreement terms | Request from procurement |

### Context Enrichment
The agent should automatically:
- Reference the IT/OT convergence plan for technology stack decisions
- Pull system inventory from monitor-system-integration skill
- Retrieve data governance requirements from manage-data-governance skill
- Check the project schedule for go-live dates affecting license activation timing
- Identify cybersecurity implications from audit-cybersecurity-posture skill
- Reference industry benchmarks for license cost per user/per device ratios

## Output Specification

### Output 1: Software License Inventory and Compliance Report (.docx)
**Filename**: `VSC_LicenseReport_{ProjectCode}_{Version}_{Date}.docx`

**Structure**:
1. **Executive Summary** (1 page)
   - Total license portfolio value and count
   - Compliance status (compliant / at risk / non-compliant)
   - Key renewal dates in next 180 days
   - Cost optimization opportunities identified
   - Critical actions required

2. **License Inventory Summary** (2-3 pages)
   - Software portfolio by category (ERP, CMMS, SCADA, Engineering, Productivity, Other)
   - License count by type (perpetual, subscription, concurrent, named)
   - License ownership (client-owned, EPC-provided, vendor-hosted)
   - Total annualized cost by category

3. **Compliance Audit Results** (2-3 pages)
   - Compliance status by product (compliant, over-licensed, under-licensed)
   - Installed vs. entitled license counts
   - SAP-specific compliance analysis (user types, indirect access, engine sizing)
   - Maximo-specific compliance analysis (authorized users, concurrent sessions)
   - Risk assessment for non-compliant products (audit penalty exposure)

4. **EPC-to-Operations Transition Plan** (2-3 pages)
   - Licenses transitioning from EPC to client operations
   - EPC license expiration dates and handover requirements
   - New licenses required for operations (not covered by EPC)
   - Procurement timeline for operational licenses
   - Budget requirements for transition

5. **Renewal Schedule** (1-2 pages)
   - 12-month renewal calendar
   - Renewal lead time requirements
   - Negotiation preparation recommendations
   - Budget forecast for renewals

6. **Cost Optimization Analysis** (2-3 pages)
   - Utilization analysis by product (active users vs. licensed users)
   - License type optimization opportunities (named to concurrent, etc.)
   - Consolidation opportunities (overlapping functionality)
   - Cloud migration cost-benefit analysis
   - Estimated savings by optimization action

7. **Risk Register** (1-2 pages)
   - License compliance risks with probability and impact
   - Vendor audit exposure assessment
   - Single-vendor dependency risks
   - End-of-life / end-of-support product risks

8. **Recommendations** (1-2 pages)
   - Prioritized action items with timeline
   - Budget requirements
   - Responsible parties
   - Expected outcomes

### Output 2: License Tracking Workbook (.xlsx schema)
**Filename**: `VSC_License_Tracker_{ProjectCode}_{Version}_{Date}.xlsx`

**Sheets**:

#### Sheet 1: License Inventory
| Column | Description |
|--------|-------------|
| License_ID | Internal tracking identifier |
| Vendor | Software vendor name |
| Product | Product name and version |
| Category | ERP / CMMS / SCADA / Engineering / Productivity / Other |
| License_Type | Perpetual / Subscription / Concurrent / Named / Per-Device / Per-Server |
| Quantity_Entitled | Number of licenses purchased/entitled |
| Quantity_Deployed | Number of licenses installed/deployed |
| Quantity_Active | Number of licenses actively used |
| Compliance_Status | Compliant / Over-Licensed / Under-Licensed |
| Contract_Ref | Vendor contract reference number (NO license keys) |
| Start_Date | License start date |
| Expiry_Date | License expiration date |
| Renewal_Alert_Date | Date to initiate renewal (expiry minus lead time) |
| Annual_Cost_USD | Annual license cost in USD |
| Owner | Client / EPC / Vendor-hosted |
| Support_Level | Premium / Standard / Community / None |
| Support_Expiry | Maintenance/support agreement expiration |
| Notes | Additional tracking notes |

#### Sheet 2: SAP License Detail
| Column | Description |
|--------|-------------|
| SAP_License_Type | Professional / Limited Professional / Developer / Test / etc. |
| Module | FI / CO / MM / PM / PP / QM / HR / BW / etc. |
| Named_Users | Number of named user licenses |
| Active_Users | Number of actually active users |
| Engine_Metrics | SAP engine-based metrics (if applicable) |
| Indirect_Access_Risk | Y/N -- risk of indirect/digital access licensing |
| Annual_Cost_USD | Cost for this license component |
| Optimization_Notes | Recommendations for SAP license optimization |

#### Sheet 3: Renewal Calendar
| Column | Description |
|--------|-------------|
| License_ID | Reference to license inventory |
| Vendor | Vendor name |
| Product | Product name |
| Expiry_Date | Current license expiration |
| Renewal_Lead_Time_Days | Required lead time for renewal |
| Alert_Date | Date to trigger renewal process |
| Renewal_Status | Not Started / In Progress / Renewed / Cancelled |
| Renewal_Cost_Estimate | Estimated renewal cost |
| Negotiation_Notes | Negotiation strategy or leverage points |
| Responsible | Person/team responsible for renewal |

#### Sheet 4: Cost Optimization
| Column | Description |
|--------|-------------|
| Optimization_ID | Tracking identifier |
| Product | Affected product |
| Current_License_Type | Current licensing model |
| Proposed_License_Type | Recommended licensing model |
| Current_Annual_Cost | Current annual cost |
| Projected_Annual_Cost | Cost after optimization |
| Annual_Savings | Projected annual savings |
| Implementation_Effort | Low / Medium / High |
| Risk_Level | Low / Medium / High |
| Status | Identified / Approved / Implemented / Rejected |
| Notes | Implementation details or constraints |

#### Sheet 5: EPC Transition Tracker
| Column | Description |
|--------|-------------|
| License_ID | Reference to license inventory |
| Product | Software product |
| EPC_License_Expiry | When EPC license expires |
| Client_License_Required | Y/N |
| Client_License_Procured | Y/N |
| Procurement_Status | Not Started / RFQ Issued / PO Issued / Delivered / Activated |
| Go_Live_Date | Required activation date |
| Gap_Risk | Y/N -- risk of gap between EPC expiry and client activation |
| Budget_Approved | Y/N |
| Notes | Transition details |

## Procedure

### Step 1: Software Inventory and License Discovery
- Compile complete inventory of all software in the operational technology stack
- Collect license agreement details from procurement, IT, and vendor contracts
- Identify EPC-provided licenses and their expiration dates
- Map software products to operational functions and user groups
- Categorize licenses by type (perpetual, subscription, concurrent, named, etc.)
- Document licensing model specifics for complex platforms (SAP, Maximo, SCADA)
- **SECURITY:** Record contract references only -- NEVER record license keys or activation codes

### Step 2: Compliance Audit and Gap Analysis
- Compare entitled licenses (purchased) against deployed licenses (installed)
- Compare deployed licenses against active users (actually using the software)
- Perform SAP-specific compliance analysis (user types, indirect access, engine metrics)
- Perform CMMS-specific compliance analysis (Maximo, Infor EAM authorized users)
- Identify under-licensed products (non-compliance risk) and over-licensed products (cost waste)
- Calculate audit penalty exposure for non-compliant products
- Generate compliance status report with remediation recommendations

### Step 3: Renewal Management and Vendor Preparation
- Build 12-month renewal calendar from license expiration dates
- Set alert dates based on required lead times (90 days standard, 180 days enterprise)
- Analyze renewal costs against budget constraints
- Identify negotiation leverage points (utilization data, competitive alternatives, multi-year deals)
- Prepare renewal briefing documents for procurement team
- Track renewal progress from initiation through completion

### Step 4: Cost Optimization Analysis
- Analyze utilization rates (active users / entitled licenses) for each product
- Identify unused licenses suitable for reallocation or cancellation
- Evaluate license type optimization (e.g., named to concurrent for intermittent users)
- Assess cloud migration cost-benefit for on-premise software
- Identify consolidation opportunities (products with overlapping functionality)
- Calculate potential savings for each optimization recommendation
- Prioritize recommendations by savings potential and implementation feasibility

### Step 5: Reporting and Transition Management
- Generate the comprehensive License Inventory and Compliance Report
- Produce the License Tracking Workbook with all sheets populated
- Manage the EPC-to-operations license transition tracker
- Update the Orchestrator with license readiness status for gate reviews
- Schedule periodic compliance re-audits (quarterly recommended)
- Feed cost optimization findings into operational budget planning

## Quality Criteria

| Criterion | Weight | Description | Target |
|-----------|--------|-------------|--------|
| Technical Accuracy | 30% | License counts match vendor records; compliance assessments are correct; cost calculations verified | >91% |
| Completeness | 25% | All software products inventoried; all license types documented; all renewals tracked; EPC transition covered | >91% |
| Consistency | 15% | License categorization is uniform; compliance definitions are consistent; cost calculations use same methodology | >91% |
| Format | 10% | Report is clear and actionable; tracking sheets follow standard schema; renewal calendar is scannable | >91% |
| Actionability | 10% | Compliance gaps have remediation plans; renewals have negotiation guidance; optimizations have implementation steps | >91% |
| Traceability | 10% | License data traces to vendor contracts; compliance assessments reference entitlement documents; costs trace to invoices | >91% |

### Security-Specific Quality Checks
- [ ] NO license keys, activation codes, or serial numbers appear in any output
- [ ] NO server hostnames, IP addresses, or authentication credentials exposed
- [ ] All licenses referenced by internal ID and vendor contract number only
- [ ] SAP system IDs (SIDs) are referenced abstractly if needed
- [ ] Vendor portal credentials are NEVER documented in tracking workbooks

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents)
| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| `monitor-system-integration` | System inventory | Provides complete list of systems requiring license tracking |
| `plan-it-ot-convergence` | Technology stack decisions | Provides planned technology platforms affecting license requirements |
| `execution` | Go-live schedule | Provides activation timing requirements for operational licenses |
| `asset-management` / `design-sap-pm-blueprint` | SAP PM/MM configuration | Provides SAP user role and access requirements for license sizing |
| `contracts-compliance` | Vendor contracts | Provides contract terms and procurement procedures for license acquisition |
| `orchestrator` | Budget constraints | Provides IT/OT operational budget framework |

### Downstream Dependencies (Outputs TO other agents)
| Agent/Skill | Output Provided | Trigger |
|-------------|----------------|---------|
| `orchestrator` | License readiness status for gate reviews | On request |
| `execution` | License activation timeline for commissioning | On request |
| `contracts-compliance` | Renewal negotiation requirements | When renewals approach alert dates |
| `audit-cybersecurity-posture` | Software inventory for vulnerability assessment | On request |
| `manage-document-systems` | License documentation filed in DMS | Automatic |

### Collaboration During Execution
| Agent/Skill | Collaboration Type | When |
|-------------|-------------------|------|
| `contracts-compliance` | License procurement coordination | During EPC-to-operations transition |
| `asset-management` | SAP license sizing validation | During SAP compliance audit |
| `monitor-system-integration` | System inventory reconciliation | During initial license discovery |
| `plan-it-ot-convergence` | Technology stack alignment | When license decisions affect architecture |

## References

### Primary Standards
| Standard | Application |
|----------|-------------|
| **ISO/IEC 19770-1** | IT asset management -- software license management framework |
| **ISO/IEC 19770-2** | Software identification tag standard |
| **ISO/IEC 19770-3** | Software entitlement schema |
| **ITIL v4** | IT service management -- software asset management practices |
| **SAM (Software Asset Management)** | Industry framework for license lifecycle management |

### Vendor-Specific References
- SAP Licensing Guide -- Named User types, engine licensing, indirect access rules
- IBM Maximo Licensing -- Authorized User, Concurrent User, Application Point licensing
- Microsoft Licensing Guide -- M365, Azure, hybrid use benefits
- Oracle Licensing Policies -- Processor-based, Named User Plus, cloud licensing
- Siemens/AVEVA Licensing -- SCADA, historian, and engineering tool licensing models

### Industry References
- Gartner Software Asset Management Market Guide
- ITAM (IT Asset Management) Forum best practices
- Flexera State of IT Visibility Report -- license compliance benchmarks
- Snow Software License Management Reference Architecture
- VSC OR Knowledge Base v2.0 (`docs/architecture/_legacy/knowledge-base.md`)

### Regulatory Context
| Regulation | Application |
|------------|-------------|
| **Ley 17.336 (Chile)** | Propiedad Intelectual -- software copyright compliance |
| **BSA (Business Software Alliance)** | Software piracy enforcement and audit rights |
| **EU GDPR / Ley 19.628 (Chile)** | Data protection implications of cloud-hosted software licensing |

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-02-25 | VSC IT/OT Agent | Initial version. Complete software license management skill covering inventory, compliance audit, renewal tracking, cost optimization, SAP/Maximo licensing specifics, and EPC-to-operations transition management. |
