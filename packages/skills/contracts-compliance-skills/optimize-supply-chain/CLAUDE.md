---
name: optimize-supply-chain
description: "Analyze and optimize supply chain for cost, lead time, risk, and supplier diversification. Triggers: 'supply chain optimization', 'supply chain risk', 'supplier diversification', 'lead time reduction', 'procurement optimization', 'optimizacion cadena de suministro', 'riesgo de proveedores', 'reduccion de plazos'."
---

# Optimize Supply Chain

## Skill ID: optimize-supply-chain
## Version: 1.0.0
## Category: B - Analysis
## Priority: High

---

## Purpose

Analyze the end-to-end project supply chain to optimize across four critical dimensions: total landed cost, lead time compression, supply reliability, and risk mitigation. This skill evaluates the full procurement ecosystem -- from raw material sourcing through manufacturing, logistics, customs clearance, and site delivery -- to identify cost savings, schedule acceleration opportunities, and vulnerabilities that threaten project execution.

Industrial capital projects in mining, oil & gas, and energy sectors routinely source equipment and materials from 15-30 countries, engaging 100-300 suppliers across multiple commodity categories. IPA benchmarking data shows that procurement costs represent 40-60% of total installed cost (TIC) on capital projects, yet supply chain optimization receives a fraction of the analytical rigor applied to engineering or construction. The consequences are predictable: 20-35% of projects experience material delivery delays that impact the critical path, single-source dependencies create schedule risk that only becomes visible during a disruption, and total landed costs routinely exceed budget by 10-20% due to unmanaged freight, duties, and handling charges.

For Operational Readiness specifically, supply chain performance determines whether the plant can commission on schedule (equipment delivery), operate safely from Day 1 (spare parts availability), and sustain production during ramp-up (consumables and MRO supply). This skill connects procurement intelligence with OR program management to ensure the supply chain is treated as a strategic enabler rather than an administrative function.

---

## Intent & Specification

The AI agent MUST understand and execute the following core objectives:

1. **Total Landed Cost Analysis**: Every procurement item must be evaluated on total landed cost (TLC), not unit price alone. TLC includes: unit purchase price, packaging and crating, inland transport to port of origin, freight (sea/air/land), marine insurance, import duties and taxes, customs brokerage fees, port handling charges, inland transport to site, receiving inspection costs, warehousing and preservation costs, and currency conversion costs. A supplier quoting 15% lower unit price may actually cost more when TLC is computed.

2. **Supply Risk Assessment**: The agent must systematically evaluate supply risk across five dimensions: (a) single-source dependency -- items with only one qualified supplier; (b) geographic concentration -- multiple critical items sourced from a single country or region vulnerable to disruption; (c) supplier financial health -- vendors at risk of insolvency or capacity constraints; (d) lead time variability -- suppliers with inconsistent delivery performance; (e) force majeure exposure -- geopolitical, climate, pandemic, or trade policy risks affecting supply routes.

3. **Lead Time Decomposition and Compression**: Every long-lead item's delivery timeline must be decomposed into its component phases: vendor engineering, raw material procurement, manufacturing, quality inspection/FAT, export clearance, ocean/air transit, import customs, and inland delivery. Each phase is analyzed for compression opportunities: parallel processing, pre-positioning of raw materials, alternative shipping modes, pre-clearance customs strategies, and direct-to-site routing.

4. **Critical Path Impact Prioritization**: Supply chain optimization efforts must be prioritized by impact on the project critical path. Items whose delivery dates drive commissioning milestones receive highest priority for cost reduction, lead time compression, and risk mitigation analysis. Non-critical items are optimized for cost.

5. **Dual-Sourcing Strategy for Critical Items**: For every item classified as critical (single-source, critical-path, or high-value), the agent must identify and evaluate at least one alternative supplier. The dual-sourcing recommendation includes: qualification requirements, lead time comparison, cost premium analysis, quality equivalence assessment, and a recommended sourcing split (e.g., 70/30 primary/secondary).

