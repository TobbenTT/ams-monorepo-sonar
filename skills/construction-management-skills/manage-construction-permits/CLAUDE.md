---
name: manage-construction-permits
description: "Track all construction work permits including hot work, excavation, confined space, and working at height permits. Triggers: 'construction permits', 'work permits', 'PTW', 'hot work permit', 'permisos de trabajo', 'permiso de trabajo en caliente'."
---

# Manage Construction Permits

## Skill ID: CM-07

## Version: 1.0.0

## Category: D-Monitoring (Construction Management)

## Priority: P1 - Critical

---

## Purpose

Track all construction work permits through their complete lifecycle -- request, risk assessment, approval, issuance, active monitoring, and close-out -- ensuring no construction activity commences without valid authorization and that concurrent work activities in the same area are assessed for conflicting hazards. This skill covers general work permits, hot work permits, excavation permits, confined space entry permits, working at height permits, energized electrical work permits, radiography permits, and lifting/crane permits.

The Permit-to-Work (PTW) system is the single most critical safety control on a construction site. IOGP (International Association of Oil & Gas Producers) data shows that 40-60% of serious construction incidents involve permit-related failures: work proceeding without a valid permit, expired permits, inadequate risk assessments, or failure to identify simultaneous operations (SIMOPS) conflicts. In brownfield or live plant environments, the consequences of permit failures can be catastrophic -- hot work near hydrocarbon systems, excavation over buried utilities, or confined space entry without atmospheric testing.

In the Operational Readiness context, permit management becomes especially critical during the transition from construction to commissioning, when live systems coexist with ongoing construction work. The permit system must seamlessly coordinate between construction and operations permit authorities, managing the geographic and temporal boundaries of competing work activities.

Key value drivers:
- **Life safety**: Prevents the #1 cause of construction fatalities -- unauthorized work in hazardous conditions
- **Regulatory compliance**: PTW systems are mandated by OSHA, mining regulations, and process safety standards (OSHA 1910.146, 1910.252)
- **SIMOPS management**: Prevents conflicting hazards in overlapping work areas (hot work near combustibles, excavation near live utilities)
- **Incident prevention**: Structured risk assessment at the permit stage is the primary proactive safety control
- **Audit readiness**: Complete permit audit trail satisfies regulatory inspection and client safety audit requirements

---

## Intent & Specification

The AI agent MUST understand that:

1. **Every permit has a defined lifecycle and validity period** -- a permit is not a one-time approval. Hot work permits are typically valid for one shift (8-12 hours) and must be revalidated, never simply extended. Confined space entry permits require continuous atmospheric monitoring throughout the work period. Permits must be formally closed out when work is complete or when validity expires, whichever comes first.

2. **Risk assessment is a prerequisite, not an option** -- high-risk permits (hot work, confined space, excavation, working at height, energized electrical) require a site-specific Job Safety Analysis (JSA) or Job Hazard Analysis (JHA) completed by the work crew and approved by the permit issuer. The risk assessment must address the specific hazards of the work location, not be a generic document.

3. **SIMOPS conflict detection is mandatory** -- before any permit is issued, the system must cross-reference all active permits in the same geographic area and time window to identify conflicting hazards. Examples: hot work cannot proceed near open hydrocarbon systems, radiography exclusion zones must not overlap with occupied work areas, crane lifts must not pass over active work zones.

4. **Permit authority hierarchy must be respected** -- each permit type has a defined approval authority. The area authority (owner of the geographic area) must concur with the permit. During the construction-to-operations transition, permit authority may transfer from the construction manager to the operations manager area by area as systems are handed over.

5. **Emergency permits have expedited procedures but not reduced requirements** -- in emergency situations (e.g., urgent repair to prevent equipment damage), permits may be issued with abbreviated procedures, but the risk assessment and SIMOPS check must still be performed. Emergency permits must be documented and reviewed within 24 hours.

### Permit Type Classification Matrix

