---
name: audit-compliance-readiness
description: "Audit regulatory and contractual compliance readiness before operations commence. Triggers: 'compliance audit', 'regulatory readiness', 'auditoria de cumplimiento'."
---

# Audit Compliance Readiness

## Skill ID: L-04
## Version: 1.0.0
## Category: L. Compliance Intelligence
## Priority: P1 - Critical

---

## Purpose

Audit the compliance readiness of industrial facilities and capital projects against all applicable regulatory, contractual, and voluntary standard requirements, producing a comprehensive gap analysis with prioritized action plans, compliance scoring, and closure tracking. This skill systematically evaluates whether an organization is prepared to satisfy the full spectrum of compliance obligations -- from environmental permits and occupational safety regulations to industry codes and contractual commitments -- before regulatory audits, project handover, or operational startup.

The compliance landscape for industrial operations is vast and growing. A typical mining operation in Chile must comply with 200-500+ discrete regulatory requirements (Pain Point CE-03, derived from SERNAGEOMIN, SMA, DGA, SISS, SEC, Direccion del Trabajo, and other agencies). An oil & gas facility faces a comparable burden from SEC (Superintendencia de Electricidad y Combustibles), SERNAGEOMIN, SMA, and international standards (API, NFPA, IEC). The problem is not that organizations are unaware of regulations -- it is that compliance tracking is fragmented, inconsistent, and reactive rather than proactive.

Industry data reveals the consequences of compliance gaps:

- **30-40% of startup incidents are attributable to incomplete compliance with pre-startup safety review (PSSR) requirements** (Pain Point CE-04, based on CSB investigation data). These incidents occur because compliance verification is treated as a checklist exercise rather than a systematic audit.
- **Regulatory fines in Chile have increased 300% over the past decade** as enforcement agencies (SMA, SERNAGEOMIN) have expanded their oversight capabilities and political will for enforcement has strengthened. SMA fines for environmental non-compliance can reach 10,000 UTA (~$7.2M USD).
- **Insurance claims are increasingly denied based on regulatory non-compliance** -- insurers use compliance audits to verify adherence to fire codes, pressure vessel inspection requirements, and electrical safety standards before paying claims.
- **Contract penalties for compliance failures** in EPC and O&M contracts can reach 5-10% of contract value, with liquidated damages clauses triggered by failure to obtain operating permits on schedule.
- **Permit revocation risk**: In extreme cases, non-compliance results in temporary or permanent operational shutdown orders, with production losses of $1-10M per day for major facilities.

This skill transforms compliance management from a reactive, audit-response exercise into a proactive, continuous assurance system. By identifying gaps before regulators or auditors find them, the organization can remediate at a fraction of the cost and with zero reputational damage.

---

## Intent & Specification

The AI agent MUST understand and execute the following:

1. **Comprehensive Regulatory Mapping**: The agent must build or update a complete regulatory requirements register covering all applicable jurisdictions, agencies, and standards. This includes national, regional, and local regulations; industry-specific codes and standards; contractual obligations; voluntary commitments (ISO certifications, ICMM membership, Equator Principles); and internal corporate policies.

2. **Evidence-Based Assessment**: Every compliance requirement must be assessed against documented evidence -- not self-declarations. The agent must verify the existence, currency, and adequacy of: permits and licenses, management system documentation, training records, inspection reports, monitoring data, emergency response plans, and equipment certifications.

3. **Risk-Weighted Scoring**: Compliance gaps must be scored using a risk-weighted methodology that considers:
   - **Severity of non-compliance**: What is the regulatory consequence? (fine amount, shutdown risk, criminal liability)
   - **Likelihood of detection**: How likely is the gap to be discovered by regulators? (upcoming audit, public visibility, whistleblower risk)
   - **Remediation complexity**: How difficult and costly is the gap to close? (quick fix vs. capital project)
   - **Timeline pressure**: When is the compliance deadline? (overdue, imminent, future)

4. **Action Plan Generation**: For every identified gap, the agent must generate a specific, actionable remediation plan with: responsible party, required actions, estimated cost, required timeline, and dependencies on other remediation activities.

5. **Continuous Monitoring**: The skill must support periodic re-assessment (monthly, quarterly, annually) with trend tracking that shows whether the organization's compliance posture is improving, stable, or deteriorating.

