---
name: manage-document-systems
description: "Design and manage document management systems including naming conventions, folder structures, access control, version control, lifecycle policies, and retention schedules for OR projects. Triggers: 'document management', 'DMS design', 'gestion documental'."
---

# Manage Document Systems
## Skill ID: manage-document-systems
## Version: 1.0.0
## Category: D - Planning
## Priority: Medium

## Purpose

Designs and manages Document Management Systems (DMS) for industrial Operational Readiness projects, covering system architecture, naming conventions, folder structures, access control matrices, version control workflows, document lifecycle management, retention policies, and metadata schemas. This skill ensures that every document produced during the OR program -- from engineering drawings and vendor manuals to operating procedures and training materials -- is systematically organized, securely stored, properly versioned, and retrievable throughout the asset lifecycle.

In capital projects involving hundreds of EPC deliverables, thousands of vendor documents, and dozens of operational procedures, document management is the difference between a smooth handover and operational chaos. During commissioning, a missing vendor manual delays equipment startup. During ramp-up, an outdated operating procedure causes a safety incident. During steady-state operations, an expired calibration certificate triggers a regulatory non-compliance finding. This skill establishes the document management infrastructure that prevents these scenarios by ensuring the right document, in the right version, is available to the right person at the right time.

The document management framework provides foundational infrastructure for the Orchestrator agent's document_register entity and integrates with the data governance framework, cybersecurity posture requirements, and all agents that produce or consume project documentation.

## Intent & Specification

The AI agent MUST understand the following core goals:

1. **Naming Conventions Must Be Systematic and Enforceable**: Every document must follow a structured naming convention that encodes project, originator, discipline, document type, sequence number, and revision. The convention must be parseable by automated systems and human-readable. No ad-hoc naming permitted once the convention is established.

2. **Folder Structure Reflects the Asset Lifecycle**: The folder hierarchy must support the full asset lifecycle from project execution (FEED, detailed engineering, procurement, construction) through operations (commissioning, ramp-up, steady-state, shutdown). Engineering-centric structures (by discipline) must coexist with operations-centric structures (by area/system/equipment).

3. **Access Control is Role-Based and Granular**: Document access must be controlled based on user roles, project phases, and document classification. Read/write/approve permissions must be defined at the folder and document-type level. Sensitive documents (safety cases, cybersecurity audits, commercial contracts) require restricted access.

4. **Version Control Prevents Confusion**: The version control workflow must ensure that only one version of a document is current at any time (single source of truth). Draft, review, approved, superseded, and obsolete statuses must be tracked. Concurrent editing conflicts must be prevented through check-in/check-out or similar mechanisms.

5. **Document Lifecycle is Actively Managed**: Documents progress through defined lifecycle stages (Draft, In Review, Approved, Issued for Construction/Use, As-Built, Superseded, Archived, Destroyed). Each transition has defined triggers, approvers, and notification rules.

6. **Retention Policies Meet Regulatory Requirements**: Document retention periods must comply with Chilean regulations (Codigo del Trabajo, DS 132 for mining, DS 594 for workplace safety) and industry standards. Legal hold capabilities must be defined for litigation scenarios.

7. **Language**: Spanish (Latin American) by default. Document management terminology is used in both Spanish and English where DMS platforms require English metadata.

## Trigger / Invocation

```
/manage-document-systems
```

### Natural Language Triggers
- "Design a document management system for the project"
- "Create naming conventions and folder structure for project documents"
- "Set up document control procedures for the OR program"
- "Define document lifecycle and retention policies"
- "Disenar sistema de gestion documental para el proyecto"
- "Crear convenciones de nomenclatura y estructura de carpetas"
- "Establecer procedimientos de control documental para la operacion"

## Input Requirements

### Required Inputs
| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `project_context` | Project name, phase, location, and scope | Text / .docx | Orchestrator / User |
| `document_types_inventory` | Types of documents expected (drawings, procedures, manuals, reports, permits) | .xlsx / text | Project Team |
| `organizational_structure` | Departments, roles, and access requirements | .xlsx / .docx | Client HR |
| `dms_platform` | Target DMS platform (SharePoint, Aconex, Procore, Documentum, custom) | Text | Client IT |
| `industry_sector` | Mining, Oil & Gas, Chemicals, Power, Water | Text | User |

