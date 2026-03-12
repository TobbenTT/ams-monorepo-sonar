---
name: model-financial-scenarios
description: Perform what-if financial scenario analysis including OPEX modeling, sensitivity analysis, and multi-scenario comparison for OR project decision support
version: 1.0.0
category: B - Analysis
priority: Medium
agent: finance-accounting
tags: [financial-modeling, what-if, OPEX, sensitivity-analysis, scenario-comparison, decision-support, Monte-Carlo]
triggers:
  - model financial scenarios
  - modelar escenarios financieros
  - analisis de sensibilidad
  - what-if analysis
inputs:
  - base-case-financial-model
  - scenario-parameters
  - risk-register-cost-items
  - operational-assumptions
outputs:
  - scenario-comparison-report
  - sensitivity-analysis-results
  - decision-recommendation
  - risk-adjusted-financial-forecast
---

# Skill: model-financial-scenarios

## Purpose

This skill enables structured financial scenario modeling for Operational Readiness (OR) projects, providing project leadership with quantified decision support when facing uncertainty. OR projects inherently involve significant financial uncertainty -- staffing timelines may shift, commodity prices fluctuate, commissioning sequences may be re-ordered, and regulatory requirements may evolve. This skill transforms those uncertainties into quantified financial scenarios that can be compared and evaluated.

The skill supports three primary modeling approaches:
1. **Deterministic What-If Analysis**: Define discrete scenarios (optimistic, base, pessimistic) with specific parameter values and compare total cost outcomes.
2. **Sensitivity Analysis**: Vary individual parameters systematically to identify which cost drivers have the greatest impact on total project cost, enabling focused risk management.
3. **Probabilistic Modeling**: Apply probability distributions to key uncertain parameters and use Monte Carlo simulation logic to generate a range of possible outcomes with confidence intervals.

In the OR context, financial scenarios are not abstract exercises -- they directly inform decisions about staffing ramp-up timing, spare parts procurement strategy, maintenance outsourcing vs insourcing, training program scope, and OPEX budget submissions to asset owners. The Finance Agent (AG-010) uses this skill in coordination with Operations (staffing models), Asset Management (maintenance cost models), and Execution (schedule-driven cost impacts) to produce integrated financial scenarios.

## Intent & Specification

### Intent Level: L2 (Full specification with references)

This skill executes when project leadership or client stakeholders need to evaluate the financial implications of alternative decisions, understand cost risk exposure, or prepare OPEX budget submissions under uncertainty. It produces structured scenario comparisons with clear assumptions, enabling informed decision-making.

### Specification Parameters

| Parameter | Description | Required | Default |
|-----------|-------------|----------|---------|
| `project_id` | Unique project identifier | Yes | -- |
| `base_case_ref` | Reference to approved base case financial model | Yes | -- |
| `scenarios` | List of scenario definitions with parameter overrides | Yes | -- |
| `analysis_type` | Type of analysis (deterministic, sensitivity, probabilistic) | No | deterministic |
| `sensitivity_parameters` | Parameters to vary for sensitivity analysis | Conditional | -- |
| `sensitivity_range_pct` | Range for sensitivity variation (e.g., +/- 20%) | No | 20% |
| `simulation_iterations` | Number of Monte Carlo iterations (if probabilistic) | No | 10000 |
| `confidence_intervals` | Confidence levels to report (e.g., P10, P50, P90) | No | [P10, P50, P90] |
| `time_horizon_months` | Modeling time horizon from project start | No | Project duration |
| `discount_rate_pct` | Discount rate for NPV calculations (if applicable) | No | 0 (nominal) |
| `currency` | Reporting currency (ISO 4217) | No | USD |

### Preconditions
- An approved base case financial model exists with defined cost structure
- Scenario parameters and assumptions are defined by the requesting stakeholder
- Cost driver relationships are understood (fixed vs variable, step functions, etc.)
- For probabilistic analysis, probability distributions are defined for key uncertainties

## Trigger / Invocation

