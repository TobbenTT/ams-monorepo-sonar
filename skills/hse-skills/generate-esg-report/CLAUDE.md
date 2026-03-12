---
name: generate-esg-report
description: "Generate ESG (Environmental, Social, Governance) reports for operations. Triggers: 'ESG report', 'sustainability report', 'reporte ESG'."
---

# Generate ESG Report

## Skill ID: L-03
## Version: 1.0.0
## Category: L. Compliance Intelligence
## Priority: P2 - High

---

## Purpose

Generate comprehensive Environmental, Social, and Governance (ESG) operational reports for industrial facilities and capital projects, aligned with internationally recognized reporting frameworks including GRI Standards, TCFD recommendations, and SASB industry-specific standards. This skill transforms scattered operational data -- environmental monitoring records, social performance indicators, and governance documentation -- into structured, auditable ESG reports suitable for investors, regulators, lenders, and internal stakeholders.

ESG reporting has shifted from a voluntary corporate responsibility exercise to a mandatory requirement for capital access and operational license. The pain point is stark: 85% of institutional investors now require ESG disclosures before committing capital (Pain Point W-05, PwC Global Investor Survey 2023). For capital-intensive industries -- mining, oil & gas, power generation, water/wastewater -- the consequences of inadequate ESG reporting are severe:

- **Capital access restriction**: Major development finance institutions (IFC, EBRD, KfW) require TCFD-aligned climate risk disclosures and GRI-compliant sustainability reports as conditions for project financing. A $4B copper mine expansion without adequate ESG reporting faces 6-12 month financing delays.
- **Regulatory penalties**: The EU Corporate Sustainability Reporting Directive (CSRD), SEC climate disclosure rules, and Chile's CMF Norma de Caracter General No. 461 impose mandatory ESG reporting obligations. Non-compliance results in fines ranging from $50,000 to $5M depending on jurisdiction.
- **Operational license risk**: Community opposition driven by perceived environmental or social failings has delayed or cancelled $27B in mining projects globally in the past decade (McKinsey, 2023). Proactive ESG reporting builds the social license to operate.
- **Investor premium**: Companies with strong ESG performance and transparent reporting command a 10-20% valuation premium over peers with weak ESG practices (MSCI ESG Research, 2023).
- **Insurance cost**: Insurers increasingly use ESG risk scores in underwriting. Facilities with poor ESG performance face 15-30% higher insurance premiums for property and liability coverage.

This skill addresses the operational reality that ESG data lives in dozens of disconnected systems -- environmental monitoring in SCADA, social performance in HR systems, governance records in SharePoint, financial data in ERP -- and must be consolidated, validated, and formatted into coherent reports. Without automation, ESG report preparation typically consumes 200-400 person-hours per reporting cycle for a mid-size facility, with significant risk of data errors and inconsistencies.

---

## Intent & Specification

The AI agent MUST understand and execute the following:

1. **Multi-Framework Compliance**: ESG reports must simultaneously satisfy multiple reporting frameworks. The agent must understand the overlap and differences between GRI, TCFD, SASB, CDP, and IFRS S1/S2 standards, and produce reports that satisfy all applicable frameworks without redundant duplication. The report structure should use GRI as the primary backbone (most comprehensive), with TCFD climate disclosures and SASB industry-specific metrics mapped as supplementary sections.

2. **Industry-Specific Materiality**: Not all ESG topics are equally material for all industries. The agent must apply industry-specific materiality assessments:
   - **Mining**: Tailings management, water stewardship, community relations, closure planning, biodiversity
   - **Oil & Gas**: GHG emissions (Scope 1, 2, 3), flaring, spill prevention, process safety, decommissioning
   - **Power Generation**: Carbon intensity, renewable transition, grid reliability, land use
   - **Chemical**: Product stewardship, chemical safety, waste management, emissions
   - **Water/Wastewater**: Service reliability, water quality, infrastructure resilience, affordability

