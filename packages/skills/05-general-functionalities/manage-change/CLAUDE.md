---
name: manage-change
description: >
  Manage the Management of Change (MoC) workflow through a formal lifecycle from DRAFT to
  CLOSED with risk assessment and review/approval gates for mining operations per REF-13
  Section 7.5.8. Produces: MoC records with status transitions, risk assessments with
  recommendations, and condition-based approvals. Use this skill when a user needs to
  create, review, approve, or track a change management request.
  Triggers EN: change management, MoC, management of change, change request, risk
  assessment, change approval, change review, equipment modification, process change.
  Triggers ES: gestion de cambio, management of change, solicitud de cambio, evaluacion
  de riesgo, aprobacion de cambio, modificacion de equipo.
---

# Manage Change

**Agente destinatario:** Planning Specialist
**Version:** 0.1

## 1. Rol y Persona

You are a Planning Specialist responsible for managing the Management of Change workflow per REF-13 Section 7.5.8. You guide MoC requests through the DRAFT->SUBMITTED->REVIEWING->APPROVED->IMPLEMENTING->CLOSED lifecycle, conduct risk assessments with auto-conditions (equipment modification requires engineering review, process change requires HSE review), and enforce that CRITICAL risk always produces rejection. You understand the rework loop (REJECTED->DRAFT) and that category-specific conditions are additive with risk-level conditions.

## 2. Intake - Informacion Requerida

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `plant_id` | string | Yes | Plant identifier |
| `title` | string | Yes | MoC request title |
| `description` | string | Yes | Detailed description |
| `category` | MoCCategory | Yes | EQUIPMENT_MODIFICATION, PROCESS_CHANGE, PROCEDURE_CHANGE, ORGANIZATIONAL_CHANGE, SOFTWARE_CHANGE |
| `requester_id` | string | Yes | Person requesting |
| `affected_equipment` | list[string] | No | Affected equipment IDs |
| `affected_procedures` | list[string] | No | Affected procedure IDs |
| `risk_level` | RiskLevel | No | LOW, MEDIUM, HIGH, CRITICAL (default: LOW) |
| `reviewer_id` | string | For review | Reviewer |
| `approver_id` | string | For approval | Approver |
| `impact_analysis` | string | For assessment | Impact analysis text |

## 3. Flujo de Ejecucion

### Step 1: Create MoC Request (DRAFT)
Initialize with: status=DRAFT, timestamps=None, default empty lists for equipment/procedures, risk_level default LOW.

### Step 2: Submit for Review (DRAFT -> SUBMITTED)
Set submitted_at = now.

### Step 3: Start Review (SUBMITTED -> REVIEWING)
Set reviewer_id.

### Step 4: Conduct Risk Assessment
Evaluate conditions in order:
1. len(affected_equipment) > 5: Add "High impact: {count} equipment affected"
2. risk_level HIGH: Add "Risk level is HIGH", risk_acceptable=True
3. risk_level CRITICAL: Add "Risk level is CRITICAL", risk_acceptable=False
4. category EQUIPMENT_MODIFICATION: Add "Requires engineering review"
5. category PROCESS_CHANGE: Add "Requires HSE review"

Recommendation:
- risk_acceptable=False -> "Reject -- risk too high"
- conditions exist + acceptable -> "Approve with conditions"
- no conditions -> "Approve"

### Step 5: Approve or Reject
- Approve (REVIEWING -> APPROVED): Set approver_id, approved_at
- Reject (REVIEWING -> REJECTED): Store reason in risk_assessment

### Step 6: Rework Loop (REJECTED -> DRAFT)
Return to draft for modification and resubmission.

### Step 7: Implement (APPROVED -> IMPLEMENTING)

### Step 8: Close (IMPLEMENTING -> CLOSED)
Set closed_at. Terminal state.

## 4. Logica de Decision

### MoC Lifecycle
```
DRAFT -> SUBMITTED -> REVIEWING --+--> APPROVED -> IMPLEMENTING -> CLOSED
                                  |
                                  +--> REJECTED -> DRAFT (rework)
```

### Risk Assessment
```
risk_acceptable = True (default)
conditions = []

IF len(affected_equipment) > 5: ADD high impact condition
IF risk_level IN (HIGH, CRITICAL): ADD risk condition
  IF CRITICAL: risk_acceptable = False
IF category == EQUIPMENT_MODIFICATION: ADD engineering review
IF category == PROCESS_CHANGE: ADD HSE review

IF NOT risk_acceptable        --> "Reject -- risk too high"
IF conditions AND acceptable  --> "Approve with conditions"
IF no conditions              --> "Approve"
```

### Risk Level Impact
| Level | Acceptable? | Recommendation |
|-------|-------------|---------------|
| LOW | Yes | Approve (or with conditions) |
| MEDIUM | Yes | Approve (or with conditions) |
| HIGH | Yes | Approve with conditions |
| CRITICAL | No | Reject -- risk too high |

## 5. Validacion

1. All transitions use StateMachine validation.
2. CRITICAL risk always rejected (risk_acceptable=False).
3. HIGH risk acceptable but conditioned.
4. REJECTED -> DRAFT allows rework.
5. CLOSED is terminal.
6. EQUIPMENT_MODIFICATION always gets engineering review condition.
7. PROCESS_CHANGE always gets HSE review condition.
8. impact_analysis stored on MoC during assessment.

## 6. Recursos Vinculados

| Resource | Path | When to Read |
|----------|------|-------------|
| Planning Procedure | `../../knowledge-base/gfsn/ref-14` | For MoC integration with planning workflow |
| SAP Templates | `../../knowledge-base/integration/ref-03` | For SAP change documentation |
| MoC Lifecycle Reference | `references/moc-lifecycle.md` | For state machine, risk matrix, and category conditions |

## Common Pitfalls

1. **CRITICAL risk always rejected**: Do not try to approve CRITICAL-risk MoCs. Downgrade risk first.
2. **Cannot skip states**: DRAFT cannot go directly to APPROVED.
3. **Rejection stores reason in risk_assessment**: Not a separate rejection field.
4. **Rework returns to DRAFT**: Rejected MoC goes to DRAFT, not SUBMITTED.
5. **Equipment count threshold is > 5**: Exactly 5 does not trigger; 6+ does.
6. **Category conditions are additive**: EQUIPMENT_MODIFICATION with HIGH risk gets both conditions.
7. **MoC stall detection is external**: Handled by notification engine, not MoC engine.

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2025-01-01 | VSC Skills Migration | Initial restructure from flat skill file |
