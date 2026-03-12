---
name: track-warehouse-inventory
description: "Track warehouse inventory levels, min/max thresholds, reorder points, stock rotation, and cycle counting for OR projects. Triggers: 'warehouse inventory', 'stock levels', 'inventario de bodega'."
---

# Track Warehouse Inventory

## Skill ID: track-warehouse-inventory
## Version: 1.0.0
## Category: C - Tracking
## Priority: Medium

---

## Purpose

Track and manage warehouse inventory levels for Operational Readiness projects, monitoring stock positions against min/max thresholds, triggering reorder actions at defined reorder points, managing stock rotation policies, and executing systematic cycle counting programs. This skill ensures that all materials required for commissioning, initial operations, and ongoing maintenance are available in the correct quantities, at the right locations, and in serviceable condition.

Warehouse inventory management is the physical backbone of operational readiness. While procurement secures materials and logistics delivers them, the warehouse function receives, stores, preserves, issues, and accounts for every physical item that the operation requires. In asset-intensive industries -- mining, oil and gas, chemicals, energy -- a single greenfield or brownfield project may require managing 5,000-20,000 stock keeping units (SKUs) across multiple warehouses and laydown areas, with total inventory values ranging from $10M to $100M+.

Industry research consistently identifies inventory management failures as a top-five risk to commissioning and ramp-up success. The Society for Maintenance and Reliability Professionals (SMRP) reports that organizations with immature inventory management practices experience 20-35% excess inventory costs while simultaneously suffering 15-25% stockout rates on critical items. This paradox -- too much of what is not needed, too little of what is -- stems from the absence of systematic min/max calculation, demand-based reorder logic, and regular cycle counting to maintain data accuracy.

For Operational Readiness specifically, inventory management intersects with multiple OR workstreams. Commissioning requires specific spare parts, consumables, and first-fill materials to be available before each system can be turned over. Operations cannot sustain production without a properly stocked maintenance warehouse. HSE requires safety-critical spares to be on hand for emergency response. The failure to have the right inventory available at the right time is documented as Pain Point D-04 (spare parts arrive late for commissioning, 30-40%) and Pain Point D-05 (first-fill chemicals and lubricants not specified until after startup, causing 2-4 week delays).

This skill integrates with optimize-mro-inventory for min/max parameter optimization, generate-initial-spares-list for initial stocking requirements, track-long-lead-procurement for incoming material tracking, and track-material-receipts for goods receipt processing.

---

## Intent & Specification

The AI agent MUST understand and execute the following core objectives:

1. **Inventory Master Data Management**: Maintain accurate master data for all stocked items including: material number, description, unit of measure, storage location, bin location, min/max levels, reorder point, reorder quantity, lead time, unit cost, criticality classification, shelf life (where applicable), and preservation requirements.

2. **Stock Level Monitoring**: Continuously monitor stock positions against defined thresholds:
   - **Below Minimum (Red)**: Stock has fallen below minimum safety stock level -- immediate replenishment required
   - **At Reorder Point (Yellow)**: Stock has reached reorder point -- purchase requisition should be generated
   - **Within Range (Green)**: Stock is between reorder point and maximum -- normal operations
   - **Above Maximum (Orange)**: Stock exceeds maximum level -- investigate cause, consider returns or redistribution
   - **Zero Stock (Purple)**: No stock on hand -- critical if item is classified as essential or insurance spare

3. **Reorder Management**: When stock reaches reorder point, automatically generate purchase requisition with calculated reorder quantity (economic order quantity or fixed quantity per policy). Track requisition through approval, PO issuance, and delivery to closure.

4. **Cycle Counting Program**: Execute systematic cycle counting based on ABC classification:
   - **A items** (top 20% by value, typically 80% of total value): Count quarterly
   - **B items** (next 30% by value): Count semi-annually
   - **C items** (bottom 50% by value): Count annually
   - Investigate and resolve all discrepancies within 5 business days

5. **Stock Rotation & Shelf Life Management**: Track items with limited shelf life (sealants, lubricants, chemicals, elastomers, batteries, electronic components). Enforce FIFO (First-In-First-Out) issue policy. Generate alerts when items approach expiry. Initiate disposal or replacement before expiry date.

6. **Warehouse Organization**: Maintain logical warehouse layout with defined storage zones (indoor climate-controlled, indoor ambient, covered outdoor, open laydown), bin locations, and item-to-location mapping. Ensure high-turnover items are in accessible locations and hazardous materials are in compliant storage.

