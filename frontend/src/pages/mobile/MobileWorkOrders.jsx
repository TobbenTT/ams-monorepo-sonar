import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
    Filter, Search, Clock, PlayCircle, PauseCircle, CheckCircle2,
    AlertCircle, Circle, UserPlus,
} from 'lucide-react';
import * as api from '../../api';

const STATUS_CONFIG = {
    DRAFT:              { label: 'Creada',       color: '#94A3B8', bg: '#F1F5F9',  step: 1 },
    PENDING:            { label: 'Pendiente',    color: '#3B82F6', bg: '#DBEAFE',  step: 2 },
    ASSIGNED:           { label: 'Asignada',     color: '#06B6D4', bg: '#CFFAFE',  step: 4 },
    IN_PROGRESS:        { label: 'En Ejecución', color: '#10B981', bg: '#D1FAE5',  step: 5 },
    COMPLETED:          { label: 'Cerrada',      color: '#6366F1', bg: '#E0E7FF',  step: 7 },
};
const sc = (s) => STATUS_CONFIG[s] || { label: s || '—', color: '#94A3B8', bg: '#F1F5F9', step: 0 };

const PRIORITY_COLORS = {
    P1: { bg: '#FEE2E2', text: '#991B1B' },
    P2: { bg: '#FED7AA', text: '#9A3412' },
    P3: { bg: '#FEF3C7', text: '#92400E' },
    P4: { bg: '#DBEAFE', text: '#1E40AF' },
};
const pc = (p) => PRIORITY_COLORS[p] || { bg: '#F1F5F9', text: '#475569' };

const TYPE_PRIORITY = { Correctivo: 'P1', Preventivo: 'P3', Inspección: 'P4', Predictivo: 'P2' };

function mapChecklistToWO(cl) {
    const total = cl.total_items || 0;
    const done = cl.completed_items || 0;
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;
    const estMinutes = total * 15;
    const estTime = estMinutes >= 60 ? `${Math.round(estMinutes / 60)}h` : `${estMinutes}min`;
    const type = cl.task_type || 'Correctivo';
    const priority = TYPE_PRIORITY[type] || 'P3';
    const woId = cl.work_package_code || `WO-${(cl.checklist_id || '').slice(-4).toUpperCase()}`;
    const createdAt = cl.created_at ? new Date(cl.created_at) : null;
    const isDelayed = cl.status === 'IN_PROGRESS' && createdAt && (Date.now() - createdAt.getTime()) / 36e5 > 24;

    return {
        id: cl.checklist_id,
        woId,
        equipment: cl.equipment_tag || 'Sin equipo',
        equipmentName: cl.equipment_name || cl.work_package_name || '',
        type,
        priority,
        status: cl.status || 'DRAFT',
        assignee: cl.assigned_to || '',
        estimatedTime: estTime,
        progress,
        delayed: isDelayed,
    };
}

