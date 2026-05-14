# Identificacion de Ciclones con Bajo Rendimiento de Clasificacion a partir de Senales CYCLONEtrac PST

## Metadata
- **Authors:** Rodrigo Bruna, Alejandro Ramos, Robert Maron, Alejandro Jaque
- **Session:** S15 MAPLA 2024
- **Topic:** Data-driven methodology to identify underperforming hydrocyclones in concentrator plants using CYCLONEtrac PST real-time particle size tracking signals to generate performance rankings and maintenance inputs.

## Key Points
- Hydrocyclones are critical in concentrator plants, defining the split between overflow (downstream) and underflow (back to grinding), affecting entire circuit performance
- Despite their importance, hydrocyclones are among the least instrumented equipment in concentrator plants
- Traditional sensors measure composite overflow of all cyclones, preventing individual monitoring
- **CYCLONEtrac PST technology** enables real-time particle size tracking of each individual hydrocyclone's overflow at 4-second intervals
- **Methodology developed:**
  - Define a maximum PST limit based on metallurgical/operational requirements (mesh +70#)
  - Quantify oversize events by calculating the average deviation above the control limit using integral calculus
  - Generate a performance ranking of cyclones based on deviation magnitude and duration
- **Dataset:** 281 days of operation, battery of 9 cyclones, ~289,000 records consolidated to 1-minute averages
- **Key results:**
  - Cyclone 8 identified as worst performer (highest oversize time and highest average deviation)
  - Pareto analysis applied to identify most frequent cyclone combinations (e.g., 6-cyclone configurations most common)
  - 43 different combinations of 6 cyclones identified; detailed performance analysis for top 8 combinations
  - Methodology provides granular view of each cyclone's performance within specific operating configurations
- **Conclusions:** The methodology provides direct input for maintenance planning of cyclones based on classification performance; can be applied on weekly or monthly basis for more frequent maintenance feedback

## Relevance to Asset Management
- Transforms hydrocyclone maintenance from time-based to condition/performance-based
- Provides maintenance planners with data-driven prioritization for cyclone inspection and repair
- Individual cyclone monitoring closes a significant instrumentation gap in concentrator plants
- The ranking methodology can be automated to generate maintenance work orders for underperforming cyclones
- Demonstrates how process data analytics can bridge the gap between operations and maintenance planning
- Applicable to any concentrator plant with hydrocyclone batteries

## Keywords
hydrocyclones, CYCLONEtrac PST, particle size tracking, classification performance, concentrator plant, condition monitoring, performance ranking, Pareto analysis, maintenance planning, grinding circuit, oversize events, data analytics
