# How-To Guide: Maintenance Planner

**Role**: Maintenance Planner
**Modules**: Module 2 (Work Request Processing), Module 3 (Backlog & Scheduling), Module 4 (Strategy)
**Pages**: Page 9 (Work Requests), Page 10 (Planner Assistant), Page 11 (Backlog & Schedule), Page 12 (Weekly Scheduling), Page 4 (Strategy -- Tasks/Work Packages)

## Role Description

Maintenance Planners are responsible for processing incoming work requests, reviewing AI-generated recommendations, managing the maintenance backlog, creating weekly maintenance programs, and building work packages. They act as the bridge between field observations and scheduled maintenance execution.

---

## Prerequisites

| Requirement | Details |
|---|---|
| API server running | `uvicorn api.main:app --reload` on `http://localhost:8000` |
| Streamlit app running | `streamlit run streamlit_app/Home.py` on `http://localhost:8501` |
| Database seeded | Plants, equipment hierarchy, and sample data loaded (Page 7 seed) |
| Work requests exist | At least one field capture submitted (Page 8) generating work requests |
| Planner permissions | Access to approve, modify, escalate, or defer work requests |

---

## User Story MP-01: Process Incoming Work Requests

**Goal**: Review incoming work requests from field captures, validate AI classifications, and approve or reject them.

### Step-by-Step Instructions

1. **Navigate to Page 9 -- Work Requests**
   - Open the Streamlit sidebar and click **Work Requests**.

2. **Filter by Status**
   - Use the **Filter by Status** dropdown and select `DRAFT` or `PENDING_VALIDATION` to see items requiring your attention.

3. **Review the Work Request Queue**
   - The page shows a count header: "X Work Requests Found".
   - Each work request is displayed as an expandable card showing:
     - Request ID (truncated)
     - Equipment tag
     - Status badge (color-coded)

4. **Expand and Review Each Work Request**
   - Click on a work request expander to see details:
     - **Equipment**: Matched equipment tag
     - **Confidence**: AI matching confidence percentage
     - **AI Priority**: Suggested priority (e.g., `2_URGENT`)
     - **WO Type**: Work order type (CM, PM, etc.)
     - **Duration**: Estimated hours
     - **Specialties**: Required maintenance disciplines
     - **Created**: Submission timestamp

5. **Take Action**
   - For each `DRAFT` or `PENDING_VALIDATION` work request, use the three action buttons:
     - **Approve**: Accept the work request for further processing by the planner.
     - **Reject**: Reject the work request with a reason.
     - **Classify**: Re-trigger AI classification to refresh the analysis.
   - The page automatically reloads after each action.

### API Endpoints Called

```
GET  /api/v1/work-requests/?status=PENDING_VALIDATION
PUT  /api/v1/work-requests/{request_id}/validate   { "action": "APPROVE" }
POST /api/v1/work-requests/{request_id}/classify
```

### Expected Output

- Work request status changes from `DRAFT`/`PENDING_VALIDATION` to `VALIDATED` or `REJECTED`.
- Success message: "Work request {id} approved" or "Work request {id} rejected".
- The page refreshes to show updated status badges.

### Error Handling

| Issue | Solution |
|---|---|
| "Could not load work requests" | Verify the API is running. Check the database has been seeded. |
| Approve button returns error | The work request may have already been processed. Refresh the page. |
| AI classification seems incorrect | Click **Classify** to re-run AI analysis with updated context. |

---

## User Story MP-02: Review Planner Recommendation

**Goal**: Use the AI-powered Planner Assistant to generate a detailed recommendation for a specific work request, including resource analysis, scheduling suggestions, and risk assessment.

### Step-by-Step Instructions

1. **Navigate to Page 10 -- Planner Assistant**
   - Open the Streamlit sidebar and click **Planner Assistant**.

2. **Select a Work Request**
   - Use the dropdown to select a work request from the list.
   - The dropdown shows: Request ID | Equipment Tag | Status.
   - Three metric cards display: Equipment, Status, and AI Priority.

