"""MCP tool wrappers for RCAEngine (Phase 4A)."""

import json
from datetime import date
from agents.tool_wrappers.registry import tool
from tools.engines.rca_engine import RCAEngine
from tools.models.schemas import (
    Evidence5PCategory,
    EvidenceType,
    RCAAnalysis,
    RCALevel,
    RCAStatus,
    RootCauseLevel,
    Solution,
)


@tool(
    "classify_rca_event",
    "Classify event into RCA Level 1/2/3 based on consequence and frequency. Returns level and team requirements.",
    {"type": "object", "properties": {"max_consequence": {"type": "integer"}, "frequency": {"type": "integer"}}, "required": ["max_consequence", "frequency"]},
)
def classify_rca_event(max_consequence: int, frequency: int) -> str:
    level, team_req = RCAEngine.classify_event(max_consequence, frequency)
    return json.dumps({"level": level.value, "team_requirements": team_req})


@tool(
    "create_rca_analysis",
    "Create a new RCA analysis in OPEN status. Returns the analysis object.",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def create_rca_analysis(input_json: str) -> str:
    data = json.loads(input_json)
    level = RCALevel(data.get("level", "1"))
    result = RCAEngine.create_analysis(
        event_description=data["event_description"],
        plant_id=data.get("plant_id", ""),
        equipment_id=data.get("equipment_id"),
        level=level,
        team_members=data.get("team_members"),
    )
    return json.dumps(result.model_dump(), default=str)


@tool(
    "run_rca_5w2h",
    "Run 5W+2H structured analysis. Returns Analysis5W2H with generated report.",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def run_rca_5w2h(input_json: str) -> str:
    data = json.loads(input_json)
    result = RCAEngine.run_5w2h(
        what=data["what"], when=data["when"], where=data["where"],
        who=data["who"], why=data["why"], how=data["how"], how_much=data["how_much"],
    )
    return json.dumps(result.model_dump(), default=str)


@tool(
    "add_rca_cause",
    "Add a cause to the cause-effect diagram of an RCA analysis.",
    {"type": "object", "properties": {"analysis_json": {"type": "string"}, "cause_text": {"type": "string"}, "evidence_type": {"type": "string"}, "parent_cause_id": {"type": "string"}}, "required": ["analysis_json", "cause_text", "evidence_type"]},
)
def add_rca_cause(analysis_json: str, cause_text: str, evidence_type: str, parent_cause_id: str = "") -> str:
    analysis = RCAAnalysis(**json.loads(analysis_json))
    ev_type = EvidenceType(evidence_type)
    parent = parent_cause_id if parent_cause_id else None
    updated = RCAEngine.add_cause(analysis, cause_text, ev_type, parent)
    return json.dumps(updated.model_dump(), default=str)


@tool(
    "classify_root_cause",
    "Assign root cause level (PHYSICAL/HUMAN/LATENT) to a cause in the analysis.",
    {"type": "object", "properties": {"analysis_json": {"type": "string"}, "cause_id": {"type": "string"}, "level": {"type": "string"}}, "required": ["analysis_json", "cause_id", "level"]},
)
def classify_root_cause(analysis_json: str, cause_id: str, level: str) -> str:
    analysis = RCAAnalysis(**json.loads(analysis_json))
    rc_level = RootCauseLevel(level)
    updated = RCAEngine.classify_root_cause_level(analysis, cause_id, rc_level)
    return json.dumps(updated.model_dump(), default=str)


@tool(
    "validate_rca_chain",
    "Validate root cause chain completeness. Returns list of errors (empty = valid).",
    {"type": "object", "properties": {"analysis_json": {"type": "string"}}, "required": ["analysis_json"]},
)
def validate_rca_chain(analysis_json: str) -> str:
    analysis = RCAAnalysis(**json.loads(analysis_json))
    errors = RCAEngine.validate_root_cause_chain(analysis)
    return json.dumps({"valid": len(errors) == 0, "errors": errors})


@tool(
    "collect_rca_evidence",
    "Add 5P evidence (PARTS/POSITION/PEOPLE/PAPERS/PARADIGMS) to an RCA analysis.",
    {"type": "object", "properties": {"analysis_json": {"type": "string"}, "category": {"type": "string"}, "description": {"type": "string"}, "source": {"type": "string"}, "fragility_score": {"type": "number"}}, "required": ["analysis_json", "category", "description"]},
)
def collect_rca_evidence(analysis_json: str, category: str, description: str, source: str = "", fragility_score: float = 0.0) -> str:
    analysis = RCAAnalysis(**json.loads(analysis_json))
    cat = Evidence5PCategory(category)
    updated = RCAEngine.collect_evidence_5p(analysis, cat, description, source, fragility_score)
    return json.dumps(updated.model_dump(), default=str)


@tool(
    "evaluate_rca_solution",
    "Evaluate a solution against the 5-question filter. All 5 must pass.",
    {"type": "object", "properties": {"solution_json": {"type": "string"}, "five_questions": {"type": "string"}}, "required": ["solution_json", "five_questions"]},
)
def evaluate_rca_solution(solution_json: str, five_questions: str) -> str:
    solution = Solution(**json.loads(solution_json))
    questions = json.loads(five_questions)
    passes = RCAEngine.evaluate_solution(solution, questions)
    return json.dumps({"passes": passes, "solution": solution.model_dump()}, default=str)


@tool(
    "prioritize_rca_solutions",
    "Prioritize solutions by Cost-Benefit x Difficulty quadrant. Returns ranked list.",
    {"type": "object", "properties": {"solutions_json": {"type": "string"}}, "required": ["solutions_json"]},
)
def prioritize_rca_solutions(solutions_json: str) -> str:
    solutions = [Solution(**s) for s in json.loads(solutions_json)]
    result = RCAEngine.prioritize_solutions(solutions)
    return json.dumps([r.model_dump() for r in result], default=str)


@tool(
    "advance_rca_status",
    "Advance RCA analysis status. Lifecycle: OPEN->UNDER_INVESTIGATION->COMPLETED->REVIEWED.",
    {"type": "object", "properties": {"analysis_json": {"type": "string"}, "target_status": {"type": "string"}}, "required": ["analysis_json", "target_status"]},
)
def advance_rca_status(analysis_json: str, target_status: str) -> str:
    analysis = RCAAnalysis(**json.loads(analysis_json))
    target = RCAStatus(target_status)
    updated, message = RCAEngine.advance_status(analysis, target)
    return json.dumps({"analysis": updated.model_dump(), "message": message}, default=str)


@tool(
    "compute_de_kpis",
    "Compute 5 Defect Elimination KPIs per GFSN REF-15.",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def compute_de_kpis(input_json: str) -> str:
    data = json.loads(input_json)
    result = RCAEngine.compute_de_kpis(
        plant_id=data["plant_id"],
        period_start=date.fromisoformat(data["period_start"]),
        period_end=date.fromisoformat(data["period_end"]),
        events_reported=data["events_reported"],
        events_required=data["events_required"],
        meetings_held=data["meetings_held"],
        meetings_required=data["meetings_required"],
        actions_implemented=data["actions_implemented"],
        actions_planned=data["actions_planned"],
        savings_achieved=data["savings_achieved"],
        savings_target=data["savings_target"],
        failures_current=data["failures_current"],
        failures_previous=data["failures_previous"],
    )
    return json.dumps(result.model_dump(), default=str)
