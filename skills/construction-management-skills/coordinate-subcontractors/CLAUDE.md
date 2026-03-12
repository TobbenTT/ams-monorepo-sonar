---
name: coordinate-subcontractors
description: "Coordinate subcontractor mobilization, schedule integration, resource tracking, interface management, and performance evaluation across construction packages. Triggers: 'subcontractor coordination', 'contractor management', 'coordinacion de contratistas', 'gestion de subcontratos', 'contractor performance', 'work front allocation'."
---

# Coordinate Subcontractors

## Skill ID: CM-003

## Version: 1.0.0

## Category: C-Planning (Construction Management)

## Priority: P2 - High

---

## Purpose

Coordinate subcontractor mobilization, schedule integration, resource tracking, interface management, and performance evaluation across all construction packages, ensuring multiple contractors work harmoniously toward project milestones without conflicts, resource contention, or interface gaps.

Large capital projects in the mining, oil & gas, and energy sectors typically engage 5-15 subcontractors working simultaneously across overlapping geographical areas and shared infrastructure. Without active coordination, contractors compete for work fronts, crane time, laydown areas, and shared utilities. Interface gaps between adjacent scopes create rework, claims, and schedule delays. Industry data from CII and IPA shows that poor subcontractor coordination is responsible for 15-25% of construction schedule overruns, with interface-related rework accounting for 5-10% of total installed cost.

This skill provides a structured framework for managing the full subcontractor lifecycle: from mobilization readiness verification through daily coordination of work fronts, shared resources, and interfaces, to performance monitoring using balanced scorecards covering schedule adherence, quality, safety, and commercial compliance. The integration with schedule, quality, safety, and commercial management ensures that contractor performance is measured holistically, not just on progress.

Key value drivers:
- **Schedule protection**: Proactive work-front and resource conflict resolution prevents downstream delays
- **Interface integrity**: Formal interface agreements and tracking eliminate scope gaps and overlaps
- **Performance transparency**: Balanced scorecards provide objective, data-driven contractor performance assessment
- **Claim mitigation**: Documented coordination records reduce exposure to contractor delay and disruption claims
- **Safety culture**: Contractor safety performance tracking and benchmarking drives safety culture across the site

In Chilean and Latin American projects, additional considerations include compliance with Decreto Supremo 76 (subcontracting regulations), DT-ORD requirements for contractor workforce management, and the Ley de Subcontratacion (Ley 20.123) that establishes joint liability for labor obligations.

---

## Intent & Specification

The AI agent MUST understand that:

1. **Mobilization Readiness**: Before any contractor mobilizes to site, a formal mobilization readiness check must confirm: contract executed, insurance certificates current, safety induction requirements met, quality plans approved, key personnel on-boarded, equipment and temporary facilities identified, and work permits obtained. Incomplete mobilization readiness is the leading cause of unproductive early weeks on site.
2. **Schedule Integration**: Each contractor's detailed schedule must be integrated into the master construction schedule with logic ties at interface points. Weekly schedule alignment meetings must verify that contractor activities remain synchronized, shared milestones are achievable, and resource peaks do not create conflicts.
3. **Work-Front Allocation**: At any given time, multiple contractors may need access to the same physical area. A formal work-front allocation system assigns priority, defines access windows, manages shared cranes and heavy lifts, and resolves conflicts before they cause productive-time losses.
4. **Interface Agreements**: Every boundary between adjacent contractor scopes must be covered by a formal interface agreement defining: physical handover points, documentation requirements, quality standards at the interface, and the party responsible for each interface activity. Interface agreements must be signed before work begins at the interface.
5. **Performance Scoring**: Contractor performance must be measured using a balanced scorecard covering schedule adherence (SPI), quality (NCR rate), safety (TRIR, observations), and commercial compliance (claim management, variation control). Scores are published monthly and feed into contractor retention/extension decisions.

### Constraints

- All contractors must attend weekly coordination meetings; non-attendance is escalated to contractor management
- Work-front conflicts must be resolved within 24 hours; unresolved conflicts escalate to Construction Manager
- Interface agreements must be signed before work begins at any interface boundary
- Contractor performance scores are confidential between owner and individual contractor; comparative rankings are anonymized
- Mobilization checklists must be 100% complete before contractor is authorized to begin productive work
- Chilean Ley 20.123 (Subcontracting Law) compliance must be verified for all subcontractors
- Contractor workforce records must comply with DT-ORD and local labor authority requirements

---

## Trigger / Invocation

```
/coordinate-subcontractors
```

