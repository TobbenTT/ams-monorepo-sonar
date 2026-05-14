---
name: model-opex-budget
description: "Develop bottom-up OPEX budget model for plant operations. Produces detailed cost estimates. Triggers: 'OPEX budget', 'operating budget', 'presupuesto operativo', 'modelo OPEX'."
---

# Model OPEX Budget

## Skill ID: B-OPEX-008

## Version: 1.0.0

## Category: B. Analysis & Modeling

## Priority: P1 - Critical (core deliverable for O&M contract pricing and operational planning)

---

## Purpose

Build comprehensive OPEX budget models for industrial Operations & Maintenance (O&M), covering staffing, maintenance, contracts, consumables, energy, and administrative costs. This skill produces a three-statement-style financial model adapted for industrial OPEX, enabling accurate cost estimation, budget allocation, variance tracking, and multi-year projection for asset-intensive operations.

---

## Intent & Specification

This skill enables the AI agent to:

1. **Structure** a comprehensive O&M OPEX budget following a standardized cost breakdown structure.
2. **Calculate** staffing costs with full burden rates (salary, benefits, overtime, training, PPE).
3. **Estimate** maintenance costs by strategy type (preventive, corrective, predictive, overhauls).
4. **Model** contract costs (specialized services, OEM support, outsourced functions).
5. **Project** consumable, energy, and utility costs based on operating parameters.
6. **Generate** multi-year budget projections with escalation and sensitivity.
7. **Deliver** a structured `.xlsx` budget model with summary, detail, and variance tracking.

---

## Trigger / Invocation

**Command:** `/model-opex-budget`

**Trigger Conditions:**
- User requests OPEX budget, O&M cost estimate, or operational cost model.
- A project needs cost estimation for O&M contract pricing.
- Annual budget preparation requires structured cost modeling.
- Feasibility study needs operational cost projections.

**Aliases:**
- `/opex-model`
- `/om-budget`
- `/operational-budget`

---

## Input Requirements

### Required Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `staffing_plan` | `.xlsx` or text | Organizational structure: roles, headcount, shift patterns, salary ranges |
| `maintenance_costs` | `.xlsx` or text | Maintenance cost elements: PM, CM, predictive, overhauls, materials |
| `operating_parameters` | Text | Plant capacity, utilization, operating hours/year, production volume |

### Optional Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `contract_costs` | `.xlsx` | Third-party contracts: scope, rates, duration |
| `consumables_data` | `.xlsx` | Consumable materials: types, consumption rates, unit costs |
| `energy_data` | `.xlsx` or text | Energy consumption: kWh, fuel, rates, demand charges |
| `equipment_list` | `.xlsx` | Equipment inventory with maintenance requirements |
| `historical_budget` | `.xlsx` | Previous year's budget for comparison and calibration |
| `escalation_assumptions` | `.xlsx` or text | Inflation rates by cost category, labor escalation |
| `currency` | Text | Budget currency (default: USD) |
| `budget_period` | Text | Annual, multi-year, or monthly detail required |
| `ramp_up_schedule` | `.xlsx` or text | For new operations: ramp-up timeline to steady state |
| `risk_contingency` | Number | Contingency percentage to apply |

### Input Validation Rules

1. Staffing plan must include at minimum: role titles, headcount, and base salary/rate.
2. Operating parameters must specify operating hours/year and plant capacity.
3. If multi-year projection, escalation assumptions must be provided or defaults confirmed.
4. Currency must be specified for all monetary values.

---

## Output Specification

### Primary Output: OPEX Budget Model (`.xlsx`)

**File naming:** `{project_code}_OPEX_budget_model_{YYYYMMDD}.xlsx`

**Workbook structure:**

| Sheet | Content |
|-------|---------|
| `Executive Summary` | Total OPEX, per-unit cost, major cost categories, year-over-year comparison |
| `Budget Dashboard` | Visual summary with charts: cost breakdown, trend, variance |
| `Staffing Detail` | Full staffing model with burden rate calculations |
| `Maintenance Detail` | Maintenance budget by type, system, and cost element |
| `Contracts Detail` | Third-party service contracts breakdown |
| `Consumables Detail` | Consumable materials budget |
| `Energy & Utilities` | Energy cost model with consumption and rate assumptions |
| `Administrative & Other` | Insurance, IT, office, travel, training, miscellaneous |
| `Multi-Year Projection` | 3-5 year projection with escalation |
| `Monthly Phasing` | Monthly budget allocation/phasing |
| `Sensitivity Analysis` | Impact of key variable changes on total OPEX |
| `Assumptions` | All assumptions documented with sources |
| `Comparison` | Budget vs. historical/actual (if previous data provided) |

### Executive Summary - Key Metrics

