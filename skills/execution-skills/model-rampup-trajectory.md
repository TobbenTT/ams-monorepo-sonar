# Model Ramp-Up Trajectory

## Skill ID: H-04
## Version: 1.0.0
## Category: H. OR Orchestration
## Priority: P1 - High

---

## Purpose

Model the production ramp-up trajectory for a capital project based on Operational Readiness (OR) status, industry benchmarks, and Monte Carlo simulation. This skill translates OR readiness data -- across all 12+ domains -- into a probabilistic production forecast that predicts when the asset will reach design capacity, identifies the OR gaps most likely to delay ramp-up, and quantifies the economic impact of readiness deficiencies on project NPV.

Ramp-up performance is the ultimate measure of OR effectiveness. Industry data is unequivocal: Mining Technology reports that new mine ramp-ups take 2-3 years instead of the planned 12-18 months (Pain Point MT-01), with Year-1 production typically reaching only 50-70% of design capacity versus the commonly planned >80% target. Oil & Gas Journal documents 12-24 month delays in the CAPEX-to-OPEX transition (Pain Point OG-01), during which the asset consumes operating costs without generating revenue at designed levels. IPA (Independent Project Analysis) benchmarking data from over 3,000 capital projects shows that OR readiness at handover is the single strongest predictor of ramp-up performance -- projects that achieve >85% OR readiness at commissioning start reach design capacity 40-60% faster than those below 70%.

The economic consequences of slow ramp-up are devastating. For a $4.5 billion copper mine with a design capacity of 120,000 tonnes of copper cathode per year at $4.00/lb Cu, every month of delayed full production represents approximately $40-45 million in lost revenue. Over a typical 6-12 month ramp-up delay, this accumulates to $240-540 million in value destruction -- often exceeding the entire OR program budget by an order of magnitude. McKinsey's analysis of mining megaprojects (Pain Point M-02) found that ramp-up delays are the primary driver of the gap between projected and actual project returns, frequently turning positive-NPV projects into marginal or negative-return investments.

This skill serves the OR Orchestrator (H-01) by providing the analytical engine that converts OR readiness metrics into production forecasts. It enables evidence-based decision-making at gate reviews: if the model predicts unacceptable ramp-up performance, the orchestrator can identify which OR domains require intervention, quantify the cost of delay versus the cost of accelerating readiness, and present decision-makers with actionable options rather than vague concerns.

---

## Intent & Specification

**Problem:** Capital project teams plan ramp-up trajectories based on optimistic assumptions -- design capacity reached in 12-18 months, all systems performing at nameplate, full staffing from Day 1. Reality consistently underperforms these assumptions because ramp-up performance depends on dozens of interdependent factors across OR domains: staff competency, procedure completeness, spare parts availability, CMMS readiness, process stability, equipment reliability, and regulatory compliance. Without a model that integrates these factors probabilistically, project teams cannot:

- **Predict** when design capacity will actually be achieved (vs. hoped for)
- **Identify** which OR gaps pose the greatest threat to ramp-up performance
- **Quantify** the NPV impact of current readiness levels vs. target readiness
- **Prioritize** investments in OR acceleration based on ramp-up sensitivity
- **Set realistic expectations** with stakeholders, investors, and boards

Industry evidence of the problem:

- **Mining Technology (Pain Point MT-01):** New mine ramp-ups take 2-3 years instead of planned 12-18 months. Year-1 production averages 50-70% of design capacity. Root causes: inadequate training (35%), equipment reliability issues (25%), process instability (20%), staffing gaps (15%), supply chain issues (5%).
- **Oil & Gas Journal (Pain Point OG-01):** 12-24 month delays in CAPEX-to-OPEX transition. LNG projects average 18-month delay to plateau production. Root causes: commissioning punch list items (30%), operations readiness gaps (25%), process optimization (20%), regulatory delays (15%), infrastructure issues (10%).
- **IPA Benchmarking Data:** Projects with best-practice OR programs achieve 85-95% of design capacity in Year 1. Projects with minimal OR programs achieve 40-60% of design capacity in Year 1. The correlation between OR readiness score at commissioning and Year-1 production attainment is R-squared = 0.72.
- **McKinsey Global Institute (Pain Point M-02):** 80% of megaprojects exceed budgets by an average of 30%. Ramp-up delays are the primary contributor to the gap between projected and actual project returns.
- **EY Infrastructure Advisory (Pain Point E-01):** 65% of infrastructure projects fail to meet performance objectives within the planned timeframe. The median time to reach steady-state operations is 2.1x the planned duration.
- **Deloitte (Pain Point D-01):** 60%+ of projects have significant OR deficiencies at handover. Each percentage point of OR readiness below target at commissioning corresponds to approximately 1.5 weeks of additional ramp-up time.

