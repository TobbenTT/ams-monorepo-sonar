---
name: monitor-construction-safety
description: "Track construction safety performance including leading and lagging indicators, PTW compliance, and drive continuous improvement in field safety culture. Triggers: 'construction safety', 'safety monitoring', 'TRIR tracking', 'seguridad en obra', 'indicadores de seguridad', 'permit to work compliance'."
---

# Monitor Construction Safety

## Skill ID: CM-004

## Version: 1.0.0

## Category: D-Monitoring (Construction Management)

## Priority: P1 - Critical

---

## Purpose

Track construction safety performance including leading indicators (safety observations, toolbox talks, PTW compliance, near-miss reports) and lagging indicators (TRIR, LTIR, first aid cases, property damage). Monitor permit-to-work compliance and drive continuous improvement in field safety culture across all contractors and work fronts.

Construction sites in the mining, oil & gas, and energy sectors are among the most hazardous industrial environments. Fatal and serious incidents disproportionately occur during the construction and commissioning phases when multiple contractors, temporary works, heavy lifts, confined spaces, and energized systems create a complex risk landscape. The difference between world-class safety performance (TRIR <0.5) and industry average (TRIR 2.0-4.0) is not luck -- it is systematic measurement, intervention, and cultural reinforcement.

This skill implements a leading-indicator-dominant safety monitoring system. Lagging indicators (injuries, incidents) tell you what went wrong. Leading indicators (observations, near-misses, toolbox talks, PTW compliance) tell you what is about to go wrong, providing the opportunity to intervene before harm occurs. Research from the Construction Industry Institute (CII) demonstrates that projects with robust leading indicator programs achieve 60-80% lower recordable incident rates.

Key value drivers:
- **Life safety**: Preventing fatal and serious injuries is the paramount objective of any construction project
- **Regulatory compliance**: Chilean SERNAGEOMIN (mining), SUSESO, and Mutual de Seguridad requirements mandate safety performance tracking and reporting
- **Schedule protection**: Safety stand-downs, incident investigations, and regulatory interventions cause significant schedule delays
- **Cost avoidance**: Each recordable incident costs $40,000-$100,000+ in direct costs; fatalities have unlimited financial and reputational consequences
- **Contractor differentiation**: Safety performance data enables evidence-based contractor selection and retention decisions
- **Insurance compliance**: Insurers require documented safety management for construction all-risk (CAR) policy compliance

In Chilean operations, compliance with DS 132 (SERNAGEOMIN mining safety regulations), DS 594 (occupational health conditions), Ley 16.744 (workplace accident insurance), and local Mutual de Seguridad requirements adds specific regulatory dimensions to safety monitoring.

---

## Intent & Specification

The AI agent MUST understand that:

1. **Leading vs. Lagging Indicators**: The safety monitoring system must track both categories but prioritize leading indicators for proactive intervention. Leading indicators include: safety observations (positive and negative), hazard reports, near-miss reports, toolbox talk completion rates, PTW compliance rates, safety inspection scores, and management safety walks. Lagging indicators include: TRIR, LTIR, severity rate, first aid frequency, property damage incidents, and environmental spills.
2. **TRIR/LTIR Calculation**: Total Recordable Incident Rate (TRIR) = (Number of recordable incidents x 200,000) / Total hours worked. Lost Time Incident Rate (LTIR) = (Number of lost-time incidents x 200,000) / Total hours worked. The 200,000 factor represents 100 employees working 40 hours/week for 50 weeks. These calculations must use verified man-hours from payroll/access control, not contractor self-reported hours.
3. **Permit-to-Work Tracking**: All high-risk construction activities require valid permits: hot work, confined space entry, working at height, excavation, electrical isolation, heavy lift, radiography. PTW compliance means: permit issued before work starts, all conditions met, competent persons assigned, emergency equipment available, and permit closed at work completion. PTW non-compliance is a leading indicator of potential serious incidents.
4. **Safety Stand-Down Triggers**: Certain conditions must trigger an automatic construction safety stand-down: fatality or potential fatality, multiple injuries in single event, imminent danger identified, repeated PTW violations by same contractor, or pattern of near-misses indicating systemic control failure. Stand-downs halt work until the root cause is addressed and corrective actions verified.
5. **Contractor Safety Benchmarking**: Safety performance must be measured and compared across contractors using normalized rates (per 200,000 hours). Contractors with significantly worse performance than the site average must enter safety improvement programs. Sustained poor safety performance must trigger contractual consequences.

