---
name: audit-cybersecurity-posture
description: "Assess industrial cybersecurity posture using IEC 62443 and NIST CSF frameworks, covering OT network security, SCADA vulnerability analysis, and incident response readiness. Triggers: 'cybersecurity audit', 'OT security', 'auditoria de ciberseguridad'."
---

# Audit Cybersecurity Posture
## Skill ID: audit-cybersecurity-posture
## Version: 1.0.0
## Category: B - Analysis
## Priority: High

## Purpose

Performs comprehensive cybersecurity posture assessments for industrial Operational Readiness projects, evaluating OT (Operational Technology) and IT network security against IEC 62443 and NIST Cybersecurity Framework (CSF) standards. This skill covers SCADA/DCS vulnerability analysis, network segmentation review, access control evaluation, patch management assessment, incident response readiness, and security architecture validation for converged IT/OT environments.

Industrial cybersecurity has become a critical Operational Readiness concern as modern plants integrate IT enterprise systems (ERP, CMMS, MES) with OT control systems (DCS, SCADA, PLC, SIS). A single compromised PLC can halt production, a ransomware attack on the historian can blind operators, and a breach in the safety instrumented system can create life-threatening conditions. The 2021 Colonial Pipeline attack, the Triton/TRISIS malware targeting safety systems, and the increasing frequency of attacks on water treatment and power generation facilities demonstrate that OT cybersecurity is not theoretical -- it is an operational survival requirement.

This skill produces actionable audit findings with severity ratings, remediation roadmaps, and compliance gap analyses that enable project teams to achieve an acceptable cybersecurity posture before first production.

## CRITICAL SECURITY CONSTRAINTS

> **MANDATORY RULE: NEVER include the following in any deliverable, output, draft, or intermediate working document:**
> - IP addresses, MAC addresses, or network topology diagrams with specific addresses
> - SCADA/DCS/PLC firmware versions or model numbers tied to specific installations
> - Credentials, passwords, API keys, or authentication tokens
> - Specific vulnerability identifiers (CVE numbers) tied to identified installed systems
> - Network configuration files, firewall rule sets, or ACL contents
> - Physical security access codes or badge system configurations
> - Vendor remote access connection details or VPN configurations
>
> **All findings must be described in generic terms.** Instead of "PLC Siemens S7-1500 at 192.168.1.50 running firmware v2.8.3 is vulnerable to CVE-2019-13945", write "A critical PLC in the process control network is running outdated firmware with known vulnerabilities. Severity: Critical. Remediation: Apply vendor security patch per manufacturer advisory."
>
> **Classification:** All cybersecurity audit outputs are classified as **RESTRICTED** under the data governance framework. Distribution is limited to named recipients approved by the CISO or equivalent.

## Intent & Specification

The AI agent MUST understand the following core goals:

1. **IEC 62443 is the Primary OT Security Standard**: The assessment must evaluate compliance against IEC 62443 (Industrial Automation and Control Systems Security), including zone and conduit modeling, security level target assignment (SL-T), and maturity assessment against the foundational requirements (FR1-FR7: Identification and Authentication, Use Control, System Integrity, Data Confidentiality, Restricted Data Flow, Timely Response, Resource Availability).

2. **NIST CSF Provides the Governance Framework**: The National Institute of Standards and Technology Cybersecurity Framework (Identify, Protect, Detect, Respond, Recover) provides the overarching governance structure. The assessment maps findings to NIST CSF categories and subcategories for executive reporting.

3. **Purdue Model Guides Architecture Review**: The network architecture must be evaluated against the Purdue Enterprise Reference Architecture (ISA-95/IEC 62264), verifying proper segmentation between Level 0 (Physical Process), Level 1 (Basic Control), Level 2 (Area Supervisory), Level 3 (Site Operations), Level 3.5 (DMZ), and Levels 4-5 (Enterprise/Internet).

4. **Defense-in-Depth is the Design Principle**: The assessment verifies that multiple layers of security controls are implemented -- not relying on any single control. This includes network segmentation, access control, endpoint protection, monitoring, and physical security.

