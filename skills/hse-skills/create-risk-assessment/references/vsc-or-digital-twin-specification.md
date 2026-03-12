# VSC OR System: Digital Twin Functional Specification
## VSC Operational Readiness - Digital Twin of the Management Model

**Source Documents:**
- `SOLUTION-CONTEXT/[DIGITAL TWIN GESTION CORPORATIVA] VSC OR System_ Especificacion Funcional.pdf`

**Applicable Skills:**
- All orchestrator-skills (create-or-strategy, create-or-plan, create-or-playbook, create-or-framework, generate-or-report, generate-or-gate-review, orchestrate-or-program, track-or-deliverables, create-kpi-dashboard, create-weekly-report, create-executive-briefing, generate-performance-report)
- create-agent-specification
- define-intent-specification
- build-second-brain
- create-or-framework
- create-or-strategy
- create-kpi-dashboard
- create-executive-briefing
- analyze-reliability
- analyze-equipment-criticality
- create-maintenance-strategy
- create-risk-assessment
- audit-ai-workflow
- measure-ai-roi
- design-adoption-roadmap
- sync-memory-agents

---

## Table of Contents

| Section | Topic | Relevant Agents |
|---------|-------|-----------------|
| 1 | Strategic Imperative: Redefining the Project-to-Asset Transition | All |
| 2 | System Architecture: The Nervous System of Operational Readiness | Orchestrator |
| 3 | Data Flow Pipeline: The Transmutation Engine | Orchestrator, All |
| 4 | 11 Agent Specifications | All |
| 5 | Data Schema: Firestore Hybrid Design | Orchestrator, Asset Management |
| 6 | Agent Prompting Specifications (System Instructions) | All |
| 7 | Implementation Strategy: Stitch and Firebase | Orchestrator, Execution |

---

## 1. Strategic Imperative: Redefining the Project-to-Asset Transition

### The Core Problem

The global mining and energy industry faces an existential crossroads. As capital megaprojects increase in technical complexity, geographic scale, and regulatory scrutiny, traditional management mechanisms have proven insufficient to guarantee a successful transition from the project execution phase (CapEx) to productive operation (OpEx). This critical period, known as Operational Readiness (OR), represents the moment of greatest vulnerability in an industrial asset's lifecycle.

**Key statistic:** A significant value leakage, frequently estimated at up to **30% of the anticipated project value**, occurs precisely during the handover, commissioning, and ramp-up phases. This value destruction is not the consequence of deficient physical engineering, but of a systemic failure in preparing the organization to operate said asset.

### The VSC OR System Vision

The VSC OR System is not simply another project management software or passive document repository. It is, in its most fundamental essence, a **Digital Twin of the Management Model**, designed to replicate organizational cognition and solve the endemic problem of "Institutional Amnesia."

### Institutional Amnesia and Dark Matter

| Concept | Description |
|---------|-------------|
| **Institutional Amnesia** | The systematic loss of organizational knowledge through staff turnover, shift changes, informal communications, and undocumented decisions |
| **Dark Matter (80%)** | Unstructured knowledge flowing through human interactions: verbal decisions in hallway meetings, expert reasoning behind design changes, subtle risk warnings in Teams calls, field operator notes |
| **Structured Data (20%)** | Information residing in ERP, CMMS, SQL databases -- only represents a fraction of total organizational knowledge |

### The Invisible Debt of Current Management

Current operational models suffer from a paralyzing dependence on rudimentary tools for complex decision-making:

- **90%** of daily management in mining operations is conducted through Excel spreadsheets, emails, and unstructured meetings
- Engineers and operational leaders spend approximately **3 hours daily** coordinating activities and aligning information between different teams and shifts
- **40%** of total meeting time is dedicated exclusively to verifying data and resolving inconsistencies between divergent sources

When management is slow due to this cognitive friction, the physical operation inevitably slows down.

---

## 2. System Architecture: The Nervous System of Operational Readiness

### Architecture Paradigm

