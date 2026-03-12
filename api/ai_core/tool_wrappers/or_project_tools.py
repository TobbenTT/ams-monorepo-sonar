"""OR System project management and quality scoring tools.

Serves Project Orchestrator (AG-007), Finance (AG-010),
IT/OT (AG-012), and Contracts (AG-005) agents.
"""

import json
from datetime import datetime
from api.ai_core.tool_wrappers.registry import tool


@tool(
    "calculate_evm",
    "Compute Earned Value Management metrics: SPI, CPI, EAC, TCPI.",
    {
        "type": "object",
        "properties": {
            "input_json": {
                "type": "string",
                "description": "JSON with: planned_value (PV), earned_value (EV), actual_cost (AC), budget_at_completion (BAC)"
            }
        },
        "required": ["input_json"]
    },
)
def calculate_evm(input_json: str) -> str:
    data = json.loads(input_json)
    pv = float(data["planned_value"])
    ev = float(data["earned_value"])
    ac = float(data["actual_cost"])
    bac = float(data["budget_at_completion"])

    spi = ev / pv if pv > 0 else 0
    cpi = ev / ac if ac > 0 else 0
    sv = ev - pv
    cv = ev - ac
    eac = bac / cpi if cpi > 0 else bac
    etc = eac - ac
    tcpi = (bac - ev) / (bac - ac) if (bac - ac) > 0 else 0

    status = "GREEN"
    alerts = []
    if cpi < 0.90:
        status = "RED"
        alerts.append(f"CPI {cpi:.2f} below threshold 0.90 — recovery plan required")
    elif cpi < 0.95:
        status = "AMBER"
        alerts.append(f"CPI {cpi:.2f} trending below target")
    if spi < 0.85:
        status = "RED"
        alerts.append(f"SPI {spi:.2f} below threshold 0.85 — schedule recovery required")

    return json.dumps({
        "metrics": {
            "SPI": round(spi, 3),
            "CPI": round(cpi, 3),
            "SV": round(sv, 2),
            "CV": round(cv, 2),
            "EAC": round(eac, 2),
            "ETC": round(etc, 2),
            "TCPI": round(tcpi, 3),
        },
        "status": status,
        "alerts": alerts,
        "interpretation": {
            "SPI": "On schedule" if spi >= 0.95 else "Behind schedule",
            "CPI": "Under budget" if cpi >= 1.0 else "Over budget" if cpi < 0.90 else "Slightly over budget",
        },
    })


@tool(
    "generate_cash_flow",
    "Generate a monthly cash flow model for a project.",
    {
        "type": "object",
        "properties": {
            "input_json": {
                "type": "string",
                "description": "JSON with: total_budget, start_date, duration_months, spend_profile (front/back/uniform), currency"
            }
        },
        "required": ["input_json"]
    },
)
def generate_cash_flow(input_json: str) -> str:
    data = json.loads(input_json)
    budget = float(data.get("total_budget", 0))
    months = int(data.get("duration_months", 12))
    profile = data.get("spend_profile", "uniform")
    currency = data.get("currency", "USD")
    start = datetime.fromisoformat(data.get("start_date", datetime.now().isoformat()))

    if profile == "front":
        weights = [max(0.1, 1 - i / months * 0.8) for i in range(months)]
    elif profile == "back":
        weights = [(i + 1) / months * 1.5 for i in range(months)]
    else:
        weights = [1.0] * months

    total_weight = sum(weights)
    normalized = [w / total_weight for w in weights]

    cash_flow = []
    cumulative = 0.0
    for i, w in enumerate(normalized):
        month_offset = i
        year = start.year + (start.month + month_offset - 1) // 12
        month = ((start.month + month_offset - 1) % 12) + 1
        spend = round(budget * w, 2)
        cumulative += spend
        cash_flow.append({
            "month": i + 1,
            "period": f"{year}-{month:02d}",
            "spend": spend,
            "cumulative": round(cumulative, 2),
            "pct_complete": round(cumulative / budget * 100, 1) if budget > 0 else 0,
        })

    return json.dumps({
        "total_budget": budget,
        "currency": currency,
        "duration_months": months,
        "spend_profile": profile,
        "monthly_cash_flow": cash_flow,
    })


