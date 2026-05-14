---
name: track-cost-centers
description: "Track cost center allocations, overhead distribution, and departmental cost structures for industrial O&M operations. Triggers: 'cost center tracking', 'overhead allocation', 'seguimiento de centros de costo'."
---

# Track Cost Centers

## Skill ID: track-cost-centers

## Version: 1.0.0

## Category: C - Tracking

## Priority: Medium

---

## Purpose

Establish and maintain a structured cost center framework for industrial operations, enabling accurate allocation of direct costs, overhead distribution, and departmental cost tracking across plant functions. This skill produces a living cost center register linked to the organizational structure, chart of accounts, and ERP system (SAP CO/FI or equivalent), providing the Finance & Accounting agent with granular visibility into where costs originate, how they are allocated, and whether departments are operating within budget.

Cost center management is a foundational capability for any industrial operation transitioning from capital project to steady-state operations. During the Operational Readiness phase (typically OR Levels 3-5), the cost center structure must be designed, approved, loaded into the ERP, and tested before the first operational transaction occurs. Failure to establish cost centers properly results in misposted expenses, unreliable management reports, delayed month-end closes, and audit findings. Industry data indicates that 25-35% of first-year operational accounting corrections in new plants stem from incorrect cost center assignments or missing allocation rules.

This skill integrates with the broader Finance & Accounting agent workflow by providing the cost center master data that feeds into OPEX budgeting (model-opex-budget), project expenditure tracking (track-project-expenditures), management accounts (generate-management-accounts), and period-end reconciliation (reconcile-financial-records). It also coordinates with the Operations agent for organizational design alignment and the Orchestrator for OR gate readiness reporting.

---

## Intent & Specification

The AI agent MUST understand that:

1. **Cost center design** must mirror the approved organizational structure exactly -- every department, section, and crew in the org chart must map to at least one cost center in the ERP system, and no cost center should exist without a responsible manager.
2. **Overhead allocation** requires transparent, auditable allocation bases (e.g., headcount, square meters, direct labor hours, kWh consumed) that are agreed upon by all receiving cost centers before the first allocation run.
3. **Activity-based costing (ABC)** elements should be incorporated where the operation has significant shared services (maintenance workshops, laboratories, warehouse operations) to avoid distorted product or department costing.
4. **Hierarchy compliance** demands that cost centers follow the corporate group structure (company code > controlling area > cost center group > cost center) and comply with any parent company reporting requirements for consolidation.
5. **Budget integration** means every cost center must have an approved annual budget loaded before the fiscal year begins, with monthly phasing that reflects seasonal patterns, shutdown periods, and ramp-up trajectories.
6. **Variance monitoring** must be continuous -- the skill tracks actual vs. budget at the cost center level monthly, generates variance explanations for deviations exceeding materiality thresholds (typically 5% or USD 10,000), and escalates persistent overruns.
7. **Audit readiness** requires that every cost posting is traceable to a cost center, every allocation has documented methodology, and the cost center master data is reconciled quarterly against the organizational chart.

---

## Trigger / Invocation

### Natural Language Triggers

**English:**
- "Set up cost centers for the new plant operation"
- "Track cost center performance against budget"
- "Design the overhead allocation model for our shared services"
- "Review departmental cost variances for this month"

**Spanish:**
- "Configurar los centros de costo para la nueva operacion"
- "Hacer seguimiento de costos por centro de costo"
- "Disenar el modelo de distribucion de gastos generales"

**Command:** `/track-cost-centers`

**Aliases:**
- `/cost-center-tracker`
- `/overhead-allocation`
- `/centros-de-costo`

---

## Input Requirements

### Required Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `organizational_chart` | `.xlsx`, `.pdf`, or text | Approved org structure with departments, sections, reporting lines, and headcount |
| `chart_of_accounts` | `.xlsx` | General ledger account structure with cost element mapping (natural accounts) |
| `budget_data` | `.xlsx` | Approved annual budget by cost center and cost element, with monthly phasing |
| `erp_configuration` | Text or `.xlsx` | ERP system details: company code, controlling area, fiscal year variant, currency |