### Constraints

- All safety incidents must be reported within 2 hours of occurrence (Chilean regulatory requirement)
- Fatalities and serious incidents must be reported to SERNAGEOMIN/SUSESO within 24 hours per Chilean law
- TRIR and LTIR calculations must use verified man-hours from access control systems, not contractor self-reports
- Near-miss reports must be encouraged (no-blame policy); near-miss reporting rates are a positive leading indicator
- All incident investigations must use structured methodology (ICAM, TapRooT, or 5-Why minimum)
- Safety data must be segregated by contractor for individual performance tracking
- PTW audit results must be documented with photographic evidence of compliance or non-compliance
- Monthly safety statistics must be reported to Chilean regulatory authorities per applicable sector requirements

---

## Trigger / Invocation

```
/monitor-construction-safety
```

### Natural Language Triggers
- "What is the current site TRIR?"
- "Show me safety performance by contractor"
- "Generate the monthly safety report"
- "Cual es el TRIR actual del sitio?"
- "Mostrar desempeno de seguridad por contratista"
- "Generar informe mensual de seguridad de obra"

### Command Triggers
- `monitor-construction-safety dashboard --view [summary|leading|lagging|contractor|trend]`
- `monitor-construction-safety incident --action [report|investigate|close] --id [incident-id]`
- `monitor-construction-safety ptw --view [compliance|audit|trend] --period [daily|weekly|monthly]`
- `monitor-construction-safety report --type [weekly|monthly|incident|regulatory] --scope [site|contractor|area]`
- `monitor-construction-safety benchmark --contractor [name|all] --period [monthly|quarterly|ytd]`

### Automatic Triggers

| Trigger Condition | Action | Priority |
|-------------------|--------|----------|
| Safety incident reported | Initiate incident investigation workflow | Critical |
| Fatality or potential fatality | Trigger safety stand-down; notify Project Director and regulatory authorities | Critical |
| Contractor TRIR exceeds 2x site average | Alert HSE Manager + Construction Manager; schedule safety improvement meeting | High |
| PTW compliance rate drops below 90% for any contractor | Escalation to contractor safety manager | High |
| Weekly safety statistics compilation | Generate weekly safety dashboard update | Medium |
| Monthly reporting cycle | Generate monthly safety performance report for management and regulators | High |
| Near-miss reporting rate drops below threshold | Alert HSE Manager; potential under-reporting investigation | Medium |

---

## Input Requirements

### Required Inputs

| Input | Source | Format | Description |
|-------|--------|--------|-------------|
| Man-Hours by Contractor | Site Access Control / Payroll | .xlsx | Verified daily man-hours per contractor for rate calculations |
| Incident Reports | HSE / First Aid / Supervisors | .xlsx / forms | All incidents: injuries, near-misses, property damage, environmental |
| PTW Records | Permit Office / HSE | .xlsx / database | All permits issued, conditions, compliance audit results |
| Safety Observation Reports | Supervisors / HSE / Management | .xlsx / forms | Positive and negative safety observations from field inspections |
| Toolbox Talk Records | Contractors / HSE | .xlsx | Daily toolbox talk topics, attendance, and completion status |

### Optional Inputs

| Input | Source | Format | Default if Absent |
|-------|--------|--------|-------------------|
| Industry Benchmark Data | VSC Knowledge Base / ICMM | .xlsx | Generic industry sector benchmarks applied |
| Contractor Historical Safety Data | Contracts & Compliance | .xlsx | No historical baseline; measurement starts from mobilization |
| Weather and Environmental Data | Site Management | .xlsx | Not factored into safety correlation analysis |
| Training Records | HR / Contractors | .xlsx | Training compliance tracked separately |

### Context Enrichment

