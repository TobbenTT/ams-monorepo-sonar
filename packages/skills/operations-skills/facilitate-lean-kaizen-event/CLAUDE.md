---
name: facilitate-lean-kaizen-event
description: "Facilitate structured 3-5 day Lean/Kaizen workshops for waste identification, process mapping, and A3 problem solving in OR projects. Triggers: 'kaizen event', 'lean workshop', 'evento kaizen'."
---

# Facilitate Lean Kaizen Event

## Skill ID: facilitate-lean-kaizen-event
## Version: 1.0.0
## Category: D - Planning
## Priority: Medium

---

## Purpose

Facilitate structured 3-5 day Lean/Kaizen workshops (also known as Kaizen Blitzes or Rapid Improvement Events) that bring cross-functional teams together to identify waste, map processes, solve specific problems, and implement tangible improvements within the workshop timeframe. This skill provides the complete methodology, facilitation framework, and documentation structure to ensure that Kaizen events deliver measurable results and sustainable improvements rather than generating enthusiasm without lasting change.

Kaizen -- the Japanese philosophy of continuous incremental improvement -- when applied as a structured workshop event, is one of the most powerful tools available to Operational Readiness teams. During the transition from project construction to sustained operations, organizations face hundreds of process inefficiencies, handoff gaps, and operational bottlenecks that cannot be solved by individual effort alone. Kaizen events concentrate cross-functional expertise, management attention, and dedicated time on a single problem area, producing improvements in days that would otherwise take months through conventional improvement channels.

Industry evidence strongly supports the effectiveness of structured Kaizen events. The Lean Enterprise Institute reports that well-facilitated Kaizen events achieve 30-50% improvement in targeted metrics (cycle time, defect rate, changeover time, space utilization) within the event week, with 60-80% of improvements sustained at 12-month follow-up when proper follow-through mechanisms are in place. The Toyota Production System, widely regarded as the gold standard for operational excellence, relies on Kaizen events as a primary vehicle for engaging frontline workers in problem solving and building a culture of continuous improvement.

For Operational Readiness specifically, Kaizen events serve multiple strategic purposes:

1. **Process Design Optimization**: During the OR phase, operating procedures and maintenance processes are being designed for the first time. Kaizen events allow future operators to participate in designing their own processes, resulting in more practical, efficient procedures with higher adoption rates.

2. **Commissioning Problem Solving**: When commissioning reveals equipment or process issues, a focused Kaizen event can rapidly identify root causes and implement countermeasures, preventing weeks of unfocused troubleshooting.

3. **Ramp-Up Acceleration**: During production ramp-up, Kaizen events target the bottlenecks that limit throughput increase, systematically eliminating constraints to reach nameplate capacity faster.

4. **Culture Building**: Kaizen events introduce the continuous improvement mindset to newly recruited operations teams, establishing the cultural foundation for long-term operational excellence.

This skill integrates with run-continuous-improvement-cycle for PDCA follow-through, calculate-operational-kpis for metrics tracking, track-oee-metrics for manufacturing efficiency improvement, create-operations-manual for procedure updates, and the OR Orchestrator for improvement initiative coordination.

---

## Intent & Specification

The AI agent MUST understand and execute the following core objectives:

1. **Event Scoping & Charter**: Define a clear, focused event charter that specifies:
   - The specific problem or process to be improved (narrow scope, not "improve everything")
   - Measurable current-state baseline (quantified, not anecdotal)
   - Measurable improvement target (SMART: Specific, Measurable, Achievable, Relevant, Time-bound)
   - Event boundaries: what is in-scope, what is out-of-scope
   - Success criteria: how will we know the event succeeded?

2. **Team Selection & Preparation**: Assemble the right team:
   - 6-10 participants maximum (larger teams lose focus)
   - Cross-functional: include people who do the work, support the work, and manage the work
   - Include at least one person with no familiarity with the process (fresh eyes perspective)
   - Mandatory: process owner, frontline worker(s), maintenance representative, engineering support
   - Optional: supplier representative, customer representative, safety representative
   - All participants must be 100% dedicated for the full event duration (no partial attendance)

