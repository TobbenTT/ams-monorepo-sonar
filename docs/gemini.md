# gemini.md — Project Constitution
# AI-Powered Asset Management & Maintenance Solution (OCP)

---

## STATUS: BLUEPRINT PHASE — EXPANDED TO 4 MODULES, AWAITING APPROVAL

---

## 1. Project Identity

- **Project Name:** OCP Maintenance AI MVP
- **Client:** OCP (Office Cherifien des Phosphates) — Phosphate Mining, Morocco
- **Firm:** Value Strategy Consulting (VSC)
- **Domain:** Industrial Asset Management & Maintenance
- **Industry:** Phosphate Mining (15 plants)
- **Pilot Scope:** 1-2 critical equipment items in 1 plant

## 2. Discovery Answers (Confirmed 2026-02-20)

| # | Question | Answer |
|---|----------|--------|
| 1 | North Star | Build 4-module OCP MVP Pilot (3 original + Strategy Development) |
| 2 | Integrations | SAP PM + Claude API (priority) |
| 3 | Source of Truth | Generate phosphate-realistic synthetic data |
| 4 | Delivery Payload | Local prototype (Streamlit/Retool), cloud later |
| 5 | Behavioral Rules | Safety-first AI (human validates everything) |
| 6 | Language | French + English + Arabic (trilingual) |
| 7 | Data Fidelity | Phosphate-specific equipment and failure modes |

## 3. Data Schemas

### 3.1 Equipment Hierarchy (SAP PM Structure)

```json
{
  "EquipmentHierarchy": {
    "plant": {
      "plant_id": "string (SAP Plant code, e.g., 'OCP-JFC1')",
      "name": "string",
      "name_fr": "string",
      "name_ar": "string",
      "location": "string (GPS coordinates or site name)"
    },
    "functional_location": {
      "func_loc_id": "string (SAP TPLNR, e.g., 'JFC1-MIN-BRY-01')",
      "description": "string",
      "description_fr": "string",
      "level": "int (1=Plant, 2=Area, 3=System, 4=Sub-system)",
      "parent_func_loc_id": "string | null",
      "plant_id": "string"
    },
    "equipment": {
      "equipment_id": "string (SAP EQUNR, e.g., 'EQ-SAG-001')",
      "tag": "string (Technical TAG, e.g., 'BRY-SAG-ML-001')",
      "description": "string",
      "description_fr": "string",
      "equipment_type": "string (SAG Mill, Conveyor, Crusher, etc.)",
      "manufacturer": "string",
      "model": "string",
      "serial_number": "string",
      "installation_date": "ISO 8601 date",
      "criticality": "enum (AA, A+, A, B, C, D)",
      "func_loc_id": "string",
      "status": "enum (ACTIVE, INACTIVE, DECOMMISSIONED)",
      "weight_kg": "number | null",
      "power_kw": "number | null"
    },
    "component": {
      "component_id": "string (SAP sub-equipment)",
      "description": "string",
      "description_fr": "string",
      "parent_equipment_id": "string",
      "component_type": "string (Motor, Bearing, Liner, Gear, etc.)",
      "manufacturer": "string",
      "part_number": "string"
    }
  }
}
```

### 3.2 Work Request — Field Capture Input (Raw)

```json
{
  "FieldCaptureInput": {
    "capture_id": "UUID",
    "timestamp": "ISO 8601 datetime",
    "technician_id": "string",
    "technician_name": "string",
    "capture_type": "enum (VOICE, TEXT, IMAGE, VOICE+IMAGE)",
    "language_detected": "enum (fr, en, ar)",
    "raw_voice_text": "string | null (transcribed voice input)",
    "raw_text_input": "string | null (typed text input)",
    "images": [
      {
        "image_id": "UUID",
        "file_path": "string",
        "capture_timestamp": "ISO 8601 datetime",
        "gps_coordinates": "string | null"
      }
    ],
    "equipment_tag_manual": "string | null (if technician typed/selected TAG)",
    "location_hint": "string | null (area name spoken or typed)"
  }
}
```

### 3.3 Structured Work Request — AI-Processed Output

```json
{
  "StructuredWorkRequest": {
    "request_id": "UUID",
    "source_capture_id": "UUID (links to FieldCaptureInput)",
    "created_at": "ISO 8601 datetime",
    "status": "enum (DRAFT, PENDING_VALIDATION, VALIDATED, REJECTED, SUBMITTED_TO_SAP)",

    "equipment_identification": {
      "equipment_id": "string (SAP EQUNR, AI-resolved)",
      "equipment_tag": "string (AI-resolved from voice/text/image)",
      "confidence_score": "float (0.0-1.0)",
      "resolution_method": "enum (EXACT_MATCH, FUZZY_MATCH, IMAGE_OCR, MANUAL)"
    },

    "problem_description": {
      "original_text": "string (technician's words)",
      "structured_description": "string (AI-standardized description)",
      "structured_description_fr": "string",
      "failure_mode_detected": "string | null (e.g., 'Vibration excessive')",
      "failure_mode_code": "string | null (links to FMEA if available)",
      "affected_component": "string | null"
    },

    "ai_classification": {
      "work_order_type": "enum (PM01_INSPECTION, PM02_PREVENTIVE, PM03_CORRECTIVE)",
      "priority_suggested": "enum (1_EMERGENCY, 2_URGENT, 3_NORMAL, 4_PLANNED)",
      "priority_justification": "string (AI's reasoning)",
      "estimated_duration_hours": "float",
      "required_specialties": ["string (MECHANICAL, ELECTRICAL, INSTRUMENTATION, etc.)"],
      "safety_flags": ["string (LOCKOUT_TAGOUT, CONFINED_SPACE, HOT_WORK, etc.)"]
    },

    "spare_parts_suggested": [
      {
        "sap_material_code": "string",
        "description": "string",
        "quantity_needed": "int",
        "availability_status": "enum (IN_STOCK, LOW_STOCK, OUT_OF_STOCK, UNKNOWN)",
        "warehouse_location": "string | null",
        "lead_time_days": "int | null"
      }
    ],

    "image_analysis": {
      "anomalies_detected": ["string"],
      "component_identified": "string | null",
      "severity_visual": "enum (LOW, MEDIUM, HIGH, CRITICAL) | null"
    },

    "validation": {
      "validated_by": "string | null (planner ID)",
      "validated_at": "ISO 8601 datetime | null",
      "modifications_made": ["string (list of fields changed by planner)"],
      "final_priority": "enum (1_EMERGENCY, 2_URGENT, 3_NORMAL, 4_PLANNED) | null"
    }
  }
}
```

