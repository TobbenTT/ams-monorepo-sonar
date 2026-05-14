"""Agentic Drone Inspection Service — CU-EXT-6.

Processes batches of drone aerial images to detect corrosion, cracks,
deformation, and other structural defects. Auto-generates Work Requests
for high-severity findings.
"""

import logging
import time
import uuid
from datetime import datetime

from sqlalchemy.orm import Session

from api.services.ai_provider_service import analyze_image

log = logging.getLogger("ocp_maintenance")

_SYSTEM_PROMPT = """You are an industrial structural inspection AI analyzing drone aerial photos.
Detect and classify structural defects on equipment, pipelines, tanks, and structures.

Defect types to detect:
- CORROSION: Surface oxidation, rust, pitting, scaling, discoloration
- CRACK: Visible fractures, stress cracks, weld cracks
- DEFORMATION: Bending, buckling, denting, warping
- LEAK: Fluid stains, wet spots, drip marks, efflorescence
- COATING_LOSS: Paint peeling, exposed substrate, blistering
- EROSION: Material loss from fluid/particle impact
- NONE: No defects detected

For each defect found, report location in the image and severity.

Respond ONLY with valid JSON:
{
  "defects_found": [
    {
      "defect_type": "CORROSION|CRACK|DEFORMATION|LEAK|COATING_LOSS|EROSION",
      "severity": "LOW|MEDIUM|HIGH|CRITICAL",
      "confidence": float,
      "location_description": "string (e.g., upper-left quadrant, near weld seam)",
      "estimated_area_percent": float,
      "recommended_action": "string"
    }
  ],
  "overall_condition": "GOOD|ACCEPTABLE|DEGRADED|CRITICAL",
  "inspection_notes": "string"
}"""


def create_drone_inspection(
    db: Session,
    plant_id: str,
    mission_name: str,
    flight_date: str,
    images_base64: list[str],
    *,
    gps_metadata: list[dict] | None = None,
    auto_generate_wr: bool = True,
    severity_threshold: str = "HIGH",
    provider: str = "auto",
) -> dict:
    """Create a drone inspection mission and process all images."""
    from api.database.models import DroneInspectionModel

    start = time.time()
    inspection_id = str(uuid.uuid4())

    # Create mission record
    inspection = DroneInspectionModel(
        inspection_id=inspection_id,
        plant_id=plant_id,
        mission_name=mission_name,
        flight_date=datetime.fromisoformat(flight_date) if flight_date else datetime.now(),
        total_images=len(images_base64),
        processed_images=0,
        status="PROCESSING",
    )
    db.add(inspection)
    db.commit()

    # Process each image
    all_findings = []
    for idx, img_b64 in enumerate(images_base64):
        gps = (gps_metadata[idx] if gps_metadata and idx < len(gps_metadata) else {})
        finding = _process_single_image(
            db, inspection_id, img_b64, idx, gps, provider
        )
        if finding:
            all_findings.append(finding)

        # Update progress
        inspection.processed_images = idx + 1
        db.commit()

    # Aggregate findings
    summary = _aggregate_findings(all_findings)
    inspection.status = "COMPLETED"
    inspection.summary = summary
    inspection.completed_at = datetime.now()
    db.commit()

    # Auto-generate Work Requests for severe findings
    generated_wrs = []
    if auto_generate_wr:
        generated_wrs = _generate_work_requests(
            db, inspection_id, all_findings, plant_id, severity_threshold
        )

    duration_ms = int((time.time() - start) * 1000)

    return {
        "inspection_id": inspection_id,
        "mission_name": mission_name,
        "total_images": len(images_base64),
        "processed_images": len(images_base64),
        "total_defects_found": sum(len(f.get("defects", [])) for f in all_findings),
        "summary": summary,
        "generated_work_requests": generated_wrs,
        "duration_ms": duration_ms,
    }


