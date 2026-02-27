"""Hierarchy Builder Service — builds and persists equipment hierarchy from vendor data."""

from sqlalchemy.orm import Session

from api.database.models import HierarchyNodeModel, PlantModel
from api.services.audit_service import log_action
from tools.engines.hierarchy_builder_engine import build_from_vendor


def build_hierarchy_from_vendor(db: Session, data: dict) -> dict:
    """Build hierarchy from vendor data and persist to database.

    Args:
        db: Database session
        data: Vendor equipment input data (plant_id, area_code, equipment_type, etc.)

    Returns:
        Build result with created nodes, failure modes, and warnings.
    """
    plant_id = data["plant_id"]

    # Ensure plant exists
    plant = db.query(PlantModel).filter(PlantModel.plant_id == plant_id).first()
    if not plant:
        return {"error": f"Plant '{plant_id}' not found. Create it first."}

    # Find parent area node if area_code provided
    area_code = data.get("area_code", "")
    parent_node_id = data.get("parent_node_id")

    if not parent_node_id and area_code:
        area_node = db.query(HierarchyNodeModel).filter(
            HierarchyNodeModel.plant_id == plant_id,
            HierarchyNodeModel.node_type == "AREA",
            HierarchyNodeModel.code == area_code,
        ).first()
        if area_node:
            parent_node_id = area_node.node_id

    # Build hierarchy using engine
    result = build_from_vendor(
        plant_id=plant_id,
        area_code=area_code,
        equipment_type=data.get("equipment_type", ""),
        model=data.get("model", ""),
        manufacturer=data.get("manufacturer", ""),
        power_kw=data.get("power_kw", 0),
        weight_kg=data.get("weight_kg", 0),
        serial_number=data.get("serial_number", ""),
        installation_date=data.get("installation_date", ""),
        sequence=data.get("sequence", 1),
        components=data.get("components"),
        specifications=data.get("specifications"),
    )

    if "error" in result:
        return result

    # Persist hierarchy nodes to database
    nodes_persisted = 0
    for node_data in result.get("hierarchy_nodes", []):
        # Set parent for equipment node
        if node_data["node_type"] == "EQUIPMENT" and parent_node_id:
            node_data["parent_node_id"] = parent_node_id

        node = HierarchyNodeModel(
            node_id=node_data["node_id"],
            node_type=node_data["node_type"],
            name=node_data["name"],
            name_fr=node_data.get("name_fr", ""),
            code=node_data["code"],
            tag=node_data.get("tag"),
            parent_node_id=node_data.get("parent_node_id"),
            level=node_data["level"],
            plant_id=plant_id,
            criticality=node_data.get("criticality"),
            status=node_data.get("status", "ACTIVE"),
            order=node_data.get("order", 1),
            metadata_json=node_data.get("metadata_json"),
        )
        db.add(node)
        log_action(db, "hierarchy_node", node.node_id, "CREATE_FROM_VENDOR")
        nodes_persisted += 1

    db.commit()

    # Remove full hierarchy_nodes from response (too verbose for API)
    result.pop("hierarchy_nodes", None)
    result["nodes_persisted"] = nodes_persisted

    return result
