"""MCP tool wrappers for WeibullEngine."""

import json
from agents.tool_wrappers.registry import tool
from tools.engines.weibull_engine import WeibullEngine
from tools.models.schemas import WeibullParameters


@tool(
    "fit_weibull",
    "Fit 2-parameter Weibull distribution to failure interval data. Returns beta (shape), eta (scale), and R-squared.",
    {"type": "object", "properties": {"failure_intervals": {"type": "string"}}, "required": ["failure_intervals"]},
)
def fit_weibull(failure_intervals: str) -> str:
    intervals = json.loads(failure_intervals)
    result = WeibullEngine.fit_parameters(intervals)
    return json.dumps(result.model_dump(), default=str)


@tool(
    "predict_failure",
    "Generate a full failure prediction with risk score, recommended strategy, and reliability curve. Output is always DRAFT status (safety-first).",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def predict_failure(input_json: str) -> str:
    data = json.loads(input_json)
    result = WeibullEngine.predict(
        equipment_id=data["equipment_id"],
        equipment_tag=data["equipment_tag"],
        failure_intervals=data["failure_intervals"],
        current_age_days=data["current_age_days"],
        confidence_level=data.get("confidence_level", 0.9),
    )
    return json.dumps(result.model_dump(), default=str)


@tool(
    "weibull_reliability",
    "Calculate reliability R(t) at time t given Weibull parameters.",
    {"type": "object", "properties": {"t": {"type": "number"}, "beta": {"type": "number"}, "eta": {"type": "number"}, "gamma": {"type": "number"}}, "required": ["t", "beta", "eta"]},
)
def weibull_reliability(t: float, beta: float, eta: float, gamma: float = 0.0) -> str:
    params = WeibullParameters(beta=beta, eta=eta, gamma=gamma, r_squared=0.0)
    r = WeibullEngine.reliability(t, params)
    f = WeibullEngine.failure_probability(t, params)
    h = WeibullEngine.hazard_rate(t, params)
    pattern = WeibullEngine.classify_failure_pattern(beta)
    return json.dumps({
        "time": t, "reliability": round(r, 6), "failure_probability": round(f, 6),
        "hazard_rate": round(h, 6), "failure_pattern": pattern.value,
    })
