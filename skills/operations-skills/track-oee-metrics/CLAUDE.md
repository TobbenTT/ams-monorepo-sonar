---
name: track-oee-metrics
description: "Calculate and track Overall Equipment Effectiveness (OEE = Availability x Performance x Quality) for production equipment. Triggers: 'OEE', 'equipment effectiveness', 'availability performance quality', 'production efficiency', 'six big losses', 'efectividad global del equipo', 'disponibilidad rendimiento calidad'."
---

# Track OEE Metrics

## Skill ID: D-OEE-001

## Version: 1.0.0

## Category: D - Monitoring

## Priority: P1 - Critical (foundational production effectiveness metric driving operational improvement)

---

## Purpose

Calculate, track, and analyze Overall Equipment Effectiveness (OEE) metrics for production equipment, decomposing performance into the three fundamental factors -- Availability, Performance, and Quality -- to provide a single, universally understood measure of manufacturing effectiveness. OEE is the gold standard metric for quantifying how effectively a manufacturing operation utilizes its installed equipment base during planned production time.

In industrial operations (mining, oil & gas, chemicals, energy), OEE provides the critical link between equipment reliability and business performance. A copper concentrator operating at 65% OEE versus 85% OEE on the same installed base represents a difference of millions of dollars in annual throughput -- without any capital investment. The Six Big Losses framework (equipment failure, setup/adjustment, idling/minor stops, reduced speed, process defects, reduced yield) provides a structured decomposition that identifies exactly where production time and output are being lost, enabling targeted improvement initiatives.

This skill produces comprehensive OEE performance reports including equipment-level and line/plant-level calculations, Six Big Losses waterfall analysis, trend tracking, shift-by-shift variation analysis, equipment comparison benchmarking, Pareto of losses, and prioritized improvement opportunities with estimated financial impact.

---

## Intent & Specification

The AI agent MUST understand and execute the following:

1. **OEE Formula and Factor Definitions**: OEE = Availability x Performance x Quality, where each factor is a percentage between 0% and 100%. Availability = (Run Time / Planned Production Time) x 100. Performance = (Ideal Cycle Time x Total Count / Run Time) x 100, or equivalently (Actual Output / Theoretical Maximum Output) x 100. Quality = (Good Count / Total Count) x 100. All three factors must be calculated independently before multiplication.

2. **Six Big Losses Classification**: Every minute of lost production must be categorized into exactly one of the Six Big Losses: (a) Equipment Failure / Breakdowns -- unplanned stops exceeding threshold (typically >5 min), affecting Availability; (b) Setup and Adjustment -- changeovers, material changes, startup, affecting Availability; (c) Idling and Minor Stops -- short interruptions <5 min, small jams, sensor blocks, affecting Performance; (d) Reduced Speed -- equipment running below ideal cycle time, wear-related slowdowns, affecting Performance; (e) Process Defects -- in-process rejects, rework, scrap during stable production, affecting Quality; (f) Reduced Yield -- startup rejects, off-spec product until stable conditions, affecting Quality.

3. **World-Class Benchmarks**: World-class OEE is approximately 85%, composed of Availability >=90%, Performance >=95%, Quality >=99.9%. These benchmarks originate from the JIPM/TPM framework (Nakajima, 1988). However, benchmarks must be calibrated to the specific industry: mining/mineral processing typically targets 75-82% OEE due to harsher operating conditions, while pharmaceutical may target 50-65% due to extensive changeover and cleaning requirements.

4. **Data Quality and Time Categorization**: OEE accuracy depends entirely on correct time categorization. The agent must validate that: (a) Planned Production Time excludes contractually agreed non-production time (planned shutdowns, no-demand periods); (b) Downtime events are correctly classified as planned vs. unplanned; (c) Minor stops are captured (often underreported in manual systems); (d) Ideal cycle time is validated against design specifications (not historical average); (e) Quality counts include both scrap and rework.

