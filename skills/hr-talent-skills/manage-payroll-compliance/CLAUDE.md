---
name: manage-payroll-compliance
description: "Manage payroll compliance including statutory deductions (AFP, ISAPRE, impuesto unico), overtime calculations, severance (indemnizacion), and Chilean labor law obligations. Triggers: 'payroll compliance', 'cumplimiento remuneraciones', 'AFP', 'ISAPRE', 'liquidacion de sueldo', 'indemnizacion'."
---

# Manage Payroll Compliance

## Skill ID: HR-C-03
## Version: 1.0.0
## Category: C - Tracking (HR & Talent Agent)
## Priority: P2 - Medium

---

## Purpose

Manage and track payroll compliance for industrial operations in Chile, ensuring correct calculation and timely remittance of statutory deductions (AFP pension, ISAPRE/FONASA health, AFC unemployment insurance, impuesto unico income tax), overtime and shift premium calculations, severance (indemnizacion) computations, and regulatory reporting to Chilean labor and tax authorities. This skill maintains a compliance monitoring system that prevents payroll errors, ensures legal obligations are met, and protects the organization from penalties.

Payroll compliance in Chilean industrial operations is highly complex and carries significant financial and legal risk:

- **Multi-layer statutory deductions**: Chilean payroll requires mandatory deductions for pension (AFP, ~10% + commission), health (ISAPRE plan or FONASA 7%), unemployment insurance (AFC, 0.6% employee + 2.4% employer for indefinite contracts), and income tax (impuesto unico, progressive rates 0-40%). Each has specific calculation rules, caps (topes imponibles), and reporting requirements that change annually.
- **Topes imponibles change annually**: The maximum pensionable and health contribution caps (topes imponibles) are expressed in UF (Unidad de Fomento, an inflation-indexed unit) and update monthly. Errors in applying current topes result in over- or under-deductions, triggering worker complaints and regulatory penalties. For 2024, the AFP tope is 81.6 UF and the AFC/health tope is 122.6 UF.
- **Industrial shift complexity**: Mining, oil & gas, and energy operations use complex shift patterns (7x7, 14x14, 4x3, exceptional shifts per Art. 38 of Codigo del Trabajo) with specific overtime calculation rules. Overtime (horas extraordinarias) must be calculated on the base plus certain allowances (not all compensation elements), and maximum overtime limits apply (2 hours/day under standard rules, different limits for exceptional shifts).
- **Gratificacion legal**: Chilean law (Art. 47-52 Codigo del Trabajo) requires employers to share profits through gratificacion legal. Two calculation methods exist (Art. 47 proportional vs. Art. 50 guaranteed, capped at 4.75 IMM), and the choice impacts both employee net pay and employer cost. Most employers elect Art. 50 for cost certainty.
- **Severance calculations (indemnizaciones)**: Chilean law provides multiple types of severance: indemnizacion por anos de servicio (30 days/year, capped at 11 years for standard contracts), indemnizacion sustitutiva del aviso previo (1 month), and any enhanced severance from collective bargaining agreements. The calculation base (ultima remuneracion mensual) has specific inclusion/exclusion rules that are frequently disputed in labor courts.
- **Regulatory reporting and penalties**: Employers must file monthly declarations (Declaracion Jurada and previred.com payments) and respond to Direccion del Trabajo fiscalizaciones. Late or incorrect payments incur reajustes (inflation adjustments), intereses (interest), and multas (fines) that can accumulate rapidly. The Superintendencia de Pensiones and Superintendencia de Salud actively audit compliance.
- **Contractor payroll subsidiary liability**: Under Ley 20.123 (subcontratacion), the principal company (empresa mandante) bears subsidiary liability (responsabilidad subsidiaria) and potentially joint liability (responsabilidad solidaria) for contractor payroll compliance. Failure to exercise the right of retention (derecho de retencion) and verification exposes the principal to direct worker claims.

This skill transforms payroll compliance from a reactive processing function into a proactive compliance management system with automated validation, regulatory change tracking, and audit-ready documentation.