### 3.4 Planner Recommendation (AI Planner Assistant Output)

```json
{
  "PlannerRecommendation": {
    "recommendation_id": "UUID",
    "work_request_id": "UUID (links to StructuredWorkRequest)",
    "generated_at": "ISO 8601 datetime",

    "resource_analysis": {
      "workforce_available": [
        {
          "specialty": "string",
          "technicians_available": "int",
          "next_available_slot": "ISO 8601 datetime"
        }
      ],
      "materials_status": {
        "all_available": "boolean",
        "missing_items": [
          {
            "material_code": "string",
            "description": "string",
            "estimated_arrival": "ISO 8601 date | null",
            "alternative_available": "boolean",
            "alternative_code": "string | null"
          }
        ]
      },
      "shutdown_window": {
        "next_available": "ISO 8601 datetime | null",
        "type": "enum (MINOR_8H, MAJOR_20H_PLUS) | null",
        "duration_hours": "float | null"
      },
      "production_impact": {
        "estimated_downtime_hours": "float",
        "production_loss_tons": "float | null",
        "cost_estimate_usd": "float | null"
      }
    },

    "scheduling_suggestion": {
      "recommended_date": "ISO 8601 date",
      "recommended_shift": "enum (MORNING, AFTERNOON, NIGHT)",
      "reasoning": "string",
      "conflicts": ["string (list of scheduling conflicts detected)"],
      "groupable_with": ["string (work request IDs that could be grouped)"]
    },

    "risk_assessment": {
      "risk_level": "enum (LOW, MEDIUM, HIGH, CRITICAL)",
      "risk_factors": ["string"],
      "recommendation": "string"
    },

    "planner_action_required": "enum (APPROVE, MODIFY, ESCALATE, DEFER)",
    "ai_confidence": "float (0.0-1.0)"
  }
}
```

### 3.5 Backlog Item

```json
{
  "BacklogItem": {
    "backlog_id": "UUID",
    "work_request_id": "UUID",
    "equipment_id": "string",
    "equipment_tag": "string",
    "priority": "enum (1_EMERGENCY, 2_URGENT, 3_NORMAL, 4_PLANNED)",
    "work_order_type": "enum (PM01, PM02, PM03)",
    "created_date": "ISO 8601 date",
    "age_days": "int",
    "status": "enum (AWAITING_MATERIALS, AWAITING_SHUTDOWN, AWAITING_RESOURCES, AWAITING_APPROVAL, SCHEDULED, IN_PROGRESS)",
    "blocking_reason": "string | null",
    "estimated_duration_hours": "float",
    "required_specialties": ["string"],
    "materials_ready": "boolean",
    "shutdown_required": "boolean",
    "groupable": "boolean",
    "group_id": "string | null (work package group)"
  }
}
```

### 3.6 Optimized Backlog Output

```json
{
  "OptimizedBacklog": {
    "optimization_id": "UUID",
    "generated_at": "ISO 8601 datetime",
    "period": {
      "start_date": "ISO 8601 date",
      "end_date": "ISO 8601 date"
    },

    "summary": {
      "total_backlog_items": "int",
      "items_schedulable_now": "int",
      "items_blocked": "int",
      "estimated_total_hours": "float"
    },

    "stratification": {
      "by_reason": {
        "awaiting_materials": "int",
        "awaiting_shutdown": "int",
        "awaiting_resources": "int",
        "awaiting_approval": "int",
        "schedulable": "int"
      },
      "by_priority": {
        "emergency": "int",
        "urgent": "int",
        "normal": "int",
        "planned": "int"
      },
      "by_equipment_criticality": {
        "AA": "int",
        "A_plus": "int",
        "A": "int",
        "B": "int",
        "C": "int",
        "D": "int"
      }
    },

    "work_packages": [
      {
        "package_id": "string",
        "name": "string",
        "grouped_items": ["string (backlog_ids)"],
        "reason_for_grouping": "string (same equipment, same area, same shutdown, etc.)",
        "scheduled_date": "ISO 8601 date",
        "scheduled_shift": "enum (MORNING, AFTERNOON, NIGHT)",
        "total_duration_hours": "float",
        "assigned_team": ["string (specialty + count)"],
        "materials_status": "enum (READY, PARTIAL, NOT_READY)"
      }
    ],

    "schedule_proposal": [
      {
        "date": "ISO 8601 date",
        "shift": "enum (MORNING, AFTERNOON, NIGHT)",
        "work_packages": ["string (package_ids)"],
        "total_hours": "float",
        "utilization_percent": "float"
      }
    ],

    "alerts": [
      {
        "type": "enum (OVERDUE, MATERIAL_DELAY, RESOURCE_CONFLICT, PRIORITY_ESCALATION)",
        "message": "string",
        "affected_items": ["string (backlog_ids)"]
      }
    ]
  }
}
```

### 3.7 Work Order History (SAP PM Import Format)

