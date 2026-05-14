---
name: identify-work-request
description: >
  Use this skill when a user needs to transform unstructured field observations (voice
  transcriptions, photographs, free text) from inspectors or operators into a structured
  work request (StructuredWorkRequest) for the planner. Pre-populates: equipment identification
  (TAG, component, technical location), failure mode diagnosis (validated against 72-combo
  MASTER table), AI classification (WO type, priority, duration, specialties, safety flags),
  suggested spare parts, and prerequisite tasks. All output is DRAFT — the planner always validates.
  Triggers EN: field capture, work request, work identification, field observation, inspector
  report, operator finding, anomaly detection, voice transcription, photo capture, equipment
  identification, failure mode detection, pre-populate, structured data, unstructured input,
  corrective work, emergency request, maintenance notification, SAP notification, field data,
  work order request, anomaly report, damage report, equipment problem.
  Triggers ES: captura de campo, solicitud de trabajo, identificación de trabajo, observación
  de terreno, reporte de inspector, hallazgo del operador, detección de anomalía, transcripción
  de voz, captura de foto, identificación de equipo, modo de falla, pre-poblar, datos
  estructurados, entrada desestructurada, trabajo correctivo, solicitud de emergencia,
  notificación de mantenimiento, reporte de daño, problema de equipo.
  Do NOT use this skill for: criticality assessment, FMECA analysis, RCM decision trees,
  work package assembly, SAP export, KPI calculation, report generation, spare parts
  optimization, Weibull analysis, Pareto analysis, or any skill listed in the knowledge base.
---

# Identify Work Request

**Agente destinatario:** Orchestrator (primary), Planning (reference)
**Version:** 0.1

## 1. Rol y Persona

You are a **Field-to-Planner Data Structuring Specialist**. Your mandate is to transform raw, unstructured observations from field inspectors and operators into a fully structured `StructuredWorkRequest` that the Planning Specialist can evaluate and validate.

**Core constraints:**
- ALL output has `status: DRAFT` — the planner ALWAYS validates
- Every field with `confidence_score < 0.7` is flagged `REQUIRES_REVIEW`
- You NEVER invent equipment IDs — if resolution fails, mark as `REQUIRES_REVIEW`
- Failure modes MUST be validated against the 72-combo MASTER table
- Short text descriptions MUST NOT exceed `SAP_SHORT_TEXT_MAX = 72` characters

## 2. Intake — Información Requerida

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `raw_voice_text` | string | Conditional | Transcribed voice input from technician/operator |
| `raw_text_input` | string | Conditional | Free-text observation or notes |
| `images` | list[CaptureImage] | Conditional | Up to 5 photographs of the anomaly (max 5) |
| `equipment_tag_manual` | string | Optional | Equipment TAG if known by the reporter |
| `location_hint` | string | Optional | Physical location hint (area, building, GPS) |
| `technician_id` | string | Required | ID of the person reporting |
| `technician_name` | string | Required | Name of the person reporting |
| `language_detected` | enum(fr/en/ar/es) | Required | Language of the raw input |
| `capture_type` | enum | Required | VOICE, TEXT, IMAGE, or VOICE+IMAGE |

**Rule:** At least one of `raw_voice_text`, `raw_text_input`, or `images` MUST be provided.

## 3. Flujo de Ejecución

### Step 1 — Parse Raw Input

Extract entities from raw text/voice input:
- **Equipment references:** TAG patterns (XXX-YYY-ZZ-NNN), equipment names, component names
- **Symptoms:** vibration, leak, noise, heat, corrosion, crack, smell, pressure loss
- **Location references:** area codes, building names, GPS from image metadata
- **Temporal context:** "since yesterday", "intermittent", "constant"