### Optional Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `allocation_rules` | `.xlsx` or text | Existing overhead allocation methodology and bases |
| `historical_actuals` | `.xlsx` | Prior period actual costs by cost center (for comparison and trend analysis) |
| `corporate_reporting_template` | `.xlsx` | Parent company consolidation structure and reporting requirements |
| `shared_services_catalog` | `.xlsx` | List of shared service functions with cost drivers and service level agreements |
| `activity_rates` | `.xlsx` | Standard activity rates for internal service allocations (e.g., maintenance hour rate, lab test rate) |
| `sap_co_master_data` | `.xlsx` | Existing SAP Controlling master data extract for validation |

### Context Enrichment

The agent should automatically retrieve:
- Current organizational design from the Operations agent (`create-org-design` skill output)
- OPEX budget model from the Execution agent (`model-opex-budget` skill output)
- Project cost breakdown structure from the Execution agent for CAPEX/OPEX boundary alignment
- Corporate accounting policies from the Contracts & Compliance agent

---

## Output Specification

### Primary Output: Cost Center Register & Tracker (`.xlsx`)

**File naming:** `{project_code}_cost_center_register_{YYYYMMDD}.xlsx`

**Workbook structure:**

| Sheet | Content |
|-------|---------|
| `Dashboard` | Cost center count, total budget, YTD actuals, variance summary, traffic light status per department |
| `Cost Center Master` | Complete cost center register: ID, name, responsible manager, department, cost center group, company code, status |
| `Hierarchy Map` | Visual hierarchy: controlling area > cost center group > cost center, with roll-up totals |
| `Budget vs Actual` | Monthly and YTD budget vs. actual by cost center, with variance (absolute and percentage) |
| `Overhead Allocation` | Allocation rules: sender cost center, receiver cost centers, allocation base, rates, monthly amounts |
| `Activity-Based Costing` | Activity types, planned rates, actual rates, volume variances, rate variances |
| `Variance Analysis` | Detailed variance explanations for cost centers exceeding materiality threshold |
| `Reconciliation Log` | Quarterly reconciliation of cost center master vs. org chart, with discrepancies flagged |
| `Assumptions & Policies` | Allocation methodology documentation, materiality thresholds, escalation rules |

### Secondary Output: Monthly Cost Center Report (`.docx`)

**File naming:** `{project_code}_cost_center_report_{period}_{YYYYMMDD}.docx`

Report sections:
1. Executive summary with overall cost performance
2. Top 5 cost centers by variance (favorable and unfavorable)
3. Overhead allocation summary with sender/receiver balances
4. Trend analysis (rolling 3-month and YTD)
5. Action items for budget overruns
6. Recommendations for reallocation or budget adjustments

---

## Methodology & Standards

### Cost Center Numbering Convention

```
Format: {Site}{Department}{Sequence}
Example: 1000-4100-001

Site Codes:
  1000 = Plant Site 1 (primary operation)
  2000 = Plant Site 2 (expansion)
  9000 = Corporate / Head Office

Department Codes:
  1xxx = Plant Management
  2xxx = Operations (production)
  3xxx = Maintenance
  4xxx = HSE & Quality
  5xxx = Warehouse & Logistics
  6xxx = Administration & Finance
  7xxx = Human Resources
  8xxx = IT & Communications
  9xxx = Shared Services / Overhead
```

### Overhead Allocation Hierarchy

Overhead allocation follows a sequential cycle to avoid circular references:

```
Cycle 1: Facility costs allocated by area (m2)
  -> Canteen, security, cleaning distributed to all departments

Cycle 2: Support function costs allocated by headcount
  -> HR, IT, General Admin distributed to operating departments

Cycle 3: Internal service costs allocated by activity
  -> Workshop hours to maintenance cost centers
  -> Lab tests to operations cost centers
  -> Warehouse issues to all requesting cost centers

Cycle 4: Management overhead allocated by total direct cost
  -> Plant management distributed proportionally
```

### Variance Classification Framework

| Variance Type | Definition | Typical Cause | Response |
|---------------|-----------|---------------|----------|
| Price Variance | Actual unit price differs from budget | Market rate changes, supplier negotiation | Procurement review, budget adjustment |
| Volume Variance | Actual quantity differs from budget | Production schedule changes, unplanned work | Operations review, forecast update |
| Efficiency Variance | Actual hours differ from standard | Skill gaps, equipment condition, procedures | Training, process improvement |
| Timing Variance | Cost recognized in different period than budget | Invoice delays, accrual estimates | Accrual correction, phasing adjustment |
| Classification Variance | Cost posted to wrong cost center | Posting errors, unclear guidelines | Reclassification, training |

