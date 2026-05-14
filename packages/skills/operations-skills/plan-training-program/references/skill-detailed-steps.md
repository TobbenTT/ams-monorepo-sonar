# Detailed Step-by-Step Execution - plan-training-program

*Full detailed execution steps extracted from SKILL.md.*
*Read this file when executing the skill for complete step-by-step instructions.*

---

## Step-by-Step Execution

### Phase 1: Analysis (Steps 1-4)

**Step 1: Define Training Program Scope and Objectives**
- Review the organizational design for all roles requiring training
- Confirm the startup timeline and key milestones that gate training completion
- Identify the training program objectives aligned with OR readiness criteria
- Determine scope: which roles, which competencies, which phases of readiness
- Establish success criteria: what does "training complete" mean for startup approval?
- Identify constraints: budget, timeline, facility availability, workforce availability

**Step 2: Perform Competency Gap Analysis**
- For each role in the organizational design:
  - Compile the required competency profile (technical, safety, regulatory, behavioral, digital)
  - Define the target proficiency level for each competency (1-5 scale)
  - Assess the current proficiency level of assigned or typical personnel
  - Calculate the gap magnitude (required minus current)
  - Classify the gap criticality: Critical (safety, startup-blocking), High (operations-affecting), Medium (performance-enhancing), Low (nice-to-have)
- Produce the Competency Gap Matrix
- Quantify total training effort: total person-hours of training required
- Identify roles with the largest gaps and highest training investment needs

**Step 3: Assess Training Needs**
- For each identified gap, determine the optimal training approach:
  - **Classroom training**: For knowledge-heavy competencies, theory, regulations, standards
  - **Simulator training**: For process control, emergency response, complex decision-making
  - **On-the-job training (OJT)**: For hands-on skills, equipment-specific procedures, site familiarity
  - **E-learning**: For compliance training, awareness topics, pre-reading, refreshers
  - **Vendor training**: For OEM-specific equipment operation and maintenance
  - **Mentoring/coaching**: For leadership, behavioral, and experience-based competencies
- Determine training provider for each need:
  - Internal (existing expertise within the organization)
  - Vendor/OEM (equipment-specific knowledge)
  - External provider (specialized courses, certifications)
  - Combined (vendor delivers, internal supplements with site-specific context)
- Estimate training hours per course and per program

**Step 4: Identify Regulatory and Mandatory Training**
- Cross-reference with regulatory mapping (L-01 output) for all mandatory training:
  - Safety inductions (SERNAGEOMIN DS 132, Ley 16.744)
  - Occupational hygiene (DS 594)
  - Hazardous materials handling (DS 43/78)
  - Electrical safety (SEC)
  - First aid and emergency response (ONEMI)
  - Labor rights (Codigo del Trabajo)
- Identify required certifications and their issuing bodies
- Note certification validity periods and renewal requirements
- Verify that all mandatory training is included in the gap matrix
- Flag any training that requires accredited providers or regulatory approval

### Phase 2: Design (Steps 5-8)

**Step 5: Design Training Programs and Curricula**
- Group training needs into logical programs:
  - **Operations Training Program**: Process fundamentals, DCS operation, equipment operation, quality management
  - **Maintenance Training Program**: Craft skills, equipment-specific maintenance, reliability techniques, CMMS
  - **HSE Training Program**: Safety induction, hazard identification, risk assessment, emergency response, environmental compliance
  - **Leadership/Supervision Program**: Frontline leadership, crew management, performance management, communication
  - **Digital Skills Program**: CMMS usage, DCS/SCADA, data analysis tools, mobile technology
- For each program, design the curriculum:
  - Define overall program objectives and outcomes
  - Sequence courses with prerequisites (learning path)
  - Develop course descriptions with SMART learning objectives
  - Define assessment methods and pass criteria for each course
  - Identify materials and resources required
  - Estimate total program duration and calendar time

**Step 6: Design On-the-Job Training (OJT) Structure**
- For each role requiring OJT:
  - Define the OJT task list (specific tasks the trainee must demonstrate)
  - Set proficiency criteria for each task (e.g., "can perform independently without errors")
  - Identify OJT mentors/assessors and their qualification requirements
  - Design the OJT progression: observe > assist > perform supervised > perform independently
  - Define the OJT assessment and sign-off process
  - Determine the typical OJT duration per role (often 2-6 months)
- Develop OJT logbooks for each role
- Establish the mentor-to-trainee ratio (typically 1:2 to 1:4)
- Plan for OJT delivery during commissioning activities where possible (real equipment, supervised practice)

**Step 7: Design Assessment and Competency Verification**
- For each course and program:
  - Define the assessment type: written exam, practical demonstration, simulation exercise, oral examination, portfolio
  - Set pass marks (typically 70-80% for knowledge, 100% for safety-critical practical assessments)
  - Define the remediation process for those who do not pass (re-training, additional OJT, re-assessment)
  - Identify assessor qualifications (who can assess and sign off competency?)
- Design the competency sign-off framework:
  - Course completion certificate (training attended)
  - Competency assessment result (knowledge/skill verified)
  - OJT sign-off (on-the-job performance verified)
  - Role authorization (all requirements met, authorized to perform the role independently)