3. **Lean Tool Application**: Apply appropriate Lean tools based on the problem type:
   - **Value Stream Mapping (VSM)**: For end-to-end process optimization
   - **5S**: For workplace organization and standardization
   - **SMED**: For setup/changeover time reduction
   - **Standard Work**: For process standardization and variation reduction
   - **Root Cause Analysis (5-Why, Fishbone)**: For problem solving
   - **A3 Problem Solving**: For structured problem documentation and communication
   - **Spaghetti Diagram**: For material and people flow optimization
   - **Takt Time Analysis**: For production balancing

4. **Daily Structure & Facilitation**: Follow the proven 5-day Kaizen event structure:
   - **Day 1**: Training, current state observation, data collection, waste identification
   - **Day 2**: Current state analysis, root cause identification, future state design
   - **Day 3**: Solution development, implementation planning, begin implementation
   - **Day 4**: Continue implementation, testing, adjustment, measurement
   - **Day 5**: Final measurement, standardization, sustainment plan, management presentation

5. **Waste Identification (8 Wastes)**: Systematically identify and quantify the 8 forms of waste (TIMWOODS):
   - **T**ransportation: unnecessary movement of materials
   - **I**nventory: excess materials, WIP, or finished goods
   - **M**otion: unnecessary movement of people
   - **W**aiting: idle time waiting for next step, information, or approval
   - **O**verproduction: producing more than needed or before needed
   - **O**ver-processing: doing more work than the customer requires
   - **D**efects: errors requiring rework, scrap, or correction
   - **S**kills (underutilized talent): not leveraging people's knowledge and capabilities

6. **Implementation Within the Event**: The distinguishing feature of Kaizen events is that improvements are implemented during the event, not just planned. At least 60-80% of identified improvements must be implemented by Day 5. Remaining items enter a 30-day action plan with assigned owners and deadlines.

7. **Sustainment & Follow-Through**: Ensure improvements last beyond the event:
   - Update standard operating procedures to reflect new methods
   - Create visual management boards at the point of work
   - Train all affected personnel (not just event participants)
   - Establish audit schedule: weekly for first month, monthly for next 3 months
   - Schedule 30-day and 90-day follow-up reviews
   - Feed results into run-continuous-improvement-cycle for ongoing PDCA tracking

---

## Trigger / Invocation

```
/facilitate-lean-kaizen-event
```

**Aliases**: `/kaizen-event`, `/lean-workshop`, `/rapid-improvement`, `/evento-kaizen`, `/mejora-rapida`

**Primary Trigger Commands:**
- `facilitate-lean-kaizen-event plan --topic [problem-area] --date [start-date]`
- `facilitate-lean-kaizen-event charter --topic [problem-area]`
- `facilitate-lean-kaizen-event team --event [event-ID]`
- `facilitate-lean-kaizen-event day-plan --event [event-ID] --day [1-5]`
- `facilitate-lean-kaizen-event a3-report --event [event-ID]`
- `facilitate-lean-kaizen-event action-tracker --event [event-ID]`
- `facilitate-lean-kaizen-event followup --event [event-ID] --period [30day|90day]`
- `facilitate-lean-kaizen-event dashboard --project [name]`

**Automatic Triggers:**
- When calculate-operational-kpis identifies metric below target for 4 consecutive weeks: Suggest Kaizen event
- When commissioning reveals recurring equipment/process issue: Suggest Kaizen event
- When ramp-up trajectory falls below plan by >10%: Suggest Kaizen event
- T-14 days before planned event: Generate preparation checklist
- Event Day 1-5: Generate daily agenda and facilitation guide
- T+30 days after event: Trigger 30-day follow-up review
- T+90 days after event: Trigger 90-day sustainment audit