**Success Criteria:**
- Ramp-up model calibrated against IPA benchmark data for the specific industry sector
- Production forecast expressed as P10/P50/P90 probability distribution
- Sensitivity analysis identifies the top 5 OR domains most impactful to ramp-up timeline
- NPV impact calculated for current readiness vs. target readiness scenarios
- Model updated weekly during commissioning and ramp-up phases
- Actual vs. predicted tracking with model recalibration as real data accumulates
- Forecasts accurate to within +/- 15% of actual ramp-up trajectory (measured post-facto)
- Ramp-up milestone predictions (50%, 75%, 90%, 100% of design capacity) with confidence intervals

**Constraints:**
- Model must accommodate both greenfield and brownfield projects
- Must support multiple industry sectors (mining, oil & gas, chemical, power, infrastructure)
- Must integrate with live OR readiness data from mcp-sharepoint and mcp-excel
- Must produce Power BI-compatible outputs for executive dashboards via mcp-powerbi
- Must handle partial data gracefully (early-phase modeling with limited readiness data)
- Must support bilingual outputs (English/Spanish)
- Must distinguish between systematic ramp-up constraints (process learning curve) and OR-driven constraints (readiness gaps)
- Monte Carlo simulation must run minimum 10,000 iterations for statistical validity
- Must preserve full audit trail of model inputs, assumptions, and outputs

---

## Trigger / Invocation

**Primary Triggers:**
- `model-rampup-trajectory forecast --project [name] --scenario [base|optimistic|pessimistic]`
- `model-rampup-trajectory sensitivity --project [name] --domain [domain]`
- `model-rampup-trajectory update --project [name] --actuals [data]`
- `model-rampup-trajectory npv-impact --project [name]`
- `model-rampup-trajectory compare --project [name] --scenarios [list]`
- `model-rampup-trajectory benchmark --project [name] --industry [sector]`
- `model-rampup-trajectory report --project [name] --audience [executive|management|technical]`

**Aliases:** `/rampup-model`, `/ramp-up-forecast`, `/production-trajectory`, `/rampup`

**Automatic Triggers:**
- Weekly update during commissioning and ramp-up phases (aligned with OR status update cycle)
- Gate review preparation (T-14 days before G4, G5, G6)
- Significant OR readiness change (>5% shift in any domain readiness score)
- Actual production data available (daily during ramp-up)
- OR Orchestrator (H-01) requests ramp-up forecast update
- Project schedule re-baseline event
- Budget revision event affecting OR or operations

**Event-Driven Triggers:**
- Major equipment commissioning milestone achieved (first ore, first gas, first power)
- Critical staffing milestone (operations team mobilization complete)
- Significant equipment failure during commissioning (model impact assessment)
- Regulatory approval obtained or delayed (permits affecting startup)
- Weather or force majeure event affecting ramp-up timeline

---

## Input Requirements

| Input | Source | Required | Description |
|-------|--------|----------|-------------|
| OR Readiness Scores | mcp-sharepoint / track-or-deliverables (H-02) | Yes | Domain-level readiness percentages (12+ domains) with item-level detail |
| Design Capacity Parameters | Client / engineering documentation | Yes | Nameplate capacity, design throughput, product specifications, ramp-up phases |
| Project Schedule | mcp-project-online | Yes | Commissioning start, mechanical completion dates, commercial operation target |
| Industry Sector | User / project configuration | Yes | Mining, oil & gas, chemical, power, infrastructure -- determines benchmark curves |
| Equipment Register with Criticality | agent-maintenance / analyze-equipment-criticality | Yes | Equipment list with criticality ratings for reliability modeling |
| Staffing Plan & Status | agent-hr / model-staffing-requirements | Yes | Planned vs. actual staffing levels by role, training completion status |
| Spare Parts Readiness | generate-initial-spares-list (K-01) | Yes | Critical and insurance spares availability percentage |
| Financial Parameters | agent-finance / model-opex-budget | Yes | Revenue per unit, operating cost per unit, discount rate, project NPV baseline |
| Historical Ramp-Up Data | VSC knowledge base / IPA benchmarks | No | Ramp-up curves from similar completed projects for calibration |
| Actual Production Data | mcp-excel / SCADA / MES | No (required during ramp-up) | Daily/weekly actual production versus design capacity |
| Equipment Availability Data | mcp-cmms | No (required during ramp-up) | Actual equipment availability, reliability, and utilization data |
| Process Stability Metrics | mcp-excel / process control system | No | Process variability, quality compliance rates, yield data |
| Commissioning Punch List Status | track-punchlist-items (R-02) | No | Outstanding punch items by priority and impact on production |
| Training Completion Records | track-competency-matrix (M-02) | No | Competency certification status by role and system |