| Permit Type | Risk Level | Validity | JSA Required | Fire Watch | Atmospheric Monitoring | Approval Authority |
|------------|-----------|----------|-------------|-----------|----------------------|-------------------|
| General Work Permit | Standard | 1 shift (12h) | No (for low-risk) | No | No | Permit Issuer |
| Hot Work Permit | High | 1 shift (12h) | Yes | Yes (during + 30-60 min after) | No | Permit Issuer + Area Authority |
| Excavation Permit | High | Until backfill | Yes | No | No (unless contaminated soil) | Permit Issuer + Area Authority + Utilities Owner |
| Confined Space Entry | Critical | Duration of entry | Yes | No | Yes (continuous) | Permit Issuer + Area Authority + HSE Manager |
| Working at Height | High | 1 shift (12h) | Yes | No | No | Permit Issuer + Area Authority |
| Energized Electrical Work | Critical | Duration of task | Yes | No | No | Permit Issuer + Electrical Supervisor + HSE Manager |
| Radiography Permit | High | Duration of exposure | Yes | No | No | Permit Issuer + Radiation Safety Officer |
| Lifting/Crane Permit | High | Duration of lift | Yes (lift plan) | No | No | Permit Issuer + Crane Supervisor |

---

## Trigger / Invocation

```
/manage-construction-permits
```

### Natural Language Triggers (EN)
- "How many active work permits are open right now in Area 300?"
- "Show me all hot work permits issued today and their expiry times"
- "Are there any SIMOPS conflicts between active permits?"

### Natural Language Triggers (ES)
- "Cuantos permisos de trabajo estan activos en el Area 300?"
- "Mostrar los permisos de trabajo en caliente emitidos hoy con sus horarios de vencimiento"
- "Hay conflictos de operaciones simultaneas entre los permisos activos?"

---

## Input Requirements

### Required Inputs

| Input | Source | Format | Description |
|-------|--------|--------|-------------|
| Permit Register | Site Permit Office | .xlsx/.csv | All permits with type, status, location, validity period, responsible persons |
| Risk Assessments (JSA/JHA) | HSE / Work Supervisors | .pdf/.xlsx | Site-specific risk assessments for each high-risk permit |
| Area Hazard Register | HSE Agent | .xlsx | Hazard classification per construction area for SIMOPS conflict detection |
| Site Layout / Area Map | Engineering | .pdf/.dwg | Geographic area definitions with permit zone boundaries |
| Daily Activity Plan | Construction Management | .xlsx | Planned construction activities requiring permits each day |

### Optional Inputs

| Input | Source | Default if Absent |
|-------|--------|-------------------|
| Shift Schedule | Construction Management | Standard 12-hour shifts assumed |
| Isolation / LOTO Register | Operations / Maintenance | Cross-reference with permits manually |
| Weather Forecast | Site Meteorological Station | Monitor daily for hot work wind restrictions |

### Context Enrichment (Automatic)

- Retrieve permit-to-work procedures from the project HSE plan
- Cross-reference area hazard register to pre-populate SIMOPS conflict checks
- Pull regulatory requirements for mandatory permit types from applicable jurisdiction
- Access HSE agent data for incident history per area to inform risk assessments
- Query historical permit volume data from similar VSC projects for resource planning benchmarking

---

## Output Specification

### Filename Format
`{ProjectCode}_PTW_Status_Report_{YYYYMMDD}.md`

### Report Structure

1. **Permit Summary Dashboard** -- Total active permits by type and area, expired permits requiring close-out, permits issued vs. closed today
2. **SIMOPS Conflict Alerts** -- Active conflicts between concurrent permits in the same area with risk assessment and mitigation status
3. **Permit Volume & Trend Analysis** -- Daily/weekly permit volumes by type, peak demand periods, permit processing time (request-to-issue)
4. **High-Risk Permit Register** -- Active hot work, confined space, excavation, working at height, energized electrical, and radiography permits with validity countdown
5. **Permit Close-Out Compliance** -- Open permits past validity period, close-out rate by contractor, aged permit investigation
6. **Permit Authority Status** -- Areas where permit authority has transferred from construction to operations during progressive handover