5. **Multi-Level Calculation**: OEE must be calculated at equipment level (individual machine), line level (bottleneck determines line OEE), and plant level (weighted by production capacity). Equipment-level OEE is the primary analytical unit. Line-level OEE must account for the bottleneck constraint -- the equipment with the lowest OEE in series determines the line throughput ceiling. Plant-level OEE uses capacity-weighted averages.

6. **Shift-by-Shift Variation Analysis**: OEE must be tracked per shift to identify operator-dependent, time-dependent, and condition-dependent variation. Significant shift-to-shift OEE variation (>5 percentage points) indicates training gaps, procedural inconsistencies, or equipment condition changes that require investigation. Statistical process control (SPC) methods should be applied to OEE trend data.

7. **Loss-to-Improvement Linkage**: Every OEE improvement target must be linked to a specific loss reduction initiative. Generic targets like "improve OEE by 5%" are not acceptable. Instead, the target must be decomposed: "Reduce equipment failure losses from 8% to 4% (SAG mill gearbox and cyclone feed pump reliability program) + reduce speed losses from 6% to 3% (liner wear monitoring program) = net OEE improvement of approximately 5.2 points."

8. **Language**: Spanish (Latin American) for all report narratives, table headers, and chart labels. English technical terms (OEE, MTBF, MTTR, Six Big Losses category names) preserved as industry standard alongside Spanish equivalents.

---

## Trigger / Invocation

```
/track-oee-metrics
```

### Natural Language Triggers
- "Calculate OEE for our production equipment"
- "Track overall equipment effectiveness across the plant"
- "Analyze the six big losses for our production line"
- "What is the OEE of our grinding circuit?"
- "Show me availability, performance, and quality breakdown"
- "Compare OEE across shifts and equipment"
- "Identify top production losses and improvement opportunities"
- "Calcular la efectividad global del equipo (OEE)"
- "Rastrear disponibilidad, rendimiento y calidad de los equipos"
- "Analizar las seis grandes perdidas de produccion"
- "Reporte de eficiencia productiva por equipo y turno"

### Aliases
- `/oee-tracking`
- `/oee-report`
- `/equipment-effectiveness`

---

## Input Requirements

### Required Inputs

| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `equipment_scope` | List of equipment/lines to analyze with TAG/ID, description, and system hierarchy | .xlsx, .csv, or structured text | Engineering / Asset Register |
| `production_data` | Run time, planned production time, total output count, good output count per equipment per period | .xlsx | Operations / DCS / MES |
| `cycle_time_reference` | Ideal (design) cycle time or nameplate capacity for each equipment item | .xlsx or text | OEM datasheets / Engineering |
| `reporting_period` | Start and end dates for OEE calculation period | Date range (text) | User |

### Optional Inputs (Highly Recommended)

| Input | Description | Default if Absent |
|-------|-------------|-------------------|
| `downtime_categories` | Classified downtime log with event type (planned/unplanned), duration, cause code | Aggregate unclassified downtime into Availability loss |
| `oee_targets` | Target OEE and sub-factor targets per equipment/line | Use industry benchmarks as reference |
| `historical_oee` | Previous OEE calculations for trend analysis | Treat current period as baseline |
| `shift_schedule` | Shift definitions (A/B/C/D), rotation pattern, handover times | Omit shift-level analysis |
| `maintenance_records` | Work orders, failure records, PM completion for correlation with Availability losses | Exclude maintenance correlation analysis |
| `quality_rejection_logs` | Detailed quality non-conformance records with cause codes and quantities | Estimate Quality factor from good/total counts only |
| `speed_loss_analysis` | Equipment speed measurements vs. design speed, derating records | Estimate Performance from output vs. theoretical maximum |
| `ideal_cycle_time_validation` | Engineering validation of ideal cycle times (OEM specification, time studies) | Use provided cycle time without validation flag |
| `product_mix_data` | Different product types/grades with their respective ideal cycle times | Assume single product/cycle time |

