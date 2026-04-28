// SF-567 — Tablero del Supervisor: Programa Semanal + Tablero Diario + Detalle OT
// Jorge SP5-VSC #12. Vistas integradas con navegación histórica (8 semanas).
import { useState, useEffect, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Calendar, Grid3x3, FileText, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import * as api from '../api';
import { useToast } from '../components/Toast';
import SmartAssignModal from '../components/SmartAssignModal';
import CancelWOModal from '../components/CancelWOModal';

// Helpers de semana ISO
function startOfWeek(d) {
  const date = new Date(d);
  const day = date.getDay() || 7;
  if (day !== 1) date.setHours(-24 * (day - 1));
  date.setHours(0, 0, 0, 0);
  return date;
}
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function fmtISODate(d) { return d.toISOString().slice(0, 10); }
function fmtShortDate(d) {
  return d.toLocaleDateString('es-CL', { weekday: 'short', day: '2-digit', month: 'short' });
}
function isoWeekNum(d) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dn = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dn);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil((((t - yearStart) / 86400000) + 1) / 7);
}

const STATUS_BADGE = {
  PROGRAMADO: 'bg-blue-100 text-blue-700 border-blue-200',
  EN_EJECUCION: 'bg-amber-100 text-amber-700 border-amber-200',
  CERRADO: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  CANCELADO: 'bg-gray-200 text-gray-600 border-gray-300',
  REPROGRAMADO: 'bg-purple-100 text-purple-700 border-purple-200',
};