### Key Metrics Table

| Metric | Description | Target | Frequency |
|--------|-------------|--------|-----------|
| Permit Compliance Rate | % of work activities with valid permit before start | 100% | Daily |
| SIMOPS Conflicts Detected | Number of SIMOPS conflicts identified and resolved before work start | 100% detected | Daily |
| Permit Processing Time | Average time from permit request to issuance | <2 hours for standard, <4 hours for high-risk | Weekly |
| Permit Close-Out Rate | % of expired permits formally closed within 4 hours | >95% | Daily |
| High-Risk Permit JSA Compliance | % of high-risk permits with completed site-specific JSA | 100% | Weekly |

---

## Procedure

### Step 1: Establish Permit-to-Work Framework

- Define all permit types applicable to the project based on the scope of work, site hazards, and regulatory requirements
- Establish permit authority hierarchy: Permit Issuer (supervisor), Area Authority (area owner), and Permit Holder (work crew leader) for each area
- Create SIMOPS conflict matrix defining which permit types cannot coexist in the same area simultaneously (e.g., hot work vs. hydrocarbon work, radiography vs. occupied areas, crane lifts over occupied zones)
- Define geographic permit zones aligned with the site area map and progressive handover boundaries
- Configure permit validity rules per type: general work (1 shift), hot work (1 shift + fire watch), confined space (continuous monitoring), excavation (until backfill), radiography (duration of exposure)
- Establish the emergency permit procedure with abbreviated workflow but mandatory risk assessment and SIMOPS check
- Create permit form templates per type with all required fields, risk assessment checklists, and approval signatures
- Define permit numbering convention: PTW-{Area}-{Type}-{YYYY}-{NNN} (e.g., PTW-A300-HW-2026-015 for hot work permit #15 in Area 300)
- Establish permit office staffing requirements per shift to ensure permits can be processed within target timeframes (2 hours standard, 4 hours high-risk)
- Define the isolation/LOTO coordination protocol for permits requiring energy isolation, ensuring isolations are verified before permit issuance
- Train all permit issuers, area authorities, and permit holders on the PTW system; maintain training records for audit

### Step 2: Process Daily Permit Requests

- Receive permit requests from contractors and work crews, validating completeness of information (work description, location, crew size, duration, hazards identified, tools and equipment)
- For high-risk permits, verify that a site-specific JSA/JHA has been completed by the work crew and reviewed by their supervisor; reject generic risk assessments
- Execute SIMOPS conflict check: cross-reference the requested permit location and time window against all active permits to identify conflicting hazards (hot work vs. hydrocarbons, radiography vs. occupied zones, crane lifts over active work areas)
- Route the permit to the appropriate approval authority based on permit type and area; obtain area authority concurrence
- Issue the permit with clear conditions, validity period, emergency contacts, and specific control measures required
- Communicate active permits to all relevant parties including neighboring work crews and the site emergency response team
- Log the permit in the PTW register with all details, timestamps, and responsible persons
- For permits in areas transitioning from construction to operations, verify the current permit authority assignment from the progressive handover register

### Step 3: Monitor Active Permits

- Track all active permits against their validity periods, flagging permits approaching expiry (1 hour before for hot work, 2 hours for others)
- Monitor compliance with permit conditions through field verification (HSE walkdowns, supervisor checks)
- For confined space permits, verify continuous atmospheric monitoring records are being maintained and readings are within safe limits
- For hot work permits, verify fire watch is stationed, fire extinguishing equipment is in place, and combustible materials are controlled
- For working at height permits, verify fall protection systems are deployed and rescue plans are in place
- For excavation permits, verify shoring or benching is in place per the competent person's design and that trench entry/exit points are maintained
- For energized electrical work permits, verify arc flash PPE is worn and energized work boundaries are established per NFPA 70E
- Detect and alert on any new SIMOPS conflicts arising from permits issued after the initial check
- Track permit suspensions due to changing conditions (weather, emergency, area access restrictions)
- Maintain a real-time active permit map showing all current permits by location for emergency response coordination

### Step 4: Close Out and Audit Permits

- Close out each permit when work is complete or validity expires, confirming the work area is left in safe condition
- For hot work permits, verify fire watch has been maintained for the required post-work period (typically 30-60 minutes after hot work ceases) and confirm no smoldering materials remain
- For confined space permits, verify all personnel have exited, equipment has been removed, and atmospheric conditions are restored to safe levels
- For excavation permits, verify open excavations are barricaded, shored, or backfilled as appropriate; confirm no personnel or materials remain in the excavation
- For working at height permits, verify all temporary access equipment (scaffolding, ladders, lifts) is left in safe configuration or removed
- For energized electrical work permits, verify circuits are restored to normal configuration and temporary safety barriers are removed
- For lifting permits, verify the load is secured at final position, rigging equipment is removed, and the crane is returned to safe storage configuration
- Investigate any permits that remain open past their validity period (potential unauthorized work extension)
- Generate daily permit close-out report identifying aged permits and responsible parties
- Conduct periodic permit audits (weekly random sample) to verify compliance with permit conditions in the field
- Maintain a permit audit log recording audit findings, corrective actions, and contractor compliance scores

### Step 5: Analyze Trends and Report

- Compile daily permit statistics: permits issued, closed, active, expired, SIMOPS conflicts detected, emergency permits issued
- Analyze weekly trends: permit volume by type and contractor, processing time trends, close-out compliance rates
- Identify permit bottlenecks: areas or permit types where processing time exceeds targets; recommend resource adjustments
- Correlate permit data with safety incident data to identify whether permit-related factors contributed to incidents or near-misses
- Generate SIMOPS conflict analysis report for areas with high concurrent activity density, highlighting peak conflict periods
- Track permit authority transfer progress during construction-to-operations transition, ensuring no gaps in area authority assignment
- Monitor contractor-specific permit compliance rates (on-time close-out, JSA quality, permit condition adherence) as input to contractor performance evaluation
- Analyze emergency permit frequency: high emergency permit volumes may indicate inadequate planning or systematic circumvention of normal procedures
- Calculate permit office resource utilization: permits processed per permit issuer per shift, to identify staffing adequacy during peak construction periods
- Produce the weekly PTW status report for construction management and HSE team review
- Feed permit compliance metrics into the monitor-construction-safety skill for safety performance dashboards
- At project milestones, generate permit management lessons learned for future project reference and methodology updates

---

## Failure Modes & Common Pitfalls

| Failure Mode | Root Cause | Prevention Strategy |
|-------------|-----------|---------------------|
| Work proceeds without valid permit | Crew starts before permit is issued, or continues after expiry | Daily pre-start toolbox talk must verify permit status; site surveillance for unpermitted work |
| SIMOPS conflict not detected | Permits issued by different permit offices without cross-referencing | Centralized permit register with automated SIMOPS conflict detection algorithm |
| Risk assessment is generic, not site-specific | Crew uses pre-filled JSA template without adapting to actual conditions | Permit issuer must verify JSA addresses the specific location hazards; reject generic JSAs |
| Hot work permit issued near combustible materials | Area inspection not performed or inadequate before permit issuance | Mandatory pre-work area inspection by permit issuer with photo documentation |
| Permit authority confusion during handover | Construction-to-operations transition creates ambiguity about who has area authority | Formal area authority transfer register aligned with progressive handover milestones |
| Emergency permits bypass safety controls | Urgency used as excuse to skip risk assessment | Emergency procedure explicitly requires abbreviated JSA and SIMOPS check; 24-hour post-review |
| Permit close-out not completed | Crew finishes work but does not return to close permit | Automated expiry alerts; contractor permit close-out compliance as a contractual KPI |

---

## Escalation Protocols

| Trigger | Timeline | Escalation Path |
|---------|----------|-----------------|
| Work observed without valid permit | Immediate stop-work | Supervisor -> HSE Manager -> Construction Manager (potential stand-down) |
| SIMOPS conflict detected with active work in progress | Immediate | Permit Office -> Area Authority -> HSE Manager (pause conflicting activity) |
| Hot work permit area inspection reveals uncontrolled combustibles | Immediate | Permit Issuer -> HSE Manager (permit denied until hazards controlled) |
| Confined space atmospheric monitoring shows hazardous conditions | Immediate evacuation | Permit Holder -> Emergency Response -> HSE Manager |
| Permit processing time exceeds 4 hours for high-risk permit | Within same shift | Permit Office Supervisor -> Construction Manager (resource constraint) |
| Permit close-out rate drops below 90% for any contractor | Within weekly reporting cycle | Construction Manager -> Contractor Site Manager |
| Permit-related near-miss or incident reported | Within 24 hours | HSE Manager -> Project Director -> Safety Committee |

---

## Quality Criteria

| Dimension | Weight | Target | Measurement |
|-----------|--------|--------|-------------|
| Technical Accuracy | 30% | Permit types, validity rules, and SIMOPS matrix match regulatory and project requirements | Audit against HSE plan and regulations |
| Completeness | 25% | 100% of construction activities with safety significance have corresponding permits tracked | Cross-reference activity plan vs. permit register |
| Consistency | 15% | Permit numbering, risk assessment format, and close-out procedures uniform across all contractors | Template compliance audit |
| Format | 10% | Professional dashboard with clear status indicators, SIMOPS alerts highlighted | Visual review against VSC template |
| Actionability | 10% | Every expired or non-compliant permit has assigned follow-up action with owner and deadline | Review of action items |
| Traceability | 10% | Every permit links to JSA/JHA, area authority approval, and close-out record | Audit trail verification |

---

## Inter-Agent Dependencies

### Inputs From

| Agent / Skill | What is Provided | Criticality |
|---------------|-----------------|-------------|
| HSE Agent | Permit-to-work procedures, hazard classifications, risk assessment templates, regulatory permit requirements | Critical |
| Execution Agent (Project Controls) | Daily construction activity plan identifying activities requiring permits | Critical |
| track-progressive-handover | Area handover status determining permit authority (construction vs. operations) | High |
| monitor-construction-safety | Incident data for areas with recent safety events requiring enhanced permit controls | High |

### Outputs Consumed By

| Agent / Skill | What is Consumed | Trigger |
|---------------|-----------------|---------|
| monitor-construction-safety | Permit compliance rates, SIMOPS conflicts, permit-related incident data | Daily/Weekly |
| HSE Agent | Permit audit data, permit-related near-misses, trend analysis for safety program review | Monthly |
| Orchestrator Agent | Permit KPIs (compliance rate, SIMOPS conflicts, processing time) for management reporting | Weekly |
| generate-construction-reports | Permit statistics for inclusion in daily/weekly/monthly construction reports | Per report cycle |
| manage-mechanical-completion | Permit authority transfer status as part of progressive handover to operations | At MC milestone |

---

## References

### Methodology References
- VSC OR Playbook -- Construction Safety Management (Level 4: Construction Execution)
- VSC HSE Management Framework -- Permit-to-Work System Design and Implementation
- VSC Progressive Handover Protocol -- Permit Authority Transfer Procedures
- VSC SIMOPS Management Guidelines -- Concurrent Activity Risk Assessment

### Industry Standards
- OSHA 29 CFR 1910.146 -- Permit-Required Confined Spaces
- OSHA 29 CFR 1910.252 -- Welding, Cutting, and Brazing (Hot Work)
- IOGP Report 459 -- Life-Saving Rules (includes PTW requirements)
- NFPA 51B -- Standard for Fire Prevention During Welding, Cutting, and Other Hot Work
- API RP 2009 -- Safe Welding, Cutting, and Hot Work Practices in the Petroleum and Petrochemical Industries

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-25 | Initial creation -- Wave 3 |
