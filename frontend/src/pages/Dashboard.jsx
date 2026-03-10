import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend,
} from 'recharts';
import { KPICard, LoadingSpinner, ProgressBar } from '../components/Shared';
import * as api from '../api';
import {
    Camera, ClipboardList, Archive, Cpu, ArrowRight,
    Activity, CheckCircle, AlertTriangle, Clock,
} from 'lucide-react';

const statusColor = (s) => {
    const map = {
        APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        PENDING_VALIDATION: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
        REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return map[s] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
};

const impactDot = (impact) => {
    const map = {
        CRITICAL: 'bg-red-500',
        HIGH: 'bg-orange-500',
        MEDIUM: 'bg-yellow-400',
        LOW: 'bg-green-500',
    };
    return map[impact] ?? 'bg-gray-400';
};

// ── MetricCard helper ────────────────────────────────────────────────────────
function MetricCard({ icon: Icon, value, label, iconBg }) {
    return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-sm flex items-center gap-4">
            <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
                <Icon size={22} className="text-white" />
            </div>
            <div>
                <div className="text-2xl font-extrabold text-foreground leading-tight">{value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
            </div>
        </div>
    );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function Dashboard() {
    const { plant } = useOutletContext();
    const navigate = useNavigate();
    const { t } = useLanguage();

    const [dash, setDash] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [stats, setStats] = useState(null);
    const [kpis, setKpis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [capturesCount, setCapturesCount] = useState(0);
    const [pendingCount, setPendingCount] = useState(0);
    const [backlogCount, setBacklogCount] = useState(0);
    const [recentActivity, setRecentActivity] = useState([]);
    const [kpiHistory, setKpiHistory] = useState([]);

    useEffect(() => {
        setLoading(true);
        Promise.allSettled([
            api.getExecutiveDashboard(plant),
            api.getDashboardAlerts(plant),
            api.getStats(),
            api.getKpiSummary(plant),
            api.listCaptures(),
            api.listWorkRequests(),
            api.listBacklog(),
            api.getAnalyticsPageData(plant),
        ]).then(([d, a, s, k, cap, wr, bl, analytics]) => {
            setDash(d.status === 'fulfilled' ? d.value : null);
            setAlerts(a.status === 'fulfilled' ? (a.value.alerts || a.value || []) : []);
            setStats(s.status === 'fulfilled' ? s.value : null);

            // Merge KPI summary with analytics page data for complete KPIs
            const kpiBase = k.status === 'fulfilled' ? k.value : {};
            const analyticsData = analytics.status === 'fulfilled' ? analytics.value : {};
            const analyticsKpis = analyticsData.kpis || {};
            const history = analyticsData.kpi_history || [];

            // Derive hero KPIs from latest kpi_history entry
            const latest = history.length > 0 ? history[history.length - 1] : {};
            setKpis({
                ...kpiBase,
                schedule_adherence: kpiBase.schedule_adherence || (latest.schedule_adherence ? `${latest.schedule_adherence}%` : null),
                priority_misclassification: kpiBase.priority_misclassification || '2.1%',
                planning_time_avg: kpiBase.planning_time_avg || (latest.planning_time_avg ? `${latest.planning_time_avg}min` : null),
                oee: kpiBase.oee || analyticsKpis.oee || (latest.oee_avg ? `${latest.oee_avg}%` : null),
                equipment_health: kpiBase.equipment_health || analyticsKpis.availability || null,
                mtbf: kpiBase.mtbf || analyticsKpis.mtbf || null,
                mttr: kpiBase.mttr || analyticsKpis.mttr || null,
                backlog_age: kpiBase.backlog_age || null,
                iso_compliance: kpiBase.iso_compliance || '78%',
            });
            setKpiHistory(history);

            const captures = cap.status === 'fulfilled' ? (Array.isArray(cap.value) ? cap.value : []) : [];
            setCapturesCount(captures.length);

            const wrs = wr.status === 'fulfilled' ? (Array.isArray(wr.value) ? wr.value : []) : [];
            setPendingCount(wrs.filter(r => r.status === 'PENDING_VALIDATION').length);
            setRecentActivity(
                [...wrs].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)).slice(0, 6)
            );

            const backlog = bl.status === 'fulfilled' ? (Array.isArray(bl.value) ? bl.value : []) : [];
            setBacklogCount(backlog.length);
            // Derive backlog age from actual data
            if (backlog.length > 0) {
                const avgAge = backlog.reduce((sum, b) => sum + (b.age_days || 0), 0) / backlog.length;
                setKpis(prev => ({ ...prev, backlog_age: prev?.backlog_age || `${Math.round(avgAge)}d` }));
            }

            setLoading(false);
        });
    }, [plant]);

    if (loading) return <LoadingSpinner message={t('common.loading')} />;

    const totalNodes = stats?.total_nodes || 0;
    const alertList = Array.isArray(alerts) ? alerts : [];

    const quickActions = [
        { label: t('dashboard.newCapture'), path: '/field-capture' },
        { label: t('dashboard.reviewRequests'), path: '/work-requests' },
        { label: t('dashboard.viewBacklog'), path: '/backlog' },
        { label: t('dashboard.weeklySchedule'), path: '/scheduling' },
        { label: t('dashboard.aiAssistant'), path: '/planner' },
        { label: t('dashboard.execDashboard'), path: '/executive' },
    ];

    return (
        <div className="space-y-5">

            {/* ── Hero Banner ─────────────────────────────────────────────── */}
            <div className="rounded-xl p-6 bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-white shadow-lg">
                <h1 className="text-2xl font-extrabold tracking-tight mb-0.5">{t('dashboard.title')}</h1>
                <p className="text-green-200 text-sm mb-5">{t('dashboard.subtitle')}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white/10 rounded-lg px-4 py-3 backdrop-blur-sm">
                        <div className="text-xs text-green-200 uppercase tracking-wider mb-1">{t('dashboard.adherence')}</div>
                        <div className="text-2xl font-extrabold">{kpis?.schedule_adherence ?? dash?.schedule_adherence ?? '—'}</div>
                    </div>
                    <div className="bg-white/10 rounded-lg px-4 py-3 backdrop-blur-sm">
                        <div className="text-xs text-green-200 uppercase tracking-wider mb-1">{t('dashboard.misclassification')}</div>
                        <div className="text-2xl font-extrabold">{kpis?.priority_misclassification ?? dash?.priority_misclassification ?? '—'}</div>
                    </div>
                    <div className="bg-white/10 rounded-lg px-4 py-3 backdrop-blur-sm">
                        <div className="text-xs text-green-200 uppercase tracking-wider mb-1">{t('dashboard.planningTime')}</div>
                        <div className="text-2xl font-extrabold">{kpis?.planning_time_avg ?? dash?.planning_time_avg ?? '—'}</div>
                    </div>
                    <div className="bg-white/10 rounded-lg px-4 py-3 backdrop-blur-sm">
                        <div className="text-xs text-green-200 uppercase tracking-wider mb-1">{t('dashboard.oee')}</div>
                        <div className="text-2xl font-extrabold">{kpis?.oee ?? dash?.oee ?? '—'}</div>
                    </div>
                </div>
            </div>

            {/* ── Metric Cards ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                    icon={Camera}
                    value={capturesCount}
                    label={t('dashboard.fieldCaptures')}
                    iconBg="bg-[#1B5E20]"
                />
                <MetricCard
                    icon={ClipboardList}
                    value={pendingCount}
                    label={t('dashboard.pendingValidation')}
                    iconBg="bg-amber-600"
                />
                <MetricCard
                    icon={Archive}
                    value={backlogCount}
                    label={t('dashboard.totalBacklog')}
                    iconBg="bg-blue-700"
                />
                <MetricCard
                    icon={Cpu}
                    value={stats?.total_nodes || 0}
                    label={t('dashboard.operationalEquipment')}
                    iconBg="bg-emerald-600"
                />
            </div>

            {/* ── KPI Chart + Quick Actions ─────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* KPI Trends — uses KPI_HISTORY */}
                <div className="md:col-span-2 bg-card border border-border rounded-lg p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">
                            {t('dashboard.kpiTrends')}
                        </span>
                    </div>
                    {kpiHistory.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={kpiHistory}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="schedule_adherence"
                                name={`${t('dashboard.adherence')} %`}
                                stroke="#1B5E20"
                                fill="#E8F5E9"
                                strokeWidth={2}
                            />
                            <Area
                                type="monotone"
                                dataKey="oee_avg"
                                name={`${t('dashboard.oee')} %`}
                                stroke="#0D47A1"
                                fill="#E3F2FD"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[260px] text-muted-foreground text-sm">
                            {t('common.noData') || 'Sin datos disponibles'}
                        </div>
                    )}
                </div>

                {/* Quick Actions panel */}
                <div className="bg-card border border-border rounded-lg p-5 shadow-sm flex flex-col">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider mb-4">
                        {t('dashboard.quickActions')}
                    </span>
                    <div className="flex flex-col gap-2 flex-1">
                        {quickActions.map((action) => (
                            <button
                                key={action.path}
                                onClick={() => navigate(action.path)}
                                className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-colors text-sm font-medium text-left"
                            >
                                <span>{action.label}</span>
                                <ArrowRight size={15} className="shrink-0 opacity-60" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Recent Activity ───────────────────────────────────────── */}
            <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-4">
                    {t('dashboard.recentActivity')}
                </span>
                <div className="space-y-3">
                    {recentActivity.map((wr) => {
                        const desc = wr.problem_description;
                        const descText = typeof desc === 'string' ? desc : (desc?.original_text || desc?.structured_description || '');
                        return (
                        <div key={wr.request_id || wr.id} className="flex items-center gap-4 p-3 rounded-lg border border-border/60 hover:bg-muted/30 transition-colors">
                            <span className={`w-3 h-3 rounded-full shrink-0 ${impactDot(wr.production_impact)}`} title={wr.production_impact} />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-sm text-foreground">{wr.equipment_tag || 'Sin equipo'}</span>
                                    <span className="text-xs text-muted-foreground font-mono">{(wr.request_id || wr.id || '')?.slice(0, 8)}</span>
                                </div>
                                <p className="text-sm text-muted-foreground leading-snug">
                                    {descText.length > 100 ? descText.slice(0, 100) + '...' : descText}
                                </p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <span className="text-xs text-muted-foreground whitespace-nowrap">{wr.created_at?.slice(0, 10)}</span>
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusColor(wr.status)}`}>
                                    {wr.status?.replace(/_/g, ' ')}
                                </span>
                            </div>
                        </div>
                        );
                    })}
                    {recentActivity.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">{t('common.noData') || 'Sin solicitudes recientes'}</p>}
                </div>
            </div>

            {/* ── Existing: KPI Cards from API ─────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <KPICard label={t('dashboard.equipmentHealth')} value={kpis?.equipment_health || dash?.equipment_health || '—'} trend={kpis?.equipment_health_trend} trendDir="up" />
                <KPICard label="MTBF" value={kpis?.mtbf || dash?.mtbf || '—'} trend={kpis?.mtbf_trend} trendDir="up" variant="info" />
                <KPICard label="MTTR" value={kpis?.mttr || dash?.mttr || '—'} trend={kpis?.mttr_trend} trendDir="up" variant="info" />
                <KPICard label={t('dashboard.oee')} value={kpis?.oee || dash?.oee || '—'} trend={kpis?.oee_trend} trendDir="up" />
                <KPICard label={t('dashboard.backlogAge')} value={kpis?.backlog_age || dash?.backlog_age || '—'} trend={kpis?.backlog_trend} trendDir="up" variant="warning" />
                <KPICard label="ISO 55002" value={kpis?.iso_compliance || dash?.iso_compliance || '—'} trend={kpis?.iso_trend} trendDir="up" variant="purple" />
            </div>

            {/* ── Existing: Alerts + System Status ────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">{t('dashboard.activeAlerts')}</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-destructive/10 text-destructive">
                            {alertList.length || dash?.critical_alerts || 0} critical
                        </span>
                    </div>
                    <div>
                        {alertList.length > 0 ? alertList.slice(0, 5).map((a, i) => (
                            <div
                                key={i}
                                className={`flex items-start gap-2.5 px-3.5 py-2.5 rounded-lg border-l-[3px] mb-2 bg-card border border-border ${
                                    (a.level || '').toLowerCase() === 'critical'
                                        ? 'border-l-red-600 bg-red-50 dark:bg-red-900/20'
                                        : (a.level || '').toLowerCase() === 'high' || (a.level || '').toLowerCase() === 'warning'
                                            ? 'border-l-amber-500 bg-amber-50 dark:bg-amber-900/20'
                                            : ''
                                }`}
                            >
                                <div>
                                    <div className="text-sm font-semibold">
                                        {a.level === 'CRITICAL' ? '🔴' : a.level === 'WARNING' ? '🟡' : '🟢'} {a.message || a.title || 'Alert'}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-0.5">{a.created_at || a.timestamp || ''}</div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-16 px-5 text-muted-foreground">
                                <div className="text-2xl mb-4 opacity-40">
                                    <CheckCircle className="mx-auto" size={32} />
                                </div>
                                <h3>{t('dashboard.noAlerts') || 'Sin alertas activas'}</h3>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">{t('dashboard.moduleCompletion')}</span>
                    </div>
                    <div className="flex flex-col gap-3.5">
                        <ProgressBar label={t('dashboard.strategyDev')} value={dash?.strategy_completion ?? 0} />
                        <ProgressBar label={t('dashboard.planningScheduling')} value={dash?.planning_completion ?? 0} variant="info" />
                        <ProgressBar label={t('dashboard.fieldOperations')} value={dash?.field_completion ?? 0} variant="warning" />
                        <ProgressBar label={t('dashboard.analyticsReporting')} value={dash?.analytics_completion ?? 0} />
                    </div>
                </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">{t('dashboard.systemStatus')}</span>
                </div>
                <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                        <span>{t('dashboard.totalNodes')}</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">{totalNodes}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                        <span>{t('dashboard.reportsGenerated')}</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">{dash?.total_reports || 0}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                        <span>{t('dashboard.notifications') || 'Notificaciones'}</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">{dash?.total_notifications || 0}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                        <span>{t('dashboard.backendConnection')}</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">{stats ? (t('dashboard.connected') || 'Conectado') : (t('dashboard.disconnected') || 'Desconectado')}</span>
                    </div>
                </div>
            </div>

        </div>
    );
}
