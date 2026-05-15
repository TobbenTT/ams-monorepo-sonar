/**
 * Plan12WeeksPanel — SF-746 + SF-747 (Jorge Sprint 7).
 *
 * Vista trimestral del planificador (no programador). Tabla equipo × 12
 * semanas con disponibilidad combinada: mes corriente desde OTs reales,
 * meses futuros desde Budget Anual.
 */
import { useEffect, useState } from 'react';
import { Calendar, Loader2, TrendingUp, AlertCircle } from 'lucide-react';

const colorPct = (pct, source) => {
  // Mes corriente (real): gradiente normal
  // Meses futuros (budget): hatched/lighter para diferenciar
  const base =
    pct >= 95 ? 'bg-emerald-100 text-emerald-800'
    : pct >= 90 ? 'bg-amber-100 text-amber-800'
    : 'bg-red-100 text-red-800';
  if (source === 'budget') return base + ' opacity-70 italic';
  return base;
};

export default function Plan12WeeksPanel({ plantId = 'OCP-JFC1' }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const tok = localStorage.getItem('token') || localStorage.getItem('access_token') || '';
    setLoading(true);
    fetch(`/api/v1/planning/12-weeks?plant_id=${encodeURIComponent(plantId)}`, {
      headers: { Authorization: 'Bearer ' + tok },
    })
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [plantId]);

  if (loading) {
    return (
      <div className="py-10 flex justify-center items-center text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Cargando Plan 12 Semanas…
      </div>
    );
  }
  if (error) {
    return (
      <div className="border border-red-300 bg-red-50 rounded-xl p-4 flex items-center gap-2 text-sm text-red-800">
        <AlertCircle className="w-4 h-4" /> Error cargando plan: {String(error)}
      </div>
    );
  }
  if (!data) return null;

  const { weeks, equipment, summary, start_date } = data;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-violet-600" />
          <h3 className="text-base font-bold">Plan 12 Semanas · {plantId}</h3>
          <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
            desde {start_date}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-bold text-emerald-700">{summary.plant_avg_pct}%</span>
            <span className="text-muted-foreground">prom planta</span>
          </div>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">
            {summary.equipment_count} equipos · {summary.weeks_in_current_month} sem reales · {summary.weeks_from_budget} sem budget
          </span>
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300"></span> ≥95%
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-amber-100 border border-amber-300"></span> 90-95%
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-100 border border-red-300"></span> &lt;90%
        </span>
        <span className="ml-3 italic">cursiva = budget anual (meses futuros)</span>
      </div>

      {/* Tabla equipo × 12 semanas */}
      <div className="bg-card border border-border rounded-xl overflow-auto" style={{ maxHeight: '70vh' }}>
        <table className="w-full text-[10.5px]">
          <thead className="sticky top-0 bg-muted/50 z-10">
            <tr>
              <th className="px-2 py-2 text-left font-semibold border-r border-border sticky left-0 bg-muted/50 min-w-[160px]">
                Equipo
              </th>
              <th className="px-1 py-2 text-center font-semibold border-r border-border w-12">Crit</th>
              <th className="px-1 py-2 text-center font-semibold border-r border-border w-14">Prom</th>
              {weeks.map(w => (
                <th key={w.index} className={`px-1 py-2 text-center font-mono font-bold border-r border-border min-w-[60px] ${w.is_current_month ? 'bg-violet-100 text-violet-800' : 'text-muted-foreground'}`}
                  title={`${w.start_date} → ${w.end_date}${w.is_current_month ? ' · mes corriente (real)' : ' · meses futuros (budget)'}`}>
                  {w.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {equipment.map(eq => (
              <tr key={eq.tag} className="border-b border-border/50 hover:bg-muted/20">
                <td className="px-2 py-1 font-mono font-semibold border-r border-border sticky left-0 bg-background" title={eq.name}>
                  <div className="truncate max-w-[160px]">{eq.tag}</div>
                  <div className="text-[9px] text-muted-foreground truncate max-w-[160px]">{eq.name}</div>
                </td>
                <td className="px-1 py-1 text-center border-r border-border">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    eq.criticality === 'AA' ? 'bg-red-100 text-red-700' :
                    eq.criticality === 'A' ? 'bg-orange-100 text-orange-700' :
                    eq.criticality === 'B' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>{eq.criticality || '—'}</span>
                </td>
                <td className="px-1 py-1 text-center font-bold border-r border-border tabular-nums">
                  {eq.avg_pct}%
                </td>
                {eq.weekly.map((w, i) => (
                  <td key={i} className={`px-1 py-1 text-center border-r border-border/50 tabular-nums ${colorPct(w.availability_pct, w.source)}`}
                    title={`${w.week}: ${w.availability_pct}% (${w.source === 'real' ? 'calculado de OTs' : 'budget anual'})`}>
                    {w.availability_pct}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-muted-foreground italic">
        El planificador entrega este plan los días 15-18 de cada mes a Planificación de Producción. Mes corriente se construye día×día desde OTs programadas; meses 2-3 vienen del Budget Anual cargado en septiembre.
      </p>
    </div>
  );
}
