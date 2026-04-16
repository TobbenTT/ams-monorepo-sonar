import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebSocket';
const QRScanner = lazy(() => import('../components/QRScanner'));
import {
  Wrench, CheckCircle, Clock, AlertTriangle, User, ChevronDown, ChevronUp, QrCode,
  Zap, Calendar, Loader2, Play, X, ArrowRight, BarChart2, Package, FileText,
  Timer, TrendingUp, Users, Activity,
} from 'lucide-react';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import {
  listManagedWOs, updateManagedWO, completeManagedWO, closeManagedWO,
  updateManagedWOProgress, verifyCloseManagedWO,
} from '../api';

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
  const [loading, setLoading] = useState(true);
  const [activeWOs, setActiveWOs] = useState([]);
  const [completedWOs, setCompletedWOs] = useState([]);
  const [closedWOs, setClosedWOs] = useState([]);
  const [expandedWO, setExpandedWO] = useState(null);
  const [closureWO, setClosureWO] = useState(null);
  const [closureHours, setClosureHours] = useState('');
  const [closureNotes, setClosureNotes] = useState('');
  const [closing, setClosing] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prog, exec, comp, closed, planned] = await Promise.all([
        listManagedWOs({ status: 'PROGRAMADO', plant_id: plant, limit: 100 }),
        listManagedWOs({ status: 'EN_EJECUCION', plant_id: plant, limit: 100 }),
        listManagedWOs({ status: 'COMPLETADO', plant_id: plant, limit: 50 }),
        listManagedWOs({ status: 'CERRADO', plant_id: plant, limit: 50 }),
        listManagedWOs({ status: 'PLANIFICADO', plant_id: plant, limit: 100 }),
      ]);
      const toArr = r => Array.isArray(r) ? r : r?.items || [];
      const execList = toArr(exec);
      const progList = toArr(prog);
      const plannedList = toArr(planned);
      setActiveWOs([...execList, ...progList, ...plannedList]);
      // "Ready to close" = COMPLETADO + all EN_EJECUCION (supervisor can close any)
      const compList = toArr(comp);
      setCompletedWOs([...compList, ...execList]);
      setClosedWOs(toArr(closed));
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

  // Start execution
  const handleStart = async (wo) => {
    try {
      await updateManagedWO(wo.wo_id, { status: 'EN_EJECUCION' });
      toast.success(wo.wo_number + ' started');
      loadData();
    } catch (e) { toast.error(e.message); }
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

  // Close WO
  const handleClose = async () => {
    if (!closureWO) return;
    setClosing(true);
    try {
      const hours = parseFloat(closureHours) || closureWO.estimated_hours || 0;
      await updateManagedWO(closureWO.wo_id, {
        actual_hours: hours,
        labor_cost: hours * LABOR_RATE,
        actual_total_cost: hours * LABOR_RATE,
        completion_pct: 100,
      });
      await closeManagedWO(closureWO.wo_id);
      toast.success(closureWO.wo_number + ' closed');
      setClosureWO(null); setClosureHours(''); setClosureNotes('');
      loadData();
    } catch (e) { toast.error(e.message); }
    setClosing(false);
  };

  const VIEWS = [
    { id: 'today', label: 'Today', icon: Zap, count: activeWOs.length },
    { id: 'close', label: 'Close', icon: CheckCircle, count: completedWOs.length },
    { id: 'summary', label: 'Summary', icon: BarChart2, count: closedWOs.length },
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
                      <div className="w-32 h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-emerald-500' : pct > 50 ? 'bg-blue-500' : pct > 0 ? 'bg-amber-500' : 'bg-gray-300'}`}
                          style={{ width: `${pct}%` }} />
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
                          <button onClick={() => { setClosureWO(wo); setClosureHours(String(wo.actual_hours || wo.estimated_hours || '')); }}
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

                      {/* Operations checklist */}
                      {ops.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Operations ({ops.length})</h4>
                          <div className="space-y-1">
                            {ops.map((op, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs bg-card rounded-lg px-3 py-2 border border-border/50">
                                <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-600">{i + 1}</span>
                                <span className="flex-1 text-foreground">{(op.description || '').substring(0, 60)}</span>
                                <span className="text-[10px] text-muted-foreground">{op.specialty}</span>
                                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">{((op.quantity || 1) * (op.hours || 0)).toFixed(1)}HH</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Materials */}
                      {mats.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Materials ({mats.length})</h4>
                          <div className="flex flex-wrap gap-2">
                            {mats.map((m, i) => (
                              <span key={i} className="text-[11px] bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded border border-border">
                                <span className="font-mono text-gray-400">{m.code || m.sapId}</span> {m.description} x{m.quantity}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

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
      {view === 'close' && (
        <div className="space-y-3">
          {completedWOs.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <FileText size={40} className="text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground">No completed WOs pending closure</p>
            </div>
          ) : (
            completedWOs.map(wo => (
              <div key={wo.wo_id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                <div className={`text-[10px] font-bold px-1.5 py-1 rounded ${PRIO_STYLE[wo.priority_code] || PRIO_STYLE.P3}`}>{wo.priority_code}</div>
                <div className="flex-1 min-w-0">
                  <span className="font-mono text-sm font-bold text-foreground">{wo.wo_number}</span>
                  <p className="text-xs text-muted-foreground truncate">{wo.equipment_tag} - {wo.description?.substring(0, 40)}</p>
                </div>
                <div className="text-xs text-muted-foreground">{wo.actual_hours || wo.estimated_hours || 0}h</div>
                <div className="text-xs font-bold text-emerald-600">${((wo.actual_hours || wo.estimated_hours || 0) * LABOR_RATE).toFixed(0)}</div>
                <button onClick={() => { setClosureWO(wo); setClosureHours(String(wo.actual_hours || wo.estimated_hours || '')); }}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                  <FileText size={14} /> Close WO
                </button>
              </div>
            ))
          )}
        </div>
      )}

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
              // Find WO by equipment tag or WO number
              const match = activeWOs.find(wo =>
                (wo.equipment_tag || '').toLowerCase().includes(code.toLowerCase()) ||
                (wo.wo_number || '').toLowerCase().includes(code.toLowerCase())
              );
              if (match) {
                toast.success('Found: ' + match.wo_number + ' — Starting execution');
                handleStart(match);
              } else {
                toast.error('No active WO found for: ' + code);
              }
            }}
          />
        </Suspense>
      )}

      {/* ═══ CLOSURE MODAL ═══ */}
      {closureWO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !closing && setClosureWO(null)} />
          <div className="relative z-10 bg-white dark:bg-card rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">Close Work Order</h3>
                <p className="text-xs text-muted-foreground">{closureWO.wo_number} - {closureWO.equipment_tag}</p>
              </div>
              <button onClick={() => setClosureWO(null)} className="p-1 hover:bg-muted rounded-lg"><X size={18} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">Actual Hours *</label>
                <input type="number" min="0" step="0.5" value={closureHours} onChange={e => setClosureHours(e.target.value)}
                  className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  placeholder={`Planned: ${closureWO.estimated_hours || 0}h`} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">Observations</label>
                <textarea value={closureNotes} onChange={e => setClosureNotes(e.target.value)}
                  className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 min-h-[60px]"
                  placeholder="Any observations or issues..." />
              </div>

              {/* Cost preview */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 grid grid-cols-2 gap-2 text-xs">
                <span className="text-muted-foreground">Hours:</span><span className="font-bold text-foreground">{closureHours || 0}h</span>
                <span className="text-muted-foreground">Rate:</span><span className="font-bold text-foreground">${LABOR_RATE}/h</span>
                <span className="text-muted-foreground">Labor Cost:</span><span className="font-bold text-emerald-700">${((parseFloat(closureHours) || 0) * LABOR_RATE).toFixed(0)}</span>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setClosureWO(null)} disabled={closing}
                  className="flex-1 py-2.5 text-sm font-semibold border border-border rounded-xl text-foreground hover:bg-muted">
                  Cancel
                </button>
                <button onClick={handleClose} disabled={closing || !closureHours}
                  className="flex-1 py-2.5 text-sm font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-40 flex items-center justify-center gap-2">
                  {closing ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                  Close WO
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
