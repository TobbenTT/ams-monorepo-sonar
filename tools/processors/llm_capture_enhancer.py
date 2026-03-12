"""LLM Capture Enhancer — G-08 D-3 skill wiring.

When the deterministic FieldCaptureProcessor produces a low-confidence result
(equipment confidence < 0.7 OR no failure mode detected), this enhancer calls
Claude with the identify-work-request skill context to improve:
  - Equipment TAG resolution
  - Failure mode classification (validated against 72-combo MASTER table)
  - Priority justification
  - Structured description

Design principles:
  - Only triggered on low confidence (cost control: ~5-10% of captures)
  - Always returns valid StructuredWorkRequest (never raises on Claude error)
  - Confidence threshold configurable via CONFIDENCE_THRESHOLD constant
  - Sets resolution_method = LLM_ENHANCED on the equipment identification
"""

import json
import logging
import re
from datetime import datetime
from typing import Optional

from tools.models.schemas import (
    AIClassification,
    EquipmentIdentification,
    FieldCaptureInput,
    ImageAnalysis,
    Priority,
    ProblemDescription,
    ResolutionMethod,
    StructuredWorkRequest,
    WorkOrderType,
    WorkRequestStatus,
)

logger = logging.getLogger(__name__)

CONFIDENCE_THRESHOLD = 0.7  # Below this → trigger LLM enhancement

# Compact FM validation matrix embedded in prompt (from MASTER.md)
_FM_MATRIX = """\
VALID MECHANISM+CAUSE COMBINATIONS (72 total — use UPPERCASE, exact spelling):
ARCS: Breakdown in insulation
BLOCKS: Contamination | Excessive particle size | Insufficient fluid velocity
BREAKS/FRACTURE/SEPARATES: Cyclic loading | Mechanical overload | Thermal overload
CORRODES: Bio-organisms | Chemical attack | Corrosive environment | Crevice | Dissimilar metals contact | Exposure to atmosphere | High temp corrosive environment | High temp environment | Liquid metal | Poor electrical connections | Poor electrical insulation
CRACKS: Age | Cyclic loading | Excessive temperature | High temp corrosive environment | Impact/shock loading | Thermal stresses
DEGRADES: Age | Chemical attack | Chemical reaction | Contamination | Electrical arcing | Entrained air | Excessive temperature | Radiation
DISTORTS: Impact/shock loading | Mechanical overload | Off-center loading | Use
DRIFTS: Excessive temperature | Impact/shock loading | Stray current | Uneven loading | Use
EXPIRES: Age
IMMOBILISED: Contamination | Lack of lubrication
LOOSES PRELOAD: Creep | Excessive temperature | Vibration
OPEN-CIRCUIT: Electrical overload
OVERHEATS/MELTS: Contamination | Electrical overload | Lack of lubrication | Mechanical overload | Relative movement | Rubbing
SEVERS: Abrasion | Impact/shock loading | Mechanical overload
SHORT-CIRCUITS: Breakdown in insulation | Contamination
THERMALLY OVERLOADS: Mechanical overload | Overcurrent
WASHES OFF: Excessive fluid velocity | Use
WEARS: Breakdown of lubrication | Entrained air | Excessive fluid velocity | Impact/shock loading | Low pressure | Lubricant contamination | Mechanical overload | Metal to metal contact | Relative movement"""