| Metric | Description |
|--------|-------------|
| `Total Annual OPEX` | Sum of all operating cost categories |
| `Fixed OPEX` | Costs that do not vary with production volume |
| `Variable OPEX` | Costs that vary with production volume |
| `Unit Cost` | OPEX per unit of production (e.g., USD/ton, USD/m3) |
| `Staffing Cost` | Total personnel cost (% of total OPEX) |
| `Maintenance Cost` | Total maintenance cost (% of total OPEX) |
| `Energy Cost` | Total energy/utility cost (% of total OPEX) |
| `Cost per Employee` | Total OPEX / total headcount |
| `Maintenance Cost / RAV` | Maintenance as % of replacement asset value |

### Staffing Detail - Column Structure

| Column | Description |
|--------|-------------|
| `Department` | Organizational department |
| `Role/Position` | Job title |
| `Level/Grade` | Compensation level |
| `Headcount` | Number of positions |
| `Shift Pattern` | Day, rotating, 24/7, etc. |
| `Base Salary (monthly)` | Base monthly compensation |
| `Annual Base Salary` | Base x 12 (or per labor law) |
| `Benefits & Social Charges` | Health, pension, insurance (% of base) |
| `Overtime Allowance` | Estimated overtime cost |
| `Shift Premiums` | Night shift, weekend, holiday premiums |
| `Training Budget` | Per-person training allocation |
| `PPE & Uniforms` | Personal protective equipment cost |
| `Travel & Subsistence` | Travel costs per person |
| `Total Burden Rate` | Multiplier on base salary for fully loaded cost |
| `Total Annual Cost` | Fully loaded annual cost per position |
| `Total Cost (Headcount)` | Total annual cost x headcount |

---

## Methodology & Standards

### OPEX Cost Breakdown Structure (CBS)

```
Level 1: Total OPEX
  Level 2: Personnel Costs (typically 35-50% of OPEX)
    Level 3: Operations Staff
    Level 3: Maintenance Staff
    Level 3: Management & Administration
    Level 3: HSE & Quality
    Level 3: Support Functions
  Level 2: Maintenance Costs (typically 20-35% of OPEX)
    Level 3: Preventive Maintenance (materials + labor)
    Level 3: Corrective Maintenance (materials + labor)
    Level 3: Predictive/Condition Monitoring
    Level 3: Major Overhauls / Turnarounds
    Level 3: Workshop & Tools
  Level 2: Contract Services (typically 10-20% of OPEX)
    Level 3: Specialized Maintenance Contracts
    Level 3: OEM Service Agreements
    Level 3: Outsourced Services
    Level 3: Consulting & Technical Support
  Level 2: Consumables & Materials (typically 5-15% of OPEX)
    Level 3: Process Consumables (chemicals, reagents, media)
    Level 3: Lubricants & Fluids
    Level 3: General Supplies
  Level 2: Energy & Utilities (typically 15-30% of OPEX)
    Level 3: Electrical Energy
    Level 3: Fuel (diesel, gas)
    Level 3: Water
    Level 3: Compressed Air / Gases
  Level 2: Administrative & Overhead (typically 5-10% of OPEX)
    Level 3: Insurance
    Level 3: IT & Communications
    Level 3: Office & Facilities
    Level 3: Travel & Transportation
    Level 3: Regulatory Compliance
    Level 3: Contingency
```

### Staffing Cost Methodology

#### Burden Rate Calculation (Chile/Latin America typical)

| Component | Typical Range | Description |
|-----------|---------------|-------------|
| Base Salary | 100% | Gross monthly salary x 12 + bonuses |
| Social Charges | 20-30% | Pension, health, unemployment insurance |
| Gratification Legal | 4.75 months cap | Chilean legal benefit (25% of salary, capped) |
| Vacation Provision | 6-8% | Accrued vacation cost |
| Severance Provision | 5-8% | Indemnity provision (1 month/year) |
| Benefits (other) | 5-15% | Meal allowance, transport, housing, etc. |
| Training | 2-5% | Annual training investment per person |
| PPE & Uniforms | 1-3% | Safety gear, uniforms, tools |
| **Total Burden Multiplier** | **1.40 - 1.70** | **Applied to base annual salary** |

#### Shift Pattern Cost Impact

| Pattern | Crew Factor | Premium Impact |
|---------|-------------|----------------|
| Day shift (5x2) | 1.0 | None |
| 2-shift (morning + afternoon) | 2.0 | +5-10% |
| 3-shift (24h, 5 days) | 3.3 | +15-20% |
| 4x3 continuous (24/7) | 4.0-4.3 | +25-35% |
| 7x7 or 14x14 roster | 2.0-2.2 | +15-25% (+ travel/camp) |

### Maintenance Cost Estimation Methods

