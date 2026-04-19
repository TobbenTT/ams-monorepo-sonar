# How-To Guide: Reliability Engineer

**Role**: Reliability Engineer
**Modules**: Hierarchy, Criticality, FMEA/RCM, Strategy, FMECA, Vendor Data
**Pages**: Page 1 (Hierarchy), Page 2 (Criticality), Page 3 (FMEA), Page 4 (Strategy), Page 16 (FMECA)

## Role Description

Reliability Engineers are responsible for building and maintaining the equipment hierarchy, assessing equipment criticality, defining failure modes, running RCM (Reliability-Centered Maintenance) decision logic, reviewing FMECA analyses, and defining the resulting maintenance tasks and work packages. They form the analytical foundation of the maintenance strategy.

---

## Prerequisites

| Requirement | Details |
|---|---|
| API server running | `uvicorn api.main:app --reload` on `http://localhost:8000` |
| Streamlit app running | `streamlit run streamlit_app/Home.py` on `http://localhost:8501` |
| Database seeded | Run seed from Page 7 for initial plant and hierarchy data |
| Domain knowledge | Understanding of RCM methodology, FMEA/FMECA, and OCP equipment types |
| Equipment catalog | Access to vendor/OEM documentation for hierarchy building |

---

## User Story RE-01: Set Up Equipment Hierarchy

**Goal**: Browse the existing plant hierarchy, view equipment nodes, and explore subtrees.

### Step-by-Step Instructions

1. **Navigate to Page 1 -- Hierarchy**
   - Open the Streamlit sidebar and click **Hierarchy**.

2. **Select a Plant**
   - Use the **Select Plant** dropdown to choose a plant (e.g., `OCP-JFC1`).
   - If no plants exist, seed the database first (Page 7).

3. **View Hierarchy Statistics**
   - Metric cards display node counts by type.
   - A pie chart shows the distribution of node types (PLANT, AREA, SYSTEM, EQUIPMENT, SUB_ASSEMBLY, MAINTAINABLE_ITEM).

4. **Browse Hierarchy Nodes**
   - Use the **Filter by Type** dropdown to filter nodes:
     - `ALL`, `PLANT`, `AREA`, `SYSTEM`, `EQUIPMENT`, `SUB_ASSEMBLY`, `MAINTAINABLE_ITEM`
   - The data table displays: Node ID, Node Type, Name, Code, Level, Criticality, Tag.

5. **View Node Subtree**
   - Select a node from the **Select Node for Details** dropdown.
   - Click **Show Subtree** to display all child nodes in a hierarchical table.

### API Endpoints Called

```
GET /api/v1/hierarchy/plants
GET /api/v1/hierarchy/stats?plant_id=OCP-JFC1
GET /api/v1/hierarchy/nodes?plant_id=OCP-JFC1&node_type=EQUIPMENT
GET /api/v1/hierarchy/nodes/{node_id}/tree
```

### Expected Output

- A complete hierarchy tree from Plant down to Maintainable Items.
- Node statistics showing count per type.
- Subtree display for any selected node.

### Error Handling

| Issue | Solution |
|---|---|
| "Cannot connect" warning | Start the API server. |
| "No plants found" | Seed the database from Page 7 (Overview). |
| Empty node list | Ensure the selected plant has hierarchy data. Try filtering by a different type. |

---

## User Story RE-02: Run Criticality Assessment

**Goal**: Assess the criticality of equipment using a multi-criteria risk matrix (GFSN methodology) to determine risk class (I through IV).

### Step-by-Step Instructions

1. **Navigate to Page 2 -- Criticality**
   - Open the Streamlit sidebar and click **Criticality**.

2. **Select Equipment**
   - The page automatically loads all `EQUIPMENT` type nodes.
   - Use the **Select Equipment** dropdown to choose an equipment item (displayed as `Name (Code)`).

