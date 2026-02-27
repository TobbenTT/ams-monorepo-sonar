import { useLocation } from 'react-router-dom';
import { Bell, Menu, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';
import * as api from '../api';

const CRUMBS = {
    '/': ['Home', 'Executive Dashboard'],
    '/hierarchy': ['Home', 'Equipment Hierarchy'],
    '/criticality': ['Home', 'Criticality Assessment'],
    '/fmea': ['Home', 'FMEA & Strategy'],
    '/work-packages': ['Home', 'Work Packages & SAP'],
    '/planning': ['Home', 'Planning & Scheduling'],
    '/field-capture': ['Home', 'Field Capture'],
    '/analytics': ['Home', 'Analytics & Reliability'],
    '/rca': ['Home', 'RCA & Defect Elimination'],
    '/reports': ['Home', 'Reports & Data Export'],
    '/admin': ['Home', 'Administration'],
};

export default function Header({ plant, onPlantChange, plants, onMenuToggle }) {
    const loc = useLocation();
    const parts = CRUMBS[loc.pathname] || ['Home'];
    const [dark, setDark] = useState(() => document.documentElement.getAttribute('data-theme') === 'dark');
    const [notifCount, setNotifCount] = useState(0);

    useEffect(() => {
        api.listNotifications({ plant_id: plant }).then(n => {
            const list = Array.isArray(n) ? n : [];
            setNotifCount(list.filter(x => !x.acknowledged).length || list.length);
        }).catch(() => {});
    }, [plant]);

    const toggleDark = () => {
        const next = !dark;
        setDark(next);
        document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    };

    return (
        <header className="header" role="banner">
            <div className="flex items-center gap-sm">
                <button className="mobile-menu-btn" onClick={onMenuToggle} aria-label="Toggle navigation menu">
                    <Menu size={22} />
                </button>
                <div className="breadcrumb" aria-label="Breadcrumb">
                    {parts.map((p, i) => (
                        <span key={i}>
                            {i > 0 && <span className="bc-sep" aria-hidden="true">›</span>}
                            <span className={i === parts.length - 1 ? 'bc-current' : ''}>{p}</span>
                        </span>
                    ))}
                </div>
            </div>
            <div className="header-actions">
                <select className="header-select" value={plant} onChange={e => onPlantChange(e.target.value)} aria-label="Select plant">
                    {(plants || []).map(p => <option key={p.plant_id} value={p.plant_id}>{p.plant_id} — {p.name}</option>)}
                    {(!plants || plants.length === 0) && <option value="OCP-JFC1">OCP-JFC1 — Jorf Lasfar</option>}
                </select>
                <button className="header-btn" onClick={toggleDark} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
                    {dark ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <button className="header-btn" aria-label={`Notifications: ${notifCount} unread`}>
                    <Bell size={18} />
                    {notifCount > 0 && <span className="notification-badge">{notifCount > 9 ? '9+' : notifCount}</span>}
                </button>
            </div>
        </header>
    );
}
