# Create Change Management Plan
## Skill ID: create-change-mgmt-plan
## Version: 1.0.0
## Category: A - Document Generation
## Priority: High

## Purpose
Generates comprehensive change management plans for industrial Operational Readiness projects, addressing the people-side of transitioning from construction/project mode to operational mode. This includes stakeholder analysis, impact assessment, communication strategy, resistance management, leadership alignment, and organizational transition planning.

Change management is often the most underestimated workstream in Operational Readiness. Technical deliverables (procedures, strategies, systems) are necessary but insufficient for successful operations. The human factors - new roles, new ways of working, new skills requirements, organizational restructuring, and cultural shifts - determine whether the technical preparations actually translate into operational performance. Failure to manage change effectively results in resistance, low adoption of new processes, safety incidents, high turnover, and extended ramp-up periods.

## Intent & Specification
The AI agent MUST understand that:

1. **Change Management is Not Optional**: Every OR project involves significant organizational change. Even brownfield expansions create disruption. The change management plan must be a core workstream, not an afterthought.
2. **People-Centric Approach**: The plan must address the concerns, motivations, and resistance of real people - from the plant manager to the most junior operator. One-size-fits-all communication does not work.
3. **Structured Methodology Required**: The plan must follow a recognized change management methodology (ADKAR, Kotter, Prosci, or equivalent) adapted to the industrial context, not ad-hoc activities.
4. **Leadership Sponsorship is Critical**: Without visible, active sponsorship from senior leadership, change initiatives fail. The plan must define specific leadership actions, not just "leadership support."
5. **Communication is Bi-Directional**: Communication is not just broadcasting messages. It includes listening mechanisms (surveys, town halls, feedback loops) to detect resistance and adjust.
6. **Integration with Other Workstreams**: Change management must be woven into training, organizational design, staffing, and operational readiness activities - not executed as a parallel, disconnected stream.
7. **Measurable Outcomes**: Change readiness and adoption must be measured, not assumed. The plan must include change readiness assessments and adoption metrics.
8. **Language**: Spanish (Latin American).

## Trigger / Invocation
```
/create-change-mgmt-plan
```

### Natural Language Triggers
- "Create a change management plan for [project/transition]"
- "Develop stakeholder engagement strategy for [OR project]"
- "Design communication plan for [organizational change]"
- "Plan the people transition for [new operation/plant]"
- "Crear plan de gestion del cambio para [proyecto/transicion]"
- "Desarrollar estrategia de comunicacion para [cambio organizacional]"
- "Planificar la transicion del personal para [nueva operacion]"

## Input Requirements

### Required Inputs
| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `project_description` | OR project scope, timeline, and key milestones | .docx / Text | Project plan |
| `organizational_impact` | What changes for people (roles, structure, ways of working) | .docx / .pptx | create-org-design |
| `stakeholder_list` | Key stakeholders and their roles | .xlsx / Text | User / Org design |
| `current_state` | Current organization, processes, culture (as-is) | .docx / Text | User / Assessment |

### Optional Inputs (Highly Recommended)
| Input | Description | Default |
|-------|-------------|---------|
| `org_design` | Future organizational structure | From create-org-design |
| `staffing_plan` | New roles, buildup schedule | From create-staffing-plan |
| `training_plan` | Training program design | From create-training-plan |
| `project_schedule` | Key project milestones and dates | Derive from inputs |
| `culture_assessment` | Current organizational culture analysis | Infer from industry/company |
| `previous_change_history` | Past change initiatives and lessons learned | None |
| `union_environment` | Unionized workforce, collective agreements | Assume non-union unless stated |
| `geographic_factors` | Remote site, FIFO, multiple locations | Single site assumed |
| `corporate_change_framework` | Client's existing change methodology | Prosci/ADKAR adapted |
| `leadership_assessment` | Current leadership change capability | Assume moderate capability |
| `change_budget` | Budget for change management activities | Estimate based on scope |

