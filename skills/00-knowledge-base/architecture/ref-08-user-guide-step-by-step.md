# REF-08: Step-by-Step User Guide — OCP Maintenance AI MVP

## How to Use This Software (4 Modules)

---

## Overview of Modules

| Module                             | Purpose                                                                 | Primary User                                |
| ---------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------- |
| **M1: Field Capture**        | Capture maintenance issues from the field via text/voice/image          | Field Technician                            |
| **M2: Planner Assistant**    | Review AI-structured work requests and validate with data               | Maintenance Planner                         |
| **M3: Backlog Optimization** | Visualize, stratify, and optimize the maintenance backlog               | Maintenance Planner / Superintendent        |
| **M4: Strategy Development** | Build maintenance strategies from plant hierarchy through work packages | Reliability Engineer / Maintenance Engineer |

---

## MODULE 1: Intelligent Field Capture

### Who Uses It: Field Technicians, Operators

### Step-by-Step

**Step 1: Open Field Capture**

- Open the application on mobile device or web browser
- Select "New Work Request" / "Nouvelle Demande de Travail"

**Step 2: Identify Equipment**

- Option A: Type or scan the equipment TAG (e.g., BRY-SAG-ML-001)
- Option B: Select from hierarchy tree (Plant → Area → System → Equipment)
- Option C: Describe verbally ("the SAG mill in Broyage") — AI resolves the TAG

**Step 3: Describe the Problem**

- Option A: Type description in French, English, or Arabic
- Option B: Record voice description (press and hold microphone button)
- Option C: Take photo(s) of the issue (max 5 photos)
- You can combine all three: voice + text + photos (with the capability of taking directly the photos as many photos as required by the user. Dont allow uploading photos form the phone collection, just taking photos)

**Step 4: Review AI Draft**

- The AI automatically generates a structured work request:
  - Equipment identified (with confidence score)
  - Problem description (standardized)
  - Suggested failure mode
  - Suggested priority (1=Emergency, 2=Urgent, 3=Normal, 4=Planned)
  - Suggested spare parts
  - Required specialties
  - Safety flags (LOTO, confined space, etc.)
- Status: **DRAFT** — nothing is submitted yet

**Step 5: Confirm or Adjust**

- Review each AI suggestion
- Correct the equipment TAG if AI got it wrong
- Adjust the description if needed
- Tap "Submit to Planner" / "Envoyer au Planificateur"
- Status changes to: **PENDING_VALIDATION**

**Step 6: Track Status**

- View your submitted requests in "My Requests" / "Mes Demandes"
- See real-time status: Pending → Validated → Scheduled → In Progress → Completed

---

## MODULE 2: AI Planner Assistant

### Who Uses It: Maintenance Planners

### Step-by-Step

**Step 1: Open Work Request Queue**

- Open the Planner Dashboard
- View list of pending work requests sorted by priority
- Each request shows: equipment, problem summary, AI priority, timestamp

**Step 2: Select a Work Request**

- Click on a work request to see full detail
- The AI has already structured:
  - Equipment identification + TAG
  - Standardized problem description
  - Failure mode classification
  - Priority suggestion with justification
  - Estimated duration
  - Required specialties

**Step 3: Review AI Planner Recommendation**

- Click "Get AI Recommendation" / "Obtenir Recommandation IA"
- The AI analyzes against real data:
  - **Materials:** Are spare parts in stock? If not, when arriving?
  - **Workforce:** Are the right specialists available? Next available slot?
  - **Shutdown:** Is a shutdown window available? When?
  - **Production:** What's the estimated production impact?
  - **Groupable:** Can this work be grouped with other pending requests?
  - **Risk:** What's the overall risk level?
- AI suggests: Recommended date, shift, and action (Approve / Modify / Escalate / Defer)

**Step 4: Validate or Modify**

- **Approve:** Accept AI recommendation as-is → Click "Approve" / "Approuver"
- **Modify:** Change priority, date, resources, or any field → Click "Validate Modified" / "Valider Modifié"
- **Reject:** Not a valid request → Click "Reject" with reason / "Rejeter"
- **Escalate:** Needs superintendent/manager review → Click "Escalate" / "Escalader"
- Status changes to: **VALIDATED** or **REJECTED**