_SYSTEM_PROMPT = f"""\
You are the identify-work-request skill for OCP (Office Chérifien des Phosphates) AMS.
Your task: improve a partial work request produced by a deterministic processor that had low confidence.

CONTEXT — OCP is a phosphate mining company (Morocco). Equipment includes:
SAG mills, ball mills, flotation cells, thickeners, pumps, conveyors, crushers, cyclones.

RULES (non-negotiable):
1. FAILURE MODE: Must use EXACT mechanism+cause pair from the valid combinations below.
   Format: "MECHANISM | Cause" (pipe-separated). Example: "CORRODES | Corrosive environment"
2. FAILURE MODE CODE: "MECHANISM+CAUSE_UNDERSCORED". Example: "CORRODES+CORROSIVE_ENVIRONMENT"
3. SAP SHORT TEXT: structured_description must be ≤ 72 characters. Format: "[TAG] [FM code short] [symptom]"
4. T-16 RULE: If mechanism is WEARS, CORRODES, BREAKS/FRACTURE/SEPARATES → material/spare parts are MANDATORY.
5. PRIORITY: Based on equipment_down (Y/N) × criticality (A/B/C) × safety_flag (Y/N):
   - equipment_down + safety → 1_EMERGENCY
   - equipment_down → 2_URGENT
   - A-criticality without shutdown → 2_URGENT or 3_NORMAL
   - Planned/preventive → 4_PLANNED
6. STATUS: Always DRAFT.
7. Confidence scores: float 0.0–1.0. Use 0.85 when you are confident, 0.65 when uncertain.

{_FM_MATRIX}

Respond ONLY with a JSON object (no preamble, no markdown fences):
{{
  "equipment_tag": "<best TAG match from registry, or keep existing>",
  "equipment_id": "<equipment_id from registry if match found, else keep existing>",
  "equipment_confidence": 0.85,
  "failure_mode_detected": "<MECHANISM | Cause>",
  "failure_mode_code": "<MECHANISM+CAUSE_CODE>",
  "affected_component": "<component name>",
  "structured_description": "<≤72 chars>",
  "structured_description_fr": "<French translation ≤72 chars>",
  "work_order_type": "PM01_PREVENTIVE" | "PM02_PREDICTIVE" | "PM03_CORRECTIVE",
  "priority_suggested": "1_EMERGENCY" | "2_URGENT" | "3_NORMAL" | "4_PLANNED",
  "priority_justification": "<1-2 sentences>",
  "safety_flags": ["<flag1>", ...],
  "required_specialties": ["<specialty>", ...]
}}
"""


