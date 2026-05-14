"""OR System operational tools: org design, staffing, SOPs, ramp-up, FEL gates.

Serves Operations (AG-002), Execution (AG-006), HR & Talent (AG-011),
Project Orchestrator (AG-007), and Construction (AG-009) agents.
"""

import json
from datetime import datetime, timedelta
from api.ai_core.tool_wrappers.registry import tool


@tool(
    "generate_org_chart",
    "Generate an organizational structure with roles, reporting lines, and headcount.",
    {
        "type": "object",
        "properties": {
            "input_json": {
                "type": "string",
                "description": "JSON with: plant_name, shift_pattern (4x2/3x2/etc), departments (list), total_headcount"
            }
        },
        "required": ["input_json"]
    },
)
def generate_org_chart(input_json: str) -> str:
    data = json.loads(input_json)
    plant = data.get("plant_name", "Plant")
    shift = data.get("shift_pattern", "4x2")
    departments = data.get("departments", ["Operations", "Maintenance", "HSE", "Logistics"])
    headcount = data.get("total_headcount", 0)

    structure = {
        "plant": plant,
        "shift_pattern": shift,
        "total_headcount": headcount,
        "hierarchy": {
            "Plant Manager": {
                "level": 1,
                "reports_to": None,
                "departments": departments,
            }
        },
        "departments": [
            {
                "name": dept,
                "manager_title": f"{dept} Superintendent",
                "shift_crews": 4 if "4x2" in shift else 3,
            }
            for dept in departments
        ],
        "metadata": {
            "generated_at": datetime.now().isoformat(),
            "note": "Draft — requires HR & Talent Agent review for local content compliance.",
        }
    }
    return json.dumps(structure)


@tool(
    "calculate_staffing_plan",
    "Back-calculate staffing timeline from commissioning date applying recruitment and training lead times.",
    {
        "type": "object",
        "properties": {
            "input_json": {
                "type": "string",
                "description": "JSON with: commissioning_date (ISO), roles (list of {title, count, recruitment_months, training_months, specialized})"
            }
        },
        "required": ["input_json"]
    },
)
def calculate_staffing_plan(input_json: str) -> str:
    data = json.loads(input_json)
    comm_date = datetime.fromisoformat(data.get("commissioning_date", datetime.now().isoformat()))
    roles = data.get("roles", [])

    plan = []
    critical_roles = []

    for role in roles:
        rec_months = role.get("recruitment_months", 3)
        train_months = role.get("training_months", 2)
        specialized = role.get("specialized", False)

        if specialized:
            rec_months = max(rec_months, 6)
            train_months = max(train_months, 3)

        total_lead = rec_months + train_months
        start_recruitment = comm_date - timedelta(days=total_lead * 30)
        start_training = comm_date - timedelta(days=train_months * 30)

        risk = "HIGH" if start_recruitment < datetime.now() else ("MEDIUM" if total_lead > 9 else "LOW")
        entry = {
            "title": role.get("title"),
            "count": role.get("count", 1),
            "recruitment_start": start_recruitment.strftime("%Y-%m-%d"),
            "training_start": start_training.strftime("%Y-%m-%d"),
            "ready_by": comm_date.strftime("%Y-%m-%d"),
            "lead_time_months": total_lead,
            "risk": risk,
        }
        plan.append(entry)

        if start_recruitment < datetime.now():
            critical_roles.append(role.get("title"))

    return json.dumps({
        "staffing_plan": plan,
        "total_roles": len(roles),
        "total_headcount": sum(r.get("count", 1) for r in roles),
        "critical_alerts": critical_roles,
        "commissioning_date": comm_date.strftime("%Y-%m-%d"),
    })


@tool(
    "create_sop",
    "Generate a Standard Operating Procedure structure with all 8 mandatory sections.",
    {
        "type": "object",
        "properties": {
            "input_json": {
                "type": "string",
                "description": "JSON with: title, equipment_tag, operation_type (normal/startup/shutdown/emergency), steps (list)"
            }
        },
        "required": ["input_json"]
    },
)
def create_sop(input_json: str) -> str:
    data = json.loads(input_json)
    eq_tag = data.get("equipment_tag", "GEN")
    op_type = data.get("operation_type", "normal")

    return json.dumps({
        "sop_number": f"SOP-{eq_tag}-{op_type.upper()[:3]}-001",
        "title": data.get("title"),
        "equipment_tag": eq_tag,
        "operation_type": op_type,
        "sections": {
            "1_purpose": f"Define safe and efficient {op_type} operation of {eq_tag}.",
            "2_scope": "Applies to all operations personnel assigned to this equipment.",
            "3_responsibilities": "Operations Lead — execute and verify. Supervisor — authorize startup.",
            "4_ppe_requirements": ["Hard hat", "Safety glasses", "Steel-toed boots", "Chemical gloves (if applicable)"],
            "5_preconditions": ["All isolation points verified", "Area clear of personnel", "Communication confirmed"],
            "6_procedure": data.get("steps", ["[Steps to be completed by Operations Agent]"]),
            "7_emergency_actions": ["Activate ESD", "Evacuate area", "Contact control room"],
            "8_references": [f"P&ID for {eq_tag}", "Emergency Response Plan", "LOTO procedure"],
        },
        "revision": "00",
        "status": "DRAFT",
        "note": "Draft — requires Operations Lead review and HSE Agent sign-off before issuance.",
    })


