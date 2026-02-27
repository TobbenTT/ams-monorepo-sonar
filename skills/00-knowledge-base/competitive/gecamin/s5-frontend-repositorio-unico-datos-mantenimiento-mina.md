# Desarrollo de un Front-End y Repositorio Unico de Datos para Tecnologias de Mantenimiento Mina

## Metadata
- **Authors:** Erick Parra, Mario Urtubia (Antofagasta Minerals - Minera Centinela)
- **Session:** S5 MAPLA 2024
- **Topic:** Centralized data repository and front-end dashboard for integrating multiple mine maintenance technology systems

## Key Points
- 15 years ago mine maintenance had only FMS, ERP, and manual data downloads; today there are numerous real-time data sources
- Data sources integrated: tire monitoring, tribological samples, lubricant fills, CAT EEAA alerts, CAT 7495 vital signs, Minecare 3 (autonomous and conventional), Cadetech SiamFlex, FMS (Jigsaw and Dispatch), Specto Cummins engines, PI System tags, Databricks SAP, Excel
- Architecture uses a centralized Data Historian as the single repository
- Visualization layer built on Power BI Premium with On-Premises Data Gateway
- Key benefit: flexibility to swap vendors/systems without losing data continuity
- Dedicated maintenance technology support team handles: assembly, configuration, maintenance, diagnostics, upgrades, improvements, and direct IT communication
- Systems supported: SiamFlex, Minecare, VIMS, VisionLink, VHMS, Centurion, PDA, Cisco Mesh, Nokia LTE
- Customized dashboards allow visualization of multiple equipment and variables with high performance
- Cross-origin data enables combining ERP (SAP), FMS, Vital Signs, and Oil data in single views
- Multiple success cases demonstrated: early detection of engine issues on trucks 13, 163, and 44 through integrated alert management
- Three-step workflow: alert management and reporting, mechanical attention, equipment operational and learning capture
- Roadmap considerations: data integration, blackbox technologies, data quality, cybersecurity, front-end development

## Relevance to Asset Management
- Centralized data repository is foundational for any data-driven asset management strategy in mining
- Integration of disparate data sources enables holistic equipment health assessment across all monitoring technologies
- Front-end dashboards democratize access to maintenance intelligence, enabling faster decision-making at all levels
- Vendor-agnostic data architecture protects long-term investments in data infrastructure
- Success cases demonstrate tangible value of integrated data: early fault detection preventing catastrophic failures

## Keywords
data repository, data historian, Power BI, mine maintenance, FMS, condition monitoring, SiamFlex, Minecare, VIMS, data integration, dashboard, centralized data, Antofagasta Minerals, Centinela, Maintenance 4.0, cybersecurity
