# Examples - unify-operational-data

*Extracted from SKILL.md to comply with the 500-line limit.*
*Read this file when you need detailed examples for this skill.*

---

## Examples

### Example 1: Copper Mine and Concentrator - Atacama Region, Chile

**Input:**
- Facility: Open-pit copper mine with concentrator plant, 80,000 TPD
- Systems:
  - SAP ECC (ERP): Finance, procurement, HR, payroll
  - SAP PM (CMMS): Maintenance management, 3,500 equipment records
  - Honeywell Experion (DCS): Process control, 12,000 I/O points
  - OSIsoft PI (Historian): Process data archive, 8,000 tags
  - Wenco Fleet Management: Mine fleet dispatching and productivity
  - Modular Mining (Dispatch): Truck-shovel assignment and haulage
  - LIMS (LabWare): Assay and metallurgical accounting
  - GIS (ArcGIS): Spatial data, mine planning, environmental monitoring
  - Isometrix: Safety, environment, and risk management
  - SharePoint: Document management
  - Kronos: Workforce time and attendance
- Key Pain Points: Equipment tags differ between SAP PM and PI; maintenance costs not linked to production loss; no integrated view of mine-to-mill performance; safety incidents not correlated with process deviations

**Expected Output:**
- Data Integration Architecture:
  - ISA-95 model mapped to 11 systems across Levels 0-4
  - 14 integration points defined (6 real-time via OPC-UA, 8 batch via ETL)
  - Hybrid architecture: OPC-UA gateway + ETL middleware + data lake
  - Phase 1 (Foundation): Equipment master alignment (SAP PM <> PI tag mapping: 3,500 equipment to 8,000 tags)
  - Phase 2 (Operations): Mine-to-mill data flow integration; real-time operations dashboard
  - Phase 3 (Analytics): Predictive maintenance data pipeline; integrated cost-per-ton analysis

- Master Data Model:
  - 5 master data entities defined with 287 attributes total
  - Equipment cross-reference: SAP PM tag <> PI tag <> Wenco equipment ID <> Isometrix asset code
  - 23% of equipment records have inconsistent naming between SAP PM and PI (requiring remediation)

- Data Quality Report:
  - Overall quality score: 71% (target: 90%)
  - Critical issue: 31% of SAP PM equipment records missing cost center assignment
  - Critical issue: 18% of PI tags not mapped to SAP PM equipment
  - Estimated business impact of quality issues: $2.1M/year in misallocated costs and missed optimization

- Unified Dashboards: 4 dashboards specified
  - Executive: OEE, cost-per-ton, safety metrics, production vs. plan
  - Operations: Real-time process performance, mine-to-mill KPIs, quality
  - Maintenance: Backlog aging, PM compliance, equipment availability, cost
  - HSE: Incident trends, corrective actions, environmental compliance

### Example 2: Gas Processing Plant - Biobio Region, Chile

**Input:**
- Facility: Natural gas processing and compression, 50 MMSCFD
- Systems:
  - SAP S/4HANA (ERP): Finance, procurement, HR
  - IBM Maximo (CMMS): Maintenance management, 1,200 equipment records
  - ABB 800xA (DCS): Process control, 4,500 I/O points
  - ABB Ability (Historian): Process data, 3,200 tags
  - Enablon: HSE management
  - SharePoint: Document management
  - ADP: HR and payroll
- Key Pain Points: Maximo work orders not linked to ABB process data; cannot correlate equipment trips with process conditions; regulatory environmental reporting requires manual data compilation from 3 systems; spare parts in Maximo not synchronized with SAP procurement

**Expected Output:**
- Data Integration Architecture:
  - ISA-95 model mapped to 7 systems
  - 9 integration points (3 real-time, 6 batch)
  - Focus: Maximo-ABB integration for condition-based maintenance; Maximo-SAP synchronization for procurement
  - Technology: ABB Ability edge gateway (OPC-UA) + MuleSoft middleware + Azure data platform

- Master Data Model:
  - Equipment cross-reference: Maximo asset <> ABB tag <> SAP functional location
  - Material synchronization: Maximo item master <> SAP material master (1,800 items)

- Data Quality Report:
  - Overall quality score: 76%
  - Key issue: 22% of Maximo equipment records have no ABB tag mapping
  - Key issue: Material descriptions inconsistent between Maximo and SAP for 35% of items

- Unified Dashboards: 3 dashboards specified
  - Operations: Gas processing rates, quality, compressor performance, utility consumption
  - Maintenance: Compressor health, vibration trends, PM compliance, spare parts availability
  - HSE: Environmental monitoring (emissions, discharges), safety metrics, regulatory compliance status
