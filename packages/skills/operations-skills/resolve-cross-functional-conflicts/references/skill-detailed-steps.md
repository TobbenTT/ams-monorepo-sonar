# Detailed Step-by-Step Execution - resolve-cross-functional-conflicts

*Full detailed execution steps extracted from SKILL.md.*
*Read this file when executing the skill for complete step-by-step instructions.*

---

## Step-by-Step Execution

### Phase 1: Conflict Detection & Registration (Steps 1-3)

**Step 1: Detect and Capture the Conflict**
1. Receive conflict signal from one of the detection channels:
   - **Automated scan**: Weekly cross-reference of all agent deliverables to detect contradictory assumptions, specifications, or requirements. Compare key parameters across domain outputs (e.g., equipment specifications in Engineering vs. standardization requirements in Maintenance vs. framework agreements in Procurement).
   - **Agent escalation**: An agent reports via Inbox that it cannot proceed because of a conflicting requirement from another agent. Parse the escalation to identify the specific conflicting elements.
   - **Dependency deadlock**: The orchestrator detects a circular dependency chain where Domain A waits for Domain B, which waits for Domain C, which waits for Domain A. Identify the minimum set of decisions needed to break the deadlock.
   - **Stakeholder report**: A human stakeholder raises a concern about conflicting directions. Capture the concern in structured format.
   - **Deliverable review finding**: During quality validation of a deliverable, a conflict with another domain's output is identified.
2. Validate that this is a genuine cross-functional conflict (not an internal domain issue):
   - Involves two or more distinct OR domains or departments
   - Cannot be resolved by a single domain acting alone
   - Has measurable impact on project deliverables, schedule, or cost
3. Check conflict register for duplicates or related existing conflicts
4. If new: assign Conflict ID (CF-{ProjectCode}-{Year}-{Sequence})

**Step 2: Classify and Prioritize the Conflict**
1. Determine conflict type: Technical, Commercial, Resource, Timeline, Regulatory, or Strategic
2. Assess severity using the severity matrix:
   - Count deliverables currently blocked or at risk
   - Estimate schedule impact in days (query mcp-project-online for critical path analysis)
   - Estimate cost impact (query mcp-erp for budget implications)
   - Assess safety relevance (any safety-related deliverable affected?)
3. Set resolution SLA based on severity level
4. Identify decision authority from RACI matrix:
   - Working-level resolution (domain leads) for Medium/Low
   - Management resolution (OR Manager) for High
   - Executive resolution (Project Director / VP) for Critical
5. Assign conflict to the appropriate resolution track

**Step 3: Register and Notify**
1. Create conflict record in the Conflict Register (project-database or SharePoint)
2. Notify all affected domain agents of the conflict registration via Inbox
3. Notify the identified decision authority via mcp-outlook
4. Post conflict notification in the OR program channel via mcp-teams
5. Update the OR Dashboard with the new conflict (mcp-powerbi integration)
6. Block affected deliverables in the tracking system with conflict reference
7. Set calendar reminders for SLA milestones (50% of SLA, 75% of SLA, SLA deadline)

### Phase 2: Multi-Perspective Analysis (Steps 4-7)

**Step 4: Gather Each Party's Full Position**
1. Request structured position statements from each affected agent/domain:
   - What is your specific requirement or recommendation?
   - What is the technical/business rationale?
   - What evidence supports your position? (data, standards, analysis, experience)
   - What are your constraints? (non-negotiable requirements, regulatory mandates, contractual obligations)
   - What is the consequence if your position is not adopted?
   - What flexibility exists in your position? (areas of potential compromise)
2. Query relevant MCP sources for supporting data:
   - mcp-cmms: Equipment data, failure history, maintenance requirements
   - mcp-erp: Cost data, procurement status, budget allocations
   - mcp-sharepoint: Standards, specifications, prior decisions, corporate policies
3. Review historical precedents from the knowledge base:
   - Similar conflicts in past projects
   - Resolutions adopted and their outcomes
   - Lessons learned applicable to this conflict
4. Identify hidden stakeholders: parties not directly involved but affected by the outcome

**Step 5: Perform Root Cause Analysis**
1. Apply the "Five Whys" technique to understand why the conflict exists:
   - Is it a genuine trade-off (mutually exclusive options)?
   - Is it an information asymmetry (one party lacks data the other has)?
   - Is it a timing issue (decisions made in wrong sequence)?
   - Is it a scope ambiguity (unclear boundaries of responsibility)?
   - Is it a priority misalignment (different optimization objectives)?
2. Map the conflict to the project WBS to understand structural causes:
   - Were dependencies correctly identified in planning?
   - Were interfaces between domains adequately defined?
   - Were decision points scheduled in the right sequence?
