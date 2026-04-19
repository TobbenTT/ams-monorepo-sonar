/**
 * sync-manager.ts — Pull/push logic between IndexedDB and the FastAPI sync API.
 * Called on reconnect, on app open (if online), and from the "Sync Now" button.
 */
import { db, updateSyncMeta, getSyncMeta } from '../db/local-db';
import type { CaptureRecord, WorkOrderCache } from '../db/local-db';
import { mediaProcessor } from './media-processor';

// ─── Types ────────────────────────────────────────────────────────────────

export interface SyncReport {
  pushed: number;
  pulled: number;
  conflicts: number;
  errors: string[];
  timestamp: string;
}

export interface SyncResult {
  accepted: number;
  conflicts: ConflictRecord[];
  server_ids: Record<string, string>;
}

export interface ConflictRecord {
  conflict_id: string;
  entity_type: string;
  entity_id: string;
  field: string;
  local_value: string;
  server_value: string;
  local_modified_at: string;
  server_modified_at: string;
  resolution: string | null;
}

interface HierarchyNode {
  node_id: string;
  name: string;
  name_fr: string;
  tag: string;
  node_type: string;
  parent_node_id?: string;
  plant_id?: string;
}

interface SyncDeltaItem {
  id: string;
  action: string;
  data: Record<string, unknown>;
  version: number;
  modified_at: string;
}

interface SyncPullApiResponse {
  entity_type: string;
  items: SyncDeltaItem[];
  server_timestamp: string;
  has_more: boolean;
}

// ─── API Base ─────────────────────────────────────────────────────────────

const API_BASE = '/api/v1';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!response.ok) {
    const text = await response.text().catch(() => response.statusText);
    throw new Error(`API ${path} → ${response.status}: ${text}`);
  }
  return response.json() as Promise<T>;
}

// ─── SyncManager ──────────────────────────────────────────────────────────

export class SyncManager {
  private deviceId: string;

  constructor() {
    // Stable device ID persisted in localStorage
    let id = localStorage.getItem('ams-device-id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('ams-device-id', id);
    }
    this.deviceId = id;
  }

  // ── Pull: equipment hierarchy ──────────────────────────────────────────

  async pullEquipmentHierarchy(): Promise<number> {
    const nodes = await apiFetch<HierarchyNode[]>('/hierarchy/nodes');
    const records = nodes.map((n) => ({
      nodeId: n.node_id,
      name: n.name,
      nameFr: n.name_fr ?? n.name,
      tag: n.tag ?? n.node_id,
      nodeType: n.node_type,
      parentId: n.parent_node_id,
      plantId: n.plant_id,
      cachedAt: new Date().toISOString(),
    }));
    // bulkPut = upsert all records
    await db.equipment.bulkPut(records);
    await updateSyncMeta('equipment', records.length);
    return records.length;
  }

  // ── Pull: work orders ─────────────────────────────────────────────────

  async pullWorkOrders(forDate?: string): Promise<number> {
    const since = new Date(0).toISOString(); // Pull all orders for now
    const responses = await apiFetch<SyncPullApiResponse[]>('/sync/pull', {
      method: 'POST',
      body: JSON.stringify({
        entity_types: ['work_orders'],
        since,
        limit: 200,
      }),
    });

    const workOrderResponse = responses.find((r) => r.entity_type === 'work_orders');
    if (!workOrderResponse || workOrderResponse.items.length === 0) return 0;

    const records: WorkOrderCache[] = workOrderResponse.items.map((item) => {
      const d = item.data as Record<string, string | number | string[]>;
      // Map server fields to our WorkOrderCache schema
      const scheduledDate =
        (d.created_date as string)?.slice(0, 10) ??
        new Date().toISOString().slice(0, 10);
      return {
        orderId: String(d.work_order_id ?? item.id),
        orderType: String(d.order_type ?? 'PREVENTIVE'),
        equipmentTag: String(d.equipment_tag ?? d.equipment_id ?? ''),
        equipmentName: String(d.equipment_tag ?? d.equipment_id ?? ''),
        description: String(d.description ?? ''),
        descriptionFr: String(d.description_fr ?? d.description ?? ''),
        priority: String(d.priority ?? 'PLANNED'),
        status: String(d.status ?? 'OPEN'),
        scheduledDate: forDate ?? scheduledDate,
        estimatedHours: Number(d.actual_duration_hours ?? d.estimated_hours ?? 2),
        assignedTo: String(d.assigned_to ?? '—'),
        materials: Array.isArray(d.materials_consumed) ? (d.materials_consumed as string[]) : [],
        cachedAt: new Date().toISOString(),
      };
    });

    await db.workOrders.bulkPut(records);
    await updateSyncMeta('workOrders', records.length);
    return records.length;
  }

