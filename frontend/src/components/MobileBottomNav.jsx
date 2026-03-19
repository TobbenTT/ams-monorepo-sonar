import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, Plus, FileText, BarChart3 } from 'lucide-react';

const NAV_ITEMS = {
    maintainer: [
        { to: '/', icon: Home, label: 'Inicio', exact: true },
        { to: '/m/tareas', icon: ClipboardList, label: 'Tareas' },
        { to: '/m/crear-wr', icon: Plus, label: 'Crear WR', highlight: true },
    ],
    supervisor: [
        { to: '/', icon: Home, label: 'Inicio', exact: true },
        { to: '/m/tareas', icon: ClipboardList, label: 'Tareas' },
        { to: '/m/crear-wr', icon: Plus, label: 'Crear WR', highlight: true },
        { to: '/m/avisos', icon: FileText, label: 'WR' },
        { to: '/m/dashboard', icon: BarChart3, label: 'Dashboard' },
    ],
};

export default function MobileBottomNav({ mobileRole }) {
    const items = NAV_ITEMS[mobileRole] || NAV_ITEMS.maintainer;

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-50" style={{ borderColor: '#E2E8F0' }}>
            <div className="max-w-md mx-auto px-2 py-2">
                <div className="flex items-center justify-around">
                    {items.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.exact}
                            className="flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-all"
                            style={({ isActive }) => ({
                                color: item.highlight ? '#FFFFFF' : isActive ? '#047857' : '#64748B',
                                backgroundColor: item.highlight
                                    ? '#047857'
                                    : isActive
                                    ? '#ECFDF5'
                                    : 'transparent',
                            })}
                        >
                            <item.icon className="w-6 h-6" />
                            <span className="text-xs font-medium">{item.label}</span>
                        </NavLink>
                    ))}
                </div>
            </div>
        </nav>
    );
}