**Event-Driven Triggers:**
- Operations manager requests focused improvement on specific area
- Safety incident reveals process weakness requiring rapid improvement
- Customer complaint or quality issue requires immediate process improvement
- Commissioning team encounters persistent startup problem
- Benchmarking reveals significant performance gap vs. industry best practice
- New equipment or system requires process design workshop

---

## Input Requirements

### Required Inputs

| Input | Source | Required | Description |
|-------|--------|----------|-------------|
| Event Charter / Problem Statement | Event sponsor / operations management | Yes | Clear definition of what problem the event will address |
| Current State Data | calculate-operational-kpis / process measurement | Yes | Baseline metrics quantifying current performance (cycle time, defect rate, OEE, etc.) |
| Process Documentation | create-operations-manual / SOPs | Yes | Current process steps, procedures, and work instructions for the target area |
| Team Member List | Operations management / HR | Yes | Selected participants with roles, availability confirmation |
| Management Sponsor | Operations Director / Plant Manager | Yes | Senior leader committed to removing barriers and approving changes during event |

### Recommended Inputs

| Input | Source | Description |
|-------|--------|-------------|
| Historical Improvement Data | run-continuous-improvement-cycle | Previous improvement attempts on this topic and their outcomes |
| Equipment Performance Data | track-oee-metrics | OEE, availability, and downtime data for equipment in target area |
| Maintenance History | mcp-erp (SAP PM) | Work order history, failure data, downtime records for target equipment |
| Layout Drawings | Engineering / facilities | Floor plans for spaghetti diagram and layout optimization |
| Customer Requirements | Operations planning | Takt time, quality specifications, delivery requirements |

### Optional Inputs

| Input | Source | Description | Default if Absent |
|-------|--------|-------------|-------------------|
| Lean Maturity Assessment | assess-am-maturity | Organization's current Lean maturity level for calibrating approach | Basic Lean training included in Day 1 |
| Benchmarking Data | analyze-benchmark | Industry best-practice performance levels for target metrics | Published industry benchmarks used |
| Cost Data | agent-finance | Labor rates, material costs, downtime costs for improvement NPV | Estimates used for business case |
| Previous Kaizen Reports | Project archives | Lessons learned from previous events at this site | Clean-slate approach |
| Video/Photo Documentation | Site team | Process observation videos for analysis during event | Live observation on Day 1 |

---

## Output Specification

### Primary Output: Kaizen Event Package (.xlsx + .docx)

**A3 Report (.docx)**
**Filename:** `{ProjectCode}_Kaizen_{EventID}_A3_Report_{date}.docx`

Single-page A3 format (ISO A3 paper size) containing all 8 sections:
1. **Background**: Why this problem matters, business context, strategic alignment
2. **Current Condition**: Quantified current state with data, process map, observations
3. **Goal/Target**: Specific measurable improvement target with timeline
4. **Root Cause Analysis**: 5-Why analysis, fishbone diagram, or Pareto analysis identifying true root causes
5. **Countermeasures**: Specific actions to address each root cause, with owner and deadline
6. **Implementation Plan**: Sequence of implementation steps with dates and responsibilities
7. **Check/Confirmation**: Before-and-after metrics showing improvement achieved
8. **Follow-Up Actions**: Remaining items for 30-day plan, sustainment activities, next PDCA cycle

**Event Tracker (.xlsx)**
**Filename:** `{ProjectCode}_Kaizen_{EventID}_Tracker_{date}.xlsx`

**Workbook Structure:**

#### Sheet 1: "Event Summary Dashboard"
- Event ID, topic, dates, team members, sponsor
- Target metric: baseline, target, actual achieved
- Improvements implemented during event: count
- Actions remaining for 30-day plan: count with owners
- Financial impact: estimated annual savings
- Event rating: team satisfaction and sponsor assessment

#### Sheet 2: "Waste Identification Register"
| Waste # | Type (TIMWOODS) | Location/Process Step | Description | Frequency | Duration/Impact | Quantified Cost | Root Cause | Countermeasure | Status |
|---------|----------------|---------------------|-------------|-----------|----------------|----------------|-----------|---------------|--------|