### English Triggers
- "Model financial scenarios for the OR project"
- "What happens to OPEX if we delay staffing by 3 months?"
- "Run sensitivity analysis on the maintenance budget"
- "Compare optimistic, base, and pessimistic cost scenarios"
- "What is our P90 cost exposure?"
- "Model the financial impact of insourcing vs outsourcing maintenance"

### Spanish Triggers (Latin American)
- "Modelar escenarios financieros para el proyecto de OR"
- "Que pasa con el OPEX si retrasamos la dotacion 3 meses?"
- "Ejecutar analisis de sensibilidad sobre el presupuesto de mantenimiento"
- "Comparar escenarios optimista, base y pesimista de costos"
- "Cual es nuestra exposicion de costos al P90?"
- "Modelar el impacto financiero de internalizar vs externalizar el mantenimiento"
- "Necesito un analisis de que pasa si para la presentacion al directorio"
- "Armar modelo de escenarios para el presupuesto OPEX del primer anio"
- "Evaluar la sensibilidad del costo total a variaciones en el precio del combustible"

### Programmatic Invocation
```python
result = agent.execute_skill(
    skill="model-financial-scenarios",
    project_id="PRJ-001",
    base_case_ref="FM-PRJ001-BASE-v2.1",
    analysis_type="deterministic",
    scenarios=[
        {
            "name": "Base Case",
            "description": "Current approved plan",
            "overrides": {}
        },
        {
            "name": "Delayed Staffing",
            "description": "Full staffing delayed by 3 months",
            "overrides": {
                "staffing_rampup_delay_months": 3,
                "overtime_premium_pct": 15
            }
        },
        {
            "name": "Outsourced Maintenance",
            "description": "Full maintenance outsource Year 1",
            "overrides": {
                "maintenance_insource_pct": 0,
                "outsource_contract_annual": 4500000
            }
        }
    ]
)
```

## Input Requirements

### Required Inputs

| Input | Format | Source | Description |
|-------|--------|--------|-------------|
| Base Case Financial Model | XLSX/CSV/Structured data | Finance Agent / Project Controls | Approved cost model with line-item detail by period |
| Scenario Definitions | Structured parameters | Stakeholder / Consultant | Named scenarios with specific parameter overrides |
| Cost Structure | Hierarchical cost breakdown | Finance Agent / WBS | Fixed/variable classification, cost driver relationships |
| Operational Assumptions | Structured table | Operations / Asset Mgmt Agents | Production rates, staffing levels, equipment utilization |
| Schedule Baseline | Milestone schedule | Execution Agent | Key dates driving cost timing (first ore, ramp-up phases) |

### Optional Inputs

| Input | Format | Source | Description |
|-------|--------|--------|-------------|
| Risk Register (cost items) | Structured table | Execution Agent | Identified risks with probability distributions for probabilistic modeling |
| Market Price Forecasts | CSV/time series | Market intelligence | Commodity prices, labor rate projections, FX forecasts |
| Contractual Terms | Summary table | Contracts & Compliance Agent | Escalation clauses, penalty structures, incentive mechanisms |
| Historical Cost Data | CSV | Finance systems | Comparable project actuals for benchmarking scenario reasonableness |
| Inflation/Escalation Indices | CSV | Economic data sources | CPI, PPI, sector-specific escalation factors |
| Tax and Royalty Schedules | Structured table | Tax/Legal | Applicable tax rates, royalty structures, fiscal incentives |

### Data Quality Requirements
- Base case model must be the formally approved version (not working drafts)
- Scenario parameter overrides must be specific and quantified (not vague directional assumptions)
- Cost driver relationships must be documented (e.g., "maintenance cost = f(equipment count, operating hours)")
- For probabilistic analysis, distribution types and parameters must be justified (not arbitrary)

## Output Specification

### Primary Output: Scenario Comparison Report

