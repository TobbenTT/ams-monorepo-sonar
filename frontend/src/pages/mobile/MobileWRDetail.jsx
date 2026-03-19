import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Clock, MapPin, AlertTriangle, Wrench, Package,
    CheckCircle2, XCircle, ChevronRight, FileText, User, Calendar,
    Users, Timer, Shield, Building, Zap, MessageSquare,
} from 'lucide-react';
import { useToast } from '../../components/Toast';
import * as api from '../../api';

const PRIORITY_META = {
    P1: { label: '1 - Urgente', color: '#EF4444', bg: '#FEE2E2', sub: '< 24 horas', claseOT: 'PM03', claseOTLabel: 'No Programado' },
    P2: { label: '2 - Programa en Ejecución', color: '#F97316', bg: '#FED7AA', sub: '< 7 días', claseOT: 'PM03', claseOTLabel: 'No Programado' },
    P3: { label: '3 - Próximo Programa', color: '#EAB308', bg: '#FEF3C7', sub: '7 - 14 días', claseOT: 'PM01', claseOTLabel: 'Programado' },
    P4: { label: '4 - Sin Prioridad', color: '#3B82F6', bg: '#DBEAFE', sub: '> 14 días', claseOT: 'PM01', claseOTLabel: 'Programado' },
};

const ACTIVITY_CLASS_LABELS = {
    CR: 'CR - Correctivo',
    MC: 'MC - Monitoreo Condición',
    MJ: 'MJ - Mejora',
    IO: 'IO - Incidente Operacional',
    IP: 'IP - Imprevisto',
    PV: 'PV - Preventivo',
    PD: 'PD - Predictivo',
    CC: 'CC - Cambio Componentes',
    PP: 'PP - Parada Mayor',
};

const STATUS_META = {
    DRAFT: { label: 'Borrador', color: '#94A3B8', step: 0 },
    PENDING_VALIDATION: { label: 'En Revisión', color: '#3B82F6', step: 1 },
    VALIDATED: { label: 'Validado', color: '#10B981', step: 2 },
    APPROVED: { label: 'Aprobado', color: '#10B981', step: 2 },
    ACTIVE: { label: 'Activo', color: '#F59E0B', step: 3 },
    IN_PROGRESS: { label: 'En Progreso', color: '#F59E0B', step: 3 },
    ASSIGNED: { label: 'Asignado', color: '#8B5CF6', step: 3 },
    SCHEDULED: { label: 'Programado', color: '#8B5CF6', step: 3 },
    COMPLETED: { label: 'Completado', color: '#047857', step: 4 },
    CLOSED: { label: 'Cerrado', color: '#6366F1', step: 4 },
    REJECTED: { label: 'Rechazado', color: '#EF4444', step: -1 },
};

const FLOW_STEPS = ['Creado', 'Revisión', 'Aprobado', 'Ejecución', 'Cerrado'];
const PLANT_CONDITION_LABELS = { operating: 'Operando', stopped: 'Detenida', partial: 'Parcial' };

function derivePriority(wr) {
    const p = wr.priority || wr.ai_classification?.priority_suggested || '';
    if (p.startsWith('1') || p === 'P1') return 'P1';
    if (p.startsWith('2') || p === 'P2') return 'P2';
    if (p.startsWith('4') || p === 'P4') return 'P4';
    return 'P3';
}

/**
 * Regex-based parser for old-format WRs where all form data was concatenated
 * into a single text block (with or without newlines).
 * Extracts known field labels and leaves the rest as pure description.
 */
