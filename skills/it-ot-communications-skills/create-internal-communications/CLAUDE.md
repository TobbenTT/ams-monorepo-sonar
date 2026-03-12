---
name: create-internal-communications
description: "Generate internal communications including newsletters, project updates, town hall agendas, change announcements, milestone celebrations, and safety bulletins for OR projects. Triggers: 'internal communications', 'newsletter', 'comunicaciones internas'."
---

# Create Internal Communications
## Skill ID: create-internal-communications
## Version: 1.0.0
## Category: A - Document Generation
## Priority: Medium

## Purpose

Generates professional internal communications for industrial Operational Readiness projects, including project newsletters, progress updates, town hall meeting agendas and talking points, change management announcements, milestone celebration communications, safety bulletins, and organizational updates. This skill transforms raw project data, milestones, achievements, and change initiatives into compelling, audience-appropriate communications that maintain project momentum, build organizational alignment, and reinforce the safety culture.

Effective internal communication is the connective tissue of Operational Readiness. Large capital projects involve hundreds of stakeholders across multiple organizations -- owner's team, EPC contractors, vendors, future operations workforce, corporate leadership, regulators -- each needing different levels of information at different frequencies. Poor communication breeds rumors, resistance to change, safety complacency, and loss of organizational trust. Conversely, well-crafted communications celebrate progress, reinforce safety behaviors, explain changes before they happen, and create the sense of shared purpose that sustains teams through 18-month+ project timelines.

This skill consumes stakeholder engagement data, project milestones, KPI dashboards, safety statistics, and change management initiatives to produce communications tailored to specific audiences and channels.

## CRITICAL CONSTRAINT: EXTERNAL COMMUNICATIONS

> **MANDATORY RULE: ALL communications intended for external audiences (community, media, regulators, general public) MUST be clearly marked as DRAFT -- FOR HUMAN REVIEW ONLY. The AI agent MUST NOT produce final external communications. External communications require:**
> - Legal review for regulatory compliance
> - Corporate affairs approval for brand and messaging alignment
> - Community relations review for cultural sensitivity
> - Executive sign-off before distribution
>
> **Internal communications (within the project team and owner organization) may be produced as final drafts ready for distribution, subject to the normal review workflow defined in this skill.**

## Intent & Specification

The AI agent MUST understand the following core goals:

1. **Audience-Centric Messaging**: Every communication must be tailored to its target audience. A safety bulletin for field workers uses simple language, visuals, and direct instructions. An executive briefing uses concise metrics, strategic framing, and decision-oriented content. A newsletter for the broader project team balances technical updates with human interest and celebration.

2. **Tone and Culture Matter**: Communications for Latin American industrial projects must reflect the cultural context -- respectful, warm, team-oriented, and inclusive. Safety communications must be serious but empowering, not punitive. Change announcements must acknowledge uncertainty while projecting confidence. Milestone celebrations should be genuine and generous in recognition.

3. **Data-Driven Content**: Communications must be grounded in actual project data -- real progress percentages, actual safety statistics, verified milestones, confirmed dates. The agent must never fabricate metrics or overstate progress. If data is unavailable, the communication must note the gap and provide qualitative updates instead.

4. **Visual Communication Design**: Where appropriate, communications should include data visualization suggestions -- progress charts, safety trend graphs, milestone timelines, organizational charts. The agent must specify chart types, data sources, and key messages for each visual element.

5. **Multi-Channel Adaptation**: The same core message may need to be adapted for different channels -- email, intranet post, physical poster, town hall presentation slides, WhatsApp group message, and printed bulletin board notice. The agent must produce channel-appropriate versions.

6. **Safety Communications Have Special Requirements**: Safety bulletins, alerts, and incident learnings must follow a standardized format, be reviewed by HSE personnel, and include specific action items. Safety learnings from incidents must be anonymized and focused on systemic improvements, not individual blame.

7. **Language**: Spanish (Latin American) by default. Bilingual (Spanish/English) when the project workforce includes non-Spanish speakers. Safety communications are always bilingual.

## Trigger / Invocation

```
/create-internal-communications
```

### Natural Language Triggers
- "Create a project newsletter for this month"
- "Draft a change announcement for the new shift schedule"
- "Write a safety bulletin about the recent near-miss"
- "Prepare town hall talking points for the project update"
- "Crear boletin informativo del proyecto para este mes"
- "Redactar comunicado sobre el cambio en el cronograma"
- "Preparar boletin de seguridad sobre el incidente reciente"