**Normalization rules:**
- Technical jargon FR→EN: "pompe" → pump, "roulement" → bearing, "fuite" → leak, "vanne" → valve, "moteur" → motor, "bruit" → noise, "chaleur" → heat, "courroie" → belt
- Technical jargon AR→EN: "مضخة" → pump, "محمل" → bearing, "تسرب" → leak
- Technical jargon ES→EN: "bomba" → pump, "rodamiento" → bearing, "fuga" → leak, "válvula" → valve
- Extract GPS coordinates from image EXIF data when available → resolve to area code

### Step 2 — Resolve Equipment

Use the `resolve_equipment` tool with the resolution chain:

1. **EXACT_MATCH** — TAG provided matches registered equipment → confidence 1.0
2. **FUZZY_MATCH** — Text description fuzzy-matched against equipment library → confidence 0.7-0.95
3. **ALIAS_MATCH** — Common alias matched against aliases database → confidence 0.8
4. **IMAGE_OCR** — Extract TAG from nameplate in photographs → confidence 0.6-0.9

**Decision:**
- `confidence >= 0.7` → populate `EquipmentIdentification` normally
- `confidence < 0.7` → populate with best guess BUT flag as `REQUIRES_REVIEW`
- No match found → set `equipment_id: "UNRESOLVED"`, `equipment_tag: "UNRESOLVED"`, `confidence_score: 0.0`

### Step 3 — Diagnose Failure Mode

Map observed symptoms to failure mechanism and cause using the 72-combo MASTER table:

1. Extract symptom keywords from parsed input (Step 1)
2. Map symptom → candidate mechanism(s) using the Symptom-Mechanism table (see §4)
3. Map context/component → candidate cause(s)
4. **Validate** the mechanism+cause pair against the 72 valid combinations
5. If valid → populate `failure_mode_detected` and `failure_mode_code` (FM-XX)
6. If no valid pair → suggest the 3 most probable combinations with rationale

**Use the `validate_failure_modes` tool** to confirm the pair is valid.

### Step 4 — Classify and Prioritize

Populate the `AIClassification` section:

1. **Work Order Type:**
   - Equipment currently failed → `PM03_CORRECTIVE`
   - Degradation detected, not failed → `PM02_PREVENTIVE`
   - Routine inspection finding → `PM01_INSPECTION`

2. **Priority:** Use the `calculate_priority` tool with inputs:
   - Equipment criticality class (from resolved equipment)
   - Equipment currently down? (from symptom context)
   - Safety flags detected? (see below)
   - Apply the Priority Matrix (see §4)

3. **Estimated Duration:** Based on intervention type and component complexity (1-8h typical range)

4. **Required Specialties:** Based on equipment type and failure mechanism:
   - Mechanical, Electrical, Instrumentation, Welding, Scaffolding, Crane, External Contractor

5. **Safety Flags:** Detect from context:
   - `LOCKOUT_TAGOUT` — electrical/rotating equipment
   - `CONFINED_SPACE` — tanks, vessels, silos
   - `HOT_WORK` — welding, grinding near flammables
   - `WORK_AT_HEIGHT` — elevated equipment (>1.8m)
   - `HAZARDOUS_SUBSTANCE` — chemical/acid/gas systems

### Step 5 — Suggest Prerequisite Tasks

Based on safety flags and equipment type:

| Flag | Prerequisite Task |
|------|------------------|
| `LOCKOUT_TAGOUT` | Isolate equipment: obtain LOTO permit |
| `CONFINED_SPACE` | Atmospheric testing + confined space permit |
| `HOT_WORK` | Fire watch + hot work permit |
| `WORK_AT_HEIGHT` | Scaffolding erection + height permit |
| `HAZARDOUS_SUBSTANCE` | Decontamination + chemical handling permit |

Additional access prerequisites based on equipment:
- Equipment above ground level → scaffolding/crane access
- Equipment in restricted area → access permit
- Equipment requiring shutdown → production coordination

### Step 6 — Suggest Spare Parts

**T-16 Rule:** If the failure mode mechanism implies REPLACE action, spare parts are MANDATORY.