### Context Enrichment
The agent should automatically:
- Identify the types of change involved (structural, process, technology, cultural)
- Assess change magnitude (incremental, significant, transformational)
- Retrieve lessons learned from similar OR change management projects
- Identify industry-specific change challenges (mining FIFO culture, shift worker engagement, etc.)
- Map change timeline to project milestones

## Output Specification

### Document 1: Change Management Plan (.docx)
**Filename**: `VSC_PlanGestionCambio_{ProjectCode}_{Version}_{Date}.docx`

**Structure**:

1. **Cover Page**
2. **Document Control**
3. **Table of Contents**
4. **Executive Summary** (1-2 pages)
   - Change overview and rationale
   - Key stakeholder groups affected
   - Critical success factors
   - Timeline summary
   - Resource requirements
5. **Introduction**
   - 5.1 Project context and background
   - 5.2 Purpose of this plan
   - 5.3 Change management methodology (ADKAR framework)
   - 5.4 Scope of change management activities
   - 5.5 Relationship to other OR workstreams
6. **Change Definition**
   - 6.1 Description of the change
   - 6.2 Reasons for the change (business case)
   - 6.3 Vision for the future state
   - 6.4 Change scope and boundaries
   - 6.5 What is changing vs. what is staying the same
   - 6.6 Change magnitude assessment
   - 6.7 Change timeline and key milestones
7. **Stakeholder Analysis** (Critical Section)
   - 7.1 Stakeholder identification and mapping
   - 7.2 Stakeholder categorization (power/interest matrix)
   - 7.3 Impact analysis by stakeholder group
   - 7.4 Stakeholder engagement strategy per group
   - 7.5 Stakeholder engagement tracker
8. **Impact Assessment**
   - 8.1 Organizational structure impacts
   - 8.2 Role and responsibility changes
   - 8.3 Process and workflow changes
   - 8.4 Technology and systems changes
   - 8.5 Skills and competency impacts
   - 8.6 Cultural and behavioral impacts
   - 8.7 Working conditions impacts (shift patterns, location, etc.)
   - 8.8 Impact heat map (severity by stakeholder group)
9. **Change Readiness Assessment**
   - 9.1 Readiness assessment methodology
   - 9.2 Readiness assessment questionnaire design
   - 9.3 Assessment schedule (baseline, midpoint, pre-commissioning)
   - 9.4 Readiness scoring and interpretation
   - 9.5 Readiness improvement actions
10. **Resistance Management**
    - 10.1 Anticipated resistance sources
    - 10.2 Resistance analysis by stakeholder group
    - 10.3 Root causes of resistance
    - 10.4 Resistance mitigation strategies
    - 10.5 Resistance monitoring mechanisms
    - 10.6 Escalation procedures for persistent resistance
11. **Sponsorship and Leadership Plan**
    - 11.1 Sponsorship model (executive sponsor, senior leaders, middle managers)
    - 11.2 Sponsor activities and responsibilities
    - 11.3 Sponsor action plan with timeline
    - 11.4 Leadership coalition building
    - 11.5 Leadership alignment sessions
    - 11.6 Middle manager engagement strategy
    - 11.7 Change champion/agent network
12. **Communication Plan** (Major Section)
    - 12.1 Communication objectives
    - 12.2 Key messages by phase and audience
    - 12.3 Communication channels and vehicles
    - 12.4 Communication calendar
    - 12.5 Two-way communication mechanisms (feedback loops)
    - 12.6 Frequently Asked Questions (FAQ)
    - 12.7 Communication governance (who approves what)
    - 12.8 Communication effectiveness measurement
13. **Training and Capability Building**
    - 13.1 Change-specific training needs (beyond technical training)
    - 13.2 Leadership change skills development
    - 13.3 New ways-of-working workshops
    - 13.4 Cross-reference to technical training plan