```json
{
  "WorkOrderHistory": {
    "work_order_id": "string (SAP AUFNR)",
    "order_type": "enum (PM01, PM02, PM03)",
    "equipment_id": "string (SAP EQUNR)",
    "equipment_tag": "string",
    "func_loc_id": "string (SAP TPLNR)",
    "description": "string",
    "description_fr": "string",
    "priority": "enum (1, 2, 3, 4)",
    "status": "enum (CREATED, RELEASED, IN_PROGRESS, COMPLETED, CLOSED, CANCELLED)",
    "created_date": "ISO 8601 date",
    "planned_start": "ISO 8601 date",
    "planned_end": "ISO 8601 date",
    "actual_start": "ISO 8601 date | null",
    "actual_end": "ISO 8601 date | null",
    "actual_duration_hours": "float | null",
    "man_hours": "float | null",
    "problem_description": "string",
    "cause_description": "string | null",
    "solution_description": "string | null",
    "materials_consumed": [
      {
        "material_code": "string",
        "description": "string",
        "quantity": "float",
        "unit": "string"
      }
    ],
    "assigned_team": "string",
    "postponement_reason": "string | null",
    "cost_total": "float | null"
  }
}
```

### 3.8 Spare Parts / BOM

```json
{
  "SparePart": {
    "material_code": "string (SAP MATNR)",
    "description": "string",
    "description_fr": "string",
    "material_group": "string",
    "applicable_equipment": ["string (equipment_ids)"],
    "manufacturer": "string",
    "manufacturer_part_number": "string",
    "unit_of_measure": "string",
    "criticality": "enum (CRITICAL, IMPORTANT, STANDARD)",
    "lead_time_days": "int",
    "supplier": "string",
    "unit_cost_usd": "float"
  }
}
```

```json
{
  "InventoryItem": {
    "material_code": "string",
    "warehouse_id": "string",
    "warehouse_location": "string",
    "quantity_on_hand": "float",
    "quantity_reserved": "float",
    "quantity_available": "float",
    "min_stock": "float",
    "safety_stock": "float",
    "reorder_point": "float",
    "last_movement_date": "ISO 8601 date"
  }
}
```

### 3.9 Maintenance Plan (SAP PM Preventive)

```json
{
  "MaintenancePlan": {
    "plan_id": "string (SAP maintenance plan number)",
    "description": "string",
    "description_fr": "string",
    "equipment_id": "string",
    "equipment_tag": "string",
    "strategy": "enum (TIME_BASED, CONDITION_BASED, PREDICTIVE)",
    "frequency_days": "int",
    "frequency_unit": "enum (DAYS, WEEKS, MONTHS, HOURS_RUN)",
    "task_list": [
      {
        "task_id": "string",
        "description": "string",
        "description_fr": "string",
        "duration_hours": "float",
        "specialty_required": "string",
        "spare_parts": ["string (material_codes)"]
      }
    ],
    "last_execution_date": "ISO 8601 date",
    "next_execution_date": "ISO 8601 date",
    "status": "enum (ACTIVE, SUSPENDED, DELETED)"
  }
}
```

## 4. Behavioral Rules (CONFIRMED)

### 4.1 Safety-First AI (MANDATORY)
1. **AI NEVER auto-submits to SAP.** All AI outputs require explicit human validation.
2. **Planner always has final say.** AI suggests, human decides.
3. **Conservative priority:** Better to over-flag risk than under-flag.
4. **No autonomous actions:** Draft → Human Review → Approve → Execute.
5. **Audit trail:** Every AI decision must be logged with reasoning and confidence score.

### 4.2 Language Rules
1. **Trilingual support:** French (primary), English (technical), Arabic (field input).
2. **Field input:** Accept voice/text in any of the 3 languages. Auto-detect language.
3. **AI output:** Generate structured descriptions in French + English.
4. **UI:** Switchable language preference per user.
5. **Technical terms:** Always preserve SAP codes, TAGs, and part numbers as-is.

### 4.3 Data Rules
1. **Synthetic data first:** All development uses phosphate-realistic synthetic data.
2. **SAP format compliance:** All data follows SAP PM field conventions.
3. **PII redaction:** Technician names redacted before LLM processing.
4. **Immutable records:** Work requests, once validated, cannot be modified (only new versions).

### 4.4 Failure Mode Rules (MANDATORY)
1. **ALL failure modes MUST use a valid Mechanism + Cause combination from the authoritative lookup table:** `MAINTENANCE STRATEGY.../Failure Modes (Mechanism + Cause).xlsx` (SRC-09 in DOCUMENT_INDEX).
2. **There are exactly 72 valid combinations** across 18 mechanisms. No other combinations are permitted.
3. **Any agent, assistant, or code** that generates, suggests, or validates failure modes MUST validate against this table.
4. **The 18 valid mechanisms are:** Arcs, Blocks, Breaks/Fracture/Separates, Corrodes, Cracks, Degrades, Distorts, Drifts, Expires, Immobilised (binds/jams), Looses Preload, Open-Circuit, Overheats/Melts, Severs (cut/tear/hole), Short-Circuits, Thermally Overloads, Washes Off, Wears.
5. **Each mechanism has specific valid causes** — e.g., "Wears" can ONLY be caused by: Breakdown of lubrication, Entrained air, Excessive fluid velocity, Impact/shock loading, Low pressure, Lubricant contamination (particles), Mechanical overload, Metal to metal contact, Relative movement between contacting surfaces.
6. **For reliability investigations**, the table also maps "Other Mechanisms" and "Other Causes" grouped under each FM — use these for root cause analysis categorization.

### 4.5 Do-Not Rules
1. **DO NOT** auto-escalate priorities without planner confirmation.
2. **DO NOT** delete or modify historical work order data.
3. **DO NOT** send raw field input (voice/images) to external APIs without PII check.
4. **DO NOT** schedule work during production windows without explicit override.
5. **DO NOT** suggest spare parts substitutions without flagging to planner.
6. **DO NOT** create failure modes with Mechanism+Cause combinations not present in SRC-09 (Failure Modes lookup table).

## 5. Architectural Invariants

### 5.1 A.N.T. 3-Layer Architecture
- **Layer 1 (Architecture):** All SOPs in `architecture/` as Markdown
- **Layer 2 (Navigation):** Routing/decision logic — never performs complex tasks directly
- **Layer 3 (Tools):** Deterministic Python scripts in `tools/` — atomic, testable

### 5.2 Core Principles
- LLMs are probabilistic; business logic MUST be deterministic
- Update SOP before updating code (Golden Rule)
- Environment variables in `.env` only
- Intermediate files in `.tmp/` only
- Self-Annealing: Analyze -> Patch -> Test -> Update Architecture on every failure