6. **Multi-Standard Integration**: Many compliance requirements overlap across standards (e.g., emergency response is required by OSHA PSM, ISO 45001, SERNAGEOMIN DS132, and environmental permits). The agent must identify these overlaps and create integrated compliance evidence packages that satisfy multiple requirements simultaneously.

7. **Pre-Audit Preparation**: When a specific regulatory audit is announced, the agent must generate a focused preparation package: anticipated audit scope, evidence to have ready, personnel to be available, and areas of known weakness requiring attention.

8. **Language**: Spanish (Latin American) for all deliverables, with regulatory standard references preserved in their original language (English or Spanish as applicable).

---

## Trigger / Invocation

```
/audit-compliance-readiness
```

### Natural Language Triggers
- "Audit our compliance readiness against regulatory requirements"
- "Perform a compliance gap analysis for [facility]"
- "Assess our readiness for the upcoming [SERNAGEOMIN/SMA/SEC] audit"
- "How compliant are we with [ISO 45001/ISO 14001/ISO 55001]?"
- "Generate a compliance status report for the project"
- "Auditar estado de compliance para [planta/proyecto]"
- "Evaluar brechas de cumplimiento regulatorio"
- "Prepararnos para la fiscalizacion de [SMA/SERNAGEOMIN]"

### Aliases
- `/compliance-audit`
- `/compliance-gap-analysis`
- `/regulatory-readiness`

---

## Input Requirements

### Required Inputs

| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `facility_profile` | Facility name, location, industry sector, operational status (construction, commissioning, operating), and scope of compliance assessment | .docx / text | User / mcp-sharepoint |
| `regulatory_register` | Master register of applicable regulatory requirements (or the agent will build one from jurisdiction and industry inputs) | .xlsx / .csv | Agent-legal / mcp-sharepoint / mcp-web-monitor |
| `industry_sector` | Primary industry (Mining, Oil & Gas, Power, Chemical, Water) for selecting applicable codes and standards | Text | User |
| `jurisdiction` | Country, region, and local jurisdiction for regulatory mapping (e.g., Chile, Region de Antofagasta, Comuna de Calama) | Text | User |

### Optional Inputs (Strongly Recommended)

| Input | Description | Default if Absent |
|-------|-------------|-------------------|
| `permits_and_licenses` | Current permits, licenses, and authorizations with expiry dates | Gap flagged for all permit-requiring activities |
| `management_system_docs` | ISO management system documentation (manuals, procedures, records) | Assessed as undocumented management systems |
| `training_records` | Regulatory training completions (safety, environmental, legal compliance) | Training compliance gap assumed for all regulatory training |
| `inspection_reports` | Equipment inspection certificates (pressure vessels, lifting equipment, electrical, fire protection) | Inspection gaps flagged for all regulated equipment |
| `environmental_monitoring` | Environmental monitoring data and compliance reports (air, water, waste, noise) | Environmental compliance unverified |
| `emergency_response_plan` | Emergency response plan and drill records | ERP gap flagged as critical |
| `incident_history` | Safety and environmental incident records for past 3 years | Incident compliance history unavailable |
| `contractual_obligations` | EPC, O&M, and financing contract compliance requirements | Contractual compliance excluded from scope |
| `audit_schedule` | Known upcoming regulatory audits with dates and scope | No upcoming audits assumed |
| `previous_audit_reports` | Results of prior regulatory audits, inspections, and self-assessments | First-time assessment assumed |
| `corporate_standards` | Internal corporate policies, standards, and governance requirements | Only external regulatory requirements assessed |
| `iso_certifications` | Current ISO certifications and surveillance audit schedules | ISO compliance excluded unless provided |

### Context Enrichment (Automatic)

The agent will automatically:
- Query mcp-web-monitor for recent regulatory changes, new regulations, and enforcement actions in the applicable jurisdiction
- Retrieve current versions of applicable Chilean regulatory frameworks (DS 132, DS 594, DS 40, DS 148, NCh standards)
- Access ISO standard requirements for certified management systems
- Retrieve SERNAGEOMIN, SMA, and SEC enforcement databases for recent penalties and focus areas
- Access industry code requirements (API, NFPA, IEC, ASME) applicable to the facility
- Retrieve corporate compliance database entries from mcp-sharepoint
- Pull equipment inspection due dates and certification status from asset management systems
- Access permit condition registers from environmental approval documentation

---