  // ── Push: pending captures ─────────────────────────────────────────────

  async pushPendingCaptures(): Promise<SyncResult> {
    const pending = await db.captures.where('syncStatus').equals('pending').toArray();
    if (pending.length === 0) {
      return { accepted: 0, conflicts: [], server_ids: {} };
    }

    const items = pending.map((c: CaptureRecord) => ({
      entity_type: 'captures',
      local_id: c.localId,
      action: c.serverId ? 'update' : 'create',
      data: {
        technician_id: c.technicianId,
        capture_type: c.captureType,
        language: c.language,
        equipment_tag: c.equipmentTag,
        location_hint: c.locationHint,
        raw_text: c.rawText,
        raw_voice_text: c.rawVoiceText,
        version: c.version,
        // GPS fields
        gps_lat: c.gpsLat,
        gps_lon: c.gpsLon,
        gps_accuracy: c.gpsAccuracy,
        // Image analysis (JSON, already processed by MediaProcessor)
        image_analysis_json: c.imageAnalysisResult
          ? JSON.stringify(c.imageAnalysisResult)
          : undefined,
      },
      offline_created_at: c.createdAt,
    }));

    const result = await apiFetch<SyncResult>('/sync/push', {
      method: 'POST',
      body: JSON.stringify({ items, device_id: this.deviceId }),
    });

    // Update local records based on server response
    await db.transaction('rw', db.captures, async () => {
      for (const capture of pending) {
        const serverId = result.server_ids[capture.localId];
        const conflict = result.conflicts.find(
          (c) => c.entity_id === capture.localId || c.entity_id === serverId,
        );

        if (conflict) {
          await db.captures.update(capture.localId, {
            syncStatus: 'conflict',
            conflictId: conflict.conflict_id,
          });
        } else if (serverId || result.accepted > 0) {
          await db.captures.update(capture.localId, {
            syncStatus: 'synced',
            serverId: serverId ?? capture.serverId,
            syncedAt: new Date().toISOString(),
          });
        }
      }
    });

    await updateSyncMeta('captures', await db.captures.count());
    return result;
  }

  // ── Full sync cycle ────────────────────────────────────────────────────

  async syncAll(): Promise<SyncReport> {
    const report: SyncReport = {
      pushed: 0,
      pulled: 0,
      conflicts: 0,
      errors: [],
      timestamp: new Date().toISOString(),
    };

    // 1. Process media captures (transcribe audio, analyze images) before pushing
    try {
      await mediaProcessor.processAllPending();
    } catch (err) {
      report.errors.push(
        `Process media: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    // 2. Push pending captures (now with transcription results in rawText)
    try {
      const pushResult = await this.pushPendingCaptures();
      report.pushed = pushResult.accepted;
      report.conflicts = pushResult.conflicts.length;
    } catch (err) {
      report.errors.push(`Push captures: ${err instanceof Error ? err.message : String(err)}`);
    }

    // 3. Pull equipment hierarchy (cache refresh every hour)
    try {
      const equipMeta = await getSyncMeta('equipment');
      const ageMs = Date.now() - new Date(equipMeta.lastSyncAt).getTime();
      const ONE_HOUR = 60 * 60 * 1000;
      if (ageMs > ONE_HOUR || equipMeta.recordCount === 0) {
        const pulled = await this.pullEquipmentHierarchy();
        report.pulled += pulled;
      }
    } catch (err) {
      report.errors.push(
        `Pull hierarchy: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    // 4. Pull work orders (always refresh when online)
    try {
      const pulled = await this.pullWorkOrders();
      report.pulled += pulled;
    } catch (err) {
      report.errors.push(
        `Pull work orders: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    return report;
  }

  // ── Pending count (for badge) ─────────────────────────────────────────

  async getPendingCount(): Promise<number> {
    return db.captures.where('syncStatus').equals('pending').count();
  }

  // ── Resolve conflict ──────────────────────────────────────────────────

  async resolveConflict(conflictId: string, strategy: 'LOCAL_WINS' | 'SERVER_WINS'): Promise<void> {
    await apiFetch('/sync/resolve', {
      method: 'POST',
      body: JSON.stringify({ conflict_id: conflictId, strategy }),
    });
    // Clear conflict status locally
    const capture = await db.captures.where('conflictId').equals(conflictId).first();
    if (capture) {
      await db.captures.update(capture.localId, {
        syncStatus: strategy === 'LOCAL_WINS' ? 'pending' : 'synced',
        conflictId: undefined,
      });
    }
  }
}

// Singleton instance
export const syncManager = new SyncManager();
