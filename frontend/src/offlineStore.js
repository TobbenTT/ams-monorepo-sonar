/**
 * Offline storage using IndexedDB — caches critical data for field use.
 * Stores: work orders, schedules, equipment hierarchy, pending captures.
 * Syncs back to server when connectivity returns.
 */

const DB_NAME = 'ocp-offline';
const DB_VERSION = 1;

const STORES = {
    workOrders: 'work_orders',
    schedules: 'schedules',
    equipment: 'equipment',
    pendingCaptures: 'pending_captures',
    cache: 'api_cache',
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

export { STORES };
