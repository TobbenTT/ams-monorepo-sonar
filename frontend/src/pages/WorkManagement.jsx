import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { LoadingSpinner } from '../components/Shared';
import { useLanguage } from '../contexts/LanguageContext';
import { AlertTriangle, ClipboardList, CalendarRange, Calendar, Wrench } from 'lucide-react';
import * as api from '../api';
import { useWebSocket } from '../hooks/useWebSocket';

const FailureCapture = lazy(() => import('./FailureCapture'));
const WorkRequests = lazy(() => import('./WorkRequests'));
const Planning = lazy(() => import('./Planning'));
const Scheduling = lazy(() => import('./Scheduling'));
const Execution = lazy(() => import('./Execution'));

const TABS = [
  { id: 'failure-capture', labelKey: 'workManagement.tabs.failureCapture', icon: AlertTriangle,  component: FailureCapture },
  { id: 'identification',  labelKey: 'workManagement.tabs.identification', icon: ClipboardList,  component: WorkRequests },
  { id: 'planning',        labelKey: 'workManagement.tabs.planning',       icon: CalendarRange,  component: Planning },
  { id: 'scheduling',      labelKey: 'workManagement.tabs.scheduling',     icon: Calendar,       component: Scheduling },
  { id: 'execution',       labelKey: 'workManagement.tabs.execution',      icon: Wrench,         component: Execution },
];

export default function WorkManagement() {
  const { t } = useLanguage();
  const outletContext = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTabState] = useState(() => searchParams.get('tab') || 'identification');
  const [viewMode, setViewMode] = useState('planner');

  // Sync tab to URL so refresh preserves it
  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    setSearchParams({ tab }, { replace: true });
  };

  // Sync tab + handle openWr/openWo params whenever URL changes
  useEffect(() => {
    const urlTab = searchParams.get('tab');
    const openWr = searchParams.get('openWr');
    const openWo = searchParams.get('openWo');
    if (openWr) {
      setActiveTabState('identification');
      setAutoOpenWrId(openWr);
      const next = new URLSearchParams(searchParams);
      next.delete('openWr');
      next.set('tab', 'identification');
      setSearchParams(next, { replace: true });
    } else if (openWo) {
      setActiveTabState('planning');
      setAutoOpenWoId(openWo);
      const next = new URLSearchParams(searchParams);
      next.delete('openWo');
      next.set('tab', 'planning');
      setSearchParams(next, { replace: true });
    } else if (urlTab && urlTab !== activeTab) {
      setActiveTabState(urlTab);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // viewMode change does NOT switch tabs — user stays on current tab
  const [phaseCounts, setPhaseCounts] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [autoOpenWrId, setAutoOpenWrId] = useState(null);
  const [autoOpenWoId, setAutoOpenWoId] = useState(null);

  const refreshCounts = useCallback(() => {
    // SF-598 BUG-7 — los conteos antes ignoraban el plant_id (cross-plant) y
    // contaban estados duplicados entre Identification y Planning. Ahora:
    // 1) filtran por planta seleccionada (igual que las listas internas)
    // 2) usan filtros disjuntos para que un mismo registro cuente en una sola fase
    const plantId = outletContext?.selectedPlant?.plant_id || outletContext?.selectedPlant;
    const params = plantId ? { plant_id: plantId } : {};
    Promise.all([
      api.listWorkRequests(params).catch(() => []),
      api.listManagedWOs(params).catch(() => []),
    ]).then(([wrs, wos]) => {
      const wrList = Array.isArray(wrs) ? wrs : [];
      const woList = Array.isArray(wos) ? wos : [];
      setPhaseCounts({
        'failure-capture': null,
        // Identification: solo pending validation (no incluye los aprobados que pasan a Planning)
        identification: wrList.filter(w => ['PENDING_VALIDATION', 'PENDIENTE'].includes(w.status)).length,
        // Planning: aprobados sin OT creada (a la espera de pasar a OT)
        planning: wrList.filter(w => ['VALIDATED', 'APROBADO'].includes(w.status)).length,
        // Scheduling: OTs en estados pre-ejecución
        scheduling: woList.filter(w => ['DRAFT', 'PLANNED', 'RELEASED', 'CREADO', 'PLANIFICADO', 'EN_PROGRAMACION', 'PROGRAMADO'].includes(w.status)).length,
      });
    });
  }, [outletContext?.selectedPlant]);

  useEffect(() => { refreshCounts(); }, [refreshCounts, refreshKey]);

  // Si una OT se crea desde el modal Express → PM03 (custom event sin WS), refresh inmediato.
  useEffect(() => {
    const h = () => refreshCounts();
    window.addEventListener('wo:created', h);
    return () => window.removeEventListener('wo:created', h);
  }, [refreshCounts]);

  // Jorge 2026-04-27: badges del WM se refrescan al toque cuando llegan
  // eventos wr_*/wo_* del backend (otros usuarios o creación local).
  const plantId = outletContext?.selectedPlant?.plant_id || outletContext?.selectedPlant || 'OCP-JFC1';
  useWebSocket(plantId, useCallback((msg) => {
    if (msg?.event && (msg.event.startsWith('wr_') || msg.event.startsWith('wo_'))) {
      refreshCounts();
    }
  }, [refreshCounts]));

  const navigateTab = useCallback((tabId, selectedWrId, selectedWoId) => {
    setActiveTab(tabId);
    setRefreshKey(k => k + 1);
    if (selectedWrId) setAutoOpenWrId(selectedWrId);
    if (selectedWoId) setAutoOpenWoId(selectedWoId);
    // Refresh badge counts when navigating
    setTimeout(() => refreshCounts(), 500);
    refreshCounts();
  }, [refreshCounts]);

  const current = TABS.find(tab => tab.id === activeTab);
  const ActiveComponent = current?.component;

  return (
    <div className="p-6 space-y-4 bg-gray-50 min-h-full">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('workManagement.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('workManagement.subtitle')}</p>
        </div>

        {/* View toggle removed per client feedback #1 */}
      </div>

      {/* Jorge 2026-04-23 (reunión 17:38): date range removido de Work Management —
          cada tab tiene su propio filtro de fechas, éste estaba duplicando y no
          se estaba cableando a los tabs. */}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex gap-0">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const count = phaseCounts?.[tab.id];
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 text-sm font-medium transition-all border-b-2 ${
                  isActive
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t(tab.labelKey)}
                {count > 0 && (
                  <span className={`ml-2 text-xs font-bold px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content — all tabs rendered, only active visible (preserves state) */}
      <div className="min-h-[600px]">
        <Suspense fallback={<LoadingSpinner />}>
          {TABS.map(tab => {
            const TabComp = tab.component;
            return (
              <div key={tab.id} style={{ display: activeTab === tab.id ? 'block' : 'none' }}>
                <TabComp
                  onRefreshCounts={refreshCounts}
                  autoOpenWrId={activeTab === tab.id ? autoOpenWrId : null}
                  autoOpenWoId={activeTab === tab.id ? autoOpenWoId : null}
                  onClearAutoOpenWo={() => setAutoOpenWoId(null)}
                  onClearAutoOpen={() => setAutoOpenWrId(null)}
                  isActive={activeTab === tab.id}
                  {...outletContext}
                  onNavigateTab={navigateTab}
                  viewMode={viewMode}
                />
              </div>
            );
          })}
        </Suspense>
      </div>
    </div>
  );
}
