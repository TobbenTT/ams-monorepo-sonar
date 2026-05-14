# Detailed Step-by-Step Execution - model-rampup-trajectory

*Full detailed execution steps extracted from SKILL.md.*
*Read this file when executing the skill for complete step-by-step instructions.*

---

## Step-by-Step Execution

### Phase 1: Model Initialization (Steps 1-4)

**Step 1: Capture Project Parameters and Design Basis**
1. Read project configuration from mcp-sharepoint: project code, industry sector, sub-sector, location
2. Extract design capacity parameters: nameplate throughput, product type, annual production target
3. Extract financial parameters: product price, operating cost, discount rate, project NPV baseline
4. Identify ramp-up phases from commissioning plan: initial commissioning, early production, ramp to capacity, design capacity
5. Load planned ramp-up schedule: target dates for each production milestone (30%, 60%, 85%, 100%)
6. Validate data completeness: flag any missing parameters with default assumptions documented
7. Store project parameters in model configuration file

**Step 2: Load Industry Benchmark Data**
1. Select appropriate IPA benchmark curve for the industry sector and project type
2. Load benchmark statistics: P10/P25/P50/P75/P90 for time-to-design-capacity
3. Load Year-1 production distribution for comparable projects
4. Identify benchmark sample size and vintage (ensure relevance to current project)
5. Adjust benchmarks for project-specific factors:
   - Greenfield vs. brownfield (brownfield typically 20-30% faster)
   - Technology maturity (novel technology adds 3-6 months)
   - Location challenges (remote/high altitude adds 10-20%)
   - Scale (mega-projects typically slower than mid-scale)
6. Document benchmark source, sample characteristics, and adjustments
7. Generate baseline ramp-up curve (before OR readiness adjustment)

**Step 3: Collect OR Readiness Data**
1. Query track-or-deliverables (H-02) for current domain-level readiness scores
2. For each of 12+ OR domains, collect:
   - Overall readiness percentage (deliverables completed / total deliverables)
   - Critical item readiness (critical deliverables completed / total critical)
   - Trend direction (improving, stable, declining)
   - Key gaps and blocker items
3. Collect staffing data: positions filled / total required, by role category
4. Collect training data: competency certifications completed / required
5. Collect spare parts data: critical spares received / required
6. Collect CMMS readiness data: system configuration completion percentage
7. Collect procedure data: SOPs approved / total required
8. Collect equipment data: commissioning completion percentage by system
9. Map all data to the model's OR domain structure
10. Flag data quality issues: stale data (>7 days old), missing domains, inconsistent metrics

**Step 4: Calibrate Model Parameters**
1. Assign OR domain weights based on industry sector and project characteristics:
   - Use IPA calibration data where available
   - Adjust weights for project-specific factors (e.g., novel process increases process_knowledge weight)
2. Set transfer function exponents for each domain:
   - Higher exponent for domains where small gaps cause disproportionate impact (e.g., safety/regulatory)
   - Lower exponent for domains with graceful degradation (e.g., document control)
3. Define probability distributions for Monte Carlo inputs:
   - OR readiness: Triangular(current-5%, current, projected_at_commissioning)
   - Benchmark timing: LogNormal(mu, sigma) calibrated to sector data
   - Equipment reliability: Weibull(beta, eta) from RAM analysis or generic OREDA data
   - Process learning: Beta(alpha, beta) with industry-typical parameters
   - External delay events: Bernoulli(p) with estimated probability and impact duration
4. Validate model calibration against historical projects (if VSC database has similar completed projects)
5. Document all parameter choices, sources, and rationale

### Phase 2: Forecast Generation (Steps 5-8)

**Step 5: Run Monte Carlo Simulation**
1. Initialize simulation: set random seed for reproducibility, configure 10,000 iterations
2. For each iteration:
   a. Sample OR readiness scores from their probability distributions
   b. Calculate OR adjustment factor for each month of the ramp-up
   c. Sample baseline timing from industry benchmark distribution
   d. Sample equipment reliability parameters
   e. Sample process learning rate
   f. Sample external delay events (binary: occurs or not)
   g. Calculate production trajectory for months 1-36 using the S-curve model
   h. Record key outcomes: months to 50%, 75%, 90%, 100% of design capacity; Year-1 production %
3. Aggregate results across all iterations:
   - Calculate percentiles: P10, P25, P50, P75, P90 for each outcome
   - Build cumulative probability distribution
   - Calculate mean, standard deviation, skewness of distribution
4. Validate convergence: verify that P50 estimate is stable (changes <1% with additional iterations)
5. Store full simulation results for sensitivity analysis

**Step 6: Perform Sensitivity Analysis**
1. Run one-at-a-time (OAT) sensitivity analysis:
   - For each OR domain, vary readiness from 50% to 100% while holding others constant
   - Record impact on months-to-design-capacity and Year-1 production %
   - Calculate sensitivity coefficient: delta_output / delta_input
