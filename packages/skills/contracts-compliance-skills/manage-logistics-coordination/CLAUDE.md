---
name: manage-logistics-coordination
description: "Coordinate international shipping, freight forwarding, port logistics, and transport delivery tracking for OR projects. Triggers: 'logistics coordination', 'freight forwarding', 'coordinacion logistica'."
---

# Manage Logistics Coordination

## Skill ID: manage-logistics-coordination
## Version: 1.0.0
## Category: C - Tracking
## Priority: Medium

---

## Purpose

Coordinate end-to-end logistics operations for Operational Readiness projects, encompassing international shipping, freight forwarding, port logistics, overland transport, and last-mile delivery tracking. This skill provides a single pane of glass for all material movements from supplier ex-works through final site receipt, ensuring that equipment, spare parts, consumables, and construction materials arrive on-site in the correct sequence, on time, and in acceptable condition.

Logistics coordination is a critical enabler of capital project delivery. In asset-intensive industries -- mining, oil and gas, chemicals, energy -- the physical movement of materials from global suppliers to remote project sites involves complex multi-modal transport chains crossing international borders, passing through congested ports, traversing challenging terrain, and requiring specialized handling for oversized, heavy, or hazardous cargo. Each handoff point introduces risk: delays, damage, documentation errors, customs holds, and mis-routing.

Industry data quantifies the impact of logistics failures on project outcomes. The Construction Industry Institute (CII) reports that materials management issues account for 12-18% of total project cost overruns, with logistics-related delays contributing to 20-30% of schedule slippage on international capital projects. For projects in Latin America specifically, port congestion in key hubs (San Antonio, Valparaiso, Callao, Mejillones) and inland transport constraints to mine sites or remote industrial locations add 2-4 weeks of variability to delivery schedules if not proactively managed.

For Operational Readiness, logistics failures cascade through the commissioning timeline. A single critical equipment piece delayed at customs or damaged in transit can delay system commissioning by weeks or months, with knock-on impacts to ramp-up schedules and first production dates. The OR program depends on this skill to provide reliable, real-time visibility into material movements so that commissioning sequences can be planned with confidence and adjusted proactively when logistics disruptions occur.

This skill integrates with track-long-lead-procurement for procurement-side logistics milestones, manage-customs-clearance for import documentation and duty processing, track-material-receipts for site receiving operations, and the OR Orchestrator for program-level logistics readiness reporting.

---

## Intent & Specification

The AI agent MUST understand and execute the following core objectives:

1. **Shipment Planning & Consolidation**: Plan shipments strategically to optimize cost and schedule. Consolidate multiple purchase orders into single shipments where feasible, select appropriate transport modes (sea, air, road, rail, multimodal), and coordinate shipping windows with supplier readiness and project schedule requirements.

2. **Freight Forwarder Management**: Manage relationships with freight forwarding partners, issue shipping instructions, monitor performance against agreed service levels, and escalate when forwarders fail to meet commitments. Maintain a qualified forwarder register for each trade lane.

3. **Multi-Modal Transport Tracking**: Track shipments across all transport modes from origin to destination. Maintain real-time visibility into vessel schedules, container movements, air cargo tracking, and overland transport progress. Detect delays at each handoff point and trigger contingency actions.

4. **Port Operations Coordination**: Coordinate port-side operations at both origin and destination ports: container loading/unloading, breakbulk handling, roll-on/roll-off operations, port storage, and terminal handling. Manage port congestion impacts and alternative port routing.

5. **Oversized & Heavy Cargo Management**: Plan and coordinate transport of oversized, overweight, and project cargo requiring special handling: route surveys, transport permits, police escorts, crane availability, temporary road reinforcement, and bridge load assessments.

6. **Hazardous Materials Compliance**: Ensure all hazardous material shipments comply with IMDG Code (sea), IATA DGR (air), and ADR/local regulations (road). Verify proper classification, packaging, labeling, documentation, and carrier certification.

7. **Damage Prevention & Claims Management**: Implement preservation-in-transit requirements, monitor handling compliance, document condition at each handoff, and manage insurance claims for damaged cargo. Coordinate with manage-equipment-preservation for site storage requirements.

8. **Logistics Cost Control**: Track all logistics costs against budget: freight charges, port handling, customs brokerage fees, inland transport, special handling premiums, storage charges, and demurrage/detention. Identify cost optimization opportunities.