## Input Requirements

### Required Inputs
| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `communication_type` | Type: Newsletter / Project Update / Town Hall / Change Announcement / Safety Bulletin / Milestone Celebration / Organizational Update | Text | User |
| `target_audience` | Who will receive: All Staff / Management / Field Workers / Specific Department / External (DRAFT ONLY) | Text | User |
| `key_messages` | Core messages or topics to communicate (minimum 3 bullet points) | Text | User / Project Team |
| `project_context` | Current project phase, recent milestones, upcoming events | Text / .docx | Orchestrator |
| `distribution_channel` | Email / Intranet / Poster / Town Hall / WhatsApp / Multiple | Text | User |

### Optional Inputs (Highly Recommended)
| Input | Description | Default |
|-------|-------------|---------|
| `project_kpis` | Current project KPIs (schedule, cost, safety, quality) | Request from Orchestrator |
| `safety_statistics` | LTI rate, near-miss reports, safety observations, training completion | Request from HSE agent |
| `milestone_data` | Recent achievements and upcoming milestones with dates | Request from Execution agent |
| `stakeholder_preferences` | Audience communication preferences from manage-stakeholder-engagement | Generic audience profiles |
| `change_details` | Specific change being communicated (what, why, when, who affected, support available) | User must provide |
| `incident_details` | Anonymized incident summary for safety bulletins (what happened, root cause, corrective actions) | User must provide (HSE reviewed) |
| `photos_graphics` | Relevant project photos, logos, or graphic assets | VSC standard graphics |
| `previous_communications` | Previous newsletters or updates for continuity and tone reference | None |
| `language_preference` | Spanish only / Bilingual (Spanish + English) / English only | Spanish (Latin American) |

### Context Enrichment
The agent should automatically:
- Pull latest project progress data from the Orchestrator's weekly report or KPI dashboard
- Retrieve safety statistics from the HSE agent's latest reporting period
- Reference the stakeholder engagement plan for audience preferences and key concerns
- Check the change management plan for upcoming changes requiring communication
- Identify upcoming project milestones from the master schedule

## Output Specification

### Output by Communication Type

#### Type 1: Project Newsletter (.docx)
**Filename**: `VSC_Newsletter_{ProjectCode}_{Period}_{Version}_{Date}.docx`

**Structure** (2-4 pages):
1. **Header** - Project logo, newsletter title, issue number, date
2. **Director's Message** - 150-200 word personal message from Project Director
3. **Project Progress Summary** - Key metrics with visual dashboards (schedule, cost, safety)
4. **Highlight Story** - 200-300 word feature on a significant achievement or milestone
5. **Safety Corner** - Safety statistics, recognition of safe behaviors, safety tip of the month
6. **Upcoming Milestones** - 3-5 key milestones in the next reporting period
7. **Team Spotlight** - Recognition of individuals or teams for outstanding contributions
8. **Community & Sustainability** - Environmental and community engagement updates
9. **Calendar** - Key dates and events in the next period
10. **Contact Information** - How to provide feedback or ask questions

#### Type 2: Project Update (Email / Intranet)
**Filename**: `VSC_Update_{ProjectCode}_{Date}.docx`

**Structure** (1-2 pages):
1. **Subject Line** - Concise, informative subject
2. **Opening** - 2-3 sentence summary of key update
3. **Progress Summary** - Bullet points by area (Engineering, Procurement, Construction, OR)
4. **Key Achievements** - 3-5 notable accomplishments
5. **Upcoming Activities** - What to expect in the next period
6. **Action Items** - Any actions required from the audience
7. **Closing** - Positive reinforcement and contact for questions

#### Type 3: Town Hall Agenda and Talking Points (.docx + .pptx outline)
**Filename**: `VSC_TownHall_{ProjectCode}_{Date}.docx`

**Structure**:
1. **Agenda** - Timed agenda items (typically 45-60 minutes)
2. **Opening Remarks** - Talking points for leadership welcome (3-5 minutes)
3. **Progress Overview** - Key metrics and visual progress (10-15 minutes)
4. **Feature Topic** - Deep dive on a specific area (10-15 minutes)
5. **Safety Moment** - Safety story or learning (5 minutes)
6. **Q&A Preparation** - Anticipated questions with prepared responses (10-15 minutes)
7. **Closing and Recognition** - Team recognition and forward look (5 minutes)
8. **Slide Outline** - Content suggestions for each presentation slide

