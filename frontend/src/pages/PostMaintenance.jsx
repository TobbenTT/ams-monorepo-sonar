import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  FileText, Plus, RefreshCw, Calendar, TrendingUp,
  AlertTriangle, CheckCircle2, Clock, ChevronDown, ChevronUp, BarChart3,
  RotateCcw, Loader2
} from 'lucide-react';
import { useToast } from '../components/Toast';
import {
  createPMReview, listPMReviews, getPMReview, updatePMReview,
  completePMReview, getPMAnalysis, listManagedWOs, closeManagedWO,
} from '../api';

const STATUS_COLORS = {
  DRAFT: 'bg-gray-100 text-gray-600',
  IN_REVIEW: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-green-100 text-green-700',
};

export default function PostMaintenance() {
  const { plant } = useOutletContext();
  const toast = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [meetingForm, setMeetingForm] = useState({ meeting_date: '', attendees: [], meeting_notes: '', improvement_actions: [], lessons_learned: '' });
  const [completedWOs, setCompletedWOs] = useState([]);
  const [closingWO, setClosingWO] = useState(null);

  useEffect(() => { refresh(); loadCompletedWOs(); }, []);

  async function loadCompletedWOs() {
    try {
      const wos = await listManagedWOs({ status: 'COMPLETED', plant_id: plant, limit: 50 });
      setCompletedWOs(Array.isArray(wos) ? wos : wos.items || []);
    } catch { setCompletedWOs([]); }
  }

  async function handleTechnicalClose(woId) {
    setClosingWO(woId);
    try {
      await closeManagedWO(woId);
      toast.success('Cierre tecnico completado — Contadores SAP reiniciados');
      loadCompletedWOs();
    } catch (e) {
      toast.error('Error en cierre tecnico: ' + e.message);
    }
    setClosingWO(null);
  }

  async function refresh() {
    setLoading(true);
    try {
      setReviews(await listPMReviews({ plant_id: plant }));
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function handleCreate(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      const r = await createPMReview({
        plant_id: plant,
        period_start: fd.get('start'),
        period_end: fd.get('end'),
      });
      setShowCreate(false);
      refresh();
      selectReview(r.review_id);
    } catch (e) { console.error(e); }
  }

  async function selectReview(id) {
    try {
      const r = await getPMReview(id);
      setSelected(id);
      setDetail(r);
      setMeetingForm({
        meeting_date: r.meeting_date || '',
        attendees: r.attendees || [],
        meeting_notes: r.meeting_notes || '',
        improvement_actions: r.improvement_actions || [],
        lessons_learned: r.lessons_learned || '',
      });
    } catch (e) { console.error(e); }
  }

  async function saveReview() {
    if (!selected) return;
    try {
      const r = await updatePMReview(selected, meetingForm);
      setDetail(r);
      setEditMode(false);
    } catch (e) { console.error(e); }
  }

  async function handleComplete() {
    if (!selected) return;
    try {
      const r = await completePMReview(selected);
      setDetail(r);
      refresh();
    } catch (e) { console.error(e); }
  }

  function addAction() {
    setMeetingForm({
      ...meetingForm,
      improvement_actions: [...meetingForm.improvement_actions, { action: '', responsible: '', deadline: '', status: 'PENDIENTE' }],
    });
  }

  function updateAction(idx, field, value) {
    const actions = [...meetingForm.improvement_actions];
    actions[idx] = { ...actions[idx], [field]: value };
    setMeetingForm({ ...meetingForm, improvement_actions: actions });
  }

  function removeAction(idx) {
    setMeetingForm({
      ...meetingForm,
      improvement_actions: meetingForm.improvement_actions.filter((_, i) => i !== idx),
    });
  }

  // ── KPI Card ──
  function KpiCard({ label, value, icon: Icon, color = 'emerald' }) {
    return (
      <div className={`bg-${color}-50 rounded-xl p-4 text-center`}>
        <Icon size={20} className={`mx-auto mb-1 text-${color}-600`} />
        <p className={`text-2xl font-bold text-${color}-700`}>{value}</p>
        <p className={`text-xs text-${color}-600`}>{label}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-emerald-600" /> Post Mantenimiento
          </h1>
          <p className="text-gray-500 text-sm mt-1">Revision de periodo, analisis de desempeno y plan de mejoras</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">
            <Plus size={16} /> Nueva Revision
          </button>
          <button onClick={refresh} className="p-2 border rounded-lg hover:bg-gray-50">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Review list */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Revisiones</h2>
          {reviews.length === 0 && !loading && (
            <div className="text-center py-10 text-gray-400">
              <FileText size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No reviews</p>
            </div>
          )}
          {reviews.map(r => (
            <button
              key={r.review_id}
              onClick={() => selectReview(r.review_id)}
              className={`w-full text-left bg-white rounded-xl shadow-sm border p-4 hover:bg-gray-50 transition-colors ${
                selected === r.review_id ? 'border-emerald-400 ring-1 ring-emerald-200' : 'border-gray-100'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[r.status]}`}>
                  {r.status}
                </span>
                <span className="text-xs text-gray-400">{r.created_at?.slice(0, 10)}</span>
              </div>
              <p className="text-sm font-medium text-gray-900">{r.period_start} → {r.period_end}</p>
              <p className="text-xs text-gray-500 mt-1">
                OTs: {r.wo_summary?.total || 0} · Completed: {r.wo_summary?.completed || 0}
              </p>
            </button>
          ))}
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-2 space-y-4">
          {!detail ? (
            <div className="flex items-center justify-center py-20 text-gray-400 bg-white rounded-xl border border-gray-100">
              <div className="text-center">
                <BarChart3 size={48} className="mx-auto mb-3 opacity-40" />
                <p className="text-lg font-medium">Selecciona una revision</p>
                <p className="text-sm">o crea una nueva para analizar el periodo</p>
              </div>
            </div>
          ) : (
            <>
              {/* KPI Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-blue-700">{detail.wo_summary?.total || 0}</p>
                  <p className="text-xs text-blue-600">Total WOs</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-green-700">{detail.wo_summary?.completed || 0}</p>
                  <p className="text-xs text-green-600">Completed</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-amber-700">{detail.wo_summary?.delayed || 0}</p>
                  <p className="text-xs text-amber-600">Retrasadas</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-700">{detail.performance_kpis?.schedule_compliance || 0}%</p>
                  <p className="text-xs text-emerald-600">Cumplimiento</p>
                </div>
              </div>

              {/* Performance KPIs */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">KPIs de Desempeno</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">Backlog (horas):</span> <span className="font-semibold">{detail.performance_kpis?.backlog_hours || 0}</span></div>
                  <div><span className="text-gray-500">Promedio h/OT:</span> <span className="font-semibold">{detail.performance_kpis?.avg_completion_hours || 0}</span></div>
                  <div><span className="text-gray-500">% No planificado:</span> <span className="font-semibold">{detail.performance_kpis?.unplanned_pct || 0}%</span></div>
                </div>
              </div>

              {/* Delays */}
              {detail.delays?.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-amber-500" /> OTs Retrasadas
                  </h3>
                  <div className="space-y-2">
                    {detail.delays.map((d, i) => (
                      <div key={i} className="flex items-center justify-between text-sm border-b border-gray-50 pb-2">
                        <div>
                          <span className="font-medium text-gray-900">{d.wo_number}</span>
                          <span className="text-gray-500 ml-2">{d.description}</span>
                        </div>
                        <span className="text-amber-600 font-medium">+{d.hours_delayed}h</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Unplanned work */}
              {detail.unplanned_work?.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Clock size={16} className="text-red-500" /> Trabajo No Planned
                  </h3>
                  <div className="space-y-2">
                    {detail.unplanned_work.map((u, i) => (
                      <div key={i} className="flex items-center justify-between text-sm border-b border-gray-50 pb-2">
                        <div>
                          <span className="font-medium text-gray-900">{u.wo_number}</span>
                          <span className="text-gray-500 ml-2">{u.description}</span>
                        </div>
                        <span className="text-red-600 font-medium">{u.hours}h</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Meeting & Improvement Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Reunion y Plan de Mejoras</h3>
                  {detail.status !== 'COMPLETED' && (
                    <button onClick={() => setEditMode(!editMode)} className="text-sm text-emerald-600 hover:underline">
                      {editMode ? 'Cancelar' : 'Edit'}
                    </button>
                  )}
                </div>
                {editMode ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Fecha de reunion</label>
                      <input type="date" value={meetingForm.meeting_date} onChange={e => setMeetingForm({...meetingForm, meeting_date: e.target.value})} className="w-full border rounded-lg p-2 mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Notas de reunion</label>
                      <textarea value={meetingForm.meeting_notes} onChange={e => setMeetingForm({...meetingForm, meeting_notes: e.target.value})} className="w-full border rounded-lg p-2 mt-1" rows={3} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Lecciones aprendidas</label>
                      <textarea value={meetingForm.lessons_learned} onChange={e => setMeetingForm({...meetingForm, lessons_learned: e.target.value})} className="w-full border rounded-lg p-2 mt-1" rows={2} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700">Actions de Mejora</label>
                        <button onClick={addAction} className="text-xs text-emerald-600 hover:underline">+ Agregar</button>
                      </div>
                      {meetingForm.improvement_actions.map((a, i) => (
                        <div key={i} className="grid grid-cols-4 gap-2 mb-2">
                          <input placeholder="Accion" value={a.action} onChange={e => updateAction(i, 'action', e.target.value)} className="col-span-2 border rounded-lg p-2 text-sm" />
                          <input placeholder="Responsable" value={a.responsible} onChange={e => updateAction(i, 'responsible', e.target.value)} className="border rounded-lg p-2 text-sm" />
                          <div className="flex gap-1">
                            <input type="date" value={a.deadline} onChange={e => updateAction(i, 'deadline', e.target.value)} className="flex-1 border rounded-lg p-1 text-xs" />
                            <button onClick={() => removeAction(i)} className="text-red-400 hover:text-red-600 px-1">&times;</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={saveReview} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">Guardar</button>
                      {detail.status !== 'COMPLETED' && (
                        <button onClick={handleComplete} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Complete Revision</button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 text-sm">
                    {detail.meeting_date && <p><span className="text-gray-500">Fecha:</span> {detail.meeting_date}</p>}
                    {detail.meeting_notes && <p><span className="text-gray-500">Notas:</span> {detail.meeting_notes}</p>}
                    {detail.lessons_learned && <p><span className="text-gray-500">Lecciones:</span> {detail.lessons_learned}</p>}
                    {detail.improvement_actions?.length > 0 && (
                      <div>
                        <p className="text-gray-500 mb-2">Actions de mejora:</p>
                        <table className="w-full text-sm">
                          <thead><tr className="text-left text-gray-400 border-b">
                            <th className="pb-1">Accion</th><th className="pb-1">Responsable</th><th className="pb-1">Plazo</th><th className="pb-1">Estado</th>
                          </tr></thead>
                          <tbody>
                            {detail.improvement_actions.map((a, i) => (
                              <tr key={i} className="border-b border-gray-50">
                                <td className="py-1">{a.action}</td>
                                <td className="py-1">{a.responsible}</td>
                                <td className="py-1">{a.deadline}</td>
                                <td className="py-1"><span className="text-xs px-2 py-0.5 rounded-full bg-gray-100">{a.status}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {!detail.meeting_date && !detail.meeting_notes && !detail.improvement_actions?.length && (
                      <p className="text-gray-400 italic">No data de reunion. Presiona "Edit" to add.</p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* SAP Technical Closure & Counter Reset */}
      {completedWOs.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <RotateCcw size={18} className="text-blue-600" /> Cierre Tecnico — Reset de Contadores SAP
          </h2>
          <p className="text-sm text-gray-500 mb-3">
            OTs completadas pendientes de cierre tecnico. Al cerrar se reinician los contadores SAP del equipo.
          </p>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {completedWOs.map(wo => (
              <div key={wo.wo_id || wo.work_order_id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-gray-900">{wo.wo_number}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">COMPLETED</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{wo.equipment_tag} — {wo.description}</p>
                </div>
                <button
                  onClick={() => handleTechnicalClose(wo.wo_id || wo.work_order_id)}
                  disabled={closingWO === (wo.wo_id || wo.work_order_id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 disabled:opacity-50"
                >
                  {closingWO === (wo.wo_id || wo.work_order_id) ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <RotateCcw size={12} />
                  )}
                  Cierre Tecnico
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowCreate(false)}>
          <form onClick={e => e.stopPropagation()} onSubmit={handleCreate} className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Nueva Post-Maintenance Review</h2>
            <div>
              <label className="text-sm font-medium text-gray-700">Inicio del periodo</label>
              <input type="date" name="start" required className="w-full border rounded-lg p-2 mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Fin del periodo</label>
              <input type="date" name="end" required className="w-full border rounded-lg p-2 mt-1" />
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 border rounded-lg text-sm">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">Crear y Analizar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