3. Determine if the conflict is a symptom of a systemic issue:
   - Pattern analysis: has this type of conflict occurred before?
   - Process gap: is there a missing coordination mechanism?
   - Governance gap: is there unclear decision authority?
4. Document root cause findings for the analysis report

**Step 6: Quantify Multi-Dimensional Impacts**
1. **Cost Impact Analysis:**
   - CAPEX impact of each party's position (equipment, construction, installation)
   - OPEX impact over asset lifecycle (maintenance cost, energy, consumables, labor)
   - Total lifecycle cost comparison using NPV at project discount rate
   - Opportunity cost of delay while conflict remains unresolved
   - Rework cost if wrong decision is made and must be reversed later
2. **Schedule Impact Analysis:**
   - Map each position's timeline requirements against the project master schedule
   - Identify critical path impacts using mcp-project-online data
   - Quantify float consumption for each option
   - Assess impact on gate review dates and commissioning milestones
   - Calculate cost of delay per day for schedule-sensitive decisions
3. **Safety and Environmental Impact:**
   - Compare safety risk profiles of each position
   - Assess regulatory compliance implications
   - Evaluate process safety impacts (HAZOP, LOPA considerations)
   - Determine environmental permit implications
4. **Operational Performance Impact:**
   - Model production throughput under each position
   - Compare availability and reliability projections
   - Assess maintainability and operability differences
   - Evaluate flexibility and future expansion implications
5. **Risk Profile Comparison:**
   - Identify risks specific to each position
   - Score using the project risk matrix (Probability x Consequence)
   - Aggregate into composite risk scores for comparison
   - Identify risks that are unique to specific options vs. common to all

**Step 7: Identify Interests Behind Positions**
1. Distinguish between stated positions and underlying interests:
   - Position: "We need Metso crushers everywhere" (Maintenance)
   - Interest: "We need to minimize spare parts complexity and training burden"
   - Position: "We need best-of-breed selection" (Engineering)
   - Interest: "We need to optimize circuit performance for each duty"
2. Map areas of interest overlap (shared interests across parties)
3. Identify potential integrative solutions that satisfy multiple interests:
   - Can standardization be achieved within a single vendor's product range?
   - Can performance optimization be achieved with a reduced vendor set?
   - Are there technical solutions that bridge the gap?
4. Document the interest map for use in option generation

### Phase 3: Option Generation & Evaluation (Steps 8-10)

**Step 8: Generate Resolution Options**
1. Generate a comprehensive set of options (minimum 4, typically 5-7):
   - **Option A**: Adopt Party 1's position fully
   - **Option B**: Adopt Party 2's position fully
   - **Option C**: Adopt Party 3's position fully (if applicable)
   - **Option D**: Compromise solution (split the difference)
   - **Option E**: Integrative solution (creative alternative that addresses all interests)
   - **Option F**: Phased approach (adopt one position now, transition to another later)
   - **Option G**: Deferred decision (gather more information before deciding)
2. For each option, define:
   - Detailed description of what would be implemented
   - Requirements for implementation (resources, timeline, approvals)
   - Impact on each affected deliverable
   - Estimated cost (CAPEX + OPEX lifecycle)
   - Estimated schedule impact
   - Risk profile
   - Stakeholder acceptance likelihood
3. Validate feasibility of each option:
   - Technical feasibility (can it actually be done?)
   - Commercial feasibility (are the terms available?)
   - Schedule feasibility (can it be done in time?)
   - Regulatory feasibility (does it comply with all requirements?)

**Step 9: Evaluate Options Using Weighted Decision Matrix**
1. Define evaluation criteria (standard set, adjusted per conflict type):
   - Safety impact (weight: 25% for safety-relevant; 10% otherwise)
   - Lifecycle cost / NPV (weight: 20-25%)
   - Schedule impact (weight: 15-20%)
   - Operational performance (weight: 15-20%)
   - Implementation risk (weight: 10-15%)
   - Stakeholder alignment (weight: 5-10%)
   - Strategic alignment (weight: 5-10%)
2. Score each option against each criterion (1-5 scale):
   - 5: Significantly positive impact
   - 4: Moderately positive impact
   - 3: Neutral
   - 2: Moderately negative impact
   - 1: Significantly negative impact
3. Calculate weighted scores and rank options
4. Perform sensitivity analysis:
   - Vary criteria weights +/- 20% to test robustness of ranking
   - Test key assumptions (e.g., discount rate, failure rates, production volumes)
   - Identify conditions under which the ranking would change
5. Document the analysis transparently so decision-makers can validate

