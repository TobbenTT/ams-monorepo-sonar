---
name: manage-industrial-relations
description: "Manage industrial relations including union engagement, collective bargaining, labor disputes, and Chilean sindicato framework compliance. Triggers: 'relaciones laborales', 'sindicato', 'negociacion colectiva', 'labor relations', 'collective bargaining'."
---

# Manage Industrial Relations

## Skill ID: HR-C-02
## Version: 1.0.0
## Category: C - Tracking (HR & Talent Agent)
## Priority: P2 - Medium

---

## Purpose

Manage the full spectrum of industrial relations for industrial operations in Chile and Latin America, including union (sindicato) engagement, collective bargaining agreement (CBA) negotiation and administration, labor dispute prevention and resolution, strike contingency planning, and regulatory compliance with Chilean labor law (Codigo del Trabajo). This skill maintains a living industrial relations management system that ensures productive union-management relationships, compliant collective bargaining processes, and proactive conflict prevention.

Industrial relations management is a critical success factor for operational readiness and steady-state operations in Chile's industrial sectors:

- **Unionization is deeply embedded in Chilean industry**: Chilean labor law (Codigo del Trabajo, Libro IV) provides strong protections for unionization (sindicalizacion). In mining, unionization rates exceed 60-70%, and in oil & gas and energy sectors they typically range 40-55%. The 2016 labor reform (Ley 20.940) strengthened collective bargaining rights, including mandatory employer information disclosure, minimum negotiation floors, and expanded strike rights.
- **Strikes cause catastrophic production losses**: A legal strike (huelga legal) in a Chilean mining operation can cost USD 5-15M per day in lost production. Codelco, BHP, and Anglo American have experienced strikes lasting 1-40+ days, with total costs exceeding USD 100M per event. Proactive industrial relations management reduces strike probability by 70-80% (Fundacion SOL, 2023).
- **Collective bargaining is legally mandated on a regular cycle**: Chilean law requires employers to negotiate in good faith (buena fe) with legally constituted unions. The regulated negotiation process (negociacion colectiva reglada) has strict procedural timelines (Art. 327-380 of Codigo del Trabajo) -- failure to comply creates legal liability and permits unions to invoke extended strike rights.
- **OR project transitions are high-risk moments**: The transition from construction/commissioning (EPC workforce) to operations (permanent workforce) is a critical window for industrial relations. New operations teams forming unions during ramp-up, disputes over shift patterns (turnos), remote site conditions (faena), and bonus structures (bonos de produccion) are common flashpoints.
- **Chilean regulatory framework is specific and evolving**: The Direccion del Trabajo (DT) actively enforces labor rights through inspections and sanctions. Recent regulatory changes include: enhanced fuero (protection from dismissal) for union leaders, mandatory gender equity provisions in CBAs, telecommuting regulations (Ley 21.220), and 40-hour work week implementation (Ley 21.561, effective 2026 transition).
- **Multi-employer and inter-company relations**: Chilean operations frequently involve contractor workforces (empresas contratistas) covered by Ley 20.123 (subcontratacion). Contractor unions may initiate their own collective bargaining, and the principal company (empresa principal) bears subsidiary responsibility for labor compliance.

This skill transforms industrial relations from reactive crisis management into a strategic function that builds constructive union partnerships, manages collective bargaining proactively, and prevents disputes through early warning systems and structured engagement.

---

## Intent & Specification

The AI agent MUST understand and execute the following:

1. **Union Landscape Mapping**: The agent must maintain a comprehensive map of the union ecosystem:
   - **Union Registry**: All legally constituted unions (sindicatos) in the operation, including: union name, RUT (tax ID), type (sindicato de empresa, sindicato inter-empresa, sindicato de trabajadores independientes, sindicato transitorio), membership count, leadership (directiva sindical with names, roles, fuero dates), affiliation to national federations (CUT, CNTC, etc.).
   - **CBA Register**: All active collective bargaining agreements with: effective dates, expiry dates, key economic provisions (reajuste, bonos, beneficios), key non-economic provisions (jornada, turnos, condiciones), next negotiation start date, negotiation history (previous CBAs and outcomes).
   - **Contractor Union Map**: Unions in contractor companies operating on site, with their CBA cycles and potential impact on operations.

