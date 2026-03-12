---
name: validate-engineering-calculations
description: "Validate engineering calculations across disciplines including process sizing, mechanical design, structural analysis, electrical load studies, and instrument sizing. Triggers: 'validate calculations', 'check engineering calcs', 'calculation review', 'validar calculos de ingenieria', 'revision de calculos', 'verificacion de diseno'."
---

# Validate Engineering Calculations

## Skill ID: ENGD-16

## Version: 1.0.0

## Category: B - Analysis

## Priority: P1 - Critical

---

## Purpose

Provides a comprehensive framework for validating engineering calculations across all disciplines -- process sizing, mechanical design, structural analysis, electrical load studies, instrument sizing, and civil/geotechnical design -- ensuring that calculations follow approved methodologies, use correct and traceable input data, apply appropriate design margins, and produce results within acceptable ranges. This skill is the quality assurance gate that prevents design errors from propagating into specifications, procurement, fabrication, and construction.

Engineering calculations are the quantitative foundation of every design decision. A single calculation error can cascade through the entire design chain: an incorrect equipment sizing leads to wrong specifications, wrong procurement, wrong fabrication, wrong installation, and ultimately equipment that cannot perform its intended function. In the worst case, calculation errors create safety hazards -- an under-designed pressure vessel, an undersized relief valve, an overloaded structural member, or an inadequate electrical protection system.

The cost of calculation errors escalates exponentially with the stage at which they are discovered. An error caught during independent check costs hours to correct. The same error discovered during procurement costs thousands (re-specification, vendor re-engineering). Found during construction, it costs tens of thousands (rework, schedule delay). Found during commissioning or operation, it can cost millions and potentially lives. Studies by IPA (Independent Project Analysis) and CII (Construction Industry Institute) consistently show that 25-40% of engineering rework is caused by calculation errors that were not caught during the review process.

This skill does not perform engineering calculations itself -- that remains the responsibility of the discipline engineer. Rather, it provides the systematic framework for independent verification: ensuring that every calculation has been checked by a qualified reviewer, that input data is traceable, that methodology is appropriate, that software is validated, that design margins are adequate, and that results are consistent with the overall design. The skill manages the calculation register, tracks the check/approval status of every calculation, and generates quality metrics on calculation accuracy and review timeliness.

---

## Intent & Specification

The AI agent MUST understand that:

1. **Independent Check is Mandatory**: Every engineering calculation that forms the basis for equipment sizing, specification, or safety system design must be independently checked by a qualified engineer who did not perform the original calculation. This is a fundamental engineering quality assurance requirement, not optional.
2. **Input Data Traceability is Essential**: Every input value used in a calculation must be traceable to a source document (process simulation, data sheet, geotechnical report, vendor data, code requirement). Calculations using assumed or unverified inputs must be clearly flagged and tracked until confirmed.
3. **Design Margins Must Be Explicit and Justified**: Every design margin applied (process contingency, mechanical design factor, safety factor, future expansion allowance) must be explicitly stated, quantified, and justified. Over-design is as problematic as under-design -- it increases cost unnecessarily and can mask operational problems.
4. **Software Validation is Required for Computer-Aided Calculations**: Calculations performed using engineering software (HYSYS, CAESAR II, ETAP, STAAD, etc.) must document the software version, license validity, input file, and validation basis (comparison against hand calculation or known benchmark).
5. **The Calculation Register is the Master Record**: Every calculation document must be registered, tracked through the check/approve lifecycle, and archived. The calculation register provides the quality evidence trail that demonstrates design adequacy to regulators, insurers, and future operators.

---

## Trigger / Invocation

```
/validate-engineering-calculations
```

### Natural Language Triggers
- "Validate engineering calculations for [system/equipment]"
- "Run calculation check for [discipline] deliverables"
- "Review the calculation register status for [project/discipline]"
- "Validar calculos de ingenieria para [sistema/equipo]"
- "Verificar estado del registro de calculos para [proyecto/disciplina]"
- "Revisar calculos de diseno de [disciplina]"

---

## Input Requirements

### Required Inputs

| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `calculation_documents` | Engineering calculation reports/memos for validation | .pdf / .xlsx / .docx | Engineering disciplines |
| `calculation_register` | Master register of all engineering calculations with status tracking | .xlsx | Engineering Management / Doc Control |
| `design_basis_document` | Project design basis with site conditions, codes, design criteria | .docx / .pdf | Engineering Management |
| `source_data_documents` | Documents providing input values (process simulation, vendor data, geotech report) | Various | Engineering disciplines / Vendors |
| `applicable_codes_standards` | Code editions and standards applicable to the calculations being validated | Reference | Engineering Management |