14. **Transition Planning**
    - 14.1 Transition phases and milestones
    - 14.2 Go/No-go criteria for each transition phase
    - 14.3 Parallel running arrangements
    - 14.4 Cutover plan (construction to operations)
    - 14.5 Support during transition (hypercare period)
    - 14.6 Knowledge transfer from project to operations
    - 14.7 Handover protocols
15. **Sustainability and Reinforcement**
    - 15.1 Post-implementation review plan
    - 15.2 Reinforcement mechanisms (recognition, measurement, correction)
    - 15.3 Continuous improvement integration
    - 15.4 Sustainability monitoring KPIs
    - 15.5 Long-term culture development plan
16. **Change Management Governance**
    - 16.1 Change management team structure
    - 16.2 Roles and responsibilities
    - 16.3 Decision-making authority
    - 16.4 Reporting and escalation
    - 16.5 Integration with project governance
17. **Risk Register**
    - 17.1 Change management risks
    - 17.2 Risk assessment (likelihood x impact)
    - 17.3 Mitigation strategies
    - 17.4 Risk monitoring and review
18. **Budget and Resources**
    - 18.1 Change management team costs
    - 18.2 Communication costs
    - 18.3 Training/workshop costs
    - 18.4 Survey and assessment costs
    - 18.5 Event and engagement costs
    - 18.6 Total change management budget
19. **Measurement and Evaluation**
    - 19.1 Change management KPIs
    - 19.2 Adoption metrics
    - 19.3 Engagement metrics
    - 19.4 Utilization metrics
    - 19.5 Proficiency metrics
    - 19.6 Reporting schedule
20. **Appendices**
    - A: Stakeholder register (detailed)
    - B: Impact assessment detail
    - C: Communication materials templates
    - D: Readiness assessment questionnaire
    - E: Change champion role description
    - F: FAQ document
    - G: Glossary of terms

### Document 2: Communication Strategy (.pptx)
**Filename**: `VSC_EstrategiaComunicacion_{ProjectCode}_{Version}_{Date}.pptx`

**Slides**:
1. **Title** - Communication Strategy for [Project]
2. **Why Communication Matters** - Case for structured communication
3. **Our Communication Principles** - Transparency, timeliness, two-way, tailored, consistent
4. **Stakeholder Map** - Visual power/interest matrix with stakeholder groups
5. **Key Messages by Phase**
   - Phase 1 (Awareness): "What is happening and why"
   - Phase 2 (Understanding): "What it means for you"
   - Phase 3 (Engagement): "How you can participate and contribute"
   - Phase 4 (Transition): "We are ready and supported"
   - Phase 5 (Reinforcement): "We did it, and here's what's next"
6. **Communication Channels** - Matrix of channels x audience
7. **Communication Calendar** - Visual timeline of all communications
8. **Town Hall Meeting Plan** - Schedule, format, facilitator roles
9. **Digital Communication** - Intranet, email, digital signage, mobile app
10. **Visual Management** - Posters, boards, visual KPIs in the field
11. **Feedback Mechanisms** - Surveys, suggestion boxes, open forums, skip-level meetings
12. **FAQ Preview** - Top 10 anticipated questions with answers
13. **Communication Team** - Who is responsible for communications
14. **Measuring Effectiveness** - How we know communication is working
15. **Implementation Roadmap** - Month-by-month communication rollout

### Communication Channel Matrix

