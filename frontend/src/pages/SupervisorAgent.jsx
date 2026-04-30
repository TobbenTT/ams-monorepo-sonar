import React, { useMemo, useState } from 'react';
import { Users, Target, AlertCircle, Loader2, TrendingDown } from 'lucide-react';
import * as api from '../api';
import { useToast } from '../components/Toast';

function priorityBadge(p) {
  const c = { P1: 'bg-rose-600', P2: 'bg-amber-500', P3: 'bg-blue-500', P4: 'bg-gray-400' }[p] || 'bg-gray-400';
  return <span className={`text-[10px] font-bold text-white px-1.5 py-0.5 rounded ${c}`}>{p}</span>;
}

function ShiftReadinessTab() {
  const today = new Date().toISOString().split('T')[0];
  const [shiftDate, setShiftDate] = useState(today);
  const [shift, setShift] = useState('day');
  const [absentInput, setAbsentInput] = useState('');
  const [equipInput, setEquipInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const toast = useToast();
  const plantId = useMemo(() => localStorage.getItem('selected_plant') || 'OCP-JFC1', []);

  const run = async () => {
    setLoading(true); setData(null);
    try {
      const r = await api.supervisorShiftReadiness({
        plant_id: plantId, shift_date: shiftDate, shift,
        absent_worker_ids: absentInput.split(',').map(s => s.trim()).filter(Boolean),
        equipment_unavailable: equipInput.split(',').map(s => s.trim()).filter(Boolean),
      });
      setData(r);
    } catch (e) { toast.error('Error: ' + (e?.message || e)); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-bold mb-3">Bullet r64 #1 — HH real al inicio de jornada</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <input type="date" className="text-sm px-3 py-2 border rounded" value={shiftDate} onChange={e => setShiftDate(e.target.value)} />
        <select className="text-sm px-3 py-2 border rounded" value={shift} onChange={e => setShift(e.target.value)}>
          <option value="day">Turno día</option>
          <option value="night">Turno noche</option>
        </select>
        <input className="text-sm px-3 py-2 border rounded" placeholder="IDs trabajadores ausentes (coma)" value={absentInput} onChange={e => setAbsentInput(e.target.value)} />
        <input className="text-sm px-3 py-2 border rounded" placeholder="Tags equipos no disponibles (coma)" value={equipInput} onChange={e => setEquipInput(e.target.value)} />
      </div>
      <button onClick={run} disabled={loading} className="px-4 py-2 bg-rose-600 text-white text-sm font-semibold rounded hover:bg-rose-700 disabled:opacity-50">
        {loading ? <Loader2 className="w-4 h-4 inline animate-spin mr-1" /> : null}
        {loading ? 'Analizando...' : 'Analizar readiness'}
      </button>

      {data && (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <KpiBox label="HH planificadas" value={`${data.capacity.planned_hh}h`} color="blue" />
            <KpiBox label="HH disponibles" value={`${data.capacity.available_hh}h`} color="emerald" />
            <KpiBox label="GAP" value={`${data.capacity.gap_hh}h`} color={data.capacity.gap_hh > 0 ? 'rose' : 'gray'} />
            <KpiBox label="Cobertura" value={`${data.capacity.coverage_pct}%`} color={data.capacity.coverage_pct < 80 ? 'rose' : 'emerald'} />
            <KpiBox label="Ausentes" value={`${data.capacity.absent_count}/${data.capacity.total_workers}`} color="amber" />
          </div>

          {data.ots_at_risk?.length > 0 && (
            <Section title={`OTs en riesgo por ausentismo (${data.ots_at_risk.length})`} color="rose">
              {data.ots_at_risk.map(o => <OtRow key={o.wo_number} o={o} reason={`Ausentes: ${o.absent_workers_in_wo.map(w => w.name).join(', ')}`} />)}
            </Section>
          )}
          {data.ots_equipment_blocked?.length > 0 && (
            <Section title={`OTs bloqueadas por equipo (${data.ots_equipment_blocked.length})`} color="amber">
              {data.ots_equipment_blocked.map(o => <OtRow key={o.wo_number} o={o} reason={`Equipo no disponible: ${o.equipment_tag}`} />)}
            </Section>
          )}
          {data.ots_ok?.length > 0 && (
            <Section title={`OTs OK (${data.ots_ok.length})`} color="emerald">
              {data.ots_ok.slice(0, 8).map(o => <OtRow key={o.wo_number} o={o} />)}
              {data.ots_ok.length > 8 && <div className="text-[10px] text-gray-500 italic px-2">+{data.ots_ok.length - 8} más...</div>}
            </Section>
          )}

          {data.ai_recommendation && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
              <div className="text-xs font-bold text-purple-800 mb-1">🤖 Recomendación IA (Claude)</div>
              <pre className="text-[11px] whitespace-pre-wrap text-gray-800">{data.ai_recommendation}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProdVsProgramTab() {
  const today = new Date().toISOString().split('T')[0];
  const [shiftDate, setShiftDate] = useState(today);
  const [goal, setGoal] = useState(12000);
  const [actual, setActual] = useState(11200);
  const [unit, setUnit] = useState('ton');
  const [availGoal, setAvailGoal] = useState(92);
  const [availActual, setAvailActual] = useState(87);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const toast = useToast();
  const plantId = useMemo(() => localStorage.getItem('selected_plant') || 'OCP-JFC1', []);

  const run = async () => {
    setLoading(true); setData(null);
    try {
      const r = await api.supervisorProdVsProgram({
        plant_id: plantId, shift_date: shiftDate,
        production_goal: Number(goal), production_actual: Number(actual), production_unit: unit,
        equipment_availability_goal: Number(availGoal), equipment_availability_actual: Number(availActual),
      });
      setData(r);
    } catch (e) { toast.error('Error: ' + (e?.message || e)); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-bold mb-3">Bullet r64 #2 — Producción vs programa de mtto</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
        <input type="date" className="text-sm px-3 py-2 border rounded" value={shiftDate} onChange={e => setShiftDate(e.target.value)} />
        <input type="number" className="text-sm px-3 py-2 border rounded" placeholder="Meta producción" value={goal} onChange={e => setGoal(e.target.value)} />
        <input type="number" className="text-sm px-3 py-2 border rounded" placeholder="Real producción" value={actual} onChange={e => setActual(e.target.value)} />
        <select className="text-sm px-3 py-2 border rounded" value={unit} onChange={e => setUnit(e.target.value)}>
          <option value="ton">ton</option>
          <option value="m">m perforados</option>
        </select>
        <input type="number" className="text-sm px-3 py-2 border rounded" placeholder="Meta dispon. %" value={availGoal} onChange={e => setAvailGoal(e.target.value)} />
        <input type="number" className="text-sm px-3 py-2 border rounded" placeholder="Real dispon. %" value={availActual} onChange={e => setAvailActual(e.target.value)} />
      </div>
      <button onClick={run} disabled={loading} className="px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded hover:bg-amber-700 disabled:opacity-50">
        {loading ? <Loader2 className="w-4 h-4 inline animate-spin mr-1" /> : null}
        {loading ? 'Analizando...' : 'Analizar impacto'}
      </button>

      {data && (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <KpiBox label={`Meta ${data.production.unit}`} value={data.production.goal} color="blue" />
            <KpiBox label="Real" value={data.production.actual} color={data.production.gap < 0 ? 'rose' : 'emerald'} />
            <KpiBox label="Cumplimiento" value={`${data.production.pct}%`} color={data.production.pct < 90 ? 'rose' : 'emerald'} />
            <KpiBox label="Disponibilidad" value={`${data.availability.actual_pct}%`} color={data.availability.gap_pp < 0 ? 'rose' : 'emerald'} />
            <KpiBox label="OTs hoy" value={`${data.program_today.ots_total} (${data.program_today.ots_critical} P1/P2)`} color="amber" />
          </div>

          {data.ai_recommendation && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
              <div className="text-xs font-bold text-purple-800 mb-1">🤖 Recomendación IA (Claude)</div>
              <pre className="text-[11px] whitespace-pre-wrap text-gray-800">{data.ai_recommendation}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function KpiBox({ label, value, color }) {
  return (
    <div className={`bg-${color}-50 border border-${color}-200 rounded-xl p-2 text-center`}>
      <div className={`text-xl font-bold text-${color}-700`}>{value}</div>
      <div className="text-[9px] text-gray-500 uppercase">{label}</div>
    </div>
  );
}

function Section({ title, color, children }) {
  return (
    <div className={`bg-${color}-50 border border-${color}-200 rounded-xl p-3`}>
      <div className={`text-xs font-bold text-${color}-800 mb-2`}>{title}</div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function OtRow({ o, reason }) {
  return (
    <div className="flex items-center gap-2 text-xs bg-white rounded px-2 py-1">
      {priorityBadge(o.priority)}
      <span className="font-mono font-bold">{o.wo_number}</span>
      <span className="font-mono text-gray-600">{o.equipment_tag}</span>
      <span className="text-gray-500">{o.estimated_hours}h</span>
      {reason && <span className="text-rose-700 ml-auto text-[10px]">⚠ {reason}</span>}
    </div>
  );
}

export default function SupervisorAgent() {
  const [tab, setTab] = useState('readiness');
  return (
    <div className="p-5 space-y-4 max-w-6xl mx-auto">
      <div className="flex items-center gap-3">
        <Users className="w-7 h-7 text-rose-700" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Supervisor Agent</h1>
          <p className="text-sm text-gray-500">Excel Jorge · Bullets r64 #1 (HH real + ausentismo) + #2 (producción vs programa)</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <button onClick={() => setTab('readiness')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 ${tab === 'readiness' ? 'border-rose-600 text-rose-700' : 'border-transparent text-gray-500'}`}>
          <AlertCircle className="w-4 h-4 inline mr-1" /> #1 Shift Readiness
        </button>
        <button onClick={() => setTab('prod')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 ${tab === 'prod' ? 'border-amber-600 text-amber-700' : 'border-transparent text-gray-500'}`}>
          <Target className="w-4 h-4 inline mr-1" /> #2 Producción vs Programa
        </button>
      </div>

      {tab === 'readiness' ? <ShiftReadinessTab /> : <ProdVsProgramTab />}
    </div>
  );
}
