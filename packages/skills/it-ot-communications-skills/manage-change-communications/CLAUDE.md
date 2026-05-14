---
name: manage-change-communications
description: "Design and execute ADKAR-aligned change communication strategies including stakeholder messaging, resistance management, leader talking points, FAQ generation, and change readiness assessment for OR projects. Triggers: 'change communications', 'change management messaging', 'comunicaciones de cambio', 'gestion del cambio comunicacional'."
---

# Manage Change Communications
## Skill ID: manage-change-communications
## Version: 1.0.0
## Category: A - Document Generation
## Priority: Medium

## Purpose

Designs and executes structured change communication strategies for Operational Readiness projects in mining, oil & gas, chemicals, and energy sectors, aligned with the Prosci ADKAR model (Awareness, Desire, Knowledge, Ability, Reinforcement). Large OR programs involve transformational changes across every dimension of the organization: new operating models, new technology platforms, new organizational structures, new roles and responsibilities, new safety systems, and new maintenance philosophies. Each change requires carefully crafted communications that guide stakeholders through the change journey.

This skill produces change communication plans, ADKAR-aligned messaging sequences, leader talking points, FAQ documents, resistance management strategies, and change readiness surveys. The skill ensures that change is communicated proactively rather than reactively, that messaging is sequenced according to the ADKAR stages, and that resistance is addressed through understanding rather than force.

Failed change communication is the primary cause of change initiative failure. When people do not understand WHY a change is happening (Awareness), they resist. When they do not WANT to participate (Desire), they comply minimally. When they are not equipped with HOW to change (Knowledge/Ability), they fail. When new behaviors are not REINFORCED, they revert. This skill systematically addresses each stage through targeted, audience-appropriate communications.

The change communications framework integrates with the create-internal-communications skill (which distributes the communications), the track-communication-effectiveness skill (which measures their impact), the manage-stakeholder-engagement skill (which provides audience intelligence), and the Orchestrator agent (which coordinates cross-functional change initiatives).

## Intent & Specification

The AI agent MUST understand the following core goals:

1. **ADKAR Alignment Is Mandatory**: Every change communication must be mapped to one or more ADKAR stages. Communications sequence must follow the ADKAR progression -- you cannot drive Knowledge before establishing Awareness and Desire. The agent must identify the current ADKAR stage for each audience segment and produce stage-appropriate messaging.

2. **Leader-Led Communication**: The most critical change messages must come from leaders, not from project communications. The agent produces talking points, scripts, and Q&A preparation for leaders at each organizational level. Leaders must communicate the "why" before the "what."

3. **Resistance Is Information, Not Obstruction**: Resistance signals unaddressed concerns, insufficient communication, or genuine problems with the change. The agent categorizes resistance sources, produces targeted responses, and recommends adjustments to the change approach when resistance data warrants it.

4. **FAQ Documents Are Living Instruments**: FAQ documents must evolve as the change progresses. Initial FAQs address awareness-level questions ("What is changing?"). Later FAQs address knowledge-level questions ("How do I use the new system?"). The agent generates stage-appropriate FAQs and updates them as the change unfolds.

5. **Audience Segmentation Drives Messaging**: Different stakeholder groups experience the same change differently. Field operators care about their daily work impact. Middle managers worry about their teams and authority. Senior leaders focus on business outcomes and risk. The agent produces segment-specific messaging for each change initiative.

6. **Timing Is Strategic**: Change communications have optimal timing relative to the change event. Too early creates anxiety without action. Too late creates surprise and resentment. The agent produces a communication timeline aligned with change milestones and ADKAR stage progression.

7. **Language**: Spanish (Latin American) by default. Leader talking points are bilingual where leaders are non-Spanish speakers. FAQs are always bilingual.

## Trigger / Invocation

```
/manage-change-communications
```

### Natural Language Triggers
- "Create change communication plan for the new operating model"
- "Generate ADKAR messaging for the SAP implementation"
- "Prepare leader talking points for the organizational restructuring"
- "Build FAQ document for the new shift schedule"
- "Assess change readiness for the maintenance strategy transition"
- "Develop resistance management strategy for the technology change"
- "Crea un plan de comunicacion de cambio para el nuevo modelo operativo"
- "Genera mensajes ADKAR para la implementacion de SAP"
- "Prepara puntos de conversacion para lideres sobre la reestructuracion"
- "Construye documento de preguntas frecuentes sobre el nuevo turno"
- "Evalua la disposicion al cambio para la transicion de estrategia de mantenimiento"
- "Desarrolla estrategia de manejo de resistencia para el cambio tecnologico"