export default function MobileWorkOrders() {
    const { mobileRole, plant } = useOutletContext();
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        api.listChecklists({ plant_id: plant })
            .then(res => {
                const list = res?.data || res || [];
                setTasks((Array.isArray(list) ? list : []).map(mapChecklistToWO));
            })
            .catch(() => setTasks([]))
            .finally(() => setLoading(false));
    }, [plant]);

    const filterOptions = mobileRole === 'supervisor'
        ? [
            { value: 'all', label: 'Todas' },
            { value: 'unassigned', label: 'Sin Asignar' },
            { value: 'ASSIGNED', label: 'Asignadas' },
            { value: 'IN_PROGRESS', label: 'En Progreso' },
            { value: 'delayed', label: 'Atrasadas' },
        ]
        : [
            { value: 'all', label: 'Todas' },
            { value: 'ASSIGNED', label: 'Asignadas' },
            { value: 'IN_PROGRESS', label: 'En Progreso' },
            { value: 'delayed', label: 'Atrasadas' },
        ];

    const filtered = tasks.filter(wo => {
        // Search filter
        if (search) {
            const q = search.toLowerCase();
            const match = wo.woId.toLowerCase().includes(q)
                || wo.equipment.toLowerCase().includes(q)
                || wo.equipmentName.toLowerCase().includes(q);
            if (!match) return false;
        }
        // Status filter
        if (filter === 'all') return true;
        if (filter === 'unassigned') return !wo.assignee;
        if (filter === 'delayed') return wo.delayed;
        return wo.status === filter;
    });

    const getCount = (val) => {
        if (val === 'all') return tasks.length;
        if (val === 'unassigned') return tasks.filter(w => !w.assignee).length;
        if (val === 'delayed') return tasks.filter(w => w.delayed).length;
        return tasks.filter(w => w.status === val).length;
    };

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
                <h1 className="text-xl font-bold mb-4" style={{ color: '#0F172A' }}>
                    {mobileRole === 'supervisor' ? 'Gestión de Tareas' : 'Mis Tareas'}
                </h1>

                {/* SEARCH */}
                <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#94A3B8' }} />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar por OT, equipo o TAG..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none"
                        style={{ borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' }}
                    />
                </div>

                {/* FILTERS */}
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {filterOptions.map(opt => {
                        const count = getCount(opt.value);
                        return (
                            <button
                                key={opt.value}
                                onClick={() => setFilter(opt.value)}
                                className="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2"
                                style={{
                                    backgroundColor: filter === opt.value ? '#047857' : '#FFFFFF',
                                    color: filter === opt.value ? '#FFFFFF' : '#475569',
                                    border: filter === opt.value ? 'none' : '1px solid #E2E8F0',
                                }}
                            >
                                {opt.label}
                                {filter === opt.value && (
                                    <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* WORK ORDERS LIST */}
            <div className="p-4 space-y-3">
                {filtered.length === 0 && (
                    <div className="bg-white rounded-2xl p-6 border text-center" style={{ borderColor: '#E2E8F0' }}>
                        <div className="text-sm" style={{ color: '#94A3B8' }}>No hay tareas{filter !== 'all' ? ' con este filtro' : ''}</div>
                    </div>
                )}

                {filtered.map(wo => {
                    const statusCfg = sc(wo.status);
                    const priorityColors = pc(wo.priority);

                    return (
                        <div
                            key={wo.id}
                            className="bg-white rounded-2xl p-4 border"
                            style={{
                                borderColor: wo.delayed ? '#FCA5A5' : '#E2E8F0',
                                borderWidth: wo.delayed ? '2px' : '1px',
                            }}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-semibold" style={{ color: '#64748B' }}>{wo.woId}</span>
                                        {wo.delayed && (
                                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>
                                                <AlertCircle className="w-3 h-3" />
                                                ATRASADA
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm font-bold mb-1" style={{ color: '#0F172A' }}>{wo.equipment}</div>
                                    <div className="text-sm mb-2" style={{ color: '#475569' }}>{wo.equipmentName}</div>
                                </div>
                                <div className="px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap" style={{ backgroundColor: priorityColors.bg, color: priorityColors.text }}>
                                    {wo.priority}
                                </div>
                            </div>

                            {/* WORKFLOW VISUAL */}
                            <div className="mb-3 p-3 rounded-xl" style={{ backgroundColor: '#F8FAFC' }}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold" style={{ color: '#64748B' }}>ESTADO EN FLUJO</span>
                                    <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}>
                                        {statusCfg.label}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5, 6, 7].map(step => (
                                        <div
                                            key={step}
                                            className="flex-1 h-1.5 rounded-full"
                                            style={{ backgroundColor: step <= statusCfg.step ? statusCfg.color : '#E2E8F0' }}
                                        />
                                    ))}
                                </div>
                                <div className="flex items-center justify-between mt-1 text-xs" style={{ color: '#94A3B8' }}>
                                    <span>Creada</span>
                                    <span>En Ejecución</span>
                                    <span>Cerrada</span>
                                </div>
                            </div>

                            {/* Progress Bar (if in progress) */}
                            {wo.status === 'IN_PROGRESS' && (
                                <div className="mb-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-medium" style={{ color: '#64748B' }}>Avance</span>
                                        <span className="text-xs font-bold" style={{ color: '#10B981' }}>{wo.progress}%</span>
                                    </div>
                                    <div className="h-2 rounded-full" style={{ backgroundColor: '#E2E8F0' }}>
                                        <div className="h-full rounded-full transition-all" style={{ width: `${wo.progress}%`, backgroundColor: '#10B981' }} />
                                    </div>
                                </div>
                            )}

                            {/* Meta Info */}
                            <div className="flex items-center gap-3 mb-3 text-xs">
                                <span className="px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: '#F1F5F9', color: '#475569' }}>
                                    {wo.type}
                                </span>
                                <div className="flex items-center gap-1" style={{ color: '#64748B' }}>
                                    <Clock className="w-3 h-3" />
                                    {wo.estimatedTime}
                                </div>
                                {wo.assignee && (
                                    <div className="flex items-center gap-1" style={{ color: '#64748B' }}>
                                        <Circle className="w-2 h-2 fill-current" />
                                        {wo.assignee}
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-3 border-t" style={{ borderColor: '#E2E8F0' }}>
                                {mobileRole === 'maintainer' && (
                                    <>
                                        {(wo.status === 'ASSIGNED' || wo.status === 'PENDING' || wo.status === 'DRAFT') && (
                                            <button
                                                onClick={() => navigate(`/m/tarea/${wo.id}`)}
                                                className="flex-1 px-4 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 flex items-center justify-center gap-2"
                                                style={{ backgroundColor: '#047857', color: '#FFFFFF' }}
                                            >
                                                <PlayCircle className="w-4 h-4" />
                                                Iniciar
                                            </button>
                                        )}
                                        {wo.status === 'IN_PROGRESS' && (
                                            <>
                                                <button
                                                    className="px-4 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 flex items-center gap-2"
                                                    style={{ backgroundColor: '#F97316', color: '#FFFFFF' }}
                                                >
                                                    <PauseCircle className="w-4 h-4" />
                                                    Pausar
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/m/tarea/${wo.id}`)}
                                                    className="flex-1 px-4 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
                                                    style={{ backgroundColor: '#10B981', color: '#FFFFFF' }}
                                                >
                                                    Continuar
                                                </button>
                                            </>
                                        )}
                                        {wo.status === 'COMPLETED' && (
                                            <button
                                                className="flex-1 px-4 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 flex items-center justify-center gap-2"
                                                style={{ backgroundColor: '#10B981', color: '#FFFFFF' }}
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                                Finalizar
                                            </button>
                                        )}
                                    </>
                                )}

                                {mobileRole === 'supervisor' && (
                                    <>
                                        {!wo.assignee && (wo.status === 'DRAFT' || wo.status === 'PENDING') && (
                                            <button
                                                className="flex-1 px-4 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 flex items-center justify-center gap-2"
                                                style={{ backgroundColor: '#047857', color: '#FFFFFF' }}
                                            >
                                                <UserPlus className="w-4 h-4" />
                                                Asignar
                                            </button>
                                        )}
                                        <button
                                            onClick={() => navigate(`/m/tarea/${wo.id}`)}
                                            className="flex-1 px-4 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
                                            style={{ border: '1px solid #E2E8F0', color: '#047857' }}
                                        >
                                            Ver Detalle
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
