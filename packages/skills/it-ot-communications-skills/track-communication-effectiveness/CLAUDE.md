---
name: track-communication-effectiveness
description: "Measure and analyze internal communication effectiveness through KPIs (reach, engagement, comprehension), survey results, feedback loops, sentiment analysis, and channel performance metrics for OR projects. Triggers: 'communication effectiveness', 'communication KPIs', 'efectividad de comunicaciones', 'metricas de comunicacion'."
---

# Track Communication Effectiveness
## Skill ID: track-communication-effectiveness
## Version: 1.0.0
## Category: B - Analysis
## Priority: Medium

## Purpose

Measures, tracks, and analyzes the effectiveness of internal communications throughout Operational Readiness projects in mining, oil & gas, chemicals, and energy sectors. Communication is only effective if it reaches its intended audience, is understood, and drives the desired behavior or awareness. This skill provides a structured framework to evaluate whether project communications are achieving their objectives through quantitative metrics (reach, open rates, engagement) and qualitative assessment (comprehension, sentiment, behavioral change).

In large industrial OR programs with hundreds of stakeholders across multiple organizations and geographies, communication effectiveness is not a luxury metric -- it is a leading indicator of organizational readiness. When communications fail to reach field crews, safety incidents increase. When change messages are misunderstood, resistance escalates. When leadership updates are ignored, alignment deteriorates. This skill identifies communication gaps before they become operational problems.

The effectiveness tracking framework integrates with the create-internal-communications skill (which produces the communications being measured), the manage-stakeholder-engagement skill (which provides audience segmentation), and the manage-change-communications skill (which requires effectiveness data to calibrate change messaging).

## Intent & Specification

The AI agent MUST understand the following core goals:

1. **Quantitative Metrics Are Necessary but Insufficient**: Tracking open rates and distribution counts tells you about reach, not impact. The framework must combine reach metrics with comprehension testing, sentiment analysis, and behavioral indicators to provide a holistic view of communication effectiveness.

2. **Baseline-Compare-Improve Cycle**: Establish baseline metrics at project start, measure periodically, compare against baselines and targets, and recommend improvements. Without baselines, effectiveness measurement is meaningless.

3. **Channel-Specific Measurement**: Different communication channels (email, town hall, poster, WhatsApp, intranet) require different effectiveness metrics. Email has open rates; town halls have attendance and Q&A participation; posters have recall rates; WhatsApp has read receipts and response rates.

4. **Feedback Loops Must Be Active**: Passive metrics (open rates, attendance) are input indicators. Active feedback (surveys, pulse checks, focus groups) provides the qualitative depth needed to understand why communications succeed or fail.

5. **Sentiment Analysis Detects Early Warning Signals**: Tracking sentiment around key project topics (safety culture, change initiatives, organizational restructuring, schedule changes) provides early warning of resistance, confusion, or disengagement before they manifest as operational problems.

6. **Cultural Sensitivity in Measurement**: Survey design, feedback collection, and sentiment interpretation must account for Latin American cultural norms around hierarchy, indirect communication, and social desirability bias. Anonymous channels are essential for honest feedback.

7. **Language**: Spanish (Latin American) by default for surveys and reports. Bilingual where the project workforce includes non-Spanish speakers.

## Trigger / Invocation

```
/track-communication-effectiveness
```

### Natural Language Triggers
- "How effective are our project communications?"
- "Generate communication effectiveness report for this quarter"
- "Analyze survey results from the last town hall"
- "What is the sentiment around the organizational change?"
- "Track engagement metrics for the last newsletter"
- "Que tan efectivas son nuestras comunicaciones del proyecto?"
- "Genera el reporte de efectividad de comunicaciones para este trimestre"
- "Analiza los resultados de la encuesta del ultimo town hall"
- "Cual es el sentimiento sobre el cambio organizacional?"
- "Monitorea las metricas de engagement del ultimo boletin"

## Input Requirements

### Required Inputs
| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `project_context` | Project name, phase, communication plan reference | Text / .docx | Orchestrator |
| `communication_log` | Record of communications issued (type, date, audience, channel) | .xlsx / Table | create-internal-communications |
| `measurement_period` | Time period for effectiveness analysis (week, month, quarter) | Text | User |
| `target_audience_segments` | Stakeholder groups and their communication preferences | .xlsx / Table | manage-stakeholder-engagement |
| `communication_objectives` | What each communication aimed to achieve (awareness, understanding, action) | Text / Table | Communication plan |