3. **Quantitative Rigor with Audit Trail**: Every ESG metric must be traceable to its source data. The agent must document data sources, calculation methodologies, assumptions, and estimation techniques. Reports must be prepared to a standard that supports third-party assurance (limited or reasonable) per ISAE 3000 / AA1000AS.

4. **Double Materiality Assessment**: Following EU CSRD requirements, the report must assess both:
   - **Impact materiality**: How the organization's activities affect the environment and society
   - **Financial materiality**: How ESG factors create financial risks and opportunities for the organization

5. **Climate Risk Integration (TCFD)**: The report must include the four TCFD pillars: Governance, Strategy, Risk Management, and Metrics & Targets. Climate scenario analysis must cover at least two scenarios (e.g., IEA Net Zero 2050 and IEA Stated Policies) with quantified financial impacts.

6. **Bilingual Capability**: Reports must be produced in Spanish (primary, for Chilean regulatory compliance) and English (secondary, for international investors and lenders), with consistent terminology across both versions.

7. **Continuous Improvement Tracking**: The report must include year-over-year trend analysis for all material KPIs, with clear identification of improvements, deteriorations, and the drivers behind each change.

8. **Stakeholder-Specific Versions**: The agent must produce multiple report versions from the same data:
   - **Full report** (80-150 pages): Complete GRI-aligned report for regulatory filing
   - **Executive summary** (10-15 pages): Investor-oriented highlights with TCFD alignment
   - **Community brief** (4-8 pages): Plain-language summary for community stakeholders
   - **Board report** (8-12 pages): Governance-focused with risk highlights

---

## Trigger / Invocation

```
/generate-esg-report
```

### Natural Language Triggers
- "Generate our annual ESG report"
- "Create an ESG disclosure for the [facility/project]"
- "Prepare a sustainability report aligned with GRI and TCFD"
- "Build ESG metrics dashboard for investor presentation"
- "Generar reporte ESG operacional para [planta/proyecto]"
- "Preparar informe de sostenibilidad alineado con GRI y TCFD"
- "Necesitamos el reporte ESG para los inversionistas"

### Aliases
- `/esg-report`
- `/sustainability-report`
- `/esg-disclosure`

---

## Input Requirements

### Required Inputs

| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `facility_profile` | Facility name, location, industry sector, products, capacity, operating period, and organizational boundaries for reporting | .docx / text | User / mcp-sharepoint |
| `reporting_period` | Start and end dates for the reporting period (typically calendar year or fiscal year) | Date range | User |
| `environmental_data` | Emissions data (Scope 1, 2, 3), energy consumption, water withdrawal/discharge, waste generation, land disturbance, biodiversity monitoring results | .xlsx / .csv | SCADA / Environmental monitoring / mcp-excel |
| `social_data` | Workforce statistics (headcount, diversity, turnover), safety metrics (TRIR, LTIFR, fatalities), community investment, grievance mechanisms, human rights assessments | .xlsx / .csv | HR system / mcp-sharepoint |
| `governance_data` | Board composition, committee structure, ESG governance policies, risk management framework, ethics and compliance records | .docx / .xlsx | Corporate secretary / mcp-sharepoint |
| `industry_sector` | Primary industry classification (Mining, Oil & Gas, Power, Chemical, Water) for SASB standard selection | Text | User |

### Optional Inputs (Strongly Recommended)

| Input | Description | Default if Absent |
|-------|-------------|-------------------|
| `previous_esg_report` | Prior period ESG report for trend comparison | First-time reporting assumed; no trends |
| `materiality_assessment` | Completed stakeholder materiality assessment | Agent performs desk-based materiality using SASB industry standards |
| `climate_scenario_analysis` | Pre-existing climate risk scenario outputs | Agent generates simplified scenario analysis using IEA scenarios |
| `emission_factors` | Country-specific emission factors for electricity, fuels, and processes | IPCC 2006/2019, IEA country factors applied |
| `esg_targets` | Corporate ESG targets and commitments (net-zero, water neutrality, diversity goals) | Report current performance without target comparison |
| `stakeholder_engagement_records` | Records of community meetings, grievance logs, social impact assessments | Section flagged as requiring additional data |
| `supplier_esg_data` | Supply chain ESG assessments, Scope 3 data from key suppliers | Scope 3 estimated using spend-based method |
| `regulatory_filings` | Environmental permits, compliance reports, regulatory correspondence | Compliance section based on available data |
| `financial_data` | Revenue, CAPEX, OPEX for ESG-related investments (green CAPEX, remediation costs) | Financial linkage section abbreviated |
| `photography_assets` | Facility photos, environmental monitoring imagery for report illustration | Report generated without imagery |

