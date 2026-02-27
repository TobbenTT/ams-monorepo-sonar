"""MCP tool wrappers for VarianceDetector."""

import json
from agents.tool_wrappers.registry import tool
from tools.engines.variance_detector import VarianceDetector
from tools.models.schemas import PlantMetricSnapshot


def _parse_snapshots(json_str: str) -> list[PlantMetricSnapshot]:
    return [PlantMetricSnapshot(**s) for s in json.loads(json_str)]


@tool(
    "detect_variance",
    "Detect outlier plants for a single metric. Returns alerts for plants beyond warning (>2σ) or critical (>3σ) thresholds.",
    {"type": "object", "properties": {"snapshots_json": {"type": "string"}, "warning_threshold": {"type": "number"}, "critical_threshold": {"type": "number"}}, "required": ["snapshots_json"]},
)
def detect_variance(snapshots_json: str, warning_threshold: float = 2.0, critical_threshold: float = 3.0) -> str:
    snapshots = _parse_snapshots(snapshots_json)
    alerts = VarianceDetector.detect_variance(snapshots, warning_threshold, critical_threshold)
    return json.dumps([a.model_dump() for a in alerts], default=str)


@tool(
    "detect_multi_metric_variance",
    "Detect outliers across multiple metrics. Input: JSON dict mapping metric_name -> list of snapshots.",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def detect_multi_metric_variance(input_json: str) -> str:
    data = json.loads(input_json)
    all_snapshots = {k: [PlantMetricSnapshot(**s) for s in v] for k, v in data.items()}
    alerts = VarianceDetector.detect_multi_metric(all_snapshots)
    return json.dumps([a.model_dump() for a in alerts], default=str)


@tool(
    "rank_plants",
    "Rank plants by metric value (highest first). Returns ranked list with plant_id, value, rank.",
    {"type": "object", "properties": {"snapshots_json": {"type": "string"}}, "required": ["snapshots_json"]},
)
def rank_plants(snapshots_json: str) -> str:
    snapshots = _parse_snapshots(snapshots_json)
    ranking = VarianceDetector.rank_plants(snapshots)
    return json.dumps(ranking, default=str)
