# Complete Validation Rules Reference

## Task Validation Rules (T-01 to T-19)

| Rule | Severity | Condition | Message |
|------|----------|-----------|---------|
| T-01 | WARNING | INSPECT/CHECK/TEST task has no acceptable limits | Task has no acceptable limits defined |
| T-02 | WARNING | INSPECT/CHECK/TEST task has no conditional comments | Task has no conditional comments defined |
| T-05 | WARNING | INSPECT task name does not match `^Inspect .+ for .+$` | Task name doesn't follow INSPECT naming convention |
| T-06 | WARNING | Task name uses verb form instead of noun | Use '{noun}' instead of '{verb}' in task name |
| T-07 | WARNING | CHECK task name does not match `^Check .+$` | Task name doesn't follow CHECK naming convention |
| T-08 | WARNING | TEST task name does not match `^Perform .+ test of .+$` | Task name doesn't follow TEST naming convention |
| T-10 | WARNING | Task name contains "visually inspect" | Use 'Inspect' not 'Visually inspect' |
| T-11 | ERROR | Task has no labour resources assigned | Task has no labour resources assigned |
| T-12 | WARNING | Calendar cause uses operational frequency unit (or vice versa) | Cause is age-related but uses operational units |
| T-13 | ERROR | Maintainable item has no replacement task | MI has no replacement task |
| T-14 | WARNING | REPLACE/REPAIR task name does not match pattern | Task name doesn't follow naming convention |
| T-16 | ERROR | REPLACE task has no materials in costing | Replacement task has no materials in costing |
| T-17 | ERROR | ONLINE task has non-zero access time | Online task has non-zero access time |
| T-17 | ERROR | OFFLINE task has zero access time | Offline task has zero access time |
| T-18 | ERROR | Task name exceeds 72 characters | Task name exceeds 72 chars |
| T-19 | WARNING | Task name is ALL CAPS | Task name appears to be ALL CAPS |

## Cross-Entity Task Rules (Strategy Alignment)

| Rule | Severity | Condition | Message |
|------|----------|-----------|---------|
| T-01 | ERROR | CB strategy task has no acceptable limits | Task for CONDITION_BASED strategy MUST have acceptable limits |
| T-02 | ERROR | CB strategy task has no conditional comments | Task for CONDITION_BASED strategy MUST have conditional comments |
| T-03 | ERROR | FFI strategy task has no acceptable limits | Task for FAULT_FINDING strategy MUST have acceptable limits |
| T-04 | ERROR | FFI strategy task has no conditional comments | Task for FAULT_FINDING strategy MUST have conditional comments |
| T-12 | WARNING | Calendar cause + operational frequency | Cause is age-related but uses operational units |
| T-12 | WARNING | Operational cause + calendar frequency | Cause is usage-related but uses calendar units |

## Work Package Validation Rules (WP-01 to WP-13)

| Rule | Severity | Condition | Message |
|------|----------|-----------|---------|
| WP-01 | ERROR | Task not allocated to any WP | Task is not allocated to any work package |
| WP-03 | ERROR | WP mixes ONLINE and OFFLINE tasks | WP mixes ONLINE and OFFLINE tasks |
| WP-04 | ERROR | Task frequency != WP frequency | Task freq doesn't match WP freq |
| WP-05 | ERROR | WP name > 40 chars | Name exceeds 40 chars |
| WP-05 | ERROR | WP name contains special chars | Name contains special characters |
| WP-06 | WARNING | WP name not ALL CAPS | Name is not ALL CAPS |
| WP-07 | WARNING | WP name < 3 parts | Name has fewer than 3 parts |
| WP-07 | WARNING | First part not a frequency | First part doesn't look like a frequency |
| WP-07 | WARNING | Last part not valid constraint | Last part is not a valid constraint |
| WP-08 | ERROR | Suppressive WP freq not factor of lowest interval | Suppressive WP freq is not a factor |
| WP-09 | WARNING | Suppressive WP sequence wrong order | Sequence should start with highest interval |
| WP-10 | ERROR | Sequential WP group < 2 WPs | Sequential group requires at least 2 WPs |
| WP-10 | WARNING | Sequential WP frequencies invalid | Frequencies may not form a valid sequence |
| WP-11 | ERROR | Task in WP has no labour | Task in WP has no labour assigned |

## Hierarchy Validation Rules (H-01 to H-04)

| Rule | Severity | Condition | Message |
|------|----------|-----------|---------|
| H-01 | ERROR | node.level > 6 | Node exceeds maximum hierarchy depth |
| H-02 | ERROR | MI has no component_lib_ref | Maintainable item has no component library reference |
| H-01 | ERROR | Parent level >= child level | Node at level {n} has parent at same or deeper level |

## Function Validation Rules (F-01 to F-05)

| Rule | Severity | Condition | Message |
|------|----------|-----------|---------|
| F-01 | ERROR | SYSTEM node has no functions | System node has no functions defined |
| F-03 | ERROR | MI node has no functions | Maintainable item has no functions defined |
| F-02 | ERROR | Function has no functional failures | Function has no functional failures defined |
| F-04 | ERROR | MI function has no functional failures | Function has no functional failures defined |
| F-05 | WARNING | Function description < 3 words | Function may not follow Verb + Noun + Standard format |

## Criticality Validation Rules (C-01 to C-04)

| Rule | Severity | Condition | Message |
|------|----------|-----------|---------|
| C-01 | ERROR | EQUIPMENT node has no criticality | Equipment has no criticality assessment |
| C-02 | ERROR | SYSTEM node has no criticality | System has no criticality assessment |
| C-03 | INFO | MI has no criticality | MI has no criticality assessment (optional) |
| C-04 | WARNING | High criticality but no failure modes | High criticality but no failure modes defined |

## Failure Mode Validation Rules (FM-01 to FM-07)

| Rule | Severity | Condition | Message |
|------|----------|-----------|---------|
| FM-01 | ERROR | 'what' not capitalized | 'what' must start with capital letter |
| FM-02 | ERROR | 'what' ends in 's' (not 'ss'/'us') | 'what' should be singular (not plural) |