The VSC OR System does not follow traditional monolithic software development patterns. To replicate the flexibility and association capability of the human brain, it adopts a **hybrid architecture** combining three core technologies:

| Technology | Role | Purpose |
|-----------|------|---------|
| **Knowledge Graphs** | Structural backbone | Connect disparate data points through entity relationships |
| **Vector Search** | Semantic memory | Enable meaning-based search across unstructured content |
| **Event-Driven Architecture (EDA)** | Reactive nervous system | Detect events and activate appropriate agent responses |

### Five Design Pillars

1. **Fundamental Knowledge Components**: Encode the company's identity, technical knowledge, and governance structures as an immutable base layer upon which agents reason
2. **Information Flow (The Nervous System)**: Universal and standardized data ingestion from both human (interactions) and physical (sensors) sources
3. **Specialized AI Agents**: A swarm of domain-expert agents (Risk, Maintenance, Legal) that collaborate to solve complex problems, rather than a single generalist AI
4. **Governance and Model Refinement**: Human oversight is critical -- the system proposes and the human validates, creating a continuous feedback loop
5. **Agile Implementation**: Use of Low-Code/No-Code tools and rapid prototyping to deliver incremental value from the first weeks

---

## 3. Data Flow Pipeline: The Transmutation Engine

The data flow within the VSC OR System is designed as a continuous processing pipeline that ingests raw data and refines actionable intelligence. This process is divided into four critical stages.

### Stage 1: Universal Ingestion (The Corporate Senses)

| Flow | Name | Description | Data Types |
|------|------|-------------|------------|
| **A** | Structured Telemetry (The Body) | Hard data from transactional and operational systems | IoT sensors (vibration, temperature, pressure) via Kafka/Pub-Sub; SAP PM maintenance records; Primavera P6 schedules; Oracle financial data |
| **B** | Unstructured Communication (The Voice) | Most innovative flow -- captures the "Dark Matter" | Audio/video from MS Teams/Zoom meetings; field voice notes from supervisors via mobile apps; corporate chat transcriptions |
| **C** | Static Knowledge (Long-Term Memory) | Rules and theoretical physics of the operation | PDF documents; OEM manuals; technical specifications; legal contracts; Standard Operating Procedures (SOPs) |

### Stage 2: Semantic Transmutation (Neural Processing)

Once ingested, raw data is transformed into a format that AI can process and relate:

- **Vectorization (Embeddings)**: Text converted into high-dimensional numerical vectors using models like Vertex AI. Enables semantic searches (e.g., searching "pump system failure" retrieves documents mentioning "cavitation in pump 101" or "seal leakage")
- **Entity and Relationship Extraction**: LLMs analyze text to extract mining-relevant entities: Assets (e.g., SAG Mill), Risks (e.g., Permit Delay), People (e.g., Plant Manager), Dates
- **Graph Construction**: The graph connects disparate data points. If a meeting mentions "Mill liner shipment (Asset) is delayed (Event) due to a port strike (Cause)", the system creates these relationships, enabling complex queries

### Stage 3: Cognitive Orchestration (Reasoning)

The heart of the system is the multi-agent orchestration engine using a hierarchical, event-based pattern:

