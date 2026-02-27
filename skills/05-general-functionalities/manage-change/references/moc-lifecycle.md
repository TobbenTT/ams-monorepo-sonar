# MoC Lifecycle Reference

## State Machine

```
DRAFT -> SUBMITTED -> REVIEWING --+--> APPROVED -> IMPLEMENTING -> CLOSED
                                  |
                                  +--> REJECTED -> DRAFT (rework loop)
```

## Valid Transitions

| From | To | Method |
|------|----|--------|
| DRAFT | SUBMITTED | submit_moc |
| SUBMITTED | REVIEWING | start_review |
| REVIEWING | APPROVED | approve_moc |
| REVIEWING | REJECTED | reject_moc |
| REJECTED | DRAFT | resubmit_moc |
| APPROVED | IMPLEMENTING | start_implementation |
| IMPLEMENTING | CLOSED | close_moc |

## MoC Categories

| Category | Description | Auto-Condition |
|----------|-------------|---------------|
| EQUIPMENT_MODIFICATION | Physical equipment changes | Engineering review required |
| PROCESS_CHANGE | Operational process changes | HSE review required |
| PROCEDURE_CHANGE | Maintenance/operating procedures | None |
| ORGANIZATIONAL_CHANGE | Organizational structure | None |
| SOFTWARE_CHANGE | Control systems/software | None |

## Risk Levels

| Level | Risk Acceptable | Likely Outcome |
|-------|----------------|---------------|
| LOW | Yes | Approve |
| MEDIUM | Yes | Approve (or with conditions if category triggers) |
| HIGH | Yes | Approve with conditions |
| CRITICAL | No | Reject -- risk too high |

## Risk Assessment Conditions

| Condition | Trigger |
|-----------|---------|
| High equipment impact | len(affected_equipment) > 5 |
| Risk level condition | risk_level IN (HIGH, CRITICAL) |
| Engineering review | category == EQUIPMENT_MODIFICATION |
| HSE review | category == PROCESS_CHANGE |

## Recommendation Logic

| Scenario | Recommendation |
|----------|---------------|
| risk_acceptable = False | "Reject -- risk too high" |
| conditions exist + acceptable | "Approve with conditions" |
| no conditions + acceptable | "Approve" |
