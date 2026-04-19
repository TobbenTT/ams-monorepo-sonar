# How-To Guide: Administrator

**Role**: Administrator
**Modules**: Admin, SAP Integration, Data Management
**Pages**: Page 7 (Overview), Page 6 (SAP Review), Page 15 (Reports & Data -- Import)

## Role Description

Administrators are responsible for system setup and maintenance: seeding the database with demo data, uploading data from Excel templates, reviewing SAP upload packages, monitoring the audit log, and managing user feedback. They ensure the platform has the data foundation needed for all other roles to operate.

---

## Prerequisites

| Requirement | Details |
|---|---|
| API server running | `uvicorn api.main:app --reload` on `http://localhost:8000` |
| Streamlit app running | `streamlit run streamlit_app/Home.py` on `http://localhost:8501` |
| Admin access | Full access to all admin endpoints and database operations |
| Excel templates | Available in the `templates/` directory of the project |

---

## User Story AD-01: Seed Database with Demo Data

**Goal**: Populate the database with a complete set of demo data including plants, equipment hierarchy, criticality assessments, failure modes, maintenance tasks, work packages, and work orders.

### Step-by-Step Instructions

1. **Navigate to Page 7 -- Overview**
   - Open the Streamlit sidebar and click **Overview**.

2. **Review Current Database State**
   - The top of the page shows three metric cards:
     - **Plants**: Number of plants in the database
     - **Total Nodes**: Total hierarchy nodes
     - **Equipment Items**: Count of EQUIPMENT-type nodes
   - A pie chart shows the distribution of hierarchy node types.
   - If all metrics show 0, the database needs seeding.

3. **Check Agent Status**
   - The **Agent Status** section shows whether the OpenAI API key is configured.
   - If configured, a green success message lists available AI agents.
   - The AI agents are optional but enhance capture classification and hierarchy building.

4. **Seed the Database**
   - In the **Database Management** section, click **Seed Database**.
   - A spinner appears while seeding is in progress.
   - On success, a green message shows: "Database seeded: {result}"
   - The result includes counts of created entities.

5. **Verify the Seed**
   - The metric cards at the top should now show non-zero values.
   - Navigate to Page 1 (Hierarchy) to verify plants and nodes were created.

### API Endpoint Called

```
POST /api/v1/admin/seed-database
```

### Expected Output

```json
{
  "plants_created": 1,
  "nodes_created": 45,
  "criticality_assessments": 12,
  "failure_modes": 36,
  "maintenance_tasks": 24,
  "work_packages": 8,
  "work_orders": 15
}
```

### Error Handling

| Issue | Solution |
|---|---|
| "Seed failed" error | Check API logs for database connection issues. Verify SQLite file permissions. |
| Duplicate key errors | The database may already be seeded. Use the reset endpoint first if re-seeding. |
| Partial seed | Check API logs. Some entities may have been created before the error. Consider resetting. |

**Warning**: The reset endpoint (`DELETE /api/v1/admin/reset-database`) deletes ALL data. Use with extreme caution.

---

## User Story AD-02: Upload Data from Excel Templates

**Goal**: Upload bulk data into the system using the standardized Excel templates provided in the `templates/` directory.

### Available Templates

The `templates/` directory contains 13 Excel templates:

| # | Template File | Data Type |
|---|---|---|
| 01 | `01_equipment_hierarchy.xlsx` | Plant and equipment hierarchy nodes |
| 02 | `02_criticality_assessment.xlsx` | Criticality assessment scores |
| 03 | `03_failure_modes.xlsx` | FMEA failure modes and causes |
| 04 | `04_maintenance_tasks.xlsx` | Maintenance task definitions |
| 05 | `05_work_packages.xlsx` | Work package groupings |
| 06 | `06_work_order_history.xlsx` | Historical work order data |
| 07 | `07_spare_parts_inventory.xlsx` | Spare parts catalog |
| 08 | `08_shutdown_calendar.xlsx` | Planned shutdown schedule |
| 09 | `09_workforce.xlsx` | Workforce and specialty data |
| 10 | `10_field_capture.xlsx` | Field observation records |
| 11 | `11_rca_events.xlsx` | Root cause analysis events |
| 12 | `12_planning_kpi_input.xlsx` | Planning KPI input data |
| 13 | `13_de_kpi_input.xlsx` | Defect elimination KPI data |

### Step-by-Step Instructions

1. **Navigate to Page 15 -- Reports & Data**
   - Open the Streamlit sidebar and click **Reports & Data**.
   - Switch to the **Import** tab.

2. **Select Import Type**
   - Choose the data type from the dropdown:
     - `EQUIPMENT_HIERARCHY`
     - `FAILURE_HISTORY`
     - `MAINTENANCE_PLAN`

3. **Prepare Your Data**
   - Download the appropriate template from the `templates/` directory.
   - Fill in the template with your actual data.
   - Alternatively, paste JSON data directly into the text area.

