---
name: manage-preservation-program
description: "Track equipment preservation activities during construction to prevent degradation of installed or stored equipment. Triggers: 'equipment preservation', 'preservation program', 'preservacion de equipos', 'programa de preservacion', 'proteccion de equipos en construccion'."
---

# Manage Preservation Program

## Skill ID: CONST-15

## Version: 1.0.0

## Category: D-Monitoring (Construction Management)

## Priority: P1 - High

---

## Purpose

Track equipment preservation activities during the construction phase to prevent degradation of installed or stored equipment. This skill manages preservation schedules, monitors compliance, and flags non-conformances for equipment exposed to weather, dust, vibration, or other hazards during the construction period that can extend 12-36 months between equipment receipt and commissioning start.

Equipment preservation is one of the most overlooked aspects of construction management, yet its failure has immediate and severe consequences for commissioning success and long-term asset reliability. Equipment delivered to site months or years before commissioning is exposed to environmental attack: coastal projects face salt-laden air that corrodes exposed surfaces, desert projects face extreme temperature cycling and dust infiltration, tropical projects face humidity and biological growth, and all projects face construction-induced hazards like welding spatter, grinding dust, vibration from adjacent piling or blasting, and accidental physical damage.

The financial impact of preservation failures is substantial. Industry data from asset management organizations shows that 15-25% of early-life equipment failures (within the first 2 years of operation) can be traced to inadequate preservation during construction. The cost of replacing a corroded bearing, re-winding a moisture-damaged motor, or overhauling an instrument contaminated with construction dust is 10-50x the cost of the preservation activities that would have prevented the damage. More critically, preservation failures cause commissioning delays -- a motor with degraded insulation discovered during pre-commissioning testing requires replacement, adding weeks to the schedule for a component that costs a fraction of the delay impact.

Key value drivers:
- **Commissioning success**: Equipment that has been properly preserved during construction starts up successfully on the first attempt, avoiding costly commissioning rework
- **Asset reliability**: Proper preservation protects the manufacturer's warranty and establishes a healthy baseline for the equipment's operating life
- **Cost avoidance**: Preventing preservation-related damage avoids replacement and repair costs that are 10-50x the preservation investment
- **Warranty protection**: Most equipment warranties require documented compliance with manufacturer preservation requirements -- failure to preserve voids warranty coverage
- **Schedule protection**: Preservation failures discovered during pre-commissioning create unplanned delays that are difficult to recover

---

## Intent & Specification

The AI agent MUST understand that:

1. **Manufacturer Preservation Requirements**: Every piece of rotating, electrical, and instrumentation equipment has manufacturer-specified preservation requirements that must be extracted from vendor documentation, compiled into a preservation database, and scheduled as recurring activities. These requirements are non-negotiable -- deviating from manufacturer requirements voids the warranty and introduces unquantified reliability risk
2. **Preservation Types and Classification**: Preservation activities are classified by duration (short-term < 6 months, long-term > 6 months) and by type (active = requires periodic action such as shaft rotation or desiccant replacement, passive = one-time protection such as flange covers or vapor barrier wrapping). The preservation plan must match the classification to the expected storage/exposure duration for each equipment item based on the construction sequence
3. **Equipment-Class-Specific Protocols**: Different equipment classes require fundamentally different preservation approaches: rotating equipment (shaft rotation schedules, bearing protection, seal preservation, lubricant maintenance), electrical equipment (space heaters energized, desiccant cartridges, megger testing trending), instrumentation (environmental covers, desiccant, calibration verification), piping and vessels (internal drying, nitrogen blanketing, flange protection), structural steel and tanks (coating integrity, cathodic protection where applicable)
4. **Compliance Auditing and NCR Trigger**: Preservation compliance must be audited on a scheduled basis (monthly minimum for active preservation items) with documented evidence (photos, instrument readings, checklists). Non-compliance must trigger a Non-Conformance Report (NCR) that requires root cause analysis, corrective action, and verification that the equipment has not been damaged by the preservation lapse
5. **Seasonal Considerations**: Preservation requirements intensify during adverse seasons -- high humidity periods require more frequent desiccant replacement and megger testing, extreme cold requires additional freeze protection, rainy seasons require enhanced weatherproofing, and high dust periods (adjacent earthworks, sandstorms) require additional sealing of equipment openings