**Ramp-Up Model Configuration Schema:**
```yaml
rampup_model:
  project_code: "PRJ-001"
  project_name: "Sierra Verde Copper Expansion"
  industry: "mining"
  sub_sector: "copper_concentrator"

  design_parameters:
    nameplate_capacity: 120000  # tpd ore processing
    product: "copper_cathode"
    annual_production_target: 320000  # tonnes Cu
    product_price: 4.00  # USD/lb
    operating_cost_per_unit: 0.88  # USD/lb Cu

  rampup_phases:
    - phase: "initial_commissioning"
      target_pct: 30
      planned_duration_months: 2
      description: "Dry commissioning, wet commissioning, first ore"
    - phase: "early_production"
      target_pct: 60
      planned_duration_months: 4
      description: "Process stabilization, initial throughput ramp"
    - phase: "ramp_to_capacity"
      target_pct: 85
      planned_duration_months: 6
      description: "Throughput optimization, reliability improvement"
    - phase: "design_capacity"
      target_pct: 100
      planned_duration_months: 6
      description: "Fine tuning, sustained performance"

  or_domain_weights:
    operations_readiness: 0.20
    maintenance_readiness: 0.18
    staffing_training: 0.15
    spare_parts_supply: 0.12
    process_knowledge: 0.10
    hse_systems: 0.08
    cmms_systems: 0.05
    regulatory_compliance: 0.05
    commissioning_quality: 0.04
    document_readiness: 0.03

  monte_carlo:
    iterations: 10000
    confidence_levels: [10, 25, 50, 75, 90]
    random_seed: 42  # for reproducibility

  benchmarks:
    source: "IPA_mining_copper_2020"
    p10_months_to_design: 12
    p50_months_to_design: 24
    p90_months_to_design: 36

  financial:
    discount_rate: 0.08
    project_npv_baseline: 2850000000  # USD
    revenue_per_month_at_design: 45000000  # USD
```

---

## Output Specification

**Primary Outputs:**

### 1. Ramp-Up Forecast Model (Excel)
**Filename:** `{ProjectCode}_RampUp_Model_v{version}_{date}.xlsx`

**Workbook Structure:**

#### Sheet 1: "Executive Summary"
- Visual ramp-up curve: Planned vs. P10/P50/P90 forecast vs. Actual (if in ramp-up)
- Key metrics: Months to 50%/75%/90%/100% design capacity (P50 estimate)
- OR readiness impact summary: Which domains are constraining ramp-up
- NPV impact of current trajectory vs. plan
- Top 5 risks to ramp-up timeline

#### Sheet 2: "Ramp-Up Curves"
| Month | Planned % | P10 % | P25 % | P50 % | P75 % | P90 % | Actual % | Variance |
|-------|-----------|-------|-------|-------|-------|-------|----------|----------|
| M1 | 10% | 5% | 7% | 9% | 11% | 14% | -- | -- |
| M2 | 20% | 10% | 14% | 18% | 22% | 28% | -- | -- |
| ... | ... | ... | ... | ... | ... | ... | ... | ... |
| M24 | 100% | 72% | 82% | 92% | 98% | 100% | -- | -- |

#### Sheet 3: "OR Domain Impact Analysis"
| OR Domain | Readiness Score | Weight | Ramp-Up Impact | Sensitivity | Improvement Opportunity |
|-----------|----------------|--------|---------------|-------------|------------------------|
| Operations Readiness | 75% | 0.20 | -5.0% throughput | HIGH | Complete SOP development, operator training |
| Maintenance Readiness | 68% | 0.18 | -5.8% throughput | HIGH | CMMS configuration, PM program activation |
| Staffing & Training | 82% | 0.15 | -2.7% throughput | MEDIUM | Complete practical assessments for 15 operators |
| Spare Parts & Supply | 60% | 0.12 | -4.8% throughput | HIGH | Expedite critical crusher and mill spares |

#### Sheet 4: "Monte Carlo Results"
- Histogram of months-to-design-capacity (10,000 iterations)
- Cumulative probability curve
- Sensitivity tornado diagram (which inputs drive the most variance)
- Correlation analysis between OR domains and ramp-up duration

#### Sheet 5: "NPV Impact Analysis"
| Scenario | Months to Design | Year-1 Production % | Revenue Impact ($M) | NPV Impact ($M) | vs. Plan |
|----------|-----------------|---------------------|---------------------|------------------|----------|
| Plan | 12 | 85% | 540.0 | 2,850.0 | Baseline |
| P10 (optimistic) | 10 | 90% | 570.0 | 2,960.0 | +110.0 |
| P50 (expected) | 18 | 72% | 456.0 | 2,540.0 | -310.0 |
| P90 (pessimistic) | 30 | 55% | 348.0 | 2,120.0 | -730.0 |
| Current Trajectory | 22 | 64% | 405.0 | 2,350.0 | -500.0 |

#### Sheet 6: "Sensitivity Analysis"
Tornado diagram data showing the impact of +/- 10% change in each OR domain readiness on:
- Months to design capacity
- Year-1 production percentage
- NPV impact