7. **Inventory Valuation & Reporting**: Track inventory value by category, location, and movement type. Report on slow-moving and obsolete stock. Calculate inventory turnover ratios. Provide financial data for asset valuation and insurance purposes.

8. **Commissioning Support**: Ensure all materials required for each commissioning system are reserved, kitted, and available before system turnover. Track material consumption during commissioning and replenish as needed for sustained operations.

---

## Trigger / Invocation

```
/track-warehouse-inventory
```

**Aliases**: `/warehouse-tracker`, `/inventory-monitor`, `/stock-levels`, `/control-inventario`

**Primary Trigger Commands:**
- `track-warehouse-inventory status --warehouse [name] --location [zone]`
- `track-warehouse-inventory reorder-report --project [name]`
- `track-warehouse-inventory cycle-count --class [A|B|C] --warehouse [name]`
- `track-warehouse-inventory shelf-life-report --days-to-expiry [30|60|90]`
- `track-warehouse-inventory kit-check --system [system-tag]`
- `track-warehouse-inventory valuation --warehouse [name]`
- `track-warehouse-inventory dashboard --project [name]`
- `track-warehouse-inventory slow-moving --months [6|12|18]`

**Automatic Triggers:**
- Daily: Stock level check against min/max thresholds for all active materials
- Daily: Shelf life check for items within 90/60/30 days of expiry
- When goods receipt posted: Update stock levels and recalculate status
- When material issued: Update stock levels and check reorder point
- Weekly: Generate stock status summary report
- Monthly: ABC reclassification based on updated consumption data
- Quarterly: A-item cycle count schedule generation
- When commissioning system scheduled T-30 days: Kit availability check

**Event-Driven Triggers:**
- Stock falls below minimum level (immediate alert)
- New material master created (assign min/max and storage location)
- Purchase order received (update incoming supply visibility)
- Commissioning schedule change (recalculate material requirements)
- Warehouse reorganization (update bin locations)
- Material quality issue identified (quarantine and investigate)

---

## Input Requirements

### Required Inputs

| Input | Source | Required | Description |
|-------|--------|----------|-------------|
| Material Master Data | mcp-erp (SAP MM) | Yes | Complete material records with stock parameters (min, max, reorder point, reorder qty) |
| Current Stock Levels | mcp-erp (SAP MM) | Yes | Real-time stock positions by material, plant, storage location |
| Warehouse Layout | mcp-sharepoint | Yes | Physical warehouse zones, bin locations, storage type assignments |
| Initial Spare Parts List | generate-initial-spares-list | Yes | Recommended initial stock quantities for new operations |
| Commissioning Material List | model-commissioning-sequence | Yes | Materials required per commissioning system and sequence |

### Recommended Inputs

| Input | Source | Description |
|-------|--------|-------------|
| Purchase Order Register | mcp-erp (SAP MM) | Open POs showing incoming supply with expected delivery dates |
| Material Consumption History | mcp-erp (SAP PM/MM) | Historical usage patterns for demand forecasting |
| Equipment BOM | mcp-erp (SAP PM) | Bills of Material linking spare parts to equipment |
| Preservation Requirements | Vendor documentation | Storage conditions, shelf life limits, preservation procedures |
| ABC Classification | optimize-mro-inventory | ABC/XYZ classification for cycle counting and stocking policy |

### Optional Inputs

| Input | Source | Description | Default if Absent |
|-------|--------|-------------|-------------------|
| Demand Forecast | Operations planning | Projected material consumption for budgeting | Historical average applied |
| Vendor Lead Times | Procurement database | Actual lead times by vendor/material for reorder calculation | Catalog lead times used |
| Insurance Valuation Requirements | Risk/insurance team | Specific items requiring detailed valuation | Standard valuation method |
| Tax/Duty Basis | Finance | Import duty and tax treatment for inventory valuation | Standard cost used |
| Seasonal Demand Patterns | Operations history | Seasonal variations affecting consumption | Flat demand assumed |

---

## Output Specification

### Primary Output: Warehouse Inventory Tracker (.xlsx)

**Filename:** `{ProjectCode}_Warehouse_Inventory_v{version}_{date}.xlsx`

**Workbook Structure:**