| Channel | Frequency | Audience | Purpose | Owner |
|---------|-----------|----------|---------|-------|
| Town Hall Meeting | Monthly | All staff | Project updates, Q&A, celebrate wins | Project Director |
| Department Briefing | Bi-weekly | Department teams | Department-specific updates and actions | Department Manager |
| Shift Toolbox Talk | Weekly | Shift crews | Short operational updates, safety integration | Shift Supervisor |
| Email Newsletter | Bi-weekly | All staff + stakeholders | Written project update, milestones, features | Change Team |
| Intranet/SharePoint | Continuous | All staff | Document repository, FAQ, resources | Change Team |
| Digital Signage | Daily | All staff (break rooms, control rooms) | Key messages, milestones, countdown to commissioning | Change Team |
| Notice Boards | Weekly update | Field workers | Visual updates, photos, progress | Change Champions |
| One-on-One Meetings | As needed | Individuals with high impact/resistance | Personalized engagement, concern resolution | Managers |
| Leadership Blog/Video | Monthly | All staff | Executive sponsor personal message | Executive Sponsor |
| Survey/Pulse Check | Quarterly | All staff | Readiness assessment, sentiment measurement | Change Team |
| Suggestion Box (physical + digital) | Continuous | All staff | Anonymous feedback collection | Change Team |
| Change Champion Network | Monthly meeting | Change champions | Cascade communication, gather feedback | Change Lead |
| Skip-Level Meetings | Quarterly | Selected staff groups | Direct executive engagement, hear concerns | Senior Leaders |

## Methodology & Standards

### Primary Change Management Framework: ADKAR
The ADKAR model (Prosci) provides the individual change framework:

| Element | Definition | Key Activities |
|---------|-----------|----------------|
| **A** - Awareness | Understanding WHY the change is happening | Communications explaining the business case |
| **D** - Desire | Personal motivation to participate and support the change | Addressing WIIFM ("What's In It For Me"), resistance management |
| **K** - Knowledge | Understanding HOW to change (skills and knowledge) | Training, education, coaching, mentoring |
| **A** - Ability | Demonstrated capability to implement the change | Practice, OJT, competency verification, support |
| **R** - Reinforcement | Sustaining the change long-term | Recognition, reward, measurement, accountability |

### Supporting Frameworks
| Framework | Application |
|-----------|-------------|
| **Kotter's 8 Steps** | Organizational change sequence (urgency, coalition, vision, communication, empowerment, quick wins, consolidation, anchoring) |
| **Prosci PCT Model** | Project Change Triangle (Leadership/Sponsorship, Project Management, Change Management) |
| **Bridges Transition Model** | Understanding psychological transition (Ending, Neutral Zone, New Beginning) |
| **Stakeholder Theory** | Power/Interest mapping for stakeholder engagement prioritization |

### Change Management Principles for Industrial OR
1. **Safety First**: Any change that could compromise safety must have additional controls and verification
2. **Operational Continuity**: For brownfield projects, change must not disrupt current operations
3. **Cultural Sensitivity**: Mining, oil & gas, and industrial cultures have specific dynamics (shift work, male-dominated, unionized environments)
4. **Geographic Isolation**: Remote site operations have unique communication and engagement challenges
5. **Contractor Integration**: Contractors are often treated as second-class stakeholders but represent 40-60% of the workforce
6. **Practical Over Theoretical**: Industrial workers respond to concrete, practical communication - not corporate jargon
7. **Visible Leadership**: In industrial environments, management presence in the field ("Management By Walking Around") is more powerful than emails

## Step-by-Step Execution

### Phase 1: Assessment & Analysis (Steps 1-4)
1. **Define the Change**: Clearly articulate:
   - What is changing (structure, processes, roles, technology, culture)
   - Why the change is happening (business case, strategic rationale)
   - What the future state looks like (vision)
   - What is NOT changing (anchoring stability)
   - Timeline and key milestones
   - Magnitude assessment (incremental, significant, transformational)
2. **Stakeholder Analysis**: For each stakeholder group:
   - Identify all stakeholder groups (not just leaders)
   - Assess their current state (awareness, attitude, influence, impact)
   - Map on power/interest matrix
   - Classify engagement strategy (manage closely, keep satisfied, keep informed, monitor)
   - Identify key influencers (both positive and negative)
   - Document individual stakeholder concerns and motivations
3. **Impact Assessment**: For each stakeholder group, assess:
   - How their role changes (new responsibilities, removed responsibilities)
   - How their reporting/structure changes
   - How their daily work processes change
   - How their skills/competency requirements change
   - How their working conditions change (schedule, location, environment)
   - Emotional/psychological impact (uncertainty, fear, excitement)
   - Create impact heat map (stakeholder group x impact dimension)