**Step 5: Validated requests enter the Backlog**

- Validated work requests automatically appear in the Backlog module

---

## MODULE 3: Backlog Optimization

### Who Uses It: Maintenance Planners, Superintendents

### Step-by-Step

**Step 1: Open Backlog Dashboard**

- View the current backlog stratified by:
  - **By Reason:** Awaiting Materials | Awaiting Shutdown | Awaiting Resources | Awaiting Approval | Schedulable
  - **By Priority:** Emergency | Urgent | Normal | Planned
  - **By Equipment Criticality:** AA | A+ | A | B | C | D
- Charts show totals and trends

**Step 2: Identify Bottlenecks**

- Red alerts show: overdue items, material delays, resource conflicts
- Click any segment to drill down to individual work requests
- Filter by area, equipment type, trade, or date range

**Step 3: Run Backlog Optimization**

- Click "Optimize Backlog" / "Optimiser le Backlog"
- The AI analyzes ALL constraints simultaneously:
  - Available workforce by specialty and shift
  - Material availability and expected delivery dates
  - Shutdown windows (next 6 months)
  - Production schedule and maintenance windows
  - Equipment criticality and risk levels
- AI generates:
  - **Work Packages:** Groups of tasks that should be done together (same equipment, same shutdown, same area)
  - **Schedule Proposal:** Day-by-day, shift-by-shift plan with utilization %

**Step 4: Review Schedule Proposal**

- View calendar/Gantt chart of proposed schedule
- Each work package shows: tasks, team, materials, duration
- Check for conflicts or overloads
- Drag and drop to adjust manually if needed

**Step 5: Approve Schedule**

- **Approve as-is:** Click "Approve Schedule" / "Approuver Planning"
- **Modify:** Adjust dates, assignments, groupings → "Approve Modified"
- **Defer packages:** Move work packages to future periods
- Approved work packages are ready for execution (or SAP upload)

---

## MODULE 4: Maintenance Strategy Development

### Who Uses It: Reliability Engineers, Maintenance Engineers

### Overview of the Full Flow

```
Step 1: Build/Import Plant Hierarchy
    ↓
Step 2: Assess Equipment Criticality
    ↓
Step 3: Define Functions & Functional Failures (AI-assisted)
    ↓
Step 4: Analyze Failure Modes (AI auto-generates draft FMEA)
    ↓
Step 5: Select Maintenance Strategy per Failure Mode (RCM decision tree)
    ↓
Step 6: Define Tasks (Primary + Secondary)
    ↓
Step 7: Assign Resources (Labour + Materials)
    ↓
Step 8: Create Work Packages
    ↓
Step 9: Quality Review
    ↓
Step 10: Generate SAP Upload Sheets
```

### Detailed Steps

**Step 1: Build / Import Plant Hierarchy**

- Option A: **Manual build** — Create nodes level by level:
  - Plant → Area → System → Equipment → Sub-Assembly → Maintainable Item
- Option B: **Import from library** — Search Equipment Library, select make/model
  - AI automatically suggests sub-assembly decomposition and components
  - Example: Select "SAG Mill" → AI proposes: Drive System (motor, gearbox, coupling), Grinding System (liners, lifter bars, shell), Feed System (feed chute, feed trunnion), Discharge System (discharge trunnion, trommel screen), Lubrication System (pumps, filters, coolers), Instrumentation (vibration sensors, temperature sensors, load cells)
- Option C: **Import from SAP** — Upload CSV/Excel of existing SAP functional locations and equipment
- Option D: **AI-assisted build** — Describe the equipment ("Warman 750 VK slurry pump") and AI generates complete hierarchy from OEM knowledge + library

For each equipment node:

- Enter SAP functional location code (or generate)
- Enter equipment TAG
- Enter manufacturer, model, serial number
- Enter installation date, power, weight

**Step 2: Criticality Assessment**

