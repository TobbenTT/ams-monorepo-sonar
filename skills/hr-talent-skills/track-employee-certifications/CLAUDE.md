---
name: track-employee-certifications
description: >
  Professional certification and license tracking for industrial Operational
  Readiness projects. Monitors professional licenses, safety certifications,
  equipment operation permits, regulatory authorizations, and their expiry dates
  across mining, oil & gas, chemicals, and energy workforces in Latin America.
  Ensures no personnel operate beyond their certified scope and all regulatory
  certification requirements are met before commissioning and steady-state
  operations.
category: C - Tracking
priority: Medium
version: 1.0.0
agent: hr-talent
---

# Track Employee Certifications

## Purpose

This skill provides the HR & Talent agent with a dedicated certification lifecycle
management capability for industrial OR projects. While the administer-training-
records skill tracks internal training modules and completions, this skill focuses
specifically on externally issued, formally regulated certifications, professional
licenses, and equipment operation permits that carry legal authority.

In industrial operations, working without valid certifications is not merely a
policy violation -- it is a legal offense. A crane operator whose NCCCO
certification has lapsed, an electrician whose Class A license has expired, or a
blaster whose explosives handling permit is not current represents both a safety
hazard and a regulatory liability. Penalties range from personal fines to site
shutdown orders, and in the event of an incident, expired certifications can
result in criminal prosecution of supervisors and company officers.

This skill ensures that every certification required for OR project operations is
identified, verified, tracked through its validity period, and renewed before
expiry. It provides the HSE agent with certification compliance data for safety
assurance, the Operations agent with work authorization status for task assignment,
and the Orchestrator with certification readiness summaries for gate reviews.

## Intent & Specification

The skill SHALL:

1. **Maintain a certification registry** cataloging every externally issued
   certification, license, and permit held by project personnel. Each record
   includes: certificate type, issuing authority, certificate number, issue date,
   expiry date, scope of authorization, and any conditions or limitations.
2. **Define certification requirements per role** by mapping job positions to
   mandatory and recommended certifications based on regulatory requirements,
   client specifications, and industry standards. This mapping is validated against
   the Operations agent's competency framework and HSE agent's safety mandates.
3. **Verify certification authenticity** by documenting verification procedures
   for each certification type: issuing authority confirmation, license number
   validation, document inspection for tampering, and third-party verification
   services where available.
4. **Monitor expiry dates with graduated alerts** providing 120-day, 90-day,
   60-day, 30-day, and 14-day advance warnings to the certificate holder, their
   supervisor, and HR. Expired certifications trigger immediate work authorization
   suspension notifications to Operations and HSE agents.
5. **Track recertification processes** including renewal application status,
   refresher training enrollment, examination scheduling, and updated certificate
   receipt and filing.
6. **Generate certification compliance reports** per department, role type, and
   regulatory domain, identifying gaps, expiring credentials, and overall
   certification health for the project workforce.
7. **Support regulatory inspections** by maintaining an audit-ready certification
   evidence package with indexed copies of all certificates, verification records,
   and compliance status documentation.

## Trigger / Invocation

### English Triggers
- "Track certifications for the project workforce"
- "Which certifications are expiring in the next 90 days?"
- "Verify certification status for [employee name]"
- "Generate a certification compliance report"
- "What certifications are required for [role type]?"
- "Flag personnel with expired certifications"
- "Prepare certification package for regulatory inspection"
- "Update certification record for [employee name]"

### Spanish Triggers (Latin American)
- "Rastrear certificaciones de la fuerza laboral del proyecto"
- "Cuales certificaciones vencen en los proximos 90 dias?"
- "Verificar estado de certificacion de [nombre empleado]"
- "Generar un reporte de cumplimiento de certificaciones"
- "Cuales certificaciones se requieren para [tipo de cargo]?"
- "Identificar personal con certificaciones vencidas"
- "Preparar paquete de certificaciones para inspeccion regulatoria"
- "Actualizar registro de certificacion de [nombre empleado]"

## Input Requirements

### Required Inputs