### Optional Inputs (Highly Recommended)
| Input | Description | Default |
|-------|-------------|---------|
| `email_analytics` | Open rates, click rates, forward rates from email platform | Request from IT |
| `intranet_analytics` | Page views, unique visitors, time on page, download counts | Request from IT |
| `town_hall_attendance` | Attendance records, Q&A logs, feedback forms | Request from event organizer |
| `survey_results` | Pulse survey or feedback survey raw data | Design and deploy survey |
| `whatsapp_metrics` | Read receipts, response rates, group engagement | Request from channel admins |
| `poster_recall_survey` | Recall testing for physical communications | Deploy recall survey |
| `sentiment_data` | Qualitative feedback, focus group notes, informal feedback | Collect through feedback channels |
| `baseline_metrics` | Previous period effectiveness metrics for trend analysis | First measurement establishes baseline |
| `change_communication_targets` | Specific targets from manage-change-communications | Request from change management |

### Context Enrichment
The agent should automatically:
- Retrieve the communication log from create-internal-communications skill outputs
- Pull stakeholder segmentation from manage-stakeholder-engagement skill
- Reference change management targets from manage-change-communications skill
- Check for correlations between communication effectiveness and operational readiness metrics
- Identify communication channels with declining engagement trends

## Output Specification

### Output 1: Communication Effectiveness Report (.docx)
**Filename**: `VSC_CommEffectiveness_{ProjectCode}_{Period}_{Version}_{Date}.docx`

**Structure**:
1. **Executive Summary** (1 page)
   - Overall communication effectiveness score (composite index)
   - Key findings (top 3 strengths, top 3 improvement areas)
   - Trend vs. previous period
   - Critical recommendations

2. **Reach Metrics** (2-3 pages)
   - Distribution coverage by audience segment
   - Email open rates and click-through rates
   - Town hall attendance rates
   - Intranet page views and unique visitors
   - Physical communication exposure estimates
   - WhatsApp/messaging read receipts

3. **Engagement Metrics** (2-3 pages)
   - Active engagement rates (replies, questions, feedback submitted)
   - Town hall Q&A participation rates
   - Survey response rates
   - Content sharing and forwarding rates
   - Time spent on communication materials
   - Repeat access patterns (users returning to reference materials)

4. **Comprehension Assessment** (1-2 pages)
   - Key message recall rates (from surveys or spot checks)
   - Comprehension quiz results (if deployed)
   - Misunderstanding patterns identified
   - Language/translation effectiveness (bilingual contexts)

5. **Sentiment Analysis** (2-3 pages)
   - Overall project sentiment trending (positive/neutral/negative)
   - Sentiment by topic (safety, change, schedule, organization)
   - Sentiment by audience segment
   - Notable shifts and potential causes
   - Comparison to change management ADKAR scores (if available)

6. **Channel Performance** (1-2 pages)
   - Effectiveness by channel (email, town hall, poster, WhatsApp, intranet)
   - Channel preferences by audience segment
   - Cost-effectiveness analysis by channel
   - Channel saturation indicators (too many communications?)

7. **Feedback Loop Analysis** (1-2 pages)
   - Feedback volume and themes
   - Response time to feedback (acknowledgment and action)
   - Recurring themes and unresolved concerns
   - Suggestions and ideas received

8. **Recommendations** (1-2 pages)
   - Prioritized improvement actions with expected impact
   - Channel optimization recommendations
   - Content adjustments based on comprehension gaps
   - Frequency calibration (increase/decrease by channel/audience)
   - Targeted interventions for low-engagement segments

9. **Appendix**
   - Raw metric tables
   - Survey instruments used
   - Calculation methodology

### Output 2: Communication KPI Dashboard (.xlsx schema)
**Filename**: `VSC_CommKPI_Dashboard_{ProjectCode}_{Period}_{Date}.xlsx`

**Sheets**:

#### Sheet 1: KPI Summary
| Column | Description |
|--------|-------------|
| KPI_Name | Metric name |
| Category | Reach / Engagement / Comprehension / Sentiment / Channel |
| Current_Value | Current period measurement |
| Previous_Value | Previous period measurement |
| Target | Target value |
| Trend | Improving / Stable / Declining |
| RAG_Status | Red / Amber / Green |
| Notes | Context or explanation |

