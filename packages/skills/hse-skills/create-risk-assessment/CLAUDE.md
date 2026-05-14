---
name: create-risk-assessment
description: "Generate comprehensive operational risk assessments using bow-tie methodology and risk matrices. Triggers: 'risk assessment', 'bow-tie', 'risk matrix', 'evaluacion de riesgos', 'HAZOP'."
---

# Create Risk Assessment
## Skill ID: A-RISK-ASSESS-001
## Version: 1.0.0
## Category: A. Document Generation
## Priority: P1 - Critical

## Purpose

Generate comprehensive operational risk assessments using bow-tie methodology and risk matrices to identify, analyze, and evaluate risks associated with plant operations, equipment failures, and process hazards. This skill transforms process hazard information, HAZOP results, and operational procedures into structured risk assessment outputs that enable informed decision-making on risk controls, mitigation measures, and residual risk acceptance.

Operational risk assessment is a fundamental requirement for Operational Readiness. It ensures that all significant risks are identified before operations commence, that appropriate barriers (preventive and mitigative) are in place, and that residual risks are within the organization's risk tolerance. The bow-tie methodology provides a visual, intuitive representation of threat-barrier-consequence relationships that is accessible to both technical and management audiences.

## Intent & Specification

The AI agent MUST understand the following core goals:

1. **Bow-Tie Analysis**: Each significant hazard must be analyzed using the bow-tie model: identify the Top Event (loss of control), map Threats (causes) on the left side with Preventive Barriers, and map Consequences on the right side with Mitigative Barriers. Each barrier must have defined Escalation Factors and Escalation Factor Barriers.

2. **Risk Matrix Evaluation**: All identified risks must be evaluated using a standardized risk matrix (typically 5x5 or 6x6) that assesses Likelihood and Consequence across multiple consequence categories (Safety, Environment, Production, Financial, Reputation). Both inherent risk (without controls) and residual risk (with controls) must be assessed.

3. **Barrier Quality Assessment**: Each barrier (control measure) must be evaluated for its effectiveness, independence, and auditability. Degraded or missing barriers must be flagged as action items.

4. **ALARP Demonstration**: The assessment must demonstrate that risks have been reduced to As Low As Reasonably Practicable (ALARP), with clear justification for residual risk acceptance.

5. **Actionable Outputs**: The assessment must produce clear, trackable action items for barrier gaps, risk reduction measures, and monitoring requirements.

## VSC Failure Modes Table Reference

When identifying equipment failure modes as threats in bow-tie analyses or risk registers, reference the official VSC Failure Modes Table (`methodology/standards/VSC_Failure_Modes_Table.xlsx`). All equipment failure threats should use the standard structure: **[WHAT] → [Mechanism] due to [Cause]** (18 mechanisms, 46 causes, 72 combinations).

## Trigger / Invocation

```
/create-risk-assessment
```

**Aliases**: `/risk-assessment`, `/bow-tie`, `/evaluacion-riesgos`

**Trigger Conditions**:
- User provides process hazard information or HAZOP results
- User requests operational risk evaluation
- Pre-commissioning risk assessment is required
- Management of Change (MOC) requires risk re-evaluation
- Incident investigation reveals previously unassessed risks

## Guided Mode

This skill supports guided mode. When triggered, execute the Guided Mode Protocol
(defined in the agent CLAUDE.md) BEFORE proceeding to Step-by-Step Execution.

**GM-1 Summary:** 3 required + 9 optional questions covering process/hazard description,
risk matrix definition, equipment list, HAZOP data, P&IDs, incident history,
regulatory requirements, and existing controls.
See `references/guided-mode-questions.md` for the complete question sequence.

**Dependency checks:** Recommended to have equipment hierarchy and process descriptions
from upstream skills before executing.

## Input Requirements

### Mandatory Inputs

