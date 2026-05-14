import { useOfflineStatus } from '../hooks/useOfflineStatus';
import { WifiOff, CloudUpload, CheckCircle } from 'lucide-react';
import { drainPendingMutations } from '../offlineSync';

/**
 * Status chip shown in mobile header/bottom nav.
 *   - Offline: red · "Offline · N pendientes" (tapable to view queue — not implemented yet)
 *   - Online + pending: amber · "Sincronizando N" (auto-drains)
 *   - Online + zero pending: hidden (no noise)
 */
export function OfflineIndicator({ className = '' }) {
    const { online, pending, syncing } = useOfflineStatus();

    if (online && pending === 0 && !syncing) return null;

    if (!online) {
        return (
            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-100 text-red-700 border border-red-300 text-[11px] font-semibold ${className}`}>
                <WifiOff size={12} />
                Offline
                {pending > 0 && <span className="bg-red-600 text-white rounded-full px-1.5 py-[1px] text-[10px] font-bold">{pending}</span>}
            </div>
        );
    }

    if (syncing || pending > 0) {
        return (
            <button
                type="button"
                onClick={() => drainPendingMutations()}
                title="Sincronizar pendientes"
                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-300 text-[11px] font-semibold ${className}`}>
                <CloudUpload size={12} className={syncing ? 'animate-pulse' : ''} />
                {syncing ? 'Sincronizando' : `Sincronizar ${pending}`}
            </button>
        );
    }

    return null;
}

export default OfflineIndicator;
