/**
 * media-api.ts — Client for FastAPI media endpoints.
 * Uses FormData for multipart uploads (audio/image blobs).
 */

const API_BASE = '/api/v1';

// ─── Types ────────────────────────────────────────────────────────────────

export interface TranscriptionResult {
  text: string;
  language_detected: string;
  duration_seconds?: number;
  confidence?: number;
}

export interface ImageAnalysisResult {
  component_identified: string | null;
  anomalies_detected: string[];
  severity_visual: string;
}

export interface NearbyEquipment {
  equipment_tag: string;
  distance_m: number;
  confidence: string;
  name?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function getExtension(mimeType: string): string {
  if (mimeType.includes('webm')) return 'webm';
  if (mimeType.includes('ogg')) return 'ogg';
  if (mimeType.includes('mp4')) return 'mp4';
  if (mimeType.includes('png')) return 'png';
  if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return 'jpg';
  return 'bin';
}

// ─── API Functions ────────────────────────────────────────────────────────

export async function transcribeAudio(
  audioBlob: Blob,
  language: string,
): Promise<TranscriptionResult> {
  const form = new FormData();
  form.append('file', audioBlob, `capture.${getExtension(audioBlob.type)}`);
  form.append('language', language);
  const res = await fetch(`${API_BASE}/media/transcribe`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Transcription failed (${res.status}): ${text}`);
  }
  return res.json();
}

export async function analyzeImage(
  imageBlob: Blob,
  context: string = '',
): Promise<ImageAnalysisResult> {
  const form = new FormData();
  form.append('file', imageBlob, `capture.${getExtension(imageBlob.type)}`);
  form.append('context', context);
  const res = await fetch(`${API_BASE}/media/analyze-image`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Image analysis failed (${res.status}): ${text}`);
  }
  return res.json();
}

export async function findNearbyEquipment(
  lat: number,
  lon: number,
  radiusM: number = 100,
): Promise<NearbyEquipment[]> {
  const res = await fetch(
    `${API_BASE}/capture/nearby?lat=${lat}&lon=${lon}&radius_m=${radiusM}`,
  );
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Nearby lookup failed (${res.status}): ${text}`);
  }
  return res.json();
}
