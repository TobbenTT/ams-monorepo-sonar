import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MobileHeader from './components/MobileHeader';
import MobileBottomNav from './components/MobileBottomNav';
import ErrorBoundary from './components/ErrorBoundary';
import UpdateBanner from './components/UpdateBanner';
import FeedbackWidget from './components/FeedbackWidget';
import OfflineSyncToasts from './components/OfflineSyncToasts';
import { lazy, Suspense } from 'react';
const GuidedTour = lazy(() => import('./components/GuidedTour'));
import ProjectSelector from './pages/ProjectSelector';
import useIsMobile from './hooks/useIsMobile';
import { useAuth } from './contexts/AuthContext';
import { listPlants } from './api';

export default function App() {
    const { user } = useAuth();
    const [plant, setPlant] = useState(() => localStorage.getItem('selected_plant') || '');
    const [plants, setPlants] = useState([]);
    const [plantsLoaded, setPlantsLoaded] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileRole, setMobileRole] = useState(() => localStorage.getItem('mobileRole') || 'maintainer');
    const isMobile = useIsMobile();

    // Design state: view mode defaults by role (manager→executive, others→tactical)
    const defaultView = (user?.role === 'manager' || user?.role === 'admin') ? 'executive' : 'tactical';
    const [viewMode, setViewMode] = useState(defaultView);
    const [selectedTimeRange, setSelectedTimeRange] = useState('Last 30 Days');
    const [selectedArea, setSelectedArea] = useState('All Areas');

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        listPlants().then((data) => {
            setPlants(data);
            setPlantsLoaded(true);
            // If only 1 plant, auto-select it
            if (data.length === 1 && !plant) {
                const id = data[0].plant_id;
                setPlant(id);
                localStorage.setItem('selected_plant', id);
            }
            // If plant was saved but doesn't exist anymore, clear
            if (plant && data.length > 0 && !data.find(p => p.plant_id === plant)) {
                setPlant('');
                localStorage.removeItem('selected_plant');
            }
        }).catch(() => {
            setPlantsLoaded(true);
        });
    }, []);

    useEffect(() => { localStorage.setItem('mobileRole', mobileRole); }, [mobileRole]);

    // Auto-set viewMode when user role changes (login)
    useEffect(() => {
        if (user?.role) {
            setViewMode((user.role === 'manager' || user.role === 'admin') ? 'executive' : 'tactical');
        }
    }, [user?.role]);

    // Redirect: mobile routes on desktop → home, desktop routes on mobile → home
    useEffect(() => {
        if (!isMobile && location.pathname.startsWith('/m/')) {
            navigate('/', { replace: true });
        }
    }, [isMobile, location.pathname]);

    // Sync plant changes to localStorage
    const handlePlantChange = (newPlant) => {
        setPlant(newPlant);
        localStorage.setItem('selected_plant', newPlant);
    };

    // Show project selector if no plant selected and multiple plants available
    if (plantsLoaded && !plant && plants.length > 1) {
        return (
            <ProjectSelector
                onSelect={(plantId) => {
                    setPlant(plantId);
                    localStorage.setItem('selected_plant', plantId);
                }}
            />
        );
    }

    // Fallback: if plants not loaded yet and no saved plant, show loading
    if (!plantsLoaded && !plant) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            </div>
        );
    }

    // Mobile layout
    if (isMobile) {
        return (
            <div className="min-h-screen flex flex-col overflow-x-hidden" style={{ backgroundColor: '#F8FAFC' }}>
                <MobileHeader mobileRole={mobileRole} onRoleChange={setMobileRole} />
                <main className="flex-1 max-w-md mx-auto w-full pb-20 overflow-x-hidden">
                    <ErrorBoundary>
                        <Outlet context={{ plant, selectedPlant: plant, plants, mobileRole, viewMode, selectedTimeRange, selectedArea }} />
                    </ErrorBoundary>
                </main>
                <MobileBottomNav mobileRole={mobileRole} />
            </div>
        );
    }

    // Desktop layout
    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
            <UpdateBanner />
            <Sidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header
                    plant={plant}
                    onPlantChange={handlePlantChange}
                    plants={plants}
                    onMenuToggle={() => setMobileMenuOpen(v => !v)}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    selectedTimeRange={selectedTimeRange}
                    onTimeRangeChange={setSelectedTimeRange}
                    selectedArea={selectedArea}
                    onAreaChange={setSelectedArea}
                />
                <main className="flex-1 overflow-y-auto">
                    <ErrorBoundary>
                        <Outlet context={{ plant, selectedPlant: plant, plants, viewMode, selectedTimeRange, selectedArea }} />
                    </ErrorBoundary>
                </main>
            </div>
            <FeedbackWidget />
            <OfflineSyncToasts />
            <Suspense fallback={null}><GuidedTour /></Suspense>
        </div>
    );
}
