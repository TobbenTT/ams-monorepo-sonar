"""MCP tool wrappers for QualityScoreEngine."""

import json

from agents.tool_wrappers.registry import tool
from tools.engines.quality_score_engine import QualityScoreEngine


@tool(
    "score_deliverable_quality",
    "Score a single deliverable type (hierarchy, criticality, fmeca, tasks, work_packages, sap_upload) across 7 quality dimensions. Returns composite score, grade, and recommendations.",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def score_deliverable_quality(input_json: str) -> str:
    data = json.loads(input_json)
    result = QualityScoreEngine.score_deliverable(
        deliverable_type=data["deliverable_type"],
        entities=data["entities"],
        milestone=data["milestone"],
        context=data.get("context", {}),
    )
    return json.dumps(result.model_dump(), default=str)


@tool(
    "score_session_quality",
    "Score all deliverables in a session up to a given milestone. Returns overall score, per-deliverable breakdown, grade, and gate pass/fail.",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def score_session_quality(input_json: str) -> str:
    data = json.loads(input_json)
    result = QualityScoreEngine.score_session(
        session_entities=data["entities"],
        milestone=data["milestone"],
        session_id=data.get("session_id", ""),
        context=data.get("context", {}),
        pass_threshold=data.get("pass_threshold", 91.0),
    )
    return json.dumps(result.model_dump(), default=str)
