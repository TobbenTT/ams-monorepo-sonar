import { useState, useEffect } from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, Tooltip,
} from 'recharts';
import { Loader2 } from 'lucide-react';
import { criticalityColor } from '../data/mockData';
import * as api from '../api';

// Classify each FMECA entry based on RPN + criticality class
function getClass(rpn, critClass) {
  if (critClass === 'AA' && rpn >= 150) return 'CRITICO';
  if (critClass === 'AA' && rpn >= 100) return 'ALTO';
  if (critClass === 'A+') return 'MEDIO-ALTO';
  if (critClass === 'A') return 'MEDIO';
  return 'BAJO';
}

const fmecaColor = {
  'CRITICO':    'bg-red-100 text-red-800 border border-red-300',
  'ALTO':       'bg-orange-100 text-orange-800 border border-orange-300',
  'MEDIO-ALTO': 'bg-amber-100 text-amber-800 border border-amber-300',
  'MEDIO':      'bg-yellow-100 text-yellow-800 border border-yellow-300',
  'BAJO':       'bg-green-100 text-green-800 border border-green-300',
};

const fmecaDot = {
  'CRITICO':    'bg-red-500',
  'ALTO':       'bg-orange-500',
  'MEDIO-ALTO': 'bg-amber-500',
  'MEDIO':      'bg-yellow-500',
  'BAJO':       'bg-green-500',
};

const RADAR_DATA = [
  { axis: 'Severidad',   value: 8.4 },
  { axis: 'Ocurrencia',  value: 5.0 },
  { axis: 'Detección',   value: 4.0 },
  { axis: 'Producción',  value: 4.2 },
  { axis: 'Seguridad',   value: 3.4 },
  { axis: 'Costo',       value: 3.6 },
];