#### Sheet 1: "Dashboard Summary"
- Total SKUs managed: count by category (spare parts, consumables, chemicals, tools)
- Total inventory value: by warehouse, by category
- Stock health: items below minimum (Red), at reorder point (Yellow), in range (Green), above maximum (Orange), zero stock (Purple)
- Reorder actions pending: count and value
- Shelf life alerts: items expiring within 30/60/90 days
- Cycle count status: counts completed vs. planned, accuracy rate
- Commissioning kit readiness: systems with complete kits vs. incomplete

#### Sheet 2: "Stock Status Register"
| Material # | Description | UoM | Warehouse | Bin Location | Current Stock | Min | Reorder Pt | Max | Status | On Order Qty | On Order ETA | Criticality | Value ($) |
|-----------|-------------|-----|-----------|-------------|--------------|-----|-----------|-----|--------|-------------|-------------|------------|----------|

#### Sheet 3: "Reorder Action Log"
| Material # | Description | Current Stock | Reorder Pt | Reorder Qty | Requisition # | Requisition Date | PO # | PO Date | Expected Delivery | Status |
|-----------|-------------|--------------|-----------|------------|--------------|-----------------|------|---------|------------------|--------|

#### Sheet 4: "Cycle Count Schedule & Results"
| Count ID | Date | Warehouse | Zone | Material # | Description | ABC Class | System Qty | Count Qty | Variance | Variance % | Investigation | Resolution | Adjusted |
|---------|------|-----------|------|-----------|-------------|----------|-----------|----------|---------|-----------|--------------|-----------|---------|

#### Sheet 5: "Shelf Life Monitor"
| Material # | Description | Batch/Lot | Receipt Date | Expiry Date | Days Remaining | Current Qty | Location | Action Required | Action Taken |
|-----------|-------------|----------|-------------|------------|---------------|------------|----------|----------------|-------------|

#### Sheet 6: "Commissioning Kit Tracker"
| System Tag | System Name | Commissioning Date | Total Items | Items Available | Items Short | Shortage List | Kit Status | Action Required |
|-----------|-------------|-------------------|------------|----------------|------------|--------------|-----------|----------------|

#### Sheet 7: "Slow-Moving & Obsolete"
| Material # | Description | Last Movement Date | Months Since Movement | Current Qty | Current Value | Reason for Slow Movement | Recommendation | Decision |
|-----------|-------------|-------------------|----------------------|------------|--------------|-------------------------|---------------|---------|

#### Sheet 8: "Inventory Valuation Summary"
| Category | SKU Count | Total Qty | Total Value ($) | % of Total Value | Avg Turnover Ratio | Slow-Moving Value | Obsolete Value |
|----------|----------|----------|----------------|-----------------|-------------------|------------------|---------------|

### Secondary Output: Monthly Inventory Report (.docx)
**Filename:** `{ProjectCode}_Inventory_Monthly_{month}_{date}.docx`

Narrative report (4-6 pages):
1. Executive summary: inventory health, key metrics, trends
2. Stockout incidents and impact on operations/commissioning
3. Reorder activity: requisitions generated, POs issued, deliveries received
4. Cycle count results and accuracy trends
5. Shelf life management: items disposed, items approaching expiry
6. Commissioning kit readiness update
7. Financial summary: inventory value, write-offs, slow-moving analysis
8. Recommended actions for next period