### Optional Inputs

| Input | Description | Default |
|-------|-------------|---------|
| `software_validation_records` | Validation documentation for engineering software used | Request from discipline engineer if software-based calculation |
| `previous_project_benchmarks` | Similar equipment sizing results from previous projects for reasonableness check | Use VSC internal benchmarks database |
| `vendor_technical_data` | Manufacturer performance curves, capacity tables, selection software outputs | Request when calculation references vendor data |

### Context Enrichment

The agent should automatically:
- Cross-reference input data values used in calculations against their stated source documents to verify transcription accuracy
- Check that the code editions referenced in calculations match the project codes and standards register (no obsolete editions)
- Compare calculated equipment sizes against industry rules of thumb and previous project benchmarks for reasonableness
- Verify that design margins applied are within the ranges specified in the project design basis document
- Retrieve the qualification records of the checker/approver to confirm they have appropriate discipline expertise for the calculation type

---

## Output Specification

### Document: Calculation Validation Report (.docx)

**Filename**: `VSC_CalcValidation_{ProjectCode}_{Discipline}_{CalcRef}_{Rev}_{Date}.docx`

### Structure

#### Section 1: Validation Summary
- Calculation reference number, title, discipline, engineer, checker, approver
- Validation result: Approved / Approved with Comments / Rejected
- Summary of findings: number of errors, number of comments, number of recommendations
- Critical findings requiring correction before approval

#### Section 2: Input Data Verification
- Table of all input values used in the calculation
- Source document for each input value (with specific page/table reference)
- Verification result: Confirmed / Discrepancy Found / Unverified (source not available)
- Input data traceability matrix

#### Section 3: Methodology Assessment
- Calculation methodology description and assessment of appropriateness
- Code/standard compliance verification
- Design margin review: margins applied vs. project design basis requirements
- Software validation status (if computer-aided)

#### Section 4: Results Verification
- Independent check calculation or benchmark comparison
- Results comparison: original vs. check (within acceptable tolerance)
- Reasonableness assessment against industry norms and previous projects
- Sensitivity analysis on key assumptions (where applicable)

#### Section 5: Design Margin Summary
- All design margins applied with justification
- Cumulative margin assessment (preventing excessive over-design from stacked margins)
- Comparison against project design basis margin requirements

#### Section 6: Findings and Recommendations
- Itemized findings with severity (Critical / Major / Minor / Observation)
- Required corrective actions with responsible party and due date
- Recommendations for improvement (not requiring correction)

### Key Metrics

| Metric | Description | Target | Measurement |
|--------|-------------|--------|-------------|
| Calculation Check Rate | % of calculations independently checked | 100% of safety-critical; >95% of all | Calculation register audit |
| First-Pass Approval Rate | % of calculations approved without revision | >80% | Calculation register tracking |
| Input Data Traceability | % of input values with confirmed source documents | 100% | Input verification audit |
| Review Cycle Time | Days from calculation issue to check completion | <10 working days | Calculation register dates |
| Error Detection Rate | % of submitted calculations with errors found during check | Trending downward over project lifecycle | Calculation register analysis |

---

## Procedure

### Step 1: Register and Classify Calculations

- Ensure every engineering calculation is entered in the calculation register with: unique reference number, title, discipline, originating engineer, classification (safety-critical / primary design / secondary / supporting), and planned issue date
- Classify each calculation by validation rigor required: safety-critical calculations (relief valves, structural integrity, electrical protection) require full independent calculation; primary design calculations (equipment sizing, pipe sizing) require detailed check; secondary calculations require review and spot-check
- Assign a qualified checker for each calculation; the checker must not be the originating engineer, must be qualified in the relevant discipline, and should have comparable or greater experience level for safety-critical calculations
- Verify that the calculation references the current project design basis document and the applicable code editions listed in the project codes and standards register
- Flag calculations that depend on unconfirmed input data (e.g., pending vendor data, pending geotechnical results) as "preliminary" and schedule re-validation when confirmed data becomes available
- Prioritize validation sequence based on the engineering schedule: calculations on the critical path for procurement or construction should be validated first
- Generate a validation schedule showing planned check dates for all outstanding calculations, aligned with the overall engineering schedule

### Step 2: Verify Input Data and Assumptions

