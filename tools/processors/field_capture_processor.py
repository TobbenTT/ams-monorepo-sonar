"""Field Capture Processor — converts FieldCaptureInput into StructuredWorkRequest.

Pipeline: PII redact → extract text → resolve equipment → detect failure mode
(keyword matching against 72 VALID_FM_COMBINATIONS) → calculate priority →
suggest spare parts → build StructuredWorkRequest with DRAFT status.

Deterministic — no LLM required.
"""

from datetime import datetime

from tools.processors.pii_redactor import redact
from tools.engines.equipment_resolver import EquipmentResolver, ResolutionResult
from tools.engines.priority_engine import PriorityEngine, PriorityInput
from tools.engines.material_mapper import MaterialMapper, MaterialSuggestion
from tools.models.schemas import (
    FieldCaptureInput, StructuredWorkRequest,
    EquipmentIdentification, ProblemDescription, AIClassification,
    SuggestedSparePart, ImageAnalysis, Validation,
    Mechanism, Cause, VALID_FM_COMBINATIONS,
    WorkOrderType, Priority, ResolutionMethod, AvailabilityStatus,
    VisualSeverity, WorkRequestStatus,
)


# ── Keyword maps: natural-language tokens → Mechanism/Cause enums ─────

MECHANISM_KEYWORDS: dict[str, Mechanism] = {
    "corrosion": Mechanism.CORRODES, "corroded": Mechanism.CORRODES,
    "corrosive": Mechanism.CORRODES, "rust": Mechanism.CORRODES,
    "rusted": Mechanism.CORRODES, "oxidation": Mechanism.CORRODES,
    "wear": Mechanism.WEARS, "worn": Mechanism.WEARS, "abrasion": Mechanism.WEARS,
    "eroded": Mechanism.WEARS, "erosion": Mechanism.WEARS,
    "crack": Mechanism.CRACKS, "cracked": Mechanism.CRACKS, "fracture": Mechanism.CRACKS,
    "fatigue": Mechanism.CRACKS,
    "break": Mechanism.BREAKS_FRACTURE_SEPARATES, "broken": Mechanism.BREAKS_FRACTURE_SEPARATES,
    "shattered": Mechanism.BREAKS_FRACTURE_SEPARATES, "separated": Mechanism.BREAKS_FRACTURE_SEPARATES,
    "degrade": Mechanism.DEGRADES, "degraded": Mechanism.DEGRADES,
    "deteriorate": Mechanism.DEGRADES, "deterioration": Mechanism.DEGRADES,
    "block": Mechanism.BLOCKS, "blocked": Mechanism.BLOCKS, "clogged": Mechanism.BLOCKS,
    "plugged": Mechanism.BLOCKS,
    "overheat": Mechanism.OVERHEATS_MELTS, "overheated": Mechanism.OVERHEATS_MELTS,
    "melted": Mechanism.OVERHEATS_MELTS, "burned": Mechanism.OVERHEATS_MELTS,
    "hot": Mechanism.OVERHEATS_MELTS,
    "distort": Mechanism.DISTORTS, "distorted": Mechanism.DISTORTS,
    "bent": Mechanism.DISTORTS, "deformed": Mechanism.DISTORTS,
    "drift": Mechanism.DRIFTS, "drifting": Mechanism.DRIFTS,
    "misaligned": Mechanism.DRIFTS, "calibration": Mechanism.DRIFTS,
    "loose": Mechanism.LOOSES_PRELOAD, "loosened": Mechanism.LOOSES_PRELOAD,
    "preload": Mechanism.LOOSES_PRELOAD,
    "immobilised": Mechanism.IMMOBILISED, "seized": Mechanism.IMMOBILISED,
    "stuck": Mechanism.IMMOBILISED, "jammed": Mechanism.IMMOBILISED,
    "arc": Mechanism.ARCS, "arcing": Mechanism.ARCS, "spark": Mechanism.ARCS,
    "short": Mechanism.SHORT_CIRCUITS, "short circuit": Mechanism.SHORT_CIRCUITS,
    "sever": Mechanism.SEVERS, "severed": Mechanism.SEVERS, "cut": Mechanism.SEVERS,
    "open circuit": Mechanism.OPEN_CIRCUIT,
    "expire": Mechanism.EXPIRES, "expired": Mechanism.EXPIRES,
    "end of life": Mechanism.EXPIRES,
    "thermal overload": Mechanism.THERMALLY_OVERLOADS,
    "wash": Mechanism.WASHES_OFF, "washed off": Mechanism.WASHES_OFF,
}

