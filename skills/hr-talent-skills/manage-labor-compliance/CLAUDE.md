---
name: manage-labor-compliance
description: >
  Labor law compliance management for multi-jurisdiction industrial Operational
  Readiness projects across Latin America. Tracks obligations under the Chilean
  Codigo del Trabajo, Peruvian Ley General de Trabajo, and Colombian Codigo
  Sustantivo del Trabajo. Manages contract types, statutory benefits, working
  hour limits, termination procedures, union relations, and regulatory filings
  to ensure zero non-compliance findings during OR execution.
category: C - Tracking
priority: High
version: 1.0.0
agent: hr-talent
---

# Manage Labor Compliance

## Purpose

This skill provides the HR & Talent agent with a rigorous compliance tracking
and management framework for labor law obligations across the jurisdictions
where VSC executes Operational Readiness projects. Non-compliance with labor
regulations in Latin America carries severe consequences: monetary fines,
project stop-work orders, criminal liability for executives, and reputational
damage that can jeopardize future project awards.

Industrial OR projects face unique compliance challenges: shift work in remote
locations, high proportions of contractor labor, multi-national workforces
subject to different legal regimes, and rapid workforce scaling that can outpace
HR administrative capacity. This skill ensures that every employment
relationship -- whether direct hire, fixed-term, contractor, or subcontractor --
is established, managed, and (when necessary) terminated in full compliance with
applicable law.

The skill coordinates closely with the Contracts & Compliance agent for
regulatory intelligence and contract structuring, and with the HSE agent for
occupational health obligations that overlap with labor law requirements.

## Intent & Specification

The skill SHALL:

1. **Maintain a jurisdiction compliance matrix** mapping labor law requirements
   for Chile, Peru, and Colombia, covering: contract types permitted, maximum
   working hours and overtime rules, mandatory benefits (vacaciones, aguinaldo,
   gratificacion, CTS, cesantias), termination procedures and indemnification
   calculations, and union/collective bargaining obligations.
2. **Validate every employment contract** against the applicable jurisdiction's
   requirements before execution, checking: contract type appropriateness
   (indefinido, plazo fijo, por obra, honorarios), mandatory clauses, probation
   period terms, compensation structure legality, and benefit entitlements.
3. **Track statutory filing deadlines** including social security registrations
   (AFP, Isapre/Fonasa in Chile; ONP/AFP in Peru; EPS/ARL in Colombia), tax
   withholding declarations, and labor authority notifications for mass hiring.
4. **Monitor working time compliance** against legal maximums: ordinary hours,
   overtime caps, mandatory rest periods, exceptional shift arrangements (Art. 38
   Codigo del Trabajo for continuous operations), and annual leave accrual.
5. **Manage termination procedures** ensuring proper notice periods, calculation
   of finiquito/liquidacion, severance payments (anos de servicio in Chile,
   CTS in Peru, cesantias in Colombia), and labor authority notifications.
6. **Track union and collective bargaining obligations** including information
   sharing requirements, consultation timelines, and collective agreement
   compliance for unionized sites.
7. **Generate compliance audit reports** suitable for internal review, client
   assurance, and regulatory inspection readiness.

## Trigger / Invocation

### English Triggers
- "Check labor compliance for this project"
- "Validate employment contracts against local law"
- "What are the statutory filing deadlines this month?"
- "Generate a labor compliance audit report"
- "Review termination procedure for [jurisdiction]"
- "What overtime limits apply to [shift pattern]?"
- "Track union consultation obligations"

### Spanish Triggers (Latin American)
- "Verificar cumplimiento laboral para este proyecto"
- "Validar contratos de trabajo contra la legislacion local"
- "Cuales son los plazos de declaraciones legales este mes?"
- "Generar un informe de auditoria de cumplimiento laboral"
- "Revisar procedimiento de desvinculacion para [jurisdiccion]"
- "Cuales son los limites de horas extra para [turno]?"
- "Rastrear obligaciones de consulta sindical"

## Input Requirements

### Required Inputs

| Input | Source | Format | Description |
|-------|--------|--------|-------------|
| Project Jurisdiction(s) | Orchestrator | MD | Countries and specific regions where project operates |
| Employment Contracts | Client HR / HR & Talent | PDF/DOCX | Draft or executed contracts for compliance validation |
| Workforce Register | manage-recruitment-pipeline | MD/XLSX | All personnel with contract type, start date, jurisdiction |
| Regulatory Framework | Contracts & Compliance agent | MD | Current labor regulation summaries and recent amendments |

### Optional Inputs

| Input | Source | Format | Description |
|-------|--------|--------|-------------|
| Collective Bargaining Agreements | Client HR | PDF | Active union agreements with compliance obligations |
| Previous Audit Findings | Client HR | MD/PDF | Historical labor compliance issues for remediation tracking |
| Shift Pattern Definitions | Operations agent | MD | Planned shift rotations for working time validation |
| Subcontractor Labor Arrangements | Contracts & Compliance agent | MD | Subcontract terms for joint liability assessment |

