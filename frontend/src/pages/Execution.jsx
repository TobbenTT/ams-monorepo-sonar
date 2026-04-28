import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebSocket';
const QRScanner = lazy(() => import('../components/QRScanner'));
import {
  Wrench, CheckCircle, Clock, AlertTriangle, User, ChevronDown, ChevronUp, QrCode,
  Zap, Calendar, Loader2, Play, X, ArrowRight, BarChart2, Package, FileText,
  Timer, TrendingUp, Users, Activity, Plus, Inbox,
} from 'lucide-react';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import {
  listManagedWOs, updateManagedWO, completeManagedWO, closeManagedWO,
  updateManagedWOProgress, verifyCloseManagedWO, suggestFailureFields,
} from '../api';
import PartialNotifyModal from '../components/PartialNotifyModal';
import * as api from '../api';

// Fase 7 Jorge 2026-04-21 — grabar nota de voz en el cierre + transcribir.
// Usa MediaRecorder + endpoint /media/transcribe (whisper) ya existente.
function AudioDictateButton({ onText }) {
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const recRef = useState({ current: null })[0];

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      const chunks = [];
      mr.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setBusy(true);
        try {
          const res = await import('../api').then(m => m.transcribeAudio(blob, 'es'));
          const txt = res?.text || res?.transcript || '';
          if (txt) onText(txt.trim());
        } catch (e) {
          alert('Error al transcribir: ' + (e.message || ''));
        } finally {
          setBusy(false);
        }
      };
      recRef.current = mr;
      mr.start();
      setRecording(true);
    } catch (e) {
      alert('No se pudo activar el micrófono: ' + (e.message || ''));
    }
  };
  const stop = () => {
    if (recRef.current && recRef.current.state !== 'inactive') recRef.current.stop();
    setRecording(false);
  };

  if (busy) {
    return <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground"><Loader2 size={11} className="animate-spin" /> Transcribiendo…</span>;
  }
  return (
    <button type="button" onClick={recording ? stop : start}
      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded ${recording ? 'bg-rose-600 text-white animate-pulse' : 'bg-muted text-foreground hover:bg-muted/70'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${recording ? 'bg-white' : 'bg-rose-500'}`} />
      {recording ? 'Detener' : 'Grabar nota'}
    </button>
  );
}

// Auto-clasifica las observaciones en 3 buckets. Heurística simple keyword —
// cuando metamos un agente dedicado el clasificador se reemplaza.
function ClosureClassify({ notes }) {
  if (!notes || notes.length < 20) return null;
  const low = notes.toLowerCase();
  const repuestos = /(repuesto|pieza|stock|codigo|código|sap|bodega|material|filtro|rodamiento|sello|junta|correa)/.test(low);
  const estrategia = /(estrategia|frecuencia|preventivo|plan|intervalo|ciclo|predictivo|vibraci|termograf)/.test(low);
  const procesos = /(procedimiento|proceso|lockout|seguridad|permiso|herramienta|accesorio|traslad|tiempo)/.test(low);
  const tags = [];
  if (repuestos) tags.push({ k: 'Repuestos', c: 'bg-sky-100 text-sky-800' });
  if (estrategia) tags.push({ k: 'Oport. estrategia', c: 'bg-purple-100 text-purple-800' });
  if (procesos) tags.push({ k: 'Oport. procesos', c: 'bg-amber-100 text-amber-800' });
  if (tags.length === 0) return null;
  return (
    <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
      <span className="text-[9px] font-semibold uppercase text-muted-foreground">Clasificado:</span>
      {tags.map(t => <span key={t.k} className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${t.c}`}>{t.k}</span>)}
    </div>
  );
}

function getLaborRate() {
  try { return JSON.parse(localStorage.getItem('ocp_settings') || '{}').laborRate || 50; } catch { return 50; }
}
const LABOR_RATE = getLaborRate();

const PRIO_STYLE = {
  P1: 'bg-red-500 text-white', P2: 'bg-orange-500 text-white',
  P3: 'bg-blue-500 text-white', P4: 'bg-gray-400 text-white',
};