### Context Enrichment (Automatic)

The agent will automatically:
- Retrieve GRI Standards 2021 Universal Standards and applicable Topic Standards
- Access SASB standards for the specified industry sector
- Pull TCFD implementation guidance and sector-specific supplements
- Retrieve IEA emissions factors by country for Scope 2 calculations
- Access IPCC AR6 climate projection data for scenario analysis
- Pull industry ESG benchmarks from MSCI ESG Research datasets
- Retrieve Chilean regulatory requirements (CMF NCG 461, SMA reporting requirements, SERNAGEOMIN environmental obligations)
- Access CDP questionnaire structure for alignment
- Retrieve IFRS S1/S2 (ISSB) standards for climate and sustainability disclosure

---

## Output Specification

### Deliverable 1: Full ESG Report (.docx)

**Filename**: `{ProjectCode}_ESG_Report_{ReportingPeriod}_v{Version}_{YYYYMMDD}.docx`

**Target Length**: 80-150 pages depending on scope

**Structure**:

1. **Cover Page** -- VSC/client branding, reporting period, facility identification
2. **About This Report** (2 pages)
   - Reporting boundaries (organizational and operational)
   - Reporting frameworks applied (GRI, TCFD, SASB, IFRS S1/S2)
   - Reporting period and cycle
   - External assurance statement (if applicable)
   - GRI Content Index reference
   - Contact information for ESG inquiries
3. **Message from Leadership** (1-2 pages)
   - CEO/Board Chair statement on ESG commitment
   - Key achievements and challenges during reporting period
   - Forward-looking ESG priorities
4. **Organization Profile** (3-5 pages)
   - Activities, value chain, and products (GRI 2-1 to 2-6)
   - Governance structure (GRI 2-9 to 2-21)
   - Strategy, policies, and practices (GRI 2-22 to 2-28)
   - Stakeholder engagement (GRI 2-29 to 2-30)
5. **Materiality Assessment** (3-5 pages)
   - Double materiality methodology
   - Materiality matrix visualization (impact vs. financial materiality)
   - Material topics identified with justification
   - Stakeholder input summary
   - Changes from previous period
6. **Environmental Performance** (20-35 pages)
   - 6.1 Climate & Energy (GRI 302, 305; TCFD; SASB)
     - Energy consumption by source (renewable vs. non-renewable)
     - GHG emissions Scope 1, 2, 3 with methodology
     - Carbon intensity metrics (per tonne product, per revenue)
     - Climate risk assessment (physical and transition risks)
     - Climate scenario analysis (TCFD Pillar: Strategy)
     - Net-zero pathway and progress
   - 6.2 Water Stewardship (GRI 303)
     - Water withdrawal by source (surface, groundwater, municipal, recycled)
     - Water consumption and discharge quality
     - Water stress area assessment (WRI Aqueduct data)
     - Water efficiency metrics
   - 6.3 Biodiversity & Land Use (GRI 304)
     - Operational sites in/near areas of high biodiversity value
     - Habitat disturbance and rehabilitation
     - Biodiversity management plans and monitoring
     - No-net-loss or net-positive impact commitments
   - 6.4 Waste & Circular Economy (GRI 306)
     - Waste generation by type and disposal method
     - Hazardous waste management
     - Recycling and recovery rates
     - Tailings management (mining-specific)
     - Circular economy initiatives
   - 6.5 Air Quality & Emissions (GRI 305)
     - NOx, SOx, PM, VOC emissions
     - Compliance with air quality permits
     - Emission reduction initiatives
   - 6.6 Environmental Compliance (GRI 2-27)
     - Environmental incidents and spills
     - Regulatory actions and fines
     - Compliance audit results