4. **Change Readiness Baseline**: Design and plan:
   - Readiness assessment survey (15-20 questions)
   - Covering: awareness, understanding, willingness, capability, support
   - Scoring methodology (1-5 scale per question, aggregate by ADKAR element)
   - Baseline timing (as early as possible)
   - Comparison points (midpoint, pre-commissioning, post-commissioning)

### Phase 2: Strategy Design (Steps 5-8)
5. **Design Sponsorship Plan**: Define:
   - Executive sponsor role and specific activities
   - Senior leadership coalition members and their roles
   - Middle manager engagement plan (they are critical multipliers)
   - Change champion network (one per department/shift, selected for influence)
   - Sponsor activity calendar (when they need to be visible, speak, act)
6. **Design Communication Strategy**: Create:
   - Communication objectives for each ADKAR phase
   - Key messages tailored to each stakeholder group
   - Channel selection based on audience preferences and site logistics
   - Communication calendar aligned with project milestones
   - Two-way feedback mechanisms
   - FAQ document (anticipate top 20 questions)
   - Communication governance (who approves, who delivers)
7. **Design Resistance Management Plan**: Anticipate and plan for:
   - Common sources of resistance in industrial OR (job security, new skills, changed authority, disruption)
   - Resistance indicators to watch (attendance drops, complaints, grievances, rumor mill)
   - Mitigation strategies per resistance type (information for uncertainty, involvement for loss of control, support for skill anxiety)
   - Escalation path for persistent resistance
   - Role of unions/worker representatives (if applicable)
8. **Design Transition Plan**: Plan the actual changeover:
   - Transition phases (preparation, transition, stabilization)
   - Go/no-go criteria for each phase
   - Parallel operations period (if brownfield)
   - Hypercare/intensive support period post-transition
   - Knowledge transfer mechanisms (project to operations)
   - Cutover checklists

### Phase 3: Detailed Planning (Steps 9-11)
9. **Create Detailed Communication Calendar**: For each month of the project:
   - List all communication activities
   - Specify: date, channel, audience, key messages, responsible person
   - Include preparation time for materials
   - Schedule feedback collection points
   - Plan recognition and celebration events
10. **Define Measurement Framework**: Design how change success is measured:
    - ADKAR scores (from readiness surveys) by stakeholder group
    - Communication effectiveness (reach, comprehension, recall)
    - Adoption metrics (are people using new processes/systems)
    - Engagement metrics (participation in meetings, survey response rates)
    - Resistance metrics (complaints, escalations, turnover intent)
    - Schedule measurement cadence (monthly during implementation)
11. **Develop Risk Register**: Identify change-specific risks:
    - Key person departure during transition
    - Leadership change/loss of sponsorship
    - Union action/industrial relations issues
    - Schedule pressure compressing change timeline
    - Budget cuts reducing change management resources
    - Cultural resistance exceeding expectations
    - For each: assess likelihood x impact, define mitigation, assign owner

### Phase 4: Document Generation & Quality (Steps 12-14)
12. **Generate Change Management Plan (.docx)**: Write the complete plan following the structure defined above.
13. **Generate Communication Strategy (.pptx)**: Create the visual communication strategy presentation.
14. **Quality Review**: Verify completeness, stakeholder coverage, and alignment with project timeline.

## Quality Criteria

### Content Quality (Target: >91% SME Approval)
| Criterion | Weight | Description |
|-----------|--------|-------------|
| Stakeholder Coverage | 25% | All stakeholder groups identified with tailored engagement strategies |
| Methodology Rigor | 20% | ADKAR framework consistently applied; change activities are structured |
| Communication Quality | 20% | Messages are clear, audience-appropriate, and scheduled realistically |
| Practical Applicability | 15% | Plan can be executed in an industrial environment with available resources |
| Measurement Framework | 10% | Change success metrics are defined and measurable |
| Integration | 10% | Change plan is connected to training, staffing, and org design workstreams |