3. **Generate AI Recommendation**
   - Click the **Generate Recommendation** button (blue primary button).
   - Wait for the AI engine to analyze the work request.

4. **Review the Recommendation**
   - Once generated, the recommendation displays:
     - **Suggested Action**: APPROVE, MODIFY, ESCALATE, or DEFER
     - **Confidence**: AI confidence in the recommendation
     - **Risk Level**: Overall risk assessment

5. **Explore the Three Analysis Tabs**

   **Resources Tab:**
   - Workforce availability by specialty (e.g., "MECHANICAL: 3 available")
   - Materials status (all available or missing items listed)

   **Scheduling Tab:**
   - Recommended date and shift
   - Scheduling reasoning
   - Any conflicts with existing schedule
   - Groupable backlog items (items that can be combined)

   **Risk Tab:**
   - Risk level assessment
   - Individual risk factors
   - Mitigation recommendation

6. **Apply Planner Action**
   - Below the recommendation, four action buttons are displayed:
     - **APPROVE**: Accept the recommendation and move to scheduling.
     - **MODIFY**: Accept with modifications (planner adjusts parameters).
     - **ESCALATE**: Escalate to management for higher-level decision.
     - **DEFER**: Defer the work to a later period.
   - Click the appropriate action button.

### API Endpoints Called

```
POST /api/v1/planner/{work_request_id}/recommend
PUT  /api/v1/planner/recommendations/{recommendation_id}/action
     { "action": "APPROVE" }
```

### Expected Output

**Recommendation response:**
```json
{
  "recommendation_id": "uuid-...",
  "planner_action": "APPROVE",
  "ai_confidence": 0.87,
  "risk_level": "MEDIUM",
  "resource_analysis": {
    "workforce_available": [
      { "specialty": "MECHANICAL", "technicians_available": 3 }
    ],
    "materials_status": { "all_available": true }
  },
  "scheduling_suggestion": {
    "recommended_date": "2025-03-15",
    "recommended_shift": "DAY",
    "reasoning": "Equipment criticality is HIGH...",
    "conflicts": [],
    "groupable_with": ["BL-002", "BL-005"]
  },
  "risk_assessment": {
    "risk_level": "MEDIUM",
    "risk_factors": ["Equipment criticality AA", "No redundancy"],
    "recommendation": "Schedule within 7 days"
  }
}
```

### Error Handling

| Issue | Solution |
|---|---|
| "No work requests available" | Submit field captures on Page 8 first. Ensure work requests exist. |
| Recommendation generation fails | Check API logs. Ensure the work request has valid equipment data. |
| Action application fails | The recommendation may have already been actioned. Refresh the page. |

---

## User Story MP-03: Manage Backlog

**Goal**: View, filter, and optimize the maintenance backlog to prioritize and group work items.

### Step-by-Step Instructions

1. **Navigate to Page 11 -- Backlog & Schedule**
   - Open the Streamlit sidebar and click **Backlog & Schedule**.
   - The page has three tabs: **Backlog**, **Optimize**, and **Schedule**.

2. **Review Current Backlog (Backlog Tab)**
   - **Filter by Status**: Select from:
     - `AWAITING_MATERIALS`
     - `AWAITING_SHUTDOWN`
     - `AWAITING_APPROVAL`
     - `SCHEDULED`
   - **Filter by Priority**: Select from:
     - `1_EMERGENCY`
     - `2_URGENT`
     - `3_NORMAL`
     - `4_PLANNED`
   - View summary metrics:
     - **Total Items**: Count of backlog items
     - **Materials Ready**: Items with all materials available
     - **Total Hours**: Sum of estimated work hours
   - A priority distribution pie chart visualizes the breakdown.
   - The full backlog data table is shown below.