4. **Upload or Paste Data**
   - **File Upload**: Use the file uploader to select a `.csv` or `.xlsx` file.
   - **JSON Paste**: Paste properly formatted JSON into the text area.
   - Example JSON for equipment:
     ```json
     [
       {
         "equipment_id": "EQ-001",
         "description": "SAG Mill Drive Motor",
         "equipment_type": "ROTATING"
       }
     ]
     ```

5. **Validate the Import**
   - Click **Validate Import**.
   - Review the validation results:
     - **Total Rows**: Number of rows in the dataset
     - **Valid Rows**: Rows passing all validation rules
     - **Error Rows**: Rows with validation issues
   - If errors exist, the first 10 are displayed with:
     - Row number
     - Column name
     - Error message

6. **Fix and Re-validate**
   - Correct the identified errors in your data.
   - Re-paste or re-upload the corrected data.
   - Click **Validate Import** again until all rows are valid.

### API Endpoint Called

```
POST /api/v1/reporting/import/validate
     {
       "source": "EQUIPMENT_HIERARCHY",
       "rows": [
         { "equipment_id": "EQ-001", "description": "SAG Mill", "equipment_type": "ROTATING" }
       ]
     }
```

### Expected Output

```json
{
  "total_rows": 45,
  "valid_rows": 42,
  "error_rows": 3,
  "errors": [
    { "row": 12, "column": "equipment_type", "message": "Invalid type: must be one of ROTATING, STATIC, ELECTRICAL, INSTRUMENT" },
    { "row": 23, "column": "equipment_id", "message": "Duplicate equipment_id: EQ-015" },
    { "row": 38, "column": "description", "message": "Description is required" }
  ]
}
```

### Error Handling

| Issue | Solution |
|---|---|
| "Validation failed" | Check JSON syntax. Ensure data matches the expected schema. |
| Many error rows | Download the template and verify column names and data types match exactly. |
| File upload not recognized | Ensure file extension is `.csv` or `.xlsx`. |
| JSON parse error | Validate your JSON at a JSON validator. Ensure it is a list of objects. |

---

## User Story AD-03: Review SAP Upload Data

**Goal**: Review SAP upload packages generated by the system, approve them for upload to SAP, and explore mock SAP transaction data.

### Step-by-Step Instructions

1. **Navigate to Page 6 -- SAP Review**
   - Open the Streamlit sidebar and click **SAP Review**.
   - The page has two tabs: **Upload Packages** and **Mock Explorer**.

2. **Review Upload Packages (Upload Packages Tab)**
   - The data table shows all SAP upload packages with columns:
     - Package ID, Plant Code, Status
   - Status progression: `GENERATED` -> `REVIEWED` -> `APPROVED`

3. **Approve Pending Packages**
   - Packages with status `GENERATED` or `REVIEWED` appear in the **Pending Approval** section.
   - Select a package from the dropdown.
   - Read the safety warning about data integrity.
   - Click **Approve Upload** to advance the package status.
   - A success message confirms the approval.

4. **Explore Mock SAP Data (Mock Explorer Tab)**
   - Switch to the **Mock Explorer** tab.
   - Select a **SAP Transaction** code:
     - `IE03` -- Display Equipment (equipment master data)
     - `IW38` -- Change Work Order (work order list)
     - `IP10` -- Schedule Maintenance (maintenance plan)
     - `MM60` -- Material List (spare parts)
     - `IL03` -- Display Functional Location (hierarchy)
   - Click **Load Mock Data**.
   - View the returned data in a table (up to 50 records).

### API Endpoints Called

```
GET  /api/v1/sap/uploads
PUT  /api/v1/sap/uploads/{package_id}/approve
GET  /api/v1/sap/mock/{transaction}
```

### Expected Output

**Upload approval:**
```json
{
  "package_id": "uuid-...",
  "status": "APPROVED",
  "approved_at": "2025-03-23T15:00:00"
}
```

**Mock data (IE03):**
```json
[
  {
    "equipment_number": "10001234",
    "description": "SAG Mill BRY-001",
    "functional_location": "BRY-GRD-SAG",
    "equipment_category": "M",
    "manufacturer": "FLSmidth"
  }
]
```

### Error Handling

| Issue | Solution |
|---|---|
| "Cannot connect" | Start the API server. |
| No packages listed | SAP packages must be generated first through the strategy workflow. |
| Approval fails (409) | Package may already be approved or in an invalid state. Check current status. |
| Mock data error: "Run seed first" | Execute database seed from Page 7 to populate mock SAP data. |

---

## User Story AD-04: View Audit Log

**Goal**: Review the system audit log to track all create, update, approve, and delete actions across the platform.

### Step-by-Step Instructions

1. **Navigate to Page 7 -- Overview**
   - Scroll down to the **Audit Log** section.

2. **Filter the Audit Log**
   - Use the **Filter by Entity** dropdown to narrow results:
     - `ALL` -- Show all entries
     - `plant` -- Plant creation/modification
     - `hierarchy_node` -- Hierarchy changes
     - `criticality_assessment` -- Criticality actions
     - `failure_mode` -- FMEA changes
     - `maintenance_task` -- Task modifications
     - `work_package` -- Work package actions
     - `sap_upload` -- SAP package events
     - `system` -- System-level events (seed, reset)