- For each input value in the calculation, trace it to its source document (process simulation run file, vendor data sheet, geotechnical report, site survey data, code table)
- Verify that the input value in the calculation exactly matches the source document value (check units, magnitude, sign convention, reference conditions)
- Identify any assumed values (not from a verified source) and assess whether the assumption is reasonable; document the basis for each assumption and flag for confirmation
- Check that environmental design conditions (ambient temperature range, wind load, seismic zone, corrosion allowances) match the project design basis document
- Verify that process design conditions (temperature, pressure, flow, composition) correspond to the correct design case (normal, maximum, upset, emergency) as required by the applicable code
- Confirm that material properties used (yield strength, modulus, density, corrosion rate) correspond to the specified material grade and temperature
- Compile the input data verification results in a structured table with status per input item: Confirmed / Discrepancy / Unverified

### Step 3: Assess Methodology and Code Compliance

- Review the calculation methodology against the requirements of the applicable code or standard (e.g., ASME VIII for pressure vessels, API 520/521 for relief valves, AS/NZS 3600 for concrete structures, IEC 61363 for electrical load analysis)
- Verify that the calculation follows the code methodology step by step, with no steps omitted or shortcuts taken that are not permitted by the code
- For computer-aided calculations, verify software name, version, and license validity; confirm that the software is on the project's approved software list; check that the software model correctly represents the physical system
- Review all design margins applied: safety factors, design factors, process contingency, future expansion allowance; verify each margin is explicitly stated, quantified, and consistent with the project design basis
- Check for "margin stacking" where multiple conservative assumptions compound to produce an excessively over-designed result; flag cumulative margin >40% above actual expected duty unless specifically justified
- Assess whether the calculation scope is complete: all operating cases analyzed, all load combinations considered, all failure modes addressed as required by the code
- Document the methodology assessment results with specific code clause references for any non-compliance findings

### Step 4: Perform Independent Verification of Results

- For safety-critical calculations, perform a full independent calculation using the verified input data and approved methodology; compare the original result against the independent result -- they must agree within an acceptable tolerance (typically 5% for process calculations, 3% for structural calculations, 1% for protection system calculations)
- For primary design calculations, perform a simplified independent check (hand calculation, spreadsheet, or different software tool) to verify the order of magnitude and direction of the result
- For secondary calculations, spot-check critical result values against industry rules of thumb and benchmarks from similar projects
- Compare equipment sizes and ratings against typical industry ranges for the application (e.g., pump head and efficiency vs. typical curves, heat exchanger area vs. duty and LMTD, motor size vs. driven equipment requirement)
- If the original and check results disagree beyond acceptable tolerance, investigate the source of the discrepancy: different input data, different methodology interpretation, calculation error, or software modeling difference
- Document the verification results with the comparison table showing original vs. check values for all key output parameters
- Record any errors discovered, classify by severity, and require correction before approval

### Step 5: Issue Validation Report and Update Register

- Compile the validation report following the output specification structure: summary, input verification, methodology assessment, results verification, margin summary, findings
- Classify findings by severity: Critical (design inadequacy, safety concern -- must correct before proceeding), Major (significant error affecting sizing or specification -- must correct), Minor (non-critical discrepancy -- should correct), Observation (improvement suggestion -- discretionary)
- Route the validation report to the originating engineer for response to findings; set a response deadline based on severity (Critical: 48 hours, Major: 1 week, Minor: 2 weeks)
- Upon satisfactory resolution of all Critical and Major findings, update the calculation status in the register to "Checked" (or "Approved" if checker has approval authority)
- For calculations requiring correction, track the revision through the re-check process until approved
- Update the calculation register with: check date, checker name, validation result, number and severity of findings, current status
- Generate calculation quality metrics for the engineering status report: check completion rate, first-pass approval rate, common error types, review cycle time

---

## Failure Modes & Common Pitfalls

| Failure Mode | Root Cause | Prevention Strategy |
|-------------|-----------|-------------------|
| Calculation not checked before specification issued | Schedule pressure bypasses check process; no hold point in document workflow | Specification cannot be issued at IFC status without calculation check certificate; system-enforced hold point |
| Input data error propagated through calculation | Transcription error from source document; outdated source data used | Mandatory input data verification step with source document cross-reference; digital data transfer where possible |
| Wrong code edition used for methodology | Engineer using personal copy of older code edition; project codes register not checked | Automated code edition verification against project register; controlled code library |
| Software model does not represent physical system | Oversimplified model; incorrect boundary conditions; wrong configuration | Software model review as part of calculation check; comparison against hand calculation for validation |
| Design margins stacked excessively | Multiple engineers adding margins independently without coordination | Central design margin register; cumulative margin review at system level; design margin policy in design basis |
| Checker rubber-stamps without genuine review | Checker overloaded; social pressure from originator; insufficient time allocated | Check time explicitly budgeted in manhour plan; checker must document their verification work; random audit of check quality |
| Preliminary calculations not revalidated when confirmed data arrives | Tracking system does not flag preliminary calculations for revalidation | Calculation register flags preliminary status; automatic notification when dependent data is confirmed |