The agent will automatically:
- Calculate TRIR, LTIR, and severity rates using verified man-hours from access control systems
- Generate contractor safety ranking using normalized rates for fair comparison
- Retrieve Chilean regulatory reporting thresholds and templates (SERNAGEOMIN, SUSESO, Mutual de Seguridad)
- Pull industry safety benchmarks from ICMM (mining), IOGP (oil & gas), or relevant sector association
- Cross-reference incident data with PTW records to identify permit compliance correlation
- Analyze leading indicator trends to predict lagging indicator trajectory (predictive safety analytics)

---

## Output Specification

### Filename Format
`{ProjectCode}_Construction_Safety_Report_{Period}_{YYYYMMDD}.xlsx`

### Structure

1. **Safety Dashboard** -- Single-page executive summary with: site TRIR and LTIR (current month and rolling 12-month), man-hours worked (total and by contractor), leading indicator summary (observations, near-misses, toolbox talks, PTW compliance), traffic-light status against targets, and trend arrows showing direction of change.

2. **Leading Indicators** -- Detailed tracking of proactive safety activities: safety observations (positive/negative ratio, frequency per 1000 hours), near-miss reports (count, severity potential, close-out rate), toolbox talk completion (by contractor, by topic), PTW compliance rates (by permit type, by contractor, by area), and management safety walk frequency.

3. **Lagging Indicators** -- Incident statistics: TRIR, LTIR, severity rate, first aid frequency, property damage frequency, environmental incident frequency. Breakdown by contractor, discipline, area, and incident type. Month-by-month trend charts with rolling 12-month average.

4. **Contractor Safety Ranking** -- Comparative table of all contractors ranked by composite safety score (leading 40%, lagging 60%) with normalized rates per 200,000 hours. Includes trend indicators (improving/stable/worsening) and identification of contractors requiring safety improvement programs.

5. **Incident Analysis** -- Summary of all incidents during reporting period with: classification (recordable/first aid/near-miss/property damage/environmental), root cause category, corrective action status, investigation completion status, and lessons learned.

6. **PTW Compliance Detail** -- Permit-to-work analysis by type (hot work, confined space, height, excavation, electrical, heavy lift, radiography) showing: permits issued, audits conducted, compliance rate, common non-compliance findings, and trends.

### Key Metrics Table

| Metric | Unit | Calculation | Target |
|--------|------|-------------|--------|
| Total Recordable Incident Rate (TRIR) | Per 200,000 hrs | (Recordable incidents x 200,000) / Hours worked | < 1.0 (world class: < 0.5) |
| Lost Time Incident Rate (LTIR) | Per 200,000 hrs | (LTI incidents x 200,000) / Hours worked | < 0.2 |
| PTW Compliance Rate | % | Compliant audits / Total audits | >= 95% |
| Safety Observation Frequency | Per 1,000 hrs | (Observations x 1,000) / Hours worked | >= 5.0 |
| Near-Miss Reporting Rate | Per 200,000 hrs | (Near-misses x 200,000) / Hours worked | >= 50 (indicates healthy reporting culture) |

---

## Procedure

### Step 1: Establish Safety Monitoring Framework

1. Define site safety KPIs with targets aligned to client requirements, regulatory obligations, and industry benchmarks
2. Establish TRIR/LTIR calculation methodology using verified man-hours from access control systems (not contractor self-reports)
3. Create safety observation program: define observation categories, reporting forms, positive-to-negative ratio target (minimum 3:1)
4. Set up PTW audit program: define audit frequency per permit type (minimum 10% of all permits), audit checklist, and non-compliance escalation protocol
5. Define incident classification criteria aligned with OSHA recordability standards and Chilean regulatory definitions
6. Establish investigation methodology requirements per incident severity: 5-Why for minor, ICAM for serious, independent investigation for fatalities
7. Configure safety data collection tools: mobile forms for observations and near-misses, digital PTW system, automated man-hour imports from access control

### Step 2: Collect Safety Data Daily

