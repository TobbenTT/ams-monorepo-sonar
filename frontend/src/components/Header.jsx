import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Menu, Moon, Sun, Search, X, Globe } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import * as api from '../api';
import { cn } from './ui/utils';
import { useLanguage } from '../contexts/LanguageContext';

const LANG_OPTIONS = [
    { code: 'en', label: 'EN', flag: '🇬🇧' },
    { code: 'es', label: 'ES', flag: '🇪🇸' },
    { code: 'ar', label: 'AR', flag: '🇲🇦' },
];

export default function Header({ plant, onPlantChange, plants, onMenuToggle }) {
    const loc = useLocation();
    const navigate = useNavigate();
    const { t, lang, setLang } = useLanguage();
    const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
    const [notifCount, setNotifCount] = useState(0);
    const [query, setQuery] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [showLangMenu, setShowLangMenu] = useState(false);
    const searchRef = useRef(null);
    const langRef = useRef(null);

    const CRUMBS = {
        '/': ['Home', t('nav.dashboard')],
        '/field-capture': ['Home', t('nav.fieldCapture')],
        '/work-requests': ['Home', t('nav.workRequests')],
        '/work-packages': ['Home', t('nav.workPackages')],
        '/backlog': ['Home', t('nav.backlogMgmt')],
        '/scheduling': ['Home', t('nav.weeklyScheduling')],
        '/planner': ['Home', t('nav.aiPlanner')],
        '/planning': ['Home', 'Planning'],
        '/hierarchy': ['Home', t('nav.assetHierarchy')],
        '/criticality': ['Home', t('nav.criticalityAnalysis')],
        '/fmea': ['Home', t('nav.fmea')],
        '/strategy': ['Home', t('nav.rcmStrategy')],
        '/reliability': ['Home', t('nav.reliabilityEng')],
        '/rca': ['Home', t('nav.rca')],
        '/defect-elimination': ['Home', t('nav.defectElimination')],
        '/analytics': ['Home', t('nav.analytics')],
        '/executive': ['Home', t('nav.executiveDashboard')],
        '/reports': ['Home', t('nav.reports')],
        '/sap-review': ['Home', t('nav.sapIntegration')],
        '/admin': ['Home', t('nav.administration')],
        '/profile': ['Home', t('nav.myProfile')],
    };

    const SEARCH_PAGES = [
        { path: '/', label: t('nav.dashboard'), keywords: 'home dashboard kpi summary overview inicio resumen' },
        { path: '/field-capture', label: t('nav.fieldCapture'), keywords: 'field capture voice audio inspection technician campo captura voz' },
        { path: '/work-requests', label: t('nav.workRequests'), keywords: 'work requests order request wr solicitudes trabajo' },
        { path: '/work-packages', label: t('nav.workPackages'), keywords: 'work packages sap upload paquetes' },
        { path: '/backlog', label: t('nav.backlogMgmt'), keywords: 'backlog pending overdue aging pendiente' },
        { path: '/scheduling', label: t('nav.weeklyScheduling'), keywords: 'scheduling weekly program gantt calendar planificacion semanal' },
        { path: '/planner', label: t('nav.aiPlanner'), keywords: 'ai assistant planner intelligence chat asistente' },
        { path: '/hierarchy', label: t('nav.assetHierarchy'), keywords: 'hierarchy assets equipment tree nodes plant jerarquia activos' },
        { path: '/criticality', label: t('nav.criticalityAnalysis'), keywords: 'criticality risk impact critical analysis criticidad riesgo' },
        { path: '/fmea', label: t('nav.fmea'), keywords: 'fmea fmeca failure mode effect function rpn falla modo' },
        { path: '/strategy', label: t('nav.rcmStrategy'), keywords: 'strategy rcm maintenance cbm tbm rtf estrategia' },
        { path: '/reliability', label: t('nav.reliabilityEng'), keywords: 'reliability weibull mtbf mttr availability oee confiabilidad' },
        { path: '/rca', label: t('nav.rca'), keywords: 'rca root cause analysis ishikawa 5w2h causa raiz' },
        { path: '/defect-elimination', label: t('nav.defectElimination'), keywords: 'defect elimination capa defecto eliminacion' },
        { path: '/analytics', label: t('nav.analytics'), keywords: 'analytics charts pareto costs statistics analitica' },
        { path: '/executive', label: t('nav.executiveDashboard'), keywords: 'executive management kpi radar scorecards ejecutivo' },
        { path: '/reports', label: t('nav.reports'), keywords: 'reports weekly monthly export reportes' },
        { path: '/sap-review', label: t('nav.sapIntegration'), keywords: 'sap integration orders upload pm integracion' },
        { path: '/admin', label: t('nav.administration'), keywords: 'admin settings users roles seed administracion' },
    ];

    const parts = CRUMBS[loc.pathname] || ['Home'];

    useEffect(() => {
        api.listNotifications({ plant_id: plant }).then(n => {
            const list = Array.isArray(n) ? n : [];
            setNotifCount(list.filter(x => !x.acknowledged).length || list.length);
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
        ? SEARCH_PAGES.filter(p => {
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

    return (
        <header className="bg-card border-b border-border px-6 py-3 flex items-center justify-between flex-shrink-0 sticky top-0 z-50" role="banner">
            <div className="flex items-center gap-4">
                <button className="md:hidden p-1.5 rounded-lg hover:bg-muted" onClick={onMenuToggle} aria-label="Toggle navigation menu">
                    <Menu size={22} className="text-muted-foreground" />
                </button>

                <div className="relative hidden sm:block" ref={searchRef}>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder={t('header.searchPlaceholder')}
                        value={query}
                        onChange={e => { setQuery(e.target.value); setShowResults(true); }}
                        onFocus={() => query.trim() && setShowResults(true)}
                        className="pl-9 pr-8 py-2 text-sm bg-muted border border-border rounded-lg w-72 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    />
                    {query && (
                        <button onClick={() => { setQuery(''); setShowResults(false); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5">
                            <X size={14} />
                        </button>
                    )}

                    {showResults && filteredPages.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl z-[200] overflow-hidden max-h-80 overflow-y-auto">
                            {filteredPages.map(p => (
                                <button
                                    key={p.path}
                                    onClick={() => handleSelect(p.path)}
                                    className={cn(
                                        "w-full text-left px-4 py-2.5 hover:bg-muted transition-colors flex items-center justify-between",
                                        loc.pathname === p.path && "bg-primary/5 text-primary"
                                    )}
                                >
                                    <span className="text-sm font-medium">{p.label}</span>
                                    <span className="text-xs text-muted-foreground font-mono">{p.path}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {showResults && query.trim().length > 0 && filteredPages.length === 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl z-[200] p-4 text-center text-sm text-muted-foreground">
                            {t('common.noResults', { query })}
                        </div>
                    )}
                </div>

                <nav className="hidden md:flex items-center gap-1 text-sm" aria-label="Breadcrumb">
                    {parts.map((p, i) => (
                        <span key={i} className="flex items-center gap-1">
                            {i > 0 && <span className="text-muted-foreground/50 mx-1" aria-hidden="true">›</span>}
                            <span className={cn(
                                i === parts.length - 1 ? "text-foreground font-medium" : "text-muted-foreground"
                            )}>{p}</span>
                        </span>
                    ))}
                </nav>
            </div>

            <div className="flex items-center gap-3">
                {/* Language Selector */}
                <div className="relative" ref={langRef}>
                    <button
                        onClick={() => setShowLangMenu(!showLangMenu)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-muted transition-colors text-sm font-medium text-muted-foreground hover:text-foreground border border-border"
                        aria-label={t('header.language')}
                    >
                        <Globe size={15} />
                        <span>{currentLang.flag} {currentLang.label}</span>
                    </button>
                    {showLangMenu && (
                        <div className="absolute top-full right-0 mt-1 bg-card border border-border rounded-lg shadow-xl z-[200] overflow-hidden min-w-[120px]">
                            {LANG_OPTIONS.map(opt => (
                                <button
                                    key={opt.code}
                                    onClick={() => { setLang(opt.code); setShowLangMenu(false); }}
                                    className={cn(
                                        "w-full text-left px-4 py-2.5 hover:bg-muted transition-colors flex items-center gap-2 text-sm",
                                        lang === opt.code && "bg-primary/5 text-primary font-semibold"
                                    )}
                                >
                                    <span>{opt.flag}</span>
                                    <span>{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <select
                    className="text-sm bg-muted border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    value={plant}
                    onChange={e => onPlantChange(e.target.value)}
                    aria-label={t('header.selectPlant')}
                >
                    {(plants || []).map(p => <option key={p.plant_id} value={p.plant_id}>{p.plant_id} — {p.name}</option>)}
                    {(!plants || plants.length === 0) && <option value="OCP-JFC1">OCP-JFC1 — Jorf Lasfar</option>}
                </select>

                <button
                    className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    onClick={toggleDark}
                    aria-label={dark ? t('header.lightMode') : t('header.darkMode')}
                >
                    {dark ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                <button className="p-2 rounded-lg hover:bg-muted transition-colors relative text-muted-foreground hover:text-foreground" aria-label={t('header.notifications', { count: notifCount })}>
                    <Bell size={18} />
                    {notifCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[0.6rem] rounded-full flex items-center justify-center font-bold">
                            {notifCount > 9 ? '9+' : notifCount}
                        </span>
                    )}
                </button>
            </div>
        </header>
    );
}
