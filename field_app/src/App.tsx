/**
 * App.tsx — Root layout: header, nav, sync orchestration, conflict dialog.
 * Auto-syncs on mount/reconnect/periodic. Shows toast after sync. Handles SW messages.
 */
import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import ConnectionStatus from './components/ConnectionStatus';
import ConflictDialog from './components/ConflictDialog';
import FieldCapture from './pages/FieldCapture';
import WorkProgram from './pages/WorkProgram';
import Checklist from './pages/Checklist';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { useSync } from './hooks/useSync';
import type { SyncReport } from './sync/sync-manager';

// ─── SyncToast ─────────────────────────────────────────────────────────────

function SyncToast({
  report,
  onDismiss,
}: {
  report: SyncReport;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const hasErrors = report.errors.length > 0;
  const parts = [
    report.pushed > 0 ? `${report.pushed} envoyé(s)` : null,
    report.pulled > 0 ? `${report.pulled} reçu(s)` : null,
    report.conflicts > 0 ? `${report.conflicts} conflit(s)` : null,
  ].filter(Boolean);
  const summary = parts.length > 0 ? parts.join(', ') : 'à jour';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-16 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-full text-xs font-semibold shadow-lg text-white pointer-events-none ${
        hasErrors ? 'bg-red-500' : 'bg-green-600'
      }`}
    >
      {hasErrors ? `⚠ ${report.errors[0]}` : `✓ Sync: ${summary}`}
    </div>
  );
}

// ─── App ───────────────────────────────────────────────────────────────────

function App() {
  const { isOnline } = useOnlineStatus();
  const { isSyncing, lastReport, triggerSync } = useSync(isOnline);
  const [toastReport, setToastReport] = useState<SyncReport | null>(null);

  // Show toast whenever a new report arrives (only if something happened)
  useEffect(() => {
    if (lastReport) setToastReport(lastReport);
  }, [lastReport]);

  const dismissToast = useCallback(() => setToastReport(null), []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Sync result toast — auto-dismisses after 4 s */}
      {toastReport && <SyncToast report={toastReport} onDismiss={dismissToast} />}

      {/* Conflict resolution modal */}
      <ConflictDialog isOnline={isOnline} />

      {/* Header */}
      <header className="bg-ocp-green text-white px-4 py-3 flex items-center justify-between shadow-md">
        <h1 className="text-lg font-bold tracking-tight">AMS Field</h1>
        <div className="flex items-center gap-3">
          {/* Manual sync button */}
          {isOnline && (
            <button
              onClick={() => void triggerSync()}
              disabled={isSyncing}
              aria-label={isSyncing ? 'Synchronisation…' : 'Synchroniser maintenant'}
              title={isSyncing ? 'Synchronisation…' : 'Synchroniser'}
              className="text-white/80 hover:text-white disabled:opacity-40 transition-colors text-lg leading-none"
            >
              <span
                className={isSyncing ? 'inline-block animate-spin' : 'inline-block'}
                style={{ display: 'inline-block' }}
              >
                ↻
              </span>
            </button>
          )}
          <ConnectionStatus />
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-2 py-1 flex gap-1">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive ? 'bg-ocp-green text-white' : 'text-gray-600 hover:bg-gray-100'
            }`
          }
        >
          Capture
        </NavLink>
        <NavLink
          to="/program"
          className={({ isActive }) =>
            `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive ? 'bg-ocp-green text-white' : 'text-gray-600 hover:bg-gray-100'
            }`
          }
        >
          Programme
        </NavLink>
        <NavLink
          to="/checklist"
          className={({ isActive }) =>
            `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive ? 'bg-ocp-green text-white' : 'text-gray-600 hover:bg-gray-100'
            }`
          }
        >
          Checklist
        </NavLink>
      </nav>

      {/* Main content */}
      <main className="flex-1 p-4">
        <Routes>
          <Route path="/" element={<FieldCapture />} />
          <Route path="/program" element={<WorkProgram />} />
          <Route path="/checklist" element={<Checklist />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 text-center text-xs text-gray-500 py-2 border-t">
        AMS Field v0.2.0 — Offline-first
      </footer>
    </div>
  );
}

export default App;