### Context Enrichment
- Retrieve equipment failure history from `mcp-sharepoint` (CMMS exports or maintenance databases) to correlate OEE Availability losses with specific failure modes per the VSC Failure Modes Table.
- Pull production shift reports from `mcp-sharepoint` for contextual annotations on OEE anomalies (e.g., ore hardness changes, feed quality variations).
- Access existing OEE dashboards or tracking spreadsheets from `project-database` for historical trend continuity.
- Cross-reference with `benchmark-maintenance-kpis` (MAINT-04) for SMRP Pillar 2 KPI alignment and quartile positioning of OEE values.
- Obtain equipment criticality tier from `analyze-equipment-criticality` (B-CRIT-001) to prioritize OEE analysis on high-criticality equipment.

---

## Output Specification

### Document: OEE Performance Report (.xlsx)

**Filename**: `VSC_OEE_{ProjectCode}_{EquipmentCode}_{Version}_{Date}.xlsx`

**Structure**:

| Sheet | Content |
|-------|---------|
| `Executive Summary` | Plant/line-level OEE summary, trend arrow, top 3 losses by financial impact, key improvement recommendations |
| `OEE Dashboard` | Equipment-level OEE with Availability, Performance, Quality breakdown; color-coded traffic lights; target vs. actual gauges |
| `Six Big Losses Waterfall` | Waterfall chart data showing progressive loss from 100% theoretical to actual OEE, quantified in hours and dollars for each loss category |
| `Trend Analysis` | Daily, weekly, and monthly OEE trends per equipment with rolling averages, SPC control limits, and trend direction indicators |
| `Equipment Comparison` | Side-by-side OEE comparison across equipment items/lines with ranking and gap-to-best analysis |
| `Shift Analysis` | OEE by shift/crew with statistical comparison (ANOVA), variation quantification, and best-practice identification |
| `Pareto of Losses` | Pareto chart data for each loss category, sorted by time lost and financial impact, identifying top 20% causes driving 80% of losses |
| `Improvement Opportunities` | Prioritized improvement actions linked to specific losses, estimated OEE gain per action, implementation effort, responsible agent/team |
| `Data Quality Notes` | Data completeness assessment, time categorization accuracy, cycle time validation status, confidence level per equipment |
| `Raw Data` | Underlying calculation data with all input variables, intermediate calculations, and formula references |

### Supporting Deliverable: OEE Trend Report (.docx)

**Filename**: `VSC_OEE_Report_{ProjectCode}_{Version}_{Date}.docx`

**Structure**:
1. Resumen Ejecutivo (2-3 pages) -- overall OEE performance, key findings, financial impact
2. Metodologia y Calidad de Datos (1-2 pages) -- calculation methodology, data sources, confidence
3. Analisis de OEE por Equipo (5-10 pages) -- detailed equipment-by-equipment analysis
4. Analisis de las Seis Grandes Perdidas (3-5 pages) -- loss decomposition with root cause insights
5. Analisis de Tendencias (2-3 pages) -- trend charts, SPC analysis, seasonal patterns
6. Comparacion por Turno (2-3 pages) -- shift performance analysis
7. Plan de Mejora (3-5 pages) -- prioritized improvement roadmap with targets
8. Anexos -- detailed data tables, calculation methodology, glossary

---

## Methodology & Standards

### Primary Standards

| Standard | Application |
|----------|-------------|
| JIPM/TPM OEE Framework (Nakajima, 1988) | Primary OEE definition, Six Big Losses taxonomy, world-class benchmarks |
| ISO 22400-2:2014 | Manufacturing Operations Management -- KPIs, including OEE-related metrics (Availability, Effectiveness, Quality Rate) |
| SEMI E10-0814 | Specification for Definition and Measurement of Equipment Reliability, Availability, and Maintainability (semiconductor origin, broadly adopted) |
| SEMI E79-0813 | Standard for Definition and Measurement of Equipment Productivity |
| ISO 14224:2016 | Equipment reliability and maintenance data collection -- failure classification aligned with VSC Failure Modes Table |
| SMRP Best Practice 5.2.1 | OEE metric definition and quartile benchmarks within SMRP Pillar 2 |
| EN 15341:2019 | Maintenance Key Performance Indicators -- complementary maintenance KPIs for OEE context |

