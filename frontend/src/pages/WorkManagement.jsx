import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { LoadingSpinner } from '../components/Shared';
import { useLanguage } from '../contexts/LanguageContext';
import { AlertTriangle, ClipboardList, CalendarRange, Calendar } from 'lucide-react';
import * as api from '../api';

const FailureCapture = lazy(() => import('./FailureCapture'));
const WorkRequests = lazy(() => import('./WorkRequests'));
const Planning = lazy(() => import('./Planning'));
const Scheduling = lazy(() => import('./Scheduling'));

const TABS = [
  { id: 'failure-capture', label: 'Failure Capture',  icon: AlertTriangle,  component: FailureCapture },
  { id: 'identification',  label: 'Identification',   icon: ClipboardList,  component: WorkRequests },
  { id: 'planning',        label: 'Planning',         icon: CalendarRange,  component: Planning },
  { id: 'scheduling',      label: 'Scheduling',       icon: Calendar,       component: Scheduling },
];

export default function WorkManagement() {
  const { t } = useLanguage();
  const outletContext = useOutletContext();
  const [activeTab, setActiveTab] = useState('identification');
  const [viewMode, setViewMode] = useState('planner'); // planner | supervisor
  const [phaseCounts, setPhaseCounts] = useState(null);

  const refreshCounts = useCallback(() => {
    Promise.all([
      api.listWorkRequests({}).catch(() => []),
      api.listManagedWOs({}).catch(() => []),
    ]).then(([wrs, wos]) => {
      const wrList = Array.isArray(wrs) ? wrs : [];
      const woList = Array.isArray(wos) ? wos : [];
      setPhaseCounts({
        'failure-capture': null,
        identification: wrList.filter(w => ['DRAFT', 'PENDING_VALIDATION'].includes(w.status)).length,
        planning: woList.filter(w => ['DRAFT', 'PLANNED'].includes(w.status)).length,
        scheduling: woList.filter(w => w.status === 'RELEASED').length,
      });
    });
  }, []);

  useEffect(() => { refreshCounts(); }, [refreshCounts]);

  const navigateTab = useCallback((tabId) => {
    setActiveTab(tabId);
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

        {/* Planner / Supervisor View Toggle */}
        <div className="flex items-center bg-white border border-gray-200 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('planner')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              viewMode === 'planner'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Planner View
          </button>
          <button
            onClick={() => setViewMode('supervisor')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              viewMode === 'supervisor'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Supervisor View
          </button>
        </div>
      </div>

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
                {tab.label}
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

      {/* Active Tab Content */}
      <div className="min-h-[600px]">
        <Suspense fallback={<LoadingSpinner />}>
          {ActiveComponent && (
            <ActiveComponent
              {...outletContext}
              onNavigateTab={navigateTab}
              viewMode={viewMode}
            />
          )}
        </Suspense>
      </div>
    </div>
  );
}
