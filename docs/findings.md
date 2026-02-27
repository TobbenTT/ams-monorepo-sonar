# Findings — AI-Powered Asset Management & Maintenance Solution (OCP)

## Date: 2026-02-20

---

## 1. Client Context

- **Client:** OCP (Office Cherifien des Phosphates) — Phosphate mining, Morocco
- **Scale:** 15 plants, heterogeneous workflows across sites
- **Consulting Firm:** Value Strategy Consulting (VSC), Jose Cortinat (CEO)
- **Key Contacts:**
  - OCP: Mouad TOUIL (Mouad.TOUIL@ocpgroup.ma)
  - OCP Maintenance: Nada BENAZZOUZ (Nada.BENAZZOUZ@ocpgroup.ma)
  - VSC: Jose CORTINAT (jose.cortinat@valuestrategyconsulting.com)

## 2. Discovery Answers (Confirmed 2026-02-20)

| # | Question | Answer |
|---|----------|--------|
| 1 | North Star | Build 3-functionality OCP MVP Pilot |
| 2 | Integrations | SAP PM + Claude API (priority) |
| 3 | Source of Truth | Generate phosphate-realistic synthetic data |
| 4 | Delivery Payload | Local prototype (Streamlit/Retool), cloud later |
| 5 | Behavioral Rules | Safety-first AI (human validates everything) |
| 6 | Language | French + English + Arabic (trilingual) |
| 7 | Data Fidelity | Phosphate-specific equipment and failure modes |

## 3. Current Pain Points at OCP

- 50% of work requests are incorrectly marked Priority 1
- Planners spend hours confirming material availability manually
- No standardization across 15 plants (heterogeneous workflows)
- Backlog is poorly stratified and managed
- Reliance on tribal knowledge
- Unstructured emails and informal channels for work requests

## 4. MVP Scope — 3 Core Functionalities

### 4.1 Intelligent Field Capture
- Voice + image input from field technicians
- AI auto-structures: equipment TAG, failure mode, priority, spare parts
- Validation step before submission to planner
- Eliminates unstructured emails, captures rich context

### 4.2 AI Planner Assistant
- Receives structured work requests with full context
- Auto-validates: material availability, workforce, shutdown schedule
- Suggests realistic priority and resource requirements
- Target: 80% reduction in planning time

### 4.3 Backlog Optimization
- Stratifies backlog by reason (awaiting materials, shutdown, equipment)
- Identifies groupable work packages
- Generates optimized schedule proposals considering all constraints

## 5. Technology Decisions

### 5.1 MVP Stack (Confirmed)
| Layer | Technology | Rationale |
|-------|-----------|-----------|
| AI/NLP | Claude API (Sonnet 4) | Best reasoning for classification tasks |
| Database | PostgreSQL (local) | SAP-compatible relational model |
| Backend | Python (FastAPI) | Rapid API development, AI ecosystem |
| UI | Streamlit | Fast prototyping, data-native, local |
| Data | Synthetic (Faker + domain) | No real OCP data yet |
| SAP | Mock JSON files | Simulated SAP PM for development |

### 5.2 Deferred to Phase 2+
- React Native mobile app
- React/Next.js web dashboard
- Supabase cloud database
- n8n workflow orchestration
- Deepgram voice transcription
- PI System real-time connector
- Airtable integration
- Knowledge Graph (Neo4j)

## 6. SAP PM Data Model

- Equipment hierarchy: Plant > Area > System > Equipment > Component
- SAP transactions: IW38/IW39 (work orders), IP10 (PM plans)
- Work order types: PM01 (Inspection), PM02 (Preventive), PM03 (Corrective)
- Criticality: AA, A+, A, B, C, D
- Approach: Read-only first, write after sandbox validation

## 7. Phosphate Mining Equipment Domain

### Equipment types for synthetic data:
- **Primary Crushing:** Jaw crushers, gyratory crushers
- **Grinding:** SAG mills, ball mills, rod mills
- **Beneficiation:** Flotation cells, thickeners, hydrocyclones
- **Material Handling:** Belt conveyors, bucket elevators, feeders, stackers, reclaimers
- **Thermal:** Rotary dryers, calcination kilns
- **Chemical:** Sulfuric acid plants, phosphoric acid reactors
- **Utilities:** Pumps, compressors, cooling towers, transformers
- **Instrumentation:** Flow meters, level sensors, vibration monitors

### Common failure modes:
- Liner wear (mills, crushers)
- Bearing failure (motors, pumps, conveyors)
- Belt misalignment/tear (conveyors)
- Impeller wear (pumps, flotation cells)
- Corrosion (acid plant piping)
- Overheating (motors, transformers)
- Vibration excess (rotating equipment)
- Blockage/plugging (chutes, pipes)
- Electrical fault (motors, drives, controls)
- Seal leakage (pumps, valves)

## 8. Timeline (from RFI)

- **Phase 0 (2-4 weeks):** Readiness Assessment & Discovery
- **Phase 1 (8-12 weeks):** MVP Development & Testing
- **Phase 2 (4-6 weeks):** Pilot Deployment
- **Total: 16-24 weeks** from kickoff to pilot in production
- **Target start:** March 2026

## 9. Success Metrics

- 60-70% reduction in planning time per work request
- 40-50% improvement in schedule adherence
- 80% reduction in priority misclassification
- 30-40% faster work request processing
- ROI positive within 12 months

## 10. Constraints & Dependencies

- Must align with JESA workflow standardization project at OCP
- Must support multiple workflow versions across 15 plants
- Data collection follows 3-tier priority scheme
- Co-design with end users mandatory from Day 1
- SAP PM expertise required on team
- Safety-first: AI never auto-submits; human always validates

## 11. Research — GitHub & Resources

> TO BE POPULATED from background research task
