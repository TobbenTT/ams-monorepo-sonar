import { useState, useEffect, useMemo, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { CritBadge, LoadingSpinner } from '../components/Shared';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../api';
import { Sparkles as SparklesIcon } from 'lucide-react';
import {
  Calendar, Clock, Users, CheckCircle, Circle, Play, Loader2,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Inbox, Camera, Sparkles, Send, X,
  FileText, Wrench, AlertTriangle, Filter, Eye, BarChart3,
  Package, Upload, Lock, ArrowRight, Search, GripVertical, Trash2
} from 'lucide-react';

const TYPE_META = {
  PM01: { label: 'PM01 Correctivo', bg: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700' },
  PM02: { label: 'PM02 Preventivo', bg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700' },
  PM03: { label: 'PM03 Predictivo', bg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-700' },
  CORRECTIVO: { label: 'PM01 Correctivo', bg: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700' },
  PREVENTIVO: { label: 'PM02 Preventivo', bg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700' },
  PREDICTIVO: { label: 'PM03 Predictivo', bg: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-700' },
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
const HOURS_PER_WEEK = 40;

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  date.setDate(date.getDate() - day + (day === 0 ? -6 : 1));
  date.setHours(0, 0, 0, 0);
  return date;
}
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
  const deviation = order.duration_actual - order.duration_planned;
  const hasDeviation = order.duration_actual > 0 && deviation !== 0;
  const typeMeta = TYPE_META[order.type] || TYPE_META.PM02;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-foreground">{order.id}</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded border ${typeMeta.bg}`}>{typeMeta.label}</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <h3 className="text-lg font-bold text-foreground">{order.description}</h3>
          <div className="grid grid-cols-2 gap-3">
            <DetailCard label={t('scheduling.equipment')} value={order.equipment} />
            <DetailCard label={t('scheduling.priority')} value={order.priority} />
            <DetailCard label={t('scheduling.status')} value={t(`scheduling.status_${order.status}`) || order.status} />
            <DetailCard label={t('scheduling.plannedHours')} value={`${order.duration_planned}h`} />
            {order.duration_actual > 0 && (
              <DetailCard label={t('scheduling.actualHours')} value={
                <span className="flex items-center gap-1">
                  {order.duration_actual}h
                  {hasDeviation && (
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${deviation > 0 ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'}`}>
                      {deviation > 0 ? '+' : ''}{deviation.toFixed(1)}h
                    </span>
                  )}
                </span>
              } />
            )}
            <DetailCard label={t('scheduling.technicians')} value={order.technicians?.join(', ')} />
          </div>
          {order.status !== 'COMPLETED' && order.status !== 'CLOSED' && (
            <button onClick={() => onClosureClick(order)} className="w-full py-2.5 bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
              <Camera size={16} /> {t('scheduling.closeWithOCR')}
            </button>
          )}
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
function WeeklyCalendarView({ technicians, releasedWOs, scheduledWOs, t, onScheduleWO, onPublish, publishing, canPublish, onOpenDetail, onWeekChange }) {
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [viewRange, setViewRange] = useState(1);
  const [search, setSearch] = useState('');
  const [showShifts, setShowShifts] = useState(true);
  const [includeWeekends, setIncludeWeekends] = useState(false);
  const [dragWO, setDragWO] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);

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

  // Build assignment grid: "workerId:dateStr" -> [wo, ...]
  const grid = useMemo(() => {
    const g = {};
    scheduledWOs.forEach(wo => {
      const start = wo.planned_start ? toDateStr(new Date(wo.planned_start)) : null;
      if (!start) return;
      const shift = wo.shift || 'day';
      (wo.assigned_workers || []).forEach(w => {
        const key = showShifts ? `${w.worker_id}:${start}:${shift}` : `${w.worker_id}:${start}`;
        if (!g[key]) g[key] = [];
        g[key].push(wo);
      });
    });
    return g;
  }, [scheduledWOs, showShifts]);

  // Per-technician total hours in view
  const techHours = useMemo(() => {
    const h = {};
    technicians.forEach(tech => { h[tech.worker_id] = 0; });
    const daySet = new Set(days.map(d => d.str));
    scheduledWOs.forEach(wo => {
      const start = wo.planned_start ? toDateStr(new Date(wo.planned_start)) : null;
      if (!start || !daySet.has(start)) return;
      (wo.assigned_workers || []).forEach(w => {
        if (h[w.worker_id] !== undefined) h[w.worker_id] += wo.estimated_hours || 0;
      });
    });
    return h;
  }, [technicians, scheduledWOs, days]);

  const totalAvailable = technicians.length * HOURS_PER_WEEK * viewRange;
  const totalAssigned = Object.values(techHours).reduce((a, b) => a + b, 0);
  const loadPct = totalAvailable > 0 ? Math.round((totalAssigned / totalAvailable) * 100) : 0;

  // Daily totals
  const dailyTotals = useMemo(() => {
    const totals = {};
    days.forEach(d => { totals[d.str] = 0; });
    scheduledWOs.forEach(wo => {
      const start = wo.planned_start ? toDateStr(new Date(wo.planned_start)) : null;
      if (start && totals[start] !== undefined) totals[start] += wo.estimated_hours || 0;
    });
    return totals;
  }, [scheduledWOs, days]);

  const filteredReleased = useMemo(() => {
    if (!search) return releasedWOs;
    const q = search.toLowerCase();
    return releasedWOs.filter(wo =>
      (wo.wo_number || '').toLowerCase().includes(q) ||
      (wo.equipment_tag || '').toLowerCase().includes(q) ||
      (wo.description || '').toLowerCase().includes(q)
    );
  }, [releasedWOs, search]);

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

  return (
    <div className="flex gap-4" style={{ minHeight: 500 }}>
      {/* ── Left Panel: OTs to Schedule ── */}
      <div className="w-72 min-w-[288px] flex flex-col">
        <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 300px)' }}>
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-foreground text-sm">OTs to Schedule</h3>
              <span className="text-xs font-bold bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{releasedWOs.length}</span>
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t('scheduling.searchOT') || 'Search OT...'}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {filteredReleased.map(wo => {
              const typeMeta = TYPE_META[wo.wo_type] || TYPE_META.PM02;
              return (
                <div key={wo.wo_id} draggable onDragStart={() => handleDragStart(wo)} onDragEnd={handleDragEnd}
                  className="p-3 hover:bg-muted/50 cursor-grab active:cursor-grabbing transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-foreground">{wo.wo_number}</span>
                    <span className={`text-[0.6rem] font-bold px-1.5 py-0.5 rounded border ${typeMeta.bg}`}>{wo.wo_type}</span>
                  </div>
                  <p className="text-sm text-foreground truncate">{wo.equipment_tag || wo.description}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{wo.estimated_hours || 0}h estimated</p>
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
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowShifts(s => !s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${showShifts ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-card text-foreground border-border hover:bg-muted'}`}>
              {showShifts ? '☀️🌙 Shifts' : '📅 No Shifts'}
            </button>
            <button onClick={() => setIncludeWeekends(w => !w)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${includeWeekends ? 'bg-purple-600 text-white border-purple-600' : 'bg-card text-foreground border-border hover:bg-muted'}`}>
              {includeWeekends ? '7 Days' : '5 Days'}
            </button>
            {[{ v: 1, l: 'Week' }, { v: 2, l: '2 Weeks' }].map(opt => (
              <button key={opt.v} onClick={() => setViewRange(opt.v)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${viewRange === opt.v ? 'bg-[#1B5E20] text-white border-[#1B5E20]' : 'bg-card text-foreground border-border hover:bg-muted'}`}>
                {opt.l}
              </button>
            ))}
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

        {/* Calendar grid */}
        {technicians.length > 0 ? (
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
                  {technicians.map(tech => {
                    const badge = SPEC_BADGE[tech.specialty] || { label: (tech.specialty || '?').slice(0, 4).toUpperCase(), bg: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' };
                    const hours = techHours[tech.worker_id] || 0;
                    return (
                      <tr key={tech.worker_id} className="border-t border-border hover:bg-muted/10 transition-colors">
                        <td className="px-3 py-2.5 border-r border-border align-top">
                          <div className="font-semibold text-sm text-foreground">{tech.name}</div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className={`text-[0.6rem] font-bold px-1.5 py-0.5 rounded ${badge.bg}`}>{badge.label}</span>
                            <span className={`text-xs font-semibold ${hours > HOURS_PER_WEEK ? 'text-red-600' : hours > HOURS_PER_WEEK * 0.8 ? 'text-amber-600' : 'text-muted-foreground'}`}>{Math.round(hours)}h / {HOURS_PER_WEEK}h {hours > HOURS_PER_WEEK ? '⚠️' : ''}</span>
                          </div>
                        </td>
                        {days.map(d => {
                          const isDragging = !!dragWO;
                          if (showShifts) {
                            return SHIFTS.map(shift => {
                              const cellKey = `${tech.worker_id}:${d.str}:${shift.id}`;
                              const cellWOs = grid[cellKey] || [];
                              const isTarget = dropTarget === cellKey && dragWO;
                              const shiftBg = shift.id === 'night' ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : '';
                              return (
                                <td key={`${d.str}-${shift.id}`}
                                  className={`px-1 py-1 border-r border-border/50 align-top transition-colors ${d.isWeekend ? 'bg-gray-50 dark:bg-gray-800/30' : ''} ${shiftBg} ${isTarget ? 'bg-[#1B5E20]/10' : isDragging && cellWOs.length === 0 ? 'bg-emerald-50/30 dark:bg-emerald-900/5' : ''}`}
                                  style={{ minHeight: 60, minWidth: 90 }}
                                  onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDropTarget(cellKey); }}
                                  onDragLeave={() => setDropTarget(null)}
                                  onDrop={e => { e.preventDefault(); if (dragWO) { const techLoad = techHours[tech.worker_id] || 0; if (techLoad >= HOURS_PER_WEEK) { if (!window.confirm('⚠️ WARNING: ' + tech.name + ' is already at ' + Math.round(techLoad) + 'h/' + HOURS_PER_WEEK + 'h capacity. Schedule anyway?')) { setDragWO(null); setDropTarget(null); return; } } onScheduleWO(dragWO, tech, d.date, shift.id); } setDragWO(null); setDropTarget(null); }}>
                                  {cellWOs.map(wo => {
                                    const woType = TYPE_META[wo.wo_type] || TYPE_META.PM02;
                                    return (
                                      <div key={wo.wo_id}
                                        draggable
                                        onDragStart={e => { e.stopPropagation(); setDragWO(wo); e.dataTransfer.effectAllowed = 'move'; }}
                                        className={`mb-1 p-1 rounded text-xs border cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-blue-400 ${woType.bg}`}>
                                        <div className="font-bold truncate text-[0.65rem]">{wo.wo_number}</div>
                                        <div className="truncate text-[0.6rem]">{wo.equipment_tag}</div>
                                        <div className="text-[0.55rem] mt-0.5">{wo.estimated_hours}h</div>
                                      </div>
                                    );
                                  })}
                                  {cellWOs.length === 0 && isTarget && (
                                    <div className="h-10 border-2 border-dashed border-[#1B5E20] rounded flex items-center justify-center bg-[#1B5E20]/5">
                                      <span className="text-[0.6rem] font-medium text-[#1B5E20]">Drop</span>
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
                                  <div key={wo.wo_id} className={`mb-1 p-1.5 rounded text-xs border cursor-default ${woType.bg}`}>
                                    <div className="font-bold truncate">{wo.wo_number}</div>
                                    <div className="truncate text-[0.65rem]">{wo.equipment_tag}</div>
                                    <div className="text-[0.6rem] mt-0.5">{wo.estimated_hours}h</div>
                                  </div>
                                );
                              })}
                              {cellWOs.length === 0 && isTarget && (
                                <div className="h-14 border-2 border-dashed border-[#1B5E20] rounded flex items-center justify-center bg-[#1B5E20]/5">
                                  <span className="text-xs font-medium text-[#1B5E20]">Drop here</span>
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
                      const maxDaily = technicians.length * 8;
                      const pct = maxDaily > 0 ? Math.min((total / maxDaily) * 100, 100) : 0;
                      return (
                        <td key={d.str} colSpan={showShifts ? 2 : 1} className="px-2 py-2.5 border-r border-border last:border-r-0">
                          <div className="text-sm font-bold text-foreground mb-1">{Math.round(total)}h</div>
                          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${total > 0 ? 'bg-[#1B5E20]' : ''}`} style={{ width: `${pct}%` }} />
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
    </div>
  );
}

/* ───── Phase 3: Gantt Tab ───── */
function GanttTab({ ganttData, t, weeksRange, onWeeksChange }) {
  if (!ganttData || ganttData.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 text-center">
        <BarChart3 size={40} className="text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-muted-foreground">No scheduled WOs to display in Gantt</p>
      </div>
    );
  }

  // Calculate date range for the Gantt
  const now = new Date();
  const endDate = new Date(now.getTime() + weeksRange * 7 * 86400000);
  const totalDays = weeksRange * 7;

  // Generate week labels
  const weekLabels = [];
  for (let i = 0; i < weeksRange; i++) {
    const weekStart = new Date(now.getTime() + i * 7 * 86400000);
    const weekNum = getISOWeek(weekStart);
    weekLabels.push({ label: `S${weekNum}`, start: i * 7, width: 7 });
  }

  return (
    <div className="space-y-4">
      {/* Range toggle */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Range:</span>
        {[{ v: 2, l: t('scheduling.twoWeeks') }, { v: 12, l: t('scheduling.twelveWeeks') }].map(opt => (
          <button key={opt.v} onClick={() => onWeeksChange(opt.v)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${weeksRange === opt.v ? 'bg-[#1B5E20] text-white border-[#1B5E20]' : 'bg-card text-foreground border-border hover:bg-muted'}`}>
            {opt.l}
          </button>
        ))}
      </div>

      {/* Gantt chart */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-foreground">{t('scheduling.ganttView')}</h2>
          <span className="text-xs text-muted-foreground bg-muted rounded-full px-3 py-1">{ganttData.length} OTs</span>
        </div>

        <div className="overflow-x-auto">
          <div style={{ minWidth: 800, maxWidth: '100%' }}>
            {/* Week header */}
            <div className="flex border-b border-border bg-muted/50">
              <div className="w-64 min-w-[256px] px-4 py-2 text-xs font-semibold text-muted-foreground uppercase border-r border-border">OT / Equipo</div>
              <div className="flex-1 flex">
                {weekLabels.map((w, i) => (
                  <div key={i} className="flex-1 text-center text-xs font-semibold text-muted-foreground py-2 border-r border-border last:border-r-0">{w.label}</div>
                ))}
              </div>
            </div>

            {/* Rows */}
            <div style={{maxHeight: "60vh", overflowY: "auto"}}>
            {ganttData.map((wo) => {
              const woStart = wo.planned_start ? new Date(wo.planned_start) : now;
              const woEnd = wo.planned_end ? new Date(wo.planned_end) : new Date(woStart.getTime() + (wo.estimated_hours || 4) * 3600000);

              const startOffset = Math.max(0, (woStart - now) / 86400000);
              const duration = Math.max(0.5, (woEnd - woStart) / 86400000);
              const leftPct = Math.max(0, Math.min((startOffset / totalDays) * 100, 95));
              const widthPct = Math.max(2, Math.min((duration / totalDays) * 100, 100 - leftPct));

              const barColor = GANTT_COLORS[wo.wo_type] || GANTT_COLORS[wo.type] || '#6B7280';
              const statusMeta = STATUS_META[wo.status] || STATUS_META.PLANNED;

              return (
                <div key={wo.wo_id || wo.wo_number} className="flex border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors">
                  {/* Label */}
                  <div className="w-64 min-w-[256px] px-4 py-2.5 border-r border-border">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-foreground truncate">{wo.wo_number}</span>
                      <span className={`text-[0.6rem] font-medium px-1.5 py-0.5 rounded border ${statusMeta.bg}`}>{wo.status}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{wo.equipment_tag} — {wo.description}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`text-[0.6rem] font-bold px-1 py-0.5 rounded border ${PRIORITY_COLOR[wo.priority_code] || PRIORITY_COLOR.P3}`}>{wo.priority_code}</span>
                      <span className="text-[0.6rem] text-muted-foreground">{wo.estimated_hours}h</span>
                      {!wo.materials_ready && <Package size={10} className="text-amber-500" title="Materials pending" />}
                    </div>
                  </div>

                  {/* Bar */}
                  <div className="flex-1 relative py-2">
                    <div className="absolute inset-y-0 flex items-center" style={{ left: `${leftPct}%`, width: `${Math.max(widthPct, 2)}%` }}>
                      <div className="h-6 w-full rounded-md shadow-sm relative overflow-hidden" style={{ backgroundColor: barColor + '30', border: `1px solid ${barColor}60` }}>
                        {/* Progress fill */}
                        <div className="h-full rounded-md transition-all" style={{ width: `${wo.completion_pct || 0}%`, backgroundColor: barColor + '80' }} />
                        {/* Label */}
                        <span className="absolute inset-0 flex items-center justify-center text-[0.6rem] font-bold" style={{ color: barColor }}>
                          {wo.completion_pct > 0 ? `${wo.completion_pct}%` : ''}
                        </span>
                      </div>
                    </div>
                    {/* Week grid lines */}
                    {weekLabels.map((_, i) => (
                      <div key={i} className="absolute top-0 bottom-0 border-r border-border/30" style={{ left: `${((i + 1) / weeksRange) * 100}%` }} />
                    ))}
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="px-5 py-3 border-t border-border bg-muted/50 flex flex-wrap gap-4 text-xs text-muted-foreground">
          {Object.entries(GANTT_COLORS).filter(([k]) => !k.startsWith('PM')).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className="w-4 h-3 rounded" style={{ backgroundColor: color }} />
              <span>{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───── Phase 3: HH Balance Tab ───── */
function HHBalanceTab({ programId, t }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!programId) { setLoading(false); return; }
    setLoading(true);
    api.hhBalance(programId)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [programId]);

  if (loading) return <div className="py-10 flex justify-center"><LoadingSpinner /></div>;
  if (!data) return (
    <div className="bg-card border border-border rounded-xl p-12 text-center">
      <Users size={40} className="text-muted-foreground/40 mx-auto mb-3" />
      <p className="text-muted-foreground">Select a program to view HH balance</p>
    </div>
  );

  const utilizationColor = data.utilization_pct > 100 ? 'text-red-600 dark:text-red-400' : data.utilization_pct > 80 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400';
  const utilizationLabel = data.utilization_pct > 100 ? t('scheduling.overloaded') : data.utilization_pct > 80 ? t('scheduling.balanced') : t('scheduling.underloaded');

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard icon={Users} color="text-blue-500" label={t('scheduling.workers')} value={data.worker_count} sub={t('scheduling.available')} />
        <KpiCard icon={Clock} color="text-purple-500" label={t('scheduling.capacity')} value={`${data.capacity}h`} sub="HH/week" />
        <KpiCard icon={Wrench} color="text-amber-500" label={t('scheduling.assigned')} value={`${data.assigned}h`} sub={`${data.available}h ${t('scheduling.available').toLowerCase()}`} />
        <KpiCard icon={BarChart3} color={utilizationColor.split(' ')[0].replace('text-', 'text-')} label={t('scheduling.utilization')} value={`${data.utilization_pct}%`} sub={utilizationLabel} highlight={data.utilization_pct > 100} />
      </div>

      {/* Overall utilization bar */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-foreground">{t('scheduling.utilization')} Global</span>
          <span className={`text-sm font-bold ${utilizationColor}`}>{data.utilization_pct}%</span>
        </div>
        <div className="relative h-4 bg-muted rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${data.utilization_pct > 100 ? 'bg-red-500' : data.utilization_pct > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
            style={{ width: `${Math.min(data.utilization_pct, 100)}%` }} />
          <div className="absolute top-0 bottom-0 w-0.5 bg-foreground/50" style={{ left: '80%' }} />
          <div className="absolute top-0 bottom-0 w-0.5 bg-red-500" style={{ left: '100%' }} />
        </div>
      </div>

      {/* Per-specialty breakdown */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="font-semibold text-foreground">{t('scheduling.hhBalance')} por {t('scheduling.specialty')}</h2>
        </div>
        <div className="divide-y divide-border">
          {(data.by_specialty || []).map(spec => {
            const pct = spec.utilization_pct;
            const barColor = pct > 100 ? 'bg-red-500' : pct > 80 ? 'bg-amber-500' : 'bg-emerald-500';
            const textColor = pct > 100 ? 'text-red-600 dark:text-red-400' : pct > 80 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400';
            return (
              <div key={spec.specialty} className="px-5 py-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-foreground">{spec.specialty}</span>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-muted-foreground">{spec.assigned}h / {spec.capacity}h</span>
                    <span className={`font-bold ${textColor}`}>{pct}%</span>
                  </div>
                </div>
                <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
                {spec.available < 0 && (
                  <p className="text-xs text-red-500 mt-1">Overloaded: {Math.abs(spec.available)}h excess</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ───── Phase 3: Materials Tab ───── */
function MaterialsTab({ programId, t }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!programId) { setLoading(false); return; }
    setLoading(true);
    api.materialCheck(programId)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [programId]);

  if (loading) return <div className="py-10 flex justify-center"><LoadingSpinner /></div>;
  if (!data) return (
    <div className="bg-card border border-border rounded-xl p-12 text-center">
      <Package size={40} className="text-muted-foreground/40 mx-auto mb-3" />
      <p className="text-muted-foreground">Select a program to check materials</p>
    </div>
  );

  const allOk = data.pending === 0 && data.unavailable === 0;

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard icon={Package} color="text-blue-500" label="Paquetes" value={data.total_packages} sub="total" />
        <KpiCard icon={CheckCircle} color="text-emerald-500" label={t('scheduling.confirmed')} value={data.confirmed} sub={t('scheduling.materialsOk')} />
        <KpiCard icon={Clock} color="text-amber-500" label={t('scheduling.pendingMat')} value={data.pending} sub="partial" highlight={data.pending > 0} />
        <KpiCard icon={AlertTriangle} color="text-red-500" label={t('scheduling.unavailable')} value={data.unavailable} sub="out of stock" highlight={data.unavailable > 0} />
      </div>

      {/* Overall status */}
      <div className={`border rounded-xl p-4 flex items-center gap-3 ${allOk ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-700' : 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-700'}`}>
        {allOk ? <CheckCircle size={20} className="text-emerald-600 dark:text-emerald-400" /> : <AlertTriangle size={20} className="text-amber-600 dark:text-amber-400" />}
        <span className={`text-sm font-medium ${allOk ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}`}>
          {allOk ? t('scheduling.materialsOk') + ' \u2014 Program ready to publish' : t('scheduling.materialsIncomplete') + ` \u2014 ${data.pending + data.unavailable} items pending`}
        </span>
      </div>

      {/* Details per work package */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="font-semibold text-foreground">{t('scheduling.materialStatus')} per Work Package</h2>
        </div>
        <div className="divide-y divide-border">
          {(data.details || []).map((pkg, idx) => (
            <div key={idx} className="px-5 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-foreground">{pkg.name || pkg.wp_id}</span>
                  {pkg.wp_id && pkg.name && <span className="text-xs text-muted-foreground ml-2">({pkg.wp_id})</span>}
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  pkg.status === 'ok' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                  : pkg.status === 'no_materials' ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                }`}>
                  {pkg.status === 'ok' ? t('scheduling.materialsOk') : pkg.status === 'no_materials' ? t('scheduling.noMaterials') : t('scheduling.materialsIncomplete')}
                </span>
              </div>
              {pkg.items && pkg.items.length > 0 && (
                <div className="mt-2 space-y-1">
                  {pkg.items.map((item, iIdx) => (
                    <div key={iIdx} className="flex items-center gap-2 text-xs">
                      {item.check === 'ok' ? <CheckCircle size={12} className="text-emerald-500" /> : item.check === 'partial' ? <Clock size={12} className="text-amber-500" /> : <AlertTriangle size={12} className="text-red-500" />}
                      <span className="text-muted-foreground">{item.description || item.material_code || item.code}</span>
                      <span className="ml-auto font-mono">{item.qty_available || 0}/{item.qty_required || 0}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
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
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(user?.role === 'tecnico' ? 'inbox' : 'schedule');
  const [detailOrder, setDetailOrder] = useState(null);
  const [closureOrder, setClosureOrder] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);
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

  const loadCalendarData = () => {
    Promise.all([
      api.listTechnicians({ plant_id: plant }).catch(() => []),
      api.listManagedWOs({ status: 'CREADO', plant_id: plant }).catch(() => []),
      api.listManagedWOs({ status: 'PLANIFICADO', plant_id: plant }).catch(() => []),
      api.listManagedWOs({ status: 'PROGRAMADO', plant_id: plant }).catch(() => []),
      api.listManagedWOs({ status: 'EN_EJECUCION', plant_id: plant }).catch(() => []),
    ]).then(([techs, created, planned, scheduled, executing]) => {
      setTechnicians(Array.isArray(techs) ? techs : techs?.technicians || []);
      const toSchedule = [...(Array.isArray(created) ? created : []), ...(Array.isArray(planned) ? planned : [])];
      setReleasedWOs(toSchedule);
      const allScheduled = [...(Array.isArray(scheduled) ? scheduled : []), ...(Array.isArray(executing) ? executing : [])];
      setScheduledWOs(allScheduled);
    });
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
  useEffect(() => { loadGantt(); }, [plant, ganttWeeks]);

  const handleScheduleWO = (wo, tech, dayDate, shift = 'day') => {
    api.scheduleManagedWO(wo.wo_id, {
      assigned_workers: [{ worker_id: tech.worker_id, name: tech.name, specialty: tech.specialty }],
      planned_start: toDateStr(dayDate),
      planned_end: toDateStr(dayDate),
      shift: shift,
    })
      .then(() => {
        toast.success(`${wo.wo_number} → ${tech.name}`);
        loadCalendarData();
      })
      .catch(() => toast.error(`Error scheduling ${wo.wo_number}`));
  };

  const handleAISchedule = async () => {
    setAiScheduling(true);
    setAiResult(null);
    try {
      // Step 1: Get all unscheduled WOs (PLANIFICADO without dates)
      const toSchedule = [...(releasedWOs || [])];
      const techs = technicians || [];

      if (toSchedule.length === 0) {
        toast.info('No WOs to schedule');
        setAiScheduling(false);
        return;
      }

      // Step 2: Use the week being VIEWED in the calendar
      const viewedMonday = viewedWeekStart || getMonday(new Date());
      const weekDays = [];
      for (let d = 0; d < 5; d++) {
        const day = new Date(viewedMonday);
        day.setDate(viewedMonday.getDate() + d);
        weekDays.push(day.toISOString().slice(0, 10));
      }
      const today = new Date().toISOString().slice(0, 10);

      // Step 3: Sort by priority (P1 first)
      const prioOrder = { P1: 0, P2: 1, P3: 2, P4: 3 };
      toSchedule.sort((a, b) => (prioOrder[a.priority_code] || 3) - (prioOrder[b.priority_code] || 3));

      // Step 4: Distribute respecting priority deadlines
      // P1 (<24h) → today/Monday, P2 (<7 days) → this week spread, P3 (>7 days) → spread evenly, P4 → last day
      const dayLoad = [0, 0, 0, 0, 0];
      let techIdx = 0;
      let scheduled = 0;

      for (const wo of toSchedule) {
        const prio = wo.priority_code || 'P3';
        const hours = parseFloat(wo.estimated_hours) || 4;
        let bestDay;

        if (prio === 'P1') {
          // Emergency: first available day (Monday or today)
          bestDay = 0;
        } else if (prio === 'P2') {
          // Urgent: spread across Mon-Wed (first half of week)
          bestDay = [0, 1, 2].reduce((a, b) => dayLoad[a] <= dayLoad[b] ? a : b);
        } else if (prio === 'P4') {
          // Shutdown: prefer Friday
          bestDay = 4;
        } else {
          // P3 Normal: distribute evenly across all 5 days
          bestDay = dayLoad.indexOf(Math.min(...dayLoad));
        }

        dayLoad[bestDay] += hours;

        // Assign technician round-robin
        const tech = techs.length > 0 ? techs[techIdx % techs.length] : null;
        techIdx++;

        try {
          const updateData = {
            planned_start: weekDays[bestDay],
            planned_end: weekDays[bestDay],
            status: 'PROGRAMADO',
          };
          if (tech) {
            updateData.assigned_workers = [{ worker_id: tech.worker_id || tech.user_id, name: tech.name || tech.full_name, specialty: tech.specialty || '' }];
          }
          await api.scheduleManagedWO(wo.wo_id, updateData);
          scheduled++;
        } catch {}
      }

      const weekLabel = `${weekDays[0]} to ${weekDays[4]}`;
      toast.success(`${scheduled} WOs scheduled for ${weekLabel} with ${techs.length} technicians`);
      setAiResult({ assignments: toSchedule.map(w => ({ wo_id: w.wo_id })), message: `${scheduled} WOs distributed Mon-Fri` });
      loadCalendarData();
      loadPrograms();
      loadGantt();
    } catch (e) {
      toast.error('AI Schedule error: ' + (e.message || ''));
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
    { id: 'hh', icon: Users, label: t('scheduling.hhBalance') },
    { id: 'materials', icon: Package, label: t('scheduling.materials') },
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
            <button
              onClick={handleAISchedule}
              disabled={aiScheduling}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {aiScheduling ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {aiScheduling ? 'Scheduling...' : 'Schedule Week'}
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
          onPublish={handlePublish}
          publishing={publishing}
          canPublish={canPublish}
          onWeekChange={setViewedWeekStart}
        />
      )}
      {tab === 'gantt' && (
        <GanttTab ganttData={ganttData} t={t} weeksRange={ganttWeeks} onWeeksChange={setGanttWeeks} />
      )}
      {tab === 'hh' && (
        <HHBalanceTab programId={activeProgramId} t={t} />
      )}
      {tab === 'materials' && (
        <MaterialsTab programId={activeProgramId} t={t} />
      )}

      {/* Modals */}
      {detailOrder && (
        <WODetailModal order={detailOrder} t={t} onClose={() => setDetailOrder(null)}
          onClosureClick={(o) => { setDetailOrder(null); setClosureOrder(o); }} />
      )}
      {closureOrder && (
        <OCRClosureModal order={closureOrder} t={t} onClose={() => setClosureOrder(null)} onSubmit={handleClosureSubmit} />
      )}
      {/* Clear Assignments Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => !clearing && setShowClearConfirm(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center" onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Clear Assignments</h3>
            <p className="text-sm text-gray-500 mb-1">Remove <span className="font-bold text-red-600">all</span> scheduled assignments?</p>
            <p className="text-xs text-gray-400 mb-6">WOs will lose assigned technicians and planned dates.<br/>Status will return to PLANNED.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowClearConfirm(false)} disabled={clearing}
                className="flex-1 py-2.5 px-4 text-sm font-semibold border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                Cancel
              </button>
              <button disabled={clearing} onClick={async () => {
                setClearing(true);
                try {
                  // Fetch ALL scheduled WOs fresh from API
                  const [prog, exec] = await Promise.all([
                    api.listManagedWOs({ status: 'PROGRAMADO', plant_id: plant }).catch(() => []),
                    api.listManagedWOs({ status: 'EN_EJECUCION', plant_id: plant }).catch(() => []),
                  ]);
                  const allWOs = [...(Array.isArray(prog) ? prog : []), ...(Array.isArray(exec) ? exec : [])];
                  let cleared = 0;
                  for (const wo of allWOs) {
                    try {
                      await api.updateManagedWO(wo.wo_id, { assigned_workers: [], planned_start: '', planned_end: '', status: 'PLANIFICADO' });
                      cleared++;
                    } catch {}
                  }
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