export default function Execution() {
  const { plant } = useOutletContext();
  const { t } = useLanguage();
  const toast = useToast();
  const [view, setView] = useState('today');
  // SF-572 — modal notificación parcial
  const [partialModal, setPartialModal] = useState(null); // { wo, op, opIndex }
  // Jorge SF-525: nav entre semanas (W18, W17, W19…) con historial en bandeja ejecución
  const [weekOffset, setWeekOffset] = useState(0); // 0=semana actual, -1=anterior, +1=siguiente
  // Jorge 2026-04-23: modal Cancelar/Reprogramar OT con motivo obligatorio
  const [cancelOtModal, setCancelOtModal] = useState(null); // { wo, mode, reason }
  const [loading, setLoading] = useState(true);
  const [activeWOs, setActiveWOs] = useState([]);
  const [completedWOs, setCompletedWOs] = useState([]);
  const [closedWOs, setClosedWOs] = useState([]);
  const [expandedWO, setExpandedWO] = useState(null);
  const [closureWO, setClosureWO] = useState(null);
  const [closureHours, setClosureHours] = useState('');
  const [closureNotes, setClosureNotes] = useState('');
  // Group A #3 supervisor signature + #5 per-op actuals for plan-vs-actual.
  const [closureSignature, setClosureSignature] = useState('');
  const [closurePin, setClosurePin] = useState('');
  const [closureOps, setClosureOps] = useState([]); // [{...op, actual_hours}]
  const [closing, setClosing] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [batchSelected, setBatchSelected] = useState(new Set());
  const [batchHours, setBatchHours] = useState({});
  const [batchClosing, setBatchClosing] = useState(false);
  const [batchFilter, setBatchFilter] = useState('');
  // Jorge 2026-04-22 — #6: agregar material adicional durante EN_EJECUCION
  const [addMaterialFor, setAddMaterialFor] = useState(null); // { wo_id, materials }
  const [newMatForm, setNewMatForm] = useState({ code: '', description: '', quantity: 1, unit: 'PZ' });
  const [savingMat, setSavingMat] = useState(false);
  // Jorge 2026-04-22 #9: Avisos pendientes de aprobación por supervisor
  const [pendingWRs, setPendingWRs] = useState([]);
  // CE9 Tanda C-EXT (2026-04-28): asignar/desasignar mantenedores desde la OT
  const [technicians, setTechnicians] = useState([]);
  const [assignPickerWO, setAssignPickerWO] = useState(null); // wo siendo editado
  // SF-566 C6 Tanda C (2026-04-28): validation gate antes de EN_EJECUCION
  // para PM03 fast-track. Supervisor confirma explícitamente que revisó
  // operaciones + materiales antes de pasar a ejecución.
  const [validateGate, setValidateGate] = useState(null); // { wo, opts }
  const [gateChecks, setGateChecks] = useState({ ops: false, materials: false, safety: false });

  const loadData = async () => {
    setLoading(true);
    try {
      const [prog, exec, comp, closed, planned, wrs] = await Promise.all([
        listManagedWOs({ status: 'PROGRAMADO', plant_id: plant, limit: 100 }),
        listManagedWOs({ status: 'EN_EJECUCION', plant_id: plant, limit: 100 }),
        listManagedWOs({ status: 'COMPLETADO', plant_id: plant, limit: 50 }),
        listManagedWOs({ status: 'CERRADO', plant_id: plant, limit: 50 }),
        listManagedWOs({ status: 'PLANIFICADO', plant_id: plant, limit: 100 }),
        // Avisos pendientes de aprobar
        api.listWorkRequests({ plant_id: plant, status: 'PENDIENTE', limit: 50 }).catch(() => []),
      ]);
      const toArr = r => Array.isArray(r) ? r : r?.items || [];
      const execList = toArr(exec);
      const progList = toArr(prog);
      const plannedList = toArr(planned);
      setActiveWOs([...execList, ...progList, ...plannedList]);
      const compList = toArr(comp);
      setCompletedWOs([...compList, ...execList]);
      setClosedWOs(toArr(closed));
      setPendingWRs(toArr(wrs));
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [plant]);
  // CE9: cargar técnicos del plant para el picker de asignación
  useEffect(() => {
    api.listTechnicians({ plant_id: plant }).then(res => {
      setTechnicians(Array.isArray(res) ? res : (res?.technicians || []));
    }).catch(() => setTechnicians([]));
  }, [plant]);

  // CE9 Tanda C-EXT: asignar/desasignar mantenedor en una OT
  const handleAssignWorker = async (wo, tech) => {
    const current = Array.isArray(wo.assigned_workers) ? wo.assigned_workers : [];
    const exists = current.some(w => (w.worker_id || w.id) === (tech.worker_id || tech.id));
    if (exists) { toast.info(`${tech.name} ya está asignado`); return; }
    const next = [...current, {
      worker_id: tech.worker_id || tech.id,
      name: tech.name,
      specialty: tech.specialty || 'OTRO',
    }];
    try {
      await updateManagedWO(wo.wo_id, { assigned_workers: next });
      toast.success(`+ ${tech.name} asignado a ${wo.wo_number}`);
      loadData();
    } catch (e) { toast.error('Error: ' + (e.message || e)); }
  };
  const handleRemoveWorker = async (wo, workerId) => {
    const current = Array.isArray(wo.assigned_workers) ? wo.assigned_workers : [];
    const removed = current.find(w => (w.worker_id || w.id) === workerId);
    const next = current.filter(w => (w.worker_id || w.id) !== workerId);
    try {
      await updateManagedWO(wo.wo_id, { assigned_workers: next });
      toast.success(`− ${removed?.name || 'Técnico'} desasignado`);
      loadData();
    } catch (e) { toast.error('Error: ' + (e.message || e)); }
  };
  useWebSocket(plant, useCallback((msg) => {
    if (msg.event?.startsWith('wo_')) loadData();
  }, []));

  // KPIs
  const kpis = useMemo(() => {
    const exec = activeWOs.filter(w => w.status === 'EN_EJECUCION');
    const prog = activeWOs.filter(w => w.status === 'PROGRAMADO');
    const totalPlannedHH = activeWOs.reduce((s, w) => s + (w.estimated_hours || 0), 0);
    const totalActualHH = [...activeWOs, ...completedWOs].reduce((s, w) => s + (w.actual_hours || 0), 0);
    const fastTrack = activeWOs.filter(w => w.is_fast_track || w.priority_code === 'P1' || w.priority_code === 'P2');
    return { exec: exec.length, prog: prog.length, completed: completedWOs.length, closed: closedWOs.length, totalPlannedHH, totalActualHH, fastTrack: fastTrack.length };
  }, [activeWOs, completedWOs, closedWOs]);

  // Get geolocation — returns {lat, lng} or null
  const getGeo = () => new Promise(resolve => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
      () => resolve(null),
      { timeout: 5000, maximumAge: 60000 }
    );
  });

  // SF-566 C6: para PM03 fast-track, abrir gate de validación. Para el resto
  // (PM01/PM02 que ya pasaron por planificación + scheduling) seguir directo.
  const handleStartRequest = (wo, opts = {}) => {
    const isFastTrack = wo.wo_type === 'PM03' || ['P1', 'P2'].includes(wo.priority_code);
    if (isFastTrack && !opts.bypassGate) {
      setValidateGate({ wo, opts });
      setGateChecks({ ops: false, materials: false, safety: false });
      return;
    }
    handleStart(wo, opts);
  };

  // Start execution — captures start timestamp + geolocation (when from QR)
  const handleStart = async (wo, opts = {}) => {
    // Optimistic update so user sees status change immediately
    setActiveWOs(prev => prev.map(w => w.wo_id === wo.wo_id ? { ...w, status: 'EN_EJECUCION' } : w));
    try {
      const startedAt = new Date().toISOString();
      const payload = { status: 'EN_EJECUCION', actual_start: startedAt };
      if (opts.fromQR) {
        const geo = await getGeo();
        if (geo) {
          payload.start_location = { lat: geo.lat, lng: geo.lng, accuracy: geo.accuracy };
        }
        payload.started_via = 'qr_scan';
      }
      await updateManagedWO(wo.wo_id, payload);
      toast.success(wo.wo_number + ' started' + (opts.fromQR ? ' · 📍 ubicación registrada' : ''));
      loadData();
    } catch (e) {
      // Rollback on failure
      setActiveWOs(prev => prev.map(w => w.wo_id === wo.wo_id ? { ...w, status: wo.status } : w));
      toast.error(e.message);
    }
  };

  // Update progress
  const handleProgress = async (wo, pct) => {
    try {
      await updateManagedWO(wo.wo_id, { completion_pct: pct });
      try { await updateManagedWOProgress(wo.wo_id, { completion_pct: pct }); } catch {}
      toast.success(wo.wo_number + ': ' + pct + '%');
      loadData();
    } catch (e) { toast.error(e.message); }
  };

  // Complete
  const handleComplete = async (wo, hours) => {
    try {
      await updateManagedWO(wo.wo_id, { completion_pct: 100, actual_hours: parseFloat(hours) || wo.estimated_hours || 0 });
      await completeManagedWO(wo.wo_id, { actual_hours: parseFloat(hours) || 0 });
      toast.success(wo.wo_number + ' completed');
      setExpandedWO(null);
      loadData();
    } catch (e) { toast.error(e.message); }
  };

  // Batch close — "Bandeja de Ejecución": cierra varias OTs de una vez sin modal por OT
  const handleBatchClose = async () => {
    const ids = Array.from(batchSelected);
    if (ids.length === 0) { toast.info('Selecciona al menos una OT'); return; }
    const signature = window.prompt(`Firma del supervisor (requerida para cerrar ${ids.length} OTs):`);
    if (!signature || !signature.trim()) { toast.error('Firma obligatoria — cierre cancelado'); return; }
    if (!window.confirm(`¿Cerrar ${ids.length} OTs firmando como "${signature.trim()}"? Esta acción es final.`)) return;
    setBatchClosing(true);
    let ok = 0, fail = 0;
    for (const wo_id of ids) {
      const wo = completedWOs.find(w => w.wo_id === wo_id);
      if (!wo) { fail++; continue; }
      const hours = parseFloat(batchHours[wo_id]) || wo.actual_hours || wo.estimated_hours || 0;
      try {
        await updateManagedWO(wo_id, {
          actual_hours: hours,
          labor_cost: hours * LABOR_RATE,
          actual_total_cost: hours * LABOR_RATE,
          completion_pct: 100,
        });
        await closeManagedWO(wo_id, { signature: signature.trim(), actual_hours: hours });
        ok++;
      } catch { fail++; }
    }
    toast.success(`✓ ${ok} OTs cerradas${fail > 0 ? ` · ${fail} fallaron` : ''}`);
    setBatchSelected(new Set());
    setBatchHours({});
    setBatchClosing(false);
    loadData();
  };

  const toggleBatchSelect = (wo_id) => {
    setBatchSelected(prev => {
      const n = new Set(prev);
      n.has(wo_id) ? n.delete(wo_id) : n.add(wo_id);
      return n;
    });
  };

  const toggleBatchAll = (visible) => {
    setBatchSelected(prev => {
      const allIds = visible.map(w => w.wo_id);
      const hasAll = allIds.every(id => prev.has(id));
      if (hasAll) { const n = new Set(prev); allIds.forEach(id => n.delete(id)); return n; }
      return new Set([...prev, ...allIds]);
    });
  };

  // Jorge 2026-04-21 — IA autocomplete para OTs PM03. Supervisor aprieta
  // 'IA completa' y la OT recibe operations + materials sugeridos desde el
  // endpoint de asistencia IA, basado en description + equipment + P1/P2.
  const [aiFilling, setAiFilling] = useState(null);
  const handleAIFillFailure = async (wo) => {
    setAiFilling(wo.wo_id);
    try {
      const r = await suggestFailureFields({
        description: wo.description || '',
        equipment_tag: wo.equipment_tag || '',
        equipment_condition: wo.status === 'EN_EJECUCION' ? 'stopped' : 'operating',
        priority_hint: wo.priority_code || 'P2',
      });
      const ops = Array.isArray(r?.suggested_actions) ? r.suggested_actions.map((s, i) => ({
        type: 'INT',
        description: typeof s === 'string' ? s : (s.description || s.task || ''),
        specialty: r?.specialty || 'Mechanical',
        quantity: 1,
        hours: r?.estimated_duration_hours ? Math.max(0.5, r.estimated_duration_hours / r.suggested_actions.length) : 1,
      })) : [];
      const mats = Array.isArray(r?.suggested_materials) ? r.suggested_materials.map(m => ({
        code: m.code || m.sapId || m.sap_id || '',
        description: m.description || m.name || '',
        quantity: m.quantity || 1,
        unit: m.unit || 'PZ',
      })) : [];
      if (ops.length === 0 && mats.length === 0) {
        toast.info('IA no tiene sugerencias para esta OT');
        return;
      }
      await updateManagedWO(wo.wo_id, {
        operations: [...(wo.operations || []), ...ops],
        materials: [...(wo.materials || []), ...mats],
        estimated_hours: ops.reduce((a, o) => a + (o.hours * o.quantity), wo.estimated_hours || 0),
      });
      toast.success(`IA agregó ${ops.length} ops y ${mats.length} materiales a ${wo.wo_number}`);
      loadData();
    } catch (e) {
      toast.error('Error IA: ' + (e.message || ''));
    } finally {
      setAiFilling(null);
    }
  };

  // Open closure modal — seeds per-operation actual_hours table
  const openClosure = (wo) => {
    const seed = (wo.operations || []).map(op => ({
      ...op,
      actual_hours: op.actual_hours != null ? op.actual_hours : (op.hours || 0),
    }));
    setClosureOps(seed);
    setClosureWO(wo);
    setClosureHours(String(wo.actual_hours || wo.estimated_hours || ''));
    setClosureNotes('');
    setClosureSignature('');
    setClosurePin('');
  };

  // Close WO (single) — now requires supervisor signature and captures
  // per-operation actuals for plan-vs-actual reporting.
  const handleClose = async () => {
    if (!closureWO) return;
    if (!closureSignature.trim()) { toast.error('Firma del supervisor es obligatoria'); return; }
    setClosing(true);
    try {
      const opsHours = closureOps.reduce((a, o) => a + (parseFloat(o.actual_hours) || 0), 0);
      const hours = opsHours > 0 ? opsHours : (parseFloat(closureHours) || closureWO.estimated_hours || 0);
      // Cost/pct update still done via PATCH (allowed pre-CERRADO); then close.
      await updateManagedWO(closureWO.wo_id, {
        actual_hours: hours,
        labor_cost: hours * LABOR_RATE,
        actual_total_cost: hours * LABOR_RATE,
        completion_pct: 100,
      });
      await closeManagedWO(closureWO.wo_id, {
        signature: closureSignature.trim(),
        pin: closurePin || null,
        notes: closureNotes || null,
        actual_hours: hours,
        operations: closureOps.length ? closureOps : null,
      });
      toast.success(closureWO.wo_number + ' cerrada y firmada');
      setClosureWO(null); setClosureHours(''); setClosureNotes('');
      setClosureSignature(''); setClosurePin(''); setClosureOps([]);
      loadData();
    } catch (e) { toast.error(e.message); }
    setClosing(false);
  };

  // Fase Jorge 2026-04-21 — vista Fallas separa las OTs PM03 (correctivo
  // de falla, P1/P2) que llegan directo al supervisor bypass-planning.
  const failureWOs = activeWOs.filter(w => (w.wo_type === 'PM03') || (w.priority_code === 'P1' || w.priority_code === 'P2'));
  // CE1 Tanda C-EXT (Jorge 2026-04-28 12:32): pestaña Notificación.
  // OTs candidatas a notificar = en EN_EJECUCION o COMPLETADO (cerradas no).
  // El mantenedor carga HH real + cantidad real por cada operación. Banner de
  // notificación parcial vs final automático según ops con actual_hours > 0.
  const notifWOs = [...activeWOs, ...completedWOs].filter(w =>
    ['EN_EJECUCION', 'COMPLETADO'].includes(w.status) && Array.isArray(w.operations) && w.operations.length > 0
  );
  // SF-566 Tanda C (Jorge transcript 2026-04-27): supervisor distingue
  // PROGRAMADO (sale de Scheduling) vs NO PROGRAMADO (PM03 P1/P2 fallas).
  const VIEWS = [
    { id: 'today', label: 'Hoy', icon: Zap, count: activeWOs.length },
    { id: 'programado', label: '📅 Programado', icon: Calendar, count: activeWOs.filter(w => w.wo_type !== 'PM03' && !['P1', 'P2'].includes(w.priority_code)).length },
    { id: 'failures', label: '🚨 No Programado (PM03)', icon: AlertTriangle, count: failureWOs.length },
    { id: 'avisos', label: '📨 Avisos', icon: Inbox, count: pendingWRs.length },
    { id: 'notif', label: '📝 Notificación', icon: FileText, count: notifWOs.length },
    { id: 'close', label: 'Bandeja de Cierre', icon: CheckCircle, count: completedWOs.length },
    { id: 'week', label: 'Semana', icon: Calendar, count: activeWOs.length },
    { id: 'summary', label: 'Resumen', icon: BarChart2, count: closedWOs.length },
    { id: 'history', label: 'Historial', icon: Calendar, count: closedWOs.length },
  ];

  if (loading) return (
    <div className="p-6 flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
    </div>
  );

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
            <Wrench size={22} className="text-amber-700 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Execution</h1>
            <p className="text-sm text-muted-foreground">Real-time work tracking and closure</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowQR(true)} className="flex items-center gap-2 px-3 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
            <QrCode size={14} /> Scan QR
          </button>
          <button onClick={loadData} className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors text-foreground">
            <Activity size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* CE5 Tanda C-EXT (Jorge 2026-04-28 12:32): 4 KPIs del supervisor según
          la reunión. Antes 7 cards genéricos (counts puros). Ahora los 4 que
          le miden la gestión: cumplimiento, adherencia, avisos atrasados,
          OTs atrasadas. Los counts secundarios pasan a una segunda fila chica. */}
      {(() => {
        // Cumplimiento del programa = HH ejecutadas / HH planificadas (semana)
        const allWOs = [...activeWOs, ...completedWOs, ...closedWOs];
        const plannedHH = allWOs.reduce((s, w) => s + (parseFloat(w.estimated_hours) || 0), 0);
        const actualHH = allWOs.reduce((s, w) => s + (parseFloat(w.actual_hours) || 0), 0);
        const cumplimientoPct = plannedHH > 0 ? Math.round((actualHH / plannedHH) * 100) : 0;
        // Adherencia = OTs cerradas en su día/turno planificado / OTs cerradas
        const cerradas = closedWOs;
        const adherentes = cerradas.filter(w => {
          if (!w.planned_start || !w.actual_start) return false;
          const ps = String(w.planned_start).slice(0, 10);
          const as = String(w.actual_start).slice(0, 10);
          return ps === as;
        }).length;
        const adherenciaPct = cerradas.length > 0 ? Math.round((adherentes / cerradas.length) * 100) : 0;
        // Avisos atrasados = WRs pendientes >24h sin validar
        const now = Date.now();
        const avisosAtrasados = pendingWRs.filter(wr => {
          if (!wr.created_at) return false;
          const age = (now - new Date(wr.created_at).getTime()) / (1000 * 60 * 60);
          return age > 24;
        }).length;
        // OTs atrasadas = en estado COMPLETADO/EN_EJECUCION sin notificar/cerrar +24h tras planned_end
        const otsAtrasadas = activeWOs.filter(w => {
          if (!w.planned_end) return false;
          const end = new Date(w.planned_end).getTime();
          if (isNaN(end)) return false;
          const overdue = (now - end) / (1000 * 60 * 60);
          return overdue > 24 && (w.status === 'EN_EJECUCION' || w.status === 'COMPLETADO');
        }).length;
        const tone = (pct, target = 80) =>
          pct >= target ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200'
          : pct >= target - 15 ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200'
          : 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200';
        const countTone = (n) =>
          n === 0 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200'
          : n < 3 ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200'
          : 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200';
        return (
          <div className="space-y-2">
            {/* Fila 1: 4 KPIs principales del supervisor */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className={`rounded-xl border p-4 ${tone(cumplimientoPct, 85)}`}>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle size={18} />
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Cumplimiento programa</span>
                </div>
                <div className="text-3xl font-extrabold">{cumplimientoPct}%</div>
                <div className="text-[10px] opacity-70 mt-1">{Math.round(actualHH)}h ejec / {Math.round(plannedHH)}h plan · meta 85%</div>
              </div>
              <div className={`rounded-xl border p-4 ${tone(adherenciaPct, 80)}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={18} />
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Adherencia programa</span>
                </div>
                <div className="text-3xl font-extrabold">{adherenciaPct}%</div>
                <div className="text-[10px] opacity-70 mt-1">{adherentes} en día / {cerradas.length} cerradas · meta 80%</div>
              </div>
              <div className={`rounded-xl border p-4 ${countTone(avisosAtrasados)}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Inbox size={18} />
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Avisos atrasados</span>
                </div>
                <div className="text-3xl font-extrabold">{avisosAtrasados}</div>
                <div className="text-[10px] opacity-70 mt-1">pendientes &gt;24h sin validar</div>
              </div>
              <div className={`rounded-xl border p-4 ${countTone(otsAtrasadas)}`}>
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle size={18} />
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">OTs atrasadas</span>
                </div>
                <div className="text-3xl font-extrabold">{otsAtrasadas}</div>
                <div className="text-[10px] opacity-70 mt-1">vencidas &gt;24h sin notificar</div>
              </div>
            </div>
            {/* Fila 2: counts secundarios (chicos) */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-[10px]">
              {[
                { label: 'In Execution', value: kpis.exec, color: 'text-amber-700 bg-amber-50/50' },
                { label: 'Scheduled', value: kpis.prog, color: 'text-indigo-700 bg-indigo-50/50' },
                { label: 'Fast Track', value: kpis.fastTrack, color: 'text-red-700 bg-red-50/50' },
                { label: 'Completed', value: kpis.completed, color: 'text-emerald-700 bg-emerald-50/50' },
                { label: 'Closed', value: kpis.closed, color: 'text-gray-700 bg-gray-50/50' },
                { label: 'HH plan/real', value: `${kpis.totalPlannedHH.toFixed(0)}/${kpis.totalActualHH.toFixed(0)}h`, color: 'text-purple-700 bg-purple-50/50' },
              ].map(k => (
                <div key={k.label} className={`rounded-lg border border-border px-2 py-1 ${k.color}`}>
                  <div className="font-bold tabular-nums">{k.value}</div>
                  <div className="opacity-70 truncate">{k.label}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* View selector */}
      <div className="flex gap-1 border-b border-border">
        {VIEWS.map(v => (
          <button key={v.id} onClick={() => setView(v.id)}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${view === v.id ? 'border-amber-600 text-amber-700 dark:text-amber-400' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            <v.icon size={16} /> {v.label}
            {v.count > 0 && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${view === v.id ? 'bg-amber-600 text-white' : 'bg-muted text-muted-foreground'}`}>{v.count}</span>}
          </button>
        ))}
      </div>

      {/* ═══ PROGRAMADO VIEW — SF-566 Tanda C (Jorge 2026-04-27) ═══
          Vista cronológica del supervisor: OTs programadas para esta semana
          agrupadas por día y separadas por turno día (07-19) y noche (19-07),
          ordenadas por planned_start. Navegación entre semanas con weekOffset
          compartido del state superior (C2 Tanda C). */}
      {view === 'programado' && (() => {
        // C2: filtrar por semana seleccionada (weekOffset shift de la actual)
        const now = new Date();
        const offset = now.getDay() === 0 ? 6 : now.getDay() - 1;
        const weekMon = new Date(now); weekMon.setDate(now.getDate() - offset + (weekOffset * 7)); weekMon.setHours(0,0,0,0);
        const weekSun = new Date(weekMon); weekSun.setDate(weekMon.getDate() + 6); weekSun.setHours(23,59,59,999);
        const weekMonStr = weekMon.toISOString().slice(0, 10);
        const weekSunStr = weekSun.toISOString().slice(0, 10);
        const weekNum = Math.ceil(((weekMon - new Date(weekMon.getFullYear(), 0, 1)) / 86400000 + new Date(weekMon.getFullYear(), 0, 1).getDay() + 1) / 7);
        const programmedWOs = activeWOs.filter(w => {
          if (w.wo_type === 'PM03' || ['P1', 'P2'].includes(w.priority_code)) return false;
          if (!w.planned_start) return weekOffset === 0; // sin fecha solo en semana actual
          const d = String(w.planned_start).slice(0, 10);
          return d >= weekMonStr && d <= weekSunStr;
        });
        // Agrupar por dia (planned_start) y dentro por turno
        const groups = {};
        const undated = [];
        programmedWOs.forEach(wo => {
          const d = wo.planned_start ? String(wo.planned_start).slice(0, 10) : null;
          if (!d) { undated.push(wo); return; }
          if (!groups[d]) groups[d] = { day: [], night: [] };
          const shift = (wo.shift || 'day').toLowerCase();
          (shift === 'night' ? groups[d].night : groups[d].day).push(wo);
        });
        // Ordenar OTs dentro de cada turno por hora
        Object.values(groups).forEach(g => {
          const byTime = (a, b) => String(a.planned_start || '').localeCompare(String(b.planned_start || ''));
          g.day.sort(byTime); g.night.sort(byTime);
        });
        const sortedDates = Object.keys(groups).sort();
        const dayLabel = iso => {
          const dt = new Date(iso + 'T12:00:00');
          return dt.toLocaleDateString('es-CL', { weekday: 'long', day: '2-digit', month: 'short' });
        };
        return (
          <div className="space-y-3">
            <div className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-900/10 p-3">
              <div className="flex items-center gap-2 mb-2">
                <button type="button" onClick={() => setWeekOffset(o => o - 1)}
                  className="px-2 py-0.5 rounded bg-white border border-indigo-300 text-xs font-bold text-indigo-700 hover:bg-indigo-100">◀</button>
                <span className="text-sm font-bold text-indigo-900 dark:text-indigo-200">
                  W{String(weekNum).padStart(2, '0')} · {weekMon.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })} – {weekSun.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
                  {weekOffset !== 0 && <span className="ml-2 text-[10px] text-indigo-600">({weekOffset > 0 ? '+' : ''}{weekOffset}w)</span>}
                </span>
                <button type="button" onClick={() => setWeekOffset(o => o + 1)}
                  className="px-2 py-0.5 rounded bg-white border border-indigo-300 text-xs font-bold text-indigo-700 hover:bg-indigo-100">▶</button>
                {weekOffset !== 0 && (
                  <button type="button" onClick={() => setWeekOffset(0)}
                    className="px-2 py-0.5 rounded bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700">Hoy</button>
                )}
                <span className="ml-auto text-xs text-indigo-700 dark:text-indigo-300 font-semibold">{programmedWOs.length} OTs</span>
              </div>
              <p className="text-[11px] text-indigo-700 dark:text-indigo-200">
                Vista cronológica del programa semanal. Sigue el orden numérico dentro de cada día/turno para ejecutar.
              </p>
            </div>
            {sortedDates.length === 0 && undated.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-12 text-center">
                <Calendar size={40} className="text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground">No hay OTs programadas para esta semana</p>
              </div>
            ) : (
              sortedDates.map(date => (
                <div key={date} className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="bg-muted/40 px-4 py-2 font-bold text-sm capitalize border-b border-border">
                    {dayLabel(date)}
                  </div>
                  <div className="divide-y divide-border/50">
                    {['day', 'night'].map(shift => {
                      const list = groups[date][shift];
                      if (list.length === 0) return null;
                      return (
                        <div key={shift} className="p-3">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                            {shift === 'day' ? '☀️ Turno día (07:00-19:00)' : '🌙 Turno noche (19:00-07:00)'}
                            <span className="ml-auto text-foreground tabular-nums">{list.length} OT{list.length !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="space-y-1.5">
                            {list.map((wo, i) => (
                              <div key={wo.wo_id} className="flex items-center gap-2 text-xs p-2 rounded bg-muted/20 hover:bg-muted/40 transition-colors">
                                <span className="font-bold text-muted-foreground w-6 text-right">{i + 1}.</span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${PRIO_STYLE[wo.priority_code] || PRIO_STYLE.P3}`}>{wo.priority_code}</span>
                                <span className="font-mono font-semibold">{wo.wo_number}</span>
                                <span className="flex-1 truncate text-foreground">{wo.description || wo.equipment_tag}</span>
                                <span className="tabular-nums text-muted-foreground">{wo.estimated_hours || 0}h</span>
                                <span className="text-[10px] font-semibold text-muted-foreground">{wo.status}</span>
                                <button onClick={() => setExpandedWO(wo)}
                                  className="text-[10px] px-2 py-1 rounded border border-border hover:bg-muted">
                                  ver
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
            {undated.length > 0 && (
              <div className="bg-card border border-amber-300 dark:border-amber-700 rounded-xl p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-2">
                  ⚠️ Sin fecha programada · {undated.length}
                </div>
                <div className="space-y-1">
                  {undated.map(wo => (
                    <div key={wo.wo_id} className="flex items-center gap-2 text-xs p-2 rounded bg-amber-50/50 dark:bg-amber-900/10">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${PRIO_STYLE[wo.priority_code] || PRIO_STYLE.P3}`}>{wo.priority_code}</span>
                      <span className="font-mono font-semibold">{wo.wo_number}</span>
                      <span className="flex-1 truncate">{wo.description || wo.equipment_tag}</span>
                      <span className="tabular-nums text-muted-foreground">{wo.estimated_hours || 0}h</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ═══ NOTIFICACIÓN VIEW — CE1 Tanda C-EXT (Jorge 2026-04-28 12:32) ═══
          Mantenedor (o supervisor) carga HH real + cantidad real por cada
          operación de cada OT en ejecución/completada. Sistema detecta
          automáticamente si es notificación parcial (faltan ops) o final.
          Audit alimenta análisis de desempeño (último módulo). */}
      {view === 'notif' && (
        <div className="space-y-3">
          <div className="rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/40 dark:bg-purple-900/10 p-3">
            <div className="flex items-center gap-2 text-purple-800 dark:text-purple-300 font-bold text-sm mb-1">
              <FileText size={14} /> Notificación · captura HH real por operación
            </div>
            <p className="text-[11px] text-purple-700 dark:text-purple-200">
              Para cada operación ingresá <strong>cantidad real</strong> de personas y <strong>horas reales</strong>.
              Cuando todas las ops de la OT están notificadas, el sistema marca automáticamente como <em>notificación final</em>.
            </p>
          </div>
          {notifWOs.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <FileText size={40} className="text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground">Sin OTs en ejecución para notificar</p>
              <p className="text-xs text-muted-foreground mt-1">Las OTs aparecen acá una vez que pasan a EN_EJECUCION</p>
            </div>
          ) : (
            notifWOs.map(wo => {
              const ops = Array.isArray(wo.operations) ? wo.operations : [];
              const opsNotif = ops.filter(op => (parseFloat(op.actual_hours) || 0) > 0);
              const isPartial = opsNotif.length > 0 && opsNotif.length < ops.length;
              const isFinal = opsNotif.length === ops.length && ops.length > 0;
              const totalPlannedHH = ops.reduce((s, op) => s + (parseFloat(op.hours) || 0) * (parseInt(op.quantity) || 1), 0);
              const totalActualHH = ops.reduce((s, op) => s + (parseFloat(op.actual_hours) || 0) * (parseInt(op.actual_quantity) || 0), 0);
              const variance = totalActualHH - totalPlannedHH;
              const variancePct = totalPlannedHH > 0 ? Math.round((variance / totalPlannedHH) * 100) : 0;
              return (
                <div key={wo.wo_id} className={`bg-card border-2 rounded-xl p-4 shadow-sm ${isFinal ? 'border-emerald-300 dark:border-emerald-700' : isPartial ? 'border-amber-300 dark:border-amber-700' : 'border-border'}`}>
                  {/* Header de la OT */}
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <div className={`text-[10px] font-bold px-1.5 py-1 rounded ${PRIO_STYLE[wo.priority_code] || PRIO_STYLE.P3}`}>
                      {wo.priority_code}
                    </div>
                    <span className="font-mono text-sm font-bold">{wo.wo_number}</span>
                    <span className="text-xs text-muted-foreground">{wo.equipment_tag}</span>
                    <span className="flex-1 text-sm font-medium">{wo.description}</span>
                    {/* Banner parcial / final */}
                    {isFinal ? (
                      <span className="text-[10px] font-bold px-2 py-1 rounded bg-emerald-600 text-white">
                        ✓ Notificación FINAL
                      </span>
                    ) : isPartial ? (
                      <span className="text-[10px] font-bold px-2 py-1 rounded bg-amber-500 text-white">
                        ⏳ PARCIAL · {opsNotif.length}/{ops.length}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-1 rounded bg-gray-300 text-gray-700">
                        Sin notificar
                      </span>
                    )}
                  </div>
                  {/* Resumen HH plan vs real */}
                  <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-2 text-center">
                      <div className="text-[10px] uppercase font-bold text-blue-700">HH Planificadas</div>
                      <div className="text-lg font-bold tabular-nums">{totalPlannedHH.toFixed(1)}h</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded p-2 text-center">
                      <div className="text-[10px] uppercase font-bold text-purple-700">HH Reales</div>
                      <div className="text-lg font-bold tabular-nums">{totalActualHH.toFixed(1)}h</div>
                    </div>
                    <div className={`rounded p-2 text-center ${
                      Math.abs(variancePct) > 20 ? 'bg-red-50 dark:bg-red-900/20' :
                      Math.abs(variancePct) > 10 ? 'bg-amber-50 dark:bg-amber-900/20' :
                      'bg-emerald-50 dark:bg-emerald-900/20'}`}>
                      <div className="text-[10px] uppercase font-bold">Desviación</div>
                      <div className="text-lg font-bold tabular-nums">
                        {variance >= 0 ? '+' : ''}{variance.toFixed(1)}h ({variancePct >= 0 ? '+' : ''}{variancePct}%)
                      </div>
                    </div>
                  </div>
                  {/* Tabla de operaciones para notificar */}
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/40">
                        <tr>
                          <th className="text-left px-2 py-1.5 font-semibold text-muted-foreground">#</th>
                          <th className="text-left px-2 py-1.5 font-semibold text-muted-foreground">Op</th>
                          <th className="text-left px-2 py-1.5 font-semibold text-muted-foreground">Spec</th>
                          <th className="text-center px-2 py-1.5 font-semibold text-muted-foreground">Cant. plan</th>
                          <th className="text-center px-2 py-1.5 font-semibold text-muted-foreground">Hrs plan</th>
                          <th className="text-center px-2 py-1.5 font-semibold text-purple-700">Cant. real</th>
                          <th className="text-center px-2 py-1.5 font-semibold text-purple-700">Hrs reales</th>
                          <th className="text-center px-2 py-1.5 font-semibold text-muted-foreground">HH real</th>
                          <th className="text-left px-2 py-1.5 font-semibold text-muted-foreground">Notas</th>
                          <th className="text-center px-2 py-1.5 font-semibold text-muted-foreground">↻</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ops.map((op, i) => {
                          const aQty = parseFloat(op.actual_quantity) || 0;
                          const aHours = parseFloat(op.actual_hours) || 0;
                          const aHH = aQty * aHours;
                          const notified = aHours > 0;
                          const saveOp = async (patch) => {
                            const nextOps = ops.map((o, idx) => idx === i ? { ...o, ...patch } : o);
                            try {
                              await updateManagedWO(wo.wo_id, { operations: nextOps });
                              loadData();
                            } catch (e) { toast.error('Error: ' + (e.message || e)); }
                          };
                          return (
                            <tr key={i} className={`border-t border-border/40 ${notified ? 'bg-emerald-50/30 dark:bg-emerald-900/10' : ''}`}>
                              <td className="px-2 py-1.5 font-mono text-muted-foreground">{String((i+1)*10).padStart(4, '0')}</td>
                              <td className="px-2 py-1.5 truncate max-w-[200px]">{op.description || op.task || '—'}</td>
                              <td className="px-2 py-1.5 text-[10px]">{op.specialty || '—'}</td>
                              <td className="px-2 py-1.5 text-center tabular-nums text-muted-foreground">{op.quantity || 1}</td>
                              <td className="px-2 py-1.5 text-center tabular-nums text-muted-foreground">{op.hours || 0}</td>
                              <td className="px-2 py-1.5 text-center">
                                <input type="number" min="0" step="1" defaultValue={aQty || ''}
                                  placeholder={String(op.quantity || 1)}
                                  onBlur={(e) => {
                                    const v = parseFloat(e.target.value);
                                    if (!isNaN(v) && v !== aQty) saveOp({ actual_quantity: v });
                                  }}
                                  className="w-12 text-center bg-card border border-border rounded px-1 py-0.5 text-xs" />
                              </td>
                              <td className="px-2 py-1.5 text-center">
                                <input type="number" min="0" step="0.25" defaultValue={aHours || ''}
                                  placeholder={String(op.hours || 0)}
                                  onBlur={(e) => {
                                    const v = parseFloat(e.target.value);
                                    if (!isNaN(v) && v !== aHours) saveOp({ actual_hours: v });
                                  }}
                                  className="w-14 text-center bg-card border border-border rounded px-1 py-0.5 text-xs font-semibold" />
                              </td>
                              <td className="px-2 py-1.5 text-center font-bold tabular-nums">
                                {notified ? aHH.toFixed(1) : <span className="text-muted-foreground">—</span>}
                              </td>
                              <td className="px-2 py-1.5">
                                <input type="text" defaultValue={op.notif_notes || ''}
                                  placeholder="comentarios..."
                                  onBlur={(e) => {
                                    if (e.target.value !== (op.notif_notes || '')) saveOp({ notif_notes: e.target.value });
                                  }}
                                  className="w-full bg-card border border-border rounded px-1 py-0.5 text-xs" />
                              </td>
                              {/* CE7 Tanda C-EXT: reprogramar operación individual.
                                  Marca op.reprogrammed=true + razón. El planner ve la
                                  bandera en Planning y decide moverla a OT futura. */}
                              <td className="px-2 py-1.5 text-center">
                                {op.reprogrammed ? (
                                  <span title={op.reprogram_reason || 'Reprogramada'}
                                    className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 cursor-help">
                                    ↻ ⚠
                                  </span>
                                ) : (
                                  <div className="flex items-center justify-center gap-1">
                                    {/* SF-572 — notif parcial multi-turno con histórico técnico+turno+HH */}
                                    {wo.status === 'EN_EJECUCION' && (
                                      <button
                                        title="Notificación parcial (modal: técnico+turno+HH)"
                                        onClick={() => setPartialModal({ wo, op, opIndex: i })}
                                        className="text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded p-0.5 text-[11px]">
                                        📋
                                      </button>
                                    )}
                                    {!notified ? (
                                      <button
                                        title="Reprogramar esta operación (no se ejecutó)"
                                        onClick={() => {
                                          const reason = window.prompt(
                                            `Reprogramar operación "${(op.description || '').slice(0, 50)}"\n\n` +
                                            `Motivo (obligatorio):`
                                          );
                                          if (!reason || !reason.trim()) return;
                                          saveOp({
                                            reprogrammed: true,
                                            reprogram_reason: reason.trim(),
                                            reprogram_at: new Date().toISOString(),
                                          });
                                          toast.success(`Operación marcada para reprogramar`);
                                        }}
                                        className="text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded p-0.5">
                                        ↻
                                      </button>
                                    ) : (
                                      <span className="text-muted-foreground text-[10px]">—</span>
                                    )}
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {/* Acciones — al cerrar la OT desde acá si está final */}
                  {isFinal && wo.status !== 'CERRADO' && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => openClosure(wo)}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1">
                        <CheckCircle size={14} /> Validar y cerrar OT (firma supervisor)
                      </button>
                    </div>
                  )}
                  {isPartial && (
                    <div className="text-[10.5px] text-amber-700 dark:text-amber-300 italic mt-2">
                      Faltan {ops.length - opsNotif.length} operación(es) por notificar antes de cerrar la OT.
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ═══ NO PROGRAMADO VIEW (PM03 / P1-P2) — SF-566 Tanda C ═══
          Antes label "Failures" — renombrado a la terminología SAP PM
          (No Programado = correctivo de falla bypass-planning). */}
      {view === 'failures' && (
        <div className="space-y-3">
          <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50/40 dark:bg-red-900/10 p-3">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-300 font-bold text-sm mb-1">
              <AlertTriangle size={14} /> OTs No Programado · PM03 · Fallas correctivas
            </div>
            <p className="text-[11px] text-red-700 dark:text-red-200">
              OTs P1 (&lt;24h) y P2 (&lt;7d) que vienen directo del aviso sin pasar por planificación.
              Atendelas priorizando P1, completá operaciones/repuestos con IA si hace falta, y firmá al cerrar.
            </p>
          </div>
          {failureWOs.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <CheckCircle size={40} className="text-emerald-400/40 mx-auto mb-3" />
              <p className="text-muted-foreground">Sin fallas activas 🎉</p>
            </div>
          ) : (
            failureWOs.map(wo => {
              const isExec = wo.status === 'EN_EJECUCION';
              const ops = wo.operations || [];
              return (
                <div key={wo.wo_id} className="bg-card border-2 border-red-300 dark:border-red-700 rounded-xl p-4 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className={`text-[10px] font-bold px-1.5 py-1 rounded ${PRIO_STYLE[wo.priority_code] || PRIO_STYLE.P3}`}>
                      {wo.priority_code}
                    </div>
                    <span className="font-mono text-sm font-bold">{wo.wo_number}</span>
                    <span className="text-[10px] font-bold bg-red-600 text-white px-1.5 py-0.5 rounded">PM03</span>
                    <span className="text-xs text-muted-foreground">{wo.equipment_tag}</span>
                    <span className="ml-auto text-[10px] font-semibold text-muted-foreground">{wo.status}</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground mt-2">{wo.description}</p>
                  <div className="flex items-center gap-3 text-[10.5px] text-muted-foreground mt-1">
                    <span>{wo.estimated_hours || 0}h plan</span>
                    <span>{ops.length} operaciones</span>
                    {wo.planning_group && <span className="font-mono">{wo.planning_group}</span>}
                  </div>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {ops.length === 0 && !isExec && (
                      <button onClick={() => handleAIFillFailure(wo)} disabled={aiFilling === wo.wo_id}
                        className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1 disabled:opacity-50">
                        {aiFilling === wo.wo_id ? <Loader2 size={12} className="animate-spin" /> : <Activity size={12} />}
                        IA completa operaciones + repuestos
                      </button>
                    )}
                    {!isExec && (
                      <button onClick={() => handleStartRequest(wo)}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1">
                        <Play size={12} /> Validar y empezar
                      </button>
                    )}
                    {isExec && (
                      <button onClick={() => openClosure(wo)}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1">
                        <FileText size={12} /> Cerrar y firmar
                      </button>
                    )}
                    {/* Jorge 2026-04-23: supervisor puede CANCELAR OT con motivo (no solo cerrarla) */}
                    <button onClick={() => setCancelOtModal({ wo, mode: 'CANCELADO', reason: '' })}
                      className="px-3 py-2 border border-red-300 text-red-700 text-xs font-semibold rounded-lg hover:bg-red-50 flex items-center gap-1"
                      title="Cancelar esta OT con motivo">
                      <X size={12} /> Cancelar
                    </button>
                    {/* Reprogramar: volver a bandeja planificador */}
                    <button onClick={() => setCancelOtModal({ wo, mode: 'REPROGRAMADO', reason: '' })}
                      className="px-3 py-2 border border-amber-300 text-amber-700 text-xs font-semibold rounded-lg hover:bg-amber-50 flex items-center gap-1"
                      title="Reprogramar — vuelve al planificador">
                      Reprog.
                    </button>
                    <button onClick={() => { try { window.open(`/work-management?tab=planning&openWo=${wo.wo_id}`, '_blank'); } catch {} }}
                      className="px-3 py-2 border border-border text-xs font-semibold rounded-lg hover:bg-muted flex items-center gap-1">
                      <ArrowRight size={12} /> Detalle
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ═══ AVISOS PENDIENTES — Jorge 2026-04-22 #9 ═══ */}
      {view === 'avisos' && (
        <div className="space-y-3">
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex items-center gap-2">
            <Inbox size={16} className="text-amber-600" />
            <span className="text-sm font-semibold text-amber-900 dark:text-amber-200">Avisos pendientes de aprobación · {pendingWRs.length}</span>
            <span className="text-xs text-amber-700 dark:text-amber-300 ml-auto">El supervisor aprueba → se transforma en OT</span>
          </div>
          {pendingWRs.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <Inbox size={40} className="text-emerald-400/40 mx-auto mb-3" />
              <p className="text-muted-foreground">Sin avisos pendientes. Todo al día.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingWRs.map(wr => {
                const pd = wr.problem_description || {};
                const txt = pd.original_text || wr.description || wr.failure_description || '';
                const prio = wr.priority_code || wr.priority;
                const prioColor = prio === 'P1' ? 'bg-red-500' : prio === 'P2' ? 'bg-orange-500' : prio === 'P3' ? 'bg-amber-500' : 'bg-blue-500';
                return (
                  <div key={wr.request_id || wr.id} className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded text-white ${prioColor}`}>{prio}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-foreground">{wr.equipment_tag || wr.equipment_name || '—'}</span>
                        {wr.technical_location && <span className="text-[10px] font-mono text-blue-600">{wr.technical_location}</span>}
                        {wr.reported_by && <span className="text-[10px] text-muted-foreground">por {wr.reported_by}</span>}
                      </div>
                      <p className="text-xs text-foreground mt-1 line-clamp-2">{txt}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                        <span>{wr.created_at ? new Date(wr.created_at).toLocaleString('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}</span>
                        {wr.failure_mode_detected && <span className="text-amber-700">{wr.failure_mode_detected}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => window.location.href = `/work-management?tab=identification&wr=${wr.request_id || wr.id}`}
                      className="text-xs font-semibold bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700">
                      Revisar
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══ VISTA SEMANA / CRONOGRAMA — Jorge 2026-04-22 #8 ═══ */}
      {view === 'week' && (() => {
        // Semana calendario actual (lunes a domingo) con OTs activas distribuidas
        const now = new Date();
        const offset = now.getDay() === 0 ? 6 : now.getDay() - 1;
        const monday = new Date(now); monday.setDate(now.getDate() - offset + (weekOffset * 7)); monday.setHours(0, 0, 0, 0);
        const weekDays = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(monday); d.setDate(monday.getDate() + i); return d;
        });
        const weekNum = Math.ceil(((monday - new Date(monday.getFullYear(), 0, 1)) / 86400000 + new Date(monday.getFullYear(), 0, 1).getDay() + 1) / 7);
        const wosByDay = weekDays.map(d => {
          const dStr = d.toISOString().slice(0, 10);
          return activeWOs.filter(w => {
            const start = w.planned_start ? w.planned_start.slice(0, 10) : null;
            const end = w.planned_end ? w.planned_end.slice(0, 10) : null;
            if (!start) return false;
            return start <= dStr && (end ? dStr <= end : dStr === start);
          });
        });
        return (
          <div className="space-y-3">
            <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800 rounded-xl p-3 flex items-center gap-2 flex-wrap">
              <button type="button" onClick={() => setWeekOffset(o => o - 1)}
                className="px-2 py-1 rounded bg-white border border-indigo-300 text-xs font-bold text-indigo-700 hover:bg-indigo-100" title="Semana anterior">◀</button>
              <Calendar size={16} className="text-indigo-600" />
              <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">
                W{String(weekNum).padStart(2, '0')} · {monday.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })} – {weekDays[6].toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
                {weekOffset !== 0 && <span className="ml-2 text-[10px] text-indigo-600">({weekOffset > 0 ? `+${weekOffset}` : weekOffset}w)</span>}
              </span>
              <button type="button" onClick={() => setWeekOffset(o => o + 1)}
                className="px-2 py-1 rounded bg-white border border-indigo-300 text-xs font-bold text-indigo-700 hover:bg-indigo-100" title="Semana siguiente">▶</button>
              {weekOffset !== 0 && (
                <button type="button" onClick={() => setWeekOffset(0)}
                  className="px-2 py-1 rounded bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700">Hoy</button>
              )}
              <span className="text-xs text-indigo-700 dark:text-indigo-300 ml-auto">WIC · {activeWOs.length} OTs en la semana</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
              {weekDays.map((d, i) => {
                const isToday = d.toDateString() === new Date().toDateString();
                const dayWOs = wosByDay[i];
                const dayHH = dayWOs.reduce((s, w) => s + (w.estimated_hours || 0), 0);
                return (
                  <div key={i} className={`rounded-xl border p-2 ${isToday ? 'border-indigo-400 bg-indigo-50/40' : 'border-border bg-card'} min-h-[140px]`}>
                    <div className={`text-[10px] font-bold uppercase ${isToday ? 'text-indigo-700' : 'text-muted-foreground'}`}>
                      {d.toLocaleDateString('es-CL', { weekday: 'short' })} {d.getDate()}
                    </div>
                    <div className="text-[9px] text-muted-foreground mb-1">
                      {dayWOs.length} OT · {dayHH.toFixed(0)}h
                    </div>
                    <div className="space-y-1">
                      {dayWOs.slice(0, 6).map(w => (
                        <div key={w.wo_id} title={`${w.wo_number} · ${w.description}`}
                          className={`text-[9px] px-1.5 py-0.5 rounded truncate ${
                            w.status === 'EN_EJECUCION' ? 'bg-amber-100 text-amber-800' :
                            w.status === 'PROGRAMADO' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                          {w.wo_number || w.equipment_tag}
                        </div>
                      ))}
                      {dayWOs.length > 6 && <div className="text-[9px] text-muted-foreground">+{dayWOs.length - 6}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-2 pt-2">
              <span className="inline-block w-2.5 h-2.5 rounded bg-amber-400" /> En ejecución
              <span className="inline-block w-2.5 h-2.5 rounded bg-blue-400 ml-2" /> Programada
              <span className="inline-block w-2.5 h-2.5 rounded bg-gray-400 ml-2" /> Planificada
            </div>
          </div>
        );
      })()}

      {/* ═══ TODAY VIEW ═══ */}
      {view === 'today' && (
        <div className="space-y-3">
          {activeWOs.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <CheckCircle size={40} className="text-emerald-400/40 mx-auto mb-3" />
              <p className="text-muted-foreground">No active work orders for today</p>
            </div>
          ) : (
            activeWOs.map(wo => {
              const isExpanded = expandedWO === wo.wo_id;
              const pct = wo.completion_pct || 0;
              const isExec = wo.status === 'EN_EJECUCION';
              const isFast = wo.is_fast_track || wo.priority_code === 'P1' || wo.priority_code === 'P2';
              const ops = wo.operations || [];
              const mats = wo.materials || [];

              return (
                <div key={wo.wo_id} className={`bg-card border rounded-xl overflow-hidden transition-all ${isFast ? 'border-red-300 dark:border-red-700 shadow-md' : 'border-border'}`}>
                  {/* WO Header */}
                  <div className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-muted/20 transition-colors"
                    onClick={() => setExpandedWO(isExpanded ? null : wo.wo_id)}>
                    <div className={`text-[10px] font-bold px-1.5 py-1 rounded ${PRIO_STYLE[wo.priority_code] || PRIO_STYLE.P3}`}>
                      {wo.priority_code}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-foreground">{wo.wo_number}</span>
                        {isFast && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500 text-white animate-pulse">FAST TRACK</span>}
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${isExec ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'}`}>
                          {isExec ? 'In Execution' : 'Scheduled'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{wo.equipment_tag} - {wo.description?.substring(0, 50)}</p>
                    </div>
                    {/* Progress */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Avance</span>
                        <div className="w-32 h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-emerald-500' : pct > 50 ? 'bg-blue-500' : pct > 0 ? 'bg-amber-500' : 'bg-gray-300'}`}
                            style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <span className="text-sm font-bold text-foreground w-10 text-right">{pct}%</span>
                      <span className="text-xs text-muted-foreground">{wo.estimated_hours || 0}h</span>
                    </div>
                    {isExpanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border-t border-border px-4 py-4 space-y-4 bg-muted/10">
                      {/* Quick actions */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {!isExec && (
                          <button onClick={() => handleStart(wo)}
                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">
                            <Play size={14} /> Start Execution
                          </button>
                        )}
                        {/* CE4 Tanda C-EXT (Jorge 2026-04-28 12:32): warning
                            si el avance no avanza al ritmo del tiempo planificado.
                            Si %tiempo > %avance + 25 → algo va mal.
                            Si terminó (100%) pero tomó >120% del tiempo plan → over.
                            Si terminó muy rápido (<60% tiempo) → revisar. */}
                        {isExec && (() => {
                          const plannedHours = parseFloat(wo.estimated_hours) || 0;
                          const actualHours = parseFloat(wo.actual_hours) || 0;
                          if (plannedHours <= 0) return null;
                          // Estimar % tiempo transcurrido desde actual_start
                          let timePctElapsed = 0;
                          if (wo.actual_start) {
                            const elapsedMs = Date.now() - new Date(wo.actual_start).getTime();
                            const elapsedH = elapsedMs / (1000 * 60 * 60);
                            timePctElapsed = Math.min(100, Math.round((elapsedH / plannedHours) * 100));
                          }
                          const lag = timePctElapsed - pct;
                          if (lag > 25) {
                            return (
                              <span title={`Llevas ${timePctElapsed}% del tiempo y solo ${pct}% de avance. Algo se está retrasando.`}
                                className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-red-100 text-red-700 border border-red-300 animate-pulse">
                                ⚠️ Retraso {lag}%
                              </span>
                            );
                          }
                          if (lag > 10) {
                            return (
                              <span title={`Tiempo ${timePctElapsed}% / Avance ${pct}%`}
                                className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-amber-100 text-amber-700 border border-amber-300">
                                Atrás del plan
                              </span>
                            );
                          }
                          return null;
                        })()}
                        {/* CE3 Tanda C-EXT (Jorge 2026-04-28 12:32):
                            antes solo botones 25/50/75/100 fijos. Ahora input
                            libre 0-100 + chevrones rápidos. El supervisor
                            es quien actualiza el % (no el mantenedor). */}
                        {isExec && (
                          <div className="flex items-center gap-1 px-2 py-1 rounded-lg border border-border bg-card">
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase">avance</span>
                            <button onClick={() => handleProgress(wo, Math.max(0, pct - 5))}
                              title="-5%" className="px-1.5 text-xs hover:bg-muted rounded">−</button>
                            <input type="number" min="0" max="100" step="5" value={pct}
                              onChange={e => {
                                const v = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                                handleProgress(wo, v);
                              }}
                              className="w-12 text-xs font-bold text-center bg-transparent border border-border rounded px-1 py-0.5" />
                            <span className="text-xs font-bold">%</span>
                            <button onClick={() => handleProgress(wo, Math.min(100, pct + 5))}
                              title="+5%" className="px-1.5 text-xs hover:bg-muted rounded">+</button>
                            <span className="border-l border-border h-4 mx-0.5" />
                            {[25, 50, 75, 100].map(p => (
                              <button key={p} onClick={() => handleProgress(wo, p)}
                                title={`Set ${p}%`}
                                className={`px-2 text-[10px] font-bold rounded ${pct === p ? 'bg-emerald-600 text-white' : 'text-muted-foreground hover:bg-muted'}`}>
                                {p}
                              </button>
                            ))}
                          </div>
                        )}
                        {isExec && pct >= 50 && (
                          <button onClick={() => handleComplete(wo, wo.estimated_hours)}
                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <CheckCircle size={14} /> Complete
                          </button>
                        )}
                        {isExec && (
                          <button onClick={() => openClosure(wo)}
                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors ml-auto">
                            <FileText size={14} /> Close WO
                          </button>
                        )}
                      </div>

                      {/* Workers — CE9 Tanda C-EXT (Jorge 2026-04-28 12:32):
                          asignar/desasignar mantenedores desde la propia OT.
                          Cada chip tiene X para quitar; botón "+ Asignar" abre
                          picker filtrado por specialty de las ops de la OT. */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Users size={14} className="text-muted-foreground" />
                        {(wo.assigned_workers || []).length === 0 && (
                          <span className="text-[11px] text-amber-600 italic">⚠️ Sin técnicos asignados</span>
                        )}
                        {(wo.assigned_workers || []).map((w, i) => (
                          <span key={i} className="inline-flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-lg border border-blue-200 dark:border-blue-700">
                            {w.name} <span className="opacity-70">({w.specialty})</span>
                            {wo.status !== 'CERRADO' && (
                              <button
                                onClick={() => handleRemoveWorker(wo, w.worker_id || w.id)}
                                title="Desasignar"
                                className="ml-0.5 opacity-60 hover:opacity-100 hover:text-red-600">
                                <X size={11} />
                              </button>
                            )}
                          </span>
                        ))}
                        {wo.status !== 'CERRADO' && wo.status !== 'CANCELADO' && (
                          <button
                            onClick={() => setAssignPickerWO(assignPickerWO?.wo_id === wo.wo_id ? null : wo)}
                            className="text-[11px] font-semibold px-2 py-1 rounded-lg border border-dashed border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                            + Asignar
                          </button>
                        )}
                      </div>
                      {/* Picker inline cuando se hace click en + Asignar */}
                      {assignPickerWO?.wo_id === wo.wo_id && (() => {
                        // Filtrar técnicos: por specialty de las ops + plant + disponibles
                        const opSpecs = new Set((ops || [])
                          .map(op => (op.specialty || op.work_center || '').toUpperCase())
                          .filter(Boolean));
                        const assignedIds = new Set((wo.assigned_workers || []).map(w => w.worker_id || w.id));
                        const matchSpec = (s) => {
                          if (opSpecs.size === 0) return true;
                          const u = (s || '').toUpperCase();
                          for (const target of opSpecs) {
                            if (u === target) return true;
                            if (u.length >= 3 && target.includes(u.slice(0, 3))) return true;
                            if (target.length >= 3 && u.includes(target.slice(0, 3))) return true;
                          }
                          return false;
                        };
                        const matched = technicians.filter(t =>
                          !assignedIds.has(t.worker_id || t.id) &&
                          matchSpec(t.specialty)
                        );
                        const others = technicians.filter(t =>
                          !assignedIds.has(t.worker_id || t.id) &&
                          !matchSpec(t.specialty)
                        );
                        return (
                          <div className="bg-card border border-emerald-300 dark:border-emerald-700 rounded-lg p-2 mt-1 max-h-64 overflow-y-auto">
                            <div className="flex items-center justify-between mb-2 sticky top-0 bg-card pb-1 border-b border-border">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                                Asignar técnico {opSpecs.size > 0 && `· filtro: ${[...opSpecs].join(', ')}`}
                              </span>
                              <button onClick={() => setAssignPickerWO(null)} className="text-muted-foreground hover:text-foreground">
                                <X size={12} />
                              </button>
                            </div>
                            {matched.length === 0 && others.length === 0 ? (
                              <p className="text-[11px] text-muted-foreground italic py-2 px-1">
                                No hay técnicos disponibles para asignar
                              </p>
                            ) : (
                              <>
                                {matched.length > 0 && (
                                  <div className="space-y-0.5">
                                    {matched.map(t => (
                                      <button key={t.worker_id || t.id}
                                        onClick={() => { handleAssignWorker(wo, t); setAssignPickerWO(null); }}
                                        className="w-full flex items-center gap-2 text-left text-xs px-2 py-1 rounded hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                                        <span className="text-emerald-600">●</span>
                                        <span className="font-semibold flex-1">{t.name}</span>
                                        <span className="text-[10px] text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 px-1.5 rounded">
                                          {t.specialty || 'OTRO'}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">{t.shift || 'day'}</span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                                {others.length > 0 && (
                                  <>
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-2 pt-2 border-t border-border">
                                      Otras especialidades · asignar bajo tu responsabilidad
                                    </div>
                                    <div className="space-y-0.5 mt-1">
                                      {others.slice(0, 8).map(t => (
                                        <button key={t.worker_id || t.id}
                                          onClick={() => { handleAssignWorker(wo, t); setAssignPickerWO(null); }}
                                          className="w-full flex items-center gap-2 text-left text-xs px-2 py-1 rounded hover:bg-amber-50 dark:hover:bg-amber-900/20 opacity-70">
                                          <span className="text-amber-600">○</span>
                                          <span className="flex-1">{t.name}</span>
                                          <span className="text-[10px] text-muted-foreground">{t.specialty || 'OTRO'}</span>
                                          <span className="text-[10px] text-muted-foreground">{t.shift || 'day'}</span>
                                        </button>
                                      ))}
                                      {others.length > 8 && (
                                        <p className="text-[10px] text-muted-foreground px-2 py-1 italic">+{others.length - 8} más…</p>
                                      )}
                                    </div>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        );
                      })()}

                      {/* Operations checklist + notificación HH por operación (Jorge #7) */}
                      {ops.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Operations ({ops.length})</h4>
                            {isExec && (
                              <span className="text-[10px] text-muted-foreground">Notif. HH → personas y horas reales por op</span>
                            )}
                          </div>
                          <div className="space-y-1">
                            {ops.map((op, i) => {
                              const plannedHH = (op.quantity || 1) * (op.hours || 0);
                              const actualHH = (op.actual_quantity || 0) * (op.actual_hours || 0);
                              const saveOp = async (patch) => {
                                const nextOps = ops.map((o, idx) => idx === i ? { ...o, ...patch } : o);
                                try {
                                  await updateManagedWO(wo.wo_id, { operations: nextOps });
                                  loadData();
                                } catch (e) { toast.error('No se pudo guardar: ' + (e.message || e)); }
                              };
                              return (
                                <div key={i} className="bg-card rounded-lg px-3 py-2 border border-border/50">
                                  <div className="flex items-center gap-2 text-xs">
                                    <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-600">{i + 1}</span>
                                    <span className="flex-1 text-foreground">{(op.description || '').substring(0, 60)}</span>
                                    <span className="text-[10px] text-muted-foreground">{op.specialty}</span>
                                    <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400" title="Plan: personas × horas">
                                      plan {op.quantity || 1}p × {op.hours || 0}h = {plannedHH.toFixed(1)}HH
                                    </span>
                                  </div>
                                  {isExec && (
                                    <div className="flex items-center gap-2 mt-1.5 pl-7 text-[11px]">
                                      <span className="text-muted-foreground">Real:</span>
                                      <input type="number" min="0" step="1"
                                        defaultValue={op.actual_quantity || ''}
                                        placeholder={String(op.quantity || 1)}
                                        onBlur={e => {
                                          const v = parseInt(e.target.value, 10);
                                          if (!isNaN(v) && v !== op.actual_quantity) saveOp({ actual_quantity: v });
                                        }}
                                        title="Cantidad real de personas"
                                        className="w-14 px-1.5 py-0.5 text-center border border-border rounded bg-background" />
                                      <span className="text-muted-foreground">pers ×</span>
                                      <input type="number" min="0" step="0.5"
                                        defaultValue={op.actual_hours || ''}
                                        placeholder={String(op.hours || 0)}
                                        onBlur={e => {
                                          const v = parseFloat(e.target.value);
                                          if (!isNaN(v) && v !== op.actual_hours) saveOp({ actual_hours: v });
                                        }}
                                        title="Horas reales de la operación"
                                        className="w-14 px-1.5 py-0.5 text-center border border-border rounded bg-background" />
                                      <span className="text-muted-foreground">h = </span>
                                      <span className={`font-bold ${actualHH > plannedHH ? 'text-red-600' : 'text-emerald-700'}`}>
                                        {actualHH.toFixed(1)}HH
                                      </span>
                                      {actualHH > 0 && plannedHH > 0 && (
                                        <span className="ml-1 text-[9px] text-muted-foreground">
                                          ({actualHH > plannedHH ? '+' : ''}{(((actualHH - plannedHH) / plannedHH) * 100).toFixed(0)}%)
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Materials */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Materials ({mats.length})</h4>
                          {isExec && (
                            <button onClick={() => setAddMaterialFor({ wo_id: wo.wo_id, materials: mats })}
                              className="text-[11px] font-semibold bg-blue-600 text-white px-2.5 py-1 rounded-lg hover:bg-blue-700 inline-flex items-center gap-1"
                              title="Agregar material adicional durante la ejecución (crea reserva nueva)">
                              <Plus size={11} /> Agregar material
                            </button>
                          )}
                        </div>
                        {mats.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {mats.map((m, i) => (
                              <span key={i} className="text-[11px] bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded border border-border">
                                <span className="font-mono text-gray-400">{m.code || m.sapId}</span> {m.description} x{m.quantity}
                                {m.added_during_execution && <span className="ml-1 text-[9px] bg-amber-100 text-amber-700 px-1 rounded">nuevo</span>}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] italic text-muted-foreground">Sin materiales cargados</p>
                        )}
                      </div>

                      {/* Actual hours input */}
                      {isExec && (
                        <div className="flex items-center gap-3 bg-card border border-border rounded-lg p-3">
                          <Clock size={14} className="text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Actual hours:</span>
                          <input type="number" min="0" step="0.5"
                            defaultValue={wo.actual_hours || ''}
                            onBlur={e => {
                              const hrs = parseFloat(e.target.value);
                              if (hrs > 0) updateManagedWO(wo.wo_id, { actual_hours: hrs }).then(() => toast.success('Hours saved')).catch(() => {});
                            }}
                            className="w-20 text-sm font-bold border border-border rounded-lg px-2 py-1 text-center bg-background text-foreground" />
                          <span className="text-xs text-muted-foreground">/ {wo.estimated_hours || 0}h planned</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ═══ CLOSE VIEW ═══ */}
      {view === 'close' && (() => {
        const q = batchFilter.trim().toLowerCase().replace(/[\s\-]+/g, '');
        const visibleWOs = q
          ? completedWOs.filter(wo =>
              (wo.wo_number || '').toLowerCase().replace(/[\s\-]+/g, '').includes(q) ||
              (wo.equipment_tag || '').toLowerCase().includes(batchFilter.toLowerCase()) ||
              (wo.description || '').toLowerCase().includes(batchFilter.toLowerCase()))
          : completedWOs;
        const allSelected = visibleWOs.length > 0 && visibleWOs.every(w => batchSelected.has(w.wo_id));
        const selHours = Array.from(batchSelected).reduce((s, id) => {
          const wo = completedWOs.find(w => w.wo_id === id);
          return s + (parseFloat(batchHours[id]) || wo?.actual_hours || wo?.estimated_hours || 0);
        }, 0);
        const selCost = selHours * LABOR_RATE;
        return (
          <div className="space-y-3">
            {/* Bandeja header: filter + batch actions */}
            <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-3 flex-wrap">
              <div className="flex-1 min-w-[220px]">
                <input value={batchFilter} onChange={e => setBatchFilter(e.target.value)}
                  placeholder="Filtrar por OT, equipo, descripción…"
                  className="w-full text-sm border border-border rounded-lg px-3 py-1.5 bg-background" />
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-3">
                <span>{visibleWOs.length} OTs</span>
                {batchSelected.size > 0 && (
                  <>
                    <span className="font-bold text-emerald-700">{batchSelected.size} seleccionadas</span>
                    <span>{selHours.toFixed(1)}h · ${selCost.toFixed(0)}</span>
                  </>
                )}
              </div>
              <button onClick={() => toggleBatchAll(visibleWOs)}
                disabled={visibleWOs.length === 0}
                className="text-xs px-3 py-1.5 border border-border rounded-lg hover:bg-muted disabled:opacity-40">
                {allSelected ? 'Deseleccionar' : 'Seleccionar todas'}
              </button>
              <button onClick={handleBatchClose} disabled={batchSelected.size === 0 || batchClosing}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-40">
                {batchClosing ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                Cerrar {batchSelected.size > 0 ? batchSelected.size : ''} seleccionadas
              </button>
            </div>

            {visibleWOs.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-12 text-center">
                <FileText size={40} className="text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground">{completedWOs.length === 0 ? 'No hay OTs completadas pendientes de cierre' : 'Ninguna OT coincide con el filtro'}</p>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="divide-y divide-border/50">
                  {visibleWOs.map(wo => {
                    const isSel = batchSelected.has(wo.wo_id);
                    const hoursVal = batchHours[wo.wo_id] ?? (wo.actual_hours || wo.estimated_hours || '');
                    const cost = (parseFloat(hoursVal) || 0) * LABOR_RATE;
                    return (
                      <div key={wo.wo_id} className={`flex items-center gap-3 p-3 transition-colors ${isSel ? 'bg-emerald-50 dark:bg-emerald-900/10' : 'hover:bg-muted/20'}`}>
                        <input type="checkbox" checked={isSel} onChange={() => toggleBatchSelect(wo.wo_id)}
                          className="w-4 h-4 accent-emerald-600 cursor-pointer" />
                        <div className={`text-[10px] font-bold px-1.5 py-1 rounded ${PRIO_STYLE[wo.priority_code] || PRIO_STYLE.P3}`}>{wo.priority_code}</div>
                        <div className="flex-1 min-w-0">
                          <span className="font-mono text-sm font-bold text-foreground">{wo.wo_number}</span>
                          <p className="text-xs text-muted-foreground truncate">{wo.equipment_tag} · {wo.description?.substring(0, 60)}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <input type="number" min="0" step="0.5" value={hoursVal}
                            onChange={e => setBatchHours(prev => ({ ...prev, [wo.wo_id]: e.target.value }))}
                            className="w-16 text-xs text-right border border-border rounded px-2 py-1 bg-background"
                            placeholder="HH" />
                          <span className="text-[10px] text-muted-foreground">h</span>
                        </div>
                        <div className="text-xs font-bold text-emerald-600 w-16 text-right">${cost.toFixed(0)}</div>
                        <button onClick={() => openClosure({ ...wo, actual_hours: hoursVal })}
                          className="text-xs px-2.5 py-1.5 text-muted-foreground border border-border rounded-lg hover:bg-muted"
                          title="Cerrar con notas detalladas">
                          <FileText size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ═══ HISTORY VIEW — turnos anteriores (Jorge SF-514) ═══ */}
      {view === 'history' && (() => {
        const byDate = new Map();
        closedWOs.forEach(wo => {
          const d = wo.closed_at ? wo.closed_at.slice(0, 10) : (wo.actual_end || '').slice(0, 10) || 'sin fecha';
          if (!byDate.has(d)) byDate.set(d, []);
          byDate.get(d).push(wo);
        });
        const dates = Array.from(byDate.keys()).filter(d => d !== 'sin fecha').sort().reverse();
        return (
          <div className="space-y-4">
            <div className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-900/10 p-3">
              <div className="flex items-center gap-2 text-indigo-800 dark:text-indigo-300 font-bold text-sm mb-1">
                <Calendar size={14} /> Historial de turnos anteriores
              </div>
              <p className="text-[11px] text-indigo-700 dark:text-indigo-200">
                OTs cerradas agrupadas por fecha de cierre. Incluye firma del supervisor y variance plan vs real.
              </p>
            </div>
            {dates.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">Sin historial disponible</div>
            ) : (
              dates.map(date => {
                const items = byDate.get(date);
                const totalPlan = items.reduce((s, w) => s + (parseFloat(w.estimated_hours) || 0), 0);
                const totalActual = items.reduce((s, w) => s + (parseFloat(w.actual_hours) || 0), 0);
                const variance = totalPlan > 0 ? Math.round(((totalActual - totalPlan) / totalPlan) * 100) : 0;
                return (
                  <div key={date} className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-foreground">
                          {new Date(date + 'T00:00:00').toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </h3>
                        <p className="text-[11px] text-muted-foreground">{items.length} OT{items.length > 1 ? 's' : ''} cerradas · {totalPlan.toFixed(1)}h plan · {totalActual.toFixed(1)}h real</p>
                      </div>
                      <div className={`text-xs font-bold px-2.5 py-1 rounded ${Math.abs(variance) <= 10 ? 'bg-emerald-100 text-emerald-700' : Math.abs(variance) <= 25 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                        Variance: {variance > 0 ? '+' : ''}{variance}%
                      </div>
                    </div>
                    <div className="divide-y divide-border/60">
                      {items.map(wo => {
                        const plan = parseFloat(wo.estimated_hours) || 0;
                        const actual = parseFloat(wo.actual_hours) || 0;
                        const v = plan > 0 ? Math.round(((actual - plan) / plan) * 100) : 0;
                        return (
                          <div key={wo.wo_id} className="px-4 py-2.5 flex items-center gap-3 hover:bg-muted/20">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${PRIO_STYLE[wo.priority_code] || PRIO_STYLE.P3}`}>{wo.priority_code}</span>
                            <span className="font-mono text-xs font-bold text-foreground shrink-0">{wo.wo_number}</span>
                            <span className="text-xs text-muted-foreground shrink-0">{wo.equipment_tag}</span>
                            <span className="flex-1 text-xs text-foreground truncate">{wo.description}</span>
                            <span className="text-[11px] text-muted-foreground shrink-0">{plan}h → {actual}h</span>
                            <span className={`text-[11px] font-bold shrink-0 ${Math.abs(v) <= 10 ? 'text-emerald-700' : Math.abs(v) <= 25 ? 'text-amber-700' : 'text-rose-700'}`}>
                              {v > 0 ? '+' : ''}{v}%
                            </span>
                            {wo.closed_by_signature && (
                              <span className="text-[10px] text-muted-foreground shrink-0 italic">por {wo.closed_by_signature}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        );
      })()}

      {/* ═══ SUMMARY VIEW ═══ */}
      {view === 'summary' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl p-6 text-center">
              <TrendingUp className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <div className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-300">{closedWOs.length}</div>
              <div className="text-xs font-semibold text-emerald-600 uppercase">WOs Closed</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6 text-center">
              <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-3xl font-extrabold text-blue-700 dark:text-blue-300">{closedWOs.reduce((s, w) => s + (w.actual_hours || 0), 0).toFixed(0)}h</div>
              <div className="text-xs font-semibold text-blue-600 uppercase">Total Hours</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl p-6 text-center">
              <BarChart2 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-3xl font-extrabold text-purple-700 dark:text-purple-300">${closedWOs.reduce((s, w) => s + (w.actual_total_cost || (w.actual_hours || 0) * LABOR_RATE), 0).toFixed(0)}</div>
              <div className="text-xs font-semibold text-purple-600 uppercase">Total Cost</div>
            </div>
          </div>

          {/* Recently closed */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30">
              <h3 className="text-sm font-bold text-foreground">Recently Closed</h3>
            </div>
            <div className="divide-y divide-border/50" style={{ maxHeight: '40vh', overflowY: 'auto' }}>
              {closedWOs.map(wo => (
                <div key={wo.wo_id} className="px-4 py-3 flex items-center gap-3 text-xs hover:bg-muted/20">
                  <span className="font-mono font-bold text-foreground">{wo.wo_number}</span>
                  <span className="text-muted-foreground truncate flex-1">{wo.equipment_tag} - {wo.description?.substring(0, 30)}</span>
                  <span className="text-muted-foreground">{wo.actual_hours || 0}h</span>
                  <span className="font-bold text-emerald-600">${((wo.actual_total_cost || (wo.actual_hours || 0) * LABOR_RATE)).toFixed(0)}</span>
                  <span className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 px-2 py-0.5 rounded font-semibold">Closed</span>
                </div>
              ))}
              {closedWOs.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-sm">No closed WOs yet</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ QR SCANNER ═══ */}
      {showQR && (
        <Suspense fallback={null}>
          <QRScanner
            onClose={() => setShowQR(false)}
            onScan={(code) => {
              setShowQR(false);
              const q = code.toLowerCase().replace(/[\s\-]+/g, '');
              // Search both scheduled (PROGRAMADO) and active (EN_EJECUCION) WOs
              const searchIn = [...activeWOs];
              const matchByNumber = searchIn.find(wo =>
                (wo.wo_number || '').toLowerCase().replace(/[\s\-]+/g, '').includes(q)
              );
              const matchByTag = !matchByNumber && searchIn.filter(wo =>
                (wo.equipment_tag || '').toLowerCase().includes(code.toLowerCase())
              );
              if (matchByNumber) {
                if (matchByNumber.status === 'EN_EJECUCION') {
                  toast.info(`${matchByNumber.wo_number} ya está en ejecución`);
                  setExpandedWO(matchByNumber.wo_id);
                } else {
                  toast.success(`${matchByNumber.wo_number} · ${matchByNumber.equipment_tag} — iniciando ejecución`);
                  handleStart(matchByNumber, { fromQR: true });
                }
              } else if (matchByTag && matchByTag.length === 1) {
                const wo = matchByTag[0];
                toast.success(`${wo.wo_number} encontrada por equipo ${code} — iniciando`);
                handleStart(wo, { fromQR: true });
              } else if (matchByTag && matchByTag.length > 1) {
                toast.info(`${matchByTag.length} OTs para equipo ${code}. Selecciona manualmente.`);
                setView('today');
              } else {
                toast.error('No se encontró OT activa para: ' + code);
              }
            }}
          />
        </Suspense>
      )}

      {/* ═══ CLOSURE MODAL — Group A #3 signature + #5 plan-vs-actual ═══ */}
      {closureWO && (() => {
        const opsTotalPlan = closureOps.reduce((a, o) => a + (parseFloat(o.hours) || 0) * (parseFloat(o.quantity) || 1), 0);
        const opsTotalActual = closureOps.reduce((a, o) => a + (parseFloat(o.actual_hours) || 0), 0);
        const planTotal = opsTotalPlan > 0 ? opsTotalPlan : (parseFloat(closureWO.estimated_hours) || 0);
        const actualTotal = opsTotalActual > 0 ? opsTotalActual : (parseFloat(closureHours) || 0);
        const variance = planTotal > 0 ? Math.round(((actualTotal - planTotal) / planTotal) * 100) : 0;
        const varianceTone = Math.abs(variance) <= 10 ? 'text-emerald-700' : Math.abs(variance) <= 25 ? 'text-amber-700' : 'text-rose-700';
        return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !closing && setClosureWO(null)} />
          <div className="relative z-10 bg-white dark:bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h3 className="text-lg font-bold text-foreground">Cerrar y firmar OT</h3>
                <p className="text-xs text-muted-foreground">{closureWO.wo_number} · {closureWO.equipment_tag}</p>
              </div>
              <button onClick={() => setClosureWO(null)} className="p-1 hover:bg-muted rounded-lg"><X size={18} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Plan vs Actual per operation */}
              {closureOps.length > 0 && (
                <div>
                  <div className="flex items-baseline justify-between mb-2">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">HH real por operación</label>
                    <span className={`text-[11px] font-bold ${varianceTone}`}>
                      Variance: {variance > 0 ? '+' : ''}{variance}% ({actualTotal.toFixed(1)}h vs {planTotal.toFixed(1)}h plan)
                    </span>
                  </div>
                  <div className="border border-border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-12 bg-muted/40 text-[10px] font-semibold uppercase text-muted-foreground px-2 py-1.5">
                      <div className="col-span-1">#</div>
                      <div className="col-span-6">Operación</div>
                      <div className="col-span-2 text-right">Plan HH</div>
                      <div className="col-span-3 text-right">Real HH</div>
                    </div>
                    {closureOps.map((op, i) => {
                      const planHH = (parseFloat(op.hours) || 0) * (parseFloat(op.quantity) || 1);
                      const actualHH = parseFloat(op.actual_hours) || 0;
                      const opVar = planHH > 0 ? ((actualHH - planHH) / planHH) : 0;
                      const rowTone = Math.abs(opVar) > 0.25 ? 'bg-rose-50/40 dark:bg-rose-900/10' : '';
                      return (
                        <div key={i} className={`grid grid-cols-12 items-center px-2 py-1.5 text-xs border-t border-border/60 ${rowTone}`}>
                          <div className="col-span-1 font-mono text-muted-foreground">{i + 1}</div>
                          <div className="col-span-6 truncate text-foreground">{op.description || op.task || '—'}</div>
                          <div className="col-span-2 text-right tabular-nums text-muted-foreground">{planHH.toFixed(1)}</div>
                          <div className="col-span-3">
                            <input type="number" min="0" step="0.25" value={op.actual_hours ?? ''}
                              onChange={e => {
                                const v = e.target.value;
                                setClosureOps(prev => prev.map((p, idx) => idx === i ? { ...p, actual_hours: v === '' ? '' : parseFloat(v) } : p));
                              }}
                              className="w-full text-right text-xs px-2 py-1 border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Manual total fallback when there are no operations */}
              {closureOps.length === 0 && (
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">HH reales totales *</label>
                  <input type="number" min="0" step="0.5" value={closureHours} onChange={e => setClosureHours(e.target.value)}
                    className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    placeholder={`Plan: ${closureWO.estimated_hours || 0}h`} />
                </div>
              )}

              {/* Observations + audio — Fase 7 Jorge 2026-04-21 */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Observaciones</label>
                  <AudioDictateButton onText={(t) => setClosureNotes(prev => (prev ? prev + '\n' : '') + t)} />
                </div>
                <textarea value={closureNotes} onChange={e => setClosureNotes(e.target.value)}
                  className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 min-h-[60px]"
                  placeholder="Desvíos, hallazgos, seguimiento... (o grabá audio con el botón)" />
                <ClosureClassify notes={closureNotes} />
              </div>

              {/* Signature block — legal trace */}
              <div className="border-2 border-dashed border-emerald-300 dark:border-emerald-700 rounded-xl p-4 bg-emerald-50/30 dark:bg-emerald-900/10">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 mb-2">Firma del supervisor · obligatoria</div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="text-[10px] font-semibold text-muted-foreground mb-1 block">Nombre completo *</label>
                    <input value={closureSignature} onChange={e => setClosureSignature(e.target.value)}
                      className="w-full border border-border rounded-lg px-2.5 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      placeholder="Ej: Juan Pérez" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground mb-1 block">PIN (opcional)</label>
                    <input type="password" inputMode="numeric" maxLength={6} value={closurePin} onChange={e => setClosurePin(e.target.value.replace(/\D/g, ''))}
                      className="w-full border border-border rounded-lg px-2.5 py-2 text-sm tracking-widest bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      placeholder="••••" />
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">Al firmar declaras que el trabajo fue ejecutado y verificado. La OT quedará bloqueada para edición post-cierre.</p>
              </div>

              {/* Cost preview */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 grid grid-cols-3 gap-2 text-xs">
                <div><span className="text-muted-foreground block text-[10px]">HH real</span><span className="font-bold text-foreground">{actualTotal.toFixed(1)}h</span></div>
                <div><span className="text-muted-foreground block text-[10px]">Rate</span><span className="font-bold text-foreground">${LABOR_RATE}/h</span></div>
                <div><span className="text-muted-foreground block text-[10px]">Costo mano de obra</span><span className="font-bold text-emerald-700">${(actualTotal * LABOR_RATE).toFixed(0)}</span></div>
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t border-border bg-muted/20">
              <button onClick={() => setClosureWO(null)} disabled={closing}
                className="flex-1 py-2.5 text-sm font-semibold border border-border rounded-xl text-foreground hover:bg-muted">
                Cancelar
              </button>
              <button onClick={handleClose} disabled={closing || !closureSignature.trim() || (closureOps.length === 0 && !closureHours)}
                className="flex-1 py-2.5 text-sm font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-40 flex items-center justify-center gap-2">
                {closing ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                Cerrar y firmar
              </button>
            </div>
          </div>
        </div>
        );
      })()}

      {/* #6 Add Material during execution — Jorge 2026-04-22 */}
      {/* Jorge 2026-04-23: Modal Cancelar/Reprogramar OT con motivo */}
      {cancelOtModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" onClick={() => setCancelOtModal(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative z-10 bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-3">
              <X className={cancelOtModal.mode === 'CANCELADO' ? 'w-6 h-6 text-red-600' : 'w-6 h-6 text-amber-600'} />
              <h3 className="text-lg font-bold text-foreground">
                {cancelOtModal.mode === 'CANCELADO' ? `Cancelar ${cancelOtModal.wo?.wo_number || 'OT'}` : `Reprogramar ${cancelOtModal.wo?.wo_number || 'OT'}`}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {cancelOtModal.mode === 'CANCELADO'
                ? 'La OT quedará CANCELADO. El aviso asociado NO se cierra (el trabajo no se ejecutó).'
                : 'La OT vuelve a la bandeja del planificador (REPROGRAMADO) para revalidar repuestos.'}
            </p>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              Motivo <span className="text-red-500">*</span>
            </label>
            <textarea autoFocus value={cancelOtModal.reason}
              onChange={e => setCancelOtModal(m => ({ ...m, reason: e.target.value }))}
              rows={4}
              placeholder={cancelOtModal.mode === 'CANCELADO' ? 'Ej.: Equipo dado de baja…' : 'Ej.: Sacrificada por falla P1…'}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:ring-2 focus:ring-orange-500/30 resize-none" />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setCancelOtModal(null)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg">Volver</button>
              <button disabled={!cancelOtModal.reason.trim()}
                onClick={async () => {
                  try {
                    await updateManagedWO(cancelOtModal.wo.wo_id, {
                      status: cancelOtModal.mode,
                      cancellation_reason: cancelOtModal.reason.trim(),
                    });
                    toast.success(cancelOtModal.mode === 'CANCELADO' ? 'OT cancelada' : 'OT reprogramada');
                    setCancelOtModal(null);
                    loadData();
                  } catch (e) { toast.error(e.message || 'Error'); }
                }}
                className={`px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed ${cancelOtModal.mode === 'CANCELADO' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'}`}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {addMaterialFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => !savingMat && setAddMaterialFor(null)}>
          <div className="bg-white dark:bg-card rounded-xl shadow-2xl w-full max-w-md p-5" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-foreground mb-1">Agregar material adicional</h3>
            <p className="text-xs text-muted-foreground mb-4">Crea una reserva nueva durante la ejecución. Marcada como "nuevo".</p>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold uppercase text-muted-foreground">Código SAP</label>
                <input value={newMatForm.code}
                  onChange={e => setNewMatForm(f => ({ ...f, code: e.target.value }))}
                  placeholder="p.ej. 1000234"
                  className="w-full text-sm mt-1 px-3 py-2 border border-border rounded-lg bg-background font-mono focus:ring-2 focus:ring-blue-300" />
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase text-muted-foreground">Descripción</label>
                <input value={newMatForm.description}
                  onChange={e => setNewMatForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="p.ej. Sello mecánico 2in"
                  className="w-full text-sm mt-1 px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-blue-300" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold uppercase text-muted-foreground">Cantidad</label>
                  <input type="number" min="1" value={newMatForm.quantity}
                    onChange={e => setNewMatForm(f => ({ ...f, quantity: parseInt(e.target.value, 10) || 1 }))}
                    className="w-full text-sm mt-1 px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-blue-300" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase text-muted-foreground">Unidad</label>
                  <select value={newMatForm.unit}
                    onChange={e => setNewMatForm(f => ({ ...f, unit: e.target.value }))}
                    className="w-full text-sm mt-1 px-3 py-2 border border-border rounded-lg bg-background">
                    <option value="PZ">PZ</option>
                    <option value="M">M</option>
                    <option value="KG">KG</option>
                    <option value="L">L</option>
                    <option value="SET">SET</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setAddMaterialFor(null)} disabled={savingMat}
                className="px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted rounded-lg">Cancelar</button>
              <button
                disabled={savingMat || !newMatForm.description.trim()}
                onClick={async () => {
                  setSavingMat(true);
                  try {
                    const newItem = {
                      code: newMatForm.code || `ADD-${Date.now()}`,
                      description: newMatForm.description,
                      quantity: newMatForm.quantity,
                      unit: newMatForm.unit,
                      added_during_execution: true,
                      added_at: new Date().toISOString(),
                    };
                    const nextMats = [...(addMaterialFor.materials || []), newItem];
                    await updateManagedWO(addMaterialFor.wo_id, { materials: nextMats });
                    toast.success('Material agregado');
                    setAddMaterialFor(null);
                    setNewMatForm({ code: '', description: '', quantity: 1, unit: 'PZ' });
                    loadData();
                  } catch (e) { toast.error('Error: ' + (e.message || e)); }
                  setSavingMat(false);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {savingMat ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} Agregar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SF-566 C6: Validation gate antes de EN_EJECUCION para PM03 fast-track.
          Supervisor confirma 3 chequeos antes de proceder. Audit trail captura
          la decisión vía supervisor_validated_by + supervisor_validated_at. */}
      {validateGate && (() => {
        const w = validateGate.wo;
        const ops = w.operations || [];
        const mats = w.materials || [];
        const allChecked = gateChecks.ops && gateChecks.materials && gateChecks.safety;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setValidateGate(null)} />
            <div className="relative z-10 bg-white dark:bg-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-5 border-b border-border bg-amber-50 dark:bg-amber-900/20">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={20} className="text-amber-600" />
                  <h3 className="text-lg font-bold text-foreground">Validación supervisor · OT {w.wo_number}</h3>
                </div>
                <p className="text-xs text-amber-800 dark:text-amber-200 mt-1">
                  Esta OT es <strong>{w.priority_code} / {w.wo_type}</strong> (falla correctiva fast-track). Confirmá los 3 puntos antes de pasar a ejecución.
                </p>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Operaciones · {ops.length}</div>
                  {ops.length === 0 ? (
                    <p className="text-xs text-red-600 italic">⚠️ Esta OT no tiene operaciones definidas. Usá "IA completa operaciones" antes de seguir.</p>
                  ) : (
                    <div className="text-xs space-y-1 max-h-32 overflow-y-auto bg-muted/30 rounded p-2">
                      {ops.slice(0, 5).map((op, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="font-mono text-muted-foreground">{String((i+1)*10).padStart(4,'0')}</span>
                          <span className="text-foreground truncate flex-1">{op.description || op.task || '—'}</span>
                          <span className="tabular-nums">{(op.hours || 0)}h</span>
                        </div>
                      ))}
                      {ops.length > 5 && <div className="text-[10px] text-muted-foreground">+{ops.length - 5} más</div>}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Materiales · {mats.length}</div>
                  {mats.length === 0 ? (
                    <p className="text-xs text-amber-600 italic">Sin materiales asignados. Verificá si el trabajo realmente no requiere repuestos.</p>
                  ) : (
                    <div className="text-xs space-y-1 max-h-24 overflow-y-auto bg-muted/30 rounded p-2">
                      {mats.slice(0, 4).map((m, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="font-mono text-muted-foreground w-16 truncate">{m.code || '—'}</span>
                          <span className="flex-1 truncate">{m.description || '—'}</span>
                          <span className="tabular-nums">{m.quantity || 1} {m.unit || ''}</span>
                        </div>
                      ))}
                      {mats.length > 4 && <div className="text-[10px] text-muted-foreground">+{mats.length - 4} más</div>}
                    </div>
                  )}
                </div>
                <div className="border-t border-border pt-3 space-y-2">
                  <label className="flex items-start gap-2 cursor-pointer text-sm">
                    <input type="checkbox" checked={gateChecks.ops}
                      onChange={e => setGateChecks(s => ({ ...s, ops: e.target.checked }))}
                      className="mt-0.5 accent-emerald-600" />
                    <span>Revisé las <strong>operaciones</strong> y son correctas para este trabajo.</span>
                  </label>
                  <label className="flex items-start gap-2 cursor-pointer text-sm">
                    <input type="checkbox" checked={gateChecks.materials}
                      onChange={e => setGateChecks(s => ({ ...s, materials: e.target.checked }))}
                      className="mt-0.5 accent-emerald-600" />
                    <span>Confirmé que los <strong>materiales/repuestos</strong> están disponibles o no se requieren.</span>
                  </label>
                  <label className="flex items-start gap-2 cursor-pointer text-sm">
                    <input type="checkbox" checked={gateChecks.safety}
                      onChange={e => setGateChecks(s => ({ ...s, safety: e.target.checked }))}
                      className="mt-0.5 accent-emerald-600" />
                    <span>Verifiqué <strong>condiciones de seguridad</strong> (LOTO/perímetro/EPP) según procedimiento.</span>
                  </label>
                </div>
              </div>
              <div className="p-3 border-t border-border flex gap-2 bg-muted/20">
                <button onClick={() => setValidateGate(null)}
                  className="flex-1 py-2 text-sm font-semibold border border-border rounded-lg hover:bg-muted">
                  Cancelar
                </button>
                <button disabled={!allChecked}
                  onClick={async () => {
                    try {
                      await updateManagedWO(w.wo_id, {
                        supervisor_validated_by: 'supervisor',
                        supervisor_validated_at: new Date().toISOString(),
                        supervisor_validation_notes: 'ops+materials+safety confirmed via SF-566 gate',
                      });
                    } catch { /* el audit field puede no estar en backend, no bloquear */ }
                    setValidateGate(null);
                    handleStart(w, { ...validateGate.opts, bypassGate: true });
                  }}
                  className="flex-1 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed">
                  Validar y empezar ejecución
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* SF-572 — modal notificación parcial multi-turno */}
      <PartialNotifyModal
        open={!!partialModal}
        onClose={() => setPartialModal(null)}
        wo={partialModal?.wo}
        op={partialModal?.op}
        opIndex={partialModal?.opIndex}
        plantId={plant}
        onSuccess={() => loadData()}
      />
    </div>
  );
}