### Optional Inputs (Highly Recommended)
| Input | Description | Default |
|-------|-------------|---------|
| `existing_naming_convention` | Client's current document naming standard | VSC standard convention |
| `epc_document_register` | EPC contractor's document transmittal register | Request as RFI |
| `vendor_document_requirements` | Vendor document submittal requirements per contract | Generate from procurement scope |
| `regulatory_retention_requirements` | Regulatory document retention obligations | Chilean regulatory defaults |
| `data_classification_framework` | Output from manage-data-governance skill | Map classification to access control |
| `existing_folder_structure` | Current DMS structure (brownfield) | Design from scratch |
| `document_volume_estimate` | Expected document count by type and phase | Industry benchmarks |
| `integration_requirements` | DMS integration with ERP, CMMS, or other systems | Standalone with export capability |

### Context Enrichment
The agent should automatically:
- Retrieve standard engineering document types per ISO 81346 and industry conventions
- Reference ISO 19650 (BIM document management) if applicable to the project
- Pull Chilean regulatory document retention requirements (DS 132, Codigo del Trabajo Art. 508)
- Identify DMS platform-specific capabilities and constraints for the target platform
- Reference ISO 15489 (Records Management) for lifecycle management best practices

## Output Specification

### Document 1: Document Management Plan (.docx)
**Filename**: `VSC_DocManagement_{ProjectCode}_{Version}_{Date}.docx`

**Structure**:
1. **Cover Page** - VSC branding, project identification
2. **Document Control** - Revision history, approval matrix
3. **Table of Contents**
4. **Executive Summary** (1-2 pages)
   - DMS objectives and scope
   - Selected platform and architecture
   - Key policies and procedures summary
5. **Introduction & Scope** (1-2 pages)
   - Project phases covered
   - Document types in scope
   - Applicable standards and regulations
6. **Document Naming Convention** (4-5 pages)
   - 6.1 Naming structure and field definitions
   - 6.2 Field codes and valid values (originator, discipline, document type, area)
   - 6.3 Revision numbering scheme
   - 6.4 Naming convention examples by document type
   - 6.5 Non-conformance handling for incorrectly named documents
7. **Folder Structure** (3-4 pages)
   - 7.1 Top-level hierarchy design
   - 7.2 Project execution folders (by discipline, phase)
   - 7.3 Operations folders (by area, system, equipment)
   - 7.4 Cross-cutting folders (regulatory, HSE, commercial)
   - 7.5 Archive and historical structure
   - 7.6 Folder naming rules
8. **Metadata Schema** (3-4 pages)
   - 8.1 Mandatory metadata fields
   - 8.2 Optional metadata fields
   - 8.3 Controlled vocabulary lists
   - 8.4 Metadata quality rules and validation
   - 8.5 Search and retrieval optimization
9. **Access Control** (3-4 pages)
   - 9.1 Role-based access control matrix
   - 9.2 Permission levels (Read, Edit, Approve, Admin)
   - 9.3 Restricted document handling
   - 9.4 External party access (vendors, regulators, auditors)
   - 9.5 Access review and recertification schedule
10. **Version Control** (2-3 pages)
    - 10.1 Version numbering (Draft: 0.1, 0.2; Approved: 1.0, 2.0)
    - 10.2 Check-in/check-out workflow
    - 10.3 Review and approval workflow
    - 10.4 Concurrent editing rules
    - 10.5 Version comparison and audit trail
11. **Document Lifecycle** (3-4 pages)
    - 11.1 Lifecycle stages and transitions
    - 11.2 Document status codes and definitions
    - 11.3 Review cycles and triggers
    - 11.4 Supersession and obsolescence procedures
    - 11.5 Handover procedures (project to operations)
12. **Retention and Disposal** (2-3 pages)
    - 12.1 Retention schedule by document type
    - 12.2 Regulatory retention requirements
    - 12.3 Legal hold procedures
    - 12.4 Secure disposal procedures
    - 12.5 Archive format and media requirements
13. **Implementation Plan** (2-3 pages)
    - 13.1 DMS platform configuration steps
    - 13.2 Migration plan (brownfield)
    - 13.3 User training program
    - 13.4 Go-live checklist
    - 13.5 Post-implementation support