5. **Safety Systems Require Special Treatment**: Safety Instrumented Systems (SIS) and Emergency Shutdown Systems (ESD) must be assessed separately with enhanced scrutiny. Any connectivity between SIS and non-safety networks is a critical finding. SIS networks must be air-gapped or have formally justified, audited connections.

6. **Incident Response Readiness is Assessed**: The audit evaluates whether the organization can detect, contain, eradicate, and recover from a cybersecurity incident affecting OT systems. This includes detection capabilities, response procedures, communication protocols, backup and recovery, and drill/exercise history.

7. **Language**: Spanish (Latin American) by default. Security-specific terminology (e.g., CVE, SIS, DMZ, SCADA, DCS, PLC, firewall, IDS, SIEM) is retained in English per industry convention.

## Trigger / Invocation

```
/audit-cybersecurity-posture
```

### Natural Language Triggers
- "Perform a cybersecurity assessment of our OT network"
- "Audit the cybersecurity posture for the plant control systems"
- "Evaluate IEC 62443 compliance for the SCADA infrastructure"
- "Assess OT security readiness before commissioning"
- "Realizar auditoria de ciberseguridad de la red OT"
- "Evaluar postura de ciberseguridad para sistemas de control"
- "Verificar cumplimiento IEC 62443 de la infraestructura SCADA"

## Input Requirements

### Required Inputs
| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `system_inventory` | Inventory of IT/OT systems (types, quantities, general categories -- NO specific IPs or firmware) | .xlsx / .docx | Client IT/OT / Engineering |
| `network_architecture_description` | High-level description of network zones and interconnections (Purdue levels) | .docx / .pdf | Client IT/OT |
| `security_policies` | Existing cybersecurity policies, standards, and procedures | .docx / .pdf | Client IT Security |
| `industry_sector` | Mining, Oil & Gas, Chemicals, Power, Water | Text | User |
| `regulatory_context` | Applicable cybersecurity regulations and standards | .docx / text | Client Legal / Compliance |

### Optional Inputs (Highly Recommended)
| Input | Description | Default |
|-------|-------------|---------|
| `previous_audit_reports` | Previous cybersecurity assessments or penetration test reports (REDACTED) | None (baseline assessment assumed) |
| `incident_history` | Summary of past cybersecurity incidents (NO specific technical details in input) | No incidents reported |
| `access_control_policy` | Logical and physical access control policies | Assess against best practice |
| `backup_recovery_procedures` | Backup and disaster recovery documentation for OT systems | Flag as gap if missing |
| `vendor_remote_access_policy` | Policy for vendor remote access to OT systems | Assess against IEC 62443 |
| `patch_management_policy` | OT patch management policy and procedures | Assess against IEC 62443 |
| `training_records` | Cybersecurity awareness training records for OT personnel | Flag as gap if missing |
| `data_classification_framework` | Output from manage-data-governance skill | Generate minimum classification for security audit |

### Context Enrichment
The agent should automatically:
- Retrieve the latest NIST CSF version (v2.0) category and subcategory structure
- Reference IEC 62443 foundational requirements and security levels
- Pull industry-specific OT threat intelligence summaries (CISA ICS-CERT advisories -- generic, not site-specific)
- Identify applicable Chilean cybersecurity regulations (Ley Marco de Ciberseguridad 21.663)
- Reference Purdue Enterprise Reference Architecture for network segmentation validation

## Output Specification

### Document 1: Cybersecurity Posture Assessment Report (.docx)
**Filename**: `VSC_CyberPosture_{ProjectCode}_{Version}_{Date}.docx`

> **CLASSIFICATION: RESTRICTED** -- This document contains sensitive security assessment information. Distribution limited to authorized recipients only.

**Structure**:
1. **Cover Page** - VSC branding, RESTRICTED classification banner, project identification
2. **Document Control** - Revision history, distribution list (named recipients only), approval matrix
3. **Classification Notice** - Full restriction statement and handling instructions
4. **Table of Contents**
5. **Executive Summary** (2-3 pages)
   - Overall posture rating (Critical / High Risk / Moderate / Acceptable / Strong)
   - Key findings summary (top 10 by severity)
   - Compliance scorecard (IEC 62443, NIST CSF)
   - Immediate action items
