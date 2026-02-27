# myRIAM SYSTEM: Asistente IA para Gestion de Activos y Mantenimiento basado en IA Generativa

## Metadata
- **Authors:** Sergio Garcia, Carlos Barahona (Guayacan Solutions, Chile); Mauricio Godoy, Carlos Garrido (Universidad de La Serena, Chile)
- **Session:** S11 MAPLA 2024
- **Topic:** Generative AI-powered assistant (myRIAM) for asset management and maintenance in mining, combining LLMs, predictive models, and machine learning to provide conversational access to technical knowledge, operational data, and maintenance recommendations.

## Key Points
- Mining industry problem context:
  - Average failure cost: 260 kUSD
  - 5% production losses
  - 18% higher energy consumption, 29% higher fossil fuel consumption
  - 16,000+ operations/maintenance positions unfilled in mining by 2030
- myRIAM is a conversational AI assistant accessible via mobile app, web, and WhatsApp
- Covers multiple asset types: light vehicles, heavy vehicles, industrial equipment, plants, structures, civil works
- Three-layer architecture:
  1. **Knowledge Base:** Technical/legal, safety, operational, maintenance documentation with vectorization and similarity search (RAG approach)
  2. **Reportability:** Integration with predictive models, planning, prioritization, scheduling, resource assignment, execution
  3. **Outputs:** Reports, performance metrics, preventive alerts, optimization recommendations, efficiency recommendations, safety alerts, KPIs via dashboards and maps
- Technology stack uses GPT models (gpt-3.5-turbo, gpt-4o, gpt-4o-mini) with configurable assistant parameters (prompt, response format, Top_P, temperature)
- Tools include: retrieval, code interpreter, function calling
- Functions: scheduled alerts, report generation, document delivery
- Knowledge base organized into four domains: Safety, Engineering/Manuals, Operations, Maintenance
- Machine learning pipeline: text/documents/images -> feature vectors -> automatic learning algorithm -> predictive model -> expected labels
- Knowledge update: incoming reports -> AI selects action -> updates databases -> generates reports -> stores in knowledge base
- Predictive models follow CRISP-DM methodology: business understanding -> data understanding -> data preparation -> modeling -> evaluation -> implementation
- Multi-role user interface supports different access levels and integrations between German manufacturing and Chilean mining contexts
- Use cases: conveyor belts, strategic infrastructure, light vehicles and fleets, fire suppression systems

## Relevance to Asset Management
- Directly addresses the knowledge gap crisis (16,000+ unfilled positions by 2030) by democratizing expert maintenance knowledge through conversational AI
- Combines generative AI with domain-specific knowledge bases, creating an industry-specific RAG (Retrieval Augmented Generation) system
- WhatsApp integration enables field workers to access maintenance knowledge without dedicated hardware
- Continuous learning loop ensures the system improves as new maintenance cases are documented
- Scalability roadmap extends to vehicles, mining equipment, buildings, routes/tunnels, aircraft, energy, defense, and water sectors

## Keywords
generative AI, LLM, asset management, maintenance assistant, myRIAM, Guayacan Solutions, RAG, knowledge base, predictive models, CRISP-DM, WhatsApp, conversational AI, GPT, machine learning, mining, MAPLA 2024