9. **Delivery Sequencing**: Align material deliveries with project construction and commissioning sequences to avoid site congestion, minimize double-handling, and ensure materials arrive when needed -- not too early (storage costs, damage risk) and not too late (schedule impact).

---

## Trigger / Invocation

```
/manage-logistics-coordination
```

**Aliases**: `/logistics-tracker`, `/freight-coordination`, `/transport-tracking`, `/coordinacion-logistica`

**Primary Trigger Commands:**
- `manage-logistics-coordination status --project [name]`
- `manage-logistics-coordination plan-shipment --po [PO-number]`
- `manage-logistics-coordination track --shipment [ID]`
- `manage-logistics-coordination port-status --port [name]`
- `manage-logistics-coordination heavy-cargo --item [description]`
- `manage-logistics-coordination cost-report --project [name]`
- `manage-logistics-coordination dashboard --project [name]`
- `manage-logistics-coordination delivery-schedule --project [name] --period [next30|next60|next90]`

**Automatic Triggers:**
- Daily: Scan all in-transit shipments for tracking updates and variance detection
- When vessel schedule changes: Recalculate ETAs and notify downstream stakeholders
- When shipment departs origin: Initiate destination-side coordination
- T-14/T-7/T-3 days before port arrival: Pre-arrival coordination check
- When cargo arrives at port: Initiate port clearance and inland transport coordination
- Weekly: Generate logistics status report
- Monthly: Comprehensive logistics performance and cost report

**Event-Driven Triggers:**
- Freight forwarder notifies delay or route change
- Port authority announces congestion or restrictions
- Vessel operator reschedules departure or changes routing
- Weather or natural disaster affects transport route
- Equipment damage reported during transit
- Customs broker requires additional documentation
- Site logistics team reports access constraints

---

## Input Requirements

### Required Inputs

| Input | Source | Required | Description |
|-------|--------|----------|-------------|
| Shipment Register | mcp-erp / freight forwarder | Yes | All active shipments with origin, destination, mode, carrier, tracking numbers |
| Purchase Order Register | mcp-erp (SAP MM) | Yes | PO details linking procurement items to shipment requirements |
| Project Master Schedule | mcp-project-online | Yes | Required-on-site dates for delivery sequencing |
| Freight Forwarder Contacts | mcp-sharepoint | Yes | Forwarder representatives, service agreements, trade lane assignments |
| Site Logistics Plan | Construction/logistics team | Yes | Site access constraints, laydown areas, crane availability, receiving hours |

### Recommended Inputs

| Input | Source | Description |
|-------|--------|-------------|
| Vessel Schedules | Shipping lines / MarineTraffic | Sailing schedules and real-time vessel tracking data |
| Port Congestion Reports | Port authorities / agents | Current waiting times, berth availability, terminal capacity |
| Weather Forecasts | Meteorological services | Weather conditions affecting sea and road transport routes |
| Transport Permits | Local transport authorities | Oversized cargo permits, route restrictions, escort requirements |
| Insurance Certificates | Broker / underwriter | Cargo insurance coverage details and claim procedures |

### Optional Inputs

| Input | Source | Description | Default if Absent |
|-------|--------|-------------|-------------------|
| Historical Shipping Data | Previous projects | Transit times and reliability data by trade lane | Industry averages applied |
| Fuel Surcharge Index | Carrier / market data | Current fuel surcharge rates for cost forecasting | Latest published rates |
| Currency Exchange Rates | Financial data | For multi-currency freight cost tracking | Static rates at booking |
| Carrier Performance Data | Logistics database | Historical on-time and damage performance by carrier | New carrier assumed |
| Port Tariff Schedules | Port authorities | Handling charges, storage rates, demurrage fees | Standard published tariffs |

---

## Output Specification

### Primary Output: Logistics Coordination Tracker (.xlsx)

**Filename:** `{ProjectCode}_Logistics_Tracker_v{version}_{date}.xlsx`

**Workbook Structure:**

#### Sheet 1: "Dashboard Summary"
- Total active shipments: count, volume (TEU/CBM), weight (MT)
- Status distribution: In-Transit / At Port / Customs / Inland Transport / Delivered
- Shipments at risk of missing required-on-site date: count and impact
- Key actions required (top 5 urgent items)
- Next 30-day delivery forecast
- Logistics cost summary: budget vs. actual vs. forecast

