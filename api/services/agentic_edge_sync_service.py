"""Agentic Edge AI Sync Service — CU-EXT-9.

Manages edge device registration, data bundling for initial deployment,
and bidirectional sync between edge devices and the central server.
"""

import gzip
import json
import logging
import time
import uuid
from datetime import datetime

from sqlalchemy.orm import Session

log = logging.getLogger("ocp_maintenance")


def register_edge_device(
    db: Session,
    device_name: str,
    plant_id: str,
    hardware_type: str = "JETSON_ORIN",
    ollama_model: str = "gemma4",
) -> dict:
    """Register a new edge AI device."""
    from api.database.models import EdgeDeviceModel

    device_id = str(uuid.uuid4())
    device = EdgeDeviceModel(
        device_id=device_id,
        device_name=device_name,
        plant_id=plant_id,
        hardware_type=hardware_type,
        ollama_model=ollama_model,
        sync_status="NEVER_SYNCED",
    )
    db.add(device)
    db.commit()

    return {
        "device_id": device_id,
        "device_name": device_name,
        "plant_id": plant_id,
        "hardware_type": hardware_type,
        "ollama_model": ollama_model,
        "sync_status": "NEVER_SYNCED",
    }


def prepare_edge_bundle(db: Session, device_id: str) -> dict:
    """Package hierarchy, equipment, and health data for edge initial deployment.

    Returns a dict with all data needed for the edge device to operate
    independently. This is downloaded once during provisioning.
    """
    from api.database.models import (
        EdgeDeviceModel, HierarchyNodeModel, PlantModel,
    )

    device = db.query(EdgeDeviceModel).filter_by(device_id=device_id).first()
    if not device:
        return {"error": f"Device {device_id} not found"}

    plant_id = device.plant_id

    # Bundle plant and hierarchy
    plant = db.query(PlantModel).filter_by(plant_id=plant_id).first()
    nodes = db.query(HierarchyNodeModel).filter_by(plant_id=plant_id).all()

    bundle = {
        "device_id": device_id,
        "plant": {"plant_id": plant.plant_id, "name": plant.name} if plant else None,
        "hierarchy_nodes": [
            {
                "node_id": n.node_id,
                "node_type": n.node_type,
                "name": n.name,
                "code": n.code,
                "tag": n.tag,
                "parent_node_id": n.parent_node_id,
                "level": n.level,
                "gps_lat": n.gps_lat,
                "gps_lon": n.gps_lon,
            }
            for n in nodes
        ],
        "node_count": len(nodes),
        "bundled_at": datetime.now().isoformat(),
    }

    # Update device status
    device.sync_status = "SYNCED"
    device.last_sync_at = datetime.now()
    db.commit()

    return bundle


def process_edge_sync_push(
    db: Session,
    device_id: str,
    items: list[dict],
) -> dict:
    """Receive a batch of records pushed from an edge device.

    Items follow the format: [{entity_type, entity_id, data, timestamp}]
    """
    from api.database.models import EdgeDeviceModel

    device = db.query(EdgeDeviceModel).filter_by(device_id=device_id).first()
    if not device:
        return {"error": f"Device {device_id} not found"}

    processed = 0
    conflicts = 0
    errors = []

    for item in items:
        entity_type = item.get("entity_type", "")
        try:
            _process_sync_item(db, entity_type, item.get("data", {}))
            processed += 1
        except Exception as e:
            conflicts += 1
            errors.append({"entity_type": entity_type, "error": str(e)})

    # Update device state
    device.last_sync_at = datetime.now()
    device.sync_status = "SYNCED"
    device.pending_items_count = max(0, device.pending_items_count - processed)
    db.commit()

    return {
        "device_id": device_id,
        "processed": processed,
        "conflicts": conflicts,
        "errors": errors[:10],  # limit error details
        "synced_at": datetime.now().isoformat(),
    }


