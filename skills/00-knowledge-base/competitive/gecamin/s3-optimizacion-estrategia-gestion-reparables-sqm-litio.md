# Optimizacion de Estrategia y Gestion de Reparables en Planta Quimica de Litio SQM

## Metadata
- **Authors:** Rodrigo Chavez P., Claudio Villalobos A. (SQM Lithium)
- **Session:** S3 MAPLA 2024
- **Topic:** Comprehensive framework for optimizing repairable spare parts strategy and management at SQM's lithium chemical plant, projecting USD 3.1-4.2 million annual savings through systematic process redesign, inventory rationalization, and ERP-based lifecycle tracking.

## Key Points
- Repairable parts optimization is fundamental for budgetary resource management and stock availability, especially considering extended lead times for imported equipment
- **Current situation analysis framework uses three pillars:**
  1. Workflow analysis: Identify bottlenecks, inefficient processes, areas with highest repair time and cost
  2. Inventory evaluation: Quantity, type of spares available, inventory system efficiency, logistics management
  3. Expense analysis: Cash cost, inventory value for moving vs. immobilized stock
- Recommends a quantified SWOT analysis to prioritize improvement areas
- **SMART strategic objectives defined:** Cost reduction (specific %), repair time improvement (days/hours), operational availability increase (tied to MTBF), obsolescence reduction (specific %)
- **New strategy design covers four areas:** Repair process optimization, inventory management system implementation, training and formation, cost reduction targets (new vs. repaired equipment costs)
- **Current asset status:** 21,244 total work orders analyzed; 13 equipment families represent 80% of OTs; pumps (BBA: 5,652 OTs, 27%) and motors (MTR: 5,333 OTs, 25%) represent 51% of all work orders
- **Maintenance spending 2023:** Deviated 11% from budget -- 4% materials/spares, 7% services; identified 12 SPOT contracts used on-demand for reparable-related work
- **Critical finding on repair costs:** Repair cost criterion set at max 60% of new asset replacement value; some pump models (Gould STI/MTI) showed probable repair costs of 63-69% of replacement, with maximum costs reaching 117-229% -- making repair economically unviable
- **Material traceability issues:** USD 9.78M in materials charged to work orders that were cancelled ($7.9M) or incomplete; internal workshops (panoles) hinder traceability and make reparables management impossible
- **Cost analysis by family:** Total USD 16,768K across all families; 9 families represent 80% of spend; pumps ($7,050K, 42%) and motors ($2,237K, 55% cumulative) dominate
- **Eight improvement opportunities identified in current process:**
  1. No clear criteria for deciding if asset is repairable
  2. Pre-diagnosis not always performed
  3. No system registration of removed/returned equipment
  4. No formal ERP record for removal and post-repair reception
  5. Repair quality not always checked
  6. Cannot identify repair origin, making warranty claims difficult
  7. Storage in untracked internal workshops
  8. Dispatch guide regularization delays
- **Feasibility criteria for reparables:** Standard failure type exists, technically repairable, recoverable to new condition, health trackable, uniquely identifiable/taggable per equipment (not position)
- **Economic criteria:** Repair cost does not exceed 45-55% of replacement value, favorable MTBF/repair cost ratio, acceptable operational condition recovery percentage
- **Scale of opportunity:** >2,200 assets qualify as reparables, ~4,000 annual repairs estimated, projected initial opportunity of USD 6.2 to 8.4 million annually
- **Future process macro-stages:** Request generation -> Maintenance diagnosis -> Warehouse entry (defective) -> Provider removal and repair -> Warehouse reception (repaired) -> Plant installation
- **6-stage improvement methodology (~6 months):** Baseline -> Reparables Strategy -> Opportunity Analysis -> RFI for Repair Services -> Reparables Logistics -> KPIs and Control Dashboard
- **New roles defined:** Materials Planner and Expeditor (maintenance), Reparables Engineer (supply chain); involvement of maintenance, supply chain, and warehouse teams
- **Tools:** Physical tagging per asset (stamp/label), systemic registration in SAP, Maximo, and Smartsheet; repair count, pre-diagnostics, and tracking in Smartsheet; failure information loaded to Maximo from OT data
- **Projected results:**
  - Annual savings: USD 3.1-4.2 million
  - Warehouse inventory reduction: USD 6.8-9.3 million
  - Spare parts availability increase: 55% (considering 2-month lead time vs. 3-week average repair time)
  - Sustainability: 60% reduction in reparable-related waste volume
  - Increased opportunities for regional and national service companies through framework contract tenders

## Relevance to Asset Management
- Directly demonstrates the critical role of CMMS/EAM systems (Maximo, SAP) in enabling repairable spare parts lifecycle management -- a key module for asset management software
- The eight identified process gaps highlight specific features that asset management software must provide: repair decision criteria, pre-diagnosis workflows, equipment serialization/tagging, repair history tracking, quality verification, warranty management
- The material traceability problem (USD 9.78M unaccounted) validates the need for integrated work order and inventory management in a single platform
- The 60% replacement cost threshold for repair decisions is a valuable business rule that asset management software should automate
- SQM (world's largest lithium producer) as the case study demonstrates demand for asset management solutions in the growing lithium/battery materials sector beyond traditional copper mining

## Keywords
repairable spare parts, spare parts management, SQM, lithium mining, inventory optimization, MTBF, ERP Maximo, SAP, repair cost analysis, equipment lifecycle, warehouse management, work order traceability, cost reduction, obsolescence management, Pareto analysis, SMART objectives