6. **Local Content and Regulatory Compliance**: Many jurisdictions impose local content requirements for industrial projects (e.g., Chilean mining law preferences, community benefit agreements, financing covenants). The agent must map local content obligations, identify items that can be sourced locally without quality or schedule compromise, and calculate the local content percentage achieved versus required.

7. **Currency Risk and Hedging Considerations**: International procurement exposes the project to currency fluctuation risk. The agent must quantify currency exposure by supplier currency (USD, EUR, CNY, GBP, BRL), model the impact of +/-10% currency movements on total procurement cost, and recommend hedging strategies (forward contracts, natural hedges through local sourcing) for material exposures.

8. **Language**: All deliverables must be produced in Spanish (Latin American), with international trade terms and standard references preserved in their original language (English, INCOTERMS codes).

---

## Trigger / Invocation

```
/optimize-supply-chain
```

### Natural Language Triggers
- "Optimize our supply chain for cost and lead time"
- "Analyze supply chain risk for the project"
- "Identify single-source dependencies in our procurement"
- "Evaluate supplier diversification options"
- "Reduce procurement lead times for critical equipment"
- "Calculate total landed cost for our major purchase orders"
- "Assess our supply chain vulnerability to disruption"
- "Optimizar la cadena de suministro del proyecto"
- "Analizar riesgo de proveedores y fuentes unicas"
- "Reducir plazos de entrega de equipos criticos"
- "Evaluar diversificacion de proveedores"

### Aliases
- `/supply-chain-analysis`
- `/procurement-optimization`
- `/supplier-risk-assessment`

---

## Input Requirements

### Required Inputs

| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| Procurement Register | Complete list of all project purchase orders with item descriptions, quantities, unit prices, vendors, delivery dates, and PO status | .xlsx / .csv | project-database / SAP MM |
| Delivery Performance Data | Historical and current delivery performance by supplier: promised vs. actual dates, variance trends | .xlsx / .csv | project-database / track-long-lead-procurement |
| Construction Critical Path | Project schedule identifying critical path activities and their material/equipment dependencies | .xlsx / .mpp | Execution Agent / mcp-sharepoint |
| Total Cost Breakdown | Itemized cost data including unit prices, freight, duties, insurance, handling, and storage charges per PO line | .xlsx | Contracts Agent / mcp-sharepoint |

### Optional Inputs (Highly Recommended)

| Input | Description | Default if Absent |
|-------|-------------|-------------------|
| Supplier Financial Data | Credit ratings, annual reports, Dun & Bradstreet scores for key suppliers | All suppliers assumed moderate financial risk |
| Market Intelligence Reports | Commodity market trends, supply-demand forecasts, industry capacity utilization | Current spot market conditions assumed stable |
| Alternative Supplier Database | Pre-qualified alternative vendors by equipment category and commodity | Agent performs market research for critical items |
| Commodity Price Indices | Historical and forecast price indices for steel, copper, aluminum, nickel, and other key materials | Fixed prices at PO date assumed |
| Local Content Regulations | Applicable local content requirements from permits, financing covenants, or community agreements | No local content obligation assumed |
| Currency Exposure Data | PO values by currency, current exchange rates, hedging positions in place | All POs assumed in USD equivalent |
| Logistics Cost Benchmarks | Current freight rates (sea, air, land) by trade lane relevant to the project | Industry average rates applied |
| Vendor Qualification Records | Approved vendor lists, qualification audit results, performance scorecards | All current vendors assumed qualified |
| Geopolitical Risk Assessments | Country risk ratings for supplier nations (trade sanctions, political stability, logistics reliability) | Standard country risk ratings from World Bank applied |

### Context Enrichment

The agent will automatically retrieve:
- Current commodity price indices and trends from public market data sources
- Shipping rate benchmarks (Baltic Dry Index, container freight indices) for major trade lanes to Chile
- Chilean customs duty schedules and free trade agreement applicability for each supplier country
- Exchange rate data and volatility metrics for major procurement currencies (USD, EUR, CNY, GBP, BRL)
- Supplier concentration analysis from the procurement register (Herfindahl-Hirschman Index by category)

---

## Output Specification

