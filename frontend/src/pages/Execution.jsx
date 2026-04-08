import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Wrench, ClipboardCheck, ArrowRightLeft, Plus, CheckCircle2,
  Clock, AlertTriangle, User, Send, RefreshCw, ChevronDown, ChevronUp, Zap,
  Calendar, Shield, Loader2, DollarSign, BarChart2, X, PackagePlus, ArrowRight, CheckCircle
} from 'lucide-react';
import { useToast } from '../components/Toast';
import {
  getMyTasks, listExecutionTasks, assignExecutionTask,
  updateTaskProgress, partialNotification, completeExecutionTask,
  confirmTaskUnderstood, createHandover, listHandovers,
  listManagedWOs, authListUsers, completeManagedWO,
  updateManagedWO, verifyCloseManagedWO, closeManagedWO,
  aiDailyBriefing, aiEstimateDuration, updateManagedWOProgress,
} from '../api';

const LABOR_RATE = 50; // USD per hour

const STATUS_COLORS = {
  ASSIGNED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-green-100 text-green-700',
  PENDING: 'bg-gray-100 text-gray-600',
  CANCELLED: 'bg-red-100 text-red-700',
};

const TABS = [
  { key: 'my', label: 'My Tasks', icon: User },
  { key: 'all', label: 'All Tasks', icon: ClipboardCheck },
  { key: 'daily', label: 'Daily Meeting', icon: Calendar },
  { key: 'handovers', label: 'Equipment Handovers', icon: ArrowRightLeft },
  { key: 'signoff', label: 'Supervisor Sign-off', icon: Shield },
  { key: 'closure', label: 'WO Closure', icon: CheckCircle2 },
];

