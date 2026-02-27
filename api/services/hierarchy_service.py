"""Hierarchy service — CRUD for plant hierarchy nodes."""

from sqlalchemy.orm import Session

from api.database.models import PlantModel, HierarchyNodeModel
from api.services.audit_service import log_action


def create_plant(db: Session, plant_id: str, name: str, name_fr: str = "", location: str = "") -> PlantModel:
    plant = PlantModel(plant_id=plant_id, name=name, name_fr=name_fr, location=location)
    db.add(plant)
    log_action(db, "plant", plant_id, "CREATE")
    db.commit()
    db.refresh(plant)
    return plant


def get_plant(db: Session, plant_id: str) -> PlantModel | None:
    return db.query(PlantModel).filter(PlantModel.plant_id == plant_id).first()


def list_plants(db: Session) -> list[PlantModel]:
    return db.query(PlantModel).all()


def create_node(db: Session, data: dict) -> HierarchyNodeModel:
    node = HierarchyNodeModel(**data)
    db.add(node)
    log_action(db, "hierarchy_node", node.node_id, "CREATE")
    db.commit()
    db.refresh(node)
    return node


def get_node(db: Session, node_id: str) -> HierarchyNodeModel | None:
    return db.query(HierarchyNodeModel).filter(HierarchyNodeModel.node_id == node_id).first()


def list_nodes(db: Session, plant_id: str | None = None, node_type: str | None = None, parent_node_id: str | None = None) -> list[HierarchyNodeModel]:
    q = db.query(HierarchyNodeModel)
    if plant_id:
        q = q.filter(HierarchyNodeModel.plant_id == plant_id)
    if node_type:
        q = q.filter(HierarchyNodeModel.node_type == node_type)
    if parent_node_id:
        q = q.filter(HierarchyNodeModel.parent_node_id == parent_node_id)
    return q.order_by(HierarchyNodeModel.level, HierarchyNodeModel.order).all()


def get_subtree(db: Session, node_id: str) -> list[HierarchyNodeModel]:
    """Get node and all descendants (BFS) — single query, in-memory traversal."""
    root = get_node(db, node_id)
    if not root:
        return []

    # Load all nodes for this plant in one query, build parent→children map
    all_nodes = db.query(HierarchyNodeModel).filter(
        HierarchyNodeModel.plant_id == root.plant_id
    ).all()
    children_map: dict[str | None, list[HierarchyNodeModel]] = {}
    for n in all_nodes:
        children_map.setdefault(n.parent_node_id, []).append(n)

    # BFS in memory
    result = []
    queue = [node_id]
    while queue:
        current_id = queue.pop(0)
        for n in all_nodes:
            if n.node_id == current_id:
                result.append(n)
                break
        for child in children_map.get(current_id, []):
            queue.append(child.node_id)
    return result


def count_nodes_by_type(db: Session, plant_id: str | None = None) -> dict[str, int]:
    q = db.query(HierarchyNodeModel)
    if plant_id:
        q = q.filter(HierarchyNodeModel.plant_id == plant_id)
    nodes = q.all()
    counts: dict[str, int] = {}
    for n in nodes:
        counts[n.node_type] = counts.get(n.node_type, 0) + 1
    return counts