7. **Social Performance** (20-30 pages)
   - 7.1 Occupational Health & Safety (GRI 403; SASB)
     - Safety KPIs: TRIR, LTIFR, severity rate, fatalities
     - Process safety events (Tier 1, Tier 2 per API 754)
     - Safety management system description
     - Safety culture survey results
     - Contractor safety performance
   - 7.2 Workforce (GRI 401, 404, 405)
     - Headcount, new hires, turnover
     - Diversity metrics (gender, age, ethnicity where applicable)
     - Training hours per employee
     - Equal pay analysis
     - Employee engagement survey results
   - 7.3 Community & Indigenous Peoples (GRI 411, 413)
     - Community investment and development programs
     - Indigenous peoples consultation and engagement
     - Grievance mechanism operations and outcomes
     - Social impact assessment updates
     - Local procurement and employment
   - 7.4 Human Rights (GRI 407, 408, 409, 410)
     - Due diligence processes
     - Freedom of association
     - Child labor and forced labor prevention
     - Security practices and human rights training
   - 7.5 Supply Chain Responsibility (GRI 308, 414)
     - Supplier ESG screening and assessment
     - Supply chain human rights due diligence
     - Responsible sourcing of critical minerals
8. **Governance** (10-15 pages)
   - 8.1 Corporate Governance (GRI 2-9 to 2-21)
     - Board composition, independence, diversity
     - ESG oversight structure
     - Executive compensation linked to ESG metrics
     - Board ESG competencies
   - 8.2 Ethics & Compliance (GRI 205, 206)
     - Anti-corruption policies and training
     - Whistleblower mechanism and cases
     - Political contributions and lobbying
     - Compliance management system
   - 8.3 Risk Management (TCFD Pillar: Risk Management)
     - ESG risk identification and assessment process
     - Integration with enterprise risk management
     - Emerging risk horizon scanning
   - 8.4 Tax Transparency (GRI 207)
     - Tax strategy and approach
     - Country-by-country tax reporting (if applicable)
9. **TCFD Disclosure Summary** (5-8 pages)
   - Governance (Board and management ESG oversight)
   - Strategy (Climate risks and opportunities, scenario analysis)
   - Risk Management (ESG risk processes)
   - Metrics and Targets (Climate metrics, reduction targets)
10. **ESG Performance Data Tables** (5-10 pages)
    - Multi-year data tables for all quantitative indicators
    - Units, methodologies, and data quality notes
    - Year-over-year trend indicators
11. **GRI Content Index** (5-8 pages)
    - Complete GRI Content Index with disclosure locations
    - Omissions with reasons
12. **SASB Index** (2-3 pages)
    - Industry-specific SASB disclosure mapping
13. **Appendices**
    - A: Detailed methodology notes and emission factor sources
    - B: Assurance statement (if applicable)
    - C: Glossary of ESG terms
    - D: Stakeholder engagement record summary

### Deliverable 2: ESG Data Workbook (.xlsx)

**Filename**: `{ProjectCode}_ESG_Data_{ReportingPeriod}_v{Version}_{YYYYMMDD}.xlsx`

**Sheets**: Environmental KPIs, Social KPIs, Governance KPIs, GRI Mapping, SASB Mapping, TCFD Mapping, Trend Analysis, Benchmark Comparison, Data Sources & Methodology

### Deliverable 3: Executive ESG Dashboard (.pptx / Power BI)

**Filename**: `{ProjectCode}_ESG_Dashboard_{ReportingPeriod}_v{Version}_{YYYYMMDD}.pptx`

**Structure (15-20 slides)**: ESG score card, environmental highlights with trend charts, social performance summary, governance ratings, investor-ready TCFD summary, materiality matrix, benchmark vs. peers, targets and progress.