1. **Bottom-up (preferred):** Build from equipment list x maintenance tasks x frequencies x unit costs.
2. **Parametric:** Apply industry-standard percentages of Replacement Asset Value (RAV).
3. **Historical:** Use historical actuals adjusted for scope and inflation.
4. **Benchmarked:** Apply industry benchmark unit costs (e.g., USD/ton, USD/operating hour).

### Maintenance Cost Benchmarks (% of RAV)

| Industry | Q1 (Best) | Median | Q3 (Worst) |
|----------|-----------|--------|------------|
| Mining | 2.0-3.0% | 3.5-4.5% | 5.0-7.0% |
| Oil & Gas | 1.5-2.5% | 3.0-4.0% | 4.5-6.0% |
| Power Generation | 1.5-2.5% | 2.5-3.5% | 4.0-5.0% |
| Water Treatment | 2.0-3.0% | 3.0-4.0% | 4.5-6.0% |
| Manufacturing | 1.5-2.5% | 2.5-3.5% | 4.0-5.5% |

### Escalation Methodology

```
Cost_year_n = Cost_base * (1 + escalation_rate)^n

Differential escalation by category:
- Labor: CPI + 1-2% (wage inflation typically exceeds general inflation)
- Energy: Energy-specific inflation index (historically more volatile)
- Materials/Spare parts: PPI (Producer Price Index) or commodity-linked
- Contracts: CPI or contract-specific escalation clauses
- Insurance: Insurance market cycle adjusted
```

---

## Step-by-Step Execution

### Phase 1: Structure & Input (Steps 1-3)

**Step 1: Define budget scope and structure.**
- Confirm operational scope (what activities/assets are included).
- Establish the cost breakdown structure (CBS).
- Confirm currency, budget period, and reporting format.
- Identify fixed vs. variable cost elements.

**Step 2: Build staffing model.**
- Structure organizational chart by department/function.
- Assign headcount, salary grades, and shift patterns.
- Calculate fully loaded labor cost per role (burden rate applied).
- Apply shift premiums and overtime estimates.
- Sum to total staffing cost by department.

**Step 3: Build maintenance cost model.**
- If bottom-up: list maintenance tasks x frequencies x unit costs per equipment.
- If parametric: apply % of RAV by maintenance type.
- Separate PM, CM, predictive, and overhaul costs.
- Include spare parts inventory carrying costs.
- Include workshop, tools, and equipment costs.

### Phase 2: Cost Modeling (Steps 4-6)

**Step 4: Model contract and service costs.**
- List all third-party contracts with scope, duration, and annual cost.
- Separate fixed-fee from variable/unit-rate contracts.
- Include OEM support agreements.
- Add consulting and technical support allowances.

**Step 5: Model consumables and energy.**
- Calculate consumable consumption from operating parameters (e.g., reagent consumption per ton processed).
- Model energy cost from power demand, consumption profile, and tariff structure.
- Include fuel costs for mobile equipment and generators.
- Model water consumption and costs.

**Step 6: Model administrative and overhead costs.**
- Estimate insurance premiums based on asset value and risk profile.
- Include IT, communications, and cybersecurity costs.
- Add office supplies, facilities maintenance, and general overhead.
- Include regulatory compliance costs (permits, audits, monitoring).
- Apply contingency (typically 5-10% of total OPEX).

### Phase 3: Consolidation & Output (Steps 7-9)

**Step 7: Consolidate and reconcile.**
- Sum all cost categories to total OPEX.
- Calculate unit cost (OPEX per unit of production).
- Compare total against benchmarks for reasonableness.
- Identify fixed vs. variable cost split.
- Create monthly phasing based on seasonal patterns and overhaul schedules.

**Step 8: Multi-year projection.**
- Apply escalation rates to project 3-5 year OPEX trajectory.
- Include ramp-up effects for new operations (Year 1 may differ from steady state).
- Model step changes (e.g., major overhaul years, contract renewals).
- Present NPV of multi-year OPEX stream.

**Step 9: Sensitivity analysis and output.**
- Test sensitivity to top 5 cost drivers (+/-10-20%).
- Identify break-even production volume (where unit cost meets target).
- Build complete workbook with all sheets.
- Generate executive summary with key metrics and insights.

---

## Quality Criteria

### Accuracy
- [ ] Burden rates correctly calculated and applied to all personnel.
- [ ] Shift patterns correctly reflected in staffing costs.
- [ ] Maintenance costs align with equipment list and maintenance strategy.
- [ ] Energy costs consistent with installed power and utilization.
- [ ] Escalation correctly applied in multi-year projections.

### Completeness
- [ ] All cost categories in the CBS are addressed (even if zero, justified).
- [ ] Assumptions sheet documents every key assumption.
- [ ] Contingency is included and justified.
- [ ] Monthly phasing accounts for seasonal and overhaul effects.