@tool(
    "update_risk_register",
    "Add or update project risks with probability x impact scoring and risk level classification.",
    {
        "type": "object",
        "properties": {
            "input_json": {
                "type": "string",
                "description": "JSON with: risks (list of {id, description, category, probability (1-5), impact (1-5), mitigation, owner})"
            }
        },
        "required": ["input_json"]
    },
)
def update_risk_register(input_json: str) -> str:
    data = json.loads(input_json)
    risks = data.get("risks", [])

    processed = []
    for risk in risks:
        prob = int(risk.get("probability", 3))
        impact = int(risk.get("impact", 3))
        score = prob * impact

        if score >= 15:
            level = "CRITICAL"
        elif score >= 9:
            level = "HIGH"
        elif score >= 5:
            level = "MEDIUM"
        else:
            level = "LOW"

        processed.append({
            **risk,
            "risk_score": score,
            "risk_level": level,
            "action_required": score >= 9,
            "updated_at": datetime.now().isoformat(),
        })

    processed.sort(key=lambda x: x["risk_score"], reverse=True)
    critical_count = sum(1 for r in processed if r["risk_level"] == "CRITICAL")
    high_count = sum(1 for r in processed if r["risk_level"] == "HIGH")

    return json.dumps({
        "risk_register": processed,
        "summary": {
            "total_risks": len(processed),
            "critical": critical_count,
            "high": high_count,
            "requires_escalation": critical_count > 0,
        }
    })


@tool(
    "score_deliverable_quality",
    "Score an OR deliverable against the VSC quality gate (7 dimensions, >91% threshold).",
    {
        "type": "object",
        "properties": {
            "input_json": {
                "type": "string",
                "description": "JSON with: deliverable_name, technical_accuracy (0-100), completeness (0-100), consistency (0-100), format (0-100), actionability (0-100), traceability (0-100), intent_alignment (0-100, optional)"
            }
        },
        "required": ["input_json"]
    },
)
def score_deliverable_quality(input_json: str) -> str:
    data = json.loads(input_json)

    weights = {
        "technical_accuracy": 0.25,
        "completeness": 0.20,
        "consistency": 0.15,
        "format": 0.10,
        "actionability": 0.10,
        "traceability": 0.10,
        "intent_alignment": 0.10,
    }

    scores = {}
    weighted_sum = 0.0
    total_weight = 0.0

    for dim, weight in weights.items():
        raw = data.get(dim)
        if raw is None and dim == "intent_alignment":
            continue
        score = float(raw) if raw is not None else 0.0
        scores[dim] = score
        weighted_sum += score * weight
        total_weight += weight

    overall = weighted_sum / total_weight if total_weight > 0 else 0.0
    threshold = 91.0
    passed = overall >= threshold
    gaps = [dim for dim, score in scores.items() if score < threshold]

    return json.dumps({
        "deliverable": data.get("deliverable_name", "Unnamed"),
        "overall_score": round(overall, 1),
        "threshold": threshold,
        "passed": passed,
        "status": "APPROVED" if passed else "NEEDS_REVISION",
        "dimension_scores": scores,
        "improvement_areas": gaps if not passed else [],
        "message": "Quality gate PASSED." if passed else f"Quality gate FAILED ({overall:.1f}%). Revise: {', '.join(gaps)}",
    })


@tool(
    "assess_labor_compliance",
    "Check labor law and local content compliance requirements for a project jurisdiction.",
    {
        "type": "object",
        "properties": {
            "input_json": {
                "type": "string",
                "description": "JSON with: country, sector (mining/oil_gas/chemicals/fertilizers), local_content_pct (proposed), total_workforce"
            }
        },
        "required": ["input_json"]
    },
)
def assess_labor_compliance(input_json: str) -> str:
    data = json.loads(input_json)
    country = data.get("country", "Unknown")
    local_pct = float(data.get("local_content_pct", 0))

    # Generic thresholds by region (approximate — must be verified for actual projects)
    thresholds = {
        "default": {"local_content_min": 30, "work_permit_required": True, "collective_bargaining": False},
        "morocco": {"local_content_min": 40, "work_permit_required": True, "collective_bargaining": True},
        "chile": {"local_content_min": 0, "work_permit_required": False, "collective_bargaining": True},
        "peru": {"local_content_min": 0, "work_permit_required": False, "collective_bargaining": True},
        "indonesia": {"local_content_min": 50, "work_permit_required": True, "collective_bargaining": False},
        "nigeria": {"local_content_min": 70, "work_permit_required": True, "collective_bargaining": True},
    }

    rules = thresholds.get(country.lower(), thresholds["default"])
    meets_local = local_pct >= rules["local_content_min"]

    return json.dumps({
        "country": country,
        "proposed_local_content_pct": local_pct,
        "minimum_required_pct": rules["local_content_min"],
        "meets_local_content": meets_local,
        "work_permits_required": rules["work_permit_required"],
        "collective_bargaining_applicable": rules["collective_bargaining"],
        "compliance_status": "COMPLIANT" if meets_local else "NON-COMPLIANT",
        "actions": [] if meets_local else [
            f"Increase local hiring to meet {rules['local_content_min']}% minimum",
            "Review expatriate staffing plan",
            "Engage local content authority for compliance plan",
        ],
        "disclaimer": "This is a preliminary assessment. Verify against current local regulations before finalization.",
    })