**Step 8: Plan Kirkpatrick Evaluation Framework**
- Design evaluation instruments for each level:
  - **Level 1 (Reaction)**: End-of-course evaluation survey (content relevance, trainer effectiveness, facilities, overall satisfaction). Target: >4.0 / 5.0 average
  - **Level 2 (Learning)**: Pre/post knowledge assessments, practical skills tests. Target: >20% improvement, >80% pass rate
  - **Level 3 (Behavior)**: 90-day post-training observation checklists, supervisor assessments. Target: >80% observed applying training on the job
  - **Level 4 (Results)**: Correlation analysis of training completion with operational KPIs (incident rates, equipment availability, quality metrics, ramp-up speed). Target: measurable improvement in KPIs
- Define data collection methods and responsibilities
- Set evaluation timelines (Level 1: immediate, Level 2: during course, Level 3: 60-90 days post, Level 4: 6-12 months post)

### Phase 3: Development and Implementation (Steps 9-12)

**Step 9: Develop the Training Schedule**
- Build the master training schedule:
  - Map all courses to calendar dates considering:
    - Prerequisite sequencing (foundation courses before advanced)
    - Equipment availability (OJT and simulator training requires installed equipment)
    - Vendor availability (OEM training windows, trainer travel schedules)
    - Personnel availability (not everyone can be in training simultaneously)
    - Venue capacity (classroom seats, simulator capacity)
    - Seasonal factors (weather, holidays, shutdown windows)
  - Identify the critical path: training activities that directly gate startup milestones
  - Build float into non-critical-path activities
  - Plan multiple sessions for courses with large participant numbers
- Validate the schedule against the project master schedule
- Identify conflicts and resolve through prioritization or additional resources

**Step 10: Allocate Resources and Develop Budget**
- Internal trainers:
  - Identify qualified internal trainers for each course
  - Assess trainer workload and availability
  - Plan train-the-trainer sessions where needed
  - Estimate trainer preparation and delivery time
- External resources:
  - Confirm vendor training bookings and costs
  - Source external training providers for specialized courses
  - Negotiate group rates and on-site delivery options
- Facilities and equipment:
  - Confirm training venue availability and capacity
  - Identify equipment needs (simulators, training rigs, PPE for practical training)
  - Arrange for off-site training venues if on-site not available
- Materials:
  - Course materials development or procurement
  - Reference manuals and procedure copies
  - E-learning platform and content licenses
- Budget:
  - Compile total training budget by program, cost category, and month
  - Compare against approved budget and flag variances
  - Identify cost optimization opportunities (combine sessions, use internal trainers, leverage vendor contracts)

**Step 11: Coordinate Vendor Training**
- For each vendor training requirement:
  - Contact vendor training department to confirm availability
  - Negotiate dates aligned with project schedule and equipment delivery
  - Confirm training content covers site-specific configuration (not just generic equipment)
  - Ensure vendor provides assessment and certification documentation
  - Negotiate train-the-trainer sessions to build internal capability
  - Confirm logistics: venue, equipment, materials, participant prerequisites
- Update the vendor training coordination tracker
- Identify backup dates for critical vendor training

**Step 12: Configure Learning Management System (LMS)**
- Set up the training program structure in the LMS (via mcp-lms):
  - Create course catalog with all planned courses
  - Configure program enrollment rules and prerequisites
  - Set up competency tracking with proficiency levels
  - Configure assessment instruments and scoring
  - Set up completion tracking and certification management
  - Configure reporting dashboards
- Enroll personnel in their assigned training programs
- Set up automated notifications for upcoming training sessions
- Configure training record archiving for regulatory compliance

### Phase 4: Monitoring and Evaluation (Steps 13-16)

**Step 13: Track Training Delivery and Completion**
- Monitor training delivery against the plan:
  - Completion rate by course, program, department, and individual
  - Assessment results and pass rates
  - No-show and reschedule rates
  - Schedule adherence (planned vs. actual dates)
- Generate weekly training status reports:
  - Progress toward startup readiness targets
  - Courses at risk of delay
  - Personnel with incomplete training blocking role authorization
  - Budget utilization vs. plan
- Escalate deviations that threaten startup readiness

**Step 14: Manage Training Issues and Remediation**
- For personnel who do not pass assessments:
  - Identify the knowledge/skill gap that caused the failure
  - Design and schedule remedial training
  - Reassess within the defined timeframe
  - Escalate if multiple failures indicate a systemic issue (course design, trainer quality, participant selection)
- For courses behind schedule:
  - Identify root cause (vendor delay, facility unavailable, personnel unavailable)
  - Implement recovery actions (additional sessions, compressed schedule, alternative delivery method)
  - Update the master schedule and communicate impacts

**Step 15: Evaluate Training Effectiveness**
- Execute the Kirkpatrick evaluation plan:
  - **Level 1**: Collect and analyze course evaluation surveys
  - **Level 2**: Compile assessment results and calculate knowledge gain
  - **Level 3**: Conduct 90-day post-training behavioral observations
  - **Level 4**: Correlate training metrics with operational performance (after startup)
- Produce training effectiveness report:
  - Overall program effectiveness rating
  - Course-level effectiveness analysis
  - Trainer effectiveness comparison
  - ROI analysis where Level 4 data is available
  - Recommendations for improvement

**Step 16: Generate Training Readiness Certification**
- For the startup go/no-go decision:
  - Produce a training readiness certificate showing:
    - All personnel have completed required training programs
    - All competency assessments have been passed
    - All OJT has been completed and signed off
    - All regulatory certifications are current and valid
    - All role authorizations have been issued
  - Identify any conditional readiness items (training complete except for specific items with mitigation plans)
  - Provide the certificate to the PSSR review team
- Store all training records in the document management system (mcp-sharepoint)
- Configure ongoing training tracking for post-startup refresher and development needs

---