| Input | Format | Description |
|-------|--------|-------------|
| Process/Hazard Description | .docx, text | Description of the process, operation, or activity being assessed. Must include: scope boundaries, operating conditions, materials/substances involved |
| Risk Matrix Definition | .xlsx, .docx, .pdf | Organization's risk matrix with defined likelihood and consequence scales. If not provided, agent uses VSC standard 5x5 matrix |
| Equipment/Asset List | .xlsx | Relevant equipment list from asset register for the systems being assessed |

### Optional Inputs (Enhance Quality)

| Input | Format | Description |
|-------|--------|-------------|
| HAZOP Study Results | .xlsx, .pdf | Completed HAZOP worksheets with deviations, causes, consequences, and safeguards |
| P&IDs | .pdf | Process and Instrumentation Diagrams for barrier identification |
| Operating Procedures | .docx, .pdf | Standard Operating Procedures (SOPs) for procedural barrier identification |
| Incident/Accident Data | .xlsx | Historical incident data for likelihood calibration |
| Safety Data Sheets (SDS) | .pdf | Material safety data for hazardous substance risks |
| Environmental Baseline | .docx | Environmental receptors and sensitivity data |
| Regulatory Requirements | .docx | Applicable regulations, permits, and compliance obligations |
| Existing Risk Registers | .xlsx | Previous risk assessments for update/review |
| Organizational Risk Criteria | .docx | Corporate risk appetite statement and ALARP criteria |

### Input Validation Rules

- Risk matrix must have clearly defined likelihood and consequence scales with descriptions
- Process scope must be clearly bounded (physical boundaries, operational phases)
- HAZOP results without safeguard assessment are flagged for barrier completeness review
- Equipment lists must include safety-critical equipment identification

## Output Specification

### Primary Output 1: Risk Matrices (.xlsx)

**Filename**: `{ProjectCode}_Risk_Assessment_Matrices_v{version}_{date}.xlsx`

**Workbook Structure**:

#### Sheet 1: "Risk Register"

| Column | Field Name | Description | Example |
|--------|-----------|-------------|---------|
| A | Risk_ID | Unique risk identifier | RSK-001 |
| B | Risk_Title | Short risk title | Loss of containment - sulfuric acid tank |
| C | Risk_Category | Category | Process Safety |
| D | Area_System | Plant area/system | Area 400 - Acid Plant |
| E | Top_Event | Bow-tie top event | Uncontrolled release of H2SO4 |
| F | Threat_ID | Threat identifier | THR-001-01 |
| G | Threat_Description | Cause/threat | Corrosion-induced tank wall failure |
| H | Consequence_ID | Consequence identifier | CON-001-01 |
| I | Consequence_Description | Consequence | Chemical burns to personnel |
| J | Consequence_Category | Safety/Env/Prod/Fin/Rep | Safety |
| K | Inherent_Likelihood | Likelihood without controls (1-5) | 4 - Likely |
| L | Inherent_Consequence | Consequence without controls (1-5) | 5 - Catastrophic |
| M | Inherent_Risk_Score | L x C | 20 |
| N | Inherent_Risk_Level | Risk level | Extreme |
| O | Preventive_Barriers | List of preventive barriers | Inspection program; material selection; design codes |
| P | Mitigative_Barriers | List of mitigative barriers | Bund wall; emergency shower; gas detection; ERP |
| Q | Barrier_Effectiveness | Overall barrier assessment | Adequate |
| R | Residual_Likelihood | Likelihood with controls (1-5) | 2 - Unlikely |
| S | Residual_Consequence | Consequence with controls (1-5) | 4 - Major |
| T | Residual_Risk_Score | L x C | 8 |
| U | Residual_Risk_Level | Risk level | High |
| V | ALARP_Status | ALARP / Not ALARP / Review | ALARP |
| W | Risk_Owner | Responsible person/role | Plant Manager |
| X | Action_Required | Yes/No | Yes |
| Y | Action_Description | Required actions | Increase inspection frequency to quarterly |
| Z | Action_Priority | Critical/High/Medium/Low | High |
| AA | Action_Due_Date | Target date | Pre-commissioning |
| AB | Review_Frequency | Review cycle | Annual |
| AC | Status | Open/In Progress/Closed | Open |
| AD | Last_Review_Date | Last assessment date | {date} |
| AE | Notes | Additional context | Linked to HAZOP Node 4, Deviation 3 |

