import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Package, Clock, Users, AlertTriangle, TrendingDown, Layers } from "lucide-react";
import { BACKLOG_ITEMS, ANALYTICS_DATA, priorityColor, statusColor } from "../data/mockData";

const REASON_COLORS: Record<string, string> = {
  AWAITING_SHUTDOWN: "#F59E0B",
  AWAITING_MATERIALS: "#EF4444",
  WORKFORCE_UNAVAILABLE: "#8B5CF6",
  AWAITING_APPROVAL: "#3B82F6",
  SCHEDULED_SHUTDOWN: "#10B981",
};

const REASON_LABELS: Record<string, string> = {
  AWAITING_SHUTDOWN: "Espera Parada",
  AWAITING_MATERIALS: "Sin Materiales",
  WORKFORCE_UNAVAILABLE: "Sin Personal",
  AWAITING_APPROVAL: "Espera Aprobación",
  SCHEDULED_SHUTDOWN: "Parada Programada",
};

export function Backlog() {
  const [sortBy, setSortBy] = useState<"age" | "priority">("priority");

  const sorted = [...BACKLOG_ITEMS].sort((a, b) => {
    if (sortBy === "age") return b.age_days - a.age_days;
    const pOrder = { P1: 0, P2: 1, P3: 2, P4: 3 };
    return (pOrder[a.priority as keyof typeof pOrder] ?? 3) - (pOrder[b.priority as keyof typeof pOrder] ?? 3);
  });

  const totalHours = BACKLOG_ITEMS.reduce((a, b) => a + b.estimated_hours, 0);
  const groups = [...new Set(BACKLOG_ITEMS.filter(b => b.group_id).map(b => b.group_id))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">📦 Gestión de Backlog</h1>
        <p className="text-sm text-gray-500">{BACKLOG_ITEMS.length} ítems · {totalHours}h acumuladas · {groups.length} grupos agrupables</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Backlog", value: BACKLOG_ITEMS.length, icon: Layers, color: "text-blue-600 bg-blue-50" },
          { label: "Horas Pendientes", value: `${totalHours}h`, icon: Clock, color: "text-amber-600 bg-amber-50" },
          { label: "P1 Urgentes", value: BACKLOG_ITEMS.filter(b => b.priority === "P1").length, icon: AlertTriangle, color: "text-red-600 bg-red-50" },
          { label: "Sin Materiales", value: BACKLOG_ITEMS.filter(b => b.reason === "AWAITING_MATERIALS").length, icon: Package, color: "text-purple-600 bg-purple-50" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}><Icon size={18} /></div>
            <div>
              <p className="text-xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Backlog by Reason Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Distribución por Razón</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ANALYTICS_DATA.backlog_by_reason} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="reason" type="category" tick={{ fontSize: 10 }} width={90} />
              <Tooltip />
              <Bar dataKey="count" name="Ítems" radius={[0, 4, 4, 0]}>
                {ANALYTICS_DATA.backlog_by_reason.map((_, i) => (
                  <Cell key={i} fill={Object.values(REASON_COLORS)[i] ?? "#6B7280"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Groupable Work */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Layers size={16} className="text-green-700" /> Agrupación de Trabajos</h3>
            <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full border border-green-200 font-medium">
              {BACKLOG_ITEMS.filter(b => b.group_id).length} agrupables detectados
            </span>
          </div>
          <div className="space-y-3">
            {groups.map((gid) => {
              const items = BACKLOG_ITEMS.filter(b => b.group_id === gid);
              const totalH = items.reduce((a, b) => a + b.estimated_hours, 0);
              return (
                <div key={gid} className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-green-800">{gid}</span>
                    <span className="text-xs text-green-700">{items.length} trabajos · {totalH}h total</span>
                  </div>
                  <div className="space-y-1">
                    {items.map(item => (
                      <div key={item.id} className="flex items-center justify-between bg-white rounded px-2 py-1.5 text-xs">
                        <span className="font-medium text-gray-700">{item.equipment_tag}</span>
                        <div className="flex gap-2 items-center">
                          <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${priorityColor(item.priority)}`}>{item.priority}</span>
                          <span className="text-gray-500">{item.estimated_hours}h</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="mt-2 w-full text-xs text-green-700 font-medium bg-green-100 hover:bg-green-200 rounded py-1.5 transition-colors">
                    ✦ Crear paquete de trabajo agrupado
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Backlog Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Lista de Backlog</h3>
          <div className="flex gap-2">
            {(["priority", "age"] as const).map(s => (
              <button key={s} onClick={() => setSortBy(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${sortBy === s ? "bg-[#2E7D32] text-white" : "bg-gray-100 text-gray-600"}`}>
                {s === "priority" ? "Por Prioridad" : "Por Antigüedad"}
              </button>
            ))}
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {["ID", "Equipo", "Razón", "Prioridad", "Antigüedad", "Horas Est.", "Planta"].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-2.5 font-mono text-xs text-gray-600">{item.id}</td>
                <td className="px-4 py-2.5">
                  <p className="font-semibold text-gray-800 text-xs">{item.equipment_tag}</p>
                  {item.wr_id && <p className="text-xs text-gray-400">{item.wr_id}</p>}
                </td>
                <td className="px-4 py-2.5">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium text-white" style={{ backgroundColor: REASON_COLORS[item.reason] ?? "#6B7280" }}>
                    {REASON_LABELS[item.reason] ?? item.reason}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-bold ${priorityColor(item.priority)}`}>{item.priority}</span>
                </td>
                <td className="px-4 py-2.5">
                  <span className={`text-xs font-semibold ${item.age_days >= 7 ? "text-red-600" : item.age_days >= 3 ? "text-amber-600" : "text-gray-600"}`}>
                    {item.age_days}d
                  </span>
                </td>
                <td className="px-4 py-2.5 text-xs text-gray-600">{item.estimated_hours}h</td>
                <td className="px-4 py-2.5 text-xs text-gray-600">{item.plant}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