## Input Requirements

### Required Inputs
| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `change_initiative` | Description of the change (what, why, scope, timeline) | Text / .docx | User / Orchestrator |
| `affected_stakeholders` | Groups impacted by the change with impact severity | .xlsx / Table | manage-stakeholder-engagement |
| `current_adkar_assessment` | Current ADKAR stage by stakeholder group (if available) | Table | Change management team |
| `project_context` | Project phase, timeline, key milestones | Text / .docx | Orchestrator |
| `change_sponsor` | Executive sponsor and change coalition members | Text | User / HR |

### Optional Inputs (Highly Recommended)
| Input | Description | Default |
|-------|-------------|---------|
| `resistance_signals` | Known resistance sources, concerns, objections | Assess through stakeholder analysis |
| `previous_change_comms` | Previous communications about this change | None |
| `organizational_culture_notes` | Cultural factors affecting change adoption | Latin American industrial defaults |
| `change_impact_assessment` | Detailed impact by role, process, technology | Generate from change description |
| `training_plan_reference` | Related training plan from operations agent | Reference from plan-training-program |
| `leader_availability` | Leader communication slots and channel preferences | Request from PMO |
| `union_considerations` | Collective bargaining agreement constraints on change communication | Flag as RFI if applicable |
| `success_stories` | Peer examples or success stories from similar changes | Industry benchmarks |
| `effectiveness_data` | Feedback from previous change communications | From track-communication-effectiveness |

### Context Enrichment
The agent should automatically:
- Reference the Prosci ADKAR model stages and communication requirements
- Pull stakeholder analysis from manage-stakeholder-engagement skill
- Retrieve communication effectiveness data from track-communication-effectiveness skill
- Check the project schedule for change implementation milestones
- Identify related changes that may create "change fatigue" when combined
- Reference cultural communication norms for Latin American industrial contexts

## Output Specification

### Output 1: Change Communication Plan (.docx)
**Filename**: `VSC_ChangeCommunication_{ProjectCode}_{ChangeRef}_{Version}_{Date}.docx`

**Structure**:
1. **Cover Page** - VSC branding, change initiative name, version
2. **Document Control** - Revision history, approval matrix
3. **Executive Summary** (1 page)
   - Change overview and rationale
   - Communication strategy summary
   - Timeline overview
   - Key risks and mitigations
4. **Change Context** (1-2 pages)
   - What is changing and why
   - Scope and timeline
   - Current state vs. future state (visual comparison)
   - Benefits and risks
5. **Stakeholder Impact Analysis** (2-3 pages)
   - Stakeholder groups affected
   - Impact severity by group (High/Medium/Low)
   - ADKAR assessment by group
   - Key concerns and questions by group
   - Communication channel preferences by group