#### Sheet 3: "Current State vs Future State"
| Process Step | Current State Time | Current State Issues | Future State Design | Improvement Action | Time Saved | Waste Eliminated |
|-------------|-------------------|---------------------|--------------------|--------------------|-----------|-----------------|

#### Sheet 4: "Action Item Tracker"
| Action # | Description | Category | Owner | Start Date | Due Date | Status | Completed Date | Verification Method | Result |
|---------|-------------|---------|-------|-----------|---------|--------|---------------|-------------------|--------|

#### Sheet 5: "Before & After Metrics"
| Metric | Unit | Baseline (Pre-Event) | Target | Actual (End of Event) | % Improvement | Actual (30-Day) | Actual (90-Day) | Sustained? |
|--------|------|---------------------|--------|----------------------|--------------|----------------|----------------|----------|

#### Sheet 6: "Standard Work Documentation"
| Process Step | Old Method | New Method | Standard Time | Key Points | Safety Notes | Quality Checks | Visual Aid Ref |
|-------------|-----------|-----------|--------------|-----------|-------------|---------------|---------------|

#### Sheet 7: "Sustainment Plan"
| Activity | Frequency | Responsible | Start Date | End Date | Method | Status | Last Audit Date | Audit Result |
|---------|----------|------------|-----------|---------|--------|--------|----------------|-------------|

#### Sheet 8: "Lessons Learned"
| Category | What Worked Well | What Could Improve | Action for Next Event | Owner |
|----------|-----------------|-------------------|---------------------|-------|

### Secondary Output: Daily Event Reports (.docx)
**Filename:** `{ProjectCode}_Kaizen_{EventID}_Day{N}_{date}.docx`

Brief daily summary (1-2 pages):
1. Day's objectives and activities completed
2. Key findings and observations
3. Decisions made and actions taken
4. Roadblocks encountered and how resolved
5. Plan for next day
6. Photos of improvements implemented

### Management Presentation (.pptx outline)
**Filename:** `{ProjectCode}_Kaizen_{EventID}_Presentation_{date}.pptx`

Day 5 presentation structure (10-12 slides):
1. Event overview: scope, team, duration
2. Current state: process map, metrics, waste identified
3. Root cause analysis: key findings
4. Countermeasures implemented: before/after photos and data
5. Results achieved: metrics comparison
6. Remaining actions: 30-day plan
7. Sustainment plan: how improvements will be maintained
8. Recognition: team contributions and achievements

### Formatting Standards
- A3 report: landscape orientation, single A3 page, VSC branding
- Waste types color-coded: Transportation (blue), Inventory (orange), Motion (yellow), Waiting (red), Overproduction (purple), Over-processing (brown), Defects (dark red), Skills (green)
- Before/after comparisons: red (before) and green (after)
- Action status: Green (complete), Yellow (in progress), Red (overdue), Grey (not started)
- All metrics with units and decimal precision appropriate to measurement

---

## Procedure

### Phase 1: Event Preparation (Steps 1-4, completed 2-4 weeks before event)

**Step 1: Define Event Charter**
1. Meet with event sponsor (management) to clarify:
   - What problem needs to be solved? (specific, not general)
   - Why now? What is the business impact of the current state?
   - What area/process/equipment is the focus?
   - What metric defines success? (e.g., reduce changeover time by 50%)
2. Draft event charter:
   - Problem statement: clear, data-supported, customer-focused
   - Scope boundaries: what is in-scope and explicitly out-of-scope
   - Improvement target: SMART format with baseline and target values
   - Success criteria: how will we know the event succeeded?
   - Constraints: budget, regulatory, safety, equipment availability
3. Obtain sponsor sign-off on charter
4. Publish charter to team and stakeholders

**Step 2: Collect Baseline Data**
1. Identify the key metric(s) to be improved:
   - Cycle time, throughput, OEE, defect rate, changeover time, travel distance, inventory level
