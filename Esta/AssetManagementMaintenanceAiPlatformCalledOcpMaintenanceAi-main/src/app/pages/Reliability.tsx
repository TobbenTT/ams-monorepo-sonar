import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid, Legend } from "recharts";
import { RELIABILITY_KPIs } from "../data/mockData";
import { Activity, TrendingUp, TrendingDown } from "lucide-react";

// Generate Weibull CDF data for visualization
const generateWeibull = (beta: number, eta: number, points = 20) => {
  return Array.from({ length: points }, (_, i) => {
    const t = ((i + 1) / points) * eta * 2;
    const reliability = Math.exp(-Math.pow(t / eta, beta));
    const failure_rate = (beta / eta) * Math.pow(t / eta, beta - 1);
    return { t: Math.round(t), R: parseFloat((reliability * 100).toFixed(1)), hazard: parseFloat((failure_rate * 100).toFixed(3)) };
  });
};

// Generate mock failure history
const generateFailureHistory = (count: number, mtbf: number) => {
  return Array.from({ length: count }, (_, i) => ({
    failure: i + 1,
    time: Math.round(mtbf * (0.7 + Math.random() * 0.6)),
    repair_time: Math.round(8 + Math.random() * 20),
  }));
};

export function Reliability() {
  const [selectedEq, setSelectedEq] = useState(RELIABILITY_KPIs[0]);

  const weibullData = generateWeibull(selectedEq.weibull_beta, selectedEq.weibull_eta);
  const failureHistory = generateFailureHistory(selectedEq.failures_ytd, selectedEq.mtbf);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">📈 Ingeniería de Confiabilidad</h1>
        <p className="text-sm text-gray-500">MTBF · MTTR · Disponibilidad · Análisis Weibull · OEE</p>
      </div>

      {/* Equipment Selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-2">
        {RELIABILITY_KPIs.map(kpi => (
          <button
            key={kpi.equipment_tag}
            onClick={() => setSelectedEq(kpi)}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${selectedEq.equipment_tag === kpi.equipment_tag ? "bg-[#2E7D32] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            {kpi.equipment_tag.split("-").slice(1).join("-")}
          </button>
        ))}
      </div>

      {/* Selected Equipment KPIs */}
      <div className="bg-gradient-to-r from-[#1B5E20] to-[#388E3C] rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold">{selectedEq.equipment_tag}</h2>
            <p className="text-green-200 text-sm">{selectedEq.equipment_name}</p>
          </div>
          <div className={`px-3 py-1.5 rounded-lg text-xs font-bold ${selectedEq.trend === "IMPROVING" ? "bg-green-400 text-white" : selectedEq.trend === "WORSENING" ? "bg-red-400 text-white" : "bg-white/20 text-white"}`}>
            {selectedEq.trend === "IMPROVING" ? "▲ Mejorando" : selectedEq.trend === "WORSENING" ? "▼ Empeorando" : "→ Estable"}
          </div>
        </div>
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "MTBF", value: `${selectedEq.mtbf}h`, icon: "⏱️" },
            { label: "MTTR", value: `${selectedEq.mttr}h`, icon: "🔧" },
            { label: "Disponibilidad", value: `${selectedEq.availability}%`, icon: "✅" },
            { label: "OEE", value: `${selectedEq.oee}%`, icon: "⚙️" },
            { label: "Weibull β", value: selectedEq.weibull_beta, icon: "📐" },
            { label: "Weibull η", value: `${selectedEq.weibull_eta}h`, icon: "📊" },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-white/10 rounded-xl p-3 text-center">
              <span className="text-lg">{icon}</span>
              <p className="text-white font-bold mt-0.5">{value}</p>
              <p className="text-green-200 text-xs">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reliability (Weibull) Curve */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-1">Curva de Confiabilidad — Weibull</h3>
          <p className="text-xs text-gray-500 mb-4">β={selectedEq.weibull_beta} · η={selectedEq.weibull_eta}h · {"β > 1 → Desgaste gradual"}</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weibullData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="t" label={{ value: "Tiempo (h)", position: "insideBottom", fontSize: 11 }} tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <defs>
                <linearGradient id="reliabilityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="R" name="Confiabilidad (%)" stroke="#2E7D32" fill="url(#reliabilityGrad)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Failure Rate */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-1">Tasa de Fallo — Función h(t)</h3>
          <p className="text-xs text-gray-500 mb-4">β={selectedEq.weibull_beta} → {selectedEq.weibull_beta > 1 ? "Falla por envejecimiento (wear-out)" : "Falla aleatoria"}</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weibullData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="t" tick={{ fontSize: 10 }} label={{ value: "Tiempo (h)", position: "insideBottom", fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="hazard" name="Tasa de Fallo h(t)" stroke="#EF4444" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Failure History */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Historial de Fallos YTD ({selectedEq.failures_ytd} eventos)</h3>
          <div className="space-y-2">
            {failureHistory.map((fail) => (
              <div key={fail.failure} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
                <span className="w-6 h-6 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-xs font-bold">{fail.failure}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-700">Falla #{fail.failure}</span>
                    <span className="text-xs text-gray-500">TTF: {fail.time}h</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-red-400" style={{ width: `${(fail.repair_time / 50) * 100}%` }} />
                    </div>
                    <span className="text-xs text-gray-500">Reparación: {fail.repair_time}h</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Equipment Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Resumen Flota — KPIs Confiabilidad</h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200">
                {["Equipo", "MTBF", "MTTR", "Disp.", "OEE", "Fallas YTD", "Tendencia"].map(h => (
                  <th key={h} className="text-left pb-2 font-semibold text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {RELIABILITY_KPIs.map(kpi => (
                <tr key={kpi.equipment_tag} className={`${selectedEq.equipment_tag === kpi.equipment_tag ? "bg-green-50" : "hover:bg-gray-50"} cursor-pointer`} onClick={() => setSelectedEq(kpi)}>
                  <td className="py-2 font-semibold text-gray-700">{kpi.equipment_tag.split("-").slice(1).join("-")}</td>
                  <td className="py-2 font-medium text-green-700">{kpi.mtbf}h</td>
                  <td className="py-2 font-medium text-red-600">{kpi.mttr}h</td>
                  <td className="py-2 font-medium text-blue-700">{kpi.availability}%</td>
                  <td className="py-2 font-medium text-purple-700">{kpi.oee}%</td>
                  <td className="py-2 text-center">
                    <span className={`font-bold ${kpi.failures_ytd >= 5 ? "text-red-600" : kpi.failures_ytd >= 3 ? "text-amber-600" : "text-green-600"}`}>{kpi.failures_ytd}</span>
                  </td>
                  <td className="py-2">
                    <span className={`font-medium ${kpi.trend === "IMPROVING" ? "text-green-600" : kpi.trend === "WORSENING" ? "text-red-600" : "text-gray-500"}`}>
                      {kpi.trend === "IMPROVING" ? "▲" : kpi.trend === "WORSENING" ? "▼" : "→"} {kpi.trend}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
