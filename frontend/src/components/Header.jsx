import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Menu, Moon, Sun, Search, X, Globe, Factory, Calendar, MapPin } from 'lucide-react';
import { useState, useEffect, useRef, useMemo } from 'react';
import * as api from '../api';
import { cn } from './ui/utils';
import { useLanguage } from '../contexts/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';

const LANG_OPTIONS = [
    { code: 'en', label: 'EN', flag: '\u{1F1EC}\u{1F1E7}' },
    { code: 'es', label: 'ES', flag: '\u{1F1EA}\u{1F1F8}' },
    { code: 'ar', label: 'AR', flag: '\u{1F1F2}\u{1F1E6}' },
];

const TIME_RANGE_OPTIONS = [
    { value: 'Last 7 Days',  i18nKey: 'header.timeRange7' },
    { value: 'Last 30 Days', i18nKey: 'header.timeRange30' },
    { value: 'Last 90 Days', i18nKey: 'header.timeRange90' },
    { value: 'YTD',          i18nKey: 'header.timeRangeYTD' },
    { value: 'Last Year',    i18nKey: 'header.timeRangeLastYear' },
];

// Areas are now fetched dynamically per plant (see useEffect below)

export default function Header({
    plant, onPlantChange, plants, onMenuToggle,
    viewMode, onViewModeChange,
    selectedTimeRange, onTimeRangeChange,
    selectedArea, onAreaChange,
}) {
    const loc = useLocation();
    const navigate = useNavigate();
    const { t, lang, setLang } = useLanguage();
    const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
    const [notifCount, setNotifCount] = useState(0);
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const notifRef = useRef(null);
    const [query, setQuery] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [showLangMenu, setShowLangMenu] = useState(false);
    const searchRef = useRef(null);
    const langRef = useRef(null);

    // Build search pages inside component so t() is available
    const searchPages = useMemo(() => [
        { path: '/',                    labelKey: 'nav.dashboard',          keywords: 'home dashboard kpi summary overview inicio resumen' },
        { path: '/work-orders',         labelKey: 'nav.workOrders',         keywords: 'work orders late delayed ordenes trabajo' },
        { path: '/failures-events',     labelKey: 'nav.failuresEvents',     keywords: 'failures events fallas eventos failure analysis' },
        { path: '/improvement-actions',  labelKey: 'nav.improvementActions', keywords: 'improvement actions mejora acciones capa' },
        { path: '/analytics',           labelKey: 'nav.analytics',          keywords: 'analytics kpi condition monitoring analitica' },
        { path: '/reports',             labelKey: 'nav.reports',            keywords: 'reports weekly monthly export reportes' },
        { path: '/team',               labelKey: 'nav.team',               keywords: 'team members equipo technicians' },
        { path: '/settings',           labelKey: 'nav.settings',           keywords: 'settings configuration admin configuracion' },
        { path: '/work-requests',      labelKey: 'nav.workRequests',       keywords: 'work requests avisos solicitudes' },
        { path: '/hierarchy',          labelKey: 'nav.assetHierarchy',     keywords: 'hierarchy assets equipment tree jerarquia activos' },
        { path: '/reliability',        labelKey: 'nav.reliabilityEng',     keywords: 'reliability weibull mtbf mttr confiabilidad' },
        { path: '/profile',           labelKey: 'nav.profile',            keywords: 'profile user perfil usuario' },
        { path: '/work-management', labelKey: 'nav.workManagement',   keywords: 'work management planning scheduling gestion trabajo planificacion programacion' },
        { path: '/rca',             labelKey: 'nav.rca',              keywords: 'rca root cause analysis analisis causa raiz' },
        { path: '/ai-agents',       labelKey: 'nav.aiAgents',         keywords: 'ai agents copilot intelligence artificial inteligencia' },
        { path: '/troubleshooting', labelKey: 'nav.troubleshooting',  keywords: 'troubleshooting diagnostics diagnostico' },
        { path: '/fmea',            labelKey: 'nav.fmea',             keywords: 'fmea failure modes effects analysis modos falla' },
        { path: '/execution',       labelKey: 'nav.execution',        keywords: 'execution tasks field tareas ejecucion campo' },
        { path: '/financial',       labelKey: 'nav.financial',        keywords: 'financial budget costs roi financiero presupuesto costos' },
    ].map(p => ({ ...p, label: t(p.labelKey) })), [t]);

    useEffect(() => {
        api.listNotifications({ limit: 50 }).then(n => {
            const list = Array.isArray(n) ? n : [];
            setNotifications(list);
            setNotifCount(list.filter(x => !x.is_read).length);
        }).catch(() => { setNotifCount(0); setNotifications([]); });
    }, [plant]);

    // Close notification panel on outside click
    useEffect(() => {
        const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Dynamic areas per plant
    const [dynamicAreas, setDynamicAreas] = useState([{ value: 'All Areas', label: 'All Areas' }]);
    useEffect(() => {
        if (!plant) return;
        api.listNodes({ node_type: 'AREA', plant_id: plant, limit: 50 }).then(res => {
            const nodes = Array.isArray(res) ? res : (res?.items || []);
            const areas = [{ value: 'All Areas', label: 'All Areas' }];
            nodes.forEach(n => areas.push({ value: n.name || n.node_id, label: n.name || n.node_id }));
            setDynamicAreas(areas.length > 1 ? areas : [{ value: 'All Areas', label: 'All Areas' }]);
            if (onAreaChange) onAreaChange('All Areas');
        }).catch(() => {});
    }, [plant]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) setShowResults(false);
            if (langRef.current && !langRef.current.contains(e.target)) setShowLangMenu(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDark = () => {
        const next = !dark;
        setDark(next);
        document.documentElement.classList.toggle('dark', next);
    };

    const filteredPages = query.trim().length > 0
        ? searchPages.filter(p => {
            const q = query.toLowerCase();
            return p.label.toLowerCase().includes(q) || p.keywords.includes(q) || p.path.includes(q);
        })
        : [];

    const handleSelect = (path) => {
        navigate(path);
        setQuery('');
        setShowResults(false);
    };

    const currentLang = LANG_OPTIONS.find(l => l.code === lang) || LANG_OPTIONS[0];

    // Show plant/time/area filters on these pages
    const showFilters = true;
    // View mode toggle on all pages that have filters
    const showViewToggle = showFilters;

    return (
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex-shrink-0 sticky top-0 z-50">
            {/* Top row: Search + utilities */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                    <button className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" onClick={onMenuToggle}>
                        <Menu size={22} className="text-gray-500" />
                    </button>

                    <div className="relative hidden sm:block" ref={searchRef}>
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('header.searchModules')}
                            value={query}
                            onChange={e => { setQuery(e.target.value); setShowResults(true); }}
                            onFocus={() => query.trim() && setShowResults(true)}
                            className="pl-9 pr-8 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg w-72 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors"
                        />
                        {query && (
                            <button onClick={() => { setQuery(''); setShowResults(false); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5">
                                <X size={14} />
                            </button>
                        )}
                        {showResults && query.trim().length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl z-[200] overflow-hidden max-h-80 overflow-y-auto">
                                {filteredPages.length > 0 ? filteredPages.map(p => (
                                    <button
                                        key={p.path}
                                        onClick={() => handleSelect(p.path)}
                                        className={cn(
                                            "w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-between",
                                            loc.pathname === p.path && "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                                        )}
                                    >
                                        <span className="text-sm font-medium">{p.label}</span>
                                        <span className="text-xs text-gray-400 font-mono">{p.path}</span>
                                    </button>
                                )) : (
                                    <div className="px-4 py-3 text-sm text-gray-500">{t('header.noResults')}</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Language */}
                    <div className="relative" ref={langRef}>
                        <button
                            onClick={() => setShowLangMenu(!showLangMenu)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium text-gray-500 hover:text-gray-700 border border-gray-200 dark:border-gray-600"
                        >
                            <Globe size={15} />
                            <span>{currentLang.flag} {currentLang.label}</span>
                        </button>
                        {showLangMenu && (
                            <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl z-[200] overflow-hidden min-w-[120px]">
                                {LANG_OPTIONS.map(opt => (
                                    <button
                                        key={opt.code}
                                        onClick={() => { setLang(opt.code); setShowLangMenu(false); }}
                                        className={cn(
                                            "w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm",
                                            lang === opt.code && "bg-emerald-50 text-emerald-700 font-semibold"
                                        )}
                                    >
                                        <span>{opt.flag}</span>
                                        <span>{opt.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Dark mode */}
                    <button
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 hover:text-gray-700"
                        onClick={toggleDark}
                        title={dark ? t('header.lightMode') : t('header.darkMode')}
                    >
                        {dark ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    {/* Notifications */}
                    <div className="relative" ref={notifRef}>
                        <button
                            onClick={() => setNotifOpen(!notifOpen)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative text-gray-500 hover:text-gray-700"
                            title={t('header.notifications', { count: notifCount })}
                        >
                            <Bell size={18} />
                            {notifCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[0.6rem] rounded-full flex items-center justify-center font-bold">
                                    {notifCount > 9 ? '9+' : notifCount}
                                </span>
                            )}
                        </button>
                        {notifOpen && (
                            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                                <div className="px-4 py-3 border-b bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
                                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">Notificaciones</span>
                                    {notifCount > 0 && (
                                        <button onClick={() => { api.markAllNotificationsRead().catch(() => {}); setNotifications(prev => prev.map(n => ({...n, is_read: true}))); setNotifCount(0); }}
                                            className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold">Marcar todo leído</button>
                                    )}
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="py-8 text-center text-gray-400 text-sm">Sin notificaciones</div>
                                    ) : notifications.slice(0, 20).map((n, i) => (
                                        <div key={n.notification_id || i}
                                            className={`px-4 py-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${!n.is_read ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}
                                            onClick={() => {
                                                if (!n.is_read) {
                                                    api.markNotificationRead(n.notification_id).catch(() => {});
                                                    setNotifications(prev => prev.map(x => x.notification_id === n.notification_id ? {...x, is_read: true} : x));
                                                    setNotifCount(prev => Math.max(0, prev - 1));
                                                }
                                            }}>
                                            <div className="flex items-start gap-2">
                                                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.is_read ? 'bg-blue-500' : 'bg-transparent'}`} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{n.title || 'Notificación'}</p>
                                                    <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">{n.message || ''}</p>
                                                    <p className="text-[10px] text-gray-400 mt-1">{n.created_at ? new Date(n.created_at).toLocaleString('es', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}</p>
                                                </div>
                                                {n.level === 'CRITICAL' && <span className="text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded font-bold shrink-0">CRÍTICO</span>}
                                                {n.level === 'WARN' && <span className="text-[9px] bg-amber-500 text-white px-1.5 py-0.5 rounded font-bold shrink-0">ALERTA</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Filters row */}
            {showFilters && (
                <div className="flex items-center gap-6 mb-3">
                    {/* Plant */}
                    <div className="flex items-center gap-2">
                        <Factory className="w-4 h-4 text-gray-500" />
                        <Select value={plant} onValueChange={onPlantChange}>
                            <SelectTrigger className="w-44 h-9 text-sm border-gray-300">
                                <SelectValue placeholder={t('header.selectPlant')} />
                            </SelectTrigger>
                            <SelectContent>
                                {(plants || []).map(p => (
                                    <SelectItem key={p.plant_id} value={p.plant_id}>{p.plant_id} — {p.name}</SelectItem>
                                ))}
                                {(!plants || plants.length === 0) && (
                                    <SelectItem value="OCP-JFC1">OCP-JFC1 — Jorf Lasfar</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Time Range */}
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <Select value={selectedTimeRange} onValueChange={onTimeRangeChange}>
                            <SelectTrigger className="w-44 h-9 text-sm border-gray-300">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {TIME_RANGE_OPTIONS.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>{t(opt.i18nKey)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Area */}
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <Select value={selectedArea} onValueChange={onAreaChange}>
                            <SelectTrigger className="w-44 h-9 text-sm border-gray-300">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {dynamicAreas.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}

            {/* View Mode Toggle — only on Dashboard */}
            {showViewToggle && (
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('header.analysisLevel')}</span>
                    <div className="inline-flex rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 p-1">
                        <Button
                            variant={viewMode === 'executive' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => onViewModeChange('executive')}
                            className={viewMode === 'executive' ? 'bg-emerald-600 text-white hover:bg-emerald-700 h-8 text-sm' : 'hover:bg-gray-50 dark:hover:bg-gray-700 h-8 text-sm'}
                        >
                            {t('header.executiveView')}
                        </Button>
                        <Button
                            variant={viewMode === 'tactical' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => onViewModeChange('tactical')}
                            className={viewMode === 'tactical' ? 'bg-emerald-600 text-white hover:bg-emerald-700 h-8 text-sm' : 'hover:bg-gray-50 dark:hover:bg-gray-700 h-8 text-sm'}
                        >
                            {t('header.tacticalView')}
                        </Button>
                    </div>
                </div>
            )}
        </header>
    );
}
