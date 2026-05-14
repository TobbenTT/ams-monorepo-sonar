/**
 * AvailabilityPanel — Jorge F (transcript 2026-05-14).
 *
 * Muestra disponibilidad por equipo / día / semana. Consume
 * GET /api/v1/scheduling/availability.
 *
 * Cada celda: % disponibilidad (verde >95, ámbar 90-95, rojo <90).
 * Última columna: promedio semanal.
 */
import { useEffect, useState } from 'react';
import { Loader2, Activity, AlertTriangle } from 'lucide-react';
import { getEquipmentAvailability } from '../../api';

export default function AvailabilityPanel({ plantId = 'OCP-JFC1', weekStart, weeks = 1 }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getEquipmentAvailability(plantId, weekStart, weeks)
      .then(d => { if (!cancelled) setData(d); })
      .catch(e => { if (!cancelled) setError(e.message || 'Error'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [plantId, weekStart, weeks]);

  if (loading) return (
    <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
      <Loader2 className="animate-spin" size={16} /> Calculando disponibilidad…
    </div>
  );

  if (error) return (
    <div className="flex items-center gap-2 p-6 text-sm text-red-600">
      <AlertTriangle size={16} /> Error: {error}
    </div>
  );

  if (!data || !data.equipment?.length) return (
    <div className="p-6 text-sm text-muted-foreground">Sin equipos para mostrar.</div>
  );

  const cellColor = (pct) => {
    if (pct >= 95) return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300';
    if (pct >= 90) return 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300';
    return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-emerald-600" />
          <h3 className="text-base font-bold">Disponibilidad por equipo</h3>
        </div>
        <div className="text-xs text-muted-foreground">
          {data.summary.equipment_count} equipos · prom semanal: <b>{data.summary.week_available_avg}%</b>
          · baseline falla: {data.summary.baseline_failure_pct}%
        </div>
      </div>

      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="w-full text-xs">
          <thead className="bg-muted/30 sticky top-0">
            <tr>
              <th className="text-left px-3 py-2 font-semibold sticky left-0 bg-muted/30">Equipo</th>
              {data.day_labels.map((label, i) => (
                <th key={data.days[i]} className="px-2 py-2 text-center font-semibold min-w-[70px]">
                  {label}
                </th>
              ))}
              <th className="px-3 py-2 text-center font-bold bg-muted/50 min-w-[90px]">
                Semana
              </th>
              <th className="px-2 py-2 text-center font-semibold text-muted-foreground min-w-[80px]">
                Detenido (h)
              </th>
            </tr>
          </thead>
          <tbody>
            {data.equipment.map(eq => (
              <tr key={eq.tag} className="border-t border-border/30 hover:bg-muted/10">
                <td className="px-3 py-1.5 sticky left-0 bg-card font-mono whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] px-1 rounded font-bold ${
                      eq.criticality === 'AA' ? 'bg-red-600 text-white' :
                      eq.criticality === 'A' ? 'bg-orange-500 text-white' :
                      'bg-gray-300 text-gray-700'
                    }`}>{eq.criticality}</span>
                    <span className="font-semibold">{eq.tag}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                    {eq.name}
                  </div>
                </td>
                {eq.daily.map(d => (
                  <td key={d.date}
                      className={`px-2 py-1.5 text-center font-mono ${cellColor(d.available_pct)}`}
                      title={`Detenido: ${d.downtime_h}h\nDisp: ${d.available_pct}%`}>
                    {d.available_pct}%
                  </td>
                ))}
                <td className={`px-3 py-1.5 text-center font-mono font-bold ${cellColor(eq.week_available_pct)}`}>
                  {eq.week_available_pct}%
                </td>
                <td className="px-2 py-1.5 text-center text-muted-foreground">
                  {eq.total_downtime_h}h
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