#### Type 4: Change Announcement (.docx)
**Filename**: `VSC_ChangeAnnouncement_{ProjectCode}_{ChangeRef}_{Date}.docx`

**Structure** (1 page):
1. **Headline** - Clear, non-alarming headline
2. **What is Changing** - Plain language description
3. **Why This Change** - Business rationale (honest, transparent)
4. **When** - Timeline with key dates
5. **Who is Affected** - Specific groups impacted
6. **What This Means for You** - Personalized impact by audience segment
7. **Support Available** - Resources, contacts, training, FAQs
8. **Feedback Channel** - How to provide input or raise concerns
9. **Acknowledgment** - Recognition that change is difficult, commitment to support

#### Type 5: Safety Bulletin (.docx)
**Filename**: `VSC_SafetyBulletin_{ProjectCode}_{BulletinNo}_{Date}.docx`

**Structure** (1 page, bilingual Spanish/English):
1. **SAFETY ALERT Banner** - High visibility header with severity level
2. **Incident Summary** - What happened (anonymized, factual, 3-4 sentences)
3. **Root Cause** - Contributing factors (systemic, not individual blame)
4. **Corrective Actions** - Specific actions taken or required
5. **Lessons Learned** - Key takeaways applicable to all workers
6. **Your Action Required** - Specific actions for the reader
7. **Visual** - Diagram or illustration of the hazard/control
8. **Reporting** - How to report similar hazards or near-misses
9. **HSE Review Stamp** - Placeholder for HSE manager approval signature

#### Type 6: Milestone Celebration (.docx)
**Filename**: `VSC_Milestone_{ProjectCode}_{MilestoneRef}_{Date}.docx`

**Structure** (1 page):
1. **Celebration Banner** - Visually striking header with milestone name
2. **Achievement Description** - What was accomplished and its significance
3. **By the Numbers** - Key statistics (hours worked, team size, duration, etc.)
4. **Team Recognition** - Named individuals and teams who contributed
5. **Leadership Quote** - Message from Project Director or GM
6. **What This Enables** - How this milestone advances the project
7. **Looking Ahead** - Next milestone to pursue
8. **Celebration Plans** - Any planned recognition events

### Formatting Standards
- All communications use VSC corporate branding (colors, logo, fonts)
- Safety bulletins use high-visibility formatting (red/yellow alert banners)
- Newsletters use professional magazine-style layout
- Change announcements use calm, reassuring color palette (blue/green)
- Milestone celebrations use celebratory design (gold accents)
- All communications include accessibility considerations (high contrast, clear fonts)

## Procedure

### Step 1: Communication Brief and Audience Analysis
- Identify communication type, target audience, and distribution channel
- Retrieve audience preferences from stakeholder engagement data
- Gather key messages and supporting data from project sources
- Determine language requirements (Spanish, bilingual, English)
- Confirm whether communication is internal (final draft) or external (DRAFT FOR REVIEW)

### Step 2: Content Development
- Structure content according to the communication type template
- Draft messaging tailored to the target audience's level of detail and formality
- Incorporate quantitative data (KPIs, statistics, dates) where available
- Flag any data gaps and provide qualitative alternatives
- For safety bulletins, ensure content is anonymized and focuses on systemic learning

### Step 3: Tone and Cultural Calibration
- Review tone for cultural appropriateness (Latin American industrial context)
- Ensure safety communications balance seriousness with empowerment
- Verify change announcements acknowledge concerns while projecting confidence
- Check that celebration communications are generous in recognition
- Validate bilingual content for accuracy and natural expression in both languages

### Step 4: Visual Element Specification
- Specify data visualization requirements (chart types, data sources, key messages)
- Identify photo or illustration opportunities with placement guidance
- Design layout recommendations for the distribution channel
- Ensure safety visuals are clear, unambiguous, and culturally appropriate
- Provide slide outline for town hall or presentation formats

### Step 5: Review Packaging and Distribution Guidance
- Compile final communication document in the appropriate format
- Add classification and review stamps as required
- For external communications, add prominent "DRAFT -- FOR HUMAN REVIEW ONLY" watermark
- Specify distribution list, channel, timing, and follow-up actions
- Include feedback collection mechanism for continuous improvement

## Quality Criteria