---

## Trigger / Invocation

```
/manage-preservation-program
```

### Natural Language Triggers

- "Set up the equipment preservation program for the project"
- "Check preservation compliance for installed equipment"
- "Generate the preservation audit report for this month"
- "Establecer el programa de preservacion de equipos del proyecto"
- "Verificar el cumplimiento de preservacion de equipos instalados"
- "Generar el reporte de auditoria de preservacion mensual"

---

## Input Requirements

### Required Inputs

| Input | Source | Format | Description |
|-------|--------|--------|-------------|
| Equipment Register | Engineering Design / Asset Management | .xlsx | Complete equipment list with tag numbers, types, manufacturers, and installation dates |
| Vendor Preservation Requirements | Engineering Design (vendor documentation) | .pdf / .docx | Manufacturer-specified preservation instructions per equipment model |
| Construction Sequence | plan-construction-sequence | .xlsx | Equipment installation dates and MC dates to calculate preservation duration |
| Site Environmental Data | HSE / Site Management | .docx / .xlsx | Climate data: temperature range, humidity, rainfall, dust, salt air, seasonal patterns |
| NCR Process | manage-field-quality / QA-QC | .docx | Non-conformance reporting process for preservation violations |

### Optional Inputs

| Input | Source | Format | Default if Absent |
|-------|--------|--------|-------------------|
| Equipment Criticality Assessment | Asset Management | .xlsx | All equipment treated as high criticality for preservation purposes |
| Storage Facility Specifications | manage-site-logistics | .docx | Standard covered/open storage assumptions applied |
| Historical Preservation Failure Data | VSC Knowledge Base | .xlsx | Industry-standard preservation failure rates applied |

### Context Enrichment

- Retrieve equipment installation and MC dates from plan-construction-sequence for preservation duration calculation
- Access storage conditions from manage-site-logistics for preservation requirement alignment
- Pull equipment criticality data from analyze-equipment-criticality (Asset Management) for preservation priority ranking
- Query vendor documentation status from manage-vendor-documentation for preservation instruction availability
- Access weather forecast data for seasonal preservation intensity adjustments

---

## Output Specification

### Document 1: Equipment Preservation Plan (.docx)

**Filename**: `{ProjectCode}_Equipment_Preservation_Plan_v{Version}_{YYYYMMDD}.docx`

**Structure:**

1. **Program Overview**
   - Preservation program scope and objectives
   - Equipment categories covered and total equipment count
   - Preservation duration estimates by equipment category
   - Roles and responsibilities (who executes, who inspects, who audits)
   - Preservation material inventory (desiccant, VCI paper, lubricants, covers, heaters)

2. **Equipment-Class Preservation Protocols**
   - Rotating equipment: shaft rotation frequency (monthly minimum), bearing grease replenishment, seal protection, coupling guard installation, motor heater energization
   - Electrical equipment: space heater energization and monitoring, desiccant cartridge replacement schedule, megger testing frequency and trending, cable termination protection, switchgear door sealing
   - Instrumentation: environmental enclosure sealing, desiccant installation, capillary tube protection, transmitter housing cover, control valve packing protection
   - Piping and vessels: internal drying protocol, nitrogen blanket monitoring, flange cover installation, gasket protection, valve preservation (stroke or position requirements)
   - Structural steel and tanks: coating inspection schedule, touch-up protocol, internal preservation for tanks, cathodic protection monitoring (where applicable)

3. **Preservation Schedule**
   - Calendar-based schedule of all preservation activities by equipment tag
   - Frequency per activity type (daily, weekly, monthly, quarterly)
   - Responsible party per activity
   - Seasonal adjustments (enhanced activities during adverse weather periods)

4. **Compliance Audit Protocol**
   - Audit frequency by equipment class (monthly for rotating/electrical, quarterly for static)
   - Audit checklist per equipment class
   - Non-compliance grading: Critical (equipment damage likely), Major (preservation lapsed > 1 cycle), Minor (documentation gap)
   - NCR trigger criteria and escalation

5. **Preservation Material Management**
   - Inventory of preservation materials required (type, quantity, supplier, lead time)
   - Replenishment triggers and reorder points
   - Storage requirements for preservation materials themselves
   - Budget for preservation program by quarter