- Select equipment node → Click "Assess Criticality" / "Évaluer la Criticité"
- AI pre-fills a suggested criticality based on equipment type and context
- Review/adjust each criterion:
  - Safety (1-5), Health (1-5), Environment (1-5), Production (1-5), Operating Cost (1-5), Capital Cost (1-5), Schedule (1-5), Revenue (1-5), Communications (1-5), Compliance (1-5), Reputation (1-5)
  - Set Probability (1-5)
- System auto-calculates: Risk Class (I/II/III/IV)
- Add comments/justification
- Status: DRAFT → Click "Submit for Review" → REVIEWED → "Approve" → APPROVED

**Step 3: Functions & Functional Failures**

- Select a maintainable item → Click "Define Functions"
- AI auto-generates draft functions based on:
  - Component type and equipment context
  - OEM documentation (if uploaded)
  - Library templates
- For each function:
  - Type: Primary / Secondary / Protective
  - Description: Verb + Noun + Performance Standard
  - Example: "To pump slurry at minimum 9,772 m3/Hr at 365 kPa"
- Define Functional Failures for each function:
  - Total failure: "Pumps 0 m3/Hr"
  - Partial failure: "Delivers less than 9,772 m3/Hr"
- Review AI suggestions, modify or add, then approve

**Step 4: Failure Mode Analysis (FMEA)**

- For each functional failure → Click "Analyze Failure Modes"
- AI auto-generates a complete FMEA draft:
  - **What:** Sub-component that fails (e.g., "Impeller")
  - **Mechanism:** How it fails (e.g., "Worn")
  - **Cause:** Why (e.g., "Abrasion")
  - **Failure Effect:** Evidence, safety, production impact, downtime
  - **Failure Consequence:** Hidden/Evident, Safety/Environmental/Operational/NonOperational
  - **Failure Pattern:** A-F (Nowlan & Heap)
- AI confidence score shown for each failure mode
- Engineer reviews each failure mode:
  - Accept, modify, or delete
  - Add missing failure modes manually
  - Mark as Recommended or Redundant
- Table view shows all failure modes with color-coded confidence

**Step 5: Strategy Selection (RCM Decision Tree)**

- For each failure mode → The system guides through the RCM decision tree:
  1. Is the failure **hidden or evident**?
  2. If hidden: Can a proactive task reduce risk? → FFI or Redesign
  3. If evident: What consequence? (Safety/Environmental/Operational/Non-operational)
  4. Is **condition-based monitoring** technically feasible AND economically viable?
     - What technique? (Vibration, Oil, Thermography, Visual, NDT, etc.)
     - What is the P-F interval?
     - Can we monitor at < P-F interval?
  5. Is **time-based replacement** feasible? (Only for age-related patterns A, B, C)
  6. No proactive task? → Safety consequence: Redesign. Otherwise: Run-to-Failure.
- AI pre-selects strategy type based on failure mode characteristics
- Engineer confirms: **CB / FT / RTF / FFI / Redesign / OEM**
- Sets frequency based on guidance:
  - Calendar for age-related (Age, Contamination)
  - Operational units for usage-related (Use, Abrasion, Erosion)
  - P-F interval for CBM

**Step 6: Define Tasks**

- For each failure mode's selected strategy:
- **Primary Task:**
  - AI generates task name following convention: "Inspect [what] for [evidence]"
  - Set acceptable limits (required for CB/FFI)
  - Set conditional comments (what to do if outside limits)
  - Set constraint: Online / Offline / Test Mode
  - Set task type: Inspect / Check / Test / Lubricate / Clean / Replace / Repair
  - Set frequency and units
  - Set access time (0 for online, >0 for offline)
- **Secondary Task** (for CB/FFI when limit exceeded):
  - AI generates: "Replace [what]" or "Repair [what]"
  - Set budget type: Repair or Replace
  - Set budgeted life (estimated component useful life)
- Status: DRAFT → Review → Approve

**Step 7: Assign Resources**

- For each task:
- **Labour:**
  - Select specialty: Fitter / Electrician / Instrumentist / Operator / ConMon / Lubricator
  - Set quantity (number of workers)
  - Set hours per person
  - AI suggests based on library data and task type
