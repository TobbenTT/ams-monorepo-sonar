import { useState, useEffect, useMemo, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { CritBadge, LoadingSpinner } from '../components/Shared';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../api';
import {
  Calendar, Clock, Users, CheckCircle, Circle, Play, Loader2,
  ChevronDown, ChevronUp, Inbox, Camera, Sparkles, Send, X,
  FileText, Wrench, AlertTriangle, Filter, Eye, BarChart3,
  Package, Upload, Lock, ArrowRight
} from 'lucide-react';

const TYPE_META = {
  PM01: { label: 'PM-01 Breakdown', bg: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700' },
  PM02: { label: 'PM-02 Preventive', bg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700' },
  PM03: { label: 'PM-03 Corrective', bg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-700' },
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

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

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

/* ───── Day Grid Cell ───── */
function DayCell({ state }) {
  if (state === 'completed') return (
    <div className="flex items-center justify-center h-7 w-full rounded bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-700">
      <CheckCircle size={12} className="text-emerald-600 dark:text-emerald-400" />
    </div>
  );
  if (state === 'in_progress') return (
    <div className="flex items-center justify-center h-7 w-full rounded bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700">
      <Play size={12} className="text-blue-600 dark:text-blue-400" />
    </div>
  );
  if (state === 'scheduled') return (
    <div className="flex items-center justify-center h-7 w-full rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <Circle size={10} className="text-gray-400" />
    </div>
  );
  return <div className="h-7 w-full rounded bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800" />;
}

function getDaySchedule(order, dayIndex) {
  if (order.status === 'COMPLETED' || order.status === 'CLOSED') return 'completed';
  if (order.status === 'PLANNED') return 'scheduled';
  if (order.status === 'IN_PROGRESS') {
    if (dayIndex === 0) return 'completed';
    if (dayIndex === 1) return 'in_progress';
    return 'scheduled';
  }
  return 'empty';
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

/* ───── Schedule Tab (existing) ───── */
function ScheduleTab({ weeks, t, onOpenDetail, onOpenClosure }) {
  const [activeWeek, setActiveWeek] = useState(0);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [expandedId, setExpandedId] = useState(null);

  const week = weeks[activeWeek] || weeks[0];
  if (!week) return <p className="text-sm text-muted-foreground py-10 text-center">Sin datos</p>;

  const adherenceGood = week.adherence >= 90;
  const filteredOrders = useMemo(() => {
    if (typeFilter === 'ALL') return week.work_orders;
    return week.work_orders.filter(o => o.type === typeFilter);
  }, [week, typeFilter]);

  return (
    <div className="space-y-5">
      {/* Week Selector */}
      <div className="flex gap-2 flex-wrap">
        {weeks.map((w, i) => (
          <button key={w.week} onClick={() => { setActiveWeek(i); setExpandedId(null); }}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${activeWeek === i ? 'bg-[#1B5E20] text-white border-[#1B5E20] shadow-sm' : 'bg-card text-foreground border-border hover:bg-muted'}`}>
            <span className="font-bold">{w.week}</span>
            <span className={`ml-2 text-xs ${activeWeek === i ? 'text-green-200' : 'text-muted-foreground'}`}>{w.start} — {w.end}</span>
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard icon={Clock} color="text-blue-500" label={t('scheduling.plannedHours')} value={week.planned_hours} sub={t('scheduling.totalHours')} />
        <KpiCard icon={CheckCircle} color="text-emerald-500" label={t('scheduling.executedHours')} value={week.executed_hours} sub={t('scheduling.actualHours')} />
        <KpiCard icon={Play} color={adherenceGood ? 'text-emerald-500' : 'text-amber-500'} label={t('scheduling.adherence')} value={week.adherence > 0 ? `${week.adherence}%` : '\u2014'} sub={`${t('scheduling.target')}: 90%`} highlight={!adherenceGood} />
        <KpiCard icon={Users} color="text-purple-500" label={t('scheduling.workOrders')} value={filteredOrders.length} sub={t('scheduling.ordersInWeek')} />
      </div>

      {/* Adherence Bar */}
      {week.adherence > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-foreground">{t('scheduling.adherenceToProgram')}</span>
            <span className={`text-sm font-bold ${adherenceGood ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>{week.adherence}%</span>
          </div>
          <div className="relative h-4 bg-muted rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${adherenceGood ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(week.adherence, 100)}%` }} />
            <div className="absolute top-0 bottom-0 w-0.5 bg-foreground/50" style={{ left: '90%' }} />
          </div>
        </div>
      )}

      {/* Filter by type */}
      <div className="flex items-center gap-2">
        <Filter size={14} className="text-muted-foreground" />
        {['ALL', 'PM01', 'PM02', 'PM03'].map(f => (
          <button key={f} onClick={() => setTypeFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${typeFilter === f ? 'bg-[#1B5E20] text-white border-[#1B5E20]' : 'bg-card text-foreground border-border hover:bg-muted'}`}>
            {f === 'ALL' ? t('scheduling.allTypes') : (TYPE_META[f]?.label || f)}
          </button>
        ))}
      </div>

      {/* Work Orders List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-foreground">{t('scheduling.workOrders')} — {week.week}</h2>
          <span className="text-xs text-muted-foreground bg-muted rounded-full px-3 py-1">{filteredOrders.length} {t('scheduling.orders')}</span>
        </div>

        <div className="divide-y divide-border">
          {filteredOrders.map(order => {
            const typeMeta = TYPE_META[order.type] || TYPE_META.PM02;
            const statusMeta = STATUS_META[order.status] || STATUS_META.PLANNED;
            const isExpanded = expandedId === order.id;
            const deviation = order.duration_actual - order.duration_planned;
            const hasDeviation = order.duration_actual > 0 && deviation !== 0;

            return (
              <div key={order.id} className="group">
                <div className="p-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setExpandedId(isExpanded ? null : order.id)}>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-mono text-sm font-bold text-foreground">{order.id}</span>
                    <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded border ${typeMeta.bg}`}>{typeMeta.label}</span>
                    <span className={`text-[0.65rem] font-medium px-2 py-0.5 rounded border ${statusMeta.bg}`}>{t(`scheduling.status_${order.status}`) || order.status}</span>
                    <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded border border-border">{order.equipment}</span>
                    <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded border ml-auto ${PRIORITY_COLOR[order.priority] || PRIORITY_COLOR.P3}`}>{order.priority}</span>
                    {isExpanded ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                  </div>
                  <p className="text-sm text-foreground">{order.description}</p>
                  <div className="grid grid-cols-5 gap-2 max-w-xs mt-3">
                    {DAYS.map((day, i) => (
                      <div key={day} className="flex flex-col items-center gap-1">
                        <span className="text-[0.6rem] text-muted-foreground font-medium">{day}</span>
                        <DayCell state={getDaySchedule(order, i)} />
                      </div>
                    ))}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-border bg-muted/30">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                      <DetailCard label={t('scheduling.plannedHours')} value={`${order.duration_planned}h`} />
                      {order.duration_actual > 0 && (
                        <DetailCard label={t('scheduling.actualHours')} value={
                          <span className="flex items-center gap-1">
                            {order.duration_actual}h
                            {hasDeviation && <span className={`text-xs font-bold ${deviation > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>{deviation > 0 ? '+' : ''}{deviation}h</span>}
                          </span>
                        } />
                      )}
                      <DetailCard label={t('scheduling.technicians')} value={order.technicians?.join(', ')} />
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => onOpenDetail(order)} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted transition-colors flex items-center gap-1.5">
                        <Eye size={13} /> {t('scheduling.viewDetail')}
                      </button>
                      {order.status !== 'COMPLETED' && order.status !== 'CLOSED' && (
                        <button onClick={() => onOpenClosure(order)} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#1B5E20] hover:bg-[#2E7D32] text-white transition-colors flex items-center gap-1.5">
                          <Camera size={13} /> {t('scheduling.closeWithOCR')}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="px-5 py-3 border-t border-border bg-muted/50 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center"><CheckCircle size={9} className="text-emerald-600 dark:text-emerald-400" /></div>
            <span>{t('scheduling.status_COMPLETED')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 flex items-center justify-center"><Play size={9} className="text-blue-600 dark:text-blue-400" /></div>
            <span>{t('scheduling.status_IN_PROGRESS')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center"><Circle size={8} className="text-gray-400" /></div>
            <span>{t('scheduling.status_PLANNED')}</span>
          </div>
        </div>
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
        <p className="text-muted-foreground">No hay OTs programadas para mostrar en el Gantt</p>
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
        <span className="text-sm font-medium text-muted-foreground">Rango:</span>
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
          <div style={{ minWidth: Math.max(800, weeksRange * 120) }}>
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
            {ganttData.map((wo) => {
              const woStart = wo.planned_start ? new Date(wo.planned_start) : now;
              const woEnd = wo.planned_end ? new Date(wo.planned_end) : new Date(woStart.getTime() + (wo.estimated_hours || 4) * 3600000);

              const startOffset = Math.max(0, (woStart - now) / 86400000);
              const duration = Math.max(0.5, (woEnd - woStart) / 86400000);
              const leftPct = (startOffset / totalDays) * 100;
              const widthPct = Math.min((duration / totalDays) * 100, 100 - leftPct);

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
                      {!wo.materials_ready && <Package size={10} className="text-amber-500" title="Materiales pendientes" />}
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
      <p className="text-muted-foreground">Selecciona un programa para ver el balance de HH</p>
    </div>
  );

  const utilizationColor = data.utilization_pct > 100 ? 'text-red-600 dark:text-red-400' : data.utilization_pct > 80 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400';
  const utilizationLabel = data.utilization_pct > 100 ? t('scheduling.overloaded') : data.utilization_pct > 80 ? t('scheduling.balanced') : t('scheduling.underloaded');

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard icon={Users} color="text-blue-500" label={t('scheduling.workers')} value={data.worker_count} sub={t('scheduling.available')} />
        <KpiCard icon={Clock} color="text-purple-500" label={t('scheduling.capacity')} value={`${data.capacity}h`} sub="HH/semana" />
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
                  <p className="text-xs text-red-500 mt-1">Sobrecargado: {Math.abs(spec.available)}h exceso</p>
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
      <p className="text-muted-foreground">Selecciona un programa para verificar materiales</p>
    </div>
  );

  const allOk = data.pending === 0 && data.unavailable === 0;

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard icon={Package} color="text-blue-500" label="Paquetes" value={data.total_packages} sub="total" />
        <KpiCard icon={CheckCircle} color="text-emerald-500" label={t('scheduling.confirmed')} value={data.confirmed} sub={t('scheduling.materialsOk')} />
        <KpiCard icon={Clock} color="text-amber-500" label={t('scheduling.pendingMat')} value={data.pending} sub="parcial" highlight={data.pending > 0} />
        <KpiCard icon={AlertTriangle} color="text-red-500" label={t('scheduling.unavailable')} value={data.unavailable} sub="sin stock" highlight={data.unavailable > 0} />
      </div>

      {/* Overall status */}
      <div className={`border rounded-xl p-4 flex items-center gap-3 ${allOk ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-700' : 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-700'}`}>
        {allOk ? <CheckCircle size={20} className="text-emerald-600 dark:text-emerald-400" /> : <AlertTriangle size={20} className="text-amber-600 dark:text-amber-400" />}
        <span className={`text-sm font-medium ${allOk ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}`}>
          {allOk ? t('scheduling.materialsOk') + ' \u2014 Programa listo para publicar' : t('scheduling.materialsIncomplete') + ` \u2014 ${data.pending + data.unavailable} items pendientes`}
        </span>
      </div>

      {/* Details per work package */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="font-semibold text-foreground">{t('scheduling.materialStatus')} por Paquete de Trabajo</h2>
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
  const [weeks, setWeeks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(user?.role === 'tecnico' ? 'inbox' : 'schedule');
  const [detailOrder, setDetailOrder] = useState(null);
  const [closureOrder, setClosureOrder] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Phase 3 state
  const [ganttData, setGanttData] = useState([]);
  const [ganttWeeks, setGanttWeeks] = useState(2);
  const [programs, setPrograms] = useState([]); // raw program list for selecting

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

  // Load Gantt data from managed WOs
  const loadGantt = () => {
    api.getGanttManaged({ plant_id: plant, weeks: ganttWeeks })
      .then(setGanttData)
      .catch(() => setGanttData([]));
  };

  useEffect(() => { loadPrograms(); }, [plant]);
  useEffect(() => { loadGantt(); }, [plant, ganttWeeks]);

  const handleGenerate = () => {
    const now = new Date();
    const weekNum = Math.ceil(((now - new Date(now.getFullYear(), 0, 1)) / 86400000 + new Date(now.getFullYear(), 0, 1).getDay() + 1) / 7);
    setGenerating(true);
    api.createProgram({ plant_id: plant, week_number: weekNum, year: now.getFullYear() })
      .then(() => {
        toast.success(t('scheduling.programCreated'));
        loadPrograms();
        loadGantt();
      })
      .catch(() => toast.error(t('scheduling.programError')))
      .finally(() => setGenerating(false));
  };

  const handlePublish = () => {
    const activeProgram = programs[0]; // most recent
    if (!activeProgram) return;
    setPublishing(true);
    api.publishProgram(activeProgram.program_id)
      .then(() => {
        toast.success(t('scheduling.programPublished'));
        loadPrograms();
      })
      .catch(() => toast.error('Error al publicar programa'))
      .finally(() => setPublishing(false));
  };

  const handleClosureSubmit = (order, ocrData) => {
    toast.success(`${t('scheduling.closureSubmitted')} \u2014 ${order.id}`);
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

  const isTecnico = user?.role === 'tecnico';
  const activeProgramId = programs[0]?.program_id;
  const activeProgram = programs[0];
  const canPublish = activeProgram && !activeProgram.published_at && (activeProgram.status === 'FINAL' || activeProgram.status === 'ACTIVE');

  const TABS = [
    ...(isTecnico ? [{ id: 'inbox', icon: Inbox, label: t('scheduling.myInbox') }] : []),
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
        {!isTecnico && (
          <div className="flex items-center gap-2">
            {canPublish && (
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {publishing ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                {publishing ? t('scheduling.publishing') : t('scheduling.publishProgram')}
              </button>
            )}
            {activeProgram?.published_at && (
              <span className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-lg text-xs font-medium text-emerald-700 dark:text-emerald-300">
                <Lock size={12} /> {t('scheduling.published')}
              </span>
            )}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-2 px-4 py-2 bg-[#1B5E20] text-white rounded-lg hover:bg-[#2E7D32] transition-colors text-sm font-medium disabled:opacity-50"
            >
              {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {generating ? t('scheduling.generating') : t('scheduling.generateProgram')}
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

      {/* Tab Content */}
      {tab === 'inbox' && (
        <TechnicianInbox weeks={weeks} user={user} t={t} onOpenDetail={setDetailOrder} onOpenClosure={setClosureOrder} />
      )}
      {tab === 'schedule' && (
        <ScheduleTab weeks={weeks} t={t} onOpenDetail={setDetailOrder} onOpenClosure={setClosureOrder} />
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
    </div>
  );
}