#### Sheet 2: "Shipment Register"
| Shipment ID | PO # | Item Description | Origin Country | Destination | Mode | Carrier | ETD Origin | ETA Destination | Required On-Site | Variance (days) | Status | Risk Level |
|-------------|------|-----------------|---------------|-------------|------|---------|-----------|----------------|-----------------|----------------|--------|-----------|

#### Sheet 3: "Transport Mode Detail"
| Shipment ID | Leg | Mode | Carrier | Origin | Destination | Planned Depart | Actual Depart | Planned Arrive | Actual Arrive | Status | Tracking # |
|-------------|-----|------|---------|--------|-------------|---------------|--------------|---------------|--------------|--------|-----------|

#### Sheet 4: "Port Operations Log"
| Shipment ID | Port | Arrival Date | Berth Date | Discharge Date | Customs Submit | Customs Clear | Gate Out | Dwell Time (days) | Issues |
|-------------|------|-------------|-----------|---------------|---------------|--------------|---------|------------------|--------|

#### Sheet 5: "Heavy & Oversized Cargo"
| Shipment ID | Item | Dimensions (LxWxH) | Weight (MT) | Transport Mode | Route Survey | Permits | Escort Required | Special Equipment | Status |
|-------------|------|-------------------|------------|---------------|-------------|---------|----------------|------------------|--------|

#### Sheet 6: "Damage & Claims Log"
| Shipment ID | Item | Damage Date | Location | Description | Photos | Carrier Notified | Claim Filed | Claim Value | Claim Status | Resolution |
|-------------|------|------------|----------|-------------|--------|-----------------|------------|-------------|-------------|-----------|

#### Sheet 7: "Logistics Cost Tracker"
| Shipment ID | Freight Cost | Port Handling | Customs Brokerage | Inland Transport | Special Handling | Storage/Demurrage | Insurance | Total Cost | Budget | Variance |
|-------------|-------------|--------------|------------------|-----------------|-----------------|------------------|-----------|-----------|--------|---------|

#### Sheet 8: "Forwarder Performance Scorecard"
| Forwarder | Active Shipments | On-Time % | Damage Rate | Documentation Accuracy | Communication Rating | Cost Competitiveness | Overall Score |
|-----------|-----------------|----------|------------|----------------------|---------------------|---------------------|-------------|

### Secondary Output: Weekly Logistics Report (.docx)
**Filename:** `{ProjectCode}_Logistics_Weekly_{week}_{date}.docx`

Narrative report (3-5 pages):
1. Executive summary: shipments in transit, deliveries completed, items at risk
2. Critical shipments requiring management attention
3. Port and customs status update
4. Heavy cargo and special transport coordination status
5. Look-ahead: expected arrivals in next 30 days
6. Logistics cost update: budget vs. actual