### Natural Language Triggers
- "What is the mobilization status for the new electrical contractor?"
- "Show me work-front conflicts for next week"
- "Generate contractor performance scorecard for this month"
- "Cual es el estado de movilizacion del contratista mecanico?"
- "Mostrar conflictos de frentes de trabajo para la proxima semana"
- "Generar evaluacion de desempeno de contratistas"

### Command Triggers
- `coordinate-subcontractors mobilization --contractor [name] --action [check|approve|report]`
- `coordinate-subcontractors schedule --view [integration|conflicts|lookahead] --period [1w|2w|4w]`
- `coordinate-subcontractors workfront --area [area-id] --date [YYYY-MM-DD] --action [allocate|conflict-check]`
- `coordinate-subcontractors interface --id [interface-id] --action [create|update|status]`
- `coordinate-subcontractors performance --contractor [name|all] --period [monthly|quarterly]`

### Automatic Triggers

| Trigger Condition | Action | Priority |
|-------------------|--------|----------|
| New contractor mobilization date T-30 days | Generate mobilization readiness checklist | High |
| Work-front conflict detected in 2-week look-ahead | Alert coordination team with conflict details | High |
| Interface work starting in T-14 days without signed agreement | Escalation to Construction Manager | Critical |
| Monthly reporting cycle | Generate contractor performance scorecards | High |
| Contractor SPI falls below 0.85 for 2 consecutive weeks | Alert Construction Manager; schedule recovery meeting | Critical |
| Contractor safety incident (recordable) | Immediate notification to HSE and Construction Manager | Critical |

---

## Input Requirements

### Required Inputs

| Input | Source | Format | Description |
|-------|--------|--------|-------------|
| Contract Scope Documents | Contracts & Compliance | .pdf / .docx | Contract scope, terms, milestones, and KPI requirements per contractor |
| Master Construction Schedule | Execution (Project Controls) | .xer / .xml | Integrated project schedule with contractor activities and logic ties |
| Site Layout and Area Plans | Engineering / Site Management | .dwg / .pdf | Physical site layout showing work areas, laydown zones, access routes |
| HSE Requirements | HSE Agent | .pdf / .xlsx | Site safety rules, induction requirements, PTW procedures, emergency plans |
| Contractor Mobilization Plans | Contractors | .pdf / .xlsx | Each contractor's resource plan, equipment list, and mobilization timeline |

### Optional Inputs

| Input | Source | Format | Default if Absent |
|-------|--------|--------|-------------------|
| Previous Project Contractor Data | VSC Knowledge Base | .xlsx | No historical performance baseline; industry benchmarks applied |
| Labor Relations Agreements | HR / Legal | .pdf | Standard Chilean labor law requirements applied |
| Claims Register | Commercial Management | .xlsx | Claims tracked independently per contractor |
| Environmental Constraints | HSE / Environmental | .pdf | Standard site environmental management plan applied |

### Context Enrichment

The agent will automatically:
- Generate mobilization readiness checklists from contract requirements and site rules
- Create interface matrix identifying all contractor-to-contractor boundaries from scope documents
- Map work-front allocations against the 2-week look-ahead schedule to identify conflicts
- Retrieve contractor performance benchmarks from VSC knowledge base by industry sector
- Cross-reference contractor safety statistics with site HSE database
- Validate Chilean regulatory compliance requirements (Ley 20.123, DS 76, DT-ORD)

---

## Output Specification

### Filename Format
`{ProjectCode}_Subcontractor_Coordination_{Period}_{YYYYMMDD}.xlsx`

### Structure

1. **Coordination Dashboard** -- Overview of all active contractors showing: mobilization status, current headcount, schedule performance (SPI), quality performance (NCR rate), safety performance (TRIR), and overall performance score with traffic-light indicators.

2. **Mobilization Status** -- Per-contractor mobilization readiness checklist tracking: contract execution, insurance, safety induction, quality plan approval, key personnel, equipment, temporary facilities, and work permits. Traffic-light status per item and overall.

3. **Schedule Integration** -- Integrated look-ahead schedule (2-week and 4-week) showing all contractor activities, shared milestones, logic ties, resource conflicts, and critical path activities. Conflict resolution log with status tracking.

4. **Work-Front Allocation** -- Area-by-area allocation matrix showing which contractor has priority access to each area by date, shared resource scheduling (cranes, heavy lifts, scaffolding), and conflict resolution records.

5. **Interface Register** -- All contractor-to-contractor interfaces with: interface ID, adjacent contractors, physical boundary, scope boundary, interface agreement status (Draft/Signed/Active/Closed), outstanding actions, and responsible coordinator.

6. **Performance Scorecards** -- Per-contractor balanced scorecards with weighted scoring across schedule (30%), quality (25%), safety (25%), and commercial compliance (20%). Trend charts showing performance evolution over time.