---

## Intent & Specification

The AI agent MUST understand and execute the following:

1. **Statutory Deduction Compliance**: The agent must validate correct calculation of all mandatory deductions:
   - **AFP (Pension)**: Mandatory 10% contribution to the worker's chosen AFP (Administradora de Fondos de Pensiones) plus the AFP-specific commission rate (varies by AFP: Modelo 0.58%, Capital 1.44%, Cuprum 1.44%, Habitat 1.27%, PlanVital 1.16%, ProVida 1.45%, Uno 0.49% -- rates as of 2024). Applied to remuneracion imponible up to the tope imponible (81.6 UF monthly). Additional voluntary contributions (APV, APVC) tracked separately.
   - **ISAPRE/FONASA (Health)**: Mandatory 7% of remuneracion imponible (up to tope health of 122.6 UF). Workers choose ISAPRE (private) or FONASA (public). ISAPRE plans may require additional employee contribution above the 7% mandatory. Track plan selection, GES/AUGE coverage, and family coverage.
   - **AFC (Unemployment Insurance)**: Seguro de Cesantia contributions: 0.6% employee + 2.4% employer for indefinite contracts (contrato indefinido); 3.0% employer-only for fixed-term (plazo fijo) and project-based (por obra) contracts. Applied to remuneracion imponible up to the AFC tope.
   - **Impuesto Unico (Income Tax)**: Progressive tax on remuneracion tributable (remuneracion imponible minus deductions). Monthly tax brackets adjust for UTM (Unidad Tributaria Mensual). Rates: 0% (first 13.5 UTM), 4% (13.5-30 UTM), 8% (30-50 UTM), escalating to 40% (above 310 UTM).
   - **Mutual de Seguridad / ACHS**: Employer contribution for workplace accident insurance (0.93% base + additional rate based on operational risk, typically 1-3.4% for industrial operations). Track additional cotizacion extraordinaria if applicable.

2. **Remuneracion Structure Compliance**: The agent must validate the correct classification of compensation elements:
   - **Imponible vs. No Imponible**: Classify each compensation element correctly. Imponible: sueldo base, gratificacion, bonos habituales, comisiones, horas extraordinarias. No imponible (with limits): colacion, movilizacion, viatico, asignacion de desgaste herramientas (each capped at specific UF amounts), asignacion familiar (set by government).
   - **Tributable vs. No Tributable**: Some imponible items may have different tax treatment. Track deductions that reduce the taxable base (APV, insurance premiums within legal limits).
   - **Habitual vs. Esporadico**: Compensation elements paid regularly (habituales) have different legal treatment than one-time payments for severance calculation purposes.

3. **Overtime and Shift Premium Calculations**: The agent must validate complex overtime rules:
   - **Standard Overtime**: Calculated at 50% premium (recargo legal) on the ordinary hour rate. Maximum 2 hours/day. Overtime base includes sueldo base and regular allowances, but excludes gratificacion and non-habitual bonuses.
   - **Exceptional Shifts (Art. 38)**: Workers under exceptional shift arrangements (common in mining: 7x7, 14x14) have specific overtime thresholds. Verify that total hours in the cycle comply with the authorized jornada excepcional.
   - **Night Shift Premium**: Not legally mandated in Chile (unlike some other jurisdictions), but frequently included in CBAs. Track CBA-specific shift premiums.
   - **Holiday Work**: Sundays and holidays (festivos, per Ley 19.973) worked require compensatory rest or payment at recargo rate per CBA or company policy.

4. **Severance (Indemnizacion) Calculations**: The agent must correctly compute termination payments:
   - **Indemnizacion por Anos de Servicio**: 30 days of last monthly remuneration per year of service. Capped at 330 days (11 years) for standard Codigo del Trabajo contracts. CBA or individual contract may provide enhanced indemnizacion (sin tope).
   - **Indemnizacion Sustitutiva del Aviso Previo**: 30 days of last monthly remuneration when employer does not provide 30-day advance notice.
   - **Ultima Remuneracion Mensual**: Calculation base for severance. Includes: sueldo base, average of variable compensation (last 3-6 months depending on jurisdiction), regalias en especie. Excludes: non-habitual bonuses, overtime, colacion/movilizacion.
   - **Finiquito Requirements**: The finiquito (separation agreement) must be ratified before a ministro de fe (notario, DT inspector, or union president). Must include itemized severance calculation, pending vacation payment (feriado proporcional), and any other pending obligations.