| Input | Source | Format | Description |
|-------|--------|--------|-------------|
| Competency Framework | Operations agent | MD/XLSX | Role-to-competency mapping including certification requirements |
| HSE Certification Requirements | HSE agent | MD | Mandatory safety certifications per role risk classification |
| Workforce Register | manage-recruitment-pipeline | MD/XLSX | All active personnel with roles and departments |
| Employee Certification Documents | Client HR / Employees | PDF/XLSX | Copies of certificates, licenses, and permits |

### Optional Inputs

| Input | Source | Format | Description |
|-------|--------|--------|-------------|
| Regulatory Certification Mandates | Contracts & Compliance agent | MD | Jurisdiction-specific certification requirements by role |
| Certification Provider Directory | Client / External | MD | Approved providers, examination schedules, costs |
| Historical Certification Data | Client HRIS | CSV/XLSX | Existing certification records for transferred employees |
| Training Completion Data | administer-training-records | MD | Refresher training completions feeding recertification |

### Context Enrichment
- The skill reads `methodology/or-concepts/` for OR phase work authorization requirements
- HSE agent provides the master list of safety-critical certifications
- Operations agent defines which certifications authorize which work activities
- Contracts & Compliance agent provides regulatory updates on certification requirements
- Execution agent's commissioning sequence defines which certifications are needed by when

## Output Specification

The skill produces the following deliverables:

1. **Certification Registry** (`output/hr/certification-registry.md`)
   - Master register of all certifications held by project personnel
   - Fields: Employee ID, Name, Role, Certification Type, Issuing Authority,
     Certificate Number, Issue Date, Expiry Date, Scope, Status, Verification Status
   - Sortable by expiry date, employee, department, certification type
   - Status values: Valid, Expiring Soon (with days remaining), Expired, Suspended,
     Renewal In Progress, Verified, Pending Verification

2. **Role Certification Requirements Matrix** (`output/hr/certification-requirements-matrix.md`)
   - Role-by-certification matrix showing mandatory and recommended certifications
   - Regulatory basis for each requirement (specific law, regulation, or standard)
   - Validity periods and recertification requirements per certification type
   - Client-specific additional requirements beyond regulatory minimums

3. **Certification Expiry Dashboard** (`output/hr/certification-expiry-dashboard.md`)
   - Summary view of certification health across the workforce
   - Counts by alert status: Valid, 120-day, 90-day, 60-day, 30-day, 14-day, Expired
   - Department-level certification compliance percentages
   - Critical path certifications linked to upcoming commissioning activities
   - Action items for renewals in progress

4. **Certification Gap Report** (`output/hr/certification-gap-report.md`)
   - Personnel lacking required certifications for their current role
   - Personnel lacking certifications for upcoming commissioning assignments
   - Gap severity:
     - **Critical**: legally mandated certification missing, cannot work
     - **High**: client-required certification missing, restricted duties
     - **Medium**: recommended certification missing, reduced capability
   - Remediation plan: certification program, estimated timeline, cost

5. **Certification Compliance Report** (`output/hr/certification-compliance-report.md`)
   - Overall compliance rate: percentage of required certifications currently valid
   - Compliance by regulatory domain (safety, environmental, equipment operation)
   - Non-compliance items with specific regulatory reference
   - Corrective action status for non-compliance items
   - Trend analysis showing compliance rate progression

6. **Regulatory Audit Evidence Package** (`output/hr/certification-audit-package/`)
   - Index file mapping each regulatory requirement to evidence
   - Organized certificate copies per employee
   - Verification records per certificate
   - Compliance summary suitable for inspector review

## Procedure

### Step 1: Define Certification Requirements
- Ingest the Operations agent's competency framework to identify certification
  requirements per role
- Ingest the HSE agent's safety certification mandates per role risk level
- Request regulatory certification requirements from Contracts & Compliance agent:
  - **Chile (Mining)**: DS 132 -- licencias de operador de equipo pesado, certificados
    de voladura (manipulador de explosivos), certificado de instalador electrico
    (SEC), licencia clase D para vehiculos de sitio
  - **Chile (General)**: licencia de instalador electrico (SEC), certificados de
    soldador (AWS/ASME), credencial de operador de grua (NCh 2458)
  - **Peru**: certificacion de operador de maquinaria pesada (MTC), licencia de
    manejo de explosivos (SUCAMEC), certificado de competencia del OSINERGMIN
  - **Colombia**: certificacion de trabajo en alturas (Resolucion 4272 de 2021),
    licencia de conduccion de maquinaria (MinTransporte), certificacion de
    manipulacion de sustancias quimicas