3. **Review Current Assessment (left column)**
   - If an assessment already exists:
     - **Risk Class**: Current risk classification (e.g., `III_HIGH`)
     - **Overall Score**: Numeric score (e.g., `7.5`)
     - **Status**: `DRAFT` or `APPROVED`
   - For `DRAFT` assessments, click **Approve Assessment** to finalize.

4. **Run New Assessment (right column)**
   - Fill in the **Criticality Matrix Form**:
     - Enter scores for each criterion (Safety, Environment, Production, Quality, Maintenance Cost, etc.) on a scale defined by the GFSN matrix.
     - Set the **Probability** factor.
   - Click **Run Assessment**.

5. **Review Results**
   - Success message shows: "Risk Class: {class}, Score: {score}"
   - Any warnings are displayed (e.g., "High safety consequence detected").

### API Endpoints Called

```
GET  /api/v1/hierarchy/nodes?node_type=EQUIPMENT
GET  /api/v1/criticality/{node_id}
POST /api/v1/criticality/assess
     {
       "node_id": "uuid-...",
       "criteria_scores": { "safety": 4, "environment": 3, "production": 5, ... },
       "probability": 3
     }
PUT  /api/v1/criticality/{assessment_id}/approve
```

### Expected Output

```json
{
  "assessment_id": "uuid-...",
  "node_id": "uuid-...",
  "overall_score": 7.5,
  "risk_class": "III_HIGH",
  "criteria_scores": { "safety": 4, "environment": 3, "production": 5 },
  "probability": 3,
  "status": "DRAFT"
}
```

### Error Handling

| Issue | Solution |
|---|---|
| "No equipment found" | Seed the database or create equipment nodes in the hierarchy first. |
| "No assessment found" | No prior assessment exists. Create one using the right-column form. |
| Warnings after assessment | Review high-scoring criteria. Consider additional mitigation measures. |

---

## User Story RE-03: Define Failure Modes

**Goal**: View existing failure modes and validate mechanism-cause combinations using the GFSN-compliant 72 valid combinations.

### Step-by-Step Instructions

1. **Navigate to Page 3 -- FMEA**
   - Open the Streamlit sidebar and click **FMEA**.
   - The page has three tabs: **Failure Modes**, **Validation**, and **RCM Decision**.

2. **View Registered Failure Modes (Failure Modes Tab)**
   - The data table shows all failure modes with columns:
     - Failure Mode ID, What, Mechanism, Cause, Strategy Type
   - Browse to understand existing failure mode coverage.

3. **Validate a Mechanism-Cause Combination (Validation Tab)**
   - Switch to the **Validation** tab.
   - Select a **Mechanism** from the dropdown (e.g., `FATIGUE`, `CORROSION`, `EROSION`, `OVERLOAD`, `CONTAMINATION`, `DEGRADATION`).
   - Select a valid **Cause** from the dynamically-loaded list (the system fetches valid causes for the selected mechanism).
   - Click **Validate** to confirm the combination is valid.
   - The result shows green (valid) or red (invalid) status.

4. **View All Valid Combinations**
   - Below the validation form, the total number of valid combinations is shown (typically 72).
   - Available mechanisms are listed.

### API Endpoints Called

```
GET  /api/v1/fmea/failure-modes
GET  /api/v1/fmea/fm-combinations?mechanism=FATIGUE
POST /api/v1/fmea/validate-combination
     { "mechanism": "FATIGUE", "cause": "CYCLIC_LOADING" }
```

### Expected Output

**Validation result:**
```json
{
  "valid": true,
  "mechanism": "FATIGUE",
  "cause": "CYCLIC_LOADING"
}
```

### Error Handling

| Issue | Solution |
|---|---|
| "Cannot connect" | Ensure API is running. |
| "Invalid combination" | The selected mechanism-cause pair is not in the GFSN-compliant set. Choose a different cause. |
| Empty cause dropdown | Select a mechanism first. The causes are dynamically loaded per mechanism. |

---

## User Story RE-04: Run RCM Decision Tree

