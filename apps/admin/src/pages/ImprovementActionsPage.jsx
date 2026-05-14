import { useState, useEffect, useMemo, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useWebSocketCoalesced } from '../hooks/useWebSocket';
import {
  Plus, CheckCircle, Clock, AlertTriangle, Loader2, X, Search,
  ArrowRight, Target, TrendingUp, Calendar, User, Edit2, Trash2,
} from 'lucide-react';
import * as api from '../api';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../components/Toast';

const PRIO = {
  CRITICAL: { label: 'Crítica', color: 'bg-red-500 text-white' },
  HIGH: { label: 'Alta', color: 'bg-orange-500 text-white' },
  MEDIUM: { label: 'Media', color: 'bg-amber-100 text-amber-700' },
  LOW: { label: 'Baja', color: 'bg-gray-100 text-gray-600' },
};

const STATUS = {
  OPEN: { label: 'Abierta', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  IN_PROGRESS: { label: 'En progreso', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  COMPLETED: { label: 'Completada', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  VERIFIED: { label: 'Verificada', color: 'bg-green-100 text-green-700 border-green-200' },
  CANCELLED: { label: 'Cancelada', color: 'bg-gray-100 text-gray-500 border-gray-200' },
};

const SOURCE = {
  MANUAL: { label: 'Manual', color: 'bg-gray-50 text-gray-600' },
  RCA: { label: 'RCA', color: 'bg-purple-50 text-purple-700' },
  CAPA: { label: 'CAPA', color: 'bg-indigo-50 text-indigo-700' },
  WORK_REQUEST: { label: 'WR', color: 'bg-blue-50 text-blue-700' },
  DEVIATION: { label: 'Deviation', color: 'bg-orange-50 text-orange-700' },
};

export default function ImprovementActionsPage() {
  const { selectedPlant } = useOutletContext();
  const { t } = useLanguage();
  const toast = useToast();
  const plantId = selectedPlant?.plant_id || selectedPlant || 'OCP-JFC1';

  const [loading, setLoading] = useState(true);
  const [actions, setActions] = useState([]);
  const [summary, setSummary] = useState({});
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQ, setSearchQ] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAction, setEditingAction] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM', assigned_to: '', target_date: '', source_type: 'MANUAL', equipment_tag: '' });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchActions = async () => {
    setLoading(true);
    try {
      const [actRes, sumRes] = await Promise.all([
        api.listImprovementActions({ plant_id: plantId }).catch(() => ({ items: [] })),
        api.getImprovementActionsSummary({ plant_id: plantId }).catch(() => ({})),
      ]);
      setActions(actRes?.items || []);
      setSummary(sumRes || {});
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchActions(); }, [plantId]);
  // Coalesce: N eventos en 250ms = 1 fetchActions.
  useWebSocketCoalesced(plantId, fetchActions, 250);

  const filtered = useMemo(() => {
    let list = actions;
    if (filterStatus !== 'all') list = list.filter(a => a.status === filterStatus);
    if (searchQ) {
      const q = searchQ.toLowerCase();
      list = list.filter(a => (a.title || '').toLowerCase().includes(q) || (a.equipment_tag || '').toLowerCase().includes(q) || (a.assigned_to || '').toLowerCase().includes(q));
    }
    return list;
  }, [actions, filterStatus, searchQ]);

  const kpis = useMemo(() => ({
    total: actions.length,
    open: actions.filter(a => a.status === 'OPEN').length,
    inProgress: actions.filter(a => a.status === 'IN_PROGRESS').length,
    overdue: actions.filter(a => a.target_date && new Date(a.target_date) < new Date() && !['COMPLETED', 'VERIFIED', 'CANCELLED'].includes(a.status)).length,
    completed: actions.filter(a => a.status === 'COMPLETED' || a.status === 'VERIFIED').length,
  }), [actions]);

  const handleSave = async () => {
    if (!form.title?.trim()) return;
    setSaving(true);
    try {
      if (editingAction) {
        await api.updateImprovementAction(editingAction.action_id, form);
        toast.success('Action updated');
      } else {
        await api.createImprovementAction({ ...form, plant_id: plantId });
        toast.success('Action created');
      }
      setModalOpen(false);
      setEditingAction(null);
      fetchActions();
    } catch (e) { toast.error('Error: ' + (e.message || '')); }
    setSaving(false);
  };

  const handleStatusChange = async (action, newStatus) => {
    try {
      await api.updateImprovementAction(action.action_id, { status: newStatus });
      toast.success(action.title?.substring(0, 20) + '... → ' + newStatus);
      fetchActions();
    } catch (e) { toast.error(e.message); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.deleteImprovementAction(deleteTarget.action_id);
      toast.success('Deleted');
      setDeleteTarget(null);
      fetchActions();
    } catch (e) { toast.error(e.message); }
  };

  const openEdit = (action) => {
    setEditingAction(action);
    setForm({ title: action.title || '', description: action.description || '', priority: action.priority || 'MEDIUM', assigned_to: action.assigned_to || '', target_date: action.target_date?.slice(0, 10) || '', source_type: action.source_type || 'MANUAL', equipment_tag: action.equipment_tag || '' });
    setModalOpen(true);
  };

  if (loading) return <div className="p-6 flex justify-center min-h-[300px] items-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
            <Target size={22} className="text-emerald-700 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Acciones de mejora</h1>
            <p className="text-sm text-muted-foreground">Gestiona y cierra acciones de confiabilidad</p>
          </div>
        </div>
        <button onClick={() => { setEditingAction(null); setForm({ title: '', description: '', priority: 'MEDIUM', assigned_to: '', target_date: '', source_type: 'MANUAL', equipment_tag: '' }); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-semibold transition-colors">
          <Plus size={16} /> Nueva acción
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: kpis.total, icon: Target, color: 'text-gray-700 bg-gray-50 border-gray-200', filter: 'all' },
          { label: 'Abiertas', value: kpis.open, icon: Clock, color: 'text-yellow-700 bg-yellow-50 border-yellow-200', filter: 'OPEN' },
          { label: 'En progreso', value: kpis.inProgress, icon: ArrowRight, color: 'text-blue-700 bg-blue-50 border-blue-200', filter: 'IN_PROGRESS' },
          { label: 'Vencidas', value: kpis.overdue, icon: AlertTriangle, color: 'text-red-700 bg-red-50 border-red-200', filter: 'overdue' },
          { label: 'Completadas', value: kpis.completed, icon: CheckCircle, color: 'text-emerald-700 bg-emerald-50 border-emerald-200', filter: 'COMPLETED' },
        ].map(k => (
          <button key={k.label} onClick={() => setFilterStatus(filterStatus === k.filter ? 'all' : k.filter)}
            className={`rounded-xl border-2 p-4 text-left transition-all hover:shadow-md ${filterStatus === k.filter ? 'ring-2 ring-blue-500 shadow-md' : ''} ${k.color}`}>
            <k.icon size={16} className="mb-1" />
            <div className="text-2xl font-extrabold">{k.value}</div>
            <div className="text-[10px] font-semibold uppercase tracking-wider">{k.label}</div>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Buscar acciones, equipo, responsable…"
          className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
      </div>

      {/* Actions list */}
      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Target size={40} className="text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-foreground font-semibold mb-1">Sin acciones de mejora</p>
          <p className="text-sm text-muted-foreground">Crea acciones desde hallazgos de RCA o manualmente</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(action => {
            const prio = PRIO[action.priority] || PRIO.MEDIUM;
            const stat = STATUS[action.status] || STATUS.OPEN;
            const src = SOURCE[(action.source_type || '').toUpperCase()] || SOURCE.MANUAL;
            const isOverdue = action.target_date && new Date(action.target_date) < new Date() && !['COMPLETED', 'VERIFIED', 'CANCELLED'].includes(action.status);

            return (
              <div key={action.action_id} className={`bg-card border rounded-xl p-4 transition-all hover:shadow-md ${isOverdue ? 'border-red-300 dark:border-red-700' : 'border-border'}`}>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-1.5 py-1 rounded ${prio.color}`}>{prio.label}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{action.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {action.equipment_tag && <span className="text-[10px] font-mono text-muted-foreground">{action.equipment_tag}</span>}
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${src.color}`}>{src.label}</span>
                      {action.assigned_to && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><User size={10} /> {action.assigned_to}</span>
                      )}
                      {action.target_date && (
                        <span className={`text-[10px] flex items-center gap-0.5 ${isOverdue ? 'text-red-600 font-bold' : 'text-muted-foreground'}`}>
                          <Calendar size={10} /> {action.target_date.slice(0, 10)} {isOverdue && '(OVERDUE)'}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Status selector */}
                  <select value={action.status} onChange={e => handleStatusChange(action, e.target.value)}
                    className={`text-[10px] font-semibold px-2 py-1 rounded-lg border cursor-pointer ${stat.color}`}>
                    {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                  <button onClick={() => openEdit(action)} className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground"><Edit2 size={14} /></button>
                  <button onClick={() => setDeleteTarget(action)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative z-10 bg-white dark:bg-card rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">{editingAction ? 'Edit Action' : 'New Improvement Action'}</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 hover:bg-muted rounded-lg"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Action title *"
                className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description..."
                className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 min-h-[60px]" />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                  className="border border-border rounded-xl px-3 py-2 text-sm bg-background text-foreground">
                  {Object.entries(PRIO).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <input type="date" value={form.target_date} onChange={e => setForm(f => ({ ...f, target_date: e.target.value }))}
                  className="border border-border rounded-xl px-3 py-2 text-sm bg-background text-foreground" />
              </div>
              <input value={form.assigned_to} onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))} placeholder="Assigned to"
                className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
              <input value={form.equipment_tag} onChange={e => setForm(f => ({ ...f, equipment_tag: e.target.value }))} placeholder="Equipment TAG"
                className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
              <div className="flex gap-3 pt-2">
                <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 text-sm font-semibold border border-border rounded-xl text-foreground hover:bg-muted">Cancel</button>
                <button onClick={handleSave} disabled={saving || !form.title?.trim()}
                  className="flex-1 py-2.5 text-sm font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-40 flex items-center justify-center gap-2">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                  {editingAction ? 'Save' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteTarget(null)} />
          <div className="relative z-10 bg-white dark:bg-card rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <Trash2 size={32} className="text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold mb-1">Delete Action?</h3>
            <p className="text-sm text-muted-foreground mb-4">{deleteTarget.title}</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2 border border-border rounded-xl text-sm font-semibold hover:bg-muted">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