@tool(
    "generate_rampup_plan",
    "Create a production ramp-up schedule for months 1-12 post-commissioning.",
    {
        "type": "object",
        "properties": {
            "input_json": {
                "type": "string",
                "description": "JSON with: plant_name, design_capacity, capacity_unit, commissioning_date, target_months_to_full"
            }
        },
        "required": ["input_json"]
    },
)
def generate_rampup_plan(input_json: str) -> str:
    data = json.loads(input_json)
    design_cap = float(data.get("design_capacity", 100))
    target_months = int(data.get("target_months_to_full", 6))
    comm_date = datetime.fromisoformat(data.get("commissioning_date", datetime.now().isoformat()))

    ramp_curve = [0.10, 0.25, 0.45, 0.60, 0.72, 0.82, 0.88, 0.92, 0.95, 0.97, 0.98, 1.00]

    schedule = []
    for i in range(12):
        utilization = 1.0 if i >= target_months else ramp_curve[min(i, len(ramp_curve) - 1)]
        year = comm_date.year + (comm_date.month + i - 1) // 12
        month = ((comm_date.month + i - 1) % 12) + 1
        milestones = {
            0: ["First product", "Initial safety review"],
            1: ["Operations KPIs baseline"],
            2: ["Training completion assessment"],
            target_months - 1: ["Full design capacity target"],
            11: ["Annual operations review"],
        }
        schedule.append({
            "month": i + 1,
            "period": f"{year}-{month:02d}",
            "target_utilization_pct": round(utilization * 100, 1),
            "target_production": round(design_cap * utilization, 1),
            "unit": data.get("capacity_unit", "units/day"),
            "key_milestones": milestones.get(i, []),
        })

    return json.dumps({
        "plant": data.get("plant_name"),
        "design_capacity": design_cap,
        "capacity_unit": data.get("capacity_unit", "units/day"),
        "commissioning_date": comm_date.strftime("%Y-%m-%d"),
        "target_full_capacity_month": target_months,
        "rampup_schedule": schedule,
    })


@tool(
    "assess_fel_gate",
    "Check FEL gate readiness against minimum criteria. Returns pass/fail per criterion.",
    {
        "type": "object",
        "properties": {
            "input_json": {
                "type": "string",
                "description": "JSON with: gate (FEL1/FEL2/FEL3/G0/G1/G2/G3/G4), completed_deliverables (list of strings)"
            }
        },
        "required": ["input_json"]
    },
)
def assess_fel_gate(input_json: str) -> str:
    data = json.loads(input_json)
    gate = data.get("gate", "G0").upper()
    completed = [d.lower() for d in data.get("completed_deliverables", [])]

    gate_criteria = {
        "FEL1": ["business case", "alternatives screening", "cost estimate class 5", "project charter draft"],
        "FEL2": ["preferred alternative", "cost estimate class 4", "project charter", "site selection"],
        "FEL3": ["cost estimate class 3", "project execution plan", "procurement strategy", "risk register"],
        "G0": ["scope definition", "plant context", "stakeholder list"],
        "G1": ["equipment hierarchy", "criticality assessment", "procurement plan"],
        "G2": ["maintenance strategy", "sop drafts", "commissioning plan", "staffing plan"],
        "G3": ["fmeca complete", "work packages", "training program", "hse assessment"],
        "G4": ["handover package", "pssr complete", "sap upload", "operations readiness certificate"],
    }

    criteria = gate_criteria.get(gate, gate_criteria["G0"])
    results = []
    passed_count = 0
    for criterion in criteria:
        found = any(criterion in c for c in completed)
        results.append({"criterion": criterion, "status": "PASS" if found else "FAIL"})
        if found:
            passed_count += 1

    all_passed = passed_count == len(criteria)
    return json.dumps({
        "gate": gate,
        "overall": "READY" if all_passed else "NOT READY",
        "score": f"{passed_count}/{len(criteria)}",
        "criteria": results,
        "recommendation": "Advance to next gate." if all_passed else f"Complete {len(criteria) - passed_count} remaining deliverables before advancing.",
    })