5. **Regulatory Change Tracking**: The agent must monitor and implement changes in:
   - Monthly UF and UTM values (published by Banco Central / SII)
   - Annual tope imponible updates
   - AFP commission rate changes
   - Tax bracket adjustments
   - Minimum wage (ingreso minimo mensual, IMM) updates
   - New legislation affecting payroll (e.g., Ley 21.561 40-hour week impact on hourly rates)
   - Superintendencia de Pensiones and SII circulares

6. **Contractor Payroll Verification**: Under Ley 20.123:
   - Exercise derecho de informacion: request monthly payroll compliance certificates from contractors.
   - Verify contractor AFP, ISAPRE, and AFC payments through previred.com or certificate review.
   - Exercise derecho de retencion if contractor fails to demonstrate compliance.
   - Track subsidiary/joint liability exposure by contractor.

7. **Language**: Spanish (Chilean payroll and labor law terminology) for all deliverables; English summaries for international management reporting.

---

## Trigger / Invocation

```
/manage-payroll-compliance
```

### Natural Language Triggers
- "Verify payroll deductions are correctly calculated"
- "Check AFP and ISAPRE compliance for the month"
- "Calculate severance for a terminating employee"
- "Audit contractor payroll compliance under Ley 20.123"
- "Track tope imponible updates for the current year"
- "Verificar cumplimiento de cotizaciones previsionales del mes"
- "Calcular indemnizacion por anos de servicio para desvinculacion"
- "Auditar cumplimiento de remuneraciones de empresas contratistas"
- "Revisar calculo de horas extraordinarias para turnos excepcionales"
- "Generar liquidacion de sueldo modelo para nuevos cargos"
- "Verificar que el finiquito esta correctamente calculado"

### Aliases
- `/payroll-compliance`
- `/remuneraciones`
- `/cotizaciones-previsionales`

---

## Input Requirements

### Required Inputs

| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `employee_roster` | Active employees with name, RUT, role, contract type, AFP, ISAPRE/FONASA, hire date | .xlsx | HR system / mcp-sharepoint |
| `compensation_structure` | Compensation elements per role: sueldo base, bonos, asignaciones, gratificacion method | .xlsx / .docx | HR system / CBA |
| `payroll_data` | Monthly payroll data: gross pay, deductions, net pay, overtime hours, shift data | .xlsx | Payroll system / mcp-sharepoint |
| `current_parameters` | Current UF, UTM, IMM, topes imponibles, AFP commission rates, tax brackets | Text / .xlsx | SII / Superintendencia de Pensiones |

### Optional Inputs (Strongly Recommended)

| Input | Description | Default if Absent |
|-------|-------------|-------------------|
| `collective_agreements` | Active CBAs with economic provisions (bonos, turnos, indemnizaciones mejoradas) | Statutory minimums applied |
| `shift_schedules` | Approved shift patterns with authorized jornada excepcional details | Standard 45-hour week (transitioning to 40-hour) assumed |
| `contractor_payroll_certificates` | Monthly contractor compliance certificates (certificado de cumplimiento laboral y previsional) | Contractor compliance flagged for verification |
| `termination_records` | Historical finiquito calculations for consistency verification | Severance calculated from first principles |
| `dt_inspection_records` | Direccion del Trabajo inspection findings related to payroll | Compliance baseline initiated |
| `previous_audit_findings` | Internal or external payroll audit findings | Clean-sheet audit performed |
| `overtime_authorizations` | Approved overtime requests per Art. 32 of Codigo del Trabajo | All overtime verified against legal maximums |
| `apv_elections` | Employee voluntary pension contribution (APV/APVC) elections | No voluntary contributions tracked |