### Context Enrichment
- The skill reads `methodology/or-concepts/` for OR phase workforce patterns
- Labor regulation references are loaded from Contracts & Compliance agent state
- Shift patterns and working time data come from Operations agent
- HSE occupational health obligations are cross-referenced for overlap

## Output Specification

The skill produces the following deliverables:

1. **Jurisdiction Compliance Matrix** (`output/hr/compliance-matrix.md`)
   - Side-by-side comparison of labor law requirements per jurisdiction
   - Contract type rules, working hour limits, benefit calculations
   - Updated as regulations change

2. **Contract Validation Log** (`output/hr/contract-validation-log.md`)
   - Each contract reviewed with pass/fail per compliance criterion
   - Non-conformances with specific legal reference and remediation action
   - Sign-off record from HR lead and legal advisor

3. **Statutory Filing Calendar** (`output/hr/statutory-filing-calendar.md`)
   - Monthly calendar of filing deadlines per jurisdiction
   - Responsible party, status (pending/submitted/confirmed), and evidence links
   - Automated reminder triggers at 14-day and 7-day intervals

4. **Working Time Compliance Report** (`output/hr/working-time-compliance.md`)
   - Actual vs. permitted hours per employee/crew
   - Overtime accumulation against annual and weekly caps
   - Mandatory rest period compliance verification
   - Flagged violations with corrective action recommendations

5. **Labor Compliance Audit Report** (`output/hr/labor-compliance-audit.md`)
   - Comprehensive audit covering all compliance dimensions
   - Finding severity classification (Critical, Major, Minor, Observation)
   - Corrective action plan with owners and target dates
   - Executive summary for client and Orchestrator

6. **Termination Procedure Guide** (`output/hr/termination-procedures.md`)
   - Step-by-step termination workflow per jurisdiction and contract type
   - Finiquito/liquidacion calculation templates
   - Document retention requirements
   - Labor authority notification requirements

## Procedure

### Step 1: Establish Compliance Baseline
- Identify all jurisdictions where project workforce is employed
- Request current regulatory framework from Contracts & Compliance agent
- Build jurisdiction compliance matrix covering:
  - **Chile**: Codigo del Trabajo (DFL 1, 2002), Art. 10 (contract requirements),
    Art. 22 (working hours 45h/week), Art. 31-32 (overtime max 2h/day),
    Art. 38 (continuous shift exceptions), Art. 67 (vacation 15 days),
    Art. 159-163 (termination causes), Art. 172-173 (severance calculation)
  - **Peru**: Ley de Productividad y Competitividad Laboral (D.S. 003-97-TR),
    TUO D.Leg. 728, working hours 48h/week, CTS (D.S. 001-97-TR),
    gratificaciones (Ley 27735), vacation 30 days
  - **Colombia**: Codigo Sustantivo del Trabajo, Art. 46 (contract types),
    Art. 161 (working hours 47h/week transitioning to 42h), Art. 249 (cesantias),
    Art. 306 (prima de servicios), Art. 186 (vacation 15 days)
- Identify overlapping HSE-labor law obligations (e.g., occupational health exams,
  workplace accident reporting, disability accommodations)
- Present compliance matrix to client HR and legal for validation

### Step 2: Validate Employment Contracts
- For each new hire or contract modification, validate against compliance matrix:
  - Contract type appropriateness for the nature and duration of work
  - All mandatory clauses present (job description, compensation, working hours,
    place of work, start date, termination conditions)
  - Probation period within legal limits (Chile: none by law unless CBA;
    Peru: 3 months standard; Colombia: 2 months for indefinido)
  - Compensation structure meets minimum wage and sector-specific requirements
  - Benefit entitlements correctly stated
  - Non-compete and confidentiality clauses within enforceable limits
- Log validation results with specific legal references for any findings
- Route non-conformances to Contracts & Compliance agent for legal remediation
- Maintain contract validation log with audit trail

### Step 3: Monitor Ongoing Compliance
- Track statutory filing calendar monthly:
  - Social security contributions (AFP, health insurance, ARL/mutual)
  - Tax withholding declarations (impuesto unico / renta de quinta categoria)
  - Labor authority notifications (hiring, termination, mass actions)
- Monitor working time data from Operations agent shift records:
  - Verify ordinary hours within weekly limits
  - Track overtime against daily and annual caps
  - Confirm mandatory rest periods observed (11h between shifts, weekly rest)
  - Validate exceptional shift arrangements have proper authorization
- Review leave accrual and usage:
  - Annual vacation accrual accuracy
  - Sick leave management per jurisdiction rules
  - Parental leave compliance (pre/post natal, paternal leave)
- Assess subcontractor labor arrangements for joint liability exposure
  - Verify subcontractor social security and tax compliance
  - Confirm subcontractor workers have equivalent safety protections