---

## Escalation Protocols

| Trigger | Timeline | Escalation Path |
|---------|----------|----------------|
| Critical finding in safety-critical calculation | Immediate | Lead Discipline Engineer --> Engineering Manager --> HSE Agent for safety impact assessment |
| Calculation required for procurement not checked within 5 days of need date | 24 hours | Discipline Engineer --> Lead Discipline Engineer --> Engineering Manager for resource allocation |
| Checker identifies fundamental methodology error affecting multiple calculations | 48 hours | Lead Discipline Engineer --> Engineering Manager; scope all affected calculations for re-check |
| Software validation expired or software not on approved list | Immediate | Stop use; Lead Discipline Engineer --> Engineering Manager --> IT for license/validation resolution |
| Input data discrepancy between calculation and source document for safety system | Immediate | Lead Discipline Engineer investigates; Engineering Manager notified; HSE Agent consulted on safety impact |
| Calculation check completion rate below 80% with IFC milestone within 30 days | 1 week | Engineering Manager --> Project Manager for resource augmentation or schedule impact assessment |

---

## Quality Criteria

| Dimension | Weight | Target | Measurement |
|-----------|--------|--------|-------------|
| Technical Accuracy | 30% | All checked calculations free of critical and major errors; independent verification within tolerance | Calculation register: zero unresolved Critical/Major findings at IFC |
| Completeness | 25% | 100% of safety-critical calculations checked; >95% of all calculations checked before IFC | Calculation register completion metrics |
| Consistency | 15% | Same validation rigor applied across all disciplines; consistent margin policy | Cross-discipline audit of validation reports; margin register review |
| Format | 10% | Validation reports follow standard structure; findings clearly classified | Template compliance check; peer review of validation report quality |
| Actionability | 10% | Findings are specific, actionable, and include correction requirements with deadlines | Originating engineer response rate and first-time resolution rate |
| Traceability | 10% | Every input verified to source; every methodology referenced to code clause; every result compared to benchmark | Input verification matrix completeness; code reference audit |

---

## Inter-Agent Dependencies

### Inputs From

| Agent/Skill | Input Provided | Criticality |
|-------------|---------------|-------------|
| All Engineering Disciplines | Calculation documents for validation | Critical |
| `agent-operations` | Process design data, operating parameters, process simulation results | Critical |
| `agent-hse` | Safety factors, safety-critical calculation classification, hazard assessment data | High |
| `create-technical-specifications` (ENGD skill) | Specifications requiring validated calculation support | High |
| `manage-engineering-deliverables` (ENGD skill) | EDDR identifying calculations required and their schedule priority | Medium |

### Outputs Consumed By

| Agent/Skill | Output Consumed | Usage |
|-------------|----------------|-------|
| `create-technical-specifications` (ENGD skill) | Validated design parameters for incorporation into specifications | Equipment sizing, material selection, design conditions |
| `agent-execution` | Design adequacy assurance for construction and commissioning | Construction confidence; reduced rework risk |
| `agent-orchestrator` | Calculation quality metrics for engineering status reporting | Quality assurance metrics in project governance |
| `generate-engineering-status-report` (ENGD-15) | Calculation check completion rate, finding statistics | Engineering quality metrics in status report |
| `create-engineering-dossier` (ENGD-18) | Validated and approved calculations for handover dossier | Permanent engineering record |

---

## References

### Methodology References
- VSC OR Playbook -- Engineering Quality Assurance section
- VSC Engineering Management Procedures -- Calculation Preparation, Check, and Approval Guide
- VSC Design Basis Template -- Standard design margins by discipline
- VSC Calculation Register Template -- Standard register format and field definitions

### Industry Standards
- ASME VIII Division 1/2 -- Pressure Vessel Design (calculation methodology requirements)
- API 520/521 -- Sizing, Selection, and Installation of Pressure-Relieving Devices
- IEC 61363 -- Electrical installations of ships and mobile and fixed offshore units -- Electrical load analysis
- Eurocodes / AISC / AS/NZS structural design codes (project-specific)
- ISA-75 -- Control Valve Sizing (calculation methodology)

---

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-25 | VSC OR System | Initial creation -- Wave 3 |