### Context Enrichment (Automatic)

The agent will automatically:
- Retrieve current UF, UTM, and IMM values from Banco Central de Chile and SII
- Access current AFP commission rates from Superintendencia de Pensiones
- Retrieve current impuesto unico tax brackets from SII
- Pull tope imponible values for AFP, ISAPRE, and AFC
- Access Codigo del Trabajo provisions on remuneraciones (Libro I, Titulo V)
- Retrieve Direccion del Trabajo dictamenes on overtime, gratificacion, and severance calculations
- Access Ley 21.561 (40-hour week) implementation timeline and hourly rate implications
- Retrieve previred.com integration guidelines for deduction verification

---

## Output Specification

### Deliverable 1: Payroll Compliance Report (.docx)

**Filename**: `{ProjectCode}_Payroll_Compliance_Report_v{Version}_{YYYYMMDD}.docx`

**Target Length**: 25-40 pages

**Structure**:

1. **Cover Page** -- VSC branding, project identification, reporting period
2. **Executive Summary** (2-3 pages)
   - Overall payroll compliance score (% of payroll elements correctly calculated)
   - Critical non-compliance findings requiring immediate remediation
   - Financial exposure from identified errors (over/under-deductions, penalty risk)
   - Regulatory change impacts implemented or pending
3. **Statutory Deduction Compliance** (5-8 pages)
   - AFP contribution verification: rate correctness, tope application, AFP selection accuracy
   - ISAPRE/FONASA compliance: 7% mandatory, additional voluntary, plan selection
   - AFC compliance: correct rate by contract type, tope application
   - Impuesto unico verification: bracket application, tributable base calculation
   - Mutual/ACHS compliance: correct rate application
4. **Remuneracion Structure Analysis** (3-5 pages)
   - Imponible vs. no imponible classification audit
   - Non-imponible caps (colacion, movilizacion, viatico) compliance
   - Gratificacion legal method and calculation verification
   - Variable compensation averaging for severance base
5. **Overtime and Shift Compliance** (3-5 pages)
   - Overtime calculation verification: correct base, correct premium, within legal maximum
   - Exceptional shift (jornada excepcional) compliance against DT authorization
   - Holiday and Sunday work compensation verification
   - 40-hour week transition impact analysis
6. **Severance (Indemnizacion) Compliance** (3-5 pages)
   - Active termination cases: severance calculation verification
   - Finiquito compliance: correct components, ratification before ministro de fe
   - Feriado proporcional calculation accuracy
   - Enhanced severance provisions from CBAs
7. **Contractor Payroll Compliance** (3-5 pages)
   - Certificate of compliance status by contractor
   - Subsidiary liability exposure assessment
   - Derecho de retencion exercise status
   - Non-compliant contractors requiring remediation
8. **Regulatory Change Log** (2-3 pages)
   - Parameter changes implemented during period (UF, UTM, topes, rates)
   - Upcoming legislative changes and implementation plan
   - Impact assessment of changes on payroll costs
9. **Appendices**
   - A: Current payroll parameters (UF, UTM, topes, AFP rates, tax brackets)
   - B: Detailed non-compliance findings register
   - C: Contractor compliance certificate register
   - D: Finiquito calculation worksheets

### Deliverable 2: Payroll Compliance Tracker Workbook (.xlsx)

**Filename**: `{ProjectCode}_Payroll_Compliance_Tracker_v{Version}_{YYYYMMDD}.xlsx`

**Sheets**: Parameter Register (current UF, UTM, topes, AFP rates, tax brackets with effective dates), Deduction Audit (employee-by-employee deduction verification), Overtime Audit (overtime calculation verification per employee), Severance Calculator (finiquito computation tool with all components), Contractor Compliance (contractor-by-contractor compliance status), Non-Compliance Register (all findings with severity, owner, remediation status), Cost Impact (financial impact of regulatory changes), Dashboard (compliance KPIs and trend charts)

