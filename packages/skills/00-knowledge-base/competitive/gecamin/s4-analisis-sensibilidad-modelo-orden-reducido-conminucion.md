# Analisis de Sensibilidad y Modelo de Orden Reducido de un Proceso de Conminucion Minero

## Metadata
- **Authors:** Mario Di Capua H., C. Diaz, R. Velazquez, I. Marino, Karolline Ropelato (ESSS/Ansys)
- **Session:** S4 MAPLA 2024
- **Topic:** Computer-aided engineering (CAE) approach using DEM simulation and Reduced Order Models (ROMs) for comminution process optimization

## Key Points
- Chile's copper production share declined from 31.7% (2013) to 24.7% (2022) due to declining ore grades, productivity challenges, and project delays
- Average ore grade dropped from 1.41% (1999) to 0.67% (2019), requiring 2.1x more ore processing for the same copper output
- Methodology uses Ansys Rocky DEM (Discrete Element Method) to model mineral behavior during multi-component, multi-variable comminution
- Mineral modeling includes size, shape, Ab-T10 fracture model, and calibrated interaction forces (static/dynamic friction, stiffness, adhesion, rolling resistance)
- Sensitivity analysis determines correlation between input variables (frequency, amplitude, belt speed, mass flow) and responses (power, efficiency, particle size)
- Color-coded correlation matrix: Red = high dependency, Blue = low importance, Green = no importance
- Reduced Order Models (ROMs) generate response surfaces for rapid performance prediction under varying operating conditions
- ROM for roller power consumption identifies optimal operating ranges for belt speed and mass input
- ROM for screen efficiency determines maximum sifting efficiency based on frequency and amplitude conditions
- ROMs are the precursor step for physics-based Digital Twins that can hybridize with measured plant data
- Next steps: integration with historical data, ML/AI for predictive questions (when, where, why will it fail)

## Relevance to Asset Management
- Physics-based digital twins enable optimized operating parameters that extend equipment life and reduce energy consumption
- Sensitivity analysis identifies which operating variables most impact equipment performance, guiding maintenance focus
- ROMs provide rapid response for operational decision-making without running full simulations
- Comminution optimization directly addresses the challenge of declining ore grades while managing OPEX and CAPEX
- Foundation for hybrid models combining physics simulation with plant data for predictive maintenance

## Keywords
DEM, discrete element method, comminution, Ansys Rocky, ROM, reduced order model, sensitivity analysis, digital twin, grinding, screening, SAG mill, ore grade decline, ESSS, simulation, particle size distribution
