---
name: manage-suggestion-system
description: "Administer employee suggestion system for continuous improvement ideas, tracking submissions through evaluation to implementation. Triggers: 'suggestion system', 'improvement ideas', 'employee suggestions', 'idea management', 'kaizen suggestions', 'sistema de sugerencias', 'ideas de mejora', 'buzon de ideas'."
---

# Manage Suggestion System

## Skill ID: E-SGS-001

## Version: 1.0.0

## Category: E - Integration

## Priority: P3 - Medium (employee engagement and continuous improvement culture enabler)

---

## Purpose

Design, administer, and optimize an employee suggestion system that captures, evaluates, prioritizes, tracks, and recognizes continuous improvement ideas from all levels of the workforce. In industrial operations (mining, oil & gas, chemicals, energy), frontline operators and maintenance technicians possess irreplaceable tacit knowledge about equipment behavior, process inefficiencies, safety hazards, and improvement opportunities that never surface through formal management channels.

World-class industrial organizations generate 20-40 suggestions per employee per year (Toyota benchmark: 40+), with implementation rates exceeding 80%. By contrast, most organizations outside Japan achieve fewer than 1 suggestion per employee per year with implementation rates below 30%. The difference lies not in workforce capability but in system design: low-friction submission, transparent evaluation, rapid feedback loops, meaningful recognition, and visible implementation that reinforces participation.

This skill covers the complete suggestion system lifecycle: system design (submission channels, workflows, governance), evaluation framework (criteria weighting, scoring methodology, approval authority), implementation tracking (action items, timelines, verification), recognition programs (tiered rewards, visibility, career linkage), and performance reporting (participation rates, implementation rates, value generated, system health metrics).

---

## Intent & Specification

The AI agent MUST understand and execute the following:

1. **Low-Friction Submission, Structured Evaluation**: The system must minimize barriers for submitters (simple forms, multiple channels -- digital app, physical box, verbal to supervisor) while providing evaluators with structured, consistent assessment tools. A suggestion system that is easy to submit to but rigorous in evaluation achieves both volume and quality. The submission form should capture the minimum viable information: problem/opportunity description, proposed solution (optional -- many valid suggestions identify problems without solutions), affected area, and suggested category.

2. **Standard Suggestion Categories**: All suggestions must be classified into one of six categories for routing and analysis: (a) Safety -- hazard identification, risk reduction, PPE improvement, ergonomic enhancement; (b) Quality -- product quality, process consistency, inspection improvement, defect prevention; (c) Productivity -- throughput increase, cycle time reduction, bottleneck elimination, uptime improvement; (d) Cost Reduction -- material savings, energy efficiency, waste elimination, inventory optimization; (e) Environment -- emissions reduction, waste management, resource conservation, compliance improvement; (f) Morale / Working Conditions -- workplace comfort, communication improvement, team collaboration, facility enhancement. Evaluation criteria must be consistent across categories: feasibility (technical and organizational), estimated impact (quantified where possible), implementation cost, strategic alignment, and urgency.

3. **Closed-Loop Feedback**: Every suggestion MUST receive a response within a defined timeframe (target: acknowledgment within 48 hours, evaluation result within 15 business days). The number one killer of suggestion systems is the "black hole" effect -- employees submit ideas and never hear back. The system must enforce: (a) automatic acknowledgment upon submission, (b) status tracking visible to the submitter, (c) written evaluation feedback (whether accepted, deferred, or declined -- with reasoning), (d) implementation progress updates for accepted suggestions, (e) closure notification with results achieved.

4. **KPIs for System Health**: The suggestion system itself must be measured with leading and lagging indicators. Leading: participation rate (suggestions per employee per year -- target: >5 for developing programs, >12 for mature programs), submission volume trend (growing, stable, declining), time-to-evaluate (days from submission to decision). Lagging: implementation rate (accepted suggestions implemented / total accepted -- target: >80%), value generated (annualized savings or value from implemented suggestions), recognition coverage (% of implemented suggestions that received formal recognition).