### 5.3 Security Invariants
- PII redaction before any LLM processing (Microsoft Presidio or equivalent)
- Row-Level Security (RLS) on all database tables
- Immutable audit trails for all work orders and AI decisions
- SAP integration: read-only first, write after sandbox validation

### 5.4 MVP Technology Stack (Confirmed)

| Layer | Technology | Purpose |
|-------|-----------|---------|
| AI/NLP | Claude API (Sonnet 4) | Work request processing, classification, recommendations |
| Database | PostgreSQL (local for prototype) | Equipment, work orders, backlog, spare parts |
| Backend | Python (FastAPI) | API services, business logic |
| UI (Prototype) | Streamlit | Planner dashboard, backlog visualization |
| Data Generation | Python (Faker + domain logic) | Phosphate-realistic synthetic SAP PM data |
| SAP Integration | Mock API (JSON files) | Simulated SAP PM endpoints for MVP |
| File Storage | Local filesystem (.tmp/) | Voice transcripts, images, intermediate data |

## 6. Integration Registry

| Service | Status | API Key Location | MVP Approach |
|---------|--------|-----------------|-------------|
| SAP PM | MOCK | .env | JSON mock files simulating IW38/IW39/IP10 |
| Claude API | TO VERIFY | .env (ANTHROPIC_API_KEY) | Direct API for NLP/classification |
| PostgreSQL | TO SET UP | .env (DATABASE_URL) | Local instance for prototype |
| Deepgram | DEFERRED | - | Voice transcription (Phase 2) |
| PI System | DEFERRED | - | Real-time data (Phase 2) |

## 7. Multi-Agent Architecture (Claude Agent SDK)

### 7.1 Architecture Overview

The R8 methodology is executed by **AI agents**, not by humans using software.
The human invokes the work, agents perform the analysis (FMEA, RCM, task
generation, work packaging, SAP upload), and the human approves at 4 milestone gates.

```
Human: "Develop strategy for SAG Mill 001"
    │
    ▼
Orchestrator Agent (sonnet) ── coordinates workflow, 4 milestones
    │
    ├── Reliability Agent (opus)
    │     29 tools: criticality, RCM, FM validation, Weibull, KPI, health
    │
    ├── Planning Agent (sonnet)
    │     20 tools: backlog grouping, SAP export, work instructions, CAPA
    │
    └── Spare Parts Agent (haiku)
          3 tools: material suggestion, validation, equipment resolution
```

**Existing code (UNCHANGED)**: 15 engines, 3 validators, 1 generator, 31 Pydantic models
**New code (ADDITIVE)**: `agents/` directory — tool wrappers, agent definitions, orchestration

### 7.2 Directory Structure

```
agents/
├── __init__.py
├── run.py                          # CLI entry point
├── tool_wrappers/
│   ├── registry.py                 # @tool() decorator + TOOL_REGISTRY
│   ├── server.py                   # Unified server + AGENT_TOOL_MAP
│   ├── criticality_tools.py        # 4 tools
│   ├── rcm_tools.py                # 2 tools
│   ├── sap_tools.py                # 3 tools
│   ├── priority_tools.py           # 2 tools
│   ├── backlog_tools.py            # 5 tools
│   ├── equipment_tools.py          # 1 tool
│   ├── material_tools.py           # 2 tools
│   ├── work_instruction_tools.py   # 2 tools
│   ├── state_machine_tools.py      # 3 tools
│   ├── validation_tools.py         # 14 tools
│   ├── fm_lookup_tools.py          # 4 tools
│   ├── health_tools.py             # 2 tools
│   ├── kpi_tools.py                # 5 tools
│   ├── weibull_tools.py            # 3 tools
│   ├── variance_tools.py           # 3 tools
│   ├── capa_tools.py               # 7 tools
│   └── management_review_tools.py  # 1 tool
├── definitions/
│   ├── base.py                     # Agent class + agentic tool-use loop
│   ├── orchestrator.py             # OrchestratorAgent + delegation
│   ├── reliability.py              # Reliability Engineer (opus)
│   ├── planning.py                 # Planning Specialist (sonnet)
│   ├── spare_parts.py              # Spare Parts Specialist (haiku)
│   └── prompts/
│       ├── orchestrator_prompt.md
│       ├── reliability_prompt.md
│       ├── planning_prompt.md
│       └── spare_parts_prompt.md
└── orchestration/
    ├── session_state.py            # SessionState accumulator
    ├── milestones.py               # MilestoneGate + 4 definitions
    └── workflow.py                 # StrategyWorkflow + human gates
```

### 7.3 Four Milestone Gates

| # | Milestone | Agents | Human Reviews |
|---|-----------|--------|--------------|
| 1 | Hierarchy Decomposition | Reliability | Equipment breakdown (6 levels), criticality |
| 2 | FMEA Completion | Reliability | Failure modes (72-combo validated), RCM paths |
| 3 | Strategy + Tasks + Resources | Reliability + Planning + Spare Parts | Tasks, WPs, materials, work instructions |
| 4 | SAP Upload Package | Planning | Maintenance Item + Task List + Work Plan (DRAFT) |

Gate flow: `PENDING → IN_PROGRESS → PRESENTED → APPROVED / MODIFIED / REJECTED`

At each gate the Orchestrator runs `run_full_validation` (40+ quality rules),
presents results with error/warning/info counts, and waits for human action.

### 7.4 Agent-to-Tool Mapping (62 tools total)

| Agent | Model | # Tools | Key Tool Categories |
|-------|-------|---------|-------------------|
| Orchestrator | sonnet | 6 | `run_full_validation`, `evaluate_confidence`, `validate_state_transition` |
| Reliability | opus | 29 | criticality, RCM, FM 72-combo, priority, health, KPI, Weibull, variance |
| Planning | sonnet | 20 | backlog grouping, SAP export, work instructions, CAPA, naming validation |
| Spare Parts | haiku | 3 | `suggest_materials`, `validate_task_materials`, `resolve_equipment` |

