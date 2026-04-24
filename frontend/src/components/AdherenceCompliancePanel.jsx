import { useState, useEffect } from 'react';
import { TrendingUp, Target, Loader2 } from 'lucide-react';
import * as api from '../api';

/**
 * Jorge SF-516 (Tanda 1): Adherencia + Cumplimiento consolidado.
 * Adherencia = |actual_start - planned_start| < 1h
 * Cumplimiento = |actual_start - planned_start| ≤ 7d
 * Agregado por semana + por área (planning_group).
 */
export default function AdherenceCompliancePanel({ plantId, weeks = 12 }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.getAdherenceCompliance(plantId, weeks)
      .then(d => { if (active) setData(d); })
      .catch(() => { if (active) setData(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [plantId, weeks]);

  if (loading) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-5 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!data || data.total === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 p-5">
        <div className="flex items-center gap-2 mb-1">
          <Target className="w-5 h-5 text-emerald-700" />
          <h3 className="text-sm font-bold text-emerald-900">Adherencia + Cumplimiento</h3>
        </div>
        <p className="text-xs text-emerald-800">
          Sin OTs cerradas en los últimos {weeks} semanas. Los KPIs se calculan cuando hay datos reales de planned_start vs actual_start.
        </p>
      </div>
    );
  }

  const adhColor = data.adherence_pct >= 80 ? 'emerald' : data.adherence_pct >= 60 ? 'amber' : 'red';
  const cmpColor = data.compliance_pct >= 90 ? 'emerald' : data.compliance_pct >= 75 ? 'amber' : 'red';

  return (
    <div className="rounded-xl border bg-white p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-700" />
          <h3 className="text-sm font-bold text-gray-900">Adherencia + Cumplimiento · últimas {weeks} semanas</h3>
        </div>
        <span className="text-[10px] text-gray-500">{data.total} OTs analizadas</span>
      </div>

      {/* KPIs globales */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`rounded-lg p-4 border-2 bg-${adhColor}-50 border-${adhColor}-300`}>
          <div className={`text-[10px] uppercase tracking-wider font-bold text-${adhColor}-700`}>Adherencia (&lt;1h desvío)</div>
          <div className={`text-3xl font-bold mt-1 text-${adhColor}-900`}>{data.adherence_pct}%</div>
          <div className={`text-[10px] text-${adhColor}-700 mt-1`}>Fecha/hora exacta vs planificada</div>
        </div>
        <div className={`rounded-lg p-4 border-2 bg-${cmpColor}-50 border-${cmpColor}-300`}>
          <div className={`text-[10px] uppercase tracking-wider font-bold text-${cmpColor}-700`}>Cumplimiento (ventana 7d)</div>
          <div className={`text-3xl font-bold mt-1 text-${cmpColor}-900`}>{data.compliance_pct}%</div>
          <div className={`text-[10px] text-${cmpColor}-700 mt-1`}>Ejecutado dentro de la semana</div>
        </div>
      </div>

      {/* Trend semana */}
      {data.by_week.length > 0 && (
        <div>
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Tendencia semanal</h4>
          <div className="flex items-end gap-1 h-24 border-b border-gray-200 pb-1">
            {data.by_week.slice(-weeks).map(w => {
              const hA = Math.max(3, w.adherence_pct * 0.9);
              const hC = Math.max(3, w.compliance_pct * 0.9);
              return (
                <div key={w.week} className="flex-1 flex flex-col items-center" title={`${w.week}: ${w.adherence_pct}% adh / ${w.compliance_pct}% cmp · ${w.total} OTs`}>
                  <div className="flex items-end gap-0.5 w-full h-full">
                    <div className="flex-1 bg-emerald-400 rounded-t" style={{ height: `${hA}%` }} />
                    <div className="flex-1 bg-blue-400 rounded-t" style={{ height: `${hC}%` }} />
                  </div>
                  <div className="text-[8px] text-gray-400 mt-0.5 truncate">{w.week.slice(5)}</div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-4 mt-1 text-[10px]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-400 rounded" />Adherencia</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-400 rounded" />Cumplimiento</span>
          </div>
        </div>
      )}

      {/* Por área */}
      {data.by_area.length > 0 && (
        <div>
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Por área (planning group)</h4>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-1 font-semibold text-gray-600">Área</th>
                <th className="text-center py-1 font-semibold text-gray-600">OTs</th>
                <th className="text-center py-1 font-semibold text-emerald-700">Adh %</th>
                <th className="text-center py-1 font-semibold text-blue-700">Cmp %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.by_area.slice(0, 8).map(a => (
                <tr key={a.area}>
                  <td className="py-1 font-mono">{a.area}</td>
                  <td className="py-1 text-center">{a.total}</td>
                  <td className="py-1 text-center font-bold">{a.adherence_pct}%</td>
                  <td className="py-1 text-center font-bold">{a.compliance_pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
