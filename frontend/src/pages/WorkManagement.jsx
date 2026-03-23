import { useState, lazy, Suspense } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { LoadingSpinner } from '../components/Shared';
import { useLanguage } from '../contexts/LanguageContext';
import { ClipboardList, CalendarRange, Calendar, Wrench, CheckCircle2 } from 'lucide-react';

const WorkRequests = lazy(() => import('./WorkRequests'));
const Planning = lazy(() => import('./Planning'));
const Scheduling = lazy(() => import('./Scheduling'));
const Execution = lazy(() => import('./Execution'));
const PostMaintenance = lazy(() => import('./PostMaintenance'));

const TABS = [
  { id: 'identification', icon: ClipboardList, component: WorkRequests },
  { id: 'planning',       icon: CalendarRange, component: Planning },
  { id: 'scheduling',     icon: Calendar,      component: Scheduling },
  { id: 'execution',      icon: Wrench,        component: Execution },
  { id: 'closure',        icon: CheckCircle2,  component: PostMaintenance },
];

export default function WorkManagement() {
  const { t } = useLanguage();
  const outletContext = useOutletContext();
  const [activeTab, setActiveTab] = useState('identification');

  const current = TABS.find(tab => tab.id === activeTab);
  const ActiveComponent = current?.component;

  return (
    <div className="p-6 space-y-4 bg-gray-50 min-h-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('workManagement.title')}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('workManagement.subtitle')}</p>
      </div>

      {/* Tab Navigation */}
      <Card className="p-1 bg-white">
        <div className="flex gap-1">
          {TABS.map((tab, idx) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className="text-xs font-bold text-opacity-60 mr-1">{idx + 1}.</span>
                <Icon className="w-4 h-4" />
                <span className="hidden lg:inline">{t(`workManagement.tabs.${tab.id}`)}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Active Tab Content */}
      <div className="min-h-[600px]">
        <Suspense fallback={<LoadingSpinner />}>
          {ActiveComponent && <ActiveComponent {...outletContext} />}
        </Suspense>
      </div>
    </div>
  );
}