5. **Tiered Recognition Program**: Recognition must be multi-layered and timely: (a) Immediate -- automatic thank-you upon submission, digital badge/point; (b) Monthly -- highlight top 3-5 suggestions in team meetings, newsletter, notice boards; (c) Quarterly -- award ceremony, certificates, modest monetary/gift rewards for best implemented suggestions; (d) Annual -- innovation awards, career development linkage (suggestion contributions in performance reviews), significant monetary awards for high-impact implementations. Recognition must be visible to the entire workforce -- not just the individual -- to demonstrate that the organization values and acts on employee input.

6. **Integration with Kaizen and PDCA**: Small suggestions that require minimal investment (<$5,000 and <40 hours to implement) should flow through a rapid implementation track managed by area supervisors. Larger suggestions that require cross-functional coordination, significant investment, or engineering analysis should be escalated to Kaizen events (focused improvement workshops) or formal PDCA (Plan-Do-Check-Act) improvement projects. The suggestion system feeds the continuous improvement pipeline, not replace it.

7. **Digital and Physical Submission Channels**: In industrial environments, many frontline workers do not have regular access to computers or smartphones during their shifts. The system must support both digital channels (web app, mobile app, QR code-linked forms, email) and physical channels (suggestion boxes at key locations, verbal submissions recorded by supervisors on standardized forms). All channels must converge into a single tracking system for unified management.

8. **Language**: Spanish (Latin American) for all system documentation, submission forms, evaluation templates, recognition communications, and performance reports. English technical terms for CI methodologies (Kaizen, PDCA, Lean, Six Sigma) preserved as standard alongside Spanish equivalents.

---

## Trigger / Invocation

```
/manage-suggestion-system
```

### Natural Language Triggers
- "Design an employee suggestion system for our plant"
- "Set up a continuous improvement idea management process"
- "Track and evaluate employee suggestions"
- "Create a Kaizen suggestion program"
- "Report on suggestion system performance and participation"
- "How do we close the loop on employee improvement ideas?"
- "Disenar un sistema de sugerencias para la planta"
- "Gestionar las ideas de mejora de los empleados"
- "Crear un programa de buzon de ideas y reconocimiento"
- "Reportar el desempeno del sistema de sugerencias"

### Aliases
- `/suggestion-system`
- `/idea-management`
- `/kaizen-suggestions`

---

## Input Requirements

### Required Inputs

| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `organizational_scope` | Organizational units, plants, or areas covered by the suggestion system | Text or structured list | User / HR |
| `workforce_size` | Total headcount within scope, broken down by role category (operators, maintenance, supervisors, engineers, admin) | Number / table | HR |
| `current_state` | Description of existing suggestion or CI processes (if any), current participation levels, known pain points | Text / .docx | User / CI department |

### Optional Inputs (Highly Recommended)

| Input | Description | Default if Absent |
|-------|-------------|-------------------|
| `existing_submissions` | Historical suggestion data: submissions, evaluations, implementations, outcomes | Build system from scratch without baseline data |
| `evaluation_criteria` | Organization-specific evaluation criteria and weightings | Use default VSC evaluation framework |
| `recognition_budget` | Annual budget allocated for suggestion program recognition and rewards | Design recognition program emphasizing non-monetary recognition |
| `it_platform` | Available IT infrastructure for digital submission (intranet, mobile app, SharePoint, Airtable) | Design for project-database as primary platform |
| `management_commitment_statement` | Written endorsement from site/plant management supporting the program | Draft template for management approval |
| `ci_maturity_level` | Current continuous improvement maturity (Level 1-5 per Shingo model or similar) | Assess from current state description |
| `industry_benchmarks` | Peer organization suggestion system performance data | Use Toyota/JIPM and industry-generic benchmarks |
| `union_consultation_requirements` | Union agreements or consultation requirements related to employee programs | Design without union-specific provisions; flag for review |
| `reward_policy_constraints` | Corporate policies limiting monetary rewards, gift values, or recognition formats | Design within typical industrial constraints ($25-$500 per suggestion tier) |

### Context Enrichment
- Retrieve existing CI documentation, Kaizen event records, and PDCA project logs from `mcp-sharepoint` to understand the current improvement infrastructure and integrate the suggestion system.
- Access workforce demographics and organizational structure from HR systems to design appropriate submission channels and routing workflows.
- Pull operational KPI trends from `project-database` to identify areas where employee suggestions could have the highest impact (low OEE areas, high incident rates, quality issues).
- Review HSE incident reports and near-miss data to understand safety suggestion potential and ensure the suggestion system complements existing hazard reporting processes.
- Examine existing recognition and reward programs to ensure the suggestion system recognition design is consistent with organizational culture and HR policies.