### Formatting Standards
- Status colors: Green (#00B050) On Track, Yellow (#FFD700) Watch, Orange (#FF8C00) Delayed, Red (#FF0000) Critical
- In-transit items: Blue (#0070C0) highlight
- Delivered items: Grey (#808080) text
- Oversized cargo: Bold text with special icon marker
- All dates in YYYY-MM-DD format
- Weights in metric tons (MT), dimensions in meters, volumes in CBM

---

## Procedure

### Phase 1: Logistics Planning & Setup (Steps 1-4)

**Step 1: Build Shipment Register**
1. Query mcp-erp for all purchase orders requiring international or domestic transport
2. Map each PO to shipment requirements: origin, destination, dimensions, weight, handling requirements
3. Identify consolidation opportunities: multiple POs from same origin to same destination
4. Classify shipments by complexity: standard container, breakbulk, heavy/oversized, hazardous, temperature-controlled
5. Determine required-on-site dates from project schedule
6. Calculate shipping windows: work backwards from required-on-site date through customs clearance, port handling, transit time, and loading

**Step 2: Select Transport Modes & Routes**
1. For each shipment, evaluate transport mode options:
   - Sea freight (FCL/LCL): cost-effective for heavy/bulk items, 25-45 day transit
   - Air freight: urgent items, high-value/low-volume, 3-7 day transit at 5-10x sea freight cost
   - Road transport: regional/domestic, door-to-door, flexible scheduling
   - Rail: heavy bulk materials where rail infrastructure exists
   - Multimodal: combining modes for optimal cost/schedule balance
2. Select optimal route considering: transit time, cost, reliability, port congestion, seasonal factors
3. For heavy/oversized cargo: conduct route survey, obtain permits, plan escorts and special equipment
4. Document transport plan for each shipment

**Step 3: Engage Freight Forwarders & Carriers**
1. Issue shipping instructions to assigned freight forwarders
2. Obtain freight quotations and confirm bookings
3. Verify carrier credentials: insurance, certifications, equipment availability
4. Establish tracking protocols: how and when carrier provides updates
5. Confirm packing and preservation requirements with suppliers
6. Set up automated tracking feeds where available (API integrations, carrier portals)

**Step 4: Coordinate with Stakeholders**
1. Align delivery schedule with site construction/commissioning sequence
2. Confirm site readiness for each delivery: laydown area, crane availability, inspection resources
3. Coordinate with customs broker for pre-clearance documentation preparation
4. Brief site logistics team on upcoming deliveries, especially heavy/oversized cargo
5. Establish communication protocol for delay notifications and schedule changes

### Phase 2: Active Tracking & Coordination (Steps 5-8)

**Step 5: Monitor Shipments In Transit**
1. Track all active shipments daily through carrier systems, vessel tracking, and forwarder updates
2. For sea freight: monitor vessel position via AIS tracking, check for delays at intermediate ports
3. For air freight: confirm flight departure and arrival, check for cargo offloading at hub airports
4. For road transport: monitor vehicle position via GPS tracking, check for route delays
5. Compare actual progress against planned milestones
6. Generate alerts when delays detected:
   - Watch: 1-3 day delay, unlikely to affect required-on-site date
   - Alert: 3-7 day delay, may affect required-on-site date if no buffer
   - Critical: >7 day delay or confirmed impact on commissioning schedule

**Step 6: Manage Port Operations**
1. Pre-arrival coordination (T-14 days before vessel ETA):
   - Confirm berth availability and discharge schedule with port agent
   - Verify all port documentation is complete
   - Arrange inland transport for post-discharge collection
   - Brief customs broker for clearance preparation
2. Arrival and discharge monitoring:
   - Confirm vessel arrival and berthing
   - Monitor discharge progress
   - Verify cargo condition at discharge (damage inspection)
   - Track container/cargo movement through port terminal
3. Port dwell time management:
   - Minimize port storage by aligning customs clearance with discharge
   - Monitor free time limits to avoid demurrage/detention charges
   - Escalate when port dwell exceeds 5 working days

**Step 7: Coordinate Inland Transport**
1. Schedule collection from port/airport/warehouse
2. For standard cargo: confirm truck availability, loading time, and transit schedule
3. For heavy/oversized cargo:
   - Confirm route permit validity and escort arrangements
   - Verify special equipment availability (multi-axle trailers, cranes for loading/unloading)
   - Coordinate with local authorities for road closures or traffic management
   - Monitor weather conditions for route viability
4. Track vehicle progress and estimated time of arrival at site
5. Coordinate with site receiving team for unloading and inspection readiness

**Step 8: Manage Disruptions & Contingencies**
1. When disruption detected (port strike, vessel breakdown, weather delay, accident):
   - Assess impact: which shipments affected, by how much
   - Identify alternatives: re-routing, mode change (sea to air), alternative port, alternative carrier
   - Calculate cost and time impact of each alternative
   - Present options to project team for decision
   - Execute approved contingency and update tracking
2. For cargo damage:
   - Document damage immediately with photographs and written description
   - Notify carrier and insurance within 24 hours
   - Assess whether item can be used as-is, repaired, or must be replaced
   - Initiate replacement procurement if needed (coordinate with track-long-lead-procurement)
   - File insurance claim with supporting documentation

### Phase 3: Reporting & Optimization (Steps 9-12)

**Step 9: Generate Weekly Logistics Report**
1. Compile status across all tracked shipments
2. Highlight changes since last report: new shipments, deliveries completed, delays, damage
3. Upcoming arrivals: next 30-day delivery schedule
4. Critical items requiring management attention
5. Cost update: logistics spend vs. budget
6. Distribute via mcp-outlook to project team and stakeholders

**Step 10: Track Logistics Costs**
1. Record all logistics costs by shipment and cost category
2. Compare actual costs against budget allocations
3. Identify cost drivers: demurrage, air freight premiums, special handling, re-routing
4. Calculate total logistics cost forecast at completion
5. Report variances to agent-finance for project cost update
6. Recommend cost optimization actions: consolidation, mode shifts, forwarder renegotiation

**Step 11: Evaluate Forwarder Performance**
1. Track forwarder KPIs: on-time pickup, transit time accuracy, documentation quality, damage rate
2. Score forwarders quarterly against service level agreements
3. Address underperformance with corrective action plans
4. Recommend forwarder changes when performance consistently below threshold
5. Share performance data with procurement for future tender evaluations

**Step 12: Capture Lessons Learned**
1. For each completed shipment, record:
   - Actual vs. planned transit time by leg
   - Cost actuals vs. estimates
   - Issues encountered and how resolved
   - Carrier/forwarder performance
2. Update trade lane reference data with actual performance
3. Feed lessons into future project logistics planning
4. Contribute to organizational logistics knowledge base

---

## Quality Criteria

| Criterion | Metric | Target | Minimum Acceptable |
|-----------|--------|--------|-------------------|
| Tracking Coverage | All shipments actively tracked | 100% | 100% |
| Update Frequency | Tracking status updated within 24 hours of change | >95% | >90% |
| ETA Accuracy | Delivery forecast within 3 days of actual | >85% | >75% |
| On-Time Delivery | Materials delivered by required-on-site date | >90% | >85% |
| Damage Rate | Shipments arriving without damage | >97% | >95% |
| Port Dwell Time | Average port dwell <5 working days | <5 days | <7 days |
| Cost Accuracy | Logistics costs within 10% of budget | >90% items | >80% items |
| Report Timeliness | Weekly reports distributed on schedule | 100% | >95% |
| Claim Resolution | Damage claims resolved within 60 days | >80% | >70% |
| Stakeholder Communication | Delay notifications within 4 hours of detection | >95% | >90% |

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents)

| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| `track-long-lead-procurement` | Shipment requirements | PO details, supplier locations, delivery deadlines for long-lead items |
| `manage-customs-clearance` | Customs status | Import clearance status affecting inland transport scheduling |
| `agent-procurement` | PO data | Purchase order details for new shipments requiring logistics coordination |
| `model-commissioning-sequence` | Delivery priorities | Commissioning sequence determines delivery priority for competing shipments |
| `manage-equipment-preservation` | Handling requirements | Preservation and handling specifications for sensitive equipment in transit |

### Downstream Dependencies (Outputs TO other agents)

| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| `track-material-receipts` | Delivery notifications | Advance notice of incoming shipments for receiving inspection preparation |
| `track-long-lead-procurement` | Logistics milestones | Shipping and transport milestone updates for procurement tracking |
| `orchestrate-or-program` | Logistics readiness | Transport status data for OR program monitoring and gate reviews |
| `agent-finance` | Cost data | Logistics cost actuals and forecasts for project budget tracking |
| `manage-customs-clearance` | Shipping documents | Bill of lading, packing lists, and certificates for customs processing |

---

## References

### Standards & Regulations
- **INCOTERMS 2020** -- International trade terms governing logistics responsibilities
- **IMDG Code** -- International Maritime Dangerous Goods Code for hazardous sea freight
- **IATA DGR** -- Dangerous Goods Regulations for air transport
- **ISO 668 / ISO 1496** -- Container standards for intermodal freight transport
- **Chilean Road Transport Regulations** -- Oversized cargo permits, weight limits, escort requirements

### Industry Resources
- Construction Industry Institute (CII) -- Materials management best practices
- Project Management Institute (PMI) -- Supply chain management for projects
- International Federation of Freight Forwarders Associations (FIATA) -- Standard shipping documents
- VSC Corporate Pain Points Research Report -- D-04, OG-01, M-02

### Templates
- `templates/logistics_tracker_template.xlsx` -- Master logistics coordination workbook
- `templates/shipping_instruction_template.docx` -- Standard shipping instruction to forwarder
- `templates/heavy_cargo_transport_plan.docx` -- Special transport planning template
- `templates/cargo_damage_report.docx` -- Standardized damage documentation form
- `templates/weekly_logistics_report.docx` -- Weekly status report template

---

## Changelog

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0.0 | 2025-02-25 | VSC AI Architect | Initial skill definition for Wave 1 deployment |
