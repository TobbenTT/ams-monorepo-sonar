import { lazy, Suspense } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import WelcomeCard from '../components/WelcomeCard';

// Lazy-load to split the bundle — each view (and its heavy chart deps) loads only when the user picks it
const ExecutiveView = lazy(() => import('../components/views/ExecutiveView'));
const TacticalOperationsView = lazy(() => import('../components/views/TacticalOperationsView'));

function DashboardFallback() {
    return (
        <div className="p-6 flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                <p className="text-gray-600 text-sm">Cargando dashboard…</p>
            </div>
        </div>
    );
}

export default function Dashboard() {
    const { viewMode, plant, selectedTimeRange, selectedArea } = useOutletContext();
    const View = viewMode === 'executive' ? ExecutiveView : TacticalOperationsView;
    return (
        <Suspense fallback={<DashboardFallback />}>
            <div className="p-6 pb-0 flex items-center justify-between">
                <div className="flex-1"><WelcomeCard /></div>
            </div>
            <div className="px-6 flex justify-end -mb-2">
                <a href="/present" className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg shadow"
                   title="Modo presentación pantalla completa">
                    📺 Modo Presentación
                </a>
            </div>
            <View
                selectedPlant={plant}
                selectedTimeRange={selectedTimeRange}
                selectedArea={selectedArea}
            />
        </Suspense>
    );
}