- Build role-certification requirements matrix:
  - Map each role to all applicable certifications (mandatory and recommended)
  - Document regulatory basis for each requirement with article/section reference
  - Define validity period and recertification requirements per certification type
  - Identify client-specific additional requirements
- Validate matrix with Operations, HSE, and Contracts & Compliance agents
- Obtain client sign-off on certification requirements

### Step 2: Collect and Verify Certifications
- For each employee in the workforce register:
  - Collect copies of all held certifications, licenses, and permits
  - Create certification record with all required fields
  - Initiate verification process per certification type:
    - **Online verification**: where issuing authority provides online lookup
      (e.g., SEC portal for Chilean electrician licenses)
    - **Written confirmation**: formal letter to issuing authority confirming validity
    - **Document inspection**: check for security features, alterations, consistency
    - **Third-party verification**: engage verification service for foreign credentials
  - Record verification status and method
  - Flag any certifications that cannot be verified or appear irregular
- Compare held certifications against role requirements matrix:
  - Identify missing mandatory certifications (immediate gap)
  - Identify certifications expiring before project end (upcoming gap)
  - Identify certifications valid but not yet verified (verification gap)
- Generate initial certification gap report for project leadership

### Step 3: Implement Expiry Monitoring
- Configure alert thresholds for all certifications with expiry dates:
  - **120 days before expiry**: planning alert to HR
    - Identify recertification pathway (refresher training, examination, renewal application)
    - Estimate timeline and cost for recertification
  - **90 days before expiry**: notification to employee and supervisor
    - Initiate recertification process (enrollment, application submission)
  - **60 days before expiry**: escalation to HR lead
    - Verify recertification in progress
    - Assess impact if certification lapses
  - **30 days before expiry**: warning to department manager
    - Confirm recertification completion date
    - Plan contingency if certification will lapse (reassign duties, temporary replacement)
  - **14 days before expiry**: urgent alert to HR lead and Operations agent
    - Final confirmation of recertification status
    - If lapse is imminent: notify Operations agent for work reassignment
  - **Expiry date**: expired certification alert
    - Immediately suspend work authorization for certified scope
    - Notify Operations agent and HSE agent
    - Update certification status to Expired
    - Document impact on operations and any work restrictions
- Run expiry scan weekly and generate certification expiry dashboard

### Step 4: Manage Recertification Lifecycle
- For each certification approaching expiry or identified as a gap:
  - Determine recertification pathway:
    - Direct renewal (application + fee, no examination)
    - Refresher training + examination
    - Full recertification program (for lapsed certifications)
    - Equivalency recognition (for foreign credentials)
  - Enroll employee in required refresher training (coordinate with
    administer-training-records skill)
  - Schedule examination or assessment date
  - Track application/examination status:
    - Applied, Scheduled, In Progress, Passed, Failed, Certificate Issued
  - Upon recertification:
    - Collect new certificate copy
    - Verify authenticity
    - Update certification registry with new dates
    - Restore work authorization if previously suspended
    - Notify Operations and HSE agents
  - For failed examinations:
    - Schedule retake within policy period
    - Assess continued work authorization during remediation
    - If persistent failure: escalate to Operations for role reassignment

### Step 5: Report, Audit, and Optimize
- Generate weekly certification expiry dashboard for inclusion in OR reports
- Produce monthly certification compliance report:
  - Overall compliance rate (valid required certifications / total required)
  - Department-level breakdown
  - Regulatory domain compliance
  - Trend analysis (improving, stable, declining)
- For gate reviews (G2, G3), produce certification readiness summary:
  - Certification compliance for personnel assigned to gate activities
  - Outstanding certification gaps blocking gate advancement
  - Projected resolution dates and risk assessment
- Maintain audit-ready evidence package:
  - Organize certificate copies by employee and certification type
  - Index verification records
  - Prepare compliance summary for inspector review
  - Test package completeness by conducting internal mock audit quarterly
- Feed certification data to related skills:
  - administer-training-records: recertification training completions
  - analyze-workforce-metrics: certification compliance as a workforce KPI