def get_edge_sync_delta(
    db: Session,
    device_id: str,
    since: str | None = None,
) -> dict:
    """Provide delta data for an edge device to pull.

    Returns records created/modified since the last sync timestamp.
    """
    from api.database.models import EdgeDeviceModel

    device = db.query(EdgeDeviceModel).filter_by(device_id=device_id).first()
    if not device:
        return {"error": f"Device {device_id} not found"}

    since_dt = datetime.fromisoformat(since) if since else device.last_sync_at
    if not since_dt:
        since_dt = datetime(2020, 1, 1)

    # For now, return a summary of what's available
    return {
        "device_id": device_id,
        "since": since_dt.isoformat(),
        "delta_available": True,
        "note": "Full delta sync implementation requires entity-specific queries",
    }


def get_edge_device_status(db: Session, device_id: str) -> dict:
    """Get current status of an edge device."""
    from api.database.models import EdgeDeviceModel

    device = db.query(EdgeDeviceModel).filter_by(device_id=device_id).first()
    if not device:
        return {"error": f"Device {device_id} not found"}

    return {
        "device_id": device.device_id,
        "device_name": device.device_name,
        "plant_id": device.plant_id,
        "hardware_type": device.hardware_type,
        "ollama_model": device.ollama_model,
        "sync_status": device.sync_status,
        "last_sync_at": device.last_sync_at.isoformat() if device.last_sync_at else None,
        "last_heartbeat_at": device.last_heartbeat_at.isoformat() if device.last_heartbeat_at else None,
        "pending_items_count": device.pending_items_count,
        "device_config": device.device_config,
    }


def list_edge_devices(db: Session, plant_id: str | None = None) -> list[dict]:
    """List all registered edge devices, optionally filtered by plant."""
    from api.database.models import EdgeDeviceModel

    query = db.query(EdgeDeviceModel)
    if plant_id:
        query = query.filter_by(plant_id=plant_id)

    devices = query.all()
    return [
        {
            "device_id": d.device_id,
            "device_name": d.device_name,
            "plant_id": d.plant_id,
            "hardware_type": d.hardware_type,
            "sync_status": d.sync_status,
            "last_sync_at": d.last_sync_at.isoformat() if d.last_sync_at else None,
        }
        for d in devices
    ]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _process_sync_item(db: Session, entity_type: str, data: dict):
    """Process a single sync item by entity type."""
    # Routing by entity type — extend as new models are added
    if entity_type == "field_capture":
        _sync_field_capture(db, data)
    elif entity_type == "audio_analysis":
        _sync_audio_analysis(db, data)
    else:
        log.warning("Unknown sync entity type: %s", entity_type)


def _sync_field_capture(db: Session, data: dict):
    """Sync a field capture from edge to central."""
    from api.database.models import FieldCaptureModel

    existing = db.query(FieldCaptureModel).filter_by(capture_id=data.get("capture_id")).first()
    if existing:
        raise ValueError(f"Capture {data.get('capture_id')} already exists (conflict)")

    capture = FieldCaptureModel(**{k: v for k, v in data.items() if hasattr(FieldCaptureModel, k)})
    db.add(capture)


def _sync_audio_analysis(db: Session, data: dict):
    """Sync an audio analysis from edge to central."""
    from api.database.models import AudioFaultAnalysisModel

    existing = db.query(AudioFaultAnalysisModel).filter_by(analysis_id=data.get("analysis_id")).first()
    if existing:
        raise ValueError(f"Analysis {data.get('analysis_id')} already exists (conflict)")

    analysis = AudioFaultAnalysisModel(**{k: v for k, v in data.items() if hasattr(AudioFaultAnalysisModel, k)})
    db.add(analysis)


def compress_sync_payload(payload: dict) -> bytes:
    """Compress sync payload with gzip for satellite/low-bandwidth links."""
    return gzip.compress(json.dumps(payload).encode("utf-8"))


def decompress_sync_payload(data: bytes) -> dict:
    """Decompress a gzip-compressed sync payload."""
    return json.loads(gzip.decompress(data).decode("utf-8"))