### Industry Benchmarks for Overhead Ratios

| Overhead Category | Mining | Oil & Gas | Power Generation | Water Treatment |
|-------------------|--------|-----------|------------------|-----------------|
| Admin as % of Total OPEX | 5-8% | 4-7% | 5-9% | 6-10% |
| HR cost per FTE (annual) | USD 800-1,500 | USD 1,000-2,000 | USD 900-1,600 | USD 700-1,200 |
| IT cost per FTE (annual) | USD 1,200-2,500 | USD 2,000-4,000 | USD 1,500-3,000 | USD 1,000-2,000 |
| Warehouse overhead as % of inventory value | 15-25% | 12-20% | 10-18% | 12-22% |

---

## Procedure

### Step 1: Design Cost Center Structure

1. Map the approved organizational chart to a cost center hierarchy.
2. Assign unique cost center IDs following the corporate numbering convention (e.g., 4-digit numeric with prefix for plant/site).
3. Define cost center groups for roll-up reporting (e.g., Operations, Maintenance, HSE, Administration).
4. Assign a responsible manager to each cost center (mandatory -- no orphan cost centers).
5. Validate that every position in the staffing plan maps to exactly one primary cost center.
6. Document the hierarchy in the "Hierarchy Map" sheet.

### Step 2: Configure Overhead Allocation Model

1. Identify all shared service / overhead cost centers (e.g., plant management, HR, IT, warehouse, workshop, laboratory).
2. For each overhead cost center, define the allocation base:
   - Headcount-based: HR, canteen, PPE, general admin
   - Area-based (m2): facilities, cleaning, security
   - Direct labor hours: workshop, maintenance supervision
   - Activity-based: lab tests performed, work orders completed, warehouse issues
   - kWh consumed: electrical distribution, compressed air
3. Calculate allocation rates based on budgeted volumes and costs.
4. Configure allocation cycles (assessment vs. distribution) in the ERP.
5. Document all allocation rules with rationale in the "Assumptions & Policies" sheet.
6. Obtain sign-off from all receiving department managers.

### Step 3: Load Budget and Establish Baselines

1. Load the approved annual budget into the cost center register by cost element and month.
2. Validate that total cost center budgets reconcile to the approved OPEX budget model.
3. Ensure monthly phasing reflects operational patterns (e.g., shutdown months have higher maintenance, lower production costs).
4. Set materiality thresholds for variance reporting:
   - Absolute: variances > USD 10,000 (or local currency equivalent)
   - Relative: variances > 5% of monthly budget
   - Cumulative: YTD variances > 3% of YTD budget
5. Configure automated variance alerts in the tracking workbook.

### Step 4: Execute Monthly Tracking Cycle

1. Extract actual cost postings from the ERP by cost center and cost element (monthly close).
2. Run overhead allocation cycles and verify allocation results.
3. Calculate variances (actual minus budget) for each cost center.
4. For variances exceeding materiality thresholds:
   - Investigate root cause (timing difference, price variance, volume variance, misposting)
   - Document explanation in the Variance Analysis sheet
   - Classify as controllable or uncontrollable
   - Assign corrective action owner and due date
5. Update the Dashboard with current period status.

### Step 5: Reconcile and Report

1. Reconcile cost center master data against the current organizational chart (quarterly).
2. Flag any discrepancies: new positions without cost centers, inactive cost centers with postings, misaligned reporting lines.
3. Generate the monthly Cost Center Report (`.docx`).
4. Present top variances and recommendations to the Finance Manager.
5. Feed cost center performance data to the generate-management-accounts skill for P&L reporting.
6. Update cost center status in the OR gate review package (procurement/finance readiness dimension).
7. Archive the period report and update the reconciliation log.

---

## Quality Criteria

