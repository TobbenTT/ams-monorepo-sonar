"""Smart Backlog tool wrappers — multi-criteria scoring for backlog prioritization."""

import json
from datetime import datetime
from api.ai_core.tool_wrappers.compact_json import dumps as json_compact
from api.ai_core.tool_wrappers.registry import tool


# Weights for multi-criteria scoring
WEIGHTS = {
    "criticality": 0.25,
    "health_score": 0.20,
    "sla_proximity": 0.20,
    "failure_frequency": 0.15,
    "cost_of_deferral": 0.10,
    "safety_impact": 0.10,
}

# Criticality score mapping
CRITICALITY_SCORES = {
    "AA": 1.0, "A": 0.9, "CRITICAL": 1.0,
    "AB": 0.7, "B": 0.6, "HIGH": 0.7,
    "BA": 0.5, "C": 0.4, "MEDIUM": 0.5,
    "BB": 0.3, "D": 0.2, "LOW": 0.3,
    "MINIMAL": 0.1,
}

# Priority to SLA hours mapping
SLA_HOURS = {"P1": 24, "P2": 168, "P3": 720, "P4": 2160,
             "1_EMERGENCY": 24, "1_CRITICAL": 24,
             "2_URGENT": 168, "2_HIGH": 168,
             "3_NORMAL": 720, "4_LOW": 2160}


@tool(
    "score_backlog_item",
    "Score a backlog item using multi-criteria analysis (criticality, health, SLA, frequency, cost, safety). Returns total_score 0-100, breakdown by criterion, and alerts.",
    {
        "type": "object",
        "properties": {
            "input_json": {
                "type": "string",
                "description": "JSON with: equipment_tag, priority, criticality_class, health_score (0-100), failure_count_12m (int), estimated_hours (float), sla_deadline_iso (str or null), shutdown_required (bool), age_days (int), consequence_type (str: EVIDENT_OPERATIONAL, HIDDEN, SAFETY_LOSS, etc.)"
            }
        },
        "required": ["input_json"],
    },
)
def score_backlog_item(input_json: str) -> str:
    data = json.loads(input_json)

    # 1. Criticality score (0-1)
    crit_class = (data.get("criticality_class") or "C").upper()
    s_crit = CRITICALITY_SCORES.get(crit_class, 0.4)

    # 2. Health score (invert: lower health = higher urgency)
    health = data.get("health_score", 50.0)
    s_health = max(0, (100 - health)) / 100.0

    # 3. SLA proximity (closer to deadline = higher score)
    sla_deadline = data.get("sla_deadline_iso")
    if sla_deadline:
        try:
            deadline = datetime.fromisoformat(sla_deadline)
            remaining = (deadline - datetime.now()).total_seconds() / 3600
            priority = data.get("priority", "P3")
            total_sla = SLA_HOURS.get(priority, 720)
            s_sla = max(0, min(1, 1 - (remaining / total_sla))) if total_sla > 0 else 0.5
        except (ValueError, TypeError):
            s_sla = 0.5
    else:
        s_sla = 0.5

    # 4. Failure frequency (normalized: more failures = higher score)
    failure_count = data.get("failure_count_12m", 0)
    s_freq = min(1.0, failure_count / 10.0)  # cap at 10 failures

    # 5. Cost of deferral (based on estimated hours — proxy for cost)
    est_hours = data.get("estimated_hours", 4.0)
    s_cost = min(1.0, est_hours / 40.0)  # cap at 40 hours

    # 6. Safety impact
    consequence = (data.get("consequence_type") or "").upper()
    if "SAFETY" in consequence:
        s_safety = 1.0
    elif "HIDDEN" in consequence:
        s_safety = 0.8
    elif "OPERATIONAL" in consequence:
        s_safety = 0.5
    else:
        s_safety = 0.3

    # Weighted total (0-100)
    total = (
        WEIGHTS["criticality"] * s_crit +
        WEIGHTS["health_score"] * s_health +
        WEIGHTS["sla_proximity"] * s_sla +
        WEIGHTS["failure_frequency"] * s_freq +
        WEIGHTS["cost_of_deferral"] * s_cost +
        WEIGHTS["safety_impact"] * s_safety
    ) * 100

    # Alerts
    alerts = []
    age_days = data.get("age_days", 0)
    if s_sla > 0.8:
        alerts.append({"type": "SLA_BREACH_RISK", "message": f"SLA breach imminent — {int((1-s_sla)*SLA_HOURS.get(data.get('priority','P3'),720))}h remaining"})
    if age_days > 30:
        alerts.append({"type": "AGING", "message": f"Item aging: {age_days} days in backlog"})
    if s_safety >= 0.8:
        alerts.append({"type": "SAFETY", "message": "Safety-critical item — prioritize"})
    if failure_count >= 3:
        alerts.append({"type": "CHRONIC", "message": f"Chronic failure pattern: {failure_count} events in 12 months"})

    return json_compact({
        "total_score": round(total, 1),
        "breakdown": {
            "criticality": {"weight": WEIGHTS["criticality"], "raw": round(s_crit, 3), "weighted": round(WEIGHTS["criticality"] * s_crit * 100, 1)},
            "health_score": {"weight": WEIGHTS["health_score"], "raw": round(s_health, 3), "weighted": round(WEIGHTS["health_score"] * s_health * 100, 1)},
            "sla_proximity": {"weight": WEIGHTS["sla_proximity"], "raw": round(s_sla, 3), "weighted": round(WEIGHTS["sla_proximity"] * s_sla * 100, 1)},
            "failure_frequency": {"weight": WEIGHTS["failure_frequency"], "raw": round(s_freq, 3), "weighted": round(WEIGHTS["failure_frequency"] * s_freq * 100, 1)},
            "cost_of_deferral": {"weight": WEIGHTS["cost_of_deferral"], "raw": round(s_cost, 3), "weighted": round(WEIGHTS["cost_of_deferral"] * s_cost * 100, 1)},
            "safety_impact": {"weight": WEIGHTS["safety_impact"], "raw": round(s_safety, 3), "weighted": round(WEIGHTS["safety_impact"] * s_safety * 100, 1)},
        },
        "alerts": alerts,
        "equipment_tag": data.get("equipment_tag", "UNKNOWN"),
    })


@tool(
    "score_backlog_batch",
    "Score multiple backlog items and return them ranked by total_score descending. Input: JSON array of items (same schema as score_backlog_item).",
    {
        "type": "object",
        "properties": {
            "input_json": {"type": "string", "description": "JSON array of backlog item dicts"}
        },
        "required": ["input_json"],
    },
)
def score_backlog_batch(input_json: str) -> str:
    items = json.loads(input_json)
    scored = []
    for item in items:
        result = json.loads(score_backlog_item(json.dumps(item)))
        result["backlog_id"] = item.get("backlog_id", "")
        scored.append(result)
    scored.sort(key=lambda x: x["total_score"], reverse=True)
    return json_compact({"ranked_items": scored, "total_count": len(scored)})