- **Event Detection**: The system monitors data flows for "significant events" or anomalies (e.g., negative sentiment shift in a contractor's meetings, or vibration trend deviation in a critical asset)
- **Agent Activation**: When an event is detected, the orchestrator (Nexus) activates the pertinent specialized agents
- **Reasoning and Collaboration**: Agents communicate with each other. The Risk Agent can request the Maintenance Agent to verify if an asset has critical spare parts before escalating an operational risk alert

### Stage 4: Action

The refined intelligence is delivered as actionable outputs: dashboards, alerts, reports, recommendations, and automated workflows.

---

## 4. 11 Agent Specifications

### Agent 1: Nexus (Strategic Management Assistant)

- **Role**: Central Orchestrator and primary interface for senior management. The "Digital CEO" of the system.
- **Key Capabilities**: Contextual Routing (delegates to specialist agents), Soft Signal Detection (compares formal reports with meeting sentiment to detect "Watermelon Projects" -- green outside, red inside), Strategic Synthesis (aggregates conflicting information from multiple agents)
- **Deliverables**: Dynamic strategic dashboards, automated executive summaries, strategic misalignment alerts

### Agent 2: Reliability Genius (Asset Strategy Generator)

- **Role**: Ensure asset availability and reliability from Day 1, preventing equipment "infant mortality"
- **Key Capabilities**: Automated FMEA/RCM Generation (reads OEM manuals to identify probable failure modes), Spare Parts Optimization (cross-references failure modes with BOM to identify critical spares)
- **Deliverables**: Auto-generated FMEA tables, optimized RCM maintenance plans, validated critical spare parts lists

### Agent 3: Operations (Short Interval Control Copilot)

- **Role**: Optimize shift-by-shift operational execution and stabilize the ramp-up curve
- **Key Capabilities**: Digital Shift Handover (ingests outgoing supervisor voice notes, generates structured report for incoming shift), Ramp-up Monitoring (real-time actual vs. design capacity comparison)
- **Deliverables**: Automated shift handover reports, OEE predictions, ramp-up deviation alerts

### Agent 4: Risks (Dynamic Bowtie and Controls Monitor)

- **Role**: Transform risk management from a static Excel register to a dynamic, living system
- **Key Capabilities**: Dynamic Bowtie (auto-updates Bowtie diagrams based on maintenance failure reports), Control Erosion Detection (alerts when critical controls fail repeatedly -- "Control Rot")
- **Deliverables**: Dynamic risk matrices, degraded control alerts, automatic Bowtie diagram updates

### Agent 5: Human Resources (Talent and Skills Orchestrator)

- **Role**: Guarantee workforce competency and readiness to operate specific project assets
- **Key Capabilities**: Just-in-Time Training (aligns training plan with commissioning schedule), Skills Gap Analysis (compares required competencies with hired staff profiles)
- **Deliverables**: Personalized training plans, accelerated onboarding routes, operational competency gap reports

### Agent 6: PMO (Portfolio Value Orchestrator)

- **Role**: Manage OR project schedule and budget, focusing on value delivery
- **Key Capabilities**: Predictive Scheduling (uses historical analysis to predict delays), Interdependency Mapping (identifies hidden conflicts between construction and operational readiness)
- **Deliverables**: Risk-adjusted schedules, automated WBS structures, completion date predictions

### Agent 7: Purchasing (Strategic Supply Analyst)

- **Role**: Secure the supply chain for Day 1 of operations, mitigating stockout risks
- **Key Capabilities**: First Fills and Spare Parts Optimization (verifies all critical supplies are on-site before commissioning), Maverick Spend Detection (identifies off-contract purchases during ramp-up)
- **Deliverables**: Stock risk alerts, maverick spend reports, inventory optimization recommendations

### Agent 8: Contracts (Compliance Auditor)

- **Role**: Manage contractual complexity during transition, ensuring suppliers fulfill their promises
- **Key Capabilities**: 3-Way Match Validation (automates comparison between contracted, invoiced, and actually executed work), Obligation Tracking (extracts key milestones from contracts and monitors compliance)
- **Deliverables**: Automated compliance audits, billing discrepancy alerts, contractor performance dashboards

### Agent 9: Legal (Regulatory Compliance Officer)

- **Role**: Protect the "License to Operate" through rigorous compliance with permits and regulations
- **Key Capabilities**: Commitment Tracking (extracts thousands of individual commitments from environmental approval documents and maps them to specific operational tasks), Audit Evidence (automatically collects digital evidence for inspections)
- **Deliverables**: Permit compliance registers, regulatory risk alerts, automated audit preparation

### Agent 10: Operational Excellence (Continuous Improvement Copilot)

- **Role**: Drive operational maturity and standardization once operations are stabilized
- **Key Capabilities**: SOP Generation from Video (analyzes task recordings to generate step-by-step procedures and detect inefficiencies/Muda), Best Practice Replication (identifies highest-performing shifts and standardizes their behaviors)
- **Deliverables**: Standardized visual SOPs, Kaizen initiative backlog, process variability analysis

### Agent 11: Maintenance (Predictive Asset Assistant)

- **Role**: Support tactical maintenance execution and empower field technicians
- **Key Capabilities**: Interactive Troubleshooting (technicians "chat" with the asset or manual for symptom-based diagnostics), Root Cause Analysis Assistance (pre-populates RCA templates with event data and suggests probable causes)
- **Deliverables**: Step-by-step diagnostic guides, RCA drafts, integrated spare parts requests

---

## 5. Data Schema: Firestore Hybrid Design

Google Cloud Firestore is recommended for its flexible JSON document handling, serverless scalability, and native vector search support.

### Collection: interaction_logs (Episodic Memory)

Stores every captured human interaction, serving as the historical record of the project's "consciousness."

| Field | Data Type | Description |
|-------|-----------|-------------|
| document_id | String (UUID) | Unique interaction identifier (e.g., meeting_2025_10_12_pmo) |
| timestamp | Timestamp | Exact date and time of interaction |
| source_type | String | Data origin: meeting_transcript, voice_note, email_thread |
| participants | Array | List of roles/people involved |
| raw_content | String (Blob) | Full text of transcription or original content |
| summary | String | AI-generated summary of key points |
| vector_embedding | Vector (Array[Float]) | Vector representation for semantic search (typically 768 dimensions) |
| extracted_entities | Map | Detected entities linked to system IDs: {"assets": ["asset_001"], "risks": ["risk_045"]} |
| sentiment_score | Float | Sentiment score (-1.0 to 1.0) for detecting "soft signals" of risk |
| action_items | Array[Map] | Detected tasks with assignees and due dates |

### Collection: asset_knowledge (Semantic Memory)

Represents the "Digital Twin" of physical assets, enriched with derived knowledge.

| Field | Data Type | Description |
|-------|-----------|-------------|
| document_id | String | Asset ID (e.g., asset_crusher_01) |
| name | String | Technical name (e.g., "Primary Gyratory Crusher") |
| criticality | String | Criticality level (High, Medium, Low) |
| manual_refs | Array | Links to vectorized OEM manual fragments |
| risk_links | Array | References to risk IDs in the Risk Register affecting this asset |
| health_status | Map | Latest telemetry data: {"vibration": "4mm/s", "temp": "65C"} |
| discussion_history | Array | IDs of documents in interaction_logs where this asset was recently discussed |

### Hybrid Query Capability

This schema enables powerful hybrid queries. The Nexus Agent can execute queries like: "Show me all high-criticality assets (Structured Filter) where 'vibration problems' or 'spare parts delay' has been discussed in the last two weeks (Semantic Vector Search)." This ability to cross-reference structured with unstructured data is what differentiates the VSC OR System from a simple BI dashboard.

---

## 6. Agent Prompting Specifications (System Instructions)

### Nexus Agent (Orchestrator) Prompt

**Role**: Strategic Orchestrator of the VSC OR System. Mission: eliminate institutional amnesia and ensure strategic alignment during the OR phase.

**Core Capabilities**:
1. **Contextual Routing**: Do not answer detailed technical questions yourself. Analyze user intent and query semantics to route to the most appropriate expert agent
2. **Synthesis**: When multiple agents return data, synthesize into a single coherent strategic narrative. Identify conflicts between agents (e.g., PMO says "On Time" but Purchasing says "Material delayed") and highlight them
3. **Soft Signal Detection**: Analyze sentiment and tone of unstructured inputs. If a formal report says "On Track" but associated text sentiment is "Anxious" or "Uncertain", flag as a "Hidden Risk" or "Watermelon Project"

**Processing Instructions**:
1. Receive user query
2. Decompose query into logical sub-tasks
3. Invoke appropriate Agent Tools for each sub-task
4. Collect and evaluate agent outputs
5. Present final response with a "Strategic Confidence Level" and source links

### Risks Agent (Dynamic Bowtie) Prompt

**Role**: Operational Risk Management Sentinel. Base methodology: Bowtie Analysis and Critical Control Management (CCM).

**Reasoning Logic**:
1. **Extraction**: Identify mentions of risk events, hazards, or threats in text
2. **Mapping**: Use vector search to map events to existing entities in the Risk Register (Firestore)
3. **Bowtie Analysis**: For new risks, propose Bowtie structure (Hazard -> Top Event -> Consequences). Analyze context to determine control status: "Effective?", "Degraded?", "Failed?"
4. **Score Calculation**: Update dynamic risk matrix score based on likelihood (mention frequency/incidents) and potential consequence

**Output Format (JSON)**:
```json
{
  "risk_event_detected": "String",
  "related_asset_id": "String",
  "detected_controls": [],
  "bowtie_update_required": true,
  "risk_score_update": {"likelihood": 3, "consequence": 4}
}
```

### Maintenance Agent (Predictive Asset Assistant) Prompt

**Role**: Senior Maintenance Engineer expert with 30 years of experience in mineral processing plants. Eidetic access to the complete library of OEM manuals, P&ID diagrams, and work order history.

**Reasoning Logic**:
1. **Identification**: Identify the Asset ID (Asset Tag) from the user query (may be vague, e.g., "the mill feed pump")
2. **Context Retrieval**: Query the Knowledge Graph for the specific equipment manual, design parameters, and last 5 work orders
3. **Symptom Correlation**: Correlate reported symptoms (vibration, temperature, noise) with known failure modes in the asset's FMEA
4. **Diagnostic Guide**: Propose a step-by-step diagnostic route. Always prioritize safety (LOTO - Lockout/Tagout) before any technical intervention
5. **Resource Verification**: If diagnosis suggests a component replacement, query the Purchasing Agent about spare part stock availability

**Constraint**: Always cite the specific page number of the OEM manual or the reference document ID to guarantee technical traceability.

---

## 7. Implementation Strategy: Stitch and Firebase

### UI Prototyping with Google Stitch

Google Stitch (AI-powered UI design tool) is used to rapidly prototype user interfaces or "Command Centers." This enables visual iteration with stakeholders before writing complex code.

**Example Stitch Prompt**:
> "Design an Operational Readiness dashboard in dark mode for a mining control room. Upper-left panel: Ramp-up Curve (Actual vs Plan) with line chart. Upper-right panel: Dynamic Risk Heat Map (5x5 Matrix). Lower panel: Scrollable feed of 'Soft Signals' and alerts detected in recent meetings, with sentiment indicators. Use a high-contrast color scheme (orange/gray) for critical alerts."

Developers can export Frontend code (React/HTML/Tailwind) directly from Stitch and connect it with the Firebase backend.

### 3-Phase Deployment Strategy

| Phase | Name | Timeline | Activities | Agents Deployed |
|-------|------|----------|------------|-----------------|
| **1** | The Digital Ear | Weeks 1-4 | Integration with Teams/Zoom to capture "Dark Matter" and generate shadow risk registers | Nexus, Risk Agent |
| **2** | The Digital Cortex | Weeks 5-8 | Massive ingestion of manuals and contracts into vector database. FMEA automation | Reliability, Contracts |
| **3** | The Complete Nervous System | Weeks 9-12 | SAP and SCADA integration. "Chat with the Asset" functionality for technicians | Operations, Maintenance, OpEx |

### Technology Stack

| Component | Technology |
|-----------|-----------|
| Database | Google Cloud Firestore (JSON + Vector Search) |
| AI Models | Vertex AI / Gemini 1.5 Pro |
| Event Bus | Google Pub/Sub or Kafka |
| UI Prototyping | Google Stitch |
| Frontend | React / Tailwind CSS |
| Backend | Firebase Functions (serverless) |
| Integration | SAP PM, SCADA, Primavera P6, Oracle |

---

## Changelog
### v1.0 (February 2026)
- Initial reference document compiled from VSC OR System Functional Specification (17-page source)
- Translated from Spanish source to English
- Structured for VSC OR Multi-Agent System consumption
