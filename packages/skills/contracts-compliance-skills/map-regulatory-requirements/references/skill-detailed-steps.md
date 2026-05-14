# Detailed Step-by-Step Execution - map-regulatory-requirements

*Full detailed execution steps extracted from SKILL.md.*
*Read this file when executing the skill for complete step-by-step instructions.*

---

## Step-by-Step Execution

### Phase 1: Jurisdiction Mapping & Scoping (Steps 1-3)

**Step 1: Identify All Applicable Jurisdictions**
- Determine the precise geographic location of the facility (coordinates, administrative boundaries)
- Map all levels of government jurisdiction: national, regional, provincial, municipal
- Identify special jurisdictional areas: environmental protection zones, indigenous territories, water basin authorities, heritage zones, coastal zones
- Identify transboundary considerations (if facility operations affect multiple jurisdictions)
- Document the regulatory authority for each jurisdiction with contact information
- Create the jurisdiction hierarchy map

**Step 2: Characterize the Facility for Regulatory Applicability**
- Document facility parameters that trigger regulatory requirements:
  - Industry classification (CIIU/ISIC code)
  - Production capacity and throughput
  - Number and classification of workers (permanent, contract, shift patterns)
  - Hazardous materials inventory (types, quantities, classifications)
  - Water intake sources and discharge points
  - Air emission sources and profiles
  - Waste generation (types, volumes, classifications)
  - Energy sources and consumption
  - Land area and land use classification
  - Proximity to sensitive receptors (communities, water bodies, protected areas)
- Cross-reference facility parameters against known regulatory thresholds

**Step 3: Define Regulatory Scope and Categories**
- Establish regulatory categories for the facility:
  - Mining/Industry-Specific Operations
  - Environmental (air, water, waste, biodiversity, soil)
  - Occupational Health and Safety
  - Labor and Employment
  - Electrical and Energy
  - Water Rights and Management
  - Land Use and Permits
  - Transport and Logistics
  - Emergency Management
  - Community and Social
  - Archaeological and Heritage
  - Tax and Financial Compliance
- Confirm scope boundaries with the project team
- Identify any voluntary commitments (ICMM, IFC, Equator Principles) that create additional obligations

### Phase 2: Regulatory Inventory & Analysis (Steps 4-7)

**Step 4: Build the Regulatory Inventory**
- For each jurisdiction and category, systematically identify all applicable regulations:
  - Laws (Leyes)
  - Supreme Decrees (Decretos Supremos)
  - Regulations (Reglamentos)
  - Technical Standards (Normas Tecnicas)
  - Guidelines (Guias)
  - Official Interpretations (Oficios, Dictamenes)
- Query regulatory databases and government portals via mcp-web-monitor
- Cross-reference against industry association compliance checklists (e.g., Consejo Minero, SONAMI)
- Verify currency of each regulation (check for amendments, repeals, replacements)
- Document the full citation, issuing authority, and effective date for each regulation

**Step 5: Assess Applicability of Each Regulation**
- For each identified regulation, determine applicability:
  - **Fully Applicable**: All provisions of the regulation apply to the facility
  - **Partially Applicable**: Only specific sections or articles apply (document which ones)
  - **Not Applicable**: Regulation does not apply (document rationale for exclusion)
  - **Under Review**: Applicability requires legal interpretation or further facility information
- Apply applicability triggers and threshold analysis from Step 2
- Flag regulations requiring legal counsel review for complex applicability determinations
- Document the rationale for each applicability determination in the register

**Step 6: Extract Specific Requirements**
- For each applicable regulation, extract and categorize:
  - **Operational Requirements**: What the facility must do or not do (design standards, operational limits, prohibited activities)
  - **Reporting Obligations**: What must be reported, to whom, in what format, and by what deadline
  - **Permit Requirements**: What permits, licenses, or authorizations are needed
  - **Monitoring Requirements**: What must be monitored, at what frequency, using what methods
  - **Record-Keeping Requirements**: What records must be maintained, for how long, in what format
  - **Training Requirements**: What training must be provided, to whom, at what frequency
  - **Infrastructure Requirements**: What physical infrastructure or equipment is required for compliance
- Link extracted requirements to specific regulatory articles/sections for traceability

**Step 7: Identify and Analyze RCA Conditions**
- If an Environmental Impact Assessment has been approved (RCA granted):
  - Extract ALL conditions from the RCA (Resolucion de Calificacion Ambiental)
  - Categorize conditions by type (environmental monitoring, community commitments, mitigation measures)
  - Map each RCA condition to the underlying regulatory requirement
  - Identify conditions that exceed the base regulatory requirements
  - Flag conditions with specific deadlines or phase-dependent triggers
  - Document compliance evidence requirements for each condition

### Phase 3: Gap Analysis & Calendar (Steps 8-12)