6. **Appendices**
   - Equipment-specific preservation data sheets (one per equipment tag)
   - Manufacturer preservation instruction extracts
   - Preservation audit checklist templates
   - NCR form template for preservation non-compliance

### Key Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| Preservation Compliance | % of scheduled preservation activities completed on time | > 95% |
| NCR Rate | Preservation NCRs per 100 equipment items per quarter | < 3 |
| Audit Completion | % of scheduled preservation audits completed on time | 100% |
| Equipment Damage Rate | Equipment items requiring repair due to preservation failure | < 1% of total equipment |
| Megger Trend Compliance | % of electrical equipment with megger readings within acceptable decline trend | > 98% |

---

## Procedure

### Step 1: Build Preservation Database from Vendor Requirements

1. Compile the complete equipment register from Engineering Design and Asset Management, including equipment tag, type, manufacturer, model, and location (installed, in laydown, or in transit)
2. Extract preservation requirements from vendor documentation for every equipment item: storage conditions (indoor/outdoor/climate-controlled), active preservation tasks (shaft rotation, heater energization, desiccant replacement), passive preservation measures (covers, wrapping, coating), inspection requirements (visual, megger, vibration baseline), and prohibited conditions (temperature limits, humidity limits, proximity to welding/grinding)
3. For equipment where vendor preservation instructions are not available, apply VSC standard preservation protocols by equipment class (rotating, electrical, instrumentation, static, piping)
4. Calculate the preservation duration for each equipment item: from receipt date (or installation date if received and immediately installed) to commissioning start date, based on the construction sequence
5. Classify each preservation requirement as short-term (< 6 months) or long-term (> 6 months) and as active (recurring) or passive (one-time), and determine the appropriate preservation activity frequency
6. Create the preservation database: one row per equipment tag, with columns for each preservation requirement, frequency, responsible party, and compliance tracking
7. Review the preservation database with the Asset Management agent to confirm alignment with equipment criticality and long-term reliability objectives

### Step 2: Implement Preservation Activities

1. Issue the preservation schedule to all responsible parties (construction contractors, site maintenance team, vendor representatives) with clear accountability for each activity
2. Implement passive preservation measures immediately upon equipment receipt or installation: install flange covers and gasket protectors, install environmental covers on instruments, seal cable entry points on electrical equipment, install VCI (Volatile Corrosion Inhibitor) protection on carbon steel internals, verify coating integrity and touch up damage from transport/installation
3. Initiate active preservation activities per the schedule: energize motor and transformer space heaters (verify heating circuit and thermostat function), begin rotating equipment shaft rotation program (rotate shafts 3-5 full turns monthly to redistribute lubricant and prevent brinelling), install and monitor desiccant in enclosed electrical and instrument panels, begin nitrogen blanket monitoring for preserved vessels and piping (maintain > 0.5 psig positive pressure)
4. Implement seasonal preservation enhancements: during high humidity periods increase desiccant replacement frequency and megger testing frequency, during extreme cold activate freeze protection measures, during high dust periods verify all equipment openings are sealed
5. Track preservation activity completion in the preservation database: record date completed, completed by, observations (normal/abnormal), next due date
6. Investigate and record any abnormal findings during preservation activities: unusual corrosion, seal deterioration, lubricant contamination, insulation resistance decline, physical damage -- and initiate corrective action before damage progresses
7. Maintain preservation material inventory: desiccant, VCI products, lubricants, covers, sealing tape, space heater spare elements -- and reorder before stock-out

### Step 3: Conduct Preservation Compliance Audits

1. Schedule monthly preservation audits covering a representative sample of equipment (minimum 20% of active preservation items per audit, rotating so all items are audited quarterly)
2. Conduct physical inspections using equipment-class-specific audit checklists: verify shaft rotation has occurred (check rotation log and physical indicators), verify space heaters are energized (check temperature, current draw), verify desiccant is active (check color indicators), verify nitrogen blanket pressure (check gauge readings), inspect coating condition, check flange covers and environmental protection integrity
3. Record audit findings with photographic evidence for each equipment item inspected
4. Grade non-compliances: Critical (equipment may be damaged -- immediate action required, NCR mandatory), Major (preservation activity missed by > 1 cycle -- corrective action within 7 days, NCR recommended), Minor (documentation gap or minor deviation -- corrective action within 14 days)
5. Issue Non-Conformance Reports for Critical and Major findings with required root cause analysis and corrective action
6. Track NCR resolution: root cause identified, corrective action implemented, equipment assessed for damage, preventive action to avoid recurrence
7. Report audit results monthly to the Construction Manager and Asset Management agent with trend analysis showing compliance rate trajectory

