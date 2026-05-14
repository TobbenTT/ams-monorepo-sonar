"""
Hierarchy Builder Engine — builds equipment hierarchy from vendor data.

Uses equipment_library.json to generate a complete hierarchy tree:
  Equipment → Sub-Assemblies → Maintainable Items
with auto-criticality, failure modes, Weibull params, and task templates.
"""

import json
import uuid
from pathlib import Path
from typing import Optional

DATA_DIR = Path(__file__).parent.parent.parent / "docs" / "context" / "libraries"
EQUIPMENT_LIBRARY_PATH = DATA_DIR / "equipment_library.json"
COMPONENT_LIBRARY_PATH = DATA_DIR / "component_library.json"

# Criticality auto-assignment by power rating (fallback when type not in library)
CRITICALITY_BY_POWER = [
    (5000, "AA"),
    (2000, "A+"),
    (500, "A"),
    (100, "B"),
    (0, "C"),
]

# Map common user-facing names to library equipment_type_id patterns
_TYPE_ALIASES = {
    "SAG_MILL": "SAG",
    "BALL_MILL": "BALL",
    "ROD_MILL": "ROD",
    "SLURRY_PUMP": "SLURRY",
    "FLOTATION_CELL": "FLOTATION",
    "BELT_CONVEYOR": "CONVEYOR",
    "THICKENER": "THICKENER",
    "BELT_FILTER": "FILTER",
    "ROTARY_DRYER": "DRYER",
    "CRUSHER": "CRUSHER",
    "VIBRATING_SCREEN": "SCREEN",
    "HYDROCYCLONE": "CYCLONE",
    "AGITATOR": "AGITATOR",
    "COMPRESSOR": "COMPRESSOR",
    "HEAT_EXCHANGER": "HEAT",
}


def _load_equipment_library() -> dict:
    """Load the equipment type library JSON."""
    if EQUIPMENT_LIBRARY_PATH.exists():
        with open(EQUIPMENT_LIBRARY_PATH, encoding="utf-8") as f:
            return json.load(f)
    return {"equipment_types": []}


def _load_component_library() -> dict:
    """Load the component library JSON."""
    if COMPONENT_LIBRARY_PATH.exists():
        with open(COMPONENT_LIBRARY_PATH, encoding="utf-8") as f:
            return json.load(f)
    return {"component_types": []}


def _find_equipment_type(library: dict, equipment_type: str) -> Optional[dict]:
    """Find equipment type definition in library.

    Matches by equipment_type_id, name, or alias.
    """
    et_upper = equipment_type.upper().replace(" ", "_")
    for et in library.get("equipment_types", []):
        et_id = et.get("equipment_type_id", "").upper()
        et_name = et.get("name", "").upper().replace(" ", "_")
        # Direct match on ID or name
        if et_upper in et_id or et_upper == et_name:
            return et
        # Alias match
        alias = _TYPE_ALIASES.get(et_upper, "")
        if alias and alias in et_id:
            return et
    return None


def generate_tag(area_code: str, equipment_code: str, sequence: int = 1) -> str:
    """Generate a standard equipment tag: AREA-EQCODE-NNN."""
    return f"{area_code}-{equipment_code}-{sequence:03d}"


def auto_assign_criticality(equipment_type: str, power_kw: float = 0) -> str:
    """Auto-assign criticality based on equipment type and power rating."""
    library = _load_equipment_library()
    et_def = _find_equipment_type(library, equipment_type)
    if et_def:
        return et_def.get("criticality_class", "A")

    for threshold, crit in CRITICALITY_BY_POWER:
        if power_kw >= threshold:
            return crit
    return "C"


def generate_standard_failure_modes(equipment_type: str, sub_assembly: str = "") -> list[dict]:
    """Generate failure modes from equipment library for given type/sub-assembly."""
    library = _load_equipment_library()
    et_def = _find_equipment_type(library, equipment_type)
    if not et_def:
        return []

    failure_modes = []
    for sa in et_def.get("sub_assemblies", []):
        if sub_assembly and sa["name"].upper() != sub_assembly.upper():
            continue
        for mi in sa.get("maintainable_items", []):
            for fm in mi.get("failure_modes", []):
                failure_modes.append({
                    "sub_assembly": sa["name"],
                    "maintainable_item": mi["name"],
                    "mechanism": fm["mechanism"],
                    "cause": fm["cause"],
                    "weibull_beta": fm.get("weibull_beta"),
                    "weibull_eta": fm.get("weibull_eta"),
                })
    return failure_modes


