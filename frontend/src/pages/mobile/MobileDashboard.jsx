import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
    Activity, AlertTriangle, BarChart3, CheckCircle2, ChevronRight,
    Clock, FileText, Gauge, Layers, TrendingUp, Users, Wrench, Zap,
} from 'lucide-react';
import * as api from '../../api';

const fmt = (v, suffix = '') => (v != null && v !== '' && v !== '—') ? `${v}${suffix}` : '—';

const STATUS_ORDER = ['DRAFT', 'PENDING_VALIDATION', 'VALIDATED', 'APPROVED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'];
const PIPELINE_STEPS = [
    { key: 'draft', statuses: ['DRAFT'], label: 'Borrador', color: '#94A3B8', bg: '#F1F5F9' },
    { key: 'pending', statuses: ['PENDING_VALIDATION'], label: 'Revisión', color: '#F59E0B', bg: '#FFFBEB' },
    { key: 'validated', statuses: ['VALIDATED', 'APPROVED'], label: 'Aprobado', color: '#10B981', bg: '#ECFDF5' },
    { key: 'assigned', statuses: ['ASSIGNED'], label: 'Asignado', color: '#8B5CF6', bg: '#F5F3FF' },
    { key: 'execution', statuses: ['IN_PROGRESS'], label: 'Ejecución', color: '#3B82F6', bg: '#EFF6FF' },
    { key: 'done', statuses: ['COMPLETED'], label: 'Cerrado', color: '#047857', bg: '#ECFDF5' },
];