### Step 4: Monitor Environmental Threats and Adjust Program

1. Monitor site environmental conditions continuously: temperature, humidity, rainfall, dust levels, wind speed and direction (for salt spray in coastal locations)
2. Identify periods of elevated environmental threat: sustained humidity > 80% (accelerates corrosion), temperature cycling through dew point (causes condensation inside equipment), dust storms or adjacent earthworks (particulate ingress risk), coastal wind shifts (salt spray direction changes)
3. Issue preservation alerts during elevated threat periods with specific additional measures: increase inspection frequency, verify all seals and covers, check desiccant condition, increase megger testing frequency for electrical equipment
4. Track megger (insulation resistance) trends for all electrical equipment: plot readings over time, establish decline rate, and flag equipment where insulation resistance is approaching minimum acceptable values -- this is the earliest indicator of moisture ingress and impending insulation failure
5. Monitor rotating equipment bearing condition where possible: ultrasonic or vibration measurements during shaft rotation to detect brinelling, corrosion, or contamination that may not be visible externally
6. Adjust preservation frequencies based on environmental data and audit findings: if a particular equipment class shows repeated issues (e.g., instrument transmitters with condensation), increase preservation frequency and enhance protection measures for that class
7. Document all program adjustments with justification and communicate to all responsible parties

### Step 5: Prepare Equipment for Commissioning Handover

1. At T-30 days before system pre-commissioning, conduct a comprehensive preservation status review for all equipment in the system
2. Verify that all preservation activities are current (no overdue activities) and that all NCRs are closed with verified corrective actions
3. Conduct final preservation audit for the system: verify equipment condition is suitable for commissioning start, identify any equipment requiring remediation before commissioning (e.g., motor re-megger, pump bearing replacement, instrument re-calibration)
4. Prepare the equipment preservation history package per equipment tag: complete preservation activity log, all audit reports, megger trend plots (electrical equipment), NCR history and resolution, final condition assessment
5. Transfer the preservation history package to the Asset Management agent as part of the equipment health baseline -- this data establishes the starting condition of the equipment and is critical for warranty claims and early-life failure analysis
6. De-preserve equipment per manufacturer's de-preservation instructions: remove desiccant, remove VCI protection, remove flange covers (at appropriate point in commissioning sequence), disconnect temporary heating circuits, verify all preservation materials are removed from equipment internals
7. Formally hand over equipment from preservation program to commissioning team with documented condition assessment and any outstanding concerns

---

## Failure Modes & Common Pitfalls

| Failure Mode | Root Cause | Prevention Strategy |
|-------------|------------|---------------------|
| Shaft rotation not performed on schedule | No one assigned responsibility; rotating equipment in remote areas of site forgotten | Assign named responsible person per equipment; use mobile app with GPS verification of visit |
| Motor insulation degradation from moisture | Space heaters not energized or failed; no megger trending to detect decline | Verify heater circuits at equipment installation; monthly megger testing with trend analysis; alarm at decline threshold |
| Instrument damage from construction dust | Instrument covers removed for inspection and not replaced; adjacent grinding/welding generates airborne particles | Lock-out protocol for instrument covers; 5-meter exclusion zone for grinding/welding near unprotected instruments |
| Bearing brinelling from vibration | Adjacent piling, blasting, or heavy equipment operation transmits vibration to installed equipment with stationary shafts | Vibration monitoring near sensitive equipment; accelerate shaft rotation during vibration-inducing activities |
| Vendor preservation requirements not obtained | Vendor documentation delayed or incomplete; preservation starts without manufacturer requirements | Make preservation instructions a priority vendor deliverable; apply conservative defaults until manufacturer data available |
| Nitrogen blanket lost on preserved vessels | Leak in temporary blanket system; no monitoring of blanket pressure | Weekly pressure checks; alarm system on critical vessels; maintain nitrogen supply for replenishment |
| Preservation program demobilized before commissioning complete | Construction preservation team released before all systems handed to commissioning | Maintain preservation team until last system enters commissioning; budget for extended preservation period |