2. Generate tornado diagram ranking OR domains by ramp-up impact
3. Run two-way sensitivity analysis for top 3 domain pairs:
   - Identify interaction effects (domains that compound each other's impact)
4. Run scenario analysis:
   - Base case: current OR readiness trajectory
   - Optimistic: all domains achieve target readiness by commissioning
   - Pessimistic: OR readiness improves by only 50% of planned improvement
   - Accelerated: targeted investment in top 3 sensitivity domains
5. Calculate break-even analysis: how much OR investment is justified by ramp-up improvement

**Step 7: Calculate Financial Impact**
1. For each scenario (P10/P50/P90/Base/Accelerated):
   - Calculate monthly production shortfall vs. plan
   - Convert shortfall to revenue impact: shortfall_tonnes * (price - operating_cost)
   - Discount to present value using project discount rate
   - Calculate cumulative NPV impact over ramp-up period
2. Generate NPV sensitivity: NPV impact per percentage point of OR readiness improvement
3. Calculate return on OR investment:
   - Cost of accelerating top-impact OR domains
   - NPV recovery from improved ramp-up trajectory
   - ROI = (NPV_Improvement - OR_Investment_Cost) / OR_Investment_Cost
4. Identify investment threshold: maximum justifiable OR acceleration spend based on NPV recovery
5. Generate financial summary suitable for board-level presentation

**Step 8: Generate Forecasts and Reports**
1. Compile ramp-up forecast Excel model with all sheets populated
2. Create ramp-up curves visualization:
   - X-axis: months from commissioning start
   - Y-axis: % of design capacity
   - Lines: Planned, P10, P50, P90, Actual (if available)
   - Shaded confidence bands: P25-P75 band
3. Create sensitivity tornado diagram
4. Create NPV impact waterfall chart
5. Create industry benchmark comparison chart
6. Generate executive summary slide deck (10-15 slides)
7. Update Power BI dashboard via mcp-powerbi
8. Store model outputs in mcp-sharepoint with version control

### Phase 3: Active Ramp-Up Monitoring (Steps 9-12)

**Step 9: Ingest Actual Production Data**
1. Receive daily/weekly actual production data:
   - Throughput (tonnes processed)
   - Product output (tonnes produced)
   - Quality (product grade, recovery, specification compliance)
   - Equipment availability (by major system)
   - Downtime events (planned and unplanned, by cause)
2. Calculate actual production as percentage of design capacity
3. Compare actual against P10/P50/P90 forecast bands
4. Identify whether actual performance is tracking better or worse than P50
5. Update "Actual" line on ramp-up curves

**Step 10: Recalibrate Model with Actual Data**
1. Bayesian updating of model parameters:
   - Update process learning rate based on actual throughput progression
   - Update equipment reliability parameters based on actual availability data
   - Update OR domain weights based on observed correlation between readiness and performance
2. Re-run Monte Carlo simulation with updated parameters
3. Generate revised P10/P50/P90 forecasts
4. Compare revised forecast with previous forecast:
   - If significantly different, generate change notification
   - Document reasons for forecast change (improved data, changed conditions, events)
5. Track forecast accuracy over time: forecast vs. actual at each monthly interval

**Step 11: Identify and Communicate Ramp-Up Risks**
1. If actual is tracking below P50 forecast:
   - Analyze root causes: which domain factors are contributing to underperformance
   - Run targeted sensitivity: what interventions would bring trajectory back on track
   - Quantify NPV impact of continuing on current trajectory
   - Generate escalation report with recommended actions
2. If actual is tracking above P50 forecast:
   - Validate data accuracy (avoid false optimism)
   - Update forecast to reflect improved trajectory
   - Identify what is going well (for lessons learned)
3. Generate weekly ramp-up performance commentary:
   - Actual vs. forecast this week
   - Key drivers of variance (positive and negative)
   - Updated milestone predictions
   - Recommended actions for next week

**Step 12: Steady-State Transition and Model Close-Out**
1. Monitor steady-state criteria:
   - Throughput: >90% of design capacity for 30 consecutive days
   - Quality: Product specification met >95% of production
   - Availability: Overall equipment availability >85%
   - Cost: Operating cost within 10% of budget
2. When criteria met, generate ramp-up close-out report:
   - Actual ramp-up curve vs. original forecast
   - Model accuracy assessment (forecast vs. actual at each milestone)
   - Total NPV impact of ramp-up performance vs. plan
   - Lessons learned for model improvement
   - Recommendations for future projects
3. Archive model with all versions, inputs, and results
4. Update VSC benchmark database with this project's ramp-up data
5. Generate lessons learned for industry benchmark library

### Phase 4: Continuous Improvement (Steps 13-14)

**Step 13: Post-Project Model Validation**
1. 6 months after steady-state declaration:
   - Compare actual cumulative production against original P50 forecast
   - Calculate forecast accuracy metrics: MAPE, RMSE, bias
   - Identify systematic model errors (optimism/pessimism bias)
   - Document model improvement recommendations
2. Update model calibration parameters based on project results
3. Contribute anonymized ramp-up data to VSC benchmark database

**Step 14: Benchmark Database Enhancement**
1. Add completed project ramp-up data to industry benchmark database
2. Recalibrate benchmark curves with additional data point
3. Update OR domain weights based on cross-project regression analysis
4. Improve Monte Carlo distribution parameters based on observed outcome distributions
5. Document methodology improvements for next model version

---