### Key Metrics Table

| Metric | Unit | Calculation | Target |
|--------|------|-------------|--------|
| Mobilization Readiness | % | Checklist items complete / total items | 100% before productive work |
| Work-Front Conflict Resolution | Hours | Time from conflict identification to resolution | < 24 hours |
| Interface Agreement Coverage | % | Signed agreements / identified interfaces | 100% before interface work |
| Contractor Schedule Performance (SPI) | Ratio | Earned schedule / planned schedule per contractor | >= 0.90 |
| Coordination Meeting Attendance | % | Contractor representatives attending / required | 100% |

---

## Procedure

### Step 1: Establish Coordination Framework

1. Identify all contractors to be active on site with their scopes, contract types, and planned mobilization dates
2. Create the interface matrix mapping every contractor-to-contractor boundary (physical and functional)
3. Define work-front allocation rules: priority hierarchy based on critical path, safety considerations, and contractual milestones
4. Establish weekly coordination meeting structure: attendees, agenda template, action tracking protocol
5. Define performance scorecard methodology: KPIs, weightings, data sources, scoring thresholds, and reporting frequency
6. Create mobilization readiness checklist template incorporating contract requirements, site rules, and Chilean regulatory requirements (Ley 20.123 compliance verification)
7. Set up shared coordination tools: schedule integration platform, conflict tracking log, interface register

### Step 2: Manage Mobilization

1. Issue mobilization readiness checklist to contractor 30 days before planned mobilization date
2. Track checklist completion weekly: contract execution, insurance certificates, key personnel CVs, quality plan submission, equipment certification, safety induction scheduling
3. Conduct mobilization readiness review at T-7 days with Construction Manager, HSE, and Quality representatives
4. Verify Chilean Ley 20.123 compliance: subcontracting declarations filed with Direccion del Trabajo, worker social security certificates current, labor obligation certificates (F30-1) obtained
5. Issue mobilization authorization only when checklist is 100% complete; document any conditional approvals with specific conditions and deadlines
6. Support contractor site establishment: laydown area assignment, temporary facilities, utilities connection, IT/communications setup
7. Conduct contractor kickoff meeting covering: scope confirmation, schedule alignment, quality expectations, safety rules, coordination protocols

### Step 3: Coordinate Daily Operations

1. Conduct daily coordination meetings (15-minute stand-ups) with all active contractor superintendents covering: today's planned activities, resource needs, access requirements, safety concerns, and interface activities
2. Manage work-front allocation for the current day and next day: confirm area access, crane scheduling, heavy lift coordination, scaffolding availability
3. Resolve work-front conflicts using the priority hierarchy; document conflict, resolution, and any productive time lost
4. Monitor interface activities: verify interface agreement provisions are being followed, inspect work at interface boundaries, and resolve interface quality or scope disputes
5. Track contractor daily headcount and equipment utilization against their resource plans
6. Document coordination decisions in the daily construction log for claim defense purposes
7. Communicate schedule changes, engineering clarifications, and management decisions to affected contractors within 4 hours of decision

### Step 4: Monitor Performance

1. Collect weekly data from each contractor: progress (from track-construction-progress), quality (from manage-field-quality), safety (from monitor-construction-safety), and commercial (from contracts management)
2. Calculate performance scorecard metrics per contractor using agreed weightings (schedule 30%, quality 25%, safety 25%, commercial 20%)
3. Compare contractor performance against targets and against peer contractors (anonymized ranking)
4. For underperformance (score <70%): schedule contractor performance improvement meeting within 5 business days
5. For sustained underperformance (score <70% for 3+ months): escalate to Project Director for contractual remedies consideration
6. Publish monthly performance scorecards to contractor management with specific improvement actions required
7. Track improvement action implementation and measure effectiveness in subsequent scoring periods

### Step 5: Manage Interfaces and Claims

1. Conduct monthly interface status review: verify all identified interfaces have signed agreements, review interface work quality, identify new interfaces from scope changes
2. Document all interface non-conformances with photo evidence and responsible party determination
3. Manage interface dispute resolution: gather evidence from both parties, apply contract provisions, propose resolution to Construction Manager
4. Track contractor claims and variations: log all notices, assess validity against coordination records, coordinate with Commercial Manager for formal response
5. Maintain claim defense documentation: daily coordination logs, work-front allocation records, notification records, meeting minutes
6. Produce monthly subcontractor coordination report consolidating all coordination activities, performance data, interface status, and commercial matters

---

## Failure Modes & Common Pitfalls

