/**
 * sync-queue.ts — Offline write queue backed by IndexedDB.
 * Captures submitted while offline are queued here until sync.
 */
import { db, generateLocalId } from '../db/local-db';
import type { CaptureRecord } from '../db/local-db';

// ─── Types ────────────────────────────────────────────────────────────────

export interface NewCapture {
  technicianId: string;
  captureType: 'TEXT' | 'VOICE' | 'IMAGE';
  language: string;
  equipmentTag: string;
  locationHint: string;
  rawText: string;
  rawVoiceText?: string;
  // Media capture fields
  audioBlob?: Blob;
  imageBlob?: Blob;
  imageThumbnail?: string;
  gpsLat?: number;
  gpsLon?: number;
  gpsAccuracy?: number;
}

// ─── SyncQueue ────────────────────────────────────────────────────────────

export class SyncQueue {
  /**
   * Enqueue a new capture for offline storage.
   * Returns the localId of the saved record.
   */
  async enqueue(capture: NewCapture): Promise<string> {
    const localId = generateLocalId();
    const hasMedia = capture.audioBlob != null || capture.imageBlob != null;
    const record: CaptureRecord = {
      localId,
      technicianId: capture.technicianId,
      captureType: capture.captureType,
      language: capture.language,
      equipmentTag: capture.equipmentTag,
      locationHint: capture.locationHint,
      rawText: capture.rawText,
      rawVoiceText: capture.rawVoiceText,
      syncStatus: 'pending',
      createdAt: new Date().toISOString(),
      version: 1,
      // Media fields
      audioBlob: capture.audioBlob,
      imageBlob: capture.imageBlob,
      imageThumbnail: capture.imageThumbnail,
      gpsLat: capture.gpsLat,
      gpsLon: capture.gpsLon,
      gpsAccuracy: capture.gpsAccuracy,
      mediaProcessingStatus: hasMedia ? 'pending' : undefined,
    };
    await db.captures.add(record);
    return localId;
  }

  /**
   * Count captures waiting to be pushed to the server.
   */
  async getPendingCount(): Promise<number> {
    return db.captures.where('syncStatus').equals('pending').count();
  }

  /**
   * Get all pending captures (for display in the queue list).
   */
  async getPending(): Promise<CaptureRecord[]> {
    return db.captures.where('syncStatus').equals('pending').reverse().sortBy('createdAt');
  }

  /**
   * Get recent captures (all statuses) ordered newest-first.
   */
  async getRecent(limit = 10): Promise<CaptureRecord[]> {
    const all = await db.captures.orderBy('createdAt').reverse().limit(limit).toArray();
    return all;
  }

  /**
   * Mark a capture as successfully synced and store the server-assigned ID.
   */
  async markSynced(localId: string, serverId: string): Promise<void> {
    await db.captures.update(localId, {
      syncStatus: 'synced',
      serverId,
      syncedAt: new Date().toISOString(),
    });
  }

  /**
   * Mark a capture as conflicted and store the conflict ID for resolution.
   */
  async markConflict(localId: string, conflictId: string): Promise<void> {
    await db.captures.update(localId, {
      syncStatus: 'conflict',
      conflictId,
    });
  }

  /**
   * Delete a capture (e.g., after server rejected it permanently).
   */
  async remove(localId: string): Promise<void> {
    await db.captures.delete(localId);
  }
}

// Singleton instance
export const syncQueue = new SyncQueue();
