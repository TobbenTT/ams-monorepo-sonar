"""Tests for field capture processor."""

import pytest
from datetime import datetime
from tools.processors.field_capture_processor import FieldCaptureProcessor
from tools.models.schemas import (
    FieldCaptureInput, CaptureType, Language, VALID_FM_COMBINATIONS,
    WorkRequestStatus,
)


EQUIPMENT_REGISTRY = [
    {
        "equipment_id": "EQ-001",
        "tag": "BRY-SAG-ML-001",
        "description": "SAG Mill #1",
        "description_fr": "Broyeur SAG #1",
        "aliases": ["SAG MILL", "BROYEUR"],
    },
    {
        "equipment_id": "EQ-002",
        "tag": "BRY-SAG-PP-001",
        "description": "Slurry Pump #1",
        "description_fr": "Pompe de pulpe #1",
        "aliases": ["SLURRY PUMP"],
    },
]


def _make_capture(text: str, tag_manual: str | None = None, capture_type: str = "TEXT") -> FieldCaptureInput:
    return FieldCaptureInput(
        timestamp=datetime.now(),
        technician_id="TECH-001",
        technician_name="Test Tech",
        capture_type=CaptureType(capture_type),
        language_detected=Language.EN,
        raw_text_input=text,
        equipment_tag_manual=tag_manual,
    )


class TestFieldCaptureProcessor:

    def test_process_text_input(self):
        processor = FieldCaptureProcessor(EQUIPMENT_REGISTRY)
        capture = _make_capture("BRY-SAG-ML-001 bearing is worn and vibrating")
        result = processor.process(capture)

        assert result.status == WorkRequestStatus.DRAFT
        assert result.source_capture_id == capture.capture_id
        assert result.equipment_identification.equipment_tag == "BRY-SAG-ML-001"
        assert result.equipment_identification.confidence_score >= 0.9

    def test_equipment_resolution_by_tag(self):
        processor = FieldCaptureProcessor(EQUIPMENT_REGISTRY)
        capture = _make_capture("Problem with BRY-SAG-ML-001")
        result = processor.process(capture)
        assert result.equipment_identification.equipment_id == "EQ-001"

    def test_equipment_resolution_manual(self):
        processor = FieldCaptureProcessor(EQUIPMENT_REGISTRY)
        capture = _make_capture("bearing worn", tag_manual="BRY-SAG-ML-001")
        result = processor.process(capture)
        assert result.equipment_identification.equipment_tag == "BRY-SAG-ML-001"

    def test_failure_mode_detection_wears(self):
        processor = FieldCaptureProcessor(EQUIPMENT_REGISTRY)
        capture = _make_capture("BRY-SAG-ML-001 bearing is worn due to vibration")
        result = processor.process(capture)
        assert result.problem_description.failure_mode_detected == "WEARS"
        # Should have a valid FM code
        if result.problem_description.failure_mode_code:
            parts = result.problem_description.failure_mode_code.split("+")
            assert len(parts) == 2

    def test_failure_mode_validated_against_combinations(self):
        processor = FieldCaptureProcessor(EQUIPMENT_REGISTRY)
        capture = _make_capture("BRY-SAG-ML-001 corroded due to chemical attack")
        result = processor.process(capture)
        if result.problem_description.failure_mode_code:
            parts = result.problem_description.failure_mode_code.split("+")
            mech, cause = parts[0], parts[1]
            # Verify it's a valid combination
            from tools.models.schemas import Mechanism, Cause
            assert (Mechanism(mech), Cause(cause)) in VALID_FM_COMBINATIONS

    def test_priority_calculation(self):
        processor = FieldCaptureProcessor(EQUIPMENT_REGISTRY)
        capture = _make_capture("BRY-SAG-ML-001 safety hazard, bearing cracked")
        result = processor.process(capture)
        # Safety flag should increase priority
        assert len(result.ai_classification.safety_flags) > 0

    def test_spare_parts_suggestion(self):
        processor = FieldCaptureProcessor(EQUIPMENT_REGISTRY)
        capture = _make_capture("BRY-SAG-ML-001 bearing worn needs replacement")
        result = processor.process(capture)
        assert result.problem_description.affected_component == "Bearing"
        assert len(result.spare_parts_suggested) > 0

    def test_no_equipment_found(self):
        processor = FieldCaptureProcessor(EQUIPMENT_REGISTRY)
        capture = _make_capture("something is broken somewhere")
        result = processor.process(capture)
        # Should still produce a result with UNKNOWN or low confidence
        assert result.equipment_identification is not None

    def test_pii_stripped(self):
        processor = FieldCaptureProcessor(EQUIPMENT_REGISTRY)
        capture = _make_capture("Reported by M. Dupont: BRY-SAG-ML-001 bearing worn")
        result = processor.process(capture)
        # PII is stripped from the structured description (analysis path), not original_text
        assert "Dupont" not in result.problem_description.structured_description