### Document: Supply Chain Optimization Report (.docx)

**Filename**: `VSC_SupplyChainAnalysis_{ProjectCode}_{Version}_{Date}.docx`

**Target Length**: 35-55 pages depending on procurement complexity

**Structure**:

1. **Cover Page** -- VSC branding, project identification, analysis date, overall supply chain health score
2. **Document Control** -- Revision history, analysis team, review and approval
3. **Executive Summary** (3-4 pages)
   - Overall supply chain health score and RAG status
   - Top 5 cost reduction opportunities with estimated savings
   - Top 5 lead time compression opportunities with schedule impact
   - Critical single-source dependencies requiring immediate action
   - Total landed cost variance vs. budget summary
   - Key strategic recommendations
4. **Supply Chain Overview** (3-4 pages)
   - 4.1 Procurement portfolio summary (total POs, total value, supplier count, country distribution)
   - 4.2 Category breakdown (equipment, bulk materials, instruments, electrical, spare parts, consumables)
   - 4.3 Supply chain map visualization (origin countries, logistics routes, consolidation points)
   - 4.4 Current vs. optimal supply chain maturity assessment
5. **Risk Heat Map & Single-Source Analysis** (5-7 pages)
   - 5.1 Supply risk heat map (likelihood vs. impact matrix for all risk categories)
   - 5.2 Single-source dependency register with criticality assessment
   - 5.3 Geographic concentration analysis with disruption scenario modeling
   - 5.4 Supplier financial health assessment for top-20 vendors by value
   - 5.5 Force majeure and geopolitical risk assessment by supply corridor
   - 5.6 Lead time variability analysis with statistical distribution by supplier
6. **Total Landed Cost Comparison** (5-7 pages)
   - 6.1 TLC methodology and component breakdown
   - 6.2 TLC analysis by procurement category
   - 6.3 Unit price vs. TLC ranking comparison (items where cheapest unit price is not cheapest TLC)
   - 6.4 Freight cost optimization (consolidation opportunities, mode selection, route optimization)
   - 6.5 Duty and tax optimization (FTA utilization, temporary import regimes, bonded warehouse options)
   - 6.6 Currency impact analysis and hedging recommendations
7. **Lead Time Waterfall Analysis** (4-5 pages)
   - 7.1 Lead time decomposition for top-20 critical items
   - 7.2 Phase-by-phase compression opportunities
   - 7.3 Parallel processing and fast-track strategies
   - 7.4 Logistics acceleration options (sea-to-air, express customs, direct routing)
   - 7.5 Lead time benchmark comparison (actual vs. industry standard by equipment type)
8. **Optimization Recommendations** (5-7 pages)
   - 8.1 Cost optimization actions with estimated savings and implementation timeline
   - 8.2 Lead time compression actions with schedule impact quantification
   - 8.3 Risk mitigation actions with risk reduction quantification
   - 8.4 Quick wins (implementable within 30 days)
   - 8.5 Medium-term initiatives (30-180 days)
   - 8.6 Strategic changes (>180 days, requiring policy or contract modifications)
9. **Supplier Diversification Roadmap** (3-4 pages)
   - 9.1 Dual-sourcing strategy for critical items
   - 9.2 Alternative supplier qualification plan and timeline
   - 9.3 Local content optimization plan
   - 9.4 Supplier development opportunities (local vendors capable of qualification)
10. **Implementation Plan** (2-3 pages)
    - 10.1 Prioritized action register with owners and deadlines
    - 10.2 Resource requirements for implementation
    - 10.3 Expected benefits realization timeline
    - 10.4 KPI framework for measuring supply chain improvement
11. **Appendices**
    - A: Complete TLC analysis workbook
    - B: Single-source dependency register
    - C: Supplier risk scorecard detail
    - D: Lead time waterfall charts for all critical items

---

## Methodology & Standards

### Primary Standards

