import { useState, useEffect, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import * as api from '../api';
import {
  TrendingUp, BarChart3, Clock, CheckCircle2, AlertTriangle,
  Users, Calendar, RefreshCw, Plus, ArrowRight, Target, Zap,
  FileText, Loader2
} from 'lucide-react';

const KPI_COLORS = { good: '#059669', warning: '#D97706', bad: '#DC2626' };
const PIE_COLORS = ['#059669', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

function KpiCard({ label, value, unit, icon: Icon, trend, target, color = 'emerald' }) {
  const met = target != null && parseFloat(value) >= target;
  return (
    <div className={`bg-white rounded-xl border p-4 ${target != null && !met ? 'border-amber-200' : 'border-gray-100'}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className={`text-${color}-600`} />
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
      </div>
      <div className="flex items-end gap-1">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {unit && <span className="text-sm text-gray-500 mb-0.5">{unit}</span>}
      </div>
      {target != null && (
        <div className="flex items-center gap-1 mt-1">
          <Target size={10} className={met ? 'text-emerald-500' : 'text-amber-500'} />
          <span className={`text-xs ${met ? 'text-emerald-600' : 'text-amber-600'}`}>
            Meta: {target}{unit || ''}
          </span>
        </div>
      )}
      {trend && <span className="text-xs text-gray-400 mt-1">{trend}</span>}
    </div>
  );
}

export default function PerformanceAnalysis({ onNavigateTab }) {
  const { plant } = useOutletContext();
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [wos, setWos] = useState([]);
  const [wrs, setWrs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [improvementActions, setImprovementActions] = useState([]);
  const [creatingAction, setCreatingAction] = useState(false);
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [meetingForm, setMeetingForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    attendees: '',
    notes: '',
    decisions: '',
  });

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      api.listManagedWOs({ plant_id: plant, limit: 500 }),
      api.listWorkRequests({ plant_id: plant }),
      api.listPMReviews({ plant_id: plant }),
      api.listImprovementActions({ plant_id: plant }),
    ]).then(([woRes, wrRes, revRes, iaRes]) => {
      const parse = r => r.status === 'fulfilled' ? (Array.isArray(r.value) ? r.value : r.value?.items || []) : [];
      setWos(parse(woRes));
      setWrs(parse(wrRes));
      setReviews(parse(revRes));
      setImprovementActions(parse(iaRes));
      setLoading(false);
    });
  }, [plant]);

  // ── KPI Calculations ──
  const kpis = useMemo(() => {
    const completed = wos.filter(w => ['COMPLETED', 'CLOSED'].includes(w.status));
    const total = wos.length;

    // MTBF: average days between failures for equipment with >1 failure
    const failuresByEquip = {};
    wrs.filter(w => w.equipment_tag).forEach(wr => {
      if (!failuresByEquip[wr.equipment_tag]) failuresByEquip[wr.equipment_tag] = [];
      failuresByEquip[wr.equipment_tag].push(new Date(wr.created_at || Date.now()));
    });
    let mtbfDays = 0;
    let mtbfCount = 0;
    Object.values(failuresByEquip).forEach(dates => {
      if (dates.length < 2) return;
      dates.sort((a, b) => a - b);
      for (let i = 1; i < dates.length; i++) {
        mtbfDays += (dates[i] - dates[i - 1]) / 86400000;
        mtbfCount++;
      }
    });
    const mtbf = mtbfCount > 0 ? Math.round(mtbfDays / mtbfCount) : 0;

    // MTTR: average hours to complete (estimated_hours as proxy)
    const completedHours = completed.reduce((s, w) => s + (w.actual_hours || w.estimated_hours || 0), 0);
    const mttr = completed.length > 0 ? (completedHours / completed.length).toFixed(1) : 0;

    // Availability: simple heuristic based on unplanned downtime
    const unplannedWOs = wos.filter(w => w.is_fast_track || w.wo_type === 'PM01');
    const unplannedHours = unplannedWOs.reduce((s, w) => s + (w.actual_hours || w.estimated_hours || 0), 0);
    const totalPeriodHours = 30 * 24; // 30 days
    const availability = totalPeriodHours > 0 ? Math.max(0, Math.min(100, Math.round((1 - unplannedHours / totalPeriodHours) * 100))) : 99;

    // Schedule compliance
    const scheduled = wos.filter(w => w.status !== 'DRAFT');
    const onTime = completed.filter(w => {
      if (!w.planned_end || !w.completed_at) return true;
      return new Date(w.completed_at) <= new Date(w.planned_end);
    }).length;
    const compliance = scheduled.length > 0 ? Math.round((onTime / Math.max(completed.length, 1)) * 100) : 0;

    // PM Compliance
    const pmOrders = wos.filter(w => w.wo_type === 'PM02');
    const pmCompleted = pmOrders.filter(w => ['COMPLETED', 'CLOSED'].includes(w.status)).length;
    const pmCompliance = pmOrders.length > 0 ? Math.round((pmCompleted / pmOrders.length) * 100) : 0;

    // Backlog hours
    const backlogHours = wos.filter(w => !['COMPLETED', 'CLOSED'].includes(w.status))
      .reduce((s, w) => s + (w.estimated_hours || 0), 0);

    // Cost per WO (placeholder)
    const avgCost = completed.length > 0 ? Math.round(completedHours * 45 / completed.length) : 0;

    return { mtbf, mttr, availability, compliance, pmCompliance, backlogHours, avgCost, total, completed: completed.length };
  }, [wos, wrs]);

  // ── Chart Data ──
  const typeDistribution = useMemo(() => {
    const counts = {};
    wos.forEach(w => { const t = w.wo_type || 'OTHER'; counts[t] = (counts[t] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [wos]);

  const monthlyTrend = useMemo(() => {
    const months = {};
    wos.forEach(w => {
      const m = (w.created_at || '').slice(0, 7);
      if (!m) return;
      if (!months[m]) months[m] = { month: m, planned: 0, completed: 0, unplanned: 0 };
      months[m].planned++;
      if (['COMPLETED', 'CLOSED'].includes(w.status)) months[m].completed++;
      if (w.is_fast_track || w.wo_type === 'PM01') months[m].unplanned++;
    });
    return Object.values(months).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);
  }, [wos]);

  const topEquipment = useMemo(() => {
    const counts = {};
    wrs.forEach(wr => {
      const tag = wr.equipment_tag || wr.equipment_name || 'Unknown';
      counts[tag] = (counts[tag] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([equipment, count]) => ({ equipment, count }));
  }, [wrs]);

  // ── Actions ──
  const handleCreateAction = async (category) => {
    setCreatingAction(true);
    try {
      await api.createImprovementAction({
        title: `${category} — Performance Review ${new Date().toISOString().slice(0, 10)}`,
        category,
        priority: 'MEDIUM',
        plant_id: plant,
        source: 'PERFORMANCE_ANALYSIS',
      });
      const updated = await api.listImprovementActions({ plant_id: plant });
      setImprovementActions(Array.isArray(updated) ? updated : updated?.items || []);
      toast.success(`Accion de mejora creada: ${category}`);
    } catch {
      toast.error('Error al crear accion de mejora');
    }
    setCreatingAction(false);
  };

  const handleSaveMeeting = async () => {
    try {
      await api.createPMReview({
        plant_id: plant,
        period_start: new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10),
        period_end: meetingForm.date,
      });
      toast.success('Reunion de desempeno registrada');
      setShowMeetingForm(false);
      const updated = await api.listPMReviews({ plant_id: plant });
      setReviews(Array.isArray(updated) ? updated : []);
    } catch {
      toast.error('Error al registrar reunion');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <RefreshCw size={24} className="animate-spin text-emerald-600" />
    </div>
  );

  const activeActions = improvementActions.filter(a => a.status !== 'COMPLETED' && a.status !== 'CLOSED');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="text-emerald-600" /> Analisis del Desempeno
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            KPIs de mantenimiento, tendencias y acciones de mejora — Alineado con ISO 14224
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowMeetingForm(true)} className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
            <Calendar size={16} /> Reunion de Desempeno
          </button>
          <button onClick={() => navigate('/improvement-actions')} className="flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">
            <ArrowRight size={16} /> Acciones de Mejora
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <KpiCard label="MTBF" value={kpis.mtbf} unit="dias" icon={Clock} target={30} color="blue" />
        <KpiCard label="MTTR" value={kpis.mttr} unit="hrs" icon={Clock} target={8} color="amber" />
        <KpiCard label="Disponibilidad" value={kpis.availability} unit="%" icon={CheckCircle2} target={90} />
        <KpiCard label="Cumplimiento Prog." value={kpis.compliance} unit="%" icon={Target} target={85} color="blue" />
        <KpiCard label="Cumplimiento PM" value={kpis.pmCompliance} unit="%" icon={CheckCircle2} target={90} />
        <KpiCard label="Backlog" value={Math.round(kpis.backlogHours)} unit="hrs" icon={BarChart3} color="amber" />
        <KpiCard label="OTs Totales" value={kpis.total} icon={FileText} color="blue" />
        <KpiCard label="OTs Completadas" value={kpis.completed} icon={CheckCircle2} />
        <KpiCard label="Costo Prom/OT" value={`$${kpis.avgCost}`} icon={TrendingUp} color="amber" />
        <KpiCard label="Acciones Activas" value={activeActions.length} icon={Zap} color={activeActions.length > 5 ? 'red' : 'emerald'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Tendencia Mensual de OTs</h3>
          {monthlyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="planned" fill="#3B82F6" name="Planificadas" radius={[3, 3, 0, 0]} />
                <Bar dataKey="completed" fill="#059669" name="Completadas" radius={[3, 3, 0, 0]} />
                <Bar dataKey="unplanned" fill="#EF4444" name="No planificadas" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-10">Sin datos de tendencia</p>
          )}
        </div>

        {/* Type Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Distribucion por Tipo de OT</h3>
          {typeDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={typeDistribution} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}>
                  {typeDistribution.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-10">Sin datos</p>
          )}
        </div>

        {/* Top Failing Equipment */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Equipos con Mas Fallas</h3>
          {topEquipment.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topEquipment} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="equipment" type="category" width={100} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#EF4444" name="Fallas" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-10">Sin datos de fallas</p>
          )}
        </div>

        {/* Improvement Actions Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Acciones de Mejora Activas</h3>
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">{activeActions.length}</span>
          </div>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {activeActions.length > 0 ? activeActions.slice(0, 8).map(a => (
              <div key={a.action_id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{a.title}</p>
                  <p className="text-xs text-gray-500">{a.category} · {a.priority}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  a.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                }`}>{a.status}</span>
              </div>
            )) : (
              <p className="text-gray-400 text-center py-6">Sin acciones activas</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions — Route back to other phases or create improvement actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Acciones Rapidas desde Analisis</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Crear Accion — Estrategia', cat: 'Strategy', icon: TrendingUp, color: 'bg-purple-600' },
            { label: 'Crear Accion — Planificacion', cat: 'Planning', icon: Calendar, color: 'bg-blue-600' },
            { label: 'Crear Accion — Repuestos', cat: 'Spare Parts', icon: AlertTriangle, color: 'bg-amber-600' },
            { label: 'Crear Accion — Ejecucion', cat: 'Execution', icon: Users, color: 'bg-emerald-600' },
          ].map(item => (
            <button
              key={item.cat}
              onClick={() => handleCreateAction(item.cat)}
              disabled={creatingAction}
              className={`${item.color} text-white rounded-xl p-4 text-left hover:opacity-90 transition-opacity disabled:opacity-50`}
            >
              <item.icon size={20} className="mb-2" />
              <p className="text-sm font-medium">{item.label}</p>
              {creatingAction && <Loader2 size={14} className="animate-spin mt-1" />}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation back to other phases */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Volver a Fases del Ciclo</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'identification', label: '1. Identificacion' },
            { id: 'planning', label: '2. Planificacion' },
            { id: 'scheduling', label: '3. Programacion' },
            { id: 'execution', label: '4. Ejecucion' },
            { id: 'closure', label: '5. Cierre' },
          ].map(phase => (
            <button
              key={phase.id}
              onClick={() => onNavigateTab?.(phase.id)}
              className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-colors"
            >
              {phase.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Post-Maintenance Reviews */}
      {reviews.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Revisiones Post-Mantenimiento Recientes</h3>
          <div className="space-y-2">
            {reviews.slice(0, 5).map(r => (
              <div key={r.review_id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div>
                  <span className="text-sm font-medium text-gray-900">{r.period_start} → {r.period_end}</span>
                  <span className="ml-2 text-xs text-gray-500">OTs: {r.wo_summary?.total || 0}</span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  r.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Meeting Modal */}
      {showMeetingForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowMeetingForm(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg space-y-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900">Registrar Reunion de Desempeno</h2>
            <div>
              <label className="text-sm font-medium text-gray-700">Fecha</label>
              <input type="date" value={meetingForm.date} onChange={e => setMeetingForm({ ...meetingForm, date: e.target.value })} className="w-full border rounded-lg p-2 mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Asistentes</label>
              <input value={meetingForm.attendees} onChange={e => setMeetingForm({ ...meetingForm, attendees: e.target.value })} className="w-full border rounded-lg p-2 mt-1" placeholder="Nombres separados por coma" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Notas / Decisiones</label>
              <textarea value={meetingForm.notes} onChange={e => setMeetingForm({ ...meetingForm, notes: e.target.value })} className="w-full border rounded-lg p-2 mt-1" rows={3} placeholder="Resumen de la reunion y decisiones tomadas..." />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowMeetingForm(false)} className="px-4 py-2 border rounded-lg text-sm">Cancelar</button>
              <button onClick={handleSaveMeeting} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
