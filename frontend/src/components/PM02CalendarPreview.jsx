import { useState, useEffect, useMemo } from 'react';
import { Calendar, Wrench, AlertCircle, Loader2 } from 'lucide-react';
import * as api from '../api';

/**
 * Jorge 2026-04-23 (Tanda 4): Preview anual del calendario PM02 auto-generadas
 * por la estrategia (FMECA → MaintenanceTask → proyección por frecuencia).
 *
 * Renderiza un heatmap mensual de los próximos 12 meses mostrando cuántas
 * PM02 caen cada semana, con tooltip de los tasks y sus equipos.
 */
export default function PM02CalendarPreview({ plantId, months = 12, onClose }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.getPm02Calendar(plantId, months)
      .then(d => { if (active) setData(d); })
      .catch(() => { if (active) setData({ events: [], event_count: 0 }); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [plantId, months]);

  const { byMonth, totalHours, shutdownHours, monthsList } = useMemo(() => {
    if (!data?.events) return { byMonth: {}, totalHours: 0, shutdownHours: 0, monthsList: [] };
    const g = {};
    let total = 0, shut = 0;
    for (const e of data.events) {
      const m = e.date.slice(0, 7);
      if (!g[m]) g[m] = [];
      g[m].push(e);
      total += e.hours || 0;
      if (e.shutdown) shut += e.hours || 0;
    }
    const now = new Date();
    const list = [];
    for (let i = 0; i < months; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const key = d.toISOString().slice(0, 7);
      list.push({ key, label: d.toLocaleDateString('es-CL', { month: 'short', year: '2-digit' }).toUpperCase() });
    }
    return { byMonth: g, totalHours: total, shutdownHours: shut, monthsList: list };
  }, [data, months]);

  const maxCount = Math.max(1, ...Object.values(byMonth).map(arr => arr.length));

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100"><Calendar className="w-5 h-5 text-blue-700" /></div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Calendario PM02 · Preview {months} meses</h3>
              <p className="text-xs text-gray-500">Proyección de tareas generadas por la estrategia (FMECA → MaintenanceTask)</p>
            </div>
          </div>
          <button onClick={onClose} className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">Cerrar</button>
        </div>

        <div className="p-5 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2 text-sm text-gray-500">Calculando proyección…</span>
            </div>
          ) : (data.event_count === 0) ? (
            <div className="rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 p-6 text-center">
              <AlertCircle className="w-10 h-10 text-amber-600 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-amber-900 mb-1">Sin tareas de estrategia activas</h4>
              <p className="text-xs text-amber-800 max-w-md mx-auto">
                El calendario se alimenta de los <b>MaintenanceTask</b> generados al hacer
                <i> push-to-backlog </i> desde un worksheet FMECA. Crea y aprueba al menos un
                worksheet con estrategia <code>FIXED_TIME</code> o <code>CONDITION_BASED</code> para
                ver el preview proyectado.
              </p>
            </div>
          ) : (
            <>
              {/* Resumen */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border p-3 bg-blue-50 border-blue-200">
                  <div className="text-[10px] uppercase tracking-wider text-blue-600 font-bold">Tareas proyectadas</div>
                  <div className="text-2xl font-bold text-blue-900">{data.event_count}</div>
                </div>
                <div className="rounded-lg border p-3 bg-indigo-50 border-indigo-200">
                  <div className="text-[10px] uppercase tracking-wider text-indigo-600 font-bold">HH Total</div>
                  <div className="text-2xl font-bold text-indigo-900">{totalHours.toFixed(1)}h</div>
                </div>
                <div className="rounded-lg border p-3 bg-red-50 border-red-200">
                  <div className="text-[10px] uppercase tracking-wider text-red-600 font-bold">HH con Shutdown</div>
                  <div className="text-2xl font-bold text-red-900">{shutdownHours.toFixed(1)}h</div>
                </div>
              </div>

              {/* Heatmap mensual */}
              <div>
                <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Distribución por mes</h4>
                <div className="grid grid-cols-12 gap-1">
                  {monthsList.map(m => {
                    const evs = byMonth[m.key] || [];
                    const intensity = evs.length / maxCount;
                    const bg = intensity > 0.66 ? 'bg-blue-700 text-white' : intensity > 0.33 ? 'bg-blue-400 text-white' : intensity > 0 ? 'bg-blue-200 text-blue-900' : 'bg-gray-100 text-gray-400';
                    return (
                      <div key={m.key} className={`rounded p-2 text-center ${bg}`} title={`${m.label}: ${evs.length} tareas`}>
                        <div className="text-[9px] font-bold uppercase">{m.label}</div>
                        <div className="text-base font-bold">{evs.length}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tabla tareas próximas */}
              <div>
                <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Próximas 20 tareas</h4>
                <div className="rounded-lg border max-h-72 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="text-left px-3 py-2 font-semibold">Fecha</th>
                        <th className="text-left px-3 py-2 font-semibold">Equipo</th>
                        <th className="text-left px-3 py-2 font-semibold">Tarea</th>
                        <th className="text-center px-3 py-2 font-semibold">HH</th>
                        <th className="text-center px-3 py-2 font-semibold">Shutdown</th>
                        <th className="text-center px-3 py-2 font-semibold">Prio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {data.events.slice(0, 20).map((e, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-3 py-1.5 font-mono">{e.date}</td>
                          <td className="px-3 py-1.5">{e.equipment_tag || '—'}</td>
                          <td className="px-3 py-1.5">{e.task_name}</td>
                          <td className="px-3 py-1.5 text-center font-mono">{e.hours.toFixed(1)}</td>
                          <td className="px-3 py-1.5 text-center">{e.shutdown ? '🛑' : ''}</td>
                          <td className="px-3 py-1.5 text-center">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${e.priority === 'P4' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{e.priority}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
          <p className="text-[10px] text-gray-400 italic">{data?.note}</p>
        </div>
      </div>
    </div>
  );
}
