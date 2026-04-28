import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { CritBadge, LoadingSpinner } from '../components/Shared';
import { useWebSocket } from '../hooks/useWebSocket';
import LiveIndicator from '../components/LiveIndicator';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../api';
import { Sparkles as SparklesIcon } from 'lucide-react';
import {
  Calendar, Clock, Users, CheckCircle, Circle, Play, Loader2,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Inbox, Camera, Sparkles, Send, X,
  FileText, Wrench, AlertTriangle, Filter, Eye, BarChart3,
  Package, Upload, Lock, ArrowRight, ArrowUpRight, Search, GripVertical, Trash2, CheckCircle2, Plus, RotateCcw
} from 'lucide-react';

const TYPE_META = {
  PM01: { label: 'PM01 Programado', bg: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700' },
  PM02: { label: 'PM02 Planificado', bg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700' },
  PM03: { label: 'PM03 No Programado', bg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-700' },
  CORRECTIVO: { label: 'PM01 Programado', bg: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700' },
  PREVENTIVO: { label: 'PM02 Planificado', bg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700' },
  PREDICTIVO: { label: 'PM03 No Programado', bg: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-700' },
  MEJORA: { label: 'PM04 Mejora', bg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700' },
  INCIDENTE_OPERACIONAL: { label: 'PM05 Incidente', bg: 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-700' },
  MONITOREO_CONDICION: { label: 'PM06 Monitoreo', bg: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-700' },
};

const STATUS_META = {
  COMPLETED: { bg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700' },
  PLANNED: { bg: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600' },
  IN_PROGRESS: { bg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700' },
  CLOSED: { bg: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-700' },
  SCHEDULED: { bg: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700' },
  RELEASED: { bg: 'bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-700' },
  DRAFT: { bg: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700' },
};

const PRIORITY_COLOR = {
  P1: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700',
  P2: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700',
  P3: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700',
  P4: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700',
};

const DAYS_WEEKDAY = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const DAYS_FULL = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SHIFTS = [
  { id: 'day', label: 'Day', icon: '☀️', hours: 8, start: '07:00', end: '19:00' },
  { id: 'night', label: 'Night', icon: '🌙', hours: 8, start: '19:00', end: '07:00' },
];

const GANTT_COLORS = {
  CORRECTIVO: '#EF4444',
  PREVENTIVO: '#3B82F6',
  PREDICTIVO: '#8B5CF6',
  MEJORA: '#10B981',
  INCIDENTE_OPERACIONAL: '#DC2626',
  MONITOREO_CONDICION: '#0891B2',
  PM01: '#EF4444',
  PM02: '#3B82F6',
  PM03: '#F59E0B',
};

const SPEC_BADGE = {
  // English
  MECHANICAL: { label: 'MECH', bg: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  ELECTRICAL: { label: 'ELEC', bg: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  INSTRUMENTATION: { label: 'INST', bg: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
  HYDRAULIC: { label: 'HYD', bg: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300' },
  FITTER: { label: 'FIT', bg: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
  WELDER: { label: 'WELD', bg: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  WELDING: { label: 'WELD', bg: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  GENERAL: { label: 'GEN', bg: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  // Spanish (actual DB values)
  MECANICO: { label: 'MEC', bg: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  ELECTRICO: { label: 'ELEC', bg: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  INSTRUMENTACION: { label: 'INST', bg: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
  SOLDADOR: { label: 'SOLD', bg: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
};
function getCapacitySettings() {
  try {
    const plantId = localStorage.getItem('selected_plant') || 'OCP-JFC1';
    const s = JSON.parse(localStorage.getItem(`ocp_settings_${plantId}`) || localStorage.getItem('ocp_settings') || '{}');
    // B3-4 Jorge 2026-04-27: shiftType determina duración de turno
    // 'day_night' = 12h cada turno; 'abc_8h' = 3 turnos de 8h (subterránea)
    const shiftType = s.shiftType || 'day_night';
    const shiftDurationHours = shiftType === 'abc_8h' ? 8 : (s.nominalHoursPerShift || 12);
    return {
      effectiveHours: s.effectiveHoursPerShift || 10,
      shiftDurationHours,
      shiftType,
      mineType: s.mineType || 'plant',
      schedulingPct: s.schedulingPercent || 80,
      weekStartDay: s.weekStartDay ?? 1,
      dayShiftCount: s.dayShiftCount ?? null,   // explicit day-shift staffing (Jorge)
      nightShiftCount: s.nightShiftCount ?? null, // explicit night-shift staffing
    };
  } catch { return { effectiveHours: 10, shiftDurationHours: 12, shiftType: 'day_night', mineType: 'plant', schedulingPct: 80, dayShiftCount: null, nightShiftCount: null }; }
}
function useCapacitySettings() {
  const [cap, setCap] = useState(getCapacitySettings);
  useEffect(() => {
    const onChange = () => setCap(getCapacitySettings());
    window.addEventListener('storage', onChange);
    window.addEventListener('ocp-settings-changed', onChange);
    return () => {
      window.removeEventListener('storage', onChange);
      window.removeEventListener('ocp-settings-changed', onChange);
    };
  }, []);
  // Jorge 2026-04-21: sacado factor de productividad — confundía y metía error
  // en la matemática. Time on Tool se medirá en otra suite aparte.
  // HH programables = horas efectivas × % programable / 100.
  const programmableHHPerShift = cap.effectiveHours * (cap.schedulingPct / 100);
  return { CAP: cap, PROGRAMMABLE_HH_PER_DAY: programmableHHPerShift, PROGRAMMABLE_HH_PER_SHIFT: programmableHHPerShift, HOURS_PER_WEEK: programmableHHPerShift * 5 };
}

// Fase 3 Jorge 2026-04-21 — verificar si un técnico está ON-SHIFT según su patrón.
// Evita mostrar 5x2 en sáb/dom, 7x7 en sus 7 días de descanso, etc.
function isTechOnShift(tech, date) {
  const pattern = (tech?.shift_pattern || '').toLowerCase();
  if (!pattern || pattern === 'continuous' || pattern === 'abc_8h') return true;
  const dow = date.getDay(); // 0 dom .. 6 sab
  if (pattern === '5x2') return dow >= 1 && dow <= 5;
  if (pattern === '4x3') return dow >= 1 && dow <= 4;
  if (pattern === '7x7' || pattern === '14x14') {
    const start = tech.shift_cycle_start ? new Date(tech.shift_cycle_start) : null;
    if (!start || isNaN(start.getTime())) return true; // no ciclo → mostrar
    const MS_DAY = 86400000;
    const days = Math.floor((date.getTime() - start.getTime()) / MS_DAY);
    const cycle = pattern === '7x7' ? 14 : 28;
    const on = pattern === '7x7' ? 7 : 14;
    const pos = ((days % cycle) + cycle) % cycle;
    return pos < on;
  }
  return true;
}

// Classify a technician as 'day' or 'night' based on their workforce shift field
function techShift(tech) {
  const s = (tech?.shift || '').toUpperCase();
  if (s === 'NIGHT' || s === 'NOCHE') return 'night';
  return 'day'; // DAY, MORNING, AFTERNOON, empty → treat as day
}

function getWeekStart(d) {
  const cap = getCapacitySettings();
  const startDay = cap.weekStartDay ?? 1; // 0=Sun, 1=Mon, 3=Wed
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day - startDay + 7) % 7;
  date.setDate(date.getDate() - diff);
  date.setHours(0, 0, 0, 0);
  return date;
}
function getMonday(d) { return getWeekStart(d); }
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function fmtDateShort(d) { return d.toLocaleDateString('en', { month: 'short', day: 'numeric' }); }
function toDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/* ───── OCR Closure Modal ───── */
function OCRClosureModal({ order, t, onClose, onSubmit }) {
  const [step, setStep] = useState(1);
  const [photo, setPhoto] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [ocrData, setOcrData] = useState(null);
  const fileRef = useRef(null);

  const handleCapture = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(URL.createObjectURL(file));
    setProcessing(true);
    api.ocrWorkOrderClosure({
      work_order_id: order.id,
      actual_hours: order.duration_planned * 0.95,
      completion_date: new Date().toISOString().slice(0, 10),
      findings: '',
      spare_parts_used: '',
      condition_after: 'Good',
      technician_notes: '',
      ocr_confidence: 0,
    }).then((result) => {
      setOcrData({
        actual_hours: result.actual_hours || order.duration_planned * 0.95,
        completion_date: result.completion_date || new Date().toISOString().slice(0, 10),
        findings: result.findings || t('scheduling.ocrFindings'),
        spare_parts_used: result.spare_parts_used || 'None',
        condition_after: result.condition_after || 'Good',
        technician_notes: result.technician_notes || t('scheduling.ocrTechNotes'),
        confidence: result.ocr_confidence || Math.round(55 + Math.random() * 20),
      });
      setProcessing(false);
      setStep(2);
    }).catch(() => {
      setOcrData({
        actual_hours: order.duration_planned * (0.85 + Math.random() * 0.3),
        completion_date: new Date().toISOString().slice(0, 10),
        findings: t('scheduling.ocrFindings'),
        spare_parts_used: 'None',
        condition_after: 'Good',
        technician_notes: t('scheduling.ocrTechNotes'),
        confidence: Math.round(55 + Math.random() * 20),
      });
      setProcessing(false);
      setStep(2);
    });
  };

  const handleSubmitClosure = () => {
    setStep(3);
    setTimeout(() => { onSubmit(order, ocrData); }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-bold text-foreground">{t('scheduling.ocrClosureTitle')}</h3>
            <p className="text-xs text-muted-foreground">{order.id} — {order.equipment}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= s ? 'bg-[#1B5E20] text-white' : 'bg-muted text-muted-foreground'}`}>{s}</div>
                {s < 3 && <div className={`w-8 h-0.5 ${step > s ? 'bg-[#1B5E20]' : 'bg-muted'}`} />}
              </div>
            ))}
          </div>
          {step === 1 && (
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-muted rounded-2xl flex items-center justify-center">
                <Camera size={32} className="text-muted-foreground" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">{t('scheduling.ocrStep1Title')}</h4>
                <p className="text-sm text-muted-foreground mt-1">{t('scheduling.ocrStep1Desc')}</p>
              </div>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCapture} />
              <button onClick={() => fileRef.current?.click()} className="px-6 py-3 bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-semibold rounded-xl transition-colors flex items-center gap-2 mx-auto">
                <Camera size={18} /> {t('scheduling.takePhoto')}
              </button>
            </div>
          )}
          {processing && (
            <div className="text-center py-8 space-y-3">
              <Loader2 size={32} className="animate-spin text-[#1B5E20] mx-auto" />
              <p className="text-sm text-muted-foreground">{t('scheduling.ocrProcessing')}</p>
              {photo && <img src={photo} alt="Captured" className="w-40 h-40 object-cover rounded-lg mx-auto border border-border" />}
            </div>
          )}
          {step === 2 && ocrData && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-[#1B5E20]" />
                <span className="text-sm font-semibold text-foreground">{t('scheduling.ocrResultTitle')}</span>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-[#1B5E20]/10 text-[#1B5E20] dark:text-green-400 font-bold">{ocrData.confidence}% {t('scheduling.confidence')}</span>
              </div>
              {photo && <img src={photo} alt="Captured" className="w-full h-32 object-cover rounded-lg border border-border" />}
              {[
                { label: t('scheduling.actualHours'), key: 'actual_hours', format: v => `${v.toFixed(1)}h` },
                { label: t('scheduling.completionDate'), key: 'completion_date' },
                { label: t('scheduling.findings'), key: 'findings' },
                { label: t('scheduling.sparePartsUsed'), key: 'spare_parts_used' },
                { label: t('scheduling.conditionAfter'), key: 'condition_after' },
                { label: t('scheduling.techNotes'), key: 'technician_notes' },
              ].map(f => (
                <div key={f.key} className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-muted-foreground">{f.label}</label>
                  <input type="text" defaultValue={f.format ? f.format(ocrData[f.key]) : ocrData[f.key]}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30" />
                </div>
              ))}
              <button onClick={handleSubmitClosure} className="w-full py-3 bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                <Send size={16} /> {t('scheduling.submitClosure')}
              </button>
            </div>
          )}
          {step === 3 && (
            <div className="text-center py-8 space-y-3">
              <div className="w-16 h-16 mx-auto bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                <CheckCircle size={32} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <h4 className="font-bold text-foreground">{t('scheduling.closureSubmitted')}</h4>
              <p className="text-sm text-muted-foreground">{t('scheduling.closureSubmittedDesc')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───── Work Order Detail Modal ───── */
function WODetailModal({ order, t, onClose, onClosureClick }) {
  // Handle both shapes: inbox `order` (id, type, description, equipment, ...) and
  // managed WO (wo_id, wo_number, wo_type, description, equipment_tag, ...).
  const isManaged = !!order.wo_id || !!order.wo_number;
  const woId = order.wo_id || order.id;
  const woNum = order.wo_number || order.id;
  const woType = order.wo_type || order.type || 'PM02';
  const description = order.description || '—';
  const equipment = order.equipment_tag || order.equipment || '—';
  const priority = order.priority_code || order.priority || 'P4';
  const status = order.status || 'PENDIENTE';
  const plannedHours = order.estimated_hours ?? order.duration_planned ?? 0;
  const actualHours = order.actual_hours ?? order.duration_actual ?? 0;
  const techs = Array.isArray(order.assigned_workers)
    ? order.assigned_workers.map(w => w.name || w.worker_id).filter(Boolean)
    : (Array.isArray(order.technicians) ? order.technicians : []);
  const ops = Array.isArray(order.operations) ? order.operations : [];
  const materials = Array.isArray(order.materials) ? order.materials : [];
  const deviation = actualHours - plannedHours;
  const hasDeviation = actualHours > 0 && deviation !== 0;
  const typeMeta = TYPE_META[woType] || TYPE_META.PM02;
  const prioTone = priority === 'P1' ? 'bg-red-500 text-white'
    : priority === 'P2' ? 'bg-orange-500 text-white'
    : priority === 'P3' ? 'bg-blue-500 text-white'
    : 'bg-gray-400 text-white';
  const specToneLocal = (specRaw) => {
    const s = (specRaw || '').toUpperCase();
    const hit = Object.entries(SPEC_BADGE).find(([k]) => s.startsWith(k.slice(0, 3)) || k.startsWith(s.slice(0, 3)));
    return hit ? hit[1] : { label: (s || '—').slice(0,4), bg: 'bg-slate-100 text-slate-700' };
  };
  const navigate = (globalThis.__mageamNav || null);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-border flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="font-mono text-sm font-bold text-foreground">{woNum}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${prioTone}`}>{priority}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${typeMeta.bg}`}>{typeMeta.label || woType}</span>
          <div className="flex-1" />
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors" title="Cerrar">
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <h3 className="text-lg font-bold text-foreground leading-tight">{description}</h3>
          <div className="grid grid-cols-2 gap-3">
            <DetailCard label="Equipo" value={equipment} />
            <DetailCard label="Estado" value={status} />
            <DetailCard label="HH planeadas" value={`${plannedHours}h`} />
            {actualHours > 0 && (
              <DetailCard label="HH reales" value={
                <span className="flex items-center gap-1">{actualHours}h
                  {hasDeviation && (
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${deviation > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      {deviation > 0 ? '+' : ''}{deviation.toFixed(1)}h
                    </span>
                  )}
                </span>
              } />
            )}
            {order.planning_group && <DetailCard label="Grupo planeamiento" value={order.planning_group} />}
            {order.work_center && <DetailCard label="Puesto trabajo" value={order.work_center} />}
            {techs.length > 0 && <DetailCard label="Técnicos" value={techs.join(', ')} />}
            {order.reservation_code && <DetailCard label="Reserva" value={<span className="font-mono">{order.reservation_code}</span>} />}
          </div>

          {/* David 2026-04-28 (Jorge bug 'cambio para el resumen'): desglose
              Duración + Total HH + HH por disciplina, igual que ExpandedWOCard.
              Si la OT no tiene operations, sintetizamos del wo.estimated_hours +
              wo.work_center / specialty para que el card siempre informe. */}
          {(() => {
            const byDiscipline = {};
            let totalHH = 0;
            let serieHrs = 0;
            const parGroups = {};
            if (ops.length > 0) {
              for (const op of ops) {
                const spec = (op.specialty || op.work_center || order.work_center || 'OTRO').toUpperCase();
                const qty = parseInt(op.quantity) || 1;
                const hh = (parseFloat(op.hours) || 0) * qty;
                byDiscipline[spec] = (byDiscipline[spec] || 0) + hh;
                totalHH += hh;
                if (op.parallel) {
                  const g = op.parallel_group || 'A';
                  parGroups[g] = Math.max(parGroups[g] || 0, parseFloat(op.hours) || 0);
                } else {
                  serieHrs += parseFloat(op.hours) || 0;
                }
              }
            } else {
              const fallbackHH = parseFloat(plannedHours) || 0;
              const fallbackSpec = (order.work_center || order.specialty || 'OTRO').toUpperCase();
              if (fallbackHH > 0) {
                byDiscipline[fallbackSpec] = fallbackHH;
                totalHH = fallbackHH;
                serieHrs = fallbackHH;
              }
            }
            const parallelHrs = Object.values(parGroups).reduce((s, v) => s + v, 0);
            const duration = serieHrs + parallelHrs;
            if (totalHH === 0) return null;
            const entries = Object.entries(byDiscipline).sort((a, b) => b[1] - a[1]);
            return (
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-2.5">
                  <div className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300 tracking-wider">Duración</div>
                  <div className="text-base font-bold text-foreground tabular-nums mt-0.5">{duration.toFixed(1)}h</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2.5">
                  <div className="text-[10px] font-bold uppercase text-blue-700 dark:text-blue-300 tracking-wider">Total HH</div>
                  <div className="text-base font-bold text-foreground tabular-nums mt-0.5">{totalHH.toFixed(1)}h</div>
                </div>
                <div className="bg-violet-50 dark:bg-violet-900/20 rounded-lg p-2.5">
                  <div className="text-[10px] font-bold uppercase text-violet-700 dark:text-violet-300 tracking-wider">Crew</div>
                  <div className="text-base font-bold text-foreground tabular-nums mt-0.5">{techs.length || '—'}</div>
                </div>
                <div className="col-span-3 bg-muted/40 rounded-lg p-2.5">
                  <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-1.5">
                    HH por disciplina {ops.length === 0 && <span className="text-amber-600 normal-case font-normal">· estimado (sin ops definidas)</span>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {entries.map(([spec, hh]) => {
                      const tone = specToneLocal(spec);
                      const pct = totalHH > 0 ? Math.round((hh / totalHH) * 100) : 0;
                      return (
                        <span key={spec} className={`text-[11px] font-semibold px-2 py-1 rounded ${tone.bg}`}>
                          {tone.label} <span className="tabular-nums opacity-90">{hh.toFixed(1)}h</span>
                          <span className="text-[9px] opacity-70 ml-1">({pct}%)</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}

          {ops.length > 0 && (
            <div>
              <div className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-1.5">Operaciones · {ops.length}</div>
              <div className="border border-border rounded-lg divide-y divide-border/60">
                {ops.slice(0, 12).map((op, i) => {
                  const opSpec = specToneLocal(op.specialty || op.work_center || order.work_center);
                  const hh = (parseFloat(op.hours) || 0);
                  const qty = parseInt(op.quantity) || 1;
                  return (
                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 text-[12px]">
                      <span className="font-mono text-[10px] text-muted-foreground w-10 shrink-0">{String((i + 1) * 10).padStart(4, '0')}</span>
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded shrink-0 ${opSpec.bg}`}>{opSpec.label}</span>
                      <span className="flex-1 truncate text-foreground">{op.description || op.task || '—'}</span>
                      <span className="text-muted-foreground tabular-nums text-[11px] shrink-0">{hh}h<span className="opacity-60"> × {qty}</span></span>
                    </div>
                  );
                })}
                {ops.length > 12 && <div className="px-3 py-1.5 text-[11px] text-muted-foreground">+{ops.length - 12} más</div>}
              </div>
            </div>
          )}
          {ops.length === 0 && plannedHours > 0 && (
            <div className="border-2 border-dashed border-amber-300 dark:border-amber-700 bg-amber-50/40 dark:bg-amber-900/10 rounded-lg p-3 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
              <span className="text-base">⚠️</span>
              <div className="flex-1">
                <div className="font-semibold">Sin operaciones definidas</div>
                <div className="opacity-80 mt-0.5">El desglose HH/disciplina arriba es estimado a partir de `estimated_hours` y `work_center`. Para ver detalle real, abrí la OT en Work Management y agregá operaciones.</div>
              </div>
            </div>
          )}

          {materials.length > 0 && (
            <div>
              <div className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-1.5">Materiales · {materials.length}</div>
              <div className="border border-border rounded-lg divide-y divide-border/60 text-[12px]">
                {materials.slice(0, 8).map((m, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5">
                    <span className="font-mono text-[10px] text-muted-foreground w-24 shrink-0 truncate">{m.code || m.sap_id || '—'}</span>
                    <span className="flex-1 truncate">{m.description || '—'}</span>
                    <span className="tabular-nums text-muted-foreground">{m.quantity || 0} {m.uom || ''}</span>
                  </div>
                ))}
                {materials.length > 8 && <div className="px-3 py-1.5 text-[11px] text-muted-foreground">+{materials.length - 8} más</div>}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            {isManaged && (
              <button
                onClick={() => { try { window.open(`/work-management?tab=planning&openWo=${woId}`, '_blank'); } catch {} }}
                className="flex-1 py-2.5 border border-border rounded-xl font-semibold text-sm hover:bg-muted flex items-center justify-center gap-2">
                Abrir en Work Management
                <ArrowUpRight size={14} />
              </button>
            )}
            {onClosureClick && status !== 'COMPLETED' && status !== 'CLOSED' && status !== 'CERRADO' && (
              <button onClick={() => onClosureClick(order)} className="flex-1 py-2.5 bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
                <Camera size={16} /> Close with OCR
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailCard({ label, value }) {
  return (
    <div className="bg-muted/50 rounded-lg p-3">
      <div className="text-xs text-muted-foreground font-medium mb-1">{label}</div>
      <div className="text-sm font-semibold text-foreground">{value || '\u2014'}</div>
    </div>
  );
}


/* ───── Technician Inbox Tab ───── */
function TechnicianInbox({ weeks, user, t, onOpenDetail, onOpenClosure }) {
  const myOrders = useMemo(() => {
    const all = [];
    weeks.forEach(w => {
      w.work_orders.forEach(wo => {
        const isAssigned = wo.technicians?.some(tech =>
          tech.toLowerCase().includes(user?.full_name?.toLowerCase() || '') ||
          tech.toLowerCase().includes(user?.username?.toLowerCase() || '')
        );
        if (isAssigned || user?.role === 'tecnico') {
          all.push({ ...wo, week: w.week });
        }
      });
    });
    return all;
  }, [weeks, user]);

  const pending = myOrders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CLOSED');
  const completed = myOrders.filter(o => o.status === 'COMPLETED' || o.status === 'CLOSED');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('scheduling.assigned')}</div>
          <div className="text-2xl font-bold text-foreground mt-1">{myOrders.length}</div>
        </div>
        <div className="bg-card border border-amber-200 dark:border-amber-700 rounded-xl p-4">
          <div className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wide">{t('scheduling.pending')}</div>
          <div className="text-2xl font-bold text-amber-700 dark:text-amber-300 mt-1">{pending.length}</div>
        </div>
        <div className="bg-card border border-emerald-200 dark:border-emerald-700 rounded-xl p-4">
          <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">{t('scheduling.completedCount')}</div>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">{completed.length}</div>
        </div>
      </div>

      {pending.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-amber-50 dark:bg-amber-900/10">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">{t('scheduling.pendingWOs')}</span>
          </div>
          <div className="divide-y divide-border">
            {pending.map(order => {
              const typeMeta = TYPE_META[order.type] || TYPE_META.PM02;
              return (
                <div key={order.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-sm font-bold text-foreground">{order.id}</span>
                        <span className={`text-[0.65rem] font-bold px-1.5 py-0.5 rounded border ${typeMeta.bg}`}>{order.type}</span>
                        <span className={`text-[0.65rem] font-bold px-1.5 py-0.5 rounded border ${PRIORITY_COLOR[order.priority] || PRIORITY_COLOR.P3}`}>{order.priority}</span>
                      </div>
                      <p className="text-sm text-foreground">{order.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{order.equipment} · {order.duration_planned}h · {order.week}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => onOpenDetail(order)} className="p-2 rounded-lg border border-border hover:bg-muted transition-colors" title={t('scheduling.viewDetail')}>
                        <Eye size={14} className="text-muted-foreground" />
                      </button>
                      <button onClick={() => onOpenClosure(order)} className="p-2 rounded-lg bg-[#1B5E20] hover:bg-[#2E7D32] text-white transition-colors" title={t('scheduling.closeWithOCR')}>
                        <Camera size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-emerald-50 dark:bg-emerald-900/10">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">{t('scheduling.completedWOs')}</span>
          </div>
          <div className="divide-y divide-border">
            {completed.map(order => (
              <div key={order.id} className="p-4 opacity-70 hover:opacity-100 transition-opacity cursor-pointer" onClick={() => onOpenDetail(order)}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sm font-bold text-foreground">{order.id}</span>
                  <span className={`text-[0.65rem] font-bold px-1.5 py-0.5 rounded border ${(TYPE_META[order.type] || TYPE_META.PM02).bg}`}>{order.type}</span>
                  <CheckCircle size={14} className="text-emerald-500" />
                  <span className="text-sm text-foreground">{order.description}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{order.duration_actual || order.duration_planned}h</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {myOrders.length === 0 && (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Inbox size={40} className="text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">{t('scheduling.noAssigned')}</p>
        </div>
      )}
    </div>
  );
}

/* ───── Weekly Calendar View (drag-and-drop scheduling grid) ───── */
function WeeklyCalendarView({ technicians, releasedWOs, scheduledWOs, t, onScheduleWO, onUnscheduleWO, onPublish, publishing, canPublish, onOpenDetail, onWeekChange, onRefresh, onAutoLevel, lastWsAt }) {
  const { CAP, PROGRAMMABLE_HH_PER_DAY, HOURS_PER_WEEK } = useCapacitySettings();
  const toast = useToast();
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [viewRange, setViewRange] = useState(1);
  const [viewBy, setViewBy] = useState('technician'); // 'technician' | 'wo'
  const [expandedWOs, setExpandedWOs] = useState(new Set());
  const [search, setSearch] = useState('');
  // Multi-select priority filter (Prometheus style): default P3+P4 on, P1/P2 off
  const [prioFilter, setPrioFilter] = useState({ P1: false, P2: false, P3: true, P4: true });
  // Jorge 2026-04-27 (reunión 18:06): el tablero del programador debe mostrar
  // SOLO OTs en estatus "en programación" — las planificadas todavía no son
  // input válido. Toggle 'inSched' / 'planned' / 'all' para transicionar.
  const [statusFilter, setStatusFilter] = useState('inSched');
  const [filterGroup, setFilterGroup] = useState('all');
  const [sortBy, setSortBy] = useState('priority'); // 'priority' | 'hours_desc' | 'hours_asc' | 'number'
  const [showShifts, setShowShifts] = useState(true);
  const [includeWeekends, setIncludeWeekends] = useState(true);
  const [dragWO, setDragWO] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  // Over-capacity popover anchored to a (workCenterKey, dayIndex) cell in the
  // Capacity by Work Center panel. Surfaces Auto-balance / Dismiss actions.
  const [capacityAlert, setCapacityAlert] = useState(null);

  // Fase 4 Jorge 2026-04-21 — auto-scroll cuando arrastrás cerca del borde
  // de la ventana. Antes, si la OT estaba arriba en la lista y el tablero
  // estaba scrolleado abajo, se perdía la visual y no se podía soltar.
  useEffect(() => {
    if (!dragWO) return;
    let raf = null;
    const EDGE = 80;
    const STEP = 14;
    const onMove = (e) => {
      const y = e.clientY;
      const vh = window.innerHeight;
      const delta = y < EDGE ? -STEP : y > vh - EDGE ? STEP : 0;
      if (!delta) return;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        window.scrollBy({ top: delta, behavior: 'auto' });
        raf = null;
      });
    };
    window.addEventListener('dragover', onMove);
    return () => {
      window.removeEventListener('dragover', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [dragWO]);
  const [hoverWO, setHoverWO] = useState(null);
  const [reserveConfirm, setReserveConfirm] = useState(null); // { drafts, alreadyReserved } | null
  const [reserving, setReserving] = useState(false);
  // SF-562 B3 (2026-04-27): wizard A/B para distribuir saldo HH cuando OT > turno
  // { wo, tech, dayDate, shift, overflow } | null
  const [shiftOverflowWizard, setShiftOverflowWizard] = useState(null);

  const days = useMemo(() => {
    const result = [];
    let d = new Date(weekStart);
    const DAYS_LABELS = includeWeekends ? DAYS_FULL : DAYS_WEEKDAY;
    const numDays = viewRange * (includeWeekends ? 7 : 5);
    for (let i = 0; i < numDays; i++) {
      if (!includeWeekends) {
        while (d.getDay() === 0 || d.getDay() === 6) d = addDays(d, 1);
      }
      const dayIdx = includeWeekends ? ((d.getDay() + 6) % 7) : (d.getDay() - 1);
      result.push({ date: new Date(d), str: toDateStr(d), label: DAYS_LABELS[dayIdx] || DAYS_LABELS[0], dateLabel: fmtDateShort(d), isWeekend: d.getDay() === 0 || d.getDay() === 6 });
      d = addDays(d, 1);
    }
    return result;
  }, [weekStart, viewRange, includeWeekends]);

  // Build assignment grid: "workerId:dateStr[:shift]" -> [wo, ...]
  // Jorge (2026-04-20 tarde): si la OT dura más que un turno, no saltar
  // directo al día siguiente — primero consumir la noche del mismo día.
  // Ej: 15h con turno de 12h → 12h día + 3h noche (mismo día).
  const grid = useMemo(() => {
    const g = {};
    const daySet = new Set(days.map(d => d.str));
    const shiftHours = Math.max(1, CAP.effectiveHours || PROGRAMMABLE_HH_PER_DAY);
    scheduledWOs.forEach(wo => {
      const startDate = wo.planned_start ? new Date(wo.planned_start) : null;
      if (!startDate) return;
      const startShift = (wo.shift || 'day').toLowerCase();
      const hours = wo.estimated_hours || 0;
      // Generate sequential (day, shift) slots — starting at the WO's shift
      // and flipping day↔night on the same date before advancing a day.
      const slots = [];
      if (showShifts) {
        const need = Math.max(1, Math.ceil(hours / shiftHours));
        let curDate = new Date(startDate);
        let curShift = startShift === 'night' ? 'night' : 'day';
        for (let i = 0; i < need; i++) {
          slots.push({ date: new Date(curDate), shift: curShift });
          // flip shift; if wrapping day→night→day, advance a day
          if (curShift === 'day') curShift = 'night';
          else { curShift = 'day'; curDate = addDays(curDate, 1); }
        }
      } else {
        const need = Math.max(1, Math.ceil(hours / PROGRAMMABLE_HH_PER_DAY));
        for (let i = 0; i < need; i++) slots.push({ date: addDays(startDate, i), shift: startShift });
      }
      (wo.assigned_workers || []).forEach(w => {
        slots.forEach((slot, idx) => {
          const dayStr = toDateStr(slot.date);
          if (!daySet.has(dayStr)) return;
          const key = showShifts ? `${w.worker_id}:${dayStr}:${slot.shift}` : `${w.worker_id}:${dayStr}`;
          if (!g[key]) g[key] = [];
          if (idx === 0) g[key].push(wo);
          else g[key].push({ ...wo, _continuation: true, _dayNum: idx + 1, _totalDays: slots.length });
        });
      });
    });
    return g;
  }, [scheduledWOs, showShifts, days, CAP.effectiveHours, PROGRAMMABLE_HH_PER_DAY]);

  // Per-technician total hours in view
  const techHours = useMemo(() => {
    const h = {};
    technicians.forEach(tech => { h[tech.worker_id] = 0; });
    const daySet = new Set(days.map(d => d.str));
    scheduledWOs.forEach(wo => {
      const start = wo.planned_start ? toDateStr(new Date(wo.planned_start)) : null;
      if (!start || !daySet.has(start)) return;
      // Jorge 2026-04-27 fix: paralelo team — wo.estimated_hours es HH-total,
      // no calendar hours. Si hay N trabajadores asignados, cada uno absorbe
      // HH/N (división justa), capped al weekly cap del tech (no podés mostrar
      // 99h en una semana, no es físicamente posible).
      const workers = (wo.assigned_workers || []).filter(w => w && (w.worker_id || w.user_id || w.id));
      const N = workers.length || 1;
      const perWorker = (wo.estimated_hours || 0) / N;
      const seen = new Set();
      workers.forEach(w => {
        const wid = w.worker_id || w.user_id || w.id;
        if (!wid || seen.has(wid)) return;
        seen.add(wid);
        if (h[wid] !== undefined) {
          // Cap individual al weekly max — visual no debe mostrar imposible.
          h[wid] = Math.min((h[wid] || 0) + perWorker, h[wid] + (HOURS_PER_WEEK || 40));
        }
      });
    });
    return h;
  }, [technicians, scheduledWOs, days, HOURS_PER_WEEK]);

  const daysInView = includeWeekends ? 7 : 5;
  const hoursPerWeek = technicians.length > 0 ? PROGRAMMABLE_HH_PER_DAY * daysInView : daysInView * 8;
  const totalAvailable = technicians.length * hoursPerWeek * viewRange;
  const totalAssigned = Object.values(techHours).reduce((a, b) => a + b, 0);
  const loadPct = totalAvailable > 0 ? Math.round((totalAssigned / totalAvailable) * 100) : 0;

  // Daily totals
  const dailyTotals = useMemo(() => {
    const totals = {};
    days.forEach(d => { totals[d.str] = 0; });
    const dayStrs = days.map(d => d.str);
    const dailyCap = PROGRAMMABLE_HH_PER_DAY; // per-tech daily cap (for spreading long WOs)
    scheduledWOs.forEach(wo => {
      const start = wo.planned_start ? toDateStr(new Date(wo.planned_start)) : null;
      const woHours = wo.estimated_hours || 0;
      if (!start || totals[start] === undefined || woHours === 0) return;
      const idx = dayStrs.indexOf(start);
      if (idx < 0) return;
      // Long WOs spread across days (visual "continuation")
      if (woHours > dailyCap) {
        let remaining = woHours;
        for (let d = idx; d < dayStrs.length && remaining > 0; d++) {
          const chunk = Math.min(remaining, dailyCap);
          totals[dayStrs[d]] = (totals[dayStrs[d]] || 0) + chunk;
          remaining -= chunk;
        }
      } else {
        totals[start] += woHours;
      }
    });
    return totals;
  }, [scheduledWOs, days]);

  // Groups available in the current WO list (for the filter dropdown)
  const availableGroups = useMemo(() => {
    const set = new Set();
    releasedWOs.forEach(wo => { if (wo.planning_group) set.add(wo.planning_group); });
    return Array.from(set).sort();
  }, [releasedWOs]);

  const filteredReleased = useMemo(() => {
    // Jorge (2026-04-20): en el tablero sólo deben aparecer OTs programables.
    // Una OT en CREADO/DRAFT todavía no fue liberada — no puede entrar a
    // la grilla de programación.
    let list = releasedWOs.filter(wo => {
      const s = (wo.status || '').toUpperCase();
      return s !== 'CREADO' && s !== 'DRAFT' && s !== 'PENDIENTE';
    });
    // Jorge 2026-04-21: el tablero muestra SOLO PM01 y PM02 (programables).
    // Las PM03 son fallas correctivas — van directo al supervisor, bypass planning.
    list = list.filter(wo => {
      const t = (wo.wo_type || '').toUpperCase();
      if (t === 'PM03') return false;
      const p = (wo.priority_code || '').toUpperCase();
      if (p === 'P1' || p === 'P2') return false;
      return true;
    });
    // Status filter Jorge 2026-04-27 — programador trabaja solo con EN_PROGRAMACION.
    if (statusFilter === 'inSched') {
      list = list.filter(wo => (wo.status || '').toUpperCase() === 'EN_PROGRAMACION');
    } else if (statusFilter === 'planned') {
      const planned = new Set(['PLANIFICADO', 'LIBERADO', 'CREADO']);
      list = list.filter(wo => planned.has((wo.status || '').toUpperCase()));
    }
    // Priority filter — multi-select (solo P3/P4 ya que P1/P2 no entran al tablero)
    const activePrios = Object.entries(prioFilter).filter(([, v]) => v).map(([k]) => k);
    if (activePrios.length > 0 && activePrios.length < 4) {
      list = list.filter(wo => activePrios.includes(wo.priority_code));
    }
    // Planning group filter
    if (filterGroup !== 'all') list = list.filter(wo => wo.planning_group === filterGroup);
    // Search
    if (search) {
      const q = search.toLowerCase().replace(/[\s\-]+/g, '');
      list = list.filter(wo =>
        (wo.wo_number || '').toLowerCase().replace(/[\s\-]+/g, '').includes(q) ||
        (wo.equipment_tag || '').toLowerCase().includes(search.toLowerCase()) ||
        (wo.description || '').toLowerCase().includes(search.toLowerCase())
      );
    }
    // Sort
    const order = { P1: 0, P2: 1, P3: 2, P4: 3 };
    if (sortBy === 'priority') list.sort((a, b) => (order[a.priority_code] ?? 9) - (order[b.priority_code] ?? 9));
    else if (sortBy === 'hours_desc') list.sort((a, b) => (parseFloat(b.estimated_hours) || 0) - (parseFloat(a.estimated_hours) || 0));
    else if (sortBy === 'hours_asc') list.sort((a, b) => (parseFloat(a.estimated_hours) || 0) - (parseFloat(b.estimated_hours) || 0));
    else if (sortBy === 'number') list.sort((a, b) => (a.wo_number || '').localeCompare(b.wo_number || ''));
    else if (sortBy === 'recent') list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    else if (sortBy === 'oldest') list.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
    return list;
  }, [releasedWOs, search, prioFilter, filterGroup, sortBy, statusFilter]);

  const weekEnd = days[days.length - 1]?.date || weekStart;
  const weekNum = getISOWeek(weekStart);
  const weekLabel = `Week ${weekNum} · ${fmtDateShort(weekStart)}\u2013${fmtDateShort(weekEnd)}, ${weekStart.getFullYear()}`;

  const handleDragStart = (wo) => setDragWO(wo);
  const handleDragEnd = () => { setDragWO(null); setDropTarget(null); };
  const handleDrop = (e, tech, day) => {
    e.preventDefault();
    if (dragWO) onScheduleWO(dragWO, tech, day.date, 'day');
    setDragWO(null);
    setDropTarget(null);
  };

  // ─── Capacity by Work Center (inline helper) ───────────────────────────
  // Jorge (2026-04-20): idea del prototipo de Ayudas/Diseño aplicada al
  // Weekly Schedule existente. Semáforo HH/día por puesto de trabajo.
  const capacityByWC = useMemo(() => {
    const groups = {};
    for (const t of technicians) {
      const spec = (t.specialty || 'OTRO').toUpperCase();
      if (!groups[spec]) groups[spec] = { key: spec, techIds: new Set(), count: 0 };
      if (t.worker_id && !groups[spec].techIds.has(t.worker_id)) {
        groups[spec].techIds.add(t.worker_id);
        groups[spec].count += 1;
      }
    }
    return Object.values(groups).map(g => {
      // Jorge 2026-04-21: nominal = personas × horas efectivas × %programable.
      // Sumando ambos turnos (día + noche). Factor productividad NO entra acá.
      const nominalPerShift = g.count * CAP.effectiveHours * (CAP.schedulingPct / 100);
      const dayTechs = CAP.dayShiftCount != null ? Number(CAP.dayShiftCount) : g.count;
      const nightTechs = CAP.nightShiftCount != null ? Number(CAP.nightShiftCount) : 0;
      const nominalPerDay = (dayTechs + nightTechs) * CAP.effectiveHours * (CAP.schedulingPct / 100);
      const perDay = days.map(d => {
        let hh = 0;
        for (const key in grid) {
          if (!key.startsWith('')) continue;
          const parts = key.split(':');
          const workerId = parts[0];
          const dayStr = parts[1];
          if (dayStr !== d.str) continue;
          if (!g.techIds.has(workerId)) continue;
          const list = grid[key] || [];
          for (const w of list) {
            if (w._continuation) continue;
            const spanDays = Math.max(1, Math.ceil((w.estimated_hours || 0) / Math.max(1, PROGRAMMABLE_HH_PER_DAY)));
            const crewSize = Math.max(1, (w.assigned_workers || []).length || 1);
            // Jorge 2026-04-27 (reunión 18:06): distribuir HH por disciplina según
            // op.specialty. Antes, una OT 16h con 8h mec + 8h elec contaba 16h
            // íntegros al grupo del técnico (MECANICO). Ahora sólo se atribuye
            // a g.key la fracción de operaciones que coinciden con esta especialidad.
            const ops = Array.isArray(w.operations) ? w.operations : [];
            let attributable;
            if (ops.length > 0) {
              let specHH = 0, totalOpHH = 0;
              for (const op of ops) {
                const opSpec = (op.specialty || op.work_center || w.work_center || '').toUpperCase();
                const opHH = (parseFloat(op.hours) || 0) * (parseInt(op.quantity) || 1);
                totalOpHH += opHH;
                const matchSpec = opSpec === g.key
                  || (opSpec.length >= 3 && g.key.startsWith(opSpec.slice(0, 3)))
                  || (g.key.length >= 3 && opSpec.startsWith(g.key.slice(0, 3)));
                if (matchSpec) specHH += opHH;
              }
              attributable = totalOpHH > 0
                ? (specHH / totalOpHH) * (w.estimated_hours || totalOpHH)
                : (w.estimated_hours || 0);
            } else {
              attributable = (w.estimated_hours || 0);
            }
            hh += attributable / spanDays / crewSize;
          }
        }
        return Math.round(hh);
      });
      return { ...g, techIds: [...g.techIds], nominalPerDay: Math.max(1, Math.round(nominalPerDay)), perDay };
    }).sort((a, b) => b.count - a.count);
  }, [technicians, grid, days, CAP, PROGRAMMABLE_HH_PER_DAY]);

  const SPEC_ACCENT = {
    MECANICO: 'bg-emerald-100 text-emerald-700',
    ELECTRICO: 'bg-amber-100 text-amber-700',
    INSTRUMENTACION: 'bg-sky-100 text-sky-700',
    SOLDADOR: 'bg-rose-100 text-rose-700',
    LUB: 'bg-indigo-100 text-indigo-700',
  };
  const SPEC_LABEL = {
    MECANICO: 'Mechanical',
    ELECTRICO: 'Electrical',
    INSTRUMENTACION: 'Instrumentation',
    SOLDADOR: 'Welder',
    LUB: 'Lubrication',
  };

  // Materials readiness from real scheduled WOs
  const materialsRows = useMemo(() => {
    return scheduledWOs.slice(0, 20).map(wo => {
      const mats = wo.materials || [];
      const resCodes = Array.isArray(wo.reservation_codes) && wo.reservation_codes.length
        ? wo.reservation_codes
        : (wo.reservation_code ? [wo.reservation_code] : []);
      let status = 'blocked';
      if (mats.length === 0 && resCodes.length === 0) status = 'partial';
      else if (resCodes.length > 0) status = 'ready';
      else if (mats.length > 0) status = 'partial';
      return {
        wo_id: wo.wo_id,
        wo_number: wo.wo_number,
        equipment_tag: wo.equipment_tag,
        status,
        reservations: resCodes,
        items_count: mats.length,
      };
    });
  }, [scheduledWOs]);

  const [showMaterialsRail, setShowMaterialsRail] = useState(false);
  const [expandedWCs, setExpandedWCs] = useState({}); // click → show tech names per work center
  const [capacityCollapsed, setCapacityCollapsed] = useState(false); // Fase 4 Jorge 2026-04-21

  return (
    <div className="flex gap-4" style={{ minHeight: 500 }}>
      {/* ── Left Panel: OTs to Schedule — sticky al scrollear (Jorge 2026-04-21) ── */}
      <div className="w-72 min-w-[288px] flex flex-col sticky top-4 self-start"
        style={{ maxHeight: 'calc(100vh - 40px)' }}>
        <div
          className={`bg-card border rounded-xl overflow-hidden flex flex-col transition-all ${dragWO && (dragWO.status === 'PROGRAMADO' || dragWO.planned_start) ? 'border-red-400 border-2 ring-2 ring-red-200 dark:ring-red-900/30 bg-red-50/30 dark:bg-red-900/10' : 'border-border'}`}
          style={{ maxHeight: 'calc(100vh - 300px)' }}
          onDragOver={e => {
            if (dragWO && (dragWO.status === 'PROGRAMADO' || dragWO.planned_start)) {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
            }
          }}
          onDrop={e => {
            e.preventDefault();
            if (dragWO && (dragWO.status === 'PROGRAMADO' || dragWO.planned_start)) {
              onUnscheduleWO?.(dragWO);
            }
            setDragWO(null);
            setDropTarget(null);
          }}>
          <div className="px-3 py-3 border-b border-border space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-sm">OTs a Programar</h3>
              <span className="text-xs font-bold bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                {filteredReleased.length}{filteredReleased.length !== releasedWOs.length ? ` / ${releasedWOs.length}` : ''}
              </span>
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar OT, equipo, descripción…"
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30" />
            </div>
            {/* Priority chips — multi-select (like Prometheus) */}
            <div className="flex items-center gap-1 text-[10px] font-semibold">
              <span className="text-muted-foreground mr-0.5">Prio:</span>
              {/* Jorge 2026-04-21: solo P3/P4 son programables. P1/P2 son fallas
                  correctivas y van directo al supervisor, no al tablero. */}
              {[
                { id: 'P3', color: 'bg-blue-500 text-white border-blue-600' },
                { id: 'P4', color: 'bg-gray-400 text-white border-gray-500' },
              ].map(p => (
                <button key={p.id}
                  onClick={() => setPrioFilter(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
                  className={`px-2 py-0.5 rounded border transition-all ${prioFilter[p.id] ? p.color + ' shadow-sm' : 'border-border text-muted-foreground hover:bg-muted'}`}
                  title={prioFilter[p.id] ? `Ocultar ${p.id}` : `Mostrar ${p.id}`}>
                  {p.id}
                </button>
              ))}
              <button onClick={() => setPrioFilter({ P1: true, P2: true, P3: true, P4: true })}
                className="ml-1 text-[9px] text-muted-foreground hover:text-foreground underline" title="Mostrar todas">
                todas
              </button>
            </div>
            {/* Jorge 2026-04-27: status filter — programador trabaja con EN_PROGRAMACION */}
            <div className="flex items-center gap-1 text-[10px] font-semibold">
              <span className="text-muted-foreground mr-0.5">Estatus:</span>
              {[
                { id: 'inSched', label: 'En programación', color: 'bg-emerald-600 text-white border-emerald-700' },
                { id: 'planned', label: 'Planificadas', color: 'bg-blue-500 text-white border-blue-600' },
                { id: 'all', label: 'Todas', color: 'bg-gray-500 text-white border-gray-600' },
              ].map(s => (
                <button key={s.id}
                  onClick={() => setStatusFilter(s.id)}
                  className={`px-2 py-0.5 rounded border transition-all ${statusFilter === s.id ? s.color + ' shadow-sm' : 'border-border text-muted-foreground hover:bg-muted'}`}
                  title={s.label}>
                  {s.label}
                </button>
              ))}
            </div>
            {/* Group + Sort */}
            <div className="grid grid-cols-2 gap-1">
              <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)}
                className="text-xs border border-border rounded-md px-1.5 py-1 bg-background" title="Filtrar por grupo de planificación">
                <option value="all">Todos los grupos</option>
                {availableGroups.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="text-xs border border-border rounded-md px-1.5 py-1 bg-background" title="Ordenar por">
                <option value="priority">Por prioridad</option>
                <option value="recent">Más recientes</option>
                <option value="oldest">Más antiguas</option>
                <option value="hours_desc">Más HH primero</option>
                <option value="hours_asc">Menos HH primero</option>
                <option value="number">Por número OT</option>
              </select>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {dragWO && (dragWO.status === 'PROGRAMADO' || dragWO.planned_start) && (
              <div className="p-4 text-center bg-red-50 dark:bg-red-900/10 border-b border-red-200 text-red-700 text-xs font-semibold">
                🗑️ Suelta aquí para desprogramar {dragWO.wo_number}
              </div>
            )}
            {filteredReleased.map(wo => {
              const typeMeta = TYPE_META[wo.wo_type] || TYPE_META.PM02;
              // Jorge (2026-04-20 tarde): card flotante al hover (no title HTML)
              // con título cabecera + HH + resumen para decidir sin abrir.
              return (
                <div key={wo.wo_id} draggable
                  onDragStart={e => { e.stopPropagation(); if (e.dataTransfer) e.dataTransfer.setData('text/plain', wo.wo_id); handleDragStart(wo); }}
                  onDragEnd={handleDragEnd}
                  onMouseEnter={() => setHoverWO(wo)}
                  onMouseLeave={() => setHoverWO(null)}
                  onClick={() => onOpenDetail && onOpenDetail(wo)}
                  style={{ contentVisibility: 'auto', containIntrinsicSize: '0 80px' }}
                  title="Click para ver detalle · Arrastrar para programar"
                  className="relative p-3 hover:bg-muted/50 cursor-pointer active:cursor-grabbing transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[0.6rem] font-bold px-1.5 py-0.5 rounded text-white ${wo.priority_code === 'P1' ? 'bg-red-500' : wo.priority_code === 'P2' ? 'bg-orange-500' : wo.priority_code === 'P3' ? 'bg-blue-500' : 'bg-gray-400'}`}>
                      {wo.priority_code || 'P4'}
                    </span>
                    <span className="font-mono text-xs font-bold text-foreground">{wo.wo_number}</span>
                    <span className={`text-[0.6rem] font-bold px-1.5 py-0.5 rounded border ${typeMeta.bg}`}>{wo.wo_type}</span>
                    {/* Jorge 2026-04-27: pasar PLANIFICADO/LIBERADO/CREADO → EN_PROGRAMACION */}
                    {['PLANIFICADO', 'LIBERADO', 'CREADO'].includes((wo.status || '').toUpperCase()) && (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await api.updateManagedWO(wo.wo_id, { status: 'EN_PROGRAMACION' });
                            // Bug Jorge 2026-04-28: la OT desaparecía del filtro
                            // "Planificadas" después del cambio y parecía que el botón
                            // no hacía nada. Auto-switch al filtro donde ahora está
                            // la OT + retry de refresh para asegurar que se ve.
                            setStatusFilter('inSched');
                            toast.success(`${wo.wo_number} → en programación · ahora visible en pestaña "En programación"`, 6000);
                            onRefresh?.();
                            setTimeout(() => onRefresh?.(), 1500);
                          } catch (err) {
                            toast.error(`Error cambiando estatus: ${err?.message || 'desconocido'}`, 8000);
                          }
                        }}
                        title="Pasar a programación"
                        className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white hover:bg-emerald-700">
                        →prog
                      </button>
                    )}
                  </div>
                  {/* Título de cabecera visible siempre (no solo tag/descripción corta) */}
                  <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">{wo.description || wo.equipment_tag || '—'}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground font-mono">{wo.equipment_tag || ''}</span>
                    <span className="text-xs font-semibold text-foreground tabular-nums">{wo.estimated_hours || 0} HH</span>
                  </div>
                  {/* Floating hover card — muestra todo el contexto sin abrir modal */}
                  {hoverWO?.wo_id === wo.wo_id && (
                    <div className="absolute z-30 left-full top-0 ml-2 w-72 bg-white dark:bg-card border-2 border-emerald-500 rounded-xl shadow-xl p-3 pointer-events-none">
                      <div className="flex items-center gap-2 mb-2 border-b border-border pb-2">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-white ${wo.priority_code === 'P1' ? 'bg-red-500' : wo.priority_code === 'P2' ? 'bg-orange-500' : wo.priority_code === 'P3' ? 'bg-blue-500' : 'bg-gray-400'}`}>{wo.priority_code || 'P4'}</span>
                        <span className="font-mono text-xs font-bold text-foreground">{wo.wo_number}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${typeMeta.bg}`}>{wo.wo_type}</span>
                      </div>
                      <div className="text-sm font-semibold text-foreground leading-snug mb-2">{wo.description || '—'}</div>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        {wo.equipment_tag && (<><div className="text-muted-foreground">Equipo</div><div className="text-foreground font-mono text-right truncate">{wo.equipment_tag}</div></>)}
                        {wo.estimated_hours != null && (<><div className="text-muted-foreground">HH estimados</div><div className="text-foreground font-semibold tabular-nums text-right">{wo.estimated_hours}</div></>)}
                        {wo.planning_group && (<><div className="text-muted-foreground">Grupo</div><div className="text-foreground text-right">{wo.planning_group}</div></>)}
                        {wo.work_center && (<><div className="text-muted-foreground">Puesto trabajo</div><div className="text-foreground text-right">{wo.work_center}</div></>)}
                        {wo.sla_deadline && (<><div className="text-muted-foreground">SLA</div><div className="text-foreground text-right">{new Date(wo.sla_deadline).toLocaleDateString()}</div></>)}
                      </div>
                      {Array.isArray(wo.operations) && wo.operations.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-border text-[10.5px] text-muted-foreground">
                          <span className="font-semibold text-foreground">{wo.operations.length}</span> operaciones planificadas
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {filteredReleased.length === 0 && (
              <div className="p-6 text-center">
                <Inbox size={24} className="text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">{releasedWOs.length === 0 ? 'No OTs to schedule' : 'No results'}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Calendar Area ── */}
      <div className="flex-1 space-y-3 min-w-0">
        {/* Draft banner */}
        <div className="bg-amber-100 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 text-sm font-medium px-4 py-2 rounded-lg">
          Draft — not visible to technicians yet
        </div>

        {/* Capacity by Work Center — Jorge 2026-04-20.
            Jorge 2026-04-21: sacado el sticky porque se peleaba con el thead
            de la grilla de técnicos al scrollear. El usuario ya tiene el
            panel izquierdo sticky + thead de la grilla sticky, suficiente. */}
        {capacityByWC.length > 0 && (
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm"
            style={{ maxHeight: capacityCollapsed ? '48px' : 'none', overflowY: capacityCollapsed ? 'hidden' : 'visible' }}>
            <div className="px-4 pt-3 pb-2 flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[13px] font-bold text-foreground tracking-tight">Capacity by Work Center</h3>
                  <button onClick={() => setCapacityCollapsed(c => !c)}
                    className="p-0.5 rounded hover:bg-muted text-muted-foreground"
                    title={capacityCollapsed ? 'Expandir' : 'Colapsar'}>
                    {capacityCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                  </button>
                </div>
                {!capacityCollapsed && <p className="text-[11px] text-muted-foreground mt-0.5">Consumed HH vs nominal per day · derived from roster × effective shift length</p>}
              </div>
              {!capacityCollapsed && (
                <div className="flex items-center gap-3 text-[10.5px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> &lt; 80%</span>
                  <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> 80–100%</span>
                  <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> &gt; 100%</span>
                </div>
              )}
            </div>
            {!capacityCollapsed && (<>
            <div className="grid border-t border-border" style={{ gridTemplateColumns: `180px repeat(${days.length}, minmax(72px, 1fr))` }}>
              <div className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Work Center</div>
              {days.map(d => (
                <div key={d.str} className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-baseline gap-1.5 border-l border-border/60">
                  <span className="text-foreground">{d.label.slice(0,3)}</span>
                  <span className="text-muted-foreground/70 normal-case font-medium">{d.dateLabel}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border">
              {capacityByWC.map(wc => {
                const accent = SPEC_ACCENT[wc.key] || 'bg-slate-100 text-slate-700';
                const label = SPEC_LABEL[wc.key] || wc.key;
                const isExp = !!expandedWCs[wc.key];
                const wcTechs = technicians.filter(t => (t.specialty || 'OTRO').toUpperCase() === wc.key);
                return (
                <React.Fragment key={wc.key}>
                  <div className="grid border-b border-border/60 last:border-b-0 hover:bg-muted/30 cursor-pointer"
                    onClick={() => setExpandedWCs(s => ({ ...s, [wc.key]: !s[wc.key] }))}
                    style={{ gridTemplateColumns: `180px repeat(${days.length}, minmax(72px, 1fr))` }}>
                    <div className="px-3 py-2 flex items-center gap-2">
                      {isExp ? <ChevronDown size={12} className="text-muted-foreground" /> : <ChevronRight size={12} className="text-muted-foreground" />}
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${accent}`}>{wc.key.slice(0,4)}</span>
                      <div className="leading-tight min-w-0">
                        <div className="text-[11.5px] font-semibold text-foreground truncate">{label}</div>
                        <div className="text-[10px] text-muted-foreground">{wc.count} techs · nom {wc.nominalPerDay} HH/d</div>
                      </div>
                    </div>
                    {wc.perDay.map((hh, i) => {
                      const pct = Math.round((hh / wc.nominalPerDay) * 100);
                      const tone = pct > 100 ? 'red' : pct >= 80 ? 'amber' : 'green';
                      const fill = tone === 'red' ? 'bg-rose-500' : tone === 'amber' ? 'bg-amber-500' : 'bg-emerald-500';
                      const bg = tone === 'red' ? 'bg-rose-100' : tone === 'amber' ? 'bg-amber-100' : 'bg-emerald-100';
                      const textC = tone === 'red' ? 'text-rose-700' : tone === 'amber' ? 'text-amber-700' : 'text-emerald-700';
                      const over = pct > 100;
                      const isOpen = capacityAlert && capacityAlert.wc === wc.key && capacityAlert.idx === i;
                      return (
                        <div key={i}
                          onClick={e => { if (!over) return; e.stopPropagation(); setCapacityAlert(isOpen ? null : { wc: wc.key, idx: i, pct, hh, nominal: wc.nominalPerDay, day: days[i]?.label || '' }); }}
                          className={`relative px-2 py-2 border-l border-border/40 transition-colors ${over ? 'cursor-pointer hover:bg-rose-50/40' : ''} ${isOpen ? 'bg-rose-50/60 ring-1 ring-rose-300' : ''}`}>
                          <div className="flex items-baseline justify-between">
                            <span className={`text-[10.5px] font-semibold tabular-nums ${textC} ${over ? 'animate-pulse' : ''}`}>{pct}%</span>
                            <span className="text-[10px] tabular-nums text-muted-foreground">{hh}/{wc.nominalPerDay}</span>
                          </div>
                          <div className={`mt-1 h-1.5 w-full rounded-full ${bg} overflow-hidden`}>
                            <div className={`h-full ${fill} rounded-full transition-all duration-300`} style={{ width: `${Math.min(pct, 100)}%` }} />
                          </div>
                          {isOpen && (
                            <div className="absolute z-30 top-full left-1/2 mt-2 w-[260px] origin-top"
                              style={{ animation: 'fadeInUp 180ms ease-out both' }}
                              onClick={e => e.stopPropagation()}>
                              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-white dark:bg-card border-l border-t border-rose-200" />
                              <div className="relative bg-white dark:bg-card border border-rose-200 dark:border-rose-800 rounded-xl shadow-xl p-3">
                                <div className="flex items-start gap-2 mb-2">
                                  <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-[12px] font-bold text-foreground">Over capacity — {pct}%</div>
                                    <div className="text-[10.5px] text-muted-foreground mt-0.5 leading-snug">
                                      Redistribute {Math.max(0, hh - wc.nominalPerDay)} HH, or extend shift. {wc.key.slice(0,4)} on {days[i]?.label || '—'}.
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-2 mt-2">
                                  <button
                                    onClick={() => { setCapacityAlert(null); if (onAutoLevel) onAutoLevel(); }}
                                    className="flex-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white transition-colors">
                                    Auto-balance
                                  </button>
                                  <button
                                    onClick={() => setCapacityAlert(null)}
                                    className="text-[11px] font-medium px-2.5 py-1.5 rounded-md border border-border hover:bg-muted transition-colors">
                                    Dismiss
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {/* Expandible — Jorge 2026-04-20 tarde: click en el puesto
                      despliega los nombres de técnicos que pertenecen. */}
                  {isExp && (
                    <div className="bg-muted/20 border-b border-border/40 px-6 py-2">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                        Técnicos ({wcTechs.length})
                      </div>
                      {wcTechs.length === 0 ? (
                        <div className="text-[11px] text-muted-foreground italic">Sin técnicos registrados en este puesto</div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {wcTechs.map(t => (
                            <span key={t.worker_id} className="inline-flex items-center gap-1 bg-white dark:bg-card border border-border rounded-md px-1.5 py-0.5 text-[10.5px]">
                              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[9px] font-bold flex items-center justify-center">
                                {(t.name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                              </span>
                              <span className="font-medium text-foreground">{t.name || t.worker_id}</span>
                              <span className="text-[9px] font-mono text-muted-foreground">{t.shift || ''}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </React.Fragment>
                );
              })}
            </div>
            </>)}
          </div>
        )}

        {/* Week navigator + controls */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button onClick={() => { const nw = addDays(weekStart, -7); setWeekStart(nw); onWeekChange?.(nw); }} className="p-1.5 rounded-lg border border-border hover:bg-muted transition-colors">
              <ChevronLeft size={16} className="text-muted-foreground" />
            </button>
            <span className="text-sm font-semibold text-foreground min-w-[250px] text-center">{weekLabel}</span>
            <button onClick={() => { const nw = addDays(weekStart, 7); setWeekStart(nw); onWeekChange?.(nw); }} className="p-1.5 rounded-lg border border-border hover:bg-muted transition-colors">
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
            <LiveIndicator lastWsAt={lastWsAt} />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button onClick={() => setViewBy('technician')}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${viewBy === 'technician' ? 'bg-emerald-600 text-white' : 'bg-card text-foreground hover:bg-muted'}`}>
                👷 Technicians
              </button>
              {/* Jorge (2026-04-20): vista por Puesto de Trabajo estilo Prometheus
                  — agrupa técnicos por especialidad (Mecánico/Eléctrico/Instr/...) */}
              <button onClick={() => setViewBy('resource')}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${viewBy === 'resource' ? 'bg-emerald-600 text-white' : 'bg-card text-foreground hover:bg-muted'}`}>
                🧰 Recursos
              </button>
              <button onClick={() => setViewBy('wo')}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${viewBy === 'wo' ? 'bg-emerald-600 text-white' : 'bg-card text-foreground hover:bg-muted'}`}>
                🔧 Work Orders
              </button>
            </div>
            <button onClick={() => setShowShifts(s => !s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${showShifts ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-card text-foreground border-border hover:bg-muted'}`}>
              {showShifts ? '☀️🌙 Shifts' : '📅 No Shifts'}
            </button>
            <button onClick={() => setIncludeWeekends(w => !w)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${includeWeekends ? 'bg-purple-600 text-white border-purple-600' : 'bg-card text-foreground border-border hover:bg-muted'}`}>
              {includeWeekends ? '7 Days' : '5 Days'}
            </button>
            {/* Jorge 2026-04-27: agregado 4 Weeks (mes completo) — programador
                programa typically 2 semanas adelante, pero quiere ver 1 mes. */}
            {[{ v: 1, l: 'Week' }, { v: 2, l: '2 Weeks' }, { v: 3, l: '3 Weeks' }, { v: 4, l: 'Mes' }].map(opt => (
              <button key={opt.v} onClick={() => setViewRange(opt.v)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${viewRange === opt.v ? 'bg-[#1B5E20] text-white border-[#1B5E20]' : 'bg-card text-foreground border-border hover:bg-muted'}`}>
                {opt.l}
              </button>
            ))}
            <button onClick={async () => {
                const plantId = localStorage.getItem('selected_plant') || 'OCP-JFC1';
                if (!confirm('¿Mover a REPROGRAMADO todas las OTs PROGRAMADO/EN_EJECUCION con planned_end vencido?')) return;
                try {
                  const r = await api.rescheduleStale(plantId);
                  toast.success(`↻ ${r.rescheduled} OTs movidas a REPROGRAMADO`);
                  onRefresh?.();
                } catch (e) {
                  toast.error('Error: ' + (e.message || e));
                }
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 text-amber-900 dark:text-amber-200 rounded-lg text-xs font-semibold transition-colors"
              title="Mueve a REPROGRAMADO las OTs PROGRAMADO/EN_EJECUCION cuyo planned_end ya pasó">
              <RotateCcw size={14} /> Reprogramar vencidas
            </button>
            <button onClick={async () => {
                // Step 2 of 2-step flow: open styled confirmation modal
                const weekMon = weekStart;
                const weekSunStr = toDateStr(addDays(weekMon, 6));
                const weekMonStr = toDateStr(weekMon);
                const inWeek = (wo) => {
                  const s = wo.planned_start ? toDateStr(new Date(wo.planned_start)) : null;
                  return s && s >= weekMonStr && s <= weekSunStr;
                };
                const drafts = scheduledWOs.filter(wo => wo.status === 'EN_PROGRAMACION' && inWeek(wo));
                const alreadyReserved = scheduledWOs.filter(wo => wo.status === 'PROGRAMADO' && inWeek(wo)).length;
                if (drafts.length === 0) {
                  toast.info(alreadyReserved > 0
                    ? `✓ Semana ya reservada · ${alreadyReserved} OTs en PROGRAMADO`
                    : 'No hay OTs en esta semana para reservar');
                  return;
                }
                // B3-7 Jorge 2026-04-27: bloqueo duro >100% al reservar la semana.
                // Antes el gate sólo aplicaba al drag de nuevas OTs; al reservar en
                // bulk podía dejar técnicos sobre capacidad. Ahora si algún técnico
                // queda >HOURS_PER_WEEK, abortamos la reserva y listamos los conflictos.
                const techLoad = {};
                drafts.forEach(wo => {
                  const ws = Array.isArray(wo.assigned_workers) ? wo.assigned_workers : [];
                  if (ws.length === 0) return;
                  const perWorker = (parseFloat(wo.estimated_hours) || 0) / ws.length;
                  ws.forEach(w => {
                    const id = w.worker_id || w.id;
                    if (!id) return;
                    techLoad[id] = (techLoad[id] || 0) + perWorker;
                  });
                });
                const overloaded = Object.entries(techLoad)
                  .filter(([, h]) => h > HOURS_PER_WEEK)
                  .map(([id, h]) => {
                    const tech = technicians.find(t => (t.worker_id || t.id) === id);
                    return { name: tech?.name || id, h: Math.round(h) };
                  });
                if (overloaded.length > 0) {
                  const list = overloaded.slice(0, 3).map(o => `${o.name} (${o.h}h)`).join(', ');
                  const more = overloaded.length > 3 ? ` y ${overloaded.length - 3} más` : '';
                  toast.error(
                    `⛔ No se puede reservar: ${overloaded.length} técnico(s) sobre capacidad ${Math.round(HOURS_PER_WEEK)}h — ${list}${more}. Saca tareas o redistribuí antes.`,
                    9000
                  );
                  return;
                }
                setReserveConfirm({ drafts, alreadyReserved });
              }}
              className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
              title="Bloquea las OTs programadas esta semana como PROGRAMADO y reserva sus HH">
              <Lock size={14} /> Reservar Semana
            </button>
            {canPublish && (
              <button onClick={onPublish} disabled={publishing}
                className="flex items-center gap-2 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50">
                {publishing ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                Publish Schedule
              </button>
            )}
          </div>
        </div>

        {/* Capacity bar */}
        <div className="flex items-center gap-4 text-sm flex-wrap">
          <span className="text-muted-foreground">Total Available HH: <strong className="text-foreground">{totalAvailable}</strong></span>
          <span className="text-muted-foreground">Assigned: <strong className="text-foreground">{Math.round(totalAssigned)}</strong></span>
          <span className="text-muted-foreground">Remaining: <strong className="text-foreground">{Math.round(totalAvailable - totalAssigned)}</strong></span>
          <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden min-w-[100px]">
            <div className="h-full bg-[#1B5E20] rounded-full transition-all" style={{ width: `${Math.min(loadPct, 100)}%` }} />
          </div>
          <span className={`text-sm font-semibold whitespace-nowrap ${loadPct > 100 ? 'text-red-600 animate-pulse' : loadPct > 80 ? 'text-amber-600' : 'text-foreground'}`}>Load: {loadPct}% {loadPct > 100 ? '⚠️ OVERLOADED' : ''}</span>
        </div>

        {/* Shift staffing breakdown + Semáforo legend */}
        {(() => {
          const dayTechs = technicians.filter(t => {
            const s = (t.shift || '').toUpperCase();
            return !s || s === 'DAY' || s === 'MORNING' || s === 'AFTERNOON';
          }).length;
          const nightTechs = technicians.filter(t => {
            const s = (t.shift || '').toUpperCase();
            return s === 'NIGHT' || s === 'NOCHE';
          }).length;
          return (
            <div className="flex items-center gap-4 flex-wrap text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
                ☀️ <strong className="text-amber-700 dark:text-amber-300">{dayTechs}</strong> día
              </span>
              <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800">
                🌙 <strong className="text-indigo-700 dark:text-indigo-300">{nightTechs}</strong> noche
              </span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"/> 🟡 Queda HH</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"/> 🟢 95-100%</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"/> 🔴 Sobrecapacidad</span>
            </div>
          );
        })()}

        {/* Calendar grid */}
        {viewBy === 'wo' ? (
          /* ═══ WO VIEW — rows are Work Orders, expandable to show operations ═══ */
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <table className="w-full border-collapse" style={{ minWidth: days.length * 100 + 250 }}>
                <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase border-r border-border" style={{ width: 250, minWidth: 250 }}>Work Order</th>
                    {days.map(d => (
                      <th key={d.str} className={"text-center px-2 py-2.5 text-xs font-semibold text-muted-foreground border-r border-border last:border-r-0" + (d.isWeekend ? " bg-gray-100 dark:bg-gray-800/50" : "")} style={{ minWidth: 100 }}>
                        <div className="font-bold">{d.label}</div>
                        <div className="text-[0.65rem] font-normal">{d.dateLabel}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {scheduledWOs.filter(wo => {
                    const s = wo.planned_start ? toDateStr(new Date(wo.planned_start)) : null;
                    const dayStrs = days.map(d => d.str);
                    return s && dayStrs.includes(s);
                  }).map(wo => {
                    const ops = wo.operations || [];
                    const isExp = expandedWOs.has(wo.wo_id);
                    const woDay = wo.planned_start ? toDateStr(new Date(wo.planned_start)) : null;
                    const typeMeta = TYPE_META[wo.wo_type] || TYPE_META.PM02;
                    const prioColor = wo.priority_code === 'P1' ? 'bg-red-500 text-white' : wo.priority_code === 'P2' ? 'bg-orange-500 text-white' : wo.priority_code === 'P3' ? 'bg-blue-500 text-white' : 'bg-gray-400 text-white';
                    return (
                      <tbody key={wo.wo_id}>
                        <tr className="border-t border-border hover:bg-muted/20 cursor-pointer" onClick={() => setExpandedWOs(prev => { const n = new Set(prev); n.has(wo.wo_id) ? n.delete(wo.wo_id) : n.add(wo.wo_id); return n; })}>
                          <td className="px-3 py-2 border-r border-border">
                            <div className="flex items-center gap-1.5">
                              {ops.length > 0 && (isExp ? <ChevronUp size={12} className="text-muted-foreground" /> : <ChevronDown size={12} className="text-muted-foreground" />)}
                              <span className="font-mono text-xs font-bold text-foreground">{wo.wo_number}</span>
                              <span className={`text-[9px] font-bold px-1 py-0.5 rounded ${prioColor}`}>{wo.priority_code}</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground truncate">{wo.equipment_tag} · {wo.estimated_hours || 0}h · {ops.length} ops</p>
                          </td>
                          {days.map(d => (
                            <td key={d.str} className={`px-1 py-1 border-r border-border last:border-r-0 text-center ${d.isWeekend ? 'bg-gray-50 dark:bg-gray-800/30' : ''}`}>
                              {d.str === woDay && (
                                <div className={`p-1 rounded text-[10px] font-bold ${typeMeta.bg}`}>
                                  {wo.estimated_hours || 0}h
                                </div>
                              )}
                            </td>
                          ))}
                        </tr>
                        {/* Expanded operations */}
                        {isExp && ops.map((op, oi) => (
                          <tr key={`${wo.wo_id}-op-${oi}`} className="bg-blue-50/30 dark:bg-blue-900/5 border-t border-border/30">
                            <td className="px-3 py-1.5 border-r border-border pl-8">
                              <div className="flex items-center gap-2 text-xs">
                                <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 flex items-center justify-center text-[10px] font-bold">{oi + 1}</span>
                                <span className="text-foreground truncate">{(op.description || '').substring(0, 40)}</span>
                              </div>
                              <span className="text-[10px] text-muted-foreground ml-7">{op.specialty} · {op.quantity || 1}p · {op.hours || 0}h · {((op.quantity || 1) * (op.hours || 0)).toFixed(1)}HH</span>
                            </td>
                            {days.map(d => (
                              <td key={d.str} className={`px-1 py-1 border-r border-border last:border-r-0 ${d.isWeekend ? 'bg-gray-50/50' : ''}`}>
                                {d.str === woDay && (
                                  <div className="text-[9px] text-blue-600 font-medium">{((op.quantity || 1) * (op.hours || 0)).toFixed(1)}HH</div>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    );
                  })}
                </tbody>
                </table>
            </div>
          </div>
        ) : technicians.length > 0 ? (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto" style={{maxWidth: "100%"}}>
              <table className="w-full border-collapse" style={{ minWidth: days.length * (showShifts ? 200 : 140) + 180 }}>
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase border-r border-border" style={{ width: 180, minWidth: 180 }}>
                      Technician
                    </th>
                    {days.map(d => (
                      <th key={d.str} colSpan={showShifts ? 2 : 1} className={"text-center px-2 py-2.5 text-xs font-semibold text-muted-foreground border-r border-border last:border-r-0" + (d.isWeekend ? " bg-gray-100 dark:bg-gray-800/50" : "")} style={{ minWidth: showShifts ? 200 : 140 }}>
                        <div className="font-bold">{d.label}</div>
                        <div className="text-[0.65rem] font-normal">{d.dateLabel}</div>
                        {showShifts && (
                          <div className="flex gap-0.5 mt-1 justify-center">
                            <span className="text-[0.6rem] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-1.5 rounded">☀️ Day</span>
                            <span className="text-[0.6rem] bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-1.5 rounded">🌙 Night</span>
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    // Jorge (2026-04-20): vista Recursos estilo Prometheus.
                    // Agrega técnicos por puesto de trabajo (specialty), suma HH
                    // por grupo/día y presenta una fila por puesto, consumido/nominal.
                    if (viewBy !== 'resource') return technicians;
                    const groups = {};
                    for (const t of technicians) {
                      const key = (t.specialty || 'SIN ESPECIALIDAD').toUpperCase();
                      if (!groups[key]) groups[key] = { worker_id: 'RES-' + key, name: key, specialty: key, members: [], _aggregated: true };
                      groups[key].members.push(t);
                    }
                    return Object.values(groups).map(g => ({
                      ...g,
                      _tech_ids: g.members.map(m => m.worker_id),
                      _count: g.members.length,
                    }));
                  })().map(tech => {
                    const badge = SPEC_BADGE[tech.specialty] || { label: (tech.specialty || '?').slice(0, 4).toUpperCase(), bg: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' };
                    const hours = tech._aggregated
                      ? (tech._tech_ids || []).reduce((s, id) => s + (techHours[id] || 0), 0)
                      : (techHours[tech.worker_id] || 0);
                    return (
                      <tr key={tech.worker_id}
                        style={{ contentVisibility: 'auto', containIntrinsicSize: '0 70px' }}
                        className="border-t border-border hover:bg-muted/10 transition-colors">
                        <td className="px-3 py-2.5 border-r border-border align-top">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-sm text-foreground">{tech.name}</span>
                            {(() => {
                              const s = (tech.shift || '').toUpperCase();
                              if (s === 'NIGHT' || s === 'NOCHE') return <span title="Turno noche" className="text-[10px]">🌙</span>;
                              if (s === 'DAY' || s === 'MORNING' || s === 'AFTERNOON' || !s) return <span title="Turno día" className="text-[10px]">☀️</span>;
                              return null;
                            })()}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className={`text-[0.6rem] font-bold px-1.5 py-0.5 rounded ${badge.bg}`}>{badge.label}</span>
                            <span className={`text-xs font-semibold ${hours > HOURS_PER_WEEK ? 'text-red-600' : hours > HOURS_PER_WEEK * 0.8 ? 'text-amber-600' : 'text-muted-foreground'}`}>{Math.round(hours)}h / {HOURS_PER_WEEK}h {hours > HOURS_PER_WEEK ? '⚠️' : ''}</span>
                          </div>
                        </td>
                        {days.map(d => {
                          const isDragging = !!dragWO;
                          // Fase 3: técnico fuera de su patrón de turno este día.
                          const offShift = !isTechOnShift(tech, d.date);
                          if (showShifts) {
                            return SHIFTS.map(shift => {
                              const cellKey = `${tech.worker_id}:${d.str}:${shift.id}`;
                              const cellWOs = grid[cellKey] || [];
                              const isTarget = dropTarget === cellKey && dragWO;
                              const shiftBg = shift.id === 'night' ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : '';
                              if (offShift) {
                                return (
                                  <td key={`${d.str}-${shift.id}`}
                                    className="px-1 py-1 border-r border-border/50 align-top bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(0,0,0,0.03)_4px,rgba(0,0,0,0.03)_8px)] dark:bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(255,255,255,0.04)_4px,rgba(255,255,255,0.04)_8px)]"
                                    style={{ minHeight: 70, minWidth: 120 }}
                                    title={`Off-shift (${tech.shift_pattern || 'patrón no definido'})`}>
                                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground/60 font-semibold text-center mt-4">OFF</div>
                                  </td>
                                );
                              }
                              return (
                                <td key={`${d.str}-${shift.id}`}
                                  className={`px-1 py-1 border-r border-border/50 align-top transition-colors ${d.isWeekend ? 'bg-gray-50 dark:bg-gray-800/30' : ''} ${shiftBg} ${isTarget ? 'bg-[#1B5E20]/10' : isDragging && cellWOs.length === 0 ? 'bg-emerald-50/30 dark:bg-emerald-900/5' : ''}`}
                                  style={{ minHeight: 70, minWidth: 120 }}
                                  onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDropTarget(cellKey); }}
                                  onDragLeave={() => setDropTarget(null)}
                                  onDrop={e => {
                                    e.preventDefault();
                                    if (dragWO) {
                                      // Jorge 2026-04-27: la guarda de capacidad bloqueaba el drop incluso al
                                      // reasignar una OT ya programada (move, no net add). Si la OT venía de
                                      // una celda (tiene planned_start o assigned_workers) tratamos como move.
                                      const isMove = !!(dragWO.planned_start || (Array.isArray(dragWO.assigned_workers) && dragWO.assigned_workers.length > 0));
                                      const techLoad = techHours[tech.worker_id] || 0;
                                      if (!isMove && techLoad >= HOURS_PER_WEEK) {
                                        toast.error('⛔ ' + tech.name + ' está en ' + Math.round(techLoad) + 'h/' + Math.round(HOURS_PER_WEEK) + 'h — sobre capacidad. Saca tareas antes de cargar más.');
                                        setDragWO(null); setDropTarget(null); return;
                                      }
                                      onScheduleWO(dragWO, tech, d.date, shift.id);
                                    }
                                    setDragWO(null); setDropTarget(null);
                                  }}>
                                  {cellWOs.map(wo => {
                                    const woType = TYPE_META[wo.wo_type] || TYPE_META.PM02;
                                    const isDraft = wo.status === 'EN_PROGRAMACION';
                                    const isReserved = wo.status === 'PROGRAMADO';
                                    const ops = wo.operations || [];
                                    const isExp = expandedWOs.has(wo.wo_id);
                                    const toggleExpand = (e) => {
                                      e.stopPropagation();
                                      setExpandedWOs(prev => { const n = new Set(prev); n.has(wo.wo_id) ? n.delete(wo.wo_id) : n.add(wo.wo_id); return n; });
                                    };
                                    const prioDot = wo.priority_code === 'P1' ? 'bg-red-500 text-white'
                                      : wo.priority_code === 'P2' ? 'bg-amber-400 text-slate-900'
                                      : wo.priority_code === 'P3' ? 'bg-sky-400 text-slate-900'
                                      : 'bg-gray-400 text-white';
                                    const crewSize = Array.isArray(wo.assigned_workers) ? wo.assigned_workers.length : 0;
                                    const timeRange = shift?.id === 'night' ? '19:00–07:00' : '07:00–19:00';
                                    const leftAccent = isReserved ? 'border-l-emerald-500' : isDraft ? 'border-l-amber-400' : 'border-l-emerald-400';
                                    return (
                                      <div key={wo.wo_id} className="relative mb-1">
                                        <div
                                          draggable={!isReserved}
                                          onMouseEnter={() => setHoverWO(wo)}
                                          onMouseLeave={() => setHoverWO(null)}
                                          onClick={e => { if (!wo._continuation) toggleExpand(e); }}
                                          onDragStart={e => { if (isReserved) { e.preventDefault(); return; } e.stopPropagation(); setDragWO(wo); e.dataTransfer.effectAllowed = 'move'; }}
                                          title={isReserved ? 'Reservada — desbloquea con Clear Assignments' : isDraft ? 'Borrador — arrástrala o reserva la semana' : 'Click para detalle · arrastrar para mover'}
                                          className={`relative bg-white dark:bg-card rounded-md border border-border border-l-[3px] ${leftAccent} px-2 py-1.5 shadow-sm transition-all ${isReserved ? 'cursor-not-allowed ring-1 ring-emerald-200' : 'cursor-grab active:cursor-grabbing hover:shadow-md hover:border-emerald-300'} ${isDraft ? 'border-dashed' : ''} ${wo._continuation ? 'opacity-70 border-dashed' : ''}`}>
                                          <div className="flex items-center justify-between gap-1 mb-0.5">
                                            <span className="font-mono text-[9.5px] text-muted-foreground truncate">{wo.wo_number}{wo._continuation ? ` (${wo._dayNum}/${wo._totalDays})` : ''}</span>
                                            <span className={`shrink-0 inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-[1px] rounded-full ${prioDot}`}>
                                              <span className="w-1 h-1 rounded-full bg-current opacity-70" />
                                              {wo.priority_code || 'P4'}
                                            </span>
                                          </div>
                                          <div className="text-[11px] font-bold text-foreground leading-tight line-clamp-2 mb-1">
                                            {wo.description || wo.equipment_tag || '—'}
                                          </div>
                                          <div className="flex items-center gap-2 text-[9.5px] text-muted-foreground">
                                            <span className="inline-flex items-center gap-0.5"><Clock size={9} /> {timeRange}</span>
                                            <span className="font-semibold text-foreground tabular-nums">{wo._continuation ? 'cont.' : (wo.estimated_hours || 0) + 'h'}</span>
                                            {crewSize > 0 && (
                                              <span className="inline-flex items-center gap-0.5"><Users size={9} /> {crewSize}</span>
                                            )}
                                            {ops.length > 0 && !wo._continuation && crewSize === 0 && (
                                              <span className="text-[9px] opacity-70">{ops.length} ops</span>
                                            )}
                                            {/* Jorge 2026-04-27: reservar/desreservar OT puntual sin bloquear semana entera */}
                                            {!wo._continuation && (
                                              <button
                                                onClick={async (e) => {
                                                  e.stopPropagation();
                                                  const next = isReserved ? 'EN_PROGRAMACION' : 'PROGRAMADO';
                                                  try {
                                                    await api.scheduleManagedWO(wo.wo_id, { status: next });
                                                    toast.success(isReserved ? `${wo.wo_number} desreservada` : `${wo.wo_number} reservada`);
                                                    onRefresh?.();
                                                    setTimeout(() => onRefresh?.(), 1500);
                                                  } catch { toast.error('Error'); }
                                                }}
                                                title={isReserved ? 'Desreservar OT' : 'Reservar OT puntual'}
                                                className={`ml-auto p-0.5 rounded transition-colors ${isReserved ? 'text-emerald-600 hover:bg-emerald-100' : 'text-muted-foreground hover:bg-muted hover:text-emerald-600'}`}>
                                                <Lock size={10} />
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                        {/* Floating rich card — matches Jorge mockup. Requested-By: Jorge Cabezas. */}
                                        {isExp && !wo._continuation && (
                                          <ExpandedWOCard
                                            wo={wo}
                                            ops={ops}
                                            shift={shift}
                                            onClose={toggleExpand}
                                            onOpen={() => { setExpandedWOs(prev => { const n = new Set(prev); n.delete(wo.wo_id); return n; }); if (onOpenDetail) onOpenDetail(wo); }}
                                          />
                                        )}
                                      </div>
                                    );
                                  })}
                                  {isTarget && (
                                    <div className="mt-1 border-2 border-dashed border-emerald-500 rounded-md bg-emerald-50/70 dark:bg-emerald-900/20 px-2 py-1.5 flex items-center gap-1.5"
                                      style={{ animation: 'dropPulse 1.2s ease-in-out infinite' }}>
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                      <span className="text-[0.6rem] font-semibold text-emerald-800 dark:text-emerald-300 truncate">
                                        drop — {d.label.slice(0,3)} {shift.id === 'night' ? '19:00–07:00' : '07:00–19:00'}
                                      </span>
                                    </div>
                                  )}
                                </td>
                              );
                            });
                          }
                          // No shifts mode
                          const cellKey = `${tech.worker_id}:${d.str}`;
                          const cellWOs = grid[cellKey] || [];
                          const isTarget = dropTarget === cellKey && dragWO;
                          return (
                            <td key={d.str}
                              className={`px-1 py-1.5 border-r border-border last:border-r-0 align-top transition-colors ${d.isWeekend ? 'bg-gray-50 dark:bg-gray-800/30' : ''} ${isTarget ? 'bg-[#1B5E20]/10' : isDragging && cellWOs.length === 0 ? 'bg-emerald-50/50 dark:bg-emerald-900/5' : ''}`}
                              style={{ minHeight: 70, height: 70 }}
                              onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDropTarget(cellKey); }}
                              onDragLeave={() => setDropTarget(null)}
                              onDrop={e => handleDrop(e, tech, d)}>
                              {cellWOs.map(wo => {
                                const woType = TYPE_META[wo.wo_type] || TYPE_META.PM02;
                                return (
                                  <div key={wo.wo_id}
                                    onMouseEnter={() => setHoverWO(wo)}
                                    onMouseLeave={() => setHoverWO(null)}
                                    className={`mb-1 p-1.5 rounded text-xs border cursor-default hover:ring-2 hover:ring-blue-400 ${woType.bg}`}>
                                    <div className="font-bold truncate">{wo.wo_number}</div>
                                    <div className="truncate text-[0.65rem]">{wo.equipment_tag}</div>
                                    <div className="text-[0.6rem] mt-0.5">{wo.estimated_hours}h</div>
                                  </div>
                                );
                              })}
                              {cellWOs.length === 0 && isTarget && (
                                <div className="h-14 border-2 border-dashed border-emerald-500 rounded-md flex items-center justify-center bg-emerald-50/70 dark:bg-emerald-900/20 gap-1.5"
                                  style={{ animation: 'dropPulse 1.2s ease-in-out infinite' }}>
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">drop — {d.label.slice(0,3)}</span>
                                </div>
                              )}
                              {cellWOs.length === 0 && isDragging && !isTarget && (
                                <div className="h-14 border border-dashed border-gray-300 dark:border-gray-600 rounded opacity-40" />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                  {/* Daily Total row */}
                  <tr className="border-t-2 border-border bg-muted/30">
                    <td className="px-3 py-2.5 border-r border-border">
                      <span className="text-sm font-semibold text-muted-foreground">Daily Total</span>
                    </td>
                    {days.map(d => {
                      const total = dailyTotals[d.str] || 0;
                      const maxDaily = technicians.length * PROGRAMMABLE_HH_PER_DAY;
                      const pct = maxDaily > 0 ? (total / maxDaily) * 100 : 0;
                      // Semáforo (Jorge): rojo >100 (sobrecapacidad), verde 95-100 (cerca del límite), ámbar <95 (queda HH)
                      const barColor = pct > 100 ? 'bg-red-500' : pct >= 95 ? 'bg-emerald-500' : pct > 0 ? 'bg-amber-500' : '';
                      const textColor = pct > 100 ? 'text-red-600 font-extrabold' : pct >= 95 ? 'text-emerald-600 font-bold' : pct > 0 ? 'text-amber-600' : 'text-foreground';
                      const icon = pct > 100 ? '🔴' : pct >= 95 ? '🟢' : pct > 0 ? '🟡' : '';
                      return (
                        <td key={d.str} colSpan={showShifts ? 2 : 1}
                          className={`px-2 py-2.5 border-r border-border last:border-r-0 ${pct > 100 ? 'bg-red-50 dark:bg-red-900/10' : pct >= 95 ? 'bg-emerald-50 dark:bg-emerald-900/10' : ''}`}
                          title={`${Math.round(total)}h de ${Math.round(maxDaily)}h (${Math.round(pct)}%)`}>
                          <div className={`text-sm mb-1 ${textColor}`}>{icon} {Math.round(total)}h <span className="text-[10px] font-normal opacity-70">/ {Math.round(maxDaily)}h</span></div>
                          <div className="h-2.5 bg-muted rounded-full overflow-hidden relative">
                            <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                            {pct > 100 && <div className="absolute top-0 right-0 h-full bg-red-700 animate-pulse" style={{ width: `${Math.min(50, pct - 100)}%` }} />}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <Users size={40} className="text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">No technicians available for this plant</p>
          </div>
        )}
      </div>

      {/* SF-562 wizard A/B: distribución del saldo de HH cuando OT > turno */}
      {shiftOverflowWizard && (() => {
        const w = shiftOverflowWizard;
        const nextDay = new Date(w.dayDate); nextDay.setDate(nextDay.getDate() + 1);
        const otherShift = w.shift === 'night' ? 'day' : 'night';
        const handleChoice = async (choice) => {
          const note = choice === 'A'
            ? `Saldo ${w.overflow.toFixed(1)}h → turno ${otherShift} del ${toDateStr(w.dayDate)} (revisar técnico noche disponible)`
            : choice === 'B'
            ? `Saldo ${w.overflow.toFixed(1)}h → mismo técnico ${w.tech.name} día siguiente ${toDateStr(nextDay)}`
            : `Saldo ${w.overflow.toFixed(1)}h → manejado manualmente por el planificador`;
          try {
            await api.updateManagedWO(w.wo.wo_id, {
              shift_overflow_plan: { choice, note, overflow_hours: w.overflow, decided_at: new Date().toISOString() },
              notes: note,
            });
            toast.success(`✓ ${w.wo.wo_number} · ${note}`, 6000);
          } catch { toast.error('Error registrando plan de saldo'); }
          setShiftOverflowWizard(null);
        };
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShiftOverflowWizard(null)} />
            <div className="relative z-10 bg-white dark:bg-card rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="p-5 border-b border-border bg-amber-50 dark:bg-amber-900/20">
                <h3 className="text-lg font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                  <AlertTriangle size={20} /> Saldo de HH a distribuir
                </h3>
                <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
                  <strong>{w.wo.wo_number}</strong> dura <strong>{w.woHours}h</strong> y el turno son <strong>{w.shiftHours}h</strong>.
                  Quedan <strong>{w.overflow.toFixed(1)}h</strong> sin asignar.
                </p>
              </div>
              <div className="p-5 space-y-2">
                <button onClick={() => handleChoice('A')}
                  className="w-full text-left p-3 rounded-xl border-2 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
                  <div className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                    {w.shift === 'day' ? '🌙' : '☀️'} A · Saldo al turno {otherShift === 'night' ? 'noche' : 'día'} del mismo día
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    El técnico de {otherShift === 'night' ? 'noche' : 'día'} continúa las {w.overflow.toFixed(1)}h restantes el {toDateStr(w.dayDate)}.
                  </div>
                </button>
                <button onClick={() => handleChoice('B')}
                  className="w-full text-left p-3 rounded-xl border-2 border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                  <div className="font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    📅 B · Saldo al mismo técnico día siguiente
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {w.tech.name} retoma las {w.overflow.toFixed(1)}h el {toDateStr(nextDay)} tras su descanso.
                  </div>
                </button>
                <button onClick={() => handleChoice('manual')}
                  className="w-full text-left p-3 rounded-xl border border-border hover:bg-muted transition-colors">
                  <div className="font-semibold text-foreground">↪ Manejar manualmente</div>
                  <div className="text-xs text-muted-foreground mt-1">El planificador asignará el saldo arrastrando manualmente.</div>
                </button>
              </div>
              <div className="p-3 border-t border-border bg-muted/20 text-[10px] text-muted-foreground text-center">
                La decisión queda registrada en notas de la OT (`shift_overflow_plan`). El split físico de la OT se hará en una próxima iteración.
              </div>
            </div>
          </div>
        );
      })()}

      {/* Floating tooltip */}
      {hoverWO && (
        <div className="fixed bottom-4 right-4 z-50 bg-card border border-border rounded-xl shadow-xl p-4 min-w-[280px] text-sm pointer-events-none">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono font-bold">{hoverWO.wo_number}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-white ${hoverWO.priority_code === 'P1' ? 'bg-red-500' : hoverWO.priority_code === 'P2' ? 'bg-orange-500' : hoverWO.priority_code === 'P3' ? 'bg-blue-500' : 'bg-gray-400'}`}>{hoverWO.priority_code}</span>
            <span className="text-xs text-muted-foreground">{hoverWO.wo_type}</span>
          </div>
          <p className="text-xs text-muted-foreground mb-1">{hoverWO.equipment_tag}</p>
          <p className="text-xs text-foreground mb-2">{(hoverWO.description || '').substring(0, 100)}</p>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <span className="text-muted-foreground">Start:</span><span>{hoverWO.planned_start || '—'}</span>
            <span className="text-muted-foreground">Hours:</span><span>{hoverWO.estimated_hours || 0}h</span>
            <span className="text-muted-foreground">Status:</span><span>{hoverWO.status}</span>
            {(hoverWO.assigned_workers || []).length > 0 && (
              <><span className="text-muted-foreground">Workers:</span><span>{hoverWO.assigned_workers.map(w => w.name).join(', ')}</span></>
            )}
          </div>
        </div>
      )}

      {/* Reserve Week Confirmation Modal — styled replacement for browser confirm() */}
      {reserveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !reserving && setReserveConfirm(null)} />
          <div className="relative z-10 bg-white dark:bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 text-center border-b border-border">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Lock size={24} className="text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Reservar Semana</h3>
              <p className="text-sm text-muted-foreground mt-1">{weekLabel}</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 text-center">
                  <div className="text-2xl font-extrabold text-purple-700 dark:text-purple-300">{reserveConfirm.drafts.length}</div>
                  <div className="text-[11px] font-semibold text-purple-600 uppercase tracking-wide mt-1">Borradores</div>
                  <div className="text-[10px] text-muted-foreground">pasarán a PROGRAMADO</div>
                </div>
                <div className={`${reserveConfirm.alreadyReserved > 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-muted/30'} rounded-xl p-3 text-center`}>
                  <div className={`text-2xl font-extrabold ${reserveConfirm.alreadyReserved > 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-muted-foreground'}`}>{reserveConfirm.alreadyReserved}</div>
                  <div className={`text-[11px] font-semibold uppercase tracking-wide mt-1 ${reserveConfirm.alreadyReserved > 0 ? 'text-emerald-600' : 'text-muted-foreground'}`}>Ya reservadas</div>
                  <div className="text-[10px] text-muted-foreground">sin cambios</div>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-xs text-amber-800 dark:text-amber-200 flex gap-2">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <div>
                  Las OTs reservadas <strong>bloquean sus HH</strong> en el programa y no podrán moverse. Para cambiarlas después, usa <em>Clear Assignments</em>.
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-border flex gap-3 bg-muted/20">
              <button onClick={() => setReserveConfirm(null)} disabled={reserving}
                className="flex-1 py-2.5 text-sm font-semibold border border-border rounded-xl text-foreground hover:bg-muted disabled:opacity-50 transition-colors">
                Cancelar
              </button>
              <button disabled={reserving} onClick={async () => {
                setReserving(true);
                const drafts = reserveConfirm.drafts;
                const reserveResults = await Promise.allSettled(
                  drafts.map(wo => api.scheduleManagedWO(wo.wo_id, { status: 'PROGRAMADO' }))
                );
                const reserved = reserveResults.filter(r => r.status === 'fulfilled').length;
                const failed = drafts.length - reserved;
                if (reserved > 0 && failed === 0) toast.success(`✓ ${reserved} OTs reservadas · HH bloqueadas`);
                else if (reserved > 0) toast.success(`${reserved} reservadas · ${failed} fallaron`);
                else toast.error('No se pudo reservar ninguna OT');
                setReserving(false);
                setReserveConfirm(null);
                onWeekChange?.(weekStart);
                // Jorge 2026-04-27: refresh inmediato + retries defensivos
                // (mismo bug que Auto-Level: backend tarda ~1.5s en committear
                // la cascada de PUTs, refresh inmediato sólo no captura todo).
                onRefresh?.();
                setTimeout(() => onRefresh?.(), 1500);
                setTimeout(() => onRefresh?.(), 3000);
              }}
                className="flex-1 py-2.5 text-sm font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
                {reserving ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                {reserving ? 'Reservando...' : 'Reservar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Right Panel: Materials Readiness — Jorge 2026-04-20 ── */}
      {showMaterialsRail ? (
        <aside className="w-[280px] min-w-[280px] flex flex-col">
          <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 300px)' }}>
            <div className="px-3 py-2 border-b border-border flex items-center justify-between bg-muted/30">
              <div>
                <h3 className="text-[13px] font-bold text-foreground flex items-center gap-1.5">
                  <Package size={14} className="text-emerald-600" /> Materials Readiness
                </h3>
                <p className="text-[10.5px] text-muted-foreground">Live from SAP MM reservations</p>
              </div>
              <button onClick={() => setShowMaterialsRail(false)} className="p-1 rounded-md hover:bg-muted text-muted-foreground" title="Collapse">
                <ChevronRight size={14} />
              </button>
            </div>
            <div className="px-3 py-2 grid grid-cols-3 gap-1.5 border-b border-border">
              {['ready','partial','blocked'].map(s => {
                const n = materialsRows.filter(m => m.status === s).length;
                const cfg = s === 'ready' ? { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-100' }
                          : s === 'partial' ? { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-100' }
                          : { bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-100' };
                return (
                  <div key={s} className={`rounded-lg ${cfg.bg} ring-1 ${cfg.ring} px-2 py-1.5 text-center`}>
                    <div className={`text-[9.5px] font-semibold uppercase tracking-wider ${cfg.text}`}>{s === 'ready' ? 'Ready' : s === 'partial' ? 'Partial' : 'Blocked'}</div>
                    <div className={`text-[17px] font-bold tabular-nums leading-none mt-0.5 ${cfg.text}`}>{n}</div>
                  </div>
                );
              })}
            </div>
            <div className="flex-1 overflow-y-auto">
              {materialsRows.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">No scheduled WOs</div>
              ) : materialsRows.map(m => {
                const cfg = m.status === 'ready' ? { dot: 'bg-emerald-500', ring: 'ring-emerald-100', label: 'Ready', txt: 'text-emerald-700' }
                          : m.status === 'partial' ? { dot: 'bg-amber-500', ring: 'ring-amber-100', label: 'Partial', txt: 'text-amber-700' }
                          : { dot: 'bg-rose-500', ring: 'ring-rose-100', label: 'Blocked', txt: 'text-rose-700' };
                return (
                  <div key={m.wo_id} className="px-3 py-2 border-b border-border/60 hover:bg-muted/30">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`w-2 h-2 rounded-full ${cfg.dot} ring-4 ${cfg.ring} shrink-0`} />
                      <span className="font-mono text-[10.5px] text-muted-foreground">{m.wo_number}</span>
                      <span className={`text-[10px] font-semibold ${cfg.txt} ml-auto`}>{cfg.label}</span>
                    </div>
                    <div className="text-[11.5px] font-medium text-foreground leading-snug truncate">{m.equipment_tag || '—'}</div>
                    <div className="mt-0.5 flex items-center justify-between text-[10px]">
                      <span className="font-mono text-muted-foreground/80 truncate">
                        {m.reservations.length > 0 ? m.reservations[0] : 'no reservation'}
                        {m.reservations.length > 1 && <span className="ml-1 text-[9px] text-muted-foreground/60">+{m.reservations.length - 1}</span>}
                      </span>
                      <span className="tabular-nums text-muted-foreground font-semibold">{m.items_count} items</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      ) : (
        <button
          onClick={() => setShowMaterialsRail(true)}
          className="self-start mt-8 p-2 bg-card border border-border rounded-l-xl hover:bg-muted text-muted-foreground"
          title="Materials Readiness"
        >
          <Package size={16} />
        </button>
      )}
    </div>
  );
}

/* ───── Phase 3: Gantt Tab (Interactive with Drag & Drop) ───── */
function GanttTab({ ganttData, t, weeksRange, onWeeksChange, onReschedule }) {
  const [hoveredWO, setHoveredWO] = useState(null);
  const [draggingWO, setDraggingWO] = useState(null);
  const [dragDayIdx, setDragDayIdx] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const [sortBy, setSortBy] = useState('priority'); // priority | date | equipment | type
  const [filterPrio, setFilterPrio] = useState('all');
  const [filterType, setFilterType] = useState('all');
  // Jorge 2026-04-24 (obs doc): filtro por Production Impact multiselección
  const [filterImpact, setFilterImpact] = useState([]); // [] = all
  const [searchGantt, setSearchGantt] = useState('');
  const [ganttPage, setGanttPage] = useState(0);
  const GANTT_PAGE_SIZE = 25;
  const ganttAreaRef = useRef(null);

  if (!ganttData || ganttData.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 text-center">
        <BarChart3 size={40} className="text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-muted-foreground">No scheduled WOs to display</p>
      </div>
    );
  }

  const now = new Date();
  const monday = getMonday(now);
  const totalDays = weeksRange * 7;
  const days = [];
  for (let i = 0; i < totalDays; i++) {
    const d = addDays(monday, i);
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const isToday = toDateStr(d) === toDateStr(now);
    days.push({ date: d, label: d.getDate(), dayName: ['S','M','T','W','T','F','S'][d.getDay()], isWeekend, isToday, month: d.toLocaleString('en', { month: 'short' }), str: toDateStr(d) });
  }

  const weeks = [];
  for (let i = 0; i < weeksRange; i++) {
    weeks.push({ label: `W${getISOWeek(addDays(monday, i * 7))}`, days: days.slice(i * 7, (i + 1) * 7) });
  }

  const prioColors = { P1: '#dc2626', P2: '#ea580c', P3: '#2563eb', P4: '#6b7280' };
  const typeColors = { PM01: '#EF4444', PM02: '#3B82F6', PM03: '#F59E0B', CORRECTIVO: '#EF4444', PREVENTIVO: '#3B82F6', PREDICTIVO: '#8B5CF6', MEJORA: '#10B981' };

  // Filter & sort
  let filtered = [...ganttData];
  if (filterPrio !== 'all') filtered = filtered.filter(wo => wo.priority_code === filterPrio);
  if (filterType !== 'all') filtered = filtered.filter(wo => wo.wo_type === filterType);
  // Jorge 2026-04-24: filtro Production Impact multiselección
  if (filterImpact.length > 0) filtered = filtered.filter(wo => {
    const p = wo.priority_code;
    const derived = { P1: 'CRITICAL', P2: 'HIGH', P3: 'MEDIUM', P4: 'HIGH' }[p] || 'MEDIUM';
    return filterImpact.includes(wo.production_impact || derived);
  });
  if (searchGantt) {
    const q = searchGantt.toLowerCase().replace(/[\s\-]+/g, '');
    filtered = filtered.filter(wo => (wo.wo_number || '').toLowerCase().replace(/[\s\-]+/g, '').includes(q) || (wo.equipment_tag || '').toLowerCase().includes(searchGantt.toLowerCase()) || (wo.description || '').toLowerCase().includes(searchGantt.toLowerCase()));
  }
  if (sortBy === 'priority') filtered.sort((a, b) => (a.priority_code || 'P4').localeCompare(b.priority_code || 'P4'));
  else if (sortBy === 'date') filtered.sort((a, b) => new Date(a.planned_start || 0) - new Date(b.planned_start || 0));
  else if (sortBy === 'equipment') filtered.sort((a, b) => (a.equipment_tag || '').localeCompare(b.equipment_tag || ''));
  else if (sortBy === 'type') filtered.sort((a, b) => (a.wo_type || '').localeCompare(b.wo_type || ''));

  // Daily load summary
  const dailyLoad = {};
  ganttData.forEach(wo => {
    const start = wo.planned_start ? toDateStr(new Date(wo.planned_start)) : null;
    if (start) dailyLoad[start] = (dailyLoad[start] || 0) + (wo.estimated_hours || 0);
  });

  const uniqueTypes = [...new Set(ganttData.map(wo => wo.wo_type).filter(Boolean))];

  const handleBarDragStart = (e, wo) => {
    setDraggingWO(wo);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', wo.wo_id);
  };

  const handleDayDrop = (e, dayIdx) => {
    e.preventDefault();
    if (draggingWO && onReschedule) {
      const newDate = days[dayIdx].date;
      const oldStart = draggingWO.planned_start ? new Date(draggingWO.planned_start) : now;
      const oldEnd = draggingWO.planned_end ? new Date(draggingWO.planned_end) : oldStart;
      const duration = Math.max(0, (oldEnd - oldStart) / 86400000);
      const newEnd = addDays(newDate, duration);
      onReschedule(draggingWO, toDateStr(newDate), toDateStr(newEnd));
    }
    setDraggingWO(null);
    setDragDayIdx(null);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Range:</span>
          {[{ v: 2, l: '2W' }, { v: 4, l: '4W' }, { v: 8, l: '8W' }, { v: 12, l: '12W' }].map(opt => (
            <button key={opt.v} onClick={() => onWeeksChange(opt.v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${weeksRange === opt.v ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-card text-foreground border-border hover:bg-muted'}`}>
              {opt.l}
            </button>
          ))}
          <div className="w-px h-6 bg-border mx-1" />
          <span className="text-sm font-medium text-muted-foreground">Sort:</span>
          {[{ v: 'priority', l: 'Priority' }, { v: 'date', l: 'Date' }, { v: 'equipment', l: 'Equipment' }, { v: 'type', l: 'Type' }].map(opt => (
            <button key={opt.v} onClick={() => setSortBy(opt.v)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${sortBy === opt.v ? 'bg-blue-600 text-white' : 'text-muted-foreground hover:bg-muted'}`}>
              {opt.l}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" value={searchGantt} onChange={e => { setSearchGantt(e.target.value); setGanttPage(0); }} placeholder="Search..."
              className="pl-7 pr-2 py-1 text-xs border border-border rounded-lg bg-background text-foreground w-36 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
          </div>
          <select value={filterPrio} onChange={e => { setFilterPrio(e.target.value); setGanttPage(0); }}
            className="text-xs border border-border rounded-lg px-2 py-1 bg-background text-foreground">
            <option value="all">All Priorities</option>
            {['P1','P2','P3','P4'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={filterType} onChange={e => { setFilterType(e.target.value); setGanttPage(0); }}
            className="text-xs border border-border rounded-lg px-2 py-1 bg-background text-foreground">
            <option value="all">All Types</option>
            {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          {/* Jorge 2026-04-24 (obs doc): filtro Production Impact multiselección */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Impact:</span>
            {['CRITICAL','HIGH','MEDIUM','LOW'].map(imp => {
              const sel = filterImpact.includes(imp);
              const col = { CRITICAL: 'bg-red-600', HIGH: 'bg-orange-500', MEDIUM: 'bg-yellow-500', LOW: 'bg-green-500' }[imp];
              return (
                <button key={imp} type="button"
                  onClick={() => setFilterImpact(prev => prev.includes(imp) ? prev.filter(x => x !== imp) : [...prev, imp])}
                  className={`text-[10px] font-bold px-2 py-1 rounded border ${sel ? `${col} text-white border-transparent` : 'bg-white text-gray-600 border-gray-300'}`}>
                  {imp.slice(0,3)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs flex-wrap">
        <span className="text-muted-foreground font-medium">Priority:</span>
        {Object.entries(prioColors).map(([p, c]) => (
          <div key={p} className="flex items-center gap-1"><div className="w-3 h-3 rounded" style={{ backgroundColor: c }} /><span>{p}</span></div>
        ))}
        <div className="w-px h-4 bg-border mx-1" />
        <span className="text-muted-foreground font-medium">{filtered.length} WOs</span>
        <span className="text-muted-foreground">· Drag bars to reschedule</span>
      </div>

      {/* Gantt Chart */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto" ref={ganttAreaRef}>
          <div style={{ minWidth: Math.max(900, totalDays * 36 + 300) }}>
            {/* Header */}
            <div className="flex border-b-2 border-border sticky top-0 z-10 bg-card">
              <div className="w-[300px] min-w-[300px] px-4 py-1 text-[10px] font-bold text-muted-foreground uppercase border-r-2 border-border bg-gray-50 dark:bg-gray-800/50 flex items-end">
                WO / Equipment
              </div>
              <div className="flex-1 flex flex-col">
                <div className="flex">
                  {weeks.map((w, i) => (
                    <div key={i} className="flex-1 text-center text-[10px] font-bold text-muted-foreground py-1 border-b border-border bg-gray-50 dark:bg-gray-800/50" style={{ minWidth: w.days.length * 36 }}>
                      {w.label}
                    </div>
                  ))}
                </div>
                <div className="flex">
                  {days.map((d, i) => (
                    <div key={i}
                      className={`text-center text-[9px] py-1 border-r border-border/40 ${d.isToday ? 'bg-emerald-100 dark:bg-emerald-900/30 font-bold' : d.isWeekend ? 'bg-gray-100 dark:bg-gray-800 text-gray-400' : 'bg-white dark:bg-card text-gray-600'}`}
                      style={{ minWidth: 36, flex: '0 0 auto', width: `${100 / totalDays}%` }}>
                      <div className={`font-bold ${d.isToday ? 'text-emerald-700 dark:text-emerald-300' : ''}`}>{d.dayName}</div>
                      <div>{d.label}</div>
                    </div>
                  ))}
                </div>
                {/* Daily load indicator */}
                <div className="flex border-t border-border/50">
                  {days.map((d, i) => {
                    const load = dailyLoad[d.str] || 0;
                    const pct = Math.min(load / 40, 1);
                    return (
                      <div key={i} className="relative" style={{ minWidth: 36, flex: '0 0 auto', width: `${100 / totalDays}%`, height: 4 }}>
                        <div className={`absolute inset-0 ${load > 40 ? 'bg-red-400' : load > 24 ? 'bg-amber-400' : load > 0 ? 'bg-emerald-400' : 'bg-transparent'}`}
                          style={{ opacity: Math.max(0.2, pct) }} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Rows (paginated) */}
            <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {filtered.slice(ganttPage * GANTT_PAGE_SIZE, (ganttPage + 1) * GANTT_PAGE_SIZE).map((wo) => {
                const woStart = wo.planned_start ? new Date(wo.planned_start) : now;
                const woEnd = wo.planned_end ? new Date(wo.planned_end) : new Date(woStart.getTime() + (wo.estimated_hours || 4) * 3600000);
                const startOffset = Math.max(0, (woStart - monday) / 86400000);
                const duration = Math.max(0.5, (woEnd - woStart) / 86400000 + 1);
                const leftPct = (startOffset / totalDays) * 100;
                const widthPct = Math.max(2, (duration / totalDays) * 100);
                const barColor = prioColors[wo.priority_code] || prioColors.P3;
                const isHovered = hoveredWO === wo.wo_id;
                const isDragging = draggingWO?.wo_id === wo.wo_id;
                const workers = (wo.assigned_workers || []).map(w => w.name).join(', ');

                return (
                  <div key={wo.wo_id || wo.wo_number}
                    className={`flex border-b border-border/50 transition-colors ${isDragging ? 'opacity-50 bg-blue-50 dark:bg-blue-900/10' : isHovered ? 'bg-blue-50/50 dark:bg-blue-900/5' : 'hover:bg-gray-50/50 dark:hover:bg-gray-800/30'}`}
                    onMouseEnter={() => setHoveredWO(wo.wo_id)} onMouseLeave={() => { setHoveredWO(null); setTooltip(null); }}>
                    {/* Label */}
                    <div className="w-[300px] min-w-[300px] px-3 py-2 border-r-2 border-border">
                      <div className="flex items-center gap-1.5">
                        <GripVertical size={10} className="text-gray-300" />
                        <span className="font-mono text-[11px] font-bold text-foreground">{wo.wo_number}</span>
                        <span className="text-[9px] font-bold px-1 py-0.5 rounded text-white" style={{ backgroundColor: barColor }}>{wo.priority_code}</span>
                        <span className={`text-[9px] px-1 py-0.5 rounded border ${wo.status === 'PROGRAMADO' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700' : wo.status === 'EN_EJECUCION' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700' : 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'}`}>{wo.status}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">{wo.equipment_tag} — {(wo.description || '').substring(0, 30)}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-gray-400">{wo.estimated_hours}h · {wo.wo_type || ''}</span>
                        {workers && <span className="text-[10px] text-blue-500 truncate max-w-[100px]">👷 {workers}</span>}
                      </div>
                    </div>
                    {/* Bar area with drop zones */}
                    <div className="flex-1 relative" style={{ minHeight: 52 }}>
                      {/* Day grid + drop zones */}
                      {days.map((d, i) => (
                        <div key={i}
                          className={`absolute top-0 bottom-0 border-r transition-colors ${d.isToday ? 'bg-emerald-50/30 dark:bg-emerald-900/10 border-emerald-300/50' : d.isWeekend ? 'bg-gray-50/50 dark:bg-gray-800/20 border-gray-200/50' : 'border-border/20'} ${dragDayIdx === i && draggingWO ? 'bg-blue-100/50 dark:bg-blue-900/20' : ''}`}
                          style={{ left: `${(i / totalDays) * 100}%`, width: `${100 / totalDays}%` }}
                          onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragDayIdx(i); }}
                          onDragLeave={() => setDragDayIdx(null)}
                          onDrop={e => handleDayDrop(e, i)} />
                      ))}
                      {/* Today marker */}
                      {(() => {
                        const todayIdx = days.findIndex(d => d.isToday);
                        if (todayIdx >= 0) return <div className="absolute top-0 bottom-0 w-0.5 bg-emerald-500 z-10" style={{ left: `${((todayIdx + 0.5) / totalDays) * 100}%` }} />;
                        return null;
                      })()}
                      {/* Draggable Bar */}
                      <div className="absolute top-2 bottom-2 flex items-center cursor-grab active:cursor-grabbing"
                        draggable
                        onDragStart={e => handleBarDragStart(e, wo)}
                        onDragEnd={() => { setDraggingWO(null); setDragDayIdx(null); }}
                        onMouseEnter={() => setTooltip(wo)}
                        onMouseLeave={() => setTooltip(null)}
                        style={{ left: `${Math.max(0, Math.min(leftPct, 98))}%`, width: `${Math.min(widthPct, 100 - leftPct)}%`, zIndex: isHovered ? 5 : 1 }}>
                        <div className={`h-full w-full rounded-md shadow-sm relative overflow-hidden transition-all ${isHovered ? 'ring-2 ring-offset-1 scale-[1.02]' : ''} ${isDragging ? 'ring-2 ring-blue-400 scale-95' : ''}`}
                          style={{ backgroundColor: barColor + '25', borderLeft: `3px solid ${barColor}`, ringColor: barColor }}>
                          {/* Progress fill */}
                          <div className="h-full rounded-r-md" style={{ width: `${wo.completion_pct || 0}%`, backgroundColor: barColor + '50' }} />
                          <span className="absolute inset-0 flex items-center px-1.5 text-[9px] font-bold truncate" style={{ color: barColor }}>
                            {wo.wo_number?.replace('WO-', '')} {wo.completion_pct > 0 ? `(${wo.completion_pct}%)` : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {filtered.length > GANTT_PAGE_SIZE && (
        <div className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-2">
          <span className="text-xs text-muted-foreground">
            Showing {ganttPage * GANTT_PAGE_SIZE + 1}-{Math.min((ganttPage + 1) * GANTT_PAGE_SIZE, filtered.length)} of {filtered.length} WOs
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => setGanttPage(p => Math.max(0, p - 1))} disabled={ganttPage === 0}
              className="px-3 py-1 text-xs font-medium border border-border rounded-lg hover:bg-muted disabled:opacity-40 text-foreground">
              Previous
            </button>
            {Array.from({ length: Math.ceil(filtered.length / GANTT_PAGE_SIZE) }, (_, i) => (
              <button key={i} onClick={() => setGanttPage(i)}
                className={`w-7 h-7 text-xs font-medium rounded-lg transition-colors ${ganttPage === i ? 'bg-emerald-700 text-white' : 'border border-border hover:bg-muted text-foreground'}`}>
                {i + 1}
              </button>
            )).slice(Math.max(0, ganttPage - 2), ganttPage + 3)}
            <button onClick={() => setGanttPage(p => Math.min(Math.ceil(filtered.length / GANTT_PAGE_SIZE) - 1, p + 1))}
              disabled={ganttPage >= Math.ceil(filtered.length / GANTT_PAGE_SIZE) - 1}
              className="px-3 py-1 text-xs font-medium border border-border rounded-lg hover:bg-muted disabled:opacity-40 text-foreground">
              Next
            </button>
          </div>
        </div>
      )}

      {/* Tooltip */}
      {tooltip && (
        <div className="fixed bottom-4 right-4 z-50 bg-card border border-border rounded-xl shadow-xl p-4 min-w-[280px] text-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono font-bold">{tooltip.wo_number}</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: prioColors[tooltip.priority_code] || '#6b7280' }}>{tooltip.priority_code}</span>
            <span className="text-xs text-muted-foreground">{tooltip.wo_type}</span>
          </div>
          <p className="text-xs text-muted-foreground mb-1">{tooltip.equipment_tag}</p>
          <p className="text-xs text-foreground mb-2">{tooltip.description}</p>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <span className="text-muted-foreground">Start:</span><span>{tooltip.planned_start || 'N/A'}</span>
            <span className="text-muted-foreground">End:</span><span>{tooltip.planned_end || 'N/A'}</span>
            <span className="text-muted-foreground">Hours:</span><span>{tooltip.estimated_hours}h</span>
            <span className="text-muted-foreground">Progress:</span><span>{tooltip.completion_pct || 0}%</span>
            {(tooltip.assigned_workers || []).length > 0 && (
              <><span className="text-muted-foreground">Workers:</span><span>{tooltip.assigned_workers.map(w => w.name).join(', ')}</span></>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ───── Phase 3b: Mass Change Tab ───── */
function MassChangeTab({ scheduledWOs, releasedWOs, t, plantId, onRefresh }) {
  const toast = useToast();
  const [selected, setSelected] = useState(new Set());
  const [edits, setEdits] = useState({});
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchMC, setSearchMC] = useState('');
  const [bulkField, setBulkField] = useState('');
  const [bulkValue, setBulkValue] = useState('');

  const allWOs = useMemo(() => [...(scheduledWOs || []), ...(releasedWOs || [])], [scheduledWOs, releasedWOs]);

  const filtered = useMemo(() => {
    let list = allWOs;
    if (filterStatus !== 'all') list = list.filter(wo => wo.status === filterStatus);
    if (searchMC) {
      const q = searchMC.toLowerCase().replace(/[\s\-]+/g, '');
      list = list.filter(wo => (wo.wo_number || '').toLowerCase().replace(/[\s\-]+/g, '').includes(q) || (wo.equipment_tag || '').toLowerCase().includes(searchMC.toLowerCase()));
    }
    return list;
  }, [allWOs, filterStatus, searchMC]);

  const toggleSelect = (woId) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(woId) ? next.delete(woId) : next.add(woId);
      return next;
    });
  };
  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(wo => wo.wo_id)));
  };

  const updateEdit = (woId, field, value) => {
    setEdits(prev => ({
      ...prev,
      [woId]: { ...(prev[woId] || {}), [field]: value },
    }));
  };

  const applyBulkChange = () => {
    if (!bulkField || selected.size === 0) return;
    const newEdits = { ...edits };
    selected.forEach(woId => {
      newEdits[woId] = { ...(newEdits[woId] || {}), [bulkField]: bulkValue };
    });
    setEdits(newEdits);
    toast.success(`Applied "${bulkField}" = "${bulkValue}" to ${selected.size} WOs`);
    setBulkField('');
    setBulkValue('');
  };

  const saveAll = async () => {
    const entries = Object.entries(edits).filter(([, v]) => Object.keys(v).length > 0);
    if (entries.length === 0) { toast.info('No changes to save'); return; }
    setSaving(true);
    let ok = 0, fail = 0;
    for (const [woId, changes] of entries) {
      try {
        await api.updateManagedWO(woId, changes);
        ok++;
      } catch { fail++; }
    }
    setSaving(false);
    setEdits({});
    setSelected(new Set());
    toast.success(`Saved ${ok} WOs${fail > 0 ? `, ${fail} failed` : ''}`);
    onRefresh?.();
  };

  const editedCount = Object.keys(edits).filter(k => Object.keys(edits[k]).length > 0).length;
  const statuses = [...new Set(allWOs.map(wo => wo.status))];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Wrench size={16} className="text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Mass Change</span>
          <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{allWOs.length} WOs</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" value={searchMC} onChange={e => setSearchMC(e.target.value)} placeholder="Search..."
              className="pl-7 pr-2 py-1 text-xs border border-border rounded-lg bg-background text-foreground w-36 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="text-xs border border-border rounded-lg px-2 py-1 bg-background text-foreground">
            <option value="all">All Status</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-3 flex items-center gap-3 flex-wrap">
          <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">{selected.size} selected</span>
          <div className="w-px h-6 bg-blue-200 dark:bg-blue-700" />
          <select value={bulkField} onChange={e => setBulkField(e.target.value)}
            className="text-xs border border-blue-200 dark:border-blue-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-foreground">
            <option value="">Select field...</option>
            <option value="status">Status</option>
            <option value="priority_code">Priority</option>
            <option value="shift">Shift</option>
            <option value="planned_start">Planned Start</option>
            <option value="planned_end">Planned End</option>
            <option value="work_center">Work Center</option>
          </select>
          {bulkField === 'status' && (
            <select value={bulkValue} onChange={e => setBulkValue(e.target.value)}
              className="text-xs border border-blue-200 dark:border-blue-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-foreground">
              <option value="">Select...</option>
              {['CREADO','PLANIFICADO','PROGRAMADO','EN_EJECUCION','COMPLETADO','CERRADO'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
          {bulkField === 'priority_code' && (
            <select value={bulkValue} onChange={e => setBulkValue(e.target.value)}
              className="text-xs border border-blue-200 dark:border-blue-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-foreground">
              <option value="">Select...</option>
              {['P1','P2','P3','P4'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          )}
          {bulkField === 'shift' && (
            <select value={bulkValue} onChange={e => setBulkValue(e.target.value)}
              className="text-xs border border-blue-200 dark:border-blue-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-foreground">
              <option value="">Select...</option>
              <option value="day">Day</option>
              <option value="night">Night</option>
            </select>
          )}
          {(bulkField === 'planned_start' || bulkField === 'planned_end') && (
            <input type="date" value={bulkValue} onChange={e => setBulkValue(e.target.value)}
              className="text-xs border border-blue-200 dark:border-blue-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-foreground" />
          )}
          {bulkField === 'work_center' && (
            <input type="text" value={bulkValue} onChange={e => setBulkValue(e.target.value)} placeholder="e.g. PASMEC01"
              className="text-xs border border-blue-200 dark:border-blue-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-foreground w-28" />
          )}
          <button onClick={applyBulkChange} disabled={!bulkField || !bulkValue}
            className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors">
            Apply to {selected.size}
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto" style={{ maxHeight: '65vh' }}>
          <table className="w-full border-collapse text-xs">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-100 dark:bg-gray-800 border-b-2 border-border">
                <th className="px-3 py-3 text-left w-8"><input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} className="rounded accent-emerald-600" /></th>
                <th className="px-3 py-3 text-left font-bold text-xs uppercase tracking-wider text-gray-600 dark:text-gray-300">WO#</th>
                <th className="px-3 py-3 text-left font-bold text-xs uppercase tracking-wider text-gray-600 dark:text-gray-300">Equipment</th>
                <th className="px-3 py-3 text-center font-bold text-xs uppercase tracking-wider text-gray-600 dark:text-gray-300">Type</th>
                <th className="px-3 py-3 text-center font-bold text-xs uppercase tracking-wider text-gray-600 dark:text-gray-300">Priority</th>
                {/* Jorge 2026-04-24 item 38: columna Production Impact en Scheduling */}
                <th className="px-3 py-3 text-center font-bold text-xs uppercase tracking-wider text-gray-600 dark:text-gray-300">Impact</th>
                <th className="px-3 py-3 text-center font-bold text-xs uppercase tracking-wider text-gray-600 dark:text-gray-300">Status</th>
                <th className="px-3 py-3 text-center font-bold text-xs uppercase tracking-wider text-gray-600 dark:text-gray-300">Start</th>
                <th className="px-3 py-3 text-center font-bold text-xs uppercase tracking-wider text-gray-600 dark:text-gray-300">End</th>
                <th className="px-3 py-3 text-center font-bold text-xs uppercase tracking-wider text-gray-600 dark:text-gray-300">Shift</th>
                <th className="px-3 py-3 text-center font-bold text-xs uppercase tracking-wider text-gray-600 dark:text-gray-300">HH</th>
                <th className="px-3 py-3 text-center font-bold text-xs uppercase tracking-wider text-gray-600 dark:text-gray-300">Work Center</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((wo, rowIdx) => {
                const e = edits[wo.wo_id] || {};
                const isEdited = Object.keys(e).length > 0;
                const isSel = selected.has(wo.wo_id);
                const prio = e.priority_code ?? wo.priority_code ?? 'P3';
                const prioStyle = prio === 'P1' ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300' : prio === 'P2' ? 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300' : prio === 'P3' ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400';
                const stat = e.status ?? wo.status ?? '';
                const statStyle = stat === 'PROGRAMADO' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : stat === 'EN_EJECUCION' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : stat === 'CERRADO' || stat === 'COMPLETADO' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : stat === 'PLANIFICADO' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
                const typeMeta = wo.wo_type === 'PM01' ? 'bg-red-50 text-red-600 border-red-200' : wo.wo_type === 'PM02' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-purple-50 text-purple-600 border-purple-200';
                return (
                  <tr key={wo.wo_id} className={`border-b border-border/30 transition-all ${isEdited ? 'bg-amber-50/70 dark:bg-amber-900/15 ring-1 ring-inset ring-amber-300/50' : isSel ? 'bg-blue-50/50 dark:bg-blue-900/10' : rowIdx % 2 === 0 ? 'bg-white dark:bg-card' : 'bg-gray-50/50 dark:bg-gray-800/20'} hover:bg-blue-50/40 dark:hover:bg-blue-900/10`}>
                    <td className="px-3 py-2"><input type="checkbox" checked={isSel} onChange={() => toggleSelect(wo.wo_id)} className="rounded accent-emerald-600" /></td>
                    <td className="px-3 py-2 font-mono font-bold text-foreground text-[11px]">{wo.wo_number}</td>
                    <td className="px-3 py-2 text-muted-foreground truncate max-w-[160px] text-[11px]">{wo.equipment_tag}</td>
                    <td className="px-3 py-2 text-center"><span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${typeMeta}`}>{wo.wo_type}</span></td>
                    <td className="px-3 py-2 text-center">
                      <select value={prio} onChange={ev => updateEdit(wo.wo_id, 'priority_code', ev.target.value)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-md border cursor-pointer ${e.priority_code ? 'ring-2 ring-amber-400' : ''} ${prioStyle}`}>
                        {['P1','P2','P3','P4'].map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </td>
                    {/* Jorge 2026-04-24 item 38: celda Production Impact */}
                    <td className="px-3 py-2 text-center">
                      {(() => {
                        const imp = wo.production_impact || ({ P1: 'CRITICAL', P2: 'HIGH', P3: 'MEDIUM', P4: 'HIGH' }[prio] || 'MEDIUM');
                        const col = { CRITICAL: 'bg-red-100 text-red-700 border-red-300', HIGH: 'bg-orange-100 text-orange-700 border-orange-300', MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-300', LOW: 'bg-green-100 text-green-700 border-green-300' }[imp];
                        return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${col}`}>{imp.slice(0,4)}</span>;
                      })()}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <select value={stat} onChange={ev => updateEdit(wo.wo_id, 'status', ev.target.value)}
                        className={`text-[10px] font-semibold px-2 py-1 rounded-md cursor-pointer ${e.status ? 'ring-2 ring-amber-400' : ''} ${statStyle}`}>
                        {['CREADO','LIBERADO','PLANIFICADO','EN_PROGRAMACION','PROGRAMADO','EN_EJECUCION','COMPLETADO','CERRADO'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2 text-center">
                      {(() => {
                        // Jorge 2026-04-24 item 40: alerta si la fecha planificada queda
                        // muy lejos de la original (>14 días = fuera de semana razonable).
                        const currentDate = e.planned_start ?? (wo.planned_start || '').slice(0, 10);
                        const originalDate = (wo.planned_start || '').slice(0, 10);
                        let outOfWindow = false;
                        if (e.planned_start && originalDate) {
                          const diffDays = Math.abs((new Date(e.planned_start) - new Date(originalDate)) / 86400000);
                          outOfWindow = diffDays > 14;
                        }
                        return (
                          <div className="flex items-center gap-1">
                            <input type="date" value={currentDate} onChange={ev => updateEdit(wo.wo_id, 'planned_start', ev.target.value)}
                              className={`border rounded-md px-1.5 py-1 bg-background text-foreground text-[10px] w-[105px] ${e.planned_start ? (outOfWindow ? 'ring-2 ring-red-500 bg-red-50 dark:bg-red-900/20' : 'ring-2 ring-amber-400 bg-amber-50 dark:bg-amber-900/20') : 'border-gray-200 dark:border-gray-700'}`} />
                            {outOfWindow && <span className="text-red-600 text-[10px]" title="Fecha lejos del planned_start original (>14 días)">⚠</span>}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input type="date" value={e.planned_end ?? (wo.planned_end || '').slice(0, 10)} onChange={ev => updateEdit(wo.wo_id, 'planned_end', ev.target.value)}
                        className={`border rounded-md px-1.5 py-1 bg-background text-foreground text-[10px] w-[105px] ${e.planned_end ? 'ring-2 ring-amber-400 bg-amber-50 dark:bg-amber-900/20' : 'border-gray-200 dark:border-gray-700'}`} />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <select value={e.shift ?? wo.shift ?? 'day'} onChange={ev => updateEdit(wo.wo_id, 'shift', ev.target.value)}
                        className={`text-[10px] px-2 py-1 rounded-md border cursor-pointer ${e.shift ? 'ring-2 ring-amber-400' : 'border-gray-200 dark:border-gray-700'} bg-background text-foreground`}>
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                      </select>
                    </td>
                    <td className="px-3 py-2 text-center"><span className="font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded text-[10px]">{wo.estimated_hours || 0}h</span></td>
                    <td className="px-3 py-2 text-center">
                      <input type="text" value={e.work_center ?? wo.work_center ?? ''} onChange={ev => updateEdit(wo.wo_id, 'work_center', ev.target.value)}
                        className={`border rounded-md px-1.5 py-1 bg-background text-foreground text-[10px] w-24 text-center ${e.work_center ? 'ring-2 ring-amber-400 bg-amber-50 dark:bg-amber-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                        placeholder="—" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Save bar */}
      {editedCount > 0 && (
        <div className="sticky bottom-4 bg-card border-2 border-amber-400 rounded-xl p-4 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-sm font-semibold text-foreground">{editedCount} WO(s) modified</span>
            <span className="text-xs text-muted-foreground">Changes are not saved yet</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setEdits({}); setSelected(new Set()); }}
              className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors text-foreground">
              Discard
            </button>
            <button onClick={saveAll} disabled={saving}
              className="px-6 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
              Save All Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───── Phase 3: HH Balance Tab ───── */
function HHBalanceTab({ programId, t, plantId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  // B3-6 Jorge 2026-04-27: filtro semana propio + gráfico curva vs meta 80%
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Monday
    d.setDate(d.getDate() + diff);
    return d.toISOString().slice(0, 10);
  });
  const TARGET_PCT = 80;

  useEffect(() => {
    setLoading(true);
    api.hhBalanceLive(plantId, weekStart)
      .then(setData)
      .catch(() => {
        if (programId) api.hhBalance(programId).then(setData).catch(() => {});
      })
      .finally(() => setLoading(false));
  }, [plantId, programId, weekStart]);

  const shiftWeek = (deltaDays) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + deltaDays);
    setWeekStart(d.toISOString().slice(0, 10));
  };

  if (loading) return <div className="py-10 flex justify-center"><LoadingSpinner /></div>;
  if (!data) return (
    <div className="bg-card border border-border rounded-xl p-12 text-center">
      <Users size={40} className="text-muted-foreground/40 mx-auto mb-3" />
      <p className="text-muted-foreground">Select a program to view HH balance</p>
    </div>
  );

  const utilizationColor = data.utilization_pct > 100 ? 'text-red-600 dark:text-red-400' : data.utilization_pct > 80 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400';
  const utilizationLabel = data.utilization_pct > 100 ? t('scheduling.overloaded') : data.utilization_pct > 80 ? t('scheduling.balanced') : t('scheduling.underloaded');

  const specs = (data.by_specialty || []).sort((a, b) => b.assigned - a.assigned);
  const activeSpecs = specs.filter(s => s.assigned > 0 || s.capacity > 0);

  const specColors = {
    'Mecánico': '#047857', 'Eléctrico': '#2563eb', 'Instrumentación': '#7c3aed',
    'Lubricación': '#d97706', 'DCS': '#0891b2', 'Predictivo': '#be185d', 'General': '#6b7280',
  };

  return (
    <div className="space-y-5">
      {/* Summary — big circular gauge + stats */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-8">
          {/* Circular gauge */}
          <div className="relative w-36 h-36 shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="8" />
              <circle cx="50" cy="50" r="42" fill="none"
                stroke={data.utilization_pct > 100 ? '#ef4444' : data.utilization_pct > 80 ? '#f59e0b' : '#10b981'}
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${Math.min(data.utilization_pct, 100) * 2.64} 264`} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-bold ${data.utilization_pct > 100 ? 'text-red-600' : data.utilization_pct > 80 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {data.utilization_pct}%
              </span>
              <span className="text-[10px] text-gray-500 uppercase font-semibold">Load</span>
            </div>
          </div>
          {/* Stats grid */}
          <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-xl border border-blue-100">
              <Users size={20} className="text-blue-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-blue-800">{data.worker_count}</p>
              <p className="text-[10px] text-blue-600 uppercase font-semibold">Workers</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-xl border border-purple-100">
              <Clock size={20} className="text-purple-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-purple-800">{data.capacity}h</p>
              <p className="text-[10px] text-purple-600 uppercase font-semibold">Capacity</p>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-xl border border-amber-100">
              <Wrench size={20} className="text-amber-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-amber-800">{data.assigned}h</p>
              <p className="text-[10px] text-amber-600 uppercase font-semibold">Assigned</p>
            </div>
            <div className="text-center p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <CheckCircle size={20} className="text-emerald-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-emerald-800">{data.available}h</p>
              <p className="text-[10px] text-emerald-600 uppercase font-semibold">Available</p>
            </div>
          </div>
        </div>
      </div>

      {/* B3-6 Jorge 2026-04-27: gráfico curva HH vs meta 80% por día de semana */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground">Curva HH semanal · meta {TARGET_PCT}%</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => shiftWeek(-7)} className="p-1 rounded border border-border hover:bg-muted">
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs font-mono text-muted-foreground">Semana del {weekStart}</span>
            <button onClick={() => shiftWeek(7)} className="p-1 rounded border border-border hover:bg-muted">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
        {(() => {
          const byDay = data.by_day || [];
          if (byDay.length === 0) return <p className="text-xs text-muted-foreground italic">No hay datos para esta semana.</p>;
          const W = 700, H = 180, PAD = 32;
          const maxCap = Math.max(...byDay.map(d => d.capacity), 1);
          const maxAssgn = Math.max(...byDay.map(d => d.assigned), 1);
          const yMax = Math.max(maxCap, maxAssgn) * 1.1;
          const xStep = (W - 2 * PAD) / Math.max(1, byDay.length - 1);
          const yScale = (v) => H - PAD - ((v / yMax) * (H - 2 * PAD));
          const targetY = yScale((TARGET_PCT / 100) * (byDay[0]?.capacity || 0));
          const points = byDay.map((d, i) => `${PAD + i * xStep},${yScale(d.assigned)}`).join(' ');
          return (
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[180px]">
              {/* Grid */}
              {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
                <line key={i} x1={PAD} x2={W - PAD} y1={yScale(yMax * p)} y2={yScale(yMax * p)}
                  stroke="#e5e7eb" strokeDasharray="3 3" />
              ))}
              {/* Capacity bars */}
              {byDay.map((d, i) => (
                <rect key={`cap-${i}`} x={PAD + i * xStep - 14} y={yScale(d.capacity)}
                  width="28" height={H - PAD - yScale(d.capacity)}
                  fill="#cbd5e1" opacity="0.4" />
              ))}
              {/* Target line (80% of daily capacity, average) */}
              <line x1={PAD} x2={W - PAD} y1={targetY} y2={targetY}
                stroke="#10b981" strokeDasharray="4 2" strokeWidth="2" />
              <text x={W - PAD - 4} y={targetY - 4} fontSize="10" fill="#10b981" textAnchor="end" fontWeight="bold">
                Meta {TARGET_PCT}%
              </text>
              {/* Assigned line */}
              <polyline fill="none" stroke="#2563eb" strokeWidth="2.5" points={points} />
              {/* Points + labels */}
              {byDay.map((d, i) => {
                const x = PAD + i * xStep;
                const y = yScale(d.assigned);
                const over = d.utilization_pct > 100;
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r="4" fill={over ? '#ef4444' : d.utilization_pct >= TARGET_PCT ? '#10b981' : '#f59e0b'} />
                    <text x={x} y={y - 8} fontSize="10" textAnchor="middle" fill="#374151" fontWeight="bold">
                      {d.assigned}h
                    </text>
                    <text x={x} y={H - 8} fontSize="10" textAnchor="middle" fill="#6b7280">
                      {d.weekday}
                    </text>
                  </g>
                );
              })}
              {/* Y-axis labels */}
              <text x={4} y={yScale(yMax)} fontSize="9" fill="#6b7280">{Math.round(yMax)}h</text>
              <text x={4} y={yScale(0) - 2} fontSize="9" fill="#6b7280">0h</text>
            </svg>
          );
        })()}
        <div className="flex items-center gap-4 text-[10px] text-muted-foreground mt-2">
          <span className="flex items-center gap-1"><span className="w-3 h-1 bg-blue-600 inline-block" /> Asignado</span>
          <span className="flex items-center gap-1"><span className="w-3 h-1 bg-emerald-500 inline-block" style={{ borderTop: '2px dashed #10b981' }} /> Meta {TARGET_PCT}%</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-slate-300 inline-block opacity-40" /> Capacidad</span>
        </div>
      </div>

      {/* Per-specialty breakdown */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-foreground">HH Balance by Specialty</h2>
          <span className="text-xs text-muted-foreground">{activeSpecs.length} specialties</span>
        </div>
        <div className="p-4 space-y-4">
          {activeSpecs.map(spec => {
            const pct = spec.utilization_pct;
            const color = specColors[spec.specialty] || '#6b7280';
            const isOver = pct > 100;
            const isHigh = pct > 80;
            return (
              <div key={spec.specialty} className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-sm font-semibold text-foreground">{spec.specialty}</span>
                    <span className="text-[10px] text-gray-400">{Math.round(spec.capacity / 40)} workers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{spec.assigned}h / {spec.capacity}h</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isOver ? 'bg-red-100 text-red-700' : isHigh ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {pct}%
                    </span>
                  </div>
                </div>
                <div className="relative h-5 bg-gray-100 rounded-lg overflow-hidden">
                  <div className="h-full rounded-lg transition-all duration-500" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color + (isOver ? '' : '90') }} />
                  {/* 80% and 100% markers */}
                  <div className="absolute top-0 bottom-0 w-px bg-gray-300" style={{ left: '80%' }} />
                  {isOver && <div className="absolute top-0 bottom-0 w-px bg-red-400" style={{ left: '100%' }} />}
                  {/* Available hours inside bar */}
                  {spec.available > 0 && (
                    <span className="absolute right-2 top-0 bottom-0 flex items-center text-[9px] font-bold text-gray-500">
                      +{spec.available}h free
                    </span>
                  )}
                </div>
                {isOver && <p className="text-[10px] text-red-500 mt-0.5 font-medium">⚠ Overloaded by {Math.abs(spec.available)}h — reassign or add workers</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ───── Phase 3: Materials Tab ───── */
/* ───── Materials Coordination Tab (RSR - Resource Status Report) ───── */
const COLL_STATUS = [
  { id: 'PENDIENTE', label: 'Pendiente', icon: '⏳', color: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700' },
  { id: 'PARCIAL', label: 'Parcial', icon: '🔄', color: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700' },
  { id: 'COMPLETADO', label: 'Completado', icon: '✅', color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700' },
  { id: 'EN_AREA_ESPERA', label: 'En Area Espera', icon: '📦', color: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700' },
  { id: 'ENTREGADO', label: 'Entregado', icon: '🚚', color: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700' },
];
const COLL_MAP = Object.fromEntries(COLL_STATUS.map(s => [s.id, s]));

function MaterialsTab({ programId, t, plantId }) {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [expandedWO, setExpandedWO] = useState(new Set());
  const [filterStatus, setFilterStatus] = useState('all');
  const [matPage, setMatPage] = useState(0);
  const MAT_PAGE_SIZE = 20;

  const loadData = () => {
    setLoading(true);
    api.materialsLive(plantId)
      .then(setData)
      .catch(() => {
        if (programId) api.materialCheck(programId).then(setData).catch(() => {});
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [plantId, programId]);

  const handleStatusChange = async (woId, matIndex, newStatus) => {
    const key = `${woId}:${matIndex}`;
    setUpdating(key);
    try {
      await api.updateMaterialCollection(woId, { material_index: matIndex, status: newStatus });
      const meta = COLL_MAP[newStatus];
      toast.success(`${meta?.icon || ''} Material ${meta?.label || newStatus}`);
      loadData();
    } catch (e) {
      toast.error('Error updating: ' + (e.message || ''));
    } finally {
      setUpdating(null);
    }
  };

  const handleBulkStatus = async (woId, woNumber, newStatus) => {
    setUpdating(woId);
    try {
      await api.bulkUpdateMaterialStatus(woId, newStatus);
      const meta = COLL_MAP[newStatus];
      toast.success(`${woNumber}: all materials → ${meta?.label || newStatus}`);
      loadData();
    } catch (e) {
      toast.error('Error: ' + (e.message || ''));
    } finally {
      setUpdating(null);
    }
  };

  const toggleExpand = (woId) => {
    setExpandedWO(prev => {
      const next = new Set(prev);
      next.has(woId) ? next.delete(woId) : next.add(woId);
      return next;
    });
  };

  if (loading) return <div className="py-10 flex justify-center"><LoadingSpinner /></div>;
  if (!data) return (
    <div className="bg-card border border-border rounded-xl p-12 text-center">
      <Package size={40} className="text-muted-foreground/40 mx-auto mb-3" />
      <p className="text-muted-foreground">No materials data available</p>
    </div>
  );

  const byStatus = data.by_status || {};
  const allOk = data.pending === 0 && data.total_materials > 0;
  const packages = data.packages || [];
  const filtered = filterStatus === 'all' ? packages : packages.filter(p => p.status === filterStatus);

  return (
    <div className="space-y-5">
      {/* Pipeline progress bar */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Package size={16} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <span className="text-sm font-bold text-foreground">Material Collection Pipeline</span>
              <p className="text-[10px] text-muted-foreground">Track material readiness from warehouse to work site</p>
            </div>
          </div>
          <span className="text-xs font-semibold bg-muted px-3 py-1 rounded-full text-muted-foreground">{data.total_materials} items / {data.total_packages} WOs</span>
        </div>
        {/* Horizontal pipeline */}
        <div className="flex rounded-lg overflow-hidden h-8 bg-gray-100 dark:bg-gray-800">
          {COLL_STATUS.map(s => {
            const count = byStatus[s.id] || 0;
            const pct = data.total_materials > 0 ? (count / data.total_materials) * 100 : 0;
            if (pct === 0) return null;
            const bgColor = s.id === 'PENDIENTE' ? 'bg-gray-400' : s.id === 'PARCIAL' ? 'bg-amber-500' : s.id === 'COMPLETADO' ? 'bg-blue-500' : s.id === 'EN_AREA_ESPERA' ? 'bg-purple-500' : 'bg-emerald-500';
            return (
              <div key={s.id} className={`${bgColor} flex items-center justify-center cursor-pointer transition-all hover:opacity-80 ${filterStatus === s.id ? 'ring-2 ring-inset ring-white' : ''}`}
                style={{ width: `${pct}%` }}
                onClick={() => setFilterStatus(filterStatus === s.id ? 'all' : s.id)}>
                {pct > 8 && <span className="text-[10px] font-bold text-white">{count}</span>}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2">
          {COLL_STATUS.map(s => {
            const count = byStatus[s.id] || 0;
            return (
              <div key={s.id} className={`text-center cursor-pointer transition-opacity ${filterStatus !== 'all' && filterStatus !== s.id ? 'opacity-40' : ''}`}
                onClick={() => setFilterStatus(filterStatus === s.id ? 'all' : s.id)}>
                <span className="text-[9px] text-muted-foreground">{s.icon} {s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {COLL_STATUS.map(s => {
          const count = byStatus[s.id] || 0;
          const bgCard = s.id === 'PENDIENTE' ? 'border-gray-300 bg-gray-50 dark:bg-gray-800/50' : s.id === 'PARCIAL' ? 'border-amber-300 bg-amber-50 dark:bg-amber-900/20' : s.id === 'COMPLETADO' ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20' : s.id === 'EN_AREA_ESPERA' ? 'border-purple-300 bg-purple-50 dark:bg-purple-900/20' : 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20';
          const numColor = s.id === 'PENDIENTE' ? 'text-gray-700 dark:text-gray-300' : s.id === 'PARCIAL' ? 'text-amber-700 dark:text-amber-300' : s.id === 'COMPLETADO' ? 'text-blue-700 dark:text-blue-300' : s.id === 'EN_AREA_ESPERA' ? 'text-purple-700 dark:text-purple-300' : 'text-emerald-700 dark:text-emerald-300';
          return (
            <div key={s.id} onClick={() => { setFilterStatus(filterStatus === s.id ? 'all' : s.id); setMatPage(0); }}
              className={`rounded-xl border-2 p-4 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${filterStatus === s.id ? 'ring-2 ring-blue-500 shadow-md' : ''} ${bgCard}`}>
              <div className="text-2xl font-bold mb-1">{s.icon}</div>
              <div className={`text-2xl font-extrabold ${numColor}`}>{count}</div>
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-1">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Overall readiness */}
      <div className={`border rounded-xl p-4 flex items-center gap-3 ${allOk ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-700' : 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-700'}`}>
        {allOk ? <CheckCircle size={20} className="text-emerald-600 dark:text-emerald-400" /> : <AlertTriangle size={20} className="text-amber-600 dark:text-amber-400" />}
        <span className={`text-sm font-medium ${allOk ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}`}>
          {allOk ? 'All materials collected & delivered — Ready for execution' : `${data.pending} WOs with pending materials`}
        </span>
        {filterStatus !== 'all' && (
          <button onClick={() => setFilterStatus('all')} className="ml-auto text-xs text-blue-600 hover:underline">Clear filter</button>
        )}
      </div>

      {/* Work Orders with materials */}
      <div className="space-y-3">
        {filtered.length > MAT_PAGE_SIZE && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Showing {matPage * MAT_PAGE_SIZE + 1}-{Math.min((matPage + 1) * MAT_PAGE_SIZE, filtered.length)} of {filtered.length} WOs</span>
            <div className="flex gap-1">
              <button onClick={() => setMatPage(p => Math.max(0, p - 1))} disabled={matPage === 0}
                className="px-2 py-1 border border-border rounded hover:bg-muted disabled:opacity-40">Prev</button>
              <button onClick={() => setMatPage(p => Math.min(Math.ceil(filtered.length / MAT_PAGE_SIZE) - 1, p + 1))}
                disabled={matPage >= Math.ceil(filtered.length / MAT_PAGE_SIZE) - 1}
                className="px-2 py-1 border border-border rounded hover:bg-muted disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
        {filtered.slice(matPage * MAT_PAGE_SIZE, (matPage + 1) * MAT_PAGE_SIZE).map(pkg => {
          const isExpanded = expandedWO.has(pkg.wo_id);
          const hasMats = pkg.materials && pkg.materials.length > 0;
          // Collection = picked/completed or already at site/delivered. Staging (EN_AREA_ESPERA)
          // is picked but not yet at the work site — counted as "collected" since it's available.
          // Delivered = actually delivered to the job.
          const deliveredItems = (pkg.materials || []).filter(m => m.collection_status === 'ENTREGADO').length;
          const collectedOnly = pkg.total_items > 0 ? Math.round((pkg.collected_items / pkg.total_items) * 100) : 0;
          const deliveredPct = pkg.total_items > 0 ? Math.round((deliveredItems / pkg.total_items) * 100) : 0;
          const progress = collectedOnly;
          const statusMeta = pkg.status === 'ENTREGADO' ? { bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', icon: '🚚' }
            : pkg.status === 'EN_PROCESO' ? { bg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', icon: '🔄' }
            : pkg.status === 'NO_MATERIALS' ? { bg: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400', icon: '—' }
            : { bg: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300', icon: '⏳' };

          return (
            <div key={pkg.wo_id} className="bg-card border border-border rounded-xl overflow-hidden">
              {/* WO Header */}
              <div className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => hasMats && toggleExpand(pkg.wo_id)}>
                {hasMats && (isExpanded ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />)}
                <span className="font-mono text-sm font-bold text-foreground">{pkg.wo_number}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${statusMeta.bg}`}>{statusMeta.icon} {pkg.status}</span>
                <span className="text-xs text-muted-foreground truncate">{pkg.equipment_tag}</span>
                <span className="text-[10px] text-gray-400 truncate max-w-[150px]">{pkg.description}</span>
                {pkg.reservation_code && <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-1.5 py-0.5 rounded ml-auto">RES: {pkg.reservation_code}</span>}
                {pkg.planned_start && <span className={`text-[10px] text-blue-500 ${pkg.reservation_code ? '' : 'ml-auto'}`}>{pkg.planned_start}</span>}
                {hasMats && (
                  <div className="flex items-center gap-2 ml-2">
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-foreground">{pkg.collected_items}/{pkg.total_items}</span>
                  </div>
                )}
                {/* Bulk actions */}
                {hasMats && pkg.status !== 'ENTREGADO' && (
                  <div className="flex gap-1 ml-2" onClick={e => e.stopPropagation()}>
                    {pkg.status === 'PENDIENTE' && (
                      <button onClick={() => handleBulkStatus(pkg.wo_id, pkg.wo_number, 'COMPLETADO')}
                        disabled={updating === pkg.wo_id}
                        className="text-[10px] px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors disabled:opacity-50 dark:bg-blue-900/30 dark:text-blue-300">
                        All Collected
                      </button>
                    )}
                    {(pkg.status === 'EN_PROCESO' || pkg.collected_items === pkg.total_items) && (
                      <button onClick={() => handleBulkStatus(pkg.wo_id, pkg.wo_number, 'EN_AREA_ESPERA')}
                        disabled={updating === pkg.wo_id}
                        className="text-[10px] px-2 py-1 rounded bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors disabled:opacity-50 dark:bg-purple-900/30 dark:text-purple-300">
                        To Staging
                      </button>
                    )}
                    <button onClick={() => handleBulkStatus(pkg.wo_id, pkg.wo_number, 'ENTREGADO')}
                      disabled={updating === pkg.wo_id}
                      className="text-[10px] px-2 py-1 rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors disabled:opacity-50 dark:bg-emerald-900/30 dark:text-emerald-300">
                      Delivered
                    </button>
                  </div>
                )}
              </div>

              {/* Expanded materials list */}
              {isExpanded && hasMats && (
                <div className="border-t border-border divide-y divide-border/50">
                  {pkg.materials.map((item, iIdx) => {
                    const cs = COLL_MAP[item.collection_status] || COLL_MAP.PENDIENTE;
                    const isUpdating = updating === `${pkg.wo_id}:${item.index}`;
                    return (
                      <div key={iIdx} className="px-4 py-2.5 flex items-center gap-3 text-xs hover:bg-muted/20 transition-colors">
                        <span className="font-mono text-gray-400 w-16 shrink-0">{item.code}</span>
                        <span className="text-foreground flex-1 truncate">{item.description}</span>
                        <span className="font-bold text-foreground w-10 text-right">{item.quantity}</span>
                        <span className="text-gray-400 w-6">{item.unit}</span>
                        {/* Jorge 2026-04-27: nº reserva por material — repuesto puede pertenecer
                            a una reserva distinta a la del paquete (planificador a veces crea
                            sub-reservas). Si el item tiene su propia, gana; si no, hereda del pkg. */}
                        <span className="font-mono text-[10px] text-indigo-600 w-20 text-right truncate" title="Nº reserva">
                          {item.reservation_number || pkg.reservation_code || '—'}
                        </span>
                        {/* Status selector */}
                        <select
                          value={item.collection_status}
                          onChange={e => handleStatusChange(pkg.wo_id, item.index, e.target.value)}
                          disabled={isUpdating}
                          className={`text-[11px] font-semibold px-2 py-1 rounded-lg border cursor-pointer transition-colors disabled:opacity-50 ${cs.color}`}>
                          {COLL_STATUS.map(s => (
                            <option key={s.id} value={s.id}>{s.icon} {s.label}</option>
                          ))}
                        </select>
                        {isUpdating && <Loader2 size={12} className="animate-spin text-blue-500" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <Package size={32} className="text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{filterStatus !== 'all' ? 'No WOs match this filter' : 'No WOs with materials scheduled'}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SupportEquipmentTab({ plantId, t }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', equipment_type: 'MOBILE_CRANE', capacity_tons: '', is_rented: false });
  const toast = useToast();

  const EQ_TYPES = [
    { value: 'OVERHEAD_CRANE', label: 'Puente grúa' },
    { value: 'MOBILE_CRANE', label: 'Grúa móvil' },
    { value: 'FORKLIFT', label: 'Grúa horquilla' },
    { value: 'MANLIFT', label: 'Brazo elevador' },
    { value: 'TOOL', label: 'Herramienta especial' },
  ];
  const TYPE_LABEL = Object.fromEntries(EQ_TYPES.map(e => [e.value, e.label]));

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.listSupportEquipment(plantId);
      setItems(Array.isArray(res) ? res : []);
    } catch { setItems([]); }
    setLoading(false);
  };
  useEffect(() => { load(); }, [plantId]);

  const addEquipment = async () => {
    if (!form.name.trim()) { toast.error('Nombre requerido'); return; }
    setSaving(true);
    try {
      await api.createSupportEquipment({
        plant_id: plantId,
        name: form.name.trim(),
        equipment_type: form.equipment_type,
        capacity_tons: form.capacity_tons ? Number(form.capacity_tons) : null,
        is_rented: form.is_rented,
        available: true,
      });
      toast.success('Equipo agregado');
      setForm({ name: '', equipment_type: 'MOBILE_CRANE', capacity_tons: '', is_rented: false });
      load();
    } catch { toast.error('Error agregando equipo'); }
    setSaving(false);
  };

  const toggleAvailable = async (eq) => {
    const reason = !eq.available ? '' : (window.prompt('Razón de bloqueo (mantención / falla / …)') || 'Fuera de servicio');
    try {
      await api.updateSupportEquipment(eq.equipment_id, {
        available: !eq.available,
        out_of_service_reason: !eq.available ? null : reason,
      });
      toast.success(eq.available ? '🔒 Equipo bloqueado' : '✅ Equipo habilitado');
      load();
    } catch { toast.error('Error'); }
  };

  const toggleRented = async (eq) => {
    try {
      await api.updateSupportEquipment(eq.equipment_id, { is_rented: !eq.is_rented });
      load();
    } catch { toast.error('Error'); }
  };

  const removeEquipment = async (eq) => {
    if (!window.confirm(`¿Eliminar definitivamente "${eq.name}"? Esta acción no se puede deshacer.`)) return;
    try {
      await api.deleteSupportEquipment(eq.equipment_id);
      toast.success('Equipo eliminado');
      load();
    } catch { toast.error('Error eliminando equipo'); }
  };

  const availableCount = items.filter(i => i.available).length;
  const blockedCount = items.filter(i => !i.available).length;
  const rentedCount = items.filter(i => i.is_rented).length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <div className="text-2xl font-extrabold text-foreground">{items.length}</div>
          <div className="text-xs text-muted-foreground">Total</div>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl p-3 text-center">
          <div className="text-2xl font-extrabold text-emerald-700">{availableCount}</div>
          <div className="text-xs text-emerald-600">Disponibles</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-3 text-center">
          <div className="text-2xl font-extrabold text-red-700">{blockedCount}</div>
          <div className="text-xs text-red-600">Fuera de servicio</div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-3 text-center">
          <div className="text-2xl font-extrabold text-blue-700">{rentedCount}</div>
          <div className="text-xs text-blue-600">Arrendados</div>
        </div>
      </div>

      {/* Add new */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="text-sm font-bold text-foreground mb-3">Agregar equipo / herramienta</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="Nombre (ej. Grúa móvil N°3)"
            className="text-sm border border-border rounded-lg px-3 py-2 bg-background md:col-span-2" />
          <select value={form.equipment_type} onChange={e => setForm({ ...form, equipment_type: e.target.value })}
            className="text-sm border border-border rounded-lg px-3 py-2 bg-background">
            {EQ_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <input type="number" value={form.capacity_tons} onChange={e => setForm({ ...form, capacity_tons: e.target.value })}
            placeholder="Tonelaje" className="text-sm border border-border rounded-lg px-3 py-2 bg-background" />
          <label className="flex items-center gap-2 text-xs text-muted-foreground px-2">
            <input type="checkbox" checked={form.is_rented} onChange={e => setForm({ ...form, is_rented: e.target.checked })} className="accent-blue-600" />
            Arrendado
          </label>
        </div>
        <button onClick={addEquipment} disabled={saving}
          className="mt-3 px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1.5">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Agregar
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Wrench size={40} className="text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No hay equipos de apoyo registrados para esta planta</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="divide-y divide-border/50">
            {items.map(eq => (
              <div key={eq.equipment_id} className={`flex items-center gap-3 p-3 ${!eq.available ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}>
                <div className={`w-2.5 h-2.5 rounded-full ${eq.available ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">{eq.name}</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{TYPE_LABEL[eq.equipment_type] || eq.equipment_type}</span>
                    {eq.capacity_tons && <span className="text-[10px] text-muted-foreground">{eq.capacity_tons}t</span>}
                    {eq.is_rented && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">Arrendado</span>}
                  </div>
                  {!eq.available && eq.out_of_service_reason && (
                    <p className="text-xs text-red-600 mt-0.5">🔒 {eq.out_of_service_reason}</p>
                  )}
                </div>
                <button onClick={() => toggleRented(eq)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${eq.is_rented ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-border text-muted-foreground hover:bg-muted'}`}>
                  {eq.is_rented ? 'Arrendado' : 'Propio'}
                </button>
                <button onClick={() => toggleAvailable(eq)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${eq.available ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/20'}`}>
                  {eq.available ? 'Bloquear' : 'Habilitar'}
                </button>
                <button onClick={() => removeEquipment(eq)}
                  title="Eliminar definitivamente"
                  className="text-xs p-1.5 rounded-lg text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Rich expanded OT card — click-to-expand overlay styled after Jorge's mockup.
// Positioned absolute over its cell so it can overflow to show full operation
// list, materials status and an "Open WO" shortcut. Requested-By: Jorge Cabezas.
function ExpandedWOCard({ wo, ops, shift, onClose, onOpen }) {
  const specTone = (specRaw) => {
    const s = (specRaw || '').toUpperCase();
    const hit = Object.entries(SPEC_BADGE).find(([k]) => s.startsWith(k.slice(0, 3)) || k.startsWith(s.slice(0, 3)));
    return hit ? hit[1] : { label: (s || '—').slice(0,4), bg: 'bg-slate-100 text-slate-700' };
  };
  const woSpec = specTone(wo.work_center || wo.specialty);
  const prioTone = wo.priority_code === 'P1' ? 'bg-red-500 text-white'
    : wo.priority_code === 'P2' ? 'bg-orange-500 text-white'
    : wo.priority_code === 'P3' ? 'bg-blue-500 text-white'
    : 'bg-gray-400 text-white';
  const timeRange = shift?.id === 'night' ? '19:00–07:00' : '07:00–19:00';
  const crewSize = Array.isArray(wo.assigned_workers) ? wo.assigned_workers.length : 0;
  const matsReady = Array.isArray(wo.materials) && wo.materials.length > 0 && wo.materials.every(m => (m?.status || 'ready').toLowerCase() === 'ready' || m?.ready);
  return (
    <div
      onClick={e => e.stopPropagation()}
      className="absolute top-0 left-0 z-40 w-[340px] rounded-xl border border-emerald-400 dark:border-emerald-600 bg-white dark:bg-card shadow-2xl ring-4 ring-emerald-500/15 overflow-hidden"
      style={{ animation: 'fadeIn 140ms ease-out both' }}>
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border bg-white dark:bg-card">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span className="font-mono font-bold text-[11.5px] text-foreground">{wo.wo_number}</span>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${prioTone}`}>{wo.priority_code || 'P4'}</span>
        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${woSpec.bg}`}>{woSpec.label}</span>
        <div className="flex-1" />
        <button onClick={onClose} className="p-0.5 rounded hover:bg-muted" title="Cerrar"><X size={12} /></button>
      </div>
      <div className="px-3 pt-2.5 pb-2">
        <div className="font-bold text-foreground text-[13px] leading-tight mb-1.5">{wo.description || wo.equipment_tag}</div>
        <div className="flex items-center gap-3 text-[10.5px] text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Clock size={11} /> {timeRange}</span>
          <span className="inline-flex items-center gap-1 font-semibold text-foreground">{wo.estimated_hours || 0}h</span>
          {crewSize > 0 && <span className="inline-flex items-center gap-1"><Users size={11} /> {crewSize} crew</span>}
        </div>
      </div>
      {/* Jorge 2026-04-27 (reunión 18:06): HH desglose por disciplina + duración real.
          Antes el resumen mostraba sólo total HH y leía 16h como puro mecánico aunque
          tuviera 8h mecánico + 8h eléctrico. Ahora calculamos por op.specialty.
          Duración = serie + max(paralelos por grupo) — misma fórmula que Planning.
          David 2026-04-28: Si ops está vacío (OT sin operaciones definidas), igual
          mostramos un desglose usando wo.estimated_hours + wo.work_center/specialty. */}
      {(() => {
        const byDiscipline = {};
        let totalHH = 0;
        let serieHrs = 0;
        const parGroups = {};
        if (ops.length > 0) {
          for (const op of ops) {
            const spec = (op.specialty || op.work_center || wo.work_center || 'OTRO').toUpperCase();
            const qty = parseInt(op.quantity) || 1;
            const hh = (parseFloat(op.hours) || 0) * qty;
            byDiscipline[spec] = (byDiscipline[spec] || 0) + hh;
            totalHH += hh;
            if (op.parallel) {
              const g = op.parallel_group || 'A';
              parGroups[g] = Math.max(parGroups[g] || 0, parseFloat(op.hours) || 0);
            } else {
              serieHrs += parseFloat(op.hours) || 0;
            }
          }
        } else {
          // Fallback: sin operaciones, usar HH total de la OT y specialty del work_center.
          const fallbackHH = parseFloat(wo.estimated_hours) || 0;
          const fallbackSpec = (wo.work_center || wo.specialty || 'OTRO').toUpperCase();
          if (fallbackHH > 0) {
            byDiscipline[fallbackSpec] = fallbackHH;
            totalHH = fallbackHH;
            serieHrs = fallbackHH;
          }
        }
        const parallelHrs = Object.values(parGroups).reduce((s, v) => s + v, 0);
        const duration = serieHrs + parallelHrs;
        if (totalHH === 0) return null;
        const entries = Object.entries(byDiscipline).sort((a, b) => b[1] - a[1]);
        return (
          <div className="px-3 pb-2 grid grid-cols-2 gap-2 text-[10.5px]">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded p-1.5">
              <div className="text-[9px] font-bold uppercase text-emerald-700 dark:text-emerald-300">Duración</div>
              <div className="font-semibold text-foreground tabular-nums">{duration.toFixed(1)}h</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-1.5">
              <div className="text-[9px] font-bold uppercase text-blue-700 dark:text-blue-300">Total HH</div>
              <div className="font-semibold text-foreground tabular-nums">{totalHH.toFixed(1)}h</div>
            </div>
            <div className="col-span-2 bg-muted/40 rounded p-1.5">
              <div className="text-[9px] font-bold uppercase text-muted-foreground mb-1">
                HH por disciplina {ops.length === 0 && <span className="text-amber-600 normal-case font-normal">· estimado (sin ops definidas)</span>}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {entries.map(([spec, hh]) => {
                  const tone = specTone(spec);
                  return (
                    <span key={spec} className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${tone.bg}`}>
                      {tone.label} <span className="tabular-nums opacity-90">{hh.toFixed(1)}h</span>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}
      <div className="px-3 pb-2.5">
        <div className="text-[9.5px] font-bold tracking-wider uppercase text-muted-foreground mb-1.5">Operations · {ops.length}</div>
        {ops.length === 0 && (
          <div className="text-[11px] text-muted-foreground italic py-1">Sin operaciones definidas — abrí el detalle para agregarlas.</div>
        )}
        <div className="space-y-1">
          {ops.slice(0, 8).map((op, i) => {
            const opSpec = specTone(op.specialty || op.work_center || wo.work_center);
            const hh = (parseFloat(op.hours) || 0);
            const qty = parseInt(op.quantity) || 1;
            return (
              <div key={i} className="flex items-center gap-2 text-[11px]">
                <span className="font-mono text-[9.5px] text-muted-foreground w-8 shrink-0">{String((i + 1) * 10).padStart(4, '0')}</span>
                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded shrink-0 ${opSpec.bg}`}>{opSpec.label}</span>
                <span className="flex-1 truncate text-foreground">{op.description || op.task || '—'}</span>
                <span className="text-muted-foreground tabular-nums text-[10px] shrink-0">{hh}h<span className="opacity-60"> × {qty}</span></span>
              </div>
            );
          })}
          {ops.length > 8 && <div className="text-[10px] text-muted-foreground pl-10">+{ops.length - 8} más</div>}
        </div>
      </div>
      {/* Fase 6 Jorge 2026-04-21 — materiales y costos en el rich card */}
      {Array.isArray(wo.materials) && wo.materials.length > 0 && (
        <div className="px-3 pb-2">
          <div className="text-[9.5px] font-bold tracking-wider uppercase text-muted-foreground mb-1">Materiales · {wo.materials.length}</div>
          <div className="space-y-0.5">
            {wo.materials.slice(0, 5).map((m, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[10.5px]">
                <span className="font-mono text-[9.5px] text-muted-foreground w-16 shrink-0 truncate">{m.code || m.sap_id || '—'}</span>
                <span className="flex-1 truncate">{m.description || '—'}</span>
                <span className="tabular-nums text-muted-foreground shrink-0">{m.quantity || 0} {m.unit || ''}</span>
              </div>
            ))}
            {wo.materials.length > 5 && <div className="text-[10px] text-muted-foreground">+{wo.materials.length - 5} más</div>}
          </div>
        </div>
      )}
      {(wo.budget_amount || wo.actual_total_cost) && (
        <div className="px-3 pb-2 grid grid-cols-3 gap-1 text-[10px]">
          <div><span className="text-muted-foreground block text-[9px]">Presupuesto</span><span className="font-semibold text-foreground">${Math.round(wo.budget_amount || 0).toLocaleString()}</span></div>
          <div><span className="text-muted-foreground block text-[9px]">Real</span><span className="font-semibold text-foreground">${Math.round(wo.actual_total_cost || 0).toLocaleString()}</span></div>
          <div><span className="text-muted-foreground block text-[9px]">Var</span>
            {wo.budget_amount > 0 && (
              <span className={`font-bold ${(wo.actual_total_cost || 0) > wo.budget_amount ? 'text-rose-700' : 'text-emerald-700'}`}>
                {Math.round((((wo.actual_total_cost || 0) - wo.budget_amount) / wo.budget_amount) * 100)}%
              </span>
            )}
          </div>
        </div>
      )}
      <div className="flex items-center gap-2 px-3 py-2 border-t border-border bg-muted/40">
        {matsReady ? (
          <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-emerald-700 dark:text-emerald-400">
            <Package size={11} /> Materials ready {wo.reservation_code ? <span className="font-mono text-muted-foreground ml-0.5">{wo.reservation_code}</span> : null}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-amber-700 dark:text-amber-400">
            <Package size={11} /> Materials pending
          </span>
        )}
        <div className="flex-1" />
        <button
          onClick={(e) => { e.stopPropagation(); onOpen(); }}
          className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-colors">
          Open WO
          <ArrowUpRight size={11} />
        </button>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, color, label, value, sub, highlight }) {
  return (
    <div className={`bg-card rounded-xl border p-4 ${highlight ? 'border-amber-200 dark:border-amber-700' : 'border-border'}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={16} className={color} />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
    </div>
  );
}

function getISOWeek(d) {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}

/* ───── Main Scheduling Page ───── */
export default function Scheduling() {
  const { plant } = useOutletContext();
  const { t } = useLanguage();
  const { user } = useAuth();
  const toast = useToast();
  const { CAP, PROGRAMMABLE_HH_PER_DAY } = useCapacitySettings();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(user?.role === 'tecnico' ? 'inbox' : 'schedule');
  const [detailOrder, setDetailOrder] = useState(null);
  const [closureOrder, setClosureOrder] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [capacityLimit, setCapacityLimit] = useState(85); // % max capacity for auto-level
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiInstructions, setAiInstructions] = useState('');
  const [aiDraftPlan, setAiDraftPlan] = useState(null);
  const [blockedEquipment, setBlockedEquipment] = useState([]);
  const [publishing, setPublishing] = useState(false);
  const [aiScheduling, setAiScheduling] = useState(false);
  const [viewedWeekStart, setViewedWeekStart] = useState(() => getMonday(new Date()));
  const [aiResult, setAiResult] = useState(null);

  // Calendar view state
  const [technicians, setTechnicians] = useState([]);
  const [releasedWOs, setReleasedWOs] = useState([]);
  const [scheduledWOs, setScheduledWOs] = useState([]);

  // Legacy state for Gantt/HH/Materials/Inbox
  const [weeks, setWeeks] = useState([]);
  const [ganttData, setGanttData] = useState([]);
  const [ganttWeeks, setGanttWeeks] = useState(2);
  const [programs, setPrograms] = useState([]);

  const techsCacheRef = useRef([]);

  const loadCalendarData = async () => {
    try {
      // Load technicians FIRST and cache them
      const techs = await api.listTechnicians({ plant_id: plant }).catch(() => null);
      if (techs) {
        const list = Array.isArray(techs) ? techs : techs?.technicians || [];
        if (list.length > 0) { techsCacheRef.current = list; setTechnicians(list); }
      }
      if (techsCacheRef.current.length > 0 && technicians.length === 0) {
        setTechnicians(techsCacheRef.current);
      }
    } catch {}
    try {
      // Then load WOs sequentially to avoid overwhelming the backend
      const [created, planned, released, enProg, scheduled, executing] = await Promise.all([
        api.listManagedWOs({ status: 'CREADO', plant_id: plant, light: true }).catch(() => []),
        api.listManagedWOs({ status: 'PLANIFICADO', plant_id: plant, light: true }).catch(() => []),
        api.listManagedWOs({ status: 'LIBERADO', plant_id: plant, light: true }).catch(() => []),
        api.listManagedWOs({ status: 'EN_PROGRAMACION', plant_id: plant, light: true }).catch(() => []),
        api.listManagedWOs({ status: 'PROGRAMADO', plant_id: plant, light: true }).catch(() => []),
        api.listManagedWOs({ status: 'EN_EJECUCION', plant_id: plant, light: true }).catch(() => []),
      ]);
      const arr = v => Array.isArray(v) ? v : [];
      // 2-step flow (Jose): EN_PROGRAMACION = borrador en calendario, PROGRAMADO = reservado/bloqueado
      // David 2026-04-28 (Jorge bug): OTs en EN_PROGRAMACION sin planned_start
      // estaban en scheduledWOs pero no se renderizaban (sin posicion en grilla) y
      // tampoco aparecian en el panel izquierdo. Split por planned_start: las que
      // ya tienen planned_start van al calendario; las que no, al panel izquierdo
      // como input pendiente de programar.
      const enProgList = arr(enProg);
      const enProgPlaced = enProgList.filter(w => w.planned_start);
      const enProgPending = enProgList.filter(w => !w.planned_start);
      setReleasedWOs([...arr(created), ...arr(planned), ...arr(released), ...enProgPending]);
      setScheduledWOs([...enProgPlaced, ...arr(scheduled), ...arr(executing)]);
    } catch {}
  };

  const loadPrograms = () => {
    setLoading(true);
    api.listPrograms({ plant_id: plant })
      .then((data) => {
        if (Array.isArray(data)) {
          setPrograms(data);
          if (data.length > 0) {
            const mapped = data.map((prog) => ({
              program_id: prog.program_id,
              week: `W${String(prog.week_number || 0).padStart(2, '0')}`,
              start: prog.created_at ? prog.created_at.slice(0, 10) : '',
              end: prog.finalized_at ? prog.finalized_at.slice(0, 10) : '',
              planned_hours: prog.total_hours || 0,
              executed_hours: Math.round((prog.total_hours || 0) * 0.75),
              adherence: prog.status === 'FINAL' ? 92 : prog.status === 'ACTIVE' ? 78 : 0,
              status: prog.status,
              published_at: prog.published_at,
              published_by: prog.published_by,
              work_orders: (prog.work_packages || []).map((wp, i) => ({
                id: wp.work_package_id || `WO-${i}`,
                type: wp.wo_type || 'PM02',
                equipment: wp.equipment_tag || '',
                description: wp.description || `Package ${i + 1}`,
                priority: wp.priority || 'P3',
                status: prog.status === 'FINAL' || prog.status === 'COMPLETED' ? 'COMPLETED' : 'PLANNED',
                duration_planned: wp.estimated_hours || 4,
                duration_actual: prog.status === 'FINAL' || prog.status === 'COMPLETED' ? (wp.estimated_hours || 4) * 0.9 : 0,
                technicians: wp.specialties || ['Technician'],
              })),
            }));
            setWeeks(mapped);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const loadGantt = () => {
    api.getGanttManaged({ plant_id: plant, weeks: ganttWeeks })
      .then(setGanttData)
      .catch(() => setGanttData([]));
  };

  useEffect(() => { loadPrograms(); loadCalendarData(); }, [plant]);

  // Track blocked support equipment to warn planner during Auto-Level
  useEffect(() => {
    if (!plant) return;
    api.listSupportEquipment(plant).then(list => {
      const blocked = (Array.isArray(list) ? list : []).filter(e => !e.available);
      setBlockedEquipment(blocked);
    }).catch(() => setBlockedEquipment([]));
  }, [plant]);

  // Real-time updates via WebSocket — patch granular (Jorge 2026-04-21).
  // Si el evento trae el objeto wo completo (wo_updated/wo_status), mergeamos
  // en state local sin refetchear. Cambios instantáneos, sin flash visual.
  // Fallback: eventos sin wo payload o bulk → reload completo con debounce.
  const wsTimerRef = useRef(null);
  const [lastWsAt, setLastWsAt] = useState(null);

  const routeWOToBucket = useCallback((updatedWO) => {
    const status = (updatedWO.status || '').toUpperCase();
    const inReleased = ['LIBERADO', 'CREADO', 'PLANIFICADO'].includes(status);
    const inScheduled = ['EN_PROGRAMACION', 'PROGRAMADO', 'EN_EJECUCION'].includes(status);
    setReleasedWOs(prev => {
      const without = prev.filter(w => w.wo_id !== updatedWO.wo_id);
      return inReleased ? [updatedWO, ...without] : without;
    });
    setScheduledWOs(prev => {
      const without = prev.filter(w => w.wo_id !== updatedWO.wo_id);
      return inScheduled ? [updatedWO, ...without] : without;
    });
  }, []);

  useWebSocket(plant, useCallback((msg) => {
    if (showAIModal || aiScheduling || showClearConfirm || clearing) return;
    if (!msg.event?.startsWith('wo_') && msg.event !== 'wo_bulk_clear') return;
    setLastWsAt(Date.now());
    // Granular: si viene el objeto wo completo, mergear directo.
    const updated = msg?.data?.wo;
    if (updated && updated.wo_id && msg.event !== 'wo_bulk_clear') {
      routeWOToBucket(updated);
      return;
    }
    // Fallback al refetch si el evento es sin payload o bulk clear.
    if (wsTimerRef.current) clearTimeout(wsTimerRef.current);
    wsTimerRef.current = setTimeout(() => { loadCalendarData(); loadGantt(); }, 3000);
  }, [showAIModal, aiScheduling, showClearConfirm, clearing, routeWOToBucket]));
  useEffect(() => { loadGantt(); }, [plant, ganttWeeks]);

  const handleUnscheduleWO = async (wo) => {
    // Optimistic UI: immediately move it out of scheduled, into released
    const prevScheduled = scheduledWOs;
    const prevReleased = releasedWOs;
    const cleared = { ...wo, assigned_workers: [], planned_start: null, planned_end: null, status: 'PLANIFICADO' };
    setScheduledWOs(prev => prev.filter(w => w.wo_id !== wo.wo_id));
    setReleasedWOs(prev => [cleared, ...prev.filter(w => w.wo_id !== wo.wo_id)]);
    try {
      await api.updateManagedWO(wo.wo_id, {
        assigned_workers: [],
        planned_start: '',
        planned_end: '',
        status: 'PLANIFICADO',
      });
      toast.success(`↩️ ${wo.wo_number} desprogramada`);
      // Refresh from backend to stay in sync
      await loadCalendarData();
      loadGantt();
    } catch (err) {
      // Rollback optimistic update
      setScheduledWOs(prevScheduled);
      setReleasedWOs(prevReleased);
      toast.error(`Error desprogramando ${wo.wo_number}: ${err.message || ''}`);
    }
  };

  const handleScheduleWO = (wo, tech, dayDate, shift = 'day') => {
    // 2-step flow: drag-drop = borrador (EN_PROGRAMACION). Reservar Semana lo confirma a PROGRAMADO.
    const prevScheduled = scheduledWOs;
    const prevReleased = releasedWOs;
    // SF-562: bloqueo de asignación en día de descanso del técnico.
    if (tech.available === false) {
      toast.error(`⛔ ${tech.name} está en descanso/vacaciones (${tech.absence_reason || 'no disponible'}). No se puede asignar.`);
      return;
    }
    // B3-FULL-2 Tanda B3 (David 2026-04-28, Magda transcript 392-394):
    // Constraint exclusividad equipo apoyo simultáneo. Si la OT requiere un
    // equipo (puente grúa, etc) y ya hay otra OT scheduled en el mismo
    // día+turno usando el mismo equipo, advertir antes de programar.
    const woEquip = Array.isArray(wo.support_equipment) ? wo.support_equipment : [];
    if (woEquip.length > 0) {
      const dayStr = toDateStr(dayDate);
      const conflicts = scheduledWOs.filter(other => {
        if (other.wo_id === wo.wo_id) return false;
        const otherDay = other.planned_start ? String(other.planned_start).slice(0, 10) : null;
        const otherShift = (other.shift || 'day').toLowerCase();
        if (otherDay !== dayStr || otherShift !== shift) return false;
        const otherEquip = Array.isArray(other.support_equipment) ? other.support_equipment : [];
        return woEquip.some(eq => otherEquip.includes(eq));
      });
      if (conflicts.length > 0) {
        const sharedEquip = woEquip.filter(eq =>
          conflicts.some(c => (c.support_equipment || []).includes(eq))
        );
        const conflictNames = conflicts.slice(0, 3).map(c => c.wo_number).join(', ');
        const proceed = window.confirm(
          `⚠️ Conflicto de equipo de apoyo\n\n` +
          `${wo.wo_number} requiere: ${sharedEquip.join(', ')}\n\n` +
          `Ya está(n) programadas en el mismo día/turno con el mismo equipo:\n` +
          `${conflictNames}${conflicts.length > 3 ? ` y ${conflicts.length - 3} más` : ''}\n\n` +
          `Si el equipo es único (ej. puente grúa de un galpón), no podrá ejecutarse en paralelo. ¿Programar igual?`
        );
        if (!proceed) return;
      }
    }
    // SF-562: detectar OTs que exceden la duración del turno y advertir
    // que el saldo deberá redistribuirse (turno noche o día siguiente).
    // Día/Noche = 12h cada uno; subterránea A/B/C = 8h.
    const shiftHours = (CAP.shiftDurationHours || 12);
    const woHours = parseFloat(wo.estimated_hours) || 0;
    if (woHours > shiftHours) {
      const overflow = woHours - shiftHours;
      // SF-562: en lugar de sólo avisar, abrimos wizard A/B después de programar.
      // Lo programamos primero (parte fits) y luego pedimos al planner qué hacer
      // con el saldo (turno noche, día siguiente, o ignorar).
      setTimeout(() => {
        setShiftOverflowWizard({ wo, tech, dayDate, shift, overflow, shiftHours, woHours });
      }, 400);
    }
    const scheduled = {
      ...wo,
      assigned_workers: [{ worker_id: tech.worker_id, name: tech.name, specialty: tech.specialty }],
      planned_start: toDateStr(dayDate),
      planned_end: toDateStr(dayDate),
      shift,
      status: 'EN_PROGRAMACION',
    };
    setReleasedWOs(prev => prev.filter(w => w.wo_id !== wo.wo_id));
    setScheduledWOs(prev => [...prev.filter(w => w.wo_id !== wo.wo_id), scheduled]);
    api.updateManagedWO(wo.wo_id, {
      assigned_workers: [{ worker_id: tech.worker_id, name: tech.name, specialty: tech.specialty }],
      planned_start: toDateStr(dayDate),
      planned_end: toDateStr(dayDate),
      shift: shift,
      status: 'EN_PROGRAMACION',
    })
      .then(() => {
        toast.success(`${wo.wo_number} → ${tech.name} · borrador`);
        loadCalendarData();
      })
      .catch(() => {
        setScheduledWOs(prevScheduled);
        setReleasedWOs(prevReleased);
        toast.error(`Error scheduling ${wo.wo_number}`);
      });
  };

  // Pure computation — builds a draft plan without persisting anything.
  const computeAIPlan = () => {
    // Jorge 2026-04-27: bug "Ninguna OT pudo programarse" — releasedWOs trae
    // CREADO/PLANIFICADO/LIBERADO (panel izquierdo "OTs a Programar"), pero
    // el set anterior solo aceptaba EN_PROGRAMACION/REPROGRAMADO → toSchedule
    // siempre quedaba vacío. Auto-Level se encarga de transicionar a
    // EN_PROGRAMACION en applyAIPlan, así que la entrada puede ser cualquier
    // estado pre-scheduling.
    const SCHEDULABLE = new Set([
      'CREADO', 'PLANIFICADO', 'LIBERADO',          // pre-scheduling
      'EN_PROGRAMACION', 'REPROGRAMADO',            // ya en programación
      'APROBADO',                                    // legacy
    ]);
    const toSchedule = (releasedWOs || []).filter(wo => SCHEDULABLE.has(wo.status));
    const techs = technicians || [];
    if (toSchedule.length === 0) return null;

      const viewedMonday = viewedWeekStart || getMonday(new Date());
      const numDays = 7;
      const weekDays = [];
      for (let d = 0; d < numDays; d++) {
        const day = new Date(viewedMonday);
        day.setDate(viewedMonday.getDate() + d);
        weekDays.push(day.toISOString().slice(0, 10));
      }

      // Working-days mask: 0=Mon … 6=Sun. Exclude weekends unless instructions request them
      // (this mirrors standard 5-day work week; shift-based schedules can drag manually).
      const instructions = aiInstructions.toLowerCase();
      const includeWeekendInPlan = /sabado|sábado|domingo|weekend|fin de semana|7x7|7 dias|todos los dias/.test(instructions);
      const workDayMask = [true, true, true, true, true, includeWeekendInPlan, includeWeekendInPlan]; // Mon-Sun

      // Sort by priority (P1 first) + apply AI instructions for priority override
      const prioOrder = { P1: 0, P2: 1, P3: 2, P4: 3 };
      toSchedule.sort((a, b) => {
        // If instructions mention specific WO, boost it to top
        const aBoost = instructions.includes((a.wo_number || '').toLowerCase()) ? -10 : 0;
        const bBoost = instructions.includes((b.wo_number || '').toLowerCase()) ? -10 : 0;
        // If instructions mention equipment, boost those
        const aEquipBoost = a.equipment_tag && instructions.includes((a.equipment_tag || '').toLowerCase()) ? -5 : 0;
        const bEquipBoost = b.equipment_tag && instructions.includes((b.equipment_tag || '').toLowerCase()) ? -5 : 0;
        return (prioOrder[a.priority_code] || 3) + aBoost + aEquipBoost - ((prioOrder[b.priority_code] || 3) + bBoost + bEquipBoost);
      });

      // Capacity-constrained auto-level.
      // If Settings has explicit dayShiftCount/nightShiftCount (Jorge's requirement),
      // use those to cap per-shift capacity. Otherwise fall back to the actual roster split.
      const dayTechCount = (CAP.dayShiftCount != null && CAP.dayShiftCount !== '')
        ? Number(CAP.dayShiftCount)
        : techs.filter(t => techShift(t) === 'day').length;
      const nightTechCount = (CAP.nightShiftCount != null && CAP.nightShiftCount !== '')
        ? Number(CAP.nightShiftCount)
        : techs.filter(t => techShift(t) === 'night').length;
      const effectiveTechs = Math.max(1, dayTechCount + nightTechCount);
      const maxHHPerDay = effectiveTechs * PROGRAMMABLE_HH_PER_DAY * (capacityLimit / 100);
      const dayLoad = [0, 0, 0, 0, 0, 0, 0]; // 7 days
      // Apply "keep X light" instructions — reduce capacity for that day
      const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const lightDays = dayNames.map((name, i) => instructions.includes(name) && (instructions.includes('light') || instructions.includes('libre') || instructions.includes('liviano')) ? 0.5 : 1);

      // Track per-technician daily load.
      // Jorge 2026-04-27 fix #5: normalizar la clave (worker_id || user_id || id).
      // Bug previo: si un tech tenía solo user_id, su load no se trackeaba y el
      // algoritmo lo veía siempre con 0h → todos los WOs caían sobre él (Pedro/Hugo
      // 99h/40h en la demo).
      const techKey = (t) => t.worker_id || t.user_id || t.id || '';
      const techDayLoad = {};
      techs.forEach(t => { const k = techKey(t); if (k) techDayLoad[k] = new Array(numDays).fill(0); });

      // ── Seed existing scheduled WOs so we don't overlap/exceed capacity ──
      // Distribute long WOs across multiple days (same as the placement logic).
      const weekStartStr = weekDays[0];
      const weekEndStr = weekDays[numDays - 1];
      const seedDailyCap = PROGRAMMABLE_HH_PER_DAY * (capacityLimit / 100);
      (scheduledWOs || []).forEach(wo => {
        const s = wo.planned_start ? (typeof wo.planned_start === 'string' ? wo.planned_start.slice(0, 10) : toDateStr(new Date(wo.planned_start))) : null;
        if (!s || s < weekStartStr || s > weekEndStr) return;
        const idx = weekDays.indexOf(s);
        if (idx < 0) return;
        const woHours = parseFloat(wo.estimated_hours) || 0;
        const workerId = (wo.assigned_workers || [])[0]?.worker_id;
        // Long WOs are distributed day-by-day (they appear as "continuation" in the UI)
        if (woHours > seedDailyCap) {
          let remaining = woHours;
          for (let d = idx; d < numDays && remaining > 0; d++) {
            const chunk = Math.min(remaining, seedDailyCap);
            dayLoad[d] += chunk;
            if (workerId && techDayLoad[workerId]) techDayLoad[workerId][d] += chunk;
            remaining -= chunk;
          }
        } else {
          dayLoad[idx] += woHours;
          if (workerId && techDayLoad[workerId]) techDayLoad[workerId][idx] += woHours;
        }
      });

      let scheduled = 0;
      let deferred = 0;
      const assignments = [];
      const deferredSupport = []; // WOs skipped because required support equipment is blocked

      // Group A #7 — Support equipment constraint.
      // Blocked tags (from state): if a WO requires one of these, defer it.
      // Per-day bookings: unique equipment types (MOBILE_CRANE, BRIDGE_CRANE) can
      // only be booked by one WO per day. Soft check by substring match on name.
      const blockedNames = new Set((blockedEquipment || []).map(e => (e.name || '').toLowerCase()));
      const UNIQUE_TYPES = ['MOBILE_CRANE', 'BRIDGE_CRANE', 'SCAFFOLDING'];
      const perDayBookings = Array.from({ length: numDays }, () => new Set());
      const requiresBlocked = (wo) => {
        const reqs = Array.isArray(wo.support_equipment) ? wo.support_equipment : [];
        for (const r of reqs) {
          const name = ((r && (r.tag || r.name)) || '').toLowerCase();
          if (!name) continue;
          for (const b of blockedNames) if (b && (name.includes(b) || b.includes(name))) return name;
        }
        return null;
      };
      const isDayBookableForSupport = (wo, day) => {
        const reqs = Array.isArray(wo.support_equipment) ? wo.support_equipment : [];
        for (const r of reqs) {
          const name = ((r && (r.tag || r.name)) || '').toLowerCase();
          const type = ((r && r.type) || '').toUpperCase();
          if (UNIQUE_TYPES.includes(type) && perDayBookings[day].has(type + ':' + name)) return false;
        }
        return true;
      };
      const bookSupportForDay = (wo, day) => {
        const reqs = Array.isArray(wo.support_equipment) ? wo.support_equipment : [];
        for (const r of reqs) {
          const name = ((r && (r.tag || r.name)) || '').toLowerCase();
          const type = ((r && r.type) || '').toUpperCase();
          if (UNIQUE_TYPES.includes(type)) perDayBookings[day].add(type + ':' + name);
        }
      };

      for (const wo of toSchedule) {
        // Hard-block: required equipment is out of service. Defer with reason.
        const blockedName = requiresBlocked(wo);
        if (blockedName) {
          deferred++;
          deferredSupport.push({ wo_number: wo.wo_number, reason: 'Equipo de apoyo fuera de servicio: ' + blockedName });
          continue;
        }
        const prio = wo.priority_code || 'P3';
        const hours = parseFloat(wo.estimated_hours) || 4;

        // Find best day respecting capacity limit + work-day mask + AI instructions
        let bestDay = -1;
        const workDays = Array.from({ length: numDays }, (_, i) => i).filter(i => workDayMask[i]);
        if (prio === 'P1') {
          bestDay = workDays[0] ?? 0;
        } else if (prio === 'P2') {
          const firstHalf = workDays.slice(0, Math.ceil(workDays.length / 2));
          bestDay = firstHalf.find(d => dayLoad[d] + hours <= maxHHPerDay * (lightDays[d] || 1));
          if (bestDay === undefined) bestDay = firstHalf.reduce((a, b) => dayLoad[a] <= dayLoad[b] ? a : b, firstHalf[0]);
        } else {
          const candidates = workDays.filter(d => dayLoad[d] + hours <= maxHHPerDay * (lightDays[d] || 1));
          if (candidates.length > 0) {
            bestDay = prio === 'P4' ? candidates[candidates.length - 1] : candidates.reduce((a, b) => dayLoad[a] <= dayLoad[b] ? a : b);
          }
        }

        if (bestDay < 0) {
          deferred++;
          continue; // Skip — would exceed capacity limit
        }

        // Match technician — 3 tiers: (1) specialty+capacity, (2) any tech+capacity, (3) defer
        const woSpec = (wo.work_center || wo.specialty || '').toUpperCase();
        const perTechDailyCap = PROGRAMMABLE_HH_PER_DAY * (capacityLimit / 100);
        // Weekly cap = daily × number of actual workdays (not 7) — matches the "36h/36h" UI indicator
        const workdaysInWeek = workDayMask.filter(Boolean).length;
        const perTechWeeklyCap = perTechDailyCap * workdaysInWeek;

        const hasSpecMatch = (t) => {
          const tSpec = (t.specialty || '').toUpperCase();
          return tSpec && woSpec && (tSpec.includes(woSpec.slice(0, 3)) || woSpec.includes(tSpec.slice(0, 3)));
        };
        // For WOs longer than a single day's capacity, we don't require the full
        // hours to fit in one day — they'll span multiple days visually (continuation).
        // We only enforce that the tech isn't already saturated this week.
        const isLongWO = hours > perTechDailyCap;
        const hasRoom = (t, day) => {
          const k = techKey(t);
          const dayLoadT = techDayLoad[k]?.[day] || 0;
          const weekLoadT = (techDayLoad[k] || []).reduce((s, v) => s + v, 0);
          // Weekly cap is ALWAYS enforced — no tech should exceed their weekly capacity
          if (weekLoadT + hours > perTechWeeklyCap) return false;
          if (isLongWO) {
            // Long WOs span days: require start day has some room, weekly cap already checked
            return dayLoadT < perTechDailyCap;
          }
          return dayLoadT + hours <= perTechDailyCap;
        };

        // Determinar requisitos de personal por especialidad (Jorge fix #6).
        // wo.resources = [{type:'MEC', quantity:2, hours:4}, {type:'ELEC', quantity:3, hours:4}]
        // Si no hay resources, default = 1 técnico de la especialidad del WO.
        const reqs = Array.isArray(wo.resources) && wo.resources.length > 0
          ? wo.resources.map(r => ({
              spec: String(r.type || r.specialty || woSpec || '').toUpperCase(),
              qty: Math.max(1, parseInt(r.quantity) || 1),
            }))
          : [{ spec: woSpec, qty: 1 }];
        const totalNeeded = reqs.reduce((s, r) => s + r.qty, 0);
        const specMatchFor = (t, reqSpec) => {
          const tSpec = (t.specialty || '').toUpperCase();
          if (!reqSpec) return true;
          return tSpec && (tSpec.includes(reqSpec.slice(0, 3)) || reqSpec.includes(tSpec.slice(0, 3)));
        };

        // Jorge 2026-04-27: Find best day with capacity para todos los techs requeridos.
        // 4 tiers en orden de exigencia:
        //   1. spec: full multi-tech con spec-match
        //   2. all:  full multi-tech con cualquier spec
        //   3. spec_single: 1 solo tech con spec-match (degradación si no entran todos)
        //   4. force: 1 solo tech, ignora dailyCap (sólo respeta weekly) — guarantee schedule
        // El tier 4 evita el "Ninguna OT pudo programarse" cuando hay sobrecarga
        // localizada: prefiere asignar overload visible a no programar nada.
        const dayOrder = [bestDay, ...workDays.filter(d => d !== bestDay)];
        let chosenTechs = [];
        let chosenDay = -1;
        const hasRoomLoose = (t, day) => {
          // Sólo respeta cap semanal — útil cuando el día está saturado pero
          // la semana del tech tiene espacio.
          const k = techKey(t);
          const weekLoadT = (techDayLoad[k] || []).reduce((s, v) => s + v, 0);
          return weekLoadT + hours <= perTechWeeklyCap;
        };
        outerSearch: for (const tier of ['spec', 'all', 'spec_single', 'force']) {
          // Para tiers single y force degradamos a 1 tech (totalNeeded=1).
          const isSingle = tier === 'spec_single' || tier === 'force';
          const effectiveReqs = isSingle ? [{ spec: woSpec, qty: 1 }] : reqs;
          const effectiveNeeded = isSingle ? 1 : totalNeeded;
          const checkRoom = tier === 'force' ? hasRoomLoose : hasRoom;
          const requireSpecMatch = tier === 'spec' || tier === 'spec_single';

          for (const day of dayOrder) {
            // Cap diaria global solo para tiers no-force.
            if (tier !== 'force' &&
                dayLoad[day] + hours * effectiveNeeded > maxHHPerDay * (lightDays[day] || 1)) continue;
            if (!isDayBookableForSupport(wo, day)) continue;
            const used = new Set();
            const picked = [];
            let satisfied = true;
            for (const req of effectiveReqs) {
              for (let i = 0; i < req.qty; i++) {
                const pool = techs.filter(t => {
                  const k = techKey(t);
                  if (used.has(k)) return false;
                  if (!checkRoom(t, day)) return false;
                  return requireSpecMatch ? specMatchFor(t, req.spec) : true;
                });
                if (pool.length === 0) { satisfied = false; break; }
                const pick = pool.reduce((a, b) => {
                  const aK = techKey(a), bK = techKey(b);
                  const aWk = (techDayLoad[aK] || []).reduce((s, v) => s + v, 0);
                  const bWk = (techDayLoad[bK] || []).reduce((s, v) => s + v, 0);
                  return aWk <= bWk ? a : b;
                });
                used.add(techKey(pick));
                picked.push({ tech: pick, spec: req.spec });
              }
              if (!satisfied) break;
            }
            if (satisfied && picked.length === effectiveNeeded) {
              chosenTechs = picked;
              chosenDay = day;
              break outerSearch;
            }
          }
        }

        if (chosenTechs.length === 0 || chosenDay < 0) {
          deferred++;
          continue;
        }
        bestDay = chosenDay;
        // Para compat con código abajo: bestTech = primero (el "principal").
        const bestTech = chosenTechs[0].tech;
        // NOW commit the hours — distribute across days for long WOs so no single day is double-counted.
        // A 48h WO with 7.2h/day cap spans ~7 days at 6.86h/day each, not 48h on one day.
        // Distribuir las horas a TODOS los técnicos asignados (cada uno trabaja
        // la duración del WO en paralelo). dayLoad refleja la suma de HH del equipo.
        for (const ct of chosenTechs) {
          const k = techKey(ct.tech);
          if (isLongWO) {
            let remaining = hours;
            const daysNeeded = Math.ceil(hours / perTechDailyCap);
            let placed = 0;
            for (let d = bestDay; d < numDays && placed < daysNeeded && remaining > 0; d++) {
              if (!workDayMask[d]) continue;
              const chunk = Math.min(remaining, perTechDailyCap);
              if (techDayLoad[k]) techDayLoad[k][d] += chunk;
              remaining -= chunk;
              placed++;
            }
          } else {
            if (techDayLoad[k]) techDayLoad[k][bestDay] += hours;
          }
        }
        dayLoad[bestDay] += hours * chosenTechs.length;

        // Group A #7: reserve the support equipment for this day so other
        // WOs with the same unique requirement get pushed to another day.
        bookSupportForDay(wo, bestDay);

        scheduled++;
        // Lista completa de workers asignados al WO (para applyAIPlan).
        const workers = chosenTechs.map(ct => ({
          worker_id: techKey(ct.tech),
          name: ct.tech.name || ct.tech.full_name || 'Unassigned',
          specialty: ct.tech.specialty || ct.spec || '',
        }));
        assignments.push({
          wo_id: wo.wo_id,
          wo_number: wo.wo_number,
          worker_id: workers[0]?.worker_id || null,  // legacy field
          worker_name: workers[0]?.name || 'Unassigned',
          worker_specialty: workers[0]?.specialty || '',
          workers,                                    // NEW: lista completa
          day: weekDays[bestDay],
          hours,
          priority: prio,
          reason: `${prio} ${hours}h × ${workers.length} téc`,
          support_equipment: Array.isArray(wo.support_equipment) ? wo.support_equipment.map(r => r.tag || r.name).filter(Boolean) : [],
        });
      }

      const weekLabel = `${weekDays[0]} to ${weekDays[4]}`;
      const peakLoad = maxHHPerDay > 0 ? Math.round((Math.max(...dayLoad) / maxHHPerDay) * 100) : 0;
      return {
        assignments,
        scheduled,
        deferred,
        deferredSupport, // Group A #7 — surface support-equipment conflicts
        peakLoad,
        weekLabel,
        viewedMonday,
        dayLoad,
        maxHHPerDay,
      };
  };

  // Persists the draft plan returned by computeAIPlan.
  const applyAIPlan = async (plan) => {
    if (!plan) return;
    setAiScheduling(true);
    setAiResult(null);
    let ok = 0, failed = 0;
    const failures = [];
    try {
      // Parallel batches of 10 for speed, but track each result
      const BATCH = 10;
      for (let i = 0; i < plan.assignments.length; i += BATCH) {
        const batch = plan.assignments.slice(i, i + BATCH);
        const results = await Promise.allSettled(batch.map(a => {
          // Auto-Level produces DRAFT (EN_PROGRAMACION). Planner must Reservar Semana to commit.
          const updateData = {
            planned_start: a.day,
            planned_end: a.day,
            status: 'EN_PROGRAMACION',
          };
          // Jorge fix #6: si Auto-Level produjo lista de workers (multi-tech), usarla.
          // Fallback al worker único legacy si la lista está vacía.
          if (Array.isArray(a.workers) && a.workers.length > 0) {
            updateData.assigned_workers = a.workers;
          } else if (a.worker_id) {
            updateData.assigned_workers = [{ worker_id: a.worker_id, name: a.worker_name, specialty: a.worker_specialty || '' }];
          }
          return api.updateManagedWO(a.wo_id, updateData);
        }));
        results.forEach((r, idx) => {
          if (r.status === 'fulfilled') ok++;
          else { failed++; failures.push({ wo: batch[idx].wo_number, err: r.reason?.message || 'unknown' }); }
        });
      }

      const weekNum = getISOWeek(plan.viewedMonday);
      const year = plan.viewedMonday.getFullYear();
      try { await api.createProgram({ plant_id: plant, week_number: weekNum, year }); } catch {}
      try { await api.autoGenerateTasks(plant); } catch {}

      const msg = failed === 0
        ? `✓ ${ok} OTs programadas · Peak ${plan.peakLoad}% · ${plan.deferred > 0 ? `${plan.deferred} diferidas` : 'todas dentro de capacidad'}`
        : `⚠️ ${ok} de ${plan.assignments.length} programadas · ${failed} fallaron${plan.deferred > 0 ? ` · ${plan.deferred} diferidas` : ''}`;
      if (failed === 0) toast.success(msg);
      else {
        toast.error(msg);
        console.warn('Auto-Level failures:', failures);
      }
      setAiResult({ assignments: plan.assignments.slice(0, ok), message: msg, failed, failures });
      // Jorge 2026-04-27: el reload anterior corría a 300ms — antes de que
      // backend committeara las 25 PUTs en cascada, así el calendario quedaba
      // mostrando 0 asignaciones. Refresh inmediato + dos retries (1500ms y
      // 3000ms) garantizan ver los assignments después del Auto-Level.
      const _refreshAll = () => {
        try { loadCalendarData(); } catch {}
        try { loadPrograms(); } catch {}
        try { loadGantt(); } catch {}
      };
      _refreshAll();
      setTimeout(_refreshAll, 1500);
      setTimeout(_refreshAll, 3000);
    } catch (e) {
      toast.error('Auto-level error: ' + (e.message || ''));
    } finally {
      setAiScheduling(false);
    }
  };

  const handleGenerate = () => {
    const now = new Date();
    const weekNum = Math.ceil(((now - new Date(now.getFullYear(), 0, 1)) / 86400000 + new Date(now.getFullYear(), 0, 1).getDay() + 1) / 7);
    setGenerating(true);
    api.createProgram({ plant_id: plant, week_number: weekNum, year: now.getFullYear() })
      .then(() => {
        toast.success(t('scheduling.programCreated'));
        loadPrograms();
        loadCalendarData();
        loadGantt();
      })
      .catch(() => toast.error(t('scheduling.programError')))
      .finally(() => setGenerating(false));
  };

  const handlePublish = () => {
    const activeProgram = programs[0];
    if (!activeProgram) return;
    setPublishing(true);
    api.publishProgram(activeProgram.program_id)
      .then(() => {
        toast.success(t('scheduling.programPublished'));
        loadPrograms();
      })
      .catch(() => toast.error('Error publishing program'))
      .finally(() => setPublishing(false));
  };

  const handleClosureSubmit = (order, ocrData) => {
    toast.success(`${t('scheduling.closureSubmitted')} — ${order.id}`);
    setWeeks(prev => prev.map(w => ({
      ...w,
      work_orders: w.work_orders.map(wo => wo.id === order.id ? { ...wo, status: 'COMPLETED', duration_actual: parseFloat(ocrData.actual_hours) || wo.duration_planned } : wo),
    })));
    setTimeout(() => setClosureOrder(null), 2000);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  const isTechnician = user?.role === 'tecnico';
  const activeProgramId = programs[0]?.program_id;
  const activeProgram = programs[0];
  const canPublish = activeProgram && !activeProgram.published_at && (activeProgram.status === 'FINAL' || activeProgram.status === 'ACTIVE');

  const TABS = [
    ...(isTechnician ? [{ id: 'inbox', icon: Inbox, label: t('scheduling.myInbox') }] : []),
    { id: 'schedule', icon: Calendar, label: t('scheduling.weeklySchedule') },
    { id: 'gantt', icon: BarChart3, label: t('scheduling.ganttView') },
    { id: 'masschange', icon: Wrench, label: 'Mass Change' },
    { id: 'hh', icon: Users, label: t('scheduling.hhBalance') },
    { id: 'materials', icon: Package, label: t('scheduling.materials') },
    { id: 'equipment', icon: Wrench, label: 'Equipos de Apoyo' },
  ];

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#1B5E20]/10 rounded-xl">
            <Calendar size={22} className="text-[#1B5E20] dark:text-green-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('scheduling.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('scheduling.subtitle')}</p>
          </div>
        </div>
        {!isTechnician && (
          <div className="flex items-center gap-2">
            {activeProgram?.published_at && (
              <span className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-lg text-xs font-medium text-emerald-700 dark:text-emerald-300">
                <Lock size={12} /> {t('scheduling.published')}
              </span>
            )}
            <div className="flex items-center gap-1 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg px-1">
              <select value={capacityLimit} onChange={e => setCapacityLimit(Number(e.target.value))}
                className="text-xs bg-transparent text-purple-700 dark:text-purple-300 font-semibold py-2 px-1 focus:outline-none cursor-pointer"
                title="Max capacity % for auto-leveling">
                {[70, 75, 80, 85, 90, 95, 100].map(v => <option key={v} value={v}>{v}%</option>)}
              </select>
              <button
                onClick={() => {
                  const wos = (releasedWOs || []).length;
                  const techs = technicians.length;
                  if (wos === 0) { toast.info('No WOs to schedule'); return; }
                  if (techs === 0) { toast.error('No technicians available — cannot auto-level'); return; }
                  setShowAIModal(true);
                }}
                disabled={aiScheduling}
                className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {aiScheduling ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {aiScheduling ? 'Leveling...' : 'Auto-Level'}
              </button>
            </div>
            <button
              onClick={async () => {
                const now = new Date();
                const weekNumber = (() => {
                  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
                  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
                  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
                  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
                })();
                toast.info(`Generando programa semana ${weekNumber}/${now.getFullYear()} desde backlog…`);
                try {
                  const res = await api.agenticAutoSchedule({
                    plant_id: plant,
                    week_number: weekNumber,
                    year: now.getFullYear(),
                    include_preventive: true,
                    respect_shutdowns: true,
                  });
                  const r = res?.result || res;
                  const conflicts = r?.conflicts_count ?? (r?.conflicts || []).length ?? 0;
                  const items = r?.program?.total_items || r?.gantt?.length || 0;
                  if (!r?.program_id) {
                    toast.info(r?.summary || 'Sin items para programar esta semana');
                  } else {
                    toast.success(
                      <div className="text-xs">
                        <div className="font-bold mb-1">Programa DRAFT generado</div>
                        <div>ID: <span className="font-mono">{r.program_id}</span></div>
                        <div>{items} OTs programadas · {conflicts} conflictos</div>
                        {r.ai_recommendations && <div className="mt-1 text-amber-600">⚠️ IA detectó sobrecarga — ver recomendaciones</div>}
                      </div>,
                      10000
                    );
                  }
                } catch (e) {
                  toast.error('Error generando programa: ' + (e.message || ''));
                }
              }}
              className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
              title="Generar programa semanal desde backlog (SF-344)"
            >
              <Sparkles size={16} />
              Auto-Schedule
            </button>
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              <Trash2 size={16} /> Clear Assignments
            </button>
          </div>
        )}
      </div>

      {/* Tab Selector */}
      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {TABS.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${tab === id ? 'border-[#1B5E20] text-[#1B5E20] dark:text-green-400' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {/* AI Result Banner */}
      {aiResult && (
        <div className={"border rounded-xl p-4 " + (aiResult.assignments?.length > 0 ? "bg-purple-50 border-purple-200" : "bg-gray-50 border-gray-200")}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-purple-600" />
              <span className="text-sm font-semibold text-purple-800">{aiResult.message}</span>
            </div>
            <button onClick={() => setAiResult(null)} className="text-gray-400 hover:text-gray-600 text-xs">Dismiss</button>
          </div>
          {aiResult.assignments?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {aiResult.assignments.map((a, i) => (
                <span key={i} className="text-xs bg-white border border-purple-200 rounded-lg px-2 py-1">
                  <span className="font-mono font-bold text-purple-700">{a.wo_number}</span>
                  <span className="text-gray-500 mx-1">&rarr;</span>
                  <span className="text-gray-700">{a.worker_name}</span>
                  {a.reason && <span className="text-gray-400 ml-1">({a.reason})</span>}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content */}
      {tab === 'inbox' && (
        <TechnicianInbox weeks={weeks} user={user} t={t} onOpenDetail={setDetailOrder} onOpenClosure={setClosureOrder} />
      )}
      {tab === 'schedule' && (
        <WeeklyCalendarView
          technicians={technicians}
          releasedWOs={releasedWOs}
          scheduledWOs={scheduledWOs}
          t={t}
          onScheduleWO={handleScheduleWO}
          onUnscheduleWO={handleUnscheduleWO}
          onRefresh={() => { loadCalendarData(); loadPrograms(); loadGantt(); }}
          onPublish={handlePublish}
          publishing={publishing}
          canPublish={canPublish}
          onWeekChange={setViewedWeekStart}
          onAutoLevel={() => setShowAIModal(true)}
          onOpenDetail={setDetailOrder}
          lastWsAt={lastWsAt}
        />
      )}
      {tab === 'gantt' && (
        <GanttTab ganttData={ganttData} t={t} weeksRange={ganttWeeks} onWeeksChange={setGanttWeeks}
          onReschedule={(wo, newStart, newEnd) => {
            api.updateManagedWO(wo.wo_id, { planned_start: newStart, planned_end: newEnd })
              .then(() => { toast.success(`${wo.wo_number} → ${newStart}`); loadGantt(); loadCalendarData(); })
              .catch(() => toast.error(`Error rescheduling ${wo.wo_number}`));
          }} />
      )}
      {tab === 'masschange' && (
        <MassChangeTab scheduledWOs={scheduledWOs} releasedWOs={releasedWOs} t={t} plantId={plant}
          onRefresh={() => { loadCalendarData(); loadGantt(); }} />
      )}
      {tab === 'hh' && (
        <HHBalanceTab programId={activeProgramId} t={t} plantId={plant} />
      )}
      {tab === 'materials' && (
        <MaterialsTab programId={activeProgramId} t={t} plantId={plant} />
      )}
      {tab === 'equipment' && (
        <SupportEquipmentTab plantId={plant} t={t} />
      )}

      {/* Open WOs bottom bar — inspirado en mockup Jorge: cola de prioridad
          siempre visible sobre el Scheduling tab. Requested-By: Jorge Cabezas. */}
      {tab === 'schedule' && releasedWOs && releasedWOs.length > 0 && (() => {
        const PRIO_ORDER = { P1: 0, P2: 1, P3: 2, P4: 3 };
        const unscheduled = [...releasedWOs]
          .filter(w => !w.planned_start || w.status === 'LIBERADO' || w.status === 'PLANIFICADO')
          .sort((a, b) => (PRIO_ORDER[a.priority_code] ?? 4) - (PRIO_ORDER[b.priority_code] ?? 4));
        if (unscheduled.length === 0) return null;
        const next = unscheduled[0];
        const prioTone = (p) => p === 'P1' ? 'bg-red-500 text-white'
          : p === 'P2' ? 'bg-orange-500 text-white'
          : p === 'P3' ? 'bg-blue-500 text-white'
          : 'bg-gray-400 text-white';
        return (
          <div className="sticky bottom-3 left-0 right-0 z-30 mt-3 px-3 pointer-events-none"
            style={{ animation: 'slideUp 220ms ease-out both' }}>
            <div className="mx-auto w-fit max-w-full rounded-full bg-slate-900 dark:bg-slate-950 text-slate-100 shadow-xl ring-1 ring-white/5 pointer-events-auto">
              <div className="flex items-center gap-1 pl-2.5 pr-1 py-1 min-w-0">
                <span className="shrink-0 inline-flex items-center gap-1 pr-2 border-r border-white/10">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold flex items-center justify-center">{unscheduled.length}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Open</span>
                </span>
                <div className="flex-1 min-w-0 flex items-center gap-1 overflow-x-auto scrollbar-none max-w-[60vw]">
                  {unscheduled.slice(0, 12).map((wo) => {
                    const badgeTone = wo.priority_code === 'P1' ? 'bg-red-500 text-white'
                      : wo.priority_code === 'P2' ? 'bg-amber-400 text-slate-900'
                      : wo.priority_code === 'P3' ? 'bg-sky-400 text-slate-900'
                      : 'bg-slate-500 text-white';
                    return (
                      <button key={wo.wo_id}
                        onClick={() => setDetailOrder(wo)}
                        className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-slate-800/70 hover:bg-slate-700 px-2 py-0.5 transition-colors"
                        title={`${wo.wo_number} · ${wo.description || ''}`}>
                        <span className={`text-[8.5px] font-bold px-1 py-[1px] rounded-full ${badgeTone}`}>{wo.priority_code || 'P4'}</span>
                        <span className="text-[10.5px] font-semibold text-slate-100 truncate max-w-[110px]">
                          {(wo.description || wo.equipment_tag || wo.wo_number || '').slice(0, 22)}
                        </span>
                      </button>
                    );
                  })}
                  {unscheduled.length > 12 && (
                    <span className="shrink-0 text-[9.5px] text-slate-400 px-1.5">+{unscheduled.length - 12}</span>
                  )}
                </div>
                <button
                  onClick={() => setDetailOrder(next)}
                  className="shrink-0 inline-flex items-center gap-1 bg-emerald-500 hover:bg-emerald-400 text-slate-900 text-[10.5px] font-black px-2.5 py-1 rounded-full shadow transition-colors">
                  <Plus size={11} strokeWidth={3} />
                  Open WO
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modals */}
      {detailOrder && (
        <WODetailModal order={detailOrder} t={t} onClose={() => setDetailOrder(null)}
          onClosureClick={(o) => { setDetailOrder(null); setClosureOrder(o); }} />
      )}
      {closureOrder && (
        <OCRClosureModal order={closureOrder} t={t} onClose={() => setClosureOrder(null)} onSubmit={handleClosureSubmit} />
      )}
      {/* AI Auto-Level Modal */}
      {showAIModal && (() => {
        const wos = releasedWOs || [];
        const prioCount = wos.reduce((a, w) => { const p = w.priority_code || 'P4'; a[p] = (a[p] || 0) + 1; return a; }, {});
        const specHours = wos.reduce((a, w) => {
          const s = (w.work_center || w.specialty || 'OTRA').toUpperCase().slice(0, 4);
          a[s] = (a[s] || 0) + (parseFloat(w.estimated_hours) || 4);
          return a;
        }, {});
        const totalHours = Object.values(specHours).reduce((a, b) => a + b, 0);
        const weekCapacity = technicians.length * PROGRAMMABLE_HH_PER_DAY * 7 * (capacityLimit / 100);
        const fitPct = weekCapacity > 0 ? Math.round((totalHours / weekCapacity) * 100) : 0;
        const wontFit = Math.max(0, totalHours - weekCapacity);
        const wontFitWOs = weekCapacity > 0 && totalHours > weekCapacity ? Math.round(wos.length * (wontFit / totalHours)) : 0;
        const PRIO_COLORS = { P1: 'bg-red-100 text-red-700', P2: 'bg-orange-100 text-orange-700', P3: 'bg-blue-100 text-blue-700', P4: 'bg-gray-100 text-gray-600' };
        const CHIPS = [
          { label: 'Priorizar P1/P2', text: 'Priorizar todas las OTs P1 y P2 al inicio de la semana.' },
          { label: 'Viernes liviano', text: 'Dejar el viernes liviano para atender imprevistos.' },
          { label: 'Distribuir Lun-Mié', text: 'Distribuir el trabajo mecánico pesado entre Lunes y Miércoles.' },
          { label: 'Noche ligero', text: 'Mantener la carga del turno noche baja; dotación reducida.' },
          { label: 'Respetar especialidad', text: 'Asignar solo a técnicos cuya especialidad coincida con la OT.' },
          { label: 'Incluir fin de semana', text: 'Incluir sábado y domingo en la programación (turnos 7x7).' },
        ];
        const addChip = (txt) => setAiInstructions(prev => prev ? (prev.trim() + ' ' + txt) : txt);
        return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !aiScheduling && setShowAIModal(false)} />
          <div className="relative z-10 bg-white dark:bg-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Sparkles size={18} className="text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold">Auto-Level con IA</h3>
                <p className="text-xs text-gray-500">
                  {wos.length} OTs · {technicians.length} técnicos · {totalHours.toFixed(0)}h totales
                  {(CAP.dayShiftCount != null || CAP.nightShiftCount != null) && (
                    <span className="ml-1 text-purple-600">(☀️ {CAP.dayShiftCount ?? '—'} día · 🌙 {CAP.nightShiftCount ?? '—'} noche)</span>
                  )}
                </p>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${fitPct > 100 ? 'bg-red-100 text-red-700' : fitPct > 85 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {fitPct}% carga
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Pre-analysis — priority breakdown */}
              <div>
                <div className="text-[10px] font-bold text-gray-500 uppercase mb-1.5">Por prioridad</div>
                <div className="flex flex-wrap gap-1.5">
                  {['P1', 'P2', 'P3', 'P4'].map(p => prioCount[p] > 0 && (
                    <span key={p} className={`text-xs font-semibold px-2 py-1 rounded ${PRIO_COLORS[p]}`}>
                      {p}: {prioCount[p]}
                    </span>
                  ))}
                </div>
              </div>

              {/* Specialty capacity bars */}
              <div>
                <div className="text-[10px] font-bold text-gray-500 uppercase mb-1.5">Carga por especialidad vs capacidad semanal</div>
                <div className="space-y-1">
                  {Object.entries(specHours).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([spec, h]) => {
                    const techsOfSpec = technicians.filter(t => (t.specialty || '').toUpperCase().startsWith(spec.slice(0, 3))).length || 1;
                    const cap = techsOfSpec * PROGRAMMABLE_HH_PER_DAY * 7 * (capacityLimit / 100);
                    const pct = cap > 0 ? Math.min(150, (h / cap) * 100) : 0;
                    const over = pct > 100;
                    return (
                      <div key={spec} className="flex items-center gap-2 text-xs">
                        <span className="w-12 font-mono font-bold text-gray-700 dark:text-gray-300">{spec}</span>
                        <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden relative">
                          <div className={`h-full ${over ? 'bg-red-500' : pct > 85 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, pct)}%` }} />
                          {over && <div className="absolute right-0 top-0 h-full bg-red-700" style={{ width: `${Math.min(50, pct - 100)}%` }} />}
                        </div>
                        <span className={`w-20 text-right tabular-nums ${over ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                          {h.toFixed(0)}h / {cap.toFixed(0)}h
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Capacity slider */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <label className="font-bold text-gray-500 uppercase text-[10px]">Capacidad máxima</label>
                  <span className="font-bold text-purple-700">{capacityLimit}% · {Math.round(PROGRAMMABLE_HH_PER_DAY * (capacityLimit / 100))}h/persona/día</span>
                </div>
                <input type="range" min={60} max={100} step={5} value={capacityLimit}
                  onChange={e => setCapacityLimit(Number(e.target.value))}
                  className="w-full accent-purple-600" />
                <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                  <span>60%</span><span>70%</span><span>80%</span><span>90%</span><span>100%</span>
                </div>
              </div>

              {/* Blocked equipment warning */}
              {blockedEquipment.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-300 dark:border-amber-700 rounded-lg p-3 flex gap-2 text-xs">
                  <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-amber-800 dark:text-amber-200">
                    <div className="font-semibold mb-0.5">{blockedEquipment.length} equipo{blockedEquipment.length > 1 ? 's' : ''} de apoyo fuera de servicio</div>
                    <div className="flex flex-wrap gap-1 mb-1">
                      {blockedEquipment.slice(0, 5).map(eq => (
                        <span key={eq.equipment_id} className="bg-white/60 dark:bg-amber-950/40 border border-amber-300 rounded px-1.5 py-0.5">
                          🔒 {eq.name}{eq.out_of_service_reason ? ` · ${eq.out_of_service_reason}` : ''}
                        </span>
                      ))}
                      {blockedEquipment.length > 5 && <span className="opacity-70">+{blockedEquipment.length - 5} más</span>}
                    </div>
                    <div className="text-[10px] opacity-80">El Auto-Level diferirá OTs que requieran equipos fuera de servicio y distribuirá OTs con grúa/scaffolding en días distintos (máx 1/día).</div>
                  </div>
                </div>
              )}

              {/* Quick instruction chips */}
              <div>
                <div className="text-[10px] font-bold text-gray-500 uppercase mb-1.5">Instrucciones rápidas</div>
                <div className="flex flex-wrap gap-1.5">
                  {CHIPS.map(c => (
                    <button key={c.label} type="button" onClick={() => addChip(c.text)}
                      className="text-xs px-2.5 py-1 rounded-full border border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 transition-colors">
                      + {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Free-text instructions */}
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Contexto adicional (opcional)</label>
                <textarea value={aiInstructions} onChange={e => setAiInstructions(e.target.value)}
                  placeholder='Ej: "Prioriza OT-2026-00031", "adelantar paradas en equipo 1210EF0014"...'
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 min-h-[70px] bg-background text-foreground" />
              </div>

              {/* Plan preview */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Preview del plan</span>
                  {wontFitWOs > 0 && (
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded">
                      ~{wontFitWOs} OTs no entrarán
                    </span>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  {wos.length} OTs → {technicians.length} técnicos al {capacityLimit}% · {Math.round(PROGRAMMABLE_HH_PER_DAY * (capacityLimit / 100))}h/persona/día
                </p>
                <p className="text-gray-500 text-[11px]">El plan se mostrará para tu aprobación antes de aplicarse.</p>
              </div>
            </div>

            <div className="p-4 border-t flex gap-3">
              <button onClick={() => { setShowAIModal(false); setAiInstructions(''); setAiResult(null); }}
                className="flex-1 py-2.5 text-sm font-semibold border border-gray-300 rounded-xl text-gray-700 dark:text-foreground hover:bg-gray-50 dark:hover:bg-muted">
                Cancelar
              </button>
              <button onClick={() => {
                  const plan = computeAIPlan();
                  if (!plan || plan.assignments.length === 0) {
                    toast.info('Ninguna OT pudo programarse con la capacidad actual');
                    return;
                  }
                  setAiDraftPlan(plan);
                  setShowAIModal(false);
                }} disabled={aiScheduling || wos.length === 0}
                className="flex-1 py-2.5 text-sm font-semibold bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-40 flex items-center justify-center gap-2">
                <Sparkles size={14} />
                Generar Plan
              </button>
            </div>
          </div>
        </div>
        );
      })()}

      {/* AI Draft Plan Review Modal — shown BEFORE applying anything */}
      {aiDraftPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !aiScheduling && setAiDraftPlan(null)} />
          <div className="relative z-10 bg-white dark:bg-card rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Sparkles size={18} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Plan borrador — Revisa antes de aplicar</h3>
                  <p className="text-xs text-gray-500">{aiDraftPlan.weekLabel} · Peak {aiDraftPlan.peakLoad}%</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-emerald-700">{aiDraftPlan.scheduled}</div>
                  <div className="text-emerald-600">Programadas</div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-amber-700">{aiDraftPlan.deferred}</div>
                  <div className="text-amber-600">Diferidas (sobre capacidad)</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-purple-700">{aiDraftPlan.peakLoad}%</div>
                  <div className="text-purple-600">Carga pico</div>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {/* Group A #7 — equipment blockers before the assignments list */}
              {Array.isArray(aiDraftPlan.deferredSupport) && aiDraftPlan.deferredSupport.length > 0 && (
                <div className="mb-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg px-3 py-2.5 text-xs">
                  <div className="font-bold text-rose-800 dark:text-rose-300 mb-1">
                    {aiDraftPlan.deferredSupport.length} OT{aiDraftPlan.deferredSupport.length > 1 ? 's' : ''} diferida{aiDraftPlan.deferredSupport.length > 1 ? 's' : ''} por equipo de apoyo
                  </div>
                  <div className="space-y-0.5 text-rose-700 dark:text-rose-300">
                    {aiDraftPlan.deferredSupport.slice(0, 8).map((d, i) => (
                      <div key={i}>• <span className="font-mono font-semibold">{d.wo_number}</span> — {d.reason}</div>
                    ))}
                    {aiDraftPlan.deferredSupport.length > 8 && <div className="opacity-70">+{aiDraftPlan.deferredSupport.length - 8} más</div>}
                  </div>
                </div>
              )}
              <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Asignaciones propuestas ({aiDraftPlan.assignments.length})</div>
              <div className="space-y-1">
                {aiDraftPlan.assignments.map((a, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${a.priority === 'P1' ? 'bg-red-100 text-red-700' : a.priority === 'P2' ? 'bg-orange-100 text-orange-700' : a.priority === 'P3' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{a.priority}</span>
                    <span className="font-mono font-bold text-purple-700 min-w-[120px]">{a.wo_number}</span>
                    <span className="text-gray-400">→</span>
                    <span className="flex-1 text-gray-700 dark:text-gray-300">{a.worker_name}</span>
                    <span className="text-xs text-gray-500">{a.day}</span>
                    <span className="text-xs font-semibold text-gray-600">{a.hours}h</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t flex gap-3">
              <button onClick={() => setAiDraftPlan(null)} disabled={aiScheduling}
                className="flex-1 py-2.5 text-sm font-semibold border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                Descartar
              </button>
              <button onClick={() => { setShowAIModal(true); setAiDraftPlan(null); }} disabled={aiScheduling}
                className="flex-1 py-2.5 text-sm font-semibold border border-purple-300 rounded-xl text-purple-700 hover:bg-purple-50 disabled:opacity-50">
                Ajustar contexto
              </button>
              <button onClick={async () => { const plan = aiDraftPlan; setAiDraftPlan(null); await applyAIPlan(plan); setAiInstructions(''); }}
                disabled={aiScheduling}
                className="flex-1 py-2.5 text-sm font-semibold bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-40 flex items-center justify-center gap-2">
                {aiScheduling ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                Aceptar plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Assignments Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => !clearing && setShowClearConfirm(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center" onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Clear Week Assignments</h3>
            <p className="text-sm text-gray-500 mb-1">Remove assignments for <span className="font-bold text-red-600">this week only</span>?</p>
            <p className="text-xs text-gray-400 mb-6">Only WOs scheduled within the viewed week will be cleared.<br/>Status will return to PLANNED.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowClearConfirm(false)} disabled={clearing}
                className="flex-1 py-2.5 px-4 text-sm font-semibold border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                Cancel
              </button>
              <button disabled={clearing} onClick={async () => {
                setClearing(true);
                try {
                  const weekMon = viewedWeekStart || getMonday(new Date());
                  const weekSun = addDays(weekMon, 6);
                  // Single batch API call — clears all WOs in one DB operation
                  const result = await api.clearWeekAssignments({
                    plant_id: plant,
                    week_start: toDateStr(weekMon),
                    week_end: toDateStr(weekSun),
                  });
                  const cleared = result?.cleared || 0;
                  toast.success(`${cleared} assignments cleared`);
                  loadCalendarData();
                  loadPrograms();
                } catch { toast.error('Error clearing'); }
                finally { setClearing(false); setShowClearConfirm(false); }
              }}
                className="flex-1 py-2.5 px-4 text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {clearing ? <><Loader2 size={14} className="animate-spin" /> Clearing...</> : 'Yes, clear all'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
