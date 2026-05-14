---
name: manage-employee-lifecycle
description: "Manage the full employee lifecycle including employment contracts (indefinido/plazo fijo/por obra), amendments, promotions, transfers, and separations under Chilean labor law. Triggers: 'employee lifecycle', 'ciclo de vida del trabajador', 'contrato de trabajo', 'desvinculacion', 'promocion', 'transferencia'."
---

# Manage Employee Lifecycle

## Skill ID: HR-C-04
## Version: 1.0.0
## Category: C - Tracking (HR & Talent Agent)
## Priority: P2 - Medium

---

## Purpose

Manage and track the complete employee lifecycle for industrial operations in Chile and Latin America, from pre-hiring and contract origination through onboarding, contract amendments, promotions, transfers, leave management, and separation (voluntary and involuntary). This skill ensures every employment event is correctly documented, compliant with Chilean labor law (Codigo del Trabajo), and integrated with downstream HR processes (payroll, performance, succession).

The employee lifecycle is the foundational HR process upon which all other workforce management functions depend. In Chilean industrial operations, lifecycle management carries specific complexity:

- **Contract type diversity and legal implications**: Chilean law defines three primary employment contract types: contrato indefinido (permanent, most common for operations staff), contrato a plazo fijo (fixed-term, maximum 1 year for standard workers, 2 years for managers/professionals), and contrato por obra o faena (project-based, terminates upon completion of the specific work). Each type has different termination rules, severance obligations, and unemployment insurance treatment. Misclassification of contract type is a top-5 labor litigation risk in Chile.
- **Automatic conversion rules**: A plazo fijo contract that is renewed for a second time, or where the worker continues working after expiration without renewal, automatically converts to contrato indefinido (Art. 159 No. 4 of Codigo del Trabajo). This is one of the most frequently violated provisions and a major source of labor disputes in project-based operations (mining construction, commissioning teams).
- **OR project transition complexity**: Operational Readiness projects require managing the transition from project-phase workforce (largely plazo fijo and por obra contracts from EPC phase) to operations-phase workforce (predominantly indefinido contracts for permanent operations team). This transition involves: contract conversion for retained EPC personnel, new hiring for operations roles, termination and settlement for departing EPC staff, and knowledge transfer handover -- all occurring within compressed timelines.
- **Probationary and trial periods**: Chilean law does not formally recognize a probationary period (periodo de prueba) for indefinido contracts -- employment protections apply from day one. Some employers use plazo fijo contracts as a de facto trial period, converting to indefinido upon satisfactory performance. This practice requires careful legal management.
- **Amendment and modification requirements**: Any change to essential contract terms (cargo, lugar de trabajo, remuneracion, jornada) requires a written contract amendment (anexo de contrato) signed by both parties. Unilateral changes by the employer are limited by the ius variandi doctrine (Art. 12 Codigo del Trabajo) and must not cause material harm to the worker.
- **Termination complexity and litigation risk**: Chile has one of the most protective labor law systems in Latin America. Unjustified termination (despido injustificado) results in a 30% surcharge on severance (indemnizacion aumentada), and if the termination is deemed discriminatory or a violation of fundamental rights (tutela laboral, Art. 489-495), additional damages of 6-11 months of remuneration may apply. In 2023, Chilean labor courts ruled in favor of workers in approximately 65% of unjustified termination claims.
- **Remote and multi-site operations**: Industrial operations in Chile frequently involve remote sites (faenas) in Atacama, Antofagasta, Tarapaca, and Magallanes regions. Employee lifecycle management must account for: site-specific shift patterns (jornada excepcional), transportation and housing provisions, hardship allowances, and regional health/safety requirements.

This skill transforms employee lifecycle management from a reactive administrative function into a proactive, compliance-driven system that ensures legal correctness, operational continuity, and seamless integration with all HR processes.

---

## Intent & Specification

The AI agent MUST understand and execute the following:

1. **Pre-Hiring and Contract Origination**: The agent must manage the transition from recruitment to employment:
   - **Position Requisition Validation**: Verify the role exists in the approved organizational structure (`create-org-design`) and staffing plan (`model-staffing-requirements`), with budget approval.
   - **Contract Type Selection**: Based on role characteristics, select the appropriate contract type:
     - Contrato indefinido: For permanent operations roles expected to continue beyond 12 months.
     - Contrato a plazo fijo: For roles with a defined end date (e.g., commissioning specialist needed for 6 months). Maximum duration: 1 year (2 years for professionals with a university degree).
     - Contrato por obra o faena determinada: For roles tied to a specific deliverable or project phase (e.g., construction supervisor for plant area X). Must clearly define the obra or faena.
   - **Contract Drafting**: Generate contract documents including all mandatory clauses per Art. 10 of Codigo del Trabajo: identification of parties, lugar de prestacion de servicios, naturaleza de los servicios, monto y forma de remuneracion, duracion y distribucion de la jornada, plazo del contrato, and other pacts agreed by the parties.
   - **Pre-Employment Checks**: Track completion of pre-employment requirements: medical examination (examen pre-ocupacional), background verification (certificado de antecedentes), right-to-work verification (for foreign workers: visa de trabajo, permiso de trabajo), and role-specific certifications.

2. **Onboarding Process Management**: The agent must track structured onboarding:
   - **Day-1 Compliance**: Contract signed within 15 days of start (Art. 9 Codigo del Trabajo; 5 days for plazo fijo <30 days or por obra). Registration in libro de remuneraciones. AFP and ISAPRE/FONASA enrollment. Reglamento Interno acknowledgement. Safety induction scheduled.
   - **Onboarding Program**: Track completion of onboarding milestones: safety induction (induccion de seguridad, mandatory per DS 132 for mining), role-specific training, systems access provisioning, facility orientation, buddy/mentor assignment, and probationary performance check-ins (30/60/90 day).
   - **Integration with Competency Tracking**: Trigger initial competency assessment via `track-competency-matrix` for the new employee.

3. **Contract Amendments and Modifications**: The agent must manage all changes to employment terms:
   - **Promotion**: Role change with increased responsibility and typically increased remuneration. Requires anexo de contrato documenting new role, new remuneration, and effective date.
   - **Lateral Transfer**: Role change without significant change in level. May involve change of location (lugar de trabajo) which requires employee consent if it causes material harm. Requires anexo de contrato.
   - **Compensation Adjustment**: Salary increase, bonus structure change, or benefit modification. Requires anexo de contrato for any change to remuneracion terms.
   - **Schedule/Shift Change**: Change in jornada de trabajo or shift pattern. Subject to ius variandi limitations (Art. 12): employer can modify start/end times by up to 60 minutes without consent; any greater change requires agreement.
   - **Location Change**: Transfer between sites (faenas). If within the same city, employer may exercise ius variandi; if to a different city/region, requires employee consent and may trigger relocation benefits.
   - **Contract Conversion**: Plazo fijo to indefinido conversion (whether automatic by law or voluntary by agreement). Must issue new contract or amendment reflecting indefinido status.

4. **Leave Management**: The agent must track all types of leave:
   - **Feriado Legal (Annual Leave)**: 15 working days per year (Art. 67 Codigo del Trabajo). Progressive vacation: 1 additional day per 3 years of service after 10 years with the same employer or 13 years total. Feriado proporcional upon termination.
   - **Licencia Medica (Medical Leave)**: Track medical leave authorizations, COMPIN/ISAPRE validation, and return-to-work clearance.
   - **Licencia Maternal/Paternal**: Pre-natal (6 weeks), post-natal (12 weeks), post-natal parental (12-18 weeks depending on modality). Paternal leave (5 days). Track fuero maternal (protection from dismissal during pregnancy + 1 year after post-natal).
   - **Permisos Legales**: Bereavement leave (7 days for spouse/civil partner, 3 days for child/parent), marriage leave (5 days), and other statutory permissions.
   - **Permisos Sindicales**: Union leave for union leaders and activities per CBA or statutory provisions.