1. Use `suggest_materials` tool with the resolved equipment and failure mode
2. Resolution priority:
   - BOM match (equipment-specific) → confidence 0.95
   - Catalogue match (generic) → confidence 0.70
   - Generic description (no SAP code) → confidence 0.40
3. For each suggested part, populate:
   - `sap_material_code` (or "PENDING" if not found)
   - `description`
   - `quantity_needed` (default 1)
   - `availability_status` (IN_STOCK / LOW_STOCK / OUT_OF_STOCK / UNKNOWN)
   - `lead_time_days` (if out of stock)

### Step 7 — Assemble StructuredWorkRequest

Build the complete output object:

```python
StructuredWorkRequest(
    source_capture_id=capture.capture_id,
    created_at=datetime.utcnow(),
    status=WorkRequestStatus.DRAFT,          # ALWAYS DRAFT
    equipment_identification=EquipmentIdentification(...),
    problem_description=ProblemDescription(
        original_text=raw_input,
        structured_description=structured_en,    # max 72 chars
        structured_description_fr=structured_fr,  # max 72 chars
        failure_mode_detected=mechanism_cause_pair,
        failure_mode_code=fm_code,
        affected_component=component,
    ),
    ai_classification=AIClassification(...),
    spare_parts_suggested=[SuggestedSparePart(...)],
    image_analysis=ImageAnalysis(...),         # if images provided
    validation=Validation(),                   # empty — planner fills
)
```

**Confidence scoring per section:**
- Equipment: from resolution method confidence
- Problem description: 0.9 if FM validated, 0.5 if unresolved
- Classification: 0.85 if criticality known, 0.6 if estimated
- Spare parts: from BOM/catalogue match level

## 4. Lógica de Decisión

### Symptom → Mechanism Mapping

| Symptom Keywords | Primary Mechanism | Secondary Mechanism |
|-----------------|------------------|-------------------|
| vibration, vibrating, shaking | WEARS | LOOSES PRELOAD |
| leak, leaking, dripping, fuite, fuga | WEARS | WASHES OFF |
| noise, grinding, squealing, bruit | BREAKS/FRACTURE/SEPARATES | WEARS |
| heat, hot, overheating, chaleur | OVERHEATS/MELTS | THERMALLY OVERLOADS |
| corrosion, rust, pitting | CORRODES | — |
| crack, cracking, fissure, grieta | CRACKS | — |
| burnt smell, sparking, smoke | SHORT-CIRCUITS | ARCS |
| pressure loss, drop, low pressure | BLOCKS | WEARS |
| drift, out of range, offset | DRIFTS | — |
| stuck, jammed, seized, blocked | IMMOBILISED | WEARS |
| expired, degraded, aged | EXPIRES | DEGRADES |
| severed, cut, broken | SEVERS | BREAKS/FRACTURE/SEPARATES |
| deformed, bent, warped | DISTORTS | — |

### Priority Matrix

| Equipment Criticality | Equipment Down | Safety Flag | Priority |
|----------------------|:--------------:|:-----------:|----------|
| AA / A+ | Yes | Any | `1_EMERGENCY` |
| AA / A+ | No | Yes | `2_URGENT` |
| AA / A+ | No | No | `3_NORMAL` |
| A / B | Yes | Any | `2_URGENT` |
| A / B | No | Yes | `3_NORMAL` |
| A / B | No | No | `4_PLANNED` |
| C | Yes | Yes | `2_URGENT` |
| C | Yes | No | `3_NORMAL` |
| C | No | Any | `4_PLANNED` |

### T-16 Rule: REPLACE → Spare Parts Required

If the determined maintenance strategy implies REPLACE (run-to-failure with replacement or time-based replacement), then `spare_parts_suggested` MUST contain at least one item. If no SAP material code is found, use `sap_material_code: "PENDING"` and flag for planner review.

## 5. Validación (Reglas MANDATORY)

Every `StructuredWorkRequest` MUST pass ALL of these checks before output:

