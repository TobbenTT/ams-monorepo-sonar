import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, Legend, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Minus, Award } from "lucide-react";
import { KPI_HISTORY, RELIABILITY_KPIs, ANALYTICS_DATA, EQUIPMENT_LIST } from "../data/mockData";

const COLORS = ["#2E7D32", "#F59E0B", "#EF4444", "#3B82F6", "#8B5CF6", "#10B981"];

const KPI_TARGETS = [
  { kpi: "Adherencia (%)", value: 93.1, target: 90, unit: "%", trend: "up" },
  { kpi: "Misclasificación P1", value: 28, target: 35, unit: "%", trend: "down", lowerBetter: true },
  { kpi: "OEE Promedio", value: 86.5, target: 85, unit: "%", trend: "up" },
  { kpi: "Tiempo Planificación", value: 78, target: 120, unit: "min", trend: "down", lowerBetter: true },
  { kpi: "MTBF SAG Mill", value: 720, target: 700, unit: "h", trend: "stable" },
  { kpi: "Disponibilidad Flota", value: 98.2, target: 97, unit: "%", trend: "up" },
];

const radarData = [
  { subject: "Planificación", A: 93, fullMark: 100 },
  { subject: "Confiabilidad", A: 86, fullMark: 100 },
  { subject: "Seguridad", A: 98, fullMark: 100 },
  { subject: "Costo", A: 81, fullMark: 100 },
  { subject: "Calidad", A: 88, fullMark: 100 },
  { subject: "Disponibilidad", A: 95, fullMark: 100 },
];

export function ExecutiveDashboard() {
  const lastKPI = KPI_HISTORY[KPI_HISTORY.length - 1];
  const prevKPI = KPI_HISTORY[KPI_HISTORY.length - 2];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl px-8 py-6 text-white">
        <h1 className="text-2xl font-bold">Dashboard Ejecutivo — OCP Jorf Lasfar</h1>
        <p className="text-gray-300 text-sm mt-1">Resumen de performance de mantenimiento · Febrero 2026</p>
        <div className="mt-4 flex items-center gap-6 text-sm">
          <span className="text-gray-300">15 Plantas · 20+ Equipos Críticos · 6 KPIs principales</span>
          <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full font-bold">OBJETIVOS: 4/6 ✓</span>
        </div>
      </div>

      {/* KPI Scorecards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {KPI_TARGETS.map((kpi) => {
          const isGood = kpi.lowerBetter ? kpi.value <= kpi.target : kpi.value >= kpi.target;
          const TrendIcon = kpi.trend === "up" ? TrendingUp : kpi.trend === "down" ? TrendingDown : Minus;
          const trendColor = (kpi.lowerBetter && kpi.trend === "down") || (!kpi.lowerBetter && kpi.trend === "up") ? "text-green-500" : kpi.trend === "stable" ? "text-gray-400" : "text-red-500";
          return (
            <div key={kpi.kpi} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">{kpi.kpi}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{kpi.value}{kpi.unit}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Objetivo: {kpi.target}{kpi.unit}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isGood ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {isGood ? "✓ OK" : "✗ NOK"}
                  </span>
                  <TrendIcon size={16} className={trendColor} />
                </div>
              </div>
              <div className="mt-3 w-full bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${isGood ? "bg-green-500" : "bg-red-400"}`}
                  style={{ width: `${Math.min(100, (kpi.value / (kpi.target * 1.2)) * 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* KPI Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Tendencia Adherencia vs Tiempo Planificación</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={KPI_HISTORY}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="schedule_adherence" name="Adherencia (%)" stroke="#2E7D32" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="oee_avg" name="OEE (%)" stroke="#3B82F6" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Radar */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Performance Global — Pilares de Mantenimiento</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
              <Radar name="Score" dataKey="A" stroke="#2E7D32" fill="#2E7D32" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Cost by Area */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Costo de Mantenimiento por Área (MAD)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ANALYTICS_DATA.cost_by_area}>
              <XAxis dataKey="area" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: number) => `${v.toLocaleString()} MAD`} />
              <Legend />
              <Bar dataKey="material" name="Materiales" fill="#2E7D32" radius={[2, 2, 0, 0]} />
              <Bar dataKey="labor" name="Mano de Obra" fill="#86EFAC" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* MTBF by Equipment */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">MTBF por Equipo (horas)</h3>
          <div className="space-y-3 mt-2">
            {RELIABILITY_KPIs.map((kpi) => (
              <div key={kpi.equipment_tag} className="flex items-center gap-3">
                <div className="w-28 text-xs text-gray-600 truncate">{kpi.equipment_tag.split("-").slice(1).join("-")}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                  <div className="h-2.5 rounded-full bg-[#2E7D32]" style={{ width: `${Math.min(100, (kpi.mtbf / 2200) * 100)}%` }} />
                </div>
                <div className="w-16 text-right text-xs font-semibold text-gray-700">{kpi.mtbf}h</div>
                <div className={`w-16 text-xs font-medium px-1.5 py-0.5 rounded text-center ${kpi.trend === "IMPROVING" ? "bg-green-100 text-green-700" : kpi.trend === "WORSENING" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>
                  {kpi.trend === "IMPROVING" ? "▲ Mejor" : kpi.trend === "WORSENING" ? "▼ Peor" : "→ Estable"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Equipment Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Estado de Flota de Equipos</h3>
          <span className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-lg">
            <Award size={12} /> {EQUIPMENT_LIST.filter(e => e.status === "RUNNING").length}/{EQUIPMENT_LIST.length} Operativos
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {EQUIPMENT_LIST.map(eq => (
            <div key={eq.tag} className={`rounded-lg p-2.5 text-xs border ${eq.status === "RUNNING" ? "bg-green-50 border-green-200" : eq.status === "MAINTENANCE" ? "bg-orange-50 border-orange-200" : "bg-gray-50 border-gray-200"}`}>
              <p className="font-semibold text-gray-800 truncate">{eq.tag}</p>
              <p className="text-gray-500 truncate">{eq.name.slice(0, 18)}</p>
              <div className="flex items-center justify-between mt-1">
                <span className={`font-bold text-xs ${eq.status === "RUNNING" ? "text-green-700" : eq.status === "MAINTENANCE" ? "text-orange-700" : "text-gray-600"}`}>{eq.status}</span>
                <span className={`font-bold text-xs px-1 py-0.5 rounded ${eq.criticality === "AA" ? "text-red-700" : eq.criticality === "A+" ? "text-orange-700" : "text-blue-700"}`}>{eq.criticality}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