5. **Separation Management**: The agent must manage all types of employment termination:
   - **Voluntary Resignation (Renuncia Voluntaria)**: Employee-initiated. Requires written resignation (carta de renuncia). Finiquito preparation with: pending remuneration, feriado proporcional, and any other owed amounts.
   - **Mutual Agreement (Mutuo Acuerdo)**: Both parties agree to terminate. Documented in finiquito ratified before ministro de fe.
   - **Employer-Initiated Termination**: Multiple legal grounds (causales):
     - Art. 159: Objective causes (contract expiry, obra completion, force majeure).
     - Art. 160: Serious misconduct (conducta indebida, abandono, incumplimiento grave). No severance owed but must be documented and defensible.
     - Art. 161: Business needs (necesidades de la empresa) or desahucio for exempt employees. Full severance (indemnizacion por anos de servicio + mes de aviso).
   - **Finiquito Process**: Generate finiquito with all components calculated correctly. Schedule ratification before ministro de fe (notario, DT inspector, or union president). Ensure payment within legal deadlines.
   - **Exit Process**: Track return of company assets, system access revocation, exit interview, knowledge transfer completion (if applicable), and forwarding of final documentation.

6. **Workforce Analytics**: The agent must generate lifecycle intelligence:
   - Headcount tracking by contract type, department, site, and demographics.
   - Turnover analysis: voluntary vs. involuntary, by department, tenure band, role family.
   - Contract conversion tracking (plazo fijo to indefinido).
   - Time-to-hire and time-to-productive metrics.
   - Leave utilization rates and patterns.
   - Termination cause analysis with litigation risk scoring.
   - Workforce composition trends and projections.

7. **Language**: Spanish (Chilean labor law terminology) for all employment documents, employee-facing materials, and deliverables; English summaries for international management reporting.

---

## Trigger / Invocation

```
/manage-employee-lifecycle
```

### Natural Language Triggers
- "Prepare an employment contract for a new operations supervisor"
- "Process a promotion and salary increase for an employee"
- "Handle the termination of a fixed-term contractor"
- "Track onboarding completion for new hires"
- "Generate turnover analysis for the past quarter"
- "Preparar contrato de trabajo para nuevo supervisor de operaciones"
- "Procesar promocion y aumento de sueldo para trabajador"
- "Gestionar desvinculacion de contratista a plazo fijo"
- "Hacer seguimiento al proceso de induccion de nuevos ingresos"
- "Generar analisis de rotacion del ultimo trimestre"
- "Calcular feriado proporcional para finiquito"
- "Verificar que los contratos a plazo fijo no se convirtieron automaticamente en indefinidos"

### Aliases
- `/employee-lifecycle`
- `/ciclo-vida-empleado`
- `/contracts-management`

---

## Input Requirements

### Required Inputs

| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `organizational_structure` | Current org chart with approved roles and headcount | .xlsx / .docx | `create-org-design` / HR system |
| `employee_roster` | Active employees with full employment details: name, RUT, role, contract type, hire date, site, department, supervisor, compensation | .xlsx | HR system / mcp-sharepoint |
| `contract_templates` | Standard employment contract templates for each contract type (indefinido, plazo fijo, por obra) | .docx | Legal department / mcp-sharepoint |
| `lifecycle_event_log` | Record of all employment events (hires, promotions, transfers, terminations) with dates and details | .xlsx | HR system / mcp-sharepoint |

### Optional Inputs (Strongly Recommended)

| Input | Description | Default if Absent |
|-------|-------------|-------------------|
| `collective_agreements` | Active CBAs affecting employment terms (enhanced severance, shift arrangements, benefits) | Statutory minimums applied |
| `reglamento_interno` | Company internal regulations (Reglamento Interno de Orden, Higiene y Seguridad) | Standard VSC template applied |
| `onboarding_checklist` | Site-specific onboarding program with milestones and timelines | VSC standard onboarding checklist applied |
| `leave_records` | Historical leave data (feriado, licencia medica, permisos) | Leave tracking initiated from scratch |
| `termination_records` | Historical finiquito records for trend analysis | Clean-sheet analysis |
| `recruitment_pipeline` | Pending offers and expected start dates for workforce planning integration | Only current employees tracked |
| `staffing_plan` | Approved staffing plan with hiring timeline | Positions validated against org structure only |
| `performance_data` | Performance ratings for promotion/PIP termination decisions | Lifecycle events processed without performance overlay |

### Context Enrichment (Automatic)