2. Collect current-state data over meaningful period (minimum 2-4 weeks):
   - Quantitative data: times, counts, distances, costs, frequencies
   - Qualitative data: observations, operator interviews, customer feedback
3. Calculate baseline:
   - Mean, median, standard deviation, range
   - Control chart: is the process in statistical control?
   - Pareto analysis: what are the top contributors to the problem?
4. Document baseline with supporting evidence (data tables, charts, photos)
5. Set improvement target based on:
   - Theoretical capability (what is physically possible?)
   - Benchmark performance (what do best-in-class achieve?)
   - Business need (what does the customer/schedule require?)
   - Kaizen event typical achievement (30-50% improvement)

**Step 3: Select and Prepare Team**
1. Select 6-10 participants:
   - Process owner: person accountable for the process (team leader or supervisor)
   - Frontline workers: 2-3 people who actually perform the work daily
   - Maintenance representative: for equipment-related improvements
   - Engineering/technical support: for design or specification changes
   - Fresh eyes: 1-2 people from outside the area (different department, shift, or discipline)
   - Facilitator: trained Lean facilitator (this AI skill provides facilitation guidance)
2. Confirm 100% dedication for full event duration (no meetings, no emails, no "just checking in")
3. Send pre-read materials to team:
   - Event charter
   - Brief Lean/Kaizen introduction (for those unfamiliar)
   - Current-state data summary
   - Logistics: location, schedule, dress code (shop-floor appropriate)
4. Brief management on their role: attend opening and closing, remove barriers, approve changes

**Step 4: Logistics Preparation**
1. Reserve dedicated team room (war room) for full event duration:
   - Whiteboard or butcher paper wall space
   - Projector/screen
   - Flip chart stands and markers
   - Sticky notes, tape, timers, cameras
2. Arrange access to the work area for process observation
3. Prepare materials:
   - Printed process maps (current state)
   - Baseline data sheets
   - Lean tool templates (VSM, 5-Why, fishbone, spaghetti diagram, standard work)
   - A3 report template (blank)
   - Action item tracker
4. Arrange safety PPE if event involves shop-floor observation
5. Coordinate with operations to ensure team can implement changes during the event (equipment access, material availability, maintenance support)
6. Plan team meals/refreshments (team stays together, builds cohesion)

### Phase 2: Event Execution (Steps 5-9, Days 1-5)

**Step 5: Day 1 -- Understand Current State**

Morning (4 hours):
1. **Opening (30 min)**: Sponsor kicks off, explains importance, commits to support. Facilitator reviews charter, sets ground rules (respect, no rank, all ideas welcome, stay focused).
2. **Lean Training (60 min)**: Brief training on relevant Lean concepts:
   - 8 wastes (TIMWOODS) with examples from their industry
   - Value vs. non-value-added activities
   - Tools to be used during the event (VSM, 5S, SMED, as appropriate)
3. **Go to Gemba (90 min)**: Entire team goes to the actual work area to observe:
   - Watch the process happen in real time (do not interfere)
   - Each team member records: what they see, what wastes they observe, questions they have
   - Take photos and videos (with permission) for later analysis
   - Time each process step with a stopwatch
   - Draw spaghetti diagrams of material and people movement

Afternoon (4 hours):
4. **Data Organization (90 min)**: Back in team room, organize observations:
   - Create current-state value stream map or process flow map
   - Compile time observations into data table
   - Identify and categorize wastes observed (TIMWOODS classification)
   - Quantify wastes where possible (time, distance, cost, frequency)
5. **Problem Articulation (60 min)**: Refine the problem statement based on actual observation:
   - Where exactly does the problem occur?
   - How often? How much variability?
   - What is the impact (time, cost, quality, safety)?
6. **Day 1 Wrap-up (30 min)**: Review what was learned, preview Day 2 plan
7. Facilitator documents Day 1 findings in daily report

**Step 6: Day 2 -- Analyze Root Causes and Design Future State**

