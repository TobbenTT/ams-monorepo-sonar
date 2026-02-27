import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Network, Gauge, Microscope, Package, CalendarDays, Smartphone, BarChart3, Search, FileText, Settings } from 'lucide-react';

const NAV = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/field-capture', icon: Smartphone, label: 'Field Capture' },
    { to: '/hierarchy', icon: Network, label: 'Hierarchy' },
    { to: '/criticality', icon: Gauge, label: 'Criticality' },
    { to: '/fmea', icon: Microscope, label: 'FMEA / Strategy' },
    { to: '/work-packages', icon: Package, label: 'Work Packages' },
    { to: '/planning', icon: CalendarDays, label: 'Planning' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/rca', icon: Search, label: 'RCA / DE' },
    { to: '/reports', icon: FileText, label: 'Reports' },
    { to: '/admin', icon: Settings, label: 'Admin' },
];

export default function Sidebar({ mobileOpen, onClose }) {
    return (
        <>
            <div className={`sidebar-overlay${mobileOpen ? ' visible' : ''}`} onClick={onClose} />
            <aside className={`sidebar${mobileOpen ? ' mobile-open' : ''}`} role="navigation" aria-label="Main navigation">
                <div className="sidebar-logo">
                    <div className="logo-icon" aria-hidden="true">⚙️</div>
                    <span>OCP Maintenance AI</span>
                </div>
                <nav className="sidebar-nav" aria-label="Page navigation">
                    {NAV.map(n => (
                        <NavLink
                            key={n.to}
                            to={n.to}
                            end={n.to === '/'}
                            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                            onClick={onClose}
                            aria-label={n.label}
                        >
                            <n.icon size={18} aria-hidden="true" />
                            <span>{n.label}</span>
                        </NavLink>
                    ))}
                </nav>
                <div className="sidebar-footer" aria-label="User info">
                    <div className="sidebar-avatar" aria-hidden="true">AM</div>
                    <div className="sidebar-user">
                        <div className="sidebar-user-name">Ahmed M.</div>
                        <div className="sidebar-user-role">Plant Manager</div>
                    </div>
                </div>
            </aside>
        </>
    );
}