6. **Assessment Scope & Methodology** (2-3 pages)
   - Systems assessed (by category, NOT by specific identifiers)
   - Standards applied (IEC 62443, NIST CSF, ISA-99)
   - Assessment methodology and limitations
   - Assumptions and exclusions
7. **Network Architecture Review** (4-5 pages)
   - 7.1 Purdue model compliance assessment
   - 7.2 Zone and conduit analysis (IEC 62443)
   - 7.3 Segmentation effectiveness
   - 7.4 DMZ design and implementation
   - 7.5 Remote access architecture
   - 7.6 Wireless network security
8. **IEC 62443 Compliance Assessment** (6-8 pages)
   - 8.1 FR1: Identification and Authentication Control
   - 8.2 FR2: Use Control
   - 8.3 FR3: System Integrity
   - 8.4 FR4: Data Confidentiality
   - 8.5 FR5: Restricted Data Flow
   - 8.6 FR6: Timely Response to Events
   - 8.7 FR7: Resource Availability
   - 8.8 Security Level assessment (SL-C vs. SL-T)
9. **NIST CSF Mapping** (4-5 pages)
   - 9.1 Identify (ID) -- Asset management, governance, risk assessment
   - 9.2 Protect (PR) -- Access control, training, data security, maintenance
   - 9.3 Detect (DE) -- Anomalies, continuous monitoring, detection processes
   - 9.4 Respond (RS) -- Response planning, communications, analysis, mitigation
   - 9.5 Recover (RC) -- Recovery planning, improvements, communications
10. **Safety System Security Assessment** (3-4 pages)
    - 10.1 SIS/ESD network isolation verification
    - 10.2 Safety controller access control
    - 10.3 Safety logic change management
    - 10.4 Safety system backup and recovery
11. **Vulnerability Analysis Summary** (3-4 pages)
    - 11.1 Critical findings (generic descriptions only)
    - 11.2 High-severity findings
    - 11.3 Medium-severity findings
    - 11.4 Low-severity and informational findings
12. **Incident Response Readiness** (3-4 pages)
    - 12.1 Detection capability assessment
    - 12.2 Response procedure evaluation
    - 12.3 Communication protocol review
    - 12.4 Backup and recovery capability
    - 12.5 Drill and exercise history
13. **Remediation Roadmap** (3-4 pages)
    - 13.1 Immediate actions (0-30 days)
    - 13.2 Short-term improvements (30-90 days)
    - 13.3 Medium-term enhancements (90-180 days)
    - 13.4 Long-term strategic initiatives (180+ days)
    - 13.5 Estimated resource requirements
14. **Appendices**
    - A: Detailed findings register (reference to .xlsx)
    - B: IEC 62443 compliance matrix
    - C: NIST CSF maturity scores
    - D: Remediation cost estimates (order of magnitude)

### Document 2: Findings Register (.xlsx)
**Filename**: `VSC_CyberFindings_{ProjectCode}_{Version}_{Date}.xlsx`

> **CLASSIFICATION: RESTRICTED**

**Sheets**:

#### Sheet 1: Findings Register
| Column | Description |
|--------|-------------|
| Finding_ID | Unique identifier (CYB-001) |
| Category | Network / Access Control / Patch Mgmt / Monitoring / Incident Response / Physical / Policy |
| Purdue_Level | Affected Purdue level (0-5 or Cross-level) |
| IEC_62443_FR | Applicable foundational requirement (FR1-FR7) |
| NIST_CSF_Category | Mapped NIST CSF category |
| Finding_Title | Short descriptive title (NO specific system identifiers) |
| Finding_Description | Detailed generic description of the finding |
| Severity | Critical / High / Medium / Low / Informational |
| Likelihood | Likely / Possible / Unlikely / Rare |
| Impact | Catastrophic / Major / Moderate / Minor / Insignificant |
| Risk_Score | Calculated risk score |
| Remediation_Action | Recommended remediation (generic terms) |
| Remediation_Priority | Immediate / Short-term / Medium-term / Long-term |
| Estimated_Effort | LOE estimate (person-days) |
| Status | Open / In Progress / Remediated / Accepted |
| Owner | Responsible role (NOT named individual in the register) |

