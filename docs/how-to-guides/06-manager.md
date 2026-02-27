# How-To Guide: Manager

**Role**: Manager
**Modules**: Executive Dashboard, Reporting, Notifications, Defect Elimination
**Pages**: Page 14 (Executive Dashboard), Page 15 (Reports & Data), Page 17 (Defect Elimination)

## Role Description

Managers are responsible for oversight of the entire maintenance operation. They use the Executive Dashboard to monitor consolidated KPIs with traffic-light indicators, review cross-module analysis results, track active notifications and alerts, perform variance analysis on KPI trends, and manage CAPA (Corrective and Preventive Action) items. Their focus is on strategic decision-making and program health.

---

## Prerequisites

| Requirement | Details |
|---|---|
| API server running | `uvicorn api.main:app --reload` on `http://localhost:8000` |
| Streamlit app running | `streamlit run streamlit_app/Home.py` on `http://localhost:8501` |
| Database seeded | Full seed data including plants, equipment, and historical records |
| Reports generated | At least one monthly KPI report for traffic-light display (generate via Page 15) |
| Notifications generated | Active notifications from reporting engine for alert review |
| Planning KPI data | Planning and DE KPI snapshots for variance analysis (Page 17) |

---

## User Story MG-01: View Management Dashboard

**Goal**: Access the consolidated executive dashboard showing KPI traffic lights, health/risk overview, and active alert counts.

### Step-by-Step Instructions

1. **Navigate to Page 14 -- Executive Dashboard**
   - Open the Streamlit sidebar and click **Executive Dashboard**.

2. **Set the Plant Scope**
   - Enter the **Plant ID** at the top of the page (default: `OCP-JFC`).
   - All dashboard data will be filtered to this plant.

3. **Review KPI Traffic Lights (KPI Traffic Light Tab)**
   - The first tab shows the KPI traffic-light grid.
   - Each KPI is displayed with a color indicator:
     - **Green**: On target -- no action needed
     - **Yellow**: Approaching threshold -- monitor closely
     - **Red**: Below target -- immediate attention required
   - If no monthly reports have been generated, an info message suggests generating a report first (Page 15).

4. **Review Health & Risk Overview (Health & Risk Tab)**
   - Switch to the **Health & Risk** tab.
   - Three summary metrics are displayed:
     - **Total Reports**: Number of generated reports
     - **Total Notifications**: Active notification count
     - **Critical Alerts**: Number of critical-level alerts

5. **Monitor KPI Trends (KPI Trends Tab)**
   - Switch to the **KPI Trends** tab.
   - Select a KPI to trend:
     - `wo_completion` -- Work order completion rate
     - `schedule_adherence` -- Schedule adherence percentage
     - `pm_compliance` -- PM compliance rate
     - `reactive_pct` -- Reactive maintenance percentage
     - `backlog_weeks` -- Backlog expressed in weeks of capacity
   - A line chart shows the selected KPI over time with actual values and targets.

### API Endpoints Called

```
GET /api/v1/dashboard/kpi-summary/{plant_id}
GET /api/v1/dashboard/executive/{plant_id}
```

### Expected Output

**KPI Summary:**
```json
{
  "plant_id": "OCP-JFC",
  "has_data": true,
  "report": {
    "report_id": "uuid-...",
    "traffic_lights": {
      "wo_completion": "GREEN",
      "schedule_adherence": "YELLOW",
      "pm_compliance": "GREEN",
      "reactive_pct": "RED",
      "backlog_weeks": "GREEN"
    }
  }
}
```

**Executive Dashboard:**
```json
{
  "plant_id": "OCP-JFC",
  "total_reports": 12,
  "recent_reports": [...],
  "total_notifications": 8,
  "critical_alerts": 2,
  "recent_notifications": [...]
}
```

### Error Handling

| Issue | Solution |
|---|---|
| "No monthly reports" message | Generate a monthly KPI report from Page 15 first. |
| "Could not connect" warning | Ensure the API server is running. |
| All traffic lights missing | KPI summary requires at least one MONTHLY_KPI report type. Generate one via the reporting API. |
| Trend data appears static | Historical trend data requires multiple report snapshots over time. |

---

## User Story MG-02: Cross-Module Analysis

**Goal**: Run a cross-module analysis that correlates equipment criticality with failure history to identify systemic maintenance gaps.

### Step-by-Step Instructions

1. **Navigate to Page 14 -- Executive Dashboard**
   - Switch to the **Cross-Module** tab.