The agent will automatically:
- Retrieve Codigo del Trabajo provisions on employment contracts (Libro I, Titulos I-VII)
- Access Direccion del Trabajo dictamenes on contract types, amendments, and termination
- Pull current statutory values: ingreso minimo mensual (IMM), UF, feriado calculations
- Retrieve Art. 159-161 termination cause requirements and judicial interpretation
- Access Ley 21.561 (40-hour week) implications for employment contract terms
- Retrieve pre-employment medical examination requirements (DS 132 for mining, DS 594 general)
- Access visa and work permit requirements for foreign workers (Ley 21.325, Ley de Migracion)
- Retrieve best-practice onboarding programs for industrial operations

---

## Output Specification

### Deliverable 1: Employee Lifecycle Management Report (.docx)

**Filename**: `{ProjectCode}_Employee_Lifecycle_Report_v{Version}_{YYYYMMDD}.docx`

**Target Length**: 30-45 pages

**Structure**:

1. **Cover Page** -- VSC branding, project identification, reporting period
2. **Executive Summary** (2-3 pages)
   - Workforce headcount and composition snapshot
   - Key lifecycle events during the period (hires, promotions, terminations)
   - Contract compliance status (plazo fijo conversion risk, overdue amendments)
   - Turnover analysis summary
   - Critical actions required
3. **Workforce Composition** (5-7 pages)
   - Headcount by contract type (indefinido, plazo fijo, por obra), department, site, and demographics
   - Contract type distribution analysis and trends
   - Plazo fijo tracking: contracts approaching 1-year limit or second renewal
   - Por obra contracts: status against defined obra/faena scope
   - Foreign worker visa/permit status
4. **Hiring and Onboarding** (5-7 pages)
   - New hires during period: roles, contract types, start dates
   - Pre-employment check completion status
   - Contract signing compliance (within 15/5 day legal requirement)
   - Onboarding program completion rates and milestone tracking
   - Time-to-productive analysis for new hires
   - 30/60/90 day performance check-in results
5. **Contract Amendments** (3-5 pages)
   - Promotions processed: role changes, compensation adjustments, effective dates
   - Lateral transfers: location changes, role changes, consent documentation
   - Contract conversions: plazo fijo to indefinido (automatic and voluntary)
   - Compensation adjustments: salary reviews, CBA-driven adjustments
   - Schedule/shift modifications and ius variandi compliance
6. **Leave Management** (3-5 pages)
   - Feriado legal utilization rates by department
   - Feriado accrual balance (liability tracking)
   - Licencia medica patterns and COMPIN/ISAPRE validation status
   - Maternal/paternal leave tracking and fuero status
   - Permisos sindicales utilization
7. **Separations** (5-7 pages)
   - Terminations during period: voluntary, mutual agreement, employer-initiated
   - Termination cause analysis (Art. 159, 160, 161 distribution)
   - Finiquito compliance: correct calculations, timely ratification
   - Turnover analysis: rate, tenure distribution, department comparison, root cause
   - Litigation risk assessment for employer-initiated terminations
   - Exit interview themes and insights
8. **Compliance Dashboard** (2-3 pages)
   - Contract compliance score (% of workforce with current, correctly-typed contracts)
   - Amendment compliance (% of changes with signed anexo)
   - Onboarding compliance (% of new hires with complete onboarding)
   - Leave compliance (% of leave properly documented)
   - Termination compliance (% of finiquitos correctly processed)
9. **Appendices**
   - A: Employee roster snapshot
   - B: Lifecycle event log detail
   - C: Contract template library index
   - D: Onboarding checklist template

### Deliverable 2: Employee Lifecycle Tracker Workbook (.xlsx)

**Filename**: `{ProjectCode}_Employee_Lifecycle_Tracker_v{Version}_{YYYYMMDD}.xlsx`

**Sheets**: Employee Master (full employee data with contract details), Lifecycle Events (all events with dates, types, and documentation status), Contract Alerts (plazo fijo expiry warnings, overdue amendments, conversion triggers), Onboarding Tracker (new hire onboarding milestone completion), Leave Register (all leave events by employee), Separation Register (terminations with cause, severance, finiquito status), Turnover Analysis (rates, trends, demographics), Dashboard (lifecycle KPIs and charts)

### Deliverable 3: Lifecycle Dashboard (.pptx)

**Filename**: `{ProjectCode}_Employee_Lifecycle_Dashboard_v{Version}_{YYYYMMDD}.pptx`

**Structure (10-12 slides)**: Workforce snapshot, headcount by contract type, hires and departures trend, onboarding completion, contract compliance alerts, leave utilization, turnover rates and trends, termination cause distribution, compliance scorecard, upcoming actions.

