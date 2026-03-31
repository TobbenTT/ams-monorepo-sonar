import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Wrench, ClipboardCheck, ArrowRightLeft, Plus, CheckCircle2,
  Clock, AlertTriangle, User, Send, RefreshCw, ChevronDown, ChevronUp, Zap,
  Calendar, Shield, Loader2
} from 'lucide-react';
import { useToast } from '../components/Toast';
import {
  getMyTasks, listExecutionTasks, assignExecutionTask,
  updateTaskProgress, partialNotification, completeExecutionTask,
  confirmTaskUnderstood, createHandover, listHandovers,
  listManagedWOs, authListUsers, completeManagedWO,
  updateManagedWO, verifyCloseManagedWO, closeManagedWO,
} from '../api';

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
  const [closureForm, setClosureForm] = useState({ actual_hours: '', observations: '', materials_returned: [] });
  const [aiResult, setAiResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [closing, setClosing] = useState(false);
  const [enExecutionWOs, setEnExecutionWOs] = useState([]);
  const [cerradoWOs, setCerradoWOs] = useState([]);

  useEffect(() => { refresh(); loadFastTrack(); loadWOsForTabs(); }, [tab]);

  async function loadFastTrack() {
    try {
      const wos = await listManagedWOs({ fast_track: true, limit: 20 });
      const list = Array.isArray(wos) ? wos : wos.items || [];
      setFastTrackWOs(list.filter(w => ['RELEASED', 'SCHEDULED', 'IN_PROGRESS'].includes(w.status)));
    } catch { /* ignore */ }
  }

  async function loadWOsForTabs() {
    try {
      const [ipRes, compRes, ejRes, cerRes] = await Promise.all([
        listManagedWOs({ status: 'IN_PROGRESS', limit: 50 }),
        listManagedWOs({ status: 'COMPLETED', limit: 50 }),
        listManagedWOs({ status: 'EN_EJECUCION', limit: 50 }),
        listManagedWOs({ status: 'CERRADO', limit: 50 }),
      ]);
      setInProgressWOs(Array.isArray(ipRes) ? ipRes : ipRes.items || []);
      setCompletedWOs(Array.isArray(compRes) ? compRes : compRes.items || []);
      setEnExecutionWOs(Array.isArray(ejRes) ? ejRes : ejRes.items || []);
      setCerradoWOs(Array.isArray(cerRes) ? cerRes : cerRes.items || []);
    } catch { /* ignore */ }
  }

  async function saveExecutionData(wo) {
    try {
      await updateManagedWO(wo.wo_id, {
        actual_hours: parseFloat(closureForm.actual_hours) || 0,
        labor_cost: (parseFloat(closureForm.actual_hours) || 0) * 50,
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
      await updateManagedWO(wo.wo_id, {
        actual_hours: parseFloat(closureForm.actual_hours) || 0,
        labor_cost: (parseFloat(closureForm.actual_hours) || 0) * 50,
      });
      await completeManagedWO(wo.wo_id, { actual_hours: parseFloat(closureForm.actual_hours) || 0 });
      toast.success(wo.wo_number + ' closed successfully');
      setClosureWO(null);
      setClosureForm({ actual_hours: '', observations: '', materials_returned: [] });
      setAiResult(null);
      loadWOsForTabs();
    } catch (e) { toast.error('Close error: ' + e.message); }
    finally { setClosing(false); }
  }

  async function handleSupervisorSignOff(woId) {
    setSigningOff(woId);
    try {
      await completeManagedWO(woId, { supervisor_approved: true });
      toast.success('Supervisor sign-off recorded — WO ready for closure');
      loadWOsForTabs();
    } catch (e) {
      toast.error('Error: ' + e.message);
    }
    setSigningOff(null);
  }

  async function refresh() {
    setLoading(true);
    try {
      if (tab === 'my') {
        setMyTasks(await getMyTasks());
      } else if (tab === 'all') {
        setAllTasks(await listExecutionTasks());
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
                Assigned to: <span className="font-medium">{task.assigned_to}</span>
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
      authListUsers().then(r => setUsers(Array.isArray(r) ? r : r.users || [])).catch(() => {});
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
              <option value="">Seleccionar...</option>
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
            <div className="space-y-3">
              {tasks.length === 0 ? (
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

          {tab === 'daily' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h2 className="text-sm font-bold text-blue-800 flex items-center gap-2 mb-2">
                  <Calendar size={16} /> Daily Meeting de Execution
                </h2>
                <p className="text-xs text-blue-600 mb-3">
                  Review of HH capacity, assignments and status of active WOs for the day.
                </p>
              </div>

              {/* Daily summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white rounded-xl border p-4 text-center">
                  <p className="text-2xl font-bold text-blue-700">{inProgressWOs.length}</p>
                  <p className="text-xs text-gray-500">WOs In Progress</p>
                </div>
                <div className="bg-white rounded-xl border p-4 text-center">
                  <p className="text-2xl font-bold text-amber-700">{fastTrackWOs.length}</p>
                  <p className="text-xs text-gray-500">Emergencies</p>
                </div>
                <div className="bg-white rounded-xl border p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-700">{completedWOs.length}</p>
                  <p className="text-xs text-gray-500">Completed Today</p>
                </div>
                <div className="bg-white rounded-xl border p-4 text-center">
                  <p className="text-2xl font-bold text-gray-700">
                    {inProgressWOs.reduce((s, w) => s + (w.estimated_hours || 0), 0)}h
                  </p>
                  <p className="text-xs text-gray-500">HH Assigned</p>
                </div>
              </div>

              {/* Active WOs list */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="px-4 py-3 border-b border-gray-100">
                  <span className="text-sm font-bold text-gray-700">Active WOs — Daily Review</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {inProgressWOs.length > 0 ? inProgressWOs.map(wo => (
                    <div key={wo.wo_id || wo.work_order_id} className="p-4">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-gray-900">{wo.wo_number}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            wo.priority_code === 'P1' ? 'bg-red-100 text-red-700' :
                            wo.priority_code === 'P2' ? 'bg-orange-100 text-orange-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>{wo.priority_code}</span>
                          {wo.is_fast_track && <Zap size={12} className="text-amber-500" />}
                        </div>
                        <span className="text-xs text-gray-400">{wo.estimated_hours || 0}h</span>
                      </div>
                      <p className="text-sm text-gray-600">{wo.equipment_tag} — {wo.description}</p>
                      {wo.assigned_workers?.length > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <User size={10} className="text-gray-400" />
                          <span className="text-xs text-gray-500">{wo.assigned_workers.join(', ')}</span>
                        </div>
                      )}
                      {wo.completion_pct > 0 && (
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                          <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${wo.completion_pct}%` }} />
                        </div>
                      )}
                    </div>
                  )) : (
                    <div className="text-center py-10 text-gray-400">
                      <p>No WOs in progress</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {tab === 'handovers' && (
            <div className="space-y-3">
              {handovers.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <ArrowRightLeft size={48} className="mx-auto mb-3 opacity-40" />
                  <p className="text-lg font-medium">No handovers recorded</p>
                </div>
              ) : (
                handovers.map(h => (
                  <div key={h.handover_id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            h.handover_type === 'TO_OPERATIONS' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {h.handover_type === 'TO_OPERATIONS' ? 'To Operations' : 'To Maintenance'}
                          </span>
                          {h.tests_passed && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                              Tests OK
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900">{h.equipment_tag}</h3>
                        <p className="text-sm text-gray-500">
                          De: <span className="font-medium">{h.from_user}</span> → A: <span className="font-medium">{h.to_user}</span>
                        </p>
                        {h.condition_notes && <p className="text-sm text-gray-600 mt-1">{h.condition_notes}</p>}
                        {h.test_notes && <p className="text-sm text-gray-500 mt-1 italic">{h.test_notes}</p>}
                      </div>
                      <span className="text-xs text-gray-400">{h.handover_at?.slice(0, 16).replace('T', ' ')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'signoff' && (
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <h2 className="text-sm font-bold text-purple-800 flex items-center gap-2 mb-2">
                  <Shield size={16} /> Supervisor Sign-off — Formal Handover
                </h2>
                <p className="text-xs text-purple-600">
                  Completed WOs requiring supervisor sign-off before technical closure.
                </p>
              </div>

              <div className="space-y-3">
                {completedWOs.length > 0 ? completedWOs.map(wo => (
                  <div key={wo.wo_id || wo.work_order_id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm font-bold text-gray-900">{wo.wo_number}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">COMPLETED</span>
                          {wo.is_fast_track && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Fast-Track</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700">{wo.equipment_tag} — {wo.description}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {wo.estimated_hours}h estimadas · {wo.actual_hours || wo.estimated_hours}h reales
                        </p>
                      </div>
                      <button
                        onClick={() => handleSupervisorSignOff(wo.wo_id || wo.work_order_id)}
                        disabled={signingOff === (wo.wo_id || wo.work_order_id)}
                        className="flex items-center gap-1 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50"
                      >
                        {signingOff === (wo.wo_id || wo.work_order_id) ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Shield size={14} />
                        )}
                        Sign Off
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-16 text-gray-400">
                    <Shield size={48} className="mx-auto mb-3 opacity-40" />
                    <p className="text-lg font-medium">No WOs pending sign-off</p>
                  </div>
                )}
              </div>
            </div>
          )}
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
                      <input type="number" step="0.5" min="0" value={closureForm.actual_hours}
                        onChange={e => setClosureForm(p => ({...p, actual_hours: e.target.value}))}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500" placeholder="e.g. 6.5" />
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
                              <label className="text-[10px] text-gray-400">Return:</label>
                              <input type="number" min="0" defaultValue={0}
                                className="w-16 border rounded px-2 py-1 text-xs text-center" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic py-3">No materials planned for this WO</p>
                    )}
                  </div>

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
                      onClick={() => { setClosureWO(wo); setClosureForm({ actual_hours: wo.actual_hours || '', observations: '', materials_returned: [] }); setAiResult(null); }}>
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

      {/* Modals */}
      {showAssignModal && <AssignModal />}
      {showHandoverModal && <HandoverModal />}
    </div>
  );
}
