import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MobileHeader from './components/MobileHeader';
import MobileBottomNav from './components/MobileBottomNav';
import ErrorBoundary from './components/ErrorBoundary';
import UpdateBanner from './components/UpdateBanner';
import FeedbackWidget from './components/FeedbackWidget';
import useIsMobile from './hooks/useIsMobile';
import { useAuth } from './contexts/AuthContext';
import { listPlants } from './api';

export default function App() {
    const { user } = useAuth();
    const [plant, setPlant] = useState('OCP-JFC1');
    const [plants, setPlants] = useState([]);
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

    useEffect(() => { listPlants().then(setPlants).catch(() => { }); }, []);
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
                <FeedbackWidget />
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
                    onPlantChange={setPlant}
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
        </div>
    );
}