| Standard | Application |
|----------|-------------|
| **SCOR Model (Supply Chain Operations Reference)** | End-to-end supply chain performance framework: Plan, Source, Make, Deliver, Return |
| **ISO 28000:2022** | Security management systems for the supply chain -- risk assessment framework |
| **Kraljic Portfolio Purchasing Model** | Supplier segmentation into leverage, strategic, bottleneck, and non-critical quadrants |
| **Total Cost of Ownership (TCO)** | Full lifecycle cost analysis beyond purchase price |
| **INCOTERMS 2020** | Standard trade terms governing cost and risk transfer in international procurement |
| **ISO 31000:2018** | Risk management framework applied to supply chain risk assessment |
| **Chilean Customs Regulations (Ordenanza de Aduanas)** | Import duty calculation, FTA applicability, temporary admission regimes |

### Kraljic Matrix Application

| Quadrant | Characteristics | Strategy | Example Items |
|----------|----------------|----------|---------------|
| **Strategic** | High supply risk + High profit impact | Partnership, dual-source, long-term agreements | Large rotating equipment, DCS systems, specialty alloys |
| **Bottleneck** | High supply risk + Low profit impact | Secure supply, inventory buffer, alternative development | Specialty gaskets, custom instrumentation, proprietary software licenses |
| **Leverage** | Low supply risk + High profit impact | Competitive bidding, volume consolidation, price negotiation | Structural steel, standard piping, electrical cable, standard motors |
| **Non-Critical** | Low supply risk + Low profit impact | Simplify, automate, reduce transaction costs | Office supplies, standard fasteners, PPE, general consumables |

### Total Landed Cost Components

| Component | Typical % of TLC | Optimization Lever |
|-----------|------------------|-------------------|
| Unit Purchase Price | 55-70% | Volume negotiation, competitive bidding, design standardization |
| International Freight | 8-15% | Consolidation, mode optimization, route selection, contract rates |
| Import Duties & Taxes | 5-12% | FTA utilization, duty drawback, temporary admission, tariff classification |
| Insurance (Marine/Cargo) | 1-3% | Blanket policy, deductible optimization, claims history improvement |
| Inland Transport | 3-8% | Consolidation, fleet optimization, backhaul utilization |
| Customs Brokerage & Port Handling | 2-4% | Broker negotiation, pre-clearance, AEO certification |
| Warehousing & Preservation | 2-5% | JIT delivery, cross-docking, vendor-managed inventory |
| Currency & Financing Costs | 1-4% | Forward contracts, natural hedging, payment term optimization |

---

## Step-by-Step Execution

### Phase 1: Data Collection & Baseline (Steps 1-3)

**Step 1: Build Procurement Portfolio Profile**
1. Import complete procurement register from project-database or SAP MM
2. Classify each PO line by Kraljic quadrant (strategic/bottleneck/leverage/non-critical)
3. Map suppliers by country of origin, manufacturing location, and shipping route
4. Calculate procurement value distribution by category, country, and currency
5. Identify total number of unique suppliers and concentration metrics (top-10 supplier share)
6. Flag items with single-source suppliers
7. Cross-reference with critical path to identify schedule-driving procurement items

**Step 2: Collect Cost and Performance Data**
1. Gather total landed cost data for all PO lines (unit price, freight, duties, insurance, handling, storage)
2. For items without complete TLC data, estimate missing components using benchmark rates
3. Retrieve delivery performance history: planned vs. actual delivery dates for each supplier
4. Calculate supplier on-time delivery percentage and average delay in days
5. Collect commodity price index data for key materials (steel, copper, aluminum, nickel)
6. Gather current freight rate benchmarks for relevant trade lanes (Asia-Chile, Europe-Chile, Americas-Chile)
7. Retrieve applicable Chilean customs duty rates and FTA preferential rates by origin country

**Step 3: Map Supply Chain Network**
1. Create supply chain network map: supplier locations -> manufacturing sites -> ports of origin -> shipping routes -> Chilean ports -> inland transport -> project site
2. Identify consolidation points where multiple suppliers ship from the same region
3. Map logistics providers and customs brokers currently engaged
4. Identify alternative logistics routes (e.g., Pacific vs. Atlantic routing for European suppliers)
5. Document current INCOTERMS used per supplier and assess optimization opportunities

