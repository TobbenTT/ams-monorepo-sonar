"""Blender Render Service — Generate equipment reference images via Blender MCP.

Renders 3D equipment models from standardized inspection angles to produce
reference images for comparison against field photos. Supports the digital
twin and visual inspection workflows.

NOTE: This service requires a running Blender instance with MCP server enabled.
The MCP tools (mcp__blender__*) are used for model manipulation and rendering.
"""

import base64
import json
import logging
import os
from datetime import datetime
from pathlib import Path
from typing import Optional

log = logging.getLogger("ocp_maintenance")

# Standard inspection angles for equipment rendering
STANDARD_ANGLES = ["front", "side", "top", "isometric"]

# Camera positions for standard angles (Blender coordinates: X, Y, Z)
CAMERA_POSITIONS = {
    "front": {"location": (0, -5, 1.5), "rotation": (1.4, 0, 0)},
    "side": {"location": (5, 0, 1.5), "rotation": (1.4, 0, 1.57)},
    "top": {"location": (0, 0, 7), "rotation": (0, 0, 0)},
    "isometric": {"location": (4, -4, 4), "rotation": (0.9, 0, 0.78)},
    "detail": {"location": (2, -2, 1), "rotation": (1.2, 0, 0.5)},
}

# Equipment type to Blender search keywords
EQUIPMENT_SEARCH_TERMS = {
    "centrifugal_pump": "industrial pump centrifugal",
    "sag_mill": "ball mill mining",
    "crusher": "jaw crusher mining",
    "conveyor": "belt conveyor industrial",
    "electric_motor": "electric motor industrial",
    "gearbox": "gearbox reducer industrial",
    "cyclone": "hydrocyclone mining",
    "compressor": "air compressor industrial",
    "heat_exchanger": "heat exchanger shell tube",
    "agitator": "agitator mixer tank",
    "valve": "industrial valve gate ball",
    "fan": "industrial fan centrifugal",
    "generator": "diesel generator industrial",
    "transformer": "power transformer electrical",
    "tank": "storage tank industrial",
}

# Render output directory
RENDERS_DIR = Path("data/equipment_renders")


class BlenderRenderService:
    """Service for rendering 3D equipment models via Blender MCP tools."""

    def __init__(self, renders_dir: Path | None = None):
        self.renders_dir = renders_dir or RENDERS_DIR
        self.renders_dir.mkdir(parents=True, exist_ok=True)

    def get_render_path(self, equipment_type: str, angle: str) -> Path:
        """Get the file path for a rendered image."""
        return self.renders_dir / f"{equipment_type}_{angle}.png"

    def get_cached_renders(self, equipment_type: str) -> dict[str, str]:
        """Get existing rendered images for an equipment type.

        Returns dict of {angle: base64_image} for cached renders.
        """
        renders = {}
        for angle in STANDARD_ANGLES:
            path = self.get_render_path(equipment_type, angle)
            if path.exists():
                renders[angle] = base64.b64encode(path.read_bytes()).decode("utf-8")
        return renders

    def save_render(self, equipment_type: str, angle: str, image_data: bytes) -> Path:
        """Save a rendered image to disk."""
        path = self.get_render_path(equipment_type, angle)
        path.write_bytes(image_data)
        log.info("Saved render: %s", path)
        return path

    def get_blender_render_script(self, equipment_type: str, angle: str) -> str:
        """Generate Blender Python script for positioning camera and rendering.

        This script is intended to be executed via mcp__blender__execute_blender_code.
        """
        cam = CAMERA_POSITIONS.get(angle, CAMERA_POSITIONS["isometric"])
        loc = cam["location"]
        rot = cam["rotation"]

        return f"""
import bpy
import math

# Set up camera for {angle} view of {equipment_type}
scene = bpy.context.scene

# Ensure camera exists
if 'Camera' not in bpy.data.objects:
    bpy.ops.object.camera_add()

cam = bpy.data.objects['Camera']
cam.location = {loc}
cam.rotation_euler = {rot}
scene.camera = cam

# Render settings
scene.render.resolution_x = 1024
scene.render.resolution_y = 768
scene.render.film_transparent = True

# Set up lighting if not present
if not any(obj.type == 'LIGHT' for obj in bpy.data.objects):
    bpy.ops.object.light_add(type='SUN', location=(5, -5, 10))
    bpy.data.lights['Sun'].energy = 3.0

print(f"Camera positioned for {angle} view: loc={loc}, rot={rot}")
"""

    def get_search_terms(self, equipment_type: str) -> str:
        """Get search keywords for finding 3D models of this equipment type."""
        return EQUIPMENT_SEARCH_TERMS.get(
            equipment_type,
            f"industrial {equipment_type.replace('_', ' ')}",
        )

    def build_model_metadata(
        self,
        equipment_type: str,
        source: str,
        source_url: str = "",
    ) -> dict:
        """Build metadata dict for storing a 3D model record."""
        return {
            "equipment_type": equipment_type,
            "source": source,  # "sketchfab", "polyhaven", "hyper3d", "manual"
            "source_url": source_url,
            "render_angles": STANDARD_ANGLES,
            "created_at": datetime.now().isoformat(),
        }


# ---------------------------------------------------------------------------
# Module-level singleton
# ---------------------------------------------------------------------------

_service: BlenderRenderService | None = None


def get_blender_render_service() -> BlenderRenderService:
    """Get or create the module-level BlenderRenderService singleton."""
    global _service
    if _service is None:
        _service = BlenderRenderService()
    return _service