**Goal**: Apply the RCM (Reliability-Centered Maintenance) decision logic to determine the optimal maintenance strategy for a failure mode.

### Step-by-Step Instructions

1. **Navigate to Page 3 -- FMEA, RCM Decision Tab**
   - Click the **RCM Decision** tab on the FMEA page.

2. **Set Decision Tree Inputs (left column)**
   - **Hidden Failure**: Check if the failure is hidden (not evident to operators under normal conditions).
   - **Failure Consequence**: Select the consequence category:
     - `HIDDEN_SAFETY`, `HIDDEN_NONSAFETY`
     - `EVIDENT_SAFETY`, `EVIDENT_ENVIRONMENTAL`
     - `EVIDENT_OPERATIONAL`, `EVIDENT_NONOPERATIONAL`
   - **Failure Pattern**: Select the degradation pattern:
     - `A_BATHTUB`, `B_AGE`, `C_FATIGUE`, `D_STRESS`, `E_RANDOM`, `F_EARLY_LIFE`

3. **Set Feasibility Inputs (right column)**
   - **CBM Technically Feasible**: Check if condition-based monitoring is technically possible.
   - **CBM Economically Viable**: Check if CBM is cost-effective.
   - **FT Feasible**: Check if a failure-finding task is feasible.

4. **Run Decision**
   - Click **Run RCM Decision**.
   - Review the results:
     - **Strategy Type**: The recommended strategy (e.g., `CBM`, `TBM`, `FBM`, `RTF`, `REDESIGN`)
     - **Path**: The decision tree path taken (e.g., `H -> S -> CBM_TECH -> CBM`)
     - **Reasoning**: Textual explanation of why this strategy was chosen
     - If a secondary task is required, a warning is displayed.

### API Endpoints Called

```
POST /api/v1/fmea/rcm-decide
     {
       "is_hidden": false,
       "failure_consequence": "EVIDENT_OPERATIONAL",
       "cbm_technically_feasible": true,
       "cbm_economically_viable": true,
       "ft_feasible": true,
       "failure_pattern": "B_AGE"
     }
```

### Expected Output

```json
{
  "strategy_type": "CBM",
  "path": "EVIDENT -> OPERATIONAL -> CBM_TECH_YES -> CBM_ECON_YES -> CBM",
  "reasoning": "Condition-based maintenance is both technically feasible and economically viable for this evident operational failure.",
  "requires_secondary_task": false
}
```

### Error Handling

| Issue | Solution |
|---|---|
| Unexpected strategy result | Review all input parameters. Ensure consequence and pattern match the actual failure mode. |
| "Requires secondary task" warning | A failure-finding task or additional monitoring task is needed alongside the primary strategy. |

---

## User Story RE-05: Review FMECA Analysis

**Goal**: Create FMECA worksheets, add failure mode rows with Severity-Occurrence-Detection (SOD) scoring, calculate RPN values, and run Stage 4 RCM decisions.

### Step-by-Step Instructions

1. **Navigate to Page 16 -- FMECA Analysis**
   - Open the Streamlit sidebar and click **FMECA Analysis**.
   - The page has three tabs: **Worksheets**, **RPN Calculator**, and **Summary**.

2. **Create a Worksheet (Worksheets Tab)**
   - Enter:
     - **Equipment ID**: Equipment identifier (e.g., `EQ-001`)
     - **Equipment Tag**: Physical tag (e.g., `BRY-SAG-ML-001`)
     - **Equipment Name**: Descriptive name
     - **Analyst**: Your name or identifier
   - Click **Create Worksheet**.
   - The worksheet is created at Stage 1 with a unique ID.