---

## Output Specification

### Document: Suggestion System Management Package (.docx)

**Filename**: `VSC_SuggestionSystem_{ProjectCode}_{Version}_{Date}.docx`

**Structure**:

1. Resumen Ejecutivo (2-3 pages)
   - System design overview and objectives
   - Key performance targets (participation, implementation, value)
   - Resource requirements and timeline for launch
   - Expected ROI and cultural impact

2. Diseno del Sistema (8-12 pages)
   - 2.1 Submission Process
     - Digital submission channels (web form, mobile app, QR code, email)
     - Physical submission channels (suggestion boxes, supervisor-recorded)
     - Submission form design with minimum viable fields
     - Category classification guide with examples
   - 2.2 Evaluation Workflow
     - Stage-gate evaluation process (initial screening -> technical evaluation -> approval/prioritization)
     - Evaluator roles and responsibilities (area supervisor, CI coordinator, technical SME, management committee)
     - Escalation paths for cross-functional or high-investment suggestions
     - Timeline commitments per stage (48h acknowledgment, 15-day evaluation)
   - 2.3 Approval Matrix
     - Authority levels by suggestion category and estimated implementation cost
     - Quick-win track (<$5,000 / <40 hours): area supervisor approval
     - Standard track ($5,000-$50,000): CI committee approval
     - Strategic track (>$50,000): management committee approval
   - 2.4 Feedback Loop Design
     - Automated acknowledgment workflow
     - Status tracking interface for submitters
     - Evaluation feedback template (accepted/deferred/declined with reasoning)
     - Implementation progress notification cadence
     - Closure notification with results achieved

3. Marco de Evaluacion (5-7 pages)
   - Evaluation criteria definitions and scoring scales (1-5)
   - Weighting factors by category
   - Scoring rubric with examples for each criterion
   - Calibration guidance for evaluators to ensure consistency
   - Decision rules: minimum score for acceptance, tie-breaking protocol

4. Dashboard de Estado Actual (3-5 pages)
   - Current suggestion pipeline: submitted, under evaluation, accepted, in implementation, completed, declined
   - Funnel analysis: conversion rates at each stage
   - Aging analysis: suggestions exceeding timeline targets
   - Category distribution and department participation rates

5. Tracker de Implementacion (3-5 pages)
   - Action item register for accepted suggestions
   - Implementation timeline with milestones
   - Resource allocation tracking
   - Verification and validation methodology (was the improvement achieved?)
   - Benefit realization tracking (estimated vs. actual value)

6. Reporte de Desempeno (4-6 pages)
   - System KPIs: participation rate, implementation rate, time-to-evaluate, value generated
   - Trend analysis: monthly/quarterly suggestion volume and quality trends
   - Benchmarking against industry standards and targets
   - Area/department comparison and participation heat map
   - Qualitative health indicators: submitter satisfaction, evaluator workload, management engagement

7. Diseno del Programa de Reconocimiento (4-6 pages)
   - Tiered recognition structure (immediate, monthly, quarterly, annual)
   - Recognition methods by tier: digital badges, certificates, public acknowledgment, monetary rewards
   - Budget allocation per tier and per suggestion category
   - Communication plan for publicizing recognized suggestions
   - Integration with performance review and career development processes

8. Anexos
   - Submission form templates (digital and physical)
   - Evaluation scorecard template
   - Implementation tracking template
   - Recognition certificate templates
   - Communication materials (launch poster, FAQ, manager briefing)

### Supporting Deliverable: Suggestion Tracking Database (.airtable)

**Platform**: Airtable via project-database

**Tables**:

| Table | Content |
|-------|---------|
| `Suggestions` | All submissions with ID, submitter, date, category, description, status, evaluation score, assigned evaluator |
| `Evaluations` | Evaluation records linked to suggestions: criteria scores, comments, decision, evaluator name, date |
| `Implementation` | Implementation actions linked to accepted suggestions: tasks, owners, due dates, completion status, verification |
| `Recognition` | Recognition events linked to suggestions: type, date, recipient, award details, public/private |
| `KPI Dashboard` | Calculated KPIs: participation rate, implementation rate, pipeline aging, value generated, trend data |