6. **ADKAR Messaging Strategy** (3-5 pages)
   - 6.1 Awareness Phase messaging (Why is this change needed?)
   - 6.2 Desire Phase messaging (What's in it for me? Why should I support this?)
   - 6.3 Knowledge Phase messaging (How will this work? What do I need to learn?)
   - 6.4 Ability Phase messaging (What support is available? How do I practice?)
   - 6.5 Reinforcement Phase messaging (What has been achieved? How do we sustain?)
   - Each phase includes: key messages, target audience, channel, timing, sender
7. **Communication Timeline** (2-3 pages)
   - Milestone-aligned communication schedule
   - Communication cascade (leaders first, then managers, then teams)
   - Channel calendar (which messages through which channels when)
   - Feedback collection points
8. **Leader Communication Toolkit** (3-4 pages)
   - Executive sponsor talking points
   - Middle manager talking points
   - Supervisor/frontline leader talking points
   - Common objections with responses
   - Q&A preparation guide
9. **Resistance Management Strategy** (2-3 pages)
   - Anticipated resistance sources and types
   - Resistance response framework (Listen, Acknowledge, Address, Follow-up)
   - Targeted interventions for high-resistance groups
   - Escalation procedures for unresolved resistance
   - Resistance tracking metrics
10. **FAQ Document** (2-4 pages)
    - General questions about the change
    - Impact-specific questions by stakeholder group
    - Timeline and implementation questions
    - Support and resources questions
    - Bilingual (Spanish primary, English secondary)
11. **Measurement Plan** (1-2 pages)
    - ADKAR score targets by stakeholder group
    - Communication reach and engagement targets
    - Pulse survey schedule
    - Feedback loop mechanisms
    - Success criteria for change communication
12. **Appendices**
    - Detailed stakeholder impact matrix
    - Complete ADKAR assessment questionnaire
    - Communication channel descriptions and capabilities
    - Template library (email templates, poster templates, WhatsApp messages)

### Output 2: Leader Talking Points Package (.docx)
**Filename**: `VSC_LeaderTalkingPoints_{ProjectCode}_{ChangeRef}_{Date}.docx`

**Structure** (3-5 pages):
1. **Context Brief** - 1-paragraph change summary for leader preparation
2. **Key Messages** - 3-5 core messages (memorizable, consistent)
3. **Why Now** - Urgency framing without alarm
4. **What This Means for Your Team** - Impact summary by team type
5. **Anticipated Questions** - Top 10 questions with prepared responses
6. **What You DON'T Know Yet** - Honest acknowledgment of uncertainties
7. **Support Resources** - Where to direct people for more information
8. **Feedback Collection** - How leaders should capture and escalate team concerns
9. **Do's and Don'ts** - Communication behavior guidance for leaders

### Output 3: FAQ Document (.docx)
**Filename**: `VSC_FAQ_{ProjectCode}_{ChangeRef}_{ADKARStage}_{Date}.docx`

**Structure** (bilingual, 2-4 pages per ADKAR stage):
- Questions organized by ADKAR stage
- Plain language answers (8th grade reading level)
- "Where to get more information" links
- "Who to contact" for each topic area
- Version number and date (FAQs evolve over time)

### Output 4: Change Readiness Survey (.docx)
**Filename**: `VSC_ChangeReadiness_{ProjectCode}_{ChangeRef}_{Date}.docx`

**Structure** (anonymous, bilingual, 10-15 questions, 5 minutes):
- ADKAR diagnostic questions (2-3 per stage)
- Open-ended concern capture
- Support needs assessment
- Demographic context (role category, location -- NOT individual identity)

## Procedure

### Step 1: Change Analysis and Stakeholder Impact Assessment
- Review the change initiative description, scope, timeline, and rationale
- Identify all affected stakeholder groups and assess impact severity
- Conduct initial ADKAR assessment to determine current stage per group
- Map resistance sources and categorize by type (informational, emotional, structural)
- Identify the change sponsor, change coalition, and leader cascade structure
- Review organizational culture factors affecting change adoption (hierarchy, trust, history)

### Step 2: ADKAR-Aligned Messaging Design
- Develop messaging sequences for each ADKAR stage (A-D-K-A-R)
- Tailor messages to each stakeholder segment (content, tone, level of detail)
- Sequence communications to follow the ADKAR progression (awareness before desire, etc.)
- Design the communication cascade: executive sponsor first, then senior leaders, then middle management, then frontline supervisors, then teams
- Create a communication timeline aligned with change implementation milestones
- Define channels for each message based on audience preferences and message sensitivity

### Step 3: Leader Toolkit and Resistance Strategy Development
- Produce executive sponsor talking points with key messages and Q&A preparation
- Develop middle manager talking points addressing team-level concerns
- Create frontline supervisor guides for face-to-face communication with crews
- Build the resistance management strategy with listen-acknowledge-address framework
- Design targeted interventions for high-resistance stakeholder groups
- Develop "do's and don'ts" behavioral guidance for leaders communicating change

### Step 4: FAQ Generation and Support Materials
- Generate initial FAQ document addressing awareness-stage questions
- Prepare knowledge-stage FAQs for deployment when training begins
- Create ability-stage FAQs with practical "how-to" guidance
- Produce reinforcement-stage FAQs celebrating successes and addressing sustainment
- Design all FAQs in bilingual format (Spanish primary, English secondary)
- Include "where to get help" and "who to contact" resources in all materials

### Step 5: Measurement Plan and Feedback Loop Design
- Define ADKAR score targets by stakeholder group and timeline
- Design pulse surveys for periodic ADKAR assessment
- Establish feedback channels (anonymous suggestion boxes, leader feedback forms, skip-level meetings)
- Configure integration with track-communication-effectiveness skill for measurement
- Define success criteria for change communication effectiveness
- Schedule review points for communication plan adjustment based on effectiveness data

## Quality Criteria

| Criterion | Weight | Description | Target |
|-----------|--------|-------------|--------|
| Technical Accuracy | 30% | ADKAR model correctly applied; messaging aligned to correct stage; stakeholder analysis accurate | >91% |
| Completeness | 25% | All ADKAR stages addressed; all stakeholder groups covered; leader toolkit complete; FAQs comprehensive | >91% |
| Consistency | 15% | Key messages consistent across all materials; tone appropriate to audience; no contradictory messaging | >91% |
| Format | 10% | Professional layout; bilingual formatting correct; talking points concise and memorizable | >91% |
| Actionability | 10% | Leaders can use talking points immediately; FAQs answer real questions; resistance strategies are implementable | >91% |
| Traceability | 10% | Messages trace to change rationale; FAQ answers trace to verified information; resistance strategies trace to identified sources | >91% |

### Change Communication Quality Checks
- [ ] ADKAR stages are sequenced correctly (A before D, D before K, etc.)
- [ ] Leader talking points are concise enough to be memorized (3-5 key messages)
- [ ] FAQ language is at 8th grade reading level (accessible to all workers)
- [ ] Resistance responses acknowledge concerns before addressing them
- [ ] Bilingual content is natural and accurate in both languages
- [ ] Timeline allows sufficient time for each ADKAR stage (no rushing through Awareness)
- [ ] Feedback channels include anonymous options for honest input
- [ ] Change fatigue assessment performed (how many other changes are concurrent?)

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents)
| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| `manage-stakeholder-engagement` | Stakeholder analysis | Provides audience segmentation, impact assessment, and communication preferences |
| `orchestrator` | Change initiative context | Provides change scope, timeline, sponsorship, and project phase |
| `operations` / `facilitate-change-management` | Change management plan | Provides the overall change management strategy this communication supports |
| `operations` / `plan-training-program` | Training plan | Provides training schedule for Knowledge/Ability stage messaging alignment |
| `track-communication-effectiveness` | Effectiveness data | Provides feedback on previous change communications for calibration |
| `hse` | Safety-related change context | Provides safety implications of changes affecting operating procedures |
| `execution` | Implementation schedule | Provides change implementation milestones for communication timing |

