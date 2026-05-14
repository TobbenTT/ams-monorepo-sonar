# Detailed Step-by-Step Execution - generate-esg-report

*Full detailed execution steps extracted from SKILL.md.*
*Read this file when executing the skill for complete step-by-step instructions.*

---

## Step-by-Step Execution

### Phase 1: Scoping & Data Collection (Steps 1-4)

**Step 1: Define reporting scope and boundaries.**
- Confirm reporting period (calendar year or fiscal year, start and end dates)
- Establish organizational boundaries: equity share or operational control approach (GRI 2-2)
- Define operational scope: which facilities, operations, and legal entities are included
- Identify applicable reporting frameworks based on: investor requirements, regulatory obligations, industry sector, and voluntary commitments
- Select SASB industry standard(s) applicable to the organization
- Determine reporting level: consolidated corporate, facility-level, or project-level
- Identify audience-specific report versions required
- **Quality gate**: Scope definition approved by report sponsor

**Step 2: Conduct materiality assessment.**
- Generate ESG topic universe from GRI Standards, SASB industry standards, and TCFD
- Score each topic for impact materiality (1-5 scale) using operational data and industry context
- Score each topic for financial materiality (1-5 scale) using risk register, financial data, and regulatory landscape
- Generate double materiality matrix
- Identify Tier 1 (fully report), Tier 2 (partially report), and Tier 3 (monitor only) topics
- Cross-reference with previous materiality assessment if available
- Document methodology, scoring rationale, and stakeholder input
- **Quality gate**: Materiality assessment has at least 10 Tier 1 topics; no SASB mandatory indicators excluded

**Step 3: Collect environmental data.**
- Retrieve energy consumption data: electricity (MWh), fuels by type (diesel, natural gas, LPG, coal -- in GJ or physical units), renewable energy generated or purchased
- Retrieve GHG emission source data or calculate from energy data using appropriate emission factors:
  - Scope 1: Fuel combustion, process emissions, fugitive emissions (SF6, CH4)
  - Scope 2: Grid electricity, steam/heating purchased (location-based and market-based)
  - Scope 3: Purchased goods, transportation, waste, business travel, employee commuting (by category, using best available method)
- Retrieve water data: withdrawal by source (surface water, groundwater, seawater, third-party), discharge by destination and quality, consumption (withdrawal minus discharge)
- Retrieve waste data: generation by type (hazardous, non-hazardous), disposal method (landfill, incineration, recycling, recovery), tailings generation (mining)
- Retrieve biodiversity data: land disturbance (ha), rehabilitation (ha), protected areas near operations, species monitoring results
- Retrieve air quality data: NOx, SOx, PM2.5, PM10, VOC emissions, compliance monitoring results
- Retrieve environmental incident data: spills (number, volume, material), exceedances, regulatory notices
- **Quality gate**: Environmental data covers >95% of operational scope; gaps documented with estimation methodology

**Step 4: Collect social and governance data.**
- Retrieve workforce data from HR system:
  - Headcount by gender, age group, management level, region, contract type
  - New hires and turnover by same dimensions
  - Training hours by category and employee level
  - Diversity metrics: gender pay ratio, representation in leadership
- Retrieve safety data:
  - Recordable injuries, lost-time injuries, high-potential incidents, fatalities
  - Process safety events (Tier 1, Tier 2 per API 754 or equivalent)
  - Near-miss reports and safety observations
  - Contractor safety statistics
- Retrieve community data:
  - Community investment spend (cash, in-kind, time)
  - Community grievances received, resolved, pending
  - Social impact assessment findings
  - Indigenous peoples engagement records
  - Local employment and procurement percentages
- Retrieve governance data:
  - Board composition (independence, diversity, tenure, expertise)
  - Board committee structure and ESG oversight arrangements
  - ESG-linked executive compensation details
  - Ethics training completion rates
  - Whistleblower reports and resolutions
  - Anti-corruption program metrics
  - Political contributions and lobbying expenditures
- **Quality gate**: Social data gaps <10%; governance disclosures cover all GRI 2-9 to 2-28 requirements

### Phase 2: Analysis & Framework Mapping (Steps 5-8)

**Step 5: Calculate environmental KPIs and emission inventories.**
- Calculate Scope 1 emissions by source category using GHG Protocol methodology
- Calculate Scope 2 emissions using both location-based and market-based methods
- Calculate Scope 3 emissions for material categories (minimum: purchased goods, fuel & energy, transportation, waste)
- Calculate total carbon footprint (Scope 1 + 2 + 3)
- Calculate intensity metrics: emissions per tonne product, emissions per revenue dollar, emissions per employee
- Calculate water intensity: m3 per tonne product, m3 per revenue dollar
- Calculate waste intensity: kg per tonne product, recycling/recovery percentage
- Calculate energy intensity: GJ per tonne product, renewable energy percentage
- Generate year-over-year trend analysis for all environmental KPIs
- Benchmark against industry peers (using MSCI ESG, S&P Global CSA, or industry association data)
- Identify material improvements and deteriorations with root cause explanations
- **Quality gate**: Emission calculations reconcile within 5% of previous year's methodology; intensity metrics trend is explainable