2. **Collective Bargaining Process Management**: The agent must support the full negotiation lifecycle per Chilean law:
   - **Pre-Negotiation Phase** (3-6 months before CBA expiry):
     - Market intelligence gathering: comparable CBA terms in the industry (other mining/energy companies in Chile).
     - Financial modeling: cost impact of union demands vs. company offer scenarios.
     - Mandate development: management negotiation parameters (floor, target, ceiling for each demand category).
     - Information disclosure preparation: financial data the company is legally required to share with the union (Art. 315 bis).
   - **Formal Negotiation Phase** (per Codigo del Trabajo procedural timeline):
     - Track the regulated process: union petition (proyecto de contrato colectivo), employer response, mediation (buenos oficios by Direccion del Trabajo), last offer, strike vote, and resolution.
     - Document all proposals, counterproposals, and agreements for legal record.
     - Model financial impact of each proposal iteration in real-time.
   - **Post-Agreement Phase**:
     - CBA implementation: ensure all agreed provisions are implemented correctly.
     - Compliance monitoring: track employer obligations under the CBA.
     - Grievance management: process and resolve complaints about CBA interpretation or application.

3. **Dispute Prevention and Early Warning**: The agent must maintain a proactive conflict prevention system:
   - **Climate Indicators**: Track workforce satisfaction surveys, absenteeism trends, grievance volumes, informal complaint patterns, turnover spikes, social media/internal communications sentiment.
   - **Risk Scoring**: Assign a monthly industrial relations risk score (Green/Yellow/Orange/Red) based on leading indicators.
   - **Early Intervention Protocols**: When indicators move to Yellow, activate engagement protocols (town halls, supervisor check-ins, union-management meetings) before issues escalate.
   - **Strike Contingency Planning**: Maintain an updated strike contingency plan (plan de contingencia) that covers: essential services maintenance during legal strike, communication protocols, security arrangements, return-to-work planning, and legal procedures.

4. **Labor Dispute Resolution**: The agent must manage formal dispute resolution processes:
   - **Internal Grievance Procedure**: Structured process for individual and collective grievances with escalation levels (supervisor > HR > site management > external mediation).
   - **Buenos Oficios (Good Offices)**: Coordination with Direccion del Trabajo mediator during collective bargaining impasse (mandatory 5-day mediation period before legal strike).
   - **Arbitration**: If parties agree, manage voluntary arbitration process (arbitraje voluntario) or mandatory arbitration for essential services.
   - **Unfair Labor Practice Defense**: Respond to union claims of anti-union practices (practicas antisindicales) filed with the Direccion del Trabajo or labor courts (Juzgados de Letras del Trabajo).

5. **Regulatory Compliance Tracking**: The agent must ensure compliance with:
   - Codigo del Trabajo (Libro IV: Negociacion Colectiva; Libro III: Organizaciones Sindicales)
   - Ley 20.940 (2016 Labor Reform -- modernized collective bargaining)
   - Ley 20.123 (Subcontratacion -- contractor labor relations)
   - Ley 21.220 (Teletrabajo -- remote work regulations)
   - Ley 21.561 (40-hour work week transition, effective April 2024-2028)
   - DS 132 (mining safety -- shift and rest period requirements)
   - Fuero sindical protections (protection from dismissal for union leaders and negotiating committee members)
   - Gender equity requirements in collective bargaining (Ley 20.940, Art. 1)

6. **Stakeholder Communication**: The agent must support structured communication:
   - Regular union-management meeting minutes and action tracking.
   - Employee communication during collective bargaining (within legal constraints on employer communications during negotiation).
   - Management briefings on industrial relations risk and negotiation strategy.
   - Regulatory authority interaction documentation (Direccion del Trabajo inspections and communications).

7. **Language**: Spanish (Chilean labor law terminology) for all deliverables and union-facing documents; English summaries for international management reporting.

---

## Trigger / Invocation

```
/manage-industrial-relations
```

### Natural Language Triggers
- "Prepare for the upcoming collective bargaining negotiation"
- "Map all unions and their CBA expiry dates"
- "Assess industrial relations risk for the operation"
- "Create a strike contingency plan"
- "Track compliance with the current collective agreement"
- "Preparar estrategia de negociacion colectiva para el sindicato"
- "Mapear todos los sindicatos de la operacion y sus convenios"
- "Evaluar riesgo de relaciones laborales para la faena"
- "Crear plan de contingencia ante huelga legal"
- "Hacer seguimiento al cumplimiento del contrato colectivo vigente"
- "Necesitamos buenos oficios con la Direccion del Trabajo"