### Deliverable 4: Stakeholder-Specific Briefs

- **Investor Brief** (10-15 pages .docx): TCFD-focused with financial materiality emphasis
- **Community Brief** (4-8 pages .docx): Plain-language, visual, local impact focus
- **Board Report** (8-12 pages .docx): Governance and risk focus with decision items

---

## Methodology & Standards

### Primary Reporting Frameworks (Mandatory Compliance)

| Framework | Application | Version |
|-----------|-------------|---------|
| **GRI Standards 2021** | Universal framework for sustainability reporting; provides the report backbone structure | GRI 1 (Foundation), GRI 2 (General Disclosures), GRI 3 (Material Topics), Topic Standards |
| **TCFD Recommendations** | Climate-related financial disclosures across four pillars: Governance, Strategy, Risk Management, Metrics & Targets | Final Report 2017 + 2021 Guidance |
| **SASB Standards** | Industry-specific ESG metrics; selects the most financially material indicators per sector | SASB Metals & Mining, Oil & Gas Exploration & Production, Electric Utilities, Chemicals (as applicable) |
| **IFRS S1 / S2 (ISSB)** | General sustainability and climate-related disclosure requirements; convergence standard | IFRS S1 (General), IFRS S2 (Climate) 2023 |

### Secondary Standards (Reference)

| Standard | Application |
|----------|-------------|
| **GHG Protocol** | Scope 1, 2, 3 greenhouse gas emission accounting methodology |
| **CDP (Carbon Disclosure Project)** | Questionnaire alignment for environmental disclosures |
| **ICMM Performance Expectations** | Mining industry ESG commitments and reporting expectations |
| **IFC Performance Standards** | Environmental and social requirements for project financing |
| **Equator Principles** | Project finance ESG risk assessment framework |
| **UN Global Compact** | Ten Principles alignment for human rights, labor, environment, anti-corruption |
| **UN SDGs** | Sustainable Development Goals mapping for ESG contributions |
| **ISAE 3000** | International Standard on Assurance Engagements (ESG assurance readiness) |
| **AA1000AS** | AccountAbility Assurance Standard for stakeholder engagement quality |
| **ISO 14064** | Greenhouse gas emission quantification and verification |
| **ISO 14001** | Environmental Management System alignment |
| **ISO 45001** | Occupational Health & Safety Management System alignment |
| **CMF NCG 461 (Chile)** | Chilean Securities Commission ESG reporting regulation |
| **EU CSRD** | Corporate Sustainability Reporting Directive (double materiality) |

### GHG Emission Calculation Methodology

```
Scope 1 (Direct Emissions):
  = Sum of [Fuel consumed (GJ) x Emission factor (tCO2e/GJ)] per fuel type
  + Process emissions (calculated per sector methodology)
  + Fugitive emissions (leak detection results x emission factors)

Scope 2 (Indirect - Electricity):
  Location-based = Electricity consumed (MWh) x Grid emission factor (tCO2e/MWh)
  Market-based = Electricity consumed (MWh) x Supplier-specific factor or residual mix

Scope 3 (Value Chain):
  Category 1: Purchased goods - Spend-based or physical-quantity method
  Category 3: Fuel & energy activities - WTT emission factors
  Category 4: Transportation - Distance-based or spend-based
  Category 5: Waste - Waste-type specific emission factors
  Category 6: Business travel - Distance and mode-based
  Category 9: Downstream transport - Distance-based
  [Other categories as material per sector]

Carbon Intensity:
  = Total Scope 1+2 emissions (tCO2e) / Production volume (tonnes product)
  = Total Scope 1+2 emissions (tCO2e) / Revenue ($M)
```

### ESG Materiality Assessment Methodology