Morning (4 hours):
1. **Review and Deepen Understanding (30 min)**: Review Day 1 observations, fill gaps
2. **Root Cause Analysis (120 min)**:
   - Select appropriate tool based on problem type:
     - **5-Why Analysis**: For single-cause problems -- ask "why" repeatedly until root cause is reached
     - **Fishbone (Ishikawa) Diagram**: For multi-factor problems -- categorize causes into Man, Machine, Method, Material, Measurement, Environment
     - **Pareto Analysis**: For prioritization -- identify the vital few causes driving the majority of the problem
   - For each identified root cause: verify with data (do not accept opinions as root causes)
   - Document root cause analysis on A3 report (Section 4)
3. **Future State Design (90 min)**:
   - For each root cause, brainstorm countermeasures:
     - Eliminate the waste entirely (preferred)
     - Reduce the waste
     - Combine or simplify steps
     - Rearrange sequence for better flow
   - Evaluate countermeasures: effectiveness, feasibility, cost, time to implement
   - Design future-state process map showing how the process should work after improvements

Afternoon (4 hours):
4. **Prioritize and Plan Implementation (120 min)**:
   - Categorize countermeasures:
     - **Just Do It** (implement during event, low effort, high impact): start tomorrow
     - **Quick Win** (implement during event, medium effort): schedule for Days 3-4
     - **30-Day Action** (requires resources/approvals beyond event): assign owner and deadline
     - **Future Project** (significant investment, longer timeline): document for management review
   - Create detailed implementation plan for event-week actions:
     - What exactly will be changed?
     - Who will do it?
     - What materials/tools/approvals are needed?
     - When during Days 3-4 will it happen?
5. **Prepare for Implementation (60 min)**:
   - Order materials, parts, or supplies needed for tomorrow's changes
   - Arrange maintenance support if equipment modifications needed
   - Confirm safety review of proposed changes (no change should create a new hazard)
   - Get management approval for changes that require authorization
6. **Day 2 Wrap-up (30 min)**: Review plan, confirm assignments, preview Day 3

**Step 7: Day 3 -- Begin Implementation**

Morning (4 hours):
1. **Safety Briefing (15 min)**: Review safety considerations for implementation activities
2. **Implement "Just Do It" Items (3.5 hours)**:
   - Split team into sub-groups if multiple changes can proceed in parallel
   - Implement changes on the shop floor:
     - Workplace reorganization (5S)
     - Process flow changes
     - Visual management installation
     - Tooling or fixture modifications
     - Procedure updates
   - Document before and after with photos
   - Test changes immediately where possible

Afternoon (4 hours):
3. **Continue Implementation (2 hours)**: Complete remaining implementable changes
4. **Initial Testing (90 min)**:
   - Run the process with the new methods
   - Time the new process steps
   - Observe for problems or unintended consequences
   - Collect initial results data
5. **Adjust and Refine (30 min)**:
   - Based on initial testing, refine countermeasures
   - Address problems that emerge during testing
   - Modify the future-state design if needed
6. **Day 3 Wrap-up (30 min)**: Review progress, identify remaining work for Day 4

**Step 8: Day 4 -- Complete Implementation and Measure**

Morning (4 hours):
1. **Complete Remaining Implementations (2 hours)**: Finish any changes not completed on Day 3
2. **Full Process Trial (2 hours)**:
   - Run the process through multiple complete cycles under new methods
   - All team members observe and note any issues
   - Collect comprehensive measurement data:
     - Cycle times for each step
     - Total process lead time
     - Distance traveled (new spaghetti diagram)
     - Quality metrics
     - Other target metrics per charter

Afternoon (4 hours):
3. **Data Analysis (90 min)**:
   - Compare new-method data against baseline
   - Calculate improvement achieved for each target metric
   - Statistical comparison: is the improvement real or within normal variation?
   - Identify any remaining gaps between achieved and target performance