| Criterion | Weight | Target | Description |
|-----------|--------|--------|-------------|
| Technical Accuracy | 30% | >95% | Cost center IDs, hierarchy, and allocations match ERP configuration and org chart exactly |
| Completeness | 25% | 100% | Every department has a cost center; every allocation rule is documented; all budget lines loaded |
| Consistency | 15% | 100% | Cost center totals reconcile to OPEX budget; allocation bases sum correctly; no duplicate postings |
| Format | 10% | Professional | VSC branding, consistent formatting, conditional formatting for variances, print-ready |
| Actionability | 10% | >90% | Variance explanations include root cause and corrective action; report is usable without rework |
| Traceability | 10% | 100% | Every allocation rule has documented methodology and approval; every variance has an explanation |

---

## Inter-Agent Dependencies

### Upstream Dependencies

| Agent/Skill | Data Received | Purpose |
|-------------|---------------|---------|
| Operations / `create-org-design` | Organizational chart | Cost center structure must mirror org design |
| Execution / `model-opex-budget` | Approved OPEX budget | Budget loading by cost center and cost element |
| Contracts & Compliance / `audit-compliance-readiness` | Corporate accounting policies | Allocation methodology must comply with group policies |
| Orchestrator / `create-or-plan` | OR timeline and milestones | Cost center readiness gates and deadlines |

### Downstream Consumers

| Agent/Skill | Data Provided | Purpose |
|-------------|---------------|---------|
| Finance & Accounting / `generate-management-accounts` | Cost center actuals and allocations | Management P&L by department |
| Finance & Accounting / `track-project-expenditures` | Cost center vs. project cost reconciliation | Ensure no double-counting between OPEX and CAPEX |
| Finance & Accounting / `reconcile-financial-records` | Cost center balances | Period-end reconciliation inputs |
| Execution / `model-opex-budget` | Variance analysis and trends | Budget revision and forecasting inputs |
| Orchestrator / `generate-or-gate-review` | Finance readiness status | Gate review package data |

---

## References

### Standards & Frameworks
- IAS 1 / IFRS - Presentation of Financial Statements (cost classification requirements)
- SAP S/4HANA Controlling (CO) module - Cost Center Accounting configuration guide
- AACE International - Cost Engineering Terminology (AACE RP 10S-90)
- Chilean tax authority (SII) - Cost center documentation requirements for transfer pricing

### Templates
- `templates/cost_center_register_template.xlsx` - Standard cost center master data template
- `templates/overhead_allocation_model.xlsx` - Allocation configuration workbook
- `templates/variance_analysis_template.xlsx` - Monthly variance reporting template
- `templates/cost_center_report_template.docx` - Monthly narrative report template

### VSC Internal References
- VSC Knowledge Base: "Estructura de Centros de Costo para Operaciones Industriales v2.0"
- VSC Knowledge Base: "Modelo de Distribucion de Gastos Generales - Mejores Practicas"
- VSC OR Methodology: Level 4 (Systems & Processes) - Finance readiness requirements

---

## Examples

### Example 1: Copper Concentrator Plant -- Cost Center Setup

**Input:**
- Plant: 50,000 TPD copper concentrator, 4x3 continuous roster.
- Organization: 120 FTE across 6 departments (Operations, Maintenance, HSE, Warehouse, Admin, Plant Management).
- ERP: SAP S/4HANA, company code CL01, controlling area 1000.
- Total OPEX budget: USD 42.5M annually.

**Expected Output:**
- 18 cost centers created across 6 department groups.
- 4 overhead cost centers (Plant Management, HR, IT, Warehouse) with defined allocation bases.
- Budget loaded with monthly phasing reflecting 2 planned shutdowns (April, October).
- Dashboard showing Green status for all cost centers at baseline.

### Example 2: Monthly Variance Report -- Mining Operation

**Input:**
- Period: March 2025, Month 3 of operations.
- Actuals extracted from SAP CO: total USD 3.8M vs. budget USD 3.5M.
- Key variances: Maintenance cost center 3100 at USD 450K vs. budget USD 280K.

**Expected Output:**
- Overall status: Yellow (8.6% over budget).
- Root cause analysis: unplanned corrective maintenance on SAG mill liner failure (USD 170K classified as uncontrollable volume variance).
- Recommendation: review PM frequency for mill liners; adjust forecast for remaining year.
- 3 action items assigned with owners and due dates.

---

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-02-25 | VSC Product Team | Initial skill definition for Finance & Accounting agent |
