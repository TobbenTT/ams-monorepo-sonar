/**
 * FieldCapture.tsx — Offline-first field capture with 3-step wizard.
 * Supports TEXT, VOICE (microphone), and IMAGE (camera) capture modes.
 * Data is saved to IndexedDB immediately; media is processed on reconnect.
 */
import { useState, useEffect, useCallback } from 'react';
import { syncQueue } from '../sync/sync-queue';
import { syncManager } from '../sync/sync-manager';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { getStoredLanguage } from '../i18n';
import { t } from '../i18n';
import type { CaptureRecord } from '../db/local-db';
import CaptureWizard from '../components/capture/CaptureWizard';
import type { IdentifyData } from '../components/capture/StepIdentify';
import type { CaptureData } from '../components/capture/StepCapture';

// ─── Status Badge ─────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: CaptureRecord['syncStatus'] }) {
  const styles: Record<CaptureRecord['syncStatus'], string> = {
    pending: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
    synced: 'bg-green-100 text-green-800 border border-green-300',
    conflict: 'bg-red-100 text-red-800 border border-red-300',
  };
  const labels: Record<CaptureRecord['syncStatus'], string> = {
    pending: '⏳',
    synced: '✓',
    conflict: '⚠',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

// ─── Capture Type Icon ────────────────────────────────────────────────────

function CaptureIcon({ type }: { type: string }) {
  if (type === 'VOICE') return <span className="text-sm" title="Voice">&#127908;</span>;
  if (type === 'IMAGE') return <span className="text-sm" title="Image">&#128247;</span>;
  return <span className="text-sm" title="Text">&#128221;</span>;
}

// ─── Recent Captures List ─────────────────────────────────────────────────

function RecentCaptures({
  captures,
  pendingCount,
  lang,
}: {
  captures: CaptureRecord[];
  pendingCount: number;
  lang: ReturnType<typeof getStoredLanguage>;
}) {
  if (captures.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">
        {t('capture.recent', lang)}
        {pendingCount > 0 && (
          <span className="ml-2 bg-yellow-500 text-white text-xs rounded-full px-2 py-0.5">
            {t('status.pending', lang, { count: pendingCount })}
          </span>
        )}
      </h3>
      <ul className="space-y-2">
        {captures.map((c) => (
          <li
            key={c.localId}
            className="bg-white rounded-lg border border-gray-200 px-3 py-2 flex items-start justify-between gap-2"
          >
            <div className="min-w-0 flex items-start gap-2">
              <CaptureIcon type={c.captureType} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {c.equipmentTag || '—'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {c.rawText || (c.captureType === 'VOICE' ? '🎤' : c.captureType === 'IMAGE' ? '📷' : '—')}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-gray-400">
                    {new Date(c.createdAt).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  {c.mediaProcessingStatus && c.mediaProcessingStatus !== 'complete' && (
                    <span className="text-[10px] text-orange-600">
                      {t(`capture.media.${c.mediaProcessingStatus}`, lang)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <StatusBadge status={c.syncStatus} />
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────

export default function FieldCapture() {
  const { isOnline } = useOnlineStatus();
  const [recentCaptures, setRecentCaptures] = useState<CaptureRecord[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [successMsg, setSuccessMsg] = useState('');
  const [syncing, setSyncing] = useState(false);
  const lang = getStoredLanguage();

  const refreshList = useCallback(async () => {
    const recent = await syncQueue.getRecent(8);
    const pending = await syncQueue.getPendingCount();
    setRecentCaptures(recent);
    setPendingCount(pending);
  }, []);

  useEffect(() => {
    refreshList();
    if (isOnline) {
      syncManager.pullEquipmentHierarchy().catch(console.error);
    }
  }, [isOnline, refreshList]);

  // Auto-sync when going online
  useEffect(() => {
    if (isOnline && pendingCount > 0) {
      handleSync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  const handleSync = async () => {
    if (!isOnline || syncing) return;
    setSyncing(true);
    try {
      await syncManager.syncAll();
      await refreshList();
    } catch (err) {
      console.error('Sync error:', err);
    } finally {
      setSyncing(false);
    }
  };

  const handleWizardSubmit = async (identify: IdentifyData, capture: CaptureData) => {
    setSuccessMsg('');
    await syncQueue.enqueue({
      technicianId: identify.technicianId.trim(),
      captureType: identify.captureType,
      language: identify.language,
      equipmentTag: identify.equipmentTag,
      locationHint: identify.locationHint.trim(),
      rawText: capture.rawText.trim(),
      audioBlob: capture.audioBlob ?? undefined,
      imageBlob: capture.imageBlob ?? undefined,
      imageThumbnail: capture.imageThumbnail ?? undefined,
      gpsLat: identify.gpsLat,
      gpsLon: identify.gpsLon,
      gpsAccuracy: identify.gpsAccuracy,
    });

    setSuccessMsg(
      isOnline
        ? t('capture.submit_online', lang)
        : t('capture.submit_offline', lang),
    );
    await refreshList();

    if (isOnline) handleSync();

    // Auto-dismiss success
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Status bar */}
      <div
        className={`text-xs font-medium px-3 py-2 rounded-md flex items-center justify-between ${
          isOnline
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-orange-50 text-orange-800 border border-orange-200'
        }`}
      >
        <span>{isOnline ? t('status.online', lang) : t('status.offline', lang)}</span>
        {isOnline && pendingCount > 0 && (
          <button
            onClick={handleSync}
            disabled={syncing}
            className="text-xs bg-green-700 text-white px-2 py-0.5 rounded active:scale-95 transition-all disabled:opacity-50"
          >
            {syncing ? t('status.syncing', lang) : t('status.sync_now', lang)}
          </button>
        )}
      </div>

      {/* Success */}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded-md">
          {successMsg}
        </div>
      )}

      {/* Wizard */}
      <CaptureWizard onSubmit={handleWizardSubmit} lang={lang} />

      {/* Recent list */}
      <RecentCaptures captures={recentCaptures} pendingCount={pendingCount} lang={lang} />
    </div>
  );
}