**Step 6: Perform climate risk assessment (TCFD).**
- Identify physical climate risks relevant to facility location:
  - Acute: Extreme weather events (floods, droughts, cyclones, wildfires)
  - Chronic: Temperature rise, sea-level rise, precipitation changes, water stress
- Identify transition climate risks:
  - Policy: Carbon pricing, emission standards, phase-out regulations
  - Technology: Clean energy disruption, energy efficiency requirements
  - Market: Shifting demand, commodity price volatility
  - Reputation: Stakeholder activism, ESG ratings impact
- Conduct scenario analysis using at least two scenarios:
  - Scenario 1: IEA Net Zero Emissions by 2050 (NZE) -- 1.5 degrees C pathway
  - Scenario 2: IEA Stated Policies (STEPS) -- ~2.7 degrees C pathway
- For each scenario, quantify:
  - Financial impact on operations (energy costs, carbon costs, stranded asset risk)
  - Physical impact on assets (damage risk, operational disruption probability)
  - Strategic implications (product demand, technology transition requirements)
- Document climate risk management process and integration with ERM
- Define climate metrics, targets, and decarbonization pathway
- **Quality gate**: TCFD disclosure covers all four pillars; scenario analysis includes quantified financial impacts

**Step 7: Map data to reporting frameworks.**
- Map all collected data and calculated KPIs to GRI disclosure requirements:
  - Universal Standards: GRI 2 (General Disclosures), GRI 3 (Material Topics)
  - Topic Standards: GRI 302 (Energy), 303 (Water), 304 (Biodiversity), 305 (Emissions), 306 (Waste), 401 (Employment), 403 (OHS), 404 (Training), 405 (Diversity), 413 (Communities), etc.
- Map data to SASB industry-specific indicators:
  - Mining: EM-MM-110a (GHG), EM-MM-140a (Water), EM-MM-160a (Biodiversity), EM-MM-210a (Community), EM-MM-320a (Safety), EM-MM-540a (Tailings)
  - Oil & Gas: EM-EP-110a (GHG), EM-EP-140a (Water), EM-EP-160a (Biodiversity), EM-EP-320a (Safety), EM-EP-540a (Reserves)
- Map data to TCFD recommended disclosures across all four pillars
- Map data to IFRS S1/S2 requirements where applicable
- Identify disclosure gaps (data not available for required disclosure)
- For each gap: determine if estimation is acceptable, or flag as omission with reason
- **Quality gate**: >90% of GRI required disclosures populated; >85% of SASB industry metrics available; all four TCFD pillars addressed

**Step 8: Benchmark performance against peers.**
- Select peer group: 8-12 companies in same industry and similar scale
- Extract peer ESG data from MSCI ESG ratings, S&P Global CSA, CDP responses, and public sustainability reports
- Calculate relative performance (percentile) for each material KPI:
  - Environmental: GHG intensity, water intensity, waste recycling rate, energy efficiency
  - Social: TRIR, diversity ratios, community investment, training hours
  - Governance: Board independence, ESG compensation linkage, ethics program maturity
- Identify areas of competitive advantage (top quartile performance)
- Identify areas requiring improvement (below median performance)
- Generate benchmark comparison charts and tables
- **Quality gate**: Peer comparison covers at least 8 peers and 15 KPIs; data sources documented

### Phase 3: Report Generation (Steps 9-13)

**Step 9: Draft environmental sections of the ESG report.**
- Write Climate & Energy section with:
  - GHG emission inventory tables (Scope 1, 2, 3 by category)
  - Energy consumption breakdown with renewable percentage
  - Carbon intensity trend charts
  - Emission reduction initiatives and their quantified impact
  - Net-zero pathway description and milestones
- Write Water Stewardship section with water balance diagram, stress assessment, and efficiency metrics
- Write Biodiversity section with site maps, habitat assessments, and management plans
- Write Waste section with generation, diversion, and circular economy initiatives
- Write Environmental Compliance section with incident summary, regulatory actions, and corrective measures
- Apply GRI disclosure requirements as checklist for completeness
- Include TCFD-aligned climate risk narrative in strategy subsection
- **Quality gate**: Environmental sections address all Tier 1 material topics; no mandatory SASB indicators omitted