2. **Understand the Analysis**
   - Read the info message explaining the cross-module correlation.
   - This analysis combines data from:
     - Equipment criticality assessments (Module 1)
     - Failure records and history (Module 2)
     - Maintenance strategy coverage (Module 3)

3. **Run the Demo Analysis**
   - Click **Run Demo** to execute the cross-module analysis.
   - The system uses sample data with equipment criticality levels and failure records.

4. **Review the JSON Results**
   - The raw analysis result is displayed as JSON.
   - Key insights include:
     - Correlation between high-criticality equipment and failure frequency
     - Equipment with high criticality but insufficient maintenance coverage
     - Strategy gaps where critical equipment lacks defined failure modes

### API Endpoint Called

```
POST /api/v1/reporting/cross-module/analyze
     {
       "plant_id": "OCP-JFC",
       "equipment_criticality": [
         { "equipment_id": "EQ-1", "criticality": "AA" },
         { "equipment_id": "EQ-2", "criticality": "B" }
       ],
       "failure_records": [
         { "equipment_id": "EQ-1" },
         { "equipment_id": "EQ-1" },
         { "equipment_id": "EQ-2" }
       ]
     }
```

### Expected Output

```json
{
  "analysis_id": "uuid-...",
  "correlations": {
    "high_criticality_high_failures": ["EQ-1"],
    "high_criticality_low_coverage": [],
    "strategy_gaps": []
  },
  "recommendations": [
    "EQ-1 (criticality AA) has 2 failure records. Review maintenance strategy.",
    "Consider increasing PM frequency for critical assets with repeat failures."
  ],
  "summary": {
    "total_equipment": 2,
    "critical_equipment": 1,
    "total_failures": 3,
    "coverage_score": 0.85
  }
}
```

### Error Handling

| Issue | Solution |
|---|---|
| "Analysis failed" | Check API logs. Ensure equipment and failure data exists in the database. |
| Empty correlations | The sample dataset may be too small. Use real plant data for meaningful results. |

---

## User Story MG-03: Notifications Review

**Goal**: Monitor and manage active notifications and alerts across the plant, acknowledging addressed items and escalating critical ones.

### Step-by-Step Instructions

1. **Navigate to Page 14 -- Executive Dashboard**
   - Switch to the **Notifications** tab.

2. **Review Active Alerts**
   - A metric card shows the **Total Active Alerts** count.
   - Below, a notification summary chart visualizes alerts by level and type.

3. **Scan Individual Notifications**
   - Each notification is displayed with an icon indicating severity:
     - Red circle: CRITICAL
     - Yellow circle: WARNING
     - Blue circle: INFO
   - Up to 10 recent notifications are shown with title and message.

4. **Manage Notifications via API**
   - To generate new notifications:
     ```
     POST /api/v1/reporting/notifications/generate
     { "plant_id": "OCP-JFC", "kpi_data": {...} }
     ```
   - To acknowledge a notification:
     ```
     PUT /api/v1/reporting/notifications/{notification_id}/ack
     ```
   - To list all notifications (including acknowledged):
     ```
     GET /api/v1/reporting/notifications?plant_id=OCP-JFC
     ```
   - To filter by level:
     ```
     GET /api/v1/reporting/notifications?plant_id=OCP-JFC&level=CRITICAL
     ```

### API Endpoints Called

```
GET  /api/v1/dashboard/alerts/{plant_id}
POST /api/v1/reporting/notifications/generate
PUT  /api/v1/reporting/notifications/{notification_id}/ack
GET  /api/v1/reporting/notifications?plant_id=OCP-JFC&level=CRITICAL
```

### Expected Output

**Dashboard alerts:**
```json
{
  "plant_id": "OCP-JFC",
  "total_active": 5,
  "alerts": [
    {
      "notification_id": "uuid-...",
      "level": "CRITICAL",
      "title": "PM Compliance Below Threshold",
      "message": "PM compliance at 72% -- target is 90%",
      "created_at": "2025-03-23T08:00:00"
    },
    {
      "notification_id": "uuid-...",
      "level": "WARNING",
      "title": "Backlog Exceeds 4 Weeks",
      "message": "Current backlog is 5.2 weeks of capacity",
      "created_at": "2025-03-22T14:00:00"
    }
  ]
}
```

### Error Handling

| Issue | Solution |
|---|---|
| "No active alerts" | This is good. It means all KPIs are on target. |
| "Could not connect" | Start the API server. |
| Notifications not appearing | Generate notifications first using the reporting API endpoint. |

---

## User Story MG-04: Variance Analysis

**Goal**: Detect and review statistically significant variances in KPI metrics over time using automated z-score analysis.