3. **Review Log Entries**
   - The data table displays the most recent 20 entries with columns:
     - **ID**: Sequential log entry ID
     - **Entity Type**: The type of entity affected
     - **Entity ID**: The UUID of the affected entity
     - **Action**: The action performed (CREATE, UPDATE, APPROVE, DELETE, SEED)
     - **User**: Who performed the action
     - **Timestamp**: When the action occurred

### API Endpoint Called

```
GET /api/v1/admin/audit-log?entity_type=criticality_assessment&limit=20
```

### Expected Output

```json
[
  {
    "id": 142,
    "entity_type": "criticality_assessment",
    "entity_id": "uuid-...",
    "action": "APPROVE",
    "user": "system",
    "timestamp": "2025-03-23T14:30:00"
  }
]
```

### Error Handling

| Issue | Solution |
|---|---|
| Empty audit log | The database may be empty. Seed the database to generate initial audit entries. |
| Audit log not loading | API server may be down. Check connection. |

---

## User Story AD-05: Manage User Feedback

**Goal**: Review user feedback submitted from any page in the application and monitor user satisfaction.

### Overview

Every page in the application includes a **Feedback Widget** at the bottom. Users can submit ratings (1-5) and optional comments about their experience. As an administrator, you can review all feedback submissions.

### Step-by-Step Instructions

1. **View Feedback via API**
   - There is no dedicated Streamlit page for feedback management. Use the API directly.
   - List all feedback:
     ```
     GET /api/v1/admin/feedback
     ```
   - Filter by page:
     ```
     GET /api/v1/admin/feedback?page=field_capture&limit=50
     ```

2. **Review Feedback Entries**
   - Each entry contains:
     - **feedback_id**: Unique identifier
     - **page**: Which page the feedback was submitted from
     - **rating**: 1 (poor) to 5 (excellent)
     - **comment**: Optional user comment
     - **created_at**: Submission timestamp

3. **Submit Test Feedback (via API)**
   - To test the feedback system:
     ```
     POST /api/v1/admin/feedback
     {
       "page": "hierarchy",
       "rating": 4,
       "comment": "The vendor hierarchy builder is very useful."
     }
     ```

### API Endpoints Called

```
GET  /api/v1/admin/feedback?page=field_capture&limit=50
POST /api/v1/admin/feedback
     { "page": "hierarchy", "rating": 4, "comment": "..." }
```

### Expected Output

```json
[
  {
    "feedback_id": "uuid-...",
    "page": "field_capture",
    "rating": 4,
    "comment": "Easy to use, but voice capture could be improved.",
    "created_at": "2025-03-23T10:15:00"
  }
]
```

### Available Feedback Pages

Feedback widgets are present on every Streamlit page with these identifiers:

| Page | Feedback Key |
|---|---|
| Page 1: Hierarchy | `hierarchy` |
| Page 2: Criticality | `criticality` |
| Page 3: FMEA | `fmea` |
| Page 4: Strategy | `strategy` |
| Page 5: Analytics | `analytics` |
| Page 6: SAP Review | `sap_review` |
| Page 7: Overview | `overview` |
| Page 8: Field Capture | `field_capture` |
| Page 9: Work Requests | `work_requests` |
| Page 10: Planner | `planner` |
| Page 11: Backlog | `backlog` |
| Page 12: Scheduling | `scheduling` |
| Page 13: Reliability | `reliability` |
| Page 14: Executive Dashboard | `executive_dashboard` |
| Page 15: Reports & Data | `reports_data` |
| Page 16: FMECA | `fmeca` |
| Page 17: Defect Elimination | `defect_elimination` |

### Error Handling

| Issue | Solution |
|---|---|
| Empty feedback list | No users have submitted feedback yet. The system is working correctly. |
| Feedback submission fails | Check API connection and database status. |

---

## Quick Reference: Administrator Workflow

```
Step 1: Initial Setup              Step 2: Data Loading
+-------------------------+        +-------------------------+
| Page 7: Seed database   |------->| Page 15: Import data    |
| Verify agents & stats   |        | Use Excel templates     |
+-------------------------+        | Validate before import  |
                                   +-------------------------+
                                            |
Step 3: SAP Integration            Step 4: Ongoing Monitoring
+-------------------------+        +-------------------------+
| Page 6: Review uploads  |        | Page 7: Audit log       |
| Approve SAP packages    |        | API: User feedback      |
| Explore mock data       |        | Track all system events |
+-------------------------+        +-------------------------+
```

## Excel Template Workflow

```
1. Download template from templates/ directory
2. Fill in data following column headers
3. Go to Page 15 > Import tab
4. Select import type
5. Upload file or paste JSON
6. Click "Validate Import"
7. Fix any errors
8. Re-validate until all rows pass
```