| Criterion | Weight | Description | Target |
|-----------|--------|-------------|--------|
| Technical Accuracy | 30% | All metrics, dates, names, and facts are verified against source data; no fabricated content | 100% |
| Completeness | 25% | All required sections present per communication type; audience needs addressed; key messages delivered | >95% |
| Consistency | 15% | Tone consistent with project communications standards; branding aligned with VSC guidelines; messaging consistent across channels | >95% |
| Format | 10% | Professional layout; VSC branding applied; channel-appropriate formatting; accessibility standards met | >95% |
| Actionability | 10% | Readers understand what the communication means for them; clear calls to action; feedback channels specified | >90% |
| Traceability | 10% | Data sourced from verifiable project records; safety content reviewed by HSE; change communications traceable to change management plan | >90% |

### Communication-Specific Quality Checks
- [ ] No fabricated metrics or unverified statistics in any communication
- [ ] Safety bulletins are anonymized -- no individual names in incident descriptions
- [ ] Safety bulletins focus on systemic learning, not individual blame
- [ ] Change announcements include support resources and feedback channels
- [ ] External communications are marked "DRAFT -- FOR HUMAN REVIEW ONLY"
- [ ] Bilingual communications have been validated for accuracy in both languages
- [ ] Town hall Q&A preparation covers likely sensitive questions
- [ ] Milestone celebrations recognize specific teams and individuals by name

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents)
| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| `orchestrator` / `create-weekly-report` | Project progress data | Provides schedule, cost, and progress metrics for newsletters and updates |
| `orchestrator` / `create-kpi-dashboard` | KPI data | Provides quantitative performance data for data-driven communications |
| `hse` | Safety statistics and incidents | Provides LTI rates, near-miss data, and anonymized incident summaries |
| `manage-stakeholder-engagement` | Audience preferences | Provides communication channel preferences and key concerns per audience |
| `execution` | Milestone data | Provides completed and upcoming milestones with dates and significance |
| `operations` / `facilitate-change-management` | Change management plans | Provides change details for change announcements |

### Downstream Dependencies (Outputs TO other agents)
| Agent/Skill | Output Provided | Trigger |
|-------------|----------------|---------|
| `manage-stakeholder-engagement` | Engagement evidence | Automatic -- communications serve as engagement activity records |
| `orchestrator` | Communication artifacts for project record | Automatic -- stored in DMS per document management plan |
| `manage-document-systems` | Communications archive | Automatic -- filed per folder structure and retention policy |
| `hse` | Safety communication compliance evidence | On request -- for regulatory safety communication audits |

### Collaboration During Execution
| Agent/Skill | Collaboration Type | When |
|-------------|-------------------|------|
| `orchestrator` | Message alignment and approval | Before distribution of significant communications |
| `hse` | Safety content review | For all safety bulletins and incident-related communications |
| `manage-stakeholder-engagement` | Audience targeting | During audience analysis for major communications |
| `operations` | Change impact validation | Before distributing change announcements affecting operations |

## References

### Primary Standards
| Standard | Application |
|----------|-------------|
| **ISO 22301** | Business continuity -- communication during incidents |
| **IAP2 Spectrum** | International Association for Public Participation -- engagement levels |
| **IABC Standards** | International Association of Business Communicators -- communication best practices |
| **OSHA Communication Standards** | Safety communication requirements (reference for Chilean equivalents) |
| **Plain Language Guidelines** | Clear communication principles for diverse audiences |

### Safety Communication Standards
| Standard | Application |
|----------|-------------|
| **DS 132** | Reglamento de Seguridad Minera -- safety communication and training requirements |
| **DS 594** | Safety communication in workplace health and safety |
| **ISO 45001** | OH&S management -- communication and consultation requirements |
| **ICMM Health and Safety Principles** | Mining industry safety communication standards |

### Industry References
- Prosci ADKAR Model -- change communication best practices
- Kotter's 8-Step Change Model -- communication in change management
- Safety Differently / Human and Organizational Performance (HOP) -- learning-focused safety communication
- IFC Stakeholder Engagement Good Practice Handbook -- community communication guidelines
- AIPC (Asociacion Iberoamericana de Comunicacion Interna) -- Latin American internal communications practices

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-02-25 | VSC IT/OT Agent | Initial version. Complete internal communications skill covering newsletters, updates, town halls, change announcements, safety bulletins, and milestone celebrations with external communication DRAFT constraint. |