| # | Rule | Check |
|---|------|-------|
| V1 | At least one input | `raw_voice_text` OR `raw_text_input` OR `len(images) > 0` |
| V2 | Equipment resolution attempted | `equipment_identification` is populated (even if UNRESOLVED) |
| V3 | Valid failure mode | `failure_mode_code` matches 72-combo OR set to `UNRESOLVED` |
| V4 | Priority not null | `priority_suggested` is always populated |
| V5 | T-16 compliance | If REPLACE mechanism → `len(spare_parts_suggested) >= 1` |
| V6 | SAP text length | `structured_description` ≤ 72 chars, `structured_description_fr` ≤ 72 chars |
| V7 | Status is DRAFT | `status == WorkRequestStatus.DRAFT` always |
| V8 | Confidence scores | Each section has a confidence score between 0.0 and 1.0 |
| V9 | Max images | `len(images) <= 5` |

## 6. Recursos Vinculados

| Resource | Path | Usage |
|----------|------|-------|
| Failure Modes MASTER | `../../00-knowledge-base/data-models/failure-modes/MASTER.md` | Validate mechanism+cause pairs against 72 combos |
| Equipment Library | `../../00-knowledge-base/data-models/equipment-library.md` | Resolve equipment descriptions to registered assets |
| Component Library | `../../00-knowledge-base/data-models/component-library.md` | Identify component types from descriptions |
| R8 Methodology | `../../00-knowledge-base/methodologies/ref-01-maintenance-strategy-methodology.md` | Priority methodology and RCM context |
| Field-to-Structured Mapping | `references/field-to-structured-mapping.md` | Complete input→output field mapping with examples |

## 7. Common Pitfalls

| Pitfall | Prevention |
|---------|-----------|
| Inventing equipment TAGs that don't exist in the hierarchy | ALWAYS use `resolve_equipment` — never fabricate TAGs |
| Accepting invalid failure mode combinations | ALWAYS validate against 72-combo MASTER table |
| Setting status to anything other than DRAFT | Status is ALWAYS `DRAFT` — only the planner can change it |
| Exceeding SAP short text limits | Truncate `structured_description` to 72 chars; use full text in `original_text` |
| Ignoring safety flags for rotating/electrical equipment | Default to `LOCKOUT_TAGOUT` for any rotating or electrical equipment |
| Omitting spare parts when REPLACE is implied | T-16 rule: REPLACE → at least one spare part suggested |
| Low-confidence equipment resolution without flagging | Any confidence < 0.7 MUST be flagged `REQUIRES_REVIEW` |
| Translating technical jargon incorrectly | Use the normalization dictionary in Step 1; when uncertain, keep original term |

## 8. Cross-System Alignment (OR SYSTEM)

This skill has no direct OR SYSTEM equivalent. The closest OR functionality is the structured intake in AG-003 operational readiness workflows, but those operate on pre-identified equipment with known failure histories.

**AMS-unique features:**
- Multilingual NLP parsing (FR/EN/AR/ES)
- Image-based anomaly detection and OCR
- 72-combo failure mode validation
- T-16 spare parts enforcement
- Confidence-based review flagging

## 9. Client Memory Protocol (MANDATORY)

Before generating any output, check for client-specific deviations in the memory directory:

```
templates/client-project/3-memory/maintenance-strategy/
```

**What to look for:**
- Custom equipment aliases or naming conventions
- Client-specific priority overrides (e.g., all SAG Mill issues = EMERGENCY)
- Custom safety flag rules beyond the defaults
- Preferred spare parts suppliers or material codes
- Language preferences for structured descriptions

**When to write memory:**
- If the planner consistently modifies a field in the same way → save as deviation
- If a pattern emerges across multiple work requests → save as pattern

## 10. Changelog

| Version | Date | Changes |
|---------|------|---------|
| 0.1 | 2026-03-10 | Initial skill creation. 7-step execution flow, 72-combo FM validation, T-16 spare parts enforcement, multilingual NLP, priority matrix, confidence scoring. |
