# Detailed Step-by-Step Execution - embed-risk-based-decisions

*Full detailed execution steps extracted from SKILL.md.*
*Read this file when executing the skill for complete step-by-step instructions.*

---

## Step-by-Step Execution

### Phase 1: Foundation -- Risk Appetite & Framework Design (Steps 1-4)

**Step 1: Assess Current Risk Management Practices**
1. Review existing corporate risk management framework (ERM):
   - Does a corporate risk matrix exist? What scale? What consequence categories?
   - Are there documented risk appetite or tolerance statements?
   - How are risks currently reported and governed?
   - What risk assessment tools/methods are currently used?
2. Review current asset management risk practices:
   - How are maintenance priorities set? (risk-based or other?)
   - How are capital investments prioritized? (risk-ranked or budget-driven?)
   - How are operational decisions made? (risk-informed or experience-based?)
   - What risk registers exist for asset management?
3. Identify gaps between current practice and ISO 55001 requirements:
   - Clause 6.1: Risks and opportunities identified and addressed?
   - Clause 8.1: Criteria for evaluating and controlling risk established?
4. Document the current state as the baseline for improvement

**Step 2: Define Risk Appetite for Asset Management**
1. Facilitate risk appetite workshop with senior leadership:
   - Present the concept of risk appetite with industry examples
   - Discuss each consequence category individually:
     - Safety: What level of safety risk is acceptable? (reference ALARP framework)
     - Environmental: What environmental risk is tolerable?
     - Financial: What single-event financial loss can the organization absorb?
     - Operational: What level of service disruption is acceptable?
     - Reputation/Regulatory: What compliance risk is tolerable?
   - For each category, establish:
     - Upper tolerance boundary (above which risk is intolerable regardless of cost)
     - Lower tolerance boundary (below which risk is broadly acceptable)
     - ALARP zone (where risk must be reduced unless cost is grossly disproportionate)
2. Quantify risk appetite thresholds:
   - Safety: "No individual risk of fatality >1 in 10,000 per year; no societal risk >10 fatalities in any scenario"
   - Financial: "Maximum tolerable single-event loss: $10M; maximum annual aggregate loss: $25M"
   - Operational: "Maximum tolerable unplanned outage: 72 hours for critical systems; 168 hours for non-critical"
3. Document the risk appetite statement formally
4. Obtain CEO/GM signature on the risk appetite statement
5. Communicate risk appetite to all asset management decision-makers

**Step 3: Design the Risk Assessment Framework**
1. Define consequence scales (5 levels, quantified):
   - Align with or adapt the corporate risk matrix if one exists
   - Ensure consequence scales are calibrated to the organization's context:
     - A mining company with $1B revenue has different financial thresholds than a water utility with $100M revenue
     - A company in a high-regulation environment may weight regulatory consequences higher
   - Provide specific, unambiguous definitions for each level (no room for interpretation)
   - Include examples for each level from the organization's industry
2. Define probability/likelihood scale (5 levels, quantified):
   - Level 1: Rare (<1 in 100 years)
   - Level 2: Unlikely (1 in 10-100 years)
   - Level 3: Possible (1 in 1-10 years)
   - Level 4: Likely (1-10 per year)
   - Level 5: Almost Certain (>10 per year)
3. Build the 5x5 risk matrix:
   - Map consequence x probability to risk levels (Extreme, High, Medium, Low)
   - Define required response for each risk level
   - Define approval authority for risk acceptance at each level
4. Design the risk assessment process:
   - Level 1 (Screening): Qualitative 5-minute assessment for low-value routine decisions
   - Level 2 (Standard): Semi-quantitative assessment using the risk matrix for medium decisions
   - Level 3 (Detailed): Full quantitative analysis (bow-tie, Monte Carlo) for high-value/high-risk decisions
5. Document the complete framework

**Step 4: Build Consequence Models**
1. Develop financial consequence models for each major asset class:
   - **Direct repair cost model**: Typical repair cost by failure mode and severity
   - **Production loss model**: Revenue loss per hour of downtime by system (from production data)
   - **Secondary damage model**: Probability and cost of cascade failures
   - **Environmental cost model**: Remediation costs by type and scale of release
   - **Regulatory penalty model**: Fine structures by violation type and jurisdiction
2. Develop safety consequence models:
   - Identify personnel exposure patterns (who is near which assets, how often)
   - Map potential injury/fatality scenarios by asset class and failure mode
   - Quantify safety consequence using established frameworks (API, HSE)
3. Validate models against historical data:
   - Compare model predictions to actual failure consequences from history
   - Calibrate where predictions differ significantly from actuals
4. Package models into the Risk Assessment Toolkit spreadsheet

### Phase 2: Decision Tree Development (Steps 5-7)

**Step 5: Develop Capital Investment Decision Tree**
1. Map the capital investment decision process:
   - Who identifies capital needs?
   - What information is gathered?
   - How are investments evaluated?
   - Who approves at each investment level?
   - How are investments prioritized against budget?
2. Embed risk assessment at each decision point:
   - Trigger: Is this investment driven by risk (safety/environmental/regulatory) or value (performance/cost)?
   - Risk-driven: Apply ALARP test -- is current risk intolerable?
   - Value-driven: Apply risk-adjusted NPV -- does investment create value after adjusting for risk?
   - Ranking: Score all investments on risk-weighted value criteria
3. Create the decision tree flowchart with clear branching logic
4. Define documentation requirements at each decision point
5. Validate with capital planning stakeholders

**Step 6: Develop Maintenance Strategy Decision Tree**
1. Integrate with RCM decision logic (SAE JA1011):
   - RCM already uses a risk-based approach but may not use quantified risk
   - Enhance with quantified consequence data from consequence models
   - Ensure risk appetite thresholds are respected in task selection