CAUSE_KEYWORDS: dict[str, Cause] = {
    "vibration": Cause.VIBRATION, "vibrating": Cause.VIBRATION,
    "contamination": Cause.CONTAMINATION, "contaminated": Cause.CONTAMINATION,
    "dirty": Cause.CONTAMINATION,
    "lubrication": Cause.LACK_OF_LUBRICATION, "no lube": Cause.LACK_OF_LUBRICATION,
    "dry": Cause.LACK_OF_LUBRICATION, "no grease": Cause.LACK_OF_LUBRICATION,
    "lubricant contamination": Cause.LUBRICANT_CONTAMINATION,
    "oil contaminated": Cause.LUBRICANT_CONTAMINATION,
    "overload": Cause.MECHANICAL_OVERLOAD, "overloaded": Cause.MECHANICAL_OVERLOAD,
    "excessive load": Cause.MECHANICAL_OVERLOAD,
    "cyclic": Cause.CYCLIC_LOADING, "cyclic loading": Cause.CYCLIC_LOADING,
    "fatigue loading": Cause.CYCLIC_LOADING,
    "impact": Cause.IMPACT_SHOCK_LOADING, "shock": Cause.IMPACT_SHOCK_LOADING,
    "temperature": Cause.EXCESSIVE_TEMPERATURE, "high temp": Cause.EXCESSIVE_TEMPERATURE,
    "chemical": Cause.CHEMICAL_ATTACK, "chemical attack": Cause.CHEMICAL_ATTACK,
    "age": Cause.AGE, "aging": Cause.AGE, "old": Cause.AGE,
    "insulation": Cause.BREAKDOWN_IN_INSULATION, "insulation breakdown": Cause.BREAKDOWN_IN_INSULATION,
    "corrosive environment": Cause.CORROSIVE_ENVIRONMENT, "acid": Cause.CORROSIVE_ENVIRONMENT,
    "rubbing": Cause.RUBBING, "friction": Cause.RUBBING,
    "abrasion": Cause.ABRASION, "abrasive": Cause.ABRASION,
    "metal contact": Cause.METAL_TO_METAL_CONTACT, "metal to metal": Cause.METAL_TO_METAL_CONTACT,
    "electrical overload": Cause.ELECTRICAL_OVERLOAD,
    "overcurrent": Cause.OVERCURRENT,
    "creep": Cause.CREEP,
    "thermal stress": Cause.THERMAL_STRESSES,
    "radiation": Cause.RADIATION,
}

# Simple mechanism-to-WO type mapping
_CORRECTIVE_MECHANISMS = {
    Mechanism.BREAKS_FRACTURE_SEPARATES, Mechanism.SEVERS, Mechanism.SHORT_CIRCUITS,
    Mechanism.OPEN_CIRCUIT, Mechanism.ARCS, Mechanism.OVERHEATS_MELTS,
}

# Component type detection keywords
_COMPONENT_KEYWORDS: dict[str, str] = {
    "bearing": "Bearing", "bearings": "Bearing",
    "seal": "Seal", "seals": "Seal",
    "impeller": "Impeller",
    "liner": "Liner", "liners": "Liner",
    "motor": "Motor", "motors": "Motor",
    "coupling": "Coupling", "couplings": "Coupling",
    "filter": "Filter", "filters": "Filter",
    "belt": "Belt", "belts": "Belt",
    "gearbox": "Gearbox", "gear box": "Gearbox",
    "pump": "Pump", "pumps": "Pump",
    "valve": "Valve", "valves": "Valve",
}

