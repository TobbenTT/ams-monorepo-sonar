---
name: model-rampup-trajectory
description: "Model production ramp-up trajectories and scenarios. Triggers: 'ramp-up trajectory', 'production curve', 'curva de produccion'."
---

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
### Phase 2: Forecast Generation (Steps 5-8)
**Step 5: Run Monte Carlo Simulation**
### Phase 3: Active Ramp-Up Monitoring (Steps 9-12)
**Step 9: Ingest Actual Production Data**
### Phase 4: Continuous Improvement (Steps 13-14)
**Step 13: Post-Project Model Validation**

See [`references/skill-detailed-steps.md`](references/skill-detailed-steps.md) for complete detailed execution steps.

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

## Examples

See [`references/skill-examples.md`](references/skill-examples.md) for detailed examples.

## MCP Integrations

See [`references/skill-mcp-integrations.md`](references/skill-mcp-integrations.md) for detailed mcp integrations.

## Templates & References

See [`references/skill-templates-references.md`](references/skill-templates-references.md) for detailed templates & references.