```markdown
# Financial Scenario Analysis Report
## Project: {project_name} | Date: {analysis_date}

### 1. Executive Summary
- Analysis type and purpose
- Scenarios analyzed (names and key differentiators)
- Key finding: recommended scenario or key risk insight
- Decision required from leadership

### 2. Base Case Summary
- Total project cost (CAPEX + OPEX Year 1-3)
- Cost breakdown by major category
- Key assumptions table
- Monthly/quarterly cash flow profile

### 3. Scenario Comparison Matrix

| Parameter | Base Case | Scenario A | Scenario B | Scenario C |
|-----------|-----------|------------|------------|------------|
| Total OPEX Year 1 | $X | $Y | $Z | $W |
| Staffing Cost | ... | ... | ... | ... |
| Maintenance Cost | ... | ... | ... | ... |
| Delta vs Base | -- | +$A (+n%) | -$B (-m%) | +$C (+p%) |

### 4. Sensitivity Analysis Results (if applicable)
- Tornado chart data: top 10 cost drivers ranked by impact
- Spider chart data: parameter variation vs total cost response
- Identification of critical parameters (high impact, high uncertainty)
- Break-even analysis for key decisions

### 5. Probabilistic Results (if applicable)
- Probability distribution of total cost (histogram data)
- P10, P50, P90 values for total cost and major categories
- Key risk contributors to cost uncertainty
- Correlation analysis between risk factors

### 6. Decision Analysis
- For each decision being evaluated:
  - Options compared
  - Financial impact of each option
  - Risk profile of each option
  - Recommended option with justification
- Regret analysis: worst-case outcome for each option

### 7. Assumptions and Limitations
- Complete assumptions register for each scenario
- Model limitations and areas of uncertainty
- Sensitivity of conclusions to key assumptions
- Recommendations for reducing uncertainty (additional data needed)

### 8. Appendices
- Detailed cost models for each scenario
- Calculation methodology documentation
- Data sources and references
```

### Output Format Requirements
- Report delivered as Markdown (.md) file in `output/finance/scenarios/`
- Supporting calculation tables as CSV in `output/finance/scenarios/data/`
- Chart data formatted for visualization tools (tornado, spider, histogram data as CSV)
- All monetary values in consistent currency with explicit conversion rates noted

## Procedure

### Step 1: Base Case Validation and Cost Structure Analysis

1.1. Retrieve the approved base case financial model. Verify it is the current approved version (check against project controls baseline register).

1.2. Decompose the base case into its cost structure:
- Identify fixed costs (site overhead, insurance, management salaries)
- Identify variable costs (consumables, energy, production-linked labor)
- Identify step-function costs (equipment mobilization, crew additions)
- Identify time-dependent costs (escalation, seasonal variations)

1.3. Document cost driver relationships for each major line item. For example:
- Maintenance labor = (Number of technicians) x (Average loaded rate) x (Working hours)
- Spare parts consumption = f(Equipment count, Operating hours, Failure rates)
- Energy cost = (Production volume) x (Energy intensity) x (Energy price)

1.4. Validate base case totals against the latest approved budget. Reconcile any differences. The base case must be the agreed starting point for all scenarios.

1.5. Identify which parameters are scenario-variable (will change between scenarios) and which are scenario-fixed (same in all scenarios). Document the rationale.

### Step 2: Scenario Definition and Parameter Configuration

2.1. For **deterministic analysis**, define each named scenario:
- Provide a clear narrative description of the scenario
- Specify exact parameter overrides (quantified values, not ranges)
- Document the rationale and conditions under which this scenario would occur
- Ensure scenarios span the realistic range of outcomes (include at least optimistic, base, pessimistic)

2.2. For **sensitivity analysis**, configure the parameter sweep:
- Select parameters to vary (typically 10-15 key cost drivers)
- Define variation range (default +/- 20% of base case value, adjustable)
- Determine step size for variation (typically 5% increments)
- Hold all other parameters at base case values while varying each one

2.3. For **probabilistic analysis**, define distributions:
- For each uncertain parameter, specify distribution type (triangular, normal, lognormal, uniform, discrete)
- Specify distribution parameters (min/mode/max for triangular; mean/std dev for normal)
- Define correlations between parameters (e.g., commodity price and energy cost often correlated)
- Justify distribution choices with historical data or expert judgment (document basis)

2.4. Validate scenario parameters with domain experts:
- Staffing scenarios validated with Operations Agent (AG-002)
- Maintenance scenarios validated with Asset Management Agent (AG-003)
- Schedule scenarios validated with Execution Agent (AG-006)
- Contract/commercial scenarios validated with Contracts & Compliance Agent (AG-005)