#### Sheet 7: "Industry Benchmarks"
Comparison of project forecast against IPA benchmarks:
- Industry median, top quartile, bottom quartile ramp-up curves
- Project positioning within industry distribution
- Key differentiators (positive and negative)

#### Sheet 8: "Model Assumptions"
Complete documentation of:
- OR domain weighting rationale
- Distribution assumptions for Monte Carlo inputs
- Benchmark data sources and applicability
- Limitations and caveats
- Model version history

### 2. Ramp-Up Dashboard (Power BI)
**Filename:** `{ProjectCode}_RampUp_Dashboard_{date}.pbix`

**Dashboard Pages:**
- **Production Trajectory:** Live ramp-up curve with confidence bands, actual vs. forecast
- **OR Impact Analysis:** Domain-by-domain readiness and ramp-up impact
- **NPV Tracker:** Financial impact of ramp-up performance in real-time
- **Sensitivity View:** Interactive tornado diagram for what-if analysis
- **Benchmark Comparison:** Project positioning against industry benchmarks
- **Trend Analysis:** Model forecast evolution over time (how predictions have changed)

### 3. Ramp-Up Forecast Report (PowerPoint)
**Filename:** `{ProjectCode}_RampUp_Forecast_{date}.pptx`

**Structure (10-15 slides):**
1. Executive summary: One-page ramp-up status with key metrics
2. Ramp-up curves: Planned vs. P10/P50/P90 vs. Actual
3. OR domain impact: Which domains are driving ramp-up risk
4. Sensitivity analysis: What matters most
5. NPV impact: Financial consequence of current trajectory
6. Industry benchmark comparison
7. Recommended actions: Top 5 interventions to improve trajectory
8. Scenario comparison: Base/optimistic/pessimistic/accelerated
9. Timeline: Key milestones and predicted achievement dates
10. Appendices: Methodology, assumptions, data sources

---

## Methodology & Standards

### Ramp-Up Modeling Framework

The model uses a three-layer approach:

**Layer 1: Industry Benchmark Curve (Baseline)**
The baseline ramp-up curve is derived from IPA benchmarking data for the specific industry sector. This curve represents the "typical" ramp-up trajectory for projects of similar type, size, and complexity.

| Industry Sector | Typical Time to Design Capacity | Year-1 Production (% of Design) |
|----------------|-------------------------------|--------------------------------|
| Mining (Copper) | 18-30 months | 50-75% |
| Mining (Iron Ore) | 12-24 months | 55-80% |
| Mining (Lithium) | 24-36 months | 40-65% |
| Oil & Gas (Conventional) | 6-18 months | 65-85% |
| Oil & Gas (LNG) | 12-30 months | 50-75% |
| Chemical/Petrochemical | 6-18 months | 60-80% |
| Power Generation (Thermal) | 3-12 months | 75-90% |
| Power Generation (Renewable) | 1-6 months | 80-95% |
| Water/Wastewater | 6-12 months | 70-90% |

**Layer 2: OR Readiness Adjustment**
The baseline curve is adjusted based on actual OR readiness scores across all domains. Each domain has a calibrated weight and a transfer function that maps readiness percentage to throughput impact:

```
Throughput_Factor(domain) = 1 - Weight(domain) * (1 - Readiness(domain)/100)^Exponent
```

Where:
- Weight is the domain's calibrated contribution to ramp-up success
- Readiness is the domain readiness score (0-100%)
- Exponent reflects the non-linear relationship (typically 1.5-2.0: small gaps have disproportionate impact)

The aggregate OR adjustment factor is the product of all domain factors:
```
OR_Adjustment = Product(Throughput_Factor(domain_i)) for all domains
```

**Layer 3: Monte Carlo Simulation**
Each input parameter (OR readiness scores, benchmark timing, process learning rate, equipment reliability, external factors) is modeled as a probability distribution rather than a point estimate:

- OR readiness scores: Triangular distribution (min: current-5%, mode: current, max: projected)
- Benchmark timing: LogNormal distribution (calibrated from IPA data)
- Equipment reliability: Weibull distribution (from RAM analysis or generic data)
- Process learning rate: Beta distribution (industry-typical range)
- External factors: Discrete probability for delay events (weather, regulatory, supply chain)

The simulation runs 10,000 iterations, sampling from each distribution, and produces a probability distribution of ramp-up outcomes.

### Mathematical Model

**S-Curve Ramp-Up Function:**
```
Production(t) = DesignCapacity * Logistic(t, L, k, t0) * OR_Adjustment(t) * Reliability(t)

Where:
  Logistic(t, L, k, t0) = L / (1 + exp(-k * (t - t0)))
  L = maximum production fraction (typically 1.0)
  k = steepness of ramp-up curve (industry-calibrated)
  t0 = inflection point (month at which ramp-up accelerates)
  OR_Adjustment(t) = time-varying factor based on OR readiness improvement
  Reliability(t) = equipment availability factor (improves as burn-in period passes)
```

