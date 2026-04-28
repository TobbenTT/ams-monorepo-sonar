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
  // SF-566 Tanda C (Jorge transcript 2026-04-27): supervisor distingue
  // PROGRAMADO (sale de Scheduling) vs NO PROGRAMADO (PM03 P1/P2 fallas).
  const VIEWS = [
    { id: 'today', label: 'Hoy', icon: Zap, count: activeWOs.length },
    { id: 'programado', label: '📅 Programado', icon: Calendar, count: activeWOs.filter(w => w.wo_type !== 'PM03' && !['P1', 'P2'].includes(w.priority_code)).length },
    { id: 'failures', label: '🚨 No Programado (PM03)', icon: AlertTriangle, count: failureWOs.length },
    { id: 'avisos', label: '📨 Avisos', icon: Inbox, count: pendingWRs.length },
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

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: 'In Execution', value: kpis.exec, icon: Play, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200' },
          { label: 'Scheduled', value: kpis.prog, icon: Calendar, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200' },
          { label: 'Fast Track', value: kpis.fastTrack, icon: Zap, color: 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200' },
          { label: 'Completed', value: kpis.completed, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200' },
          { label: 'Closed', value: kpis.closed, icon: FileText, color: 'text-gray-600 bg-gray-50 dark:bg-gray-800 border-gray-200' },
          { label: 'Planned HH', value: kpis.totalPlannedHH.toFixed(0) + 'h', icon: Clock, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200' },
          { label: 'Actual HH', value: kpis.totalActualHH.toFixed(0) + 'h', icon: Timer, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-200' },
        ].map(k => (
          <div key={k.label} className={`rounded-xl border p-3 ${k.color}`}>
            <k.icon size={16} className="mb-1" />
            <div className="text-xl font-extrabold">{k.value}</div>
            <div className="text-[10px] font-semibold uppercase tracking-wider opacity-70">{k.label}</div>
          </div>
        ))}
      </div>

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
          ordenadas por planned_start. Reemplaza la lista plana del "Hoy".  */}
      {view === 'programado' && (() => {
        const programmedWOs = activeWOs.filter(w => w.wo_type !== 'PM03' && !['P1', 'P2'].includes(w.priority_code));
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
              <div className="flex items-center gap-2 text-indigo-800 dark:text-indigo-300 font-bold text-sm mb-1">
                <Calendar size={14} /> Programa de la semana · vista cronológica
              </div>
              <p className="text-[11px] text-indigo-700 dark:text-indigo-200">
                OTs programadas agrupadas por día y separadas por turno. Sigue el orden cronológico para ejecutarlas.
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
                      <button onClick={() => handleStart(wo)}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1">
                        <Play size={12} /> Iniciar ejecución
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
                        {/* Progress buttons */}
                        {isExec && [25, 50, 75, 100].map(p => (
                          <button key={p} onClick={() => handleProgress(wo, p)}
                            className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all ${pct >= p ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-card text-foreground border-border hover:bg-emerald-50 hover:border-emerald-300 dark:hover:bg-emerald-900/20'}`}>
                            {p}%
                          </button>
                        ))}
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

                      {/* Workers */}
                      {(wo.assigned_workers || []).length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <Users size={14} className="text-muted-foreground" />
                          {wo.assigned_workers.map((w, i) => (
                            <span key={i} className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-lg border border-blue-200 dark:border-blue-700">
                              {w.name} ({w.specialty})
                            </span>
                          ))}
                        </div>
                      )}

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
    </div>
  );
}