### 7.5 Safety-First Rules (Agent Layer)

1. **NEVER skip validation** — `run_full_validation` before every milestone gate
2. **NEVER auto-submit to SAP** — all outputs are DRAFT until human approves
3. **NEVER proceed past a gate without human approval**
4. **NEVER create a failure mode without 72-combo validation** (`validate_fm_combination`)
5. **Flag low-confidence items** — `evaluate_confidence` for all AI-generated data
6. **T-16 rule**: REPLACE tasks MUST have materials assigned

### 7.6 CLI Usage

```bash
python -m agents.run "SAG Mill 001" --plant OCP-JFC
python -m agents.run "Ball Mill BM-201" --plant OCP-BEN --output session.json
```

## 8. Module 4: Maintenance Strategy Development — Discovery Answers

| # | Question | Answer |
|---|----------|--------|
| 8 | Alcance | Flujo completo: Jerarquía → Criticidad → FMEA → Estrategia → Tareas → Work Packages → SAP Upload |
| 9 | Librerías | Con IA: Component + Equipment Libraries con sugerencia automática de descomposición |
| 10 | Rol de IA | Auto-completador: IA genera draft completo, ingeniero revisa y ajusta |
| 11 | Materiales | Integrado: catálogo de materiales dentro del módulo de estrategia |

## 9. Data Schemas — Module 4: Strategy Development

### 9.1 Component Library Item (Generic Reusable)

```json
{
  "ComponentLibraryItem": {
    "component_lib_id": "UUID",
    "name": "string (e.g., 'Centrifugal Pump, Slurry Service')",
    "code": "string (unique library code)",
    "component_category": "enum (MECHANICAL, ELECTRICAL, INSTRUMENTATION, STRUCTURAL, HYDRAULIC, PNEUMATIC)",
    "description": "string",
    "description_fr": "string",
    "typical_manufacturers": ["string"],
    "functions": ["Function"],
    "failure_modes": ["FailureMode"],
    "default_tasks": ["MaintenanceTask"],
    "tags": ["string (searchable tags: 'pump', 'slurry', 'centrifugal')"],
    "source": "enum (R8_LIBRARY, OEM, CUSTOM, AI_GENERATED)",
    "version": "int",
    "locked": "boolean",
    "created_at": "ISO 8601 datetime",
    "updated_at": "ISO 8601 datetime"
  }
}
```

### 9.2 Equipment Library Item (Composed from Components)

```json
{
  "EquipmentLibraryItem": {
    "equipment_lib_id": "UUID",
    "name": "string (Make - Model - Context, e.g., 'Warman 750 VK - SHD Pump - Slurry Service')",
    "code": "string (unique library code)",
    "equipment_category": "enum (PUMP, CONVEYOR, CRUSHER, MILL, FLOTATION_CELL, THICKENER, DRYER, KILN, MOTOR, TRANSFORMER, COMPRESSOR, VALVE, TANK, FILTER, AGITATOR, OTHER)",
    "make": "string",
    "model": "string",
    "operational_context": "string (e.g., 'Slurry Service', 'Water Service', 'Acid Service')",
    "description": "string",
    "description_fr": "string",
    "sub_assemblies": [
      {
        "sub_assembly_id": "UUID",
        "name": "string (e.g., 'Mechanical System', 'Electrical System', 'Drive System')",
        "order": "int",
        "components": [
          {
            "instance_id": "UUID",
            "component_lib_ref": "UUID (→ ComponentLibraryItem)",
            "instance_name": "string (contextualized name, e.g., 'Drive End Bearing')",
            "quantity": "int (default 1)",
            "is_maintainable_item": "boolean"
          }
        ]
      }
    ],
    "source": "enum (R8_LIBRARY, OEM, CUSTOM, AI_GENERATED)",
    "version": "int",
    "locked": "boolean",
    "created_at": "ISO 8601 datetime",
    "updated_at": "ISO 8601 datetime"
  }
}
```

### 9.3 Plant Hierarchy Node (Site-Specific)

```json
{
  "PlantHierarchyNode": {
    "node_id": "UUID",
    "node_type": "enum (PLANT, AREA, SYSTEM, EQUIPMENT, SUB_ASSEMBLY, MAINTAINABLE_ITEM)",
    "name": "string",
    "name_fr": "string",
    "code": "string (SAP functional location or equipment code)",
    "parent_node_id": "UUID | null",
    "level": "int (1=Plant, 2=Area, 3=System, 4=Equipment, 5=Sub-Assembly, 6=MI)",
    "equipment_lib_ref": "UUID | null (→ EquipmentLibraryItem, for equipment nodes)",
    "component_lib_ref": "UUID | null (→ ComponentLibraryItem, for MI nodes)",
    "sap_func_loc": "string | null (SAP TPLNR)",
    "sap_equipment_nr": "string | null (SAP EQUNR)",
    "tag": "string | null (technical TAG)",
    "criticality": "CriticalityAssessment | null",
    "status": "enum (ACTIVE, INACTIVE, DECOMMISSIONED)",
    "order": "int (display order among siblings)",
    "metadata": {
      "manufacturer": "string | null",
      "model": "string | null",
      "serial_number": "string | null",
      "installation_date": "ISO 8601 date | null",
      "power_kw": "number | null",
      "weight_kg": "number | null",
      "operational_hours": "number | null"
    }
  }
}
```

### 9.4 Criticality Assessment

```json
{
  "CriticalityAssessment": {
    "assessment_id": "UUID",
    "node_id": "UUID (→ PlantHierarchyNode)",
    "assessed_at": "ISO 8601 datetime",
    "assessed_by": "string",
    "method": "enum (FULL_MATRIX, SIMPLIFIED)",
    "criteria_scores": [
      {
        "category": "enum (SAFETY, HEALTH, ENVIRONMENT, PRODUCTION, OPERATING_COST, CAPITAL_COST, SCHEDULE, REVENUE, COMMUNICATIONS, COMPLIANCE, REPUTATION)",
        "consequence_level": "int (1-5)",
        "comments": "string | null"
      }
    ],
    "probability": "int (1-5)",
    "overall_score": "float (auto-calculated)",
    "risk_class": "enum (I_LOW, II_MEDIUM, III_HIGH, IV_CRITICAL)",
    "ai_suggested_class": "enum (I_LOW, II_MEDIUM, III_HIGH, IV_CRITICAL) | null",
    "ai_justification": "string | null",
    "status": "enum (DRAFT, REVIEWED, APPROVED)"
  }
}
```

