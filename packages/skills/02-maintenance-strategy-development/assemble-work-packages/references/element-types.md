# Work Package Element Types Reference

## 7 Mandatory Elements (REF-14 Section 5.5)

| # | Element Type | Description | Typical Reference Format |
|---|-------------|-------------|--------------------------|
| 1 | WORK_INSTRUCTION | The work instruction document | WI-SAG-001 Rev.3 |
| 2 | SAFETY_PLAN | Safety/isolation plan | SP-SAG-001 |
| 3 | RESOURCE_PLAN | Labour resource allocation | RP-SAG-001 |
| 4 | MATERIALS_LIST | Bill of materials | ML-SAG-001 |
| 5 | TOOLS_LIST | Required tools and equipment | TL-SAG-001 |
| 6 | QUALITY_CRITERIA | Acceptance/quality criteria | QC-SAG-001 |
| 7 | DRAWINGS | Technical drawings and references | DW-SAG-001 |

## Element Readiness Statuses

| Status | Description | Impact |
|--------|-------------|--------|
| MISSING | Not yet provided | Counts as non-ready |
| DRAFT | Exists but needs finalization | Counts as non-ready |
| READY | Complete and current | Counts as ready |
| EXPIRED | Was ready but has expired | Counts as non-ready AND blocks package |

## Overall Readiness Logic

| Condition | Overall Status |
|-----------|---------------|
| Any EXPIRED element present | BLOCKED |
| All 7 elements READY | READY |
| 0 elements READY | NOT_STARTED |
| 1-6 elements READY (no EXPIRED) | PARTIAL |

## WP Name Convention

- Maximum 40 characters
- ALL CAPS
- Example valid: `"SAG MILL LINER CHANGE"` (21 chars)
- Example invalid: `"Sag Mill Primary Liner Replacement and Inspection"` (49 chars, mixed case)
