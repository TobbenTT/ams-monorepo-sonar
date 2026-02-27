# How-To Guide: Analyst

**Role**: Analyst
**Modules**: Analytics, Reliability Engineering, Reporting, Defect Elimination
**Pages**: Page 5 (Analytics), Page 13 (Reliability Engineering), Page 15 (Reports & Data), Page 17 (Defect Elimination)

## Role Description

Analysts are responsible for monitoring equipment health, tracking KPIs, predicting failures using Weibull analysis, identifying bad actors through Jack-Knife and Pareto analyses, reviewing planning and defect elimination KPIs, generating reports, and conducting root cause analyses. They transform data into actionable insights for maintenance optimization.

---

## Prerequisites

| Requirement | Details |
|---|---|
| API server running | `uvicorn api.main:app --reload` on `http://localhost:8000` |
| Streamlit app running | `streamlit run streamlit_app/Home.py` on `http://localhost:8501` |
| Database seeded | Full seed data including equipment hierarchy, failure modes, and work orders |
| Historical data | Failure intervals and work order history for Weibull and KPI calculations |
| Domain knowledge | Understanding of reliability engineering metrics (MTBF, MTTR, OEE, Weibull) |

---

## User Story AN-01: View Equipment Health Scores

**Goal**: Calculate and visualize the composite health score for a specific piece of equipment based on criticality, backlog, and strategy coverage.

### Step-by-Step Instructions

1. **Navigate to Page 5 -- Analytics**
   - Open the Streamlit sidebar and click **Analytics**.
   - The page has three tabs: **Asset Health**, **KPIs**, and **Weibull**.

2. **Select Equipment (Asset Health Tab)**
   - The **Asset Health** tab is selected by default.
   - Use the **Select Equipment** dropdown to choose an equipment item.

3. **Configure Health Parameters (left column)**
   - **Risk Class**: Select the equipment's criticality class:
     - `I_LOW`, `II_MEDIUM`, `III_HIGH`, `IV_CRITICAL`
   - **Pending Backlog Hours**: Enter the outstanding maintenance backlog (default: 50.0).
   - **Total Failure Modes**: Number of identified failure modes for this equipment (default: 10).
   - **FM with Strategy**: Number of failure modes that have an assigned maintenance strategy (default: 8).

4. **Calculate Health Score**
   - Click **Calculate Health**.
   - The results display in the right column:
     - A gauge chart showing the **Composite Score** (0-100).
     - The **Health Class** label (GOOD, FAIR, POOR, CRITICAL).
     - A list of **Recommendations** for improvement.

### API Endpoint Called

```
POST /api/v1/analytics/health-score
     {
       "node_id": "uuid-...",
       "plant_id": "OCP-JFC1",
       "equipment_tag": "BRY-SAG-ML-001",
       "risk_class": "III_HIGH",
       "pending_backlog_hours": 50.0,
       "total_failure_modes": 10,
       "fm_with_strategy": 8
     }
```

### Expected Output

```json
{
  "composite_score": 72.5,
  "health_class": "FAIR",
  "component_scores": {
    "criticality": 75,
    "backlog": 60,
    "strategy_coverage": 80,
    "alert_status": 85
  },
  "recommendations": [
    "Address pending backlog to improve score",
    "Define strategies for remaining 2 failure modes"
  ]
}
```

### Error Handling

| Issue | Solution |
|---|---|
| "Cannot connect to API" | Start the API server. |
| No equipment in dropdown | Seed the database first (Page 7). |
| Score seems inaccurate | Verify input parameters match actual equipment data. |

---

## User Story AN-02: Monitor KPIs

**Goal**: Calculate and visualize key maintenance KPIs including MTBF, MTTR, availability, and OEE.

### Step-by-Step Instructions

1. **Navigate to Page 5 -- Analytics, KPIs Tab**
   - Switch to the **KPIs** tab.

2. **Enter KPI Parameters (left column)**
   - **Plant ID**: Enter the plant identifier (default: `OCP-JFC1`).
   - **Total Period Hours**: Total hours in the analysis period (default: 8760 for one year).
   - **Total Downtime Hours**: Accumulated downtime hours (default: 120.0).

3. **Calculate KPIs**
   - Click **Calculate KPIs**.
   - Results display in the right column:
     - A bar chart showing all calculated KPIs.
     - Individual metric cards for each KPI value.

### API Endpoint Called