### Reasonableness
- [ ] Total OPEX / ton (or unit) is within industry benchmark range.
- [ ] Staffing cost as % of OPEX is within expected range (35-50%).
- [ ] Maintenance cost as % of RAV is within benchmark range.
- [ ] Unit costs pass "sanity check" against comparable operations.

### Usability
- [ ] Model is user-friendly: clear labels, organized structure, input cells highlighted.
- [ ] Key assumptions can be changed to update the entire model.
- [ ] Executive summary provides quick overview of budget.
- [ ] Model can serve as a living document for budget tracking.

---

## MCP Integrations

- **project-database**: Store and retrieve budget model parameters, cost breakdown structures, and multi-year projection data
- **mcp-sharepoint**: Access input documents (staffing plans, equipment lists) and store finalized OPEX budget workbooks
- **mcp-outlook**: Send budget review notifications and distribute draft models to stakeholders for approval

## Inter-Agent Dependencies

### Upstream Dependencies

| Agent/Skill | Data Received | Purpose |
|-------------|---------------|---------|
| `analyze-equipment-criticality` (B-CRIT-001) | Equipment criticality tiers | Criticality-driven maintenance frequency |
| `analyze-reliability` (B-REL-004) | Failure rates, MTTR | CM cost estimation |
| `model-ram-simulation` (B-RAM-007) | Maintenance frequencies from simulation | Bottom-up maintenance cost input |
| `extract-data-from-docs` (C-EXT-014) | Equipment data from datasheets | Equipment-level cost estimation |

### Downstream Consumers

| Agent/Skill | Data Provided | Purpose |
|-------------|---------------|---------|
| `analyze-lifecycle-cost` (B-LCC-003) | Annual OPEX projections | LCC OPEX component |
| `analyze-scenarios` (B-SCEN-002) | Budget parameters for sensitivity | Scenario analysis |
| `create-client-presentation` (C-PRES-012) | Budget summary and charts | Client deliverable |
| `create-weekly-report` (C-WEEK-001) | Budget development progress | Progress reporting |

---

## Templates & References

### Templates
- `templates/opex_budget_template.xlsx` - Standard OPEX budget workbook.
- `templates/staffing_model_template.xlsx` - Staffing cost calculation template.
- `templates/maintenance_cost_template.xlsx` - Maintenance cost estimation template.
- `templates/burden_rate_calculator_chile.xlsx` - Chilean labor burden rate calculator.

### Reference Documents
- VSC internal: "Modelo de Presupuesto OPEX O&M v3.0"
- VSC internal: "Guia de Estimacion de Costos de Mantenimiento"
- AACE International Classification System for Cost Estimate
- Chilean Labor Code (Codigo del Trabajo) for labor cost regulations

---

## Examples

### Example 1: Desalination Plant O&M Budget

**Input:**
- Plant: 100,000 m3/day SWRO desalination.
- Staffing: 45 FTE (operations 20, maintenance 15, management 5, HSE 3, admin 2).
- Maintenance: 2% of RAV (USD 200M plant), plus membrane replacement.
- Energy: 3.5 kWh/m3, rate USD 0.08/kWh.

**Expected Output:**
- Total Annual OPEX: USD 15.2M
  - Staffing: USD 4.8M (32%)
  - Energy: USD 10.2M (67%) -- note: energy-intensive process
  - Maintenance: USD 4.0M (26%)
  - Chemicals: USD 2.1M (14%)
  - Contracts: USD 1.5M (10%)
  - Admin/Other: USD 0.6M (4%)
  - Note: percentages exceed 100% due to energy dominance; adjusted to proper allocation.
- Unit cost: USD 0.42/m3 (benchmark range for LATAM: USD 0.40-0.65/m3).
- 5-year projection: USD 15.2M to USD 17.8M (3.2% annual escalation).

### Example 2: Mining Concentrator O&M Budget

**Input:**
- Concentrator: 50,000 TPD copper, SAG-Ball-Flotation-Thickening.
- Staffing: 120 FTE (4x3 continuous roster).
- Equipment RAV: USD 350M.
- Energy: 22 kWh/ton processed, rate USD 0.07/kWh.

**Expected Output:**
- Total Annual OPEX: USD 42.5M
  - Staffing: USD 16.8M (40%)
  - Maintenance: USD 12.3M (29%, 3.5% of RAV)
  - Energy: USD 28.1M (66%) -- energy dominates
  - Consumables (reagents, grinding media): USD 8.4M (20%)
  - Contracts: USD 3.2M (8%)
  - Admin/Other: USD 1.8M (4%)
- Unit cost: USD 2.33/ton processed.
- Sensitivity: +10% energy cost = +USD 2.8M/year (+6.6%).