14. **Appendices**
    - A: Complete naming convention code tables
    - B: Folder structure diagram (full tree)
    - C: Metadata schema detail (reference to .xlsx)
    - D: Regulatory retention requirements register

### Document 2: DMS Configuration Workbook (.xlsx)
**Filename**: `VSC_DMS_Config_{ProjectCode}_{Version}_{Date}.xlsx`

**Sheets**:

#### Sheet 1: Naming Convention Codes
| Column | Description |
|--------|-------------|
| Field_Position | Position in naming string (1, 2, 3, ...) |
| Field_Name | Field name (Project, Originator, Discipline, Type, Area, Sequence, Revision) |
| Separator | Character separating this field from the next |
| Code | Valid code value |
| Description | Code meaning |
| Example | Example usage |

#### Sheet 2: Folder Structure
| Column | Description |
|--------|-------------|
| Level_1 | Top-level folder |
| Level_2 | Second-level folder |
| Level_3 | Third-level folder |
| Level_4 | Fourth-level folder (if applicable) |
| Description | Folder purpose |
| Access_Group | Default access group |
| Owner | Folder owner role |
| Lifecycle_Phase | Project phase(s) this folder is active |

#### Sheet 3: Metadata Schema
| Column | Description |
|--------|-------------|
| Field_Name | Metadata field name |
| Display_Label | User-visible label |
| Data_Type | Text / Date / Enum / Number / Lookup |
| Required | Mandatory / Optional / Conditional |
| Valid_Values | Controlled vocabulary or validation rule |
| Searchable | Yes / No |
| DMS_Column_Mapping | Platform-specific column mapping |
| Source | Auto-populated / Manual / Inherited |

#### Sheet 4: Access Control Matrix
| Column | Description |
|--------|-------------|
| Role | User role or group |
| Folder_or_DocType | Folder path or document type |
| Read | Y / N |
| Edit | Y / N |
| Approve | Y / N |
| Delete | Y / N |
| Admin | Y / N |
| Notes | Special conditions or restrictions |

#### Sheet 5: Retention Schedule
| Column | Description |
|--------|-------------|
| Document_Type | Type of document |
| Retention_Period | Retention duration (years) |
| Regulatory_Basis | Regulation requiring retention |
| Trigger_Event | Event starting retention clock (creation, approval, project closure) |
| Archive_Format | Required archive format (PDF/A, native, both) |
| Disposal_Method | Approved disposal method |
| Legal_Hold_Eligible | Y / N |

#### Sheet 6: Document Register Template
| Column | Description |
|--------|-------------|
| Document_ID | Unique document identifier (per naming convention) |
| Title | Document title |
| Type | Document type code |
| Discipline | Engineering discipline |
| Originator | Creating organization |
| Current_Revision | Latest revision number |
| Status | Draft / In Review / Approved / IFC / As-Built / Superseded / Archived |
| Classification | Public / Internal / Confidential / Restricted |
| Area | Plant area |
| System | System reference |
| Equipment_Tag | Related equipment (if applicable) |
| Approval_Date | Date of latest approval |
| Next_Review_Date | Scheduled review date |
| Owner | Document owner role |

## Procedure

### Step 1: Requirements Gathering and Platform Assessment
- Inventory all document types expected across project and operations phases
- Assess the selected DMS platform capabilities and constraints
- Collect existing naming conventions, standards, and folder structures (brownfield)
- Identify regulatory retention requirements for the project jurisdiction and sector
- Gather access control requirements from organizational structure and data classification

### Step 2: Naming Convention and Folder Structure Design
- Design systematic naming convention with coded fields for project, originator, discipline, type, area, sequence, and revision
- Develop folder hierarchy supporting both project execution and operations phases
- Define folder naming rules and maximum path length constraints
- Create comprehensive code tables for all naming convention fields
- Validate convention against DMS platform character limitations and reserved characters

### Step 3: Metadata Schema and Access Control Design
- Define mandatory and optional metadata fields for each document type
- Create controlled vocabulary lists for enumerated fields
- Design role-based access control matrix mapping roles to permissions by folder and document type
- Define restricted document handling procedures aligned with data governance classification
- Specify external party access rules for vendors, regulators, and auditors