### 9.5 Function

```json
{
  "Function": {
    "function_id": "UUID",
    "node_id": "UUID (→ PlantHierarchyNode or ComponentLibraryItem)",
    "function_type": "enum (PRIMARY, SECONDARY, PROTECTIVE)",
    "description": "string (Verb + Noun + Performance Standard)",
    "description_fr": "string",
    "performance_standard": "string | null",
    "functional_failures": ["FunctionalFailure"],
    "ai_generated": "boolean",
    "status": "enum (DRAFT, REVIEWED, APPROVED)"
  }
}
```

### 9.6 Functional Failure

```json
{
  "FunctionalFailure": {
    "failure_id": "UUID",
    "function_id": "UUID (→ Function)",
    "failure_type": "enum (TOTAL, PARTIAL)",
    "description": "string",
    "description_fr": "string",
    "failure_modes": ["FailureMode"]
  }
}
```

### 9.7 Failure Mode

```json
{
  "FailureMode": {
    "failure_mode_id": "UUID",
    "functional_failure_id": "UUID (→ FunctionalFailure)",
    "status": "enum (RECOMMENDED, REDUNDANT)",
    "what": "string (sub-component, capital letter, singular)",
    "mechanism": "enum — MUST be one of the 18 mechanisms from SRC-09: ARCS, BLOCKS, BREAKS_FRACTURE_SEPARATES, CORRODES, CRACKS, DEGRADES, DISTORTS, DRIFTS, EXPIRES, IMMOBILISED, LOOSES_PRELOAD, OPEN_CIRCUIT, OVERHEATS_MELTS, SEVERS, SHORT_CIRCUITS, THERMALLY_OVERLOADS, WASHES_OFF, WEARS",
    "cause": "string — MUST be a valid cause for the selected mechanism per SRC-09 lookup table (72 valid Mechanism+Cause combinations). See §4.4 and 'Failure Modes (Mechanism + Cause).xlsx'",
    "failure_pattern": "enum (A_BATHTUB, B_AGE, C_FATIGUE, D_STRESS, E_RANDOM, F_EARLY_LIFE) | null",
    "failure_consequence": "enum (HIDDEN_SAFETY, HIDDEN_NONSAFETY, EVIDENT_SAFETY, EVIDENT_ENVIRONMENTAL, EVIDENT_OPERATIONAL, EVIDENT_NONOPERATIONAL)",
    "is_hidden": "boolean",
    "failure_effect": {
      "evidence": "string (what operator sees/hears/feels)",
      "safety_threat": "string | null",
      "environmental_threat": "string | null",
      "production_impact": "string | null",
      "physical_damage": "string | null",
      "repair_description": "string | null",
      "estimated_downtime_hours": "float | null"
    },
    "strategy_type": "enum (CONDITION_BASED, FIXED_TIME, RUN_TO_FAILURE, FAULT_FINDING, REDESIGN, OEM)",
    "primary_task": "MaintenanceTask",
    "secondary_task": "MaintenanceTask | null (required for CB/FFI)",
    "ai_generated": "boolean",
    "ai_confidence": "float | null",
    "existing_task_source": "string | null (R8 Library, MSO, OEM, Workshop)",
    "justification_category": "enum (MODIFIED, ELIMINATED, FREQUENCY_CHANGE, TACTIC_CHANGE, MAINTAINED, NEW_TASK) | null"
  }
}
```

### 9.8 Maintenance Task

```json
{
  "MaintenanceTask": {
    "task_id": "UUID",
    "name": "string (standardized: 'Inspect [what] for [evidence]', max 72 chars)",
    "name_fr": "string",
    "task_type": "enum (INSPECT, CHECK, TEST, LUBRICATE, CLEAN, REPLACE, REPAIR, CALIBRATE)",
    "is_secondary": "boolean",
    "acceptable_limits": "string | null (required for CB/FFI)",
    "conditional_comments": "string | null",
    "consequences": "string (what happens if not performed)",
    "justification": "string | null",
    "constraint": "enum (ONLINE, OFFLINE, TEST_MODE)",
    "access_time_hours": "float (0 for online)",
    "frequency_value": "float",
    "frequency_unit": "enum (HOURS, DAYS, WEEKS, MONTHS, YEARS, OPERATING_HOURS, TONNES, CYCLES)",
    "origin": "string | null (OEM, Statutory, Library, Workshop)",
    "budget_type": "enum (REPAIR, REPLACE) | null (secondary tasks only)",
    "budgeted_life": "float | null (secondary tasks only)",
    "labour_resources": [
      {
        "specialty": "enum (FITTER, ELECTRICIAN, INSTRUMENTIST, OPERATOR, CONMON_SPECIALIST, LUBRICATOR)",
        "quantity": "int",
        "hours_per_person": "float",
        "hourly_rate": "float | null"
      }
    ],
    "material_resources": [
      {
        "material_code": "string | null (SAP MATNR)",
        "description": "string",
        "part_number": "string | null",
        "stock_code": "string | null",
        "quantity": "float",
        "unit_of_measure": "enum (EA, L, KG, M)",
        "unit_price": "float | null"
      }
    ],
    "tools": ["string"],
    "special_equipment": ["string (crane, scaffold, etc.)"],
    "ai_generated": "boolean",
    "ai_confidence": "float | null",
    "status": "enum (DRAFT, REVIEWED, APPROVED)"
  }
}
```

### 9.9 Work Package

