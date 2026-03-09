import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ErrorBoundary from './components/ErrorBoundary';
import UpdateBanner from './components/UpdateBanner';
import { listPlants } from './api';

export default function App() {
    const [plant, setPlant] = useState('OCP-JFC1');
    const [plants, setPlants] = useState([]);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => { listPlants().then(setPlants).catch(() => { }); }, []);

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            <UpdateBanner />
            <Sidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header plant={plant} onPlantChange={setPlant} plants={plants} onMenuToggle={() => setMobileMenuOpen(v => !v)} />
                <main className="flex-1 overflow-y-auto p-5">
                    <ErrorBoundary>
                        <Outlet context={{ plant, plants }} />
                    </ErrorBoundary>
                </main>
            </div>
        </div>
    );
}
