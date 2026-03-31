import { useState, useEffect, useRef } from 'react';
import { useOutletContext, useNavigate, useSearchParams } from 'react-router-dom';
import {
    AlertTriangle, Clock, CheckCircle2, FileText, TrendingUp, TrendingDown,
    ChevronRight, Zap, Timer,
} from 'lucide-react';
import { useToast } from '../../components/Toast';
import * as api from '../../api';

const PRIORITY_META = {
    P1: { bg: '#FEE2E2', text: '#991B1B', label: '1-Urgent', sub: '<24h' },
    P2: { bg: '#FED7AA', text: '#9A3412', label: '2-Prog. Ejec.', sub: '<7d' },
    P3: { bg: '#FEF3C7', text: '#92400E', label: '3-Próx. Prog.', sub: '> 7d' },
    P4: { bg: '#DBEAFE', text: '#1E40AF', label: '4-Parada Planta', sub: 'Parada' },
};
const pc = (p) => PRIORITY_META[p] || { bg: '#F1F5F9', text: '#475569', label: p, sub: '' };

// Map API status to flow status
function flowStatus(s) {
    if (s === 'DRAFT') return 'created';
    if (s === 'PENDING_VALIDATION') return 'in_review';
    if (s === 'VALIDATED' || s === 'APPROVED') return 'approved';
    if (s === 'ASSIGNED' || s === 'ACTIVE' || s === 'IN_PROGRESS' || s === 'SCHEDULED') return 'in_execution';
    if (s === 'COMPLETED' || s === 'CLOSED') return 'closed';
    if (s === 'REJECTED') return 'rejected';
    if (s === 'CANCELLED') return 'rejected';
    return 'created';
}

const FLOW_STEPS = [
    { key: 'created', label: 'Creado', color: '#94A3B8' },
    { key: 'in_review', label: 'En Revisión', color: '#3B82F6' },
    { key: 'approved', label: 'Approved', color: '#10B981' },
    { key: 'in_execution', label: 'En Ejecución', color: '#F59E0B' },
    { key: 'closed', label: 'Cerrado', color: '#6366F1' },
];

const STATUS_LABELS = {
    created: 'Creado', in_review: 'En Revisión', approved: 'Approved',
    in_execution: 'En Ejecución', closed: 'Cerrado', rejected: 'Rejected',
};

function derivePriority(wr) {
    const p = wr.priority_code || wr.ai_classification?.priority_suggested || wr.priority || '';
    if (p.startsWith('1') || p === 'P1') return 'P1';
    if (p.startsWith('2') || p === 'P2') return 'P2';
    if (p.startsWith('4') || p === 'P4') return 'P4';
    return 'P3';
}

// SLA hours: P1=1d, P2=7d, P3=30d, P4=90d
const SLA_HOURS = { P1: 24, P2: 168, P3: 720, P4: 2160 };

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
        return { text: overdue >= 24 ? `Vencido ${Math.round(overdue / 24)}d` : `Vencido ${Math.round(overdue)}h`, expired: true, urgency: 'expired' };
    }
    if (hoursLeft < 4) return { text: `${Math.round(hoursLeft)}h`, expired: false, urgency: 'critical' };
    if (hoursLeft < 24) return { text: `${Math.round(hoursLeft)}h`, expired: false, urgency: 'warning' };
    return { text: `${Math.round(hoursLeft / 24)}d`, expired: false, urgency: 'ok' };
}

function SLABadge({ priority, createdAt, slaDeadline }) {
    const sla = computeSLA(priority, createdAt, slaDeadline);
    if (!sla.text) return null;
    const colors = { expired: { bg: '#FEE2E2', text: '#991B1B' }, critical: { bg: '#FEF3C7', text: '#92400E' }, warning: { bg: '#FFF7ED', text: '#9A3412' }, ok: { bg: '#F0FDF4', text: '#047857' } };
    const c = colors[sla.urgency];
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ backgroundColor: c.bg, color: c.text }}>
            <Timer className="w-3 h-3" />{sla.text}
        </span>
    );
}

