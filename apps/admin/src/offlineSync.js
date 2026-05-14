/**
 * Offline sync: drains the pending_mutations queue back to the server when
 * connectivity returns. Exposes events for the UI indicator.
 *
 * The drainer is conservative:
 *   - Runs FIFO (preserve user's chronological actions).
 *   - On 4xx (except 408/429) → the server rejected permanently (e.g. conflict
 *     because status already advanced). Move to failed_mutations for review.
 *   - On 5xx, network error, 408, 429 → transient, leave in queue and bump
 *     attempt counter; will retry next sync trigger.
 *   - Stops the batch after 3 consecutive transient failures to avoid hammering.
 */

import {
  listPendingMutations,
  removePendingMutation,
  moveToFailed,
  bumpAttempts,
  countPendingMutations,
} from './offlineStore';
import { offlineEvents } from './api';

const BASE = '/api/v1';

function authHeaders() {
  const token = localStorage.getItem('access_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const apiKey = localStorage.getItem('api_key');
  if (apiKey) headers['X-API-Key'] = apiKey;
  return headers;
}

let syncing = false;
let scheduled = false;

function emit(type, detail) {
  offlineEvents.dispatchEvent(new CustomEvent(type, { detail }));
}

async function sendMutation(m) {
  const url = new URL(`${BASE}${m.path}`, window.location.origin);
  if (m.params) Object.entries(m.params).forEach(([k, v]) => { if (v != null) url.searchParams.set(k, v); });
  const opts = { method: m.method, headers: authHeaders() };
  if (m.data !== undefined && m.data !== null && m.method !== 'GET') {
    opts.body = JSON.stringify(m.data);
  }
  const res = await fetch(url, opts);
  return res;
}

/** Drain the queue once. Safe to call multiple times — reentrant-guarded. */
export async function drainPendingMutations() {
  if (syncing) return { skipped: true };
  if (!navigator.onLine) return { offline: true };
  syncing = true;
  emit('sync-start', {});
  const summary = { ok: 0, failed: 0, deferred: 0 };
  let consecutiveTransient = 0;
  try {
    const queue = await listPendingMutations();
    for (const m of queue) {
      if (!navigator.onLine) { summary.deferred += (queue.length - summary.ok - summary.failed); break; }
      if (consecutiveTransient >= 3) { summary.deferred++; continue; }
      try {
        const res = await sendMutation(m);
        if (res.ok) {
          await removePendingMutation(m.id);
          summary.ok++;
          consecutiveTransient = 0;
          emit('sync-item-ok', { mutation: m });
        } else if (res.status >= 400 && res.status < 500 && ![408, 429].includes(res.status)) {
          // Permanent client error — conflict or validation. Don't retry.
          let detail = '';
          try { detail = (await res.json()).detail || ''; } catch {}
          await moveToFailed(m, { status: res.status, detail });
          summary.failed++;
          consecutiveTransient = 0;
          emit('sync-item-failed', { mutation: m, status: res.status, detail });
        } else {
          // Transient (5xx, 408, 429). Bump attempts, keep in queue.
          await bumpAttempts(m.id);
          summary.deferred++;
          consecutiveTransient++;
        }
      } catch (networkErr) {
        await bumpAttempts(m.id);
        summary.deferred++;
        consecutiveTransient++;
      }
    }
  } finally {
    syncing = false;
    emit('sync-end', summary);
  }
  return summary;
}

/** Debounced/scheduled drain — collapses bursts of "online" events. */
export function scheduleDrain(delayMs = 500) {
  if (scheduled) return;
  scheduled = true;
  setTimeout(() => {
    scheduled = false;
    drainPendingMutations();
  }, delayMs);
}

/** Install listeners and kick off an initial drain. Idempotent. */
let installed = false;
export function installOfflineSync() {
  if (installed) return;
  installed = true;
  window.addEventListener('online', () => scheduleDrain(500));
  // Backup: also drain every 60s when online and queue is non-empty.
  setInterval(async () => {
    if (!navigator.onLine) return;
    const n = await countPendingMutations().catch(() => 0);
    if (n > 0) scheduleDrain(0);
  }, 60_000);
  // If we booted with connectivity and a queue, sync now.
  if (navigator.onLine) {
    countPendingMutations().then(n => { if (n > 0) scheduleDrain(200); });
  }
}