```
POST /api/v1/analytics/kpis
     {
       "plant_id": "OCP-JFC1",
       "total_period_hours": 8760.0,
       "total_downtime_hours": 120.0
     }
```

### Expected Output

KPI metrics including:
- **Availability**: (Total - Downtime) / Total (e.g., 98.6%)
- **MTBF**: Mean Time Between Failures
- **MTTR**: Mean Time To Repair
- **OEE**: Overall Equipment Effectiveness

### Error Handling

| Issue | Solution |
|---|---|
| All KPIs show 0 | Ensure downtime and period hours are set to non-zero values. |
| Missing KPI values | Some KPIs require failure date data. Provide failure history. |

---

## User Story AN-03: Analyze Weibull Failure Prediction

**Goal**: Fit a Weibull distribution to historical failure intervals to predict future failures and determine the optimal replacement interval.

### Step-by-Step Instructions

1. **Navigate to Page 5 -- Analytics, Weibull Tab**
   - Switch to the **Weibull** tab.

2. **Enter Failure Data**
   - **Failure Intervals**: Enter comma-separated values representing days between failures (e.g., `120, 180, 95, 210, 150`). Minimum 3 intervals required.
   - **Current Age**: Enter the current operating age in days since last failure (default: 100.0).

3. **Fit Weibull Distribution**
   - Click **Fit Weibull**.
   - Results display:
     - **Beta (Shape)**: Indicates failure pattern (beta < 1 = early life, beta = 1 = random, beta > 1 = wear-out).
     - **Eta (Scale)**: Characteristic life in the same time unit as inputs.
     - **R-squared**: Goodness of fit (closer to 1.0 is better).
   - A reliability curve R(t) vs Time is plotted showing the probability of survival over time.

### API Endpoint Called

```
POST /api/v1/analytics/weibull-fit
     {
       "failure_intervals": [120, 180, 95, 210, 150]
     }
```

### Expected Output

```json
{
  "beta": 2.45,
  "eta": 165.3,
  "gamma": 0,
  "r_squared": 0.9823
}
```

**Interpretation:**
- Beta > 1 indicates wear-out failures -- time-based replacement is appropriate.
- The characteristic life (eta) suggests failures cluster around 165 days.

### Error Handling

| Issue | Solution |
|---|---|
| "Need at least 3 intervals" | Provide 3 or more comma-separated failure intervals. |
| R-squared is low (< 0.8) | Data may not follow a Weibull distribution well. Check for outliers or data quality issues. |
| Beta is very close to 1 | Failures are essentially random. CBM may be more appropriate than TBM. |

---

## User Story AN-04: Jack-Knife Analysis

**Goal**: Identify bad-actor equipment using Jack-Knife quadrant analysis that classifies equipment by failure frequency and downtime impact.

### Step-by-Step Instructions

1. **Navigate to Page 13 -- Reliability Engineering**
   - Open the Streamlit sidebar and click **Reliability Engineering**.
   - Click the **Bad Actors** tab, then the **Jack-Knife** sub-tab.

2. **Configure Analysis**
   - **Plant ID**: Enter the plant identifier (default: `OCP-JFC1`).

3. **Run Jack-Knife Analysis**
   - Click **Run Jack-Knife** (blue primary button).
   - The system uses sample equipment data to demonstrate the analysis.

4. **Review Results**
   - Four metric cards show equipment counts by quadrant:
     - **Acute**: High frequency, high downtime -- top priority
     - **Chronic**: High frequency, low downtime -- address root causes
     - **Complex**: Low frequency, high downtime -- investigate when they fail
     - **Controlled**: Low frequency, low downtime -- acceptable performance
   - A scatter plot (Jack-Knife chart) visualizes each equipment point in the four quadrants.

### API Endpoint Called

```
POST /api/v1/reliability/jackknife/analyze
     {
       "plant_id": "OCP-JFC1",
       "equipment_data": [
         {
           "equipment_id": "EQ-1",
           "equipment_tag": "BRY-SAG-001",
           "failure_count": 15,
           "total_downtime_hours": 120,
           "operating_hours": 8760
         }
       ]
     }
```

### Expected Output

```json
{
  "acute_count": 1,
  "chronic_count": 1,
  "complex_count": 1,
  "controlled_count": 2,
  "points": [
    {
      "equipment_id": "EQ-1",
      "equipment_tag": "BRY-SAG-001",
      "failure_rate": 1.71,
      "mean_downtime": 8.0,
      "quadrant": "ACUTE"
    }
  ]
}
```