---

## Procedure

### Step 1: Establish Employee Master Data and Contract Portfolio
- Build or update the employee master database from HR system data.
- Classify all employees by contract type (indefinido, plazo fijo, por obra) and verify accuracy.
- Map contract terms to legal requirements: start dates, end dates (for plazo fijo/por obra), renewal history.
- Identify plazo fijo contracts approaching automatic conversion triggers.
- Verify all contracts contain mandatory clauses per Art. 10 of Codigo del Trabajo.
- Flag foreign workers and verify visa/work permit currency.
- Output: Validated Employee Master, contract compliance alert list.

### Step 2: Process Lifecycle Events and Track Onboarding
- Process new hires: generate contracts per approved position, track pre-employment checks, and initiate onboarding.
- Verify contract signing within legal deadlines (15 days for standard; 5 days for short-term).
- Track onboarding milestone completion: safety induction, role training, system access, mentor assignment.
- Trigger competency assessment initiation for new employees.
- Process promotions, transfers, and compensation adjustments: generate anexos de contrato with correct terms.
- Track contract conversions (plazo fijo to indefinido) and ensure documentation reflects new status.
- Output: Lifecycle event log, onboarding tracker, contract amendments.

### Step 3: Manage Leave and Track Balances
- Record all leave events: feriado legal, licencia medica, maternal/paternal, permisos legales, permisos sindicales.
- Calculate feriado legal accrual and utilization, including progressive vacation for tenured employees.
- Verify licencia medica documentation (COMPIN/ISAPRE validation, return-to-work medical clearance).
- Track fuero maternal status for eligible employees (protection from dismissal).
- Calculate feriado proporcional liability for financial reporting.
- Output: Leave Register, feriado balance report, fuero status tracker.

### Step 4: Manage Separations and Ensure Compliance
- For voluntary resignations: verify written carta de renuncia, calculate finiquito components.
- For mutual agreement: prepare finiquito document with agreed terms.
- For employer-initiated terminations: verify legal cause (causal), prepare carta de despido with correct legal references, calculate severance.
- Generate complete finiquito with all components: pending remuneration, feriado proporcional, indemnizacion (if applicable), mes de aviso (if applicable), CBA-specific provisions.
- Schedule finiquito ratification before ministro de fe.
- Coordinate exit process: asset return, system access revocation, exit interview, knowledge transfer.
- Assess litigation risk for each employer-initiated termination and flag high-risk cases for legal review.
- Output: Finiquitos, separation documentation, litigation risk assessment, exit interview data.

### Step 5: Generate Analytics, Deliverables, and Compliance Reports
- Calculate workforce analytics: turnover rates (voluntary/involuntary), tenure distributions, contract mix evolution.
- Compile lifecycle data into the Employee Lifecycle Management Report.
- Build the Employee Lifecycle Tracker Workbook with all operational sheets.
- Generate the Lifecycle Dashboard for executive presentation.
- Calculate compliance scores across all lifecycle dimensions.
- Archive all employment documentation for legal compliance (minimum 5-year retention, finiquitos permanently).
- Output: All three deliverables validated and stored in project output folder.

---

## Quality Criteria

| Criterion | Weight | Description | Verification Method |
|-----------|--------|-------------|---------------------|
| Contract Compliance | 25% | Every employee has a current, correctly-typed contract with all mandatory clauses; no plazo fijo contracts in automatic conversion violation | 100% contract audit: verify type, clauses, dates, renewal history |
| Termination Legality | 25% | Every employer-initiated termination uses a valid legal cause with supporting evidence; finiquitos correctly calculated and timely ratified | Legal review of all terminations; independent finiquito recalculation |
| Lifecycle Event Tracking | 20% | Every employment event (hire, promotion, transfer, termination) is documented with signed contract/amendment and recorded in the lifecycle event log | Event log audit: 100% of events have supporting documentation |
| Onboarding Completeness | 10% | 100% of new hires complete all onboarding milestones within defined timelines; safety induction completed before operational assignment | Onboarding tracker verification; safety induction records cross-check |
| Leave Accuracy | 10% | Leave balances correctly calculated including progressive vacation; fuero status accurately tracked | Independent leave balance recalculation for 15% sample |
| Analytics Reliability | 10% | All workforce metrics (turnover, headcount, contract mix) are arithmetically correct and based on complete data | Spot-check: recalculate 10% of metrics from source data |

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs From)

