"""MCP tool wrappers for BacklogGrouper."""

import json
from agents.tool_wrappers.registry import tool
from tools.engines.backlog_grouper import BacklogGrouper, BacklogEntry


def _parse_backlog_items(input_json: str) -> list[BacklogEntry]:
    return [BacklogEntry(**item) for item in json.loads(input_json)]


def _serialize_groups(groups) -> str:
    from dataclasses import asdict
    return json.dumps([asdict(g) for g in groups], default=str)


@tool(
    "group_by_equipment",
    "Group backlog items by equipment. Returns list of WorkPackageGroups.",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def group_by_equipment(input_json: str) -> str:
    items = _parse_backlog_items(input_json)
    return _serialize_groups(BacklogGrouper.group_by_equipment(items))


@tool(
    "group_by_area",
    "Group backlog items by area. Returns list of WorkPackageGroups.",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def group_by_area(input_json: str) -> str:
    items = _parse_backlog_items(input_json)
    return _serialize_groups(BacklogGrouper.group_by_area(items))


@tool(
    "group_by_shutdown",
    "Group backlog items by shutdown opportunity. Returns list of WorkPackageGroups.",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def group_by_shutdown(input_json: str) -> str:
    items = _parse_backlog_items(input_json)
    return _serialize_groups(BacklogGrouper.group_by_shutdown(items))


@tool(
    "find_all_groups",
    "Find all possible work package groupings (by equipment, area, and shutdown). Returns all groups.",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def find_all_groups(input_json: str) -> str:
    items = _parse_backlog_items(input_json)
    return _serialize_groups(BacklogGrouper.find_all_groups(items))


@tool(
    "stratify_backlog",
    "Stratify backlog items by priority (P1-P5). Returns dict with priority buckets and statistics.",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def stratify_backlog(input_json: str) -> str:
    items = _parse_backlog_items(input_json)
    result = BacklogGrouper.stratify(items)
    return json.dumps(result, default=str)