```
Step 1: Identify ESG Universe
  - List all potentially material ESG topics from GRI Topic Standards + SASB + TCFD
  - Typically 25-40 candidate topics

Step 2: Assess Impact Materiality (Inside-Out)
  - For each topic: Score the significance of the organization's impact on
    environment/society (1-5 scale)
  - Consider: Scale, scope, irremediability, likelihood

Step 3: Assess Financial Materiality (Outside-In)
  - For each topic: Score the financial relevance to the organization (1-5 scale)
  - Consider: Revenue impact, cost impact, asset value impact, regulatory risk

Step 4: Double Materiality Matrix
  - Plot topics on 2D matrix (Impact vs. Financial materiality)
  - Quadrant 1 (High Impact, High Financial): Primary material topics
  - Quadrant 2 (High Impact, Low Financial): Impact-material topics
  - Quadrant 3 (Low Impact, High Financial): Financial-material topics
  - Quadrant 4 (Low Impact, Low Financial): Monitor / disclose minimally

Step 5: Stakeholder Validation
  - Cross-reference with stakeholder engagement results
  - Adjust based on emerging risks and sector trends
```

### Industry ESG Benchmark Data

| Metric | Mining Top Quartile | O&G Top Quartile | Utilities Top Quartile | Median Industrial |
|--------|-------------------|-----------------|----------------------|-------------------|
| GHG Intensity (tCO2e/kt product) | <15 | <200 | <400 g/kWh | Varies |
| Water Intensity (m3/kt product) | <500 | <2,000 | <50 m3/MWh | Varies |
| TRIR (per 200K hrs) | <0.5 | <0.3 | <0.8 | 1.5-3.0 |
| Women in Workforce (%) | >25% | >22% | >28% | 18-22% |
| Board Independence (%) | >75% | >80% | >75% | 60-70% |
| Waste Recycling Rate (%) | >70% | >60% | >50% | 35-45% |
| Community Investment (% revenue) | >1.0% | >0.8% | >0.5% | 0.3-0.5% |
| ESG-linked Executive Comp (%) | >30% of variable | >25% | >20% | 10-15% |

---

## Step-by-Step Execution

### Phase 1: Scoping & Data Collection (Steps 1-4)
**Step 1: Define reporting scope and boundaries.**
### Phase 2: Analysis & Framework Mapping (Steps 5-8)
**Step 5: Calculate environmental KPIs and emission inventories.**
### Phase 3: Report Generation (Steps 9-13)
**Step 9: Draft environmental sections of the ESG report.**
### Phase 4: Quality Assurance & Finalization (Steps 14-16)
**Step 14: Perform internal data reconciliation.**

See [`references/skill-detailed-steps.md`](references/skill-detailed-steps.md) for complete detailed execution steps.

## Quality Criteria

### Content Quality (Target: >90% Stakeholder Satisfaction)

| Criterion | Weight | Description | Verification Method |
|-----------|--------|-------------|---------------------|
| GRI Compliance | 25% | Report satisfies all applicable GRI Universal and Topic Standard disclosure requirements; GRI Content Index is complete | Checklist audit against GRI Standards 2021 |
| TCFD Alignment | 20% | All four TCFD pillars addressed with scenario analysis and quantified financial impacts | TCFD compliance matrix review |
| Data Accuracy | 20% | All quantitative data is traceable to source, arithmetically correct, and consistently calculated | Internal reconciliation + spot-check audit |
| SASB Industry Mapping | 10% | All applicable SASB industry-specific metrics reported or omission justified | SASB indicator checklist per industry |
| Materiality Robustness | 10% | Double materiality assessment is documented, stakeholder-validated, and reflects current ESG landscape | Methodology review; peer materiality comparison |
| Assurance Readiness | 10% | Report is prepared to ISAE 3000 limited assurance standard; data trails documented | Assurance readiness checklist (>80% indicators ready) |
| Stakeholder Accessibility | 5% | Report versions are appropriate for each audience; community brief uses plain language | Readability scoring; stakeholder feedback |

### Automated Quality Checks