### OEE Calculation Framework

#### Time Model (ISO 22400 aligned)

```
Calendar Time (24h x 365d)
 └─ Scheduled Time (Calendar - Planned Shutdowns)
     └─ Planned Production Time (Scheduled - Planned Non-Production)
         └─ Operating Time (Planned Production - Downtime Losses)
             └─ Net Operating Time (Operating - Speed Losses)
                 └─ Valuable Operating Time (Net Operating - Quality Losses)

Availability = Operating Time / Planned Production Time
Performance = Net Operating Time / Operating Time
Quality     = Valuable Operating Time / Net Operating Time
OEE         = Availability x Performance x Quality
            = Valuable Operating Time / Planned Production Time
```

#### Six Big Losses Mapping

| Loss Category | OEE Factor Affected | Typical Causes | Measurement Method |
|--------------|---------------------|----------------|-------------------|
| Equipment Failure / Breakdowns | Availability | Mechanical failure, electrical failure, instrument failure | Downtime log: unplanned stops >5 min |
| Setup & Adjustment | Availability | Changeovers, material changes, tool changes, warm-up | Downtime log: planned operational stops |
| Idling & Minor Stops | Performance | Sensor blocks, small jams, cleaning, material feed issues | Manual recording or automated PLC counter |
| Reduced Speed | Performance | Wear, operator caution, feed quality, environmental conditions | Actual vs. ideal cycle time comparison |
| Process Defects | Quality | Off-spec product, rework, scrap during stable production | Quality inspection records |
| Reduced Yield | Quality | Startup rejects, shutdown waste, trial runs | Quality records during transient periods |

### VSC Failure Modes Table -- Mandatory Standard

**MANDATORY RULE:** When analyzing OEE Availability losses due to equipment failures, the failure modes causing downtime MUST be classified using the official **VSC Failure Modes Table** (`methodology/standards/VSC_Failure_Modes_Table.xlsx`). The three-part structure (What + Mechanism + Cause) ensures consistent loss categorization across equipment, time periods, and projects.

**Example:** An OEE Availability loss event of 4.2 hours on Conveyor CV-201 must be recorded as: `Drive Motor Bearing -> Overheats/Melts due to Lack of lubrication` -- not as "mechanical failure" or "conveyor breakdown."

---

## Step-by-Step Execution

### Phase 1: Data Collection & Validation (Steps 1-3)

**Step 1: Gather production and equipment data.**
- Obtain equipment scope list with TAG/ID, description, nameplate capacity, and ideal cycle time from engineering datasheets or OEM documentation.
- Extract production data from DCS/MES/manual logs: run time, planned production time, total output, good output per equipment per shift/day.
- Collect downtime logs with event timestamps, duration, cause codes, and classification (planned/unplanned).
- Obtain quality data: total production count, good count, reject count, rework count per equipment per period.
- Retrieve shift schedule and crew rotation data if shift analysis is required.

**Step 2: Validate data quality and completeness.**
- Verify that planned production time accounts correctly for planned shutdowns, no-demand periods, and maintenance windows.
- Cross-check that downtime events sum to the difference between planned production time and actual run time (tolerance: +/- 2%).
- Validate ideal cycle time against OEM specification -- flag any equipment where the "ideal" cycle time used is actually historical average (common error that inflates Performance factor).
- Confirm quality counts: good count + reject count + rework count = total count (tolerance: +/- 0.5%).
- Assess minor stop capture completeness -- if only automated DCS data is available, minor stops <1 min may be underreported, leading to inflated Performance factor.
- Assign data confidence level per equipment: High (>95% complete, validated), Medium (80-95% complete), Low (<80% or significant estimation).

