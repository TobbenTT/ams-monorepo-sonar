import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, Plus, FileText, BarChart3 } from 'lucide-react';

const NAV_ITEMS = {
    maintainer: [
        { to: '/', icon: Home, label: 'Inicio', exact: true },
        { to: '/m/tareas', icon: ClipboardList, label: 'Tareas' },
        { to: '/m/crear-wr', icon: Plus, label: 'Crear Aviso', highlight: true },
    ],
    supervisor: [
        { to: '/', icon: Home, label: 'Inicio', exact: true },
        { to: '/m/tareas', icon: ClipboardList, label: 'Tareas' },
        { to: '/m/crear-wr', icon: Plus, label: 'Crear Aviso', highlight: true },
        { to: '/m/avisos', icon: FileText, label: 'Avisos' },
        { to: '/m/dashboard', icon: BarChart3, label: 'Dashboard' },
    ],
};

export default function MobileBottomNav({ mobileRole }) {
    const items = NAV_ITEMS[mobileRole] || NAV_ITEMS.maintainer;

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-50" style={{ borderColor: '#E2E8F0', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
            <div className="px-2 py-2">
                <div className="flex items-center justify-around">
                    {items.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.exact}
                            className="flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-lg transition-all min-w-0"
                            style={({ isActive }) => ({
                                color: item.highlight ? '#FFFFFF' : isActive ? '#047857' : '#64748B',
                                backgroundColor: item.highlight
                                    ? '#047857'
                                    : isActive
                                    ? '#ECFDF5'
                                    : 'transparent',
                            })}
                        >
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            <span className="text-[10px] font-medium truncate">{item.label}</span>
                        </NavLink>
                    ))}
                </div>
            </div>
        </nav>
    );
}