| Agent/Skill | Input Provided | Criticality | MCP Channel |
|-------------|---------------|-------------|-------------|
| `create-org-design` (Operations) | Approved organizational structure, role definitions, headcount | Critical | Internal |
| `model-staffing-requirements` (Operations) | Staffing plan with hiring timeline, role specifications | Critical | Internal |
| `track-workforce-performance` (HR & Talent) | Performance ratings triggering promotions or PIPs leading to termination | High | Internal |
| `track-competency-matrix` (Operations) | Competency assessments for onboarding completion and role readiness | Medium | Internal |
| Agent Contracts & Compliance / `agent-contracts-compliance` | Legal review of contract terms, termination causes, finiquito documents | Critical | mcp-sharepoint |
| Agent HSE / `agent-hse` | Safety induction requirements, pre-employment medical examination standards | High | mcp-sharepoint |
| `manage-industrial-relations` (HR & Talent) | CBA provisions affecting employment terms, union membership status | High | Internal |

### Downstream Dependencies (Outputs To)

| Agent/Skill | Output Provided | Trigger |
|-------------|----------------|---------|
| `manage-payroll-compliance` (HR & Talent) | Employee data for payroll processing: new hires, amendments, terminations | On every lifecycle event |
| `track-workforce-performance` (HR & Talent) | Employee roster for performance cycle enrollment | On hire / On promotion |
| `track-competency-matrix` (Operations) | New employee data for initial competency assessment | On hire |
| `plan-succession` (HR & Talent) | Departure data, transfer data, tenure data for succession risk analysis | Automatic |
| `manage-industrial-relations` (HR & Talent) | Union membership changes, headcount data for negotiation preparation | On request |
| `orchestrate-or-program` (Orchestrator) | Workforce readiness status (hiring completion, onboarding progress) for OR gate reviews | On request |
| `model-opex-budget` (Execution) | Headcount actuals and projections for OPEX modeling | Monthly |

### MCP Integrations

| MCP Server | Purpose | Operations |
|------------|---------|------------|
| **mcp-sharepoint** | Retrieve/store contracts, amendments, finiquitos, onboarding documents | `GET /documents/{library}`, `POST /documents/{library}` |
| **mcp-excel** | Generate lifecycle tracker workbook with formulas and dashboards | `POST /workbooks`, `PUT /sheets/{sheet}` |
| **mcp-hris** | Retrieve employee master data, submit lifecycle events, access attendance data | `GET /employees`, `POST /events/{type}`, `PUT /employees/{id}` |
| **mcp-docgen** | Generate employment contracts and amendments from templates | `POST /documents/generate`, `GET /templates/{type}` |

---

## References

- Codigo del Trabajo de Chile (DFL 1, 2002) -- Complete labor code, particularly:
  - Libro I, Titulo I: Contrato Individual de Trabajo (Art. 7-12)
  - Libro I, Titulo II: Jornada de Trabajo (Art. 21-40 bis)
  - Libro I, Titulo IV: Feriados (Art. 66-76)
  - Libro I, Titulo V: Remuneraciones (Art. 41-63)
  - Libro I, Titulo VII: Terminacion del Contrato (Art. 159-178)
  - Libro II, Titulo III: Proteccion a la Maternidad (Art. 194-208)
- Ley 21.561 (2023) -- Reduccion de Jornada Laboral (40-hour week transition)
- Ley 21.325 (2021) -- Ley de Migracion y Extranjeria (work permits for foreign workers)
- DS 132 (2004) -- Reglamento de Seguridad Minera (mining safety, pre-employment requirements)
- DS 594 (1999) -- Reglamento sobre Condiciones Sanitarias y Ambientales Basicas en los Lugares de Trabajo
- Direccion del Trabajo -- Dictamenes on employment contracts, amendments, termination, and leave
- Superintendencia de Seguridad Social (SUSESO) -- Licencia medica and leave administration guidelines
- VSC OR Knowledge Base: `methodology/or-concepts/` workforce transition and operational readiness sections

---

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-02-25 | VSC OR System | Initial skill creation for HR & Talent agent |