### Phase 2: Risk & Cost Analysis (Steps 4-7)

**Step 4: Perform Supply Risk Assessment**
1. Single-source analysis: identify all items with only one qualified supplier; assess criticality per Kraljic
2. Geographic concentration: calculate Herfindahl-Hirschman Index (HHI) by origin country and region
3. Supplier financial health: review credit ratings, annual revenues, order book concentration
4. Lead time variability: calculate standard deviation of delivery performance per supplier
5. Force majeure assessment: evaluate geopolitical, climate, pandemic, and trade policy risks per supply corridor
6. Generate supply risk heat map (5x5 matrix: likelihood vs. impact) for all identified risks
7. Score each risk and rank by composite risk score

**Step 5: Calculate Total Landed Cost**
1. For each PO line, calculate full TLC using all cost components
2. Compare TLC ranking vs. unit price ranking -- identify items where cheapest price is not cheapest TLC
3. Analyze freight cost structure: identify consolidation savings, mode optimization (FCL vs. LCL), routing alternatives
4. Analyze duty optimization: verify correct tariff classification, check FTA eligibility, evaluate temporary admission regimes
5. Quantify currency exposure: group PO values by currency, model +/-5% and +/-10% FX impact
6. Calculate warehousing and preservation costs for items requiring extended storage
7. Produce TLC comparison tables by category and by supplier

**Step 6: Analyze Lead Time Waterfall**
1. For top-20 critical-path items, decompose lead time into phases: engineering, raw materials, manufacturing, FAT, export clearance, transit, import customs, inland delivery
2. Benchmark each phase against industry standard durations
3. Identify phases with compression potential: parallel engineering, pre-positioned materials, accelerated FAT, express customs
4. Model lead time savings from logistics mode changes (sea-to-air for critical items)
5. Calculate cost of lead time compression per item (express shipping premium, overtime charges)
6. Prioritize compression opportunities by critical path impact and cost-effectiveness

**Step 7: Evaluate Supplier Diversification Options**
1. For each single-source item, research alternative suppliers (minimum 2 alternatives)
2. Evaluate alternatives on: lead time, unit price, TLC, quality track record, capacity, geographic risk
3. Assess qualification requirements and timeline for each alternative
4. Calculate cost premium or savings from diversification
5. Develop dual-sourcing split recommendation (e.g., 70/30 or 60/40)
6. Assess local content contribution from alternative local suppliers
7. Estimate qualification cost and timeline for recommended alternatives

### Phase 3: Optimization & Recommendations (Steps 8-10)

**Step 8: Develop Cost Optimization Plan**
1. Consolidate all cost reduction opportunities: volume negotiation, freight consolidation, duty optimization, currency hedging
2. Quantify estimated savings for each opportunity (absolute value and percentage)
3. Assess implementation feasibility: quick wins vs. contract modifications vs. strategic changes
4. Calculate ROI for each optimization initiative
5. Prioritize by NPV of savings net of implementation cost

**Step 9: Develop Risk Mitigation Plan**
1. For each Critical and High risk in the heat map, develop specific mitigation strategy
2. Dual-sourcing: qualification plan, timeline, budget
3. Safety stock: recommend strategic inventory buffers for bottleneck items
4. Contract protections: penalty clauses, performance bonds, parent company guarantees
5. Logistics contingency: alternative shipping routes, pre-positioned inventory, emergency air freight protocols
6. Insurance optimization: review coverage adequacy for supply chain disruption losses

**Step 10: Compile Final Report and Implementation Plan**
1. Compile Supply Chain Optimization Report per output specification structure
2. Generate executive summary with top-5 opportunities per optimization dimension
3. Create implementation roadmap with phased actions, owners, and deadlines
4. Define KPI framework: TLC reduction %, on-time delivery improvement, single-source reduction, local content increase
5. Produce supplier diversification roadmap with qualification milestones
6. Submit report to mcp-sharepoint for project team review
7. Present findings to Orchestrator for integration into OR program reporting

---

## Quality Criteria

### Content Quality (Target: >91% SME Approval)