### Formatting Standards
- Status colors: Red (#FF0000) Below Min, Yellow (#FFD700) At Reorder, Green (#00B050) In Range, Orange (#FF8C00) Above Max, Purple (#800080) Zero Stock
- Criticality indicators: Bold red for safety-critical, bold orange for production-critical
- Expiring items: Red cell fill for <30 days, orange for 30-60 days, yellow for 60-90 days
- All quantities in standard UoM per material master
- Values in USD unless specified otherwise

---

## Procedure

### Phase 1: Inventory Setup & Baseline (Steps 1-4)

**Step 1: Establish Material Master Data**
1. Import material master from mcp-erp (SAP MM)
2. Validate completeness: every stocked item must have description, UoM, storage location, unit cost
3. Assign or validate min/max parameters:
   - Use optimize-mro-inventory output if available
   - Otherwise, calculate using: Min = (lead time demand + safety stock), Max = (Min + economic order quantity)
   - Safety stock = Z-factor x standard deviation of demand x square root of lead time
4. Assign ABC classification based on annual consumption value
5. Identify shelf-life-limited items and record expiry tracking requirements
6. Map materials to equipment BOM where applicable

**Step 2: Warehouse Layout & Bin Assignment**
1. Define warehouse zones: indoor climate-controlled, indoor ambient, covered outdoor, open laydown, hazmat
2. Create bin location structure: zone-row-level-position
3. Assign materials to appropriate zones based on storage requirements
4. Position high-turnover items in easily accessible locations
5. Group items by equipment system for commissioning kit efficiency
6. Document layout in warehouse map and publish to mcp-sharepoint

**Step 3: Baseline Stock Count**
1. Conduct 100% physical inventory count at project start
2. Compare physical count to system records
3. Investigate and resolve all discrepancies
4. Adjust system records to match physical reality
5. Establish baseline accuracy rate (target: >97% for go-live)
6. Document count results and adjustments

**Step 4: Configure Monitoring & Alerting**
1. Set up daily stock level monitoring against min/max thresholds
2. Configure shelf life monitoring with 90/60/30-day alerts
3. Establish cycle count calendar based on ABC classification
4. Create commissioning kit check schedules aligned to commissioning sequence
5. Set up automated reporting distribution lists
6. Test alert and reporting workflows

### Phase 2: Active Inventory Management (Steps 5-8)

**Step 5: Daily Stock Monitoring**
1. Run daily stock level check:
   - Identify items below minimum: generate immediate replenishment alert
   - Identify items at reorder point: generate purchase requisition
   - Identify items above maximum: flag for investigation
   - Identify zero-stock items: assess criticality and urgency
2. Track pending reorders: update expected delivery dates, escalate overdue items
3. Process goods receipts from track-material-receipts: update stock levels
4. Process material issues: update stock levels, check if issue triggers reorder
5. Update dashboard with current stock health

**Step 6: Execute Cycle Counting Program**
1. Generate cycle count lists per schedule:
   - A items: quarterly counts, staggered weekly to distribute workload
   - B items: semi-annual counts
   - C items: annual counts
   - Plus: triggered counts when discrepancy suspected or after unusual transaction
2. Assign counts to warehouse personnel with due dates
3. Process count results:
   - Acceptable variance: <2% for A items, <5% for B items, <10% for C items
   - Variances exceeding thresholds: investigate root cause (theft, miscount, transaction error, misplacement)
   - Resolve discrepancies: adjust records after investigation, implement corrective actions
4. Track cycle count accuracy rate over time (target: >97%)
5. Identify systemic issues: recurring discrepancies by zone, material type, or personnel

**Step 7: Manage Shelf Life & Stock Rotation**
1. Daily shelf life scan:
   - Items expiring within 30 days: attempt to consume in planned work, else initiate disposal
   - Items expiring within 60 days: prioritize for consumption in upcoming work orders
   - Items expiring within 90 days: flag for operations planning awareness
2. Enforce FIFO issue policy: oldest batch issued first
3. For expired items:
   - Quarantine immediately (do not issue for use)
   - Assess: can vendor re-certify? Can shelf life be extended by testing?
   - If no: initiate disposal per environmental and safety regulations
   - Record write-off for financial reporting
4. Track root causes of expiry: over-ordering, specification changes, demand reduction
5. Feed expiry data back to optimize-mro-inventory for parameter adjustment

**Step 8: Support Commissioning Material Needs**
1. T-60 days before system commissioning:
   - Generate material requirements list from commissioning plan
   - Check stock availability for each item
   - Identify shortages and initiate procurement or reservation
2. T-30 days: kit readiness check
   - All materials reserved (soft allocation) for commissioning system
   - Physical kit staged in designated area if practical
   - Shortages escalated to procurement for expediting
3. During commissioning:
   - Issue materials against commissioning work orders
   - Track consumption: actual vs. planned
   - Replenish critical items that are consumed faster than expected
4. Post-commissioning:
   - Return unused materials to warehouse
   - Update stock levels and consumption data
   - Recalculate min/max parameters based on actual commissioning consumption

### Phase 3: Reporting & Optimization (Steps 9-12)

**Step 9: Generate Inventory Reports**
1. Weekly stock status summary: items below min, reorder actions, shelf life alerts
2. Monthly comprehensive report: full inventory health, cycle count results, financial valuation
3. Quarterly management report: inventory investment efficiency, turnover ratios, write-offs
4. Ad-hoc reports as requested: specific material searches, system-specific availability

**Step 10: Analyze Inventory Performance**
1. Calculate key inventory metrics:
   - Inventory turnover ratio by category
   - Stockout frequency and duration
   - Service level (fill rate): items available when requested / total requests
   - Inventory accuracy: cycle count accuracy trend
   - Carrying cost: (average inventory value) x (carrying cost %) annually
2. Identify improvement opportunities: slow-moving stock reduction, parameter recalibration
3. Benchmark against industry standards (SMRP best practices)

**Step 11: Manage Slow-Moving & Obsolete Stock**
1. Quarterly review of items with no movement in 6+ months
2. Classify as: slow-moving (still needed, reduce quantity), obsolete (no longer needed), or insurance spare (retained intentionally)
3. For obsolete items: evaluate return to vendor, sale, or scrap
4. Calculate financial impact of write-offs
5. Update material master to prevent reordering of obsolete items

**Step 12: Continuous Improvement**
1. Feed actual consumption data to optimize-mro-inventory for parameter recalibration
2. Update lead time data based on actual procurement performance
3. Refine ABC classification based on updated consumption patterns
4. Propose warehouse layout improvements based on movement analysis
5. Document lessons learned for future project inventory setup

---

## Quality Criteria

| Criterion | Metric | Target | Minimum Acceptable |
|-----------|--------|--------|-------------------|
| Inventory Accuracy | Cycle count accuracy rate | >97% | >95% |
| Stockout Rate | Critical items with zero stock | <2% | <5% |
| Service Level | Materials available when requested | >95% | >90% |
| Reorder Timeliness | Reorder triggered within 24 hours of reaching reorder point | >98% | >95% |
| Shelf Life Compliance | Zero expired items issued for use | 100% | 100% |
| Cycle Count Completion | Counts completed per schedule | >95% | >90% |
| Commissioning Kit Readiness | Kits complete by T-30 days | >90% | >85% |
| Data Accuracy | Material master data fields complete and correct | >98% | >95% |
| Report Timeliness | Monthly reports distributed on schedule | 100% | >95% |
| Inventory Turnover | Annual turnover ratio for non-insurance items | >2.0 | >1.5 |
| Slow-Moving Reduction | Quarterly reduction in slow-moving value | >10% | >5% |
| Write-Off Rate | Annual inventory write-offs as % of total value | <3% | <5% |

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents)

| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| `track-material-receipts` | Goods receipt data | Material received, inspected, and booked into warehouse |
| `generate-initial-spares-list` | Initial stocking list | Recommended quantities for new operations inventory setup |
| `optimize-mro-inventory` | Min/Max parameters | Calculated inventory parameters based on demand analysis |
| `track-long-lead-procurement` | Incoming supply | Expected delivery dates for on-order materials |
| `model-commissioning-sequence` | Material requirements | Materials needed per commissioning system and schedule |

### Downstream Dependencies (Outputs TO other agents)

| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| `optimize-mro-inventory` | Consumption data | Actual usage data for inventory parameter recalibration |
| `orchestrate-or-program` | Inventory readiness | Stock availability status for OR gate reviews |
| `prepare-pssr-package` | Spares confirmation | Critical spare parts inventory status for PSSR checklist |
| `agent-finance` | Inventory valuation | Stock values for financial reporting and insurance |
| `calculate-operational-kpis` | Warehouse KPIs | Service level, turnover, accuracy metrics for operational dashboards |

---

## References

### Standards & Best Practices
- **SMRP Best Practice 5.0** -- Materials Management for maintenance organizations
- **ISO 55001:2014** -- Asset Management System Requirements (inventory as asset)
- **SAP MM Best Practices** -- Material management configuration and processes
- **APICS/ASCM Body of Knowledge** -- Inventory management principles and methods

### Industry Resources
- Society for Maintenance and Reliability Professionals (SMRP) -- Inventory management benchmarks
- Association for Supply Chain Management (ASCM) -- Demand planning and inventory optimization
- Reliability-Centered Maintenance principles -- Critical spares identification
- VSC Corporate Pain Points Research Report -- D-04, D-05

### Templates
- `templates/warehouse_inventory_tracker.xlsx` -- Master inventory tracking workbook
- `templates/cycle_count_schedule.xlsx` -- Cycle counting program template
- `templates/commissioning_kit_checklist.xlsx` -- System-by-system material kit template
- `templates/shelf_life_register.xlsx` -- Shelf life tracking template
- `templates/monthly_inventory_report.docx` -- Monthly report template

---

## Changelog

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0.0 | 2025-02-25 | VSC AI Architect | Initial skill definition for Wave 1 deployment |