### Step 4: Lifecycle and Retention Policy Definition
- Define lifecycle stages with transition triggers, approvers, and notification rules
- Design version control workflow with check-in/check-out and review cycles
- Establish retention schedule per document type aligned with regulatory requirements
- Define archive format requirements (PDF/A for long-term preservation)
- Design legal hold procedures and secure disposal methods

### Step 5: Documentation and Configuration
- Generate the Document Management Plan (.docx) with all sections
- Generate the DMS Configuration Workbook (.xlsx) with all sheets populated
- Create the document register template for the Orchestrator agent
- Validate all configurations against DMS platform capabilities
- Develop implementation plan with migration strategy, training, and go-live checklist

## Quality Criteria

| Criterion | Weight | Description | Target |
|-----------|--------|-------------|--------|
| Technical Accuracy | 30% | Naming convention is parseable and unambiguous; folder structure supports full lifecycle; metadata schema is complete | >91% |
| Completeness | 25% | All document types covered; all roles have access definitions; all regulatory retention requirements addressed | >95% |
| Consistency | 15% | Naming codes are unique and non-overlapping; access control is consistent with data governance classification | 100% |
| Format | 10% | Professional VSC branding; code tables are clear; folder structure diagrams are readable | >95% |
| Actionability | 10% | DMS can be configured directly from the workbook; naming convention can be enforced programmatically | >90% |
| Traceability | 10% | Retention periods trace to regulations; access controls trace to classification framework; all decisions are justified | >90% |

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents)
| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| `manage-data-governance` | Data classification framework | Provides classification levels that drive document access control |
| `orchestrator` | Project governance | Provides project structure, phases, and organizational context |
| `contracts-compliance` | Regulatory requirements | Provides regulatory retention obligations and compliance standards |
| `contracts-compliance` / `manage-vendor-documentation` | Vendor document requirements | Provides vendor document submittal register and acceptance criteria |
| `execution` | EPC deliverables register | Provides construction document types and transmittal requirements |
| `hse` | Safety document requirements | Identifies safety-critical documents requiring special handling |

### Downstream Dependencies (Outputs TO other agents)
| Agent/Skill | Output Provided | Trigger |
|-------------|----------------|---------|
| `orchestrator` | Document register entity (document_register) | Automatic -- provides the document register framework |
| `orchestrator` / `create-weekly-report` | Document status summary for reporting | On request |
| `contracts-compliance` / `track-document-currency` | Document lifecycle and review schedule | Automatic -- feeds document currency tracking |
| All agents | Naming convention and folder structure | Broadcast -- all agents follow when creating documents |
| `create-internal-communications` | Communication document templates and storage | On request |

### Collaboration During Execution
| Agent/Skill | Collaboration Type | When |
|-------------|-------------------|------|
| `orchestrator` | Alignment on document register schema | During metadata schema design |
| `contracts-compliance` | Joint retention policy development | During retention schedule definition |
| `manage-data-governance` | Classification-to-access mapping | During access control design |
| `execution` | EPC handover document structure | During folder structure design for handover |

## References

### Primary Standards
| Standard | Application |
|----------|-------------|
| **ISO 15489** | Records management -- principles and processes for document lifecycle management |
| **ISO 19650** | BIM information management -- document management in BIM environments |
| **ISO 81346** | Industrial systems -- structuring principles and reference designations |
| **ISO 82045** | Document management -- document metadata and classification |
| **ISO 14641** | Electronic archiving -- trustworthiness of electronic records |

### Regulatory Framework (Chile)
| Regulation | Application |
|------------|-------------|
| **Codigo del Trabajo Art. 508** | Employment document retention (5 years minimum) |
| **DS 132** | Reglamento de Seguridad Minera -- mine safety document retention |
| **DS 594** | Workplace safety documentation requirements |
| **Ley 19.799** | Documentos electronicos y firma electronica |
| **Ley 19.300 / DS 40** | Environmental documentation and reporting retention |

### Industry References
- ACONEX Document Management Best Practices for Capital Projects
- SharePoint Document Management Architecture Guide
- EDMS (Engineering Document Management System) design patterns
- ISO 19005 (PDF/A) for long-term document archival
- National Archives of Chile (Archivo Nacional) -- records management guidelines

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-02-25 | VSC IT/OT Agent | Initial version. Complete document management system design with naming conventions, folder structure, metadata schema, access control, lifecycle management, and retention policies. |