- At project completion, produce certification management lessons learned:
  - Common gap types encountered
  - Average recertification lead times by certification type
  - Provider reliability ratings
  - Recommendations for future OR projects

## Quality Criteria

| Dimension | Weight | Target | Validation Method |
|-----------|--------|--------|-------------------|
| Technical Accuracy | 30% | Certification requirements correctly mapped from regulations; all legal mandates captured; expiry dates accurately recorded and monitored | Cross-reference with regulatory requirements and issuing authority records |
| Completeness | 25% | 100% of workforce has certification records; all required certifications tracked; no gaps in expiry monitoring coverage | Coverage audit against workforce register and requirements matrix |
| Consistency | 15% | Uniform record structure; consistent verification procedures; standardized alert thresholds across all certification types | Process compliance review |
| Format | 10% | Clean registry format; VSC branding; exportable to client HRIS; audit-ready evidence package structure | Template compliance and audit mock review |
| Actionability | 10% | Expiry alerts include specific recertification steps and timelines; gap reports include remediation plans | Supervisor usability feedback |
| Traceability | 10% | Every certification requirement traces to specific regulation; every certificate links to verified copy and verification record | Evidence and reference audit |

**Minimum passing score: 91%**

## Inter-Agent Dependencies

### Upstream (this skill receives from):
| Agent | Artifact | Dependency Type |
|-------|----------|-----------------|
| Operations | Competency Framework (certification requirements) | REQUIRED -- defines which certifications are needed per role |
| HSE | Safety Certification Requirements | REQUIRED -- mandatory safety certifications per risk level |
| HR & Talent (self) | Workforce Register from manage-recruitment-pipeline | REQUIRED -- personnel to track |
| HR & Talent (self) | Training Completions from administer-training-records | REQUIRED -- refresher training feeding recertification |
| Contracts & Compliance | Regulatory Certification Mandates | REQUIRED -- jurisdiction-specific legal requirements |
| Execution | Commissioning Schedule | RECOMMENDED -- urgency prioritization for certification gaps |

### Downstream (this skill provides to):
| Agent | Artifact | Dependency Type |
|-------|----------|-----------------|
| Orchestrator | Certification Expiry Dashboard | REQUIRED -- for OR progress reporting |
| Orchestrator | Gate Readiness Certification Summary | REQUIRED -- for G2/G3 gate reviews |
| Operations | Work Authorization Status | REQUIRED -- personnel cleared to perform certified tasks |
| HSE | Safety Certification Compliance Records | REQUIRED -- for safety assurance and regulatory audit |
| HR & Talent (self) | Certification Data to analyze-workforce-metrics | RECOMMENDED -- workforce KPI input |
| HR & Talent (self) | Recertification Training Needs to administer-training-records | REQUIRED -- training enrollment triggers |
| Contracts & Compliance | Certification Compliance Status | RECOMMENDED -- for regulatory audit readiness |

## References

- VSC OR Knowledge Base v2.0 (`docs/architecture/_legacy/knowledge-base.md`)
- VSC Multi-Agent Architecture v2 (`docs/architecture/_legacy/multi-agent-architecture.md`)
- VSC Skills Methodology v2 (`skills/VSC_Skills_Methodology_v2.md`)
- Decreto Supremo 132 (Chile) -- Reglamento de Seguridad Minera (Titulo IX: Requisitos
  de Competencia y Titulo X: Capacitacion)
- Ley 18.410 (Chile) -- Superintendencia de Electricidad y Combustibles (SEC) licensing
- NCh 2458 (Chile) -- Gruas: Operadores, requisitos de calificacion
- D.S. 024-2016-EM (Peru) -- Reglamento de Seguridad y Salud Ocupacional en Mineria
- Resolucion 4272 de 2021 (Colombia) -- Trabajo en Alturas
- NCCCO -- National Commission for the Certification of Crane Operators
- AWS D1.1 -- Structural Welding Code (welder certification)
- ASME Section IX -- Welding, Brazing, and Fusing Qualifications
- ISO 17024:2012 -- Conformity Assessment: General Requirements for Bodies Operating
  Certification of Persons
- IOGP Report 459 -- Life-Saving Rules (certification implications)

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-25 | VSC OR System | Initial creation of track-employee-certifications skill |