function parseOldText(text) {
    if (!text) return {};
    const result = {};
    let cleaned = text;

    // Define extraction patterns — order matters (greedy patterns last)
    const extractions = [
        { key: 'suggestedAction', re: /Acci[oó]n sugerida:\s*(.+?)(?=\s*(?:Recursos:|Duraci[oó]n estimada:|Equipos especiales:|Condici[oó]n planta:|Prioridad:|Ubicaci[oó]n t[eé]cnica:|Materiales:|Cat[aá]logo falla|Parte objeto:|Causa:|$))/i },
        { key: 'resourcesText', re: /Recursos:\s*(.+?)(?=\s*(?:Duraci[oó]n estimada:|Equipos especiales:|Condici[oó]n planta:|Prioridad:|Ubicaci[oó]n t[eé]cnica:|Materiales:|Cat[aá]logo falla|Parte objeto:|Causa:|$))/i },
        { key: 'estimatedDurationText', re: /Duraci[oó]n estimada:\s*(\d+\.?\d*)h?/i },
        { key: 'specialEquipment', re: /Equipos especiales:\s*(.+?)(?=\s*(?:Condici[oó]n planta:|Prioridad:|Ubicaci[oó]n t[eé]cnica:|Materiales:|Cat[aá]logo falla|Parte objeto:|Causa:|$))/i },
        { key: 'plantCondition', re: /Condici[oó]n planta:\s*(\S+)/i },
        { key: 'priorityText', re: /Prioridad:\s*(\S+)/i },
        { key: 'locationText', re: /Ubicaci[oó]n t[eé]cnica:\s*(.+?)(?=\s*(?:Materiales:|Cat[aá]logo falla|Parte objeto:|Causa:|$))/i },
        { key: 'materialsText', re: /Materiales:\s*(.+?)(?=\s*(?:Cat[aá]logo falla|Parte objeto:|Causa:|$))/i },
        { key: '_catalogFull', re: /Cat[aá]logo falla\s*\[(.+?)\]\s*[—-]\s*S[ií]ntoma:\s*(.+?)(?=\s*(?:Parte objeto:|Causa:|$))/i },
        { key: '_objectPart', re: /Parte objeto:\s*(.+?)(?=\s*(?:Causa:|$))/i },
        { key: '_cause', re: /Causa:\s*(.+)$/i },
    ];

    for (const { key, re } of extractions) {
        const m = cleaned.match(re);
        if (m) {
            if (key === '_catalogFull') {
                result.failureCatalog = result.failureCatalog || {};
                result.failureCatalog.category = m[1].trim();
                result.failureCatalog.symptom = m[2].trim();
            } else if (key === '_objectPart') {
                result.failureCatalog = result.failureCatalog || {};
                result.failureCatalog.object_part = m[1].trim();
            } else if (key === '_cause') {
                result.failureCatalog = result.failureCatalog || {};
                result.failureCatalog.cause = m[1].trim();
            } else {
                result[key] = m[1].trim();
            }
            // Remove matched portion from text to get clean description
            cleaned = cleaned.replace(m[0], ' ');
        }
    }

    // Parse structured sub-fields
    if (result.resourcesText) {
        result.resources = result.resourcesText.split(',').map(r => {
            const rm = r.trim().match(/(\d+)x\s+(.+?)\s*\((\d+\.?\d*)h\)/);
            return rm ? { quantity: rm[1], type: rm[2], hours: rm[3] } : null;
        }).filter(Boolean);
    }
    if (result.estimatedDurationText) {
        result.estimatedDuration = parseFloat(result.estimatedDurationText) || 0;
    }
    if (result.materialsText) {
        result.materials = result.materialsText.split(',').map(m => {
            const mm = m.trim().match(/(\d+)\s*[x×]\s*(\S+)\s+(.*)/);
            return mm ? { quantity: mm[1], sapId: mm[2], description: mm[3].trim() } : null;
        }).filter(Boolean);
    }
    if (result.locationText) {
        const lm = result.locationText.match(/^(.+?)\s*\((.+?)\)\s*$/);
        if (lm) {
            result.technicalLocationCode = lm[1].trim();
            result.technicalLocation = lm[2].trim();
        } else {
            result.technicalLocation = result.locationText;
        }
    }

    // Clean up description: collapse whitespace
    result.description = cleaned.replace(/\s{2,}/g, ' ').trim();
    return result;
}

