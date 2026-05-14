# Detailed Step-by-Step Execution - forecast-program-completion

*Full detailed execution steps extracted from SKILL.md.*
*Read this file when executing the skill for complete step-by-step instructions.*

---

## Step-by-Step Execution

### Phase 1: Data Gathering & Validation (Steps 1-2)

**Step 1: Gather and Validate EVM Data**
1. Import current period BCWS (PV), BCWP (EV), ACWP (AC) data per WBS element
2. Validate data integrity:
   - Verify BCWP <= BAC for every WBS element (cannot earn more than budget)
   - Verify AC values reconcile with financial records (accounting cross-check)
   - Check for anomalous data (sudden jumps, negative values, zero values where progress exists)
   - Verify progress measurement methods are consistent (weighted milestones, units complete, level of effort, 0/100, 50/50)
3. Calculate performance indices for current period and cumulative:
   - CPI = EV / AC (both current period and cumulative)
   - SPI = EV / PV (both current period and cumulative)
   - CV = EV - AC (absolute and as % of EV)
   - SV = EV - PV (absolute and as % of PV)
   - TCPI = (BAC - EV) / (BAC - AC)
4. Identify anomalies requiring investigation:
   - CPI or SPI change > 10% from prior period
   - WBS elements with CPI < 0.80 or > 1.20
   - Progress claims without corresponding actual costs (or vice versa)
5. **Quality gate**: All data validated and anomalies explained before proceeding

**Step 2: Import Schedule and Risk Data**
1. Import current schedule with:
   - Activity-level progress (% complete, remaining duration)
   - Logic ties and constraints
   - Critical path identification
   - Total float per activity
2. Import risk register with:
   - Active risks affecting cost and/or schedule
   - Probability and impact ranges for Monte Carlo input
   - Risk response strategies (mitigated, accepted, avoided)
3. Import change log:
   - Approved changes since last forecast
   - Pending changes that may affect baseline
4. Validate schedule quality:
   - No open-ended activities (missing predecessor or successor)
   - No negative float without explanation
   - No artificial constraints on critical path
   - Progress is consistent with EVM data
5. **Quality gate**: Schedule and risk data aligned with EVM data

### Phase 2: EAC Calculation (Steps 3-4)

**Step 3: Calculate EAC (Multiple Methods)**
1. **EAC1 = BAC / CPI** (cost performance continues)
   - Assumption: current cumulative CPI is the best predictor of future cost performance
   - Most reliable when: project is >20% complete, no significant scope changes, CPI has stabilized
   - Limitation: does not account for schedule-driven costs
2. **EAC2 = AC + (BAC - EV) / (CPI x SPI)** (composite performance continues)
   - Assumption: both cost and schedule inefficiency will continue
   - Most reliable when: project is behind schedule AND over budget, time-dependent costs are significant (>30% of remaining budget)
   - This method typically produces the highest (most pessimistic) EAC
3. **EAC3 = AC + bottom-up ETC** (independent fresh estimate)
   - If independent ETC is available: use project team's detailed estimate of remaining work
   - If not available: use EAC1 as proxy with stated limitation
   - Most reliable when: significant scope changes have occurred, project conditions have changed fundamentally
4. **EAC4 = AC + (BAC - EV)** (original estimate for remaining work)
   - Assumption: past variances are anomalous; future work will be performed at original estimated rates
   - CAUTION: this is almost always overly optimistic
   - Useful only as a lower bound for the EAC range
5. **Present range analysis:**
   - Range: [min(EAC1, EAC2, EAC3, EAC4), max(EAC1, EAC2, EAC3, EAC4)]
   - Recommended EAC: agent selects the most appropriate method based on project circumstances with stated rationale
   - Variance at Completion (VAC) = BAC - EAC for each method

**Step 4: Analyze TCPI and Contingency Sufficiency**
1. Calculate TCPI = (BAC - EV) / (BAC - AC)
   - If TCPI < 1.0: project can afford to perform worse than planned and still finish on budget
   - If TCPI = 1.0 to 1.10: achievable but requires improved performance
   - If TCPI = 1.10 to 1.20: very challenging, requires significant improvement
   - If TCPI > 1.20: virtually impossible to finish on budget; management intervention required
2. Contingency sufficiency analysis:
   - Remaining contingency vs. forecast overrun (EAC - BAC)
   - Contingency burn rate trend (are we consuming contingency faster than planned?)
   - Contingency exhaustion forecast (at current rate, when will contingency run out?)

### Phase 3: Monte Carlo Simulation (Steps 5-6)

**Step 5: Configure Monte Carlo Model**
1. Define activity-level three-point estimates for remaining activities:
   - Optimistic: best-case remaining duration (10th percentile)
   - Most Likely: most probable remaining duration (mode)
   - Pessimistic: worst-case remaining duration (90th percentile)
2. Select distribution type per activity:
   - Triangular: for activities with limited historical data
   - Beta-PERT: for activities with experience data (recommended default)
   - Uniform: for activities with high uncertainty and no clear most-likely value
