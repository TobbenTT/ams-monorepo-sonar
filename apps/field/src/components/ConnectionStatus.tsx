/**
 * ConnectionStatus.tsx — Online/offline indicator with pending sync badge.
 */
import { useState, useEffect } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { syncQueue } from '../sync/sync-queue';

function ConnectionStatus() {
  const { isOnline } = useOnlineStatus();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      const count = await syncQueue.getPendingCount();
      if (!cancelled) setPendingCount(count);
    };

    refresh();
    // Poll every 5 seconds to keep badge fresh
    const interval = setInterval(refresh, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex items-center gap-2 text-sm">
      <span
        className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${
          isOnline ? 'bg-green-400' : 'bg-red-400'
        }`}
      />
      <span className="font-medium">
        {isOnline ? 'En ligne' : 'Hors ligne'}
      </span>
      {pendingCount > 0 && (
        <span className="bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full px-1.5 py-0.5 leading-none">
          {pendingCount}
        </span>
      )}
    </div>
  );
}

export default ConnectionStatus;