### Automated Quality Checks
- [ ] All stakeholder groups from the organizational design are represented
- [ ] Stakeholder power/interest matrix is complete with engagement strategy per quadrant
- [ ] Impact assessment covers all change dimensions (structure, process, skills, culture, conditions)
- [ ] ADKAR elements (Awareness, Desire, Knowledge, Ability, Reinforcement) are each addressed
- [ ] Communication plan has activities for every month of the project timeline
- [ ] Every stakeholder group has at least one dedicated communication channel
- [ ] Two-way feedback mechanisms are included (not just broadcasting)
- [ ] Sponsorship plan specifies concrete sponsor actions (not just "leadership support")
- [ ] Resistance management plan includes monitoring mechanisms
- [ ] Readiness assessment survey is designed and scheduled
- [ ] Change management KPIs are defined with targets
- [ ] Risk register includes at least 8-10 change-specific risks
- [ ] Change champion network is defined with role description
- [ ] Budget covers all activity categories
- [ ] FAQ document addresses at least 15 anticipated questions
- [ ] No placeholder text remaining

## MCP Integrations

- **mcp-sharepoint**: Store change management plans, communication strategy presentations, and stakeholder analysis documents; retrieve organizational design docs, project scope, and existing policies
- **mcp-outlook**: Distribute stakeholder communications, change announcements, and newsletter content; manage communication calendar email scheduling
- **mcp-teams**: Send real-time change notifications, town hall reminders, and readiness survey links; facilitate change champion network communications and sponsor approval workflows

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs From)
| Agent/Skill | Input Provided | Criticality |
|-------------|---------------|-------------|
| `create-org-design` | Current vs. future organizational structure | Critical |
| `create-staffing-plan` | Workforce changes, new roles, buildup schedule | Critical |
| `create-training-plan` | Training program (capability building component) | High |
| `create-vsc-proposals` | Project scope and timeline | High |
| `hse-agent` | Safety culture requirements | Medium |

### Downstream Dependencies (Outputs To)
| Agent/Skill | Output Provided | Trigger |
|-------------|----------------|---------|
| `create-training-plan` | Change management training needs (leadership, new ways of working) | Automatic |
| `create-kpi-dashboard` | Change management KPIs for monitoring | On request |
| `create-vsc-proposals` | Change management as proposal workstream | On request |
| `communications-agent` | Approved key messages and communication calendar | On request |

### Collaboration During Execution
| Agent/Skill | Collaboration Type | When |
|-------------|-------------------|------|
| `create-org-design` | Impact analysis of organizational changes | During impact assessment |
| `create-staffing-plan` | Workforce transition and recruitment impacts | During impact assessment |
| `create-training-plan` | Training schedule alignment with change timeline | During transition planning |
| `hse-agent` | Safety culture change requirements | During cultural impact assessment |
| `review-documents` | Document quality review | After assembly |

## Templates & References

### Document Templates
- `VSC_ChangeMgmtPlan_Template_v2.0.docx` - Change management plan template
- `VSC_CommunicationStrategy_Template_v1.5.pptx` - Communication strategy presentation template
- `VSC_StakeholderAnalysis_Template_v1.0.xlsx` - Stakeholder analysis workbook
- `VSC_ReadinessAssessment_Template_v1.0.xlsx` - Change readiness survey template
- `VSC_ImpactAssessment_Template_v1.0.xlsx` - Impact assessment matrix template

### Reference Methodologies
- Prosci ADKAR Model and Change Management Methodology
- Kotter's 8-Step Process for Leading Change
- Bridges' Managing Transitions
- LaMarsh Managed Change Framework
- VSC Industrial Change Management Best Practices Guide

## Examples

### Example: Stakeholder Impact Matrix

