"""Agentic Training Scenario Service — CU-EXT-8.

Generates 3D training scenarios for technician skill development.
Uses work instruction data + Blender renders + Gemma 4 narrative generation.
"""

import logging
import time
import uuid
from datetime import datetime

from sqlalchemy.orm import Session

from api.services.ai_provider_service import generate_text

log = logging.getLogger("ocp_maintenance")

_SYSTEM_PROMPT = """You are an industrial maintenance training content creator.
Given an equipment type and maintenance scenario type, generate a step-by-step
training sequence for field technicians.

Each step must include:
1. Step number
2. Clear description of what to do
3. Tools required
4. Safety warnings (if applicable)
5. Recommended camera angle for 3D visualization (front/side/top/isometric/detail)
6. Estimated time in minutes

Respond ONLY with valid JSON:
{
  "title": "string",
  "total_steps": int,
  "estimated_duration_minutes": int,
  "difficulty_level": "BEGINNER|INTERMEDIATE|ADVANCED",
  "steps": [
    {
      "step_num": int,
      "description": "string",
      "tools": ["tool1", "tool2"],
      "warnings": ["warning1"],
      "render_angle": "front|side|top|isometric|detail",
      "estimated_minutes": int
    }
  ],
  "prerequisites": ["string"],
  "safety_overview": "string"
}"""


def generate_training_scenario(
    db: Session,
    equipment_type: str,
    *,
    scenario_type: str = "DISASSEMBLY",
    instruction_id: str | None = None,
    plant_id: str = "OCP-JFC1",
    provider: str = "auto",
) -> dict:
    """Generate a training scenario with step-by-step instructions."""
    from api.database.models import TrainingScenarioModel, WorkInstructionModel

    start = time.time()

    # Load existing work instruction if provided
    wi_context = ""
    if instruction_id:
        wi = db.query(WorkInstructionModel).filter_by(instruction_id=instruction_id).first()
        if wi:
            wi_context = (
                f"\nExisting work instruction: {wi.title}\n"
                f"Operations: {wi.operations}\n"
                f"Safety: {wi.safety_section}\n"
            )

    prompt = (
        f"Create a {scenario_type} training scenario for a {equipment_type}.\n"
        f"The scenario should teach field technicians the correct procedure.\n"
        f"{wi_context}\n"
        f"Generate detailed step-by-step instructions."
    )

    result = generate_text(
        prompt=prompt,
        system_prompt=_SYSTEM_PROMPT,
        provider=provider,
        format_json=True,
    )

    parsed = result.get("parsed", {}) or {}
    ai_provider = result.get("provider", "unknown")

    steps = parsed.get("steps", [])
    title = parsed.get("title", f"{scenario_type} - {equipment_type}")

    # Persist scenario
    scenario_id = str(uuid.uuid4())
    try:
        scenario = TrainingScenarioModel(
            scenario_id=scenario_id,
            instruction_id=instruction_id,
            equipment_type=equipment_type,
            title=title,
            scenario_type=scenario_type,
            steps=steps,
            total_steps=len(steps),
            difficulty_level=parsed.get("difficulty_level", "INTERMEDIATE"),
            estimated_duration_minutes=parsed.get("estimated_duration_minutes", 30),
            ai_generated=True,
            ai_provider=ai_provider,
            status="DRAFT",
        )
        db.add(scenario)
        db.commit()
    except Exception as e:
        log.error("Failed to persist training scenario: %s", e)
        db.rollback()

    duration_ms = int((time.time() - start) * 1000)

    return {
        "scenario_id": scenario_id,
        "title": title,
        "equipment_type": equipment_type,
        "scenario_type": scenario_type,
        "total_steps": len(steps),
        "estimated_duration_minutes": parsed.get("estimated_duration_minutes", 30),
        "difficulty_level": parsed.get("difficulty_level", "INTERMEDIATE"),
        "steps": steps,
        "prerequisites": parsed.get("prerequisites", []),
        "safety_overview": parsed.get("safety_overview", ""),
        "provider": ai_provider,
        "duration_ms": duration_ms,
    }


def record_training_progress(
    db: Session,
    scenario_id: str,
    technician_id: str,
    steps_completed: int,
) -> dict:
    """Record technician progress through a training scenario."""
    from api.database.models import TrainingCompletionModel, TrainingScenarioModel

    scenario = db.query(TrainingScenarioModel).filter_by(scenario_id=scenario_id).first()
    if not scenario:
        return {"error": f"Scenario {scenario_id} not found"}

    # Find or create completion record
    completion = (
        db.query(TrainingCompletionModel)
        .filter_by(scenario_id=scenario_id, technician_id=technician_id)
        .first()
    )

    if not completion:
        completion = TrainingCompletionModel(
            completion_id=str(uuid.uuid4()),
            scenario_id=scenario_id,
            technician_id=technician_id,
            steps_completed=0,
        )
        db.add(completion)

    completion.steps_completed = steps_completed
    if steps_completed >= scenario.total_steps:
        completion.status = "COMPLETED"
        completion.completed_at = datetime.now()
        completion.score = round(steps_completed / max(scenario.total_steps, 1) * 100, 1)

    db.commit()

    return {
        "completion_id": completion.completion_id,
        "scenario_id": scenario_id,
        "technician_id": technician_id,
        "steps_completed": steps_completed,
        "total_steps": scenario.total_steps,
        "status": completion.status,
        "score": completion.score,
    }
