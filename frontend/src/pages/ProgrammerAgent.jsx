import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, BarChart3, AlertTriangle, DollarSign, TrendingUp, Loader2 } from 'lucide-react';
import * as api from '../api';

function fmt(n, suf = '') { return n == null ? '—' : `${n}${suf}`; }

function availColor(pct) {
  if (pct >= 85) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
  if (pct >= 70) return 'bg-amber-100 text-amber-800 border-amber-300';
  return 'bg-rose-100 text-rose-800 border-rose-300';
}

function priorityBadge(p) {
  const c = { P1: 'bg-rose-600', P2: 'bg-amber-500', P3: 'bg-blue-500', P4: 'bg-gray-400' }[p] || 'bg-gray-400';
  return <span className={`text-[10px] font-bold text-white px-1.5 py-0.5 rounded ${c}`}>{p}</span>;
}

export default function ProgrammerAgent() {
  const [tab, setTab] = useState('availability');
  const [loading, setLoading] = useState(true);
  const [avail, setAvail] = useState(null);
  const [report, setReport] = useState(null);
  const plantId = useMemo(() => localStorage.getItem('selected_plant') || 'OCP-JFC1', []);

  const monday = useMemo(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return d.toISOString().split('T')[0];
  }, []);
  const [weekStart, setWeekStart] = useState(monday);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.programmerEquipmentAvailability({ plant_id: plantId, week_start: weekStart, days: 7 }),
      api.programmerWeeklyReport({ plant_id: plantId, week_start: weekStart, history_weeks: 3, forecast_weeks: 4 }),
    ]).then(([a, r]) => { setAvail(a); setReport(r); }).finally(() => setLoading(false));
  }, [plantId, weekStart]);

  return (
    <div className="p-5 space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Calendar className="w-7 h-7 text-blue-700" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Programmer Agent</h1>
            <p className="text-sm text-gray-500">Excel Jorge · Bullets r49 #8 (disponibilidad) + #11 (reporte semanal)</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600">Semana inicio:</label>
          <input type="date" className="text-sm px-2 py-1 border rounded" value={weekStart} onChange={e => setWeekStart(e.target.value)} />
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <button onClick={() => setTab('availability')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 ${tab === 'availability' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500'}`}>
          <BarChart3 className="w-4 h-4 inline mr-1" /> #8 Disponibilidad por equipo
        </button>
        <button onClick={() => setTab('report')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 ${tab === 'report' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500'}`}>
          <TrendingUp className="w-4 h-4 inline mr-1" /> #11 Reporte semanal
        </button>
      </div>

      {loading && <div className="flex items-center gap-2 text-sm text-gray-500"><Loader2 className="w-4 h-4 animate-spin" /> Calculando...</div>}

      {!loading && tab === 'availability' && avail && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm text-gray-600">Equipos con OTs en la semana:</span>
            <span className="text-2xl font-bold text-blue-700">{avail.total_equipment}</span>
            <span className="text-xs text-gray-500">· período {avail.week_start?.slice(0, 10)} → {avail.week_end?.slice(0, 10)}</span>
          </div>
          {avail.equipment.length === 0 ? (
            <div className="text-sm text-gray-500 italic p-4">No hay OTs programadas en esta semana para esta planta.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="text-left px-3 py-2">Equipo</th>
                    <th className="text-right px-3 py-2">Disp. semana</th>
                    <th className="text-right px-3 py-2">Downtime (h)</th>
                    <th className="text-left px-3 py-2">Por día (turno día / noche)</th>
                  </tr>
                </thead>
                <tbody>
                  {avail.equipment.map(e => (
                    <tr key={e.equipment_tag} className="border-t border-gray-100">
                      <td className="px-3 py-2 font-mono font-bold">{e.equipment_tag}</td>
                      <td className={`px-3 py-2 text-right font-bold border ${availColor(e.weekly_avail_pct)}`}>{e.weekly_avail_pct}%</td>
                      <td className="px-3 py-2 text-right">{e.weekly_downtime_h}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          {e.days.map(d => (
                            <div key={d.date} className="px-1.5 py-0.5 rounded border bg-gray-50 text-[10px]" title={`OTs: ${d.ots.map(o => o.id).join(', ')}`}>
                              <div className="font-mono">{d.date.slice(5)}</div>
                              <div className="text-emerald-700">D {d.day_shift_avail}%</div>
                              <div className="text-indigo-700">N {d.night_shift_avail}%</div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {!loading && tab === 'report' && report && (
        <div className="space-y-4">
          {/* Current week summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{report.current_week.total}</div>
              <div className="text-[10px] text-gray-500 uppercase">OTs semana</div>
            </div>
            <div className="bg-white rounded-xl border border-rose-200 p-3 text-center">
              <div className="text-2xl font-bold text-rose-600">{report.current_week.critical_p1p2}</div>
              <div className="text-[10px] text-gray-500 uppercase">Críticas P1+P2</div>
            </div>
            <div className="bg-white rounded-xl border border-amber-200 p-3 text-center">
              <div className="text-2xl font-bold text-amber-600">{report.current_week.planned_hours}h</div>
              <div className="text-[10px] text-gray-500 uppercase">HH planificadas</div>
            </div>
            <div className="bg-white rounded-xl border border-emerald-200 p-3 text-center">
              <div className="text-2xl font-bold text-emerald-600">${report.current_week.cost_estimate_usd?.toLocaleString()}</div>
              <div className="text-[10px] text-gray-500 uppercase">Costo estimado</div>
            </div>
          </div>

          {/* Critical tasks */}
          <div className="bg-white rounded-xl border border-rose-200 p-4">
            <h3 className="text-sm font-bold text-rose-800 mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Tareas críticas</h3>
            {report.critical_tasks.length === 0 ? (
              <div className="text-xs text-gray-500 italic">Sin tareas P1/P2 esta semana.</div>
            ) : (
              <div className="space-y-1">
                {report.critical_tasks.map(t => (
                  <div key={t.wo_number} className="flex items-center gap-2 text-xs border-t border-gray-100 py-1.5">
                    {priorityBadge(t.priority)}
                    <span className="font-mono font-bold">{t.wo_number}</span>
                    <span className="font-mono text-gray-600">{t.equipment_tag}</span>
                    <span className="flex-1 truncate">{t.title}</span>
                    <span className="text-gray-500">{t.estimated_hours}h</span>
                    <span className="text-gray-400 font-mono">{t.planned_start?.slice(0, 16).replace('T', ' ')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* History + forecast */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-bold text-gray-700 mb-2">Histórico 3 semanas anteriores</h3>
              <table className="w-full text-xs">
                <thead className="text-gray-600">
                  <tr>
                    <th className="text-left">Semana</th>
                    <th className="text-right">OTs</th>
                    <th className="text-right">P1+P2</th>
                    <th className="text-right">HH</th>
                    <th className="text-right">Costo</th>
                  </tr>
                </thead>
                <tbody>
                  {report.history_3w.map(w => (
                    <tr key={w.week_start} className="border-t border-gray-100">
                      <td className="font-mono">{w.week_start.slice(0, 10)}</td>
                      <td className="text-right">{w.total}</td>
                      <td className="text-right text-rose-700">{w.critical_p1p2}</td>
                      <td className="text-right">{w.planned_hours}h</td>
                      <td className="text-right">${w.cost_estimate_usd?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-white rounded-xl border border-blue-200 p-4">
              <h3 className="text-sm font-bold text-blue-700 mb-2">Forecast móvil 4 semanas</h3>
              <table className="w-full text-xs">
                <thead className="text-gray-600">
                  <tr>
                    <th className="text-left">Semana</th>
                    <th className="text-right">OTs</th>
                    <th className="text-right">P1+P2</th>
                    <th className="text-right">HH</th>
                    <th className="text-right">Costo</th>
                  </tr>
                </thead>
                <tbody>
                  {report.forecast_4w.map(w => (
                    <tr key={w.week_start} className="border-t border-gray-100">
                      <td className="font-mono">{w.week_start.slice(0, 10)}</td>
                      <td className="text-right">{w.total}</td>
                      <td className="text-right text-rose-700">{w.critical_p1p2}</td>
                      <td className="text-right">{w.planned_hours}h</td>
                      <td className="text-right">${w.cost_estimate_usd?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
