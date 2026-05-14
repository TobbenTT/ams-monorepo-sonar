---
name: manage-stakeholder-engagement
description: "Track and manage stakeholder engagement through power/interest mapping, communication preferences, feedback loops, and influence analysis for OR projects. Triggers: 'stakeholder engagement', 'stakeholder map', 'gestion de partes interesadas'."
---

# Manage Stakeholder Engagement
## Skill ID: manage-stakeholder-engagement
## Version: 1.0.0
## Category: C - Tracking
## Priority: High

## Purpose

Manages comprehensive stakeholder engagement for Operational Readiness projects by maintaining a living stakeholder register, power/interest matrices, engagement strategies, communication preference tracking, feedback collection and analysis, and influence mapping. This skill ensures that every stakeholder with the power to accelerate or block OR progress is identified, classified, and actively managed through tailored engagement approaches.

In large industrial capital projects -- mining expansions, oil & gas greenfield developments, chemical plant startups -- stakeholder dynamics are a leading cause of schedule delays and cost overruns. Community opposition, regulatory friction, union resistance, EPC contractor misalignment, and internal organizational politics can each independently derail an otherwise technically sound OR program. This skill provides the systematic framework to map these dynamics, anticipate conflicts, and maintain engagement momentum from FEED through ramp-up.

The stakeholder engagement framework integrates tightly with the Orchestrator agent for project governance and communications planning, and feeds engagement intelligence back into change management, training programs, and regulatory compliance activities managed by other agents.

## Intent & Specification

The AI agent MUST understand the following core goals:

1. **Power/Interest Matrix is the Core Analytical Tool**: Every stakeholder must be positioned on a power/interest (or influence/impact) matrix using Mendelow's framework. The four quadrants (Manage Closely, Keep Satisfied, Keep Informed, Monitor) drive differentiated engagement strategies. Position changes must be tracked over time.

2. **Engagement is Bidirectional**: Stakeholder management is not just about broadcasting information outward. It requires active listening -- capturing feedback, concerns, grievances, and expectations -- and demonstrating that input influences decisions. The agent must track feedback loops and resolution status.

3. **Cultural and Political Context Matters**: In Latin American industrial projects, stakeholder dynamics include unique factors: community relations (comunidades), indigenous consultation (consulta indigena per ILO Convention 169), union dynamics (sindicatos), government agencies (SERNAGEOMIN, SMA, SEA), and corporate hierarchies. The agent must account for these.

4. **Communication Preferences Are Individual**: Each stakeholder or stakeholder group has preferred communication channels (face-to-face, email, WhatsApp, town hall, formal letter), frequency expectations, language preferences, and formality levels. These must be captured and respected.

5. **Influence Networks Are Mapped**: Beyond individual stakeholders, the agent must identify influence relationships -- who influences whom, coalition dynamics, potential alliances, and opposition blocs. Network analysis enables proactive coalition building.

6. **Engagement Effectiveness is Measured**: The framework must include quantitative metrics: engagement frequency vs. plan, sentiment trends, feedback resolution rate, issue escalation counts, and overall stakeholder satisfaction scores.

7. **Language**: Spanish (Latin American) by default. Stakeholder names, organizational affiliations, and direct quotes must be preserved in their original language.

## Trigger / Invocation

```
/manage-stakeholder-engagement
```

### Natural Language Triggers
- "Create a stakeholder engagement plan for the project"
- "Map our stakeholders by power and interest"
- "Build a stakeholder register for the OR program"
- "Track stakeholder feedback and engagement activities"
- "Crear plan de gestion de partes interesadas"
- "Mapear stakeholders por poder e interes"
- "Registrar y dar seguimiento a las partes interesadas del proyecto"

## Input Requirements

### Required Inputs
| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `project_context` | Project name, phase, location, industry sector, and high-level scope | Text / .docx | Orchestrator / User |
| `organizational_chart` | Client and EPC organizational structures with key personnel | .xlsx / .pdf / .docx | Client HR / Project Team |
| `stakeholder_seed_list` | Initial list of known stakeholders (names, roles, organizations) | .xlsx / text | Project Team |
| `project_phase` | Current OR phase (FEED, Detailed Design, Construction, Commissioning, Ramp-up) | Text | User |