**Step 10: Draft social sections of the ESG report.**
- Write OHS section with safety pyramid (fatalities, LTIs, recordables, first aids, near misses), leading indicators, and safety program description
- Write Workforce section with employment data tables, diversity analysis, training and development programs, and employee well-being initiatives
- Write Community section with investment data, stakeholder engagement summary, grievance mechanism performance, and case studies of community programs
- Write Human Rights section with due diligence process, supply chain assessment, and remediation mechanisms
- Write Supply Chain section with supplier screening criteria, assessment results, and corrective actions
- **Quality gate**: Social sections include both quantitative metrics and qualitative narrative; case studies provided for material topics

**Step 11: Draft governance sections and TCFD summary.**
- Write Governance section with board composition table, committee descriptions, ESG oversight narrative, and executive compensation ESG linkage
- Write Ethics & Compliance section with anti-corruption metrics, whistleblower statistics, and compliance management description
- Write Risk Management section describing ESG risk identification, assessment, and response processes
- Compile stand-alone TCFD Disclosure Summary following the four-pillar structure:
  - Governance: Board and management ESG roles
  - Strategy: Climate risks, opportunities, scenario analysis results
  - Risk Management: ESG risk process integration with ERM
  - Metrics & Targets: Climate metrics, reduction targets, progress
- **Quality gate**: TCFD summary is self-contained and extractable for separate distribution

**Step 12: Compile indices, data tables, and appendices.**
- Generate GRI Content Index with all reported disclosures, page references, and omission explanations
- Generate SASB Index mapping industry-specific disclosures to report sections
- Compile ESG Performance Data Tables with 3-5 year time series for all quantitative indicators
- Document methodology notes for each calculated metric
- Prepare glossary of ESG terms in both English and Spanish
- Compile appendix with emission factor sources, data quality notes, and boundary definitions
- **Quality gate**: GRI Content Index is complete with no blank entries; all quantitative disclosures have documented methodology

**Step 13: Generate stakeholder-specific versions.**
- Produce Investor Brief (10-15 pages): Extract TCFD summary, financial materiality highlights, benchmark positioning, ESG rating improvement areas, and forward-looking targets
- Produce Community Brief (4-8 pages): Translate key environmental and social data into plain language with infographics; focus on local impacts, community programs, and grievance outcomes
- Produce Board Report (8-12 pages): Emphasize governance effectiveness, risk landscape, regulatory compliance, ESG target progress, and decision items requiring board attention
- Produce ESG Data Workbook (.xlsx): All quantitative data in structured format for analysis, with GRI/SASB/TCFD mapping per sheet
- Produce ESG Dashboard (Power BI or .pptx): Visual scorecards with trend lines, peer benchmarks, and RAG status per material topic
- **Quality gate**: Each version is self-consistent and does not contradict other versions; no confidential data in community brief

### Phase 4: Quality Assurance & Finalization (Steps 14-16)

**Step 14: Perform internal data reconciliation.**
- Cross-check all quantitative data across report sections, data tables, and workbook -- zero discrepancies allowed
- Verify GHG emission totals: Scope 1 + 2 + 3 subtotals sum to reported total
- Verify safety statistics: Individual incidents sum to TRIR/LTIFR calculations
- Verify water balance: Withdrawal - Discharge = Consumption (within 5% tolerance)
- Verify waste totals: Sum of disposal categories equals total waste generated
- Check year-over-year trends for reasonableness: flag any change >25% for explanation
- Verify all emission factors match documented sources
- **Quality gate**: Zero arithmetic errors; zero data inconsistencies across deliverables

**Step 15: Assurance readiness review.**
- Evaluate report against ISAE 3000 requirements for limited assurance readiness:
  - Data trail: Can every reported number be traced to source data? Document the trail.
  - Methodology: Are calculation methodologies documented and consistently applied?
  - Controls: Are data collection controls adequate (review, validation, sign-off)?
  - Completeness: Does the report cover all material topics within the defined boundary?
- Flag areas where data quality is insufficient for assurance (estimation, extrapolation, proxy data)
- Prepare assurance readiness summary for management review
- **Quality gate**: >80% of quantitative disclosures are assurance-ready (traceable, documented, controlled)

**Step 16: Final compilation and formatting.**
- Apply VSC or client branding to all deliverables
- Ensure consistent formatting: headings, fonts, table styles, chart color schemes
- Generate bilingual version if required (Spanish primary, English secondary)
- Insert cross-references between sections and to GRI Content Index
- Verify all hyperlinks and internal references function correctly
- Generate PDF versions for distribution
- Store all deliverables in mcp-sharepoint with appropriate metadata and access controls
- **Quality gate**: All deliverables formatted, branded, and stored; report sponsor sign-off obtained

---
