/**
 * WorkProgram.tsx — Offline-cached daily work order viewer.
 * Supervisors can see their work schedule even without connectivity.
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db/local-db';
import type { WorkOrderCache } from '../db/local-db';
import { syncManager } from '../sync/sync-manager';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

// ─── Priority config ───────────────────────────────────────────────────────

const PRIORITY_CONFIG: Record<string, { label: string; border: string; badge: string }> = {
  URGENT: {
    label: '🔴 URGENT',
    border: 'border-l-4 border-red-400 bg-red-50',
    badge: 'bg-red-100 text-red-700',
  },
  PLANNED: {
    label: '🟡 PLANIFIÉ',
    border: 'border-l-4 border-yellow-400 bg-yellow-50',
    badge: 'bg-yellow-100 text-yellow-700',
  },
  DEFERRED: {
    label: '🔵 DIFFÉRÉ',
    border: 'border-l-4 border-blue-400 bg-blue-50',
    badge: 'bg-blue-100 text-blue-700',
  },
};

const PRIORITY_ORDER = ['URGENT', 'PLANNED', 'DEFERRED'];

const ORDER_TYPE_LABELS: Record<string, string> = {
  PREVENTIVE: 'PM',
  CORRECTIVE: 'CM',
  PREDICTIVE: 'PdM',
};

// ─── Helpers ───────────────────────────────────────────────────────────────

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatDateFr(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

// ─── WorkOrderCard ─────────────────────────────────────────────────────────

function WorkOrderCard({
  order,
  onStartChecklist,
}: {
  order: WorkOrderCache;
  onStartChecklist: (id: string) => void;
}) {
  const cfg = PRIORITY_CONFIG[order.priority] ?? PRIORITY_CONFIG.PLANNED;
  const typeLabel = ORDER_TYPE_LABELS[order.orderType] ?? order.orderType;

  return (
    <div className={`rounded-lg p-4 shadow-sm ${cfg.border}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${cfg.badge}`}>
              {typeLabel}
            </span>
            <span className="text-sm font-semibold text-gray-900">{order.equipmentTag}</span>
          </div>
          <p className="text-sm text-gray-800 line-clamp-2">
            {order.descriptionFr || order.description}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
            <span>⏱ {order.estimatedHours}h</span>
            {order.assignedTo && order.assignedTo !== '—' && (
              <span>👤 {order.assignedTo}</span>
            )}
            {order.equipmentName && order.equipmentName !== order.equipmentTag && (
              <span>🏭 {order.equipmentName}</span>
            )}
          </div>
          {order.materials.length > 0 && (
            <div className="mt-1.5 text-xs text-gray-600">
              📦{' '}
              {order.materials.slice(0, 3).join(', ')}
              {order.materials.length > 3 && (
                <span className="text-gray-400"> +{order.materials.length - 3}</span>
              )}
            </div>
          )}
        </div>
        <button
          onClick={() => onStartChecklist(order.orderId)}
          className="flex-shrink-0 bg-ocp-green text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-green-800 active:scale-95 transition-all"
        >
          Checklist →
        </button>
      </div>
    </div>
  );
}

// ─── WorkProgram page ──────────────────────────────────────────────────────

function WorkProgram() {
  const navigate = useNavigate();
  const { isOnline } = useOnlineStatus();
  const [selectedDate, setSelectedDate] = useState(toDateString(new Date()));
  const [workOrders, setWorkOrders] = useState<WorkOrderCache[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  const loadOrders = useCallback(async (dateStr: string) => {
    const orders = await db.workOrders.where('scheduledDate').equals(dateStr).toArray();
    setWorkOrders(orders);
  }, []);

  useEffect(() => {
    loadOrders(selectedDate);
  }, [selectedDate, loadOrders]);

  // Pull from server and refresh local view
  const handleSync = useCallback(async () => {
    if (!isOnline) return;
    setIsSyncing(true);
    try {
      await syncManager.pullWorkOrders(selectedDate);
      await loadOrders(selectedDate);
      setLastSynced(new Date().toLocaleTimeString('fr-FR'));

      // If server had nothing, seed demo data so the UI is not empty
      const fresh = await db.workOrders.where('scheduledDate').equals(selectedDate).count();
      if (fresh === 0) {
        await seedDemoOrders(selectedDate);
        await loadOrders(selectedDate);
      }
    } catch {
      // Network error — stay offline
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, selectedDate, loadOrders]);

  // Load from cache on mount; seed demo data if cache is empty
  useEffect(() => {
    (async () => {
      const count = await db.workOrders.count();
      if (count === 0) {
        await seedDemoOrders(selectedDate);
        await loadOrders(selectedDate);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigateDay = (delta: number) => {
    const date = new Date(selectedDate + 'T00:00:00');
    date.setDate(date.getDate() + delta);
    setSelectedDate(toDateString(date));
  };

  const isToday = selectedDate === toDateString(new Date());

  // Group by priority
  const grouped: Record<string, WorkOrderCache[]> = {};
  for (const o of workOrders) {
    const p = o.priority || 'PLANNED';
    if (!grouped[p]) grouped[p] = [];
    grouped[p].push(o);
  }
  const totalHours = workOrders.reduce((s, o) => s + (o.estimatedHours || 0), 0);

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Date navigation */}
      <div className="flex items-center justify-between bg-white rounded-lg shadow px-4 py-3">
        <button
          onClick={() => navigateDay(-1)}
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Jour précédent"
        >
          ◀
        </button>
        <div className="text-center">
          <div className="text-sm font-semibold text-gray-900 capitalize">
            {formatDateFr(selectedDate)}
          </div>
          {!isToday && (
            <button
              onClick={() => setSelectedDate(toDateString(new Date()))}
              className="text-xs text-ocp-green underline mt-0.5"
            >
              Aujourd'hui
            </button>
          )}
        </div>
        <button
          onClick={() => navigateDay(1)}
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Jour suivant"
        >
          ▶
        </button>
      </div>

      {/* Sync bar */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">
          {lastSynced ? `Dernière synchro: ${lastSynced}` : 'Cache local'}
        </span>
        {isOnline && (
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-lg hover:bg-blue-100 disabled:opacity-50 transition-colors"
          >
            {isSyncing ? '↻ Synchronisation…' : '↻ Synchroniser'}
          </button>
        )}
      </div>

      {/* Empty state */}
      {workOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-10 text-center text-gray-400">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-sm">
            {isOnline
              ? 'Aucun ordre pour cette date. Appuyez sur Synchroniser.'
              : 'Aucune donnée en cache pour cette date.'}
          </p>
        </div>
      ) : (
        <>
          {/* Grouped work orders */}
          {PRIORITY_ORDER.map((priority) => {
            const orders = grouped[priority];
            if (!orders || orders.length === 0) return null;
            return (
              <div key={priority} className="space-y-2">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">
                  {PRIORITY_CONFIG[priority]?.label ?? priority}
                </h3>
                {orders.map((order) => (
                  <WorkOrderCard
                    key={order.orderId}
                    order={order}
                    onStartChecklist={(id) => navigate(`/checklist?orderId=${id}`)}
                  />
                ))}
              </div>
            );
          })}

          {/* Summary bar */}
          <div className="bg-gray-100 rounded-lg p-3 text-xs text-gray-600 flex flex-wrap gap-4 border border-gray-200">
            <span>📋 {workOrders.length} ordre{workOrders.length > 1 ? 's' : ''}</span>
            <span>⏱ {totalHours}h total</span>
            {(grouped.URGENT?.length ?? 0) > 0 && (
              <span className="text-red-600 font-semibold">
                🔴 {grouped.URGENT.length} urgent{grouped.URGENT.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Demo data seeder ──────────────────────────────────────────────────────

async function seedDemoOrders(dateStr: string): Promise<void> {
  const existing = await db.workOrders.where('scheduledDate').equals(dateStr).count();
  if (existing > 0) return; // Already seeded

  const demo: WorkOrderCache[] = [
    {
      orderId: `demo-${dateStr}-001`,
      orderType: 'PREVENTIVE',
      equipmentTag: 'BRY-SAG-ML-001',
      equipmentName: 'Broyeur SAG principal',
      description: 'Replace main bearing — drive end',
      descriptionFr: 'Remplacement roulement principal côté entraînement',
      priority: 'URGENT',
      status: 'OPEN',
      scheduledDate: dateStr,
      estimatedHours: 4,
      assignedTo: 'J. Alquinta',
      materials: ['Roulement SKF 6316', 'Graisse Mobilux EP2', 'Joint torique 150mm'],
      cachedAt: new Date().toISOString(),
    },
    {
      orderId: `demo-${dateStr}-002`,
      orderType: 'PREVENTIVE',
      equipmentTag: 'BRY-PUMP-001',
      equipmentName: 'Pompe de circulation',
      description: 'Vibration inspection and lubrication',
      descriptionFr: 'Inspection vibrations et lubrification',
      priority: 'PLANNED',
      status: 'OPEN',
      scheduledDate: dateStr,
      estimatedHours: 1,
      assignedTo: 'A. Tazi',
      materials: [],
      cachedAt: new Date().toISOString(),
    },
    {
      orderId: `demo-${dateStr}-003`,
      orderType: 'CORRECTIVE',
      equipmentTag: 'BRY-CONV-001',
      equipmentName: 'Convoyeur à bande principal',
      description: 'Belt tensioner adjustment',
      descriptionFr: 'Réglage tendeur de courroie',
      priority: 'PLANNED',
      status: 'OPEN',
      scheduledDate: dateStr,
      estimatedHours: 2,
      assignedTo: 'M. Karimi',
      materials: ['Boulon M20 × 80mm', 'Rondelle M20'],
      cachedAt: new Date().toISOString(),
    },
    {
      orderId: `demo-${dateStr}-004`,
      orderType: 'PREDICTIVE',
      equipmentTag: 'BRY-COMP-001',
      equipmentName: 'Compresseur air process',
      description: 'Vibration and temperature measurement',
      descriptionFr: 'Mesures vibrations et température',
      priority: 'DEFERRED',
      status: 'OPEN',
      scheduledDate: dateStr,
      estimatedHours: 0.5,
      assignedTo: 'F. Benali',
      materials: [],
      cachedAt: new Date().toISOString(),
    },
  ];
  await db.workOrders.bulkPut(demo);
}

export default WorkProgram;
