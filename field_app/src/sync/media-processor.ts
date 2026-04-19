/**
 * media-processor.ts — Offline-aware media processing service.
 * Processes queued audio/image captures via server APIs when online.
 * Called from the sync cycle before pushPendingCaptures().
 */
import { db } from '../db/local-db';
import type { CaptureRecord } from '../db/local-db';
import { transcribeAudio, analyzeImage } from '../api/media-api';

export interface MediaProcessingReport {
  processed: number;
  failed: number;
  errors: string[];
}

export class MediaProcessor {
  /**
   * Process all captures that have media blobs but haven't been analyzed yet.
   * Processes sequentially to avoid overwhelming the server.
   */
  async processAllPending(): Promise<MediaProcessingReport> {
    const report: MediaProcessingReport = { processed: 0, failed: 0, errors: [] };

    const pending = await db.captures
      .where('mediaProcessingStatus')
      .equals('pending')
      .toArray();

    for (const capture of pending) {
      try {
        await this.processCapture(capture);
        report.processed++;
      } catch (err) {
        report.failed++;
        report.errors.push(
          `${capture.localId}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    return report;
  }

  /**
   * Process a single capture's media (audio transcription + image analysis).
   * Updates the CaptureRecord in IndexedDB with results.
   */
  private async processCapture(capture: CaptureRecord): Promise<void> {
    // Mark as processing
    await db.captures.update(capture.localId, { mediaProcessingStatus: 'processing' });

    try {
      const updates: Partial<CaptureRecord> = {};

      // Transcribe audio if present
      if (capture.audioBlob) {
        const result = await transcribeAudio(capture.audioBlob, capture.language);
        updates.transcriptionResult = {
          text: result.text,
          language_detected: result.language_detected,
          duration_seconds: result.duration_seconds,
        };
        // Populate rawText so it flows through normal sync
        updates.rawText = result.text;
        updates.rawVoiceText = result.text;
      }

      // Analyze image if present
      if (capture.imageBlob) {
        const result = await analyzeImage(capture.imageBlob, capture.equipmentTag);
        updates.imageAnalysisResult = {
          component_identified: result.component_identified,
          anomalies_detected: result.anomalies_detected,
          severity_visual: result.severity_visual,
        };
      }

      updates.mediaProcessingStatus = 'complete';
      await db.captures.update(capture.localId, updates);
    } catch (err) {
      await db.captures.update(capture.localId, { mediaProcessingStatus: 'failed' });
      throw err;
    }
  }
}

// Singleton instance
export const mediaProcessor = new MediaProcessor();