---

## Methodology & Standards

### Primary Standards

| Standard | Application |
|----------|-------------|
| Toyota Suggestion System (Toyota Creative Idea Suggestion System) | Gold standard for high-volume, high-implementation suggestion systems; target: 40+ ideas/employee/year, >90% implementation |
| Kaizen Teian (Improvement Proposal) | Formal Kaizen methodology for small, incremental improvements submitted by individuals; emphasis on implementation over evaluation |
| ISO 9001:2015 Clause 10.1 | Requirement for organizations to determine and select opportunities for improvement; suggestion systems are a recognized mechanism |
| ISO 9001:2015 Clause 7.3 | Awareness -- persons doing work under the organization's control shall be aware of their contribution to the effectiveness of the QMS, including benefits of improved performance |
| EFQM Model (Criterion 3: People) | European Foundation for Quality Management emphasis on people engagement, empowerment, and recognition as driver of organizational excellence |
| Shingo Model (Cultural Enablers) | Enterprise excellence framework recognizing that respect for every individual and leading with humility creates the culture where suggestion systems thrive |
| ISO 45001:2018 Clause 5.4 | Consultation and participation of workers -- suggestion systems support worker participation in OH&S improvement |

### Suggestion Evaluation Framework

#### Evaluation Criteria and Scoring (Default)

| Criterion | Weight | Score 1 (Low) | Score 3 (Medium) | Score 5 (High) |
|-----------|--------|---------------|-------------------|-----------------|
| Feasibility | 25% | Requires technology not available, major redesign, or regulatory change | Achievable with moderate investment and available resources | Simple to implement with existing resources and capabilities |
| Impact (Quantified) | 30% | Minimal measurable impact (<$1K/year or qualitative only) | Moderate impact ($1K-$25K/year or clear qualitative benefit) | High impact (>$25K/year or significant safety/quality improvement) |
| Implementation Cost | 15% | >$50K investment required | $5K-$50K investment | <$5K or no investment needed |
| Strategic Alignment | 15% | No clear link to organizational objectives or priorities | Supports one or more organizational objectives | Directly advances a strategic priority or addresses a critical gap |
| Urgency | 15% | No time pressure; improvement would be nice to have | Moderate urgency; deteriorating condition or upcoming need | Critical urgency; immediate safety risk, regulatory deadline, or major loss ongoing |

**Decision Thresholds:**
- Score >= 3.5 (weighted average): Accept for implementation
- Score 2.5 - 3.49: Defer for further analysis or future implementation window
- Score < 2.5: Decline with written reasoning and encouragement to resubmit refined ideas

### Suggestion System Maturity Model

| Level | Participation Rate | Implementation Rate | Characteristics |
|-------|-------------------|---------------------|-----------------|
| Level 1: Nascent | <0.5 ideas/emp/year | <20% | Suggestion box exists but is rarely used; no formal process; sporadic feedback |
| Level 2: Developing | 0.5-2 ideas/emp/year | 20-40% | Formal process established; evaluation committee exists; feedback inconsistent |
| Level 3: Established | 2-8 ideas/emp/year | 40-60% | Digital platform; regular evaluation cadence; recognition program active |
| Level 4: Advanced | 8-20 ideas/emp/year | 60-80% | Part of daily management; area-level implementation authority; strong feedback culture |
| Level 5: World-Class | >20 ideas/emp/year | >80% | Embedded in culture; rapid implementation; ideas flow naturally; innovation culture |

---

## Step-by-Step Execution

### Phase 1: Assessment & Design (Steps 1-4)

**Step 1: Assess current state and CI maturity.**
- Review existing suggestion processes, CI programs, and improvement culture indicators.
- Interview or survey a sample of frontline workers, supervisors, and managers about their experience with suggesting improvements (barriers, motivation, past experiences).
- Assess IT infrastructure available for digital submission channels.
- Identify existing recognition programs and HR policy constraints on rewards.
- Determine current suggestion system maturity level (Level 1-5).
- Benchmark current performance against industry standards and Toyota/JIPM reference.