```json
{
  "WorkPackage": {
    "work_package_id": "UUID",
    "name": "string (max 40 chars, ALL CAPS, format: [FREQ] [ASSET] [TRADE] [TYPE] [CONSTRAINT])",
    "code": "string (unique identifier)",
    "node_id": "UUID (→ PlantHierarchyNode, equipment level)",
    "frequency_value": "float",
    "frequency_unit": "enum (HOURS, DAYS, WEEKS, MONTHS, YEARS, OPERATING_HOURS, TONNES, CYCLES)",
    "constraint": "enum (ONLINE, OFFLINE)",
    "access_time_hours": "float",
    "work_package_type": "enum (STANDALONE, SUPPRESSIVE, SEQUENTIAL)",
    "job_preparation": "string | null (pre-task notes)",
    "post_shutdown": "string | null (post-task notes)",
    "allocated_tasks": [
      {
        "task_id": "UUID (→ MaintenanceTask)",
        "order": "int (execution sequence)",
        "operation_number": "int (SAP: 10, 20, 30...)"
      }
    ],
    "labour_summary": {
      "total_hours": "float",
      "by_specialty": [{"specialty": "string", "hours": "float", "people": "int"}]
    },
    "material_summary": [
      {"material_code": "string", "description": "string", "quantity": "float"}
    ],
    "sap_upload": {
      "maintenance_item_ref": "string | null",
      "task_list_ref": "string | null",
      "work_plan_ref": "string | null"
    },
    "status": "enum (DRAFT, REVIEWED, APPROVED, UPLOADED_TO_SAP)"
  }
}
```

### 9.10 SAP Upload Package (Generated Output)

```json
{
  "SAPUploadPackage": {
    "package_id": "UUID",
    "generated_at": "ISO 8601 datetime",
    "plant_code": "string (SAP IWERK)",
    "maintenance_plan": {
      "plan_id": "string",
      "description": "string",
      "category": "string (PM)",
      "cycle_value": "int",
      "cycle_unit": "string (DAY/WK/MON/YR)",
      "call_horizon_pct": "int",
      "scheduling_period": "int",
      "scheduling_unit": "string"
    },
    "maintenance_items": [
      {
        "item_ref": "string ($MI1, $MI2...)",
        "description": "string",
        "order_type": "string (PM03)",
        "func_loc": "string (SAP TPLNR)",
        "main_work_center": "string",
        "planner_group": "int",
        "task_list_ref": "string ($TL1, $TL2...)",
        "priority": "string"
      }
    ],
    "task_lists": [
      {
        "list_ref": "string ($TL1)",
        "description": "string",
        "func_loc": "string",
        "system_condition": "int (1=running, 3=stopped)",
        "operations": [
          {
            "operation_number": "int (10, 20, 30...)",
            "work_centre": "string",
            "control_key": "string (PMIN)",
            "short_text": "string (max 72 chars)",
            "duration_hours": "float",
            "unit": "string (H)",
            "num_workers": "int"
          }
        ]
      }
    ],
    "status": "enum (GENERATED, REVIEWED, APPROVED, UPLOADED)"
  }
}
```

## 10. GECAMIN Extensions — Strategic Recommendation Implementations

### 10.1 Asset Health Score (REF-12 Rec 4, GECAMIN S6: SQM validated)

```json
{
  "AssetHealthScore": {
    "score_id": "UUID",
    "node_id": "string (→ PlantHierarchyNode)",
    "plant_id": "string",
    "equipment_tag": "string",
    "calculated_at": "ISO 8601 datetime",
    "dimensions": [
      {
        "dimension": "enum (CRITICALITY, BACKLOG_PRESSURE, STRATEGY_COVERAGE, CONDITION_STATUS, EXECUTION_COMPLIANCE)",
        "score": "float (0-100)",
        "weight": "float (0-1, default 0.2)",
        "raw_value": "float | null",
        "details": "string"
      }
    ],
    "composite_score": "float (0-100, auto-calculated)",
    "health_class": "string (HEALTHY ≥75, AT_RISK ≥50, CRITICAL <50, UNKNOWN)",
    "trend": "enum (IMPROVING, STABLE, DEGRADING)",
    "recommendations": ["string"]
  }
}
```

### 10.2 KPI Metrics (REF-12 Rec 8, ISO 55002 §9.1)

```json
{
  "KPIMetrics": {
    "metrics_id": "UUID",
    "plant_id": "string",
    "equipment_id": "string | null",
    "period_start": "ISO 8601 date",
    "period_end": "ISO 8601 date",
    "mtbf_days": "float | null (Mean Time Between Failures)",
    "mttr_hours": "float | null (Mean Time To Repair)",
    "availability_pct": "float | null (0-100%)",
    "oee_pct": "float | null (Overall Equipment Effectiveness, 0-100%)",
    "schedule_compliance_pct": "float | null (0-100%)",
    "pm_compliance_pct": "float | null (Preventive Maintenance compliance, 0-100%)",
    "reactive_ratio_pct": "float | null (corrective / total WOs, 0-100%)",
    "total_work_orders": "int",
    "corrective_wo_count": "int",
    "preventive_wo_count": "int"
  }
}
```

### 10.3 Weibull Failure Prediction (REF-12 Rec 6, GECAMIN S3/S7)

```json
{
  "FailurePrediction": {
    "prediction_id": "UUID",
    "equipment_id": "string",
    "equipment_tag": "string",
    "predicted_at": "ISO 8601 datetime",
    "weibull_params": {
      "beta": "float (>0, shape: >1=wear-out, <1=early-life, =1=random)",
      "eta": "float (>0, characteristic life in days)",
      "gamma": "float (≥0, failure-free period)",
      "r_squared": "float (0-1, goodness of fit)",
      "sample_size": "int"
    },
    "current_age_days": "float",
    "reliability_current": "float (0-1, R(t) at current age)",
    "predicted_failure_window_days": "float (days until predicted failure)",
    "confidence_level": "float (0.5-0.99)",
    "risk_score": "float (0-100)",
    "failure_pattern": "enum (A_BATHTUB, B_AGE, C_FATIGUE, D_STRESS, E_RANDOM, F_EARLY_LIFE)",
    "recommendation": "string",
    "status": "enum (DRAFT, REVIEWED, APPROVED) — ALWAYS starts as DRAFT (safety-first)"
  }
}
```