export default function MobileDashboard() {
    const { plant } = useOutletContext();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [wrs, setWrs] = useState([]);
    const [backlog, setBacklog] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [kpis, setKpis] = useState({});
    const [kpiHistory, setKpiHistory] = useState([]);
    const [techList, setTechList] = useState([]);

    useEffect(() => {
        setLoading(true);
        Promise.allSettled([
            api.listWorkRequests({ plant_id: plant }),
            api.listBacklog({ plant_id: plant }),
            api.listChecklists({ plant_id: plant }),
            api.getKpiSummary(plant),
            api.getAnalyticsPageData(plant),
            api.listTechnicians({ plant_id: plant }),
        ]).then(([wrR, blR, clR, kpiR, analyticsR, techR]) => {
            const wrList = wrR.status === 'fulfilled' ? (Array.isArray(wrR.value) ? wrR.value : wrR.value?.data || []) : [];
            setWrs(wrList);

            const blList = blR.status === 'fulfilled' ? (Array.isArray(blR.value) ? blR.value : []) : [];
            setBacklog(blList);

            const clList = clR.status === 'fulfilled' ? (Array.isArray(clR.value) ? clR.value : clR.value?.data || []) : [];
            setTasks(clList);

            const kpiBase = kpiR.status === 'fulfilled' ? kpiR.value || {} : {};
            const analytics = analyticsR.status === 'fulfilled' ? analyticsR.value || {} : {};
            const aKpis = analytics.kpis || {};
            const history = analytics.kpi_history || [];
            const latest = history.length > 0 ? history[history.length - 1] : {};

            setKpis({
                schedule_adherence: kpiBase.schedule_adherence || (latest.schedule_adherence ? `${latest.schedule_adherence}%` : null),
                oee: kpiBase.oee || aKpis.oee || (latest.oee_avg ? `${latest.oee_avg}%` : null),
                mtbf: kpiBase.mtbf || aKpis.mtbf || null,
                mttr: kpiBase.mttr || aKpis.mttr || null,
                availability: kpiBase.equipment_health || aKpis.availability || null,
                backlog_age: kpiBase.backlog_age || null,
            });
            setKpiHistory(history);

            const techs = techR.status === 'fulfilled' ? (Array.isArray(techR.value) ? techR.value : []) : [];
            setTechList(techs);

            // Derive backlog age if not from KPI
            if (blList.length > 0 && !kpiBase.backlog_age) {
                const avgAge = blList.reduce((s, b) => s + (b.age_days || 0), 0) / blList.length;
                setKpis(prev => ({ ...prev, backlog_age: prev.backlog_age || `${Math.round(avgAge)}d` }));
            }

            setLoading(false);
        });
    }, [plant]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-3 border-t-emerald-600 border-gray-200 rounded-full animate-spin" />
            </div>
        );
    }

    // ── Derived metrics ──
    const total = wrs.length;
    const pendingAction = wrs.filter(wr => wr.status === 'PENDING_VALIDATION' || wr.status === 'DRAFT').length;
    const inExecution = wrs.filter(wr => ['IN_PROGRESS', 'ASSIGNED'].includes(wr.status)).length;
    const completed = wrs.filter(wr => wr.status === 'COMPLETED').length;
    const rejected = wrs.filter(wr => wr.status === 'REJECTED').length;
    const delayed = wrs.filter(wr => {
        if (!wr.created_at) return false;
        const age = (Date.now() - new Date(wr.created_at).getTime()) / (1000 * 60 * 60 * 24);
        return age > 7 && !['COMPLETED', 'REJECTED'].includes(wr.status);
    }).length;
    const unassigned = wrs.filter(wr =>
        !wr.assigned_to && !['COMPLETED', 'REJECTED', 'DRAFT'].includes(wr.status)
    ).length;

    // Pipeline counts
    const pipeline = PIPELINE_STEPS.map(step => ({
        ...step,
        count: wrs.filter(wr => step.statuses.includes(wr.status)).length,
    }));
    const pipelineMax = Math.max(...pipeline.map(p => p.count), 1);

    // Task execution metrics
    const tasksInProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const tasksCompleted = tasks.filter(t => t.status === 'COMPLETED').length;
    const totalTasks = tasks.length || 1;
    const taskCompletion = Math.round((tasksCompleted / totalTasks) * 100);

    // Team workload from assigned WRs
    const teamMap = {};
    wrs.forEach(wr => {
        const workers = (wr.validation || wr)?.assigned_workers || [];
        const name = wr.assigned_to_name;
        if (workers.length > 0) {
            workers.forEach(w => {
                if (!teamMap[w.worker_id]) teamMap[w.worker_id] = { name: w.name, specialty: w.specialty || '', count: 0 };
                teamMap[w.worker_id].count++;
            });
        } else if (name) {
            const key = wr.assigned_to || name;
            if (!teamMap[key]) teamMap[key] = { name, specialty: '', count: 0 };
            teamMap[key].count++;
        }
    });
    const teamWorkload = Object.values(teamMap).sort((a, b) => b.count - a.count).slice(0, 6);

    // Recent WRs (last 5)
    const recent = [...wrs]
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
        .slice(0, 5);

    // KPI trend (simple: last 3 history entries)
    const trendData = kpiHistory.slice(-3);

    const today = new Date();
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const dateStr = `${dayNames[today.getDay()]}, ${today.getDate()} ${monthNames[today.getMonth()]} ${today.getFullYear()}`;

    return (
        <div className="min-h-screen pb-28" style={{ backgroundColor: '#F8FAFC' }}>
            {/* ── HEADER ── */}
            <div className="bg-gradient-to-br from-emerald-800 to-emerald-900 p-5 pb-6">
                <div className="text-xs font-medium mb-1" style={{ color: '#A7F3D0' }}>{dateStr}</div>
                <h1 className="text-xl font-bold text-white mb-4">Dashboard Operacional</h1>

                {/* KPI Strip */}
                <div className="grid grid-cols-2 gap-2.5">
                    <KpiTile icon={Gauge} label="Adherencia" value={fmt(kpis.schedule_adherence)} color="#34D399" />
                    <KpiTile icon={Activity} label="OEE" value={fmt(kpis.oee)} color="#60A5FA" />
                    <KpiTile icon={TrendingUp} label="MTBF" value={fmt(kpis.mtbf)} color="#FBBF24" />
                    <KpiTile icon={Clock} label="MTTR" value={fmt(kpis.mttr)} color="#F87171" />
                </div>
            </div>

            <div className="p-4 space-y-5" style={{ marginTop: '-0.5rem' }}>

                {/* ── ALERT STRIP ── */}
                {(delayed > 0 || unassigned > 0) && (
                    <div className="flex gap-3">
                        {delayed > 0 && (
                            <button
                                onClick={() => navigate('/m/avisos?filter=delayed')}
                                className="flex-1 flex items-center gap-2.5 p-3 rounded-2xl border-2 active:scale-95 transition-all"
                                style={{ backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' }}
                            >
                                <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: '#EF4444' }} />
                                <div>
                                    <div className="text-lg font-bold" style={{ color: '#991B1B' }}>{delayed}</div>
                                    <div className="text-xs font-medium" style={{ color: '#B91C1C' }}>Con Retraso</div>
                                </div>
                            </button>
                        )}
                        {unassigned > 0 && (
                            <button
                                onClick={() => navigate('/m/avisos?filter=unassigned')}
                                className="flex-1 flex items-center gap-2.5 p-3 rounded-2xl border-2 active:scale-95 transition-all"
                                style={{ backgroundColor: '#FFF7ED', borderColor: '#FDBA74' }}
                            >
                                <Users className="w-5 h-5 flex-shrink-0" style={{ color: '#F97316' }} />
                                <div>
                                    <div className="text-lg font-bold" style={{ color: '#9A3412' }}>{unassigned}</div>
                                    <div className="text-xs font-medium" style={{ color: '#C2410C' }}>Sin Asignar</div>
                                </div>
                            </button>
                        )}
                    </div>
                )}

                {/* ── WR PIPELINE ── */}
                <div className="bg-white rounded-2xl p-4 border" style={{ borderColor: '#E2E8F0' }}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4" style={{ color: '#047857' }} />
                            <span className="text-sm font-bold" style={{ color: '#0F172A' }}>Pipeline WR</span>
                        </div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#ECFDF5', color: '#047857' }}>
                            {total} total
                        </span>
                    </div>
                    <div className="space-y-2.5">
                        {pipeline.map(step => (
                            <button
                                key={step.key}
                                onClick={() => navigate('/m/avisos')}
                                className="w-full flex items-center gap-3 active:scale-98 transition-all"
                            >
                                <div className="w-16 text-xs font-medium text-right" style={{ color: '#64748B' }}>
                                    {step.label}
                                </div>
                                <div className="flex-1 h-6 rounded-full overflow-hidden" style={{ backgroundColor: '#F1F5F9' }}>
                                    <div
                                        className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                                        style={{
                                            width: `${Math.max((step.count / pipelineMax) * 100, step.count > 0 ? 15 : 0)}%`,
                                            backgroundColor: step.color,
                                            minWidth: step.count > 0 ? '2rem' : 0,
                                        }}
                                    >
                                        {step.count > 0 && (
                                            <span className="text-xs font-bold text-white">{step.count}</span>
                                        )}
                                    </div>
                                </div>
                                {step.count === 0 && (
                                    <span className="text-xs font-medium w-6 text-center" style={{ color: '#CBD5E1' }}>0</span>
                                )}
                            </button>
                        ))}
                    </div>
                    {rejected > 0 && (
                        <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: '#FEF2F2' }}>
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#EF4444' }} />
                            <span className="text-xs font-medium" style={{ color: '#991B1B' }}>{rejected} rechazado{rejected > 1 ? 's' : ''}</span>
                        </div>
                    )}
                </div>

                {/* ── EXECUTION METRICS ── */}
                <div className="grid grid-cols-3 gap-3">
                    <MetricCard
                        icon={Wrench}
                        value={tasksInProgress}
                        label="En Ejecución"
                        color="#3B82F6"
                        onClick={() => navigate('/m/tareas')}
                    />
                    <MetricCard
                        icon={CheckCircle2}
                        value={tasksCompleted}
                        label="Completadas"
                        color="#10B981"
                        onClick={() => navigate('/m/tareas')}
                    />
                    <MetricCard
                        icon={BarChart3}
                        value={`${taskCompletion}%`}
                        label="Cumplimiento"
                        color={taskCompletion >= 80 ? '#10B981' : taskCompletion >= 50 ? '#F59E0B' : '#EF4444'}
                        onClick={() => navigate('/m/tareas')}
                    />
                </div>

                {/* ── BACKLOG ── */}
                <button onClick={() => navigate('/backlog')} className="w-full text-left bg-white rounded-2xl p-4 border active:scale-98 transition-all" style={{ borderColor: '#E2E8F0' }}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" style={{ color: '#3B82F6' }} />
                            <span className="text-sm font-bold" style={{ color: '#0F172A' }}>Backlog</span>
                        </div>
                        <span className="text-xs font-semibold flex items-center gap-1" style={{ color: '#047857' }}>
                            View all <ChevronRight className="w-3 h-3" />
                        </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 rounded-xl" style={{ backgroundColor: '#EFF6FF' }}>
                            <div className="text-xl font-bold" style={{ color: '#1E40AF' }}>{backlog.length}</div>
                            <div className="text-xs font-medium" style={{ color: '#3B82F6' }}>Items</div>
                        </div>
                        <div className="text-center p-3 rounded-xl" style={{ backgroundColor: '#FFF7ED' }}>
                            <div className="text-xl font-bold" style={{ color: '#9A3412' }}>{fmt(kpis.backlog_age)}</div>
                            <div className="text-xs font-medium" style={{ color: '#EA580C' }}>Edad Prom.</div>
                        </div>
                        <div className="text-center p-3 rounded-xl" style={{ backgroundColor: '#FEF2F2' }}>
                            <div className="text-xl font-bold" style={{ color: '#991B1B' }}>
                                {backlog.filter(b => b.priority === 'P1' || b.priority === 'CRITICAL').length}
                            </div>
                            <div className="text-xs font-medium" style={{ color: '#EF4444' }}>Críticos</div>
                        </div>
                    </div>
                </button>

                {/* ── KPI TREND ── */}
                {trendData.length > 0 && (
                    <div className="bg-white rounded-2xl p-4 border" style={{ borderColor: '#E2E8F0' }}>
                        <div className="flex items-center gap-2 mb-3">
                            <TrendingUp className="w-4 h-4" style={{ color: '#047857' }} />
                            <span className="text-sm font-bold" style={{ color: '#0F172A' }}>Trend KPIs</span>
                        </div>
                        <div className="space-y-3">
                            {trendData.map((entry, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-12 text-xs font-medium" style={{ color: '#64748B' }}>
                                        {entry.month || `M${i + 1}`}
                                    </div>
                                    <div className="flex-1 space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs w-14" style={{ color: '#047857' }}>Adher.</span>
                                            <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: '#E2E8F0' }}>
                                                <div className="h-full rounded-full" style={{
                                                    width: `${Math.min(entry.schedule_adherence || 0, 100)}%`,
                                                    backgroundColor: '#10B981',
                                                }} />
                                            </div>
                                            <span className="text-xs font-bold w-10 text-right" style={{ color: '#047857' }}>
                                                {entry.schedule_adherence || 0}%
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs w-14" style={{ color: '#1E40AF' }}>OEE</span>
                                            <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: '#E2E8F0' }}>
                                                <div className="h-full rounded-full" style={{
                                                    width: `${Math.min(entry.oee_avg || 0, 100)}%`,
                                                    backgroundColor: '#3B82F6',
                                                }} />
                                            </div>
                                            <span className="text-xs font-bold w-10 text-right" style={{ color: '#1E40AF' }}>
                                                {entry.oee_avg || 0}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── TEAM WORKLOAD ── */}
                {teamWorkload.length > 0 && (
                    <div className="bg-white rounded-2xl p-4 border" style={{ borderColor: '#E2E8F0' }}>
                        <div className="flex items-center gap-2 mb-3">
                            <Users className="w-4 h-4" style={{ color: '#7C3AED' }} />
                            <span className="text-sm font-bold" style={{ color: '#0F172A' }}>Carga de Trabajo</span>
                        </div>
                        <div className="space-y-2">
                            {teamWorkload.map((member, i) => (
                                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ backgroundColor: '#FAFAFA' }}>
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                        style={{ backgroundColor: '#EDE9FE', color: '#7C3AED' }}>
                                        {(member.name || '?')[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-semibold truncate" style={{ color: '#0F172A' }}>{member.name}</div>
                                        {member.specialty && (
                                            <div className="text-xs" style={{ color: '#64748B' }}>{member.specialty}</div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-sm font-bold" style={{ color: '#7C3AED' }}>{member.count}</span>
                                        <span className="text-xs" style={{ color: '#94A3B8' }}>WR</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── RECENT ACTIVITY ── */}
                {recent.length > 0 && (
                    <div className="bg-white rounded-2xl p-4 border" style={{ borderColor: '#E2E8F0' }}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4" style={{ color: '#F59E0B' }} />
                                <span className="text-sm font-bold" style={{ color: '#0F172A' }}>Actividad Reciente</span>
                            </div>
                            <button
                                onClick={() => navigate('/m/avisos')}
                                className="text-xs font-semibold flex items-center gap-1"
                                style={{ color: '#047857' }}
                            >
                                Ver Avisos <ChevronRight className="w-3 h-3" />
                            </button>
                        </div>
                        <div className="space-y-2">
                            {recent.map(wr => (
                                <button
                                    key={wr.request_id}
                                    onClick={() => navigate(`/m/wr/${wr.request_id}`)}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl text-left active:scale-98 transition-all"
                                    style={{ backgroundColor: '#FAFAFA' }}
                                >
                                    <StatusDot status={wr.status} />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-semibold truncate" style={{ color: '#0F172A' }}>
                                            {wr.equipment_tag || wr.equipment_name || 'Sin equipo'}
                                        </div>
                                        <div className="text-xs truncate" style={{ color: '#64748B' }}>
                                            {typeof wr.problem_description === 'string'
                                                ? wr.problem_description.slice(0, 60)
                                                : (wr.problem_description?.original_text || '').slice(0, 60)}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                        <StatusBadge status={wr.status} />
                                        <span className="text-xs" style={{ color: '#94A3B8' }}>
                                            {wr.created_at ? new Date(wr.created_at).toLocaleDateString('es', { day: '2-digit', month: '2-digit' }) : ''}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── QUICK ACTIONS ── */}
                <div className="grid grid-cols-2 gap-3">
                    <QuickAction
                        icon={FileText}
                        label="Avisos"
                        count={pendingAction}
                        countLabel="pendientes"
                        color="#F59E0B"
                        bg="#FFFBEB"
                        border="#FDE68A"
                        onClick={() => navigate('/m/avisos')}
                    />
                    <QuickAction
                        icon={Wrench}
                        label="Tareas"
                        count={tasksInProgress}
                        countLabel="en curso"
                        color="#3B82F6"
                        bg="#EFF6FF"
                        border="#BFDBFE"
                        onClick={() => navigate('/m/tareas')}
                    />
                </div>
            </div>
        </div>
    );
}

// ── Sub-components ──

function KpiTile({ icon: Icon, label, value, color, onClick }) {
    const Tag = onClick ? 'button' : 'div';
    return (
        <Tag
            onClick={onClick}
            className={`rounded-xl p-3 flex items-center gap-3 text-left ${onClick ? 'active:scale-95 transition-all' : ''}`}
            style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
        >
            <Icon className="w-5 h-5 flex-shrink-0" style={{ color }} />
            <div>
                <div className="text-lg font-bold text-white leading-tight">{value}</div>
                <div className="text-xs font-medium" style={{ color: '#A7F3D0' }}>{label}</div>
            </div>
        </Tag>
    );
}

function MetricCard({ icon: Icon, value, label, color, onClick }) {
    const Tag = onClick ? 'button' : 'div';
    return (
        <Tag
            onClick={onClick}
            className={`bg-white rounded-2xl p-3.5 border text-center ${onClick ? 'active:scale-95 transition-all' : ''}`}
            style={{ borderColor: '#E2E8F0' }}
        >
            <Icon className="w-5 h-5 mx-auto mb-1.5" style={{ color }} />
            <div className="text-xl font-bold" style={{ color }}>{value}</div>
            <div className="text-xs font-medium mt-0.5" style={{ color: '#64748B' }}>{label}</div>
        </Tag>
    );
}

function QuickAction({ icon: Icon, label, count, countLabel, color, bg, border, onClick }) {
    return (
        <button
            onClick={onClick}
            className="rounded-2xl p-4 border-2 text-left transition-all active:scale-95"
            style={{ backgroundColor: bg, borderColor: border }}
        >
            <Icon className="w-5 h-5 mb-2" style={{ color }} />
            <div className="text-sm font-bold mb-1" style={{ color: '#0F172A' }}>{label}</div>
            {count > 0 && (
                <div className="text-xs font-semibold" style={{ color }}>
                    {count} {countLabel}
                </div>
            )}
        </button>
    );
}

const STATUS_COLORS = {
    DRAFT: '#94A3B8',
    PENDING_VALIDATION: '#F59E0B',
    VALIDATED: '#10B981',
    APPROVED: '#10B981',
    ASSIGNED: '#8B5CF6',
    IN_PROGRESS: '#3B82F6',
    COMPLETED: '#047857',
    REJECTED: '#EF4444',
};

const STATUS_LABELS = {
    DRAFT: 'Borrador',
    PENDING_VALIDATION: 'Revisión',
    VALIDATED: 'Validado',
    APPROVED: 'Aprobado',
    ASSIGNED: 'Asignado',
    IN_PROGRESS: 'En Ejecución',
    COMPLETED: 'Completado',
    REJECTED: 'Rechazado',
    OT_CREADA: 'OT Creada',
    PENDING: 'Pendiente',
    PAUSED: 'Pausada',
    CLOSED: 'Cerrado',
    CANCELLED: 'Cancelado',
};

function StatusDot({ status }) {
    return (
        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: STATUS_COLORS[status] || '#94A3B8' }} />
    );
}

function StatusBadge({ status }) {
    const color = STATUS_COLORS[status] || '#94A3B8';
    return (
        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: color + '15', color }}>
            {STATUS_LABELS[status] || status}
        </span>
    );
}