### Aliases
- `/industrial-relations`
- `/relaciones-laborales`
- `/union-management`
- `/negociacion-colectiva`

---

## Input Requirements

### Required Inputs

| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `union_registry` | List of all unions with membership, leadership, type, and affiliation | .xlsx / .docx | HR system / Legal department |
| `active_cbas` | Current collective bargaining agreements (full text) | .pdf / .docx | Legal department / mcp-sharepoint |
| `employee_roster` | Active employees with union membership status, contract type, shift pattern | .xlsx | HR system / mcp-sharepoint |
| `organizational_structure` | Current org chart for understanding negotiation scope and impact | .xlsx / .docx | `create-org-design` / HR system |

### Optional Inputs (Strongly Recommended)

| Input | Description | Default if Absent |
|-------|-------------|-------------------|
| `previous_negotiation_records` | Historical negotiation proposals, counterproposals, and outcomes | Market benchmark data used as reference |
| `financial_data` | Company financial performance data for negotiation preparation (Art. 315 bis disclosure) | Generic industry financial benchmarks applied |
| `workforce_climate_surveys` | Employee satisfaction, engagement, and climate survey results | Climate assessment initiated from available indicators |
| `grievance_log` | Historical and current grievance records with resolution status | Grievance tracking initiated from scratch |
| `industry_cba_benchmarks` | Comparable CBA terms from similar companies in Chile | Public data from Direccion del Trabajo CBA registry used |
| `contractor_union_data` | Union and CBA information for contractor companies on site | Contractor industrial relations risk flagged for investigation |
| `dt_inspection_history` | Direccion del Trabajo inspection records and findings | Compliance review initiated without historical baseline |
| `strike_history` | Historical strike events (company and industry) with causes and outcomes | Industry strike data from public sources used |
| `shift_schedules` | Current shift patterns (turnos) and rest period arrangements | Shift compliance assessed against Codigo del Trabajo minimums |

### Context Enrichment (Automatic)

The agent will automatically:
- Retrieve current Codigo del Trabajo provisions relevant to collective bargaining (Libro III and IV)
- Access Direccion del Trabajo (DT) jurisprudence and dictamenes on collective bargaining procedures
- Pull CBA registry data from DT for industry benchmark comparisons
- Retrieve Ley 20.940 (labor reform) implementation guidelines
- Access Ley 21.561 (40-hour work week) transition timeline and requirements
- Retrieve Fundacion SOL and ENCLA (Encuesta Laboral) data on industrial relations trends
- Access COCHILCO labor relations data specific to mining sector
- Retrieve Juzgados de Letras del Trabajo (labor court) jurisprudence on key disputes

---

## Output Specification

### Deliverable 1: Industrial Relations Management Report (.docx)

**Filename**: `{ProjectCode}_Industrial_Relations_Report_v{Version}_{YYYYMMDD}.docx`

**Target Length**: 30-45 pages

**Structure**:

1. **Cover Page** -- VSC branding, project identification, reporting period
2. **Executive Summary** (3-4 pages)
   - Industrial relations health score (Green/Yellow/Orange/Red)
   - Upcoming CBA negotiations timeline and preparedness
   - Key risks and mitigation status
   - Critical actions required from management
3. **Union Landscape** (5-7 pages)
   - Union registry with membership, leadership, and affiliation
   - CBA register with key terms and expiry dates
   - Contractor union overview and coordination requirements
   - Union relationship quality assessment
4. **Collective Bargaining Status** (5-8 pages)
   - Current CBA compliance status (employer obligations met/outstanding)
   - Upcoming negotiation timeline and preparation status
   - Negotiation strategy framework (if within pre-negotiation phase)
   - Financial modeling of demand/offer scenarios
   - Benchmarking against industry CBA terms
5. **Industrial Relations Risk Assessment** (5-7 pages)
   - Leading indicator dashboard (absenteeism, grievances, turnover, climate)
   - Risk scoring by department, shift, and union
   - Emerging issues and early warning flags
   - Historical pattern analysis (seasonal, event-driven triggers)
6. **Dispute Management** (3-5 pages)
   - Active grievances and dispute resolution status
   - Direccion del Trabajo interactions (inspections, claims, buenos oficios)
   - Labor court proceedings (if any)
   - Unfair labor practice claim management