#### Sheet 2: Communication Log
| Column | Description |
|--------|-------------|
| Comm_ID | Communication identifier |
| Date | Date issued |
| Type | Newsletter / Update / Town Hall / Announcement / Safety Bulletin |
| Audience | Target audience segment(s) |
| Channel | Distribution channel(s) |
| Reach_Count | Number of people reached |
| Engagement_Count | Number who engaged (opened, attended, responded) |
| Reach_Rate | Percentage of target audience reached |
| Engagement_Rate | Percentage who actively engaged |
| Effectiveness_Score | Composite effectiveness score (0-100) |

#### Sheet 3: Survey Results
| Column | Description |
|--------|-------------|
| Survey_ID | Survey identifier |
| Question | Survey question text |
| Response_Scale | Likert 1-5 / Yes-No / Free text |
| N_Responses | Number of responses |
| Mean_Score | Average score (numeric questions) |
| Distribution | Response distribution (e.g., "20% strongly agree, 45% agree...") |
| Themes | Key themes from free text responses |

#### Sheet 4: Sentiment Tracker
| Column | Description |
|--------|-------------|
| Period | Measurement period |
| Topic | Topic being tracked |
| Audience_Segment | Audience group |
| Positive_Pct | Percentage positive sentiment |
| Neutral_Pct | Percentage neutral sentiment |
| Negative_Pct | Percentage negative sentiment |
| Net_Sentiment | Positive minus Negative percentage |
| Notable_Shifts | Significant changes from previous period |
| Contributing_Factors | Events or communications influencing sentiment |

### Output 3: Pulse Survey Template (.docx)
**Filename**: `VSC_PulseSurvey_{ProjectCode}_{Topic}_{Date}.docx`

**Structure** (bilingual Spanish/English, 5-10 questions, 3 minutes to complete):
1. **Header** - Project branding, anonymous guarantee, purpose statement
2. **Reach Questions** - "Did you receive the [communication]?" / "Recibiste el [comunicado]?"
3. **Comprehension Questions** - "What are the key changes announced?" / "Cuales son los cambios clave anunciados?"
4. **Sentiment Questions** - Likert scale on confidence, support, clarity
5. **Action Questions** - "Do you know what you need to do differently?" / "Sabes que debes hacer diferente?"
6. **Open Feedback** - "What would you like to know more about?" / "Que te gustaria saber mas?"
7. **Demographic** - Role category, location, department (optional, anonymous)

## Procedure

### Step 1: Define Measurement Framework and Baselines
- Review the Intent Specification and project communication plan for effectiveness targets
- Define KPIs by category (Reach, Engagement, Comprehension, Sentiment, Channel Performance)
- Establish baseline measurements for each KPI (first measurement period or pre-project survey)
- Set targets for each KPI aligned with OR program objectives
- Configure data collection mechanisms for each channel (email analytics, attendance tracking, surveys)
- Design the composite effectiveness scoring methodology

### Step 2: Data Collection and Aggregation
- Collect quantitative metrics from communication platforms (email, intranet, messaging)
- Gather attendance and participation data from events (town halls, training sessions)
- Deploy pulse surveys or feedback instruments at appropriate intervals
- Compile qualitative feedback from feedback channels, Q&A sessions, and informal sources
- Aggregate data by communication type, audience segment, channel, and time period
- Validate data quality and flag any collection gaps

### Step 3: Analysis and Insight Generation
- Calculate all KPIs and compare against baselines and targets
- Perform trend analysis across measurement periods
- Analyze effectiveness variations by audience segment and channel
- Conduct sentiment analysis on qualitative feedback (thematic coding, sentiment scoring)
- Identify correlations between communication effectiveness and operational readiness indicators
- Detect patterns in low-engagement segments (demographics, geography, shift patterns)

### Step 4: Recommendations and Action Planning
- Prioritize improvement recommendations based on gap analysis (largest gaps first)
- Develop channel optimization recommendations (right message, right channel, right frequency)
- Design targeted interventions for underserved or disengaged audience segments
- Propose content adjustments based on comprehension and sentiment findings
- Recommend feedback loop improvements for continuous calibration
- Identify structural barriers to communication effectiveness (access, language, literacy, technology)

### Step 5: Reporting and Feedback Integration
- Generate the Communication Effectiveness Report with all sections
- Produce the KPI Dashboard with current period data and trends
- Design pulse surveys for the next measurement period
- Present key findings and recommendations to project leadership
- Update the create-internal-communications skill with effectiveness insights
- Feed sentiment data back to manage-change-communications for messaging calibration

## Quality Criteria