#### Sheet 2: IEC 62443 Compliance Matrix
| Column | Description |
|--------|-------------|
| Requirement_ID | IEC 62443 requirement reference |
| Foundational_Requirement | FR1-FR7 |
| System_Requirement | Specific requirement description |
| Target_Security_Level | SL-T (1-4) |
| Current_Security_Level | SL-C (0-4) assessed |
| Gap | Difference (SL-T - SL-C) |
| Compliance_Status | Compliant / Partial / Non-Compliant / Not Assessed |
| Evidence | Description of evidence reviewed |
| Remediation_Required | Required actions to close gap |

#### Sheet 3: NIST CSF Maturity Scorecard
| Column | Description |
|--------|-------------|
| Function | Identify / Protect / Detect / Respond / Recover |
| Category | NIST CSF category |
| Subcategory | NIST CSF subcategory |
| Target_Tier | Target implementation tier (1-4) |
| Current_Tier | Current assessed tier (1-4) |
| Gap | Difference |
| Key_Finding | Reference to finding ID |
| Improvement_Action | Recommended action |

#### Sheet 4: Remediation Roadmap
| Column | Description |
|--------|-------------|
| Action_ID | Unique action identifier |
| Finding_ID | Linked finding |
| Action_Description | Remediation action description |
| Phase | Immediate / Short / Medium / Long |
| Estimated_Cost_Range | Order of magnitude cost range |
| Estimated_Duration | Implementation duration |
| Dependencies | Prerequisites |
| Owner_Role | Responsible role |
| Status | Not Started / In Progress / Complete |

## Procedure

### Step 1: Scope Definition and Information Gathering
- Define assessment scope (which Purdue levels, which zones, which systems by category)
- Collect and review existing security policies, procedures, and previous audit reports
- Identify applicable standards and regulatory requirements
- Establish the target security levels (SL-T) for each zone based on risk assessment
- **VERIFY:** No specific IPs, firmware versions, or credentials are captured in working documents

### Step 2: Architecture and Segmentation Assessment
- Evaluate network architecture against the Purdue model
- Assess zone and conduit definitions per IEC 62443
- Review network segmentation effectiveness and DMZ implementation
- Evaluate remote access mechanisms (VPN, jump servers, vendor access)
- Assess wireless network security in OT environments
- Review physical security controls for OT infrastructure

### Step 3: IEC 62443 and NIST CSF Compliance Evaluation
- Assess each IEC 62443 foundational requirement (FR1-FR7) against current implementations
- Determine current security levels (SL-C) per zone and compare to targets (SL-T)
- Map findings to NIST CSF functions, categories, and subcategories
- Evaluate safety system isolation and security controls separately
- Assess patch management, change management, and configuration management practices

### Step 4: Vulnerability Analysis and Incident Response Assessment
- Identify critical vulnerabilities by system category (generic descriptions only)
- Assess access control mechanisms (authentication, authorization, accounting)
- Evaluate monitoring and detection capabilities (SIEM, IDS/IPS, anomaly detection)
- Review incident response plans, procedures, communication protocols
- Assess backup and disaster recovery capabilities for OT systems
- Review cybersecurity training and awareness programs

### Step 5: Reporting and Remediation Planning
- Compile findings register with severity ratings and remediation recommendations
- Generate IEC 62443 compliance matrix with gap analysis
- Generate NIST CSF maturity scorecard
- Develop phased remediation roadmap with cost estimates
- Write executive summary with overall posture rating
- **FINAL CHECK:** Scan all outputs for any specific system identifiers, IPs, or credentials -- remove immediately if found

## Quality Criteria

| Criterion | Weight | Description | Target |
|-----------|--------|-------------|--------|
| Technical Accuracy | 30% | Findings are technically sound; IEC 62443 and NIST CSF mappings are correct; Purdue model assessment is accurate | >91% |
| Completeness | 25% | All Purdue levels assessed; all IEC 62443 FRs evaluated; NIST CSF fully mapped; no major domain gaps | >95% |
| Consistency | 15% | Severity ratings are calibrated consistently; IEC 62443 and NIST CSF findings are cross-referenced without contradiction | 100% |
| Format | 10% | RESTRICTED classification banners present; professional VSC branding; all tables properly formatted | >95% |
| Actionability | 10% | Remediation roadmap is implementable; actions are specific, prioritized, and resourced | >90% |
| Traceability | 10% | Every finding traces to a standard requirement; remediation actions link to specific findings | >90% |