## Output Specification

### Deliverable 1: Compliance Readiness Audit Report (.docx)

**Filename**: `{ProjectCode}_Compliance_Audit_Report_v{Version}_{YYYYMMDD}.docx`

**Target Length**: 40-80 pages depending on scope

**Structure**:

1. **Cover Page** -- VSC branding, facility identification, assessment date, overall compliance score
2. **Document Control** -- Revision history, assessment team, review and approval
3. **Executive Summary** (3-4 pages)
   - Overall compliance score (percentage and RAG status)
   - Compliance score by regulatory domain
   - Critical gaps requiring immediate action (top 10)
   - Compliance trend vs. previous assessment (if applicable)
   - Estimated remediation cost and timeline summary
   - Key recommendations
4. **Assessment Scope & Methodology** (3-5 pages)
   - Facility scope and operational boundaries
   - Regulatory frameworks assessed (with version numbers)
   - Assessment methodology (evidence-based, risk-weighted scoring)
   - Scoring criteria and definitions
   - Limitations and exclusions
5. **Regulatory Landscape Summary** (3-5 pages)
   - Applicable regulatory agencies and their jurisdictions
   - Recent regulatory changes affecting the facility
   - Upcoming regulatory deadlines and milestones
   - Enforcement trends and focus areas
   - Pending legislative changes that may create new requirements
6. **Compliance Assessment by Domain** (15-30 pages)
   - 6.1 Occupational Health & Safety Compliance
     - SERNAGEOMIN DS 132 (mining safety), or SEC regulations, or Direccion del Trabajo DS 594
     - ISO 45001 management system assessment
     - Hazardous materials regulations (DS 148)
     - Process safety management requirements
     - Compliance score, gaps identified, evidence assessed
   - 6.2 Environmental Compliance
     - Environmental Impact Assessment (EIA/DIA) conditions -- RCA permit conditions
     - SMA reporting requirements and environmental monitoring obligations
     - Waste management compliance (DS 148, REP Law)
     - Water rights and discharge permits (DGA, SISS)
     - Air quality permits and monitoring
     - Compliance score, gaps identified, evidence assessed
   - 6.3 Mining/Industrial Specific Compliance
     - Closure plan requirements (mining) or decommissioning obligations
     - Tailings management (mining) or process safety (O&G/chemical)
     - Electrical safety (SEC, NSEG)
     - Pressure equipment regulations
     - Compliance score, gaps identified, evidence assessed
   - 6.4 Labor and Employment Compliance
     - Codigo del Trabajo (Chilean Labor Code)
     - Collective bargaining and industrial relations
     - Working hours, shift schedules, overtime
     - Immigration requirements for foreign workers
     - Compliance score, gaps identified, evidence assessed
   - 6.5 Fire Protection and Emergency Response
     - Fire code compliance (NFPA, NCh standards)
     - Emergency response plan adequacy
     - Emergency drill frequency and documentation
     - Fire detection and suppression system maintenance
     - Compliance score, gaps identified, evidence assessed
   - 6.6 Equipment and Infrastructure Compliance
     - Pressure vessel inspection (ASME, NCh)
     - Lifting equipment certification (cranes, hoists, forklifts)
     - Electrical installation compliance (NSEG, SEC)
     - Structural integrity assessments
     - Vehicle and mobile equipment compliance
     - Compliance score, gaps identified, evidence assessed
   - 6.7 Contractual and Voluntary Compliance
     - EPC contract compliance obligations
     - O&M contract performance requirements
     - Financing covenant compliance (IFC PS, Equator Principles)
     - Voluntary commitments (ICMM, UN Global Compact, CDP)
     - ISO certification maintenance requirements
     - Compliance score, gaps identified, evidence assessed
   - 6.8 Governance and Reporting Compliance
     - Corporate governance requirements (CMF)
     - Financial reporting obligations
     - ESG reporting obligations (CMF NCG 461)
     - Tax compliance
     - Compliance score, gaps identified, evidence assessed
7. **Gap Analysis Summary** (5-8 pages)
   - 7.1 Compliance gap register (complete list with risk scoring)
   - 7.2 Gap distribution analysis (by domain, by severity, by remediation complexity)
   - 7.3 Critical gaps requiring immediate action (risk score > threshold)
   - 7.4 Systemic gaps (patterns across multiple domains indicating management system weaknesses)
   - 7.5 Comparison with industry compliance benchmarks