**NPV Impact Calculation:**
```
NPV_Impact = Sum over t=1 to T of:
  [Production_Plan(t) - Production_Forecast(t)] * Revenue_per_Unit / (1 + r)^(t/12)

Where:
  Production_Plan(t) = planned production at month t
  Production_Forecast(t) = Monte Carlo forecast (P50) at month t
  Revenue_per_Unit = net revenue (price - operating cost) per unit
  r = annual discount rate
  T = months until design capacity achieved
```

### Industry Standards Applied

- **IPA (Independent Project Analysis):** Benchmarking data for project execution and startup performance across 3,000+ capital projects. Industry-sector-specific ramp-up curves and OR readiness correlation data.
- **ISO 55001:** Asset management lifecycle perspective -- ramp-up as a critical lifecycle phase where value realization begins.
- **AACE International 18R-97:** Cost estimate classification -- ramp-up forecast accuracy aligned with estimate class.
- **Monte Carlo Simulation Standards:** Crystal Ball / @RISK methodology. Latin Hypercube Sampling for computational efficiency. Minimum 10,000 iterations for convergence.
- **SMRP Best Practices:** Equipment availability and reliability metrics that feed into the ramp-up reliability layer.
- **PMI PMBOK (7th Ed):** Earned value management principles adapted for production ramp-up tracking.

### Pain Points Addressed with Quantified Impact

| Pain Point | Industry Statistic | How This Skill Addresses It | Expected Improvement |
|-----------|-------------------|----------------------------|---------------------|
| MT-01: Ramp-Up Delays | 2-3 years to design capacity vs. 12-18 months planned | Predicts realistic timeline; identifies corrective actions | 30-50% reduction in ramp-up duration |
| OG-01: CAPEX-OPEX Delays | 12-24 month transition delay | Quantifies OR readiness impact on ramp-up; enables proactive intervention | 6-12 month reduction in delay |
| M-02: Cost Overruns | 80% of megaprojects over budget; avg 30% overrun | NPV impact analysis enables informed investment in OR acceleration | Reduces ramp-up-related overruns by 40-60% |
| D-01: OR Deficiencies | 60%+ gaps at handover | Sensitivity analysis identifies which OR gaps matter most for ramp-up | Focused investment on highest-impact OR domains |
| E-01: Objective Failure | 65% fail to meet objectives | Evidence-based forecasting replaces optimism bias | Realistic milestones set and communicated |
| W-02: Critical Minerals Rush | Compressed schedules for lithium/copper | Models trade-off between schedule compression and ramp-up risk | Informed schedule decisions |

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

## Quality Criteria

| Criterion | Metric | Target | Minimum Acceptable |
|-----------|--------|--------|-------------------|
| Forecast Accuracy | MAPE of P50 vs. actual at 6-month intervals | <15% | <25% |
| Benchmark Calibration | Model baseline aligns with IPA benchmark for sector | Within 5% of IPA median | Within 15% |
| Monte Carlo Convergence | P50 stability across simulation runs | <1% variation | <3% variation |
| Sensitivity Validity | Top 5 sensitivity domains validated by SME review | 100% concurrence | 80% concurrence |
| NPV Calculation Accuracy | Financial model reconciles with project financial model | Within 5% | Within 10% |
| Data Currency | OR readiness data no older than 7 days | 100% | 95% |
| Update Frequency | Model updated per schedule during ramp-up | Weekly (100%) | Bi-weekly |
| Scenario Coverage | Minimum scenarios analyzed per forecast | 5 (Base, P10, P50, P90, Accelerated) | 3 (Base, P50, P90) |
| Stakeholder Utility | Decision-makers rate forecast useful for decisions | >4.0/5.0 | >3.5/5.0 |
| Audit Trail Completeness | All inputs, assumptions, and versions documented | 100% | 100% |
| Domain Weight Calibration | Weights validated against historical project data | R-squared >0.65 | R-squared >0.50 |
| Benchmark Comparison | Project positioned within industry distribution | Quantile identified | Quartile identified |
| Report Timeliness | Forecast reports delivered by schedule | 100% on-time | >90% on-time |
| Bilingual Output | Spanish/English versions available | Both languages | Primary language |

---

## Inter-Agent Dependencies