3. Define correlation groups (activities that tend to be affected by the same factors):
   - Same contractor
   - Same discipline
   - Same geographic area
   - Same resource pool
4. Configure risk events as probabilistic branches:
   - For each active risk: probability of occurrence, duration impact range, cost impact range
   - Model as: if random() < probability, add impact to affected activities
5. Set iteration count: minimum 1,000 (preliminary); target 5,000-10,000 (final)

**Step 6: Run Simulation and Analyze Results**
1. Execute Monte Carlo simulation
2. Verify convergence (results stable to +/-1% between runs)
3. Generate completion date probability distribution
4. Extract key percentiles:
   - P10: 10% chance of completing by this date (optimistic)
   - P50: 50% chance (planning basis -- equally likely to be early or late)
   - P80: 80% chance (management commitment basis)
   - P90: 90% chance (contingency basis)
   - P95: 95% chance (stretch planning)
5. Calculate probability of meeting contractual completion date
6. Identify critical path sensitivity:
   - Criticality index per activity (% of iterations where activity is on critical path)
   - Top 10 activities with highest criticality index
7. Create tornado diagram:
   - Top 10 risks/activities driving completion date uncertainty
   - Rank by impact on P80 completion date
8. Compare with previous month results (trend in P50, P80 completion dates)

### Phase 4: S-Curve Generation and Variance Analysis (Steps 7-8)

**Step 7: Generate S-Curves**
1. Plot cumulative BCWS (Planned Value) from project start to planned completion
2. Overlay cumulative BCWP (Earned Value) from project start to current date
3. Overlay cumulative ACWP (Actual Cost) from project start to current date
4. Project forecast curves:
   - Forecast EV curve (extend from current date to planned completion using SPI)
   - Forecast AC curve (extend from current date to EAC using CPI)
   - Multiple scenarios if applicable (EAC1, EAC2, EAC3 extensions)
5. Generate physical progress S-curve:
   - Planned % complete over time
   - Actual % complete over time
   - Forecast % complete using SPI
6. Interpret S-curves:
   - Identify crossover points (when EV fell behind PV, when AC exceeded EV)
   - Detect trend changes (is gap widening, narrowing, or stable?)
   - Identify inflection points (acceleration, deceleration of progress)
   - Compare shape with expected profile (early slow, middle acceleration, late deceleration)
7. Generate earned schedule analysis:
   - ES = time at which current EV would have been earned per original plan
   - Schedule variance (time) = ES - AT (actual time)
   - SPI(t) = ES / AT

**Step 8: Decompose Variances**
1. **Cost Variance Decomposition:**
   - CV = EV - AC (total cost variance)
   - Decompose into root causes:
     - CV(scope changes) = cost of approved change orders (from change register)
     - CV(productivity) = (planned hours - actual hours) x blended rate (from productivity data)
     - CV(escalation) = actual material prices - estimated prices (from procurement data)
     - CV(rework) = cost of rework activities (from quality records)
     - CV(other) = CV - sum of above (residual)
   - Express each as absolute value and % of total CV
2. **Schedule Variance Decomposition:**
   - SV = EV - PV (total schedule variance)
   - Decompose into root causes:
     - SV(scope changes) = schedule impact of approved changes (from change register)
     - SV(weather) = weather days claimed (from site records)
     - SV(resources) = delay attributable to resource constraints (from schedule analysis)
     - SV(rework) = delay attributable to rework cycles (from quality records)
     - SV(design) = delay attributable to late design deliverables (from engineering records)
     - SV(other) = SV - sum of above (residual)
   - Express each as absolute value and % of total SV
3. Generate Pareto chart of root causes (which causes account for 80% of variance)
4. Trend analysis: compare this month's root cause distribution with prior months

### Phase 5: Report Generation and Recovery Planning (Steps 9-10)

**Step 9: Prepare Forecast Report**
1. Compile all analyses into the Completion Forecast Report (.docx)
2. Write executive summary with key findings, metrics, and management attention items
3. Prepare EVM Dashboard (.xlsx) with all sheets populated and charts generated
4. Highlight key risks to forecast reliability (data quality issues, major pending changes, schedule logic concerns)
5. Compare current forecast with previous month and highlight trend direction
6. Validate all numbers cross-reference correctly between report and dashboard

**Step 10: Develop Recovery Recommendations**
1. If CPI < 1.0 or SPI < 1.0, develop recovery scenarios:
   - **Scenario A - Add Resources**: estimate cost of additional resources, schedule recovery achievable, probability of success
   - **Scenario B - Fast-Track / Re-sequence**: identify activities that can be overlapped, cost of acceleration, schedule recovery
   - **Scenario C - Reduce Scope**: identify deferrable scope, cost savings, schedule recovery
   - **Scenario D - Accept**: do nothing, quantify final cost and schedule impact
2. For each scenario, run Monte Carlo to estimate probability of achieving target
3. Prepare cost-benefit analysis matrix comparing all scenarios
4. Recommend optimal recovery strategy with implementation plan
5. Identify decisions required from management and timeline for decisions

---