3. **Add Failure Mode Rows**
   - After creating the worksheet, a form appears to add rows:
     - **Function Description**: What the component/system does
     - **Functional Failure**: How the function can fail
     - **Failure Mode**: Specific failure mechanism
     - **Failure Effect**: What happens when this failure occurs
     - **Failure Consequence**: Category (HIDDEN_SAFETY, EVIDENT_OPERATIONAL, etc.)
     - **Severity** (1-10 slider): How severe is the failure effect
     - **Occurrence** (1-10 slider): How often does this failure occur
     - **Detection** (1-10 slider): How easily can it be detected before failure
   - Click **Add Row**. The RPN (S x O x D) is calculated automatically.

4. **View Current Rows**
   - A data table shows all rows with columns:
     - ID, Function, Failure Mode, S, O, D, RPN, Category, Strategy.
   - RPN Categories: LOW (1-49), MEDIUM (50-99), HIGH (100-199), CRITICAL (200-1000).

5. **Advance Through Stages**
   - Use the **Stage Management** section to advance the worksheet through stages.
   - Click **Advance to Stage X** to move forward.

6. **Run Stage 4 Decisions**
   - Click **Run Stage 4 Decisions** to automatically apply RCM logic to all rows.
   - Each row receives a recommended strategy type based on its consequence and feasibility.

7. **Use the RPN Calculator (RPN Calculator Tab)**
   - Adjust Severity, Occurrence, and Detection sliders.
   - The RPN is calculated in real-time with color-coded results.

8. **Review Analysis Summary (Summary Tab)**
   - View overall statistics:
     - Total rows, Average RPN, High/Critical count, Strategies assigned
   - Charts for RPN distribution and strategy distribution.
   - Top risks table showing highest-RPN failure modes.
   - Recommendations for improvement areas.

### API Endpoints Called

```
POST /api/v1/fmea/fmeca/worksheets
     { "equipment_id": "EQ-001", "equipment_tag": "BRY-SAG-ML-001", ... }
POST /api/v1/fmea/fmeca/rpn
     { "severity": 7, "occurrence": 5, "detection": 3 }
PUT  /api/v1/fmea/fmeca/worksheets/{worksheet_id}/run-decisions
GET  /api/v1/fmea/fmeca/worksheets/{worksheet_id}/summary
```

### Expected Output

**Summary response:**
```json
{
  "total_rows": 12,
  "avg_rpn": 145.3,
  "high_critical_count": 4,
  "rpn_distribution": { "LOW": 3, "MEDIUM": 5, "HIGH": 3, "CRITICAL": 1 },
  "strategy_distribution": { "CBM": 5, "TBM": 3, "RTF": 2, "REDESIGN": 2 },
  "top_risks": [...],
  "recommendations": ["Address 4 high/critical RPN items", ...]
}
```

### Error Handling

| Issue | Solution |
|---|---|
| "Create worksheet first" message | Create a worksheet in the Worksheets tab before viewing the Summary. |
| Stage advance fails | Ensure prerequisite stages are completed. Check the minimum row requirements. |
| No strategies after Stage 4 | Ensure all rows have failure consequence values set. |

---

## User Story RE-06: Define Maintenance Tasks

**Goal**: View and validate maintenance tasks that result from the FMEA/RCM analysis.

### Step-by-Step Instructions

1. **Navigate to Page 4 -- Strategy, Tasks Tab**
   - Open the Streamlit sidebar and click **Strategy**.
   - The **Tasks** tab is selected by default.

2. **Review Maintenance Tasks**
   - The data table shows all maintenance tasks:
     - Task ID, Name, Task Type, Status
   - Task types include: INSPECT, CHECK, TEST, LUBRICATE, CLEAN, REPLACE, REPAIR, CALIBRATE.

3. **Validate Task Naming**
   - Switch to the **Naming Validation** tab.
   - Enter a task name and select the task type.
   - Click **Validate Task Name**.
   - The system checks the name against GFSN naming conventions.

### API Endpoints Called

```
GET  /api/v1/tasks/
POST /api/v1/tasks/validate-name  { "name": "INSPECT_BEARING_TEMP", "task_type": "INSPECT" }
```

### Error Handling

