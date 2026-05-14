"""Maintenance task quality scoring strategy.

Scores maintenance tasks across 7 quality dimensions.
Checks: CB/FFI acceptable limits, labour, frequencies, naming conventions.
"""

from __future__ import annotations

from tools.models.schemas import QualityDimension, QualityScoreDimension
from tools.engines.scoring_strategies.base import ScorerStrategy, _ratio_score

# Strategy types that require acceptable_limits and conditional_comments
CB_FFI_STRATEGIES = {"CONDITION_BASED", "FAULT_FINDING"}
MAX_TASK_NAME_LENGTH = 72


class TaskScorer(ScorerStrategy):
    """Quality scoring for maintenance task deliverables."""

    DELIVERABLE_TYPE = "tasks"

    def score_technical_accuracy(self, entities: dict, context: dict) -> QualityScoreDimension:
        tasks = entities.get("maintenance_tasks", [])
        failure_modes = entities.get("failure_modes", [])
        if not tasks:
            return QualityScoreDimension(
                dimension=QualityDimension.TECHNICAL_ACCURACY, score=0.0,
                findings=["No maintenance tasks found"],
            )

        findings = []
        checks_passed = 0
        checks_total = 0

        # Build FM lookup for strategy type
        fm_by_id = {}
        for fm in failure_modes:
            fmid = fm.get("failure_mode_id")
            if fmid:
                fm_by_id[fmid] = fm

        for task in tasks:
            # CB/FFI tasks must have acceptable_limits
            strategy = task.get("strategy_type", "")
            if not strategy:
                # Look up from linked FM
                fm_id = task.get("failure_mode_id", "")
                fm = fm_by_id.get(fm_id, {})
                strategy = fm.get("strategy_type", "")

            if strategy in CB_FFI_STRATEGIES:
                checks_total += 1
                if task.get("acceptable_limits"):
                    checks_passed += 1
                else:
                    findings.append(
                        f"Task '{task.get('name', '?')}': "
                        f"CB/FFI task missing acceptable_limits"
                    )

                checks_total += 1
                if task.get("conditional_comments"):
                    checks_passed += 1
                else:
                    findings.append(
                        f"Task '{task.get('name', '?')}': "
                        f"CB/FFI task missing conditional_comments"
                    )

            # Frequency must be positive
            checks_total += 1
            freq = task.get("frequency_value")
            if isinstance(freq, (int, float)) and freq > 0:
                checks_passed += 1
            else:
                findings.append(
                    f"Task '{task.get('name', '?')}': invalid frequency {freq}"
                )

        return QualityScoreDimension(
            dimension=QualityDimension.TECHNICAL_ACCURACY,
            score=_ratio_score(checks_passed, checks_total),
            findings=findings[:10],
        )

    def score_completeness(self, entities: dict, context: dict) -> QualityScoreDimension:
        tasks = entities.get("maintenance_tasks", [])
        if not tasks:
            return QualityScoreDimension(
                dimension=QualityDimension.COMPLETENESS, score=0.0,
                findings=["No maintenance tasks found"],
            )

        findings = []
        checks_passed = 0
        checks_total = 0

        for task in tasks:
            # Must have labour_resources
            checks_total += 1
            labour = task.get("labour_resources", [])
            if labour and len(labour) > 0:
                checks_passed += 1
            else:
                findings.append(
                    f"Task '{task.get('name', '?')}': no labour_resources"
                )

            # Must have frequency_unit
            checks_total += 1
            if task.get("frequency_unit"):
                checks_passed += 1
            else:
                findings.append(
                    f"Task '{task.get('name', '?')}': missing frequency_unit"
                )

            # Must have constraint
            checks_total += 1
            if task.get("constraint"):
                checks_passed += 1
            else:
                findings.append(
                    f"Task '{task.get('name', '?')}': missing constraint"
                )

            # REPLACE tasks should have material_resources
            task_type = task.get("task_type", "")
            if task_type == "REPLACE":
                checks_total += 1
                materials = task.get("material_resources", [])
                if materials and len(materials) > 0:
                    checks_passed += 1
                else:
                    findings.append(
                        f"Task '{task.get('name', '?')}': "
                        f"REPLACE task missing material_resources"
                    )

        return QualityScoreDimension(
            dimension=QualityDimension.COMPLETENESS,
            score=_ratio_score(checks_passed, checks_total),
            findings=findings[:10],
        )

    def score_consistency(self, entities: dict, context: dict) -> QualityScoreDimension:
        tasks = entities.get("maintenance_tasks", [])
        if not tasks:
            return QualityScoreDimension(
                dimension=QualityDimension.CONSISTENCY, score=0.0,
                findings=["No maintenance tasks found"],
            )

        findings = []
        checks_passed = 0
        checks_total = 0

        for task in tasks:
            # ONLINE constraint should have access_time_hours = 0
            constraint = task.get("constraint", "")
            access_time = task.get("access_time_hours", 0)
            if constraint == "ONLINE":
                checks_total += 1
                if access_time == 0:
                    checks_passed += 1
                else:
                    findings.append(
                        f"Task '{task.get('name', '?')}': "
                        f"ONLINE constraint but access_time_hours={access_time}"
                    )
            elif constraint == "OFFLINE":
                checks_total += 1
                if isinstance(access_time, (int, float)) and access_time > 0:
                    checks_passed += 1
                else:
                    findings.append(
                        f"Task '{task.get('name', '?')}': "
                        f"OFFLINE constraint but access_time_hours={access_time}"
                    )

        if checks_total == 0:
            return QualityScoreDimension(
                dimension=QualityDimension.CONSISTENCY, score=100.0,
                details="No consistency checks applicable",
            )

        return QualityScoreDimension(
            dimension=QualityDimension.CONSISTENCY,
            score=_ratio_score(checks_passed, checks_total),
            findings=findings[:10],
        )

    def score_format(self, entities: dict, context: dict) -> QualityScoreDimension:
        tasks = entities.get("maintenance_tasks", [])
        if not tasks:
            return QualityScoreDimension(
                dimension=QualityDimension.FORMAT, score=0.0,
                findings=["No maintenance tasks found"],
            )

        findings = []
        checks_passed = 0
        checks_total = 0

        for task in tasks:
            name = task.get("name", "")
            # Name must be <= 72 chars (SAP constraint)
            checks_total += 1
            if 1 <= len(name) <= MAX_TASK_NAME_LENGTH:
                checks_passed += 1
            else:
                findings.append(
                    f"Task name '{name[:30]}...' length {len(name)} "
                    f"exceeds {MAX_TASK_NAME_LENGTH} char limit"
                )

            # task_id must be present
            checks_total += 1
            if task.get("task_id"):
                checks_passed += 1
            else:
                findings.append(f"Task '{name}' missing task_id")

        return QualityScoreDimension(
            dimension=QualityDimension.FORMAT,
            score=_ratio_score(checks_passed, checks_total),
            findings=findings[:10],
        )

    def score_actionability(self, entities: dict, context: dict) -> QualityScoreDimension:
        tasks = entities.get("maintenance_tasks", [])
        if not tasks:
            return QualityScoreDimension(
                dimension=QualityDimension.ACTIONABILITY, score=0.0,
                findings=["No maintenance tasks found"],
            )

        findings = []
        checks_passed = 0
        checks_total = 0

        for task in tasks:
            # Labour must be specific (not just present but with trade + hours)
            labour = task.get("labour_resources", [])
            checks_total += 1
            if labour:
                has_specific = any(
                    lr.get("specialty") and lr.get("hours_per_person", 0) > 0
                    for lr in labour
                )
                if has_specific:
                    checks_passed += 1
                else:
                    findings.append(
                        f"Task '{task.get('name', '?')}': "
                        f"labour lacks specific specialty/hours"
                    )
            else:
                findings.append(
                    f"Task '{task.get('name', '?')}': no labour assigned"
                )

        return QualityScoreDimension(
            dimension=QualityDimension.ACTIONABILITY,
            score=_ratio_score(checks_passed, checks_total),
            findings=findings[:10],
        )

    def score_traceability(self, entities: dict, context: dict) -> QualityScoreDimension:
        tasks = entities.get("maintenance_tasks", [])
        failure_modes = entities.get("failure_modes", [])

        if not tasks:
            return QualityScoreDimension(
                dimension=QualityDimension.TRACEABILITY, score=0.0,
                findings=["No maintenance tasks found"],
            )

        findings = []
        checks_passed = 0
        checks_total = 0

        fm_ids = {fm.get("failure_mode_id") for fm in failure_modes if fm.get("failure_mode_id")}

        for task in tasks:
            # Each task should link to a failure mode
            checks_total += 1
            fm_id = task.get("failure_mode_id")
            if fm_id and fm_id in fm_ids:
                checks_passed += 1
            elif fm_id and fm_id not in fm_ids:
                findings.append(
                    f"Task '{task.get('name', '?')}': "
                    f"references non-existent FM {fm_id}"
                )
            else:
                findings.append(
                    f"Task '{task.get('name', '?')}': missing failure_mode_id link"
                )

        return QualityScoreDimension(
            dimension=QualityDimension.TRACEABILITY,
            score=_ratio_score(checks_passed, checks_total),
            findings=findings[:10],
        )
