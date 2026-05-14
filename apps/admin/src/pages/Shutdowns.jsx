import { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Calendar as CalIcon, Plus, Play, CheckCircle2, Loader2, Save, X, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmDialog';
import * as api from '../api';

const STATUS_COLOR = {
  PLANNED:   'bg-blue-100 text-blue-700 border-blue-300',
  IN_PROGRESS: 'bg-amber-100 text-amber-700 border-amber-300',
  COMPLETED: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  DELAYED:   'bg-red-100 text-red-700 border-red-300',
  CANCELLED: 'bg-gray-100 text-gray-600 border-gray-300',
};

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });
}
function fmtDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}
function daysBetween(a, b) {
  if (!a || !b) return 0;
  return Math.max(1, Math.round((new Date(b) - new Date(a)) / 86400000));
}

export default function Shutdowns() {
  const { plant } = useOutletContext();
  const toast = useToast();
  const confirm = useConfirm();
  const [shutdowns, setShutdowns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', planned_start: '', planned_end: '', work_orders: '' });
  const [saving, setSaving] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => new Date());

  const reload = () => {
    setLoading(true);
    api.listShutdowns({ plant_id: plant })
      .then(d => setShutdowns(Array.isArray(d) ? d : []))
      .catch(() => setShutdowns([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { reload(); }, [plant]);

  const handleCreate = async () => {
    if (!form.name || !form.planned_start || !form.planned_end) {
      toast.error('Completa nombre + fechas');
      return;
    }
    if (new Date(form.planned_end) < new Date(form.planned_start)) {
      toast.error('La fecha fin debe ser posterior al inicio');
      return;
    }
    setSaving(true);
    try {
      const wos = form.work_orders.split(',').map(s => s.trim()).filter(Boolean);
      await api.createShutdown({
        plant_id: plant,
        name: form.name,
        planned_start: form.planned_start + 'T08:00:00',
        planned_end: form.planned_end + 'T20:00:00',
        work_orders: wos,
      });
      toast.success('Shutdown programado');
      setShowCreate(false);
      setForm({ name: '', planned_start: '', planned_end: '', work_orders: '' });
      reload();
    } catch (e) {
      toast.error('Error: ' + (e?.message || e));
    } finally {
      setSaving(false);
    }
  };

  const handleStart = async (id) => {
    try {
      await api.startShutdown(id);
      toast.success('Shutdown iniciado');
      reload();
    } catch (e) { toast.error('Error: ' + (e?.message || e)); }
  };

  const handleComplete = async (id) => {
    if (!await confirm({ title: 'Completar shutdown', message: '¿Marcar este shutdown como completado?', confirmText: 'Completar' })) return;
    try {
      await api.completeShutdown(id);
      toast.success('Shutdown completado');
      reload();
    } catch (e) { toast.error('Error: ' + (e?.message || e)); }
  };

  // Build month grid
  const monthGrid = useMemo(() => {
    const y = viewMonth.getFullYear();
    const m = viewMonth.getMonth();
    const firstDay = new Date(y, m, 1);
    const lastDay = new Date(y, m + 1, 0);
    const startDow = (firstDay.getDay() + 6) % 7; // Monday=0
    const days = [];
    for (let i = 0; i < startDow; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(y, m, d));
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }, [viewMonth]);

  const eventsOnDay = (day) => {
    if (!day) return [];
    const d = day.toISOString().slice(0, 10);
    return shutdowns.filter(s => {
      const ps = (s.planned_start || '').slice(0, 10);
      const pe = (s.planned_end || '').slice(0, 10);
      return ps <= d && d <= pe;
    });
  };

  const totals = useMemo(() => {
    const open = shutdowns.filter(s => s.status === 'PLANNED').length;
    const inProg = shutdowns.filter(s => s.status === 'IN_PROGRESS').length;
    const done = shutdowns.filter(s => s.status === 'COMPLETED').length;
    const hrs = shutdowns.reduce((acc, s) => acc + (s.planned_hours || 0), 0);
    return { open, inProg, done, hrs: Math.round(hrs) };
  }, [shutdowns]);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
            <CalIcon size={22} className="text-indigo-700 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Planificación de Paradas</h1>
            <p className="text-sm text-muted-foreground">Shutdown windows · ventanas de mantenimiento programado</p>
          </div>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-semibold">
          <Plus size={16} /> Nuevo Shutdown
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard label="Programados" value={totals.open} tone="blue" />
        <SummaryCard label="En ejecución" value={totals.inProg} tone="amber" />
        <SummaryCard label="Completados" value={totals.done} tone="emerald" />
        <SummaryCard label="Horas planificadas" value={`${totals.hrs}h`} tone="gray" />
      </div>

      {/* Calendar month view */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setViewMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
            className="p-1.5 hover:bg-muted rounded-lg"><ChevronLeft size={16} /></button>
          <h2 className="text-sm font-bold text-foreground">
            {viewMonth.toLocaleString('es-CL', { month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={() => setViewMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
            className="p-1.5 hover:bg-muted rounded-lg"><ChevronRight size={16} /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
            <div key={d} className="text-[10px] font-bold text-muted-foreground uppercase py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {monthGrid.map((day, i) => {
            const events = eventsOnDay(day);
            const isToday = day && day.toDateString() === new Date().toDateString();
            return (
              <div key={i} className={`min-h-[72px] rounded-lg border p-1 ${
                !day ? 'border-transparent bg-transparent' :
                isToday ? 'border-indigo-400 bg-indigo-50/40' :
                'border-border bg-background'
              }`}>
                {day && (
                  <>
                    <div className={`text-[10px] font-bold ${isToday ? 'text-indigo-700' : 'text-muted-foreground'}`}>
                      {day.getDate()}
                    </div>
                    <div className="space-y-0.5 mt-0.5">
                      {events.slice(0, 2).map(e => (
                        <div key={e.shutdown_id}
                          title={`${e.name} · ${e.status}`}
                          className={`text-[9px] px-1 py-0.5 rounded truncate ${STATUS_COLOR[e.status] || STATUS_COLOR.PLANNED}`}>
                          {e.name}
                        </div>
                      ))}
                      {events.length > 2 && (
                        <div className="text-[9px] text-muted-foreground">+{events.length - 2}</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* List view */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h2 className="text-sm font-bold text-foreground mb-3">Próximas paradas</h2>
        {loading ? (
          <div className="flex items-center justify-center py-8"><Loader2 size={18} className="animate-spin text-gray-400" /></div>
        ) : shutdowns.length === 0 ? (
          <p className="text-sm text-muted-foreground italic text-center py-6">
            Sin paradas programadas aún.
          </p>
        ) : (
          <div className="space-y-2">
            {shutdowns.map(s => {
              const duration = daysBetween(s.planned_start, s.planned_end);
              return (
                <div key={s.shutdown_id} className="bg-background border border-border rounded-lg p-3 flex items-center gap-3 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-foreground">{s.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${STATUS_COLOR[s.status] || STATUS_COLOR.PLANNED}`}>
                        {s.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
                      <span className="flex items-center gap-1"><Clock size={11} /> {fmtDate(s.planned_start)} → {fmtDate(s.planned_end)}</span>
                      <span>{duration}d · {Math.round(s.planned_hours || duration * 12)}h plan</span>
                      <span>{s.work_orders_count} OT</span>
                      {s.completion_pct > 0 && <span className="text-emerald-600">{Math.round(s.completion_pct)}%</span>}
                      {s.delay_hours > 0 && <span className="text-red-600">+{Math.round(s.delay_hours)}h atraso</span>}
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {s.status === 'PLANNED' && (
                      <button onClick={() => handleStart(s.shutdown_id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-600 text-white px-2.5 py-1 rounded-lg hover:bg-amber-700">
                        <Play size={11} /> Iniciar
                      </button>
                    )}
                    {s.status === 'IN_PROGRESS' && (
                      <button onClick={() => handleComplete(s.shutdown_id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-600 text-white px-2.5 py-1 rounded-lg hover:bg-emerald-700">
                        <CheckCircle2 size={11} /> Completar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={() => setShowCreate(false)}>
          <div className="bg-white dark:bg-card rounded-xl shadow-2xl w-full max-w-md p-5"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Nuevo Shutdown</h3>
              <button onClick={() => setShowCreate(false)} className="p-1 hover:bg-muted rounded"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">Nombre <span className="text-red-500">*</span></label>
                <input value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="p.ej. Parada mayor Q2-2026"
                  className="w-full mt-1 px-3 py-2 border border-border rounded-lg bg-background text-sm focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">Inicio <span className="text-red-500">*</span></label>
                  <input type="date" value={form.planned_start}
                    onChange={e => setForm(f => ({ ...f, planned_start: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-border rounded-lg bg-background text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">Fin <span className="text-red-500">*</span></label>
                  <input type="date" value={form.planned_end}
                    onChange={e => setForm(f => ({ ...f, planned_end: e.target.value }))}
                    min={form.planned_start || undefined}
                    className="w-full mt-1 px-3 py-2 border border-border rounded-lg bg-background text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">OTs incluidas (IDs coma-separados)</label>
                <input value={form.work_orders}
                  onChange={e => setForm(f => ({ ...f, work_orders: e.target.value }))}
                  placeholder="OT-2026-00001, OT-2026-00002"
                  className="w-full mt-1 px-3 py-2 border border-border rounded-lg bg-background text-sm" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowCreate(false)}
                className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
              <button onClick={handleCreate} disabled={saving}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, tone = 'gray' }) {
  const tones = {
    gray:    'bg-gray-50 text-gray-800 border-gray-200',
    blue:    'bg-blue-50 text-blue-800 border-blue-200',
    amber:   'bg-amber-50 text-amber-800 border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  };
  return (
    <div className={`rounded-xl border p-3 ${tones[tone]}`}>
      <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</div>
      <div className="text-2xl font-extrabold tabular-nums mt-0.5">{value}</div>
    </div>
  );
}
