/**
 * local-db.ts — IndexedDB schema via Dexie.js
 * All field data is stored here for offline-first operation.
 */
import Dexie, { type Table } from 'dexie';

// ─── Table Interfaces ──────────────────────────────────────────────────────

export interface TranscriptionResult {
  text: string;
  language_detected: string;
  duration_seconds?: number;
}

export interface ImageAnalysisResult {
  component_identified: string | null;
  anomalies_detected: string[];
  severity_visual: string;
}

export type MediaProcessingStatus = 'pending' | 'processing' | 'complete' | 'failed';

export interface CaptureRecord {
  localId: string;          // UUID generated client-side
  serverId?: string;        // Assigned after successful sync
  technicianId: string;
  captureType: 'TEXT' | 'VOICE' | 'IMAGE';
  language: string;
  equipmentTag: string;
  locationHint: string;
  rawText: string;
  rawVoiceText?: string;
  syncStatus: 'pending' | 'synced' | 'conflict';
  createdAt: string;        // ISO timestamp
  syncedAt?: string;        // ISO timestamp, set after sync
  version: number;
  conflictId?: string;      // Set if server returned a conflict
  // Media capture fields (v3)
  audioBlob?: Blob;                          // Raw audio recording (webm/ogg)
  imageBlob?: Blob;                          // Raw image capture (jpeg/png)
  imageThumbnail?: string;                   // Base64 compressed preview (~50KB)
  gpsLat?: number;                           // WGS-84 latitude
  gpsLon?: number;                           // WGS-84 longitude
  gpsAccuracy?: number;                      // Accuracy in metres
  transcriptionResult?: TranscriptionResult; // Populated after server transcription
  imageAnalysisResult?: ImageAnalysisResult; // Populated after server analysis
  mediaProcessingStatus?: MediaProcessingStatus; // Track media processing state
}

export interface EquipmentCache {
  nodeId: string;
  name: string;
  nameFr: string;
  tag: string;
  nodeType: string;
  parentId?: string;
  plantId?: string;
  cachedAt: string;         // ISO timestamp
}

export interface SyncMeta {
  entityType: string;       // Primary key (e.g. "captures", "equipment")
  lastSyncAt: string;       // ISO timestamp of last successful sync
  recordCount: number;
}

export interface WorkOrderCache {
  orderId: string;          // Primary key
  orderType: string;        // PREVENTIVE | CORRECTIVE | PREDICTIVE
  equipmentTag: string;
  equipmentName: string;
  description: string;
  descriptionFr: string;
  priority: string;         // URGENT | PLANNED | DEFERRED
  status: string;
  scheduledDate: string;    // ISO date (YYYY-MM-DD)
  estimatedHours: number;
  assignedTo: string;
  materials: string[];
  cachedAt: string;
}

export interface ChecklistItem {
  localId: string;          // UUID (primary key)
  workOrderId: string;      // FK to WorkOrderCache
  stepNumber: number;
  description: string;
  descriptionFr: string;
  isGate: boolean;          // Must confirm before next gate can proceed
  requiresPhoto: boolean;
  acceptedMin?: number;     // Measurement lower bound
  acceptedMax?: number;     // Measurement upper bound
  unit?: string;            // e.g. "Nm", "°C", "mm/s"
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
  notes?: string;
  measurement?: number;
  photoBlob?: string;       // base64 encoded (compressed JPEG)
  syncStatus: 'pending' | 'synced';
}

// ─── Database Class ────────────────────────────────────────────────────────

class LocalDB extends Dexie {
  captures!: Table<CaptureRecord>;
  equipment!: Table<EquipmentCache>;
  syncMeta!: Table<SyncMeta>;
  workOrders!: Table<WorkOrderCache>;
  checklists!: Table<ChecklistItem>;

  constructor() {
    super('ams-field');
    this.version(1).stores({
      // Indexed fields only — full objects stored automatically
      captures: 'localId, syncStatus, createdAt, equipmentTag',
      equipment: 'nodeId, tag, nodeType, plantId',
      syncMeta: 'entityType',
    });
    // v2 adds work order cache and checklist progress tables
    this.version(2).stores({
      workOrders: 'orderId, scheduledDate, equipmentTag, priority, status',
      checklists: 'localId, workOrderId, stepNumber, syncStatus',
    });
    // v3 adds media processing status index for offline media capture
    this.version(3).stores({
      captures: 'localId, syncStatus, createdAt, equipmentTag, mediaProcessingStatus',
    });
  }
}

// Singleton instance — shared across the entire app
export const db = new LocalDB();

// ─── Helper Functions ──────────────────────────────────────────────────────

/**
 * Generate a UUID v4 locally (no server needed)
 */
export function generateLocalId(): string {
  return crypto.randomUUID();
}

/**
 * Get sync metadata for an entity type, or default if not yet synced.
 */
export async function getSyncMeta(entityType: string): Promise<SyncMeta> {
  const meta = await db.syncMeta.get(entityType);
  return meta ?? { entityType, lastSyncAt: new Date(0).toISOString(), recordCount: 0 };
}

/**
 * Update sync metadata after a successful sync operation.
 */
export async function updateSyncMeta(entityType: string, recordCount: number): Promise<void> {
  await db.syncMeta.put({
    entityType,
    lastSyncAt: new Date().toISOString(),
    recordCount,
  });
}
