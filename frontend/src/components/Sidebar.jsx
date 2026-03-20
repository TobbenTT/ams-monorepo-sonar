import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import {
    Home, Wrench, AlertTriangle, TrendingUp, BarChart3,
    FileText, Users, Settings, MessageSquare, ClipboardCheck,
    ChevronLeft, ChevronRight, User, LogOut
} from 'lucide-react';
import { cn } from './ui/utils';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { usePermissions } from '../hooks/usePermissions';

const navItems = [
    { path: '/', icon: Home, labelKey: 'nav.dashboard', module: 'dashboard', exact: true },
    { path: '/work-orders', icon: Wrench, labelKey: 'nav.workOrders', module: 'work-orders' },
    { path: '/execution', icon: ClipboardCheck, labelKey: 'nav.execution', module: 'execution' },
    { path: '/failures-events', icon: AlertTriangle, labelKey: 'nav.failuresEvents', module: 'failures-events' },
    { path: '/improvement-actions', icon: TrendingUp, labelKey: 'nav.improvementActions', module: 'improvement-actions' },
    { path: '/analytics', icon: BarChart3, labelKey: 'nav.analytics', module: 'analytics' },
    { path: '/reports', icon: FileText, labelKey: 'nav.reports', module: 'reports' },
    { path: '/post-maintenance', icon: FileText, labelKey: 'nav.postMaintenance', module: 'post-maintenance' },
    { path: '/team', icon: Users, labelKey: 'nav.team', module: 'team' },
    { path: '/settings', icon: Settings, labelKey: 'nav.settings', module: 'settings' },
    { path: '/feedback-admin', icon: MessageSquare, labelKey: 'nav.feedback', module: 'feedback' },
];

export default function Sidebar({ mobileOpen, onClose }) {
    const [collapsed, setCollapsed] = useState(false);
    const { user, logout } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { canView } = usePermissions();

    const visibleItems = useMemo(
        () => navItems.filter(item => canView(item.module)),
        [canView]
    );

    const roleLabel = t(`auth.roles.${user?.role}`) || user?.role;
    const initials = user?.full_name
        ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : 'RE';

    return (
        <>
            {/* Mobile overlay */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/40 z-[99] transition-opacity md:hidden",
                    mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            <aside
                className={cn(
                    "flex flex-col bg-[#047857] text-white transition-all duration-300 flex-shrink-0 h-screen z-[100]",
                    "fixed md:sticky top-0 left-0",
                    collapsed ? "w-16" : "w-64",
                    mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                )}
                role="navigation"
                aria-label="Main navigation"
            >
                {/* Brand */}
                <div className={cn("px-6 py-5 border-b border-emerald-600/30", collapsed && "px-3 flex justify-center")}>
                    {!collapsed ? (
                        <>
                            <h1 className="text-xl font-semibold">{t('nav.brandTitle')}</h1>
                            <p className="text-emerald-100 text-sm mt-1">{t('nav.brandSubtitle')}</p>
                        </>
                    ) : (
                        <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                            <span className="text-xs font-bold">OCP</span>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-3 py-3">
                    <div className="space-y-1">
                        {visibleItems.map((item) => {
                            const label = t(item.labelKey);
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.exact}
                                    className={({ isActive }) => cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150",
                                        isActive
                                            ? "bg-emerald-600/50 text-white font-semibold"
                                            : "text-emerald-100 hover:bg-emerald-600/30 hover:text-white",
                                        collapsed && "justify-center px-2"
                                    )}
                                    onClick={onClose}
                                    title={collapsed ? label : undefined}
                                >
                                    <item.icon className="w-5 h-5 flex-shrink-0" />
                                    {!collapsed && <span className="text-sm">{label}</span>}
                                </NavLink>
                            );
                        })}
                    </div>
                </nav>

                {/* User + Controls */}
                <div className="border-t border-emerald-600/30">
                    {user && (
                        <button
                            onClick={() => { navigate('/profile'); onClose?.(); }}
                            className={cn(
                                "flex items-center gap-3 w-full hover:bg-emerald-600/30 transition-colors cursor-pointer",
                                collapsed ? "justify-center py-3 px-2" : "px-4 py-3"
                            )}
                            title={collapsed ? (user.full_name || user.username) : undefined}
                        >
                            {(() => {
                                const sidebarAvatar = localStorage.getItem(`avatar_${user.user_id}`);
                                if (sidebarAvatar) {
                                    return <img src={sidebarAvatar} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />;
                                }
                                return (
                                    <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-sm font-medium">{initials}</span>
                                    </div>
                                );
                            })()}
                            {!collapsed && (
                                <div className="flex-1 min-w-0 text-left">
                                    <div className="text-sm font-medium truncate">{user.full_name || user.username}</div>
                                    <div className="text-xs text-emerald-100">{roleLabel}</div>
                                </div>
                            )}
                        </button>
                    )}
                    <div className="flex">
                        <button
                            onClick={logout}
                            className={cn(
                                "flex items-center gap-2 py-3 hover:bg-red-900/40 transition-colors text-emerald-200 hover:text-red-300",
                                collapsed ? "justify-center flex-1 px-3" : "px-4 flex-1"
                            )}
                            title={t('auth.signOut')}
                        >
                            <LogOut size={16} />
                            {!collapsed && <span className="text-xs">{t('auth.signOut')}</span>}
                        </button>
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="flex items-center justify-center p-3 hover:bg-emerald-600/30 transition-colors text-emerald-200 hover:text-white border-l border-emerald-600/30"
                        >
                            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