**Step 2: Define system scope and objectives.**
- Confirm organizational scope (which plants, areas, departments are included).
- Set participation and implementation targets aligned with maturity level (do not set Level 5 targets for a Level 1 organization; phased improvement approach).
- Define success criteria for the first 6 and 12 months of operation.
- Identify executive sponsor and CI coordinator roles.
- Establish the governance structure: who evaluates, who approves, who tracks.

**Step 3: Design the submission process.**
- Design the suggestion submission form (minimum viable: problem/opportunity description, proposed solution if any, affected area, category).
- Select digital channels based on available IT infrastructure (web form, mobile app, QR code poster, email to dedicated inbox).
- Design physical submission channels (suggestion boxes at cafeteria, locker rooms, control rooms; supervisor verbal recording form).
- Create a unified tracking system: all channels converge into a single database (project-database recommended).
- Define unique suggestion ID format: `SGS-{Area}-{YYYY}-{####}` (e.g., SGS-PLANT1-2026-0042).

**Step 4: Design the evaluation workflow and approval matrix.**
- Define the stage-gate process: (1) Initial Screening by CI coordinator (completeness, clarity, non-duplicate), (2) Technical Evaluation by area supervisor + SME (feasibility, impact scoring), (3) Approval by appropriate authority level based on implementation cost.
- Set authority levels: Quick-win (<$5K / <40h) = area supervisor; Standard ($5K-$50K) = CI committee; Strategic (>$50K) = plant management.
- Define timeline commitments: acknowledgment within 48 hours, initial screening within 5 business days, full evaluation within 15 business days, implementation start within 30 days of approval.
- Design the feedback template for each decision outcome (accepted, deferred, declined) with mandatory reasoning field.

### Phase 2: Framework Development (Steps 5-7)

**Step 5: Build the evaluation framework.**
- Define scoring criteria, scales, and weightings (use default VSC framework or client customization).
- Create scoring rubric with concrete examples for each criterion at each score level, calibrated to the specific industrial context.
- Develop evaluator training material: how to score consistently, common biases to avoid (novelty bias, seniority bias, area bias).
- Create calibration exercises: 5 sample suggestions scored by multiple evaluators to test inter-rater reliability before system launch.
- Define escalation rules for disagreements between evaluators.

**Step 6: Design the recognition program.**
- Map the tiered recognition structure to the organization's culture and budget:
  - Immediate tier: automated thank-you email/notification upon submission; digital participation badge.
  - Monthly tier: top 3-5 suggestions presented in area team meetings; featured on notice boards and intranet; small token (company-branded item, cafeteria voucher).
  - Quarterly tier: formal recognition event; certificate of appreciation from plant manager; monetary award ($50-$200) or equivalent gift; photo with management published internally.
  - Annual tier: innovation award ceremony; significant monetary award ($500-$5,000 based on value generated); career development opportunity (conference attendance, training program); external communication (company newsletter, LinkedIn).
- Integrate suggestion contributions into annual performance review criteria.
- Design the communication plan: launch poster, FAQ document, manager briefing deck, submitter guide.

**Step 7: Build the tracking database and dashboard.**
- Configure the Airtable database via project-database with tables for Suggestions, Evaluations, Implementation, Recognition, and KPIs.
- Set up automated workflows: acknowledgment email on submission, evaluator notification on assignment, overdue alerts for timeline breaches, status change notifications to submitters.
- Build the KPI dashboard: participation rate trend, pipeline funnel, implementation progress, aging analysis, category distribution, department heat map.
- Create management reporting views: monthly summary for CI committee, quarterly summary for plant management.

### Phase 3: Implementation Tracking & Reporting (Steps 8-10)

**Step 8: Process existing suggestions (if historical data provided).**
- Import existing suggestions into the tracking database, classifying each by status: pending evaluation, accepted (awaiting implementation), in implementation, completed, declined.
- Score un-evaluated suggestions using the defined evaluation framework.
- Identify overdue suggestions (submitted >30 days ago without evaluation) and escalate for immediate processing.
- Generate the "current state dashboard" showing the suggestion pipeline health.

