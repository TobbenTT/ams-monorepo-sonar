import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, ComposedChart, Area } from "recharts";
import { ANALYTICS_DATA, KPI_HISTORY, RELIABILITY_KPIs } from "../data/mockData";

const COLORS = ["#2E7D32", "#F59E0B", "#EF4444", "#3B82F6", "#8B5CF6", "#10B981"];

export function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">📊 Analítica de Mantenimiento</h1>
        <p className="text-sm text-gray-500">KPIs, tendencias y análisis de datos — JFC-1 Complex</p>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Adherencia Semanal", value: "93.1%", trend: "+5.1pp", color: "text-green-700" },
          { label: "OEE Promedio", value: "86.5%", trend: "+5.3pp", color: "text-green-700" },
          { label: "Backlog Age", value: "7 días", trend: "-5 días", color: "text-green-700" },
          { label: "Tiempo Planificación", value: "78 min", trend: "-67 min", color: "text-green-700" },
          { label: "Mis. Prioridad", value: "28%", trend: "-24pp", color: "text-green-700" },
        ].map(({ label, value, trend, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
            <p className={`text-xs font-medium mt-0.5 ${color}`}>{trend} vs inicio proyecto</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* KPI Trends */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Tendencia KPIs — 6 Meses</h3>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={KPI_HISTORY}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="schedule_adherence" name="Adherencia (%)" fill="#dcfce7" stroke="#2E7D32" strokeWidth={2} />
              <Line type="monotone" dataKey="oee_avg" name="OEE (%)" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Pareto Failure Modes */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Pareto — Modos de Fallo (YTD)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={ANALYTICS_DATA.failure_modes_pareto}>
              <XAxis dataKey="mode" tick={{ fontSize: 9 }} angle={-15} />
              <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} domain={[0, 100]} tickFormatter={v => `${v}%`} />
              <Tooltip />
              <Bar yAxisId="left" dataKey="count" name="Ocurrencias" fill="#2E7D32" radius={[3, 3, 0, 0]}>
                {ANALYTICS_DATA.failure_modes_pareto.map((_, i) => <Cell key={i} fill={i === 0 ? "#1B5E20" : i < 3 ? "#2E7D32" : "#86EFAC"} />)}
              </Bar>
              <Line yAxisId="right" type="monotone" dataKey="cumulative_pct" name="% Acumulado" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Work Orders by Type */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Órdenes de Trabajo por Tipo</h3>
          <div className="flex gap-6 items-center">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie data={ANALYTICS_DATA.work_orders_by_type} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={70} label={({ type, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {ANALYTICS_DATA.work_orders_by_type.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {ANALYTICS_DATA.work_orders_by_type.map(({ type, count, hours }, i) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-xs text-gray-700">{type}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900">{count}</span>
                    <span className="text-xs text-gray-500 ml-1">({hours}h)</span>
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                  <span>Total</span>
                  <span>{ANALYTICS_DATA.work_orders_by_type.reduce((a, b) => a + b.count, 0)} OTs · {ANALYTICS_DATA.work_orders_by_type.reduce((a, b) => a + b.hours, 0)}h</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cost by Area */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Costo Mantenimiento por Área (k MAD)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ANALYTICS_DATA.cost_by_area}>
              <XAxis dataKey="area" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: number) => `${v.toLocaleString()} MAD`} />
              <Legend />
              <Bar dataKey="material" name="Materiales" fill="#2E7D32" stackId="a" />
              <Bar dataKey="labor" name="Mano de Obra" fill="#86EFAC" stackId="a" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Planning Time Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Tiempo de Planificación por Solicitud (min)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={KPI_HISTORY}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="planning_time_avg" name="Tiempo Planif. (min)" stroke="#8B5CF6" strokeWidth={2.5} dot={{ r: 4 }} />
              {/* Target line */}
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-green-700 mt-2 font-medium">▼ Reducción del 46% gracias al Asistente IA — de 145 min a 78 min promedio</p>
        </div>

        {/* MTBF Comparison */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">MTBF vs MTTR por Equipo</h3>
          <div className="space-y-3">
            {RELIABILITY_KPIs.slice(0, 5).map((kpi) => (
              <div key={kpi.equipment_tag} className="grid grid-cols-[1fr,auto,auto,auto] gap-2 items-center">
                <span className="text-xs text-gray-600 truncate">{kpi.equipment_tag.split("-").slice(1).join("-")}</span>
                <div className="text-center">
                  <p className="text-xs font-bold text-green-700">{kpi.mtbf}h</p>
                  <p className="text-xs text-gray-400">MTBF</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-red-600">{kpi.mttr}h</p>
                  <p className="text-xs text-gray-400">MTTR</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-blue-700">{kpi.availability}%</p>
                  <p className="text-xs text-gray-400">Disp.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
