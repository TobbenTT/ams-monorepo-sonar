# Chatbot IA Generativa para Toma de Decisiones Operativas en Mantenimiento Industrial

## Metadata
- **Authors:** Jorge Martinez, Claudio Villalobos, Cristian Ramirez, Rodolfo Pino, Gerson Salas
- **Session:** S14 MAPLA 2024
- **Topic:** Implementation of a generative AI chatbot using Microsoft Copilot Studio to support operational decision-making in industrial maintenance at SQM's Planta Quimica de Litio (PQL).

## Key Points
- SQM's maintenance area at PQL needed a conversational AI chatbot capable of answering maintenance-related queries about assets, work orders, and equipment manuals
- The chatbot was developed using **Microsoft Copilot Studio** as the AI conversational platform
- Key data sources integrated:
  - **IBM Maximo** database (primary management system for work orders, assets, maintenance plans)
  - **SharePoint** maintenance document repository
  - **Technical manuals** in PDF format
  - **SQM corporate portal**
- The chatbot handles queries such as:
  - Pending service requests for specific assets
  - Work orders linked to specific assets
  - Maintenance plans associated with assets
  - Executed work orders for preventive maintenance plans
  - ISO standards and safety information
- Deployed via **Microsoft Teams** for easy user access
- **Results from initial testing:**
  - 48% reduction in time for generating analyses
  - Average response time: 1 minute
  - 85% coherent generative responses
  - Timely information for preventive maintenance process control
- **Roadmap:**
  - Q3 2024: Production deployment with analytics team support
  - Q4 2024: Chatbot training/tuning, migration to near-real-time Maximo data, SAP integration (spare parts, materials, costs)
  - Q1 2025: Adoption of chatbot development service, AI platform administration, integration of analytical models via API

## Relevance to Asset Management
- Demonstrates practical application of generative AI for maintenance decision support in lithium mining operations
- Addresses a critical pain point: rapid access to maintenance data scattered across multiple systems (CMMS, document repositories, manuals)
- The 48% time reduction in analysis generation shows significant potential for improving maintenance planner productivity
- Integration of Maximo + SAP represents a common challenge in mining maintenance where ERP and CMMS coexist
- Applicable pattern for any operation seeking to build AI-assisted maintenance decision tools

## Keywords
generative AI, chatbot, maintenance decisions, Microsoft Copilot Studio, IBM Maximo, SQM, lithium mining, work orders, preventive maintenance, SAP integration, digital transformation, PQL