| Agent/Skill | Dependency Type | Description |
|-------------|----------------|-------------|
| `orchestrate-or-program` (H-01) | Parent Orchestrator | Invokes this skill for ramp-up forecasting; provides project configuration; consumes forecasts for gate reviews and executive reporting |
| `track-or-deliverables` (H-02) | Primary Data Source | Provides domain-level and item-level OR readiness scores that drive the model's OR adjustment factors |
| `generate-or-gate-review` (H-03) | Consumer | Uses ramp-up forecast data in gate review packages (G4, G5, G6) |
| `agent-operations` | Data Provider | Operating model readiness, SOP completion status, commissioning participation readiness |
| `agent-maintenance` | Data Provider | Equipment reliability data, CMMS readiness, PM program activation status, spare parts readiness |
| `agent-hr` | Data Provider | Staffing levels, training completion, competency certification status |
| `agent-finance` | Data Provider & Consumer | Provides financial parameters (price, cost, discount rate); consumes NPV impact analysis for board reporting |
| `agent-hse` | Data Provider | HSE system readiness, permit status, safety training completion |
| `agent-procurement` | Data Provider | Supply chain readiness, spare parts delivery status, consumables availability |
| `model-ram-simulation` | Technical Input | RAM analysis results (availability, reliability, maintainability) that feed equipment reliability layer |
| `analyze-equipment-criticality` | Technical Input | Equipment criticality ratings that determine reliability weighting in the model |
| `generate-initial-spares-list` (K-01) | Readiness Input | Spare parts readiness data (% of critical/insurance spares received) |
| `model-staffing-requirements` (M-01) | Readiness Input | Staffing plan with gap analysis (actual vs. required FTE by role) |
| `track-competency-matrix` (M-02) | Readiness Input | Competency matrix with certification status (trained vs. required by skill) |
| `model-commissioning-sequence` (R-01) | Schedule Input | Commissioning sequence and dependencies that establish the physical constraint on ramp-up |
| `track-punchlist-items` (R-02) | Readiness Input | Punch list status that affects commissioning completion and early production |
| `create-rampup-plan` | Upstream Plan | The ramp-up plan document that defines the planned trajectory this model evaluates probabilistically |
| `generate-or-report` | Report Consumer | Multi-level OR report uses ramp-up forecast data for executive, management, and operational audiences |
| `validate-output-quality` (F-05) | Quality Gate | All forecast outputs pass quality validation before distribution |

---

## MCP Integrations

### mcp-excel
```yaml
name: "mcp-excel"
server: "@anthropic/excel-mcp"
purpose: "Primary modeling platform for ramp-up trajectory calculations"
capabilities:
  - Create and update ramp-up forecast workbooks with multiple scenario sheets
  - Execute Monte Carlo simulation calculations using Excel formulas and data tables
  - Generate charts: S-curves, tornado diagrams, histograms, waterfall charts
  - Import actual production data from operations reporting
  - Maintain version history of model iterations
  - Export data for Power BI integration
authentication: OAuth2 (Microsoft 365)
usage_in_skill:
  - Steps 1-4: Build model workbook with configuration, benchmarks, and OR data
  - Steps 5-6: Run Monte Carlo simulation and sensitivity analysis
  - Step 7: Calculate NPV impact scenarios
  - Steps 9-10: Update with actual data and recalibrate
  - Step 12: Generate close-out report and archive
```

### mcp-powerbi
```yaml
name: "mcp-powerbi"
server: "@vsc/powerbi-mcp"
purpose: "Executive dashboard for ramp-up performance tracking"
capabilities:
  - Publish ramp-up trajectory dashboards with live data refresh
  - Create interactive visualizations for scenario analysis
  - Update datasets with weekly OR readiness and production data
  - Generate drill-down views from program level to domain detail
  - Support stakeholder self-service access to forecast data
authentication: Service Principal
usage_in_skill:
  - Step 8: Publish initial ramp-up forecast dashboard
  - Steps 9-11: Update dashboard weekly with actual vs. forecast data
  - Step 7: Publish NPV impact and financial analysis views
  - Step 6: Create interactive sensitivity analysis views
```

### mcp-sharepoint
```yaml
name: "mcp-sharepoint"
server: "@anthropic/sharepoint-mcp"
purpose: "Document storage and OR readiness data access"
capabilities:
  - Read OR readiness data from deliverable tracking lists
  - Read project configuration and engineering documents
  - Store ramp-up model files with version control
  - Store forecast reports and presentation decks
  - Access historical project data for benchmarking
  - Manage document approval workflows for forecast releases
authentication: OAuth2 (Microsoft Entra ID)
usage_in_skill:
  - Step 1: Read project configuration and design parameters
  - Step 3: Query OR readiness data from deliverable tracking
  - Step 8: Store model outputs and forecast reports
  - Step 12: Archive completed model and close-out documentation
  - Step 14: Access historical project data for benchmark updates
```

---

## Templates & References

### Templates
- `templates/rampup_model_template.xlsx` -- Master ramp-up model workbook with pre-configured sheets, formulas, and charts
- `templates/rampup_forecast_report.pptx` -- Executive presentation template for ramp-up forecast communication
- `templates/rampup_dashboard_template.pbix` -- Power BI dashboard template with pre-configured visualizations
- `templates/rampup_sensitivity_template.xlsx` -- Sensitivity analysis workbook with tornado diagram generator
- `templates/rampup_benchmark_curves.xlsx` -- Industry benchmark ramp-up curves by sector (IPA-calibrated)
- `templates/monte_carlo_config.yaml` -- Default Monte Carlo configuration with distribution parameters

