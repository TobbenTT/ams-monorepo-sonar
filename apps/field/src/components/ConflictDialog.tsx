/**
 * ConflictDialog.tsx — Conflict resolution modal.
 * Displays when captures have syncStatus='conflict' (returned by server during push).
 * Allows the user to choose "Keep Mine" (LOCAL_WINS) or "Use Server" (SERVER_WINS).
 */
import { useState, useEffect, useCallback } from 'react';
import { db } from '../db/local-db';
import type { CaptureRecord } from '../db/local-db';
import { syncManager } from '../sync/sync-manager';

function ConflictDialog({ isOnline }: { isOnline: boolean }) {
  const [conflicts, setConflicts] = useState<CaptureRecord[]>([]);
  const [resolving, setResolving] = useState<string | null>(null);

  const loadConflicts = useCallback(async () => {
    const items = await db.captures.where('syncStatus').equals('conflict').toArray();
    setConflicts(items);
  }, []);

  useEffect(() => {
    void loadConflicts();
    const interval = setInterval(() => void loadConflicts(), 5000);
    return () => clearInterval(interval);
  }, [loadConflicts]);

  const handleResolve = async (
    capture: CaptureRecord,
    strategy: 'LOCAL_WINS' | 'SERVER_WINS',
  ) => {
    if (!capture.conflictId || !isOnline) return;
    setResolving(capture.localId);
    try {
      await syncManager.resolveConflict(capture.conflictId, strategy);
      await loadConflicts();
    } finally {
      setResolving(null);
    }
  };

  if (conflicts.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex items-center gap-3 bg-yellow-50">
          <span className="text-2xl" aria-hidden="true">
            ⚠️
          </span>
          <div>
            <h2 className="font-semibold text-gray-900 text-sm">
              Conflit de synchronisation
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {conflicts.length} capture{conflicts.length > 1 ? 's' : ''} en conflit
            </p>
          </div>
        </div>

        {/* Conflict list */}
        <div className="max-h-80 overflow-y-auto divide-y">
          {conflicts.map((c) => (
            <div key={c.localId} className="p-4 space-y-3">
              {/* Context */}
              <div>
                <div className="text-sm font-semibold text-gray-800">{c.equipmentTag}</div>
                {c.locationHint && (
                  <div className="text-xs text-gray-500 mt-0.5">{c.locationHint}</div>
                )}
                <div className="text-xs text-gray-400 mt-0.5">
                  Créé: {new Date(c.createdAt).toLocaleTimeString('fr-FR')}
                </div>
              </div>

              {/* Side-by-side comparison */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                  <div className="font-semibold text-blue-700 mb-1">Votre version</div>
                  <div className="text-gray-700 line-clamp-3">{c.rawText}</div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
                  <div className="font-semibold text-orange-700 mb-1">Serveur</div>
                  <div className="text-gray-500 italic">
                    Modifié depuis votre dernière synchronisation
                  </div>
                </div>
              </div>

              {/* Resolution buttons */}
              {isOnline ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => void handleResolve(c, 'LOCAL_WINS')}
                    disabled={resolving === c.localId}
                    className="flex-1 bg-blue-600 text-white text-xs font-semibold py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 active:scale-95 transition-all"
                  >
                    Garder la mienne
                  </button>
                  <button
                    onClick={() => void handleResolve(c, 'SERVER_WINS')}
                    disabled={resolving === c.localId}
                    className="flex-1 bg-gray-100 text-gray-700 text-xs font-semibold py-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 active:scale-95 transition-all"
                  >
                    Utiliser serveur
                  </button>
                </div>
              ) : (
                <div className="text-xs text-gray-400 italic text-center py-1">
                  Reconnectez-vous pour résoudre ce conflit
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ConflictDialog;