### Step 4: Manage Terminations and Separations
- When termination is initiated, determine applicable procedure:
  - Identify termination cause and map to legal framework
  - Calculate required notice period
  - Compute finiquito/liquidacion:
    - Chile: remuneracion pending + vacacion proporcional + indemnizacion
      anos de servicio (if applicable, 30 days per year, cap 330 days)
    - Peru: CTS + vacacion trunca + gratificacion trunca + remuneracion pending
    - Colombia: liquidacion de prestaciones + indemnizacion (if sin justa causa)
  - Prepare termination letter with legally compliant language
  - Schedule exit interview and equipment/access return
  - Submit labor authority notifications where required
  - Process final payment within statutory deadlines
  - Archive termination file with all supporting documents
- Track post-termination obligations (certificate of employment, reference letters)

### Step 5: Audit, Report, and Improve
- Conduct quarterly internal labor compliance audit
- Classify findings by severity:
  - **Critical**: Immediate legal exposure or worker safety risk
  - **Major**: Regulatory non-compliance requiring prompt remediation
  - **Minor**: Administrative gap with low risk
  - **Observation**: Best practice recommendation
- Generate corrective action plans with owners and deadlines
- Report audit results to Orchestrator for inclusion in gate review packages
- Monitor regulatory changes and update compliance matrix:
  - Subscribe to Direccion del Trabajo (Chile), SUNAFIL (Peru), MinTrabajo (Colombia)
  - Assess impact of changes on existing workforce arrangements
- Document lessons learned for application across future OR projects
- Recommend contract template improvements to Contracts & Compliance agent

## Quality Criteria

| Dimension | Weight | Target | Validation Method |
|-----------|--------|--------|-------------------|
| Technical Accuracy | 30% | All legal references current and correctly applied; zero material misstatements of law | Legal advisor review and regulatory cross-check |
| Completeness | 25% | 100% of workforce covered; all statutory obligations tracked; no blind spots | Coverage audit against workforce register |
| Consistency | 15% | Uniform application of compliance standards across jurisdictions and contract types | Cross-jurisdiction consistency review |
| Format | 10% | Professional legal-quality documents; clear tables; VSC branding | Template compliance and legal formatting standards |
| Actionability | 10% | HR team can execute compliance actions without external legal consultation for routine matters | HR team usability feedback |
| Traceability | 10% | Every compliance requirement traces to specific article of law with publication reference | Legal reference audit |

**Minimum passing score: 91%**

## Inter-Agent Dependencies

### Upstream (this skill receives from):
| Agent | Artifact | Dependency Type |
|-------|----------|-----------------|
| Contracts & Compliance | Regulatory Framework and Updates | REQUIRED -- legal basis for compliance matrix |
| Contracts & Compliance | Labor Contract Templates | REQUIRED -- standardized contract structures |
| Contracts & Compliance | Subcontractor Arrangements | RECOMMENDED -- joint liability assessment |
| HR & Talent (self) | Workforce Register from manage-recruitment-pipeline | REQUIRED -- personnel to track |
| Operations | Shift Pattern Definitions | REQUIRED -- working time validation |
| HSE | Occupational Health Requirements | RECOMMENDED -- overlapping labor-HSE obligations |
| Orchestrator | Project Jurisdiction and Scope | REQUIRED -- applicable legal frameworks |

### Downstream (this skill provides to):
| Agent | Artifact | Dependency Type |
|-------|----------|-----------------|
| Orchestrator | Labor Compliance Audit Report | REQUIRED -- for gate review and client assurance |
| Contracts & Compliance | Contract Non-Conformances | REQUIRED -- for legal remediation |
| Contracts & Compliance | Template Improvement Recommendations | RECOMMENDED -- continuous improvement |
| Execution | Termination Cost Forecasts | RECOMMENDED -- for OPEX planning (demobilization) |
| HR & Talent (self) | Compliance-Validated Contracts | REQUIRED -- for workforce file integrity |

## References

- VSC OR Knowledge Base v2.0 (`docs/architecture/_legacy/knowledge-base.md`)
- VSC Multi-Agent Architecture v2 (`docs/architecture/_legacy/multi-agent-architecture.md`)
- VSC Skills Methodology v2 (`skills/VSC_Skills_Methodology_v2.md`)
- Codigo del Trabajo de Chile (DFL 1, 2002) -- Direccion del Trabajo
- D.S. 003-97-TR (Peru) -- Ley de Productividad y Competitividad Laboral
- Codigo Sustantivo del Trabajo (Colombia) -- MinTrabajo
- Decreto Supremo 132 (Chile) -- Reglamento de Seguridad Minera (labor overlap)
- Ley 16.744 (Chile) -- Accidentes del Trabajo y Enfermedades Profesionales
- ILO Convention 155 -- Occupational Safety and Health Convention

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-25 | VSC OR System | Initial creation of manage-labor-compliance skill |