# Safety-related keywords
_SAFETY_KEYWORDS = [
    "safety", "danger", "hazard", "toxic", "leak", "leaking", "fire",
    "explosion", "pressure", "gas", "electrical shock", "fall",
    "sécurité", "danger", "fuite", "incendie",
]


class FieldCaptureProcessor:
    """Processes raw field captures into structured work requests."""

    def __init__(self, equipment_registry: list[dict], bom_registry: dict[str, list[dict]] | None = None):
        self.resolver = EquipmentResolver(equipment_registry)
        self.mapper = MaterialMapper(bom_registry)

    def process(self, capture: FieldCaptureInput) -> StructuredWorkRequest:
        """Convert a FieldCaptureInput into a StructuredWorkRequest."""
        # 1. Extract and clean text
        raw_text = self._extract_text(capture)
        cleaned_text, _redacted = redact(raw_text)

        # 2. Resolve equipment
        equipment = self._resolve_equipment(capture, cleaned_text)

        # 3. Detect failure mode (mechanism + cause) against VALID_FM_COMBINATIONS
        mechanism, cause, fm_code = self._detect_failure_mode(cleaned_text)

        # 4. Detect component type
        component = self._detect_component(cleaned_text)

        # 5. Detect safety flags
        safety_flags = self._detect_safety_flags(cleaned_text)

        # 6. Determine work order type
        wo_type = self._determine_wo_type(mechanism)

        # 7. Calculate priority
        priority_result = PriorityEngine.calculate_priority(PriorityInput(
            equipment_criticality="B",  # Default; real lookup would use hierarchy
            has_safety_flags=len(safety_flags) > 0,
            failure_mode_detected=mechanism.value if mechanism else None,
            production_impact_estimated=False,
            is_recurring=False,
            equipment_running=True,
        ))

        # 8. Map priority string to enum
        priority_enum = self._map_priority(priority_result.priority)

        # 9. Suggest spare parts
        spare_parts = self._suggest_spare_parts(
            component, mechanism, equipment.equipment_id if equipment else None
        )

        # 10. Analyse images (basic)
        image_analysis = self._analyse_images(capture) if capture.images else None

        # 11. Build structured description
        structured_desc = self._build_structured_description(
            cleaned_text, mechanism, cause, component
        )
        structured_desc_fr = self._build_structured_description_fr(
            cleaned_text, mechanism, cause, component
        )

        # 12. Determine specialties
        specialties = self._determine_specialties(mechanism, component)

        # 13. Estimate duration
        duration = self._estimate_duration(wo_type, mechanism)

        return StructuredWorkRequest(
            source_capture_id=capture.capture_id,
            created_at=datetime.now(),
            status=WorkRequestStatus.DRAFT,
            equipment_identification=EquipmentIdentification(
                equipment_id=equipment.equipment_id if equipment else "UNKNOWN",
                equipment_tag=equipment.equipment_tag if equipment else "UNKNOWN",
                confidence_score=equipment.confidence if equipment else 0.0,
                resolution_method=self._map_resolution_method(equipment),
            ),
            problem_description=ProblemDescription(
                original_text=raw_text,
                structured_description=structured_desc,
                structured_description_fr=structured_desc_fr,
                failure_mode_detected=mechanism.value if mechanism else None,
                failure_mode_code=fm_code,
                affected_component=component,
            ),
            ai_classification=AIClassification(
                work_order_type=wo_type,
                priority_suggested=priority_enum,
                priority_justification=priority_result.justification,
                estimated_duration_hours=duration,
                required_specialties=specialties,
                safety_flags=safety_flags,
            ),
            spare_parts_suggested=spare_parts,
            image_analysis=image_analysis,
            validation=Validation(),
        )

    @staticmethod
    def _extract_text(capture: FieldCaptureInput) -> str:
        parts = []
        if capture.raw_voice_text:
            parts.append(capture.raw_voice_text)
        if capture.raw_text_input:
            parts.append(capture.raw_text_input)
        if capture.location_hint:
            parts.append(f"Location: {capture.location_hint}")
        return " ".join(parts) if parts else ""

    def _resolve_equipment(self, capture: FieldCaptureInput, text: str) -> ResolutionResult | None:
        if capture.equipment_tag_manual:
            result = self.resolver.resolve(capture.equipment_tag_manual)
            if result:
                return result
        return self.resolver.resolve(text) if text else None

    @staticmethod
    def _detect_failure_mode(text: str) -> tuple[Mechanism | None, Cause | None, str | None]:
        """Detect mechanism + cause from text, validated against VALID_FM_COMBINATIONS."""
        text_lower = text.lower()

        detected_mechanisms: list[Mechanism] = []
        for keyword, mech in MECHANISM_KEYWORDS.items():
            if keyword in text_lower:
                if mech not in detected_mechanisms:
                    detected_mechanisms.append(mech)

        detected_causes: list[Cause] = []
        for keyword, cause in CAUSE_KEYWORDS.items():
            if keyword in text_lower:
                if cause not in detected_causes:
                    detected_causes.append(cause)

        # Find first valid combination from VALID_FM_COMBINATIONS
        for mech in detected_mechanisms:
            for cause in detected_causes:
                if (mech, cause) in VALID_FM_COMBINATIONS:
                    code = f"{mech.value}+{cause.value}"
                    return mech, cause, code

        # If no valid pair, try mechanism with its default causes
        for mech in detected_mechanisms:
            valid_causes = [c for m, c in VALID_FM_COMBINATIONS if m == mech]
            if valid_causes:
                return mech, valid_causes[0], f"{mech.value}+{valid_causes[0].value}"

        # Return mechanism only if found
        if detected_mechanisms:
            return detected_mechanisms[0], None, None

        return None, None, None

    @staticmethod
    def _detect_component(text: str) -> str | None:
        text_lower = text.lower()
        for keyword, component in _COMPONENT_KEYWORDS.items():
            if keyword in text_lower:
                return component
        return None

    @staticmethod
    def _detect_safety_flags(text: str) -> list[str]:
        text_lower = text.lower()
        flags = []
        for kw in _SAFETY_KEYWORDS:
            if kw in text_lower:
                flags.append(kw.upper())
        return flags

    @staticmethod
    def _determine_wo_type(mechanism: Mechanism | None) -> WorkOrderType:
        if mechanism and mechanism in _CORRECTIVE_MECHANISMS:
            return WorkOrderType.PM03_CORRECTIVE
        if mechanism:
            return WorkOrderType.PM02_PREVENTIVE
        return WorkOrderType.PM01_INSPECTION

    @staticmethod
    def _map_priority(priority_str: str) -> Priority:
        mapping = {
            "1_EMERGENCY": Priority.EMERGENCY,
            "2_URGENT": Priority.URGENT,
            "3_NORMAL": Priority.NORMAL,
            "4_PLANNED": Priority.PLANNED,
        }
        return mapping.get(priority_str, Priority.NORMAL)

    def _suggest_spare_parts(
        self, component: str | None, mechanism: Mechanism | None, equipment_id: str | None
    ) -> list[SuggestedSparePart]:
        if not component or not mechanism:
            return []
        # Map mechanism to simplified keyword for MaterialMapper
        mech_simple = self._simplify_mechanism(mechanism)
        suggestions = self.mapper.suggest_materials(component, mech_simple, equipment_id)
        return [
            SuggestedSparePart(
                sap_material_code=s.material_code or f"MAT-{component.upper()[:3]}-001",
                description=s.description,
                quantity_needed=s.quantity,
                availability_status=AvailabilityStatus.UNKNOWN,
            )
            for s in suggestions
        ]

    @staticmethod
    def _simplify_mechanism(mechanism: Mechanism) -> str:
        mapping = {
            Mechanism.WEARS: "WORN",
            Mechanism.CORRODES: "CORRODED",
            Mechanism.CRACKS: "CRACKED",
            Mechanism.BREAKS_FRACTURE_SEPARATES: "BROKEN",
            Mechanism.OVERHEATS_MELTS: "OVERHEATED",
            Mechanism.BLOCKS: "BLOCKED",
            Mechanism.DISTORTS: "DEFORMED",
            Mechanism.DEGRADES: "WORN",
            Mechanism.SEVERS: "BROKEN",
        }
        return mapping.get(mechanism, mechanism.value)

    @staticmethod
    def _analyse_images(capture: FieldCaptureInput) -> ImageAnalysis:
        return ImageAnalysis(
            anomalies_detected=[f"Image captured: {img.image_id}" for img in capture.images],
            component_identified=None,
            severity_visual=VisualSeverity.MEDIUM,
        )

    @staticmethod
    def _build_structured_description(
        text: str, mechanism: Mechanism | None, cause: Cause | None, component: str | None
    ) -> str:
        parts = []
        if component:
            parts.append(f"Affected component: {component}.")
        if mechanism:
            parts.append(f"Failure mechanism: {mechanism.value}.")
        if cause:
            parts.append(f"Probable cause: {cause.value}.")
        parts.append(f"Operator report: {text[:200]}.")
        return " ".join(parts)

    @staticmethod
    def _build_structured_description_fr(
        text: str, mechanism: Mechanism | None, cause: Cause | None, component: str | None
    ) -> str:
        parts = []
        if component:
            parts.append(f"Composant affecté: {component}.")
        if mechanism:
            parts.append(f"Mécanisme de défaillance: {mechanism.value}.")
        if cause:
            parts.append(f"Cause probable: {cause.value}.")
        parts.append(f"Rapport opérateur: {text[:200]}.")
        return " ".join(parts)

    @staticmethod
    def _map_resolution_method(result: ResolutionResult | None) -> ResolutionMethod:
        if not result:
            return ResolutionMethod.MANUAL
        mapping = {
            "EXACT_MATCH": ResolutionMethod.EXACT_MATCH,
            "FUZZY_MATCH": ResolutionMethod.FUZZY_MATCH,
            "ALIAS_MATCH": ResolutionMethod.FUZZY_MATCH,
            "HIERARCHY_SEARCH": ResolutionMethod.FUZZY_MATCH,
        }
        return mapping.get(result.method, ResolutionMethod.MANUAL)

    @staticmethod
    def _determine_specialties(mechanism: Mechanism | None, component: str | None) -> list[str]:
        specialties = []
        electrical_mechs = {
            Mechanism.ARCS, Mechanism.SHORT_CIRCUITS, Mechanism.OPEN_CIRCUIT,
            Mechanism.THERMALLY_OVERLOADS,
        }
        if mechanism and mechanism in electrical_mechs:
            specialties.append("ELECTRICAL")
        elif mechanism:
            specialties.append("MECHANICAL")
        if component and component.lower() in ("motor", "transformer"):
            if "ELECTRICAL" not in specialties:
                specialties.append("ELECTRICAL")
        if not specialties:
            specialties.append("MECHANICAL")
        return specialties

    @staticmethod
    def _estimate_duration(wo_type: WorkOrderType, mechanism: Mechanism | None) -> float:
        if wo_type == WorkOrderType.PM01_INSPECTION:
            return 2.0
        if wo_type == WorkOrderType.PM03_CORRECTIVE:
            return 8.0
        return 4.0