**Step 8: Assess Current Compliance Status**
- For each extracted requirement, evaluate the facility's current status:
  - **Compliant**: Requirement is fully met with evidence available
  - **Partial Compliance**: Some elements met, others outstanding
  - **Non-Compliant / Gap**: Requirement not met or not addressed
  - **Not Assessed**: Insufficient information to determine compliance
- Review existing permits against the permit requirements inventory
- Review existing procedures against operational requirements
- Review existing monitoring programs against monitoring requirements
- Review existing training records against training requirements

**Step 9: Perform Gap Analysis and Prioritization**
- For each identified gap:
  - Describe the gap in specific, actionable terms
  - Assess the risk of the gap: likelihood of regulatory detection x consequence of non-compliance
  - Determine the remediation effort: time, cost, resources required
  - Assign a priority: Critical (must close before startup), High (close within 3 months of startup), Medium (close within 12 months), Low (close within 24 months)
  - Identify dependencies (gaps that must be closed before others can be addressed)
- Cluster gaps by root cause to identify systemic issues:
  - Documentation gaps (missing or outdated documents)
  - Infrastructure gaps (physical modifications or equipment needed)
  - Systems gaps (monitoring, reporting, or management systems needed)
  - Competency gaps (training or hiring required)
  - Permit gaps (applications not submitted or permits not obtained)

**Step 10: Build the Compliance Calendar**
- Compile all recurring compliance obligations:
  - Monthly reporting deadlines (e.g., SERNAGEOMIN monthly safety reports)
  - Quarterly monitoring and reporting (e.g., environmental monitoring programs)
  - Semi-annual and annual reporting (e.g., annual safety plan, annual environmental report)
  - Permit renewal dates with lead time buffers
  - Training renewal cycles
  - Equipment inspection and certification dates
  - Internal audit schedule aligned with regulatory cycles
- Calculate alert dates (90-day, 30-day, 7-day advance warnings)
- Identify periods of peak compliance activity for resource planning
- Build the 24-month forward calendar view

**Step 11: Build the Permit Tracking System**
- Catalog all permits required for the facility:
  - Environmental permits (RCA, water discharge, air emissions, waste management)
  - Mining/operational permits (SERNAGEOMIN authorization, blasting permits)
  - Water rights (DGA consumption and discharge authorizations)
  - Electrical permits (SEC authorizations for installations)
  - Construction permits (municipal building permits)
  - Hazardous materials permits (SEREMI de Salud authorizations)
  - Transport permits (hazardous materials transport, oversize loads)
- Determine the critical path for permit acquisition
- Identify permit dependencies (which permits require prior approvals)
- Calculate timelines based on typical processing durations per authority
- Flag permits at risk of delay and develop mitigation strategies

**Step 12: Configure Regulatory Change Monitoring**
- Set up monitoring parameters for regulatory changes via mcp-web-monitor:
  - New regulations published in the Diario Oficial
  - Amendments to existing applicable regulations
  - New enforcement guidance or interpretations from regulatory bodies
  - Proposed regulations in consultation period
  - Court decisions affecting regulatory interpretation
  - Industry association alerts and bulletins
- Define the review and update cycle for the regulatory register (quarterly minimum)
- Establish responsibility for regulatory change assessment and register update

### Phase 4: Validation & Reporting (Steps 13-16)

**Step 13: Cross-Validate Completeness**
- Compare the regulatory register against:
  - Industry benchmarks for similar facilities in the same jurisdiction
  - Regulatory checklists published by industry associations
  - Compliance registers of comparable facilities (anonymized)
  - Legal counsel review of high-risk regulatory areas
- Verify that all RCA conditions have been captured
- Confirm that all voluntary commitments have been included
- Ensure no regulatory body or jurisdiction has been overlooked

**Step 14: Generate Gap Analysis Report**
- Compile the gap analysis report following the specified document structure
- Include executive summary with risk-prioritized gap inventory
- Detail the remediation plan with timeline, resources, and responsibilities
- Present the permit strategy with critical path analysis
- Include recommendations for compliance management infrastructure

**Step 15: Stakeholder Review and Validation**
- Present the regulatory register to key stakeholders for review:
  - Legal counsel: regulatory citation accuracy and applicability determinations
  - HSE team: operational requirements and monitoring obligations
  - Environmental team: environmental permit and RCA conditions
  - Operations team: operational feasibility of compliance requirements
  - Finance team: compliance cost implications and budget requirements
- Incorporate review feedback and update the register

**Step 16: Store and Distribute Outputs**
- Store all deliverables in the project document management system (via mcp-sharepoint)
- Distribute gap analysis report to project leadership and compliance stakeholders
- Configure the compliance calendar for automated alerting (via mcp-outlook)
- Publish the regulatory register as a controlled document with revision tracking
- Schedule the first quarterly register review and update cycle

---