1. Import daily man-hours by contractor from access control system; reconcile with contractor-reported headcounts
2. Receive and log all incident reports within 2 hours of occurrence per reporting protocol
3. Collect safety observation reports from supervisors, HSE team, and management walkthroughs
4. Record toolbox talk completion: topics, attendance numbers, and percentage of workforce attending
5. Compile PTW data: permits issued, permits audited, audit results (compliant/non-compliant), and non-compliance descriptions
6. Log near-miss reports with severity potential classification (low/medium/high/critical)
7. Record any safety interventions: stop-work orders, area evacuations, equipment lockouts, emergency response activations

### Step 3: Analyze Performance and Identify Trends

1. Calculate TRIR, LTIR, and severity rate at site level and per contractor using rolling monthly periods
2. Calculate leading indicator rates: observation frequency, near-miss rate, toolbox talk attendance, PTW compliance
3. Produce contractor safety ranking using composite score: leading indicators (40% weight) + lagging indicators (60% weight)
4. Identify trends over 4-week and 12-week rolling periods: improving, stable, or worsening for each contractor and site overall
5. Correlate leading and lagging indicators: does declining PTW compliance predict increasing incidents? Do observation rates correlate with TRIR?
6. Perform Pareto analysis on incident root causes to identify the 20% of causes driving 80% of incidents
7. Compare site performance against industry benchmarks (ICMM for mining, IOGP for O&G) and project targets

### Step 4: Drive Corrective Actions and Interventions

1. For each recordable incident: ensure investigation completed within 14 days, corrective actions identified, responsible parties assigned, and implementation deadlines set
2. For systemic safety issues (3+ similar incidents/near-misses): require affected contractor to submit Safety Improvement Plan within 5 business days
3. For PTW non-compliance: issue formal notice to contractor; repeat non-compliance within 30 days triggers safety stand-down for the contractor
4. For contractor TRIR exceeding 2x site average: schedule mandatory safety improvement meeting with contractor management within 5 business days
5. Distribute lessons learned from significant incidents to all contractors within 48 hours of investigation completion
6. Track corrective action implementation: verify actions are completed by deadline and verify effectiveness through follow-up observation
7. Recognize and publicize positive safety performance: contractor of the month, milestone celebrations (e.g., 1 million hours LTI-free)

### Step 5: Report and Comply with Regulatory Requirements

1. Generate weekly safety dashboard for Construction Manager and HSE Manager with leading and lagging indicator updates
2. Produce monthly safety performance report for project management team and client with full statistical analysis and trend charts
3. Prepare regulatory reports per Chilean requirements: SERNAGEOMIN monthly accident statistics (mining), SUSESO notifications, Mutual de Seguridad reports
4. Submit incident notifications to regulatory authorities within mandated timelines (24 hours for serious/fatal incidents)
5. Provide contractor safety performance data to coordinate-subcontractors for inclusion in contractor performance scorecards
6. Archive all safety records (incidents, investigations, observations, PTW records) for minimum 5 years per Chilean regulatory retention requirements
7. Produce quarterly safety trend analysis for project lessons-learned and methodology improvement proposals

---

## Failure Modes & Common Pitfalls

| Failure Mode | Root Cause | Prevention Strategy |
|-------------|-----------|---------------------|
| Under-reporting of incidents and near-misses | Punitive safety culture; fear of consequences | No-blame near-miss policy; recognition for reporting; anonymous reporting channel |
| TRIR calculation uses unverified man-hours | Contractor self-reported hours inflated | Mandatory use of access control system data; monthly reconciliation |
| Leading indicators collected but not acted upon | Data accumulates without analysis or intervention | Automated threshold alerts; mandatory response protocols for declining trends |
| PTW compliance treated as paperwork exercise | Permits issued without field verification | Minimum 10% field audits of active permits; consequences for paper-only compliance |
| Investigation quality varies by incident severity | Minor incidents receive superficial investigation | Minimum investigation standards per severity level; investigation quality audit |
| Safety stand-down triggers not applied consistently | Reluctance to stop work due to schedule pressure | Pre-defined, non-negotiable stand-down criteria with Project Director backing |
| Contractor safety performance not compared fairly | Different contractor sizes distort raw numbers | All comparisons use normalized rates (per 200,000 hours worked) |