**Step 3: Establish calculation parameters.**
- Define the planned production time basis per equipment (e.g., 24h/7d minus planned maintenance windows).
- Confirm the minor stop threshold (typically 5 minutes: stops >=5 min are Availability losses, stops <5 min are Performance losses).
- Set the reporting granularity: shift, daily, weekly, monthly.
- Determine the ideal cycle time source and validation status for each equipment item.
- Confirm OEE targets: client-provided targets, or use industry benchmarks as reference.

### Phase 2: OEE Calculation & Analysis (Steps 4-7)

**Step 4: Calculate OEE factors per equipment per period.**
- For each equipment item and each reporting period:
  - Availability = (Planned Production Time - Downtime) / Planned Production Time x 100
  - Performance = (Ideal Cycle Time x Total Count) / Run Time x 100 (cap at 100%; values >100% indicate incorrect ideal cycle time)
  - Quality = Good Count / Total Count x 100
  - OEE = Availability x Performance x Quality / 10,000 (since each factor is a percentage)
- Calculate line-level OEE using bottleneck method: Line OEE = minimum(equipment OEE values in series) for series configurations, or capacity-weighted average for parallel configurations.
- Calculate plant-level OEE as capacity-weighted average across all lines/areas.

**Step 5: Decompose losses into Six Big Losses.**
- Classify each downtime event into the appropriate loss category using the downtime log cause codes.
- Quantify each loss in hours, percentage of planned production time, and equivalent production units lost.
- Calculate financial impact of each loss using unit economics: hours lost x production rate x product value.
- Generate the waterfall chart: start at 100% (planned production time), subtract each loss sequentially to arrive at actual OEE.

**Step 6: Perform trend and variation analysis.**
- Calculate daily, weekly, and monthly OEE trends with 7-day and 30-day rolling averages.
- Apply SPC control chart methodology: calculate mean OEE, upper control limit (UCL), lower control limit (LCL) using +/- 3 sigma.
- Identify special cause variation: any OEE data point outside control limits, runs of 7+ consecutive points above/below mean, or trends of 6+ consecutive increasing/decreasing points.
- Perform shift-by-shift analysis: calculate mean OEE per shift/crew, perform ANOVA or Kruskal-Wallis test for statistically significant differences.
- Correlate OEE patterns with external factors: ore hardness, ambient temperature, maintenance activities, personnel changes.

**Step 7: Benchmark and compare equipment.**
- Rank equipment by OEE (lowest to highest) to identify underperformers.
- Compare each equipment's OEE factors against: (a) world-class benchmark, (b) plant average, (c) best-performing similar equipment.
- Identify the "gap to best" for each equipment: if the lowest-OEE grinding mill achieves 68% and the best achieves 79%, the gap is 11 points, representing specific transferable best practices.
- Calculate the "OEE potential": if all equipment achieved the best-in-class OEE within the same plant, what would be the total production gain?

### Phase 3: Improvement Identification & Prioritization (Steps 8-9)

**Step 8: Identify and prioritize improvement opportunities.**
- Generate Pareto chart of losses: rank all loss events by time lost and financial impact.
- Identify the top 20% of loss causes responsible for 80% of total OEE loss (Pareto principle).
- For each major loss source, define a specific improvement initiative:
  - Equipment failure losses -> reliability improvement program (RCM, defect elimination)
  - Setup/adjustment losses -> SMED (Single-Minute Exchange of Die) or changeover optimization
  - Minor stop losses -> autonomous maintenance, operator training, sensor improvement
  - Speed losses -> condition monitoring, wear management, process optimization
  - Defect losses -> quality at source, SPC, process parameter optimization
  - Yield losses -> startup procedure optimization, predictive quality