### Reference Documents
- IPA Benchmarking Reports -- Capital project ramp-up performance data (proprietary, licensed)
- McKinsey Global Institute, "Megaprojects: The Good, the Bad, and the Better" -- Industry statistics on project performance
- Mining Technology, "New Mine Ramp-Up Performance Analysis" -- Mining-specific ramp-up benchmarks
- Oil & Gas Journal, "LNG Project Startup Performance Review" -- O&G sector ramp-up data
- AACE International 18R-97 -- Cost Estimate Classification System (applied to forecast accuracy)
- ISO 55001:2014 -- Asset Management Systems (lifecycle value realization framework)
- Crystal Ball / @RISK methodology guides -- Monte Carlo simulation best practices
- VSC Corporate Pain Points Research Report -- Industry statistics referenced throughout

### Reference Datasets
- IPA benchmark ramp-up curves by industry sector (mining, O&G, chemical, power, infrastructure)
- OR domain weight calibration data from historical VSC projects
- Equipment reliability parameters by type (OREDA / IEEE 493)
- Process learning curves by industry sector (historical data)
- Financial parameters by commodity (copper, lithium, gold, iron ore, LNG, refined products)

---

## Examples

### Example 1: Initial Ramp-Up Forecast for a Copper Mine

```
Command: model-rampup-trajectory forecast --project "Sierra Verde" --scenario base

Process:
  Step 1: Project Parameters
    - Industry: Mining (copper concentrator)
    - Design capacity: 120,000 tpd ore processing
    - Annual Cu production target: 320,000 tonnes
    - Cu price: $4.00/lb, Operating cost: $0.88/lb
    - Commissioning start: July 2027, Commercial operation target: Jan 2028
    - Project NPV baseline: $2.85B

  Step 2: Benchmark Loading
    - IPA benchmark for copper mining concentrators (n=47 projects, 2010-2024)
    - P50 time to design capacity: 22 months
    - Year-1 production (P50): 68% of design
    - Top quartile: 85% Year-1 production
    - Bottom quartile: 52% Year-1 production

  Step 3: OR Readiness Data (T-6 months to commissioning)
    - Operations Readiness: 65% (SOPs 55% complete, operating model 80%)
    - Maintenance Readiness: 58% (CMMS 45% configured, PM program 35% loaded)
    - Staffing & Training: 72% (82% positions filled, 65% trained)
    - Spare Parts & Supply: 48% (insurance spares 30%, commissioning spares 60%)
    - Process Knowledge: 70% (process testing 80%, vendor support agreements 60%)
    - HSE Systems: 78% (permits 70%, emergency response 85%)
    - CMMS Systems: 45% (SAP configuration in progress)
    - Regulatory: 82% (key permits obtained, 3 pending)
    - Commissioning Quality: 60% (systems tested 60%, punch list 45% closed)
    - Document Readiness: 70% (vendor docs 75%, SOPs 55%)

    Aggregate OR Readiness: 65% (weighted)

  Step 4: Model Calibration
    - Weights calibrated for copper mining: operations (0.20), maintenance (0.18),
      staffing (0.15), spares (0.12), process (0.10), HSE (0.08), CMMS (0.05),
      regulatory (0.05), commissioning (0.04), docs (0.03)
    - Transfer function exponent: 1.7 (calibrated from IPA data)
    - OR Adjustment Factor (current): 0.78

  Step 5: Monte Carlo Results (10,000 iterations)
    Months to Design Capacity:
      P10: 14 months
      P25: 18 months
      P50: 24 months
      P75: 30 months
      P90: 38 months

    Year-1 Production (% of design):
      P10: 82%
      P25: 72%
      P50: 62%
      P75: 54%
      P90: 45%

  Step 6: Sensitivity Analysis (Top 5 Domains)
    1. Spare Parts & Supply (48%): +10% readiness = -2.8 months to design capacity
    2. CMMS Systems (45%): +10% readiness = -2.1 months
    3. Maintenance Readiness (58%): +10% readiness = -1.9 months
    4. Operations Readiness (65%): +10% readiness = -1.7 months
    5. Commissioning Quality (60%): +10% readiness = -1.3 months

  Step 7: NPV Impact
    - Plan: Design capacity at 12 months, Y1 85%, NPV = $2,850M
    - P50 Forecast: Design capacity at 24 months, Y1 62%, NPV = $2,280M
    - NPV Gap: -$570M
    - Revenue loss rate: $45M/month of delayed full production
    - Accelerated scenario (invest $15M in top 3 domains): NPV improvement +$210M

Output:
  "Sierra Verde Ramp-Up Forecast (T-6 months to commissioning):

   Current OR readiness: 65% (weighted aggregate)
   P50 forecast: 24 months to design capacity (plan: 12 months)
   Year-1 production: 62% of design capacity (plan: 85%)
   NPV impact: -$570M vs. plan
   Industry benchmark position: Below median (P50 = 22 months for sector)

   CRITICAL FINDING: Current OR readiness level predicts ramp-up performance
   below industry median. Immediate action recommended on:
   1. Spare Parts: Expedite insurance and commissioning spares (48% readiness)
   2. CMMS: Accelerate SAP PM configuration and PM plan loading (45% readiness)
   3. Maintenance: Complete FMECA and activate PM program (58% readiness)

   Investing $15M in accelerated OR over next 6 months could improve NPV by
   ~$210M through 4-month ramp-up acceleration. ROI: 14:1.

   Model: SV_RampUp_Model_v1.0_20270115.xlsx
   Dashboard: https://app.powerbi.com/sv-rampup-dashboard"
```