#### Sheet 2: "Risk Matrix Heat Map"
Visual 5x5 (or client-defined) risk matrix showing:
- Risk matrix grid with color coding (Green/Yellow/Orange/Red)
- Risk IDs plotted on the matrix (both inherent and residual positions)
- Legend with risk level definitions and required response actions
- Movement arrows showing risk reduction from inherent to residual

#### Sheet 3: "Bow-Tie Register"
Structured bow-tie data:

| Column | Field Name | Description |
|--------|-----------|-------------|
| A | BowTie_ID | Bow-tie identifier |
| B | Hazard | The hazard being controlled |
| C | Top_Event | Loss of control event |
| D | Side | Left (Threat) / Right (Consequence) |
| E | Threat_or_Consequence_ID | THR or CON identifier |
| F | Threat_or_Consequence_Desc | Description |
| G | Barrier_ID | Barrier identifier |
| H | Barrier_Description | Control measure description |
| I | Barrier_Type | Hardware/Software/Procedural/Competency |
| J | Barrier_Independence | Independent/Dependent/Shared |
| K | Barrier_Effectiveness | High/Medium/Low |
| L | Barrier_Auditability | Yes/No |
| M | Barrier_Owner | Responsible role |
| N | Escalation_Factor | Factor that degrades the barrier |
| O | EF_Barrier | Control for the escalation factor |
| P | Barrier_Status | In Place/Planned/Gap |
| Q | Action_if_Gap | Required action to close gap |

#### Sheet 4: "Action Tracker"
Consolidated action items from the assessment:
- Action ID, Description, Source (Risk ID), Priority, Owner, Due Date, Status
- Summary statistics: total actions, by priority, by status, by area

#### Sheet 5: "Risk Summary Dashboard"
Summary statistics:
- Total risks identified, by category, by area
- Risk distribution: Extreme/High/Medium/Low (inherent vs. residual)
- Top 10 risks by residual score
- Barrier gap summary
- Action item statistics

### Primary Output 2: Assessment Report (.docx)

**Filename**: `{ProjectCode}_Risk_Assessment_Report_v{version}_{date}.docx`

**Document Structure (20-40 pages)**:

1. **Executive Summary** (1-2 pages)
   - Scope and objectives
   - Key findings summary
   - Top risks requiring management attention
   - Overall risk profile assessment

2. **Introduction & Scope** (2-3 pages)
   - Assessment purpose and regulatory drivers
   - Scope boundaries (physical, operational, temporal)
   - Assessment methodology overview
   - Team composition and qualifications
   - Reference documents

3. **Risk Assessment Methodology** (3-4 pages)
   - Risk matrix definition and scales
   - Bow-tie methodology explanation
   - Likelihood calibration criteria
   - Consequence category definitions
   - ALARP framework and criteria
   - Barrier effectiveness criteria

4. **Process/Operation Description** (2-3 pages)
   - Process overview
   - Key equipment and systems
   - Hazardous materials inventory
   - Operating conditions and parameters

5. **Risk Identification Results** (5-10 pages)
   - Identified hazards and top events
   - Threat analysis (per bow-tie)
   - Consequence analysis (per bow-tie)
   - Bow-tie diagrams (visual representations)

6. **Risk Evaluation** (3-5 pages)
   - Inherent risk assessment results
   - Barrier assessment summary
   - Residual risk assessment results
   - ALARP demonstration
   - Risk matrix visualization