**Step 9: Track implementation and benefit realization.**
- For each accepted suggestion, create implementation action items with owners, due dates, and milestones.
- Track implementation progress: not started, in progress (% complete), completed, verified.
- Verify each implemented suggestion: did the improvement achieve the expected result?
- Track benefit realization: estimated value at acceptance vs. actual measured value after implementation.
- Calculate cumulative value generated by the suggestion system (annualized).

**Step 10: Generate performance reports.**
- Calculate all system KPIs:
  - Participation rate: total suggestions / total employees (annualized)
  - Implementation rate: suggestions implemented / suggestions accepted
  - Average time-to-evaluate: mean business days from submission to evaluation decision
  - Average time-to-implement: mean business days from acceptance to completion
  - Value generated: total annualized savings/value from implemented suggestions
  - Recognition coverage: implemented suggestions formally recognized / total implemented
- Compare performance against targets and benchmarks.
- Identify system health issues: declining participation, evaluation bottlenecks, low implementation rate, recognition gaps.
- Recommend system improvements for the next period.

### Phase 4: System Optimization (Steps 11-12)

**Step 11: Analyze system effectiveness and engagement patterns.**
- Identify departments/areas with highest and lowest participation -- investigate drivers and barriers.
- Analyze suggestion quality trends: are suggestions becoming more impactful over time (indicating learning) or declining in novelty?
- Assess evaluator workload: are evaluators becoming bottlenecks? Is evaluation quality consistent?
- Review recognition program effectiveness: does recognition correlate with sustained participation?
- Identify integration opportunities with Kaizen events, PDCA projects, and formal improvement programs.

**Step 12: Deliver outputs and hand off to operational management.**
- Compile the Suggestion System Management Package (.docx) with all design documents, frameworks, templates, and current-state analysis.
- Configure the Airtable tracking database with all tables, views, automations, and dashboards.
- Deliver training materials for: submitters (how to use the system), evaluators (how to score consistently), CI coordinator (how to manage the pipeline), management (how to champion the program).
- Define the ongoing operating rhythm: weekly pipeline review by CI coordinator, monthly report to CI committee, quarterly report to plant management, annual system health review and optimization.

---

## Quality Criteria

### Content Quality (Target: >91% SME Approval)

| Criterion | Weight | Target |
|-----------|--------|--------|
| System design completeness | 25% | All workflow stages defined end-to-end: submission, evaluation, approval, implementation, recognition, closure; no orphan paths |
| Evaluation framework rigor | 20% | Criteria clearly defined with scoring rubric and examples; calibration process documented; inter-rater reliability addressed |
| Practical implementability | 20% | System is deployable with available IT infrastructure and resources; forms and templates are ready to use; no dependency on unavailable technology |
| Recognition program design | 15% | Multi-tiered, culturally appropriate, within budget constraints; both monetary and non-monetary elements; visibility and timeliness addressed |
| KPI and reporting framework | 10% | All system health KPIs defined with formulas, targets, and benchmarks; dashboard specification complete |
| Integration with CI ecosystem | 10% | Clear escalation path from suggestions to Kaizen events and PDCA projects; alignment with existing improvement programs |

### Automated Quality Checks

- [ ] Submission form captures minimum viable information (description, area, category) without overloading submitters
- [ ] Evaluation workflow has defined timeline commitments for each stage (48h acknowledgment, 15-day evaluation)
- [ ] Every suggestion status path leads to a submitter notification (no dead ends in the workflow)
- [ ] Approval matrix covers all cost ranges with clear authority levels
- [ ] Recognition program has at least 3 tiers (immediate, periodic, annual)
- [ ] KPIs include both leading (participation rate, time-to-evaluate) and lagging (implementation rate, value generated) indicators
- [ ] Tracking database schema supports all workflow stages and reporting requirements
- [ ] Templates are provided for: submission form, evaluation scorecard, implementation tracker, recognition certificate
- [ ] System design accounts for both digital and physical submission channels
- [ ] Decision feedback template includes mandatory reasoning field for declined suggestions
- [ ] Report language is Spanish with English CI methodology terms preserved as standard
- [ ] Maturity-appropriate targets set (not Level 5 targets for Level 1 organization)

---

## MCP Integrations

