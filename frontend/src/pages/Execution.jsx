import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Wrench, ClipboardCheck, ArrowRightLeft, Plus, CheckCircle2,
  Clock, AlertTriangle, User, Send, RefreshCw, ChevronDown, ChevronUp, Zap
} from 'lucide-react';
import {
  getMyTasks, listExecutionTasks, assignExecutionTask,
  updateTaskProgress, partialNotification, completeExecutionTask,
  confirmTaskUnderstood, createHandover, listHandovers,
  listManagedWOs, authListUsers,
} from '../api';

const STATUS_COLORS = {
  ASSIGNED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-green-100 text-green-700',
  PENDING: 'bg-gray-100 text-gray-600',
  CANCELLED: 'bg-red-100 text-red-700',
};

const TABS = [
  { key: 'my', label: 'Mis Tareas', icon: User },
  { key: 'all', label: 'Todas las Tareas', icon: ClipboardCheck },
  { key: 'handovers', label: 'Entregas de Equipo', icon: ArrowRightLeft },
];

export default function Execution() {
  const { plant } = useOutletContext();
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

  useEffect(() => { refresh(); loadFastTrack(); }, [tab]);

  async function loadFastTrack() {
    try {
      const wos = await listManagedWOs({ fast_track: true, limit: 20 });
      const list = Array.isArray(wos) ? wos : wos.items || [];
      setFastTrackWOs(list.filter(w => ['RELEASED', 'SCHEDULED', 'IN_PROGRESS'].includes(w.status)));
    } catch { /* ignore */ }
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
                    Entendida
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 truncate">{task.task_description || 'Sin descripcion'}</h3>
              <p className="text-sm text-gray-500 mt-1">
                Asignado a: <span className="font-medium">{task.assigned_to}</span>
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
                <label className="text-sm font-medium text-gray-700">Progreso</label>
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
                  placeholder="Agregar nota de avance o cambio de turno..."
                  className="w-full mt-1 border border-gray-200 rounded-lg p-2 text-sm"
                  rows={2}
                />
                <textarea
                  value={shiftNote}
                  onChange={e => setShiftNote(e.target.value)}
                  placeholder="Notas de entrega de turno (opcional)..."
                  className="w-full mt-1 border border-gray-200 rounded-lg p-2 text-sm"
                  rows={2}
                />
                <button
                  onClick={() => handlePartial(task.assignment_id)}
                  disabled={!noteText && !shiftNote}
                  className="mt-2 flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-40"
                >
                  <Send size={14} /> Enviar Nota
                </button>
              </div>
            )}

            {/* Existing notes */}
            {task.partial_notes?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Historial de Notas</h4>
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
                  <CheckCircle2 size={16} /> Completar Tarea
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
      listManagedWOs({ status: 'IN_PROGRESS', limit: 50 }).then(r => setWos(Array.isArray(r) ? r : r.items || [])).catch(() => {});
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
          <h2 className="text-lg font-bold text-gray-900">Asignar Tarea</h2>
          <div>
            <label className="text-sm font-medium text-gray-700">Orden de Trabajo</label>
            <select value={form.wo_id} onChange={e => setForm({...form, wo_id: e.target.value})} className="w-full border rounded-lg p-2 mt-1">
              <option value="">Seleccionar OT...</option>
              {wos.map(w => <option key={w.wo_id} value={w.wo_id}>{w.wo_number} — {(w.description || '').slice(0, 50)}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Tecnico</label>
            <select value={form.assigned_to} onChange={e => setForm({...form, assigned_to: e.target.value})} className="w-full border rounded-lg p-2 mt-1">
              <option value="">Seleccionar...</option>
              {users.map(u => <option key={u.user_id} value={u.username}>{u.full_name || u.username} ({u.role})</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Descripcion de la tarea</label>
            <textarea value={form.task_description} onChange={e => setForm({...form, task_description: e.target.value})} className="w-full border rounded-lg p-2 mt-1" rows={2} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Horas estimadas</label>
            <input type="number" value={form.estimated_hours} onChange={e => setForm({...form, estimated_hours: Number(e.target.value)})} className="w-full border rounded-lg p-2 mt-1" min="0.5" step="0.5" />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowAssignModal(false)} className="px-4 py-2 border rounded-lg text-sm">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">Asignar</button>
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
          <h2 className="text-lg font-bold text-gray-900">Entrega de Equipo</h2>
          <div>
            <label className="text-sm font-medium text-gray-700">OT relacionada</label>
            <select value={form.wo_id} onChange={e => {
              const wo = wos.find(w => w.wo_id === e.target.value);
              setForm({...form, wo_id: e.target.value, equipment_tag: wo?.equipment_tag || form.equipment_tag });
            }} className="w-full border rounded-lg p-2 mt-1">
              <option value="">Seleccionar OT...</option>
              {wos.map(w => <option key={w.wo_id} value={w.wo_id}>{w.wo_number} — {w.equipment_tag}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Tag de Equipo</label>
            <input value={form.equipment_tag} onChange={e => setForm({...form, equipment_tag: e.target.value})} className="w-full border rounded-lg p-2 mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Entregar a (usuario)</label>
            <input value={form.to_user} onChange={e => setForm({...form, to_user: e.target.value})} className="w-full border rounded-lg p-2 mt-1" placeholder="Nombre del operador" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Condicion del equipo</label>
            <textarea value={form.condition_notes} onChange={e => setForm({...form, condition_notes: e.target.value})} className="w-full border rounded-lg p-2 mt-1" rows={2} />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.tests_passed} onChange={e => setForm({...form, tests_passed: e.target.checked})} className="accent-emerald-600" />
              Pruebas completadas
            </label>
          </div>
          {form.tests_passed && (
            <div>
              <label className="text-sm font-medium text-gray-700">Notas de pruebas</label>
              <textarea value={form.test_notes} onChange={e => setForm({...form, test_notes: e.target.value})} className="w-full border rounded-lg p-2 mt-1" rows={2} />
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowHandoverModal(false)} className="px-4 py-2 border rounded-lg text-sm">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">Registrar Entrega</button>
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
            <Wrench className="text-emerald-600" /> Ejecucion
          </h1>
          <p className="text-gray-500 text-sm mt-1">Gestion de tareas de mantenimiento y entregas de equipo</p>
        </div>
        <div className="flex gap-2">
          {tab === 'all' && (
            <button onClick={() => setShowAssignModal(true)} className="flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">
              <Plus size={16} /> Asignar Tarea
            </button>
          )}
          {tab === 'handovers' && (
            <button onClick={() => setShowHandoverModal(true)} className="flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">
              <Plus size={16} /> Nueva Entrega
            </button>
          )}
          <button onClick={refresh} className="p-2 border rounded-lg hover:bg-gray-50">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Fast Track / Imprevistos Activos */}
      {fastTrackWOs.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h2 className="text-sm font-bold text-amber-800 flex items-center gap-2 mb-3">
            <Zap size={16} className="text-amber-600" /> Imprevistos Activos ({fastTrackWOs.length})
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
                  <p className="text-lg font-medium">No hay tareas</p>
                  <p className="text-sm">{tab === 'my' ? 'No tienes tareas asignadas actualmente' : 'No se encontraron tareas'}</p>
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
                    <p className="text-sm text-blue-600">Asignadas</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-amber-700">{tasks.filter(t => t.status === 'IN_PROGRESS').length}</p>
                    <p className="text-sm text-amber-600">En Progreso</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-green-700">{tasks.filter(t => t.status === 'COMPLETED').length}</p>
                    <p className="text-sm text-green-600">Completadas</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'handovers' && (
            <div className="space-y-3">
              {handovers.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <ArrowRightLeft size={48} className="mx-auto mb-3 opacity-40" />
                  <p className="text-lg font-medium">No hay entregas registradas</p>
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
                            {h.handover_type === 'TO_OPERATIONS' ? 'A Operaciones' : 'A Mantenimiento'}
                          </span>
                          {h.tests_passed && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                              Pruebas OK
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
        </>
      )}

      {/* Modals */}
      {showAssignModal && <AssignModal />}
      {showHandoverModal && <HandoverModal />}
    </div>
  );
}