### Step-by-Step Instructions

1. **Detect Variances via API**
   - The variance detection system uses z-score analysis to identify metrics that deviate significantly from their historical trend.
   - Submit KPI snapshots for variance detection:
     ```
     POST /api/v1/analytics/variance-detect
     {
       "snapshots": [
         { "metric": "availability", "values": [98.5, 98.2, 97.8, 95.1, 98.0] },
         { "metric": "mtbf", "values": [720, 715, 710, 680, 520] }
       ]
     }
     ```

2. **Review Variance Alerts**
   - List all stored variance alerts:
     ```
     GET /api/v1/analytics/variance-alerts
     ```
   - Each alert includes:
     - **Plant ID**: Which plant is affected
     - **Metric Name**: The KPI that deviated
     - **Z-Score**: Statistical significance (|z| > 2 is significant)
     - **Variance Level**: LOW, MEDIUM, HIGH, or CRITICAL

3. **Interpret Results**
   - **Z-score > 2**: Significant positive deviation (improving trend)
   - **Z-score < -2**: Significant negative deviation (deteriorating trend)
   - Focus on CRITICAL and HIGH variance alerts first.

4. **Combine with KPI Trends**
   - Navigate to Page 14, KPI Trends tab, to visually confirm variance trends.
   - Cross-reference variance alerts with the planning KPIs on Page 17.

### API Endpoints Called

```
POST /api/v1/analytics/variance-detect
     { "snapshots": [...] }
GET  /api/v1/analytics/variance-alerts
```

### Expected Output

**Variance detection:**
```json
{
  "variances_detected": 1,
  "alerts": [
    {
      "metric": "mtbf",
      "z_score": -2.85,
      "variance_level": "HIGH",
      "direction": "DECLINING",
      "message": "MTBF has declined significantly in the latest period"
    }
  ]
}
```

**Stored alerts:**
```json
[
  {
    "alert_id": "uuid-...",
    "plant_id": "OCP-JFC1",
    "metric_name": "mtbf",
    "z_score": -2.85,
    "variance_level": "HIGH"
  }
]
```

### Error Handling

| Issue | Solution |
|---|---|
| No variances detected | All metrics are within normal range. This is the expected healthy state. |
| Too many alerts | Tighten the z-score threshold or review if data quality issues are generating false positives. |
| Empty variance alerts | No variance detection has been run. Execute the POST endpoint first. |

---

## User Story MG-05: CAPA Management

**Goal**: Track Corrective and Preventive Actions that result from RCA analyses, ensuring all identified actions are implemented and verified.

### Overview

CAPA items are generated as part of the RCA (Root Cause Analysis) workflow on Page 17. As a manager, you track the lifecycle of these actions from identification through implementation and verification.

### Step-by-Step Instructions

1. **Review RCA Analyses on Page 17**
   - Navigate to Page 17 (Defect Elimination), RCA tab.
   - Review the active RCA summary metrics:
     - **Total**: All RCA analyses
     - **Open**: Newly created, awaiting investigation
     - **Under Investigation**: Active investigation in progress
     - **Completed**: Investigation finished with findings

2. **Track RCA Status Progression**
   - Each RCA progresses through stages:
     - `OPEN` -> `UNDER_INVESTIGATION` -> `ROOT_CAUSE_IDENTIFIED` -> `ACTIONS_DEFINED` -> `COMPLETED`
   - Use the API to advance RCA status:
     ```
     PUT /api/v1/rca/analyses/{analysis_id}/advance
     { "status": "ACTIONS_DEFINED" }
     ```

3. **Review 5W+2H Reports**
   - For Level 1 RCAs, review the 5W+2H analysis on the 5W+2H tab of Page 17.
   - The structured report provides:
     - WHAT happened and what is the goal
     - WHEN it occurred and the remediation timeline
     - WHERE in the plant and process
     - WHO is responsible and what skills are needed
     - WHY it matters (traceability)
     - HOW it manifested and how to fix it
     - HOW MUCH it costs and what investment is needed

4. **Monitor DE Program Health**
   - On Page 17, DE KPIs tab, review the overall program metrics:
     - **Event Reporting Rate**: Are failure events being captured?
     - **Meeting Compliance**: Are DE review meetings happening?
     - **Action Implementation Rate**: Are corrective actions being completed?
     - **Savings Realization**: Are financial benefits being achieved?
     - **Failure Rate Reduction**: Is the overall failure rate decreasing?

