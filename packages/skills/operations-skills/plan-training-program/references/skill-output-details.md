# Detailed Output Specification - plan-training-program

*Detailed output formats and field definitions extracted from CLAUDE.md.*
*Read this file when you need the complete output field definitions and format details.*

---

| K | Criticality | Critical / High / Medium / Low | Critical |
| L | Training_Method | Classroom / E-learning / OJT / Simulator / Vendor / Mentoring | Vendor + Simulator |
| M | Training_Course | Recommended course or program | DCS Operator Certification (Honeywell/ABB) |
| N | Training_Hours | Estimated hours to close gap | 80 |
| O | Training_Provider | Internal / Vendor name / External provider | Honeywell |
| P | Must_Complete_By | Date by which competency must be achieved | 2025-06-01 |
| Q | Prerequisite | Prerequisites for this training | Basic Process Operations (COMP-PROC-001) |
| R | Assessment_Method | How competency will be verified | Practical assessment on simulator + written exam |
| S | Certification_Required | Yes/No and certification name | Yes - DCS Operator Level 2 |
| T | Renewal_Period | Certification or refresher period | 24 months |

#### Sheet 3: "Gap Summary by Department"
- Pivot analysis showing gap distribution by department and competency category
- Heat map of gap magnitude by role and competency area
- Pareto chart of largest gaps by training hours required

#### Sheet 4: "Regulatory Training Requirements"
- All mandatory regulatory training identified from regulatory mapping
- Certification body, validity period, renewal requirements
- Linked to specific roles and personnel counts

#### Sheet 5: "Vendor Training Requirements"
- OEM-specific training requirements by equipment
- Vendor training offerings (standard packages, customizable options)
- Vendor lead times and availability constraints
- Contract training obligations vs. additional training recommendations

### Deliverable 2: Training Plan & Schedule (.xlsx)

**Filename**: `{ProjectCode}_Training_Plan_Schedule_v{version}_{date}.xlsx`

**Workbook Structure**:

#### Sheet 1: "Training Program Summary"

| Column | Field Name | Description | Example |
|--------|-----------|-------------|---------|
| A | Program_ID | Unique program identifier | PROG-OPS-001 |
| B | Program_Name | Training program name | Control Room Operator Development Program |
| C | Target_Roles | Roles covered by this program | Control Room Operator, Senior Operator |
| D | Target_Headcount | Number of personnel to be trained | 24 |
| E | Total_Hours | Total program duration in hours | 480 |
| F | Number_of_Courses | Number of courses in the program | 12 |
| G | Duration_Weeks | Total calendar weeks | 16 |
| H | Start_Date | Program start date | 2025-02-01 |
| I | End_Date | Program end date | 2025-05-30 |
| J | Method_Mix | % Classroom / % OJT / % Simulator / % E-learning | 30% / 40% / 20% / 10% |
| K | Trainers_Required | Internal trainers needed | 3 senior operators + 1 process engineer |
| L | Vendor_Training | Vendor courses included | Honeywell DCS (40h), ABB Drives (16h) |
| M | Estimated_Cost | Total estimated program cost | $125,000 |
| N | Critical_Path | Is this program on the startup critical path? | Yes - must complete before hot commissioning |

#### Sheet 2: "Course Schedule"

| Column | Field Name | Description | Example |
|--------|-----------|-------------|---------|
| A | Course_ID | Unique course identifier | CRS-OPS-001-03 |
| B | Course_Name | Course title | DCS Fundamentals and Navigation |
| C | Program_ID | Parent program | PROG-OPS-001 |
| D | Prerequisites | Required prior courses | CRS-OPS-001-01, CRS-OPS-001-02 |
| E | Delivery_Method | Classroom / Simulator / OJT / E-learning / Blended | Classroom + Simulator |
| F | Duration_Hours | Course duration | 24 |
| G | Session_Count | Number of sessions to deliver | 3 (8 people per session) |
| H | Start_Date | First session start date | 2025-03-01 |
| I | End_Date | Last session end date | 2025-03-15 |
| J | Trainer | Trainer name or role | Honeywell Certified Trainer |
| K | Location | Training venue | Site Training Center - Room A |
| L | Equipment_Required | Special equipment needed | DCS Training Simulator |
| M | Materials | Course materials and references | Honeywell DCS Manual, Site-specific config |
| N | Max_Participants | Maximum per session | 8 |
| O | Assessment | Assessment method | Practical simulator assessment (pass mark 80%) |
| P | Cost_Per_Session | Cost per delivery session | $8,000 |
| Q | Status | Planned / Confirmed / In Progress / Complete / Cancelled | Confirmed |

#### Sheet 3: "Gantt View"
- Visual Gantt chart showing all training programs and courses over time
- Milestone markers for: recruitment complete, equipment available, commissioning start, PSSR, first production
- Resource loading by trainer/venue per week
- Critical path highlighting