### Step 3: Model Execution and Calculation

3.1. For **deterministic scenarios**, calculate each scenario by applying parameter overrides to the base case model:
- Recalculate each cost line item using the overridden parameters
- Apply cost driver relationships to propagate changes (e.g., if staffing changes, related costs such as training, PPE, and facilities also change)
- Calculate totals by category and overall for each scenario
- Calculate period-by-period cash flow for each scenario
- Calculate delta from base case (absolute and percentage)

3.2. For **sensitivity analysis**, execute the parameter sweep:
- For each selected parameter, vary from -range% to +range% in defined steps
- Hold all other parameters at base case values
- Record total cost outcome for each variation point
- Calculate sensitivity coefficient: % change in total cost / % change in parameter
- Rank parameters by absolute sensitivity coefficient (highest impact first)

3.3. For **probabilistic analysis**, execute Monte Carlo simulation:
- For each iteration, sample values from each parameter's distribution
- Apply correlations between sampled values
- Calculate total cost for the iteration using cost driver relationships
- Repeat for the specified number of iterations (default 10,000)
- Compile results into probability distribution
- Calculate percentile values (P10, P50, P90 and any additional requested levels)
- Identify which parameters contribute most to output variance (contribution to variance analysis)

3.4. Perform reasonableness checks on all results:
- No negative costs (unless modeled as savings)
- Totals within plausible range (compare to industry benchmarks)
- Relationships between scenarios are logical (pessimistic > base > optimistic)

### Step 4: Decision Analysis and Recommendation Formulation

4.1. For each decision being evaluated, structure the analysis:
- Define the decision options clearly
- Map each option to a scenario or set of scenarios
- Compare financial outcomes across options

4.2. Perform regret analysis:
- For each option, identify the worst-case scenario outcome
- Calculate "maximum regret" = difference between worst-case for chosen option and best outcome achievable if different option were chosen
- Identify the "minimax regret" option (minimizes maximum regret)

4.3. Assess risk-adjusted value:
- If probabilistic analysis was performed, compare P50 (expected) and P90 (risk case) across options
- Calculate the "risk premium" = P90 - P50 for each option
- Options with lower risk premium may be preferred even if P50 is slightly higher

4.4. Consider non-financial factors that may influence the decision:
- Schedule impact (coordinate with Execution Agent)
- Organizational capability impact (coordinate with Operations Agent)
- Regulatory or compliance constraints (coordinate with Contracts & Compliance Agent)
- Safety implications (coordinate with HSE Agent)
- Document these qualitative factors alongside financial analysis

4.5. Formulate recommendation with clear justification:
- State the recommended option/scenario
- Quantify the financial benefit of the recommendation
- Identify key risks to the recommendation
- Define trigger points or conditions that would warrant revisiting the decision

### Step 5: Report Compilation and Stakeholder Communication

5.1. Compile the full Scenario Comparison Report following the output specification structure.

5.2. Prepare visualization data:
- Scenario comparison bar charts (cost by category for each scenario)
- Tornado chart (sensitivity analysis ranking)
- Spider chart (multi-parameter sensitivity)
- Probability distribution histogram (Monte Carlo results)
- Cash flow profiles overlaid for each scenario

5.3. Create the assumptions register documenting every assumption in every scenario, including:
- Assumption description
- Base case value
- Scenario-specific values
- Source/justification
- Sensitivity rating (high/medium/low impact)

5.4. Document model limitations clearly:
- What is NOT modeled (second-order effects, behavioral responses)
- Where data quality limits confidence
- Time horizon limitations
- Structural model assumptions (linear relationships where non-linear may apply)

5.5. Prepare an executive summary tailored to the decision audience:
- Board/C-suite: Focus on total cost, risk exposure, and recommendation
- Project team: Focus on parameter details and implementation implications
- Client/owner: Focus on OPEX commitments and budget confidence levels

5.6. Submit report to Orchestrator for distribution.

