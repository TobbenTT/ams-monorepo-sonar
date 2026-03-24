import { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { KPICard, PriorityBadge, StatusBadge, DataTable, LoadingSpinner } from '../components/Shared';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import {
  X, ChevronRight, Wrench, Clock, Package, AlertTriangle, Calendar,
  Play, Loader2, ArrowRight, FileText, Users, CheckCircle, XCircle, Zap
} from 'lucide-react';
import * as api from '../api';

const COLORS = ['#C62828', '#E65100', '#F57F17', '#1B5E20'];

export default function Planning() {
    const { plant } = useOutletContext();
    const toast = useToast();
    const { t } = useLanguage();
    const [backlog, setBacklog] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('backlog');
    const [programs, setPrograms] = useState([]);
    const [workRequests, setWorkRequests] = useState([]);
    const [managedWOs, setManagedWOs] = useState([]);
    const [selectedWr, setSelectedWr] = useState('');
    const [recommendation, setRecommendation] = useState(null);
    const [generating, setGenerating] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    // Detail panel
    const [selectedItem, setSelectedItem] = useState(null);
    const [creatingOT, setCreatingOT] = useState(false);
    const [statusFilter, setStatusFilter] = useState('ALL');

    const fetchAll = () => {
        setLoading(true);
        Promise.allSettled([
            api.listBacklog(),
            api.listPrograms({ plant_id: plant }),
            api.listWorkRequests({ plant_id: plant }),
            api.listManagedWOs({ plant_id: plant }),
        ]).then(([b, p, w, wo]) => {
            setBacklog(b.status === 'fulfilled' ? (Array.isArray(b.value) ? b.value : b.value?.items || []) : []);
            setPrograms(p.status === 'fulfilled' ? (Array.isArray(p.value) ? p.value : []) : []);
            setWorkRequests(w.status === 'fulfilled' ? (Array.isArray(w.value) ? w.value : w.value?.items || []) : []);
            setManagedWOs(wo.status === 'fulfilled' ? (Array.isArray(wo.value) ? wo.value : wo.value?.items || []) : []);
            setLoading(false);
        });
    };

    useEffect(() => { fetchAll(); }, [plant]);

    // ── AI Planner ──
    const handleGenerateRec = async () => {
        if (!selectedWr) return;
        setGenerating(true);
        try {
            const res = await api.generateRecommendation(selectedWr);
            setRecommendation(res);
            toast.success(t('planning.aiRecommendationGenerated'));
        } catch (e) {
            toast.error(t('planning.recommendationFailed') + e.message);
        }
        setGenerating(false);
    };

    const handlePlannerAction = async (action) => {
        if (!selectedWr || !recommendation) return;
        setActionLoading(action);
        try {
            await api.applyRecommendationAction(recommendation.recommendation_id || selectedWr, { action });
            toast.success(`${action} aplicado correctamente`);
            if (action === 'APPROVE') {
                toast.info('WR aprobada — lista para crear OT');
            } else if (action === 'ESCALATE') {
                toast.info('WR escalada a gerencia para decisión');
            } else if (action === 'DEFER') {
                toast.info('WR diferida — se mantiene en backlog con prioridad baja');
            }
        } catch (e) {
            toast.error('Error: ' + e.message);
        }
        setActionLoading(null);
    };

    // ── Create OT from backlog/WR ──
    const handleCreateOT = async (item) => {
        setCreatingOT(true);
        try {
            const wrId = item.work_request_id || item.request_id || item.source_wr_id;
            let result;
            if (wrId) {
                result = await api.createWOFromWR({ work_request_id: wrId });
            } else {
                result = await api.createManagedWO({
                    plant_id: plant,
                    equipment_tag: item.equipment_tag || '',
                    description: item.description || item.problem_description || '',
                    priority: item.priority || 'P3',
                    work_order_type: item.work_order_type || 'PM02',
                    estimated_duration_hours: item.estimated_duration_hours || 4,
                });
            }
            const woNum = result?.wo_number || result?.work_order_id || '';
            toast.success(`OT ${woNum} creada exitosamente`);
            fetchAll();
            setSelectedItem(null);
        } catch (e) {
            toast.error('Error creando OT: ' + e.message);
        }
        setCreatingOT(false);
    };

    // ── Release OT → Scheduling ──
    const handleReleaseOT = async (woId) => {
        setActionLoading('release-' + woId);
        try {
            await api.releaseManagedWO(woId);
            toast.success('OT liberada → lista para Scheduling');
            fetchAll();
        } catch (e) {
            toast.error('Error: ' + e.message);
        }
        setActionLoading(null);
    };

    // ── Schedule OT ──
    const handleScheduleOT = async (woId) => {
        setActionLoading('schedule-' + woId);
        try {
            await api.scheduleManagedWO(woId, {});
            toast.success('OT programada exitosamente');
            fetchAll();
        } catch (e) {
            toast.error('Error: ' + e.message);
        }
        setActionLoading(null);
    };

    // ── Create Weekly Program ──
    const handleCreateProgram = async () => {
        setActionLoading('create-program');
        try {
            const now = new Date();
            const weekNum = Math.ceil(((now - new Date(now.getFullYear(), 0, 1)) / 86400000 + 1) / 7);
            await api.createProgram({
                plant_id: plant,
                week_number: weekNum + 1,
                year: now.getFullYear(),
                status: 'DRAFT',
            });
            toast.success(`Programa Semana ${weekNum + 1} creado`);
            fetchAll();
        } catch (e) {
            toast.error('Error: ' + e.message);
        }
        setActionLoading(null);
    };

    // ── Computed data ──
    const stratification = useMemo(() => ({
        AWAITING_MATERIALS: backlog.filter(b => b.status === 'AWAITING_MATERIALS').length,
        AWAITING_SHUTDOWN: backlog.filter(b => b.status === 'AWAITING_SHUTDOWN').length,
        AWAITING_RESOURCES: backlog.filter(b => b.status === 'AWAITING_RESOURCES').length,
        SCHEDULABLE: backlog.filter(b => b.status === 'SCHEDULED' || b.status === 'IN_PROGRESS' || b.materials_ready).length,
    }), [backlog]);

    const priorityData = useMemo(() => [
        { name: t('planning.emergency'), value: backlog.filter(b => String(b.priority).startsWith('1') || b.priority === 'P1').length },
        { name: t('planning.urgent'), value: backlog.filter(b => String(b.priority).startsWith('2') || b.priority === 'P2').length },
        { name: t('planning.normal'), value: backlog.filter(b => String(b.priority).startsWith('3') || b.priority === 'P3').length },
        { name: t('planning.planned'), value: backlog.filter(b => String(b.priority).startsWith('4') || b.priority === 'P4').length },
    ], [backlog, t]);

    const agingData = useMemo(() => [
        { range: '0-7d', count: backlog.filter(b => (b.age_days || 0) <= 7).length },
        { range: '8-14d', count: backlog.filter(b => (b.age_days || 0) > 7 && (b.age_days || 0) <= 14).length },
        { range: '15-30d', count: backlog.filter(b => (b.age_days || 0) > 14 && (b.age_days || 0) <= 30).length },
        { range: '30d+', count: backlog.filter(b => (b.age_days || 0) > 30).length },
    ], [backlog]);

    const filteredBacklog = useMemo(() => {
        if (statusFilter === 'ALL') return backlog;
        if (statusFilter === 'SCHEDULABLE') return backlog.filter(b => b.materials_ready || b.status === 'SCHEDULED' || b.status === 'IN_PROGRESS');
        return backlog.filter(b => b.status === statusFilter);
    }, [backlog, statusFilter]);

    // OTs in planning phase (DRAFT/PLANNED) — ready to release
    const planningOTs = useMemo(() =>
        managedWOs.filter(wo => ['DRAFT', 'PLANNED'].includes(wo.status)),
    [managedWOs]);

    const columns = [
        { key: 'backlog_id', label: t('planning.colId'), mono: true, render: r => (r.backlog_id || r.work_request_id || '').slice(0, 8) },
        { key: 'equipment_tag', label: t('planning.colEquipment'), mono: true },
        { key: 'work_order_type', label: t('planning.colType'), render: r => <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-medium">{r.work_order_type || '—'}</span> },
        { key: 'priority', label: t('planning.colPriority'), render: r => <PriorityBadge priority={r.priority} /> },
        { key: 'age_days', label: t('planning.colAge'), render: r => {
            const days = r.age_days || 0;
            return <span className={days > 30 ? 'text-red-600 font-bold' : days > 14 ? 'text-orange-600 font-medium' : ''}>{days} {t('planning.days')}</span>;
        }},
        { key: 'status', label: t('planning.colStatus'), render: r => <StatusBadge status={r.status} /> },
        { key: 'materials_ready', label: t('planning.colMaterials'), render: r => r.materials_ready ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-400" /> },
        { key: 'estimated_duration_hours', label: t('planning.colDuration'), render: r => `${r.estimated_duration_hours || 0}h` },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold text-foreground mb-5">{t('planning.title')}</h1>

            <div className="flex gap-1 border-b border-border mb-4" role="tablist">
                {[
                    { id: 'backlog', label: t('planning.tabBacklog'), count: backlog.length },
                    { id: 'ots', label: 'OTs en Planificación', count: planningOTs.length },
                    { id: 'schedule', label: t('planning.tabSchedule'), count: programs.length },
                    { id: 'planner', label: t('planning.tabPlanner') },
                ].map(tb => (
                    <button
                        key={tb.id}
                        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
                            tab === tb.id
                                ? 'bg-card border border-border border-b-card text-primary font-semibold'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                        onClick={() => { setTab(tb.id); setSelectedItem(null); }}
                        role="tab"
                        aria-selected={tab === tb.id}
                    >
                        {tb.label}
                        {tb.count > 0 && (
                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                                tab === tb.id ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'
                            }`}>{tb.count}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* ═══ BACKLOG TAB ═══ */}
            {tab === 'backlog' && (
                <>
                    {/* KPI Row */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-5">
                        <div className="cursor-pointer" onClick={() => setStatusFilter('AWAITING_MATERIALS')}>
                            <KPICard label={t('planning.awaitingMaterials')} value={stratification.AWAITING_MATERIALS} variant="warning" />
                        </div>
                        <div className="cursor-pointer" onClick={() => setStatusFilter('AWAITING_SHUTDOWN')}>
                            <KPICard label={t('planning.awaitingShutdown')} value={stratification.AWAITING_SHUTDOWN} variant="danger" />
                        </div>
                        <div className="cursor-pointer" onClick={() => setStatusFilter('AWAITING_RESOURCES')}>
                            <KPICard label={t('planning.awaitingResources')} value={stratification.AWAITING_RESOURCES} variant="info" />
                        </div>
                        <div className="cursor-pointer" onClick={() => setStatusFilter('SCHEDULABLE')}>
                            <KPICard label={t('planning.schedulableNow')} value={stratification.SCHEDULABLE} />
                        </div>
                        <div className="cursor-pointer" onClick={() => setStatusFilter('ALL')}>
                            <KPICard label={t('planning.totalBacklog')} value={backlog.length} variant="" />
                        </div>
                    </div>

                    {/* Status filter chips */}
                    {statusFilter !== 'ALL' && (
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs text-muted-foreground">Filtro:</span>
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                {statusFilter === 'SCHEDULABLE' ? 'Programables' : statusFilter.replace(/_/g, ' ')}
                                <button onClick={() => setStatusFilter('ALL')} className="hover:bg-primary/20 rounded-full p-0.5">
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                            <span className="text-xs text-muted-foreground">{filteredBacklog.length} items</span>
                        </div>
                    )}

                    {/* Backlog table + detail panel */}
                    <div className="flex gap-4">
                        <div className={`bg-card border border-border rounded-lg p-5 shadow-sm transition-all ${selectedItem ? 'flex-1' : 'w-full'}`}>
                            {loading ? <LoadingSpinner /> : (
                                <DataTable
                                    columns={columns}
                                    data={filteredBacklog}
                                    emptyMsg={t('planning.noBacklogItems')}
                                    sortable
                                    onRowClick={(row) => setSelectedItem(row)}
                                />
                            )}
                        </div>

                        {/* Detail panel */}
                        {selectedItem && (
                            <div className="w-96 bg-card border border-border rounded-lg shadow-lg flex-shrink-0 overflow-hidden">
                                {/* Header */}
                                <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-mono opacity-80">{(selectedItem.backlog_id || selectedItem.work_request_id || '').slice(0, 12)}</span>
                                        <button onClick={() => setSelectedItem(null)} className="p-1 hover:bg-white/20 rounded">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <h3 className="font-bold text-sm">{selectedItem.equipment_tag || 'Sin equipo'}</h3>
                                    <p className="text-xs opacity-90 mt-1 line-clamp-2">{selectedItem.description || selectedItem.problem_description || '—'}</p>
                                </div>

                                {/* Details */}
                                <div className="p-4 space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground" />
                                            <div>
                                                <p className="text-[10px] uppercase text-muted-foreground">Prioridad</p>
                                                <PriorityBadge priority={selectedItem.priority} />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                            <div>
                                                <p className="text-[10px] uppercase text-muted-foreground">Antigüedad</p>
                                                <span className={`text-sm font-bold ${(selectedItem.age_days || 0) > 30 ? 'text-red-600' : ''}`}>
                                                    {selectedItem.age_days || 0} días
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Wrench className="w-3.5 h-3.5 text-muted-foreground" />
                                            <div>
                                                <p className="text-[10px] uppercase text-muted-foreground">Tipo</p>
                                                <span className="text-sm font-medium">{selectedItem.work_order_type || '—'}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Package className="w-3.5 h-3.5 text-muted-foreground" />
                                            <div>
                                                <p className="text-[10px] uppercase text-muted-foreground">Materiales</p>
                                                {selectedItem.materials_ready
                                                    ? <span className="text-xs font-medium text-green-600">Listos</span>
                                                    : <span className="text-xs font-medium text-red-500">Pendientes</span>
                                                }
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                                        <div>
                                            <p className="text-[10px] uppercase text-muted-foreground">Status</p>
                                            <StatusBadge status={selectedItem.status} />
                                        </div>
                                    </div>

                                    {selectedItem.estimated_duration_hours > 0 && (
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                            <div>
                                                <p className="text-[10px] uppercase text-muted-foreground">Duración Estimada</p>
                                                <span className="text-sm font-medium">{selectedItem.estimated_duration_hours}h</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="border-t pt-3 space-y-2">
                                        <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Acciones</p>

                                        <button
                                            onClick={() => handleCreateOT(selectedItem)}
                                            disabled={creatingOT}
                                            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                        >
                                            {creatingOT
                                                ? <><Loader2 className="w-4 h-4 animate-spin" /> Creando OT...</>
                                                : <><Zap className="w-4 h-4" /> Crear Orden de Trabajo</>
                                            }
                                        </button>

                                        <button
                                            onClick={() => {
                                                setTab('planner');
                                                const wrId = selectedItem.work_request_id || selectedItem.request_id || selectedItem.source_wr_id || '';
                                                setSelectedWr(wrId);
                                                setSelectedItem(null);
                                            }}
                                            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                                        >
                                            <FileText className="w-4 h-4" /> AI Planner
                                        </button>

                                        <button
                                            onClick={async () => {
                                                const wrId = selectedItem.work_request_id || selectedItem.request_id;
                                                if (!wrId) { toast.error('Sin WR vinculada'); return; }
                                                setActionLoading('defer');
                                                try {
                                                    await api.updateWorkRequest(wrId, { priority_requested: 'P4' });
                                                    toast.info('Item diferido — prioridad bajada a P4');
                                                    fetchAll();
                                                    setSelectedItem(null);
                                                } catch (e) { toast.error('Error: ' + e.message); }
                                                setActionLoading(null);
                                            }}
                                            disabled={actionLoading === 'defer'}
                                            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                        >
                                            {actionLoading === 'defer' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                                            Diferir
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                        <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                            <div className="text-xs font-bold text-primary uppercase tracking-wider mb-3">{t('planning.backlogAging')}</div>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={agingData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                                    <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#1B5E20" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                            <div className="text-xs font-bold text-primary uppercase tracking-wider mb-3">{t('planning.priorityDistribution')}</div>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={priorityData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}>
                                        {priorityData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </>
            )}

            {/* ═══ OTs EN PLANIFICACIÓN TAB ═══ */}
            {tab === 'ots' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            OTs en estado DRAFT o PLANNED — necesitan ser completadas y liberadas para pasar a Scheduling
                        </p>
                    </div>

                    {planningOTs.length === 0 ? (
                        <div className="bg-card border border-border rounded-lg text-center py-16 px-5 text-muted-foreground shadow-sm">
                            <div className="text-5xl mb-4 opacity-40">📋</div>
                            <h3 className="text-base font-semibold mb-1">No hay OTs en planificación</h3>
                            <p className="text-sm">Crea una OT desde el Backlog o desde un Aviso para comenzar</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {planningOTs.map(wo => (
                                <div key={wo.work_order_id || wo.wo_number} className="bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="font-mono text-sm font-bold text-primary">{wo.wo_number || (wo.work_order_id || '').slice(0, 8)}</span>
                                                <StatusBadge status={wo.status} />
                                                <PriorityBadge priority={wo.priority} />
                                                {wo.work_order_type && (
                                                    <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-medium">{wo.work_order_type}</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-foreground mb-1">
                                                <span className="font-medium">{wo.equipment_tag || '—'}</span>
                                                {wo.description && <span className="text-muted-foreground"> — {wo.description.slice(0, 80)}</span>}
                                            </p>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                {wo.estimated_duration_hours > 0 && (
                                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {wo.estimated_duration_hours}h</span>
                                                )}
                                                {wo.assigned_workers?.length > 0 && (
                                                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {wo.assigned_workers.length} técnicos</span>
                                                )}
                                                {wo.operations?.length > 0 && (
                                                    <span className="flex items-center gap-1"><Wrench className="w-3 h-3" /> {wo.operations.length} operaciones</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 ml-4">
                                            {wo.status === 'DRAFT' && (
                                                <button
                                                    onClick={() => handleReleaseOT(wo.work_order_id)}
                                                    disabled={actionLoading === 'release-' + wo.work_order_id}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                                                >
                                                    {actionLoading === 'release-' + wo.work_order_id
                                                        ? <Loader2 className="w-3 h-3 animate-spin" />
                                                        : <ArrowRight className="w-3 h-3" />
                                                    }
                                                    Liberar
                                                </button>
                                            )}
                                            {wo.status === 'PLANNED' && (
                                                <button
                                                    onClick={() => handleReleaseOT(wo.work_order_id)}
                                                    disabled={actionLoading === 'release-' + wo.work_order_id}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                                                >
                                                    {actionLoading === 'release-' + wo.work_order_id
                                                        ? <Loader2 className="w-3 h-3 animate-spin" />
                                                        : <ArrowRight className="w-3 h-3" />
                                                    }
                                                    Liberar → Scheduling
                                                </button>
                                            )}
                                            <button
                                                onClick={() => window.location.href = '/work-orders'}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors"
                                            >
                                                <FileText className="w-3 h-3" /> Ver Detalle
                                            </button>
                                        </div>
                                    </div>

                                    {/* Completeness indicators */}
                                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
                                        <span className="text-[10px] uppercase text-muted-foreground font-bold">Completitud:</span>
                                        {[
                                            { label: 'Operaciones', ok: wo.operations?.length > 0 },
                                            { label: 'Materiales', ok: wo.materials?.length > 0 },
                                            { label: 'Personal', ok: wo.assigned_workers?.length > 0 },
                                            { label: 'Costos', ok: wo.budget_estimated > 0 || wo.labour_summary?.total_hours > 0 },
                                        ].map(check => (
                                            <span key={check.label} className={`flex items-center gap-1 text-xs ${check.ok ? 'text-green-600' : 'text-gray-400'}`}>
                                                {check.ok ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                {check.label}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ═══ SCHEDULE TAB ═══ */}
            {tab === 'schedule' && (
                <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-xs font-bold text-primary uppercase tracking-wider">{t('planning.weeklyPrograms')}</div>
                        <button
                            onClick={handleCreateProgram}
                            disabled={actionLoading === 'create-program'}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                        >
                            {actionLoading === 'create-program'
                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                : <Calendar className="w-3 h-3" />
                            }
                            Crear Programa Semanal
                        </button>
                    </div>

                    {programs.length > 0 ? (
                        <div className="space-y-2">
                            {programs.map((p, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                                            S{p.week_number || i + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">{t('planning.week')} {p.week_number || i + 1} — {p.year || new Date().getFullYear()}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <StatusBadge status={p.status} />
                                                {p.work_orders_count != null && (
                                                    <span className="text-xs text-muted-foreground">{p.work_orders_count} OTs</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 px-5 text-muted-foreground">
                            <div className="text-5xl mb-4 opacity-40">📅</div>
                            <h3>{t('planning.noWeeklyPrograms')}</h3>
                            <p>{t('planning.noWeeklyProgramsDesc')}</p>
                        </div>
                    )}
                </div>
            )}

            {/* ═══ PLANNER TAB ═══ */}
            {tab === 'planner' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                        <div className="text-xs font-bold text-primary uppercase tracking-wider mb-4">{t('planning.aiPlannerTitle')}</div>
                        <div className="mb-3.5">
                            <div className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">{t('planning.selectWorkRequest')}</div>
                            <select className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" value={selectedWr} onChange={e => setSelectedWr(e.target.value)} aria-label={t('planning.selectWorkRequest')}>
                                <option value="">{t('planning.selectWorkRequestPlaceholder')}</option>
                                {workRequests.map((wr, i) => (
                                    <option key={i} value={wr.work_request_id || wr.request_id}>
                                        {(wr.work_request_id || wr.request_id || '').slice(0, 8)} — {wr.equipment_tag || wr.equipment_identification?.equipment_tag || t('planning.unknown')}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button className="w-full justify-center px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2" onClick={handleGenerateRec} disabled={!selectedWr || generating}>
                            {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> {t('planning.generating')}</> : <><Zap className="w-4 h-4" /> {t('planning.generateAIRecommendation')}</>}
                        </button>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                        <div className="text-xs font-bold text-primary uppercase tracking-wider mb-4">{t('planning.recommendation')}</div>
                        {recommendation ? (
                            <div>
                                <div className="flex gap-2 flex-wrap mb-3">
                                    <StatusBadge status={recommendation.planner_action || 'PENDING'} />
                                    {recommendation.ai_confidence != null && (
                                        <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-medium">AI: {Math.round(recommendation.ai_confidence * 100)}%</span>
                                    )}
                                </div>
                                {recommendation.recommended_action && (
                                    <div className="mb-3">
                                        <div className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">{t('planning.recommendedAction')}</div>
                                        <p className="text-sm">{recommendation.recommended_action}</p>
                                    </div>
                                )}
                                {recommendation.scheduling_suggestion && (
                                    <div className="mb-3">
                                        <div className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">{t('planning.scheduling')}</div>
                                        {typeof recommendation.scheduling_suggestion === 'object' ? (
                                            <div className="space-y-2 text-sm">
                                                {recommendation.scheduling_suggestion.recommended_date && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-muted-foreground">{t('planning.date')}:</span>
                                                        <span>{recommendation.scheduling_suggestion.recommended_date}</span>
                                                    </div>
                                                )}
                                                {recommendation.scheduling_suggestion.recommended_shift && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-muted-foreground">{t('planning.shift')}:</span>
                                                        <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-semibold">{recommendation.scheduling_suggestion.recommended_shift}</span>
                                                    </div>
                                                )}
                                                {recommendation.scheduling_suggestion.reasoning && (
                                                    <div className="flex items-start gap-2">
                                                        <span className="font-medium text-muted-foreground shrink-0">{t('planning.reasoning')}:</span>
                                                        <span>{recommendation.scheduling_suggestion.reasoning}</span>
                                                    </div>
                                                )}
                                                {recommendation.scheduling_suggestion.conflicts?.length > 0 && (
                                                    <div className="flex items-start gap-2">
                                                        <span className="font-medium text-red-500 shrink-0">{t('planning.conflicts')}:</span>
                                                        <span className="text-red-600">{recommendation.scheduling_suggestion.conflicts.join(', ')}</span>
                                                    </div>
                                                )}
                                                {recommendation.scheduling_suggestion.groupable_with?.length > 0 && (
                                                    <div className="flex items-start gap-2">
                                                        <span className="font-medium text-muted-foreground shrink-0">{t('planning.groupableWith')}:</span>
                                                        <span>{recommendation.scheduling_suggestion.groupable_with.join(', ')}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-sm">{recommendation.scheduling_suggestion}</p>
                                        )}
                                    </div>
                                )}
                                {recommendation.justification && (
                                    <div>
                                        <div className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">{t('planning.justification')}</div>
                                        <p className="text-sm text-muted-foreground">{recommendation.justification}</p>
                                    </div>
                                )}
                                {/* Planner Actions */}
                                <div className="border-t border-border pt-3 mt-3">
                                    <div className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">{t('planning.plannerActions') || 'Acciones del Planner'}</div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { action: 'APPROVE', label: t('common.approve'), bg: 'bg-emerald-600 hover:bg-emerald-700', Icon: CheckCircle },
                                            { action: 'MODIFY', label: t('planning.modify') || 'Modificar', bg: 'bg-blue-600 hover:bg-blue-700', Icon: Wrench },
                                            { action: 'ESCALATE', label: t('planning.escalate') || 'Escalar', bg: 'bg-red-600 hover:bg-red-700', Icon: AlertTriangle },
                                            { action: 'DEFER', label: t('planning.defer') || 'Diferir', bg: 'bg-gray-600 hover:bg-gray-700', Icon: Clock },
                                        ].map(btn => (
                                            <button
                                                key={btn.action}
                                                onClick={() => handlePlannerAction(btn.action)}
                                                disabled={actionLoading === btn.action}
                                                className={`${btn.bg} text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5`}
                                            >
                                                {actionLoading === btn.action ? <Loader2 className="w-3 h-3 animate-spin" /> : <btn.Icon className="w-3 h-3" />} {btn.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-16 px-5 text-muted-foreground">
                                <div className="text-5xl mb-4 opacity-40">🤖</div>
                                <h3>{t('planning.aiPlannerEmpty')}</h3>
                                <p>{t('planning.aiPlannerEmptyDesc')}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