| Criterion | Weight | Description |
|-----------|--------|-------------|
| Technical Accuracy | 30% | TLC calculations correct; risk assessments calibrated to actual market conditions; lead time benchmarks verifiable against industry data |
| Completeness | 25% | All procurement categories analyzed; all single-source items identified; all Kraljic quadrants populated; no material gaps in risk assessment |
| Consistency | 15% | Data reconciles across sections (procurement values match between overview and TLC analysis); recommendations align with risk findings |
| Format & Presentation | 10% | Professional VSC branding; clear visualization of heat maps, waterfall charts, and Kraljic matrices; tables properly formatted |
| Actionability | 10% | Recommendations are specific and implementable; savings estimates are quantified; implementation timeline is realistic; owners are identified |
| Traceability | 10% | All data sourced from procurement register or documented benchmarks; assumptions explicitly stated; methodology references cited |

### Automated Quality Checks

- [ ] Every PO line in the procurement register has a Kraljic classification
- [ ] All single-source items are identified and flagged with alternative sourcing assessment
- [ ] TLC calculations include all 8 cost components (or documented rationale for exclusion)
- [ ] Risk heat map covers all 5 risk dimensions (single-source, geographic, financial, lead time, force majeure)
- [ ] Lead time waterfall analysis covers all top-20 critical-path items
- [ ] Cost savings estimates include implementation cost and net benefit calculation
- [ ] Currency exposure analysis covers all currencies representing >5% of procurement value
- [ ] Local content analysis present if local content requirements exist
- [ ] Supplier diversification plan includes qualification timeline and cost estimate
- [ ] All freight rate and duty rate assumptions are documented with source
- [ ] Recommendations are prioritized into quick wins, medium-term, and strategic categories
- [ ] KPI framework defined with baseline values and improvement targets

---

## MCP Integrations

| MCP Server | Purpose | Operations |
|------------|---------|------------|
| **mcp-sharepoint** | Retrieve procurement register, delivery performance data, supplier qualification records; store analysis deliverables | `GET /documents/{library}`, `POST /documents/{library}`, `SEARCH /documents` |
| **project-database** | Access procurement tracking database, supplier scorecards, delivery performance dashboards | `GET /bases/{base}/tables/{table}`, `PATCH /bases/{base}/tables/{table}/records` |
| **mcp-excel** | Generate TLC analysis workbooks, risk heat map spreadsheets, Kraljic matrix workbooks | `POST /workbooks`, `PUT /sheets/{sheet}` |

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs From)

| Agent/Skill | Input Provided | Criticality |
|-------------|---------------|-------------|
| `track-long-lead-procurement` | Procurement register with delivery dates, vendor performance data, expediting history | Critical |
| Execution Agent | Construction critical path schedule, material requirement dates, commissioning sequence | Critical |
| `manage-vendor-documentation` | Supplier qualification records, vendor performance scorecards | High |
| `map-regulatory-requirements` | Local content regulatory requirements, import/export restrictions | Medium |
| `audit-compliance-readiness` | Trade compliance requirements, sanctions screening results | Medium |

### Downstream Dependencies (Outputs To)

| Agent/Skill | Output Provided | Trigger |
|-------------|----------------|---------|
| Contracts Agent (`create-contract-scope`) | Dual-sourcing recommendations, contract protection requirements, supplier qualification plans | On completion |
| `track-long-lead-procurement` | Lead time compression strategies, alternative supplier options for at-risk items | On completion |
| Orchestrator (`orchestrate-or-program`) | Supply chain risk assessment for OR program risk register, procurement readiness status | Automatic |
| `model-opex-budget` | Optimized procurement cost forecasts, MRO supply chain cost projections | On request |
| Execution Agent | Schedule acceleration opportunities from lead time compression, logistics optimization | On completion |

### Collaboration During Execution