5. **Track Action Implementation via API**
   - List all RCA analyses to monitor CAPA status:
     ```
     GET /api/v1/rca/analyses?plant_id=OCP-JFC1&status=ACTIONS_DEFINED
     ```
   - Get details on specific RCA including actions:
     ```
     GET /api/v1/rca/analyses/{analysis_id}
     ```

6. **Review Planning KPI Impact**
   - On Page 17, Planning KPIs tab, check whether CAPA actions are improving operational KPIs:
     - WO completion rate trending up
     - Reactive maintenance percentage trending down
     - PM compliance improving

### API Endpoints Called

```
GET  /api/v1/rca/analyses?plant_id=OCP-JFC1
GET  /api/v1/rca/analyses/summary?plant_id=OCP-JFC1
GET  /api/v1/rca/analyses/{analysis_id}
PUT  /api/v1/rca/analyses/{analysis_id}/advance
     { "status": "COMPLETED" }
POST /api/v1/rca/de-kpis/calculate
     { "plant_id": "OCP-JFC1", ... }
GET  /api/v1/rca/de-kpis?plant_id=OCP-JFC1
```

### Expected Output

**RCA Summary:**
```json
{
  "total": 15,
  "open": 3,
  "under_investigation": 5,
  "root_cause_identified": 4,
  "actions_defined": 2,
  "completed": 1
}
```

**RCA Detail:**
```json
{
  "analysis_id": "uuid-...",
  "event_description": "Repeated bearing failures on SAG mill drive side",
  "level": "LEVEL_2",
  "status": "ACTIONS_DEFINED",
  "plant_id": "OCP-JFC1",
  "equipment_id": "EQ-SAG-001",
  "team_members": ["J. Garcia", "M. Benali"],
  "findings": {
    "root_causes": ["Misalignment during installation", "Insufficient lubrication interval"],
    "actions": [
      { "description": "Implement laser alignment during bearing replacement", "owner": "J. Garcia", "due_date": "2025-04-15" },
      { "description": "Reduce lubrication interval from 30 to 14 days", "owner": "M. Benali", "due_date": "2025-03-30" }
    ]
  }
}
```

### Error Handling

| Issue | Solution |
|---|---|
| No RCAs found | Create RCA analyses on Page 17 first. |
| Status advance fails | Ensure the target status follows the valid progression sequence. |
| DE KPIs all at zero | Enter actual event and action data into the DE KPI calculator. |

---

## Quick Reference: Manager Workflow

```
Page 14: Executive Dashboard
+------------------------------------------+
| Tab 1: KPI Traffic Lights (MG-01)        |
|   - Green/Yellow/Red status per KPI      |
|                                          |
| Tab 2: Health & Risk Overview (MG-01)    |
|   - Reports, Notifications, Alerts count |
|                                          |
| Tab 3: KPI Trends (MG-04)               |
|   - Historical trend with target line    |
|                                          |
| Tab 4: Notifications (MG-03)            |
|   - Active alerts by severity           |
|                                          |
| Tab 5: Cross-Module (MG-02)             |
|   - Criticality vs. failure correlation  |
+------------------------------------------+

Page 17: Defect Elimination
+------------------------------------------+
| Tab 1: RCA (MG-05)                       |
|   - Create & track root cause analyses   |
|                                          |
| Tab 2: 5W+2H (MG-05)                    |
|   - Structured analysis reports          |
|                                          |
| Tab 3: Planning KPIs (MG-04)            |
|   - 11 KPIs with radar chart            |
|                                          |
| Tab 4: DE KPIs (MG-05)                  |
|   - Program maturity & 5 DE metrics     |
+------------------------------------------+

API-Only Workflows
+------------------------------------------+
| Variance Detection (MG-04)               |
|   POST /analytics/variance-detect        |
|   GET  /analytics/variance-alerts        |
|                                          |
| Notification Management (MG-03)          |
|   POST /reporting/notifications/generate |
|   PUT  /reporting/notifications/{id}/ack |
+------------------------------------------+
```

## Management Decision Framework

| Signal | Page | Action |
|---|---|---|
| Red traffic light on KPI | Page 14, Tab 1 | Investigate root cause. Check Page 17 Planning KPIs for details. |
| Critical alert | Page 14, Tab 4 | Review and acknowledge. Assign to responsible team. |
| High variance detected | API: variance-alerts | Compare with KPI trends. Create RCA if systemic. |
| Low DE program score | Page 17, Tab 4 | Address improvement areas. Increase team engagement. |
| Cross-module gap identified | Page 14, Tab 5 | Ensure critical equipment has full FMEA and strategy coverage. |
| CAPA overdue | API: RCA analyses | Escalate to equipment owner. Update timeline or reassign. |