2. Add risk-based scheduling optimization:
   - For PM tasks: Is the interval risk-optimized? (too frequent = wasted cost; too infrequent = excessive risk)
   - For CBM tasks: Are alert/alarm thresholds calibrated to risk appetite?
   - For inspections: Is the inspection interval risk-based per API 580/581?
3. Create maintenance decision tree connecting:
   - Failure mode identification -> consequence assessment -> task selection -> interval optimization
4. Define documentation requirements for audit trail

**Step 7: Develop Operations and Renewal Decision Trees**
1. **Operations Decision Tree:**
   - Start/stop criteria based on equipment condition and risk level
   - Load management decisions based on risk of overloading
   - Degraded-mode operation criteria (what risk level triggers shutdown?)
   - Emergency response decision criteria
2. **Renewal/Replacement Decision Tree:**
   - When to repair vs. replace (risk-weighted lifecycle cost comparison)
   - When to refurbish vs. replace with new technology
   - End-of-life criteria (condition-based, risk-based, economic)
   - Technology upgrade trigger criteria
3. Create flowcharts for each decision tree
4. Include worked examples for each

### Phase 3: Integration & Implementation (Steps 8-12)

**Step 8: Build the Risk Register**
1. Design the risk register structure:
   - Risk ID, description, asset/system, consequence category, probability, consequence, risk level
   - Existing controls, control effectiveness
   - Residual risk after controls
   - Treatment plan (if risk not in acceptable zone)
   - Treatment owner, timeline, status
   - Review date
2. Populate initial risk register:
   - Critical assets: full risk assessment using the framework
   - High-importance assets: screening assessment
   - General assets: aggregate risk assessment by asset class
3. Connect risk register to investment planning:
   - Each risk treatment with cost >$X becomes a candidate for capital or maintenance budget
   - Risk-ranked treatment list feeds into annual budget planning
4. Store in mcp-sharepoint with version control; make accessible via mcp-excel

**Step 9: Develop Risk-Weighted Investment Prioritization Model**
1. Design the prioritization scoring model:
   - Risk reduction score: How much does this investment reduce risk? (delta risk score)
   - Value creation score: What NPV does this investment generate?
   - Urgency score: What happens if deferred? (risk of escalation)
   - Strategic alignment score: How well does this support SAMP objectives?
   - Implementation readiness score: How ready is the organization to execute?
2. Weight the scoring criteria (example):
   - Risk reduction: 30%
   - Value creation: 25%
   - Urgency: 20%
   - Strategic alignment: 15%
   - Implementation readiness: 10%
3. Apply the model to the current capital program:
   - Score all capital candidates
   - Rank by weighted score
   - Apply budget constraint to determine funded vs. deferred projects
   - Identify the "efficient frontier" (maximum risk reduction per dollar invested)
4. Package as an Excel-based tool for annual budget cycle use

**Step 10: Integrate Risk Framework with CMMS and Planning Systems**
1. Configure CMMS risk fields:
   - Add risk ranking fields to equipment master data
   - Link work order priority to asset risk level
   - Enable risk-based sorting of maintenance backlog
2. Configure planning system integration:
   - Risk scores visible in capital planning tools
   - Investment prioritization model linked to budget approval workflow
3. Establish risk-based maintenance scheduling rules:
   - High-risk equipment: PM compliance target 100%; no deferral without risk assessment
   - Medium-risk equipment: PM compliance target 95%; deferral with documented justification
   - Low-risk equipment: PM compliance target 90%; deferral acceptable with monitoring

**Step 11: Develop Training Program**
1. Create the Risk-Based Decision Training Package:
   - Module 1: Why risk-based decisions (2 hours) -- business case, industry examples, regulatory
   - Module 2: Risk assessment fundamentals (3 hours) -- framework, scales, matrix, assessment
   - Module 3: Decision trees (2 hours) -- capital, maintenance, operations, renewal
   - Module 4: Consequence modeling (2 hours) -- how to quantify consequences
   - Module 5: Practical exercises (3 hours) -- case studies from the organization's asset base
2. Identify training audience:
   - Senior management: Module 1 + risk appetite overview (4 hours)
   - Asset management professionals: All modules (12 hours)
   - Front-line supervisors: Modules 1-3 (7 hours)
   - Operators/maintainers: Module 1 + quick reference guide (3 hours)
3. Create quick reference materials:
   - Laminated pocket risk matrix card
   - Decision tree quick reference poster (A3)
   - Risk assessment worksheet (fill-in form)
4. Deliver training and track completion via mcp-lms

**Step 12: Establish Governance and Continuous Improvement**
1. Define risk review cadence:
   - Daily: Front-line risk awareness (toolbox talks, pre-task risk assessment)
   - Weekly: Maintenance planning risk review (backlog prioritization)
   - Monthly: Asset management risk review (risk register update, KPI review)
   - Quarterly: Management risk review (portfolio risk profile, investment plan alignment)
   - Annually: Risk appetite review and framework effectiveness assessment
2. Define risk reporting framework:
   - Monthly risk dashboard (top risks, trends, treatment status)
   - Quarterly management report (portfolio risk profile, investment effectiveness)
   - Annual board report (risk appetite compliance, major risk trends, strategic risks)
3. Establish improvement feedback loops:
   - After every significant failure: Was the risk assessed? Was the assessment accurate?
   - Annual framework review: Are consequence models calibrated? Are probability estimates accurate?
   - Industry benchmark: How does our risk management compare to peers?
4. Document the governance framework and obtain leadership endorsement

---
