# Indice de Salud de Activos para Toma de Decisiones en Planta Quimica de Litio

## Metadata
- **Authors:** Marcelo Osorio Sanchez, David Silva Carmona, Cristian Ramirez Castro
- **Session:** S6 MAPLA 2024
- **Topic:** Development and implementation of an Asset Health Index (ISA) dashboard to centralize risk assessment and prioritize maintenance decisions in a lithium chemical plant experiencing 30% asset fleet growth.

## Key Points
- Context: Lithium market growth (projections to 2035) drove plant expansion from 70 KTPA to 180 KTPA, increasing the asset fleet by 30% and raising the question: how to anticipate equipment failures at scale?
- The solution focused on centralizing information, quantifying risk variables, unifying evaluation criteria, and providing an overall view of asset condition for prioritized management.
- **Approach to building the index:**
  1. Identified performance and condition variables.
  2. Connected variables to databases.
  3. Developed weighted scoring model.
- **Variables considered in the ISA calculation (each with weighting factors):**
  - Criticality
  - Work orders/notifications (Avisos)
  - Condition monitoring (MonCon)
  - Backlog
  - Maintenance strategy
- **Three-tier health classification:**
  - Satisfactory (green)
  - Alert (yellow)
  - Risk (red)
- A "Heat Map" dashboard was developed summarizing ISA by plant, subprocess, and individual critical asset status, highlighting which parameter has the greatest/least deviation and where action is needed.
- **Results achieved:**
  - Availability targets above 95% and utilization of 85%.
  - Centralized risk control through a single dashboard.
  - Optimized maintenance strategies for critical equipment, improving planning and scheduling prioritization.
  - Reduced corrective maintenance costs by decreasing unplanned corrective tasks.
- **Next steps:** Integrate real-time PI data and train an AI model to generate alerts and recommendations.

## Relevance to Asset Management
- The Asset Health Index is a best-practice tool for risk-based decision making, directly aligned with ISO 55000 principles of understanding asset condition and managing risk.
- Combines multiple data sources (criticality, condition monitoring, backlog, work orders, strategy) into a single composite indicator, enabling holistic asset management.
- The heat map dashboard provides executives and planners with a unified view for resource allocation and prioritization.
- Future AI integration signals maturity progression from reactive/preventive to predictive/prescriptive maintenance.
- Replicable model for any process plant managing large and growing asset portfolios.

## Keywords
asset health index, ISA, risk-based decision making, criticality, condition monitoring, backlog, dashboard, heat map, lithium, SQM, availability, maintenance prioritization, predictive maintenance, AI, MAPLA 2024