3. **Run Backlog Optimization (Optimize Tab)**
   - Switch to the **Optimize** tab.
   - Enter the **Plant ID** (default: `OCP-JFC1`).
   - Set the **Planning Horizon** using the slider (7 to 90 days, default: 30).
   - Click **Run Optimization** (blue primary button).
   - Review optimization results:
     - **Total Items**: Total backlog items analyzed
     - **Schedulable Now**: Items ready to schedule
     - **Blocked**: Items with unresolved dependencies
     - **Work Packages**: Suggested work package groupings
   - A stratification chart shows the backlog breakdown.
   - Click **Approve Schedule** to confirm the optimized schedule.

4. **View Latest Schedule (Schedule Tab)**
   - Switch to the **Schedule** tab.
   - View the approved schedule:
     - Status and period date range
     - Utilization chart showing resource allocation
     - Work packages included in the schedule
     - Alerts for overdue items, priority escalations, or material delays

### API Endpoints Called

```
GET  /api/v1/backlog/?status=AWAITING_MATERIALS&priority=2_URGENT
POST /api/v1/backlog/optimize
     { "plant_id": "OCP-JFC1", "period_days": 30 }
PUT  /api/v1/backlog/optimizations/{optimization_id}/approve
GET  /api/v1/backlog/schedule
```

### Expected Output

**Optimization result:**
```json
{
  "optimization_id": "uuid-...",
  "total_items": 25,
  "schedulable_now": 18,
  "blocked": 7,
  "work_packages": 5,
  "stratification": { "emergency": 2, "urgent": 5, "normal": 11, "planned": 7 }
}
```

### Error Handling

| Issue | Solution |
|---|---|
| "No backlog items" | Approved work requests must be added to the backlog. Process work requests on Pages 9-10 first. |
| Optimization returns 0 schedulable | Check material readiness and equipment availability. Adjust the planning horizon. |
| Schedule approval fails | Ensure the optimization has not already been approved. |

---

## User Story MP-04: Create Weekly Maintenance Program

**Goal**: Create and manage weekly maintenance programs that allocate work packages to specific weeks, track resources, and generate Gantt charts.

### Step-by-Step Instructions

1. **Navigate to Page 12 -- Weekly Scheduling**
   - Open the Streamlit sidebar and click **Weekly Scheduling**.
   - The page has three tabs: **Programs**, **Resources**, and **Gantt**.

2. **Create a New Program (Programs Tab)**
   - Enter the **Plant ID** (default: `OCP-JFC1`).
   - Set the **Week Number** (1--53).
   - Set the **Year** (default: 2025).
   - Click **Create Program** (blue primary button).
   - A success message shows the created program ID.

3. **Review Existing Programs**
   - Below the creation form, existing programs are listed with:
     - Program ID (truncated)
     - Week/Year
     - Status
     - Total hours
   - For `DRAFT` programs, a **Finalize** button is available.
   - Click **Finalize** to lock the program for execution.

4. **Check Resource Utilization (Resources Tab)**
   - Switch to the **Resources** tab.
   - View resource data for the most recently created program:
     - **Total Hours**: Sum of planned work hours
     - **Work Packages**: Number of work packages assigned
     - **Conflicts**: Number of resource conflicts detected
   - A utilization chart shows daily resource allocation percentages.
   - Any scheduling conflicts are displayed as warnings.

5. **View Gantt Chart (Gantt Tab)**
   - Switch to the **Gantt** tab.
   - The Gantt chart shows work packages plotted on a timeline.
   - Use the **Download Excel** button to export the Gantt data (via the API export endpoint).

### API Endpoints Called

```
POST /api/v1/scheduling/programs
     { "plant_id": "OCP-JFC1", "week_number": 12, "year": 2025 }
GET  /api/v1/scheduling/programs?plant_id=OCP-JFC1
GET  /api/v1/scheduling/programs/{program_id}
PUT  /api/v1/scheduling/programs/{program_id}/finalize
GET  /api/v1/scheduling/programs/{program_id}/gantt
GET  /api/v1/scheduling/programs/{program_id}/gantt/export
```

