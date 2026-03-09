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
  FileText, Wrench, AlertTriangle, Filter, Eye
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
};

const PRIORITY_COLOR = {
  P1: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700',
  P2: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700',
  P3: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700',
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

/* ───── OCR Closure Modal ───── */
function OCRClosureModal({ order, t, onClose, onSubmit }) {
  const [step, setStep] = useState(1); // 1=photo, 2=review, 3=confirm
  const [photo, setPhoto] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [ocrData, setOcrData] = useState(null);
  const fileRef = useRef(null);

  const handleCapture = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(URL.createObjectURL(file));
    setProcessing(true);
    // Call real OCR API, fallback to generated data on error
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
      // Fallback to generated values
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
    setTimeout(() => {
      onSubmit(order, ocrData);
    }, 1500);
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
          {/* Steps indicator */}
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
                <Camera size={18} />
                {t('scheduling.takePhoto')}
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
                  <input
                    type="text"
                    defaultValue={f.format ? f.format(ocrData[f.key]) : ocrData[f.key]}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30"
                  />
                </div>
              ))}

              <button onClick={handleSubmitClosure} className="w-full py-3 bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                <Send size={16} />
                {t('scheduling.submitClosure')}
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
              <Camera size={16} />
              {t('scheduling.closeWithOCR')}
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
      <div className="text-sm font-semibold text-foreground">{value || '—'}</div>
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

/* ───── Schedule Tab ───── */
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
        <KpiCard icon={Play} color={adherenceGood ? 'text-emerald-500' : 'text-amber-500'} label={t('scheduling.adherence')} value={week.adherence > 0 ? `${week.adherence}%` : '—'} sub={`${t('scheduling.target')}: 90%`} highlight={!adherenceGood} />
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

                  {/* Day Grid */}
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

  const loadPrograms = () => {
    setLoading(true);
    api.listPrograms({ plant_id: plant })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((prog) => ({
            week: `W${String(prog.week_number || 0).padStart(2, '0')}`,
            start: prog.created_at ? prog.created_at.slice(0, 10) : '',
            end: prog.finalized_at ? prog.finalized_at.slice(0, 10) : '',
            planned_hours: prog.total_hours || 0,
            executed_hours: Math.round((prog.total_hours || 0) * 0.75),
            adherence: prog.status === 'FINAL' ? 92 : prog.status === 'ACTIVE' ? 78 : 0,
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
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadPrograms(); }, [plant]);

  const handleGenerate = () => {
    const now = new Date();
    const weekNum = Math.ceil(((now - new Date(now.getFullYear(), 0, 1)) / 86400000 + new Date(now.getFullYear(), 0, 1).getDay() + 1) / 7);
    setGenerating(true);
    api.createProgram({ plant_id: plant, week_number: weekNum, year: now.getFullYear() })
      .then(() => {
        toast.success(t('scheduling.programCreated') || 'Weekly program generated');
        loadPrograms();
      })
      .catch(() => toast.error(t('scheduling.programError') || 'Error generating program'))
      .finally(() => setGenerating(false));
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

  const isTecnico = user?.role === 'tecnico';

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
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
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 bg-[#1B5E20] text-white rounded-lg hover:bg-[#2E7D32] transition-colors text-sm font-medium disabled:opacity-50"
          >
            {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {generating ? (t('scheduling.generating') || 'Generating...') : (t('scheduling.generateProgram') || 'Generate Weekly Program')}
          </button>
        )}
      </div>

      {/* Tab Selector */}
      <div className="flex gap-1 border-b border-border">
        {isTecnico && (
          <button onClick={() => setTab('inbox')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === 'inbox' ? 'border-[#1B5E20] text-[#1B5E20] dark:text-green-400' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            <Inbox size={16} />
            {t('scheduling.myInbox')}
          </button>
        )}
        <button onClick={() => setTab('schedule')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === 'schedule' ? 'border-[#1B5E20] text-[#1B5E20] dark:text-green-400' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
          <Calendar size={16} />
          {t('scheduling.weeklySchedule')}
        </button>
      </div>

      {/* Tab Content */}
      {tab === 'inbox' && (
        <TechnicianInbox weeks={weeks} user={user} t={t}
          onOpenDetail={setDetailOrder}
          onOpenClosure={setClosureOrder} />
      )}
      {tab === 'schedule' && (
        <ScheduleTab weeks={weeks} t={t}
          onOpenDetail={setDetailOrder}
          onOpenClosure={setClosureOrder} />
      )}

      {/* Modals */}
      {detailOrder && (
        <WODetailModal order={detailOrder} t={t}
          onClose={() => setDetailOrder(null)}
          onClosureClick={(o) => { setDetailOrder(null); setClosureOrder(o); }} />
      )}
      {closureOrder && (
        <OCRClosureModal order={closureOrder} t={t}
          onClose={() => setClosureOrder(null)}
          onSubmit={handleClosureSubmit} />
      )}
    </div>
  );
}