| Criterion | Weight | Description | Target |
|-----------|--------|-------------|--------|
| Technical Accuracy | 30% | KPIs calculated correctly; survey analysis statistically sound; sentiment scoring consistent | >91% |
| Completeness | 25% | All communication channels measured; all audience segments covered; all KPI categories tracked | >91% |
| Consistency | 15% | Measurement methodology consistent across periods; scoring definitions stable; terminology uniform | >91% |
| Format | 10% | Report is visually clear; dashboards are scannable; charts are accurate and well-labeled | >91% |
| Actionability | 10% | Recommendations are specific, prioritized, and implementable; insights drive measurable improvements | >91% |
| Traceability | 10% | Every KPI traces to source data; survey results are attributable; recommendations link to findings | >91% |

### Effectiveness-Specific Quality Checks
- [ ] Baseline metrics are established before trend analysis is performed
- [ ] Survey instruments are validated for cultural appropriateness (Latin American context)
- [ ] Anonymous feedback guarantees are maintained (no individual identification)
- [ ] Sentiment analysis accounts for social desirability bias
- [ ] Recommendations are feasible within project constraints (budget, timeline, resources)
- [ ] Data collection does not create survey fatigue (max 1 pulse survey per month per audience)

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents)
| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| `create-internal-communications` | Communication log | Provides record of all communications issued for measurement |
| `manage-stakeholder-engagement` | Audience segmentation | Provides stakeholder groups and their communication preferences |
| `manage-change-communications` | Change communication targets | Provides ADKAR-based targets for change communication effectiveness |
| `orchestrator` | Project milestones and KPIs | Provides context for correlating communication effectiveness with project performance |
| `hse` | Safety communication records | Provides safety bulletin distribution and training attendance data |
| `operations` | Operational readiness metrics | Provides readiness indicators for correlation with communication effectiveness |

### Downstream Dependencies (Outputs TO other agents)
| Agent/Skill | Output Provided | Trigger |
|-------------|----------------|---------|
| `create-internal-communications` | Effectiveness insights for content improvement | After each analysis cycle |
| `manage-change-communications` | Sentiment data for messaging calibration | After each analysis cycle |
| `manage-stakeholder-engagement` | Engagement metrics for stakeholder management | On request |
| `orchestrator` | Communication readiness status for gate reviews | On request |
| `manage-document-systems` | Effectiveness reports filed in DMS | Automatic |

### Collaboration During Execution
| Agent/Skill | Collaboration Type | When |
|-------------|-------------------|------|
| `create-internal-communications` | Feedback loop for content optimization | After effectiveness analysis |
| `manage-change-communications` | Sentiment alignment for change messaging | When sentiment shifts detected |
| `manage-stakeholder-engagement` | Audience targeting refinement | When engagement gaps identified |
| `hse` | Safety communication effectiveness review | Periodic (monthly minimum) |

## References

### Primary Standards
| Standard | Application |
|----------|-------------|
| **IABC Measurement Standards** | International Association of Business Communicators -- communication measurement framework |
| **Barcelona Principles 3.0** | AMEC measurement principles for communication effectiveness |
| **ISO 22301** | Business continuity communication measurement |
| **Kirkpatrick Model** | Four levels of evaluation (Reaction, Learning, Behavior, Results) applied to communications |

### Measurement Methodologies
- AMEC Integrated Evaluation Framework -- global standard for communication measurement
- Prosci ADKAR Assessment -- change communication effectiveness measurement
- Net Promoter Score (NPS) -- adapted for internal communication satisfaction
- Employee Engagement Index -- communication components of engagement measurement

### Industry References
- Edelman Trust Barometer -- trust measurement in organizational communication
- Gallup Q12 -- engagement measurement framework with communication indicators
- Institute of Internal Communication (IoIC) -- internal communication measurement best practices
- VSC OR Knowledge Base v2.0 (`docs/architecture/_legacy/knowledge-base.md`)
- VSC Multi-Agent Architecture v2 (`docs/architecture/_legacy/multi-agent-architecture.md`)

### Cultural Context
- Hofstede Cultural Dimensions -- Latin American communication norms
- AIPC (Asociacion Iberoamericana de Comunicacion Interna) -- regional measurement practices
- Social desirability bias considerations in survey design for hierarchical organizational cultures

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-02-25 | VSC IT/OT Agent | Initial version. Complete communication effectiveness tracking with reach, engagement, comprehension, and sentiment KPIs, pulse survey templates, channel performance analysis, and feedback loop integration. |