| Issue | Solution |
|---|---|
| Empty task list | Run FMEA analysis and RCM decisions first. Tasks are generated from the strategy flow. |
| Naming validation fails | Follow the specific issue descriptions in the warning messages to correct the name. |

---

## User Story RE-07: Build Hierarchy from Vendor Data

**Goal**: Automatically generate a complete equipment hierarchy (equipment, sub-assemblies, maintainable items) from vendor/OEM specifications.

### Step-by-Step Instructions

1. **Navigate to Page 1 -- Hierarchy**
   - Scroll down to the **Build from Vendor Data** section (below the node browser).

2. **Fill in the Vendor Data Form**
   - **Area Code**: 3-4 character area identifier (e.g., `BRY`)
   - **Equipment Type**: Select from the dropdown:
     - SAG_MILL, BALL_MILL, ROD_MILL, SLURRY_PUMP, FLOTATION_CELL,
     - BELT_CONVEYOR, THICKENER, BELT_FILTER, ROTARY_DRYER, CRUSHER,
     - VIBRATING_SCREEN, HYDROCYCLONE, AGITATOR, COMPRESSOR, HEAT_EXCHANGER
   - **Model**: Equipment model number (e.g., `36x20`)
   - **Manufacturer**: OEM name (e.g., `FLSmidth`)
   - **Power (kW)**: Rated power
   - **Weight (kg)**: Equipment weight

3. **Build Hierarchy**
   - Click **Build Hierarchy** (the form submit button).
   - The AI engine generates a complete hierarchy based on the equipment type and vendor data.

4. **Review Results**
   - Success message shows: "Nodes Created: X" with the count of generated nodes.
   - Full JSON response shows the complete hierarchy structure.
   - Browse the newly created nodes in the hierarchy browser above.

### API Endpoints Called

```
POST /api/v1/hierarchy/build-from-vendor
     {
       "plant_id": "OCP-JFC1",
       "area_code": "BRY",
       "equipment_type": "SAG_MILL",
       "model": "36x20",
       "manufacturer": "FLSmidth",
       "power_kw": 12000.0,
       "weight_kg": 450000.0
     }
```

### Expected Output

```json
{
  "nodes_persisted": 15,
  "equipment_node": { "node_id": "uuid-...", "name": "SAG Mill 36x20", "tag": "BRY-SAG-ML-001" },
  "sub_assemblies": [
    { "name": "Mill Shell", "type": "SUB_ASSEMBLY" },
    { "name": "Drive System", "type": "SUB_ASSEMBLY" },
    { "name": "Lubrication System", "type": "SUB_ASSEMBLY" }
  ],
  "maintainable_items": [
    { "name": "Drive Motor Bearings", "type": "MAINTAINABLE_ITEM" },
    { "name": "Pinion Gear", "type": "MAINTAINABLE_ITEM" }
  ]
}
```

### Error Handling

| Issue | Solution |
|---|---|
| "Missing required fields" (422) | Ensure plant_id, area_code, and equipment_type are all provided. |
| Build returns error (400) | Check that the plant exists. Verify the area code is valid. |
| Fewer nodes than expected | The hierarchy depth depends on the equipment type. Some types have simpler structures. |

---

## Quick Reference: Reliability Engineer Workflow

```
Page 1: Hierarchy           Page 2: Criticality        Page 3: FMEA
+--------------------+     +--------------------+     +-------------------+
| Browse hierarchy   |---->| Assess criticality |---->| Define failure    |
| Build from vendor  |     | Approve assessment |     | modes & validate  |
+--------------------+     +--------------------+     | Run RCM decisions |
                                                      +-------------------+
                                                              |
                    Page 4: Strategy              Page 16: FMECA
                    +--------------------+        +--------------------+
                    | Review tasks       |<-------| Create worksheets  |
                    | Validate names     |        | Add rows (SOD)     |
                    | Approve work pkgs  |        | Run Stage 4        |
                    +--------------------+        | Review summary     |
                                                  +--------------------+
```
