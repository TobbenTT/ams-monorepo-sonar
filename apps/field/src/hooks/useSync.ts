/**
 * useSync.ts — Auto-sync hook.
 * Triggers syncAll() on app open (if online), on reconnect, and every 5 minutes.
 * Also listens for service worker SYNC_REQUESTED messages (background sync).
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { syncManager } from '../sync/sync-manager';
import type { SyncReport } from '../sync/sync-manager';

const PERIODIC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export function useSync(isOnline: boolean): {
  isSyncing: boolean;
  lastReport: SyncReport | null;
  triggerSync: () => Promise<void>;
} {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastReport, setLastReport] = useState<SyncReport | null>(null);

  // Ref to prevent concurrent syncs without adding isSyncing to triggerSync deps
  const isSyncingRef = useRef(false);
  // Track previous online state to detect reconnect events
  const wasOnlineRef = useRef(isOnline);

  const triggerSync = useCallback(async () => {
    if (!isOnline || isSyncingRef.current) return;
    isSyncingRef.current = true;
    setIsSyncing(true);
    try {
      const report = await syncManager.syncAll();
      setLastReport(report);
    } catch {
      // Network failure — will retry next cycle
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
    }
  }, [isOnline]);

  // ── On mount: sync once after DB initializes (1s delay) ──────────────────
  useEffect(() => {
    if (!isOnline) return;
    const timer = setTimeout(() => {
      void triggerSync();
    }, 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run once on mount

  // ── On reconnect: trigger sync immediately ────────────────────────────────
  useEffect(() => {
    const wasOnline = wasOnlineRef.current;
    wasOnlineRef.current = isOnline;
    if (!wasOnline && isOnline) {
      void triggerSync();
    }
  }, [isOnline, triggerSync]);

  // ── Periodic sync every 5 minutes while online ────────────────────────────
  useEffect(() => {
    if (!isOnline) return;
    const interval = setInterval(() => {
      void triggerSync();
    }, PERIODIC_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isOnline, triggerSync]);

  // ── Service worker message: 'SYNC_REQUESTED' (background sync) ───────────
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const handler = (event: MessageEvent<{ type: string }>) => {
      if (event.data?.type === 'SYNC_REQUESTED' && isOnline) {
        void triggerSync();
      }
    };
    navigator.serviceWorker.addEventListener('message', handler);
    return () => navigator.serviceWorker.removeEventListener('message', handler);
  }, [isOnline, triggerSync]);

  return { isSyncing, lastReport, triggerSync };
}