### 10.4 Plant Variance Alert (REF-12 Rec 7)

```json
{
  "PlantVarianceAlert": {
    "alert_id": "UUID",
    "plant_id": "string",
    "plant_name": "string",
    "metric_name": "string",
    "plant_value": "float",
    "portfolio_mean": "float",
    "portfolio_std": "float",
    "z_score": "float",
    "variance_level": "enum (NORMAL, WARNING ≥2σ, CRITICAL ≥3σ)",
    "detected_at": "ISO 8601 datetime",
    "message": "string"
  }
}
```

### 10.5 CAPA Item (REF-12 Rec 8, ISO 55002 §10.2)

```json
{
  "CAPAItem": {
    "capa_id": "UUID",
    "capa_type": "enum (CORRECTIVE, PREVENTIVE)",
    "title": "string",
    "description": "string",
    "plant_id": "string",
    "equipment_id": "string | null",
    "source": "string (audit, incident, variance, review)",
    "root_cause": "string | null",
    "current_phase": "enum (PLAN, DO, CHECK, ACT)",
    "status": "enum (OPEN, IN_PROGRESS, CLOSED, VERIFIED)",
    "assigned_to": "string",
    "target_date": "ISO 8601 date | null",
    "actions_planned": ["string"],
    "actions_completed": ["string"],
    "effectiveness_verified": "boolean",
    "lessons_learned": "string | null"
  }
}
```

### 10.6 Management Review Summary (REF-12 Rec 8, ISO 55002 §9.3)

```json
{
  "ManagementReviewSummary": {
    "review_id": "UUID",
    "plant_id": "string",
    "period_start": "ISO 8601 date",
    "period_end": "ISO 8601 date",
    "kpi_summary": "KPIMetrics | null",
    "health_scores": ["AssetHealthScore"],
    "avg_health_score": "float (0-100)",
    "variance_alerts": ["PlantVarianceAlert"],
    "open_capas": "int",
    "overdue_capas": "int",
    "health_trend": "enum (IMPROVING, STABLE, DEGRADING)",
    "kpi_trends": {"metric_name": "IMPROVING | STABLE | DEGRADING"},
    "key_findings": ["string"],
    "recommended_actions": ["string"]
  }
}
```

## 11. Neuro-Architecture Extensions — Behavioral Science Models

### 11.1 Expert Card (Pillar 2: TMS + ISO 55002 §4.2)

```json
{
  "ExpertCard": {
    "expert_id": "UUID",
    "user_id": "string",
    "name": "string",
    "role": "enum (MAINTENANCE_MANAGER, RELIABILITY_ENGINEER, PLANNER, TECHNICIAN, OPERATOR, PLANT_MANAGER, SAFETY_OFFICER, PROCUREMENT)",
    "plant_id": "string",
    "domains": ["enum (RELIABILITY, MECHANICAL, ELECTRICAL, INSTRUMENTATION, PROCESS, SAFETY, PLANNING, SPARE_PARTS)"],
    "equipment_expertise": ["string (equipment TAGs)"],
    "certifications": ["string"],
    "years_experience": "int",
    "resolution_count": "int",
    "languages": ["enum (fr, en, ar)"]
  }
}
```

### 11.2 Ipsative Feedback (Pillar 5: Psychological Safety)

```json
{
  "IpsativeFeedback": {
    "feedback_id": "UUID",
    "user_id": "string",
    "metric_name": "string",
    "current_value": "float",
    "previous_value": "float",
    "improvement_pct": "float (auto-calculated)",
    "period": "string (this_week, this_month)",
    "message": "string"
  }
}
```

### 11.3 Completion Progress (Pillar 6: Behavioral Nudges — Zeigarnik effect)

```json
{
  "CompletionProgress": {
    "entity_type": "string (Strategy, FMEA, WorkPackage)",
    "entity_id": "string",
    "entity_name": "string",
    "total_steps": "int (≥1)",
    "completed_steps": "int (≤ total_steps)",
    "completion_pct": "float (0-100, auto-calculated)",
    "remaining_items": ["string"],
    "next_action": "string"
  }
}
```

## 12. Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-02-20 | Initial creation — awaiting Discovery | System Pilot |
| 2026-02-20 | Discovery Questions answered. Schemas defined. Blueprint phase. | System Pilot |
| 2026-02-20 | Module 4 added: Maintenance Strategy Development (full RCM flow + libraries + IA auto-completador). 10 new schemas added. | System Pilot |
| 2026-02-20 | GECAMIN extensions: 6 new engines (HealthScore, KPI, Weibull, Variance, CAPA, ManagementReview) + 3 Neuro-Architecture models (ExpertCard, IpsativeFeedback, CompletionProgress). Total: 15 engines, 30+ schemas, 428 tests. | System |
| 2026-02-20 | Multi-agent architecture (§7): 4 agents (Orchestrator, Reliability, Planning, Spare Parts), 62 MCP tool wrappers, 4-milestone workflow with human gates, orchestration layer. New tests: 104 (total: 532). | System |
| 2026-02-21 | GFSN methodology integration: 5 reference documents (REF-13 to REF-17), 20-gap analysis, Phase 4A engines (RCA, planning KPI, DE KPI, FMECA, GFSN criticality/priority modes), Phase 4B engines (scheduling, execution tasks, work package assembly), Phase 5 engines (jackknife, pareto, LCC, RBI, OCR, MoC, shutdown, spare parts). Full API backend (17 routers, 21 services, 28+ DB models), Streamlit UI (16 pages). Total: 36 engines, 1071 tests. | System |
| 2026-02-22 | Phase 8 completion: RCA/DE full stack (3 DB models, API service+router, Streamlit page with 4 tabs, 12 API client functions). Planning KPI snapshots and DE KPI snapshots with history tracking. 14 new API tests. Total: 17 API routers, 17 Streamlit pages, 1085 tests. | System |
