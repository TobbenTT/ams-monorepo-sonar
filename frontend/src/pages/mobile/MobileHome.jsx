import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
    Clock, AlertCircle, PlayCircle, CheckCircle2, Users,
    ClipboardCheck, XCircle, ChevronRight, X, History,
    Calendar, BarChart3, Timer, Archive,
} from 'lucide-react';
import * as api from '../../api';

const PRIORITY_COLORS = {
    P1: { bg: '#FEE2E2', text: '#991B1B' },
    P2: { bg: '#FED7AA', text: '#9A3412' },
    P3: { bg: '#FEF3C7', text: '#92400E' },
    P4: { bg: '#DBEAFE', text: '#1E40AF' },
};
const pc = (p) => PRIORITY_COLORS[p] || { bg: '#F1F5F9', text: '#475569' };

// SLA hours from Jorge's spec: P1=1d, P2=7d, P3=30d, P4=90d
const SLA_HOURS = { P1: 24, P2: 168, P3: 720, P4: 2160 };

const TYPE_PRIORITY = { Correctivo: 'P1', Preventivo: 'P3', Inspección: 'P4', Predictivo: 'P2' };

const formatDate = () => {
    const d = new Date();
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${days[d.getDay()]}, ${d.getDate()} de ${months[d.getMonth()]} ${d.getFullYear()}`;
};

/** Compute SLA info from priority + created_at */
function computeSLA(priority, createdAt, slaDeadline) {
    const deadline = slaDeadline
        ? new Date(slaDeadline)
        : createdAt
            ? new Date(new Date(createdAt).getTime() + (SLA_HOURS[priority] || 720) * 36e5)
            : null;
    if (!deadline) return { text: '', expired: false, urgency: 'ok' };
    const remaining = deadline.getTime() - Date.now();
    const hoursLeft = remaining / 36e5;
    if (remaining <= 0) {
        const overdue = Math.abs(hoursLeft);
        return {
            text: overdue >= 24 ? `Vencido ${Math.round(overdue / 24)}d` : `Vencido ${Math.round(overdue)}h`,
            expired: true, urgency: 'expired',
        };
    }
    if (hoursLeft < 4) return { text: `${Math.round(hoursLeft)}h restantes`, expired: false, urgency: 'critical' };
    if (hoursLeft < 24) return { text: `${Math.round(hoursLeft)}h restantes`, expired: false, urgency: 'warning' };
    return { text: `${Math.round(hoursLeft / 24)}d restantes`, expired: false, urgency: 'ok' };
}

function mapChecklistToTask(cl) {
    const total = cl.total_items || 0;
    const done = cl.completed_items || 0;
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;
    const estMinutes = total * 15;
    const estTime = estMinutes >= 60 ? `${Math.round(estMinutes / 60)}h` : `${estMinutes}min`;
    const type = cl.task_type || 'Correctivo';
    const priority = TYPE_PRIORITY[type] || 'P3';
    const woId = cl.work_package_code || `WO-${(cl.checklist_id || '').slice(-4).toUpperCase()}`;

    return {
        id: cl.checklist_id,
        workPackageId: cl.work_package_id || null,
        woId,
        equipment: cl.equipment_tag || 'Sin equipo',
        equipmentName: cl.equipment_name || cl.work_package_name || '',
        type,
        priority,
        status: cl.status,
        estimatedTime: estTime,
        progress,
        assignedTo: cl.assigned_to || '',
        createdAt: cl.created_at,
        startedAt: cl.started_at,
    };
}

// Impact-score band. ≥70 rojo, 50-69 naranja, 30-49 amarillo, <30 verde.
function taskScoreBand(score) {
    if (score == null) return null;
    if (score >= 70) return { emoji: '🔴', bg: '#FEE2E2', text: '#991B1B' };
    if (score >= 50) return { emoji: '🟠', bg: '#FED7AA', text: '#9A3412' };
    if (score >= 30) return { emoji: '🟡', bg: '#FEF3C7', text: '#92400E' };
    return { emoji: '🟢', bg: '#D1FAE5', text: '#065F46' };
}

export default function MobileHome() {
    const { mobileRole, plant } = useOutletContext();
    return mobileRole === 'maintainer'
        ? <MaintainerHome plant={plant} />
        : <SupervisorHome plant={plant} />;
}

// ─── MAINTAINER HOME ─────────────────────────────────────────────────────────
function MaintainerHome({ plant }) {
    const navigate = useNavigate();
    const [workRequests, setWorkRequests] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scores, setScores] = useState({}); // keyed by work_package_id

    useEffect(() => {
        Promise.all([
            api.listWorkRequests({ plant_id: plant }).catch(() => []),
            api.listChecklists({ plant_id: plant }).catch(() => []),
        ]).then(([wrs, cls]) => {
            const wrList = wrs?.data || wrs || [];
            const clList = cls?.data || cls || [];
            setWorkRequests(Array.isArray(wrList) ? wrList : []);
            setTasks((Array.isArray(clList) ? clList : []).map(mapChecklistToTask));
        }).finally(() => setLoading(false));
    }, [plant]);

    // Fetch impact scores for visible tasks (cached by work_package_id).
    useEffect(() => {
        const pending = tasks.map(t => t.workPackageId).filter(id => id && !(id in scores));
        if (pending.length === 0) return;
        let cancelled = false;
        Promise.allSettled(pending.map(id => api.getManagedWOImpactScore(id).then(r => [id, r])))
            .then(results => {
                if (cancelled) return;
                const next = {};
                for (const r of results) {
                    if (r.status === 'fulfilled' && r.value?.[1]) {
                        const [id, data] = r.value;
                        next[id] = { total_score: data.total_score, impact_label: data.impact_label };
                    }
                }
                if (Object.keys(next).length) setScores(prev => ({ ...prev, ...next }));
            });
        return () => { cancelled = true; };
    }, [tasks]); // eslint-disable-line react-hooks/exhaustive-deps

    const rejected = workRequests.filter(wr => wr.status === 'REJECTED');
    const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS');
    const assigned = tasks.filter(t => t.status === 'PENDING' || t.status === 'ASSIGNED' || t.status === 'DRAFT');
    const delayed = tasks.filter(t => {
        if (t.status !== 'IN_PROGRESS' || !t.createdAt) return false;
        return (Date.now() - new Date(t.createdAt).getTime()) / 36e5 > 24;
    });

    if (loading) return <Spinner />;

    return (
        <div className="p-4 space-y-6 pb-28">
            {/* Date */}
            <div>
                <div className="text-xs font-medium mb-1" style={{ color: '#64748B' }}>{formatDate()}</div>
                <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>Tus Tareas</h1>
            </div>

            {/* Rejected WRs */}
            {rejected.length > 0 && (
                <div>
                    <SectionHeader icon={XCircle} iconColor="#F59E0B" title={`Avisos Rechazados (${rejected.length})`} />
                    <div className="space-y-3">
                        {rejected.map(wr => (
                            <WRRejectedCard key={wr.request_id || wr.id} wr={wr} onAction={() => navigate('/m/avisos')} />
                        ))}
                    </div>
                </div>
            )}

            {/* In Progress */}
            {inProgress.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#10B981' }} />
                        <h2 className="text-sm font-bold" style={{ color: '#0F172A' }}>En Ejecución ({inProgress.length})</h2>
                    </div>
                    <div className="space-y-3">
                        {inProgress.map(task => (
                            <TaskInProgressCard key={task.id} task={task} score={scores[task.workPackageId]} onContinue={() => navigate(`/m/tarea/${task.id}`)} />
                        ))}
                    </div>
                </div>
            )}

            {/* Assigned Today */}
            <div>
                <SectionHeader title={`Asignadas (${assigned.length})`} />
                <div className="space-y-3">
                    {assigned.length === 0 ? (
                        <EmptyState text="Sin tareas asignadas" />
                    ) : assigned.map(task => (
                        <TaskAssignedCard key={task.id} task={task} score={scores[task.workPackageId]} onStart={() => navigate(`/m/tarea/${task.id}`)} />
                    ))}
                </div>
            </div>

            {/* Delayed */}
            {delayed.length > 0 && (
                <div>
                    <SectionHeader icon={AlertCircle} iconColor="#EF4444" title={`Atrasadas (${delayed.length})`} />
                    <div className="space-y-3">
                        {delayed.map(task => (
                            <TaskDelayedCard key={task.id} task={task} score={scores[task.workPackageId]} onStart={() => navigate(`/m/tarea/${task.id}`)} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── SUPERVISOR HOME ─────────────────────────────────────────────────────────
function SupervisorHome({ plant }) {
    const navigate = useNavigate();
    const [workRequests, setWorkRequests] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [approvalModal, setApprovalModal] = useState(null); // wr object or null

    const reload = () => {
        setLoading(true);
        Promise.all([
            api.listWorkRequests({ plant_id: plant }).catch(() => []),
            api.listChecklists({ plant_id: plant }).catch(() => []),
        ]).then(([wrs, cls]) => {
            const wrList = wrs?.data || wrs || [];
            const clList = cls?.data || cls || [];
            setWorkRequests(Array.isArray(wrList) ? wrList : []);
            setTasks((Array.isArray(clList) ? clList : []).map(mapChecklistToTask));
        }).finally(() => setLoading(false));
    };

    useEffect(() => { reload(); }, [plant]);

    const pendingWRs = workRequests.filter(wr =>
        wr.status === 'PENDING_VALIDATION' || wr.status === 'DRAFT'
    );
    const completed = tasks.filter(t => t.status === 'COMPLETED');
    const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS');
    const totalTasks = tasks.length || 1;
    const compliance = Math.round((completed.length / totalTasks) * 100);

    // Delayed OTs
    const delayed = tasks.filter(t => {
        if (t.status !== 'IN_PROGRESS' || !t.createdAt) return false;
        return (Date.now() - new Date(t.createdAt).getTime()) / 36e5 > 24;
    });
    const unassigned = tasks.filter(t => !t.assignedTo && t.status !== 'COMPLETED');

    // Backlog = non-completed tasks in hours (est 2h each)
    const backlogHH = tasks.filter(t => t.status !== 'COMPLETED').length * 2;

    // Adherence = executed on schedule / total executed (approximation)
    const adherence = completed.length > 0
        ? Math.min(Math.round(((completed.length - delayed.length) / Math.max(completed.length, 1)) * 100), 100)
        : 0;

    // Jorge's KPIs: Disciplina Operacional
    const kpis = [
        { label: 'Cumplimiento Programa', value: `${compliance}%`, color: compliance >= 80 ? '#10B981' : '#F97316', icon: CheckCircle2 },
        { label: 'Adherencia', value: `${adherence}%`, color: adherence >= 80 ? '#10B981' : '#F97316', icon: ClipboardCheck },
        { label: 'OT Atrasadas', value: delayed.length, color: delayed.length > 0 ? '#EF4444' : '#10B981', icon: AlertCircle },
        { label: 'Backlog (HH)', value: backlogHH, color: backlogHH > 50 ? '#EF4444' : '#3B82F6', icon: Archive },
        { label: 'Sin Asignar', value: unassigned.length, color: unassigned.length > 0 ? '#F97316' : '#10B981', icon: Users },
        { label: 'Capacidad', value: `${Math.min(Math.round((inProgress.length / Math.max(tasks.length, 1)) * 100), 100)}%`, color: '#06B6D4', icon: BarChart3 },
    ];

    // WR SLA overview
    const wrSlaExpired = workRequests.filter(wr => {
        if (['REJECTED', 'CLOSED'].includes(wr.status)) return false;
        const sla = computeSLA(wr.priority_code || wr.priority || 'P3', wr.created_at, wr.sla_deadline);
        return sla.expired;
    });

    // Team performance
    const teamMap = {};
    tasks.forEach(t => {
        const name = t.assignedTo || 'Sin asignar';
        if (!teamMap[name]) teamMap[name] = { name, tasks: 0, completed: 0 };
        teamMap[name].tasks++;
        if (t.status === 'COMPLETED') teamMap[name].completed++;
    });
    const teamPerformance = Object.values(teamMap)
        .filter(m => m.name !== 'Sin asignar')
        .map(m => ({ ...m, compliance: m.tasks > 0 ? Math.round((m.completed / m.tasks) * 100) : 0 }))
        .sort((a, b) => b.compliance - a.compliance)
        .slice(0, 5);

    if (loading) return <Spinner />;

    return (
        <div className="p-4 space-y-6 pb-28">
            {/* Date */}
            <div>
                <div className="text-xs font-medium mb-1" style={{ color: '#64748B' }}>{formatDate()}</div>
                <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>Panel de Control</h1>
            </div>

            {/* SLA Alert Strip */}
            {wrSlaExpired.length > 0 && (
                <button
                    onClick={() => navigate('/m/avisos?filter=delayed')}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl border-2 active:scale-95 transition-all"
                    style={{ backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' }}
                >
                    <Timer className="w-6 h-6 flex-shrink-0" style={{ color: '#EF4444' }} />
                    <div className="flex-1 text-left">
                        <div className="text-sm font-bold" style={{ color: '#991B1B' }}>{wrSlaExpired.length} Avisos con SLA vencido</div>
                        <div className="text-xs" style={{ color: '#B91C1C' }}>Requieren atención inmediata</div>
                    </div>
                    <ChevronRight className="w-5 h-5" style={{ color: '#EF4444' }} />
                </button>
            )}

            {/* Pending WR Approvals */}
            {pendingWRs.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-bold" style={{ color: '#0F172A' }}>
                            Avisos Pendings de Aprobación ({pendingWRs.length})
                        </h2>
                        <button onClick={() => navigate('/m/avisos')} className="text-xs font-semibold" style={{ color: '#047857' }}>
                            View alls
                        </button>
                    </div>
                    <div className="space-y-3">
                        {pendingWRs.slice(0, 3).map(wr => (
                            <PendingWRCard
                                key={wr.request_id || wr.id}
                                wr={wr}
                                onApprove={() => setApprovalModal({ ...wr, _action: 'approve' })}
                                onReject={() => setApprovalModal({ ...wr, _action: 'reject' })}
                                onTap={() => navigate(`/m/wr/${wr.request_id || wr.id}`)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* KPIs — Jorge Disciplina Operacional */}
            <div>
                <div className="text-xs font-semibold mb-3" style={{ color: '#64748B', letterSpacing: '0.05em' }}>
                    DISCIPLINA OPERACIONAL
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                    {kpis.map((kpi, i) => {
                        const Icon = kpi.icon;
                        return (
                            <div key={i} className="bg-white rounded-2xl p-3 border text-center" style={{ borderColor: '#E2E8F0' }}>
                                <Icon className="w-4 h-4 mx-auto mb-1" style={{ color: kpi.color }} />
                                <div className="text-lg font-bold" style={{ color: kpi.color }}>{kpi.value}</div>
                                <div className="text-[10px] font-medium leading-tight mt-0.5" style={{ color: '#64748B' }}>{kpi.label}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Team Performance */}
            {teamPerformance.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-bold" style={{ color: '#0F172A' }}>Cumplimiento por Mantenedor</h2>
                    </div>
                    <div className="space-y-3">
                        {teamPerformance.map((member, i) => (
                            <div key={i} className="bg-white rounded-2xl p-4 border" style={{ borderColor: '#E2E8F0' }}>
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <div className="text-sm font-bold" style={{ color: '#0F172A' }}>{member.name}</div>
                                        <div className="text-xs" style={{ color: '#64748B' }}>
                                            {member.completed}/{member.tasks} tareas
                                        </div>
                                    </div>
                                    <div className="text-xl font-bold" style={{ color: member.compliance >= 90 ? '#10B981' : member.compliance >= 75 ? '#F97316' : '#EF4444' }}>
                                        {member.compliance}%
                                    </div>
                                </div>
                                <div className="h-2 rounded-full" style={{ backgroundColor: '#E2E8F0' }}>
                                    <div className="h-full rounded-full" style={{
                                        width: `${member.compliance}%`,
                                        backgroundColor: member.compliance >= 90 ? '#10B981' : member.compliance >= 75 ? '#F97316' : '#EF4444',
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => navigate('/m/avisos')}
                    className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-4 border-2 transition-all active:scale-95"
                    style={{ borderColor: '#FCA5A5' }}
                >
                    <div className="text-2xl font-bold mb-1" style={{ color: '#EF4444' }}>{unassigned.length}</div>
                    <div className="text-xs font-semibold" style={{ color: '#991B1B' }}>OT Sin Asignar</div>
                </button>
                <button
                    onClick={() => navigate('/scheduling')}
                    className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-2xl p-4 border-2 transition-all active:scale-95"
                    style={{ borderColor: '#10B981' }}
                >
                    <div className="text-2xl font-bold mb-1" style={{ color: '#10B981' }}>Ver</div>
                    <div className="text-xs font-semibold" style={{ color: '#047857' }}>Planificación</div>
                </button>
            </div>

            {/* Approval Modal */}
            {approvalModal && (
                <ApprovalModal
                    wr={approvalModal}
                    action={approvalModal._action}
                    onClose={() => setApprovalModal(null)}
                    onDone={() => { setApprovalModal(null); reload(); }}
                />
            )}
        </div>
    );
}

// ─── APPROVAL MODAL (Jorge: comment obligatorio + historial equipo) ─────────
function ApprovalModal({ wr, action, onClose, onDone }) {
    const [comment, setComment] = useState('');
    const [priority, setPriority] = useState(wr.priority_code || wr.priority || 'P3');
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const tag = wr.equipment_tag || 'Sin equipo';
    const isApprove = action === 'approve';

    useEffect(() => {
        api.getEquipmentHistory(tag, wr.request_id)
            .then(res => setHistory(res?.history || []))
            .catch(() => setHistory([]))
            .finally(() => setLoadingHistory(false));
    }, [tag, wr.request_id]);

    const handleSubmit = async () => {
        if (!comment.trim()) return;
        setSubmitting(true);
        try {
            if (isApprove) {
                await api.approveWorkRequest(wr.request_id || wr.id, {
                    comment: comment.trim(),
                    priority_override: priority !== (wr.priority_code || wr.priority) ? priority : null,
                });
            } else {
                await api.rejectWorkRequest(wr.request_id || wr.id, {
                    reason: comment.trim(),
                });
            }
            onDone();
        } catch {
            setSubmitting(false);
        }
    };

    // Compute what SLA will be after approval
    const newSLA = computeSLA(priority, new Date().toISOString(), null);

    return (
        <div className="fixed inset-0 z-[200] flex items-end justify-center" onClick={onClose}>
            <div className="absolute inset-0 bg-black/50" />
            <div
                className="relative bg-white rounded-t-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white rounded-t-3xl border-b px-4 py-4 flex items-center justify-between z-10" style={{ borderColor: '#E2E8F0' }}>
                    <div>
                        <div className="text-sm font-bold" style={{ color: '#0F172A' }}>
                            {isApprove ? 'Approve Aviso' : 'Reject Aviso'}
                        </div>
                        <div className="text-xs" style={{ color: '#64748B' }}>{tag} — {wr.request_id || ''}</div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
                        <X className="w-5 h-5" style={{ color: '#64748B' }} />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    {/* WR Summary */}
                    <div className="p-3 rounded-xl" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                        <div className="text-xs font-semibold mb-1" style={{ color: '#64748B' }}>DESCRIPCIÓN</div>
                        <div className="text-sm" style={{ color: '#0F172A' }}>
                            {typeof wr.problem_description === 'object'
                                ? (wr.problem_description?.original_text || wr.problem_description?.raw_text || 'Sin descripción')
                                : (wr.problem_description || 'Sin descripción')}
                        </div>
                    </div>

                    {/* Priority selector (only for approve) */}
                    {isApprove && (
                        <div>
                            <div className="text-xs font-semibold mb-2" style={{ color: '#64748B', letterSpacing: '0.05em' }}>
                                PRIORIDAD (Jorge: P1 &lt;1d, P2 &lt;7d, P3 &gt;7d, P4 Parada)
                            </div>
                            <div className="flex gap-2">
                                {['P1', 'P2', 'P3', 'P4'].map(p => {
                                    const colors = pc(p);
                                    const labels = { P1: 'Urgent', P2: 'En ejecución', P3: 'Próx. programa', P4: 'Parada' };
                                    return (
                                        <button
                                            key={p}
                                            onClick={() => setPriority(p)}
                                            className="flex-1 py-2.5 rounded-xl text-center transition-all"
                                            style={{
                                                backgroundColor: priority === p ? colors.text : colors.bg,
                                                color: priority === p ? '#FFFFFF' : colors.text,
                                                border: priority === p ? 'none' : `1px solid ${colors.bg}`,
                                            }}
                                        >
                                            <div className="text-sm font-bold">{p}</div>
                                            <div className="text-[9px] font-medium">{labels[p]}</div>
                                        </button>
                                    );
                                })}
                            </div>
                            {/* SLA preview */}
                            <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: '#64748B' }}>
                                <Timer className="w-3 h-3" />
                                <span>SLA: {newSLA.text || 'Calculando...'}</span>
                                <span>•</span>
                                <span>Clase: {['P1', 'P2'].includes(priority) ? 'NO PROGRAMADO' : 'PROGRAMADO'}</span>
                            </div>
                        </div>
                    )}

                    {/* Equipment History (Jorge: "Revisar historial de WR antes de aprobar") */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <History className="w-4 h-4" style={{ color: '#64748B' }} />
                            <span className="text-xs font-semibold" style={{ color: '#64748B', letterSpacing: '0.05em' }}>
                                HISTORIAL EQUIPO ({history.length})
                            </span>
                        </div>
                        {loadingHistory ? (
                            <div className="h-12 flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-t-emerald-600 border-gray-200 rounded-full animate-spin" />
                            </div>
                        ) : history.length === 0 ? (
                            <div className="text-xs p-3 rounded-xl text-center" style={{ backgroundColor: '#F0FDF4', color: '#047857' }}>
                                Sin WRs previas para este equipo
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                {history.slice(0, 5).map((h, i) => (
                                    <div key={i} className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: '#F8FAFC' }}>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-medium truncate" style={{ color: '#0F172A' }}>
                                                {h.request_id || ''}
                                            </div>
                                            <div className="text-[10px]" style={{ color: '#64748B' }}>
                                                {h.created_at ? new Date(h.created_at).toLocaleDateString('es', { day: '2-digit', month: '2-digit', year: '2-digit' }) : ''}
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{
                                            backgroundColor: h.status === 'VALIDATED' ? '#D1FAE5' : h.status === 'REJECTED' ? '#FEE2E2' : '#FEF3C7',
                                            color: h.status === 'VALIDATED' ? '#047857' : h.status === 'REJECTED' ? '#991B1B' : '#92400E',
                                        }}>
                                            {h.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Comment (mandatory — Jorge: "Ingresar comentario y aprobar o rechazar") */}
                    <div>
                        <label className="text-xs font-semibold mb-2 block" style={{ color: '#64748B', letterSpacing: '0.05em' }}>
                            {isApprove ? 'COMENTARIO DE APROBACIÓN *' : 'MOTIVO DE RECHAZO *'}
                        </label>
                        <textarea
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            placeholder={isApprove
                                ? 'Ej: Aprobado, programar para siguiente semana...'
                                : 'Ej: Falta información del equipo, contactar técnico...'
                            }
                            className="w-full h-24 p-3 rounded-xl border text-sm resize-none outline-none"
                            style={{ borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' }}
                            autoFocus
                        />
                    </div>

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        disabled={!comment.trim() || submitting}
                        className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-50"
                        style={{
                            backgroundColor: isApprove ? '#047857' : '#EF4444',
                            color: '#FFFFFF',
                        }}
                    >
                        {submitting
                            ? 'Procesando...'
                            : isApprove ? 'Approve Aviso' : 'Reject Aviso'
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── SHARED COMPONENTS ──────────────────────────────────────────────────────

function Spinner() {
    return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-3 border-t-emerald-600 border-gray-200 rounded-full animate-spin" />
        </div>
    );
}

function SectionHeader({ icon: Icon, iconColor, title }) {
    return (
        <div className="flex items-center gap-2 mb-3">
            {Icon && <Icon className="w-4 h-4" style={{ color: iconColor }} />}
            <h2 className="text-sm font-bold" style={{ color: '#0F172A' }}>{title}</h2>
        </div>
    );
}

function EmptyState({ text }) {
    return (
        <div className="bg-white rounded-2xl p-6 border text-center" style={{ borderColor: '#E2E8F0' }}>
            <div className="text-sm" style={{ color: '#94A3B8' }}>{text}</div>
        </div>
    );
}

function PriorityBadge({ priority }) {
    const colors = pc(priority);
    return (
        <div className="px-3 py-1.5 rounded-full text-xs font-bold" style={{ backgroundColor: colors.bg, color: colors.text }}>
            {priority}
        </div>
    );
}

/** SLA countdown badge */
function SLABadge({ priority, createdAt, slaDeadline }) {
    const sla = computeSLA(priority, createdAt, slaDeadline);
    if (!sla.text) return null;
    const colors = {
        expired: { bg: '#FEE2E2', text: '#991B1B' },
        critical: { bg: '#FEF3C7', text: '#92400E' },
        warning: { bg: '#FFF7ED', text: '#9A3412' },
        ok: { bg: '#F0FDF4', text: '#047857' },
    };
    const c = colors[sla.urgency];
    return (
        <div className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold" style={{ backgroundColor: c.bg, color: c.text }}>
            <Timer className="w-3 h-3" />
            {sla.text}
        </div>
    );
}

// ─── MAINTAINER CARDS ────────────────────────────────────────────────────────

function WRRejectedCard({ wr, onAction }) {
    const desc = wr.raw_text || wr.problem_description?.structured_description || wr.problem_description?.raw_text || 'Sin descripción';
    const priority = wr.priority_code || wr.ai_classification?.priority_suggested || wr.priority || 'P3';
    const tag = wr.equipment_identification?.equipment_tag || wr.equipment_tag || 'Sin equipo';
    const reason = wr.rejection_reason || (wr.validation || {}).rejection_reason || '';
    return (
        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-4 border-2" style={{ borderColor: '#FDE68A' }}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold" style={{ color: '#64748B' }}>{wr.request_id || wr.id || ''}</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#FED7AA', color: '#9A3412' }}>RECHAZADA</span>
                    </div>
                    <div className="text-sm font-bold mb-1" style={{ color: '#0F172A' }}>{tag}</div>
                    <div className="text-sm mb-2 line-clamp-2" style={{ color: '#475569' }}>{desc}</div>
                </div>
                <PriorityBadge priority={priority} />
            </div>
            {reason && (
                <div className="mb-3 p-3 rounded-xl" style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A' }}>
                    <div className="text-xs font-semibold mb-1" style={{ color: '#92400E' }}>Motivo del rechazo:</div>
                    <div className="text-xs" style={{ color: '#78350F' }}>{reason}</div>
                </div>
            )}
            <button onClick={onAction} className="w-full rounded-xl py-3 text-sm font-semibold transition-all active:scale-95" style={{ backgroundColor: '#F59E0B', color: '#FFFFFF' }}>
                Completar Información
            </button>
        </div>
    );
}

function TaskInProgressCard({ task, score, onContinue }) {
    const band = score ? taskScoreBand(Math.round(score.total_score)) : null;
    return (
        <div className="bg-white rounded-2xl p-4 border-2" style={{ borderColor: '#10B981' }}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-semibold" style={{ color: '#64748B' }}>{task.woId}</span>
                        {band && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: band.bg, color: band.text }}
                                title={score.impact_label || 'Impact score'}>
                                {band.emoji} {Math.round(score.total_score)}
                            </span>
                        )}
                    </div>
                    <div className="text-sm font-bold mb-1" style={{ color: '#0F172A' }}>{task.equipment}</div>
                    <div className="text-sm mb-2" style={{ color: '#475569' }}>{task.equipmentName}</div>
                </div>
                <PriorityBadge priority={task.priority} />
            </div>
            <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold" style={{ color: '#64748B' }}>Avance</span>
                    <span className="text-sm font-bold" style={{ color: '#10B981' }}>{task.progress}%</span>
                </div>
                <div className="h-2 rounded-full" style={{ backgroundColor: '#E2E8F0' }}>
                    <div className="h-full rounded-full" style={{ width: `${task.progress}%`, backgroundColor: '#10B981' }} />
                </div>
            </div>
            <div className="flex items-center gap-2 mb-3 text-xs">
                <span className="px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: '#F1F5F9', color: '#475569' }}>
                    {task.type}
                </span>
                <div className="flex items-center gap-1" style={{ color: '#64748B' }}>
                    <Clock className="w-3 h-3" />
                    {task.estimatedTime}
                </div>
            </div>
            <button onClick={onContinue} className="w-full rounded-xl py-3 text-sm font-semibold transition-all active:scale-95" style={{ backgroundColor: '#10B981', color: '#FFFFFF' }}>
                Continuar Tarea
            </button>
        </div>
    );
}

function TaskAssignedCard({ task, score, onStart }) {
    const band = score ? taskScoreBand(Math.round(score.total_score)) : null;
    return (
        <div className="bg-white rounded-2xl p-4 border" style={{ borderColor: '#E2E8F0' }}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-semibold" style={{ color: '#64748B' }}>{task.woId}</span>
                        {band && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: band.bg, color: band.text }}
                                title={score.impact_label || 'Impact score'}>
                                {band.emoji} {Math.round(score.total_score)}
                            </span>
                        )}
                    </div>
                    <div className="text-sm font-bold mb-1" style={{ color: '#0F172A' }}>{task.equipment}</div>
                    <div className="text-sm mb-2" style={{ color: '#475569' }}>{task.equipmentName}</div>
                </div>
                <PriorityBadge priority={task.priority} />
            </div>
            <div className="flex items-center gap-2 mb-3 text-xs">
                <span className="px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: '#F1F5F9', color: '#475569' }}>
                    {task.type}
                </span>
                <div className="flex items-center gap-1" style={{ color: '#64748B' }}>
                    <Clock className="w-3 h-3" />
                    {task.estimatedTime}
                </div>
            </div>
            <button onClick={onStart} className="w-full rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95" style={{ backgroundColor: '#047857', color: '#FFFFFF' }}>
                <PlayCircle className="w-4 h-4" />
                Iniciar Tarea
            </button>
        </div>
    );
}

function TaskDelayedCard({ task, score, onStart }) {
    const hoursDelayed = task.createdAt
        ? `${Math.round((Date.now() - new Date(task.createdAt).getTime()) / 36e5)}h`
        : '?';
    const band = score ? taskScoreBand(Math.round(score.total_score)) : null;
    return (
        <div className="bg-white rounded-2xl p-4 border-2" style={{ borderColor: '#FCA5A5' }}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-semibold" style={{ color: '#64748B' }}>{task.woId}</span>
                        {band && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: band.bg, color: band.text }}
                                title={score.impact_label || 'Impact score'}>
                                {band.emoji} {Math.round(score.total_score)}
                            </span>
                        )}
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>
                            Atrasada {hoursDelayed}
                        </span>
                    </div>
                    <div className="text-sm font-bold mb-1" style={{ color: '#0F172A' }}>{task.equipment}</div>
                    <div className="text-sm mb-2" style={{ color: '#475569' }}>{task.equipmentName}</div>
                </div>
                <PriorityBadge priority={task.priority} />
            </div>
            <button onClick={onStart} className="w-full rounded-xl py-3 text-sm font-semibold transition-all active:scale-95" style={{ backgroundColor: '#EF4444', color: '#FFFFFF' }}>
                Iniciar Urgente
            </button>
        </div>
    );
}

// ─── SUPERVISOR CARDS ────────────────────────────────────────────────────────

function PendingWRCard({ wr, onApprove, onReject, onTap }) {
    const desc = wr.raw_text || wr.problem_description?.structured_description || wr.problem_description?.raw_text
        || (typeof wr.problem_description === 'string' ? wr.problem_description : 'Sin descripción');
    const priority = wr.priority_code || wr.ai_classification?.priority_suggested || wr.priority || 'P3';
    const tag = wr.equipment_identification?.equipment_tag || wr.equipment_tag || 'Sin equipo';
    const createdBy = wr.technician_name || wr.created_by || 'Técnico';
    const createdDate = wr.created_at
        ? new Date(wr.created_at).toLocaleDateString('es', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
        : '';

    return (
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-4 border-2" style={{ borderColor: '#FDE68A' }}>
            <button onClick={onTap} className="w-full text-left">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-xs font-semibold" style={{ color: '#64748B' }}>{wr.request_id || wr.id || ''}</span>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>PENDIENTE</span>
                            <SLABadge priority={priority} createdAt={wr.created_at} slaDeadline={wr.sla_deadline} />
                        </div>
                        <div className="text-sm font-bold mb-1" style={{ color: '#0F172A' }}>{tag}</div>
                        <div className="text-sm mb-2 line-clamp-2" style={{ color: '#475569' }}>{desc}</div>
                        <div className="flex items-center gap-2 text-xs" style={{ color: '#64748B' }}>
                            <span>Por: {createdBy}</span>
                            {createdDate && <><span>•</span><span>{createdDate}</span></>}
                        </div>
                    </div>
                    <PriorityBadge priority={priority} />
                </div>
            </button>
            {/* Action buttons — now functional */}
            <div className="grid grid-cols-2 gap-2 mt-3">
                <button
                    onClick={onApprove}
                    className="py-2.5 rounded-lg text-xs font-bold text-center transition-all active:scale-95"
                    style={{ backgroundColor: '#D1FAE5', color: '#047857' }}
                >
                    Approve
                </button>
                <button
                    onClick={onReject}
                    className="py-2.5 rounded-lg text-xs font-bold text-center transition-all active:scale-95"
                    style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}
                >
                    Reject
                </button>
            </div>
        </div>
    );
}
