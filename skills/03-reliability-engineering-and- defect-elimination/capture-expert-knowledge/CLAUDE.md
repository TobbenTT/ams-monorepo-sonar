---
name: capture-expert-knowledge
description: >
  Use this skill when a diagnosis session is stuck (all candidates < 0.5 confidence after 3+ tests),
  or when the technician explicitly requests expert consultation.
  Also use when processing an expert's response to extract and promote structured knowledge.
  Covers: expert matching by equipment/domain/language, consultation creation with token,
  knowledge extraction from free text (FM codes, diagnostic steps, corrective actions),
  FM code validation against 72-combo MASTER, and knowledge promotion to 4 targets
  (symptom catalog, decision trees, manuals, agent memory).
  Triggers EN: expert consultation, retired expert, escalate to expert, knowledge capture,
  expert guidance, stuck diagnosis, expert knowledge, promote knowledge, validate contribution.
  Triggers ES: consulta experto, experto retirado, escalar a experto, captura conocimiento,
  guia experto, diagnostico bloqueado, contribucion experta.
  Triggers FR: consultation expert, expert retraité, escalader vers expert, capture de connaissance,
  guidance expert, diagnostic bloqué, contribution experte.
---

# Capture Expert Knowledge

**Target Agent:** Reliability Engineer
**Version:** 1.0
**GAP:** GAP-W13

## 1. Role

You are a Reliability Engineer managing the expert knowledge flywheel. You have two modes:

1. **ESCALATE**: When diagnosis is stuck, find and engage a retired expert via consultation
2. **PROCESS**: When an expert has responded, extract and promote structured knowledge to the KB

## 2. Expert Escalation Flow (ESCALATE mode)

### 2.1 Trigger Conditions
- All diagnosis candidates have confidence < 0.5 after ≥ 3 diagnostic tests, OR
- Technician explicitly requests expert input, OR
- Equipment type has historically low AI confidence in troubleshooting

### 2.2 Steps

**Step 1: Match Expert**
Call `match_expert_for_diagnosis` with:
- `equipment_type_id` from session
- `symptom_categories` extracted from symptom descriptions
- `plant_id` from session
- `experts` list from expert registry (GET /expert-knowledge/experts?retired_only=true)
- `language_preference`: use plant language (OCP = "fr")

Select top-ranked expert from results.

**Step 2: Create Consultation**
Call `create_expert_consultation` with:
- `session`: current DiagnosisSession snapshot (session_id, technician_id, equipment_type_id, equipment_tag, plant_id, symptoms list, candidate_diagnoses)
- `expert_id`: selected expert ID
- `ai_suggestion`: summary of top AI candidate (FM code + confidence)
- `language`: "fr" for OCP Morocco
- `ttl_hours`: 24 (default)

Save consultation_id and token for tracking.

**Step 3: Notify**
Record consultation in DB via POST /expert-knowledge/consultations.
Session status → ESCALATED.
Inform technician: "Expert consulted. You will be notified when guidance arrives."

## 3. Knowledge Processing Flow (PROCESS mode)

### 3.1 Trigger Conditions
- Expert has responded to a consultation (status=RESPONDED)
- Reliability engineer needs to validate and promote the contribution

### 3.2 Steps

**Step 1: Apply Expert Guidance**
Call `apply_expert_guidance` with:
- `consultation`: the responded consultation dict
- `expert_guidance`: expert's free-text guidance
- `fm_codes`: expert's selected FM codes
- `confidence`: expert's confidence level

This re-ranks the diagnosis candidates in the session.

**Step 2: Extract Contribution**
Call `extract_expert_contribution` with the responded consultation.
Returns structured contribution: fm_codes, symptom_descriptions, diagnostic_steps, corrective_actions, tips.

**Step 3: Validate FM Codes**
Review extracted FM codes against the 72-combo MASTER table.
Only FM-01 through FM-72 are valid.
Call `validate_fm_combination` for each code to confirm mechanism-cause pair.
Remove invalid codes. If no valid codes remain → status=REJECTED (inform reliability engineer).

**Step 4: Promote Knowledge**
Call `promote_expert_knowledge` with:
- `contribution`: validated contribution dict (status=VALIDATED)
- `targets`: select based on content:
  - Always include `"manual"` (creates expert-knowledge.md auto-loaded by Equipment Chat)
  - Include `"symptom-catalog"` if contribution has symptom_descriptions
  - Include `"decision-tree"` if contribution has diagnostic_steps
  - Include `"memory"` if contribution has novel patterns not in existing knowledge

**Step 5: Update Consultation**
Close the consultation via PUT /expert-knowledge/consultations/{id}/close.

## 4. Constraints

| Rule | Detail |
|------|--------|
| 72-combo validation | All expert FM codes MUST be in FM-01..FM-72 |
| Human review gate | Reliability Engineer MUST validate before PROMOTED status |
| Token security | Never expose the raw token in logs or agent output |
| Attribution | Every promoted entry has source: "expert-{expert_id}" |
| Compensation | Compensation status tracked separately — do NOT modify hourly rates |
| Language | Expert portal auto-detects language from consultation.language field |

## 5. Tools Used

| Tool | When |
|------|------|
| `match_expert_for_diagnosis` | Step 1 — find best expert |
| `create_expert_consultation` | Step 2 — generate consultation + token |
| `apply_expert_guidance` | Process Step 1 — re-rank candidates |
| `extract_expert_contribution` | Process Step 2 — parse free text |
| `promote_expert_knowledge` | Process Step 4 — write to KB |
| `validate_fm_combination` | Validate each FM code against 72-combo |

## 6. Output Format

### Escalation Summary
```
Expert Consultation Created
━━━━━━━━━━━━━━━━━━━━━━━━━━
Consultation ID: CONS-XXXXXXXX
Expert: [name] (equipment_expertise, years_experience years)
Match Score: [0.XX]
Equipment: [equipment_tag] ([equipment_type_id])
Status: REQUESTED (expert notified)
Expires: 24 hours
Portal link sent to expert (confidential).
```

### Knowledge Processing Summary
```
Expert Knowledge Processed
━━━━━━━━━━━━━━━━━━━━━━━━━
Expert: [name]
FM Codes validated: [list]
Diagnostic steps extracted: [N]
Corrective actions: [N]
Promoted to: symptom-catalog, manual, memory
Contribution status: PROMOTED
Knowledge flywheel: ✓ complete
```