**Step 10: Formulate Recommendation**
1. Select the highest-ranked option as the primary recommendation
2. If the top two options are within 5% of each other, present both as viable
3. Draft the recommendation with:
   - Clear statement of recommended option
   - Key rationale (top 3 reasons)
   - Expected outcomes (cost, schedule, risk, performance)
   - Implementation requirements and timeline
   - Residual risks and mitigation measures
   - Conditions or monitoring requirements
   - Fallback position if recommended option encounters problems
4. Prepare dissenting position summaries (for any party whose position was not adopted)
5. Identify stakeholder communication requirements for the recommendation

### Phase 4: Decision & Resolution (Steps 11-13)

**Step 11: Generate Decision Brief**
1. Produce the Conflict Analysis Report (.docx) with full detail
2. Produce the Decision Brief (.pptx) for the appropriate audience:
   - Executive level: 5-8 slides, focus on impact and recommendation
   - Management level: 8-12 slides, include options analysis detail
   - Working level: Full report with all supporting data
3. Distribute pre-read materials via mcp-outlook:
   - Decision authority receives full package 48 hours before decision meeting
   - All affected parties receive the Decision Brief 24 hours before
4. Schedule decision meeting via mcp-teams:
   - Include all affected domain representatives
   - Include decision authority
   - Include neutral facilitator (OR Orchestrator / PMO)
5. Post decision meeting agenda in OR program channel

**Step 12: Facilitate Decision**
1. Support the decision meeting:
   - Present conflict summary and analysis
   - Facilitate discussion of each party's perspective
   - Present options analysis and recommendation
   - Answer questions using the detailed analysis data
   - Record the decision, rationale, and any conditions
2. If consensus reached: document the agreed resolution
3. If no consensus: apply the escalation protocol:
   - Summarize areas of agreement and disagreement
   - Identify the specific points requiring arbitration
   - Escalate to the next level of decision authority per RACI
   - Provide the full analysis package to the escalation authority
4. Record the decision formally:
   - Decision statement (what was decided)
   - Decision rationale (why this option was selected)
   - Decision authority (who made the decision)
   - Conditions (any requirements attached to the decision)
   - Dissenting views (documented for the record)
   - Effective date (when the decision takes effect)

**Step 13: Communicate and Close**
1. Issue formal decision notification to all affected parties via mcp-outlook
2. Update the Conflict Register with resolution details
3. Post decision summary in OR program channel via mcp-teams
4. Update the OR Dashboard to reflect conflict resolution
5. Remove deliverable blocks in the tracking system
6. Assign implementation actions from the decision:
   - Which agents need to update their deliverables?
   - What timeline for incorporating the decision?
   - Who monitors compliance with the decision?
7. Update the Risk Register:
   - Close risks that are resolved by the decision
   - Add new residual risks from the resolution
   - Update risk scores for affected items

### Phase 5: Implementation Monitoring & Learning (Steps 14-16)

**Step 14: Monitor Decision Implementation**
1. Track that all affected deliverables are updated per the decision:
   - Set implementation milestone dates
   - Monitor agent deliverable updates via Airtable
   - Flag non-compliance (deliverable not updated by deadline)
2. Verify that the decision is consistently applied:
   - Cross-check downstream deliverables for alignment
   - Ensure no "workarounds" that circumvent the decision
3. Monitor for unintended consequences:
   - New conflicts triggered by the resolution
   - Unexpected cost or schedule impacts
   - Stakeholder dissatisfaction requiring attention

**Step 15: Verify Resolution Effectiveness**
1. At the next gate review, assess whether the resolution achieved its intended outcome:
   - Were the projected cost savings/impacts realized?
   - Was the schedule impact as predicted?
   - Are affected stakeholders aligned with the outcome?
   - Did the resolution create any new problems?
2. If the resolution is not working as intended:
   - Re-open the conflict with new information
   - Apply the same analysis process with updated data
   - Escalate if the original decision authority needs to reconsider
3. Document the resolution outcome in the conflict record

**Step 16: Capture Lessons Learned**
1. For every resolved conflict, capture:
   - What caused the conflict? (root cause)
   - How could it have been prevented? (process improvement)
   - What worked well in the resolution? (best practice)
   - What should be done differently? (improvement opportunity)
   - Is there a process change that would prevent recurrence?
2. Update the knowledge base with conflict resolution patterns:
   - By conflict type (technical, commercial, resource, etc.)
   - By industry sector (mining, O&G, power, etc.)
   - By project phase (FEED, detailed engineering, construction, etc.)
3. Feed lessons into the OR program planning process:
   - Improve WBS dependency identification
   - Improve interface definition between domains
   - Improve decision sequencing in the OR timeline
4. Generate periodic conflict trend analysis:
   - Total conflicts by type, severity, and domain
   - Average resolution time vs. SLA
   - Escalation rate and effectiveness
   - Repeat conflict patterns indicating systemic issues

---