### Downstream Dependencies (Outputs TO other agents)
| Agent/Skill | Output Provided | Trigger |
|-------------|----------------|---------|
| `create-internal-communications` | Change communication content for distribution | On request -- provides content for newsletters, updates, announcements |
| `track-communication-effectiveness` | Change communication targets for measurement | Automatic -- provides ADKAR targets and measurement criteria |
| `manage-stakeholder-engagement` | Engagement activity records | Automatic -- change communications are engagement activities |
| `orchestrator` | Change readiness status for gate reviews | On request |
| `manage-document-systems` | Change communication artifacts filed in DMS | Automatic |

### Collaboration During Execution
| Agent/Skill | Collaboration Type | When |
|-------------|-------------------|------|
| `manage-stakeholder-engagement` | Audience intelligence sharing | During stakeholder impact assessment |
| `create-internal-communications` | Content alignment for distribution | When communications are ready for distribution |
| `track-communication-effectiveness` | Measurement design alignment | During measurement plan development |
| `operations` | Change impact validation | Before publishing impact assessments |
| `hse` | Safety messaging review | For changes affecting safety procedures |

## References

### Primary Standards and Models
| Standard/Model | Application |
|----------------|-------------|
| **Prosci ADKAR Model** | Primary change communication framework -- Awareness, Desire, Knowledge, Ability, Reinforcement |
| **Kotter's 8-Step Model** | Complementary change leadership communication framework |
| **Bridges Transition Model** | Managing the human side of change (Ending, Neutral Zone, New Beginning) |
| **ISO 44001** | Collaborative business relationships -- change in partnership contexts |
| **PMI Managing Change in Organizations** | Project-based change management communication |

### Change Communication Best Practices
- Prosci Best Practices in Change Management (12th Edition)
- McKinsey "The irrational side of change management" -- addressing emotional resistance
- Harvard Business Review -- change communication strategies compilation
- Kotter International -- sense of urgency communication techniques
- Switch: How to Change Things When Change Is Hard (Heath & Heath) -- communication framing

### Industry References
- ICMM Change Management for Mining -- communication in mining sector change
- IOGP Report 510 -- Managing Change in the Oil and Gas Industry
- Energy Institute -- Human Factors in Change Management
- VSC OR Knowledge Base v2.0 (`docs/architecture/_legacy/knowledge-base.md`)
- VSC Multi-Agent Architecture v2 (`docs/architecture/_legacy/multi-agent-architecture.md`)

### Cultural Context (Latin America)
- Hofstede Cultural Dimensions -- communication norms for Latin American organizations
- Prosci Latin America -- regional change management adaptations
- AIPC (Asociacion Iberoamericana de Comunicacion Interna) -- change communication in LATAM

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-02-25 | VSC IT/OT Agent | Initial version. Complete ADKAR-aligned change communication skill with messaging strategy, leader talking points, FAQ generation, resistance management, and change readiness assessment. |