| Phase | Collaborating Agent/Skill | Interaction |
|-------|--------------------------|-------------|
| Data Collection | `track-long-lead-procurement` | Request current procurement register and delivery performance data |
| Risk Assessment | Execution Agent | Validate critical path dependencies and required-on-site dates |
| TLC Analysis | `audit-compliance-readiness` | Confirm duty rates, FTA eligibility, and trade compliance requirements |
| Diversification | `manage-vendor-documentation` | Retrieve vendor qualification criteria and approved vendor lists |
| Reporting | Orchestrator | Align supply chain findings with overall OR program risk assessment |

---

## Templates & References

### Document Templates
- `templates/supply_chain_optimization_report.docx` -- Main report template with VSC branding and standard sections
- `templates/total_landed_cost_workbook.xlsx` -- TLC calculation workbook with formulas for all cost components
- `templates/kraljic_matrix_template.xlsx` -- Supplier portfolio segmentation workbook with scoring methodology
- `templates/supply_risk_heatmap.xlsx` -- Risk heat map template with 5x5 matrix and automated scoring

### Reference Documents
- SCOR Model Quick Reference Guide -- Supply chain operations reference framework
- Kraljic, P. (1983) "Purchasing Must Become Supply Management" -- Original portfolio model
- INCOTERMS 2020 ICC Rules -- Trade terms definitions and cost/risk allocation
- Chilean Customs Tariff Schedule (Arancel Aduanero) -- Current duty rates and FTA preferences

---

## Examples

### Example: Total Landed Cost Comparison -- Centrifugal Pump Package

| Cost Component | Supplier A (Germany) | Supplier B (China) | Supplier C (Brazil) |
|---------------|---------------------|-------------------|-------------------|
| Unit Price (FOB) | $185,000 | $142,000 | $168,000 |
| International Freight | $8,200 (sea, Hamburg-San Antonio) | $6,800 (sea, Shanghai-San Antonio) | $4,500 (sea, Santos-San Antonio) |
| Marine Insurance | $2,775 (1.5% of value) | $2,840 (2.0% of value) | $2,520 (1.5% of value) |
| Import Duties | $0 (EU-Chile FTA) | $8,520 (6% MFN) | $0 (Mercosur-Chile FTA) |
| Customs Brokerage | $1,200 | $1,500 | $1,100 |
| Port Handling | $2,800 | $2,800 | $2,800 |
| Inland Transport (San Antonio to site) | $3,600 | $3,600 | $3,600 |
| Receiving Inspection | $1,500 | $2,500 (extended QA) | $1,800 |
| Warehousing (est. 30 days) | $1,200 | $1,200 | $1,200 |
| **Total Landed Cost** | **$206,275** | **$171,760** | **$185,520** |
| **TLC Premium vs. Lowest** | **+20.1%** | **Baseline** | **+8.0%** |
| Lead Time (weeks) | 28 | 34 | 22 |
| On-Time Delivery History | 92% | 78% | 85% |
| **Risk-Adjusted Recommendation** | Low risk, premium price | Lowest cost, highest risk | Best balance of cost, lead time, risk |

### Example: Single-Source Dependency Risk Register

| Item | Equipment Tag | Current Supplier | Country | PO Value | Alternative Available | Critical Path | Risk Score |
|------|--------------|-----------------|---------|----------|----------------------|---------------|------------|
| Main Power Transformer 230/23kV | TR-001 | Siemens Energy | Germany | $2,400,000 | ABB (Switzerland), TBEA (China) | Yes -- delays commissioning by equal days | High (18) |
| SAG Mill Gearbox | GB-101 | FLENDER (Siemens) | Germany | $890,000 | SEW-Eurodrive (partial), Elecon (India) | Yes -- 2 weeks float | High (16) |
| DCS System (Main Plant) | DCS-001 | Honeywell | USA | $3,200,000 | None (proprietary after FEED) | Yes -- zero float | Critical (22) |
| Thickener Rake Mechanism | TK-201-RM | FLSmidth | Denmark | $420,000 | Outotec/Metso (Finland) | No -- 6 weeks float | Medium (9) |
| Specialty Alloy Pipe (Hastelloy C-276) | Multiple | Haynes International | USA | $680,000 | VDM Metals (Germany), Sandvik (Sweden) | Yes -- feeds piping critical path | High (15) |