### Deliverable 3: Compliance Dashboard (.pptx)

**Filename**: `{ProjectCode}_Payroll_Compliance_Dashboard_v{Version}_{YYYYMMDD}.pptx`

**Structure (10-12 slides)**: Overall compliance score, deduction accuracy rates, overtime compliance, severance case status, contractor compliance status, non-compliance findings summary, regulatory change timeline, financial exposure, remediation action status, next-period priorities.

---

## Procedure

### Step 1: Update Regulatory Parameters and Validate Configuration
- Retrieve current UF, UTM, IMM values from official sources (SII, Banco Central).
- Update AFP commission rates from Superintendencia de Pensiones.
- Verify topes imponibles for the current period.
- Update impuesto unico brackets based on current UTM.
- Confirm Mutual/ACHS rates for the operation.
- Validate that payroll system configuration reflects current parameters.
- Output: Updated Parameter Register, configuration validation report.

### Step 2: Audit Statutory Deductions and Remuneracion Classification
- For each employee, verify AFP contribution calculation (10% + commission, applied to imponible up to tope).
- Verify ISAPRE/FONASA deduction (7% of imponible up to health tope, plus any additional ISAPRE contribution).
- Verify AFC contribution (correct rate based on contract type, applied up to AFC tope).
- Verify impuesto unico calculation (correct tributable base, correct bracket application).
- Audit imponible/no imponible classification of all compensation elements.
- Verify non-imponible elements do not exceed legal caps (colacion, movilizacion, viatico).
- Verify gratificacion legal calculation method (Art. 47 or Art. 50) and correctness.
- Output: Deduction Audit worksheet, non-compliance findings.

### Step 3: Verify Overtime, Shift Compliance, and Special Calculations
- Audit overtime calculations: verify correct hourly base rate, 50% premium application, and compliance with 2-hour daily maximum.
- For exceptional shift workers, verify total cycle hours comply with DT-authorized jornada excepcional.
- Verify holiday and Sunday work compensation per CBA or company policy.
- Calculate 40-hour work week transition impacts on hourly rates and overtime thresholds.
- Verify special calculations: feriado proporcional for terminations, aguinaldos, and CBA-specific bonuses.
- Output: Overtime Audit worksheet, shift compliance report.

### Step 4: Manage Severance Cases and Contractor Compliance
- For active terminations, calculate and verify indemnizacion por anos de servicio, mes de aviso, feriado proporcional.
- Verify ultima remuneracion mensual calculation base (correct inclusions/exclusions).
- Ensure finiquito documents are complete and scheduled for ratification before ministro de fe.
- Review contractor compliance certificates (certificados de cumplimiento laboral y previsional).
- Assess subsidiary liability exposure for non-compliant contractors.
- Exercise derecho de retencion for contractors failing to demonstrate compliance.
- Output: Finiquito calculation worksheets, contractor compliance register, liability exposure report.

### Step 5: Generate Deliverables and Establish Monitoring Cadence
- Compile all audit findings into the Payroll Compliance Report.
- Build the Payroll Compliance Tracker Workbook with all analytical sheets.
- Generate the Compliance Dashboard for executive presentation.
- Calculate overall compliance score and trend metrics.
- Establish monthly compliance monitoring cadence aligned to payroll cycle.
- Archive all payroll compliance documentation for regulatory audit readiness (minimum 5-year retention).
- Output: All three deliverables validated and stored in project output folder.

---

## Quality Criteria

