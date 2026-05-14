# Ajuste de Estrategias de Monitoreo y Mantenimiento en Flota de Camiones Autonomos

## Metadata
- **Authors:** Gabriel Hidalgo, Boris Herrera, Eduardo Jopia
- **Session:** S2 MAPLA 2024
- **Topic:** Practical adjustments to monitoring and maintenance strategies for autonomous mining truck fleets, addressing structural integrity, engine integrity, and fire prevention through real-time event-based monitoring and engineering improvements.

## Key Points
- Presentation focuses on an autonomous truck fleet operating in a mining district (Distrito Minero Centinela referenced in geospatial data)
- **Three core monitoring objectives identified:**
  1. Structural integrity of the equipment
  2. Engine integrity (preventing catastrophic component failures)
  3. Minimizing fire impact through integration with autonomy control systems
- **Monitoring strategy adjustments:**
  - Shifted from weekly operational event reporting to immediate action-taking upon event detection
  - Direct alerts to monitoring specialists for engine events associated with potential catastrophic component failures
  - Daily reporting of key event counts for structural integrity with georeferenced identification to normalize terrain conditions
  - Linked fire suppression system to the autonomy control system for automated response
- **Off-center load (estiba descentrada) alerts:** System monitors and alerts when truck loads are improperly centered, tracked by shift (T1-T4) with distribution: T1=30.08%, T2=29.89%, T3=22.63%, T4=17.4% of events across 4 shifts
- **Lubrication code concentration analysis:** Tracked 559 total greasing events across fleet (CA203-CA214 trucks), all originating from alert #A190; identified 15 specific greasing points including suspension bearings, dump body pivot pins, elevation cylinders, stabilizer bar bearings, rear axle pivot, and chassis
- **Sprungweight event concentration:** Georeferenced mapping of suspension weight events (Sprung ESS) on satellite and route maps showing concentration patterns along haul routes, enabling terrain condition normalization
- **Maintenance strategy adjustments:**
  1. Cross-check implementation for pre-delivery verification during planned maintenance
  2. Planned inspections now include backlog identification and verification of conditions exposed to chronic failures
  3. Engineering design changes based on detected chronic failure modes
- **Maintenance quality assurance workflow:** Inspector raises backlogs -> Digital verification of fills -> Compliance and precision control -> Maintenance execution with backlog resolution -> Supervisory cross-check to validate truck delivery
- **Engineering improvements implemented:**
  1. Dump body (tolva) reinforcement to address structural cracking in canopy and lateral areas
  2. Dump body position sensor installation
  3. Repositioning of crankcase pressure sensor

## Relevance to Asset Management
- Demonstrates the unique maintenance challenges of autonomous truck fleets where there is no operator to detect anomalies, making real-time monitoring systems critical
- The shift from weekly reporting to immediate alerting represents a key evolution in condition monitoring maturity that asset management software must support
- Georeferenced event tracking (sprungweight, load centering) shows the importance of GIS integration in fleet maintenance management systems
- The cross-check quality assurance workflow for planned maintenance is a model process that CMMS/EAM software should facilitate
- Chronic failure mode tracking and engineering design change management are key features for reliability-centered maintenance software modules
- Lubrication monitoring with detailed point-level tracking illustrates the granularity needed in equipment maintenance management systems

## Keywords
autonomous trucks, fleet maintenance, condition monitoring, structural integrity, georeferenced monitoring, lubrication management, planned maintenance, quality assurance, cross-check, chronic failure modes, engineering improvements, fire suppression, mining trucks, autonomous mining, real-time alerts