8. **Action Plan** (5-10 pages)
   - 8.1 Prioritized remediation actions by risk score
   - 8.2 Quick wins (can be closed within 30 days, low cost)
   - 8.3 Medium-term actions (30-180 days, moderate cost)
   - 8.4 Long-term actions (>180 days, significant cost or capital investment)
   - 8.5 Estimated total remediation cost by domain and phase
   - 8.6 Resource requirements for remediation
   - 8.7 Action tracking and accountability framework
9. **Pre-Audit Preparation Guide** (2-3 pages, if upcoming audit identified)
   - Anticipated audit scope and methodology
   - Evidence packages to prepare
   - Personnel to be available
   - Known weaknesses requiring mitigation before audit
   - Recommended pre-audit rehearsal activities
10. **Appendices**
    - A: Complete regulatory requirements register with assessment status
    - B: Evidence inventory (documents reviewed during assessment)
    - C: Scoring methodology detail
    - D: Regulatory reference list with URLs

### Deliverable 2: Compliance Gap Register (.xlsx)

**Filename**: `{ProjectCode}_Compliance_Gap_Register_v{Version}_{YYYYMMDD}.xlsx`

**Sheets**: Gap Register (all gaps with risk scores), Action Plan (all remediation actions), Compliance Scorecard (domain-by-domain scores), Regulatory Register (all requirements with compliance status), Evidence Inventory (documents assessed), Trend Analysis (period-over-period comparison)

### Deliverable 3: Compliance Dashboard (Power BI / .pptx)

**Filename**: `{ProjectCode}_Compliance_Dashboard_v{Version}_{YYYYMMDD}.pptx`

**Structure (12-15 slides)**: Overall compliance score dial, domain-by-domain compliance heat map, gap severity distribution, action plan status tracker, regulatory deadline calendar, trend over time, peer benchmarking.

---

## Methodology & Standards

### Primary Regulatory Frameworks (Chile)

| Agency / Framework | Application | Key Regulations |
|--------------------|-------------|-----------------|
| **SERNAGEOMIN** | Mining safety and mining environmental | DS 132 (Reglamento de Seguridad Minera), DS 248 (Reglamento de Plantas de Gas), closure plan regulations |
| **SMA** | Environmental compliance enforcement | Environmental impact assessment (SEIA) conditions, Resoluciones de Calificacion Ambiental (RCA), environmental monitoring programs |
| **DGA** | Water resources | Water rights, extraction limits, discharge quality standards |
| **SEC** | Electrical and fuel safety | NSEG (Normas de Seguridad Electrica General), installation certifications, fuel storage and handling |
| **Direccion del Trabajo** | Labor law compliance | Codigo del Trabajo, DS 594 (workplace conditions), DS 40 (safety prevention), collective bargaining |
| **SISS** | Water and sanitation services | Discharge to sewer standards, water quality standards for water utilities |
| **CMF** | Financial and corporate governance | Corporate reporting, ESG disclosure (NCG 461) |
| **Ministerio de Salud** | Public health and hazardous substances | DS 148 (hazardous waste), DS 594 (workplace environmental conditions), DS 3 (food safety) |
| **Bomberos / ONEMI** | Fire protection and emergency management | Emergency response planning, fire code compliance |

### International Standards Commonly Applicable

| Standard | Application |
|----------|-------------|
| **ISO 45001:2018** | Occupational Health & Safety Management System |
| **ISO 14001:2015** | Environmental Management System |
| **ISO 55001:2014** | Asset Management System |
| **ISO 9001:2015** | Quality Management System |
| **ISO 31000:2018** | Risk Management |
| **OHSAS / OSHA PSM** | Process Safety Management (29 CFR 1910.119 model) |
| **API 754** | Process Safety Performance Indicators |
| **NFPA 30, 72, 101** | Fire protection codes (flammable liquids, fire alarm, life safety) |
| **ASME BPVC** | Pressure vessel design and inspection |
| **IEC 61511** | Safety Instrumented Systems (SIS) |
| **IEC 62305** | Lightning protection |
| **ICMM Performance Expectations** | Mining industry sustainability commitments |
| **IFC Performance Standards** | Environmental and social requirements for project financing |
| **Equator Principles** | Project finance ESG risk assessment |

### Compliance Scoring Methodology

