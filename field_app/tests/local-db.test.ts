/**
 * local-db.test.ts — Unit tests for IndexedDB schema and helper functions.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import Dexie from 'dexie';

// Re-import to get a fresh instance per test suite
// We import the class itself and create a local test instance
import type { CaptureRecord, EquipmentCache, SyncMeta, WorkOrderCache, ChecklistItem } from '../src/db/local-db';
import { generateLocalId, getSyncMeta, updateSyncMeta } from '../src/db/local-db';
import { db } from '../src/db/local-db';

// ─── Setup: clear DB before each test ────────────────────────────────────

beforeEach(async () => {
  await db.captures.clear();
  await db.equipment.clear();
  await db.syncMeta.clear();
  await db.workOrders.clear();
  await db.checklists.clear();
});

// ─── generateLocalId ─────────────────────────────────────────────────────

describe('generateLocalId', () => {
  it('generates a UUID v4 string', () => {
    const id = generateLocalId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, generateLocalId));
    expect(ids.size).toBe(100);
  });
});

// ─── CaptureRecord CRUD ───────────────────────────────────────────────────

describe('CaptureRecord CRUD', () => {
  const makeCapture = (overrides: Partial<CaptureRecord> = {}): CaptureRecord => ({
    localId: generateLocalId(),
    technicianId: 'TECH-001',
    captureType: 'TEXT',
    language: 'fr',
    equipmentTag: 'BRY-SAG-ML-001',
    locationHint: 'Zone Broyage',
    rawText: 'Bruit anormal au roulement',
    syncStatus: 'pending',
    createdAt: new Date().toISOString(),
    version: 1,
    ...overrides,
  });

  it('adds a capture and retrieves it by localId', async () => {
    const capture = makeCapture();
    await db.captures.add(capture);
    const found = await db.captures.get(capture.localId);
    expect(found).toBeDefined();
    expect(found!.technicianId).toBe('TECH-001');
    expect(found!.syncStatus).toBe('pending');
  });

  it('updates syncStatus to synced', async () => {
    const capture = makeCapture();
    await db.captures.add(capture);
    await db.captures.update(capture.localId, {
      syncStatus: 'synced',
      serverId: 'CAP-SERVER-001',
      syncedAt: new Date().toISOString(),
    });
    const updated = await db.captures.get(capture.localId);
    expect(updated!.syncStatus).toBe('synced');
    expect(updated!.serverId).toBe('CAP-SERVER-001');
  });

  it('queries by syncStatus index', async () => {
    await db.captures.bulkAdd([
      makeCapture({ localId: generateLocalId(), syncStatus: 'pending' }),
      makeCapture({ localId: generateLocalId(), syncStatus: 'pending' }),
      makeCapture({ localId: generateLocalId(), syncStatus: 'synced' }),
    ]);
    const pending = await db.captures.where('syncStatus').equals('pending').toArray();
    expect(pending).toHaveLength(2);
  });

  it('deletes a capture', async () => {
    const capture = makeCapture();
    await db.captures.add(capture);
    await db.captures.delete(capture.localId);
    const found = await db.captures.get(capture.localId);
    expect(found).toBeUndefined();
  });
});

// ─── EquipmentCache CRUD ─────────────────────────────────────────────────

describe('EquipmentCache CRUD', () => {
  const makeEquipment = (overrides: Partial<EquipmentCache> = {}): EquipmentCache => ({
    nodeId: generateLocalId(),
    name: 'SAG Mill Motor',
    nameFr: 'Moteur Broyeur SAG',
    tag: 'BRY-SAG-ML-001',
    nodeType: 'EQUIPMENT',
    cachedAt: new Date().toISOString(),
    ...overrides,
  });

  it('bulk-puts equipment records', async () => {
    const records = [
      makeEquipment({ tag: 'EQ-001' }),
      makeEquipment({ tag: 'EQ-002' }),
      makeEquipment({ tag: 'EQ-003' }),
    ];
    await db.equipment.bulkPut(records);
    const count = await db.equipment.count();
    expect(count).toBe(3);
  });

  it('upserts on duplicate nodeId', async () => {
    const nodeId = generateLocalId();
    await db.equipment.put(makeEquipment({ nodeId, name: 'Old Name' }));
    await db.equipment.put(makeEquipment({ nodeId, name: 'New Name' }));
    const count = await db.equipment.count();
    expect(count).toBe(1);
    const record = await db.equipment.get(nodeId);
    expect(record!.name).toBe('New Name');
  });

  it('filters by nodeType', async () => {
    await db.equipment.bulkPut([
      makeEquipment({ nodeId: generateLocalId(), nodeType: 'EQUIPMENT' }),
      makeEquipment({ nodeId: generateLocalId(), nodeType: 'FUNCTIONAL_LOCATION' }),
      makeEquipment({ nodeId: generateLocalId(), nodeType: 'EQUIPMENT' }),
    ]);
    const equipment = await db.equipment.where('nodeType').equals('EQUIPMENT').toArray();
    expect(equipment).toHaveLength(2);
  });
});

// ─── SyncMeta helpers ─────────────────────────────────────────────────────

describe('SyncMeta helpers', () => {
  it('getSyncMeta returns default when not set', async () => {
    const meta = await getSyncMeta('captures');
    expect(meta.entityType).toBe('captures');
    expect(meta.recordCount).toBe(0);
    expect(new Date(meta.lastSyncAt).getTime()).toBe(new Date(0).getTime());
  });

  it('updateSyncMeta persists and getSyncMeta retrieves', async () => {
    await updateSyncMeta('equipment', 42);
    const meta = await getSyncMeta('equipment');
    expect(meta.entityType).toBe('equipment');
    expect(meta.recordCount).toBe(42);
    // lastSyncAt should be recent
    expect(Date.now() - new Date(meta.lastSyncAt).getTime()).toBeLessThan(5000);
  });

  it('updateSyncMeta upserts (no duplicates)', async () => {
    await updateSyncMeta('captures', 10);
    await updateSyncMeta('captures', 20);
    const count = await db.syncMeta.count();
    expect(count).toBe(1);
    const meta = await getSyncMeta('captures');
    expect(meta.recordCount).toBe(20);
  });
});

// ─── WorkOrderCache CRUD ──────────────────────────────────────────────────

describe('WorkOrderCache CRUD', () => {
  const makeOrder = (overrides: Partial<WorkOrderCache> = {}): WorkOrderCache => ({
    orderId: generateLocalId(),
    orderType: 'PREVENTIVE',
    equipmentTag: 'BRY-SAG-ML-001',
    equipmentName: 'Broyeur SAG',
    description: 'Replace bearing',
    descriptionFr: 'Remplacement roulement',
    priority: 'URGENT',
    status: 'OPEN',
    scheduledDate: '2026-03-12',
    estimatedHours: 4,
    assignedTo: 'J. Alquinta',
    materials: ['SKF 6316', 'Mobilux EP2'],
    cachedAt: new Date().toISOString(),
    ...overrides,
  });

  it('adds and retrieves a work order by orderId', async () => {
    const order = makeOrder();
    await db.workOrders.add(order);
    const found = await db.workOrders.get(order.orderId);
    expect(found).toBeDefined();
    expect(found!.equipmentTag).toBe('BRY-SAG-ML-001');
    expect(found!.priority).toBe('URGENT');
  });

  it('queries work orders by scheduledDate', async () => {
    await db.workOrders.bulkAdd([
      makeOrder({ orderId: generateLocalId(), scheduledDate: '2026-03-12' }),
      makeOrder({ orderId: generateLocalId(), scheduledDate: '2026-03-12' }),
      makeOrder({ orderId: generateLocalId(), scheduledDate: '2026-03-13' }),
    ]);
    const todayOrders = await db.workOrders.where('scheduledDate').equals('2026-03-12').toArray();
    expect(todayOrders).toHaveLength(2);
  });

  it('upserts on duplicate orderId', async () => {
    const orderId = generateLocalId();
    await db.workOrders.put(makeOrder({ orderId, priority: 'PLANNED' }));
    await db.workOrders.put(makeOrder({ orderId, priority: 'URGENT' }));
    const count = await db.workOrders.count();
    expect(count).toBe(1);
    const record = await db.workOrders.get(orderId);
    expect(record!.priority).toBe('URGENT');
  });

  it('stores materials array intact', async () => {
    const order = makeOrder({ materials: ['Part A', 'Part B', 'Part C'] });
    await db.workOrders.add(order);
    const found = await db.workOrders.get(order.orderId);
    expect(found!.materials).toEqual(['Part A', 'Part B', 'Part C']);
  });
});

// ─── ChecklistItem CRUD ───────────────────────────────────────────────────

describe('ChecklistItem CRUD', () => {
  const workOrderId = generateLocalId();

  const makeStep = (overrides: Partial<ChecklistItem> = {}): ChecklistItem => ({
    localId: generateLocalId(),
    workOrderId,
    stepNumber: 1,
    description: 'Electrical lockout verified',
    descriptionFr: 'Blocage électrique vérifié (LOTO)',
    isGate: true,
    requiresPhoto: false,
    completed: false,
    syncStatus: 'pending',
    ...overrides,
  });

  it('adds a checklist step and retrieves it', async () => {
    const step = makeStep({ stepNumber: 1 });
    await db.checklists.add(step);
    const found = await db.checklists.get(step.localId);
    expect(found).toBeDefined();
    expect(found!.isGate).toBe(true);
    expect(found!.completed).toBe(false);
  });

  it('queries all steps for a work order in order', async () => {
    await db.checklists.bulkAdd([
      makeStep({ stepNumber: 3 }),
      makeStep({ stepNumber: 1 }),
      makeStep({ stepNumber: 2 }),
    ]);
    const steps = await db.checklists
      .where('workOrderId')
      .equals(workOrderId)
      .sortBy('stepNumber');
    expect(steps).toHaveLength(3);
    expect(steps[0].stepNumber).toBe(1);
    expect(steps[2].stepNumber).toBe(3);
  });

  it('marks a gate step as completed', async () => {
    const step = makeStep({ isGate: true, stepNumber: 1 });
    await db.checklists.add(step);
    await db.checklists.update(step.localId, {
      completed: true,
      completedAt: new Date().toISOString(),
      completedBy: 'TECH-001',
      syncStatus: 'pending',
    });
    const found = await db.checklists.get(step.localId);
    expect(found!.completed).toBe(true);
    expect(found!.completedBy).toBe('TECH-001');
  });

  it('stores measurement value', async () => {
    const step = makeStep({ acceptedMin: 120, acceptedMax: 150, unit: 'Nm' });
    await db.checklists.add(step);
    await db.checklists.update(step.localId, { measurement: 135 });
    const found = await db.checklists.get(step.localId);
    expect(found!.measurement).toBe(135);
  });

  it('counts pending (unsynced) steps', async () => {
    await db.checklists.bulkAdd([
      makeStep({ stepNumber: 1, syncStatus: 'pending' }),
      makeStep({ stepNumber: 2, syncStatus: 'pending' }),
      makeStep({ stepNumber: 3, syncStatus: 'synced' }),
    ]);
    const pending = await db.checklists.where('syncStatus').equals('pending').count();
    expect(pending).toBe(2);
  });
});
