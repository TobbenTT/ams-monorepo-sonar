import { useEffect } from 'react';
import { useToast } from './Toast';
import { offlineEvents } from '../api';

/**
 * Listens to the offline sync event bus and surfaces notifications so the user
 * knows what happened when the queue drains (success count, conflicts, etc.).
 * Mount once at App level.
 */
export default function OfflineSyncToasts() {
    const toast = useToast();

    useEffect(() => {
        const onQueued = () => {
            toast.info('Sin conexión — acción guardada para sincronizar');
        };
        const onSyncEnd = (e) => {
            const s = e.detail || {};
            if (s.ok > 0 && s.failed === 0) {
                toast.success(`✓ ${s.ok} acción${s.ok > 1 ? 'es' : ''} sincronizada${s.ok > 1 ? 's' : ''}`);
            } else if (s.ok > 0 && s.failed > 0) {
                toast.info(`${s.ok} sincronizadas · ${s.failed} con conflicto`);
            }
            // s.ok === 0 and s.failed === 0 → silent (nothing to report)
        };
        const onItemFailed = (e) => {
            const m = e.detail?.mutation;
            const status = e.detail?.status;
            const detail = e.detail?.detail || '';
            const pathShort = (m?.path || '').split('/').slice(-2).join('/');
            toast.error(`Conflicto ${status} en ${pathShort}${detail ? ': ' + String(detail).slice(0, 80) : ''}`);
        };

        offlineEvents.addEventListener('queued', onQueued);
        offlineEvents.addEventListener('sync-end', onSyncEnd);
        offlineEvents.addEventListener('sync-item-failed', onItemFailed);
        return () => {
            offlineEvents.removeEventListener('queued', onQueued);
            offlineEvents.removeEventListener('sync-end', onSyncEnd);
            offlineEvents.removeEventListener('sync-item-failed', onItemFailed);
        };
    }, [toast]);

    return null;
}