- **Materials:**
  - Search material catalog by description or code
  - Set quantity needed
  - AI suggests spare parts based on failure mode + equipment BOM
  - Add new materials to catalog if not found
- **Tools & Special Equipment:**
  - Select from list or add new (crane, scaffold, torque wrench, etc.)

**Step 8: Create Work Packages**

- Click "Generate Work Packages" / "Générer Paquets de Travail"
- AI groups tasks automatically by:
  - Labour type (Mechanical / Electrical / Instrumentation)
  - Constraint (Online tasks separate from Offline)
  - Frequency (matching frequencies grouped together)
- AI generates work package names: `12W SAG MILL MECH SERV OFF`
- Select work package type: Standalone / Suppressive / Sequential
- For Suppressive: verify intervals are factors of the lowest
- For Sequential: verify complete sequence exists
- Order tasks within each package (drag and drop)
- Add Job Preparation notes and Post-Shutdown notes
- Review resource summary (auto-calculated from tasks)
- Status: DRAFT → Review → Approve

**Step 9: Quality Review**

- Click "Run Quality Check" / "Exécuter Contrôle Qualité"
- System validates against 40+ rules (see REF-04):
  - All MIs have functions and functional failures? ✓/✗
  - All CB tasks have acceptable limits? ✓/✗
  - All FFI tasks have acceptable limits? ✓/✗
  - Task naming convention followed? ✓/✗
  - All tasks have labour assigned? ✓/✗
  - All replacement tasks have materials? ✓/✗
  - WP naming convention correct? ✓/✗
  - Online ≠ Offline in same WP? ✓/✗
  - Etc.
- Results shown as checklist with: PASS / WARNING / ERROR
- Fix errors before proceeding
- Sign off: Engineer → Reviewer → Approver

**Step 10: Generate SAP Upload Sheets**

- Click "Generate SAP Upload" / "Générer Fichiers SAP"
- System generates 3 linked templates:
  1. **Maintenance Item** template (one row per work package)
  2. **Task List** template (one row per operation/task within each WP)
  3. **Work Plan** template (one row per maintenance plan)
- Cross-references ($MI1, $TL1) automatically linked
- Download as Excel files ready for SAP upload
- Optionally: Generate Work Instruction PDFs for each work package

---

## COMMON WORKFLOWS

### Workflow A: Daily Planner Routine

```
1. Open M2: Planner Assistant
2. Review overnight field captures (sorted by priority)
3. For each: Get AI recommendation → Validate/Modify → Approve
4. Open M3: Backlog Dashboard
5. Check for new alerts (overdue, material delays)
6. Run optimization if backlog changed significantly
7. Review/approve schedule for coming week
```

### Workflow B: Strategy Development Workshop

```
1. Open M4: Strategy Development
2. Load or build equipment hierarchy
3. Run criticality assessment with workshop team
4. For each critical equipment:
   a. Review AI-generated functions/failures
   b. Review AI-generated FMEA
   c. Walk through RCM decision tree per failure mode
   d. Validate/adjust strategy, frequency, tasks
   e. Assign resources (labour + materials)
5. Generate work packages
6. Run quality check
7. Fix issues, get approval
8. Generate SAP upload sheets
```

### Workflow C: Emergency Work Request

```
1. Field technician opens M1 on mobile
2. Reports: voice + photo of broken equipment
3. AI structures request with Priority 1 (Emergency)
4. Planner gets immediate notification
5. Opens M2: sees emergency flagged in red
6. AI shows: parts availability, nearest available team
7. Planner validates immediately
8. Work enters execution queue
```

---

## KEYBOARD SHORTCUTS / QUICK ACTIONS (Future)

| Action              | Shortcut       |
| ------------------- | -------------- |
| New Work Request    | Ctrl+N         |
| Search Equipment    | Ctrl+F         |
| Approve Selected    | Ctrl+Enter     |
| Reject Selected     | Ctrl+Backspace |
| Run Optimization    | Ctrl+O         |
| Generate SAP Upload | Ctrl+G         |
| Switch Language     | Ctrl+L         |
