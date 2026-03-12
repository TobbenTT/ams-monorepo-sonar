import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
    LayoutDashboard, Mic, Network, Gauge, Microscope, Package,
    BarChart3, Search, FileText, Settings,
    ChevronLeft, ChevronRight, User, LogOut,
    ClipboardList, Archive, Calendar, BrainCircuit,
    Activity, Bug, Award, Database, ClipboardCheck, Cpu
} from 'lucide-react';
import { cn } from './ui/utils';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const ALL = ['admin', 'manager', 'planner', 'tecnico', 'engineer'];
const MGMT = ['admin', 'manager'];
const PLAN = ['admin', 'manager', 'planner', 'engineer'];
const FIELD = ['admin', 'tecnico'];
const ENGR = ['admin', 'manager', 'engineer'];

const navSections = (t) => [
    {
        section: t('nav.operations'),
        items: [
            { to: '/', icon: LayoutDashboard, label: t('nav.dashboard'), exact: true, roles: ALL },
            { to: '/field-capture', icon: Mic, label: t('nav.fieldCapture'), roles: FIELD },
            { to: '/work-requests', icon: ClipboardList, label: t('nav.workRequests'), roles: ALL },
            { to: '/work-packages', icon: Package, label: t('nav.workPackages'), roles: PLAN },
            { to: '/backlog', icon: Archive, label: t('nav.backlogMgmt'), roles: PLAN },
            { to: '/scheduling', icon: Calendar, label: t('nav.weeklyScheduling'), roles: PLAN },
            { to: '/planner', icon: BrainCircuit, label: t('nav.aiPlanner'), roles: PLAN },
            { to: '/planning', icon: ClipboardCheck, label: t('nav.planning') || 'Planning', roles: PLAN },
        ],
    },
    {
        section: t('nav.reliability'),
        items: [
            { to: '/hierarchy', icon: Network, label: t('nav.assetHierarchy'), roles: ALL },
            { to: '/criticality', icon: Gauge, label: t('nav.criticalityAnalysis'), roles: PLAN },
            { to: '/fmea', icon: Microscope, label: t('nav.fmea'), roles: PLAN },
            { to: '/strategy', icon: Settings, label: t('nav.rcmStrategy'), roles: PLAN },
            { to: '/reliability', icon: Activity, label: t('nav.reliabilityEng'), roles: ENGR },
            { to: '/rca', icon: Search, label: t('nav.rca'), roles: ENGR },
            { to: '/defect-elimination', icon: Bug, label: t('nav.defectElimination'), roles: ENGR },
            { to: '/ai-agents', icon: Cpu, label: 'Agentes IA', roles: ENGR },
        ],
    },
    {
        section: t('nav.analyticsReports'),
        items: [
            { to: '/analytics', icon: BarChart3, label: t('nav.analytics'), roles: MGMT },
            { to: '/executive', icon: Award, label: t('nav.executiveDashboard'), roles: MGMT },
            { to: '/reports', icon: FileText, label: t('nav.reports'), roles: MGMT },
            { to: '/sap-review', icon: Database, label: t('nav.sapIntegration'), roles: MGMT },
            { to: '/admin', icon: Settings, label: t('nav.administration'), roles: ['admin'] },
        ],
    },
];

export default function Sidebar({ mobileOpen, onClose }) {
    const [collapsed, setCollapsed] = useState(false);
    const { user, logout } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const sections = navSections(t);
    const filteredSections = sections
        .map(section => ({
            ...section,
            items: section.items.filter(item => item.roles.includes(user?.role)),
        }))
        .filter(section => section.items.length > 0);

    const roleLabel = t(`auth.roles.${user?.role}`) || user?.role;

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
                    "flex flex-col bg-[#1B5E20] text-white transition-all duration-300 flex-shrink-0 h-screen z-[100]",
                    "fixed md:sticky top-0 left-0",
                    collapsed ? "w-16" : "w-64",
                    mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                )}
                role="navigation"
                aria-label="Main navigation"
            >
                {/* Logo */}
                <div className={cn("flex items-center gap-3 px-4 py-5 border-b border-green-700", collapsed && "justify-center")}>
                    <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <img src="/OCP_LOGO.png" alt="OCP" className="w-10 h-10 object-contain" />
                    </div>
                    {!collapsed && (
                        <div>
                            <div className="text-sm font-bold leading-tight">OCP Maintenance</div>
                            <div className="text-xs text-green-300 leading-tight">AI Platform</div>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-3">
                    {filteredSections.map((section) => (
                        <div key={section.section} className="mb-2">
                            {!collapsed && (
                                <div className="px-4 py-2 text-[0.65rem] font-bold text-green-400 tracking-widest uppercase">
                                    {section.section}
                                </div>
                            )}
                            {section.items.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end={item.exact}
                                    className={({ isActive }) => cn(
                                        "flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-all duration-150",
                                        isActive
                                            ? "bg-white/15 text-white font-semibold"
                                            : "text-green-200 hover:bg-white/10 hover:text-white"
                                    )}
                                    onClick={onClose}
                                    aria-label={item.label}
                                >
                                    <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                                    {!collapsed && (
                                        <span className="text-sm font-medium truncate">{item.label}</span>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </nav>

                {/* User + Collapse toggle */}
                <div className="border-t border-green-700">
                    {!collapsed && user && (() => {
                        const sidebarAvatar = localStorage.getItem(`avatar_${user.user_id}`);
                        return (
                        <button
                            onClick={() => { navigate('/profile'); onClose?.(); }}
                            className="flex items-center gap-3 px-4 py-3 w-full hover:bg-white/10 transition-colors cursor-pointer"
                            title={t('nav.viewProfile')}
                        >
                            {sidebarAvatar ? (
                                <img src={sidebarAvatar} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                            ) : (
                            <div className="w-8 h-8 bg-[#2E7D32] rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-white" />
                            </div>
                            )}
                            <div className="flex-1 min-w-0 text-left">
                                <div className="text-sm font-medium truncate">{user.full_name || user.username}</div>
                                <div className="text-xs text-green-300">{roleLabel}</div>
                            </div>
                        </button>
                        );
                    })()}
                    {collapsed && user && (() => {
                        const sidebarAvatar = localStorage.getItem(`avatar_${user.user_id}`);
                        return (
                        <button
                            onClick={() => { navigate('/profile'); onClose?.(); }}
                            className="flex items-center justify-center py-3 w-full hover:bg-white/10 transition-colors cursor-pointer"
                            title={t('nav.viewProfile')}
                        >
                            {sidebarAvatar ? (
                                <img src={sidebarAvatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                            <div className="w-8 h-8 bg-[#2E7D32] rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-white" />
                            </div>
                            )}
                        </button>
                        );
                    })()}
                    <div className="flex">
                        <button
                            onClick={logout}
                            className={cn(
                                "flex items-center gap-2 py-3 hover:bg-red-900/40 transition-colors text-green-300 hover:text-red-300",
                                collapsed ? "justify-center flex-1 px-3" : "px-4 flex-1"
                            )}
                            title={t('auth.signOut')}
                        >
                            <LogOut size={16} />
                            {!collapsed && <span className="text-xs">{t('auth.signOut')}</span>}
                        </button>
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="flex items-center justify-center p-3 hover:bg-white/10 transition-colors text-green-300 hover:text-white border-l border-green-700"
                        >
                            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
