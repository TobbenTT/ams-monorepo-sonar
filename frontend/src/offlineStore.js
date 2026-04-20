/**
 * Offline storage using IndexedDB — caches critical data for field use.
 * Stores: work orders, schedules, equipment hierarchy, pending captures.
 * Syncs back to server when connectivity returns.
 */

const DB_NAME = 'ocp-offline';
const DB_VERSION = 2;

const STORES = {
    workOrders: 'work_orders',
    schedules: 'schedules',
    equipment: 'equipment',
    pendingCaptures: 'pending_captures',
    cache: 'api_cache',
    pendingMutations: 'pending_mutations',  // generic offline queue (v2)
    failedMutations: 'failed_mutations',    // mutations that conflicted on sync (v2)
};

function openDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORES.workOrders))
                db.createObjectStore(STORES.workOrders, { keyPath: 'request_id' });
            if (!db.objectStoreNames.contains(STORES.schedules))
                db.createObjectStore(STORES.schedules, { keyPath: 'id' });
            if (!db.objectStoreNames.contains(STORES.equipment))
                db.createObjectStore(STORES.equipment, { keyPath: 'node_id' });
            if (!db.objectStoreNames.contains(STORES.pendingCaptures))
                db.createObjectStore(STORES.pendingCaptures, { keyPath: 'local_id', autoIncrement: true });
            if (!db.objectStoreNames.contains(STORES.cache))
                db.createObjectStore(STORES.cache, { keyPath: 'url' });
            if (!db.objectStoreNames.contains(STORES.pendingMutations))
                db.createObjectStore(STORES.pendingMutations, { keyPath: 'id', autoIncrement: true });
            if (!db.objectStoreNames.contains(STORES.failedMutations))
                db.createObjectStore(STORES.failedMutations, { keyPath: 'id', autoIncrement: true });
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function tx(storeName, mode, fn) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);
        const result = fn(store);
        transaction.oncomplete = () => resolve(result);
        transaction.onerror = () => reject(transaction.error);
    });
}

// ── Generic CRUD ──

export async function putItems(storeName, items) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        items.forEach(item => store.put(item));
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
}

export async function getAll(storeName) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

export async function getItem(storeName, key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

export async function deleteItem(storeName, key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        store.delete(key);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
}

export async function clearStore(storeName) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        store.clear();
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
}

// ── Specialized functions ──

/** Cache work orders for offline field access */
export async function cacheWorkOrders(orders) {
    return putItems(STORES.workOrders, orders.map(o => ({
        ...o,
        request_id: o.request_id || o.work_request_id || o.id,
        _cached_at: Date.now(),
    })));
}

/** Get cached work orders */
export async function getCachedWorkOrders() {
    return getAll(STORES.workOrders);
}

/** Cache equipment hierarchy for offline reference */
export async function cacheEquipment(nodes) {
    return putItems(STORES.equipment, nodes.map(n => ({
        ...n,
        _cached_at: Date.now(),
    })));
}

/** Get cached equipment */
export async function getCachedEquipment() {
    return getAll(STORES.equipment);
}

/** Store a capture made offline — will sync when online */
export async function storePendingCapture(capture) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.pendingCaptures, 'readwrite');
        const store = transaction.objectStore(STORES.pendingCaptures);
        const req = store.add({ ...capture, _created_at: Date.now() });
        req.onsuccess = () => resolve(req.result);
        transaction.onerror = () => reject(transaction.error);
    });
}

/** Get all pending captures that need syncing */
export async function getPendingCaptures() {
    return getAll(STORES.pendingCaptures);
}

/** Remove a pending capture after successful sync */
export async function removePendingCapture(localId) {
    return deleteItem(STORES.pendingCaptures, localId);
}

/** Cache API response for offline fallback */
export async function cacheApiResponse(url, data) {
    return putItems(STORES.cache, [{ url, data, _cached_at: Date.now() }]);
}

/** Get cached API response */
export async function getCachedApiResponse(url) {
    const item = await getItem(STORES.cache, url);
    if (!item) return null;
    // Expire after 24h
    if (Date.now() - item._cached_at > 24 * 60 * 60 * 1000) return null;
    return item.data;
}

/** Sync pending captures to server */
export async function syncPendingCaptures(submitFn) {
    const pending = await getPendingCaptures();
    const results = [];
    for (const capture of pending) {
        try {
            const res = await submitFn(capture);
            await removePendingCapture(capture.local_id);
            results.push({ success: true, capture, result: res });
        } catch (e) {
            results.push({ success: false, capture, error: e.message });
        }
    }
    return results;
}

/** Check if we're online */
export function isOnline() {
    return navigator.onLine;
}

// ── Pending mutations queue (generic POST/PUT/DELETE) ──────────────────────

/** Enqueue a mutation to be replayed when connectivity returns. */
export async function enqueueMutation(entry) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.pendingMutations, 'readwrite');
        const store = transaction.objectStore(STORES.pendingMutations);
        const req = store.add({ ...entry, _created_at: Date.now(), attempts: 0 });
        req.onsuccess = () => resolve(req.result);
        transaction.onerror = () => reject(transaction.error);
    });
}

/** List pending mutations in insertion order (FIFO via auto-increment id). */
export async function listPendingMutations() {
    const all = await getAll(STORES.pendingMutations);
    return all.sort((a, b) => (a.id || 0) - (b.id || 0));
}

/** Count pending mutations (cheap). */
export async function countPendingMutations() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.pendingMutations, 'readonly');
        const store = transaction.objectStore(STORES.pendingMutations);
        const req = store.count();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

/** Remove a pending mutation after successful sync. */
export async function removePendingMutation(id) {
    return deleteItem(STORES.pendingMutations, id);
}

/** Move a pending mutation to the failed bucket (conflict or permanent server error). */
export async function moveToFailed(mutation, errorInfo) {
    await enqueueFailed({ ...mutation, error: errorInfo, _failed_at: Date.now() });
    await removePendingMutation(mutation.id);
}

async function enqueueFailed(entry) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.failedMutations, 'readwrite');
        const store = transaction.objectStore(STORES.failedMutations);
        // Remove the incoming id so IndexedDB auto-generates a new one in the failed store
        const { id, ...rest } = entry;
        const req = store.add(rest);
        req.onsuccess = () => resolve(req.result);
        transaction.onerror = () => reject(transaction.error);
    });
}

/** List failed mutations (for UI review). */
export async function listFailedMutations() {
    return getAll(STORES.failedMutations);
}

/** Discard a failed mutation (user acknowledged). */
export async function discardFailedMutation(id) {
    return deleteItem(STORES.failedMutations, id);
}

/** Increment retry counter for a pending mutation (transient error, will retry later). */
export async function bumpAttempts(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.pendingMutations, 'readwrite');
        const store = transaction.objectStore(STORES.pendingMutations);
        const getReq = store.get(id);
        getReq.onsuccess = () => {
            const item = getReq.result;
            if (!item) { resolve(null); return; }
            item.attempts = (item.attempts || 0) + 1;
            item._last_attempt_at = Date.now();
            store.put(item);
        };
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
}

export { STORES };