| MCP Server | Purpose | Operations |
|------------|---------|------------|
| **mcp-sharepoint** | Store suggestion system documentation, templates, and reports; retrieve existing CI program documents | `GET /files`, `POST /files`, `GET /lists` |
| **project-database** | Primary suggestion tracking database: submissions, evaluations, implementation, recognition, KPIs | `GET /records`, `POST /records`, `PATCH /records`, `GET /views` |
| **mcp-outlook** | Automated notifications: submission acknowledgment, evaluation assignment, status updates, recognition communications | `POST /messages`, `POST /events` |

---

## Inter-Agent Dependencies

### Upstream Dependencies

| Agent/Skill | Input Provided | Criticality |
|-------------|---------------|-------------|
| Operations: operational context (self) | Plant structure, workforce data, existing CI programs, operational KPIs | Critical |
| HSE Agent | Safety suggestion evaluation: HSE reviews and prioritizes safety-category suggestions; hazard reporting integration | High |
| Operations: `calculate-operational-kpis` | Operational performance data to identify areas where suggestions could have highest impact | Medium |
| Operations: `create-org-design` | Organizational structure for routing suggestions to correct evaluators | Medium |

### Downstream Dependencies

| Agent/Skill | Output Provided | Trigger |
|-------------|----------------|---------|
| Operations: PDCA and Kaizen integration (self) | Large suggestions escalated to Kaizen events or PDCA improvement projects | When suggestion exceeds quick-win threshold |
| Orchestrator: CI governance | Suggestion system KPIs for executive dashboards, program health reporting | Monthly / quarterly reporting cycle |
| Operations: `plan-training-program` | Training needs identified through suggestion analysis (recurring themes indicate skill gaps) | On analysis completion |
| Operations: `track-oee-metrics` (D-OEE-001) | Suggestions targeting OEE losses feed into OEE improvement pipeline | When suggestion targets production losses |

### Collaboration

| Agent/Skill | Collaboration Type | Description |
|-------------|-------------------|-------------|
| HSE Agent | Safety evaluation | All safety-category suggestions require HSE agent review before implementation approval |
| Contracts & Compliance Agent | Legal/regulatory review | Suggestions involving regulatory compliance, contract modifications, or union agreements require compliance review |
| Asset Management Agent | Technical feasibility | Equipment modification or maintenance strategy suggestions require asset management technical assessment |
| Execution Agent | Investment evaluation | Suggestions exceeding $50K implementation cost require project evaluation and CAPEX justification |

---

## Templates & References

### Templates
- `VSC_Suggestion_Form_Digital_v1.0.html` -- Web/mobile submission form template with responsive design
- `VSC_Suggestion_Form_Physical_v1.0.docx` -- Printable suggestion card for physical submission boxes
- `VSC_Suggestion_Evaluation_Scorecard_v1.0.xlsx` -- Evaluator scoring template with criteria, scales, and calibration guide
- `VSC_Implementation_Tracker_v1.0.xlsx` -- Action item register for tracking suggestion implementation
- `VSC_Recognition_Certificate_v1.0.docx` -- Certificate of appreciation template with VSC branding
- `VSC_Suggestion_System_Launch_Kit_v1.0.pptx` -- Communication materials: posters, FAQ, manager briefing deck

### Reference Documents
- Yasuda, Y. (1991). "40 Years, 20 Million Ideas: The Toyota Suggestion System" -- Definitive reference on the Toyota Creative Idea Suggestion System
- Imai, M. (1986). "Kaizen: The Key to Japan's Competitive Success" -- Foundation text on continuous improvement philosophy and suggestion systems
- Robinson, A.G. & Schroeder, D.M. (2004). "Ideas Are Free" -- Modern approach to employee-driven improvement with practical implementation guidance
- ISO 9001:2015 -- Quality management systems, Clause 10.1 (improvement) and Clause 7.3 (awareness)
- EFQM Excellence Model 2020 -- Criterion 3 (People) and Criterion 5 (Processes, Products & Services)
- Shingo Institute. "The Shingo Model" -- Enterprise excellence framework with Cultural Enablers pillar
- VSC Internal: "Guia de Implementacion de Sistemas de Mejora Continua v2.0"
- VSC Internal: "Procedimiento de Gestion de Ideas y Sugerencias v1.0"

---

## Examples

See [`references/skill-examples.md`](references/skill-examples.md) for detailed examples.
