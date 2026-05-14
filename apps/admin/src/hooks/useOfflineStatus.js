import { useEffect, useState } from 'react';
import { countPendingMutations } from '../offlineStore';
import { offlineEvents } from '../api';

/**
 * Track online/offline state + pending mutation count.
 * Subscribes to 'online'/'offline' window events and the offline event bus.
 */
export function useOfflineStatus() {
    const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
    const [pending, setPending] = useState(0);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const refreshCount = async () => {
            try {
                const n = await countPendingMutations();
                if (!cancelled) setPending(n);
            } catch { /* ignore */ }
        };

        const onOnline = () => { setOnline(true); refreshCount(); };
        const onOffline = () => { setOnline(false); refreshCount(); };
        const onQueued = () => refreshCount();
        const onSyncStart = () => { setSyncing(true); };
        const onSyncEnd = () => { setSyncing(false); refreshCount(); };
        const onItemOk = () => refreshCount();
        const onItemFailed = () => refreshCount();

        window.addEventListener('online', onOnline);
        window.addEventListener('offline', onOffline);
        offlineEvents.addEventListener('queued', onQueued);
        offlineEvents.addEventListener('sync-start', onSyncStart);
        offlineEvents.addEventListener('sync-end', onSyncEnd);
        offlineEvents.addEventListener('sync-item-ok', onItemOk);
        offlineEvents.addEventListener('sync-item-failed', onItemFailed);

        refreshCount();

        return () => {
            cancelled = true;
            window.removeEventListener('online', onOnline);
            window.removeEventListener('offline', onOffline);
            offlineEvents.removeEventListener('queued', onQueued);
            offlineEvents.removeEventListener('sync-start', onSyncStart);
            offlineEvents.removeEventListener('sync-end', onSyncEnd);
            offlineEvents.removeEventListener('sync-item-ok', onItemOk);
            offlineEvents.removeEventListener('sync-item-failed', onItemFailed);
        };
    }, []);

    return { online, pending, syncing };
}