| Stakeholder Group | Headcount | Structure Impact | Role Impact | Process Impact | Skills Impact | Conditions Impact | Overall Impact | Engagement Level |
|-------------------|-----------|-----------------|-------------|---------------|---------------|-------------------|---------------|-----------------|
| Plant Manager | 1 | Low | Medium | Medium | Low | Low | Medium | Manage Closely |
| Operations Managers | 3 | High | High | High | Medium | Low | High | Manage Closely |
| Shift Supervisors | 12 | Medium | High | High | High | High | High | Manage Closely |
| Control Room Operators | 16 | Low | High | High | High | Medium | High | Keep Informed |
| Field Operators | 48 | Low | Medium | High | High | High | High | Keep Informed |
| Maintenance Manager | 1 | High | High | High | Medium | Low | High | Manage Closely |
| Maintenance Supervisors | 8 | Medium | High | High | Medium | Medium | High | Keep Satisfied |
| Maintenance Technicians | 40 | Low | Medium | High | High | Medium | High | Keep Informed |
| HSE Team | 8 | Medium | Medium | Medium | Medium | Low | Medium | Keep Informed |
| Admin/Support | 15 | Medium | Medium | Medium | Low | Low | Medium | Monitor |
| Contractors | 60 | High | High | High | Medium | High | High | Keep Informed |

### Example: Communication Calendar (Month 1)

| Date | Activity | Channel | Audience | Key Message | Responsible | Materials |
|------|----------|---------|----------|-------------|-------------|-----------|
| Week 1 | Project Launch Announcement | Town Hall | All staff | "We are building the future - here's the plan" | Plant Manager + Project Director | Presentation, video |
| Week 1 | Leadership Alignment Workshop | Workshop | Senior leaders (8) | "Your role in leading this change" | Change Lead | Workshop guide, ADKAR intro |
| Week 2 | Department Briefings | Meeting | Each department | "What this means for our department" | Department Managers | Talking points, FAQ |
| Week 2 | Intranet Launch | Digital | All staff | Project page with schedule, FAQ, documents | Change Team | Intranet page |
| Week 3 | Change Champion Kickoff | Workshop | Change champions (8) | "You are the bridge - here's your role" | Change Lead | Champion guide, toolkit |
| Week 3 | Shift Toolbox Talk #1 | Field meeting | All shift crews | "Project overview and what to expect" | Shift Supervisors | Talking points card |
| Week 4 | Baseline Readiness Survey | Online survey | All staff | "Your input matters - tell us where you are" | Change Team | Survey questionnaire |
| Week 4 | Digital Signage Launch | Screens | All staff (break rooms) | Key dates, project vision, FAQ highlights | Change Team | Digital content |
| Week 4 | Newsletter #1 | Email | All staff + external stakeholders | Monthly project update | Change Team | Newsletter template |

### Example: ADKAR Assessment Scoring

| ADKAR Element | Question (example) | Score (1-5) | Gap Action |
|---------------|-------------------|-------------|------------|
| **Awareness** | I understand why the OR project is necessary | 3.8 | Continue communication on business case |
| **Awareness** | I understand the consequences of not changing | 3.2 | Address "what if we don't change" more explicitly |
| **Desire** | I personally support this change | 3.0 | WIIFM messaging needs strengthening |
| **Desire** | I see personal benefit in the new way of working | 2.8 | Address career path, development opportunities |
| **Knowledge** | I understand what new skills I need to develop | 2.5 | Accelerate training plan communication |
| **Knowledge** | I know where to get help and information | 3.5 | Resources are accessible; maintain |
| **Ability** | I feel confident I can perform in my new role | 2.2 | OJT and simulation training needed |
| **Ability** | I have had enough practice with new processes | 1.8 | Critical gap - increase hands-on practice |
| **Reinforcement** | My achievements in the new way are recognized | N/A | Not yet applicable (pre-change assessment) |

**Interpretation**: Scores below 3.0 indicate gaps requiring targeted intervention. The above example shows the organization is progressing on Awareness but has significant gaps in Knowledge and Ability - pointing to an urgent need to accelerate training and hands-on practice before transition.
