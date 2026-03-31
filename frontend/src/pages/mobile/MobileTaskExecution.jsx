import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    PlayCircle, PauseCircle, CheckCircle2, Circle, FileText,
    Wrench, Camera, AlertCircle, Clock, ChevronLeft, ChevronRight,
} from 'lucide-react';
import * as api from '../../api';

const TYPE_PRIORITY = { Correctivo: 'P1', Preventivo: 'P3', Inspección: 'P4', Predictivo: 'P2' };
const PRIORITY_COLORS = {
    P1: { bg: '#FEE2E2', text: '#991B1B' },
    P2: { bg: '#FED7AA', text: '#9A3412' },
    P3: { bg: '#FEF3C7', text: '#92400E' },
    P4: { bg: '#DBEAFE', text: '#1E40AF' },
};

function formatTimer(seconds) {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
}

export default function MobileTaskExecution() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [checklist, setChecklist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('running'); // running | paused
    const [activeTab, setActiveTab] = useState('checklist');
    const [observations, setObservations] = useState('');
    const [additionalWork, setAdditionalWork] = useState('');
    const [items, setItems] = useState([]);
    const [elapsed, setElapsed] = useState(0);
    const timerRef = useRef(null);

    // Fetch checklist
    useEffect(() => {
        api.getChecklist(id)
            .then(cl => {
                setChecklist(cl);
                // Build items from checklist_items or steps
                const raw = cl.checklist_items || cl.steps || [];
                const mapped = raw.map((item, idx) => ({
                    id: item.id || item.step_id || `${idx}`,
                    seq: item.sequence || item.seq || idx + 1,
                    task: item.description || item.task || item.instruction || item.text || `Paso ${idx + 1}`,
                    completed: item.completed || item.status === 'COMPLETED' || false,
                }));
                setItems(mapped);

                // If already started, calculate elapsed from started_at
                if (cl.started_at) {
                    const startMs = new Date(cl.started_at).getTime();
                    setElapsed(Math.floor((Date.now() - startMs) / 1000));
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [id]);

    // Timer
    useEffect(() => {
        if (status === 'running') {
            timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [status]);

    const toggleItem = useCallback((itemId) => {
        setItems(prev => prev.map(it =>
            it.id === itemId ? { ...it, completed: !it.completed } : it
        ));
        // Also update on server
        const item = items.find(it => it.id === itemId);
        if (item) {
            api.completeChecklistStep(id, {
                step_id: itemId,
                completed: !item.completed,
            }).catch(() => {});
        }
    }, [id, items]);

    const completedCount = items.filter(it => it.completed).length;
    const progress = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

    const handleComplete = async () => {
        try {
            await api.closeChecklist(id, {
                closure_summary: { observations, additional_work: additionalWork },
            });
            navigate('/m/tareas');
        } catch { /* stay on page */ }
    };

    const handleCreateWR = () => {
        navigate('/m/crear-wr');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen" style={{ backgroundColor: '#F8FAFC' }}>
                <div className="w-8 h-8 border-3 border-t-emerald-600 border-gray-200 rounded-full animate-spin" />
            </div>
        );
    }

    if (!checklist) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4" style={{ backgroundColor: '#F8FAFC' }}>
                <div className="text-sm" style={{ color: '#94A3B8' }}>Tarea no encontrada</div>
                <button onClick={() => navigate('/m/tareas')} className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ backgroundColor: '#047857', color: '#FFF' }}>
                    Volver
                </button>
            </div>
        );
    }

    const woId = checklist.work_package_code || `WO-${(checklist.checklist_id || '').slice(-4).toUpperCase()}`;
    const equipTag = checklist.equipment_tag || 'Sin equipo';
    const equipName = checklist.equipment_name || checklist.work_package_name || '';
    const taskType = checklist.task_type || 'Correctivo';
    const priority = TYPE_PRIORITY[taskType] || 'P3';
    const pColors = PRIORITY_COLORS[priority] || { bg: '#F1F5F9', text: '#475569' };

    return (
        <div className="min-h-screen pb-40" style={{ backgroundColor: '#F8FAFC' }}>
            {/* HEADER */}
            <div className="bg-white border-b" style={{ borderColor: '#E2E8F0' }}>
                <div className="p-4">
                    {/* Back button + WO info */}
                    <div className="flex items-center gap-3 mb-3">
                        <button onClick={() => navigate('/m/tareas')} className="p-1">
                            <ChevronLeft className="w-5 h-5" style={{ color: '#64748B' }} />
                        </button>
                        <div className="flex-1">
                            <div className="text-xs font-semibold mb-1" style={{ color: '#64748B' }}>
                                {woId} • {taskType}
                            </div>
                            <h1 className="text-lg font-bold" style={{ color: '#0F172A' }}>
                                {equipTag} - {equipName}
                            </h1>
                            <div className="text-sm mt-1" style={{ color: '#64748B' }}>
                                {checklist.pre_task_notes || equipName}
                            </div>
                        </div>
                        <div className="px-3 py-1.5 rounded-full text-xs font-bold" style={{ backgroundColor: pColors.bg, color: pColors.text }}>
                            {priority}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold" style={{ color: '#64748B' }}>Progress General</span>
                            <span className="text-sm font-bold" style={{ color: '#10B981' }}>{progress}%</span>
                        </div>
                        <div className="h-3 rounded-full" style={{ backgroundColor: '#E2E8F0' }}>
                            <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: '#10B981' }} />
                        </div>
                    </div>

                    {/* Timer & Status */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {status === 'running' ? (
                                <>
                                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#10B981' }} />
                                    <span className="text-sm font-semibold" style={{ color: '#10B981' }}>En Progress</span>
                                </>
                            ) : (
                                <>
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#F97316' }} />
                                    <span className="text-sm font-semibold" style={{ color: '#F97316' }}>Pausada</span>
                                </>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-sm font-bold" style={{ color: '#0F172A' }}>
                            <Clock className="w-4 h-4" />
                            {formatTimer(elapsed)}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-t" style={{ borderColor: '#E2E8F0' }}>
                    {[
                        { value: 'checklist', label: 'Checklist', icon: CheckCircle2 },
                        { value: 'manuals', label: 'Manuales', icon: FileText },
                        { value: 'troubleshooting', label: 'Solución', icon: Wrench },
                    ].map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.value}
                                onClick={() => setActiveTab(tab.value)}
                                className="flex-1 flex items-center justify-center gap-2 py-3 border-b-2 transition-all"
                                style={{
                                    borderColor: activeTab === tab.value ? '#047857' : 'transparent',
                                    color: activeTab === tab.value ? '#047857' : '#64748B',
                                }}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="text-xs font-semibold">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* CONTENT */}
            <div className="p-4 space-y-4">
                {activeTab === 'checklist' && (
                    <>
                        {/* Checklist Items */}
                        <div className="space-y-2">
                            {items.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => toggleItem(item.id)}
                                    className="w-full bg-white rounded-xl p-4 border flex items-center gap-3 transition-all active:scale-98"
                                    style={{ borderColor: item.completed ? '#10B981' : '#E2E8F0' }}
                                >
                                    {item.completed ? (
                                        <CheckCircle2 className="w-6 h-6 flex-shrink-0" style={{ color: '#10B981' }} />
                                    ) : (
                                        <Circle className="w-6 h-6 flex-shrink-0" style={{ color: '#CBD5E1' }} />
                                    )}
                                    <span
                                        className="flex-1 text-left text-sm font-medium"
                                        style={{
                                            color: item.completed ? '#64748B' : '#0F172A',
                                            textDecoration: item.completed ? 'line-through' : 'none',
                                        }}
                                    >
                                        {item.task}
                                    </span>
                                    {!item.completed && (
                                        <ChevronRight className="w-5 h-5 flex-shrink-0" style={{ color: '#CBD5E1' }} />
                                    )}
                                </button>
                            ))}
                            {items.length === 0 && (
                                <div className="bg-white rounded-2xl p-6 border text-center" style={{ borderColor: '#E2E8F0' }}>
                                    <div className="text-sm" style={{ color: '#94A3B8' }}>Sin pasos definidos</div>
                                </div>
                            )}
                        </div>

                        {/* Evidence Capture */}
                        <div className="bg-white rounded-2xl p-4 border" style={{ borderColor: '#E2E8F0' }}>
                            <div className="text-xs font-semibold mb-3" style={{ color: '#64748B', letterSpacing: '0.05em' }}>
                                EVIDENCIA
                            </div>
                            <button className="w-full p-4 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 transition-all active:scale-98" style={{ borderColor: '#CBD5E1' }}>
                                <Camera className="w-5 h-5" style={{ color: '#64748B' }} />
                                <span className="text-sm font-medium" style={{ color: '#64748B' }}>Capturar foto del trabajo</span>
                            </button>
                        </div>

                        {/* Observations */}
                        <div className="bg-white rounded-2xl p-4 border" style={{ borderColor: '#E2E8F0' }}>
                            <label className="text-xs font-semibold mb-3 block" style={{ color: '#64748B', letterSpacing: '0.05em' }}>
                                OBSERVACIONES
                            </label>
                            <textarea
                                value={observations}
                                onChange={e => setObservations(e.target.value)}
                                placeholder="Registra hallazgos o comentarios adicionales..."
                                className="w-full h-24 p-3 rounded-xl border text-sm resize-none outline-none"
                                style={{ borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' }}
                            />
                        </div>

                        {/* Additional Work Detected */}
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border" style={{ borderColor: '#FDE68A' }}>
                            <div className="flex items-start gap-3 mb-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FEF3C7' }}>
                                    <AlertCircle className="w-5 h-5" style={{ color: '#F97316' }} />
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs font-semibold mb-1" style={{ color: '#92400E', letterSpacing: '0.05em' }}>
                                        ¿TRABAJO ADICIONAL DETECTADO?
                                    </div>
                                    <div className="text-xs mb-3" style={{ color: '#78350F' }}>
                                        Describe cualquier problema adicional encontrado
                                    </div>
                                    <textarea
                                        value={additionalWork}
                                        onChange={e => setAdditionalWork(e.target.value)}
                                        placeholder="Ej: Rodamiento con ruido anormal..."
                                        className="w-full h-20 p-3 rounded-xl border text-sm resize-none outline-none"
                                        style={{ borderColor: '#FDE68A', backgroundColor: '#FFFFFF' }}
                                    />
                                </div>
                            </div>
                            {additionalWork && (
                                <button
                                    onClick={handleCreateWR}
                                    className="w-full py-2 rounded-lg text-xs font-semibold"
                                    style={{ backgroundColor: '#F97316', color: '#FFFFFF' }}
                                >
                                    Crear Work Request
                                </button>
                            )}
                        </div>
                    </>
                )}

                {activeTab === 'manuals' && (
                    <div className="space-y-3">
                        <div className="bg-white rounded-2xl p-4 border flex items-center justify-between" style={{ borderColor: '#E2E8F0' }}>
                            <div className="flex items-center gap-3">
                                <FileText className="w-6 h-6" style={{ color: '#047857' }} />
                                <div>
                                    <div className="text-sm font-bold" style={{ color: '#0F172A' }}>Manual de Mantenimiento</div>
                                    <div className="text-xs" style={{ color: '#64748B' }}>{equipTag} Rev. 1.0</div>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5" style={{ color: '#CBD5E1' }} />
                        </div>
                        <div className="bg-white rounded-2xl p-4 border flex items-center justify-between" style={{ borderColor: '#E2E8F0' }}>
                            <div className="flex items-center gap-3">
                                <FileText className="w-6 h-6" style={{ color: '#047857' }} />
                                <div>
                                    <div className="text-sm font-bold" style={{ color: '#0F172A' }}>Procedimiento de Trabajo</div>
                                    <div className="text-xs" style={{ color: '#64748B' }}>PROC-{taskType.slice(0, 3).toUpperCase()}-001</div>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5" style={{ color: '#CBD5E1' }} />
                        </div>
                    </div>
                )}

                {activeTab === 'troubleshooting' && (
                    <div className="space-y-3">
                        <div className="bg-white rounded-2xl p-4 border" style={{ borderColor: '#E2E8F0' }}>
                            <div className="text-sm font-bold mb-2" style={{ color: '#0F172A' }}>
                                Solución de Problemas
                            </div>
                            <div className="text-xs mb-3" style={{ color: '#64748B' }}>
                                Causas comunes y soluciones para {equipTag}
                            </div>
                            <ul className="space-y-2 text-xs" style={{ color: '#475569' }}>
                                <li className="flex items-start gap-2">
                                    <span style={{ color: '#10B981' }}>•</span>
                                    Verificar condiciones de operación
                                </li>
                                <li className="flex items-start gap-2">
                                    <span style={{ color: '#10B981' }}>•</span>
                                    Revisar registros de mantenimiento anterior
                                </li>
                                <li className="flex items-start gap-2">
                                    <span style={{ color: '#10B981' }}>•</span>
                                    Consultar manual del fabricante
                                </li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>

            {/* BOTTOM ACTIONS - Fixed */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4" style={{ borderColor: '#E2E8F0' }}>
                <div className="max-w-md mx-auto space-y-3">
                    {/* Pause/Resume & Complete */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setStatus(s => s === 'running' ? 'paused' : 'running')}
                            className="py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                            style={{
                                backgroundColor: status === 'running' ? '#F97316' : '#10B981',
                                color: '#FFFFFF',
                            }}
                        >
                            {status === 'running' ? (
                                <><PauseCircle className="w-5 h-5" /> Pausar</>
                            ) : (
                                <><PlayCircle className="w-5 h-5" /> Reanudar</>
                            )}
                        </button>
                        <button
                            onClick={handleComplete}
                            disabled={progress < 100}
                            className="py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                            style={{ backgroundColor: '#047857', color: '#FFFFFF' }}
                        >
                            <CheckCircle2 className="w-5 h-5" />
                            Completar
                        </button>
                    </div>
                    {/* Partial */}
                    <button
                        onClick={() => navigate('/m/tareas')}
                        className="w-full py-3 rounded-xl text-sm font-semibold border-2 transition-all active:scale-95"
                        style={{ borderColor: '#E2E8F0', color: '#64748B' }}
                    >
                        Save Progress (Cambio de Turno)
                    </button>
                </div>
            </div>
        </div>
    );
}