### Error Handling

| Issue | Solution |
|---|---|
| Analysis returns error | Check that equipment data array is not empty. Verify operating hours > 0. |
| All equipment in one quadrant | Adjust thresholds or provide data with more variation. |

---

## User Story AN-05: Pareto Analysis

**Goal**: Perform Pareto (80/20) analysis to identify the top contributors to failures, cost, or downtime.

### Step-by-Step Instructions

1. **Navigate to Page 13 -- Reliability Engineering**
   - Click the **Bad Actors** tab, then the **Pareto** sub-tab.

2. **Configure Analysis**
   - **Plant ID**: Enter the plant identifier.
   - **Metric Type**: Select the analysis dimension:
     - `failures` -- Rank by failure count
     - `cost` -- Rank by failure cost
     - `downtime` -- Rank by downtime hours

3. **Run Pareto Analysis**
   - Click **Run Pareto** (blue primary button).

4. **Review Results**
   - A metric shows: "X / Y bad actors" (the 20% causing 80% of the problem).
   - A Pareto chart with bars (individual contribution) and a cumulative line.
   - Items above the 80% threshold are highlighted as bad actors.

### API Endpoint Called

```
POST /api/v1/reliability/pareto/analyze
     {
       "plant_id": "OCP-JFC1",
       "metric_type": "cost",
       "records": [
         { "equipment_id": "EQ-1", "equipment_tag": "BRY-001", "cost": 50000, "downtime_hours": 120 }
       ]
     }
```

### Expected Output

```json
{
  "bad_actor_count": 3,
  "items": [
    {
      "equipment_id": "EQ-1",
      "equipment_tag": "BRY-001",
      "value": 50000,
      "cumulative_pct": 38.5,
      "is_bad_actor": true
    }
  ]
}
```

### Error Handling

| Issue | Solution |
|---|---|
| Empty results | Ensure records array has data. At least 2 records are needed for meaningful analysis. |
| No bad actors identified | All equipment has similar contribution. No clear 80/20 split exists. |

---

## User Story AN-06: Review Planning KPIs

**Goal**: Calculate and review the 11 planning KPIs defined by the GFSN REF-14 standard.

### Step-by-Step Instructions

1. **Navigate to Page 17 -- Defect Elimination**
   - Open the Streamlit sidebar and click **Defect Elimination**.
   - Switch to the **Planning KPIs** tab.

2. **Enter KPI Input Data**
   - Fill in all planning metrics across the input columns:
     - **WOs Planned / Completed**: Work order execution data
     - **Man-hours Planned / Actual**: Labor tracking
     - **PM Planned / Executed**: Preventive maintenance compliance
     - **Backlog Hours / Weekly Capacity**: Backlog health
     - **Corrective / Proactive WOs**: Maintenance mix
     - **Schedule Compliance**: Planned vs. executed
     - **Release Horizon**: Planning lead time in days
     - **Pending / Total Notices**: Notice processing efficiency
     - **Scheduled / Total Capacity**: Capacity utilization

3. **Calculate Planning KPIs**
   - Click **Calculate Planning KPIs** (blue primary button).

4. **Review Results**
   - Overall health status: "Overall Health: GOOD -- X/11 on target"
   - A data table showing each KPI with:
     - Status indicator (on target / off target)
     - KPI name, value, target, and unit
   - A radar chart showing all 11 KPIs vs. their targets.

### API Endpoint Called

```
POST /api/v1/rca/planning-kpis/calculate
     {
       "plant_id": "OCP-JFC1",
       "period_start": "2025-03-01",
       "period_end": "2025-03-08",
       "wo_planned": 100,
       "wo_completed": 92,
       "manhours_planned": 800.0,
       "manhours_actual": 780.0,
       "pm_planned": 50,
       "pm_executed": 48,
       "backlog_hours": 300.0,
       "weekly_capacity_hours": 200.0,
       ...
     }
```

### Expected Output

```json
{
  "overall_health": "GOOD",
  "on_target_count": 9,
  "kpis": [
    {
      "name": "wo_completion_rate",
      "value": 92.0,
      "target": 90.0,
      "unit": "%",
      "status": "ON_TARGET"
    }
  ]
}
```

### Error Handling

| Issue | Solution |
|---|---|
| KPI values all null | Ensure numeric inputs are non-zero. Check that planned values > 0. |
| Low on-target count | Review individual KPIs below target and investigate root causes. |

---