7. **Regulatory Compliance** (3-5 pages)
   - Compliance checklist against Codigo del Trabajo and special laws
   - 40-hour work week (Ley 21.561) transition status
   - Fuero sindical compliance verification
   - Subcontratacion (Ley 20.123) compliance for contractor workforce
8. **Strike Contingency Plan** (3-5 pages)
   - Contingency activation triggers and decision tree
   - Essential services maintenance plan
   - Communication protocol (internal, union, media, regulators)
   - Return-to-work planning
9. **Appendices**
   - A: Full CBA summaries
   - B: Grievance log detail
   - C: Regulatory compliance checklist
   - D: Negotiation timeline (Gantt)

### Deliverable 2: Industrial Relations Tracker Workbook (.xlsx)

**Filename**: `{ProjectCode}_IR_Tracker_v{Version}_{YYYYMMDD}.xlsx`

**Sheets**: Union Registry (all unions with details), CBA Register (all agreements with key terms and dates), Grievance Tracker (all grievances with status and resolution), Risk Dashboard (monthly risk indicators and scoring), Negotiation Tracker (proposals, counterproposals, costs), Compliance Checklist (regulatory requirements with compliance status), Action Log (all IR actions with owners and deadlines), CBA Cost Model (financial impact modeling)

### Deliverable 3: IR Risk Dashboard (.pptx)

**Filename**: `{ProjectCode}_IR_Risk_Dashboard_v{Version}_{YYYYMMDD}.pptx`

**Structure (10-12 slides)**: IR health score, union landscape summary, CBA timeline, risk heat map, grievance trends, leading indicator dashboard, upcoming negotiation preparation status, regulatory compliance scorecard, strike contingency readiness, key management actions.

---

## Procedure

### Step 1: Map Union Landscape and CBA Portfolio
- Inventory all legally constituted unions in the operation and contractor companies.
- Document union leadership (directiva sindical), membership counts, and federation affiliations.
- Compile all active CBAs with key economic and non-economic provisions.
- Map CBA expiry dates and calculate negotiation preparation windows.
- Identify contractor unions and their CBA cycles that may impact operations.
- Output: Union Registry, CBA Register, negotiation timeline.

### Step 2: Assess Industrial Relations Climate and Risk
- Analyze leading indicators: absenteeism trends, grievance volumes, workforce survey results, turnover patterns.
- Review historical dispute patterns and their triggers.
- Assess current union-management relationship quality through structured interviews.
- Calculate risk scores by department, shift, and union.
- Identify emerging issues (shift pattern complaints, bonus disputes, safety concerns driving union action).
- Output: IR Risk Assessment, risk scores, early warning report.

### Step 3: Prepare Collective Bargaining Strategy
- For upcoming negotiations, gather market intelligence on comparable CBA terms in the industry.
- Build financial models for demand/offer scenarios (cost of union demands, company counter-offer costing).
- Prepare management negotiation mandate (floor/target/ceiling for each demand category).
- Compile legally required financial disclosure (Art. 315 bis) documentation.
- Brief negotiation team on procedural requirements, timeline, and communication constraints.
- Output: Negotiation strategy document, financial models, mandate framework.

### Step 4: Manage Disputes and Regulatory Compliance
- Process active grievances through the internal grievance procedure.
- Track Direccion del Trabajo interactions, inspections, and compliance orders.
- Manage any unfair labor practice claims (practicas antisindicales).
- Verify compliance with all regulatory requirements (40-hour transition, fuero sindical, subcontratacion).
- Update strike contingency plan if risk level warrants.
- Coordinate with `agent-contracts-compliance` for legal review of labor matters.
- Output: Grievance resolution reports, compliance checklist, updated contingency plan.

### Step 5: Generate Deliverables and Establish Monitoring Cadence
- Compile all data into the Industrial Relations Management Report.
- Build the IR Tracker Workbook with all operational tracking sheets.
- Generate the IR Risk Dashboard for executive presentation.
- Establish monthly IR monitoring cadence with leading indicator review.
- Archive all industrial relations documentation with appropriate access controls (sensitive/confidential).
- Output: All three deliverables validated and stored in project output folder.

---

## Quality Criteria