7. **Barrier Analysis** (3-5 pages)
   - Barrier inventory and classification
   - Barrier effectiveness assessment
   - Barrier gaps identified
   - Escalation factor analysis

8. **Recommendations & Action Plan** (2-3 pages)
   - Priority actions for risk reduction
   - Barrier improvement recommendations
   - Monitoring and review requirements
   - Implementation timeline

9. **Conclusions** (1 page)
   - Overall risk profile statement
   - Key assumptions and limitations
   - Requirements for risk acceptance

10. **Appendices**
    - Complete bow-tie diagrams
    - Risk register extract
    - Action tracker
    - Reference documents list

### Formatting Standards
- Risk level colors: Extreme=Red (#FF0000), High=Orange (#FF8C00), Medium=Yellow (#FFD700), Low=Green (#008000)
- Bow-tie diagrams: Threats in blue, Barriers in green (preventive) / orange (mitigative), Consequences in red
- Report follows VSC document template with corporate branding
- All tables numbered and cross-referenced
- All bow-tie diagrams legible at A3 print size

## Methodology & Standards

### Primary Standards
- **ISO 31000:2018** - Risk management: Guidelines. Provides principles and framework for risk management.
- **ISO 31010:2019** - Risk management: Risk assessment techniques. Provides guidance on bow-tie analysis, risk matrices, and other techniques.
- **IEC 31010:2019** - Risk assessment techniques (identical to ISO 31010).

### Bow-Tie Methodology Standards
- **CGE Risk Management Solutions** - Bow-tie methodology framework (BowTieXP methodology).
- **CCPS (Center for Chemical Process Safety)** - Guidelines for bow-tie analysis in process safety.
- **Energy Institute** - Guidance on bow-tie barrier risk management.

### Process Safety Standards
- **IEC 61511** - Functional safety: Safety Instrumented Systems for the process industry sector (for SIL-rated barriers).
- **IEC 61882** - Hazard and operability studies (HAZOP). For HAZOP input interpretation.
- **API 580/581** - Risk-Based Inspection methodology.

### Risk Matrix Standards
- **NORSOK Z-008** - Risk-based maintenance and consequence classification.
- **AS/NZS 4360 / ISO 31000** - Risk matrix design principles.
- **ICMM** - Health and Safety Critical Control Management (for mining sector).

### Chilean Regulatory Framework
- **DS 132** - Reglamento de Seguridad Minera (Mining Safety Regulation)
- **DS 594** - Condiciones sanitarias y ambientales basicas en los lugares de trabajo
- **Ley 16.744** - Seguro social contra riesgos de accidentes del trabajo y enfermedades profesionales
- **NCh-ISO 31000** - Chilean adoption of ISO 31000

### ALARP Framework
- **UK HSE ALARP** guidance and principles
- **Cost-Benefit Analysis (CBA)** for ALARP demonstration
- **Grossly Disproportionate** test for high-consequence risks

## Step-by-Step Execution

### Phase 1: Context & Scope Definition (Steps 1-2)

**Step 1: Define Assessment Context**
- Confirm assessment scope boundaries (which systems, areas, phases)
- Identify the risk matrix to be used (client standard or VSC default)
- Determine applicable regulations and standards
- Identify consequence categories relevant to the project
- Confirm risk acceptance criteria and ALARP thresholds

**Step 2: Gather and Review Input Data**
- Ingest HAZOP results, P&IDs, operating procedures
- Review equipment list and criticality data
- Review incident/accident data for likelihood calibration
- Identify hazardous materials and their properties
- Map regulatory compliance obligations

### Phase 2: Hazard Identification (Steps 3-4)

**Step 3: Identify Hazards and Top Events**
For each system/area in scope:
- Identify major hazards (energy sources, hazardous materials, operating conditions)
- Define Top Events (loss of control scenarios):
  - Loss of containment (LOC)
  - Loss of structural integrity
  - Fire/explosion
  - Toxic release
  - Environmental release
  - Equipment failure (critical)
  - Utility failure (power, water, air, steam)
  - Control system failure
- Link to HAZOP deviations where available

**Step 4: Threat and Consequence Analysis**
For each Top Event, develop the bow-tie:

**Left Side (Threats/Causes)**:
- Equipment failure modes (mechanical, electrical, instrumentation)
- Human error (operational, maintenance, procedural)
- External events (weather, seismic, third-party)
- Process deviations (pressure, temperature, flow, level)
- Management system failures (MOC, training, competency)

**Right Side (Consequences)**:
- Safety consequences (personnel injury/fatality)
- Environmental consequences (spills, emissions, contamination)
- Production consequences (downtime, throughput loss)
- Financial consequences (repair costs, penalties, liability)
- Reputational consequences (community, regulatory, media)

### Phase 3: Barrier Identification & Assessment (Steps 5-6)

**Step 5: Identify Barriers**
For each threat-top event-consequence pathway:

**Preventive Barriers** (prevent top event from occurring):
- Hardware barriers: relief valves, trip systems, containment, SIS
- Software barriers: control system interlocks, alarms, automation
- Procedural barriers: SOPs, permit-to-work, checklists
- Competency barriers: training, certification, supervision

**Mitigative Barriers** (reduce consequences after top event):
- Hardware barriers: bund walls, fire suppression, emergency shutdown
- Software barriers: emergency alarms, automatic isolation
- Procedural barriers: Emergency Response Plan, evacuation procedures
- Competency barriers: emergency response training, drills

**Step 6: Assess Barrier Quality**
For each barrier, evaluate:
- **Effectiveness**: Does the barrier reliably prevent/mitigate? (High/Medium/Low)
- **Independence**: Is the barrier independent of the initiating cause? (Yes/No)
- **Auditability**: Can the barrier's performance be tested and verified? (Yes/No)
- **Status**: Is the barrier currently in place, planned, or a gap?

Identify Escalation Factors for each barrier:
- What could cause the barrier to fail?
- What controls exist for escalation factors?

### Phase 4: Risk Evaluation (Steps 7-8)

**Step 7: Assess Inherent and Residual Risk**
For each risk scenario:

**Inherent Risk** (assumes no barriers):
- Assign Likelihood score (1-5) based on threat frequency without controls
- Assign Consequence score (1-5) for each consequence category, using the most severe
- Calculate inherent risk score = Likelihood x Consequence
- Determine inherent risk level from matrix

**Residual Risk** (considers existing barriers):
- Reassess Likelihood considering preventive barriers
- Reassess Consequence considering mitigative barriers
- Apply barrier effectiveness adjustments
- Calculate residual risk score
- Determine residual risk level from matrix

**Step 8: ALARP Assessment**
For each risk with residual level of Medium or above:
- Assess whether further risk reduction is reasonably practicable
- Document justification for residual risk acceptance
- Identify any additional measures that could further reduce risk
- Evaluate cost-benefit of additional measures
- Classify as: ALARP / Not ALARP / Requires Review

### Phase 5: Output Generation (Steps 9-11)

**Step 9: Generate Bow-Tie Diagrams**
For each Top Event, create a text-based bow-tie diagram:
```
THREATS          PREVENTIVE BARRIERS    TOP EVENT    MITIGATIVE BARRIERS    CONSEQUENCES
[Threat 1] ---> [Barrier A] --------\                /--- [Barrier X] ---> [Safety impact]
[Threat 2] ---> [Barrier B] ---------\  [TOP EVENT] /---- [Barrier Y] ---> [Env. impact]
[Threat 3] ---> [Barrier C] ---------->  HAZARD    <----- [Barrier Z] ---> [Prod. impact]
                [Barrier D] ---------/              \---- [Barrier W] ---> [Financial]
```

**Step 10: Compile Risk Register and Matrices**
- Populate all sheets in the risk register workbook
- Generate risk matrix heat map
- Compile action tracker from all barrier gaps and recommendations
- Calculate summary statistics

**Step 11: Generate Assessment Report**
- Write narrative report following the specified structure
- Include bow-tie diagrams, risk matrices, and supporting analysis
- Prepare executive summary with key findings
- Document assumptions, limitations, and review requirements

## Quality Criteria

### Quantitative Thresholds

| Criterion | Target | Minimum Acceptable |
|-----------|--------|-------------------|
| Hazard identification coverage | 100% of in-scope systems | >95% |
| Bow-tie completeness (threats + consequences per top event) | >5 each | >3 each |
| Barrier identification per pathway | >3 barriers | >2 barriers |
| Barrier quality assessment coverage | 100% | >95% |
| ALARP assessment for Medium+ risks | 100% | 100% |
| Risk owner assignment | 100% | >95% |
| Action items for barrier gaps | 100% of gaps have actions | 100% |
| SME approval rating | >95% | >91% |

### Qualitative Standards

- **Bow-Tie Integrity**: Every bow-tie must have a clearly defined hazard, top event, at least 3 threats, at least 3 consequences, and barriers on both sides.
- **Barrier Independence**: At least one barrier per pathway must be independent of the initiating cause.
- **Risk Calibration**: Likelihood and consequence scores must be calibrated against the defined scales with justification.
- **ALARP Rigor**: ALARP assessments must provide genuine analysis, not boilerplate justification.
- **Actionability**: Every High and Extreme residual risk must have specific, trackable action items with owners and due dates.
- **Traceability**: Every risk must be traceable to its source (HAZOP deviation, process hazard, regulatory requirement).

### Validation Process
1. Bow-tie structural validation (all elements present)
2. Risk scoring consistency check (similar scenarios scored similarly)
3. Barrier gap to action item traceability
4. ALARP justification review
5. Cross-reference with HAZOP completeness
6. Final quality score calculation

## MCP Integrations

- **mcp-sharepoint**: Store and retrieve risk assessment reports, bow-tie diagrams, and risk matrix documentation
- **project-database**: Maintain the risk register with real-time status tracking, action item assignments, and barrier gap monitoring
- **mcp-cmms**: Pull equipment failure history and incident data for likelihood calibration and threat identification

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents)
| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| `create-asset-register` | Equipment list | Provides equipment data for hazard identification scope |
| `create-maintenance-strategy` | Failure mode data | Provides equipment failure modes as threat inputs |
| HAZOP Agent | HAZOP results | Provides process deviation analysis as primary input |
| Document Ingestion Agent | SDS, regulations | Parses safety data sheets and regulatory documents |

### Downstream Dependencies (Outputs TO other agents)
| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| `create-commissioning-plan` | Pre-startup risks | Risk mitigations required before commissioning |
| `create-shutdown-plan` | Operational risks | Risks requiring shutdown-based mitigation |
| `create-spare-parts-strategy` | Insurance spares | Risk scenarios driving insurance spare decisions |
| `create-or-framework` | Risk governance | Risk acceptance criteria and review requirements |
| `create-kpi-dashboard` | Risk KPIs | Risk metrics and barrier performance indicators |
| Emergency Response Agent | ERP development | Consequence scenarios driving emergency response planning |

### Peer Dependencies (Collaborative)
| Agent/Skill | Interaction | Description |
|-------------|-------------|-------------|
| `create-or-playbook` | Risk integration | Risk assessment outputs feed into OR Playbook risk management section |
| `create-maintenance-strategy` | Barrier maintenance | Maintenance strategies must address safety-critical barrier maintenance |

## Examples

See [`references/skill-examples.md`](references/skill-examples.md) for detailed examples.

## Templates & References

See [`references/skill-templates-references.md`](references/skill-templates-references.md) for detailed templates & references.