4. **Standardize New Methods (90 min)**:
   - Write or update standard operating procedures for new process
   - Create standard work combination sheets showing new task sequence and times
   - Design visual management aids (visual SOPs, shadow boards, kanban, floor markings)
   - Identify training needs for workers not on the Kaizen team
5. **Day 4 Wrap-up (30 min)**: Review results, finalize 30-day action items, prepare for Day 5

**Step 9: Day 5 -- Sustainment Planning and Presentation**

Morning (4 hours):
1. **Finalize A3 Report (90 min)**:
   - Complete all 8 sections with final data
   - Include before-and-after photos
   - Document root causes and countermeasures clearly
   - Record results with metrics comparison
2. **Create Sustainment Plan (60 min)**:
   - Define audit schedule: who checks, how often, what they check
   - Create audit checklist specific to the improvements implemented
   - Assign sustainment owner (process owner, not facilitator)
   - Schedule 30-day follow-up review meeting
   - Schedule 90-day sustainment audit
3. **Prepare Management Presentation (60 min)**:
   - Create 10-12 slide presentation (see Output Specification)
   - Practice presentation with team (each member presents a section)
4. **Finalize 30-Day Action Plan (30 min)**:
   - List all remaining actions not completed during event
   - Assign owner, deadline, and verification method for each
   - Enter into action item tracker with tracking responsibility

Afternoon (2-3 hours):
5. **Management Presentation (60 min)**:
   - Team presents results to management sponsor and stakeholders
   - Show before-and-after metrics, photos, process maps
   - Present 30-day action plan and sustainment approach
   - Request management commitment to support sustainment
   - Q&A and discussion
6. **Team Recognition and Closing (30 min)**:
   - Sponsor acknowledges team effort and achievements
   - Team feedback: what worked well, what to improve for future events
   - Distribute certificates of participation
   - Celebrate!
7. **Facilitator post-event activities**:
   - Finalize all documentation (A3, tracker, photos)
   - Distribute final report to all stakeholders
   - Enter event data into run-continuous-improvement-cycle for tracking
   - Schedule 30-day and 90-day follow-up calendar entries

### Phase 3: Post-Event Follow-Through (Steps 10-12)

**Step 10: 30-Day Follow-Up**
1. Review all 30-day action items:
   - Status: completed, in-progress, overdue, blocked
   - Escalate blocked items to management sponsor
2. Measure sustained performance:
   - Collect same metrics as during event
   - Compare: is improvement sustained? Better? Degrading?
3. Conduct sustainment audit:
   - Are new procedures being followed?
   - Are visual management tools in place and current?
   - Were all affected workers trained?
4. Document findings and corrective actions if sustainment is slipping
5. Update A3 report with 30-day data

**Step 11: 90-Day Sustainment Audit**
1. Comprehensive sustainment review:
   - Metric performance: compare baseline, event-week, 30-day, 90-day
   - Are improvements fully embedded in daily operations?
   - Have any improvements been reversed or degraded? Why?
2. Calculate financial impact:
   - Annualized savings from improvements (labor, material, quality, throughput)
   - Compare against event cost (team time, materials, facilitator)
   - Calculate ROI of the Kaizen event
3. Identify next improvement opportunities:
   - Has the Kaizen exposed adjacent process issues?
   - Is there potential for a follow-up event on related topics?
4. Update organizational Kaizen database with final results
5. Feed results into calculate-operational-kpis for dashboard tracking

**Step 12: Knowledge Capture & Replication**
1. Document lessons learned from the event:
   - Facilitation lessons: what worked, what to change in future events
   - Technical lessons: improvement methods that could apply to other areas
   - Team dynamics: what made the team effective (or not)
2. Identify replication opportunities:
   - Can the same improvements be applied to similar processes elsewhere?
   - Are there other areas with the same waste types?
3. Update Kaizen event facilitation guide based on experience
4. Add event to organizational Kaizen database
5. Share results with broader organization (newsletter, town hall, best practice sharing)
6. Feed into run-continuous-improvement-cycle for ongoing PDCA tracking

---

## Quality Criteria