### Optional Inputs (Highly Recommended)
| Input | Description | Default |
|-------|-------------|---------|
| `previous_engagement_records` | Historical engagement logs, meeting minutes, correspondence | None (start fresh) |
| `community_baseline` | Social baseline study, community demographics, grievance history | Generic LATAM mining/energy context |
| `regulatory_stakeholder_map` | Government agencies with jurisdiction and their current posture | Derive from project location and sector |
| `union_agreements` | Collective bargaining agreements, union leadership contacts | Flag as RFI if labor-intensive project |
| `epc_org_chart` | EPC contractor organizational structure and key interfaces | Request from Execution agent |
| `risk_register` | Project risk register for stakeholder-related risks | Cross-reference from HSE agent |
| `communication_plan` | Existing communications plan or strategy | Generate as part of this skill output |

### Context Enrichment
The agent should automatically:
- Identify standard regulatory stakeholders based on project sector and location (Chilean mining: SERNAGEOMIN, SMA, SEA, DGA, CONAF; Oil & gas: SEC, ENAP regulators)
- Map ILO Convention 169 requirements for indigenous consultation if applicable
- Retrieve standard community engagement best practices from IFC Performance Standards
- Pull corporate governance stakeholder frameworks (King IV, ISO 26000, AA1000SES)
- Reference Chilean environmental assessment (SEIA) stakeholder requirements

## Output Specification

### Document 1: Stakeholder Engagement Plan (.docx)
**Filename**: `VSC_StakeholderEngagement_{ProjectCode}_{Version}_{Date}.docx`

**Structure**:
1. **Cover Page** - VSC branding, project identification
2. **Document Control** - Revision history, approval matrix
3. **Table of Contents**
4. **Executive Summary** (2 pages)
   - Stakeholder landscape overview
   - Key engagement priorities
   - Critical risks and mitigations
5. **Introduction & Scope** (1-2 pages)
   - Project context and phase
   - Engagement objectives
   - Applicable standards and regulations
6. **Stakeholder Identification & Analysis** (4-5 pages)
   - 6.1 Stakeholder identification methodology
   - 6.2 Stakeholder categories (Internal, External, Regulatory, Community)
   - 6.3 Power/interest matrix analysis
   - 6.4 Influence network mapping
   - 6.5 Stakeholder profile summaries (top 20 by priority)
7. **Engagement Strategy** (4-5 pages)
   - 7.1 Engagement approach by quadrant
   - 7.2 Communication channels and frequency matrix
   - 7.3 Key messages by stakeholder group
   - 7.4 Cultural and language considerations
   - 7.5 Escalation protocols for stakeholder issues
8. **Feedback Management** (2-3 pages)
   - 8.1 Feedback capture mechanisms
   - 8.2 Grievance management procedure
   - 8.3 Feedback-to-action tracking
   - 8.4 Sentiment monitoring approach
9. **Engagement Calendar** (2 pages)
   - 9.1 Monthly engagement schedule
   - 9.2 Key milestones requiring stakeholder involvement
   - 9.3 Regulatory consultation timeline
10. **Monitoring & Evaluation** (2 pages)
    - 10.1 Engagement KPIs and targets
    - 10.2 Reporting frequency and format
    - 10.3 Plan review and update triggers
11. **Appendices**
    - A: Complete stakeholder register (reference to .xlsx)
    - B: Power/interest matrix visual
    - C: Influence network diagram
    - D: Communication templates

### Document 2: Stakeholder Register Workbook (.xlsx)
**Filename**: `VSC_StakeholderRegister_{ProjectCode}_{Version}_{Date}.xlsx`

**Sheets**:

#### Sheet 1: Stakeholder Register
| Column | Description |
|--------|-------------|
| Stakeholder_ID | Unique identifier (STK-001) |
| Name | Individual or group name |
| Organization | Company, agency, community |
| Role_Title | Position or role |
| Category | Internal / External / Regulatory / Community / Media |
| Subcategory | Specific classification (Union, NGO, Government, etc.) |
| Power_Score | Power/influence rating (1-5) |
| Interest_Score | Interest/impact rating (1-5) |
| Quadrant | Manage Closely / Keep Satisfied / Keep Informed / Monitor |
| Current_Sentiment | Supportive / Neutral / Concerned / Opposed |
| Engagement_Priority | Critical / High / Medium / Low |
| Preferred_Channel | Face-to-face / Email / Phone / Formal letter / Town hall |
| Preferred_Language | Spanish / English / Indigenous language |
| Preferred_Frequency | Weekly / Biweekly / Monthly / Quarterly / As needed |
| Key_Interests | What matters most to this stakeholder |
| Key_Concerns | Known concerns or objections |
| Engagement_Owner | VSC/Client person responsible for managing this relationship |

#### Sheet 2: Engagement Log
| Column | Description |
|--------|-------------|
| Log_ID | Unique log entry identifier |
| Date | Date of engagement activity |
| Stakeholder_ID | Linked stakeholder |
| Activity_Type | Meeting / Email / Call / Town Hall / Site Visit / Letter |
| Topic | Subject of engagement |
| Key_Messages_Delivered | What was communicated |
| Feedback_Received | Stakeholder response or concerns raised |
| Action_Items | Commitments made or actions required |
| Sentiment_After | Stakeholder sentiment post-engagement |
| Next_Steps | Planned follow-up |
| Logged_By | Person who recorded the entry |

#### Sheet 3: Power/Interest Matrix
| Column | Description |
|--------|-------------|
| Stakeholder_ID | Linked stakeholder |
| Name | Stakeholder name |
| Power_Score | 1-5 rating |
| Interest_Score | 1-5 rating |
| Quadrant | Calculated quadrant |
| Movement_Trend | Stable / Power increasing / Interest increasing / Shifting |
| Previous_Quadrant | Quadrant in last assessment (if changed) |
| Strategy | Differentiated engagement approach |

#### Sheet 4: Feedback & Issues Tracker
| Column | Description |
|--------|-------------|
| Issue_ID | Unique issue identifier |
| Stakeholder_ID | Source stakeholder |
| Date_Raised | When the issue was raised |
| Category | Technical / Schedule / Environmental / Social / Financial |
| Description | Issue description |
| Severity | Critical / High / Medium / Low |
| Status | Open / In Progress / Resolved / Escalated |
| Owner | Person responsible for resolution |
| Resolution_Date | Target or actual resolution date |
| Resolution_Description | How the issue was resolved |
| Satisfaction_Rating | Stakeholder satisfaction with resolution (1-5) |

#### Sheet 5: Engagement KPIs Dashboard
| Column | Description |
|--------|-------------|
| KPI_Name | Metric name |
| Target | Target value |
| Actual | Current value |
| Trend | Improving / Stable / Declining |
| Period | Reporting period |

## Procedure

### Step 1: Stakeholder Identification and Profiling
- Compile initial stakeholder list from all input sources
- Categorize each stakeholder (Internal, External, Regulatory, Community, Media)
- Research organizational context and individual background for top-priority stakeholders
- Identify influence relationships and coalition dynamics
- Document key interests, concerns, and communication preferences for each stakeholder

### Step 2: Power/Interest Analysis
- Score each stakeholder on Power (1-5) and Interest (1-5) using defined criteria
- Plot stakeholders on the power/interest matrix
- Assign quadrant and differentiated engagement strategy per quadrant
- Identify the top 10-15 "Manage Closely" stakeholders requiring intensive engagement
- Map influence networks showing who influences whom

### Step 3: Engagement Strategy Development
- Define engagement approach for each quadrant and priority level
- Design communication channel and frequency matrix per stakeholder group
- Develop key messages tailored to each stakeholder group's interests and concerns
- Create engagement calendar aligned with project milestones and regulatory deadlines
- Establish escalation protocols for stakeholder conflicts and grievances

### Step 4: Feedback and Issue Management Design
- Define feedback capture mechanisms (meeting notes, surveys, grievance forms)
- Design the feedback-to-action workflow with SLA targets
- Establish sentiment monitoring approach (periodic surveys, engagement log analysis)
- Create issue severity classification and escalation matrix
- Define closure criteria and satisfaction measurement