### Expected Output

**Program creation response:**
```json
{
  "program_id": "uuid-...",
  "plant_id": "OCP-JFC1",
  "week_number": 12,
  "year": 2025,
  "status": "DRAFT",
  "total_hours": 156.5,
  "work_packages": [...],
  "resource_slots": [...],
  "conflicts": []
}
```

### Error Handling

| Issue | Solution |
|---|---|
| "Error creating program" | Ensure backlog items exist and have been optimized. Check API logs. |
| No work packages in program | Run backlog optimization first (Page 11, Optimize tab). |
| Finalize fails | Resolve all resource conflicts shown in the Resources tab first. |
| Empty Gantt chart | Create a program first. Ensure it contains work packages. |

---

## User Story MP-05: Build Work Packages

**Goal**: View, validate, and approve maintenance work packages that group related tasks together.

### Step-by-Step Instructions

1. **Navigate to Page 4 -- Strategy**
   - Open the Streamlit sidebar and click **Strategy**.
   - The page has three tabs: **Tasks**, **Work Packages**, and **Naming Validation**.

2. **Review Maintenance Tasks (Tasks Tab)**
   - View the list of all maintenance tasks with columns:
     - Task ID, Name, Task Type, Status
   - This provides context for which tasks are available for packaging.

3. **Review Work Packages (Work Packages Tab)**
   - Switch to the **Work Packages** tab.
   - View all work packages with columns:
     - Work Package ID, Name, Code, Status
   - For `DRAFT` work packages:
     - Select the work package from the dropdown.
     - Click **Approve Work Package** to change status to `APPROVED`.

4. **Validate Naming Conventions (Naming Tab)**
   - Switch to the **Naming Validation** tab.
   - **Task Name Validation**:
     - Enter a task name (e.g., `"INSPECT_BEARING_CONDITION_SAG_ML_001"`).
     - Select the task type (INSPECT, CHECK, TEST, LUBRICATE, CLEAN, REPLACE, REPAIR, CALIBRATE).
     - Click **Validate Task Name**.
     - Green success message if valid; warnings list any naming issues.
   - **Work Package Name Validation**:
     - Enter a work package name.
     - Click **Validate WP Name**.

### API Endpoints Called

```
GET  /api/v1/tasks/
GET  /api/v1/work-packages/
PUT  /api/v1/work-packages/{wp_id}/approve
POST /api/v1/tasks/validate-name       { "name": "...", "task_type": "INSPECT" }
POST /api/v1/tasks/validate-wp-name    { "name": "..." }
```

### Expected Output

**Work package approval:**
```json
{
  "work_package_id": "uuid-...",
  "status": "APPROVED"
}
```

**Task name validation:**
```json
{
  "valid": true,
  "issues": []
}
```

### Error Handling

| Issue | Solution |
|---|---|
| "Cannot connect to API" | Start the API server. Verify the database is seeded. |
| No draft work packages available | Work packages must be created first (either via seed data or from FMEA/strategy flow). |
| Naming validation returns issues | Follow the suggested corrections in the warning messages. |
| Approval fails with 409 | The work package may already be approved or in an invalid state. |

---

## Quick Reference: Planner Workflow

```
Page 9: Work Requests     Page 10: Planner          Page 11: Backlog
+-------------------+     +-------------------+     +--------------------+
| Review & validate |---->| AI recommendation |---->| Optimize backlog   |
| Approve / Reject  |     | Approve / Modify  |     | Approve schedule   |
+-------------------+     | Escalate / Defer  |     +--------------------+
                          +-------------------+              |
                                                             v
                          Page 12: Scheduling        Page 4: Strategy
                          +-------------------+     +--------------------+
                          | Create program    |<----| Review tasks & WPs |
                          | Finalize & Gantt  |     | Approve WPs        |
                          +-------------------+     +--------------------+
```
