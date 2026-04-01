"""Capture router extension — nearby assets by GPS coordinates."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from math import radians, cos, sin, asin, sqrt

from api.database.connection import get_db
from api.dependencies.auth import get_current_user

router = APIRouter(prefix="/geo", tags=["capture-geo"], dependencies=[Depends(get_current_user)])


def _haversine(lat1, lon1, lat2, lon2):
    """Calculate distance in meters between two GPS points."""
    R = 6371000  # Earth radius in meters
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    return R * 2 * asin(sqrt(a))


@router.get("/nearby")
def get_nearby_assets(
    lat: float = Query(..., description="GPS latitude"),
    lon: float = Query(..., description="GPS longitude"),
    radius: float = Query(default=500, description="Search radius in meters"),
    limit: int = Query(default=10),
    db: Session = Depends(get_db),
):
    """Find equipment assets near a GPS coordinate.
    Returns sorted by distance, closest first."""

    # Get all equipment with GPS coordinates
    rows = db.execute(text("""
        SELECT node_id, tag, name, gps_lat, gps_lon, criticality, status
        FROM hierarchy_nodes
        WHERE node_type = 'EQUIPMENT' AND gps_lat IS NOT NULL AND gps_lon IS NOT NULL
    """)).fetchall()

    results = []
    for r in rows:
        dist = _haversine(lat, lon, float(r[3]), float(r[4]))
        if dist <= radius:
            results.append({
                "node_id": r[0],
                "tag": r[1],
                "name": r[2],
                "gps_lat": float(r[3]),
                "gps_lon": float(r[4]),
                "criticality": r[5],
                "status": r[6],
                "distance_m": round(dist, 1),
            })

    results.sort(key=lambda x: x["distance_m"])
    return results[:limit]