### Security-Specific Quality Checks
- [ ] NO IP addresses, MAC addresses, or specific network addresses in any output
- [ ] NO firmware versions tied to specific installed systems
- [ ] NO credentials, passwords, or API keys anywhere in outputs
- [ ] NO specific CVE numbers tied to identified installed systems
- [ ] ALL outputs carry RESTRICTED classification banner
- [ ] Distribution list includes only named, authorized recipients
- [ ] Safety system findings are separated and highlighted

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents)
| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| `manage-data-governance` | Data classification framework | Provides classification levels that drive access control requirements |
| `plan-it-ot-convergence` | Integration architecture | Provides system interconnection design for segmentation review |
| `hse` | Safety system inventory | Provides SIS/ESD system information for safety security assessment |
| `asset-management` | OT asset inventory | Provides equipment categories and control system types |
| `orchestrator` | Project governance | Provides organizational context and security governance structure |

### Downstream Dependencies (Outputs TO other agents)
| Agent/Skill | Output Provided | Trigger |
|-------------|----------------|---------|
| `plan-it-ot-convergence` | Security requirements for integration design | Automatic -- security constraints for architecture |
| `manage-data-governance` | Access control requirements by data classification | Automatic -- refines governance controls |
| `hse` | Safety system cybersecurity requirements | Automatic -- for SIS integrity verification |
| `orchestrator` / `create-kpi-dashboard` | Cybersecurity KPIs and compliance scores | On request |
| `execution` | Pre-commissioning security checklist | On request -- for PSSR security verification |

### Collaboration During Execution
| Agent/Skill | Collaboration Type | When |
|-------------|-------------------|------|
| `hse` | Joint safety system security review | During SIS/ESD isolation assessment |
| `plan-it-ot-convergence` | Architecture validation | During network segmentation review |
| `manage-data-governance` | Classification verification | During access control assessment |
| `contracts-compliance` | Regulatory compliance mapping | During Chilean cybersecurity law assessment |

## References

### Primary Standards
| Standard | Application |
|----------|-------------|
| **IEC 62443 (series)** | Industrial Automation and Control Systems Security -- primary OT security standard |
| **NIST CSF v2.0** | Cybersecurity Framework -- governance and risk management structure |
| **ISA/IEC 62443-3-3** | System security requirements and security levels |
| **ISA/IEC 62443-2-1** | Security management system requirements for IACS |
| **NIST SP 800-82** | Guide to ICS Security -- supplementary OT security guidance |

### Safety System Standards
| Standard | Application |
|----------|-------------|
| **IEC 61511** | Functional safety -- SIS cybersecurity requirements |
| **IEC 61508** | Functional safety of electrical/electronic systems |
| **NIST SP 800-82 Rev 3** | SIS-specific cybersecurity guidance |

### Regulatory Framework (Chile)
| Regulation | Application |
|------------|-------------|
| **Ley 21.663** | Ley Marco de Ciberseguridad -- national cybersecurity framework |
| **DS 273** | Politica Nacional de Ciberseguridad |
| **NCh-ISO 27001** | Chilean adoption of ISO 27001 information security management |
| **Ley 19.628** | Proteccion de datos personales -- data breach notification |
| **DS 132** | Reglamento de Seguridad Minera -- control system safety requirements |

### Industry References
- CISA ICS-CERT advisories and best practices (generic)
- SANS ICS Security resources and GICSP certification framework
- Purdue Enterprise Reference Architecture (ISA-95 / IEC 62264)
- MITRE ATT&CK for ICS -- adversary tactics and techniques framework
- Dragos OT Cybersecurity Year in Review reports (trend data only)

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-02-25 | VSC IT/OT Agent | Initial version. Complete cybersecurity posture assessment with IEC 62443 compliance, NIST CSF mapping, safety system review, and RESTRICTED output classification. |