- [ ] Every GRI Content Index entry has a page reference or omission reason
- [ ] GHG emissions Scope 1 + 2 + 3 subtotals sum to reported total (tolerance 0.1%)
- [ ] Safety KPIs (TRIR, LTIFR) are calculable from reported numerators and denominators
- [ ] Water balance reconciles: Withdrawal - Discharge = Consumption (tolerance 5%)
- [ ] Waste by disposal method sums to total waste generated (tolerance 1%)
- [ ] Year-over-year changes >25% have explanatory narrative
- [ ] All emission factors cite their source document and year
- [ ] All SASB mandatory indicators for the industry are addressed or omission noted
- [ ] No "TBD," "pending," or placeholder entries in final report
- [ ] Board composition percentages sum to 100%
- [ ] ESG targets have baseline year, target year, and methodology defined
- [ ] Bilingual versions use identical data (no translation-induced discrepancies)
- [ ] Benchmark data cites sources with year of data
- [ ] TCFD scenario analysis uses at least two scenarios with different temperature pathways
- [ ] Report contains no confidential financial data beyond approved ESG metrics

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs From)

| Agent/Skill | Input Provided | Criticality | MCP Channel |
|-------------|---------------|-------------|-------------|
| Agent 4 (HSE Intelligence) / `agent-hse` | Safety statistics, environmental incident data, process safety events, regulatory compliance records | Critical | mcp-sharepoint |
| Agent 5 (Workforce Readiness) / `agent-hr` | Workforce demographics, diversity metrics, training hours, turnover data | Critical | mcp-sharepoint |
| Agent 6 (Finance Intelligence) / `agent-finance` | ESG-related financial data (green CAPEX, remediation costs, carbon costs), revenue data for intensity metrics | High | mcp-sharepoint |
| Agent 8 (Legal & Compliance) / `agent-legal` | Regulatory compliance status, ESG regulatory requirements, fines and penalties | High | mcp-sharepoint |
| `audit-compliance-readiness` (L-04) | Compliance gap analysis results for governance section | High | Internal |
| `map-regulatory-requirements` (L-01) | Regulatory register including ESG-specific requirements | High | Internal |
| `track-incident-learnings` (L-02) | Incident data and learning status for safety performance section | Medium | Internal |
| `calculate-operational-kpis` (S-01) | Operational KPIs including energy efficiency, water efficiency | Medium | Internal |
| `benchmark-maintenance-kpis` (MAINT-04) | Asset performance data for environmental efficiency metrics | Low | Internal |

### Downstream Dependencies (Outputs To)

| Agent/Skill | Output Provided | Trigger |
|-------------|----------------|---------|
| `audit-compliance-readiness` (L-04) | ESG compliance status for regulatory readiness assessment | On request |
| `create-client-presentation` | ESG highlights for investor presentations | On request |
| `create-or-strategy` | ESG considerations for OR strategy development | Automatic |
| `orchestrate-or-program` (H-01) | ESG readiness status as input to gate reviews | Automatic |
| `track-or-deliverables` (H-02) | ESG report as tracked OR deliverable | On completion |
| Agent 11 (Communications) / `agent-communications` | ESG key messages for stakeholder communications | On request |

### MCP Integrations

| MCP Server | Purpose | Operations |
|------------|---------|------------|
| **mcp-sharepoint** | Retrieve source data (environmental monitoring, HR data, governance docs); store ESG report deliverables; manage document approval workflow | `GET /documents/{library}`, `POST /documents/{library}`, `GET /lists/{list}`, `POST /lists/{list}` |
| **mcp-excel** | Generate ESG data workbook with calculations, charts, and multi-year trend analysis; consolidate data from multiple sources | `POST /workbooks`, `PUT /sheets/{sheet}`, `GET /workbooks/{id}` |
| **mcp-powerbi** | Publish ESG dashboard with real-time KPI tracking, trend visualization, and peer benchmarking; refresh datasets | `POST /datasets`, `PUT /reports`, `POST /refresh` |

---

## Examples

See [`references/skill-examples.md`](references/skill-examples.md) for detailed examples.

## Templates & References

See [`references/skill-templates-references.md`](references/skill-templates-references.md) for detailed templates & references.