| Criterion | Metric | Target | Minimum Acceptable |
|-----------|--------|--------|-------------------|
| Charter Clarity | Problem statement quantified with baseline data | 100% | 100% |
| Team Dedication | Team members 100% present for full event | 100% | >90% |
| Implementation Rate | % of identified improvements implemented during event | >70% | >60% |
| Target Achievement | Improvement achieved vs. target metric | >80% of target | >50% of target |
| A3 Completeness | All 8 A3 sections completed with data | 100% | 100% |
| 30-Day Actions | 30-day action items completed on time | >90% | >80% |
| 30-Day Sustainment | Improvement sustained at 30 days | >90% of event result | >80% |
| 90-Day Sustainment | Improvement sustained at 90 days | >80% of event result | >60% |
| Procedure Updates | SOPs updated to reflect new methods | 100% | 100% |
| Training Completion | All affected workers trained on new methods | 100% | >90% |
| Team Satisfaction | Post-event team satisfaction rating | >4.0/5.0 | >3.5/5.0 |
| Documentation Quality | Event package complete and distributed within 5 days | 100% | >95% |

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents)

| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| `calculate-operational-kpis` | Performance data | Current KPI data identifying areas needing improvement for event scoping |
| `track-oee-metrics` | OEE data | Equipment effectiveness data for manufacturing-focused Kaizen events |
| `create-operations-manual` | Current SOPs | Existing procedures to be analyzed and improved during the event |
| `run-continuous-improvement-cycle` | PDCA context | Previous improvement attempts and ongoing cycles related to the target area |
| `model-staffing-requirements` | Team availability | Staffing information for team selection and scheduling |

### Downstream Dependencies (Outputs TO other agents)

| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| `run-continuous-improvement-cycle` | PDCA follow-through | Post-event 30/90-day actions feed into PDCA tracking for sustainment |
| `create-operations-manual` | Updated SOPs | New or revised procedures generated by the Kaizen event |
| `calculate-operational-kpis` | Improved metrics | Updated performance baselines after successful improvement |
| `track-oee-metrics` | OEE improvements | Equipment effectiveness gains from manufacturing Kaizen events |
| `orchestrate-or-program` | Improvement results | Event outcomes for OR program improvement tracking and reporting |

---

## References

### Methodology & Standards
- **Toyota Production System (TPS)** -- Foundation of Kaizen methodology and continuous improvement culture
- **Lean Enterprise Institute** -- Lean Thinking, Value Stream Mapping, and Kaizen facilitation best practices
- **The Toyota Way (Jeffrey Liker)** -- 14 management principles including Kaizen philosophy
- **Gemba Kaizen (Masaaki Imai)** -- Practical guide to continuous improvement at the workplace
- **A3 Problem Solving (John Shook)** -- Managing to Learn: A3 thinking methodology

### Industry Resources
- Lean Enterprise Institute -- Kaizen event facilitation guides and case studies
- Association for Manufacturing Excellence (AME) -- Kaizen best practices in manufacturing
- Society for Maintenance and Reliability Professionals (SMRP) -- Lean maintenance practices
- Shingo Institute -- Shingo Model for operational excellence
- VSC Corporate Pain Points Research Report -- Operational efficiency gaps

### Templates
- `templates/kaizen_event_charter.docx` -- Event charter and scoping template
- `templates/a3_problem_solving_report.docx` -- A3 report template (A3 landscape format)
- `templates/kaizen_action_tracker.xlsx` -- Action item tracking workbook
- `templates/waste_identification_worksheet.xlsx` -- TIMWOODS waste register template
- `templates/standard_work_combination_sheet.xlsx` -- Standard work documentation template
- `templates/kaizen_sustainment_audit.xlsx` -- 30/90-day sustainment audit checklist
- `templates/kaizen_management_presentation.pptx` -- Day 5 presentation template

---

## Changelog

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0.0 | 2025-02-25 | VSC AI Architect | Initial skill definition for Wave 1 deployment |
