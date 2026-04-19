import { useState } from "react";
import { FMEA_RECORDS, EQUIPMENT_LIST, statusColor } from "../data/mockData";
import { Plus, Edit, AlertTriangle } from "lucide-react";

const riskLevel = (rpn: number) => {
  if (rpn >= 150) return { label: "ALTO", color: "bg-red-100 text-red-700" };
  if (rpn >= 100) return { label: "MEDIO", color: "bg-amber-100 text-amber-700" };
  return { label: "BAJO", color: "bg-green-100 text-green-700" };
};

export function FMEAPage() {
  const [selected, setSelected] = useState<any>(null);
  const [filterEq, setFilterEq] = useState("Todos");

  const equipments = ["Todos", ...new Set(FMEA_RECORDS.map(f => f.equipment_tag))];
  const filtered = filterEq === "Todos" ? FMEA_RECORDS : FMEA_RECORDS.filter(f => f.equipment_tag === filterEq);
  const totalRPN = filtered.reduce((a, b) => a + b.rpn, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">🔬 FMEA — Análisis de Modos de Fallo</h1>
          <p className="text-sm text-gray-500">Failure Mode and Effects Analysis · {FMEA_RECORDS.length} registros</p>
        </div>
        <button className="flex items-center gap-2 bg-[#2E7D32] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#1B5E20] transition-all">
          <Plus size={16} /> Nuevo FMEA
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Registros FMEA", value: FMEA_RECORDS.length, color: "text-blue-700 bg-blue-50" },
          { label: "RPN Alto (≥150)", value: FMEA_RECORDS.filter(f => f.rpn >= 150).length, color: "text-red-700 bg-red-50" },
          { label: "RPN Máximo", value: Math.max(...FMEA_RECORDS.map(f => f.rpn)), color: "text-amber-700 bg-amber-50" },
          { label: "Tareas CBM", value: FMEA_RECORDS.filter(f => f.task_type === "CBM").length, color: "text-green-700 bg-green-50" },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-xl border border-gray-200 p-4 ${color}`}>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-2 items-center">
        <span className="text-xs font-semibold text-gray-500 uppercase">Filtrar por equipo:</span>
        {equipments.map(eq => (
          <button key={eq} onClick={() => setFilterEq(eq)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterEq === eq ? "bg-[#2E7D32] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {eq}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-xs min-w-[900px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {["ID", "Equipo", "Función / Fallo Funcional", "Modo de Fallo", "Efecto (Sistema)", "S", "O", "D", "RPN", "Riesgo", "Tarea", "Estado"].map(h => (
                <th key={h} className="text-left px-3 py-2.5 font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((fmea) => {
              const risk = riskLevel(fmea.rpn);
              return (
                <tr key={fmea.id} className={`hover:bg-gray-50 cursor-pointer transition-colors ${selected?.id === fmea.id ? "bg-green-50" : ""}`} onClick={() => setSelected(fmea)}>
                  <td className="px-3 py-2.5 font-mono text-gray-500">{fmea.id}</td>
                  <td className="px-3 py-2.5">
                    <p className="font-semibold text-gray-800">{fmea.equipment_tag}</p>
                    <p className="text-gray-400 truncate max-w-[100px]">{fmea.equipment_name}</p>
                  </td>
                  <td className="px-3 py-2.5 max-w-[140px]">
                    <p className="text-gray-700 truncate">{fmea.function.slice(0, 35)}...</p>
                    <p className="text-red-600 truncate">{fmea.functional_failure.slice(0, 30)}...</p>
                  </td>
                  <td className="px-3 py-2.5 max-w-[120px]">
                    <span className="text-gray-700">{fmea.failure_mode}</span>
                  </td>
                  <td className="px-3 py-2.5 max-w-[140px] text-gray-600 truncate">{fmea.failure_effect_system.slice(0, 40)}...</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`font-bold ${fmea.severity >= 8 ? "text-red-600" : fmea.severity >= 5 ? "text-amber-600" : "text-green-600"}`}>{fmea.severity}</span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`font-bold ${fmea.occurrence >= 6 ? "text-red-600" : fmea.occurrence >= 4 ? "text-amber-600" : "text-green-600"}`}>{fmea.occurrence}</span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`font-bold ${fmea.detectability >= 5 ? "text-red-600" : fmea.detectability >= 3 ? "text-amber-600" : "text-green-600"}`}>{fmea.detectability}</span>
                  </td>
                  <td className="px-3 py-2.5 text-center font-bold text-gray-900">{fmea.rpn}</td>
                  <td className="px-3 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full font-semibold ${risk.color}`}>{risk.label}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full font-semibold ${fmea.task_type === "CBM" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>{fmea.task_type}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full font-semibold ${statusColor(fmea.status)}`}>{fmea.status}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail Panel */}
      {selected && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Detalle: {selected.id}</h3>
            <button onClick={() => setSelected(null)} className="text-xs text-gray-400 hover:text-gray-600">✕ Cerrar</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Función del Equipo</p>
                <p className="text-sm text-gray-800 mt-1">{selected.function}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Fallo Funcional</p>
                <p className="text-sm text-red-700 mt-1">{selected.functional_failure}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Modo de Fallo</p>
                <p className="text-sm text-gray-800 mt-1">{selected.failure_mode}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Efectos del Fallo</p>
                <p className="text-sm text-gray-600 mt-1"><strong>Local:</strong> {selected.failure_effect_local}</p>
                <p className="text-sm text-gray-600 mt-0.5"><strong>Sistema:</strong> {selected.failure_effect_system}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Scores RPN</p>
                <div className="flex gap-4 mt-2">
                  {[
                    { label: "Severidad", value: selected.severity, color: "text-red-600" },
                    { label: "Ocurrencia", value: selected.occurrence, color: "text-amber-600" },
                    { label: "Detección", value: selected.detectability, color: "text-blue-600" },
                    { label: "RPN Total", value: selected.rpn, color: "text-gray-900" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="text-center">
                      <p className={`text-2xl font-bold ${color}`}>{value}</p>
                      <p className="text-xs text-gray-500">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Controles Actuales</p>
                <p className="text-sm text-gray-700 mt-1">{selected.current_controls}</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-green-800 uppercase">Acción Recomendada</p>
                <p className="text-sm text-green-700 mt-1">{selected.recommended_action}</p>
              </div>
              <div className="flex gap-3">
                <div className="flex-1 bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Tipo de Tarea</p>
                  <p className="font-bold text-gray-800">{selected.task_type}</p>
                </div>
                <div className="flex-1 bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Frecuencia</p>
                  <p className="font-bold text-gray-800">{selected.frequency}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