---

## Escalation Protocols

| Trigger | Timeline | Escalation Path |
|---------|----------|-----------------|
| Critical preservation NCR (equipment damage likely) | Immediately | Preservation Coordinator -> Construction Manager -> Asset Management -> Project Manager |
| Megger reading below 50% of baseline for any motor > 100 kW | Within 24 hours | Electrical Supervisor -> Preservation Coordinator -> Engineering -> Asset Management |
| Preservation activity compliance drops below 90% for any contractor | Weekly review | Preservation Coordinator -> Construction Manager -> Contractor PM |
| Vendor preservation instructions not available 30 days after equipment receipt | Day 30 post-receipt | Preservation Coordinator -> Procurement Manager -> Vendor Account Manager |
| Severe weather event (storm, flood, extended extreme conditions) | During event | Preservation Coordinator -> Construction Manager -> all Contractors (emergency preservation measures) |
| Equipment warranty voided due to preservation non-compliance | Upon warranty claim rejection | Construction Manager -> Project Manager -> Project Director -> Legal (contract review) |

---

## Quality Criteria

| Dimension | Weight | Target | Measurement |
|-----------|--------|--------|-------------|
| Technical Accuracy | 30% | Preservation activities match manufacturer requirements; megger trending technically valid | Cross-reference audit against vendor documentation; electrical engineer review of megger data |
| Completeness | 25% | All equipment items in preservation database; all manufacturer requirements captured; no gaps | Equipment register vs. preservation database reconciliation |
| Consistency | 15% | Preservation frequencies consistent with equipment class and exposure conditions | Audit of preservation schedule vs. environmental conditions and manufacturer requirements |
| Format | 10% | Professional reports, clear preservation data sheets, consistent tracking format | Template compliance check |
| Actionability | 10% | Preservation schedule directly usable by field crews; audit checklists practical for inspectors | Field crew and inspector feedback |
| Traceability | 10% | Every preservation activity traceable to manufacturer requirement; every NCR traceable to audit finding | Traceability audit for sample of preservation activities and NCRs |

---

## Inter-Agent Dependencies

### Inputs From

| Agent / Skill | Data Required | Criticality |
|---------------|---------------|-------------|
| Engineering Design (vendor documentation) | Manufacturer preservation requirements per equipment model | Critical |
| Asset Management (create-asset-register) | Equipment register with tag numbers, types, criticality, and locations | Critical |
| plan-construction-sequence | Equipment installation dates and system MC dates for preservation duration calculation | Critical |
| manage-site-logistics | Storage facility conditions and laydown area environmental exposure levels | High |
| manage-field-quality (NCR process) | Non-conformance reporting process for preservation violations | High |

### Outputs Consumed By

| Agent / Skill | Data Provided | Trigger |
|---------------|---------------|---------|
| manage-mechanical-completion | Preservation status per equipment for MC readiness assessment | At MC-30 and MC milestone |
| Operations | Equipment condition assessment at handover (preservation history) | At system RFSU |
| Asset Management | Equipment health baseline data (megger trends, bearing condition, preservation history) | At system commissioning |
| verify-construction-quality | Preservation NCR data for construction quality trending | Monthly |
| Contracts & Compliance | Warranty compliance evidence (preservation records) for warranty claims | On warranty claim |

---

## References

- **VSC OR Playbook** -- Equipment Preservation During Construction section (Level 4)
- **NACE SP0198** -- Control of Corrosion Under Thermal Insulation and Fireproofing Materials (preservation of insulated equipment)
- **IEEE 43** -- Recommended Practice for Testing Insulation Resistance of Electric Machinery (megger testing standards)
- **API 686** -- Recommended Practice for Machinery Installation and Installation Design (rotating equipment preservation)
- **ISO 55001:2014** -- Asset Management: equipment care requirements during pre-operational phase

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-25 | Initial creation -- Wave 3 |