5.7. Update Finance Agent state with scenario analysis results, recommended EAC scenario, and any open items requiring further data or validation.

## Quality Criteria

| Criterion | Weight | Target | Measurement Method |
|-----------|--------|--------|-------------------|
| Technical Accuracy | 30% | Model calculations verified; cost driver relationships correctly applied; statistical methods valid | Independent recalculation of key results; formula audit |
| Completeness | 25% | All requested scenarios modeled; all major cost categories included; sensitivity covers key drivers | Scenario checklist; cost category coverage verification |
| Consistency | 15% | Base case matches approved budget; assumptions consistent across scenarios; units and currency consistent | Reconciliation to baseline; cross-scenario assumption audit |
| Format | 10% | Professional report with clear charts; executive summary accessible to non-financial audience; VSC branding | Template compliance; readability review by non-finance reviewer |
| Actionability | 10% | Clear recommendation with quantified justification; decision options clearly differentiated; trigger points defined | Decision-maker feedback; recommendation specificity check |
| Traceability | 10% | Every assumption documented and sourced; calculation methodology transparent; data sources cited | Assumptions register completeness; methodology documentation review |
| **Total** | **100%** | **Composite score >= 91%** | **Weighted average of all criteria** |

## Inter-Agent Dependencies

### Dependencies FROM other agents (inputs needed)

| Agent | Agent ID | Information Required | Timing |
|-------|----------|---------------------|--------|
| Operations | AG-002 | Staffing models, training costs, operating assumptions, production forecasts | At model initiation; validated before finalization |
| Asset Management | AG-003 | Maintenance cost models, spare parts estimates, equipment reliability data | At model initiation |
| Execution | AG-006 | Schedule scenarios, construction cost estimates, commissioning cost models | At model initiation |
| Contracts & Compliance | AG-005 | Contract terms (escalation clauses, penalties), procurement price assumptions | At model initiation |
| HSE | AG-004 | HSE compliance cost estimates, environmental cost projections | At model initiation |
| Orchestrator | AG-001 | Approved base case reference, scenario requirements from stakeholders | At skill invocation |

### Dependencies TO other agents (outputs provided)

| Agent | Agent ID | Information Provided | Purpose |
|-------|----------|---------------------|---------|
| Orchestrator | AG-001 | Scenario comparison summary, recommendation, risk exposure quantification | Executive decision support, gate review input |
| Execution | AG-006 | Cost implications of schedule scenarios; budget contingency recommendations | Project controls and risk management |
| Operations | AG-002 | Financial impact of staffing alternatives; OPEX budget by operating scenario | Workforce planning and OPEX budget preparation |
| Asset Management | AG-003 | Financial comparison of maintenance strategies; lifecycle cost scenarios | Maintenance strategy selection |

### Finance Agent (AG-010) Internal Coordination
- This skill consumes variance data from `analyze-cost-variance` to calibrate model parameters to actual performance
- This skill feeds into `prepare-audit-package` for budget assumption documentation
- This skill consumes CAPEX authorization data from `track-capex-authorizations` for investment scenario modeling
- Scenario results may trigger re-execution of `analyze-cost-variance` if EAC is revised

## References

- **AACE International Recommended Practice 18R-97**: Cost Estimate Classification System
- **AACE RP 40R-08**: Contingency Estimating - General Principles
- **AACE RP 41R-08**: Risk Analysis and Contingency Determination Using Range Estimating
- **AACE RP 44R-08**: Risk Analysis and Contingency Determination Using Expected Value
- **PMI Practice Standard for Project Estimating** (2nd Edition)
- **ISO 31000:2018**: Risk Management - Guidelines
- **VSC OR Knowledge Base v2.0**: Section on OPEX Modeling and Financial Scenario Planning
- **VSC Quality Assurance Framework**: Deliverable scoring methodology (6 dimensions)
- **Damodaran, A.**: Strategic Risk Taking: A Framework for Risk Management (reference for decision analysis under uncertainty)
- **ISO 55010:2019**: Asset Management - Guidance on alignment of financial and non-financial functions

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-25 | VSC OR System | Initial skill creation for Finance & Accounting agent domain |