- Create prioritization matrix: OEE improvement potential (y-axis) vs. implementation effort/cost (x-axis).
- Estimate the specific OEE gain from each initiative.

**Step 9: Set targets and build improvement roadmap.**
- Set phased OEE targets per equipment:
  - 3-month target: address quick wins (top Pareto items, procedural changes)
  - 6-month target: reliability and maintenance improvements take effect
  - 12-month target: sustained improvement trajectory toward industry benchmark
- Link each target increment to a specific loss reduction:
  - Example: "OEE from 72% to 78% in 6 months = reduce failure downtime from 8% to 5% (gearbox reliability) + reduce speed loss from 6% to 4% (liner management) + reduce startup rejects from 3% to 1.5% (startup SOP revision)."
- Define KPIs for tracking improvement: loss-specific metrics, not just aggregate OEE.

### Phase 4: Report Generation (Steps 10-12)

**Step 10: Build OEE dashboard workbook via project-database / mcp-excel.**
- Create the Executive Summary sheet with plant-level OEE, trend arrow, and financial headline.
- Populate the OEE Dashboard with equipment-level data, conditional formatting (green >=85%, yellow 70-84%, red <70%).
- Generate Six Big Losses waterfall data with cumulative loss calculation.
- Build trend analysis charts with SPC control limits.
- Create equipment comparison ranking table.
- Populate shift analysis with statistical test results.
- Generate Pareto chart data sorted by loss impact.
- Document improvement opportunities with estimated gains, effort, and ownership.

**Step 11: Generate OEE performance report (.docx).**
- Write executive summary in Spanish with key findings and financial impact headline.
- Document methodology, data quality assessment, and confidence levels.
- Present equipment-by-equipment OEE analysis with Six Big Losses decomposition.
- Include trend charts, shift analysis, and benchmarking comparisons.
- Detail the improvement roadmap with phased targets and linked initiatives.

**Step 12: Quality assurance and cross-agent handoff.**
- Verify all OEE calculations are arithmetically correct (Availability x Performance x Quality = OEE).
- Confirm no Performance factor exceeds 100% (indicates ideal cycle time error).
- Validate that Six Big Losses sum equals total planned production time minus valuable operating time.
- Package outputs for downstream consumption by Execution Agent (project performance) and Orchestrator (dashboards).

---

## Quality Criteria

### Content Quality (Target: >91% SME Approval)

| Criterion | Weight | Target |
|-----------|--------|--------|
| OEE calculation accuracy | 25% | 100% of OEE factors calculated per JIPM/ISO 22400 standard formulas; no Performance >100% |
| Six Big Losses completeness | 20% | All downtime and loss events classified into exactly one of six categories; waterfall balances to within 0.5% |
| Data quality transparency | 15% | Confidence level documented per equipment; ideal cycle time validation status stated; known data gaps flagged |
| Trend and statistical rigor | 15% | SPC control limits correctly calculated; shift analysis includes statistical significance test; trends use rolling averages |
| Actionable improvement plan | 15% | Each major loss has a specific improvement initiative; OEE gain estimated per initiative; improvement targets decomposed by loss type |
| Benchmarking relevance | 10% | Industry-appropriate benchmarks used; equipment comparison includes gap-to-best analysis |

### Automated Quality Checks

- [ ] OEE = Availability x Performance x Quality for every equipment and every period (arithmetic verification)
- [ ] No Performance factor exceeds 100% (ideal cycle time validation)
- [ ] Planned Production Time correctly excludes planned shutdowns and no-demand periods
- [ ] Downtime hours + Run Time = Planned Production Time (within +/- 2% tolerance)
- [ ] Good Count + Reject Count = Total Count (within +/- 0.5% tolerance)
- [ ] Six Big Losses waterfall sums to total OEE loss (100% - actual OEE)
- [ ] Shift analysis includes minimum 20 data points per shift for statistical validity
- [ ] Financial impact calculations use documented unit economics assumptions
- [ ] Improvement targets are decomposed by specific loss category, not just aggregate OEE
- [ ] All equipment failure modes causing Availability losses are classified per VSC Failure Modes Table
- [ ] Report language is Spanish with English technical terms preserved as standard
- [ ] Equipment criticality tier referenced for prioritization alignment