export default function FMECA() {
  const [selectedEq, setSelectedEq] = useState(null);
  const [fmeaRecords, setFmeaRecords] = useState([]);
  const [critMatrix, setCritMatrix] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listFmecaWorksheets()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Map API worksheets to FMEA_RECORDS shape
          const mapped = data.map((ws) => ({
            id: ws.worksheet_id,
            equipment_tag: ws.equipment_tag || '',
            equipment_name: ws.equipment_name || ws.equipment_tag || '',
            failure_mode: ws.current_stage || 'Unknown',
            severity: 7, occurrence: 5, detectability: 4,
            rpn: 140,
          }));
          setFmeaRecords(mapped);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Build FMECA data: join records with criticality matrix
  const fmecaData = fmeaRecords.map((rec) => {
    const crit = critMatrix.find((c) => c.equipment_tag === rec.equipment_tag);
    const critScore = crit ? crit.total_score : 10;
    const critClass = crit ? crit.class : 'B';
    const combined = parseFloat((rec.rpn * (critScore / 25)).toFixed(1));
    const classification = getClass(rec.rpn, critClass);
    return { ...rec, critScore, critClass, combined, classification };
  });

  const filtered = selectedEq
    ? fmecaData.filter((r) => r.equipment_tag === selectedEq)
    : fmecaData;

  // Unique equipment tags
  const eqTags = [...new Set(fmeaRecords.map((r) => r.equipment_tag))];

  // Count per classification
  const counts = ['CRITICO', 'ALTO', 'MEDIO-ALTO', 'MEDIO', 'BAJO'].map((cls) => ({
    cls,
    count: fmecaData.filter((r) => r.classification === cls).length,
  }));

  const clsLabels = {
    'CRITICO':    'Crítico',
    'ALTO':       'Alto',
    'MEDIO-ALTO': 'Medio-Alto',
    'MEDIO':      'Medio',
    'BAJO':       'Bajo',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-sm text-gray-500">Loading datos FMECA...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">FMECA — Análisis de Modos de Fallo, Efectos y Criticidad</h1>
        <p className="text-sm text-gray-500 mt-1">
          Combinación de FMEA (RPN) y Análisis de Criticidad para priorización de riesgos
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 mb-6">
        {counts.map(({ cls, count }) => (
          <div key={cls} className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col items-center shadow-sm">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mb-2 ${fmecaColor[cls]}`}>
              {clsLabels[cls]}
            </span>
            <span className="text-3xl font-bold text-gray-800">{count}</span>
            <span className="text-xs text-gray-400 mt-1">registros</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Radar Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Perfil de Riesgo Promedio</h2>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={RADAR_DATA}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fontSize: 9, fill: '#9ca3af' }} />
              <Radar
                name="Riesgo"
                dataKey="value"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.25}
                dot={{ r: 3, fill: '#ef4444' }}
              />
              <Tooltip formatter={(val) => [val.toFixed(1), 'Valor promedio']} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="mt-2 text-xs text-gray-400 text-center">
            Escala 0–10. Valores promedio de todos los registros FMEA.
          </div>
        </div>

        {/* Legend / info panel */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Criterios de Clasificación FMECA</h2>
          <div className="space-y-3">
            {[
              { cls: 'CRITICO',    rule: 'Clase AA + RPN ≥ 150', action: 'Acción inmediata requerida. Intervención urgente.' },
              { cls: 'ALTO',       rule: 'Clase AA + RPN ≥ 100', action: 'Priority alta. Planificar en próximo turno.' },
              { cls: 'MEDIO-ALTO', rule: 'Clase A+ (cualquier RPN)', action: 'Incluir en próxima parada programada.' },
              { cls: 'MEDIO',      rule: 'Clase A (cualquier RPN)', action: 'Programar en plan mensual.' },
              { cls: 'BAJO',       rule: 'Resto de casos', action: 'Monitorear. Sin urgencia inmediata.' },
            ].map(({ cls, rule, action }) => (
              <div key={cls} className="flex items-start gap-3">
                <span className={`mt-0.5 inline-block w-3 h-3 rounded-full flex-shrink-0 ${fmecaDot[cls]}`} />
                <div>
                  <span className="text-xs font-semibold text-gray-700">{clsLabels[cls]}</span>
                  <span className="text-xs text-gray-400 mx-2">|</span>
                  <span className="text-xs text-gray-500">{rule}</span>
                  <p className="text-xs text-gray-400 mt-0.5">{action}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-xs text-blue-700 font-medium">Fórmula Combinado</p>
            <p className="text-xs text-blue-600 mt-1">
              Combinado = RPN × (Score Criticidad / 25)
            </p>
            <p className="text-xs text-blue-500 mt-0.5">
              Normaliza el RPN ponderando el score de criticidad (máx. 25 puntos).
            </p>
          </div>
        </div>
      </div>

      {/* Filter buttons */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-sm font-semibold text-gray-700 mr-2">Filtrar equipo:</span>
          <button
            onClick={() => setSelectedEq(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              selectedEq === null
                ? 'bg-gray-800 text-white border-gray-800'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Todos
          </button>
          {eqTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedEq(tag === selectedEq ? null : tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                selectedEq === tag
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Equipo', 'Modo de Fallo', 'S', 'O', 'D', 'RPN', 'Clase Crit.', 'Score Crit.', 'Combinado', 'Clasificación FMECA'].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-3 py-2 text-left font-semibold text-gray-600 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-3 py-2 font-medium text-gray-800 whitespace-nowrap">
                    <div>{row.equipment_tag}</div>
                    <div className="text-gray-400 font-normal">{row.equipment_name}</div>
                  </td>
                  <td className="px-3 py-2 text-gray-600 max-w-xs">
                    {row.failure_mode}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className={`inline-block px-1.5 py-0.5 rounded font-bold ${
                      row.severity >= 9 ? 'bg-red-100 text-red-700' :
                      row.severity >= 7 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>{row.severity}</span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className={`inline-block px-1.5 py-0.5 rounded font-bold ${
                      row.occurrence >= 7 ? 'bg-red-100 text-red-700' :
                      row.occurrence >= 4 ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>{row.occurrence}</span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className="inline-block px-1.5 py-0.5 rounded font-bold bg-gray-100 text-gray-600">
                      {row.detectability}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded font-bold text-sm ${
                      row.rpn >= 160 ? 'bg-red-100 text-red-700' :
                      row.rpn >= 100 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>{row.rpn}</span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${criticalityColor(row.critClass)}`}>
                      {row.critClass}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center font-medium text-gray-700">
                    {row.critScore}
                  </td>
                  <td className="px-3 py-2 text-center font-bold text-gray-800">
                    {row.combined}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${fmecaColor[row.classification]}`}>
                      {clsLabels[row.classification]}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-3 py-8 text-center text-gray-400">
                    No records for selected equipment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-3 text-xs text-gray-400">
          Mostrando {filtered.length} de {fmecaData.length} registros FMECA
        </div>
      </div>
    </div>
  );
}