def _process_single_image(
    db: Session,
    inspection_id: str,
    image_b64: str,
    image_index: int,
    gps_data: dict,
    provider: str,
) -> dict | None:
    """Analyze a single drone image for defects."""
    from api.database.models import DroneImageFindingModel
    from tools.processors.drone_image_preprocessor import (
        image_bytes_from_base64,
        extract_exif_gps,
        georeference_to_equipment,
    )

    # Extract GPS from EXIF if not provided
    if not gps_data:
        try:
            img_bytes = image_bytes_from_base64(image_b64)
            gps_data = extract_exif_gps(img_bytes)
        except Exception:
            pass

    # AI analysis
    result = analyze_image(
        images_base64=[image_b64],
        system_prompt=_SYSTEM_PROMPT,
        user_prompt="Analyze this aerial drone photo for structural defects. Report all defects found.",
        provider=provider,
    )

    suggestions = result.get("suggestions", {})
    defects = suggestions.get("defects_found", [])

    if not defects:
        return None

    # Georeference to nearest equipment
    linked_tag = None
    if gps_data.get("lat") and gps_data.get("lon"):
        geo = georeference_to_equipment(gps_data["lat"], gps_data["lon"], db)
        if geo:
            linked_tag = geo.get("equipment_tag")

    # Persist findings
    finding_records = []
    for defect in defects:
        finding_id = str(uuid.uuid4())
        finding = DroneImageFindingModel(
            finding_id=finding_id,
            inspection_id=inspection_id,
            image_index=image_index,
            gps_lat=gps_data.get("lat"),
            gps_lon=gps_data.get("lon"),
            altitude_m=gps_data.get("altitude_m"),
            defect_type=defect.get("defect_type"),
            severity=defect.get("severity", "LOW"),
            confidence=defect.get("confidence", 0.0),
            ai_analysis=defect,
            linked_equipment_tag=linked_tag,
        )
        db.add(finding)
        finding_records.append({
            "finding_id": finding_id,
            "defect_type": defect.get("defect_type"),
            "severity": defect.get("severity"),
        })

    return {
        "image_index": image_index,
        "defects": finding_records,
        "overall_condition": suggestions.get("overall_condition", "UNKNOWN"),
        "linked_equipment_tag": linked_tag,
    }


def _aggregate_findings(findings: list[dict]) -> dict:
    """Aggregate all image findings into a mission summary."""
    severity_counts = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}
    defect_type_counts = {}

    for f in findings:
        for d in f.get("defects", []):
            sev = d.get("severity", "LOW")
            severity_counts[sev] = severity_counts.get(sev, 0) + 1
            dt = d.get("defect_type", "UNKNOWN")
            defect_type_counts[dt] = defect_type_counts.get(dt, 0) + 1

    total = sum(severity_counts.values())
    overall = "GOOD"
    if severity_counts["CRITICAL"] > 0:
        overall = "CRITICAL"
    elif severity_counts["HIGH"] > 0:
        overall = "DEGRADED"
    elif severity_counts["MEDIUM"] > 0:
        overall = "ACCEPTABLE"

    return {
        "overall_condition": overall,
        "total_defects": total,
        "severity_distribution": severity_counts,
        "defect_types": defect_type_counts,
        "images_with_defects": len(findings),
    }


def _generate_work_requests(
    db: Session,
    inspection_id: str,
    findings: list[dict],
    plant_id: str,
    severity_threshold: str,
) -> list[str]:
    """Auto-create WorkRequests for findings above severity threshold."""
    threshold_order = {"LOW": 0, "MEDIUM": 1, "HIGH": 2, "CRITICAL": 3}
    min_sev = threshold_order.get(severity_threshold, 2)

    wr_ids = []
    for f in findings:
        for d in f.get("defects", []):
            sev = d.get("severity", "LOW")
            if threshold_order.get(sev, 0) >= min_sev:
                tag = f.get("linked_equipment_tag") or "UNKNOWN"
                wr_id = _create_wr_from_finding(
                    db, d, tag, plant_id, inspection_id
                )
                if wr_id:
                    wr_ids.append(wr_id)

    return wr_ids


def _create_wr_from_finding(
    db: Session,
    defect: dict,
    equipment_tag: str,
    plant_id: str,
    inspection_id: str,
) -> str | None:
    """Create a single WorkRequest from a drone finding."""
    from api.database.models import WorkRequestModel

    try:
        wr_id = str(uuid.uuid4())
        wr = WorkRequestModel(
            wr_id=wr_id,
            plant_id=plant_id,
            equipment_tag=equipment_tag,
            description=f"Drone inspection finding: {defect.get('defect_type', 'DEFECT')} "
                       f"({defect.get('severity', 'UNKNOWN')} severity). "
                       f"Inspection: {inspection_id}",
            priority="P1" if defect.get("severity") == "CRITICAL" else "P2",
            status="DRAFT",
            source="DRONE_INSPECTION",
        )
        db.add(wr)
        return wr_id
    except Exception as e:
        log.error("Failed to create WR from drone finding: %s", e)
        return None