### Example 2: Active Ramp-Up Monitoring (Month 6 of Production)

```
Command: model-rampup-trajectory update --project "Sierra Verde" --actuals month6

Process:
  Actual Performance (Month 6 of production):
    - Month 1: 12% of design (forecast P50: 15%)
    - Month 2: 22% of design (forecast P50: 25%)
    - Month 3: 35% of design (forecast P50: 34%)
    - Month 4: 45% of design (forecast P50: 42%)
    - Month 5: 52% of design (forecast P50: 50%)
    - Month 6: 58% of design (forecast P50: 56%)

  Assessment: Tracking close to P50 forecast. Months 1-2 below forecast
  (crusher availability issues), months 3-6 recovering (crusher spares
  arrived, PM program activated).

  Model Recalibration:
    - Equipment reliability parameter updated: beta=1.8 (was 1.5), reflecting
      infant mortality period for new equipment
    - Process learning rate updated: faster than initially modeled (Beta
      parameters revised)
    - Revised P50 forecast: 21 months to design capacity (was 24)
    - Revised Year-1 production: 67% (was 62%)
    - Revised NPV impact: -$420M (was -$570M, improved by $150M)

Output:
  "Sierra Verde Ramp-Up Update - Month 6:
   Actual: 58% of design capacity (P50 forecast: 56%) - TRACKING ON P50

   Revised P50 forecast: 21 months to design capacity (previous: 24)
   Revised Year-1 production: 67% (previous: 62%)
   NPV impact improved by $150M due to faster-than-expected process learning.

   Key drivers of performance:
   (+) Process learning rate faster than initial model: flotation recovery
       optimization ahead of schedule (process engineering team effective)
   (+) PM program activation at Month 3 reduced unplanned downtime 40%
   (-) Crusher availability below target (85% vs 92% design): bearing failures
   (-) 3 operator positions still vacant in grinding area

   Recommended actions:
   1. Expedite crusher bearing spare procurement (2-month gap identified)
   2. Complete hiring for 3 grinding operator positions
   3. Maintain current process optimization trajectory

   Next milestone: 75% design capacity predicted at Month 10 (P50)
   Dashboard updated: https://app.powerbi.com/sv-rampup-dashboard"
```

### Example 3: Scenario Comparison for Gate G5 Decision

```
Command: model-rampup-trajectory compare --project "Sierra Verde" --scenarios base,accelerated,delay

Process:
  Scenario A (Base): Current OR trajectory continues as-is
    - Commissioning on schedule, OR readiness at commissioning: 78%
    - P50 time to design: 20 months, Year-1: 68%, NPV impact: -$410M

  Scenario B (Accelerated): $8M additional OR investment in top 3 gaps
    - Target OR readiness at commissioning: 88%
    - P50 time to design: 15 months, Year-1: 78%, NPV impact: -$180M
    - Net NPV benefit: +$230M for $8M investment (ROI: 28:1)

  Scenario C (Delay): Commissioning delayed 3 months for OR completion
    - OR readiness at commissioning: 92%
    - P50 time to design: 13 months, Year-1 (from commercial op): 82%
    - But 3 months delayed start: net NPV impact: -$220M

  Recommendation: Scenario B (Accelerated) provides best NPV outcome.
  $8M investment generates $230M in NPV improvement. Proceed with
  commissioning on schedule but with accelerated OR funding.

Output:
  Gate G5 Ramp-Up Scenario Analysis:
  | Scenario | OR at Comm. | Time to Design | Y1 Prod | NPV Impact | Cost |
  |----------|-------------|---------------|---------|------------|------|
  | Base | 78% | 20 months | 68% | -$410M | $0 |
  | Accelerated | 88% | 15 months | 78% | -$180M | $8M |
  | Delay 3mo | 92% | 13 months | 82% | -$220M | $135M* |

  * Delay cost = 3 months x $45M/month revenue opportunity cost

  RECOMMENDATION: Approve Scenario B (Accelerated OR Investment)
  Investment: $8M | NPV Improvement: +$230M | ROI: 28:1
```
