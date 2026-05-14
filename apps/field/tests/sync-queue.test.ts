/**
 * sync-queue.test.ts — Unit tests for the offline write queue.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { syncQueue, type NewCapture } from '../src/sync/sync-queue';
import { db } from '../src/db/local-db';

// ─── Setup ────────────────────────────────────────────────────────────────

beforeEach(async () => {
  await db.captures.clear();
  await db.syncMeta.clear();
});

// ─── Helpers ──────────────────────────────────────────────────────────────

const makeCapture = (overrides: Partial<NewCapture> = {}): NewCapture => ({
  technicianId: 'TECH-001',
  captureType: 'TEXT',
  language: 'fr',
  equipmentTag: 'BRY-SAG-ML-001',
  locationHint: 'Zone Broyage',
  rawText: 'Bruit anormal au roulement côté entraînement',
  ...overrides,
});

// ─── enqueue ─────────────────────────────────────────────────────────────

describe('enqueue', () => {
  it('returns a valid UUID', async () => {
    const id = await syncQueue.enqueue(makeCapture());
    expect(id).toMatch(/^[0-9a-f-]{36}$/i);
  });

  it('saves with syncStatus=pending', async () => {
    const id = await syncQueue.enqueue(makeCapture());
    const record = await db.captures.get(id);
    expect(record).toBeDefined();
    expect(record!.syncStatus).toBe('pending');
  });

  it('saves all capture fields', async () => {
    const capture = makeCapture({ equipmentTag: 'PUMP-001', rawText: 'Test text' });
    const id = await syncQueue.enqueue(capture);
    const record = await db.captures.get(id);
    expect(record!.equipmentTag).toBe('PUMP-001');
    expect(record!.rawText).toBe('Test text');
    expect(record!.technicianId).toBe('TECH-001');
    expect(record!.version).toBe(1);
  });

  it('saves with a createdAt timestamp', async () => {
    const before = new Date().toISOString();
    const id = await syncQueue.enqueue(makeCapture());
    const after = new Date().toISOString();
    const record = await db.captures.get(id);
    expect(record!.createdAt >= before).toBe(true);
    expect(record!.createdAt <= after).toBe(true);
  });

  it('multiple enqueues are independent', async () => {
    const id1 = await syncQueue.enqueue(makeCapture({ rawText: 'First' }));
    const id2 = await syncQueue.enqueue(makeCapture({ rawText: 'Second' }));
    expect(id1).not.toBe(id2);
    const count = await db.captures.count();
    expect(count).toBe(2);
  });
});

// ─── getPendingCount ──────────────────────────────────────────────────────

describe('getPendingCount', () => {
  it('returns 0 when queue is empty', async () => {
    expect(await syncQueue.getPendingCount()).toBe(0);
  });

  it('counts only pending captures', async () => {
    await syncQueue.enqueue(makeCapture());
    await syncQueue.enqueue(makeCapture());
    const id3 = await syncQueue.enqueue(makeCapture());
    await db.captures.update(id3, { syncStatus: 'synced' });

    expect(await syncQueue.getPendingCount()).toBe(2);
  });
});

// ─── getRecent ────────────────────────────────────────────────────────────

describe('getRecent', () => {
  it('returns captures newest first', async () => {
    await syncQueue.enqueue(makeCapture({ rawText: 'First' }));
    await new Promise((r) => setTimeout(r, 5)); // ensure different timestamps
    await syncQueue.enqueue(makeCapture({ rawText: 'Second' }));

    const recent = await syncQueue.getRecent(10);
    expect(recent).toHaveLength(2);
    // Most recent first — "Second" was added last
    expect(recent[0].rawText).toBe('Second');
  });

  it('respects the limit parameter', async () => {
    for (let i = 0; i < 5; i++) {
      await syncQueue.enqueue(makeCapture({ rawText: `Capture ${i}` }));
    }
    const recent = await syncQueue.getRecent(3);
    expect(recent).toHaveLength(3);
  });
});

// ─── markSynced ──────────────────────────────────────────────────────────

describe('markSynced', () => {
  it('updates syncStatus and serverId', async () => {
    const id = await syncQueue.enqueue(makeCapture());
    await syncQueue.markSynced(id, 'CAP-SERVER-999');

    const record = await db.captures.get(id);
    expect(record!.syncStatus).toBe('synced');
    expect(record!.serverId).toBe('CAP-SERVER-999');
    expect(record!.syncedAt).toBeDefined();
  });
});

// ─── markConflict ─────────────────────────────────────────────────────────

describe('markConflict', () => {
  it('updates syncStatus to conflict and stores conflictId', async () => {
    const id = await syncQueue.enqueue(makeCapture());
    await syncQueue.markConflict(id, 'CONFLICT-ABC');

    const record = await db.captures.get(id);
    expect(record!.syncStatus).toBe('conflict');
    expect(record!.conflictId).toBe('CONFLICT-ABC');
  });
});

// ─── remove ──────────────────────────────────────────────────────────────

describe('remove', () => {
  it('deletes the capture from IndexedDB', async () => {
    const id = await syncQueue.enqueue(makeCapture());
    await syncQueue.remove(id);
    const record = await db.captures.get(id);
    expect(record).toBeUndefined();
  });
});
