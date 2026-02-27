# IA Generativa en Palas Hidraulicas PC5500

## Metadata
- **Authors:** Erick Parra, Mario Urtubia, Pablo Mathias (Antofagasta Minerals - Minera Centinela)
- **Session:** S5 MAPLA 2024
- **Topic:** RAG-based generative AI chatbot for reducing mean time to repair (MTTR) on Komatsu PC5500 hydraulic shovels

## Key Points
- PC5500 hydraulic shovels are critical assets: ~552 tons, ~3,200 ton/hr capacity, 80,000-hour design life, 57 units in Chile (4 at Centinela)
- Problem: Extended diagnostic times due to complex electronic, hydraulic, and communication systems interacting in multi-brand fleet (CAT, Komatsu)
- End of 2023 saw poor feed to crusher due to low PC5500 reliability from recurring failure modes
- Solution: RAG (Retrieval-Augmented Generation) architecture chatbot fine-tuned on ~8,000 pages of technical manuals, operation manuals, and troubleshooting guides
- Chatbot provides precise technical responses based on the full documentation corpus
- Example queries: "What do I do if stick penetration power is low?", "Explain code g00064", "What does pressure X1.1 at 6.9 bar mean?"
- Chatbot references original documents for traceability
- Reduces MTTR by accelerating fault diagnosis for maintenance technicians
- Reduced diagnostic time translates directly to more available hours and higher mineral movement
- Change management was critical for adoption by maintenance crews
- Next steps: integration with SAP and Jigsaw FMS, automated pre-reports, expanded to other equipment types

## Relevance to Asset Management
- Generative AI applied to maintenance knowledge management directly addresses the expertise gap in complex multi-brand mining fleets
- MTTR reduction on critical loading equipment has outsized impact on mine production throughput
- RAG architecture ensures AI responses are grounded in actual OEM documentation, reducing hallucination risk
- Scalable approach: once proven on PC5500, can be extended to any equipment type with available documentation
- Bridges the gap between experienced and new maintenance technicians, reducing dependency on individual expertise

## Keywords
generative AI, RAG, chatbot, PC5500, hydraulic shovel, Komatsu, MTTR, fault diagnosis, troubleshooting, Antofagasta Minerals, Centinela, maintenance knowledge management, fine-tuning, technical documentation
