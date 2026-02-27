# Confidence Thresholds by Entity Type

## Threshold Table

| Entity Type | Auto Reject (<) | Mandatory Review (<) | Optional Review (<) | Trusted (>=) |
|-------------|-----------------|---------------------|---------------------|--------------|
| `equipment_identification` | 0.30 | 0.70 | 0.90 | 0.90 |
| `failure_mode` | 0.20 | 0.60 | 0.85 | 0.85 |
| `priority_suggestion` | 0.30 | 0.70 | 0.90 | 0.90 |
| `task_generation` | 0.25 | 0.65 | 0.85 | 0.85 |
| `spare_parts_suggestion` | 0.30 | 0.70 | 0.90 | 0.90 |
| `default` | 0.30 | 0.70 | 0.90 | 0.90 |

## Review Levels

| Level | Confidence Range | Action | should_flag |
|-------|-----------------|--------|-------------|
| AUTO_REJECT | < auto_reject threshold | Reject AI output -- manual input required | True |
| MANDATORY_REVIEW | auto_reject to mandatory_review | Must be reviewed by human | True |
| OPTIONAL_REVIEW | mandatory_review to optional_review | Review recommended but not mandatory | False |
| TRUSTED | >= optional_review | Minimal review needed | False |

## Batch Evaluation Output Fields

| Field | Type | Description |
|-------|------|-------------|
| `total` | int | Total items evaluated |
| `by_level` | dict | Count per ReviewLevel |
| `flagged_count` | int | Items with should_flag=True |
| `average_confidence` | float | Mean confidence across all items |
| `min_confidence` | float | Lowest confidence in the batch |
| `flagged_items` | list[dict] | Details of flagged items |