## User Story AN-07: Review DE KPIs

**Goal**: Calculate and review the 5 Defect Elimination program KPIs per GFSN REF-15.

### Step-by-Step Instructions

1. **Navigate to Page 17 -- Defect Elimination**
   - Switch to the **DE KPIs** tab.

2. **Enter DE KPI Input Data**
   - **Events Reported / Required**: DE event capture rate
   - **Meetings Held / Required**: Team engagement tracking
   - **Actions Implemented / Planned**: Action completion rate
   - **Savings Achieved / Target**: Financial impact tracking
   - **Failures Current / Previous**: Failure rate trend

3. **Calculate DE KPIs**
   - Click **Calculate DE KPIs** (blue primary button).

4. **Review Results**
   - **Program Maturity Level**: INITIATING, DEVELOPING, ESTABLISHED, or OPTIMIZING
   - **Program Score**: 0-100 gauge chart
   - Individual KPI table with status indicators
   - **Strengths**: Areas performing well
   - **Improvement Areas**: Areas needing attention

### API Endpoint Called

```
POST /api/v1/rca/de-kpis/calculate
     {
       "plant_id": "OCP-JFC1",
       "period_start": "2025-02-01",
       "period_end": "2025-03-01",
       "events_reported": 18,
       "events_required": 20,
       "meetings_held": 9,
       "meetings_required": 10,
       "actions_implemented": 14,
       "actions_planned": 16,
       "savings_achieved": 85000.0,
       "savings_target": 100000.0,
       "failures_current": 8,
       "failures_previous": 12
     }
```

### Expected Output

```json
{
  "kpis": {
    "kpis": [
      { "name": "event_reporting_rate", "value": 90.0, "target": 85, "status": "ON_TARGET" }
    ]
  },
  "health": {
    "maturity_level": "ESTABLISHED",
    "program_score": 78,
    "strengths": ["Event reporting rate exceeds target"],
    "improvement_areas": ["Increase savings realization"]
  }
}
```

### Error Handling

| Issue | Solution |
|---|---|
| Division by zero errors | Ensure "required" and "target" fields are greater than zero. |
| Low maturity score | Review improvement areas and create action plans for each gap. |

---

## User Story AN-08: Generate Reports

**Goal**: Generate weekly, monthly, or quarterly maintenance reports and manage report history.

### Step-by-Step Instructions

1. **Navigate to Page 15 -- Reports & Data**
   - Open the Streamlit sidebar and click **Reports & Data**.
   - The page has four tabs: **Generate**, **History**, **Import**, and **Export**.

2. **Generate a Report (Generate Tab)**
   - Enter the **Plant ID** (default: `OCP-JFC`).
   - Select **Report Type**: Weekly, Monthly, or Quarterly.
   - For **Weekly Reports**:
     - Set Week Number and Year
     - Enter Safety Incidents count and Backlog Hours
     - Click **Generate Weekly Report**
   - For **Monthly Reports**:
     - Set Month and Year
     - Click **Generate Monthly Report**
   - For **Quarterly Reports**:
     - Set Quarter and Year
     - Click **Generate Quarterly Report**

3. **View Report History (History Tab)**
   - Switch to the **History** tab.
   - Filter by report type: `All`, `WEEKLY_MAINTENANCE`, `MONTHLY_KPI`, `QUARTERLY_REVIEW`.
   - Expand any report to see details.
   - Click **View** to see the full report JSON.

4. **Export Data (Export Tab)**
   - Switch to the **Export** tab.
   - Select export type: `equipment`, `kpis`, `schedule`, `report`.
   - Click **Prepare Export**.
   - Review the generated sheets with row counts and headers.

### API Endpoints Called

```
POST /api/v1/reporting/reports/weekly
     { "plant_id": "OCP-JFC", "week": 12, "year": 2025, "safety_incidents": 0, "backlog_hours": 150 }
POST /api/v1/reporting/reports/monthly
     { "plant_id": "OCP-JFC", "month": 3, "year": 2025 }
POST /api/v1/reporting/reports/quarterly
     { "plant_id": "OCP-JFC", "quarter": 1, "year": 2025 }
GET  /api/v1/reporting/reports?plant_id=OCP-JFC&report_type=MONTHLY_KPI
GET  /api/v1/reporting/reports/{report_id}
POST /api/v1/reporting/export
     { "export_type": "kpis" }
```

### Expected Output

