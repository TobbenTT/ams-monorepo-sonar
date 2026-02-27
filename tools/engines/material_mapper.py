"""
Material BOM ↔ Failure Mode Mapper (OPP-5)
Maps failure modes to required spare parts based on equipment BOM,
component type, and failure mechanism.
"""

from dataclasses import dataclass, field


@dataclass
class MaterialSuggestion:
    """A suggested material for a failure mode."""
    material_code: str
    description: str
    quantity: int
    reason: str
    confidence: float


# Default material mappings by component type + mechanism
DEFAULT_MATERIAL_MAPPINGS: dict[str, dict[str, list[dict]]] = {
    "Bearing": {
        "WORN": [
            {"desc": "Replacement bearing (same type)", "qty": 1, "reason": "Direct replacement"},
            {"desc": "Bearing seal kit", "qty": 1, "reason": "Replace seals during bearing change"},
            {"desc": "Lubricant (bearing grease)", "qty": 1, "reason": "Initial lubrication after install"},
        ],
        "OVERHEATED": [
            {"desc": "Replacement bearing (same type)", "qty": 1, "reason": "Heat damage replacement"},
            {"desc": "Bearing seal kit", "qty": 1, "reason": "Seals likely damaged by heat"},
        ],
        "CRACKED": [
            {"desc": "Replacement bearing (same type)", "qty": 1, "reason": "Crack damage replacement"},
        ],
    },
    "Seal": {
        "LEAKING": [
            {"desc": "Mechanical seal kit", "qty": 1, "reason": "Seal replacement for leakage"},
            {"desc": "O-ring set", "qty": 1, "reason": "Replace auxiliary seals"},
        ],
        "WORN": [
            {"desc": "Mechanical seal kit", "qty": 1, "reason": "Wear replacement"},
        ],
    },
    "Impeller": {
        "WORN": [
            {"desc": "Replacement impeller", "qty": 1, "reason": "Erosion/abrasion replacement"},
            {"desc": "Impeller wear ring", "qty": 1, "reason": "Replace clearance ring"},
        ],
        "CORRODED": [
            {"desc": "Replacement impeller (corrosion-resistant)", "qty": 1, "reason": "Corrosion replacement"},
        ],
        "BROKEN": [
            {"desc": "Replacement impeller", "qty": 1, "reason": "Fracture replacement"},
            {"desc": "Impeller bolt set", "qty": 1, "reason": "Replace fasteners"},
        ],
    },
    "Liner": {
        "WORN": [
            {"desc": "Liner set (wear-resistant)", "qty": 1, "reason": "Abrasion replacement"},
            {"desc": "Liner bolt set", "qty": 1, "reason": "Replace fasteners"},
        ],
    },
    "Motor": {
        "OVERHEATED": [
            {"desc": "Motor winding repair kit", "qty": 1, "reason": "Winding insulation damage"},
        ],
        "BROKEN": [
            {"desc": "Replacement motor (same spec)", "qty": 1, "reason": "Complete motor replacement"},
        ],
    },
    "Coupling": {
        "WORN": [
            {"desc": "Coupling element/insert", "qty": 1, "reason": "Elastic element replacement"},
        ],
        "BROKEN": [
            {"desc": "Replacement coupling", "qty": 1, "reason": "Complete coupling replacement"},
        ],
        "LOOSE": [
            {"desc": "Coupling bolt set", "qty": 1, "reason": "Fastener replacement"},
            {"desc": "Coupling key", "qty": 1, "reason": "Key replacement if damaged"},
        ],
    },
    "Filter": {
        "BLOCKED": [
            {"desc": "Replacement filter element", "qty": 2, "reason": "Blocked filter replacement"},
        ],
    },
    "Belt": {
        "WORN": [
            {"desc": "Replacement belt (matched set)", "qty": 1, "reason": "Belt wear replacement"},
        ],
        "CRACKED": [
            {"desc": "Replacement belt (matched set)", "qty": 1, "reason": "Belt fatigue replacement"},
        ],
    },
    "Gearbox": {
        "WORN": [
            {"desc": "Gear set", "qty": 1, "reason": "Gear wear replacement"},
            {"desc": "Gearbox oil", "qty": 1, "reason": "Oil change during overhaul"},
            {"desc": "Gearbox seal kit", "qty": 1, "reason": "Replace seals during overhaul"},
        ],
        "LEAKING": [
            {"desc": "Gearbox seal kit", "qty": 1, "reason": "Seal replacement for oil leakage"},
            {"desc": "Gearbox oil", "qty": 1, "reason": "Top-up after seal fix"},
        ],
    },
}


class MaterialMapper:
    """Maps failure modes to required spare parts."""

    def __init__(self, bom_registry: dict[str, list[dict]] | None = None):
        """
        Args:
            bom_registry: Optional dict mapping equipment_id → list of BOM materials.
                Each material: {material_code, description, component_type}
        """
        self.bom_registry = bom_registry or {}

    def suggest_materials(
        self,
        component_type: str,
        mechanism: str,
        equipment_id: str | None = None,
    ) -> list[MaterialSuggestion]:
        """
        Suggest materials for a failure mode based on component type and mechanism.

        Args:
            component_type: The 'what' field from FailureMode (e.g., 'Bearing')
            mechanism: The mechanism (e.g., 'WORN')
            equipment_id: Optional equipment for BOM lookup

        Returns:
            List of material suggestions with confidence scores.
        """
        suggestions = []

        # 1. Check BOM registry for equipment-specific materials
        if equipment_id and equipment_id in self.bom_registry:
            bom = self.bom_registry[equipment_id]
            for mat in bom:
                if mat.get("component_type", "").lower() == component_type.lower():
                    suggestions.append(MaterialSuggestion(
                        material_code=mat["material_code"],
                        description=mat["description"],
                        quantity=1,
                        reason=f"From equipment BOM ({equipment_id})",
                        confidence=0.95,
                    ))

        # 2. Check default mappings
        component_mappings = DEFAULT_MATERIAL_MAPPINGS.get(component_type, {})
        mechanism_materials = component_mappings.get(mechanism, [])

        for mat in mechanism_materials:
            suggestions.append(MaterialSuggestion(
                material_code="",  # To be filled from catalog
                description=mat["desc"],
                quantity=mat["qty"],
                reason=mat["reason"],
                confidence=0.7 if not equipment_id else 0.6,
            ))

        # 3. If no specific mapping, suggest generic based on mechanism
        if not suggestions:
            generic = self._generic_suggestion(component_type, mechanism)
            if generic:
                suggestions.append(generic)

        return suggestions

    @staticmethod
    def _generic_suggestion(component_type: str, mechanism: str) -> MaterialSuggestion | None:
        """Generate a generic material suggestion when no specific mapping exists."""
        if mechanism in ("WORN", "BROKEN", "CRACKED", "DEFORMED"):
            return MaterialSuggestion(
                material_code="",
                description=f"Replacement {component_type.lower()}",
                quantity=1,
                reason=f"Generic replacement for {mechanism.lower()} {component_type.lower()}",
                confidence=0.4,
            )
        return None

    @staticmethod
    def validate_task_materials(
        task_type: str,
        materials: list[dict],
    ) -> list[str]:
        """
        Validate that a task has appropriate materials.
        T-16: Replacement tasks MUST have materials.
        """
        warnings = []
        if task_type == "REPLACE" and not materials:
            warnings.append("T-16: Replacement task has no materials assigned")
        if task_type in ("INSPECT", "CHECK", "TEST") and materials:
            # Inspection tasks usually don't consume materials
            warnings.append("INFO: Inspection/check/test task has materials — verify this is intentional")
        return warnings