| Criterion | Weight | Description | Verification Method |
|-----------|--------|-------------|---------------------|
| Deduction Accuracy | 30% | All statutory deductions (AFP, ISAPRE, AFC, impuesto unico) correctly calculated for every employee | Independent recalculation of 20% sample using current parameters; 100% match required |
| Regulatory Currency | 20% | All parameters (UF, UTM, topes, AFP rates, tax brackets) reflect the current official values | Cross-reference with SII, Banco Central, and Superintendencia de Pensiones official publications |
| Severance Accuracy | 20% | All severance calculations use the correct base, correct years, correct caps, and comply with CBA provisions | Independent recalculation of all active severance cases; legal review of finiquito documents |
| Contractor Compliance | 15% | All active contractors have current compliance certificates; subsidiary liability exposure accurately assessed | Certificate verification against previred.com data; legal exposure calculation audit |
| Overtime Compliance | 10% | All overtime correctly calculated with proper base, premium, and within legal maximums | Recalculate 15% sample of overtime records; verify against shift authorizations |
| Documentation Completeness | 5% | All audit findings documented with evidence, severity, owner, and remediation plan | Audit trail review: every finding links to source document and verification |

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs From)

| Agent/Skill | Input Provided | Criticality | MCP Channel |
|-------------|---------------|-------------|-------------|
| `manage-employee-lifecycle` (HR & Talent) | Employee data, contract types, hire dates, termination triggers | Critical | Internal |
| `manage-industrial-relations` (HR & Talent) | CBA economic provisions (bonos, gratificacion mejorada, indemnizacion sin tope) | Critical | Internal |
| Agent Contracts & Compliance / `agent-contracts-compliance` | Contractor agreements, Ley 20.123 obligations, legal review of finiquitos | High | mcp-sharepoint |
| Agent Execution / `agent-execution` | OPEX budget for payroll cost projections | Medium | Internal |
| `model-staffing-requirements` (Operations) | Staffing plans with compensation ranges for cost projection | Medium | Internal |

### Downstream Dependencies (Outputs To)

| Agent/Skill | Output Provided | Trigger |
|-------------|----------------|---------|
| `model-opex-budget` (Execution) | Payroll cost actuals and projections including all statutory costs | Monthly / On request |
| `manage-employee-lifecycle` (HR & Talent) | Finiquito calculations for termination processing | On termination |
| `manage-industrial-relations` (HR & Talent) | Payroll compliance data supporting CBA negotiation (cost of demands) | On request |
| `audit-compliance-readiness` (Contracts & Compliance) | Payroll regulatory compliance status for audit preparation | On request |
| `orchestrate-or-program` (Orchestrator) | Payroll compliance status for OR gate reviews | On request |

### MCP Integrations

| MCP Server | Purpose | Operations |
|------------|---------|------------|
| **mcp-sharepoint** | Retrieve payroll data, store compliance reports, access CBA documents | `GET /lists/{list}`, `POST /documents/{library}` |
| **mcp-excel** | Generate payroll compliance workbook with calculation formulas | `POST /workbooks`, `PUT /sheets/{sheet}` |
| **mcp-sii** | Retrieve current UF, UTM, tax bracket values from Servicio de Impuestos Internos | `GET /indicadores/{tipo}/{fecha}` |
| **mcp-previred** | Verify AFP/ISAPRE/AFC payments and contractor compliance certificates | `GET /cotizaciones/{rut}/{periodo}` |

---

## References

- Codigo del Trabajo de Chile (DFL 1, 2002) -- Libro I, Titulo V (Remuneraciones), Titulo VII (Terminacion e Indemnizacion)
- DFL 3500 (1980) -- Sistema de Pensiones (AFP contribution rules)
- DFL 1 (2005, Ministerio de Salud) -- ISAPRE/FONASA contribution rules
- Ley 19.728 (2001) -- Seguro de Cesantia (AFC unemployment insurance)
- Ley 20.123 (2006) -- Subcontratacion (contractor payroll liability)
- Ley 21.561 (2023) -- Reduccion de Jornada Laboral (40-hour week payroll impact)
- Superintendencia de Pensiones -- AFP commission rates and tope imponible publications
- Servicio de Impuestos Internos (SII) -- Impuesto unico tables, UF/UTM values
- Direccion del Trabajo -- Dictamenes on remuneracion classification, overtime, and severance
- VSC OR Knowledge Base: `methodology/or-concepts/` operational cost and workforce sections

---

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-02-25 | VSC OR System | Initial skill creation for HR & Talent agent |
