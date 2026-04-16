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
  const [includeWeekends, setIncludeWeekends] = useState(true);
  const [dragWO, setDragWO] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [hoverWO, setHoverWO] = useState(null);

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

  const hoursPerWeek = includeWeekends ? 56 : 40;
  const totalAvailable = technicians.length * hoursPerWeek * viewRange;
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
            {[{ v: 1, l: 'Week' }, { v: 2, l: '2 Weeks' }, { v: 3, l: '3 Weeks' }].map(opt => (
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
                                        onMouseEnter={() => setHoverWO(wo)}
                                        onMouseLeave={() => setHoverWO(null)}
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
  if (searchGantt) {
    const q = searchGantt.toLowerCase();
    filtered = filtered.filter(wo => (wo.wo_number || '').toLowerCase().includes(q) || (wo.equipment_tag || '').toLowerCase().includes(q) || (wo.description || '').toLowerCase().includes(q));
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
      const q = searchMC.toLowerCase();
      list = list.filter(wo => (wo.wo_number || '').toLowerCase().includes(q) || (wo.equipment_tag || '').toLowerCase().includes(q));
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
                    <td className="px-3 py-2 text-center">
                      <select value={stat} onChange={ev => updateEdit(wo.wo_id, 'status', ev.target.value)}
                        className={`text-[10px] font-semibold px-2 py-1 rounded-md cursor-pointer ${e.status ? 'ring-2 ring-amber-400' : ''} ${statStyle}`}>
                        {['CREADO','LIBERADO','PLANIFICADO','EN_PROGRAMACION','PROGRAMADO','EN_EJECUCION','COMPLETADO','CERRADO'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input type="date" value={e.planned_start ?? (wo.planned_start || '').slice(0, 10)} onChange={ev => updateEdit(wo.wo_id, 'planned_start', ev.target.value)}
                        className={`border rounded-md px-1.5 py-1 bg-background text-foreground text-[10px] w-[105px] ${e.planned_start ? 'ring-2 ring-amber-400 bg-amber-50 dark:bg-amber-900/20' : 'border-gray-200 dark:border-gray-700'}`} />
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

  useEffect(() => {
    setLoading(true);
    // Use live endpoint that reads from actual scheduled WOs
    api.hhBalanceLive(plantId)
      .then(setData)
      .catch(() => {
        // Fallback to program-based if live fails
        if (programId) api.hhBalance(programId).then(setData).catch(() => {});
      })
      .finally(() => setLoading(false));
  }, [plantId, programId]);

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
          const progress = pkg.total_items > 0 ? Math.round((pkg.collected_items / pkg.total_items) * 100) : 0;
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

  const [capacityLimit, setCapacityLimit] = useState(85); // % max capacity for auto-level

  const handleAISchedule = async () => {
    setAiScheduling(true);
    setAiResult(null);
    try {
      const toSchedule = [...(releasedWOs || [])];
      const techs = technicians || [];

      if (toSchedule.length === 0) {
        toast.info('No WOs to schedule');
        setAiScheduling(false);
        return;
      }

      const viewedMonday = viewedWeekStart || getMonday(new Date());
      const weekDays = [];
      for (let d = 0; d < 5; d++) {
        const day = new Date(viewedMonday);
        day.setDate(viewedMonday.getDate() + d);
        weekDays.push(day.toISOString().slice(0, 10));
      }

      // Sort by priority (P1 first)
      const prioOrder = { P1: 0, P2: 1, P3: 2, P4: 3 };
      toSchedule.sort((a, b) => (prioOrder[a.priority_code] || 3) - (prioOrder[b.priority_code] || 3));

      // Capacity-constrained auto-level (Prometheus-style)
      // Max HH per day = techs * 8h * capacityLimit%
      const maxHHPerDay = techs.length * 8 * (capacityLimit / 100);
      const dayLoad = [0, 0, 0, 0, 0];

      // Track per-technician daily load
      const techDayLoad = {};
      techs.forEach(t => { techDayLoad[t.worker_id] = [0, 0, 0, 0, 0]; });

      let scheduled = 0;
      let deferred = 0;
      const assignments = [];

      for (const wo of toSchedule) {
        const prio = wo.priority_code || 'P3';
        const hours = parseFloat(wo.estimated_hours) || 4;

        // Find best day respecting capacity limit
        let bestDay = -1;
        if (prio === 'P1') {
          // Emergency: force first day even if over capacity
          bestDay = 0;
        } else if (prio === 'P2') {
          // Urgent: first half of week, under capacity
          bestDay = [0, 1, 2].find(d => dayLoad[d] + hours <= maxHHPerDay);
          if (bestDay === undefined) bestDay = [0, 1, 2].reduce((a, b) => dayLoad[a] <= dayLoad[b] ? a : b);
        } else {
          // P3/P4: find day with least load under capacity
          const candidates = [0, 1, 2, 3, 4].filter(d => dayLoad[d] + hours <= maxHHPerDay);
          if (candidates.length > 0) {
            bestDay = prio === 'P4' ? candidates[candidates.length - 1] : candidates.reduce((a, b) => dayLoad[a] <= dayLoad[b] ? a : b);
          }
        }

        if (bestDay < 0) {
          deferred++;
          continue; // Skip — would exceed capacity limit
        }

        dayLoad[bestDay] += hours;

        // Match technician by specialty and daily load
        const woSpec = (wo.work_center || wo.specialty || '').toUpperCase();
        let bestTech = null;

        // First try: match specialty + least loaded on that day
        const specMatch = techs.filter(t => {
          const tSpec = (t.specialty || '').toUpperCase();
          return tSpec && woSpec && (tSpec.includes(woSpec.slice(0, 3)) || woSpec.includes(tSpec.slice(0, 3)));
        });
        const pool = specMatch.length > 0 ? specMatch : techs;
        if (pool.length > 0) {
          bestTech = pool.reduce((a, b) => {
            const aLoad = techDayLoad[a.worker_id]?.[bestDay] || 0;
            const bLoad = techDayLoad[b.worker_id]?.[bestDay] || 0;
            return aLoad <= bLoad ? a : b;
          });
        }

        if (bestTech && techDayLoad[bestTech.worker_id]) {
          techDayLoad[bestTech.worker_id][bestDay] += hours;
        }

        try {
          const updateData = {
            planned_start: weekDays[bestDay],
            planned_end: weekDays[bestDay],
            status: 'PROGRAMADO',
          };
          if (bestTech) {
            updateData.assigned_workers = [{ worker_id: bestTech.worker_id || bestTech.user_id, name: bestTech.name || bestTech.full_name, specialty: bestTech.specialty || '' }];
          }
          await api.scheduleManagedWO(wo.wo_id, updateData);
          scheduled++;
          assignments.push({ wo_number: wo.wo_number, worker_name: bestTech?.name || 'Unassigned', day: weekDays[bestDay], reason: `${prio} ${hours}h` });
        } catch {}
      }

      // Create weekly program + execution tasks
      const weekNum = getISOWeek(viewedMonday);
      const year = viewedMonday.getFullYear();
      try { await api.createProgram({ plant_id: plant, week_number: weekNum, year }); } catch {}
      try { await api.autoGenerateTasks(plant); } catch {}

      const weekLabel = `${weekDays[0]} to ${weekDays[4]}`;
      const loadPctFinal = maxHHPerDay > 0 ? Math.round((Math.max(...dayLoad) / maxHHPerDay) * 100) : 0;
      const msg = `✓ ${scheduled} WOs auto-leveled for ${weekLabel} at ${capacityLimit}% capacity${deferred > 0 ? ` (${deferred} deferred — over capacity)` : ''} · Peak load: ${loadPctFinal}%`;
      toast.success(msg);
      setAiResult({ assignments, message: msg });
      loadCalendarData();
      loadPrograms();
      loadGantt();
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
                onClick={handleAISchedule}
                disabled={aiScheduling}
                className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {aiScheduling ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {aiScheduling ? 'Leveling...' : 'Auto-Level'}
              </button>
            </div>
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
                  // Only clear WOs in the viewed week
                  const weekMon = viewedWeekStart || getMonday(new Date());
                  const weekSun = addDays(weekMon, 6);
                  const weekMonStr = toDateStr(weekMon);
                  const weekSunStr = toDateStr(weekSun);
                  const [prog, exec] = await Promise.all([
                    api.listManagedWOs({ status: 'PROGRAMADO', plant_id: plant }).catch(() => []),
                    api.listManagedWOs({ status: 'EN_EJECUCION', plant_id: plant }).catch(() => []),
                  ]);
                  const allWOs = [...(Array.isArray(prog) ? prog : []), ...(Array.isArray(exec) ? exec : [])];
                  // Filter to only this week
                  const weekWOs = allWOs.filter(wo => {
                    const start = wo.planned_start ? toDateStr(new Date(wo.planned_start)) : null;
                    return start && start >= weekMonStr && start <= weekSunStr;
                  });
                  let cleared = 0;
                  for (const wo of weekWOs) {
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