export default function MobileWRDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const [wr, setWr] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [showAssignPanel, setShowAssignPanel] = useState(false);
    const [technicians, setTechnicians] = useState([]);
    const [techLoading, setTechLoading] = useState(false);
    const [techFilter, setTechFilter] = useState('');
    const [selectedWorkers, setSelectedWorkers] = useState([]);

    const loadWr = () => {
        setLoading(true);
        api.getWorkRequest(id)
            .then(res => setWr(res))
            .catch(() => toast.error('Error cargando WR'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadWr(); }, [id]);

    // Parse old-format text for legacy WRs
    const parsed = useMemo(() => {
        if (!wr) return {};
        const pd = wr.problem_description || {};
        const rawText = wr.description || pd.original_text || pd.structured_description || (typeof pd === 'string' ? pd : '');
        return parseOldText(rawText);
    }, [wr]);

    const openAssignPanel = async () => {
        setShowAssignPanel(true);
        setSelectedWorkers([]);
        setTechFilter('');
        setTechLoading(true);
        try {
            const data = await api.listTechnicians();
            setTechnicians(Array.isArray(data) ? data : []);
        } catch { setTechnicians([]); }
        setTechLoading(false);
    };

    const toggleWorker = (t) => {
        setSelectedWorkers(prev => {
            const exists = prev.find(w => w.worker_id === t.worker_id);
            return exists ? prev.filter(w => w.worker_id !== t.worker_id) : [...prev, t];
        });
    };

    const handleAssign = async () => {
        if (!selectedWorkers.length) { toast.error('Selecciona al menos un técnico'); return; }
        setActionLoading(true);
        try {
            const workers = selectedWorkers.map(w => ({ worker_id: w.worker_id, worker_name: w.name }));
            await api.assignWorkRequest(wr.request_id, { workers });
            const names = selectedWorkers.map(w => w.name).join(', ');
            toast.success(`Asignado a ${names}`);
            setShowAssignPanel(false);
            loadWr();
        } catch (e) { toast.error('Error al asignar: ' + (e.message || e)); }
        setActionLoading(false);
    };

    const handleApprove = async () => {
        setActionLoading(true);
        try {
            await api.validateWorkRequest(wr.request_id, { action: 'APPROVE', modifications: {} });
            toast.success('WR aprobado exitosamente');
            loadWr();
        } catch (e) { toast.error('Error al aprobar: ' + (e.message || e)); }
        setActionLoading(false);
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) { toast.error('Ingresa un motivo de rechazo'); return; }
        setActionLoading(true);
        try {
            await api.validateWorkRequest(wr.request_id, { action: 'REJECT', modifications: { reason: rejectReason } });
            toast.success('WR rechazado');
            loadWr();
            setShowRejectForm(false);
            setRejectReason('');
        } catch (e) { toast.error('Error al rechazar: ' + (e.message || e)); }
        setActionLoading(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-3 border-t-emerald-600 border-gray-200 rounded-full animate-spin" />
            </div>
        );
    }

    if (!wr) {
        return (
            <div className="p-4">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-4">
                    <ArrowLeft className="w-5 h-5" style={{ color: '#64748B' }} />
                    <span className="text-sm" style={{ color: '#64748B' }}>Volver</span>
                </button>
                <div className="text-center py-12">
                    <div className="text-lg font-bold mb-2" style={{ color: '#0F172A' }}>WR no encontrado</div>
                    <div className="text-sm" style={{ color: '#64748B' }}>El work request no existe o fue eliminado</div>
                </div>
            </div>
        );
    }

    const pri = derivePriority(wr);
    const pm = PRIORITY_META[pri] || PRIORITY_META.P3;
    const status = wr.status || 'DRAFT';
    const sm = STATUS_META[status] || STATUS_META.DRAFT;
    const tag = wr.equipment_tag || '';
    const pd = wr.problem_description || {};
    const ai = wr.ai_classification || {};
    const createdAt = wr.created_at ? new Date(wr.created_at) : null;

    // Merge: structured API fields → parsed old-text fallback
    const desc = parsed.description || wr.description || pd.original_text || pd.structured_description || 'Sin descripción';
    const techName = wr.technician_name || ai.technician_name || '';
    const suggestedAction = wr.suggested_action || pd.suggested_action || parsed.suggestedAction || '';
    const resources = (wr.resources?.length ? wr.resources : null) || (pd.resources?.length ? pd.resources : null) || (parsed.resources?.length ? parsed.resources : []);
    const resourcesText = parsed.resourcesText || '';
    const materials = (wr.materials?.length ? wr.materials : null) || (pd.materials?.length ? pd.materials : null) || (parsed.materials?.length ? parsed.materials : []);
    const materialsText = parsed.materialsText || '';
    const specialEquip = wr.special_equipment || pd.special_equipment || parsed.specialEquipment || '';
    const estDuration = wr.estimated_duration || ai.estimated_duration_hours || parsed.estimatedDuration || 0;
    const plantCondition = wr.plant_condition || ai.plant_condition || parsed.plantCondition || '';
    const techLoc = wr.technical_location || ai.technical_location || parsed.technicalLocation || '';
    const techLocCode = wr.technical_location_code || ai.technical_location_code || parsed.technicalLocationCode || '';
    const plantId = wr.plant_id || ai.plant_id || '';
    const failureCatalog = wr.failure_catalog || pd.failure_catalog || parsed.failureCatalog || null;
    const activityClass = wr.activity_class || ai.activity_class || '';
    const canApprove = ['DRAFT', 'PENDING_VALIDATION'].includes(status);

    return (
        <div style={{ backgroundColor: '#F8FAFC' }}>
            {/* Header */}
            <div className="bg-white border-b p-4 sticky top-0 z-10" style={{ borderColor: '#E2E8F0' }}>
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-1">
                        <ArrowLeft className="w-5 h-5" style={{ color: '#64748B' }} />
                    </button>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-bold truncate" style={{ color: '#0F172A' }}>
                                {tag || 'Work Request'}
                            </h1>
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0" style={{ backgroundColor: pm.bg, color: pm.color }}>
                                {pri}
                            </span>
                        </div>
                        <p className="text-xs font-mono truncate" style={{ color: '#64748B' }}>
                            {(wr.request_id || '').slice(0, 16)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-4 pb-32">
                {/* Status flow */}
                <div className="bg-white rounded-2xl p-4 border" style={{ borderColor: '#E2E8F0' }}>
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold" style={{ color: '#64748B', letterSpacing: '0.05em' }}>ESTADO</span>
                        <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: sm.color + '20', color: sm.color }}>
                            {sm.label}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        {FLOW_STEPS.map((step, i) => {
                            const active = sm.step >= i;
                            const current = sm.step === i;
                            return (
                                <div key={step} className="flex-1 flex flex-col items-center">
                                    <div className="w-full h-2 rounded-full mb-1" style={{ backgroundColor: active ? sm.color : '#E2E8F0' }} />
                                    <span className="text-[10px] font-medium" style={{ color: current ? sm.color : '#94A3B8' }}>{step}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Description */}
                <div className="bg-white rounded-2xl p-4 border" style={{ borderColor: '#E2E8F0' }}>
                    <div className="text-xs font-semibold mb-2" style={{ color: '#64748B', letterSpacing: '0.05em' }}>¿QUÉ OCURRE?</div>
                    <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#334155' }}>{desc}</p>
                </div>

                {/* Suggested Action */}
                {suggestedAction && (
                    <div className="bg-white rounded-2xl p-4 border" style={{ borderColor: '#E2E8F0' }}>
                        <div className="text-xs font-semibold mb-2" style={{ color: '#64748B', letterSpacing: '0.05em' }}>ACCIÓN SUGERIDA</div>
                        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                            <Zap className="w-5 h-5 flex-shrink-0" style={{ color: '#16A34A' }} />
                            <span className="text-sm font-medium" style={{ color: '#166534' }}>{suggestedAction}</span>
                        </div>
                    </div>
                )}

                {/* Equipment & Location */}
                {tag && (
                    <div className="bg-white rounded-2xl p-4 border" style={{ borderColor: '#E2E8F0' }}>
                        <div className="text-xs font-semibold mb-3" style={{ color: '#64748B', letterSpacing: '0.05em' }}>EQUIPO</div>
                        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#ECFDF5', border: '2px solid #10B981' }}>
                            <Wrench className="w-5 h-5 flex-shrink-0" style={{ color: '#047857' }} />
                            <div>
                                <div className="text-sm font-bold" style={{ color: '#047857' }}>{tag}</div>
                            </div>
                        </div>
                        {(techLoc || techLocCode) && (
                            <div className="flex items-center gap-2 mt-2 px-1">
                                <MapPin className="w-3.5 h-3.5" style={{ color: '#3B82F6' }} />
                                <span className="text-xs font-mono" style={{ color: '#3B82F6' }}>
                                    {techLocCode || techLoc}
                                    {techLoc && techLocCode ? ` (${techLoc})` : ''}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Resources */}
                {(resources.length > 0 || resourcesText) && (
                    <div className="bg-white rounded-2xl p-4 border" style={{ borderColor: '#E2E8F0' }}>
                        <div className="text-xs font-semibold mb-3" style={{ color: '#64748B', letterSpacing: '0.05em' }}>RECURSOS NECESARIOS</div>
                        {resources.length > 0 ? (
                            <div className="space-y-2">
                                {resources.map((r, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#F8FAFC' }}>
                                        <Users className="w-4 h-4 flex-shrink-0" style={{ color: '#6366F1' }} />
                                        <div className="flex-1">
                                            <span className="text-sm font-medium" style={{ color: '#334155' }}>
                                                {r.quantity}x {r.type}
                                            </span>
                                        </div>
                                        <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: '#EEF2FF', color: '#4F46E5' }}>
                                            {r.hours}h
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#F8FAFC' }}>
                                <Users className="w-4 h-4 flex-shrink-0" style={{ color: '#6366F1' }} />
                                <span className="text-sm" style={{ color: '#334155' }}>{resourcesText}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Materials */}
                {(materials.length > 0 || materialsText) && (
                    <div className="bg-white rounded-2xl p-4 border" style={{ borderColor: '#E2E8F0' }}>
                        <div className="text-xs font-semibold mb-3" style={{ color: '#64748B', letterSpacing: '0.05em' }}>MATERIALES</div>
                        {materials.length > 0 ? (
                            <div className="space-y-2">
                                {materials.map((m, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#F8FAFC' }}>
                                        <Package className="w-4 h-4 flex-shrink-0" style={{ color: '#F59E0B' }} />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium" style={{ color: '#334155' }}>
                                                {m.sapId && <span className="font-mono" style={{ color: '#6366F1' }}>{m.sapId} </span>}
                                                {m.description || 'Material'}
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
                                            x{m.quantity}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#F8FAFC' }}>
                                <Package className="w-4 h-4 flex-shrink-0" style={{ color: '#F59E0B' }} />
                                <span className="text-sm" style={{ color: '#334155' }}>{materialsText}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Special Equipment */}
                {specialEquip && (
                    <div className="bg-white rounded-2xl p-4 border" style={{ borderColor: '#E2E8F0' }}>
                        <div className="text-xs font-semibold mb-2" style={{ color: '#64748B', letterSpacing: '0.05em' }}>EQUIPOS ESPECIALES</div>
                        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#F8FAFC' }}>
                            <Wrench className="w-4 h-4 flex-shrink-0" style={{ color: '#94A3B8' }} />
                            <span className="text-sm" style={{ color: '#334155' }}>{specialEquip}</span>
                        </div>
                    </div>
                )}

                {/* Failure Catalog */}
                {failureCatalog && (failureCatalog.symptom || failureCatalog.object_part || failureCatalog.cause) && (
                    <div className="bg-white rounded-2xl p-4 border" style={{ borderColor: '#E2E8F0' }}>
                        <div className="text-xs font-semibold mb-3" style={{ color: '#64748B', letterSpacing: '0.05em' }}>CATÁLOGO DE FALLA</div>
                        {failureCatalog.category && (
                            <div className="text-xs font-bold px-3 py-1 rounded-full inline-block mb-3" style={{ backgroundColor: '#EEF2FF', color: '#4F46E5' }}>
                                {failureCatalog.category}
                            </div>
                        )}
                        <div className="space-y-2">
                            {failureCatalog.symptom && <InfoRow label="Síntoma" value={failureCatalog.symptom} />}
                            {failureCatalog.object_part && <InfoRow label="Parte objeto" value={failureCatalog.object_part} />}
                            {failureCatalog.cause && <InfoRow label="Causa" value={failureCatalog.cause} />}
                        </div>
                    </div>
                )}

                {/* SAP PM Classification */}
                <div className="bg-white rounded-2xl p-4 border" style={{ borderColor: '#E2E8F0' }}>
                    <div className="text-xs font-semibold mb-3" style={{ color: '#64748B', letterSpacing: '0.05em' }}>CLASIFICACIÓN SAP PM</div>

                    {/* Priority row */}
                    <div className="flex items-center gap-3 p-3 rounded-xl mb-3" style={{ backgroundColor: pm.bg }}>
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: pm.color }} />
                        <div className="flex-1">
                            <div className="text-sm font-bold" style={{ color: pm.color }}>Prioridad {pm.label}</div>
                            <div className="text-xs" style={{ color: pm.color }}>Plazo: {pm.sub}</div>
                        </div>
                    </div>

                    {/* Clase Aviso → Clase OT → Clase Actividad flow */}
                    <div className="p-3 rounded-xl space-y-3" style={{ backgroundColor: '#F8FAFC' }}>
                        <div className="flex items-center gap-2">
                            <div className="flex-1">
                                <div className="text-xs font-semibold" style={{ color: '#64748B' }}>Clase Aviso</div>
                                <div className="text-sm font-bold" style={{ color: '#0F172A' }}>A1 Aviso Mtto</div>
                            </div>
                            <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#CBD5E1' }} />
                            <div className="flex-1">
                                <div className="text-xs font-semibold" style={{ color: '#64748B' }}>Clase OT</div>
                                <div className="text-sm font-bold" style={{ color: pm.color }}>{pm.claseOT} {pm.claseOTLabel}</div>
                            </div>
                            {activityClass && (
                                <>
                                    <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#CBD5E1' }} />
                                    <div className="flex-1">
                                        <div className="text-xs font-semibold" style={{ color: '#64748B' }}>Actividad</div>
                                        <div className="text-sm font-bold" style={{ color: '#1E40AF' }}>{ACTIVITY_CLASS_LABELS[activityClass] || activityClass}</div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Meta info */}
                <div className="bg-white rounded-2xl p-4 border" style={{ borderColor: '#E2E8F0' }}>
                    <div className="text-xs font-semibold mb-3" style={{ color: '#64748B', letterSpacing: '0.05em' }}>INFORMACIÓN</div>
                    <div className="space-y-3">
                        {createdAt && (
                            <MetaRow icon={Calendar} label="Creado"
                                value={`${createdAt.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })} ${createdAt.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}`}
                            />
                        )}
                        {techName && <MetaRow icon={User} label="Reportado por" value={techName} />}
                        {plantId && <MetaRow icon={Building} label="Planta" value={plantId} />}
                        {plantCondition && <MetaRow icon={Shield} label="Condición planta" value={PLANT_CONDITION_LABELS[plantCondition] || plantCondition} />}
                        {estDuration > 0 && <MetaRow icon={Timer} label="Duración estimada" value={`${estDuration} horas`} />}
                    </div>
                </div>

                {/* Approval / Reject Actions */}
                {canApprove && (
                    <div className="bg-white rounded-2xl p-4 border-2" style={{ borderColor: '#10B981' }}>
                        <div className="text-xs font-semibold mb-3" style={{ color: '#64748B', letterSpacing: '0.05em' }}>ACCIONES</div>

                        {!showRejectForm ? (
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={handleApprove}
                                    disabled={actionLoading}
                                    className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
                                    style={{ backgroundColor: '#047857', color: '#FFFFFF' }}
                                >
                                    <CheckCircle2 className="w-5 h-5" />
                                    Aprobar
                                </button>
                                <button
                                    onClick={() => setShowRejectForm(true)}
                                    disabled={actionLoading}
                                    className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
                                    style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}
                                >
                                    <XCircle className="w-5 h-5" />
                                    Rechazar
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <MessageSquare className="w-4 h-4" style={{ color: '#EF4444' }} />
                                    <span className="text-sm font-bold" style={{ color: '#991B1B' }}>Motivo del rechazo</span>
                                </div>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Describe por qué se rechaza este WR..."
                                    className="w-full h-20 p-3 rounded-xl border text-sm resize-none outline-none"
                                    style={{ borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' }}
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => { setShowRejectForm(false); setRejectReason(''); }}
                                        className="py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
                                        style={{ backgroundColor: '#F1F5F9', color: '#64748B' }}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleReject}
                                        disabled={actionLoading || !rejectReason.trim()}
                                        className="py-3 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
                                        style={{ backgroundColor: '#EF4444', color: '#FFFFFF' }}
                                    >
                                        Confirmar Rechazo
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Rejected status info */}
                {status === 'REJECTED' && (
                    <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-4 border-2" style={{ borderColor: '#FCA5A5' }}>
                        <div className="flex items-center gap-2 mb-2">
                            <XCircle className="w-5 h-5" style={{ color: '#EF4444' }} />
                            <span className="text-sm font-bold" style={{ color: '#991B1B' }}>Work Request Rechazado</span>
                        </div>
                        {wr.validation?.modifications?.reason && (
                            <p className="text-sm" style={{ color: '#7C2D12' }}>{wr.validation.modifications.reason}</p>
                        )}
                    </div>
                )}

                {/* Approved → Assign technician */}
                {['VALIDATED', 'APPROVED'].includes(status) && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border-2" style={{ borderColor: '#86EFAC' }}>
                        <div className="flex items-center gap-2 mb-3">
                            <CheckCircle2 className="w-5 h-5" style={{ color: '#16A34A' }} />
                            <span className="text-sm font-bold" style={{ color: '#166534' }}>Work Request Aprobado</span>
                        </div>
                        {!showAssignPanel ? (
                            <button
                                onClick={openAssignPanel}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
                                style={{ backgroundColor: '#7C3AED', color: '#FFFFFF' }}
                            >
                                <Users className="w-5 h-5" />
                                Asignar Técnicos
                            </button>
                        ) : (
                            <div className="space-y-3">
                                {selectedWorkers.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedWorkers.map(w => (
                                            <span key={w.worker_id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                                                style={{ backgroundColor: '#EDE9FE', color: '#7C3AED' }}>
                                                {w.name}
                                                <button onClick={() => toggleWorker(w)} className="ml-0.5 hover:opacity-70">&times;</button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <input
                                    type="text"
                                    placeholder="Buscar técnico..."
                                    value={techFilter}
                                    onChange={(e) => setTechFilter(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                                    style={{ borderColor: '#D1D5DB', backgroundColor: '#FFFFFF' }}
                                />
                                <div className="max-h-56 overflow-y-auto space-y-2">
                                    {techLoading ? (
                                        <div className="text-center py-4 text-sm" style={{ color: '#94A3B8' }}>Cargando técnicos...</div>
                                    ) : technicians
                                        .filter(t => t.available !== false)
                                        .filter(t => !techFilter || t.name?.toLowerCase().includes(techFilter.toLowerCase()) || t.specialty?.toLowerCase().includes(techFilter.toLowerCase()))
                                        .map(t => {
                                            const selected = selectedWorkers.some(w => w.worker_id === t.worker_id);
                                            return (
                                                <button
                                                    key={t.worker_id}
                                                    onClick={() => toggleWorker(t)}
                                                    className="w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all active:scale-98"
                                                    style={{ borderColor: selected ? '#7C3AED' : '#E2E8F0', backgroundColor: selected ? '#F5F3FF' : '#FFFFFF' }}
                                                >
                                                    <div className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0"
                                                        style={{ borderColor: selected ? '#7C3AED' : '#CBD5E1', backgroundColor: selected ? '#7C3AED' : '#FFFFFF' }}>
                                                        {selected && <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#FFFFFF' }} />}
                                                    </div>
                                                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ backgroundColor: '#EDE9FE', color: '#7C3AED' }}>
                                                        {(t.name || '?')[0]}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-bold truncate" style={{ color: '#0F172A' }}>{t.name}</div>
                                                        <div className="text-xs" style={{ color: '#64748B' }}>
                                                            {t.specialty || 'General'} · {t.shift || ''}
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })
                                    }
                                    {!techLoading && technicians.filter(t => t.available !== false).length === 0 && (
                                        <div className="text-center py-4 text-sm" style={{ color: '#94A3B8' }}>No hay técnicos disponibles</div>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setShowAssignPanel(false)}
                                        className="py-3 rounded-xl font-bold text-sm"
                                        style={{ backgroundColor: '#F1F5F9', color: '#64748B' }}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleAssign}
                                        disabled={actionLoading || !selectedWorkers.length}
                                        className="py-3 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
                                        style={{ backgroundColor: '#7C3AED', color: '#FFFFFF' }}
                                    >
                                        Asignar ({selectedWorkers.length})
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Assigned status info */}
                {status === 'ASSIGNED' && (
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-4 border-2" style={{ borderColor: '#C4B5FD' }}>
                        <div className="flex items-center gap-2 mb-3">
                            <Users className="w-5 h-5" style={{ color: '#7C3AED' }} />
                            <span className="text-sm font-bold" style={{ color: '#5B21B6' }}>
                                Equipo Asignado ({(wr.assigned_workers || []).length || 1})
                            </span>
                        </div>
                        <div className="space-y-2">
                            {(wr.assigned_workers && wr.assigned_workers.length > 0) ? (
                                wr.assigned_workers.map((w, i) => (
                                    <div key={w.worker_id || i} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#FFFFFF' }}>
                                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: '#EDE9FE', color: '#7C3AED' }}>
                                            {(w.name || '?')[0]}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold" style={{ color: '#0F172A' }}>{w.name}</div>
                                            <div className="text-xs" style={{ color: '#64748B' }}>{w.specialty || ''}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#FFFFFF' }}>
                                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: '#EDE9FE', color: '#7C3AED' }}>
                                        {(wr.assigned_to_name || '?')[0]}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold" style={{ color: '#0F172A' }}>{wr.assigned_to_name}</div>
                                        <div className="text-xs" style={{ color: '#64748B' }}>{wr.assigned_to_specialty || ''}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="flex items-start gap-2">
            <ChevronRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#94A3B8' }} />
            <div>
                <div className="text-xs" style={{ color: '#94A3B8' }}>{label}</div>
                <div className="text-sm" style={{ color: '#334155' }}>{value}</div>
            </div>
        </div>
    );
}

function MetaRow({ icon: Icon, label, value }) {
    return (
        <div className="flex items-center gap-3">
            <Icon className="w-4 h-4" style={{ color: '#94A3B8' }} />
            <div>
                <div className="text-xs" style={{ color: '#94A3B8' }}>{label}</div>
                <div className="text-sm font-medium" style={{ color: '#334155' }}>{value}</div>
            </div>
        </div>
    );
}
