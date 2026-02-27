import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ErrorBoundary from './components/ErrorBoundary';
import { listPlants } from './api';

export default function App() {
    const [plant, setPlant] = useState('OCP-JFC1');
    const [plants, setPlants] = useState([]);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => { listPlants().then(setPlants).catch(() => { }); }, []);

    return (
        <div className="app-layout">
            <Sidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
            <div className="main-area">
                <Header plant={plant} onPlantChange={setPlant} plants={plants} onMenuToggle={() => setMobileMenuOpen(v => !v)} />
                <div className="page-content">
                    <ErrorBoundary>
                        <Outlet context={{ plant, plants }} />
                    </ErrorBoundary>
                </div>
            </div>
        </div>
    );
}