#### Sheet 4: "Vendor Training Coordination"

| Column | Field Name | Description |
|--------|-----------|-------------|
| A | Vendor_Name | Equipment vendor/OEM |
| B | Equipment | Equipment covered |
| C | Training_Type | Standard / Customized / On-site / Factory |
| D | Duration | Training duration |
| E | Location | Training delivery location |
| F | Participants | Number of participants |
| G | Preferred_Dates | Vendor-available dates |
| H | Booked_Dates | Confirmed dates |
| I | Contract_Obligation | Included in contract? (Y/N) |
| J | Additional_Cost | Cost for non-contract training |
| K | Trainer_Qualifications | Required trainer qualifications |
| L | Prerequisites_for_Participants | Pre-training requirements |
| M | Deliverables | Certificates, manuals, assessments |
| N | Status | Requested / Confirmed / Delivered / Cancelled |

#### Sheet 5: "Resource Allocation"
- Trainer workload by week (internal and external)
- Training venue utilization by week
- Equipment/simulator availability by week
- Budget allocation by program, month, and cost category
- Budget vs. actual tracking

### Deliverable 3: Curriculum Design (.docx)

**Filename**: `{ProjectCode}_Training_Curriculum_v{version}_{date}.docx`

**Document Structure (30-50 pages)**:

1. **Executive Summary** (2-3 pages)
   - Training program overview and objectives
   - Alignment with OR milestones and startup timeline
   - Key programs and target audiences
   - Budget summary and resource requirements

2. **Training Philosophy and Approach** (2-3 pages)
   - Adult learning principles applied
   - ADDIE instructional design methodology
   - Competency-based training approach
   - Blended learning strategy (classroom + OJT + digital)
   - Assessment and competency verification approach

3. **Competency Framework** (3-5 pages)
   - Competency model overview (technical, safety, regulatory, behavioral, digital)
   - Proficiency level definitions (1-Awareness through 5-Expert)
   - Competency mapping to roles
   - Gap analysis summary

4. **Training Programs** (10-20 pages, one section per program)
   For each program:
   - Program objectives and target audience
   - Competencies addressed
   - Course sequence with prerequisites (flow diagram)
   - Individual course descriptions:
     - Learning objectives (SMART)
     - Content outline / topic list
     - Delivery method and duration
     - Required resources (trainers, equipment, materials)
     - Assessment criteria and pass standards
   - Program completion requirements
   - Certification or qualification awarded

5. **Vendor Training Integration** (3-4 pages)
   - Vendor-provided training summary
   - Integration with internal training sequences
   - Vendor training quality requirements
   - Knowledge transfer requirements (train-the-trainer)

6. **Regulatory and Mandatory Training** (2-3 pages)
   - Complete list of regulatory-mandated training by role
   - Certification requirements and renewal cycles
   - Approved training providers and accreditation
   - Record-keeping requirements per regulation

7. **On-the-Job Training (OJT) Program** (3-4 pages)
   - OJT methodology and structured approach
   - OJT mentor/assessor qualification requirements
   - OJT task lists by role
   - OJT assessment criteria and sign-off process
   - Progression from supervised to independent operation

8. **Assessment and Competency Verification** (2-3 pages)
   - Assessment methods by competency type:
     - Written examinations (knowledge)
     - Practical assessments (skills)
     - Simulation exercises (decision-making)
     - Behavioral observation (behaviors)
   - Pass standards and remediation process
   - Competency sign-off authority and documentation

9. **Training Effectiveness Evaluation** (2-3 pages)
   - Kirkpatrick four-level evaluation framework:
     - Level 1 (Reaction): Course evaluation surveys
     - Level 2 (Learning): Pre/post assessments
     - Level 3 (Behavior): 90-day on-the-job observation
     - Level 4 (Results): KPI correlation analysis
   - Evaluation schedule and responsibilities
   - Continuous improvement process

10. **Appendices**
    - Complete competency-to-course mapping matrix
    - Course catalog with full descriptions
    - OJT task lists by role
    - Assessment templates
    - Evaluation survey templates

### Deliverable 4: Vendor Training Coordination (.xlsx)

**Filename**: `{ProjectCode}_Vendor_Training_Coordination_v{version}_{date}.xlsx`

**Workbook Structure**:

#### Sheet 1: "Vendor Training Master List"
- All vendor training requirements consolidated
- Contract vs. additional training distinction
- Cost summary per vendor
- Scheduling status

#### Sheet 2: "Vendor Communication Log"
- Record of all communications with vendors regarding training
- Requests, confirmations, changes, cancellations
- Contact details and response timelines

#### Sheet 3: "Vendor Training Quality Checklist"
- Quality requirements for each vendor training delivery
- Pre-training checks (materials, equipment, venue)
- Post-training deliverables (certificates, assessments, manuals)
- Trainer qualification verification

---