| Criterion | Weight | Description | Verification Method |
|-----------|--------|-------------|---------------------|
| Legal Accuracy | 25% | All references to Chilean labor law are current and correctly applied (Codigo del Trabajo, Ley 20.940, Ley 21.561) | Legal review by labor law specialist; cross-reference with DT dictamenes |
| Union Data Completeness | 20% | All unions mapped with current leadership, membership, CBA details, and expiry dates | Cross-reference with DT union registry and internal HR records |
| Risk Assessment Validity | 20% | Risk indicators are based on verifiable data; risk scores are consistent with historical patterns | Audit leading indicators against source data; back-test risk model against historical disputes |
| Negotiation Preparedness | 15% | Financial models are arithmetically correct; market benchmarks are from verifiable sources | Independent financial model audit; benchmark source verification |
| Regulatory Compliance | 10% | All regulatory requirements identified and compliance status accurately reported | Regulatory checklist cross-reference with current legislation |
| Actionability | 10% | Reports include specific, implementable recommendations with owners and timelines | Stakeholder review: HR, legal, and operations confirm recommendations are actionable |

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs From)

| Agent/Skill | Input Provided | Criticality | MCP Channel |
|-------------|---------------|-------------|-------------|
| `create-org-design` (Operations) | Organizational structure, role definitions | High | Internal |
| `manage-employee-lifecycle` (HR & Talent) | Employee data, contract types, union membership status | Critical | Internal |
| `track-workforce-performance` (HR & Talent) | Performance data for progressive discipline context | Medium | Internal |
| Agent Contracts & Compliance / `agent-contracts-compliance` | Legal review of CBA terms, unfair labor practice defense | Critical | mcp-sharepoint |
| Agent HSE / `agent-hse` | Safety conditions, safety grievances, DS 132 compliance | High | mcp-sharepoint |
| `manage-payroll-compliance` (HR & Talent) | Payroll compliance data affecting union demands (AFP, ISAPRE, bonos) | High | Internal |

### Downstream Dependencies (Outputs To)

| Agent/Skill | Output Provided | Trigger |
|-------------|----------------|---------|
| `orchestrate-or-program` (Orchestrator) | Industrial relations risk status for OR gate reviews | On request |
| `manage-employee-lifecycle` (HR & Talent) | CBA-driven employment terms for contract drafting | On CBA execution |
| `manage-payroll-compliance` (HR & Talent) | CBA economic provisions for payroll implementation | On CBA execution |
| Agent Contracts & Compliance / `agent-contracts-compliance` | CBA terms requiring legal implementation or interpretation | Automatic |
| `create-staffing-plan` (Operations) | Union-related staffing constraints (minimum crew, shift patterns per CBA) | On request |

### MCP Integrations

| MCP Server | Purpose | Operations |
|------------|---------|------------|
| **mcp-sharepoint** | Retrieve CBA documents, store IR reports, access union communications | `GET /documents/{library}`, `POST /documents/{library}` |
| **mcp-excel** | Generate IR tracking workbook with formulas and dashboards | `POST /workbooks`, `PUT /sheets/{sheet}` |
| **mcp-dt-api** | Access Direccion del Trabajo public data: CBA registry, union registry, dictamenes | `GET /sindicatos/{rut}`, `GET /convenios/{sector}` |

---

## References

- Codigo del Trabajo de Chile (DFL 1, 2002) -- Libro III (Organizaciones Sindicales) and Libro IV (Negociacion Colectiva)
- Ley 20.940 (2016) -- Modernizacion del Sistema de Relaciones Laborales (Labor Reform)
- Ley 20.123 (2006) -- Subcontratacion (contractor labor relations)
- Ley 21.220 (2020) -- Trabajo a Distancia y Teletrabajo (remote work)
- Ley 21.561 (2023) -- Reduccion de Jornada Laboral (40-hour work week transition)
- DS 132 (2004) -- Reglamento de Seguridad Minera (mining safety, shift/rest requirements)
- Direccion del Trabajo (DT) Dictamenes on collective bargaining procedures and fuero sindical
- Fundacion SOL -- Chilean labor market research and industrial relations analysis
- ENCLA (Encuesta Laboral) -- National labor survey data
- COCHILCO -- Mining sector workforce and labor relations data
- ILO (International Labour Organization) -- Conventions on collective bargaining (C098, C154)
- VSC OR Knowledge Base: `methodology/or-concepts/` workforce readiness sections

---

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-02-25 | VSC OR System | Initial skill creation for HR & Talent agent |