```
For each regulatory requirement:

1. Compliance Status Assessment:
   - COMPLIANT (Green): Evidence demonstrates full compliance. Score = 100%
   - PARTIALLY COMPLIANT (Amber): Evidence demonstrates partial compliance;
     gap exists but is manageable. Score = 25-75% (based on extent of compliance)
   - NON-COMPLIANT (Red): Evidence demonstrates non-compliance or evidence
     is absent. Score = 0%
   - NOT APPLICABLE (Grey): Requirement does not apply to this facility. Excluded.
   - NOT ASSESSED (White): Insufficient information to assess. Flagged for follow-up.

2. Risk Weighting (per gap):
   Severity Score (1-5):
     5 = Facility shutdown, criminal prosecution, fatality potential
     4 = Major fine (>$1M), operational restriction, serious injury potential
     3 = Moderate fine ($100K-$1M), enforcement notice, moderate injury potential
     2 = Minor fine (<$100K), warning letter, minor injury potential
     1 = Administrative non-conformance, no direct penalty

   Likelihood of Detection (1-5):
     5 = Active enforcement, scheduled audit, public visibility
     4 = Periodic audit, inspector focus area, complaint-driven
     3 = Moderate audit frequency, standard inspection scope
     2 = Low audit frequency, not current focus area
     1 = Rare inspection, low visibility

   Risk Score = Severity x Likelihood (1-25)
   - Critical: 15-25 (immediate action required)
   - High: 10-14 (action within 30 days)
   - Medium: 5-9 (action within 90 days)
   - Low: 1-4 (action within 180 days)

3. Domain Compliance Score:
   Domain Score = Sum of (Requirement Score x Requirement Weight)
                  / Sum of (Maximum Score x Requirement Weight)
   Where Weight = Risk Score for each requirement

4. Overall Compliance Score:
   Overall = Weighted average of Domain Scores
   Where Domain Weight = Number of requirements x Average requirement risk weight
```

### Compliance Maturity Model

| Level | Description | Typical Score | Characteristics |
|-------|-------------|---------------|-----------------|
| **Level 1: Reactive** | Compliance addressed only when regulators intervene | 40-60% | No register, no tracking, post-incident response |
| **Level 2: Managed** | Basic compliance register exists; periodic review | 60-75% | Register exists but incomplete; annual review; gaps persist |
| **Level 3: Defined** | Systematic compliance program with regular audits | 75-85% | Complete register; quarterly assessment; action tracking |
| **Level 4: Measured** | Data-driven compliance management with KPIs | 85-95% | Automated monitoring; leading indicators; continuous improvement |
| **Level 5: Optimized** | Compliance integrated into business processes; proactive | 95-100% | Predictive compliance; regulatory change anticipation; zero surprises |

---

## Step-by-Step Execution

### Phase 1: Scope Definition & Regulatory Mapping (Steps 1-4)
**Step 1: Define assessment scope and boundaries.**
### Phase 2: Evidence Assessment & Gap Identification (Steps 5-8)
**Step 5: Assess permit and license compliance.**
### Phase 3: Scoring, Analysis & Action Planning (Steps 9-12)
**Step 9: Score compliance status for each requirement.**
### Phase 4: Report Generation & Monitoring Setup (Steps 13-16)
**Step 13: Compile compliance audit report.**

See [`references/skill-detailed-steps.md`](references/skill-detailed-steps.md) for complete detailed execution steps.

## Quality Criteria

### Assessment Quality (Target: >90% Accuracy on Subsequent Verification)

| Criterion | Weight | Description | Verification Method |
|-----------|--------|-------------|---------------------|
| Regulatory Coverage | 25% | All applicable regulatory frameworks identified and assessed; no material regulations omitted | Cross-reference against peer facility compliance programs; regulatory agency requirement lists |
| Evidence Rigor | 25% | Compliance status based on verified documentary evidence, not self-declaration | Evidence inventory audit; spot-check of compliance claims against source documents |
| Risk Scoring Accuracy | 20% | Gap severity and likelihood scores are calibrated to actual regulatory consequences | Comparison with actual enforcement outcomes for similar gaps; expert review |
| Action Plan Specificity | 15% | Every remediation action is specific, assignable, schedulable, and verifiable | Implementation feasibility review; responsible party confirmation |
| Completeness | 10% | No requirements left as "Not Assessed" without documented justification; no domains excluded without reason | Completeness audit against scope definition |
| Trend Accuracy | 5% | Period-over-period comparison is mathematically correct and narratively sound | Reconciliation with previous assessment data |