**Weekly report response:**
```json
{
  "report_id": "uuid-...",
  "report_type": "WEEKLY_MAINTENANCE",
  "plant_id": "OCP-JFC",
  "period_start": "2025-03-17",
  "period_end": "2025-03-23",
  "generated_at": "2025-03-23T14:00:00",
  "content": { "safety_incidents": 0, "backlog_hours": 150, ... }
}
```

### Error Handling

| Issue | Solution |
|---|---|
| Report generation fails | Check API connection. Ensure plant ID is valid. |
| No reports in history | Generate at least one report first. |
| Export shows empty sheets | Ensure the database contains data for the selected export type. |

---

## User Story AN-09: Conduct Root Cause Analysis (RCA)

**Goal**: Create and manage root cause analyses for failure events using the structured RCA framework with 5W+2H methodology.

### Step-by-Step Instructions

1. **Navigate to Page 17 -- Defect Elimination**
   - The **RCA** tab is selected by default.

2. **Create a New RCA (left column)**
   - Enter:
     - **Plant ID**: Plant where the event occurred (default: `OCP-JFC1`)
     - **Event Description**: Detailed description of the failure event
     - **Equipment ID** (optional): Related equipment identifier
     - **Max Consequence** (1-5 slider): Severity of the consequence
     - **Frequency** (1-5 slider): How often this type of event occurs
     - **Team Members**: Comma-separated list of investigators
   - Click **Create RCA** (blue primary button).
   - The system determines the RCA level based on consequence x frequency:
     - **Level 1**: Simple 5W+2H analysis
     - **Level 2**: Cause-and-Effect (Fishbone) analysis
     - **Level 3**: Full RCA with Fault Tree Analysis

3. **Review Active RCAs (right column)**
   - Summary metrics: Total, Open, Under Investigation, Completed.
   - A data table lists all RCA analyses.
   - A chart shows the distribution of RCA levels.

4. **Run 5W+2H Analysis (5W+2H Tab)**
   - Switch to the **5W+2H** tab.
   - Enter the **RCA Analysis ID** from the created RCA.
   - Fill in the seven structured fields:
     - **WHAT**: Problem description and goal
     - **WHEN**: Timing and schedule
     - **WHERE**: Location and implementation area
     - **WHO**: Skills required and responsible person
     - **WHY**: Traceability and justification
     - **HOW**: Manifestation and approach
     - **HOW MUCH**: Quantification and cost impact
   - Click **Submit 5W+2H Analysis**.
   - A formatted report is generated and displayed.

### API Endpoints Called

```
POST /api/v1/rca/analyses
     {
       "event_description": "SAG mill bearing failure...",
       "plant_id": "OCP-JFC1",
       "equipment_id": "EQ-SAG-001",
       "max_consequence": 4,
       "frequency": 3,
       "team_members": ["J. Garcia", "M. Benali"]
     }
GET  /api/v1/rca/analyses/summary?plant_id=OCP-JFC1
GET  /api/v1/rca/analyses?plant_id=OCP-JFC1
POST /api/v1/rca/analyses/{analysis_id}/5w2h
     { "what": "...", "when": "...", "where": "...", "who": "...", "why": "...", "how": "...", "how_much": "..." }
```

### Expected Output

**RCA creation:**
```json
{
  "analysis_id": "uuid-...",
  "level": "LEVEL_2",
  "status": "OPEN",
  "team_requirements": {
    "description": "Cause-and-Effect (Fishbone) analysis required",
    "minimum_team_size": 3
  }
}
```

### Error Handling

| Issue | Solution |
|---|---|
| "Describe the event" warning | The event description field is required. |
| "API not available" | Start the API server with `uvicorn api.main:app --reload`. |
| 5W+2H fails with 404 | Ensure the analysis ID is correct and the RCA exists. |

---

## Quick Reference: Analyst Workflow

```
Page 5: Analytics                    Page 13: Reliability
+-------------------------+          +-------------------------+
| AN-01: Health Scores    |          | AN-04: Jack-Knife       |
| AN-02: KPIs (MTBF/OEE) |          | AN-05: Pareto Analysis  |
| AN-03: Weibull Predict  |          +-------------------------+
+-------------------------+
                                     Page 17: Defect Elimination
Page 15: Reports & Data             +-------------------------+
+-------------------------+          | AN-06: Planning KPIs    |
| AN-08: Generate Reports |          | AN-07: DE KPIs          |
| View history & export   |          | AN-09: Conduct RCA      |
+-------------------------+          +-------------------------+
```