### Step 5: Documentation and Baseline
- Generate the Stakeholder Engagement Plan (.docx)
- Generate the Stakeholder Register Workbook (.xlsx) with all sheets populated
- Establish baseline sentiment scores for all tracked stakeholders
- Define engagement KPIs with targets aligned to project phase
- Schedule first plan review date and define update triggers

## Quality Criteria

| Criterion | Weight | Description | Target |
|-----------|--------|-------------|--------|
| Technical Accuracy | 30% | Power/interest classifications are defensible; engagement strategies align with AA1000SES and IFC PS | >91% |
| Completeness | 25% | All relevant stakeholder groups identified; no blind spots in regulatory, community, or internal domains | >95% |
| Consistency | 15% | Engagement strategies are consistent with stakeholder classifications; no contradictions | 100% |
| Format | 10% | Professional VSC branding; power/interest matrix is visually clear; tables properly formatted | >95% |
| Actionability | 10% | Engagement plan can be executed immediately; clear calendar, owners, channels, and messages | >90% |
| Traceability | 10% | Every engagement action traces to a stakeholder need; strategies trace to analysis | >90% |

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents)
| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| `orchestrator` | Project governance | Provides project context, phase, organizational structure, and key contacts |
| `orchestrator` / `create-or-plan` | OR milestones | Provides milestone schedule for engagement calendar alignment |
| `hse` | Community and regulatory context | Provides EIA stakeholder requirements and regulatory agency contacts |
| `contracts-compliance` | Regulatory stakeholders | Provides regulatory permit holders and compliance obligation owners |
| `execution` | EPC interfaces | Provides EPC contractor organizational structure and key interfaces |
| `operations` | Operational stakeholders | Provides future operations team structure and union context |

### Downstream Dependencies (Outputs TO other agents)
| Agent/Skill | Output Provided | Trigger |
|-------------|----------------|---------|
| `orchestrator` | Stakeholder intelligence | Automatic -- feeds project governance and risk management |
| `create-internal-communications` | Audience profiles and preferences | Automatic -- drives communication targeting |
| `orchestrator` / `facilitate-change-management` | Change resistance indicators | On request -- identifies change-resistant stakeholders |
| `hse` | Community engagement records | On request -- for regulatory compliance reporting |
| `contracts-compliance` | Regulatory engagement log | On request -- evidence for permit compliance |

### Collaboration During Execution
| Agent/Skill | Collaboration Type | When |
|-------------|-------------------|------|
| `orchestrator` | Alignment on key messages | During engagement strategy development |
| `hse` | Joint community engagement planning | During regulatory consultation phases |
| `operations` | Union and workforce engagement | During staffing and training phases |
| `execution` | EPC contractor engagement | During construction and commissioning phases |

## References

### Primary Standards
| Standard | Application |
|----------|-------------|
| **AA1000SES (2015)** | AccountAbility Stakeholder Engagement Standard -- core methodology |
| **IFC Performance Standards** | International Finance Corporation standards for community engagement (PS1, PS5, PS7) |
| **ISO 26000** | Social responsibility -- stakeholder identification and engagement guidance |
| **ISO 21500 / PMBoK** | Project stakeholder management processes |
| **King IV Report** | Corporate governance -- stakeholder-inclusive approach |

### Regulatory Framework (Chile)
| Regulation | Application |
|------------|-------------|
| **Ley 19.300 / DS 40** | SEIA environmental impact assessment -- public participation requirements |
| **ILO Convention 169** | Indigenous and tribal peoples consultation (consulta indigena) |
| **Ley 20.500** | Participacion ciudadana en la gestion publica |
| **DS 132** | Reglamento de Seguridad Minera -- community safety consultation |
| **Ley 21.075** | Regulacion de toma de terrenos -- community conflict management |

### Industry References
- Mendelow's Stakeholder Matrix -- Power/Interest analytical framework
- Mitchell, Agle & Wood (1997) -- Stakeholder salience model (Power, Legitimacy, Urgency)
- ICMM Community Development Toolkit
- IFC Good Practice Handbook on Stakeholder Engagement
- Equator Principles -- stakeholder engagement requirements for project finance

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-02-25 | VSC IT/OT Agent | Initial version. Complete stakeholder engagement framework with power/interest analysis, engagement planning, feedback tracking, and influence mapping. |