---

## MCP Integrations

| MCP Server | Purpose | Operations |
|------------|---------|------------|
| **mcp-sharepoint** | Retrieve production reports, downtime logs, quality records, OEM datasheets; store OEE reports | `GET /files`, `POST /files`, `GET /lists` |
| **project-database** | Store and track OEE records per equipment per period; manage improvement action tracker | `GET /records`, `POST /records`, `PATCH /records` |
| **mcp-excel** | Generate OEE dashboard workbook with calculations, charts, and conditional formatting | `POST /workbooks`, `PUT /sheets`, `POST /charts` |

---

## Inter-Agent Dependencies

### Upstream Dependencies

| Agent/Skill | Input Provided | Criticality |
|-------------|---------------|-------------|
| Asset Management: `analyze-equipment-criticality` (B-CRIT-001) | Equipment criticality tier (AA/A/B/C) for OEE analysis prioritization | High |
| Asset Management: `analyze-failure-patterns` (MAINT-03) | Failure mode data, MTBF, MTTR for correlating with Availability losses | High |
| Asset Management: maintenance records via CMMS | Work orders, PM compliance, downtime event details | High |
| Operations: production data (self) | DCS/MES production records, shift reports, quality data | Critical |
| Operations: `calculate-operational-kpis` | Complementary operational KPIs for context | Medium |

### Downstream Dependencies

| Agent/Skill | Output Provided | Trigger |
|-------------|----------------|---------|
| Execution Agent: project performance tracking | OEE as key operational KPI for project reporting | Automatic |
| Orchestrator: dashboard and governance | Plant/line OEE summary for executive dashboards | Automatic |
| Operations: `create-operations-manual` | OEE tracking procedures for inclusion in operating manual | On request |
| Asset Management: `benchmark-maintenance-kpis` (MAINT-04) | OEE data for SMRP Pillar 2 benchmarking | On request |
| Asset Management: `optimize-pm-program` (MAINT-02) | OEE Availability loss data to identify PM optimization targets | On request |

### Collaboration

| Agent/Skill | Collaboration Type | Description |
|-------------|-------------------|-------------|
| HSE Agent | Safety context | Equipment failure events classified in OEE may have safety implications; HSE reviews high-consequence failure losses |
| Operations: `plan-training-program` | Training needs | Shift-to-shift OEE variation >5% triggers operator training needs analysis |
| Operations: `resolve-cross-functional-conflicts` | Conflict resolution | When OEE improvement targets create tension between production and maintenance priorities |

---

## Templates & References

### Templates
- `VSC_OEE_Dashboard_Template_v2.0.xlsx` -- Standard OEE workbook template with pre-formatted sheets, formulas, and chart templates
- `VSC_OEE_Report_Template_v1.0.docx` -- OEE trend report template with section placeholders and VSC formatting
- `VSC_Six_Big_Losses_Waterfall_Template_v1.0.xlsx` -- Waterfall chart template for loss decomposition
- `VSC_OEE_Data_Collection_Form_v1.0.xlsx` -- Manual data collection form for sites without DCS/MES integration

### Reference Documents
- Nakajima, S. (1988). "Introduction to TPM: Total Productive Maintenance" -- Original OEE framework and Six Big Losses taxonomy
- Hansen, R.C. (2001). "Overall Equipment Effectiveness" -- Comprehensive OEE implementation guide
- ISO 22400-2:2014 -- Key Performance Indicators for Manufacturing Operations Management
- SEMI E10-0814 -- Equipment Reliability, Availability, and Maintainability definitions
- SMRP Best Practice 5th Edition -- Pillar 2: Manufacturing Process Reliability (OEE quartile benchmarks)
- VSC Internal: "Guia de Indicadores de Produccion y Efectividad Operacional v2.0"
- VSC Internal: "Metodologia de Analisis de las Seis Grandes Perdidas v1.0"

