# Milestone Definitions

Detailed definitions and instructions for each of the 4 milestones in the Maintenance Strategy Development (MSD) workflow.

## 4-Milestone Overview

| # | Name | Description | Required Agents | Required Entities |
|---|------|-------------|-----------------|-------------------|
| 1 | **Hierarchy Decomposition** | Equipment breakdown (6-level hierarchy) and criticality assessment | reliability | hierarchy_nodes, criticality_assessments |
| 2 | **FMEA Completion** | Failure modes (72-combo validated), RCM decision paths | reliability | functions, functional_failures, failure_modes |
| 3 | **Strategy + Tasks + Resources** | Maintenance tasks, work packages, materials, work instructions | reliability, planning, spare_parts | maintenance_tasks, work_packages |
| 4 | **SAP Upload Package** | SAP Maintenance Item + Task List + Work Plan (DRAFT) | planning | sap_upload_package |

## Milestone 1: Hierarchy Decomposition

### Instructions
1. Decompose equipment into 6-level hierarchy:
   - Plant -> Area -> System -> Equipment -> SubAssembly -> Maintainable Item
2. Assess criticality for each maintainable item using the 11-criteria matrix.
3. Validate all hierarchy nodes and criticality assessments.

### Expected Entities
- `hierarchy_nodes`: Complete 6-level breakdown
- `criticality_assessments`: One per equipment and system node (MI optional)

## Milestone 2: FMEA Completion

### Instructions
1. Define functions and functional failures for each maintainable item.
2. Identify failure modes -- MUST validate every Mechanism+Cause against the 72-combo table.
3. Run the RCM decision tree for each failure mode.
4. Validate all failure modes.

### Context Includes
- Existing hierarchy node count
- Criticality assessment count

### Expected Entities
- `functions`: System and MI functions
- `functional_failures`: Loss-of-function definitions
- `failure_modes`: Component + mechanism + cause combinations

## Milestone 3: Strategy + Tasks + Resources

### Instructions
1. Define maintenance tasks with appropriate frequencies for each failure mode.
2. Group tasks into work packages (by equipment, area, or shutdown opportunity).
3. Assign materials to REPLACE tasks (delegate to Spare Parts agent).
4. Generate work instructions for each work package.
5. Validate all tasks, work packages, and work instructions.

### Context Includes
- Existing failure mode count

### Expected Entities
- `maintenance_tasks`: Task definitions with frequencies
- `work_packages`: Grouped task allocations

## Milestone 4: SAP Upload Package

### Instructions
1. Generate the SAP upload package (Maintenance Item + Task List + Work Plan).
2. Validate SAP cross-references and field lengths.
3. Present the DRAFT SAP package for human approval.
4. **REMINDER: All outputs are DRAFT. NEVER auto-submit to SAP.**

### Context Includes
- Existing work package and task counts

### Expected Entities
- `sap_upload_package`: Complete DRAFT package

## Gate Summary Format

```
=== Milestone {number}: {name} ===
Description: {description}

Entity counts:
  hierarchy_nodes: {count}
  criticality_assessments: {count}
  functions: {count}
  functional_failures: {count}
  failure_modes: {count}
  maintenance_tasks: {count}
  work_packages: {count}
  sap_upload_package: Yes/No

Validation: {errors} errors, {warnings} warnings, {info} info

ERRORS (must fix before approval):
  - [{rule_id}] {message}

WARNINGS (review recommended):
  - [{rule_id}] {message}

Action: APPROVE / MODIFY / REJECT
```