### Automated Quality Checks

- [ ] Every requirement in the register has a compliance status (no blanks)
- [ ] Every Non-Compliant and Partially Compliant finding has an assigned remediation action
- [ ] Every remediation action has a responsible party and target date
- [ ] Every Critical gap (risk score 15-25) has action within 30-day target
- [ ] Compliance scores by domain are arithmetically correct (verifiable formula)
- [ ] Overall compliance score matches weighted average of domain scores
- [ ] No "TBD," "pending," or placeholder entries in the final report
- [ ] All regulatory references include specific article/clause numbers
- [ ] Permit expiry dates are verified against document metadata
- [ ] Training compliance rates are calculable from reported numerators and denominators
- [ ] Gap register count matches the narrative in the gap analysis section
- [ ] Action plan cost estimates are provided for all High and Critical gaps
- [ ] Trend analysis shows mathematically correct period-over-period changes
- [ ] Pre-audit preparation section (if included) addresses specific audit scope

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs From)

| Agent/Skill | Input Provided | Criticality | MCP Channel |
|-------------|---------------|-------------|-------------|
| Agent 8 (Legal & Compliance) / `agent-legal` | Regulatory register, permit inventory, contractual compliance obligations | Critical | mcp-sharepoint |
| Agent 4 (HSE Intelligence) / `agent-hse` | Safety management system documentation, incident records, ERP, training records | Critical | mcp-sharepoint |
| Agent 2 (Operations Intelligence) / `agent-operations` | Operating procedures, operational permits, environmental monitoring data | High | mcp-sharepoint |
| Agent 3 (Maintenance Intelligence) / `agent-maintenance` | Equipment inspection records, pressure vessel certificates, lifting equipment certifications | High | mcp-cmms |
| Agent 5 (Workforce Readiness) / `agent-hr` | Training records, worker certifications, labor compliance data | High | mcp-sharepoint |
| `map-regulatory-requirements` (L-01) | Comprehensive regulatory requirements register | Critical | Internal |
| `track-incident-learnings` (L-02) | Incident compliance status and corrective action tracking | High | Internal |
| `generate-esg-report` (L-03) | ESG compliance data for governance assessment | Medium | Internal |
| `prepare-pssr-package` (I-04) | PSSR compliance status for pre-commissioning readiness | High | Internal |

### Downstream Dependencies (Outputs To)

| Agent/Skill | Output Provided | Trigger |
|-------------|----------------|---------|
| `generate-esg-report` (L-03) | Compliance status for ESG governance section | On request |
| `orchestrate-or-program` (H-01) | Compliance readiness as input to gate reviews | Automatic |
| `generate-or-gate-review` (H-03) | Compliance assessment for gate review packages | On request |
| `track-or-deliverables` (H-02) | Compliance audit as tracked OR deliverable | On completion |
| Agent 8 (Legal) / `agent-legal` | Identified legal compliance gaps for remediation | Automatic |
| Agent 4 (HSE) / `agent-hse` | Safety compliance gaps for HSE management | Automatic |
| `create-or-plan` | Compliance readiness input for OR planning | On request |

### MCP Integrations

| MCP Server | Purpose | Operations |
|------------|---------|------------|
| **mcp-sharepoint** | Retrieve compliance evidence (permits, procedures, training records, inspection certificates); store audit deliverables; access regulatory registers | `GET /documents/{library}`, `POST /documents/{library}`, `GET /lists/{list}`, `SEARCH /documents` |
| **mcp-web-monitor** | Monitor regulatory changes, new regulations, enforcement actions, and peer compliance events; retrieve current regulatory texts | `GET /regulatory-updates/{jurisdiction}`, `GET /enforcement-actions/{agency}`, `SEARCH /regulations` |
| **mcp-excel** | Generate compliance gap register workbook, compliance scorecard, and action tracking spreadsheets | `POST /workbooks`, `PUT /sheets/{sheet}`, `GET /workbooks/{id}` |

---

## Examples

See [`references/skill-examples.md`](references/skill-examples.md) for detailed examples.

## Templates & References

See [`references/skill-templates-references.md`](references/skill-templates-references.md) for detailed templates & references.