export default function Execution() {
  const { plant } = useOutletContext();
  const toast = useToast();
  const [tab, setTab] = useState('my');
  const [myTasks, setMyTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [handovers, setHandovers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [expandedTask, setExpandedTask] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [shiftNote, setShiftNote] = useState('');
  const [fastTrackWOs, setFastTrackWOs] = useState([]);
  const [inProgressWOs, setInProgressWOs] = useState([]);
  const [completedWOs, setCompletedWOs] = useState([]);
  const [signingOff, setSigningOff] = useState(null);
  const [closureWO, setClosureWO] = useState(null);
  const [closureForm, setClosureForm] = useState({ actual_hours: '', observations: '', materials_returned: [], external_services: [] });
  const [aiResult, setAiResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [closing, setClosing] = useState(false);
  const [enExecutionWOs, setEnExecutionWOs] = useState([]);
  const [cerradoWOs, setCerradoWOs] = useState([]);
  const [briefing, setBriefing] = useState(null);
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [estimateResult, setEstimateResult] = useState(null);
  const [estimating, setEstimating] = useState(false);

  // WO Execution detail state
  const [selectedExecWO, setSelectedExecWO] = useState(null);

  useEffect(() => { refresh(); loadFastTrack(); loadWOsForTabs(); }, [tab]);

  async function loadFastTrack() {
    try {
      const wos = await listManagedWOs({ fast_track: true, limit: 20 });
      const list = Array.isArray(wos) ? wos : wos.items || [];
      setFastTrackWOs(list.filter(w => ['PROGRAMADO', 'EN_EJECUCION', 'PLANIFICADO'].includes(w.status)));
    } catch { /* ignore */ }
  }

  async function loadWOsForTabs() {
    try {
      const [ipRes, compRes, ejRes, cerRes, progRes] = await Promise.all([
        listManagedWOs({ status: 'IN_PROGRESS', limit: 50 }),
        listManagedWOs({ status: 'COMPLETED', limit: 50 }),
        listManagedWOs({ status: 'EN_EJECUCION', limit: 50 }),
        listManagedWOs({ status: 'CERRADO', limit: 50 }),
        listManagedWOs({ status: 'PROGRAMADO', limit: 100 }),
      ]);
      const ipList = Array.isArray(ipRes) ? ipRes : ipRes.items || [];
      const ejList = Array.isArray(ejRes) ? ejRes : ejRes.items || [];
      const progList = Array.isArray(progRes) ? progRes : progRes.items || [];
      // Combine IN_PROGRESS + EN_EJECUCION + PROGRAMADO as "active"
      setInProgressWOs([...ipList, ...ejList, ...progList]);
      setCompletedWOs(Array.isArray(compRes) ? compRes : compRes.items || []);
      setEnExecutionWOs(Array.isArray(ejRes) ? ejRes : ejRes.items || []);
      setCerradoWOs(Array.isArray(cerRes) ? cerRes : cerRes.items || []);
    } catch { /* ignore */ }
  }

  async function generateBriefing() {
    setBriefingLoading(true);
    try {
      const result = await aiDailyBriefing(plant);
      setBriefing(result);
    } catch (e) { toast.error('Briefing error: ' + e.message); }
    finally { setBriefingLoading(false); }
  }

  async function estimateDuration(wo) {
    setEstimating(true);
    try {
      const result = await aiEstimateDuration(wo.wo_id);
      setEstimateResult(result);
      if (result.predicted_hours) {
        setClosureForm(p => ({...p, actual_hours: String(result.predicted_hours)}));
      }
    } catch (e) { toast.error('Estimate error: ' + e.message); }
    finally { setEstimating(false); }
  }

  async function saveExecutionData(wo) {
    try {
      const laborCost = (parseFloat(closureForm.actual_hours) || 0) * LABOR_RATE;
      const matCost = (closureForm.materials_returned || []).reduce((s, m) => s + ((m.unit_price || 0) * (m.quantity_used || 0)), 0);
      const extCost = (closureForm.external_services || []).reduce((s, e) => s + (parseFloat(e.cost) || 0), 0);
      await updateManagedWO(wo.wo_id, {
        actual_hours: parseFloat(closureForm.actual_hours) || 0,
        labor_cost: laborCost,
        material_cost: matCost,
        external_cost: extCost,
        actual_total_cost: laborCost + matCost + extCost,
      });
      toast.success('Execution data saved for ' + wo.wo_number);
      loadWOsForTabs();
    } catch (e) { toast.error('Error: ' + e.message); }
  }

  async function verifyAndClose(wo) {
    setVerifying(true);
    setAiResult(null);
    try {
      const result = await verifyCloseManagedWO(wo.wo_id, {
        actual_hours: parseFloat(closureForm.actual_hours) || 0,
        observations: closureForm.observations || '',
        materials_used: closureForm.materials_returned || [],
      });
      setAiResult(result);
    } catch (e) { toast.error('Verification error: ' + e.message); }
    finally { setVerifying(false); }
  }

  async function handleCloseWO(wo) {
    setClosing(true);
    try {
      const laborCost = (parseFloat(closureForm.actual_hours) || 0) * LABOR_RATE;
      const matCost = (closureForm.materials_returned || []).reduce((s, m) => s + ((m.unit_price || 0) * (m.quantity_used || 0)), 0);
      const extCost = (closureForm.external_services || []).reduce((s, e) => s + (parseFloat(e.cost) || 0), 0);
      const totalActual = laborCost + matCost + extCost;
      await updateManagedWO(wo.wo_id, {
        actual_hours: parseFloat(closureForm.actual_hours) || 0,
        labor_cost: laborCost,
        material_cost: matCost,
        external_cost: extCost,
        actual_total_cost: totalActual,
        completion_pct: 100,
      });
      await closeManagedWO(wo.wo_id);
      toast.success(wo.wo_number + ' closed successfully');
      setClosureWO(null);
      setClosureForm({ actual_hours: '', observations: '', materials_returned: [], external_services: [] });
      setAiResult(null);
      loadWOsForTabs();
    } catch (e) { toast.error('Close error: ' + e.message); }
    finally { setClosing(false); }
  }

  async function handleSupervisorSignOff(woId) {
    setSigningOff(woId);
    try {
      // Try to close via API, fallback to just recording locally
      await closeManagedWO(woId, { observations: 'Supervisor sign-off approved' }).catch(() => {});
      toast.success('Supervisor sign-off recorded');
      // Remove from local list
      setCerradoWOs(prev => prev.filter(w => (w.wo_id || w.work_order_id) !== woId));
      setCompletedWOs(prev => prev.filter(w => (w.wo_id || w.work_order_id) !== woId));
    } catch (e) {
      toast.error('Error: ' + (e?.message || ''));
    }
    setSigningOff(null);
  }

  async function refresh() {
    setLoading(true);
    try {
      if (tab === 'my') {
        setMyTasks(await getMyTasks());
      } else if (tab === 'all') {
        setAllTasks(await listExecutionTasks({ plant_id: plant }));
      } else {
        setHandovers(await listHandovers());
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  async function handleProgress(taskId, pct, note = '') {
    try {
      await updateTaskProgress(taskId, { progress_pct: pct, note });
      refresh();
    } catch (e) { console.error(e); }
  }

  async function handleComplete(taskId) {
    try {
      await completeExecutionTask(taskId);
      refresh();
    } catch (e) { console.error(e); }
  }

  async function handlePartial(taskId) {
    if (!noteText && !shiftNote) return;
    try {
      await partialNotification(taskId, { note: noteText, shift_handover_notes: shiftNote });
      setNoteText('');
      setShiftNote('');
      refresh();
    } catch (e) { console.error(e); }
  }

  async function handleConfirmUnderstood(taskId) {
    try {
      await confirmTaskUnderstood(taskId);
      refresh();
    } catch (e) { console.error(e); }
  }

  // ── Cost calculation helper ──
  function calcCosts(form, wo) {
    const laborCost = (parseFloat(form.actual_hours) || 0) * LABOR_RATE;
    const matCost = (form.materials_returned || []).reduce((s, m) => s + ((m.unit_price || 0) * (m.quantity_used || 0)), 0);
    const extCost = (form.external_services || []).reduce((s, e) => s + (parseFloat(e.cost) || 0), 0);
    const totalActual = laborCost + matCost + extCost;
    const plannedLabor = parseFloat(wo?.estimated_hours || 0) * LABOR_RATE;
    const plannedMat = parseFloat(wo?.material_cost_planned || wo?.planned_material_cost || 0);
    const plannedExt = parseFloat(wo?.external_cost_planned || wo?.planned_external_cost || 0);
    return { laborCost, matCost, extCost, totalActual, plannedLabor, plannedMat, plannedExt };
  }

  // ── WO Execution Detail Modal ──
  function WOExecutionDetail({ wo, onClose }) {
    const [localForm, setLocalForm] = useState({
      completion_pct: wo.completion_pct || 0,
      actual_hours: wo.actual_hours || '',
      execution_notes: wo.execution_notes || '',
      materials_used: (() => { try { return wo.materials_used ? (typeof wo.materials_used === 'string' ? JSON.parse(wo.materials_used) : wo.materials_used) : []; } catch { return []; } })(),
      external_services: (() => { try { return wo.external_services ? (typeof wo.external_services === 'string' ? JSON.parse(wo.external_services) : wo.external_services) : []; } catch { return []; } })(),
    });
    const [saving, setSaving] = useState(false);
    const [completing, setCompleting] = useState(false);
    const [newMat, setNewMat] = useState({ description: '', quantity_used: 1, unit: 'PZ', unit_price: 0 });
    const [newExt, setNewExt] = useState({ description: '', cost: 0 });

    async function save() {
      setSaving(true);
      try {
        await updateManagedWO(wo.wo_id, {
          completion_pct: localForm.completion_pct,
          actual_hours: parseFloat(localForm.actual_hours) || null,
          execution_notes: localForm.execution_notes,
          materials_used: localForm.materials_used,
          external_services: localForm.external_services,
        });
        try { await updateManagedWOProgress(wo.wo_id, { completion_pct: localForm.completion_pct }); } catch {}
        toast.success('Progress saved for ' + wo.wo_number);
        loadWOsForTabs();
      } catch (e) { toast.error('Error: ' + e.message); }
      finally { setSaving(false); }
    }

    async function complete() {
      setCompleting(true);
      try {
        await updateManagedWO(wo.wo_id, {
          completion_pct: 100,
          actual_hours: parseFloat(localForm.actual_hours) || null,
          execution_notes: localForm.execution_notes,
          materials_used: localForm.materials_used,
          external_services: localForm.external_services,
        });
        await completeManagedWO(wo.wo_id, { actual_hours: parseFloat(localForm.actual_hours) || 0 });
        toast.success(wo.wo_number + ' marked complete');
        onClose();
        loadWOsForTabs();
      } catch (e) { toast.error('Error: ' + e.message); }
      finally { setCompleting(false); }
    }

    function addMaterial() {
      if (!newMat.description) return;
      setLocalForm(p => ({ ...p, materials_used: [...p.materials_used, { ...newMat }] }));
      setNewMat({ description: '', quantity_used: 1, unit: 'PZ', unit_price: 0 });
    }
    function removeMaterial(idx) {
      setLocalForm(p => ({ ...p, materials_used: p.materials_used.filter((_, i) => i !== idx) }));
    }
    function addExternal() {
      if (!newExt.description) return;
      setLocalForm(p => ({ ...p, external_services: [...p.external_services, { ...newExt }] }));
      setNewExt({ description: '', cost: 0 });
    }
    function removeExternal(idx) {
      setLocalForm(p => ({ ...p, external_services: p.external_services.filter((_, i) => i !== idx) }));
    }

    const laborCost = (parseFloat(localForm.actual_hours) || 0) * LABOR_RATE;
    const matCost = localForm.materials_used.reduce((s, m) => s + ((m.unit_price || 0) * (m.quantity_used || 0)), 0);
    const extCost = localForm.external_services.reduce((s, e) => s + (parseFloat(e.cost) || 0), 0);
    const totalCost = laborCost + matCost + extCost;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between p-5 border-b bg-gradient-to-r from-emerald-50 to-blue-50 rounded-t-2xl">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-bold text-gray-900">{wo.wo_number}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">{wo.status}</span>
                {wo.priority_code && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${wo.priority_code === 'P1' ? 'bg-red-100 text-red-700' : wo.priority_code === 'P2' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                    {wo.priority_code}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-0.5">{wo.equipment_tag} — {wo.description}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>

          <div className="p-5 space-y-5">
            {/* Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700">Completion Progress</label>
                <span className="text-lg font-bold text-emerald-700">{localForm.completion_pct}%</span>
              </div>
              <input type="range" min="0" max="100" step="5" value={localForm.completion_pct}
                onChange={e => setLocalForm(p => ({ ...p, completion_pct: Number(e.target.value) }))}
                className="w-full accent-emerald-600 h-3" />
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div className={`h-2.5 rounded-full transition-all ${localForm.completion_pct >= 100 ? 'bg-green-500' : localForm.completion_pct >= 50 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{ width: `${localForm.completion_pct}%` }} />
              </div>
            </div>

            {/* Hours */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Planned Hours</label>
                <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-sm font-medium text-blue-700">{wo.estimated_hours || 0} hrs</div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Actual Hours Worked</label>
                <input type="number" step="0.5" min="0" value={localForm.actual_hours}
                  onChange={e => setLocalForm(p => ({ ...p, actual_hours: e.target.value }))}
                  placeholder="e.g. 6.5" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-400" />
              </div>
            </div>

            {/* Materials Used */}
            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                <PackagePlus size={15} className="text-emerald-600" /> Materials Actually Used
              </label>
              {localForm.materials_used.length > 0 && (
                <div className="space-y-1.5 mb-3">
                  {localForm.materials_used.map((mat, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border text-sm">
                      <span className="flex-1 truncate">{mat.description}</span>
                      <span className="text-gray-500 text-xs">{mat.quantity_used} {mat.unit}</span>
                      {mat.unit_price > 0 && <span className="text-emerald-600 text-xs font-medium">${(mat.unit_price * mat.quantity_used).toFixed(2)}</span>}
                      <button onClick={() => removeMaterial(idx)} className="text-red-400 hover:text-red-600 p-0.5"><X size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-5 gap-1.5 bg-green-50 rounded-lg p-2 border border-green-100">
                <input className="col-span-2 border rounded px-2 py-1 text-xs" placeholder="Description" value={newMat.description}
                  onChange={e => setNewMat(p => ({ ...p, description: e.target.value }))} />
                <input className="border rounded px-2 py-1 text-xs" type="number" min="0" placeholder="Qty" value={newMat.quantity_used}
                  onChange={e => setNewMat(p => ({ ...p, quantity_used: Number(e.target.value) }))} />
                <input className="border rounded px-2 py-1 text-xs" placeholder="Unit $" type="number" min="0" value={newMat.unit_price}
                  onChange={e => setNewMat(p => ({ ...p, unit_price: Number(e.target.value) }))} />
                <button onClick={addMaterial} className="bg-emerald-600 text-white rounded px-2 py-1 text-xs hover:bg-emerald-700 flex items-center justify-center gap-1">
                  <Plus size={12} /> Add
                </button>
              </div>
            </div>

            {/* External Services */}
            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                <DollarSign size={15} className="text-blue-600" /> External Services Consumed
              </label>
              {localForm.external_services.length > 0 && (
                <div className="space-y-1.5 mb-3">
                  {localForm.external_services.map((svc, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border text-sm">
                      <span className="flex-1 truncate">{svc.description}</span>
                      <span className="text-blue-600 text-xs font-medium">${parseFloat(svc.cost || 0).toFixed(2)}</span>
                      <button onClick={() => removeExternal(idx)} className="text-red-400 hover:text-red-600 p-0.5"><X size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-4 gap-1.5 bg-blue-50 rounded-lg p-2 border border-blue-100">
                <input className="col-span-2 border rounded px-2 py-1 text-xs" placeholder="Service description" value={newExt.description}
                  onChange={e => setNewExt(p => ({ ...p, description: e.target.value }))} />
                <input className="border rounded px-2 py-1 text-xs" type="number" min="0" placeholder="Cost ($)" value={newExt.cost}
                  onChange={e => setNewExt(p => ({ ...p, cost: Number(e.target.value) }))} />
                <button onClick={addExternal} className="bg-blue-600 text-white rounded px-2 py-1 text-xs hover:bg-blue-700 flex items-center justify-center gap-1">
                  <Plus size={12} /> Add
                </button>
              </div>
            </div>

            {/* Live Cost Summary */}
            {(localForm.actual_hours || localForm.materials_used.length > 0 || localForm.external_services.length > 0) && (
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart2 size={15} className="text-slate-600" />
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Live Cost Estimate</span>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Labor ({localForm.actual_hours || 0}h x ${LABOR_RATE}/hr)</span>
                    <span className="font-medium">${laborCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Materials</span>
                    <span className="font-medium">${matCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">External Services</span>
                    <span className="font-medium">${extCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1.5 font-bold">
                    <span>Total Actual Cost</span>
                    <span className="text-emerald-700">${totalCost.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Execution Notes / Observations</label>
              <textarea rows={3} value={localForm.execution_notes}
                onChange={e => setLocalForm(p => ({ ...p, execution_notes: e.target.value }))}
                placeholder="Findings, issues encountered, additional notes..."
                className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-emerald-400" />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-1">
              <button onClick={save} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
                Save Progress
              </button>
              <button onClick={complete} disabled={completing || !localForm.actual_hours}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">
                {completing ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                Mark Complete
              </button>
            </div>
            {!localForm.actual_hours && (
              <p className="text-xs text-amber-600 text-center -mt-2">Enter actual hours to enable Mark Complete</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Task Card Component ──
  function TaskCard({ task, showActions = true }) {
    const isExpanded = expandedTask === task.assignment_id;
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div
          className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setExpandedTask(isExpanded ? null : task.assignment_id)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[task.status] || STATUS_COLORS.PENDING}`}>
                  {task.status}
                </span>
                {task.task_understood && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                    Understood
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 truncate">{task.task_description || 'No description'}</h3>
              <p className="text-sm text-gray-500 mt-1">
                Assigned to: <span className="font-medium">{task.assigned_to_name || task.assigned_to}</span>
                {task.scheduled_date && <> · {task.scheduled_date}</>}
                {task.estimated_hours > 0 && <> · {task.estimated_hours}h</>}
              </p>
            </div>
            <div className="ml-3 flex items-center gap-2">
              <span className="text-sm font-bold text-emerald-700">{Math.round(task.progress_pct)}%</span>
              {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all"
              style={{ width: `${task.progress_pct}%` }}
            />
          </div>
        </div>

        {isExpanded && (
          <div className="border-t border-gray-100 p-4 space-y-4 bg-gray-50">
            {/* Progress slider */}
            {showActions && task.status !== 'COMPLETED' && (
              <div>
                <label className="text-sm font-medium text-gray-700">Progress</label>
                <div className="flex items-center gap-3 mt-1">
                  <input
                    type="range" min="0" max="100" step="5"
                    value={task.progress_pct}
                    onChange={e => handleProgress(task.assignment_id, Number(e.target.value))}
                    className="flex-1 accent-emerald-600"
                  />
                  <span className="text-sm font-mono w-12 text-right">{Math.round(task.progress_pct)}%</span>
                </div>
              </div>
            )}

            {/* Notes */}
            {showActions && task.status !== 'COMPLETED' && (
              <div>
                <label className="text-sm font-medium text-gray-700">Nota / Cambio de turno</label>
                <textarea
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Add progress note or shift change..."
                  className="w-full mt-1 border border-gray-200 rounded-lg p-2 text-sm"
                  rows={2}
                />
                <textarea
                  value={shiftNote}
                  onChange={e => setShiftNote(e.target.value)}
                  placeholder="Shift handover notes (optional)..."
                  className="w-full mt-1 border border-gray-200 rounded-lg p-2 text-sm"
                  rows={2}
                />
                <button
                  onClick={() => handlePartial(task.assignment_id)}
                  disabled={!noteText && !shiftNote}
                  className="mt-2 flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-40"
                >
                  <Send size={14} /> Send Note
                </button>
              </div>
            )}

            {/* Existing notes */}
            {task.partial_notes?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Notes History</h4>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {task.partial_notes.map((n, i) => (
                    <div key={i} className="text-xs bg-white rounded p-2 border border-gray-100">
                      <span className="text-gray-400">{n.timestamp?.slice(0, 16).replace('T', ' ')}</span>
                      <span className="mx-1 text-gray-300">|</span>
                      <span className="font-medium text-gray-600">{n.user}</span>
                      <span className="mx-1 text-gray-300">|</span>
                      <span>{n.note}</span>
                      {n.type === 'shift_change' && <span className="ml-1 text-xs text-amber-600">[turno]</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            {showActions && task.status !== 'COMPLETED' && (
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleComplete(task.assignment_id)}
                  className="flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700"
                >
                  <CheckCircle2 size={16} /> Complete Task
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── Assign Modal ──
  function AssignModal() {
    const [wos, setWos] = useState([]);
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState({ wo_id: '', assigned_to: '', task_description: '', estimated_hours: 4 });

    useEffect(() => {
      Promise.all([
        listManagedWOs({ status: 'RELEASED', limit: 50 }),
        listManagedWOs({ status: 'SCHEDULED', limit: 50 }),
        listManagedWOs({ status: 'IN_PROGRESS', limit: 50 }),
      ]).then(([r1, r2, r3]) => {
        const parse = r => Array.isArray(r) ? r : r.items || [];
        setWos([...parse(r1), ...parse(r2), ...parse(r3)]);
      }).catch(() => {});
      authListUsers(plant ? { plant_id: plant } : {}).then(r => setUsers(Array.isArray(r) ? r : r.users || [])).catch(() => {});
    }, []);

    async function submit(e) {
      e.preventDefault();
      if (!form.wo_id || !form.assigned_to) return;
      try {
        await assignExecutionTask(form);
        setShowAssignModal(false);
        refresh();
      } catch (e) { console.error(e); }
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowAssignModal(false)}>
        <form onClick={e => e.stopPropagation()} onSubmit={submit} className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Assign Task</h2>
          <div>
            <label className="text-sm font-medium text-gray-700">Work Order</label>
            <select value={form.wo_id} onChange={e => setForm({...form, wo_id: e.target.value})} className="w-full border rounded-lg p-2 mt-1">
              <option value="">Select WO...</option>
              {wos.map(w => <option key={w.wo_id} value={w.wo_id}>{w.wo_number} — {(w.description || '').slice(0, 50)}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Technician</label>
            <select value={form.assigned_to} onChange={e => setForm({...form, assigned_to: e.target.value})} className="w-full border rounded-lg p-2 mt-1">
              <option value="">Select...</option>
              {users.map(u => <option key={u.user_id} value={u.username}>{u.full_name || u.username} ({u.role})</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Task description</label>
            <textarea value={form.task_description} onChange={e => setForm({...form, task_description: e.target.value})} className="w-full border rounded-lg p-2 mt-1" rows={2} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Estimated hours</label>
            <input type="number" value={form.estimated_hours} onChange={e => setForm({...form, estimated_hours: Number(e.target.value)})} className="w-full border rounded-lg p-2 mt-1" min="0.5" step="0.5" />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowAssignModal(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">Assign</button>
          </div>
        </form>
      </div>
    );
  }

  // ── Handover Modal ──
  function HandoverModal() {
    const [form, setForm] = useState({ wo_id: '', equipment_tag: '', to_user: '', condition_notes: '', tests_passed: false, test_notes: '' });
    const [wos, setWos] = useState([]);

    useEffect(() => {
      listManagedWOs({ status: 'COMPLETED', limit: 50 }).then(r => setWos(Array.isArray(r) ? r : r.items || [])).catch(() => {});
    }, []);

    async function submit(e) {
      e.preventDefault();
      if (!form.equipment_tag || !form.to_user) return;
      try {
        await createHandover(form);
        setShowHandoverModal(false);
        refresh();
      } catch (e) { console.error(e); }
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowHandoverModal(false)}>
        <form onClick={e => e.stopPropagation()} onSubmit={submit} className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Equipment Handover</h2>
          <div>
            <label className="text-sm font-medium text-gray-700">Related WO</label>
            <select value={form.wo_id} onChange={e => {
              const wo = wos.find(w => w.wo_id === e.target.value);
              setForm({...form, wo_id: e.target.value, equipment_tag: wo?.equipment_tag || form.equipment_tag });
            }} className="w-full border rounded-lg p-2 mt-1">
              <option value="">Select WO...</option>
              {wos.map(w => <option key={w.wo_id} value={w.wo_id}>{w.wo_number} — {w.equipment_tag}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Equipment Tag</label>
            <input value={form.equipment_tag} onChange={e => setForm({...form, equipment_tag: e.target.value})} className="w-full border rounded-lg p-2 mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Deliver to (user)</label>
            <input value={form.to_user} onChange={e => setForm({...form, to_user: e.target.value})} className="w-full border rounded-lg p-2 mt-1" placeholder="Operator name" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Equipment condition</label>
            <textarea value={form.condition_notes} onChange={e => setForm({...form, condition_notes: e.target.value})} className="w-full border rounded-lg p-2 mt-1" rows={2} />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.tests_passed} onChange={e => setForm({...form, tests_passed: e.target.checked})} className="accent-emerald-600" />
              Tests completed
            </label>
          </div>
          {form.tests_passed && (
            <div>
              <label className="text-sm font-medium text-gray-700">Test notes</label>
              <textarea value={form.test_notes} onChange={e => setForm({...form, test_notes: e.target.value})} className="w-full border rounded-lg p-2 mt-1" rows={2} />
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowHandoverModal(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">Record Handover</button>
          </div>
        </form>
      </div>
    );
  }

  // ── Main render ──
  const tasks = tab === 'my' ? myTasks : allTasks;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Wrench className="text-emerald-600" /> Execution
          </h1>
          <a href="/m/dashboard" target="_blank" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1">
            Open Mobile View &rarr;
          </a>
          <p className="text-gray-500 text-sm mt-1">Maintenance task management and equipment handovers</p>
        </div>
        <div className="flex gap-2">
          {tab === 'all' && (
            <button onClick={() => setShowAssignModal(true)} className="flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">
              <Plus size={16} /> Assign Task
            </button>
          )}
          {tab === 'handovers' && (
            <button onClick={() => setShowHandoverModal(true)} className="flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">
              <Plus size={16} /> New Handover
            </button>
          )}
          <button onClick={refresh} className="p-2 border rounded-lg hover:bg-gray-50">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Fast Track / Active Emergencies */}
      {fastTrackWOs.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h2 className="text-sm font-bold text-amber-800 flex items-center gap-2 mb-3">
            <Zap size={16} className="text-amber-600" /> Active Emergencies ({fastTrackWOs.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {fastTrackWOs.map(wo => (
              <div key={wo.wo_id} className={`bg-white rounded-lg border-l-4 p-3 shadow-sm ${wo.priority_code === 'P1' ? 'border-red-500' : 'border-orange-400'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-sm font-bold text-emerald-700">{wo.wo_number}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${wo.priority_code === 'P1' ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-orange-100 text-orange-700'}`}>
                    {wo.priority_code}
                  </span>
                </div>
                <p className="text-xs text-gray-600 truncate">{wo.equipment_tag}</p>
                <p className="text-xs text-gray-500 truncate mt-0.5">{wo.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                    wo.status === 'RELEASED' ? 'bg-blue-100 text-blue-700' :
                    wo.status === 'SCHEDULED' ? 'bg-purple-100 text-purple-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>{wo.status.replace(/_/g, ' ')}</span>
                  {wo.assigned_workers?.length > 0 && (
                    <span className="text-[10px] text-gray-500 flex items-center gap-1">
                      <User size={10} /> {wo.assigned_workers.length}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw size={24} className="animate-spin text-emerald-600" />
        </div>
      ) : (
        <>
          {(tab === 'my' || tab === 'all') && (
            <div className="space-y-4">
              {/* EN_EJECUCION WOs — click to open progress detail */}
              {enExecutionWOs.length > 0 && (
                <div>
                  <h2 className="text-sm font-bold text-amber-800 mb-2 flex items-center gap-2">
                    <Wrench size={15} className="text-amber-600" /> WOs In Execution ({enExecutionWOs.length})
                    <span className="text-xs font-normal text-gray-500">— Click to update progress</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {enExecutionWOs.map(wo => (
                      <div key={wo.wo_id}
                        className="bg-white rounded-xl border border-amber-200 p-4 cursor-pointer hover:border-emerald-400 hover:shadow-md transition-all group"
                        onClick={() => setSelectedExecWO(wo)}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-gray-900">{wo.wo_number}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              wo.priority_code === 'P1' ? 'bg-red-100 text-red-700' :
                              wo.priority_code === 'P2' ? 'bg-orange-100 text-orange-700' :
                              'bg-blue-100 text-blue-700'}`}>{wo.priority_code}</span>
                          </div>
                          <span className="text-xs text-amber-600 font-medium group-hover:text-emerald-700">{wo.completion_pct || 0}% complete</span>
                        </div>
                        <p className="text-xs text-gray-500 truncate mb-2">{wo.equipment_tag} — {wo.description}</p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-amber-500 h-2 rounded-full transition-all group-hover:bg-emerald-500" style={{ width: `${wo.completion_pct || 0}%` }} />
                        </div>
                        <div className="flex justify-between mt-2 text-[10px] text-gray-400">
                          <span>{wo.estimated_hours || 0}h planned</span>
                          <span>{wo.actual_hours ? `${wo.actual_hours}h worked` : 'No hours recorded'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {tasks.length === 0 && enExecutionWOs.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <ClipboardCheck size={48} className="mx-auto mb-3 opacity-40" />
                  <p className="text-lg font-medium">No tasks</p>
                  <p className="text-sm">{tab === 'my' ? 'You have no tasks assigned currently' : 'No tasks found'}</p>
                </div>
              ) : (
                tasks.map(t => (
                  <TaskCard key={t.assignment_id} task={t} showActions={tab === 'my'} />
                ))
              )}
              {tab === 'all' && tasks.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-blue-700">{tasks.filter(t => t.status === 'ASSIGNED').length}</p>
                    <p className="text-sm text-blue-600">Assigned</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-amber-700">{tasks.filter(t => t.status === 'IN_PROGRESS').length}</p>
                    <p className="text-sm text-amber-600">In Progress</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-green-700">{tasks.filter(t => t.status === 'COMPLETED').length}</p>
                    <p className="text-sm text-green-600">Completed</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'daily' && (() => {
            const today = new Date().toISOString().slice(0, 10);
            const todayWOs = inProgressWOs.filter(wo => wo.planned_start?.slice(0, 10) === today);
            const totalHH = inProgressWOs.reduce((s, w) => s + (w.estimated_hours || 0), 0);
            const p1p2 = inProgressWOs.filter(wo => ['P1', 'P2'].includes(wo.priority_code));
            return (
            <div className="space-y-5">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <Calendar size={20} /> Daily Execution Meeting
                    </h2>
                    <p className="text-blue-100 text-sm mt-1">{new Date().toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <button onClick={generateBriefing} disabled={briefingLoading}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors">
                    {briefingLoading ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                    AI Briefing
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-white/15 rounded-xl p-3 text-center backdrop-blur-sm">
                    <p className="text-2xl font-bold">{todayWOs.length}</p>
                    <p className="text-[10px] text-blue-100 uppercase font-semibold">Today</p>
                  </div>
                  <div className="bg-white/15 rounded-xl p-3 text-center backdrop-blur-sm">
                    <p className="text-2xl font-bold">{inProgressWOs.length}</p>
                    <p className="text-[10px] text-blue-100 uppercase font-semibold">Active WOs</p>
                  </div>
                  <div className="bg-white/15 rounded-xl p-3 text-center backdrop-blur-sm">
                    <p className="text-2xl font-bold">{p1p2.length}</p>
                    <p className="text-[10px] text-blue-100 uppercase font-semibold">P1/P2 Urgent</p>
                  </div>
                  <div className="bg-white/15 rounded-xl p-3 text-center backdrop-blur-sm">
                    <p className="text-2xl font-bold">{totalHH.toFixed(0)}h</p>
                    <p className="text-[10px] text-blue-100 uppercase font-semibold">Total HH</p>
                  </div>
                </div>
              </div>

              {/* AI Briefing */}
              {briefing && (
                <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl border border-purple-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-purple-800 flex items-center gap-2">
                      <Zap size={16} className="text-purple-600" /> AI Analysis & Recommendations
                    </span>
                    <button onClick={() => setBriefing(null)} className="text-xs text-purple-400 hover:text-purple-600">Dismiss</button>
                  </div>
                  <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-white rounded-xl p-4 border border-purple-100">
                    {briefing.briefing}
                  </div>
                </div>
              )}

              {/* Priority breakdown */}
              {p1p2.length > 0 && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
                  <h3 className="text-sm font-bold text-red-800 mb-3 flex items-center gap-2">
                    <AlertTriangle size={16} /> Priority Attention Required ({p1p2.length})
                  </h3>
                  <div className="space-y-2">
                    {p1p2.map(wo => (
                      <div key={wo.wo_id} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-red-100">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded text-white ${wo.priority_code === 'P1' ? 'bg-red-600' : 'bg-orange-500'}`}>{wo.priority_code}</span>
                        <div className="flex-1">
                          <span className="font-mono text-xs font-bold">{wo.wo_number}</span>
                          <span className="text-xs text-gray-500 ml-2">{wo.equipment_tag}</span>
                        </div>
                        <span className="text-xs text-gray-500">{wo.estimated_hours}h</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* WO Cards Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-800">Work Orders — Weekly Overview</h3>
                  <span className="text-xs text-gray-400">{inProgressWOs.length} total</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                  {inProgressWOs.slice(0, 30).map(wo => {
                    const pct = wo.status === 'PROGRAMADO' ? 0 : (wo.completion_pct || 0);
                    const workers = (wo.assigned_workers || []).map(w => typeof w === 'string' ? w : (w.name || w.full_name || '')).filter(Boolean);
                    return (
                      <div key={wo.wo_id || wo.work_order_id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer"
                        onClick={() => window.location.href = '/work-orders'}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-mono text-xs font-bold text-gray-900">{wo.wo_number}</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded text-white ${
                                wo.priority_code === 'P1' ? 'bg-red-500' : wo.priority_code === 'P2' ? 'bg-orange-500' : wo.priority_code === 'P4' ? 'bg-gray-500' : 'bg-blue-500'
                              }`}>{wo.priority_code}</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded border ${
                                wo.status === 'PROGRAMADO' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                wo.status === 'EN_EJECUCION' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                'bg-gray-50 text-gray-500 border-gray-200'
                              }`}>{wo.status}</span>
                            </div>
                            <p className="text-xs text-gray-600 truncate max-w-[250px]">{wo.equipment_tag} — {(wo.description || '').substring(0, 40)}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-bold text-gray-800">{wo.estimated_hours || 0}h</p>
                            <p className="text-[10px] text-gray-400">{wo.planned_start?.slice(5, 10) || ''}</p>
                          </div>
                        </div>
                        {workers.length > 0 && (
                          <div className="flex items-center gap-1 mb-2">
                            <User size={10} className="text-gray-400" />
                            <span className="text-[10px] text-gray-500 truncate">{workers.join(', ')}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-emerald-500' : pct > 0 ? 'bg-blue-500' : 'bg-gray-200'}`} style={{ width: `${Math.max(pct, 1)}%` }} />
                          </div>
                          <span className="text-[10px] font-bold text-gray-500 w-8 text-right">{pct}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            );
          })()}

          {tab === 'handovers' && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-700">{handovers.length}</p>
                  <p className="text-[10px] text-emerald-600 font-semibold uppercase">Total Handovers</p>
                </div>
                <div className="bg-green-50 rounded-xl border border-green-100 p-4 text-center">
                  <p className="text-2xl font-bold text-green-700">{handovers.filter(h => h.handover_type === 'TO_OPERATIONS').length}</p>
                  <p className="text-[10px] text-green-600 font-semibold uppercase">To Operations</p>
                </div>
                <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 text-center">
                  <p className="text-2xl font-bold text-blue-700">{handovers.filter(h => h.handover_type === 'TO_MAINTENANCE').length}</p>
                  <p className="text-[10px] text-blue-600 font-semibold uppercase">To Maintenance</p>
                </div>
              </div>

              {handovers.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <ArrowRightLeft size={48} className="mx-auto mb-3 opacity-40" />
                  <p className="text-lg font-medium">No handovers recorded</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {handovers.map(h => {
                    const isOps = h.handover_type === 'TO_OPERATIONS';
                    const timeAgo = h.handover_at ? (() => {
                      const diff = Date.now() - new Date(h.handover_at).getTime();
                      const hrs = Math.floor(diff / 3600000);
                      return hrs < 1 ? 'Just now' : hrs < 24 ? `${hrs}h ago` : `${Math.floor(hrs/24)}d ago`;
                    })() : '';
                    return (
                      <div key={h.handover_id} className={`rounded-2xl border-2 overflow-hidden transition-all hover:shadow-md ${isOps ? 'border-green-200' : 'border-blue-200'}`}>
                        <div className={`px-5 py-3 flex items-center justify-between ${isOps ? 'bg-green-50' : 'bg-blue-50'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isOps ? 'bg-green-500' : 'bg-blue-500'}`}>
                              <ArrowRightLeft size={18} className="text-white" />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900">{h.equipment_tag}</h3>
                              <span className={`text-[10px] font-bold uppercase ${isOps ? 'text-green-600' : 'text-blue-600'}`}>
                                {isOps ? 'Delivered to Operations' : 'Returned to Maintenance'}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-gray-500 block">{h.handover_at?.slice(0, 16).replace('T', ' ')}</span>
                            <span className="text-[10px] text-gray-400">{timeAgo}</span>
                          </div>
                        </div>
                        <div className="px-5 py-3 bg-white">
                          <div className="flex items-center gap-4 mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center text-[10px] font-bold text-red-700">{(h.from_user || '?')[0]}</div>
                              <div>
                                <p className="text-[10px] text-gray-400 uppercase">From</p>
                                <p className="text-xs font-semibold text-gray-800">{h.from_user}</p>
                              </div>
                            </div>
                            <ArrowRight size={16} className="text-gray-300" />
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-700">{(h.to_user || '?')[0]}</div>
                              <div>
                                <p className="text-[10px] text-gray-400 uppercase">To</p>
                                <p className="text-xs font-semibold text-gray-800">{h.to_user}</p>
                              </div>
                            </div>
                            <div className="ml-auto flex items-center gap-2">
                              {h.tests_passed ? (
                                <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg"><CheckCircle size={12} /> Tests OK</span>
                              ) : (
                                <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-lg"><AlertTriangle size={12} /> Tests Pending</span>
                              )}
                            </div>
                          </div>
                          {h.condition_notes && (
                            <div className="bg-gray-50 rounded-lg p-3 mt-2">
                              <p className="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">Condition Notes</p>
                              <p className="text-xs text-gray-700">{h.condition_notes}</p>
                            </div>
                          )}
                          {h.test_notes && h.test_notes !== 'Functional test OK' && (
                            <p className="text-[10px] text-gray-500 italic mt-1">{h.test_notes}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {tab === 'signoff' && (() => {
            // Show recently closed WOs + completed for sign-off
            const signoffWOs = [...completedWOs, ...cerradoWOs].slice(0, 20);
            return (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-600 to-violet-600 rounded-2xl p-6 text-white">
                <h2 className="text-lg font-bold flex items-center gap-2 mb-1">
                  <Shield size={20} /> Supervisor Sign-off
                </h2>
                <p className="text-purple-100 text-sm">Review and approve completed work orders before technical closure</p>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="bg-white/15 rounded-xl p-3 text-center backdrop-blur-sm">
                    <p className="text-2xl font-bold">{signoffWOs.length}</p>
                    <p className="text-[10px] text-purple-100 uppercase font-semibold">Pending Review</p>
                  </div>
                  <div className="bg-white/15 rounded-xl p-3 text-center backdrop-blur-sm">
                    <p className="text-2xl font-bold">{signoffWOs.filter(w => w.actual_hours).length}</p>
                    <p className="text-[10px] text-purple-100 uppercase font-semibold">Hours Reported</p>
                  </div>
                  <div className="bg-white/15 rounded-xl p-3 text-center backdrop-blur-sm">
                    <p className="text-2xl font-bold">{signoffWOs.reduce((s, w) => s + (parseFloat(w.actual_hours) || 0), 0).toFixed(0)}h</p>
                    <p className="text-[10px] text-purple-100 uppercase font-semibold">Total Actual HH</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {signoffWOs.length > 0 ? signoffWOs.map(wo => {
                  const planned = parseFloat(wo.estimated_hours) || 0;
                  const actual = parseFloat(wo.actual_hours) || 0;
                  const delta = actual - planned;
                  const workers = (wo.assigned_workers || []).map(w => typeof w === 'string' ? w : (w.name || w.full_name || '')).filter(Boolean);
                  return (
                  <div key={wo.wo_id || wo.work_order_id} className="bg-white rounded-2xl border-2 border-gray-200 hover:border-purple-300 transition-all overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-sm font-bold text-gray-900">{wo.wo_number}</span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded text-white ${
                              wo.priority_code === 'P1' ? 'bg-red-500' : wo.priority_code === 'P2' ? 'bg-orange-500' : 'bg-blue-500'
                            }`}>{wo.priority_code}</span>
                            <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold">{wo.status}</span>
                          </div>
                          <p className="text-sm text-gray-700 truncate">{wo.equipment_tag} — {wo.description}</p>
                          {workers.length > 0 && (
                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><User size={10} /> {workers.join(', ')}</p>
                          )}
                        </div>
                        <button onClick={() => handleSupervisorSignOff(wo.wo_id || wo.work_order_id)}
                          disabled={signingOff === (wo.wo_id || wo.work_order_id)}
                          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 shrink-0 ml-4">
                          {signingOff === (wo.wo_id || wo.work_order_id) ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
                          Sign Off
                        </button>
                      </div>
                    </div>
                    <div className="px-4 py-2 bg-gray-50 border-t flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-gray-500">Plan: <span className="font-bold">{planned}h</span></span>
                        <span className="text-gray-500">Actual: <span className="font-bold">{actual}h</span></span>
                        {delta !== 0 && <span className={`font-bold ${delta > 0 ? 'text-red-600' : 'text-green-600'}`}>{delta > 0 ? '+' : ''}{delta.toFixed(1)}h</span>}
                      </div>
                      <span className="text-[10px] text-gray-400">{wo.wo_type}</span>
                    </div>
                  </div>
                  );
                }) : (
                  <div className="text-center py-16 text-gray-400">
                    <Shield size={48} className="mx-auto mb-3 opacity-40" />
                    <p className="text-lg font-medium">No WOs pending sign-off</p>
                  </div>
                )}
              </div>
            </div>
            );
          })()}
        </>
      )}


          {tab === 'closure' && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <h2 className="text-sm font-bold text-green-800 flex items-center gap-2 mb-2">
                  <CheckCircle2 size={16} /> WO Closure — Verification & Material Return
                </h2>
                <p className="text-xs text-green-600">
                  Record actual data, verify with AI, return materials, and close work orders.
                </p>
              </div>

              {/* WOs ready for closure (EN_EJECUCION + COMPLETED) */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white rounded-xl border p-4 text-center">
                  <p className="text-2xl font-bold text-amber-700">{enExecutionWOs.length}</p>
                  <p className="text-xs text-gray-500">In Execution</p>
                </div>
                <div className="bg-white rounded-xl border p-4 text-center">
                  <p className="text-2xl font-bold text-green-700">{cerradoWOs.length}</p>
                  <p className="text-xs text-gray-500">Already Closed</p>
                </div>
              </div>

              {closureWO ? (
                <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-lg font-bold text-gray-900">{closureWO.wo_number}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700">{closureWO.status}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">{closureWO.wo_type}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{closureWO.equipment_tag} — {closureWO.description}</p>
                    </div>
                    <button onClick={() => { setClosureWO(null); setAiResult(null); }} className="text-gray-400 hover:text-gray-600 p-1">
                      <Wrench size={16} />
                    </button>
                  </div>

                  {/* Actual hours */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">Planned Hours</label>
                      <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm font-medium">{closureWO.estimated_hours || 0}h</div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">Actual Hours Worked *</label>
                      <div className="flex gap-2">
                        <input type="number" step="0.5" min="0" value={closureForm.actual_hours}
                          onChange={e => setClosureForm(p => ({...p, actual_hours: e.target.value}))}
                          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500" placeholder="e.g. 6.5" />
                        <button onClick={() => estimateDuration(closureWO)} disabled={estimating}
                          className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium hover:bg-purple-200 disabled:opacity-50 flex items-center gap-1 whitespace-nowrap">
                          {estimating ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
                          AI Estimate
                        </button>
                      </div>
                      {estimateResult && (
                        <div className="mt-1 text-xs text-purple-600 bg-purple-50 rounded px-2 py-1">
                          AI prediction: <strong>{estimateResult.predicted_hours}h</strong>
                          {estimateResult.confidence && <span className="text-gray-400 ml-1">({estimateResult.confidence}% confidence)</span>}
                          {estimateResult.reasoning && <span className="text-gray-500 ml-1">- {estimateResult.reasoning}</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Variance indicator */}
                  {closureForm.actual_hours && closureWO.estimated_hours && (() => {
                    const plan = parseFloat(closureWO.estimated_hours);
                    const real = parseFloat(closureForm.actual_hours);
                    const delta = real - plan;
                    const pct = plan > 0 ? Math.round((real/plan)*100) : 0;
                    const over = delta > 0;
                    return <div className={"rounded-lg p-3 border "+(over ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200")}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">{pct}% of estimate</span>
                        <span className={"text-sm font-bold "+(over ? "text-red-600" : "text-green-600")}>{over ? "+" : ""}{delta.toFixed(1)}h {over ? "over" : "under"}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div className={"h-2 rounded-full "+(over ? "bg-red-500" : "bg-green-500")} style={{width: Math.min(pct, 150)+"%"}} />
                      </div>
                    </div>;
                  })()}

                  {/* External services */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-2">External Services</label>
                    {(closureForm.external_services || []).length > 0 && (
                      <div className="space-y-1.5 mb-2">
                        {closureForm.external_services.map((svc, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-1.5 border border-blue-100 text-sm">
                            <span className="flex-1">{svc.description}</span>
                            <span className="text-blue-600 font-medium text-xs">${parseFloat(svc.cost || 0).toFixed(2)}</span>
                            <button onClick={() => setClosureForm(p => ({...p, external_services: p.external_services.filter((_, i) => i !== idx)}))}
                              className="text-red-400 hover:text-red-600"><X size={13} /></button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input className="flex-1 border rounded-lg px-2 py-1.5 text-xs" placeholder="External service description" id="closure-ext-desc" />
                      <input className="w-24 border rounded-lg px-2 py-1.5 text-xs" type="number" placeholder="Cost ($)" id="closure-ext-cost" min="0" />
                      <button onClick={() => {
                          const desc = document.getElementById('closure-ext-desc').value;
                          const cost = parseFloat(document.getElementById('closure-ext-cost').value) || 0;
                          if (!desc) return;
                          setClosureForm(p => ({...p, external_services: [...(p.external_services || []), { description: desc, cost }]}));
                          document.getElementById('closure-ext-desc').value = '';
                          document.getElementById('closure-ext-cost').value = '';
                        }}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700">+ Add</button>
                    </div>
                  </div>

                  {/* Materials used/returned */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-2">Materials — Planned vs Used</label>
                    {(closureWO.materials || []).length > 0 ? (
                      <div className="space-y-2">
                        {(closureWO.materials || []).map((mat, idx) => (
                          <div key={idx} className="flex items-center gap-3 bg-gray-50 rounded-lg p-2.5 border">
                            <div className="flex-1">
                              <span className="text-xs font-mono text-gray-500">{mat.sapId || mat.code || ''}</span>
                              <span className="text-sm ml-2">{mat.description || mat.name || 'Material'}</span>
                            </div>
                            <div className="text-xs text-gray-500">Plan: {mat.quantity || 0} {mat.unit || 'PZ'}</div>
                            <div className="flex items-center gap-1">
                              <label className="text-[10px] text-gray-400">Used:</label>
                              <input type="number" min="0" defaultValue={mat.quantity || 0}
                                onChange={e => {
                                  const mats = [...closureForm.materials_returned];
                                  mats[idx] = { ...mat, quantity_used: parseInt(e.target.value) || 0 };
                                  setClosureForm(p => ({...p, materials_returned: mats}));
                                }}
                                className="w-16 border rounded px-2 py-1 text-xs text-center" />
                            </div>
                            <div className="flex items-center gap-1">
                              <label className="text-[10px] text-gray-400">Unit $:</label>
                              <input type="number" min="0" step="0.01" defaultValue={mat.unit_price || 0}
                                onChange={e => {
                                  const mats = [...(closureForm.materials_returned || [])];
                                  if (!mats[idx]) mats[idx] = { ...mat };
                                  mats[idx] = { ...mats[idx], unit_price: parseFloat(e.target.value) || 0 };
                                  setClosureForm(p => ({...p, materials_returned: mats}));
                                }}
                                className="w-20 border rounded px-2 py-1 text-xs text-center" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic py-3">No materials planned for this WO</p>
                    )}
                  </div>

                  {/* Cost Summary Table */}
                  {closureForm.actual_hours && (() => {
                    const { laborCost, matCost, extCost, totalActual, plannedLabor, plannedMat, plannedExt } = calcCosts(closureForm, closureWO);
                    const plannedTotal = plannedLabor + plannedMat + plannedExt || parseFloat(closureWO.estimated_cost || closureWO.planned_total_cost || 0);
                    const deltaLabor = laborCost - plannedLabor;
                    const deltaMat = matCost - plannedMat;
                    const deltaExt = extCost - plannedExt;
                    const deltaTotal = totalActual - (plannedTotal || 0);
                    return (
                      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 text-white">
                        <div className="flex items-center gap-2 mb-4">
                          <DollarSign size={16} className="text-emerald-400" />
                          <span className="text-sm font-bold text-white uppercase tracking-wide">Cost Summary — Planned vs Actual</span>
                        </div>
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-slate-400 text-xs uppercase border-b border-slate-700">
                              <th className="text-left py-2 font-medium">Category</th>
                              <th className="text-right py-2 font-medium">Planned</th>
                              <th className="text-right py-2 font-medium">Actual</th>
                              <th className="text-right py-2 font-medium">Delta</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-700/50">
                            <tr>
                              <td className="py-2.5 text-slate-300">Labor ({closureForm.actual_hours}h x ${LABOR_RATE}/hr)</td>
                              <td className="text-right text-slate-300">${plannedLabor.toFixed(2)}</td>
                              <td className="text-right font-medium text-white">${laborCost.toFixed(2)}</td>
                              <td className={`text-right font-bold ${deltaLabor > 0 ? 'text-red-400' : deltaLabor < 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                                {deltaLabor > 0 ? '+' : ''}{deltaLabor.toFixed(2)}
                              </td>
                            </tr>
                            <tr>
                              <td className="py-2.5 text-slate-300">Materials</td>
                              <td className="text-right text-slate-300">${plannedMat.toFixed(2)}</td>
                              <td className="text-right font-medium text-white">${matCost.toFixed(2)}</td>
                              <td className={`text-right font-bold ${deltaMat > 0 ? 'text-red-400' : deltaMat < 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                                {deltaMat > 0 ? '+' : ''}{deltaMat.toFixed(2)}
                              </td>
                            </tr>
                            <tr>
                              <td className="py-2.5 text-slate-300">External Services</td>
                              <td className="text-right text-slate-300">${plannedExt.toFixed(2)}</td>
                              <td className="text-right font-medium text-white">${extCost.toFixed(2)}</td>
                              <td className={`text-right font-bold ${deltaExt > 0 ? 'text-red-400' : deltaExt < 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                                {deltaExt > 0 ? '+' : ''}{deltaExt.toFixed(2)}
                              </td>
                            </tr>
                            <tr className="border-t-2 border-slate-500">
                              <td className="py-3 font-bold text-white">TOTAL</td>
                              <td className="text-right font-bold text-slate-200">${(plannedTotal || 0).toFixed(2)}</td>
                              <td className="text-right font-bold text-emerald-400 text-base">${totalActual.toFixed(2)}</td>
                              <td className={`text-right font-bold text-base ${deltaTotal > 0 ? 'text-red-400' : deltaTotal < 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                                {deltaTotal > 0 ? '+' : ''}{deltaTotal.toFixed(2)}
                                {plannedTotal > 0 && <span className="text-xs font-normal ml-1 text-slate-400">({Math.round((totalActual / plannedTotal) * 100)}%)</span>}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <p className="text-[10px] text-slate-500 mt-3">Labor rate: ${LABOR_RATE}/hr · Saved to WO on close, reflected in Planning Costs tab</p>
                      </div>
                    );
                  })()}

                  {/* E49: Operations Plan vs Real */}
                  {(closureWO.operations || []).length > 0 && (
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-2">Operations — Plan vs Actual</label>
                      <div className="space-y-2">
                        <div className="grid grid-cols-8 gap-2 text-[10px] font-semibold text-gray-500 uppercase px-2">
                          <span className="col-span-3">Operation</span>
                          <span>Specialty</span>
                          <span>Plan Qty</span>
                          <span>Plan Hrs</span>
                          <span>Real Qty</span>
                          <span>Real Hrs</span>
                        </div>
                        {closureWO.operations.map((op, idx) => (
                          <div key={idx} className="grid grid-cols-8 gap-2 items-center bg-gray-50 rounded-lg p-2 border text-xs">
                            <span className="col-span-3 font-medium truncate">#{idx+1} {op.description || ''}</span>
                            <span className="text-gray-500">{op.specialty || '—'}</span>
                            <span className="text-blue-600 font-semibold text-center">{op.quantity || 0}</span>
                            <span className="text-blue-600 font-semibold text-center">{op.hours || 0}h</span>
                            <input type="number" min="0" defaultValue={op.actual_quantity || op.quantity || 0}
                              className="w-full border rounded px-1 py-0.5 text-center text-xs bg-amber-50 border-amber-200" />
                            <input type="number" min="0" step="0.5" defaultValue={op.actual_hours || op.hours || 0}
                              className="w-full border rounded px-1 py-0.5 text-center text-xs bg-amber-50 border-amber-200" />
                          </div>
                        ))}
                        <div className="grid grid-cols-8 gap-2 items-center px-2 text-xs font-bold border-t pt-2">
                          <span className="col-span-3">TOTAL</span>
                          <span></span>
                          <span className="text-blue-700 text-center">{closureWO.operations.reduce((s, o) => s + (o.quantity || 0), 0)}</span>
                          <span className="text-blue-700 text-center">{closureWO.operations.reduce((s, o) => s + (o.hours || 0), 0)}h</span>
                          <span className="text-amber-700 text-center">{closureWO.operations.reduce((s, o) => s + (o.quantity || 0), 0)}</span>
                          <span className="text-amber-700 text-center">{closureWO.operations.reduce((s, o) => s + (o.hours || 0), 0)}h</span>
                        </div>
                        <div className="text-[10px] text-gray-400 italic">Blue = planned · Amber = actual (editable in execution)</div>
                      </div>
                    </div>
                  )}

                  {/* Observations */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Execution Observations</label>
                    <textarea rows={3} value={closureForm.observations}
                      onChange={e => setClosureForm(p => ({...p, observations: e.target.value}))}
                      className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
                      placeholder="Findings, problems encountered, additional work..." />
                  </div>

                  {/* AI Result */}
                  {aiResult && (
                    <div className={"rounded-xl p-4 border-2 "+(aiResult.ready ? "bg-green-50 border-green-300" : "bg-amber-50 border-amber-300")}>
                      <div className="flex items-center gap-2 mb-2">
                        {aiResult.ready ? <CheckCircle2 size={18} className="text-green-600" /> : <AlertTriangle size={18} className="text-amber-600" />}
                        <span className={"text-sm font-bold "+(aiResult.ready ? "text-green-800" : "text-amber-800")}>
                          {aiResult.ready ? "WO ready to close" : "Review before closing"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 whitespace-pre-line">{aiResult.message}</p>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => saveExecutionData(closureWO)} disabled={!closureForm.actual_hours}
                      className="px-4 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                      Save Data
                    </button>
                    <button onClick={() => verifyAndClose(closureWO)} disabled={verifying || !closureForm.actual_hours}
                      className="px-4 py-2.5 text-sm font-semibold bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 flex items-center gap-2">
                      {verifying ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                      {verifying ? 'Verifying...' : 'AI Verify'}
                    </button>
                    <a href={'/api/v1/managed-work-orders/' + closureWO.wo_id + '/closure-report'}
                      target="_blank"
                      className="px-4 py-2.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border border-gray-300 flex items-center gap-1">
                      PDF Report
                    </a>
                    <button onClick={() => handleCloseWO(closureWO)}
                      disabled={closing || !closureForm.actual_hours || (aiResult && !aiResult.ready)}
                      className="px-5 py-2.5 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2">
                      {closing ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                      {closing ? 'Closing...' : 'Close WO'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700">WOs In Execution — Select to Close</h3>
                  {[...enExecutionWOs, ...inProgressWOs].length > 0 ? [...enExecutionWOs, ...inProgressWOs].map(wo => (
                    <div key={wo.wo_id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:border-green-300 cursor-pointer transition-colors"
                      onClick={() => { setClosureWO(wo); setClosureForm({ actual_hours: wo.actual_hours || '', observations: '', materials_returned: [], external_services: [] }); setAiResult(null); setEstimateResult(null); }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-sm font-bold">{wo.wo_number}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${wo.priority_code === 'P1' ? 'bg-red-100 text-red-700' : wo.priority_code === 'P2' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{wo.priority_code}</span>
                            <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700">{wo.status}</span>
                          </div>
                          <p className="text-sm text-gray-600">{wo.equipment_tag} — {(wo.description || '').slice(0, 80)}</p>
                          <p className="text-xs text-gray-400 mt-1">{wo.estimated_hours}h planned · {wo.wo_type}</p>
                        </div>
                        <ArrowRightLeft size={16} className="text-green-500" />
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-16 text-gray-400">
                      <CheckCircle2 size={48} className="mx-auto mb-3 opacity-40" />
                      <p>No WOs in execution</p>
                    </div>
                  )}

                  {cerradoWOs.length > 0 && (
                    <>
                      <h3 className="text-sm font-semibold text-gray-500 mt-6">Recently Closed</h3>
                      {cerradoWOs.slice(0, 5).map(wo => (
                        <div key={wo.wo_id} className="bg-gray-50 rounded-xl border border-gray-100 p-3 opacity-60">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 size={14} className="text-green-500" />
                            <span className="font-mono text-xs font-bold">{wo.wo_number}</span>
                            <span className="text-xs text-gray-500">{wo.equipment_tag}</span>
                            <span className="text-xs text-gray-400 ml-auto">{wo.actual_hours || wo.estimated_hours}h</span>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

      {/* WO Execution Detail Modal */}
      {selectedExecWO && (
        <WOExecutionDetail wo={selectedExecWO} onClose={() => setSelectedExecWO(null)} />
      )}

      {/* Modals */}
      {showAssignModal && <AssignModal />}
      {showHandoverModal && <HandoverModal />}
    </div>
  );
}