def build_from_vendor(
    plant_id: str,
    area_code: str,
    equipment_type: str,
    model: str = "",
    manufacturer: str = "",
    power_kw: float = 0,
    weight_kg: float = 0,
    serial_number: str = "",
    installation_date: str = "",
    sequence: int = 1,
    components: Optional[list[str]] = None,
    specifications: Optional[dict] = None,
) -> dict:
    """
    Build a complete equipment hierarchy from vendor data.

    Returns a structured result with equipment node, sub-assemblies,
    maintainable items, failure modes, and criticality suggestion.
    """
    library = _load_equipment_library()
    et_def = _find_equipment_type(library, equipment_type)

    # Generate tag from library tag_convention or fallback
    if et_def:
        tag_conv = et_def.get("tag_convention", "")
        # Extract equipment code from convention like "{area}-SAG-ML-{seq:03d}"
        parts = tag_conv.replace("{area}", "").replace("{seq:03d}", "").strip("-").split("-")
        eq_code = "-".join(p for p in parts if p and not p.startswith("{"))
        if not eq_code:
            eq_code = equipment_type[:3].upper()
    else:
        eq_code = equipment_type[:3].upper()

    equipment_tag = generate_tag(area_code, eq_code, sequence)

    # Auto-criticality
    criticality = auto_assign_criticality(equipment_type, power_kw)

    # Build hierarchy nodes
    equipment_node_id = str(uuid.uuid4())
    nodes_created = []
    sub_assemblies_out = []
    maintainable_items_out = []
    failure_modes_out = []
    task_templates_out = []
    warnings = []

    # Use library name if available for a nicer display name
    display_name = et_def["name"] if et_def else equipment_type
    if model:
        display_name = f"{display_name} {model}"
    display_name_fr = et_def.get("name_fr", display_name) if et_def else display_name
    if model and et_def:
        display_name_fr = f"{display_name_fr} {model}"

    # Equipment node
    eq_node = {
        "node_id": equipment_node_id,
        "node_type": "EQUIPMENT",
        "name": display_name,
        "name_fr": display_name_fr,
        "code": equipment_tag,
        "tag": equipment_tag,
        "level": 4,
        "plant_id": plant_id,
        "criticality": criticality,
        "status": "ACTIVE",
        "metadata_json": {
            "manufacturer": manufacturer,
            "model": model,
            "serial_number": serial_number,
            "installation_date": installation_date,
            "power_kw": power_kw,
            "weight_kg": weight_kg,
            "equipment_type": equipment_type,
            "equipment_type_id": et_def.get("equipment_type_id", "") if et_def else "",
            "specifications": specifications or {},
        },
    }
    nodes_created.append(eq_node)

    if et_def:
        # Build sub-assemblies and MIs from library
        sa_order = 0
        for sa_def in et_def.get("sub_assemblies", []):
            sa_order += 1
            sa_node_id = str(uuid.uuid4())
            sa_tag = f"{equipment_tag}-{sa_def['name'][:3].upper()}"
            sa_node = {
                "node_id": sa_node_id,
                "node_type": "SUB_ASSEMBLY",
                "name": sa_def["name"],
                "name_fr": sa_def.get("name_fr", sa_def["name"]),
                "code": sa_tag,
                "tag": sa_tag,
                "parent_node_id": equipment_node_id,
                "level": 5,
                "plant_id": plant_id,
                "criticality": criticality,
                "status": "ACTIVE",
                "order": sa_order,
            }
            nodes_created.append(sa_node)
            sub_assemblies_out.append(sa_def["name"])

            mi_order = 0
            for mi_def in sa_def.get("maintainable_items", []):
                mi_order += 1
                mi_node_id = str(uuid.uuid4())
                mi_tag = f"{sa_tag}-{mi_def['name'][:3].upper()}{mi_order:02d}"
                fms = mi_def.get("failure_modes", [])
                mi_node = {
                    "node_id": mi_node_id,
                    "node_type": "MAINTAINABLE_ITEM",
                    "name": mi_def["name"],
                    "name_fr": mi_def.get("name_fr", mi_def["name"]),
                    "code": mi_tag,
                    "tag": mi_tag,
                    "parent_node_id": sa_node_id,
                    "level": 6,
                    "plant_id": plant_id,
                    "status": "ACTIVE",
                    "order": mi_order,
                    "metadata_json": {
                        "weibull_beta": fms[0].get("weibull_beta") if fms else None,
                        "weibull_eta": fms[0].get("weibull_eta") if fms else None,
                        "component_lib_ref": mi_def.get("component_lib_ref"),
                    },
                }
                nodes_created.append(mi_node)
                maintainable_items_out.append(mi_def["name"])

                # Add failure modes
                for fm in fms:
                    failure_modes_out.append({
                        "maintainable_item": mi_def["name"],
                        "mi_node_id": mi_node_id,
                        "mechanism": fm["mechanism"],
                        "cause": fm["cause"],
                        "weibull_beta": fm.get("weibull_beta"),
                        "weibull_eta": fm.get("weibull_eta"),
                    })

                    # Extract task template from failure mode
                    if fm.get("typical_task"):
                        task_templates_out.append({
                            "maintainable_item": mi_def["name"],
                            "mi_node_id": mi_node_id,
                            "task_type": fm.get("task_type", "INSPECT"),
                            "description": fm["typical_task"],
                            "frequency_value": fm.get("frequency_value"),
                            "frequency_unit": fm.get("frequency_unit"),
                            "constraint": fm.get("constraint", "ONLINE"),
                        })
    else:
        warnings.append(f"Equipment type '{equipment_type}' not found in library. Created equipment node only.")

    return {
        "equipment_tag": equipment_tag,
        "nodes_created": len(nodes_created),
        "hierarchy_nodes": nodes_created,
        "criticality_suggestion": criticality,
        "failure_modes_generated": len(failure_modes_out),
        "failure_modes": failure_modes_out,
        "task_templates": task_templates_out,
        "sub_assemblies": sub_assemblies_out,
        "maintainable_items": maintainable_items_out,
        "warnings": warnings,
    }