export default function SupervisorBoard() {
  const { plant } = useOutletContext();
  const navigate = useNavigate();
  const toast = useToast();
  const [view, setView] = useState('week'); // week | day | detail
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [selectedDay, setSelectedDay] = useState(() => new Date());
  const [selectedWO, setSelectedWO] = useState(null);
  const [wos, setWos] = useState([]);
  const [loading, setLoading] = useState(false);
  // SF-568 — Smart Assignment IA modal
  const [smartAssign, setSmartAssign] = useState(null); // { specialty, plannedHours, opSeq } | null
  // SF-579 — OTs absorbidas por la OT PM03 actual + modal cancel
  const [absorbed, setAbsorbed] = useState([]);
  const [cancelModalWO, setCancelModalWO] = useState(null);

  useEffect(() => {
    if (!selectedWO || selectedWO.wo_type !== 'PM03') { setAbsorbed([]); return; }
    api.listAbsorbedWOs(selectedWO.wo_id)
      .then(r => setAbsorbed(Array.isArray(r) ? r : []))
      .catch(() => setAbsorbed([]));
  }, [selectedWO?.wo_id, selectedWO?.wo_type]);

  const fetchWOs = () => {
    setLoading(true);
    api.listManagedWOs({ plant_id: plant, limit: 500 })
      .then(res => setWos(Array.isArray(res) ? res : (res?.items || [])))
      .catch(() => toast.error('Error cargando OTs'))
      .finally(() => setLoading(false));
  };
  useEffect(fetchWOs, [plant]);

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const woByDay = useMemo(() => {
    const map = {};
    days.forEach(d => { map[fmtISODate(d)] = []; });
    for (const wo of wos) {
      const ts = wo.planned_start || wo.actual_start || wo.created_at;
      if (!ts) continue;
      const key = fmtISODate(new Date(ts));
      if (map[key]) map[key].push(wo);
    }
    Object.values(map).forEach(arr => arr.sort((a, b) =>
      String(a.planned_start || '').localeCompare(String(b.planned_start || ''))
    ));
    return map;
  }, [wos, days]);

  const dayWOs = useMemo(() => woByDay[fmtISODate(selectedDay)] || [], [woByDay, selectedDay]);

  const totalHHWeek = useMemo(() =>
    days.reduce((s, d) => s + (woByDay[fmtISODate(d)] || []).reduce((a, w) => a + (w.estimated_hours || 0), 0), 0)
  , [days, woByDay]);

  const onPrevWeek = () => setWeekStart(addDays(weekStart, -7));
  const onNextWeek = () => setWeekStart(addDays(weekStart, 7));
  const onCurrentWeek = () => { setWeekStart(startOfWeek(new Date())); setSelectedDay(new Date()); };

  // Limit historical navigation a 8 semanas atrás
  const eightWeeksAgo = useMemo(() => addDays(startOfWeek(new Date()), -7 * 8), []);
  const canGoBack = weekStart > eightWeeksAgo;

  return (
    <div className="min-h-screen bg-muted p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Grid3x3 className="w-6 h-6 text-emerald-700" /> Tablero del Supervisor
        </h1>
        <button onClick={fetchWOs} className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refrescar
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { id: 'week', label: 'Programa Semanal', icon: Calendar },
          { id: 'day', label: 'Tablero Diario', icon: Grid3x3 },
          { id: 'detail', label: 'Detalle OT', icon: FileText, disabled: !selectedWO },
        ].map(({ id, label, icon: Icon, disabled }) => (
          <button
            key={id}
            disabled={disabled}
            onClick={() => setView(id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              view === id ? 'bg-emerald-700 text-white border-emerald-700' :
              disabled ? 'bg-card text-muted-foreground/50 border-border cursor-not-allowed' :
              'bg-card text-muted-foreground border-border hover:bg-muted'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* Navegación de semana (visible en week + day) */}
      {view !== 'detail' && (
        <div className="flex items-center gap-2 mb-4 bg-card border border-border rounded-xl p-3">
          <button onClick={onPrevWeek} disabled={!canGoBack}
            className={`p-1.5 rounded ${canGoBack ? 'hover:bg-muted' : 'opacity-30 cursor-not-allowed'}`}>
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 text-center">
            <div className="text-sm font-semibold">
              Semana {isoWeekNum(weekStart)} — {weekStart.getFullYear()}
            </div>
            <div className="text-xs text-muted-foreground">
              {fmtShortDate(days[0])} → {fmtShortDate(days[6])} · {totalHHWeek.toFixed(1)} HH plan
            </div>
          </div>
          <button onClick={onNextWeek} className="p-1.5 rounded hover:bg-muted">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button onClick={onCurrentWeek}
            className="text-xs px-2 py-1 rounded bg-emerald-700 text-white hover:bg-emerald-800">
            Hoy
          </button>
        </div>
      )}

      {/* WEEK */}
      {view === 'week' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {days.map((d) => {
            const key = fmtISODate(d);
            const items = woByDay[key] || [];
            const isToday = key === fmtISODate(new Date());
            const isSelected = key === fmtISODate(selectedDay);
            const dayHH = items.reduce((s, w) => s + (w.estimated_hours || 0), 0);
            return (
              <div key={key}
                onClick={() => { setSelectedDay(d); setView('day'); }}
                className={`bg-card rounded-xl border p-3 cursor-pointer transition-colors ${
                  isSelected ? 'border-emerald-500 ring-1 ring-emerald-500' :
                  isToday ? 'border-emerald-300' : 'border-border hover:bg-muted/50'
                }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-semibold uppercase text-muted-foreground">
                    {fmtShortDate(d)}
                  </div>
                  {isToday && <span className="text-[10px] bg-emerald-700 text-white px-1.5 py-0.5 rounded-full">Hoy</span>}
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  {items.length} OT · {dayHH.toFixed(1)} HH
                </div>
                <div className="space-y-1.5 max-h-72 overflow-y-auto">
                  {items.slice(0, 8).map(wo => (
                    <div key={wo.wo_id}
                      onClick={(e) => { e.stopPropagation(); setSelectedWO(wo); setView('detail'); }}
                      className="text-xs bg-muted/50 hover:bg-muted rounded p-1.5 border border-border">
                      <div className="font-mono text-[10px] text-muted-foreground truncate">{wo.wo_number}</div>
                      <div className="font-medium text-foreground truncate">{wo.equipment_tag || '—'}</div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className={`text-[9px] px-1 py-0.5 rounded border ${STATUS_BADGE[wo.status] || 'bg-gray-100'}`}>{wo.status}</span>
                        <span className="text-[10px] text-muted-foreground">{(wo.estimated_hours || 0).toFixed(1)}h</span>
                      </div>
                    </div>
                  ))}
                  {items.length > 8 && (
                    <div className="text-[10px] text-center text-muted-foreground">+ {items.length - 8} más</div>
                  )}
                  {items.length === 0 && (
                    <div className="text-[10px] text-center text-muted-foreground py-4">Sin OTs</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DAY */}
      {view === 'day' && (
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-lg font-semibold">{fmtShortDate(selectedDay)} — {dayWOs.length} OTs · {dayWOs.reduce((s,w)=>s+(w.estimated_hours||0),0).toFixed(1)} HH</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => setSelectedDay(addDays(selectedDay, -1))} className="p-1.5 rounded hover:bg-muted">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setSelectedDay(addDays(selectedDay, 1))} className="p-1.5 rounded hover:bg-muted">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          {dayWOs.length === 0 ? (
            <div className="text-center text-muted-foreground py-8 text-sm">No hay OTs programadas para este día.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr className="border-b border-border">
                    <th className="px-2 py-2 text-left font-semibold text-muted-foreground">#</th>
                    <th className="px-2 py-2 text-left font-semibold text-muted-foreground">OT</th>
                    <th className="px-2 py-2 text-left font-semibold text-muted-foreground">Equipo</th>
                    <th className="px-2 py-2 text-left font-semibold text-muted-foreground">Tipo / Pri</th>
                    <th className="px-2 py-2 text-left font-semibold text-muted-foreground">Inicio plan</th>
                    <th className="px-2 py-2 text-right font-semibold text-muted-foreground">HH</th>
                    <th className="px-2 py-2 text-right font-semibold text-muted-foreground">Avance</th>
                    <th className="px-2 py-2 text-left font-semibold text-muted-foreground">Estado</th>
                    <th className="px-2 py-2 text-left font-semibold text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody>
                  {dayWOs.map((wo, i) => (
                    <tr key={wo.wo_id} className="border-b border-border hover:bg-muted/30">
                      <td className="px-2 py-2 text-muted-foreground">{i + 1}</td>
                      <td className="px-2 py-2 font-mono text-xs">{wo.wo_number}</td>
                      <td className="px-2 py-2 truncate max-w-[180px]" title={wo.description}>{wo.equipment_tag || '—'}</td>
                      <td className="px-2 py-2 text-xs">{wo.wo_type} · {wo.priority_code}</td>
                      <td className="px-2 py-2 text-xs">{wo.planned_start ? new Date(wo.planned_start).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                      <td className="px-2 py-2 text-right font-medium">{(wo.estimated_hours || 0).toFixed(1)}</td>
                      <td className="px-2 py-2 text-right text-xs">{(wo.completion_pct || 0).toFixed(0)}%</td>
                      <td className="px-2 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded border ${STATUS_BADGE[wo.status] || 'bg-gray-100'}`}>{wo.status}</span></td>
                      <td className="px-2 py-2">
                        <button onClick={() => { setSelectedWO(wo); setView('detail'); }}
                          className="text-xs text-emerald-700 hover:underline">Ver</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* DETAIL */}
      {view === 'detail' && selectedWO && (
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-bold">{selectedWO.wo_number} — {selectedWO.equipment_tag || '—'}</h2>
              <p className="text-sm text-muted-foreground">{selectedWO.description || '—'}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/execution')} className="text-xs px-3 py-1.5 rounded bg-emerald-700 text-white hover:bg-emerald-800">
                Abrir en Ejecución
              </button>
              {!['CERRADO', 'CANCELADO'].includes(selectedWO.status) && (
                <button
                  onClick={() => setCancelModalWO({ ...selectedWO, plant_id: plant })}
                  className="text-xs px-3 py-1.5 rounded bg-red-50 text-red-700 border border-red-200 hover:bg-red-100">
                  Cancelar OT
                </button>
              )}
              <button onClick={() => setView('day')} className="text-xs px-3 py-1.5 rounded border border-border hover:bg-muted">
                Volver
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Tipo', value: selectedWO.wo_type },
              { label: 'Prioridad', value: selectedWO.priority_code },
              { label: 'Estado', value: selectedWO.status },
              { label: 'Avance', value: `${(selectedWO.completion_pct || 0).toFixed(0)}%` },
              { label: 'HH plan', value: `${(selectedWO.estimated_hours || 0).toFixed(1)}h` },
              { label: 'HH real', value: `${(selectedWO.actual_hours || 0).toFixed(1)}h` },
              { label: 'Centro', value: selectedWO.work_center || '—' },
              { label: 'Reserva', value: selectedWO.reservation_code || '—' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-muted/50 rounded-lg p-2 border border-border">
                <p className="text-[10px] text-muted-foreground">{label}</p>
                <p className="text-sm font-bold">{value || '—'}</p>
              </div>
            ))}
          </div>

          {/* Operaciones */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-2">Operaciones / Pautas</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-2 py-1.5 text-left">#</th>
                    <th className="px-2 py-1.5 text-left">Descripción</th>
                    <th className="px-2 py-1.5 text-left">Especialidad</th>
                    <th className="px-2 py-1.5 text-right">HH plan</th>
                    <th className="px-2 py-1.5 text-right">HH real</th>
                    <th className="px-2 py-1.5 text-right">% avance</th>
                    <th className="px-2 py-1.5 text-left">Estado</th>
                    <th className="px-2 py-1.5 text-center">IA</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedWO.operations || []).map((op, i) => (
                    <tr key={i} className="border-b border-border">
                      <td className="px-2 py-1.5">{op.op_number || op.seq || (i + 1)}</td>
                      <td className="px-2 py-1.5">{op.description || '—'}</td>
                      <td className="px-2 py-1.5">{op.specialty || '—'}</td>
                      <td className="px-2 py-1.5 text-right">{(op.planned_hours || op.estimated_hours || op.duration || 0).toFixed(1)}</td>
                      <td className="px-2 py-1.5 text-right">{(op.actual_hours || 0).toFixed(1)}</td>
                      <td className="px-2 py-1.5 text-right">{(op.completion_pct || 0).toFixed(0)}%</td>
                      <td className="px-2 py-1.5">{op.status || 'PENDING'}</td>
                      <td className="px-2 py-1.5 text-center">
                        <button
                          onClick={() => setSmartAssign({
                            specialty: op.specialty || selectedWO.work_center || 'Mecánico',
                            plannedHours: parseFloat(op.planned_hours || op.estimated_hours || op.duration || 1),
                            opSeq: op.op_number || (i + 1),
                          })}
                          title="Smart Assignment IA — sugiere técnicos rankeados"
                          className="text-[11px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 hover:bg-purple-200">
                          🤖
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!selectedWO.operations || selectedWO.operations.length === 0) && (
                    <tr><td colSpan={8} className="text-center text-muted-foreground py-3">Sin operaciones</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SF-579 — OTs absorbidas (sólo si esta es PM03 y absorbió alguna) */}
          {selectedWO.wo_type === 'PM03' && absorbed.length > 0 && (
            <div className="mb-4 bg-rose-50 border border-rose-200 rounded-lg p-3">
              <h3 className="text-sm font-semibold text-rose-800 mb-2 flex items-center gap-2">
                <span className="text-base">↘</span> OTs absorbidas por esta PM03 ({absorbed.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-rose-200 text-rose-700">
                      <th className="px-2 py-1 text-left font-semibold">OT</th>
                      <th className="px-2 py-1 text-left font-semibold">Tipo</th>
                      <th className="px-2 py-1 text-left font-semibold">Descripción</th>
                      <th className="px-2 py-1 text-right font-semibold">HH plan</th>
                      <th className="px-2 py-1 text-left font-semibold">Cancelada</th>
                      <th className="px-2 py-1 text-left font-semibold">Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {absorbed.map(a => (
                      <tr key={a.wo_id} className="border-b border-rose-100">
                        <td className="px-2 py-1 font-mono">{a.wo_number}</td>
                        <td className="px-2 py-1">{a.wo_type} · {a.priority_code}</td>
                        <td className="px-2 py-1 truncate max-w-[200px]" title={a.description}>{a.description || '—'}</td>
                        <td className="px-2 py-1 text-right">{(a.estimated_hours || 0).toFixed(1)}</td>
                        <td className="px-2 py-1">{a.cancelled_at ? new Date(a.cancelled_at).toLocaleDateString() : '—'}</td>
                        <td className="px-2 py-1 truncate max-w-[180px]" title={a.cancellation_reason}>{a.cancellation_reason || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-rose-600 mt-1">
                Estas OTs ya no aparecen en cumplimiento/adherencia (canceladas por absorción).
              </p>
            </div>
          )}

          {/* Si esta OT FUE absorbida, mostrar link a la PM03 absorbente */}
          {selectedWO.absorbed_by_wo_id && (
            <div className="mb-4 bg-amber-50 border border-amber-300 rounded-lg p-3">
              <p className="text-xs text-amber-800">
                <strong>OT cancelada por absorción.</strong> Absorbida por OT PM03 ID{' '}
                <button
                  onClick={() => {
                    const target = wos.find(w => w.wo_id === selectedWO.absorbed_by_wo_id);
                    if (target) setSelectedWO(target);
                  }}
                  className="font-mono underline hover:text-amber-900">
                  {(wos.find(w => w.wo_id === selectedWO.absorbed_by_wo_id) || {}).wo_number || selectedWO.absorbed_by_wo_id}
                </button>
              </p>
            </div>
          )}

          {/* Materiales */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Repuestos / Materiales</h3>
            {(selectedWO.materials || []).length === 0 ? (
              <p className="text-xs text-muted-foreground">Sin materiales asignados.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-2 py-1.5 text-left">Código</th>
                      <th className="px-2 py-1.5 text-left">Descripción</th>
                      <th className="px-2 py-1.5 text-right">Cant.</th>
                      <th className="px-2 py-1.5 text-left">Reserva</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedWO.materials.map((m, i) => (
                      <tr key={i} className="border-b border-border">
                        <td className="px-2 py-1.5 font-mono">{m.code || '—'}</td>
                        <td className="px-2 py-1.5">{m.description || '—'}</td>
                        <td className="px-2 py-1.5 text-right">{m.quantity || 0} {m.unit || ''}</td>
                        <td className="px-2 py-1.5">{m.reservation_code || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SF-579 — Cancel modal con tipología (ABSORBED / NOT_NEEDED / OTHER) */}
      <CancelWOModal
        open={!!cancelModalWO}
        onClose={() => setCancelModalWO(null)}
        wo={cancelModalWO}
        onSuccess={() => { fetchWOs(); setSelectedWO(null); setView('day'); }}
      />

      {/* SF-568 — Smart Assignment IA modal */}
      <SmartAssignModal
        open={!!smartAssign}
        onClose={() => setSmartAssign(null)}
        plantId={plant}
        specialty={smartAssign?.specialty}
        shift={selectedWO?.shift || 'day'}
        plannedHours={smartAssign?.plannedHours || 1}
        excludeWorkerIds={(selectedWO?.assigned_workers || []).map(w => w.worker_id || w.id).filter(Boolean)}
        onSelect={async (cand) => {
          if (!selectedWO) return;
          try {
            const next = [...(selectedWO.assigned_workers || []), {
              worker_id: cand.worker_id,
              name: cand.name,
              specialty: cand.specialty,
              shift: cand.shift,
            }];
            await api.updateManagedWO(selectedWO.wo_id, { assigned_workers: next });
            toast.success(`Asignado: ${cand.name} (score ${cand.score.toFixed(0)})`);
            fetchWOs();
            setSelectedWO(prev => prev ? { ...prev, assigned_workers: next } : prev);
          } catch (e) {
            toast.error('Error asignando: ' + (e.message || ''));
          }
        }}
      />
    </div>
  );
}
