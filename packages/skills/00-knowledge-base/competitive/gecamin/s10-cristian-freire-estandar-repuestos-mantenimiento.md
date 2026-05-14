# Estandar de Repuestos Mantenimiento: Control y Gestion

## Metadata
- **Authors:** Christian Freire, Macarena Santana, Pablo Plaza, Nicolas Tagle (Los Pelambres)
- **Session:** S10 MAPLA 2024
- **Topic:** Standardized methodology for spare parts management in mining maintenance, connecting asset criticality with inventory control through SAP and PowerBI integration.

## Key Points
- Industry challenge: spare parts are managed based on user requests, urgencies, and OEM recommendations, creating a disconnect between technical needs and strategic procurement
- Three spare part types identified: Consumable (seals, gaskets), Repairable (gearboxes), and Rotable (crusher posts)
- Maintenance strategies mapped to part types: usage-based, condition-based, modifiable, and disposable
- Problems identified before implementation:
  - 48.44% of parts classified as ND (no movement), 29.70% as PD (on-demand) -- only 21.86% had proper replenishment parameters
  - Parts purchased against maintenance orders rather than strategic stock
  - Experience-based management with information in historical spreadsheets
  - Critical spare parts lacked updated criticality ratings
  - 12 hours to days of delay in spare part delivery causing production losses
- Methodology: 5-step process for spare parts control by equipment:
  1. Load spare parts in BOM (Bill of Materials) in SAP
  2. Connect SAP with PowerBI for visualization
  3. Assign spare part criticality per asset (using Cr(t) = F(t) x C(t) formula)
  4. Update replenishment parameters (V1, VB, PD classifications)
  5. Control critical and PD spare parts
- Criticality model uses frequency x consequence matrix with E/A/M/B classification (Extreme/High/Medium/Low)
- Implementation included 964 spare parts identified across multiple subsystems
- PowerBI dashboard provides real-time visibility of compliance by area, criticality, ABC indicators, stock status, and upcoming maintenance plans

## Results (Before vs After)
- Before: 75% of parts purchased on-demand (PD); After: 80% of critical parts in stock with automatic replenishment
- Before: Parts tracked in historical Excel sheets; After: SAP-based control linked to asset criticality
- Before: Parts not identified by equipment; After: PD costs controlled and projected by work orders
- Before: ND/PD parts bought without strategy; After: Easy identification of parts to obsolete or replace

## Relevance to Asset Management
- Demonstrates a systematic approach to linking asset criticality with spare parts management
- Addresses a common industry gap: the disconnect between maintenance strategy and procurement/inventory
- SAP-PowerBI integration provides a scalable, real-time control mechanism
- The BOM-based governance model ensures spare parts criticality is updated periodically and systematically
- Next steps include linking to parts manuals/drawings and physical vs. system stock control

## Keywords
spare parts management, inventory optimization, criticality analysis, BOM, SAP, PowerBI, maintenance planning, procurement, mining maintenance, replenishment strategy, EOQ, stock control, Los Pelambres, MAPLA 2024
