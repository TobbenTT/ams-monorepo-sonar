/**
 * GanttPanel — Jorge G (transcript 2026-05-14).
 *
 * Carta Gantt visual de las OTs programadas/en ejecución para las
 * próximas N semanas. Default sort por fecha (calendario).
 * Color por IMPACTO (no prioridad): CRITICO=rojo, ALTO=naranja,
 * MEDIO=amarillo, BAJO=verde.
 *
 * Incluye botón Export Excel (descarga directa endpoint .xlsx).
 */
import { useEffect, useState } from 'react';
import { Loader2, Download, AlertTriangle, BarChart3 } from 'lucide-react';
import { getGanttManaged, getGanttExportUrl } from '../../api';

const _normalize = (plantId, weeks) => getGanttManaged({ plant_id: plantId, weeks });

const IMPACT_COLORS = {
  CRITICO: 'bg-red-500 text-white',
  ALTO: 'bg-orange-500 text-white',
  MEDIO: 'bg-amber-400 text-amber-900',
  BAJO: 'bg-emerald-500 text-white',
};

const IMPACT_LABEL = {
  CRITICO: '🔴 Crítico',
  ALTO: '🟠 Alto',
  MEDIO: '🟡 Medio',
  BAJO: '🟢 Bajo',
};

export default function GanttPanel({ plantId = 'OCP-JFC1', weeks = 2 }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [impactFilter, setImpactFilter] = useState('all');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    _normalize(plantId, weeks)
      .then(d => { if (!cancelled) setRows(Array.isArray(d) ? d : []); })
      .catch(e => { if (!cancelled) setError(e.message || 'Error'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [plantId, weeks]);

  const filtered = impactFilter === 'all'
    ? rows
    : rows.filter(r => r.impact_level === impactFilter);

  const counts = rows.reduce((acc, r) => {
    acc[r.impact_level] = (acc[r.impact_level] || 0) + 1;
    return acc;
  }, {});

  if (loading) return (
    <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
      <Loader2 className="animate-spin" size={16} /> Generando carta Gantt…
    </div>
  );

  if (error) return (
    <div className="flex items-center gap-2 p-6 text-sm text-red-600">
      <AlertTriangle size={16} /> Error: {error}
    </div>
  );

  if (!rows.length) return (
    <div className="p-6 text-sm text-muted-foreground">
      Sin OTs programadas en este horizonte ({weeks} semana{weeks > 1 ? 's' : ''}).
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Header con counts + filtro + export */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <BarChart3 size={18} className="text-emerald-600" />
          <h3 className="text-base font-bold">Carta Gantt · {weeks} semana{weeks > 1 ? 's' : ''}</h3>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filtro por impacto */}
          <div className="flex items-center gap-1 text-[10px]">
            <span className="text-muted-foreground">Impacto:</span>
            <button onClick={() => setImpactFilter('all')}
              className={`px-2 py-0.5 rounded border ${impactFilter === 'all' ? 'bg-foreground text-background' : 'border-border'}`}>
              Todos ({rows.length})
            </button>
            {['CRITICO', 'ALTO', 'MEDIO', 'BAJO'].map(imp => counts[imp] > 0 && (
              <button key={imp} onClick={() => setImpactFilter(imp)}
                className={`px-2 py-0.5 rounded ${impactFilter === imp ? IMPACT_COLORS[imp] : 'border border-border opacity-60 hover:opacity-100'}`}>
                {IMPACT_LABEL[imp]} ({counts[imp]})
              </button>
            ))}
          </div>
          {/* Export Excel */}
          <a
            href={getGanttExportUrl(plantId, weeks)}
            download
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-medium transition-colors"
            title="Descargar carta Gantt + disponibilidad en Excel"
          >
            <Download size={14} /> Excel
          </a>
        </div>
      </div>

      {/* Tabla Gantt */}
      <div className="overflow-x-auto border border-border rounded-lg max-h-[70vh] overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="bg-muted/30 sticky top-0 z-10">
            <tr>
              <th className="text-left px-3 py-2 font-semibold">N° OT</th>
              <th className="text-left px-3 py-2 font-semibold">Equipo</th>
              <th className="px-2 py-2 text-center font-semibold">Crit</th>
              <th className="text-left px-3 py-2 font-semibold">Descripción</th>
              <th className="px-2 py-2 text-center font-semibold">Tipo</th>
              <th className="px-2 py-2 text-center font-semibold">Impacto</th>
              <th className="px-3 py-2 text-center font-semibold">Inicio</th>
              <th className="px-3 py-2 text-center font-semibold">Fin</th>
              <th className="px-2 py-2 text-center font-semibold">HH</th>
              <th className="text-left px-3 py-2 font-semibold">Técnicos</th>
              <th className="px-2 py-2 text-center font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.wo_id} className="border-t border-border/30 hover:bg-muted/10">
                <td className="px-3 py-1.5 font-mono font-semibold">{r.wo_number}</td>
                <td className="px-3 py-1.5 font-mono text-[11px]">{r.equipment_tag}</td>
                <td className="px-2 py-1.5 text-center">
                  <span className={`text-[9px] px-1 rounded font-bold ${
                    r.equipment_criticality === 'AA' ? 'bg-red-600 text-white' :
                    r.equipment_criticality === 'A' ? 'bg-orange-500 text-white' :
                    'bg-gray-300 text-gray-700'
                  }`}>{r.equipment_criticality}</span>
                </td>
                <td className="px-3 py-1.5 text-[11px] truncate max-w-[280px]" title={r.description}>
                  {r.description}
                </td>
                <td className="px-2 py-1.5 text-center text-[10px] text-muted-foreground">
                  {r.wo_type}
                </td>
                <td className="px-2 py-1.5 text-center">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${IMPACT_COLORS[r.impact_level] || ''}`}>
                    {r.impact_level}
                  </span>
                </td>
                <td className="px-3 py-1.5 text-center font-mono text-[10px]">
                  {r.planned_start ? new Date(r.planned_start).toLocaleString('es', {
                    month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
                  }) : '—'}
                </td>
                <td className="px-3 py-1.5 text-center font-mono text-[10px]">
                  {r.planned_end ? new Date(r.planned_end).toLocaleString('es', {
                    month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
                  }) : '—'}
                </td>
                <td className="px-2 py-1.5 text-center font-mono">{r.estimated_hours || 0}</td>
                <td className="px-3 py-1.5 text-[10px] truncate max-w-[180px]">
                  {(r.assigned_workers || []).map(w => typeof w === 'string' ? w : (w.name || w.worker_id))
                    .filter(Boolean).join(', ') || <span className="text-muted-foreground">sin asignar</span>}
                </td>
                <td className="px-2 py-1.5 text-center text-[10px]">
                  <span className={`px-1.5 py-0.5 rounded ${
                    r.status === 'EJECUTADO' || r.status === 'CERRADO' ? 'bg-emerald-100 text-emerald-700' :
                    r.status === 'EN_EJECUCION' ? 'bg-blue-100 text-blue-700' :
                    r.status === 'PROGRAMADO' ? 'bg-purple-100 text-purple-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