---

## Escalation Protocols

| Trigger | Timeline | Escalation Path |
|---------|----------|-----------------|
| Fatality or potential fatality | Immediately | Site evacuation -> Project Director -> Client -> Regulatory authorities (SERNAGEOMIN/SUSESO within 24h) |
| Recordable incident (non-fatal) | Within 2 hours | HSE Manager -> Construction Manager -> Investigation team assigned within 24h |
| Contractor TRIR exceeds 2x site average for 2 consecutive months | End of second month | Construction Manager + HSE Manager -> Contractor management -> Safety Improvement Plan in 5 days |
| PTW non-compliance (second occurrence by same contractor in 30 days) | Same day | HSE Manager -> Contractor safety stand-down until corrective actions verified |
| Near-miss with fatality potential | Within 4 hours | HSE Manager -> Construction Manager -> Safety alert to all contractors |
| Leading indicator decline (observation rate drops >30% for 4 weeks) | End of fourth week | HSE Manager -> Contractor superintendents -> Reinforce observation program |
| Regulatory inspection finding | Within 24 hours | HSE Manager -> Project Director -> Legal -> Corrective action plan within timeframe specified by authority |

---

## Quality Criteria

| Dimension | Weight | Target | Measurement |
|-----------|--------|--------|-------------|
| Technical Accuracy | 30% | TRIR/LTIR calculated correctly using verified hours; incident classifications accurate | Rate calculation audit; classification calibration |
| Completeness | 25% | All incidents captured; all contractors tracked; all permit types monitored | Cross-check against first aid log, access control, permit office |
| Consistency | 15% | Incident classification consistent across investigators | Classification calibration exercise monthly |
| Format | 10% | Professional reporting, clear charts, regulatory format compliance | Visual QA + regulatory format check |
| Actionability | 10% | Every trend triggers intervention; every incident has corrective actions | Action traceability audit |
| Timeliness | 10% | Incidents reported within 2 hours; investigations within 14 days; reports on schedule | Timestamp audit |

---

## Inter-Agent Dependencies

### Inputs From

| Agent | Data Required | Frequency | Criticality |
|-------|-------------|-----------|-------------|
| HSE | Safety requirements, investigation protocols, regulatory templates, PSSR requirements | At project start + updates | Critical |
| Contracts & Compliance | Contractor HSE obligations per contract, safety KPI requirements | At award + variations | High |
| coordinate-subcontractors | Contractor headcount and man-hours from access control | Daily | Critical |
| HR / Contractors | Safety induction records, competency certificates, first aid qualifications | At mobilization + updates | High |

### Outputs Consumed By

| Consumer Agent | Data Provided | Frequency | Usage |
|----------------|-------------|-----------|-------|
| Orchestrator | Site safety KPIs (TRIR, LTIR, leading indicators) | Weekly/Monthly | Management reporting, OR gate reviews |
| HSE | Incident data, investigation results, trend analysis | As incidents occur + monthly | HSE management system, regulatory reporting |
| Execution (Schedule) | Schedule impact of safety events (stand-downs, investigations, regulatory interventions) | As events occur | Schedule impact assessment |
| coordinate-subcontractors | Contractor safety performance scores and rankings | Monthly | Contractor performance scorecards |
| Contracts & Compliance | Safety performance data for contractual penalty/incentive application | Quarterly | Contract administration |

---

## References

- **OSHA 29 CFR 1904**: Recording and Reporting Occupational Injuries and Illnesses -- TRIR/LTIR calculation methodology
- **ICMM Health and Safety Performance Indicators**: Mining industry safety benchmarking framework
- **IOGP Safety Performance Indicators**: Oil & gas industry safety reporting standards
- **DS 132 (Chile)**: Reglamento de Seguridad Minera (SERNAGEOMIN) -- mining safety requirements
- **Ley 16.744 (Chile)**: Seguro social contra riesgos de accidentes del trabajo y enfermedades profesionales
- **DS 594 (Chile)**: Condiciones sanitarias y ambientales basicas en los lugares de trabajo

---

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-25 | VSC OR Team | Initial creation -- Wave 3 |
