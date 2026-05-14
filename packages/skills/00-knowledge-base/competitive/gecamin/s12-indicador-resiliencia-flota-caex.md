# Indicador de la Resiliencia para una Flota CAEX

## Metadata
- **Authors:** Orlando Duran, Alejandro Pena, Cristian Salas, Adolfo Arata
- **Session:** S12 MAPLA 2024
- **Topic:** Novel resilience indicator based on permutation entropy of ordinal patterns applied to mining haul truck fleet availability data

## Key Points
- Resilience is the intrinsic capacity of a system to react to disruptive events or shocks and recover functionality
- Traditional KPIs (reliability, maintainability, availability) evaluate failure capacity but do not measure resilience
- Resilience relates directly to maintenance capabilities, resources, and strategies
- Existing resilience metrics are mostly qualitative and subjective; few quantitative and global indicators exist for production systems
- Proposed indicator uses permutation entropy of ordinal patterns applied to fleet availability time series
- Methodology: symbolic analysis converts continuous time series into discrete symbol sequences (High/Medium/Low)
- Ordinal patterns focus on the organization/structure of elements in the time series, not on magnitude
- Parameters: pattern size (d), delay (tau), lookback window (LB)
- Permutation entropy measures complexity/disorder: increases with randomness, decreases with stability
- Higher entropy (more random availability patterns) = lower resilience; lower entropy (stable patterns) = higher resilience
- Process: data input, window division, range calculation per window, ordinal pattern detection, entropy calculation
- Based on Shannon entropy formula applied to pattern probability distributions
- Enables comparison of resilience across different fleets, time periods, or maintenance strategy changes
- Quantitative resilience measurement supports evidence-based maintenance resource allocation

## Relevance to Asset Management
- First quantitative resilience indicator specifically designed for mining fleet management
- Provides a measurable way to evaluate whether maintenance strategies effectively improve system resilience
- Complements traditional availability/reliability KPIs by capturing the dynamic response behavior of the fleet
- Enables benchmarking resilience across fleets and operations for resource optimization
- Supports strategic decision-making about maintenance investment by linking resilience to disruptive event recovery

## Keywords
resilience, permutation entropy, ordinal patterns, CAEX, haul truck fleet, availability, symbolic analysis, Shannon entropy, maintenance strategy, fleet management, KPI, time series analysis, disruptive events