| Failure Mode | Root Cause | Prevention Strategy |
|-------------|-----------|---------------------|
| Contractor mobilizes unprepared | Mobilization checklist shortcuts under schedule pressure | Absolute gate: no productive work without 100% mobilization checklist |
| Work-front conflicts cause lost productive time | Inadequate look-ahead planning; conflicts discovered day-of | 2-week look-ahead conflict analysis; mandatory pre-resolution |
| Interface gaps discovered during installation | Interface agreements incomplete or absent | Interface matrix completed before work begins; regular interface walkdowns |
| Contractor underperformance not addressed early | Performance data collected but not acted upon | Monthly scorecards with mandatory improvement plans for <70% scores |
| Claims escalate due to poor documentation | Coordination decisions not recorded | Daily construction log documenting all decisions, instructions, and conflicts |
| Safety culture varies between contractors | Different safety standards per contractor | Unified site safety rules; contractor safety performance ranking visible to all |
| Ley 20.123 non-compliance discovered | Subcontracting compliance not monitored | Monthly compliance audits; F30-1 certificate tracking per contractor |

---

## Escalation Protocols

| Trigger | Timeline | Escalation Path |
|---------|----------|-----------------|
| Work-front conflict unresolved after 24 hours | Hour 24 | Construction Manager decision with documented rationale |
| Contractor misses coordination meeting 2 consecutive weeks | End of second week | Construction Manager -> Contractor Project Manager |
| Interface agreement not signed with interface work starting in <7 days | Immediately | Construction Manager -> Contract Manager -> Stop interface work |
| Contractor SPI below 0.85 for 2 consecutive weeks | End of second week | Construction Manager -> Contractor management -> Recovery plan in 5 days |
| Contractor safety TRIR exceeds site average by 2x | Within 48 hours | HSE Manager + Construction Manager -> Contractor safety stand-down |
| Contractor claims exceed 10% of contract value | Within 1 week | Commercial Manager -> Project Director -> Claims review meeting |
| Ley 20.123 non-compliance identified | Within 24 hours | Legal + HR -> Contractor management -> Corrective action within 48 hours |

---

## Quality Criteria

| Dimension | Weight | Target | Measurement |
|-----------|--------|--------|-------------|
| Technical Accuracy | 30% | Performance scores calculated correctly from verified source data | Score audit against source records |
| Completeness | 25% | All contractors tracked, all interfaces identified, all meetings documented | Coverage audit |
| Consistency | 15% | Scoring methodology applied uniformly across all contractors | Cross-contractor methodology review |
| Format | 10% | Professional reporting, VSC branding, clear scorecards | Visual QA review |
| Actionability | 10% | Every underperformance triggers specific improvement actions | Action tracking audit |
| Timeliness | 10% | Scorecards published within 5 days of month-end; conflicts resolved in 24h | Timestamp verification |

---

## Inter-Agent Dependencies

### Inputs From

| Agent | Data Required | Frequency | Criticality |
|-------|-------------|-----------|-------------|
| Contracts & Compliance | Contract terms, scope boundaries, KPI requirements, payment milestones | At award + variations | Critical |
| Execution (Project Controls) | Master schedule, look-ahead schedules, critical path analysis | Weekly | Critical |
| HSE | Safety requirements, induction records, incident data per contractor | Daily/Weekly | Critical |
| manage-field-quality | Quality performance data (NCR rates) per contractor | Weekly | High |
| track-construction-progress | Progress data (SPI) per contractor | Weekly | High |

### Outputs Consumed By

| Consumer Agent | Data Provided | Frequency | Usage |
|----------------|-------------|-----------|-------|
| Execution (Schedule) | Contractor resource availability, conflict impact on schedule | Weekly | Schedule update and recovery |
| Finance/Accounting | Payment milestone verification, claim status | Monthly | Payment processing |
| Orchestrator | Contractor performance KPIs, coordination health indicators | Monthly | Management reporting, OR gate reviews |
| HSE | Contractor safety ranking, safety stand-down triggers | Monthly | Safety management programs |
| Contracts & Compliance | Performance data for contract administration decisions | Quarterly | Retention/extension decisions |

---

## References

- **CII RT-012**: Construction Industry Institute -- Subcontractor management and coordination best practices
- **AACE RP 96R-18**: Commissioning and Startup -- contractor coordination during pre-operational phase
- **Ley 20.123 (Chile)**: Ley de Subcontratacion -- joint liability for labor obligations in subcontracting
- **DS 76 (Chile)**: Reglamento sobre subcontratacion -- compliance requirements for subcontractor management
- **FIDIC Conditions of Contract**: Multi-contractor coordination provisions and interface management

---

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-25 | VSC OR Team | Initial creation -- Wave 3 |
