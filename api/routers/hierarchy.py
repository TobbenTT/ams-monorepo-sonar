"""Hierarchy router — plant hierarchy CRUD endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.schemas import PlantCreate, NodeCreate, VendorBuildRequest
from api.services import hierarchy_service
from api.services.hierarchy_builder_service import build_hierarchy_from_vendor

router = APIRouter(prefix="/hierarchy", tags=["hierarchy"])


@router.get("/plants")
def list_plants(db: Session = Depends(get_db)):
    plants = hierarchy_service.list_plants(db)
    return [{"plant_id": p.plant_id, "name": p.name, "name_fr": p.name_fr, "location": p.location} for p in plants]


@router.post("/plants")
def create_plant(data: PlantCreate, db: Session = Depends(get_db)):
    plant = hierarchy_service.create_plant(db, **data.model_dump())
    return {"plant_id": plant.plant_id, "name": plant.name}


@router.get("/nodes")
def list_nodes(plant_id: str | None = None, node_type: str | None = None, parent_node_id: str | None = None, db: Session = Depends(get_db)):
    nodes = hierarchy_service.list_nodes(db, plant_id=plant_id, node_type=node_type, parent_node_id=parent_node_id)
    return [_node_to_dict(n) for n in nodes]


@router.post("/nodes")
def create_node(data: NodeCreate, db: Session = Depends(get_db)):
    node = hierarchy_service.create_node(db, data.model_dump())
    return _node_to_dict(node)


@router.get("/nodes/{node_id}")
def get_node(node_id: str, db: Session = Depends(get_db)):
    node = hierarchy_service.get_node(db, node_id)
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    return _node_to_dict(node)


@router.get("/nodes/{node_id}/tree")
def get_subtree(node_id: str, db: Session = Depends(get_db)):
    nodes = hierarchy_service.get_subtree(db, node_id)
    if not nodes:
        raise HTTPException(status_code=404, detail="Node not found")
    return [_node_to_dict(n) for n in nodes]


@router.post("/build-from-vendor")
def build_from_vendor(data: VendorBuildRequest, db: Session = Depends(get_db)):
    """Build complete equipment hierarchy from vendor/OEM data."""
    result = build_hierarchy_from_vendor(db, data.model_dump())
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.get("/stats")
def node_stats(plant_id: str | None = None, db: Session = Depends(get_db)):
    return hierarchy_service.count_nodes_by_type(db, plant_id=plant_id)


def _node_to_dict(n) -> dict:
    return {
        "node_id": n.node_id,
        "node_type": n.node_type,
        "name": n.name,
        "name_fr": n.name_fr,
        "code": n.code,
        "parent_node_id": n.parent_node_id,
        "level": n.level,
        "plant_id": n.plant_id,
        "tag": n.tag,
        "criticality": n.criticality,
        "status": n.status,
        "metadata": n.metadata_json,
    }