---

## Examples

### Example 1: Mining Concentrator -- SAG Mill OEE Calculation

**Input data (monthly):**

| Parameter | Value |
|-----------|-------|
| Calendar Time | 720 hours (30 days) |
| Planned Shutdowns (major maintenance) | 48 hours |
| Planned Production Time | 672 hours |
| Unplanned Downtime (breakdowns) | 38 hours |
| Setup/Adjustment (liner changes, ball charge) | 16 hours |
| Run Time | 618 hours |
| Ideal Throughput Rate | 2,200 TPH |
| Actual Throughput | 1,254,000 tonnes |
| Good Product (meeting grade spec) | 1,228,920 tonnes |
| Rejected/Reprocessed | 25,080 tonnes |

**OEE Calculation:**

| Factor | Calculation | Result |
|--------|------------|--------|
| Availability | 618 / 672 | 91.96% |
| Performance | 1,254,000 / (2,200 x 618) | 92.23% |
| Quality | 1,228,920 / 1,254,000 | 98.00% |
| **OEE** | **91.96% x 92.23% x 98.00%** | **83.08%** |

**Six Big Losses Waterfall:**

| Loss Category | Hours Lost | % of Planned Time | Equivalent Tonnes | Financial Impact (USD) |
|--------------|-----------|-------------------|-------------------|----------------------|
| Equipment Failures | 38.0 | 5.65% | 83,600 | $1,672,000 |
| Setup & Adjustment | 16.0 | 2.38% | 35,200 | $704,000 |
| Idling & Minor Stops | 18.2 | 2.71% | 40,040 | $800,800 |
| Reduced Speed | 29.6 | 4.40% | 65,120 | $1,302,400 |
| Process Defects | 11.4 | 1.70% | 25,080 | $501,600 |
| Reduced Yield | 0.7 | 0.10% | 1,540 | $30,800 |
| **Total Losses** | **113.9** | **16.92%** | **250,580** | **$5,011,600** |
| **Valuable Operating Time** | **558.1** | **83.08%** | **1,228,920** | -- |

**Top Improvement Opportunities:**
1. Reduce equipment failure downtime by 50% (gearbox + feed pump reliability) -> OEE gain: +2.8 pts -> $836K/yr
2. Reduce speed losses by 40% (liner wear monitoring + feed optimization) -> OEE gain: +1.8 pts -> $521K/yr
3. Reduce setup time by 25% (SMED approach to liner changes) -> OEE gain: +0.6 pts -> $176K/yr

### Example 2: Shift-by-Shift OEE Comparison (Ball Mill Circuit)

| Shift | Availability | Performance | Quality | OEE | Observations |
|-------|-------------|-------------|---------|-----|-------------|
| A (06:00-14:00) | 93.2% | 91.8% | 98.5% | 84.3% | Best performance; experienced crew |
| B (14:00-22:00) | 90.1% | 89.4% | 97.8% | 78.7% | Highest minor stops; feed variation |
| C (22:00-06:00) | 88.6% | 87.2% | 97.2% | 75.1% | Highest failure downtime; delayed response |
| **Plant Average** | **90.6%** | **89.5%** | **97.8%** | **79.3%** | Shift C gap = 9.2 pts vs Shift A |

**Statistical Analysis:** ANOVA p-value = 0.003 (significant difference). Shift C Availability is 4.6 points below Shift A, driven by 2.3x longer mean response time to equipment alarms. Recommended action: (1) Alarm response procedure training for Shift C, (2) Standby maintenance technician on night shift, (3) Transfer 2 experienced operators from Shift A rotation.