class LLMCaptureEnhancer:
    """Enhances low-confidence captures using Claude (identify-work-request skill).

    Usage:
        enhancer = LLMCaptureEnhancer(api_key="sk-ant-...")
        enhanced_wr = enhancer.enhance(capture_input, partial_wr, image_analysis)
    """

    def __init__(self, api_key: str, model: str = "claude-haiku-4-5-20251001") -> None:
        """Use Haiku for cost efficiency — enhancement calls are frequent."""
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY required for LLM enhancement.")
        try:
            import anthropic
            self._client = anthropic.Anthropic(api_key=api_key)
        except ImportError as exc:
            raise RuntimeError("anthropic package not installed.") from exc
        self._model = model

    def needs_enhancement(self, wr: StructuredWorkRequest) -> bool:
        """Return True if the work request should be enhanced."""
        low_equipment_confidence = wr.equipment_identification.confidence_score < CONFIDENCE_THRESHOLD
        no_failure_mode = not wr.problem_description.failure_mode_code
        return low_equipment_confidence or no_failure_mode

    def enhance(
        self,
        capture_input: FieldCaptureInput,
        partial_wr: StructuredWorkRequest,
        image_analysis: Optional[ImageAnalysis] = None,
    ) -> StructuredWorkRequest:
        """Enhance a work request using Claude.

        Args:
            capture_input: Original field capture (text/voice/images).
            partial_wr: Work request from deterministic processor.
            image_analysis: Optional pre-computed image analysis.

        Returns:
            Enhanced StructuredWorkRequest. Falls back to partial_wr on any error.
        """
        if not self.needs_enhancement(partial_wr):
            return partial_wr

        logger.info(
            "LLM enhancement triggered: equipment_confidence=%.2f, fm_code=%s",
            partial_wr.equipment_identification.confidence_score,
            partial_wr.problem_description.failure_mode_code or "NONE",
        )

        try:
            raw_text = self._build_context(capture_input, partial_wr, image_analysis)
            response_text = self._call_claude(raw_text)
            data = self._parse_json(response_text)
            return self._apply_improvements(partial_wr, data)
        except Exception as exc:
            logger.warning("LLM enhancement failed (using deterministic result): %s", exc)
            return partial_wr

    def _build_context(
        self,
        capture_input: FieldCaptureInput,
        partial_wr: StructuredWorkRequest,
        image_analysis: Optional[ImageAnalysis],
    ) -> str:
        """Build user message context for Claude."""
        lines = []

        raw = capture_input.raw_voice_text or capture_input.raw_text_input or ""
        lines.append(f"TECHNICIAN INPUT: {raw}")
        lines.append(f"LANGUAGE: {capture_input.language_detected.value}")

        lines.append(
            f"\nDETERMINISTIC RESULT (low confidence — please improve):\n"
            f"  equipment_tag: {partial_wr.equipment_identification.equipment_tag}\n"
            f"  equipment_confidence: {partial_wr.equipment_identification.confidence_score:.2f}\n"
            f"  failure_mode_code: {partial_wr.problem_description.failure_mode_code or 'NOT DETECTED'}\n"
            f"  priority: {partial_wr.ai_classification.priority_suggested.value}"
        )

        if image_analysis:
            lines.append(
                f"\nIMAGE ANALYSIS:\n"
                f"  component: {image_analysis.component_identified or 'unknown'}\n"
                f"  anomalies: {', '.join(image_analysis.anomalies_detected) or 'none'}\n"
                f"  severity: {image_analysis.severity_visual.value if image_analysis.severity_visual else 'unknown'}"
            )

        if capture_input.equipment_tag_manual:
            lines.append(f"\nTECHNICIAN TAG HINT: {capture_input.equipment_tag_manual}")
        if capture_input.location_hint:
            lines.append(f"LOCATION HINT: {capture_input.location_hint}")

        return "\n".join(lines)

    def _call_claude(self, user_message: str) -> str:
        """Call Claude and return the raw response text."""
        response = self._client.messages.create(
            model=self._model,
            max_tokens=800,
            system=_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_message}],
        )
        return response.content[0].text.strip()

    def _parse_json(self, raw: str) -> dict:
        """Parse Claude's JSON response."""
        cleaned = re.sub(r"```(?:json)?\s*|\s*```", "", raw).strip()
        return json.loads(cleaned)

    def _apply_improvements(
        self,
        partial_wr: StructuredWorkRequest,
        data: dict,
    ) -> StructuredWorkRequest:
        """Apply Claude's improvements to the partial work request."""
        eq = partial_wr.equipment_identification
        pd = partial_wr.problem_description
        ac = partial_wr.ai_classification

        # Equipment identification
        new_eq = EquipmentIdentification(
            equipment_id=data.get("equipment_id") or eq.equipment_id,
            equipment_tag=data.get("equipment_tag") or eq.equipment_tag,
            confidence_score=float(data.get("equipment_confidence") or eq.confidence_score),
            resolution_method=ResolutionMethod.LLM_ENHANCED,
        )

        # Problem description
        structured_desc = (data.get("structured_description") or pd.structured_description)[:72]
        structured_desc_fr = (data.get("structured_description_fr") or pd.structured_description_fr)[:72]

        new_pd = ProblemDescription(
            original_text=pd.original_text,
            structured_description=structured_desc,
            structured_description_fr=structured_desc_fr,
            failure_mode_detected=data.get("failure_mode_detected") or pd.failure_mode_detected,
            failure_mode_code=data.get("failure_mode_code") or pd.failure_mode_code,
            affected_component=data.get("affected_component") or pd.affected_component,
        )

        # AI classification
        priority_raw = data.get("priority_suggested") or ac.priority_suggested.value
        try:
            priority = Priority(priority_raw)
        except ValueError:
            priority = ac.priority_suggested

        wo_type_raw = data.get("work_order_type") or ac.work_order_type.value
        try:
            wo_type = WorkOrderType(wo_type_raw)
        except ValueError:
            wo_type = ac.work_order_type

        new_ac = AIClassification(
            work_order_type=wo_type,
            priority_suggested=priority,
            priority_justification=data.get("priority_justification") or ac.priority_justification,
            estimated_duration_hours=ac.estimated_duration_hours,
            required_specialties=data.get("required_specialties") or ac.required_specialties,
            safety_flags=data.get("safety_flags") or ac.safety_flags,
        )

        return StructuredWorkRequest(
            request_id=partial_wr.request_id,
            source_capture_id=partial_wr.source_capture_id,
            created_at=partial_wr.created_at,
            status=WorkRequestStatus.DRAFT,
            equipment_identification=new_eq,
            problem_description=new_pd,
            ai_classification=new_ac,
            spare_parts_suggested=partial_wr.spare_parts_suggested,
            image_analysis=partial_wr.image_analysis,
            validation=partial_wr.validation,
        )


def get_llm_enhancer() -> LLMCaptureEnhancer:
    """Factory: creates LLMCaptureEnhancer from app settings."""
    from api.config import settings
    return LLMCaptureEnhancer(api_key=settings.ANTHROPIC_API_KEY)
