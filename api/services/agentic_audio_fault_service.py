"""Agentic Audio Fault Detection Service — CU-EXT-4.

Processes audio recordings from equipment (bearings, pumps, motors) to
detect fault patterns using spectral analysis + Gemma 4 interpretation.
"""

import logging
import os
import time
import uuid

from sqlalchemy.orm import Session

from api.services.ai_provider_service import generate_text

log = logging.getLogger("ocp_maintenance")

_SYSTEM_PROMPT = """You are an industrial equipment audio fault diagnosis specialist.
Given spectral analysis features from an equipment audio recording, diagnose potential faults.

Common fault patterns:
- BEARING_DEFECT: Distinct peaks at bearing characteristic frequencies (BPFO, BPFI, BSF, FTF). Knocking or grinding sounds.
- CAVITATION: Broadband high-frequency noise (>2kHz). Crackling or hissing. Common in pumps.
- RUBBING: Sub-harmonic frequencies (<100Hz dominant). Scraping or scrubbing sounds. Indicates contact between rotating and stationary parts.
- MISALIGNMENT: Strong 1x and 2x shaft frequency components. May include axial vibration harmonics.
- LOOSENESS: Multiple harmonics of shaft speed. Random, intermittent impacts.
- NORMAL: Smooth spectrum, no dominant fault frequencies.

Based on the spectral features provided, determine:
1. The most likely fault type
2. Severity (LOW, MEDIUM, HIGH, CRITICAL)
3. Recommended action

Respond ONLY with valid JSON:
{
  "fault_type": "BEARING_DEFECT|CAVITATION|RUBBING|MISALIGNMENT|LOOSENESS|NORMAL",
  "severity": "LOW|MEDIUM|HIGH|CRITICAL",
  "confidence": float,
  "diagnosis": "string description",
  "recommended_action": "string",
  "monitoring_interval_hours": int
}"""


def analyze_audio_fault(
    db: Session,
    equipment_tag: str,
    audio_base64: str,
    *,
    plant_id: str = "OCP-JFC1",
    recording_duration_seconds: float = 0,
    equipment_rpm: float | None = None,
    provider: str = "auto",
) -> dict:
    """Analyze an audio recording for equipment fault patterns."""
    from tools.processors.audio_fault_analyzer import (
        audio_bytes_from_base64,
        extract_spectral_features,
        detect_bearing_defect_frequencies,
        classify_audio_pattern,
    )
    from api.database.models import AudioFaultAnalysisModel

    start = time.time()

    # 1. Decode audio
    audio_bytes = audio_bytes_from_base64(audio_base64)

    # 2. Save audio file
    audio_dir = os.path.join("data", "audio_captures")
    os.makedirs(audio_dir, exist_ok=True)
    audio_filename = f"{equipment_tag}_{uuid.uuid4().hex[:8]}.wav"
    audio_path = os.path.join(audio_dir, audio_filename)
    try:
        with open(audio_path, "wb") as f:
            f.write(audio_bytes)
    except Exception as e:
        log.warning("Failed to save audio file: %s", e)
        audio_path = None

    # 3. Spectral analysis
    spectral = extract_spectral_features(audio_bytes)

    # 4. Bearing defect frequency analysis (if RPM provided)
    bearing_analysis = []
    if equipment_rpm and spectral.get("features_extracted"):
        bearing_analysis = detect_bearing_defect_frequencies(spectral, rpm=equipment_rpm)

    # 5. Deterministic classification
    deterministic_class = classify_audio_pattern(spectral) if spectral.get("features_extracted") else "UNKNOWN"

    # 6. AI interpretation
    prompt = (
        f"Equipment: {equipment_tag}\n"
        f"RPM: {equipment_rpm or 'unknown'}\n"
        f"Spectral features: {spectral}\n"
        f"Bearing analysis: {bearing_analysis}\n"
        f"Deterministic classification: {deterministic_class}\n\n"
        f"Provide your expert fault diagnosis."
    )

    ai_result = generate_text(
        prompt=prompt,
        system_prompt=_SYSTEM_PROMPT,
        provider=provider,
        format_json=True,
    )

    ai_parsed = ai_result.get("parsed", {}) or {}
    ai_provider = ai_result.get("provider", "unknown")

    fault_type = ai_parsed.get("fault_type", deterministic_class)
    severity = ai_parsed.get("severity", "UNKNOWN")
    confidence = ai_parsed.get("confidence", 0.5)

    # 7. Persist analysis
    analysis_id = str(uuid.uuid4())
    try:
        analysis = AudioFaultAnalysisModel(
            analysis_id=analysis_id,
            equipment_tag=equipment_tag,
            plant_id=plant_id,
            audio_file_path=audio_path,
            audio_duration_seconds=spectral.get("duration_seconds", recording_duration_seconds),
            sample_rate=spectral.get("sample_rate", 44100),
            spectral_features=spectral,
            detected_patterns=bearing_analysis,
            fault_type=fault_type,
            severity=severity,
            confidence=confidence,
            ai_diagnosis=ai_parsed.get("diagnosis", ""),
            ai_provider=ai_provider,
        )
        db.add(analysis)

        # 8. Create failure prediction if severity is HIGH or CRITICAL
        if severity in ("HIGH", "CRITICAL"):
            _create_failure_prediction(db, equipment_tag, fault_type, severity, confidence, analysis_id)

        db.commit()
    except Exception as e:
        log.error("Failed to persist audio fault analysis: %s", e)
        db.rollback()

    duration_ms = int((time.time() - start) * 1000)

    return {
        "analysis_id": analysis_id,
        "equipment_tag": equipment_tag,
        "fault_type": fault_type,
        "severity": severity,
        "confidence": confidence,
        "diagnosis": ai_parsed.get("diagnosis", ""),
        "recommended_action": ai_parsed.get("recommended_action", ""),
        "monitoring_interval_hours": ai_parsed.get("monitoring_interval_hours", 168),
        "spectral_summary": {
            "rms_energy": spectral.get("rms_energy"),
            "peak_frequency_hz": spectral.get("peak_frequency_hz"),
            "spectral_centroid_hz": spectral.get("spectral_centroid_hz"),
            "duration_seconds": spectral.get("duration_seconds"),
        },
        "bearing_analysis": bearing_analysis,
        "deterministic_classification": deterministic_class,
        "provider": ai_provider,
        "duration_ms": duration_ms,
    }


def _create_failure_prediction(
    db: Session,
    equipment_tag: str,
    fault_type: str,
    severity: str,
    confidence: float,
    analysis_id: str,
):
    """Create a FailurePredictionModel entry for high-severity audio faults."""
    from api.database.models import FailurePredictionModel

    try:
        prediction = FailurePredictionModel(
            prediction_id=str(uuid.uuid4()),
            equipment_id=equipment_tag,
            equipment_tag=equipment_tag,
            failure_pattern="AUDIO_DETECTED",
            recommendation=f"Audio fault detected: {fault_type} (severity: {severity}). "
                          f"Source analysis: {analysis_id}",
            confidence_level=confidence,
            risk_score=0.9 if severity == "CRITICAL" else 0.7,
            status="ACTIVE",
        )
        db.add(prediction)
    except Exception as e:
        log.error("Failed to create failure prediction from audio: %s", e)