export default function MobileWorkRequests() {
    const { plant } = useOutletContext();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const toast = useToast();
    const [wrs, setWrs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState(searchParams.get('filter') || 'all');
    const listRef = useRef(null);

    useEffect(() => {
        api.listWorkRequests({ plant_id: plant })
            .then(res => {
                const list = res?.data || res?.items || res || [];
                setWrs(Array.isArray(list) ? list : []);
            })
            .catch(() => toast.error('Error cargando WRs'))
            .finally(() => setLoading(false));
    }, [plant]);

    // Enrich WRs with flow status and priority
    const enriched = wrs.map(wr => ({
        ...wr,
        flow: flowStatus(wr.status),
        pri: derivePriority(wr),
        tag: wr.equipment_identification?.equipment_tag || wr.equipment_tag || 'Sin equipo',
        desc: wr.failure_description || wr.problem_description?.original_text || wr.problem_description?.structured_description || wr.ai_classification?.failure_description || wr.raw_text || 'Sin descripción',
        assignee: wr.assigned_to || wr.technician_name || '',
        isDelayed: wr.status !== 'COMPLETED' && wr.status !== 'REJECTED' && wr.status !== 'CLOSED'
            && computeSLA(derivePriority(wr), wr.created_at, wr.sla_deadline).expired,
        noProgress: wr.created_at && (Date.now() - new Date(wr.created_at).getTime()) / 864e5 > 2
            && (wr.status === 'ACTIVE' || wr.status === 'IN_PROGRESS'),
    }));

    // Metrics
    const created = enriched.filter(w => w.flow === 'created').length;
    const inProcess = enriched.filter(w => ['in_review', 'approved', 'in_execution'].includes(w.flow)).length;
    const pendingAction = enriched.filter(w => ['created', 'in_review'].includes(w.flow)).length;
    const delayed = enriched.filter(w => w.isDelayed).length;

    // Flow distribution
    const flowDist = FLOW_STEPS.map(step => ({
        ...step,
        count: enriched.filter(w => w.flow === step.key).length,
    }));

    // Problems
    const delayedWRs = enriched.filter(w => w.isDelayed);
    const noProgressWRs = enriched.filter(w => w.noProgress);
    const atRiskWRs = enriched.filter(w => (w.pri === 'P1' || w.pri === 'P2') && w.flow === 'created');

    // Priority load
    const loadByPriority = ['P1', 'P2', 'P3', 'P4'].map(p => ({
        priority: p,
        label: PRIORITY_META[p]?.label || p,
        count: enriched.filter(w => w.pri === p).length,
        color: p === 'P1' ? '#EF4444' : p === 'P2' ? '#F97316' : p === 'P3' ? '#EAB308' : '#3B82F6',
    }));

    // Evolution
    const closedCount = enriched.filter(w => w.flow === 'closed').length;
    const trend = enriched.length > closedCount ? 'accumulating' : 'reducing';

    // Filtered list
    const filteredWRs = selectedStatus === 'all'
        ? enriched
        : selectedStatus === 'delayed'
        ? enriched.filter(w => w.isDelayed)
        : selectedStatus === 'unassigned'
        ? enriched.filter(w => !w.assignee && !['closed', 'rejected'].includes(w.flow) && w.flow !== 'created')
        : selectedStatus === 'in_process'
        ? enriched.filter(w => ['in_review', 'approved', 'in_execution'].includes(w.flow))
        : selectedStatus === 'pending_action'
        ? enriched.filter(w => ['created', 'in_review'].includes(w.flow))
        : enriched.filter(w => w.flow === selectedStatus);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-3 border-t-emerald-600 border-gray-200 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-28" style={{ backgroundColor: '#F8FAFC' }}>
            {/* HEADER */}
            <div className="bg-white border-b p-4 sticky top-0 z-10" style={{ borderColor: '#E2E8F0' }}>
                <h1 className="text-xl font-bold mb-1" style={{ color: '#0F172A' }}>Avisos de Trabajo</h1>
                <p className="text-sm" style={{ color: '#64748B' }}>Estado y gestión de solicitudes de trabajo</p>
            </div>

            <div className="p-4 space-y-6">
                {/* 1. ESTADO DEL SISTEMA */}
                <div>
                    <div className="text-xs font-semibold mb-3" style={{ color: '#64748B', letterSpacing: '0.05em' }}>
                        ESTADO DEL SISTEMA
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <MetricCard icon={FileText} color="#3B82F6" label="Avisos Creados" value={created}
                            onClick={() => { setSelectedStatus('created'); setTimeout(() => listRef.current?.scrollIntoView({ behavior: 'smooth' }), 100); }} />
                        <MetricCard icon={Zap} color="#F59E0B" label="En Proceso" value={inProcess}
                            onClick={() => { setSelectedStatus('in_process'); setTimeout(() => listRef.current?.scrollIntoView({ behavior: 'smooth' }), 100); }} />
                        <MetricCard icon={Clock} color="#F97316" label="Pending Acción" value={pendingAction}
                            onClick={() => { setSelectedStatus('pending_action'); setTimeout(() => listRef.current?.scrollIntoView({ behavior: 'smooth' }), 100); }} />
                        <MetricCard icon={AlertTriangle} color="#EF4444" label="Con Retraso" value={delayed} border
                            onClick={() => { setSelectedStatus('delayed'); setTimeout(() => listRef.current?.scrollIntoView({ behavior: 'smooth' }), 100); }} />
                    </div>
                </div>

                {/* 2. FLUJO DE WORK MANAGEMENT */}
                <div className="bg-white rounded-2xl p-4 border" style={{ borderColor: '#E2E8F0' }}>
                    <div className="text-sm font-bold mb-4" style={{ color: '#0F172A' }}>Flujo de Work Management</div>
                    <div className="space-y-3 mb-4">
                        {flowDist.map((item, idx) => (
                            <button
                                key={item.key}
                                onClick={() => {
                                    const next = selectedStatus === item.key ? 'all' : item.key;
                                    setSelectedStatus(next);
                                    setTimeout(() => listRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                                }}
                                className="w-full transition-all active:scale-98"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: item.color }}>
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-semibold" style={{ color: '#64748B' }}>{item.label}</span>
                                            <span className="text-sm font-bold" style={{ color: item.color }}>{item.count}</span>
                                        </div>
                                        <div className="h-2 rounded-full" style={{ backgroundColor: '#E2E8F0' }}>
                                            <div className="h-full rounded-full transition-all" style={{
                                                width: `${enriched.length > 0 ? (item.count / enriched.length) * 100 : 0}%`,
                                                backgroundColor: item.color,
                                            }} />
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5" style={{ color: '#CBD5E1' }} />
                                </div>
                            </button>
                        ))}
                    </div>
                    <div className="pt-3 border-t flex items-center justify-between" style={{ borderColor: '#E2E8F0' }}>
                        <span className="text-xs font-semibold" style={{ color: '#64748B' }}>Total en flujo</span>
                        <span className="text-lg font-bold" style={{ color: '#047857' }}>{enriched.length} Avisos</span>
                    </div>
                </div>

                {/* 3. DETECCIÓN DE PROBLEMAS */}
                {(delayedWRs.length > 0 || noProgressWRs.length > 0 || atRiskWRs.length > 0) && (
                    <div>
                        <div className="text-xs font-semibold mb-3" style={{ color: '#64748B', letterSpacing: '0.05em' }}>
                            DETECCIÓN DE PROBLEMAS
                        </div>

                        {delayedWRs.length > 0 && (
                            <ProblemCard
                                icon={AlertTriangle} iconBg="#FEE2E2" iconColor="#EF4444"
                                gradient="from-red-50 to-orange-50" border="#FCA5A5"
                                title={`${delayedWRs.length} Avisos Atrasados`}
                                subtitle="Requieren atención inmediata"
                                titleColor="#991B1B" subtitleColor="#7C2D12"
                                items={delayedWRs} badgeBg="#FEE2E2" badgeColor="#991B1B"
                            />
                        )}

                        {noProgressWRs.length > 0 && (
                            <ProblemCard
                                icon={Clock} iconBg="#FEF3C7" iconColor="#F97316"
                                gradient="from-yellow-50 to-orange-50" border="#FDE68A"
                                title={`${noProgressWRs.length} Avisos Sin Avance`}
                                subtitle="No han tenido progreso en las últimas 48h"
                                titleColor="#92400E" subtitleColor="#78350F"
                                items={noProgressWRs} badgeBg="#FEF3C7" badgeColor="#92400E"
                            />
                        )}

                        {atRiskWRs.length > 0 && (
                            <ProblemCard
                                icon={Zap} iconBg="#FED7AA" iconColor="#F97316"
                                gradient="from-orange-50 to-yellow-50" border="#FDBA74"
                                title={`${atRiskWRs.length} Avisos de Alta Priority Sin Revisar`}
                                subtitle="P1/P2 creados pero no aprobados aún"
                                titleColor="#9A3412" subtitleColor="#7C2D12"
                                items={atRiskWRs} badgeBg="#FED7AA" badgeColor="#9A3412"
                            />
                        )}
                    </div>
                )}

                {/* 4. CARGA DE TRABAJO POR PRIORIDAD */}
                <div className="bg-white rounded-2xl p-4 border" style={{ borderColor: '#E2E8F0' }}>
                    <div className="text-sm font-bold mb-4" style={{ color: '#0F172A' }}>Carga de Trabajo por Priority</div>
                    <div className="space-y-3">
                        {loadByPriority.map(item => {
                            const pct = enriched.length > 0 ? Math.round((item.count / enriched.length) * 100) : 0;
                            return (
                                <div key={item.priority}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: item.color + '20', color: item.color }}>
                                                {item.label}
                                            </span>
                                            <span className="text-xs font-semibold" style={{ color: '#64748B' }}>{pct}% de carga</span>
                                        </div>
                                        <span className="text-sm font-bold" style={{ color: item.color }}>{item.count} Avisos</span>
                                    </div>
                                    <div className="h-2 rounded-full" style={{ backgroundColor: '#E2E8F0' }}>
                                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: item.color }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 5. EVOLUCIÓN DEL SISTEMA */}
                <div className="bg-white rounded-2xl p-4 border" style={{ borderColor: '#E2E8F0' }}>
                    <div className="text-sm font-bold mb-4" style={{ color: '#0F172A' }}>Evolución del Sistema (últimos 30 días)</div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center p-3 rounded-xl" style={{ backgroundColor: '#F1F5F9' }}>
                            <div className="text-xs font-medium mb-1" style={{ color: '#64748B' }}>Creados</div>
                            <div className="text-2xl font-bold" style={{ color: '#3B82F6' }}>{enriched.length}</div>
                        </div>
                        <div className="text-center p-3 rounded-xl" style={{ backgroundColor: '#F1F5F9' }}>
                            <div className="text-xs font-medium mb-1" style={{ color: '#64748B' }}>Resueltos</div>
                            <div className="text-2xl font-bold" style={{ color: '#10B981' }}>{closedCount}</div>
                        </div>
                    </div>
                    <div className="p-3 rounded-xl flex items-center gap-3" style={{ backgroundColor: trend === 'accumulating' ? '#FEE2E2' : '#D1FAE5' }}>
                        {trend === 'accumulating' ? (
                            <>
                                <TrendingUp className="w-5 h-5" style={{ color: '#EF4444' }} />
                                <div className="flex-1">
                                    <div className="text-sm font-bold" style={{ color: '#991B1B' }}>Sistema en acumulación</div>
                                    <div className="text-xs" style={{ color: '#7C2D12' }}>
                                        Se crean más avisos de los que se resuelven (+{enriched.length - closedCount})
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <TrendingDown className="w-5 h-5" style={{ color: '#10B981' }} />
                                <div className="flex-1">
                                    <div className="text-sm font-bold" style={{ color: '#047857' }}>Sistema bajo control</div>
                                    <div className="text-xs" style={{ color: '#064E3B' }}>Se resuelven más avisos de los que se crean</div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* 6. LISTA OPERATIVA DE WR */}
                <div ref={listRef}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-bold" style={{ color: '#0F172A' }}>Avisos Activos</div>
                        {selectedStatus !== 'all' && (
                            <button onClick={() => setSelectedStatus('all')} className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: '#ECFDF5', color: '#047857' }}>
                                View alls
                            </button>
                        )}
                    </div>
                    <div className="space-y-3">
                        {filteredWRs.length === 0 && (
                            <div className="bg-white rounded-2xl p-6 border text-center" style={{ borderColor: '#E2E8F0' }}>
                                <div className="text-sm" style={{ color: '#94A3B8' }}>No hay avisos en este estado</div>
                            </div>
                        )}
                        {filteredWRs.map(wr => {
                            const priorityColors = pc(wr.pri);
                            const step = FLOW_STEPS.find(s => s.key === wr.flow);
                            return (
                                <button
                                    key={wr.request_id || wr.id}
                                    onClick={() => navigate(`/m/wr/${wr.request_id || wr.id}`)}
                                    className="w-full bg-white rounded-2xl p-4 border transition-all active:scale-98 text-left"
                                    style={{
                                        borderColor: wr.isDelayed ? '#FCA5A5' : '#E2E8F0',
                                        borderWidth: wr.isDelayed ? '2px' : '1px',
                                    }}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <span className="text-xs font-semibold" style={{ color: '#64748B' }}>
                                                    {(wr.request_id || wr.id || '').slice(0, 12)}
                                                </span>
                                                {wr.isDelayed && (
                                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>
                                                        ATRASADO
                                                    </span>
                                                )}
                                                {wr.noProgress && (
                                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
                                                        SIN AVANCE
                                                    </span>
                                                )}
                                                <SLABadge priority={wr.pri} createdAt={wr.created_at} slaDeadline={wr.sla_deadline} />
                                            </div>
                                            <div className="text-sm font-bold mb-1" style={{ color: '#0F172A' }}>{wr.tag}</div>
                                            <div className="text-sm mb-2 line-clamp-2" style={{ color: '#475569' }}>{wr.desc}</div>
                                        </div>
                                        <div className="px-3 py-1.5 rounded-full text-xs font-bold ml-2 text-center" style={{ backgroundColor: priorityColors.bg, color: priorityColors.text }}>
                                            <div>{priorityColors.label || wr.pri}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {step && (
                                                <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: step.color + '20', color: step.color }}>
                                                    {step.label}
                                                </span>
                                            )}
                                            {wr.work_class && (
                                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{
                                                    backgroundColor: wr.work_class === 'NO_PROGRAMADO' ? '#FEE2E2' : '#DBEAFE',
                                                    color: wr.work_class === 'NO_PROGRAMADO' ? '#991B1B' : '#1E40AF',
                                                }}>
                                                    {wr.work_class === 'NO_PROGRAMADO' ? 'No Prog.' : 'Programado'}
                                                </span>
                                            )}
                                            {wr.assignee && (
                                                <span className="text-xs" style={{ color: '#64748B' }}>• {wr.assignee}</span>
                                            )}
                                        </div>
                                        <ChevronRight className="w-5 h-5 flex-shrink-0" style={{ color: '#CBD5E1' }} />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── SUBCOMPONENTS ───────────────────────────────────────────────────────────

function MetricCard({ icon: Icon, color, label, value, border, onClick }) {
    return (
        <button
            onClick={onClick}
            className="bg-white rounded-2xl p-4 border text-left transition-all active:scale-95 w-full"
            style={{
                borderColor: border ? '#FCA5A5' : '#E2E8F0',
                borderWidth: border ? '2px' : '1px',
            }}
        >
            <div className="flex items-center gap-2 mb-2">
                <Icon className="w-5 h-5" style={{ color }} />
                <span className="text-xs font-medium" style={{ color: '#64748B' }}>{label}</span>
            </div>
            <div className="text-2xl font-bold" style={{ color }}>{value}</div>
        </button>
    );
}

function ProblemCard({ icon: Icon, iconBg, iconColor, gradient, border, title, subtitle, titleColor, subtitleColor, items, badgeBg, badgeColor }) {
    return (
        <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-4 border-2 mb-3`} style={{ borderColor: border }}>
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: iconBg }}>
                    <Icon className="w-5 h-5" style={{ color: iconColor }} />
                </div>
                <div className="flex-1">
                    <div className="text-sm font-bold mb-1" style={{ color: titleColor }}>{title}</div>
                    <div className="text-xs mb-2" style={{ color: subtitleColor }}>{subtitle}</div>
                    <div className="flex flex-wrap gap-1">
                        {items.slice(0, 5).map(wr => (
                            <span key={wr.request_id || wr.id} className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: badgeBg, color: badgeColor }}>
                                {(wr.request_id || wr.id || '').slice(0, 10)}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
